import { computed } from "vue";
import { useI18n, usePermission } from "@monorepo/composables";
import { HcInput, HcButton } from "@monorepo/ui-kit";
const __VLS_props = defineProps();
const emit = defineEmits();
const { $t } = useI18n();
const { canPerformAction } = usePermission();
const statusOptions = computed(() => [
    { label: $t("roleManagement.filter.all"), value: "" },
    { label: $t("roleManagement.filter.active"), value: 1 },
    { label: $t("roleManagement.filter.inactive"), value: 0 },
]);
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
(__VLS_ctx.$t("common.search"));
const __VLS_0 = {}.HcInput;
/** @type {[typeof __VLS_components.HcInput, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onUpdate:modelValue': {} },
    ...{ 'onKeyup': {} },
    modelValue: (__VLS_ctx.search),
    placeholder: (__VLS_ctx.$t('roleManagement.filter.searchPlaceholder')),
    clearable: true,
    ...{ style: {} },
}));
const __VLS_2 = __VLS_1({
    ...{ 'onUpdate:modelValue': {} },
    ...{ 'onKeyup': {} },
    modelValue: (__VLS_ctx.search),
    placeholder: (__VLS_ctx.$t('roleManagement.filter.searchPlaceholder')),
    clearable: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    'onUpdate:modelValue': (...[$event]) => {
        __VLS_ctx.emit('update:search', $event);
    }
};
const __VLS_8 = {
    onKeyup: (...[$event]) => {
        __VLS_ctx.emit('search');
    }
};
var __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "tw-flex tw-flex-col tw-gap-1" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "tw-text-xs tw-text-slate-500" },
});
(__VLS_ctx.$t("roleManagement.filter.status"));
const __VLS_9 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({
    ...{ 'onUpdate:modelValue': {} },
    modelValue: (__VLS_ctx.status),
    ...{ style: {} },
    clearable: true,
}));
const __VLS_11 = __VLS_10({
    ...{ 'onUpdate:modelValue': {} },
    modelValue: (__VLS_ctx.status),
    ...{ style: {} },
    clearable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_10));
let __VLS_13;
let __VLS_14;
let __VLS_15;
const __VLS_16 = {
    'onUpdate:modelValue': (...[$event]) => {
        __VLS_ctx.emit('update:status', $event);
    }
};
__VLS_12.slots.default;
for (const [opt] of __VLS_getVForSourceType((__VLS_ctx.statusOptions))) {
    const __VLS_17 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_18 = __VLS_asFunctionalComponent(__VLS_17, new __VLS_17({
        key: (String(opt.value)),
        label: (opt.label),
        value: (opt.value),
    }));
    const __VLS_19 = __VLS_18({
        key: (String(opt.value)),
        label: (opt.label),
        value: (opt.value),
    }, ...__VLS_functionalComponentArgsRest(__VLS_18));
}
var __VLS_12;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "tw-flex tw-gap-2 tw-ml-auto" },
});
const __VLS_21 = {}.HcButton;
/** @type {[typeof __VLS_components.HcButton, typeof __VLS_components.HcButton, ]} */ ;
// @ts-ignore
const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({
    ...{ 'onClick': {} },
}));
const __VLS_23 = __VLS_22({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_22));
let __VLS_25;
let __VLS_26;
let __VLS_27;
const __VLS_28 = {
    onClick: (...[$event]) => {
        __VLS_ctx.emit('reset');
    }
};
__VLS_24.slots.default;
(__VLS_ctx.$t("roleManagement.filter.reset"));
var __VLS_24;
const __VLS_29 = {}.HcButton;
/** @type {[typeof __VLS_components.HcButton, typeof __VLS_components.HcButton, ]} */ ;
// @ts-ignore
const __VLS_30 = __VLS_asFunctionalComponent(__VLS_29, new __VLS_29({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_31 = __VLS_30({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_30));
let __VLS_33;
let __VLS_34;
let __VLS_35;
const __VLS_36 = {
    onClick: (...[$event]) => {
        __VLS_ctx.emit('search');
    }
};
__VLS_32.slots.default;
(__VLS_ctx.$t("common.search"));
var __VLS_32;
if (__VLS_ctx.canPerformAction('/role-management', 'create')) {
    const __VLS_37 = {}.HcButton;
    /** @type {[typeof __VLS_components.HcButton, typeof __VLS_components.HcButton, ]} */ ;
    // @ts-ignore
    const __VLS_38 = __VLS_asFunctionalComponent(__VLS_37, new __VLS_37({
        ...{ 'onClick': {} },
        type: "primary",
        plain: true,
    }));
    const __VLS_39 = __VLS_38({
        ...{ 'onClick': {} },
        type: "primary",
        plain: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_38));
    let __VLS_41;
    let __VLS_42;
    let __VLS_43;
    const __VLS_44 = {
        onClick: (...[$event]) => {
            if (!(__VLS_ctx.canPerformAction('/role-management', 'create')))
                return;
            __VLS_ctx.emit('create');
        }
    };
    __VLS_40.slots.default;
    (__VLS_ctx.$t("roleManagement.filter.create"));
    var __VLS_40;
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
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            HcInput: HcInput,
            HcButton: HcButton,
            emit: emit,
            $t: $t,
            canPerformAction: canPerformAction,
            statusOptions: statusOptions,
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
