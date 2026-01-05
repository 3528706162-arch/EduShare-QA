import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

import App from './App.vue'
import router from './router'
import requestInterceptor from '@/utils/requestInterceptor'

// 创建Vue应用
const app = createApp(App)

// 注册Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 使用插件
app.use(createPinia())
app.use(router)
app.use(ElementPlus, {
  locale: zhCn,
  size: 'default'
})

// 安装全局请求拦截器
requestInterceptor.install()

// 全局配置
app.config.globalProperties.$filters = {
  // 可以在这里添加全局过滤器
}

// 挂载应用
app.mount('#app')

// 开发环境下的全局错误处理
if (import.meta.env.DEV) {
  app.config.errorHandler = (err, instance, info) => {
    console.error('Vue错误:', err)
    console.error('组件实例:', instance)
    console.error('错误信息:', info)
  }
}

console.log('EduShare QA应用已启动')