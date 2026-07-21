await import("../data/additives.js");

const additives = globalThis.LABELLENS_ADDITIVES || [];
const validFlags = new Set(["regulatory", "frequency", "specific", "info"]);
const ids = new Set();
const errors = [];

if (!additives.length) errors.push("additive database is empty");

for (const item of additives) {
  for (const field of ["id", "name", "english", "purpose", "flagLabel", "summary", "forWhom", "evidence"]) {
    if (typeof item[field] !== "string" || !item[field].trim()) errors.push(`${item.id || "unknown"}: missing ${field}`);
  }
  if (ids.has(item.id)) errors.push(`${item.id}: duplicate id`);
  ids.add(item.id);
  if (!validFlags.has(item.flag)) errors.push(`${item.id}: invalid flag`);
  if ((!Array.isArray(item.aliases) || !item.aliases.length) && (!Array.isArray(item.matchAll) || !item.matchAll.length)) {
    errors.push(`${item.id}: missing matcher`);
  }
  if (!Array.isArray(item.sources) || !item.sources.length) errors.push(`${item.id}: missing sources`);
  for (const source of item.sources || []) {
    if (!source.label || !/^https:\/\//.test(source.url || "")) errors.push(`${item.id}: invalid source`);
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Verified ${additives.length} additive profiles.`);
