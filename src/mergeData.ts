import { traverse, deepCopyObj } from "./deps.ts";
import { getData as getDataFromUnderstandingPage } from "./understandingPages/output.ts";

async function appendUnderstandingPageData(
  mainDocumentData: any,
): Promise<any> {
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

  const combinedData = deepCopyObj(mainDocumentData);

  traverse(combinedData).forEach(function (
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

  return combinedData;
}

export { appendUnderstandingPageData };
