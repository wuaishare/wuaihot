import { formatCompactMetric } from "./compactMetric.js";

const LABELS = {
  "zh-CN": { author: "作者", published: "发布", hot: "热度", views: "阅读", likes: "点赞", comments: "评论", collects: "收藏" },
  "zh-TW": { author: "作者", published: "發布", hot: "熱度", views: "閱讀", likes: "讚", comments: "評論", collects: "收藏" },
  en: { author: "Author", published: "Published", hot: "Heat", views: "Views", likes: "Likes", comments: "Comments", collects: "Saves" },
  ja: { author: "投稿者", published: "公開", hot: "注目度", views: "閲覧", likes: "いいね", comments: "コメント", collects: "保存" },
  ko: { author: "작성자", published: "게시", hot: "인기도", views: "조회", likes: "좋아요", comments: "댓글", collects: "저장" },
};

const PRIMARY_METRIC_PREFIXES = [
  ["read-", "views"],
  ["like-", "likes"],
  ["collect-", "collects"],
];

const normalizeLocale = (locale = "zh-CN") => {
  const value = String(locale || "").toLowerCase();
  if (value.startsWith("zh-tw")) return "zh-TW";
  if (value.startsWith("en")) return "en";
  if (value.startsWith("ja")) return "ja";
  if (value.startsWith("ko")) return "ko";
  return "zh-CN";
};

const normalizeMetric = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric >= 0 ? numeric : null;
};

const buildMetric = (key, numeric, labels, locale, isPrimary = false) => ({
  key,
  label: labels[key],
  value: formatCompactMetric(numeric, locale),
  numeric,
  isPrimary,
});

const buildDisplayMetric = (metric = {}, locale = "zh-CN", isPrimary = false) => {
  const numeric = normalizeMetric(metric?.value);
  if (numeric === null) return null;
  const kind = String(metric?.kind || "value").trim().toLowerCase() || "value";
  const label = String(metric?.label || "").trim();
  return {
    key: `display:${kind}`,
    label: label || kind,
    value: formatCompactMetric(numeric, locale),
    numeric,
    isPrimary,
  };
};


export const getRankingPrimaryMetricKey = (variant = "") => {
  const normalized = String(variant || "").trim().toLowerCase();
  return PRIMARY_METRIC_PREFIXES.find(([prefix]) => normalized.startsWith(prefix))?.[1] || "hot";
};

export const getRankingItemTimestamp = (item = {}, updateTime = "") =>
  item?.timestamp ||
  Date.parse(item?.publishedAt || "") ||
  Date.parse(updateTime || "") ||
  Date.now();
export const formatRankingPublishedAt = (value, locale = "zh-CN") => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const normalized = normalizeLocale(locale);
  const options = {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  if (date.getFullYear() !== new Date().getFullYear()) options.year = "numeric";
  try {
    return new Intl.DateTimeFormat(normalized, options).format(date);
  } catch {
    return date.toISOString();
  }
};

export const getRankingItemMeta = (item = {}, locale = "zh-CN", context = {}) => {
  const normalized = normalizeLocale(locale);
  const labels = LABELS[normalized];
  const metadataContext = [];
  const author = String(item?.author || "").trim();
  if (author) metadataContext.push({ key: "author", label: labels.author, value: author });
  const published = formatRankingPublishedAt(item?.publishedAt, normalized);
  if (published) metadataContext.push({ key: "published", label: labels.published, value: published });
  const metricOrder = ["views", "likes", "comments", "collects"];
  const promotePrimary = context?.promotePrimary !== false;
  const requestedPrimaryMetricKey = promotePrimary
    ? getRankingPrimaryMetricKey(context?.variant)
    : null;
  const displayMetricKind = String(item?.metric?.kind || "").trim().toLowerCase();
  const displayMetricNumeric = normalizeMetric(item?.metric?.value);
  const displayMetricMatches = (key) =>
    displayMetricNumeric !== null && displayMetricKind === key;
  const primaryNumeric =
    requestedPrimaryMetricKey === null
      ? null
      : normalizeMetric(
          requestedPrimaryMetricKey === "hot"
            ? item?.hot
            : item?.metrics?.[requestedPrimaryMetricKey],
        ) ??
        (displayMetricMatches(requestedPrimaryMetricKey)
          ? displayMetricNumeric
          : null) ??
        (requestedPrimaryMetricKey === "hot" && displayMetricMatches("heat")
          ? displayMetricNumeric
          : null);
  const fallbackNumeric =
    requestedPrimaryMetricKey && requestedPrimaryMetricKey !== "hot"
      ? normalizeMetric(item?.hot) ??
        (displayMetricMatches("heat") ? displayMetricNumeric : null)
      : null;
  const resolvedPrimaryNumeric = primaryNumeric ?? fallbackNumeric;
  const legacyPrimaryMetric =
    requestedPrimaryMetricKey && resolvedPrimaryNumeric !== null
      ? buildMetric(
          requestedPrimaryMetricKey,
          resolvedPrimaryNumeric,
          labels,
          normalized,
          true,
        )
      : null;
  const genericDisplayMetric =
    displayMetricNumeric !== null &&
    !["heat", ...metricOrder].includes(displayMetricKind)
      ? buildDisplayMetric(item.metric, normalized, promotePrimary)
      : null;
  const primaryMetric = promotePrimary
    ? legacyPrimaryMetric ?? genericDisplayMetric
    : null;
  const primaryMetricKey = primaryMetric?.key ?? requestedPrimaryMetricKey;

  const metricValue = (key) =>
    normalizeMetric(item?.metrics?.[key]) ??
    (displayMetricMatches(key) ? displayMetricNumeric : null);

  const secondaryMetrics = metricOrder
    .filter((key) => key !== requestedPrimaryMetricKey)
    .flatMap((key) => {
      const numeric = metricValue(key);
      return numeric === null
        ? []
        : [buildMetric(key, numeric, labels, normalized)];
    });

  const metrics = promotePrimary
    ? [...(primaryMetric ? [primaryMetric] : []), ...secondaryMetrics]
    : [
        ...metricOrder.flatMap((key) => {
          const numeric = metricValue(key);
          return numeric === null
            ? []
            : [buildMetric(key, numeric, labels, normalized)];
        }),
        ...(genericDisplayMetric
          ? [{ ...genericDisplayMetric, isPrimary: false }]
          : []),
      ];


  return {
    context: metadataContext,
    primaryMetricKey,
    primaryMetric,
    metrics,
    hasMetrics: metrics.length > 0,
    hasContent: metadataContext.length > 0 || metrics.length > 0,
  };
};
