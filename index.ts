import { getScrapedData } from "./scrape.ts";
import { formatScrapedData } from "./format.ts";

const scrapedData = await getScrapedData();
const formattedData = formatScrapedData(scrapedData);

const contentBytes = new TextEncoder().encode(
  JSON.stringify(formattedData, null, 4),
);
Deno.mkdir("dist", { recursive: true });
const file = await Deno.open(
  "./dist/output.json",
  { write: true, create: true },
);
await Deno.writeAll(file, contentBytes);
Deno.close(file.rid);
