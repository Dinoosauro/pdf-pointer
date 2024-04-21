import AlertManager from "../Scripts/AlertManager";

interface Props {
    updateLang: () => void
}
/**
 * The tab where the user can change the language
 * @param updateLang the callback used for globally updating the language
 * @returns a ReactNode of the Lanuage tab
 */
export default function Language({ updateLang }: Props) {
    return <>
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
    </>
}