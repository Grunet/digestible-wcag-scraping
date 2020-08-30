import { getData as getDataFromMainDocument } from "./mainDocument/output.ts";
import { appendUnderstandingPageData } from "./mergeData.ts";
import { saveData } from "./save.ts";

async function createJsonOutput(pathToSaveDir: string) {
  const mainDocumentData = await getDataFromMainDocument();
  const allData = await appendUnderstandingPageData(mainDocumentData);

  await saveData(pathToSaveDir, allData);
}

export { createJsonOutput };
