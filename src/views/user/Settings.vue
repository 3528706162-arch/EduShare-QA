<template>
  <div class="user-settings">
    <div class="breadcrumb">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/profile' }">个人中心</el-breadcrumb-item>
        <el-breadcrumb-item>设置</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <el-card class="settings-card">
      <template #header>
        <div class="card-header">
          <h2>账户设置</h2>
          <p>管理您的个人信息和账户偏好</p>
        </div>
      </template>

      <el-tabs v-model="activeTab" type="card" class="settings-tabs">
        <!-- 基本信息设置 -->
        <el-tab-pane label="基本信息" name="profile">
          <el-form
            ref="profileForm"
            :model="profileForm"
            :rules="profileRules"
            label-width="120px"
            label-position="left"
          >
            <el-form-item label="头像" prop="avatar">
              <div class="avatar-section">
                <el-avatar :size="100" :src="profileForm.avatar" />
                <div class="avatar-actions">
                  <el-upload
                    action="/api/upload/avatar"
                    :show-file-list="false"
                    :before-upload="beforeAvatarUpload"
                    :on-success="handleAvatarSuccess"
                    :headers="uploadHeaders"
                  >
                    <el-button type="primary" size="small">更换头像</el-button>
                  </el-upload>
                  <el-button size="small" @click="resetAvatar">重置头像</el-button>
                </div>
              </div>
            </el-form-item>

            <el-form-item label="用户名" prop="username">
              <el-input v-model="profileForm.username" placeholder="请输入用户名" />
              <div class="form-tip">用户名将显示在您的个人资料和问答中</div>
            </el-form-item>

            <el-form-item label="昵称" prop="nickname">
              <el-input v-model="profileForm.nickname" placeholder="请输入昵称" />
              <div class="form-tip">昵称将显示在社区中，建议使用真实姓名</div>
            </el-form-item>

            <el-form-item label="邮箱" prop="email">
              <el-input v-model="profileForm.email" placeholder="请输入邮箱地址" />
              <div class="form-tip">邮箱用于接收重要通知和找回密码</div>
            </el-form-item>

            <el-form-item label="手机号" prop="phone">
              <el-input v-model="profileForm.phone" placeholder="请输入手机号" />
            </el-form-item>

            <el-form-item label="个人简介" prop="bio">
              <el-input
                v-model="profileForm.bio"
                type="textarea"
                :rows="4"
                placeholder="介绍一下自己，让更多人了解您"
                maxlength="200"
                show-word-limit
              />
            </el-form-item>

            <el-form-item label="技术方向" prop="skills">
              <el-select
                v-model="profileForm.skills"
                multiple
                placeholder="请选择您的技术方向"
                style="width: 100%"
              >
                <el-option label="前端开发" value="frontend"></el-option>
                <el-option label="后端开发" value="backend"></el-option>
                <el-option label="移动开发" value="mobile"></el-option>
                <el-option label="数据库" value="database"></el-option>
                <el-option label="人工智能" value="ai"></el-option>
                <el-option label="大数据" value="bigdata"></el-option>
                <el-option label="云计算" value="cloud"></el-option>
                <el-option label="网络安全" value="security"></el-option>
                <el-option label="DevOps" value="devops"></el-option>
                <el-option label="产品设计" value="design"></el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="所在地区" prop="location">
              <el-input v-model="profileForm.location" placeholder="请输入所在地区" />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="saveProfile" :loading="savingProfile">
                保存基本信息
              </el-button>
              <el-button @click="resetProfileForm">重置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 密码设置 -->
        <el-tab-pane label="密码安全" name="password">
          <el-form
            ref="passwordForm"
            :model="passwordForm"
            :rules="passwordRules"
            label-width="120px"
            label-position="left"
          >
            <el-form-item label="当前密码" prop="currentPassword">
              <el-input
                v-model="passwordForm.currentPassword"
                type="password"
                placeholder="请输入当前密码"
                show-password
              />
            </el-form-item>

            <el-form-item label="新密码" prop="newPassword">
              <el-input
                v-model="passwordForm.newPassword"
                type="password"
                placeholder="请输入新密码"
                show-password
              />
              <div class="form-tip">密码长度8-20位，包含字母、数字和特殊字符</div>
            </el-form-item>

            <el-form-item label="确认新密码" prop="confirmPassword">
              <el-input
                v-model="passwordForm.confirmPassword"
                type="password"
                placeholder="请再次输入新密码"
                show-password
              />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="changePassword" :loading="changingPassword">
                修改密码
              </el-button>
              <el-button @click="resetPasswordForm">重置</el-button>
            </el-form-item>
          </el-form>

          <el-divider />

          <div class="security-section">
            <h3>安全设置</h3>
            <div class="security-item">
              <span class="security-label">登录保护</span>
              <el-switch v-model="securitySettings.loginProtection" />
              <span class="security-desc">开启后需要验证码登录</span>
            </div>
            <div class="security-item">
              <span class="security-label">异地登录提醒</span>
              <el-switch v-model="securitySettings.locationAlert" />
              <span class="security-desc">开启后异地登录会发送提醒</span>
            </div>
            <div class="security-item">
              <span class="security-label">登录设备管理</span>
              <el-button type="text" @click="showDeviceManagement">查看</el-button>
              <span class="security-desc">管理已登录的设备</span>
            </div>
          </div>
        </el-tab-pane>

        <!-- 通知设置 -->
        <el-tab-pane label="通知设置" name="notification">
          <div class="notification-section">
            <h3>消息通知</h3>
            <div class="notification-item">
              <span class="notification-label">问题回答通知</span>
              <el-switch v-model="notificationSettings.answerNotify" />
              <span class="notification-desc">有人回答我的问题时通知我</span>
            </div>
            <div class="notification-item">
              <span class="notification-label">评论回复通知</span>
              <el-switch v-model="notificationSettings.commentNotify" />
              <span class="notification-desc">有人回复我的评论时通知我</span>
            </div>
            <div class="notification-item">
              <span class="notification-label">系统公告通知</span>
              <el-switch v-model="notificationSettings.systemNotify" />
              <span class="notification-desc">接收系统公告和更新通知</span>
            </div>
            <div class="notification-item">
              <span class="notification-label">私信通知</span>
              <el-switch v-model="notificationSettings.messageNotify" />
              <span class="notification-desc">接收私信通知</span>
            </div>
          </div>

          <el-divider />

          <div class="notification-channel">
            <h3>通知渠道</h3>
            <div class="channel-item">
              <span class="channel-label">站内消息</span>
              <el-switch v-model="notificationChannels.inApp" />
            </div>
            <div class="channel-item">
              <span class="channel-label">邮件通知</span>
              <el-switch v-model="notificationChannels.email" />
            </div>
            <div class="channel-item">
              <span class="channel-label">短信通知</span>
              <el-switch v-model="notificationChannels.sms" />
            </div>
          </div>

          <el-button type="primary" @click="saveNotificationSettings" :loading="savingNotification">
            保存通知设置
          </el-button>
        </el-tab-pane>

        <!-- 隐私设置 -->
        <el-tab-pane label="隐私设置" name="privacy">
          <div class="privacy-section">
            <h3>隐私保护</h3>
            <div class="privacy-item">
              <span class="privacy-label">公开个人资料</span>
              <el-switch v-model="privacySettings.publicProfile" />
              <span class="privacy-desc">允许他人查看我的个人资料</span>
            </div>
            <div class="privacy-item">
              <span class="privacy-label">显示在线状态</span>
              <el-switch v-model="privacySettings.showOnline" />
              <span class="privacy-desc">在社区中显示我的在线状态</span>
            </div>
            <div class="privacy-item">
              <span class="privacy-label">允许私信</span>
              <el-switch v-model="privacySettings.allowMessages" />
              <span class="privacy-desc">允许其他用户给我发送私信</span>
            </div>
            <div class="privacy-item">
              <span class="privacy-label">搜索可见</span>
              <el-switch v-model="privacySettings.searchable" />
              <span class="privacy-desc">允许通过搜索引擎找到我的资料</span>
            </div>
          </div>

          <el-divider />

          <div class="data-section">
            <h3>数据管理</h3>
            <div class="data-item">
              <span class="data-label">导出个人数据</span>
              <el-button type="text" @click="exportData">导出</el-button>
              <span class="data-desc">导出您的所有个人数据</span>
            </div>
            <div class="data-item">
              <span class="data-label">删除账户</span>
              <el-button type="text" @click="showDeleteAccount" style="color: #f56c6c;">
                删除账户
              </el-button>
              <span class="data-desc">永久删除您的账户和所有数据</span>
            </div>
          </div>

          <el-button type="primary" @click="savePrivacySettings" :loading="savingPrivacy">
            保存隐私设置
          </el-button>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 删除账户确认对话框 -->
    <el-dialog
      v-model="deleteAccountDialogVisible"
      title="确认删除账户"
      width="400px"
      :before-close="handleDeleteAccountClose"
    >
      <div class="delete-warning">
        <el-alert
          title="警告"
          type="error"
          description="此操作将永久删除您的账户和所有相关数据，包括问题、回答、资源等。此操作不可撤销！"
          :closable="false"
        />
        <div class="delete-confirm">
          <p>请输入您的密码以确认删除：</p>
          <el-input
            v-model="deletePassword"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </div>
      </div>
      <template #footer>
        <el-button @click="deleteAccountDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmDeleteAccount" :loading="deletingAccount">
          确认删除
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const activeTab = ref('profile')

// 基本信息表单
const profileForm = ref({})
const profileFormRef = ref()
const profileRules = reactive({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '昵称长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
})

// 密码表单
const passwordForm = ref({})
const passwordFormRef = ref()
const passwordRules = reactive({
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { 
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/,
      message: '密码必须包含大小写字母、数字和特殊字符，长度8-20位',
      trigger: 'blur'
    }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.value.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
})

// 安全设置
const securitySettings = ref({
  loginProtection: true,
  locationAlert: true
})

// 通知设置
const notificationSettings = ref({
  answerNotify: true,
  commentNotify: true,
  systemNotify: true,
  messageNotify: true
})

const notificationChannels = ref({
  inApp: true,
  email: false,
  sms: false
})

// 隐私设置
const privacySettings = ref({
  publicProfile: true,
  showOnline: true,
  allowMessages: true,
  searchable: true
})

// 删除账户相关
const deleteAccountDialogVisible = ref(false)
const deletePassword = ref('')

// 加载状态
const savingProfile = ref(false)
const changingPassword = ref(false)
const savingNotification = ref(false)
const savingPrivacy = ref(false)
const deletingAccount = ref(false)

const uploadHeaders = ref({
  Authorization: `Bearer ${localStorage.getItem('token')}`
})

const beforeAvatarUpload = (file) => {
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPG) {
    ElMessage.error('头像只能是 JPG 或 PNG 格式!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('头像大小不能超过 2MB!')
    return false
  }
  return true
}

const handleAvatarSuccess = (response) => {
  profileForm.value.avatar = response.data.url
  ElMessage.success('头像上传成功!')
}

const resetAvatar = () => {
  profileForm.value.avatar = '/default-avatar.png'
  ElMessage.info('头像已重置为默认头像')
}

const saveProfile = async () => {
  if (!profileFormRef.value) return
  
  try {
    const valid = await profileFormRef.value.validate()
    if (!valid) return
    
    savingProfile.value = true
    const result = await authStore.updateProfile(profileForm.value)
    
    if (result.success) {
      ElMessage.success('基本信息保存成功!')
    } else {
      ElMessage.error('保存失败: ' + result.error)
    }
  } catch (error) {
    console.error('保存基本信息失败:', error)
    ElMessage.error('保存失败，请重试')
  } finally {
    savingProfile.value = false
  }
}

const resetProfileForm = () => {
  if (profileFormRef.value) {
    profileFormRef.value.resetFields()
  }
  loadUserInfo()
}

const changePassword = async () => {
  if (!passwordFormRef.value) return
  
  try {
    const valid = await passwordFormRef.value.validate()
    if (!valid) return
    
    changingPassword.value = true
    const result = await authStore.changePassword({
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword
    })
    
    if (result.success) {
      ElMessage.success('密码修改成功!')
      resetPasswordForm()
    } else {
      ElMessage.error('密码修改失败: ' + result.error)
    }
  } catch (error) {
    console.error('修改密码失败:', error)
    ElMessage.error('修改失败，请重试')
  } finally {
    changingPassword.value = false
  }
}

const resetPasswordForm = () => {
  if (passwordFormRef.value) {
    passwordFormRef.value.resetFields()
  }
}

const showDeviceManagement = () => {
  ElMessage.info('设备管理功能开发中...')
}

const saveNotificationSettings = async () => {
  try {
    savingNotification.value = true
    // 保存通知设置逻辑
    ElMessage.success('通知设置保存成功!')
  } catch (error) {
    console.error('保存通知设置失败:', error)
    ElMessage.error('保存失败，请重试')
  } finally {
    savingNotification.value = false
  }
}

const savePrivacySettings = async () => {
  try {
    savingPrivacy.value = true
    // 保存隐私设置逻辑
    ElMessage.success('隐私设置保存成功!')
  } catch (error) {
    console.error('保存隐私设置失败:', error)
    ElMessage.error('保存失败，请重试')
  } finally {
    savingPrivacy.value = false
  }
}

const exportData = () => {
  ElMessage.info('数据导出功能开发中...')
}

const showDeleteAccount = () => {
  deleteAccountDialogVisible.value = true
  deletePassword.value = ''
}

const handleDeleteAccountClose = (done) => {
  if (deletingAccount.value) {
    ElMessage.warning('正在处理删除请求，请稍候...')
    return
  }
  deletePassword.value = ''
  done()
}

const confirmDeleteAccount = async () => {
  if (!deletePassword.value) {
    ElMessage.error('请输入密码确认删除')
    return
  }
  
  try {
    deletingAccount.value = true
    // 删除账户逻辑
    ElMessage.success('账户删除成功!')
    deleteAccountDialogVisible.value = false
    // 跳转到登录页面
    authStore.logout()
  } catch (error) {
    console.error('删除账户失败:', error)
    ElMessage.error('删除失败，请重试')
  } finally {
    deletingAccount.value = false
  }
}

const loadUserInfo = async () => {
  try {
    const userInfo = authStore.userInfo
    if (userInfo) {
      profileForm.value = {
        username: userInfo.username || '',
        nickname: userInfo.nickname || '',
        email: userInfo.email || '',
        phone: userInfo.phone || '',
        bio: userInfo.bio || '',
        skills: userInfo.skills || [],
        location: userInfo.location || '',
        avatar: userInfo.avatar || '/default-avatar.png'
      }
    }
  } catch (error) {
    console.error('加载用户信息失败:', error)
  }
}

const loadSettings = () => {
  // 从本地存储或API加载设置
  const savedSettings = localStorage.getItem('userSettings')
  if (savedSettings) {
    try {
      const settings = JSON.parse(savedSettings)
      securitySettings.value = settings.security || securitySettings.value
      notificationSettings.value = settings.notification || notificationSettings.value
      notificationChannels.value = settings.channels || notificationChannels.value
      privacySettings.value = settings.privacy || privacySettings.value
    } catch (error) {
      console.error('加载设置失败:', error)
    }
  }
}

onMounted(() => {
  loadUserInfo()
  loadSettings()
})
</script>

<style scoped>
.user-settings {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
}

.breadcrumb {
  margin-bottom: 20px;
}

.settings-card {
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

.avatar-section {
  display: flex;
  align-items: center;
  gap: 20px;
}

.avatar-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-tip {
  margin-top: 8px;
  color: #909399;
  font-size: 12px;
}

.security-section,
.notification-section,
.privacy-section {
  margin-bottom: 30px;
}

.security-item,
.notification-item,
.privacy-item,
.data-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #ebeef5;
}

.security-label,
.notification-label,
.privacy-label,
.data-label {
  font-weight: 500;
  color: #303133;
  min-width: 120px;
}

.security-desc,
.notification-desc,
.privacy-desc,
.data-desc {
  color: #909399;
  font-size: 12px;
  flex: 1;
  margin-left: 20px;
}

.channel-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
}

.channel-label {
  font-weight: 500;
  color: #303133;
}

.delete-warning {
  margin-bottom: 20px;
}

.delete-confirm {
  margin-top: 20px;
}

.delete-confirm p {
  margin-bottom: 10px;
  color: #606266;
}

:deep(.settings-tabs .el-tabs__header) {
  margin-bottom: 0;
}

:deep(.settings-tabs .el-tabs__content) {
  padding: 20px;
}

@media (max-width: 768px) {
  .user-settings {
    padding: 15px;
  }
  
  .avatar-section {
    flex-direction: column;
    text-align: center;
  }
  
  .security-item,
  .notification-item,
  .privacy-item,
  .data-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .security-desc,
  .notification-desc,
  .privacy-desc,
  .data-desc {
    margin-left: 0;
  }
}
</style>