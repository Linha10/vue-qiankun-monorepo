import { createRouter, createWebHistory } from 'vue-router'
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import { createPermissionChecker } from '@monorepo/composables'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('@/layouts/DefaultLayout.vue'),
      redirect: '/dashboard',
      meta: { requiresAuth: true },
      children: [
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: () => import('@/modules/dashboard/views/DashboardHomeView.vue'),
          meta: { titleKey: 'common.dashboard', menuIcon: 'solar:widget-5-bold-duotone' },
        },
        {
          // 巢狀路由範本：/employees 為父層容器（自己不畫 UI，只放 <router-view/>），
          // 底下掛列表（空路徑子路由）跟詳情（:id）兩個子頁面
          path: 'employees',
          name: 'Employees',
          component: () => import('@/modules/employees/views/EmployeesLayout.vue'),
          meta: { titleKey: 'employees.title', menuIcon: 'solar:users-group-rounded-bold-duotone' },
          children: [
            {
              path: '',
              name: 'EmployeeList',
              component: () => import('@/modules/employees/views/EmployeeListView.vue'),
              meta: { titleKey: 'employees.title', menuUrl: '/employees' },
            },
            {
              path: ':id',
              name: 'EmployeeDetail',
              component: () => import('@/modules/employees/views/EmployeeDetailView.vue'),
              meta: { titleKey: 'employees.detail', hideInMenu: true, menuUrl: '/employees' },
            },
          ],
        },
        {
          // 扁平路由範本：/products 自己就是頁面，沒有子路由
          path: 'products',
          name: 'Products',
          component: () => import('@/modules/products/views/ProductsView.vue'),
          meta: { titleKey: 'products.title', menuIcon: 'solar:box-bold-duotone' },
        },
        {
          // account-management / role-management 實際上是 system-settings（qiankun 子應用）的路由，
          // 這裡只留一個容器路由接住所有子路徑，實際頁面內容由子應用自己的路由接管。
          // menuChildren 是「虛擬選單項目」，讓側邊選單可以直接列出子應用的頁面，
          // 不需要在 host 這邊也各自定義一條真的路由紀錄。
          path: 'system-settings/:systemSettingsPath(.*)*',
          name: 'SystemSettings',
          component: () => import('@/views/SystemSettingsContainer.vue'),
          meta: {
            titleKey: 'systemSettings.title',
            menuIcon: 'solar:shield-user-bold-duotone',
            menuChildren: [
              { titleKey: 'accountManagement.title', path: '/system-settings/account-management' },
              {
                titleKey: 'accountManagement.actionLogs.title',
                path: '/system-settings/account-management/action-logs',
              },
              {
                titleKey: 'accountManagement.loginLogs.title',
                path: '/system-settings/account-management/login-logs',
              },
              { titleKey: 'roleManagement.title', path: '/system-settings/role-management' },
            ],
          },
        },
      ],
    },
    {
      path: '/login',
      component: () => import('@/layouts/AuthLayout.vue'),
      children: [
        {
          path: '',
          name: 'Login',
          component: () => import('@/modules/auth/views/LoginView.vue'),
          meta: { titleKey: 'auth.login' },
        },
      ],
    },
    {
      path: '/403',
      name: 'Forbidden',
      component: () => import('@/modules/auth/views/ForbiddenView.vue'),
      meta: { title: '無權限訪問' },
    },
    // 404 處理
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

router.beforeEach(async to => {
  // 驗證 token
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  if (requiresAuth && !authStore.isLoggedIn) return { name: 'Login' }
  if (to.name === 'Login' && authStore.isLoggedIn) return { name: 'Dashboard' }

  const appStore = useAppStore()

  if (requiresAuth) {
    await authStore.ensureSessionInitialized()
    // 這裡不用 usePermission()：它靠 inject() 取得 context，在導覽守衛（非元件 setup）裡拿不到東西，
    // 直接用同一個 createPermissionChecker 搭配 store 資料即可，跟 main.ts 的 provide 邏輯保持一致
    const permission = createPermissionChecker(
      computed(() => appStore.accountMenus),
      computed(() => authStore.role)
    )
    // system-settings 是掛在 /system-settings 底下的 qiankun 子應用，
    // 選單 url 仍是子應用自己原本的裸路徑（如 /account-management），要先去掉前綴才能比對
    const systemSettingsPrefix = '/system-settings'
    const menuCheckPath = to.path.startsWith(systemSettingsPrefix)
      ? to.path.slice(systemSettingsPrefix.length) || null
      : to.path
    if (menuCheckPath && !permission.canAccessMenu(menuCheckPath)) {
      return { name: 'Forbidden' }
    }
    const { crudAction, menuUrl } = to.meta
    if (
      crudAction &&
      typeof menuUrl === 'string' &&
      !permission.canPerformAction(menuUrl, crudAction as 'create' | 'update')
    ) {
      return { name: 'Forbidden' }
    }
  }

  // 更新頁面標題
  let pageTitle = '管理後台'
  if (to.meta.titleKey) {
    pageTitle = appStore.$t(to.meta.titleKey as string)
  } else if (typeof to.meta.title === 'string') {
    pageTitle = to.meta.title
  }
  document.title = `${pageTitle} | 飯店管理系統`
})

export default router
