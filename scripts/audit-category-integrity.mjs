import assert from "node:assert/strict";
import fs from "node:fs";
import { createPinia, setActivePinia } from "pinia";
import { createServer } from "vite";

const memory = new Map();
globalThis.localStorage = {
  getItem: (key) => (memory.has(key) ? memory.get(key) : null),
  setItem: (key, value) => memory.set(key, String(value)),
  removeItem: (key) => memory.delete(key),
  clear: () => memory.clear(),
  key: (index) => [...memory.keys()][index] || null,
  get length() { return memory.size; },
};

const vite = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
  logLevel: "silent",
});

try {
  const { mainStore } = await vite.ssrLoadModule("/src/store/index.js");
  const { applyTrendsSourceCatalog } = await vite.ssrLoadModule("/src/utils/sourceSubtypes.js");
  const { getCanonicalCategorySlug, getCategoryNameBySlug } = await vite.ssrLoadModule("/src/utils/locale.js");
  const catalogFixture = {
    sources: [
      { key: "apple-music", name: "Apple Music", category: "culture", priorityTier: "A", rankingLabel: "热门歌曲排行", defaultVariant: "songs", publicAvailable: false, displayAvailable: true, variantGroups: [] },
      { key: "ximalaya-rankings", name: "喜马拉雅排行榜", category: "culture", priorityTier: "A", rankingLabel: "全站 · 热播", defaultVariant: "classic-all-hot", publicAvailable: false, displayAvailable: true, variantGroups: [] },
      { key: "apple-podcasts", name: "Apple Podcasts", category: "culture", priorityTier: "A", rankingLabel: "所有类别 · 热门节目", defaultVariant: "shows", publicAvailable: false, displayAvailable: true, variantGroups: [] },
      { key: "china-film-boxoffice", name: "中国电影票房", category: "culture", priorityTier: "A", rankingLabel: "当日实时票房榜", defaultVariant: "realtime", publicAvailable: false, displayAvailable: true, variantGroups: [] },
      { key: "hongguo-rank", name: "红果短剧", category: "culture", priorityTier: "A", rankingLabel: "红果热播榜", defaultVariant: "hot", publicAvailable: false, displayAvailable: true, variantGroups: [] },
      { key: "hotbook-discovery", name: "热书发现", category: "culture", priorityTier: "A", rankingLabel: "高校文学借阅榜", defaultVariant: "literature", publicAvailable: false, displayAvailable: true, variantGroups: [] },
      { key: "sonkwo-deals", name: "杉果", category: "culture", priorityTier: "A", rankingLabel: "热门优惠", defaultVariant: "popular", publicAvailable: false, displayAvailable: true, variantGroups: [] },
      { key: "steam", name: "Steam", category: "culture", priorityTier: "A", rankingLabel: "全球畅销榜", defaultVariant: "topselling", publicAvailable: false, displayAvailable: false, variantGroups: [] },
      { key: "ggdeals", name: "GG.deals", category: "culture", priorityTier: "B", rankingLabel: "免费游戏", defaultVariant: "freebies", publicAvailable: false, displayAvailable: false, variantGroups: [] },
    ],
  };
  applyTrendsSourceCatalog(catalogFixture);
  setActivePinia(createPinia());
  const store = mainStore();
  store.ensureNewsList();
  assert.equal(
    store.defaultNewsArr.some((item) => item.name === "ggdeals"),
    false,
    "Directory-known sources without Public/Display admission must not bypass Catalog through static defaults",
  );
  assert.equal(store.newsArr.some((item) => item.name === "ggdeals"), false);
  store.newsArr.push({
    name: "steam-deals",
    label: "Steam 特惠",
    show: true,
    order: 52.1,
    subtype: "featured",
  });
  store.syncTrendsCatalogSources();
  assert.equal(
    store.newsArr.some((item) => item.name === "steam-deals"),
    false,
    "legacy Steam deals must inherit the closed canonical Steam Catalog authority",
  );
  assert.equal(store.newsArr.some((item) => item.name === "steam"), false);

  const readableCatalog = structuredClone(catalogFixture);
  const readableSteam = readableCatalog.sources.find((item) => item.key === "steam");
  readableSteam.displayAvailable = true;
  applyTrendsSourceCatalog(readableCatalog);
  store.syncTrendsCatalogSources();
  const legacySteamMigrated = store.dedupeNewsList([
    ...store.newsArr,
    {
      name: "steam-deals",
      label: "Steam 特惠",
      show: true,
      order: 52.1,
      subtype: "featured",
    },
  ]);
  assert.equal(
    legacySteamMigrated.filter((item) => item.name === "steam").length,
    1,
  );
  assert.equal(
    legacySteamMigrated.some((item) => item.name === "steam-deals"),
    false,
  );
  assert.deepEqual(
    legacySteamMigrated.find((item) => item.name === "steam")?.categoryIds,
    ["games-deals", "life-deals"],
  );
  store.newsArr = legacySteamMigrated;
  assert.equal(store.defaultNewsArr.some((item) => item.name === "douban-wool"), false);
  assert.equal(store.defaultNewsArr.some((item) => item.name === "douban-pet-wool"), false);
  const legacyDoubanMigrated = store.dedupeNewsList([
    ...store.newsArr,
    { name: "douban-wool", label: "豆瓣羊毛", show: true, order: 51.9, subtype: "buy" },
    { name: "douban-pet-wool", label: "豆瓣宠物羊毛", show: true, order: 51.95, subtype: "catlife" },
  ]);
  assert.equal(legacyDoubanMigrated.filter((item) => item.name === "douban-group").length, 1);
  assert.equal(legacyDoubanMigrated.some((item) => item.name === "douban-wool"), false);
  assert.equal(legacyDoubanMigrated.some((item) => item.name === "douban-pet-wool"), false);
  store.categories.push(
    { id: "old-general-v0", name: "综合旧版", slug: "general", parentId: null, order: 0.25, builtin: false },
    { id: "custom-topic-a", name: "自定义热点", slug: "custom-hot", parentId: null, order: 98, builtin: false },
    { id: "custom-topic-b", name: "旧自定义热点", slug: "custom-hot", parentId: null, order: 99, builtin: false },
    { id: "custom-child", name: "旧子类", slug: "legacy-child", parentId: "custom-topic-b", order: 100, builtin: false },
  );
  const kuaishou = store.newsArr.find((item) => item.name === "kuaishou");
  kuaishou.categoryIds = ["old-general-v0", "custom-topic-b", "custom-child"];
  store.categoryViewModes = {
    "old-general-v0": "stream",
    "custom-topic-b": "stream",
    "custom-child": "card",
  };
  store.activeCategory = "综合旧版";
  store.ensureBuiltinCategories();

  const duplicates = (key) => {
    const counts = new Map();
    store.categories.forEach((item) => {
      const value = String(item?.[key] || "");
      if (value) counts.set(value, (counts.get(value) || 0) + 1);
    });
    return [...counts].filter(([, count]) => count > 1);
  };
  assert.deepEqual(duplicates("id"), []);
  assert.deepEqual(duplicates("name"), []);
  assert.deepEqual(duplicates("slug"), []);
  assert.equal(store.activeCategory, "综合");
  const migratedKuaishou = store.newsArr.find((item) => item.name === "kuaishou");
  assert.deepEqual(migratedKuaishou.categoryIds, ["general", "custom-topic-a", "custom-child"]);
  assert.equal(store.categories.find((item) => item.id === "custom-child")?.parentId, "custom-topic-a");
  assert.deepEqual(store.categoryViewModes, {
    general: "stream",
    "custom-topic-a": "stream",
    "custom-child": "card",
  });
  assert.equal(store.renameCategory("custom-child", "自定义热点"), false);
  assert.equal(store.categories.find((item) => item.id === "custom-child")?.name, "旧子类");

  store.categories = store.categories.filter(
    (item) => !String(item.id).startsWith("entertainment"),
  );
  store.categories.push(
    { id: "media", name: "影音娱乐", slug: "media", parentId: null, order: 20, builtin: true },
    { id: "media-music", name: "音乐音频", slug: "music-audio", parentId: "media", order: 21, builtin: true },
    { id: "media-video", name: "影视综艺", slug: "film-tv", parentId: "media", order: 22, builtin: true },
    { id: "media-reading", name: "小说漫画", slug: "books-comics", parentId: "media", order: 23, builtin: true },
  );
  for (const [sourceName, categoryIds] of [
    ["apple-music", ["media-music"]],
    ["ximalaya-rankings", ["media-music"]],
    ["apple-podcasts", ["media-music"]],
    ["china-film-boxoffice", ["media-video"]],
    ["hongguo-rank", ["media-video"]],
    ["hotbook-discovery", ["media-reading"]],
  ]) {
    const item = store.newsArr.find((source) => source.name === sourceName);
    if (item) item.categoryIds = categoryIds;
  }
  store.activeCategory = "影音娱乐";
  store.categoryViewModes.media = "card";
  store.ensureNewsList();

  assert.equal(store.activeCategory, "文娱");
  assert.equal(store.categoryViewModes.entertainment, "card");
  assert.equal(store.categoryViewModes.media, undefined);
  assert.equal(store.categories.some((item) => String(item.id).startsWith("media")), false);
  assert.equal(getCanonicalCategorySlug("media"), "entertainment");
  assert.equal(getCanonicalCategorySlug("music-audio"), "music");
  assert.equal(getCanonicalCategorySlug("books-comics"), "reading");
  assert.equal(getCategoryNameBySlug("media"), "文娱");

  assert.equal(store.categories.find((item) => item.id === "entertainment")?.name, "文娱");
  assert.equal(
    store.categories.find((item) => item.id === "entertainment-music")?.parentId,
    "entertainment",
  );
  assert.equal(
    store.categories.find((item) => item.id === "entertainment-audio")?.parentId,
    "entertainment",
  );
  assert.equal(
    store.categories.find((item) => item.id === "entertainment-video")?.parentId,
    "entertainment",
  );
  assert.equal(
    store.categories.find((item) => item.id === "entertainment-reading")?.parentId,
    "entertainment",
  );
  assert.equal(
    store.categories.find((item) => item.id === "entertainment-audio-podcasts")?.parentId,
    "entertainment-audio",
  );
  assert.equal(
    store.categories.find((item) => item.id === "entertainment-reading-novels")?.parentId,
    "entertainment-reading",
  );
  assert.equal(store.categories.some((item) => String(item.id).startsWith("media")), false);

  const taxonomy = JSON.parse(
    fs.readFileSync("docs/engineering/hotlist-taxonomy-v3-tree.json", "utf8"),
  );
  assert.equal(taxonomy.version, 3);
  assert.equal(taxonomy.status, "production-canonical");
  assert.equal(taxonomy.maxDepth, 3);
  assert.equal(store.categories.some((item) => item.id === "wool"), false);
  assert.equal(
    store.categories.find((item) => item.id === "general")?.navigation,
    false,
  );
  assert.equal(
    store.categories.find((item) => item.id === "life-deals")?.parentId,
    "life",
  );
  assert.equal(
    store.categories.find((item) => item.id === "sports-general")?.parentId,
    "sports",
  );
  assert.equal(
    store.categories.find((item) => item.id === "tech-developer-security")?.parentId,
    "tech-developer",
  );
  const taxonomyEntertainment = taxonomy.nodes
    .filter((item) => String(item.id).startsWith("entertainment"))
    .map(({ id, name, parentId = null }) => ({ id, name, parentId }))
    .sort((left, right) => left.id.localeCompare(right.id));
  const runtimeEntertainment = store.categories
    .filter((item) => String(item.id).startsWith("entertainment"))
    .map(({ id, name, parentId = null }) => ({ id, name, parentId }))
    .sort((left, right) => left.id.localeCompare(right.id));
  assert.deepEqual(runtimeEntertainment, taxonomyEntertainment);

  assert.deepEqual(
    store.newsArr.find((item) => item.name === "apple-music")?.categoryIds,
    [
      "entertainment-music-songs",
      "entertainment-music-albums",
      "entertainment-music-playlists",
    ],
  );
  assert.deepEqual(
    store.newsArr.find((item) => item.name === "ximalaya-rankings")?.categoryIds,
    ["entertainment-audio"],
  );
  assert.deepEqual(
    store.newsArr.find((item) => item.name === "apple-podcasts")?.categoryIds,
    ["entertainment-audio-podcasts"],
  );
  assert.deepEqual(
    store.newsArr.find((item) => item.name === "china-film-boxoffice")?.categoryIds,
    ["entertainment-video-movie"],
  );
  assert.deepEqual(
    store.newsArr.find((item) => item.name === "hongguo-rank")?.categoryIds,
    ["entertainment-video-shortdrama"],
  );
  assert.deepEqual(
    store.newsArr.find((item) => item.name === "hotbook-discovery")?.categoryIds,
    ["entertainment-reading-books"],
  );
  assert.deepEqual(
    store.newsArr.find((item) => item.name === "smzdm")?.categoryIds,
    ["life-deals"],
  );
  assert.deepEqual(
    store.newsArr.find((item) => item.name === "steam")?.categoryIds,
    ["games-deals", "life-deals"],
  );
  assert.deepEqual(
    store.newsArr.find((item) => item.name === "sonkwo-deals")?.categoryIds,
    ["games-deals", "life-deals"],
  );
  assert.deepEqual(
    store.newsArr.find((item) => item.name === "miyoushe")?.categoryIds,
    ["games-community"],
  );
  assert.deepEqual(
    store.newsArr.find((item) => item.name === "v2ex")?.categoryIds,
    ["community-tech", "tech-developer"],
  );
  assert.deepEqual(
    store.newsArr.find((item) => item.name === "qq-news")?.categoryIds,
    ["news-domestic"],
  );
  assert.deepEqual(
    store.newsArr.find((item) => item.name === "nytimes")?.categoryIds,
    ["news-world"],
  );
  assert.deepEqual(
    store.newsArr.find((item) => item.name === "douban-movie")?.categoryIds,
    ["entertainment-video-movie"],
  );
  assert.equal(getCanonicalCategorySlug("wool"), "deals");
  assert.equal(getCategoryNameBySlug("wool"), "优惠省钱");

  console.log("[category-integrity] taxonomy v3 migration, source projections and canonical tree verified");
} finally {
  await vite.close();
}
