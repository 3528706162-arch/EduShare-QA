<template>
  <div class="resource-list">
    <div class="page-header">
      <h1>学习资源库</h1>
      <p>发现和分享优质学习资源</p>
    </div>
    
    <div class="search-filter">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索资源..."
            prefix-icon="Search"
            clearable
            @input="handleSearch"
          />
        </el-col>
        <el-col :span="8">
          <el-select v-model="selectedCategory" placeholder="选择分类" clearable @change="handleFilter">
            <el-option
              v-for="category in categories"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            />
          </el-select>
        </el-col>
        <el-col :span="8">
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
          :xs="24" :sm="12" :md="8" :lg="6"
        >
          <el-card class="resource-card" shadow="hover">
            <div class="resource-thumbnail">
              <el-icon class="file-icon"><Document /></el-icon>
            </div>
            <div class="resource-content">
              <h3 class="resource-title">{{ resource.title }}</h3>
              <p class="resource-description">{{ resource.description }}</p>
              <div class="resource-meta">
                <span class="category">{{ resource.category }}</span>
                <span class="size">{{ formatFileSize(resource.size) }}</span>
              </div>
              <div class="resource-footer">
                <span class="uploader">上传者: {{ resource.uploader }}</span>
                <el-button type="primary" size="small" @click="viewResource(resource.id)">
                  查看详情
                </el-button>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useResourcesStore } from '@/stores/resources'
import { Search, Upload, Document } from '@element-plus/icons-vue'

const router = useRouter()
const authStore = useAuthStore()
const resourcesStore = useResourcesStore()

const searchKeyword = ref('')
const selectedCategory = ref('')
const currentPage = ref(1)
const pageSize = ref(12)
const loading = ref(false)

const resources = computed(() => resourcesStore.resources)
const categories = computed(() => resourcesStore.categories)
const total = computed(() => resourcesStore.total)

const canUpload = computed(() => {
  return authStore.userRole === 'teacher' || authStore.userRole === 'admin' || authStore.userRole === 'student'
})

const handleSearch = () => {
  currentPage.value = 1
  loadResources()
}

const handleFilter = () => {
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

const viewResource = (id) => {
  router.push(`/resources/${id}`)
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const loadResources = async () => {
  loading.value = true
  try {
    await resourcesStore.getResources({
      page: currentPage.value,
      limit: pageSize.value,
      search: searchKeyword.value,
      category: selectedCategory.value
    })
  } catch (error) {
    console.error('加载资源失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await resourcesStore.getCategories()
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

.resource-card {
  height: 280px;
  margin-bottom: 20px;
  transition: transform 0.3s ease;
}

.resource-card:hover {
  transform: translateY(-5px);
}

.resource-thumbnail {
  height: 120px;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  margin-bottom: 15px;
}

.file-icon {
  font-size: 48px;
  color: #409eff;
}

.resource-content {
  height: 140px;
  display: flex;
  flex-direction: column;
}

.resource-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.resource-description {
  font-size: 14px;
  color: #606266;
  line-height: 1.4;
  margin-bottom: 12px;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.resource-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.category, .size {
  font-size: 12px;
  color: #909399;
  padding: 2px 8px;
  background: #f5f7fa;
  border-radius: 12px;
}

.resource-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.uploader {
  font-size: 12px;
  color: #909399;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

.loading-container {
  margin-top: 30px;
}

@media (max-width: 768px) {
  .resource-list {
    padding: 15px;
  }
  
  .search-filter .el-col {
    margin-bottom: 15px;
  }
}
</style>