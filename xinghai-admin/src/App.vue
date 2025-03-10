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
          default-active="/data"
          class="el-menu-vertical"
          background-color="#001529"
          text-color="#fff"
          active-text-color="#409EFF"
          :collapse="isCollapse">
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
            <el-menu-item index="/recharge-orders">
              <el-icon><Wallet /></el-icon>
              <template #title>充值订单</template>
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
          
          <!-- 会员设置 -->
          <el-menu-item index="/members">
            <el-icon><UserFilled /></el-icon>
            <template #title>会员设置</template>
          </el-menu-item>
          
          <!-- 内容管理 -->
          <el-sub-menu index="content-management">
            <template #title>
              <el-icon><Document /></el-icon>
              <span>内容管理</span>
            </template>
            <el-menu-item index="/docs">
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
          
          <!-- 权限管理 -->
          <el-sub-menu index="user-management">
            <template #title>
              <el-icon><Management /></el-icon>
              <span>权限管理</span>
            </template>
            <el-menu-item index="/roles">
              <el-icon><User /></el-icon>
              <template #title>角色管理</template>
            </el-menu-item>
            <el-menu-item index="/accounts">
              <el-icon><Lock /></el-icon>
              <template #title>账户管理</template>
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
            <div class="notification-icon" @click="goToMessages">
              <el-badge :value="pendingMessages" :max="99" :hidden="pendingMessages === 0" class="notification-badge">
                <el-icon><Bell /></el-icon>
              </el-badge>
            </div>
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
import { ref, computed, onMounted } from 'vue'
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
  Lock,
  List,
  ChatLineSquare,
  Bell,
  Wallet,
  Management
} from '@element-plus/icons-vue'
import Breadcrumb from '@/components/Breadcrumb.vue'

const router = useRouter()
const route = useRoute()

// 判断当前是否为登录页面
const isLoginPage = computed(() => {
  return route.path === '/login'
})

// 控制菜单折叠状态
const isCollapse = ref(false)

// 切换菜单折叠状态
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

// 获取用户信息
const userInfo = computed(() => {
  const userInfoStr = localStorage.getItem('userInfo')
  return userInfoStr ? JSON.parse(userInfoStr) : { username: '管理员', role: '管理员', avatar: '' }
})

// 用户名
const username = computed(() => userInfo.value.username)

// 用户头像
const userAvatar = computed(() => {
  return userInfo.value.avatar || 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
})

// 处理下拉菜单命令
const handleCommand = (command: string) => {
  if (command === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      // 清除登录状态
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      
      // 跳转到登录页
      router.push('/login')
    }).catch(() => {
      // 取消退出
    })
  } else if (command === 'profile') {
    // 跳转到个人信息页面
    router.push('/user/profile')
  } else if (command === 'password') {
    // 跳转到修改密码页面
    router.push('/user/reset-password')
  }
}

// 未解决的补货提醒数量
const pendingMessages = ref(0)

// 跳转到站内信页面
const goToMessages = () => {
  router.push('/messages')
}

// 获取未解决的补货提醒数量
const fetchPendingMessages = () => {
  // 实际项目中应该调用API获取未解决的补货提醒数量
  // 这里模拟一个随机数
  pendingMessages.value = Math.floor(Math.random() * 10)
}

onMounted(() => {
  // 获取未解决的补货提醒数量
  fetchPendingMessages()
  
  // 每隔5分钟刷新一次未解决的补货提醒数量
  setInterval(() => {
    fetchPendingMessages()
  }, 5 * 60 * 1000)
})
</script>

<style scoped>
.app-container {
  height: 100%;
}

.el-container {
  height: 100%;
}

.sidebar-container {
  background-color: #001529;
  color: #fff;
  transition: width 0.3s;
  overflow: hidden;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-left: 20px;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  background-color: #002140;
  overflow: hidden;
  white-space: nowrap;
}

.logo .el-icon {
  margin-right: 10px;
  font-size: 20px;
}

.el-menu {
  border-right: none;
}

.el-menu-vertical:not(.el-menu--collapse) {
  width: 200px;
}

.el-header {
  background-color: #fff;
  color: #333;
  line-height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
  height: 100%;
}

.header-left .collapse-btn {
  font-size: 20px;
  cursor: pointer;
  margin-right: 20px;
  display: flex;
  align-items: center;
}

.breadcrumb-container {
  margin-left: 10px;
  height: 100%;
  display: flex;
  align-items: center;
}

.header-right {
  display: flex;
  align-items: center;
  height: 100%;
}

.notification-icon {
  margin-right: 20px;
  cursor: pointer;
  position: relative;
  font-size: 20px;
  display: flex;
  align-items: center;
}

.notification-icon .el-icon {
  font-size: 20px;
  color: #606266;
}

.notification-icon:hover .el-icon {
  color: #409EFF;
}

:deep(.notification-badge .el-badge__content) {
  position: static;
  transform: none;
  margin-left: 5px;
  background-color: #f56c6c;
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

/* 自定义下拉菜单宽度 */
:deep(.el-dropdown-menu) {
  min-width: 168px !important;
}

:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
}

:deep(.el-dropdown-menu__item .el-icon) {
  margin-right: 8px;
  font-size: 16px;
}

.el-menu-vertical {
  height: calc(100vh - 60px);
  overflow-y: auto;
  overflow-x: hidden;
}

/* 自定义滚动条样式 */
.el-menu-vertical::-webkit-scrollbar {
  width: 6px;
}

.el-menu-vertical::-webkit-scrollbar-thumb {
  background-color: rgba(144, 147, 153, 0.3);
  border-radius: 3px;
}

.el-menu-vertical::-webkit-scrollbar-track {
  background-color: transparent;
}
</style> 