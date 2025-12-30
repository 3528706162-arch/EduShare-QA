<template>
  <div class="question-list">
    <div class="page-header">
      <h1>问答社区</h1>
      <p>分享知识，解决问题，共同成长</p>
    </div>

    <div class="search-filter">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索问题..."
            prefix-icon="Search"
            clearable
            @input="handleSearch"
          />
        </el-col>
        <el-col :span="6">
          <el-select v-model="filterStatus" placeholder="筛选状态" clearable @change="handleFilter">
            <el-option label="全部" value=""></el-option>
            <el-option label="已解决" value="solved"></el-option>
            <el-option label="未解决" value="unsolved"></el-option>
            <el-option label="热门" value="hot"></el-option>
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-button type="primary" @click="askQuestion">
            <el-icon><Plus /></el-icon>
            提问
          </el-button>
        </el-col>
      </el-row>
    </div>

    <div class="question-container">
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="5" animated />
      </div>

      <div v-else-if="questions && questions.length > 0" class="question-items">
        <div 
          v-for="question in questions" 
          :key="question.id" 
          class="question-item"
          @click="viewQuestion(question.id)"
        >
          <div class="question-main">
            <div class="question-header">
              <h3 class="question-title">{{ question.title }}</h3>
              <div class="question-status">
                <!-- 根据实际数据调整状态显示 -->
                <el-tag 
                  v-if="question.isSolved" 
                  type="success" 
                  size="small"
                >
                  已解决
                </el-tag>
                <el-tag 
                  v-else 
                  type="warning" 
                  size="small"
                >
                  未解决
                </el-tag>
                <el-tag 
                  v-if="question.isHot" 
                  type="danger" 
                  size="small"
                >
                  热门
                </el-tag>
              </div>
            </div>
            
            <div class="question-content">
              <p class="question-description">{{ question.content }}</p>
              
              <!-- 显示附件图片 -->
              <div v-if="question.fileUrl" class="question-attachment">
                <el-image
                  :src="question.fileUrl"
                  :preview-src-list="[question.fileUrl]"
                  fit="cover"
                  style="width: 100px; height: 100px; border-radius: 4px;"
                >
                  <template #error>
                    <div class="image-error">
                      <el-icon><Picture /></el-icon>
                      <span>图片加载失败</span>
                    </div>
                  </template>
                </el-image>
              </div>
            </div>

            <div class="question-footer">
              <div class="question-meta">
                <span class="author">提问者: {{ getUserName(question.authorId) }}</span>
                <span class="class-belong">课程: {{ question.classBelong || '未分类' }}</span>
                <span class="time">{{ formatTime(question.createdAt) }}</span>
                <span class="type">分类: {{ question.questionType || '通用' }}</span>
              </div>
              
              <div class="question-tags">
                <el-tag
                  v-for="tag in getTagsArray(question.tags)"
                  :key="tag"
                  type="primary"
                  size="small"
                >
                  {{ tag }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-container">
        <el-empty description="暂无相关问题">
          <el-button type="primary" @click="askQuestion">去提问</el-button>
        </el-empty>
      </div>
    </div>

    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 30, 50]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuestionsStore } from '@/stores/questions'
import { Search, Plus, Picture } from '@element-plus/icons-vue'

const router = useRouter()
const questionsStore = useQuestionsStore()

const searchKeyword = ref('')
const filterStatus = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)

const questions = computed(() => questionsStore.questions)
const total = computed(() => questionsStore.pagination.total)

// 用户名称缓存
const userNameCache = ref({})
const loadingNames = ref({})
const userNames = ref({})

// 通过API获取用户名并更新响应式数据
const fetchUserName = async (userId) => {
  if (!userId) return
  
  // 如果已经在缓存中，直接返回
  if (userNameCache.value[userId]) {
    userNames.value[userId] = userNameCache.value[userId]
    return
  }
  
  // 如果正在加载中，跳过
  if (loadingNames.value[userId]) {
    return
  }
  
  try {
    loadingNames.value[userId] = true
    
    const response = await fetch(`/api/v1/user/getUsername/${userId}`)
    const result = await response.json()
    
    if (result.code === 1 && result.data) {
      // 缓存用户名并更新响应式数据
      userNameCache.value[userId] = result.data
      userNames.value[userId] = result.data
    } else {
      // API调用失败，使用默认值
      userNameCache.value[userId] = `用户${userId}`
      userNames.value[userId] = `用户${userId}`
    }
  } catch (error) {
    console.error(`获取用户${userId}名称失败:`, error)
    // 出错时使用默认值
    userNameCache.value[userId] = `用户${userId}`
    userNames.value[userId] = `用户${userId}`
  } finally {
    loadingNames.value[userId] = false
  }
}

// 获取用户名的显示函数
const getUserName = (userId) => {
  if (!userId) return '未知用户'
  return userNames.value[userId] || '加载中...'
}

// 加载问题时预加载用户名
const loadQuestions = async () => {
  loading.value = true
  try {
    await questionsStore.fetchQuestions({
      page: currentPage.value,
      limit: pageSize.value,
      search: searchKeyword.value,
      status: filterStatus.value
    })
    
    // 预加载所有问题的用户名
    if (questions.value && questions.value.length > 0) {
      questions.value.forEach(question => {
        if (question.authorId) {
          fetchUserName(question.authorId)
        }
      })
    }
  } catch (error) {
    console.error('加载问题列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadQuestions()
}

const handleFilter = () => {
  currentPage.value = 1
  loadQuestions()
}

const handleSizeChange = (size) => {
  pageSize.value = size
  loadQuestions()
}

const handleCurrentChange = (page) => {
  currentPage.value = page
  loadQuestions()
}

const askQuestion = () => {
  router.push('/questions/ask')
}

const viewQuestion = (id) => {
  router.push(`/questions/${id}`)
}

// 将标签字符串转换为数组
const getTagsArray = (tags) => {
  if (!tags) return []
  if (Array.isArray(tags)) return tags
  return tags.split(',').map(tag => tag.trim()).filter(tag => tag)
}

const formatTime = (time) => {
  if (!time) return ''
  const now = new Date()
  const target = new Date(time)
  const diff = now - target
  
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  const week = 7 * day
  
  if (diff < minute) {
    return '刚刚'
  } else if (diff < hour) {
    return Math.floor(diff / minute) + '分钟前'
  } else if (diff < day) {
    return Math.floor(diff / hour) + '小时前'
  } else if (diff < week) {
    return Math.floor(diff / day) + '天前'
  } else {
    return target.toLocaleDateString('zh-CN')
  }
}

onMounted(() => {
  loadQuestions()
})
</script>

<style scoped>
.question-list {
  padding: 20px;
  max-width: 1000px;
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

.question-container {
  min-height: 400px;
}

.question-items {
  margin-bottom: 30px;
}

.question-item {
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.question-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.question-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
  margin: 0;
  flex: 1;
  margin-right: 16px;
}

.question-status {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.question-content {
  margin-bottom: 16px;
}

.question-description {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 12px;
}

.question-attachment {
  margin-top: 12px;
}

.image-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 100px;
  background: #f5f7fa;
  border-radius: 4px;
  color: #909399;
  font-size: 12px;
}

.image-error .el-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.question-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.question-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #909399;
  flex-wrap: wrap;
}

.question-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* 蓝色标签样式 */
.question-tags .el-tag {
  background-color: #ecf5ff;
  border-color: #d9ecff;
  color: #409eff;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

.loading-container {
  margin-top: 40px;
}

.empty-container {
  text-align: center;
  margin-top: 60px;
}

@media (max-width: 768px) {
  .question-list {
    padding: 15px;
  }
  
  .question-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .question-title {
    margin-right: 0;
    margin-bottom: 8px;
  }
  
  .question-footer {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .question-meta {
    gap: 8px;
  }
  
  .search-filter .el-col {
    margin-bottom: 15px;
  }
}
</style>