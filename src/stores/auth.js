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
      // 构建完整的更新数据，确保包含id字段
      const updateData = {
        id: user.value?.id, // 确保包含id字段，后端需要这个字段来识别用户
        username: profileData.username || user.value?.username,
        imageUrl: profileData.imageUrl || profileData.avatar || user.value?.imageUrl,
        email: profileData.email || user.value?.email,
        phonenumber: profileData.phonenumber || profileData.phone || user.value?.phonenumber
      }
      
      // 确保id字段存在且有效
      if (!updateData.id) {
        throw new Error('用户ID不存在，无法更新用户信息')
      }
      
      console.log('发送更新请求:', updateData) // 调试信息
      
      // 直接调用后端更新接口
      const response = await fetch('/api/v1/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updateData)
      })
      
      if (!response.ok) {
        throw new Error(`更新用户信息失败: ${response.status} ${response.statusText}`)
      }
      
      const result = await response.json()
      console.log('更新响应:', result) // 调试信息
      
      if (result.code === 1) {
        // 更新本地存储的用户信息
        user.value = { ...user.value, ...updateData }
        localStorage.setItem('user', JSON.stringify(user.value))
        return { success: true, message: '个人信息更新成功' }
      } else {
        throw new Error(result.msg || '更新失败')
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