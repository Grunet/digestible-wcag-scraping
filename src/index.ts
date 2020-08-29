import { getScrapedData } from "./scrape.ts";
import { formatScrapedData } from "./format.ts";
import { saveFormattedData } from "./save.ts";

const scrapedData = await getScrapedData();
const formattedData = formatScrapedData(scrapedData);
await saveFormattedData(formattedData);
