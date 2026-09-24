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
    <!-- <n-alert type="info" :show-icon="false" style="margin-bottom: 20px">
      站点未完工
    </n-alert> -->
    <CategorySourceRail
      v-if="supportsViewMode && categoryView === 'stream'"
      :sources="scopedNews"
      @reorder="saveStreamOrder"
    />
    <div
      v-else-if="showAllSplitDirectory"
      class="all-split-layout"
    >
      <nav class="all-category-toc" :aria-label="allPageCopy.categoryDirectory">
        <button
          v-for="section in allCategorySections"
          :key="section.id"
          type="button"
          :class="{ 'is-active': activeAllCategoryId === section.id }"
          @click="scrollToAllCategory(section.id)"
        >
          <span>{{ section.label }}</span>
          <em>{{ section.items.length }}</em>
        </button>
      </nav>
      <div class="all-category-groups">
        <section
          v-for="section in allCategorySections"
          :id="'all-ranking-category-' + section.id"
          :key="section.id"
          class="all-category-section"
          :data-all-category="section.id"
        >
          <header class="all-category-section__header">
            <strong>{{ section.label }}</strong>
            <span>{{ rankingCountLabel(section.items.length) }}</span>
          </header>
          <div
            class="news-grid"
            :class="{ 'is-compact': store.compactMode }"
            :style="{ '--home-grid-columns': String(desktopColumns) }"
          >
            <div
              v-for="(item, index) in section.items"
              :key="item.cardKey"
              class="news-card"
              :class="{ 'with-entrance': enableCardEntrance }"
              :style="{ animationDelay: index / 10 + 0.1 + 's' }"
            >
              <HotList :hotData="item" />
            </div>
          </div>
        </section>
      </div>
    </div>
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
  getCategoryLabel,
  getCategoryNameBySlug,
  getLocaleFromRoute,
  normalizeLocale,
} from "@/utils/locale";
import {
  GAME_DEALS_TOPIC_METADATA,
  WOOL_TOPIC_METADATA,
} from "@/config/site-metadata.mjs";
import { VARIANT_CATEGORY_PROJECTIONS } from "@/config/taxonomy-v3";
import {
  getSourceCategoryIds,
  sourceBelongsToCategory,
} from "@/utils/categoryTree";
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
  return [...baseSources, ...systemProjected].sort(
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
const ALL_PAGE_COPY = {
  "zh-CN": {
    categoryDirectory: "榜单分类目录",
    rankingCount: "{count} 个榜单",
    other: "其他",
  },
  "zh-TW": {
    categoryDirectory: "榜單分類目錄",
    rankingCount: "{count} 個榜單",
    other: "其他",
  },
  en: {
    categoryDirectory: "Ranking categories",
    rankingCount: "{count} rankings",
    other: "Other",
  },
  ja: {
    categoryDirectory: "ランキング分類",
    rankingCount: "{count}件",
    other: "その他",
  },
  ko: {
    categoryDirectory: "랭킹 카테고리",
    rankingCount: "{count}개 랭킹",
    other: "기타",
  },
};
const allPageCopy = computed(
  () => ALL_PAGE_COPY[locale.value] || ALL_PAGE_COPY["zh-CN"],
);
const rankingCountLabel = (count) =>
  allPageCopy.value.rankingCount.replace("{count}", String(count));
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

const ALL_SPLIT_SCOPE = "__all__";
const normalizeVariantValues = (values = []) =>
  [
    ...new Set(
      (Array.isArray(values) ? values : [])
        .map((value) => String(value?.value ?? value ?? "").trim())
        .filter(Boolean),
    ),
  ];

const allSplitTargets = computed(() =>
  renderNews.value
    .filter((item) => !item.systemProjection && !item.projectionInstanceId)
    .map((item) => {
      const variants = normalizeVariantValues(
        getSourceVariantOptions(item.name),
      );
      return variants.length > 1
        ? { sourceName: item.name, variants }
        : null;
    })
    .filter(Boolean),
);

const splitSelectionFor = (scopeRef, sourceName, variants = []) => {
  const normalizedVariants = normalizeVariantValues(variants);
  const allowed = new Set(normalizedVariants);
  const configured = store
    .getCategorySplitVariants(scopeRef, sourceName)
    .filter((value) => allowed.has(String(value)));
  if (configured.length) return configured;
  return store.isCategorySourceSplit(scopeRef, sourceName)
    ? normalizedVariants
    : [];
};

const allScopeNews = computed(() => {
  const baseSources = renderNews.value.filter(
    (item) => !item.systemProjection && !item.projectionInstanceId,
  );
  const scoped = [];

  for (const base of baseSources) {
    const options = getSourceVariantOptions(base.name)
      .map((option) => ({
        value: String(option?.value || "").trim(),
        label: String(option?.label || option?.value || "").trim(),
      }))
      .filter((option) => option.value);
    const variants = normalizeVariantValues(options);

    if (variants.length < 2) {
      scoped.push(base);
      continue;
    }

    const selected = splitSelectionFor(
      ALL_SPLIT_SCOPE,
      base.name,
      variants,
    );
    const selectedSet = new Set(selected);
    const remaining = variants.filter((variant) => !selectedSet.has(variant));
    const sharedMeta = {
      categorySplitRef: ALL_SPLIT_SCOPE,
      categoryProjectionGroup: true,
      categoryAllProjectionVariants: variants,
      categorySplitVariants: selected,
    };

    if (remaining.length) {
      scoped.push({
        ...base,
        ...sharedMeta,
        categoryProjectionVariants: remaining,
        cardKey: `all-group:${base.name}`,
      });
    }

    options.forEach((option, index) => {
      if (!selectedSet.has(option.value)) return;
      const taxonomyProjection = VARIANT_CATEGORY_PROJECTIONS.find(
        (item) =>
          item.sourceName === base.name &&
          String(item.variant || "") === option.value,
      );
      scoped.push({
        ...base,
        ...sharedMeta,
        categoryIds: taxonomyProjection?.categoryIds?.length
          ? taxonomyProjection.categoryIds.slice()
          : Array.isArray(base.categoryIds)
            ? base.categoryIds.slice()
            : undefined,
        order: Number(base.order || 0) + 0.0001 * (index + 1),
        cardKey: `all-ranking:${base.name}:${option.value}`,
        projectionInstanceId: `all:${base.name}:${option.value}`,
        projectionVariant: option.value,
        projectionLabel: option.label,
        systemProjection: true,
        categoryProjectionVariants: [option.value],
        categorySplitProjection: true,
        categorySplitPrimary: remaining.length === 0 && index === 0,
      });
    });
  }

  return scoped.sort(
    (left, right) => Number(left.order || 0) - Number(right.order || 0),
  );
});

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

const scopedNews = computed(() => {
  const targetCategory = currentCategoryName.value;
  if (!targetCategory) {
    return allScopeNews.value;
  }

  const matched = renderNews.value.filter((item) =>
    sourceBelongsToCategory(item, targetCategory, store.categories),
  );
  const projectionGroups = categoryProjectionGroups.value;
  const scoped = matched.filter(
    (item) => !item.systemProjection && !projectionGroups.has(item.name),
  );

  for (const [sourceName, projections] of projectionGroups) {
    const variants = [
      ...new Set(
        projections
          .map((item) => String(item.projectionVariant || ""))
          .filter(Boolean),
      ),
    ];
    const validVariants = new Set(variants);
    const configuredSplitVariants = store
      .getCategorySplitVariants(targetCategory, sourceName)
      .filter((variant) => validVariants.has(String(variant)));
    const splitVariants = configuredSplitVariants.length
      ? configuredSplitVariants
      : store.isCategorySourceSplit(targetCategory, sourceName)
        ? variants
        : [];
    const splitSet = new Set(splitVariants);
    const splitProjections = projections.filter((item) =>
      splitSet.has(String(item.projectionVariant || "")),
    );
    const groupedProjections = projections.filter(
      (item) => !splitSet.has(String(item.projectionVariant || "")),
    );
    const canSplit = variants.length > 1;
    const sharedProjectionMeta = {
      categorySplitRef: targetCategory,
      categoryProjectionGroup: canSplit,
      categoryAllProjectionVariants: variants,
      categorySplitVariants: splitVariants,
    };

    if (splitProjections.length) {
      scoped.push(
        ...splitProjections.map((item, index) => ({
          ...item,
          ...sharedProjectionMeta,
          categoryProjectionVariants: [item.projectionVariant],
          categorySplitProjection: true,
          categorySplitPrimary:
            groupedProjections.length === 0 && index === 0,
        })),
      );
    }

    if (!groupedProjections.length) continue;

    const base = renderNews.value.find(
      (item) =>
        item.name === sourceName &&
        !item.systemProjection &&
        !item.projectionInstanceId,
    );
    if (!base) {
      scoped.push(
        ...groupedProjections.map((item) => ({
          ...item,
          ...sharedProjectionMeta,
          categoryProjectionVariants: [item.projectionVariant],
          categorySplitProjection: false,
        })),
      );
      continue;
    }

    const groupedVariants = groupedProjections
      .map((item) => String(item.projectionVariant || ""))
      .filter(Boolean);
    scoped.push({
      ...base,
      ...sharedProjectionMeta,
      categoryProjectionVariants: groupedVariants,
      categoryIds: [
        ...new Set(groupedProjections.flatMap((item) => item.categoryIds || [])),
      ],
      ...(groupedProjections.length === 1
        ? { subtype: groupedProjections[0].projectionLabel || base.subtype }
        : {}),
      order: Math.min(
        Number(base.order || 0),
        ...groupedProjections.map((item) => Number(item.order || 0)),
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

const showAllSplitDirectory = computed(() =>
  Boolean(
    isHomeRoute.value &&
      categoryView.value === "card" &&
      allSplitTargets.value.length &&
      allSplitTargets.value.every(
        (target) =>
          splitSelectionFor(
            ALL_SPLIT_SCOPE,
            target.sourceName,
            target.variants,
          ).length === target.variants.length,
      ),
  ),
);

const categoryPathForItem = (item) => {
  const [categoryId] = getSourceCategoryIds(item, store.categories);
  let node =
    store.categories.find(
      (category) => String(category.id) === String(categoryId || ""),
    ) ||
    store.categories.find((category) => category.name === item?.category) ||
    store.categories.find((category) => category.id === "general") ||
    null;
  const path = [];
  const seen = new Set();
  while (node && !seen.has(String(node.id))) {
    seen.add(String(node.id));
    path.unshift(node);
    node = node.parentId
      ? store.categories.find(
          (category) => String(category.id) === String(node.parentId),
        )
      : null;
  }
  return path;
};
const compareCategoryPaths = (left, right) => {
  const a = categoryPathForItem(left);
  const b = categoryPathForItem(right);
  const depth = Math.max(a.length, b.length);
  for (let index = 1; index < depth; index += 1) {
    const aOrder = Number(a[index]?.order ?? 9999);
    const bOrder = Number(b[index]?.order ?? 9999);
    if (aOrder !== bOrder) return aOrder - bOrder;
  }
  const orderDiff = Number(left.order || 0) - Number(right.order || 0);
  if (orderDiff) return orderDiff;
  return String(left.projectionLabel || left.label || left.name).localeCompare(
    String(right.projectionLabel || right.label || right.name),
    locale.value,
  );
};

const allCategorySections = computed(() => {
  if (!showAllSplitDirectory.value) return [];
  const groups = new Map();
  for (const item of filteredNews.value) {
    const path = categoryPathForItem(item);
    const category = path[0] || null;
    const id = String(category?.id || "other");
    if (!groups.has(id)) {
      groups.set(id, {
        id,
        category,
        label: category
          ? category.builtin
            ? getCategoryLabel(category.name, locale.value)
            : category.name
          : allPageCopy.value.other,
        order: Number(
          category?.navOrder ?? category?.order ?? 9999,
        ),
        items: [],
      });
    }
    groups.get(id).items.push(item);
  }
  return [...groups.values()]
    .map((section) => ({
      ...section,
      items: section.items.slice().sort(compareCategoryPaths),
    }))
    .sort((left, right) => left.order - right.order);
});

const activeAllCategoryId = ref("");
const scrollToAllCategory = (categoryId) => {
  if (typeof document === "undefined") return;
  activeAllCategoryId.value = categoryId;
  document
    .getElementById(`all-ranking-category-${categoryId}`)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
};
const syncActiveAllCategoryFromScroll = () => {
  if (typeof document === "undefined" || !showAllSplitDirectory.value) return;
  const sections = allCategorySections.value
    .map((section) => ({
      id: section.id,
      el: document.getElementById(`all-ranking-category-${section.id}`),
    }))
    .filter((item) => item.el);
  if (!sections.length) return;
  let active = sections[0].id;
  const anchor = 128;
  for (const section of sections) {
    if (section.el.getBoundingClientRect().top <= anchor) active = section.id;
    else break;
  }
  activeAllCategoryId.value = active;
};

watch(
  () => allCategorySections.value.map((section) => section.id).join("|"),
  () => {
    const first = allCategorySections.value[0]?.id || "";
    if (
      !allCategorySections.value.some(
        (section) => section.id === activeAllCategoryId.value,
      )
    ) {
      activeAllCategoryId.value = first;
    }
    nextTick(syncActiveAllCategoryFromScroll);
  },
  { immediate: true },
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
  window.addEventListener("scroll", syncActiveAllCategoryFromScroll, {
    passive: true,
  });
  nextTick(syncActiveAllCategoryFromScroll);
});

onBeforeUnmount(() => {
  homeResizeObserver?.disconnect?.();
  homeResizeObserver = null;
  window.removeEventListener(
    "dailyhot:subtype-interaction",
    handleSubtypeInteraction,
  );
  window.removeEventListener("scroll", syncActiveAllCategoryFromScroll);
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

  .all-split-layout {
    display: grid;
    grid-template-columns: 112px minmax(0, 1fr);
    gap: 18px;
    align-items: start;
  }

  .all-category-toc {
    position: sticky;
    top: 76px;
    display: grid;
    gap: 2px;
    max-height: calc(100vh - 96px);
    overflow-y: auto;
    padding: 4px;

    button {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: center;
      gap: 6px;
      width: 100%;
      min-height: 30px;
      padding: 5px 7px;
      border: 0;
      border-radius: 7px;
      background: transparent;
      color: var(--n-text-color-3);
      cursor: pointer;
      text-align: left;
      transition: background 0.16s ease, color 0.16s ease;

      &:hover,
      &.is-active {
        background: var(--n-action-color);
        color: var(--n-text-color);
      }

      &.is-active {
        font-weight: 650;
      }

      span {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      em {
        font-size: 10px;
        font-style: normal;
        font-variant-numeric: tabular-nums;
        opacity: 0.7;
      }
    }
  }

  .all-category-groups {
    min-width: 0;
  }

  .all-category-section {
    scroll-margin-top: 92px;

    & + & {
      margin-top: 28px;
    }
  }

  .all-category-section__header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 10px;
    padding: 0 2px;

    strong {
      font-size: 15px;
    }

    span {
      color: var(--n-text-color-3);
      font-size: 11px;
    }
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

@media (max-width: 980px) {
  .home .all-split-layout {
    grid-template-columns: minmax(0, 1fr);
    gap: 12px;
  }

  .home .all-category-toc {
    position: sticky;
    top: 56px;
    z-index: 3;
    display: flex;
    gap: 4px;
    max-height: none;
    overflow-x: auto;
    padding: 6px 0;
    background: var(--n-color);

    button {
      flex: 0 0 auto;
      width: auto;
      grid-template-columns: auto auto;
      white-space: nowrap;
    }
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
