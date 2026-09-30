<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { useI18n } from "@monorepo/composables";
import { buildPermissionGroups, type PermissionGroup } from "@monorepo/utils";
import type { PermissionNode } from "@monorepo/types";

const props = defineProps<{
  menuList: PermissionNode[];
  modelValue: number[];
}>();

const emit = defineEmits<{
  "update:modelValue": [val: number[]];
}>();

const { $t } = useI18n();

const CRUD_ACTIONS = ["create", "update", "delete"] as const;

const selected = ref(new Set<number>(props.modelValue));

watch(
  () => props.modelValue,
  (val) => {
    selected.value = new Set(val);
  },
);

function emitChange() {
  emit("update:modelValue", [...selected.value]);
}

const groups = computed(() => buildPermissionGroups(props.menuList));

function isChecked(id: number) {
  return selected.value.has(id);
}

function findBtn(btns: PermissionNode[], action: string) {
  return btns.find((b) => b.action === action);
}

// DIR 的檢視權限關閉時，連同群組下所有 MENU / BTN 一併取消勾選並停用
function toggleDirView(group: PermissionGroup) {
  if (!group.dir) return;
  const dirId = group.dir.id;
  if (selected.value.has(dirId)) {
    selected.value.delete(dirId);
    for (const { menu, btns } of group.menus) {
      selected.value.delete(menu.id);
      for (const btn of btns) selected.value.delete(btn.id);
    }
  } else {
    selected.value.add(dirId);
  }
  emitChange();
}

// MENU 的檢視權限關閉時，連同該列 create/update/delete 一併取消勾選並停用
function toggleMenuView(menu: PermissionNode, btns: PermissionNode[]) {
  if (selected.value.has(menu.id)) {
    selected.value.delete(menu.id);
    for (const btn of btns) selected.value.delete(btn.id);
  } else {
    selected.value.add(menu.id);
  }
  emitChange();
}

function toggleBtn(btn: PermissionNode | undefined, menu: PermissionNode) {
  if (!btn || !selected.value.has(menu.id)) return;
  if (selected.value.has(btn.id)) {
    selected.value.delete(btn.id);
  } else {
    selected.value.add(btn.id);
  }
  emitChange();
}
</script>

<template>
  <div
    class="permission-list tw-border tw-border-slate-200 tw-rounded-lg tw-overflow-hidden"
  >
    <!-- 表頭：sticky 釘在捲動容器頂端，避免內容捲動時被蓋住 -->
    <div
      class="tw-grid tw-sticky tw-top-0 tw-z-10 tw-bg-slate-100 tw-text-sm tw-font-medium tw-text-slate-600 tw-py-2"
      style="grid-template-columns: 1fr repeat(4, 90px)"
    >
      <span class="tw-pl-4 tw-font-semibold">{{
        $t("roleManagement.permission.pageColumn")
      }}</span>
      <span class="tw-text-center">{{
        $t("roleManagement.permission.view")
      }}</span>
      <span class="tw-text-center">{{
        $t("roleManagement.permission.create")
      }}</span>
      <span class="tw-text-center">{{
        $t("roleManagement.permission.update")
      }}</span>
      <span class="tw-text-center">{{
        $t("roleManagement.permission.delete")
      }}</span>
    </div>

    <div class="permission-list__body">
      <template
        v-for="group in groups"
        :key="group.dir?.id ?? group.menus[0]?.menu.id"
      >
        <!-- DIR 群組列 -->
        <div
          v-if="group.dir"
          class="tw-grid tw-items-center tw-bg-slate-50 tw-py-2 tw-border-t tw-border-slate-200 tw-transition-colors hover:tw-bg-slate-100"
          style="grid-template-columns: 1fr repeat(4, 90px)"
        >
          <span
            class="tw-pl-4 tw-font-semibold tw-text-slate-700 tw-text-[14px]"
            >{{ group.dir.title }}</span
          >
          <span class="tw-text-center">
            <el-checkbox
              :model-value="isChecked(group.dir.id)"
              @change="toggleDirView(group)"
            />
          </span>
          <span class="tw-text-center tw-text-slate-300">—</span>
          <span class="tw-text-center tw-text-slate-300">—</span>
          <span class="tw-text-center tw-text-slate-300">—</span>
        </div>

        <!-- MENU 列 -->
        <div
          v-for="{ menu, btns } in group.menus"
          :key="menu.id"
          class="tw-grid tw-items-center tw-py-2 tw-border-t tw-border-slate-200 tw-transition-colors hover:tw-bg-slate-50"
          style="grid-template-columns: 1fr repeat(4, 90px)"
        >
          <span
            :class="[group.dir ? 'tw-pl-8' : 'tw-pl-4', 'tw-text-[14px]']"
            >{{ menu.title }}</span
          >
          <span class="tw-text-center">
            <el-checkbox
              :disabled="
                (!!group.dir && !isChecked(group.dir.id)) || menu.id === 77
              "
              :model-value="isChecked(menu.id)"
              @change="toggleMenuView(menu, btns)"
            />
          </span>
          <span
            v-for="action in CRUD_ACTIONS"
            :key="action"
            class="tw-text-center"
          >
            <el-checkbox
              v-if="findBtn(btns, action)"
              :model-value="isChecked(findBtn(btns, action)!.id)"
              :disabled="!isChecked(menu.id)"
              @change="toggleBtn(findBtn(btns, action), menu)"
            />

            <span v-else class="tw-text-slate-300">—</span>
          </span>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "@/styles/variables" as *;

.permission-list {
  max-height: 60vh;
  overflow-y: auto;

  // ── 自訂捲軸樣式（比照 HcDialog__body） ──
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: $color-neutral-100;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: $color-neutral-300;
    border-radius: 3px;

    &:hover {
      background: $color-primary-200;
    }
  }

  scrollbar-width: thin;
  scrollbar-color: $color-neutral-300 $color-neutral-100;
}
</style>
