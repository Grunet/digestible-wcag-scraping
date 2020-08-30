import { getScrapedData } from "./scrape.ts";
import { formatScrapedData } from "./format.ts";

async function getData(): Promise<any> {
  const scrapedData = await getScrapedData();
  const formattedData = formatScrapedData(scrapedData);

  return formattedData;
}

export { getData };
