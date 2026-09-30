import { createRouter, createWebHistory } from "vue-router";
import { qiankunWindow } from "vite-plugin-qiankun/dist/helper";

// qiankun 子應用掛載在 /system-settings 這個路徑下，base 要跟著調整，
// 獨立開發模式（未被 qiankun 載入）則用一般的 '/'
// 注意：這裡要用 vite-plugin-qiankun 提供的 qiankunWindow，不能直接用原生 window，
// dev 模式下原生 window.__POWERED_BY_QIANKUN__ 在這個模組執行當下還沒被設定好
const router = createRouter({
  history: createWebHistory(
    qiankunWindow.__POWERED_BY_QIANKUN__ ? "/system-settings/" : "/",
  ),
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
