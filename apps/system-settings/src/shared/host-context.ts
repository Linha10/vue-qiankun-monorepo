import { reactive } from "vue";
import { createRequest } from "@monorepo/request";
import type { AxiosInstance } from "axios";
import type { PermissionNode } from "@monorepo/types";

type Locale = "zh" | "en";
type Role = "admin" | "user";

// 主應用透過 qiankun props 傳進來的資料介面
// 之後每個要掛載 system-settings 的業務系統，都要照這個介面傳值
//
// 語系文字（$t/setLocale）刻意「不」在 system-settings 自己維護一份 locale 檔，
// 而是直接吃主應用傳進來的 $t/setLocale，確保兩邊文字永遠一致、不會重複維護。
export interface HostContext {
  baseURL: string;
  currentUser: { id: string; name: string } | null;
  role: Role;
  accountMenus: PermissionNode[];
  locale: Locale;
  $t: (key: string, params?: Record<string, unknown>) => string;
  setLocale: (locale: Locale) => void;
}

export const hostContext = reactive<HostContext>({
  baseURL: "",
  currentUser: null,
  role: "user",
  accountMenus: [],
  locale: "zh",
  $t: (key) => key,
  setLocale: () => {},
});

let _request: AxiosInstance | null = null;

// 主應用呼叫 mount 時，會把 props 傳進來，這裡負責接住並初始化 request instance
export function setHostContext(props: Partial<HostContext>) {
  Object.assign(hostContext, props);

  if (props.baseURL) {
    _request = createRequest({ baseURL: props.baseURL });
  }
}

// 各 view/component 要打 API 時，統一從這裡拿 request instance
// 而不是各自 import axios 或寫死 baseURL
export function getRequest(): AxiosInstance {
  if (!_request) {
    throw new Error(
      "[system-settings] request 尚未初始化，尚未收到主應用傳入的 baseURL",
    );
  }
  return _request;
}
