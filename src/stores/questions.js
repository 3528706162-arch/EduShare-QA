import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useQuestionsStore = defineStore('questions', () => {
  // 状态
  const questions = ref([])
  const currentQuestion = ref(null)
  const loading = ref(false)
  const pagination = ref({
    page: 1,
    pageSize: 10,
    total: 0
  })
  
  // 计算属性
  const totalPages = computed(() => Math.ceil(pagination.value.total / pagination.value.pageSize))
  const unansweredQuestions = computed(() => questions.value.filter(q => !q.isAnswered))
  
  // 方法
  const fetchQuestions = async (params = {}) => {
    loading.value = true
    try {
      const queryParams = new URLSearchParams({
        page: params.page || pagination.value.page,
        pageSize: params.pageSize || pagination.value.pageSize,
        ...params
      })
      
      // 修改：使用新的API接口
      const response = await fetch(`/api/v1/question/findall?${queryParams}`)
      if (response.ok) {
        const data = await response.json()
        // 修改：适配新的响应格式
        if (data.code === 1) {
          questions.value = data.data || []
          // 修改：设置分页信息
          pagination.value.total = data.data?.length || 0
        } else {
          console.error('获取问题列表失败:', data.msg)
          questions.value = []
          pagination.value.total = 0
        }
      } else {
        throw new Error('网络请求失败')
      }
    } catch (error) {
      console.error('获取问题列表失败:', error)
      questions.value = []
      pagination.value.total = 0
    } finally {
      loading.value = false
    }
  }
  
  const fetchQuestionById = async (id) => {
    try {
      const response = await fetch(`/api/v1/question/detail/${id}`)
      if (response.ok) {
        const data = await response.json()
        if (data.code === 1) {
          currentQuestion.value = data.data
        } else {
          console.error('获取问题详情失败:', data.msg)
          currentQuestion.value = null
        }
      } else {
        currentQuestion.value = null
      }
    } catch (error) {
      console.error('获取问题详情失败:', error)
      currentQuestion.value = null
    }
  }
  
  const createQuestion = async (questionData) => {
    try {
      // 获取当前用户ID（这里需要根据您的认证系统调整）
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
      const authorId = currentUser.id || '1' // 默认值，实际应该从认证系统获取
      
      // 构建符合后端API格式的请求体
      const requestBody = {
        title: questionData.title,
        content: questionData.content, // 修复：使用正确的content字段
        authorId: authorId,
        questionType: questionData.category || 'other',
        classBelong: questionData.classBelong || '', // 修改：使用classBelong字段名
        fileUrl: questionData.attachments.length > 0 ? questionData.attachments[0].url : '',
        tags: questionData.tags.join(','), // 将数组转换为逗号分隔的字符串
        createdAt: new Date().toISOString()
      }
      
      console.log('发送给后端的问题数据:', requestBody)
      
      const response = await fetch('/api/v1/question/add', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(requestBody)
      })
      
      console.log('问题发布响应状态:', response.status)
      
      if (response.ok) {
        const result = await response.json()
        console.log('问题发布响应数据:', result)
        
        // 根据后端响应格式判断成功条件
        if (result.code === 1) {
          return { success: true, message: result.msg || '问题发布成功' }
        } else {
          throw new Error(result.msg || '问题发布失败')
        }
      } else {
        const errorText = await response.text()
        console.error('问题发布请求失败:', errorText)
        throw new Error(`请求失败: ${response.status} ${errorText}`)
      }
    } catch (error) {
      console.error('发布问题异常:', error)
      return { success: false, error: error.message }
    }
  }
  
  const answerQuestion = async (questionId, answerData) => {
    try {
      const response = await fetch(`/api/questions/${questionId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answerData)
      })
      
      if (response.ok) {
        const updatedQuestion = await response.json()
        // 更新问题列表中的对应问题
        const index = questions.value.findIndex(q => q.id === questionId)
        if (index !== -1) {
          questions.value[index] = updatedQuestion
        }
        
        if (currentQuestion.value && currentQuestion.value.id === questionId) {
          currentQuestion.value = updatedQuestion
        }
        
        return { success: true, message: '回答提交成功' }
      } else {
        throw new Error('回答失败')
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
  
  const deleteQuestion = async (id) => {
    try {
      const response = await fetch(`/api/questions/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        questions.value = questions.value.filter(q => q.id !== id)
        return { success: true, message: '删除成功' }
      } else {
        throw new Error('删除失败')
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
  
  const searchQuestions = async (keyword) => {
    loading.value = true
    try {
      const response = await fetch(`/api/questions/search?keyword=${encodeURIComponent(keyword)}`)
      if (response.ok) {
        questions.value = await response.json()
      }
    } catch (error) {
      console.error('搜索问题失败:', error)
    } finally {
      loading.value = false
    }
  }
  
  const markAsBestAnswer = async (questionId, answerId) => {
    try {
      const response = await fetch(`/api/questions/${questionId}/best-answer`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answerId })
      })
      
      if (response.ok) {
        const updatedQuestion = await response.json()
        
        // 更新当前问题和问题列表
        if (currentQuestion.value && currentQuestion.value.id === questionId) {
          currentQuestion.value = updatedQuestion
        }
        
        const index = questions.value.findIndex(q => q.id === questionId)
        if (index !== -1) {
          questions.value[index] = updatedQuestion
        }
        
        return { success: true, message: '已标记为最佳答案' }
      } else {
        throw new Error('标记失败')
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
  
  return {
    questions,
    currentQuestion,
    loading,
    pagination,
    totalPages,
    unansweredQuestions,
    fetchQuestions,
    fetchQuestionById,
    createQuestion,
    answerQuestion,
    deleteQuestion,
    searchQuestions,
    markAsBestAnswer
  }
})