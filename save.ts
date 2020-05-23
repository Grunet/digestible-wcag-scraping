async function __saveFormattedData(formattedData: any) {
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
}

async function saveFormattedData(formattedData: any) {
  await __saveFormattedData(formattedData);
}

export { saveFormattedData };
