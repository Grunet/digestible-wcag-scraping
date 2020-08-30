import { traverse } from "./deps.ts";
import { getData as getDataFromMainDocument } from "./mainDocument/output.ts";
import { getData as getDataFromUnderstandingPage } from "./understandingPages/output.ts";
import { saveData } from "./save.ts";

async function createJsonOutput(pathToSaveDir: string) {
  const mainDocumentData = await getDataFromMainDocument();

  const understandingDataPromises: Promise<any>[] = [];

  traverse(mainDocumentData).forEach(function (
    this: traverse.TraverseContext,
    _value: any,
  ) {
    if (this?.node?.hasOwnProperty("understand")) {
      const successCritId = this.parent?.node["id"];
      const understandPageURL = this.node["understand"];

      understandingDataPromises.push(
        (async function () {
          const understandingData = await getDataFromUnderstandingPage(
            { url: understandPageURL },
          );

          return [successCritId, understandingData];
        })(),
      );
    }
  });

  const understandingDataById = Object.fromEntries(
    await Promise.all(understandingDataPromises),
  );

  const allCombinedData = mainDocumentData;

  traverse(allCombinedData).forEach(function (
    this: traverse.TraverseContext,
    _value: any,
  ) {
    if (this?.node?.hasOwnProperty("id")) {
      const id = this.node["id"];

      if (id in understandingDataById) {
        const { examples } = understandingDataById[id];

        this.node["examples"] = examples ?? [];
      }
    }
  });

  await saveData(pathToSaveDir, allCombinedData);
}

export { createJsonOutput };
