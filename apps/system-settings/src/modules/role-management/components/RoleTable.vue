<script setup lang="ts">
import { computed } from "vue";
import dayjs from "dayjs";
import { useI18n, usePermission } from "@monorepo/composables";
import { HcTable, HcButton } from "@monorepo/ui-kit";
import type { TableColumn } from "@monorepo/ui-kit";
import type { Role } from "@monorepo/types";

defineProps<{
  data: Role[];
  total: number;
  loading: boolean;
  page: number;
  pageSize: number;
}>();

const emit = defineEmits<{
  "update:page": [val: number];
  "update:pageSize": [val: number];
  edit: [row: Role];
  delete: [row: Role];
  preview: [row: Role];
}>();

const { $t } = useI18n();
const { canPerformAction } = usePermission();

const columns = computed<TableColumn[]>(() => [
  {
    prop: "actions",
    label: $t("roleManagement.columns.actions"),
    width: 180,
    align: "center",
    fixed: "left",
  },
  {
    prop: "roleName",
    label: $t("roleManagement.columns.roleName"),
    minWidth: 120,
  },
  {
    prop: "roleKey",
    label: $t("roleManagement.columns.roleKey"),
    minWidth: 120,
  },
  {
    prop: "sort",
    label: $t("roleManagement.columns.sort"),
    width: 90,
    align: "center",
  },
  {
    prop: "createdAt",
    label: $t("roleManagement.columns.createdAt"),
    minWidth: 160,
  },
  {
    prop: "updatedAt",
    label: $t("roleManagement.columns.updatedAt"),
    minWidth: 160,
  },
  {
    prop: "status",
    label: $t("roleManagement.columns.status"),
    width: 100,
    align: "center",
  },
]);

function formatDateTime(val: string) {
  return val ? dayjs(val).format("YYYY-MM-DD HH:mm:ss") : "—";
}
</script>

<template>
  <div class="tw-bg-white tw-rounded-lg tw-p-4 tw-shadow-sm">
    <HcTable
      v-loading="loading"
      :data="data"
      :columns="columns"
      :total="total"
      :page="page"
      :page-size="pageSize"
      row-key="id"
      @update:page="emit('update:page', $event)"
      @update:page-size="emit('update:pageSize', $event)"
    >
      <!-- 操作欄（固定右） -->
      <template #actions="{ scope }">
        <div class="tw-flex tw-gap-1 tw-justify-center">
          <el-tooltip
            :content="$t('roleManagement.permission.previewButton')"
            placement="top"
          >
            <HcButton
              text
              type="info"
              size="small"
              @click="emit('preview', scope)"
            >
              <i class="fa-solid fa-shield-halved" />
            </HcButton>
          </el-tooltip>
          <el-tooltip :content="$t('common.edit')" placement="top">
            <HcButton
              text
              type="primary"
              size="small"
              :disabled="!canPerformAction('/role-management', 'update')"
              @click="emit('edit', scope)"
            >
              <i class="fa-solid fa-pen" />
            </HcButton>
          </el-tooltip>
          <el-tooltip
            :content="
              scope.roleKey === 'admin'
                ? $t('roleManagement.delete.protectedAdmin')
                : $t('common.delete')
            "
            placement="top"
          >
            <HcButton
              text
              type="danger"
              size="small"
              :disabled="
                scope.roleKey === 'admin' ||
                !canPerformAction('/role-management', 'delete')
              "
              @click="emit('delete', scope)"
            >
              <i class="fa-solid fa-trash" />
            </HcButton>
          </el-tooltip>
        </div>
      </template>

      <!-- 建立/更新時間 -->
      <template #createdAt="{ scope }">
        {{ formatDateTime(scope.createdAt) }}
      </template>
      <template #updatedAt="{ scope }">
        {{ formatDateTime(scope.updatedAt) }}
      </template>

      <!-- 啟用狀態 -->
      <template #status="{ scope }">
        <el-tag :type="scope.status === 1 ? 'success' : 'info'" size="small">
          {{ scope.status === 1 ? $t("common.enable") : $t("common.disable") }}
        </el-tag>
      </template>
    </HcTable>
  </div>
</template>
