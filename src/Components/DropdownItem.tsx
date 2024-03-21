import { ReactNode, useEffect, useRef, useState } from "react";
import { DynamicImg } from "./DynamicImg";
import { DrawingStoredOptions } from "../Interfaces/CustomOptions";

interface Props {
    children: ReactNode, // The content that'll be always shown
    content: ReactNode, // The content that'll be shown only when the dropdown is open
    title: string, // The title of the dropdown item
    disableAutoDisappear?: boolean, // If false, the dropdown will be closed after a click in it
    custom?: ReactNode, 
    backdropColor?: boolean, // Add a background to the dropdown item
    defaultValueRef?: keyof DrawingStoredOptions // The key of the "DrawingStoredOptions", used to get the previous value from LocalStorage
}
let clientX = 0;
export default function DropdownItem({ children, content, title, disableAutoDisappear, custom, backdropColor, defaultValueRef }: Props) {
    let [ShowDropdown, UpdateDropdown] = useState(false);
    let ref = useRef<HTMLDivElement>(null); // The container of the dropdown when opened
    async function disappear() { // Hide the dropdown content with an opacity transition
        if (ref) {
            if (ref.current) ref.current.style.opacity = "0";
            await new Promise((resolve) => { setTimeout(() => { resolve("") }, 160) });
        }
        UpdateDropdown(false);
    }
    useEffect(() => {
        if (defaultValueRef && ref.current) { // Update the value of the input to be the same previously chosen by the user, getting their previous option from LocalStorage
            let input = ref.current.querySelector("input");
            if (input) input.value = (JSON.parse(localStorage.getItem("PDFPointer-UserAnnotationSettings") ?? "[]") as DrawingStoredOptions)[defaultValueRef].toString();
        }
        if (ref.current) { 
            let parse = JSON.parse(sessionStorage.getItem("PDFPointer-UserTempSettings") ?? "{}"); // Get the temp storage options from the SessionStorage, so that also they can be restored
            if (Object.keys(parse).length === 0) return;
            for (let item of ref.current.querySelectorAll("[data-tempstorage]")) if (!isNaN(parseInt(parse[item.getAttribute("data-tempstorage") ?? "nothing"]))) (item as HTMLInputElement).value = parse[item.getAttribute("data-tempstorage") ?? "nothing"]; // Items that can be restored from temp settings are identified with the "data-tempstorage" attribute
        }
    })
    return <>
        <span>
            <span onClick={(e) => { // Show (or hide) the dropdown item (the button is clicked)
                clientX = e.clientX;
                UpdateDropdown(!ShowDropdown)
            }}>{children}</span>
            {ShowDropdown && <div style={{ backgroundColor: backdropColor ? "var(--firststruct)" : "", position: "fixed", left: clientX + (window.innerWidth * 45 / 100) < window.innerWidth ? `${clientX}px` : undefined, right: clientX + (window.innerWidth * 45 / 100) > window.innerWidth ? `${window.innerWidth - clientX - 10}px` : undefined }} className="dropdownOpen opacity" ref={ref}><h3>{title}</h3><div onClick={async () => {
                if (!disableAutoDisappear) await disappear();
            }}>
                <div style={{ position: "absolute", top: 15, right: 15 }} className="simplePointer" onClick={disappear}><DynamicImg id="minimize"></DynamicImg></div>
                {content}
            </div>
                <span>
                    {custom}
                </span>
            </div>}
        </span>
    </>
}