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
defineOptions({ name: "RoleManagement" });
const router = useRouter();
const { $t } = useI18n();
const queryClient = useQueryClient();
// ── 篩選條件 ──────────────────────────────────────────────────
const filters = ref({
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
function handlePageSizeChange(v) {
    filters.value = { ...filters.value, pageSize: v, page: 1 };
}
// ── 角色列表（API: getRoleList）────────────────────────────────
const { data, isLoading } = useCRUD({
    queryKey: "roleList",
    apiFns: { getList: (f) => AccountRole.getRoleList(f) },
    filters,
});
const roleList = computed(() => data.value?.data?.list ?? []);
const total = computed(() => data.value?.data?.pagination?.total ?? 0);
// ── 建立 / 編輯（導向獨立頁面）────────────────────────────────
function handleCreate() {
    router.push("/role-management/create");
}
function handleEdit(row) {
    router.push(`/role-management/edit/${row.id}`);
}
// ── 權限預覽（列表共用同一份選單樹，開啟時才查詢該角色的權限）──────
const menuTree = ref([]);
const previewVisible = ref(false);
const previewRoleId = ref(null);
const previewRoleName = ref("");
async function loadMenuTree() {
    try {
        const res = await AccountRole.getMenuTree({ status: 1 });
        menuTree.value = flattenMenuTree(res?.data);
    }
    catch {
        ElMessage.error($t("roleManagement.form.fetchMenuError"));
    }
}
function handlePreview(row) {
    previewRoleId.value = String(row.id);
    previewRoleName.value = row.roleName;
    previewVisible.value = true;
}
onMounted(loadMenuTree);
// ── 刪除（API: deleteSpecificRole）──────────────────────────────
const { mutate: doDelete, isPending: isDeleting } = useMutation({
    mutationFn: (roleId) => AccountRole.deleteSpecificRole(roleId),
    onSuccess: () => {
        ElMessage.success($t("messages.deleteSuccess"));
        queryClient.invalidateQueries({ queryKey: ["roleList"] });
    },
});
async function handleDelete(row) {
    try {
        await ElMessageBox.confirm($t("roleManagement.delete.confirm", { name: row.roleName }), $t("dialog.deleteTitle"), {
            confirmButtonText: $t("dialog.confirmDelete"),
            cancelButtonText: $t("common.cancel"),
            type: "warning",
        });
        doDelete(String(row.id));
    }
    catch { }
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "tw-p-6" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "tw-mb-6" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({
    ...{ class: "tw-text-3xl tw-font-bold tw-text-slate-800" },
});
(__VLS_ctx.$t("roleManagement.title"));
/** @type {[typeof RoleFilterBar, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(RoleFilterBar, new RoleFilterBar({
    ...{ 'onUpdate:search': {} },
    ...{ 'onUpdate:status': {} },
    ...{ 'onSearch': {} },
    ...{ 'onReset': {} },
    ...{ 'onCreate': {} },
    search: (__VLS_ctx.filters.search ?? ''),
    status: (__VLS_ctx.filters.status),
}));
const __VLS_1 = __VLS_0({
    ...{ 'onUpdate:search': {} },
    ...{ 'onUpdate:status': {} },
    ...{ 'onSearch': {} },
    ...{ 'onReset': {} },
    ...{ 'onCreate': {} },
    search: (__VLS_ctx.filters.search ?? ''),
    status: (__VLS_ctx.filters.status),
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
let __VLS_3;
let __VLS_4;
let __VLS_5;
const __VLS_6 = {
    'onUpdate:search': (...[$event]) => {
        __VLS_ctx.filters.search = $event;
    }
};
const __VLS_7 = {
    'onUpdate:status': (...[$event]) => {
        __VLS_ctx.filters.status = $event;
    }
};
const __VLS_8 = {
    onSearch: (__VLS_ctx.handleSearch)
};
const __VLS_9 = {
    onReset: (__VLS_ctx.handleReset)
};
const __VLS_10 = {
    onCreate: (__VLS_ctx.handleCreate)
};
var __VLS_2;
/** @type {[typeof RoleTable, ]} */ ;
// @ts-ignore
const __VLS_11 = __VLS_asFunctionalComponent(RoleTable, new RoleTable({
    ...{ 'onUpdate:page': {} },
    ...{ 'onUpdate:pageSize': {} },
    ...{ 'onEdit': {} },
    ...{ 'onDelete': {} },
    ...{ 'onPreview': {} },
    data: (__VLS_ctx.roleList),
    total: (__VLS_ctx.total),
    loading: (__VLS_ctx.isLoading || __VLS_ctx.isDeleting),
    page: (__VLS_ctx.filters.page ?? 1),
    pageSize: (__VLS_ctx.filters.pageSize ?? 10),
}));
const __VLS_12 = __VLS_11({
    ...{ 'onUpdate:page': {} },
    ...{ 'onUpdate:pageSize': {} },
    ...{ 'onEdit': {} },
    ...{ 'onDelete': {} },
    ...{ 'onPreview': {} },
    data: (__VLS_ctx.roleList),
    total: (__VLS_ctx.total),
    loading: (__VLS_ctx.isLoading || __VLS_ctx.isDeleting),
    page: (__VLS_ctx.filters.page ?? 1),
    pageSize: (__VLS_ctx.filters.pageSize ?? 10),
}, ...__VLS_functionalComponentArgsRest(__VLS_11));
let __VLS_14;
let __VLS_15;
let __VLS_16;
const __VLS_17 = {
    'onUpdate:page': (...[$event]) => {
        __VLS_ctx.filters.page = $event;
    }
};
const __VLS_18 = {
    'onUpdate:pageSize': (__VLS_ctx.handlePageSizeChange)
};
const __VLS_19 = {
    onEdit: (__VLS_ctx.handleEdit)
};
const __VLS_20 = {
    onDelete: (__VLS_ctx.handleDelete)
};
const __VLS_21 = {
    onPreview: (__VLS_ctx.handlePreview)
};
var __VLS_13;
/** @type {[typeof RolePermissionPreviewDialog, ]} */ ;
// @ts-ignore
const __VLS_22 = __VLS_asFunctionalComponent(RolePermissionPreviewDialog, new RolePermissionPreviewDialog({
    modelValue: (__VLS_ctx.previewVisible),
    roleId: (__VLS_ctx.previewRoleId),
    roleName: (__VLS_ctx.previewRoleName),
    menuList: (__VLS_ctx.menuTree),
}));
const __VLS_23 = __VLS_22({
    modelValue: (__VLS_ctx.previewVisible),
    roleId: (__VLS_ctx.previewRoleId),
    roleName: (__VLS_ctx.previewRoleName),
    menuList: (__VLS_ctx.menuTree),
}, ...__VLS_functionalComponentArgsRest(__VLS_22));
/** @type {__VLS_StyleScopedClasses['tw-p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-mb-6']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-text-3xl']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-text-slate-800']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            RoleFilterBar: RoleFilterBar,
            RoleTable: RoleTable,
            RolePermissionPreviewDialog: RolePermissionPreviewDialog,
            $t: $t,
            filters: filters,
            handleSearch: handleSearch,
            handleReset: handleReset,
            handlePageSizeChange: handlePageSizeChange,
            isLoading: isLoading,
            roleList: roleList,
            total: total,
            handleCreate: handleCreate,
            handleEdit: handleEdit,
            menuTree: menuTree,
            previewVisible: previewVisible,
            previewRoleId: previewRoleId,
            previewRoleName: previewRoleName,
            handlePreview: handlePreview,
            isDeleting: isDeleting,
            handleDelete: handleDelete,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
