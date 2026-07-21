import { readFile, writeFile } from "node:fs/promises";

const endpoint = "https://apis.data.go.kr/1471000/FoodNtrCpntDbInfo02/getFoodNtrCpntDbInq02";
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

const brands = [
  { term: "비비고", matches: (item) => /^(?:비비고|더비비고|bibigo)/i.test(item.FOOD_NM_KR) },
  { term: "햇반", matches: (item) => item.FOOD_NM_KR.includes("햇반") },
  { term: "오뚜기", matches: (item) => item.FOOD_NM_KR.startsWith("오뚜기") || item.MAKER_NM?.includes("오뚜기") },
  { term: "농심", matches: (item) => item.FOOD_NM_KR.startsWith("농심") || item.MAKER_NM?.includes("농심") },
  { term: "삼양", matches: (item) => item.FOOD_NM_KR.startsWith("삼양") || item.MAKER_NM?.includes("삼양식품") },
  { term: "풀무원", matches: (item) => item.FOOD_NM_KR.startsWith("풀무원") || item.MAKER_NM?.includes("풀무원") },
  { term: "피코크", matches: (item) => item.FOOD_NM_KR.startsWith("피코크") },
  { term: "노브랜드", matches: (item) => item.FOOD_NM_KR.startsWith("노브랜드") },
  { term: "동원", matches: (item) => item.FOOD_NM_KR.startsWith("동원") || item.MAKER_NM?.includes("동원") },
  { term: "청정원", matches: (item) => item.FOOD_NM_KR.startsWith("청정원") },
  { term: "하림", matches: (item) => item.FOOD_NM_KR.startsWith("하림") || item.MAKER_NM?.includes("하림") },
  { term: "고메", matches: (item) => item.FOOD_NM_KR.startsWith("고메") },
  { term: "팔도", matches: (item) => item.FOOD_NM_KR.startsWith("팔도") || item.MAKER_NM?.includes("팔도") },
];

async function fetchBrand(brand) {
  const url = new URL(endpoint);
  for (const [key, value] of Object.entries({
    serviceKey: env.DATA_GO_KR_SERVICE_KEY,
    type: "json",
    pageNo: "1",
    numOfRows: "500",
    FOOD_NM_KR: brand.term,
  })) url.searchParams.set(key, value);
  const response = await fetch(url);
  const payload = await response.json();
  if (!response.ok || payload.header?.resultCode !== "00") throw new Error(`${brand.term}: ${payload.header?.resultMsg || response.status}`);
  return (payload.body?.items || [])
    .filter((item) => item.DB_GRP_CM === "P" && item.DB_CLASS_CM === "02" && item.MAKER_NM && brand.matches(item))
    .map((item) => ({ brand: brand.term, ...item }));
}

const collected = [];
for (let index = 0; index < brands.length; index += 4) {
  const batches = await Promise.all(brands.slice(index, index + 4).map(fetchBrand));
  collected.push(...batches.flat());
}

const unique = [...new Map(collected.map((item) => [item.FOOD_CD || `${item.ITEM_REPORT_NO}:${item.FOOD_NM_KR}:${item.MAKER_NM}`, item])).values()]
  .sort((left, right) => left.brand.localeCompare(right.brand, "ko") || left.FOOD_NM_KR.localeCompare(right.FOOD_NM_KR, "ko"));
const fields = [
  ["brand_search", "brand"],
  ["food_code", "FOOD_CD"],
  ["product_name", "FOOD_NM_KR"],
  ["maker", "MAKER_NM"],
  ["category_1", "FOOD_CAT1_NM"],
  ["category_3", "FOOD_CAT3_NM"],
  ["serving_size", "SERVING_SIZE"],
  ["calories", "AMT_NUM1"],
  ["protein_g", "AMT_NUM3"],
  ["sugar_g", "AMT_NUM7"],
  ["sodium_mg", "AMT_NUM13"],
  ["saturated_fat_g", "AMT_NUM24"],
  ["report_number", "ITEM_REPORT_NO"],
  ["updated_at", "UPDATE_DATE"],
];
const escapeCsv = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
const csv = [fields.map(([label]) => escapeCsv(label)).join(",")]
  .concat(unique.map((item) => fields.map(([, key]) => escapeCsv(item[key])).join(",")))
  .join("\n");
await writeFile("data/mfds-brand-products.csv", `${csv}\n`);

const counts = Object.fromEntries(brands.map(({ term }) => [term, unique.filter((item) => item.brand === term).length]));
console.log(JSON.stringify({ total: unique.length, counts, output: "data/mfds-brand-products.csv" }, null, 2));
