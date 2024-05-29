import Lang from "../Scripts/LanguageTranslations";
import { KeyPreference } from "../Interfaces/CustomOptions";
import Card from "../Components/Card";
import { useEffect, useRef, useState } from "react";

/**
 * Change keyboard shortcuts inside PDFPointer
 * @returns the KeyboardShortcuts ReactNode tab
 */
export default function KeyboardShortcuts() {
    const KeyPreference = JSON.parse(localStorage.getItem("PDFPointer-KeyboardPreferences") ?? "{}") as KeyPreference;
    const [state, updateState] = useState<keyof KeyPreference>("zoomin");
    let keyPressed: string[] = [];
    let keyList = useRef<HTMLDivElement>(null);
    function updateValues() {
        if (keyList.current) keyList.current.textContent = keyPressed.join("  —  ");
    };
    return <>
        <h3>{Lang("Keyboard shortcuts:")}</h3>
        <i>{Lang("Change, or delete the keyboard shortcuts to useful elements. Click on the dashed surface, and press the key for this action")}</i><br></br><br></br>
        <div className="card" style={{ backgroundColor: "var(--firststruct)" }}>
            <select className="intelligentFill" onChange={(e) => updateState(e.target.value as keyof KeyPreference)}>
                <option value="zoomin">{Lang("Zoom in")}</option>
                <option value="zoomout">{Lang("Zoom out")}</option>
                <option value="pen">{Lang("Enable/disable pen")}</option>
                <option value="pointer">{Lang("Change pointer")}</option>
                <option value="text">{Lang("Write text")}</option>
                <option value="erase">{Lang("Enable/disable eraser")}</option>
                <option value="stop">{Lang("Stop every option")}</option>
                <option value="thumbnail">{Lang("Enable/disable thumbnail view")}</option>
                <option value="fullscreen">{Lang("Enable/disable fullscreen")}</option>
                <option value="settings">{Lang("Show settings")}</option>
                <option value="nextpage">{Lang("Go to next page")}</option>
                <option value="prevpage">{Lang("Go to previous page")}</option>
                <option value="export">{Lang("Export as an image")}</option>
            </select><br></br><br></br>
            <div style={{ display: "flex", alignItems: "center" }}>
                <div ref={keyList} tabIndex={0} data-nokeyboard="a" className="card intelligentFill simplePointer" style={{ backgroundColor: "var(--secondstruct)", border: "2px dashed var(--text)" }} key={`PDFPointer-KeyboardShortcutInput-${state}`} onKeyDown={(e) => {
                    e.preventDefault();
                    keyPressed.push(e.key.toLowerCase());
                    updateValues();
                    localStorage.setItem("PDFPointer-KeyboardPreferences", JSON.stringify({ ...JSON.parse(localStorage.getItem("PDFPointer-KeyboardPreferences") ?? "{}"), [state]: keyPressed }));
                }} onInput={(e) => e.preventDefault()}>{KeyPreference[state]?.join("  —  ")}</div><button style={{ marginLeft: "10px", width: "max-content", whiteSpace: "nowrap" }} onClick={() => {
                    localStorage.setItem("PDFPointer-KeyboardPreferences", JSON.stringify({ ...JSON.parse(localStorage.getItem("PDFPointer-KeyboardPreferences") ?? "{}"), [state]: undefined }));
                    keyPressed = [];
                    updateValues();
                }}>{Lang("Delete shortcut")}</button>
            </div>
        </div>
    </>
}