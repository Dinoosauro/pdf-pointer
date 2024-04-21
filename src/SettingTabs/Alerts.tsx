import AlertManager from "../Scripts/AlertManager";
import Lang from "../Scripts/LanguageTranslations";

/**
 * The tab where the user can manage alerts shown by PDFPointer
 * @returns the Alert ReactNode tab
 */
export default function Alerts() {
    return <>
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
    </>
}