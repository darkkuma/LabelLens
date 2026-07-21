globalThis.LABELLENS_CATALOG = { popular: [], mfds: [] };
await import("../data/catalog.js");

const { popular, mfds } = globalThis.LABELLENS_CATALOG;
const errors = [];
if (popular.length < 100) errors.push(`popular catalog too small: ${popular.length}`);
if (mfds.length < 2000) errors.push(`MFDS catalog too small: ${mfds.length}`);

const ids = new Set();
for (const product of [...popular, ...mfds]) {
  if (!product.id || !product.name || !product.category) errors.push(`invalid catalog record: ${product.id || "missing-id"}`);
  if (ids.has(product.id)) errors.push(`duplicate catalog id: ${product.id}`);
  ids.add(product.id);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Verified ${popular.length} popular partial records and ${mfds.length} MFDS records.`);
