import { useEffect, useRef, useState } from "react";
import Lang from "../Scripts/LanguageTranslations";
import CustomDisplay from "./CustomDisplay";
import Dialog from "./Dialog";
import AlertManager from "../Scripts/AlertManager";
import BackgroundManager from "../Scripts/BackgroundManager";
import IndexedDatabase from "../Scripts/IndexedDatabase";
import LicenseGet from "../Scripts/LicenseGet";

interface Props {
    updateLang: () => void
}
export default function Settings({ updateLang }: Props) {
    let [state, updateState] = useState({ 
        backgroundSelectionStatus: localStorage.getItem("PDFPointer-BackgroundOptions") === null ? 0 : localStorage.getItem("PDFPointer-BackgroundOptions") === "url" ? 2 : 1 // Shows (or hides) elements for choosing the background content
     });
     // TODO: Just like in the PdfUI, make them as objects in a unique useRef
    let backgroundSelect = useRef<HTMLSelectElement>(null);
    let videoUrl = useRef<HTMLInputElement>(null);
    let licenseText = useRef<HTMLLabelElement>(null);
    useEffect(() => {
        (async () => {
            if (videoUrl.current) { // videoUrl exists only if the user selected the "YouTube" option for video content. Therefore, if it exists, fetch from the DB the URL, so that it can be put as a value in the input
                let url = await IndexedDatabase.get({ db: await IndexedDatabase.db(), query: "url" });
                if (url) {
                    let text = await url.blob.text();
                    if (text !== "") videoUrl.current.value = BackgroundManager.getYoutubeUrl(text);
                }
            }
        })()
    })
    function restoreDefaultStyle() { // Go back to the deafult card style
        localStorage.removeItem("PDFPointer-BackgroundOptions");
        BackgroundManager.restoreItems();
        updateState({ ...state, backgroundSelectionStatus: 0 })
    }
    return <Dialog>
        <h2>{Lang("Settings:")}</h2>
        <div className="dialogList">
            <h3>{Lang("Custom colors:")}</h3>
            <i>{Lang("The custom colors will appear in the Cursor and Pen color pickers.")}</i><br></br><br></br>
            <CustomDisplay category="Color"></CustomDisplay>
        </div><br></br>
        <div className="dialogList">
            <h3>{Lang("Custom themes:")}</h3>
            <i>{Lang("Make PDFPointer yours by changing its color palette")}</i><br></br><br></br>
            <CustomDisplay category="Theme"></CustomDisplay>
        </div><br></br>
        <div className="dialogList">
            <h3>{Lang("Alerts:")}</h3>
            <i>{Lang("Manage the alerts that are shown when an action is being done")}</i><br></br><br></br>
            <select className="intelligentFill" defaultValue={localStorage.getItem("PDFPointer-HideAlerts") === "a" ? "c" : "b"} onChange={(e) => {
                if (e.currentTarget.value === "a") {
                    localStorage.removeItem("PDFPointer-AvoidAlert");
                    AlertManager.alert({ id: "DismissedAlertsRestored", text: Lang("Dismissed alerts restored") })
                }
                localStorage.setItem("PDFPointer-HideAlerts", e.currentTarget.value === "c" ? "a" : "b");
            }}>
                <option value="a">{Lang("Show every alert (restore default)")}</option>
                <option value="b">{Lang("Avoid showing the dismissed alerts")}</option>
                <option value="c">{Lang("Never show alerts")}</option>
            </select><br></br><br></br>
            <div style={{ display: "flex" }}>
                <label>{Lang("Show alert for")}<input defaultValue={isNaN(parseInt(localStorage.getItem("PDFPointer-AlertLength") ?? "")) ? 5000 : parseInt(localStorage.getItem("PDFPointer-AlertLength") ?? "5000")} style={{ width: "fit-content", margin: "0px 10px" }} onChange={(e) => localStorage.setItem("PDFPointer-AlertLength", e.currentTarget.value)} type="number" min={1}></input>{Lang("milliseconds")}</label>
            </div>
        </div><br></br>
        <div className="dialogList">
            <h3>Languages:</h3>
            <i>Change PDFPointer language</i><br></br><br></br>
            <select className="intelligentFill" defaultValue={localStorage.getItem("PDFPointer-Language") ?? "en"} onChange={(e) => {
                localStorage.setItem("PDFPointer-Language", e.currentTarget.value);
                AlertManager.alert({ id: "ChangedLanguageGeneric", text: "Languages settings applied. Close the settings dialog to continue." });
                updateLang();
            }}>
                <option value="en">English</option>
                <option value="it">Italiano</option>
            </select>
        </div><br></br>
        <div className="dialogList">
            <h3>{Lang("Background content")}</h3>
            <i>{Lang("Add an image or a video as a background content")}</i><br></br><br></br>
            <select ref={backgroundSelect} defaultValue={localStorage.getItem("PDFPointer-BackgroundOptions") ?? "no"} onChange={(e) => {
                if (e.currentTarget.value === "no") { // Basic background color
                    restoreDefaultStyle();
                    return;
                }
                let value = e.currentTarget.value;
                BackgroundManager.apply({ query: value }).then(() => { // Look if there are any existing values in the DB for that category
                    updateState({ ...state, backgroundSelectionStatus: value === "url" ? 2 : 1 })
                });

            }} className="intelligentFill" >
                <option value="no">{Lang("Basic color")}</option>
                <option value="image">{Lang("Image")}</option>
                <option value="video">{Lang("Local Video")}</option>
                <option value="url">{Lang("YouTube Video")}</option>
            </select>
            <br></br><br></br>
            {state.backgroundSelectionStatus === 2 && <>
                <input className="intelligentFill" ref={videoUrl} type="text" placeholder="Your YouTube video link"></input><br></br><br></br>
            </>}
            {state.backgroundSelectionStatus !== 0 && <div style={{ display: "flex" }}>
                <button style={{ marginRight: "5px" }} onClick={async () => {
                    if (backgroundSelect.current && backgroundSelect.current.value === "url" && videoUrl.current) { // Custom method to insert YouTube video URL
                        // Format YouTube video for embed
                        let url = videoUrl.current.value;
                        if (url === "") return;
                        if (url.indexOf("&") !== -1) url = url.substring(0, url.indexOf("&"));
                        if (url.indexOf("watch?v=") !== -1) url = url.substring(url.indexOf("watch?v=") + "watch?v=".length); else if (url.indexOf("playlist?list=") !== -1) url = `videoseries?list=${url.substring(url.indexOf("playlist?list=") + "playlist?list=".length)}`; else if (url.indexOf("youtu.be") !== -1) url = url.substring(url.lastIndexOf("/") + 1);
                        await BackgroundManager.set({ type: "url", content: new Blob([url]) }); 
                        await BackgroundManager.apply({ query: "url" });
                        return;
                    }
                    // Standard method: choose a file
                    let input = document.createElement("input");
                    input.type = "file";
                    input.onchange = async () => {
                        if (backgroundSelect.current && backgroundSelect.current.value !== "no") {
                            input.files !== null && await BackgroundManager.set({ type: (backgroundSelect.current.value as "video"), content: new Blob([await input.files[0].arrayBuffer()], { type: input.files[0].type }) }); // Save the content to the DB
                            await BackgroundManager.apply({ query: (backgroundSelect.current.value as "video") }); // And apply it
                        }
                    }
                    input.click();
                }}>{Lang("Update content")}</button>
                <button style={{ marginLeft: "5px" }} onClick={async () => {
                    if (backgroundSelect.current) {
                        await IndexedDatabase.remove({ db: await IndexedDatabase.db(), query: (backgroundSelect.current.value as "video") });
                        backgroundSelect.current.value = "no";
                        restoreDefaultStyle();
                    }
                }}>{Lang("Delete content")}</button>
            </div>}
        </div><br></br><br></br>
        <div className="dialogList">
            <h3>{Lang("Licenses")}</h3>
            <i>{Lang("See the licenses of the open-source software")}</i><br></br>
            {[{ name: "React", author: "Meta Platforms, Inc. and affiliates.", type: "mit" }, { name: "PDF.JS", type: "apache" }, { name: "jszip", type: "mit", author: "2009-2016 Stuart Knightley, David Duponchel, Franz Buchinger, António Afonso"}, {name: "PDFPointer", author: "Dinoosauro", type: "mit"}].map(license => <span key={`PDFPointer-OpenSourceLicense-${license.name}`} className="simplePointer" style={{marginRight: "10px", padding: "10px", borderRadius: "8px", backgroundColor: "var(--firststruct)"}} onClick={() => {
                    if (licenseText.current) licenseText.current.textContent = LicenseGet[license.type as "mit"](license.author ?? "");
                }}>{license.name}</span>)}<br></br><br></br>
            <label ref={licenseText} style={{ whiteSpace: "pre-line" }}></label>

        </div>
    </Dialog>
}