import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

const requiredSources = [
  "antutu-rankings",
  "apple-app-store",
  "apple-music",
  "apple-podcasts",
  "arxiv-ai",
  "cdc-mmwr",
  "china-film-boxoffice",
  "cisa-kev",
  "european-commission-news",
  "federal-register",
  "govuk-news",
  "greasy-fork",
  "hongguo-rank",
  "hotbook-discovery",
  "lol-top-canyon",
  "ludashi-rankings",
  "modeldial-radar",
  "nasa-news",
  "nvd-cves",
  "nws-alerts",
  "openfda",
  "oppo-app-store",
  "stackoverflow",
  "tencent-software-center",
  "usgs-earthquakes",
  "vscode-marketplace",
  "wikipedia",
  "xiaomi-app-store",
  "ximalaya-rankings",
  "yingyongbao-store",
  // High-value media/platform entries that must keep usable local brand assets
  // even when their ranking data is not admitted to Public Display.
  "qq-music",
  "sonkwo-deals",
  "netease-music",
  "kugou-music",
  "kuwo-music",
  "techcrunch",
];

const logoSource = fs.readFileSync("src/utils/sourceLogos.js", "utf8");
const block = logoSource.match(/const SOURCE_LOGO_MAP = \{([\s\S]*?)\n\};/)?.[1] || "";
const entries = new Map();
for (const match of block.matchAll(/^\s*(?:"([^"]+)"|([A-Za-z0-9_-]+))\s*:\s*"([^"]+)"/gm)) {
  entries.set(match[1] || match[2], match[3]);
}

const failures = [];
for (const source of requiredSources) {
  const asset = entries.get(source);
  if (!asset) {
    failures.push(`${source}: missing explicit SOURCE_LOGO_MAP entry`);
    continue;
  }
  if (!asset.startsWith("/")) {
    failures.push(`${source}: logo must be a local public asset, got ${asset}`);
    continue;
  }
  const filePath = path.join("public", asset.slice(1));
  if (!fs.existsSync(filePath)) {
    failures.push(`${source}: mapped asset does not exist: ${filePath}`);
    continue;
  }
  if (fs.statSync(filePath).size <= 0) {
    failures.push(`${source}: mapped asset is empty: ${filePath}`);
  }
}

assert.deepEqual(failures, [], failures.join("\n"));
console.log(
  `[source-logo-contract] ${requiredSources.length} priority/display source logos resolve to local assets`,
);
