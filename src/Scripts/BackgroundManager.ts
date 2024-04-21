import AlertManager from "./AlertManager";
import IndexedDatabase from "./IndexedDatabase"
import Lang from "./LanguageTranslations";

interface SetObj {
    content: Blob,
    type: "url" | "video" | "image"
}
let CardBlurItems = new Map<HTMLDivElement, string>();
/**
 * Go back to the default background color for cards, instead of the background image/video
 */
function restoreItems() {
    const oldContent = document.querySelector(".backgroundContent");
    if (oldContent) oldContent.remove();
    document.body.style.setProperty("--afterbackdrop", "none"); // Hide the :after content of the card div that applies the opacity effect
    for (const [item, type] of CardBlurItems) {
        item.style.backgroundColor = type;
        (item.firstChild as HTMLDivElement).style.padding = "0px";
        (item.firstChild?.firstChild as HTMLDivElement).style.backgroundColor = type;
    }
}
/**
 * Get the URL for the YouTube video embed
 * @param url the 11-digit YouTube video ID
 * @returns a string, with the URL for the YouTube video embed
 */
function getYoutubeUrl(url: string) {
    return `https://www.youtube-nocookie.com/embed/${url}${url.indexOf("?") !== -1 ? "&" : "?"}autoplay=1&mute=1&loop=1`;
}
export default {
    /**
     * Save the blob in the IndexedDB
     * @param type the identifier of the resource
     * @param content the Blob that needs to be saved
     * @returns a promise, resolved when the file has been saved
     */
    async set({ type, content }: SetObj) {
        return await IndexedDatabase.set({
            db: await IndexedDatabase.db(), object: {
                UserContent: type,
                blob: content
            }
        });
    },
    /**
     * Get the background from the IndexedDB and show it in the DOM
     * @param query the identifier of the resource
     */
    async apply({ query }: { query: string }) {
        const content = await IndexedDatabase.get({ db: await IndexedDatabase.db(), query: query });
        if (content !== undefined) {
            // Remove prrevious content
            const oldContent = document.querySelector(".backgroundContent");
            if (oldContent) oldContent.remove();
            localStorage.setItem("PDFPointer-BackgroundOptions", query); // Update the LocalStorage with the current query, so that it'll be restored when the user refreshes the page
            switch (query) { // Add an image, video, or YouTube URL
                case "image": {
                    const img = document.createElement("img");
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
                    const video = document.createElement("video");
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
                    const mainDiv = document.createElement("div");
                    mainDiv.classList.add("backgroundContent", "video-background");
                    const iframe = document.createElement("iframe");
                    const url = await content.blob.text(); // The video/playlist ID is stored as a Blob
                    iframe.allow = "autoplay"
                    iframe.frameBorder = "0";
                    iframe.src = getYoutubeUrl(url); // Format the URL
                    const oldContent = document.querySelector(".backgroundContent");
                    if (oldContent) oldContent.remove();
                    mainDiv.append(iframe);
                    document.body.append(mainDiv);
                    break;
                }
            }
            document.body.style.setProperty("--afterbackdrop", "block"); // Add the transparency effect by showing the :after content of the card class
            for (const [item] of CardBlurItems) { // Update the style of the cards
                item.style.backgroundColor = "";
                (item.firstChild as HTMLDivElement).style.padding = "10px";
                (item.firstChild?.firstChild as HTMLDivElement).style.backgroundColor = "";
            }
        }
    },
    /**
     * Add a new card to the list, so that its style can be modified when the user changes theme
     * @param item the HTMLDivElement that is blurred
     * @param type the type of the background color
     */
    updateCard: (item: HTMLDivElement, type: string) => {
        CardBlurItems.set(item, type);
    },
    /**
 * Go back to the default background color for cards, instead of the background image/video
 */
    restoreItems: restoreItems,
    /**
 * Get the URL for the YouTube video embed
 * @param url the 11-digit YouTube video ID
 * @returns a string, with the URL for the YouTube video embed
 */
    getYoutubeUrl: getYoutubeUrl
}