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
defineOptions({ name: "AccountManagement" });
const { $t } = useI18n();
const queryClient = useQueryClient();
// ── 角色清單（供 Table 快速檢視與 Dialog 多選共用，只需載入一次）──────────────
const roleOptions = ref([]);
async function loadRoleOptions() {
    try {
        const res = await AccountRole.getRoleList({
            page: 1,
            pageSize: 100,
            status: 1,
        });
        roleOptions.value = res?.data?.list ?? [];
    }
    catch {
        ElMessage.error($t("accountManagement.roles.fetchError"));
    }
}
onMounted(loadRoleOptions);
// ── 篩選條件 ──────────────────────────────────────────────────
const filters = ref({
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
function handlePageSizeChange(v) {
    filters.value = { ...filters.value, pageSize: v, page: 1 };
}
// ── 帳號列表（API: getAccountList）─────────────────────────────
const { data, isLoading } = useCRUD({
    queryKey: "accountList",
    apiFns: {
        getList: (f) => accManagementApi.getAccountList(f),
    },
    filters,
});
const accountList = computed(() => data.value?.data?.list ?? []);
const total = computed(() => data.value?.data?.pagination?.total ?? 0);
// ── 建立 / 檢視 / 編輯 ───────────────────────────────────────────
const formDialogVisible = ref(false);
const dialogMode = ref("create");
const activeAccountId = ref(null);
const rolesRefreshToken = ref(0);
function handleCreate() {
    dialogMode.value = "create";
    activeAccountId.value = null;
    formDialogVisible.value = true;
}
function handleView(row) {
    dialogMode.value = "view";
    activeAccountId.value = row.id;
    formDialogVisible.value = true;
}
function handleEdit(row) {
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
    mutationFn: (id) => accManagementApi.deleteAccount(id),
    onSuccess: () => {
        ElMessage.success($t("messages.deleteSuccess"));
        queryClient.invalidateQueries({ queryKey: ["accountList"] });
    },
});
async function handleDelete(row) {
    try {
        await HcMessageBox.confirm($t("accountManagement.delete.confirm", { name: row.accountName }), $t("dialog.deleteTitle"), {
            confirmButtonText: $t("dialog.confirmDelete"),
            cancelButtonText: $t("common.cancel"),
            type: "warning",
        });
        doDelete(row.id);
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
(__VLS_ctx.$t("accountManagement.title"));
/** @type {[typeof AccountFilterBar, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(AccountFilterBar, new AccountFilterBar({
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
/** @type {[typeof AccountTable, ]} */ ;
// @ts-ignore
const __VLS_11 = __VLS_asFunctionalComponent(AccountTable, new AccountTable({
    ...{ 'onUpdate:page': {} },
    ...{ 'onUpdate:pageSize': {} },
    ...{ 'onView': {} },
    ...{ 'onEdit': {} },
    ...{ 'onDelete': {} },
    data: (__VLS_ctx.accountList),
    total: (__VLS_ctx.total),
    loading: (__VLS_ctx.isLoading || __VLS_ctx.isDeleting),
    page: (__VLS_ctx.filters.page ?? 1),
    pageSize: (__VLS_ctx.filters.pageSize ?? 10),
    roleOptions: (__VLS_ctx.roleOptions),
    rolesRefreshToken: (__VLS_ctx.rolesRefreshToken),
}));
const __VLS_12 = __VLS_11({
    ...{ 'onUpdate:page': {} },
    ...{ 'onUpdate:pageSize': {} },
    ...{ 'onView': {} },
    ...{ 'onEdit': {} },
    ...{ 'onDelete': {} },
    data: (__VLS_ctx.accountList),
    total: (__VLS_ctx.total),
    loading: (__VLS_ctx.isLoading || __VLS_ctx.isDeleting),
    page: (__VLS_ctx.filters.page ?? 1),
    pageSize: (__VLS_ctx.filters.pageSize ?? 10),
    roleOptions: (__VLS_ctx.roleOptions),
    rolesRefreshToken: (__VLS_ctx.rolesRefreshToken),
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
    onView: (__VLS_ctx.handleView)
};
const __VLS_20 = {
    onEdit: (__VLS_ctx.handleEdit)
};
const __VLS_21 = {
    onDelete: (__VLS_ctx.handleDelete)
};
var __VLS_13;
/** @type {[typeof AccountFormDialog, ]} */ ;
// @ts-ignore
const __VLS_22 = __VLS_asFunctionalComponent(AccountFormDialog, new AccountFormDialog({
    ...{ 'onSuccess': {} },
    modelValue: (__VLS_ctx.formDialogVisible),
    mode: (__VLS_ctx.dialogMode),
    accountId: (__VLS_ctx.activeAccountId),
    roleOptions: (__VLS_ctx.roleOptions),
}));
const __VLS_23 = __VLS_22({
    ...{ 'onSuccess': {} },
    modelValue: (__VLS_ctx.formDialogVisible),
    mode: (__VLS_ctx.dialogMode),
    accountId: (__VLS_ctx.activeAccountId),
    roleOptions: (__VLS_ctx.roleOptions),
}, ...__VLS_functionalComponentArgsRest(__VLS_22));
let __VLS_25;
let __VLS_26;
let __VLS_27;
const __VLS_28 = {
    onSuccess: (__VLS_ctx.handleFormSuccess)
};
var __VLS_24;
/** @type {__VLS_StyleScopedClasses['tw-p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-mb-6']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-text-3xl']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-text-slate-800']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            AccountFilterBar: AccountFilterBar,
            AccountTable: AccountTable,
            AccountFormDialog: AccountFormDialog,
            $t: $t,
            roleOptions: roleOptions,
            filters: filters,
            handleSearch: handleSearch,
            handleReset: handleReset,
            handlePageSizeChange: handlePageSizeChange,
            isLoading: isLoading,
            accountList: accountList,
            total: total,
            formDialogVisible: formDialogVisible,
            dialogMode: dialogMode,
            activeAccountId: activeAccountId,
            rolesRefreshToken: rolesRefreshToken,
            handleCreate: handleCreate,
            handleView: handleView,
            handleEdit: handleEdit,
            handleFormSuccess: handleFormSuccess,
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
