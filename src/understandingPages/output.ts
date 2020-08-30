import { IParameters, getScrapedData, IScrapedData } from "./scrape.ts";

async function getData(params: IParameters): Promise<IScrapedData> {
  return await getScrapedData(params);
}

export { getData, IScrapedData as IFormattedData };
