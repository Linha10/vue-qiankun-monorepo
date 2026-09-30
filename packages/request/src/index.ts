import axios, { type InternalAxiosRequestConfig } from "axios";
import { ElMessage } from "element-plus";

// API 回應的統一格式
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

// 擴充 config，標記是否已重試過
interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// 各子應用可能有不同的 BASE_URL / refresh 路徑 / 登入頁路徑，
// 這裡改為可注入設定，讓每個 app 建立自己的 instance
export interface RequestOptions {
  baseURL: string;
  timeout?: number;
  refreshUrl?: string;
  loginUrlKeywords?: string[];
  loginRedirectPath?: string;
  httpStatusMessages?: Record<number, string>;
  businessCodeMessages?: Record<number, string>;
}

const defaultHttpStatusMessages: Record<number, string> = {
  400: "請求參數錯誤",
  401: "登入已過期，請重新登入",
  403: "權限不足",
  404: "資源不存在",
  500: "伺服器錯誤，請稍後再試",
};

const defaultBusinessCodeMessages: Record<number, string> = {
  50: "平台不存在",
  51: "資料已存在",
  52: "資料轉換錯誤",
  53: "所選日期庫存不足",
  54: "MQ發送錯誤",
  55: "查無資料",
  56: "訂單狀態不允許付款",
  57: "訂單已完成",
  58: "交易失敗",
  59: "上一筆付款正在處理中，請稍後再試",
  60: "交易成功，寫入失敗，等待補單",
  61: "三方交易API失敗",
};

export function createRequest(options: RequestOptions) {
  const {
    baseURL,
    timeout = 10000,
    refreshUrl = "/v1/accounts/refresh",
    loginUrlKeywords = ["/v1/accounts/refresh", "/v1/accounts/login"],
    loginRedirectPath = "/login",
    httpStatusMessages = defaultHttpStatusMessages,
    businessCodeMessages = defaultBusinessCodeMessages,
  } = options;

  const request = axios.create({
    baseURL,
    timeout,
    headers: { "Content-Type": "application/json" },
  });

  // 獨立的 axios instance，專用於 refresh token 呼叫，不掛 interceptors，避免無限遞迴
  const refreshAxios = axios.create({
    baseURL,
    timeout,
    headers: { "Content-Type": "application/json" },
  });

  // 防止同時發出多個 refresh 請求 + 排隊機制
  let isRefreshing = false;
  let refreshSubscribers: Array<(token: string) => void> = [];

  function subscribeTokenRefresh(cb: (token: string) => void) {
    refreshSubscribers.push(cb);
  }

  function onRefreshed(token: string) {
    refreshSubscribers.forEach((cb) => cb(token));
    refreshSubscribers = [];
  }

  function clearAuthAndRedirect(hint?: string) {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("accountId");
    if (hint) sessionStorage.setItem("loginHint", hint);
    globalThis.location.href = loginRedirectPath;
  }

  request.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = localStorage.getItem("token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // 若 data 為 FormData，刪除預設的 Content-Type，
      // 讓瀏覽器自動設定 multipart/form-data 並附上正確的 boundary
      if (config.data instanceof FormData) {
        delete config.headers["Content-Type"];
      }

      return config;
    },
    (error) => Promise.reject(error),
  );

  request.interceptors.response.use(
    (response) => {
      const { code, message } = response.data as ApiResponse;

      if (code === 0) {
        return response.data;
      }

      const msg =
        message || businessCodeMessages[code] || "發生錯誤，請稍後再試";

      ElMessage.error(msg);
      return Promise.reject(new Error(msg));
    },
    async (error) => {
      const status = error.response?.status;
      const requestUrl: string = error.config?.url ?? "";
      const originalConfig = error.config as RetryableRequestConfig;

      // ---------- 401：嘗試 refresh token ----------
      if (status === 401) {
        const isAuthEndpoint = loginUrlKeywords.some((keyword) =>
          requestUrl.includes(keyword),
        );

        // auth 接口本身 401，或已重試過仍 401 → 直接登出
        if (isAuthEndpoint || originalConfig._retry) {
          clearAuthAndRedirect("登入已過期，請重新登入");
          throw error;
        }

        const storedRefreshToken = localStorage.getItem("refreshToken");
        const storedAccountId = localStorage.getItem("accountId");

        if (!storedRefreshToken || !storedAccountId) {
          clearAuthAndRedirect("登入已過期，請重新登入");
          throw error;
        }

        originalConfig._retry = true;

        // 已有人在 refresh → 排隊等新 token
        if (isRefreshing) {
          return new Promise((resolve) => {
            subscribeTokenRefresh((token: string) => {
              originalConfig.headers.Authorization = `Bearer ${token}`;
              resolve(request(originalConfig));
            });
          });
        }

        // 第一個請求負責真正去 refresh
        isRefreshing = true;
        try {
          const refreshRes = await refreshAxios.post(refreshUrl, {
            accountId: storedAccountId,
            refreshToken: storedRefreshToken,
          });

          const newAccessToken: string =
            refreshRes.data?.data?.accessToken ?? refreshRes.data?.accessToken;
          const newRefreshToken: string =
            refreshRes.data?.data?.refreshToken ??
            refreshRes.data?.refreshToken;

          if (!newAccessToken) {
            throw new Error("No access token in refresh response");
          }

          localStorage.setItem("token", newAccessToken);
          if (newRefreshToken) {
            localStorage.setItem("refreshToken", newRefreshToken);
          }

          onRefreshed(newAccessToken);

          originalConfig.headers.Authorization = `Bearer ${newAccessToken}`;
          return request(originalConfig);
        } catch {
          refreshSubscribers = [];
          clearAuthAndRedirect("登入已過期，請重新登入");
          throw error;
        } finally {
          isRefreshing = false;
        }
      }

      // ---------- 其他 HTTP 錯誤 ----------
      const body = error.response?.data as ApiResponse | undefined;
      const message =
        body?.message ||
        (body?.code != null ? businessCodeMessages[body.code] : undefined) ||
        httpStatusMessages[status] ||
        "網路異常，請檢查連線狀態";

      ElMessage.error(message);
      throw error;
    },
  );

  return request;
}

export default createRequest;
