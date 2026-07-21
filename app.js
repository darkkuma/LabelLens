const API_BASE_URL = globalThis.LABELLENS_API_BASE_URL || "";

const legacyAdditives = {
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
    indication: "식품 사용이 허용된 첨가물입니다. MSG보다 제품의 총 나트륨과 섭취 빈도를 함께 확인하는 것이 좋습니다.",
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
    indication: "괄호 안 하위 성분을 각각 확인하세요.",
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

const additiveProfiles = globalThis.LABELLENS_ADDITIVES || Object.entries(legacyAdditives).map(([id, item]) => ({ id, aliases: [id], ...item }));
const additives = Object.fromEntries(additiveProfiles.map((item) => [item.id, item]));
const additiveWeights = { regulatory: 5, frequency: 3, specific: 1.5, info: 0.5 };
const flagOrder = { regulatory: 0, frequency: 1, specific: 2, info: 3 };
let activeGuideFlag = "all";

function normalizedIngredientText(value) {
  return String(value || "").toLowerCase().replaceAll(/\s+/g, " ");
}

function detectAdditives(value) {
  const text = normalizedIngredientText(value);
  const matched = additiveProfiles.filter((item) => {
    if (item.matchAll) {
      return item.matchAll.every((aliasGroup) => aliasGroup.some((alias) => text.includes(alias.toLowerCase())));
    }
    return (item.aliases || []).some((alias) => text.includes(alias.toLowerCase()));
  });
  const ids = new Set(matched.map((item) => item.id));
  if (ids.has("benzoate-vitamin-c")) ids.delete("benzoates");
  if (ids.has("msg")) ids.delete("flavor-enhancers");
  return [...ids].sort((a, b) => flagOrder[additives[a].flag] - flagOrder[additives[b].flag]);
}

function additiveSubscore(additiveIds) {
  const deduction = additiveIds.reduce((sum, id) => sum + (additiveWeights[additives[id]?.flag] || 1), 0);
  return Math.max(7, Math.round(20 - deduction));
}

function additiveNames(additiveIds) {
  return additiveIds.map((id) => additives[id]?.name || id);
}


const productImages = globalThis.LABELLENS_PRODUCT_IMAGES || {};
const retailerCatalog = globalThis.LABELLENS_PRODUCTS || [];
const products = retailerCatalog.map(buildVerifiedProduct);

for (const category of new Set(products.map((product) => product.category))) {
  const ranked = products.filter((product) => product.category === category).sort((a, b) => b.score - a.score);
  ranked.forEach((product, index) => {
    product.rank = index + 1;
    product.rankTotal = ranked.length;
    product.betterThan = Math.round(((ranked.length - index - 1) / ranked.length) * 100);
  });
}

const categories = [...new Set(products.map((product) => product.category))];
let selectedProduct = products[0];
let activeTab = "overview";
let currentResults = products;
let searchRequestId = 0;
let currentPreference = "balanced";
let activeCategory = "냉동만두";

function productScoreClass(score) {
  if (score >= 80) return "green";
  if (score >= 68) return "amber";
  return "blue";
}

function preferenceScore(product) {
  if (product.catalogOnly) return -1;
  if (currentPreference === "sodium") {
    const sodiumBoost = product.nutritionPer100g.sodium <= 300 ? 7 : product.nutritionPer100g.sodium >= 700 ? -8 : 0;
    return Math.max(0, Math.min(100, product.score + sodiumBoost));
  }
  if (currentPreference === "origin") return Math.max(0, Math.min(100, product.score + (product.subscores.origin - 12)));
  if (currentPreference === "additives") return Math.max(0, Math.min(100, product.score + (product.subscores.additives - 14)));
  return product.score;
}

function preferenceLabel() {
  return { balanced: "종합 추천", sodium: "나트륨 우선", origin: "중국산 표시 적게", additives: "주의 성분 적게" }[currentPreference];
}

function concernCount(product) {
  return product.additives.filter((id) => additives[id]?.flag !== "info").length;
}

function compareProducts(a, b) {
  if (currentPreference === "sodium") {
    return a.nutritionPer100g.sodium - b.nutritionPer100g.sodium || b.score - a.score;
  }
  if (currentPreference === "origin") {
    const aOrigin = originSummary(a);
    const bOrigin = originSummary(b);
    return aOrigin.china - bOrigin.china || aOrigin.unknown - bOrigin.unknown || concernCount(a) - concernCount(b) || b.score - a.score;
  }
  if (currentPreference === "additives") {
    const aWeight = a.additives.reduce((sum, id) => sum + (additiveWeights[additives[id]?.flag] || 0), 0);
    const bWeight = b.additives.reduce((sum, id) => sum + (additiveWeights[additives[id]?.flag] || 0), 0);
    return concernCount(a) - concernCount(b) || aWeight - bWeight || originSummary(a).china - originSummary(b).china || b.score - a.score;
  }
  return b.score - a.score;
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

function originSubscore(origins) {
  if (!origins.length) return 8;
  const domestic = origins.filter((item) => /국내산|국산|대한민국|Korea/i.test(item.origin)).length;
  const china = origins.filter((item) => /중국산|China/i.test(item.origin)).length;
  const unknown = origins.filter((item) => /미상|혼합|Unknown|Mixed/i.test(item.origin)).length;
  const domesticRatio = domestic / origins.length;
  return Math.max(5, Math.min(20, Math.round(12 + domesticRatio * 8 - china * 4 - unknown * 2)));
}

function buildVerifiedProduct(record) {
  const ingredients = splitIngredientText(record.ingredientText);
  const recognizedAdditives = detectAdditives(record.ingredientText);
  const nutrition = { ...record.nutrition };
  const scale = 100 / record.nutritionBasisGrams;
  const nutritionPer100g = Object.fromEntries(Object.entries(nutrition).map(([key, value]) => [key, Math.round(value * scale * 10) / 10]));
  const subscores = {
    nutrition: nutritionSubscore(nutritionPer100g),
    additives: additiveSubscore(recognizedAdditives),
    origin: originSubscore(record.origins),
    processing: record.category === "두부·콩가공품" || record.category === "즉석밥" ? 14 : record.category === "라면" ? 8 : 10,
    fit: 12,
  };
  const score = Object.values(subscores).reduce((sum, value) => sum + value, 0);
  const hasChineseOrigin = record.origins.some((item) => item.origin.includes("중국산"));
  const notes = [
    `${record.servingSize} 기준 나트륨 ${nutrition.sodium}mg, 당류 ${nutrition.sugar}g, 포화지방 ${nutrition.saturatedFat}g입니다.`,
    recognizedAdditives.length ? `표시 원재료에서 ${additiveNames(recognizedAdditives).join(", ")}을 확인했습니다.` : "등록된 성분 플래그와 일치하는 항목은 없습니다.",
  ];
  if (hasChineseOrigin) notes.push("중국산으로 표시된 원료가 있습니다.");

  return {
    ...record,
    imageUrl: productImages[record.id] || "",
    score,
    nutrition,
    nutritionPer100g,
    subscores,
    ingredients,
    additives: recognizedAdditives,
    notes,
    ingredientsStatus: "loaded",
  };
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
      "원재료·첨가물·원산지 정보는 아직 없습니다.",
    ],
    sources: [
      "식약처 식품영양성분DB 실시간 조회",
      item.reportNumber ? `품목제조보고번호: ${item.reportNumber}` : "품목제조보고번호 미표시",
      item.updatedAt ? `식약처 데이터 갱신일: ${item.updatedAt}` : "갱신일 미표시",
    ],
  };
}

async function fetchPublicProducts(query) {
  if (!API_BASE_URL || query.trim().length < 2 || categories.includes(query.trim())) return [];
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
  if (!product || product.catalogOnly || product.ingredientsStatus === "loading" || product.ingredientsStatus === "loaded") return;
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
    product.additives = detectAdditives(ingredientText);
    product.ingredientsStatus = "loaded";
    product.ingredientRecord = record;
    product.subscores.additives = additiveSubscore(product.additives);
    product.score = Object.values(product.subscores).reduce((sum, value) => sum + value, 0);
    const source = `식품안전나라 C002 원재료 기록${record.reportNumber ? ` · ${record.reportNumber}` : ""}`;
    if (!product.sources.includes(source)) product.sources.unshift(source);
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
  const categoryResult = results.length && results.every((product) => product.category === results[0].category);
  document.querySelector("#results-title").textContent = categoryResult ? `${results[0].category} 랭킹` : "검색 결과 랭킹";
  const list = document.querySelector("#results-list");
  list.innerHTML = results
    .map((product, index) => {
      const origin = originSummary(product);
      const productConcernCount = concernCount(product);
      const rank = index + 1;
      return `
        <button class="result-card ${product.id === selectedProduct.id ? "active" : ""}" data-id="${product.id}">
          <span class="result-rank ${rank <= 3 ? "top" : ""}"><strong>${rank}</strong><small>위</small></span>
          ${product.imageUrl ? `<img class="result-image" src="${product.imageUrl}" alt="${product.name}" loading="lazy" />` : `<span class="result-image placeholder">${product.category.slice(0, 1)}</span>`}
          <div class="result-copy">
            <p class="result-brand">${product.brand} · ${product.category}</p>
            <h3>${product.name}</h3>
            <div class="result-signals">
              <span class="signal ${productConcernCount ? "caution" : "good"}">주의 플래그 ${productConcernCount}</span>
              <span class="signal ${origin.china ? "caution" : "good"}">중국산 표시 ${origin.china}건</span>
            </div>
            <p class="result-why">${productConcernCount === 0 ? "주의 성분 플래그가 적어요" : `${additiveNames(product.additives.filter((id) => additives[id]?.flag !== "info")).slice(0, 2).join(", ")} 확인`}</p>
          </div>
          <span class="score-pill ${product.catalogOnly ? "pending" : ""}"><strong>${product.catalogOnly ? "--" : preferenceScore(product)}</strong><small>점</small></span>
        </button>
      `;
    })
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
    ["첨가물", s.additives, 20, "첨가물 수와 주의 성분"],
    ["원산지 표시", s.origin, 20, "주원료의 원산지 표시 비율"],
    ["가공도", s.processing, 15, "원형 원료와 복합 원료 비중"],
    ["개인 적합도", s.fit, 15, "알레르기·식단·관심 기준"],
  ];
}

function categoryRanking(product) {
  return products
    .filter((candidate) => candidate.category === product.category)
    .sort(compareProducts);
}

function renderDetail(product) {
  if (product.catalogOnly) {
    renderCatalogDetail(product);
    return;
  }
  const origin = originSummary(product);
  const shownScore = preferenceScore(product);
  const tabs = [
    ["overview", "한눈에 보기"],
    ["ingredients", "원재료·첨가물"],
    ["origin", "원산지"],
    ["ranking", "같은 종류 비교"],
  ];

  document.querySelector("#product-detail").innerHTML = `
    <article>
      <header class="product-header">
        <div class="product-image-wrap">
          ${product.imageUrl ? `<img src="${product.imageUrl}" alt="${product.name}" />` : `<span>${product.category.slice(0, 1)}</span>`}
          <div class="product-score"><strong>${shownScore}</strong><small>점</small></div>
        </div>
        <div class="product-title">
          <p class="section-kicker">${product.brand} · ${product.category}</p>
          <h2>${product.name}</h2>
          <p>${product.provisional ? `${product.servingSize} 기준 영양정보` : `${product.category} ${categoryRanking(product).findIndex((item) => item.id === product.id) + 1}위 · ${preferenceLabel()}`}</p>
          <div class="badges">
            <span class="badge ${productScoreClass(shownScore)}">${shownScore >= 80 ? "비교군 상위권" : shownScore >= 68 ? "무난한 선택" : "꼼꼼히 확인"}</span>
            <span class="badge blue">국산 표시 ${origin.domestic}%</span>
            <span class="badge amber">${product.provisional ? "원재료 확인 중" : `인식된 첨가물 ${product.additives.length}개`}</span>
          </div>
          <div class="retailer-links">
            ${(product.retailers || []).map((retailer) => `<a href="${retailerUrl(product, retailer)}" target="_blank" rel="noopener">${retailer}에서 보기</a>`).join("")}
            ${product.labelUrl ? `<a href="${product.labelUrl}" target="_blank" rel="noopener">제품 라벨 보기</a>` : ""}
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

function retailerUrl(product, retailer) {
  if (retailer === "컬리" && product.retailerId) return `https://www.kurly.com/goods/${product.retailerId}`;
  if (retailer === "쿠팡") return `https://www.coupang.com/np/search?q=${encodeURIComponent(product.name)}`;
  return `https://www.ssg.com/search.ssg?target=all&query=${encodeURIComponent(product.name)}`;
}

function renderCatalogDetail(product) {
  document.querySelector("#product-detail").innerHTML = `
    <article>
      <header class="product-header catalog-header">
        <div class="product-monogram" aria-hidden="true">${product.category.slice(0, 1)}</div>
        <div class="product-title">
          <p class="section-kicker">${product.brand} · ${product.category}</p>
          <h2>${product.name}</h2>
          <div class="badges">
            ${product.retailers.map((retailer) => `<span class="badge blue">${retailer}</span>`).join("")}
            ${product.rank ? `<span class="badge green">검색 상위 ${product.rank}위</span>` : ""}
          </div>
        </div>
      </header>
      <div class="catalog-grid">
        <section>
          <span>판매처</span>
          <div class="retailer-links">
            ${product.retailers.map((retailer) => `<a href="${retailerUrl(product, retailer)}" target="_blank" rel="noopener">${retailer}에서 보기</a>`).join("")}
          </div>
        </section>
        <section>
          <span>제품 정보</span>
          <strong>라벨 데이터 없음</strong>
          <a class="text-link" href="#label-title">원재료명 직접 분석</a>
        </section>
        <section>
          <span>확인일</span>
          <strong>${product.observedAt.replaceAll("-", ".")}</strong>
        </section>
      </div>
    </article>
  `;
}

function renderCategoryPicks() {
  const counts = retailerCatalog.reduce((result, item) => {
    result[item.category] = (result[item.category] || 0) + 1;
    return result;
  }, {});
  document.querySelector("#category-picks").innerHTML = Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ko"))
    .map(([category, count]) => `<button type="button" class="${category === activeCategory ? "active" : ""}" data-category="${category}" aria-pressed="${category === activeCategory}">${category}<span>${count}</span></button>`)
    .join("");
}

function renderTab(product) {
  if (activeTab === "ingredients") return renderIngredients(product);
  if (activeTab === "origin") return renderOrigin(product);
  if (activeTab === "ranking") return renderRanking(product);
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
      <h3>확인할 점</h3>
      <p>${product.notes.join(" ")}</p>
    </div>
  `;
}

function renderIngredients(product) {
  if (product.ingredientsStatus === "loading" && product.provisional) {
    return `<div class="callout"><h3>원재료를 불러오는 중이에요</h3></div>`;
  }
  if (product.ingredientsStatus === "error" && product.provisional) {
    return `<div class="callout"><h3>원재료 정보가 없어요</h3><p>영양정보는 확인할 수 있습니다.</p></div>`;
  }
  if (product.provisional && !product.additives.length) {
    const message = product.ingredientsStatus === "loaded"
      ? "표시된 원재료에서 등록된 첨가물 명칭을 찾지 못했어요."
      : "이 제품의 원재료 정보는 아직 없어요.";
    return `<div class="callout"><h3>${product.ingredientsStatus === "loaded" ? "확인된 첨가물 없음" : "원재료 정보 없음"}</h3><p>${message}</p></div>`;
  }
  return `
    ${product.ingredientsStatus === "loaded" ? `<div class="ingredient-summary"><strong>표시 원재료</strong><p>${product.ingredients.slice(0, 24).join(", ")}${product.ingredients.length > 24 ? "..." : ""}</p></div>` : ""}
    <div class="ingredient-list">
      ${product.additives
        .map((key) => {
          const item = additives[key] || {
            name: key,
            english: "원재료 또는 첨가물",
            purpose: "정확한 라벨 맥락에서 기능을 확인해야 합니다.",
            indication: "구체적인 성분명과 함량을 확인하세요.",
            evidence: "근거 미확인",
            flag: "info",
            flagLabel: "정보",
            forWhom: "구체적인 성분명과 함량을 확인하세요.",
            sources: [],
          };
          return `
            <div class="ingredient-card">
              <div>
                <div class="ingredient-title">
                  <h3>${item.name} <span class="badge">${item.english}</span></h3>
                  <span class="flag-badge ${item.flag}">${item.flagLabel}</span>
                </div>
                <p><strong>왜 넣나요:</strong> ${item.purpose}</p>
                <p><strong>무엇을 알아야 하나요:</strong> ${item.summary || item.indication}</p>
                <p><strong>누가 확인하나요:</strong> ${item.forWhom}</p>
                <div class="evidence-links">
                  ${(item.sources || []).map((source) => `<a href="${source.url}" target="_blank" rel="noopener">${source.label}</a>`).join("")}
                </div>
              </div>
              <div class="attention ${item.flag}">
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
    return `<div class="callout"><h3>원산지 정보가 없어요</h3></div>`;
  }
  return `
    <div class="metric-grid">
      <div class="metric-card"><span>국산 표시 비율</span><strong>${origin.domestic}%</strong><p>원산지가 표시된 원료 중 국산 표기</p></div>
      <div class="metric-card"><span>중국산 표시</span><strong>${origin.china}건</strong><p>중국산으로 표시된 원료</p></div>
      <div class="metric-card"><span>미상·혼합</span><strong>${origin.unknown}%</strong><p>묶음·혼합 또는 세부 원산지 누락</p></div>
      <div class="metric-card"><span>원산지 명확성</span><strong>${product.subscores.origin}/20</strong><p>주원료가 얼마나 구체적으로 표시됐는지</p></div>
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
    return `<div class="callout"><h3>같은 종류의 비교 제품이 아직 부족해요</h3></div>`;
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
                <p>${candidate.brand} · 100g당 나트륨 ${candidate.nutritionPer100g.sodium}mg · 인식 첨가물 ${candidate.additives.length}개</p>
              </div>
              <strong>${preferenceScore(candidate)}</strong>
            </div>
          `,
        )
        .join("")}
    </div>
  `;
}

function analyzeLabelText() {
  const text = document.querySelector("#label-input").value;
  const additiveHits = detectAdditives(text);
  const priorityHits = additiveHits.filter((id) => additives[id].flag !== "info");
  const chinaHits = (text.match(/중국산/g) || []).length;
  const domesticHits = (text.match(/(?<![가-힣])(?:국내산|국산)/g) || []).length;
  const sodium = text.match(/나트륨\s*(\d+)mg/);
  const protein = text.match(/단백질\s*(\d+)g/);
  const clarity = Math.max(44, Math.min(92, 68 + domesticHits * 5 - chinaHits * 4 - (text.includes("혼합") ? 8 : 0)));

  document.querySelector("#label-analysis").innerHTML = `
    <div class="metric-card"><span>확인할 성분</span><strong>${priorityHits.length}개</strong><p>${additiveNames(priorityHits).join(", ") || "추가 주의 플래그 없음"}</p></div>
    <div class="metric-card"><span>원산지 명확성</span><strong>${clarity}/100</strong><p>국산 ${domesticHits}건 · 중국산 ${chinaHits}건 · 혼합 표기 확인</p></div>
    <div class="metric-card"><span>나트륨</span><strong>${sodium ? sodium[1] + "mg" : "미인식"}</strong><p>${sodium ? "영양정보에서 확인" : "수치를 찾지 못함"}</p></div>
    <div class="metric-card"><span>단백질</span><strong>${protein ? protein[1] + "g" : "미인식"}</strong><p>${protein ? "영양정보에서 확인" : "수치를 찾지 못함"}</p></div>
  `;
}

function renderIngredientGuide() {
  const filters = [
    ["all", "전체"],
    ["regulatory", "규제 확인"],
    ["frequency", "섭취 빈도"],
    ["specific", "특정인"],
    ["info", "정보"],
  ];
  document.querySelector("#guide-filters").innerHTML = filters
    .map(([id, label]) => `<button type="button" class="guide-filter ${activeGuideFlag === id ? "active" : ""}" data-flag="${id}" aria-pressed="${activeGuideFlag === id}">${label}</button>`)
    .join("");

  const visible = additiveProfiles
    .filter((item) => activeGuideFlag === "all" || item.flag === activeGuideFlag)
    .sort((a, b) => flagOrder[a.flag] - flagOrder[b.flag] || a.name.localeCompare(b.name, "ko"));
  document.querySelector("#ingredient-guide-list").innerHTML = visible
    .map(
      (item) => `
        <article class="guide-item">
          <div class="guide-item-heading">
            <div><h3>${item.name}</h3><p>${item.english}</p></div>
            <span class="flag-badge ${item.flag}">${item.flagLabel}</span>
          </div>
          <p>${item.summary}</p>
          <p class="guide-audience"><strong>확인 대상</strong> ${item.forWhom}</p>
          <div class="evidence-links">
            ${item.sources.map((source) => `<a href="${source.url}" target="_blank" rel="noopener">${source.label}</a>`).join("")}
          </div>
        </article>
      `,
    )
    .join("");
}

async function runSearch(query) {
  const requestId = ++searchRequestId;
  const localResults = searchProducts(query);
  currentResults = [...(localResults.length ? localResults : products)].sort(compareProducts);
  selectedProduct = currentResults[0];
  activeTab = "overview";
  renderResults(currentResults);
  renderDetail(selectedProduct);
  setSearchStatus(API_BASE_URL ? "제품 정보를 찾고 있어요..." : "추천 제품에서 검색했어요");

  try {
    const liveResults = await fetchPublicProducts(query);
    if (requestId !== searchRequestId) return;
    liveResults.forEach((product) => {
      const existingIndex = products.findIndex((candidate) => candidate.id === product.id);
      if (existingIndex >= 0) products[existingIndex] = product;
      else products.push(product);
    });
    currentResults = [...localResults, ...liveResults].filter(
      (product, index, list) => list.findIndex((candidate) => candidate.id === product.id) === index,
    ).sort(compareProducts);
    if (!currentResults.length) currentResults = products;
    selectedProduct = currentResults[0];
    renderResults(currentResults);
    renderDetail(selectedProduct);
    hydrateIngredients(selectedProduct);
    setSearchStatus(
      liveResults.length ? `일치하는 제품 ${liveResults.length}개를 찾았어요` : "검색 결과가 없어 추천 제품을 보여드려요",
      liveResults.length ? "live" : "fallback",
    );
  } catch (error) {
    if (requestId !== searchRequestId) return;
    setSearchStatus("검색이 지연되어 추천 제품을 보여드려요", "fallback");
  }
}

document.querySelector("#search-form").addEventListener("submit", (event) => {
  event.preventDefault();
  runSearch(document.querySelector("#search-input").value);
});

document.querySelector(".quick-picks").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-query]");
  if (!button) return;
  const query = button.dataset.query;
  if (categories.includes(query)) {
    activeCategory = query;
    renderCategoryPicks();
  }
  document.querySelector("#search-input").value = "";
  runSearch(query);
});

document.querySelector("#category-picks").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-category]");
  if (!button) return;
  activeCategory = button.dataset.category;
  document.querySelector("#search-input").value = "";
  renderCategoryPicks();
  runSearch(activeCategory);
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
  currentResults.sort(compareProducts);
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

document.querySelector("#guide-filters").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-flag]");
  if (!button) return;
  activeGuideFlag = button.dataset.flag;
  renderIngredientGuide();
});

renderCategoryPicks();
renderIngredientGuide();
runSearch(activeCategory);
analyzeLabelText();
