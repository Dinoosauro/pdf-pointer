import { useRef, useState } from "react";
interface Props {
    imgId: string,
    click?: (e?: any) => void,
    marginRight?: number,
    marginLeft?: number,
    enabledSwitch?: boolean,
    dropdown?: string,
    dropdownCallback?: () => void,
    disableOpacity?: boolean,
    dataTest?: string,
    hint?: string
}
import { DynamicImg } from "./DynamicImg";
import getImg from "../Scripts/ImgReturn";
/**
 * Create a button with rounded corners, used for actions in the toolbar
 * @param imgId the identifier of the image icon of the button
 * @param click the event that'll be triggered when the user clicks on the button
 * @param marginRight add a right margin at the right of the button
 * @param marginLeft add a left margin at the right of the button
 * @param enabledSwitch when clicked, the button should switch from a section to another. This bool tells the function to render a custom animation for that
 * @param dropdownCallback call this function after the opacity transition has been done
 * @param disableOpacity disable the opacity animation done,
 * @param dataTest add a "data-test" attribute to the circular button
 * @param hint add an hint that'll be displayed when hovering the button
 * @returns the circular button ReactNode
 */
export default function CircularButton({ imgId, click, marginLeft, marginRight, enabledSwitch, dropdown, dropdownCallback, disableOpacity, dataTest, hint }: Props) {
    let [enabled, changeEnabled] = useState(false); // If the button is enabled
    let isSelectable = getImg(`${imgId}_fill`) !== ""; // Check if there's a specific icon for the clicked button
    let hintDiv = useRef<HTMLDivElement>(null)
    return <div className="opacityHoverContainer">
        <div role="button" className={`circularBtn${enabled && isSelectable ? " circularSelected" : ""}`} onClick={async (e) => {
            if (click) click(e); // Trigger the click event
            let target = (e.target as HTMLDivElement).closest("div") as HTMLDivElement | null;
            let toolbar = document.querySelector(".toolbar");
            if (dropdown !== null && toolbar !== null) {
                if (target) {
                    document.body.style.setProperty("--showhint", "0"); // Avoid showing hints when changing section
                    // @ts-ignore
                    if (!disableOpacity) for (let item of toolbar.children) if (target !== dropdown && target.classList.contains("circularSelected")) item.querySelector("div").style.opacity = "0"; // Hide the other buttons (with an opacity transition)
                    // Create easy animation for the clicked button
                    target.style.transform = "scale(1.5)";
                    target.style.opacity = "0.2";
                    await new Promise<void>((resolve) => { setTimeout(() => { resolve() }, 190) });
                    target.style.transform = "";
                    target.style.opacity = "1";
                    setTimeout(() => document.body.style.setProperty("--showhint", "1"), 300); // Show again the hints 
                }
                if (dropdownCallback !== undefined) dropdownCallback();
            }
            if (enabledSwitch) {
                for (let item of document.querySelectorAll("[data-noopacity=a]")) (item as HTMLDivElement).style.opacity = "1"; // Make visible the items that didn't need to be permanently invisible 
                await new Promise<void>((resolve) => { setTimeout(() => { resolve() }, 190) });
                if (isSelectable && target) changeEnabled(!target.classList.contains("circularSelected")); // Change the state if the button is enabled or not
            }
        }} style={{ marginLeft: marginLeft, marginRight: marginRight }} data-noopacity={disableOpacity ? "a" : "b"} data-test={dataTest} onMouseEnter={(e) => {
            if (hintDiv.current) hintDiv.current.style.left = `${e.clientX}px`;  // Add a fix for the placement of the hint if the bar needs to be scrolled
        }}>
            <DynamicImg id={`${imgId}${enabled && isSelectable ? "_fill" : ""}`} width={32}></DynamicImg>
        </div>
        {hint && <div className="dropdownOpen opacity opacityHover" style={{ position: "fixed", left: 0 }} ref={hintDiv}>
            <label>{hint}</label>
        </div>}
    </div>
}