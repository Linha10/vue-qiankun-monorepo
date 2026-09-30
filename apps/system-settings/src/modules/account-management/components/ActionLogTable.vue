<script setup lang="ts">
import dayjs from "dayjs";
import { useI18n } from "@monorepo/composables";
import type { AccountActionLog } from "@monorepo/types";
import { HcTable } from "@monorepo/ui-kit";

// ── Props / Emits ──────────────────────────────────────────────
defineProps<{
  data: AccountActionLog[];
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

const METHOD_TAG: Record<
  string,
  "success" | "warning" | "danger" | "info" | "primary"
> = {
  GET: "primary",
  POST: "success",
  PUT: "warning",
  DELETE: "danger",
};

function formatDateTime(val: string) {
  return val ? dayjs(val).format("YYYY-MM-DD HH:mm:ss") : "—";
}
</script>

<template>
  <div v-loading="loading">
    <HcTable
      :data="data"
      :total="total"
      :page="page"
      :page-size="pageSize"
      @update:page="emit('update:page', $event)"
      @update:page-size="emit('update:pageSize', $event)"
    >
      <el-table-column type="expand">
        <template #default="{ row }">
          <div
            class="action-log-detail tw-p-4 tw-bg-slate-50 tw-rounded tw-grid tw-grid-cols-2 tw-gap-x-8 tw-gap-y-2"
          >
            <div>
              <span class="tw-text-xs tw-text-slate-500">{{
                $t("accountManagement.actionLogs.detail.action")
              }}</span>
              <p class="tw-text-sm">
                {{ row.requestLog?.action?.name ?? "—" }}
              </p>
            </div>
            <div>
              <span class="tw-text-xs tw-text-slate-500">{{
                $t("accountManagement.actionLogs.detail.latency")
              }}</span>
              <p class="tw-text-sm">{{ row.requestLog?.latency ?? "—" }}</p>
            </div>
            <div>
              <span class="tw-text-xs tw-text-slate-500">{{
                $t("accountManagement.actionLogs.detail.referer")
              }}</span>
              <p class="tw-text-sm tw-break-all">
                {{ row.requestLog?.referer || "—" }}
              </p>
            </div>
            <div>
              <span class="tw-text-xs tw-text-slate-500">{{
                $t("accountManagement.actionLogs.detail.userAgent")
              }}</span>
              <p class="tw-text-sm tw-break-all">
                {{ row.requestLog?.user_agent || "—" }}
              </p>
            </div>
            <div>
              <span class="tw-text-xs tw-text-slate-500">{{
                $t("accountManagement.actionLogs.detail.responseCode")
              }}</span>
              <p class="tw-text-sm">
                {{ row.requestLog?.response_code ?? "—" }}
              </p>
            </div>
            <div>
              <span class="tw-text-xs tw-text-slate-500">{{
                $t("accountManagement.actionLogs.detail.responseMsg")
              }}</span>
              <p class="tw-text-sm tw-break-all">
                {{ row.requestLog?.response_msg || "—" }}
              </p>
            </div>
            <div class="tw-col-span-2">
              <span class="tw-text-xs tw-text-slate-500">{{
                $t("accountManagement.actionLogs.detail.requestBody")
              }}</span>
              <pre class="action-log-detail__code">{{
                row.requestLog?.request_body || "—"
              }}</pre>
            </div>
            <div class="tw-col-span-2">
              <span class="tw-text-xs tw-text-slate-500">{{
                $t("accountManagement.actionLogs.detail.responseBody")
              }}</span>
              <pre class="action-log-detail__code">{{
                row.requestLog?.response_body || "—"
              }}</pre>
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column
        prop="createdAt"
        :label="$t('accountManagement.actionLogs.columns.createdAt')"
        min-width="160"
      >
        <template #default="{ row }">
          {{ formatDateTime(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column
        prop="accountName"
        :label="$t('accountManagement.actionLogs.columns.accountName')"
        min-width="120"
      />
      <el-table-column
        prop="requestMethod"
        :label="$t('accountManagement.actionLogs.columns.requestMethod')"
        width="100"
        align="center"
      >
        <template #default="{ row }">
          <el-tag :type="METHOD_TAG[row.requestMethod] ?? 'info'" size="small">
            {{ row.requestMethod }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="requestUrl"
        :label="$t('accountManagement.actionLogs.columns.requestUrl')"
        min-width="220"
        show-overflow-tooltip
      />
      <el-table-column
        prop="requestIp"
        :label="$t('accountManagement.actionLogs.columns.requestIp')"
        min-width="130"
      />
      <el-table-column
        prop="errorCode"
        :label="$t('accountManagement.actionLogs.columns.errorCode')"
        width="110"
        align="center"
      >
        <template #default="{ row }">
          <el-tag
            :type="row.errorCode === 0 ? 'success' : 'danger'"
            size="small"
          >
            {{ row.errorCode }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="costTimeMs"
        :label="$t('accountManagement.actionLogs.columns.costTimeMs')"
        width="100"
        align="center"
      />
    </HcTable>
  </div>
</template>

<style scoped lang="scss">
.action-log-detail {
  &__code {
    max-height: 200px;
    overflow: auto;
    background: #1e293b;
    color: #e2e8f0;
    padding: 0.5rem;
    border-radius: 4px;
    font-size: 12px;
    white-space: pre-wrap;
    word-break: break-all;
  }
}
</style>
