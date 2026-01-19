import { createApp } from 'vue'
// @ts-ignore
import App from './App.vue'
import router from './router'

// 引入 Element Plus 及其样式
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css' // 暗黑模式变量
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import './assets/main.scss'
import {setupStore} from "./stores";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import {createPinia} from "pinia";
const pina = createPinia();
pina.use(piniaPluginPersistedstate);
const app = createApp(App)
app.use(pina)
// 注册所有图标
app.use(ElementPlus)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}
app.use(router)
setupStore(app)
app.mount('#app')