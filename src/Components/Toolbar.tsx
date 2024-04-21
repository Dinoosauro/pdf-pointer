import { useEffect, useRef, useState } from "react";
import Card from "./Card";
import CircularButton from "./CircularButton";
import DropdownItem from "./DropdownItem";
import IntelliSelect from "./SelectIntelligentOption";
import { DrawingStoredOptions, OptionUpdater } from "../Interfaces/CustomOptions";
import ImageExport from "../Scripts/Export";
import * as PDFJS from "pdfjs-dist";
import CustomCallback from "./CustomCallback";
import { createRoot } from "react-dom/client";
import Settings from "./Settings";
import Lang from "../Scripts/LanguageTranslations";
interface Props {
    pageSettings: any,
    updatePage: ({ }: any) => void,
    canvasAdaptWhenClicked: () => void,
    settingsCallback?: (e: OptionUpdater) => void,
    pdfObj: PDFJS.PDFDocumentProxy,
}
/**
 * The custom values for the PDF exportation as image
 */
let exportValue = {
    img: "png",
    pages: "",
    annotations: true,
    scale: 2,
    zip: false,
    quality: 0.85,
    filter: ""
}
interface DirectoryPicker {
    id?: string,
    mode?: string
}

declare global {
    interface Window {
        showDirectoryPicker: ({ id, mode }: DirectoryPicker) => Promise<FileSystemDirectoryHandle>
    }
}
/**
 * 
 * @param pageSettings the same values as the "useState" of PdfUI
 * @param updatePage the function to update the "useState" of PdfUI
 * @param canvasAdaptWhenClicked a function used to adapt canvas width/height when clicked
 * @param settingsCallback send a message back to the function, used when the user changes a value from the toolbar,
 * @param pdfObj the PDF document
 * @returns 
 */
export default function Toolbar({ pageSettings, updatePage, canvasAdaptWhenClicked, settingsCallback, pdfObj }: Props) {
    let [CardShown, UpdateState] = useState("hello");
    const usefulBtn = { // NOTE: Always add the key attribute. Otherwise React, when exiting from the custom Card mode, will trigger the animation on the first element, causing UI issues.
        pen: <CircularButton key={"KeyPenBtn"} hint={Lang("Show pen settings and enable annotations")} dropdown="pen" enabledSwitch={true} imgId="pen" click={canvasAdaptWhenClicked} dropdownCallback={() => { if (settingsCallback) settingsCallback({ interface: "ChangedPenStatus", value: "" }); UpdateState(CardShown === "pen" ? "hello" : "pen") }}></CircularButton>,
        circle: <CircularButton key={"KeyCircleBtn"} hint={Lang("Show cursor settings")} imgId="circle" enabledSwitch={true} dropdownCallback={() => UpdateState(CardShown === "circle" ? "hello" : "circle")}></CircularButton>,
        eraser: <CircularButton key={"KeyEraseBtn"} imgId="eraser" hint={Lang("Erase annotations from the PDF")} disableOpacity={true} enabledSwitch={true} click={() => { if (settingsCallback) settingsCallback({ interface: "EraserChanged", value: "" }) }}></CircularButton>,
        text: <CircularButton key={"KeyTextBtn"} imgId="text" hint={Lang("Add text annotations to the PDF")} enabledSwitch={true} dropdownCallback={() => { if (settingsCallback) settingsCallback({ interface: "ChangedTextStatus", value: "" }); UpdateState(CardShown === "text" ? "hello" : "text") }}></CircularButton>
    }
    let exportButton = useRef<HTMLButtonElement>(null);
    let checkFlexDiv = useRef<HTMLDivElement>(null);
    /**
     * Make sure no buttons are lost due to the div being justified in the center
     */
    function fixToolbarContentJustification() {
        if (checkFlexDiv.current && checkFlexDiv.current.getAttribute("data-autojustify") === "a") checkFlexDiv.current.style.justifyContent = checkFlexDiv.current.scrollWidth - checkFlexDiv.current.getBoundingClientRect().width > -3 && checkFlexDiv.current.scrollWidth - checkFlexDiv.current.getBoundingClientRect().width < 3 ? "center" : "left"; // Add a 3px tollerance for WebKit, since one of the two values might be a pixel greater than the other
    }
    useEffect(() => fixToolbarContentJustification());
    useEffect(() => window.addEventListener("resize", () => fixToolbarContentJustification()), [])
    let generateColorValues = () => [{ name: "Green", value: "rgb(0,255,0)" }, { name: "Blue", value: "rgb(0,0,255)" }, { name: "Red", value: "rgb(255,0,0)" }, { name: "Accent color", value: getComputedStyle(document.body).getPropertyValue("--accent") }, ...JSON.parse(localStorage.getItem(`PDFPointer-CustomColor`) ?? "[]")]; // Make it a function so that the accent color is refreshed every time.
    return <div style={{ marginTop: "10px", margin: "0px 20px" }}>
        <Card type={1} zIndex={999991}>
            <div ref={checkFlexDiv} data-autojustify={CardShown === "hello" ? "a" : "b"} className="toolbar" style={{ justifyContent: CardShown === "hello" ? "center" : "left" }}>
                {CardShown === "pen" || CardShown === "text" ? <>
                    {usefulBtn[CardShown === "pen" ? "pen" : "text"]}
                    <DropdownItem title={Lang("Erase annotations after:")} custom={<CustomCallback type="number" identifier="CustomSelectTimer" callback={settingsCallback} placeholder={Lang("Custom value (in seconds)")}></CustomCallback>} content={<IntelliSelect select={settingsCallback} pre={[{ name: `5 ${Lang("seconds")}`, value: "5" }, { name: `10 ${Lang("seconds")}`, value: "10" }, { name: `15 ${Lang("seconds")}`, value: "15" }, { name: `30 ${Lang("seconds")}`, value: "30" }, { name: `1 ${Lang("minute")}`, value: "60" }]} identifier="CustomSelectTimer"></IntelliSelect>}>
                        <CircularButton hint={Lang("Erase annotation timer")} imgId="timer"></CircularButton>
                    </DropdownItem>
                    <DropdownItem defaultValueRef="size" title={Lang("Pen size:")} content={<><input type="range" defaultValue={CardShown === "pen" ? 5 : 25} min={1} max={CardShown === "pen" ? 99 : 299} onChange={(e) => { if (settingsCallback) settingsCallback({ interface: `Custom${CardShown === "pen" ? "Select" : "Text"}Size`, value: e.currentTarget.value }) }}></input></>}>
                        <CircularButton hint={Lang("Change pen size")} imgId="size"></CircularButton>
                    </DropdownItem>
                    {CardShown === "pen" && <>
                        <DropdownItem title={Lang("Pen opacity:")} defaultValueRef="penOpacity" content={<><input type="range" defaultValue={1} min={0.01} max={1} step={0.01} onChange={(e) => { if (settingsCallback) settingsCallback({ interface: `ChangePenOpacity`, value: (e.target as HTMLInputElement).value }) }}></input></>}>
                            <CircularButton hint={Lang("Change pen opacity")} imgId="slidehide"></CircularButton>
                        </DropdownItem>
                    </>}
                    <DropdownItem custom={<CustomCallback callback={settingsCallback} type="color" identifier="CustomPenColorSelect"></CustomCallback>} title={Lang("Pen color:")} content={<IntelliSelect select={settingsCallback} identifier="CustomPenColorSelect" pre={generateColorValues()}></IntelliSelect>}>
                        <CircularButton hint={Lang("Change pen color")} imgId="bucket"></CircularButton>
                    </DropdownItem>
                    {CardShown === "text" && <>
                        <DropdownItem disableAutoDisappear={true} defaultValueRef="textFont" title={Lang("Change text font:")} content={<input defaultValue={""} type="text" placeholder="Work Sans" onInput={(e) => { if (settingsCallback) settingsCallback({ interface: "TextFontUpdater", value: (e.target as HTMLInputElement).value }) }}></input>}><CircularButton marginLeft={15} imgId="textfont"></CircularButton></DropdownItem>
                        <CircularButton hint={Lang("Make text bold")} enabledSwitch={true} disableOpacity={true} imgId="textbold" click={() => { if (settingsCallback) settingsCallback({ interface: "TextBoldChanged", value: "" }) }}></CircularButton>
                        <CircularButton hint={Lang("Make text italic")} enabledSwitch={true} disableOpacity={true} imgId="textitalic" click={() => { if (settingsCallback) settingsCallback({ interface: "TextItalicChanged", value: "" }) }}></CircularButton>
                        <CircularButton hint={Lang("Make text underlined")} enabledSwitch={true} disableOpacity={true} imgId="textunderline" click={() => { if (settingsCallback) settingsCallback({ interface: "TextUnderlineChanged", value: "" }) }}></CircularButton>
                        <CircularButton hint={Lang("Make text striked")} marginRight={15} enabledSwitch={true} disableOpacity={true} imgId="textstrikethrough" click={() => { if (settingsCallback) settingsCallback({ interface: "TextStrikeChanged", value: "" }) }}></CircularButton>
                        <DropdownItem title={Lang("Underlined/Striked line height:")} defaultValueRef="textStrikeLineWidth" content={<input type="range" min={1} max={99} defaultValue={4} step={1} onChange={(e) => { if (settingsCallback) settingsCallback({ interface: "TextStrikeLineChange", value: (e.target as HTMLInputElement).value }) }}></input>}>
                            <CircularButton hint={Lang("Change the line height for underlined/striked text")} imgId="linethickness"></CircularButton>
                        </DropdownItem>

                        <DropdownItem title={Lang("Text line spacing:")} defaultValueRef="textLineSpace" content={<input type="range" min={0.1} max={4} defaultValue={1.2} step={0.1} onChange={(e) => { if (settingsCallback) settingsCallback({ interface: "TextLineSpaceChanged", value: (e.target as HTMLInputElement).value }) }}></input>}>
                            <CircularButton hint={Lang("Change text line space")} imgId="linespace"></CircularButton>
                        </DropdownItem>
                    </>}
                    {usefulBtn.eraser}
                </> : CardShown === "circle" ? <>
                    {usefulBtn.circle}
                    <DropdownItem custom={<CustomCallback type="color" identifier="CustomCursorColorSelect" callback={settingsCallback}></CustomCallback>} title={Lang("Choose cursor color:")} content={<IntelliSelect select={settingsCallback} identifier="CustomCursorColorSelect" pre={generateColorValues()}></IntelliSelect>}>
                        <CircularButton hint={Lang("Change cursor color")} imgId="bucket"></CircularButton>
                    </DropdownItem>
                    <DropdownItem title={Lang("Choose cursor size:")} defaultValueRef="cursorSize" content={<input type="range" defaultValue={40} max={200} min={1} onChange={(e) => { if (settingsCallback) settingsCallback({ interface: "CustomCursorSize", value: e.currentTarget.value }) }}></input>}>
                        <CircularButton hint={Lang("Change cursor size")} imgId="size"></CircularButton>
                    </DropdownItem>
                </> : <>
                    <CircularButton hint={Lang("Previous page")} imgId="prev" click={() => { if (pageSettings.page !== 1) updatePage({ ...pageSettings, page: pageSettings.page - 1 }) }}></CircularButton>
                    <CircularButton hint={Lang("Reduce zoom")} marginRight={30} imgId="zoomout" click={() => { updatePage({ ...pageSettings, scale: pageSettings.scale -= 0.2 }) }}></CircularButton>
                    <CircularButton hint={Lang("Show page(s) preview")} imgId="numbersquare" dataTest="ThumbnailEnabler" enabledSwitch={true} disableOpacity={true} click={() => { updatePage({ ...pageSettings, showThumbnail: pageSettings.showThumbnail !== 1 ? 1 : 2 }) }}></CircularButton>
                    {usefulBtn.pen}
                    {usefulBtn.circle}
                    {usefulBtn.eraser}
                    {usefulBtn.text}
                    <CircularButton hint={`${document.fullscreenElement ? "Exit from" : "Go in"} fullscreen mode`} imgId={document.fullscreenElement ? "fullscreenminimize" : "fullscreenmaximize"} click={() => { document.fullscreenElement ? document.exitFullscreen() : document.querySelector(".card")?.requestFullscreen() }}></CircularButton>
                    <DropdownItem title={Lang("PDF Filters:")} content={<>
                        <h4>{Lang("Negative filter:")}</h4>
                        <input data-tempstorage="negativeFilter" type="range" min={0} max={1} defaultValue={0} step={0.01} onChange={(e) => { if (settingsCallback) settingsCallback({ interface: "NegativeFilter", value: (e.target as HTMLInputElement).value }) }}></input>
                        <h4>{Lang("Hue inversion:")}</h4>
                        <input data-tempstorage="hueInversionFilter" type="range" min={-180} max={180} defaultValue={0} onChange={(e) => { if (settingsCallback) settingsCallback({ interface: "HueInversionFilter", value: (e.target as HTMLInputElement).value }) }}></input>
                        <h4>{Lang("Sepia filter:")}</h4>
                        <input data-tempstorage="sepiaFilter" type="range" min={0} max={1} step={0.01} defaultValue={0} onChange={(e) => { if (settingsCallback) settingsCallback({ interface: "SepiaFilter", value: (e.target as HTMLInputElement).value }) }}></input>
                        <h4>{Lang("Grayscale filter:")}</h4>
                        <input data-tempstorage="grayscaleFilter" type="range" min={0} max={1} defaultValue={0} step={0.01} onChange={(e) => { if (settingsCallback) settingsCallback({ interface: "GrayscaleFilter", value: (e.target as HTMLInputElement).value }) }}></input>
                    </>}>
                        <CircularButton hint={Lang("Add a filter to the PDF")} imgId="photofilter"></CircularButton>
                    </DropdownItem>
                    <DropdownItem disableAutoDisappear={true} content={<div>
                        <label>{Lang("Export image in the")} <select defaultValue={exportValue.img} onChange={(e) => exportValue.img = (e.target as HTMLSelectElement).value}>
                            <option value={"jpeg"}>JPG</option>
                            <option value={"png"}>PNG</option>
                            {document.createElement("canvas").toDataURL("image/webp").startsWith("data:image/webp") && <option value={"webp"}>WEBP</option>}
                        </select> {Lang("format")}</label><br></br><br></br>
                        <label>{Lang("Write the number of pages to export:")}</label><br></br>
                        <i style={{ fontSize: "0.75em" }}>{Lang(`Separate pages with a comma, or add multiple pages with a dash: "1-5,7"`)}</i><br></br>
                        <input style={{ marginTop: "10px" }} type="text" defaultValue={exportValue.pages} onInput={(e) => {
                            exportValue.pages = (e.target as HTMLInputElement).value;
                            if (exportButton.current) exportButton.current.disabled = !/^[0-9,-]*$/.test(exportValue.pages);
                        }}></input><br></br><br></br>
                        <label>{Lang("Choose the size of the output image:")}</label><br></br>
                        <input type="range" min={0.5} max={8} step={0.01} defaultValue={exportValue.scale} onChange={(e) => { exportValue.scale = parseFloat((e.target as HTMLInputElement).value) }}></input><br></br><br></br>
                        <label>{Lang("Choose the quality of the output image:")}</label><br></br>
                        <input type="range" min={0.01} max={1} step={0.01} defaultValue={exportValue.quality} onChange={(e) => { exportValue.quality = parseFloat((e.target as HTMLInputElement).value) }}></input><br></br><br></br>
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <input type="checkbox" defaultChecked={exportValue.annotations} onChange={e => exportValue.annotations = (e.target as HTMLInputElement).checked}></input><label>{Lang("Export also annotations")}</label></div><br></br>
                        {document.createElement("canvas").getContext("2d")?.filter !== undefined && <><div style={{ display: "flex", alignItems: "center" }}>
                            <input type="checkbox" defaultChecked={exportValue.filter !== ""} onChange={e => {
                                let getFilterCanvas = Array.from(document.querySelectorAll("canvas")).filter(e => e.style.filter !== "");
                                if ((e.target as HTMLInputElement).checked && getFilterCanvas.length !== 0) { exportValue.filter = getFilterCanvas[0].style.filter; } else exportValue.filter = ""
                            }}></input><label>{Lang("Apply filters to exported image")}</label></div><br></br>
                        </>}
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <input type="checkbox" defaultChecked={exportValue.zip} onChange={e => exportValue.zip = (e.target as HTMLInputElement).checked}></input><label>{Lang("Save output as a .zip file")}</label></div><br></br><br></br>
                        <button ref={exportButton} onClick={async () => {
                            let handle;
                            try { // If the user doesn't want to save the file as ZIP, and the File System API is supported, use the "showDirectoryPicker" method
                                handle = window.showDirectoryPicker !== undefined && !exportValue.zip ? await window.showDirectoryPicker({ mode: "readwrite" }) : undefined;
                            } catch (ex) {
                                console.warn({
                                    type: "RejectedPicker",
                                    desc: "The user rejected the selection of a folder. Fallback to link downloads.",
                                    gravity: 0,
                                    ex: ex
                                })
                            }
                            ImageExport({ imgType: exportValue.img, pages: exportValue.pages, getAnnotations: exportValue.annotations, pdfObj: pdfObj, scale: exportValue.scale, useZip: exportValue.zip, quality: exportValue.quality, handle: handle, filter: exportValue.filter })
                        }}>{Lang("Export images")}</button>
                    </div>} title={Lang("Export as Image")}>
                        <CircularButton hint={Lang("Save PDF as an image")} imgId="saveimg"></CircularButton>
                    </DropdownItem>
                    <CircularButton hint={Lang("Show settings")} imgId="settings" click={() => { // Show the settings by creating a new root
                        let div = document.createElement("div");
                        createRoot(div).render(<Settings updateLang={() => updatePage({ ...pageSettings, langUpdate: pageSettings.langUpdate + 1 })}></Settings>); // With the "updatePage" parameter, all of the PdfUI is re-rendered, and thererfore the language change is applied.
                        document.body.append(div);
                    }}></CircularButton>
                    <CircularButton hint={Lang("Increase zoom")} marginLeft={30} imgId="zoomin" click={() => { updatePage({ ...pageSettings, scale: pageSettings.scale += 0.2 }) }}></CircularButton>
                    <CircularButton hint={Lang("Next page")} imgId="next" click={() => { if (pdfObj.numPages > pageSettings.page) updatePage({ ...pageSettings, page: pageSettings.page + 1 }) }}></CircularButton>
                </>
                }
            </div>
        </Card >
    </div>
}