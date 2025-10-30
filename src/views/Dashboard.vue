<template>
  <div class="dashboard">
    <!-- 概览卡片 -->
    <div class="overview-cards">
      <el-card class="stat-card">
        <div class="stat-item">
          <div class="stat-icon total-products">
            <el-icon><Goods /></el-icon>
          </div>
          <div>
            <div class="stat-value">{{ shopData.totalProducts }}</div>
            <div class="stat-label">商品总数</div>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card">
        <div class="stat-item">
          <div class="stat-icon total-categories">
            <el-icon><List /></el-icon>
          </div>
          <div>
            <div class="stat-value">{{ shopData.totalCategories }}</div>
            <div class="stat-label">分类总数</div>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card">
        <div class="stat-item">
          <div class="stat-icon today-orders">
            <el-icon><Calendar /></el-icon>
          </div>
          <div>
            <div class="stat-value">{{ shopData.todayOrders }}</div>
            <div class="stat-label">今日订单</div>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card">
        <div class="stat-item">
          <div class="stat-icon monthly-revenue">
            <el-icon><Money /></el-icon>
          </div>
          <div>
            <div class="stat-value">¥{{ shopData.monthlyRevenue }}</div>
            <div class="stat-label">本月收入</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 快速操作区域 -->
    <div class="quick-actions">
      <el-card class="quick-actions-card">
        <template #header>
          <div class="card-header">
            <span>快速操作</span>
          </div>
        </template>
        <div class="action-buttons">
          <el-button type="primary" @click="$router.push('/home/category')">
            <el-icon><List /></el-icon>
            分类管理
          </el-button>
          <el-button type="success" @click="$router.push('/home/product')">
            <el-icon><Goods /></el-icon>
            商品管理
          </el-button>
          <el-button type="warning" @click="$router.push('/home/hello')">
            <el-icon><Promotion /></el-icon>
            HelloWorld
          </el-button>
        </div>
      </el-card>
    </div>

    <!-- 最近活动 -->
    <div class="recent-activities">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>最近活动</span>
          </div>
        </template>
        <el-timeline>
          <el-timeline-item
            v-for="activity in recentActivities"
            :key="activity.id"
            :timestamp="activity.time"
            :type="activity.type"
          >
            {{ activity.content }}
          </el-timeline-item>
        </el-timeline>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 商店数据
const shopData = reactive({
  totalProducts: 156,
  totalCategories: 8,
  todayOrders: 23,
  monthlyRevenue: '12,580.00'
})

// 最近活动数据
const recentActivities = ref([
  {
    id: 1,
    content: '新增商品 "iPhone 15 Pro"',
    time: '2024-01-20 14:30:00',
    type: 'success'
  },
  {
    id: 2,
    content: '用户 "张三" 下单购买商品',
    time: '2024-01-20 13:15:00',
    type: 'primary'
  },
  {
    id: 3,
    content: '商品 "MacBook Air" 库存不足',
    time: '2024-01-20 11:45:00',
    type: 'warning'
  },
  {
    id: 4,
    content: '新增商品分类 "智能家居"',
    time: '2024-01-20 10:20:00',
    type: 'success'
  }
])

// 组件挂载时获取数据
onMounted(() => {
  // 这里可以调用API获取实时数据
  console.log('Dashboard mounted')
})
</script>

<style scoped>
.dashboard {
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.stat-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.stat-icon.total-products {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.total-categories {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.today-orders {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.monthly-revenue {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #606266;
  margin-top: 4px;
}

.quick-actions-card {
  margin-bottom: 20px;
}

.card-header {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.action-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.recent-activities {
  flex: 1;
}

:deep(.el-timeline) {
  padding-left: 0;
}

:deep(.el-timeline-item__timestamp) {
  color: #909399;
  font-size: 12px;
}
</style>