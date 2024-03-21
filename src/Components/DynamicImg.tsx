interface Props {
    id: string, // The icon ID
    width?: number,
    staticColor?: string
}
let imageStore = new Map<HTMLImageElement, string>(); // Create a Map that'll store the Image element and the string with its ID, so that each icon can be re-generated when the user changes the accent color
import { useEffect, useRef } from "react";
import ImgRef from "../Scripts/ImgReturn";
export function DynamicImg({ id, width = 24, staticColor }: Props) { // Create the image
    let ref = useRef<HTMLImageElement>(null);
    useEffect(() => { ref.current && !staticColor && imageStore.set(ref.current, id) }, []) // If the color is the default one, add it to the Map
    return <img ref={ref} src={URL.createObjectURL(new Blob([ImgRef(id, staticColor)], { type: "image/svg+xml" }))} width={width} height={width}></img>
}
export function GetImages() {
    return imageStore;
}
export function UpdateImages() { // Re-render the icons with the new accent color
    for (let [image, id] of imageStore) {
        URL.revokeObjectURL(image.src);
        image.src = URL.createObjectURL(new Blob([ImgRef(id)], { type: "image/svg+xml" }));
    }

}