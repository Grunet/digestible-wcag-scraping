import { IScrapedData } from "./scrape.ts";

interface IParameters {
  url: URL;
  scrapedData: IScrapedData;
}

interface IFormattedData extends IScrapedData {}

import { deepCopyObj, traverse } from "../deps.ts";

function formatScrapedData(params: IParameters): IFormattedData {
  const { url: fullUrlOfPage, scrapedData } = params;

  const formattedData = deepCopyObj(scrapedData);

  traverse(formattedData).forEach(function (
    this: traverse.TraverseContext,
    value: any
  ) {
    //Replacing relative image URLs with their full versions (i.e. including the base name)
    if (typeof value === "string" && value.includes("<img")) {
      const contentWithUpdatedImgUrls: string = value.replace(
        /src=\".*?\"/g,
        function (origAttributeStr: string): string {
          const relativeUrl = origAttributeStr.split("=")[1].split('"')[1];

          const fullURL = new URL(relativeUrl, fullUrlOfPage.href);

          const updatedAttributeStr = `src="${fullURL.href}"`;
          return updatedAttributeStr;
        }
      );

      this.update(contentWithUpdatedImgUrls);
    }

    //Replacing relative anchor URLs with their full versions (i.e. including the base name)
    if (typeof value === "string" && value.includes("<a")) {
      const contentWithUpdatedAnchorUrls: string = value.replace(
        /href=\".*?\"/g,
        function (origAttributeStr: string): string {
          const relativeUrl = origAttributeStr.split("=")[1].split('"')[1];

          const fullURL = new URL(relativeUrl, fullUrlOfPage.href);

          const updatedAttributeStr = `href="${fullURL.href}"`;
          return updatedAttributeStr;
        }
      );

      this.update(contentWithUpdatedAnchorUrls);
    }
  });

  return formattedData;
}

export { formatScrapedData };
export type { IFormattedData };
