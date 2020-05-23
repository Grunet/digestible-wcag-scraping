// This typing can be switched to an updated version once https://github.com/DefinitelyTyped/DefinitelyTyped/issues/34036 is fixed
// @deno-types="https://raw.githubusercontent.com/DefinitelyTyped/DefinitelyTyped/deab75bde42b5a82aeb951f5a2edaa09922853f4/types/cheerio/index.d.ts"
import cheerio from "https://dev.jspm.io/cheerio@1.0.0-rc.3";

async function __getScrapedData(): Promise<IScrapedData> {
  const res = await fetch("https://www.w3.org/TR/2020/WD-WCAG22-20200227/");

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

          scrapedData.principles[principleIndex].guidelines[
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
  contentMarkup: string //should be a string of valid html
  ;
}

interface ILinkUrls {
  [key: string]: string;
}

interface IHeadingText {
  headingText: string;
}

async function getScrapedData(): Promise<IScrapedData> {
  return await __getScrapedData();
}

export { getScrapedData, IScrapedData };
