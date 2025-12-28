// API服务模块 - 统一管理所有HTTP请求

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL
  }
//666
  // 通用请求方法
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    }

    // 添加认证token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      console.error('API请求失败:', error)
      return { success: false, error: error.message }
    }
  }

  // 认证相关API
  auth = {
    login: (credentials) => this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),

    register: (userData) => this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    }),

    getProfile: () => this.request('/auth/profile'),

    updateProfile: (profileData) => this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    })
  }

  // 资源相关API
  resources = {
    list: (params = {}) => {
      const queryString = new URLSearchParams(params).toString()
      return this.request(`/resources?${queryString}`)
    },

    get: (id) => this.request(`/resources/${id}`),

    create: (resourceData) => this.request('/resources', {
      method: 'POST',
      body: JSON.stringify(resourceData)
    }),

    update: (id, resourceData) => this.request(`/resources/${id}`, {
      method: 'PUT',
      body: JSON.stringify(resourceData)
    }),

    delete: (id) => this.request(`/resources/${id}`, {
      method: 'DELETE'
    }),

    upload: (formData) => this.request('/resources/upload', {
      method: 'POST',
      headers: {},
      body: formData
    }),

    search: (keyword) => this.request(`/resources/search?keyword=${encodeURIComponent(keyword)}`),

    getCategories: () => this.request('/resources/categories'),

    download: (id) => this.request(`/resources/${id}/download`)
  }

  // 问答相关API
  questions = {
    list: (params = {}) => {
      const queryString = new URLSearchParams(params).toString()
      return this.request(`/questions?${queryString}`)
    },

    get: (id) => this.request(`/questions/${id}`),

    create: (questionData) => this.request('/questions', {
      method: 'POST',
      body: JSON.stringify(questionData)
    }),

    update: (id, questionData) => this.request(`/questions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(questionData)
    }),

    delete: (id) => this.request(`/questions/${id}`, {
      method: 'DELETE'
    }),

    answer: (questionId, answerData) => this.request(`/questions/${questionId}/answer`, {
      method: 'POST',
      body: JSON.stringify(answerData)
    }),

    search: (keyword) => this.request(`/questions/search?keyword=${encodeURIComponent(keyword)}`),

    markBestAnswer: (questionId, answerId) => this.request(`/questions/${questionId}/best-answer`, {
      method: 'PUT',
      body: JSON.stringify({ answerId })
    })
  }

  // 课程相关API
  courses = {
    list: () => this.request('/api/v1/class/findall'),
    
    get: (id) => this.request(`/api/v1/class/${id}`),
    
    create: (courseData) => this.request('/api/v1/class/add', {
      method: 'POST',
      body: JSON.stringify(courseData)
    }),
    
    update: (id, courseData) => this.request('/api/v1/class', {
      method: 'PUT',
      body: JSON.stringify({ id, ...courseData })
    }),
    
    delete: (id) => this.request(`/api/v1/class?ids=${id}`, {
      method: 'DELETE'
    }),
    
    deleteBatch: (ids) => this.request(`/api/v1/class?ids=${ids.join(',')}`, {
      method: 'DELETE'
    })
  }

  // 教师相关API
  teachers = {
    list: () => this.request('/api/v1/teacher/findall'),
    
    get: (id) => this.request(`/api/v1/teacher/${id}`),
    
    create: (teacherData) => this.request('/api/v1/teacher/add', {
      method: 'POST',
      body: JSON.stringify(teacherData)
    }),
    
    update: (id, teacherData) => this.request('/api/v1/teacher', {
      method: 'PUT',
      body: JSON.stringify({ id, ...teacherData })
    }),
    
    delete: (id) => this.request(`/api/v1/teacher?ids=${id}`, {
      method: 'DELETE'
    }),
    
    deleteBatch: (ids) => this.request(`/api/v1/teacher?ids=${ids.join(',')}`, {
      method: 'DELETE'
    })
  }

  // 通知相关API
  notifications = {
    list: () => this.request('/notifications'),
    
    markAsRead: (id) => this.request(`/notifications/${id}/read`, {
      method: 'PUT'
    }),
    
    markAllAsRead: () => this.request('/notifications/read-all', {
      method: 'PUT'
    })
  }

  // 统计相关API
  statistics = {
    dashboard: () => this.request('/statistics/dashboard'),
    
    resourceStats: () => this.request('/statistics/resources'),
    
    questionStats: () => this.request('/statistics/questions'),
    
    userStats: () => this.request('/statistics/users')
  }
}

// 创建单例实例
export const apiService = new ApiService()

export default apiService