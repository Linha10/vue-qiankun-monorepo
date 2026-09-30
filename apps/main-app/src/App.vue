<script setup lang="ts">
import { DefaultLayout } from '@monorepo/layout-template'
</script>

<template>
  <DefaultLayout
    title="主應用"
    :menu-items="[
      { index: '/sub-app-example', label: '子應用範例' },
    ]"
    @menu-select="path => $router?.push?.(path)"
  >
    <!-- 子應用實際掛載在 index.html 的 #subapp-container，
         這裡的內容是主應用自己的區域（例如首頁儀表板） -->
    <router-view v-if="false" />
  </DefaultLayout>
</template>
