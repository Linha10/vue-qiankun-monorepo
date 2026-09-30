import { ref, computed, watch } from "vue";
import { ElMessage } from "element-plus";
import { useQueryClient } from "@tanstack/vue-query";
import { useI18n, usePermission } from "@monorepo/composables";
import { accManagementApi } from "@/api/accountManagement";
import { HcTable, HcButton, HcSwitch } from "@monorepo/ui-kit";
import dayjs from "dayjs";
const props = defineProps();
const emit = defineEmits();
const { $t } = useI18n();
const queryClient = useQueryClient();
const { canPerformAction } = usePermission();
// ── 啟用狀態切換（樂觀更新）────────────────────────────────────
const loadingIds = ref(new Set());
const pendingStatusMap = ref({});
async function handleToggleStatus(row) {
    if (loadingIds.value.has(row.id))
        return;
    const newStatus = (row.status === 1 ? 0 : 1);
    pendingStatusMap.value[row.id] = newStatus;
    loadingIds.value.add(row.id);
    try {
        await accManagementApi.updateAcoount(row.id, {
            email: row.email,
            phone: row.phone,
            status: newStatus,
        });
        await queryClient.invalidateQueries({ queryKey: ["accountList"] });
    }
    catch {
        ElMessage.error($t("accountManagement.messages.statusUpdateFailed"));
    }
    finally {
        loadingIds.value.delete(row.id);
        delete pendingStatusMap.value[row.id];
    }
}
// ── 角色快速檢視（點擊時才 lazy fetch，並在元件內 cache，避免 N+1 呼叫）────
const accountRolesCache = ref({});
const loadingRoleIds = ref(new Set());
watch(() => props.rolesRefreshToken, () => {
    accountRolesCache.value = {};
});
const roleNameMap = computed(() => new Map(props.roleOptions.map((r) => [r.id, r.roleName])));
async function loadAccountRoles(row) {
    if (accountRolesCache.value[row.id] || loadingRoleIds.value.has(row.id))
        return;
    loadingRoleIds.value.add(row.id);
    try {
        const res = (await accManagementApi.getAccountRoles(row.id));
        accountRolesCache.value[row.id] = res.data?.roleIds ?? [];
    }
    catch {
        ElMessage.error($t("accountManagement.roles.fetchError"));
    }
    finally {
        loadingRoleIds.value.delete(row.id);
    }
}
function roleNamesFor(row) {
    const ids = accountRolesCache.value[row.id];
    if (!ids)
        return [];
    return ids
        .map((id) => roleNameMap.value.get(id))
        .filter((name) => !!name);
}
function formatDateTime(val) {
    return val ? dayjs(val).format("YYYY-MM-DD HH:mm:ss") : "—";
}
// ── Table columns ──────────────────────────────────────────────
const columns = computed(() => [
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
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "tw-bg-white tw-rounded-lg tw-p-4 tw-shadow-sm" },
});
const __VLS_0 = {}.HcTable;
/** @type {[typeof __VLS_components.HcTable, typeof __VLS_components.HcTable, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onUpdate:page': {} },
    ...{ 'onUpdate:pageSize': {} },
    data: (__VLS_ctx.data),
    columns: (__VLS_ctx.columns),
    total: (__VLS_ctx.total),
    page: (__VLS_ctx.page),
    pageSize: (__VLS_ctx.pageSize),
    rowKey: "id",
}));
const __VLS_2 = __VLS_1({
    ...{ 'onUpdate:page': {} },
    ...{ 'onUpdate:pageSize': {} },
    data: (__VLS_ctx.data),
    columns: (__VLS_ctx.columns),
    total: (__VLS_ctx.total),
    page: (__VLS_ctx.page),
    pageSize: (__VLS_ctx.pageSize),
    rowKey: "id",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    'onUpdate:page': (...[$event]) => {
        __VLS_ctx.emit('update:page', $event);
    }
};
const __VLS_8 = {
    'onUpdate:pageSize': (...[$event]) => {
        __VLS_ctx.emit('update:pageSize', $event);
    }
};
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
__VLS_3.slots.default;
{
    const { actions: __VLS_thisSlot } = __VLS_3.slots;
    const [{ scope }] = __VLS_getSlotParams(__VLS_thisSlot);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "tw-flex tw-gap-1 tw-justify-center" },
    });
    const __VLS_9 = {}.ElTooltip;
    /** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
    // @ts-ignore
    const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({
        content: (__VLS_ctx.$t('common.view')),
        placement: "top",
    }));
    const __VLS_11 = __VLS_10({
        content: (__VLS_ctx.$t('common.view')),
        placement: "top",
    }, ...__VLS_functionalComponentArgsRest(__VLS_10));
    __VLS_12.slots.default;
    const __VLS_13 = {}.HcButton;
    /** @type {[typeof __VLS_components.HcButton, typeof __VLS_components.HcButton, ]} */ ;
    // @ts-ignore
    const __VLS_14 = __VLS_asFunctionalComponent(__VLS_13, new __VLS_13({
        ...{ 'onClick': {} },
        text: true,
        type: "info",
        size: "small",
    }));
    const __VLS_15 = __VLS_14({
        ...{ 'onClick': {} },
        text: true,
        type: "info",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_14));
    let __VLS_17;
    let __VLS_18;
    let __VLS_19;
    const __VLS_20 = {
        onClick: (...[$event]) => {
            __VLS_ctx.emit('view', scope);
        }
    };
    __VLS_16.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.i)({
        ...{ class: "fa-solid fa-eye" },
    });
    var __VLS_16;
    var __VLS_12;
    const __VLS_21 = {}.ElTooltip;
    /** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
    // @ts-ignore
    const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({
        content: (__VLS_ctx.$t('common.edit')),
        placement: "top",
    }));
    const __VLS_23 = __VLS_22({
        content: (__VLS_ctx.$t('common.edit')),
        placement: "top",
    }, ...__VLS_functionalComponentArgsRest(__VLS_22));
    __VLS_24.slots.default;
    if (__VLS_ctx.canPerformAction('/account-management', 'update')) {
        const __VLS_25 = {}.HcButton;
        /** @type {[typeof __VLS_components.HcButton, typeof __VLS_components.HcButton, ]} */ ;
        // @ts-ignore
        const __VLS_26 = __VLS_asFunctionalComponent(__VLS_25, new __VLS_25({
            ...{ 'onClick': {} },
            text: true,
            type: "primary",
            size: "small",
        }));
        const __VLS_27 = __VLS_26({
            ...{ 'onClick': {} },
            text: true,
            type: "primary",
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_26));
        let __VLS_29;
        let __VLS_30;
        let __VLS_31;
        const __VLS_32 = {
            onClick: (...[$event]) => {
                if (!(__VLS_ctx.canPerformAction('/account-management', 'update')))
                    return;
                __VLS_ctx.emit('edit', scope);
            }
        };
        __VLS_28.slots.default;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.i)({
            ...{ class: "fa-solid fa-pen" },
        });
        var __VLS_28;
    }
    var __VLS_24;
    const __VLS_33 = {}.ElTooltip;
    /** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
    // @ts-ignore
    const __VLS_34 = __VLS_asFunctionalComponent(__VLS_33, new __VLS_33({
        content: (__VLS_ctx.$t('common.delete')),
        placement: "top",
    }));
    const __VLS_35 = __VLS_34({
        content: (__VLS_ctx.$t('common.delete')),
        placement: "top",
    }, ...__VLS_functionalComponentArgsRest(__VLS_34));
    __VLS_36.slots.default;
    if (__VLS_ctx.canPerformAction('/account-management', 'delete')) {
        const __VLS_37 = {}.HcButton;
        /** @type {[typeof __VLS_components.HcButton, typeof __VLS_components.HcButton, ]} */ ;
        // @ts-ignore
        const __VLS_38 = __VLS_asFunctionalComponent(__VLS_37, new __VLS_37({
            ...{ 'onClick': {} },
            text: true,
            type: "danger",
            size: "small",
        }));
        const __VLS_39 = __VLS_38({
            ...{ 'onClick': {} },
            text: true,
            type: "danger",
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_38));
        let __VLS_41;
        let __VLS_42;
        let __VLS_43;
        const __VLS_44 = {
            onClick: (...[$event]) => {
                if (!(__VLS_ctx.canPerformAction('/account-management', 'delete')))
                    return;
                __VLS_ctx.emit('delete', scope);
            }
        };
        __VLS_40.slots.default;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.i)({
            ...{ class: "fa-solid fa-trash" },
        });
        var __VLS_40;
    }
    var __VLS_36;
}
{
    const { loginAt: __VLS_thisSlot } = __VLS_3.slots;
    const [{ scope }] = __VLS_getSlotParams(__VLS_thisSlot);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (scope.loginAt ? __VLS_ctx.formatDateTime(scope.loginAt) : "—");
}
{
    const { loginIp: __VLS_thisSlot } = __VLS_3.slots;
    const [{ scope }] = __VLS_getSlotParams(__VLS_thisSlot);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (scope.loginIp ?? "—");
}
{
    const { roles: __VLS_thisSlot } = __VLS_3.slots;
    const [{ scope }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_45 = {}.ElPopover;
    /** @type {[typeof __VLS_components.ElPopover, typeof __VLS_components.elPopover, typeof __VLS_components.ElPopover, typeof __VLS_components.elPopover, ]} */ ;
    // @ts-ignore
    const __VLS_46 = __VLS_asFunctionalComponent(__VLS_45, new __VLS_45({
        ...{ 'onShow': {} },
        placement: "top",
        width: "240",
        trigger: "click",
    }));
    const __VLS_47 = __VLS_46({
        ...{ 'onShow': {} },
        placement: "top",
        width: "240",
        trigger: "click",
    }, ...__VLS_functionalComponentArgsRest(__VLS_46));
    let __VLS_49;
    let __VLS_50;
    let __VLS_51;
    const __VLS_52 = {
        onShow: (...[$event]) => {
            __VLS_ctx.loadAccountRoles(scope);
        }
    };
    __VLS_48.slots.default;
    {
        const { reference: __VLS_thisSlot } = __VLS_48.slots;
        const __VLS_53 = {}.HcButton;
        /** @type {[typeof __VLS_components.HcButton, typeof __VLS_components.HcButton, ]} */ ;
        // @ts-ignore
        const __VLS_54 = __VLS_asFunctionalComponent(__VLS_53, new __VLS_53({
            text: true,
            type: "primary",
            size: "small",
        }));
        const __VLS_55 = __VLS_54({
            text: true,
            type: "primary",
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_54));
        __VLS_56.slots.default;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.i)({
            ...{ class: "fa-solid fa-user-shield tw-mr-1" },
        });
        (__VLS_ctx.$t("accountManagement.roles.viewButton"));
        var __VLS_56;
    }
    if (__VLS_ctx.loadingRoleIds.has(scope.id)) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "tw-text-center tw-text-slate-400 tw-py-2" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.i)({
            ...{ class: "fa-solid fa-spinner fa-spin" },
        });
    }
    else if (__VLS_ctx.roleNamesFor(scope).length) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "tw-flex tw-flex-wrap tw-gap-1" },
        });
        for (const [name] of __VLS_getVForSourceType((__VLS_ctx.roleNamesFor(scope)))) {
            const __VLS_57 = {}.ElTag;
            /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
            // @ts-ignore
            const __VLS_58 = __VLS_asFunctionalComponent(__VLS_57, new __VLS_57({
                key: (name),
                size: "small",
            }));
            const __VLS_59 = __VLS_58({
                key: (name),
                size: "small",
            }, ...__VLS_functionalComponentArgsRest(__VLS_58));
            __VLS_60.slots.default;
            (name);
            var __VLS_60;
        }
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "tw-text-slate-400 tw-text-sm" },
        });
        (__VLS_ctx.$t("accountManagement.roles.empty"));
    }
    var __VLS_48;
}
{
    const { status: __VLS_thisSlot } = __VLS_3.slots;
    const [{ scope }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_61 = {}.HcSwitch;
    /** @type {[typeof __VLS_components.HcSwitch, ]} */ ;
    // @ts-ignore
    const __VLS_62 = __VLS_asFunctionalComponent(__VLS_61, new __VLS_61({
        ...{ 'onChange': {} },
        modelValue: ((__VLS_ctx.pendingStatusMap[scope.id] ?? scope.status) === 1),
        loading: (__VLS_ctx.loadingIds.has(scope.id)),
        disabled: (__VLS_ctx.loadingIds.has(scope.id)),
    }));
    const __VLS_63 = __VLS_62({
        ...{ 'onChange': {} },
        modelValue: ((__VLS_ctx.pendingStatusMap[scope.id] ?? scope.status) === 1),
        loading: (__VLS_ctx.loadingIds.has(scope.id)),
        disabled: (__VLS_ctx.loadingIds.has(scope.id)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_62));
    let __VLS_65;
    let __VLS_66;
    let __VLS_67;
    const __VLS_68 = {
        onChange: (...[$event]) => {
            __VLS_ctx.handleToggleStatus(scope);
        }
    };
    var __VLS_64;
}
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['tw-bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-shadow-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-gap-1']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-solid']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-eye']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-solid']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-pen']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-solid']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-trash']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-solid']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-user-shield']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-mr-1']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-text-slate-400']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-solid']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-spinner']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-spin']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-flex-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-gap-1']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-text-slate-400']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-text-sm']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            HcTable: HcTable,
            HcButton: HcButton,
            HcSwitch: HcSwitch,
            emit: emit,
            $t: $t,
            canPerformAction: canPerformAction,
            loadingIds: loadingIds,
            pendingStatusMap: pendingStatusMap,
            handleToggleStatus: handleToggleStatus,
            loadingRoleIds: loadingRoleIds,
            loadAccountRoles: loadAccountRoles,
            roleNamesFor: roleNamesFor,
            formatDateTime: formatDateTime,
            columns: columns,
        };
    },
    __typeEmits: {},
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEmits: {},
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
