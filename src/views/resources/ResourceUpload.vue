<template>
  <div class="resource-upload">
    <div class="breadcrumb">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/resources' }">学习资源</el-breadcrumb-item>
        <el-breadcrumb-item>上传资源</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <el-card class="upload-card">
      <template #header>
        <div class="card-header">
          <h2>上传学习资源</h2>
          <p>分享您的优质学习资料，帮助他人学习成长</p>
        </div>
      </template>

      <el-form
        ref="uploadForm"
        :model="form"
        :rules="rules"
        label-width="120px"
        label-position="top"
      >
        <el-form-item label="资源标题" prop="title">
          <el-input
            v-model="form.title"
            placeholder="请输入资源标题"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="资源描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="请输入资源详细描述"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="所属课程" prop="courseId">
          <el-select v-model="form.courseId" placeholder="请选择课程" style="width: 100%">
            <el-option
              v-for="course in courses"
              :key="course.id"
              :label="course.title"
              :value="course.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="资源标签" prop="tags">
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
        </el-form-item>

        <el-form-item label="上传文件" prop="file">
          <el-upload
            ref="upload"
            class="upload-demo"
            drag
            :action="uploadUrl"
            :headers="uploadHeaders"
            :before-upload="beforeUpload"
            :on-success="handleSuccess"
            :on-error="handleError"
            :on-progress="handleProgress"
            :file-list="fileList"
            :limit="1"
            :auto-upload="false"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              将文件拖到此处，或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                支持 PDF、Word、Excel、PPT、图片等格式，单个文件不超过 100MB
              </div>
            </template>
          </el-upload>
          
          <div v-if="uploadProgress > 0" class="upload-progress">
            <el-progress 
              :percentage="uploadProgress" 
              :status="uploadStatus"
              :stroke-width="8"
            />
          </div>
        </el-form-item>

        <el-form-item v-if="canSetAccessLevel" label="访问权限" prop="accessLevel">
          <el-radio-group v-model="form.accessLevel">
            <el-radio label="public">公开</el-radio>
            <el-radio label="private">仅自己可见</el-radio>
            <el-radio label="restricted">指定用户可见</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-else>
          <el-alert
            title="学生用户只能上传公开资源"
            type="info"
            :closable="false"
            show-icon
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitForm" :loading="submitting">
            提交资源
          </el-button>
          <el-button @click="resetForm">重置</el-button>
          <el-button @click="goBack">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useResourcesStore } from '@/stores/resources'
import { useAuthStore } from '@/stores/auth'
import apiService from '@/services/api'
import { UploadFilled } from '@element-plus/icons-vue'

const router = useRouter()
const resourcesStore = useResourcesStore()
const authStore = useAuthStore()

// 计算属性：判断用户是否有权限设置访问权限
const canSetAccessLevel = computed(() => {
  return authStore.userRole === 'teacher' || authStore.userRole === 'admin'
})

const uploadForm = ref()
const upload = ref()
const InputRef = ref()

const form = reactive({
  title: '',
  description: '',
  courseId: '',
  tags: [],
  file: null,
  fileUrl: '',
  accessLevel: 'public'
})

const rules = reactive({
  title: [
    { required: true, message: '请输入资源标题', trigger: 'blur' },
    { min: 2, max: 100, message: '标题长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入资源描述', trigger: 'blur' },
    { min: 10, max: 500, message: '描述长度在 10 到 500 个字符', trigger: 'blur' }
  ],
  courseId: [
    { required: true, message: '请选择所属课程', trigger: 'change' }
  ],
  file: [
    { required: true, message: '请上传资源文件', trigger: 'change' }
  ]
})

const courses = ref([])
const fileList = ref([])
const inputVisible = ref(false)
const inputValue = ref('')
const uploadProgress = ref(0)
const uploadStatus = ref('')
const submitting = ref(false)

const uploadUrl = ref('/api/v1/Fileupload')
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
  if (inputValue.value && !form.tags.includes(inputValue.value)) {
    form.tags.push(inputValue.value)
  }
  inputVisible.value = false
  inputValue.value = ''
}

const beforeUpload = (file) => {
  const isLt100M = file.size / 1024 / 1024 < 100
  if (!isLt100M) {
    ElMessage.error('文件大小不能超过 100MB!')
    return false
  }
  
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/plain'
  ]
  
  if (!allowedTypes.includes(file.type)) {
    ElMessage.error('不支持的文件格式!')
    return false
  }
  
  form.file = file
  return true
}

const handleSuccess = (response, file) => {
  uploadProgress.value = 100
  uploadStatus.value = 'success'
  
  // 后端返回标准格式：{success: boolean, data: url}
  if (response && response.success && response.data) {
    form.fileUrl = response.data // 保存云端文件URL
    ElMessage.success('文件上传成功!')
  } else {
    ElMessage.error('文件上传失败: ' + (response?.message || '未获得文件URL'))
  }
}

const handleError = (error, file) => {
  uploadProgress.value = 0
  uploadStatus.value = 'exception'
  ElMessage.error('文件上传失败!')
}

const handleProgress = (event, file) => {
  uploadProgress.value = Math.round(event.percent)
}

const submitForm = async () => {
  if (!uploadForm.value) return
  
  try {
    const valid = await uploadForm.value.validate()
    if (!valid) return
    
    if (!form.file) {
      ElMessage.error('请上传资源文件')
      return
    }
    
    submitting.value = true
    
    // 先上传文件到阿里云OSS
    await upload.value.submit()
    
    // 检查是否已获得云端文件URL
    if (!form.fileUrl) {
      ElMessage.error('文件上传失败，请重新上传')
      return
    }
    
    // 创建资源记录，包含云端文件URL
    const resourceData = {
      title: form.title,
      description: form.description,
      courseId: form.courseId,
      tags: form.tags,
      accessLevel: form.accessLevel,
      fileUrl: form.fileUrl // 云端文件URL
    }
    
    const result = await resourcesStore.createResource(resourceData)
    if (result.success) {
      ElMessage.success('资源上传成功!')
      router.push('/resources')
    } else {
      ElMessage.error('资源创建失败: ' + result.error)
    }
  } catch (error) {
    console.error('提交表单失败:', error)
    ElMessage.error('提交失败，请重试')
  } finally {
    submitting.value = false
  }
}

const resetForm = () => {
  if (uploadForm.value) {
    uploadForm.value.resetFields()
  }
  form.tags = []
  fileList.value = []
  uploadProgress.value = 0
  uploadStatus.value = ''
}

const goBack = () => {
  router.push('/resources')
}

const loadCourses = async () => {
  try {
    const response = await apiService.courses.list()
    if (response.success && response.data?.code === 1) {
      courses.value = response.data.data
    } else {
      console.error('加载课程列表失败:', response.data?.msg)
    }
  } catch (error) {
    console.error('加载课程列表失败:', error)
  }
}

onMounted(() => {
  loadCourses()
})
</script>

<style scoped>
.resource-upload {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.breadcrumb {
  margin-bottom: 20px;
}

.upload-card {
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

.upload-progress {
  margin-top: 16px;
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
  .resource-upload {
    padding: 15px;
  }
  
  :deep(.el-form-item__label) {
    font-size: 14px;
  }
}
</style>