import { useLayoutEffect, useRef } from "react"

interface Props {
    canvas: HTMLCanvasElement | null,
    pageNumber: number
}
// Create a container for each page thumbnail
export default function ThumbnailContainer({ canvas, pageNumber }: Props) {
    let ref = useRef(null);
    useLayoutEffect(() => {
        ref.current !== null && canvas !== null && (ref.current as HTMLDivElement).prepend(canvas); // Append the provided canvas
    })
    if (canvas === null) return <div></div>
    return <div style={{ padding: "20px", paddingBottom: "5px" }} ref={ref}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%" }}>
            <div style={{ backgroundColor: "var(--accent)", padding: "10px", borderRadius: "50%", width: "25px", height: "25px", display: "table", marginTop: "15px" }}>
                <label style={{ display: "table-cell", verticalAlign: "middle", textAlign: "center" }}>{pageNumber}</label>
            </div>
        </div>
    </div>
}