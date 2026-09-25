<template>
  <div v-if="menu" class="market-sort-menu no-card-drag" :class="{ 'is-expanded': expanded }" @click.stop>
    <button
      v-if="!inlineMenu && !expanded"
      type="button"
      class="ranking-tool-trigger"
      :title="`${t('hotList.marketSort')}：${activeLabel}`"
      :aria-label="`${t('hotList.marketSort')}：${activeLabel}`"
      @click.stop="expanded = true"
    >
      <n-icon :component="activeIcon" />
      <span>{{ activeLabel }}</span>
    </button>
    <div v-else class="ranking-tool-options">
      <button
        v-for="option in menuOptions"
        :key="option.key"
        type="button"
        class="ranking-tool-option"
        :class="{ active: option.key === activeMode }"
        :aria-pressed="option.key === activeMode"
        @click.stop="selectMode(option.key)"
      >
        <n-icon :component="option.icon" />
        <span>{{ option.label }}</span>
      </button>
    </div>
  </div>

  <n-dropdown v-else trigger="click" :options="options" @select="selectMode">
    <span class="market-sort-trigger" @click.stop>
      <n-button
        size="tiny"
        secondary
        strong
        :round="compact"
        :type="activeMode !== MARKET_SORT_MODES.RANK ? 'primary' : 'default'"
        :aria-label="`${t('hotList.marketSort')}：${activeLabel}`"
        :title="`${t('hotList.marketSort')}：${activeLabel}`"
      >
        <template #icon>
          <n-icon :component="SortOne" />
        </template>
        <span v-if="!compact">{{ t("hotList.marketSort") }}：{{ activeLabel }}</span>
        <span v-else-if="showStateLabel">{{ activeLabel }}</span>
      </n-button>
    </span>
  </n-dropdown>
</template>

<script setup>
import { computed, ref } from "vue";
import { ArrowDown, ArrowUp, RankingList, SortAmountDown, SortOne } from "@icon-park/vue-next";
import { useI18n } from "vue-i18n";
import { dropdownSelectionProps } from "@/utils/dropdownSelection";
import {
  MARKET_SORT_MODES,
  getMarketListActivityKind,
  marketListSortModes,
  readMarketListSortMode,
  saveMarketListSortMode,
} from "@/utils/marketListSort";

const props = defineProps({
  source: { type: String, required: true },
  compact: { type: Boolean, default: true },
  showStateLabel: { type: Boolean, default: false },
  menu: { type: Boolean, default: false },
  inlineMenu: { type: Boolean, default: false },
});

const { t } = useI18n({ useScope: "global" });
const expanded = ref(false);

const activeMode = computed(() => {
  readMarketListSortMode(props.source);
  return marketListSortModes[props.source] || MARKET_SORT_MODES.RANK;
});

const activityLabel = computed(() =>
  getMarketListActivityKind(props.source) === "volume"
    ? t("hotList.marketSortVolume")
    : t("hotList.marketSortAmount"),
);

const baseOptions = computed(() => [
  { key: MARKET_SORT_MODES.RANK, label: t("hotList.marketSortRank"), icon: RankingList },
  { key: MARKET_SORT_MODES.GAIN, label: t("hotList.marketSortGain"), icon: ArrowUp },
  { key: MARKET_SORT_MODES.LOSS, label: t("hotList.marketSortLoss"), icon: ArrowDown },
  { key: MARKET_SORT_MODES.ACTIVITY, label: activityLabel.value, icon: SortAmountDown },
]);

const menuOptions = computed(() => baseOptions.value);
const options = computed(() =>
  baseOptions.value.map(({ key, label }) => ({
    key,
    label,
    props: dropdownSelectionProps(key === activeMode.value),
  })),
);
const activeOption = computed(
  () => baseOptions.value.find((item) => item.key === activeMode.value) || baseOptions.value[0],
);
const activeLabel = computed(() => activeOption.value?.label || t("hotList.marketSortRank"));
const activeIcon = computed(() => activeOption.value?.icon || SortOne);

const selectMode = (mode) => {
  saveMarketListSortMode(props.source, mode);
  if (props.menu && !props.inlineMenu) expanded.value = false;
};
</script>

<style scoped>
.market-sort-trigger,
.market-sort-menu,
.ranking-tool-options {
  display: inline-flex;
  align-items: center;
}

.ranking-tool-options {
  gap: 1px;
}

.ranking-tool-trigger,
.ranking-tool-option {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-height: 25px;
  padding: 3px 5px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--n-text-color-2, var(--n-text-color));
  font: inherit;
  font-size: 12px;
  line-height: 1.15;
  white-space: nowrap;
  cursor: pointer;
  transition: background 0.14s ease, color 0.14s ease;
}

.ranking-tool-option {
  padding-inline: 6px;
}

.ranking-tool-trigger:hover,
.ranking-tool-option:hover {
  color: var(--n-primary-color, #ea444d);
  background: rgba(127, 127, 127, 0.06);
}

.ranking-tool-option.active {
  color: var(--n-primary-color, #ea444d);
  background: rgba(234, 68, 77, 0.09);
  font-weight: 650;
}
</style>
