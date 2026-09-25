const assert = require("node:assert/strict");
const {
  projectSubtypeGroupsForBuild,
} = require("./lib/trends-catalog-build.cjs");

const ENV_KEYS = [
  "TRENDS_CATALOG_URL",
  "TRENDS_PUBLIC_CATALOG_URL",
  "TRENDS_CATALOG_BUILD_SYNC",
  "TRENDS_CATALOG_BUILD_REQUIRED",
  "TRENDS_CATALOG_BUILD_TIMEOUT_MS",
  "TRENDS_CATALOG_BUILD_ATTEMPTS",
  "TRENDS_CATALOG_BUILD_RETRY_DELAY_MS",
  "VERCEL_ENV",
];

const originalEnv = Object.fromEntries(
  ENV_KEYS.map((key) => [key, process.env[key]]),
);
const originalFetch = global.fetch;

const resetEnv = () => {
  for (const key of ENV_KEYS) {
    const value = originalEnv[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
};

const setTestDefaults = () => {
  process.env.TRENDS_CATALOG_URL = "https://catalog.invalid/test";
  process.env.TRENDS_PUBLIC_CATALOG_URL = "";
  process.env.TRENDS_CATALOG_BUILD_SYNC = "1";
  process.env.TRENDS_CATALOG_BUILD_TIMEOUT_MS = "50";
  process.env.TRENDS_CATALOG_BUILD_ATTEMPTS = "2";
  process.env.TRENDS_CATALOG_BUILD_RETRY_DELAY_MS = "1";
  delete process.env.TRENDS_CATALOG_BUILD_REQUIRED;
  delete process.env.VERCEL_ENV;
};

const run = async () => {
  const staticGroups = {
    local: [{ label: "Local", items: [{ value: "hot", label: "Hot" }] }],
  };

  setTestDefaults();
  let fallbackCalls = 0;
  global.fetch = async () => {
    fallbackCalls += 1;
    throw new Error("temporary catalog failure");
  };
  const fallback = await projectSubtypeGroupsForBuild(
    staticGroups,
    "catalog-build-test-preview",
  );
  assert.equal(fallbackCalls, 2);
  assert.equal(fallback.projected, 0);
  assert.equal(fallback.groups, staticGroups);

  setTestDefaults();
  process.env.VERCEL_ENV = "production";
  let productionCalls = 0;
  global.fetch = async () => {
    productionCalls += 1;
    throw new Error("temporary catalog failure");
  };
  await assert.rejects(
    () =>
      projectSubtypeGroupsForBuild(
        staticGroups,
        "catalog-build-test-production",
      ),
    /Trends catalog is required for production build: temporary catalog failure/,
  );
  assert.equal(productionCalls, 2);

  setTestDefaults();
  process.env.VERCEL_ENV = "production";
  let retryCalls = 0;
  global.fetch = async () => {
    retryCalls += 1;
    if (retryCalls === 1) throw new Error("first attempt failed");
    return {
      ok: true,
      status: 200,
      json: async () => ({ sources: [] }),
    };
  };
  const retrySuccess = await projectSubtypeGroupsForBuild(
    staticGroups,
    "catalog-build-test-retry",
  );
  assert.equal(retryCalls, 2);
  assert.equal(retrySuccess.projected, 0);

  setTestDefaults();
  process.env.VERCEL_ENV = "production";
  process.env.TRENDS_CATALOG_URL = "";
  process.env.TRENDS_PUBLIC_CATALOG_URL = "";
  global.fetch = async () => {
    throw new Error("fetch must not be called without a URL");
  };
  await assert.rejects(
    () =>
      projectSubtypeGroupsForBuild(
        staticGroups,
        "catalog-build-test-missing-url",
      ),
    /production build requires Trends catalog sync/,
  );

  console.log(
    "[trends-catalog-build] preview fallback, production fail-closed, retry recovery and missing-url guard verified",
  );
};

run()
  .finally(() => {
    global.fetch = originalFetch;
    resetEnv();
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
