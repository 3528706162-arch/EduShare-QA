<template>
  <div class="hello-world">
    <!-- 页面头部 -->
    <div class="header">
      <h1 class="title">Hello World!</h1>
      <p class="subtitle">欢迎来到我的Vue项目</p>
    </div>
    
    <!-- 主要内容区域 -->
    <div class="content">
      <!-- 欢迎信息卡片 -->
      <el-card class="welcome-card">
        <template #header>
          <div class="card-header">
            <span>欢迎信息</span>
            <el-icon><ChatDotRound /></el-icon>
          </div>
        </template>
        
        <div class="welcome-content">
          <p>🎉 恭喜！您已成功创建了HelloWorld页面。</p>
          <p>✨ 这是一个基于Vue 3 + Element Plus的现代化页面。</p>
          <p>🚀 您可以在此基础上继续开发更多功能。</p>
        </div>
        
        <div class="actions">
          <el-button type="primary" @click="showMessage">
            <el-icon><Promotion /></el-icon>
            点击我
          </el-button>
          <el-button @click="goBack">
            <el-icon><Back /></el-icon>
            返回首页
          </el-button>
        </div>
      </el-card>
      
      <!-- 功能展示区域 -->
      <div class="features">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-card class="feature-card">
              <div class="feature-item">
                <el-icon class="feature-icon" color="#409EFF"><Monitor /></el-icon>
                <h3>现代化UI</h3>
                <p>基于Element Plus组件库，提供优秀的用户体验</p>
              </div>
            </el-card>
          </el-col>
          
          <el-col :span="8">
            <el-card class="feature-card">
              <div class="feature-item">
                <el-icon class="feature-icon" color="#67C23A"><Setting /></el-icon>
                <h3>响应式设计</h3>
                <p>完美适配各种屏幕尺寸，支持移动端访问</p>
              </div>
            </el-card>
          </el-col>
          
          <el-col :span="8">
            <el-card class="feature-card">
              <div class="feature-item">
                <el-icon class="feature-icon" color="#E6A23C"><TrendCharts /></el-icon>
                <h3>丰富功能</h3>
                <p>集成多种实用功能，满足不同业务需求</p>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
      
      <!-- 动态数据展示 -->
      <div class="dynamic-data">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>动态数据</span>
              <el-icon><DataAnalysis /></el-icon>
            </div>
          </template>
          
          <div class="data-display">
            <el-statistic title="页面访问次数" :value="visitCount" />
            <el-statistic title="当前时间" :value="currentTime" />
            <el-statistic title="随机数字" :value="randomNumber" />
          </div>
          
          <div class="data-actions">
            <el-button @click="refreshData">刷新数据</el-button>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ChatDotRound,
  Promotion,
  Back,
  Monitor,
  Setting,
  TrendCharts,
  DataAnalysis
} from '@element-plus/icons-vue'

const router = useRouter()

// 响应式数据
const visitCount = ref(0)
const currentTime = ref('')
const randomNumber = ref(0)
let timer = null

// 显示欢迎消息
const showMessage = () => {
  ElMessage.success('Hello World! 欢迎使用Vue 3!')
  visitCount.value += 1
}

// 返回首页
const goBack = () => {
  router.push('/')
}

// 刷新数据
const refreshData = () => {
  randomNumber.value = Math.floor(Math.random() * 1000)
  updateCurrentTime()
  ElMessage.info('数据已刷新!')
}

// 更新当前时间
const updateCurrentTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 组件挂载时初始化
onMounted(() => {
  visitCount.value = 1
  updateCurrentTime()
  randomNumber.value = Math.floor(Math.random() * 1000)
  
  // 每秒更新一次时间
  timer = setInterval(updateCurrentTime, 1000)
  
  ElMessage({
    message: 'HelloWorld页面加载完成!',
    type: 'success',
    duration: 2000
  })
})

// 组件卸载时清理
onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style scoped>
.hello-world {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.header {
  text-align: center;
  margin-bottom: 40px;
  color: white;
}

.title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
  margin: 0;
}

.content {
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-card {
  margin-bottom: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.welcome-content {
  line-height: 1.8;
  color: #606266;
  margin-bottom: 20px;
}

.welcome-content p {
  margin: 10px 0;
  font-size: 1.1rem;
}

.actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.features {
  margin-bottom: 30px;
}

.feature-card {
  height: 100%;
  border-radius: 12px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.feature-item {
  text-align: center;
  padding: 20px;
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 15px;
}

.feature-item h3 {
  margin: 15px 0 10px;
  color: #303133;
  font-size: 1.3rem;
}

.feature-item p {
  color: #606266;
  line-height: 1.6;
  margin: 0;
}

.dynamic-data {
  margin-bottom: 30px;
}

.data-display {
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 20px;
}

.data-actions {
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .title {
    font-size: 2rem;
  }
  
  .data-display {
    flex-direction: column;
    gap: 15px;
  }
  
  .actions {
    flex-direction: column;
  }
  
  .hello-world {
    padding: 10px;
  }
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hello-world {
  animation: fadeIn 0.6s ease-out;
}
</style>