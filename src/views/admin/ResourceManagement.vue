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

    <!-- 搜索和筛选区域 -->
    <el-card class="search-card">
      <div class="search-form">
        <el-form :model="searchForm" :inline="true">
          <el-form-item label="资源标题">
            <el-input 
              v-model="searchForm.title" 
              placeholder="请输入资源标题"
              clearable
            />
          </el-form-item>
          
          <el-form-item label="上传者">
            <el-input 
              v-model="searchForm.uploader" 
              placeholder="请输入上传者用户名"
              clearable
            />
          </el-form-item>
          
          <el-form-item label="资源分类">
            <el-select v-model="searchForm.category" placeholder="请选择分类" clearable>
              <el-option 
                v-for="category in categories" 
                :key="category.id"
                :label="category.name" 
                :value="category.id"
              />
            </el-select>
          </el-form-item>
          
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
              <el-option label="已发布" value="published" />
              <el-option label="待审核" value="pending" />
              <el-option label="已拒绝" value="rejected" />
              <el-option label="已下架" value="offline" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="文件类型">
            <el-select v-model="searchForm.fileType" placeholder="请选择文件类型" clearable>
              <el-option label="PDF文档" value="pdf" />
              <el-option label="Word文档" value="doc" />
              <el-option label="PPT演示" value="ppt" />
              <el-option label="图片" value="image" />
              <el-option label="视频" value="video" />
              <el-option label="音频" value="audio" />
              <el-option label="其他" value="other" />
            </el-select>
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <!-- 统计信息 -->
    <div class="stats-row">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon total-icon">
                <el-icon><Document /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ stats.totalResources }}</div>
                <div class="stat-label">总资源数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon pending-icon">
                <el-icon><Clock /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ stats.pendingResources }}</div>
                <div class="stat-label">待审核</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon published-icon">
                <el-icon><Check /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ stats.publishedResources }}</div>
                <div class="stat-label">已发布</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon download-icon">
                <el-icon><Download /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ stats.totalDownloads }}</div>
                <div class="stat-label">总下载量</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 操作按钮区域 -->
    <div class="action-bar">
      <el-button type="primary" @click="handleBatchApprove" :disabled="selectedResources.length === 0">
        <el-icon><Check /></el-icon>
        批量审核通过
      </el-button>
      
      <el-button type="warning" @click="handleBatchReject" :disabled="selectedResources.length === 0">
        <el-icon><Close /></el-icon>
        批量拒绝
      </el-button>
      
      <el-button @click="handleExport">
        <el-icon><Download /></el-icon>
        导出数据
      </el-button>
      
      <el-button type="danger" @click="handleBatchDelete" :disabled="selectedResources.length === 0">
        <el-icon><Delete /></el-icon>
        批量删除
      </el-button>
    </div>

    <!-- 资源列表 -->
    <el-card>
      <template #header>
        <div class="table-header">
          <span>资源列表</span>
          <div class="header-actions">
            <el-button text @click="refreshTable">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
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
              <div class="resource-cover">
                <el-image 
                  v-if="row.cover" 
                  :src="row.cover" 
                  :preview-src-list="[row.cover]"
                  fit="cover"
                >
                  <template #error>
                    <div class="cover-placeholder">
                      <el-icon><Document /></el-icon>
                    </div>
                  </template>
                </el-image>
                <div v-else class="cover-placeholder">
                  <el-icon><Document /></el-icon>
                </div>
              </div>
              <div class="resource-details">
                <div class="resource-title">{{ row.title }}</div>
                <div class="resource-description">{{ row.description }}</div>
                <div class="resource-meta">
                  <span class="file-type">{{ getFileTypeLabel(row.fileType) }}</span>
                  <span class="file-size">{{ formatFileSize(row.fileSize) }}</span>
                  <span class="uploader">上传者: {{ row.uploader }}</span>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="分类" width="120">
          <template #default="{ row }">
            <el-tag>{{ getCategoryName(row.category) }}</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag 
              :type="getStatusType(row.status)"
              effect="light"
            >
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="下载量" width="100" prop="downloadCount" sortable />
        
        <el-table-column label="评分" width="100">
          <template #default="{ row }">
            <div class="rating">
              <el-rate
                v-model="row.rating"
                disabled
                show-score
                text-color="#ff9900"
                score-template="{value}"
              />
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="上传时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button 
              size="small" 
              @click="handlePreview(row)"
            >
              预览
            </el-button>
            
            <el-button 
              size="small" 
              type="primary" 
              @click="handleEdit(row)"
              :disabled="row.status === 'rejected'"
            >
              编辑
            </el-button>
            
            <el-dropdown @command="(command) => handleCommand(command, row)">
              <el-button size="small">
                更多<el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item 
                    v-if="row.status === 'pending'" 
                    command="approve"
                  >
                    审核通过
                  </el-dropdown-item>
                  <el-dropdown-item 
                    v-if="row.status === 'pending'" 
                    command="reject"
                  >
                    拒绝
                  </el-dropdown-item>
                  <el-dropdown-item 
                    v-if="row.status === 'published'" 
                    command="offline"
                  >
                    下架
                  </el-dropdown-item>
                  <el-dropdown-item 
                    v-if="row.status === 'offline'" 
                    command="publish"
                  >
                    重新上架
                  </el-dropdown-item>
                  <el-dropdown-item command="download">下载</el-dropdown-item>
                  <el-dropdown-item command="statistics">统计</el-dropdown-item>
                  <el-dropdown-item command="delete" divided>
                    删除
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
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

    <!-- 审核对话框 -->
    <el-dialog
      v-model="reviewDialogVisible"
      :title="reviewDialogTitle"
      width="500px"
    >
      <el-form :model="reviewForm" label-width="80px">
        <el-form-item label="审核意见">
          <el-input
            v-model="reviewForm.comment"
            type="textarea"
            :rows="4"
            placeholder="请输入审核意见（可选）"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="reviewDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleReviewSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { 
  Search, Document, Clock, Check, Download, Delete, 
  Refresh, ArrowDown, Close
} from '@element-plus/icons-vue'

// 搜索表单
const searchForm = reactive({
  title: '',
  uploader: '',
  category: '',
  status: '',
  fileType: ''
})

// 资源分类
const categories = ref([
  { id: 1, name: '语文' },
  { id: 2, name: '数学' },
  { id: 3, name: '英语' },
  { id: 4, name: '物理' },
  { id: 5, name: '化学' },
  { id: 6, name: '生物' },
  { id: 7, name: '历史' },
  { id: 8, name: '地理' },
  { id: 9, name: '政治' },
  { id: 10, name: '信息技术' }
])

// 统计数据
const stats = reactive({
  totalResources: 1256,
  pendingResources: 23,
  publishedResources: 980,
  totalDownloads: 45678
})

// 资源列表数据
const resourceList = ref([
  {
    id: 1,
    title: '高中数学必修一知识点总结',
    description: '包含所有重要知识点和例题解析',
    cover: '',
    category: 2,
    fileType: 'pdf',
    fileSize: 2048576,
    uploader: '张老师',
    status: 'published',
    downloadCount: 256,
    rating: 4.5,
    createdAt: '2024-01-10T14:30:00Z'
  },
  {
    id: 2,
    title: '英语四级词汇表',
    description: '最新版四级考试必备词汇',
    cover: '',
    category: 3,
    fileType: 'doc',
    fileSize: 1048576,
    uploader: '李同学',
    status: 'pending',
    downloadCount: 0,
    rating: 0,
    createdAt: '2024-01-15T09:15:00Z'
  },
  {
    id: 3,
    title: '物理实验视频教程',
    description: '高中物理重要实验操作演示',
    cover: '',
    category: 5,
    fileType: 'video',
    fileSize: 52428800,
    uploader: '王老师',
    status: 'published',
    downloadCount: 89,
    rating: 4.2,
    createdAt: '2024-01-12T16:45:00Z'
  },
  {
    id: 4,
    title: '化学元素周期表',
    description: '高清彩色元素周期表图片',
    cover: '',
    category: 6,
    fileType: 'image',
    fileSize: 512000,
    uploader: '赵同学',
    status: 'rejected',
    downloadCount: 0,
    rating: 0,
    createdAt: '2024-01-14T11:20:00Z'
  },
  {
    id: 5,
    title: '历史大事年表',
    description: '从古代到现代的重要历史事件',
    cover: '',
    category: 7,
    fileType: 'ppt',
    fileSize: 3145728,
    uploader: '刘老师',
    status: 'offline',
    downloadCount: 45,
    rating: 4.0,
    createdAt: '2024-01-08T10:00:00Z'
  }
])

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

// 审核对话框相关
const reviewDialogVisible = ref(false)
const reviewAction = ref('') // 'approve' 或 'reject'
const currentResource = ref(null)
const reviewForm = reactive({
  comment: ''
})

// 计算属性
const reviewDialogTitle = computed(() => {
  return reviewAction.value === 'approve' ? '审核通过' : '拒绝资源'
})

// 方法定义
const handleSearch = () => {
  pagination.currentPage = 1
  loadResourceList()
}

const handleReset = () => {
  Object.assign(searchForm, {
    title: '',
    uploader: '',
    category: '',
    status: '',
    fileType: ''
  })
  pagination.currentPage = 1
  loadResourceList()
}

const handleBatchApprove = () => {
  if (selectedResources.value.length === 0) {
    ElMessage.warning('请选择要审核的资源')
    return
  }
  
  ElMessageBox.confirm(
    `确定要通过选中的 ${selectedResources.value.length} 个资源吗？`,
    '确认审核',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success('批量审核通过成功')
    loadResourceList()
  }).catch(() => {
    ElMessage.info('已取消审核')
  })
}

const handleBatchReject = () => {
  if (selectedResources.value.length === 0) {
    ElMessage.warning('请选择要拒绝的资源')
    return
  }
  
  reviewAction.value = 'reject'
  reviewDialogVisible.value = true
}

const handleExport = () => {
  ElMessage.success('导出功能开发中...')
}

const handleBatchDelete = () => {
  if (selectedResources.value.length === 0) {
    ElMessage.warning('请选择要删除的资源')
    return
  }
  
  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedResources.value.length} 个资源吗？`,
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success('批量删除成功')
    loadResourceList()
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

const handlePreview = (row) => {
  ElMessage.info(`预览资源: ${row.title}`)
}

const handleEdit = (row) => {
  ElMessage.info(`编辑资源: ${row.title}`)
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

const handleCommand = (command, row) => {
  currentResource.value = row
  
  switch (command) {
    case 'approve':
      reviewAction.value = 'approve'
      reviewDialogVisible.value = true
      break
    case 'reject':
      reviewAction.value = 'reject'
      reviewDialogVisible.value = true
      break
    case 'offline':
      handleOfflineResource(row)
      break
    case 'publish':
      handlePublishResource(row)
      break
    case 'download':
      handleDownloadResource(row)
      break
    case 'statistics':
      handleShowStatistics(row)
      break
    case 'delete':
      handleDeleteResource(row)
      break
  }
}

const handleReviewSubmit = () => {
  if (reviewAction.value === 'approve') {
    ElMessage.success('资源审核通过')
  } else {
    ElMessage.success('资源已拒绝')
  }
  
  reviewDialogVisible.value = false
  reviewForm.comment = ''
  loadResourceList()
}

const handleOfflineResource = (row) => {
  ElMessageBox.confirm(`确定要下架资源 "${row.title}" 吗？`, '确认操作', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('资源已下架')
    loadResourceList()
  }).catch(() => {
    ElMessage.info('已取消操作')
  })
}

const handlePublishResource = (row) => {
  ElMessageBox.confirm(`确定要重新上架资源 "${row.title}" 吗？`, '确认操作', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('资源已重新上架')
    loadResourceList()
  }).catch(() => {
    ElMessage.info('已取消操作')
  })
}

const handleDownloadResource = (row) => {
  ElMessage.info(`开始下载: ${row.title}`)
}

const handleShowStatistics = (row) => {
  ElMessage.info(`查看统计: ${row.title}`)
}

const handleDeleteResource = (row) => {
  ElMessageBox.confirm(`确定要删除资源 "${row.title}" 吗？`, '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('资源删除成功')
    loadResourceList()
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

const refreshTable = () => {
  loadResourceList()
}

const loadResourceList = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    pagination.total = resourceList.value.length
    ElMessage.success('数据加载完成')
  } catch (error) {
    console.error('加载资源列表失败:', error)
    ElMessage.error('数据加载失败')
  } finally {
    loading.value = false
  }
}

const getCategoryName = (categoryId) => {
  const category = categories.value.find(cat => cat.id === categoryId)
  return category ? category.name : '未知分类'
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

.search-card {
  margin-bottom: 20px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.stats-row {
  margin-bottom: 20px;
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

.total-icon {
  background-color: #e6f7ff;
  color: #1890ff;
}

.pending-icon {
  background-color: #fff7e6;
  color: #fa8c16;
}

.published-icon {
  background-color: #f6ffed;
  color: #52c41a;
}

.download-icon {
  background-color: #f9f0ff;
  color: #722ed1;
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.action-bar {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
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
  width: 60px;
  height: 60px;
  border-radius: 6px;
  overflow: hidden;
  background-color: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cover-placeholder {
  color: #c0c4cc;
  font-size: 24px;
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