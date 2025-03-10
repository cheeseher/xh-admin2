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
  DataLine, 
  ShoppingCart, 
  Goods, 
  User, 
  Avatar, 
  Setting,
  Collection,
  QuestionFilled,
  InfoFilled,
  Document
} from '@element-plus/icons-vue'

// 路由映射表
const routeMap: Record<string, { title: string; icon: string }> = {
  '/data': { title: '数据概览', icon: 'DataLine' },
  '/orders': { title: '订单管理', icon: 'ShoppingCart' },
  '/products': { title: '商品管理', icon: 'Goods' },
  '/categories': { title: '分类管理', icon: 'Collection' },
  '/users': { title: '用户管理', icon: 'User' },
  '/roles': { title: '角色管理', icon: 'Avatar' },
  '/settings': { title: '系统设置', icon: 'Setting' },
  '/info': { title: '资讯管理', icon: 'InfoFilled' },
  '/info/faq': { title: '常见问题', icon: 'QuestionFilled' },
  '/info/help': { title: '帮助文档', icon: 'Document' }
}

// 图标映射表
const iconMap: Record<string, any> = {
  DataLine,
  ShoppingCart,
  Goods,
  Collection,
  User,
  Avatar,
  Setting,
  QuestionFilled,
  InfoFilled,
  Document
}

const route = useRoute()
const router = useRouter()
const breadcrumbs = ref<Array<{ title: string; path: string; icon: string | null }>>([])

// 根据当前路由生成面包屑
const generateBreadcrumbs = () => {
  const currentPath = route.path
  const pathParts = currentPath.split('/').filter(Boolean)
  
  // 始终添加首页
  breadcrumbs.value = [
    { title: '首页', path: '/data', icon: 'DataLine' }
  ]
  
  // 如果不是首页，添加当前页面的路径
  if (currentPath !== '/data') {
    let currentPathBuild = ''
    
    for (const part of pathParts) {
      currentPathBuild += `/${part}`
      const routeInfo = routeMap[currentPathBuild]
      
      if (routeInfo) {
        breadcrumbs.value.push({
          title: routeInfo.title,
          path: currentPathBuild,
          icon: routeInfo.icon
        })
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