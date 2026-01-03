<template>
  <div class="resource-management">
    <div class="breadcrumb">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/admin' }">管理员后台</el-breadcrumb-item>
        <el-breadcrumb-item>资源管理</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div class="page-header">
      <h1>资源管理</h1>
      <p>管理系统所有教育资源，包括审核、分类、统计等功能</p>
    </div>



    <!-- 操作按钮区域 -->
    <div class="action-bar">
      
    </div>

    <!-- 资源列表 -->
    <el-card>
      <template #header>
        <div class="table-header">
          <span>资源列表</span>
          <div class="header-actions">
            <!-- 刷新按钮已删除 -->
          </div>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="resourceList"
        @selection-change="handleSelectionChange"
        stripe
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" />
        
        <el-table-column label="资源ID" prop="id" width="80" />
        
        <el-table-column label="资源信息" min-width="300">
          <template #default="{ row }">
            <div class="resource-info">
              <div class="resource-icon">
                <el-icon><Document /></el-icon>
              </div>
              <div class="resource-details">
                <div class="resource-title">{{ row.title }}</div>
                <div class="resource-description">{{ row.description }}</div>
                <div class="resource-meta">
                  <span class="resource-time">
                    <el-icon><Clock /></el-icon>
                    {{ formatTime(row.createTime || row.createdAt) }}
                  </span>
                  <span class="resource-downloads">
                    <el-icon><Download /></el-icon>
                    {{ row.downloadCount || 0 }} 下载
                  </span>
                  <el-tag size="small">{{ row.classBelong || row.category || '未分类' }}</el-tag>
                  <el-tag v-if="row.fileType" size="small" type="info">{{ getFileTypeLabel(row.fileType) }}</el-tag>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="上传者" width="120">
          <template #default="{ row }">
            {{ row.uploaderName || row.uploader || '未知' }}
          </template>
        </el-table-column>
        
        <el-table-column label="下载量" width="100" prop="downloadCount" sortable />
        
        <el-table-column label="上传时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createTime || row.createdAt) }}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button 
              size="small" 
              type="primary" 
              @click="handleEdit(row)"
            >
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            
            <el-button 
              size="small" 
              type="danger" 
              @click="handleDeleteResource(row)"
            >
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 编辑资源对话框 -->
    <el-dialog
      v-model="editResourceDialogVisible"
      :title="editResourceForm.title ? '编辑资源：' + editResourceForm.title : '编辑资源'"
      width="700px"
      center
      :before-close="handleCloseEditDialog"
    >
      <div class="resource-edit-detail">
        <!-- 资源预览 -->
        <div v-if="(editResourceForm.fileType === 'image' || editResourceForm.fileType === 'IMAGE') && editResourceForm.fileUrl" class="preview-section">
          <h4>资源预览</h4>
          <div class="image-preview">
            <img :src="editResourceForm.fileUrl" :alt="editResourceForm.title" class="preview-image" />
            <div class="preview-info">
              <p><strong>文件地址:</strong> {{ editResourceForm.fileUrl }}</p>
              <el-button type="primary" @click="openImageInNewTab(editResourceForm.fileUrl)">
                在新标签页打开
              </el-button>
            </div>
          </div>
        </div>
        
        <!-- 资源基本信息 -->
        <div class="detail-section">
          <h4>资源基本信息</h4>
          <el-form
            ref="editResourceFormRef"
            :model="editResourceForm"
            :rules="editResourceRules"
            label-width="100px"
            label-position="left"
          >
            <el-form-item label="资源标题" prop="title">
              <el-input v-model="editResourceForm.title" placeholder="请输入资源标题" />
            </el-form-item>

            <el-form-item label="资源描述" prop="description">
              <el-input 
                v-model="editResourceForm.description" 
                type="textarea" 
                :rows="3"
                placeholder="请输入资源描述" 
              />
            </el-form-item>

            <el-form-item label="所属课程" prop="classBelong">
              <el-input v-model="editResourceForm.classBelong" placeholder="请输入所属课程" />
            </el-form-item>

            <el-form-item label="文件类型" prop="fileType">
              <el-select v-model="editResourceForm.fileType" placeholder="请选择文件类型" clearable>
                <el-option label="PDF文档" value="pdf" />
                <el-option label="Word文档" value="doc" />
                <el-option label="PPT演示" value="ppt" />
                <el-option label="图片" value="image" />
                <el-option label="视频" value="video" />
                <el-option label="音频" value="audio" />
                <el-option label="其他" value="other" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="标签" prop="tags">
              <el-input v-model="editResourceForm.tags" placeholder="请输入标签，多个标签用逗号分隔" />
            </el-form-item>
          </el-form>
        </div>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleCloseEditDialog">取消</el-button>
          <el-button type="primary" @click="saveResourceEdit" :loading="savingResource">
            保存修改
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { 
  Search, Document, Clock, Check, Download, Delete, 
  Refresh, Edit
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { apiService } from '@/services/api'
import { useAuthStore } from '@/stores/auth'

// 资源列表数据
const resourceList = ref([])

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 加载状态
const loading = ref(false)

// 选中的资源
const selectedResources = ref([])

// 资源编辑相关变量
const editResourceDialogVisible = ref(false)
const savingResource = ref(false)
const editResourceFormRef = ref()
const editResourceForm = ref({
  id: '',
  title: '',
  description: '',
  classBelong: '',
  fileType: '',
  tags: '',
  fileUrl: ''
})
const editResourceRules = ref({
  title: [
    { required: true, message: '请输入资源标题', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入资源描述', trigger: 'blur' }
  ],
  fileType: [
    { required: true, message: '请选择文件类型', trigger: 'change' }
  ]
})



const handlePreview = (row) => {
  ElMessage.info(`预览资源: ${row.title}`)
}

// 在新标签页打开图片
const openImageInNewTab = (url) => {
  window.open(url, '_blank')
}

const handleEdit = (row) => {
  // 打开编辑对话框并填充数据
  editResourceForm.value = {
    id: row.id,
    title: row.title || '',
    description: row.description || '',
    classBelong: row.classBelong || row.category || '',
    fileType: row.fileType || '',
    tags: row.tags || '',
    fileUrl: row.fileUrl || row.url || ''
  }
  editResourceDialogVisible.value = true
}

// 关闭编辑对话框
const handleCloseEditDialog = () => {
  editResourceDialogVisible.value = false
  editResourceFormRef.value?.resetFields()
  editResourceForm.value = {
    id: '',
    title: '',
    description: '',
    classBelong: '',
    fileType: '',
    tags: '',
    fileUrl: ''
  }
}

// 保存资源编辑
const saveResourceEdit = async () => {
  try {
    savingResource.value = true
    
    // 表单验证
    await editResourceFormRef.value.validate()
    
    // 调用API更新资源信息 - 正确的调用方式：传递包含ID的完整数据对象
    const updateData = {
      id: editResourceForm.value.id,
      title: editResourceForm.value.title,
      description: editResourceForm.value.description,
      classBelong: editResourceForm.value.classBelong,
      fileType: editResourceForm.value.fileType,
      tags: editResourceForm.value.tags
    }
    
    console.log('发送的更新数据:', updateData) // 调试日志
    
    const response = await apiService.resources.update(updateData)
    
    console.log('更新响应:', response) // 调试日志
    
    if (response.success) {
      ElMessage.success('资源信息更新成功')
      handleCloseEditDialog()
      loadResourceList()
    } else {
      ElMessage.error('资源更新失败: ' + (response.error || '未知错误'))
    }
  } catch (error) {
    if (error && error.errors) {
      // 表单验证错误，不显示错误消息
      return
    }
    console.error('更新资源失败:', error)
    ElMessage.error('更新资源失败，请稍后重试')
  } finally {
    savingResource.value = false
  }
}

// 删除单个资源
const handleDeleteResource = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除资源 "${row.title}" 吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 调用API删除资源
    await apiService.resources.delete(row.id)
    
    ElMessage.success('资源删除成功')
    loadResourceList()
  } catch (error) {
    if (error === 'cancel') {
      ElMessage.info('已取消删除')
    } else {
      console.error('删除资源失败:', error)
      ElMessage.error('删除资源失败，请稍后重试')
    }
  }
}

const handleSelectionChange = (selection) => {
  selectedResources.value = selection
}

const handleSizeChange = (size) => {
  pagination.pageSize = size
  loadResourceList()
}

const handleCurrentChange = (page) => {
  pagination.currentPage = page
  loadResourceList()
}



const loadResourceList = async () => {
  loading.value = true
  try {
    // 构建搜索参数
    const searchParams = {}
    
    // 添加当前用户ID到请求体（管理员后台可能不需要，但为了保持一致性添加）
    const authStore = useAuthStore()
    if (authStore.userInfo?.id) {
      searchParams.userId = authStore.userInfo.id
    }
    
    // 调用API查询所有资源
    const response = await apiService.resources.findByItem(searchParams)
    
    console.log('API响应数据:', response) // 调试日志
    
    if (response && response.success && response.data) {
      // 根据控制台日志，数据在response.data中，可能是response.data.data或response.data
      const data = response.data.data || response.data
      if (Array.isArray(data)) {
        resourceList.value = data
        pagination.total = data.length
        console.log('成功加载资源列表，数量:', data.length)
      } else {
        console.log('API返回的数据不是数组:', data)
        resourceList.value = []
        pagination.total = 0
      }
    } else {
      ElMessage.error('获取资源列表失败')
      resourceList.value = []
      pagination.total = 0
    }
  } catch (error) {
    console.error('加载资源列表失败:', error)
    ElMessage.error('加载资源列表失败')
    resourceList.value = []
    pagination.total = 0
  } finally {
    loading.value = false
  }
}



const getFileTypeLabel = (fileType) => {
  const labels = {
    pdf: 'PDF',
    doc: 'Word',
    ppt: 'PPT',
    image: '图片',
    video: '视频',
    audio: '音频',
    other: '其他'
  }
  return labels[fileType] || fileType
}

const getStatusType = (status) => {
  const types = {
    published: 'success',
    pending: 'warning',
    rejected: 'danger',
    offline: 'info'
  }
  return types[status] || ''
}

const getStatusLabel = (status) => {
  const labels = {
    published: '已发布',
    pending: '待审核',
    rejected: '已拒绝',
    offline: '已下架'
  }
  return labels[status] || status
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

const formatTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

onMounted(() => {
  loadResourceList()
})
</script>

<style scoped>
.resource-management {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.breadcrumb {
  margin-bottom: 20px;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h1 {
  font-size: 28px;
  color: #303133;
  margin-bottom: 8px;
}

.page-header p {
  color: #606266;
  font-size: 14px;
}



.action-bar {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

/* 编辑对话框样式 */
.preview-section {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.preview-section h4 {
  margin: 0 0 10px 0;
  color: #303133;
  font-size: 16px;
}

.image-preview {
  display: flex;
  gap: 15px;
  align-items: flex-start;
}

.preview-image {
  max-width: 200px;
  max-height: 150px;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
}

.preview-info {
  flex: 1;
}

.preview-info p {
  margin: 0 0 10px 0;
  color: #606266;
  font-size: 14px;
}

.detail-section {
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.detail-section h4 {
  margin: 0 0 15px 0;
  color: #303133;
  font-size: 16px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.resource-info {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.resource-cover {
  width: 50px;
  height: 50px;
  border-radius: 4px;
  overflow: hidden;
  background-color: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cover-placeholder {
  color: #c0c4cc;
  font-size: 20px;
}

.resource-details {
  flex: 1;
  min-width: 0;
}

.resource-title {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
  line-height: 1.4;
}

.resource-description {
  font-size: 12px;
  color: #909399;
  margin-bottom: 6px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.resource-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #606266;
}

.file-type, .file-size, .uploader {
  background-color: #f5f7fa;
  padding: 2px 6px;
  border-radius: 3px;
}

.rating {
  display: flex;
  align-items: center;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .resource-management {
    padding: 15px;
  }
  
  .search-form {
    flex-direction: column;
  }
  
  .stats-row .el-col {
    margin-bottom: 15px;
  }
  
  .action-bar {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .table-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .resource-info {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .resource-meta {
    flex-direction: column;
    gap: 4px;
  }
  
  .pagination {
    justify-content: center;
  }
}
</style>