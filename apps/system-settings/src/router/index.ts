import { createRouter, createWebHistory } from "vue-router";
import { qiankunWindow } from "vite-plugin-qiankun/dist/helper";

// history base 依情境決定：
// - 正式建置（import.meta.env.PROD）：直接用 vite.config.ts 算好的 BASE_URL，
//   已經涵蓋 Docker（'/system-settings/'）跟 GitHub Pages 子路徑
//   （'/<repo>/system-settings/'）兩種情況，不可以寫死字串，否則 GitHub Pages
//   部署時少了 repo 前綴，會跟瀏覽器實際路徑對不上。
// - dev 模式：獨立開發（未被 qiankun 載入）用 '/'；被 project-admin host 用 qiankun
//   掛載時，瀏覽器網址列走的是 host dev server 自己的路徑前綴 '/system-settings/'，
//   這時 BASE_URL 仍是 '/'（dev 模式不會套用 GH_PAGES_BASE），所以要另外處理。
//   注意：這裡要用 vite-plugin-qiankun 提供的 qiankunWindow，不能直接用原生 window，
//   dev 模式下原生 window.__POWERED_BY_QIANKUN__ 在這個模組執行當下還沒被設定好。
function resolveHistoryBase(): string {
  if (import.meta.env.PROD) return import.meta.env.BASE_URL;
  return qiankunWindow.__POWERED_BY_QIANKUN__ ? "/system-settings/" : "/";
}

const router = createRouter({
  history: createWebHistory(resolveHistoryBase()),
  routes: [
    {
      path: "/",
      name: "Home",
      component: () => import("@/views/HomeView.vue"),
    },
    {
      path: "/account-management",
      name: "AccountManagement",
      component: () =>
        import("@/modules/account-management/views/AccountManagement.vue"),
    },
    {
      path: "/account-management/login-logs",
      name: "LoginLogs",
      component: () =>
        import("@/modules/account-management/views/LoginLogsView.vue"),
    },
    {
      path: "/account-management/action-logs",
      name: "AccountActionLogs",
      component: () =>
        import("@/modules/account-management/views/AccountActionLogsView.vue"),
    },
    {
      path: "/role-management",
      name: "RoleManagement",
      component: () =>
        import("@/modules/role-management/views/RoleManagementView.vue"),
    },
    {
      path: "/role-management/create",
      name: "RoleManagementCreate",
      component: () =>
        import("@/modules/role-management/views/RoleFormView.vue"),
    },
    {
      path: "/role-management/edit/:roleId",
      name: "RoleManagementEdit",
      component: () =>
        import("@/modules/role-management/views/RoleFormView.vue"),
    },
  ],
});

export default router;
