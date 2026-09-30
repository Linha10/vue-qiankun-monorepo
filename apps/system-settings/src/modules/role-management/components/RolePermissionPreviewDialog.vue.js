import { ref, watch, computed } from "vue";
import { ElMessage } from "element-plus";
import { useI18n } from "@monorepo/composables";
import { AccountRole } from "@/api/role";
import { HcDialog } from "@monorepo/ui-kit";
import { buildPermissionGroups } from "@monorepo/utils";
const props = defineProps();
const emit = defineEmits();
const { $t } = useI18n();
// ── 角色目前擁有的權限 id ──────────────────────────────────────
const isFetching = ref(false);
const selectedIds = ref(new Set());
watch(() => props.modelValue, async (open) => {
    if (!open) {
        selectedIds.value = new Set();
        return;
    }
    if (!props.roleId)
        return;
    isFetching.value = true;
    try {
        const res = await AccountRole.getRoleMenu(props.roleId);
        selectedIds.value = new Set((res?.data ?? []));
    }
    catch {
        ElMessage.error($t("roleManagement.permission.fetchError"));
    }
    finally {
        isFetching.value = false;
    }
});
const groups = computed(() => buildPermissionGroups(props.menuList));
const displayGroups = computed(() => {
    const result = [];
    for (const group of groups.value) {
        const menus = group.menus
            .map(({ menu, btns }) => {
            const findGranted = (action) => {
                const btn = btns.find((b) => b.action === action);
                return !!btn && selectedIds.value.has(btn.id);
            };
            return {
                menu,
                hasView: selectedIds.value.has(menu.id),
                hasCreate: findGranted("create"),
                hasUpdate: findGranted("update"),
                hasDelete: findGranted("delete"),
            };
        })
            .filter((row) => row.hasView || row.hasCreate || row.hasUpdate || row.hasDelete);
        if (menus.length === 0)
            continue;
        result.push({
            key: group.dir?.id ?? menus[0].menu.id,
            title: group.dir?.title ?? null,
            menus,
        });
    }
    return result;
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['form-section']} */ ;
// CSS variable injection 
// CSS variable injection end 
const __VLS_0 = {}.HcDialog;
/** @type {[typeof __VLS_components.HcDialog, typeof __VLS_components.HcDialog, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onUpdate:modelValue': {} },
    modelValue: (__VLS_ctx.modelValue),
    title: (__VLS_ctx.$t('roleManagement.permission.previewTitle', { name: __VLS_ctx.roleName ?? '' })),
    showFooter: (false),
    width: "520px",
}));
const __VLS_2 = __VLS_1({
    ...{ 'onUpdate:modelValue': {} },
    modelValue: (__VLS_ctx.modelValue),
    title: (__VLS_ctx.$t('roleManagement.permission.previewTitle', { name: __VLS_ctx.roleName ?? '' })),
    showFooter: (false),
    width: "520px",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    'onUpdate:modelValue': (...[$event]) => {
        __VLS_ctx.emit('update:modelValue', $event);
    }
};
var __VLS_8 = {};
__VLS_3.slots.default;
if (__VLS_ctx.isFetching) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "tw-flex tw-items-center tw-justify-center tw-py-16 tw-text-slate-400" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.i)({
        ...{ class: "fa-solid fa-spinner fa-spin tw-text-2xl" },
    });
}
else if (__VLS_ctx.displayGroups.length) {
    for (const [group] of __VLS_getVForSourceType((__VLS_ctx.displayGroups))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (group.key),
            ...{ class: "form-section" },
        });
        if (group.title) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "form-section__header" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.i)({
                ...{ class: "fa-solid fa-folder-open form-section__icon" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            (group.title);
        }
        for (const [row] of __VLS_getVForSourceType((group.menus))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                key: (row.menu.id),
                ...{ class: "menu-row" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "menu-row__title" },
            });
            (row.menu.title);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "menu-row__tags" },
            });
            if (row.hasView) {
                const __VLS_9 = {}.ElTag;
                /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
                // @ts-ignore
                const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({
                    size: "small",
                    type: "info",
                }));
                const __VLS_11 = __VLS_10({
                    size: "small",
                    type: "info",
                }, ...__VLS_functionalComponentArgsRest(__VLS_10));
                __VLS_12.slots.default;
                (__VLS_ctx.$t("roleManagement.permission.view"));
                var __VLS_12;
            }
            if (row.hasCreate) {
                const __VLS_13 = {}.ElTag;
                /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
                // @ts-ignore
                const __VLS_14 = __VLS_asFunctionalComponent(__VLS_13, new __VLS_13({
                    size: "small",
                    type: "success",
                }));
                const __VLS_15 = __VLS_14({
                    size: "small",
                    type: "success",
                }, ...__VLS_functionalComponentArgsRest(__VLS_14));
                __VLS_16.slots.default;
                (__VLS_ctx.$t("roleManagement.permission.create"));
                var __VLS_16;
            }
            if (row.hasUpdate) {
                const __VLS_17 = {}.ElTag;
                /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
                // @ts-ignore
                const __VLS_18 = __VLS_asFunctionalComponent(__VLS_17, new __VLS_17({
                    size: "small",
                    type: "warning",
                }));
                const __VLS_19 = __VLS_18({
                    size: "small",
                    type: "warning",
                }, ...__VLS_functionalComponentArgsRest(__VLS_18));
                __VLS_20.slots.default;
                (__VLS_ctx.$t("roleManagement.permission.update"));
                var __VLS_20;
            }
            if (row.hasDelete) {
                const __VLS_21 = {}.ElTag;
                /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
                // @ts-ignore
                const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({
                    size: "small",
                    type: "danger",
                }));
                const __VLS_23 = __VLS_22({
                    size: "small",
                    type: "danger",
                }, ...__VLS_functionalComponentArgsRest(__VLS_22));
                __VLS_24.slots.default;
                (__VLS_ctx.$t("roleManagement.permission.delete"));
                var __VLS_24;
            }
        }
    }
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "tw-flex tw-flex-col tw-items-center tw-justify-center tw-py-16 tw-text-slate-400" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.i)({
        ...{ class: "fa-solid fa-shield-halved tw-text-3xl tw-mb-3" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "tw-text-sm" },
    });
    (__VLS_ctx.$t("roleManagement.permission.previewEmpty"));
}
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['tw-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-py-16']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-text-slate-400']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-solid']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-spinner']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-spin']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-text-2xl']} */ ;
/** @type {__VLS_StyleScopedClasses['form-section']} */ ;
/** @type {__VLS_StyleScopedClasses['form-section__header']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-solid']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-folder-open']} */ ;
/** @type {__VLS_StyleScopedClasses['form-section__icon']} */ ;
/** @type {__VLS_StyleScopedClasses['menu-row']} */ ;
/** @type {__VLS_StyleScopedClasses['menu-row__title']} */ ;
/** @type {__VLS_StyleScopedClasses['menu-row__tags']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-py-16']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-text-slate-400']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-solid']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-shield-halved']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-text-3xl']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-text-sm']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            HcDialog: HcDialog,
            emit: emit,
            $t: $t,
            isFetching: isFetching,
            displayGroups: displayGroups,
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
