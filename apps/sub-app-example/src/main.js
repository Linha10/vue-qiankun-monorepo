import './public-path';
import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import { renderWithQiankun, qiankunWindow, } from 'vite-plugin-qiankun/dist/helper';
import App from './App.vue';
let app = null;
function render(props = {}) {
    const { container } = props;
    const mountEl = container
        ? container.querySelector('#app')
        : document.querySelector('#app');
    app = createApp(App);
    app.use(ElementPlus);
    app.mount(mountEl);
}
if (qiankunWindow.__POWERED_BY_QIANKUN__) {
    renderWithQiankun({
        mount(props) {
            render(props);
        },
        bootstrap() {
            console.log('[sub-app-example] bootstrap');
        },
        unmount() {
            app?.unmount();
            app = null;
        },
        update() {
            console.log('[sub-app-example] update');
        },
    });
}
else {
    // 獨立開發模式（沒有被 qiankun 載入時）直接渲染
    render();
}
