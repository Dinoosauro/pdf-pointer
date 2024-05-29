import { useEffect, useRef, useState } from "react";
import Header from "./Components/Header";
import Card from "./Components/Card";
import { DynamicImg } from "./Components/DynamicImg";
import PdfObj from "./Components/PdfUI"
import { PDFDocumentProxy } from "pdfjs-dist";
import * as PDFJS from "pdfjs-dist";
// @ts-ignore
import * as pdfjsWorker from "pdfjs-dist/build/pdf.worker.mjs";
import { CustomProp } from "./Interfaces/CustomOptions";
import ThemeManager from "./Scripts/ThemeManager";
import Lang from "./Scripts/LanguageTranslations";
import BackgroundManager from "./Scripts/BackgroundManager";
import AlertManager from "./Scripts/AlertManager";
PDFJS.GlobalWorkerOptions.workerSrc = pdfjsWorker;
interface State {
  PDFObj?: PDFDocumentProxy,
  imgObj?: HTMLImageElement
  hideTab?: boolean
}
declare global {
  interface Window {
    heic2any: (e: any) => Promise<Blob>
  }
}
export default function App() {
  let installationPrompt = useRef<any>();
  let [CurrentState, UpdateState] = useState<State>({});
  let cardContainer = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let theme = JSON.parse(localStorage.getItem("PDFPointer-CurrentTheme") ?? "[]") as CustomProp["lists"];
    if (theme && theme.length !== 0) ThemeManager.apply(theme);
    let option = localStorage.getItem("PDFPointer-BackgroundOptions");
    if (option !== null) BackgroundManager.apply({ query: option });
    if ('launchQueue' in window) { // The user has opened files from the File Explorer
      (window.launchQueue as any).setConsumer(async (launchParams: any) => {
        if (!launchParams.files.length) return;
        getNewState(await launchParams.files[0].getFile());
      });
    }
    window.addEventListener('beforeinstallprompt', (event) => { // Capture the request to install the PWA so that it can be displayed when the button is clicked
      event.preventDefault();
      installationPrompt.current = event;
    });
  }, [])
  async function getNewState(file: File) {
    document.title = `${file.name} - PDFPointer`;
    if (file.type === "application/pdf") {
      let doc = PDFJS.getDocument(await file.arrayBuffer());
      let res = await doc.promise;
      UpdateState(prevState => { return { ...prevState, PDFObj: res } });
    } else {
      const img = new Image();
      const blob = new Blob([await file.arrayBuffer()]);
      let hasTriedError = false;
      img.src = URL.createObjectURL(blob);
      img.onload = () => UpdateState(prevState => { return { ...prevState, imgObj: img } });
      img.onerror = async () => {
        const availableJpgFormats = [".jpg", ".jpeg", ".jfif", ".pjpeg", ".pjp", ".heic", ".heif", ".heifs", ".heics"] // All the extensions that might contain an HEIC image
        if (availableJpgFormats.indexOf(file.name.substring(file.name.lastIndexOf("."))) !== -1 && !hasTriedError) { // Try opening HEIC image by transcoding it using the heic2any library
          AlertManager.alert({ id: "HeicImage", text: "The image provided might be a HEIC image. Transcoding is being tried." })
          hasTriedError = true; // Stop a possible loop, by executing this only one time
          const script = document.createElement("script");
          script.src = `https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js`;
          script.onload = async () => {
            img.src = URL.createObjectURL(await window.heic2any({ blob }));
          }
          document.body.append(script);
        }
      }
    }
  }
  return <>
    <Header></Header><br></br>
    {!CurrentState.PDFObj && !CurrentState.imgObj ? <>
      <div onDragOver={(e) => e.preventDefault()} ref={cardContainer} onDragEnter={() => cardContainer.current?.classList?.add("drag")} onDragLeave={() => cardContainer.current?.classList?.remove("drag")} onDrop={async (e) => { // Get the dropped file, and open it
        e.preventDefault();
        cardContainer.current?.classList?.remove("drag");
        if (e.dataTransfer.items) {
          if (e.dataTransfer.items[0].kind === "file") {
            const file = e.dataTransfer.items[0].getAsFile();
            file && getNewState(file);
          }
        } else getNewState(e.dataTransfer.files[0]);
      }} className={!CurrentState.hideTab && !window.matchMedia('(display-mode: standalone)').matches ? "doubleFlex" : undefined}>
        <Card>
          <h2>{Lang("Choose file")}</h2>
          <div className="center" style={{ width: "100%" }}>
            <DynamicImg id="laptop" width={200}></DynamicImg><br></br>
          </div>
          <i>{`${Lang("Don't worry. Everything will stay on your device.")} ${Lang("You can also drop files here.")} ${window.matchMedia('(display-mode: standalone)').matches ? Lang("Moreover, you can also open the files from the native file picker (Open With -> PDFPointer)") : ""}`}</i><br></br><br></br>
          <button onClick={() => { // Get the PDF file
            let input = document.createElement("input");
            input.type = "file";
            input.accept = "application/pdf, image/*"
            input.onchange = () => {
              input.files !== null && getNewState(input.files[0]);
            }
            input.click();
          }}>{Lang("Choose file")}</button>
        </Card>
        {!CurrentState.hideTab && !window.matchMedia('(display-mode: standalone)').matches && <Card>
          <h2>{Lang("Install as a web app")}</h2>
          <div className="center" style={{ width: "100%" }}>
            <DynamicImg id="app" width={200}></DynamicImg><br></br>
          </div>
          <i>{Lang("Install PDFPointer as an app for offline use and better integration with the OS.")}</i><br></br><br></br>
          <button onClick={() => {
            installationPrompt.current.prompt();
            installationPrompt.current.userChoice.then((choice: { outcome: string }) => {
              if (choice.outcome === "accepted") UpdateState(prevState => { return { ...prevState, hideTab: true } })
            });
          }}>{Lang("Install app")}</button>
        </Card>}
      </div>
    </> : <>
      <Card>
        <PdfObj pdfObj={CurrentState.PDFObj} imgObj={CurrentState.imgObj}></PdfObj>
      </Card>
    </>
    }
  </>
}
