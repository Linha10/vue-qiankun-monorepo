import "./public-path";
import { createApp, computed, type App as VueApp } from "vue";
import ElementPlus from "element-plus";
import { VueQueryPlugin, QueryClient } from "@tanstack/vue-query";
import {
  renderWithQiankun,
  qiankunWindow,
  type QiankunProps,
} from "vite-plugin-qiankun/dist/helper";
import {
  I18N_KEY,
  PERMISSION_KEY,
  createPermissionChecker,
} from "@monorepo/composables";
import App from "./App.vue";
import router from "./router";
import { setHostContext, hostContext } from "./shared/host-context";
import { startSystemSettingsMocks } from "./mocks/browser";

import "element-plus/dist/index.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "@/assets/main.css";

let app: VueApp | null = null;

// qiankun 反覆掛載/卸載同一個子應用時，每次都要重新 new 一個 QueryClient，
// 避免沿用上一輪 unmount 後的快取狀態
function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 30,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
}

function render(props: QiankunProps = {}) {
  const { container } = props;
  const mountEl = container
    ? container.querySelector("#app")!
    : document.querySelector("#app")!;

  // 把主應用傳進來的 baseURL / currentUser / role / accountMenus / locale / $t / setLocale 接住
  setHostContext({
    baseURL: (props as any).baseURL,
    currentUser: (props as any).currentUser,
    role: (props as any).role,
    accountMenus: (props as any).accountMenus,
    locale: (props as any).locale,
    $t: (props as any).$t,
    setLocale: (props as any).setLocale,
  });

  app = createApp(App);
  app.use(ElementPlus);
  app.use(router);
  app.use(VueQueryPlugin, { queryClient: createQueryClient() });

  // 提供 @monorepo/composables 的 useI18n()/usePermission() 所需的 context，
  // 資料來源直接吃 hostContext（主應用傳進來的 props），system-settings 自己不擁有這些狀態
  app.provide(I18N_KEY, {
    $t: (key: string, params?: Record<string, unknown>) =>
      hostContext.$t(key, params),
    locale: computed(() => hostContext.locale),
    setLocale: (locale: string) => hostContext.setLocale(locale as "zh" | "en"),
  });
  app.provide(
    PERMISSION_KEY,
    createPermissionChecker(
      computed(() => hostContext.accountMenus),
      computed(() => hostContext.role),
    ),
  );

  app.mount(mountEl);
}

if (qiankunWindow.__POWERED_BY_QIANKUN__) {
  renderWithQiankun({
    mount(props) {
      render(props);
    },
    bootstrap() {
      console.log("[system-settings] bootstrap");
    },
    unmount() {
      app?.unmount();
      app = null;
    },
    update(props) {
      // 主應用之後若重新傳入新的 props（例如切換使用者、切換語系），這裡會被呼叫
      setHostContext({
        baseURL: (props as any).baseURL,
        currentUser: (props as any).currentUser,
        role: (props as any).role,
        accountMenus: (props as any).accountMenus,
        locale: (props as any).locale,
        $t: (props as any).$t,
        setLocale: (props as any).setLocale,
      });
    },
  });
} else {
  // 獨立開發模式：沒有主應用（host 也沒啟動 MSW），這裡要自己啟動一份，
  // 並且假資料要跟 demo 帳號一致（role: admin 會直接略過所有選單/按鈕權限檢查）
  void startSystemSettingsMocks().then(() => {
    render({
      baseURL: "/api",
      currentUser: { id: "dev", name: "Dev User" },
      role: "admin",
      accountMenus: [],
      locale: "zh",
      $t: (key: string) => key,
      setLocale: () => {},
    } as QiankunProps);
  });
}
