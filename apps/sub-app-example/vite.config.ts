import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import qiankun from 'vite-plugin-qiankun'

const MICRO_APP_NAME = 'sub-app-example'

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? `/${MICRO_APP_NAME}/` : '/',
  plugins: [
    vue(),
    qiankun(MICRO_APP_NAME, { useDevMode: true }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 8081,
    // 獨立開發時可用 CORS，被主應用以 fetch 方式載入 entry 時需要
    cors: true,
    origin: 'http://localhost:8081',
  },
})
