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
</template>

<script setup>
import { SortAmountDown, SortAmountUp } from "@icon-park/vue-next";
import { useI18n } from "vue-i18n";

const props = defineProps({
  direction: { type: String, default: "normal" },
  menu: { type: Boolean, default: false },
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
  align-items: center;
  flex: 0 0 auto;
  gap: 2px;
  padding: 2px;
  border: 1px solid var(--n-border-color);
  border-radius: 999px;
  background: rgba(127, 127, 127, 0.06);
}

.direction-option {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-height: 24px;
  padding: 3px 7px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--n-text-color-2, var(--n-text-color));
  font: inherit;
  font-size: 12px;
  line-height: 1.15;
  white-space: nowrap;
  cursor: pointer;
  transition: background 0.16s ease, color 0.16s ease;
}

.direction-option:hover {
  color: var(--n-primary-color, #ea444d);
}

.direction-option.active {
  background: rgba(234, 68, 77, 0.1);
  color: var(--n-primary-color, #ea444d);
  font-weight: 650;
}

.rank-direction-control.is-menu {
  padding: 0;
  border: 0;
  background: transparent;
}

.is-menu .direction-option {
  min-height: 26px;
  padding-inline: 7px;
}

@media (max-width: 680px) {
  .direction-option {
    padding-inline: 6px;
  }
}
</style>
