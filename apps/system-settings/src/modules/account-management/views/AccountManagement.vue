<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { useCRUD, useI18n } from "@monorepo/composables";
import { accManagementApi } from "@/api/accountManagement";
import { AccountRole } from "@/api/role";
import { HcMessageBox } from "@monorepo/utils";
import AccountFilterBar from "../components/AccountFilterBar.vue";
import AccountTable from "../components/AccountTable.vue";
import AccountFormDialog from "../components/AccountFormDialog.vue";
import type { AccountItem, GetAccountListParams, Role } from "@monorepo/types";

defineOptions({ name: "AccountManagement" });

const { $t } = useI18n();
const queryClient = useQueryClient();

// ── 角色清單（供 Table 快速檢視與 Dialog 多選共用，只需載入一次）──────────────
const roleOptions = ref<Role[]>([]);

async function loadRoleOptions() {
  try {
    const res = await AccountRole.getRoleList({
      page: 1,
      pageSize: 100,
      status: 1,
    });
    roleOptions.value = (res as any)?.data?.list ?? [];
  } catch {
    ElMessage.error($t("accountManagement.roles.fetchError"));
  }
}

onMounted(loadRoleOptions);

// ── 篩選條件 ──────────────────────────────────────────────────
const filters = ref<GetAccountListParams>({
  page: 1,
  pageSize: 10,
  search: "",
  status: undefined,
});

// ── 工具列事件 ─────────────────────────────────────────────────
function handleSearch() {
  filters.value.page = 1;
}

function handleReset() {
  filters.value.search = "";
  filters.value.status = undefined;
  filters.value.page = 1;
}

function handlePageSizeChange(v: number) {
  filters.value = { ...filters.value, pageSize: v, page: 1 };
}

// ── 帳號列表（API: getAccountList）─────────────────────────────
const { data, isLoading } = useCRUD({
  queryKey: "accountList",
  apiFns: {
    getList: (f: GetAccountListParams) => accManagementApi.getAccountList(f),
  },
  filters,
});

const accountList = computed(() => (data.value as any)?.data?.list ?? []);
const total = computed(() => (data.value as any)?.data?.pagination?.total ?? 0);

// ── 建立 / 檢視 / 編輯 ───────────────────────────────────────────
const formDialogVisible = ref(false);
const dialogMode = ref<"create" | "view" | "edit">("create");
const activeAccountId = ref<string | null>(null);
const rolesRefreshToken = ref(0);

function handleCreate() {
  dialogMode.value = "create";
  activeAccountId.value = null;
  formDialogVisible.value = true;
}

function handleView(row: AccountItem) {
  dialogMode.value = "view";
  activeAccountId.value = row.id;
  formDialogVisible.value = true;
}

function handleEdit(row: AccountItem) {
  dialogMode.value = "edit";
  activeAccountId.value = row.id;
  formDialogVisible.value = true;
}

function handleFormSuccess() {
  queryClient.invalidateQueries({ queryKey: ["accountList"] });
  rolesRefreshToken.value++;
}

// ── 刪除（API: deleteAccount）──────────────────────────────────
const { mutate: doDelete, isPending: isDeleting } = useMutation({
  mutationFn: (id: string) => accManagementApi.deleteAccount(id),
  onSuccess: () => {
    ElMessage.success($t("messages.deleteSuccess"));
    queryClient.invalidateQueries({ queryKey: ["accountList"] });
  },
});

async function handleDelete(row: AccountItem) {
  try {
    await HcMessageBox.confirm(
      $t("accountManagement.delete.confirm", { name: row.accountName }),
      $t("dialog.deleteTitle"),
      {
        confirmButtonText: $t("dialog.confirmDelete"),
        cancelButtonText: $t("common.cancel"),
        type: "warning",
      },
    );
    doDelete(row.id);
  } catch {}
}
</script>

<template>
  <section class="tw-p-6">
    <!-- 頁首 -->
    <div class="tw-mb-6">
      <h1 class="tw-text-3xl tw-font-bold tw-text-slate-800">
        {{ $t("accountManagement.title") }}
      </h1>
    </div>

    <!-- 工具列 -->
    <AccountFilterBar
      :search="filters.search ?? ''"
      :status="filters.status"
      @update:search="filters.search = $event"
      @update:status="filters.status = $event"
      @search="handleSearch"
      @reset="handleReset"
      @create="handleCreate"
    />

    <!-- 資料表格 -->
    <AccountTable
      :data="accountList"
      :total="total"
      :loading="isLoading || isDeleting"
      :page="filters.page ?? 1"
      :page-size="filters.pageSize ?? 10"
      :role-options="roleOptions"
      :roles-refresh-token="rolesRefreshToken"
      @update:page="filters.page = $event"
      @update:page-size="handlePageSizeChange"
      @view="handleView"
      @edit="handleEdit"
      @delete="handleDelete"
    />

    <!-- 建立 / 檢視 / 編輯 Dialog -->
    <AccountFormDialog
      v-model="formDialogVisible"
      :mode="dialogMode"
      :account-id="activeAccountId"
      :role-options="roleOptions"
      @success="handleFormSuccess"
    />
  </section>
</template>
