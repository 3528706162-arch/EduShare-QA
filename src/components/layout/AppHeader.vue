<template>
  <el-header class="app-header">
    <div class="header-content">
      <!-- Logo和标题 -->
      <div class="header-left">
        <router-link to="/" class="logo-link">
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
          <el-menu-item index="/">首页</el-menu-item>
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

        <!-- 通知 -->
        <el-dropdown trigger="click" class="notification-dropdown">
          <el-badge :value="unreadCount" :hidden="unreadCount === 0" class="notification-badge">
            <el-button circle>
              <el-icon><Bell /></el-icon>
            </el-button>
          </el-badge>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item v-if="notifications.length === 0">暂无通知</el-dropdown-item>
              <el-dropdown-item 
                v-for="notification in notifications" 
                :key="notification.id"
                @click="handleNotificationClick(notification)"
              >
                <div class="notification-item">
                  <div class="notification-title">{{ notification.title }}</div>
                  <div class="notification-time">{{ formatTime(notification.createdAt) }}</div>
                </div>
              </el-dropdown-item>
              <el-dropdown-item divided>
                <el-button type="text" @click="markAllAsRead">全部标记为已读</el-button>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <!-- 用户菜单 -->
        <el-dropdown trigger="click" class="user-dropdown">
          <div class="user-info">
            <el-avatar :size="32" :src="user?.avatar" class="user-avatar">
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
              <el-dropdown-item v-if="userRole === 'student'" @click="$router.push('/resources/upload')">
                <el-icon><Upload /></el-icon>
                上传资源
              </el-dropdown-item>
              <el-dropdown-item v-if="userRole === 'student'" @click="$router.push('/questions/ask')">
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
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Bell, User, Upload, QuestionFilled, SwitchButton, ArrowDown } from '@element-plus/icons-vue'
import { formatDateTime } from '@/utils/helpers'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const searchKeyword = ref('')
const notifications = ref([])
const unreadCount = computed(() => notifications.value.filter(n => !n.isRead).length)

const user = computed(() => authStore.user)
const userRole = computed(() => authStore.userRole)

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

// 模拟获取通知数据
const fetchNotifications = async () => {
  // 这里应该调用API获取通知
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

onMounted(() => {
  if (authStore.isLoggedIn) {
    fetchNotifications()
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