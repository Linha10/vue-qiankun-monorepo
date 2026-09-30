<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { Back } from "@element-plus/icons-vue";
import type { FormInstance, FormRules } from "element-plus";
import { useQueryClient } from "@tanstack/vue-query";
import { AccountRole } from "@/api/role";
import { useI18n } from "@monorepo/composables";
import { HcButton, HcRadio, HcInput, HcInputNumber } from "@monorepo/ui-kit";
import PermissionList from "../components/PermissionList.vue";
import { flattenMenuTree } from "@monorepo/utils";
import type { PermissionNode, EnableStatus, CreateRole } from "@monorepo/types";

const route = useRoute();
const router = useRouter();
const queryClient = useQueryClient();
const { $t } = useI18n();

const isEditMode = computed(() => route.name === "RoleManagementEdit");
const roleId = computed(() => route.params.roleId as string);

// ── 表單 ──────────────────────────────────────────────────────
interface RoleFormState {
  roleName: string;
  roleKey: string;
  sort: number;
  status: EnableStatus;
}

const formRef = ref<FormInstance>();
const form = reactive<RoleFormState>({
  roleName: "",
  roleKey: "",
  sort: 0,
  status: 1,
});

const rules = computed<FormRules>(() => ({
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
const menuList = ref<PermissionNode[]>([]);
const selectedMenuIds = ref<number[]>([77]);

const loadMenuTree = async () => {
  try {
    const res = await AccountRole.getMenuTree({ status: 1 as EnableStatus });
    menuList.value = flattenMenuTree((res as any)?.data);
  } catch {
    ElMessage.error($t("roleManagement.form.fetchMenuError"));
  }
};

// ── 載入角色詳細資訊（編輯模式）─────────────────────────────────
const isDetailLoading = ref(false);

const loadDetail = async () => {
  if (!isEditMode.value) return;
  isDetailLoading.value = true;
  try {
    const [roleRes, menuRes] = await Promise.all([
      AccountRole.getSpecificRole(roleId.value),
      AccountRole.getRoleMenu(roleId.value),
    ]);
    const detail = (roleRes as any)?.data;
    if (detail) {
      form.roleName = detail.roleName ?? "";
      form.roleKey = detail.roleKey ?? "";
      form.sort = detail.sort ?? 0;
      form.status = detail.status ?? 1;
    }
    selectedMenuIds.value = ((menuRes as any)?.data ?? []) as number[];
  } catch {
    ElMessage.error($t("roleManagement.form.fetchError"));
  } finally {
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
function extractRoleId(res: unknown): string | undefined {
  const data = (
    res as { data?: { id?: string | number; roleId?: string | number } }
  )?.data;
  const id = data?.id ?? data?.roleId;
  return id === undefined || id === null ? undefined : String(id);
}

const handleSubmit = async () => {
  const isValid = (await formRef.value?.validate().catch(() => false)) ?? true;
  if (!isValid) {
    ElMessage.warning($t("form.checkRequired"));
    nextTick(() => {
      const firstError = document.querySelector<HTMLElement>(
        ".el-form-item.is-error",
      );
      firstError?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    return;
  }

  isSubmitting.value = true;
  try {
    let targetRoleId = roleId.value;

    if (isEditMode.value) {
      await AccountRole.updateSpecificRole({ roleId: roleId.value, ...form });
    } else {
      const res = await AccountRole.createRole(form as CreateRole);
      const createdId = extractRoleId(res);
      if (!createdId) {
        throw new Error(
          "無法從回應取得新建立的角色 id，請檢查 API 實際回應結構",
        );
      }
      targetRoleId = createdId;
    }

    await AccountRole.updateRoleMenu({
      roleId: targetRoleId,
      menuIds: selectedMenuIds.value,
    });

    ElMessage.success(
      isEditMode.value
        ? $t("messages.updateSuccess", { type: $t("roleManagement.title") })
        : $t("messages.createSuccess", { type: $t("roleManagement.title") }),
    );
    await queryClient.invalidateQueries({ queryKey: ["roleList"] });
    router.push("/role-management");
  } catch {
    ElMessage.error(
      isEditMode.value
        ? $t("messages.updateFailed", { type: $t("roleManagement.title") })
        : $t("messages.createFailed", { type: $t("roleManagement.title") }),
    );
  } finally {
    isSubmitting.value = false;
  }
};

const handleCancel = () => {
  router.push("/role-management");
};
</script>

<template>
  <section class="tw-p-6" v-loading="isDetailLoading">
    <!-- 返回按鈕 -->
    <hc-button
      link
      circle
      class="tw-mb-2"
      @click="router.push('/role-management')"
    >
      <el-icon size="32px">
        <Back />
      </el-icon>
    </hc-button>

    <!-- 大標題 -->
    <h1 class="tw-text-2xl tw-font-bold tw-leading-tight tw-mb-6">
      {{
        isEditMode
          ? $t("roleManagement.form.editTitle")
          : $t("roleManagement.form.createTitle")
      }}
    </h1>

    <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
      <!-- ── Section 1：基本資訊 ── -->
      <el-card class="tw-mb-4" shadow="never">
        <template #header>
          <span class="tw-font-medium">{{
            $t("roleManagement.form.sectionInfo")
          }}</span>
        </template>

        <div class="tw-grid tw-grid-cols-2 tw-gap-x-6">
          <el-form-item
            :label="$t('roleManagement.form.roleName')"
            prop="roleName"
          >
            <HcInput
              v-model="form.roleName"
              :placeholder="$t('roleManagement.form.roleName')"
            />
          </el-form-item>
          <el-form-item
            :label="$t('roleManagement.form.roleKey')"
            prop="roleKey"
          >
            <HcInput
              v-model="form.roleKey"
              :placeholder="$t('roleManagement.form.roleKey')"
            />
          </el-form-item>
        </div>

        <div class="tw-grid tw-grid-cols-2 tw-gap-x-6">
          <el-form-item :label="$t('roleManagement.form.sort')" prop="sort">
            <HcInputNumber v-model="form.sort" :min="0" />
          </el-form-item>
          <el-form-item :label="$t('roleManagement.form.status')" prop="status">
            <el-radio-group v-model="form.status">
              <HcRadio :value="1">{{ $t("common.enable") }}</HcRadio>
              <HcRadio :value="0">{{ $t("common.disable") }}</HcRadio>
            </el-radio-group>
          </el-form-item>
        </div>
      </el-card>

      <!-- ── Section 2：權限設定 ── -->
      <el-card class="tw-mb-4" shadow="never">
        <template #header>
          <span class="tw-font-medium">{{
            $t("roleManagement.form.sectionPermission")
          }}</span>
        </template>

        <PermissionList v-model="selectedMenuIds" :menu-list="menuList" />
      </el-card>

      <!-- ── 操作按鈕 ── -->
      <div class="tw-flex tw-gap-3">
        <hc-button type="primary" :loading="isSubmitting" @click="handleSubmit">
          {{ isEditMode ? $t("common.update") : $t("common.create") }}
        </hc-button>
        <hc-button :disabled="isSubmitting" @click="handleCancel">
          {{ $t("common.cancel") }}
        </hc-button>
      </div>
    </el-form>
  </section>
</template>
