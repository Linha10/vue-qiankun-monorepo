import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'node:path'

export default defineConfig(() => ({
  // 只有部署到 GitHub Pages 的 CI 流程會設定 GH_PAGES_BASE 這個子路徑；
  // 一般 production build（例如 Docker）維持根路徑 '/'，避免兩種部署方式互相打架
  base: process.env.GH_PAGES_BASE || '/',
  plugins: [
    vue(),
    AutoImport({
      // 自動引入 Vue、Vue Router、Pinia 的 API
      imports: ['vue', 'vue-router', 'pinia'],
      // 自動引入 Element Plus 相關 API（如 ElMessage、ElMessageBox）
      resolvers: [ElementPlusResolver()],
      // 產生 auto-imports.d.ts 供 TypeScript 識別
      dts: 'src/types/auto-imports.d.ts',
    }),
    Components({
      // 自動引入 Element Plus 組件
      resolvers: [ElementPlusResolver()],
      // 產生 components.d.ts 供 TypeScript 識別
      dts: 'src/types/components.d.ts',
    }),
  ],
  resolve: {
    alias: {
      // 設定 @ 指向 src 目錄，import 路徑更簡潔
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
    dedupe: ['vue', 'element-plus', '@element-plus/icons-vue'],
  },
  css: {
    preprocessorOptions: {
      scss: {
        loadPaths: [resolve(__dirname, 'src/styles')],
        // 用函式形式，只對這個 app 自己 src 底下的檔案注入全域變數；
        // packages/ui-kit 等共用套件的元件有自己一份同名變數（@use "../styles/variables"），
        // 若無條件注入會讓 sass 同時看到兩個定義相同變數的全域模組而報錯
        additionalData: (source: string, filename: string) => {
          // Vite 傳進來的 filename 一律是用 "/" 分隔，Windows 上 path.resolve 卻是用 "\"，
          // 兩邊沒轉成同一種分隔符號比對的話，Windows 上 startsWith 永遠比對不到
          const ownSrcDir = resolve(__dirname, 'src').replaceAll('\\', '/')
          const isOwnSource = filename.replaceAll('\\', '/').startsWith(`${ownSrcDir}/`)
          if (!isOwnSource) return source
          return `@use "variables" as *;\n@use "@/styles/variables.scss" as *;\n${source}`
        },
      },
    },
  },
  server: {
    port: 3000,
  },
}))
