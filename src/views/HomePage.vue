<!-- 网上商城后台管理系统首页 -->
<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()

// 用户信息
const userInfo = ref({})

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    
    // 从localStorage获取用户信息
    const storedUserInfo = localStorage.getItem('userInfo')
    if (storedUserInfo) {
      userInfo.value = JSON.parse(storedUserInfo)
    } else {
      // 如果localStorage中没有用户信息，尝试从API获取
      const username = localStorage.getItem('username')
      if (username) {
        const response = await fetch(`/api/user/${username}`, {
          headers: {
            'token': token
          }
        })
        
        if (response.ok) {
          const result = await response.json()
          if (result.code === 1 && result.data) {
            userInfo.value = result.data
            localStorage.setItem('userInfo', JSON.stringify(result.data))
          }
        }
      }
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

// 退出登录
const logout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    // 清除本地存储
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    localStorage.removeItem('username')
    
    // 跳转到登录页
    router.push('/login')
    
    ElMessage.success('退出登录成功')
  } catch (error) {
    // 用户取消操作
    console.log('用户取消退出登录')
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchUserInfo()
})
</script>

<template>
  <div class="home-page">
    <!-- 顶部导航栏 -->
    <div class="header">
      <div class="header-left">
        <h1 class="title">网上商城后台管理系统</h1>
      </div>
      <div class="header-right">
        <div class="user-dropdown" @click="logout">
          <el-avatar v-if="userInfo.avatar" :size="32" :src="userInfo.avatar" />
          <el-avatar v-else :size="32" style="background-color: #409EFF;">
            <span style="color: white; font-weight: bold;">{{ (userInfo.name || userInfo.username || '用户').charAt(0) }}</span>
          </el-avatar>
          <span class="username">{{ userInfo.name || userInfo.username || '用户' }}</span>
          <el-icon><ArrowDown /></el-icon>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 侧边栏菜单 -->
        <div class="sidebar">
          <el-menu
              :default-active="$route.path"
              class="el-menu-vertical-demo"
              router
            >
             <el-menu-item index="/home">
               <el-icon><House /></el-icon>
               <span>首页</span>
             </el-menu-item>
             <el-sub-menu index="2">
               <template #title>
                 <el-icon><Goods /></el-icon>
                 <span>商品管理</span>
               </template>
               <el-menu-item index="/home/category">
                 <el-icon><Menu /></el-icon>
                 <span>商品分类管理</span>
               </el-menu-item>
               <el-menu-item index="/home/product">
                 <el-icon><ShoppingBag /></el-icon>
                 <span>商品管理</span>
               </el-menu-item>
             </el-sub-menu>
             <el-menu-item index="/home/hello">
               <el-icon><Promotion /></el-icon>
               <span>HelloWorld</span>
             </el-menu-item>
            </el-menu>
        </div>

      <!-- 内容区域 -->
        <div class="content">
          <router-view />
        </div>
    </div>
  </div>
</template>

<style scoped>
.home-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}

.header {
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.title {
  color: white;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.user-dropdown:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.username {
  font-size: 14px;
  color: white;
}

.main-content {
  flex: 1;
  display: flex;
}

.sidebar {
  width: 200px;
  background-color: white;
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.1);
}

.sidebar-menu {
  border: none;
  height: 100%;
}

.content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.dashboard {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
  min-height: calc(100vh - 140px);
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.stat-card {
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.stat-icon.total-products {
  background: linear-gradient(135deg, #ff6b6b, #ee5a52);
}

.stat-icon.total-categories {
  background: linear-gradient(135deg, #4ecdc4, #44a08d);
}

.stat-icon.today-orders {
  background: linear-gradient(135deg, #feca57, #ff9ff3);
}

.stat-icon.monthly-revenue {
  background: linear-gradient(135deg, #48dbfb, #0abde3);
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
}

.stat-label {
  font-size: 14px;
  color: #7f8c8d;
  margin-top: 4px;
}

.quick-actions {
  margin-top: 20px;
}

.quick-actions-card {
  border-radius: 8px;
}

.card-header {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.action-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.action-buttons .el-button {
  padding: 12px 24px;
  font-size: 14px;
}

.action-buttons .el-button .el-icon {
  margin-right: 8px;
}
</style>