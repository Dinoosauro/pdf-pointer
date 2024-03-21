import { ReactNode, useEffect, useLayoutEffect, useRef } from "react";
import BackgroundManager from "../Scripts/BackgroundManager";

interface Props {
    children: ReactNode,
    type?: -1 | 0 | 1 // Change card color (-1: background | 0: firststruct | 1: secondstruct)
    zIndex?: number // Used so that toolbar dropdowns are over both the canvas events and the canvas annotations
}
export default function Card({ children, type = 0, zIndex }: Props) {
    let ref = useRef<HTMLDivElement>(null);
    useLayoutEffect(() => {
        if (ref.current && type !== -1) BackgroundManager.updateCard(ref.current, type === 1 ? "var(--secondstruct)" : "var(--firststruct)");
    }, [])
    let suggestedColor = localStorage.getItem("PDFPointer-BackgroundOptions") === null || type === -1 ? type === 1 ? "var(--secondstruct)" : type === -1 ? "var(--background)" : "var(--firststruct)" : "";
    /*
        The structure is as it follows:
            * Card div: Apply the card styling. If type is zero, a Card container, with backdrop effects, will be generated.
                * cardContainer: Apply the backdrop filter using the after pseudo-class. This is done so that Chromium-based browsers will also render the backdrop filter on dropdown menus
                    * Content container div: The div that'll contain the elements. Background color is added as a fallback, in case the user hasn't chosen a custom media as wallpaper, and zIndex must be set to 1 so that the :after pseudo-class won't be over that content.
    */
    return <>
        <div ref={ref} className="card" style={{ backgroundColor: suggestedColor, zIndex: zIndex, maxHeight: "80vh", overflow: type === 0 ? "auto" : undefined }}>
            <div className={type !== -1 ? "cardContainer" : ""} style={{ padding: localStorage.getItem("PDFPointer-BackgroundOptions") === null ? undefined : "10px" }}>
                <div style={{ zIndex: type !== -1 ? 1 : undefined, position: "relative", padding: type === 0 ? "20px" : "", backgroundColor: suggestedColor }}>
                    {children}
                </div>
            </div>
        </div>
    </>
}