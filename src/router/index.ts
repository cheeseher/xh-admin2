import { createRouter, createWebHashHistory } from 'vue-router'
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
    path: '/data',
    name: 'data',
    component: () => import('../views/DataView.vue'),
    meta: {
      title: '数据概览',
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
    path: '/payment-config',
    name: 'paymentConfig',
    component: () => import('../views/PaymentConfigView.vue'),
    meta: {
      title: '支付配置',
      requiresAuth: true
    }
  },
  {
    path: '/orders',
    name: 'orders',
    component: () => import('../views/OrdersView.vue'),
    meta: {
      title: '商品订单管理',
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
    path: '/system',
    name: 'system',
    redirect: '/system/settings',
    meta: {
      requiresAuth: true
    },
    children: [
      {
        path: 'settings',
        name: 'settings',
        component: () => import('../views/SettingsView.vue'),
        meta: {
          title: '系统设置',
          requiresAuth: true
        }
      },
      {
        path: 'docs',
        name: 'documentSettings',
        component: () => import('../views/system/DocumentSettingsView.vue'),
        meta: {
          title: '系统文档设置',
          requiresAuth: true
        }
      },
      {
        path: 'accounts',
        name: 'accounts',
        component: () => import('../views/AccountsView.vue'),
        meta: {
          title: '账户管理',
          requiresAuth: true
        }
      },
      {
        path: 'logs',
        name: 'logs',
        component: () => import('../views/LogsView.vue'),
        meta: {
          title: '操作日志',
          requiresAuth: true
        }
      }
    ]
  },
  {
    path: '/content',
    name: 'content',
    redirect: '/content/template',
    meta: {
      requiresAuth: true
    },
    children: [
      {
        path: 'template',
        name: 'template',
        component: () => import('../views/TemplateSettingsView.vue'),
        meta: {
          title: '模板设置',
          requiresAuth: true
        }
      },
      {
        path: 'messages',
        name: 'messages',
        component: () => import('../views/MessagesView.vue'),
        meta: {
          title: '站内信',
          requiresAuth: true
        }
      },
      {
        path: 'help',
        name: 'helpCenter',
        component: () => import('../views/info/HelpView.vue'),
        meta: {
          title: '帮助中心',
          requiresAuth: true
        }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFoundView.vue'),
    meta: {
      title: '页面不存在',
      requiresAuth: false
    }
  }
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
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
        query: { redirect: to.fullPath }
      })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router