# 專案總覽與導覽

## 這是什麼

pnpm workspace + Turborepo 管理的 monorepo，多個 Vue3 專案透過 [qiankun](https://qiankun.umijs.org/) 組成微前端：一個「主應用（host）」在畫面上留一塊容器 `<div>`，執行期動態載入並掛載其他「子應用（micro app）」的程式碼進去。

## 資料夾結構

```
monorepo/
├── apps/
│   ├── main-app/            # 最初的 qiankun host 範例骨架（demo 用途，見下方說明）
│   ├── sub-app-example/     # 最初的 qiankun 子應用範例骨架（demo 用途）
│   ├── project-admin/       # ★ 目前正式使用的 host（飯店管理後台）
│   └── system-settings/     # ★ 目前正式使用的 qiankun 子應用（系統設定：帳號/角色管理）
├── packages/
│   ├── request/             # 共用 axios 攔截器 factory
│   ├── layout-template/     # 共用 Layout 元件（可選用）
│   ├── login-template/      # 共用登入畫面元件（可選用）
│   ├── composables/         # 共用 composables：useI18n / usePermission / useCRUD / useFormData ...
│   ├── ui-kit/               # 共用 UI 元件庫（Hc* 系列，包 Element Plus）
│   ├── types/                # 共用 TypeScript 型別
│   └── utils/                 # 共用工具函式（權限樹整理、HcMessageBox 等）
├── pnpm-workspace.yaml
├── turbo.json
└── tsconfig.base.json
```

## 重要：目前有「兩組」host/子應用，不要搞混

這個 repo 是從一個 qiankun skeleton 專案演進而來，`main-app` + `sub-app-example` 是**最初的示範骨架**（根目錄 [README.md](../README.md) 描述的就是這一組），port 分別是 `8080` / `8081`，目前主要拿來當作「這套 pattern 長什麼樣子」的參考範例，並非公司正在營運的系統。

**真正在用的正式系統是 `project-admin`（host，`:3000`）+ `system-settings`（子應用，`:8090`）**。之後不管是新增子應用還是搬遷舊專案，都是要接到 `project-admin` 這個 host 底下，不是 `main-app`。

|              | host                   | 子應用                 | port        |
| ------------ | ---------------------- | ---------------------- | ----------- |
| 示範骨架     | `apps/main-app`        | `apps/sub-app-example` | 8080 / 8081 |
| **正式系統** | `apps/project-admin` | `apps/system-settings` | 3000 / 8090 |

## 啟動

```bash
pnpm install
pnpm dev                          # 透過 turbo 平行啟動所有 apps 的 dev
pnpm --filter project-admin dev    # 只啟動正式 host
pnpm --filter system-settings dev # 只啟動正式子應用
```

`system-settings` 也支援完全獨立開發（不透過 host）：直接開 `:8090` 進去，`main.ts` 會偵測 `qiankunWindow.__POWERED_BY_QIANKUN__` 是 `false`，改用假資料 render，方便單獨開發，但這個模式下沒有真實登入態，API 都會失敗（純畫面調整可以用，串資料要透過 host 掛載）。

## qiankun 掛載機制怎麼串起來（以 project-admin + system-settings 為例）

1. **Host 註冊子應用**：[apps/project-admin/src/micro/apps.config.ts](../apps/project-admin/src/micro/apps.config.ts) 定義 `name / entry / container / activeRule`，並用 **getter** 提供 `props`（`baseURL`、`currentUser`、`role`、`accountMenus`、`locale`、`$t`、`setLocale`），確保每次掛載都讀到當下最新的 store 資料，而不是 import 當下的舊快照。
2. **Host 啟動 qiankun**：[apps/project-admin/src/qiankun/index.ts](../apps/project-admin/src/qiankun/index.ts) 呼叫 `registerMicroApps` + `start({ sandbox: true, prefetch: false })`。
3. **啟動時機很關鍵**：[apps/project-admin/src/main.ts](../apps/project-admin/src/main.ts) 要等 `app.mount('#app')` → `await router.isReady()` → `await nextTick()` 都跑完才呼叫 `startMicroApps()`。這是為了確保 host 自己的路由/容器 DOM 已經穩定渲染完成，才讓 qiankun 去 `document.querySelector` 抓容器，避免抓錯或搶跑。
4. **Host 路由**：子應用的頁面在 host router 裡只留一個「容器路由」（[apps/project-admin/src/router/index.ts](../apps/project-admin/src/router/index.ts) 的 `system-settings/:systemSettingsPath(.*)*`），實際渲染是 [SystemSettingsContainer.vue](../apps/project-admin/src/views/SystemSettingsContainer.vue) 裡的一個空 `<div id="system-settings-container">`，真正的頁面內容、路由切換都是子應用自己的 router 在管。
5. **子應用生命週期**：[apps/system-settings/src/main.ts](../apps/system-settings/src/main.ts) 用 `vite-plugin-qiankun` 的 `renderWithQiankun` 註冊 `bootstrap / mount / unmount / update`，`mount` 時把 host 傳入的 `props` 收進 `setHostContext()`（[shared/host-context.ts](../apps/system-settings/src/shared/host-context.ts)），並用 `@monorepo/composables` 的 `I18N_KEY` / `PERMISSION_KEY` provide 給子應用內所有元件的 `useI18n()` / `usePermission()` 用 —— 子應用自己不擁有語系/權限資料，全部吃 host 傳進來的。
6. **`update` 生命週期**：host 之後若重新傳入新 `props`（切換使用者、切換語系），子應用的 `update()` 會被呼叫，重新 `setHostContext()`，不需要整個子應用重新掛載。

## packages/* 共用套件

- **`@monorepo/request`**：`createRequest(options)` factory，把 token 帶入、401 refresh、排隊重試、錯誤訊息對照表包好，每個 app 自己 new 一份 instance（因為各自 baseURL 不同）。
- **`@monorepo/composables`**：`useI18n`、`usePermission`、`useCRUD`、`useFormData`、`useWeekDays`、`createPermissionChecker`，以及 `I18N_KEY` / `PERMISSION_KEY` 這兩把 provide/inject key（host 和子應用透過同一把 key 互通語系/權限 context）。
- **`@monorepo/ui-kit`**：`Hc*` 系列元件（`HcButton`、`HcTable`、`HcSelect`、`HcDialog`...），包一層 Element Plus，讓 host 跟所有子應用視覺風格一致。**修改這裡的元件會同時影響 host 和所有子應用**，改動前要注意。
- **`@monorepo/types`**：共用 TS 型別（`PermissionNode`、分頁型別、狀態 enum 等）。
- **`@monorepo/utils`**：`flattenMenuTree`（權限樹整理）、`HcMessageBox` 等工具函式。
- **`@monorepo/layout-template` / `@monorepo/login-template`**：預設可用的 Layout / 登入畫面，透過 slot 客製；差異太大的專案不強制繼承，自己刻一份也可以。

## 已知的坑（踩過的雷，之後遇到類似症狀可以先想到這裡）

- **`sandbox: true` 只隔離 JS，沒有做 CSS 隔離**：子應用掛載時，它自己的 CSS（例如 Element Plus 的樣式表）會直接注入到全域 `<head>`，跟 host 既有的樣式表共存，順序上通常會晚於 host 原本就載入的樣式。這代表：如果 `@monorepo/ui-kit` 的元件要覆寫 Element Plus 內部某個「跟狀態相關」的 class（例如 `is-scrolling-none` 這種捲動狀態 class），一旦 CSS specificity 跟 Element Plus 自己的規則打平，**誰贏純粹看載入順序**，而載入順序會因為子應用有沒有掛載過而改變 —— 實際案例是 `HcTable` 的 fixed（sticky）欄位背景色，曾經因為這樣被 Element Plus 自己的規則蓋掉。解法是覆寫規則直接加 `!important`，不要依賴 specificity 打平時的巧合順序。詳見 [packages/ui-kit/src/components/HcTable.vue](../packages/ui-kit/src/components/HcTable.vue) 裡的註解。
- **子應用的路由前綴要自己在 host 的權限守衛裡處理**：`router/index.ts` 的 `beforeEach` 目前寫死只處理 `/system-settings` 這一個前綴（把它去掉才能跟權限選單的裸路徑比對）。之後如果要加第二個、第三個子應用，這段要抽成通用邏輯（例如遍歷 `microApps` 清單找出符合的 `activeRule` 前綴），目前算是一筆技術債，見 [02-onboarding-new-app.md](./02-onboarding-new-app.md) 的提醒。
