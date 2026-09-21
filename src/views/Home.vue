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
    <section
      v-if="showMusicPlatformStrip"
      class="music-platform-strip"
      :aria-label="musicPlatformCopy.title"
    >
      <div class="music-platform-strip__intro">
        <strong>{{ musicPlatformCopy.title }}</strong>
        <span>{{ musicPlatformCopy.description }}</span>
      </div>
      <div class="music-platform-strip__items">
        <component
          :is="item.external ? 'a' : 'router-link'"
          v-for="item in musicPlatformLinks"
          :key="item.source"
          class="music-platform-strip__item"
          v-bind="item.external
            ? { href: item.href, target: '_blank', rel: 'noopener noreferrer' }
            : { to: item.to }"
        >
          <img :src="getSourceLogo(item.source)" :alt="item.label" />
          <span>{{ item.label }}</span>
          <em>{{ item.external ? musicPlatformCopy.official : musicPlatformCopy.ranking }}</em>
        </component>
      </div>
    </section>
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
  buildRankPath,
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
import { getSourceLogo } from "@/utils/sourceLogos";
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
const MUSIC_PLATFORM_COPY = {
  "zh-CN": {
    title: "热门音乐平台",
    description: "站内展示已准入榜单；其余主流平台直达官方排行榜。",
    ranking: "站内榜单",
    official: "官方榜单",
  },
  en: {
    title: "Popular music platforms",
    description: "Admitted rankings stay in-site; other major platforms link to their official chart pages.",
    ranking: "On-site",
    official: "Official charts",
  },
  "zh-TW": {
    title: "熱門音樂平台",
    description: "站內展示已准入榜單；其他主流平台直達官方排行榜。",
    ranking: "站內榜單",
    official: "官方榜單",
  },
  ja: {
    title: "人気の音楽プラットフォーム",
    description: "公開対象のランキングはサイト内で表示し、その他は公式ランキングへ案内します。",
    ranking: "サイト内",
    official: "公式ランキング",
  },
  ko: {
    title: "인기 음악 플랫폼",
    description: "공개 허용된 랭킹은 사이트에서 보고, 그 외 주요 플랫폼은 공식 차트로 연결합니다.",
    ranking: "사이트 내",
    official: "공식 차트",
  },
};

const MUSIC_PLATFORM_LINKS = [
  { source: "apple-music", label: "Apple Music", variant: "songs" },
  { source: "qq-music", label: "QQ音乐", href: "https://y.qq.com/n/ryqq_v2/toplist/62" },
  { source: "netease-music", label: "网易云音乐", href: "https://music.163.com/discover/toplist?id=19723756" },
  { source: "kugou-music", label: "酷狗音乐", href: "https://www.kugou.com/yy/rank/home/1-6666.html" },
  { source: "kuwo-music", label: "酷我音乐", href: "https://m.kuwo.cn/newh5app/ranklist_detail/16" },
];

const showMusicPlatformStrip = computed(() =>
  ["文娱", "音乐"].includes(forcedCategoryName.value),
);
const musicPlatformCopy = computed(
  () => MUSIC_PLATFORM_COPY[locale.value] || MUSIC_PLATFORM_COPY["zh-CN"],
);
const musicPlatformLinks = computed(() =>
  MUSIC_PLATFORM_LINKS.map((item) => ({
    ...item,
    external: Boolean(item.href),
    ...(item.href
      ? {}
      : {
          to: buildRankPath(
            locale.value,
            item.source,
            item.variant || "",
          ),
        }),
  })),
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
const scopedNews = computed(() => {
  let scoped = renderNews.value;
  const targetCategory =
    forcedCategoryName.value ||
    (store.categoryEnabled && store.activeCategory !== "全部"
      ? store.activeCategory
      : "");
  if (targetCategory) {
    scoped = scoped.filter((item) =>
      sourceBelongsToCategory(item, targetCategory, store.categories),
    );
  } else {
    scoped = scoped.filter((item) => !item.systemProjection);
  }
  return scoped;
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

  .music-platform-strip {
    display: grid;
    grid-template-columns: minmax(190px, 0.72fr) minmax(0, 2.2fr);
    align-items: center;
    gap: 16px;
    margin-bottom: 18px;
    padding: 12px 14px;
    border: 1px solid var(--n-border-color);
    border-radius: 12px;
    background: var(--n-color);
  }
  .music-platform-strip__intro {
    display: grid;
    gap: 3px;
    min-width: 0;
  }
  .music-platform-strip__intro strong {
    font-size: 14px;
    line-height: 1.35;
  }
  .music-platform-strip__intro span {
    color: var(--n-text-color-3);
    font-size: 11px;
    line-height: 1.45;
  }
  .music-platform-strip__items {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 6px;
    min-width: 0;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .music-platform-strip__items::-webkit-scrollbar {
    display: none;
  }
  .music-platform-strip__item {
    display: inline-grid;
    grid-template-columns: 24px max-content auto;
    align-items: center;
    gap: 7px;
    min-height: 38px;
    padding: 5px 8px;
    border: 1px solid var(--n-border-color);
    border-radius: 9px;
    color: var(--n-text-color);
    text-decoration: none;
    white-space: nowrap;
    transition: border-color 0.16s ease, background-color 0.16s ease;
  }
  .music-platform-strip__item:hover {
    border-color: var(--n-primary-color);
    background: var(--n-action-color);
  }
  .music-platform-strip__item img {
    width: 24px;
    height: 24px;
    border-radius: 6px;
    object-fit: contain;
  }
  .music-platform-strip__item span {
    font-size: 12px;
    font-weight: 600;
  }
  .music-platform-strip__item em {
    color: var(--n-text-color-3);
    font-size: 10px;
    font-style: normal;
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
  .home .music-platform-strip {
    grid-template-columns: 1fr;
    gap: 9px;
  }
  .home .music-platform-strip__items {
    justify-content: flex-start;
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
