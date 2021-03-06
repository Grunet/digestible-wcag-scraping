import { deepCopyObj, traverse } from "../deps.ts";
import { IScrapedData } from "./scrape.ts";

function formatScrapedData(scrapedData: IScrapedData): any {
  const formattedData = deepCopyObj(scrapedData);

  traverse(formattedData).forEach(function (
    this: traverse.TraverseContext,
    _value: any,
  ) {
    if (this?.node?.hasOwnProperty("headingText")) {
      const scrapedHeadingText = this.node.headingText;

      const id = scrapedHeadingText.replace(/[^\d.]+/g, "");

      const name = scrapedHeadingText.split(id)[1].trimStart();

      this.node["id"] = id;
      this.node["name"] = name;

      delete this.node["headingText"];
    }
  });

  traverse(formattedData).forEach(function (
    this: traverse.TraverseContext,
    _value: any,
  ) {
    if (this?.key?.includes("links")) {
      const linksObj = this.node as { [key: string]: string };

      const modifiedKvPairs = Object.entries(linksObj);
      modifiedKvPairs.forEach(function (kvPair) {
        if (kvPair[0].includes("Understanding")) {
          kvPair[0] = "understand";
        }

        if (kvPair[0].includes("How to Meet")) {
          kvPair[0] = "meet";
        }
      });

      const modifiedLinksObj = Object.fromEntries(modifiedKvPairs);

      modifiedLinksObj["examples"] = `${
        modifiedLinksObj["understand"]
      }#examples`;

      const meetURL = new URL(modifiedLinksObj["meet"]);
      meetURL.searchParams.append(
        "showtechniques",
        this.parent?.node["id"].replace(/\./g, ""),
      );
      modifiedLinksObj["meet"] = meetURL.toString();

      this.update(modifiedLinksObj);
    }
  });

  traverse(formattedData).forEach(function (
    this: traverse.TraverseContext,
    _value: any,
  ) {
    if (this?.node?.hasOwnProperty("levelText")) {
      const levelText = this.node.levelText;

      const levelCat = levelText.replace(/[^A]+/g, "");

      this.node["level"] = levelCat;
      delete this.node["levelText"];
    }
  });

  traverse(formattedData).forEach(function (
    this: traverse.TraverseContext,
    value: any,
  ) {
    //Stripping links to in-page definitions that are broken out of context
    if (typeof value === "string" && value.includes("</a>")) {
      const contentMinusLinks: string = value.replace(/<\/?a[^>]*>/g, "");

      this.update(contentMinusLinks);
    }
  });

  return formattedData;
}

export { formatScrapedData };
