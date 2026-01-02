<template>
  <div class="home-container">
    <!-- 管理员控制台 -->
    <div v-if="authStore.userInfo?.role === 'admin'" class="admin-dashboard">
      <div class="dashboard-header">
        <h1 class="dashboard-title">管理员控制台</h1>
        <p class="dashboard-subtitle">全面管理平台核心功能模块</p>
      </div>
      
      <div class="admin-grid">
        <div class="admin-item">
          <el-card class="admin-card" @click="navigateTo('CourseManagement')">
            <div class="card-icon">
              <el-icon><Reading /></el-icon>
            </div>
            <div class="card-info">
              <h3>课程管理</h3>
              <p>管理平台课程信息和课程内容</p>
            </div>
          </el-card>
        </div>
        
        <div class="admin-item">
          <el-card class="admin-card" @click="navigateTo('TeacherManagement')">
            <div class="card-icon">
              <el-icon><User /></el-icon>
            </div>
            <div class="card-info">
              <h3>教师管理</h3>
              <p>管理教师账户和教学权限</p>
            </div>
          </el-card>
        </div>
        
        <div class="admin-item">
          <el-card class="admin-card" @click="navigateTo('ResourceManagement')">
            <div class="card-icon">
              <el-icon><Document /></el-icon>
            </div>
            <div class="card-info">
              <h3>学习资源管理</h3>
              <p>审核和管理学习资源内容</p>
            </div>
          </el-card>
        </div>
        
        <div class="admin-item">
          <el-card class="admin-card" @click="navigateTo('QuestionManagement')">
            <div class="card-icon">
              <el-icon><ChatDotRound /></el-icon>
            </div>
            <div class="card-info">
              <h3>问答内容管理</h3>
              <p>审核和管理问答社区内容</p>
            </div>
          </el-card>
        </div>
      </div>
    </div>
    
    <!-- 普通用户首页 -->
    <div v-else>
      <!-- 顶部横幅 -->
      <div class="hero-banner">
        <div class="hero-content">
          <h1 class="hero-title">EduShare QA</h1>
          <h2 class="hero-subtitle">大学生线上学习资源共享与问答系统</h2>
          <p class="hero-description">
            连接知识，分享智慧，共同成长。在这里，你可以找到优质的学习资源，
            解决学习难题，与师生互动交流。
          </p>
          <div class="hero-actions">
            <el-button type="primary" size="large" @click="navigateToResources">
              <el-icon><Collection /></el-icon>
              浏览资源
            </el-button>
            <el-button type="success" size="large" @click="navigateToQuestions">
              <el-icon><ChatDotRound /></el-icon>
              问答社区
            </el-button>
          </div>
        </div>
        <div class="hero-image">
          <el-icon class="hero-icon"><Reading /></el-icon>
        </div>
      </div>

    <!-- 快捷操作 -->
    <div class="features-section">
      <div class="section-header">
        <h2 class="section-title">快捷操作</h2>
        <p class="section-subtitle">快速访问常用功能</p>
      </div>
      
      <div class="features-grid">
        <div class="feature-card" @click="navigateToResources">
          <div class="feature-icon">
            <el-icon><Collection /></el-icon>
          </div>
          <h3>资源中心</h3>
          <p>浏览和下载丰富的学习资源，包括课件、笔记、习题等</p>
          <div class="feature-stats">
            <span>资源总数：{{ totalStats.resources || '加载中...' }}</span>
          </div>
        </div>
        
        <div class="feature-card" @click="navigateToQuestions">
          <div class="feature-icon">
            <el-icon><ChatDotRound /></el-icon>
          </div>
          <h3>问答社区</h3>
          <p>与师生互动交流，解决学习难题，分享知识经验</p>
          <div class="feature-stats">
            <span>问题总数：{{ totalStats.questions || '加载中...' }}</span>
          </div>
        </div>
        
        <div class="feature-card" @click="navigateToCourses">
          <div class="feature-icon">
            <el-icon><Reading /></el-icon>
          </div>
          <h3>课程中心</h3>
          <p>查看课程信息，管理学习进度，参与课程讨论</p>
          <div class="feature-stats">
            <span>课程总数：{{ totalStats.courses || '加载中...' }}</span>
          </div>
        </div>
        
        <div class="feature-card" @click="navigateToProfile">
          <div class="feature-icon">
            <el-icon><User /></el-icon>
          </div>
          <h3>个人中心</h3>
          <p>个性化学习记录，资源收藏，问题追踪，学习进度管理</p>
          <div class="feature-stats">
            <span>我的收藏：{{ userStats.collections || '加载中...' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 热门资源 -->
    <div class="hot-section">
      <div class="section-header">
        <h2 class="section-title">热门资源</h2>
        <el-link type="primary" :underline="false" @click="navigateToResources">
          查看全部 <el-icon><ArrowRight /></el-icon>
        </el-link>
      </div>
      
      <div class="resources-grid">
        <div 
          class="resource-card" 
          v-for="resource in hotResources" 
          :key="resource.id"
          @click="viewResource(resource)"
        >
          <div class="resource-header">
            <el-tag :type="getResourceTypeTag(resource.type)" size="small">
              {{ getResourceTypeText(resource.type) }}
            </el-tag>
            <span class="resource-downloads">
              <el-icon><Download /></el-icon>
              {{ resource.downloads }}
            </span>
          </div>
          <h4 class="resource-title">{{ resource.title }}</h4>
          <p class="resource-description">{{ resource.description }}</p>
          <div class="resource-footer">
            <span class="resource-author">{{ resource.author }}</span>
            <span class="resource-time">{{ formatTime(resource.createTime) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 最新问题 -->
    <div class="questions-section">
      <div class="section-header">
        <h2 class="section-title">最新问题</h2>
        <el-link type="primary" :underline="false" @click="navigateToQuestions">
          查看全部 <el-icon><ArrowRight /></el-icon>
        </el-link>
      </div>
      
      <div class="questions-list">
        <div 
          class="question-item" 
          v-for="question in latestQuestions" 
          :key="question.id"
          @click="viewQuestion(question)"
        >
          <div class="question-main">
            <h4 class="question-title">{{ question.title }}</h4>
            <p class="question-content">{{ question.content }}</p>
            <div class="question-tags">
              <el-tag 
                v-for="tag in question.tags" 
                :key="tag"
                size="small"
                type="info"
              >
                {{ tag }}
              </el-tag>
            </div>
          </div>
          <div class="question-stats">
            <span class="answer-count">
              <el-icon><ChatDotSquare /></el-icon>
              {{ question.answerCount }}
            </span>
            <span class="view-count">
              <el-icon><View /></el-icon>
              {{ question.viewCount }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 统计数据 -->
    <div class="stats-section">
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-number">{{ totalStats.users || 0 }}</div>
          <div class="stat-label">注册用户</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ totalStats.resources || 0 }}</div>
          <div class="stat-label">学习资源</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ totalStats.questions || 0 }}</div>
          <div class="stat-label">问答问题</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ totalStats.answers || 0 }}</div>
          <div class="stat-label">回答数量</div>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useResourcesStore } from '@/stores/resources'
import { useQuestionsStore } from '@/stores/questions'
import { formatTime } from '@/utils/helpers'
import { 
  Collection, 
  ChatDotRound, 
  Reading, 
  User, 
  ArrowRight, 
  Download, 
  ChatDotSquare, 
  View,
  UserFilled,
  Document,
  DataAnalysis,
  Setting
} from '@element-plus/icons-vue'

const router = useRouter()
const authStore = useAuthStore()
const resourcesStore = useResourcesStore()
const questionsStore = useQuestionsStore()

// 统计数据
const resourceStats = ref({})
const questionStats = ref({})
const courseStats = ref({})
const userStats = ref({})
const totalStats = ref({})

// 热门资源
const hotResources = ref([])

// 最新问题
const latestQuestions = ref([])

// 导航方法
const navigateToResources = () => {
  router.push('/resources')
}

const navigateToQuestions = () => {
  router.push('/questions')
}

const navigateToCourses = () => {
  router.push('/courses')
}

const navigateToProfile = () => {
  if (authStore.isAuthenticated) {
    router.push('/profile')
  } else {
    router.push('/login')
  }
}

// 管理员导航方法
const navigateTo = (routeName) => {
  router.push({ name: routeName })
}

// 查看资源详情
const viewResource = (resource) => {
  router.push(`/resources/${resource.id}`)
}

// 查看问题详情
const viewQuestion = (question) => {
  router.push(`/questions/${question.id}`)
}

// 获取资源类型标签
const getResourceTypeTag = (type) => {
  const typeMap = {
    'pdf': 'primary',
    'doc': 'success',
    'ppt': 'warning',
    'video': 'danger',
    'other': 'info'
  }
  return typeMap[type] || 'info'
}

// 获取资源类型文本
const getResourceTypeText = (type) => {
  const typeMap = {
    'pdf': 'PDF',
    'doc': '文档',
    'ppt': 'PPT',
    'video': '视频',
    'other': '其他'
  }
  return typeMap[type] || '其他'
}

// 加载首页数据
const loadHomeData = async () => {
  try {
    // 加载统计数据
    const [resourcesData, questionsData, coursesData, userData, totalsData] = await Promise.all([
      resourcesStore.getResourceStats(),
      questionsStore.getQuestionStats(),
      // 这里可以调用课程和用户相关的API
      Promise.resolve({ total: 50 }), // 模拟课程数据
      Promise.resolve({ collections: 12 }), // 模拟用户数据
      Promise.resolve({ 
        users: 1234, 
        resources: 5678, 
        questions: 901, 
        answers: 2345 
      }) // 模拟总统计数据
    ])
    
    resourceStats.value = resourcesData
    questionStats.value = questionsData
    courseStats.value = coursesData
    userStats.value = userData
    totalStats.value = totalsData
    
    // 加载热门资源
    const hotRes = await resourcesStore.getHotResources()
    hotResources.value = hotRes.slice(0, 4) // 只显示4个
    
    // 加载最新问题
    const latestQues = await questionsStore.getLatestQuestions()
    latestQuestions.value = latestQues.slice(0, 5) // 只显示5个
  } catch (error) {
    console.error('加载首页数据失败:', error)
  }
}

onMounted(() => {
  loadHomeData()
})
</script>

<style scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 顶部横幅 */
.hero-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 60px 40px;
  margin: 40px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: white;
}

.hero-content {
  flex: 1;
  max-width: 600px;
}

.hero-title {
  font-size: 48px;
  font-weight: 700;
  margin: 0 0 16px 0;
}

.hero-subtitle {
  font-size: 24px;
  font-weight: 400;
  margin: 0 0 24px 0;
  opacity: 0.9;
}

.hero-description {
  font-size: 16px;
  line-height: 1.6;
  margin: 0 0 40px 0;
  opacity: 0.8;
}

.hero-actions {
  display: flex;
  gap: 16px;
}

.hero-image {
  flex: 0 0 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-icon {
  font-size: 120px;
  opacity: 0.7;
}

/* 功能模块 */
.features-section {
  margin: 80px 0;
}

.section-header {
  text-align: center;
  margin-bottom: 50px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-title {
  font-size: 32px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.section-subtitle {
  font-size: 16px;
  color: #909399;
  margin: 8px 0 0 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
}

.feature-card {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.feature-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.feature-icon .el-icon {
  font-size: 28px;
  color: white;
}

.feature-card h3 {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 12px 0;
}

.feature-card p {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  margin: 0 0 20px 0;
}

.feature-stats {
  font-size: 12px;
  color: #909399;
}

/* 热门资源 */
.hot-section {
  margin: 80px 0;
}

.resources-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.resource-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #f5f5f5;
}

.resource-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.resource-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.resource-downloads {
  font-size: 12px;
  color: #909399;
  display: flex;
  align-items: center;
  gap: 4px;
}

.resource-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.resource-description {
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
  margin: 0 0 16px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.resource-footer {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
}

/* 最新问题 */
.questions-section {
  margin: 80px 0;
}

.questions-list {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.question-item {
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.3s ease;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.question-item:hover {
  background-color: #f8f9fa;
}

.question-item:last-child {
  border-bottom: none;
}

.question-main {
  flex: 1;
}

.question-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.question-content {
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.question-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.question-stats {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #909399;
  flex-shrink: 0;
  margin-left: 20px;
}

.question-stats span {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 统计数据 */
.stats-section {
  margin: 80px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 60px 40px;
  color: white;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 40px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 16px;
  opacity: 0.9;
}

/* 管理员控制台样式 - 欧美大气风格 */
.admin-dashboard {
  background: #fff;
  border-radius: 0;
  padding: 60px 40px 40px;
  box-shadow: none;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}

.dashboard-header {
  text-align: center;
  margin-bottom: 60px;
  margin-top: 30px;
}

.dashboard-title {
  color: #1a1a1a;
  font-size: 36px;
  font-weight: 700;
  margin: 0 0 16px 0;
  letter-spacing: -0.3px;
}

.dashboard-subtitle {
  font-size: 18px;
  color: #666;
  margin: 0;
  opacity: 0.8;
  font-weight: 400;
}

.admin-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 60px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0;
  width: 100%;
}

.admin-item {
  transition: transform 0.2s ease;
}

.admin-item:hover {
  transform: translateY(-4px);
}

.admin-card {
  height: 200px;
  text-align: center;
  border: 2px solid #f8f9fa;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  cursor: pointer;
  padding: 50px 35px;
  border-radius: 14px;
  background: white;
  box-shadow: 0 6px 24px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.admin-card:hover {
  box-shadow: 0 16px 48px rgba(0,0,0,0.15);
  transform: translateY(-8px) scale(1.01);
  border-color: #409eff;
}

.card-icon {
  font-size: 60px;
  color: #409eff;
  margin-bottom: 20px;
  transition: transform 0.3s ease;
}

.card-info h3 {
  margin: 0 0 12px;
  color: #1a1a1a;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: -0.2px;
}

.card-info p {
  color: #666;
  font-size: 16px;
  line-height: 1.5;
  margin: 0;
  opacity: 0.8;
  font-weight: 400;
}

.admin-card:hover .card-icon {
  transform: scale(1.05);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .home-container {
    padding: 0 16px;
  }
  
  .hero-banner {
    flex-direction: column;
    text-align: center;
    padding: 40px 20px;
  }
  
  .hero-title {
    font-size: 36px;
  }
  
  .hero-subtitle {
    font-size: 18px;
  }
  
  .hero-actions {
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .hero-image {
    margin-top: 30px;
  }
  
  .section-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .resources-grid {
    grid-template-columns: 1fr;
  }
  
  .question-item {
    flex-direction: column;
    gap: 12px;
  }
  
  .question-stats {
    margin-left: 0;
    align-self: flex-end;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 30px;
  }
  
  .stat-number {
    font-size: 36px;
  }
  
  /* 管理员控制台响应式 */
  .admin-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .card-content {
    padding: 16px;
  }
  
  .card-icon {
    width: 50px;
    height: 50px;
    font-size: 20px;
  }
  
  .dashboard-title {
    font-size: 28px;
  }
}
</style>