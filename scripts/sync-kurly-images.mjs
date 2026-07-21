import { writeFile } from "node:fs/promises";

await import("../data/products.js");

const products = (globalThis.LABELLENS_PRODUCTS || []).filter((product) => product.retailerId);
const headers = {
  Accept: "application/json",
  Origin: "https://www.kurly.com",
  Referer: "https://www.kurly.com/",
  "X-Kurly-Session-Id": "1",
};
const images = {};

for (const [index, product] of products.entries()) {
  const response = await fetch(`https://api.kurly.com/showroom/v2/products/${product.retailerId}`, { headers });
  if (!response.ok) {
    console.error(`[${index + 1}/${products.length}] ${product.name}: HTTP ${response.status}`);
    continue;
  }
  const detail = (await response.json()).data;
  const imageUrl = detail?.product_vertical_small_url || detail?.main_image_url || detail?.original_image_url;
  if (imageUrl) images[product.id] = imageUrl;
  console.error(`[${index + 1}/${products.length}] ${product.name}: ${imageUrl ? "ok" : "missing"}`);
  await new Promise((resolve) => setTimeout(resolve, 80));
}

const output = `globalThis.LABELLENS_PRODUCT_IMAGES = ${JSON.stringify(images, null, 2)};\n`;
await writeFile(new URL("../data/product-images.js", import.meta.url), output);
console.log(`Saved ${Object.keys(images).length}/${products.length} product images.`);
