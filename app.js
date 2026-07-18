const API_BASE_URL = globalThis.LABELLENS_API_BASE_URL || "";

const additives = {
  "향미증진제": {
    name: "향미증진제",
    english: "Flavor enhancer",
    purpose: "Boosts savory taste so processed foods taste fuller and more consistent.",
    indication:
      "Commonly permitted when used within food regulations. People who notice sensitivity to specific flavor enhancers may prefer lower-use products.",
    evidence: "Moderate",
    attention: "medium",
  },
  "산도조절제": {
    name: "산도조절제",
    english: "Acidity regulator",
    purpose: "Controls acidity for taste, texture, color stability, and shelf life.",
    indication:
      "Usually a low-concern functional additive. The specific compound matters, so transparent labeling is better than vague grouped terms.",
    evidence: "Strong",
    attention: "low",
  },
  "혼합제제": {
    name: "혼합제제",
    english: "Compound additive preparation",
    purpose: "A blend used to stabilize texture, color, or processing performance.",
    indication:
      "Not automatically concerning, but it lowers label clarity because several sub-ingredients may be grouped together.",
    evidence: "Limited",
    attention: "medium",
  },
  "보존료": {
    name: "보존료",
    english: "Preservative",
    purpose: "Slows microbial growth and spoilage during storage and distribution.",
    indication:
      "Can improve food safety. The health context depends on the exact preservative and exposure level.",
    evidence: "Strong",
    attention: "medium",
  },
  "아질산나트륨": {
    name: "아질산나트륨",
    english: "Sodium nitrite",
    purpose: "Preserves cured meat color and reduces growth of dangerous bacteria.",
    indication:
      "Useful for safety in processed meats, but frequent high intake of processed meats is commonly flagged in nutrition guidance.",
    evidence: "Strong",
    attention: "high",
  },
  "구연산": {
    name: "구연산",
    english: "Citric acid",
    purpose: "Adds tartness and controls acidity.",
    indication:
      "Widely used and generally low concern at permitted levels. May bother people with specific sensitivities.",
    evidence: "Strong",
    attention: "low",
  },
  "잔탄검": {
    name: "잔탄검",
    english: "Xanthan gum",
    purpose: "Thickens and stabilizes sauces, fillings, and frozen foods.",
    indication:
      "Typically low concern, though large amounts can cause digestive discomfort for some people.",
    evidence: "Moderate",
    attention: "low",
  },
  "아스파탐": {
    name: "아스파탐",
    english: "Aspartame",
    purpose: "Provides sweetness with very few calories.",
    indication:
      "Regulators set acceptable daily intake limits. People with PKU must avoid phenylalanine sources.",
    evidence: "Strong",
    attention: "medium",
  },
};

const products = [
  {
    id: "bibigo-sachal-mandu",
    name: "비비고 사찰만두",
    brand: "CJ Bibigo",
    category: "Frozen dumplings",
    type: "Plant-forward Korean dumpling",
    score: 78,
    rank: 4,
    rankTotal: 37,
    betterThan: 89,
    nutrition: { sodium: 760, sugar: 5, saturatedFat: 4, protein: 13, calories: 360 },
    subscores: { nutrition: 22, additives: 15, origin: 14, processing: 12, fit: 15 },
    origins: [
      { ingredient: "Pork", origin: "Korea", weight: "main" },
      { ingredient: "Garlic chives", origin: "China", weight: "main" },
      { ingredient: "Cabbage", origin: "Korea", weight: "main" },
      { ingredient: "Seasoning blend", origin: "Unknown", weight: "minor" },
    ],
    ingredients: ["돼지고기", "부추", "양배추", "두부", "대두단백", "양조간장", "향미증진제", "산도조절제", "혼합제제", "참기름"],
    additives: ["향미증진제", "산도조절제", "혼합제제"],
    notes: [
      "Main ingredients are relatively clear, but the seasoning blend lowers transparency.",
      "Sodium is higher than ideal for a frequent meal, but typical for frozen dumplings.",
      "Contains a factual China-origin signal for garlic chives; this is an origin preference marker, not a safety claim.",
    ],
    sources: ["Seed product profile", "Korean public API connector planned: MFDS nutrition DB + C002 ingredient report"],
  },
  {
    id: "pulmuone-thin-skin-veggie",
    name: "풀무원 얇은피 채소만두",
    brand: "Pulmuone",
    category: "Frozen dumplings",
    type: "Vegetable dumpling",
    score: 84,
    rank: 1,
    rankTotal: 37,
    betterThan: 98,
    nutrition: { sodium: 610, sugar: 4, saturatedFat: 2, protein: 11, calories: 320 },
    subscores: { nutrition: 25, additives: 17, origin: 16, processing: 12, fit: 14 },
    origins: [
      { ingredient: "Cabbage", origin: "Korea", weight: "main" },
      { ingredient: "Tofu", origin: "Korea", weight: "main" },
      { ingredient: "Seasoning", origin: "Unknown", weight: "minor" },
    ],
    ingredients: ["양배추", "두부", "부추", "당면", "양조간장", "구연산"],
    additives: ["구연산"],
    notes: ["Lower sodium than most dumpling products in this seed category.", "Fewer additives and clearer main ingredient origins."],
    sources: ["Seed product profile"],
  },
  {
    id: "market-veggie-mandu",
    name: "마켓온 채식 교자",
    brand: "MarketOn",
    category: "Frozen dumplings",
    type: "Vegan dumpling",
    score: 81,
    rank: 2,
    rankTotal: 37,
    betterThan: 94,
    nutrition: { sodium: 690, sugar: 6, saturatedFat: 2, protein: 10, calories: 340 },
    subscores: { nutrition: 23, additives: 18, origin: 13, processing: 12, fit: 15 },
    origins: [
      { ingredient: "Vegetables", origin: "Mixed", weight: "main" },
      { ingredient: "Soy protein", origin: "Imported", weight: "main" },
    ],
    ingredients: ["양배추", "대두단백", "표고버섯", "당면", "잔탄검"],
    additives: ["잔탄검"],
    notes: ["Good additive profile, but mixed/imported origin labels reduce clarity."],
    sources: ["Seed product profile"],
  },
  {
    id: "classic-pork-mandu",
    name: "고향손 왕교자",
    brand: "Gohyang",
    category: "Frozen dumplings",
    type: "Pork dumpling",
    score: 72,
    rank: 8,
    rankTotal: 37,
    betterThan: 78,
    nutrition: { sodium: 840, sugar: 6, saturatedFat: 5, protein: 14, calories: 390 },
    subscores: { nutrition: 19, additives: 14, origin: 12, processing: 12, fit: 15 },
    origins: [
      { ingredient: "Pork", origin: "Imported", weight: "main" },
      { ingredient: "Cabbage", origin: "China", weight: "main" },
      { ingredient: "Seasoning", origin: "Unknown", weight: "minor" },
    ],
    ingredients: ["돼지고기", "양배추", "부추", "전분", "향미증진제", "산도조절제", "구연산"],
    additives: ["향미증진제", "산도조절제", "구연산"],
    notes: ["Higher sodium and lower origin clarity than the category leaders."],
    sources: ["Seed product profile"],
  },
  {
    id: "shin-ramyun",
    name: "신라면",
    brand: "Nongshim",
    category: "Instant ramen",
    type: "Spicy instant noodle",
    score: 61,
    rank: 12,
    rankTotal: 42,
    betterThan: 49,
    nutrition: { sodium: 1790, sugar: 5, saturatedFat: 8, protein: 10, calories: 510 },
    subscores: { nutrition: 12, additives: 13, origin: 13, processing: 9, fit: 14 },
    origins: [
      { ingredient: "Wheat flour", origin: "Imported", weight: "main" },
      { ingredient: "Soup base", origin: "Unknown", weight: "main" },
    ],
    ingredients: ["소맥분", "팜유", "정제염", "향미증진제", "산도조절제", "구연산"],
    additives: ["향미증진제", "산도조절제", "구연산"],
    notes: ["Sodium is the main score limiter. Best treated as an occasional product or split serving."],
    sources: ["Seed product profile"],
  },
  {
    id: "low-sodium-ramen",
    name: "저나트륨 현미라면",
    brand: "CleanBowl",
    category: "Instant ramen",
    type: "Lower sodium noodle",
    score: 79,
    rank: 2,
    rankTotal: 42,
    betterThan: 95,
    nutrition: { sodium: 980, sugar: 3, saturatedFat: 3, protein: 12, calories: 430 },
    subscores: { nutrition: 24, additives: 16, origin: 14, processing: 11, fit: 14 },
    origins: [
      { ingredient: "Brown rice", origin: "Korea", weight: "main" },
      { ingredient: "Wheat", origin: "Imported", weight: "main" },
    ],
    ingredients: ["현미", "소맥분", "정제염", "잔탄검", "구연산"],
    additives: ["잔탄검", "구연산"],
    notes: ["Much lower sodium than typical instant ramen in this seed set."],
    sources: ["Seed product profile"],
  },
];

const categories = [...new Set(products.map((product) => product.category))];
let selectedProduct = products[0];
let activeTab = "overview";
let currentResults = products;
let searchRequestId = 0;

function productScoreClass(score) {
  if (score >= 80) return "green";
  if (score >= 68) return "amber";
  return "blue";
}

function searchProducts(query) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return products;
  return products.filter((product) => {
    const haystack = [
      product.name,
      product.brand,
      product.category,
      product.type,
      product.ingredients.join(" "),
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(normalized) || normalized.split(/\s+/).some((term) => haystack.includes(term));
  });
}

function numberValue(value) {
  const parsed = Number.parseFloat(String(value ?? "").replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function nutritionSubscore(nutrition) {
  let score = 22;
  if (nutrition.sodium > 1500) score -= 8;
  else if (nutrition.sodium > 900) score -= 5;
  else if (nutrition.sodium > 600) score -= 3;
  if (nutrition.sugar > 20) score -= 5;
  else if (nutrition.sugar > 10) score -= 3;
  if (nutrition.saturatedFat > 8) score -= 5;
  else if (nutrition.saturatedFat > 5) score -= 3;
  if (nutrition.protein > 15) score += 3;
  else if (nutrition.protein > 8) score += 1;
  return Math.max(4, Math.min(30, score));
}

function normalizeApiProduct(item, index) {
  const nutrition = {
    calories: numberValue(item.calories),
    protein: numberValue(item.protein),
    sugar: numberValue(item.sugar),
    sodium: numberValue(item.sodium),
    saturatedFat: numberValue(item.saturatedFat),
  };
  const nutritionScore = nutritionSubscore(nutrition);
  const originKnown = Boolean(item.origin);
  const score = nutritionScore + 10 + (originKnown ? 13 : 8) + 8 + 8;
  const idBase = item.foodCode || item.reportNumber || `${item.name}-${index}`;

  return {
    id: `mfds-${String(idBase).replace(/[^a-zA-Z0-9가-힣_-]/g, "-")}`,
    name: item.name || "Unnamed MFDS product",
    brand: item.maker || "Manufacturer not listed",
    category: item.category || "MFDS packaged food",
    type: "Live MFDS nutrition record",
    score,
    rank: null,
    rankTotal: null,
    betterThan: null,
    nutrition,
    subscores: { nutrition: nutritionScore, additives: 10, origin: originKnown ? 13 : 8, processing: 8, fit: 8 },
    origins: item.origin ? [{ ingredient: "Product record", origin: item.origin, weight: "recorded" }] : [],
    ingredients: [],
    additives: [],
    provisional: true,
    servingSize: item.servingSize || "Not listed",
    notes: [
      `Nutrition values use the MFDS record basis: ${item.servingSize || "basis not listed"}.`,
      "This provisional score uses verified nutrition fields; additive, processing, and personal-fit sections remain neutral until ingredient data is connected.",
    ],
    sources: [
      "Live MFDS Food Nutrition Component Database record",
      item.reportNumber ? `Manufacturing report number: ${item.reportNumber}` : "Manufacturing report number not listed",
      item.updatedAt ? `MFDS record updated: ${item.updatedAt}` : "MFDS update date not listed",
    ],
  };
}

async function fetchPublicProducts(query) {
  if (!API_BASE_URL || query.trim().length < 2) return [];
  const response = await fetch(`${API_BASE_URL}/api/nutrition?q=${encodeURIComponent(query.trim())}`);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "Public data lookup failed");
  return (payload.items || []).map(normalizeApiProduct);
}

function setSearchStatus(message, state = "") {
  const status = document.querySelector("#search-status");
  status.textContent = message;
  status.className = `search-status ${state}`.trim();
}

function renderResults(results) {
  document.querySelector("#result-count").textContent = results.length;
  const list = document.querySelector("#results-list");
  list.innerHTML = results
    .map(
      (product) => `
        <button class="result-card ${product.id === selectedProduct.id ? "active" : ""}" data-id="${product.id}">
          <div class="result-top">
            <div>
              <h3>${product.name}</h3>
              <p>${product.brand} · ${product.category}${product.provisional ? " · Live MFDS" : " · Demo profile"}</p>
            </div>
            <span class="score-pill">${product.score}</span>
          </div>
        </button>
      `,
    )
    .join("");
}

function originSummary(product) {
  const total = product.origins.length || 1;
  const korea = product.origins.filter((item) => item.origin === "Korea").length;
  const china = product.origins.filter((item) => item.origin === "China").length;
  const unknown = product.origins.filter((item) => item.origin === "Unknown" || item.origin === "Mixed").length;
  return {
    domestic: Math.round((korea / total) * 100),
    china,
    unknown: Math.round((unknown / total) * 100),
  };
}

function holisticScoreFormula(product) {
  const s = product.subscores;
  return [
    ["Nutrition Balance", `${s.nutrition}/30`, "Sodium, sugar, saturated fat, protein, and category-aware nutrition."],
    ["Additive Load", `${s.additives}/20`, "Number, purpose, and attention level of additives."],
    ["Origin Transparency", `${s.origin}/20`, "Domestic/imported/China-origin/unknown origin clarity."],
    ["Processing Level", `${s.processing}/15`, "Whole-food ingredients vs compound seasonings and refined components."],
    ["Personal Fit", `${s.fit}/15`, "Allergens, diet preferences, and user concerns."],
  ];
}

function categoryRanking(product) {
  return products
    .filter((candidate) => candidate.category === product.category)
    .sort((a, b) => b.score - a.score);
}

function renderDetail(product) {
  const origin = originSummary(product);
  const tabs = [
    ["overview", "Overview"],
    ["ingredients", "Additives"],
    ["origin", "Origin"],
    ["ranking", "Ranking"],
    ["sources", "Sources"],
  ];

  document.querySelector("#product-detail").innerHTML = `
    <article>
      <header class="product-header">
        <div class="score-dial">
          <div><strong>${product.score}</strong><span>overall</span></div>
        </div>
        <div class="product-title">
          <p class="eyebrow">${product.brand} · ${product.category}</p>
          <h2>${product.name}</h2>
          <p>${product.type}. ${product.provisional ? "Provisional score based on MFDS nutrition fields; missing ingredient dimensions are shown as neutral." : `Ranked #${product.rank} of ${product.rankTotal}, better than ${product.betterThan}% of ${product.category.toLowerCase()} in the current demo set.`}</p>
          <div class="badges">
            <span class="badge ${productScoreClass(product.score)}">${product.score >= 80 ? "Category leader" : product.score >= 68 ? "Clearer than average" : "Watch tradeoffs"}</span>
            <span class="badge blue">${origin.domestic}% domestic signal</span>
            <span class="badge amber">${product.provisional ? "Ingredients pending" : `${product.additives.length} additive flags`}</span>
          </div>
        </div>
      </header>

      <nav class="detail-tabs" aria-label="Product detail sections">
        ${tabs
          .map(([id, label]) => `<button class="tab-button ${activeTab === id ? "active" : ""}" data-tab="${id}">${label}</button>`)
          .join("")}
      </nav>

      <div class="tab-panel">
        ${renderTab(product)}
      </div>
    </article>
  `;
}

function renderTab(product) {
  if (activeTab === "ingredients") return renderIngredients(product);
  if (activeTab === "origin") return renderOrigin(product);
  if (activeTab === "ranking") return renderRanking(product);
  if (activeTab === "sources") return renderSources(product);
  return renderOverview(product);
}

function renderOverview(product) {
  return `
    <div class="metric-grid">
      ${holisticScoreFormula(product)
        .map(
          ([title, value, text]) => `
            <div class="metric-card">
              <span>${title}</span>
              <strong>${value}</strong>
              <p>${text}</p>
            </div>
          `,
        )
        .join("")}
    </div>
    <div class="callout" style="margin-top: 14px;">
      <h3>Why this score?</h3>
      <p>${product.notes.join(" ")}</p>
    </div>
  `;
}

function renderIngredients(product) {
  if (product.provisional && !product.additives.length) {
    return `<div class="callout"><h3>Ingredient data not yet connected</h3><p>The MFDS nutrition record verifies nutrient values but does not provide this product's full ingredient label. LabelLens leaves additive findings unknown instead of guessing.</p></div>`;
  }
  return `
    <div class="ingredient-list">
      ${product.additives
        .map((key) => {
          const item = additives[key] || {
            name: key,
            english: "Ingredient or additive",
            purpose: "Purpose needs confirmation from the exact label context.",
            indication: "No product-level health claim is made without source review.",
            evidence: "Unknown",
            attention: "medium",
          };
          return `
            <div class="ingredient-card">
              <div>
                <h3>${item.name} <span class="badge">${item.english}</span></h3>
                <p><strong>Purpose:</strong> ${item.purpose}</p>
                <p><strong>Health context:</strong> ${item.indication}</p>
              </div>
              <div class="attention ${item.attention}">
                ${item.evidence}
              </div>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderOrigin(product) {
  const origin = originSummary(product);
  if (product.provisional && !product.origins.length) {
    return `<div class="callout"><h3>Origin not listed in this record</h3><p>No product-origin field was returned by the MFDS nutrition lookup. LabelLens marks it unknown rather than inferring origin from the manufacturer.</p></div>`;
  }
  return `
    <div class="metric-grid">
      <div class="metric-card"><span>Domestic signal</span><strong>${origin.domestic}%</strong><p>Known Korean-origin ingredients among listed origin records.</p></div>
      <div class="metric-card"><span>China-origin flags</span><strong>${origin.china}</strong><p>Factual origin markers only, not safety claims.</p></div>
      <div class="metric-card"><span>Unknown/mixed</span><strong>${origin.unknown}%</strong><p>Grouped, mixed, or missing origin details.</p></div>
      <div class="metric-card"><span>Main ingredient clarity</span><strong>${product.subscores.origin}/20</strong><p>How clearly the label explains high-impact ingredients.</p></div>
      <div class="metric-card"><span>Positioning</span><strong>Transparency</strong><p>Not fear. Clearer labels support better choices.</p></div>
    </div>
    <div class="leaderboard" style="margin-top: 14px;">
      ${product.origins
        .map(
          (item) => `
            <div class="rank-card">
              <span class="rank-num">${item.origin.slice(0, 2).toUpperCase()}</span>
              <div><h3>${item.ingredient}</h3><p>${item.weight} ingredient · origin: ${item.origin}</p></div>
            </div>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderRanking(product) {
  if (product.provisional) {
    return `<div class="callout"><h3>Ranking pending category coverage</h3><p>This is a live MFDS product record. A trustworthy category rank requires enough comparable live records with the same nutrition basis.</p></div>`;
  }
  return `
    <div class="leaderboard">
      ${categoryRanking(product)
        .map(
          (candidate, index) => `
            <div class="rank-card">
              <span class="rank-num">#${index + 1}</span>
              <div>
                <h3>${candidate.name}</h3>
                <p>${candidate.brand} · sodium ${candidate.nutrition.sodium}mg · additives ${candidate.additives.length}</p>
              </div>
              <strong>${candidate.score}</strong>
            </div>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderSources(product) {
  return `
    <div class="source-list">
      <div class="callout">
        <h3>Evidence model</h3>
        <p>Ingredient explanations are designed to cite WHO/JECFA, EFSA, FDA, Korean MFDS, and recent review literature. Live nutrition records come from MFDS; ingredient explanations currently use a curated local knowledge base.</p>
      </div>
      ${product.sources.map((source) => `<div class="callout"><p>${source}</p></div>`).join("")}
      <div class="callout">
        <h3>Public API connector targets</h3>
        <p>MFDS Food Nutrition DB, Foodsafety Korea C002 ingredient reports, imported food product DB, imported food ingredient DB.</p>
      </div>
    </div>
  `;
}

function analyzeLabelText() {
  const text = document.querySelector("#label-input").value;
  const additiveHits = Object.keys(additives).filter((key) => text.includes(key));
  const chinaHits = (text.match(/중국산/g) || []).length;
  const domesticHits = (text.match(/국산|국내산/g) || []).length;
  const sodium = text.match(/나트륨\s*(\d+)mg/);
  const protein = text.match(/단백질\s*(\d+)g/);
  const clarity = Math.max(44, Math.min(92, 68 + domesticHits * 5 - chinaHits * 4 - (text.includes("혼합") ? 8 : 0)));

  document.querySelector("#label-analysis").innerHTML = `
    <div class="metric-card"><span>Parsed additives</span><strong>${additiveHits.length}</strong><p>${additiveHits.join(", ") || "No seeded additive terms detected."}</p></div>
    <div class="metric-card"><span>Origin clarity estimate</span><strong>${clarity}/100</strong><p>${domesticHits} domestic markers, ${chinaHits} China-origin markers, grouped terms checked.</p></div>
    <div class="metric-card"><span>Nutrition signals</span><strong>${sodium ? sodium[1] + "mg" : "n/a"}</strong><p>Sodium ${sodium ? "detected" : "not detected"} · protein ${protein ? protein[1] + "g" : "not detected"}.</p></div>
    <div class="callout"><h3>Plain-language summary</h3><p>This label includes ${additiveHits.length} recognized additive terms. The app treats origin markers factually and avoids unsafe claims unless an authoritative source supports the specific ingredient context.</p></div>
  `;
}

async function runSearch(query) {
  const requestId = ++searchRequestId;
  const localResults = searchProducts(query);
  currentResults = localResults.length ? localResults : products;
  selectedProduct = currentResults[0];
  activeTab = "overview";
  renderResults(currentResults);
  renderDetail(selectedProduct);
  setSearchStatus(API_BASE_URL ? "Checking live MFDS nutrition records..." : "Demo catalog · live connector not configured");

  try {
    const liveResults = await fetchPublicProducts(query);
    if (requestId !== searchRequestId) return;
    liveResults.forEach((product) => {
      const existingIndex = products.findIndex((candidate) => candidate.id === product.id);
      if (existingIndex >= 0) products[existingIndex] = product;
      else products.push(product);
    });
    currentResults = [...liveResults, ...localResults].filter(
      (product, index, list) => list.findIndex((candidate) => candidate.id === product.id) === index,
    );
    if (!currentResults.length) currentResults = products;
    selectedProduct = currentResults[0];
    renderResults(currentResults);
    renderDetail(selectedProduct);
    setSearchStatus(
      liveResults.length ? `${liveResults.length} live MFDS record${liveResults.length === 1 ? "" : "s"} found` : "No live match · showing demo catalog",
      liveResults.length ? "live" : "fallback",
    );
  } catch (error) {
    if (requestId !== searchRequestId) return;
    setSearchStatus("Public API unavailable · showing demo catalog", "fallback");
  }
}

document.querySelector("#search-form").addEventListener("submit", (event) => {
  event.preventDefault();
  runSearch(document.querySelector("#search-input").value);
});

document.querySelector(".quick-picks").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-query]");
  if (!button) return;
  document.querySelector("#search-input").value = button.dataset.query;
  runSearch(button.dataset.query);
});

document.querySelector("#results-list").addEventListener("click", (event) => {
  const card = event.target.closest(".result-card");
  if (!card) return;
  selectedProduct = currentResults.find((product) => product.id === card.dataset.id) || selectedProduct;
  activeTab = "overview";
  renderResults(currentResults);
  renderDetail(selectedProduct);
});

document.querySelector("#product-detail").addEventListener("click", (event) => {
  const tab = event.target.closest(".tab-button");
  if (!tab) return;
  activeTab = tab.dataset.tab;
  renderDetail(selectedProduct);
});

document.querySelector("#label-input").addEventListener("input", analyzeLabelText);

runSearch("비비고 사찰만두");
analyzeLabelText();
