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
- **角色管理權限系統實際接上真實資料**
  - 新建 `Demo` 角色（預設開啟全部權限），demo 帳號改指派這個角色，不再寫死放進 admin 白名單略過檢查。
  - `GET /v1/menus/account-tree` 改成依「帳號 → 角色 → 角色的選單綁定」即時運算遮罩後的選單樹，角色管理調整的權限會真的影響 demo 帳號登入後的體驗（頁面被擋 403 / 按鈕被 disable）。
  - 員工管理／商品管理的選單結構從 DIR+MENU 兩層扁平化成單一 MENU 直接掛 CRUD；修正 `canAccessMenu` 判斷深層詳情頁（如 `/employees/:id`）會被誤擋的 bug；CRUD 按鈕沒權限時改成 disabled 而非整個隱藏。
  - 系統管理員角色的刪除按鈕前後端都加了保護，無法被刪除。
- **GitHub Pages 部署**
  - 新增 [.github/workflows/deploy.yml](../.github/workflows/deploy.yml)：push 到 `main` 自動 build 兩個 app + 部署到 GitHub Pages。
  - 過程中找到並修正兩個「只有部署到 repo 子路徑才會爆」的 bug（本機 / Docker 因為都在網域根目錄，一直沒踩到）：
    1. `system-settings` 自己的 vue-router history base 原本寫死 `'/system-settings/'`，沒考慮 GitHub Pages 的 repo 子路徑前綴；改成依 `import.meta.env.PROD` 決定要用 `import.meta.env.BASE_URL`（正式建置）還是沿用原本的 dev 判斷。
    2. `apps.config.ts` 的 qiankun `activeRule: '/system-settings'` 是拿去跟瀏覽器「完整」的 `location.pathname` 比對，同樣沒有加上 repo 子路徑前綴，導致子應用在 GitHub Pages 上完全掛載不起來（`[qiankun] You need to export lifecycle functions`，其實是抓到 404 fallback 頁面的內容）；改成用 host 自己的 `BASE_URL` 動態組出完整前綴。
  - `LoginView.vue` 背景圖原本放 `public/hotel-bg.jpg` 用絕對路徑 `url('/hotel-bg.jpg')` 引用，部署到子路徑會抓錯路徑；搬到 `src/assets/` 改用 `@` alias 走正常的 Vite asset pipeline（自動處理 base + hash）。
  - 補上 GitHub Pages 的 SPA 深層連結 fallback：`public/404.html`（編碼目前路徑並導回根目錄）+ `index.html` 內對應的還原 script（技術來源：[rafgraph/spa-github-pages](https://github.com/rafgraph/spa-github-pages)）。
  - 驗證方式：本機用一支小型 Node 靜態伺服器模擬「serve 在 `/vue-qiankun-monorepo/` 子路徑 + 對不到檔案一律回 404.html」的 GitHub Pages 行為，實際跑過登入、qiankun 掛載 `system-settings`、深層路徑直接開啟/重新整理（`/employees/emp-1`、`/system-settings/role-management/edit/1`）等情境，確認都正常後才視為完成（模擬用的腳本驗證完就刪除，不是專案的一部分）。
- **README**：根目錄 `README.md` 補上作品說明（demo 帳密、功能導覽、技術棧、部署方式、live demo 連結）。

## 尚未執行項目（下一步，預計在家繼續）

1. **視情況更新 `docs/01-overview.md`**：反映目前 `project-admin` 已移除舊業務邏輯、角色管理權限系統已經真的接上資料的現況。
2. **樣式精修**
   - 目前 view 都是「從簡」版本，尚未特別打磨 UI 細節／RWD／留白間距等，之後可依履歷展示需求調整視覺。
   - `HcSwitch` 在元件掛載時會出現一個 Element Plus 的 console warning（`model-value must be active-value or inactive-value`），目前已確認是無害的（不會觸發多餘 API 呼叫），但尚未根治，之後如有時間可再深入排查或忽略。

## 環境備忘

- 啟動 dev server 前，若 vite 回報 port 被佔用而自動跳號，記得先用 `Get-NetTCPConnection -LocalPort <port> -State Listen` 找出殘留 process 並 kill 掉，再重新啟動，確保跑在預期 port（qiankun entry URL 依賴固定 port）。
- `vue-tsc -b`（build 用的 composite/project-reference 模式）比 `vue-tsc --noEmit` 或編輯器內的即時檢查嚴格很多，最終要以 `pnpm build` 的結果為準。
