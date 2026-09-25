<template>
  <div
    class="rank-direction-control no-card-drag"
    :class="{ 'is-menu': menu, 'is-expanded': menu && expanded }"
    role="group"
    :aria-label="t('hotList.rankOrder')"
    data-no-card-drag
    @click.stop
    @pointerdown.stop
    @mousedown.stop
  >
    <template v-if="menu">
      <button
        v-if="!inlineMenu && !expanded"
        type="button"
        class="ranking-tool-trigger"
        :title="`${t('hotList.rankOrder')}：${activeLabel}`"
        :aria-label="`${t('hotList.rankOrder')}：${activeLabel}`"
        @click="expanded = true"
      >
        <n-icon :component="activeIcon" />
        <span>{{ activeLabel }}</span>
      </button>
      <div v-else class="ranking-tool-options">
        <button
          type="button"
          class="ranking-tool-option"
          :class="{ active: direction !== 'reverse' }"
          :aria-pressed="direction !== 'reverse'"
          @click="select('normal')"
        >
          <n-icon :component="SortAmountUp" />
          <span>{{ t("hotList.rankOrderNormal") }}</span>
        </button>
        <button
          type="button"
          class="ranking-tool-option"
          :class="{ active: direction === 'reverse' }"
          :aria-pressed="direction === 'reverse'"
          @click="select('reverse')"
        >
          <n-icon :component="SortAmountDown" />
          <span>{{ t("hotList.rankOrderReverse") }}</span>
        </button>
      </div>
    </template>

    <template v-else>
      <button
        type="button"
        class="direction-option"
        :class="{ active: direction !== 'reverse' }"
        :aria-pressed="direction !== 'reverse'"
        @click="select('normal')"
      >
        <span>{{ t("hotList.rankOrderNormal") }}</span>
      </button>
      <button
        type="button"
        class="direction-option"
        :class="{ active: direction === 'reverse' }"
        :aria-pressed="direction === 'reverse'"
        @click="select('reverse')"
      >
        <span>{{ t("hotList.rankOrderReverse") }}</span>
      </button>
    </template>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { SortAmountDown, SortAmountUp } from "@icon-park/vue-next";
import { useI18n } from "vue-i18n";

const props = defineProps({
  direction: { type: String, default: "normal" },
  menu: { type: Boolean, default: false },
  inlineMenu: { type: Boolean, default: false },
});

const emit = defineEmits(["change"]);
const { t } = useI18n({ useScope: "global" });
const expanded = ref(false);
const activeLabel = computed(() =>
  props.direction === "reverse"
    ? t("hotList.rankOrderReverse")
    : t("hotList.rankOrderNormal"),
);
const activeIcon = computed(() =>
  props.direction === "reverse" ? SortAmountDown : SortAmountUp,
);

const select = (direction) => {
  if (direction !== props.direction) emit("change", direction);
  if (props.menu && !props.inlineMenu) expanded.value = false;
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

.direction-option,
.ranking-tool-trigger,
.ranking-tool-option {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-height: 24px;
  padding: 3px 7px;
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

.direction-option {
  border-radius: 999px;
}

.direction-option:hover,
.ranking-tool-trigger:hover,
.ranking-tool-option:hover {
  color: var(--n-primary-color, #ea444d);
  background: rgba(127, 127, 127, 0.06);
}

.direction-option.active,
.ranking-tool-option.active {
  color: var(--n-primary-color, #ea444d);
  background: rgba(234, 68, 77, 0.09);
  font-weight: 650;
}

.rank-direction-control.is-menu {
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
}

.ranking-tool-trigger {
  min-height: 25px;
  padding-inline: 5px;
}

.ranking-tool-options {
  display: inline-flex;
  align-items: center;
  gap: 1px;
}

.ranking-tool-option {
  min-height: 25px;
  padding-inline: 6px;
}

@media (max-width: 680px) {
  .direction-option,
  .ranking-tool-trigger,
  .ranking-tool-option {
    padding-inline: 6px;
  }
}
</style>
