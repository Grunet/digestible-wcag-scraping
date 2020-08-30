async function saveData(path: string, data: any) {
  const content = JSON.stringify(data, null, 4);

  await Deno.mkdir(path, { recursive: true });

  await Deno.writeTextFile(`${path}/wcag22.json`, content);
}

export { saveData };
