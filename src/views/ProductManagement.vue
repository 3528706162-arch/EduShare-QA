<!-- 商品管理页面 -->
<template>
  <div class="product-management">
    <div class="page-header">
      <h2>商品管理</h2>
      <el-button type="primary" @click="handleAddProduct">
        <el-icon><Plus /></el-icon>
        新增商品
      </el-button>
    </div>

    <!-- 搜索和筛选区域 -->
    <div class="search-section">
      <el-card>
        <div class="search-form">
          <el-form :model="searchForm" inline>
            <el-form-item label="商品名称">
              <el-input 
                v-model="searchForm.name" 
                placeholder="请输入商品名称" 
                clearable
              />
            </el-form-item>
            <el-form-item label="商品分类">
              <el-select v-model="searchForm.categoryId" placeholder="请选择分类" clearable>
                <el-option 
                  v-for="category in categoryOptions" 
                  :key="category.id" 
                  :label="category.name" 
                  :value="category.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="状态">
              <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
                <el-option label="上架" value="1" />
                <el-option label="下架" value="0" />
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

    <!-- 商品列表 -->
    <div class="product-list">
      <el-card>
        <el-table :data="productList" v-loading="loading">
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column label="商品图片" width="100">
            <template #default="{ row }">
              <el-image 
                :src="row.image" 
                :preview-src-list="[row.image]" 
                fit="cover" 
                style="width: 60px; height: 60px;"
              >
                <template #error>
                  <div class="image-slot">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
            </template>
          </el-table-column>
          <el-table-column prop="name" label="商品名称" min-width="150" />
          <el-table-column prop="categoryName" label="分类" width="100" />
          <el-table-column prop="price" label="价格" width="100">
            <template #default="{ row }">
              ¥{{ row.price }}
            </template>
          </el-table-column>
          <el-table-column prop="stock" label="库存" width="80" />
          <el-table-column prop="sales" label="销量" width="80" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === '1' ? 'success' : 'danger'">
                {{ row.status === '1' ? '上架' : '下架' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" width="180" />
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button size="small" @click="handleEdit(row)">编辑</el-button>
              <el-button 
                size="small" 
                :type="row.status === '1' ? 'warning' : 'success'"
                @click="handleToggleStatus(row)"
              >
                {{ row.status === '1' ? '下架' : '上架' }}
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

    <!-- 新增/编辑商品对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="600px"
      :before-close="handleDialogClose"
    >
      <el-form 
        ref="productFormRef" 
        :model="productForm" 
        :rules="productRules"
        label-width="100px"
      >
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="productForm.name" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="商品分类" prop="categoryId">
          <el-select v-model="productForm.categoryId" placeholder="请选择分类">
            <el-option 
              v-for="category in categoryOptions" 
              :key="category.id" 
              :label="category.name" 
              :value="category.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="商品价格" prop="price">
          <el-input-number 
            v-model="productForm.price" 
            :min="0" 
            :precision="2"
            controls-position="right"
            style="width: 200px;"
          />
        </el-form-item>
        <el-form-item label="商品库存" prop="stock">
          <el-input-number 
            v-model="productForm.stock" 
            :min="0" 
            :precision="0"
            controls-position="right"
            style="width: 200px;"
          />
        </el-form-item>
        <el-form-item label="商品图片" prop="image">
          <el-upload
            class="avatar-uploader"
            action="#"
            :show-file-list="false"
            :before-upload="beforeAvatarUpload"
            :http-request="handleUpload"
          >
            <img v-if="productForm.image" :src="productForm.image" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="商品描述" prop="description">
          <el-input 
            v-model="productForm.description" 
            type="textarea" 
            :rows="4"
            placeholder="请输入商品描述"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="productForm.status">
            <el-radio label="1">上架</el-radio>
            <el-radio label="0">下架</el-radio>
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
import { Plus, Picture } from '@element-plus/icons-vue'
import { uploadImage } from '../utils/api.js'

// 加载状态
const loading = ref(false)

// 搜索表单
const searchForm = reactive({
  name: '',
  categoryId: '',
  status: ''
})

// 分类选项
const categoryOptions = ref([
  { id: '1', name: '手机数码' },
  { id: '2', name: '电脑办公' },
  { id: '3', name: '家用电器' },
  { id: '4', name: '服装鞋帽' }
])

// 商品列表数据
const productList = ref([])

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 对话框相关
const dialogVisible = ref(false)
const dialogTitle = ref('')
const productFormRef = ref()

// 商品表单
const productForm = reactive({
  id: '',
  name: '',
  categoryId: '',
  categoryName: '',
  price: 0,
  stock: 0,
  image: '',
  description: '',
  status: '1'
})

// 表单验证规则
const productRules = {
  name: [
    { required: true, message: '请输入商品名称', trigger: 'blur' },
    { min: 2, max: 50, message: '商品名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  categoryId: [
    { required: true, message: '请选择商品分类', trigger: 'change' }
  ],
  price: [
    { required: true, message: '请输入商品价格', trigger: 'blur' },
    { type: 'number', min: 0, message: '价格不能为负数', trigger: 'blur' }
  ],
  stock: [
    { required: true, message: '请输入商品库存', trigger: 'blur' },
    { type: 'number', min: 0, message: '库存不能为负数', trigger: 'blur' }
  ]
}

// 获取商品列表
const fetchProductList = async () => {
  loading.value = true
  try {
    // 从本地存储获取数据
    const products = JSON.parse(localStorage.getItem('products') || '[]')
    
    // 如果没有数据，初始化一些示例数据
    if (products.length === 0) {
      const initialData = [
        {
          id: '1',
          name: 'iPhone 15 Pro',
          categoryId: '1',
          categoryName: '手机数码',
          price: 7999,
          stock: 150,
          sales: 89,
          image: 'https://via.placeholder.com/150',
          description: '最新款iPhone手机，搭载A17 Pro芯片',
          status: '1',
          createTime: '2024-01-15 10:30:00'
        },
        {
          id: '2',
          name: 'MacBook Pro 16寸',
          categoryId: '2',
          categoryName: '电脑办公',
          price: 18999,
          stock: 45,
          sales: 23,
          image: 'https://via.placeholder.com/150',
          description: '专业级笔记本电脑，适合开发者和设计师',
          status: '1',
          createTime: '2024-01-16 14:20:00'
        },
        {
          id: '3',
          name: '小米电视 65寸',
          categoryId: '3',
          categoryName: '家用电器',
          price: 2999,
          stock: 78,
          sales: 56,
          image: 'https://via.placeholder.com/150',
          description: '4K超高清智能电视，支持语音控制',
          status: '1',
          createTime: '2024-01-17 09:15:00'
        },
        {
          id: '4',
          name: 'Nike运动鞋',
          categoryId: '4',
          categoryName: '服装鞋帽',
          price: 599,
          stock: 200,
          sales: 156,
          image: 'https://via.placeholder.com/150',
          description: '舒适透气运动鞋，适合日常穿着',
          status: '0',
          createTime: '2024-01-18 16:45:00'
        }
      ]
      localStorage.setItem('products', JSON.stringify(initialData))
      productList.value = initialData
      pagination.total = initialData.length
    } else {
      // 搜索筛选
      let filteredData = products
      if (searchForm.name) {
        filteredData = filteredData.filter(item => 
          item.name.includes(searchForm.name)
        )
      }
      if (searchForm.categoryId) {
        filteredData = filteredData.filter(item => 
          item.categoryId === searchForm.categoryId
        )
      }
      if (searchForm.status) {
        filteredData = filteredData.filter(item => 
          item.status === searchForm.status
        )
      }
      
      productList.value = filteredData
      pagination.total = filteredData.length
    }
  } catch (error) {
    console.error('获取商品列表失败:', error)
    ElMessage.error('获取商品列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.currentPage = 1
  fetchProductList()
}

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    name: '',
    categoryId: '',
    status: ''
  })
  pagination.currentPage = 1
  fetchProductList()
}

// 分页大小改变
const handleSizeChange = (size) => {
  pagination.pageSize = size
  pagination.currentPage = 1
  fetchProductList()
}

// 当前页改变
const handleCurrentChange = (page) => {
  pagination.currentPage = page
  fetchProductList()
}

// 新增商品
const handleAddProduct = () => {
  dialogTitle.value = '新增商品'
  Object.assign(productForm, {
    id: '',
    name: '',
    categoryId: '',
    categoryName: '',
    price: 0,
    stock: 0,
    image: '',
    description: '',
    status: '1'
  })
  dialogVisible.value = true
}

// 编辑商品
const handleEdit = (row) => {
  dialogTitle.value = '编辑商品'
  Object.assign(productForm, {
    id: row.id,
    name: row.name,
    categoryId: row.categoryId,
    categoryName: row.categoryName,
    price: row.price,
    stock: row.stock,
    image: row.image,
    description: row.description,
    status: row.status
  })
  dialogVisible.value = true
}

// 切换状态（上架/下架）
const handleToggleStatus = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要${row.status === '1' ? '下架' : '上架'}商品"${row.name}"吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 使用本地存储
    const products = JSON.parse(localStorage.getItem('products') || '[]')
    const index = products.findIndex(item => item.id === row.id)
    
    if (index !== -1) {
      const newStatus = row.status === '1' ? '0' : '1'
      products[index].status = newStatus
      localStorage.setItem('products', JSON.stringify(products))
      
      // 更新当前列表显示
      row.status = newStatus
      ElMessage.success(`${newStatus === '1' ? '上架' : '下架'}成功`)
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('切换状态失败:', error)
      ElMessage.error('操作失败')
    }
  }
}

// 删除商品
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除商品"${row.name}"吗？此操作不可恢复！`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      }
    )
    
    // 模拟API调用
    productList.value = productList.value.filter(item => item.id !== row.id)
    pagination.total = productList.value.length
    ElMessage.success('删除成功')
  } catch (error) {
    // 用户取消操作
  }
}

// 图片上传前检查
const beforeAvatarUpload = (file) => {
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPG) {
    ElMessage.error('上传图片只能是 JPG/PNG 格式!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('上传图片大小不能超过 2MB!')
    return false
  }
  return true
}

// 处理图片上传
const handleUpload = async (file) => {
  try {
    // 调用后端图片上传接口
    const imageUrl = await uploadImage(file.file)
    productForm.image = imageUrl
    ElMessage.success('图片上传成功')
  } catch (error) {
    console.error('图片上传失败:', error)
    // 如果API调用失败，使用本地预览作为降级方案
    const reader = new FileReader()
    reader.onload = (e) => {
      productForm.image = e.target.result
      ElMessage.warning('使用本地预览，请检查后端图片服务是否正常')
    }
    reader.onerror = () => {
      ElMessage.error('图片上传失败')
    }
    reader.readAsDataURL(file.file)
  }
}

// 关闭对话框
const handleDialogClose = () => {
  dialogVisible.value = false
  productFormRef.value?.resetFields()
}

// 提交表单
const handleSubmit = async () => {
  if (!productFormRef.value) return
  
  try {
    await productFormRef.value.validate()
    
    loading.value = true
    
    // 获取分类名称
    const category = categoryOptions.value.find(cat => cat.id === productForm.categoryId)
    const categoryName = category ? category.name : ''
    
    // 使用前端本地存储
    const products = JSON.parse(localStorage.getItem('products') || '[]')
    
    if (productForm.id) {
      // 编辑商品
      const index = products.findIndex(item => item.id === productForm.id)
      if (index !== -1) {
        products[index] = { 
          ...products[index], 
          ...productForm,
          categoryName,
          sales: products[index].sales // 保留原销量
        }
        localStorage.setItem('products', JSON.stringify(products))
        ElMessage.success('编辑成功')
      }
    } else {
      // 新增商品
      const newProduct = {
        id: Date.now().toString(),
        name: productForm.name,
        categoryId: productForm.categoryId,
        categoryName: categoryName,
        price: productForm.price,
        stock: productForm.stock,
        sales: 0,
        image: productForm.image || 'https://via.placeholder.com/150',
        description: productForm.description,
        status: productForm.status,
        createTime: new Date().toLocaleString()
      }
      products.unshift(newProduct)
      localStorage.setItem('products', JSON.stringify(products))
      pagination.total = products.length
      ElMessage.success('新增成功')
    }
    
    dialogVisible.value = false
    fetchProductList()
  } catch (error) {
    console.error('表单验证失败:', error)
    ElMessage.error('提交失败')
  } finally {
    loading.value = false
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchProductList()
})
</script>

<style scoped>
.product-management {
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

.product-list {
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

.avatar-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 100px;
  height: 100px;
}

.avatar-uploader:hover {
  border-color: #409eff;
}

.avatar {
  width: 100px;
  height: 100px;
  display: block;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  line-height: 100px;
  text-align: center;
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  color: #909399;
}
</style>