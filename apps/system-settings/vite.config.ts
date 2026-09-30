import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import qiankun from "vite-plugin-qiankun";

const MICRO_APP_NAME = "system-settings";

// GH_PAGES_BASE 只在部署到 GitHub Pages 的 CI 流程會設定（例如 '/vue-qiankun-monorepo/'），
// 一般 production build（Docker）維持 '/system-settings/'，本機開發維持 '/'
const ghPagesBase = process.env.GH_PAGES_BASE;
const isProdBuild = process.env.NODE_ENV === "production";

function resolveBase(): string {
  if (ghPagesBase) return `${ghPagesBase}${MICRO_APP_NAME}/`;
  if (isProdBuild) return `/${MICRO_APP_NAME}/`;
  return "/";
}

export default defineConfig({
  base: resolveBase(),
  plugins: [vue(), qiankun(MICRO_APP_NAME, { useDevMode: true })],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 8090,
    cors: true,
    origin: "http://localhost:8090",
  },
});
