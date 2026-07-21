import { readFile, writeFile } from "node:fs/promises";

const inputPath = process.argv[2] || "/tmp/labellens-popular-labels/ocr-results.json";
const outputPath = process.argv[3] || "/tmp/labellens-parsed-products.json";
const records = JSON.parse(await readFile(inputPath, "utf8"));

function numberFrom(text, pattern) {
  const match = text.match(pattern);
  if (!match) return null;
  const value = Number(match[1].replace(/,/g, ""));
  return Number.isFinite(value) ? value : null;
}

function cleanName(value) {
  return value.replace(/^\[([^\]]+)\]\s*/, "$1 ").replace(/\s+/g, " ").trim();
}

function extractIngredientText(lines) {
  const start = lines.findIndex((line) => /원재료명|원료명/.test(line));
  if (start < 0) return "";
  const collected = [];
  for (let index = start; index < Math.min(lines.length, start + 18); index += 1) {
    const line = lines[index].replace(/^.*?(?:원재료명(?:\s*및\s*함량)?|원료명)\s*[:|]?\s*/, "").trim();
    if (index > start && /^(?:영양정보|품목보고번호|제조원|제조업소|소비기한|보관방법|포장재질|반품|주의사항)/.test(line)) break;
    if (line) collected.push(line);
    if (/\b함유\b/.test(line) && collected.join(" ").length > 30) break;
  }
  return collected.join(" ").replace(/\s+/g, " ").trim();
}

function extractOrigins(ingredientText) {
  const origins = [];
  const pattern = /([가-힣A-Za-z][가-힣A-Za-z\s]{0,14}?)\s*[({][^)}]{0,30}?(국내산|국산|중국산|미국산|호주산|캐나다산|외국산|수입산|말레이시아산|스페인산|덴마크산|독일산|영국산|네덜란드산)[^)}]*[)}]/g;
  for (const match of ingredientText.matchAll(pattern)) {
    const ingredient = match[1].replace(/^.*[,.:]/, "").trim();
    if (!ingredient || origins.some((item) => item.ingredient === ingredient && item.origin === match[2])) continue;
    origins.push({ ingredient, origin: match[2], weight: "표시 원료" });
  }
  return origins.slice(0, 8);
}

function parseRecord(record) {
  const reasons = [];
  if (record.status !== "ocr-complete") return { status: "rejected", reasons: [record.status] };
  if (/(?:\d+종|택\s*\d|택1|택2|골라담기|모음|세트)/.test(record.product.name)) reasons.push("multi-sku");

  const lines = record.labels.flatMap((label) => (label.observations || []).map((item) => item.text.trim()).filter(Boolean));
  const nutritionStart = lines.findIndex((line) => /영양정보|영양성분/.test(line));
  const nutritionLines = nutritionStart >= 0 ? lines.slice(nutritionStart, nutritionStart + 35) : lines;
  const nutritionText = nutritionLines.join(" ");
  const kcalMatches = [...nutritionText.matchAll(/([\d,.]+)\s*kcal/gi)]
    .map((match) => ({ value: Number(match[1].replace(/,/g, "")), index: match.index }))
    .filter((item) => item.value > 0 && item.value < 1500 && item.value !== 2000);
  const nutrition = {
    calories: kcalMatches[0]?.value ?? null,
    sodium: numberFrom(nutritionText, /나트륨\s*([\d,.]+)\s*mg/i),
    sugar: numberFrom(nutritionText, /당류\s*([\d,.]+)\s*g/i),
    saturatedFat: numberFrom(nutritionText, /포화지방\s*([\d,.]+)\s*g/i),
    protein: numberFrom(nutritionText, /단백질\s*([\d,.]+)\s*g/i),
  };
  const ranges = { calories: [1, 1499], sodium: [0, 9999], sugar: [0, 199], saturatedFat: [0, 99], protein: [0, 199] };
  for (const [field, value] of Object.entries(nutrition)) {
    const [minimum, maximum] = ranges[field];
    if (value === null || value < minimum || value > maximum) reasons.push(`nutrition.${field}`);
  }

  const ingredientText = extractIngredientText(lines);
  if (ingredientText.length < 25 || !ingredientText.includes(",")) reasons.push("ingredientText");
  const origins = extractOrigins(ingredientText);
  if (!origins.length) reasons.push("origins");
  const reportMatches = [...lines.join(" ").matchAll(/(?:품목보고번호|보고번호)[^\d]{0,15}([\d-]{11,20})/g)].map((match) => match[1]);
  const reportNumber = [...new Set(reportMatches)].join(" / ");
  if (!reportNumber) reasons.push("reportNumber");
  const servingLine = nutritionLines.find((line) => /(?:당|총\s*내용량).*(?:g|ml|kcal)/i.test(line)) || "표시 기준량";
  const labelUrl = record.labels.find((label) => label.observations)?.imageUrl || "";
  if (!labelUrl) reasons.push("labelUrl");

  const brandMatch = record.product.originalName?.match(/^\[([^\]]+)\]/);
  const product = {
    id: record.product.id,
    name: cleanName(record.product.originalName || record.product.name),
    brand: brandMatch?.[1] || cleanName(record.product.name).split(" ")[0],
    category: record.product.category,
    type: record.product.category,
    retailerId: record.product.retailerId,
    retailers: ["컬리"],
    servingSize: servingLine,
    reportNumber,
    nutrition,
    ingredientText,
    origins,
    labelUrl,
    observedAt: record.product.observedAt,
  };
  return reasons.length ? { status: "rejected", reasons, product } : { status: "accepted", product };
}

const parsed = records.map(parseRecord);
const accepted = parsed.filter((item) => item.status === "accepted").map((item) => item.product);
const rejected = parsed.filter((item) => item.status === "rejected");
const rejectionCounts = {};
for (const item of rejected) for (const reason of item.reasons) rejectionCounts[reason] = (rejectionCounts[reason] || 0) + 1;
const output = { accepted, rejected, summary: { total: records.length, accepted: accepted.length, rejected: rejected.length, rejectionCounts } };
await writeFile(outputPath, JSON.stringify(output, null, 2));
console.log(JSON.stringify({ outputPath, ...output.summary }, null, 2));
