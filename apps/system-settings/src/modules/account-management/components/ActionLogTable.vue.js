import dayjs from "dayjs";
import { useI18n } from "@monorepo/composables";
import { HcTable } from "@monorepo/ui-kit";
const __VLS_props = defineProps();
const emit = defineEmits();
const { $t } = useI18n();
const METHOD_TAG = {
    GET: "primary",
    POST: "success",
    PUT: "warning",
    DELETE: "danger",
};
function formatDateTime(val) {
    return val ? dayjs(val).format("YYYY-MM-DD HH:mm:ss") : "—";
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
const __VLS_0 = {}.HcTable;
/** @type {[typeof __VLS_components.HcTable, typeof __VLS_components.HcTable, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onUpdate:page': {} },
    ...{ 'onUpdate:pageSize': {} },
    data: (__VLS_ctx.data),
    total: (__VLS_ctx.total),
    page: (__VLS_ctx.page),
    pageSize: (__VLS_ctx.pageSize),
}));
const __VLS_2 = __VLS_1({
    ...{ 'onUpdate:page': {} },
    ...{ 'onUpdate:pageSize': {} },
    data: (__VLS_ctx.data),
    total: (__VLS_ctx.total),
    page: (__VLS_ctx.page),
    pageSize: (__VLS_ctx.pageSize),
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
__VLS_3.slots.default;
const __VLS_9 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({
    type: "expand",
}));
const __VLS_11 = __VLS_10({
    type: "expand",
}, ...__VLS_functionalComponentArgsRest(__VLS_10));
__VLS_12.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_12.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "action-log-detail tw-p-4 tw-bg-slate-50 tw-rounded tw-grid tw-grid-cols-2 tw-gap-x-8 tw-gap-y-2" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "tw-text-xs tw-text-slate-500" },
    });
    (__VLS_ctx.$t("accountManagement.actionLogs.detail.action"));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "tw-text-sm" },
    });
    (row.requestLog?.action?.name ?? "—");
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "tw-text-xs tw-text-slate-500" },
    });
    (__VLS_ctx.$t("accountManagement.actionLogs.detail.latency"));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "tw-text-sm" },
    });
    (row.requestLog?.latency ?? "—");
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "tw-text-xs tw-text-slate-500" },
    });
    (__VLS_ctx.$t("accountManagement.actionLogs.detail.referer"));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "tw-text-sm tw-break-all" },
    });
    (row.requestLog?.referer || "—");
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "tw-text-xs tw-text-slate-500" },
    });
    (__VLS_ctx.$t("accountManagement.actionLogs.detail.userAgent"));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "tw-text-sm tw-break-all" },
    });
    (row.requestLog?.user_agent || "—");
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "tw-text-xs tw-text-slate-500" },
    });
    (__VLS_ctx.$t("accountManagement.actionLogs.detail.responseCode"));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "tw-text-sm" },
    });
    (row.requestLog?.response_code ?? "—");
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "tw-text-xs tw-text-slate-500" },
    });
    (__VLS_ctx.$t("accountManagement.actionLogs.detail.responseMsg"));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "tw-text-sm tw-break-all" },
    });
    (row.requestLog?.response_msg || "—");
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "tw-col-span-2" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "tw-text-xs tw-text-slate-500" },
    });
    (__VLS_ctx.$t("accountManagement.actionLogs.detail.requestBody"));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.pre, __VLS_intrinsicElements.pre)({
        ...{ class: "action-log-detail__code" },
    });
    (row.requestLog?.request_body || "—");
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "tw-col-span-2" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "tw-text-xs tw-text-slate-500" },
    });
    (__VLS_ctx.$t("accountManagement.actionLogs.detail.responseBody"));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.pre, __VLS_intrinsicElements.pre)({
        ...{ class: "action-log-detail__code" },
    });
    (row.requestLog?.response_body || "—");
}
var __VLS_12;
const __VLS_13 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_14 = __VLS_asFunctionalComponent(__VLS_13, new __VLS_13({
    prop: "createdAt",
    label: (__VLS_ctx.$t('accountManagement.actionLogs.columns.createdAt')),
    minWidth: "160",
}));
const __VLS_15 = __VLS_14({
    prop: "createdAt",
    label: (__VLS_ctx.$t('accountManagement.actionLogs.columns.createdAt')),
    minWidth: "160",
}, ...__VLS_functionalComponentArgsRest(__VLS_14));
__VLS_16.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_16.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    (__VLS_ctx.formatDateTime(row.createdAt));
}
var __VLS_16;
const __VLS_17 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_18 = __VLS_asFunctionalComponent(__VLS_17, new __VLS_17({
    prop: "accountName",
    label: (__VLS_ctx.$t('accountManagement.actionLogs.columns.accountName')),
    minWidth: "120",
}));
const __VLS_19 = __VLS_18({
    prop: "accountName",
    label: (__VLS_ctx.$t('accountManagement.actionLogs.columns.accountName')),
    minWidth: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_18));
const __VLS_21 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({
    prop: "requestMethod",
    label: (__VLS_ctx.$t('accountManagement.actionLogs.columns.requestMethod')),
    width: "100",
    align: "center",
}));
const __VLS_23 = __VLS_22({
    prop: "requestMethod",
    label: (__VLS_ctx.$t('accountManagement.actionLogs.columns.requestMethod')),
    width: "100",
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_22));
__VLS_24.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_24.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_25 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_26 = __VLS_asFunctionalComponent(__VLS_25, new __VLS_25({
        type: (__VLS_ctx.METHOD_TAG[row.requestMethod] ?? 'info'),
        size: "small",
    }));
    const __VLS_27 = __VLS_26({
        type: (__VLS_ctx.METHOD_TAG[row.requestMethod] ?? 'info'),
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_26));
    __VLS_28.slots.default;
    (row.requestMethod);
    var __VLS_28;
}
var __VLS_24;
const __VLS_29 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_30 = __VLS_asFunctionalComponent(__VLS_29, new __VLS_29({
    prop: "requestUrl",
    label: (__VLS_ctx.$t('accountManagement.actionLogs.columns.requestUrl')),
    minWidth: "220",
    showOverflowTooltip: true,
}));
const __VLS_31 = __VLS_30({
    prop: "requestUrl",
    label: (__VLS_ctx.$t('accountManagement.actionLogs.columns.requestUrl')),
    minWidth: "220",
    showOverflowTooltip: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_30));
const __VLS_33 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_34 = __VLS_asFunctionalComponent(__VLS_33, new __VLS_33({
    prop: "requestIp",
    label: (__VLS_ctx.$t('accountManagement.actionLogs.columns.requestIp')),
    minWidth: "130",
}));
const __VLS_35 = __VLS_34({
    prop: "requestIp",
    label: (__VLS_ctx.$t('accountManagement.actionLogs.columns.requestIp')),
    minWidth: "130",
}, ...__VLS_functionalComponentArgsRest(__VLS_34));
const __VLS_37 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_38 = __VLS_asFunctionalComponent(__VLS_37, new __VLS_37({
    prop: "errorCode",
    label: (__VLS_ctx.$t('accountManagement.actionLogs.columns.errorCode')),
    width: "110",
    align: "center",
}));
const __VLS_39 = __VLS_38({
    prop: "errorCode",
    label: (__VLS_ctx.$t('accountManagement.actionLogs.columns.errorCode')),
    width: "110",
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_38));
__VLS_40.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_40.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_41 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_42 = __VLS_asFunctionalComponent(__VLS_41, new __VLS_41({
        type: (row.errorCode === 0 ? 'success' : 'danger'),
        size: "small",
    }));
    const __VLS_43 = __VLS_42({
        type: (row.errorCode === 0 ? 'success' : 'danger'),
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_42));
    __VLS_44.slots.default;
    (row.errorCode);
    var __VLS_44;
}
var __VLS_40;
const __VLS_45 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_46 = __VLS_asFunctionalComponent(__VLS_45, new __VLS_45({
    prop: "costTimeMs",
    label: (__VLS_ctx.$t('accountManagement.actionLogs.columns.costTimeMs')),
    width: "100",
    align: "center",
}));
const __VLS_47 = __VLS_46({
    prop: "costTimeMs",
    label: (__VLS_ctx.$t('accountManagement.actionLogs.columns.costTimeMs')),
    width: "100",
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_46));
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['action-log-detail']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-bg-slate-50']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-grid-cols-2']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-gap-x-8']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-gap-y-2']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-text-slate-500']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-text-slate-500']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-text-slate-500']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-break-all']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-text-slate-500']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-break-all']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-text-slate-500']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-text-slate-500']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-break-all']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-col-span-2']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-text-slate-500']} */ ;
/** @type {__VLS_StyleScopedClasses['action-log-detail__code']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-col-span-2']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-text-slate-500']} */ ;
/** @type {__VLS_StyleScopedClasses['action-log-detail__code']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            HcTable: HcTable,
            emit: emit,
            $t: $t,
            METHOD_TAG: METHOD_TAG,
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
