import { createRoot } from "react-dom/client";
import AlertDom from "../Components/AlertDom";

interface Props {
    id: string, // An identifier for the type of alert, so that they can be ignored permanently if the user wants so.
    text: string, // The text to add in the alert
    extra?: HTMLElement, // Add another Element to the alert UI
    showSpinner?: boolean, // Show a loading spinner for alerts regarding operations
    avoidTransition?: boolean // Delete the previous alert without the opacity animation
}
function remove(avoidTransition?: boolean) {
    return new Promise<void>(async (resolve) => {
        for (const item of document.querySelectorAll(".alert")) {
            await new Promise<void>((resolve) => {
                if (avoidTransition) {
                    item.remove();
                    resolve();
                } else {
                    (item as HTMLDivElement).style.opacity = "0";
                    setTimeout(() => { item.remove(); resolve() }, 250)
                }
            })
        }
        resolve();
    })
}

export default {
    /**
     * Create a new alert
     * @param id the category of the alert, so that the user can hide some type of alerts
     * @param text the content of the alert
     * @param extra add a HTMLElement at the right of the text
     * @param showSpinner show a loading spinner at the left of the alert
     * @param avoidTransition make the alert immediately visible, without the opacity transition 
     * @returns A promise, resolved when the alert has been removed
     */
    alert: ({ id, text, extra, showSpinner, avoidTransition }: Props) => {
        return new Promise<void>(async (resolve) => {
            await remove(avoidTransition); // Delete the previous alert
            if (localStorage.getItem("PDFPointer-HideAlerts") === "a" || JSON.parse(localStorage.getItem("PDFPointer-AvoidAlert") ?? "[]").indexOf(id) !== -1) { resolve(); return }; // If the user doesn't want to see that alert, hide it
            const currentAlert = document.createElement("div");
            currentAlert.classList.add("alert");
            createRoot(currentAlert).render(<AlertDom id={id} text={text} extra={extra} showSpinner={showSpinner} close={() => remove(avoidTransition)}></AlertDom>)
            if (avoidTransition) currentAlert.style.opacity = "1";
            currentAlert.classList.add("alert"); // Add it also after the root creation since sometimes it seems that it might be lost
            (document.querySelector(".card") ?? document.body).append(currentAlert); // Prefer adding it in the main card so that alerts are shown also on full screen mode (that is called on the .card item)
            setTimeout(() => { currentAlert.style.opacity = "1" }, 50);
            setTimeout(async () => {
                await remove(avoidTransition);
                resolve();
            }, isNaN(parseInt(localStorage.getItem("PDFPointer-AlertLength") ?? "")) ? 5000 : parseInt(localStorage.getItem("PDFPointer-AlertLength") ?? "5000"));
        })
    },
    /**
     * Delete the currently-displayed alert from the DOM
     * @param avoidTransition force remove, without doing the opacity transition
     * @returns a promise, resolved when the item has been removed
     */
    simpleDelete: remove
}
