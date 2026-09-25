<template>
  <div v-if="menu" class="market-sort-menu no-card-drag" @click.stop>
    <span class="market-sort-menu__title">{{ t("hotList.marketSort") }}</span>
    <div class="market-sort-menu__options">
      <button
        v-for="option in menuOptions"
        :key="option.key"
        type="button"
        class="market-sort-menu__option"
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
import {
  ArrowDown,
  ArrowUp,
  RankingList,
  SortAmountDown,
  SortOne,
} from "@icon-park/vue-next";
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
  source: {
    type: String,
    required: true,
  },
  compact: {
    type: Boolean,
    default: true,
  },
  showStateLabel: {
    type: Boolean,
    default: false,
  },
  menu: {
    type: Boolean,
    default: false,
  },
});

const { t } = useI18n({ useScope: "global" });

const activeMode = computed(() => {
  readMarketListSortMode(props.source);
  return marketListSortModes[props.source] || MARKET_SORT_MODES.RANK;
});

const activityLabel = computed(() =>
  getMarketListActivityKind(props.source) === "volume"
    ? t("hotList.marketSortVolume")
    : t("hotList.marketSortAmount")
);

const baseOptions = computed(() => [
  { key: MARKET_SORT_MODES.RANK, label: t("hotList.marketSortRank"), icon: RankingList },
  { key: MARKET_SORT_MODES.GAIN, label: t("hotList.marketSortGain"), icon: ArrowUp },
  { key: MARKET_SORT_MODES.LOSS, label: t("hotList.marketSortLoss"), icon: ArrowDown },
  { key: MARKET_SORT_MODES.ACTIVITY, label: activityLabel.value, icon: SortAmountDown },
]);

const menuOptions = computed(() => baseOptions.value);
const options = computed(() => baseOptions.value.map(({ key, label }) => ({
  key,
  label,
  props: dropdownSelectionProps(key === activeMode.value),
})));

const activeLabel = computed(
  () => baseOptions.value.find((item) => item.key === activeMode.value)?.label || t("hotList.marketSortRank")
);

const selectMode = (mode) => saveMarketListSortMode(props.source, mode);
</script>

<style scoped>
.market-sort-trigger {
  display: inline-flex;
}

.market-sort-menu {
  display: grid;
  gap: 7px;
  width: 100%;
}

.market-sort-menu__title {
  color: var(--n-text-color-3, #8a8f99);
  font-size: 11px;
  font-weight: 700;
  line-height: 1.2;
}

.market-sort-menu__options {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
}

.market-sort-menu__option {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  gap: 7px;
  min-height: 34px;
  padding: 7px 10px;
  border: 1px solid var(--n-border-color);
  border-radius: 9px;
  background: rgba(127, 127, 127, 0.05);
  color: var(--n-text-color-2, var(--n-text-color));
  font-size: 12px;
  cursor: pointer;
  transition: border-color 0.16s ease, background 0.16s ease, color 0.16s ease;
}

.market-sort-menu__option:hover,
.market-sort-menu__option.active {
  border-color: rgba(234, 68, 77, 0.35);
  background: rgba(234, 68, 77, 0.09);
  color: #ea444d;
}

.market-sort-menu__option.active {
  font-weight: 700;
}
</style>
