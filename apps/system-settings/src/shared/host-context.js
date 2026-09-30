import { reactive } from "vue";
import { createRequest } from "@monorepo/request";
export const hostContext = reactive({
    baseURL: "",
    currentUser: null,
    role: "user",
    accountMenus: [],
    locale: "zh",
    $t: (key) => key,
    setLocale: () => { },
});
let _request = null;
// 主應用呼叫 mount 時，會把 props 傳進來，這裡負責接住並初始化 request instance
export function setHostContext(props) {
    Object.assign(hostContext, props);
    if (props.baseURL) {
        _request = createRequest({ baseURL: props.baseURL });
    }
}
// 各 view/component 要打 API 時，統一從這裡拿 request instance
// 而不是各自 import axios 或寫死 baseURL
export function getRequest() {
    if (!_request) {
        throw new Error("[system-settings] request 尚未初始化，尚未收到主應用傳入的 baseURL");
    }
    return _request;
}
