<template>
  <div class="question-detail">
    <div class="breadcrumb">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/questions' }">问答社区</el-breadcrumb-item>
        <el-breadcrumb-item>问题详情</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="8" animated />
    </div>

    <div v-else-if="question" class="question-content">
      <!-- 问题主体 -->
      <el-card class="question-card">
        <div class="question-header">
          <h1 class="question-title">{{ question.title }}</h1>
          <div class="question-status">
            <el-tag 
              v-if="question.isSolved" 
              type="success" 
              size="large"
            >
              <el-icon><Check /></el-icon>
              已解决
            </el-tag>
            <el-tag 
              v-else 
              type="warning" 
              size="large"
            >
              <el-icon><Clock /></el-icon>
              未解决
            </el-tag>
            <el-tag 
              v-if="question.isHot" 
              type="danger" 
              size="large"
            >
              <el-icon><Fire /></el-icon>
              热门
            </el-tag>
            <!-- 管控状态显示 -->
            <el-tag 
              v-if="isQuestionControlled(questionId)" 
              type="danger" 
              size="large"
            >
              <el-icon><Lock /></el-icon>
              已管控
            </el-tag>
          </div>
        </div>

        <div class="question-header">
            <div class="author-info">
              <el-avatar :size="40" :src="getUserAvatar(question.authorId)" />
              <div class="author-details">
                <span class="author-name">{{ getUserName(question.authorId) }}</span>
                <span class="post-time">{{ formatTime(question.createTime) }}</span>
              </div>
            </div>
          <div class="stats">
            <span class="views">
              <el-icon><View /></el-icon>
              浏览 {{ question.viewCount }}
            </span>
            <span class="answers">
              <el-icon><ChatDotRound /></el-icon>
              回答 {{ question.answerCount }}
            </span>
          </div>
        </div>

        <div class="question-body">
          <div class="question-description">
            <p>{{ question.description }}</p>
          </div>

          <div class="question-tags">
            <el-tag
              v-for="tag in question.tags"
              :key="tag"
              type="info"
              size="large"
            >
              {{ tag }}
            </el-tag>
          </div>
        </div>

        <div class="question-actions">
          <el-button 
            type="primary" 
            @click="showAnswerForm = !showAnswerForm"
            :disabled="isQuestionControlled(questionId)"
          >
            <el-icon><ChatLineRound /></el-icon>
            回答
          </el-button>
          <el-button 
            @click="toggleFollow"
            :disabled="isQuestionControlled(questionId)"
          >
            <el-icon><Star /></el-icon>
            {{ isFollowing ? '取消关注' : '关注问题' }}
          </el-button>
          <el-button 
            v-if="canEdit" 
            type="warning" 
            @click="editQuestion"
            :disabled="isQuestionControlled(questionId)"
          >
            <el-icon><Edit /></el-icon>
            编辑
          </el-button>
          <el-button 
            v-if="canDelete" 
            type="danger" 
            @click="deleteQuestion"
            :disabled="isQuestionControlled(questionId)"
          >
            <el-icon><Delete /></el-icon>
            删除
          </el-button>
        </div>
      </el-card>

      <!-- 回答表单 -->
      <div v-if="showAnswerForm" class="answer-form-container">
        <el-card>
          <template #header>
            <h3>撰写回答</h3>
          </template>
          <el-form :model="answerForm" :rules="answerRules" ref="answerFormRef">
            <el-form-item prop="content">
              <el-input
                v-model="answerForm.content"
                type="textarea"
                :rows="6"
                placeholder="请输入您的回答..."
                maxlength="2000"
                show-word-limit
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submitAnswer" :loading="submittingAnswer">
                提交回答
              </el-button>
              <el-button @click="cancelAnswer">取消</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>

      <!-- 回答列表 -->
      <div class="answers-container">
        <h3>回答 ({{ answers.length }})</h3>
        
        <div v-if="answers.length === 0" class="no-answers">
          <el-empty description="暂无回答">
            <el-button type="primary" @click="showAnswerForm = true">
              成为第一个回答者
            </el-button>
          </el-empty>
        </div>

        <div v-else class="answers-list">
          <div 
            v-for="answer in answers" 
            :key="answer.id" 
            class="answer-item"
            :class="{ 'best-answer': answer.isBest }"
          >
            <div class="answer-header">
              <div class="answer-author">
                <el-avatar :size="32" :src="getUserAvatar(answer.authorId)" />
                <span class="author-name">{{ getUserName(answer.authorId) }}</span>
                <el-tag v-if="answer.isBest" type="success" size="small">
                  最佳答案
                </el-tag>
                <span class="answer-time">{{ formatTime(answer.createTime) }}</span>
              </div>
              
              <div class="answer-actions" v-if="!answer.isBest">
                <el-button 
                  v-if="canMarkBest && question.authorId === authStore.userId" 
                  type="success" 
                  size="small" 
                  @click="markAsBestAnswer(answer.id)"
                >
                  设为最佳
                </el-button>
                <el-button 
                  v-if="canEditAnswer(answer)" 
                  type="warning" 
                  size="small" 
                  @click="editAnswer(answer)"
                >
                  编辑
                </el-button>
                <el-button 
                  v-if="canDeleteAnswer(answer)" 
                  type="danger" 
                  size="small" 
                  @click="deleteAnswer(answer.id)"
                >
                  删除
                </el-button>
              </div>
            </div>

            <div class="answer-content">
              <p>{{ answer.content }}</p>
            </div>

            <div class="answer-footer">
              <div class="answer-stats">
                <el-button 
                  type="text" 
                  :class="{ 'liked': answer.isLiked }" 
                  @click="toggleLike(answer)"
                >
                  <el-icon><ThumbUp /></el-icon>
                  {{ answer.likeCount }}
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-container">
      <el-empty description="问题不存在或已被删除">
        <el-button type="primary" @click="goBack">返回问题列表</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useQuestionsStore } from '@/stores/questions'
import { 
  Check, Clock, View, ChatDotRound, ChatLineRound, 
  Star, Edit, Delete, ThumbUp, Lock
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const questionsStore = useQuestionsStore()

const question = ref(null)
const answers = ref([])
const loading = ref(true)
const showAnswerForm = ref(false)
const submittingAnswer = ref(false)
const isFollowing = ref(false)

// 用户名称和头像缓存
const userNameCache = ref({})
const userAvatarCache = ref({})
const loadingNames = ref({})
const userNames = ref({})
const userAvatars = ref({})

const answerForm = ref({
  content: ''
})

const answerRules = {
  content: [
    { required: true, message: '请输入回答内容', trigger: 'blur' },
    { min: 10, message: '回答内容至少10个字符', trigger: 'blur' }
  ]
}

const questionId = computed(() => route.params.id)

const canEdit = computed(() => {
  if (!question.value) return false
  return authStore.userId === question.value.authorId || authStore.userRole === 'admin'
})

const canDelete = computed(() => {
  if (!question.value) return false
  return authStore.userRole === 'admin'
})

const canMarkBest = computed(() => {
  return authStore.isAuthenticated
})

const canEditAnswer = (answer) => {
  return authStore.userId === answer.authorId || authStore.userRole === 'admin'
}

const canDeleteAnswer = (answer) => {
  return authStore.userRole === 'admin'
}

// 判断问题是否被管控
const isQuestionControlled = (questionId) => {
  try {
    const controlStates = JSON.parse(localStorage.getItem('questionControlStates') || '{}')
    return controlStates[questionId] || false
  } catch (error) {
    console.error('检查管控状态失败:', error)
    return false
  }
}

// 通过API获取用户信息并更新响应式数据
const fetchUserInfo = async (userId) => {
  if (!userId) return
  
  // 如果已经在缓存中，直接返回
  if (userNameCache.value[userId] && userAvatarCache.value[userId]) {
    userNames.value[userId] = userNameCache.value[userId]
    userAvatars.value[userId] = userAvatarCache.value[userId]
    return
  }
  
  // 如果正在加载中，跳过
  if (loadingNames.value[userId]) {
    return
  }
  
  try {
    loadingNames.value[userId] = true
    
    const response = await fetch(`/api/v1/user/findInfo/${userId}`)
    const result = await response.json()
    
    if (result.code === 1 && result.data) {
      // 缓存用户信息并更新响应式数据
      userNameCache.value[userId] = result.data.username || result.data.name || `用户${userId}`
      userAvatarCache.value[userId] = result.data.avatar || result.data.imageUrl || ''
      userNames.value[userId] = result.data.username || result.data.name || `用户${userId}`
      userAvatars.value[userId] = result.data.avatar || result.data.imageUrl || ''
    } else {
      // API调用失败，使用默认值
      userNameCache.value[userId] = `用户${userId}`
      userAvatarCache.value[userId] = ''
      userNames.value[userId] = `用户${userId}`
      userAvatars.value[userId] = ''
    }
  } catch (error) {
    console.error(`获取用户${userId}信息失败:`, error)
    // 出错时使用默认值
    userNameCache.value[userId] = `用户${userId}`
    userAvatarCache.value[userId] = ''
    userNames.value[userId] = `用户${userId}`
    userAvatars.value[userId] = ''
  } finally {
    loadingNames.value[userId] = false
  }
}

// 获取用户名的显示函数
const getUserName = (userId) => {
  if (!userId) return '未知用户'
  return userNames.value[userId] || '加载中...'
}

// 获取用户头像的显示函数
const getUserAvatar = (userId) => {
  if (!userId) return ''
  return userAvatars.value[userId] || ''
}

const loadQuestion = async () => {
  loading.value = true
  try {
    const result = await questionsStore.getQuestion(questionId.value)
    if (result.success) {
      question.value = result.data.question
      answers.value = result.data.answers
      
      // 预加载问题作者的用户信息
      if (question.value && question.value.authorId) {
        fetchUserInfo(question.value.authorId)
      }
      
      // 预加载所有回答的用户信息
      if (answers.value && answers.value.length > 0) {
        answers.value.forEach(answer => {
          if (answer.authorId) {
            fetchUserInfo(answer.authorId)
          }
        })
      }
    } else {
      question.value = null
    }
  } catch (error) {
    console.error('加载问题详情失败:', error)
    question.value = null
  } finally {
    loading.value = false
  }
}

const submitAnswer = async () => {
  if (!answerFormRef.value) return
  
  try {
    const valid = await answerFormRef.value.validate()
    if (!valid) return
    
    submittingAnswer.value = true
    
    const result = await questionsStore.answerQuestion(questionId.value, {
      content: answerForm.value.content
    })
    
    if (result.success) {
      ElMessage.success('回答提交成功!')
      answerForm.value.content = ''
      showAnswerForm.value = false
      await loadQuestion() // 重新加载问题以获取最新回答
    } else {
      ElMessage.error('回答提交失败: ' + result.error)
    }
  } catch (error) {
    console.error('提交回答失败:', error)
    ElMessage.error('提交失败，请重试')
  } finally {
    submittingAnswer.value = false
  }
}

const cancelAnswer = () => {
  answerForm.value.content = ''
  showAnswerForm.value = false
}

const toggleFollow = () => {
  isFollowing.value = !isFollowing.value
  ElMessage.success(isFollowing.value ? '关注成功' : '取消关注')
}

const markAsBestAnswer = async (answerId) => {
  try {
    const result = await questionsStore.markBestAnswer(questionId.value, answerId)
    if (result.success) {
      ElMessage.success('已设为最佳答案')
      await loadQuestion()
    }
  } catch (error) {
    console.error('设置最佳答案失败:', error)
  }
}

const toggleLike = async (answer) => {
  try {
    // 模拟点赞操作
    answer.isLiked = !answer.isLiked
    answer.likeCount += answer.isLiked ? 1 : -1
    ElMessage.success(answer.isLiked ? '点赞成功' : '取消点赞')
  } catch (error) {
    console.error('点赞操作失败:', error)
  }
}

const editQuestion = () => {
  // 跳转到编辑页面
  router.push(`/questions/${questionId.value}/edit`)
}

const deleteQuestion = async () => {
  try {
    await ElMessageBox.confirm('确定要删除这个问题吗？', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const result = await questionsStore.deleteQuestion(questionId.value)
    if (result.success) {
      ElMessage.success('问题删除成功')
      goBack()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除问题失败:', error)
    }
  }
}

const editAnswer = (answer) => {
  // 编辑回答逻辑
  console.log('编辑回答:', answer.id)
}

const deleteAnswer = async (answerId) => {
  try {
    await ElMessageBox.confirm('确定要删除这个回答吗？', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    // 删除回答逻辑
    ElMessage.success('回答删除成功')
    await loadQuestion()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除回答失败:', error)
    }
  }
}

const goBack = () => {
  router.push('/questions')
}

const formatTime = (time) => {
  if (!time) return ''
  const now = new Date()
  const target = new Date(time)
  const diff = now - target
  
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  const week = 7 * day
  
  if (diff < minute) {
    return '刚刚'
  } else if (diff < hour) {
    return Math.floor(diff / minute) + '分钟前'
  } else if (diff < day) {
    return Math.floor(diff / hour) + '小时前'
  } else if (diff < week) {
    return Math.floor(diff / day) + '天前'
  } else {
    return target.toLocaleDateString('zh-CN')
  }
}

onMounted(() => {
  loadQuestion()
})
</script>

<style scoped>
.question-detail {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.breadcrumb {
  margin-bottom: 20px;
}

.question-card {
  margin-bottom: 30px;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.question-title {
  font-size: 28px;
  color: #303133;
  margin: 0;
  line-height: 1.4;
  flex: 1;
  margin-right: 20px;
}

.question-status {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.question-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e4e7ed;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.author-details {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-weight: 600;
  color: #303133;
}

.post-time {
  font-size: 12px;
  color: #909399;
}

.stats {
  display: flex;
  gap: 20px;
  color: #606266;
}

.stats span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.question-body {
  margin-bottom: 24px;
}

.question-description {
  font-size: 16px;
  color: #606266;
  line-height: 1.6;
  margin-bottom: 20px;
}

.question-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.question-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.answer-form-container {
  margin-bottom: 30px;
}

.answers-container h3 {
  font-size: 20px;
  color: #303133;
  margin-bottom: 20px;
}

.answer-item {
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
  transition: all 0.3s ease;
}

.answer-item.best-answer {
  border-color: #67c23a;
  background: #f0f9eb;
}

.answer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.answer-author {
  display: flex;
  align-items: center;
  gap: 12px;
}

.answer-author .author-name {
  font-weight: 600;
  color: #303133;
}

.answer-time {
  font-size: 12px;
  color: #909399;
}

.answer-actions {
  display: flex;
  gap: 8px;
}

.answer-content {
  margin-bottom: 16px;
}

.answer-content p {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}

.answer-footer {
  display: flex;
  justify-content: flex-end;
}

.answer-stats .liked {
  color: #409eff;
}

.loading-container {
  margin-top: 40px;
}

.empty-container {
  text-align: center;
  margin-top: 60px;
}

.no-answers {
  text-align: center;
  padding: 40px 0;
}

@media (max-width: 768px) {
  .question-detail {
    padding: 15px;
  }
  
  .question-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .question-title {
    margin-right: 0;
    margin-bottom: 12px;
    font-size: 24px;
  }
  
  .question-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .answer-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .question-actions {
    flex-direction: column;
  }
  
  .question-actions .el-button {
    width: 100%;
  }
}
</style>