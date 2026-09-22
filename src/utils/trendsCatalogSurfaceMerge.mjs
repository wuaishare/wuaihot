const sourceMap = (catalog) =>
  new Map(
    (catalog?.sources || [])
      .filter((source) => source?.key)
      .map((source) => [source.key, source]),
  );

const cachedSurfaceKeys = (catalog, surface) =>
  new Set(
    (catalog?.sources || [])
      .filter((source) => source?.[surface] === true)
      .map((source) => source.key),
  );

const mergeCatalogSources = (publicCatalog, displayCatalog) => {
  const sources = new Map();
  for (const catalog of [displayCatalog, publicCatalog]) {
    for (const source of catalog?.sources || []) {
      if (!source?.key) continue;
      sources.set(source.key, {
        ...(sources.get(source.key) || {}),
        ...source,
      });
    }
  }
  return [...sources.values()];
};

export const mergeDirectoryAndReadCatalogs = ({
  directoryCatalog = null,
  publicCatalog = null,
  displayCatalog = null,
  cachedCatalog = null,
} = {}) => {
  const baseCatalog = directoryCatalog || publicCatalog || displayCatalog;
  if (!baseCatalog) return null;

  const publicKeys = publicCatalog
    ? new Set(publicCatalog.sources.map((source) => source.key))
    : cachedSurfaceKeys(cachedCatalog, "publicAvailable");
  const displayKeys = displayCatalog
    ? new Set(displayCatalog.sources.map((source) => source.key))
    : cachedSurfaceKeys(cachedCatalog, "displayAvailable");
  const publicSources = sourceMap(publicCatalog);
  const displaySources = sourceMap(displayCatalog);
  const cachedSources = sourceMap(cachedCatalog);
  const sources =
    directoryCatalog?.sources ||
    mergeCatalogSources(publicCatalog, displayCatalog);

  return {
    ...baseCatalog,
    sources: sources.map((source) => {
      const publicAvailable = publicKeys.has(source.key);
      const displayAvailable = displayKeys.has(source.key);
      const readableSurfaceSource = publicAvailable
        ? publicSources.get(source.key) || cachedSources.get(source.key)
        : displayAvailable
          ? displaySources.get(source.key) || cachedSources.get(source.key)
          : null;

      return {
        ...source,
        ...(readableSurfaceSource || {}),
        publicAvailable,
        displayAvailable,
      };
    }),
  };
};
