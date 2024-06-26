import * as PDFJS from "pdfjs-dist";
import { useEffect, useRef, useState } from "react";
import Annotations from "../Scripts/Annotations";
import Toolbar from "./Toolbar";
import { DrawingStoredOptions, OptionUpdater, KeyPreference, PdfUIState } from "../Interfaces/CustomOptions";
import Thumbnail from "./GetThumbnail";
import { createRoot } from "react-dom/client";
import AlertTextDom from "./AlertTextDom";
import AlertManager from "../Scripts/AlertManager";
import RerenderButtons from "../Scripts/RerenderButtons";
import CircularButtonsFunctions from "../Scripts/CircularButtonsFunctions";
import Dialog from "./Dialog";
import Lang from "../Scripts/LanguageTranslations";
import ExportDialog from "./ExportDialog";
interface Props {
    pdfObj?: PDFJS.PDFDocumentProxy,
    imgObj?: HTMLImageElement
}
interface Ref {
    mainCanvas: HTMLCanvasElement | null, // The canvas where the PDF will be drawn
    centerDiv: HTMLDivElement | null, // The div that'll center the canvas on the card
    hoverCanvas: HTMLCanvasElement | null, // The canvas where all the events will be triggered
    toolbar: HTMLDivElement | null, // Unused
    circleCanvas: HTMLDivElement | null, // The div that'll represent the pointer. Called "canvas" since at the beginning it was another canvas
    thumbnailDiv: HTMLDivElement | null // The div that'll contain the thumbnail
}
interface MouseMove {
    target: HTMLCanvasElement,
    clientX: number,
    clientY: number
}
/**
 * The PDF main UI
 * @param pdfObj the PDF.JS Object
 * @returns the PDF Main UI ReactNode
 */
export default function PDF({ pdfObj, imgObj }: Props) {
    /**
     *  @var mainCanvas The canvas where the PDF will be drawn
     *  @var centerDiv The div that'll center the canvas on the card
     *  @var hoverCanvas The canvas where all the events will be triggered
     *  @var toolbar Unused
     *  @var circleCanvas The div that'll represent the pointer. Called "canvas" since at the beginning it was another canvas
     *  @var thumbnailDiv The div that'll contain the thumbnail
     */
    let canvasRef = useRef<Ref>({ mainCanvas: null, centerDiv: null, hoverCanvas: null, toolbar: null, circleCanvas: null, thumbnailDiv: null });
    let [pageSettings, updatePage] = useState<PdfUIState>({ page: 1, scale: 1, showThumbnail: 0, isFullscreenChange: document.fullscreenElement, langUpdate: 0, requestedTabPart: "hello" });
    let customModes = useRef({
        isEraserEnabled: false,
        isPenEnabled: false,
        isTextEnabled: false,
        isTextInCreation: false
    });
    /**
    * If true, a PDF operation is in progress, and therefore further requests must be dropped
    */
    let isCanvasWorking = useRef<boolean>(false);
    /**
    * The initial zIndex for the canvas
    */
    let zIndex = useRef<number>(2);
    /**
    * A string that'll contain details about the PDF page and zoom. This will be compared so that the app will know if it's time to re-render the canvas or not.
     */
    let currentPdfShow = useRef<string>("");
    let userDrawingOptionsManager = useRef<DrawingStoredOptions>((() => {
        let obj: DrawingStoredOptions = {
            timer: 15000,
            size: 5,
            cursorColor: getComputedStyle(document.body).getPropertyValue("--accent"),
            cursorSize: 40,
            penColor: getComputedStyle(document.body).getPropertyValue("--accent"),
            textSize: 25,
            textFont: "Work Sans",
            textLineSpace: 1.2,
            textStrikeLineWidth: 4,
            penOpacity: 1

        }
        try {
            let parse = JSON.parse(localStorage.getItem("PDFPointer-UserAnnotationSettings") ?? ""); // Update the persistent drawing options 
            // @ts-ignore
            for (let key in parse) if (obj[key] !== undefined && typeof obj[key] === typeof parse[key]) obj[key] = parse[key]; // Keep only the key that are of the same type
        } catch (ex) {
            console.warn({
                type: "FirstUser",
                desc: "No previous drawing options found",
                gravity: -1,
                ex: ex
            })
        }

        return obj;
    })())
    let tempUserDrawingOptions = useRef({
        isBold: false,
        isItalic: false,
        isUnderlined: false,
        isStriked: false,
        negativeFilter: 0,
        hueInversionFilter: 0,
        sepiaFilter: 0,
        grayscaleFilter: 0

    })
    /**
     * The keyboard items that the user has pressed, but not released
     */
    let userBtnPressed = useRef<string[]>([]);
    function getTextAttributes() { // A function that will return the styles of the text tool, so that they must not be added each time.
        return { color: userDrawingOptionsManager.current.penColor, size: userDrawingOptionsManager.current.textSize, font: userDrawingOptionsManager.current.textFont, style: { lineSpacing: userDrawingOptionsManager.current.textLineSpace, ...tempUserDrawingOptions.current, lineHeight: userDrawingOptionsManager.current.textStrikeLineWidth } }
    }

    useEffect(() => {
        if (isCanvasWorking.current || currentPdfShow.current === `${pageSettings.page}-${pageSettings.scale}-${pageSettings.isFullscreenChange}`) return;
        // Create a spinner for loading info
        const div = document.createElement("div");
        createRoot(div).render(<div className="spinner" style={{ width: window.innerWidth > window.innerHeight ? "30vh" : "30vw", height: window.innerWidth > window.innerHeight ? "30vh" : "30vw" }}></div>)
        div.classList.add("simpleFixed", "simpleCenter", "noEvents");
        document.body.append(div);
        (async () => {
            /**
             * Scale all the drawing canvases so that they have the same width/height of the PDF/Image canvas
             * @param width the new width of the canvas
             */
            function adaptDrawCanvas(width: number) {
                if (!canvasRef.current.centerDiv) return;
                for (let annotation of Annotations.get({ page: 1, returnEverything: true })) annotation[0].style.display = annotation[1] === pageSettings.page ? "block" : "none"; // Show only the annotations of the page. Note that the "page" key will be ignored, and any value would be okay.
                for (let dom of document.querySelectorAll(".hoverCanvas")) { // Fix multiple canvas on top of another
                    let newCanvas = dom as SVGSVGElement;
                    newCanvas.style.transformOrigin = "top-left";
                    if (dom.getAttribute("data-noresize") === null) newCanvas.style.transform = `scale(${Math.floor(width) / parseInt(newCanvas.getAttribute("width") ?? "1")})`;
                    if (canvasRef.current.mainCanvas) newCanvas.style.left = canvasRef.current.centerDiv.style.justifyContent === "center" ? `${(canvasRef.current.centerDiv.getBoundingClientRect().width - canvasRef.current.mainCanvas.getBoundingClientRect().width) / 2}px` : "0px";
                }
            }
            if (canvasRef.current && canvasRef.current.centerDiv && canvasRef.current.mainCanvas) {
                /**
                 * Change the canvas width/height, by keeping in mind high-density displays. If possible, content is also centered
                 * @param width the desired width
                 * @param height the desired height
                 */
                function adaptCanvasSize(width: number, height: number) {
                    if (!canvasRef.current.mainCanvas || !canvasRef.current.centerDiv) return;
                    canvasRef.current.mainCanvas.width = Math.floor(width * outputScale);
                    canvasRef.current.mainCanvas.height = Math.floor(height * outputScale);
                    canvasRef.current.centerDiv.style.justifyContent = width > canvasRef.current.centerDiv.getBoundingClientRect().width ? "left" : "center"; // Make "justifyContent" left so that content isn't trimmed
                    canvasRef.current.mainCanvas.style.width = Math.floor(width) + "px";
                    canvasRef.current.mainCanvas.style.height = Math.floor(height) + "px";
                }
                const outputScale = window.devicePixelRatio || 1;
                /**
                 * Get the scale of the new item
                 * @param height the standard height of the resource
                 * @returns a number with the scale to apply
                 */
                const getScale = (height: number) => pageSettings.isFullscreenChange ? window.innerHeight / height * pageSettings.scale : pageSettings.scale;
                if (!pdfObj) { // The provided content should be an image
                    if (imgObj) { // Add a dobule check, so that, even if this wasn't the case for some strange reason, the script will return nothing.
                        adaptCanvasSize(imgObj.width * getScale(imgObj.height), imgObj.height * getScale(imgObj.height));
                        adaptDrawCanvas(imgObj.width * getScale(imgObj.height));
                        const context = canvasRef.current.mainCanvas.getContext("2d");
                        context && context.drawImage(imgObj, 0, 0, context.canvas.width, context.canvas.height);
                    }
                    div.remove();
                    return;
                }
                isCanvasWorking.current = true; // Avoid multiple PDF operations
                // Render the PDF
                const pdfPage = await pdfObj.getPage(pageSettings.page);
                const viewport = pdfPage.getViewport({ scale: getScale(pdfPage.getViewport({ scale: 1 }).height) }); // If it's in fullscreen mode, the 100% zoom must fill the window height
                adaptCanvasSize(viewport.width, viewport.height);
                adaptDrawCanvas(viewport.width);
                const context = canvasRef.current.mainCanvas.getContext("2d");
                if (context !== null) {
                    let render = pdfPage.render({
                        canvasContext: context,
                        viewport: viewport,
                        transform: outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined
                    });
                    await render.promise;
                    currentPdfShow.current = `${pageSettings.page}-${pageSettings.scale}-${pageSettings.isFullscreenChange}`;
                    isCanvasWorking.current = false;
                }
            }
            div.remove();
        })()
        let fixCircleCanvas = setInterval(() => { // It actually should be immediately cleared. However, adapt the other canvases by setting them to the same width and height as the model
            let canvas = document.querySelector("canvas:not(.hoverCanvas)");
            if (canvas && canvasRef.current.hoverCanvas) {
                Annotations.adapt(canvasRef.current.hoverCanvas, (canvas as HTMLCanvasElement));
                clearInterval(fixCircleCanvas);
            }
        }, 25);

    }, [pageSettings.page, pageSettings.scale, pageSettings.isFullscreenChange]);
    useEffect(() => {
        window.addEventListener("resize", () => {
            if (canvasRef.current.centerDiv && canvasRef.current.mainCanvas) {
                canvasRef.current.centerDiv.style.justifyContent = parseInt(canvasRef.current.mainCanvas.style.width.replace("px", "")) > canvasRef.current.centerDiv.getBoundingClientRect().width ? "left" : "center"; // Update the toolbar center so that no buttons are cut
                for (let item of canvasRef.current.centerDiv.querySelectorAll("canvas.hoverCanvas,svg")) { // Move the canvases (or annotations) so that they are always on top of another
                    (item as HTMLElement).style.left = `${canvasRef.current.centerDiv.style.justifyContent === "left" ? 0 : (canvasRef.current.centerDiv.getBoundingClientRect().width - canvasRef.current.mainCanvas.getBoundingClientRect().width) / 2}px`;
                }
            }
        });
        window.addEventListener("fullscreenchange", async (e) => { // Re-render the PDF with the new scaling options
            updatePage(prevState => { return { ...prevState, isFullscreenChange: document.fullscreenElement } });
            window.dispatchEvent(new Event("resize"));
        })
    }, [])
    let mouseDown: boolean | [number, number] = false; // It'll contain the x and y position of the mouse
    let currentCanvas: HTMLOrSVGImageElement | undefined;
    useEffect(() => {
        let item = document.querySelector(".backgroundContent");
        item && item.parentElement?.className !== "card" && document.querySelector(".card")?.append(item); // Move the background content to the "card" div if it's not already there, so that the background will be visible also in fullscreen mode (that is triggered only on the card div)
    })
    function stopCanvasEditing() { // Stop mouse annotations, and start the erase timer
        mouseDown = false;
        if (currentCanvas !== undefined && !customModes.current.isEraserEnabled && !customModes.current.isTextEnabled) Annotations.end({ canvas: currentCanvas, disappear: userDrawingOptionsManager.current.timer })
    }
    useEffect((() => {
        let getContainer = document.querySelector(".thumbnailContainer");
        if (pageSettings.showThumbnail === 2 && getContainer) { // If the "showThumbnail" value is set to 2, the thumbnail div must be hidden. An animation will be run, and after its value will be updated to 0 (not in the DOM).
            (getContainer as HTMLDivElement).classList.add("reverseLeftAnimation");
            new Promise((resolve) => setTimeout(() => resolve(""), 150)).then(() => updatePage(prevState => { return { ...prevState, showThumbnail: 0 } }))
        }
    }), [pageSettings.showThumbnail])
    /**
     * Create a new SVG element (that was previously a canvas. I know, lots of things here needs to be renamed.)
     */
    function createCanvas() {
        if (isCanvasWorking.current || customModes.current.isEraserEnabled) return;
        if (canvasRef.current.mainCanvas !== null) currentCanvas = Annotations.adapt(Annotations.create({ zIndex: zIndex.current, page: pageSettings.page }), canvasRef.current.mainCanvas) as HTMLOrSVGImageElement; // Create a new SVG element, and make it the same width/height as of the current canvas
        zIndex.current++;
        if (canvasRef.current.centerDiv !== null && currentCanvas !== undefined) canvasRef.current.centerDiv.append(currentCanvas);
    }
    /**
     * Send to the Annotation script a request to change the style of the text (that'll be automatically fetched)
     */
    function triggerTextChange() {
        if (customModes.current.isTextInCreation && currentCanvas) Annotations.write({ canvas: currentCanvas, ...getTextAttributes() });
    }
    /**
     * The event triggered when the mouse is moved, so that it can be called also for touch events
     * @param e the mouse event, or an object with the "target", "clientX" and "clientY" properties
     */
    function mouseMove(e: MouseMove) {
        let target = e.target as HTMLCanvasElement;
        mouseDown = [(e.clientX - (currentCanvas ?? target).getBoundingClientRect().left) * (window.devicePixelRatio || 1), (e.clientY - (currentCanvas ?? target).getBoundingClientRect().top) * (window.devicePixelRatio || 1)]; // Calculate the relative X and Y positions 
        let targetDown = [(e.clientX - target.getBoundingClientRect().left) * (window.devicePixelRatio || 1), (e.clientY - target.getBoundingClientRect().top) * (window.devicePixelRatio || 1)]; // Used for the eraser
        if (canvasRef.current.circleCanvas) { // Move the circle div
            canvasRef.current.circleCanvas.style.top = `${e.clientY - (userDrawingOptionsManager.current.cursorSize / 2)}px`;
            canvasRef.current.circleCanvas.style.left = `${e.clientX - (userDrawingOptionsManager.current.cursorSize / 2)}px`;
        }
        if (customModes.current.isEraserEnabled && mouseDown) { // Look for items to delete
            for (let svg of document.querySelectorAll(".hoverCanvas:not([data-noresize])")) {
                // Basically, the data-x and data-y attributes are calculated by [real canvas width or height / 10]. In this way, it does not require real precision
                if (svg.querySelector(`[data-x='${Math.floor(targetDown[0] / (window.devicePixelRatio || 1) / 10 * (parseInt(svg.getAttribute("width") ?? "1") / parseInt(canvasRef.current.mainCanvas?.style.width.replace("px", "") ?? "1")))}']`) !== null && svg.querySelector(`[data-y='${Math.floor(targetDown[1] / (window.devicePixelRatio || 1) / 10 * (parseInt(svg.getAttribute("width") ?? "1") / parseInt(canvasRef.current.mainCanvas?.style.width.replace("px", "") ?? "1")))}']`) !== null) {
                    if (svg.getAttribute("data-delete") === null) svg.setAttribute("data-delete", "a"); else continue; // Set the item state as deleted
                    (svg as HTMLElement).style.opacity = "0";
                    setTimeout(() => {
                        svg.remove();
                    }, 250);
                }
            }
            return;
        }
        if (!mouseDown || currentCanvas === undefined || !customModes.current.isPenEnabled || customModes.current.isTextEnabled) return; // No appropriate operations are being done
        Annotations.move({ canvas: currentCanvas, move: mouseDown, size: userDrawingOptionsManager.current.size, color: userDrawingOptionsManager.current.penColor, opacity: userDrawingOptionsManager.current.penOpacity });

    }
    function onMouseDown() {
        mouseDown = true;
        if (!customModes.current.isTextEnabled) createCanvas(); else if (!customModes.current.isTextInCreation) { // If another text is not being created, create a new one
            customModes.current.isTextInCreation = true;
            AlertManager.simpleDelete().then(() => { // Delete other alerts
                createCanvas();
                // Render the AlertTextDom
                let createText = document.createElement("div");
                createText.classList.add("alert");
                createRoot(createText).render(<AlertTextDom stop={() => {
                    if (currentCanvas) {
                        Annotations.write({ canvas: currentCanvas, final: true, ...getTextAttributes() });
                        if (currentCanvas) Annotations.end({ canvas: currentCanvas, disappear: userDrawingOptionsManager.current.timer });
                        customModes.current.isTextInCreation = false;
                    }
                    AlertManager.simpleDelete();
                }} remove={() => {
                    if (currentCanvas) Annotations.end({ canvas: currentCanvas, disappear: 1 });
                    AlertManager.simpleDelete();
                    customModes.current.isTextInCreation = false;

                }} update={(e) => { if (currentCanvas) Annotations.write({ canvas: currentCanvas, text: e, ...getTextAttributes() }) }}></AlertTextDom>);
                setTimeout(() => createText.style.opacity = "1", 25);
                (document.querySelector(".card") ?? document.body).append(createText); // Prefer adding it in the main card so that alerts are shown also on full screen mode (that is called on the .card item)
            })
        }
    }
    useEffect(() => {
        window.onkeyup = (e) => {
            while (userBtnPressed.current.indexOf(e.key.toLowerCase()) !== -1) userBtnPressed.current.splice(userBtnPressed.current.indexOf(e.key.toLowerCase()), 1); // If the user keeps pressed a key for too long, multiple "onkeydown" events will be triggered. In this way, when the user releases the key, every instance of that key is deleted.
        }
        window.onkeydown = (e) => { // Add keyboard shortcuts
            e.preventDefault();
            if (document.activeElement?.tagName.toLowerCase() === "textarea" || document.activeElement?.tagName.toLowerCase() === "input" || document.activeElement?.tagName.toLowerCase() === "select" || document.activeElement?.getAttribute("data-nokeyboard") === "a") return; // Avoid processing keyboard shortcuts if the user is writing something
            const KeyPreference = JSON.parse(localStorage.getItem("PDFPointer-KeyboardPreferences") ?? "{}") as KeyPreference;
            userBtnPressed.current.push(e.key.toLowerCase());
            lookFunction: for (const tempAction in KeyPreference) {
                const action = tempAction as keyof KeyPreference;
                for (let item of (KeyPreference[action] ?? [])) if (userBtnPressed.current.indexOf(item) === -1) continue lookFunction;
                switch (action) {
                    case "fullscreen": {
                        CircularButtonsFunctions.fullscreen();
                        return;
                    }
                    case "settings": {
                        CircularButtonsFunctions.settings(updatePage);
                        return;
                    }
                    case "stop": { // Stop everything is being done. Useful if this """flawless""" logic fails [and I wouldn't be surprised if it does]
                        customModes.current.isEraserEnabled = false;
                        customModes.current.isPenEnabled = false;
                        customModes.current.isTextEnabled = false;
                        updatePage(prevState => { return { ...prevState, requestedTabPart: `hello,${Date.now()}` } }); // Update the requestedTabPart so that the Toolbar tab will be set to the default one. A date is added to force the refresh.
                        for (let item of ["text", "pen", "erase"]) RerenderButtons.update(item, customModes.current[`is${item === "text" ? "Text" : item === "pen" ? "Pen" : "Eraser"}Enabled`]); // Update all the circular buttons that have a shortcut
                        return;
                    }
                    case "export": {
                        let div = document.createElement("div");
                        createRoot(div).render(<Dialog>
                            <h2>{Lang("Save PDF as an image:")}</h2>
                            <ExportDialog imgObj={imgObj} pdfObj={pdfObj}></ExportDialog>
                        </Dialog>);
                        document.body.append(div);
                        return;
                    }
                }
                updatePage(prevState => {
                    let currentThumbnail = 0;
                    currentThumbnail = action === "thumbnail" ? (prevState.showThumbnail === 1 ? 2 : 1) : prevState.showThumbnail;
                    setTimeout(() => action === "thumbnail" && RerenderButtons.update("thumbnail", currentThumbnail === 1), 150); // Avoid errors for rendering two states at the same time
                    return { ...prevState, page: action === "prevpage" && prevState.page !== 1 ? prevState.page -= 1 : action === "nextpage" && (pdfObj?.numPages ?? -1) > prevState.page ? prevState.page += 1 : prevState.page, scale: action === "zoomin" ? prevState.scale *= 1.2 : action === "zoomout" ? prevState.scale /= 1.2 : prevState.scale, requestedTabPart: prevState.requestedTabPart === "hello" ? action === "pointer" ? `circle,${Date.now()}` : action === "pen" || action === "text" ? `${action},${Date.now()}` : prevState.requestedTabPart : "hello", showThumbnail: currentThumbnail }
                });
                if (action === "text" || action === "pointer" || action === "pen" || action === "erase") {
                    if ((action === "text" || action === "pointer")) customModes.current.isPenEnabled = false; // Disable pen mode for pointer and text editing
                    if (action === "pen" || action === "pointer") customModes.current.isTextEnabled = false; // Disable text prompt for pointer and pen editing
                    if (action === "pen") customModes.current.isPenEnabled = !customModes.current.isPenEnabled; // Toggle pen editing
                    if (action === "text") customModes.current.isTextEnabled = !customModes.current.isTextEnabled; // Toggle text editing
                    customModes.current.isEraserEnabled = action === "erase" ? !customModes.current.isEraserEnabled : false; // Toggle eraser if that action is selected, otherwise disable it
                    RerenderButtons.update("erase", customModes.current.isEraserEnabled); // Update the eraser button, since for sure it has been modified
                    (action === "pen" || action === "text") && RerenderButtons.update(action, customModes.current[`is${action === "text" ? "Text" : "Pen"}Enabled`]); // And update also the other button that might have been modified
                }
                break;
            }
        }
    }, [])
    return <>
        <Toolbar imgObj={imgObj} requestedTab={pageSettings.requestedTabPart} pdfObj={pdfObj} pageSettings={pageSettings} updatePage={updatePage} settingsCallback={(e: OptionUpdater) => {
            /**
                The following map includes all the events that will update user values. 
                    @var "isUtils" means that the "customModes.current" object will updated;
                    @var "isTemp" means that the "tempUserDrawingOptions" will be updated. "trigger"
                    @var "ref" is the property to update
                    @var "triggerText" asks for the re-render of the current text
                    @var "filter" indicates that the canvas filter must be updated
            */
            let updateMap = new Map([
                ["CustomSelectSize", { ref: "size", triggerText: true }],
                ["CustomTextSize", { ref: "textSize", triggerText: true }],
                ["CustomCursorColorSelect", { ref: "cursorColor" }],
                ["CustomCursorSize", { ref: "cursorSize" }],
                ["CustomPenColorSelect", { ref: "penColor", triggerText: true }],
                ["EraserChanged", { ref: "isEraserEnabled", isUtils: true }],
                ["ChangedPenStatus", { ref: "isPenEnabled", isUtils: true }],
                ["TextFontUpdater", { ref: "textFont", triggerText: true }],
                ["TextBoldChanged", { ref: "isBold", triggerText: true, isTemp: true }],
                ["TextLineSpaceChanged", { ref: "textLineSpace", triggerText: true }],
                ["TextItalicChanged", { ref: "isItalic", triggerText: true, isTemp: true }],
                ["TextUnderlineChanged", { ref: "isUnderlined", triggerText: true, isTemp: true }],
                ["TextStrikeChanged", { ref: "isStriked", triggerText: true, isTemp: true }],
                ["TextStrikeLineChange", { ref: "textStrikeLineWidth", triggerText: true }],
                ["ChangePenOpacity", { ref: "penOpacity" }],
                ["NegativeFilter", { ref: "negativeFilter", isTemp: true, filter: true }],
                ["HueInversionFilter", { ref: "hueInversionFilter", isTemp: true, filter: true }],
                ["SepiaFilter", { ref: "sepiaFilter", isTemp: true, filter: true }],
                ["GrayscaleFilter", { ref: "grayscaleFilter", isTemp: true, filter: true }]
            ])
            switch (e.interface) {
                case "CustomSelectTimer": // Update the timer length, by converting it in seconds
                    userDrawingOptionsManager.current.timer = (isNaN(+e.value) ? 150 : +e.value) * 1000;
                    break;
                case "ChangedTextStatus": // The user has entered or exited in the text mode. Update the values of some properties to their default ones to avoid UI issues
                    customModes.current.isTextEnabled = !customModes.current.isTextEnabled;
                    // @ts-ignore
                    for (let item of ["isBold", "isItalic", "isUnderlined", "isStriked"]) tempUserDrawingOptions.current[item] = false;
                    triggerTextChange();
                    break;
                default:
                    let updateItem = updateMap.get(e.interface);
                    /**
                     * Convert value to the same type of the output
                     * @param source the input value
                     * @param value the value to convert
                     * @returns the converted value
                     */
                    function getValue({ source, value }: { source: string | boolean | number, value: string }) {
                        if (typeof source === "boolean") return !source;
                        if (typeof source === "number") return +value;
                        return value;
                    }
                    if (updateItem) {
                        // @ts-ignore | Update each object with the correct value, and save them in their appropriate storage
                        updateItem.isUtils ? customModes.current[updateItem.ref] = getValue({ source: customModes.current[updateItem.ref], value: e.value }) : updateItem.isTemp ? tempUserDrawingOptions.current[updateItem.ref] = getValue({ source: tempUserDrawingOptions.current[updateItem.ref], value: e.value }) : userDrawingOptionsManager.current[updateItem.ref] = getValue({ source: userDrawingOptionsManager.current[updateItem.ref], value: e.value });
                        updateItem.triggerText && triggerTextChange();
                        localStorage.setItem("PDFPointer-UserAnnotationSettings", JSON.stringify(userDrawingOptionsManager.current));
                        sessionStorage.setItem("PDFPointer-UserTempSettings", JSON.stringify(tempUserDrawingOptions.current)) // Note that this is only used to recover the PDF filters value. Temp values are never restored.
                        if (updateItem.filter && canvasRef.current.mainCanvas) canvasRef.current.mainCanvas.style.filter = `invert(${tempUserDrawingOptions.current.negativeFilter}) hue-rotate(${tempUserDrawingOptions.current.hueInversionFilter}deg) sepia(${tempUserDrawingOptions.current.sepiaFilter}) grayscale(${tempUserDrawingOptions.current.grayscaleFilter})`; // Update the canvas filters
                    }
                    break;
            }
            localStorage.setItem("PDFPointer-UserAnnotationSettings", JSON.stringify(userDrawingOptionsManager.current));
        }}></Toolbar>
        <br></br>
        <div style={{ overflow: "auto" }}>
            <div className="center" ref={el => (canvasRef.current.centerDiv = el)} style={{ overflow: "auto hidden" }}>
                <canvas key="PDFCanvas" ref={el => (canvasRef.current.mainCanvas = el)}></canvas>
                <div className="cursor" data-noresize key={"PDFCanvasCircle"} ref={el => (canvasRef.current.circleCanvas = el)}></div>
                <canvas style={{ zIndex: 999990, cursor: "none" }} key="PDFCanvasEvents" className="hoverCanvas" ref={el => (canvasRef.current.hoverCanvas = el)} data-noresize onMouseDown={(e) => onMouseDown()} onTouchStart={() => {
                    // Disable (or enable) standard touch actions so that, when the user is using a pen/eraser, the canvas won't move
                    if (canvasRef.current.centerDiv?.parentElement) canvasRef.current.centerDiv.parentElement.style.touchAction = customModes.current.isPenEnabled || customModes.current.isEraserEnabled ? "none" : "";
                    if (canvasRef.current.centerDiv) canvasRef.current.centerDiv.style.touchAction = customModes.current.isPenEnabled || customModes.current.isEraserEnabled ? "none" : "";
                    onMouseDown()
                }
                } onMouseMove={(e) => mouseMove({
                    target: e.target as HTMLCanvasElement,
                    clientX: e.clientX,
                    clientY: e.clientY
                })} onTouchMove={(e) => {
                    mouseMove({
                        target: e.target as HTMLCanvasElement,
                        clientX: e.touches[0].clientX,
                        clientY: e.touches[0].clientY
                    })
                }}
                    onClick={(e) => {
                        let target = e.target as HTMLCanvasElement;
                        if (customModes.current.isTextEnabled && currentCanvas) { // Update the position of the text
                            mouseDown = [(e.clientX - (currentCanvas ?? target).getBoundingClientRect().left) * (window.devicePixelRatio || 1), (e.clientY - (currentCanvas ?? target).getBoundingClientRect().top) * (window.devicePixelRatio || 1)];
                            Annotations.write({ canvas: currentCanvas, position: mouseDown, ...getTextAttributes() });
                        }
                    }}
                    onMouseUp={stopCanvasEditing} onTouchEnd={stopCanvasEditing} onMouseLeave={() => { stopCanvasEditing(); if (canvasRef.current.circleCanvas) canvasRef.current.circleCanvas.style.display = "none" }} onMouseEnter={() => {
                        if (canvasRef.current.circleCanvas) { // Update properties of the pointer circlee
                            canvasRef.current.circleCanvas.style.display = "block";
                            canvasRef.current.circleCanvas.style.backgroundColor = userDrawingOptionsManager.current.cursorColor;
                            for (let item of ["width", "height"]) canvasRef.current.circleCanvas.style[item as "width" | "height"] = `${userDrawingOptionsManager.current.cursorSize}px`;
                        }
                    }}></canvas>
            </div>
        </div >
        <div ref={el => (canvasRef.current.thumbnailDiv = el)}>
            {pageSettings.showThumbnail !== 0 && pdfObj && <Thumbnail key={`PDFPointer-ThumbnailViewer`} PDFObj={pdfObj} PDFState={updatePage}></Thumbnail>}
        </div>
    </>
}