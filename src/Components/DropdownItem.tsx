import { ReactNode, useEffect, useRef, useState } from "react";
import { DynamicImg } from "./DynamicImg";
import { DrawingStoredOptions } from "../Interfaces/CustomOptions";

interface Props {
    children: ReactNode,
    content: ReactNode,
    title: string,
    disableAutoDisappear?: boolean,
    custom?: ReactNode,
    backdropColor?: boolean,
    defaultValueRef?: keyof DrawingStoredOptions
}
/**
 * 
 * @param children the content that'll be always shown,
 * @param content the content that'll be shown only when the dropdown is open
 * @param title the title of the dropdown item
 * @param disableAutoDisappear if false, the dropdown will be closed after a click in it
 * @param backdropColor add a background to the dropdown item
 * @param defaultValueRef  the key of the "DrawingStoredOptions", used to get the previous value from LocalStorage
 * @returns 
 */
export default function DropdownItem({ children, content, title, disableAutoDisappear, custom, backdropColor, defaultValueRef }: Props) {
    let [ShowDropdown, UpdateDropdown] = useState(false);
    let ref = useRef<HTMLDivElement>(null); // The container of the dropdown when opened
    /**
     * Hide the dropdown content with an opacity transition
     */
    let clientX = useRef<number>(0);
    async function disappear() {
        if (ref) {
            if (ref.current) ref.current.style.opacity = "0";
            await new Promise((resolve) => { setTimeout(() => { resolve("") }, 160) });
        }
        UpdateDropdown(false);
    }
    useEffect(() => {
        if (defaultValueRef && ref.current) { // Update the value of the input to be the same previously chosen by the user, getting their previous option from LocalStorage
            const input = ref.current.querySelector("input");
            if (input) input.value = (JSON.parse(localStorage.getItem("PDFPointer-UserAnnotationSettings") ?? "[]") as DrawingStoredOptions)[defaultValueRef].toString();
        }
        if (ref.current) {
            const parse = JSON.parse(sessionStorage.getItem("PDFPointer-UserTempSettings") ?? "{}"); // Get the temp storage options from the SessionStorage, so that also they can be restored
            if (Object.keys(parse).length === 0) return;
            for (let item of ref.current.querySelectorAll("[data-tempstorage]")) if (!isNaN(parseInt(parse[item.getAttribute("data-tempstorage") ?? "nothing"]))) (item as HTMLInputElement).value = parse[item.getAttribute("data-tempstorage") ?? "nothing"]; // Items that can be restored from temp settings are identified with the "data-tempstorage" attribute
        }
    })
    return <>
        <span>
            <span onClick={(e) => { // Show (or hide) the dropdown item (the button is clicked)
                clientX.current = e.clientX;
                UpdateDropdown(!ShowDropdown)
            }}>{children}</span>
            {ShowDropdown && <div style={{ backgroundColor: backdropColor ? "var(--firststruct)" : "", position: "fixed", left: clientX.current + (window.innerWidth * 45 / 100) < window.innerWidth ? `${clientX.current}px` : undefined, right: clientX.current + (window.innerWidth * 45 / 100) > window.innerWidth ? `${window.innerWidth - clientX.current - 10}px` : undefined }} className="dropdownOpen opacity" ref={ref}><h3>{title}</h3><div onClick={async () => {
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