<template>
  <div class="question-management">
    <div class="breadcrumb">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/admin' }">管理员后台</el-breadcrumb-item>
        <el-breadcrumb-item>问答管理</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div class="page-header">
      <h1>问答管理</h1>
      <p>管理系统所有问答内容，包括问题审核、回答管理、标签管理等</p>
    </div>

    <!-- 搜索和筛选区域 -->
    <el-card class="search-card">
      <div class="search-form">
        <el-form :model="searchForm" :inline="true">
          <el-form-item label="问题标题">
            <el-input 
              v-model="searchForm.title" 
              placeholder="请输入问题标题"
              clearable
            />
          </el-form-item>
          
          <el-form-item label="提问者">
            <el-input 
              v-model="searchForm.asker" 
              placeholder="请输入提问者用户名"
              clearable
            />
          </el-form-item>
          
          <el-form-item label="问题分类">
            <el-select v-model="searchForm.category" placeholder="请选择分类" clearable>
              <el-option 
                v-for="category in categories" 
                :key="category.id"
                :label="category.name" 
                :value="category.id"
              />
            </el-select>
          </el-form-item>
          
          <el-form-item label="问题状态">
            <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
              <el-option label="已发布" value="published" />
              <el-option label="待审核" value="pending" />
              <el-option label="已关闭" value="closed" />
              <el-option label="已删除" value="deleted" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="回答状态">
            <el-select v-model="searchForm.answerStatus" placeholder="请选择回答状态" clearable>
              <el-option label="有回答" value="answered" />
              <el-option label="无回答" value="unanswered" />
              <el-option label="有采纳回答" value="accepted" />
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
                <el-icon><QuestionFilled /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ stats.totalQuestions }}</div>
                <div class="stat-label">总问题数</div>
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
                <div class="stat-number">{{ stats.pendingQuestions }}</div>
                <div class="stat-label">待审核</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon answered-icon">
                <el-icon><ChatDotRound /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ stats.answeredQuestions }}</div>
                <div class="stat-label">已回答</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon today-icon">
                <el-icon><Calendar /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ stats.todayQuestions }}</div>
                <div class="stat-label">今日新增</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 操作按钮区域 -->
    <div class="action-bar">
      <el-button type="primary" @click="handleBatchApprove" :disabled="selectedQuestions.length === 0">
        <el-icon><Check /></el-icon>
        批量审核通过
      </el-button>
      
      <el-button type="warning" @click="handleBatchReject" :disabled="selectedQuestions.length === 0">
        <el-icon><Close /></el-icon>
        批量拒绝
      </el-button>
      
      <el-button @click="handleExport">
        <el-icon><Download /></el-icon>
        导出数据
      </el-button>
      
      <el-button type="danger" @click="handleBatchDelete" :disabled="selectedQuestions.length === 0">
        <el-icon><Delete /></el-icon>
        批量删除
      </el-button>
    </div>

    <!-- 问题列表 -->
    <el-card>
      <template #header>
        <div class="table-header">
          <span>问题列表</span>
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
        :data="questionList"
        @selection-change="handleSelectionChange"
        stripe
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" />
        
        <el-table-column label="问题ID" prop="id" width="80" />
        
        <el-table-column label="问题信息" min-width="300">
          <template #default="{ row }">
            <div class="question-info">
              <div class="question-title">
                <span class="title-text">{{ row.title }}</span>
                <el-tag 
                  v-if="row.isHot" 
                  size="small" 
                  type="danger"
                  effect="light"
                >
                  热门
                </el-tag>
                <el-tag 
                  v-if="row.hasReward" 
                  size="small" 
                  type="warning"
                  effect="light"
                >
                  悬赏
                </el-tag>
              </div>
              <div class="question-content">
                {{ row.content }}
              </div>
              <div class="question-meta">
                <span class="asker">提问者: {{ row.asker }}</span>
                <span class="category">分类: {{ getCategoryName(row.category) }}</span>
                <span class="tags">
                  标签: 
                  <el-tag 
                    v-for="tag in row.tags.slice(0, 3)" 
                    :key="tag"
                    size="small"
                    effect="plain"
                  >
                    {{ tag }}
                  </el-tag>
                  <span v-if="row.tags.length > 3" class="more-tags">+{{ row.tags.length - 3 }}</span>
                </span>
              </div>
            </div>
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
        
        <el-table-column label="回答数" width="100" prop="answerCount" sortable />
        
        <el-table-column label="浏览数" width="100" prop="viewCount" sortable />
        
        <el-table-column label="悬赏积分" width="100">
          <template #default="{ row }">
            <span v-if="row.rewardPoints > 0" class="reward-points">
              {{ row.rewardPoints }}
            </span>
            <span v-else class="no-reward">无</span>
          </template>
        </el-table-column>
        
        <el-table-column label="提问时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        
        <el-table-column label="最后活动" width="180">
          <template #default="{ row }">
            {{ formatDate(row.lastActivityAt) }}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button 
              size="small" 
              @click="handleView(row)"
            >
              查看
            </el-button>
            
            <el-button 
              size="small" 
              type="primary" 
              @click="handleEdit(row)"
              :disabled="row.status === 'deleted'"
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
                    command="close"
                  >
                    关闭问题
                  </el-dropdown-item>
                  <el-dropdown-item 
                    v-if="row.status === 'closed'" 
                    command="reopen"
                  >
                    重新打开
                  </el-dropdown-item>
                  <el-dropdown-item command="answers">管理回答</el-dropdown-item>
                  <el-dropdown-item command="tags">管理标签</el-dropdown-item>
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
  Search, QuestionFilled, Clock, ChatDotRound, Calendar, 
  Check, Close, Download, Delete, Refresh, ArrowDown
} from '@element-plus/icons-vue'

// 搜索表单
const searchForm = reactive({
  title: '',
  asker: '',
  category: '',
  status: '',
  answerStatus: ''
})

// 问题分类
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
  totalQuestions: 3456,
  pendingQuestions: 15,
  answeredQuestions: 2789,
  todayQuestions: 23
})

// 问题列表数据
const questionList = ref([
  {
    id: 1,
    title: '如何快速掌握高中数学函数？',
    content: '最近在学习函数部分，感觉很难理解，有什么好的学习方法吗？',
    asker: '张同学',
    category: 2,
    tags: ['数学', '函数', '学习方法'],
    status: 'published',
    answerCount: 8,
    viewCount: 156,
    rewardPoints: 50,
    isHot: true,
    hasReward: true,
    createdAt: '2024-01-10T14:30:00Z',
    lastActivityAt: '2024-01-15T16:45:00Z'
  },
  {
    id: 2,
    title: '英语四级考试有什么备考技巧？',
    content: '准备参加四级考试，想了解一些高效的备考方法',
    asker: '李同学',
    category: 3,
    tags: ['英语', '四级', '备考'],
    status: 'pending',
    answerCount: 0,
    viewCount: 23,
    rewardPoints: 0,
    isHot: false,
    hasReward: false,
    createdAt: '2024-01-15T09:15:00Z',
    lastActivityAt: '2024-01-15T09:15:00Z'
  },
  {
    id: 3,
    title: '物理实验中的误差分析怎么做？',
    content: '在做物理实验时，如何正确进行误差分析和数据处理？',
    asker: '王老师',
    category: 5,
    tags: ['物理', '实验', '误差分析'],
    status: 'published',
    answerCount: 3,
    viewCount: 89,
    rewardPoints: 20,
    isHot: false,
    hasReward: true,
    createdAt: '2024-01-12T16:45:00Z',
    lastActivityAt: '2024-01-14T10:20:00Z'
  },
  {
    id: 4,
    title: '化学元素周期表记忆方法',
    content: '有什么好记的方法可以快速记住元素周期表？',
    asker: '赵同学',
    category: 6,
    tags: ['化学', '元素周期表', '记忆方法'],
    status: 'closed',
    answerCount: 12,
    viewCount: 234,
    rewardPoints: 0,
    isHot: true,
    hasReward: false,
    createdAt: '2024-01-08T10:00:00Z',
    lastActivityAt: '2024-01-13T15:30:00Z'
  },
  {
    id: 5,
    title: '历史大事年表整理技巧',
    content: '如何系统地整理历史大事年表，便于复习？',
    asker: '刘老师',
    category: 7,
    tags: ['历史', '大事年表', '整理技巧'],
    status: 'deleted',
    answerCount: 5,
    viewCount: 67,
    rewardPoints: 0,
    isHot: false,
    hasReward: false,
    createdAt: '2024-01-05T11:20:00Z',
    lastActivityAt: '2024-01-10T14:15:00Z'
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

// 选中的问题
const selectedQuestions = ref([])

// 审核对话框相关
const reviewDialogVisible = ref(false)
const reviewAction = ref('') // 'approve' 或 'reject'
const currentQuestion = ref(null)
const reviewForm = reactive({
  comment: ''
})

// 计算属性
const reviewDialogTitle = computed(() => {
  return reviewAction.value === 'approve' ? '审核通过' : '拒绝问题'
})

// 方法定义
const handleSearch = () => {
  pagination.currentPage = 1
  loadQuestionList()
}

const handleReset = () => {
  Object.assign(searchForm, {
    title: '',
    asker: '',
    category: '',
    status: '',
    answerStatus: ''
  })
  pagination.currentPage = 1
  loadQuestionList()
}

const handleBatchApprove = () => {
  if (selectedQuestions.value.length === 0) {
    ElMessage.warning('请选择要审核的问题')
    return
  }
  
  ElMessageBox.confirm(
    `确定要通过选中的 ${selectedQuestions.value.length} 个问题吗？`,
    '确认审核',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success('批量审核通过成功')
    loadQuestionList()
  }).catch(() => {
    ElMessage.info('已取消审核')
  })
}

const handleBatchReject = () => {
  if (selectedQuestions.value.length === 0) {
    ElMessage.warning('请选择要拒绝的问题')
    return
  }
  
  reviewAction.value = 'reject'
  reviewDialogVisible.value = true
}

const handleExport = () => {
  ElMessage.success('导出功能开发中...')
}

const handleBatchDelete = () => {
  if (selectedQuestions.value.length === 0) {
    ElMessage.warning('请选择要删除的问题')
    return
  }
  
  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedQuestions.value.length} 个问题吗？`,
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success('批量删除成功')
    loadQuestionList()
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

const handleView = (row) => {
  ElMessage.info(`查看问题: ${row.title}`)
}

const handleEdit = (row) => {
  ElMessage.info(`编辑问题: ${row.title}`)
}

const handleSelectionChange = (selection) => {
  selectedQuestions.value = selection
}

const handleSizeChange = (size) => {
  pagination.pageSize = size
  loadQuestionList()
}

const handleCurrentChange = (page) => {
  pagination.currentPage = page
  loadQuestionList()
}

const handleCommand = (command, row) => {
  currentQuestion.value = row
  
  switch (command) {
    case 'approve':
      reviewAction.value = 'approve'
      reviewDialogVisible.value = true
      break
    case 'reject':
      reviewAction.value = 'reject'
      reviewDialogVisible.value = true
      break
    case 'close':
      handleCloseQuestion(row)
      break
    case 'reopen':
      handleReopenQuestion(row)
      break
    case 'answers':
      handleManageAnswers(row)
      break
    case 'tags':
      handleManageTags(row)
      break
    case 'delete':
      handleDeleteQuestion(row)
      break
  }
}

const handleReviewSubmit = () => {
  if (reviewAction.value === 'approve') {
    ElMessage.success('问题审核通过')
  } else {
    ElMessage.success('问题已拒绝')
  }
  
  reviewDialogVisible.value = false
  reviewForm.comment = ''
  loadQuestionList()
}

const handleCloseQuestion = (row) => {
  ElMessageBox.confirm(`确定要关闭问题 "${row.title}" 吗？`, '确认操作', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('问题已关闭')
    loadQuestionList()
  }).catch(() => {
    ElMessage.info('已取消操作')
  })
}

const handleReopenQuestion = (row) => {
  ElMessageBox.confirm(`确定要重新打开问题 "${row.title}" 吗？`, '确认操作', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('问题已重新打开')
    loadQuestionList()
  }).catch(() => {
    ElMessage.info('已取消操作')
  })
}

const handleManageAnswers = (row) => {
  ElMessage.info(`管理回答: ${row.title}`)
}

const handleManageTags = (row) => {
  ElMessage.info(`管理标签: ${row.title}`)
}

const handleDeleteQuestion = (row) => {
  ElMessageBox.confirm(`确定要删除问题 "${row.title}" 吗？`, '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('问题删除成功')
    loadQuestionList()
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

const refreshTable = () => {
  loadQuestionList()
}

const loadQuestionList = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    pagination.total = questionList.value.length
  } catch (error) {
    console.error('加载问题列表失败:', error)
    ElMessage.error('数据加载失败')
  } finally {
    loading.value = false
  }
}

const getCategoryName = (categoryId) => {
  const category = categories.value.find(cat => cat.id === categoryId)
  return category ? category.name : '未知分类'
}

const getStatusType = (status) => {
  const types = {
    published: 'success',
    pending: 'warning',
    closed: 'info',
    deleted: 'danger'
  }
  return types[status] || ''
}

const getStatusLabel = (status) => {
  const labels = {
    published: '已发布',
    pending: '待审核',
    closed: '已关闭',
    deleted: '已删除'
  }
  return labels[status] || status
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

onMounted(() => {
  loadQuestionList()
})
</script>

<style scoped>
.question-management {
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

.answered-icon {
  background-color: #f6ffed;
  color: #52c41a;
}

.today-icon {
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

.question-info {
  min-width: 0;
}

.question-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.title-text {
  font-weight: 500;
  color: #303133;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.question-content {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.question-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 12px;
  color: #909399;
}

.asker, .category, .tags {
  background-color: #f5f7fa;
  padding: 2px 6px;
  border-radius: 3px;
}

.tags {
  display: flex;
  align-items: center;
  gap: 4px;
}

.more-tags {
  color: #606266;
}

.reward-points {
  color: #e6a23c;
  font-weight: 500;
}

.no-reward {
  color: #909399;
  font-style: italic;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .question-management {
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
  
  .question-meta {
    flex-direction: column;
    gap: 4px;
  }
  
  .pagination {
    justify-content: center;
  }
}
</style>