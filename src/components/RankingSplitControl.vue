<template>
  <div
    v-if="visible"
    class="ranking-split-control"
    :class="{
      'is-compact': compact,
      'is-projection': isProjection,
      'is-embedded': embedded,
    }"
    @click.stop
  >
    <template v-if="embedded">
      <div class="ranking-split-control__inline" @click.stop>
        <template v-if="isProjection">
          <n-button
            class="ranking-split-control__inline-action"
            text
            size="tiny"
            @click.stop="mergeCurrent"
          >
            <template #icon>
              <n-icon :component="Merge" />
            </template>
            {{ copy.mergeCurrentShort }}
          </n-button>
          <n-button
            v-if="showMergeAll"
            class="ranking-split-control__inline-action"
            text
            size="tiny"
            @click.stop="mergeAll"
          >
            {{ copy.mergeAllShort }}
          </n-button>
        </template>

        <template v-else>
          <n-button
            v-if="currentVariant && !splitVariantsNormalized.includes(currentVariant)"
            class="ranking-split-control__inline-action"
            text
            size="tiny"
            @click.stop="splitCurrent"
          >
            <template #icon>
              <n-icon :component="Split" />
            </template>
            {{ copy.splitCurrent }}
          </n-button>

          <n-popover
            trigger="click"
            placement="top-end"
            :show="manageOpen"
            :show-arrow="false"
            @update:show="setManageOpen"
          >
            <template #trigger>
              <n-button
                class="ranking-split-control__inline-action"
                text
                size="tiny"
                @click.stop
              >
                {{ copy.manageSplit }}
              </n-button>
            </template>

            <div class="ranking-split-control__manage" @click.stop>
              <div class="ranking-split-control__options is-managed">
                <button
                  v-for="option in variantOptions"
                  :key="option.value"
                  type="button"
                  class="ranking-split-control__option"
                  :class="{ 'is-selected': draftVariants.includes(option.value) }"
                  :aria-pressed="draftVariants.includes(option.value)"
                  @click.stop="toggleDraft(option.value)"
                >
                  <span class="ranking-split-control__check" aria-hidden="true">
                    {{ draftVariants.includes(option.value) ? "✓" : "" }}
                  </span>
                  <span>{{ option.label }}</span>
                </button>
              </div>
              <div class="ranking-split-control__menu-actions">
                <button type="button" @click.stop="selectAll">{{ copy.selectAll }}</button>
                <button
                  v-if="splitVariantsNormalized.length"
                  type="button"
                  @click.stop="mergeAll"
                >
                  {{ copy.mergeAll }}
                </button>
                <n-button
                  size="tiny"
                  type="primary"
                  :disabled="sameSelection"
                  @click.stop="applyDraft"
                >
                  {{ copy.apply }}
                </n-button>
              </div>
            </div>
          </n-popover>

          <n-button
            v-if="splitVariantsNormalized.length !== normalizedVariants.length"
            class="ranking-split-control__inline-action"
            text
            size="tiny"
            @click.stop="splitAll"
          >
            {{ copy.splitAllShort }}
          </n-button>
          <n-button
            v-if="splitVariantsNormalized.length"
            class="ranking-split-control__inline-action"
            text
            size="tiny"
            @click.stop="mergeAll"
          >
            {{ copy.mergeAllShort }}
            <span class="ranking-split-control__count">{{ splitVariantsNormalized.length }}</span>
          </n-button>
        </template>
      </div>
    </template>

    <template v-else-if="isProjection">
      <n-button
        v-if="showMergeAll"
        class="ranking-split-control__merge-all"
        text
        size="tiny"
        :title="copy.mergeAll"
        :aria-label="copy.mergeAll"
        @click.stop="mergeAll"
      >
        {{ copy.mergeAll }}
      </n-button>
      <n-button
        class="ranking-split-control__close"
        text
        circle
        size="tiny"
        :title="copy.mergeCurrent"
        :aria-label="copy.mergeCurrent"
        @click.stop="mergeCurrent"
      >
        <template #icon>
          <n-icon :component="CloseOne" />
        </template>
      </n-button>
    </template>

    <n-button
      v-else-if="!embedded && variantOptions.length === 2"
      class="ranking-split-control__trigger"
      text
      size="tiny"
      :title="copy.splitAll"
      :aria-label="copy.splitAll"
      @click.stop="splitAll"
    >
      {{ copy.split }}
    </n-button>

    <n-popover
      v-else-if="!embedded"
      trigger="click"
      placement="bottom-end"
      :show="menuOpen"
      :show-arrow="false"
      @update:show="setMenuOpen"
    >
      <template #trigger>
        <n-button
          class="ranking-split-control__trigger"
          text
          size="tiny"
          :title="copy.splitMenu"
          :aria-label="copy.splitMenu"
          @click.stop
        >
          {{ triggerLabel }}
        </n-button>
      </template>

      <div class="ranking-split-control__menu" @click.stop>
        <div class="ranking-split-control__heading">
          <strong>{{ copy.splitMenu }}</strong>
          <span>{{ copy.splitHint }}</span>
        </div>

        <div class="ranking-split-control__options">
          <button
            v-for="option in variantOptions"
            :key="option.value"
            type="button"
            class="ranking-split-control__option"
            :class="{ 'is-selected': draftVariants.includes(option.value) }"
            :aria-pressed="draftVariants.includes(option.value)"
            @click.stop="toggleDraft(option.value)"
          >
            <span class="ranking-split-control__check" aria-hidden="true">
              {{ draftVariants.includes(option.value) ? "✓" : "" }}
            </span>
            <span>{{ option.label }}</span>
          </button>
        </div>

        <div class="ranking-split-control__menu-actions">
          <button type="button" @click.stop="selectAll">{{ copy.selectAll }}</button>
          <button
            v-if="splitVariantsNormalized.length"
            type="button"
            @click.stop="mergeAll"
          >
            {{ copy.mergeAll }}
          </button>
          <n-button
            size="tiny"
            type="primary"
            :disabled="sameSelection"
            @click.stop="applyDraft"
          >
            {{ copy.apply }}
          </n-button>
        </div>
      </div>
    </n-popover>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { CloseOne, Merge, Split } from "@icon-park/vue-next";
import { useI18n } from "vue-i18n";
import { mainStore } from "@/store";
import { getSourceVariantOptions } from "@/utils/sourceSubtypes";
import { getSubtypeLabel } from "@/utils/sourceLabels";
import { normalizeLocale } from "@/utils/locale";

const props = defineProps({
  sourceName: { type: String, required: true },
  categoryRef: { type: [String, Number], required: true },
  variants: { type: Array, default: () => [] },
  splitVariants: { type: Array, default: () => [] },
  projectionVariant: { type: String, default: "" },
  showMergeAll: { type: Boolean, default: false },
  compact: { type: Boolean, default: false },
  embedded: { type: Boolean, default: false },
  currentVariant: { type: String, default: "" },
});

const store = mainStore();
const { locale: i18nLocale } = useI18n({ useScope: "global" });
const locale = computed(() => normalizeLocale(i18nLocale.value));
const menuOpen = ref(false);
const manageOpen = ref(false);
const draftVariants = ref([]);

const COPY = {
  "zh-CN": {
    split: "拆分",
    splitMenu: "拆分榜单",
    splitHint: "选择要独立显示的榜单",
    splitAll: "全部拆分",
    selectAll: "全选",
    apply: "应用",
    mergeAll: "全部合并",
    mergeCurrent: "收回当前榜单",
    mergeCurrentShort: "收回",
    splitAllShort: "全拆",
    mergeAllShort: "全合并",
    mergeHint: "把独立榜单收回当前平台卡片",
    splitCurrent: "拆当前",
    manageSplit: "管理",
    closeManage: "收起管理",
  },
  "zh-TW": {
    split: "拆分",
    splitMenu: "拆分榜單",
    splitHint: "選擇要獨立顯示的榜單",
    splitAll: "全部拆分",
    selectAll: "全選",
    apply: "套用",
    mergeAll: "全部合併",
    mergeCurrent: "收回目前榜單",
    mergeCurrentShort: "收回",
    splitAllShort: "全拆",
    mergeAllShort: "全合併",
    mergeHint: "將獨立榜單收回目前平台卡片",
    splitCurrent: "拆目前",
    manageSplit: "管理",
    closeManage: "收起管理",
  },
  en: {
    split: "Split",
    splitMenu: "Split rankings",
    splitHint: "Choose rankings to show separately",
    splitAll: "Split all",
    selectAll: "Select all",
    apply: "Apply",
    mergeAll: "Merge all",
    mergeCurrent: "Merge this ranking",
    mergeCurrentShort: "Merge",
    splitAllShort: "Split all",
    mergeAllShort: "Merge all",
    mergeHint: "Return this ranking to the platform card",
    splitCurrent: "Split",
    manageSplit: "Manage",
    closeManage: "Close manager",
  },
  ja: {
    split: "分割",
    splitMenu: "ランキングを分割",
    splitHint: "個別表示するランキングを選択",
    splitAll: "すべて分割",
    selectAll: "すべて選択",
    apply: "適用",
    mergeAll: "すべて統合",
    mergeCurrent: "このランキングを戻す",
    mergeCurrentShort: "戻す",
    splitAllShort: "全分割",
    mergeAllShort: "全統合",
    mergeHint: "独立ランキングをプラットフォームカードに戻す",
    splitCurrent: "現在を分割",
    manageSplit: "管理",
    closeManage: "管理を閉じる",
  },
  ko: {
    split: "분리",
    splitMenu: "랭킹 분리",
    splitHint: "별도로 표시할 랭킹 선택",
    splitAll: "모두 분리",
    selectAll: "전체 선택",
    apply: "적용",
    mergeAll: "모두 합치기",
    mergeCurrent: "현재 랭킹 합치기",
    mergeCurrentShort: "합치기",
    splitAllShort: "전체 분리",
    mergeAllShort: "전체 합치기",
    mergeHint: "독립 랭킹을 플랫폼 카드로 되돌리기",
    splitCurrent: "현재 분리",
    manageSplit: "관리",
    closeManage: "관리 닫기",
  },
};
const copy = computed(() => COPY[locale.value] || COPY["zh-CN"]);

const normalizedVariants = computed(() =>
  [...new Set(
    (Array.isArray(props.variants) ? props.variants : [])
      .map((value) => String(value || "").trim())
      .filter(Boolean),
  )],
);
const allowedVariants = computed(() => new Set(normalizedVariants.value));
const splitVariantsNormalized = computed(() =>
  [...new Set(
    (Array.isArray(props.splitVariants) ? props.splitVariants : [])
      .map((value) => String(value || "").trim())
      .filter((value) => allowedVariants.value.has(value)),
  )],
);
const projectionVariant = computed(() =>
  String(props.projectionVariant || "").trim(),
);
const isProjection = computed(
  () =>
    Boolean(projectionVariant.value) &&
    splitVariantsNormalized.value.includes(projectionVariant.value),
);
const visible = computed(
  () => normalizedVariants.value.length > 1 && (!projectionVariant.value || isProjection.value),
);

const variantOptions = computed(() => {
  const byValue = new Map(
    getSourceVariantOptions(props.sourceName).map((item) => [
      String(item?.value || ""),
      item,
    ]),
  );
  return normalizedVariants.value.map((value) => {
    const option = byValue.get(value) || { value, label: value };
    return {
      value,
      label: getSubtypeLabel(option, locale.value) || option.label || value,
    };
  });
});
const triggerLabel = computed(() => {
  const count = splitVariantsNormalized.value.length;
  return count
    ? `${copy.value.split} ${count}/${normalizedVariants.value.length}`
    : copy.value.split;
});
const sameSelection = computed(() => {
  const current = splitVariantsNormalized.value.slice().sort().join("|");
  const draft = [...new Set(draftVariants.value)].sort().join("|");
  return current === draft;
});

const persist = (variants) =>
  store.setCategorySplitVariants(
    props.categoryRef,
    props.sourceName,
    variants,
  );

const syncDraft = () => {
  draftVariants.value = splitVariantsNormalized.value.slice();
};
const setMenuOpen = (show) => {
  menuOpen.value = Boolean(show);
  if (menuOpen.value) syncDraft();
};
const toggleDraft = (variant) => {
  const value = String(variant || "");
  if (!allowedVariants.value.has(value)) return;
  const next = new Set(draftVariants.value);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  draftVariants.value = normalizedVariants.value.filter((item) => next.has(item));
};
const selectAll = () => {
  draftVariants.value = normalizedVariants.value.slice();
};
const splitCurrent = () => {
  const value = String(props.currentVariant || "").trim();
  if (!allowedVariants.value.has(value)) return;
  persist([...new Set([...splitVariantsNormalized.value, value])]);
};
const setManageOpen = (show) => {
  manageOpen.value = Boolean(show);
  if (manageOpen.value) syncDraft();
};
const applyDraft = () => {
  persist(draftVariants.value);
  menuOpen.value = false;
};
const splitAll = () => {
  persist(normalizedVariants.value);
  menuOpen.value = false;
};
const mergeAll = () => {
  persist([]);
  draftVariants.value = [];
  menuOpen.value = false;
};
const mergeCurrent = () => {
  if (!projectionVariant.value) return;
  persist(
    splitVariantsNormalized.value.filter(
      (variant) => variant !== projectionVariant.value,
    ),
  );
};

watch(
  splitVariantsNormalized,
  () => {
    if (props.embedded) syncDraft();
  },
  { immediate: true },
);
</script>

<style scoped>
.ranking-split-control {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  flex: 0 0 auto;
}
.ranking-split-control.is-embedded {
  display: inline-flex;
  width: auto;
  min-width: 0;
}
.ranking-split-control__trigger,
.ranking-split-control__merge-all {
  min-height: 24px;
  padding-inline: 6px;
  color: var(--n-text-color-2);
  font-size: 11px;
  white-space: nowrap;
}
.ranking-split-control__trigger:hover,
.ranking-split-control__merge-all:hover {
  color: var(--n-primary-color);
}
.ranking-split-control__close {
  color: var(--n-text-color-3);
}
.ranking-split-control__close:hover {
  color: var(--n-primary-color);
}
.ranking-split-control__menu {
  width: 244px;
  padding: 4px;
}
.ranking-split-control__menu.is-embedded {
  width: auto;
  padding: 0;
}
.ranking-split-control__heading {
  display: grid;
  gap: 3px;
  padding: 4px 5px 9px;
}
.ranking-split-control__heading-title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.ranking-split-control__heading strong {
  font-size: 13px;
}
.ranking-split-control__heading span {
  color: var(--n-text-color-3);
  font-size: 11px;
}
.ranking-split-control__options {
  display: grid;
  gap: 3px;
}
.ranking-split-control__option {
  display: grid;
  grid-template-columns: 20px minmax(0, 1fr);
  align-items: center;
  gap: 7px;
  width: 100%;
  min-height: 34px;
  padding: 5px 7px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font: inherit;
  font-size: 12px;
  text-align: left;
}
.ranking-split-control__option:hover,
.ranking-split-control__option.is-selected {
  background: var(--n-action-color);
}
.ranking-split-control__check {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border: 1px solid var(--n-border-color);
  border-radius: 5px;
  color: var(--n-primary-color);
  font-size: 12px;
  font-weight: 800;
}
.ranking-split-control__option.is-selected .ranking-split-control__check {
  border-color: var(--n-primary-color);
}
.ranking-split-control__menu-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 7px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--n-border-color);
}
.ranking-split-control__menu-actions > button:not(.n-button) {
  padding: 4px 5px;
  border: 0;
  background: transparent;
  color: var(--n-text-color-2);
  cursor: pointer;
  font: inherit;
  font-size: 12px;
}
.ranking-split-control__menu-actions > button:not(.n-button):hover {
  color: var(--n-primary-color);
}
.ranking-split-control__embedded-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
}
.ranking-split-control__embedded-actions.is-primary :deep(.n-button) {
  min-width: 0;
}
.ranking-split-control__options.is-managed {
  max-height: 220px;
  margin-top: 8px;
  overflow: auto;
  padding-right: 2px;
  scrollbar-width: thin;
}
.ranking-split-control.is-compact .ranking-split-control__trigger,
.ranking-split-control.is-compact .ranking-split-control__merge-all {
  min-height: 22px;
  padding-inline: 4px;
  font-size: 11px;
}
.ranking-split-control__inline {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 2px;
}

.ranking-split-control__inline-action {
  min-height: 26px;
  padding-inline: 6px;
  color: var(--n-text-color-2);
  font-size: 12px;
  white-space: nowrap;
}

.ranking-split-control__inline-action:hover {
  color: var(--n-primary-color);
  background: rgba(234, 68, 77, 0.08);
}

.ranking-split-control__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 17px;
  height: 17px;
  margin-left: 2px;
  padding: 0 4px;
  border-radius: 999px;
  background: rgba(127, 127, 127, 0.1);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
}

.ranking-split-control__manage {
  width: min(278px, calc(100vw - 32px));
  padding: 6px;
}

.ranking-split-control__manage .ranking-split-control__options.is-managed {
  max-height: 250px;
  margin-top: 0;
}

</style>
