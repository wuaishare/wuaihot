import assert from "node:assert/strict";
import fs from "node:fs";

const runtimeFiles = [
  "src/api/trendsCatalog.js",
  "src/api/index.js",
  "api/_trends-intelligence.js",
  "scripts/lib/trends-catalog-build.cjs",
  ".env.example",
];

const forbidden = [
  "api.wpbetter.cn",
  "hotapi.wuaishare.cn",
  "hotapi2.wuaishare.cn",
];

for (const file of runtimeFiles) {
  const source = fs.readFileSync(file, "utf8");
  for (const hostname of forbidden) {
    assert.equal(
      source.includes(hostname),
      false,
      `${file} must not hardcode deployment backend ${hostname}`,
    );
  }
}

const envExample = fs.readFileSync(".env.example", "utf8");
for (const key of [
  "VITE_TRENDS_DIRECTORY_API",
  "VITE_TRENDS_PUBLIC_API",
  "TRENDS_CATALOG_URL",
  "TRENDS_INTELLIGENCE_BASE_URL",
]) {
  assert.match(envExample, new RegExp(`^${key}=`, "m"));
}

console.log("[open-source-independence] runtime backend endpoints are deployment-configured");
