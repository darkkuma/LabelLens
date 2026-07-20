import { readFile, writeFile } from "node:fs/promises";

const selectedIds = new Set([
  "kurly-5006550",
  "kurly-1000431394",
  "kurly-1000431398",
  "kurly-5000713",
  "kurly-1000235786",
  "kurly-5048683",
  "kurly-1000942460",
  "kurly-5048680",
  "kurly-5145428",
  "kurly-5145429",
  "kurly-5072939",
  "kurly-5041236",
  "kurly-5125377",
  "kurly-1000930289",
  "kurly-1000272652",
  "kurly-1000750271",
  "kurly-5025430",
  "kurly-5011036",
  "kurly-1000347446",
  "kurly-5040516",
  "kurly-5040514",
  "kurly-1001051157",
]);

const corrections = {
  "kurly-5006550": { servingSize: "총 내용량 315g", nutritionBasisGrams: 315 },
  "kurly-1000431394": { servingSize: "총 내용량 450g", nutritionBasisGrams: 450 },
  "kurly-1000431398": { servingSize: "총 내용량 450g", nutritionBasisGrams: 450, nutrition: { sodium: 2739 } },
  "kurly-5000713": { servingSize: "1개 80g", nutritionBasisGrams: 80 },
  "kurly-1000235786": { servingSize: "총 내용량 345g", nutritionBasisGrams: 345 },
  "kurly-5048683": { servingSize: "총 내용량 290g", nutritionBasisGrams: 290 },
  "kurly-1000942460": { servingSize: "1회 섭취 참고량 150g", nutritionBasisGrams: 150 },
  "kurly-5048680": { servingSize: "총 내용량 386g", nutritionBasisGrams: 386 },
  "kurly-5145428": { servingSize: "총 내용량 405g", nutritionBasisGrams: 405 },
  "kurly-5145429": { servingSize: "총 내용량 405g", nutritionBasisGrams: 405 },
  "kurly-5072939": { servingSize: "100g", nutritionBasisGrams: 100 },
  "kurly-5041236": { servingSize: "1개 150g", nutritionBasisGrams: 150 },
  "kurly-5125377": { servingSize: "100g", nutritionBasisGrams: 100 },
  "kurly-1000930289": { servingSize: "1봉 100g", nutritionBasisGrams: 100 },
  "kurly-1000272652": { servingSize: "총 내용량 210g", nutritionBasisGrams: 210, nutrition: { sodium: 1340 } },
  "kurly-1000750271": { servingSize: "총 내용량 150g", nutritionBasisGrams: 150 },
  "kurly-5025430": { servingSize: "1개 80g", nutritionBasisGrams: 80 },
  "kurly-5011036": { servingSize: "1개 80g", nutritionBasisGrams: 80, reportNumber: "20210475029140" },
  "kurly-1000347446": { servingSize: "1개입 210g", nutritionBasisGrams: 210 },
  "kurly-5040516": { servingSize: "100g", nutritionBasisGrams: 100 },
  "kurly-5040514": { servingSize: "100g", nutritionBasisGrams: 100 },
  "kurly-1001051157": { servingSize: "100g", nutritionBasisGrams: 100 },
};

function inferBasis(servingSize) {
  const match = String(servingSize).match(/([\d.]+)\s*g/i);
  return match ? Number(match[1]) : null;
}

function trimIngredients(value) {
  const normalized = value.replace(/\s+/g, " ").trim();
  const allergenEnd = normalized.indexOf(" 함유");
  return allergenEnd >= 0 ? normalized.slice(0, allergenEnd + 3) : normalized;
}

globalThis.LABELLENS_PRODUCTS = [];
await import(`../data/products.js?${Date.now()}`);
const existing = globalThis.LABELLENS_PRODUCTS.map((product) => ({
  ...product,
  nutritionBasisGrams: product.nutritionBasisGrams || inferBasis(product.servingSize),
}));
const parsed = JSON.parse(await readFile(process.argv[2] || "/tmp/labellens-parsed-products.json", "utf8"));
const additions = parsed.accepted
  .filter((product) => selectedIds.has(product.id))
  .map((product) => {
    const correction = corrections[product.id] || {};
    const reportNumber = correction.reportNumber || product.reportNumber;
    return {
      ...product,
      ...correction,
      nutrition: { ...product.nutrition, ...correction.nutrition },
      ingredientText: trimIngredients(product.ingredientText),
      reportNumber,
      sources: [`컬리 상품 라벨 이미지 (${product.observedAt})`, `품목보고번호: ${reportNumber}`, product.labelUrl],
    };
  });

const merged = [...existing];
for (const product of additions) {
  const index = merged.findIndex((item) => item.retailerId === product.retailerId || item.id === product.id);
  if (index >= 0) merged[index] = product;
  else merged.push(product);
}

const output = `globalThis.LABELLENS_PRODUCTS = ${JSON.stringify(merged, null, 2)};\n`;
await writeFile("data/products.js", output);
console.log(JSON.stringify({ existing: existing.length, added: additions.length, total: merged.length }, null, 2));
