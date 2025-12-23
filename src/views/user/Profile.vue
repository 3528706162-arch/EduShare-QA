<template>
  <div class="user-profile">
    <div class="breadcrumb">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>个人中心</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div class="profile-container">
      <!-- 左侧个人信息卡片 -->
      <div class="profile-sidebar">
        <el-card class="user-card">
          <div class="user-info">
            <div class="avatar-section">
              <el-avatar :size="100" :src="userInfo.avatar" />
              <div class="user-status">
                <span class="status-dot" :class="{ online: userInfo.isOnline }"></span>
                <span class="status-text">{{ userInfo.isOnline ? '在线' : '离线' }}</span>
              </div>
            </div>
            
            <div class="user-details">
              <h2 class="username">{{ userInfo.nickname || userInfo.username }}</h2>
              <p class="user-title">{{ userInfo.title || '社区成员' }}</p>
              <p class="user-bio" v-if="userInfo.bio">{{ userInfo.bio }}</p>
              
              <div class="user-stats">
                <div class="stat-item">
                  <span class="stat-number">{{ userStats.questions || 0 }}</span>
                  <span class="stat-label">提问</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number">{{ userStats.answers || 0 }}</span>
                  <span class="stat-label">回答</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number">{{ userStats.resources || 0 }}</span>
                  <span class="stat-label">资源</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number">{{ userStats.reputation || 0 }}</span>
                  <span class="stat-label">声望</span>
                </div>
              </div>
            </div>
          </div>

          <div class="user-actions">
            <el-button type="primary" @click="goToSettings">
              <el-icon><Setting /></el-icon>
              账户设置
            </el-button>
            <el-button @click="editProfile">
              <el-icon><Edit /></el-icon>
              编辑资料
            </el-button>
          </div>

          <div class="user-meta">
            <div class="meta-item" v-if="userInfo.location">
              <el-icon><Location /></el-icon>
              <span>{{ userInfo.location }}</span>
            </div>
            <div class="meta-item" v-if="userInfo.email">
              <el-icon><Message /></el-icon>
              <span>{{ userInfo.email }}</span>
            </div>
            <div class="meta-item">
              <el-icon><Calendar /></el-icon>
              <span>加入于 {{ formatJoinDate(userInfo.joinDate) }}</span>
            </div>
          </div>
        </el-card>

        <!-- 技能标签 -->
        <el-card class="skills-card" v-if="userInfo.skills && userInfo.skills.length > 0">
          <template #header>
            <h3>技术方向</h3>
          </template>
          <div class="skills-list">
            <el-tag
              v-for="skill in userInfo.skills"
              :key="skill"
              type="info"
              size="small"
              class="skill-tag"
            >
              {{ getSkillLabel(skill) }}
            </el-tag>
          </div>
        </el-card>

        <!-- 最近活动 -->
        <el-card class="activity-card">
          <template #header>
            <h3>最近活动</h3>
          </template>
          <div class="activity-list">
            <div 
              v-for="activity in recentActivities" 
              :key="activity.id"
              class="activity-item"
            >
              <div class="activity-icon">
                <el-icon v-if="activity.type === 'question'"><QuestionFilled /></el-icon>
                <el-icon v-if="activity.type === 'answer'"><ChatDotRound /></el-icon>
                <el-icon v-if="activity.type === 'resource'"><Document /></el-icon>
              </div>
              <div class="activity-content">
                <p class="activity-title">{{ activity.title }}</p>
                <span class="activity-time">{{ formatTime(activity.time) }}</span>
              </div>
            </div>
            <div v-if="recentActivities.length === 0" class="no-activity">
              暂无活动记录
            </div>
          </div>
        </el-card>
      </div>

      <!-- 右侧内容区域 -->
      <div class="profile-content">
        <el-tabs v-model="activeTab" type="card" class="profile-tabs">
          <!-- 我的提问 -->
          <el-tab-pane label="我的提问" name="questions">
            <div class="tab-content">
              <div class="content-header">
                <h3>我的提问</h3>
                <el-button type="primary" @click="askQuestion">
                  <el-icon><Plus /></el-icon>
                  提问
                </el-button>
              </div>
              
              <div class="questions-list">
                <div 
                  v-for="question in userQuestions" 
                  :key="question.id"
                  class="question-item"
                >
                  <div class="question-main">
                    <h4 class="question-title">
                      <router-link :to="`/questions/${question.id}`">
                        {{ question.title }}
                      </router-link>
                    </h4>
                    <p class="question-description">{{ question.description }}</p>
                    <div class="question-meta">
                      <span class="question-time">{{ formatTime(question.createTime) }}</span>
                      <span class="question-answers">
                        <el-icon><ChatDotRound /></el-icon>
                        {{ question.answerCount }} 回答
                      </span>
                      <span class="question-views">
                        <el-icon><View /></el-icon>
                        {{ question.viewCount }} 浏览
                      </span>
                      <el-tag 
                        :type="getQuestionStatusType(question.status)"
                        size="small"
                      >
                        {{ getQuestionStatusLabel(question.status) }}
                      </el-tag>
                    </div>
                  </div>
                  <div class="question-actions">
                    <el-button size="small" @click="editQuestion(question)">编辑</el-button>
                    <el-button size="small" type="danger" @click="deleteQuestion(question)">
                      删除
                    </el-button>
                  </div>
                </div>
                
                <div v-if="userQuestions.length === 0" class="no-data">
                  <el-empty description="暂无提问记录">
                    <el-button type="primary" @click="askQuestion">去提问</el-button>
                  </el-empty>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <!-- 我的回答 -->
          <el-tab-pane label="我的回答" name="answers">
            <div class="tab-content">
              <div class="content-header">
                <h3>我的回答</h3>
              </div>
              
              <div class="answers-list">
                <div 
                  v-for="answer in userAnswers" 
                  :key="answer.id"
                  class="answer-item"
                >
                  <div class="answer-question">
                    <h4 class="question-title">
                      <router-link :to="`/questions/${answer.questionId}`">
                        {{ answer.questionTitle }}
                      </router-link>
                    </h4>
                  </div>
                  <div class="answer-content">
                    <p class="answer-text">{{ answer.content }}</p>
                    <div class="answer-meta">
                      <span class="answer-time">{{ formatTime(answer.createTime) }}</span>
                      <span class="answer-votes">
                        <el-icon><CaretTop /></el-icon>
                        {{ answer.upvotes }} 赞同
                      </span>
                      <span class="answer-accepted" v-if="answer.isAccepted">
                        <el-icon><SuccessFilled /></el-icon>
                        已采纳
                      </span>
                    </div>
                  </div>
                  <div class="answer-actions">
                    <el-button size="small" @click="editAnswer(answer)">编辑</el-button>
                    <el-button size="small" type="danger" @click="deleteAnswer(answer)">
                      删除
                    </el-button>
                  </div>
                </div>
                
                <div v-if="userAnswers.length === 0" class="no-data">
                  <el-empty description="暂无回答记录" />
                </div>
              </div>
            </div>
          </el-tab-pane>

          <!-- 我的资源 -->
          <el-tab-pane label="我的资源" name="resources">
            <div class="tab-content">
              <div class="content-header">
                <h3>我的资源</h3>
                <el-button type="primary" @click="uploadResource">
                  <el-icon><Plus /></el-icon>
                  上传资源
                </el-button>
              </div>
              
              <div class="resources-list">
                <div 
                  v-for="resource in userResources" 
                  :key="resource.id"
                  class="resource-item"
                >
                  <div class="resource-icon">
                    <el-icon><Document /></el-icon>
                  </div>
                  <div class="resource-info">
                    <h4 class="resource-title">
                      <router-link :to="`/resources/${resource.id}`">
                        {{ resource.title }}
                      </router-link>
                    </h4>
                    <p class="resource-description">{{ resource.description }}</p>
                    <div class="resource-meta">
                      <span class="resource-time">{{ formatTime(resource.createTime) }}</span>
                      <span class="resource-downloads">
                        <el-icon><Download /></el-icon>
                        {{ resource.downloadCount }} 下载
                      </span>
                      <span class="resource-rating">
                        <el-icon><Star /></el-icon>
                        {{ resource.rating }}
                      </span>
                      <el-tag size="small">{{ resource.category }}</el-tag>
                    </div>
                  </div>
                  <div class="resource-actions">
                    <el-button size="small" @click="editResource(resource)">编辑</el-button>
                    <el-button size="small" type="danger" @click="deleteResource(resource)">
                      删除
                    </el-button>
                  </div>
                </div>
                
                <div v-if="userResources.length === 0" class="no-data">
                  <el-empty description="暂无资源记录">
                    <el-button type="primary" @click="uploadResource">上传资源</el-button>
                  </el-empty>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <!-- 我的收藏 -->
          <el-tab-pane label="我的收藏" name="favorites">
            <div class="tab-content">
              <div class="content-header">
                <h3>我的收藏</h3>
              </div>
              
              <div class="favorites-list">
                <div 
                  v-for="favorite in userFavorites" 
                  :key="favorite.id"
                  class="favorite-item"
                >
                  <div class="favorite-icon">
                    <el-icon v-if="favorite.type === 'question'"><QuestionFilled /></el-icon>
                    <el-icon v-if="favorite.type === 'resource'"><Document /></el-icon>
                  </div>
                  <div class="favorite-info">
                    <h4 class="favorite-title">
                      <router-link :to="getFavoriteLink(favorite)">
                        {{ favorite.title }}
                      </router-link>
                    </h4>
                    <p class="favorite-description">{{ favorite.description }}</p>
                    <div class="favorite-meta">
                      <span class="favorite-time">{{ formatTime(favorite.createTime) }}</span>
                      <el-tag size="small">{{ getFavoriteTypeLabel(favorite.type) }}</el-tag>
                    </div>
                  </div>
                  <div class="favorite-actions">
                    <el-button size="small" type="danger" @click="removeFavorite(favorite)">
                      取消收藏
                    </el-button>
                  </div>
                </div>
                
                <div v-if="userFavorites.length === 0" class="no-data">
                  <el-empty description="暂无收藏记录" />
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { 
  Setting, Edit, Location, Message, Calendar, 
  QuestionFilled, ChatDotRound, Document, Plus, 
  View, CaretTop, SuccessFilled, Download, Star 
} from '@element-plus/icons-vue'

const router = useRouter()
const authStore = useAuthStore()

const activeTab = ref('questions')

// 用户信息
const userInfo = ref({})
const userStats = ref({})

// 用户内容数据
const userQuestions = ref([])
const userAnswers = ref([])
const userResources = ref([])
const userFavorites = ref([])
const recentActivities = ref([])

// 技能标签映射
const skillLabels = {
  frontend: '前端开发',
  backend: '后端开发',
  mobile: '移动开发',
  database: '数据库',
  ai: '人工智能',
  bigdata: '大数据',
  cloud: '云计算',
  security: '网络安全',
  devops: 'DevOps',
  design: '产品设计'
}

// 问题状态映射
const questionStatus = {
  open: { label: '待回答', type: 'warning' },
  answered: { label: '已回答', type: 'info' },
  resolved: { label: '已解决', type: 'success' },
  closed: { label: '已关闭', type: 'danger' }
}

const getSkillLabel = (skill) => {
  return skillLabels[skill] || skill
}

const getQuestionStatusLabel = (status) => {
  return questionStatus[status]?.label || status
}

const getQuestionStatusType = (status) => {
  return questionStatus[status]?.type || 'info'
}

const formatJoinDate = (date) => {
  if (!date) return '未知'
  return new Date(date).toLocaleDateString('zh-CN')
}

const formatTime = (time) => {
  if (!time) return '未知'
  const now = new Date()
  const target = new Date(time)
  const diff = now - target
  
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  
  if (diff < minute) return '刚刚'
  if (diff < hour) return Math.floor(diff / minute) + '分钟前'
  if (diff < day) return Math.floor(diff / hour) + '小时前'
  if (diff < 7 * day) return Math.floor(diff / day) + '天前'
  
  return target.toLocaleDateString('zh-CN')
}

const getFavoriteLink = (favorite) => {
  if (favorite.type === 'question') {
    return `/questions/${favorite.itemId}`
  } else if (favorite.type === 'resource') {
    return `/resources/${favorite.itemId}`
  }
  return '#'
}

const getFavoriteTypeLabel = (type) => {
  const labels = {
    question: '问题',
    resource: '资源'
  }
  return labels[type] || type
}

// 导航方法
const goToSettings = () => {
  router.push('/settings')
}

const editProfile = () => {
  router.push('/settings?tab=profile')
}

const askQuestion = () => {
  router.push('/questions/ask')
}

const uploadResource = () => {
  router.push('/resources/upload')
}

// 内容操作方法
const editQuestion = (question) => {
  ElMessage.info('编辑问题功能开发中...')
}

const deleteQuestion = (question) => {
  ElMessageBox.confirm('确定要删除这个问题吗？', '确认删除', {
    type: 'warning'
  }).then(() => {
    ElMessage.success('问题删除成功')
  }).catch(() => {
    // 取消删除
  })
}

const editAnswer = (answer) => {
  ElMessage.info('编辑回答功能开发中...')
}

const deleteAnswer = (answer) => {
  ElMessageBox.confirm('确定要删除这个回答吗？', '确认删除', {
    type: 'warning'
  }).then(() => {
    ElMessage.success('回答删除成功')
  }).catch(() => {
    // 取消删除
  })
}

const editResource = (resource) => {
  ElMessage.info('编辑资源功能开发中...')
}

const deleteResource = (resource) => {
  ElMessageBox.confirm('确定要删除这个资源吗？', '确认删除', {
    type: 'warning'
  }).then(() => {
    ElMessage.success('资源删除成功')
  }).catch(() => {
    // 取消删除
  })
}

const removeFavorite = (favorite) => {
  ElMessageBox.confirm('确定要取消收藏吗？', '确认取消', {
    type: 'warning'
  }).then(() => {
    ElMessage.success('已取消收藏')
  }).catch(() => {
    // 取消操作
  })
}

// 加载用户数据
const loadUserData = async () => {
  try {
    // 加载用户信息
    const currentUser = authStore.userInfo
    if (currentUser) {
      userInfo.value = {
        ...currentUser,
        isOnline: true, // 模拟在线状态
        joinDate: currentUser.createTime || new Date().toISOString()
      }
    }
    
    // 加载用户统计数据
    userStats.value = {
      questions: 12,
      answers: 45,
      resources: 8,
      reputation: 156
    }
    
    // 加载用户提问
    userQuestions.value = [
      {
        id: 1,
        title: 'Vue 3 中如何实现响应式数据绑定？',
        description: '在Vue 3中，响应式系统有了很大的变化，想了解具体的实现原理和使用方法...',
        createTime: '2024-01-15T10:30:00Z',
        answerCount: 5,
        viewCount: 128,
        status: 'resolved'
      },
      {
        id: 2,
        title: 'Element Plus 表格组件如何实现自定义列？',
        description: '需要在一个表格中显示复杂的数据结构，不知道如何自定义列的内容和样式...',
        createTime: '2024-01-10T14:20:00Z',
        answerCount: 3,
        viewCount: 89,
        status: 'answered'
      }
    ]
    
    // 加载用户回答
    userAnswers.value = [
      {
        id: 1,
        questionId: 3,
        questionTitle: '如何优化前端性能？',
        content: '前端性能优化可以从多个方面入手，包括代码压缩、图片优化、懒加载等...',
        createTime: '2024-01-12T16:45:00Z',
        upvotes: 12,
        isAccepted: true
      }
    ]
    
    // 加载用户资源
    userResources.value = [
      {
        id: 1,
        title: 'Vue 3 开发最佳实践指南',
        description: '整理了Vue 3开发中的最佳实践和常见问题的解决方案',
        createTime: '2024-01-08T09:15:00Z',
        downloadCount: 56,
        rating: 4.8,
        category: '前端开发'
      }
    ]
    
    // 加载用户收藏
    userFavorites.value = [
      {
        id: 1,
        type: 'question',
        itemId: 5,
        title: 'TypeScript 泛型的使用技巧',
        description: '深入探讨TypeScript泛型的高级用法和最佳实践',
        createTime: '2024-01-14T11:20:00Z'
      }
    ]
    
    // 加载最近活动
    recentActivities.value = [
      {
        id: 1,
        type: 'question',
        title: '发布了新问题：Vue 3 响应式原理',
        time: '2024-01-15T10:30:00Z'
      },
      {
        id: 2,
        type: 'answer',
        title: '回答了问题：前端性能优化',
        time: '2024-01-12T16:45:00Z'
      }
    ]
    
  } catch (error) {
    console.error('加载用户数据失败:', error)
    ElMessage.error('加载用户数据失败')
  }
}

onMounted(() => {
  loadUserData()
})
</script>

<style scoped>
.user-profile {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.breadcrumb {
  margin-bottom: 20px;
}

.profile-container {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 20px;
}

.profile-sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.user-card {
  text-align: center;
}

.user-info {
  margin-bottom: 20px;
}

.avatar-section {
  margin-bottom: 15px;
}

.user-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  margin-top: 10px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #909399;
}

.status-dot.online {
  background-color: #67c23a;
}

.status-text {
  font-size: 12px;
  color: #909399;
}

.user-details h2 {
  margin: 10px 0 5px;
  color: #303133;
}

.user-title {
  color: #606266;
  margin-bottom: 10px;
}

.user-bio {
  color: #909399;
  font-size: 14px;
  line-height: 1.4;
  margin-bottom: 15px;
}

.user-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin: 15px 0;
}

.stat-item {
  text-align: center;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.stat-number {
  display: block;
  font-size: 18px;
  font-weight: 600;
  color: #409eff;
}

.stat-label {
  font-size: 12px;
  color: #909399;
}

.user-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 15px;
}

.user-meta {
  text-align: left;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 14px;
  color: #606266;
}

.skills-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.skill-tag {
  margin-bottom: 5px;
}

.activity-list {
  max-height: 200px;
  overflow-y: auto;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid #ebeef5;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  color: #409eff;
}

.activity-content {
  flex: 1;
}

.activity-title {
  margin: 0;
  font-size: 14px;
  color: #303133;
}

.activity-time {
  font-size: 12px;
  color: #909399;
}

.no-activity {
  text-align: center;
  color: #909399;
  font-size: 14px;
  padding: 20px;
}

.profile-content {
  min-height: 600px;
}

.tab-content {
  padding: 0;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.questions-list,
.answers-list,
.resources-list,
.favorites-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.question-item,
.answer-item,
.resource-item,
.favorite-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 15px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background-color: #fff;
}

.question-main,
.answer-content,
.resource-info,
.favorite-info {
  flex: 1;
}

.question-title,
.resource-title,
.favorite-title {
  margin: 0 0 8px 0;
  font-size: 16px;
}

.question-title a,
.resource-title a,
.favorite-title a {
  color: #303133;
  text-decoration: none;
}

.question-title a:hover,
.resource-title a:hover,
.favorite-title a:hover {
  color: #409eff;
}

.question-description,
.answer-text,
.resource-description,
.favorite-description {
  margin: 0 0 10px 0;
  color: #606266;
  font-size: 14px;
  line-height: 1.4;
}

.question-meta,
.answer-meta,
.resource-meta,
.favorite-meta {
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: 12px;
  color: #909399;
}

.question-actions,
.answer-actions,
.resource-actions,
.favorite-actions {
  display: flex;
  gap: 8px;
}

.answer-question {
  margin-bottom: 10px;
}

.answer-question .question-title {
  font-size: 14px;
}

.resource-icon,
.favorite-icon {
  font-size: 24px;
  color: #409eff;
  margin-right: 15px;
}

.no-data {
  text-align: center;
  padding: 40px 0;
}

@media (max-width: 768px) {
  .profile-container {
    grid-template-columns: 1fr;
  }
  
  .user-stats {
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }
  
  .question-item,
  .answer-item,
  .resource-item,
  .favorite-item {
    flex-direction: column;
    align-items: stretch;
  }
  
  .question-actions,
  .answer-actions,
  .resource-actions,
  .favorite-actions {
    justify-content: flex-end;
    margin-top: 10px;
  }
  
  .question-meta,
  .answer-meta,
  .resource-meta,
  .favorite-meta {
    flex-wrap: wrap;
    gap: 8px;
  }
}
</style>