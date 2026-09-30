<script setup lang="ts">
import { ref, computed } from "vue";
import { FACILITY_ICONS } from "../constants/facilityIcons";

// ── Props / Emits ──────────────────────────────────────────────
defineProps<{
  modelValue: string;
  placeholder?: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [val: string];
}>();

// ── 搜尋 ──────────────────────────────────────────────────────
const search = ref("");
const popoverVisible = ref(false);

const filteredIcons = computed(() => {
  const q = search.value.trim().toLowerCase();
  if (!q) return FACILITY_ICONS;
  return FACILITY_ICONS.filter(
    (ic) =>
      ic.label.toLowerCase().includes(q) || ic.name.toLowerCase().includes(q),
  );
});

// ── 選取 ──────────────────────────────────────────────────────
function selectIcon(name: string) {
  emit("update:modelValue", name);
  popoverVisible.value = false;
  search.value = "";
}

function clearIcon() {
  emit("update:modelValue", "");
}
</script>

<template>
  <el-popover
    v-model:visible="popoverVisible"
    placement="bottom-start"
    :width="360"
    trigger="click"
    popper-class="hc-icon-picker-popper"
  >
    <!-- 觸發按鈕 -->
    <template #reference>
      <div
        class="hc-icon-picker-trigger"
        :class="{ 'is-active': popoverVisible }"
      >
        <template v-if="modelValue">
          <i :class="`fas ${modelValue} hc-icon-picker-trigger__icon`" />
          <span class="hc-icon-picker-trigger__name">{{ modelValue }}</span>
          <el-icon
            class="hc-icon-picker-trigger__clear"
            @click.stop="clearIcon"
          >
            <component :is="'CircleClose'" />
          </el-icon>
        </template>
        <template v-else>
          <span class="hc-icon-picker-trigger__placeholder">
            {{ placeholder ?? "Select an icon" }}
          </span>
          <el-icon class="hc-icon-picker-trigger__arrow"
            ><component :is="'ArrowDown'"
          /></el-icon>
        </template>
      </div>
    </template>

    <!-- Popover 內容 -->
    <div class="hc-icon-picker-panel">
      <el-input
        v-model="search"
        size="small"
        clearable
        placeholder="搜尋圖示..."
        class="tw-mb-2"
      />
      <div class="hc-icon-picker-grid">
        <el-tooltip
          v-for="ic in filteredIcons"
          :key="ic.name"
          :content="ic.label"
          placement="top"
          :show-after="300"
        >
          <button
            type="button"
            class="hc-icon-picker-item"
            :class="{ 'is-selected': modelValue === ic.name }"
            @click="selectIcon(ic.name)"
          >
            <i :class="`fas ${ic.name}`" />
          </button>
        </el-tooltip>
      </div>
      <p v-if="filteredIcons.length === 0" class="hc-icon-picker-empty">
        無符合圖示
      </p>
    </div>
  </el-popover>
</template>

<style scoped lang="scss">
@use "@/styles/variables" as *;

.hc-icon-picker-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-height: 32px;
  padding: 4px 10px;
  border: 1px solid $color-neutral-300;
  border-radius: 6px;
  cursor: pointer;
  background: $color-neutral-0;
  transition: border-color 0.2s;
  box-sizing: border-box;

  &:hover,
  &.is-active {
    border-color: $color-primary;
  }

  &__icon {
    font-size: 15px;
    color: $color-primary;
    width: 18px;
    text-align: center;
  }

  &__name {
    flex: 1;
    font-size: 13px;
    color: $color-neutral-700;
    font-family: monospace;
  }

  &__placeholder {
    flex: 1;
    font-size: 13px;
    color: $color-neutral-400;
  }

  &__clear,
  &__arrow {
    color: $color-neutral-400;
    font-size: 14px;

    &:hover {
      color: $color-neutral-700;
    }
  }
}

.hc-icon-picker-panel {
  padding: 4px;
  overflow-x: hidden;
}

.hc-icon-picker-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 4px;
  max-height: 220px;
  overflow-y: auto;
  padding: 2px;
}

.hc-icon-picker-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  font-size: 14px;
  color: $color-neutral-600;
  transition: all 0.15s;

  &:hover {
    background: $color-primary-50;
    border-color: $color-primary-100;
    color: $color-primary;
  }

  &.is-selected {
    background: $color-primary-100;
    border-color: $color-primary;
    color: $color-primary;
  }
}

.hc-icon-picker-empty {
  text-align: center;
  font-size: 13px;
  color: $color-neutral-400;
  padding: 12px 0;
  margin: 0;
}
</style>
