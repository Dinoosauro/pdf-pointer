import Lang from "../Scripts/LanguageTranslations"

interface Props {
    callback?: (e: any) => void, // What to call when the value changes
    identifier: string, // A string used to send the value to the callback
    type: "text" | "number" | "color", // The type of the HTML input element
    placeholder?: string
}
// The input used for a custom value in the dropdowns
export default function CustomCallback({ callback, identifier, type, placeholder = Lang("Custom value") }: Props) {
    return <input style={{ backgroundColor: "inherit", marginTop: "10px" }} placeholder={placeholder} type={type} onChange={(e) => { if (callback) callback({ interface: identifier, value: (e.target as HTMLInputElement).value }) }}></input>
}