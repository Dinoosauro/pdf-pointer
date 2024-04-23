import { useEffect, useRef, useState } from "react";
interface Props {
    imgId: string,
    click?: (e?: any) => void,
    marginRight?: number,
    marginLeft?: number,
    enabledSwitch?: boolean,
    dropdownCallback?: () => void,
    disableOpacity?: boolean,
    dataTest?: string,
    hint?: string,
    btnIdentifier?: string
}
import { DynamicImg } from "./DynamicImg";
import getImg from "../Scripts/ImgReturn";
import RerenderButtons from "../Scripts/RerenderButtons";
/**
 * Create a button with rounded corners, used for actions in the toolbar
 * @param imgId the identifier of the image icon of the button
 * @param click the event that'll be triggered when the user clicks on the button
 * @param marginRight add a right margin at the right of the button
 * @param marginLeft add a left margin at the right of the button
 * @param enabledSwitch when clicked, the button should switch from a section to another. This bool tells the function to render a custom animation for that
 * @param dropdownCallback call this function after the opacity transition has been done
 * @param dataTest add a "data-test" attribute to the circular button
 * @param hint add an hint that'll be displayed when hovering the button
 * @param btnIdentifier an identifier of the action that the button does. If provided, the button will be inserted in the RerenderButtons map, permitting to rerender is state (clicked or not) also from other functions.
 * @returns the circular button ReactNode
 */
export default function CircularButton({ imgId, click, marginLeft, marginRight, enabledSwitch, dropdownCallback, dataTest, hint, btnIdentifier }: Props) {
    let [enabled, changeEnabled] = useState(false); // If the button is enabled
    let isSelectable = getImg(`${imgId}_fill`) !== ""; // Check if there's a specific icon for the clicked button
    let hintDiv = useRef<HTMLDivElement>(null);
    let mainDiv = useRef<HTMLDivElement>(null);
    useEffect(() => { // If the item is one that can be changed by keyboard settings, add it to the list of buttons that can be re-rendered
        btnIdentifier && mainDiv.current && RerenderButtons.set(changeEnabled, btnIdentifier);
    }, []);
    useEffect(() => { // Update the button status as selected if it's the first of the list. This is done for the buttons that can be triggered by keyboard shortcuts since, otherwise, the user would automatically toggle it. Also, the eraser button will never be the first, so this must not be considered
        btnIdentifier && btnIdentifier !== "erase" && btnIdentifier !== "thumbnail" && changeEnabled(document.querySelector(".toolbar .opacityHoverContainer") === mainDiv.current);
    })
    return <div>
        <div role="button" ref={mainDiv} className={`opacityHoverContainer circularBtn${enabled && isSelectable ? " circularSelected" : ""}`} onClick={async (e) => {
            click && click(e); // Trigger the click event
            let toolbar = document.querySelector(".toolbar");
            if (toolbar && mainDiv.current) {
                document.body.style.setProperty("--showhint", "0"); // Avoid showing hints when changing section
                // Create a simple animation for the clicked button
                mainDiv.current.style.opacity = "0.4";
                await new Promise<void>((resolve) => { setTimeout(() => { resolve() }, 190) });
                mainDiv.current.style.opacity = "1";
                setTimeout(() => document.body.style.setProperty("--showhint", "1"), 300); // Show again the hints 
                dropdownCallback && dropdownCallback();
            }
            enabledSwitch && isSelectable && mainDiv.current && changeEnabled(prevState => !prevState);
        }} style={{ marginLeft: marginLeft, marginRight: marginRight, borderRadius: enabled && isSelectable ? "50%" : undefined }} data-test={dataTest} onMouseEnter={(e) => {
            if (hintDiv.current) hintDiv.current.style.left = `${e.clientX}px`;  // Add a fix for the placement of the hint if the bar needs to be scrolled
        }}>
            <DynamicImg id={`${imgId}${enabled && isSelectable ? "_fill" : ""}`} width={32}></DynamicImg>
        </div>
        {hint && <div className="dropdownOpen opacity opacityHover" style={{ position: "fixed", left: 0 }} ref={hintDiv}>
            <label>{hint}</label>
        </div>}
    </div>
}