import { useEffect, useReducer, useRef, useState } from "react";
import { CustomProp } from "../Interfaces/CustomOptions";
import { DynamicImg, UpdateImages } from "./DynamicImg";
import ThemeManager from "../Scripts/ThemeManager";
import Lang from "../Scripts/LanguageTranslations";
import AlertManager from "../Scripts/AlertManager";
interface Props {
    category: "Color" | "Theme"  // "color" for the custom color; "theme" for the custom theme
}
interface SaveFilePicker {
    id?: string,
    suggestedName?: string,
    types?: {
        description: string,
        accept: {}
    }[]
}
declare global {
    interface Window {
        showSaveFilePicker: ({ id, suggestedName, types }: SaveFilePicker) => Promise<FileSystemFileHandle>
    }
}
/**
 * The container of the custom properties (currently "Color" and "Theme")
 * @param category "Color" if the custom values should be the colors; otherwise "Theme" for editing custom themes
 * @returns the CustomDisplay ReactNode
 */
export default function CustomDisplay({ category }: Props) {
    /**
     * Custom color name
     */
    let typedName = useRef<string>("");
    /**
     * Custom color value
     */
    let typedColor = useRef<string>("");
    // Get the current theme values so that the color list can be updated
    const themeValue = [{ ref: "background", desc: Lang("Background color"), value: getComputedStyle(document.body).getPropertyValue("--background") },
    { ref: "text", desc: Lang("Text color"), value: getComputedStyle(document.body).getPropertyValue("--text") },
    { ref: "firststruct", desc: Lang("Card color"), value: getComputedStyle(document.body).getPropertyValue("--firststruct") },
    { ref: "secondstruct", desc: Lang("Card subsections color"), value: getComputedStyle(document.body).getPropertyValue("--secondstruct") },
    { ref: "accent", desc: Lang("Accent color"), value: getComputedStyle(document.body).getPropertyValue("--accent") }];
    let [nothing, forceRefresh] = useState(0); // The state is used only to re-render the component
    let ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (ref.current) { // Create a height transition for each of the theme/color container divs
            for (let item of ref.current.querySelectorAll(".customItem")) setTimeout(() => (item as HTMLDivElement).style.height = "35px", 25);
        }
    })
    /**
     * Get a random ID for the custom color/theme, and check that it was not previously taken
     * @returns an unique number
     */
    function getId(): number {
        let random = Math.random();
        return (JSON.parse(localStorage.getItem(`PDFPointer-Custom${category}`) ?? "[]") as CustomProp[]).findIndex(e => e.id === random) === -1 ? random : getId();
    }
    /**
     * Download the themes or the colors
     * @param content the string that'll be downloaded
     */
    async function intelliDownload(content: string) {
        /**
         * If the File System API isn't available, download normally the file
         */
        async function fallback() {
            const a = document.createElement("a");
            a.href = URL.createObjectURL(new Blob([content], { type: "application/json" }));
            a.download = `PDFPointer-Custom${category}.json`;
            a.click();
            await AlertManager.alert({ id: "ExportDownloadStarted", text: Lang("The download of your options has started"), extra: a });
            URL.revokeObjectURL(a.href);
        }
        if (window.showSaveFilePicker !== undefined) { // Try to save the file with the File System API
            try {
                const picker = await window.showSaveFilePicker({ id: `PDFPointer-ExportCustom${category}`, suggestedName: `PDFPointer-Custom${category}.json`, types: [{ description: "A JSON File that can be read by PDFPointer", accept: { "application/json": [".json"] } }] });
                const write = await picker.createWritable();
                await write.write(content);
                await write.close();
            } catch (ex) {
                console.warn({
                    type: "RejectedPicker",
                    desc: "The user closed the 'Save File' dialog without saving a file. Fallback to link downloads.",
                    gravity: 0,
                    ex: ex
                });
                fallback();
            }
        } else fallback();
    }
    return <>
        <div style={{ display: "flex", justifyContent: category === "Color" ? "center" : "", overflow: "auto" }}>
            {category === "Color" ? <>
                <input type="color" style={{ height: "42px" }} onInput={(e) => typedColor.current = e.currentTarget.value}></input>
                <input style={{ marginLeft: "10px", width: "fit-content", height: "38px" }} onInput={(e) => typedName.current = e.currentTarget.value} type="text" placeholder={Lang("Write the color name")}></input>
                <button style={{ marginLeft: "10px", width: "fit-content" }} onClick={() => { // The button that'll add the new color to the list
                    let getContent = JSON.parse(localStorage.getItem(`PDFPointer-Custom${category}`) ?? "[]") as CustomProp[];
                    getContent.push({ name: typedName.current, value: typedColor.current, id: getId() })
                    localStorage.setItem(`PDFPointer-Custom${category}`, JSON.stringify(getContent));
                    forceRefresh(nothing + 1);
                }}>{Lang("Add")}</button>
            </> : <>
                {themeValue.map(e => <span key={`PDFPointer-CustomThemeChange-${e.ref}`} style={{ marginRight: "10px" }}><span className="themeChip">
                    <input type="color" defaultValue={e.value} onChange={(f) => {
                        // @ts-ignore | Update the value both in the DOM and in the theme array
                        themeValue.find(g => g.ref === e.ref).value = (f.target as HTMLInputElement).value;
                        document.body.style.setProperty(`--${e.ref}`, (f.target as HTMLInputElement).value);
                        e.ref === "accent" && UpdateImages(); // If the updated value is the accent color, update the image color
                    }} style={{ marginRight: "10px" }}></input><label>{e.desc}</label>
                </span></span>)}
                <button onClick={() => { // Save the theme
                    let name = prompt(Lang("Please choose a name for your theme"));
                    if (name === null) return;
                    let themeArr = JSON.parse(localStorage.getItem(`PDFPointer-CustomTheme`) ?? "[]") as CustomProp[];
                    themeArr.push({
                        name: name,
                        id: getId(),
                        value: getComputedStyle(document.body).getPropertyValue("--accent") ?? "",
                        lists: themeValue.map((e) => { return { ref: e.ref, value: e.value } })
                    });
                    localStorage.setItem(`PDFPointer-Custom${category}`, JSON.stringify(themeArr));
                    forceRefresh(nothing + 1);

                }}>{Lang("Save theme")}</button>
            </>}
        </div><br></br>
        <div ref={ref}>
            {[...(category !== "Color" ? ThemeManager.standard : []), ...JSON.parse(localStorage.getItem(`PDFPointer-Custom${category}`) ?? "[]")].map((e: CustomProp) => <div className="customItem" key={`PDFPointer-Custom${category}List-${e.id}`}>
                <div style={{ display: "flex", alignItems: "center", height: "100%", position: "relative", margin: "0px 10px" }}>
                    {e.name}
                    <div style={{ backgroundColor: category === "Color" ? e.value : e.lists?.find(e => e.ref === "firststruct")?.value ?? getComputedStyle(document.body).getPropertyValue("--firststruct") }} className={`deleteContainer${e.id > 0 ? "" : " disabled"}`}>
                        <span onClick={async (f) => { // Delete the current color/theme from the list of saved colors/themes
                            if (f.currentTarget.parentElement?.classList.contains("disabled")) return;
                            ThemeManager.remove({ id: e.id, category: category });
                            let mainDiv = (f.target as HTMLDivElement).closest(".customItem") as HTMLDivElement | null;
                            if (mainDiv) mainDiv.style.height = "0px";
                            await new Promise<void>((resolve) => setTimeout(() => resolve(), 270)); // Animation
                            forceRefresh(nothing + 1);
                        }}>
                            <DynamicImg staticColor={e.lists?.find(e => e.ref === "accent")?.value} id="delete" width={16}></DynamicImg>
                        </span>
                    </div>
                    <div style={{ backgroundColor: category === "Color" ? e.value : e.lists?.find(e => e.ref === "firststruct")?.value ?? getComputedStyle(document.body).getPropertyValue("--firststruct"), right: "30px" }} className="deleteContainer">
                        <span onClick={() => intelliDownload(JSON.stringify([e]))}>
                            <DynamicImg staticColor={e.lists?.find(e => e.ref === "accent")?.value} id="export" width={16}></DynamicImg>
                        </span>
                    </div>
                    {category !== "Color" && <div style={{ backgroundColor: e.lists?.find(e => e.ref === "firststruct")?.value ?? getComputedStyle(document.body).getPropertyValue("--firststruct"), right: "60px" }} className="deleteContainer">
                        <span onClick={() => ThemeManager.apply(e.lists)}>
                            <DynamicImg staticColor={e.lists?.find(e => e.ref === "accent")?.value} id="bucket" width={16}></DynamicImg>
                        </span>
                    </div>}
                </div>
            </div>)}</div> <br></br>
        <div style={{ display: "flex" }}>
            <button onClick={() => { // Import value from JSON file
                let input = document.createElement("input");
                input.type = "file";
                input.onchange = async () => {
                    if (input.files) {
                        let parse = JSON.parse(await input.files[0].text()) as CustomProp[]; // Get the formatted JSON form the file
                        mainLoop: for (let item of parse) {
                            if (typeof item.name === "string" && /^#[0-9A-F]{6}$/i.test(item.value)) { // Check that the string name is provided and that the main value is a hex color
                                if (category !== "Color") { // With "theme" files, also each element in the list (that contains all the colors) must be checked
                                    if (item.lists) {
                                        for (let type of item.lists) {
                                            if (typeof type.ref !== "string" || !/^#[0-9A-F]{6}$/i.test(type.value)) continue mainLoop;
                                        }
                                    } else continue mainLoop;
                                } else if (item.lists) continue mainLoop;
                                item.id = getId(); // Get a new ID for the imported item, and save it
                                let getItem = JSON.parse(localStorage.getItem(`PDFPointer-Custom${category}`) ?? "[]") as CustomProp[];
                                getItem.push(item);
                                localStorage.setItem(`PDFPointer-Custom${category}`, JSON.stringify(getItem));
                            } else continue mainLoop;
                        }
                    }
                    forceRefresh(nothing + 1);
                }
                input.click();
            }} style={{ marginRight: "5px" }}>{Lang("Import items")}</button>
            <button style={{ marginLeft: "5px" }} onClick={async () => intelliDownload(localStorage.getItem(`PDFPointer-Custom${category}`) ?? "[]")}>{Lang("Export items")}</button>
        </div>
    </>
}