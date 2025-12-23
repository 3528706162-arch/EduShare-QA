import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService } from '@/services/api'
import { useRouter } from 'vue-router'

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || null)
  const isLoading = ref(false)
  const router = useRouter()
  
  // 计算属性
  const isAuthenticated = computed(() => !!token.value)
  const userRole = computed(() => user.value?.role || null)
  const userName = computed(() => user.value?.username || user.value?.name || '用户')
  const userInfo = computed(() => user.value)
  
  // 方法
  const login = async (credentials) => {
    isLoading.value = true
    try {
      // 直接调用后端登录API
      const response = await fetch('/api/v1/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password
        })
      })
      
      const result = await response.json()
      
      if (result.code === 1) {
        token.value = result.data.id
        user.value = result.data
        localStorage.setItem('token', result.data.id)
        localStorage.setItem('user', JSON.stringify(result.data))
        
        return { success: true, user: result.data }
      } else {
        throw new Error(result.msg || '登录失败')
      }
    } catch (error) {
      console.error('登录失败:', error)
      return { success: false, error: error.message }
    } finally {
      isLoading.value = false
    }
  }
  
  const register = async (userData) => {
    isLoading.value = true
    try {
      // 直接调用后端注册API
      const response = await fetch('/api/v1/user/Register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      })
      const result = await response.json()
      
      if (result.code === 1) {
        return { success: true, message: '注册成功，请登录' }
      } else {
        throw new Error(result.msg || '注册失败')
      }
    } catch (error) {
      console.error('注册失败:', error)
      return { success: false, error: error.message }
    } finally {
      isLoading.value = false
    }
  }
  
  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    
    // 跳转到登录页面
    router.push('/login')
  }
  
  const checkAuthStatus = () => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    
    if (storedToken && storedUser) {
      token.value = storedToken
      user.value = JSON.parse(storedUser)
    }
  }
  
  const hasPermission = (permissions) => {
    if (!user.value || !permissions) return false
    if (Array.isArray(permissions)) {
      return permissions.includes(user.value.role)
    }
    return user.value.role === permissions
  }
  
  const updateProfile = async (profileData) => {
    try {
      if (import.meta.env.DEV) {
        // 开发环境模拟更新
        user.value = { ...user.value, ...profileData }
        localStorage.setItem('user', JSON.stringify(user.value))
        return { success: true, message: '个人信息更新成功' }
      } else {
        const response = await apiService.put('/auth/profile', profileData)
        if (response.success) {
          user.value = { ...user.value, ...response.data }
          localStorage.setItem('user', JSON.stringify(user.value))
          return { success: true, message: '个人信息更新成功' }
        } else {
          throw new Error(response.error || '更新失败')
        }
      }
    } catch (error) {
      console.error('更新个人信息失败:', error)
      return { success: false, error: error.message }
    }
  }
  
  const changePassword = async (passwordData) => {
    try {
      if (import.meta.env.DEV) {
        // 开发环境模拟密码修改
        await new Promise(resolve => setTimeout(resolve, 1000))
        return { success: true, message: '密码修改成功' }
      } else {
        const response = await apiService.put('/auth/password', passwordData)
        if (response.success) {
          return { success: true, message: '密码修改成功' }
        } else {
          throw new Error(response.error || '密码修改失败')
        }
      }
    } catch (error) {
      console.error('密码修改失败:', error)
      return { success: false, error: error.message }
    }
  }
  
  // 初始化时检查认证状态
  checkAuthStatus()
  
  return {
    // 状态
    user,
    token,
    isLoading,
    
    // 计算属性
    isAuthenticated,
    userRole,
    userName,
    userInfo,
    
    // 方法
    login,
    register,
    logout,
    checkAuthStatus,
    hasPermission,
    updateProfile,
    changePassword
  }
})