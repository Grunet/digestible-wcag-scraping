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
var $: CheerioStatic;

async function getScrapedData(params: IParameters): Promise<IScrapedData> {
  const { url } = params;

  const res = await fetch(url);

  const resBody = new TextDecoder("utf-8").decode(
    new Uint8Array(await res.arrayBuffer())
  );

  $ = cheerio.load(resBody);

  const examplesSection: Cheerio = $("#examples");
  if (examplesSection.length == 0) {
    //Some of the pages don't have an Examples section yet
    return {};
  } else if (examplesSection.length > 1) {
    throw new Error(
      `There should probably only be at most 1 "Examples" section per understanding page.`
    );
  }

  const extractedContent: string[] = [];
  if (extractedContent.length === 0) {
    //This covers cases like https://www.w3.org/WAI/WCAG21/Understanding/status-messages.html#examples
    extractedContent.push(...__extractContentWithSections(examplesSection));
  }

  if (extractedContent.length === 0) {
    //This covers cases like https://www.w3.org/WAI/WCAG21/Understanding/reflow.html#examples
    extractedContent.push(...__extractContentWithParagraphs(examplesSection));
  }

  if (extractedContent.length === 0) {
    //This covers cases like https://www.w3.org/WAI/WCAG21/Understanding/motion-actuation.html#examples
    extractedContent.push(
      ...__extractContentWithoutParagraphs(examplesSection)
    );
  }

  const examplesData = extractedContent.map((html) => ({ content: html }));

  return {
    examples: examplesData,
  };
}

function __extractContentWithSections(examplesSection: Cheerio): string[] {
  const extractedContent: string[] = examplesSection
    .find("section")
    .map(function (index: number, sectionElement: CheerioElement) {
      return $(sectionElement).html();
    })
    .get()
    .filter((content: string) => content !== ""); //Workaround for 2.5.5 currently containing an empty section element inside the examples section https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html#examples

  return extractedContent;
}

function __extractContentWithParagraphs(examplesSection: Cheerio): string[] {
  const extractedContentWithDuplicates: string[] = examplesSection
    .find("p")
    .map(function (index: number, element: CheerioElement) {
      return $(element).parent();
    })
    .map(function (index: number, parent: CheerioElement) {
      return $(parent).remove(":not(p)");
    })
    .map(function (index: number, modifiedParent: CheerioElement) {
      return $(modifiedParent).html();
    })
    .get();

  const extractedContent: string[] = [
    ...new Set(extractedContentWithDuplicates),
  ]; //Removing output coming from the same parent element mulitple times

  return extractedContent;
}

function __extractContentWithoutParagraphs(examplesSection: Cheerio): string[] {
  const extractedContent: string[] = examplesSection
    .find("li")
    .filter(function (index: number, listElement: CheerioElement) {
      return $(listElement).find("p").length === 0;
    })
    .map(function (index: number, listElement: CheerioElement) {
      return $(listElement).html();
    })
    .get();

  return extractedContent;
}

export { getScrapedData };
export type { IParameters, IScrapedData };
