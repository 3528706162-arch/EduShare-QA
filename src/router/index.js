import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// 路由配置
const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { 
      title: '首页', 
      requiresAuth: true,
      showSidebar: true,
      showBreadcrumb: false
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
    meta: { 
      title: '登录', 
      hideLayout: true, 
      requiresAuth: false 
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/Register.vue'),
    meta: { 
      title: '注册', 
      hideLayout: true, 
      requiresAuth: false 
    }
  },
  // 资源管理模块
  {
    path: '/resources',
    name: 'Resources',
    component: () => import('@/views/resources/ResourceList.vue'),
    meta: { 
      title: '学习资源', 
      requiresAuth: true,
      showSidebar: true,
      showBreadcrumb: true
    }
  },
  {
    path: '/resources/:id',
    name: 'ResourceDetail',
    component: () => import('@/views/resources/ResourceDetail.vue'),
    meta: { 
      title: '资源详情', 
      requiresAuth: true,
      showSidebar: true,
      showBreadcrumb: true
    }
  },
  {
    path: '/resources/upload',
    name: 'ResourceUpload',
    component: () => import('@/views/resources/ResourceUpload.vue'),
    meta: { 
      title: '上传资源', 
      requiresAuth: true, 
      roles: ['teacher', 'admin', 'student'],
      showSidebar: true,
      showBreadcrumb: true
    }
  },
  // 问答系统模块
  {
    path: '/questions',
    name: 'Questions',
    component: () => import('@/views/questions/QuestionList.vue'),
    meta: { 
      title: '问答社区', 
      requiresAuth: true,
      showSidebar: true,
      showBreadcrumb: true
    }
  },
  {
    path: '/questions/:id',
    name: 'QuestionDetail',
    component: () => import('@/views/questions/QuestionDetail.vue'),
    meta: { 
      title: '问题详情', 
      requiresAuth: true,
      showSidebar: true,
      showBreadcrumb: true
    }
  },
  {
    path: '/questions/ask',
    name: 'AskQuestion',
    component: () => import('@/views/questions/AskQuestion.vue'),
    meta: { 
      title: '提问', 
      requiresAuth: true,
      showSidebar: true,
      showBreadcrumb: true
    }
  },
  // 课程管理模块
  {
    path: '/courses',
    name: 'Courses',
    component: () => import('@/views/courses/CourseList.vue'),
    meta: { 
      title: '课程管理', 
      requiresAuth: true,
      showSidebar: true,
      showBreadcrumb: true
    }
  },
  // 用户中心模块
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/user/Profile.vue'),
    meta: { 
      title: '个人中心', 
      requiresAuth: true,
      showSidebar: true,
      showBreadcrumb: true
    }
  },
  {
    path: '/profile/settings',
    name: 'Settings',
    component: () => import('@/views/user/Settings.vue'),
    meta: { 
      title: '设置', 
      requiresAuth: true,
      showSidebar: true,
      showBreadcrumb: true
    }
  },
  // 管理员后台模块
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/views/admin/Dashboard.vue'),
    meta: { 
      title: '管理员后台', 
      requiresAuth: true, 
      roles: ['admin'],
      showSidebar: true,
      showBreadcrumb: true
    }
  },
  {
    path: '/admin/users',
    name: 'UserManagement',
    component: () => import('@/views/admin/UserManagement.vue'),
    meta: { 
      title: '用户管理', 
      requiresAuth: true, 
      roles: ['admin'],
      showSidebar: true,
      showBreadcrumb: true
    }
  },
  {
    path: '/admin/resources',
    name: 'ResourceManagement',
    component: () => import('@/views/admin/ResourceManagement.vue'),
    meta: { 
      title: '资源管理', 
      requiresAuth: true, 
      roles: ['admin'],
      showSidebar: true,
      showBreadcrumb: true
    }
  },
  {
    path: '/admin/questions',
    name: 'QuestionManagement',
    component: () => import('@/views/admin/QuestionManagement.vue'),
    meta: { 
      title: '问答管理', 
      requiresAuth: true, 
      roles: ['admin'],
      showSidebar: true,
      showBreadcrumb: true
    }
  },
  {
    path: '/admin/courses',
    name: 'CourseManagement',
    component: () => import('@/views/admin/CourseManagement.vue'),
    meta: { 
      title: '课程管理', 
      requiresAuth: true, 
      roles: ['admin'],
      showSidebar: true,
      showBreadcrumb: true
    }
  },
  {
    path: '/admin/teachers',
    name: 'TeacherManagement',
    component: () => import('@/views/admin/TeacherManagement.vue'),
    meta: { 
      title: '教师管理', 
      requiresAuth: true, 
      roles: ['admin'],
      showSidebar: true,
      showBreadcrumb: true
    }
  },
  // 404页面
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: { 
      title: '页面未找到', 
      hideLayout: true 
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // 返回页面时保持滚动位置
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 路由守卫 - 权限控制
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // 检查是否需要认证
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    console.log('路由守卫: 用户未认证，跳转到登录页')
    next('/login')
    return
  }
  
  // 检查角色权限
  if (to.meta.roles && !to.meta.roles.includes(authStore.userRole)) {
    console.log('路由守卫: 用户权限不足，跳转到首页')
    // 如果没有权限，跳转到首页并显示提示
    if (from.path !== '/home') {
      next('/home')
    } else {
      next(false) // 停留在当前页面
    }
    return
  }
  
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - EduShare QA`
  }
  
  console.log('路由守卫: 允许访问', to.path)
  next()
})

// 路由后置守卫
router.afterEach((to, from) => {
  // 可以在这里添加页面访问统计等逻辑
  if (to.meta.title) {
    console.log(`页面访问: ${to.meta.title}`)
  }
})

export default router