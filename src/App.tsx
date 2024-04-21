import { useEffect, useState } from "react";
import Header from "./Components/Header";
import Card from "./Components/Card";
import { DynamicImg } from "./Components/DynamicImg";
import PdfObj from "./Components/PdfUI"
import { PDFDocumentProxy } from "pdfjs-dist";
import * as PDFJS from "pdfjs-dist";
import { CustomProp } from "./Interfaces/CustomOptions";
import ThemeManager from "./Scripts/ThemeManager";
import Lang from "./Scripts/LanguageTranslations";
import BackgroundManager from "./Scripts/BackgroundManager";
PDFJS.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.mjs";
interface State {
  PDFObj: PDFDocumentProxy | null
}
function app() {
  let [CurrentState, UpdateState] = useState<State>({ PDFObj: null });
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
  }, [])
  async function getNewState(file: File) {
    let doc = PDFJS.getDocument(await file.arrayBuffer());
    document.title = `${file.name} - PDFPointer`;
    let res = await doc.promise;
    UpdateState(prevState => { return { ...prevState, PDFObj: res } });
  }
  return <>
    <Header></Header><br></br>
    {CurrentState.PDFObj === null ? <>
      <Card>
        <h2>{Lang("Choose file")}</h2>
        <div className="center" style={{ width: "100%" }}>
          <DynamicImg id="laptop" width={200}></DynamicImg><br></br>
        </div>
        <i>{Lang("Don't worry. Everything will stay on your device.")}</i><br></br><br></br>
        <button onClick={() => { // Get the PDF file
          let input = document.createElement("input");
          input.type = "file";
          input.onchange = async () => {
            input.files !== null && getNewState(input.files[0]);
          }
          input.click();
        }}>{Lang("Choose file")}</button>
      </Card>
    </> : <>
      <Card>
        <PdfObj pdfObj={CurrentState.PDFObj}></PdfObj>
      </Card>
    </>
    }
  </>
}
export default app;