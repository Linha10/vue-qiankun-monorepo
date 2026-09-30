import { ref, reactive, computed, onMounted, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { Back } from "@element-plus/icons-vue";
import { useQueryClient } from "@tanstack/vue-query";
import { AccountRole } from "@/api/role";
import { useI18n } from "@monorepo/composables";
import { HcButton, HcRadio, HcInput, HcInputNumber } from "@monorepo/ui-kit";
import PermissionList from "../components/PermissionList.vue";
import { flattenMenuTree } from "@monorepo/utils";
const route = useRoute();
const router = useRouter();
const queryClient = useQueryClient();
const { $t } = useI18n();
const isEditMode = computed(() => route.name === "RoleManagementEdit");
const roleId = computed(() => route.params.roleId);
const formRef = ref();
const form = reactive({
    roleName: "",
    roleKey: "",
    sort: 0,
    status: 1,
});
const rules = computed(() => ({
    roleName: [
        {
            required: true,
            message: $t("form.pleaseFill", {
                field: $t("roleManagement.form.roleName"),
            }),
            trigger: "blur",
        },
    ],
    roleKey: [
        {
            required: true,
            message: $t("form.pleaseFill", {
                field: $t("roleManagement.form.roleKey"),
            }),
            trigger: "blur",
        },
    ],
}));
// ── 權限選單 ──────────────────────────────────────────────────
const menuList = ref([]);
const selectedMenuIds = ref([77]);
const loadMenuTree = async () => {
    try {
        const res = await AccountRole.getMenuTree({ status: 1 });
        menuList.value = flattenMenuTree(res?.data);
    }
    catch {
        ElMessage.error($t("roleManagement.form.fetchMenuError"));
    }
};
// ── 載入角色詳細資訊（編輯模式）─────────────────────────────────
const isDetailLoading = ref(false);
const loadDetail = async () => {
    if (!isEditMode.value)
        return;
    isDetailLoading.value = true;
    try {
        const [roleRes, menuRes] = await Promise.all([
            AccountRole.getSpecificRole(roleId.value),
            AccountRole.getRoleMenu(roleId.value),
        ]);
        const detail = roleRes?.data;
        if (detail) {
            form.roleName = detail.roleName ?? "";
            form.roleKey = detail.roleKey ?? "";
            form.sort = detail.sort ?? 0;
            form.status = detail.status ?? 1;
        }
        selectedMenuIds.value = (menuRes?.data ?? []);
    }
    catch {
        ElMessage.error($t("roleManagement.form.fetchError"));
    }
    finally {
        isDetailLoading.value = false;
    }
};
onMounted(async () => {
    await loadMenuTree();
    await loadDetail();
});
// ── 提交 ──────────────────────────────────────────────────────
const isSubmitting = ref(false);
// 建立/更新角色 API 實際回應結構尚未經真實後端驗證，這裡容錯讀取 id 或 roleId
function extractRoleId(res) {
    const data = res?.data;
    const id = data?.id ?? data?.roleId;
    return id === undefined || id === null ? undefined : String(id);
}
const handleSubmit = async () => {
    const isValid = (await formRef.value?.validate().catch(() => false)) ?? true;
    if (!isValid) {
        ElMessage.warning($t("form.checkRequired"));
        nextTick(() => {
            const firstError = document.querySelector(".el-form-item.is-error");
            firstError?.scrollIntoView({ behavior: "smooth", block: "center" });
        });
        return;
    }
    isSubmitting.value = true;
    try {
        let targetRoleId = roleId.value;
        if (isEditMode.value) {
            await AccountRole.updateSpecificRole({ roleId: roleId.value, ...form });
        }
        else {
            const res = await AccountRole.createRole(form);
            const createdId = extractRoleId(res);
            if (!createdId) {
                throw new Error("無法從回應取得新建立的角色 id，請檢查 API 實際回應結構");
            }
            targetRoleId = createdId;
        }
        await AccountRole.updateRoleMenu({
            roleId: targetRoleId,
            menuIds: selectedMenuIds.value,
        });
        ElMessage.success(isEditMode.value
            ? $t("messages.updateSuccess", { type: $t("roleManagement.title") })
            : $t("messages.createSuccess", { type: $t("roleManagement.title") }));
        await queryClient.invalidateQueries({ queryKey: ["roleList"] });
        router.push("/role-management");
    }
    catch {
        ElMessage.error(isEditMode.value
            ? $t("messages.updateFailed", { type: $t("roleManagement.title") })
            : $t("messages.createFailed", { type: $t("roleManagement.title") }));
    }
    finally {
        isSubmitting.value = false;
    }
};
const handleCancel = () => {
    router.push("/role-management");
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "tw-p-6" },
});
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.isDetailLoading) }, null, null);
const __VLS_0 = {}.HcButton;
/** @type {[typeof __VLS_components.HcButton, typeof __VLS_components.hcButton, typeof __VLS_components.HcButton, typeof __VLS_components.hcButton, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onClick': {} },
    link: true,
    circle: true,
    ...{ class: "tw-mb-2" },
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClick': {} },
    link: true,
    circle: true,
    ...{ class: "tw-mb-2" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onClick: (...[$event]) => {
        __VLS_ctx.router.push('/role-management');
    }
};
__VLS_3.slots.default;
const __VLS_8 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    size: "32px",
}));
const __VLS_10 = __VLS_9({
    size: "32px",
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
const __VLS_12 = {}.Back;
/** @type {[typeof __VLS_components.Back, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({}));
const __VLS_14 = __VLS_13({}, ...__VLS_functionalComponentArgsRest(__VLS_13));
var __VLS_11;
var __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({
    ...{ class: "tw-text-2xl tw-font-bold tw-leading-tight tw-mb-6" },
});
(__VLS_ctx.isEditMode
    ? __VLS_ctx.$t("roleManagement.form.editTitle")
    : __VLS_ctx.$t("roleManagement.form.createTitle"));
const __VLS_16 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    ref: "formRef",
    model: (__VLS_ctx.form),
    rules: (__VLS_ctx.rules),
    labelPosition: "top",
}));
const __VLS_18 = __VLS_17({
    ref: "formRef",
    model: (__VLS_ctx.form),
    rules: (__VLS_ctx.rules),
    labelPosition: "top",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
/** @type {typeof __VLS_ctx.formRef} */ ;
var __VLS_20 = {};
__VLS_19.slots.default;
const __VLS_22 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_23 = __VLS_asFunctionalComponent(__VLS_22, new __VLS_22({
    ...{ class: "tw-mb-4" },
    shadow: "never",
}));
const __VLS_24 = __VLS_23({
    ...{ class: "tw-mb-4" },
    shadow: "never",
}, ...__VLS_functionalComponentArgsRest(__VLS_23));
__VLS_25.slots.default;
{
    const { header: __VLS_thisSlot } = __VLS_25.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "tw-font-medium" },
    });
    (__VLS_ctx.$t("roleManagement.form.sectionInfo"));
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "tw-grid tw-grid-cols-2 tw-gap-x-6" },
});
const __VLS_26 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_27 = __VLS_asFunctionalComponent(__VLS_26, new __VLS_26({
    label: (__VLS_ctx.$t('roleManagement.form.roleName')),
    prop: "roleName",
}));
const __VLS_28 = __VLS_27({
    label: (__VLS_ctx.$t('roleManagement.form.roleName')),
    prop: "roleName",
}, ...__VLS_functionalComponentArgsRest(__VLS_27));
__VLS_29.slots.default;
const __VLS_30 = {}.HcInput;
/** @type {[typeof __VLS_components.HcInput, ]} */ ;
// @ts-ignore
const __VLS_31 = __VLS_asFunctionalComponent(__VLS_30, new __VLS_30({
    modelValue: (__VLS_ctx.form.roleName),
    placeholder: (__VLS_ctx.$t('roleManagement.form.roleName')),
}));
const __VLS_32 = __VLS_31({
    modelValue: (__VLS_ctx.form.roleName),
    placeholder: (__VLS_ctx.$t('roleManagement.form.roleName')),
}, ...__VLS_functionalComponentArgsRest(__VLS_31));
var __VLS_29;
const __VLS_34 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_35 = __VLS_asFunctionalComponent(__VLS_34, new __VLS_34({
    label: (__VLS_ctx.$t('roleManagement.form.roleKey')),
    prop: "roleKey",
}));
const __VLS_36 = __VLS_35({
    label: (__VLS_ctx.$t('roleManagement.form.roleKey')),
    prop: "roleKey",
}, ...__VLS_functionalComponentArgsRest(__VLS_35));
__VLS_37.slots.default;
const __VLS_38 = {}.HcInput;
/** @type {[typeof __VLS_components.HcInput, ]} */ ;
// @ts-ignore
const __VLS_39 = __VLS_asFunctionalComponent(__VLS_38, new __VLS_38({
    modelValue: (__VLS_ctx.form.roleKey),
    placeholder: (__VLS_ctx.$t('roleManagement.form.roleKey')),
}));
const __VLS_40 = __VLS_39({
    modelValue: (__VLS_ctx.form.roleKey),
    placeholder: (__VLS_ctx.$t('roleManagement.form.roleKey')),
}, ...__VLS_functionalComponentArgsRest(__VLS_39));
var __VLS_37;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "tw-grid tw-grid-cols-2 tw-gap-x-6" },
});
const __VLS_42 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_43 = __VLS_asFunctionalComponent(__VLS_42, new __VLS_42({
    label: (__VLS_ctx.$t('roleManagement.form.sort')),
    prop: "sort",
}));
const __VLS_44 = __VLS_43({
    label: (__VLS_ctx.$t('roleManagement.form.sort')),
    prop: "sort",
}, ...__VLS_functionalComponentArgsRest(__VLS_43));
__VLS_45.slots.default;
const __VLS_46 = {}.HcInputNumber;
/** @type {[typeof __VLS_components.HcInputNumber, ]} */ ;
// @ts-ignore
const __VLS_47 = __VLS_asFunctionalComponent(__VLS_46, new __VLS_46({
    modelValue: (__VLS_ctx.form.sort),
    min: (0),
}));
const __VLS_48 = __VLS_47({
    modelValue: (__VLS_ctx.form.sort),
    min: (0),
}, ...__VLS_functionalComponentArgsRest(__VLS_47));
var __VLS_45;
const __VLS_50 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_51 = __VLS_asFunctionalComponent(__VLS_50, new __VLS_50({
    label: (__VLS_ctx.$t('roleManagement.form.status')),
    prop: "status",
}));
const __VLS_52 = __VLS_51({
    label: (__VLS_ctx.$t('roleManagement.form.status')),
    prop: "status",
}, ...__VLS_functionalComponentArgsRest(__VLS_51));
__VLS_53.slots.default;
const __VLS_54 = {}.ElRadioGroup;
/** @type {[typeof __VLS_components.ElRadioGroup, typeof __VLS_components.elRadioGroup, typeof __VLS_components.ElRadioGroup, typeof __VLS_components.elRadioGroup, ]} */ ;
// @ts-ignore
const __VLS_55 = __VLS_asFunctionalComponent(__VLS_54, new __VLS_54({
    modelValue: (__VLS_ctx.form.status),
}));
const __VLS_56 = __VLS_55({
    modelValue: (__VLS_ctx.form.status),
}, ...__VLS_functionalComponentArgsRest(__VLS_55));
__VLS_57.slots.default;
const __VLS_58 = {}.HcRadio;
/** @type {[typeof __VLS_components.HcRadio, typeof __VLS_components.HcRadio, ]} */ ;
// @ts-ignore
const __VLS_59 = __VLS_asFunctionalComponent(__VLS_58, new __VLS_58({
    value: (1),
}));
const __VLS_60 = __VLS_59({
    value: (1),
}, ...__VLS_functionalComponentArgsRest(__VLS_59));
__VLS_61.slots.default;
(__VLS_ctx.$t("common.enable"));
var __VLS_61;
const __VLS_62 = {}.HcRadio;
/** @type {[typeof __VLS_components.HcRadio, typeof __VLS_components.HcRadio, ]} */ ;
// @ts-ignore
const __VLS_63 = __VLS_asFunctionalComponent(__VLS_62, new __VLS_62({
    value: (0),
}));
const __VLS_64 = __VLS_63({
    value: (0),
}, ...__VLS_functionalComponentArgsRest(__VLS_63));
__VLS_65.slots.default;
(__VLS_ctx.$t("common.disable"));
var __VLS_65;
var __VLS_57;
var __VLS_53;
var __VLS_25;
const __VLS_66 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_67 = __VLS_asFunctionalComponent(__VLS_66, new __VLS_66({
    ...{ class: "tw-mb-4" },
    shadow: "never",
}));
const __VLS_68 = __VLS_67({
    ...{ class: "tw-mb-4" },
    shadow: "never",
}, ...__VLS_functionalComponentArgsRest(__VLS_67));
__VLS_69.slots.default;
{
    const { header: __VLS_thisSlot } = __VLS_69.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "tw-font-medium" },
    });
    (__VLS_ctx.$t("roleManagement.form.sectionPermission"));
}
/** @type {[typeof PermissionList, ]} */ ;
// @ts-ignore
const __VLS_70 = __VLS_asFunctionalComponent(PermissionList, new PermissionList({
    modelValue: (__VLS_ctx.selectedMenuIds),
    menuList: (__VLS_ctx.menuList),
}));
const __VLS_71 = __VLS_70({
    modelValue: (__VLS_ctx.selectedMenuIds),
    menuList: (__VLS_ctx.menuList),
}, ...__VLS_functionalComponentArgsRest(__VLS_70));
var __VLS_69;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "tw-flex tw-gap-3" },
});
const __VLS_73 = {}.HcButton;
/** @type {[typeof __VLS_components.HcButton, typeof __VLS_components.hcButton, typeof __VLS_components.HcButton, typeof __VLS_components.hcButton, ]} */ ;
// @ts-ignore
const __VLS_74 = __VLS_asFunctionalComponent(__VLS_73, new __VLS_73({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.isSubmitting),
}));
const __VLS_75 = __VLS_74({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.isSubmitting),
}, ...__VLS_functionalComponentArgsRest(__VLS_74));
let __VLS_77;
let __VLS_78;
let __VLS_79;
const __VLS_80 = {
    onClick: (__VLS_ctx.handleSubmit)
};
__VLS_76.slots.default;
(__VLS_ctx.isEditMode ? __VLS_ctx.$t("common.update") : __VLS_ctx.$t("common.create"));
var __VLS_76;
const __VLS_81 = {}.HcButton;
/** @type {[typeof __VLS_components.HcButton, typeof __VLS_components.hcButton, typeof __VLS_components.HcButton, typeof __VLS_components.hcButton, ]} */ ;
// @ts-ignore
const __VLS_82 = __VLS_asFunctionalComponent(__VLS_81, new __VLS_81({
    ...{ 'onClick': {} },
    disabled: (__VLS_ctx.isSubmitting),
}));
const __VLS_83 = __VLS_82({
    ...{ 'onClick': {} },
    disabled: (__VLS_ctx.isSubmitting),
}, ...__VLS_functionalComponentArgsRest(__VLS_82));
let __VLS_85;
let __VLS_86;
let __VLS_87;
const __VLS_88 = {
    onClick: (__VLS_ctx.handleCancel)
};
__VLS_84.slots.default;
(__VLS_ctx.$t("common.cancel"));
var __VLS_84;
var __VLS_19;
/** @type {__VLS_StyleScopedClasses['tw-p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-text-2xl']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-leading-tight']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-mb-6']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-grid-cols-2']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-gap-x-6']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-grid-cols-2']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-gap-x-6']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-gap-3']} */ ;
// @ts-ignore
var __VLS_21 = __VLS_20;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            Back: Back,
            HcButton: HcButton,
            HcRadio: HcRadio,
            HcInput: HcInput,
            HcInputNumber: HcInputNumber,
            PermissionList: PermissionList,
            router: router,
            $t: $t,
            isEditMode: isEditMode,
            formRef: formRef,
            form: form,
            rules: rules,
            menuList: menuList,
            selectedMenuIds: selectedMenuIds,
            isDetailLoading: isDetailLoading,
            isSubmitting: isSubmitting,
            handleSubmit: handleSubmit,
            handleCancel: handleCancel,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
