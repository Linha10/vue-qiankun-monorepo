export {}; // 讓此檔案成為 module，declare global 才能生效

declare global {
  interface Window {
    __POWERED_BY_QIANKUN__?: boolean;
  }
}

if (window.__POWERED_BY_QIANKUN__) {
  // @ts-expect-error: qiankun 注入的動態 publicPath 變數
  __webpack_public_path__ = (window as any).__INJECTED_PUBLIC_PATH_BY_QIANKUN__;
}
