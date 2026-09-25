const path = require("node:path");
const { pathToFileURL } = require("node:url");

const DEFAULT_CATALOG_URL = "";
const DEFAULT_TIMEOUT_MS = 8000;
const DEFAULT_ATTEMPTS = 3;
const DEFAULT_RETRY_DELAY_MS = 500;

const parsePositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(String(value || ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const isRequiredCatalogBuild = () =>
  process.env.TRENDS_CATALOG_BUILD_REQUIRED === "1" ||
  process.env.VERCEL_ENV === "production";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchCatalog = async () => {
  const url = String(
    process.env.TRENDS_CATALOG_URL ||
      process.env.TRENDS_PUBLIC_CATALOG_URL ||
      DEFAULT_CATALOG_URL,
  ).trim();
  if (!url || process.env.TRENDS_CATALOG_BUILD_SYNC === "0") return null;

  const timeoutMs = parsePositiveInt(
    process.env.TRENDS_CATALOG_BUILD_TIMEOUT_MS,
    DEFAULT_TIMEOUT_MS,
  );
  const attempts = parsePositiveInt(
    process.env.TRENDS_CATALOG_BUILD_ATTEMPTS,
    DEFAULT_ATTEMPTS,
  );
  const retryDelayMs = parsePositiveInt(
    process.env.TRENDS_CATALOG_BUILD_RETRY_DELAY_MS,
    DEFAULT_RETRY_DELAY_MS,
  );

  let lastError = null;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, {
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const catalog = await response.json();
      if (!Array.isArray(catalog?.sources)) {
        throw new Error("invalid catalog payload");
      }
      return catalog;
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        await wait(retryDelayMs * attempt);
      }
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastError || new Error("catalog fetch failed");
};

const projectSubtypeGroupsForBuild = async (staticGroups, label = "build") => {
  const required = isRequiredCatalogBuild();
  try {
    const catalog = await fetchCatalog();
    if (!catalog) {
      if (required) {
        throw new Error(
          "production build requires Trends catalog sync but no catalog URL is available or sync is disabled",
        );
      }
      return { groups: staticGroups, defaults: new Map(), sources: [], projected: 0 };
    }
    const modulePath = path.resolve(__dirname, "../../src/utils/trendsCatalogProjection.mjs");
    const { mergeProjectedSubtypeGroups, projectTrendsCatalog } = await import(
      pathToFileURL(modulePath).href
    );
    const projection = projectTrendsCatalog(catalog, staticGroups);
    console.log(
      `[${label}] projected ${projection.groupsBySource.size} compatible Trends catalog sources`,
    );
    return {
      groups: mergeProjectedSubtypeGroups(staticGroups, projection.groupsBySource),
      defaults: projection.defaultsBySource,
      sources: catalog.sources
        .map((source) => ({
          key: String(source?.key || "").trim(),
          name: String(source?.name || source?.key || "").trim(),
          priorityTier: String(source?.priorityTier || "").trim(),
          rankingLabel: String(source?.rankingLabel || "").trim(),
          defaultVariant: String(source?.defaultVariant || "").trim(),
        }))
        .filter((source) => source.key),
      projected: projection.groupsBySource.size,
    };
  } catch (error) {
    if (required) {
      throw new Error(
        `[${label}] Trends catalog is required for production build: ${error.message}`,
      );
    }
    console.warn(
      `[${label}] Trends catalog unavailable; using static subtype fallback: ${error.message}`,
    );
    return { groups: staticGroups, defaults: new Map(), sources: [], projected: 0 };
  }
};

module.exports = {
  fetchCatalog,
  isRequiredCatalogBuild,
  projectSubtypeGroupsForBuild,
};
