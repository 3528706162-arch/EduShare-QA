<!-- 分类管理页面 -->
<template>
  <div class="category-management">
    <div class="page-header">
      <h2>商品分类管理</h2>
      <el-button type="primary" @click="handleAddCategory">
        <el-icon><Plus /></el-icon>
        新增分类
      </el-button>
    </div>

    <!-- 搜索和筛选区域 -->
    <div class="search-section">
      <el-card>
        <div class="search-form">
          <el-form :model="searchForm" inline>
            <el-form-item label="分类名称">
              <el-input 
                v-model="searchForm.name" 
                placeholder="请输入分类名称" 
                clearable
              />
            </el-form-item>
            <el-form-item label="状态">
              <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
                <el-option label="启用" value="1" />
                <el-option label="禁用" value="0" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSearch">查询</el-button>
              <el-button @click="handleReset">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-card>
    </div>

    <!-- 分类列表 -->
    <div class="category-list">
      <el-card>
        <el-table :data="categoryList" v-loading="loading">
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="name" label="分类名称" min-width="120" />
          <el-table-column prop="description" label="分类描述" min-width="200" />
          <el-table-column prop="sort" label="排序" width="80" />
          <el-table-column prop="productCount" label="商品数量" width="100" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === '1' ? 'success' : 'danger'">
                {{ row.status === '1' ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" width="180" />
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button size="small" @click="handleEdit(row)">编辑</el-button>
              <el-button 
                size="small" 
                :type="row.status === '1' ? 'danger' : 'success'"
                @click="handleToggleStatus(row)"
              >
                {{ row.status === '1' ? '禁用' : '启用' }}
              </el-button>
              <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
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
    </div>

    <!-- 新增/编辑分类对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="500px"
      :before-close="handleDialogClose"
    >
      <el-form 
        ref="categoryFormRef" 
        :model="categoryForm" 
        :rules="categoryRules"
        label-width="80px"
      >
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="categoryForm.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="分类描述" prop="description">
          <el-input 
            v-model="categoryForm.description" 
            type="textarea" 
            :rows="3"
            placeholder="请输入分类描述"
          />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number 
            v-model="categoryForm.sort" 
            :min="0" 
            :max="999"
            controls-position="right"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="categoryForm.status">
            <el-radio label="1">启用</el-radio>
            <el-radio label="0">禁用</el-radio>
          </el-radio-group>
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

// 加载状态
const loading = ref(false)

// 搜索表单
const searchForm = reactive({
  name: '',
  status: ''
})

// 分类列表数据
const categoryList = ref([])

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 对话框相关
const dialogVisible = ref(false)
const dialogTitle = ref('')
const categoryFormRef = ref()

// 分类表单
const categoryForm = reactive({
  id: '',
  name: '',
  description: '',
  sort: 0,
  status: '1'
})

// 表单验证规则
const categoryRules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { min: 2, max: 20, message: '分类名称长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  description: [
    { max: 200, message: '分类描述不能超过 200 个字符', trigger: 'blur' }
  ]
}

// 获取分类列表
const fetchCategoryList = async () => {
  loading.value = true
  try {
    // 从本地存储获取数据
    const categories = JSON.parse(localStorage.getItem('categories') || '[]')
    
    // 如果没有数据，初始化一些示例数据
    if (categories.length === 0) {
      const initialData = [
        {
          id: '1',
          name: '手机数码',
          description: '智能手机、平板电脑、数码配件等',
          sort: 1,
          productCount: 156,
          status: '1',
          createTime: '2024-01-15 10:30:00'
        },
        {
          id: '2',
          name: '电脑办公',
          description: '笔记本电脑、台式机、办公设备等',
          sort: 2,
          productCount: 89,
          status: '1',
          createTime: '2024-01-16 14:20:00'
        },
        {
          id: '3',
          name: '家用电器',
          description: '电视、冰箱、洗衣机等家电产品',
          sort: 3,
          productCount: 67,
          status: '1',
          createTime: '2024-01-17 09:15:00'
        },
        {
          id: '4',
          name: '服装鞋帽',
          description: '男女服装、鞋类、配饰等',
          sort: 4,
          productCount: 234,
          status: '0',
          createTime: '2024-01-18 16:45:00'
        }
      ]
      localStorage.setItem('categories', JSON.stringify(initialData))
      categoryList.value = initialData
      pagination.total = initialData.length
    } else {
      // 搜索筛选
      let filteredData = categories
      if (searchForm.name) {
        filteredData = filteredData.filter(item => 
          item.name.includes(searchForm.name)
        )
      }
      if (searchForm.status) {
        filteredData = filteredData.filter(item => 
          item.status === searchForm.status
        )
      }
      
      categoryList.value = filteredData
      pagination.total = filteredData.length
    }
  } catch (error) {
    console.error('获取分类列表失败:', error)
    ElMessage.error('获取分类列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.currentPage = 1
  fetchCategoryList()
}

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    name: '',
    status: ''
  })
  pagination.currentPage = 1
  fetchCategoryList()
}

// 分页大小改变
const handleSizeChange = (size) => {
  pagination.pageSize = size
  pagination.currentPage = 1
  fetchCategoryList()
}

// 当前页改变
const handleCurrentChange = (page) => {
  pagination.currentPage = page
  fetchCategoryList()
}

// 新增分类
const handleAddCategory = () => {
  dialogTitle.value = '新增分类'
  Object.assign(categoryForm, {
    id: '',
    name: '',
    description: '',
    sort: 0,
    status: '1'
  })
  dialogVisible.value = true
}

// 编辑分类
const handleEdit = (row) => {
  dialogTitle.value = '编辑分类'
  Object.assign(categoryForm, {
    id: row.id,
    name: row.name,
    description: row.description,
    sort: row.sort,
    status: row.status
  })
  dialogVisible.value = true
}

// 切换状态
const handleToggleStatus = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要${row.status === '1' ? '禁用' : '启用'}分类"${row.name}"吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 使用本地存储
    const categories = JSON.parse(localStorage.getItem('categories') || '[]')
    const index = categories.findIndex(item => item.id === row.id)
    
    if (index !== -1) {
      const newStatus = row.status === '1' ? '0' : '1'
      categories[index].status = newStatus
      localStorage.setItem('categories', JSON.stringify(categories))
      
      // 更新当前列表显示
      row.status = newStatus
      ElMessage.success(`${newStatus === '1' ? '启用' : '禁用'}成功`)
      fetchCategoryList()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('切换状态失败:', error)
      ElMessage.error('操作失败')
    }
  }
}

// 删除分类
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除分类"${row.name}"吗？此操作不可恢复！`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      }
    )
    
    // 模拟API调用
    categoryList.value = categoryList.value.filter(item => item.id !== row.id)
    pagination.total = categoryList.value.length
    ElMessage.success('删除成功')
  } catch (error) {
    // 用户取消操作
  }
}

// 关闭对话框
const handleDialogClose = () => {
  dialogVisible.value = false
  categoryFormRef.value?.resetFields()
}

// 提交表单
const handleSubmit = async () => {
  if (!categoryFormRef.value) return
  
  try {
    await categoryFormRef.value.validate()
    
    // 使用本地存储
    const categories = JSON.parse(localStorage.getItem('categories') || '[]')
    
    if (categoryForm.id) {
      // 编辑
      const index = categories.findIndex(item => item.id === categoryForm.id)
      if (index !== -1) {
        categories[index] = { ...categories[index], ...categoryForm }
        localStorage.setItem('categories', JSON.stringify(categories))
        ElMessage.success('编辑成功')
      }
    } else {
      // 新增
      const newCategory = {
        id: Date.now().toString(),
        name: categoryForm.name,
        description: categoryForm.description,
        sort: categoryForm.sort,
        productCount: 0,
        status: categoryForm.status,
        createTime: new Date().toLocaleString()
      }
      categories.unshift(newCategory)
      localStorage.setItem('categories', JSON.stringify(categories))
      pagination.total = categories.length
      ElMessage.success('新增成功')
    }
    
    dialogVisible.value = false
    fetchCategoryList()
  } catch (error) {
    console.error('表单验证失败:', error)
    ElMessage.error('提交失败')
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchCategoryList()
})
</script>

<style scoped>
.category-management {
  height: 100%;
  min-height: calc(100vh - 140px);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0;
}

.page-header h2 {
  margin: 0;
  color: #303133;
  font-size: 20px;
  font-weight: 600;
}

.search-section {
  margin-bottom: 0;
}

.search-form {
  padding: 0;
}

.category-list {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-table) {
  flex: 1;
}

:deep(.el-card__body) {
  display: flex;
  flex-direction: column;
  height: 100%;
}
</style>