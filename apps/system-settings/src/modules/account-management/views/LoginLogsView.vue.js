import { ref, computed } from "vue";
import dayjs from "dayjs";
import { useCRUD, useI18n } from "@monorepo/composables";
import { logs } from "@/api/logs";
import LoginLogFilterBar from "../components/LoginLogFilterBar.vue";
import LoginLogTable from "../components/LoginLogTable.vue";
defineOptions({ name: "LoginLogsView" });
const { $t } = useI18n();
// ── 篩選條件（預設近 7 天）──────────────────────────────────────
function defaultDateRange() {
    return {
        startDate: dayjs().subtract(6, "day").format("YYYY-MM-DD"),
        endDate: dayjs().format("YYYY-MM-DD"),
    };
}
const filters = ref({
    page: 1,
    pageSize: 10,
    loginId: "",
    action: undefined,
    provider: undefined,
    ...defaultDateRange(),
});
// 日期範圍雙向繫結輔助
const dateRange = computed({
    get: () => filters.value.startDate && filters.value.endDate
        ? [filters.value.startDate, filters.value.endDate]
        : [],
    set: (val) => {
        filters.value.startDate = val?.[0] ?? undefined;
        filters.value.endDate = val?.[1] ?? undefined;
    },
});
// ── 工具列事件 ─────────────────────────────────────────────────
function handleSearch() {
    filters.value.page = 1;
}
function handleReset() {
    filters.value.loginId = "";
    filters.value.action = undefined;
    filters.value.provider = undefined;
    Object.assign(filters.value, defaultDateRange());
    filters.value.page = 1;
}
function handlePageSizeChange(v) {
    filters.value = { ...filters.value, pageSize: v, page: 1 };
}
// ── 登入登出日誌列表（唯讀，無 CRUD）─────────────────────────────
const { data, isLoading } = useCRUD({
    queryKey: "loginLogs",
    apiFns: { getList: (f) => logs.getLoginLogs(f) },
    filters,
});
const logList = computed(() => data.value?.data?.list ?? []);
const total = computed(() => data.value?.data?.pagination?.total ?? 0);
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
(__VLS_ctx.$t("accountManagement.loginLogs.title"));
/** @type {[typeof LoginLogFilterBar, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(LoginLogFilterBar, new LoginLogFilterBar({
    ...{ 'onUpdate:loginId': {} },
    ...{ 'onUpdate:action': {} },
    ...{ 'onUpdate:provider': {} },
    ...{ 'onUpdate:dateRange': {} },
    ...{ 'onSearch': {} },
    ...{ 'onReset': {} },
    loginId: (__VLS_ctx.filters.loginId ?? ''),
    action: (__VLS_ctx.filters.action),
    provider: (__VLS_ctx.filters.provider),
    dateRange: (__VLS_ctx.dateRange),
}));
const __VLS_1 = __VLS_0({
    ...{ 'onUpdate:loginId': {} },
    ...{ 'onUpdate:action': {} },
    ...{ 'onUpdate:provider': {} },
    ...{ 'onUpdate:dateRange': {} },
    ...{ 'onSearch': {} },
    ...{ 'onReset': {} },
    loginId: (__VLS_ctx.filters.loginId ?? ''),
    action: (__VLS_ctx.filters.action),
    provider: (__VLS_ctx.filters.provider),
    dateRange: (__VLS_ctx.dateRange),
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
let __VLS_3;
let __VLS_4;
let __VLS_5;
const __VLS_6 = {
    'onUpdate:loginId': (...[$event]) => {
        __VLS_ctx.filters.loginId = $event;
    }
};
const __VLS_7 = {
    'onUpdate:action': (...[$event]) => {
        __VLS_ctx.filters.action = $event;
    }
};
const __VLS_8 = {
    'onUpdate:provider': (...[$event]) => {
        __VLS_ctx.filters.provider = $event;
    }
};
const __VLS_9 = {
    'onUpdate:dateRange': (...[$event]) => {
        __VLS_ctx.dateRange = $event;
    }
};
const __VLS_10 = {
    onSearch: (__VLS_ctx.handleSearch)
};
const __VLS_11 = {
    onReset: (__VLS_ctx.handleReset)
};
var __VLS_2;
/** @type {[typeof LoginLogTable, ]} */ ;
// @ts-ignore
const __VLS_12 = __VLS_asFunctionalComponent(LoginLogTable, new LoginLogTable({
    ...{ 'onUpdate:page': {} },
    ...{ 'onUpdate:pageSize': {} },
    data: (__VLS_ctx.logList),
    total: (__VLS_ctx.total),
    loading: (__VLS_ctx.isLoading),
    page: (__VLS_ctx.filters.page ?? 1),
    pageSize: (__VLS_ctx.filters.pageSize ?? 10),
}));
const __VLS_13 = __VLS_12({
    ...{ 'onUpdate:page': {} },
    ...{ 'onUpdate:pageSize': {} },
    data: (__VLS_ctx.logList),
    total: (__VLS_ctx.total),
    loading: (__VLS_ctx.isLoading),
    page: (__VLS_ctx.filters.page ?? 1),
    pageSize: (__VLS_ctx.filters.pageSize ?? 10),
}, ...__VLS_functionalComponentArgsRest(__VLS_12));
let __VLS_15;
let __VLS_16;
let __VLS_17;
const __VLS_18 = {
    'onUpdate:page': (...[$event]) => {
        __VLS_ctx.filters.page = $event;
    }
};
const __VLS_19 = {
    'onUpdate:pageSize': (__VLS_ctx.handlePageSizeChange)
};
var __VLS_14;
/** @type {__VLS_StyleScopedClasses['tw-p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-mb-6']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-text-3xl']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-text-slate-800']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            LoginLogFilterBar: LoginLogFilterBar,
            LoginLogTable: LoginLogTable,
            $t: $t,
            filters: filters,
            dateRange: dateRange,
            handleSearch: handleSearch,
            handleReset: handleReset,
            handlePageSizeChange: handlePageSizeChange,
            isLoading: isLoading,
            logList: logList,
            total: total,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
