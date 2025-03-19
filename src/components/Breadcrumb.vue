<template>
  <div class="breadcrumb-wrapper">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item v-for="(item, index) in breadcrumbs" :key="index" :to="item.path">
        <el-icon v-if="item.icon" class="breadcrumb-icon">
          <component :is="iconMap[item.icon]" />
        </el-icon>
        <span class="breadcrumb-text">{{ item.title }}</span>
      </el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  DataAnalysis, 
  ShoppingCart, 
  Goods, 
  User, 
  Management, 
  Setting, 
  Menu, 
  Document, 
  ChatLineSquare, 
  Wallet, 
  Box, 
  Lock, 
  List, 
  UserFilled
} from '@element-plus/icons-vue'

// 路由映射表
const routeMap: Record<string, { title: string; icon: string }> = {
  '/data': { title: '数据概览', icon: 'DataAnalysis' },
  '/orders': { title: '商品订单', icon: 'ShoppingCart' },
  '/products': { title: '商品列表', icon: 'Goods' },
  '/categories': { title: '分类管理', icon: 'Menu' },
  '/inventory': { title: '库存管理', icon: 'Box' },
  '/users': { title: '用户管理', icon: 'User' },
  '/accounts': { title: '账户管理', icon: 'Lock' },
  '/settings': { title: '系统设置', icon: 'Setting' },
  '/logs': { title: '操作日志', icon: 'List' },
  '/docs': { title: '系统文档设置', icon: 'Document' },
  '/templates': { title: '模板设置', icon: 'Document' },
  '/messages': { title: '站内信', icon: 'ChatLineSquare' },
  '/user/profile': { title: '个人信息', icon: 'User' },
  '/user/reset-password': { title: '修改密码', icon: 'Lock' }
}

// 菜单层级映射
const menuHierarchy: Record<string, { parent: string; title: string; icon: string }> = {
  // 订单管理
  '/orders': { parent: 'order-management', title: '订单管理', icon: 'ShoppingCart' },
  '/recharge-orders': { parent: 'order-management', title: '订单管理', icon: 'ShoppingCart' },
  
  // 商品管理
  '/products': { parent: 'product-management', title: '商品管理', icon: 'Goods' },
  '/categories': { parent: 'product-management', title: '商品管理', icon: 'Goods' },
  '/inventory': { parent: 'product-management', title: '商品管理', icon: 'Goods' },
  
  // 内容管理
  '/templates': { parent: 'content-management', title: '内容管理', icon: 'Document' },
  '/messages': { parent: 'content-management', title: '内容管理', icon: 'Document' },
  
  // 系统管理
  '/settings': { parent: 'system-management', title: '系统管理', icon: 'Setting' },
  '/document-settings': { parent: 'system-management', title: '系统管理', icon: 'Setting' },
  '/accounts': { parent: 'system-management', title: '系统管理', icon: 'Setting' },
  '/logs': { parent: 'system-management', title: '系统管理', icon: 'Setting' },
  
  // 用户相关
  '/user/profile': { parent: '/user', title: '用户', icon: 'User' },
  '/user/reset-password': { parent: '/user', title: '用户', icon: 'User' }
}

// 图标映射表
const iconMap: Record<string, any> = {
  DataAnalysis,
  ShoppingCart,
  Goods,
  Menu,
  Box,
  User,
  UserFilled,
  Management,
  Setting,
  Document,
  Lock,
  List,
  ChatLineSquare,
  Wallet
}

const route = useRoute()
const router = useRouter()
const breadcrumbs = ref<Array<{ title: string; path: string; icon: string | null }>>([])

// 根据当前路由生成面包屑
const generateBreadcrumbs = () => {
  const currentPath = route.path
  
  // 清空面包屑
  breadcrumbs.value = []
  
  // 始终添加首页
  breadcrumbs.value.push({ 
    title: '首页', 
    path: '/data', 
    icon: 'DataAnalysis' 
  })
  
  // 如果不是首页，处理当前路径
  if (currentPath !== '/data') {
    // 检查当前路径是否在路由映射表中
    const routeInfo = routeMap[currentPath]
    
    // 检查当前路径是否有父级菜单
    const hierarchy = menuHierarchy[currentPath]
    
    if (hierarchy && routeInfo) {
      // 添加父级菜单
      breadcrumbs.value.push({
        title: hierarchy.title,
        path: '#', // 父级菜单不可点击
        icon: hierarchy.icon
      })
      
      // 添加当前页面
      breadcrumbs.value.push({
        title: routeInfo.title,
        path: currentPath,
        icon: routeInfo.icon
      })
    } else if (routeInfo) {
      // 直接添加当前页面（一级菜单）
      breadcrumbs.value.push({
        title: routeInfo.title,
        path: currentPath,
        icon: routeInfo.icon
      })
    } else {
      // 处理嵌套路由（如 /user/profile）
      const pathParts = currentPath.split('/').filter(Boolean)
      let currentPathBuild = ''
      
      for (const part of pathParts) {
        currentPathBuild += `/${part}`
        
        // 检查是否是中间路径（如 /user）
        if (currentPathBuild !== currentPath) {
          const parentInfo = routeMap[currentPathBuild]
          if (parentInfo) {
            breadcrumbs.value.push({
              title: parentInfo.title,
              path: currentPathBuild,
              icon: parentInfo.icon
            })
          }
        } else {
          // 最终路径（如 /user/profile）
          const finalInfo = routeMap[currentPathBuild]
          if (finalInfo) {
            breadcrumbs.value.push({
              title: finalInfo.title,
              path: currentPathBuild,
              icon: finalInfo.icon
            })
          }
        }
      }
    }
  }
}

// 监听路由变化
watch(() => route.path, () => {
  generateBreadcrumbs()
}, { immediate: true })
</script>

<style scoped>
.breadcrumb-wrapper {
  height: 100%;
  display: flex;
  align-items: center;
}

:deep(.el-breadcrumb) {
  font-size: 14px;
  line-height: 1;
  display: flex;
  align-items: center;
}

:deep(.el-breadcrumb__item) {
  display: flex;
  align-items: center;
}

:deep(.el-breadcrumb__inner) {
  display: flex;
  align-items: center;
  color: #606266;
  font-weight: normal;
}

:deep(.el-breadcrumb__inner.is-link) {
  color: #409EFF;
  font-weight: 500;
}

:deep(.el-breadcrumb__separator) {
  margin: 0 8px;
  color: #C0C4CC;
}

.breadcrumb-icon {
  margin-right: 6px;
  font-size: 16px;
}

.breadcrumb-text {
  font-size: 14px;
}

:deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
  color: #303133;
  font-weight: 600;
}
</style> 