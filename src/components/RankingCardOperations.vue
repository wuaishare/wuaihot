<template>
  <button
    v-if="splitOnly"
    type="button"
    class="ranking-card-operations__trigger no-card-drag"
    :class="{ 'is-active': splitVariantsNormalized.length }"
    :title="splitOnlyLabel"
    :aria-label="splitOnlyLabel"
    data-no-card-drag
    @click.stop="runSplitAction"
    @pointerdown.stop
  >
    {{ splitOnlyLabel }}
  </button>

  <n-popover
    v-else-if="visible"
    trigger="click"
    placement="bottom-end"
    :show="menuOpen"
    :show-arrow="false"
    @update:show="menuOpen = $event"
  >
    <template #trigger>
      <button
        type="button"
        class="ranking-card-operations__trigger no-card-drag"
        :class="{ 'is-active': splitVariantsNormalized.length }"
        :title="t('hotList.rankOperations')"
        :aria-label="t('hotList.rankOperations')"
        aria-haspopup="menu"
        data-no-card-drag
        @click.stop
        @pointerdown.stop
      >
        <span>{{ t("hotList.rankOperations") }}</span>
        <span class="ranking-card-operations__chevron" aria-hidden="true"></span>
      </button>
    </template>

    <div
      class="ranking-card-operations__panel no-card-drag"
      role="group"
      :aria-label="t('hotList.rankOperations')"
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

      <section v-if="effectiveSplitControl" class="ranking-card-operations__section">
        <button
          type="button"
          class="ranking-card-operations__action"
          @click.stop="runSplitAction"
        >
          {{ isProjection ? t("hotList.mergeRanking") : t("hotList.splitRankings") }}
        </button>
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
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { mainStore } from "@/store";
import MarketListSortControl from "@/components/MarketListSortControl.vue";
import MarketRankDirectionControl from "@/components/MarketRankDirectionControl.vue";

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
const { t } = useI18n({ useScope: "global" });
const menuOpen = ref(false);

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
const splitOnly = computed(
  () =>
    effectiveSplitControl.value &&
    !hasSortOperations.value &&
    !props.hasExtraOperations,
);
const splitOnlyLabel = computed(() =>
  isProjection.value
    ? t("hotList.mergeRanking")
    : t("hotList.splitRankings"),
);
const canMergeAll = computed(
  () =>
    effectiveSplitControl.value &&
    !isProjection.value &&
    splitVariantsNormalized.value.length > 0 &&
    (props.showMergeAll || splitVariantsNormalized.value.length < normalizedVariants.value.length),
);

const persist = (variants) =>
  store.setCategorySplitVariants(
    props.categoryRef,
    props.sourceName,
    variants,
  );

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
  menuOpen.value = false;
};

const runSplitAction = () => {
  if (isProjection.value) mergeCurrent();
  else splitAll();
};
</script>

<style scoped>
.ranking-card-operations__trigger,
.ranking-card-operations__action {
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
.ranking-card-operations__action:focus-visible {
  color: var(--n-primary-color, #ea444d);
  background: rgba(127, 127, 127, 0.06);
}

.ranking-card-operations__trigger:focus-visible,
.ranking-card-operations__action:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--n-primary-color, #ea444d) 35%, transparent);
  outline-offset: 1px;
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

@media (max-width: 680px) {
  .ranking-card-operations__trigger,
  .ranking-card-operations__action {
    min-height: 24px;
    padding-inline: 6px;
    font-size: 11px;
  }

  .ranking-card-operations__panel {
    width: min(330px, calc(100vw - 20px));
  }
}
</style>
