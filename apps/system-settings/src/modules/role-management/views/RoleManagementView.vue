<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { useCRUD, useI18n } from "@monorepo/composables";
import { AccountRole } from "@/api/role";
import RoleFilterBar from "../components/RoleFilterBar.vue";
import RoleTable from "../components/RoleTable.vue";
import RolePermissionPreviewDialog from "../components/RolePermissionPreviewDialog.vue";
import { flattenMenuTree } from "@monorepo/utils";
import type { PermissionNode, Role, RoleListParams } from "@monorepo/types";

defineOptions({ name: "RoleManagement" });

const router = useRouter();
const { $t } = useI18n();
const queryClient = useQueryClient();

// ── 篩選條件 ──────────────────────────────────────────────────
const filters = ref<RoleListParams>({
  page: 1,
  pageSize: 10,
  search: "",
  status: undefined,
});

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

// ── 角色列表（API: getRoleList）────────────────────────────────
const { data, isLoading } = useCRUD({
  queryKey: "roleList",
  apiFns: { getList: (f: RoleListParams) => AccountRole.getRoleList(f) },
  filters,
});

const roleList = computed(() => (data.value as any)?.data?.list ?? []);
const total = computed(() => (data.value as any)?.data?.pagination?.total ?? 0);

// ── 建立 / 編輯（導向獨立頁面）────────────────────────────────
function handleCreate() {
  router.push("/role-management/create");
}

function handleEdit(row: Role) {
  router.push(`/role-management/edit/${row.id}`);
}

// ── 權限預覽（列表共用同一份選單樹，開啟時才查詢該角色的權限）──────
const menuTree = ref<PermissionNode[]>([]);
const previewVisible = ref(false);
const previewRoleId = ref<string | null>(null);
const previewRoleName = ref("");

async function loadMenuTree() {
  try {
    const res = await AccountRole.getMenuTree({ status: 1 });
    menuTree.value = flattenMenuTree((res as any)?.data);
  } catch {
    ElMessage.error($t("roleManagement.form.fetchMenuError"));
  }
}

function handlePreview(row: Role) {
  previewRoleId.value = String(row.id);
  previewRoleName.value = row.roleName;
  previewVisible.value = true;
}

onMounted(loadMenuTree);

// ── 刪除（API: deleteSpecificRole）──────────────────────────────
const { mutate: doDelete, isPending: isDeleting } = useMutation({
  mutationFn: (roleId: string) => AccountRole.deleteSpecificRole(roleId),
  onSuccess: () => {
    ElMessage.success($t("messages.deleteSuccess"));
    queryClient.invalidateQueries({ queryKey: ["roleList"] });
  },
});

async function handleDelete(row: Role) {
  try {
    await ElMessageBox.confirm(
      $t("roleManagement.delete.confirm", { name: row.roleName }),
      $t("dialog.deleteTitle"),
      {
        confirmButtonText: $t("dialog.confirmDelete"),
        cancelButtonText: $t("common.cancel"),
        type: "warning",
      },
    );
    doDelete(String(row.id));
  } catch {}
}
</script>

<template>
  <section class="tw-p-6">
    <!-- 頁首 -->
    <div class="tw-mb-6">
      <h1 class="tw-text-3xl tw-font-bold tw-text-slate-800">
        {{ $t("roleManagement.title") }}
      </h1>
    </div>

    <!-- 工具列 -->
    <RoleFilterBar
      :search="filters.search ?? ''"
      :status="filters.status"
      @update:search="filters.search = $event"
      @update:status="filters.status = $event"
      @search="handleSearch"
      @reset="handleReset"
      @create="handleCreate"
    />

    <!-- 資料表格 -->
    <RoleTable
      :data="roleList"
      :total="total"
      :loading="isLoading || isDeleting"
      :page="filters.page ?? 1"
      :page-size="filters.pageSize ?? 10"
      @update:page="filters.page = $event"
      @update:page-size="handlePageSizeChange"
      @edit="handleEdit"
      @delete="handleDelete"
      @preview="handlePreview"
    />

    <RolePermissionPreviewDialog
      v-model="previewVisible"
      :role-id="previewRoleId"
      :role-name="previewRoleName"
      :menu-list="menuTree"
    />
  </section>
</template>
