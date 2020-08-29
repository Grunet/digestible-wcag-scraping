async function saveFormattedData(path: string, formattedData: any) {
  const content = JSON.stringify(formattedData, null, 4);

  await Deno.mkdir(path, { recursive: true });

  await Deno.writeTextFile(`${path}/wcag22.json`, content);
}

export { saveFormattedData };
