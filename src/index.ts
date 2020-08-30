import { getData } from "./mainDocument/output.ts";
import { saveData } from "./save.ts";

async function createJsonOutput(pathToSaveDir: string) {
  const mainDocumentData = await getData();
  await saveData(pathToSaveDir, mainDocumentData);
}

export { createJsonOutput };
