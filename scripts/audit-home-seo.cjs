const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const expected = {
  title: "今日热榜 - 全网热搜与实时热点聚合 | 吾爱热榜",
  description:
    "今日热榜聚合微博、百度、知乎、抖音、B站、头条等平台的全网热搜与实时热点。一站看全网，覆盖新闻、科技、AI、财经、文娱、游戏、体育、生活等分类，支持榜单切换与实时更新。",
  keywords:
    "今日热榜,全网热搜,实时热点,热榜聚合,微博热搜,百度热搜,知乎热榜,抖音热榜,吾爱热榜,wuaihot",
  siteName: "吾爱热榜",
  alternateName: "wuaihot",
};

const html = fs.readFileSync(path.join(__dirname, "..", "dist", "index.html"), "utf8");
const text = (pattern, label) => {
  const match = html.match(pattern);
  assert.ok(match, `${label} is missing`);
  return match[1].trim();
};

assert.equal(text(/<title>([^<]+)<\/title>/i, "title"), expected.title);
assert.equal(text(/<meta\s+name="description"\s+content="([^"]+)"/i, "description"), expected.description);
assert.equal(text(/<meta\s+name="keywords"\s+content="([^"]+)"/i, "keywords"), expected.keywords);
assert.equal(text(/<meta\s+property="og:title"\s+content="([^"]+)"/i, "og:title"), expected.title);
assert.equal(text(/<meta\s+property="og:description"\s+content="([^"]+)"/i, "og:description"), expected.description);
assert.equal(text(/<meta\s+property="og:site_name"\s+content="([^"]+)"/i, "og:site_name"), expected.siteName);
assert.equal(text(/<meta\s+name="twitter:title"\s+content="([^"]+)"/i, "twitter:title"), expected.title);
assert.equal(text(/<meta\s+name="twitter:description"\s+content="([^"]+)"/i, "twitter:description"), expected.description);

const jsonLdText = text(
  /<script\s+id="dailyhot-route-jsonld"\s+type="application\/ld\+json">([\s\S]*?)<\/script>/i,
  "homepage WebSite JSON-LD",
);
const jsonLd = JSON.parse(jsonLdText);
assert.equal(jsonLd["@type"], "WebSite");
assert.equal(jsonLd.name, expected.siteName);
assert.equal(jsonLd.alternateName, expected.alternateName);
assert.equal(jsonLd.headline, expected.title);
assert.equal(jsonLd.description, expected.description);
assert.equal(jsonLd.inLanguage, "zh-CN");
assert.ok(!html.includes("全网热点排行榜聚合、分类热榜与实时趋势追踪_吾爱分享网"));

const seoSource = fs.readFileSync(
  path.join(__dirname, "..", "src", "utils", "seo.js"),
  "utf8",
);
assert.match(seoSource, /setJsonLd\("dailyhot-route-jsonld", jsonLd\)/);
assert.doesNotMatch(seoSource, /setJsonLd\("page-schema", jsonLd\)/);
assert.match(
  seoSource,
  /locale === "zh-CN"[\s\S]{0,120}categoryMeta\?\.title[\s\S]{0,120}categoryMeta\?\.description/,
  "runtime category SEO must only use a zh-CN specialized entry when title and description both exist",
);

const contextToolbarSource = fs.readFileSync(
  path.join(__dirname, "..", "src", "components", "ContextToolbar.vue"),
  "utf8",
);
assert.match(
  contextToolbarSource,
  /<h1 class="context-breadcrumb__section context-breadcrumb__page-title">[\s\S]{0,120}\{\{ copy\.homeHeading \}\}/,
  "homepage must expose a visible semantic H1 inside the existing breadcrumb row",
);
assert.match(
  contextToolbarSource,
  /categoryPageHeading\(category\)/,
  "category pages must expose the current category as the breadcrumb H1",
);
assert.doesNotMatch(
  contextToolbarSource,
  /<span class="context-breadcrumb__section">\{\{ allCategoryLabel \}\}<\/span>/,
  "homepage breadcrumb must not fall back to the generic all label as its primary heading",
);

console.log("[home-seo-audit] homepage title, social metadata and WebSite identity are consistent");
