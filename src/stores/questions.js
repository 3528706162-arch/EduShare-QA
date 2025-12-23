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
      
      const response = await fetch(`/api/questions?${queryParams}`)
      if (response.ok) {
        const data = await response.json()
        questions.value = data.questions
        pagination.value = data.pagination
      }
    } catch (error) {
      console.error('获取问题列表失败:', error)
    } finally {
      loading.value = false
    }
  }
  
  const fetchQuestionById = async (id) => {
    try {
      const response = await fetch(`/api/questions/${id}`)
      if (response.ok) {
        currentQuestion.value = await response.json()
      }
    } catch (error) {
      console.error('获取问题详情失败:', error)
    }
  }
  
  const askQuestion = async (questionData) => {
    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionData)
      })
      
      if (response.ok) {
        const newQuestion = await response.json()
        questions.value.unshift(newQuestion)
        return { success: true, message: '问题发布成功' }
      } else {
        throw new Error('发布失败')
      }
    } catch (error) {
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
    askQuestion,
    answerQuestion,
    deleteQuestion,
    searchQuestions,
    markAsBestAnswer
  }
})