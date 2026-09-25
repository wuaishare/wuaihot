<template>
  <div
    v-if="groups.length || hasActions"
    class="subtype-bar no-card-drag"
    data-no-card-drag
    @pointerdown.stop="lockCardDrag"
    @pointerup.stop="unlockCardDrag"
    @pointercancel.stop="unlockCardDrag"
    @mousedown.stop
    @touchstart.stop="lockCardDrag"
    @touchend.stop="unlockCardDrag"
    @touchcancel.stop="unlockCardDrag"
    @click.stop
  >
    <div
      class="trigger-wrap"
      @mouseenter="handleTriggerEnter"
      @mouseleave="handleTriggerLeave"
    >
      <button
        ref="triggerRef"
        type="button"
        class="subtype-trigger subtype-chip"
        :class="{ active: Boolean(activeItem) }"
        :title="fullCurrentLabel"
        :aria-expanded="menuOpen ? 'true' : 'false'"
        aria-haspopup="menu"
        @click.stop="toggleMenu"
      >
        <span class="trigger-label">{{ currentLabel }}</span>
        <span class="trigger-chevron" :class="{ expanded: menuOpen }" aria-hidden="true"></span>
      </button>
    </div>

    <Teleport to="body">
      <Transition name="subtype-menu">
        <div
          v-if="menuOpen"
          ref="menuRef"
          class="subtype-menu"
          :class="{
            'is-dark': isDarkTheme,
            'is-mobile': isMobile,
            'is-desktop': !isMobile,
          }"
          :style="menuStyle"
          role="menu"
          data-no-card-drag
          @pointerdown.stop="lockCardDrag"
          @pointerup.stop="unlockCardDrag"
          @pointercancel.stop="unlockCardDrag"
          @mousedown.stop
          @touchstart.stop="lockCardDrag"
          @touchend.stop="unlockCardDrag"
          @touchcancel.stop="unlockCardDrag"
          @click.stop
          @mouseenter="keepMenuOpen"
          @mouseleave="handleMenuLeave"
        >
          <template v-if="!isMobile">
            <div
              class="desktop-menu-grid"
              :class="{ 'single-group': displayGroups.length === 1, 'is-mega': isMegaMenu }"
            >
              <section
                v-for="group in displayGroups"
                :key="getGroupKey(group)"
                class="menu-group"
              >
                <div v-if="displayGroups.length > 1 && group.label" class="menu-group-title">
                  {{ group.label }}
                </div>
                <div class="menu-items">
                  <button
                    v-for="item in group.items || []"
                    :key="item.value"
                    type="button"
                    class="menu-item"
                    :class="{ active: item.value === activeValue }"
                    :title="item.fullLabel || item.label"
                    role="menuitemradio"
                    :aria-checked="item.value === activeValue ? 'true' : 'false'"
                    @click="selectItem(item.value)"
                  >
                    <span class="menu-item-main">
                      <span>{{ item.label }}</span>
                    </span>
                  </button>
                </div>
              </section>
            </div>
          </template>

          <template v-else>
            <div class="mobile-accordion-list">
              <section
                v-for="group in displayGroups"
                :key="getGroupKey(group)"
                class="accordion-group"
              >
                <button
                  type="button"
                  class="accordion-heading"
                  :class="{ active: isGroupActive(group) }"
                  @click="toggleAccordion(group)"
                >
                  <span>{{ group.label || currentLabel }}</span>
                  <span
                    class="accordion-chevron"
                    :class="{ expanded: isAccordionOpen(group) }"
                    aria-hidden="true"
                  ></span>
                </button>
                <div v-show="isAccordionOpen(group)" class="accordion-panel">
                  <button
                    v-for="item in group.items || []"
                    :key="item.value"
                    type="button"
                    class="menu-item"
                    :class="{ active: item.value === activeValue }"
                    :title="item.fullLabel || item.label"
                    @click="selectItem(item.value)"
                  >
                    <span class="menu-item-main">
                      <span>{{ item.label }}</span>
                    </span>
                  </button>
                </div>
              </section>
            </div>
          </template>

          <div v-if="hasActions" class="subtype-menu-tools">
            <slot name="actions" />
          </div>

        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useSlots, watch } from "vue";
import { useI18n } from "vue-i18n";
import { mainStore } from "@/store";

const props = defineProps({
  groups: { type: Array, default: () => [] },
  activeValue: { type: String, default: null },
  fallbackLabel: { type: String, default: "" },
  showActions: { type: Boolean, default: false },
});

const emit = defineEmits(["change"]);
const slots = useSlots();
const store = mainStore();
const { t } = useI18n({ useScope: "global" });
const triggerRef = ref(null);
const menuRef = ref(null);
const menuOpen = ref(false);
const menuStyle = ref({});
const isMobile = ref(typeof window !== "undefined" ? window.innerWidth <= 680 : false);
const accordionOpenKeys = ref(new Set());
let closeTimer = null;
let dragUnlockTimer = null;
const EDGE_GAP = 12;
const DESKTOP_MENU_MAX_WIDTH = 640;

const flatItems = computed(() => props.groups.flatMap((group) => group.items || []));
const activeItem = computed(() =>
  flatItems.value.find((item) => item.value === props.activeValue) || flatItems.value[0] || null
);
const hasActions = computed(() => props.showActions && Boolean(slots.actions));
const isDarkTheme = computed(() => store.siteTheme === "dark");

const splitHierarchicalLabel = (label = "") => {
  const parts = String(label || "")
    .split(/\s*[·•]\s*/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length < 2) return null;
  return {
    group: parts.slice(0, -1).join(" · "),
    leaf: parts.at(-1),
  };
};

const compactText = (value = "") =>
  String(value || "")
    .replace(/所有类别/g, "全部")
    .replace(/所有分類/g, "全部")
    .replace(/所有 App/g, "全部")
    .replace(/全部 App/g, "全部")
    .replace(/All Apps/gi, "All")
    .replace(/熱門節目/g, "節目")
    .replace(/热门节目/g, "节目")
    .replace(/熱門單集/g, "單集")
    .replace(/热门单集/g, "单集")
    .replace(/All Categories/gi, "All")
    .replace(/Top Shows/gi, "Shows")
    .replace(/Top Episodes/gi, "Episodes")
    .trim();

const compactTriggerLabel = (label = "") => {
  const parsed = splitHierarchicalLabel(label);
  if (!parsed) return compactText(label);
  return `${compactText(parsed.group)} · ${compactText(parsed.leaf)}`;
};

const fullCurrentLabel = computed(
  () =>
    activeItem.value?.label ||
    props.groups[0]?.label ||
    props.fallbackLabel ||
    t("hotList.rankOrder"),
);
const currentLabel = computed(() => compactTriggerLabel(fullCurrentLabel.value));

const shouldPromoteHierarchy = computed(() => {
  if (props.groups.length !== 1 || flatItems.value.length < 6) return false;
  const hierarchicalCount = flatItems.value.filter((item) =>
    Boolean(splitHierarchicalLabel(item?.label)),
  ).length;
  return hierarchicalCount >= Math.max(4, Math.ceil(flatItems.value.length * 0.6));
});

const displayGroups = computed(() => {
  if (shouldPromoteHierarchy.value) {
    const sourceGroup = props.groups[0] || {};
    const grouped = new Map();
    for (const item of sourceGroup.items || []) {
      const parsed = splitHierarchicalLabel(item?.label);
      const groupLabel = parsed?.group || sourceGroup.label || "";
      const groupKey = `${sourceGroup.key || "group"}:${groupLabel || "other"}`;
      if (!grouped.has(groupKey)) {
        grouped.set(groupKey, {
          ...sourceGroup,
          key: groupKey,
          label: compactText(groupLabel),
          items: [],
        });
      }
      grouped.get(groupKey).items.push({
        ...item,
        fullLabel: item?.label || "",
        label: compactText(parsed?.leaf || item?.label || ""),
      });
    }
    return [...grouped.values()];
  }

  return props.groups.map((group) => ({
    ...group,
    items: (group.items || []).map((item) => {
      const parsed = splitHierarchicalLabel(item?.label);
      const redundantPrefix =
        parsed &&
        String(parsed.group || "").trim().toLowerCase() ===
          String(group.label || "").trim().toLowerCase();
      return {
        ...item,
        fullLabel: item?.label || "",
        label: compactText(redundantPrefix ? parsed.leaf : item?.label || ""),
      };
    }),
  }));
});

const isMegaMenu = computed(
  () => displayGroups.value.length > 2 || flatItems.value.length > 8,
);

const getGroupKey = (group) => group.key || group.label || group.items?.[0]?.value || "group";
const isGroupActive = (group) => (group.items || []).some((item) => item.value === props.activeValue);
const isAccordionOpen = (group) => accordionOpenKeys.value.has(getGroupKey(group));

const syncDefaultAccordion = () => {
  if (!displayGroups.value.length) return;
  const activeGroup = displayGroups.value.find(isGroupActive) || displayGroups.value[0];
  accordionOpenKeys.value = new Set([getGroupKey(activeGroup)]);
};

const notifyCardDragLock = (active) => {
  if (typeof window === "undefined") return;
  if (dragUnlockTimer) {
    clearTimeout(dragUnlockTimer);
    dragUnlockTimer = null;
  }
  const dispatch = () =>
    window.dispatchEvent(new CustomEvent("dailyhot:subtype-interaction", { detail: { active } }));
  if (active) return dispatch();
  dragUnlockTimer = window.setTimeout(() => {
    dragUnlockTimer = null;
    dispatch();
  }, 80);
};
const lockCardDrag = () => notifyCardDragLock(true);
const unlockCardDrag = () => notifyCardDragLock(false);

const clearCloseTimer = () => {
  if (!closeTimer) return;
  clearTimeout(closeTimer);
  closeTimer = null;
};

const closeMenu = () => {
  clearCloseTimer();
  menuOpen.value = false;
};

const scheduleCloseMenu = () => {
  clearCloseTimer();
  closeTimer = window.setTimeout(closeMenu, 160);
};

const updateMenuPosition = () => {
  if (typeof window === "undefined" || !menuOpen.value || !triggerRef.value) return;
  const rect = triggerRef.value.getBoundingClientRect();
  const viewportWidth = document.documentElement?.clientWidth || window.innerWidth;
  const viewportHeight = document.documentElement?.clientHeight || window.innerHeight;
  const availableWidth = viewportWidth - EDGE_GAP * 2;
  const measuredWidth = menuRef.value?.getBoundingClientRect?.().width || rect.width;
  const width = isMobile.value
    ? availableWidth
    : Math.min(Math.max(measuredWidth, rect.width), DESKTOP_MENU_MAX_WIDTH, availableWidth);
  const preferredLeft = rect.right - width;
  const left = Math.max(EDGE_GAP, Math.min(preferredLeft, viewportWidth - width - EDGE_GAP));
  const maxHeight = Math.max(180, viewportHeight - EDGE_GAP * 2);
  const estimatedHeight = Math.min(isMobile.value ? 440 : 360, maxHeight);
  const belowTop = rect.bottom + 6;
  const showAbove = belowTop + estimatedHeight > viewportHeight && rect.top > estimatedHeight + EDGE_GAP;
  menuStyle.value = {
    ...(isMobile.value ? { width: `${width}px` } : {}),
    maxWidth: `${width}px`,
    maxHeight: `${Math.min(isMobile.value ? 480 : 420, maxHeight)}px`,
    left: `${left}px`,
    top: `${showAbove ? Math.max(EDGE_GAP, rect.top - 6) : belowTop}px`,
    transform: showAbove ? "translateY(-100%)" : "none",
  };
};

const openMenu = () => {
  clearCloseTimer();
  if (isMobile.value) syncDefaultAccordion();
  menuOpen.value = true;
  nextTick(() => {
    updateMenuPosition();
    window.requestAnimationFrame?.(updateMenuPosition);
  });
};

const toggleMenu = () => {
  if (menuOpen.value) closeMenu();
  else openMenu();
};

const handleTriggerEnter = () => {
  if (!isMobile.value) openMenu();
};
const handleTriggerLeave = () => {
  if (!isMobile.value) scheduleCloseMenu();
};
const keepMenuOpen = () => clearCloseTimer();
const handleMenuLeave = () => {
  if (!isMobile.value) scheduleCloseMenu();
};

const selectItem = (value) => {
  if (!value) return;
  emit("change", value);
  closeMenu();
};


const toggleAccordion = (group) => {
  const key = getGroupKey(group);
  const next = new Set(accordionOpenKeys.value);
  if (next.has(key)) next.delete(key);
  else next.add(key);
  accordionOpenKeys.value = next;
};

const handleWindowChange = () => {
  const nextMobile = window.innerWidth <= 680;
  if (nextMobile !== isMobile.value) {
    isMobile.value = nextMobile;
    if (nextMobile) syncDefaultAccordion();
  }
  updateMenuPosition();
};

watch(() => [props.groups, props.activeValue], () => {
  if (isMobile.value) syncDefaultAccordion();
  if (menuOpen.value) nextTick(updateMenuPosition);
}, { deep: true });

onMounted(() => {
  document.addEventListener("click", closeMenu);
  window.addEventListener("resize", handleWindowChange);
  window.addEventListener("scroll", updateMenuPosition, true);
  syncDefaultAccordion();
});

onBeforeUnmount(() => {
  document.removeEventListener("click", closeMenu);
  window.removeEventListener("resize", handleWindowChange);
  window.removeEventListener("scroll", updateMenuPosition, true);
  notifyCardDragLock(false);
  clearCloseTimer();
});
</script>

<style lang="scss" scoped>
.subtype-bar {
  position: relative;
  z-index: 20;
  display: flex;
  justify-content: flex-end;
  min-width: 0;
}

.trigger-wrap {
  display: inline-flex;
  min-width: 0;
  max-width: 100%;
}

.subtype-chip,
.subtype-trigger {
  border: 1px solid var(--n-border-color);
  background: transparent;
  color: var(--n-text-color-2, var(--n-text-color));
  border-radius: 999px;
  font-size: 12px;
  line-height: 1.2;
  cursor: pointer;
  transition: border-color 0.16s ease, color 0.16s ease, background 0.16s ease;
}

.subtype-trigger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;
  padding: 4px 9px;
}

.subtype-trigger:hover {
  border-color: var(--n-border-color-hover, var(--n-border-color));
  background: transparent;
  color: var(--n-text-color-2, var(--n-text-color));
}

.subtype-trigger.active {
  border-color: var(--n-border-color);
}

.trigger-label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.trigger-chevron,
.accordion-chevron {
  width: 6px;
  height: 6px;
  flex: 0 0 auto;
  border-right: 1.5px solid currentColor;
  border-bottom: 1.5px solid currentColor;
  transform: rotate(45deg) translateY(-2px);
  transition: transform 0.16s ease;
}

.trigger-chevron.expanded {
  transform: rotate(225deg) translate(-1px, -1px);
}

.subtype-menu {
  --menu-bg: var(--n-card-color, #fff);
  --menu-border: var(--n-border-color, rgba(0, 0, 0, 0.08));
  --menu-text: var(--n-text-color, #1f2329);
  position: fixed;
  z-index: 900;
  box-sizing: border-box;
  width: max-content;
  min-width: 152px;
  overflow: auto;
  padding: 10px;
  border: 1px solid var(--menu-border);
  border-radius: 12px;
  background: var(--menu-bg);
  color: var(--menu-text);
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.15);
  scrollbar-width: thin;
}

.subtype-menu.is-dark {
  --menu-bg: #18181c;
  --menu-border: rgba(255, 255, 255, 0.12);
  --menu-text: rgba(255, 255, 255, 0.9);
  box-shadow: 0 18px 38px rgba(0, 0, 0, 0.42);
}

.desktop-menu-grid {
  display: grid;
  gap: 8px 12px;
}

.desktop-menu-grid:not(.is-mega) {
  grid-auto-flow: column;
  grid-auto-columns: minmax(150px, max-content);
}

.desktop-menu-grid.single-group:not(.is-mega) {
  display: block;
  min-width: max-content;
}

.desktop-menu-grid.is-mega {
  width: min(620px, calc(100vw - 44px));
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  align-items: start;
}

.desktop-menu-grid.single-group.is-mega {
  display: block;
  width: min(520px, calc(100vw - 44px));
}

.desktop-menu-grid.single-group.is-mega .menu-items {
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
}

.menu-group {
  min-width: 0;
}

.menu-group-title {
  padding: 4px 8px 7px;
  color: var(--n-text-color-3, #8a8f99);
  font-size: 11px;
  font-weight: 700;
}

.menu-items {
  display: grid;
  gap: 3px;
}

.menu-item,
.accordion-heading {
  border: 0;
  background: transparent;
  color: var(--menu-text);
  cursor: pointer;
}

.menu-item {
  display: grid;
  gap: 2px;
  width: 100%;
  padding: 8px 10px;
  border-radius: 8px;
  text-align: left;
  font-size: 12px;
  line-height: 1.35;
}

.menu-item-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-width: 0;
}

.menu-item:hover,
.menu-item.active {
  background: rgba(234, 68, 77, 0.1);
  color: #ea444d;
}

.menu-item.active {
  font-weight: 700;
}

.subtype-menu-tools {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 2px 5px;
  min-width: 0;
  margin-top: 6px;
  padding-top: 5px;
  font-size: 12px;
  border-top: 1px solid var(--menu-border);
}

.subtype-menu.is-mobile {
  width: auto;
}

.mobile-accordion-list {
  display: grid;
  gap: 4px;
}

.accordion-group {
  border-bottom: 1px solid var(--menu-border);
}

.accordion-group:last-child {
  border-bottom: 0;
}

.accordion-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 11px 9px;
  text-align: left;
  font-size: 13px;
  font-weight: 700;
}

.accordion-heading.active {
  color: #ea444d;
}

.accordion-chevron.expanded {
  transform: rotate(225deg) translate(-1px, -1px);
}

.accordion-panel {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 4px;
  padding: 0 4px 9px;
}

.is-mobile.subtype-menu {
  padding: 8px;
  border-radius: 12px;
}

.is-mobile .menu-item {
  padding: 9px 8px;
}

.subtype-menu-enter-active,
.subtype-menu-leave-active {
  transition: opacity 0.14s ease, transform 0.14s ease;
}

.subtype-menu-enter-from,
.subtype-menu-leave-to {
  opacity: 0;
}

@media (max-width: 680px) {
  .subtype-trigger {
    max-width: 44vw;
    padding: 5px 10px;
  }

}
</style>
