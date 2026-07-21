import { readFile, writeFile } from "node:fs/promises";

globalThis.LABELLENS_PRODUCTS = [];
await import(`../data/products.js?${Date.now()}`);

const deniedRetailerIds = new Set(["1000068973", "5048681", "5119349"]);
const existing = globalThis.LABELLENS_PRODUCTS.filter((product) => !deniedRetailerIds.has(product.retailerId));
const completePayload = JSON.parse(await readFile(process.argv[2] || "/tmp/labellens-complete-products.json", "utf8"));
const parsed = JSON.parse(await readFile(process.argv[3] || "/tmp/labellens-parsed-180.json", "utf8"));
const curated = {
  "kurly-5118043": {
    servingSize: "1컵 150g",
    nutritionBasisGrams: 150,
    ingredientText: "대두(국내산) 100%, 혼합제제(조제해수염화마그네슘, 현미유)",
    origins: [{ ingredient: "대두", origin: "국내산", weight: "100%" }],
  },
  "kurly-5113095": { servingSize: "총 내용량 400g", nutritionBasisGrams: 400 },
  "kurly-5069882": { servingSize: "100g", nutritionBasisGrams: 100 },
  "kurly-5137220": {
    servingSize: "100g",
    nutritionBasisGrams: 100,
    reportNumber: "19980476002-1723",
    ingredientText: "닭고기(국내산) 61.34%, 정제수, 기타가공품1(밀가루(밀: 미국산), 옥수수전분(옥수수: 외국산), 스파이스베이스-2, 미분, 정제소금), 하이멜트치즈(자연치즈(체다치즈: 외국산), 팜유(말레이시아산), 카제인나트륨, 감자전분가공품, 산도조절제), 기타가공품2, 식물성유지, 대두단백, 자연치즈(미국산), 치즈파우더, 정제소금, 혼합제제(폴리인산나트륨, 피로인산나트륨, 산성피로인산나트륨), 설탕, 복합조미식품, 향류가공품",
    origins: [
      { ingredient: "닭고기", origin: "국내산", weight: "61.34%" },
      { ingredient: "밀", origin: "미국산", weight: "표시 원료" },
      { ingredient: "옥수수", origin: "외국산", weight: "표시 원료" },
      { ingredient: "체다치즈", origin: "외국산", weight: "표시 원료" },
      { ingredient: "팜유", origin: "말레이시아산", weight: "표시 원료" },
      { ingredient: "자연치즈", origin: "미국산", weight: "표시 원료" },
    ],
  },
  "kurly-1000942462": { servingSize: "1회 섭취 참고량 150g", nutritionBasisGrams: 150 },
  "kurly-5136105": { servingSize: "100g", nutritionBasisGrams: 100 },
  "kurly-5145473": { servingSize: "100g", nutritionBasisGrams: 100 },
};

function cleanIngredientText(value) {
  const normalized = String(value || "").replace(/\s+/g, " ").replace(/^[_.,\s]+/, "").trim();
  const allergenEnd = normalized.indexOf(" 함유");
  return allergenEnd >= 0 ? normalized.slice(0, allergenEnd + 3) : normalized;
}

function withSources(product) {
  const reportNumber = product.reportNumber;
  return {
    ...product,
    ingredientText: cleanIngredientText(product.ingredientText),
    sources: product.sources || [
      `컬리 상품 라벨 이미지 (${product.observedAt})`,
      `품목보고번호: ${reportNumber}`,
      product.labelUrl,
    ],
  };
}

const additions = completePayload.complete.filter((product) => !deniedRetailerIds.has(product.retailerId)).map(withSources);
for (const product of parsed.accepted) {
  const correction = curated[product.id];
  if (!correction) continue;
  additions.push(withSources({ ...product, ...correction }));
}

const merged = [...existing];
for (const product of additions) {
  const index = merged.findIndex((item) => item.retailerId === product.retailerId || item.id === product.id);
  if (index < 0) merged.push(product);
}

const output = `globalThis.LABELLENS_PRODUCTS = ${JSON.stringify(merged, null, 2)};\n`;
await writeFile("data/products.js", output);
console.log(JSON.stringify({ existing: existing.length, candidates: additions.length, total: merged.length }, null, 2));
