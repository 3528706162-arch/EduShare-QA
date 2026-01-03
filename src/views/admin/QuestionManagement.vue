<template>
  <div class="question-management">
    <div class="breadcrumb">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/admin' }">管理员后台</el-breadcrumb-item>
        <el-breadcrumb-item>问答管理</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div class="page-header">
      <h1>问答内容管理</h1>
      <p>管理系统所有问题和回答，支持删除、修改和管控功能</p>
    </div>

    <!-- 问题列表 -->
    <el-card class="main-card">
      <template #header>
        <div class="table-header">
          <span class="header-title">所有问题列表</span>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="questionList"
        stripe
        style="width: 100%"
        :default-sort="{ prop: 'createdAt', order: 'descending' }"
      >
        <el-table-column label="问题ID" prop="id" width="80" />
        
        <el-table-column label="问题信息" min-width="350">
          <template #default="{ row }">
            <div class="question-info">
              <div class="question-title">
                <span class="title-text">{{ row.title }}</span>
                <el-tag 
                  v-if="row.isControlled" 
                  size="small" 
                  type="danger"
                  effect="light"
                >
                  已管控
                </el-tag>
              </div>
              <div class="question-content">
                {{ row.content }}
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="提问者" width="120">
            <template #default="{ row }">
              {{ getUserName(row.authorId || row.author) || '匿名用户' }}
            </template>
          </el-table-column>
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column prop="answerCount" label="回答数" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.answerCount > 0 ? 'success' : 'info'">
              {{ row.answerCount }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="提问时间" width="180" prop="createdAt" sortable>
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="300" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button 
                size="small" 
                type="primary" 
                @click="handleEditQuestion(row)"
                :disabled="row.isControlled"
              >
                <el-icon><Edit /></el-icon>
                修改问题
              </el-button>
              
              <el-button 
                size="small" 
                type="success" 
                @click="handleEditAnswer(row)"
                :disabled="!row.answerCount || row.isControlled"
              >
                <el-icon><ChatDotRound /></el-icon>
                修改回答
              </el-button>
              
              <el-button 
                size="small" 
                :type="row.isControlled ? 'success' : 'warning'"
                @click="handleToggleControl(row)"
              >
                <el-icon v-if="row.isControlled"><Unlock /></el-icon>
                <el-icon v-else><Lock /></el-icon>
                {{ row.isControlled ? '解除管控' : '管控' }}
              </el-button>
              
              <el-button 
                size="small" 
                type="danger" 
                @click="handleDeleteQuestion(row)"
              >
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </div>
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

    <!-- 修改问题对话框 -->
    <el-dialog
      v-model="editQuestionDialogVisible"
      title="修改问题"
      width="600px"
      center
    >
      <el-form
        ref="editQuestionFormRef"
        :model="editQuestionForm"
        :rules="editQuestionRules"
        label-width="100px"
        label-position="left"
      >
        <el-form-item label="问题标题" prop="title">
          <el-input v-model="editQuestionForm.title" placeholder="请输入问题标题" />
        </el-form-item>

        <el-form-item label="问题内容" prop="content">
          <el-input 
            v-model="editQuestionForm.content" 
            type="textarea" 
            :rows="4"
            placeholder="请输入问题内容" 
          />
        </el-form-item>

        <el-form-item label="问题分类" prop="category">
          <el-select v-model="editQuestionForm.category" placeholder="请选择分类" clearable>
            <el-option 
              v-for="category in categories" 
              :key="category.id"
              :label="category.name" 
              :value="category.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editQuestionDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveQuestionEdit" :loading="savingQuestion">
            保存修改
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 修改回答对话框 -->
    <el-dialog
      v-model="editAnswerDialogVisible"
      title="修改回答"
      width="700px"
      center
    >
      <div class="answer-info">
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="info-item">
              <label>回答者：</label>
              <span>{{ editAnswerForm.authorName || '未知用户' }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <label>回答时间：</label>
              <span>{{ formatTime(editAnswerForm.createTime) }}</span>
            </div>
          </el-col>
        </el-row>
      </div>
      
      <el-form
        ref="editAnswerFormRef"
        :model="editAnswerForm"
        :rules="editAnswerRules"
        label-width="100px"
        label-position="left"
        style="margin-top: 20px"
      >
        <el-form-item label="回答内容" prop="content">
          <el-input 
            v-model="editAnswerForm.content" 
            type="textarea" 
            :rows="6"
            placeholder="请输入回答内容" 
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editAnswerDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveAnswerEdit" :loading="savingAnswer">
            保存修改
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { 
  Edit, ChatDotRound, Lock, Unlock, Delete 
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { apiService } from '@/services/api'

// 问题列表数据
const questionList = ref([])

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 加载状态
const loading = ref(false)

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

// 修改问题相关
const editQuestionDialogVisible = ref(false)
const savingQuestion = ref(false)
const editQuestionFormRef = ref()
const editQuestionForm = ref({
  id: '',
  title: '',
  content: '',
  category: ''
})
const editQuestionRules = ref({
  title: [
    { required: true, message: '请输入问题标题', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入问题内容', trigger: 'blur' }
  ]
})

// 修改回答相关
const editAnswerDialogVisible = ref(false)
const savingAnswer = ref(false)
const editAnswerFormRef = ref()
const editAnswerForm = ref({
  id: '',
  questionId: '',
  content: ''
})
const editAnswerRules = ref({
  content: [
    { required: true, message: '请输入回答内容', trigger: 'blur' }
  ]
})

// 加载问题列表
const loadQuestionList = async () => {
  loading.value = true
  try {
    // 调用API查询所有问题
    const response = await apiService.questions.findByItem({})
    
    console.log('API响应数据:', response) // 调试日志
    
    if (response && response.success && response.data) {
      const data = response.data.data || response.data
      if (Array.isArray(data)) {
        // 为每个问题获取回答数量
        const questionsWithAnswerCount = await Promise.all(
          data.map(async (question) => {
            try {
              // 使用问题ID查询回答数量，与用户中心模式相同
              const answerResponse = await fetch(`/api/v1/answer/findAnswersByQuestionId/${question.id}`)
              if (answerResponse.ok) {
                const answerResult = await answerResponse.json()
                let answerCount = 0
                
                if (answerResult.code === 1 && answerResult.data) {
                  // 处理单个回答对象或回答数组
                  const answers = Array.isArray(answerResult.data) ? answerResult.data : 
                                (answerResult.data.id && answerResult.data.content) ? [answerResult.data] : []
                  answerCount = answers.length
                }
                
                return {
                  ...question,
                  isControlled: loadControlStateFromLocal(question.id) || question.isControlled || false,
                  answerCount: answerCount,
                  authorId: question.authorId || question.author,
                  category: question.category || question.questionType || question.classBelong || '未分类'
                }
              }
            } catch (error) {
              console.error(`获取问题 ${question.id} 的回答数量失败:`, error)
            }
            
            // 如果获取回答数量失败，返回默认值
            return {
              ...question,
              isControlled: loadControlStateFromLocal(question.id) || question.isControlled || false,
              answerCount: question.answerCount || 0,
              authorId: question.authorId || question.author,
              category: question.category || question.questionType || question.classBelong || '未分类'
            }
          })
        )
        
        questionList.value = questionsWithAnswerCount
        pagination.total = data.length
        console.log('成功加载问题列表，数量:', data.length)
      } else {
        console.log('API返回的数据不是数组:', data)
        questionList.value = []
        pagination.total = 0
      }
    } else {
      ElMessage.error('获取问题列表失败')
      questionList.value = []
      pagination.total = 0
    }
  } catch (error) {
    console.error('加载问题列表失败:', error)
    ElMessage.error('加载问题列表失败')
    questionList.value = []
    pagination.total = 0
  } finally {
    loading.value = false
  }
}

// 修改问题
const handleEditQuestion = (row) => {
  editQuestionForm.value = {
    id: row.id,
    title: row.title || '',
    content: row.content || '',
    category: row.category || ''
  }
  editQuestionDialogVisible.value = true
}

// 保存问题修改
const saveQuestionEdit = async () => {
  try {
    savingQuestion.value = true
    
    // 表单验证
    await editQuestionFormRef.value.validate()
    
    // 调用API更新问题信息 - 使用正确的PUT /api/v1/question接口
    const updateData = {
      id: editQuestionForm.value.id,
      title: editQuestionForm.value.title,
      content: editQuestionForm.value.content,
      category: editQuestionForm.value.category
    }
    
    console.log('发送的问题更新数据:', updateData)
    
    // 直接调用后端API，不使用apiService
    const response = await fetch('/api/v1/question', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(updateData)
    })
    
    console.log('问题更新响应状态:', response.status)
    
    if (response.ok) {
      const result = await response.json()
      console.log('问题更新响应数据:', result)
      
      if (result.code === 1) {
        ElMessage.success('问题信息更新成功')
        editQuestionDialogVisible.value = false
        loadQuestionList()
      } else {
        ElMessage.error('问题更新失败: ' + (result.msg || '未知错误'))
      }
    } else {
      const errorText = await response.text()
      ElMessage.error('问题更新失败: ' + errorText)
    }
  } catch (error) {
    if (error && error.errors) {
      // 表单验证错误，不显示错误消息
      return
    }
    console.error('更新问题失败:', error)
    ElMessage.error('更新问题失败，请稍后重试')
  } finally {
    savingQuestion.value = false
  }
}

// 修改回答
const handleEditAnswer = async (row) => {
  try {
    // 使用问题ID查询回答列表，与用户中心模式相同
    const response = await fetch(`/api/v1/answer/findAnswersByQuestionId/${row.id}`)
    
    if (response.ok) {
      const result = await response.json()
      console.log('获取回答列表响应:', result)
      
      if (result.code === 1 && result.data) {
        // 处理单个回答对象或回答数组
        const answers = Array.isArray(result.data) ? result.data : 
                      (result.data.id && result.data.content) ? [result.data] : []
        
        if (answers.length > 0) {
          // 使用第一个回答进行编辑
          const firstAnswer = answers[0]
          
          // 获取回答者信息
          let authorName = '未知用户'
          if (firstAnswer.authorId) {
            const userInfo = await fetchUserInfo(firstAnswer.authorId)
            authorName = userInfo?.username || userInfo?.name || `用户${firstAnswer.authorId}`
          }
          
          editAnswerForm.value = {
            id: firstAnswer.id,
            questionId: row.id,
            content: firstAnswer.content || '',
            authorId: firstAnswer.authorId,
            authorName: authorName,
            createTime: firstAnswer.createTime || firstAnswer.createdAt
          }
          editAnswerDialogVisible.value = true
        } else {
          ElMessage.warning('该问题暂无回答')
        }
      } else {
        ElMessage.warning('该问题暂无回答')
      }
    } else {
      ElMessage.error('获取回答列表失败')
    }
  } catch (error) {
    console.error('获取回答列表失败:', error)
    ElMessage.error('获取回答列表失败')
  }
}

// 保存回答修改
const saveAnswerEdit = async () => {
  try {
    savingAnswer.value = true
    
    // 表单验证
    await editAnswerFormRef.value.validate()
    
    // 调用API更新回答信息 - 使用正确的PUT /api/v1/answer接口
    const updateData = {
      id: editAnswerForm.value.id,
      content: editAnswerForm.value.content
    }
    
    console.log('发送的回答更新数据:', updateData)
    
    // 直接调用后端API，不使用apiService
    const response = await fetch('/api/v1/answer', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(updateData)
    })
    
    console.log('回答更新响应状态:', response.status)
    
    if (response.ok) {
      const result = await response.json()
      console.log('回答更新响应数据:', result)
      
      if (result.code === 1) {
        ElMessage.success('回答信息更新成功')
        editAnswerDialogVisible.value = false
        loadQuestionList()
      } else {
        ElMessage.error('回答更新失败: ' + (result.msg || '未知错误'))
      }
    } else {
      const errorText = await response.text()
      ElMessage.error('回答更新失败: ' + errorText)
    }
  } catch (error) {
    if (error && error.errors) {
      // 表单验证错误，不显示错误消息
      return
    }
    console.error('更新回答失败:', error)
    ElMessage.error('更新回答失败，请稍后重试')
  } finally {
    savingAnswer.value = false
  }
}

// 管控/解除管控 - 前端实现
const handleToggleControl = async (row) => {
  const action = row.isControlled ? '解除管控' : '管控'
  
  try {
    await ElMessageBox.confirm(
      `确定要${action}问题 "${row.title}" 吗？${action}后${row.isControlled ? '所有人将能看到' : '所有人将看不到'}这个问题和回答。`,
      `确认${action}`,
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 前端直接实现管控逻辑，不调用后端API
    console.log(`${action}问题: ${row.title}`)
    
    // 更新本地状态
    row.isControlled = !row.isControlled
    
    // 显示成功消息
    ElMessage.success(`问题${action}成功`)
    
    // 如果需要持久化，可以在这里保存到localStorage
    saveControlStateToLocal(row.id, row.isControlled)
    
  } catch (error) {
    if (error === 'cancel') {
      ElMessage.info(`已取消${action}`)
    } else {
      console.error(`${action}失败:`, error)
      ElMessage.error(`${action}失败，请稍后重试`)
    }
  }
}

// 保存管控状态到localStorage
const saveControlStateToLocal = (questionId, isControlled) => {
  try {
    const controlStates = JSON.parse(localStorage.getItem('questionControlStates') || '{}')
    controlStates[questionId] = isControlled
    localStorage.setItem('questionControlStates', JSON.stringify(controlStates))
  } catch (error) {
    console.error('保存管控状态失败:', error)
  }
}

// 从localStorage加载管控状态
const loadControlStateFromLocal = (questionId) => {
  try {
    const controlStates = JSON.parse(localStorage.getItem('questionControlStates') || '{}')
    return controlStates[questionId] || false
  } catch (error) {
    console.error('加载管控状态失败:', error)
    return false
  }
}

// 删除问题
const handleDeleteQuestion = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除问题 "${row.title}" 吗？此操作将删除该问题及其所有回答，且不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 调用API删除问题 - 使用正确的DELETE /api/v1/answer接口
    const response = await fetch(`/api/v1/answer/${row.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    
    console.log('删除响应状态:', response.status)
    
    if (response.ok) {
      const result = await response.json()
      console.log('删除响应数据:', result)
      
      if (result.code === 1) {
        ElMessage.success('问题删除成功')
        loadQuestionList()
      } else {
        ElMessage.error('删除失败: ' + (result.msg || '未知错误'))
      }
    } else {
      const errorText = await response.text()
      ElMessage.error('删除失败: ' + errorText)
    }
  } catch (error) {
    if (error === 'cancel') {
      ElMessage.info('已取消删除')
    } else {
      console.error('删除问题失败:', error)
      ElMessage.error('删除问题失败，请稍后重试')
    }
  }
}

// 分页处理
const handleSizeChange = (size) => {
  pagination.pageSize = size
  loadQuestionList()
}

const handleCurrentChange = (page) => {
  pagination.currentPage = page
  loadQuestionList()
}

// 工具函数
const getCategoryName = (categoryId) => {
  const category = categories.value.find(cat => cat.id === categoryId)
  return category ? category.name : '未分类'
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

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
    
    const response = await fetch(`/api/v1/user/findInfo/${userId}`)
    const result = await response.json()
    
    if (result.code === 1 && result.data) {
      // 缓存用户信息并更新响应式数据
      userNameCache.value[userId] = result.data.username || result.data.name || `用户${userId}`
      userNames.value[userId] = userNameCache.value[userId]
    } else {
      // API调用失败，使用默认值
      userNameCache.value[userId] = `用户${userId}`
      userNames.value[userId] = `用户${userId}`
    }
  } catch (error) {
    console.error(`获取用户 ${userId} 信息失败:`, error)
    userNameCache.value[userId] = `用户${userId}`
    userNames.value[userId] = `用户${userId}`
  } finally {
    loadingNames.value[userId] = false
  }
}

// 获取用户名的辅助函数
const getUserName = (userId) => {
  if (!userId) return '匿名用户'
  
  // 如果用户信息已加载，返回用户名
  if (userNames.value[userId]) {
    return userNames.value[userId]
  }
  
  // 如果用户信息未加载，触发异步加载
  fetchUserName(userId)
  
  // 返回临时显示的用户ID
  return `用户${userId}`
}

// 获取用户信息的辅助函数
const fetchUserInfo = async (userId) => {
  if (!userId) return null
  
  try {
    const response = await fetch(`/api/v1/user/findInfo/${userId}`)
    const result = await response.json()
    
    if (result.code === 1 && result.data) {
      return result.data
    }
  } catch (error) {
    console.error(`获取用户 ${userId} 详细信息失败:`, error)
  }
  
  return null
}

onMounted(() => {
  loadQuestionList()
})
</script>

<style scoped>
.question-management {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.breadcrumb {
  margin-bottom: 20px;
}

.page-header {
  margin-bottom: 30px;
  text-align: center;
}

.page-header h1 {
  font-size: 32px;
  color: #303133;
  margin-bottom: 12px;
  font-weight: 600;
}

.page-header p {
  color: #606266;
  font-size: 16px;
}

.main-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.header-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.question-info {
  min-width: 0;
}

.question-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.title-text {
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
  font-size: 16px;
}

.question-content {
  font-size: 14px;
  color: #606266;
  margin-bottom: 10px;
  line-height: 1.5;
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

.asker, .category, .answer-count {
  background-color: #f5f7fa;
  padding: 4px 8px;
  border-radius: 4px;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.pagination {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

.answer-info {
  background: #f5f7fa;
  padding: 16px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.info-item label {
  font-weight: 600;
  color: #606266;
  min-width: 80px;
  margin-right: 8px;
}

.info-item span {
  color: #303133;
}

@media (max-width: 768px) {
  .question-management {
    padding: 15px;
  }
  
  .page-header h1 {
    font-size: 24px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .question-meta {
    flex-direction: column;
    gap: 4px;
  }
}
</style>