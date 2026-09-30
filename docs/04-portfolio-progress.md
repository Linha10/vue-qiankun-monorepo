# 履歷／面試作品化改造進度紀錄

紀錄「把 `project-admin`（舊專案）+ `system-settings` 改造成可公開展示的履歷作品」這件事目前做到哪、還剩什麼。之後在家繼續做 CI/CD、docs、樣式精修時，可以先看這份文件對齊狀態。

## 目標

- 保留 monorepo + qiankun micro-frontend 的框架與工程能力展示。
- 移除公司真實 API／機敏資訊，改用假資料（MSW + faker）。
- `project-admin` 保留兩種路由範本（巢狀路由 `/employees`、扁平路由 `/products`）+ 嵌入 `system-settings` 子應用，兩個範本 view 從簡。
- `system-settings` 資料改用 mock/static data。

## 已完成項目

- **Git / 環境**
  - Git 初始化、`.gitignore` 檢查。
  - `Dockerfile-aws` 通用化，清除公司內部殘留設定。
  - `project-admin` 清理 `.env` 與 vite proxy 內的真實公司網域。
- **假資料層**
  - 新建 `packages/mocks` 共用套件：`createMockDb` + faker 假資料 + MSW handlers（employees / products / accounts / roles / menu）。
  - `project-admin`、`system-settings` 都安裝並串接 MSW（`packages/mocks/src/browser.ts` 統一啟動）。
- **project-admin 功能改造**
  - `auth` store 改為 `demo` / `demo123` 假登入驗證。
  - `DefaultLayout` 選單改由 router meta 驅動（不再寫死選單項目）。
  - 新增 `/employees`（巢狀路由：列表 → 詳情）示範模組。
  - 新增 `/products`（扁平路由：列表 + 新增/編輯 Dialog）示範模組。
  - Dashboard 改成精簡版假統計首頁（員工數／商品數／部門分布等）。
  - `router.ts` 移除所有舊業務路由，只留 Dashboard、Employees、Products、System Settings 入口。
- **兩個 app 的環境判斷**：vite `base` 與 `apps.config` 的子應用 entry 改為依環境變數判斷，不寫死正式環境網址。
- **TypeScript build 全面修正**：`pnpm -w build` 4/4 全數通過，零錯誤。
  - 主要根因：`packages/ui-kit` 的 `HcTable.vue` 使用動態 slot name，導致所有表格元件的 scoped-slot `scope` 型別退化成預設 `DefaultRow`。修法是在各表格元件呼叫點加上局部 `asXxx(row: unknown): SpecificType` cast helper（`EmployeeTable`、`ProductTable`、`FacilityTable`、`PromotionTable`、`CategoryTable`、`OrderTable`、shop 版 `ProductTable` 共 7 處）。
  - 其餘零星修正：`facilities.ts` 的 `ApiResponse` import 來源、`request.ts` 死代碼移除、`HcImageGallery.vue` 過期匯入路徑、`PromotionFormDialog.vue` 缺少 `.value`、`system-settings/tsconfig.json` 缺 `vite/client` types、清除 `system-settings/src` 內大量誤產生的編譯 `.js` 殘留檔。
- **端對端手動驗證（瀏覽器實測，非僅編譯通過）**
  - Dashboard 假統計資料正常渲染。
  - Employees 列表／詳情頁導覽正常，資料為真實 mock 資料。
  - Products 列表 + 新增商品 Dialog 可正常開啟與輸入。
  - 側邊選單完全由 router meta 驅動，項目正確。
  - qiankun 內嵌 `system-settings`（帳號管理、角色管理頁）正常掛載渲染，無 console 錯誤。
  - 順手修正一個小 bug：`EmployeeTable`／`ProductTable` 補上 `row-key`，`handleStatusChange` 加上 `!row?.id` 防護，避免 `HcSwitch` 掛載時偶發送出無意義的 `PUT .../undefined` 請求。

## 尚未執行項目（下一步，預計在家繼續）

1. **GitHub Actions 部署 workflow**
   - 建立 build + deploy 到 GitHub Pages（或其他靜態託管）的 workflow。
   - 需處理 `project-admin` + `system-settings` 兩個 app 的 base path／子應用 entry 環境變數（`GH_PAGES_BASE` 之類）。
   - qiankun 子應用需要 SPA fallback（`404.html` 導回 `index.html`），部署到 GitHub Pages 時要一併設定。
2. **docs / README 更新**
   - 根目錄 `README.md` 需要補上這個作品專案的說明（demo 帳密 `demo` / `demo123`、功能導覽、技術棧說明、live demo 連結）。
   - 視情況更新 `docs/01-overview.md` 反映目前 `project-admin` 已移除舊業務邏輯的現況。
3. **樣式精修**
   - 目前 view 都是「從簡」版本，尚未特別打磨 UI 細節／RWD／留白間距等，之後可依履歷展示需求調整視覺。
   - `HcSwitch` 在元件掛載時會出現一個 Element Plus 的 console warning（`model-value must be active-value or inactive-value`），目前已確認是無害的（不會觸發多餘 API 呼叫），但尚未根治，之後如有時間可再深入排查或忽略。

## 環境備忘

- 啟動 dev server 前，若 vite 回報 port 被佔用而自動跳號，記得先用 `Get-NetTCPConnection -LocalPort <port> -State Listen` 找出殘留 process 並 kill 掉，再重新啟動，確保跑在預期 port（qiankun entry URL 依賴固定 port）。
- `vue-tsc -b`（build 用的 composite/project-reference 模式）比 `vue-tsc --noEmit` 或編輯器內的即時檢查嚴格很多，最終要以 `pnpm build` 的結果為準。
