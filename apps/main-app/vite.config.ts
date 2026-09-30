import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 主應用，一般不需要 vite-plugin-qiankun（那是給「子應用」用的），
// 主應用只要負責 registerMicroApps + start 即可
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 8080,
  },
})
