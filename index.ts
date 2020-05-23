const res = await fetch("https://www.w3.org/TR/2020/WD-WCAG22-20200227/");

const resBody = new TextDecoder("utf-8").decode(
  new Uint8Array(await res.arrayBuffer()),
);

// This typing can be switched to an updated version once https://github.com/DefinitelyTyped/DefinitelyTyped/issues/34036 is fixed
// @deno-types="https://raw.githubusercontent.com/DefinitelyTyped/DefinitelyTyped/deab75bde42b5a82aeb951f5a2edaa09922853f4/types/cheerio/index.d.ts"
import cheerio from "https://dev.jspm.io/cheerio@1.0.0-rc.3";
let $ = cheerio.load(resBody);

const scrapedData: any = {};

scrapedData["principles"] = [];

const principleSections = $(".principle");
principleSections.each(
  (principleIndex: number, principleSection: CheerioElement) => {
    const principleSectionHeading = $(principleSection).find("h2")[0];

    const principleParagraph = $(principleSection).find("p")[0];

    scrapedData["principles"][principleIndex] = {
      headingText: $(principleSectionHeading).text(),
      paraText: $(principleParagraph).text(),
      guidelines: [],
    };

    const guidelineSections = $(principleSection).find(".guideline");
    guidelineSections.each(
      (guidelineIndex: number, guidelineSection: CheerioElement) => {
        const guidelineSectionHeading = $(guidelineSection).find("h3")[0];

        const guidelineSectionParagraph = $(guidelineSection).find("p")[0];

        scrapedData["principles"][principleIndex]["guidelines"][
          guidelineIndex
        ] = {
          headingText: $(guidelineSectionHeading).text(),
          paraText: $(guidelineSectionParagraph).text(),
          successCriteria: [],
        };

        const successCrits = $(guidelineSection).find(".sc");
        successCrits.each(
          (successCritIndex: number, successCrit: CheerioElement) => {
            const successCritHeading = $(successCrit).find("h4")[0];

            const successCritLevel =
              $(successCrit).find(".conformance-level")[0];

            const successCritLinksWrapper = $(successCrit).find(".doclinks")[0];
            const successCritLinks = $(successCritLinksWrapper).find("a");

            const linksObj: any = {};
            successCritLinks.each(
              (linkIndex: number, linkEl: CheerioElement) => {
                linksObj[$(linkEl).text()] = $(linkEl).attr("href");
              },
            );

            //Destructive actions to just leave the main content
            $(successCritHeading).remove();
            $(successCritLevel).remove();
            $(successCritLinksWrapper).remove();

            scrapedData["principles"][principleIndex]["guidelines"][
              guidelineIndex
            ][
              "successCriteria"
            ][successCritIndex] = {
              headingText: $(successCritHeading).text(),
              levelText: $(successCritLevel).text(),
              links: linksObj,
              contentMarkup: $(successCrit).html(),
            };
          },
        );
      },
    );
  },
);

// This should probably point to a pinned version of the typings
// @deno-types="https://raw.githubusercontent.com/DefinitelyTyped/DefinitelyTyped/master/types/traverse/index.d.ts"
import traverse from "https://dev.jspm.io/traverse@0.6.6";

const formattedData = JSON.parse(JSON.stringify(scrapedData));

traverse(formattedData).forEach(
  function (this: traverse.TraverseContext, _value: any) {
    if (this?.node?.hasOwnProperty("headingText")) {
      const scrapedHeadingText = this.node.headingText;

      const id = scrapedHeadingText.replace(/[^\d.]+/g, "");

      const name = scrapedHeadingText.split(id)[1].trimStart();

      this.node["id"] = id;
      this.node["name"] = name;

      delete this.node["headingText"];
    }
  },
);

traverse(formattedData).forEach(
  function (this: traverse.TraverseContext, _value: any) {
    if (this?.key?.includes("links")) {
      const linksObj = this.node;

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

      this.update(modifiedLinksObj);
    }
  },
);

traverse(formattedData).forEach(
  function (this: traverse.TraverseContext, _value: any) {
    if (this?.node?.hasOwnProperty("levelText")) {
      const levelText = this.node.levelText;

      const levelCat = levelText.replace(/[^A]+/g, "");

      this.node["level"] = levelCat;
      delete this.node["levelText"];
    }
  },
);

const contentBytes = new TextEncoder().encode(
  JSON.stringify(formattedData, null, 4),
);
const file = await Deno.open("output.json", { write: true, create: true }); // Can this be moved to a dist directory?
await Deno.writeAll(file, contentBytes);
Deno.close(file.rid);
