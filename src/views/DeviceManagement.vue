<!-- 统一设备管理页面 -->
<script setup>
import { reactive, ref } from 'vue'
import { Search, Refresh, Plus, Upload } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 查询条件
const queryForm = reactive({
  deviceName: '',
  energyLevel: '',
  powerConsumption: '',
  deviceKind: ''
})

// 分页信息
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 表格加载状态
const loading = ref(false)

// 设备列表数据
const deviceList = ref([])

// 能耗等级选项
const energyLevelOptions = [
  { label: '一级能耗', value: '1' },
  { label: '二级能耗', value: '2' },
  { label: '三级能耗', value: '3' },
  { label: '四级能耗', value: '4' },
  { label: '五级能耗', value: '5' }
]

// 设备类型选项
const deviceKindOptions = [
  { label: '数码设备', value: 'digital' },
  { label: '家电设备', value: 'homeAppliance' }
]

// 设备状态选项
const statusOptions = [
  { label: '在线', value: '在线' },
  { label: '离线', value: '离线' }
]

// 新增设备对话框
const addDialogVisible = ref(false)
const addForm = reactive({
  deviceName: '',
  energyLevel: '',
  powerConsumption: '',
  location: '',
  deviceKind: '',
  status: '在线', // 默认状态为在线
  image: ''
})

// 修改设备对话框
const editDialogVisible = ref(false)
const editForm = reactive({
  id: '',
  deviceName: '',
  energyLevel: '',
  powerConsumption: '',
  location: '',
  deviceKind: '',
  status: '',
  image: ''
})

// 批量删除相关
const batchDeleteVisible = ref(false)
const selectedDevices = ref([])
const selectAll = ref(false)

// 图片上传相关
const uploadFile = ref(null)
const uploadLoading = ref(false)

// 查询设备
const handleSearch = () => {
  pagination.currentPage = 1
  loadDeviceData()
}

// 重置查询条件
const handleReset = () => {
  queryForm.deviceName = ''
  queryForm.energyLevel = ''
  queryForm.powerConsumption = ''
  queryForm.deviceKind = ''
  handleSearch()
}

// 加载设备数据
const loadDeviceData = async () => {
  loading.value = true
  try {
    // 构建查询参数
    const params = new URLSearchParams()
    
    // 添加查询条件
    if (queryForm.deviceName) params.append('deviceName', queryForm.deviceName)
    if (queryForm.energyLevel) params.append('energyLevel', queryForm.energyLevel)
    if (queryForm.powerConsumption) params.append('powerConsumption', queryForm.powerConsumption)
    if (queryForm.deviceKind) params.append('deviceKind', queryForm.deviceKind)
    
    // 添加分页参数
    params.append('page', pagination.currentPage.toString())
    params.append('pageSize', pagination.pageSize.toString())
    
    // 调用后端API获取设备数据
    const response = await fetch(`/api/devices?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const result = await response.json()
    
    if (result.code === 1) {
      // 后端返回的数据已经包含分页和查询结果
      deviceList.value = result.data.rows.map((item, index) => ({
        ...item,
        frontendIndex: (pagination.currentPage - 1) * pagination.pageSize + index + 1
      }))
      
      // 更新总数
      pagination.total = result.data.total
    } else {
      console.error('获取设备数据失败:', result.msg)
      ElMessage.error('获取设备数据失败')
    }
  } catch (error) {
    console.error('加载设备数据失败:', error)
    ElMessage.error('网络错误，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 处理分页变化
const handlePageChange = (page) => {
  pagination.currentPage = page
  loadDeviceData()
}

// 处理每页显示数量变化
const handleSizeChange = (size) => {
  pagination.pageSize = size
  pagination.currentPage = 1
  loadDeviceData()
}

// 打开新增设备对话框
const handleAddDevice = () => {
  addDialogVisible.value = true
}

// 处理文件选择
const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    uploadFile.value = file
    uploadImage()
  }
}

// 上传图片
const uploadImage = async () => {
  if (!uploadFile.value) return
  
  uploadLoading.value = true
  try {
    const formData = new FormData()
    formData.append('file', uploadFile.value)
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })
    
    const result = await response.json()
    
    if (result.code === 1) {
      // 处理后端返回的URL格式：从 "url:https://..." 中提取实际的URL
      let imageUrl = result.data
      if (typeof imageUrl === 'string' && imageUrl.startsWith('url:')) {
        imageUrl = imageUrl.substring(4) // 去掉 "url:" 前缀
      }
      addForm.image = imageUrl
      console.log('图片上传成功，URL:', addForm.image)
      // 清空文件输入
      const fileInput = document.querySelector('input[type="file"]')
      if (fileInput) fileInput.value = ''
    } else {
      console.error('图片上传失败:', result.msg)
    }
  } catch (error) {
    console.error('图片上传失败:', error)
  } finally {
    uploadLoading.value = false
    uploadFile.value = null
  }
}

// 提交新增设备
const submitAddForm = async () => {
  try {
    console.log('提交新增设备数据:', addForm)
    
    const response = await fetch('/api/devices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(addForm)
    })
    const result = await response.json()
    
    if (result.code === 1) {
      ElMessage.success('新增设备成功')
      addDialogVisible.value = false
      // 重置表单
      Object.keys(addForm).forEach(key => {
        addForm[key] = ''
      })
      // 重新加载数据
      loadDeviceData()
    } else {
      console.error('新增设备失败:', result.msg)
      ElMessage.error('新增设备失败：' + result.msg)
    }
  } catch (error) {
    console.error('新增设备失败:', error)
    ElMessage.error('新增设备失败：网络错误')
  }
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
  return status // 返回原始值，以防有其他状态值
}

// 获取设备类型显示文本
const getDeviceKindText = (kind) => {
  const option = deviceKindOptions.find(opt => opt.value === kind)
  return option ? option.label : kind
}

// 修改设备 - 查询回显
const handleEdit = async (device) => {
  try {
    // 通过设备ID查询设备详情
    const response = await fetch(`/api/devices/${device.id}`)
    const result = await response.json()
    
    if (result.code === 1) {
      console.log('后端返回的设备数据:', result.data)
      console.log('设备ID类型:', typeof result.data.id, '值:', result.data.id)
      
      // 直接填充表单数据
      Object.assign(editForm, result.data)
      
      // 手动设置设备ID，因为后端返回的数据中id字段可能为null
      editForm.id = device.id
      
      console.log('填充后editForm.id:', editForm.id, '类型:', typeof editForm.id)
      editDialogVisible.value = true
    } else {
      ElMessage.error('获取设备信息失败：' + result.msg)
    }
  } catch (error) {
    console.error('获取设备信息失败:', error)
    ElMessage.error('获取设备信息失败：网络错误')
  }
}

// 提交修改
const submitEditForm = async () => {
  try {
    console.log('提交修改时的editForm.id:', editForm.id, '类型:', typeof editForm.id)
    console.log('完整的editForm:', editForm)
    
    const response = await fetch('/api/devices', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(editForm)
    })
    const result = await response.json()
    
    if (result.code === 1) {
      ElMessage.success('修改设备成功')
      editDialogVisible.value = false
      // 完全重置表单，避免残留数据影响下次操作
      Object.keys(editForm).forEach(key => {
        editForm[key] = ''
      })
      // 重新加载数据
      loadDeviceData()
    } else {
      ElMessage.error('修改设备失败：' + result.msg)
    }
  } catch (error) {
    console.error('修改设备失败:', error)
    ElMessage.error('修改设备失败：网络错误')
  }
}

// 删除设备
const handleDelete = async (device) => {
  try {
    const confirm = await ElMessageBox.confirm(
      `确定要删除设备"${device.deviceName}"吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    if (confirm) {
      const response = await fetch(`/api/devices/${device.id}`, {
        method: 'DELETE'
      })
      const result = await response.json()
      
      if (result.code === 1) {
        ElMessage.success('删除成功')
        loadDeviceData()
      } else {
        ElMessage.error('删除失败：' + result.msg)
      }
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除设备失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 批量删除设备
const handleBatchDelete = async () => {
  if (selectedDevices.value.length === 0) {
    ElMessage.warning('请选择要删除的设备')
    return
  }
  
  try {
    const deviceNames = selectedDevices.value.map(device => device.deviceName).join('、')
    const confirm = await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedDevices.value.length} 台设备吗？\n设备列表：${deviceNames}`,
      '批量删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    if (confirm) {
      // 构建路径参数：多个ID用逗号分隔
      const deviceIds = selectedDevices.value.map(device => device.id).join(',')
      const response = await fetch(`/api/devices/${deviceIds}`, {
        method: 'DELETE'
      })
      const result = await response.json()
      
      if (result.code === 1) {
        ElMessage.success(`成功删除 ${selectedDevices.value.length} 台设备`)
        selectedDevices.value = []
        selectAll.value = false
        loadDeviceData()
      } else {
        ElMessage.error('批量删除失败：' + result.msg)
      }
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除设备失败:', error)
      ElMessage.error('批量删除失败')
    }
  }
}

// 处理选择变化
const handleSelectionChange = (selection) => {
  selectedDevices.value = selection
}

// 处理全选
const handleSelectAll = (selection) => {
  selectedDevices.value = selection
  selectAll.value = selection.length === deviceList.value.length
}

// 处理单个选择
const handleSelect = (selection, row) => {
  if (selection.includes(row)) {
    selectedDevices.value.push(row)
  } else {
    const index = selectedDevices.value.findIndex(device => device.id === row.id)
    if (index > -1) {
      selectedDevices.value.splice(index, 1)
    }
  }
}

// 处理比较分析
const handleComparativeAnalysis = async (device) => {
  try {
    // 获取当前已选择的比较设备列表
    let comparativeDevices = JSON.parse(localStorage.getItem('comparativeDevices') || '[]')
    
    // 检查设备是否已存在
    const existingDevice = comparativeDevices.find(d => d.id === device.id)
    if (existingDevice) {
      ElMessage.warning(`设备"${device.deviceName}"已在比较列表中`)
      return
    }
    
    // 检查是否超过最大限制
    if (comparativeDevices.length >= 2) {
      ElMessage.warning('最多只能选择2个设备进行比较分析')
      return
    }
    
    // 调用设备修改回显接口获取设备详情
    const response = await fetch(`/api/devices/${device.id}`)
    const result = await response.json()
    
    if (result.code === 1) {
      // 添加设备到比较列表
      comparativeDevices.push({
        ...result.data,
        selectedTime: new Date().toISOString()
      })
      
      // 存储到localStorage
      localStorage.setItem('comparativeDevices', JSON.stringify(comparativeDevices))
      
      ElMessage.success(`已选择设备"${device.deviceName}"进行对比分析 (${comparativeDevices.length}/2)`)
      
      console.log('当前比较设备列表:', comparativeDevices)
    } else {
      ElMessage.error('获取设备信息失败：' + result.msg)
    }
  } catch (error) {
    console.error('获取设备信息失败:', error)
    ElMessage.error('获取设备信息失败：网络错误')
  }
}

// 组件挂载时加载数据
loadDeviceData()
</script>

<template>
  <div class="device-management">
    <!-- 查询表单 -->
    <el-card class="search-card">
      <template #header>
        <div class="card-header">
          <span>设备查询</span>
          <el-button type="primary" @click="handleAddDevice">
            <el-icon><Plus /></el-icon>
            新增设备
          </el-button>
        </div>
      </template>
      <el-form :model="queryForm" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="设备名称">
              <el-input 
                v-model="queryForm.deviceName" 
                placeholder="请输入设备名称"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="能耗等级">
              <el-select 
                v-model="queryForm.energyLevel" 
                placeholder="请选择能耗等级"
                clearable
                style="width: 100%"
              >
                <el-option
                  v-for="item in energyLevelOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="耗电量(W)">
              <el-input 
                v-model="queryForm.powerConsumption" 
                placeholder="请输入最小耗电量"
                clearable
              >
                <template #append>W</template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="设备类型">
              <el-select 
                v-model="queryForm.deviceKind" 
                placeholder="请选择设备类型"
                clearable
                style="width: 100%"
              >
                <el-option
                  v-for="item in deviceKindOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24" style="text-align: right;">
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>
              查询
            </el-button>
            <el-button @click="handleReset">
              <el-icon><Refresh /></el-icon>
              重置
            </el-button>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 设备列表表格 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>设备列表</span>
          <div style="display: flex; align-items: center; gap: 16px;">
            <span class="total-count">共 {{ pagination.total }} 台设备</span>
            <el-button 
              v-if="selectedDevices.length > 0" 
              type="danger" 
              size="small" 
              @click="handleBatchDelete"
            >
              批量删除 ({{ selectedDevices.length }})
            </el-button>
          </div>
        </div>
      </template>
      <el-table 
        :data="deviceList"
        v-loading="loading"
        style="width: 100%"
        :header-cell-style="{ background: '#f5f7fa', color: '#606266', fontWeight: '600' }"
        :cell-style="{ color: '#303133', fontSize: '14px' }"
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="frontendIndex" label="序号" width="60" align="center" />
        <el-table-column prop="deviceName" label="设备名称" min-width="120" />
        <el-table-column label="比较分析" width="100" align="center">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleComparativeAnalysis(scope.row)">
              比较分析
            </el-button>
          </template>
        </el-table-column>
        <el-table-column prop="image" label="设备图片" width="180" align="center">
          <template #default="scope">
            <el-image 
              v-if="scope.row.image" 
              :src="scope.row.image" 
              style="width: 150px; height: 90px; border-radius: 8px"
              fit="cover"
            />
            <span v-else style="color: #909399; font-size: 12px;">无图片</span>
          </template>
        </el-table-column>
        <el-table-column prop="deviceKind" label="设备类型" width="90" align="center">
          <template #default="scope">
            <el-tag size="small">{{ getDeviceKindText(scope.row.deviceKind) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="energyLevel" label="能耗等级" width="90" align="center">
          <template #default="scope">
            <el-tag 
              :type="scope.row.energyLevel <= '2' ? 'success' : scope.row.energyLevel === '3' ? 'warning' : 'danger'"
              size="small"
            >
              {{ scope.row.energyLevel }}级能耗
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="powerConsumption" label="耗电量(W)" width="100" align="center">
          <template #default="scope">
            {{ scope.row.powerConsumption }} W
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)" size="small">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="location" label="安装位置" width="100" />
        <el-table-column prop="installDate" label="安装日期" width="100" align="center" />
        <el-table-column label="操作" width="150" fixed="right" align="center">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleEdit(scope.row)">
              修改
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[5, 10, 20, 50]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 新增设备对话框 -->
    <el-dialog v-model="addDialogVisible" title="新增设备" width="500px">
      <el-form :model="addForm" label-width="100px">
        <el-form-item label="设备名称">
          <el-input v-model="addForm.deviceName" placeholder="请输入设备名称" />
        </el-form-item>
        <el-form-item label="设备类型">
          <el-select v-model="addForm.deviceKind" placeholder="请选择设备类型" style="width: 100%">
            <el-option
              v-for="item in deviceKindOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="能耗等级">
          <el-select v-model="addForm.energyLevel" placeholder="请选择能耗等级" style="width: 100%">
            <el-option
              v-for="item in energyLevelOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="耗电量(W)">
          <el-input v-model="addForm.powerConsumption" placeholder="请输入耗电量">
            <template #append>W</template>
          </el-input>
        </el-form-item>
        <el-form-item label="安装位置">
          <el-input v-model="addForm.location" placeholder="请输入安装位置" />
        </el-form-item>
        <el-form-item label="设备状态">
          <el-select v-model="addForm.status" placeholder="请选择设备状态" style="width: 100%">
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="设备图片">
          <div class="upload-container">
            <input 
              type="file" 
              accept="image/*" 
              @change="handleFileSelect" 
              style="display: none"
              ref="fileInput"
            />
            <el-button 
              type="primary" 
              @click="$refs.fileInput.click()"
              :loading="uploadLoading"
            >
              <el-icon><Upload /></el-icon>
              选择图片
            </el-button>
            <div v-if="addForm.image" class="image-preview">
              <el-image 
                :src="addForm.image" 
                style="width: 80px; height: 80px; margin-left: 10px"
                fit="cover"
              />
            </div>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAddForm">确认</el-button>
      </template>
    </el-dialog>

    <!-- 修改设备对话框 -->
    <el-dialog v-model="editDialogVisible" title="修改设备" width="600px">
      <el-form :model="editForm" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="设备名称">
              <el-input v-model="editForm.deviceName" placeholder="请输入设备名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设备类型">
              <el-select v-model="editForm.deviceKind" placeholder="请选择设备类型" style="width: 100%">
                <el-option
                  v-for="item in deviceKindOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="能耗等级">
              <el-select v-model="editForm.energyLevel" placeholder="请选择能耗等级" style="width: 100%">
                <el-option
                  v-for="item in energyLevelOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="耗电量(W)">
              <el-input v-model="editForm.powerConsumption" placeholder="请输入耗电量">
                <template #append>W</template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="安装位置">
              <el-input v-model="editForm.location" placeholder="请输入安装位置" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设备状态">
              <el-select v-model="editForm.status" placeholder="请选择设备状态" style="width: 100%">
                <el-option
                  v-for="item in statusOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="安装日期">
              <el-date-picker
                v-model="editForm.installDate"
                type="date"
                placeholder="请选择安装日期"
                style="width: 100%"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="设备图片">
          <div class="upload-container">
            <input 
              type="file" 
              accept="image/*" 
              @change="handleFileSelect" 
              style="display: none"
              ref="editFileInput"
            />
            <el-button 
              type="primary" 
              @click="$refs.editFileInput.click()"
              :loading="uploadLoading"
            >
              <el-icon><Upload /></el-icon>
              选择图片
            </el-button>
            <div v-if="editForm.image" class="image-preview">
              <el-image 
                :src="editForm.image" 
                style="width: 80px; height: 80px; margin-left: 10px"
                fit="cover"
              />
            </div>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitEditForm">确认修改</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.device-management {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.search-card {
  margin-bottom: 0;
}

.card-header {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-card {
  flex: 1;
}

.total-count {
  font-size: 14px;
  color: #909399;
  margin-left: 16px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.upload-container {
  display: flex;
  align-items: center;
}

.image-preview {
  display: flex;
  align-items: center;
}
</style>