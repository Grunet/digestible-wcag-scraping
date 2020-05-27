async function __saveFormattedData(formattedData: any) {
  const content = JSON.stringify(formattedData, null, 4);

  Deno.mkdir("dist", { recursive: true });
  await Deno.writeTextFile("./dist/output.json", content);
}

async function saveFormattedData(formattedData: any) {
  await __saveFormattedData(formattedData);
}

export { saveFormattedData };
