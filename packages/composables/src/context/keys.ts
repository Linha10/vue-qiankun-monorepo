import type { InjectionKey, Ref } from 'vue'

// ── i18n context ──────────────────────────────────────────────
// 誰掛載這個 app（舊專案自己，或 system-settings 這種被掛載的子應用），
// 就在自己的 app 根部呼叫一次 app.provide(I18N_KEY, ...)，
// 底下所有元件呼叫 useI18n() 完全不用知道資料是從哪來的
export interface I18nContext {
  $t: (key: string, params?: Record<string, unknown>) => string
  locale: Ref<string>
  setLocale: (locale: string) => void
}
export const I18N_KEY: InjectionKey<I18nContext> = Symbol('i18n-context')

// ── permission context ────────────────────────────────────────
export interface PermissionContext {
  role: Ref<'admin' | 'user'>
  isAdmin: Ref<boolean>
  canAccessMenu: (path: string) => boolean
  canPerformAction: (url: string, action: 'create' | 'update' | 'delete') => boolean
}
export const PERMISSION_KEY: InjectionKey<PermissionContext> = Symbol('permission-context')
