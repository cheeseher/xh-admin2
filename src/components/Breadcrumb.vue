<template>
  <div class="breadcrumb-wrapper">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item v-for="(item, index) in breadcrumbs" :key="index" :to="item.path">
        <span class="breadcrumb-text">{{ item.title }}</span>
      </el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const breadcrumbs = ref<Array<{ title: string; path?: string }>>([])

// 根据当前路由生成面包屑
const generateBreadcrumbs = () => {
  breadcrumbs.value = []

  // 使用 route.matched 来获取路由信息
  const matchedRoutes = route.matched.filter(
    (r) => r.meta && r.meta.title
  )

  // 始终添加一个不可点击的"首页"或"数据概览"作为根路径，如果当前不是根路径
  // 这里的逻辑基于 App.vue 中 /data 是默认首页
  if (route.path !== '/data') {
    breadcrumbs.value.push({ title: '数据概览', path: '/data' });
  }
  
  matchedRoutes.forEach((record) => {
    // 如果是重定向的父路由，通常不直接显示在面包屑中，除非它有明确的title
    // 且避免重复添加首页
    if (record.meta.title && (record.path !== '/data' || breadcrumbs.value.length === 0)) {
        const breadcrumbItem: { title: string; path?: string } = {
            title: record.meta.title as string,
        };
        // 通常面包屑的最后一项不可点击，或者指向当前页
        // 对于中间项，如果它们不是重定向占位符，则可以有 path
        if (record.path !== route.path && !record.redirect) {
            breadcrumbItem.path = record.path;
        }
        // 避免重复添加与首页title相同的项，除非它是当前页
        if (breadcrumbs.value.length > 0 && breadcrumbs.value[breadcrumbs.value.length -1].title === record.meta.title && record.path !== route.path) {
            //skip
        } else {
             breadcrumbs.value.push(breadcrumbItem);
        }
    }
  });

  // 如果当前路由是 /data 且面包屑为空（比如直接访问/data），则添加它
  if (route.path === '/data' && breadcrumbs.value.length === 0) {
     breadcrumbs.value.push({ title: '数据概览', path: '/data' });
  }
  
  // 如果面包屑为空（例如，对于没有 meta.title 的路由），可以添加一个默认项
  if (breadcrumbs.value.length === 0 && route.meta.title) {
      breadcrumbs.value.push({ title: route.meta.title as string });
  }
}

// 监听路由变化
watch(
  () => route.path,
  () => {
    generateBreadcrumbs()
  },
  { immediate: true }
)
</script>

<style scoped>
.breadcrumb-wrapper {
  height: 100%;
  display: flex;
  align-items: center;
}

/*
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

:deep(.el-breadcrumb__item:not(:last-child) .el-breadcrumb__inner.is-link),
:deep(.el-breadcrumb__item:not(:last-child) .el-breadcrumb__inner span.is-link) { 
  color: #409EFF; 
  font-weight: 500;
  cursor: pointer; 
}

:deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
  color: #303133;
  font-weight: 600;
  cursor: default; 
}

:deep(.el-breadcrumb__separator) {
  margin: 0 8px;
  color: #C0C4CC;
}
*/

.breadcrumb-text {
  font-size: 14px;
}

/* Simplified last-child styling, as direct inner text is now styled */
</style>