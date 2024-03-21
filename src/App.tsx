import { useEffect, useState } from "react";
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
PDFJS.GlobalWorkerOptions.workerSrc = pdfjsWorker;
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
  }, [])
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
            if (input.files !== null) {
              let doc = PDFJS.getDocument(await input.files[0].arrayBuffer());
              document.title = `${input.files[0].name} - PDFPointer`;
              let res = await doc.promise;
              UpdateState({ ...CurrentState, PDFObj: res });
            }
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