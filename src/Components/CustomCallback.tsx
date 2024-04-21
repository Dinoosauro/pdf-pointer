import Lang from "../Scripts/LanguageTranslations"

interface Props {
    callback?: (e: any) => void,
    identifier: string,
    type: "text" | "number" | "color",
    placeholder?: string
}
/**
 * The input used for a custom value in the dropdowns
 * @param callback what to call when the value changes
 * @param identifier a string used to send the value to the callback
 * @param type the type of the HTML input element
 * @param placeholder if no content is provided, this placeholder will be shown
 * @returns the CustomCallback ReactNode
 */
export default function CustomCallback({ callback, identifier, type, placeholder = Lang("Custom value") }: Props) {
    return <input style={{ backgroundColor: "inherit", marginTop: "10px" }} placeholder={placeholder} type={type} onChange={(e) => { if (callback) callback({ interface: identifier, value: (e.target as HTMLInputElement).value }) }}></input>
}