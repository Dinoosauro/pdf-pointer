import { useRef } from "react";
import { DynamicImg } from "./DynamicImg"
import DropdownItem from "./DropdownItem";
import Lang from "../Scripts/LanguageTranslations";

interface Props {
    id: string,
    text: string,
    close: () => void
    extra?: HTMLElement,
    showSpinner?: boolean
}
// 
/**
 * Shows an alert on the top of the screen
 * @param id an identifier of the alert category, so that, if the user wants so, it won't be shown again
 * @param text the text contained by the alert
 * @param close the function that'll handle deleting the element from the DOM
 * @param extra an extra element to add after the text
 * @param showSpinner shows a spinner animation if the alert is for loading content
 * @returns the ReactNode of an alert
 */
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