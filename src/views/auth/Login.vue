<template>
  <div class="login-container">
    <div class="login-box">
      <!-- 登录表单 -->
      <div class="login-form">
        <div class="form-header">
          <h2 class="form-title">欢迎回来</h2>
          <p class="form-subtitle">登录您的EduShare QA账户</p>
        </div>

        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          size="large"
          class="form-content"
        >
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="请输入用户名或邮箱"
              prefix-icon="User"
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              prefix-icon="Lock"
              show-password
              @keyup.enter="handleLogin"
            />
          </el-form-item>

          <el-form-item>
            <div class="form-options">
              <el-checkbox v-model="rememberMe">记住我</el-checkbox>
              <el-link type="primary" :underline="false">忘记密码？</el-link>
            </div>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              size="large"
              class="login-btn"
              :loading="loading"
              @click="handleLogin"
            >
              {{ loading ? '登录中...' : '登录' }}
            </el-button>
          </el-form-item>
        </el-form>

        <div class="form-footer">
          <p class="register-text">
            还没有账户？
            <el-link type="primary" :underline="false" @click="$router.push('/register')">
              立即注册
            </el-link>
          </p>
        </div>

        <!-- 角色选择演示 -->
        <div class="demo-login" v-if="showDemoLogin">
          <el-divider>演示登录</el-divider>
          <div class="demo-buttons">
            <el-button 
              v-for="role in demoRoles" 
              :key="role.value"
              :type="role.type"
              size="small"
              @click="demoLogin(role)"
            >
              {{ role.label }}登录
            </el-button>
          </div>
        </div>
      </div>

      <!-- 右侧欢迎信息 -->
      <div class="welcome-section">
        <div class="welcome-content">
          <h1 class="welcome-title">EduShare QA</h1>
          <h2 class="welcome-subtitle">大学生线上学习资源共享与问答系统</h2>
          <p class="welcome-description">
            连接知识，分享智慧，共同成长。在这里，你可以找到优质的学习资源，
            解决学习难题，与师生互动交流。
          </p>
          <div class="feature-list">
            <div class="feature-item">
              <el-icon><Collection /></el-icon>
              <span>海量学习资源</span>
            </div>
            <div class="feature-item">
              <el-icon><ChatDotRound /></el-icon>
              <span>专业问答社区</span>
            </div>
            <div class="feature-item">
              <el-icon><User /></el-icon>
              <span>师生互动交流</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'
import { User, Lock, Collection, ChatDotRound } from '@element-plus/icons-vue'

const router = useRouter()
const authStore = useAuthStore()

const loginFormRef = ref()
const loading = ref(false)
const rememberMe = ref(false)
const showDemoLogin = ref(false) // 移除演示登录

const loginForm = reactive({
  username: '',
  password: ''
})

const loginRules = reactive({
  username: [
    { required: true, message: '请输入用户名或邮箱', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
})

// 处理登录
const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  try {
    const valid = await loginFormRef.value.validate()
    if (!valid) return
    
    loading.value = true
    
    // 直接使用fetch API调用后端登录接口
    const response = await fetch('/api/v1/user/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: loginForm.username,
        password: loginForm.password
      })
    })
    
    const result = await response.json()
    
    if (result.code === 1) {
      ElMessage.success(result.msg || '登录成功')
      
      // 保存用户信息到本地存储
      localStorage.setItem('token', result.data.id)
      localStorage.setItem('user', JSON.stringify(result.data))
      
      // 更新auth store状态
      authStore.token = result.data.id
      authStore.user = result.data
      
      // 所有用户登录成功后都跳转到主页
      router.push('/home')
    } else {
      ElMessage.error(result.msg || '登录失败')
    }
  } catch (error) {
    console.error('登录失败:', error)
    ElMessage.error('登录失败，请检查网络连接')
  } finally {
    loading.value = false
  }
}

// 移除演示登录相关代码

// 移除自动填充演示数据
onMounted(() => {
  // 不再自动填充演示数据
})
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-box {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  display: flex;
  width: 900px;
  max-width: 90vw;
  min-height: 500px;
  overflow: hidden;
}

.login-form {
  flex: 1;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.form-header {
  text-align: center;
  margin-bottom: 40px;
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
  margin-bottom: 30px;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.login-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
}

.form-footer {
  text-align: center;
}

.register-text {
  color: #606266;
  font-size: 14px;
  margin: 0;
}

.demo-login {
  margin-top: 30px;
}

.demo-buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
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

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.feature-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 16px;
}

.feature-item .el-icon {
  font-size: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-box {
    flex-direction: column;
    width: 100%;
  }
  
  .welcome-section {
    display: none;
  }
  
  .login-form {
    padding: 30px 20px;
  }
  
  .demo-buttons {
    flex-direction: column;
  }
}
</style>