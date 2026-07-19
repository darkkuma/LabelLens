await import("../data/products.js");

const products = globalThis.LABELLENS_PRODUCTS || [];
const requiredTextFields = [
  "id",
  "name",
  "brand",
  "category",
  "type",
  "servingSize",
  "reportNumber",
  "ingredientText",
  "labelUrl",
];
const requiredNutritionFields = ["calories", "sodium", "sugar", "saturatedFat", "protein"];
const errors = [];

if (!products.length) errors.push("product database is empty");

for (const product of products) {
  for (const field of requiredTextFields) {
    if (typeof product[field] !== "string" || !product[field].trim()) errors.push(`${product.id || "unknown"}: missing ${field}`);
  }
  for (const field of requiredNutritionFields) {
    if (!Number.isFinite(product.nutrition?.[field]) || product.nutrition[field] < 0) errors.push(`${product.id}: invalid nutrition.${field}`);
  }
  if (!Array.isArray(product.origins) || !product.origins.length) errors.push(`${product.id}: missing origins`);
  if (!Array.isArray(product.retailers) || !product.retailers.length) errors.push(`${product.id}: missing retailers`);
  if (!Array.isArray(product.sources) || product.sources.some((source) => !source)) errors.push(`${product.id}: invalid sources`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Verified ${products.length} complete product records.`);
