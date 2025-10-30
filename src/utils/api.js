// API服务配置

// 图片上传API
export const uploadImage = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  
  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })
    
    if (!response.ok) {
      throw new Error('图片上传失败')
    }
    
    const result = await response.json()
    // 根据后端返回的数据结构，返回data字段中的URL
    return result.data // 返回图片URL
  } catch (error) {
    console.error('图片上传失败:', error)
    throw error
  }
}

// 本地存储模拟API
export const localStorageAPI = {
  // 获取商品列表
  getProducts: () => {
    return JSON.parse(localStorage.getItem('products') || '[]')
  },
  
  // 保存商品列表
  saveProducts: (products) => {
    localStorage.setItem('products', JSON.stringify(products))
  },
  
  // 获取分类列表
  getCategories: () => {
    return JSON.parse(localStorage.getItem('categories') || '[]')
  },
  
  // 保存分类列表
  saveCategories: (categories) => {
    localStorage.setItem('categories', JSON.stringify(categories))
  }
}