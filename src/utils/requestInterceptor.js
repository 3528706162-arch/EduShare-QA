// 全局请求拦截器 - 自动处理token和401错误
import { useAuthStore } from '@/stores/auth'

// 保存原始的fetch方法
const originalFetch = window.fetch

// 重写fetch方法
window.fetch = async function(...args) {
  const [url, options = {}] = args
  
  console.log('=== 拦截器开始处理请求 ===')
  console.log('请求URL:', url)
  console.log('请求参数:', options)
  
  // 跳过登录和注册请求的拦截
  const skipUrls = ['/api/v1/user/login', '/api/v1/user/Register', '/login', '/register']
  const shouldSkip = skipUrls.some(skipUrl => url.includes(skipUrl))
  
  if (shouldSkip) {
    console.log('跳过拦截，直接调用原始fetch')
    return originalFetch.apply(this, args)
  }
  
  // 添加认证token
  const token = localStorage.getItem('token')
  console.log('从localStorage获取token:', token ? '存在' : '不存在')
  
  // 创建新的配置对象，确保包含所有原始选项
  const headers = new Headers(options.headers || {})
  headers.set('Content-Type', 'application/json')
  
  if (token) {
    headers.set('token', token)
    console.log('已添加token头:', headers.get('token'))
  } else {
    console.log('未添加token头，因为token不存在')
  }
  
  const config = {
    ...options,
    headers: headers
  }
  
  console.log('最终请求配置:', config)
  
  try {
    // 使用apply方法确保正确传递所有参数
    const response = await originalFetch.call(this, url, config)
    
    console.log('请求响应状态:', response.status)
    
    // 处理401未授权错误
    if (response.status === 401) {
      console.log('检测到401错误，执行未授权处理')
      handleUnauthorized()
      throw new Error('未授权访问，请重新登录')
    }
    
    console.log('=== 拦截器处理完成 ===')
    return response
  } catch (error) {
    console.error('请求失败:', error)
    throw error
  }
}

// 处理401错误
function handleUnauthorized() {
  const authStore = useAuthStore()
  // 清除本地存储的token和用户信息
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  // 重置store状态
  if (authStore) {
    authStore.token = null
    authStore.user = null
  }
  // 跳转到登录页面
  if (!window.location.pathname.includes('/login')) {
    window.location.href = '/login'
  }
  // 显示错误提示
  if (typeof ElMessage !== 'undefined') {
    ElMessage.error('登录已过期，请重新登录')
  }
}

// 导出拦截器安装函数
export function installRequestInterceptor() {
  console.log('全局请求拦截器已安装')
}

export default {
  install: installRequestInterceptor
}