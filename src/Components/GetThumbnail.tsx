import * as PDFJS from "pdfjs-dist";
import { useEffect, useRef, useState } from "react";
import ThumbnailContainer from "./ThumbnailContainer";
import { DynamicImg } from "./DynamicImg";
import { PdfUIState } from "../Interfaces/CustomOptions";
import RerenderButtons from "../Scripts/RerenderButtons";
interface Props {
    PDFObj: PDFJS.PDFDocumentProxy, // The PDF Object from PDF.JS library
    PDFState: React.Dispatch<React.SetStateAction<PdfUIState>>
}
interface CanvasContainer {
    dom: HTMLCanvasElement | null,
    page: number,
    viewport?: { height: number, width: number },
}

/**
 * Render all the PDF pages for the thumbnail
 * @param PDFObj the PDF.JS object
 * @param PDFState the callback to update the PDF UI
 * @returns the main thumbnail ReactNode
 */
export default function Thumbnail({ PDFObj, PDFState }: Props) {
    let [pages, updatePages] = useState({
        current: 0, // The next thumbnail to render
        nextSuggested: true // If it's time to render more pages (–> if the user has scrolled a lot of the div)
    });
    let canvasContainer = useRef<CanvasContainer[]>([]);
    console.log(PDFState);
    useEffect(() => {
        if (!pages.nextSuggested) return; // Nothing more to render
        (async () => {
            updatePages(prevState => { return { ...prevState, nextSuggested: false } }); // Immediately stop re-renders when moving the page
            for (let i = pages.current; i < (PDFObj.numPages > pages.current + 5 ? pages.current + 5 : PDFObj.numPages); i++) { // i is the number of the page (- 1, since pages start with 1). The next 5 pages, or the remaining ones, will be re-rendered
                if (canvasContainer.current.findIndex(e => e.page === i) !== -1) continue; // The page has already been rendered. Don't re-render it.
                canvasContainer.current.push({ dom: null, page: i }); // Create a placeholder in the canvasContainer array, so that it's certain that the page will be rendered only one time
                // Create a canvas with the PDF image
                const page = await PDFObj.getPage(i + 1);
                const viewport = page.getViewport({ scale: 0.5 });
                // @ts-ignore
                canvasContainer.current.find(e => e.page === i).viewport = viewport;
                const outputScale = window.devicePixelRatio || 1;
                const canvas = document.createElement("canvas");
                canvas.classList.add("simplePointer"); // Cursor: pointer event when hovered
                canvas.width = Math.floor(viewport.width * outputScale);
                canvas.height = Math.floor(viewport.height * outputScale);
                canvas.style.width = `${document.documentElement.offsetWidth * 25 / 100}px`;
                canvas.style.height = `${viewport.height * (document.documentElement.offsetWidth * 25 / 100) / viewport.width}px`;
                canvas.onclick = () => { // Move to the clicked page, and close the thumbnail viewer
                    RerenderButtons.update("thumbnail", false);
                    PDFState(prevState => { return { ...prevState, page: i + 1 } });
                }
                let ctx = canvas.getContext("2d");
                if (ctx !== null) {
                    let render = page.render({
                        canvasContext: ctx,
                        viewport: viewport,
                        transform: outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined
                    });
                    await render.promise;
                    // @ts-ignore
                    canvasContainer.current.find(e => e.page === i).dom = canvas; // Update the value of the canvasContainer with the linked canvas;
                    updatePages({ current: i + 1, nextSuggested: false }); // Remember the next page to render
                }
            }
        })()
    }, [pages.nextSuggested])
    useEffect(() => {
        window.addEventListener("resize", () => { // When resizing the window, also these canvas must be resized. The width is always 25vw, while the height is calculated with a proportion.
            for (let item of canvasContainer.current) {
                if (item.dom && item.viewport) {
                    item.dom.style.width = `${document.documentElement.offsetWidth * 25 / 100}px`;
                    item.dom.style.height = `${item.viewport.height * (document.documentElement.offsetWidth * 25 / 100) / item.viewport.width}px`;

                }
            }
        })
    }, [])
    return <div className="thumbnailContainer normalLeftAnimation" onScroll={(e) => {
        let container = e.target as HTMLDivElement;
        let percentage = Math.round((container.scrollTop / (container.scrollHeight - container.offsetHeight)) * 100); // Get the percentage of scroll
        if (percentage > 80) updatePages(prevState => { return { ...prevState, nextSuggested: true } })
    }}>
        <div onMouseOver={() => console.log("A")} style={{ position: "sticky", top: "15px", left: "25px", padding: "10px", backgroundColor: "var(--firststruct)", borderRadius: "8px", width: "24px", height: "24px" }} className="simplePointer" onClick={() => {
            RerenderButtons.update("thumbnail", false);
            PDFState(prevState => { return { ...prevState, showThumbnail: 2 } })
        }}>
            <div style={{ height: "24px", width: "24px" }}><DynamicImg id="minimize" width={24}></DynamicImg></div>
        </div>
        {canvasContainer.current.filter(e => e.dom !== null).map(e => <ThumbnailContainer key={`PDFPageThumbnail-${e.page}`} pageNumber={e.page + 1} canvas={e.dom}></ThumbnailContainer>)}
    </div >
}