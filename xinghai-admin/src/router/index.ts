import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
    meta: {
      title: '登录',
      requiresAuth: false
    }
  },
  {
    path: '/',
    redirect: '/data',
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/user',
    name: 'user',
    redirect: '/user/profile',
    meta: {
      requiresAuth: true
    },
    children: [
      {
        path: 'profile',
        name: 'profile',
        component: () => import('../views/user/ProfileView.vue'),
        meta: {
          title: '个人信息',
          requiresAuth: true
        }
      },
      {
        path: 'reset-password',
        name: 'resetPassword',
        component: () => import('../views/user/ResetPasswordView.vue'),
        meta: {
          title: '修改密码',
          requiresAuth: true
        }
      }
    ]
  },
  {
    path: '/data',
    name: 'data',
    component: () => import('../views/DataView.vue'),
    meta: {
      title: '数据概览',
      requiresAuth: true
    }
  },
  {
    path: '/orders',
    name: 'orders',
    component: () => import('../views/OrdersView.vue'),
    meta: {
      title: '订单管理',
      requiresAuth: true
    }
  },
  {
    path: '/products',
    name: 'products',
    component: () => import('../views/ProductsView.vue'),
    meta: {
      title: '商品管理',
      requiresAuth: true
    }
  },
  {
    path: '/categories',
    name: 'categories',
    component: () => import('../views/CategoriesView.vue'),
    meta: {
      title: '分类管理',
      requiresAuth: true
    }
  },
  {
    path: '/users',
    name: 'users',
    component: () => import('../views/UsersView.vue'),
    meta: {
      title: '用户管理',
      requiresAuth: true
    }
  },
  {
    path: '/roles',
    name: 'roles',
    component: () => import('../views/RolesView.vue'),
    meta: {
      title: '角色管理',
      requiresAuth: true
    }
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('../views/SettingsView.vue'),
    meta: {
      title: '系统设置',
      requiresAuth: true
    }
  },
  {
    path: '/templates',
    name: 'templates',
    component: () => import('../views/TemplateSettingsView.vue'),
    meta: {
      title: '模板设置',
      requiresAuth: true
    }
  },
  {
    path: '/info',
    name: 'info',
    redirect: '/info/faq',
    meta: {
      requiresAuth: true
    },
    children: [
      {
        path: 'faq',
        name: 'faq',
        component: () => import('../views/info/FaqView.vue'),
        meta: {
          title: '常见问题',
          requiresAuth: true
        }
      },
      {
        path: 'help',
        name: 'help',
        component: () => import('../views/info/HelpView.vue'),
        meta: {
          title: '帮助文档',
          requiresAuth: true
        }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 星海后台管理系统` : '星海后台管理系统'
  
  // 判断该路由是否需要登录权限
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // 获取用户登录状态
    const token = localStorage.getItem('token')
    
    if (!token) {
      // 未登录，跳转到登录页面
      next({
        path: '/login',
        query: { redirect: to.fullPath } // 将要跳转的路由path作为参数，登录成功后跳转到该路由
      })
    } else {
      next()
    }
  } else {
    // 不需要登录权限的路由直接放行
    next()
  }
})

export default router 