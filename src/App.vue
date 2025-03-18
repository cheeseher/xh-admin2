<template>
  <div class="app-container">
    <!-- 登录页面不显示侧边栏和顶部导航栏 -->
    <template v-if="isLoginPage">
      <router-view />
    </template>
    
    <!-- 其他页面显示完整布局 -->
    <el-container v-else>
      <el-aside :width="isCollapse ? '64px' : '200px'" class="sidebar-container">
        <div class="logo">
          <el-icon v-if="!isCollapse"><Monitor /></el-icon>
          <span v-if="!isCollapse">星海管理系统</span>
          <el-icon v-else><Monitor /></el-icon>
        </div>
        <el-menu
          router
          :default-active="route.path"
          class="el-menu-vertical"
          background-color="#001529"
          text-color="#fff"
          active-text-color="#1890ff"
          :collapse="isCollapse"
          :collapse-transition="false">
          <el-menu-item index="/data">
            <el-icon><DataAnalysis /></el-icon>
            <template #title>数据概览</template>
          </el-menu-item>
          
          <!-- 订单管理 -->
          <el-sub-menu index="order-management">
            <template #title>
              <el-icon><ShoppingCart /></el-icon>
              <span>订单管理</span>
            </template>
            <el-menu-item index="/orders">
              <el-icon><ShoppingCart /></el-icon>
              <template #title>商品订单</template>
            </el-menu-item>
          </el-sub-menu>
          
          <!-- 商品管理 -->
          <el-sub-menu index="product-management">
            <template #title>
              <el-icon><Goods /></el-icon>
              <span>商品管理</span>
            </template>
            <el-menu-item index="/products">
              <el-icon><Goods /></el-icon>
              <template #title>商品列表</template>
            </el-menu-item>
            <el-menu-item index="/categories">
              <el-icon><Menu /></el-icon>
              <template #title>分类管理</template>
            </el-menu-item>
            <el-menu-item index="/inventory">
              <el-icon><Box /></el-icon>
              <template #title>库存管理</template>
            </el-menu-item>
          </el-sub-menu>
          
          <!-- 用户管理 -->
          <el-menu-item index="/users">
            <el-icon><User /></el-icon>
            <template #title>用户管理</template>
          </el-menu-item>
          
          <!-- 内容管理 -->
          <el-sub-menu index="content-management">
            <template #title>
              <el-icon><Document /></el-icon>
              <span>内容管理</span>
            </template>
            <el-menu-item index="/document-settings">
              <el-icon><Document /></el-icon>
              <template #title>文档设置</template>
            </el-menu-item>
            <el-menu-item index="/templates">
              <el-icon><Document /></el-icon>
              <template #title>模板设置</template>
            </el-menu-item>
            <el-menu-item index="/messages">
              <el-icon><ChatLineSquare /></el-icon>
              <template #title>站内信</template>
            </el-menu-item>
          </el-sub-menu>
          
          <!-- 系统管理 -->
          <el-sub-menu index="system-management">
            <template #title>
              <el-icon><Setting /></el-icon>
              <span>系统管理</span>
            </template>
            <el-menu-item index="/settings">
              <el-icon><Setting /></el-icon>
              <template #title>系统设置</template>
            </el-menu-item>
            <el-menu-item index="/accounts">
              <el-icon><Lock /></el-icon>
              <template #title>账户管理</template>
            </el-menu-item>
            <el-menu-item index="/logs">
              <el-icon><List /></el-icon>
              <template #title>操作日志</template>
            </el-menu-item>
          </el-sub-menu>
        </el-menu>
      </el-aside>
      <el-container>
        <el-header>
          <div class="header-left">
            <el-icon class="collapse-btn" @click="toggleCollapse"><Fold v-if="!isCollapse" /><Expand v-else /></el-icon>
            <div class="breadcrumb-container">
              <Breadcrumb />
            </div>
          </div>
          <div class="header-right">
            <el-dropdown trigger="click" @command="handleCommand">
              <div class="user-info">
                <el-avatar :size="32" :src="userAvatar"></el-avatar>
                <span class="username">{{ username }}</span>
                <el-icon><ArrowDown /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu style="width: 168px;">
                  <el-dropdown-item command="profile">
                    <el-icon><UserFilled /></el-icon>
                    个人信息
                  </el-dropdown-item>
                  <el-dropdown-item command="password">
                    <el-icon><Key /></el-icon>
                    修改密码
                  </el-dropdown-item>
                  <el-dropdown-item divided command="logout">
                    <el-icon><SwitchButton /></el-icon>
                    退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>
        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { 
  Monitor, 
  DataAnalysis,
  ShoppingCart, 
  Goods,
  Box,
  User, 
  UserFilled,
  Setting, 
  Fold,
  Expand,
  ArrowDown,
  Key,
  SwitchButton,
  Menu,
  Document,
  ChatLineSquare,
  List,
  Lock
} from '@element-plus/icons-vue'
import Breadcrumb from './components/Breadcrumb.vue'

const router = useRouter()
const route = useRoute()

// 侧边栏折叠状态
const isCollapse = ref(false)

// 用户信息
const username = ref('Admin')
const userAvatar = ref('https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png')

// 判断是否是登录页面
const isLoginPage = computed(() => {
  return route.path === '/login'
})

// 切换侧边栏折叠状态
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

// 处理用户菜单命令
const handleCommand = (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/user/profile')
      break
    case 'password':
      router.push('/user/reset-password')
      break
    case 'logout':
      ElMessageBox.confirm(
        '确定要退出登录吗？',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        // 清除登录状态
        localStorage.removeItem('token')
        // 跳转到登录页
        router.push('/login')
      })
      break
  }
}
</script>

<style scoped>
.app-container {
  height: 100vh;
}

.sidebar-container {
  background-color: #001529;
  transition: width 0.3s;
  overflow: hidden;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #002140;
  color: #fff;
}

.logo .el-icon {
  font-size: 20px;
  margin-right: 8px;
}

.el-menu-vertical:not(.el-menu--collapse) {
  width: 200px;
  min-height: calc(100vh - 60px);
}

.el-header {
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
}

.collapse-btn {
  font-size: 20px;
  cursor: pointer;
  margin-right: 20px;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.username {
  margin: 0 8px;
  font-size: 14px;
}

.el-main {
  background-color: #f0f2f5;
  padding: 20px;
}

:deep(.el-menu) {
  border-right: none;
}

:deep(.el-menu-item.is-active) {
  background-color: #1890ff !important;
  color: #fff !important;
}

:deep(.el-menu-item:hover) {
  background-color: #1890ff20 !important;
  color: #1890ff !important;
}

:deep(.el-sub-menu__title:hover) {
  background-color: #1890ff20 !important;
  color: #1890ff !important;
}

:deep(.el-sub-menu.is-active .el-sub-menu__title) {
  color: #1890ff !important;
}

:deep(.el-menu-item) {
  &:hover, &:focus {
    background-color: #1890ff20;
  }
}

:deep(.el-sub-menu) {
  .el-sub-menu__title {
    &:hover, &:focus {
      background-color: #1890ff20;
    }
  }
}
</style>