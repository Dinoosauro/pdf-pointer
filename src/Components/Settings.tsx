import { useEffect, useRef, useState } from "react";
import Lang from "../Scripts/LanguageTranslations";
import CustomDisplay from "./CustomDisplay";
import Dialog from "./Dialog";
import AlertManager from "../Scripts/AlertManager";
import BackgroundManager from "../Scripts/BackgroundManager";
import IndexedDatabase from "../Scripts/IndexedDatabase";
import LicenseGet from "../Scripts/LicenseGet";
import Sections from "./Sections";
import CustomColor from "../SettingTabs/CustomColor";
import CustomTheme from "../SettingTabs/CustomTheme";
import Alerts from "../SettingTabs/Alerts";
import Language from "../SettingTabs/Language";
import BackgroundContent from "../SettingTabs/BackgroundContent";
import Licenses from "../SettingTabs/Licenses";
import KeyboardShortcuts from "../SettingTabs/KeyboardShortcuts";

interface Props {
    updateLang: () => void
}
/**
 * 
 * @param updateLang the callback of the PDFUI object so that language settings can be updated
 * @returns 
 */
export default function Settings({ updateLang }: Props) {
    let [state, updateState] = useState("customcolor");
    return <Dialog>
        <h2>{Lang("Settings:")}</h2>
        <Sections list={[{
            displayedName: Lang("Custom colors:").replace(":", ""),
            id: "customcolor"
        }, {
            displayedName: Lang("Custom themes:").replace(":", ""),
            id: "customtheme"
        }, {
            displayedName: Lang("Alerts:").replace(":", ""),
            id: "alert"
        }, {
            displayedName: "Language",
            id: "language"
        }, {
            displayedName: Lang("Background content").replace(":", ""),
            id: "backgroundcontent"
        },
        {
            displayedName: Lang("Keyboard shortcuts:").replace(":", ""),
            id: "keyboardshortcut"
        },
        {
            displayedName: Lang("Licenses").replace(":", ""),
            id: "licenses"
        }]} callback={(e) => updateState(e)}></Sections><br></br>
        <div className="dialogList">
            {state === "customcolor" ? <CustomColor></CustomColor> : state === "customtheme" ? <CustomTheme></CustomTheme> : state === "alert" ? <Alerts></Alerts> : state === "language" ? <Language updateLang={updateLang}></Language> : state === "backgroundcontent" ? <BackgroundContent></BackgroundContent> : state === "keyboardshortcut" ? <KeyboardShortcuts></KeyboardShortcuts> : <Licenses></Licenses>}
        </div>
    </Dialog>
}