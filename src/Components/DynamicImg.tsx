interface Props {
    id: string, // The icon ID
    width?: number,
    staticColor?: string
}
/**
 * Create a Map that'll store the Image element and the string with its ID, so that each icon can be re-generated when the user changes the accent color
 */
let imageStore = new Map<HTMLImageElement, string>();
import { useEffect, useRef } from "react";
import ImgRef from "../Scripts/ImgReturn";
/**
 * Create the image
 * @param id the identifier of the resource
 * @param width the output width
 * @param staticColor the specific color to apply
 * @returns the image ReactNode
 */
export function DynamicImg({ id, width = 24, staticColor }: Props) {
    let ref = useRef<HTMLImageElement>(null);
    useEffect(() => { ref.current && !staticColor && imageStore.set(ref.current, id) }, []) // If the color is the default one, add it to the Map
    return <img ref={ref} src={URL.createObjectURL(new Blob([ImgRef(id, staticColor)], { type: "image/svg+xml" }))} width={width} height={width}></img>
}
/**
 * Gets all the displayed images
 * @returns a Map with the Images ReactNode and their ID
 */
export function GetImages() {
    return imageStore;
}
/**
 * Re-render the icons with the new accent color
 */
export function UpdateImages() {
    for (const [image, id] of imageStore) {
        URL.revokeObjectURL(image.src);
        image.src = URL.createObjectURL(new Blob([ImgRef(id)], { type: "image/svg+xml" }));
    }

}