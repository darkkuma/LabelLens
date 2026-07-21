import { readFile, writeFile } from "node:fs/promises";

globalThis.LABELLENS_PRODUCTS = [];
await import(`../data/products.js?${Date.now()}`);

const popularPath = process.argv[2] || "/tmp/labellens-popular-180.json";
const parsedPath = process.argv[3] || "/tmp/labellens-parsed-180.json";
const mfdsPath = process.argv[4] || "data/mfds-brand-products.csv";

function parseCsvLine(line) {
  const fields = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"' && quoted && line[index + 1] === '"') {
      field += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === "," && !quoted) {
      fields.push(field);
      field = "";
    } else {
      field += character;
    }
  }
  fields.push(field);
  return fields;
}

function parseCsv(value) {
  const lines = value.split(/\r?\n/).filter(Boolean);
  const headers = parseCsvLine(lines.shift());
  return lines.map((line) => Object.fromEntries(headers.map((header, index) => [header, parseCsvLine(line)[index] || ""])));
}

function cleanBrand(originalName, name) {
  return originalName?.match(/^\[([^\]]+)\]/)?.[1] || name.split(" ")[0] || "브랜드 미표시";
}

function numeric(value) {
  const number = Number(String(value || "").replace(/,/g, ""));
  return Number.isFinite(number) ? number : null;
}

const popular = JSON.parse(await readFile(popularPath, "utf8"));
const parsed = JSON.parse(await readFile(parsedPath, "utf8"));
const mfdsRows = parseCsv(await readFile(mfdsPath, "utf8"));
const verifiedRetailerIds = new Set(globalThis.LABELLENS_PRODUCTS.map((product) => product.retailerId).filter(Boolean));
const verifiedReports = new Set(globalThis.LABELLENS_PRODUCTS.map((product) => product.reportNumber).filter(Boolean));
const partialByRetailerId = new Map(
  parsed.rejected.filter((item) => item.product?.retailerId).map((item) => [item.product.retailerId, item.product]),
);

const popularCatalog = popular
  .filter((product) => !verifiedRetailerIds.has(product.retailerId))
  .map((product) => {
    const partial = partialByRetailerId.get(product.retailerId) || {};
    const nutrition = Object.fromEntries(
      Object.entries(partial.nutrition || {}).map(([key, value]) => [key, Number.isFinite(value) ? value : null]),
    );
    return {
      id: `catalog-${product.id}`,
      retailerId: product.retailerId,
      name: product.name,
      brand: cleanBrand(product.originalName, product.name),
      category: product.category,
      retailers: product.retailers,
      imageUrl: product.imageUrl,
      salesPrice: product.salesPrice,
      popularityRank: Math.min(...product.signals.map((signal) => Number(signal.position) || 999)),
      reviewCount: product.signals[0]?.reviewCount || "",
      observedAt: product.observedAt,
      servingSize: partial.servingSize || "",
      reportNumber: partial.reportNumber || "",
      nutrition,
      ingredientText: partial.ingredientText || "",
      origins: partial.origins || [],
      labelUrl: partial.labelUrl || "",
      sourceType: "kurly-popular",
    };
  });

const mfdsCatalog = mfdsRows
  .filter((row) => row.product_name && !verifiedReports.has(row.report_number))
  .map((row) => ({
    id: `catalog-mfds-${row.food_code || row.report_number}`,
    name: row.product_name,
    brand: row.brand_search || "브랜드 미표시",
    maker: row.maker,
    category: row.category_3 || row.category_1 || "가공식품",
    servingSize: row.serving_size,
    reportNumber: row.report_number,
    nutrition: {
      calories: numeric(row.calories),
      protein: numeric(row.protein_g),
      sugar: numeric(row.sugar_g),
      sodium: numeric(row.sodium_mg),
      saturatedFat: numeric(row.saturated_fat_g),
    },
    updatedAt: row.updated_at,
    sourceType: "mfds",
  }));

const payload = { popular: popularCatalog, mfds: mfdsCatalog };
await writeFile("data/catalog.js", `globalThis.LABELLENS_CATALOG = ${JSON.stringify(payload)};\n`);
console.log(JSON.stringify({ verified: verifiedRetailerIds.size, popularPartial: popularCatalog.length, mfds: mfdsCatalog.length, searchableTotal: verifiedRetailerIds.size + popularCatalog.length + mfdsCatalog.length }, null, 2));
