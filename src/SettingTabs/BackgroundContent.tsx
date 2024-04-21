import { useEffect, useRef, useState } from "react";
import Lang from "../Scripts/LanguageTranslations";
import BackgroundManager from "../Scripts/BackgroundManager";
import IndexedDatabase from "../Scripts/IndexedDatabase";

/**
 * The settings tab where the user can add an image or a video as background content
 * @returns the BackgroundContent ReactNode tab
 */
export default function BackgroundContent() {
    let backgroundSelect = useRef<HTMLSelectElement>(null);
    let [state, updateState] = useState({
        backgroundSelectionStatus: localStorage.getItem("PDFPointer-BackgroundOptions") === null ? 0 : localStorage.getItem("PDFPointer-BackgroundOptions") === "url" ? 2 : 1 // Shows (or hides) elements for choosing the background content
    });
    let videoUrl = useRef<HTMLInputElement>(null);
    useEffect(() => {
        (async () => {
            if (videoUrl.current) { // videoUrl exists only if the user selected the "YouTube" option for video content. Therefore, if it exists, fetch from the DB the URL, so that it can be put as a value in the input
                const url = await IndexedDatabase.get({ db: await IndexedDatabase.db(), query: "url" });
                if (url) {
                    const text = await url.blob.text();
                    if (text !== "") videoUrl.current.value = BackgroundManager.getYoutubeUrl(text);
                }
            }
        })()
    })
    function restoreDefaultStyle() { // Go back to the deafult card style
        localStorage.removeItem("PDFPointer-BackgroundOptions");
        BackgroundManager.restoreItems();
        updateState(prevState => { return { ...prevState, backgroundSelectionStatus: 0 } })
    }
    return <>
        <h3>{Lang("Background content")}</h3>
        <i>{Lang("Add an image or a video as a background content")}</i><br></br><br></br>
        <select ref={backgroundSelect} defaultValue={localStorage.getItem("PDFPointer-BackgroundOptions") ?? "no"} onChange={(e) => {
            if (e.currentTarget.value === "no") { // Basic background color
                restoreDefaultStyle();
                return;
            }
            const value = e.currentTarget.value;
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
                const input = document.createElement("input");
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
    </>
}