import { getScrapedData } from "./scrape.ts";
import { formatScrapedData } from "./format.ts";
import { saveFormattedData } from "./save.ts";

async function createJsonOutput(pathToSaveDir: string) {
  const scrapedData = await getScrapedData();
  const formattedData = formatScrapedData(scrapedData);
  await saveFormattedData(pathToSaveDir, formattedData);
}

export { createJsonOutput };
