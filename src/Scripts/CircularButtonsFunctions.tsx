import { createRoot } from "react-dom/client";
import Settings from "../Components/Settings";
import { PdfUIState } from "../Interfaces/CustomOptions";

export default {
    /**
     * Enable or disable PDF fullscreen mode
     */
    fullscreen: () => {
        document.fullscreenElement ? document.exitFullscreen() : document.querySelector(".card")?.requestFullscreen()
    },
    /**
     * Show the settings by creating a new root
     * @param updatePage the function to update the State of the PdfUI, used so that the UI can be refreshed when the page changes
     */
    settings: (updatePage: React.Dispatch<React.SetStateAction<PdfUIState>>) => {
        let div = document.createElement("div");
        createRoot(div).render(<Settings updateLang={() => updatePage(prevState => { return { ...prevState, langUpdate: prevState.langUpdate + 1 } })}></Settings>); // With the "updatePage" parameter, all of the PdfUI is re - rendered, and thererfore the language change is applied.
        document.body.append(div);
    }
}