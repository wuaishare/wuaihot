<template>
  <div ref="homeRef" class="home">
    <router-link
      v-if="isGamesCategory"
      :to="gameDealsTopicPath"
      class="wool-topic-entry"
    >
      <div>
        <strong>{{ gameDealsTopicCopy.title }}</strong>
        <p>{{ gameDealsTopicCopy.description }}</p>
      </div>
      <em>{{ gameDealsTopicCopy.open }} →</em>
    </router-link>
    <router-link
      v-if="isWoolCategory"
      :to="woolTopicPath"
      class="wool-topic-entry"
    >
      <div>
        <span>{{ woolTopicCopy.eyebrow }}</span>
        <strong>{{ woolTopicCopy.title }}</strong>
        <p>{{ woolTopicCopy.description }}</p>
      </div>
      <em>{{ woolTopicCopy.open }} →</em>
    </router-link>
    <div
      v-if="categorySplitSourceNames.length"
      class="category-split-toolbar"
    >
      <div class="category-split-toolbar__copy">
        <strong>{{ categorySplitCopy.title }}</strong>
        <span>{{ categorySplitCopy.description }}</span>
      </div>
      <n-button
        size="small"
        secondary
        strong
        @click="toggleAllCategorySplits"
      >
        {{ allCategorySourcesSplit ? categorySplitCopy.mergeAll : categorySplitCopy.splitAll }}
      </n-button>
    </div>
    <!-- <n-alert type="info" :show-icon="false" style="margin-bottom: 20px">
      站点未完工
    </n-alert> -->
    <CategorySourceRail
      v-if="supportsViewMode && categoryView === 'stream'"
      :sources="scopedNews"
      @reorder="saveStreamOrder"
    />
    <draggable
      v-else-if="sortableNews[0]"
      v-model="sortableNews"
      class="news-grid"
      :class="{ 'is-compact': store.compactMode }"
      :style="{ '--home-grid-columns': String(desktopColumns) }"
      item-key="cardKey"
      :animation="180"
      :disabled="cardDragDisabled"
      handle=".card-drag-handle"
      filter=".no-card-drag, .no-card-drag *"
      :prevent-on-filter="false"
      :fallback-tolerance="8"
      :touch-start-threshold="8"
      ghost-class="news-card-ghost"
      chosen-class="news-card-chosen"
      drag-class="news-card-drag"
      @start="startCardDrag"
      @end="saveCardOrder"
    >
      <template #item="{ element: item, index }">
        <div
          class="news-card"
          :class="{ 'with-entrance': enableCardEntrance }"
          :key="`${store.activeCategory}-${item.cardKey}`"
          :style="{ animationDelay: index / 10 + 0.2 + 's' }"
        >
          <HotList :hotData="item" />
        </div>
      </template>
    </draggable>
    <div
      class="error"
      v-if="
        categoryView === 'card' &&
        renderNews[0] &&
        sortableNews.length === 0
      "
    >
      <n-divider dashed class="tip">
        {{ t("common.emptyCategory") }}
      </n-divider>
    </div>
    <div class="error" v-else-if="!renderNews[0]">
      <n-divider dashed class="tip"> {{ t("common.noContent") }} </n-divider>
      <n-space justify="center">
        <n-button size="large" secondary strong @click="reset">
          {{ t("home.resetAction") }}
        </n-button>
      </n-space>
    </div>
  </div>
</template>

<script setup>
import { mainStore } from "@/store";
import HotList from "@/components/HotList.vue";
import CategorySourceRail from "@/components/CategorySourceRail.vue";
import draggable from "vuedraggable";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import {
  buildFixedLocalePath,
  getCategoryNameBySlug,
  getLocaleFromRoute,
  normalizeLocale,
} from "@/utils/locale";
import {
  GAME_DEALS_TOPIC_METADATA,
  WOOL_TOPIC_METADATA,
} from "@/config/site-metadata.mjs";
import { VARIANT_CATEGORY_PROJECTIONS } from "@/config/taxonomy-v3";
import { sourceBelongsToCategory } from "@/utils/categoryTree";
import { getSourceDisplayLabel } from "@/utils/sourceLabels";
import { getSourceVariantOptions } from "@/utils/sourceSubtypes";
import { resolveResponsiveCardColumns } from "@/utils/responsiveColumns";

const store = mainStore();
const { t } = useI18n({ useScope: "global" });
const route = useRoute();
const enableCardEntrance = ref(true);
const isCardDragging = ref(false);
const isSubtypeInteracting = ref(false);
const sortableNews = ref([]);
const homeRef = ref(null);
const homeWidth = ref(typeof window !== "undefined" ? window.innerWidth : 1400);
let homeResizeObserver = null;
const clampDesktopColumns = (value, fallback) => Math.min(5, Math.max(3, Math.round(Number(value) || fallback)));
const requestedDesktopColumns = computed(() =>
  store.compactMode
    ? clampDesktopColumns(store.homeCompactColumns, 5)
    : clampDesktopColumns(store.homeCardColumns, 4),
);
const desktopColumns = computed(() =>
  resolveResponsiveCardColumns({
    width: homeWidth.value,
    requested: requestedDesktopColumns.value,
    compact: store.compactMode,
  }),
);
const renderNews = computed(() => {
  const baseSources = store.newsArr
    .filter((item) => item.show)
    .map((item) => ({
      ...item,
      cardKey: `source:${item.name}`,
    }));
  const baseByName = new Map(baseSources.map((item) => [item.name, item]));
  const variantProjectionByKey = new Map(
    VARIANT_CATEGORY_PROJECTIONS.map((item) => [
      `${item.sourceName}::${item.variant}`,
      item,
    ]),
  );
  const systemProjected = VARIANT_CATEGORY_PROJECTIONS.map((projection, index) => {
    const base = baseByName.get(projection.sourceName);
    if (!base) return null;
    const availableVariants = base.catalogManaged
      ? getSourceVariantOptions(projection.sourceName)
      : [];
    if (
      availableVariants.length &&
      !availableVariants.some((item) => item.value === projection.variant)
    ) {
      return null;
    }
    return {
      ...base,
      categoryIds: projection.categoryIds.slice(),
      order: Number(base.order || 0) + 0.0001 * (index + 1),
      cardKey: `system-projection:${projection.id}`,
      projectionInstanceId: `system:${projection.id}`,
      projectionVariant: projection.variant,
      projectionLabel: projection.label,
      projectionRemovable: false,
      systemProjection: true,
    };
  }).filter(Boolean);
  const promoted = (store.promotedRankings || [])
    .slice()
    .sort((left, right) => Number(left?.order || 0) - Number(right?.order || 0))
    .map((projection, index) => {
      const base = baseByName.get(projection?.sourceName);
      if (!base) return null;
      const taxonomyProjection = variantProjectionByKey.get(
        `${projection.sourceName}::${projection.variant}`,
      );
      return {
        ...base,
        ...(taxonomyProjection?.categoryIds?.length
          ? { categoryIds: taxonomyProjection.categoryIds.slice() }
          : {}),
        order: Number(base.order || 0) + 0.001 * (index + 1),
        cardKey: `projection:${projection.id}`,
        projectionInstanceId: projection.id,
        projectionVariant: projection.variant,
        projectionLabel: projection.label,
        projectionRemovable: true,
      };
    })
    .filter(Boolean);
  return [...baseSources, ...systemProjected, ...promoted].sort(
    (left, right) => Number(left.order || 0) - Number(right.order || 0),
  );
});
const forcedCategoryName = computed(() =>
  getCategoryNameBySlug(route.params?.categorySlug, store.categories),
);
const isHomeRoute = computed(() =>
  ["home", "home-locale"].includes(String(route.name || "")),
);
const isCategoryRoute = computed(() =>
  ["category", "category-locale"].includes(String(route.name || "")),
);
const supportsViewMode = computed(
  () => isHomeRoute.value || isCategoryRoute.value,
);
const categoryView = computed(() =>
  store.resolveCategoryViewMode(
    isCategoryRoute.value ? forcedCategoryName.value || null : null,
  ),
);
const locale = computed(() => normalizeLocale(getLocaleFromRoute(route)));
const queryValue = (value) =>
  String(Array.isArray(value) ? value[0] || "" : value || "").trim();
const searchQuery = computed(() => queryValue(route.query.q).toLowerCase());
const sourceMatchesSearch = (item) => {
  const query = searchQuery.value;
  if (!query) return true;
  const categoryNames = Array.isArray(item.categoryIds)
    ? item.categoryIds
        .map((id) => store.categories.find((category) => category.id === id)?.name)
        .filter(Boolean)
    : [];
  const haystack = [
    item.name,
    item.label,
    item.category,
    item.subtype,
    item.projectionLabel,
    item.projectionVariant,
    ...categoryNames,
    getSourceDisplayLabel(item.name, locale.value, item.label || item.name),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
};
const isWoolCategory = computed(() => forcedCategoryName.value === "羊毛");
const isGamesCategory = computed(() => forcedCategoryName.value === "游戏");
const CATEGORY_SPLIT_COPY = {
  "zh-CN": {
    title: "多榜平台",
    description: "默认合并为一个平台卡片，可按需拆分成独立榜单。",
    splitAll: "全部拆分",
    mergeAll: "恢复合并",
  },
  en: {
    title: "Multi-ranking sources",
    description: "Grouped by platform by default; split rankings only when you need them.",
    splitAll: "Split all",
    mergeAll: "Group all",
  },
  "zh-TW": {
    title: "多榜平台",
    description: "預設合併為一個平台卡片，可按需拆分成獨立榜單。",
    splitAll: "全部拆分",
    mergeAll: "恢復合併",
  },
  ja: {
    title: "複数ランキング",
    description: "通常はプラットフォーム単位でまとめ、必要なときだけ分割表示します。",
    splitAll: "すべて分割",
    mergeAll: "すべて統合",
  },
  ko: {
    title: "다중 랭킹 플랫폼",
    description: "기본은 플랫폼 단위로 묶고 필요할 때만 개별 랭킹으로 분리합니다.",
    splitAll: "모두 분리",
    mergeAll: "모두 묶기",
  },
};
const categorySplitCopy = computed(
  () => CATEGORY_SPLIT_COPY[locale.value] || CATEGORY_SPLIT_COPY["zh-CN"],
);
const gameDealsTopicCopy = computed(
  () =>
    GAME_DEALS_TOPIC_METADATA[locale.value] ||
    GAME_DEALS_TOPIC_METADATA["zh-CN"],
);
const gameDealsTopicPath = computed(() =>
  buildFixedLocalePath(locale.value, "/topic/game-deals"),
);
const woolTopicCopy = computed(
  () => WOOL_TOPIC_METADATA[locale.value] || WOOL_TOPIC_METADATA["zh-CN"],
);
const woolTopicPath = computed(() =>
  buildFixedLocalePath(locale.value, "/topic/wool"),
);
const currentCategoryName = computed(() =>
  forcedCategoryName.value ||
  (store.categoryEnabled && store.activeCategory !== "全部"
    ? store.activeCategory
    : ""),
);

const categoryProjectionGroups = computed(() => {
  const targetCategory = currentCategoryName.value;
  const groups = new Map();
  if (!targetCategory) return groups;
  for (const item of renderNews.value) {
    if (
      !item.systemProjection ||
      !sourceBelongsToCategory(item, targetCategory, store.categories)
    ) {
      continue;
    }
    const group = groups.get(item.name) || [];
    group.push(item);
    groups.set(item.name, group);
  }
  return groups;
});

const categorySplitSourceNames = computed(() =>
  [...categoryProjectionGroups.value.entries()]
    .filter(([, projections]) => projections.length > 1)
    .map(([sourceName]) => sourceName),
);

const allCategorySourcesSplit = computed(() => {
  const names = categorySplitSourceNames.value;
  return Boolean(
    names.length &&
      names.every((sourceName) =>
        store.isCategorySourceSplit(currentCategoryName.value, sourceName),
      ),
  );
});

const toggleAllCategorySplits = () => {
  const names = categorySplitSourceNames.value;
  if (!names.length) return;
  store.setCategorySourcesSplit(
    currentCategoryName.value,
    names,
    !allCategorySourcesSplit.value,
  );
};

const scopedNews = computed(() => {
  const targetCategory = currentCategoryName.value;
  if (!targetCategory) {
    return renderNews.value.filter((item) => !item.systemProjection);
  }

  const matched = renderNews.value.filter((item) =>
    sourceBelongsToCategory(item, targetCategory, store.categories),
  );
  const projectionGroups = categoryProjectionGroups.value;
  const scoped = matched.filter(
    (item) =>
      !item.systemProjection &&
      (item.projectionInstanceId || !projectionGroups.has(item.name)),
  );

  for (const [sourceName, projections] of projectionGroups) {
    const variants = [
      ...new Set(
        projections.map((item) => String(item.projectionVariant || "")).filter(Boolean),
      ),
    ];
    const canSplit = variants.length > 1;
    const sharedProjectionMeta = {
      categorySplitRef: targetCategory,
      categoryProjectionGroup: canSplit,
      categoryProjectionVariants: variants,
    };

    if (canSplit && store.isCategorySourceSplit(targetCategory, sourceName)) {
      scoped.push(
        ...projections.map((item) => ({
          ...item,
          ...sharedProjectionMeta,
        })),
      );
      continue;
    }

    const base = renderNews.value.find(
      (item) =>
        item.name === sourceName &&
        !item.systemProjection &&
        !item.projectionInstanceId,
    );
    if (!base) {
      scoped.push(
        ...projections.map((item) => ({
          ...item,
          ...sharedProjectionMeta,
        })),
      );
      continue;
    }

    scoped.push({
      ...base,
      ...sharedProjectionMeta,
      categoryIds: [
        ...new Set(projections.flatMap((item) => item.categoryIds || [])),
      ],
      order: Math.min(
        Number(base.order || 0),
        ...projections.map((item) => Number(item.order || 0)),
      ),
      cardKey: "category-group:" + targetCategory + ":" + sourceName,
    });
  }

  return scoped.sort(
    (left, right) => Number(left.order || 0) - Number(right.order || 0),
  );
});
const filteredNews = computed(() =>
  categoryView.value === "card"
    ? scopedNews.value.filter(sourceMatchesSearch)
    : scopedNews.value,
);
const syncSortableNews = () => {
  sortableNews.value = filteredNews.value.slice();
};
const cardDragDisabled = computed(() => isSubtypeInteracting.value);
let subtypeInteractionTimer = null;

watch(
  () => filteredNews.value.map((item) => item.cardKey).join("|"),
  () => {
    if (!isCardDragging.value) syncSortableNews();
  },
  { immediate: true },
);

onMounted(() => {
  window.setTimeout(() => {
    enableCardEntrance.value = false;
  }, 400);
  const updateHomeWidth = () => {
    if (homeRef.value) homeWidth.value = homeRef.value.getBoundingClientRect().width;
  };
  updateHomeWidth();
  if (typeof ResizeObserver !== "undefined" && homeRef.value) {
    homeResizeObserver = new ResizeObserver(updateHomeWidth);
    homeResizeObserver.observe(homeRef.value);
  } else {
    window.addEventListener("resize", updateHomeWidth);
    homeResizeObserver = { disconnect: () => window.removeEventListener("resize", updateHomeWidth) };
  }
  window.addEventListener(
    "dailyhot:subtype-interaction",
    handleSubtypeInteraction,
  );
});

onBeforeUnmount(() => {
  homeResizeObserver?.disconnect?.();
  homeResizeObserver = null;
  window.removeEventListener(
    "dailyhot:subtype-interaction",
    handleSubtypeInteraction,
  );
  if (subtypeInteractionTimer) clearTimeout(subtypeInteractionTimer);
});

const handleSubtypeInteraction = (event) => {
  if (subtypeInteractionTimer) {
    clearTimeout(subtypeInteractionTimer);
    subtypeInteractionTimer = null;
  }
  if (event?.detail?.active) {
    isSubtypeInteracting.value = true;
    return;
  }
  subtypeInteractionTimer = window.setTimeout(() => {
    isSubtypeInteracting.value = false;
    subtypeInteractionTimer = null;
  }, 120);
};

const startCardDrag = () => {
  isCardDragging.value = true;
  enableCardEntrance.value = false;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("dailyhot:hide-item-preview"));
  }
};

const saveCardOrder = () => {
  const scopedBaseNames = filteredNews.value
    .filter((item) => !item.projectionInstanceId)
    .map((item) => item.name);
  const orderedBaseNames = sortableNews.value
    .filter((item) => !item.projectionInstanceId)
    .map((item) => item.name);
  store.reorderVisibleNews(orderedBaseNames, scopedBaseNames);
  store.reorderPromotedRankings(
    sortableNews.value
      .filter((item) => item.projectionInstanceId)
      .map((item) => item.projectionInstanceId),
  );
  isCardDragging.value = false;
  syncSortableNews();
};

const saveStreamOrder = (orderedKeys = []) => {
  const baseNames = orderedKeys
    .filter((key) => String(key).startsWith("source:"))
    .map((key) => String(key).slice("source:".length));
  const scopedBaseNames = scopedNews.value
    .filter((item) => !item.projectionInstanceId)
    .map((item) => item.name);
  store.reorderVisibleNews(baseNames, scopedBaseNames);
  store.reorderPromotedRankings(
    orderedKeys
      .filter((key) => String(key).startsWith("projection:"))
      .map((key) => String(key).slice("projection:".length)),
  );
};

// 重置
const reset = () => {
  $dialog.warning({
    title: t("home.resetTitle"),
    content: t("home.resetContent"),
    positiveText: t("home.resetConfirm"),
    negativeText: t("home.resetCancel"),
    onPositiveClick: () => {
      if (typeof window !== "undefined") {
        if (window.$timeInterval) clearInterval(window.$timeInterval);
        if (window.$autoRefreshTimer) clearInterval(window.$autoRefreshTimer);
      }
      localStorage.clear();
      location.reload();
    },
  });
};
</script>

<style lang="scss" scoped>
.home {
  .wool-topic-entry {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 20px;
    padding: 17px 20px;
    border: 1px solid var(--n-border-color);
    border-radius: 12px;
    color: var(--n-text-color);
    text-decoration: none;
  }
  .wool-topic-entry span,
  .wool-topic-entry p,
  .wool-topic-entry em {
    color: var(--n-text-color-3);
  }
  .wool-topic-entry span {
    display: block;
    margin-bottom: 4px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.06em;
  }
  .wool-topic-entry strong {
    display: block;
    font-size: 16px;
  }
  .wool-topic-entry p {
    margin: 5px 0 0;
    font-size: 12px;
    line-height: 1.5;
  }
  .wool-topic-entry em {
    flex: 0 0 auto;
    font-size: 12px;
    font-style: normal;
    white-space: nowrap;
  }

  .category-split-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    margin-bottom: 14px;
    padding: 9px 11px;
    border: 1px solid var(--n-border-color);
    border-radius: 10px;
    background: var(--n-color);
  }
  .category-split-toolbar__copy {
    display: grid;
    gap: 2px;
    min-width: 0;
  }
  .category-split-toolbar__copy strong {
    font-size: 12px;
    line-height: 1.35;
  }
  .category-split-toolbar__copy span {
    color: var(--n-text-color-3);
    font-size: 11px;
    line-height: 1.45;
  }

  .news-grid {
    display: grid;
    grid-template-columns: repeat(var(--home-grid-columns, 1), minmax(0, 1fr));
    gap: 24px;

    &.is-compact {
      gap: 10px 12px;
    }
  }

  .news-card.with-entrance {
    opacity: 0;
    transform: translateY(20px);
    animation-timing-function: cubic-bezier(0.42, 0, 0.58, 1);
    animation: cardShow 0.3s forwards ease-in-out;
  }
  .tip {
    font-size: 22px;
  }

  .news-card-ghost {
    opacity: 0.72;
  }

  .news-card-chosen,
  .news-card-drag {
    cursor: grabbing;
  }
}

@media (max-width: 720px) {
  .home .category-split-toolbar {
    align-items: flex-start;
  }
  .home .category-split-toolbar__copy span {
    max-width: 42ch;
  }
}

@media (max-width: 559px) {
  .home .wool-topic-entry {
    align-items: flex-start;
    padding: 14px 15px;
  }
  .home .wool-topic-entry p {
    display: none;
  }
}

// 出现动画
@keyframes cardShow {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

</style>
