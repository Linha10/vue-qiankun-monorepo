<script setup lang="ts">
import { ref, computed } from "vue";
import dayjs from "dayjs";
import { useCRUD, useI18n } from "@monorepo/composables";
import { logs } from "@/api/logs";
import LoginLogFilterBar from "../components/LoginLogFilterBar.vue";
import LoginLogTable from "../components/LoginLogTable.vue";
import type { LoginLogsParams } from "@monorepo/types";

defineOptions({ name: "LoginLogsView" });

const { $t } = useI18n();

// ── 篩選條件（預設近 7 天）──────────────────────────────────────
function defaultDateRange() {
  return {
    startDate: dayjs().subtract(6, "day").format("YYYY-MM-DD"),
    endDate: dayjs().format("YYYY-MM-DD"),
  };
}

const filters = ref<LoginLogsParams>({
  page: 1,
  pageSize: 10,
  loginId: "",
  action: undefined,
  provider: undefined,
  ...defaultDateRange(),
});

// 日期範圍雙向繫結輔助
const dateRange = computed({
  get: () =>
    filters.value.startDate && filters.value.endDate
      ? [filters.value.startDate, filters.value.endDate]
      : [],
  set: (val: string[]) => {
    filters.value.startDate = val?.[0] ?? undefined;
    filters.value.endDate = val?.[1] ?? undefined;
  },
});

// ── 工具列事件 ─────────────────────────────────────────────────
function handleSearch() {
  filters.value.page = 1;
}

function handleReset() {
  filters.value.loginId = "";
  filters.value.action = undefined;
  filters.value.provider = undefined;
  Object.assign(filters.value, defaultDateRange());
  filters.value.page = 1;
}

function handlePageSizeChange(v: number) {
  filters.value = { ...filters.value, pageSize: v, page: 1 };
}

// ── 登入登出日誌列表（唯讀，無 CRUD）─────────────────────────────
const { data, isLoading } = useCRUD({
  queryKey: "loginLogs",
  apiFns: { getList: (f: LoginLogsParams) => logs.getLoginLogs(f) },
  filters,
});

const logList = computed(() => (data.value as any)?.data?.list ?? []);
const total = computed(() => (data.value as any)?.data?.pagination?.total ?? 0);
</script>

<template>
  <section class="tw-p-6">
    <!-- 頁首 -->
    <div class="tw-mb-6">
      <h1 class="tw-text-3xl tw-font-bold tw-text-slate-800">
        {{ $t("accountManagement.loginLogs.title") }}
      </h1>
    </div>

    <!-- 工具列 -->
    <LoginLogFilterBar
      :login-id="filters.loginId ?? ''"
      :action="filters.action"
      :provider="filters.provider"
      :date-range="dateRange"
      @update:login-id="filters.loginId = $event"
      @update:action="filters.action = $event"
      @update:provider="filters.provider = $event"
      @update:date-range="dateRange = $event"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- 資料表格 -->
    <LoginLogTable
      :data="logList"
      :total="total"
      :loading="isLoading"
      :page="filters.page ?? 1"
      :page-size="filters.pageSize ?? 10"
      @update:page="filters.page = $event"
      @update:page-size="handlePageSizeChange"
    />
  </section>
</template>
