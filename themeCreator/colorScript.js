let jsonImg = {
    toload: true
};
fetch(`https://dinoosauro.github.io/pdf-pointer/assets/mergedContent.json`).then((res) => { res.json().then((json) => { jsonImg = json }) });
for (let item of document.querySelectorAll("[data-action]")) {
    item.addEventListener("input", () => {
        document.documentElement.style.setProperty(`--${item.getAttribute("data-action")}`, `${item.value}`);
    })
}
document.querySelector("[data-action=accent]").addEventListener("input", () => {
    getImg([document.getElementById("img")], ["timer"]);
    getImg(document.querySelectorAll("[fetchlink]"));
});
document.querySelector("[data-action=text]").addEventListener("input", () => { getImg([document.querySelector("[fetchlink=logo]")]) })
getImg([document.getElementById("img")], ["timer"], undefined, "#c0c2d9");
document.getElementById("save").addEventListener("click", () => {
    if (document.getElementById("save").ariaDisabled) {
        alert("Please wait another 1 second.");
        return;
    }
    let style = getComputedStyle(document.documentElement);
    let itemContainer = {
        name: "Not chosen :(",
        colorProperties: {},
        isCustom: true,
        customItemRefer: -1
    };
    for (let item of document.querySelectorAll("[data-action]")) itemContainer.colorProperties[item.getAttribute("data-action")] = style.getPropertyValue(`--${item.getAttribute("data-action")}`);
    itemContainer.name = prompt("Choose a name for this theme :D");
    itemContainer.customItemRefer = new Date().toGMTString().replaceAll(",", "").replaceAll(":", "").replaceAll(" ", "");
    document.getElementById("save").ariaDisabled = true;
    setTimeout(() => { document.getElementById("save").ariaDisabled = false }, 1000);
    if (localStorage.getItem("PDFPointer-customThemeJson") == null) localStorage.setItem("PDFPointer-customThemeJson", JSON.stringify({ items: {} }));
    let newObj = JSON.parse(localStorage.getItem("PDFPointer-customThemeJson"));
    newObj.items[Object.keys(newObj.items).length] = itemContainer;
    localStorage.setItem("PDFPointer-customThemeJson", JSON.stringify(newObj));
    if (confirm("We've saved your theme! Do you want to apply it now? It can always be applied later from PDFPointer settings.\nNote that you'll need to refresh the webpage to apply it in any case.")) localStorage.setItem("PDFPointer-selectedtheme", itemContainer.customItemRefer);
    alert("Done! Refresh the PDFPointer page and you'll be able to see your new theme in the application settings. From there, click the bucket icon to apply it.")
})
getImg(document.querySelectorAll("[fetchlink]"));
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
            img.style.cursor = `url("data:image/svg+xml;utf8,${(`${read.replaceAll(`fill='#c5603f'`, `fill='rgb(${rgbOption[0]},${rgbOption[1]},${rgbOption[2]})'`)}`)}") 0 32, auto`;
        } else img.src = finalResult;
    }
}
let getStep = document.querySelectorAll("[data-step]");
getStep[0].classList.add("animate__animated");
for (let i = 1; i < getStep.length; i++) getStep[i].style.display = "none";
let stepClick = 0;
function getItems(prev) {
    let item = [stepClick - 1, stepClick]
    if (prev) item = [stepClick + 1, stepClick]
    document.getElementById("progress").textContent = stepClick;
    getStep[item[0]].classList.add("animate__backOutLeft");
    setTimeout(() => {
        getStep[item[0]].style.display = "none";
        if (item[1] === stepClick) {
            getStep[item[1]].style.display = "block";
            getStep[item[1]].classList.add("animate__animated", "animate__backInRight");
            setTimeout(() => { getStep[item[1]].classList.remove("animate__backInRight"); getStep[item[0]].classList.remove("animate__backOutLeft") }, 1000);
        } else {
            getStep[item[0]].classList.remove("animate__backOutLeft");
        }
    }, 1000);
}
document.querySelector("[data-click=prev]").addEventListener("click", () => {
    if (stepClick === 0) return;
    stepClick--;
    getItems(true);
});
document.querySelector("[data-click=next]").addEventListener("click", () => {
    if (stepClick === 7) return;
    stepClick++;
    getItems(false);
});
document.getElementById("export").addEventListener("click", () => {
    let a = document.createElement("a");
    let itemContainer = {
        colorProperties: {},
    };
    let style = getComputedStyle(document.documentElement);
    for (let item of document.querySelectorAll("[data-action]")) itemContainer.colorProperties[item.getAttribute("data-action")] = style.getPropertyValue(`--${item.getAttribute("data-action")}`);
    a.href = URL.createObjectURL(new Blob([JSON.stringify(itemContainer)]), { type: "text/plain" });
    document.documentElement.append(a);
    a.download = "ThemeExport.json"
    a.click();
    a.remove();
})
document.getElementById("import").addEventListener("click", () => {
    document.getElementById("reset").reset();
    document.getElementById("fileClick").click();
});
document.getElementById("fileClick").addEventListener("change", () => {
    let fileRead = new FileReader();
    fileRead.onload = function () {
        let getJson = JSON.parse(fileRead.result.toString());
        for (let item in getJson.colorProperties) {
            if (/^#[0-9A-F]{6}$/i.test(getJson.colorProperties[item])) {
                document.documentElement.style.setProperty(`--${item}`, `${getJson.colorProperties[item]}`);
            }
        }
    }
    fileRead.readAsText(document.getElementById("fileClick").files[0]);
})
document.getElementById("backPage").addEventListener("click", () => { history.back() });
let language = navigator.language || navigator.userLanguage;
if (language.indexOf("it") !== -1 && window.location.href.indexOf("nolang") === -1) {
    fetch(`https://dinoosauro.github.io/pdf-pointer/translationItems/it.json`).then((res) => {
        res.json().then((json) => {
            if (confirm("È disponibile una traduzione in italiano. Continuare in italiano? [A translation in Italian is available. Do you want to apply it?]")) {
                for (let item of document.querySelectorAll("[data-translation]")) item.textContent = json.themeCreation[item.getAttribute("data-translation")];
            }
        })
    })
}