<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { ElMessage } from "element-plus";
import { useQueryClient } from "@tanstack/vue-query";
import { useI18n, usePermission } from "@monorepo/composables";
import { accManagementApi } from "@/api/accountManagement";
import { HcTable, HcButton, HcSwitch } from "@monorepo/ui-kit";
import dayjs from "dayjs";

import type { TableColumn } from "@monorepo/ui-kit";
import type { AccountItem, Role } from "@monorepo/types";

// ── Props / Emits ──────────────────────────────────
const props = defineProps<{
  data: AccountItem[];
  total: number;
  page: number;
  pageSize: number;
  loading?: boolean;
  roleOptions: Role[];
  rolesRefreshToken?: number;
}>();

const emit = defineEmits<{
  "update:page": [val: number];
  "update:pageSize": [val: number];
  view: [row: AccountItem];
  edit: [row: AccountItem];
  delete: [row: AccountItem];
}>();

const { $t } = useI18n();
const queryClient = useQueryClient();
const { canPerformAction } = usePermission();

// ── 啟用狀態切換（樂觀更新）────────────────────────────────────
const loadingIds = ref(new Set<string>());
const pendingStatusMap = ref<Record<string, 0 | 1>>({});

async function handleToggleStatus(row: AccountItem) {
  if (loadingIds.value.has(row.id)) return;
  const newStatus = (row.status === 1 ? 0 : 1) as 0 | 1;
  pendingStatusMap.value[row.id] = newStatus;
  loadingIds.value.add(row.id);
  try {
    await accManagementApi.updateAcoount(row.id, {
      email: row.email,
      phone: row.phone,
      status: newStatus,
    });
    await queryClient.invalidateQueries({ queryKey: ["accountList"] });
  } catch {
    ElMessage.error($t("accountManagement.messages.statusUpdateFailed"));
  } finally {
    loadingIds.value.delete(row.id);
    delete pendingStatusMap.value[row.id];
  }
}

// ── 角色快速檢視（點擊時才 lazy fetch，並在元件內 cache，避免 N+1 呼叫）────
const accountRolesCache = ref<Record<string, number[]>>({});
const loadingRoleIds = ref(new Set<string>());

watch(
  () => props.rolesRefreshToken,
  () => {
    accountRolesCache.value = {};
  },
);

const roleNameMap = computed(
  () => new Map(props.roleOptions.map((r) => [r.id, r.roleName])),
);

async function loadAccountRoles(row: AccountItem) {
  if (accountRolesCache.value[row.id] || loadingRoleIds.value.has(row.id))
    return;
  loadingRoleIds.value.add(row.id);
  try {
    const res = (await accManagementApi.getAccountRoles(row.id)) as {
      data?: { roleIds?: number[] };
    };
    accountRolesCache.value[row.id] = res.data?.roleIds ?? [];
  } catch {
    ElMessage.error($t("accountManagement.roles.fetchError"));
  } finally {
    loadingRoleIds.value.delete(row.id);
  }
}

function roleNamesFor(row: AccountItem): string[] {
  const ids = accountRolesCache.value[row.id];
  if (!ids) return [];
  return ids
    .map((id) => roleNameMap.value.get(id))
    .filter((name): name is string => !!name);
}

function formatDateTime(val: string) {
  return val ? dayjs(val).format("YYYY-MM-DD HH:mm:ss") : "—";
}

// ── Table columns ──────────────────────────────────────────────
const columns = computed<TableColumn[]>(() => [
  {
    prop: "actions",
    label: $t("accountManagement.columns.actions"),
    width: 130,
    align: "center",
    fixed: "left",
  },
  { prop: "code", label: $t("accountManagement.columns.code"), minWidth: 100 },
  {
    prop: "accountName",
    label: $t("accountManagement.columns.accountName"),
    minWidth: 120,
  },
  {
    prop: "email",
    label: $t("accountManagement.columns.email"),
    minWidth: 180,
  },
  {
    prop: "phone",
    label: $t("accountManagement.columns.phone"),
    minWidth: 120,
  },
  {
    prop: "roles",
    label: $t("accountManagement.columns.roles"),
    minWidth: 140,
  },
  {
    prop: "status",
    label: $t("accountManagement.columns.status"),
    width: 90,
    align: "center",
    fixed: "right",
  },
  {
    prop: "loginAt",
    label: $t("accountManagement.columns.loginAt"),
    minWidth: 160,
  },
  {
    prop: "loginIp",
    label: $t("accountManagement.columns.loginIp"),
    minWidth: 120,
  },
]);
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
      <!-- 操作欄（固定左） -->
      <template #actions="{ scope }">
        <div class="tw-flex tw-gap-1 tw-justify-center">
          <el-tooltip :content="$t('common.view')" placement="top">
            <HcButton
              text
              type="info"
              size="small"
              @click="emit('view', scope)"
            >
              <i class="fa-solid fa-eye" />
            </HcButton>
          </el-tooltip>
          <el-tooltip :content="$t('common.edit')" placement="top">
            <HcButton
              text
              type="primary"
              size="small"
              :disabled="!canPerformAction('/account-management', 'update')"
              @click="emit('edit', scope)"
            >
              <i class="fa-solid fa-pen" />
            </HcButton>
          </el-tooltip>
          <el-tooltip :content="$t('common.delete')" placement="top">
            <HcButton
              text
              type="danger"
              size="small"
              :disabled="!canPerformAction('/account-management', 'delete')"
              @click="emit('delete', scope)"
            >
              <i class="fa-solid fa-trash" />
            </HcButton>
          </el-tooltip>
        </div>
      </template>

      <!-- 最後登入時間 -->
      <template #loginAt="{ scope }">
        <span>{{ scope.loginAt ? formatDateTime(scope.loginAt) : "—" }}</span>
      </template>

      <!-- 最後登入 IP -->
      <template #loginIp="{ scope }">
        <span>{{ scope.loginIp ?? "—" }}</span>
      </template>

      <!-- 角色（點擊彈出快速檢視） -->
      <template #roles="{ scope }">
        <el-popover
          placement="top"
          width="240"
          trigger="click"
          @show="loadAccountRoles(scope)"
        >
          <template #reference>
            <HcButton text type="primary" size="small">
              <i class="fa-solid fa-user-shield tw-mr-1" />
              {{ $t("accountManagement.roles.viewButton") }}
            </HcButton>
          </template>
          <div
            v-if="loadingRoleIds.has(scope.id)"
            class="tw-text-center tw-text-slate-400 tw-py-2"
          >
            <i class="fa-solid fa-spinner fa-spin" />
          </div>
          <div
            v-else-if="roleNamesFor(scope).length"
            class="tw-flex tw-flex-wrap tw-gap-1"
          >
            <el-tag
              v-for="name in roleNamesFor(scope)"
              :key="name"
              size="small"
              >{{ name }}</el-tag
            >
          </div>
          <div v-else class="tw-text-slate-400 tw-text-sm">
            {{ $t("accountManagement.roles.empty") }}
          </div>
        </el-popover>
      </template>

      <!-- 啟用狀態（固定右） -->
      <template #status="{ scope }">
        <HcSwitch
          :model-value="(pendingStatusMap[scope.id] ?? scope.status) === 1"
          :loading="loadingIds.has(scope.id)"
          :disabled="loadingIds.has(scope.id)"
          @change="handleToggleStatus(scope)"
        />
      </template>
    </HcTable>
  </div>
</template>
