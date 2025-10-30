import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '../views/LoginPage.vue'
import HomePage from '../views/HomePage.vue'
import HelloWorld from '../views/HelloWorld.vue'
import CategoryManagement from '../views/CategoryManagement.vue'
import ProductManagement from '../views/ProductManagement.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
    meta: { requiresAuth: false }
  },
  {
    path: '/home',
    name: 'Home',
    component: HomePage,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('../views/Dashboard.vue')
      },
      {
        path: 'category',
        name: 'CategoryManagement',
        component: CategoryManagement
      },
      {
        path: 'product',
        name: 'ProductManagement',
        component: ProductManagement
      },
      {
        path: 'hello',
        name: 'HelloWorld',
        component: HelloWorld
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫 - 身份验证检查
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  
  // 如果目标路由需要认证且没有token，跳转到登录页
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router