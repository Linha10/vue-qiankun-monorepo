<script setup lang="ts">
// 預設共用 Layout：上方 Header + 左側 Menu + 主內容區
// 各專案可直接使用，也可以只引用部分 slot 來客製，
// 若需要完全不同的版型，直接在該專案內寫自己的 Layout 即可，不強制繼承此元件
// TODO 此 Layout 尚未完成, 後續請基於renhospes-admin內的default layout 進行擴充
interface MenuItem {
  index: string;
  label: string;
  icon?: string;
}

withDefaults(
  defineProps<{
    title?: string;
    menuItems?: MenuItem[];
  }>(),
  {
    title: "後台管理系統",
    menuItems: () => [],
  },
);

defineEmits<{
  (e: "menu-select", index: string): void;
}>();
</script>

<template>
  <el-container class="layout-root">
    <el-header class="layout-header">
      <slot name="header-left">
        <span class="layout-title">{{ title }}</span>
      </slot>
      <div class="layout-header-right">
        <slot name="header-right" />
      </div>
    </el-header>

    <el-container>
      <el-aside width="220px" class="layout-aside">
        <slot name="menu">
          <el-menu
            :default-active="menuItems[0]?.index"
            @select="$emit('menu-select', $event)"
          >
            <el-menu-item
              v-for="item in menuItems"
              :key="item.index"
              :index="item.index"
            >
              <span>{{ item.label }}</span>
            </el-menu-item>
          </el-menu>
        </slot>
      </el-aside>

      <el-main class="layout-main">
        <slot />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.layout-root {
  height: 100vh;
}
.layout-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--el-border-color);
}
.layout-title {
  font-weight: 600;
}
.layout-aside {
  border-right: 1px solid var(--el-border-color);
}
.layout-main {
  overflow-y: auto;
}
</style>
