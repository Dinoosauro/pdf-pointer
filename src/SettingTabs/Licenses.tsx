import { useRef, useState } from "react";
import Lang from "../Scripts/LanguageTranslations";
import LicenseGet from "../Scripts/LicenseGet";
import Sections from "../Components/Sections";

/**
 * The settings tab where the user can see the open source licenses
 * @returns the Licenses tab
 */
export default function Licenses() {
    let [state, updateState] = useState("React");
    const licenses = [{ name: "React", author: "Meta Platforms, Inc. and affiliates.", type: "mit" }, { name: "PDF.JS", type: "apache" }, { name: "jszip", type: "mit", author: "2009-2016 Stuart Knightley, David Duponchel, Franz Buchinger, António Afonso" }, { name: "PDFPointer", author: "Dinoosauro", type: "mit" }];
    return <>
        <h3>{Lang("Licenses")}</h3>
        <i>{Lang("See the licenses of the open-source software")}</i><br></br>
        <Sections invertColors={true} list={licenses.map(e => { return { displayedName: e.name, id: e.name } })} callback={(e) => updateState(e)}></Sections><br></br>
        <div className="moveCard" style={{ backgroundColor: "var(--firststruct)" }}>
            <label style={{ whiteSpace: "pre-line" }}>{LicenseGet[licenses.find(e => e.name === state)?.type as "mit"](licenses.find(e => e.name === state)?.author ?? "")}</label>
        </div>
    </>
}