<template>
  <div class="course-list">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>课程中心</h1>
      <p>选择课程并上传相关学习资源</p>
    </div>

    <!-- 课程选项卡 -->
    <div v-if="isTeacher" class="course-tabs">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="所有课程" name="all"></el-tab-pane>
        <el-tab-pane label="我的课程" name="my"></el-tab-pane>
      </el-tabs>
    </div>

    <!-- 课程列表 -->
    <div class="course-grid">
      <el-row :gutter="20">
        <el-col 
          v-for="course in courses" 
          :key="course.id"
          :xs="24" :sm="12" :md="8" :lg="6"
        >
          <el-card 
            class="course-card"
            shadow="hover"
            :body-style="{ padding: '16px' }"
          >
            <div class="course-content">
              <h3 class="course-title">{{ course.title }}</h3>
              <p class="course-description">{{ course.description }}</p>
              
              <div class="course-meta">
                <div class="instructor">
                  <span>{{ course.instructor.name }}</span>
                </div>
                
                <div class="course-stats">
                  <span class="college">
                    <el-icon><School /></el-icon>
                    {{ course.college }}
                  </span>
                  <span class="students">
                    <el-icon><User /></el-icon>
                    {{ course.studentCount }}
                  </span>
                </div>
              </div>
              
              <div class="course-tags">
                <el-tag 
                  v-for="tag in course.tags" 
                  :key="tag"
                  size="small"
                  effect="plain"
                >
                  {{ tag }}
                </el-tag>
              </div>
              
              <div class="course-actions">
                <el-button 
                  type="primary" 
                  size="small" 
                  @click="uploadResource(course)"
                >
                  <el-icon><Upload /></el-icon>
                  上传资源
                </el-button>
                <el-button 
                  type="success" 
                  size="small" 
                  @click="askQuestion(course)"
                >
                  提出问题
                </el-button>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 分页 -->
    <div class="pagination-section">
      <el-pagination
        v-model:current-page="pagination.currentPage"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[12, 24, 36, 48]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 空状态 -->
    <div v-if="courses.length === 0" class="empty-state">
      <el-empty description="暂无课程数据">
        <el-button type="primary" @click="handleReset">
          重置搜索条件
        </el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import apiService from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import { 
  Upload, VideoPlay, Clock, User, School 
} from '@element-plus/icons-vue'

const router = useRouter()
const authStore = useAuthStore()

// 分页参数
const pagination = reactive({
  currentPage: 1,
  pageSize: 12,
  total: 0
})

// 课程数据
const courses = ref([])

// 选项卡状态
const activeTab = ref('all')

// 计算属性：判断用户是否为老师
const isTeacher = computed(() => {
  return authStore.hasPermission('teacher')
})

// 分页大小改变
const handleSizeChange = (size) => {
  pagination.pageSize = size
  pagination.currentPage = 1
  loadCourses()
}

// 当前页改变
const handleCurrentChange = (page) => {
  pagination.currentPage = page
  loadCourses()
}

// 上传资源
const uploadResource = (course) => {
  // 跳转到上传资源页面，并传递课程信息
  router.push({
    path: '/resources/upload',
    query: {
      courseId: course.id,
      courseTitle: course.title
    }
  })
}

// 提出问题
const askQuestion = (course) => {
  // 跳转到提问页面，并传递课程信息
  router.push({
    path: '/questions/ask',
    query: {
      courseId: course.id,
      courseTitle: course.title
    }
  })
}

// 选项卡切换处理
const handleTabChange = (tabName) => {
  activeTab.value = tabName
  if (tabName === 'my') {
    loadMyCourses()
  } else {
    loadCourses()
  }
}

// 加载老师课程数据
const loadMyCourses = async () => {
  try {
    console.log('用户信息:', authStore.userInfo)
    console.log('用户角色:', authStore.userRole)
    console.log('用户名称:', authStore.userName)
    
    // 首先获取当前用户的教师信息
    let teacherName = null
    
    // 方法1：通过教师列表API查找当前用户的教师信息
    try {
      const teacherResponse = await apiService.teachers.list()
      if (teacherResponse.success && teacherResponse.data?.code === 1) {
        const teachers = teacherResponse.data.data || []
        // 根据用户名查找对应的教师信息
        const currentTeacher = teachers.find(teacher => 
          teacher.username === authStore.userInfo?.username || 
          teacher.name === authStore.userInfo?.name
        )
        
        if (currentTeacher) {
          teacherName = currentTeacher.name // 使用teacher表中的真实姓名
          console.log('找到教师信息:', currentTeacher)
        } else {
          console.log('未找到对应的教师信息，使用用户信息中的姓名')
        }
      }
    } catch (error) {
      console.error('获取教师列表失败:', error)
    }
    
    // 方法2：如果方法1失败，使用用户信息中的姓名
    if (!teacherName) {
      teacherName = authStore.userInfo?.name || authStore.userInfo?.username || authStore.userName
    }
    
    if (!teacherName) {
      ElMessage.error('无法获取教师信息')
      return
    }
    
    console.log('使用的教师姓名:', teacherName)
    
    // 使用通用的请求方法，因为apiService没有直接的get方法
    const response = await apiService.request(`/api/v1/class/findByTeacherName/${encodeURIComponent(teacherName)}`)
    
    if (response.success && response.data?.code === 1) {
      // 转换后端数据格式为前端需要的格式
      courses.value = response.data.data.map(course => ({
        id: course.id,
        title: course.title,
        description: course.description || '暂无描述',
        cover: course.cover || '',
        category: course.classType || '其他',
        level: 'intermediate', // 默认中级
        duration: '6小时', // 默认时长
        instructor: {
          id: course.teacherId || 0,
          name: course.teacherName || '未知教师'
        },
        college: course.institute || '未知学院',
        studentCount: course.studentCount || 0,
        rating: 4.5, // 默认评分
        tags: course.tags ? course.tags.split(',') : ['课程']
      }))
      
      pagination.total = courses.value.length
      ElMessage.success(`成功加载 ${courses.value.length} 门我的课程`)
    } else {
      ElMessage.error(response.data?.msg || '我的课程数据加载失败')
      // 使用模拟数据作为备用
      courses.value = getMockCourses()
      pagination.total = courses.value.length
    }
  } catch (error) {
    console.error('加载我的课程数据失败:', error)
    ElMessage.error('网络错误，使用模拟数据')
    // 使用模拟数据作为备用
    courses.value = getMockCourses()
    pagination.total = courses.value.length
  }
}

// 加载所有课程数据
const loadCourses = async () => {
  try {
    const response = await apiService.courses.list()
    
    if (response.success && response.data?.code === 1) {
      // 转换后端数据格式为前端需要的格式
      courses.value = response.data.data.map(course => ({
        id: course.id,
        title: course.title,
        description: course.description || '暂无描述',
        cover: course.cover || '',
        category: course.classType || '其他',
        level: 'intermediate', // 默认中级
        duration: '6小时', // 默认时长
        instructor: {
          id: course.teacherId || 0,
          name: course.teacherName || '未知教师'
        },
        college: course.institute || '未知学院', // 修复：使用institute字段
        studentCount: course.studentCount || 0,
        rating: 4.5, // 默认评分
        tags: course.tags ? course.tags.split(',') : ['课程']
      }))
      
      pagination.total = courses.value.length
      ElMessage.success(`成功加载 ${courses.value.length} 门课程`)
    } else {
      ElMessage.error(response.data?.msg || '课程数据加载失败')
      // 使用模拟数据作为备用
      courses.value = getMockCourses()
      pagination.total = courses.value.length
    }
  } catch (error) {
    console.error('加载课程数据失败:', error)
    ElMessage.error('网络错误，使用模拟数据')
    // 使用模拟数据作为备用
    courses.value = getMockCourses()
    pagination.total = courses.value.length
  }
}

// 模拟课程数据（备用）
const getMockCourses = () => {
  return [
    {
      id: 1,
      title: '高中数学函数专题精讲',
      description: '深入讲解函数概念、性质和应用，帮助掌握函数核心知识点',
      cover: '',
      category: 'math',
      level: 'advanced',
      duration: '12小时',
      instructor: {
        id: 1,
        name: '张老师'
      },
      college: '数学学院',
      studentCount: 256,
      rating: 4.7,
      tags: ['函数', '数学', '高中']
    },
    {
      id: 2,
      title: '英语四级词汇速记',
      description: '高效记忆四级核心词汇，提升词汇量和应用能力',
      cover: '',
      category: 'english',
      level: 'intermediate',
      duration: '8小时',
      instructor: {
        id: 2,
        name: '李老师'
      },
      college: '外国语学院',
      studentCount: 189,
      rating: 4.5,
      tags: ['英语', '四级', '词汇']
    }
  ]
}

// 报名课程
const enrollCourse = (course) => {
  ElMessage.success(`成功报名课程: ${course.title}`)
}

// 购买课程
const purchaseCourse = (course) => {
  ElMessage.warning(`购买课程: ${course.title} - 价格: ￥${course.price}`)
}

onMounted(() => {
  loadCourses()
})
</script>

<style scoped>
.course-list {
  min-height: 100vh;
  padding: 20px;
  background-color: #f5f7fa;
}

.page-header {
  background: white;
  padding: 30px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.page-header h1 {
  font-size: 28px;
  color: #303133;
  margin-bottom: 8px;
}

.page-header p {
  color: #606266;
  margin-bottom: 24px;
}

.course-tabs {
  margin-bottom: 20px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.course-tabs :deep(.el-tabs__header) {
  margin: 0;
}

.course-tabs :deep(.el-tabs__nav-wrap::after) {
  height: 1px;
  background-color: #e4e7ed;
}

.course-tabs :deep(.el-tabs__item) {
  font-size: 16px;
  padding: 0 20px;
  height: 40px;
  line-height: 40px;
}

.course-tabs :deep(.el-tabs__item.is-active) {
  color: #409eff;
  font-weight: 500;
}

.course-tabs :deep(.el-tabs__active-bar) {
  background-color: #409eff;
}

.search-section {
  margin-top: 20px;
}

.course-grid {
  margin-bottom: 30px;
}

.course-card {
  margin-bottom: 16px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: none;
  height: 280px;
  display: flex;
  flex-direction: column;
}

.course-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
}

.course-content {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.course-title {
  font-size: 16px;
  color: #303133;
  margin-bottom: 8px;
  line-height: 1.4;
  height: 44px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.course-description {
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 16px;
  height: 63px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  flex: 1;
}

.course-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.instructor {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #606266;
}

.course-stats {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #909399;
}

.course-stats .college {
  display: flex;
  align-items: center;
  gap: 4px;
}

.course-stats .students {
  display: flex;
  align-items: center;
  gap: 4px;
}

.course-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.course-actions {
  display: flex;
  gap: 8px;
  margin-top: auto;
}

.course-cover {
  position: relative;
  height: 160px;
  border-radius: 6px 6px 0 0;
  overflow: hidden;
}

.cover-image {
  width: 100%;
  height: 100%;
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
}

.cover-placeholder .el-icon {
  font-size: 48px;
  margin-bottom: 8px;
}

.course-status {
  position: absolute;
  top: 10px;
  left: 10px;
}

.course-duration {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.course-content {
  padding: 20px;
}

.course-title {
  font-size: 16px;
  color: #303133;
  margin-bottom: 8px;
  line-height: 1.4;
  height: 44px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.course-description {
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 16px;
  height: 42px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.course-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.instructor {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #606266;
}

.course-stats {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: #909399;
}

.course-stats .students {
  display: flex;
  align-items: center;
  gap: 4px;
}

.course-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.course-actions {
  display: flex;
  gap: 8px;
}

.pagination-section {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

.empty-state {
  background: white;
  padding: 60px 20px;
  border-radius: 8px;
  text-align: center;
}

@media (max-width: 768px) {
  .course-list {
    padding: 10px;
  }
  
  .page-header {
    padding: 20px;
  }
  
  .search-section .el-col {
    margin-bottom: 10px;
  }
  
  .course-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .course-actions {
    flex-direction: column;
  }
}
</style>