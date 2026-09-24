<template>
  <n-card class="directory-source-card" hoverable>
    <template #header>
      <div class="directory-source-card__header">
        <div class="directory-source-card__identity">
          <n-avatar
            class="directory-source-card__logo"
            :src="getSourceLogo(source.name)"
            :fallback-src="getSourceLogoFallback()"
          />
          <n-text class="directory-source-card__name">{{ sourceLabel }}</n-text>
        </div>
        <span class="directory-source-card__badge">{{ copy.badge }}</span>
      </div>
    </template>

    <div class="directory-source-card__content">
      <div class="directory-source-card__intro">
        <strong>{{ copy.title }}</strong>
        <span>{{ copy.description }}</span>
      </div>
      <div class="directory-source-card__variants" :aria-label="copy.variants">
        <span
          v-for="variant in variants"
          :key="variant.value"
          class="directory-source-card__variant"
        >
          {{ variant.label }}
        </span>
      </div>
    </div>

    <template #footer>
      <div class="directory-source-card__footer">
        <n-button
          v-if="officialUrl"
          tag="a"
          :href="officialUrl"
          target="_blank"
          rel="noopener noreferrer nofollow"
          size="small"
          secondary
          strong
          round
          @click.stop
        >
          {{ copy.openOfficial }} ↗
        </n-button>
        <span
          class="card-drag-handle"
          role="button"
          tabindex="0"
          :aria-label="copy.dragSort"
          @click.stop.prevent
          @keydown.stop.prevent
        >
          <n-icon :component="Drag" />
        </span>
      </div>
    </template>
  </n-card>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import { Drag } from "@icon-park/vue-next";
import {
  getDirectoryOnlySourceDetails,
} from "@/config/directorySources";
import { useTrendsCatalogRevision } from "@/composables/useTrendsCatalogRevision";
import { getLocaleFromRoute, normalizeLocale } from "@/utils/locale";
import { getSourceDisplayLabel, localizeSubtypeGroups } from "@/utils/sourceLabels";
import {
  getDefaultSourceSubtype,
  getSourceSubtypeControlGroups,
} from "@/utils/sourceSubtypes";
import { getSourceLogo, getSourceLogoFallback } from "@/utils/sourceLogos";

const props = defineProps({
  source: { type: Object, required: true },
});

const route = useRoute();
const catalogRevision = useTrendsCatalogRevision();
const locale = computed(() => normalizeLocale(getLocaleFromRoute(route)));
const source = computed(() => props.source || {});
const sourceLabel = computed(() =>
  getSourceDisplayLabel(
    source.value.name,
    locale.value,
    source.value.label || source.value.name,
  ),
);
const officialUrl = computed(
  () => getDirectoryOnlySourceDetails(source.value.name)?.officialRankingUrl || "",
);
const variants = computed(() => {
  void catalogRevision.value;
  return localizeSubtypeGroups(
    getSourceSubtypeControlGroups(
      source.value.name,
      getDefaultSourceSubtype(source.value.name),
    ),
    locale.value,
  ).flatMap((group) => group.items || []);
});

const COPY = {
  "zh-CN": {
    badge: "官方榜单",
    title: "平台榜单目录",
    description: "展示官方榜单类型，榜单内容前往平台官方页面查看。",
    variants: "官方榜单类型",
    openOfficial: "前往官方榜单",
    dragSort: "拖拽排序",
  },
  en: {
    badge: "Official",
    title: "Ranking directory",
    description: "Browse the platform's official ranking types and open the official page for ranking content.",
    variants: "Official ranking types",
    openOfficial: "Open official ranking",
    dragSort: "Drag to reorder",
  },
  "zh-TW": {
    badge: "官方榜單",
    title: "平台榜單目錄",
    description: "展示官方榜單類型，榜單內容前往平台官方頁面查看。",
    variants: "官方榜單類型",
    openOfficial: "前往官方榜單",
    dragSort: "拖曳排序",
  },
  ja: {
    badge: "公式",
    title: "ランキング一覧",
    description: "公式ランキング種別を表示し、内容は公式ページで確認できます。",
    variants: "公式ランキング種別",
    openOfficial: "公式ランキングを開く",
    dragSort: "ドラッグで並べ替え",
  },
  ko: {
    badge: "공식",
    title: "랭킹 디렉터리",
    description: "공식 랭킹 유형을 보여 주며, 내용은 플랫폼 공식 페이지에서 확인할 수 있습니다.",
    variants: "공식 랭킹 유형",
    openOfficial: "공식 랭킹 열기",
    dragSort: "드래그하여 정렬",
  },
};
const copy = computed(() => COPY[locale.value] || COPY["zh-CN"]);
</script>

<style lang="scss" scoped>
.directory-source-card {
  height: 100%;
  border-radius: 12px;

  &__header,
  &__identity,
  &__footer {
    display: flex;
    align-items: center;
  }

  &__header {
    justify-content: space-between;
    gap: 12px;
    min-width: 0;
    height: 32px;
  }

  &__identity {
    flex: 1 1 auto;
    min-width: 0;
  }

  &__logo {
    width: 25px;
    height: 25px;
    margin-right: 8px;
    flex: 0 0 auto;
    background: transparent;

    :deep(img) {
      object-fit: contain;
    }
  }

  &__name {
    overflow: hidden;
    font-size: 16px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__badge {
    flex: 0 0 auto;
    padding: 3px 8px;
    border-radius: 999px;
    color: var(--n-text-color-2);
    background: color-mix(in srgb, var(--n-action-color) 82%, transparent);
    font-size: 11px;
  }

  &__content {
    box-sizing: border-box;
    min-height: 300px;
    padding: 12px 0 8px;
  }

  &__intro {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 4px 2px 18px;

    strong {
      font-size: 15px;
      line-height: 1.4;
    }

    span {
      color: var(--n-text-color-3);
      font-size: 12px;
      line-height: 1.65;
    }
  }

  &__variants {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-content: flex-start;
  }

  &__variant {
    display: inline-flex;
    align-items: center;
    min-height: 28px;
    padding: 0 10px;
    border: 1px solid var(--n-border-color);
    border-radius: 8px;
    color: var(--n-text-color-2);
    background: var(--n-action-color);
    font-size: 12px;
    line-height: 1.3;
  }

  &__footer {
    justify-content: space-between;
    gap: 10px;
    min-height: 24px;
  }

  .card-drag-handle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 22px;
    border-radius: 999px;
    color: var(--n-text-color-2);
    background: rgba(127, 127, 127, 0.14);
    cursor: grab;

    &:hover {
      color: var(--n-text-color);
      background: rgba(127, 127, 127, 0.2);
    }

    &:active {
      cursor: grabbing;
    }
  }
}
</style>
