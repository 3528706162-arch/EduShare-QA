<template>
  <div class="resource-list">
    <div class="page-header">
      <h1>学习资源库</h1>
      <p>发现和分享优质学习资源</p>
    </div>
    
    <div class="search-filter">
      <el-row :gutter="20">
        <el-col :span="5">
          <el-input
            v-model="searchTitle"
            placeholder="搜索标题..."
            prefix-icon="Search"
            clearable
          />
        </el-col>
        <el-col :span="5">
          <el-input
            v-model="searchDescription"
            placeholder="搜索描述..."
            prefix-icon="Document"
            clearable
          />
        </el-col>
        <el-col :span="5">
          <el-select v-model="selectedCategory" placeholder="选择分类" clearable>
            <el-option
              v-for="category in categories"
              :key="category.id"
              :label="category.name"
              :value="category.name"
            />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="handleQuery" class="query-btn">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
        </el-col>
        <el-col :span="5">
          <el-button type="primary" @click="goToUpload" v-if="canUpload">
            <el-icon><Upload /></el-icon>
            上传资源
          </el-button>
        </el-col>
      </el-row>
    </div>

    <div class="resource-grid">
      <el-row :gutter="20">
        <el-col 
          v-for="resource in resources" 
          :key="resource.id" 
          :xs="24" :sm="12" :md="8" :lg="6" :xl="4"
        >
          <el-card class="resource-card" shadow="hover">
            <div class="resource-thumbnail">
              <div v-if="isImageResource(resource)" class="image-preview">
                <el-image 
                  :src="resource.fileUrl" 
                  fit="cover"
                  class="preview-image"
                  :preview-src-list="[resource.fileUrl]"
                  :preview-teleported="true"
                >
                  <template #error>
                    <div class="image-error">
                      <el-icon><Picture /></el-icon>
                      <span>图片加载失败</span>
                    </div>
                  </template>
                </el-image>
              </div>
              <div v-else class="file-icon-container">
                <el-icon class="file-icon" :style="{ color: getFileTypeColor(resource.fileType) }">
                  <Document />
                </el-icon>
              </div>
              <div class="file-type-badge">{{ resource.fileType }}</div>
            </div>
            <div class="resource-content">
              <h3 class="resource-title">{{ resource.title }}</h3>
              <div class="resource-meta">
                <span class="category">{{ resource.classBelong }}</span>
                <div class="tags-container" v-if="resource.tags">
                  <el-tag
                    v-for="tag in parseTags(resource.tags)"
                    :key="tag"
                    size="small"
                    type="primary"
                    class="tag-item"
                  >
                    {{ tag }}
                  </el-tag>
                </div>
              </div>
              <div class="resource-footer">
                <div class="resource-info">
                  <span class="uploader">上传者: {{ resource.uploaderName }}</span>
                  <span class="download-count">下载: {{ resource.downloadCount }}</span>
                </div>
                <div class="resource-actions">
                  <el-button 
                    type="primary" 
                    size="small" 
                    link 
                    @click="downloadResource(resource.fileUrl, resource.id)"
                    class="download-btn"
                  >
                    下载
                  </el-button>
                  <el-button 
                    type="success" 
                    size="small" 
                    @click="viewResourceDetail(resource)"
                    class="detail-btn"
                  >
                    查看详情
                  </el-button>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[12, 24, 36, 48]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="6" animated />
    </div>

    <!-- 资源详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      :title="currentResource ? currentResource.title : '资源详情'"
      width="600px"
      center
    >
      <div v-if="currentResource" class="resource-detail">
        <div class="detail-section">
          <h4>资源描述</h4>
          <p class="detail-description">{{ currentResource.description }}</p>
        </div>
        
        <div class="detail-section">
          <h4>资源信息</h4>
          <div class="detail-info">
            <div class="info-item">
              <span class="info-label">上传者：</span>
              <span class="info-value">{{ currentResource.uploaderName }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">所属课程：</span>
              <span class="info-value">{{ currentResource.classBelong }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">文件类型：</span>
              <span class="info-value">{{ currentResource.fileType }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">下载次数：</span>
              <span class="info-value">{{ currentResource.downloadCount }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">上传时间：</span>
              <span class="info-value">{{ formatDate(currentResource.createdAt) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">标签：</span>
              <div class="tags-container" v-if="currentResource.tags">
                <el-tag
                  v-for="tag in parseTags(currentResource.tags)"
                  :key="tag"
                  size="small"
                  type="primary"
                  class="tag-item"
                >
                  {{ tag }}
                </el-tag>
              </div>
              <span v-else class="info-value">无标签</span>
            </div>
          </div>
        </div>
        
        <div class="detail-section">
          <h4>下载链接</h4>
          <div class="download-link">
            <el-button 
              type="primary" 
              @click="downloadResource(currentResource.fileUrl, currentResource.id)"
              class="download-btn-large"
            >
              <el-icon><Download /></el-icon>
              下载资源
            </el-button>
            <p class="link-tip">点击按钮直接下载资源文件</p>
          </div>
        </div>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useResourcesStore } from '@/stores/resources'
import { Search, Upload, Document, Download, Picture } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import apiService from '@/services/api'

const router = useRouter()
const authStore = useAuthStore()
const resourcesStore = useResourcesStore()

const searchKeyword = ref('')
const searchTitle = ref('')
const searchDescription = ref('')
const selectedCategory = ref('')
const currentPage = ref(1)
const pageSize = ref(12)
const loading = ref(false)
const detailDialogVisible = ref(false)
const currentResource = ref(null)
const courseCategories = ref([
  { id: 1, name: '数学' },
  { id: 2, name: '英语' },
  { id: 3, name: '物理' },
  { id: 4, name: '化学' },
  { id: 5, name: '计算机科学' }
])

const resources = computed(() => resourcesStore.resources)
const categories = computed(() => {
  console.log('当前分类数据:', courseCategories.value)
  return courseCategories.value
})
const total = computed(() => resourcesStore.total)

const canUpload = computed(() => {
  return authStore.userRole === 'teacher' || authStore.userRole === 'admin' || authStore.userRole === 'student'
})

const handleSearch = () => {
  currentPage.value = 1
  loadResources()
}

const handleTitleSearch = () => {
  // 移除自动搜索逻辑，只在点击查询按钮时搜索
}

const handleDescriptionSearch = () => {
  // 移除自动搜索逻辑，只在点击查询按钮时搜索
}

const handleFilter = () => {
  // 移除自动搜索逻辑，只在点击查询按钮时搜索
}

const handleQuery = () => {
  currentPage.value = 1
  loadResources()
}

const handleSizeChange = (size) => {
  pageSize.value = size
  loadResources()
}

const handleCurrentChange = (page) => {
  currentPage.value = page
  loadResources()
}

const goToUpload = () => {
  router.push('/resources/upload')
}

const isImageResource = (resource) => {
  if (!resource || !resource.fileType) return false
  const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'image']
  return imageTypes.includes(resource.fileType.toLowerCase())
}

const parseTags = (tagsString) => {
  if (!tagsString) return []
  // 支持逗号、空格、分号分隔的标签
  return tagsString.split(/[,，;；\s]+/).filter(tag => tag.trim() !== '')
}

const viewResourceDetail = (resource) => {
  currentResource.value = resource
  detailDialogVisible.value = true
}

const downloadResource = async (fileUrl, resourceId) => {
  console.log('下载按钮被点击，fileUrl:', fileUrl, 'resourceId:', resourceId)
  
  // 调试：检查资源数据
  console.log('当前资源列表:', resources.value)
  
  if (!fileUrl) {
    ElMessage.error('下载链接无效')
    return
  }
  
  // 先打开下载链接，确保用户可以下载
  console.log('开始下载文件:', fileUrl)
  window.open(fileUrl, '_blank')
  ElMessage.success('开始下载资源')
  
  // 异步调用后端API增加下载计数（不阻塞下载）
  if (resourceId && resourceId !== 'undefined' && resourceId !== undefined) {
    console.log('开始发送下载计数请求，resourceId:', resourceId)
    
    fetch(`/api/v1/resource/addDownloadCount/${resourceId}`, {
      method: 'GET'
    })
    .then(response => {
      console.log('下载计数请求响应状态:', response.status)
      
      if (response.ok) {
        console.log('下载计数增加成功')
        // 刷新资源列表以更新下载计数显示
        loadResources()
      } else {
        console.warn('下载计数增加失败，但文件下载已完成')
      }
    })
    .catch(error => {
      console.error('下载计数请求失败:', error)
      console.warn('下载计数请求失败，但文件下载已完成')
    })
  } else {
    console.warn('resourceId为空或undefined，跳过下载计数请求')
    console.log('尝试从fileUrl中提取资源ID...')
    
    // 尝试从fileUrl中提取资源ID
    const urlParts = fileUrl.split('/')
    const possibleId = urlParts[urlParts.length - 1].split('.')[0]
    console.log('从fileUrl提取的possibleId:', possibleId)
    
    if (possibleId && possibleId.length > 10) { // 假设ID长度大于10
      console.log('使用从fileUrl提取的ID发送下载计数请求:', possibleId)
      
      fetch(`/api/v1/resource/addDownloadCount/${possibleId}`, {
        method: 'GET'
      })
      .then(response => {
        console.log('下载计数请求响应状态:', response.status)
        
        if (response.ok) {
          console.log('下载计数增加成功')
          loadResources()
        } else {
          console.warn('下载计数增加失败，但文件下载已完成')
        }
      })
      .catch(error => {
        console.error('下载计数请求失败:', error)
        console.warn('下载计数请求失败，但文件下载已完成')
      })
    }
  }
}

const getFileTypeColor = (fileType) => {
  const colorMap = {
    'PDF': '#FF6B6B',
    'DOC': '#4ECDC4',
    'PPT': '#FFD166',
    'XLS': '#06D6A0',
    'TEXT': '#118AB2',
    'IMAGE': '#EF476F',
    'VIDEO': '#073B4C'
  }
  return colorMap[fileType] || '#6C757D'
}

const formatDate = (dateString) => {
  if (!dateString) return '未知'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN') + ' ' + date.toLocaleTimeString('zh-CN', { hour12: false })
  } catch (error) {
    return dateString
  }
}

const loadResources = async () => {
  loading.value = true
  try {
    // 构建搜索参数
    const searchParams = {}
    
    // 添加当前用户ID到请求体
    if (authStore.userInfo?.id) {
      searchParams.userId = authStore.userInfo.id
    }
    
    if (searchTitle.value) {
      searchParams.title = searchTitle.value
    }
    if (searchDescription.value) {
      searchParams.description = searchDescription.value
    }
    if (selectedCategory.value) {
      searchParams.classBelong = selectedCategory.value // 改为发送课程名称
    }
    
    await resourcesStore.fetchResources(searchParams)
  } catch (error) {
    console.error('加载资源失败:', error)
    ElMessage.error('加载资源失败')
  } finally {
    loading.value = false
  }
}

const loadCourseCategories = async () => {
  try {
    console.log('开始加载课程分类数据...')
    const response = await apiService.courses.list()
    
    console.log('课程API响应:', response)
    
    // 根据实际响应格式调整数据提取逻辑
    if (response.success && response.data?.code === 1) {
      const courseData = response.data.data || response.data
      console.log('课程数据:', courseData)
      
      if (courseData && Array.isArray(courseData) && courseData.length > 0) {
        // 从课程数据中提取课程名称作为分类选项
        const uniqueCourses = [...new Set(courseData.map(course => course.title))]
        console.log('提取的唯一课程名称:', uniqueCourses)
        
        if (uniqueCourses.length > 0) {
          courseCategories.value = uniqueCourses.map((name, index) => ({
            id: index + 1,
            name: name
          }))
          console.log('课程分类数据加载成功:', courseCategories.value)
        } else {
          console.warn('课程数据为空，使用默认分类')
          // 保持默认分类不变
        }
      } else {
        console.warn('课程数据格式错误，使用默认分类')
        // 保持默认分类不变
      }
    } else {
      console.warn('获取课程数据失败，响应格式不符，使用默认分类')
      console.log('响应数据:', response)
      // 保持默认分类不变
    }
  } catch (error) {
    console.error('加载课程分类失败:', error)
    // 保持默认分类不变
  }
}

onMounted(async () => {
  await loadCourseCategories()
  await loadResources()
})
</script>

<style scoped>
.resource-list {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-header h1 {
  font-size: 32px;
  color: #303133;
  margin-bottom: 8px;
}

.page-header p {
  font-size: 16px;
  color: #606266;
}

.search-filter {
  margin-bottom: 30px;
}

.resource-grid {
  margin-bottom: 30px;
}

@media (max-width: 768px) {
  .resource-card {
    min-height: 260px;
  }
  
  .resource-thumbnail {
    height: 80px;
  }
  
  .file-icon {
    font-size: 32px;
  }
}

@media (min-width: 1200px) {
  .resource-card {
    min-height: 300px;
  }
}

.resource-card {
  min-height: 280px;
  height: auto;
  margin-bottom: 20px;
  transition: all 0.3s ease;
  border: 1px solid #ebeef5;
  display: flex;
  flex-direction: column;
}

.resource-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.resource-thumbnail {
  height: 100px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7ed 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  margin-bottom: 12px;
  position: relative;
}

.file-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.file-icon {
  font-size: 40px;
}

.file-type-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  background: rgba(255, 255, 255, 0.9);
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  color: #606266;
  z-index: 10;
}

.image-preview {
  width: 100%;
  height: 100%;
  position: relative;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.image-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
  font-size: 12px;
}

.image-error .el-icon {
  font-size: 32px;
  margin-bottom: 4px;
}

.resource-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 120px;
}

.resource-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.resource-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.category {
  font-size: 11px;
  color: #909399;
  padding: 3px 6px;
  background: #f5f7fa;
  border-radius: 10px;
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 4px;
}

.tag-item {
  margin: 0 !important;
}

.resource-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
}

.resource-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.uploader, .download-count {
  font-size: 11px;
  color: #909399;
  line-height: 1.2;
}

.resource-actions {
  display: flex;
  gap: 6px;
}

.download-btn, .detail-btn {
  font-size: 11px;
  padding: 4px 8px;
  height: 24px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

.loading-container {
  margin-top: 30px;
}

/* 资源详情对话框样式 */
.resource-detail {
  max-height: 500px;
  overflow-y: auto;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section h4 {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
  border-left: 4px solid #409eff;
  padding-left: 12px;
}

.detail-description {
  font-size: 14px;
  line-height: 1.6;
  color: #606266;
  background: #f8f9fa;
  padding: 12px;
  border-radius: 6px;
}

.detail-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-label {
  font-weight: 600;
  color: #303133;
  min-width: 80px;
  margin-right: 8px;
}

.info-value {
  color: #606266;
  flex: 1;
}

.download-link {
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.download-btn-large {
  padding: 12px 24px;
  font-size: 16px;
}

.link-tip {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}

.dialog-footer {
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .resource-list {
    padding: 15px;
  }
  
  .search-filter .el-col {
    margin-bottom: 15px;
  }
  
  .resource-card {
    height: auto;
    min-height: 320px;
  }
  
  .resource-content {
    height: auto;
  }
  
  .resource-footer {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .resource-actions {
    justify-content: center;
  }
  
  .detail-info {
    grid-template-columns: 1fr;
  }
  
  .el-dialog {
    width: 95% !important;
    margin: 20px auto;
  }
}
</style>