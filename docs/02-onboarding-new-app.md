# 如何導入一個全新專案（新建 qiankun 子應用）

適用情境：要開一個全新的功能模組（例如「行銷活動管理」、「報表中心」），從頭建立，直接以 qiankun 子應用的形態接進 `project-admin` 這個 host。

以下步驟都以 `apps/system-settings` 作為範本，新專案取名叫 `<new-app>`（實際用你自己的名字取代）。

## 1. 建立子應用專案骨架

在 `apps/<new-app>/` 建立一個標準 Vite + Vue3 + TS 專案（可以直接複製 `apps/system-settings` 的結構再刪改）：

```
apps/<new-app>/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── src/
    ├── public-path.ts
    ├── main.ts
    ├── App.vue
    ├── router/
    └── shared/
        └── host-context.ts
```

## 2. `package.json`：安裝需要的 workspace 套件

```jsonc
{
  "name": "<new-app>",
  "dependencies": {
    "@monorepo/composables": "workspace:*",
    "@monorepo/ui-kit": "workspace:*",
    "@monorepo/types": "workspace:*",
    "@monorepo/utils": "workspace:*",
    "vite-plugin-qiankun": "^...",
  },
}
```

不是每個套件都一定要用，依需求選：要跟其他子應用外觀一致就裝 `ui-kit`；要用 host 傳來的語系/權限就裝 `composables`。

## 3. `vite.config.ts`：加上 qiankun plugin

參考 [apps/system-settings/vite.config.ts](../apps/system-settings/vite.config.ts)：

```ts
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import qiankun from "vite-plugin-qiankun";

const MICRO_APP_NAME = "<new-app>";

export default defineConfig({
  base: process.env.NODE_ENV === "production" ? `/${MICRO_APP_NAME}/` : "/",
  plugins: [vue(), qiankun(MICRO_APP_NAME, { useDevMode: true })],
  server: { port: 8091 }, // 找一個沒被其他 app 佔用的 port
});
```

## 4. `src/public-path.ts`：處理 qiankun 動態 publicPath

直接複製 [apps/system-settings/src/public-path.ts](../apps/system-settings/src/public-path.ts)，這段是固定寫法，不太需要改。

## 5. `src/main.ts`：qiankun 生命週期 + 獨立開發 fallback

參考 [apps/system-settings/src/main.ts](../apps/system-settings/src/main.ts) 的完整寫法，重點結構：

```ts
import "./public-path";
import {
  renderWithQiankun,
  qiankunWindow,
} from "vite-plugin-qiankun/dist/helper";
import { setHostContext } from "./shared/host-context";

function render(props = {}) {
  const container = props.container;
  const mountEl = container
    ? container.querySelector("#app")!
    : document.querySelector("#app")!;
  setHostContext({ ...props }); // 把 host 傳進來的 baseURL/currentUser/role/... 收起來
  const app = createApp(App);
  // app.use(...) / app.provide(I18N_KEY, ...) / app.provide(PERMISSION_KEY, ...)
  app.mount(mountEl);
}

if (qiankunWindow.__POWERED_BY_QIANKUN__) {
  renderWithQiankun({
    bootstrap() {},
    mount(props) {
      render(props);
    },
    unmount() {
      /* app?.unmount() */
    },
    update(props) {
      setHostContext({ ...props });
    },
  });
} else {
  render({/* 假資料，方便獨立開發 */});
}
```

`shared/host-context.ts` 是一個很單純的 module-level 響應式物件（`reactive`），存放 host 傳進來的資料，讓子應用內任何地方都能讀到，不需要自己再串一次 store。

## 6. 子應用內部路由：用「裸路徑」，不要含 host 前綴

子應用自己的 router 就正常寫 `/`, `/foo`, `/bar`，**不要**寫成 `/<new-app>/foo`。host 那邊會用一個 catch-all 路由把 `/<new-app>/*` 轉交進來，子應用完全不用知道自己被掛在哪個路徑底下。

## 7. Host 端要做的三件事

### 7.1 註冊子應用

在 [apps/project-admin/src/micro/apps.config.ts](../apps/project-admin/src/micro/apps.config.ts) 新增一筆：

```ts
{
  name: '<new-app>',
  entry: '//localhost:8091',
  container: '#<new-app>-container',
  activeRule: '/<new-app>',
  get props() {
    const appStore = useAppStore()
    const authStore = useAuthStore()
    return {
      baseURL: import.meta.env.VITE_API_BASE_URL,
      currentUser: appStore.userInfo ? { id: appStore.userInfo.id, name: appStore.userInfo.accountName } : null,
      role: authStore.role,
      accountMenus: appStore.accountMenus,
      locale: appStore.locale,
      $t: appStore.$t,
      setLocale: (locale: string) => appStore.setLocale(locale as 'zh' | 'en'),
    }
  },
}
```

`props` 一定要用 **getter**，不要寫成一般物件屬性 —— 否則值會是模組載入當下（登入完成前）就凍結住的舊快照。

### 7.2 新增容器路由

比照 [apps/project-admin/src/views/SystemSettingsContainer.vue](../apps/project-admin/src/views/SystemSettingsContainer.vue)，建立一個只有一個空 `<div id="<new-app>-container">` 的容器元件，並在 [apps/project-admin/src/router/index.ts](../apps/project-admin/src/router/index.ts) 加一筆容器路由：

```ts
{
  path: '<new-app>/:newAppPath(.*)*',
  name: '<NewApp>',
  component: () => import('@/views/<NewApp>Container.vue'),
  meta: { titleKey: '<newApp>.title', menuGroup: '...' },
},
```

### 7.3 權限守衛要記得去前綴（目前的技術債）

`router/index.ts` 的 `beforeEach` 目前寫死：

```ts
const systemSettingsPrefix = "/system-settings";
const menuCheckPath = to.path.startsWith(systemSettingsPrefix)
  ? to.path.slice(systemSettingsPrefix.length) || null
  : to.path;
```

只處理了 `/system-settings` 這一個前綴。新增第二個子應用時，**這段邏輯一定要一起改**，否則新子應用底下所有頁面的權限選單比對都會失敗（因為比對的是帶前綴的完整路徑，選單資料存的是子應用自己的裸路徑）。建議改成遍歷 `microApps` 清單動態找出符合的 `activeRule` 前綴，而不是每加一個子應用就多寫一個 if。

### 7.4 加選單項目

在 `DefaultLayout.vue` 的選單裡加一個連到 `/<new-app>/...` 的項目。

## 8. 開發期驗證

1. `pnpm --filter <new-app> dev`：先確認子應用可以獨立跑起來（走 fallback 假資料）。
2. `pnpm --filter project-admin dev`：啟動 host，登入後點選單新項目，確認：
   - Network 面板有從 `:8091` 抓到子應用的 entry HTML/JS
   - 對應的容器 `<div>` 裡出現子應用渲染的內容
   - Console 有 `[qiankun] before load / before mount` 的 log（host 端 `registerMicroApps` 的 hook）
   - 切換語系 / 使用者角色時，子應用畫面會跟著變（驗證 `update` 生命週期有正確接住新 props）

## 9. 常見錯誤

- **子應用畫面空白，Console 出現 `Failed to resolve component`**：通常是元件忘記 import（參考本次修過的真實案例：`CategoryFormDialog.vue` 用了 `HcSelect` 但沒 import，導致 `<el-option>` 抓不到 `inject` 的 context 而報錯，跟 qiankun 本身無關，先檢查 import）。
- **子應用的 CSS 影響到 host（或反過來）**：目前 `sandbox: true` 沒有做樣式隔離，看 [01-overview.md](./01-overview.md) 最後一節的「已知的坑」。
- **容器抓不到 / 抓到舊的 DOM**：確認 host 端 `startMicroApps()` 是在 `router.isReady()` + `nextTick()` 之後才呼叫。
