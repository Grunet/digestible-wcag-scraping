import { getScrapedData } from "./scrape.ts";
import { formatScrapedData } from "./format.ts";
import { saveFormattedData } from "./save.ts";

async function createJsonOutput() {
  const scrapedData = await getScrapedData();
  const formattedData = formatScrapedData(scrapedData);
  await saveFormattedData(formattedData);
}

export { createJsonOutput };
