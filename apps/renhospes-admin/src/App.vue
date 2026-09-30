<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'
import zhTw from 'element-plus/es/locale/lang/zh-tw'
import en from 'element-plus/es/locale/lang/en'

const appStore = useAppStore()
const elLocale = computed(() => (appStore.locale === 'zh' ? zhTw : en))
</script>

<template>
  <el-config-provider :locale="elLocale">
    <router-view />
  </el-config-provider>
</template>
