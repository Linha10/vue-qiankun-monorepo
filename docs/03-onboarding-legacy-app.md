# 如何導入一個既有／舊專案（改造為 qiankun 子應用）

適用情境：公司已經有一套独立運作的舊系統（可能是 Vue2、Vue3 + Vite、甚至 Nuxt），要把它搬進這個 monorepo，改造成掛在 `project-admin` 底下的 qiankun 子應用。

跟「[全新專案](./02-onboarding-new-app.md)」最大的差異：舊專案通常已經有自己的一套攔截器、Layout、登入頁、i18n、權限邏輯，**不是全部重寫，而是評估哪些可以換成 workspace 共用套件、哪些保留舊專案自己的**。

## 1. 先搬檔案，讓它在 monorepo 裡跑起來（還沒串 qiankun）

1. 把舊專案整包複製進 `apps/<project-name>/`。
2. 補上 / 調整 `package.json`：
   - `name` 改成沒有版本衝突的名字
   - 內部依賴的版本盡量對齊 `pnpm-workspace.yaml` 已有的版本（尤其 `vue`、`element-plus`），避免 pnpm 裝出兩份不同版本互踩
3. `pnpm install` 後先確認舊專案 **獨立** 跑得起來（`pnpm --filter <project-name> dev`），這一步不涉及 qiankun，純粹確認搬移沒搬壞。

## 2. 依框架分流：怎麼讓它變成 qiankun 子應用

### 2.1 Vue3 + Vite（最單純）

直接照 [02-onboarding-new-app.md](./02-onboarding-new-app.md) 第 3~5 步做：裝 `vite-plugin-qiankun`、補 `public-path.ts`、把 `main.ts` 的 `createApp().mount()` 包進 `renderWithQiankun` 的 `bootstrap/mount/unmount/update` 生命週期。

### 2.2 Vue2 / webpack

沒有 `vite-plugin-qiankun` 可用，需要：

- 用 qiankun 官方對 webpack 的建議設定：`output.library` 用 `${name}-[name]`、`output.libraryTarget: 'umd'`、`output.jsonpFunction`（webpack4）或 `output.chunkLoadingGlobal`（webpack5）改成獨立字串，避免跟其他 app 的 webpack runtime 撞名。
- 手動在入口檔案 export `bootstrap` / `mount` / `unmount`（邏輯跟 Vite 版一樣，只是不是用 plugin 自動包，是自己手刻 export）。
- 這類專案目前 repo 裡沒有實例可以參考，改造前建議先用一個非關駵頁面小規模驗證整個流程可行，再逐步搬其他頁面。

### 2.3 Nuxt

- 設定 `ssr: false`（後台系統通常可以接受 SPA 模式，避免處理 SSR + qiankun 沙箱互相干擾的複雜度）。
- Nuxt 沒有官方 qiankun plugin，要在一個 plugin 或 `app.vue` 裡手動判斷 `window.__POWERED_BY_QIANKUN__`，手動包一層 `bootstrap/mount/unmount` 並掛到 `window[\`\${name}\`]` 讓 qiankun 抓得到（實作細節目前 repo 裡沒有現成範例，遇到時再個案處理）。

## 3. 把舊專案「重複造的輪子」換成 workspace 共用套件

這一步不是強制的，依專案現況評估，換掉的好處是之後好維護、跟其他子應用一致，但不是每個都值得換：

| 舊專案裡常見的東西                           | 建議換成                                                                                                                                             | 備註                                                                                                                                    |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| 自己寫的 axios 攔截器（token / 401 refresh） | `@monorepo/request` 的 `createRequest(options)`                                                                                                      | 邏輯（token 帶入、401 refresh、排隊重試、錯誤訊息對照表）完全比照原本寫法，只是把常數改成可注入參數，見根目錄 [README.md](../README.md) |
| 自己刻的 Layout / 側邊選單                   | 視差異程度決定，差異大就不用換，`@monorepo/layout-template` 是 slot-based，可以客製但不是萬用                                                        | 差異太大硬套反而更麻煩                                                                                                                  |
| 自己刻的登入頁                               | 同上，`@monorepo/login-template`                                                                                                                     | 只負責 UI + emit 事件，API 邏輯仍由呼叫方處理                                                                                           |
| 自己刻的 Element Plus 元件外觀 wrapper       | `@monorepo/ui-kit` 的 `Hc*` 系列                                                                                                                     | 要跟 host / 其他子應用視覺一致才需要換；注意這是**共用套件**，改動會影響所有使用者                                                      |
| 自己刻的 i18n / 權限判斷                     | `@monorepo/composables` 的 `useI18n` / `usePermission`，資料來源改吃 host 傳入的 `props`（參考 `system-settings/src/shared/host-context.ts` 的寫法） | 這樣舊專案就不用自己管一份語系檔/權限樹，永遠跟 host 登入後的資料一致                                                                   |
| 寫死的 API baseURL / 環境變數                | 改成從 qiankun `props` 或 `import.meta.env` 注入                                                                                                     | 因為之後同一份子應用程式碼，可能被不同環境的 host 掛載（開發/測試/正式），寫死會出事                                                    |

## 4. 樣式隔離：舊專案通常有大量全域 CSS，要特別小心

新專案通常樣式範圍可控，但舊專案常見「全站 reset.css」「Bootstrap 全域 class」「沒加 scoped 的全域選擇器」，搬進來後：

- 現況 `sandbox: true` **沒有做 CSS 隔離**，子應用的樣式表會直接注入全域 `<head>`，跟 host 共存。
- 舊專案如果有 `* { margin: 0 }`、`.container { ... }` 這類容易撞名的全域規則，搬進來後很可能污染 host 畫面（反之亦然）。
- 處理方式（依嚴重程度選一個）：
  1. **理想**：搬移過程順便把舊專案的全域樣式收斂成 scoped / CSS Module，這樣就不會有跨 app 污染的問題（工作量最大，但最乾淨）。
  2. **折衷**：qiankun `start()` 開 `sandbox: { experimentalStyleIsolation: true }`，qiankun 會自動幫子應用每條 CSS 規則加上一個外層 attribute 選擇器限制作用範圍。副作用：某些依賴「規則要套用到 `html`/`body`」的全域樣式會失效，需要逐一測試。
  3. **最徹底但風險最高**：`sandbox: { strictStyleIsolation: true }`（用 Shadow DOM 包住子應用），能完全隔離，但很多第三方 UI 套件（含 Element Plus 的彈出層，如 Dialog/Select 的 dropdown，預設會 `append-to-body`）在 Shadow DOM 底下會有定位/樣式抓不到的問題，需要額外處理，不建議貿然開啟。
- 不管選哪種，都要注意：**目前 host 的 `apps.config.ts` 是全部子應用共用同一個 `start()` 設定**，改沙箱模式是全域影響所有子應用，不是只影響新搬進來的這一個，動手前要跟現有的 `system-settings` 一起回歸測試。
- 已知真實踩雷案例：`HcTable` 的 fixed 欄位背景色，曾經因為 CSS specificity 打平、輸給後載入的子應用樣式表而消失，修法是覆寫規則加 `!important`，不要依賴 specificity 打平時「誰先載入誰贏」的巧合順序。之後遇到「子應用畫面某個顏色/樣式時好時壞，且好像跟有沒有進過某個子應用有關」的症狀，可以先往這個方向排查。詳見 [packages/ui-kit/src/components/HcTable.vue](../packages/ui-kit/src/components/HcTable.vue)。

## 5. 註冊到 host

跟新專案完全一樣，做 [02-onboarding-new-app.md](./02-onboarding-new-app.md) 第 7 節的三件事：`apps.config.ts` 註冊、host router 加容器路由、權限守衛前綴邏輯記得一起改（目前是技術債，寫死只認 `/system-settings`）、選單加項目。

## 6. 上線前檢查清單

- [ ] 舊專案在 monorepo 裡可以獨立 `pnpm --filter <project-name> dev` 跑起來
- [ ] 攔截器 / baseURL 已改成可注入，不是寫死指向舊環境
- [ ] 掛到 host 底下後，登入態、選單權限、語系切換都正確跟著 host 走（不是子應用自己管一份）
- [ ] 樣式沒有污染 host 既有頁面，反過來 host 樣式也沒有把子應用畫面弄壞（前後各切一次頁面，兩邊都要看）
- [ ] host 的權限守衛前綴邏輯已經涵蓋這個新前綴
- [ ] `apps.config.ts` 的 `props` 是用 getter，不是寫死的物件
