<template>
  <div class="ask-question">
    <div class="breadcrumb">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/questions' }">问答社区</el-breadcrumb-item>
        <el-breadcrumb-item>提问</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <el-card class="ask-card">
      <template #header>
        <div class="card-header">
          <h2>提出您的问题</h2>
          <p>清晰的问题描述有助于获得更准确的回答</p>
        </div>
      </template>

      <el-form
        ref="questionForm"
        :model="form"
        :rules="rules"
        label-width="120px"
        label-position="top"
      >
        <el-form-item label="问题标题" prop="title">
          <el-input
            v-model="form.title"
            placeholder="请用一句话描述您的问题"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="问题描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="8"
            placeholder="请详细描述您的问题背景、遇到的困难、尝试过的解决方案等..."
            maxlength="2000"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="问题分类" prop="category">
          <el-select v-model="form.category" placeholder="请选择问题分类" style="width: 100%">
            <el-option label="编程技术" value="programming"></el-option>
            <el-option label="前端开发" value="frontend"></el-option>
            <el-option label="后端开发" value="backend"></el-option>
            <el-option label="数据库" value="database"></el-option>
            <el-option label="算法与数据结构" value="algorithm"></el-option>
            <el-option label="系统设计" value="system-design"></el-option>
            <el-option label="工具使用" value="tools"></el-option>
            <el-option label="学习建议" value="learning"></el-option>
            <el-option label="其他" value="other"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="问题标签" prop="tags">
          <el-tag
            v-for="tag in form.tags"
            :key="tag"
            closable
            :disable-transitions="false"
            @close="removeTag(tag)"
          >
            {{ tag }}
          </el-tag>
          <el-input
            v-if="inputVisible"
            ref="InputRef"
            v-model="inputValue"
            class="tag-input"
            size="small"
            @keyup.enter="handleInputConfirm"
            @blur="handleInputConfirm"
          />
          <el-button v-else class="button-new-tag" size="small" @click="showInput">
            + 添加标签
          </el-button>
          <div class="tag-tips">
            <small>添加相关标签有助于问题被更快发现和回答（最多5个标签）</small>
          </div>
        </el-form-item>

        <el-form-item label="悬赏积分" prop="rewardPoints">
          <el-input-number
            v-model="form.rewardPoints"
            :min="0"
            :max="100"
            :step="5"
            placeholder="设置悬赏积分（可选）"
          />
          <div class="points-tips">
            <small>设置悬赏积分可以吸引更多回答者，积分将从您的账户扣除</small>
          </div>
        </el-form-item>

        <el-form-item label="附件" prop="attachments">
          <el-upload
            class="upload-demo"
            drag
            :action="uploadUrl"
            :headers="uploadHeaders"
            :before-upload="beforeUpload"
            :on-success="handleSuccess"
            :on-error="handleError"
            :file-list="fileList"
            :limit="3"
            multiple
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              将文件拖到此处，或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                支持图片、代码文件等格式，单个文件不超过 10MB，最多上传3个文件
              </div>
            </template>
          </el-upload>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitForm" :loading="submitting">
            发布问题
          </el-button>
          <el-button @click="saveDraft">保存草稿</el-button>
          <el-button @click="resetForm">重置</el-button>
          <el-button @click="goBack">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 提问指南 -->
    <el-card class="guide-card">
      <template #header>
        <h3>提问指南</h3>
      </template>
      <div class="guide-content">
        <h4>如何提出一个好问题？</h4>
        <ul>
          <li><strong>标题明确：</strong>用一句话清晰描述问题核心</li>
          <li><strong>描述详细：</strong>包括问题背景、错误信息、尝试过的解决方案</li>
          <li><strong>代码示例：</strong>提供相关的代码片段或错误日志</li>
          <li><strong>环境信息：</strong>说明使用的技术栈、版本信息等</li>
          <li><strong>标签准确：</strong>选择合适的标签帮助问题分类</li>
        </ul>
        
        <h4>避免的问题：</h4>
        <ul>
          <li>问题描述过于简单或模糊</li>
          <li>直接要求代写作业或项目</li>
          <li>重复提问已有答案的问题</li>
          <li>涉及敏感或违法内容</li>
        </ul>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useQuestionsStore } from '@/stores/questions'
import { UploadFilled } from '@element-plus/icons-vue'

const router = useRouter()
const questionsStore = useQuestionsStore()

const questionForm = ref()
const InputRef = ref()

const form = reactive({
  title: '',
  description: '',
  category: '',
  tags: [],
  rewardPoints: 0,
  attachments: []
})

const rules = reactive({
  title: [
    { required: true, message: '请输入问题标题', trigger: 'blur' },
    { min: 10, max: 100, message: '标题长度在 10 到 100 个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入问题描述', trigger: 'blur' },
    { min: 20, message: '描述内容至少20个字符', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择问题分类', trigger: 'change' }
  ],
  tags: [
    { 
      validator: (rule, value, callback) => {
        if (value.length > 5) {
          callback(new Error('最多只能添加5个标签'))
        } else {
          callback()
        }
      }, 
      trigger: 'change' 
    }
  ]
})

const fileList = ref([])
const inputVisible = ref(false)
const inputValue = ref('')
const submitting = ref(false)

const uploadUrl = ref('/api/questions/upload')
const uploadHeaders = ref({
  Authorization: `Bearer ${localStorage.getItem('token')}`
})

const removeTag = (tag) => {
  form.tags = form.tags.filter(t => t !== tag)
}

const showInput = () => {
  inputVisible.value = true
  nextTick(() => {
    InputRef.value.focus()
  })
}

const handleInputConfirm = () => {
  if (inputValue.value && !form.tags.includes(inputValue.value) && form.tags.length < 5) {
    form.tags.push(inputValue.value)
  }
  inputVisible.value = false
  inputValue.value = ''
}

const beforeUpload = (file) => {
  const isLt10M = file.size / 1024 / 1024 < 10
  if (!isLt10M) {
    ElMessage.error('文件大小不能超过 10MB!')
    return false
  }
  
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/plain',
    'application/javascript',
    'text/html',
    'text/css',
    'application/json'
  ]
  
  if (!allowedTypes.includes(file.type)) {
    ElMessage.error('不支持的文件格式!')
    return false
  }
  
  return true
}

const handleSuccess = (response, file) => {
  form.attachments.push({
    name: file.name,
    url: response.data.url
  })
  ElMessage.success('文件上传成功!')
}

const handleError = (error, file) => {
  ElMessage.error('文件上传失败!')
}

const submitForm = async () => {
  if (!questionForm.value) return
  
  try {
    const valid = await questionForm.value.validate()
    if (!valid) return
    
    submitting.value = true
    
    const questionData = {
      title: form.title,
      description: form.description,
      category: form.category,
      tags: form.tags,
      rewardPoints: form.rewardPoints,
      attachments: form.attachments
    }
    
    const result = await questionsStore.createQuestion(questionData)
    if (result.success) {
      ElMessage.success('问题发布成功!')
      router.push('/questions')
    } else {
      ElMessage.error('问题发布失败: ' + result.error)
    }
  } catch (error) {
    console.error('提交问题失败:', error)
    ElMessage.error('提交失败，请重试')
  } finally {
    submitting.value = false
  }
}

const saveDraft = () => {
  // 保存草稿逻辑
  const draft = {
    title: form.title,
    description: form.description,
    category: form.category,
    tags: form.tags,
    rewardPoints: form.rewardPoints,
    attachments: form.attachments,
    saveTime: new Date().toISOString()
  }
  
  localStorage.setItem('questionDraft', JSON.stringify(draft))
  ElMessage.success('草稿保存成功!')
}

const resetForm = () => {
  if (questionForm.value) {
    questionForm.value.resetFields()
  }
  form.tags = []
  form.attachments = []
  fileList.value = []
}

const goBack = () => {
  router.push('/questions')
}

const loadDraft = () => {
  const draft = localStorage.getItem('questionDraft')
  if (draft) {
    try {
      const draftData = JSON.parse(draft)
      form.title = draftData.title || ''
      form.description = draftData.description || ''
      form.category = draftData.category || ''
      form.tags = draftData.tags || []
      form.rewardPoints = draftData.rewardPoints || 0
      form.attachments = draftData.attachments || []
      
      ElMessage.info('检测到未保存的草稿，已自动加载')
    } catch (error) {
      console.error('加载草稿失败:', error)
    }
  }
}

onMounted(() => {
  loadDraft()
})
</script>

<style scoped>
.ask-question {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
}

.breadcrumb {
  margin-bottom: 20px;
}

.ask-card {
  margin-bottom: 30px;
}

.card-header {
  text-align: center;
}

.card-header h2 {
  font-size: 24px;
  color: #303133;
  margin-bottom: 8px;
}

.card-header p {
  font-size: 14px;
  color: #606266;
}

:deep(.el-form-item__label) {
  font-weight: 600;
  color: #303133;
}

.tag-input {
  width: 90px;
  margin-left: 8px;
  vertical-align: bottom;
}

.button-new-tag {
  margin-left: 8px;
  height: 24px;
  line-height: 22px;
  padding-top: 0;
  padding-bottom: 0;
}

.tag-tips, .points-tips {
  margin-top: 8px;
  color: #909399;
}

.guide-card {
  margin-top: 30px;
}

.guide-content h4 {
  color: #303133;
  margin-bottom: 12px;
}

.guide-content ul {
  color: #606266;
  line-height: 1.6;
  margin-bottom: 20px;
}

.guide-content li {
  margin-bottom: 8px;
}

:deep(.el-upload-dragger) {
  width: 100%;
  height: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

:deep(.el-icon--upload) {
  font-size: 48px;
  color: #409eff;
  margin-bottom: 16px;
}

:deep(.el-upload__text) {
  font-size: 14px;
  color: #606266;
  text-align: center;
}

:deep(.el-upload__tip) {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}

@media (max-width: 768px) {
  .ask-question {
    padding: 15px;
  }
  
  :deep(.el-form-item__label) {
    font-size: 14px;
  }
  
  .guide-content {
    font-size: 14px;
  }
}
</style>