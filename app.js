const API_BASE_URL = globalThis.LABELLENS_API_BASE_URL || "";

const additives = {
  "향미증진제": {
    name: "향미증진제",
    english: "Flavor enhancer",
    purpose: "감칠맛을 높여 제품의 맛을 일정하게 유지합니다.",
    indication: "허용 기준 안에서 사용할 수 있는 첨가물입니다. 특정 향미증진제에 민감하다면 정확한 성분명과 섭취량을 함께 확인하세요.",
    evidence: "근거 보통",
    attention: "medium",
  },
  "L-글루탐산나트륨": {
    name: "L-글루탐산나트륨",
    english: "Monosodium glutamate (MSG)",
    purpose: "국물, 소스, 스낵 등에 감칠맛을 더합니다.",
    indication: "식품 사용이 허용된 첨가물입니다. 라벨렌즈는 MSG 유무만으로 식품을 유해하다고 판단하지 않으며, 총 나트륨과 섭취 빈도를 함께 봅니다.",
    evidence: "근거 높음",
    attention: "medium",
  },
  "5'-리보뉴클레오티드이나트륨": {
    name: "5'-리보뉴클레오티드이나트륨",
    english: "Disodium ribonucleotides",
    purpose: "글루탐산계 향미증진제와 함께 감칠맛을 강화합니다.",
    indication: "일반적으로 허용 범위 내 소량 사용됩니다. 성분명 하나보다 전체 나트륨과 식사 패턴이 더 중요합니다.",
    evidence: "근거 보통",
    attention: "medium",
  },
  "산도조절제": {
    name: "산도조절제",
    english: "Acidity regulator",
    purpose: "맛, 식감, 색과 보존성을 위해 산도를 조절합니다.",
    indication: "대체로 우려가 낮은 기능성 첨가물입니다. 다만 묶음 명칭보다 구체적인 물질명이 표시된 제품이 더 투명합니다.",
    evidence: "근거 높음",
    attention: "low",
  },
  "혼합제제": {
    name: "혼합제제",
    english: "Compound additive preparation",
    purpose: "식감, 색 또는 제조 안정성을 위해 여러 성분을 섞은 제제입니다.",
    indication: "그 자체로 유해하다는 뜻은 아닙니다. 여러 하위 성분이 한 이름으로 묶여 라벨 투명성이 낮아질 수 있습니다.",
    evidence: "근거 제한적",
    attention: "medium",
  },
  "보존료": {
    name: "보존료",
    english: "Preservative",
    purpose: "보관과 유통 중 미생물 증식과 부패를 늦춥니다.",
    indication: "식품 안전에 도움을 줄 수 있습니다. 건강 맥락은 정확한 보존료 종류와 노출량에 따라 달라집니다.",
    evidence: "근거 높음",
    attention: "medium",
  },
  "아질산나트륨": {
    name: "아질산나트륨",
    english: "Sodium nitrite",
    purpose: "가공육의 색을 유지하고 위험한 세균 증식을 억제합니다.",
    indication: "가공육 안전에 쓰이지만, 가공육을 자주 많이 먹는 식습관은 여러 영양 지침에서 제한을 권합니다.",
    evidence: "근거 높음",
    attention: "high",
  },
  "구연산": {
    name: "구연산",
    english: "Citric acid",
    purpose: "신맛을 내고 산도를 조절합니다.",
    indication: "널리 사용되며 허용 기준에서는 대체로 우려가 낮습니다. 특정 민감성이 있다면 불편을 느낄 수 있습니다.",
    evidence: "근거 높음",
    attention: "low",
  },
  "잔탄검": {
    name: "잔탄검",
    english: "Xanthan gum",
    purpose: "소스, 속재료와 냉동식품의 점도와 안정성을 유지합니다.",
    indication: "대체로 우려가 낮지만 많은 양은 일부 사람에게 소화 불편을 줄 수 있습니다.",
    evidence: "근거 보통",
    attention: "low",
  },
  "아스파탐": {
    name: "아스파탐",
    english: "Aspartame",
    purpose: "적은 열량으로 단맛을 냅니다.",
    indication: "규제기관이 일일섭취허용량을 정하고 있습니다. 페닐케톤뇨증 환자는 페닐알라닌 급원을 피해야 합니다.",
    evidence: "근거 높음",
    attention: "medium",
  },
};

const products = [
  {
    id: "bibigo-sachal-mandu",
    name: "비비고 사찰만두",
    brand: "CJ 비비고",
    category: "냉동만두",
    type: "채소 중심 사찰식 만두",
    score: 78,
    rank: 4,
    rankTotal: 37,
    betterThan: 89,
    nutrition: { sodium: 760, sugar: 5, saturatedFat: 4, protein: 13, calories: 360 },
    subscores: { nutrition: 22, additives: 15, origin: 14, processing: 12, fit: 15 },
    origins: [
      { ingredient: "돼지고기", origin: "국산", weight: "주원료" },
      { ingredient: "부추", origin: "중국산", weight: "주원료" },
      { ingredient: "양배추", origin: "국산", weight: "주원료" },
      { ingredient: "복합조미식품", origin: "미상", weight: "부원료" },
    ],
    ingredients: ["돼지고기", "부추", "양배추", "두부", "대두단백", "양조간장", "향미증진제", "산도조절제", "혼합제제", "참기름"],
    additives: ["향미증진제", "산도조절제", "혼합제제"],
    notes: [
      "주원료는 비교적 명확하지만 복합조미식품의 세부 구성이 표시되지 않아 투명성이 낮아집니다.",
      "나트륨은 냉동만두 평균 범위지만 한 끼 식사로 자주 먹기에는 주의가 필요합니다.",
      "부추에 중국산 표시가 있습니다. 원산지 선호 정보이며 안전성 판단은 아닙니다.",
    ],
    sources: ["라벨렌즈 검증용 제품 프로필", "식약처 식품영양성분DB + 식품안전나라 C002 연동"],
  },
  {
    id: "pulmuone-thin-skin-veggie",
    name: "풀무원 얇은피 채소만두",
    brand: "풀무원",
    category: "냉동만두",
    type: "얇은피 채소만두",
    score: 84,
    rank: 1,
    rankTotal: 37,
    betterThan: 98,
    nutrition: { sodium: 610, sugar: 4, saturatedFat: 2, protein: 11, calories: 320 },
    subscores: { nutrition: 25, additives: 17, origin: 16, processing: 12, fit: 14 },
    origins: [
      { ingredient: "양배추", origin: "국산", weight: "주원료" },
      { ingredient: "두부", origin: "국산", weight: "주원료" },
      { ingredient: "조미료", origin: "미상", weight: "부원료" },
    ],
    ingredients: ["양배추", "두부", "부추", "당면", "양조간장", "구연산"],
    additives: ["구연산"],
    notes: ["현재 비교군의 만두 제품보다 나트륨이 낮습니다.", "인식된 첨가물이 적고 주원료 원산지가 비교적 명확합니다."],
    sources: ["라벨렌즈 검증용 제품 프로필"],
  },
  {
    id: "market-veggie-mandu",
    name: "마켓온 채식 교자",
    brand: "마켓온",
    category: "냉동만두",
    type: "비건 교자",
    score: 81,
    rank: 2,
    rankTotal: 37,
    betterThan: 94,
    nutrition: { sodium: 690, sugar: 6, saturatedFat: 2, protein: 10, calories: 340 },
    subscores: { nutrition: 23, additives: 18, origin: 13, processing: 12, fit: 15 },
    origins: [
      { ingredient: "채소", origin: "혼합", weight: "주원료" },
      { ingredient: "대두단백", origin: "수입산", weight: "주원료" },
    ],
    ingredients: ["양배추", "대두단백", "표고버섯", "당면", "잔탄검"],
    additives: ["잔탄검"],
    notes: ["첨가물 구성은 단순하지만 혼합·수입산 표기로 원산지 명확성이 낮습니다."],
    sources: ["라벨렌즈 검증용 제품 프로필"],
  },
  {
    id: "classic-pork-mandu",
    name: "고향손 왕교자",
    brand: "고향손",
    category: "냉동만두",
    type: "돼지고기 왕교자",
    score: 72,
    rank: 8,
    rankTotal: 37,
    betterThan: 78,
    nutrition: { sodium: 840, sugar: 6, saturatedFat: 5, protein: 14, calories: 390 },
    subscores: { nutrition: 19, additives: 14, origin: 12, processing: 12, fit: 15 },
    origins: [
      { ingredient: "돼지고기", origin: "수입산", weight: "주원료" },
      { ingredient: "양배추", origin: "중국산", weight: "주원료" },
      { ingredient: "조미료", origin: "미상", weight: "부원료" },
    ],
    ingredients: ["돼지고기", "양배추", "부추", "전분", "향미증진제", "산도조절제", "구연산"],
    additives: ["향미증진제", "산도조절제", "구연산"],
    notes: ["비교군 상위 제품보다 나트륨이 높고 원산지 명확성이 낮습니다."],
    sources: ["라벨렌즈 검증용 제품 프로필"],
  },
  {
    id: "shin-ramyun",
    name: "신라면",
    brand: "농심",
    category: "라면",
    type: "매운맛 유탕면",
    score: 61,
    rank: 12,
    rankTotal: 42,
    betterThan: 49,
    nutrition: { sodium: 1790, sugar: 5, saturatedFat: 8, protein: 10, calories: 510 },
    subscores: { nutrition: 12, additives: 13, origin: 13, processing: 9, fit: 14 },
    origins: [
      { ingredient: "소맥분", origin: "수입산", weight: "주원료" },
      { ingredient: "분말스프", origin: "미상", weight: "주원료" },
    ],
    ingredients: ["소맥분", "팜유", "정제염", "향미증진제", "산도조절제", "구연산"],
    additives: ["향미증진제", "산도조절제", "구연산"],
    notes: ["나트륨이 점수를 가장 크게 낮춥니다. 섭취 빈도를 줄이거나 국물을 남기는 선택이 도움이 됩니다."],
    sources: ["라벨렌즈 검증용 제품 프로필"],
  },
  {
    id: "low-sodium-ramen",
    name: "저나트륨 현미라면",
    brand: "CleanBowl",
    category: "라면",
    type: "저나트륨 현미면",
    score: 79,
    rank: 2,
    rankTotal: 42,
    betterThan: 95,
    nutrition: { sodium: 980, sugar: 3, saturatedFat: 3, protein: 12, calories: 430 },
    subscores: { nutrition: 24, additives: 16, origin: 14, processing: 11, fit: 14 },
    origins: [
      { ingredient: "현미", origin: "국산", weight: "주원료" },
      { ingredient: "밀", origin: "수입산", weight: "주원료" },
    ],
    ingredients: ["현미", "소맥분", "정제염", "잔탄검", "구연산"],
    additives: ["잔탄검", "구연산"],
    notes: ["현재 비교군의 일반 라면보다 나트륨이 크게 낮습니다."],
    sources: ["라벨렌즈 검증용 제품 프로필"],
  },
];

const categories = [...new Set(products.map((product) => product.category))];
let selectedProduct = products[0];
let activeTab = "overview";
let currentResults = products;
let searchRequestId = 0;
let currentPreference = "balanced";

function productScoreClass(score) {
  if (score >= 80) return "green";
  if (score >= 68) return "amber";
  return "blue";
}

function preferenceScore(product) {
  if (currentPreference === "sodium") {
    const sodiumBoost = product.nutrition.sodium <= 700 ? 7 : product.nutrition.sodium >= 1400 ? -8 : 0;
    return Math.max(0, Math.min(100, product.score + sodiumBoost));
  }
  if (currentPreference === "origin") return Math.max(0, Math.min(100, product.score + (product.subscores.origin - 12)));
  if (currentPreference === "additives") return Math.max(0, Math.min(100, product.score + (product.subscores.additives - 14)));
  return product.score;
}

function preferenceLabel() {
  return { balanced: "균형 기준", sodium: "나트륨 우선", origin: "원산지 우선", additives: "첨가물 우선" }[currentPreference];
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
    name: item.name || "제품명 미표시",
    brand: item.maker || "제조사 미표시",
    category: item.category || "가공식품",
    type: "식약처 실시간 영양정보",
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
    servingSize: item.servingSize || "표시 없음",
    reportNumber: item.reportNumber || "",
    notes: [
      `영양성분은 식약처 데이터의 기준량(${item.servingSize || "표시 없음"})을 사용합니다.`,
      "영양정보만 확인된 임시 점수입니다. 원재료 데이터가 연결되기 전까지 첨가물, 가공도와 개인 적합도는 중립값으로 둡니다.",
    ],
    sources: [
      "식약처 식품영양성분DB 실시간 조회",
      item.reportNumber ? `품목제조보고번호: ${item.reportNumber}` : "품목제조보고번호 미표시",
      item.updatedAt ? `식약처 데이터 갱신일: ${item.updatedAt}` : "갱신일 미표시",
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

function normalizedProductName(value) {
  return String(value || "").replace(/\s+/g, "").toLowerCase();
}

function splitIngredientText(value) {
  return String(value || "")
    .split(/,(?![^()]*\))/)
    .map((item) => item.trim())
    .filter(Boolean);
}

async function fetchIngredientRecord(product) {
  if (!API_BASE_URL) return null;
  const params = new URLSearchParams({ q: product.name });
  if (product.reportNumber) params.set("reportNumber", product.reportNumber);
  const response = await fetch(`${API_BASE_URL}/api/ingredients?${params}`);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "Ingredient lookup failed");
  const records = payload.items || [];
  const target = normalizedProductName(product.name);
  return records.find((item) => normalizedProductName(item.name) === target) || records[0] || null;
}

async function hydrateIngredients(product) {
  if (!product || product.ingredientsStatus === "loading" || product.ingredientsStatus === "loaded") return;
  product.ingredientsStatus = "loading";
  if (selectedProduct.id === product.id) renderDetail(product);
  try {
    const record = await fetchIngredientRecord(product);
    if (!record) {
      product.ingredientsStatus = "missing";
      if (selectedProduct.id === product.id) renderDetail(product);
      return;
    }
    const ingredientText = record.ingredientText || (record.rawMaterials || []).join(", ");
    product.ingredients = splitIngredientText(ingredientText);
    product.additives = Object.keys(additives).filter((key) => ingredientText.includes(key));
    product.ingredientsStatus = "loaded";
    product.ingredientRecord = record;
    product.subscores.additives = Math.max(8, 20 - product.additives.length * 2);
    product.score = Object.values(product.subscores).reduce((sum, value) => sum + value, 0);
    const source = `식품안전나라 C002 원재료 기록${record.reportNumber ? ` · ${record.reportNumber}` : ""}`;
    if (!product.sources.includes(source)) product.sources.unshift(source);
    if (!product.notes.some((note) => note.includes("C002"))) {
      product.notes.push("식품안전나라 C002 품목제조보고서에서 원재료와 첨가물 정보를 대조했습니다.");
    }
    if (selectedProduct.id === product.id) {
      renderResults(currentResults);
      renderDetail(product);
    }
  } catch (error) {
    product.ingredientsStatus = "error";
    if (selectedProduct.id === product.id) renderDetail(product);
  }
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
              <p>${product.brand} · ${product.category}${product.provisional ? " · 식약처 데이터" : " · 검증 프로필"}</p>
            </div>
            <span class="score-pill">${preferenceScore(product)}</span>
          </div>
        </button>
      `,
    )
    .join("");
}

function originSummary(product) {
  const total = product.origins.length || 1;
  const korea = product.origins.filter((item) => /(^|[^가-힣])(국내산|국산|대한민국)(?=$|[^가-힣])|Korea/i.test(item.origin)).length;
  const china = product.origins.filter((item) => /중국산|China/i.test(item.origin)).length;
  const unknown = product.origins.filter((item) => /미상|혼합|Unknown|Mixed/i.test(item.origin)).length;
  return {
    domestic: Math.round((korea / total) * 100),
    china,
    unknown: Math.round((unknown / total) * 100),
  };
}

function holisticScoreFormula(product) {
  const s = product.subscores;
  return [
    ["영양 균형", s.nutrition, 30, "나트륨·당·포화지방·단백질"],
    ["첨가물", s.additives, 20, "개수보다 기능과 근거 중심"],
    ["원산지 투명성", s.origin, 20, "주원료의 원산지 공개 수준"],
    ["가공도", s.processing, 15, "원형 원료와 복합 원료 비중"],
    ["개인 적합도", s.fit, 15, "알레르기·식단·관심 기준"],
  ];
}

function categoryRanking(product) {
  return products
    .filter((candidate) => candidate.category === product.category)
    .sort((a, b) => preferenceScore(b) - preferenceScore(a));
}

function renderDetail(product) {
  const origin = originSummary(product);
  const shownScore = preferenceScore(product);
  const tabs = [
    ["overview", "한눈에 보기"],
    ["ingredients", "원재료·첨가물"],
    ["origin", "원산지"],
    ["ranking", "같은 종류 비교"],
    ["sources", "출처·한계"],
  ];

  document.querySelector("#product-detail").innerHTML = `
    <article>
      <header class="product-header">
        <div class="score-dial" style="--score: ${shownScore}">
          <div><strong>${shownScore}</strong><span>${preferenceLabel()}</span></div>
        </div>
        <div class="product-title">
          <p class="section-kicker">${product.brand} · ${product.category}</p>
          <h2>${product.name}</h2>
          <p>${product.type}. ${product.provisional ? "식약처 영양정보를 바탕으로 계산한 임시 점수이며, 확인되지 않은 항목은 중립 처리했어요." : `현재 비교군 ${product.rankTotal}개 중 ${product.rank}위, ${product.category}의 ${product.betterThan}%보다 높은 점수예요.`}</p>
          <div class="badges">
            <span class="badge ${productScoreClass(shownScore)}">${shownScore >= 80 ? "비교군 상위권" : shownScore >= 68 ? "무난한 선택" : "꼼꼼히 확인"}</span>
            <span class="badge blue">국산 표시 ${origin.domestic}%</span>
            <span class="badge amber">${product.provisional ? "원재료 확인 중" : `인식된 첨가물 ${product.additives.length}개`}</span>
          </div>
        </div>
      </header>

      <nav class="detail-tabs" aria-label="제품 상세 정보">
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
          ([title, value, total, text]) => `
            <div class="metric-card">
              <span>${title}</span>
              <strong>${value}<small> / ${total}</small></strong>
              <p>${text}</p>
              <div class="metric-bar"><i style="width:${Math.round((value / total) * 100)}%"></i></div>
            </div>
          `,
        )
        .join("")}
    </div>
    <div class="summary-list">
      <div class="summary-point"><strong>영양 스냅샷</strong><p>${product.nutrition.calories || "-"}kcal · 나트륨 ${product.nutrition.sodium || "-"}mg · 단백질 ${product.nutrition.protein || "-"}g · 당류 ${product.nutrition.sugar || "-"}g</p></div>
      <div class="summary-point"><strong>선택 팁</strong><p>${product.nutrition.sodium > 1000 ? "나트륨이 높아요. 국물이나 소스를 덜 먹고 다른 끼니를 싱겁게 구성해 보세요." : "나트륨은 비교군 안에서 무난해요. 총 섭취량과 곁들이는 음식도 함께 확인하세요."}</p></div>
    </div>
    <div class="callout">
      <h3>이 점수에는 이유가 있어요</h3>
      <p>${product.notes.join(" ")}</p>
    </div>
  `;
}

function renderIngredients(product) {
  if (product.ingredientsStatus === "loading" && product.provisional) {
    return `<div class="callout"><h3>품목제조보고서를 확인하고 있어요</h3><p>식품안전나라 C002 데이터에서 제품명과 품목제조보고번호를 대조합니다.</p></div>`;
  }
  if (product.ingredientsStatus === "error" && product.provisional) {
    return `<div class="callout"><h3>원재료 서비스를 잠시 사용할 수 없어요</h3><p>영양정보는 그대로 확인할 수 있습니다. 확인되지 않은 원재료나 첨가물을 임의로 추정하지 않았어요.</p></div>`;
  }
  if (product.provisional && !product.additives.length) {
    const message = product.ingredientsStatus === "loaded"
      ? "C002 원재료 기록은 찾았지만 현재 지식베이스가 인식하는 첨가물 명칭은 없었습니다. '무첨가'라는 의미는 아닙니다."
      : "식약처 영양정보는 확인했지만 일치하는 C002 원재료 기록은 찾지 못했습니다. 추정하는 대신 '정보 없음'으로 표시합니다.";
    return `<div class="callout"><h3>${product.ingredientsStatus === "loaded" ? "인식된 첨가물 명칭 없음" : "원재료 정보 없음"}</h3><p>${message}</p></div>`;
  }
  return `
    ${product.ingredientsStatus === "loading" ? `<div class="callout"><p>C002 품목제조보고서와 대조 중입니다.</p></div>` : ""}
    ${product.ingredientsStatus === "error" ? `<div class="callout"><p>C002 서비스가 응답하지 않아 검증용 원재료 프로필을 표시합니다.</p></div>` : ""}
    ${product.ingredientsStatus === "loaded" ? `<div class="callout"><h3>C002 품목제조보고서 일치</h3><p>${product.ingredients.slice(0, 24).join(", ")}${product.ingredients.length > 24 ? "..." : ""}</p></div>` : ""}
    <div class="ingredient-list">
      ${product.additives
        .map((key) => {
          const item = additives[key] || {
            name: key,
            english: "원재료 또는 첨가물",
            purpose: "정확한 라벨 맥락에서 기능을 확인해야 합니다.",
            indication: "출처를 확인하지 않은 제품 단위 건강 판단은 제공하지 않습니다.",
            evidence: "근거 미확인",
            attention: "medium",
          };
          return `
            <div class="ingredient-card">
              <div>
                <h3>${item.name} <span class="badge">${item.english}</span></h3>
                <p><strong>왜 넣나요:</strong> ${item.purpose}</p>
                <p><strong>어떻게 봐야 하나요:</strong> ${item.indication}</p>
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
    return `<div class="callout"><h3>원산지가 표시되지 않은 데이터예요</h3><p>식약처 영양정보 조회에서 원산지 필드가 반환되지 않았습니다. 제조사 정보로 추정하지 않고 미상으로 둡니다.</p></div>`;
  }
  return `
    <div class="metric-grid">
      <div class="metric-card"><span>국산 표시 비율</span><strong>${origin.domestic}%</strong><p>원산지가 표시된 원료 중 국산 표기</p></div>
      <div class="metric-card"><span>중국산 표시</span><strong>${origin.china}건</strong><p>안전성 판단이 아닌 원산지 사실 정보</p></div>
      <div class="metric-card"><span>미상·혼합</span><strong>${origin.unknown}%</strong><p>묶음·혼합 또는 세부 원산지 누락</p></div>
      <div class="metric-card"><span>원산지 명확성</span><strong>${product.subscores.origin}/20</strong><p>주원료가 얼마나 구체적으로 표시됐는지</p></div>
      <div class="metric-card"><span>해석 원칙</span><strong>투명성</strong><p>특정 국가를 위험도와 연결하지 않아요</p></div>
    </div>
    <div class="leaderboard" style="margin-top: 14px;">
      ${product.origins
        .map(
          (item) => `
            <div class="rank-card">
              <span class="rank-num">${item.origin.slice(0, 2)}</span>
              <div><h3>${item.ingredient}</h3><p>${item.weight} · 원산지 ${item.origin}</p></div>
            </div>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderRanking(product) {
  if (product.provisional) {
    return `<div class="callout"><h3>비교 데이터가 더 필요해요</h3><p>실시간 식약처 제품입니다. 신뢰할 수 있는 순위는 같은 기준량과 식품 유형의 제품이 충분히 모인 뒤 제공할게요.</p></div>`;
  }
  return `
    <div class="leaderboard">
      ${categoryRanking(product)
        .map(
          (candidate, index) => `
            <div class="rank-card ${candidate.id === product.id ? "selected" : ""}">
              <span class="rank-num">#${index + 1}</span>
              <div>
                <h3>${candidate.name}</h3>
                <p>${candidate.brand} · 나트륨 ${candidate.nutrition.sodium}mg · 인식 첨가물 ${candidate.additives.length}개</p>
              </div>
              <strong>${preferenceScore(candidate)}</strong>
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
        <h3>근거를 숨기지 않아요</h3>
        <p>영양정보는 식약처 공공데이터를 사용합니다. 첨가물 설명은 식약처, WHO/JECFA, EFSA, FDA와 검토 논문을 기준으로 정리하며 현재 제품 프로필 일부는 시연용 검증 데이터입니다.</p>
      </div>
      ${product.sources.map((source, index) => `<div class="source-item"><strong>출처 ${index + 1}</strong><p>${source}</p></div>`).join("")}
      <div class="source-item">
        <strong>점수의 한계</strong>
        <p>점수는 질병 위험이나 식품 안전을 판정하지 않습니다. 공개된 라벨 정보와 같은 종류 제품 안의 상대적 선택 편의를 위한 지표입니다.</p>
      </div>
    </div>
  `;
}

function analyzeLabelText() {
  const text = document.querySelector("#label-input").value;
  const additiveHits = Object.keys(additives).filter((key) => text.includes(key));
  const chinaHits = (text.match(/중국산/g) || []).length;
  const domesticHits = (text.match(/(?<![가-힣])(?:국내산|국산)/g) || []).length;
  const sodium = text.match(/나트륨\s*(\d+)mg/);
  const protein = text.match(/단백질\s*(\d+)g/);
  const clarity = Math.max(44, Math.min(92, 68 + domesticHits * 5 - chinaHits * 4 - (text.includes("혼합") ? 8 : 0)));

  document.querySelector("#label-analysis").innerHTML = `
    <div class="metric-card"><span>인식된 첨가물</span><strong>${additiveHits.length}개</strong><p>${additiveHits.join(", ") || "현재 사전에서 인식된 명칭 없음"}</p></div>
    <div class="metric-card"><span>원산지 명확성</span><strong>${clarity}/100</strong><p>국산 ${domesticHits}건 · 중국산 ${chinaHits}건 · 혼합 표기 확인</p></div>
    <div class="metric-card"><span>나트륨</span><strong>${sodium ? sodium[1] + "mg" : "미인식"}</strong><p>${sodium ? "영양정보에서 확인" : "수치를 찾지 못함"}</p></div>
    <div class="metric-card"><span>단백질</span><strong>${protein ? protein[1] + "g" : "미인식"}</strong><p>${protein ? "영양정보에서 확인" : "수치를 찾지 못함"}</p></div>
    <div class="callout"><h3>쉽게 말하면</h3><p>이 라벨에서 첨가물 명칭 ${additiveHits.length}개를 찾았어요. 원산지는 선호를 위한 사실 정보로만 다루며, 출처 없이 특정 원료를 유해하다고 판단하지 않습니다.</p></div>
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
  setSearchStatus(API_BASE_URL ? "식약처 영양정보를 확인하고 있어요..." : "검증용 제품 데이터로 분석했어요");

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
    hydrateIngredients(selectedProduct);
    setSearchStatus(
      liveResults.length ? `식약처에서 일치하는 제품 ${liveResults.length}개를 찾았어요` : "일치하는 공공데이터가 없어 검증용 제품을 보여드려요",
      liveResults.length ? "live" : "fallback",
    );
  } catch (error) {
    if (requestId !== searchRequestId) return;
    setSearchStatus("공공데이터 연결이 지연되어 검증용 제품을 보여드려요", "fallback");
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

document.querySelector("#preference-options").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-preference]");
  if (!button) return;
  currentPreference = button.dataset.preference;
  document.querySelectorAll(".preference-toggle").forEach((item) => {
    const active = item === button;
    item.classList.toggle("active", active);
    item.setAttribute("aria-pressed", String(active));
  });
  currentResults.sort((a, b) => preferenceScore(b) - preferenceScore(a));
  renderResults(currentResults);
  renderDetail(selectedProduct);
});

document.querySelector("#results-list").addEventListener("click", (event) => {
  const card = event.target.closest(".result-card");
  if (!card) return;
  selectedProduct = currentResults.find((product) => product.id === card.dataset.id) || selectedProduct;
  activeTab = "overview";
  renderResults(currentResults);
  renderDetail(selectedProduct);
  hydrateIngredients(selectedProduct);
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
