import { readFile, writeFile } from "node:fs/promises";

const endpoint = "https://apis.data.go.kr/1471000/FoodNtrCpntDbInfo02/getFoodNtrCpntDbInq02";
const parsedPath = process.argv[2] || "/tmp/labellens-parsed-180.json";
const outputPath = process.argv[3] || "/tmp/labellens-mfds-ocr-matches.json";
const env = Object.fromEntries(
  (await readFile(".env.local", "utf8"))
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const index = line.indexOf("=");
      return [line.slice(0, index), line.slice(index + 1).replace(/^['"]|['"]$/g, "")];
    }),
);
if (!env.DATA_GO_KR_SERVICE_KEY) throw new Error("DATA_GO_KR_SERVICE_KEY is not configured");

const parsed = JSON.parse(await readFile(parsedPath, "utf8"));
const records = [...parsed.accepted, ...parsed.rejected].filter((record) => {
  const product = record.product;
  return product && !record.reasons?.includes("multi-sku") && !record.reasons?.includes("no-label-image") && product.ingredientText?.length >= 25 && product.origins?.length;
});

function normalize(value) {
  return String(value || "").toLowerCase().replace(/\d+(?:[.,]\d+)?\s*(?:kg|g|ml|l|입|개입|개|팩|봉)/gi, " ").replace(/[^a-z0-9가-힣]/g, "");
}

function reportTokens(value) {
  return String(value || "").split(/\s*\/\s*/).map((item) => item.replace(/[^a-zA-Z0-9]/g, "")).filter(Boolean);
}

function variants(product) {
  const withoutPack = product.name.replace(/\([^)]*\)/g, " ").replace(/\d+(?:[.,]\d+)?\s*(?:kg|g|ml|l|입|개입|개|팩|봉)/gi, " ").replace(/x\s*\d+/gi, " ").replace(/\s+/g, " ").trim();
  const brandPattern = new RegExp(`^${String(product.brand || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*`, "i");
  const withoutBrand = withoutPack.replace(brandPattern, "").trim();
  const tokens = withoutBrand.split(/\s+/).filter((token) => token.length >= 2);
  const compact = tokens.length >= 2 ? tokens.slice(-3).join(" ") : "";
  return [...new Set([withoutBrand, withoutPack, compact].filter((value) => value.length >= 2))];
}

async function search(query) {
  const url = new URL(endpoint);
  for (const [key, value] of Object.entries({ serviceKey: env.DATA_GO_KR_SERVICE_KEY, type: "json", pageNo: "1", numOfRows: "30", FOOD_NM_KR: query })) {
    url.searchParams.set(key, value);
  }
  const response = await fetch(url);
  const payload = await response.json();
  if (!response.ok || payload.header?.resultCode !== "00") return [];
  return Array.isArray(payload.body?.items) ? payload.body.items : [];
}

async function lookup(product) {
  const seen = new Map();
  for (const query of variants(product)) {
    for (const item of await search(query)) seen.set(item.FOOD_CD || `${item.ITEM_REPORT_NO}:${item.FOOD_NM_KR}`, item);
    if (seen.size) break;
  }
  const reports = reportTokens(product.reportNumber);
  const candidates = [...seen.values()];
  const byReport = candidates.find((item) => reports.includes(String(item.ITEM_REPORT_NO || "").replace(/[^a-zA-Z0-9]/g, "")));
  if (byReport) return byReport;
  const target = normalize(product.name);
  return candidates.find((item) => {
    const candidate = normalize(item.FOOD_NM_KR);
    return target === candidate || (Math.min(target.length, candidate.length) >= 7 && (target.includes(candidate) || candidate.includes(target)));
  }) || null;
}

const matches = {};
let cursor = 0;
async function worker() {
  while (cursor < records.length) {
    const index = cursor++;
    const product = records[index].product;
    const match = await lookup(product);
    if (match) matches[product.id] = match;
    console.error(`[${index + 1}/${records.length}] ${product.name}: ${match ? match.FOOD_NM_KR : "none"}`);
  }
}

await Promise.all(Array.from({ length: 4 }, worker));
await writeFile(outputPath, JSON.stringify(matches, null, 2));
console.log(JSON.stringify({ outputPath, candidates: records.length, matched: Object.keys(matches).length }, null, 2));
