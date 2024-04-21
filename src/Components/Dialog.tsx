import { ReactNode, useEffect, useRef } from "react";
import { DynamicImg } from "./DynamicImg";

interface Props {
    children: ReactNode
}
/**
 * Create a dialog interface
 * @param children the content inside the dialog
 * @returns the Dialog ReactNode
 */
export default function Dialog({ children }: Props) {
    let ref = useRef<HTMLDivElement>(null)
    useEffect(() => {
        setTimeout(() => { if (ref.current) ref.current.style.opacity = "1" }, 25); // Add an opacity effet
    })
    return <div ref={ref} className="dialog">
        <div>
            {children}
            <div style={{ position: "absolute", top: 15, right: 15 }} className="simplePointer" onClick={async () => { // The icon that'll hide the dialog
                if (ref.current) {
                    ref.current.style.opacity = "0";
                    await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));
                    ref.current.remove();
                }
            }}><DynamicImg id="minimize"></DynamicImg></div>
        </div>
    </div>
}
