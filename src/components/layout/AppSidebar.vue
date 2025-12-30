<template>
  <el-aside class="app-sidebar" :width="sidebarWidth">
    <!-- 侧边栏内容 -->
    <div class="sidebar-content">
      <!-- 用户信息卡片 -->
      <div class="user-card" v-if="user">
        <el-avatar :size="60" :src="user.avatar" class="user-avatar">
          {{ user.username?.charAt(0) }}
        </el-avatar>
        <div class="user-info">
          <div class="username">{{ user.username }}</div>
          <div class="user-role">
            <el-tag :type="getRoleTagType(user.role)" size="small">
              {{ getRoleText(user.role) }}
            </el-tag>
          </div>
        </div>
      </div>

      <!-- 快捷操作 -->
      <div class="quick-actions" v-if="user">
        <div class="section-title">快捷操作</div>
        <!-- 管理员快捷操作 -->
        <div v-if="user.role === 'admin'" class="admin-actions">
          <el-button type="primary" @click="navigateTo('CourseManagement')" class="quick-action-btn">
            <el-icon><Collection /></el-icon>
            课程管理
          </el-button>
          
          <el-button type="success" @click="navigateTo('TeacherManagement')" class="quick-action-btn">
            <el-icon><UserFilled /></el-icon>
            教师管理
          </el-button>
          
          <el-button type="warning" @click="navigateTo('ResourceManagement')" class="quick-action-btn">
            <el-icon><Document /></el-icon>
            学习资源管理
          </el-button>
          
          <el-button type="danger" @click="navigateTo('QuestionManagement')" class="quick-action-btn">
            <el-icon><QuestionFilled /></el-icon>
            问答内容管理
          </el-button>
        </div>
        
        <!-- 学生和教师快捷操作 -->
        <div v-else>
          <el-button 
            v-if="user.role === 'student'" 
            type="primary" 
            @click="$router.push('/resources/upload')"
            class="quick-action-btn"
          >
            <el-icon><Upload /></el-icon>
            上传资源
          </el-button>
          <el-button 
            v-if="user.role === 'student'" 
            type="success" 
            @click="$router.push('/questions/ask')"
            class="quick-action-btn"
          >
            <el-icon><Question /></el-icon>
            提问
          </el-button>
          <el-button 
            v-if="user.role === 'teacher'" 
            type="warning" 
            @click="handleAnswerQuestions"
            class="quick-action-btn"
          >
            <el-icon><ChatDotRound /></el-icon>
            回答问题
          </el-button>
        </div>
      </div>

      <!-- 统计信息 -->
      <div class="stats-section" v-if="user">
        <div class="section-title">我的统计</div>
        <div class="stats-grid">
          <div class="stat-item" v-if="user.role === 'student'">
            <div class="stat-value">{{ stats.uploadedResources || 0 }}</div>
            <div class="stat-label">上传资源</div>
          </div>
          <div class="stat-item" v-if="user.role === 'student'">
            <div class="stat-value">{{ stats.askedQuestions || 0 }}</div>
            <div class="stat-label">提问数量</div>
          </div>
          <div class="stat-item" v-if="user.role === 'teacher'">
            <div class="stat-value">{{ stats.answeredQuestions || 0 }}</div>
            <div class="stat-label">已回答</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ stats.points || 0 }}</div>
            <div class="stat-label">积分</div>
          </div>
        </div>
      </div>

      <!-- 热门标签 -->
      <div class="tags-section">
        <div class="section-title">热门标签</div>
        <div class="tags-list">
          <el-tag
            v-for="tag in hotTags"
            :key="tag.id"
            :type="tag.type"
            class="tag-item"
            @click="handleTagClick(tag.name)"
          >
            {{ tag.name }}
          </el-tag>
        </div>
      </div>

      <!-- 最新动态 -->
      <div class="activity-section" v-if="recentActivities.length > 0">
        <div class="section-title">最新动态</div>
        <div class="activity-list">
          <div 
            v-for="activity in recentActivities" 
            :key="activity.id"
            class="activity-item"
            @click="handleActivityClick(activity)"
          >
            <div class="activity-icon">
              <el-icon v-if="activity.type === 'resource'"><Document /></el-icon>
              <el-icon v-if="activity.type === 'question'"><ChatDotRound /></el-icon>
            </div>
            <div class="activity-content">
              <div class="activity-title">{{ activity.title }}</div>
              <div class="activity-time">{{ formatTime(activity.time) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-aside>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Upload, QuestionFilled, ChatDotRound, Document, Collection, UserFilled } from '@element-plus/icons-vue'
import { formatDateTime } from '@/utils/helpers'

const router = useRouter()
const authStore = useAuthStore()

const sidebarWidth = ref('280px')
const stats = ref({})
const hotTags = ref([])
const recentActivities = ref([])

const user = computed(() => authStore.user)

// 获取角色标签类型
const getRoleTagType = (role) => {
  const types = {
    'admin': 'danger',
    'teacher': 'warning',
    'student': 'success'
  }
  return types[role] || 'info'
}

// 获取角色显示文本
const getRoleText = (role) => {
  const texts = {
    'admin': '管理员',
    'teacher': '教师',
    'student': '学生'
  }
  return texts[role] || '用户'
}

// 格式化时间
const formatTime = (time) => {
  return formatDateTime(time, 'MM-DD HH:mm')
}

// 处理标签点击
const handleTagClick = (tagName) => {
  router.push(`/resources?tag=${encodeURIComponent(tagName)}`)
}

// 处理动态点击
const handleActivityClick = (activity) => {
  if (activity.type === 'resource') {
    router.push(`/resources/${activity.id}`)
  } else if (activity.type === 'question') {
    router.push(`/questions/${activity.id}`)
  }
}

// 处理回答问题
const handleAnswerQuestions = () => {
  router.push('/questions?filter=unanswered')
}

// 导航到管理页面
const navigateTo = (routeName) => {
  router.push({ name: routeName })
}

// 获取统计数据
const fetchStats = async () => {
  try {
    if (!authStore.isAuthenticated || !authStore.user?.username) {
      console.warn('用户未登录或用户名不存在，使用默认统计数据')
      stats.value = {
        uploadedResources: 0,
        askedQuestions: 8,
        answeredQuestions: 23,
        points: 156
      }
      return
    }

    // 调用后端API获取用户上传资源数量
    const response = await fetch(`/api/v1/resource/findUploadCount/${authStore.user.username}`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result = await response.json()
    
    if (result.code === 1) {
      // 使用真实的上传资源数量，其他统计数据保持模拟
      stats.value = {
        uploadedResources: result.data,
        askedQuestions: 8,
        answeredQuestions: 23,
        points: 156
      }
      console.log('成功获取用户上传资源数量:', result.data)
    } else {
      throw new Error(`API返回错误: ${result.msg}`)
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
    // 失败时使用默认值
    stats.value = {
      uploadedResources: 0,
      askedQuestions: 8,
      answeredQuestions: 23,
      points: 156
    }
  }
}

// 获取热门标签
const fetchHotTags = async () => {
  // 模拟API调用
  hotTags.value = [
    { id: 1, name: 'Java编程', type: '', count: 45 },
    { id: 2, name: 'Python', type: 'success', count: 38 },
    { id: 3, name: '数据结构', type: 'warning', count: 32 },
    { id: 4, name: '算法', type: 'danger', count: 29 },
    { id: 5, name: '数据库', type: 'info', count: 26 },
    { id: 6, name: '前端开发', type: '', count: 22 }
  ]
}

// 获取最新动态
const fetchRecentActivities = async () => {
  // 模拟API调用
  recentActivities.value = [
    {
      id: 1,
      type: 'resource',
      title: 'Java多线程编程指南',
      time: new Date(Date.now() - 300000)
    },
    {
      id: 2,
      type: 'question',
      title: '如何理解React的虚拟DOM？',
      time: new Date(Date.now() - 600000)
    },
    {
      id: 3,
      type: 'resource',
      title: 'Python数据分析实战',
      time: new Date(Date.now() - 900000)
    }
  ]
}

onMounted(() => {
  console.log('AppSidebar组件已挂载，用户状态:', {
    isAuthenticated: authStore.isAuthenticated,
    user: authStore.user,
    username: authStore.user?.username
  })
  
  if (authStore.isAuthenticated) {
    console.log('用户已登录，开始获取统计数据')
    fetchStats()
    fetchHotTags()
    fetchRecentActivities()
  } else {
    console.log('用户未登录，跳过统计数据获取')
  }
})

// 监听用户登录状态变化
watch(() => authStore.isAuthenticated, (newVal, oldVal) => {
  console.log('用户登录状态变化:', { oldVal, newVal, user: authStore.user })
  
  if (newVal && !oldVal) {
    // 用户从未登录变为登录状态
    console.log('用户已登录，开始获取统计数据')
    fetchStats()
    fetchHotTags()
    fetchRecentActivities()
  } else if (!newVal && oldVal) {
    // 用户从登录变为未登录状态
    console.log('用户已退出登录，清空统计数据')
    stats.value = {
      uploadedResources: 0,
      askedQuestions: 0,
      answeredQuestions: 0,
      points: 0
    }
    hotTags.value = []
    recentActivities.value = []
  }
}, { immediate: true })
</script>

<style scoped>
.app-sidebar {
  background: #f8f9fa;
  border-right: 1px solid #e6e6e6;
  height: calc(100vh - 60px);
  overflow-y: auto;
}

.sidebar-content {
  padding: 20px;
}

.user-card {
  text-align: center;
  padding: 20px 0;
  border-bottom: 1px solid #e6e6e6;
  margin-bottom: 20px;
}

.user-avatar {
  margin: 0 auto 10px;
  background-color: #409eff;
}

.user-info {
  text-align: center;
}

.username {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 5px;
}

.user-role {
  margin-top: 5px;
}

.quick-actions {
  margin-bottom: 25px;
}

.section-title {
  font-size: 14px;
  font-weight: bold;
  color: #666;
  margin-bottom: 12px;
  padding-left: 5px;
  border-left: 3px solid #409eff;
}

.quick-action-btn {
  width: 100%;
  margin-bottom: 10px;
  justify-content: flex-start;
  font-weight: bold;
}

.quick-action-btn .el-icon {
  margin-right: 8px;
}

/* 管理员快捷操作样式 */
.admin-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stats-section {
  margin-bottom: 25px;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.stat-item {
  background: white;
  padding: 12px;
  border-radius: 6px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #666;
}

.tags-section {
  margin-bottom: 25px;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  cursor: pointer;
  transition: transform 0.2s;
}

.tag-item:hover {
  transform: translateY(-2px);
}

.activity-section {
  margin-bottom: 20px;
}

.activity-list {
  space-y: 10px;
}

.activity-item {
  display: flex;
  align-items: center;
  padding: 10px;
  background: white;
  border-radius: 6px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.activity-item:hover {
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.activity-icon {
  margin-right: 10px;
  color: #409eff;
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-size: 13px;
  color: #333;
  margin-bottom: 2px;
  line-height: 1.3;
}

.activity-time {
  font-size: 11px;
  color: #999;
}
</style>