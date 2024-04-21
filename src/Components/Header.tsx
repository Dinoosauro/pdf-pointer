import { DynamicImg } from "./DynamicImg";
/**
 * The logo and the text of the website
 * @returns the Header ReactNode
 */
export default function header() {
    return <>
        <div className="center">
            <DynamicImg width={48} id="logo"></DynamicImg>
            <h1 style={{ marginLeft: "10px" }}>PDFPointer</h1>
        </div>
    </>
}