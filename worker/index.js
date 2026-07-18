const MFDS_ENDPOINT = "https://apis.data.go.kr/1471000/FoodNtrCpntDbInfo02/getFoodNtrCpntDbInq02";
const FOODSAFETY_ENDPOINT = "http://openapi.foodsafetykorea.go.kr/api";
const ALLOWED_ORIGINS = new Set(["https://darkkuma.github.io"]);

function corsHeaders(request) {
  const origin = request.headers.get("Origin") || "";
  const localOrigin = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.has(origin) || localOrigin ? origin : "https://darkkuma.github.io",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "public, max-age=300",
    Vary: "Origin",
  };
}

function jsonResponse(request, payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders(request) },
  });
}

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function cleanText(value) {
  return String(value || "").replace(/[<>&]/g, " ").trim();
}

function normalizeItem(item) {
  return {
    foodCode: cleanText(item.FOOD_CD),
    name: cleanText(item.FOOD_NM_KR),
    maker: cleanText(item.MAKER_NM),
    category: cleanText(item.FOOD_CAT4_NM || item.FOOD_CAT3_NM || item.FOOD_CAT2_NM || item.FOOD_CAT1_NM),
    origin: cleanText(item.NATION_NM || item.ORIGIN_NM),
    servingSize: cleanText(item.SERVING_SIZE),
    calories: item.AMT_NUM1 || "",
    protein: item.AMT_NUM3 || "",
    fat: item.AMT_NUM4 || "",
    carbohydrates: item.AMT_NUM6 || "",
    sugar: item.AMT_NUM7 || "",
    sodium: item.AMT_NUM13 || "",
    saturatedFat: item.AMT_NUM24 || "",
    reportNumber: cleanText(item.ITEM_REPORT_NO),
    imported: cleanText(item.IMP_YN || item.IMPORT_YN),
    updatedAt: cleanText(item.UPDATE_DATE || item.RESEARCH_YMD),
  };
}

function normalizeIngredientRows(rows) {
  const groups = new Map();
  for (const row of rows) {
    const reportNumber = cleanText(row.PRDLST_REPORT_NO);
    const name = cleanText(row.PRDLST_NM);
    const maker = cleanText(row.BSSH_NM);
    const key = reportNumber || `${name}::${maker}`;
    if (!groups.has(key)) {
      groups.set(key, {
        name,
        maker,
        reportNumber,
        productType: cleanText(row.PRDLST_DCNM),
        reportedAt: cleanText(row.PRMS_DT),
        changedAt: cleanText(row.CHNG_DT),
        rawMaterials: [],
      });
    }
    const group = groups.get(key);
    const material = cleanText(row.RAWMTRL_NM);
    if (material) {
      group.rawMaterials.push({ name: material, order: Number(row.RAWMTRL_ORDNO || 9999) });
    }
    if (cleanText(row.CHNG_DT) > group.changedAt) group.changedAt = cleanText(row.CHNG_DT);
  }

  return [...groups.values()].map((group) => {
    group.rawMaterials.sort((a, b) => a.order - b.order);
    const materials = [...new Set(group.rawMaterials.map((item) => item.name))];
    return { ...group, ingredientText: materials.join(", "), rawMaterials: materials };
  });
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }

    const url = new URL(request.url);
    if (url.pathname === "/health") {
      return jsonResponse(request, { ok: true, service: "LabelLens public-food-data proxy" });
    }

    if (request.method !== "GET" || !["/api/nutrition", "/api/ingredients"].includes(url.pathname)) {
      return jsonResponse(request, { error: "Not found" }, 404);
    }

    const query = (url.searchParams.get("q") || "").trim();
    if (query.length < 2 || query.length > 80) {
      return jsonResponse(request, { error: "Search query must be between 2 and 80 characters." }, 400);
    }
    if (url.pathname === "/api/ingredients") {
      if (!env.FOODSAFETY_KOREA_API_KEY) {
        return jsonResponse(request, { error: "Food Safety Korea service key is not configured." }, 503);
      }
      const reportNumber = (url.searchParams.get("reportNumber") || "").trim();
      const filterName = reportNumber && !reportNumber.includes("/") ? "PRDLST_REPORT_NO" : "PRDLST_NM";
      const filterValue = filterName === "PRDLST_REPORT_NO" ? reportNumber : query;
      const upstreamUrl = `${FOODSAFETY_ENDPOINT}/${encodeURIComponent(env.FOODSAFETY_KOREA_API_KEY)}/C002/json/1/100/${filterName}=${encodeURIComponent(filterValue)}`;

      try {
        const upstream = await fetch(upstreamUrl, { headers: { Accept: "application/json" } });
        const payload = await upstream.json();
        const service = payload?.C002 || {};
        const resultCode = cleanText(service?.RESULT?.CODE);
        if (!upstream.ok || (resultCode && resultCode !== "INFO-000")) {
          return jsonResponse(
            request,
            { error: cleanText(service?.RESULT?.MSG) || "C002 ingredient lookup failed", code: resultCode || String(upstream.status) },
            502,
          );
        }
        const items = normalizeIngredientRows(asArray(service.row));
        return jsonResponse(request, { items, totalCount: Number(service.total_count || items.length) });
      } catch (error) {
        return jsonResponse(request, { error: "Food Safety Korea C002 service is temporarily unavailable." }, 502);
      }
    }

    if (!env.DATA_GO_KR_SERVICE_KEY) {
      return jsonResponse(request, { error: "MFDS service key is not configured." }, 503);
    }

    const upstreamUrl = new URL(MFDS_ENDPOINT);
    upstreamUrl.searchParams.set("serviceKey", env.DATA_GO_KR_SERVICE_KEY);
    upstreamUrl.searchParams.set("type", "json");
    upstreamUrl.searchParams.set("pageNo", "1");
    upstreamUrl.searchParams.set("numOfRows", "10");
    upstreamUrl.searchParams.set("FOOD_NM_KR", query);

    try {
      const upstream = await fetch(upstreamUrl, { headers: { Accept: "application/json" } });
      const payload = await upstream.json();
      const resultCode = String(payload?.header?.resultCode || "");
      if (!upstream.ok || (resultCode && resultCode !== "00")) {
        return jsonResponse(
          request,
          { error: payload?.header?.resultMsg || "MFDS lookup failed", code: resultCode || String(upstream.status) },
          502,
        );
      }

      const rawItems = Array.isArray(payload?.body?.items) ? payload.body.items : payload?.body?.items?.item;
      const items = asArray(rawItems).map(normalizeItem).filter((item) => item.name);
      return jsonResponse(request, { items, totalCount: Number(payload?.body?.totalCount || items.length) });
    } catch (error) {
      return jsonResponse(request, { error: "MFDS service is temporarily unavailable." }, 502);
    }
  },
};
