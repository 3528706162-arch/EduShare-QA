<template>
  <div class="teacher-management">
    <div class="breadcrumb">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/admin' }">管理员后台</el-breadcrumb-item>
        <el-breadcrumb-item>教师管理</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div class="page-header">
      <h1>教师管理</h1>
      <p>管理系统中的所有教师信息</p>
    </div>

    <!-- 搜索和操作栏 -->
    <el-card class="search-bar">
      <div class="search-content">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索教师姓名、用户名或邮箱"
          style="width: 300px"
          clearable
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        
        <div class="action-buttons">
          <el-button type="primary" @click="showAddDialog = true">
            <el-icon><Plus /></el-icon>
            新增教师
          </el-button>
          <el-button @click="handleRefresh">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 教师列表 -->
    <el-card>
      <template #header>
        <div class="table-header">
          <span>教师列表</span>
          <el-button type="text" :icon="Refresh" @click="handleRefresh">刷新</el-button>
        </div>
      </template>
      
      <el-table :data="teacherList" style="width: 100%" v-loading="loading">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="姓名" min-width="120" />
        <el-table-column prop="username" label="用户名" min-width="120" />
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column prop="phonenumber" label="手机号" min-width="120" align="center" />
        <el-table-column prop="title" label="职称" min-width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.title === '教授' ? 'success' : row.title === '副教授' ? 'warning' : row.title === '实验员' ? 'info' : 'primary'">
              {{ row.title }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="courses" label="所授课程" min-width="200" show-overflow-tooltip />
        <el-table-column prop="introduction" label="简介" min-width="200" show-overflow-tooltip />
        <el-table-column prop="createdAt" label="创建时间" width="180" align="center" />
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增教师对话框 -->
    <el-dialog
      v-model="showAddDialog"
      title="新增教师"
      width="600px"
      :before-close="handleCloseDialog"
    >
      <el-form
        ref="addFormRef"
        :model="addForm"
        :rules="addFormRules"
        label-width="100px"
      >
        <el-form-item label="姓名" prop="name">
          <el-input v-model="addForm.name" placeholder="请输入教师姓名" />
        </el-form-item>
        
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username" placeholder="请输入用户名" />
        </el-form-item>
        
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email" placeholder="请输入邮箱地址" />
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        
        <el-form-item label="手机号" prop="phonenumber">
          <el-input v-model="addForm.phonenumber" placeholder="请输入手机号" />
        </el-form-item>
        
        <el-form-item label="职称" prop="title">
          <el-select v-model="addForm.title" placeholder="请选择职称" style="width: 100%">
            <el-option label="讲师" value="讲师" />
            <el-option label="实验员" value="实验员" />
            <el-option label="副教授" value="副教授" />
            <el-option label="教授" value="教授" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="简介" prop="introduction">
          <el-input
            v-model="addForm.introduction"
            type="textarea"
            :rows="3"
            placeholder="请输入教师简介"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleCloseDialog">取消</el-button>
          <el-button type="primary" @click="handleAddSubmit" :loading="addLoading">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Refresh } from '@element-plus/icons-vue'
import apiService from '@/services/api'

// 响应式数据
const loading = ref(false)
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const showAddDialog = ref(false)
const addLoading = ref(false)
const addFormRef = ref()

// 新增教师表单数据
const addForm = ref({
  name: '',
  username: '',
  email: '',
  password: '',
  phonenumber: '',
  introduction: '',
  title: ''
})

// 表单验证规则
const addFormRules = ref({
  name: [
    { required: true, message: '请输入教师姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '姓名长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  phonenumber: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
  ],
  title: [
    { required: true, message: '请选择职称', trigger: 'change' }
  ],
  introduction: [
    { required: true, message: '请输入教师简介', trigger: 'blur' },
    { min: 5, max: 500, message: '简介长度在 5 到 500 个字符', trigger: 'blur' }
  ]
})

// 教师列表数据
const teacherList = ref([])

// 计算属性
const filteredTeachers = computed(() => {
  if (!searchKeyword.value) {
    return teacherList.value
  }
  return teacherList.value.filter(teacher =>
    teacher.name.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
    teacher.username.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
    teacher.email.toLowerCase().includes(searchKeyword.value.toLowerCase())
  )
})

// 方法
const handleSearch = () => {
  currentPage.value = 1
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleCurrentChange = (page) => {
  currentPage.value = page
}

const handleRefresh = () => {
  loadTeacherData()
}

const handleEdit = (row) => {
  ElMessage.info('编辑功能暂未实现')
}

const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除教师"${row.name}"吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    ElMessage.info('删除功能暂未实现')
  }).catch(() => {
    // 用户取消操作
  })
}

const handleCloseDialog = () => {
  showAddDialog.value = false
  addFormRef.value?.resetFields()
  addForm.value = {
    name: '',
    username: '',
    email: '',
    password: '',
    phonenumber: '',
    introduction: '',
    title: ''
  }
}

const handleAddSubmit = async () => {
  if (!addFormRef.value) return
  
  const valid = await addFormRef.value.validate()
  if (!valid) return
  
  addLoading.value = true
  try {
    const response = await apiService.teachers.create({
      name: addForm.value.name,
      username: addForm.value.username,
      email: addForm.value.email,
      password: addForm.value.password,
      phonenumber: addForm.value.phonenumber,
      introduction: addForm.value.introduction,
      title: addForm.value.title,
      created_at: ''
    })
    
    if (response.success && response.data?.code === 1) {
      ElMessage.success('教师创建成功')
      handleCloseDialog()
      loadTeacherData() // 刷新列表
    } else {
      ElMessage.error(response.data?.msg || '教师创建失败')
    }
  } catch (error) {
    ElMessage.error('网络错误，请重试')
  } finally {
    addLoading.value = false
  }
}

// 加载教师数据
const loadTeacherData = async () => {
  loading.value = true
  try {
    const response = await apiService.teachers.list()
    
    if (response.success && response.data?.code === 1) {
      // 使用后端返回的数据，包含createdAt字段
      teacherList.value = response.data.data.map(teacher => ({
        ...teacher,
        courses: '' // 暂时为空，后续可以关联课程数据
      }))
      total.value = teacherList.value.length
      ElMessage.success('数据加载成功')
    } else {
      ElMessage.error(response.data?.msg || '数据加载失败')
    }
  } catch (error) {
    ElMessage.error('网络错误，请重试')
  } finally {
    loading.value = false
  }
}

// 生命周期
onMounted(() => {
  loadTeacherData()
})
</script>

<style scoped>
.teacher-management {
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

.search-bar {
  margin-bottom: 20px;
}

.search-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .teacher-management {
    padding: 16px;
  }
  
  .search-content {
    flex-direction: column;
    gap: 15px;
  }
  
  .action-buttons {
    width: 100%;
    justify-content: space-between;
  }
}
</style>