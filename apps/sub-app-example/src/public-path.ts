// qiankun 動態設定 publicPath，避免資源路徑被主應用蓋掉
export {}; // 讓此檔案成為 module，declare global 才能生效

declare global {
  interface Window {
    __POWERED_BY_QIANKUN__?: boolean;
  }
}

if (window.__POWERED_BY_QIANKUN__) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-undef
  // @ts-expect-error: qiankun 注入的動態 publicPath 變數
  __webpack_public_path__ = (window as any).__INJECTED_PUBLIC_PATH_BY_QIANKUN__;
}
