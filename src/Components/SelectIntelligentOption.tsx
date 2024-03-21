import { CustomOptions, OptionUpdater } from "../Interfaces/CustomOptions"
interface Props {
    identifier: string, // A string that is used only for this list. This string is used as a key for React and for adding custom options from LocalStorage
    pre: CustomOptions[],
    select?: (e: OptionUpdater) => void
}
// Provides a list of items. Used in dropdown menus.
export default function IntelliSelect({ identifier, pre, select }: Props) {
    // Look if in the LocalStorage there are extra values with that identifier, and add them to the list.
    let customVal = localStorage.getItem(`PDFPointer-${identifier}`);
    if (customVal !== null) pre.push(JSON.parse(customVal));
    return <>
        {pre.map(e => <div key={`PDFPointer-${identifier}-${e.name}-${e.value}-Txt`} style={{ marginBottom: "5px" }} className="simplePointer" onClick={() => { if (select) select({ interface: identifier, value: e.value }) }}>{e.name}</div>)}
    </>
}