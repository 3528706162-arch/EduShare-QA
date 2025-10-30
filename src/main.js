import { createApp } from 'vue'
//引入element-plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'//根组件
import router from './router/index'

createApp(App).use(ElementPlus).use(router).mount('#app')