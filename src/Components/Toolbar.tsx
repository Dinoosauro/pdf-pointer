import { SetStateAction, useEffect, useRef, useState } from "react";
import Card from "./Card";
import CircularButton from "./CircularButton";
import DropdownItem from "./DropdownItem";
import IntelliSelect from "./SelectIntelligentOption";
import { DrawingStoredOptions, OptionUpdater, PdfUIState } from "../Interfaces/CustomOptions";
import ImageExport from "../Scripts/Export";
import * as PDFJS from "pdfjs-dist";
import CustomCallback from "./CustomCallback";
import { createRoot } from "react-dom/client";
import Settings from "./Settings";
import Lang from "../Scripts/LanguageTranslations";
import RerenderButtons from "../Scripts/RerenderButtons";
import CircularButtonsFunctions from "../Scripts/CircularButtonsFunctions";
import ExportDialog from "./ExportDialog";
interface Props {
    pageSettings: any,
    updatePage: React.Dispatch<SetStateAction<PdfUIState>>,
    settingsCallback?: (e: OptionUpdater) => void,
    pdfObj?: PDFJS.PDFDocumentProxy,
    imgObj?: HTMLImageElement
    requestedTab?: string
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
 * @param settingsCallback send a message back to the function, used when the user changes a value from the toolbar,
 * @param pdfObj the PDF document
 * @param imgObj the image that replaces the PDF document
 * @param requestedTab the ID of the Card that will be showj
 * @returns 
 */
let stateReflect = "hello"
export default function Toolbar({ pageSettings, updatePage, settingsCallback, pdfObj, requestedTab, imgObj }: Props) {
    let [CardShown, UpdateState] = useState("hello");
    stateReflect = CardShown;
    useEffect(() => {
        if (!requestedTab) return;
        const newTab = requestedTab.substring(0, requestedTab.indexOf(","));
        UpdateState(stateReflect === newTab ? "hello" : newTab);
    }, [requestedTab])
    const usefulBtn = { // NOTE: Always add the key attribute. Otherwise React, when exiting from the custom Card mode, will trigger the animation on the first element, causing UI issues.
        pen: <CircularButton btnIdentifier="pen" key={`KeyPenBtn`} hint={Lang("Show pen settings and enable annotations")} enabledSwitch={true} imgId="pen" dropdownCallback={() => { if (settingsCallback) settingsCallback({ interface: "ChangedPenStatus", value: "" }); requestedTab = undefined; UpdateState(CardShown === "pen" ? "hello" : "pen"); }}></CircularButton>,
        circle: <CircularButton btnIdentifier="pointer" key={"KeyCircleBtn"} hint={Lang("Show cursor settings")} imgId="circle" enabledSwitch={true} dropdownCallback={() => { requestedTab = undefined; UpdateState(CardShown === "circle" ? "hello" : "circle") }}></CircularButton>,
        eraser: <CircularButton btnIdentifier="erase" key={"KeyEraseBtn"} imgId="eraser" hint={Lang("Erase annotations from the PDF")} enabledSwitch={true} click={() => { if (settingsCallback) settingsCallback({ interface: "EraserChanged", value: "" }) }}></CircularButton>,
        text: <CircularButton btnIdentifier="text" key={"KeyTextBtn"} imgId="text" hint={Lang("Add text annotations to the PDF")} enabledSwitch={true} dropdownCallback={() => { if (settingsCallback) settingsCallback({ interface: "ChangedTextStatus", value: "" }); UpdateState(CardShown === "text" ? "hello" : "text") }}></CircularButton>
    }
    let checkFlexDiv = useRef<HTMLDivElement>(null);
    /**
     * Make sure no buttons are lost due to the div being justified in the center
     */
    function fixToolbarContentJustification() {
        if (checkFlexDiv.current) checkFlexDiv.current.style.justifyContent = checkFlexDiv.current.scrollWidth - checkFlexDiv.current.getBoundingClientRect().width > -3 && checkFlexDiv.current.scrollWidth - checkFlexDiv.current.getBoundingClientRect().width < 3 ? "center" : "left"; // Add a 3px tollerance for WebKit, since one of the two values might be a pixel greater than the other
    }
    useEffect(() => fixToolbarContentJustification());
    useEffect(() => window.addEventListener("resize", () => fixToolbarContentJustification()), [])
    let generateColorValues = () => [{ name: "Green", value: "rgb(0,255,0)" }, { name: "Blue", value: "rgb(0,0,255)" }, { name: "Red", value: "rgb(255,0,0)" }, { name: "Accent color", value: getComputedStyle(document.body).getPropertyValue("--accent") }, ...JSON.parse(localStorage.getItem(`PDFPointer-CustomColor`) ?? "[]")]; // Make it a function so that the accent color is refreshed every time.
    return <div style={{ marginTop: "10px", margin: "0px 20px" }}>
        <Card type={1} zIndex={999991}>
            <div ref={checkFlexDiv} className="toolbar" style={{ justifyContent: CardShown === "hello" ? "center" : "left" }}>
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
                        <CircularButton hint={Lang("Make text bold")} enabledSwitch={true} imgId="textbold" click={() => { if (settingsCallback) settingsCallback({ interface: "TextBoldChanged", value: "" }) }}></CircularButton>
                        <CircularButton hint={Lang("Make text italic")} enabledSwitch={true} imgId="textitalic" click={() => { if (settingsCallback) settingsCallback({ interface: "TextItalicChanged", value: "" }) }}></CircularButton>
                        <CircularButton hint={Lang("Make text underlined")} enabledSwitch={true} imgId="textunderline" click={() => { if (settingsCallback) settingsCallback({ interface: "TextUnderlineChanged", value: "" }) }}></CircularButton>
                        <CircularButton hint={Lang("Make text striked")} marginRight={15} enabledSwitch={true} imgId="textstrikethrough" click={() => { if (settingsCallback) settingsCallback({ interface: "TextStrikeChanged", value: "" }) }}></CircularButton>
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
                    {pdfObj && <CircularButton hint={Lang("Previous page")} imgId="prev" click={() => { if (pageSettings.page !== 1) updatePage(prevState => { return { ...prevState, page: prevState.page - 1 } }) }}></CircularButton>}
                    <CircularButton hint={Lang("Reduce zoom")} marginRight={30} imgId="zoomout" click={() => { updatePage(prevState => { return { ...prevState, scale: prevState.scale /= 1.2 } }) }}></CircularButton>
                    {pdfObj && <CircularButton hint={Lang("Show page(s) preview")} imgId="numbersquare" btnIdentifier="thumbnail" enabledSwitch={true} click={() => { updatePage(prevState => { return { ...prevState, showThumbnail: prevState.showThumbnail !== 1 ? 1 : 2 } }) }}></CircularButton>}
                    {usefulBtn.pen}
                    {usefulBtn.circle}
                    {usefulBtn.eraser}
                    {usefulBtn.text}
                    <CircularButton hint={Lang(`${document.fullscreenElement ? "Exit from" : "Go in"} fullscreen mode`)} imgId={document.fullscreenElement ? "fullscreenminimize" : "fullscreenmaximize"} click={CircularButtonsFunctions.fullscreen}></CircularButton>
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
                    <DropdownItem disableAutoDisappear={true} content={<ExportDialog pdfObj={pdfObj} imgObj={imgObj}></ExportDialog>} title={Lang("Export as Image")}>
                        <CircularButton hint={Lang("Save PDF as an image")} imgId="saveimg"></CircularButton>
                    </DropdownItem>
                    <CircularButton hint={Lang("Show settings")} imgId="settings" click={() => CircularButtonsFunctions.settings(updatePage)}></CircularButton>
                    <CircularButton hint={Lang("Increase zoom")} marginLeft={30} imgId="zoomin" click={() => { updatePage(prevState => { return { ...prevState, scale: prevState.scale *= 1.2 } }) }}></CircularButton>
                    {pdfObj && <CircularButton hint={Lang("Next page")} imgId="next" click={() => { if (pdfObj.numPages > pageSettings.page) updatePage(prevState => { return { ...prevState, page: prevState.page + 1 } }) }}></CircularButton>}
                </>
                }
            </div>
        </Card >
    </div>
}