import { readFile, writeFile } from "node:fs/promises";

const parsedPath = process.argv[2] || "/tmp/labellens-parsed-180.json";
const outputPath = process.argv[3] || "/tmp/labellens-complete-products.json";
const apiMatchesPath = process.argv[4] || "/tmp/labellens-mfds-ocr-matches.json";
const parsed = JSON.parse(await readFile(parsedPath, "utf8"));
const apiMatches = JSON.parse(await readFile(apiMatchesPath, "utf8").catch(() => "{}"));
const csv = await readFile("data/mfds-brand-products.csv", "utf8");

function csvRow(line) {
  return [...line.matchAll(/"((?:[^"]|"")*)"(?:,|$)/g)].map((match) => match[1].replaceAll('""', '"'));
}

const [headerLine, ...dataLines] = csv.trim().split(/\r?\n/);
const headers = csvRow(headerLine);
const mfds = dataLines.map((line) => Object.fromEntries(headers.map((header, index) => [header, csvRow(line)[index] || ""])));

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\([^)]*(?:택|종|개입)[^)]*\)/g, " ")
    .replace(/\d+(?:[.,]\d+)?\s*(?:kg|g|ml|l|입|개입|개|팩|봉)/gi, " ")
    .replace(/x\s*\d+/gi, " ")
    .replace(/[^a-z0-9가-힣]/g, "");
}

function reportTokens(value) {
  return String(value || "").split(/\s*\/\s*/).map((item) => item.replace(/[^a-zA-Z0-9]/g, "")).filter(Boolean);
}

function findMfds(product) {
  if (apiMatches[product.id]) {
    const item = apiMatches[product.id];
    return {
      product_name: item.FOOD_NM_KR,
      serving_size: item.SERVING_SIZE,
      calories: item.AMT_NUM1,
      protein_g: item.AMT_NUM3,
      sugar_g: item.AMT_NUM7,
      sodium_mg: item.AMT_NUM13,
      saturated_fat_g: item.AMT_NUM24,
      report_number: item.ITEM_REPORT_NO,
      updated_at: item.UPDATE_DATE || item.RESEARCH_YMD || "최근 조회",
    };
  }
  const reports = reportTokens(product.reportNumber);
  const byReport = mfds.find((item) => reports.includes(item.report_number.replace(/[^a-zA-Z0-9]/g, "")));
  if (byReport) return byReport;
  const target = normalize(product.name);
  return mfds.find((item) => {
    const candidate = normalize(item.product_name);
    return target === candidate || (Math.min(target.length, candidate.length) >= 7 && (target.includes(candidate) || candidate.includes(target)));
  });
}

function number(value) {
  const parsedValue = Number(String(value || "").replaceAll(",", ""));
  return Number.isFinite(parsedValue) ? parsedValue : null;
}

function cleanIngredientText(value) {
  return String(value || "").replace(/\s+/g, " ").replace(/^[_.,\s]+/, "").trim();
}

function ingredientLooksUsable(value) {
  const text = cleanIngredientText(value);
  const noise = /(?:반품|교환장소|공정거래위원회|고객센터|보관상의 주의|유통 중 포장|영양정보)/;
  return text.length >= 45 && (text.match(/,/g) || []).length >= 2 && !noise.test(text.slice(0, 180));
}

const records = [...parsed.accepted, ...parsed.rejected]
  .filter((item) => item.product && !item.reasons?.includes("multi-sku") && !item.reasons?.includes("no-label-image"));
const complete = [];
const rejected = [];

for (const record of records) {
  const product = record.product;
  const nutritionRecord = findMfds(product);
  const nutrition = nutritionRecord && {
    calories: number(nutritionRecord.calories),
    sodium: number(nutritionRecord.sodium_mg),
    sugar: number(nutritionRecord.sugar_g),
    saturatedFat: number(nutritionRecord.saturated_fat_g),
    protein: number(nutritionRecord.protein_g),
  };
  const reasons = [];
  if (!nutritionRecord || Object.values(nutrition || {}).some((value) => value === null)) reasons.push("mfdsNutrition");
  if (!ingredientLooksUsable(product.ingredientText)) reasons.push("ingredientText");
  if (!product.origins?.length) reasons.push("origins");
  if (!product.labelUrl) reasons.push("labelUrl");
  if (reasons.length) {
    rejected.push({ name: product.name, category: product.category, reasons });
    continue;
  }
  const basis = number(String(nutritionRecord.serving_size).match(/[\d,.]+/)?.[0]) || 100;
  complete.push({
    ...product,
    servingSize: nutritionRecord.serving_size || "100g",
    reportNumber: nutritionRecord.report_number,
    nutrition,
    ingredientText: cleanIngredientText(product.ingredientText),
    nutritionBasisGrams: basis,
    sources: [
      `컬리 상품 라벨 이미지 (${product.observedAt})`,
      `식약처 식품영양성분DB (${nutritionRecord.updated_at})`,
      `품목보고번호: ${nutritionRecord.report_number}`,
      product.labelUrl,
    ],
  });
}

await writeFile(outputPath, JSON.stringify({ complete, rejected }, null, 2));
console.log(JSON.stringify({ outputPath, complete: complete.length, rejected: rejected.length }, null, 2));
