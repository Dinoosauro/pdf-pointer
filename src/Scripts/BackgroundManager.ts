import AlertManager from "./AlertManager";
import IndexedDatabase from "./IndexedDatabase"
import Lang from "./LanguageTranslations";

interface SetObj {
    content: Blob,
    type: "url" | "video" | "image"
}
let CardBlurItems = new Map<HTMLDivElement, string>();
// Go back to the default background color for cards, instead of the background image/video
function restoreItems() {
    let oldContent = document.querySelector(".backgroundContent");
    if (oldContent) oldContent.remove();
    document.body.style.setProperty("--afterbackdrop", "none"); // Hide the :after content of the card div that applies the opacity effect
    for (let [item, type] of CardBlurItems) {
        item.style.backgroundColor = type;
        (item.firstChild as HTMLDivElement).style.padding = "0px";
        (item.firstChild?.firstChild as HTMLDivElement).style.backgroundColor = type;
    }
}
function getYoutubeUrl(url: string) {
    return `https://www.youtube-nocookie.com/embed/${url}${url.indexOf("?") !== -1 ? "&" : "?"}autoplay=1&mute=1&loop=1`;
}
export default {
    async set({ type, content }: SetObj) { // Save the blob in the IndexedDB
        return await IndexedDatabase.set({
            db: await IndexedDatabase.db(), object: {
                UserContent: type,
                blob: content
            }
        });
    },
    async apply({ query }: { query: string }) { // Get the background from the IndexedDB and show it in the DOM
        let content = await IndexedDatabase.get({ db: await IndexedDatabase.db(), query: query });
        if (content !== undefined) {
            // Remove prrevious content
            let oldContent = document.querySelector(".backgroundContent");
            if (oldContent) oldContent.remove();
            localStorage.setItem("PDFPointer-BackgroundOptions", query); // Update the LocalStorage with the current query, so that it'll be restored when the user refreshes the page
            switch (query) { // Add an image, video, or YouTube URL
                case "image": {
                    let img = document.createElement("img");
                    img.classList.add("backgroundContent");
                    img.onerror = (ex) => {
                        AlertManager.alert({ id: "ImageDecodingFailed", text: Lang("Invalid image provided. Fallback to basic color wallpaper") });
                        localStorage.removeItem("PDFPointer-BackgroundOptions");
                        restoreItems();
                    }
                    img.src = URL.createObjectURL(content.blob);
                    document.body.append(img);
                    break;
                }
                case "video": {
                    let video = document.createElement("video");
                    video.classList.add("backgroundContent");
                    video.autoplay = true;
                    video.loop = true;
                    video.muted = true;
                    video.onerror = (ex) => {
                        AlertManager.alert({ id: "VideoPlaybackFailed", text: Lang("Invalid video provided. Fallback to basic color wallpaper") });
                        localStorage.removeItem("PDFPointer-BackgroundOptions");
                        restoreItems();
                    }
                    video.src = URL.createObjectURL(content.blob);
                    document.body.append(video);
                    break;
                }
                case "url": {
                    // Create a container div for the YouTube iFrame
                    let mainDiv = document.createElement("div");
                    mainDiv.classList.add("backgroundContent", "video-background");
                    let iframe = document.createElement("iframe");
                    let url = await content.blob.text(); // The video/playlist ID is stored as a Blob
                    iframe.allow = "autoplay"
                    iframe.frameBorder = "0";
                    iframe.src = getYoutubeUrl(url); // Format the URL
                    let oldContent = document.querySelector(".backgroundContent");
                    if (oldContent) oldContent.remove();
                    mainDiv.append(iframe);
                    document.body.append(mainDiv);
                    break;
                }
            }
            document.body.style.setProperty("--afterbackdrop", "block"); // Add the transparency effect by showing the :after content of the card class
            for (let [item] of CardBlurItems) { // Update the style of the cards
                item.style.backgroundColor = "";
                (item.firstChild as HTMLDivElement).style.padding = "10px";
                (item.firstChild?.firstChild as HTMLDivElement).style.backgroundColor = "";
            }
        }
    },
    updateCard: (item: HTMLDivElement, type: string) => { // Add a new card to the list, so that its style can be modified when the user changes theme
        CardBlurItems.set(item, type);
    },
    restoreItems: restoreItems,
    getYoutubeUrl: getYoutubeUrl
}