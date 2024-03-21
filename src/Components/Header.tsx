import { DynamicImg } from "./DynamicImg";
export default function header() {
    return <>
        <div className="center">
            <DynamicImg width={48} id="logo"></DynamicImg>
            <h1 style={{ marginLeft: "10px" }}>PDFPointer</h1>
        </div>
    </>
}