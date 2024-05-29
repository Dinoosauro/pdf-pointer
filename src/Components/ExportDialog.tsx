import { useRef } from "react";
import Lang from "../Scripts/LanguageTranslations";
import ImageExport from "../Scripts/Export";
import * as PDFJS from "pdfjs-dist";

interface Props {
    pdfObj?: PDFJS.PDFDocumentProxy,
    imgObj?: HTMLImageElement
}
/**
 * Export the PDF as a group of images. This ReactNode contains the options for that exportation process.
 * @param pdfObj the PDF object that'll be used for exporting things
 * @param imgObj the image where the annotations (or filters) will be drawn
 * @returns the Export dialog ReactNode
 */
export default function ExportDialog({ pdfObj, imgObj }: Props) {
    let exportButton = useRef<HTMLButtonElement>(null);
    /**
    * The custom values for the PDF exportation as image
    */
    let exportValue = useRef({
        img: "png",
        pages: "",
        annotations: true,
        scale: 2,
        zip: false,
        quality: 0.85,
        filter: ""
    })
    return <div>
        <label>{Lang("Export image in the")} <select defaultValue={exportValue.current.img} onChange={(e) => exportValue.current.img = (e.target as HTMLSelectElement).value}>
            <option value={"jpeg"}>JPG</option>
            <option value={"png"}>PNG</option>
            {document.createElement("canvas").toDataURL("image/webp").startsWith("data:image/webp") && <option value={"webp"}>WEBP</option>}
        </select> {Lang("format")}</label><br></br><br></br>
        {pdfObj && <>
            <label>{Lang("Write the number of pages to export:")}</label><br></br>
            <i style={{ fontSize: "0.75em" }}>{Lang(`Separate pages with a comma, or add multiple pages with a dash: "1-5,7"`)}</i><br></br>
            <input style={{ marginTop: "10px" }} type="text" defaultValue={exportValue.current.pages} onInput={(e) => {
                exportValue.current.pages = (e.target as HTMLInputElement).value;
                if (exportButton.current) exportButton.current.disabled = !/^[0-9,-]*$/.test(exportValue.current.pages);
            }}></input><br></br><br></br></>}
        <label>{Lang("Choose the size of the output image:")}</label><br></br>
        <input type="range" min={0.5} max={8} step={0.01} defaultValue={exportValue.current.scale} onChange={(e) => { exportValue.current.scale = parseFloat((e.target as HTMLInputElement).value) }}></input><br></br><br></br>
        <label>{Lang("Choose the quality of the output image:")}</label><br></br>
        <input type="range" min={0.01} max={1} step={0.01} defaultValue={exportValue.current.quality} onChange={(e) => { exportValue.current.quality = parseFloat((e.target as HTMLInputElement).value) }}></input><br></br><br></br>
        <div style={{ display: "flex", alignItems: "center" }}>
            <input type="checkbox" defaultChecked={exportValue.current.annotations} onChange={e => exportValue.current.annotations = (e.target as HTMLInputElement).checked}></input><label>{Lang("Export also annotations")}</label></div><br></br>
        {document.createElement("canvas").getContext("2d")?.filter !== undefined && <><div style={{ display: "flex", alignItems: "center" }}>
            <input type="checkbox" defaultChecked={exportValue.current.filter !== ""} onChange={e => {
                let getFilterCanvas = Array.from(document.querySelectorAll("canvas")).filter(e => e.style.filter !== "");
                if ((e.target as HTMLInputElement).checked && getFilterCanvas.length !== 0) { exportValue.current.filter = getFilterCanvas[0].style.filter; } else exportValue.current.filter = ""
            }}></input><label>{Lang("Apply filters to exported image")}</label></div><br></br>
        </>}
        <div style={{ display: "flex", alignItems: "center" }}>
            <input type="checkbox" defaultChecked={exportValue.current.zip} onChange={e => exportValue.current.zip = (e.target as HTMLInputElement).checked}></input><label>{Lang("Save output as a .zip file")}</label></div><br></br><br></br>
        <button ref={exportButton} onClick={async () => {
            let handle;
            try { // If the user doesn't want to save the file as ZIP, and the File System API is supported, use the "showDirectoryPicker" method
                handle = (exportValue.current.pages.indexOf("-") !== -1 || exportValue.current.pages.indexOf(",") !== -1) ? window.showDirectoryPicker !== undefined && !exportValue.current.zip ? await window.showDirectoryPicker({ mode: "readwrite", id: "PDFPointer-PDFExportFolder" }) : undefined : window.showSaveFilePicker !== undefined && !exportValue.current.zip ? await window.showSaveFilePicker({ id: "PDFPointer-PDFExportFolder", types: [{ "description": "The selected image", accept: { [`image/${exportValue.current.img}`]: [`.${exportValue.current.img === "jpeg" ? "jpg" : exportValue.current.img}`] } }] }) : undefined; // If there are no "," or "-" the item to download is only an image, therefore try to use the File System API for a single file. Otherwise, try to use the File System API for folders
            } catch (ex) {
                console.warn({
                    type: "RejectedPicker",
                    desc: "The user rejected the selection of a folder. Fallback to link downloads.",
                    gravity: 0,
                    ex: ex
                })
            }
            ImageExport({ imgType: exportValue.current.img, pages: exportValue.current.pages, getAnnotations: exportValue.current.annotations, pdfObj: pdfObj, scale: exportValue.current.scale, useZip: exportValue.current.zip, quality: exportValue.current.quality, handle: handle, filter: exportValue.current.filter, imgObj: imgObj })
        }}>{Lang("Export image(s)")}</button>
    </div>
}