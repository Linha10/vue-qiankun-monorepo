import { ref, watch } from "vue";
import { ElMessage } from "element-plus";
import { useI18n } from "@monorepo/composables";
import { accManagementApi } from "@/api/accountManagement";
import { HcDialog, HcInput } from "@monorepo/ui-kit";
const props = defineProps();
const emit = defineEmits();
const { $t } = useI18n();
// ── 表單 ──────────────────────────────────────────────────────
const newPassword = ref("");
const confirmPassword = ref("");
const isSaving = ref(false);
watch(() => props.modelValue, (open) => {
    if (!open) {
        newPassword.value = "";
        confirmPassword.value = "";
    }
});
// ── 送出 ──────────────────────────────────────────────────────
async function handleConfirm() {
    if (!props.accountId)
        return;
    if (!newPassword.value || !confirmPassword.value) {
        ElMessage.warning($t("form.checkRequired"));
        return;
    }
    if (newPassword.value !== confirmPassword.value) {
        ElMessage.warning($t("accountManagement.resetPassword.mismatch"));
        return;
    }
    isSaving.value = true;
    try {
        await accManagementApi.resetAccountPassword(props.accountId, btoa(newPassword.value));
        ElMessage.success($t("accountManagement.resetPassword.success"));
        emit("update:modelValue", false);
    }
    catch {
        ElMessage.error($t("messages.updateFailed", { type: "" }));
    }
    finally {
        isSaving.value = false;
    }
}
function handleClose() {
    emit("update:modelValue", false);
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
const __VLS_0 = {}.HcDialog;
/** @type {[typeof __VLS_components.HcDialog, typeof __VLS_components.HcDialog, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onUpdate:modelValue': {} },
    ...{ 'onConfirm': {} },
    ...{ 'onCancel': {} },
    modelValue: (__VLS_ctx.modelValue),
    title: (__VLS_ctx.$t('accountManagement.resetPassword.title')),
    loading: (__VLS_ctx.isSaving),
    width: "420px",
    confirmText: (__VLS_ctx.$t('button.save')),
    cancelText: (__VLS_ctx.$t('button.cancel')),
}));
const __VLS_2 = __VLS_1({
    ...{ 'onUpdate:modelValue': {} },
    ...{ 'onConfirm': {} },
    ...{ 'onCancel': {} },
    modelValue: (__VLS_ctx.modelValue),
    title: (__VLS_ctx.$t('accountManagement.resetPassword.title')),
    loading: (__VLS_ctx.isSaving),
    width: "420px",
    confirmText: (__VLS_ctx.$t('button.save')),
    cancelText: (__VLS_ctx.$t('button.cancel')),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    'onUpdate:modelValue': (...[$event]) => {
        __VLS_ctx.emit('update:modelValue', $event);
    }
};
const __VLS_8 = {
    onConfirm: (__VLS_ctx.handleConfirm)
};
const __VLS_9 = {
    onCancel: (__VLS_ctx.handleClose)
};
var __VLS_10 = {};
__VLS_3.slots.default;
const __VLS_11 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_12 = __VLS_asFunctionalComponent(__VLS_11, new __VLS_11({
    labelPosition: "top",
    ...{ class: "tw-flex tw-flex-col tw-gap-2" },
}));
const __VLS_13 = __VLS_12({
    labelPosition: "top",
    ...{ class: "tw-flex tw-flex-col tw-gap-2" },
}, ...__VLS_functionalComponentArgsRest(__VLS_12));
__VLS_14.slots.default;
const __VLS_15 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_16 = __VLS_asFunctionalComponent(__VLS_15, new __VLS_15({
    label: (__VLS_ctx.$t('accountManagement.resetPassword.newPassword')),
    required: true,
}));
const __VLS_17 = __VLS_16({
    label: (__VLS_ctx.$t('accountManagement.resetPassword.newPassword')),
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_16));
__VLS_18.slots.default;
const __VLS_19 = {}.HcInput;
/** @type {[typeof __VLS_components.HcInput, ]} */ ;
// @ts-ignore
const __VLS_20 = __VLS_asFunctionalComponent(__VLS_19, new __VLS_19({
    modelValue: (__VLS_ctx.newPassword),
    type: "password",
    showPassword: true,
    placeholder: (__VLS_ctx.$t('form.pleaseFill', {
        field: __VLS_ctx.$t('accountManagement.resetPassword.newPassword'),
    })),
}));
const __VLS_21 = __VLS_20({
    modelValue: (__VLS_ctx.newPassword),
    type: "password",
    showPassword: true,
    placeholder: (__VLS_ctx.$t('form.pleaseFill', {
        field: __VLS_ctx.$t('accountManagement.resetPassword.newPassword'),
    })),
}, ...__VLS_functionalComponentArgsRest(__VLS_20));
var __VLS_18;
const __VLS_23 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_24 = __VLS_asFunctionalComponent(__VLS_23, new __VLS_23({
    label: (__VLS_ctx.$t('accountManagement.resetPassword.confirmPassword')),
    required: true,
}));
const __VLS_25 = __VLS_24({
    label: (__VLS_ctx.$t('accountManagement.resetPassword.confirmPassword')),
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_24));
__VLS_26.slots.default;
const __VLS_27 = {}.HcInput;
/** @type {[typeof __VLS_components.HcInput, ]} */ ;
// @ts-ignore
const __VLS_28 = __VLS_asFunctionalComponent(__VLS_27, new __VLS_27({
    modelValue: (__VLS_ctx.confirmPassword),
    type: "password",
    showPassword: true,
    placeholder: (__VLS_ctx.$t('form.pleaseFill', {
        field: __VLS_ctx.$t('accountManagement.resetPassword.confirmPassword'),
    })),
}));
const __VLS_29 = __VLS_28({
    modelValue: (__VLS_ctx.confirmPassword),
    type: "password",
    showPassword: true,
    placeholder: (__VLS_ctx.$t('form.pleaseFill', {
        field: __VLS_ctx.$t('accountManagement.resetPassword.confirmPassword'),
    })),
}, ...__VLS_functionalComponentArgsRest(__VLS_28));
var __VLS_26;
var __VLS_14;
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['tw-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-gap-2']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            HcDialog: HcDialog,
            HcInput: HcInput,
            emit: emit,
            $t: $t,
            newPassword: newPassword,
            confirmPassword: confirmPassword,
            isSaving: isSaving,
            handleConfirm: handleConfirm,
            handleClose: handleClose,
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
