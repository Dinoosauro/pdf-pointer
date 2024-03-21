import { UpdateImages } from "../Components/DynamicImg";
import { CustomProp } from "../Interfaces/CustomOptions";

let defaultThemes: CustomProp[] = [{ // The default dark and light themes
    name: "Standard Dark",
    lists: [{
        ref: "background",
        value: "#151515"
    }, {
        ref: "text",
        value: "#f0f0f0"
    }, {
        ref: "firststruct",
        value: "#313131"
    }, {
        ref: "secondstruct",
        value: "#474747"
    }, {
        ref: "accent",
        value: "#2c8b9b"
    }],
    id: -1,
    value: "#2c8b9b"
}, {
    name: "Standard White",
    lists: [{
        ref: "background",
        value: "#f5f5f5"
    }, {
        ref: "text",
        value: "#151515"
    }, {
        ref: "firststruct",
        value: "#d7d7d7"
    }, {
        ref: "secondstruct",
        value: "#bebebe"
    }, {
        ref: "accent",
        value: "#2c8b9b"
    }],
    id: -2,
    value: "#2c8b9b"
}]
interface RemoveObj {
    id: number,
    category: string
}
export default {
    remove: ({ id, category }: RemoveObj) => { // Remove a custom color or theme from the list
        let getContent = JSON.parse(localStorage.getItem(`PDFPointer-Custom${category ?? "Theme"}`) ?? "[]") as CustomProp[];
        getContent.splice(getContent.findIndex(f => f.id === id), 1);
        localStorage.setItem(`PDFPointer-Custom${category ?? "Theme"}`, JSON.stringify(getContent));
    },
    apply: (list: CustomProp["lists"]) => { // Apply a custom theme
        if (list !== undefined) {
            for (let item of list) if (/^#[0-9A-F]{6}$/i.test(item.value)) document.body.style.setProperty(`--${item.ref}`, item.value); // Check that the value is a hexadecimal color, and set it
            localStorage.setItem(`PDFPointer-CurrentTheme`, JSON.stringify(list)); // Store the theme as the current theme, so that it'll be restored when the page is refreshed.
            UpdateImages(); // Re-render icons so that the accent color can be updated
        }
    },
    standard: defaultThemes
}