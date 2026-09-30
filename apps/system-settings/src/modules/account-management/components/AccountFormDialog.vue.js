import { ref, reactive, computed, watch, nextTick } from "vue";
import { ElMessage } from "element-plus";
import { useI18n } from "@monorepo/composables";
import { accManagementApi } from "@/api/accountManagement";
import { HcDialog, HcInput, HcSwitch, HcSelect, HcButton, } from "@monorepo/ui-kit";
import dayjs from "dayjs";
import ResetPasswordDialog from "./ResetPasswordDialog.vue";
const props = defineProps();
const emit = defineEmits();
const { $t } = useI18n();
// ── Computed ───────────────────────────────────────────────────
const isViewMode = computed(() => props.mode === "view");
const isCreateMode = computed(() => props.mode === "create");
const isSaving = ref(false);
const dialogTitle = computed(() => {
    if (props.mode === "create")
        return $t("accountManagement.form.createTitle");
    if (props.mode === "edit")
        return $t("accountManagement.form.editTitle");
    return $t("accountManagement.form.viewTitle");
});
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9+\-\s()]{8,20}$/;
const defaultForm = () => ({
    accountName: "",
    email: "",
    phone: "",
    password: "",
    status: 1,
    roleIds: [],
});
function formatDateTime(val) {
    return val ? dayjs(val).format("YYYY-MM-DD HH:mm:ss") : "—";
}
const form = reactive(defaultForm());
// ── 表單驗證規則 ─────────────────────────────────────────────────
const formRef = ref();
const rules = computed(() => ({
    accountName: [
        {
            required: true,
            message: $t("form.pleaseFill", {
                field: $t("accountManagement.form.accountName"),
            }),
            trigger: "blur",
        },
    ],
    email: [
        {
            required: true,
            message: $t("form.pleaseFill", {
                field: $t("accountManagement.form.email"),
            }),
            trigger: "blur",
        },
        {
            pattern: EMAIL_RE,
            message: $t("accountManagement.form.emailInvalid"),
            trigger: "blur",
        },
    ],
    phone: [
        {
            required: true,
            message: $t("form.pleaseFill", {
                field: $t("accountManagement.form.phone"),
            }),
            trigger: "blur",
        },
        {
            pattern: PHONE_RE,
            message: $t("accountManagement.form.phoneInvalid"),
            trigger: "blur",
        },
    ],
    password: isCreateMode.value
        ? [
            {
                required: true,
                message: $t("form.pleaseFill", {
                    field: $t("accountManagement.form.password"),
                }),
                trigger: "blur",
            },
        ]
        : [],
}));
// ── 登入紀錄（僅 view 模式顯示）─────────────────────────────────
const loginAt = ref("");
const loginIp = ref("");
// ── 重設密碼彈窗 ─────────────────────────────────────────────────
const resetPasswordVisible = ref(false);
const isFormReady = ref(false);
// ── 開啟時初始化 ───────────────────────────────────────────────
watch(() => props.modelValue, async (open) => {
    if (!open)
        return;
    isFormReady.value = false;
    Object.assign(form, defaultForm());
    loginAt.value = "";
    loginIp.value = "";
    await nextTick();
    formRef.value?.clearValidate();
    formRef.value?.resetFields();
    if ((props.mode === "edit" || props.mode === "view") && props.accountId) {
        try {
            const res = await accManagementApi.getAccountInfo(props.accountId);
            const detail = res?.data;
            if (!detail)
                return;
            Object.assign(form, {
                accountName: detail.accountName ?? "",
                email: detail.email ?? "",
                phone: detail.phone ?? "",
                status: detail.status ?? 1,
            });
            loginAt.value = detail.loginAt ?? "";
            loginIp.value = detail.loginIp ?? "";
            const rolesRes = (await accManagementApi.getAccountRoles(props.accountId));
            form.roleIds = rolesRes.data?.roleIds ?? [];
        }
        catch {
            ElMessage.error($t("accountManagement.messages.fetchError"));
        }
        await nextTick();
        isFormReady.value = true;
    }
});
// ── 送出 ───────────────────────────────────────────────────────
async function handleSubmit() {
    const valid = await formRef.value?.validate().catch(() => false);
    if (!valid)
        return;
    isSaving.value = true;
    try {
        if (isCreateMode.value) {
            const createRes = (await accManagementApi.createAccount({
                accountName: form.accountName,
                email: form.email,
                phone: form.phone,
                password: btoa(form.password),
                status: form.status,
            }));
            ElMessage.success($t("messages.createSuccess", { type: $t("accountManagement.title") }));
            const createdId = createRes.data?.id;
            if (createdId) {
                await accManagementApi.updateAccountRoles({
                    accountId: createdId,
                    roleIds: form.roleIds,
                });
            }
        }
        else if (props.mode === "edit" && props.accountId) {
            await accManagementApi.updateAcoount(props.accountId, {
                email: form.email,
                phone: form.phone,
                status: form.status,
            });
            await accManagementApi.updateAccountRoles({
                accountId: props.accountId,
                roleIds: form.roleIds,
            });
            ElMessage.success($t("messages.updateSuccess", { type: $t("accountManagement.title") }));
        }
        emit("success");
        emit("update:modelValue", false);
    }
    catch {
        ElMessage.error(isCreateMode.value
            ? $t("messages.createFailed", { type: "" })
            : $t("messages.updateFailed", { type: "" }));
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
// CSS variable injection 
// CSS variable injection end 
const __VLS_0 = {}.HcDialog;
/** @type {[typeof __VLS_components.HcDialog, typeof __VLS_components.HcDialog, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onUpdate:modelValue': {} },
    ...{ 'onConfirm': {} },
    ...{ 'onCancel': {} },
    modelValue: (__VLS_ctx.modelValue),
    title: (__VLS_ctx.dialogTitle),
    loading: (__VLS_ctx.isSaving),
    showFooter: (!__VLS_ctx.isViewMode),
    width: "600px",
    confirmText: (__VLS_ctx.$t('button.save')),
    cancelText: (__VLS_ctx.$t('button.cancel')),
}));
const __VLS_2 = __VLS_1({
    ...{ 'onUpdate:modelValue': {} },
    ...{ 'onConfirm': {} },
    ...{ 'onCancel': {} },
    modelValue: (__VLS_ctx.modelValue),
    title: (__VLS_ctx.dialogTitle),
    loading: (__VLS_ctx.isSaving),
    showFooter: (!__VLS_ctx.isViewMode),
    width: "600px",
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
    onConfirm: (__VLS_ctx.handleSubmit)
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
    ref: "formRef",
    model: (__VLS_ctx.form),
    rules: (__VLS_ctx.rules),
    labelPosition: "top",
    ...{ class: "tw-flex tw-flex-col tw-gap-4 tw-pt-2" },
}));
const __VLS_13 = __VLS_12({
    ref: "formRef",
    model: (__VLS_ctx.form),
    rules: (__VLS_ctx.rules),
    labelPosition: "top",
    ...{ class: "tw-flex tw-flex-col tw-gap-4 tw-pt-2" },
}, ...__VLS_functionalComponentArgsRest(__VLS_12));
/** @type {typeof __VLS_ctx.formRef} */ ;
var __VLS_15 = {};
__VLS_14.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-section__header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.i)({
    ...{ class: "fa-solid fa-user form-section__icon" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
(__VLS_ctx.$t("accountManagement.form.sectionInfo"));
const __VLS_17 = {}.ElRow;
/** @type {[typeof __VLS_components.ElRow, typeof __VLS_components.elRow, typeof __VLS_components.ElRow, typeof __VLS_components.elRow, ]} */ ;
// @ts-ignore
const __VLS_18 = __VLS_asFunctionalComponent(__VLS_17, new __VLS_17({
    gutter: (16),
}));
const __VLS_19 = __VLS_18({
    gutter: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_18));
__VLS_20.slots.default;
const __VLS_21 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({
    span: (12),
}));
const __VLS_23 = __VLS_22({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_22));
__VLS_24.slots.default;
const __VLS_25 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_26 = __VLS_asFunctionalComponent(__VLS_25, new __VLS_25({
    label: (__VLS_ctx.$t('accountManagement.form.accountName')),
    prop: "accountName",
}));
const __VLS_27 = __VLS_26({
    label: (__VLS_ctx.$t('accountManagement.form.accountName')),
    prop: "accountName",
}, ...__VLS_functionalComponentArgsRest(__VLS_26));
__VLS_28.slots.default;
const __VLS_29 = {}.HcInput;
/** @type {[typeof __VLS_components.HcInput, ]} */ ;
// @ts-ignore
const __VLS_30 = __VLS_asFunctionalComponent(__VLS_29, new __VLS_29({
    modelValue: (__VLS_ctx.form.accountName),
    disabled: (__VLS_ctx.isViewMode || !__VLS_ctx.isCreateMode),
    placeholder: (__VLS_ctx.$t('form.pleaseFill', {
        field: __VLS_ctx.$t('accountManagement.form.accountName'),
    })),
}));
const __VLS_31 = __VLS_30({
    modelValue: (__VLS_ctx.form.accountName),
    disabled: (__VLS_ctx.isViewMode || !__VLS_ctx.isCreateMode),
    placeholder: (__VLS_ctx.$t('form.pleaseFill', {
        field: __VLS_ctx.$t('accountManagement.form.accountName'),
    })),
}, ...__VLS_functionalComponentArgsRest(__VLS_30));
var __VLS_28;
var __VLS_24;
const __VLS_33 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_34 = __VLS_asFunctionalComponent(__VLS_33, new __VLS_33({
    span: (12),
}));
const __VLS_35 = __VLS_34({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_34));
__VLS_36.slots.default;
const __VLS_37 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_38 = __VLS_asFunctionalComponent(__VLS_37, new __VLS_37({
    label: (__VLS_ctx.$t('accountManagement.form.status')),
}));
const __VLS_39 = __VLS_38({
    label: (__VLS_ctx.$t('accountManagement.form.status')),
}, ...__VLS_functionalComponentArgsRest(__VLS_38));
__VLS_40.slots.default;
const __VLS_41 = {}.HcSwitch;
/** @type {[typeof __VLS_components.HcSwitch, ]} */ ;
// @ts-ignore
const __VLS_42 = __VLS_asFunctionalComponent(__VLS_41, new __VLS_41({
    modelValue: (__VLS_ctx.form.status),
    activeValue: 1,
    inactiveValue: 0,
    disabled: (__VLS_ctx.isViewMode),
}));
const __VLS_43 = __VLS_42({
    modelValue: (__VLS_ctx.form.status),
    activeValue: 1,
    inactiveValue: 0,
    disabled: (__VLS_ctx.isViewMode),
}, ...__VLS_functionalComponentArgsRest(__VLS_42));
var __VLS_40;
var __VLS_36;
const __VLS_45 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_46 = __VLS_asFunctionalComponent(__VLS_45, new __VLS_45({
    span: (12),
}));
const __VLS_47 = __VLS_46({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_46));
__VLS_48.slots.default;
const __VLS_49 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_50 = __VLS_asFunctionalComponent(__VLS_49, new __VLS_49({
    label: (__VLS_ctx.$t('accountManagement.form.email')),
    prop: "email",
}));
const __VLS_51 = __VLS_50({
    label: (__VLS_ctx.$t('accountManagement.form.email')),
    prop: "email",
}, ...__VLS_functionalComponentArgsRest(__VLS_50));
__VLS_52.slots.default;
const __VLS_53 = {}.HcInput;
/** @type {[typeof __VLS_components.HcInput, ]} */ ;
// @ts-ignore
const __VLS_54 = __VLS_asFunctionalComponent(__VLS_53, new __VLS_53({
    modelValue: (__VLS_ctx.form.email),
    disabled: (__VLS_ctx.isViewMode),
    placeholder: (__VLS_ctx.$t('form.pleaseFill', {
        field: __VLS_ctx.$t('accountManagement.form.email'),
    })),
}));
const __VLS_55 = __VLS_54({
    modelValue: (__VLS_ctx.form.email),
    disabled: (__VLS_ctx.isViewMode),
    placeholder: (__VLS_ctx.$t('form.pleaseFill', {
        field: __VLS_ctx.$t('accountManagement.form.email'),
    })),
}, ...__VLS_functionalComponentArgsRest(__VLS_54));
var __VLS_52;
var __VLS_48;
const __VLS_57 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_58 = __VLS_asFunctionalComponent(__VLS_57, new __VLS_57({
    span: (12),
}));
const __VLS_59 = __VLS_58({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_58));
__VLS_60.slots.default;
const __VLS_61 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_62 = __VLS_asFunctionalComponent(__VLS_61, new __VLS_61({
    label: (__VLS_ctx.$t('accountManagement.form.phone')),
    prop: "phone",
}));
const __VLS_63 = __VLS_62({
    label: (__VLS_ctx.$t('accountManagement.form.phone')),
    prop: "phone",
}, ...__VLS_functionalComponentArgsRest(__VLS_62));
__VLS_64.slots.default;
const __VLS_65 = {}.HcInput;
/** @type {[typeof __VLS_components.HcInput, ]} */ ;
// @ts-ignore
const __VLS_66 = __VLS_asFunctionalComponent(__VLS_65, new __VLS_65({
    modelValue: (__VLS_ctx.form.phone),
    disabled: (__VLS_ctx.isViewMode),
    placeholder: (__VLS_ctx.$t('form.pleaseFill', {
        field: __VLS_ctx.$t('accountManagement.form.phone'),
    })),
}));
const __VLS_67 = __VLS_66({
    modelValue: (__VLS_ctx.form.phone),
    disabled: (__VLS_ctx.isViewMode),
    placeholder: (__VLS_ctx.$t('form.pleaseFill', {
        field: __VLS_ctx.$t('accountManagement.form.phone'),
    })),
}, ...__VLS_functionalComponentArgsRest(__VLS_66));
var __VLS_64;
var __VLS_60;
if (__VLS_ctx.isCreateMode) {
    const __VLS_69 = {}.ElCol;
    /** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
    // @ts-ignore
    const __VLS_70 = __VLS_asFunctionalComponent(__VLS_69, new __VLS_69({
        span: (12),
    }));
    const __VLS_71 = __VLS_70({
        span: (12),
    }, ...__VLS_functionalComponentArgsRest(__VLS_70));
    __VLS_72.slots.default;
    const __VLS_73 = {}.ElFormItem;
    /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_74 = __VLS_asFunctionalComponent(__VLS_73, new __VLS_73({
        label: (__VLS_ctx.$t('accountManagement.form.password')),
        prop: "password",
    }));
    const __VLS_75 = __VLS_74({
        label: (__VLS_ctx.$t('accountManagement.form.password')),
        prop: "password",
    }, ...__VLS_functionalComponentArgsRest(__VLS_74));
    __VLS_76.slots.default;
    const __VLS_77 = {}.HcInput;
    /** @type {[typeof __VLS_components.HcInput, ]} */ ;
    // @ts-ignore
    const __VLS_78 = __VLS_asFunctionalComponent(__VLS_77, new __VLS_77({
        modelValue: (__VLS_ctx.form.password),
        type: "password",
        showPassword: true,
        placeholder: (__VLS_ctx.$t('form.pleaseFill', {
            field: __VLS_ctx.$t('accountManagement.form.password'),
        })),
    }));
    const __VLS_79 = __VLS_78({
        modelValue: (__VLS_ctx.form.password),
        type: "password",
        showPassword: true,
        placeholder: (__VLS_ctx.$t('form.pleaseFill', {
            field: __VLS_ctx.$t('accountManagement.form.password'),
        })),
    }, ...__VLS_functionalComponentArgsRest(__VLS_78));
    var __VLS_76;
    var __VLS_72;
}
if (__VLS_ctx.mode === 'edit') {
    const __VLS_81 = {}.ElCol;
    /** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
    // @ts-ignore
    const __VLS_82 = __VLS_asFunctionalComponent(__VLS_81, new __VLS_81({
        span: (12),
    }));
    const __VLS_83 = __VLS_82({
        span: (12),
    }, ...__VLS_functionalComponentArgsRest(__VLS_82));
    __VLS_84.slots.default;
    const __VLS_85 = {}.ElFormItem;
    /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_86 = __VLS_asFunctionalComponent(__VLS_85, new __VLS_85({
        label: (__VLS_ctx.$t('accountManagement.form.password')),
        ...{ class: "tw-mb-2" },
    }));
    const __VLS_87 = __VLS_86({
        label: (__VLS_ctx.$t('accountManagement.form.password')),
        ...{ class: "tw-mb-2" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_86));
    __VLS_88.slots.default;
    const __VLS_89 = {}.HcButton;
    /** @type {[typeof __VLS_components.HcButton, typeof __VLS_components.HcButton, ]} */ ;
    // @ts-ignore
    const __VLS_90 = __VLS_asFunctionalComponent(__VLS_89, new __VLS_89({
        ...{ 'onClick': {} },
        plain: true,
        type: "warning",
    }));
    const __VLS_91 = __VLS_90({
        ...{ 'onClick': {} },
        plain: true,
        type: "warning",
    }, ...__VLS_functionalComponentArgsRest(__VLS_90));
    let __VLS_93;
    let __VLS_94;
    let __VLS_95;
    const __VLS_96 = {
        onClick: (...[$event]) => {
            if (!(__VLS_ctx.mode === 'edit'))
                return;
            __VLS_ctx.resetPasswordVisible = true;
        }
    };
    __VLS_92.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.i)({
        ...{ class: "fa-solid fa-key tw-mr-1" },
    });
    (__VLS_ctx.$t("accountManagement.form.resetPassword"));
    var __VLS_92;
    var __VLS_88;
    var __VLS_84;
}
const __VLS_97 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_98 = __VLS_asFunctionalComponent(__VLS_97, new __VLS_97({
    span: (24),
}));
const __VLS_99 = __VLS_98({
    span: (24),
}, ...__VLS_functionalComponentArgsRest(__VLS_98));
__VLS_100.slots.default;
const __VLS_101 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_102 = __VLS_asFunctionalComponent(__VLS_101, new __VLS_101({
    label: (__VLS_ctx.$t('accountManagement.form.roles')),
}));
const __VLS_103 = __VLS_102({
    label: (__VLS_ctx.$t('accountManagement.form.roles')),
}, ...__VLS_functionalComponentArgsRest(__VLS_102));
__VLS_104.slots.default;
const __VLS_105 = {}.HcSelect;
/** @type {[typeof __VLS_components.HcSelect, typeof __VLS_components.HcSelect, ]} */ ;
// @ts-ignore
const __VLS_106 = __VLS_asFunctionalComponent(__VLS_105, new __VLS_105({
    modelValue: (__VLS_ctx.form.roleIds),
    multiple: true,
    collapseTags: true,
    collapseTagsTooltip: true,
    disabled: (__VLS_ctx.isViewMode),
    placeholder: (__VLS_ctx.$t('accountManagement.form.rolesPlaceholder')),
    ...{ style: {} },
}));
const __VLS_107 = __VLS_106({
    modelValue: (__VLS_ctx.form.roleIds),
    multiple: true,
    collapseTags: true,
    collapseTagsTooltip: true,
    disabled: (__VLS_ctx.isViewMode),
    placeholder: (__VLS_ctx.$t('accountManagement.form.rolesPlaceholder')),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_106));
__VLS_108.slots.default;
for (const [role] of __VLS_getVForSourceType((__VLS_ctx.roleOptions))) {
    const __VLS_109 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_110 = __VLS_asFunctionalComponent(__VLS_109, new __VLS_109({
        key: (role.id),
        label: (role.roleName),
        value: (role.id),
    }));
    const __VLS_111 = __VLS_110({
        key: (role.id),
        label: (role.roleName),
        value: (role.id),
    }, ...__VLS_functionalComponentArgsRest(__VLS_110));
}
var __VLS_108;
var __VLS_104;
var __VLS_100;
var __VLS_20;
if (__VLS_ctx.isViewMode) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-section form-section--last" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-section__header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.i)({
        ...{ class: "fa-solid fa-clock-rotate-left form-section__icon" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.$t("accountManagement.form.sectionLogin"));
    const __VLS_113 = {}.ElRow;
    /** @type {[typeof __VLS_components.ElRow, typeof __VLS_components.elRow, typeof __VLS_components.ElRow, typeof __VLS_components.elRow, ]} */ ;
    // @ts-ignore
    const __VLS_114 = __VLS_asFunctionalComponent(__VLS_113, new __VLS_113({
        gutter: (16),
    }));
    const __VLS_115 = __VLS_114({
        gutter: (16),
    }, ...__VLS_functionalComponentArgsRest(__VLS_114));
    __VLS_116.slots.default;
    const __VLS_117 = {}.ElCol;
    /** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
    // @ts-ignore
    const __VLS_118 = __VLS_asFunctionalComponent(__VLS_117, new __VLS_117({
        span: (12),
    }));
    const __VLS_119 = __VLS_118({
        span: (12),
    }, ...__VLS_functionalComponentArgsRest(__VLS_118));
    __VLS_120.slots.default;
    const __VLS_121 = {}.ElFormItem;
    /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_122 = __VLS_asFunctionalComponent(__VLS_121, new __VLS_121({
        label: (__VLS_ctx.$t('accountManagement.form.loginAt')),
        ...{ class: "tw-mb-2" },
    }));
    const __VLS_123 = __VLS_122({
        label: (__VLS_ctx.$t('accountManagement.form.loginAt')),
        ...{ class: "tw-mb-2" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_122));
    __VLS_124.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.loginAt ? __VLS_ctx.formatDateTime(__VLS_ctx.loginAt) : "—");
    var __VLS_124;
    var __VLS_120;
    const __VLS_125 = {}.ElCol;
    /** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
    // @ts-ignore
    const __VLS_126 = __VLS_asFunctionalComponent(__VLS_125, new __VLS_125({
        span: (12),
    }));
    const __VLS_127 = __VLS_126({
        span: (12),
    }, ...__VLS_functionalComponentArgsRest(__VLS_126));
    __VLS_128.slots.default;
    const __VLS_129 = {}.ElFormItem;
    /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_130 = __VLS_asFunctionalComponent(__VLS_129, new __VLS_129({
        label: (__VLS_ctx.$t('accountManagement.form.loginIp')),
        ...{ class: "tw-mb-2" },
    }));
    const __VLS_131 = __VLS_130({
        label: (__VLS_ctx.$t('accountManagement.form.loginIp')),
        ...{ class: "tw-mb-2" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_130));
    __VLS_132.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.loginIp || "—");
    var __VLS_132;
    var __VLS_128;
    var __VLS_116;
}
var __VLS_14;
/** @type {[typeof ResetPasswordDialog, ]} */ ;
// @ts-ignore
const __VLS_133 = __VLS_asFunctionalComponent(ResetPasswordDialog, new ResetPasswordDialog({
    modelValue: (__VLS_ctx.resetPasswordVisible),
    accountId: (__VLS_ctx.accountId),
}));
const __VLS_134 = __VLS_133({
    modelValue: (__VLS_ctx.resetPasswordVisible),
    accountId: (__VLS_ctx.accountId),
}, ...__VLS_functionalComponentArgsRest(__VLS_133));
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['tw-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-gap-4']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-pt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['form-section']} */ ;
/** @type {__VLS_StyleScopedClasses['form-section__header']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-solid']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-user']} */ ;
/** @type {__VLS_StyleScopedClasses['form-section__icon']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-solid']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-key']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-mr-1']} */ ;
/** @type {__VLS_StyleScopedClasses['form-section']} */ ;
/** @type {__VLS_StyleScopedClasses['form-section--last']} */ ;
/** @type {__VLS_StyleScopedClasses['form-section__header']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-solid']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-clock-rotate-left']} */ ;
/** @type {__VLS_StyleScopedClasses['form-section__icon']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-mb-2']} */ ;
// @ts-ignore
var __VLS_16 = __VLS_15;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            HcDialog: HcDialog,
            HcInput: HcInput,
            HcSwitch: HcSwitch,
            HcSelect: HcSelect,
            HcButton: HcButton,
            ResetPasswordDialog: ResetPasswordDialog,
            emit: emit,
            $t: $t,
            isViewMode: isViewMode,
            isCreateMode: isCreateMode,
            isSaving: isSaving,
            dialogTitle: dialogTitle,
            formatDateTime: formatDateTime,
            form: form,
            formRef: formRef,
            rules: rules,
            loginAt: loginAt,
            loginIp: loginIp,
            resetPasswordVisible: resetPasswordVisible,
            handleSubmit: handleSubmit,
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
