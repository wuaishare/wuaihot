<template>
  <div
    class="rank-direction-control no-card-drag"
    :class="{ 'is-menu': menu }"
    role="group"
    :aria-label="t('hotList.rankOrder')"
    data-no-card-drag
    @click.stop
    @pointerdown.stop
    @mousedown.stop
  >
    <span v-if="menu" class="direction-title">{{ t("hotList.rankOrder") }}</span>
    <div class="direction-options">
      <button
        type="button"
        class="direction-option"
        :class="{ active: direction !== 'reverse' }"
        :aria-pressed="direction !== 'reverse'"
        @click="select('normal')"
      >
        <n-icon v-if="menu" :component="SortAmountUp" />
        <span>{{ t("hotList.rankOrderNormal") }}</span>
      </button>
      <button
        type="button"
        class="direction-option"
        :class="{ active: direction === 'reverse' }"
        :aria-pressed="direction === 'reverse'"
        @click="select('reverse')"
      >
        <n-icon v-if="menu" :component="SortAmountDown" />
        <span>{{ t("hotList.rankOrderReverse") }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { SortAmountDown, SortAmountUp } from "@icon-park/vue-next";
import { useI18n } from "vue-i18n";

const props = defineProps({
  direction: {
    type: String,
    default: "normal",
  },
  menu: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["change"]);
const { t } = useI18n({ useScope: "global" });

const select = (direction) => {
  if (direction === props.direction) return;
  emit("change", direction);
};
</script>

<style scoped>
.rank-direction-control {
  display: inline-flex;
  flex: 0 0 auto;
  padding: 2px;
  border: 1px solid var(--n-border-color);
  border-radius: 999px;
  background: rgba(127, 127, 127, 0.08);
}

.direction-options {
  display: flex;
  align-items: center;
}

.direction-option {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 0;
  background: transparent;
  color: var(--n-text-color);
  border-radius: 999px;
  padding: 4px 8px;
  font-size: 11px;
  line-height: 1.2;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.16s ease, color 0.16s ease, border-color 0.16s ease;
}

.direction-option:hover {
  color: #ea444d;
}

.direction-option.active {
  background: #ea444d;
  color: #fff;
  font-weight: 700;
}

.rank-direction-control.is-menu {
  display: grid;
  width: 100%;
  gap: 7px;
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
}

.is-menu .direction-title {
  color: var(--n-text-color-3, #8a8f99);
  font-size: 11px;
  font-weight: 700;
  line-height: 1.2;
}

.is-menu .direction-options {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
}

.is-menu .direction-option {
  min-height: 34px;
  padding: 7px 10px;
  border: 1px solid var(--n-border-color);
  border-radius: 9px;
  background: rgba(127, 127, 127, 0.05);
  color: var(--n-text-color-2, var(--n-text-color));
  font-size: 12px;
}

.is-menu .direction-option:hover,
.is-menu .direction-option.active {
  border-color: rgba(234, 68, 77, 0.35);
  background: rgba(234, 68, 77, 0.09);
  color: #ea444d;
}

.is-menu .direction-option.active {
  font-weight: 700;
}

@media (max-width: 680px) {
  .direction-option {
    padding-inline: 7px;
  }
}
</style>
