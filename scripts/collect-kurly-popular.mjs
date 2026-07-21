import { writeFile } from "node:fs/promises";

const categories = [
  ["두부·콩가공품", "두부"],
  ["밀키트", "밀키트"],
  ["냉동만두", "냉동만두"],
  ["라면", "라면"],
  ["즉석밥", "즉석밥"],
  ["국·탕·찌개", "국 탕 찌개"],
  ["햄·소시지", "햄 소시지"],
  ["냉동 간편식", "냉동 간편식"],
  ["치킨너겟", "치킨너겟"],
  ["피자", "냉동 피자"],
  ["돈가스", "돈까스"],
  ["떡볶이", "떡볶이"],
  ["카레·짜장", "카레 짜장"],
  ["죽·스프", "죽 스프"],
  ["핫도그", "핫도그"],
  ["볶음밥", "볶음밥"],
  ["파스타", "파스타"],
  ["어묵", "어묵"],
];

const headers = {
  Accept: "application/json",
  Origin: "https://www.kurly.com",
  Referer: "https://www.kurly.com/",
  "X-Kurly-Session-Id": crypto.randomUUID(),
};
const products = new Map();

async function fetchWithRetry(url, attempts = 4) {
  let response;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    response = await fetch(url, { headers });
    if (response.ok) return response;
    if (![403, 429, 500, 502, 503].includes(response.status)) return response;
    await new Promise((resolve) => setTimeout(resolve, attempt * 1800));
  }
  return response;
}

for (const [category, keyword] of categories) {
  const url = `https://api.kurly.com/search/v4/sites/market/normal-search?keyword=${encodeURIComponent(keyword)}&page=1`;
  const response = await fetchWithRetry(url);
  if (!response.ok) throw new Error(`${keyword}: HTTP ${response.status}`);
  const payload = await response.json();
  const section = payload.data?.listSections?.find((item) => item.view?.sectionCode === "PRODUCT_LIST");
  const items = (section?.data?.items || []).filter((item) => !item.adInfo).slice(0, 10);
  for (const item of items) {
    const existing = products.get(String(item.no));
    const signal = { category, keyword, position: item.position, reviewCount: item.reviewCount };
    if (existing) {
      existing.signals.push(signal);
      continue;
    }
    products.set(String(item.no), {
      id: `kurly-${item.no}`,
      retailerId: String(item.no),
      name: item.name.replace(/^\[([^\]]+)\]\s*/, "$1 ").trim(),
      originalName: item.name,
      category,
      retailers: ["컬리"],
      imageUrl: item.listImageUrl,
      salesPrice: item.salesPrice,
      signals: [signal],
      observedAt: new Date().toISOString().slice(0, 10),
    });
  }
  console.error(`${category}: ${items.length}`);
  await new Promise((resolve) => setTimeout(resolve, 700));
}

const outputPath = process.argv[2] || "/tmp/labellens-kurly-popular.json";
const output = [...products.values()];
await writeFile(outputPath, JSON.stringify(output, null, 2));
console.log(JSON.stringify({ outputPath, categories: categories.length, uniqueProducts: output.length }, null, 2));
