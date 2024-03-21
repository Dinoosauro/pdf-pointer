import { useRef } from "react";
import { DynamicImg } from "./DynamicImg"
import DropdownItem from "./DropdownItem";
import Lang from "../Scripts/LanguageTranslations";

interface Props {
    id: string, // An identifier of the alert category, so that, if the user wants so, it won't be shown again
    text: string, // The text contained by the alert
    close: () => void // The function that'll handle deleting the element from the DOM
    extra?: HTMLElement, // An extra element to add after the text
    showSpinner?: boolean // Shows a spinner animation if the alert is for loading content
}
// Shows an alert on the top of the screen
export default function AlertDom({ id, text, extra, showSpinner, close }: Props) {
    return <>
        {showSpinner ? <span className="spinner" style={{ width: "20px", height: "20px" }}></span> : <DynamicImg id="alert"></DynamicImg>}
        <span style={{ width: "10px" }}></span>
        <label style={{ marginRight: "10px" }}>{text}</label>
        {extra && <span style={{ marginRight: "10px" }}></span>}
        <DropdownItem backdropColor={true} title={Lang("Show this alert again?")} content={<><label className="simplePointer" onClick={() => {
            let arr = JSON.parse(localStorage.getItem("PDFPointer-AvoidAlert") ?? "[]"); // Array containing all the IDS that must not be shown
            arr.push(id);
            localStorage.setItem("PDFPointer-AvoidAlert", JSON.stringify(arr));
            close();
        }}>Don't show again</label><br></br><label className="simplePointer" onClick={close}>{Lang("Close")}</label></>}><label>X</label></DropdownItem>
    </>
}