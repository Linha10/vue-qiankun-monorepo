<script setup lang="ts">
import { reactive } from "vue";

// 預設共用登入畫面：只負責畫面 + 表單資料，實際打 API 的邏輯交給外部
// （呼叫方搭配 @monorepo/request 建立的 instance 自行處理），
// 需要完全客製化登入畫面的專案，可以不引用此元件，自己刻一個即可
// TODO 此登入介面尚未完成, 後續請基於 project-admin 內的 login的layout 進行擴充

withDefaults(
  defineProps<{
    title?: string;
    loading?: boolean;
  }>(),
  {
    title: "登入",
    loading: false,
  },
);

const emit = defineEmits<{
  (e: "submit", payload: { account: string; password: string }): void;
}>();

const form = reactive({
  account: "",
  password: "",
});

function handleSubmit() {
  emit("submit", { account: form.account, password: form.password });
}
</script>

<template>
  <div class="login-root">
    <div class="login-card">
      <slot name="logo" />
      <h2 class="login-title">{{ title }}</h2>

      <slot name="before-form" />

      <el-form :model="form" @submit.prevent="handleSubmit">
        <el-form-item>
          <el-input v-model="form.account" placeholder="帳號" />
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="form.password"
            type="password"
            placeholder="密碼"
            show-password
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            native-type="submit"
            :loading="loading"
            style="width: 100%"
          >
            登入
          </el-button>
        </el-form-item>
      </el-form>

      <slot name="after-form" />
    </div>
  </div>
</template>

<style scoped>
.login-root {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--el-bg-color-page);
}
.login-card {
  width: 360px;
  padding: 32px;
  border-radius: 8px;
  background: var(--el-bg-color);
  box-shadow: var(--el-box-shadow-light);
}
.login-title {
  text-align: center;
  margin-bottom: 24px;
}
</style>
