import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

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
      const queryParams = new URLSearchParams({
        page: params.page || pagination.value.page,
        pageSize: params.pageSize || pagination.value.pageSize,
        ...params
      })
      
      const response = await fetch(`/api/resources?${queryParams}`)
      if (response.ok) {
        const data = await response.json()
        resources.value = data.resources
        pagination.value = data.pagination
      }
    } catch (error) {
      console.error('获取资源列表失败:', error)
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
      
      const response = await fetch('/api/resources/upload', {
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
  
  const deleteResource = async (id) => {
    try {
      const response = await fetch(`/api/resources/${id}`, {
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
    deleteResource,
    fetchCategories,
    searchResources
  }
})