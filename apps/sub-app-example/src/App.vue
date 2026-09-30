<script setup lang="ts">
import { DefaultLayout } from '@monorepo/layout-template'
</script>

<template>
  <!-- 需要自訂 layout 的專案，直接不引用 @monorepo/layout-template，
       改成自己專案內的 Layout 元件即可，架構上完全不強制 -->
  <DefaultLayout title="子應用範例">
    <h1>Sub App Example</h1>
    <p>這裡是子應用的內容，實際搬遷舊專案時把原本的頁面放進 src/ 即可。</p>
  </DefaultLayout>
</template>
