import { mkdir, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";

await import("../data/catalog.js");

const catalog = globalThis.LABELLENS_CATALOG.filter((product) => product.retailerId);
const outputDirectory = process.argv[2] || "/tmp/labellens-labels";
const ocrBinary = process.argv[3] || "/tmp/labellens-ocr";
const resultPath = path.join(outputDirectory, "ocr-results.json");

await mkdir(outputDirectory, { recursive: true });

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => (stdout += chunk));
    child.stderr.on("data", (chunk) => (stderr += chunk));
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve(stdout);
      else reject(new Error(`${command} exited ${code}: ${stderr}`));
    });
  });
}

const results = [];
for (const [index, product] of catalog.entries()) {
  const detailUrl = `https://api.kurly.com/showroom/v2/products/${product.retailerId}`;
  const response = await fetch(detailUrl, {
    headers: {
      Accept: "application/json",
      Origin: "https://www.kurly.com",
      Referer: "https://www.kurly.com/",
      "X-Kurly-Session-Id": "1",
    },
  });

  if (!response.ok) {
    results.push({ product, status: "detail-error", httpStatus: response.status });
    console.error(`[${index + 1}/${catalog.length}] ${product.name}: detail ${response.status}`);
    continue;
  }

  const detail = (await response.json()).data;
  const imageUrls = detail?.product_detail?.legacy_pi_images || [];
  if (!imageUrls.length) {
    results.push({ product, status: "no-label-image", detailName: detail?.name });
    console.error(`[${index + 1}/${catalog.length}] ${product.name}: no label image`);
    continue;
  }

  const labels = [];
  for (const [imageIndex, imageUrl] of imageUrls.entries()) {
    const extension = new URL(imageUrl).pathname.split(".").pop() || "jpg";
    const imagePath = path.join(outputDirectory, `${product.retailerId}-${imageIndex}.${extension}`);
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) continue;
    await writeFile(imagePath, Buffer.from(await imageResponse.arrayBuffer()));

    try {
      const raw = await run(ocrBinary, [imagePath, "--json"]);
      const observations = JSON.parse(raw);
      labels.push({ imageUrl, imagePath, observations });
    } catch (error) {
      labels.push({ imageUrl, imagePath, error: error.message });
    }
  }

  results.push({
    product,
    status: labels.some((label) => label.observations) ? "ocr-complete" : "ocr-error",
    detailName: detail?.name,
    allergy: detail?.allergy || "",
    volume: detail?.volume || "",
    labels,
  });
  await writeFile(resultPath, JSON.stringify(results, null, 2));
  console.error(`[${index + 1}/${catalog.length}] ${product.name}: ${labels.length} label(s)`);
}

console.log(resultPath);
