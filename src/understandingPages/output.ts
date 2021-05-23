import { getScrapedData, IParameters } from "./scrape.ts";
import { formatScrapedData, IFormattedData } from "./format.ts";

async function getData(params: IParameters): Promise<IFormattedData> {
  const { url } = params;

  const scrapedData = await getScrapedData({
    url: url,
  });
  const formattedData = formatScrapedData({
    url: url,
    scrapedData: scrapedData,
  });

  return formattedData;
}

export { getData };
export type { IFormattedData };
