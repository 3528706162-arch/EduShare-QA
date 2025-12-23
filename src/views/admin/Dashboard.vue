<template>
  <div class="admin-dashboard">
    <div class="breadcrumb">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/admin' }">管理员后台</el-breadcrumb-item>
        <el-breadcrumb-item>仪表板</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div class="dashboard-header">
      <h1>系统概览</h1>
      <p>欢迎回来，管理员！这里是系统的整体运行情况概览。</p>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon user-icon">
            <el-icon><User /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.totalUsers }}</div>
            <div class="stat-label">总用户数</div>
          </div>
        </div>
        <div class="stat-trend">
          <span class="trend-up">+{{ stats.newUsersToday }} 今日新增</span>
        </div>
      </el-card>

      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon question-icon">
            <el-icon><QuestionFilled /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.totalQuestions }}</div>
            <div class="stat-label">总问题数</div>
          </div>
        </div>
        <div class="stat-trend">
          <span class="trend-up">+{{ stats.newQuestionsToday }} 今日新增</span>
        </div>
      </el-card>

      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon resource-icon">
            <el-icon><Document /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.totalResources }}</div>
            <div class="stat-label">总资源数</div>
          </div>
        </div>
        <div class="stat-trend">
          <span class="trend-up">+{{ stats.newResourcesToday }} 今日新增</span>
        </div>
      </el-card>

      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon answer-icon">
            <el-icon><ChatDotRound /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.totalAnswers }}</div>
            <div class="stat-label">总回答数</div>
          </div>
        </div>
        <div class="stat-trend">
          <span class="trend-up">+{{ stats.newAnswersToday }} 今日新增</span>
        </div>
      </el-card>
    </div>

    <!-- 图表区域 -->
    <div class="charts-grid">
      <el-card class="chart-card">
        <template #header>
          <h3>用户增长趋势</h3>
        </template>
        <div class="chart-container">
          <div class="chart-placeholder">
            <el-icon><TrendCharts /></el-icon>
            <p>用户增长趋势图表</p>
            <small>（图表组件待集成）</small>
          </div>
        </div>
      </el-card>

      <el-card class="chart-card">
        <template #header>
          <h3>内容分布</h3>
        </template>
        <div class="chart-container">
          <div class="chart-placeholder">
            <el-icon><PieChart /></el-icon>
            <p>内容分布饼图</p>
            <small>（图表组件待集成）</small>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 快速操作 -->
    <div class="quick-actions">
      <el-card>
        <template #header>
          <h3>快速操作</h3>
        </template>
        <div class="actions-grid">
          <el-button 
            type="primary" 
            class="action-btn"
            @click="navigateTo('UserManagement')"
          >
            <el-icon><User /></el-icon>
            用户管理
          </el-button>
          
          <el-button 
            type="success" 
            class="action-btn"
            @click="navigateTo('ResourceManagement')"
          >
            <el-icon><Document /></el-icon>
            资源管理
          </el-button>
          
          <el-button 
            type="warning" 
            class="action-btn"
            @click="navigateTo('QuestionManagement')"
          >
            <el-icon><QuestionFilled /></el-icon>
            问答管理
          </el-button>
          
          <el-button 
            type="info" 
            class="action-btn"
            @click="showSystemSettings"
          >
            <el-icon><Setting /></el-icon>
            系统设置
          </el-button>
        </div>
      </el-card>
    </div>

    <!-- 最近活动 -->
    <div class="recent-activities">
      <el-card>
        <template #header>
          <div class="activity-header">
            <h3>最近活动</h3>
            <el-button type="text" @click="refreshActivities">刷新</el-button>
          </div>
        </template>
        
        <div class="activity-list">
          <div 
            v-for="activity in recentActivities" 
            :key="activity.id"
            class="activity-item"
          >
            <div class="activity-icon">
              <el-icon v-if="activity.type === 'user'"><User /></el-icon>
              <el-icon v-if="activity.type === 'question'"><QuestionFilled /></el-icon>
              <el-icon v-if="activity.type === 'resource'"><Document /></el-icon>
              <el-icon v-if="activity.type === 'answer'"><ChatDotRound /></el-icon>
            </div>
            <div class="activity-content">
              <p class="activity-title">{{ activity.title }}</p>
              <span class="activity-time">{{ formatTime(activity.time) }}</span>
            </div>
            <div class="activity-action">
              <el-button 
                v-if="activity.action" 
                size="small" 
                @click="handleActivityAction(activity)"
              >
                {{ activity.action }}
              </el-button>
            </div>
          </div>
          
          <div v-if="recentActivities.length === 0" class="no-activities">
            <el-empty description="暂无活动记录" />
          </div>
        </div>
      </el-card>
    </div>

    <!-- 系统状态 -->
    <div class="system-status">
      <el-card>
        <template #header>
          <h3>系统状态</h3>
        </template>
        
        <div class="status-grid">
          <div class="status-item">
            <span class="status-label">服务器状态</span>
            <el-tag type="success">正常运行</el-tag>
          </div>
          
          <div class="status-item">
            <span class="status-label">数据库连接</span>
            <el-tag type="success">已连接</el-tag>
          </div>
          
          <div class="status-item">
            <span class="status-label">API服务</span>
            <el-tag type="success">正常</el-tag>
          </div>
          
          <div class="status-item">
            <span class="status-label">文件存储</span>
            <el-tag type="success">正常</el-tag>
          </div>
          
          <div class="status-item">
            <span class="status-label">系统版本</span>
            <span class="status-value">v1.0.0</span>
          </div>
          
          <div class="status-item">
            <span class="status-label">运行时间</span>
            <span class="status-value">15天2小时</span>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  User, QuestionFilled, Document, ChatDotRound, 
  Setting, TrendCharts, PieChart 
} from '@element-plus/icons-vue'

const router = useRouter()

// 统计数据
const stats = reactive({
  totalUsers: 1256,
  newUsersToday: 12,
  totalQuestions: 3456,
  newQuestionsToday: 23,
  totalResources: 890,
  newResourcesToday: 8,
  totalAnswers: 7890,
  newAnswersToday: 45
})

// 最近活动
const recentActivities = ref([
  {
    id: 1,
    type: 'user',
    title: '新用户 "张三" 注册了账户',
    time: '2024-01-15T10:30:00Z',
    action: '查看'
  },
  {
    id: 2,
    type: 'question',
    title: '用户 "李四" 发布了新问题',
    time: '2024-01-15T09:15:00Z',
    action: '审核'
  },
  {
    id: 3,
    type: 'resource',
    title: '教师 "王五" 上传了新资源',
    time: '2024-01-15T08:45:00Z',
    action: '审核'
  },
  {
    id: 4,
    type: 'answer',
    title: '用户 "赵六" 回答了问题',
    time: '2024-01-15T08:20:00Z',
    action: '查看'
  }
])

// 导航方法
const navigateTo = (routeName) => {
  router.push({ name: routeName })
}

const showSystemSettings = () => {
  ElMessage.info('系统设置功能开发中...')
}

const refreshActivities = () => {
  ElMessage.success('活动记录已刷新')
}

const handleActivityAction = (activity) => {
  switch (activity.type) {
    case 'user':
      navigateTo('UserManagement')
      break
    case 'question':
      navigateTo('QuestionManagement')
      break
    case 'resource':
      navigateTo('ResourceManagement')
      break
    case 'answer':
      navigateTo('QuestionManagement')
      break
  }
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

// 模拟加载数据
const loadDashboardData = async () => {
  try {
    // 这里可以调用API获取真实数据
    ElMessage.success('仪表板数据加载完成')
  } catch (error) {
    console.error('加载仪表板数据失败:', error)
    ElMessage.error('数据加载失败')
  }
}

onMounted(() => {
  loadDashboardData()
})
</script>

<style scoped>
.admin-dashboard {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.breadcrumb {
  margin-bottom: 20px;
}

.dashboard-header {
  margin-bottom: 30px;
}

.dashboard-header h1 {
  font-size: 28px;
  color: #303133;
  margin-bottom: 8px;
}

.dashboard-header p {
  color: #606266;
  font-size: 14px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-content {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  font-size: 24px;
}

.user-icon {
  background-color: #e6f7ff;
  color: #1890ff;
}

.question-icon {
  background-color: #f6ffed;
  color: #52c41a;
}

.resource-icon {
  background-color: #fff7e6;
  color: #fa8c16;
}

.answer-icon {
  background-color: #f9f0ff;
  color: #722ed1;
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 32px;
  font-weight: 600;
  color: #303133;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.stat-trend {
  text-align: right;
}

.trend-up {
  color: #52c41a;
  font-size: 12px;
}

.charts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
}

.chart-card {
  min-height: 300px;
}

.chart-container {
  height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-placeholder {
  text-align: center;
  color: #909399;
}

.chart-placeholder .el-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.quick-actions {
  margin-bottom: 30px;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.action-btn {
  height: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.action-btn .el-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.recent-activities {
  margin-bottom: 30px;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.activity-list {
  max-height: 400px;
  overflow-y: auto;
}

.activity-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #ebeef5;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  background-color: #f5f7fa;
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

.activity-action {
  margin-left: 15px;
}

.no-activities {
  padding: 40px 0;
}

.system-status {
  margin-bottom: 30px;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #ebeef5;
}

.status-item:last-child {
  border-bottom: none;
}

.status-label {
  font-weight: 500;
  color: #606266;
}

.status-value {
  color: #303133;
}

@media (max-width: 768px) {
  .admin-dashboard {
    padding: 15px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .charts-grid {
    grid-template-columns: 1fr;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
  
  .status-grid {
    grid-template-columns: 1fr;
  }
  
  .activity-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .activity-action {
    margin-left: 0;
    align-self: flex-end;
  }
}
</style>