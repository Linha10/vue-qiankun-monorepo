# 飯店後台管理系統（Vue 3 + qiankun 微前端作品）

> 一個以 **pnpm workspace + Turborepo monorepo** 管理、以 **qiankun** 組成微前端架構的履歷作品。
> 純前端 demo（沒有真實後端），所有 API 都由 **MSW（Mock Service Worker）** 攔截並回傳假資料。

🔗 **Live Demo**：<https://linha10.github.io/vue-qiankun-monorepo/>（部署後請自行確認網址是否一致）

## Demo 帳號

| 帳號    | 密碼       |
| ------- | ---------- |
| `demo`  | `demo123`  |

登入後可以在「系統設定 → 角色管理」調整 **Demo** 這個角色的權限（取消勾選某個頁面或某個新增／編輯／刪除動作），
重新登入 demo 帳號後就能實際體驗「頁面被擋下（403）」「按鈕被 disable」的效果 —— 這是刻意設計的功能，
用來展示這個 RBAC 權限系統是真的有在運作，不是裝飾用的假資料。

## 這個作品展示了什麼

- **Monorepo 工程化**：pnpm workspace + Turborepo，`apps/*` 是可獨立部署的應用，`packages/*` 是跨應用共用的程式庫（UI 元件、composables、型別、工具函式、假資料層）。
- **qiankun 微前端**：`project-admin`（host）在執行期動態載入、掛載 `system-settings`（子應用），兩者各自獨立開發、建置、部署，透過 props 溝通語系／權限／使用者資訊。
- **RBAC 權限系統（真的有在跑）**：選單／按鈕權限由「帳號 → 角色 → 角色的選單綁定」這條資料鏈即時運算，不是前端寫死的開關。
- **假資料層**：`packages/mocks`（MSW + faker）讓這個專案不需要任何真實後端就能完整運作，同時保留了「如果換成真實 API，該怎麼接」的程式碼結構（axios 攔截器、401 自動 refresh、統一錯誤處理）。
- **兩種路由範本**：`/employees` 示範巢狀路由（列表 → 詳情），`/products` 示範扁平路由（列表 + Dialog）。
- **純靜態託管部署**：GitHub Actions 自動 build + 部署到 GitHub Pages，處理了 qiankun 子應用的子路徑 base、SPA 深層連結的 404 fallback 等細節（見下方「部署」章節）。

## 技術棧

- **框架**：Vue 3（`<script setup>` + Composition API）、Vue Router、Pinia
- **微前端**：qiankun（host）、vite-plugin-qiankun（子應用）
- **UI**：Element Plus + 自訂 `Hc*` 元件庫、Tailwind CSS（utility class 搭配少量客製元件樣式）
- **假資料 / Mock**：MSW（Mock Service Worker）、@faker-js/faker
- **建置工具**：Vite、pnpm workspace、Turborepo
- **其他**：TypeScript（嚴格模式）、ESLint、Prettier、@tanstack/vue-query

## 專案結構

```
apps/
├── main-app/            # 最初的 qiankun host 範例骨架（demo 用途，非正式作品）
├── sub-app-example/      # 最初的 qiankun 子應用範例骨架（demo 用途）
├── project-admin/        # ★ 正式作品：host（飯店管理後台）
└── system-settings/       # ★ 正式作品：qiankun 子應用（系統設定：帳號／角色管理）
packages/
├── mocks/                 # MSW handlers + faker 假資料 + 共用 mock DB
├── request/                # 共用 axios 攔截器 factory
├── composables/            # useI18n / usePermission / useCRUD ...
├── ui-kit/                  # 共用 UI 元件（Hc* 系列，包 Element Plus）
├── types/                   # 共用 TypeScript 型別
├── utils/                    # 權限樹整理等工具函式
├── layout-template/           # 可選用的共用 Layout
└── login-template/             # 可選用的共用登入畫面
```

> 📖 更詳細的架構說明、qiankun 掛載機制、如何新增/搬遷子應用，見 [docs/](./docs) 資料夾。

## 本機啟動

```bash
pnpm install
pnpm dev                           # 透過 turbo 平行啟動所有 app 的 dev server
pnpm --filter project-admin dev     # 只啟動正式 host（:3000）
pnpm --filter system-settings dev   # 只啟動正式子應用（:8090）
```

開 <http://localhost:3000>，用 `demo` / `demo123` 登入即可。

`system-settings` 也支援完全獨立開發（不透過 host）：直接開 `:8090`，會自動偵測不在 qiankun 環境下，改用假資料 render。

## 部署（GitHub Pages）

推到 `main` 分支會自動觸發 [.github/workflows/deploy.yml](./.github/workflows/deploy.yml)：

1. 分別 build `project-admin`（host，部署到站台根目錄）與 `system-settings`（子應用，部署到 `/system-settings/` 子目錄）。
2. 兩者都帶入 `GH_PAGES_BASE` 這個環境變數建置，讓 vite 的 `base`、qiankun 的子應用 entry 網址／`activeRule` 都正確對應到 GitHub Pages 的 repo 子路徑（例如 `/vue-qiankun-monorepo/`），而不是寫死根路徑。
3. 補上 GitHub Pages 的 SPA 深層連結 fallback（`public/404.html` + `index.html` 內的還原 script，技術來源：[rafgraph/spa-github-pages](https://github.com/rafgraph/spa-github-pages)），讓使用者直接開啟或重新整理 `/employees/emp-1`、`/system-settings/role-management` 這類深層路徑時不會出現 GitHub Pages 的 404 頁面。

首次啟用：到 repo 的 **Settings → Pages**，Source 選擇 **GitHub Actions** 即可，之後每次 push 到 `main` 都會自動重新部署。

> 這個專案是純前端 demo，MSW 會攔截所有 API 呼叫，所以 GitHub Pages 這種純靜態託管完全足夠，不需要另外架設後端。

## 授權

僅供履歷／作品展示用途。
