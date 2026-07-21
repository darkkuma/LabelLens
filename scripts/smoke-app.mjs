import { readFile } from "node:fs/promises";
import vm from "node:vm";

function element(value = "") {
  return {
    value,
    textContent: "",
    innerHTML: "",
    className: "",
    listeners: {},
    classList: { toggle() {} },
    setAttribute() {},
    addEventListener(type, listener) { this.listeners[type] = listener; },
  };
}

const elements = new Map([
  ["#label-input", element("원재료명: 돼지고기(국산), 부추(중국산), 향미증진제. 영양정보: 나트륨 760mg, 단백질 13g.")],
  ["#search-input", element()],
]);
const getElement = (selector) => {
  if (!elements.has(selector)) elements.set(selector, element());
  return elements.get(selector);
};
const context = vm.createContext({
  console,
  URLSearchParams,
  setTimeout,
  clearTimeout,
  globalThis: null,
  document: {
    querySelector: getElement,
    querySelectorAll: () => [],
  },
  fetch: async () => ({ ok: true, json: async () => ({ items: [] }) }),
});
context.globalThis = context;

for (const path of ["data/additives.js", "data/product-images.js", "data/products.js", "data/catalog.js", "config.js", "app.js"]) {
  vm.runInContext(await readFile(path, "utf8"), context, { filename: path });
}
await new Promise((resolve) => setTimeout(resolve, 10));

const initialCount = Number(getElement("#result-count").textContent);
if (initialCount < 10) throw new Error(`Expected at least 10 category products, received ${initialCount}`);
if (!getElement("#results-list").innerHTML.includes("score-pill")) throw new Error("Ranking cards did not render");

getElement("#search-input").value = "비비고";
getElement("#search-form").listeners.submit({ preventDefault() {} });
await new Promise((resolve) => setTimeout(resolve, 10));

const searchCount = Number(getElement("#result-count").textContent);
const resultHtml = getElement("#results-list").innerHTML;
if (searchCount < 50) throw new Error(`Expected broad local search results, received ${searchCount}`);
if (resultHtml.includes("<strong>--</strong>")) throw new Error("Found an unscored product");
if (!resultHtml.includes("데이터 충족률")) throw new Error("Partial-score coverage is missing");

console.log(`Rendered ${initialCount} category products and ${searchCount} local '비비고' results with scores.`);
