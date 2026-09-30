import { computed } from "vue";
import dayjs from "dayjs";
import { useI18n } from "@monorepo/composables";
import { HcTable } from "@monorepo/ui-kit";
const __VLS_props = defineProps();
const emit = defineEmits();
const { $t } = useI18n();
// ── Table columns ──────────────────────────────────────────────
const columns = computed(() => [
    {
        prop: "loginName",
        label: $t("accountManagement.loginLogs.columns.loginName"),
        minWidth: 120,
        align: "center",
    },
    {
        prop: "action",
        label: $t("accountManagement.loginLogs.columns.action"),
        width: 100,
        align: "center",
    },
    {
        prop: "createdAt",
        label: $t("accountManagement.loginLogs.columns.createdAt"),
        minWidth: 160,
        align: "center",
    },
    {
        prop: "provider",
        label: $t("accountManagement.loginLogs.columns.provider"),
        width: 100,
        align: "center",
    },
    {
        prop: "loginIp",
        label: $t("accountManagement.loginLogs.columns.loginIp"),
        minWidth: 130,
    },
    {
        prop: "deviceInfo",
        label: $t("accountManagement.loginLogs.columns.deviceInfo"),
        minWidth: 200,
    },
]);
function formatDateTime(val) {
    return val ? dayjs(val).format("YYYY-MM-DD HH:mm:ss") : "—";
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
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
}));
const __VLS_2 = __VLS_1({
    ...{ 'onUpdate:page': {} },
    ...{ 'onUpdate:pageSize': {} },
    data: (__VLS_ctx.data),
    columns: (__VLS_ctx.columns),
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
{
    const { createdAt: __VLS_thisSlot } = __VLS_3.slots;
    const [{ scope }] = __VLS_getSlotParams(__VLS_thisSlot);
    (__VLS_ctx.formatDateTime(scope.createdAt));
}
{
    const { action: __VLS_thisSlot } = __VLS_3.slots;
    const [{ scope }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_9 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({
        type: (scope.action === 'login' ? 'success' : 'info'),
        size: "small",
    }));
    const __VLS_11 = __VLS_10({
        type: (scope.action === 'login' ? 'success' : 'info'),
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_10));
    __VLS_12.slots.default;
    (__VLS_ctx.$t(`accountManagement.loginLogs.action.${scope.action}`));
    var __VLS_12;
}
{
    const { provider: __VLS_thisSlot } = __VLS_3.slots;
    const [{ scope }] = __VLS_getSlotParams(__VLS_thisSlot);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.$t(`accountManagement.loginLogs.provider.${scope.provider}`));
}
var __VLS_3;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            HcTable: HcTable,
            emit: emit,
            $t: $t,
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
