<template>
  <div class="admin-dashboard">
    <div class="breadcrumb">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/admin' }">管理员后台</el-breadcrumb-item>
        <el-breadcrumb-item>仪表板</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div class="dashboard-header">
      <h1>数据统计</h1>
      <p>欢迎回来，管理员！这里是系统的数据统计和分析。</p>
    </div>

    <!-- 图表区域 -->
    <div class="charts-grid">
      <!-- 用户身份分布饼图 -->
      <el-card class="chart-card">
        <template #header>
          <h3>用户身份分布</h3>
        </template>
        <div class="chart-container">
          <v-chart :option="userRoleChartOption" style="height: 300px;" />
        </div>
      </el-card>

      <!-- 用户注册时间柱状图 -->
      <el-card class="chart-card">
        <template #header>
          <h3>用户注册趋势</h3>
        </template>
        <div class="chart-container">
          <v-chart :option="userRegisterChartOption" style="height: 300px;" />
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
import { ElMessage } from 'element-plus'
import { 
  Collection, UserFilled, QuestionFilled, Document
} from '@element-plus/icons-vue'
import VChart from 'vue-echarts'
import * as echarts from 'echarts'

const router = useRouter()

// 图表配置
const userRoleChartOption = reactive({
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b}: {c} ({d}%)'
  },
  legend: {
    orient: 'vertical',
    left: 'left',
    data: ['学生', '教师', '管理员']
  },
  color: ['#5470c6', '#91cc75', '#fac858'],
  series: [
    {
      name: '用户身份分布',
      type: 'pie',
      radius: '50%',
      data: [
        { value: 150, name: '学生' },
        { value: 25, name: '教师' },
        { value: 5, name: '管理员' }
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      },
      itemStyle: {
        borderRadius: 8,
        borderColor: '#fff',
        borderWidth: 2
      }
    }
  ]
})

const userRegisterChartOption = reactive({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  xAxis: {
    type: 'category',
    data: [],
    axisLabel: {
      rotate: 0
    }
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: '注册用户数',
      type: 'bar',
      data: [],
      itemStyle: {
        color: '#409EFF',
        borderRadius: [4, 4, 0, 0]
      }
    }
  ]
})

// API调用函数
const fetchUserRoleStats = async () => {
  try {
    const response = await fetch('/api/v1/report/identityCount')
    const data = await response.json()
    if (data.code === 1 && data.data) {
      const roleStats = { student: 0, teacher: 0, admin: 0 }
      data.data.forEach(item => {
        if (item.role === 'student') roleStats.student = item.count
        if (item.role === 'teacher') roleStats.teacher = item.count
        if (item.role === 'admin') roleStats.admin = item.count
      })
      return roleStats
    }
    return { student: 0, teacher: 0, admin: 0 }
  } catch (error) {
    console.error('获取用户身份统计数据失败:', error)
    return { student: 0, teacher: 0, admin: 0 }
  }
}

const fetchUserRegisterStats = async () => {
  try {
    const response = await fetch('/api/v1/report/userCountByTime')
    const data = await response.json()
    if (data.code === 1 && data.data) {
      // 直接使用API返回的日期数据，显示完整日期
      const dates = []
      const counts = []
      data.data.forEach(item => {
        // 格式化日期，显示完整日期
        const date = new Date(item.date)
        const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
        dates.push(formattedDate)
        counts.push(item.count)
      })
      return { dates, counts }
    }
    return { dates: [], counts: [] }
  } catch (error) {
    console.error('获取用户注册统计数据失败:', error)
    return { dates: [], counts: [] }
  }
}

// 导航到管理页面
const navigateTo = (routeName) => {
  router.push({ name: routeName })
}

// 加载图表数据
const loadChartData = async () => {
  try {
    // 获取用户身份统计数据
    const roleStats = await fetchUserRoleStats()
    userRoleChartOption.series[0].data = [
      { value: roleStats.student, name: '学生' },
      { value: roleStats.teacher, name: '教师' },
      { value: roleStats.admin, name: '管理员' }
    ]
    
    // 获取用户注册统计数据
    const registerStats = await fetchUserRegisterStats()
    userRegisterChartOption.xAxis.data = registerStats.dates
    userRegisterChartOption.series[0].data = registerStats.counts
    
    ElMessage.success('图表数据加载完成')
  } catch (error) {
    console.error('加载图表数据失败:', error)
    ElMessage.error('图表数据加载失败')
  }
}

onMounted(() => {
  loadChartData()
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

.charts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 30px;
}

.chart-card {
  transition: transform 0.3s ease;
}

.chart-card:hover {
  transform: translateY(-2px);
}

.chart-container {
  width: 100%;
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
  
  .charts-grid {
    grid-template-columns: 1fr;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
}
</style>