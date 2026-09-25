<template>
  <template v-if="directSplitOnly">
    <button
      type="button"
      class="ranking-card-operations__trigger no-card-drag"
      :class="{ 'is-active': splitVariantsNormalized.length }"
      :title="directSplitLabel"
      :aria-label="directSplitLabel"
      data-no-card-drag
      @click.stop="runDirectSplitAction"
      @pointerdown.stop
    >
      {{ directSplitLabel }}
    </button>

    <button
      v-if="isProjection && showMergeAll"
      type="button"
      class="ranking-card-operations__trigger is-secondary no-card-drag"
      :title="t('hotList.mergeAllRankings')"
      :aria-label="t('hotList.mergeAllRankings')"
      data-no-card-drag
      @click.stop="mergeAll"
      @pointerdown.stop
    >
      {{ t("hotList.mergeAllRankings") }}
    </button>
  </template>

  <n-popover
    v-else-if="visible"
    trigger="click"
    placement="bottom-end"
    :show="menuOpen"
    :show-arrow="false"
    @update:show="setMenuOpen"
  >
    <template #trigger>
      <button
        type="button"
        class="ranking-card-operations__trigger no-card-drag"
        :class="{ 'is-active': splitVariantsNormalized.length }"
        :title="triggerTitle"
        :aria-label="triggerTitle"
        aria-haspopup="menu"
        data-no-card-drag
        @click.stop
        @pointerdown.stop
      >
        <span>{{ triggerLabel }}</span>
        <span
          v-if="splitMenuOnly && splitVariantsNormalized.length"
          class="ranking-card-operations__count"
        >
          {{ splitVariantsNormalized.length }}/{{ normalizedVariants.length }}
        </span>
        <span class="ranking-card-operations__chevron" aria-hidden="true"></span>
      </button>
    </template>

    <div
      class="ranking-card-operations__panel no-card-drag"
      role="group"
      :aria-label="triggerTitle"
      data-no-card-drag
      @click.stop
      @pointerdown.stop
    >
      <section v-if="hasSortOperations" class="ranking-card-operations__section">
        <MarketRankDirectionControl
          v-if="showNativeOrderControl"
          menu
          inline-menu
          :direction="marketRankDirection"
          @change="$emit('change-direction', $event)"
        />
        <MarketListSortControl
          v-if="showMarketSortControl"
          menu
          inline-menu
          :source="sourceName"
        />
      </section>

      <section
        v-if="effectiveSplitControl"
        class="ranking-card-operations__section is-split"
      >
        <template v-if="isProjection">
          <button
            type="button"
            class="ranking-card-operations__action"
            @click.stop="mergeCurrent"
          >
            {{ t("hotList.mergeRanking") }}
          </button>
        </template>

        <template v-else-if="normalizedVariants.length === 2">
          <button
            type="button"
            class="ranking-card-operations__action"
            @click.stop="splitAll"
          >
            {{ t("hotList.splitRankings") }}
          </button>
        </template>

        <template v-else>
          <div class="ranking-card-operations__split-heading">
            <strong>{{ t("hotList.splitRankings") }}</strong>
            <span>{{ t("hotList.selectRankingVariants") }}</span>
          </div>

          <div
            class="ranking-card-operations__options"
            role="group"
            :aria-label="t('hotList.selectRankingVariants')"
          >
            <button
              v-for="option in variantOptions"
              :key="option.value"
              type="button"
              class="ranking-card-operations__option"
              :class="{ 'is-selected': draftVariants.includes(option.value) }"
              :aria-pressed="draftVariants.includes(option.value)"
              @click.stop="toggleDraft(option.value)"
            >
              <span class="ranking-card-operations__check" aria-hidden="true">
                {{ draftVariants.includes(option.value) ? "✓" : "" }}
              </span>
              <span>{{ option.label }}</span>
            </button>
          </div>

          <div class="ranking-card-operations__selection-actions">
            <button type="button" @click.stop="selectAll">
              {{ t("hotList.selectAllRankings") }}
            </button>
            <n-button
              size="tiny"
              type="primary"
              :disabled="sameSelection"
              @click.stop="applyDraft"
            >
              {{ t("hotList.applyRankingSelection") }}
            </n-button>
          </div>
        </template>

        <button
          v-if="canMergeAll"
          type="button"
          class="ranking-card-operations__action is-secondary"
          @click.stop="mergeAll"
        >
          {{ t("hotList.mergeAllRankings") }}
        </button>
      </section>

      <section v-if="hasExtraOperations" class="ranking-card-operations__section">
        <slot name="extra" />
      </section>
    </div>
  </n-popover>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { mainStore } from "@/store";
import MarketListSortControl from "@/components/MarketListSortControl.vue";
import MarketRankDirectionControl from "@/components/MarketRankDirectionControl.vue";
import { getSourceVariantOptions } from "@/utils/sourceSubtypes";
import { getSubtypeLabel } from "@/utils/sourceLabels";
import { normalizeLocale } from "@/utils/locale";

defineEmits(["change-direction"]);

const props = defineProps({
  sourceName: { type: String, required: true },
  showNativeOrderControl: { type: Boolean, default: false },
  showMarketSortControl: { type: Boolean, default: false },
  marketRankDirection: { type: String, default: "normal" },
  showSplitControl: { type: Boolean, default: false },
  categoryRef: { type: [String, Number], default: "" },
  variants: { type: Array, default: () => [] },
  splitVariants: { type: Array, default: () => [] },
  projectionVariant: { type: String, default: "" },
  showMergeAll: { type: Boolean, default: false },
  hasExtraOperations: { type: Boolean, default: false },
});

const store = mainStore();
const { t, locale: i18nLocale } = useI18n({ useScope: "global" });
const locale = computed(() => normalizeLocale(i18nLocale.value));
const menuOpen = ref(false);
const draftVariants = ref([]);

const hasSortOperations = computed(
  () => props.showNativeOrderControl || props.showMarketSortControl,
);
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
const projectionVariant = computed(() => String(props.projectionVariant || "").trim());
const isProjection = computed(
  () =>
    Boolean(projectionVariant.value) &&
    splitVariantsNormalized.value.includes(projectionVariant.value),
);
const effectiveSplitControl = computed(
  () => props.showSplitControl && normalizedVariants.value.length > 1,
);
const visible = computed(
  () =>
    hasSortOperations.value ||
    effectiveSplitControl.value ||
    props.hasExtraOperations,
);
const directSplitOnly = computed(
  () =>
    effectiveSplitControl.value &&
    (isProjection.value || normalizedVariants.value.length === 2) &&
    !hasSortOperations.value &&
    !props.hasExtraOperations,
);
const splitMenuOnly = computed(
  () =>
    effectiveSplitControl.value &&
    !isProjection.value &&
    normalizedVariants.value.length > 2 &&
    !hasSortOperations.value &&
    !props.hasExtraOperations,
);
const allSplit = computed(
  () =>
    normalizedVariants.value.length > 0 &&
    splitVariantsNormalized.value.length === normalizedVariants.value.length,
);
const directSplitLabel = computed(() => {
  if (isProjection.value) return t("hotList.mergeRanking");
  return allSplit.value
    ? t("hotList.mergeAllRankings")
    : t("hotList.splitRankings");
});
const triggerTitle = computed(() =>
  splitMenuOnly.value
    ? t("hotList.splitRankings")
    : t("hotList.rankOperations"),
);
const triggerLabel = computed(() => triggerTitle.value);
const canMergeAll = computed(
  () =>
    effectiveSplitControl.value &&
    splitVariantsNormalized.value.length > 0 &&
    (!isProjection.value || props.showMergeAll),
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
  const value = String(variant || "").trim();
  if (!allowedVariants.value.has(value)) return;
  const next = new Set(draftVariants.value);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  draftVariants.value = normalizedVariants.value.filter((item) => next.has(item));
};
const selectAll = () => {
  draftVariants.value = normalizedVariants.value.slice();
};
const applyDraft = () => {
  persist(draftVariants.value);
  menuOpen.value = false;
};

const splitAll = () => {
  persist(normalizedVariants.value);
  menuOpen.value = false;
};

const mergeCurrent = () => {
  if (!projectionVariant.value) return;
  persist(
    splitVariantsNormalized.value.filter(
      (variant) => variant !== projectionVariant.value,
    ),
  );
  menuOpen.value = false;
};

const mergeAll = () => {
  persist([]);
  draftVariants.value = [];
  menuOpen.value = false;
};

const runDirectSplitAction = () => {
  if (isProjection.value) mergeCurrent();
  else if (allSplit.value) mergeAll();
  else splitAll();
};

watch(
  splitVariantsNormalized,
  () => {
    if (!menuOpen.value) syncDraft();
  },
  { immediate: true },
);
</script>

<style scoped>
.ranking-card-operations__trigger,
.ranking-card-operations__action,
.ranking-card-operations__option,
.ranking-card-operations__selection-actions button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 26px;
  padding: 4px 7px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--n-text-color-2, var(--n-text-color));
  font: inherit;
  font-size: 12px;
  line-height: 1.15;
  white-space: nowrap;
  cursor: pointer;
  transition: color 0.14s ease, background 0.14s ease;
}

.ranking-card-operations__trigger {
  gap: 5px;
}

.ranking-card-operations__trigger:hover,
.ranking-card-operations__trigger:focus-visible,
.ranking-card-operations__trigger.is-active,
.ranking-card-operations__action:hover,
.ranking-card-operations__action:focus-visible,
.ranking-card-operations__option:hover,
.ranking-card-operations__option:focus-visible,
.ranking-card-operations__option.is-selected,
.ranking-card-operations__selection-actions button:hover,
.ranking-card-operations__selection-actions button:focus-visible {
  color: var(--n-primary-color, #ea444d);
  background: rgba(127, 127, 127, 0.06);
}

.ranking-card-operations__trigger:focus-visible,
.ranking-card-operations__action:focus-visible,
.ranking-card-operations__option:focus-visible,
.ranking-card-operations__selection-actions button:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--n-primary-color, #ea444d) 35%, transparent);
  outline-offset: 1px;
}

.ranking-card-operations__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 17px;
  padding: 0 4px;
  border-radius: 999px;
  background: rgba(127, 127, 127, 0.1);
  font-size: 10px;
  font-variant-numeric: tabular-nums;
}

.ranking-card-operations__chevron {
  width: 6px;
  height: 6px;
  margin-top: -2px;
  border-right: 1.5px solid currentColor;
  border-bottom: 1.5px solid currentColor;
  transform: rotate(45deg);
}

.ranking-card-operations__panel {
  display: grid;
  width: min(360px, calc(100vw - 32px));
  gap: 7px;
  padding: 3px;
  font-size: 12px;
}

.ranking-card-operations__section {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 3px;
  min-width: 0;
}

.ranking-card-operations__section.is-split {
  align-items: stretch;
}

.ranking-card-operations__section + .ranking-card-operations__section {
  padding-top: 6px;
  border-top: 1px solid var(--n-border-color);
}

.ranking-card-operations__action {
  min-height: 25px;
  padding-inline: 6px;
}

.ranking-card-operations__action.is-secondary {
  color: var(--n-text-color-3, var(--n-text-color-2));
}

.ranking-card-operations__split-heading {
  display: flex;
  width: 100%;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  color: var(--n-text-color-2, var(--n-text-color));
}

.ranking-card-operations__split-heading span {
  color: var(--n-text-color-3, var(--n-text-color-2));
  font-size: 11px;
}

.ranking-card-operations__options {
  display: grid;
  width: 100%;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 3px;
}

.ranking-card-operations__option {
  justify-content: flex-start;
  min-width: 0;
  text-align: left;
  white-space: normal;
}

.ranking-card-operations__check {
  display: inline-flex;
  width: 14px;
  flex: 0 0 14px;
  justify-content: center;
  font-size: 11px;
}

.ranking-card-operations__selection-actions {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  margin-top: 2px;
}

@media (max-width: 680px) {
  .ranking-card-operations__trigger,
  .ranking-card-operations__action,
  .ranking-card-operations__option,
  .ranking-card-operations__selection-actions button {
    min-height: 24px;
    padding-inline: 6px;
    font-size: 11px;
  }

  .ranking-card-operations__panel {
    width: min(330px, calc(100vw - 20px));
  }
}
</style>
