<template>
  <div class="question-list">
    <!-- 页面标题和按钮区域 -->
    <div class="page-header-section">
      <div class="header-top">
        <h1>问答社区</h1>
        <p>分享知识，解决问题，共同成长</p>
        <div class="header-actions">
          <el-button 
            v-if="!isTeacher && !showTeacherQuestions" 
            type="primary" 
            :icon="Plus" 
            @click="askQuestion"
          >
            提问
          </el-button>
        </div>
      </div>
      
      <!-- 教师回答问题按钮 -->
      <div v-if="isTeacher && !showTeacherQuestions" class="teacher-action-section">
        <el-button 
          type="primary" 
          :icon="ChatDotRound" 
          class="teacher-answer-button"
          @click="loadTeacherQuestions"
          :loading="loadingTeacherQuestions"
        >
          回答问题
        </el-button>
      </div>
      
      <div v-if="showTeacherQuestions" class="teacher-action-section">
        <el-button 
          type="default" 
          :icon="ArrowLeft" 
          @click="showAllQuestions"
        >
          返回全部问题
        </el-button>
      </div>
    </div>

    <!-- 搜索和筛选区域 -->
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
        </el-col>
      </el-row>
    </div>

    <div class="question-container">
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="5" animated />
      </div>

      <!-- 教师回答问题模式 -->
      <div v-if="showTeacherQuestions" class="teacher-questions-section">
        <div class="teacher-questions-header">
          <h3>待回答问题</h3>
        </div>
        
        <!-- 待回答问题列表 -->
        <div v-if="teacherQuestions.length > 0" class="teacher-questions-list">
          <div 
            v-for="question in teacherQuestions" 
            :key="question.id" 
            class="teacher-question-item"
          >
            <div class="question-header" @click="toggleAnswerForm(question.id)">
              <h4 class="question-title">{{ question.title }}</h4>
              <el-tag 
                v-if="question.status === 'pending'" 
                type="warning" 
                size="small"
              >
                待回答
              </el-tag>
            </div>
            <div class="question-content" @click="toggleAnswerForm(question.id)">
              {{ question.content }}
            </div>
            <div class="question-meta" @click="toggleAnswerForm(question.id)">
              <span class="question-author">提问者：{{ getUserName(question.authorId) || '未知用户' }}</span>
              <span class="question-course">课程：{{ question.classBelong || '未指定' }}</span>
              <span class="question-time">{{ formatTime(question.createdAt) }}</span>
            </div>
            
            <!-- 回答问题表单 -->
            <div v-if="showAnswerForm === question.id" class="answer-form-section">
              <el-divider />
              <h4>回答问题</h4>
              <el-form :model="answerForm" :rules="answerRules" ref="answerFormRef" label-width="80px">
                <el-form-item label="回答内容" prop="content">
                  <el-input
                    v-model="answerForm.content"
                    type="textarea"
                    :rows="4"
                    placeholder="请输入详细的回答内容..."
                    maxlength="1000"
                    show-word-limit
                  />
                </el-form-item>
                
                <el-form-item label="附件上传">
                  <el-upload
                    class="upload-demo"
                    action="/api/v1/Fileupload"
                    :on-success="handleUploadSuccess"
                    :on-error="handleUploadError"
                    :before-upload="beforeUpload"
                    :limit="1"
                    :file-list="answerForm.fileList"
                  >
                    <el-button type="primary">点击上传</el-button>
                    <template #tip>
                      <div class="el-upload__tip">支持图片、文档等文件格式</div>
                    </template>
                  </el-upload>
                </el-form-item>
                
                <el-form-item>
                  <el-button type="primary" @click="submitAnswer(question.id)" :loading="submittingAnswer">
                    提交回答
                  </el-button>
                  <el-button @click="cancelAnswer">取消</el-button>
                </el-form-item>
              </el-form>
            </div>
          </div>
        </div>
        
        <!-- 空状态 -->
        <div v-else class="empty-state">
          <el-empty description="暂无待回答问题">
            <el-button type="primary" @click="showAllQuestions">查看全部问题</el-button>
          </el-empty>
        </div>
      </div>

      <!-- 普通模式 -->
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
                  v-if="isQuestionSolved(question.isSolved)" 
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuestionsStore } from '@/stores/questions'
import { useAuthStore } from '@/stores/auth'
import { Search, Plus, Picture, ChatDotRound, ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const questionsStore = useQuestionsStore()
const authStore = useAuthStore()

const searchKeyword = ref('')
const filterStatus = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)

// 教师相关变量
const isTeacher = computed(() => authStore.userRole === 'teacher')
const teacherQuestions = ref([])
const loadingTeacherQuestions = ref(false)
const showTeacherQuestions = ref(false)

// 回答问题相关变量
const showAnswerForm = ref(null) // 当前显示回答表单的问题ID
const submittingAnswer = ref(false)
const answerForm = ref({
  content: '',
  fileList: [],
  fileUrl: ''
})
const answerFormRef = ref(null)

// 表单验证规则
const answerRules = {
  content: [
    { required: true, message: '请输入回答内容', trigger: ['blur', 'change'] },
    { min: 10, message: '回答内容至少10个字符', trigger: ['blur', 'change'] }
  ]
}

const questions = computed(() => questionsStore.questions)
const total = computed(() => questionsStore.pagination.total)

// 用户名称缓存
const userNameCache = ref({})
const loadingNames = ref({})
const userNames = ref({})

// 判断问题是否已解决
const isQuestionSolved = (isSolved) => {
  // 处理字符串类型的"0"和"1"，以及可能的布尔值
  return isSolved === true || isSolved === '1' || isSolved === 1
}

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

// 获取教师姓名（从teacher表中获取）
const getTeacherName = async () => {
  try {
    // 根据当前登录的用户名获取教师信息
    const username = authStore.userName
    if (!username) {
      console.warn('用户名不存在')
      return null
    }
    
    // 调用后端API获取教师信息
    const response = await fetch(`/api/v1/teacher/getInfoByUsername/${encodeURIComponent(username)}`)
    const result = await response.json()
    
    if (result.code === 1 && result.data) {
      return result.data.name // 返回teacher表中的name字段
    } else {
      console.warn('获取教师信息失败:', result.msg)
      return null
    }
  } catch (error) {
    console.error('获取教师信息失败:', error)
    return null
  }
}

// 加载教师待回答问题
const loadTeacherQuestions = async () => {
  if (!isTeacher.value) {
    console.warn('当前用户不是教师')
    return
  }
  
  loadingTeacherQuestions.value = true
  try {
    // 获取教师姓名
    const teacherName = await getTeacherName()
    if (!teacherName) {
      console.warn('无法获取教师姓名')
      teacherQuestions.value = []
      return
    }
    
    // 调用后端API获取待回答问题
    const response = await fetch(`/api/v1/question/findQuestionByTeacherName/${encodeURIComponent(teacherName)}`)
    const result = await response.json()
    
    if (result.code === 1 && result.data) {
      teacherQuestions.value = Array.isArray(result.data) ? result.data : [result.data]
      
      // 预加载教师问题中的用户名
      if (teacherQuestions.value.length > 0) {
        teacherQuestions.value.forEach(question => {
          if (question.authorId) {
            fetchUserName(question.authorId)
          }
        })
      }
      
      // 切换到教师模式
      showTeacherQuestions.value = true
    } else {
      teacherQuestions.value = []
      showTeacherQuestions.value = true
      console.warn('获取教师待回答问题失败:', result.msg)
    }
  } catch (error) {
    console.error('获取教师待回答问题失败:', error)
    teacherQuestions.value = []
    showTeacherQuestions.value = true
  } finally {
    loadingTeacherQuestions.value = false
  }
}

// 返回全部问题模式
const showAllQuestions = () => {
  showTeacherQuestions.value = false
  teacherQuestions.value = []
  // 清除URL参数
  router.replace({ path: '/questions', query: {} })
}

// 监听URL参数变化
watch(() => route.query.teacherMode, (newVal) => {
  if (newVal === 'true' && isTeacher.value && !showTeacherQuestions.value) {
    // 自动进入教师回答问题模式
    loadTeacherQuestions()
  }
})

// 检查URL参数并自动进入教师模式
const checkUrlParams = () => {
  if (route.query.teacherMode === 'true' && isTeacher.value) {
    loadTeacherQuestions()
  }
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

// 切换回答表单显示/隐藏
const toggleAnswerForm = (questionId) => {
  if (showAnswerForm.value === questionId) {
    // 如果当前已经显示，则隐藏
    showAnswerForm.value = null
    resetAnswerForm()
  } else {
    // 显示新的回答表单
    showAnswerForm.value = questionId
    resetAnswerForm()
  }
}

// 重置回答表单
const resetAnswerForm = () => {
  answerForm.value = {
    content: '',
    fileList: [],
    fileUrl: ''
  }
}

// 取消回答
const cancelAnswer = () => {
  showAnswerForm.value = null
  resetAnswerForm()
}

// 文件上传成功处理
const handleUploadSuccess = (response, file, fileList) => {
  console.log('文件上传成功:', response)
  if (response.code === 1 && response.data) {
    answerForm.value.fileUrl = response.data
    answerForm.value.fileList = fileList
    ElMessage.success('文件上传成功')
  } else {
    ElMessage.error('文件上传失败：' + (response.msg || '未知错误'))
  }
}

// 文件上传失败处理
const handleUploadError = (error, file, fileList) => {
  console.error('文件上传失败:', error)
  ElMessage.error('文件上传失败')
}

// 文件上传前检查
const beforeUpload = (file) => {
  const isLt10M = file.size / 1024 / 1024 < 10
  if (!isLt10M) {
    ElMessage.error('文件大小不能超过10MB')
    return false
  }
  return true
}

// 提交回答
const submitAnswer = async (questionId) => {
  // 手动验证表单前先检查内容长度
  console.log('当前回答内容:', answerForm.value.content)
  console.log('内容长度:', answerForm.value.content.length)
  
  // 手动检查内容长度
  if (!answerForm.value.content || answerForm.value.content.trim().length < 10) {
    ElMessage.error(`回答内容至少需要10个字符，当前只有${answerForm.value.content?.length || 0}个字符`)
    return
  }
  
  // 直接提交，跳过表单验证
  console.log('内容验证通过，直接提交')
  
  submittingAnswer.value = true
  
  try {
    // 构建请求体
    console.log('authStore.user:', authStore.user)
    console.log('authStore.userInfo:', authStore.userInfo)
    console.log('authStore.userName:', authStore.userName)
    console.log('authStore.userRole:', authStore.userRole)
    
    // 从Proxy对象中提取实际数据
    const userData = authStore.user?.value || authStore.userInfo?.value
    console.log('userData:', userData)
    
    // 获取用户ID - 尝试多种可能的字段名
    const authorId = userData?.id || userData?.userId || userData?.user_id
    
    console.log('获取到的authorId:', authorId)
    
    // 如果仍然获取不到，尝试从localStorage获取
    let finalAuthorId = authorId
    if (!finalAuthorId) {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser)
        console.log('localStorage中的用户数据:', parsedUser)
        finalAuthorId = parsedUser.id || parsedUser.userId || parsedUser.user_id
        if (finalAuthorId) {
          console.log('从localStorage获取的authorId:', finalAuthorId)
        }
      }
    }
    
    const requestBody = {
      content: answerForm.value.content,
      authorId: finalAuthorId,
      questionId: questionId,
      fileUrl: answerForm.value.fileUrl || ''
    }
    
    console.log('最终提交回答请求体:', requestBody)
    
    // 调用后端API提交回答
    const response = await fetch('/api/v1/answer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })
    
    const result = await response.json()
    console.log('提交回答响应:', result)
    
    if (result.code === 1) {
      ElMessage.success('回答提交成功')
      // 隐藏回答表单
      showAnswerForm.value = null
      resetAnswerForm()
      
      // 重新加载待回答问题列表
      await loadTeacherQuestions()
    } else {
      ElMessage.error('提交回答失败：' + (result.msg || '未知错误'))
    }
  } catch (error) {
    console.error('提交回答失败:', error)
    ElMessage.error('提交回答失败，请稍后重试')
  } finally {
    submittingAnswer.value = false
  }
}

onMounted(() => {
  loadQuestions()
  // 检查URL参数并自动进入教师模式
  checkUrlParams()
})
</script>

<style scoped>
.question-list {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.page-header-section {
  margin-bottom: 20px;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.header-top h1 {
  font-size: 2.5rem;
  color: #303133;
  margin-bottom: 5px;
  margin-right: 20px;
}

.header-top p {
  font-size: 1.1rem;
  color: #606266;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.teacher-action-section {
  margin-top: 10px;
  margin-bottom: 15px;
}

.teacher-answer-button {
  margin-right: 10px;
}

/* 教师回答问题区域样式 */
.teacher-answer-section {
  background: linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%);
  border: 1px solid #91d5ff;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 30px;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.1);
}

.teacher-answer-header .top-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.left-actions {
  display: flex;
  align-items: center;
  margin-right: auto;
}

.right-actions {
  display: flex;
  align-items: center;
  margin-left: auto;
}

.teacher-answer-button {
  margin-right: 10px;
}

.teacher-answer-header h2 {
  color: #1890ff;
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.teacher-questions {
  margin-top: 20px;
}

.teacher-questions h3 {
  color: #1890ff;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #91d5ff;
}

.teacher-question-items {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.teacher-question-item {
  background: white;
  border: 1px solid #e6f7ff;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.teacher-question-item:hover {
  border-color: #40a9ff;
  box-shadow: 0 4px 8px rgba(24, 144, 255, 0.15);
  transform: translateY(-2px);
}

.teacher-question-main {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.teacher-question-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.teacher-question-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
  margin: 0;
  flex: 1;
  margin-right: 16px;
}

.teacher-question-status {
  flex-shrink: 0;
}

.teacher-question-content {
  margin-bottom: 0;
}

.teacher-question-description {
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin: 0;
}

.teacher-question-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.teacher-question-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #909399;
  flex-wrap: wrap;
}

.teacher-empty {
  text-align: center;
  padding: 40px 0;
}

.teacher-empty p {
  color: #606266;
  margin-top: 8px;
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

/* 回答表单样式 */
.answer-form-section {
  margin-top: 16px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.answer-form-section h4 {
  color: #1890ff;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
}

.answer-form-section .el-form-item {
  margin-bottom: 20px;
}

.answer-form-section .el-textarea__inner {
  resize: vertical;
  min-height: 100px;
}

.answer-form-section .el-upload {
  width: 100%;
}

.answer-form-section .el-upload-dragger {
  width: 100%;
}

.answer-form-section .el-button {
  margin-right: 10px;
}

/* 教师问题列表样式 */
.teacher-questions-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.teacher-question-item {
  background: white;
  border: 1px solid #e6f7ff;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.teacher-question-item:hover {
  border-color: #40a9ff;
  box-shadow: 0 4px 8px rgba(24, 144, 255, 0.15);
  transform: translateY(-2px);
}

.teacher-question-item .question-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.teacher-question-item .question-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
  margin: 0;
  flex: 1;
  margin-right: 16px;
}

.teacher-question-item .question-content {
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
  margin-bottom: 12px;
}

.teacher-question-item .question-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #909399;
  flex-wrap: wrap;
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
  
  /* 教师回答问题区域移动端适配 */
  .teacher-answer-section {
    padding: 16px;
    margin-bottom: 20px;
  }
  
  .teacher-answer-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .teacher-answer-header h2 {
    font-size: 20px;
  }
  
  .teacher-question-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .teacher-question-title {
    margin-right: 0;
    margin-bottom: 0;
  }
  
  .teacher-question-footer {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .teacher-question-meta {
    gap: 8px;
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