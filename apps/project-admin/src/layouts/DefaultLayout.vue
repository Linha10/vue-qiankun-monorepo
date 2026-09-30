<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { computed } from 'vue'
import { useRoute, useRouter, type RouteRecordRaw } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import { useI18n, usePermission } from '@monorepo/composables'
import ResetPasswordDialog from '@/layouts/components/ResetPasswordDialog.vue'

const appStore = useAppStore()
const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const { $t } = useI18n()
const { canAccessMenu } = usePermission()

interface SideMenuChild {
  titleKey?: string
  title?: string
  path: string
}

interface SideMenuItem {
  path: string
  titleKey?: string
  title?: string
  icon?: string
  children?: SideMenuChild[]
}

// 選單完全由 router 的 route meta 產生：新增 / 調整頁面只要改 router/index.ts 即可，
// 不用再手動同步這裡的選單樣板。
// meta.hideInMenu：不列入選單（例如巢狀路由裡的詳情頁）
// meta.menuIcon：選單圖示
// meta.menuChildren：虛擬子選單項目（給 qiankun 子應用的頁面用，這些頁面在 host 這邊沒有真正的路由紀錄）
const sideMenuItems = computed<SideMenuItem[]>(() => {
  const rootRoute = router.options.routes.find(r => r.path === '/')
  const children = (rootRoute?.children ?? []) as RouteRecordRaw[]
  return children
    .filter(child => {
      const meta = (child.meta ?? {}) as Record<string, unknown>
      return !meta.hideInMenu && (meta.titleKey || meta.title)
    })
    .map(child => {
      const meta = (child.meta ?? {}) as Record<string, unknown>
      return {
        path: `/${String(child.path)}`,
        titleKey: meta.titleKey as string | undefined,
        title: meta.title as string | undefined,
        icon: meta.menuIcon as string | undefined,
        children: meta.menuChildren as SideMenuChild[] | undefined,
      }
    })
})

// system-settings 子應用的選單 url 是它自己原本的裸路徑（如 /account-management），
// 要先去掉 /system-settings 前綴才能跟 canAccessMenu 比對
function stripSystemSettingsPrefix(path: string) {
  const prefix = '/system-settings'
  return path.startsWith(prefix) ? path.slice(prefix.length) || '/' : path
}

function visibleChildren(item: SideMenuItem) {
  return (item.children ?? []).filter(child => canAccessMenu(stripSystemSettingsPrefix(child.path)))
}

// dashboard 不受選單權限限制，其餘項目：有子選單看子項是否至少一個可見，沒有子選單就直接比對自己
function itemVisible(item: SideMenuItem) {
  if (item.path === '/dashboard') return true
  if (item.children?.length) return visibleChildren(item).length > 0
  return canAccessMenu(item.path)
}

const activeMenu = computed(() => route.path)
const pageTitle = computed(() => {
  if (route.meta.titleKey) {
    return $t(route.meta.titleKey as string)
  }
  return route.meta.title ? (route.meta.title as string) : $t('auth.systemTitle')
})

// 自動從 route.matched 生成麵包屑（跳過根 layout `/`，並去除連續重複的相同路徑，
// 避免「巢狀路由父層」跟「空路徑子路由」標題相同時顯示兩次一樣的麵包屑）
const breadcrumbs = computed(() => {
  const crumbs: { title: string; path?: string }[] = []

  route.matched.forEach(r => {
    let title = ''
    if (r.meta?.titleKey) {
      title = $t(r.meta.titleKey as string)
    } else if (r.meta?.title) {
      title = r.meta.title as string
    }

    if (title && r.path !== '/') {
      const last = crumbs[crumbs.length - 1]
      if (!last || last.path !== r.path) {
        crumbs.push({ title, path: r.path })
      }
    }
  })

  return crumbs
})

const resetPwDialogVisible = ref(false)

const openResetPwDialog = () => {
  resetPwDialogVisible.value = true
}

const handleLogout = () => {
  authStore.logout()
}
</script>

<template>
  <el-container class="admin-layout">
    <el-aside
      :width="appStore.isSidebarCollapsed ? '64px' : '220px'"
      :class="[
        'admin-layout__sidebar',
        'tw-transition-all',
        'tw-duration-300',
        'tw-overflow-hidden',
        { 'admin-layout__sidebar--collapsed': appStore.isSidebarCollapsed },
      ]"
    >
      <!-- Logo -->
      <div class="sidebar-brand">
        <div class="sidebar-brand__mark">
          <Icon icon="solar:buildings-bold-duotone" width="20" />
        </div>
        <div v-if="!appStore.isSidebarCollapsed" class="sidebar-brand__info">
          <p class="sidebar-brand__title">Project Admin</p>
          <p class="sidebar-brand__subtitle">Hotel Console</p>
        </div>
      </div>

      <!-- 導覽選單：完全由 router meta 產生（sideMenuItems），新增頁面不用再改這裡 -->
      <el-menu
        :default-active="activeMenu"
        :collapse="appStore.isSidebarCollapsed"
        :collapse-transition="false"
        :unique-opened="true"
        class="sidebar-nav"
        router
      >
        <template v-for="item in sideMenuItems" :key="item.path">
          <el-sub-menu
            v-if="item.children?.length && itemVisible(item)"
            :index="`group-${item.path}`"
          >
            <template #title>
              <Icon v-if="item.icon" :icon="item.icon" class="sidebar-nav__icon" />
              <span>{{ item.titleKey ? $t(item.titleKey) : item.title }}</span>
            </template>
            <el-menu-item
              v-for="child in visibleChildren(item)"
              :key="child.path"
              :index="child.path"
            >
              <template #title>{{ child.titleKey ? $t(child.titleKey) : child.title }}</template>
            </el-menu-item>
          </el-sub-menu>

          <el-menu-item v-else-if="itemVisible(item)" :index="item.path">
            <Icon v-if="item.icon" :icon="item.icon" class="sidebar-nav__icon" />
            <template #title>{{ item.titleKey ? $t(item.titleKey) : item.title }}</template>
          </el-menu-item>
        </template>
      </el-menu>
    </el-aside>

    <el-container class="admin-layout__main tw-flex-col">
      <!-- Header 48px -->
      <el-header class="layout-header" height="48px">
        <div class="layout-header__left">
          <el-button class="layout-header__toggle" text circle @click="appStore.toggleSidebar">
            <Icon
              :icon="
                appStore.isSidebarCollapsed
                  ? 'material-symbols:menu-rounded'
                  : 'material-symbols:menu-open-rounded'
              "
              width="20"
            />
          </el-button>
          <span class="layout-header__page-title">{{ pageTitle }}</span>
        </div>

        <div class="layout-header__right">
          <el-radio-group
            class="lang-switcher"
            :model-value="appStore.locale"
            size="small"
            @change="val => appStore.setLocale(val as 'zh' | 'en')"
          >
            <el-radio-button value="zh">中文</el-radio-button>
            <el-radio-button value="en">EN</el-radio-button>
          </el-radio-group>

          <el-dropdown>
            <div class="user-chip">
              <el-avatar :size="26" src="" />
              <span class="user-chip__name">
                {{ appStore.userInfo?.accountName ?? $t('layout.admin') }}
              </span>
              <Icon icon="solar:alt-arrow-down-line-duotone" width="14" />
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="openResetPwDialog">重設密碼</el-dropdown-item>
                <el-dropdown-item @click="handleLogout">{{ $t('auth.logout') }}</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <ResetPasswordDialog
        :modelValue="resetPwDialogVisible"
        @close="resetPwDialogVisible = false"
      />

      <el-main class="admin-layout__content tw-overflow-auto">
        <el-breadcrumb v-if="breadcrumbs.length > 1" class="content-breadcrumb" separator="/">
          <el-breadcrumb-item
            v-for="(crumb, i) in breadcrumbs"
            :key="i"
            :to="i < breadcrumbs.length - 1 && crumb.path ? crumb.path : undefined"
          >
            {{ crumb.title }}
          </el-breadcrumb-item>
        </el-breadcrumb>
        <router-view v-slot="{ Component }">
          <keep-alive :include="['RoomTypeView']">
            <component :is="Component" />
          </keep-alive>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped lang="scss">
// ── 整體殼層 ──
.admin-layout {
  height: 100vh;
  background-color: $color-bg-page;

  &__sidebar {
    background: linear-gradient(180deg, $color-sidebar-bg 0%, $color-neutral-800 100%);
    border-right: 1px solid $color-sidebar-border;
    display: flex;
    flex-direction: column;
  }

  &__main {
    background: transparent;
    min-width: 0;
  }

  &__content {
    background: transparent;
    padding: 16px;
  }
}

// ── 品牌 Logo ──
.sidebar-brand {
  height: 56px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
  border-bottom: 1px solid #334155;

  &__mark {
    width: 32px;
    height: 32px;
    border-radius: 10px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $color-primary-900;
    background: $color-primary-100;
  }

  &__title {
    margin: 0;
    font-size: 13px;
    font-weight: 700;
    color: $color-text-inverse;
    line-height: 1.1;
    white-space: nowrap;
  }

  &__subtitle {
    margin: 2px 0 0;
    font-size: 11px;
    color: $color-neutral-400;
    line-height: 1;
    white-space: nowrap;
  }
}

// ── 導覽選單 ──
.sidebar-nav {
  flex: 1;
  border-right: none;
  background: transparent;
  overflow-y: auto;
  overflow-x: hidden;
  padding-top: 8px;
  --el-menu-bg-color: transparent;
  --el-menu-text-color: #{$color-sidebar-text};
  --el-menu-active-color: #{$color-sidebar-active-text};
  --el-menu-hover-bg-color: #{$color-sidebar-hover-bg};
  --el-menu-item-height: 40px;
  --el-menu-sub-item-height: 38px;

  &__icon {
    width: 24px;
    height: 24px;
    min-width: 24px;
    flex-shrink: 0;
    margin-right: 4px;
    &--sm {
      width: 20px;
      height: 20px;
      min-width: 20px;
    }
  }

  :deep(.el-menu-item.is-active) {
    background: $color-sidebar-active-bg;
  }
}

// 展開時樣式
.admin-layout__sidebar:not(.admin-layout__sidebar--collapsed) {
  .sidebar-nav {
    :deep(.el-menu-item),
    :deep(.el-sub-menu__title) {
      margin: 8px 8px 4px 8px;
      width: calc(100% - 16px);
      border-radius: 10px;
      padding-left: 12px !important;
    }

    :deep(.el-sub-menu .el-menu-item) {
      padding-left: 32px !important;
    }

    :deep(.el-sub-menu .el-menu--inline) {
      padding-top: 1px;
      padding-bottom: 0;
    }

    :deep(.el-sub-menu .el-menu-item:first-child) {
      margin-top: 0;
    }

    :deep(.el-menu-item:hover),
    :deep(.el-sub-menu__title:hover) {
      background-color: $color-sidebar-hover-bg !important;
      border-radius: 10px;
    }
  }
}

.admin-layout__sidebar--collapsed {
  .sidebar-nav {
    :deep(.el-menu-item),
    :deep(.el-sub-menu__title) {
      margin: 2px 0;
      width: 100%;
      padding-left: 0 !important;
      padding-right: 0 !important;
      border-radius: 0;
      justify-content: center;
    }
  }
}

// ── Header ──
.layout-header {
  flex-shrink: 0;
  border-bottom: 1px solid $color-border;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;

  &__left {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__toggle {
    width: 30px;
    height: 30px;
    color: $color-text-primary;
  }

  &__page-title {
    font-size: 16px;
    font-weight: 700;
    color: $color-text-primary;
    line-height: 1;
  }

  &__right {
    display: flex;
    align-items: center;
    gap: 10px;
  }
}

// ── 語言切換 ──
.lang-switcher {
  --el-color-primary: #0b6e7a;
  --el-color-primary-light-9: #e6f3f4;
  --el-border-radius-base: 999px;

  :deep(.el-radio-button__inner) {
    border-radius: 0;
    font-weight: 600;
    font-size: 12px;
    padding: 5px 14px;
  }

  :deep(.el-radio-button:first-child .el-radio-button__inner) {
    border-radius: 999px 0 0 999px;
  }

  :deep(.el-radio-button:last-child .el-radio-button__inner) {
    border-radius: 0 999px 999px 0;
  }
}

// ── 使用者 chip ──
.user-chip {
  height: 32px;
  border: 1px solid $color-border;
  background: $color-bg-card;
  border-radius: 999px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 8px 0 4px;
  cursor: pointer;

  &__name {
    color: $color-text-secondary;
    font-size: 12px;
    font-weight: 600;
  }
}

// ── 麵包屑 ──
.content-breadcrumb {
  margin-bottom: 12px;

  :deep(.el-breadcrumb__inner) {
    font-size: 14px;
    color: $color-text-muted;
    font-weight: 400;
  }

  :deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
    color: $color-text-primary;
    font-weight: 600;
  }

  :deep(.el-breadcrumb__separator) {
    color: $color-neutral-300;
  }

  :deep(a.el-breadcrumb__inner:hover) {
    color: $color-primary;
  }
}

@media (max-width: 960px) {
  .user-chip__name {
    display: none;
  }
}

:deep(.el-sub-menu__icon-arrow) {
  right: calc(var(--el-menu-base-level-padding) - 92px);
}
</style>
