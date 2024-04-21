import { useEffect, useRef } from "react"
import Card from "./Card"

interface Props {
    list: {
        displayedName: string,
        id: string
    }[],
    callback: (callbackId: string) => void,
    invertColors?: boolean
}
/**
 * A Section component is a component that permits horizontal scrolling between tabs
 * @param list an object array that contains a `displayedName` property, for the name that'll be displayed in the DOM, and an ID, used for the callback
 * @param callback the function that'll be called when the selection changes
 * @returns 
 */
export default function Sections({ list, callback, invertColors }: Props) {
    let mainContainer = useRef<HTMLDivElement>(null)
    /**
     * Move the line to where it was clicked
     * @param clicked the item that was clicked
     */
    function updateLine(clicked: HTMLElement) {
        const totalRect = mainContainer.current?.getBoundingClientRect();
        const line = mainContainer.current?.querySelector(".moveLine") as HTMLElement | null;
        const rect = (clicked?.querySelector("span") ? clicked.querySelector("span") : clicked)?.getBoundingClientRect();
        if (line && totalRect && rect) {
            line.style.left = `${rect.left - totalRect.left + (mainContainer.current?.scrollLeft ?? 0)}px`;
            line.style.width = `${rect.width}px`;
        }
    }
    useEffect(() => { // Click on the first span to update the width of the line
        if (mainContainer.current) {
            mainContainer.current.querySelector("span")?.click();
        }
    }, [])
    return <div className="moveCard" style={{ backgroundColor: invertColors ? "var(--firststruct)" : undefined }}>
        <div ref={mainContainer} className="flex sectionAdapt" style={{ position: "relative" }}>
            {list.map(item => <span key={`TalkTime-SettingsPanelSelection-${item.id}`} onClick={(e) => { updateLine(e.target as HTMLElement); callback(item.id) }}><div className="moveCard simplePointer" style={{ backgroundColor: invertColors ? "var(--secondstruct)" : "var(--firststruct)", marginRight: "10px" }}><span style={{ whiteSpace: "nowrap" }}>{item.displayedName}</span></div></span>)}
            <div className="moveLine"></div>
        </div>
    </div >
}