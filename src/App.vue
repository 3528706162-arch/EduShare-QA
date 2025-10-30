<!-- 定义JS,控制模板部分的数据和行为 -->
<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 全局HTTP拦截器
const setupHttpInterceptor = () => {
  const originalFetch = window.fetch
  
  window.fetch = async function(...args) {
    try {
      const token = localStorage.getItem('token')
      const options = args[1] || {}
      
      // 添加认证头
      if (token) {
        options.headers = {
          ...options.headers,
          'token': token
        }
      }
      
      const response = await originalFetch(args[0], options)
      
      // 处理401未授权错误
      if (response.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
        
        // 显示提示信息
        if (typeof ElMessage !== 'undefined') {
          ElMessage.error('用户未登录！')
        }
        
        // 跳转到登录页
        if (router.currentRoute.value.path !== '/login') {
          router.push('/login')
        }
        
        throw new Error('用户未登录')
      }
      
      return response
    } catch (error) {
      throw error
    }
  }
}

// 获取用户信息
const fetchUserInfo = async () => {
  const token = localStorage.getItem('token')
  const username = localStorage.getItem('username')
  if (!token) return
  
  try {
    // 使用用户名作为路径参数
    const apiUrl = username ? `/api/user/${username}` : '/api/user'
    const response = await fetch(apiUrl, {
      headers: {
        'token': token
      }
    })
    
    if (response.ok) {
      const result = await response.json()
      // 处理后端返回的数据结构：{code, msg, data}
      if (result.code === 1 && result.data) {
        localStorage.setItem('userInfo', JSON.stringify(result.data))
      }
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

onMounted(() => {
  setupHttpInterceptor()
  fetchUserInfo()
})
</script>

<!-- 模板部分,控制的是页面的结构(HTML) -->
<template>
  <router-view></router-view>
</template>

<!-- 当前组件的CSS样式 -->
<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  height: 100%;
  margin: 0;
}
</style>