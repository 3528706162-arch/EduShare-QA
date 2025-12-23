<template>
  <div class="resource-detail">
    <div class="breadcrumb">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/resources' }">学习资源</el-breadcrumb-item>
        <el-breadcrumb-item>资源详情</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="10" animated />
    </div>

    <div v-else-if="resource" class="resource-content">
      <el-card class="resource-card">
        <div class="resource-header">
          <h1 class="resource-title">{{ resource.title }}</h1>
          <div class="resource-meta">
            <span class="category">{{ resource.category }}</span>
            <span class="size">{{ formatFileSize(resource.size) }}</span>
            <span class="upload-time">{{ formatDate(resource.uploadTime) }}</span>
          </div>
        </div>

        <div class="resource-info">
          <div class="info-item">
            <label>上传者:</label>
            <span>{{ resource.uploader }}</span>
          </div>
          <div class="info-item">
            <label>下载次数:</label>
            <span>{{ resource.downloadCount }}</span>
          </div>
          <div class="info-item">
            <label>评分:</label>
            <span>
              <el-rate
                v-model="resource.rating"
                disabled
                show-score
                text-color="#ff9900"
                score-template="{value}"
              />
            </span>
          </div>
        </div>

        <div class="resource-description">
          <h3>资源描述</h3>
          <p>{{ resource.description }}</p>
        </div>

        <div class="resource-tags">
          <el-tag
            v-for="tag in resource.tags"
            :key="tag"
            type="info"
            size="small"
            class="tag"
          >
            {{ tag }}
          </el-tag>
        </div>

        <div class="action-buttons">
          <el-button type="primary" size="large" @click="downloadResource">
            <el-icon><Download /></el-icon>
            下载资源
          </el-button>
          <el-button size="large" @click="goBack">
            <el-icon><ArrowLeft /></el-icon>
            返回列表
          </el-button>
          <el-button 
            v-if="canEdit" 
            type="warning" 
            size="large" 
            @click="editResource"
          >
            <el-icon><Edit /></el-icon>
            编辑资源
          </el-button>
          <el-button 
            v-if="canDelete" 
            type="danger" 
            size="large" 
            @click="deleteResource"
          >
            <el-icon><Delete /></el-icon>
            删除资源
          </el-button>
        </div>
      </el-card>

      <!-- 相关资源推荐 -->
      <div class="related-resources">
        <h3>相关资源推荐</h3>
        <el-row :gutter="20">
          <el-col 
            v-for="related in relatedResources" 
            :key="related.id" 
            :xs="24" :sm="12" :md="8"
          >
            <el-card class="related-card" shadow="hover" @click="viewRelatedResource(related.id)">
              <div class="related-content">
                <h4>{{ related.title }}</h4>
                <p>{{ related.description }}</p>
                <div class="related-meta">
                  <span>{{ related.category }}</span>
                  <span>{{ formatFileSize(related.size) }}</span>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </div>

    <div v-else class="empty-container">
      <el-empty description="资源不存在或已被删除">
        <el-button type="primary" @click="goBack">返回资源列表</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useResourcesStore } from '@/stores/resources'
import { Download, ArrowLeft, Edit, Delete } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const resourcesStore = useResourcesStore()

const resource = ref(null)
const relatedResources = ref([])
const loading = ref(true)

const resourceId = computed(() => route.params.id)

const canEdit = computed(() => {
  if (!resource.value) return false
  return authStore.userId === resource.value.uploaderId || authStore.userRole === 'admin'
})

const canDelete = computed(() => {
  if (!resource.value) return false
  return authStore.userRole === 'admin'
})

const loadResource = async () => {
  loading.value = true
  try {
    const result = await resourcesStore.getResource(resourceId.value)
    if (result.success) {
      resource.value = result.data
      await loadRelatedResources()
    } else {
      resource.value = null
    }
  } catch (error) {
    console.error('加载资源详情失败:', error)
    resource.value = null
  } finally {
    loading.value = false
  }
}

const loadRelatedResources = async () => {
  try {
    const result = await resourcesStore.searchResources({
      category: resource.value.category,
      limit: 3,
      exclude: resource.value.id
    })
    if (result.success) {
      relatedResources.value = result.data.resources
    }
  } catch (error) {
    console.error('加载相关资源失败:', error)
  }
}

const downloadResource = async () => {
  try {
    const result = await resourcesStore.downloadResource(resourceId.value)
    if (result.success) {
      // 模拟下载行为
      const link = document.createElement('a')
      link.href = result.data.downloadUrl
      link.download = resource.value.title
      link.click()
      
      // 更新下载次数
      resource.value.downloadCount++
    }
  } catch (error) {
    console.error('下载资源失败:', error)
  }
}

const editResource = () => {
  // 跳转到编辑页面
  router.push(`/resources/${resourceId.value}/edit`)
}

const deleteResource = async () => {
  try {
    await ElMessageBox.confirm('确定要删除这个资源吗？', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const result = await resourcesStore.deleteResource(resourceId.value)
    if (result.success) {
      ElMessage.success('资源删除成功')
      goBack()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除资源失败:', error)
    }
  }
}

const viewRelatedResource = (id) => {
  router.push(`/resources/${id}`)
}

const goBack = () => {
  router.push('/resources')
}

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN')
}

onMounted(() => {
  loadResource()
})
</script>

<style scoped>
.resource-detail {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.breadcrumb {
  margin-bottom: 20px;
}

.resource-card {
  margin-bottom: 30px;
}

.resource-header {
  margin-bottom: 20px;
}

.resource-title {
  font-size: 28px;
  color: #303133;
  margin-bottom: 16px;
  line-height: 1.4;
}

.resource-meta {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.category, .size, .upload-time {
  font-size: 14px;
  color: #606266;
  background: #f5f7fa;
  padding: 4px 12px;
  border-radius: 16px;
}

.resource-info {
  margin: 24px 0;
  padding: 20px;
  background: #f9fafb;
  border-radius: 8px;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.info-item label {
  font-weight: 600;
  color: #303133;
  min-width: 80px;
  margin-right: 16px;
}

.resource-description {
  margin: 24px 0;
}

.resource-description h3 {
  font-size: 18px;
  color: #303133;
  margin-bottom: 12px;
}

.resource-description p {
  font-size: 16px;
  color: #606266;
  line-height: 1.6;
}

.resource-tags {
  margin: 20px 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  margin-right: 8px;
}

.action-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 30px;
}

.related-resources {
  margin-top: 40px;
}

.related-resources h3 {
  font-size: 20px;
  color: #303133;
  margin-bottom: 20px;
}

.related-card {
  cursor: pointer;
  transition: transform 0.3s ease;
  margin-bottom: 20px;
}

.related-card:hover {
  transform: translateY(-3px);
}

.related-content h4 {
  font-size: 16px;
  color: #303133;
  margin-bottom: 8px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.related-content p {
  font-size: 14px;
  color: #606266;
  line-height: 1.4;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.related-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
}

.loading-container {
  margin-top: 40px;
}

.empty-container {
  text-align: center;
  margin-top: 60px;
}

@media (max-width: 768px) {
  .resource-detail {
    padding: 15px;
  }
  
  .resource-title {
    font-size: 24px;
  }
  
  .resource-meta {
    flex-direction: column;
    gap: 8px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .action-buttons .el-button {
    width: 100%;
  }
}
</style>