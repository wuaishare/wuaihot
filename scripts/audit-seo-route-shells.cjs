const fs = require("node:fs");
const path = require("node:path");

const distRoot = path.join(__dirname, "..", "dist");
if (!fs.existsSync(distRoot)) {
  throw new Error("dist/ is missing; build route shells before auditing SEO titles.");
}

const htmlFiles = [];
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const target = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(target);
    else if (entry.isFile() && entry.name.endsWith(".html")) htmlFiles.push(target);
  }
};
walk(distRoot);

const malformed = [];
let titledFiles = 0;
for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  const match = html.match(/<title>([\s\S]*?)<\/title>/i);
  if (!match) continue;
  titledFiles += 1;
  const title = match[1].replace(/\s+/g, " ").trim();
  if (/\s-\s榜(?:[，, ]|$)/u.test(title)) {
    malformed.push({ file: path.relative(distRoot, file), title });
  }
}
const expectedCategoryShells = [
  ["category/news/index.html", "新闻热榜 - 国内外新闻、社会热点与主流媒体榜单聚合 | 吾爱热榜"],
  ["category/entertainment/index.html", "文娱热榜 - 娱乐、影视、音乐、短剧与ACG热点聚合 | 吾爱热榜"],
  ["category/music/index.html", "音乐热榜 - QQ音乐、网易云、酷狗、酷我等榜单聚合 | 吾爱热榜"],
  ["category/sports/index.html", "体育热榜 - 赛事热点、足球篮球与体育话题聚合 | 吾爱热榜"],
  ["category/games/index.html", "游戏热榜 - 游戏资讯、官方公告与玩家社区讨论聚合 | 吾爱热榜"],
];
const missingOrWrongCategoryShells = [];
for (const [relativePath, expectedTitle] of expectedCategoryShells) {
  const file = path.join(distRoot, relativePath);
  if (!fs.existsSync(file)) {
    missingOrWrongCategoryShells.push({
      file: relativePath,
      title: "(missing)",
      expectedTitle,
    });
    continue;
  }
  const html = fs.readFileSync(file, "utf8");
  const title = html
    .match(/<title>([\s\S]*?)<\/title>/i)?.[1]
    ?.replace(/\s+/g, " ")
    .trim();
  if (title !== expectedTitle) {
    missingOrWrongCategoryShells.push({
      file: relativePath,
      title: title || "(missing title)",
      expectedTitle,
    });
  }
}

const expectedBreadcrumbShells = [
  ["category/music/index.html", ["首页", "文娱", "音乐热榜"]],
  ["rank/weibo/tech/index.html", ["首页", "科技", "微博", "科技榜"]],
  ["rank/douyin/entertainment/index.html", ["首页", "文娱", "抖音", "娱乐榜"]],
];
const expectedSitemapPaths = [
  "/category/music",
  "/rank/weibo/tech",
  "/rank/weibo/sports",
  "/rank/weibo/acg",
  "/rank/douyin/entertainment",
];
const sitemapPath = path.join(distRoot, "sitemap.xml");
const productionSitemapFloor = process.env.VERCEL_ENV === "production" ? 5000 : 0;
const sitemapMinUrlCount = Number.parseInt(
  process.env.SEO_SITEMAP_MIN_URLS || String(productionSitemapFloor),
  10,
);
const missingSitemapPaths = [];
let sitemapUrlCount = 0;
let sitemapCountError = "";
if (!fs.existsSync(sitemapPath)) {
  missingSitemapPaths.push("(sitemap.xml missing)");
} else {
  const sitemapXml = fs.readFileSync(sitemapPath, "utf8");
  sitemapUrlCount = sitemapXml.match(/<url>/g)?.length || 0;
  if (sitemapMinUrlCount > 0 && sitemapUrlCount < sitemapMinUrlCount) {
    sitemapCountError = `sitemap URL count ${sitemapUrlCount} is below production floor ${sitemapMinUrlCount}`;
  }
  const sitemapPaths = new Set(
    [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)]
      .map((match) => {
        try {
          return new URL(match[1]).pathname.replace(/\/$/, "") || "/";
        } catch {
          return "";
        }
      })
      .filter(Boolean),
  );
  for (const expectedPath of expectedSitemapPaths) {
    if (!sitemapPaths.has(expectedPath)) missingSitemapPaths.push(expectedPath);
  }
}

const missingOrWrongBreadcrumbShells = [];
for (const [relativePath, expectedNames] of expectedBreadcrumbShells) {
  const file = path.join(distRoot, relativePath);
  if (!fs.existsSync(file)) {
    missingOrWrongBreadcrumbShells.push({
      file: relativePath,
      names: ["(missing)"],
      expectedNames,
    });
    continue;
  }
  const html = fs.readFileSync(file, "utf8");
  const jsonLdText = html.match(
    /<script\s+id="dailyhot-breadcrumb-jsonld"\s+type="application\/ld\+json">([\s\S]*?)<\/script>/i,
  )?.[1];
  let names = [];
  try {
    const jsonLd = jsonLdText ? JSON.parse(jsonLdText) : null;
    names = (jsonLd?.itemListElement || []).map((item) => item?.name);
  } catch {
    names = ["(invalid json)"];
  }
  if (JSON.stringify(names) !== JSON.stringify(expectedNames)) {
    missingOrWrongBreadcrumbShells.push({
      file: relativePath,
      names,
      expectedNames,
    });
  }
}

if (
  malformed.length ||
  missingOrWrongCategoryShells.length ||
  missingOrWrongBreadcrumbShells.length ||
  missingSitemapPaths.length ||
  Boolean(sitemapCountError)
) {
  if (malformed.length) {
    console.error("[seo-shell-audit] malformed generated titles detected:");
  }
  for (const row of malformed) {
    console.error(`- ${row.file}: ${row.title}`);
  }
  if (missingOrWrongCategoryShells.length) {
    console.error("[seo-shell-audit] category fallback shells are missing or incorrect:");
    for (const row of missingOrWrongCategoryShells) {
      console.error(
        `- ${row.file}: got "${row.title}", expected "${row.expectedTitle}"`,
      );
    }
  }
  if (missingOrWrongBreadcrumbShells.length) {
    console.error("[seo-shell-audit] breadcrumb shells are missing or incorrect:");
    for (const row of missingOrWrongBreadcrumbShells) {
      console.error(
        `- ${row.file}: got ${JSON.stringify(row.names)}, expected ${JSON.stringify(row.expectedNames)}`,
      );
    }
  }
  if (missingSitemapPaths.length) {
    console.error("[seo-shell-audit] governed sitemap routes are missing:");
    for (const pathname of missingSitemapPaths) {
      console.error(`- ${pathname}`);
    }
  }
  if (sitemapCountError) {
    console.error(`[seo-shell-audit] ${sitemapCountError}`);
  }
  process.exitCode = 1;
} else {
  console.log(
    `[seo-shell-audit] checked ${titledFiles} titled HTML files; malformed suffix fragments: 0; category fallback shells: ${expectedCategoryShells.length}; breadcrumb shells: ${expectedBreadcrumbShells.length}; sitemap routes: ${expectedSitemapPaths.length}; sitemap URLs: ${sitemapUrlCount}`,
  );
}
