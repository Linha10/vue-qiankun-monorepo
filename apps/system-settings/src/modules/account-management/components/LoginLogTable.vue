<script setup lang="ts">
import { computed } from "vue";
import dayjs from "dayjs";
import { useI18n } from "@monorepo/composables";
import type { LoginLogsItem } from "@monorepo/types";
import { HcTable } from "@monorepo/ui-kit";

// ── Props / Emits ──────────────────────────────────────────────
defineProps<{
  data: LoginLogsItem[];
  total: number;
  page: number;
  pageSize: number;
  loading?: boolean;
}>();

const emit = defineEmits<{
  "update:page": [val: number];
  "update:pageSize": [val: number];
}>();

const { $t } = useI18n();

// ── Table columns ──────────────────────────────────────────────
const columns = computed(() => [
  {
    prop: "loginName",
    label: $t("accountManagement.loginLogs.columns.loginName"),
    minWidth: 120,
    align: "center" as const,
  },
  {
    prop: "action",
    label: $t("accountManagement.loginLogs.columns.action"),
    width: 100,
    align: "center" as const,
  },
  {
    prop: "createdAt",
    label: $t("accountManagement.loginLogs.columns.createdAt"),
    minWidth: 160,
    align: "center" as const,
  },
  {
    prop: "provider",
    label: $t("accountManagement.loginLogs.columns.provider"),
    width: 100,
    align: "center" as const,
  },
  {
    prop: "loginIp",
    label: $t("accountManagement.loginLogs.columns.loginIp"),
    minWidth: 130,
  },
  {
    prop: "deviceInfo",
    label: $t("accountManagement.loginLogs.columns.deviceInfo"),
    minWidth: 200,
  },
]);

function formatDateTime(val: string) {
  return val ? dayjs(val).format("YYYY-MM-DD HH:mm:ss") : "—";
}
</script>

<template>
  <div v-loading="loading">
    <HcTable
      :data="data"
      :columns="columns"
      :total="total"
      :page="page"
      :page-size="pageSize"
      @update:page="emit('update:page', $event)"
      @update:page-size="emit('update:pageSize', $event)"
    >
      <!-- 時間 -->
      <template #createdAt="{ scope }">
        {{ formatDateTime(scope.createdAt) }}
      </template>

      <!-- 動作類型 -->
      <template #action="{ scope }">
        <el-tag
          :type="scope.action === 'login' ? 'success' : 'info'"
          size="small"
        >
          {{ $t(`accountManagement.loginLogs.action.${scope.action}`) }}
        </el-tag>
      </template>

      <!-- 來源 -->
      <template #provider="{ scope }">
        <span>{{
          $t(`accountManagement.loginLogs.provider.${scope.provider}`)
        }}</span>
      </template>
    </HcTable>
  </div>
</template>
