import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { mergeDirectoryAndReadCatalogs } from "../src/utils/trendsCatalogSurfaceMerge.mjs";
import {
  applyTrendsSourceCatalog,
  buildSourceSubtypeParams,
  canFallbackTrendsCatalogVariant,
  filterReadableTrendsCatalogManagedSources,
  getDefaultSourceSubtype,
  getSourceSubtypeGroups,
  getSourceSubtypeStorageKey,
  readSourceSubtype,
  persistSourceSubtype,
  getTrendsCatalogReadSurface,
  getTrendsSourceCatalogRevision,
  getTrendsCatalogSources,
  hasTrendsCatalogSource,
  hasTrendsDisplayCatalogSource,
  hasTrendsPublicCatalogSource,
  getSourceSubtypeControlGroups,
  getSourceVariantOption,
  resolveLegacySourceProjection,
  resolveTrendsCatalogVariant,
  subscribeTrendsSourceCatalog,
} from "../src/utils/sourceSubtypes.js";

const recentTrendsFrontendSources = [
  "apple-app-store",
  "apple-podcasts",
  "autohome-sales",
  "antutu-rankings",
  "zol-phone-rankings",
  "zol-tech-rankings",
  "bilibili-live",
  "huya-video-rankings",
  "bilibili-ai-arena",
  "bilibili-game-rankings",
  "bilibili-manga",
  "china-film-boxoffice",
  "chrome-web-store",
  "greasy-fork",
  "douyin-live",
  "fanqie-books",
  "hongguo-rank",
  "iqiyi-rank",
  "jjwxc-books",
  "kuaikan-comics",
  "kugou-music",
  "kuwo-music",
  "lanren-audio",
  "ludashi-rankings",
  "maoer-drama",
  "netease-music",
  "oppo-app-store",
  "pconline-rankings",
  "qidian-books",
  "qimao-books",
  "qingting-audio",
  "qq-music",
  "taptap-games",
  "xiaomi-app-store",
  "yingyongbao-store",
  "youku-rank",
  "lol-top-canyon",
  "modeldial-radar",
  "steam",
  "epic-free-games",
  "gog-deals",
  "sonkwo-deals",
  "xiaoheihe-deals",
  "qbitai-ai",
];

const catalog = {
  sources: [
    {
      key: "weibo",
      defaultVariant: "hot",
      variantGroups: [
        {
          key: "ranking",
          label: "榜单",
          options: [
            { key: "hot", label: "热搜" },
            { key: "entertainment", label: "文娱榜" },
            { key: "life", label: "生活榜" },
            { key: "social", label: "社会榜" },
          ],
        },
      ],
    },
    {
      key: "google-trends",
      defaultVariant: "us",
      variantGroups: [
        {
          key: "ranking",
          label: "地区",
          options: [
            ["us", "美国"], ["jp", "日本"], ["gb", "英国"], ["kr", "韩国"], ["in", "印度"],
            ["de", "德国"], ["fr", "法国"], ["br", "巴西"], ["ca", "加拿大"], ["au", "澳大利亚"],
          ].map(([key, label]) => ({ key, label })),
        },
      ],
    },
    {
      key: "modeldial-radar",
      name: "ModelDial Radar",
      category: "ai",
      priorityTier: "B",
      rankingLabel: "AI Coding 模型实测榜",
      defaultVariant: "",
      variantSelectorEnabled: false,
      variantGroups: [],
      publicAvailable: true,
      displayAvailable: true,
    },
    {
      key: "bilibili-ai-arena",
      name: "B站 AI 无限竞技场",
      category: "ai",
      priorityTier: "A",
      rankingLabel: "模型竞技榜",
      defaultVariant: "",
      variantSelectorEnabled: false,
      variantGroups: [],
      publicAvailable: false,
      displayAvailable: true,
    },
    {
      key: "qq-music",
      name: "QQ音乐",
      category: "culture",
      priorityTier: "A",
      rankingLabel: "飙升榜",
      defaultVariant: "rising",
      variantSelectorEnabled: true,
      variantGroups: [
        {
          key: "ranking",
          label: "榜单",
          options: [
            { key: "rising", label: "飙升榜" },
            { key: "hot", label: "热歌榜" },
          ],
        },
      ],
      publicAvailable: false,
      displayAvailable: false,
    },
    {
      key: "xiaohongshu",
      defaultVariant: "hot",
      variantSelectorEnabled: false,
      variantGroups: [
        {
          key: "ranking",
          label: "榜单",
          options: [
            { key: "hot", label: "热搜", recommendedRefreshIntervalSeconds: 180 },
          ],
        },
      ],
    },
  ],
};

const revisionBeforeInitialCatalog = getTrendsSourceCatalogRevision();
assert.equal(applyTrendsSourceCatalog(catalog), 4);
assert.equal(
  getTrendsSourceCatalogRevision(),
  revisionBeforeInitialCatalog + 1,
  "a changed remote Catalog must advance the global revision exactly once",
);
const revisionAfterInitialCatalog = getTrendsSourceCatalogRevision();
assert.equal(applyTrendsSourceCatalog(catalog), 4);
assert.equal(
  getTrendsSourceCatalogRevision(),
  revisionAfterInitialCatalog,
  "reapplying an identical remote Catalog must not create a phantom revision",
);
assert.equal(hasTrendsCatalogSource("modeldial-radar"), true);
assert.deepEqual(
  getTrendsCatalogSources().find((source) => source.key === "modeldial-radar"),
  {
    key: "modeldial-radar",
    name: "ModelDial Radar",
    category: "ai",
    priorityTier: "B",
    rankingLabel: "AI Coding 模型实测榜",
    defaultVariant: "",
    publicAvailable: true,
    displayAvailable: true,
  },
);
assert.equal(hasTrendsPublicCatalogSource("modeldial-radar"), true);
assert.equal(hasTrendsDisplayCatalogSource("modeldial-radar"), true);
assert.equal(getTrendsCatalogReadSurface("modeldial-radar"), "public");
assert.equal(hasTrendsCatalogSource("bilibili-ai-arena"), true);
assert.equal(hasTrendsPublicCatalogSource("bilibili-ai-arena"), false);
assert.equal(hasTrendsDisplayCatalogSource("bilibili-ai-arena"), true);
assert.equal(getTrendsCatalogReadSurface("bilibili-ai-arena"), "display");
assert.equal(hasTrendsCatalogSource("qq-music"), true);
assert.equal(hasTrendsPublicCatalogSource("qq-music"), false);
assert.equal(hasTrendsDisplayCatalogSource("qq-music"), false);
assert.equal(getTrendsCatalogReadSurface("qq-music"), null);
assert.equal(hasTrendsPublicCatalogSource("not-in-catalog"), false);
assert.equal(hasTrendsDisplayCatalogSource("not-in-catalog"), false);
assert.equal(getTrendsCatalogReadSurface("not-in-catalog"), null);
assert.deepEqual(
  filterReadableTrendsCatalogManagedSources([
    { name: "weibo", show: true },
    { name: "modeldial-radar", catalogManaged: true, show: true },
    { name: "bilibili-ai-arena", catalogManaged: true, show: true },
    { name: "qq-music", catalogManaged: true, directoryOnly: true, show: true },
    { name: "qq-music", catalogManaged: true, show: true },
    { name: "stale-catalog-source", catalogManaged: true, directoryOnly: true, show: true },
  ]).map((item) => [item.name, Boolean(item.directoryOnly)]),
  [
    ["weibo", false],
    ["modeldial-radar", false],
    ["bilibili-ai-arena", false],
    ["qq-music", true],
  ],
);
assert.deepEqual(
  getSourceSubtypeGroups("weibo").flatMap((group) => group.items.map((item) => item.value)),
  ["hot", "entertainment", "life", "social"],
);
assert.equal(getDefaultSourceSubtype("weibo"), "hot");
assert.equal(resolveTrendsCatalogVariant("weibo", { type: "life" }), "life");
assert.equal(resolveTrendsCatalogVariant("weibo", { type: "invalid" }), null);
assert.equal(canFallbackTrendsCatalogVariant("weibo", "hot"), true);
assert.equal(canFallbackTrendsCatalogVariant("weibo", "entertainment"), false);
assert.deepEqual(getSourceSubtypeGroups("xiaohongshu"), []);
assert.equal(getDefaultSourceSubtype("xiaohongshu"), "hot");
assert.equal(getSourceVariantOption("xiaohongshu", "hot")?.recommendedRefreshIntervalSeconds, 180);
assert.equal(resolveTrendsCatalogVariant("xiaohongshu", {}), "hot");
assert.equal(resolveTrendsCatalogVariant("xiaohongshu", { type: "hot" }), "hot");
assert.equal(resolveTrendsCatalogVariant("xiaohongshu", { type: "read-3d" }), null);
assert.equal(canFallbackTrendsCatalogVariant("xiaohongshu", "hot"), true);
assert.equal(canFallbackTrendsCatalogVariant("xiaohongshu", "read-3d"), false);
assert.deepEqual(resolveLegacySourceProjection("douban-wool", "buy"), {
  sourceName: "douban-group",
  variant: "buy",
});
assert.deepEqual(resolveLegacySourceProjection("douban-wool", "groupbuy"), {
  sourceName: "douban-group",
  variant: "groupbuy",
});
assert.deepEqual(resolveLegacySourceProjection("douban-pet-wool", "dog"), {
  sourceName: "douban-group",
  variant: "dog",
});
assert.deepEqual(resolveLegacySourceProjection("douban-pet-wool", ""), {
  sourceName: "douban-group",
  variant: "catlife",
});
assert.deepEqual(resolveLegacySourceProjection("steam-deals", "discount90"), {
  sourceName: "steam",
  variant: "discount90",
});
assert.deepEqual(resolveLegacySourceProjection("steam-deals", ""), {
  sourceName: "steam",
  variant: "featured",
});

const subtypeStorage = new Map();
globalThis.localStorage = {
  getItem: (key) => subtypeStorage.get(key) ?? null,
  setItem: (key, value) => subtypeStorage.set(key, String(value)),
  removeItem: (key) => subtypeStorage.delete(key),
};
localStorage.setItem(getSourceSubtypeStorageKey("steam-deals"), "discount90");
assert.equal(readSourceSubtype("steam"), "discount90");
persistSourceSubtype("steam", "under10");
assert.equal(localStorage.getItem(getSourceSubtypeStorageKey("steam")), "under10");
assert.equal(localStorage.getItem(getSourceSubtypeStorageKey("steam-deals")), null);
persistSourceSubtype("steam", null);
assert.equal(localStorage.getItem(getSourceSubtypeStorageKey("steam")), null);
assert.deepEqual(
  getSourceSubtypeGroups("sonkwo-deals").flatMap((group) =>
    group.items.map((item) => item.value),
  ),
  ["popular", "lowest", "newlowest", "discount90", "under10", "under30", "sales"],
);

const steamDirectoryCatalog = {
  version: 1,
  sources: [
    {
      key: "steam",
      name: "Steam",
      category: "culture",
      defaultVariant: "topselling",
      variantSelectorEnabled: true,
      variantGroups: [
        {
          key: "ranking",
          label: "榜单",
          options: [
            { key: "topselling", label: "全球畅销榜" },
            { key: "mostplayed", label: "在线人数榜" },
            { key: "steamdeck", label: "Steam Deck 热门榜" },
          ],
        },
        {
          key: "deals",
          label: "游戏特惠",
          options: [
            { key: "featured", label: "热门特惠" },
            { key: "discount75", label: "75%+ 高折扣" },
          ],
        },
      ],
    },
  ],
};
const steamDisplayCatalog = {
  version: 1,
  profile: "public-display-v1",
  sources: [
    {
      key: "steam",
      name: "Steam",
      category: "culture",
      defaultVariant: "topselling",
      variantSelectorEnabled: true,
      displayStatus: "limited",
      displayScope: "variant",
      variantGroups: [
        {
          key: "ranking",
          label: "榜单",
          options: [
            { key: "topselling", label: "全球畅销榜", displayStatus: "limited" },
            { key: "mostplayed", label: "在线人数榜", displayStatus: "limited" },
            { key: "steamdeck", label: "Steam Deck 热门榜", displayStatus: "limited" },
          ],
        },
      ],
    },
  ],
};
const surfaceMergedCatalog = mergeDirectoryAndReadCatalogs({
  directoryCatalog: steamDirectoryCatalog,
  displayCatalog: steamDisplayCatalog,
});
const mergedSteam = surfaceMergedCatalog.sources[0];
assert.equal(mergedSteam.publicAvailable, false);
assert.equal(mergedSteam.displayAvailable, true);
assert.equal(mergedSteam.displayScope, "variant");
assert.deepEqual(
  mergedSteam.variantGroups.flatMap((group) => group.options.map((option) => option.key)),
  ["topselling", "mostplayed", "steamdeck"],
  "Display variant subset must replace Directory full variants on the active read surface",
);
applyTrendsSourceCatalog(surfaceMergedCatalog);
assert.deepEqual(
  getSourceSubtypeGroups("steam").flatMap((group) =>
    group.items.map((item) => item.value),
  ),
  ["topselling", "mostplayed", "steamdeck"],
);
assert.equal(resolveTrendsCatalogVariant("steam", { type: "featured" }), null);

const staleDisplayMergedCatalog = mergeDirectoryAndReadCatalogs({
  directoryCatalog: steamDirectoryCatalog,
  displayCatalog: null,
  cachedCatalog: surfaceMergedCatalog,
});
assert.deepEqual(
  staleDisplayMergedCatalog.sources[0].variantGroups.flatMap((group) =>
    group.options.map((option) => option.key),
  ),
  ["topselling", "mostplayed", "steamdeck"],
  "temporary Display catalog failure must reuse the cached readable subset instead of reopening Directory-only variants",
);
applyTrendsSourceCatalog(catalog);

const pgyCatalog = structuredClone(catalog);
const pgyXiaohongshu = pgyCatalog.sources.find((source) => source.key === "xiaohongshu");
pgyXiaohongshu.variantSelectorEnabled = true;
pgyXiaohongshu.variantDimensions = [
  {
    key: "ranking",
    label: "榜单",
    options: [
      { key: "hot", label: "热搜" },
      { key: "read", label: "阅读榜" },
      { key: "like", label: "点赞榜" },
      { key: "collect", label: "收藏榜" },
    ],
  },
  {
    key: "period",
    label: "时间",
    options: [
      { key: "3d", label: "近3日" },
      { key: "7d", label: "近7日" },
      { key: "14d", label: "近14日" },
      { key: "30d", label: "近30日" },
    ],
  },
];
pgyXiaohongshu.variantGroups[0].options = [
  { key: "hot", label: "热搜", dimensionValues: { ranking: "hot" }, runtimeAvailability: "available" },
  ...["read", "like", "collect"].flatMap((ranking) =>
    ["3d", "7d", "14d", "30d"].map((period) => ({
      key: `${ranking}-${period}`,
      label: `${ranking}-${period}`,
      dimensionValues: { ranking, period },
      runtimeAvailability: "available",
    })),
  ),
];
applyTrendsSourceCatalog(pgyCatalog);
assert.deepEqual(
  getSourceSubtypeControlGroups("xiaohongshu", "hot").map((group) => ({
    key: group.key,
    values: group.items.map((item) => item.value),
  })),
  [{ key: "ranking", values: ["hot", "read-3d", "like-3d", "collect-3d"] }],
);
assert.deepEqual(
  getSourceSubtypeControlGroups("xiaohongshu", "read-7d").map((group) => ({
    key: group.key,
    values: group.items.map((item) => item.value),
  })),
  [
    { key: "ranking", values: ["hot", "read-7d", "like-7d", "collect-7d"] },
    { key: "period", values: ["read-3d", "read-7d", "read-14d", "read-30d"] },
  ],
);

const gatedPgyCatalog = structuredClone(pgyCatalog);
const gatedPgyXiaohongshu = gatedPgyCatalog.sources.find((source) => source.key === "xiaohongshu");
for (const option of gatedPgyXiaohongshu.variantGroups[0].options) {
  if (option.key !== "hot") option.runtimeAvailability = "requires_authorization";
}
applyTrendsSourceCatalog(gatedPgyCatalog);
assert.deepEqual(getSourceSubtypeGroups("xiaohongshu"), []);
assert.equal(getDefaultSourceSubtype("xiaohongshu"), "hot");
assert.equal(resolveTrendsCatalogVariant("xiaohongshu", { type: "read-3d" }), null);
assert.deepEqual(getSourceSubtypeControlGroups("xiaohongshu", "hot"), []);

applyTrendsSourceCatalog(pgyCatalog);

let catalogChangeCount = 0;
const unsubscribe = subscribeTrendsSourceCatalog(() => { catalogChangeCount += 1; });
const expandedCatalog = structuredClone(catalog);
const expandedWeibo = expandedCatalog.sources.find((source) => source.key === "weibo");
expandedWeibo.variantGroups[0].options.push(
  { key: "tech", label: "科技榜" },
  { key: "sports", label: "体育榜" },
  { key: "acg", label: "ACG榜" },
);
applyTrendsSourceCatalog(expandedCatalog);
assert.equal(catalogChangeCount, 1, "catalog subscribers must observe backend variant expansion");
assert.deepEqual(
  getSourceSubtypeGroups("weibo").flatMap((group) => group.items.map((item) => item.value)),
  ["hot", "entertainment", "life", "social", "tech", "sports", "acg"],
);
applyTrendsSourceCatalog(expandedCatalog);
assert.equal(catalogChangeCount, 1, "re-applying the same catalog must not emit a false change");
unsubscribe();
assert.deepEqual(
  getSourceSubtypeGroups("google-trends").flatMap((group) => group.items.map((item) => item.value)),
  ["us", "jp", "gb", "kr", "in", "de", "fr", "br", "ca", "au"],
);
assert.equal(getDefaultSourceSubtype("google-trends"), "us");
assert.equal(resolveTrendsCatalogVariant("google-trends", { type: "jp" }), "jp");
assert.equal(canFallbackTrendsCatalogVariant("google-trends", "jp"), false);

const bilibiliStaticValues = getSourceSubtypeGroups("bilibili")
  .flatMap((group) => group.items.map((item) => item.value));
assert.deepEqual(
  bilibiliStaticValues,
  [
    "popular", "all", "animation", "music", "game", "entertainment", "tech",
    "kichiku", "dance", "fashion", "life", "guochuang", "film", "knowledge",
    "food", "animals", "auto", "sports",
  ],
  "Bilibili static fallback must stay aligned with the current governed Directory Catalog",
);
assert.deepEqual(
  buildSourceSubtypeParams("bilibili", "tech"),
  { type: "188" },
  "Bilibili semantic fallback variants must preserve the legacy provider transport id",
);
const bilibiliCatalog = {
  version: 1,
  sources: [
    {
      key: "bilibili",
      name: "哔哩哔哩",
      category: "culture",
      defaultVariant: "popular",
      variantSelectorEnabled: true,
      variantGroups: [
        {
          key: "ranking",
          label: "分区",
          options: [
            { key: "popular", label: "综合热门" },
            { key: "all", label: "全站排行榜" },
            { key: "animation", label: "动画" },
            { key: "music", label: "音乐" },
            { key: "game", label: "游戏" },
            { key: "entertainment", label: "娱乐" },
            { key: "tech", label: "科技" },
            { key: "film", label: "影视" },
            { key: "kichiku", label: "鬼畜" },
            { key: "dance", label: "舞蹈" },
            { key: "fashion", label: "时尚" },
            { key: "life", label: "生活" },
            { key: "guochuang", label: "国创相关" },
            { key: "knowledge", label: "知识" },
            { key: "food", label: "美食" },
            { key: "animals", label: "动物圈" },
            { key: "auto", label: "汽车" },
            { key: "sports", label: "运动" },
          ],
        },
      ],
      publicAvailable: false,
      displayAvailable: true,
    },
  ],
};
applyTrendsSourceCatalog(bilibiliCatalog);
assert.equal(getDefaultSourceSubtype("bilibili"), "popular");
assert.equal(resolveTrendsCatalogVariant("bilibili", { type: "tech" }), "tech");
assert.deepEqual(
  getSourceSubtypeGroups("bilibili").flatMap((group) =>
    group.items.map((item) => item.value),
  ),
  bilibiliStaticValues,
  "Bilibili live Catalog projection and static fallback must expose the same semantic variants",
);

console.log("[trends-catalog-contract] dynamic projection, selector gating and fail-closed fallback verified");

const vueFiles = [];
const walkVueFiles = (directory) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) walkVueFiles(fullPath);
    else if (entry.isFile() && entry.name.endsWith(".vue")) vueFiles.push(fullPath);
  }
};
walkVueFiles(new URL("../src", import.meta.url).pathname);
const dynamicSubtypeGetterPattern = /getSourceSubtypeGroups\(|getSourceSubtypeOptions\(|getDefaultSourceSubtype\(|resolveTrendsCatalogVariant\(/;
const subtypeConsumers = vueFiles.filter((file) =>
  dynamicSubtypeGetterPattern.test(fs.readFileSync(file, "utf8")),
);
assert.ok(subtypeConsumers.length > 0, "expected at least one runtime subtype catalog consumer");
for (const file of subtypeConsumers) {
  const source = fs.readFileSync(file, "utf8");
  assert.match(
    source,
    /import\s*\{\s*useTrendsCatalogRevision\s*\}\s*from\s*["']@\/composables\/useTrendsCatalogRevision["']/,
    `${path.relative(process.cwd(), file)} reads the remote subtype catalog without importing the reactive catalog revision composable`,
  );
  assert.match(
    source,
    /useTrendsCatalogRevision\(\)/,
    `${path.relative(process.cwd(), file)} imports but does not activate the reactive catalog revision composable`,
  );
}
const revisionComposable = fs.readFileSync(
  new URL("../src/composables/useTrendsCatalogRevision.js", import.meta.url).pathname,
  "utf8",
);
assert.match(revisionComposable, /subscribeTrendsSourceCatalog/, "catalog revision composable must subscribe to remote catalog changes");
assert.match(
  revisionComposable,
  /ref\(getTrendsSourceCatalogRevision\(\)\)/,
  "catalog revision composable must start from the current remote catalog revision",
);
assert.match(
  revisionComposable,
  /unsubscribe = subscribeTrendsSourceCatalog[\s\S]{0,260}revision\.value = getTrendsSourceCatalogRevision\(\)/,
  "catalog revision composable must reconcile changes that land between setup and mounted subscription",
);
const subtypeSource = fs.readFileSync(
  new URL("../src/utils/sourceSubtypes.js", import.meta.url).pathname,
  "utf8",
);
assert.match(
  subtypeSource,
  /REMOTE_SOURCE_CATALOG_REVISION \+= 1/,
  "remote catalog changes must advance a monotonic revision snapshot",
);
assert.match(
  subtypeSource,
  /export const getTrendsSourceCatalogRevision/,
  "remote catalog revision snapshot must be readable by consumers",
);
const storeSource = fs.readFileSync(new URL("../src/store/index.js", import.meta.url).pathname, "utf8");
const sourceLogosSource = fs.readFileSync(new URL("../src/utils/sourceLogos.js", import.meta.url).pathname, "utf8");
for (const sourceKey of recentTrendsFrontendSources) {
  assert.ok(
    storeSource.includes(`"${sourceKey}"`),
    `recent Trends source ${sourceKey} must have curated frontend presentation metadata`,
  );
  assert.ok(
    sourceLogosSource.includes(`"${sourceKey}"`),
    `recent Trends source ${sourceKey} must have an explicit frontend logo mapping`,
  );
}
assert.match(storeSource, /syncTrendsCatalogSources\(\)/, "main store must merge newly admitted catalog sources");
assert.match(storeSource, /priorityTier === ["']A["'] \|\| source\.priorityTier === ["']B["']/, "catalog auto-discovery must stay limited to Tier A/B sources");
const apiSource = fs.readFileSync(new URL("../src/api/index.js", import.meta.url).pathname, "utf8");
const topicsSource = fs.readFileSync(new URL("../src/config/topics.js", import.meta.url).pathname, "utf8");
const taxonomySource = fs.readFileSync(new URL("../src/config/taxonomy-v3.js", import.meta.url).pathname, "utf8");
const directPublicApiBlock = apiSource.match(
  /const DIRECT_PUBLIC_API_SOURCES = new Set\(\[([\s\S]*?)\]\);/,
)?.[1] || "";
assert.doesNotMatch(
  storeSource,
  /name:\s*"steam-deals"/,
  "legacy steam-deals must not return as a standalone default source",
);
assert.doesNotMatch(
  directPublicApiBlock,
  /"steam-deals"/,
  "legacy steam-deals must not bypass canonical Steam through the direct API allowlist",
);
assert.match(
  topicsSource,
  /GAME_DEAL_SOURCE_IDS[\s\S]*?"steam"/,
  "game deals topic must consume canonical Steam",
);
assert.doesNotMatch(
  topicsSource.match(/GAME_DEAL_SOURCE_IDS = \[([\s\S]*?)\];/)?.[1] || "",
  /"steam-deals"/,
  "game deals topic must not contain the legacy Steam source",
);
assert.match(
  taxonomySource,
  /"steam":\s*\["games-deals",\s*"life-deals"\]/,
  "canonical Steam must project to game deals and life deals",
);
assert.match(apiSource, /getTrendsCatalogReadSurface\(type\)/, "catalog-managed sources must resolve an explicit readable surface");
assert.match(apiSource, /readSurface === "display"/, "Display-only reads must fail closed instead of falling back to legacy full-data endpoints");
assert.match(apiSource, /TRENDS_DISPLAY_API/, "frontend ranking transport must support the bounded Public Display API");
const catalogLoaderSource = fs.readFileSync(new URL("../src/api/trendsCatalog.js", import.meta.url).pathname, "utf8");
assert.match(catalogLoaderSource, /DIRECTORY_API/, "frontend catalog loader must consume the full Trends directory");
const listViewSource = fs.readFileSync(new URL("../src/views/List.vue", import.meta.url).pathname, "utf8");
assert.match(listViewSource, /const ensureRouteSourceExists = \(\) =>/, "rank pages must guard removed catalog-managed source routes");
assert.match(listViewSource, /changeType\(fallbackSource\.name, true\)/, "removed source routes must replace history with a readable fallback");
assert.match(listViewSource, /const navigate = replace \? router\.replace : router\.push/, "source navigation must support replace semantics for stale routes");
assert.match(listViewSource, /if \(!ensureRouteSourceExists\(\)\) return;\s*getHotListsData\(listType\.value\)/, "initial rank mount must validate the route source before loading data");
assert.match(catalogLoaderSource, /DISPLAY_API/, "frontend catalog loader must consume the Public Display catalog");
assert.match(
  catalogLoaderSource,
  /mergeDirectoryAndReadCatalogs/,
  "frontend catalog loader must delegate surface-aware source merging to the shared helper",
);
const surfaceMergeSource = fs.readFileSync(
  new URL("../src/utils/trendsCatalogSurfaceMerge.mjs", import.meta.url).pathname,
  "utf8",
);
assert.match(
  surfaceMergeSource,
  /publicAvailable/,
  "surface merge helper must preserve Public Feed admission separately from directory discovery",
);
assert.match(
  surfaceMergeSource,
  /displayAvailable/,
  "surface merge helper must preserve Public Display admission separately from Public Feed",
);
assert.match(
  surfaceMergeSource,
  /cachedSources/,
  "surface merge helper must preserve the last readable surface subset when a read catalog is temporarily unavailable",
);
console.log(`[trends-catalog-contract] ${subtypeConsumers.length} runtime UI consumers use the reactive catalog revision contract`);
