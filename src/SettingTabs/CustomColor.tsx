import CustomDisplay from "../Components/CustomDisplay";
import Lang from "../Scripts/LanguageTranslations";

/**
 * The settings tab where the user can add and manage custom colors
 * @returns the CustomColor ReactNode tab
 */
export default function CustomColor() {
    return <>
        <h3>{Lang("Custom colors:")}</h3>
        <i>{Lang("The custom colors will appear in the Cursor and Pen color pickers.")}</i><br></br><br></br>
        <CustomDisplay category="Color"></CustomDisplay>
    </>
}