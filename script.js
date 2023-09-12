// Setup service worker
let positionLink = "https://dinoosauro.github.io/pdf-pointer/"
if (document.location.href.indexOf("netlify") !== -1) positionLink = "https://dinoosauro-pdf-pointer.netlify.app/";
if ('serviceWorker' in navigator) {
    let registration;
    const registerServiceWorker = async () => {
        registration = await navigator.serviceWorker.register('./service-worker.js', { scope: positionLink });
    };
    registerServiceWorker();
}
let jsonImg = { // The object that will contain all the image SVGs, so that they can be applied to all the images
    toload: true // Since the fetch request is still not done, the object will contain only an attribute: toLoad
};
let appVersion = "1.1.1";
fetch("https://dinoosauro.github.io/UpdateVersion/pdfpointer-updatecode", { cache: "no-store" }).then((res) => res.text().then((text) => { if (text.replace("\n", "") !== appVersion) if (confirm(`There's a new version of pdf-pointer. Do you want to update? [${appVersion} --> ${text.replace("\n", "")}]`)) { caches.delete("pdfpointer-cache"); location.reload(true); } }).catch((e) => { console.error(e) })).catch((e) => console.error(e)); // Check if the application code is the same as the current application version and, if not, ask the user to update
fetch(`./assets/mergedContent.json`).then((res) => { res.json().then((json) => { jsonImg = json }) }); // Fetch the new SVGs
let avoidDuplicate = false;
let startWidth = [[document.documentElement.clientWidth, document.documentElement.clientHeight], [], [document.documentElement.clientWidth, document.documentElement.clientHeight]]; // Fetch the viewport the user loaded the page so that it can ve used later to get PDF viewport width/height
let closeEvent = new Event("close"); // Create a new event that will delete the brigthness effect of a selected action
let actions = document.querySelectorAll("[customimg]");
for (let action of actions) {
    action.addEventListener("close", () => unclickItems(action)); // Same as close
    action.addEventListener("click", () => {
        if (!action.classList.contains("clickImg")) clickItem(action); else unclickItems(action) // If the user hasn't clicked the action button yet, make the button brighter (selected), otherwise restore the button at its brightness (not selected)
        if (action.getAttribute("disableAction") !== null) { // Item is not currently disables (ex: previous page button will be disabled if the user is seeing the first PDF page)
            let actionSplit = action.getAttribute("disableAction").split(","); // Get if the action must disable another action (ex: the erase button must disable the pen button)
            for (let split of actionSplit) {
                if (document.querySelector(`[data-action=${split}]`).classList.contains("clickImg")) document.querySelector(`[data-action=${split}]`).dispatchEvent(closeEvent); // Restore brightness of the conflicting actions
            }
        }
    });
}
function clickItem(action) {
    getImg([action.firstChild.src], `${action.getAttribute("data-action")}-fill`); // Add a filled SVG, so that the user can notice that the item is selected
    action.classList.add("clickImg"); // Add brightness
}
function unclickItems(action) {
    getImg([action.childNodes[1].src], action.getAttribute("data-action")); // Get the regular SVG
    action.classList.remove("clickImg"); // Remove extra brightness
}
let loadPDF = {
    element: null,
    promise: null,
    page: 1
}
let eraseFromKey = false; // The user has pressed Backspace and wants to erase content
let pdfName = ""; // The name of the file selected as a PDF
let changeItemFromKey = [false, "cursorpointer"]; // [Boolean, change name]. Indicates if the cursor image must be changed to another one (ex: change it to a eraser if the user needs to delete an annotation)
let blockKey = false; // If true, don't accept new key input
function startPDFRead(link) {
    document.getElementById("openDiv").classList.add("animate__animated", "animate__backOutDown"); // Hide the introduction section
    document.getElementById("intro").classList.add("animate__animated", "animate__backOutDown"); // Show the PDF tools and canvas
    setTimeout(() => {
        document.getElementById("openDiv").remove(); // Remove from the DOM the parts of the introduction section
        document.getElementById("intro").remove();// Remove from the DOM the parts of the introduction section
        document.getElementById("toolMain").style.visibility = "visible"; // Make visible tools
        document.getElementById("pageContainer").style.visibility = "visible"; // Make visible the PDF container
        document.getElementById("toolMain").classList.add("animate__animated", "animate__backInUp"); // Add an animation to the new visible elements
        document.getElementById("pageContainer").classList.add("animate__animated", "animate__backInUp"); // Add an animation to the new visible elements
        setTimeout(() => {setupTranlsation()}, 1100);
        function shiftShortcut(e) {
            if (blockKey) return;
            function switchItem(typeSwitch) { // Changes the brightness between erase & pen actions (the two that can be triggered by keyboard functions)
                if (typeSwitch) {
                    document.querySelector("[data-action=erase]").classList.remove("clickImg");
                    document.querySelector("[data-action=pen]").classList.add("clickImg");
                } else {
                    document.querySelector("[data-action=erase]").classList.add("clickImg");
                    document.querySelector("[data-action=pen]").classList.remove("clickImg");

                }

            }
            // A switch is used for the items that require more than a button click. Otherwise, the items on an array are read (since it's easier to add new ones in this way)
            switch (e.key) {
                case "Shift": // With shift, the user will stop every annotation being made
                    if (isFromKey) { // Interrupt the current drawing
                        canvasIds.specific.shouldDraw = false; // Stop the current canvas
                        canvasIds.zIndex++; // Increment the zIndex value, so that the next canvas will be on top of the current annotation
                        document.querySelector("[data-action=pen]").classList.remove("clickImg"); // Remove the pen brightness
                    } else switchItem(true); // Change icon to erase
                    if (changeItemFromKey[1] === "cursorerase") changeItemFromKey = [false, "cursorpointer"]; // Change the icon to pointer
                    isFromKey = !isFromKey; 
                    eraseFromKey = false; // No erase required
                    canvasPen(); // If isFromKey is true, the user will be able to draw, otherwise the drawing canvas will be finalized
                    break;
                case "Alt": // Force interrupt the current drawing
                    canvasIds.specific.shouldDraw = false; // Stop drawing
                    canvasIds.zIndex++; // Increment zIndex so that the next canvas will be on top of the current annotation
                    isFromKey = false;  // Stop every possible input
                    eraseFromKey = false; // Stop every possible input
                    break;
                case "Backspace": // The user wants to delete one or more canvas 
                    eraseFromKey = !eraseFromKey;
                    if (eraseFromKey) { 
                        changeItemFromKey = [true, "cursorerase"]; // Change pointer to erase icon
                        switchItem(false); // Add the extra brightness to the eraser tool
                    } else {
                        changeItemFromKey = [true, "cursorpointer"]; // Change icon
                        document.querySelector("[data-action=erase]").classList.remove("clickImg")
                    }
                    break;
            }
            let standardShortcut = [["+", "-", "ArrowLeft", "ArrowRight"], [document.querySelector("[data-action=zoomin]"), document.querySelector("[data-action=zoomout]"), document.querySelector("[data-action=prev]"), document.querySelector("[data-action=next]")]]; // Array: [[The clicked items] [The button to press]];
            for (let i = 0; i < standardShortcut[0].length; i++) if (e.key === standardShortcut[0][i]) standardShortcut[1][i].click();
        }
        document.documentElement.addEventListener("keydown", (e) => { shiftShortcut(e) }); // When the user start pressing a key, it'll be analyzed to get if it's the desired output
        for (let item of ["mouseup", "mouseleave", "touchstart", "touchend"]) document.documentElement.addEventListener(item, () => { zoomTrack.currentlyErasing = false }); // Stop erasing (?) (It seems to do nothing, but I'll keep it just to make sure)
        loadPDF.element = pdfjsLib.getDocument(link);  // Get the PDF document
        loadPDF.element.promise.then((pdf) => {
            loadPDF.promise = pdf; // Set the new PDF object in the loadPDF objecy
            canvasPDF(loadPDF.page); // Load the canvas
        });
    }, 1000)
}
let canvasGeneralScale = 90; // A scale that will be considered when drawing the canvas
function getProportion(a, b, c, isHalf) { // Get a proportion between three elements
    // I'm lazy to do an operation all of the time
    if (isHalf) return b * c / a; else return a * c / b;
}
let canvasComplete = true; // The canvas has been drawn
let proxyCanvas; // A canvas of the PDF page that it's 300% of the original view size. It'll be used for zooming
function greatViewport(viewport) { // Get the output viewport scale
    let futureScale = 1;
    let newCanvasScale = canvasGeneralScale;
    if (viewport.width / viewport.height > 1.2) newCanvasScale = newCanvasScale - (((viewport.width / viewport.height) - 1) * 10 * 6); // Fix for 4:3 and other landscape formats
    if (viewport.width / viewport.height < 0.6) newCanvasScale = newCanvasScale + ((1.1 - (viewport.width / viewport.height)) * 10 * 6); // Fix for 9:16 and other vertical formats
    if (viewport.width > viewport.height) futureScale = getProportion(viewport.width, viewport.height, startWidth[2][0] * newCanvasScale / 100, true) / viewport.width; else futureScale = getProportion(viewport.width, viewport.height, startWidth[2][1] * newCanvasScale / 100, false) / viewport.height; // Get a proportion of which value would be 100% zoom
    return futureScale;
}
function setUpCanvas(canvas, viewport, askReturn) { // Just like the function name, setup a canvas with its width/height
    let outputScale = window.devicePixelRatio || 1; // If the display of the user is great, adjust its pixel ratio
    canvas.width = Math.floor(viewport.width * outputScale); 
    canvas.height = Math.floor(viewport.height * outputScale);
    canvas.style.width = Math.floor(viewport.width) + "px";
    canvas.style.height = Math.floor(viewport.height) + "px";
    if (askReturn) return canvas;
}
function canvasPDF(pageNumber) { // Draw a specific page to a canvas
    if (!canvasComplete) { // Canvas operation still going. Wait until it has finished before continuing
        setTimeout(() => {
            canvasPDF(pageNumber);
        }, 1500);
        return;
    }
    canvasComplete = false;
    loadPDF.promise.getPage(pageNumber).then(function (page) {
        // See greatViewport()
        let outputScale = window.devicePixelRatio || 1;
        let viewport = page.getViewport({ scale: 1, });
        let futureScale = greatViewport(viewport);
        viewport = page.getViewport({ scale: futureScale });
        setUpCanvas(document.getElementById("displayCanvas"), viewport, false);
        let canvas = document.getElementById("displayCanvas");
        futureScale *= 3; // 300% zoom
        viewport = page.getViewport({ scale: futureScale }); // Get the final viewport another time
        proxyCanvas = setUpCanvas(document.createElement("canvas"), viewport, true); // Create a new canvas with the 300% zoom, and assign it to the proxyCanvas property
        let context = proxyCanvas.getContext('2d');
        let transform = outputScale !== 1
            ? [outputScale, 0, 0, outputScale, 0, 0]
            : null;

        let renderContext = {
            canvasContext: context,
            transform: transform,
            viewport: viewport
        };
        page.render(renderContext).promise.then(() => { // Render the page to the proxy canvas
            canvasComplete = true;
            canvas.getContext("2d").drawImage(proxyCanvas, 0, 0, canvas.width, canvas.height) // Draw the page to the displayed canvas, resizing it to the canvas size
            if (optionProxy.changeItems.keepZoomSize) setFixedWidth(true); else originalWidth = [document.getElementById("displayCanvas").style.width, document.getElementById("displayCanvas").style.height, document.getElementById("displayCanvas").height, document.getElementById("displayCanvas").width]; // If the size of the canvas must be the same, it'll be passed in a function that will adjust the style of the container. Otherwise, the current canvas width/height will be stored
            if (isFullscreen) {
                // UI Fixes for fullscreen mode
                let getAvailableSpace = (window.innerWidth * 10 / 100) + document.getElementById("containerOfOptions").offsetWidth;
                document.getElementById("containerOfOptions").classList.add("fullcontainer");
                document.getElementById("pdfcontainer").style = `display: flex; float: left; width: ${window.innerWidth - getAvailableSpace - 2}px`;
            }
        });
    }, (ex) => { // Something went wrong, go back to previous state
        canvasComplete = true;
        loadPDF.page--;
        console.warn(ex);
    });
}
let isFromKey = false;
let globalTranslations = { // English translations to variables assigned directly from this script
    shiftAlert: "You can also press Shift to draw into the PDF. Press it again to stop drawing.",
    dropdownClose: "Close this drowdown menu to apply the new color. You can also add new colors form Settings.",
    seconds: "Seconds",
    nameColor: "How do you want to name this color?",
    maxZoom: "is the maxinum zoom level permitted",
    minZoom: "is the mininum zoom level permitted",
    noShowAgain: "Don't show again",
    zoomCanvas: "Zooming in PDFs and keeping annotations is experimental, and it might (and most probalby will) cause glitches.",
    webKitColor: "Select the color from the input below, and then click on the \"Save custom color\" button to choose a name for it.",
    exportInformation: "You can export the PDF page (even with annotations) as an image",
    save: "Save as image",
    qualityInfo: "Choose the image quality",
    customExport: "Export the following pages",
    customItalic: "Use '1-5' for downloading from 1 to 5 or '1,5' for downloading page 1 and 5. Leave blank for downloading only the current page.",
    resize: "Resize the image width and height",
    resizeItalic: "The aspect ratio will remain the same.",
    saveZip: "Save as a .zip file",
    hoverTranslation: {
        prev: "Show previous page",
        contract: "Decrease canvas size",
        zoomout: "Decrease zoom",
        pen: "Create drawing",
        timer: "Change timer to delete drawing",
        erase: "Delete annotazione",
        color: "Change drawing color",
        fullscreen: "Full screen mode",
        normalscreen: "Exit from full screen mode",
        downloadAsImg: "Export PDF as an image",
        settings: "Settings",
        zoomin: "Increase zoom",
        expand: "Increase canvas size",
        next: "Show next page"
    }
}
function canvasPen() { // Draw into the canvas
    if (!document.querySelector("[data-action=pen]").classList.contains("clickImg") && !isFromKey) return; // The user doesn't want to draw into the cnavas
    if (!isFromKey) topAlert(globalTranslations.shiftAlert, "shiftAlert"); // Notice the user they can draw also by pressing Shift
    if (canvasIds.specific.shouldDraw) { // The user was already drawing, so the current canvas will be finalized
        canvasIds.specific.shouldDraw = false;
        canvasIds.zIndex++;
        return;
    }
    // Create a container for the SVG canvas
    let newCanvas = document.createElement("div"); 
    newCanvas.width = document.getElementById("displayCanvas").offsetWidth;
    newCanvas.height = document.getElementById("displayCanvas").offsetHeight;
    newCanvas.style = `position: absolute; z-index: ${canvasIds.zIndex}; margin-top: 15px; margin-bottom: 15px; border-radius: 8px;`;
    newCanvas.classList.add("displayCanvas", "opacityRemove");
    newCanvas.setAttribute("topstatus", "0");
    newCanvas.setAttribute("leftstatus", "0");
    newCanvas.setAttribute("data-zoom", zoomTrack.zoomLevel);
    newCanvas.setAttribute("data-page", `${loadPDF.page}`);
    // Get context of the Canvas2SVG (see open source libraries)
    let ctx = new C2S(document.getElementById("displayCanvas").offsetWidth, document.getElementById("displayCanvas").offsetHeight)
    ctx.strokeStyle = `rgb(${optionProxy.availableHighlightColors.currentColor})`;
    ctx.lineWidth = 5;
    // Set properties
    canvasIds.specific.canvasElement = ctx;
    canvasIds.specific.shouldDraw = true;
    canvasIds.specific.newCanvas = newCanvas;
    addEvents(newCanvas); // Function that will add all the events a canvas needs
    // Set a timeout that will automatically delete the annotation
    setTimeout(() => {
        newCanvas.style.opacity = "0";
        setTimeout(() => {
            newCanvas.remove();
        }, 500)
    }, optionProxy.changeItems.timer * 1000);
    document.querySelector(".pageBackground").append(newCanvas); // Append the new canvas
}
function canvasMove(event) { // Draw the canvas annotation, line by line (yeah, not the best function name)
    if (!canvasIds.specific.shouldDraw) return;
    let xy = [event.offsetX, event.offsetY];
    let AddToY = 0;
    if (navigator.userAgent.toLowerCase().indexOf("safari") !== -1 && navigator.userAgent.toLowerCase().indexOf("chrome") === -1) AddToY = 32; // It seems that WebKit manages pointers in a different way, so I need to add the height of the SVG
    if (canvasIds.specific.previousItem[0] !== null) { // If it's null, this is the first point the user touches, so its space reference must be stored. Otherwise, draw the line
        try {
            canvasIds.specific.canvasElement.lineTo(xy[0], xy[1] + AddToY);
            canvasIds.specific.canvasElement.stroke();
        } catch (ex) { // Sometimes it'll fail, no big deal, just run it again.
            console.warn(ex);
            canvasPen();
            canvasPen();
        }
    } else {
        canvasIds.specific.canvasElement.beginPath();
        canvasIds.specific.canvasElement.moveTo(xy[0], xy[1] + AddToY);
    }
    canvasIds.specific.previousItem = xy; // Set the current position in space as the previous one, so that, when the user moves, the line will be traced directly from the current point
    canvasIds.specific.newCanvas.innerHTML = canvasIds.specific.canvasElement.getSerializedSvg(); // Add the SVG as the canvas source
}
let eraseTime = false; // If true, the user wants to erase one of their annotations
let isCanvasDrawing = false; // If true, the user is currently drawing on the PDF
function canvasDrawCheck() { // Stop canvas drawing and erasing
    if (isCanvasDrawing) {
        canvasPen();
        if (document.querySelector("[data-action=erase]").classList.contains("clickImg")) eraseTime = false;
        isCanvasDrawing = false;
    }
}
for (let item of ["mouseup", "touchend", "touchcancel"]) document.addEventListener(item, () => { canvasDrawCheck() });
function addEvents(newCanvas) { // Add a list of events to the new canvas
    function mousedown() { // Start drawing canvas
        canvasPen();
        isCanvasDrawing = true;
        if (document.querySelector("[data-action=erase]").classList.contains("clickImg")) eraseTime = true; // If the user wants to erase something
    }
    function mouseover(event) { 
        canvasMove(event); // Checks if the user is drawing something
        canvasEraser(event); // Check if the user is erasing something
        if (changeItemFromKey[0]) { // The pointer icon must be changed
            changeItemFromKey[0] = false;
            cursorChange(newCanvas, changeItemFromKey[1]);
        }
        if (changeItemFromKey[1] === "cursorerase") canvasEraser(event, true); // If the user needs to erase something, start the class

    }
    for (let item of ["mousedown", "touchstart"]) newCanvas.addEventListener(item, () => {mousedown();});
    newCanvas.addEventListener("mousemove", (event) => {mouseover(event)});
    newCanvas.addEventListener("touchmove", (event) => {event.preventDefault(); mouseover({offsetX: event.touches[0].pageX - newCanvas.getBoundingClientRect().left - window.scrollX - newCanvas.scrollLeft, offsetY: event.touches[0].pageY - newCanvas.getBoundingClientRect().top - window.scrollY - newCanvas.scrollTop, clientX: event.touches[0].pageX, clientY: event.touches[0].pageY})}); // Since touch gives different attrivutes, the ones used by the mouseover function must be manually "crafted"
    for (let type of ["mouseleave", "touchend"]) newCanvas.addEventListener(type, () => { canvasIds.specific.previousItem[0] = null; newCanvas.style.cursor = "pointer"; }); // When the user leaves the canvas, set the previous position to null (since it can re-enter the canvas from another position, and this would break the canvas drawing) and set the pointer to normal
    newCanvas.addEventListener("hover", () => { intelligentCursor(newCanvas) }) // Change cursor

    // Setup canvas easing
    newCanvas.addEventListener("mousedown", (e) => {
        if (!document.querySelector("[data-action=erase]").classList.contains("clickImg")) zoomTrack.currentlyErasing = true;
        precedentZoomPosition = [e.screenX, e.screenY];
    });
    newCanvas.addEventListener("touchstart", (e) => {
        e.preventDefault();
        var touch = e.touches[0];
        if (!document.querySelector("[data-action=erase]").classList.contains("clickImg")) zoomTrack.currentlyErasing = true;
        precedentZoomPosition = [touch.pageX, touch.pageY];
    });
    newCanvas.addEventListener("mouseenter", () => { cursorChange(newCanvas) });
}
function cursorChange(canvas, cursor) { // Change the canvas cursor
    let actionToDo = cursor;
    if (actionToDo === undefined) {
        actionToDo = "cursorpointer";
        if (document.querySelector(`[data-action=pen]`).classList.contains("clickImg")) actionToDo = "cursorpen"; else if (document.querySelector(`[data-action=erase]`).classList.contains("clickImg")) actionToDo = "cursorerase";
    }
    getImg([canvas], actionToDo, true);
}
function canvasEraser(event, skip) {
    if (skip !== true) if (!document.querySelector("[data-action=erase]").classList.contains("clickImg") || !eraseTime) return; // skip !== true since it can also be undefined
    let rectangle = document.getElementById("displayCanvas").getBoundingClientRect(); // Get the rectangle position
    let xy = [event.clientX - rectangle.left, event.clientY - rectangle.top + 16];
    let getCanvases = document.querySelectorAll("g"); // Fetch all the SVG forms
    for (let canvas of getCanvases) {
        let canvasPosition = canvas.getBoundingClientRect(); // Get the position of the SVG form
        if (canvas.getAttribute("pdf") === "yes") continue; // Shouldn't happen now that canvas are no longer used
        function deleteCanvas() {
            if (canvas.parentElement.parentElement.getAttribute("data-delete") === null) canvas.parentElement.parentElement.setAttribute("data-delete", "1"); else return;
            canvas.parentElement.parentElement.style.opacity = 0;
            setTimeout(() => { canvas.parentElement.parentElement.remove() }, 700);
        }
        if ((canvasPosition.bottom - event.clientY) > -20 && (canvasPosition.bottom - event.clientY) < 20) deleteCanvas(); // Conditions to delete canvas
        if ((canvasPosition.left - event.clientX) > -20 && (canvasPosition.left - event.clientX) < 20) deleteCanvas(); // Conditions to delete canvas

    }
}
function hexToRgbNew(hex) { // Borrowed from https://stackoverflow.com/a/11508164
    var arrBuff = new ArrayBuffer(4);
    var vw = new DataView(arrBuff);
    vw.setUint32(0, parseInt(hex, 16), false);
    var arrByte = new Uint8Array(arrBuff);

    return arrByte[1] + "," + arrByte[2] + "," + arrByte[3];
}
let canvasIds = { // An object that contains information for generating or editing a canvas
    zIndex: 1,
    specific: {
        canvasElement: null,
        shouldDraw: false,
        previousItem: [null, null],
        newCanvas: null
    }
}
let localOptions = { // An object that contains each option from PDFPointer. I think that, at least most of them, are named in a comprensible way
    availableHighlightColors: {
        "Red": [255, 0, 0, 255],
        "Blue": [0, 0, 255, 255],
        "Green": [0, 255, 0, 255],
        "currentColor": [255, 0, 0, 255],
    },
    customColors: {},
    dropdownSelectedOptions: {
        "timer": 2,
        "color": 1
    },
    showAlert: {
        "timer": false,
        "color": false,
        "downloadImg": false
    },
    changeItems: {
        timer: 15,
        showTips: true,
        alertInt: 5000,
        pointerColorEnabled: false,
        pointerColorColor: "#ffffff",
        keepZoomSize: null,
        moveZoom: true,
        resizeCanvas: false,
    },
    themes: [{
        name: "Umber Brown",
        colorProperties: {
            "text": "#fcf7f2",
            "optionbackground": "#745741",
            "background": "#261508",
            "accent": "#b56726",
            "settingsoverlay": "#322317",
            "card": "#5c3c22",
            "optionitem": "#43352a",
            "safetext": "#fcf7f2",
            "optioncolor": "#403021"
        },
        customItemRefer: "a"
    }, {
        "name": "Slate Gray",
        colorProperties: {
            "text": "#171717",
            "optionbackground": "#d4d4d4",
            "background": "#ebebeb",
            "accent": "#212121",
            "settingsoverlay": "#c1c1c1",
            "card": "#afafaf",
            "optionitem": "#afafaf",
            "safetext": "#ebebeb",
            "optioncolor": "#a3a3a3",
        },
        customItemRefer: "b"
    }, {
        "name": "Pearl White",
        colorProperties: {
            "text": "#171717",
            "optionbackground": "#8b9692",
            "background": "#fcfcfd",
            "accent": "#505a57",
            "settingsoverlay": "#d4d4d4",
            "card": "#d3d3d3",
            "optionitem": "#cedad6",
            "safetext": "#ebebeb",
            "optioncolor": "#abb6b2"
        },
        customItemRefer: "c"
    }, {
        "name": "Dracula Dark",
        colorProperties: {
            "text": "#fcf7f2",
            "optionbackground": "#44475A",
            "background": "#282a36",
            "accent": "#c0c2d9",
            "settingsoverlay": "#44475A",
            "card": "#787b90",
            "optionitem": "#787b90",
            "safetext": "#fcf7f2",
            "optioncolor": "#787b90"
        },
        customItemRefer: "d"
    }, {
        "name": "Standard Dark",
        colorProperties: {
            "text": "#fcf7f2",
            "optionbackground": "#6b6b6b",
            "background": "#191919",
            "accent": "#925c5f",
            "settingsoverlay": "#393939",
            "card": "#6b6b6b",
            "optionitem": "#aaaaaa",
            "safetext": "#fcf7f2",
            "optioncolor": "#575757"
        },
        customItemRefer: "e"
    }
    ],
    export: {
        processPage: [],
        pageId: 0,
    }
}
if (localStorage.getItem("PDFPointer-customColors") !== null && localStorage.getItem("PDFPointer-customColors") !== "{}") // The user has set up custom colors in the past, therefore the'll be added
localOptions.availableHighlightColors = JSON.parse(localStorage.getItem("PDFPointer-customColors")); // Restore available colors to the ones the user has modified in the past
let optionProxy = ObservableSlim.create(localOptions, true, function (change) { // Create a proxy that will intercept edits in the options
    let changes = change[0];
    if (changes.type === "update") { // A value has been modified
        // Fetch current property and set it in the LocalStorage
        let path = changes.currentPath.split(".");
        if (settingsToSave.position.indexOf(changes.currentPath) === -1) return; // The update doesn't need to be saved
        let item = localOptions;
        for (let i = 0; i < path.length - 1; i++) item = item[path[i]];
        localStorage.setItem(settingsToSave.localProperty[settingsToSave.position.indexOf(changes.currentPath)], changes.newValue); // Save property
    }
});
addEvents(document.getElementById("displayCanvas")); // Add the canvas events to the default canvas
function usefulDropdownGenerator(alertType, numberOptions, typeCustomInput) { // A generator of a classic dropdown with input options
    if (optionProxy.showAlert[alertType]) return; // The item is still visible, so there's no need to create another one
    let dropdown = createDropdown(document.querySelector(`[data-action=${alertType}]`), undefined, alertType); // Create the dropdown container
    for (let option of numberOptions) {
        let child = addDropdownNameItem(option, dropdown.childNodes.length); // Add the option to the dropdown
        child.addEventListener("click", () => {
            // Set the clicked option in the local options
            optionProxy.changeItems[alertType] = parseInt(option.substring(0, option.indexOf(" ")));
            optionProxy.dropdownSelectedOptions[alertType] = numberOptions.indexOf(option) + 1;
        });
        dropdown.appendChild(child);
        hoverItem(child); // Add hover animation
    }
    let input = addDropdownTextbox("Custom input", typeCustomInput); // Add input textbox
    hoverItem(input);
    input.addEventListener("click", () => {
        optionProxy.dropdownSelectedOptions[alertType] = dropdown.childNodes.length - 1; // Set the selected option as the textbox
    });
    input.addEventListener("input", (e) => {
        optionProxy.changeItems[alertType] = `${e.target.value}`; // Set the dropdown value to the textbox one
    })
    dropdown.appendChild(input);
    input.value = `${optionProxy.changeItems[alertType]}`; // Set the previous value to the textbox value
    document.body.appendChild(dropdown);
    for (let i = 0; i < dropdown.childNodes.length; i++) {
        if (optionProxy.dropdownSelectedOptions[alertType] === i) dropdown.childNodes[i].style = "border-left: solid 2px var(--accent);"; else dropdown.childNodes[i].style = "padding-left: 22px";
    }
    if (typeCustomInput === "color") topAlert(globalTranslations.dropdownClose, "dropClose");
}
document.querySelector("[data-action=timer]").addEventListener("click", () => { // Create a dropdown timer
    usefulDropdownGenerator("timer", [`5 ${globalTranslations.seconds}`, `15 ${globalTranslations.seconds}`, `30 ${globalTranslations.seconds}`, `60 ${globalTranslations.seconds}`], "number");
});
document.querySelector("[data-action=color]").addEventListener("click", () => { // Create a dropdown for changing annotations color
    usefulDropdownGenerator("color", Object.keys(optionProxy.availableHighlightColors), "color");
});
function createDropdown(buttonReference, changeIcon, optionKey) {
    blockKey = true; // With the dropdown opened, the user might press keys to insert value, so disable every keyboard shortcut (ex: pressing backspace for deleting a number would otherwise start deleting annotations)
    optionProxy.showAlert[optionKey] = true; // Avoid creating more of the same dropdown
    let div = document.createElement("div");
    div.classList.add("animate__animated", "animate__backInDown") // Add animation
    // Add close button
    let close = document.createElement("img"); 
    close.width = 25;
    close.height = 25;
    close.setAttribute("data-customanimate", "1");
    getImg([close], changeIcon ? "fullscreenoff" : "save");
    hoverItem(close);
    close.addEventListener("click", () => { // Close the item
        blockKey = false; // Now the user can use keyboard shortcuts
        div.classList.add("animate__backOutUp");
        setTimeout(() => {
            div.remove();
        }, 1000);
        if (div.childNodes[div.childNodes.length - 1].childNodes[0].type === "color") { // Get the input hexadecimal value to RGB
            let hexToRgb = hexToRgbNew(div.childNodes[div.childNodes.length - 1].childNodes[0].value.replace("#", "")).split(",");
            optionProxy.availableHighlightColors.currentColor = [parseInt(hexToRgb[0]), parseInt(hexToRgb[1]), parseInt(hexToRgb[2]), 255];
        }
        optionProxy.showAlert[optionKey] = false; // Since the dropdown is closed, it's a good time to create a new one
    })
    close.classList.add("closeBtn", "saveDropdown");
    div.append(close);
    var divPosition = buttonReference.getBoundingClientRect(); // Get the page position of the button so that the dropdown will be generated a little bit below
    div.classList.add("dropdown");
    // If the screen is vertical, update the vertical width
    let percentageWidth = 25;
    if (screen.availHeight > screen.availWidth) {percentageWidth = 60; div.classList.add("verticalDropdown")}
    let styleThings = `top: ${parseInt(divPosition.top) + 75 + window.scrollY}px; `;
    if (divPosition.left + 25 + (percentageWidth * document.body.offsetWidth / 100) < document.body.offsetWidth) styleThings += `left: ${divPosition.left + 25}px; `; else styleThings += `right: ${divPosition.right - 25 - (percentageWidth * document.body.offsetWidth / 100)}px; `;
    styleThings = styleThings.replace("right: -", "left: ").replace("left: -", "right: "); // Quick fix for dialog outside client view due to negative numbers
    div.style = styleThings;
    return div;
}
function addDropdownNameItem(text, position) { // Add a dropdown button (that's more like a clickable label)
    if (text === "currentColor") text = "";
    let option = document.createElement("div");
    option.classList.add("dropdownItem");
    option.addEventListener("click", () => {
        option.parentElement.childNodes[0].click();
        if (option.parentElement.childNodes[option.parentElement.childNodes.length - 1].childNodes[0].type === "color") { // If it's a color, save the selected color property
            optionProxy.availableHighlightColors.currentColor = optionProxy.availableHighlightColors[text];
        }
    });
    let labelName = document.createElement("l");
    labelName.textContent = text;
    labelName.classList.add("dropdownLabel");
    option.appendChild(labelName);
    return option;
}
function addDropdownTextbox(placeholder, typeText) { // Add a textbox for custom input
    let option = document.createElement("div");
    option.classList.add("dropdownItem");
    let element = document.createElement("input");
    element.type = typeText;
    if (typeText === "number") element.min = 1;
    element.placeholder = placeholder;
    option.appendChild(element);
    return option;
}
function topAlert(text, alertType, isChange) { // Create an alert at the top of the page
    if (!optionProxy.changeItems.showTips || localStorage.getItem("PDFPointer-notshow") !== null && localStorage.getItem("PDFPointer-notshow").split(",").indexOf(alertType) !== -1) return; // If the user doesn't want to see tips, or if they have requested to not show that specific alert, return
    // Create the alert container
    let alertContainer = document.createElement("div");
    alertContainer.classList.add("vertcenter", "opacityRemove");
    alertContainer.style = "width: 100vw; z-index: 9999998";
    let alert = document.createElement("div");
    alert.classList.add("alert", "vertcenter");
    function deleteFunction() {
        alertContainer.style.opacity = "0";
        setTimeout(() => {
            alertContainer.remove();
        }, 500)
    }
    setTimeout(() => { deleteFunction() }, localOptions.changeItems.alertInt); // Delete the alert after an amount of time set by the user
    // Create the alert icon
    let image = document.createElement("img");
    getImg([image], `alert`)
    image.style.width = "25px";
    image.style.height = "25px";
    let textitem = document.createElement("l");
    textitem.style.marginLeft = "10px";
    textitem.textContent = text;
    alert.append(image, textitem);
    if (isChange) { // The popup is about changing language. The user will be able to return to the English version
        let returnDefault = document.createElement("a");
        returnDefault.href = `./index.html?nolang`;
        returnDefault.textContent = "Go back to English";
        returnDefault.style.marginLeft = "5px";
        alert.append(returnDefault);
    }
    // Create a new link to not show the dialog for this reason again
    let doNotShow = document.createElement("l"); 
    doNotShow.classList.add("noshow", "link");
    doNotShow.style.marginLeft = "10px";
    doNotShow.textContent = globalTranslations.noShowAgain;
    doNotShow.addEventListener("click", () => {
        if (localStorage.getItem("PDFPointer-notshow") === null) localStorage.setItem("PDFPointer-notshow", "");
        localStorage.setItem("PDFPointer-notshow", `${localStorage.getItem("PDFPointer-notshow")}${alertType},`);
        deleteFunction();
    });
    alert.append(document.createElement("br"), document.createElement("br"), doNotShow);
    alertContainer.append(alert);
    document.body.append(alertContainer);
    alertContainer.style.opacity = "0";
    setTimeout(() => { alertContainer.style.opacity = "1"; }, 350);
}
function showRightCanvas() { // When the page changes, show only the canvases that were created in that page
    for (let canvas of document.querySelectorAll("[data-page]")) if (canvas.getAttribute("data-page") === `${loadPDF.page}`) canvas.style.display = "inline"; else canvas.style.display = "none";
}
document.querySelector("[data-action=next]").addEventListener("click", () => { // Load next page
    loadPDF.page++;
    showRightCanvas();
    canvasPDF(loadPDF.page);
    fixZoom();
});
document.querySelector("[data-action=prev]").addEventListener("click", () => { // Load previous page
    if (loadPDF.page === 1) return;
    loadPDF.page--;
    showRightCanvas();
    canvasPDF(loadPDF.page);
    fixZoom();
});
function fixZoom() { // Scale each canvas so that it can keep the same position even while zooming
    for (let itemOld of document.querySelectorAll("g")) {
        item = itemOld.parentElement;
        item.parentElement.style.transformOrigin = "top left"; // Really important: no margin hacks required!
        item.parentElement.style.transform = `scale(${1 / parseInt(item.parentElement.getAttribute("data-zoom"))})`; // Get the scale size 
        item.parentElement.height = originalWidth[2];
        item.parentElement.width = originalWidth[3];
        item.parentElement.style.marginTop = `0px`;
        item.parentElement.style.marginLeft = `0px`;
        if (parseInt(item.parentElement.getAttribute("data-page")) === loadPDF.page && optionProxy.changeItems.moveZoom || parseInt(item.parentElement.getAttribute("data-page")) === loadPDF.page && !optionProxy.changeItems.moveZoom && parseInt(item.parentElement.getAttribute("data-zoom")) === 1) item.parentElement.style.display = "inline"; else item.parentElement.style.display = "none"; // Basically, display the item if it's on the same page and the user wants to keep annotations when zooming
    }
    zoomTrack.zoomLevel = 1;
    zoomTrack.x = 0;
    zoomTrack.y = 0;
    if (optionProxy.changeItems.keepZoomSize) { // If the user wants to keep the zoomed file in the same position, setup the new canvas
        setFixedWidth();
        resizeCanvasSameSize();
    }
}
function bounceTextEvents(item, animationItem) { // Add text animation (especially for dialog color)
    animationItem.addEventListener("mouseenter", () => {
        item.classList.add("animate__animated", "animate__headShake");
        setTimeout(() => { item.classList.remove("animate__animated", "animate__headShake") }, 800)
    });
}
let colorHeight = 0;
function fetchColors(jsonItem) { // Update the available colors in the setting div
    for (let i = 0; i < Object.keys(jsonItem).length; i++) {
        if (Object.keys(jsonItem)[i] === "currentColor") continue; // The current color shouldn't be saved
        colorHeight += 57; // Height + border
        document.getElementById("optionContainer").style.maxHeight = `${colorHeight}px`;
        let show = document.createElement("div");
        show.classList.add("colorContainer");
        let innerText = document.createElement("l");
        innerText.textContent = Object.keys(jsonItem)[i];
        innerText.style = "display: flex; float: left";
        bounceTextEvents(innerText, show);
        let arrayOptions = jsonItem[Object.keys(jsonItem)[i]]; // It'll be an array with the R, G and B values
        let deleteBtn = createContainerInfo("bin", `rgb(${arrayOptions[0]},${arrayOptions[1]},${arrayOptions[2]})`, undefined, show); // Create a button to delete the custom color
        deleteBtn.addEventListener("click", () => {
            delete jsonItem[Object.keys(jsonItem)[i]]; // Delete entry
            document.documentElement.style.setProperty("--deleteitem", `rgb(${arrayOptions[0]},${arrayOptions[1]},${arrayOptions[2]})`); // Update the property so that there'll be a transition of the color changing before deleting the color div from the DOM
            storeCustomOptions([jsonItem], ["PDFPointer-customColors"]); // Update the LocalStorage with the new colors
            show.classList.add("runAnimation")
            setTimeout(() => {
                show.style.backgroundColor = `rgb(${arrayOptions[0]},${arrayOptions[1]},${arrayOptions[2]})`;
                show.classList.add("animate__animated", "animate__backOutDown");
                setTimeout(() => {
                    show.classList.add("deleteAnimation");
                    colorHeight -= 57;
                    document.getElementById("optionContainer").style.maxHeight = `${colorHeight}px`;
                    setTimeout(() => { show.remove(); }, 250);
                }, 1000)
            }, 1000);
        });
        show.append(innerText, deleteBtn, document.createElement("br"));
        document.getElementById("optionContainer").append(show);
    }
}
document.getElementById("optionContainer").innerHTML = ""; // Delete previous colors
fetchColors(optionProxy.availableHighlightColors); // Create the custom color div for settings
function updateColorNew() { // Add a custom color for canvas drawing
    let result = prompt(`${globalTranslations.nameColor} [${document.getElementById("colorNew").value}]`); // Ask the name of this new color
    if (result !== null) {
        let getColorRGB = hexToRgbNew(document.getElementById("colorNew").value.replace("#", "")).split(","); // Convert hex to rgb
        getColorRGB.push(255) // Add alpha channel
        optionProxy.availableHighlightColors[result] = getColorRGB; // Update the available color object with this new color
        storeCustomOptions([optionProxy.availableHighlightColors], ["PDFPointer-customColors"]); // And save the edit to the LocalStorage
        let singleColor = {};
        singleColor[result] = getColorRGB;
        fetchColors(singleColor); // Add the new color to the "Custom color" settings
    }
}
if (navigator.userAgent.toLowerCase().indexOf("chrome") !== -1) {
    document.getElementById("colorNew").addEventListener("focusout", () => { updateColorNew() }); // On Chromium browser, save the color when the input loses focus
} else { // On non-Chromium browsers, a button will appear to save the color
    document.getElementById("colorSaveBtn").style.display = "flex";
    document.querySelector("[data-translate=customColorDescription]").textContent = globalTranslations.webKitColor;
    document.getElementById("colorSaveBtn").addEventListener("click", () => { updateColorNew() });
}
function getImg(loadImg, link, setCursor, customColor) { // Fetch the SVGs and add them to an image element
    if (jsonImg.toload) { // The fetch request still hasn't ended, so let's wait another 100 seconds before adding it.
        setTimeout(() => { getImg(loadImg, link, setCursor, customColor) }, 100);
        return;
    }
    let replaceItem = [getComputedStyle(document.body).getPropertyValue("--accent"), getComputedStyle(document.body).getPropertyValue("--text")]; // An array that'll contain the two color that'll be used in the new SVG image
    for (let img of loadImg) {
        let getLink = link === undefined ? img.getAttribute("fetchlink") : link; // The key to the SVG item
        let read = jsonImg[getLink]; // String that contains the SVG content
        if (customColor !== undefined) replaceItem[0] = customColor;
        let finalResult = URL.createObjectURL(new Blob([read.replaceAll("#c5603f", replaceItem[0]).replaceAll("#fcf7f2", replaceItem[1])], { type: "image/svg+xml" })); // Create a blob with the image URL, and replace the default colors with the theme-specific ones
        if (setCursor) { // The new SVG must be set as a cursor
            let rgbOption = hexToRgbNew(replaceItem[0].replace("#", "")).split(","); // Get RGB from a hexadecimal image
            if (optionProxy.changeItems.pointerColorEnabled) rgbOption = hexToRgbNew(optionProxy.changeItems.pointerColorColor.replace("#", "")).split(","); // The user has selected a custom pointer color, therefore it'll be used that instead of the accent color.
            img.style.cursor = `url("data:image/svg+xml;utf8,${(`${read.replaceAll(`fill='#c5603f'`, `fill='rgb(${rgbOption[0]},${rgbOption[1]},${rgbOption[2]})'`)}`)}") 0 32, auto`; // Replace the default pointer color and apply it to the content
        } else img.src = finalResult; // Otherwise, set the new blob as the source of image
    }
}
function createContainerInfo(name, backgroundColor, accentColor, hoverDiv) { // Creates a custom button that will perform an action. This is used especially in the "Custom theme" and the "Custom color" section
    let applyContainer = document.createElement("div");
    applyContainer.classList.add("closeBtn", "colorShow");
    applyContainer.style = `display: flex; float: right; background-color: ${backgroundColor}; margin-left: 10px`;
    let apply = document.createElement("img");
    apply.style.width = "20px";
    apply.style.height = "20px";
    apply.classList.add("vertcenter");
    apply.addEventListener("mouseenter", () => { apply.classList.add("rotateAnimation") });
    apply.addEventListener("mouseleave", () => { apply.classList.remove("rotateAnimation") });
    getImg([apply], name, undefined, accentColor);
    let containerDiv = document.createElement("div");
    containerDiv.classList.add("vertcenter",);
    containerDiv.style = "width: 100%; height: 100%";
    containerDiv.append(apply);
    applyContainer.append(containerDiv);
    hoverDiv.addEventListener("mouseenter", () => { apply.classList.add("containerPhotoAdd") });
    hoverDiv.addEventListener("mouseleave", () => {
        apply.classList.add("containerPhotoRemove");
        setTimeout(() => {
            apply.classList.remove("containerPhotoRemove", "containerPhotoAdd");
        }, 300);
    });

    return applyContainer;
}
function fetchThemes() { // Get current themes and add them to the "Manage theme" settings section
    if (localStorage.getItem("PDFPointer-customThemeJson") == null) localStorage.setItem("PDFPointer-customThemeJson", JSON.stringify({ items: {} }));
    try { // Merge custom and default themes in a single object 
        let customObj = JSON.parse(localStorage.getItem("PDFPointer-customThemeJson")).items;
        for (let i = 0; i < Object.keys(customObj).length; i++) {
            customObj[i].trackCustom = i;
            optionProxy.themes.push(customObj[i]);
        }
    } catch (ex) {
        console.warn(ex);
    }
    for (let theme of optionProxy.themes) { // Create a theme option
        let themeContainerOption = document.createElement("div");
        themeContainerOption.classList.add("colorContainer", "containerItemsAnimation");
        // Create a label with the theme name
        let themeName = document.createElement("l");
        themeName.style = "display: flex; float: left"
        themeName.innerHTML = theme.name;
        bounceTextEvents(themeName, themeContainerOption);
        // Create a set of buttons that will perform different actions
        let applyContainerNew = [createContainerInfo("colorbucket", theme.colorProperties.background, theme.colorProperties.accent, themeContainerOption)]; // Apply theme button
        applyContainerNew[0].addEventListener("click", () => {
            for (let key in theme.colorProperties) document.documentElement.style.setProperty(`--${key}`, `${theme.colorProperties[key]}`); // Update properties in the CSS style
            getImg(document.querySelectorAll("[fetchlink]")); // Generate again the images
            localStorage.setItem("PDFPointer-selectedtheme", theme.customItemRefer); // Set the current theme in the LocalStorage so that it can be resored later
            safariFixSelect(); // Update the select color on WebKit
        });
        applyContainerNew[0].setAttribute("data-themerefer", theme.customItemRefer);
        applyContainerNew[1] = createContainerInfo("export", theme.colorProperties.background, theme.colorProperties.accent, themeContainerOption); // Export theme as JSON file button
        applyContainerNew[1].addEventListener("click", () => {
            let a = document.createElement("a");
            a.href = URL.createObjectURL(new Blob([JSON.stringify(theme)], { type: "text/plain" }));
            a.download = `${theme.name}-export.json`;
            a.click();
        })
        if (theme.isCustom) { // If the theme is custom, add a delete button
            applyContainerNew[2] = createContainerInfo("bin", theme.colorProperties.background, theme.colorProperties.accent, themeContainerOption); // Delete button
            applyContainerNew[2].addEventListener("click", () => {
                document.documentElement.style.setProperty("--deleteitem", theme.colorProperties.optionitem); // Change the delete item CSS variable so that there's a color changing animation before deleting the item
                themeContainerOption.classList.add("runAnimation"); 
                // Fetch the custom themes, get where the custom theme is and then delete it. This part should be rewritten using Array.find (?)
                let customGet = JSON.parse(localStorage.getItem("PDFPointer-customThemeJson")).items; 
                let futureGet = [];
                for (let i = 0; i < Object.keys(customGet).length; i++) if (i !== theme.trackCustom) futureGet.push(customGet[i]);
                localStorage.setItem("PDFPointer-customThemeJson", JSON.stringify({ items: futureGet })); // Save the new item array
                setTimeout(() => {
                    document.getElementById("themeOptionShow").style.maxHeight = `${parseInt(document.getElementById("themeOptionShow").style.maxHeight.substring(0, document.getElementById("themeOptionShow").style.maxHeight.indexOf("px"))) - 57}px`; // Add height animation
                    themeContainerOption.style.backgroundColor = `${theme.accent}`; // Complete the color animation
                    themeContainerOption.classList.add("animate__animated", "animate__backOutDown"); // Disappear in the bottom side of the screen animation
                    setTimeout(() => {
                        themeContainerOption.remove(); // Remove the div from the DOM
                    }, 1000)
                }, 1000);
            })
        }
        themeContainerOption.append(themeName, ...applyContainerNew, document.createElement("br"));
        document.getElementById("themeOptionShow").append(themeContainerOption);
    }
}
getImg(document.querySelectorAll("[fetchlink]")); // Get all the images from the HTML and add a source link for their icon
fetchThemes(); // Get current themes
let defaultCheck = false;
function dialogGeneralAnimation(id, open) { // Function that manages the animation to show or hide dialogs
    if (open) {
        document.getElementById(id).style.display = "inline";
        document.getElementById(id).classList.add("animate__animated", "animate__backInDown");
        setTimeout(() => {
            document.getElementById(id).classList.remove("animate__animated", "animate__backInDown");
        }, 1100);
    } else {
        document.getElementById(id).classList.add("animate__animated", "animate__backOutDown");
        setTimeout(() => {
            document.getElementById(id).style.display = "none";
            document.getElementById(id).classList.remove("animate__animated", "animate__backOutDown");
        }, 1100);
    }
}
document.querySelector("[data-action=settings]").addEventListener("click", () => { // The user wants to see settings
    dialogGeneralAnimation("settings", true);
    blockKey = true;
    if (!defaultCheck) {
        for (let i = 0; i < switchIds.length; i++) { // switchIds is an array that contains information about checkboxes and the divs they need to show if checked
            switchIds[i][2].setAttribute("defaultHeight", `${switchIds[i][2].offsetHeight}px`);
            if (switchIds[i][3]) { // If a specific value (indicated with switchIds[i][3]) of the options is checked, then make the div (switchIds[i][0])
                switchIds[i][0].style.display = "inline";
                switchIds[i][0].style.opacity = "1";
            }
        }
        document.getElementById("themeOptionShow").style.maxHeight = `${document.getElementById("themeOptionShow").offsetHeight}px`; // Update height animation
    }

})
document.getElementById("closeSettings").addEventListener("click", () => { // Hide display dialog
    blockKey = false;
    dialogGeneralAnimation("settings", false);
})
document.getElementById("fileOpen").onchange = function () { // The file input of the PDF. When it changes, start reading the file 
    if (document.getElementById("fileOpen").files) {
        let fileRead = new FileReader();
        fileRead.onload = () => {
            startPDFRead(fileRead.result);
        }
        pdfName = document.getElementById("fileOpen").files[0].name;
        fileRead.readAsDataURL(document.getElementById("fileOpen").files[0]);
    }
}
document.getElementById("openPicker").addEventListener("click", () => { document.getElementById("fileOpen").click() }) // The button that starts the PDF reading process
let settingsToSave = { // An object that contains the LocalStorage key to edit, the position in the localOptions object of the item to save, and the type of the value stored
    localProperty: ["PDFPointer-currentcolor", "PDFPointer-timerselected", "PDFPointer-colorselected", "PDFPointer-timerlength", "PDFPointer-showtips", "PDFPointer-alertdurationn", "PDFPointer-customPointerEnable", "PDFPointer-customPointerColor", "PDFPointer-zoomType", "PDFPointer-movezoom", "PDFPointer-resizecanvas"],
    position: ["availableHighlightColors.currentColor", "dropdownSelectedOptions.timer", "dropdownSelectedOptions.color", "changeItems.timer", "changeItems.showTips", "changeItems.alertInt", "changeItems.pointerColorEnabled", "changeItems.pointerColorColor", "changeItems.keepZoomSize", "changeItems.moveZoom", "changeItems.resizeCanvas"],
    type: ["array", "int", "int", "int", "bool", "int", "bool", "string", "bool", "bool", "bool"]
}
for (let i = 0; i < settingsToSave.localProperty.length; i++) { // Restore values from LocalStorage
    if (localStorage.getItem(settingsToSave.localProperty[i]) !== null) { // If the value exist
        // Get the specific localOptions property
        let item = localOptions;
        let itemPart = settingsToSave.position[i].split(".");
        for (let x = 0; x < itemPart.length - 1; x++) item = item[itemPart[x]];
        switch (settingsToSave.type[i]) { // Look for the type of the LocalStorage value and apply it as a property of the localStorage item
            case "array":
                item[itemPart[itemPart.length - 1]] = localStorage.getItem(settingsToSave.localProperty[i]).split(",");
                break;
            case "int":
                item[itemPart[itemPart.length - 1]] = parseInt(localStorage.getItem(settingsToSave.localProperty[i]));
                break;
            case "bool":
                item[itemPart[itemPart.length - 1]] = localStorage.getItem(settingsToSave.localProperty[i]) === "true";
                break;
            case "string":
                item[itemPart[itemPart.length - 1]] = localStorage.getItem(settingsToSave.localProperty[i]);
                break;
        }
    }
}
let checkBoxClick = { 
    checkbox: [document.getElementById("alertCheck"), document.getElementById("pointerCheck"), document.getElementById("moveZoomCheck"), document.getElementById("resizeCanvasCheck")],
    changeVal: ["changeItems.showTips", "changeItems.pointerColorEnabled", "changeItems.moveZoom", "changeItems.resizeCanvas"]
}
for (let i = 0; i < checkBoxClick.checkbox.length; i++) { // Set the checkbox from the HTML checked if a value is set to true
    let item = localOptions;
    let itemPart = checkBoxClick.changeVal[i].split(".");
    for (let x = 0; x < itemPart.length - 1; x++) item = item[itemPart[x]];
    checkBoxClick.checkbox[i].checked = item[itemPart[itemPart.length - 1]];
}
let isFullscreen = false;
document.getElementById("pageContainer").style.margin = "0px auto";
document.querySelector("[data-action=fullscreen]").addEventListener("click", () => { // Go to fullscreen
    document.documentElement.requestFullscreen();
})
document.querySelector("[data-action=normalscreen]").addEventListener("click", () => { // Exit to fullscreen
    document.exitFullscreen();
});
function intelligentCursor(element) { // Update cursor looking for the current action selected
    if (document.querySelector(`[data-action=pen]`).classList.contains("clickImg")) {
        getImg([element], `pen-fill`, true);
    } else if (document.querySelector(`[data-action=erase]`).classList.contains("clickImg")) {
        getImg([element], `erase-fill`, true);
    } else {
        getImg([element], `pointer`, true)
    }
}
document.querySelector("[data-action=erase]").addEventListener("click", () => { zoomTrack.currentlyErasing = false; });
document.getElementById("displayCanvas").addEventListener("hover", intelligentCursor(document.getElementById("displayCanvas")));
document.addEventListener('fullscreenchange', (e) => { // The user has entered or exited fullsreen
    canvasDrawCheck();
    if (document.fullscreenElement) { // The user is in fullscreen, adapt the UI by making the canvas bigger and moving the toolbar at the left
        isFullscreen = true;
        let getAvailableSpace = (window.innerWidth * 10 / 100) + document.getElementById("containerOfOptions").offsetWidth;
        document.getElementById("toolMain").classList.remove("vertcenter");
        document.getElementById("containerOfOptions").classList.add("fullcontainer");
        document.getElementById("pdfcontainer").style = `display: flex; float: left; width: ${window.innerWidth - getAvailableSpace - 2}px`;
        document.querySelector("[data-action=fullscreen]").style.display = "none";
        startWidth[1] = [document.documentElement.clientWidth, document.documentElement.clientHeight];
        startWidth[2] = [document.documentElement.clientWidth, document.documentElement.clientHeight];
        document.getElementById("containerOfOptions").style.marginTop = "30px";
        document.getElementById("containerOfOptions").style.marginBottom = "30px";
        document.querySelector("[data-action=normalscreen]").style.display = "inline";
        for (let item of document.querySelectorAll("[data-moveleft]")) item.style = `margin-bottom: ${item.getAttribute("data-moveleft")}`;
        for (let item of document.querySelectorAll("[data-moveright]")) item.style = `margin-top: ${item.getAttribute("data-moveright")}`;
        if (zoomTrack.zoomLevel < 3) document.querySelector("[data-action=zoomin]").click(); else document.querySelector("[data-action=zoomout]").click();
                setupTranlsation();
    } else { // The user has exited fullscreen, restore default UI
        isFullscreen = false;
        document.getElementById("toolMain").classList.add("vertcenter");
        document.getElementById("containerOfOptions").classList.remove("fullcontainer");
        document.getElementById("pdfcontainer").style = "";
        document.getElementById("pdfcontainer").classList.add("vertcenter");
        document.querySelector("[data-action=normalscreen]").style.display = "none";
        document.querySelector("[data-action=fullscreen]").style.display = "inline";
        document.getElementById("containerOfOptions").style.marginTop = "0px";
        document.getElementById("containerOfOptions").style.marginBottom = "0px";
        document.getElementById("pageContainer").style.marginLeft = "";
        document.getElementById("pageContainer").style.margin = "0 auto";
        startWidth[2] = startWidth[0];
        for (let item of document.querySelectorAll("[data-moveleft]")) item.style = `margin-right: ${item.getAttribute("data-moveleft")}`;
        for (let item of document.querySelectorAll("[data-moveright]")) item.style = `margin-left: ${item.getAttribute("data-moveright")}`;
                setupTranlsation();

    }
});
let zoomTrack = {
    zoomLevel: 1,
    x: 0,
    y: 0,
    currentlyErasing: false
}
let precedentZoomPosition = [0, 0]; // [x, y]
let originalWidth = 0;
document.querySelector("[data-action=zoomin]").addEventListener("click", () => { // Zoom in the PDF canvas
    if (localStorage.getItem("PDFPointer-zoomType") === null) optionProxy.changeItems.keepZoomSize = false; // Set default zoom file: the canvas will be expanded, and its size in the DOM will change
    zoomTrack.zoomLevel += 0.5;
    if (zoomTrack.zoomLevel > 3) { // 300% is the maxinum zoom
        topAlert(`300% ${globalTranslations.maxZoom}`, "maxZoom");
        zoomTrack.zoomLevel = 3;
        return;
    }
    if (optionProxy.changeItems.keepZoomSize) { // If the user wants to keep the canvas as the same size, set again some div settings
        setFixedWidth();
        resizeCanvasSameSize();
    } else { // Move the canvas a little bit so that it doesn't get cutted on high zoom
        if (isFullscreen) document.getElementById("pageContainer").style.marginLeft = `${document.getElementById("containerOfOptions").getBoundingClientRect().right + 40}px`;
        canvasGeneralResize();
    }
});
function canvasGeneralResize() { // Resize the default canvas and its annotations
    if (originalWidth === 0) originalWidth = [document.getElementById("displayCanvas").style.width, document.getElementById("displayCanvas").style.height, document.getElementById("displayCanvas").height, document.getElementById("displayCanvas").width] // Update the canvas width and height
    let oldHeight = document.getElementById("displayCanvas").height;
    let oldWidth = document.getElementById("displayCanvas").width;
    // Update the canvas width and height with the new zoom
    document.getElementById("displayCanvas").style.width = `${originalWidth[0].replace("px", "") * zoomTrack.zoomLevel}px`;
    document.getElementById("displayCanvas").style.height = `${parseInt(originalWidth[1].replace("px", "")) * zoomTrack.zoomLevel}px`;
    document.getElementById("displayCanvas").height = originalWidth[2] * zoomTrack.zoomLevel;
    document.getElementById("displayCanvas").width = originalWidth[3] * zoomTrack.zoomLevel;
    document.getElementById("displayCanvas").getContext("2d").drawImage(proxyCanvas, 0, 0, document.getElementById("displayCanvas").width, document.getElementById("displayCanvas").height); // Draw a new canvas with the new height
    if (document.body.offsetWidth < parseInt(document.getElementById("displayCanvas").style.width.replace("px", ""))) document.getElementById("canvasMargin").style.marginLeft = `${(parseInt(document.getElementById("displayCanvas").style.width.replace("px", "")) - document.body.offsetWidth)}px`; else document.getElementById("canvasMargin").style.marginLeft = `0px`; // Add margin-left so that the new canvas won't be cutted on high zoom
    for (let itemOld of document.querySelectorAll("g")) { // Get all the SVG items and scale them
        if (optionProxy.changeItems.moveZoom) {
            item = itemOld.parentElement;
            if (item.parentElement.style.display === "none") continue;
            let generalScale = parseFloat(item.parentElement.getAttribute("data-zoom")); // Get the scale the SVG items were created
            // Scale the item
            item.parentElement.style.transformOrigin = "top left"; 
            item.parentElement.style.transform = `scale(${zoomTrack.zoomLevel / generalScale})`;
        } else {
            if (parseFloat(itemOld.parentElement.parentElement.getAttribute("data-zoom")) === zoomTrack.zoomLevel) itemOld.parentElement.parentElement.style.display = "inline"; else itemOld.parentElement.parentElement.style.display = "none";
        }
    }
}
document.getElementById("chooseFirst").addEventListener("click", () => { // Change the zoom type: (Keep the same canvas size)
    optionProxy.changeItems.keepZoomSize = true;
    closeCanvasDialog();
});
document.getElementById("chooseSecond").addEventListener("click", () => { // Change the zoom type: (Scale the canvas size)
    optionProxy.changeItems.keepZoomSize = false;
    closeCanvasDialog();
});
function closeCanvasDialog() {
    dialogGeneralAnimation("zoomChooseContainer", false);
}
document.querySelector("[data-action=zoomout]").addEventListener("click", () => { // Zoom out the PDF
    // For annotations, see [data-action=zoomin]. Nothing basically changes.
    if (localStorage.getItem("PDFPointer-zoomType") === null) optionProxy.changeItems.keepZoomSize = false;
    zoomTrack.zoomLevel -= 0.5;
    if (zoomTrack.zoomLevel < 0.5) {
        topAlert(`50% ${globalTranslations.minZoom}`, "minZoom");
        zoomTrack.zoomLevel = 0.5;
        return;
    }
    if (optionProxy.changeItems.keepZoomSize) {
        setFixedWidth();
        resizeCanvasSameSize();
    } else {
        if (isFullscreen) document.getElementById("pageContainer").style.marginLeft = `${document.getElementById("containerOfOptions").getBoundingClientRect().right + 40}px`;
        canvasGeneralResize();
    }
    zoomTrack.x = 0;
    zoomTrack.y = 0;

})
let storeOriginalSize = []; // The original width and height of the display cnavas
function resizeCanvasSameSize() { // Resize the canvas by keeping the same width
    // Update width and height
    document.getElementById("displayCanvas").style.width = `${parseInt(storeOriginalSize[0].replace("px", "") * zoomTrack.zoomLevel)}px`;
    document.getElementById("displayCanvas").style.height = `${parseInt(storeOriginalSize[1].replace("px", "") * zoomTrack.zoomLevel)}px`;
    document.getElementById("displayCanvas").style.minHeight = document.getElementById("displayCanvas").style.height;
    document.getElementById("displayCanvas").width = storeOriginalSize[2] * zoomTrack.zoomLevel;
    document.getElementById("displayCanvas").height = storeOriginalSize[3] * zoomTrack.zoomLevel;
    // Draw the new canvas with the zoomed height
    document.getElementById("displayCanvas").getContext("2d").drawImage(proxyCanvas, 0, 0, document.getElementById("displayCanvas").width, document.getElementById("displayCanvas").height);
    for (let item of document.querySelectorAll("g")) { // Scale the SVG items to the new zoom 
        if (optionProxy.changeItems.moveZoom) {
            item.parentElement.parentElement.style.transformOrigin = "top left";
            item.parentElement.parentElement.style.transform = `scale(${zoomTrack.zoomLevel / parseInt(item.parentElement.parentElement.getAttribute("data-zoom"))})`;
        } else {
            if (parseFloat(item.parentElement.parentElement.getAttribute("data-zoom")) === zoomTrack.zoomLevel) item.parentElement.parentElement.style.display = "inline"; else item.parentElement.parentElement.style.display = "none";
        }
    }
}
function setFixedWidth(force) { // Make the canvas overflow and keep it the same size as the 100% (only if the user wants to)
    if (document.getElementById("canvasContainer").style.width !== "" && !force) return;
    document.getElementById("canvasContainer").style = `overflow: auto; width: ${document.getElementById("displayCanvas").style.width}; height: ${document.getElementById("displayCanvas").style.height}; position: relative`;
    storeOriginalSize = [document.getElementById("displayCanvas").style.width, document.getElementById("displayCanvas").style.height, document.getElementById("displayCanvas").width, document.getElementById("displayCanvas").height];
}
function storeCustomOptions(option, key) { // Save a custom JSON file in the LocalStorage
    for (let i = 0; i < key.length; i++) localStorage.setItem(key[i], JSON.stringify(option[i]));
}
let getLicense = {}; // Object that will contain all the open-source license types used by pdf-pointer
fetch(`./translationItems/licenses.json`).then((res) => { res.json().then((json) => { getLicense = json }) }); // Fetch the JSON file that contains all the license content
for (let item of document.querySelectorAll("[data-license]")) {
    item.addEventListener("click", () => {
        document.getElementById("licenseAnimatiom").classList.add("animate__animated", "animate__shakeX"); // Add a shake animation to the new license text 
        item.classList.add("animate__animated", "animate__shakeX"); // And add it also to the label of the open-source library
        document.getElementById("licenseText").innerHTML = getLicense[item.getAttribute("data-license")].replace("{DateAndAuthorReplace}", item.getAttribute("data-author")).replaceAll("\n", "<br>"); // Replace the author placeholder and set the license content
        setTimeout(() => { // Remove the animation after an amount of time
            item.classList.remove("animate__animated", "animate__shakeX");
            document.getElementById("licenseAnimatiom").classList.remove("animate__animated", "animate__shakeX");
        }, 1000);
    });
}
document.getElementById("appversion").textContent = appVersion; // Update the app version number

function dropFile(event) { // Set drop file event for PDF reading
    function readFileStart(itemToRead) {
        let fileRead = new FileReader();
        fileRead.onload = function () {
            startPDFRead(fileRead.result);
        }
        pdfName = itemToRead.name;
        fileRead.readAsDataURL(itemToRead);
    }
    event.preventDefault();
    if (event.dataTransfer.items) {
        if (event.dataTransfer.items[0].kind === "file") readFileStart(event.dataTransfer.items[0].getAsFile());
    } else {
        readFileStart(event.dataTransfer.files[0]);
    }
}
// Add drag events
document.getElementById("openDiv").addEventListener("drop", (e) => { dropFile(e) });
document.getElementById("openDiv").addEventListener("dragover", (e) => { e.preventDefault(); });
document.getElementById("openDiv").addEventListener("dragenter", () => { document.getElementById("openDiv").classList.add("dropNotice") });
// Manage custom animation for some images in divs
for (let animateEnd of document.getElementsByClassName("optionId")) {
    if (animateEnd.childNodes[1] !== undefined && animateEnd.childNodes[1].tagName.toLowerCase() === "img") {
        animateEnd.addEventListener("mouseleave", () => {
            animateEnd.childNodes[1].classList.add("closeAnimationTool");
            setTimeout(() => { animateEnd.childNodes[1].classList.remove("closeAnimationTool"); }, 350);
        })
    }
}
// Get the preferred user language, and, if it's Italian, load the Italian language JSON
let language = navigator.language || navigator.userLanguage;
if (language.indexOf("it") !== -1 && window.location.href.indexOf("nolang") === -1 && localStorage.getItem("PDFPointer-nolang") !== "yes") { // Check if Italian is a preferred language
    fetch(`./translationItems/it.json`).then((res) => { 
        res.json().then((json) => {
            for (let item of document.querySelectorAll("[data-translate]")) item.textContent = json[item.getAttribute("data-translate")]; // Change text of content with data-translate attribute
            globalTranslations = json.globalTranslations; // Update global translations (the translations of strings that are handled by JavaScript)
            topAlert(globalTranslations.changeLang, "differentlang", true); // Notice the user a thing has been noticed
        })
    })
}
document.querySelector("[data-translate=customThemeBtn]").addEventListener("click", () => {
    window.location.href = `./themeCreator/create.html`
})
if (localStorage.getItem("PDFPointer-selectedtheme") !== null && document.querySelector(`[data-themerefer=${localStorage.getItem("PDFPointer-selectedtheme")}]`) !== null) document.querySelector(`[data-themerefer=${localStorage.getItem("PDFPointer-selectedtheme")}]`).click(); // If the user has changed the themem, and therefore the new theme is saved in a variable, look the apply button that contains that theme and click it.
document.getElementById("alertNumberDuration").addEventListener("change", () => { optionProxy.changeItems.alertInt = document.getElementById("alertNumberDuration").value }); // Update the value that express in ms the amount of time the alert should be visible
document.querySelector("[data-translate=resetTip]").addEventListener("click", () => { localStorage.setItem("PDFPointer-notshow", "") }); // The button that reset the dismissed alerts (the ones where the user clicked "Don't show again")
for (let item of document.getElementsByClassName("button")) { // Add hover animation for each div that has the button class
    if (parseInt(item.getAttribute("data-customAnimate")) !== 1) {
        item.addEventListener("mouseenter", () => {
            item.classList.remove("hoverEnd");
            item.classList.add("hoverStart");
        });
        item.addEventListener("mouseleave", () => {
            item.classList.remove("hoverStart");
            item.classList.add("hoverEnd");
        })
    }
}
// Get Progressive Web App installation prompt and then show it when the user want to install the website as PWA
let installationPrompt;
window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    installationPrompt = event;
});
document.querySelector("[data-translate=installBtn]").addEventListener("click", () => {
    installationPrompt.prompt();
    installationPrompt.userChoice.then(choice => {
        if (choice.outcome === "accepted") PWAHide();
    });
});
function PWAHide() { // Hide the PWA promotion card
    document.getElementById("pwaPromote").remove();
    for (let item of document.querySelectorAll("[data-card=opencard]")) item.style.width = "100%";
}
if (window.matchMedia('(display-mode: standalone)').matches) PWAHide(); // The website is running as a PWA
function continueShow(progress) { // The function that handles going from a new tab to another one on the guided tour of PDFPointer
    if (progress === 0) {
        document.getElementById(`intro${progress + 1}`).classList.add("animateFirstIntroduction");
        document.getElementById(`innerContents${progress + 1}`).classList.add("animateFirstIntroduction");
    } else {
        document.getElementById(`intro${progress + 1}`).classList.add("animateSecondIntroduction");
        document.getElementById(`innerContents${progress + 1}`).classList.add("animateSecondIntroduction");
    }
    document.getElementById(`innerContents${progress + 1}`).style.opacity = 0;
    setTimeout(() => {
        document.getElementById(`intro${progress + 1}`).style.display = "none";
        document.getElementById(`intro${progress + 2}`).style.display = "block";
        document.getElementById(`intro${progress + 2}`).style.opacity = 1;
    }, 500)
};
for (let item of document.querySelectorAll("[data-progress]")) item.addEventListener("click", () => { continueShow(parseInt(item.getAttribute("data-progress"))) }); // Add event to each "Continue" button of each PDFPointer guided tour tab
document.querySelector("[data-translate=endTour]").addEventListener("click", () => { // End guided tour: set it as completed and then hide the introduction container
    document.getElementById("introContainer").style.opacity = 0;
    localStorage.setItem("PDFPointer-endtour", "true");
    setTimeout(() => { document.getElementById("introContainer").style.display = "none" }, 500)
})
if (localStorage.getItem("PDFPointer-endtour") === null) {
    document.getElementById("introContainer").style.display = "inline";
    document.getElementById("introContainer").style.opacity = 1;
}
for (let item of document.querySelectorAll("[data-customAnimate='1']")) hoverItem(item); // Add custom hover animation (brightness) for each of these items
let switchIds = [[document.getElementById("pointerSelectionDiv"), document.getElementById("pointerCheck"), document.getElementById("pointerContainer"), "changeItems.pointerColorEnabled"], [document.getElementById("alertContainer"), document.getElementById("alertCheck"), document.getElementById("alertMain"), "changeItems.showTips"]];
// The following function will manage switches/checkboxes: by passing the div that contains the switch, the checkbox itself, the div to show and the localOptions item to change, the following function will make visible extra content and save in the LocalStorage the selection the user has done
for (let i = 0; i < switchIds.length; i++) switchSubsectionShow(switchIds[i][0], switchIds[i][1], switchIds[i][2], switchIds[i][3]);
function switchSubsectionShow(containerDiv, switchVal, generalDiv, optionToChange) {
    let item = optionProxy;
    let itemPart = optionToChange.split(".");
    for (let x = 0; x < itemPart.length - 1; x++) item = item[itemPart[x]];
    switchVal.addEventListener("input", () => {
        item[itemPart[itemPart.length - 1]] = switchVal.checked;
        if (switchVal.checked) {
            generalDiv.style.maxHeight = `${generalDiv.offsetHeight}px`;
            containerDiv.style.display = "inline";
            generalDiv.style.maxHeight = `${generalDiv.offsetHeight}px`;
            setTimeout(() => { containerDiv.style.opacity = 1; }, 50);
        } else {
            containerDiv.style.opacity = 0;
            setTimeout(() => {
                generalDiv.style.maxHeight = generalDiv.getAttribute("defaultHeight");
                setTimeout(() => { containerDiv.style.display = "none"; }, 150);

            }, 350);
        }
    });
}
document.getElementById("pointerColorSelector").addEventListener("input", () => { optionProxy.changeItems.pointerColorColor = document.getElementById("pointerColorSelector").value }); // Kinda funny key name, but simply when the user changes the preferred pointer color, it'll apply it also to the localOptions, so that the application will actually use that value
document.querySelector("[data-translate=exportColor]").addEventListener("click", () => { // Export the colors the user has created for the drawing function
    let a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(optionProxy.availableHighlightColors)], { type: "text/plain" }));
    a.download = `colors-export.json`;
    a.click();
})
document.querySelector("[data-translate=importColor]").addEventListener("click", () => { // Import the colors for the drawing function
    let file = document.createElement("input");
    file.type = "file";
    file.onchange = () => {
        let read = new FileReader();
        read.onload = () => {
            let parse = JSON.parse(read.result); // Parse the JSON option
            optionProxy.availableHighlightColors = { "currentColor": [255, 0, 0, 255] }; // Create an empty availableHighlightColors object with only the currentColor (so that if there's nothing to import there'll still be something)
            for (let item in parse) {
                if (item === "currentColor") continue;
                let continueImport = true;
                for (let part of parse[item]) try { if (parseInt(part) > 255 || parseInt(part) < 0) continueImport = false } catch (ex) { console.warn(ex); continueImport = false }; // Look if the item is in the RGB range. If not, don't import it.
                if (!continueImport) continue;
                optionProxy.availableHighlightColors[item] = parse[item];
            }
            localStorage.setItem("PDFPointer-customColors", JSON.stringify(optionProxy.availableHighlightColors)); // Add the new availableHighlightColors in the LocalStorage, so that it can be restored even when the user refreshes the page
            alert("Colors restored. The page will be refreshed.");
            location.reload();
        }
        read.readAsText(file.files[0]);
    }
    file.click();
})
document.querySelector("[data-translate=resetColor]").addEventListener("click", () => { // Reset the current color combination
    optionProxy.availableHighlightColors = {
        "Red": [255, 0, 0, 255],
        "Blue": [0, 0, 255, 255],
        "Green": [0, 255, 0, 255],
        "currentColor": [255, 0, 0, 255],
    };
    localStorage.setItem("PDFPointer-customColors", JSON.stringify(optionProxy.availableHighlightColors)); // Set the default custom color for drawing in the LocalStorage
    alert("Colors restored. The page will be refreshed.");
    location.reload();
});
document.querySelector("[data-translate=changeZoom]").addEventListener("click", () => { // The button that permits the user to change the zoom type (keep canvas size or expand canvas). By clicking it, it will open the "Settings dialog"
    dialogGeneralAnimation("settings", false);
    setTimeout(() => { dialogGeneralAnimation("zoomChooseContainer", true) }, 1150);
})
window.scrollTo({ top: 0, behavior: 'smooth' });
// If the video fails to run
for (let item of document.querySelectorAll("video")) item.addEventListener("error", () => {
    let parent = item.parentElement;
    item.remove();
    parent.textContent = "An error occourred while streaming the video :(";
});
let currentScroll = false;
document.body.addEventListener("wheel", () => { // When the page scrolls, look the position of the toolbar. If it's not visible, make it fixed, so that it can be reached without going on the top of the page
    if (document.getElementById("toolMain").style.visibility === "hidden") return; // The user still is on the loading page
    if (isFullscreen) { // If is in fullscreen, the toolbar will need to stay at the left of the screen
        document.getElementById("generalToolContainer").style = "position: fixed; z-index: 9999997;";
    } else if (window.scrollY > (document.getElementById("generalToolContainer").getBoundingClientRect().bottom + document.getElementById("generalToolContainer").getBoundingClientRect().top)) { // Otherwise, if basically the toolbar is no longer visible, make it fixed
        if (currentScroll) return;
        currentScroll = true;
        document.getElementById("generalToolContainer").style = "position: fixed; z-index: 9999997; top: 15px;";
    } else { // The user can still see the toolbar, so set it as default
        if (!currentScroll) return;
        document.getElementById("generalToolContainer").style = "";
        currentScroll = false;
    }
})
// Set up video streaming for a few resources (principally the introduction videos and the zoom options ones)
for (let item of document.querySelectorAll("[data-videofetch]")) {
    fetch(`${positionLink}assets/${item.getAttribute("data-videofetch")}`).then((res) => {
        res.blob().then((blob) => {
            item.src = URL.createObjectURL(blob);
        }).catch((ex) => { console.warn(ex) })
    }).catch((ex) => { console.warn(ex) });
}
document.getElementById("welcomeClick").addEventListener("click", () => { window.location.reload() }); // If the user clicks either on the PDFPointer icon or on the "PDFPointer" title, refresh the page (so that the user can choose another file)
// Delete NoScript hover. Usually, this should throw an exception, since JavaScript should be enabled
try {
    document.getElementById("jsContinue").addEventListener("click", () => { document.getElementById("jsPromptAsk").remove(); }) // If for some strange reason JavaScript is enabled, but the NoScript tab is still visible
    document.getElementById("jsPromptAsk").remove();
} catch (ex) {
    console.log("Hello World! :D"); // Desired output
}
if (window.location.href.indexOf("nolang") !== -1) localStorage.setItem("PDFPointer-nolang", "yes"); // Save that the user prefers the default language (English) (look at mthe URL)
if (window.location.href.indexOf("itlang") !== -1) { // Save that the user want to use the Italian language (look at the URL)
    localStorage.setItem("PDFPointer-nolang", "no");
    window.location.href = window.location.href.substring(0, window.location.href.indexOf("?itlang"));
}
document.getElementById("langOption").addEventListener("input", () => { // Change the default language from the Settings
    switch (document.getElementById("langOption").value) {
        case "en":
            localStorage.setItem("PDFPointer-nolang", "yes");
            break;
        case "it":
            localStorage.setItem("PDFPointer-nolang", "no");
            break;
    }
    let href = `${window.location.href}?`;
    window.location.href = window.location.href.substring(0, href.indexOf("?"));
})
let simpleSwitchAction = [["moveZoomCheck", "resizeCanvasCheck"], ["changeItems.moveZoom", "changeItems.resizeCanvas"]]; // An array of Checkboxes that change a value from the localOptions if checked or unchecked
for (let i = 0; i < simpleSwitchAction[0].length; i++) document.getElementById(simpleSwitchAction[0][i]).addEventListener("input", () => {
    // Find the item to change in the localOptions
    let item = optionProxy;
    let itemPart = simpleSwitchAction[1][i].split(".");
    for (let x = 0; x < itemPart.length - 1; x++) item = item[itemPart[x]];
    item[itemPart[itemPart.length - 1]] = document.getElementById(simpleSwitchAction[0][i]).checked; // Change it (boolean, if checked)
})
function showResizeCanvasBtn(show) { // The function that shows two additional actions: reduce or increase the space used by Canvas in 100% zoom
    document.querySelector("[data-action=expand]").style.display = show;
    document.querySelector("[data-action=contract]").style.display = show;
}
document.getElementById("resizeCanvasCheck").addEventListener("input", () => { // The checkbox that regulates if the buttons that decrease or increase the canvas size of the 100% zoom
    if (document.getElementById("resizeCanvasCheck").checked) showResizeCanvasBtn("block"); else showResizeCanvasBtn("none");
    setupTranlsation();
});
if (!optionProxy.changeItems.resizeCanvas || !localStorage.getItem("PDFPointer-resizecanvas")) showResizeCanvasBtn("none"); // Restore the option
document.querySelector("[data-action=expand]").addEventListener("click", () => { // Increase the zoom of the canvas size by 5%
    canvasGeneralScale += 5;
    canvasPDF(loadPDF.page);
});
document.querySelector("[data-action=contract]").addEventListener("click", () => { // Decrease the zoom of the canvas size by 5%
    canvasGeneralScale -= 5;
    canvasPDF(loadPDF.page);
});
document.querySelector("[data-translate=applyyt]").addEventListener("click", () => { // Fetch a YouTube embed link from a link
    let ytLink = document.getElementById("ytLinkValue").value;
    if (ytLink.indexOf("&") !== -1) ytLink = ytLink.substring(0, ytLink.indexOf("&")); // Delete additional, useless parameters from the URL
    if (ytLink.indexOf("watch?v=") !== -1) localStorage.setItem("PDFPointer-ytLink", ytLink.substring(ytLink.indexOf("watch?v=")).replace("watch?v=", "")); else if (ytLink.indexOf("playlist?list=") !== -1) localStorage.setItem("PDFPointer-ytLink", `videoseries?list=${ytLink.substring(ytLink.indexOf("playlist?list=")).replace("playlist?list=", "")}`); else if (ytLink.indexOf("youtu.be") !== -1) localStorage.setItem("PDFPointer-ytLink", ytLink.substring(ytLink.lastIndexOf("/") + 1));
    ytEmbed(); // Look if it's a video or a playlist, and generate the correct embed link for this.
})
document.getElementById("backgroundOptions").addEventListener("input", () => { manageBackground() }); // The select that permits to change the background of the website
function manageBackground() {
    function dontShow(reverse) { // Shows the first item of the array, hides the seco one
        let items = [document.getElementById("ytlinkask"), document.getElementById("imgAsk")];
        if (reverse) items.reverse();
        if (items[1].style.opacity !== 1) {
            items[1].style.opacity = 0;
            setTimeout(() => {
                items[1].style.display = "none"; items[0].style.display = "inline";
                setTimeout(() => { items[0].style.opacity = 1 }, 15);
            }, 400);
        } else {
            items[0].style.display = "inline";
            setTimeout(() => { items[0].style.opacity = 1 }, 15);
        }
        document.getElementById("styleItem").style.display = "inline"; // Add custom styling options (blur & brightness)
        setTimeout(() => { document.getElementById("styleItem").style.opacity = "1" }, 15);
    }
    localStorage.setItem("PDFPointer-backgroundId", document.getElementById("backgroundOptions").value); // Update the LocalOption value of the background, so that it can be restored when the user refreshes the page
    switch (parseInt(document.getElementById("backgroundOptions").value)) { // Look at what the user selected
        case 1: // The user wants to put a YouTube video as a background
            dontShow();
            if (document.getElementById("imgRefer") !== null) document.getElementById("imgRefer").remove(); // Remove the background image
            if (localStorage.getItem("PDFPointer-ytLink") !== null) document.querySelector("[data-translate=applyyt]").click(); // And, if there's a valid link, start the YouTube video playback
            break;
        case 2: // The user wants to put a background image as, well, background
            dontShow(true);
            // Restore YouTube embed values
            document.querySelector(".video-background").style.display = "none";
            document.getElementById("ytframe").src = "";
            if (localStorage.getItem("PDFPointer-customImg") !== null) imgEmbed(); // If there's a valid image, set it as background
            break;
        default: // The user is okay with a classic background, so delete every background image and/or YouTube video
            document.getElementById("ytlinkask").style.opacity = 0;
            document.getElementById("imgAsk").style.opacity = 0;
            if (document.getElementById("imgRefer") !== null) document.getElementById("imgRefer").remove();
            document.getElementById("ytframe").src = "";
            document.getElementById("styleItem").style.opacity = 0;
            setTimeout(() => { document.getElementById("ytlinkask").style.display = "none"; document.getElementById("styleItem").style.display = "none"; document.getElementById("imgAsk").style.display = "none"; }, 400);
            break;
    }
};
document.querySelector("[data-translate=chooseimg]").addEventListener("click", () => { // The user needs to choose the image to upload
    let input = document.createElement("input");
    input.type = "file";
    input.onchange = () => {
        let read = new FileReader();
        read.onload = () => {
            let img = document.createElement("img");
            img.onload =  () => {
                let multiplicationType = 1.5;
                function generateImage() {
                let canvas = document.createElement("canvas");
                let outputScale = window.devicePixelRatio || 1;
                if (canvas.width > canvas.height) {
                    canvas.height = window.screen.height * multiplicationType * outputScale;
                    canvas.width = img.width * canvas.height / img.height; // I know that there's another function that does proportion but it's easier to do that here
                } else {
                    canvas.width = window.screen.width * multiplicationType * outputScale;
                    canvas.height = img.height * canvas.width / img.width; // I know that there's another function that does proportion but it's easier to do that here
                }
                canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
                let imgUrl = canvas.toDataURL("image/jpeg", 0.5); // Get the data URL of the new image
                if (imgUrl.length > 1_333_333) { // The image size is too big, especially since lots of other things may be in the LocalStorage's limited memory (5MB). It'll be resized.
                    multiplicationType -= 0.15;
                    generateImage();
                    return
                } else {
                localStorage.setItem("PDFPointer-customImg", imgUrl);
                    imgEmbed();
                }
            }
            generateImage();
            }
            img.src = read.result;
        }
        read.readAsDataURL(input.files[0]);
    }
    input.click();
})
function ytEmbed() { // Add the YouTube embed link to the iFrame
    document.querySelector(".video-background").style.display = "block";
    let buildSymbol = "?";
    if (localStorage.getItem("PDFPointer-ytLink").indexOf("?") !== -1) buildSymbol = "&";
    document.getElementById("ytframe").src = `https://www.youtube-nocookie.com/embed/${localStorage.getItem("PDFPointer-ytLink")}${buildSymbol}autoplay=1&mute=1`; // Add autoplay and mute. Look for the symbol since, for playlist, the first argument of the link is the playlist ID, while on the video there's no argument
    generateFilters(); // Add blur and brightness filter to the content
}
function imgEmbed() {
    if (document.getElementById("imgRefer") !== null) document.getElementById("imgRefer").remove(); // Delete the old image
    let img = document.createElement("img");
    img.style = "z-index: -1; position: fixed; width: 100vw; height: 100vh; margin: 0; top: 0; left: 0; object-fit: cover;"; // Set the image to 100% of the document, behind the document and make it fill.
    img.src = localStorage.getItem("PDFPointer-customImg");
    img.id = "imgRefer"
    document.body.append(img);
    generateFilters(); // Add blur and brightness filter to the content
}
function generateFilters() {
    let applyFilter = `blur(${document.getElementById("blurRange").value}px) brightness(${document.getElementById("brightRange").value}%)`; // The CSS style value to apply as filter
    if (document.getElementById("imgRefer") !== null) document.getElementById("imgRefer").style.filter = applyFilter;
    if (document.getElementById("imgRefer") !== null) document.getElementById("imgRefer").style.webkitFilter = applyFilter;
    document.querySelector(".video-background").style.filter = applyFilter;
    document.querySelector(".video-background").style.webkitFilter = applyFilter;
}
if (localStorage.getItem("PDFPointer-ytLink") === null) localStorage.setItem("PDFPointer-ytLink", "videoseries?list=PLuu93Gnhjs5BJ-kf5IxMwPGftIFqlMVZu"); // If there's no custom YT video saved, put a beautiful playlist of Minecraft parkour videos as background. Unfortunately, I can't put a text-to-speech reading a Reddit story of r/AmItheAsshole :(
if (window.location.href.indexOf("ytconcentration") !== -1) localStorage.setItem("PDFPointer-backgroundId", "1"); // Link shortcut to enable YouTube background
document.getElementById("blurRange").addEventListener("input", () => { localStorage.setItem("PDFPointer-blur", document.getElementById("blurRange").value); generateFilters() }); // If custom filter is saved, restore the value for the slider and generate filter again
document.getElementById("brightRange").addEventListener("input", () => { localStorage.setItem("PDFPointer-bright", document.getElementById("brightRange").value); generateFilters() }); // If custom filter is saved, restore the value for the slider and generate filter again
if (localStorage.getItem("PDFPointer-backgroundId") !== null) { // The user has changed background, so it needs to be applied
    if (parseInt(localStorage.getItem("PDFPointer-backgroundId")) === 1) ytEmbed(); else if (parseInt(localStorage.getItem("PDFPointer-backgroundId")) === 2) imgEmbed();
    document.getElementById("backgroundOptions").value = localStorage.getItem("PDFPointer-backgroundId");
    let itemsLook = [["PDFPointer-ytLink", "PDFPointer-blur", "PDFPointer-bright"], [document.getElementById("ytLinkValue"), document.getElementById("blurRange"), document.getElementById("brightRange")]] // An array that contains the [LocalStorage properties, item to change the value]
    for (let i = 0; i < itemsLook.length; i++) if (localStorage.getItem(itemsLook[0][i]) !== null) itemsLook[1][i].value = localStorage.getItem(itemsLook[0][i]);
    manageBackground();
    generateFilters();
}
document.querySelector("[data-action=downloadAsImg]").addEventListener("click", () => { createSaveImgDropdown() }); // The action that permits to save the PDF as an image
function createSaveImgDropdown() {
    // Another function is created since basically it's completely different from every other dropdown
    if (optionProxy.showAlert.downloadImg) return;
    let dropdown = createDropdown(document.querySelector("[data-action=downloadAsImg]"), true, "downloadImg"); // Create the dropdown dialog, with a custom icon (since the save icon wouldn't be a great fit)
    // Create a select where the user can choose the quality
    let select = document.createElement("select");
    select.id = "exportSelect";
    select.classList.add("fillWidth");
    for (let item of ["JPG", "PNG", "WebP"]) { // Create the quality option
        let option = document.createElement("option");
        option.textContent = item;
        option.value = item;
        select.append(option)
    }
    select.firstChild.selected = "true";
    if (navigator.userAgent.toLowerCase().indexOf("safari") !== -1 && navigator.userAgent.toLowerCase().indexOf("chrome") === -1) { 
        select.childNodes[2].disabled = true; // Disable WebP export if the user is using WebKit
        let newStyle = document.createElement("style"); 
        newStyle.innerHTML = `input[type='range'],input[type='range']::-webkit-slider-runnable-track,input[type='range']::-webkit-slider-thumb {-webkit-appearance: none;border-radius: 15px;}`; // Fix input type range broken for Safari by adding custom stylesheet
        document.head.append(newStyle);
    }
    // Create label with export information
    let infoLabel = document.createElement("l");
    infoLabel.textContent = globalTranslations.exportInformation;
    // Create a button to save the image
    let saveBtn = document.createElement("div");
    saveBtn.classList.add("vertcenter", "opacityRemove");
    let save2 = document.createElement("div");
    save2.classList.add("optionId", "button", "hoverEnd");
    let savefinal = document.createElement("div");
    savefinal.classList.add("vertcenter");
    savefinal.textContent = globalTranslations.save;
    save2.append(savefinal);
    saveBtn.append(save2);
    // Create a slider that permits the user to choose the quality of the export
    let qualityContainer = document.createElement("div");
    qualityContainer.classList.add("opacityRemove")
    let qualityInformation = document.createElement("l");
    qualityInformation.textContent = globalTranslations.qualityInfo;
    let slider = createRange("1", "0.9", "0.01", "exportSlider", "0.01");
    select.addEventListener("input", () => {
        if (select.value === "PNG") { // PNG will always have "1" quality since it's a lossless format
            qualityContainer.style.opacity = "0";
            setTimeout(() => { if (qualityContainer.style.opacity === "0") qualityContainer.style.display = "none" }, 400);
        } else {
            qualityContainer.style.display = "block";
            setTimeout(() => { qualityContainer.style.opacity = "1" }, 15);
        }
    })
    // Create custom page label (choose pages to export)
    let customPage = document.createElement("l");
    customPage.textContent = globalTranslations.customExport;
    let infoItalic = document.createElement("i");
    infoItalic.textContent = globalTranslations.customItalic;
    infoItalic.style = "font-size: 8pt";
    // Create custom text input, where the user can put the numbers of page they want to save
    let customText = document.createElement("input");
    customText.type = "text";
    customText.classList.add("fillWidth");
    saveBtn.style.opacity = "1";
    customText.addEventListener("input", () => {
        // Checks if there are any forbidden characters in the input
        let shouldDisabled = !/^[0-9,-]*$/.test(customText.value); 
        if (!shouldDisabled) for (let item of customText.value.split(",")) if (item.split("-").length > 2) shouldDisabled = true;
        if (shouldDisabled) saveBtn.style.opacity = "0.4"; else saveBtn.style.opacity = "1"; // If the criterias aren't met, set the button to a lower opacity.
    })
    saveBtn.addEventListener("click", () => { // The button that, well, saves the image
        if (saveBtn.style.opacity !== "1") return; // The lower opacity means that there are prohibited characters
        optionProxy.export.processPage = []; // The array that will contain the page number to export
        optionProxy.export.pageId = 0;
        if (customText.value === "") {
            optionProxy.export.processPage = [loadPDF.page];
        } else {
            for (let item of customText.value.split(",")) { // Items with comma: different pages
                if (item.indexOf("-") !== -1) { // Item with dash: take all the numbers in between and push them to the export array
                    for (let i = parseInt(item.substring(0, item.indexOf("-"))); i < parseInt(item.substring(item.lastIndexOf("-") + 1)) + 1; i++) optionProxy.export.processPage.push(i);
                } else {
                    optionProxy.export.processPage.push(parseInt(item));
                }
            }
        }
        exportCanvas();
    });
    qualityContainer.append(qualityInformation, document.createElement("br"), slider);
    // Create a slider that permit to resize the exported image (width/height)
    let resizeLabel = document.createElement("l");
    resizeLabel.textContent = globalTranslations.resize;
    let resizeItalic = document.createElement("i");
    resizeItalic.textContent = globalTranslations.resizeItalic;
    resizeItalic.style = "font-size: 8pt";
    let resizeSlider = createRange("5", "3", "0.1", "resizeSlider", "0.1");
    // Create a checkbox where the user can download the images as a .ZIP file
    let checkContainer = document.createElement("label");
    checkContainer.classList.add("switch");
    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = "zipExport";
    let span = document.createElement("span");
    span.classList.add("slider", "round");
    let zipText = document.createElement("l");
    zipText.textContent = globalTranslations.saveZip;
    checkContainer.append(checkbox, span);
    checkContainer.style.marginRight = "10px";
    for (let item of [select, saveBtn, slider, customText, resizeSlider, span]) hoverItem(item); // Add hover animations
    dropdown.append(document.createElement("br"), document.createElement("br"), infoLabel, document.createElement("br"), select, document.createElement("br"), document.createElement("br"), qualityContainer, document.createElement("br"), document.createElement("br"), customPage, document.createElement("br"), infoItalic, document.createElement("br"), customText, document.createElement("br"), document.createElement("br"), resizeLabel, document.createElement("br"), resizeItalic, document.createElement("br"), resizeSlider, document.createElement("br"), document.createElement("br"), checkContainer, zipText, document.createElement("br"), document.createElement("br"), saveBtn);
    document.body.append(dropdown);
}
function createRange(max, value, min, id, step) { // Create the slider
    let range = document.createElement("input");
    range.type = "range";
    range.max = max;
    range.min = min;
    range.id = id;
    range.step = step;
    range.value = value;
    range.classList.add("fillWidth");
    return range;
}
let zip = new JSZip();
function zipDownload() { // Download zip file function
    zip.generateAsync({ type: "blob" }).then((file) => {
        let a = document.createElement("a");
        a.href = URL.createObjectURL(file);
        a.download = `${pdfName.substring(0, pdfName.lastIndexOf("."))}-img.zip`;
        a.click();
        zip = new JSZip();
    });
}
function exportCanvas() { // The function that manages to export a canvas image
    // Get the PDF page in a canvas
    let outputScale = window.devicePixelRatio || 1; 
    let currentPage = optionProxy.export.processPage[optionProxy.export.pageId];
    loadPDF.promise.getPage(currentPage).then(function (page) {
        optionProxy.export.pageId++;
        let viewport = page.getViewport({ scale: 1, });
        let futureScale = greatViewport(viewport);
        viewport = page.getViewport({ scale: futureScale * parseFloat(document.getElementById("resizeSlider").value) });
        let finalCanvas = setUpCanvas(document.createElement("canvas"), viewport, true);
        let transform = outputScale !== 1
            ? [outputScale, 0, 0, outputScale, 0, 0]
            : null;

        let renderContext = {
            canvasContext: finalCanvas.getContext("2d"),
            transform: transform,
            viewport: viewport
        };
        page.render(renderContext).promise.then(() => { // Render the webpage in this canvas
            let divContainer = document.querySelectorAll("[data-page]"); // Get all the annotations
            let i = 0;
            function advance() {
                i++;
                if (i < divContainer.length) divLoop(); else downloadCanvas();
            }
            function downloadCanvas() { // Finished merging the annotations on the PDF, so export it
                let fileName = `${pdfName.substring(0, pdfName.lastIndexOf("."))}-Page-${currentPage}.${document.getElementById("exportSelect").value.toLowerCase()}`;
                if (!document.getElementById("zipExport").checked) { // Direclty download the image
                    let a = document.createElement("a");
                    switch (document.getElementById("exportSelect").value.toLowerCase()) {
                        case "jpg":
                            a.href = finalCanvas.toDataURL("image/jpeg", parseFloat(document.getElementById("exportSlider").value));
                            break;
                        case "webp":
                            a.href = finalCanvas.toDataURL("image/webp", parseFloat(document.getElementById("exportSlider").value));
                            break;
                        default:
                            a.href = finalCanvas.toDataURL("image/png");
                            break;
                    }
                    a.download = fileName;
                    if (navigator.userAgent.toLowerCase().indexOf("safari") !== -1 && navigator.userAgent.toLowerCase().indexOf("chrome") === -1) setTimeout(() => {
                        // Safari for some reason needs more time for download an image, otherwise it won't download the next one.
                        a.click();
                        if (optionProxy.export.pageId < optionProxy.export.processPage.length) exportCanvas();
                    }, Math.random() * (100 - 20) + 20); else {
                        a.click();
                        if (optionProxy.export.pageId < optionProxy.export.processPage.length) exportCanvas();
                    }
                } else {
                    switch (document.getElementById("exportSelect").value.toLowerCase()) { // Add the image to the zip file
                        case "jpg":
                            zip.file(fileName, finalCanvas.toDataURL("image/jpeg", parseFloat(document.getElementById("exportSlider").value)).replace(/^data:.+;base64,/, ''), { base64: true });
                            break;
                        case "webp":
                            zip.file(fileName, finalCanvas.toDataURL("image/webp", parseFloat(document.getElementById("exportSlider").value)).replace(/^data:.+;base64,/, ''), { base64: true });
                            break;
                        default:
                            zip.file(fileName, finalCanvas.toDataURL("image/png").replace(/^data:.+;base64,/, ''), { base64: true });
                            break;
                    }
                    if (optionProxy.export.pageId < optionProxy.export.processPage.length) exportCanvas(); else zipDownload();

                }
            }
            function divLoop() { // Look for each page and merge the annotations
                let div = divContainer[i];
                if (div !== undefined && parseInt(div.getAttribute("data-page")) === currentPage && div.innerHTML !== "") { // If the div exists, the page is the same as the one we're exporting, and the SVG content is not empty, let's continue
                    let img = document.createElement("img"); // Create an image with the SVG src, and then append it to a canvas
                    img.width = finalCanvas.width;
                    img.height = finalCanvas.height;
                    img.addEventListener("load", () => {
                        finalCanvas.getContext("2d").drawImage(img, 0, 0, finalCanvas.width, finalCanvas.height); // Draw the new image to the canvas, resizing it to the final export dimension
                        advance(); 
                    });
                    img.src = URL.createObjectURL(new Blob([div.innerHTML.replaceAll("\"", "'")], { type: "image/svg+xml" }));
                } else {
                    advance();
                }
            }
            divLoop();
        }).catch((ex) => {
            // If there's an error, try with the next page
            optionProxy.export.pageId++; 
            console.warn(ex);
            if (optionProxy.export.processPage[optionProxy.export.pageId] === undefined && document.getElementById("zipExport").checked) zipDownload(); else if (optionProxy.export.processPage[optionProxy.export.pageId] !== undefined) exportCanvas();
        });
    }).catch((ex) => {+
            // If there's an error, try with the next page
        optionProxy.export.pageId++;
        console.warn(ex);
        if (optionProxy.export.processPage[optionProxy.export.pageId] === undefined && document.getElementById("zipExport").checked) zipDownload(); else if (optionProxy.export.processPage[optionProxy.export.pageId] !== undefined) exportCanvas();
    });
}
function hoverItem(item) { // Add custom animatino to some elements (brightness)
    item.addEventListener("mouseenter", () => { item.classList.remove("closeAnimationTool"); item.classList.add("btnTourAnimate") });
    item.addEventListener("mouseleave", () => { item.classList.remove("btnTourAnimate"); item.classList.add("closeAnimationTool") });
}
function safariFixSelect() { // Fix the select style for WebKit browsers
    if (navigator.userAgent.toLowerCase().indexOf("safari") !== -1 && navigator.userAgent.toLowerCase().indexOf("chrome") === -1) {
        let rgbOption = hexToRgbNew(getComputedStyle(document.body).getPropertyValue("--text").replace("#", "")).split(",");
        document.getElementById("safariStyle").innerHTML = `select {-webkit-appearance: none; background-image: url("data:image/svg+xml;utf8,<svg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='24' height='24' viewBox='0 0 24 24'><path fill='rgb(${rgbOption[0]},${rgbOption[1]},${rgbOption[2]}' d='M7.406 7.828l4.594 4.594 4.594-4.594 1.406 1.406-6 6-6-6z'></path></svg>"); background-position: 100% 50%; background-repeat: no-repeat; font-size: 10pt}`;
    }
}
safariFixSelect();
function setupTranlsation() { // Add a hover description of each action butotn
    document.getElementById("hoverContainer").innerHTML = "";
    for (let item of document.querySelectorAll("[data-action]")) {
        let hoverContent = document.createElement("div");
        hoverContent.classList.add("hoverTool");
        if (!isFullscreen) { 
            hoverContent.style.top = `${item.getBoundingClientRect().bottom + 12}px`;
            hoverContent.style.left = `${item.getBoundingClientRect().left - 25}px`;
        } else {
            hoverContent.style.top = `${item.getBoundingClientRect().bottom - 25}px`;
            hoverContent.style.left = `${item.getBoundingClientRect().right + 12}px`;
        }
        let hoverInner = document.createElement("div");
        hoverInner.classList.add("hoverInner");
        hoverInner.textContent = globalTranslations.hoverTranslation[item.getAttribute("data-action")];
        item.addEventListener("mouseenter", () => {
            hoverContent.style.display = "block";
            setTimeout(() => {hoverContent.style.opacity = "1";},25);
        })
        item.addEventListener("mouseleave", () => {
            hoverContent.style.opacity = "0";
            setTimeout(() => {hoverContent.style.display = "none";},350);
        });
        hoverContent.append(hoverInner);
        document.getElementById("hoverContainer").append(hoverContent);
    }
}
document.getElementById("ytLinkValue").type = "text"; // For some reason Webpack deletes this, idk why