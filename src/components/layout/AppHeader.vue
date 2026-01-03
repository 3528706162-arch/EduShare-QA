<template>
  <el-header class="app-header">
    <div class="header-content">
      <!-- Logo和标题 -->
      <div class="header-left">
        <router-link to="/home" class="logo-link">
          <h1 class="logo-text">EduShare QA</h1>
          <span class="logo-subtitle">大学生线上学习资源共享与问答系统</span>
        </router-link>
      </div>

      <!-- 导航菜单 -->
      <div class="header-center">
        <el-menu
          :default-active="activeMenu"
          mode="horizontal"
          class="nav-menu"
          @select="handleMenuSelect"
        >
          <el-menu-item index="/home">首页</el-menu-item>
          <el-menu-item index="/resources">资源中心</el-menu-item>
          <el-menu-item index="/questions">问答社区</el-menu-item>
          <el-menu-item v-if="userRole === 'admin'" index="/admin">管理后台</el-menu-item>
        </el-menu>
      </div>

      <!-- 用户操作区域 -->
      <div class="header-right">
        <!-- 搜索框 -->
        <el-input
          v-model="searchKeyword"
          placeholder="搜索资源或问题..."
          class="search-input"
          @keyup.enter="handleSearch"
        >
          <template #append>
            <el-button @click="handleSearch">
              <el-icon><Search /></el-icon>
            </el-button>
          </template>
        </el-input>

        <!-- 通知提示 -->
        <el-dropdown trigger="click" class="notification-dropdown">
          <el-badge :value="notificationCount" :hidden="notificationCount === 0" class="notification-badge">
            <el-button circle>
              <el-icon><Bell /></el-icon>
            </el-button>
          </el-badge>
          <template #dropdown>
            <el-dropdown-menu>
              <!-- 教师用户的未回答问题通知 -->
              <el-dropdown-item v-if="authStore.hasPermission(['teacher']) && unansweredQuestionsCount > 0" @click="handleUnansweredQuestionsClick">
                <div class="notification-item">
                  <div class="notification-title">您有 {{ unansweredQuestionsCount }} 条待回答问题</div>
                  <div class="notification-time">点击回答问题</div>
                </div>
              </el-dropdown-item>
              <!-- 其他用户的新回答通知 -->
              <el-dropdown-item v-else-if="newAnswerCount > 0">
                <div class="notification-item">
                  <div class="notification-title">您有 {{ newAnswerCount }} 条新回答</div>
                  <div class="notification-time">点击查看详情</div>
                </div>
              </el-dropdown-item>
              <el-dropdown-item v-else>暂无新通知</el-dropdown-item>
              <el-dropdown-item divided @click="navigateToProfile">
                <el-button type="text">前往个人中心查看</el-button>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <!-- 用户菜单 -->
        <el-dropdown trigger="click" class="user-dropdown">
          <div class="user-info">
            <el-avatar :size="32" :src="user?.imageUrl || user?.avatar" class="user-avatar">
              {{ user?.username?.charAt(0) }}
            </el-avatar>
            <span class="username">{{ user?.username }}</span>
            <el-icon><ArrowDown /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="$router.push('/profile')">
                <el-icon><User /></el-icon>
                个人中心
              </el-dropdown-item>
              <el-dropdown-item v-if="authStore.hasPermission(['student']) && authStore.userRole !== 'admin'" @click="$router.push('/resources/upload')">
                <el-icon><Upload /></el-icon>
                上传资源
              </el-dropdown-item>
              <el-dropdown-item v-if="authStore.hasPermission(['student', 'teacher']) && authStore.userRole !== 'admin'" @click="$router.push('/questions/ask')">
                <el-icon><QuestionFilled /></el-icon>
                提问
              </el-dropdown-item>
              <el-dropdown-item divided @click="handleLogout">
                <el-icon><SwitchButton /></el-icon>
                退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </el-header>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Bell, User, Upload, QuestionFilled, SwitchButton, ArrowDown } from '@element-plus/icons-vue'
import { formatDateTime } from '@/utils/helpers'
import { eventBus } from '@/utils/eventBus'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const searchKeyword = ref('')
const notifications = ref([])
const unreadCount = computed(() => notifications.value.filter(n => !n.isRead).length)

// 新回答计数
const newAnswerCount = ref(0)

// 通知总数计算
const notificationCount = computed(() => {
  if (authStore.hasPermission(['teacher'])) {
    // 教师用户显示待回答问题数量
    return unansweredQuestionsCount.value
  } else {
    // 其他用户显示新回答数量
    return newAnswerCount.value
  }
})

const user = computed(() => authStore.user)
const userRole = computed(() => {
  const role = authStore.userRole
  console.log('当前用户角色:', role)
  console.log('当前用户数据:', authStore.user)
  console.log('用户角色字段值:', authStore.user?.role)
  console.log('hasPermission学生:', authStore.hasPermission(['student']))
  console.log('hasPermission教师:', authStore.hasPermission(['teacher']))
  console.log('hasPermission学生或教师:', authStore.hasPermission(['student', 'teacher']))
  return role
})

const activeMenu = computed(() => route.path)

// 格式化时间
const formatTime = (time) => {
  return formatDateTime(time, 'MM-DD HH:mm')
}

// 处理菜单选择
const handleMenuSelect = (index) => {
  router.push(index)
}

// 处理搜索
const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    // 根据当前路由决定搜索类型
    if (route.path.includes('/resources')) {
      router.push(`/resources?search=${encodeURIComponent(searchKeyword.value)}`)
    } else if (route.path.includes('/questions')) {
      router.push(`/questions?search=${encodeURIComponent(searchKeyword.value)}`)
    } else {
      router.push(`/resources?search=${encodeURIComponent(searchKeyword.value)}`)
    }
  }
}

// 处理通知点击
const handleNotificationClick = (notification) => {
  // 标记为已读
  notification.isRead = true
  
  // 根据通知类型跳转
  if (notification.type === 'question_answered') {
    router.push(`/questions/${notification.targetId}`)
  } else if (notification.type === 'resource_approved') {
    router.push(`/resources/${notification.targetId}`)
  } else if (notification.type === 'unanswered_questions') {
    // 跳转到问答社区页面并进入教师回答问题模式
    router.push('/questions?teacherMode=true')
  }
}

// 标记所有通知为已读
const markAllAsRead = async () => {
  try {
    // 调用API标记所有通知为已读
    notifications.value.forEach(n => n.isRead = true)
    ElMessage.success('已标记所有通知为已读')
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

// 导航到个人中心
const navigateToProfile = () => {
  router.push('/profile')
}

// 更新新回答计数
const updateNewAnswerCount = (count) => {
  newAnswerCount.value = count
}

// 处理待回答问题点击
const handleUnansweredQuestionsClick = () => {
  // 跳转到问答社区页面并进入教师回答问题模式
  router.push('/questions?teacherMode=true')
}

// 处理退出登录
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    authStore.logout()
    ElMessage.success('退出成功')
  } catch (error) {
    // 用户取消操作
  }
}

// 暴露更新方法给其他组件使用
defineExpose({
  updateNewAnswerCount
})

// 监听新回答计数变化事件
const handleNewAnswerCountUpdate = (count) => {
  newAnswerCount.value = count
}

// 组件挂载时监听事件
onMounted(() => {
  eventBus.on('updateNewAnswerCount', handleNewAnswerCountUpdate)
})

// 组件卸载时移除事件监听
onUnmounted(() => {
  eventBus.off('updateNewAnswerCount', handleNewAnswerCountUpdate)
})

// 获取教师待回答问题数量
const unansweredQuestionsCount = ref(0)
const teacherName = ref('')

// 获取教师姓名
const getTeacherName = async () => {
  console.log('开始获取教师信息...')
  console.log('登录状态:', authStore.isAuthenticated)
  console.log('教师权限:', authStore.hasPermission(['teacher']))
  
  if (!authStore.isAuthenticated || !authStore.hasPermission(['teacher'])) {
    console.log('用户未登录或无教师权限，跳过获取教师信息')
    return
  }
  
  try {
    const username = authStore.userName
    console.log('当前用户名:', username)
    
    const apiUrl = `/api/v1/teacher/getInfoByUsername/${encodeURIComponent(username)}`
    console.log('请求教师信息API:', apiUrl)
    
    const response = await fetch(apiUrl)
    console.log('教师信息API响应状态:', response.status)
    
    if (response.ok) {
      const data = await response.json()
      console.log('教师信息API响应数据:', data)
      
      if (data.code === 1) {
        teacherName.value = data.data.name
        console.log('获取到教师姓名:', teacherName.value)
        // 获取待回答问题数量
        fetchUnansweredQuestionsCount()
      } else {
        console.log('教师信息API返回错误码:', data.code)
      }
    } else {
      console.log('教师信息API请求失败，状态码:', response.status)
    }
  } catch (error) {
    console.error('获取教师信息失败:', error)
  }
}

// 获取待回答问题数量
const fetchUnansweredQuestionsCount = async () => {
  console.log('开始获取待回答问题数量...')
  console.log('教师姓名:', teacherName.value)
  
  if (!teacherName.value) {
    console.log('教师姓名为空，跳过获取待回答问题')
    return
  }
  
  try {
    const apiUrl = `/api/v1/question/findQuestionByTeacherName/${encodeURIComponent(teacherName.value)}`
    console.log('请求待回答问题API:', apiUrl)
    
    const response = await fetch(apiUrl)
    console.log('待回答问题API响应状态:', response.status)
    
    if (response.ok) {
      const data = await response.json()
      console.log('待回答问题API响应数据:', data)
      
      if (data.code === 1) {
        unansweredQuestionsCount.value = data.data.length
        console.log('获取到待回答问题数量:', unansweredQuestionsCount.value)
        
        // 如果有未回答问题，添加到通知列表
        if (unansweredQuestionsCount.value > 0) {
          console.log('有未回答问题，添加通知')
          addUnansweredQuestionNotification()
        } else {
          console.log('没有未回答问题')
        }
      } else {
        console.log('待回答问题API返回错误码:', data.code)
      }
    } else {
      console.log('待回答问题API请求失败，状态码:', response.status)
    }
  } catch (error) {
    console.error('获取待回答问题失败:', error)
  }
}

// 添加未回答问题通知
const addUnansweredQuestionNotification = () => {
  // 检查是否已经添加过未回答问题通知
  const existingNotification = notifications.value.find(n => n.type === 'unanswered_questions')
  
  if (!existingNotification) {
    notifications.value.unshift({
      id: Date.now(),
      title: `您所上的课程有${unansweredQuestionsCount.value}条未回答问题`,
      type: 'unanswered_questions',
      targetId: null,
      isRead: false,
      createdAt: new Date()
    })
  } else {
    // 更新现有通知
    existingNotification.title = `您所上的课程有${unansweredQuestionsCount.value}条未回答问题`
    existingNotification.isRead = false
    existingNotification.createdAt = new Date()
  }
}

// 模拟获取通知数据
const fetchNotifications = async () => {
  // 如果是教师用户，只获取真实的未回答问题信息
  if (authStore.isAuthenticated && authStore.hasPermission(['teacher'])) {
    console.log('教师用户，只获取真实的未回答问题通知')
    await getTeacherName()
    // 教师用户的未回答问题通知会通过getTeacherName() -> fetchUnansweredQuestionsCount() -> addUnansweredQuestionNotification()添加
    // 教师用户不需要模拟通知，所以这里清空通知列表
    notifications.value = []
  } else if (authStore.isAuthenticated) {
    // 非教师用户显示模拟通知
    console.log('非教师用户，显示模拟通知')
    
    // 学生用户只显示问题相关通知，不显示资源审核通知
    if (authStore.hasPermission(['student'])) {
      console.log('学生用户，只显示问题相关通知')
      notifications.value = [
        {
          id: 1,
          title: '您的问题有了新的回答',
          type: 'question_answered',
          targetId: 123,
          isRead: false,
          createdAt: new Date()
        }
      ]
    } else {
      // 其他非教师用户（如管理员）显示完整通知
      console.log('其他非教师用户，显示完整通知')
      notifications.value = [
        {
          id: 1,
          title: '您的问题有了新的回答',
          type: 'question_answered',
          targetId: 123,
          isRead: false,
          createdAt: new Date()
        },
        {
          id: 2,
          title: '您上传的资源已通过审核',
          type: 'resource_approved',
          targetId: 456,
          isRead: true,
          createdAt: new Date(Date.now() - 3600000)
        }
      ]
    }
  } else {
    // 未登录用户清空通知
    console.log('未登录用户，清空通知')
    notifications.value = []
  }
}

onMounted(() => {
  console.log('AppHeader组件已挂载')
  console.log('当前登录状态:', authStore.isAuthenticated)
  console.log('当前用户权限:', authStore.hasPermission(['teacher']))
  
  if (authStore.isAuthenticated) {
    console.log('用户已登录，开始获取通知')
    fetchNotifications()
    
    // 如果是教师用户，立即获取待回答问题信息
    if (authStore.hasPermission(['teacher'])) {
      console.log('用户是教师，开始获取教师信息')
      getTeacherName()
    } else {
      console.log('用户不是教师，跳过获取教师信息')
    }
  } else {
    console.log('用户未登录，跳过获取通知和教师信息')
  }
})

// 监听登录状态变化
watch(() => authStore.isAuthenticated, (newVal, oldVal) => {
  console.log('登录状态变化:', { oldVal, newVal })
  console.log('当前用户权限:', authStore.hasPermission(['teacher']))
  
  if (newVal && authStore.hasPermission(['teacher'])) {
    console.log('用户登录后是教师，开始获取教师信息')
    // 用户登录后，如果是教师，立即获取待回答问题信息
    getTeacherName()
  } else {
    console.log('用户登录后不是教师或未登录，跳过获取教师信息')
  }
})
</script>

<style scoped>
.app-header {
  background: #fff;
  border-bottom: 1px solid #e6e6e6;
  padding: 0;
  height: 60px;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.header-left {
  flex-shrink: 0;
}

.logo-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: inherit;
}

.logo-text {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
  margin: 0;
  margin-right: 10px;
}

.logo-subtitle {
  font-size: 12px;
  color: #666;
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.nav-menu {
  border-bottom: none;
}

.header-right {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 15px;
}

.search-input {
  width: 250px;
}

.notification-dropdown {
  cursor: pointer;
}

.notification-badge {
  :deep(.el-badge__content) {
    top: 8px;
    right: 8px;
  }
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: #f5f5f5;
}

.user-avatar {
  background-color: #409eff;
}

.username {
  font-size: 14px;
  color: #333;
}

.notification-item {
  min-width: 200px;
  padding: 5px 0;
}

.notification-title {
  font-size: 13px;
  color: #333;
  margin-bottom: 2px;
}

.notification-time {
  font-size: 12px;
  color: #999;
}
</style>