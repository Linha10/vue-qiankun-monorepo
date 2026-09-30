import { ref, watch } from "vue";
import { useI18n } from "@monorepo/composables";
import { HcButton, HcInput, HcSelect, HcDatePicker } from "@monorepo/ui-kit";
const props = defineProps();
const emit = defineEmits();
const { $t } = useI18n();
// ── 帳號ID模糊搜尋 debounce ──────────────────────────────────
const localLoginId = ref(props.loginId);
let debounceTimer = null;
watch(() => props.loginId, (val) => {
    if (val !== localLoginId.value)
        localLoginId.value = val;
});
function onLoginIdInput(val) {
    localLoginId.value = val;
    if (debounceTimer)
        clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        emit("update:loginId", val);
        emit("search");
    }, 400);
}
function onActionChange(val) {
    emit("update:action", val);
    emit("search");
}
function onProviderChange(val) {
    emit("update:provider", val);
    emit("search");
}
function onDateRangeChange(val) {
    emit("update:dateRange", val ?? []);
    emit("search");
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "tw-mb-4 tw-flex tw-flex-wrap tw-items-end tw-gap-4 tw-bg-white tw-rounded-lg tw-p-4 tw-shadow-sm" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "tw-flex tw-flex-col tw-gap-1" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "tw-text-xs tw-text-slate-500" },
});
(__VLS_ctx.$t("accountManagement.loginLogs.filter.loginIdPlaceholder"));
const __VLS_0 = {}.HcInput;
/** @type {[typeof __VLS_components.HcInput, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onUpdate:modelValue': {} },
    modelValue: (__VLS_ctx.localLoginId),
    placeholder: (__VLS_ctx.$t('accountManagement.loginLogs.filter.loginIdPlaceholder')),
    clearable: true,
    ...{ style: {} },
}));
const __VLS_2 = __VLS_1({
    ...{ 'onUpdate:modelValue': {} },
    modelValue: (__VLS_ctx.localLoginId),
    placeholder: (__VLS_ctx.$t('accountManagement.loginLogs.filter.loginIdPlaceholder')),
    clearable: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    'onUpdate:modelValue': (__VLS_ctx.onLoginIdInput)
};
var __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "tw-flex tw-flex-col tw-gap-1" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "tw-text-xs tw-text-slate-500" },
});
(__VLS_ctx.$t("accountManagement.loginLogs.filter.action"));
const __VLS_8 = {}.HcSelect;
/** @type {[typeof __VLS_components.HcSelect, typeof __VLS_components.HcSelect, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    ...{ 'onUpdate:modelValue': {} },
    modelValue: (__VLS_ctx.action),
    placeholder: (__VLS_ctx.$t('accountManagement.loginLogs.filter.all')),
    clearable: true,
    ...{ style: {} },
}));
const __VLS_10 = __VLS_9({
    ...{ 'onUpdate:modelValue': {} },
    modelValue: (__VLS_ctx.action),
    placeholder: (__VLS_ctx.$t('accountManagement.loginLogs.filter.all')),
    clearable: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
let __VLS_12;
let __VLS_13;
let __VLS_14;
const __VLS_15 = {
    'onUpdate:modelValue': (__VLS_ctx.onActionChange)
};
__VLS_11.slots.default;
const __VLS_16 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    label: (__VLS_ctx.$t('accountManagement.loginLogs.action.login')),
    value: "login",
}));
const __VLS_18 = __VLS_17({
    label: (__VLS_ctx.$t('accountManagement.loginLogs.action.login')),
    value: "login",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
const __VLS_20 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    label: (__VLS_ctx.$t('accountManagement.loginLogs.action.logout')),
    value: "logout",
}));
const __VLS_22 = __VLS_21({
    label: (__VLS_ctx.$t('accountManagement.loginLogs.action.logout')),
    value: "logout",
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
var __VLS_11;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "tw-flex tw-flex-col tw-gap-1" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "tw-text-xs tw-text-slate-500" },
});
(__VLS_ctx.$t("accountManagement.loginLogs.filter.provider"));
const __VLS_24 = {}.HcSelect;
/** @type {[typeof __VLS_components.HcSelect, typeof __VLS_components.HcSelect, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    ...{ 'onUpdate:modelValue': {} },
    modelValue: (__VLS_ctx.provider),
    placeholder: (__VLS_ctx.$t('accountManagement.loginLogs.filter.all')),
    clearable: true,
    ...{ style: {} },
}));
const __VLS_26 = __VLS_25({
    ...{ 'onUpdate:modelValue': {} },
    modelValue: (__VLS_ctx.provider),
    placeholder: (__VLS_ctx.$t('accountManagement.loginLogs.filter.all')),
    clearable: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
let __VLS_28;
let __VLS_29;
let __VLS_30;
const __VLS_31 = {
    'onUpdate:modelValue': (__VLS_ctx.onProviderChange)
};
__VLS_27.slots.default;
const __VLS_32 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    label: (__VLS_ctx.$t('accountManagement.loginLogs.provider.backend')),
    value: "backend",
}));
const __VLS_34 = __VLS_33({
    label: (__VLS_ctx.$t('accountManagement.loginLogs.provider.backend')),
    value: "backend",
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
const __VLS_36 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    label: (__VLS_ctx.$t('accountManagement.loginLogs.provider.system')),
    value: "system",
}));
const __VLS_38 = __VLS_37({
    label: (__VLS_ctx.$t('accountManagement.loginLogs.provider.system')),
    value: "system",
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
var __VLS_27;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "tw-flex tw-flex-col tw-gap-1" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "tw-text-xs tw-text-slate-500" },
});
(__VLS_ctx.$t("accountManagement.loginLogs.filter.dateRange"));
const __VLS_40 = {}.HcDatePicker;
/** @type {[typeof __VLS_components.HcDatePicker, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    ...{ 'onUpdate:modelValue': {} },
    modelValue: (__VLS_ctx.dateRange),
    type: "daterange",
    valueFormat: "YYYY-MM-DD",
    rangeSeparator: "—",
    ...{ style: {} },
}));
const __VLS_42 = __VLS_41({
    ...{ 'onUpdate:modelValue': {} },
    modelValue: (__VLS_ctx.dateRange),
    type: "daterange",
    valueFormat: "YYYY-MM-DD",
    rangeSeparator: "—",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
let __VLS_44;
let __VLS_45;
let __VLS_46;
const __VLS_47 = {
    'onUpdate:modelValue': (__VLS_ctx.onDateRangeChange)
};
var __VLS_43;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "tw-flex tw-gap-2 tw-ml-auto" },
});
const __VLS_48 = {}.HcButton;
/** @type {[typeof __VLS_components.HcButton, typeof __VLS_components.HcButton, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    ...{ 'onClick': {} },
    plain: true,
}));
const __VLS_50 = __VLS_49({
    ...{ 'onClick': {} },
    plain: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
let __VLS_52;
let __VLS_53;
let __VLS_54;
const __VLS_55 = {
    onClick: (...[$event]) => {
        __VLS_ctx.emit('reset');
    }
};
__VLS_51.slots.default;
(__VLS_ctx.$t("accountManagement.loginLogs.filter.reset"));
var __VLS_51;
/** @type {__VLS_StyleScopedClasses['tw-mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-flex-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-items-end']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-gap-4']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-shadow-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-gap-1']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-text-slate-500']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-gap-1']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-text-slate-500']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-gap-1']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-text-slate-500']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-gap-1']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-text-slate-500']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-ml-auto']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            HcButton: HcButton,
            HcInput: HcInput,
            HcSelect: HcSelect,
            HcDatePicker: HcDatePicker,
            emit: emit,
            $t: $t,
            localLoginId: localLoginId,
            onLoginIdInput: onLoginIdInput,
            onActionChange: onActionChange,
            onProviderChange: onProviderChange,
            onDateRangeChange: onDateRangeChange,
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
