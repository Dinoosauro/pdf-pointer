import CustomDisplay from "../Components/CustomDisplay";
import Lang from "../Scripts/LanguageTranslations";

/**
 * The settings tab where the user can create and manage custom themes
 * @returns the CustomTheme ReactNode tab
 */
export default function CustomTheme() {
    return <>
        <h3>{Lang("Custom themes:")}</h3>
        <i>{Lang("Make PDFPointer yours by changing its color palette")}</i><br></br><br></br>
        <CustomDisplay category="Theme"></CustomDisplay>
    </>
}