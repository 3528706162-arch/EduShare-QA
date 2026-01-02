<template>
  <div class="user-management">
    <div class="breadcrumb">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/admin' }">管理员后台</el-breadcrumb-item>
        <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div class="page-header">
      <h1>用户管理</h1>
      <p>管理系统所有用户账户，包括注册、审核、权限设置等功能</p>
    </div>

    <!-- 搜索和筛选区域 -->
    <el-card class="search-card">
      <div class="search-form">
        <el-form :model="searchForm" :inline="true">
          <el-form-item label="用户名">
            <el-input 
              v-model="searchForm.username" 
              placeholder="请输入用户名"
              clearable
            />
          </el-form-item>
          
          <el-form-item label="邮箱">
            <el-input 
              v-model="searchForm.email" 
              placeholder="请输入邮箱"
              clearable
            />
          </el-form-item>
          
          <el-form-item label="用户角色">
            <el-select v-model="searchForm.role" placeholder="请选择角色" clearable>
              <el-option label="学生" value="student" />
              <el-option label="教师" value="teacher" />
              <el-option label="管理员" value="admin" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
              <el-option label="正常" value="active" />
              <el-option label="禁用" value="disabled" />
              <el-option label="待审核" value="pending" />
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

    <!-- 操作按钮区域 -->
    <div class="action-bar">
      <el-button type="primary" @click="handleAddUser">
        <el-icon><Plus /></el-icon>
        添加用户
      </el-button>
      
      <el-button @click="handleExport">
        <el-icon><Download /></el-icon>
        导出数据
      </el-button>
      
      <el-button @click="handleBatchDelete" :disabled="selectedUsers.length === 0">
        <el-icon><Delete /></el-icon>
        批量删除
      </el-button>
    </div>

    <!-- 用户列表 -->
    <el-card>
      <template #header>
        <div class="table-header">
          <span>用户列表</span>
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
        :data="userList"
        @selection-change="handleSelectionChange"
        stripe
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" />
        
        <el-table-column label="用户ID" prop="id" width="80" />
        
        <el-table-column label="用户信息" min-width="200">
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar :size="40" :src="row.imageUrl || row.avatar" />
              <div class="user-details">
                <div class="username">{{ row.username }}</div>
                <div class="email">{{ row.email }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="角色" width="100">
          <template #default="{ row }">
            <el-tag 
              :type="getRoleType(row.role)"
              effect="light"
            >
              {{ getRoleLabel(row.role) }}
            </el-tag>
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
        
        <el-table-column label="注册时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        
        <el-table-column label="最后登录" width="180">
          <template #default="{ row }">
            {{ row.lastLogin ? formatDate(row.lastLogin) : '从未登录' }}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="200" fixed="right">
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
            >
              编辑
            </el-button>
            
            <el-dropdown @command="(command) => handleCommand(command, row)">
              <el-button size="small">
                更多<el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="resetPassword">重置密码</el-dropdown-item>
                  <el-dropdown-item 
                    v-if="row.status === 'active'" 
                    command="disable"
                  >
                    禁用账户
                  </el-dropdown-item>
                  <el-dropdown-item 
                    v-if="row.status === 'disabled'" 
                    command="enable"
                  >
                    启用账户
                  </el-dropdown-item>
                  <el-dropdown-item 
                    v-if="row.status === 'pending'" 
                    command="approve"
                  >
                    审核通过
                  </el-dropdown-item>
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

    <!-- 添加/编辑用户对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      :before-close="handleDialogClose"
    >
      <el-form
        ref="userFormRef"
        :model="userForm"
        :rules="userFormRules"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" placeholder="请输入用户名" />
        </el-form-item>
        
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        
        <el-form-item label="密码" prop="password" v-if="dialogType === 'add'">
          <el-input 
            v-model="userForm.password" 
            type="password" 
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>
        
        <el-form-item label="确认密码" prop="confirmPassword" v-if="dialogType === 'add'">
          <el-input 
            v-model="userForm.confirmPassword" 
            type="password" 
            placeholder="请确认密码"
            show-password
          />
        </el-form-item>
        
        <el-form-item label="角色" prop="role">
          <el-select v-model="userForm.role" placeholder="请选择角色">
            <el-option label="学生" value="student" />
            <el-option label="教师" value="teacher" />
            <el-option label="管理员" value="admin" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="状态" prop="status">
          <el-select v-model="userForm.status" placeholder="请选择状态">
            <el-option label="正常" value="active" />
            <el-option label="禁用" value="disabled" />
            <el-option label="待审核" value="pending" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="备注" prop="remark">
          <el-input 
            v-model="userForm.remark" 
            type="textarea" 
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleDialogClose">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { 
  Search, Plus, Download, Delete, Refresh, ArrowDown 
} from '@element-plus/icons-vue'

// 搜索表单
const searchForm = reactive({
  username: '',
  email: '',
  role: '',
  status: ''
})

// 用户列表数据
const userList = ref([
  {
    id: 1,
    username: '张三',
    email: 'zhangsan@example.com',
    avatar: '',
    role: 'student',
    status: 'active',
    createdAt: '2024-01-01T10:00:00Z',
    lastLogin: '2024-01-15T14:30:00Z'
  },
  {
    id: 2,
    username: '李老师',
    email: 'lilaoshi@example.com',
    avatar: '',
    role: 'teacher',
    status: 'active',
    createdAt: '2024-01-02T09:15:00Z',
    lastLogin: '2024-01-15T16:45:00Z'
  },
  {
    id: 3,
    username: '王管理员',
    email: 'admin@example.com',
    avatar: '',
    role: 'admin',
    status: 'active',
    createdAt: '2023-12-15T08:00:00Z',
    lastLogin: '2024-01-15T18:20:00Z'
  },
  {
    id: 4,
    username: '赵六',
    email: 'zhaoliu@example.com',
    avatar: '',
    role: 'student',
    status: 'pending',
    createdAt: '2024-01-15T11:30:00Z',
    lastLogin: null
  },
  {
    id: 5,
    username: '钱七',
    email: 'qianqi@example.com',
    avatar: '',
    role: 'student',
    status: 'disabled',
    createdAt: '2024-01-10T14:20:00Z',
    lastLogin: '2024-01-12T10:15:00Z'
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

// 选中的用户
const selectedUsers = ref([])

// 对话框相关
const dialogVisible = ref(false)
const dialogType = ref('add') // 'add' 或 'edit'
const userFormRef = ref()
const userForm = reactive({
  id: '',
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: '',
  status: '',
  remark: ''
})

// 表单验证规则
const userFormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== userForm.password) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  role: [
    { required: true, message: '请选择用户角色', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择用户状态', trigger: 'change' }
  ]
}

// 计算属性
const dialogTitle = computed(() => {
  return dialogType.value === 'add' ? '添加用户' : '编辑用户'
})

// 方法定义
const handleSearch = () => {
  pagination.currentPage = 1
  loadUserList()
}

const handleReset = () => {
  Object.assign(searchForm, {
    username: '',
    email: '',
    role: '',
    status: ''
  })
  pagination.currentPage = 1
  loadUserList()
}

const handleAddUser = () => {
  dialogType.value = 'add'
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogType.value = 'edit'
  Object.assign(userForm, {
    id: row.id,
    username: row.username,
    email: row.email,
    role: row.role,
    status: row.status,
    remark: ''
  })
  dialogVisible.value = true
}

const handleView = (row) => {
  ElMessage.info(`查看用户: ${row.username}`)
}

const handleExport = () => {
  ElMessage.success('导出功能开发中...')
}

const handleBatchDelete = () => {
  if (selectedUsers.value.length === 0) {
    ElMessage.warning('请选择要删除的用户')
    return
  }
  
  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedUsers.value.length} 个用户吗？`,
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success('批量删除成功')
    loadUserList()
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

const handleSelectionChange = (selection) => {
  selectedUsers.value = selection
}

const handleSizeChange = (size) => {
  pagination.pageSize = size
  loadUserList()
}

const handleCurrentChange = (page) => {
  pagination.currentPage = page
  loadUserList()
}

const handleCommand = (command, row) => {
  switch (command) {
    case 'resetPassword':
      handleResetPassword(row)
      break
    case 'disable':
      handleDisableUser(row)
      break
    case 'enable':
      handleEnableUser(row)
      break
    case 'approve':
      handleApproveUser(row)
      break
    case 'delete':
      handleDeleteUser(row)
      break
  }
}

const handleResetPassword = (row) => {
  ElMessageBox.prompt('请输入新密码', '重置密码', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /.{6,}/,
    inputErrorMessage: '密码长度不能少于6个字符'
  }).then(({ value }) => {
    ElMessage.success(`用户 ${row.username} 的密码已重置`)
  }).catch(() => {
    ElMessage.info('已取消重置密码')
  })
}

const handleDisableUser = (row) => {
  ElMessageBox.confirm(`确定要禁用用户 "${row.username}" 吗？`, '确认操作', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('用户已禁用')
    loadUserList()
  }).catch(() => {
    ElMessage.info('已取消操作')
  })
}

const handleEnableUser = (row) => {
  ElMessageBox.confirm(`确定要启用用户 "${row.username}" 吗？`, '确认操作', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('用户已启用')
    loadUserList()
  }).catch(() => {
    ElMessage.info('已取消操作')
  })
}

const handleApproveUser = (row) => {
  ElMessageBox.confirm(`确定要审核通过用户 "${row.username}" 吗？`, '确认操作', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('用户审核通过')
    loadUserList()
  }).catch(() => {
    ElMessage.info('已取消操作')
  })
}

const handleDeleteUser = (row) => {
  ElMessageBox.confirm(`确定要删除用户 "${row.username}" 吗？`, '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('用户删除成功')
    loadUserList()
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

const handleDialogClose = () => {
  dialogVisible.value = false
  resetForm()
}

const handleSubmit = async () => {
  if (!userFormRef.value) return
  
  try {
    await userFormRef.value.validate()
    
    if (dialogType.value === 'add') {
      ElMessage.success('用户添加成功')
    } else {
      ElMessage.success('用户信息更新成功')
    }
    
    dialogVisible.value = false
    resetForm()
    loadUserList()
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

const refreshTable = () => {
  loadUserList()
}

const loadUserList = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    pagination.total = userList.value.length
  } catch (error) {
    console.error('加载用户列表失败:', error)
    ElMessage.error('数据加载失败')
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  Object.assign(userForm, {
    id: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    status: '',
    remark: ''
  })
  if (userFormRef.value) {
    userFormRef.value.clearValidate()
  }
}

const getRoleType = (role) => {
  const types = {
    student: '',
    teacher: 'warning',
    admin: 'danger'
  }
  return types[role] || ''
}

const getRoleLabel = (role) => {
  const labels = {
    student: '学生',
    teacher: '教师',
    admin: '管理员'
  }
  return labels[role] || role
}

const getStatusType = (status) => {
  const types = {
    active: 'success',
    disabled: 'danger',
    pending: 'warning'
  }
  return types[status] || ''
}

const getStatusLabel = (status) => {
  const labels = {
    active: '正常',
    disabled: '禁用',
    pending: '待审核'
  }
  return labels[status] || status
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

onMounted(() => {
  loadUserList()
})
</script>

<style scoped>
.user-management {
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

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.username {
  font-weight: 500;
  color: #303133;
}

.email {
  font-size: 12px;
  color: #909399;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .user-management {
    padding: 15px;
  }
  
  .search-form {
    flex-direction: column;
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
  
  .pagination {
    justify-content: center;
  }
}
</style>