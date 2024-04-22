export interface CustomOptions {
    name: string,
    value: string,
    isColor?: boolean
}
export interface OptionUpdater {
    interface: string,
    value: string
}
export interface DrawingStoredOptions {
    timer: number,
    size: number,
    cursorColor: string,
    cursorSize: number,
    penColor: string,
    textSize: number,
    textFont: string,
    textLineSpace: number,
    textStrikeLineWidth: 4,
    penOpacity: 1,
}
export interface CustomProp {
    name: string,
    value: string,
    id: number,
    lists?: {
        ref: string,
        value: string
    }[]
}
export interface KeyPreference {
    zoomin?: string,
    zoomout?: string,
    pen?: string,
    pointer?: string,
    text?: string,
    erase?: string,
    stop?: string
}
