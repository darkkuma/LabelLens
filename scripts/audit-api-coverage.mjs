import { execFileSync } from "node:child_process";
import { writeFile } from "node:fs/promises";
import vm from "node:vm";

const API_BASE_URL = process.env.LABELLENS_API_BASE_URL || "https://labellens-api.rickykang178.chatgpt.site";
const catalogSource = execFileSync("git", ["show", "4ee7894:data/catalog.js"], { encoding: "utf8" });
const context = { globalThis: {} };
vm.runInNewContext(catalogSource, context);
const products = context.globalThis.LABELLENS_CATALOG;

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/\b\d+(?:[.,]\d+)?\s*(?:kg|g|ml|l|입|개입|개|인분)\b/gi, " ")
    .replace(/\bx\s*\d+\b/gi, " ")
    .replace(/[^a-z0-9가-힣]/g, "");
}

function variants(product) {
  const withoutPack = product.name
    .replace(/\([^)]*\)/g, " ")
    .replace(/\d+(?:[.,]\d+)?\s*(?:kg|g|ml|l|입|개입|개|인분)/gi, " ")
    .replace(/\bx\s*\d+\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  const withoutBrand = withoutPack.replace(new RegExp(`^${product.brand.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*`, "i"), "").trim();
  return [...new Set([product.name, withoutPack, withoutBrand].filter((value) => value.length >= 2))];
}

function classify(product, candidate) {
  const target = normalize(product.name);
  const result = normalize(candidate.name);
  const brand = normalize(product.brand);
  const maker = normalize(candidate.maker);
  if (!result) return "none";
  if (target === result || (target.includes(result) || result.includes(target)) && Math.min(target.length, result.length) >= 5) return "exact";
  const nameTokens = product.name.replace(/\([^)]*\)/g, " ").split(/\s+/).map(normalize).filter((token) => token.length >= 2 && !/^\d/.test(token));
  const overlap = nameTokens.filter((token) => result.includes(token)).length;
  const brandMatches = brand && (result.includes(brand) || maker.includes(brand));
  return overlap >= Math.max(1, Math.ceil(nameTokens.length * 0.6)) && brandMatches ? "similar" : "none";
}

async function lookup(product) {
  const seen = new Map();
  for (const query of variants(product)) {
    const response = await fetch(`${API_BASE_URL}/api/nutrition?q=${encodeURIComponent(query)}`);
    if (!response.ok) continue;
    const payload = await response.json();
    for (const item of payload.items || []) seen.set(item.foodCode || `${item.name}:${item.maker}`, item);
  }
  const candidates = [...seen.values()].map((item) => ({ ...item, match: classify(product, item) }));
  const best = candidates.find((item) => item.match === "exact") || candidates.find((item) => item.match === "similar");
  return { product, status: best?.match || "none", match: best || null, candidateCount: candidates.length };
}

const results = [];
let cursor = 0;
async function worker() {
  while (cursor < products.length) {
    const index = cursor++;
    const result = await lookup(products[index]);
    results[index] = result;
    console.error(`[${index + 1}/${products.length}] ${products[index].name}: ${result.status}`);
  }
}

await Promise.all(Array.from({ length: 5 }, worker));
const summary = Object.groupBy(results, (result) => result.status);
const report = {
  measuredAt: new Date().toISOString(),
  total: results.length,
  counts: Object.fromEntries(Object.entries(summary).map(([key, values]) => [key, values.length])),
  byRetailer: Object.fromEntries(
    ["컬리", "이마트", "쿠팡"].map((retailer) => {
      const subset = results.filter((result) => result.product.retailers.includes(retailer));
      return [retailer, { total: subset.length, exact: subset.filter((result) => result.status === "exact").length, similar: subset.filter((result) => result.status === "similar").length }];
    }),
  ),
  results,
};
const outputPath = process.argv[2] || "/tmp/labellens-api-coverage.json";
await writeFile(outputPath, JSON.stringify(report, null, 2));
console.log(JSON.stringify({ outputPath, total: report.total, counts: report.counts, byRetailer: report.byRetailer }, null, 2));
