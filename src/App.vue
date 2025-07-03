<template>
  <div class="app-container">
    <!-- 登录页面不显示侧边栏和顶部导航栏 -->
    <router-view v-if="route.path === '/login'" />
    
    <!-- 其他页面显示完整布局 -->
    <el-container v-else>
      <el-aside :width="isCollapse ? '64px' : '210px'" class="sidebar-container">
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
          :collapse-transition="false"
          unique-opened>
          <el-menu-item index="/data">
            <el-icon><DataAnalysis /></el-icon>
            <template #title>数据概览</template>
          </el-menu-item>

          <el-menu-item index="/cost-center">
            <el-icon><Money /></el-icon>
            <template #title>成本中心</template>
          </el-menu-item>

          <el-sub-menu index="/orders-main">
            <template #title>
              <el-icon><ShoppingCart /></el-icon>
              <span>订单管理</span>
            </template>
            <el-menu-item index="/orders">商品订单</el-menu-item>
            <el-menu-item index="/recharge-orders">充值订单</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="/products-main">
            <template #title>
              <el-icon><Goods /></el-icon>
              <span>商品管理</span>
            </template>
            <el-menu-item index="/products">商品列表</el-menu-item>
            <el-menu-item index="/categories">分类管理</el-menu-item>
          </el-sub-menu>

          <el-menu-item index="/users">
            <el-icon><User /></el-icon>
            <template #title>用户管理</template>
          </el-menu-item>

          <el-menu-item index="/payment-config">
            <el-icon><Setting /></el-icon>
            <template #title>支付配置</template>
          </el-menu-item>

          <el-menu-item index="/member-settings">
            <el-icon><User /></el-icon>
            <template #title>会员设置</template>
          </el-menu-item>

          <el-sub-menu index="/content-main">
            <template #title>
              <el-icon><Document /></el-icon>
              <span>内容管理</span>
            </template>
            <el-menu-item index="/content/template">模板设置</el-menu-item>
            <el-menu-item index="/content/messages">站内信</el-menu-item>
            <el-menu-item index="/content/notice">公告管理</el-menu-item>
            <el-menu-item index="/content/help">
              <span>帮助中心</span>
            </el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="/system-main">
            <template #title>
              <el-icon><Setting /></el-icon>
              <span>系统管理</span>
            </template>
            <el-menu-item index="/system/settings">系统设置</el-menu-item>
            <el-menu-item index="/system/docs">系统文档设置</el-menu-item>
            <el-menu-item index="/system/accounts">账户管理</el-menu-item>
            <el-menu-item index="/system/logs">操作日志</el-menu-item>
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
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { 
  Monitor, 
  DataAnalysis,
  ShoppingCart, 
  Goods,
  User, 
  Setting, 
  Fold,
  Expand,
  ArrowDown,
  Key,
  SwitchButton,
  Document,
  Money,
} from '@element-plus/icons-vue'
import Breadcrumb from './components/Breadcrumb.vue'

const router = useRouter()
const route = useRoute()

// 侧边栏折叠状态
const isCollapse = ref(false)

// 用户信息
const username = ref('Admin')
const userAvatar = ref('https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png')

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
        localStorage.removeItem('userInfo') // Also remove userInfo if it was set
        // 跳转到登录页
        router.push('/login') 
        ElMessage.success('已退出登录') 
      }).catch(() => {
        ElMessage.info('已取消退出登录'); // Inform user if cancelled
      })
      break
  }
}
</script>

<style scoped>
.app-container {
  height: 100vh;
  display: flex;
}

.sidebar-container {
  background-color: #001529;
  transition: width 0.3s;
  overflow-y: auto;
  overflow-x: hidden;
  position: sticky;
  top: 0;
  height: 100vh; 
  z-index: 1000;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #001529;
  color: #fff;
}

.logo .el-icon {
  font-size: 20px;
  margin-right: 8px;
}

.el-menu-vertical:not(.el-menu--collapse) {
  width: 210px;
  min-height: calc(100vh - 60px);
}

.el-header {
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 60px;
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
  flex: 1;
}
/*
:deep(.el-menu) {
  border-right: none;
}

:deep(.el-menu-item.is-active) {
  background-color: #1890ff !important;
  color: #fff !important;
}

:deep(.el-menu-item:not(.is-active):hover), 
:deep(.el-sub-menu__title:hover) {
  background-color: #1890ff20 !important;
  color: #1890ff !important;
}

:deep(.el-sub-menu.is-active .el-sub-menu__title) {
  color: #1890ff !important;
}

:deep(.el-container) {
  margin: 0;
  padding: 0;
  display: flex;
  flex: 1;
}

:deep(.el-container .el-container) {
  margin: 0;
  padding: 0;
}

:deep(.el-container .el-aside) {
  margin: 0;
  padding: 0;
  flex-shrink: 0;
  border: none;
}
*/
</style>