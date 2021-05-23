interface IScrapedData {
  principles: IPrincipleData[];
}

interface IPrincipleData extends IHeadingText {
  paraText: string;
  guidelines: IGuidelineData[];
}

interface IGuidelineData extends IHeadingText {
  paraText: string;
  successCriteria: ISuccessCriterionData[];
}

interface ISuccessCriterionData extends IHeadingText {
  levelText: string;
  links: ILinkUrls;
  contentMarkup: string; //should be a string of valid html
}

interface ILinkUrls {
  [key: string]: string;
}

interface IHeadingText {
  headingText: string;
}

import { cheerio } from "../deps.ts";

async function getScrapedData(): Promise<IScrapedData> {
  const res = await fetch("https://www.w3.org/TR/2021/WD-WCAG22-20210521/");

  const resBody = new TextDecoder("utf-8").decode(
    new Uint8Array(await res.arrayBuffer()),
  );

  let $ = cheerio.load(resBody);

  const scrapedData: IScrapedData = {
    principles: [],
  };

  const principleSections = $(".principle");
  principleSections.each(
    (principleIndex: number, principleSection: CheerioElement) => {
      const principleSectionHeading = $(principleSection).find("h2")[0];

      const principleParagraph = $(principleSection).find("p")[0];

      scrapedData.principles[principleIndex] = {
        headingText: $(principleSectionHeading).text(),
        paraText: $(principleParagraph).text(),
        guidelines: [],
      };

      const guidelineSections = $(principleSection).find(".guideline");
      guidelineSections.each(
        (guidelineIndex: number, guidelineSection: CheerioElement) => {
          const guidelineSectionHeading = $(guidelineSection).find("h3")[0];

          const guidelineSectionParagraph = $(guidelineSection).find("p")[0];

          scrapedData.principles[principleIndex].guidelines[guidelineIndex] = {
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

              const successCritLinksWrapper =
                $(successCrit).find(".doclinks")[0];
              const successCritLinks = $(successCritLinksWrapper).find("a");

              const linksObj: ILinkUrls = {};
              successCritLinks.each(
                (linkIndex: number, linkEl: CheerioElement) => {
                  linksObj[$(linkEl).text()] = $(linkEl).attr("href");
                },
              );

              //Destructive actions to just leave the main content
              $(successCritHeading).remove();
              $(successCritLevel).remove();
              $(successCritLinksWrapper).remove();

              $(successCrit).find(".note").remove();

              scrapedData.principles[principleIndex].guidelines[
                guidelineIndex
              ].successCriteria[successCritIndex] = {
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

  return scrapedData;
}

export { getScrapedData };
export type { IScrapedData };
