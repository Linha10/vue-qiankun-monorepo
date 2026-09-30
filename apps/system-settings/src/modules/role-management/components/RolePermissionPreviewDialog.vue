<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { ElMessage } from "element-plus";
import { useI18n } from "@monorepo/composables";
import { AccountRole } from "@/api/role";
import { HcDialog } from "@monorepo/ui-kit";
import { buildPermissionGroups } from "@monorepo/utils";
import type { PermissionNode } from "@monorepo/types";

const props = defineProps<{
  modelValue: boolean;
  roleId: string | null;
  roleName?: string;
  menuList: PermissionNode[];
}>();

const emit = defineEmits<{
  "update:modelValue": [val: boolean];
}>();

const { $t } = useI18n();

// ── 角色目前擁有的權限 id ──────────────────────────────────────
const isFetching = ref(false);
const selectedIds = ref(new Set<number>());

watch(
  () => props.modelValue,
  async (open) => {
    if (!open) {
      selectedIds.value = new Set();
      return;
    }
    if (!props.roleId) return;
    isFetching.value = true;
    try {
      const res = await AccountRole.getRoleMenu(props.roleId);
      selectedIds.value = new Set(((res as any)?.data ?? []) as number[]);
    } catch {
      ElMessage.error($t("roleManagement.permission.fetchError"));
    } finally {
      isFetching.value = false;
    }
  },
);

// ── 分組並過濾出實際擁有的權限 ──────────────────────────────────
interface DisplayMenuRow {
  menu: PermissionNode;
  hasView: boolean;
  hasCreate: boolean;
  hasUpdate: boolean;
  hasDelete: boolean;
}

interface DisplayGroup {
  key: number;
  title: string | null;
  menus: DisplayMenuRow[];
}

const groups = computed(() => buildPermissionGroups(props.menuList));

const displayGroups = computed<DisplayGroup[]>(() => {
  const result: DisplayGroup[] = [];
  for (const group of groups.value) {
    const menus = group.menus
      .map(({ menu, btns }) => {
        const findGranted = (action: string) => {
          const btn = btns.find((b) => b.action === action);
          return !!btn && selectedIds.value.has(btn.id);
        };
        return {
          menu,
          hasView: selectedIds.value.has(menu.id),
          hasCreate: findGranted("create"),
          hasUpdate: findGranted("update"),
          hasDelete: findGranted("delete"),
        };
      })
      .filter(
        (row) => row.hasView || row.hasCreate || row.hasUpdate || row.hasDelete,
      );

    if (menus.length === 0) continue;
    result.push({
      key: group.dir?.id ?? menus[0].menu.id,
      title: group.dir?.title ?? null,
      menus,
    });
  }
  return result;
});
</script>

<template>
  <HcDialog
    :model-value="modelValue"
    :title="
      $t('roleManagement.permission.previewTitle', { name: roleName ?? '' })
    "
    :show-footer="false"
    width="520px"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <!-- 載入中 -->
    <div
      v-if="isFetching"
      class="tw-flex tw-items-center tw-justify-center tw-py-16 tw-text-slate-400"
    >
      <i class="fa-solid fa-spinner fa-spin tw-text-2xl" />
    </div>

    <!-- 權限清單 -->
    <template v-else-if="displayGroups.length">
      <div v-for="group in displayGroups" :key="group.key" class="form-section">
        <div v-if="group.title" class="form-section__header">
          <i class="fa-solid fa-folder-open form-section__icon" />
          <span>{{ group.title }}</span>
        </div>

        <div v-for="row in group.menus" :key="row.menu.id" class="menu-row">
          <span class="menu-row__title">{{ row.menu.title }}</span>
          <div class="menu-row__tags">
            <el-tag v-if="row.hasView" size="small" type="info">
              {{ $t("roleManagement.permission.view") }}
            </el-tag>
            <el-tag v-if="row.hasCreate" size="small" type="success">
              {{ $t("roleManagement.permission.create") }}
            </el-tag>
            <el-tag v-if="row.hasUpdate" size="small" type="warning">
              {{ $t("roleManagement.permission.update") }}
            </el-tag>
            <el-tag v-if="row.hasDelete" size="small" type="danger">
              {{ $t("roleManagement.permission.delete") }}
            </el-tag>
          </div>
        </div>
      </div>
    </template>

    <!-- 無資料 -->
    <div
      v-else
      class="tw-flex tw-flex-col tw-items-center tw-justify-center tw-py-16 tw-text-slate-400"
    >
      <i class="fa-solid fa-shield-halved tw-text-3xl tw-mb-3" />
      <span class="tw-text-sm">{{
        $t("roleManagement.permission.previewEmpty")
      }}</span>
    </div>
  </HcDialog>
</template>

<style scoped lang="scss">
@use "@/styles/variables" as *;

// ── Section Card ──────────
.form-section {
  border: 1px solid $color-neutral-200;
  border-radius: 8px;
  padding: 14px 16px;
  background: $color-neutral-0;

  & + .form-section {
    margin-top: 10px;
  }

  &__header {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 600;
    color: $color-neutral-700;
    margin-bottom: 14px;
    padding-bottom: 10px;
    border-bottom: 1px solid $color-neutral-100;
  }

  &__icon {
    color: $color-primary;
    font-size: 15px;
  }
}

// ── 權限列 ────────────────────────────────────────────────────
.menu-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 6px 0;

  &__title {
    font-size: 13px;
    color: $color-neutral-700;
  }

  &__tags {
    display: flex;
    gap: 6px;
  }
}
</style>
