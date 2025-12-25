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

    <!-- 快速操作 -->
    <div class="quick-actions">
      <el-card>
        <template #header>
          <h3>快速操作</h3>
        </template>
        <div class="actions-grid">
          <el-button type="primary" @click="navigateTo('CourseManagement')" class="action-btn">
            <el-icon><Collection /></el-icon>
            课程管理
          </el-button>
          
          <el-button type="success" @click="navigateTo('TeacherManagement')" class="action-btn">
            <el-icon><UserFilled /></el-icon>
            教师管理
          </el-button>
          
          <el-button type="warning" @click="navigateTo('ResourceManagement')" class="action-btn">
            <el-icon><Document /></el-icon>
            学习资源管理
          </el-button>
          
          <el-button type="danger" @click="navigateTo('QuestionManagement')" class="action-btn">
            <el-icon><QuestionFilled /></el-icon>
            问答内容管理
          </el-button>
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
  Collection, UserFilled
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

// 导航到管理页面
const navigateTo = (routeName) => {
  router.push({ name: routeName })
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
  margin-bottom: 10px;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}

.user-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.question-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.resource-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.answer-icon {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-icon .el-icon {
  font-size: 24px;
  color: white;
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.stat-trend {
  text-align: right;
}

.trend-up {
  color: #67c23a;
  font-size: 12px;
}

.quick-actions {
  margin-bottom: 30px;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.action-btn {
  height: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
}

.action-btn .el-icon {
  font-size: 32px;
  margin-bottom: 10px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .admin-dashboard {
    padding: 16px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
}
</style>