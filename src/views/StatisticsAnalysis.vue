<template>
  <div class="statistics-analysis">
    <!-- 顶部：能耗等级分布和设备类型分布 -->
    <div class="top-charts-container">
      <!-- 能耗等级分布柱状图 -->
      <el-card class="chart-card">
        <template #header>
          <div class="chart-header">
            <span>能耗等级分布</span>
          </div>
        </template>
        <div ref="energyLevelChart" class="chart" style="height: 400px;"></div>
      </el-card>

      <!-- 设备类型分布饼图 -->
      <el-card class="chart-card">
        <template #header>
          <div class="chart-header">
            <span>设备类型分布</span>
          </div>
        </template>
        <div ref="deviceKindChart" class="chart" style="height: 400px;"></div>
      </el-card>
    </div>

    <!-- 底部：功率趋势折线图 -->
    <div class="bottom-chart-container">
      <el-card class="chart-card">
        <template #header>
          <div class="chart-header">
            <span>功率趋势分析</span>
          </div>
        </template>
        <div ref="powerTrendChart" class="chart" style="height: 500px;"></div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

// 路由实例
const router = useRouter()

// 图表相关变量
const powerTrendChart = ref(null)
const energyLevelChart = ref(null)
const deviceKindChart = ref(null)
let powerTrendChartInstance = null
let energyLevelChartInstance = null
let deviceKindChartInstance = null
let echarts = null

// 图表数据
const powerTrendData = ref([])
const energyLevelData = ref([])
const deviceKindData = ref([])

// 初始化图表
const initCharts = async () => {
  // 如果ECharts未加载，则动态加载CDN
  if (!echarts) {
    await loadEChartsFromCDN()
  }
  
  if (powerTrendChart.value && !powerTrendChartInstance) {
    powerTrendChartInstance = echarts.init(powerTrendChart.value)
  }
  
  if (energyLevelChart.value && !energyLevelChartInstance) {
    energyLevelChartInstance = echarts.init(energyLevelChart.value)
  }
  
  if (deviceKindChart.value && !deviceKindChartInstance) {
    deviceKindChartInstance = echarts.init(deviceKindChart.value)
  }
}

// 从CDN动态加载ECharts
const loadEChartsFromCDN = () => {
  return new Promise((resolve, reject) => {
    // 检查是否已经加载
    if (window.echarts) {
      echarts = window.echarts
      resolve()
      return
    }
    
    // 创建script标签加载ECharts
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js'
    script.onload = () => {
      echarts = window.echarts
      console.log('ECharts CDN加载成功')
      resolve()
    }
    script.onerror = (error) => {
      console.error('ECharts CDN加载失败:', error)
      ElMessage.error('图表库加载失败，请检查网络连接')
      reject(error)
    }
    document.head.appendChild(script)
  })
}

// 加载图表数据
const loadChartData = async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    
    // 加载功率趋势数据
    const powerResponse = await fetch('/api/report/PowerTrendData', {
      headers: {
        'token': token
      }
    })
    
    if (powerResponse.ok) {
      const powerResult = await powerResponse.json()
      console.log('功率趋势API响应:', powerResult)
      
      if (powerResult.code === 1 && powerResult.data) {
        // 处理功率趋势数据格式
        const apiData = powerResult.data
        
        // 根据您提供的响应格式处理：包含rows数组的数据结构
        if (apiData.rows && Array.isArray(apiData.rows)) {
          // 使用rows数组，包含deviceName、timePoint、totalPower字段
          powerTrendData.value = {
            total: apiData.total || apiData.rows.length,
            rows: apiData.rows.map(item => ({
              deviceName: item.deviceName || '未知设备',
              timePoint: item.timePoint || '未知时间',
              totalPower: item.totalPower || 0
            }))
          }
        } else if (Array.isArray(apiData)) {
          // 如果是数组格式，直接使用
          powerTrendData.value = {
            total: apiData.length,
            rows: apiData
          }
        } else {
          // 其他格式，使用默认数据
          powerTrendData.value = {
            total: 12,
            rows: [
              { deviceName: '门禁系统', timePoint: '2022-08-12', totalPower: 100 },
              { deviceName: '服务器主机', timePoint: '2022-11-10', totalPower: 1600 },
              { deviceName: '电梯-主梯', timePoint: '2023-01-08', totalPower: 7100 },
              { deviceName: '消防报警器', timePoint: '2023-02-28', totalPower: 7130 },
              { deviceName: '照明系统-A', timePoint: '2023-03-20', totalPower: 7930 },
              { deviceName: '打印机-财务', timePoint: '2023-04-05', totalPower: 8530 },
              { deviceName: '中央空调-01', timePoint: '2023-05-15', totalPower: 12030 },
              { deviceName: '投影仪', timePoint: '2023-06-15', totalPower: 12330 },
              { deviceName: '饮水机-01', timePoint: '2023-06-18', totalPower: 12450 },
              { deviceName: '监控摄像头', timePoint: '2023-07-12', totalPower: 12500 },
              { deviceName: '拯救者y7000p', timePoint: '2023-07-20', totalPower: 12730 },
              { deviceName: '宿舍老空调', timePoint: '2023-09-18', totalPower: 13930 }
            ]
          }
        }
        
        console.log('处理后的功率趋势数据:', powerTrendData.value)
        updatePowerTrendChart()
      } else {
        ElMessage.warning('功率趋势数据格式异常')
      }
    } else {
      ElMessage.error('功率趋势数据加载失败')
    }
    
    // 加载能耗等级数据
    const energyResponse = await fetch('/api/report/EnergyLevelData', {
      headers: {
        'token': token
      }
    })
    
    if (energyResponse.ok) {
      const energyResult = await energyResponse.json()
      console.log('能耗等级API响应:', energyResult)
      
      if (energyResult.code === 1 && energyResult.data) {
        // 处理不同的数据格式
        const apiData = energyResult.data
        
        // 检查数据格式：可能是数组或对象
        if (Array.isArray(apiData)) {
          // 如果是数组格式，直接使用
          energyLevelData.value = apiData.map(item => ({
            level: item.level || item.name || item.label || '未知',
            count: item.count || item.value || 0
          }))
        } else if (typeof apiData === 'object') {
          // 如果是对象格式，转换为数组
          energyLevelData.value = Object.keys(apiData).map(key => ({
            level: key,
            count: apiData[key]
          }))
        } else {
          // 其他格式，使用默认数据
          energyLevelData.value = [
            { level: '一级能耗', count: 5 },
            { level: '二级能耗', count: 8 },
            { level: '三级能耗', count: 3 }
          ]
        }
        
        console.log('处理后的能耗等级数据:', energyLevelData.value)
        updateEnergyLevelChart()
      } else {
        ElMessage.warning('能耗等级数据格式异常')
      }
    } else {
      ElMessage.error('能耗等级数据加载失败')
    }
    
    // 加载设备类型数据
    const deviceResponse = await fetch('/api/report/DeviceKindData', {
      headers: {
        'token': token
      }
    })
    
    if (deviceResponse.ok) {
      const deviceResult = await deviceResponse.json()
      console.log('设备类型API响应:', deviceResult)
      
      if (deviceResult.code === 1 && deviceResult.data) {
        // 处理不同的数据格式
        const apiData = deviceResult.data
        
        // 检查数据格式：可能是数组或对象
        if (Array.isArray(apiData)) {
          // 如果是数组格式，直接使用
          deviceKindData.value = apiData.map(item => ({
            kind: item.kind || item.name || item.label || '未知',
            count: item.count || item.value || 0
          }))
        } else if (typeof apiData === 'object') {
          // 如果是对象格式，转换为数组
          deviceKindData.value = Object.keys(apiData).map(key => ({
            kind: key,
            count: apiData[key]
          }))
        } else {
          // 其他格式，使用默认数据
          deviceKindData.value = [
            { kind: '空调', count: 5 },
            { kind: '冰箱', count: 3 },
            { kind: '电视', count: 4 }
          ]
        }
        
        console.log('处理后的设备类型数据:', deviceKindData.value)
        updateDeviceKindChart()
      } else {
        ElMessage.warning('设备类型数据格式异常')
      }
    } else {
      ElMessage.error('设备类型数据加载失败')
    }
    
  } catch (error) {
    console.error('加载图表数据失败:', error)
    ElMessage.error('图表数据加载失败')
    // 不显示模拟数据，只显示空图表
    updateEmptyCharts()
  }
}

// 更新能耗等级柱状图
const updateEnergyLevelChart = () => {
  if (!energyLevelChartInstance || !echarts) return
  
  // 检查是否有数据
  if (energyLevelData.value.length === 0) {
    updateEmptyChart(energyLevelChartInstance, '能耗等级分布')
    return
  }
  
  const option = {
    title: {
      text: '能耗等级分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    xAxis: {
      type: 'category',
      data: energyLevelData.value.map(item => item.level),
      axisLabel: {
        interval: 0,
        rotate: 0,
        fontSize: 14,
        fontWeight: 'normal',
        color: '#333',
        margin:12
      },
      axisTick: {
        alignWithLabel: true
      }
    },
    yAxis: {
      type: 'value',
      name: '设备数量'
    },
    series: [{
      data: energyLevelData.value.map(item => item.count),
      type: 'bar',
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#83bff6' },
          { offset: 0.5, color: '#188df0' },
          { offset: 1, color: '#188df0' }
        ])
      },
      emphasis: {
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#2378f7' },
            { offset: 0.7, color: '#2378f7' },
            { offset: 1, color: '#83bff6' }
          ])
        }
      }
    }]
  }
  
  energyLevelChartInstance.setOption(option)
}

// 更新功率趋势折线图
const updatePowerTrendChart = () => {
  if (!powerTrendChartInstance || !echarts) return
  
  // 检查是否有数据
  if (powerTrendData.value.length === 0) {
    updateEmptyChart(powerTrendChartInstance, '新增功率趋势分析')
    return
  }
  
  // 根据实际数据格式处理
  const dataRows = powerTrendData.value.rows || powerTrendData.value
  
  // 直接使用设备的时间点月份，不限制数量
   const generateTimePoints = () => {
     // 提取所有设备的时间点并转换为年月格式
     const allTimePoints = dataRows
       .filter(item => item.timePoint && item.timePoint.length >= 7)
       .map(item => {
         // 处理不同格式的时间点
         const dateStr = item.timePoint
         if (dateStr.includes('/')) {
           // 处理 "2025/10" 格式
           const parts = dateStr.split('/')
           if (parts.length === 2) {
             return `${parts[0]}-${parts[1].padStart(2, '0')}`
           }
         }
         // 处理 "2025-10" 或 "2025-10-01" 格式
         return dateStr.substring(0, 7)
       })
       .filter((value, index, self) => self.indexOf(value) === index) // 去重
       .sort()
     
     if (allTimePoints.length === 0) {
       // 如果没有有效数据，生成当前年份的12个月
       const currentYear = new Date().getFullYear()
       const timePoints = []
       for (let i = 0; i < 12; i++) {
         const month = (i + 1).toString().padStart(2, '0')
         timePoints.push(`${currentYear}-${month}`)
       }
       return timePoints
     }
     
     return allTimePoints
   }
   
   const timePoints = generateTimePoints()
   
   // 计算当月新增设备总耗电量
   const powerValues = timePoints.map(timePoint => {
     // 查找在该时间点当月新增的设备
     const monthDevices = dataRows.filter(item => {
       if (!item.timePoint) return false
       
       // 处理不同格式的时间点
       const dateStr = item.timePoint
       let deviceMonth
       
       if (dateStr.includes('/')) {
         // 处理 "2025/10" 格式
         const parts = dateStr.split('/')
         if (parts.length === 2) {
           deviceMonth = `${parts[0]}-${parts[1].padStart(2, '0')}`
         } else {
           deviceMonth = dateStr.substring(0, 7)
         }
       } else {
         // 处理 "2025-10" 或 "2025-10-01" 格式
         deviceMonth = dateStr.substring(0, 7)
       }
       
       return deviceMonth === timePoint
     })
     
     if (monthDevices.length === 0) {
       return 0
     }
     
     // 计算当月新增设备的总耗电量
     const totalPower = monthDevices.reduce((sum, device) => {
       return sum + (device.totalPower || 0)
     }, 0)
     
     return totalPower
   })
  
  const option = {
    title: {
      text: '新增功率趋势分析',
      left: 'center',
      textStyle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      },
      textStyle: {
        fontSize: 14,
        fontWeight: 'normal',
        fontFamily: 'Microsoft YaHei, sans-serif',
        color: '#333'
      },
      formatter: function(params) {
        const data = params[0]
        const timePoint = data.name
        const powerValue = data.data
        
        // 查找在该时间点当月新增的设备
        const targetMonth = timePoint
        const monthDevices = dataRows.filter(item => {
          if (!item.timePoint) return false
          
          // 处理不同格式的时间点
          const dateStr = item.timePoint
          let deviceMonth
          
          if (dateStr.includes('/')) {
            // 处理 "2025/10" 格式
            const parts = dateStr.split('/')
            if (parts.length === 2) {
              deviceMonth = `${parts[0]}-${parts[1].padStart(2, '0')}`
            } else {
              deviceMonth = dateStr.substring(0, 7)
            }
          } else {
            // 处理 "2025-10" 或 "2025-10-01" 格式
            deviceMonth = dateStr.substring(0, 7)
          }
          
          return deviceMonth === targetMonth
        })
        
        if (monthDevices.length === 0) {
          return `<div style="font-family: Microsoft YaHei, sans-serif; font-style: normal;">
            <div style="font-size: 16px; font-weight: bold; color: #333; margin-bottom: 8px;">${timePoint}</div>
            <div style="color: #999;">该月份暂无新增设备</div>
          </div>`
        }
        
        let html = `<div style="font-family: Microsoft YaHei, sans-serif; font-style: normal;">
          <div style="font-size: 16px; font-weight: bold; color: #333; margin-bottom: 8px;">${timePoint} 月份汇总</div>
          <div style="font-size: 14px; color: #666; margin-bottom: 8px;">
            本月新增设备总耗电量: <span style="color: #1890ff; font-weight: bold;">${powerValue.toFixed(2)} kWh</span>
          </div>
          <div style="font-size: 14px; color: #666; margin-bottom: 12px;">
            本月新增设备数量: <span style="color: #52c41a; font-weight: bold;">${monthDevices.length} 台</span>
          </div>
          <div style="font-size: 14px; font-weight: bold; color: #333; margin-bottom: 8px;">新增设备列表:</div>`
        
        // 按安装时间排序
        const sortedDevices = monthDevices.sort((a, b) => 
          new Date(a.timePoint) - new Date(b.timePoint)
        )
        
        sortedDevices.forEach((device, index) => {
          html += `<div style="font-size: 13px; color: #666; margin-bottom: 4px; padding-left: 12px;">
            ${index + 1}. ${device.deviceName || '未知设备'}
            <br/>
            <span style="color: #999; font-size: 12px;">安装时间: ${device.timePoint} | 耗电量: ${device.totalPower || 0} kWh</span>
          </div>`
        })
        
        html += '</div>'
        return html
      }
    },
    legend: {
      data: ['总功率'],
      top: 30
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '8%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: timePoints,
      axisLabel: {
        interval: 0,
        rotate: 0,
        margin: 20,
        fontSize: 14,
        fontWeight: 'normal',
        fontStyle: 'normal',
        color: '#333',
        fontFamily: 'Microsoft YaHei, sans-serif',
        formatter: function(value) {
          // 显示为"年-月"格式，如"2022-03"
          return value
        }
      }
    },
    yAxis: {
      type: 'value',
      name: '功率 (W)',
      nameLocation: 'end',
      nameGap: 20,
      nameRotate: 0,
      nameTextStyle: {
        fontSize: 14,
        fontWeight: 'normal',
        color: '#333',
        fontFamily: 'Microsoft YaHei, sans-serif',
        align: 'left',
        verticalAlign: 'top',
        padding: [-30, 0, 0, -60]
      },
      axisLabel: {
        fontSize: 14,
        fontWeight: 'normal',
        color: '#333',
        fontFamily: 'Microsoft YaHei, sans-serif',
        formatter: '{value} W'
      }
    },
    series: [{
      name: '总功率',
      type: 'line',
      data: powerValues,
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: {
        width: 3,
        color: '#5470c6'
      },
      itemStyle: {
        color: '#5470c6',
        borderColor: '#fff',
        borderWidth: 2
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(84, 112, 198, 0.6)' },
          { offset: 1, color: 'rgba(84, 112, 198, 0.1)' }
        ])
      },
      emphasis: {
        focus: 'series',
        itemStyle: {
          color: '#ee6666',
          borderColor: '#fff',
          borderWidth: 2
        }
      }
    }]
  }
  
  powerTrendChartInstance.setOption(option)
}

// 更新设备类型饼图
const updateDeviceKindChart = () => {
  if (!deviceKindChartInstance || !echarts) return
  
  // 检查是否有数据
  if (deviceKindData.value.length === 0) {
    updateEmptyChart(deviceKindChartInstance, '设备类型分布')
    return
  }
  
  const option = {
    title: {
      text: '设备类型分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: deviceKindData.value.map(item => item.kind),
      textStyle: {
        fontSize: 14,
        fontWeight: 'normal',
        color: '#666'
      }
    },
    series: [{
      name: '设备类型',
      type: 'pie',
      radius: '50%',
      center: ['50%', '60%'],
      data: deviceKindData.value.map(item => ({
        value: item.count,
        name: item.kind
      })),
      itemStyle: {
        color: function(params) {
          const pieChartColors = [
            '#FFA07A', // 橙色
            '#90EE90', // 浅绿色
            '#FFC0CB', // 粉色
            ]
          return pieChartColors[params.dataIndex % pieChartColors.length]
        }
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      },
      label: {
        show: true,
        formatter: '{b}: {c} ({d}%)',
        fontSize: 16,
        fontWeight: 'normal',
        color: '#555'
      }
    }]
  }
  
  deviceKindChartInstance.setOption(option)
}

// 更新空图表
const updateEmptyChart = (chartInstance, title) => {
  if (!chartInstance || !echarts) return
  
  const option = {
    title: {
      text: title,
      left: 'center',
      textStyle: {
        color: '#999',
        fontWeight: 'normal'
      }
    },
    graphic: {
      type: 'text',
      left: 'center',
      top: 'middle',
      style: {
        text: '暂无数据',
        fontSize: 16,
        fill: '#999'
      }
    }
  }
  
  chartInstance.setOption(option)
}

// 更新空图表
const updateEmptyCharts = () => {
  if (powerTrendChartInstance) {
    updateEmptyChart(powerTrendChartInstance, '功率趋势分析')
  }
  if (energyLevelChartInstance) {
    updateEmptyChart(energyLevelChartInstance, '能耗等级分布')
  }
  if (deviceKindChartInstance) {
    updateEmptyChart(deviceKindChartInstance, '设备类型分布')
  }
}

// 窗口大小变化时重绘图表
const handleResize = () => {
  if (powerTrendChartInstance) {
    powerTrendChartInstance.resize()
  }
  if (energyLevelChartInstance) {
    energyLevelChartInstance.resize()
  }
  if (deviceKindChartInstance) {
    deviceKindChartInstance.resize()
  }
}

// 组件挂载时初始化
onMounted(async () => {
  await nextTick()
  await initCharts()
  await loadChartData()
  
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
})

// 组件卸载时清理
onUnmounted(() => {
  if (powerTrendChartInstance) {
    powerTrendChartInstance.dispose()
  }
  if (energyLevelChartInstance) {
    energyLevelChartInstance.dispose()
  }
  if (deviceKindChartInstance) {
    deviceKindChartInstance.dispose()
  }
  
  // 移除事件监听
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.statistics-analysis {
  height: 100%;
  min-height: calc(100vh - 140px);
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
}

.top-charts-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  height: 450px;
}

.bottom-chart-container {
  flex: 1;
  min-height: 600px;
  margin-bottom: 40px;
}

.chart-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chart-header {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.chart {
  flex: 1;
  width: 100%;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .top-charts-container {
    grid-template-columns: 1fr;
    height: auto;
  }
  
  .top-charts-container .chart-card {
    height: 400px;
  }
}

@media (max-width: 768px) {
  .statistics-analysis {
    padding: 16px;
    gap: 16px;
  }
  
  .top-charts-container {
    gap: 16px;
  }
  
  .chart-card {
    height: 350px;
  }
  
  .bottom-chart-container .chart-card {
    height: 400px;
  }
}
</style>