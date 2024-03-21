import Lang from "../Scripts/LanguageTranslations"

interface Props {
    update: (e: string) => void, // The event to call when the user writes something in the text area
    stop: () => void, // The event to call when the user has finalized the text
    remove: () => void // The event to call if the user wants to remove the element
}
// The alert used when writing text to the PDF
export default function AlertTextDom({ update, stop, remove }: Props) {
    return <>
        <label style={{ marginRight: "10px" }}>{Lang("Write the text:")}</label>
        <textarea style={{ marginRight: "10px" }} onInput={(e) => update((e.target as HTMLInputElement).value)}></textarea>
        <button style={{ width: "fit-content", whiteSpace: "pre", marginRight: "10px" }} onClick={stop}>{Lang("Finalize text")}</button>
        <button style={{ width: "fit-content", whiteSpace: "pre", backgroundColor: "var(--secondstruct)" }} onClick={remove}>{Lang("Remove")}</button>
    </>
}