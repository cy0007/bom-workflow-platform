import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// 路由组件懒加载
const HomeView = () => import('../views/HomeView.vue')
const BomListView = () => import('../views/BomListView.vue')
const BomDetailView = () => import('../views/BomDetailView.vue')

// 路由配置
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
    meta: {
      title: '首页',
      icon: 'home'
    }
  },
  {
    path: '/boms',
    name: 'BomList',
    component: BomListView,
    meta: {
      title: 'BOM列表',
      icon: 'list'
    }
  },
  {
    path: '/boms/:style_code',
    name: 'BomDetail',
    component: BomDetailView,
    meta: {
      title: 'BOM详情',
      icon: 'document'
    },
    props: true // 将路由参数作为props传递给组件
  },
  // 404页面重定向
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/'
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // 路由切换时的滚动行为
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - BOM协同工作流平台`
  } else {
    document.title = 'BOM协同工作流平台'
  }
  
  // TODO: 在这里添加身份验证检查
  // if (to.matched.some(record => record.meta.requiresAuth)) {
  //   // 检查是否已登录
  //   const token = localStorage.getItem('auth_token')
  //   if (!token) {
  //     next('/login')
  //     return
  //   }
  // }
  
  next()
})

// 路由错误处理
router.onError((error) => {
  console.error('路由错误:', error)
})

export default router
