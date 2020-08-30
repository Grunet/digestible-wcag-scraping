// This typing can be switched to an updated version once https://github.com/DefinitelyTyped/DefinitelyTyped/issues/34036 is fixed
// @deno-types="https://raw.githubusercontent.com/DefinitelyTyped/DefinitelyTyped/deab75bde42b5a82aeb951f5a2edaa09922853f4/types/cheerio/index.d.ts"
import cheerio from "https://dev.jspm.io/cheerio@1.0.0-rc.3";
export { cheerio };

// This should probably point to a pinned version of the typings
// @deno-types="https://raw.githubusercontent.com/DefinitelyTyped/DefinitelyTyped/master/types/traverse/index.d.ts"
import traverse from "https://dev.jspm.io/traverse@0.6.6";
export { traverse };

function deepCopyObj(obj: any) {
  return JSON.parse(JSON.stringify(obj)); //This doesn't take into account all subtleties. Replace with a library as needed.
}
export { deepCopyObj };
