<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { ArrowDown, Refresh } from '@element-plus/icons-vue'
import { Icon } from '@iconify/vue'
import { useI18n } from '@monorepo/composables'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import { authApi } from '@/api/auth'
import type { LoginParams, CaptchaResponse } from '@/types/api-params'

const { $t, setLocale } = useI18n()
const appStore = useAppStore()
const authStore = useAuthStore()

const formRef = ref<FormInstance>()
const isLoading = ref(false)
const captchaImg = ref('')
const captchaId = ref('')

const form = reactive({
  accountName: '',
  password: '',
  captcha: '',
})

const rules: FormRules = {
  accountName: [{ required: true, message: $t('auth.accountNamePlaceholder'), trigger: 'blur' }],
  password: [{ required: true, message: $t('auth.passwordPlaceholder'), trigger: 'blur' }],
  captcha: [{ required: true, message: $t('auth.captchaPlaceholder'), trigger: 'blur' }],
}

async function fetchCaptcha() {
  try {
    const { data }: { data: CaptchaResponse } = await authApi.getCaptcha()
    captchaImg.value = data.picPath
    captchaId.value = data.captchaId ?? ''
    form.captcha = ''
  } catch {}
}

onMounted(() => {
  const hint = sessionStorage.getItem('loginHint')
  if (hint) {
    ElMessage.warning(hint)
    sessionStorage.removeItem('loginHint')
  }
  fetchCaptcha()
})

async function handleLogin() {
  if (!formRef.value) return
  await formRef.value.validate(async valid => {
    if (!valid) return
    isLoading.value = true
    const params: LoginParams = {
      accountName: form.accountName,
      password: btoa(form.password),
      captcha: form.captcha,
      captchaId: captchaId.value,
    }
    await authStore.login(params)
    isLoading.value = false
  })
}
</script>

<template>
  <div class="login-root">
    <!-- 左側品牌區 -->
    <div class="login-brand">
      <div class="login-brand__overlay" />
      <div class="login-brand__content">
        <div class="login-brand__logo">PROJECT</div>
        <h1 class="login-brand__title">{{ $t('auth.systemTitle') }}</h1>
        <p class="login-brand__subtitle">{{ $t('auth.loginTip') }}</p>
        <div class="login-brand__divider" />
        <p class="login-brand__tagline">{{ $t('auth.tagline') }}</p>
      </div>
    </div>

    <!-- 右側表單區 -->
    <div class="login-form-panel">
      <div class="login-form-wrap">
        <!-- 語系切換 -->
        <el-dropdown class="locale-dropdown" trigger="click" @command="setLocale">
          <div class="locale-trigger">
            <el-icon><Icon icon="mdi:translate" /></el-icon>
            <span>{{ appStore.locale === 'zh' ? '中文' : 'English' }}</span>
            <el-icon class="tw-text-xs"><ArrowDown /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="zh" :class="{ 'is-active': appStore.locale === 'zh' }">
                中文
              </el-dropdown-item>
              <el-dropdown-item command="en" :class="{ 'is-active': appStore.locale === 'en' }">
                English
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <!-- 頂部 logo（小螢幕顯示） -->
        <div class="login-form-wrap__mobile-header">
          <span class="login-form-wrap__mobile-logo">R</span>
          <span>{{ $t('auth.systemTitle') }}</span>
        </div>

        <h2 class="login-form-wrap__heading">{{ $t('auth.welcome') }}</h2>
        <p class="login-form-wrap__sub">{{ $t('auth.loginSubtip') }}</p>

        <div class="demo-hint">
          {{ $t('auth.demoHint', { account: 'demo', password: 'demo123' }) }}
        </div>

        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-position="top"
          class="login-el-form"
          @keyup.enter="handleLogin"
        >
          <el-form-item :label="$t('auth.accountName')" prop="accountName">
            <el-input
              v-model="form.accountName"
              size="large"
              :placeholder="$t('auth.accountNamePlaceholder')"
            />
          </el-form-item>

          <el-form-item :label="$t('auth.password')" prop="password">
            <el-input
              v-model="form.password"
              type="password"
              size="large"
              :placeholder="$t('auth.passwordPlaceholder')"
              show-password
            />
          </el-form-item>

          <el-form-item :label="$t('auth.captcha')" prop="captcha">
            <div class="tw-flex tw-gap-3 tw-w-full tw-items-center">
              <el-input
                v-model="form.captcha"
                size="large"
                :placeholder="$t('auth.captchaPlaceholder')"
                class="tw-flex-1"
              />
              <div
                class="captcha-img-wrap"
                @click="fetchCaptcha"
                :title="$t('auth.refreshCaptcha')"
              >
                <img
                  v-if="captchaImg"
                  :src="captchaImg"
                  :alt="$t('auth.refreshCaptcha')"
                  class="captcha-img"
                />
                <div v-else class="captcha-placeholder">
                  <el-icon><Refresh /></el-icon>
                </div>
              </div>
            </div>
          </el-form-item>

          <el-button
            type="primary"
            size="large"
            class="login-btn"
            :loading="isLoading"
            @click="handleLogin"
          >
            {{ $t('auth.login') }}
          </el-button>
        </el-form>

        <p class="login-footer">© {{ new Date().getFullYear() }} {{ $t('auth.systemTitle') }}</p>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* ── 整體佈局 ───────────────────────────────── */
.login-root {
  display: flex;
  min-height: 100vh;
  width: 100%;
}

/* ── 左側品牌區 ─────────────────────────────── */
.login-brand {
  position: relative;
  display: none;
  flex: 1;
  // 用 Vite 的 @ alias 讓這張圖走正常的 asset pipeline（進 src/assets 而非 public/）：
  // 這樣打包時會被處理成帶 hash 的檔名，並且自動套用正確的 base（含 GitHub Pages 的 repo 子路徑）。
  // 直接寫 url('/hotel-bg.jpg') 這種指向 public/ 的絕對路徑，Vite 不會幫忙轉換 base，
  // 部署到 GitHub Pages 這種非根路徑的環境時圖片會抓錯路徑。
  background: url('@/assets/hotel-bg.jpg') center / cover no-repeat;
}

@media (min-width: 1024px) {
  .login-brand {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.login-brand__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(160deg, rgba(30, 15, 5, 0.55) 0%, rgba(80, 40, 10, 0.45) 100%);
}

.login-brand__content {
  position: relative;
  z-index: 1;
  text-align: center;
  color: #fff;
  padding: 2rem;
}

.login-brand__logo {
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.35em;
  color: #d4a563;
  margin-bottom: 1.5rem;
  text-transform: uppercase;
}

.login-brand__title {
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

.login-brand__subtitle {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.75);
  margin-bottom: 2rem;
}

.login-brand__divider {
  width: 48px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #d4a563, transparent);
  margin: 0 auto 1.5rem;
}

/* ── 右側表單區 ─────────────────────────────── */
.login-form-panel {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  background: #fafaf8;
  padding: 2rem 1.5rem;
}

@media (min-width: 1024px) {
  .login-form-panel {
    width: 480px;
    flex-shrink: 0;
    padding: 3rem 3.5rem;
  }
}

.login-form-wrap {
  width: 100%;
  max-width: 400px;
}

.login-form-wrap__mobile-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: #3d1f00;
  margin-bottom: 2.5rem;
}

.login-form-wrap__mobile-logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, #8b4513, #c07030);
  color: #fff;
  font-size: 0.875rem;
  font-weight: 800;
  letter-spacing: 0.05em;
}

@media (min-width: 1024px) {
  .login-form-wrap__mobile-header {
    display: none;
  }
}

.login-form-wrap__heading {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1a0a00;
  margin-bottom: 0.375rem;
}

.login-form-wrap__sub {
  font-size: 0.9rem;
  color: #9a8070;
  margin-bottom: 1rem;
}

.demo-hint {
  font-size: 0.8125rem;
  color: #8b4513;
  background: rgba(192, 112, 48, 0.1);
  border: 1px solid rgba(139, 69, 19, 0.25);
  border-radius: 8px;
  padding: 0.625rem 0.875rem;
  margin-bottom: 1.5rem;
}

/* ── Element Plus 表單客製化 ─────────────────── */
.login-el-form :deep(.el-form-item__label) {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #4a3020;
  letter-spacing: 0.02em;
}

.login-el-form :deep(.el-input__wrapper) {
  border-radius: 10px;
  box-shadow: 0 0 0 1px #e0d4c8;
  transition: box-shadow 0.2s;
  background: #fff;
}

.login-el-form :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #c09060;
}

.login-el-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px #c09060;
}

/* ── 驗證碼 ──────────────────────────────────── */
.captcha-img-wrap {
  width: 110px;
  height: 40px;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #e0d4c8;
  cursor: pointer;
  flex-shrink: 0;
  background: #f5f0eb;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.2s;
}

.captcha-img-wrap:hover {
  border-color: #c09060;
}

.captcha-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.captcha-placeholder {
  color: #9a8070;
  font-size: 1.25rem;
}

/* ── 語系切換 ─────────────────────────────────── */
.locale-dropdown {
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
}

.locale-trigger {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: auto;
  width: 60px;
  height: 24px;
  border-radius: 20px;
  border: 1px solid #e0d4c8;
  background: #fff;
  color: #6b4a2a;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition:
    border-color 0.2s,
    background 0.2s,
    color 0.2s;
  outline: none;
}

.locale-trigger:hover {
  border-color: #c09060;
  background: #fdf6ef;
  color: #8b4513;
}

:deep(.el-dropdown-item.is-active) {
  color: #8b4513;
  font-weight: 600;
}

/* ── 登入按鈕 ─────────────────────────────────── */
.login-btn {
  width: 100%;
  margin-top: 0.5rem;
  border-radius: 10px !important;
  background: linear-gradient(135deg, #8b4513 0%, #c07030 100%) !important;
  border: none !important;
  font-size: 1rem !important;
  font-weight: 600 !important;
  letter-spacing: 0.04em;
  box-shadow: 0 4px 16px rgba(139, 69, 19, 0.35) !important;
  transition:
    opacity 0.2s,
    transform 0.15s !important;
}

.login-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.login-btn:active {
  transform: translateY(0);
}

/* ── 底部版權 ─────────────────────────────────── */
.login-footer {
  margin-top: 2.5rem;
  text-align: center;
  font-size: 0.75rem;
  color: #c0b0a0;
}
</style>
