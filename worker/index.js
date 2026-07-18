const MFDS_ENDPOINT = "https://apis.data.go.kr/1471000/FoodNtrCpntDbInfo02/getFoodNtrCpntDbInq02";
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

function normalizeItem(item) {
  return {
    foodCode: item.FOOD_CD || "",
    name: item.FOOD_NM_KR || "",
    maker: item.MAKER_NM || "",
    category: item.FOOD_CAT4_NM || item.FOOD_CAT3_NM || item.FOOD_CAT2_NM || item.FOOD_CAT1_NM || "",
    origin: item.NATION_NM || item.ORIGIN_NM || "",
    servingSize: item.SERVING_SIZE || "",
    calories: item.AMT_NUM1 || "",
    protein: item.AMT_NUM3 || "",
    fat: item.AMT_NUM4 || "",
    carbohydrates: item.AMT_NUM6 || "",
    sugar: item.AMT_NUM7 || "",
    sodium: item.AMT_NUM13 || "",
    saturatedFat: item.AMT_NUM24 || "",
    reportNumber: item.ITEM_REPORT_NO || "",
    imported: item.IMP_YN || item.IMPORT_YN || "",
    updatedAt: item.UPDATE_DATE || item.RESEARCH_YMD || "",
  };
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }

    const url = new URL(request.url);
    if (url.pathname === "/health") {
      return jsonResponse(request, { ok: true, service: "LabelLens MFDS proxy" });
    }

    if (url.pathname !== "/api/nutrition" || request.method !== "GET") {
      return jsonResponse(request, { error: "Not found" }, 404);
    }

    const query = (url.searchParams.get("q") || "").trim();
    if (query.length < 2 || query.length > 80) {
      return jsonResponse(request, { error: "Search query must be between 2 and 80 characters." }, 400);
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
