import { startMockWorker } from '@monorepo/mocks/browser';
// 只有「獨立跑」system-settings（不是被 qiankun host 掛載）時才需要自己啟動 MSW，
// 被嵌入 renhospes-admin 時，host 自己啟動的 worker 已經涵蓋這個 app 的所有 API。
export function startSystemSettingsMocks() {
    return startMockWorker({ serviceWorkerUrl: `${import.meta.env.BASE_URL}mockServiceWorker.js` });
}
