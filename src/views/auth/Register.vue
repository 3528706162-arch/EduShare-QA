<template>
  <div class="register-container">
    <div class="register-box">
      <!-- 注册表单 -->
      <div class="register-form">
        <div class="form-header">
          <h2 class="form-title">创建账户</h2>
          <p class="form-subtitle">加入EduShare QA学习社区</p>
        </div>

        <el-form
          ref="registerFormRef"
          :model="registerForm"
          :rules="registerRules"
          size="large"
          class="form-content"
        >
          <!-- 身份选择（锁定为学生） -->
          <el-form-item prop="role">
            <el-input
              v-model="registerForm.role"
              placeholder="学生"
              disabled
              style="width: 100%"
            >
              <template #prefix>
                <el-icon><User /></el-icon>
              </template>
            </el-input>
            <div style="font-size: 12px; color: #909399; margin-top: 8px;">
              默认身份为学生，如需其他身份请联系管理员
            </div>
          </el-form-item>

          <!-- 基础信息 -->
          <el-form-item prop="username">
            <el-input
              v-model="registerForm.username"
              placeholder="请输入用户名"
              prefix-icon="User"
            />
          </el-form-item>

          <el-form-item prop="email">
            <el-input
              v-model="registerForm.email"
              placeholder="请输入邮箱"
              prefix-icon="Message"
            />
          </el-form-item>

          <el-form-item prop="phonenumber">
            <el-input
              v-model="registerForm.phonenumber"
              placeholder="请输入手机号"
              prefix-icon="Phone"
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="registerForm.password"
              type="password"
              placeholder="请输入密码"
              prefix-icon="Lock"
              show-password
            />
          </el-form-item>

          <el-form-item prop="confirmPassword">
            <el-input
              v-model="registerForm.confirmPassword"
              type="password"
              placeholder="请确认密码"
              prefix-icon="Lock"
              show-password
            />
          </el-form-item>

          <el-form-item prop="agreement">
            <el-checkbox v-model="registerForm.agreement">
              我已阅读并同意
              <el-link type="primary" :underline="false">《用户协议》</el-link>
              和
              <el-link type="primary" :underline="false">《隐私政策》</el-link>
            </el-checkbox>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              size="large"
              class="register-btn"
              :loading="loading"
              @click="handleRegister"
            >
              {{ loading ? '注册中...' : '注册' }}
            </el-button>
          </el-form-item>
        </el-form>

        <div class="form-footer">
          <p class="login-text">
            已有账户？
            <el-link type="primary" :underline="false" @click="$router.push('/login')">
              立即登录
            </el-link>
          </p>
        </div>
      </div>

      <!-- 右侧欢迎信息 -->
      <div class="welcome-section">
        <div class="welcome-content">
          <h1 class="welcome-title">欢迎加入</h1>
          <h2 class="welcome-subtitle">EduShare QA学习社区</h2>
          <p class="welcome-description">
            在这里，你可以与师生共同成长，分享知识，解决问题，
            开启你的学习新篇章。
          </p>
          <div class="benefit-list">
            <div class="benefit-item">
              <el-icon><Reading /></el-icon>
              <div>
                <h3>海量学习资源</h3>
                <p>优质课程资料、课件、习题库</p>
              </div>
            </div>
            <div class="benefit-item">
              <el-icon><ChatLineRound /></el-icon>
              <div>
                <h3>专业问答社区</h3>
                <p>师生互动，快速解决学习难题</p>
              </div>
            </div>
            <div class="benefit-item">
              <el-icon><TrendCharts /></el-icon>
              <div>
                <h3>个性化学习</h3>
                <p>根据你的专业和兴趣推荐内容</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'
import { User, Message, Phone, Lock, Reading, ChatLineRound, TrendCharts } from '@element-plus/icons-vue'

const router = useRouter()
const authStore = useAuthStore()

const registerFormRef = ref()
const loading = ref(false)

const registerForm = reactive({
  role: 'student', // 锁定为学生
  username: '',
  email: '',
  phonenumber: '',
  password: '',
  confirmPassword: '',
  agreement: false
})

// 验证规则
const registerRules = computed(() => ({
  role: [
    { required: true, message: '身份为必填项', trigger: 'blur' }
  ],
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在3-20个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
  ],
  phonenumber: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ],
  agreement: [
    { validator: (rule, value, callback) => {
        if (!value) {
          callback(new Error('请同意用户协议'))
        } else {
          callback()
        }
      }, trigger: 'change' }
  ]
}))

// 确认密码验证
const validateConfirmPassword = (rule, value, callback) => {
  if (value !== registerForm.password) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

// 处理注册
const handleRegister = async () => {
  if (!registerFormRef.value) return
  
  try {
    const valid = await registerFormRef.value.validate()
    if (!valid) return
    
    loading.value = true
    
    // 准备注册数据，符合后端要求的格式
    const registerData = {
      username: registerForm.username,
      email: registerForm.email,
      password: registerForm.password,
      role: registerForm.role,
      phonenumber: registerForm.phonenumber,
      createdAt: new Date().toISOString()
    }
    
    // 直接调用后端注册API
    const response = await fetch('/api/v1/user/Register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registerData)
    })
    
    if (response.ok) {
      const result = await response.json()
      if (result.code === 1) {
        ElMessage.success('注册成功，请登录')
        router.push('/login')
      } else {
        ElMessage.error(result.msg || '注册失败')
      }
    } else {
      ElMessage.error('注册失败，请检查网络连接')
    }
  } catch (error) {
    console.error('注册失败:', error)
    ElMessage.error('注册失败，请检查输入')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.register-box {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  display: flex;
  width: 1000px;
  max-width: 90vw;
  min-height: 600px;
  overflow: hidden;
}

.register-form {
  flex: 1.2;
  padding: 40px;
  overflow-y: auto;
  max-height: 600px;
}

.form-header {
  text-align: center;
  margin-bottom: 30px;
}

.form-title {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.form-subtitle {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.form-content {
  margin-bottom: 20px;
}

.user-type-group {
  width: 100%;
  display: flex;
}

.user-type-group .el-radio-button {
  flex: 1;
}

.register-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
}

.form-footer {
  text-align: center;
}

.login-text {
  color: #606266;
  font-size: 14px;
  margin: 0;
}

.welcome-section {
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 60px 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.welcome-content {
  text-align: center;
}

.welcome-title {
  font-size: 36px;
  font-weight: 700;
  margin: 0 0 16px 0;
}

.welcome-subtitle {
  font-size: 18px;
  font-weight: 400;
  margin: 0 0 30px 0;
  opacity: 0.9;
}

.welcome-description {
  font-size: 14px;
  line-height: 1.6;
  margin: 0 0 40px 0;
  opacity: 0.8;
  max-width: 300px;
}

.benefit-list {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.benefit-item {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  text-align: left;
}

.benefit-item .el-icon {
  font-size: 24px;
  margin-top: 4px;
  flex-shrink: 0;
}

.benefit-item h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
}

.benefit-item p {
  margin: 0;
  font-size: 14px;
  opacity: 0.8;
  line-height: 1.4;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .register-box {
    flex-direction: column;
    width: 100%;
  }
  
  .welcome-section {
    display: none;
  }
  
  .register-form {
    padding: 30px 20px;
    max-height: none;
  }
  
  .user-type-group {
    flex-direction: column;
  }
}
</style>