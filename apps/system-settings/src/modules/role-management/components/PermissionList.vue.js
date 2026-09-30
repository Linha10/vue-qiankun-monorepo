import { ref, watch, computed } from "vue";
import { useI18n } from "@monorepo/composables";
import { buildPermissionGroups } from "@monorepo/utils";
const props = defineProps();
const emit = defineEmits();
const { $t } = useI18n();
const CRUD_ACTIONS = ["create", "update", "delete"];
const selected = ref(new Set(props.modelValue));
watch(() => props.modelValue, (val) => {
    selected.value = new Set(val);
});
function emitChange() {
    emit("update:modelValue", [...selected.value]);
}
const groups = computed(() => buildPermissionGroups(props.menuList));
function isChecked(id) {
    return selected.value.has(id);
}
function findBtn(btns, action) {
    return btns.find((b) => b.action === action);
}
// DIR 的檢視權限關閉時，連同群組下所有 MENU / BTN 一併取消勾選並停用
function toggleDirView(group) {
    if (!group.dir)
        return;
    const dirId = group.dir.id;
    if (selected.value.has(dirId)) {
        selected.value.delete(dirId);
        for (const { menu, btns } of group.menus) {
            selected.value.delete(menu.id);
            for (const btn of btns)
                selected.value.delete(btn.id);
        }
    }
    else {
        selected.value.add(dirId);
    }
    emitChange();
}
// MENU 的檢視權限關閉時，連同該列 create/update/delete 一併取消勾選並停用
function toggleMenuView(menu, btns) {
    if (selected.value.has(menu.id)) {
        selected.value.delete(menu.id);
        for (const btn of btns)
            selected.value.delete(btn.id);
    }
    else {
        selected.value.add(menu.id);
    }
    emitChange();
}
function toggleBtn(btn, menu) {
    if (!btn || !selected.value.has(menu.id))
        return;
    if (selected.value.has(btn.id)) {
        selected.value.delete(btn.id);
    }
    else {
        selected.value.add(btn.id);
    }
    emitChange();
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "permission-list tw-border tw-border-slate-200 tw-rounded-lg tw-overflow-hidden" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "tw-grid tw-sticky tw-top-0 tw-z-10 tw-bg-slate-100 tw-text-sm tw-font-medium tw-text-slate-600 tw-py-2" },
    ...{ style: {} },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "tw-pl-4 tw-font-semibold" },
});
(__VLS_ctx.$t("roleManagement.permission.pageColumn"));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "tw-text-center" },
});
(__VLS_ctx.$t("roleManagement.permission.view"));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "tw-text-center" },
});
(__VLS_ctx.$t("roleManagement.permission.create"));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "tw-text-center" },
});
(__VLS_ctx.$t("roleManagement.permission.update"));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "tw-text-center" },
});
(__VLS_ctx.$t("roleManagement.permission.delete"));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "permission-list__body" },
});
for (const [group] of __VLS_getVForSourceType((__VLS_ctx.groups))) {
    (group.dir?.id ?? group.menus[0]?.menu.id);
    if (group.dir) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "tw-grid tw-items-center tw-bg-slate-50 tw-py-2 tw-border-t tw-border-slate-200 tw-transition-colors hover:tw-bg-slate-100" },
            ...{ style: {} },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "tw-pl-4 tw-font-semibold tw-text-slate-700 tw-text-[14px]" },
        });
        (group.dir.title);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "tw-text-center" },
        });
        const __VLS_0 = {}.ElCheckbox;
        /** @type {[typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, ]} */ ;
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
            ...{ 'onChange': {} },
            modelValue: (__VLS_ctx.isChecked(group.dir.id)),
        }));
        const __VLS_2 = __VLS_1({
            ...{ 'onChange': {} },
            modelValue: (__VLS_ctx.isChecked(group.dir.id)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_1));
        let __VLS_4;
        let __VLS_5;
        let __VLS_6;
        const __VLS_7 = {
            onChange: (...[$event]) => {
                if (!(group.dir))
                    return;
                __VLS_ctx.toggleDirView(group);
            }
        };
        var __VLS_3;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "tw-text-center tw-text-slate-300" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "tw-text-center tw-text-slate-300" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "tw-text-center tw-text-slate-300" },
        });
    }
    for (const [{ menu, btns }] of __VLS_getVForSourceType((group.menus))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (menu.id),
            ...{ class: "tw-grid tw-items-center tw-py-2 tw-border-t tw-border-slate-200 tw-transition-colors hover:tw-bg-slate-50" },
            ...{ style: {} },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ([group.dir ? 'tw-pl-8' : 'tw-pl-4', 'tw-text-[14px]']) },
        });
        (menu.title);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "tw-text-center" },
        });
        const __VLS_8 = {}.ElCheckbox;
        /** @type {[typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, ]} */ ;
        // @ts-ignore
        const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
            ...{ 'onChange': {} },
            disabled: ((!!group.dir && !__VLS_ctx.isChecked(group.dir.id)) || menu.id === 77),
            modelValue: (__VLS_ctx.isChecked(menu.id)),
        }));
        const __VLS_10 = __VLS_9({
            ...{ 'onChange': {} },
            disabled: ((!!group.dir && !__VLS_ctx.isChecked(group.dir.id)) || menu.id === 77),
            modelValue: (__VLS_ctx.isChecked(menu.id)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_9));
        let __VLS_12;
        let __VLS_13;
        let __VLS_14;
        const __VLS_15 = {
            onChange: (...[$event]) => {
                __VLS_ctx.toggleMenuView(menu, btns);
            }
        };
        var __VLS_11;
        for (const [action] of __VLS_getVForSourceType((__VLS_ctx.CRUD_ACTIONS))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                key: (action),
                ...{ class: "tw-text-center" },
            });
            if (__VLS_ctx.findBtn(btns, action)) {
                const __VLS_16 = {}.ElCheckbox;
                /** @type {[typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, ]} */ ;
                // @ts-ignore
                const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
                    ...{ 'onChange': {} },
                    modelValue: (__VLS_ctx.isChecked(__VLS_ctx.findBtn(btns, action).id)),
                    disabled: (!__VLS_ctx.isChecked(menu.id)),
                }));
                const __VLS_18 = __VLS_17({
                    ...{ 'onChange': {} },
                    modelValue: (__VLS_ctx.isChecked(__VLS_ctx.findBtn(btns, action).id)),
                    disabled: (!__VLS_ctx.isChecked(menu.id)),
                }, ...__VLS_functionalComponentArgsRest(__VLS_17));
                let __VLS_20;
                let __VLS_21;
                let __VLS_22;
                const __VLS_23 = {
                    onChange: (...[$event]) => {
                        if (!(__VLS_ctx.findBtn(btns, action)))
                            return;
                        __VLS_ctx.toggleBtn(__VLS_ctx.findBtn(btns, action), menu);
                    }
                };
                var __VLS_19;
            }
            else {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: "tw-text-slate-300" },
                });
            }
        }
    }
}
/** @type {__VLS_StyleScopedClasses['permission-list']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-border']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-border-slate-200']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-overflow-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-sticky']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-top-0']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-z-10']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-bg-slate-100']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-text-slate-600']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-pl-4']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['permission-list__body']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-bg-slate-50']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-border-t']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-border-slate-200']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:tw-bg-slate-100']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-pl-4']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-text-slate-700']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-text-[14px]']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-text-slate-300']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-text-slate-300']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-text-slate-300']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-border-t']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-border-slate-200']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:tw-bg-slate-50']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['tw-text-slate-300']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            $t: $t,
            CRUD_ACTIONS: CRUD_ACTIONS,
            groups: groups,
            isChecked: isChecked,
            findBtn: findBtn,
            toggleDirView: toggleDirView,
            toggleMenuView: toggleMenuView,
            toggleBtn: toggleBtn,
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
