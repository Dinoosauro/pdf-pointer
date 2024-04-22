import * as PDFJS from "pdfjs-dist";
import Annotations from "./Annotations";
import JSZip, { filter } from "jszip";
import createAlert from "./AlertManager";
import Lang from "./LanguageTranslations";
interface Props {
    imgType: string,
    pages: string,
    getAnnotations: boolean,
    pdfObj: PDFJS.PDFDocumentProxy,
    scale: number,
    useZip: boolean,
    quality: number,
    handle?: FileSystemDirectoryHandle,
    filter: string
}
/**
 * Export the PDF as image file(s)
 * @param imgType The format to export the image ("jpg", "png", "WebP"),
 * @param pages A string that contains the pages that should be exported. Pages linked with a dash include the pages in the middle (es: 1-5 => 1,2,3,4,5). Pages linked with a comma will exclude pages in the middle (ex: 1,4,6 => 1, 4, 6),
 * @param getAnnotations Export also annotations
 * @param pdfObj The PDF object where the pages will be fetched,
 * @param scale The scale of the exported image,
 * @param useZip Save the images in a ZIP file
 * @param quality Exported image quality, for lossy formats
 * @param handle A directory handle of the File System API, so that files can be exported directly in the selected directory
 * @param filter Add a CSS filter to the exported canvas (ex: dark mode)
 */
export default async function ImageExport({ imgType, pages, getAnnotations, pdfObj, scale, useZip, quality, handle, filter }: Props) {
    /**
     * The pages that'll be exported
     */
    let elaborate: number[] = [];
    let zip = new JSZip(); // Create a new JSZip object for ZIP exportation
    for (const item of pages.split(",")) {
        if (item === "") continue; // Avoid empty values
        if (item.indexOf("-") !== -1) { // Get also the pages in the middle 
            for (let i = parseInt(item.substring(0, item.indexOf("-") + 1)); i < parseInt(item.substring(item.lastIndexOf("-") + 1)) + 1; i++) elaborate.push(i);
        } else elaborate.push(parseInt(item)); // Just push the current number
    }
    elaborate = elaborate.filter(e => !isNaN(e)); // Delete values that aren't a number
    for (const number of elaborate) { // Start exporting each page
        if (number > pdfObj.numPages || number < 1) continue; // Pages must start with 1, and obviously must not exceed the number of pages in the PDF
        createAlert.alert({ id: "ExportImageCreation", text: `${Lang("Exporting page")} ${number}...`, showSpinner: true, avoidTransition: true }) // Create an alert for warning the user of the current exportation
        // Render the canvas
        const pdfPage = await pdfObj.getPage(number);
        const outputScale = window.devicePixelRatio || 1;
        const viewport = pdfPage.getViewport({ scale: scale });
        const canvas = document.createElement("canvas");
        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        let context = canvas.getContext("2d");
        if (context !== null) {
            let render = pdfPage.render({
                canvasContext: context,
                viewport: viewport,
                transform: outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined
            });
            await render.promise;
            if (filter !== "") { // If filters are provided, create a temp canvas where the result will be cloned, the filter will be applied and then the image will be drawn in the first canvas
                const newCanvas = document.createElement("canvas");
                newCanvas.width = canvas.width;
                newCanvas.height = canvas.height;
                let newCtx = newCanvas.getContext("2d");
                if (newCtx) {
                    newCtx.filter = filter.trim();
                    newCtx.drawImage(canvas, 0, 0);
                    context.drawImage(newCanvas, 0, 0);
                }
            }
            if (getAnnotations) {
                for (const annotation of Annotations.get({ page: number })) await new Promise((resolve) => { // Draw annotations only of the current page
                    const image = new Image(); // Create an Image object so that the SVG can be drawn into a Canvas
                    image.onload = () => {
                        context?.drawImage(image, 0, 0, canvas.width, canvas.height);
                        resolve("");
                    }
                    image.onerror = (ex) => {
                        console.warn({
                            type: "SVGConversion",
                            desc: "Failed to create Image from SVG",
                            gravity: image.src.startsWith("blob") ? 0 : 1,
                            ex: ex
                        })
                        image.src.startsWith("blob") ? image.src = `data:image/svg+xml;base64,${btoa(source)}` : resolve(""); // Add fallback to Data URL for unsafe connections, since Blobs might not be supported
                    }
                    let source = annotation[0].outerHTML.replace("<svg", `<svg xmlns="http://www.w3.org/2000/svg"`); // Without xmlns attribute the browser doesn't recognize that it's a valid SVG, and the loading fails
                    if (source.indexOf("transform") !== -1) { // Delete the "transform" property from the style. Scaling of the SVG is automatically done when drawing the image in the canvas.
                        let transformGet = source.indexOf("; transform") !== -1 ? "; transform" : source.indexOf(";transform:") !== -1 ? ";transform" : "transform";
                        let getTransform = source.substring(source.indexOf(transformGet));
                        getTransform = getTransform.substring(0, getTransform.indexOf(")") + 2);
                        if (!getTransform.endsWith(";")) getTransform = getTransform.substring(0, getTransform.indexOf(")") + 1);
                        source = source.replace(getTransform, "");
                    }
                    if (source.indexOf("display") !== -1) { // Delete the display property, so that it'll be the default (block) and the annotation will be rendered (it might not if the user is in a different page than the one that is being exported)
                        let getDisplay = source.substring(source.indexOf("display"));
                        getDisplay = getDisplay.substring(0, getDisplay.indexOf(`"`));
                        if (getDisplay.indexOf(";") !== -1) getDisplay = getDisplay.substring(0, getDisplay.indexOf(";") + 1);
                        source = source.replace(getDisplay, "");
                    }
                    image.src = URL.createObjectURL(new Blob([source], { type: "image/svg+xml" }));
                    URL.revokeObjectURL(image.src);
                })
            }
            await new Promise(async (resolve) => { // Create a new Blob for the canvas
                canvas.toBlob(async (blob) => {
                    if (blob) {
                        const name = `PdfPointer-${document.title.substring(0, document.title.lastIndexOf(" - "))}-Img-${number}.${imgType === "jpeg" ? "jpg" : imgType}`; // The document title follow the syntax "{PDF Name} - PDFPointer"
                        if (useZip) { // Add the file to the zip
                            await zip.file(name, blob);
                        } else if (handle !== undefined) { // It's possible to use the File System API to create and export a new file
                            let file = await handle.getFileHandle(name, { create: true });
                            let writable = await file.createWritable();
                            await writable.write(blob);
                            await writable.close();
                        } else { // Download the file with the normal method
                            let a = document.createElement("a");
                            a.download = name;
                            a.href = URL.createObjectURL(blob);
                            a.click();
                            URL.revokeObjectURL(a.href);
                        }
                        resolve("");

                    }
                }, `image/${imgType}`, quality);
            });
        }
    }
    if (useZip) { // Create the zip file and download it
        zip.generateAsync({ type: "blob" }).then(async (blob) => {
            let a = document.createElement("a");
            a.download = "PDFPointer-Images.zip";
            a.href = URL.createObjectURL(blob);
            a.textContent = "Force download";
            a.click();
            await createAlert.alert({ text: Lang("The download of the zip file has started"), id: "ZipFileDownload", extra: a })
            URL.revokeObjectURL(a.href);
        })
    } else createAlert.alert({ text: Lang("Finished converting PDF to image"), id: "ZipFileFinished" })
}