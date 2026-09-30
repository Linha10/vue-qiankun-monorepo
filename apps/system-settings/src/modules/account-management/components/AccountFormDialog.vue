<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from "vue";
import { ElMessage } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import { useI18n } from "@monorepo/composables";
import { accManagementApi } from "@/api/accountManagement";
import type { AccountItem, Role } from "@monorepo/types";
import {
  HcDialog,
  HcInput,
  HcSwitch,
  HcSelect,
  HcButton,
} from "@monorepo/ui-kit";
import dayjs from "dayjs";
import ResetPasswordDialog from "./ResetPasswordDialog.vue";

// ── Props / Emits ──────────────────────────────────────────────
const props = defineProps<{
  modelValue: boolean;
  mode: "create" | "view" | "edit";
  accountId: string | null;
  roleOptions: Role[];
}>();

const emit = defineEmits<{
  "update:modelValue": [val: boolean];
  success: [];
}>();

const { $t } = useI18n();

// ── Computed ───────────────────────────────────────────────────
const isViewMode = computed(() => props.mode === "view");
const isCreateMode = computed(() => props.mode === "create");
const isSaving = ref(false);

const dialogTitle = computed(() => {
  if (props.mode === "create") return $t("accountManagement.form.createTitle");
  if (props.mode === "edit") return $t("accountManagement.form.editTitle");
  return $t("accountManagement.form.viewTitle");
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9+\-\s()]{8,20}$/;

// ── 表單 ───────────────────────────────────────────────────────
interface FormData {
  accountName: string;
  email: string;
  phone: string;
  password: string;
  status: 0 | 1;
  roleIds: number[];
}

const defaultForm = (): FormData => ({
  accountName: "",
  email: "",
  phone: "",
  password: "",
  status: 1,
  roleIds: [],
});

function formatDateTime(val: string) {
  return val ? dayjs(val).format("YYYY-MM-DD HH:mm:ss") : "—";
}

const form = reactive<FormData>(defaultForm());

// ── 表單驗證規則 ─────────────────────────────────────────────────
const formRef = ref<FormInstance>();

const rules = computed<FormRules>(() => ({
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
watch(
  () => props.modelValue,
  async (open) => {
    if (!open) return;
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
        const detail = (res as { data: AccountItem })?.data;
        if (!detail) return;

        Object.assign(form, {
          accountName: detail.accountName ?? "",
          email: detail.email ?? "",
          phone: detail.phone ?? "",
          status: detail.status ?? 1,
        });
        loginAt.value = detail.loginAt ?? "";
        loginIp.value = detail.loginIp ?? "";

        const rolesRes = (await accManagementApi.getAccountRoles(
          props.accountId,
        )) as {
          data?: { roleIds?: number[] };
        };
        form.roleIds = rolesRes.data?.roleIds ?? [];
      } catch {
        ElMessage.error($t("accountManagement.messages.fetchError"));
      }
      await nextTick();
      isFormReady.value = true;
    }
  },
);

// ── 送出 ───────────────────────────────────────────────────────
async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;

  isSaving.value = true;
  try {
    if (isCreateMode.value) {
      const createRes = (await accManagementApi.createAccount({
        accountName: form.accountName,
        email: form.email,
        phone: form.phone,
        password: btoa(form.password),
        status: form.status,
      })) as { data?: { id?: string } };
      ElMessage.success(
        $t("messages.createSuccess", { type: $t("accountManagement.title") }),
      );

      const createdId = createRes.data?.id;
      if (createdId) {
        await accManagementApi.updateAccountRoles({
          accountId: createdId,
          roleIds: form.roleIds,
        });
      }
    } else if (props.mode === "edit" && props.accountId) {
      await accManagementApi.updateAcoount(props.accountId, {
        email: form.email,
        phone: form.phone,
        status: form.status,
      });
      await accManagementApi.updateAccountRoles({
        accountId: props.accountId,
        roleIds: form.roleIds,
      });
      ElMessage.success(
        $t("messages.updateSuccess", { type: $t("accountManagement.title") }),
      );
    }

    emit("success");
    emit("update:modelValue", false);
  } catch {
    ElMessage.error(
      isCreateMode.value
        ? $t("messages.createFailed", { type: "" })
        : $t("messages.updateFailed", { type: "" }),
    );
  } finally {
    isSaving.value = false;
  }
}

function handleClose() {
  emit("update:modelValue", false);
}
</script>

<template>
  <HcDialog
    :model-value="modelValue"
    :title="dialogTitle"
    :loading="isSaving"
    :show-footer="!isViewMode"
    width="600px"
    :confirm-text="$t('button.save')"
    :cancel-text="$t('button.cancel')"
    @update:model-value="emit('update:modelValue', $event)"
    @confirm="handleSubmit"
    @cancel="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
      class="tw-flex tw-flex-col tw-gap-4 tw-pt-2"
    >
      <!-- ── Section 1：基本資訊 ─────────────────────────────── -->
      <div class="form-section">
        <div class="form-section__header">
          <i class="fa-solid fa-user form-section__icon" />
          <span>{{ $t("accountManagement.form.sectionInfo") }}</span>
        </div>

        <el-row :gutter="16">
          <!-- 帳號 -->
          <el-col :span="12">
            <el-form-item
              :label="$t('accountManagement.form.accountName')"
              prop="accountName"
            >
              <HcInput
                v-model="form.accountName"
                :disabled="isViewMode || !isCreateMode"
                :placeholder="
                  $t('form.pleaseFill', {
                    field: $t('accountManagement.form.accountName'),
                  })
                "
              />
            </el-form-item>
          </el-col>

          <!-- 啟用狀態 -->
          <el-col :span="12">
            <el-form-item :label="$t('accountManagement.form.status')">
              <HcSwitch
                v-model="form.status"
                :active-value="1 as 1"
                :inactive-value="0 as 0"
                :disabled="isViewMode"
              />
            </el-form-item>
          </el-col>

          <!-- Email -->
          <el-col :span="12">
            <el-form-item
              :label="$t('accountManagement.form.email')"
              prop="email"
            >
              <HcInput
                v-model="form.email"
                :disabled="isViewMode"
                :placeholder="
                  $t('form.pleaseFill', {
                    field: $t('accountManagement.form.email'),
                  })
                "
              />
            </el-form-item>
          </el-col>

          <!-- 電話 -->
          <el-col :span="12">
            <el-form-item
              :label="$t('accountManagement.form.phone')"
              prop="phone"
            >
              <HcInput
                v-model="form.phone"
                :disabled="isViewMode"
                :placeholder="
                  $t('form.pleaseFill', {
                    field: $t('accountManagement.form.phone'),
                  })
                "
              />
            </el-form-item>
          </el-col>

          <!-- 密碼（僅建立模式顯示） -->
          <el-col v-if="isCreateMode" :span="12">
            <el-form-item
              :label="$t('accountManagement.form.password')"
              prop="password"
            >
              <HcInput
                v-model="form.password"
                type="password"
                show-password
                :placeholder="
                  $t('form.pleaseFill', {
                    field: $t('accountManagement.form.password'),
                  })
                "
              />
            </el-form-item>
          </el-col>

          <!-- 重設密碼（僅編輯模式顯示） -->
          <el-col v-if="mode === 'edit'" :span="12">
            <el-form-item
              :label="$t('accountManagement.form.password')"
              class="tw-mb-2"
            >
              <HcButton
                plain
                type="warning"
                @click="resetPasswordVisible = true"
              >
                <i class="fa-solid fa-key tw-mr-1" />
                {{ $t("accountManagement.form.resetPassword") }}
              </HcButton>
            </el-form-item>
          </el-col>

          <!-- 角色（可複選） -->
          <el-col :span="24">
            <el-form-item :label="$t('accountManagement.form.roles')">
              <HcSelect
                v-model="form.roleIds"
                multiple
                collapse-tags
                collapse-tags-tooltip
                :disabled="isViewMode"
                :placeholder="$t('accountManagement.form.rolesPlaceholder')"
                style="width: 100%"
              >
                <el-option
                  v-for="role in roleOptions"
                  :key="role.id"
                  :label="role.roleName"
                  :value="role.id"
                />
              </HcSelect>
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- ── Section 2：登入紀錄（僅 view 模式）─────────────── -->
      <div v-if="isViewMode" class="form-section form-section--last">
        <div class="form-section__header">
          <i class="fa-solid fa-clock-rotate-left form-section__icon" />
          <span>{{ $t("accountManagement.form.sectionLogin") }}</span>
        </div>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item
              :label="$t('accountManagement.form.loginAt')"
              class="tw-mb-2"
            >
              <span>{{ loginAt ? formatDateTime(loginAt) : "—" }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              :label="$t('accountManagement.form.loginIp')"
              class="tw-mb-2"
            >
              <span>{{ loginIp || "—" }}</span>
            </el-form-item>
          </el-col>
        </el-row>
      </div>
    </el-form>

    <ResetPasswordDialog
      v-model="resetPasswordVisible"
      :account-id="accountId"
    />
  </HcDialog>
</template>

<style scoped lang="scss">
@use "@/styles/variables" as *;

.form-section {
  border: 1px solid $color-neutral-200;
  border-radius: 8px;
  padding: 16px;
  background: $color-neutral-0;

  &--last {
    margin-bottom: 0;
  }

  &__header {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 600;
    color: $color-neutral-700;
    margin-bottom: 14px;
    padding-bottom: 10px;
    border-bottom: 1px solid $color-neutral-100;
  }

  &__icon {
    color: $color-primary;
    font-size: 15px;
  }
}
</style>
