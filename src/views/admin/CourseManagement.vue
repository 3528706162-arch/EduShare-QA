<template>
  <div class="course-management">
    <div class="breadcrumb">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/admin' }">管理员后台</el-breadcrumb-item>
        <el-breadcrumb-item>课程管理</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div class="page-header">
      <h1>课程管理</h1>
      <p>管理系统中的所有课程信息</p>
    </div>

    <!-- 操作栏 -->
    <el-card class="action-bar">
      <div class="action-buttons">
        <el-button type="primary" @click="showAddDialog = true">
          <el-icon><Plus /></el-icon>
          新增课程
        </el-button>
        <el-button type="danger" @click="handleBatchDelete" :disabled="selectedCourses.length === 0">
          <el-icon><Delete /></el-icon>
          批量删除
        </el-button>
        <el-button @click="handleRefresh">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </el-card>

    <!-- 课程列表 -->
    <el-card>
      <template #header>
        <div class="table-header">
          <span>课程列表</span>
          <el-button type="text" :icon="Refresh" @click="refreshData">刷新</el-button>
        </div>
      </template>
      
      <el-table 
        :data="courseList" 
        style="width: 100%" 
        v-loading="loading"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="课程名称" min-width="200" />
        <el-table-column prop="teacherName" label="授课教师" min-width="120" />
        <el-table-column prop="classType" label="课程类型" min-width="120" />
        <el-table-column prop="institute" label="学院" min-width="150" />
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
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

    <!-- 新增课程对话框 -->
    <el-dialog
      v-model="showAddDialog"
      title="新增课程"
      width="600px"
      :before-close="handleCloseDialog"
    >
      <el-form
        ref="addFormRef"
        :model="addForm"
        :rules="addFormRules"
        label-width="100px"
      >
        <el-form-item label="课程名称" prop="title">
          <el-input v-model="addForm.title" placeholder="请输入课程名称" />
        </el-form-item>
        
        <el-form-item label="课程类型" prop="classType">
          <el-select v-model="addForm.classType" placeholder="请选择课程类型" style="width: 100%">
            <el-option label="计算机编程" value="计算机编程" />
            <el-option label="数学计算" value="数学计算" />
            <el-option label="电子科学" value="电子科学" />
            <el-option label="通识培养" value="通识培养" />
            <el-option label="政治素养" value="政治素养" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="授课教师" prop="teacherId">
          <el-select v-model="addForm.teacherId" placeholder="请选择授课教师" style="width: 100%">
            <el-option 
              v-for="teacher in teacherList" 
              :key="teacher.id" 
              :label="teacher.name" 
              :value="teacher.id" 
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="学院" prop="institute">
          <el-input v-model="addForm.institute" placeholder="请输入学院名称" />
        </el-form-item>
        
        <el-form-item label="课程描述" prop="description">
          <el-input
            v-model="addForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入课程描述"
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

    <!-- 编辑课程对话框 -->
    <el-dialog
      v-model="showEditDialog"
      title="编辑课程"
      width="600px"
      :before-close="handleCloseEditDialog"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="addFormRules"
        label-width="100px"
      >
        <el-form-item label="课程名称" prop="title">
          <el-input v-model="editForm.title" placeholder="请输入课程名称" />
        </el-form-item>
        
        <el-form-item label="课程类型" prop="classType">
          <el-select v-model="editForm.classType" placeholder="请选择课程类型" style="width: 100%">
            <el-option label="计算机编程" value="计算机编程" />
            <el-option label="数学计算" value="数学计算" />
            <el-option label="电子科学" value="电子科学" />
            <el-option label="通识培养" value="通识培养" />
            <el-option label="政治素养" value="政治素养" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="授课教师" prop="teacherId">
          <el-select v-model="editForm.teacherId" placeholder="请选择授课教师" style="width: 100%">
            <el-option 
              v-for="teacher in teacherList" 
              :key="teacher.id" 
              :label="teacher.name" 
              :value="teacher.id" 
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="学院" prop="institute">
          <el-input v-model="editForm.institute" placeholder="请输入学院名称" />
        </el-form-item>
        
        <el-form-item label="课程描述" prop="description">
          <el-input
            v-model="editForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入课程描述"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleCloseEditDialog">取消</el-button>
          <el-button type="primary" @click="handleEditSubmit" :loading="editLoading">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Refresh, Delete } from '@element-plus/icons-vue'
import apiService from '@/services/api'

// 响应式数据
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const showAddDialog = ref(false)
const showEditDialog = ref(false)
const addLoading = ref(false)
const editLoading = ref(false)
const addFormRef = ref()
const editFormRef = ref()

// 新增课程表单数据
const addForm = ref({
  title: '',
  classType: '',
  institute: '',
  description: '',
  teacherId: ''
})

// 编辑课程表单数据
const editForm = ref({
  id: '',
  title: '',
  classType: '',
  institute: '',
  description: '',
  teacherId: ''
})

// 表单验证规则
const addFormRules = ref({
  title: [
    { required: true, message: '请输入课程名称', trigger: 'blur' },
    { min: 2, max: 50, message: '课程名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  classType: [
    { required: true, message: '请选择课程类型', trigger: 'change' }
  ],
  teacherId: [
    { required: true, message: '请选择授课教师', trigger: 'change' }
  ],
  institute: [
    { required: true, message: '请输入学院名称', trigger: 'blur' },
    { min: 2, max: 50, message: '学院名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入课程描述', trigger: 'blur' },
    { min: 5, max: 500, message: '课程描述长度在 5 到 500 个字符', trigger: 'blur' }
  ]
})

// 课程列表数据
const courseList = ref([])
// 选中的课程
const selectedCourses = ref([])
// 教师列表数据（用于下拉选择）
const teacherList = ref([])

// 计算属性
const filteredCourses = computed(() => {
  return courseList.value
})

// 方法

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleCurrentChange = (page) => {
  currentPage.value = page
}

const handleRefresh = () => {
  loadCourseData()
}

const refreshData = () => {
  loadCourseData()
}

const handleEdit = async (row) => {
  try {
    // 获取课程详情
    const response = await apiService.courses.get(row.id)
    
    if (response.success && response.data?.code === 1) {
      const courseData = response.data.data
      
      // 填充编辑表单数据
      editForm.value = {
        id: courseData.id,
        title: courseData.title,
        classType: courseData.classType,
        institute: courseData.institute,
        description: courseData.description,
        teacherId: '' // 需要根据教师名字找到对应的ID
      }
      
      // 根据教师名字找到对应的教师ID
      if (courseData.teacherName) {
        const teacher = teacherList.value.find(t => t.name === courseData.teacherName)
        if (teacher) {
          editForm.value.teacherId = teacher.id
        }
      }
      
      showEditDialog.value = true
    } else {
      ElMessage.error(response.data?.msg || '获取课程详情失败')
    }
  } catch (error) {
    ElMessage.error('网络错误，请重试')
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除课程"${row.title}"吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    const response = await apiService.courses.delete(row.id)
    
    if (response.success && response.data?.code === 1) {
      ElMessage.success('课程删除成功')
      loadCourseData() // 刷新列表
    } else {
      ElMessage.error(response.data?.msg || '课程删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('网络错误，请重试')
    }
  }
}

const handleBatchDelete = async () => {
  if (selectedCourses.value.length === 0) {
    ElMessage.warning('请选择要删除的课程')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedCourses.value.length} 门课程吗？`,
      '批量删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    const ids = selectedCourses.value.map(course => course.id)
    const response = await apiService.courses.deleteBatch(ids)
    
    if (response.success && response.data?.code === 1) {
      ElMessage.success(`成功删除 ${selectedCourses.value.length} 门课程`)
      selectedCourses.value = [] // 清空选择
      loadCourseData() // 刷新列表
    } else {
      ElMessage.error(response.data?.msg || '批量删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('网络错误，请重试')
    }
  }
}

const handleSelectionChange = (selection) => {
  selectedCourses.value = selection
}

const handleCloseDialog = () => {
  showAddDialog.value = false
  addFormRef.value?.resetFields()
  addForm.value = {
    title: '',
    classType: '',
    institute: '',
    description: '',
    teacherId: ''
  }
}

const handleCloseEditDialog = () => {
  showEditDialog.value = false
  editFormRef.value?.resetFields()
  editForm.value = {
    id: '',
    title: '',
    classType: '',
    institute: '',
    description: '',
    teacherId: ''
  }
}

const handleAddSubmit = async () => {
  if (!addFormRef.value) return
  
  const valid = await addFormRef.value.validate()
  if (!valid) return
  
  addLoading.value = true
  try {
    // 获取选中的教师名字
    const selectedTeacher = teacherList.value.find(teacher => teacher.id === addForm.value.teacherId)
    const teacherName = selectedTeacher ? selectedTeacher.name : ''
    
    const response = await apiService.courses.create({
      title: addForm.value.title,
      classType: addForm.value.classType,
      institute: addForm.value.institute,
      teacherName: teacherName,
      description: addForm.value.description,
      createdAt: '',
      updatedAt: ''
    })
    
    if (response.success && response.data?.code === 1) {
      ElMessage.success('课程创建成功')
      handleCloseDialog()
      loadCourseData() // 刷新列表
    } else {
      ElMessage.error(response.data?.msg || '课程创建失败')
    }
  } catch (error) {
    ElMessage.error('网络错误，请重试')
  } finally {
    addLoading.value = false
  }
}

const handleEditSubmit = async () => {
  if (!editFormRef.value) return
  
  const valid = await editFormRef.value.validate()
  if (!valid) return
  
  editLoading.value = true
  try {
    // 获取选中的教师名字
    const selectedTeacher = teacherList.value.find(teacher => teacher.id === editForm.value.teacherId)
    const teacherName = selectedTeacher ? selectedTeacher.name : ''
    
    const response = await apiService.courses.update(editForm.value.id, {
      title: editForm.value.title,
      classType: editForm.value.classType,
      institute: editForm.value.institute,
      teacherName: teacherName,
      description: editForm.value.description
    })
    
    if (response.success && response.data?.code === 1) {
      ElMessage.success('课程更新成功')
      handleCloseEditDialog()
      loadCourseData() // 刷新列表
    } else {
      ElMessage.error(response.data?.msg || '课程更新失败')
    }
  } catch (error) {
    ElMessage.error('网络错误，请重试')
  } finally {
    editLoading.value = false
  }
}

// 加载教师数据
const loadTeacherData = async () => {
  try {
    const response = await apiService.teachers.list()
    if (response.success && response.data?.code === 1) {
      teacherList.value = response.data.data || []
    } else {
      ElMessage.error(response.data?.msg || '获取教师列表失败')
    }
  } catch (error) {
    ElMessage.error('网络错误，请稍后重试')
    console.error('加载教师数据失败:', error)
  }
}

// 加载课程数据
const loadCourseData = async () => {
  loading.value = true
  try {
    const response = await apiService.courses.list()
    
    if (response.success && response.data?.code === 1) {
      // 为每个课程对象添加授课老师字段（暂时为空）
      courseList.value = response.data.data.map(course => ({
        ...course,
        teacher: '' // 暂时为空，后续可以关联教师数据
      }))
      total.value = courseList.value.length
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
  loadCourseData()
  loadTeacherData()
})
</script>

<style scoped>
.course-management {
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

.action-bar {
  margin-bottom: 20px;
}

.action-buttons {
  display: flex;
  gap: 10px;
  padding: 8px 15px;
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
  .course-management {
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