<template>
  <div class="app-layout">
    <!-- 头部 -->
    <AppHeader />
    
    <div class="layout-body">
      <!-- 侧边栏 -->
      <AppSidebar v-if="showSidebar" />
      
      <!-- 主内容区域 -->
      <main class="main-content">
        <!-- 页面标题 -->
        <div class="page-header" v-if="$route.meta.title">
          <h2 class="page-title">{{ $route.meta.title }}</h2>
          <div class="page-actions">
            <slot name="actions"></slot>
          </div>
        </div>
        
        <!-- 面包屑 -->
        <el-breadcrumb class="breadcrumb" separator="/" v-if="showBreadcrumb">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item 
            v-for="item in breadcrumbItems" 
            :key="item.path"
            :to="item.to"
          >
            {{ item.title }}
          </el-breadcrumb-item>
        </el-breadcrumb>
        
        <!-- 页面内容 -->
        <div class="page-content">
          <router-view />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from './AppHeader.vue'
import AppSidebar from './AppSidebar.vue'

const route = useRoute()

// 是否显示侧边栏
const showSidebar = computed(() => {
  return route.meta.showSidebar !== false && !route.meta.hideLayout
})

// 是否显示面包屑
const showBreadcrumb = computed(() => {
  return route.meta.showBreadcrumb !== false && !route.meta.hideLayout
})

// 面包屑数据
const breadcrumbItems = computed(() => {
  const items = []
  const matched = route.matched.filter(record => record.meta.title)
  
  matched.forEach((record, index) => {
    if (index === matched.length - 1) {
      // 当前页面，不添加链接
      items.push({
        title: record.meta.title,
        path: record.path
      })
    } else {
      // 父级页面，添加链接
      items.push({
        title: record.meta.title,
        path: record.path,
        to: { path: record.path }
      })
    }
  })
  
  return items
})
</script>

<style scoped>
.app-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.layout-body {
  flex: 1;
  display: flex;
  width: 100%;
}

.main-content {
  background: #f5f7fa;
  padding: 0;
  overflow-y: auto;
  width: 100%;
  max-width: none;
  flex: 1;
}

.page-header {
  background: white;
  padding: 20px 24px;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.page-actions {
  display: flex;
  gap: 10px;
}

.breadcrumb {
  padding: 16px 24px;
  background: white;
  border-bottom: 1px solid #e6e6e6;
}

.page-content {
  padding: 24px;
  min-height: calc(100vh - 180px);
  width: 100%;
  max-width: none;
  box-sizing: border-box;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    padding: 16px;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .page-title {
    font-size: 18px;
  }
  
  .breadcrumb {
    padding: 12px 16px;
  }
  
  .page-content {
    padding: 16px;
  }
}
</style>