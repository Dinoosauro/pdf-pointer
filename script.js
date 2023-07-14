let positionLink = "https://dinoosauro.github.io/pdf-pointer/"
if (document.location.href.indexOf("netlify") !== -1) positionLink = "https://dinoosauro-pdf-pointer.netlify.app/";
if ('serviceWorker' in navigator) {
    let registration;
    const registerServiceWorker = async () => {
        registration = await navigator.serviceWorker.register('./service-worker.js', { scope: positionLink });
    };
    registerServiceWorker();
}
let jsonImg = {
    toload: true
};
let appVersion = "1.0.5";
fetch("https://dinoosauro.github.io/UpdateVersion/pdfpointer-updatecode", { cache: "no-store" }).then((res) => res.text().then((text) => { if (text.replace("\n", "") !== appVersion) if (confirm(`There's a new version of pdf-pointer. Do you want to update? [${appVersion} --> ${text.replace("\n", "")}]`)) caches.keys().then((names) => { for (let item in names) { caches.delete(item); location.reload(true); } }) }).catch((e) => { console.error(e) })).catch((e) => console.error(e));
fetch(`./assets/mergedContent.json`).then((res) => { res.json().then((json) => { jsonImg = json }) });
let avoidDuplicate = false;
let startWidth = [[document.documentElement.clientWidth, document.documentElement.clientHeight], [], [document.documentElement.clientWidth, document.documentElement.clientHeight]];
let closeEvent = new Event("close");
let actions = document.querySelectorAll("[customimg]");
for (let action of actions) {
    action.addEventListener("close", () => unclickItems(action));
    action.addEventListener("click", () => {
        if (!action.classList.contains("clickImg")) clickItem(action); else unclickItems(action)
        if (action.getAttribute("disableAction") !== null) {
            let actionSplit = action.getAttribute("disableAction").split(",");
            for (let split of actionSplit) {
                if (document.querySelector(`[data-action=${split}]`).classList.contains("clickImg")) document.querySelector(`[data-action=${split}]`).dispatchEvent(closeEvent);
            }
        }
    });
}
function clickItem(action) {
    getImg([action.childNodes[1].src], `${action.getAttribute("data-action")}-fill`);
    action.classList.add("clickImg");
}
function unclickItems(action) {
    getImg([action.childNodes[1].src], action.getAttribute("data-action"));
    action.classList.remove("clickImg");
}
let loadPDF = [null, null, 1]; // [PDF element, single PDF, page]
let eraseFromKey = false;
let changeItemFromKey = [false, "cursorpointer"];
function startPDFRead(link) {
    document.getElementById("openDiv").classList.add("animate__animated", "animate__backOutDown");
    document.getElementById("intro").classList.add("animate__animated", "animate__backOutDown");
    setTimeout(() => {
        document.getElementById("openDiv").remove();
        document.getElementById("intro").remove();
        document.getElementById("toolMain").style.visibility = "visible";
        document.getElementById("pageContainer").style.visibility = "visible";
        document.getElementById("toolMain").classList.add("animate__animated", "animate__backInUp");
        document.getElementById("pageContainer").classList.add("animate__animated", "animate__backInUp");
        function shiftShortcut(e) {
            function switchItem(typeSwitch) {
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
                case "Shift":
                    if (isFromKey) {
                        canvasIds[1][1] = false;
                        canvasIds[0]++;
                        document.querySelector("[data-action=pen]").classList.remove("clickImg");
                    } else switchItem(true);;
                    if (changeItemFromKey[1] === "cursorerase") changeItemFromKey = [false, "cursorpointer"];
                    isFromKey = !isFromKey;
                    eraseFromKey = false;
                    canvasPen();
                    break;
                case "Alt":
                    canvasIds[1][1] = false;
                    canvasIds[0]++;
                    isFromKey = false;
                    eraseFromKey = false;
                    break;
                case "Backspace":
                    eraseFromKey = !eraseFromKey;
                    if (eraseFromKey) {
                        changeItemFromKey = [true, "cursorerase"];
                        switchItem(false);
                    } else {
                        changeItemFromKey = [true, "cursorpointer"];
                        document.querySelector("[data-action=erase]").classList.remove("clickImg")
                    }
                    break;
            }
            let standardShortcut = [["+", "-", "ArrowLeft", "ArrowRight"], [document.querySelector("[data-action=zoomin]"), document.querySelector("[data-action=zoomout]"), document.querySelector("[data-action=prev]"), document.querySelector("[data-action=next]")]];
            for (let i = 0; i < standardShortcut[0].length; i++) if (e.key === standardShortcut[0][i]) standardShortcut[1][i].click();
        }
        document.documentElement.addEventListener("keydown", (e) => { shiftShortcut(e) });
        // document.documentElement.addEventListener("keyup", (e) => { shiftShortcut(e) });
        document.documentElement.addEventListener("mouseup", () => { zoomTrack[3] = false });
        document.documentElement.addEventListener("mouseleave", () => { zoomTrack[3] = false });
        document.documentElement.addEventListener("mousemove", (e) => dragZoom(e));
        loadPDF[0] = pdfjsLib.getDocument(link);
        loadPDF[0].promise.then((pdf) => {
            loadPDF[1] = pdf;
            canvasPDF(loadPDF[2]);
        });
    }, 1000)
}
let canvasGeneralScale = 90;
function getProportion(a, b, c, isHalf) {
    // I'm lazy to do an operation all of the time
    if (isHalf) return b * c / a; else return a * c / b;
}
let canvasComplete = true;
let proxyCanvas;
function canvasPDF(pageNumber) {
    if (!canvasComplete) {
        setTimeout(() => {
            canvasPDF(pageNumber);
        }, 1500);
        return;
    }
    canvasComplete = false;
    loadPDF[1].getPage(pageNumber).then(function (page) {
        let viewport = page.getViewport({ scale: 1, });
        let futureScale = 1;
        let newCanvasScale = canvasGeneralScale;
        if (viewport.width / viewport.height > 1.2) newCanvasScale = newCanvasScale - (((viewport.width / viewport.height) - 1) * 10 * 6); // Fix for 4:3 and other landscape formats
        if (viewport.width / viewport.height < 0.6) newCanvasScale = newCanvasScale + ((1.1 - (viewport.width / viewport.height)) * 10 * 6); // Fix for 9:16 and other vertical formats
        if (viewport.width > viewport.height) futureScale = getProportion(viewport.width, viewport.height, startWidth[2][0] * newCanvasScale / 100, true) / viewport.width; else futureScale = getProportion(viewport.width, viewport.height, startWidth[2][1] * newCanvasScale / 100, false) / viewport.height;
        let outputScale = window.devicePixelRatio || 1;
        viewport = page.getViewport({ scale: futureScale });
        let canvas = document.getElementById("displayCanvas");
        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = Math.floor(viewport.width) + "px";
        canvas.style.height = Math.floor(viewport.height) + "px";
        futureScale *= 3;
        viewport = page.getViewport({ scale: futureScale });
        proxyCanvas = document.createElement("canvas");
        let context = proxyCanvas.getContext('2d');
        proxyCanvas.width = Math.floor(viewport.width * outputScale);
        proxyCanvas.height = Math.floor(viewport.height * outputScale);
        proxyCanvas.style.width = Math.floor(viewport.width) + "px";
        proxyCanvas.style.height = Math.floor(viewport.height) + "px";
        let transform = outputScale !== 1
            ? [outputScale, 0, 0, outputScale, 0, 0]
            : null;

        let renderContext = {
            canvasContext: context,
            transform: transform,
            viewport: viewport
        };
        page.render(renderContext).promise.then(() => {
            canvasComplete = true;
            canvas.getContext("2d").drawImage(proxyCanvas, 0, 0, canvas.width, canvas.height)

            if (isFullscreen) {
                let getAvailableSpace = (window.innerWidth * 10 / 100) + document.getElementById("containerOfOptions").offsetWidth;
                document.getElementById("containerOfOptions").classList.add("fullcontainer");
                document.getElementById("pdfcontainer").style = `display: flex; float: left; width: ${window.innerWidth - getAvailableSpace - 2}px`;
            }
        });
    }, (ex) => {
        canvasComplete = true;
        loadPDF[2]--;
        console.warn(ex);
    });
}
let isFromKey = false;
let globalTranslations = {
    shiftAlert: "You can also press Shift to draw into the PDF. Press it again to stop drawing.",
    dropdownClose: "Close this drowdown menu to apply the new color. You can also add new colors form Settings.",
    seconds: "Seconds",
    nameColor: "How do you want to name this color?",
    maxZoom: "is the maxinum zoom level permitted",
    minZoom: "is the mininum zoom level permitted",
    noShowAgain: "Don't show again",
    zoomCanvas: "Zooming in PDFs and keeping annotations is experimental, and it might (and most probalby will) cause glitches.",
    webKitColor: "Select the color from the input below, and then click on the \"Save custom color\" button to choose a name for it.",
}
function canvasPen() {
    if (!document.querySelector("[data-action=pen]").classList.contains("clickImg") && !isFromKey) return;
    if (!isFromKey) topAlert(globalTranslations.shiftAlert, "shiftAlert");
    if (canvasIds[1][1]) {
        canvasIds[1][1] = false;
        canvasIds[0]++;
        return;
    }
    let newCanvas = document.createElement("div");
    newCanvas.width = document.getElementById("displayCanvas").offsetWidth;
    newCanvas.height = document.getElementById("displayCanvas").offsetHeight;
    newCanvas.style = `position: absolute; z-index: ${canvasIds[0]}; margin-top: 15px; margin-bottom: 15px; border-radius: 8px`;
    newCanvas.classList.add("displayCanvas", "opacityRemove");
    newCanvas.setAttribute("topstatus", "0");
    newCanvas.setAttribute("leftstatus", "0");
    newCanvas.setAttribute("data-zoom", zoomTrack[0]);
    newCanvas.setAttribute("data-page", `${loadPDF[2]}`);
    let ctx = new C2S(document.getElementById("displayCanvas").offsetWidth, document.getElementById("displayCanvas").offsetHeight)
    ctx.strokeStyle = `rgb(${optionProxy.availableHighlightColors.currentColor})`;
    ctx.lineWidth = 5;
    canvasIds[1][0] = ctx;
    canvasIds[1][1] = true;
    canvasIds[1][3] = newCanvas;
    addEvents(newCanvas);
    setTimeout(() => {
        newCanvas.style.opacity = "0";
        setTimeout(() => {
            newCanvas.remove();
        }, 500)
    }, optionProxy.changeItems.timer * 1000);
    document.getElementsByClassName("pageBackground")[0].append(newCanvas);
}
function canvasMove(event) {
    if (!canvasIds[1][1]) return;
    let rectangle = document.getElementById("displayCanvas").getBoundingClientRect();
    let xy = [event.clientX - rectangle.left, event.clientY - rectangle.top];
    let AddToY = 0;
    if (navigator.userAgent.toLowerCase().indexOf("safari") !== -1 && navigator.userAgent.toLowerCase().indexOf("chrome") === -1) AddToY = 32; // It seems that WebKit manages pointers in a different way, so I need to add the height of the SVG
    if (canvasIds[1][2][0] !== null) {
        try {
            canvasIds[1][0].lineTo(xy[0], xy[1] + AddToY);
            canvasIds[1][0].stroke();
        } catch (ex) {
            console.warn(ex);
            canvasPen();
            canvasPen();
        }
        //  + 16
    } else {
        canvasIds[1][0].beginPath();
        canvasIds[1][0].moveTo(xy[0], xy[1] + AddToY);
    }
    canvasIds[1][2] = xy;
    canvasIds[1][3].innerHTML = canvasIds[1][0].getSerializedSvg();
}
let eraseTime = false;
function addEvents(newCanvas) {
    newCanvas.addEventListener("mousedown", () => {
        canvasPen();
        if (document.querySelector("[data-action=erase]").classList.contains("clickImg")) eraseTime = true;
    });
    newCanvas.addEventListener("mouseup", () => {
        canvasPen();
        if (document.querySelector("[data-action=erase]").classList.contains("clickImg")) eraseTime = false;
    });
    newCanvas.addEventListener("mousemove", (event) => {
        canvasMove(event);
        canvasEraser(event);
        if (changeItemFromKey[0]) {
            changeItemFromKey[0] = false;
            cursorChange(newCanvas, changeItemFromKey[1]);
        }
        if (changeItemFromKey[1] === "cursorerase") canvasEraser(event, true);
    });
    newCanvas.addEventListener("mouseleave", () => { canvasIds[1][2][0] = null; newCanvas.style.cursor = "pointer"; });
    newCanvas.addEventListener("hover", () => { intelligentCursor(newCanvas) })
    newCanvas.addEventListener("mousedown", (e) => {
        if (!document.querySelector("[data-action=erase]").classList.contains("clickImg")) zoomTrack[3] = true;
        precedentZoomPosition = [e.screenX, e.screenY];
    });
    newCanvas.addEventListener("mouseenter", () => { cursorChange(newCanvas) });
}
function cursorChange(canvas, cursor) {
    let actionToDo = cursor;
    if (actionToDo === undefined) {
        actionToDo = "cursorpointer";
        if (document.querySelector(`[data-action=pen]`).classList.contains("clickImg")) actionToDo = "cursorpen"; else if (document.querySelector(`[data-action=erase]`).classList.contains("clickImg")) actionToDo = "cursorerase";
    }
    getImg([canvas], actionToDo, true);
}
function canvasEraser(event, skip) {
    if (skip !== true) if (!document.querySelector("[data-action=erase]").classList.contains("clickImg") || !eraseTime) return; // skip !== true since it can also be undefined
    let rectangle = document.getElementById("displayCanvas").getBoundingClientRect();
    let xy = [event.clientX - rectangle.left, event.clientY - rectangle.top + 16];
    let getCanvases = document.querySelectorAll("g");
    for (let canvas of getCanvases) {
        let canvasPosition = canvas.getBoundingClientRect();
        if (canvas.getAttribute("pdf") === "yes") continue;
        function deleteCanvas() {
            if (canvas.parentElement.parentElement.getAttribute("data-delete") === null) canvas.parentElement.parentElement.setAttribute("data-delete", "1"); else return;
            canvas.parentElement.parentElement.style.opacity = 0;
            setTimeout(() => { canvas.parentElement.parentElement.remove() }, 700);
        }
        if ((canvasPosition.bottom - event.clientY) > -20 && (canvasPosition.bottom - event.clientY) < 20) deleteCanvas();
        if ((canvasPosition.left - event.clientX) > -20 && (canvasPosition.left - event.clientX) < 20) deleteCanvas();

    }
}
function hexToRgbNew(hex) { // Borrowed from https://stackoverflow.com/a/11508164
    var arrBuff = new ArrayBuffer(4);
    var vw = new DataView(arrBuff);
    vw.setUint32(0, parseInt(hex, 16), false);
    var arrByte = new Uint8Array(arrBuff);

    return arrByte[1] + "," + arrByte[2] + "," + arrByte[3];
}
let canvasIds = [1, [null, false, [null, null]]]; // [z-index, [canvas element, draw item, [previous width, previous height]]]
let localOptions = {
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
    },
    changeItems: {
        timer: 15,
        showTips: true,
        alertInt: 5000,
        pointerColorEnabled: false,
        pointerColorColor: "#ffffff",
        keepZoomSize: null,
        moveZoom: false,
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
    ]
}
if (localStorage.getItem("PDFPointer-customColors") !== null && localStorage.getItem("PDFPointer-customColors") !== "{}") localOptions.availableHighlightColors = JSON.parse(localStorage.getItem("PDFPointer-customColors"));
let optionProxy = ObservableSlim.create(localOptions, true, function (change) {
    let changes = change[0];
    if (changes.type === "update") {
        let path = changes.currentPath.split(".");
        if (settingsToSave[1].indexOf(changes.currentPath) === -1) return;
        let item = localOptions;
        for (let i = 0; i < path.length - 1; i++) item = item[path[i]];
        localStorage.setItem(settingsToSave[0][settingsToSave[1].indexOf(changes.currentPath)], changes.newValue);
    }
});
addEvents(document.getElementById("displayCanvas"));
function usefulDropdownGenerator(alertType, options, typeCustomInput) {
    if (optionProxy.showAlert[alertType]) return;
    let dropdown = createDropdown(document.querySelector(`[data-action=${alertType}]`));
    let numberOptions = options
    for (let option of numberOptions) {
        let child = addDropdownNameItem(option, dropdown.childNodes.length);
        child.addEventListener("click", () => {
            optionProxy.changeItems[alertType] = parseInt(option.substring(0, option.indexOf(" ")));
            optionProxy.dropdownSelectedOptions[alertType] = numberOptions.indexOf(option) + 1;
        });
        dropdown.appendChild(child);
    }
    let input = addDropdownTextbox("Custom input", typeCustomInput);
    input.addEventListener("click", () => {
        optionProxy.dropdownSelectedOptions[alertType] = dropdown.childNodes.length - 1;
    });
    input.addEventListener("input", (e) => {
        optionProxy.changeItems[alertType] = `${e.target.value}`;
    })
    dropdown.appendChild(input);
    input.value = `${optionProxy.changeItems[alertType]}`;
    document.body.appendChild(dropdown);
    for (let i = 0; i < dropdown.childNodes.length; i++) {
        if (optionProxy.dropdownSelectedOptions[alertType] === i) dropdown.childNodes[i].style = "border-left: solid 2px var(--accent);"; else dropdown.childNodes[i].style = "padding-left: 22px";
    }
    if (typeCustomInput === "color") topAlert(globalTranslations.dropdownClose, "dropClose");
}
document.querySelector("[data-action=timer]").addEventListener("click", () => {
    usefulDropdownGenerator("timer", [`5 ${globalTranslations.seconds}`, `15 ${globalTranslations.seconds}`, `30 ${globalTranslations.seconds}`, `60 ${globalTranslations.seconds}`], "number");
});
document.querySelector("[data-action=color]").addEventListener("click", () => {
    usefulDropdownGenerator("color", Object.keys(optionProxy.availableHighlightColors), "color");
});
function createDropdown(buttonReference) {
    optionProxy.showAlert.timer = true;
    let div = document.createElement("div");
    div.classList.add("animate__animated", "animate__backInDown")
    let close = document.createElement("img");
    close.width = 25;
    close.height = 25;
    close.setAttribute("data-customanimate", "1");
    getImg([close], "save");
    close.addEventListener("click", () => {
        div.classList.add("animate__backOutUp");
        setTimeout(() => {
            div.remove();
        }, 1000);
        if (div.childNodes[div.childNodes.length - 1].childNodes[0].type === "color") {
            let hexToRgb = hexToRgbNew(div.childNodes[div.childNodes.length - 1].childNodes[0].value.replace("#", "")).split(",");
            optionProxy.availableHighlightColors.currentColor = [parseInt(hexToRgb[0]), parseInt(hexToRgb[1]), parseInt(hexToRgb[2]), 255];
        }
        optionProxy.showAlert.timer = false;
    })
    close.classList.add("closeBtn", "saveDropdown");
    div.append(close);
    var divPosition = buttonReference.getBoundingClientRect();
    div.classList.add("dropdown");
    let styleThings = `top: ${parseInt(divPosition.top) + 75 + window.scrollY}px; `;
    if (divPosition.left + 25 + (25 * document.body.offsetWidth / 100) < document.body.offsetHeight) styleThings += `left: ${divPosition.left + 25}px; `; else styleThings += `right: ${divPosition.right - 25 - (25 * document.body.offsetWidth / 100)}px; `;
    styleThings = styleThings.replace("right: -", "left: ").replace("left: -", "right: "); // Quick fix for dialog outside client view due to negative numbers
    div.style = styleThings;
    return div;
}
function addDropdownNameItem(text, position) {
    if (text === "currentColor") text = "";
    let option = document.createElement("div");
    option.classList.add("dropdownItem");
    option.addEventListener("click", () => {
        option.parentElement.childNodes[0].click();
        if (option.parentElement.childNodes[option.parentElement.childNodes.length - 1].childNodes[0].type === "color") {
            optionProxy.availableHighlightColors.currentColor = optionProxy.availableHighlightColors[text];
        }
    });
    let labelName = document.createElement("l");
    labelName.textContent = text;
    labelName.classList.add("dropdownLabel");
    option.appendChild(labelName);
    return option;
}
function addDropdownTextbox(placeholder, typeText) {
    let option = document.createElement("div");
    option.classList.add("dropdownItem");
    let element = document.createElement("input");
    element.type = typeText;
    if (typeText === "number") element.min = 1;
    element.placeholder = placeholder;
    option.appendChild(element);
    return option;
}
function topAlert(text, alertType, isChange) {
    if (!optionProxy.changeItems.showTips || localStorage.getItem("PDFPointer-notshow") !== null && localStorage.getItem("PDFPointer-notshow").split(",").indexOf(alertType) !== -1) return;
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
    setTimeout(() => { deleteFunction() }, localOptions.changeItems.alertInt);

    let image = document.createElement("img");
    getImg([image], `alert`)
    image.style.width = "25px";
    image.style.height = "25px";
    let textitem = document.createElement("l");
    textitem.style.marginLeft = "10px";
    textitem.textContent = text;
    alert.append(image, textitem);
    if (isChange) {
        let returnDefault = document.createElement("a");
        returnDefault.href = `./index.html?nolang`;
        returnDefault.textContent = "Go back to English";
        returnDefault.style.marginLeft = "5px";
        alert.append(returnDefault);
    }
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
function showRightCanvas() {
    let canvasArray = document.querySelectorAll("[data-page]");
    for (let canvas of canvasArray) {
        if (canvas.getAttribute("data-page") === `${loadPDF[2]}`) canvas.style.display = "inline"; else canvas.style.display = "none";
    }
}
document.querySelector("[data-action=next]").addEventListener("click", () => {
    loadPDF[2]++;
    showRightCanvas();
    canvasPDF(loadPDF[2]);
    fixZoom();
});
document.querySelector("[data-action=prev]").addEventListener("click", () => {
    if (loadPDF[2] === 1) return;
    loadPDF[2]--;
    showRightCanvas();
    canvasPDF(loadPDF[2]);
    fixZoom();
});
function fixZoom() {
    for (let itemOld of document.querySelectorAll("g")) {
        item = itemOld.parentElement;
        item.parentElement.style.transform = `scale(${1 / parseInt(item.parentElement.getAttribute("data-zoom"))})`;
        item.parentElement.height = originalWidth[2];
        item.parentElement.width = originalWidth[3];
        item.parentElement.style.marginTop = `0px`;
        item.parentElement.style.marginLeft = `0px`;
        if (parseFloat(item.parentElement.getAttribute("data-zoom")) === 1 && parseInt(item.parentElement.getAttribute("data-page")) === loadPDF[2]) item.parentElement.style.display = "inline"; else item.parentElement.style.display = "none";
    }
    zoomTrack[0] = 1;
    zoomTrack[1] = 0;
    zoomTrack[2] = 0;
}
function bounceTextEvents(item, animationItem) {
    animationItem.addEventListener("mouseenter", () => {
        item.classList.add("animate__animated", "animate__headShake");
        setTimeout(() => { item.classList.remove("animate__animated", "animate__headShake") }, 800)
    });
}
let colorHeight = 0;
function fetchColors(jsonItem) {
    for (let i = 0; i < Object.keys(jsonItem).length; i++) {
        if (Object.keys(jsonItem)[i] === "currentColor") continue;
        colorHeight += 57; // Height + border
        document.getElementById("optionContainer").style.maxHeight = `${colorHeight}px`;
        let show = document.createElement("div");
        show.classList.add("colorContainer");
        let innerText = document.createElement("l");
        innerText.textContent = Object.keys(jsonItem)[i];
        innerText.style = "display: flex; float: left";
        bounceTextEvents(innerText, show);
        let arrayOptions = jsonItem[Object.keys(jsonItem)[i]];
        let deleteBtn = createContainerInfo("bin", `rgb(${arrayOptions[0]},${arrayOptions[1]},${arrayOptions[2]})`, undefined, show);
        deleteBtn.addEventListener("click", () => {
            delete jsonItem[Object.keys(jsonItem)[i]];
            document.documentElement.style.setProperty("--deleteitem", `rgb(${arrayOptions[0]},${arrayOptions[1]},${arrayOptions[2]})`);
            storeCustomOptions([jsonItem], ["PDFPointer-customColors"]);
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
document.getElementById("optionContainer").innerHTML = "";
fetchColors(optionProxy.availableHighlightColors);
function updateColorNew() {
    let result = prompt(`${globalTranslations.nameColor} [${document.getElementById("colorNew").value}]`);
    if (result !== null) {
        let getColorRGB = hexToRgbNew(document.getElementById("colorNew").value.replace("#", "")).split(",");
        getColorRGB.push(255)
        optionProxy.availableHighlightColors[result] = getColorRGB;
        storeCustomOptions([optionProxy.availableHighlightColors], ["PDFPointer-customColors"]);
        let singleColor = {};
        singleColor[result] = getColorRGB;
        fetchColors(singleColor);
    }
}
if (navigator.userAgent.toLowerCase().indexOf("chrome") !== -1) {
    document.getElementById("colorNew").addEventListener("focusout", () => { updateColorNew() });
} else {
    document.getElementById("colorSaveBtn").style.display = "flex";
    document.querySelector("[data-translate=customColorDescription]").textContent = globalTranslations.webKitColor;
    document.getElementById("colorSaveBtn").addEventListener("click", () => { updateColorNew() });
}
function getImg(loadImg, link, setCursor, customColor) {
    if (jsonImg.toload) {
        setTimeout(() => { getImg(loadImg, link, setCursor, customColor) }, 100);
        return;
    }
    let replaceItem = [getComputedStyle(document.body).getPropertyValue("--accent"), getComputedStyle(document.body).getPropertyValue("--text")];
    for (let img of loadImg) {
        let getLink = link;
        if (getLink === undefined) getLink = img.getAttribute("fetchlink");
        let read = jsonImg[getLink];
        if (customColor !== undefined) replaceItem[0] = customColor;
        let finalResult = URL.createObjectURL(new Blob([read.replaceAll("#c5603f", replaceItem[0]).replaceAll("#fcf7f2", replaceItem[1])], { type: "image/svg+xml" }));
        if (setCursor) {
            let rgbOption = hexToRgbNew(replaceItem[0].replace("#", "")).split(",");
            if (optionProxy.changeItems.pointerColorEnabled) rgbOption = hexToRgbNew(optionProxy.changeItems.pointerColorColor.replace("#", "")).split(",");
            img.style.cursor = `url("data:image/svg+xml;utf8,${(`${read.replaceAll(`fill='#c5603f'`, `fill='rgb(${rgbOption[0]},${rgbOption[1]},${rgbOption[2]})'`)}`)}") 0 32, auto`;
        } else img.src = finalResult;
    }
}
function createContainerInfo(name, backgroundColor, accentColor, hoverDiv) {
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
function fetchThemes() {
    if (localStorage.getItem("PDFPointer-customThemeJson") == null) localStorage.setItem("PDFPointer-customThemeJson", JSON.stringify({ items: {} }));
    try {
        let customObj = JSON.parse(localStorage.getItem("PDFPointer-customThemeJson")).items;
        for (let i = 0; i < Object.keys(customObj).length; i++) {
            customObj[i].trackCustom = i;
            optionProxy.themes.push(customObj[i]);
        }
    } catch (ex) {
        console.warn(ex);
    }
    for (let theme of optionProxy.themes) {
        let themeContainerOption = document.createElement("div");
        themeContainerOption.classList.add("colorContainer", "containerItemsAnimation");
        let themeName = document.createElement("l");
        themeName.style = "display: flex; float: left"
        themeName.innerHTML = theme.name;
        bounceTextEvents(themeName, themeContainerOption);
        let applyContainerNew = [createContainerInfo("colorbucket", theme.colorProperties.background, theme.colorProperties.accent, themeContainerOption)];
        applyContainerNew[0].addEventListener("click", () => {
            for (let key in theme.colorProperties) document.documentElement.style.setProperty(`--${key}`, `${theme.colorProperties[key]}`);
            getImg(document.querySelectorAll("[fetchlink]"));
            localStorage.setItem("PDFPointer-selectedtheme", theme.customItemRefer);
        });
        applyContainerNew[0].setAttribute("data-themerefer", theme.customItemRefer);
        applyContainerNew[1] = createContainerInfo("export", theme.colorProperties.background, theme.colorProperties.accent, themeContainerOption);
        applyContainerNew[1].addEventListener("click", () => {
            let a = document.createElement("a");
            a.href = URL.createObjectURL(new Blob([JSON.stringify(theme)], { type: "text/plain" }));
            a.download = `${theme.name}-export.json`;
            a.click();
        })
        if (theme.isCustom) {
            applyContainerNew[2] = createContainerInfo("bin", theme.colorProperties.background, theme.colorProperties.accent, themeContainerOption);
            applyContainerNew[2].addEventListener("click", () => {
                document.documentElement.style.setProperty("--deleteitem", theme.colorProperties.optionitem);
                themeContainerOption.classList.add("runAnimation");
                let customGet = JSON.parse(localStorage.getItem("PDFPointer-customThemeJson")).items;
                let futureGet = [];
                for (let i = 0; i < Object.keys(customGet).length; i++) if (i !== theme.trackCustom) futureGet.push(customGet[i]);
                localStorage.setItem("PDFPointer-customThemeJson", JSON.stringify({ items: futureGet }));
                setTimeout(() => {
                    document.getElementById("themeOptionShow").style.maxHeight = `${parseInt(document.getElementById("themeOptionShow").style.maxHeight.substring(0, document.getElementById("themeOptionShow").style.maxHeight.indexOf("px"))) - 57}px`;
                    themeContainerOption.style.backgroundColor = `${theme.accent}`;
                    themeContainerOption.classList.add("animate__animated", "animate__backOutDown");
                    setTimeout(() => {
                        themeContainerOption.remove();
                    }, 1000)
                }, 1000);
            })
        }
        themeContainerOption.append(themeName, ...applyContainerNew, document.createElement("br"));
        document.getElementById("themeOptionShow").append(themeContainerOption);
    }
}
getImg(document.querySelectorAll("[fetchlink]"));
fetchThemes();
let defaultCheck = false;
function dialogGeneralAnimation(id, open) {
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
document.querySelector("[data-action=settings]").addEventListener("click", () => {
    dialogGeneralAnimation("settings", true);
    if (!defaultCheck) {
        for (let i = 0; i < switchIds.length; i++) {
            switchIds[i][2].setAttribute("defaultHeight", `${switchIds[i][2].offsetHeight}px`);
            if (switchIds[i][3]) {
                switchIds[i][0].style.display = "inline";
                switchIds[i][0].style.opacity = "1";
            }
        }
        document.getElementById("themeOptionShow").style.maxHeight = `${document.getElementById("themeOptionShow").offsetHeight}px`;
    }

})
document.getElementById("closeSettings").addEventListener("click", () => {
    dialogGeneralAnimation("settings", false);
})
document.getElementById("fileOpen").onchange = function () {
    if (document.getElementById("fileOpen").files) {
        let fileRead = new FileReader();
        fileRead.onload = function () {
            startPDFRead(fileRead.result);
        }
        fileRead.readAsDataURL(document.getElementById("fileOpen").files[0]);
    }
}
document.getElementById("openPicker").addEventListener("click", () => { document.getElementById("fileOpen").click() })
let settingsToSave = [["PDFPointer-currentcolor", "PDFPointer-timerselected", "PDFPointer-colorselected", "PDFPointer-timerlength", "PDFPointer-showtips", "PDFPointer-alertdurationn", "PDFPointer-customPointerEnable", "PDFPointer-customPointerColor", "PDFPointer-zoomType", "PDFPointer-movezoom", "PDFPointer-resizecanvas"], ["availableHighlightColors.currentColor", "dropdownSelectedOptions.timer", "dropdownSelectedOptions.color", "changeItems.timer", "changeItems.showTips", "changeItems.alertInt", "changeItems.pointerColorEnabled", "changeItems.pointerColorColor", "changeItems.keepZoomSize", "changeItems.moveZoom", "changeItems.resizeCanvas"], ["array", "int", "int", "int", "bool", "int", "bool", "string", "bool", "bool", "bool"]];
for (let i = 0; i < settingsToSave[0].length; i++) {
    if (localStorage.getItem(settingsToSave[0][i]) !== null) {
        let item = localOptions;
        let itemPart = settingsToSave[1][i].split(".");
        for (let x = 0; x < itemPart.length - 1; x++) item = item[itemPart[x]];
        switch (settingsToSave[2][i]) {
            case "array":
                item[itemPart[itemPart.length - 1]] = localStorage.getItem(settingsToSave[0][i]).split(",");
                break;
            case "int":
                item[itemPart[itemPart.length - 1]] = parseInt(localStorage.getItem(settingsToSave[0][i]));
                break;
            case "bool":
                item[itemPart[itemPart.length - 1]] = localStorage.getItem(settingsToSave[0][i]) === "true";
                break;
            case "string":
                item[itemPart[itemPart.length - 1]] = localStorage.getItem(settingsToSave[0][i]);
                break;
        }
    }
}
let checkBoxClick = [[document.getElementById("alertCheck"), document.getElementById("pointerCheck"), document.getElementById("moveZoomCheck"), document.getElementById("resizeCanvasCheck")], ["changeItems.showTips", "changeItems.pointerColorEnabled", "changeItems.moveZoom", "changeItems.resizeCanvas"]];
for (let i = 0; i < checkBoxClick[0].length; i++) {
    let item = localOptions;
    let itemPart = checkBoxClick[1][i].split(".");
    for (let x = 0; x < itemPart.length - 1; x++) item = item[itemPart[x]];
    checkBoxClick[0][i].checked = item[itemPart[itemPart.length - 1]];
}
let isFullscreen = false;
document.getElementById("pageContainer").style.margin = "0px auto";
document.querySelector("[data-action=fullscreen]").addEventListener("click", () => {
    document.documentElement.requestFullscreen();
})
document.querySelector("[data-action=normalscreen]").addEventListener("click", () => {
    document.exitFullscreen();
});
function intelligentCursor(element) {
    if (document.querySelector(`[data-action=pen]`).classList.contains("clickImg")) {
        getImg([element], `pen-fill`, true);
    } else if (document.querySelector(`[data-action=erase]`).classList.contains("clickImg")) {
        getImg([element], `erase-fill`, true);
    } else {
        getImg([element], `pointer`, true)
    }
}
document.querySelector("[data-action=erase]").addEventListener("click", () => { zoomTrack[3] = false; });
document.getElementById("displayCanvas").addEventListener("hover", intelligentCursor(document.getElementById("displayCanvas")));
document.addEventListener('fullscreenchange', (e) => {
    if (document.fullscreenElement) {
        isFullscreen = true;
        let getAvailableSpace = (window.innerWidth * 10 / 100) + document.getElementById("containerOfOptions").offsetWidth;
        document.getElementById("toolMain").classList.remove("vertcenter");
        document.getElementById("containerOfOptions").classList.add("fullcontainer");
        document.getElementById("pdfcontainer").style = `display: flex; float: left; width: ${window.innerWidth - getAvailableSpace - 2}px`;
        canvasGeneralScale = 110;
        startWidth[1] = [document.documentElement.clientWidth, document.documentElement.clientHeight];
        startWidth[2] = [document.documentElement.clientWidth, document.documentElement.clientHeight];
        canvasPDF(loadPDF[2]);
        document.getElementById("containerOfOptions").style.marginTop = "30px";
        document.getElementById("containerOfOptions").style.marginBottom = "30px";
        document.querySelector("[data-action=normalscreen]").style.display = "inline";
        for (let item of document.querySelectorAll("[data-moveleft]")) item.style = `margin-bottom: ${item.getAttribute("data-moveleft")}`;
        for (let item of document.querySelectorAll("[data-moveright]")) item.style = `margin-top: ${item.getAttribute("data-moveright")}`;
    } else {
        isFullscreen = false;
        canvasGeneralScale = 90;
        document.getElementById("toolMain").classList.add("vertcenter");
        document.getElementById("containerOfOptions").classList.remove("fullcontainer");
        document.getElementById("pdfcontainer").style = "";
        document.getElementById("pdfcontainer").classList.add("vertcenter");
        document.querySelector("[data-action=normalscreen]").style.display = "none";
        document.querySelector("[data-action=fullscreen]").style.display = "inline";
        document.getElementById("containerOfOptions").style.marginTop = "0px";
        document.getElementById("containerOfOptions").style.marginBottom = "0px";
        startWidth[2] = startWidth[0];
        canvasPDF(loadPDF[2]);
        for (let item of document.querySelectorAll("[data-moveleft]")) item.style = `margin-right: ${item.getAttribute("data-moveleft")}`;
        for (let item of document.querySelectorAll("[data-moveright]")) item.style = `margin-left: ${item.getAttribute("data-moveright")}`;

    }
});
let zoomTrack = [1, 0, 0, false]; // Zoom level, x position, y position.
let precedentZoomPosition = [0, 0]; // x, y
let originalWidth = 0;
document.querySelector("[data-action=zoomin]").addEventListener("click", () => {
    if (localStorage.getItem("PDFPointer-zoomType") === null) {
        dialogGeneralAnimation("zoomChooseContainer", true)
        return;
    }
    zoomTrack[0] += 0.5;
    if (zoomTrack[0] > 3) {
        topAlert(`300% ${globalTranslations.maxZoom}`, "maxZoom");
        zoomTrack[0] = 3;
        return;
    }
    if (document.querySelectorAll("g").length > 0 && optionProxy.changeItems.moveZoom) topAlert(globalTranslations.zoomCanvas, "zoomCanvas");
    if (optionProxy.changeItems.keepZoomSize) {
        document.getElementById("displayCanvas").getContext("2d").drawImage(proxyCanvas, zoomTrack[1], zoomTrack[2], document.getElementById("displayCanvas").width * zoomTrack[0], document.getElementById("displayCanvas").height * zoomTrack[0]);
        resizeCanvasSameSize();
    } else {
        canvasGeneralResize();
    }
});
function canvasGeneralResize() {
    if (originalWidth === 0) originalWidth = [document.getElementById("displayCanvas").style.width, document.getElementById("displayCanvas").style.height, document.getElementById("displayCanvas").height, document.getElementById("displayCanvas").width]
    let oldHeight = document.getElementById("displayCanvas").height;
    let oldWidth = document.getElementById("displayCanvas").width;
    document.getElementById("displayCanvas").style.width = `${originalWidth[0].replace("px", "") * zoomTrack[0]}px`;
    document.getElementById("displayCanvas").style.height = `${parseInt(originalWidth[1].replace("px", "")) * zoomTrack[0]}px`;
    document.getElementById("displayCanvas").height = originalWidth[2] * zoomTrack[0];
    document.getElementById("displayCanvas").width = originalWidth[3] * zoomTrack[0];
    document.getElementById("displayCanvas").getContext("2d").drawImage(proxyCanvas, 0, 0, document.getElementById("displayCanvas").width, document.getElementById("displayCanvas").height);
    if (document.body.offsetWidth < parseInt(document.getElementById("displayCanvas").style.width.replace("px", ""))) document.getElementById("canvasMargin").style.marginLeft = `${(parseInt(document.getElementById("displayCanvas").style.width.replace("px", "")) - document.body.offsetWidth)}px`;
    if (isFullscreen) {
        document.getElementById("canvasMargin").style.marginLeft = `${(parseInt(document.getElementById("canvasMargin").style.marginLeft.replace("px", "")) + document.getElementById("toolMain").getBoundingClientRect().left + 200)}px`;
        document.getElementById("canvasMargin").style.marginRight = `50px`;
    }
    if (zoomTrack[0] === 1) document.getElementById("canvasMargin").style.marginLeft = `0px`;
    for (let itemOld of document.querySelectorAll("g")) {
        if (optionProxy.changeItems.moveZoom) {
            item = itemOld.parentElement;
            if (item.parentElement.style.display === "none") continue;
            let generalScale = parseFloat(item.parentElement.getAttribute("data-zoom"));
            item.parentElement.style.transform = `scale(${zoomTrack[0] / generalScale})`;
            item.parentElement.style.marginTop = `${(parseInt((document.getElementById("displayCanvas").style.height.replace("px", "")) - parseInt(originalWidth[1].replace("px", ""))) / (zoomTrack[0] / generalScale))}px`;
            item.parentElement.style.marginLeft = `${parseInt(((document.getElementById("displayCanvas").style.width.replace("px", "")) - parseInt(originalWidth[0].replace("px", ""))) / (zoomTrack[0] / generalScale))}px`;
            if (Math.round(generalScale) !== generalScale) {
                item.parentElement.style.marginTop = `${parseInt(item.parentElement.style.marginTop.replace("px", "")) / 2}px`;
                item.parentElement.style.marginLeft = `${parseInt(item.parentElement.style.marginLeft.replace("px", "")) / 2}px`;
            }
            if ((zoomTrack[0] / generalScale) < 1) {
                let rect = item.parentElement.getBoundingClientRect();
                let itemDivide = 1 - (zoomTrack[0] / generalScale);
                item.parentElement.style.marginTop = `${rect.height / 2 * -1 * (zoomTrack[0] / generalScale) * itemDivide}px`;
                item.parentElement.style.marginLeft = `${rect.width / 2 * -1 * (zoomTrack[0] / generalScale) * itemDivide}px`;
            } else if ((zoomTrack[0] / generalScale) === 1) {
                item.parentElement.style.marginTop = `15px`;
                item.parentElement.style.marginLeft = ``;
            }
        } else {
            if (parseFloat(itemOld.parentElement.parentElement.getAttribute("data-zoom")) === zoomTrack[0]) itemOld.parentElement.parentElement.style.display = "inline"; else itemOld.parentElement.parentElement.style.display = "none";
        }
    }
}
document.getElementById("chooseFirst").addEventListener("click", () => {
    optionProxy.changeItems.keepZoomSize = true;
    closeCanvasDialog();
});
document.getElementById("chooseSecond").addEventListener("click", () => {
    optionProxy.changeItems.keepZoomSize = false;
    closeCanvasDialog();
});
function closeCanvasDialog() {
    dialogGeneralAnimation("zoomChooseContainer", false);
}
document.querySelector("[data-action=zoomout]").addEventListener("click", () => {
    if (localStorage.getItem("PDFPointer-zoomType") === null) {
        dialogGeneralAnimation("zoomChooseContainer", true)
        return;
    }
    zoomTrack[0] -= 0.5;
    if (zoomTrack[0] < 0.5) {
        topAlert(`50% ${globalTranslations.minZoom}`, "minZoom");
        zoomTrack[0] = 0.5;
        return;
    }
    if (document.querySelectorAll("g").length > 0 && optionProxy.changeItems.moveZoom) topAlert(globalTranslations.zoomCanvas, "zoomCanvas");
    document.getElementById("displayCanvas").getContext("2d").clearRect(0, 0, document.getElementById("displayCanvas").width, document.getElementById("displayCanvas").height);
    if (optionProxy.changeItems.keepZoomSize) {
        document.getElementById("displayCanvas").getContext("2d").drawImage(proxyCanvas, 0, 0, document.getElementById("displayCanvas").width * zoomTrack[0], document.getElementById("displayCanvas").height * zoomTrack[0])
        resizeCanvasSameSize();
    } else {
        canvasGeneralResize();
    }
    zoomTrack[1] = 0;
    zoomTrack[2] = 0;

})
function resizeCanvasSameSize() {
    for (let item of document.querySelectorAll("g")) {
        if (optionProxy.changeItems.moveZoom) {
            item.parentElement.parentElement.style.transform = `scale(${zoomTrack[0] / parseInt(item.parentElement.parentElement.getAttribute("data-zoom"))})`;
            item.parentElement.parentElement.style.marginTop = `${zoomTrack[2] / (zoomTrack[0] / parseInt(item.parentElement.parentElement.getAttribute("data-zoom")))}px`;
            item.parentElement.parentElement.style.marginLeft = `${zoomTrack[1] / (zoomTrack[0] / parseInt(item.parentElement.parentElement.getAttribute("data-zoom")))}px`;
        } else {
            if (parseFloat(item.parentElement.parentElement.getAttribute("data-zoom")) === zoomTrack[0]) item.parentElement.parentElement.style.display = "inline"; else item.parentElement.parentElement.style.display = "none";
        }
    }
}
function dragZoom(e) {
    if (canvasIds[1][1] || zoomTrack[0] === 1 || !zoomTrack[3]) return;
    if (optionProxy.changeItems.keepZoomSize) {
        document.getElementById("displayCanvas").style.width = parseInt(document.getElementById("displayCanvas").style.width.replace("px", "")) * zoomTrack[0];
        document.getElementById("displayCanvas").width = parseInt(document.getElementById("displayCanvas").style.width.replace("px", "")) * zoomTrack[0];
        let rect = document.getElementById("displayCanvas").getBoundingClientRect();
        let xy = [e.screenX, e.screenY];
        if (precedentZoomPosition == xy) {
            precedentZoomPosition = xy; // I highly doubt that this is necessary but this was a mess to make, and I want to avoid other hours of debug :D
        } else {
            zoomTrack[1] -= (precedentZoomPosition[0] - xy[0]) * zoomTrack[0];
            zoomTrack[2] -= (precedentZoomPosition[1] - xy[1]) * zoomTrack[0];
            document.getElementById("displayCanvas").getContext("2d").drawImage(proxyCanvas, zoomTrack[1], zoomTrack[2], document.getElementById("displayCanvas").width * zoomTrack[0], document.getElementById("displayCanvas").height * zoomTrack[0]);
            checkIfOutside(9, 1, true) // Width, height
            checkIfOutside(9, parseInt(document.getElementById("displayCanvas").style.height.replace("px", "")) - 2, false) // Width, height
            function checkIfOutside(width, height, keepWidth) {
                let data = document.getElementById("displayCanvas").getContext("2d").getImageData(width, height, 1, 1).data;
                if (Array.from(data)[3] === 0) {
                    if (keepWidth) {
                        document.getElementById("displayCanvas").getContext("2d").drawImage(proxyCanvas, zoomTrack[1], 0, document.getElementById("displayCanvas").width * zoomTrack[0], document.getElementById("displayCanvas").height * zoomTrack[0]);
                        precedentZoomPosition[1] = 1;
                        zoomTrack[2] = 1;
                    } else {
                        precedentZoomPosition[1] *= -1;
                        document.getElementById("displayCanvas").getContext("2d").drawImage(proxyCanvas, 0, precedentZoomPosition[1], document.getElementById("displayCanvas").width * zoomTrack[0], document.getElementById("displayCanvas").height * zoomTrack[0]);
                        precedentZoomPosition[0] = 1;
                        zoomTrack[1] = 1;
                        zoomTrack[2] = precedentZoomPosition[1];
                    }
                }
                precedentZoomPosition = xy;
            }

            for (let itemOld of document.querySelectorAll("g")) {
                let item = itemOld.parentElement.parentElement
                if (item.id === "displayCanvas" || item.style.display === "none") continue;
                let rect = document.getElementById("displayCanvas").getBoundingClientRect();
                if (item.getAttribute("topstatus") == "0") item.setAttribute("topstatus", zoomTrack[2]);
                if (item.getAttribute("leftstatus") == "0") item.setAttribute("leftstatus", zoomTrack[1]);
                let marginArchive = [`-${(parseInt(item.getAttribute("topstatus")) - zoomTrack[2]) / 2}px`, `-${(parseInt(item.getAttribute("leftstatus")) - zoomTrack[1]) / 2}px`]
                for (let i = 0; i < marginArchive.length; i++) if (marginArchive[i].startsWith("--")) marginArchive[i] = marginArchive[i].substring(2);
                item.style.marginTop = marginArchive[0];
                item.style.marginLeft = marginArchive[1];
                if (Math.abs(parseInt(item.style.marginTop.replace("px", ""))) >= rect.top || Math.abs(parseInt(item.style.marginLeft.replace("px", ""))) >= rect.left) item.style.visibility = "hidden"; else item.style.visibility = "visible";
            }
        }
    }
}
function storeCustomOptions(option, key) {
    for (let i = 0; i < key.length; i++) localStorage.setItem(key[i], JSON.stringify(option[i]));
}
let getLicense = {};
fetch(`./translationItems/licenses.json`).then((res) => { res.json().then((json) => { getLicense = json }) });
for (let item of document.querySelectorAll("[data-license]")) {
    item.addEventListener("click", () => {
        document.getElementById("licenseAnimatiom").classList.add("animate__animated", "animate__shakeX");
        item.classList.add("animate__animated", "animate__shakeX");
        document.getElementById("licenseText").innerHTML = getLicense[item.getAttribute("data-license")].replace("{DateAndAuthorReplace}", item.getAttribute("data-author")).replaceAll("\n", "<br>");
        setTimeout(() => {
            item.classList.remove("animate__animated", "animate__shakeX");
            document.getElementById("licenseAnimatiom").classList.remove("animate__animated", "animate__shakeX");
        }, 1000);
    });
}
document.getElementById("appversion").textContent = appVersion;

function dropFile(event) {
    function readFileStart(itemToRead) {
        let fileRead = new FileReader();
        fileRead.onload = function () {
            startPDFRead(fileRead.result);
        }
        fileRead.readAsDataURL(itemToRead);
    }
    event.preventDefault();
    if (event.dataTransfer.items) {
        if (event.dataTransfer.items[0].kind === "file") readFileStart(event.dataTransfer.items[0].getAsFile());
    } else {
        readFileStart(event.dataTransfer.files[0]);
    }
}
document.getElementById("openDiv").addEventListener("drop", (e) => { dropFile(e) });
document.getElementById("openDiv").addEventListener("dragover", (e) => { e.preventDefault(); });
document.getElementById("openDiv").addEventListener("dragenter", () => { document.getElementById("openDiv").classList.add("dropNotice") });
for (let animateEnd of document.getElementsByClassName("optionId")) {
    if (animateEnd.childNodes[1] !== undefined && animateEnd.childNodes[1].tagName.toLowerCase() === "img") {
        animateEnd.addEventListener("mouseleave", () => {
            animateEnd.childNodes[1].classList.add("closeAnimationTool");
            setTimeout(() => { animateEnd.childNodes[1].classList.remove("closeAnimationTool"); }, 350);
        })
    }
}
let language = navigator.language || navigator.userLanguage;
if (language.indexOf("it") !== -1 && window.location.href.indexOf("nolang") === -1 && localStorage.getItem("PDFPointer-nolang") !== "yes") {
    fetch(`./translationItems/it.json`).then((res) => {
        res.json().then((json) => {
            for (let item of document.querySelectorAll("[data-translate]")) item.textContent = json[item.getAttribute("data-translate")];
            globalTranslations = json.globalTranslations;
            topAlert(globalTranslations.changeLang, "differentlang", true);
        })
    })
}
document.querySelector("[data-translate=customThemeBtn]").addEventListener("click", () => {
    window.location.href = `./themeCreator/create.html`
})
if (localStorage.getItem("PDFPointer-selectedtheme") !== null && document.querySelector(`[data-themerefer=${localStorage.getItem("PDFPointer-selectedtheme")}]`) !== null) document.querySelector(`[data-themerefer=${localStorage.getItem("PDFPointer-selectedtheme")}]`).click();
document.getElementById("alertNumberDuration").addEventListener("change", () => { optionProxy.changeItems.alertInt = document.getElementById("alertNumberDuration").value });
document.querySelector("[data-translate=resetTip]").addEventListener("click", () => { localStorage.setItem("PDFPointer-notshow", "") });
for (let item of document.getElementsByClassName("button")) {
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
function PWAHide() {
    document.getElementById("pwaPromote").remove();
    for (let item of document.querySelectorAll("[data-card=opencard]")) item.style.width = "100%";
}
if (window.matchMedia('(display-mode: standalone)').matches) PWAHide();
function continueShow(progress) {
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
for (let item of document.querySelectorAll("[data-progress]")) item.addEventListener("click", () => { continueShow(parseInt(item.getAttribute("data-progress"))) });
document.querySelector("[data-translate=endTour]").addEventListener("click", () => {
    document.getElementById("introContainer").style.opacity = 0;
    localStorage.setItem("PDFPointer-endtour", "true");
    setTimeout(() => { document.getElementById("introContainer").style.display = "none" }, 500)
})
if (localStorage.getItem("PDFPointer-endtour") === null) {
    document.getElementById("introContainer").style.display = "inline";
    document.getElementById("introContainer").style.opacity = 1;
}
for (let item of document.querySelectorAll("[data-customAnimate='1']")) {
    item.addEventListener("mouseenter", () => { item.classList.remove("closeAnimationTool"); item.classList.add("btnTourAnimate") });
    item.addEventListener("mouseleave", () => { item.classList.remove("btnTourAnimate"); item.classList.add("closeAnimationTool") });
}
let switchIds = [[document.getElementById("pointerSelectionDiv"), document.getElementById("pointerCheck"), document.getElementById("pointerContainer"), "changeItems.pointerColorEnabled"], [document.getElementById("alertContainer"), document.getElementById("alertCheck"), document.getElementById("alertMain"), "changeItems.showTips"]];
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
document.getElementById("pointerColorSelector").addEventListener("input", () => { optionProxy.changeItems.pointerColorColor = document.getElementById("pointerColorSelector").value });
document.querySelector("[data-translate=exportColor]").addEventListener("click", () => {
    let a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(optionProxy.availableHighlightColors)], { type: "text/plain" }));
    a.download = `colors-export.json`;
    a.click();
})
document.querySelector("[data-translate=importColor]").addEventListener("click", () => {
    let file = document.createElement("input");
    file.type = "file";
    file.onchange = () => {
        let read = new FileReader();
        read.onload = () => {
            let parse = JSON.parse(read.result);
            optionProxy.availableHighlightColors = { "currentColor": [255, 0, 0, 255] };
            for (let item in parse) {
                let continueImport = true;
                for (let part of parse[item]) try { if (parseInt(part) > 255 || parseInt(part) < 0) continueImport = false } catch (ex) { console.warn(ex); continueImport = false };
                if (!continueImport) continue;
                optionProxy.availableHighlightColors[item] = parse[item];
            }
            localStorage.setItem("PDFPointer-customColors", JSON.stringify(optionProxy.availableHighlightColors));
            alert("Colors restored. The page will be refreshed.");
            location.reload();
        }
        read.readAsText(file.files[0]);
    }
    file.click();
})
document.querySelector("[data-translate=resetColor]").addEventListener("click", () => {
    optionProxy.availableHighlightColors = {
        "Red": [255, 0, 0, 255],
        "Blue": [0, 0, 255, 255],
        "Green": [0, 255, 0, 255],
        "currentColor": [255, 0, 0, 255],
    };
    localStorage.setItem("PDFPointer-customColors", JSON.stringify(optionProxy.availableHighlightColors));
    alert("Colors restored. The page will be refreshed.");
    location.reload();
});
document.querySelector("[data-translate=changeZoom]").addEventListener("click", () => {
    dialogGeneralAnimation("settings", false);
    setTimeout(() => { dialogGeneralAnimation("zoomChooseContainer", true) }, 1150);
})
window.scrollTo({ top: 0, behavior: 'smooth' });
for (let item of document.querySelectorAll("video")) item.addEventListener("error", () => {
    let parent = item.parentElement;
    item.remove();
    parent.textContent = "An error occourred while streaming the video :(";
});
let currentScroll = false;
document.body.addEventListener("wheel", () => {
    if (document.getElementById("toolMain").style.visibility === "hidden") return;
    if (window.scrollY > (document.getElementById("generalToolContainer").getBoundingClientRect().bottom + document.getElementById("generalToolContainer").getBoundingClientRect().top)) {
        if (currentScroll) return;
        currentScroll = true;
        document.getElementById("generalToolContainer").style = "position: fixed; z-index: 9999997; top: 15px;";
    } else {
        if (!currentScroll) return;
        document.getElementById("generalToolContainer").style = "";
        currentScroll = false;
    }
})
for (let item of document.querySelectorAll("[data-videofetch]")) {
    fetch(`${positionLink}assets/${item.getAttribute("data-videofetch")}`).then((res) => {
        res.blob().then((blob) => {
            item.src = URL.createObjectURL(blob);
        }).catch((ex) => { console.warn(ex) })
    }).catch((ex) => { console.warn(ex) });
}
document.getElementById("welcomeClick").addEventListener("click", () => { window.location.reload() });
try {
    document.getElementById("jsContinue").addEventListener("click", () => { document.getElementById("jsPromptAsk").remove(); })
    document.getElementById("jsPromptAsk").remove();
} catch (ex) {
    console.log("Hello World! :D");
}
if (window.location.href.indexOf("?nolang") !== -1) localStorage.setItem("PDFPointer-nolang", "yes");
if (window.location.href.indexOf("?itlang") !== -1) {
    localStorage.setItem("PDFPointer-nolang", "no");
    window.location.href = window.location.href.substring(0, window.location.href.indexOf("?itlang"));
}
document.getElementById("langOption").addEventListener("input", () => {
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
let simpleSwitchAction = [["moveZoomCheck", "resizeCanvasCheck"], ["changeItems.moveZoom", "changeItems.resizeCanvas"]];
for (let i = 0; i < simpleSwitchAction[0].length; i++) document.getElementById(simpleSwitchAction[0][i]).addEventListener("input", () => {
    let item = optionProxy;
    let itemPart = simpleSwitchAction[1][i].split(".");
    for (let x = 0; x < itemPart.length - 1; x++) item = item[itemPart[x]];
    item[itemPart[itemPart.length - 1]] = document.getElementById(simpleSwitchAction[0][i]).checked;
})
function showResizeCanvasBtn(show) {
    document.querySelector("[data-action=expand]").style.display = show;
    document.querySelector("[data-action=contract]").style.display = show;
}
document.getElementById("resizeCanvasCheck").addEventListener("input", () => {
    if (document.getElementById("resizeCanvasCheck").checked) showResizeCanvasBtn("block"); else showResizeCanvasBtn("none");
});
if (!optionProxy.changeItems.resizeCanvas || !localStorage.getItem("PDFPointer-resizecanvas")) showResizeCanvasBtn("none");
document.querySelector("[data-action=expand]").addEventListener("click", () => {
    canvasGeneralScale += 5;
    canvasPDF(loadPDF[2]);
});
document.querySelector("[data-action=contract]").addEventListener("click", () => {
    canvasGeneralScale -= 5;
    canvasPDF(loadPDF[2]);
});
