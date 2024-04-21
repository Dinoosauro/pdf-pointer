interface CreateObj {
    zIndex: number,
    page: number,
}
interface MoveObj {
    move: [number, number],
    canvas: HTMLOrSVGImageElement | null,
    size?: number,
    color: string,
    opacity?: number
}
interface EndMovement {
    canvas: HTMLOrSVGImageElement,
    disappear?: number,
}
interface GetObj {
    page: number,
    returnEverything?: boolean
}
interface TextObj {
    text?: string,
    canvas: HTMLOrSVGImageElement,
    position?: [number, number],
    final?: boolean,
    color: string,
    size: number,
    font: string,
    style: {
        isBold: boolean,
        lineSpacing: number,
        isItalic: boolean,
        isUnderlined: boolean,
        isStriked: boolean,
        lineHeight: number
    }
}
/**
 * Make an element as the same width and height of a canvas model
 * @param canvas the HTMLElement that needs to be updated
 * @param model the canvas that'll be used as a model to update the element
 * @returns the updated HTMLElement
 */
function adaptCanvasSize(canvas: HTMLElement | SVGSVGElement, model: HTMLCanvasElement) {
    canvas.style.width = model.style.width;
    canvas.style.height = model.style.height;
    for (let item of [
        ["height", canvas.tagName.toLowerCase() !== "canvas" ? model.style.height.replace("px", "") : model.height.toString()], // If it's a canvas, follow the height of the drawing. Otherwise, set the displayed height
        ["width", canvas.tagName.toLowerCase() !== "canvas" ? model.style.width.replace("px", "") : model.width.toString()],
        ["stroke-linejoin", "round"],
        ["stroke-linecap", "round"]
    ]) canvas.setAttribute(item[0].toString(), item[1].toString());
    if (model.closest("div")?.querySelector("canvas:not(.hoverCanvas)") !== null) { // Make sure the canvas is centered (especially if the canvas is small enough that the container div still has the "justify-content: center" property)
        // @ts-ignore
        let left = model.closest("div")?.style.justifyContent === "left" ? 0 : (model.closest("div")?.getBoundingClientRect().width - model.closest("div")?.querySelector("canvas:not(.hoverCanvas)")?.getBoundingClientRect().width) / 2;
        if (left > 0) canvas.style.left = `${left}px`;
    }
    return canvas;
}
let canvasLastPosition = new Map<HTMLOrSVGImageElement, [number, number]>(); // A Map that stores the last position of an input on a canvas
let canvasInformationStorage = new Map<HTMLOrSVGImageElement | SVGSVGElement, number>(); // A Map that stores the page the annotation is tied
export default {
    /**
     * Create a new SVG element
     * @param zIndex the zIndex of the new SVG
     * @param page the current page, so that each page will have a different set of SVGs
     * @returns 
     */
    create: ({ zIndex, page = 1 }: CreateObj) => {
        const currentCanvas = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        currentCanvas.classList.add("hoverCanvas");
        currentCanvas.style.zIndex = zIndex.toString();
        canvasInformationStorage.set(currentCanvas, page);
        return currentCanvas;
    },
    /**
 * Make an element as the same width and height of a canvas model
 * @param canvas the HTMLElement that needs to be updated
 * @param model the canvas that'll be used as a model to update the element
 * @returns the updated HTMLElement
 */
    adapt: adaptCanvasSize,
    /**
     * Create a new line that moves to the new point
     * @param canvas the SVG element where the line will be drawn
     * @param move a [number, number] object with the X and Y coords of the clicked point
     * @param size the pen size
     * @param color the pen color
     * @param opacity the pen opacity
     */
    move: ({ canvas, move, size = 5, color, opacity = 1 }: MoveObj) => {
        if (canvas !== null) {
            const lastPosition = canvasLastPosition.get(canvas); // Get the previous location
            if (lastPosition && lastPosition[0] !== -1) { // Got a valid value
                if ((color ?? "") === "") color = getComputedStyle(document.body).getPropertyValue("--accent"); // Fix for both nullish values and in case an empty string is passed. 
                const newLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                for (const item of [
                    ["x1", Math.floor(lastPosition[0] / (window.devicePixelRatio || 1))],
                    ["y1", Math.floor(lastPosition[1] / (window.devicePixelRatio || 1))],
                    ["x2", Math.floor(move[0] / (window.devicePixelRatio || 1))],
                    ["y2", Math.floor(move[1] / (window.devicePixelRatio || 1))],
                    ["style", `stroke:${color};stroke-width:${size}`],
                    ["data-x", `${Math.floor(lastPosition[0] / (window.devicePixelRatio || 1) / 10)}`], // Used for erase options. See PdfUI for more.
                    ["data-y", `${Math.floor(lastPosition[1] / (window.devicePixelRatio || 1) / 10)}`], // Used for erase options. See PdfUI for more.
                    ["opacity", opacity]
                ]) newLine.setAttribute(item[0].toString(), item[1].toString());
                canvas.append(newLine);
                canvasLastPosition.set(canvas, move);
            } else if (!lastPosition) { // It's the first point for the annotation
                canvasLastPosition.set(canvas, move);
            }
        }
    },
    /**
     * Write text into the SVG element
     * @param canvas the SVG element where text will be written
     * @param text the text to write. If undefined, it'll be automatically fetched from the previous text written
     * @param position a [number, number] array containing the X and Y coords of the start of the text
     * @param final if true, the text will be marked as final, and the rectangle around it will disappear
     * @param color the color of the text
     * @param size the size of the text
     * @param font the font of the text
     * @param style an object with some other style options (bold, underline etc.)
     */
    write: ({ canvas, text, position, final, color, size, font, style }: TextObj) => {
        position ? canvasLastPosition.set(canvas, position) : position = canvasLastPosition.get(canvas); // If the position hasn't been provided, try getting it from the previous values
        if (!position) position = [15 * (window.devicePixelRatio || 1), 15 * (window.devicePixelRatio || 1)]; // If the position has never been specified, put it at the top
        const textObj = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        for (let prop of [
            ["x", position[0] / (window.devicePixelRatio || 1)],
            ["y", position[1] / (window.devicePixelRatio || 1)],
            ["fill", color],
            ["font-size", `${size}px`],
            ["data-x", `${Math.floor(position[0] / (window.devicePixelRatio || 1) / 10)}`],
            ["data-y", `${Math.floor(position[1] / (window.devicePixelRatio || 1) / 10)}`]
        ]) textObj.setAttribute(prop[0].toString(), prop[1].toString());
        // Update font properties 
        textObj.style.fontFamily = font;
        if (style.isBold) textObj.setAttribute("font-weight", "bold");
        if (style.isItalic) textObj.setAttribute("font-style", "italic");
        if (style.isUnderlined || style.isStriked) textObj.setAttribute("text-decoration", `${style.isUnderlined ? "underline" : ""}${style.isUnderlined && style.isStriked ? " " : ""}${style.isStriked ? "line-through" : ""} ${style.lineHeight}px`)
        // Get the previous text. If it hasn't been provided, get it by mapping the children text spans with a querySelector.
        for (let line of (text ?? (canvas.querySelectorAll("text > tspan").length === 0 ? "" : Array.from(canvas.querySelectorAll("text > tspan")).map(e => `${e.textContent}`).join("\n"))).split("\n")) {
            let span = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
            for (let prop of [["dy", `${style.lineSpacing}em`], ["x", position[0] / (window.devicePixelRatio || 1)]]) span.setAttribute(prop[0].toString(), prop[1].toString());
            span.textContent = line === "" ? " " : line;
            textObj.append(span);
        }
        canvas.innerHTML = ""; // Delete every text before
        canvas.append(textObj); // And append the new text
        if (!final) { // Create a rectangle that shows the text that is being currently edit
            let rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            for (const prop of [
                ["x", textObj.getBBox().x - 15],
                ["y", textObj.getBBox().y - 15],
                ["fill", "transparent"],
                ["width", textObj.getBBox().width + 30],
                ["height", textObj.getBBox().height + 30],
                ["style", "stroke:black;stroke-width:5"]
            ]) rect.setAttribute(prop[0].toString(), prop[1].toString());
            canvas.append(rect);
        }

    },
    /**
     * Finish editing a SVG element
     * @param canvas the SVG element to mark as ended
     * @param disappear the number of ms to wait before deleting the canvas
     */
    end: ({ canvas, disappear }: EndMovement) => {
        canvasLastPosition.set(canvas, [-1, -1]); // By setting points as a negative number, no edits will be done to the canvas. 
        if (disappear !== undefined) setTimeout(() => { // Set up the timer to delete the content
            canvas.style.opacity = "0";
            canvasLastPosition.delete(canvas);
            canvasInformationStorage.delete(canvas);
            setTimeout(() => { canvas.remove() }, 300);
        }, disappear)

    },
    /**
     * Return the annotations that are in the DOM. If a page is provided, and it hasn't been asked to return everything, filter the selection
     * @param page the requested page. This field is ignored if `returnEverything` is set to true
     * @param returnEverything if all the annotation shouold be returned
     * @returns A Map, or an Array, with the SVG canvas and the page it refers to
     */
    get: ({ page, returnEverything }: GetObj) => {
        return returnEverything ? canvasInformationStorage : Array.from(canvasInformationStorage).filter(val => val[1] === page);
    }
}