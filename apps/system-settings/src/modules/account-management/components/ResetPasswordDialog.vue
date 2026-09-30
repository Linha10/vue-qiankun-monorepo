<script setup lang="ts">
import { ref, watch } from "vue";
import { ElMessage } from "element-plus";
import { useI18n } from "@monorepo/composables";
import { accManagementApi } from "@/api/accountManagement";
import { HcDialog, HcInput } from "@monorepo/ui-kit";

// ── Props / Emits ──────────────────────────────────────────────
const props = defineProps<{
  modelValue: boolean;
  accountId: string | null;
}>();

const emit = defineEmits<{
  "update:modelValue": [val: boolean];
}>();

const { $t } = useI18n();

// ── 表單 ──────────────────────────────────────────────────────
const newPassword = ref("");
const confirmPassword = ref("");
const isSaving = ref(false);

watch(
  () => props.modelValue,
  (open) => {
    if (!open) {
      newPassword.value = "";
      confirmPassword.value = "";
    }
  },
);

// ── 送出 ──────────────────────────────────────────────────────
async function handleConfirm() {
  if (!props.accountId) return;

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
    await accManagementApi.resetAccountPassword(
      props.accountId,
      btoa(newPassword.value),
    );
    ElMessage.success($t("accountManagement.resetPassword.success"));
    emit("update:modelValue", false);
  } catch {
    ElMessage.error($t("messages.updateFailed", { type: "" }));
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
    :title="$t('accountManagement.resetPassword.title')"
    :loading="isSaving"
    width="420px"
    :confirm-text="$t('button.save')"
    :cancel-text="$t('button.cancel')"
    @update:model-value="emit('update:modelValue', $event)"
    @confirm="handleConfirm"
    @cancel="handleClose"
  >
    <el-form label-position="top" class="tw-flex tw-flex-col tw-gap-2">
      <el-form-item
        :label="$t('accountManagement.resetPassword.newPassword')"
        required
      >
        <HcInput
          v-model="newPassword"
          type="password"
          show-password
          :placeholder="
            $t('form.pleaseFill', {
              field: $t('accountManagement.resetPassword.newPassword'),
            })
          "
        />
      </el-form-item>
      <el-form-item
        :label="$t('accountManagement.resetPassword.confirmPassword')"
        required
      >
        <HcInput
          v-model="confirmPassword"
          type="password"
          show-password
          :placeholder="
            $t('form.pleaseFill', {
              field: $t('accountManagement.resetPassword.confirmPassword'),
            })
          "
        />
      </el-form-item>
    </el-form>
  </HcDialog>
</template>
