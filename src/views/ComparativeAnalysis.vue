<!-- 比较分析页面 -->
<template>
  <div class="comparative-analysis">
    <!-- 设备数据展示 -->
    <div v-if="comparativeDevices.length > 0" class="comparative-container">
      <!-- 标题和统计信息 -->
      <div class="comparative-header">
        <div class="header-left">
          <el-icon size="28" color="#409EFF">
            <Lightning />
          </el-icon>
          <h2>设备比较分析</h2>
        </div>
        <div class="header-right">
          <el-button 
            v-if="comparativeDevices.length === 2" 
            type="primary" 
            size="large"
            @click="showCostComparison = true"
            class="cost-comparison-btn"
          >
            <el-icon><Money /></el-icon>
            成本比较
          </el-button>
          <span class="device-count">已选择 {{ comparativeDevices.length }} 个设备 (最多2个)</span>
        </div>
      </div>
      
      <!-- 设备卡片网格 -->
      <div class="devices-grid">
        <el-card 
          v-for="(device, index) in comparativeDevices" 
          :key="device.id" 
          class="device-card"
          shadow="hover"
        >
          <template #header>
            <div class="device-header">
              <div class="device-title">
                <el-icon size="20" color="#409EFF">
                  <Lightning />
                </el-icon>
                <h3>{{ device.deviceName }}</h3>
              </div>
              <el-button 
                type="danger" 
                size="small" 
                text 
                @click="removeDevice(index)"
                class="remove-btn"
              >
                <el-icon><Close /></el-icon>
                移除
              </el-button>
            </div>
          </template>
          
          <div class="device-info-grid">
            <div class="info-item">
              <span class="label">设备类型：</span>
              <el-tag :type="getDeviceKindType(device.deviceKind)">
                {{ getDeviceKindText(device.deviceKind) }}
              </el-tag>
            </div>
            
            <div class="info-item">
              <span class="label">能耗等级：</span>
              <el-tag :type="getEnergyLevelType(device.energyLevel)">
                {{ device.energyLevel }}级能耗
              </el-tag>
            </div>
            
            <div class="info-item">
              <span class="label">耗电量：</span>
              <span class="value">{{ device.powerConsumption }} W</span>
            </div>
            
            <div class="info-item">
              <span class="label">安装位置：</span>
              <span class="value">{{ device.location || '未设置' }}</span>
            </div>
            
            <div class="info-item">
              <span class="label">设备状态：</span>
              <el-tag :type="getStatusType(device.status)">
                {{ getStatusText(device.status) }}
              </el-tag>
            </div>
            
            <div class="info-item">
              <span class="label">安装日期：</span>
              <span class="value">{{ device.installDate || '未设置' }}</span>
            </div>
          </div>
          
          <!-- 设备图片 -->
          <div v-if="device.image" class="device-image-container">
            <el-image 
              :src="device.image" 
              style="width: 100%; height: 180px; border-radius: 8px"
              fit="cover"
            />
          </div>
          
          <!-- 选择时间 -->
          <div class="selected-time">
            <el-icon size="14" color="#909399">
              <Clock />
            </el-icon>
            <span>选择时间：{{ formatTime(device.selectedTime) }}</span>
          </div>
        </el-card>
      </div>
      
      <!-- 成本比较结果 -->
      <div v-if="costComparisonResult" class="cost-comparison-result">
        <el-card class="result-card" shadow="hover">
          <template #header>
            <div class="result-header">
              <el-icon size="20" color="#67C23A">
                <Money />
              </el-icon>
              <h3>成本比较结果</h3>
            </div>
          </template>
          
          <div class="cost-grid">
            <div class="cost-item">
              <div class="cost-label">{{ comparativeDevices[0].deviceName }}</div>
              <div class="cost-value">¥{{ costComparisonResult.device1TotalCost.toLocaleString() }}</div>
            </div>
            <div class="cost-item">
              <div class="cost-label">{{ comparativeDevices[1].deviceName }}</div>
              <div class="cost-value">¥{{ costComparisonResult.device2TotalCost.toLocaleString() }}</div>
            </div>
            <div class="cost-difference">
              <div class="difference-label">成本差异</div>
              <div class="difference-value" :class="{ 'positive': costComparisonResult.costDifference > 0, 'negative': costComparisonResult.costDifference < 0 }">
                {{ costComparisonResult.costDifference > 0 ? '+' : '' }}¥{{ Math.abs(costComparisonResult.costDifference).toLocaleString() }}
              </div>
            </div>
          </div>
          
          <div class="cost-details">
            <div class="detail-item">
              <span>电费标准：</span>
              <span>上海市居民用电价格 (0.617元/度)</span>
            </div>
            <div class="detail-item">
              <span>计算周期：</span>
              <span>{{ costComparisonResult.usageYears }}年</span>
            </div>
            <div class="detail-item">
              <span>能耗等级：</span>
              <span>{{ comparativeDevices[0].energyLevel }}级 vs {{ comparativeDevices[1].energyLevel }}级</span>
            </div>
          </div>
        </el-card>
      </div>
    </div>
    
    <!-- 等待选择提示 -->
    <div v-else class="placeholder-content">
      <el-card class="placeholder-card">
        <div class="placeholder-text">
          <el-icon size="48" color="#909399">
            <Lightning />
          </el-icon>
          <h3>等待设备选择</h3>
          <p>请先在设备管理页面选择需要比较的设备 (最多2个)</p>
        </div>
      </el-card>
    </div>
    
    <!-- 成本比较对话框 -->
    <el-dialog 
      v-model="showCostComparison" 
      title="成本比较" 
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="costForm" label-width="180px">
        <el-form-item :label="(comparativeDevices[0]?.deviceName || '设备1') + '价格：'" required>
          <el-input-number 
            v-model="costForm.device1Price" 
            :min="0" 
            :precision="2"
            :step="100"
            style="width: 200px"
            placeholder="请输入购买/租赁价格"
          >
            <template #prefix>¥</template>
          </el-input-number>
        </el-form-item>
        
        <el-form-item :label="(comparativeDevices[1]?.deviceName || '设备2') + '价格：'" required>
          <el-input-number 
            v-model="costForm.device2Price" 
            :min="0" 
            :precision="2"
            :step="100"
            style="width: 200px"
            placeholder="请输入购买/租赁价格"
          >
            <template #prefix>¥</template>
          </el-input-number>
        </el-form-item>
        
        <el-form-item label="日平均使用时间：" required>
          <el-input-number 
            v-model="costForm.dailyUsageHours" 
            :min="0" 
            :max="24"
            :precision="1"
            :step="0.5"
            style="width: 200px"
            placeholder="小时"
          >
            <template #suffix>小时</template>
          </el-input-number>
        </el-form-item>
        
        <el-form-item label="年使用天数：" required>
          <el-input-number 
            v-model="costForm.yearlyUsageDays" 
            :min="0" 
            :max="365"
            :step="1"
            style="width: 200px"
            placeholder="天"
          >
            <template #suffix>天</template>
          </el-input-number>
        </el-form-item>
        
        <el-form-item label="使用年限：" required>
          <el-input-number 
            v-model="costForm.usageYears" 
            :min="1" 
            :max="50"
            :step="1"
            style="width: 200px"
            placeholder="年"
          >
            <template #suffix>年</template>
          </el-input-number>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showCostComparison = false">取消</el-button>
        <el-button type="primary" @click="calculateCostComparison">计算比较</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Lightning, Close, Clock, Money } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 比较设备列表
const comparativeDevices = ref([])

// 成本比较相关变量
const showCostComparison = ref(false)
const costComparisonResult = ref(null)

// 成本表单数据
const costForm = ref({
  device1Price: 0,
  device2Price: 0,
  dailyUsageHours: 8,
  yearlyUsageDays: 300,
  usageYears: 5
})

// 设备类型选项
const deviceKindOptions = [
  { label: '数码设备', value: 'digital' },
  { label: '家电设备', value: 'homeAppliance' }
]

// 获取设备类型显示文本
const getDeviceKindText = (kind) => {
  const option = deviceKindOptions.find(opt => opt.value === kind)
  return option ? option.label : kind
}

// 获取设备类型标签类型
const getDeviceKindType = (kind) => {
  return kind === 'digital' ? 'primary' : 'success'
}

// 获取能耗等级标签类型
const getEnergyLevelType = (level) => {
  return level <= '2' ? 'success' : level === '3' ? 'warning' : 'danger'
}

// 获取状态标签类型
const getStatusType = (status) => {
  return status === 'online' || status === '在线' ? 'success' : 'info'
}

// 获取状态显示文本
const getStatusText = (status) => {
  if (status === 'online' || status === '在线') {
    return '在线'
  } else if (status === 'offline' || status === '离线') {
    return '离线'
  }
  return status
}

// 格式化时间
const formatTime = (timeString) => {
  if (!timeString) return '未知'
  const date = new Date(timeString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 移除设备
const removeDevice = (index) => {
  const deviceName = comparativeDevices.value[index].deviceName
  comparativeDevices.value.splice(index, 1)
  
  // 更新localStorage
  localStorage.setItem('comparativeDevices', JSON.stringify(comparativeDevices.value))
  
  ElMessage.success(`已移除设备"${deviceName}"`)
  console.log('当前比较设备列表:', comparativeDevices.value)
}

// 加载设备数据
const loadDeviceData = () => {
  const storedData = localStorage.getItem('comparativeDevices')
  if (storedData) {
    comparativeDevices.value = JSON.parse(storedData)
    console.log('加载的比较设备列表:', comparativeDevices.value)
  }
}

// 获取能耗等级对应的能效比
const getEnergyEfficiencyRatio = (energyLevel) => {
  const efficiencyRatios = {
    '1': 5.0, // 一级能耗
    '2': 4.7, // 二级能耗
    '3': 4.2, // 三级能耗
    '4': 3.7, // 四级能耗
    '5': 3.2  // 五级能耗
  }
  return efficiencyRatios[energyLevel] || 1.0 // 默认能效比为1.0
}

// 计算成本比较
const calculateCostComparison = () => {
  // 验证表单数据
  if (!costForm.value.device1Price || !costForm.value.device2Price || 
      !costForm.value.dailyUsageHours || !costForm.value.yearlyUsageDays || 
      !costForm.value.usageYears) {
    ElMessage.error('请填写完整的成本比较信息')
    return
  }
  
  // 上海市电费标准 (元/度)
  const electricityPrice = 0.617
  
  // 获取设备1的能耗等级和能效比
  const device1EnergyLevel = comparativeDevices.value[0].energyLevel
  const device1EfficiencyRatio = getEnergyEfficiencyRatio(device1EnergyLevel)
  
  // 获取设备2的能耗等级和能效比
  const device2EnergyLevel = comparativeDevices.value[1].energyLevel
  const device2EfficiencyRatio = getEnergyEfficiencyRatio(device2EnergyLevel)
  
  // 计算设备1的实际耗电量（考虑能效比）
  const device1Power = parseFloat(comparativeDevices.value[0].powerConsumption) || 0
  const device1ActualPower = device1Power / device1EfficiencyRatio // 实际耗电量 = 额定功率 / 能效比
  const device1ElectricityCost = device1ActualPower * costForm.value.dailyUsageHours * 
                                costForm.value.yearlyUsageDays * costForm.value.usageYears * 
                                electricityPrice / 1000
  const device1TotalCost = costForm.value.device1Price + device1ElectricityCost
  
  // 计算设备2的实际耗电量（考虑能效比）
  const device2Power = parseFloat(comparativeDevices.value[1].powerConsumption) || 0
  const device2ActualPower = device2Power / device2EfficiencyRatio // 实际耗电量 = 额定功率 / 能效比
  const device2ElectricityCost = device2ActualPower * costForm.value.dailyUsageHours * 
                                costForm.value.yearlyUsageDays * costForm.value.usageYears * 
                                electricityPrice / 1000
  const device2TotalCost = costForm.value.device2Price + device2ElectricityCost
  
  // 计算成本差异
  const costDifference = device1TotalCost - device2TotalCost
  
  // 设置比较结果
  costComparisonResult.value = {
    device1TotalCost: Math.round(device1TotalCost * 100) / 100,
    device2TotalCost: Math.round(device2TotalCost * 100) / 100,
    costDifference: Math.round(costDifference * 100) / 100,
    usageYears: costForm.value.usageYears,
    electricityPrice: electricityPrice,
    device1EfficiencyRatio: device1EfficiencyRatio,
    device2EfficiencyRatio: device2EfficiencyRatio,
    device1ActualPower: Math.round(device1ActualPower * 100) / 100,
    device2ActualPower: Math.round(device2ActualPower * 100) / 100
  }
  
  // 关闭对话框
  showCostComparison.value = false
  
  ElMessage.success('成本比较计算完成')
}

// 组件挂载时加载数据
onMounted(() => {
  loadDeviceData()
})
</script>

<style scoped>
.comparative-analysis {
  height: 100%;
  min-height: calc(100vh - 140px);
  padding: 20px;
}

/* 比较容器 */
.comparative-container {
  max-width: 1200px;
  margin: 0 auto;
}

/* 比较头部 */
.comparative-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-radius: 12px;
  border-left: 4px solid #409EFF;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-left h2 {
  margin: 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.header-right .device-count {
  font-size: 16px;
  color: #606266;
  font-weight: 500;
  background: #ffffff;
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid #e4e7ed;
}

/* 设备网格 */
.devices-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 24px;
  margin-bottom: 20px;
}

.device-card {
  transition: all 0.3s ease;
  border-radius: 12px;
  border: 1px solid #e4e7ed;
}

.device-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.device-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 !important;
}

.device-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.device-title h3 {
  margin: 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.remove-btn {
  color: #f56c6c !important;
  font-size: 12px;
}

.remove-btn:hover {
  background-color: #fef0f0 !important;
}

/* 设备信息网格 */
.device-info-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  margin-bottom: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #409EFF;
}

.info-item .label {
  font-weight: 600;
  color: #606266;
  min-width: 80px;
  font-size: 14px;
}

.info-item .value {
  color: #303133;
  font-weight: 500;
  font-size: 14px;
}

/* 设备图片容器 */
.device-image-container {
  text-align: center;
  margin: 16px 0;
  padding: 16px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 8px;
}

/* 选择时间 */
.selected-time {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #909399;
  margin-top: 12px;
  padding: 8px 12px;
  background: #fafafa;
  border-radius: 6px;
}

/* 等待选择提示 */
.placeholder-content {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400px;
}

.placeholder-card {
  width: 100%;
  max-width: 400px;
  text-align: center;
  padding: 40px;
  border-radius: 12px;
  border: 1px solid #e4e7ed;
}

.placeholder-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.placeholder-text h3 {
  font-size: 18px;
  font-weight: 500;
  color: #303133;
  margin: 0;
}

.placeholder-text p {
  font-size: 14px;
  color: #909399;
  margin: 0;
  line-height: 1.5;
}

/* 成本比较按钮 */
.cost-comparison-btn {
  margin-right: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #67C23A 0%, #85CE61 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(103, 194, 58, 0.3);
}

.cost-comparison-btn:hover {
  background: linear-gradient(135deg, #5DAF34 0%, #7BC95C 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(103, 194, 58, 0.4);
}

/* 成本比较结果 */
.cost-comparison-result {
  margin-top: 24px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.result-card {
  border-radius: 12px;
  border: 1px solid #e4e7ed;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.result-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 !important;
}

.result-header h3 {
  margin: 0;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
}

/* 成本网格 */
.cost-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 20px;
}

.cost-item {
  text-align: center;
  padding: 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.cost-label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
  margin-bottom: 8px;
}

.cost-value {
  font-size: 24px;
  font-weight: 700;
  color: #409EFF;
}

/* 成本差异 */
.cost-difference {
  grid-column: 1 / -1;
  text-align: center;
  padding: 20px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%);
  border-radius: 8px;
  border: 1px solid #91d5ff;
}

.difference-label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
  margin-bottom: 8px;
}

.difference-value {
  font-size: 20px;
  font-weight: 700;
}

.difference-value.positive {
  color: #F56C6C;
}

.difference-value.negative {
  color: #67C23A;
}

/* 成本详情 */
.cost-details {
  display: flex;
  justify-content: center;
  gap: 32px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  margin-top: 16px;
}

.detail-item {
  font-size: 14px;
  color: #606266;
}

.detail-item span:first-child {
  font-weight: 600;
  color: #303133;
}
</style>