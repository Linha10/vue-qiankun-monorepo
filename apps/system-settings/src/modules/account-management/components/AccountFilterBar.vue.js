import { ref, watch } from "vue";
import { useI18n, usePermission } from "@monorepo/composables";
import { HcButton, HcInput, HcSelect } from "@monorepo/ui-kit";
const props = defineProps();
const emit = defineEmits();
const { $t } = useI18n();
const { canPerformAction } = usePermission();
// ── Search debounce ────────────────────────────────────────────
const localSearch = ref(props.search);
let debounceTimer = null;
watch(() => props.search, (val) => {
    if (val !== localSearch.value)
        localSearch.value = val;
});
function onSearchInput(val) {
    localSearch.value = val;
    if (debounceTimer)
        clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        emit("update:search", val);
        emit("search");
    }, 400);
}
function onStatusChange(val) {
    emit("update:status", val);
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
(__VLS_ctx.$t("accountManagement.filter.status"));
const __VLS_0 = {}.HcSelect;
/** @type {[typeof __VLS_components.HcSelect, typeof __VLS_components.HcSelect, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onUpdate:modelValue': {} },
    modelValue: (__VLS_ctx.status),
    placeholder: (__VLS_ctx.$t('accountManagement.filter.all')),
    clearable: true,
    ...{ style: {} },
}));
const __VLS_2 = __VLS_1({
    ...{ 'onUpdate:modelValue': {} },
    modelValue: (__VLS_ctx.status),
    placeholder: (__VLS_ctx.$t('accountManagement.filter.all')),
    clearable: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    'onUpdate:modelValue': (__VLS_ctx.onStatusChange)
};
__VLS_3.slots.default;
const __VLS_8 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    label: (__VLS_ctx.$t('accountManagement.filter.active')),
    value: (1),
}));
const __VLS_10 = __VLS_9({
    label: (__VLS_ctx.$t('accountManagement.filter.active')),
    value: (1),
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
const __VLS_12 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    label: (__VLS_ctx.$t('accountManagement.filter.inactive')),
    value: (0),
}));
const __VLS_14 = __VLS_13({
    label: (__VLS_ctx.$t('accountManagement.filter.inactive')),
    value: (0),
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
var __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "tw-flex tw-flex-col tw-gap-1" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "tw-text-xs tw-text-slate-500" },
});
(__VLS_ctx.$t("common.search"));
const __VLS_16 = {}.HcInput;
/** @type {[typeof __VLS_components.HcInput, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    ...{ 'onUpdate:modelValue': {} },
    ...{ 'onClear': {} },
    modelValue: (__VLS_ctx.localSearch),
    placeholder: (__VLS_ctx.$t('accountManagement.filter.searchPlaceholder')),
    clearable: true,
    ...{ style: {} },
}));
const __VLS_18 = __VLS_17({
    ...{ 'onUpdate:modelValue': {} },
    ...{ 'onClear': {} },
    modelValue: (__VLS_ctx.localSearch),
    placeholder: (__VLS_ctx.$t('accountManagement.filter.searchPlaceholder')),
    clearable: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
let __VLS_20;
let __VLS_21;
let __VLS_22;
const __VLS_23 = {
    'onUpdate:modelValue': (...[$event]) => {
        __VLS_ctx.onSearchInput($event);
    }
};
const __VLS_24 = {
    onClear: (...[$event]) => {
        __VLS_ctx.onSearchInput('');
    }
};
var __VLS_19;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "tw-flex tw-gap-2 tw-ml-auto" },
});
const __VLS_25 = {}.HcButton;
/** @type {[typeof __VLS_components.HcButton, typeof __VLS_components.HcButton, ]} */ ;
// @ts-ignore
const __VLS_26 = __VLS_asFunctionalComponent(__VLS_25, new __VLS_25({
    ...{ 'onClick': {} },
    plain: true,
}));
const __VLS_27 = __VLS_26({
    ...{ 'onClick': {} },
    plain: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_26));
let __VLS_29;
let __VLS_30;
let __VLS_31;
const __VLS_32 = {
    onClick: (...[$event]) => {
        __VLS_ctx.emit('reset');
    }
};
__VLS_28.slots.default;
(__VLS_ctx.$t("accountManagement.filter.reset"));
var __VLS_28;
if (__VLS_ctx.canPerformAction('/account-management', 'create')) {
    const __VLS_33 = {}.HcButton;
    /** @type {[typeof __VLS_components.HcButton, typeof __VLS_components.HcButton, ]} */ ;
    // @ts-ignore
    const __VLS_34 = __VLS_asFunctionalComponent(__VLS_33, new __VLS_33({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_35 = __VLS_34({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_34));
    let __VLS_37;
    let __VLS_38;
    let __VLS_39;
    const __VLS_40 = {
        onClick: (...[$event]) => {
            if (!(__VLS_ctx.canPerformAction('/account-management', 'create')))
                return;
            __VLS_ctx.emit('create');
        }
    };
    __VLS_36.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.i)({
        ...{ class: "fa-solid fa-plus tw-mr-1" },
    });
    (__VLS_ctx.$t("accountManagement.filter.create"));
    var __VLS_36;
}
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
/** @type {__VLS_StyleScopedClasses['tw-gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-ml-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-solid']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-plus']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-mr-1']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            HcButton: HcButton,
            HcInput: HcInput,
            HcSelect: HcSelect,
            emit: emit,
            $t: $t,
            canPerformAction: canPerformAction,
            localSearch: localSearch,
            onSearchInput: onSearchInput,
            onStatusChange: onStatusChange,
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
