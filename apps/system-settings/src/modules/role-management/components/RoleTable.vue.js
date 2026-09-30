import { computed } from "vue";
import dayjs from "dayjs";
import { useI18n, usePermission } from "@monorepo/composables";
import { HcTable, HcButton } from "@monorepo/ui-kit";
const __VLS_props = defineProps();
const emit = defineEmits();
const { $t } = useI18n();
const { canPerformAction } = usePermission();
const columns = computed(() => [
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
function formatDateTime(val) {
    return val ? dayjs(val).format("YYYY-MM-DD HH:mm:ss") : "—";
}
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
        content: (__VLS_ctx.$t('roleManagement.permission.previewButton')),
        placement: "top",
    }));
    const __VLS_11 = __VLS_10({
        content: (__VLS_ctx.$t('roleManagement.permission.previewButton')),
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
            __VLS_ctx.emit('preview', scope);
        }
    };
    __VLS_16.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.i)({
        ...{ class: "fa-solid fa-shield-halved" },
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
    if (__VLS_ctx.canPerformAction('/role-management', 'update')) {
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
                if (!(__VLS_ctx.canPerformAction('/role-management', 'update')))
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
    if (__VLS_ctx.canPerformAction('/role-management', 'delete')) {
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
                if (!(__VLS_ctx.canPerformAction('/role-management', 'delete')))
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
    const { createdAt: __VLS_thisSlot } = __VLS_3.slots;
    const [{ scope }] = __VLS_getSlotParams(__VLS_thisSlot);
    (__VLS_ctx.formatDateTime(scope.createdAt));
}
{
    const { updatedAt: __VLS_thisSlot } = __VLS_3.slots;
    const [{ scope }] = __VLS_getSlotParams(__VLS_thisSlot);
    (__VLS_ctx.formatDateTime(scope.updatedAt));
}
{
    const { status: __VLS_thisSlot } = __VLS_3.slots;
    const [{ scope }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_45 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_46 = __VLS_asFunctionalComponent(__VLS_45, new __VLS_45({
        type: (scope.status === 1 ? 'success' : 'info'),
        size: "small",
    }));
    const __VLS_47 = __VLS_46({
        type: (scope.status === 1 ? 'success' : 'info'),
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_46));
    __VLS_48.slots.default;
    (scope.status === 1 ? __VLS_ctx.$t("common.enable") : __VLS_ctx.$t("common.disable"));
    var __VLS_48;
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
/** @type {__VLS_StyleScopedClasses['fa-shield-halved']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-solid']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-pen']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-solid']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-trash']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            HcTable: HcTable,
            HcButton: HcButton,
            emit: emit,
            $t: $t,
            canPerformAction: canPerformAction,
            columns: columns,
            formatDateTime: formatDateTime,
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
