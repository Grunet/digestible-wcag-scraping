interface IParameters {
  url: string;
}

interface IScrapedData {
  examples?: IExampleData[];
}

interface IExampleData {
  content: string;
}

import { cheerio } from "../deps.ts";

async function getScrapedData(params: IParameters): Promise<IScrapedData> {
  const { url } = params;

  const res = await fetch(url);

  const resBody = new TextDecoder("utf-8").decode(
    new Uint8Array(await res.arrayBuffer()),
  );

  let $ = cheerio.load(resBody);

  const examplesSection = $("#examples");
  if (examplesSection.length == 0) {
    //Some of the pages don't have an Examples section yet
    return {};
  } else if (examplesSection.length > 1) {
    throw new Error(
      `There should probably only be at most 1 "Examples" section per understanding page.`,
    );
  }

  const extractedContentWithDuplicates: string[] = examplesSection.find("p")
    .map(
      function (index: number, element: CheerioElement) {
        return $(element).parent();
      },
    ).map(
      function (index: number, parent: CheerioElement) {
        return $(parent).remove(":not(p)");
      },
    ).map(
      function (index: number, modifiedParent: CheerioElement) {
        return $(modifiedParent).html();
      },
    ).get();

  const extractedContent: string[] = [
    ...new Set(extractedContentWithDuplicates),
  ];

  const examplesData = extractedContent.map((html) => ({ content: html }));

  return {
    examples: examplesData,
  };
}

export { IParameters, getScrapedData, IScrapedData };
