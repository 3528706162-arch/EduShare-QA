import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService } from '../services/api.js'

export const useResourcesStore = defineStore('resources', () => {
  // 状态
  const resources = ref([])
  const currentResource = ref(null)
  const categories = ref([])
  const loading = ref(false)
  const pagination = ref({
    page: 1,
    pageSize: 10,
    total: 0
  })
  
  // 计算属性
  const totalPages = computed(() => Math.ceil(pagination.value.total / pagination.value.pageSize))
  
  // 方法
  const fetchResources = async (params = {}) => {
    loading.value = true
    try {
      // 构建请求体，适配新的后端API格式
      const requestBody = {}
      
      // 添加用户ID到请求体
      if (params.userId) {
        requestBody.userId = params.userId
      }
      
      if (params.title) {
        requestBody.title = params.title
      }
      if (params.description) {
        requestBody.description = params.description
      }
      if (params.classBelong) {
        requestBody.classBelong = params.classBelong
      }
      
      console.log('发送给后端的查询参数:', requestBody)
      
      const response = await apiService.resources.findByItem(requestBody)
      console.log('获取资源列表响应:', response)
      
      if (response.success) {
        const data = response.data
        if (data.code === 1) {
          resources.value = data.data || []
          pagination.value.total = data.data ? data.data.length : 0
        } else {
          console.error('获取资源列表失败:', data.msg)
          resources.value = []
        }
      } else {
        throw new Error(`请求失败: ${response.error}`)
      }
    } catch (error) {
      console.error('获取资源列表失败:', error)
      resources.value = []
    } finally {
      loading.value = false
    }
  }
  
  const fetchResourceById = async (id) => {
    try {
      const response = await fetch(`/api/resources/${id}`)
      if (response.ok) {
        currentResource.value = await response.json()
      }
    } catch (error) {
      console.error('获取资源详情失败:', error)
    }
  }
  
  const uploadResource = async (resourceData) => {
    try {
      const formData = new FormData()
      Object.keys(resourceData).forEach(key => {
        formData.append(key, resourceData[key])
      })
      
      const response = await fetch('/api/v1/Fileupload', {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        return { success: true, message: '资源上传成功' }
      } else {
        throw new Error('上传失败')
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const createResource = async (resourceData) => {
    try {
      const response = await fetch('/api/v1/resource/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resourceData)
      })
      
      console.log('createResource响应状态:', response.status)
      
      if (response.ok) {
        const result = await response.json()
        console.log('createResource响应数据:', result)
        
        // 根据后端返回格式判断成功条件
        if (result.code === 1) {
          return { success: true, message: result.msg || '资源创建成功' }
        } else {
          throw new Error(result.msg || '创建资源失败')
        }
      } else {
        const errorText = await response.text()
        console.error('createResource请求失败:', errorText)
        throw new Error(`请求失败: ${response.status} ${errorText}`)
      }
    } catch (error) {
      console.error('createResource异常:', error)
      return { success: false, error: error.message }
    }
  }
  
  const deleteResource = async (id) => {
    try {
      const response = await fetch(`/api/v1/resource/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        resources.value = resources.value.filter(r => r.id !== id)
        return { success: true, message: '删除成功' }
      } else {
        throw new Error('删除失败')
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
  
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/resources/categories')
      if (response.ok) {
        categories.value = await response.json()
      }
    } catch (error) {
      console.error('获取分类列表失败:', error)
    }
  }
  
  const searchResources = async (keyword) => {
    loading.value = true
    try {
      const response = await fetch(`/api/resources/search?keyword=${encodeURIComponent(keyword)}`)
      if (response.ok) {
        resources.value = await response.json()
      }
    } catch (error) {
      console.error('搜索资源失败:', error)
    } finally {
      loading.value = false
    }
  }
  
  return {
    resources,
    currentResource,
    categories,
    loading,
    pagination,
    totalPages,
    fetchResources,
    fetchResourceById,
    uploadResource,
    createResource,
    deleteResource,
    fetchCategories,
    searchResources,
    // 兼容旧的方法名
    getResources: fetchResources,
    getCategories: fetchCategories
  }
})