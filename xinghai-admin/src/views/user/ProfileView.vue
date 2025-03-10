<template>
  <div class="profile-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>个人信息</span>
          <el-button type="primary" size="small" @click="handleEdit" v-if="!isEditing">编辑信息</el-button>
          <div v-else>
            <el-button type="success" size="small" @click="handleSave">保存</el-button>
            <el-button size="small" @click="handleCancel">取消</el-button>
          </div>
        </div>
      </template>
      
      <div class="profile-content">
        <div class="avatar-container">
          <el-avatar :size="120" :src="userForm.avatar" @error="handleAvatarError">
            {{ userForm.username.charAt(0).toUpperCase() }}
          </el-avatar>
          <el-upload
            v-if="isEditing"
            class="avatar-uploader"
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleAvatarChange"
          >
            <el-button type="primary" size="small" class="change-avatar-btn">更换头像</el-button>
          </el-upload>
        </div>
        
        <div class="info-container">
          <el-form 
            :model="userForm" 
            :rules="rules" 
            ref="userFormRef" 
            label-width="100px" 
            class="user-form"
            :disabled="!isEditing"
          >
            <el-form-item label="用户名" prop="username">
              <el-input v-model="userForm.username" placeholder="请输入用户名"></el-input>
            </el-form-item>
            
            <el-form-item label="昵称" prop="nickname">
              <el-input v-model="userForm.nickname" placeholder="请输入昵称"></el-input>
            </el-form-item>
            
            <el-form-item label="手机号码" prop="phone">
              <el-input v-model="userForm.phone" placeholder="请输入手机号码"></el-input>
            </el-form-item>
            
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="userForm.email" placeholder="请输入邮箱"></el-input>
            </el-form-item>
            
            <el-form-item label="角色">
              <el-tag :type="getRoleType(userForm.role)">{{ userForm.role }}</el-tag>
            </el-form-item>
            
            <el-form-item label="注册时间">
              <span>{{ userForm.registerTime }}</span>
            </el-form-item>
            
            <el-form-item label="最后登录">
              <span>{{ userForm.lastLoginTime }}</span>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </el-card>
    
    <el-card class="box-card security-card">
      <template #header>
        <div class="card-header">
          <span>安全设置</span>
        </div>
      </template>
      
      <div class="security-list">
        <div class="security-item">
          <div class="security-info">
            <h4>账户密码</h4>
            <p>定期更改密码可以保护您的账户安全</p>
          </div>
          <el-button type="primary" plain @click="goToResetPassword">修改密码</el-button>
        </div>
        
        <el-divider></el-divider>
        
        <div class="security-item">
          <div class="security-info">
            <h4>绑定手机</h4>
            <p>已绑定手机：{{ maskPhone(userForm.phone) }}</p>
          </div>
          <el-button plain @click="handleBindPhone" :disabled="!isPhoneBindable">{{ isPhoneBindable ? '更换手机' : '已绑定' }}</el-button>
        </div>
        
        <el-divider></el-divider>
        
        <div class="security-item">
          <div class="security-info">
            <h4>绑定邮箱</h4>
            <p>已绑定邮箱：{{ maskEmail(userForm.email) }}</p>
          </div>
          <el-button plain @click="handleBindEmail" :disabled="!isEmailBindable">{{ isEmailBindable ? '更换邮箱' : '已绑定' }}</el-button>
        </div>
        
        <el-divider></el-divider>
        
        <div class="security-item">
          <div class="security-info">
            <h4>登录日志</h4>
            <p>查看您的账号登录记录</p>
          </div>
          <el-button plain @click="handleViewLogs">查看记录</el-button>
        </div>
      </div>
    </el-card>
    
    <!-- 登录日志对话框 -->
    <el-dialog v-model="logsDialogVisible" title="登录日志" width="700px">
      <el-table :data="loginLogs" style="width: 100%" border stripe>
        <el-table-column prop="time" label="登录时间" width="180"></el-table-column>
        <el-table-column prop="ip" label="IP地址" width="150"></el-table-column>
        <el-table-column prop="location" label="登录地点"></el-table-column>
        <el-table-column prop="device" label="设备信息"></el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === '成功' ? 'success' : 'danger'">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules, UploadFile } from 'element-plus'

const router = useRouter()
const userFormRef = ref<FormInstance>()
const isEditing = ref(false)
const logsDialogVisible = ref(false)

// 用户表单数据
const userForm = reactive({
  username: 'admin',
  nickname: '管理员',
  phone: '13800138000',
  email: 'admin@xinghai.com',
  role: '管理员',
  avatar: 'https://picsum.photos/200',
  registerTime: '2023-01-01 10:00:00',
  lastLoginTime: '2023-03-09 08:30:00'
})

// 表单验证规则
const rules = reactive<FormRules>({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
})

// 登录日志数据
const loginLogs = ref([
  {
    time: '2023-03-09 08:30:00',
    ip: '192.168.1.1',
    location: '中国 广东 深圳',
    device: 'Chrome 98.0.4758.102 / Windows 10',
    status: '成功'
  },
  {
    time: '2023-03-08 18:45:12',
    ip: '192.168.1.1',
    location: '中国 广东 深圳',
    device: 'Chrome 98.0.4758.102 / Windows 10',
    status: '成功'
  },
  {
    time: '2023-03-07 10:22:36',
    ip: '114.114.114.114',
    location: '中国 北京',
    device: 'Safari / iOS 15.1',
    status: '成功'
  },
  {
    time: '2023-03-06 23:15:48',
    ip: '8.8.8.8',
    location: '美国 加利福尼亚',
    device: 'Firefox 97.0 / macOS',
    status: '失败'
  },
  {
    time: '2023-03-05 14:30:22',
    ip: '192.168.1.1',
    location: '中国 广东 深圳',
    device: 'Chrome 98.0.4758.102 / Windows 10',
    status: '成功'
  }
])

// 计算属性：是否可以绑定手机
const isPhoneBindable = computed(() => {
  return !!userForm.phone
})

// 计算属性：是否可以绑定邮箱
const isEmailBindable = computed(() => {
  return !!userForm.email
})

// 获取角色类型
const getRoleType = (role: string) => {
  switch (role) {
    case '超级管理员':
      return 'danger'
    case '管理员':
      return 'warning'
    case 'VIP用户':
      return 'success'
    default:
      return 'info'
  }
}

// 处理头像加载错误
const handleAvatarError = () => {
  // 使用默认头像
  userForm.avatar = 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
}

// 处理头像变更
const handleAvatarChange = (file: UploadFile) => {
  // 模拟上传头像
  const reader = new FileReader()
  reader.readAsDataURL(file.raw!)
  reader.onload = () => {
    userForm.avatar = reader.result as string
    ElMessage.success('头像上传成功')
  }
}

// 编辑信息
const handleEdit = () => {
  isEditing.value = true
}

// 保存信息
const handleSave = async () => {
  if (!userFormRef.value) return
  
  await userFormRef.value.validate((valid, fields) => {
    if (valid) {
      // 模拟保存
      setTimeout(() => {
        isEditing.value = false
        ElMessage.success('个人信息保存成功')
        
        // 更新本地存储的用户信息
        const userInfo = {
          username: userForm.username,
          role: userForm.role,
          avatar: userForm.avatar
        }
        localStorage.setItem('userInfo', JSON.stringify(userInfo))
      }, 500)
    } else {
      console.log('表单验证失败', fields)
    }
  })
}

// 取消编辑
const handleCancel = () => {
  isEditing.value = false
  // 重置表单
  if (userFormRef.value) {
    userFormRef.value.resetFields()
  }
}

// 跳转到重置密码页面
const goToResetPassword = () => {
  router.push('/user/reset-password')
}

// 处理绑定手机
const handleBindPhone = () => {
  ElMessage.info('功能开发中，敬请期待')
}

// 处理绑定邮箱
const handleBindEmail = () => {
  ElMessage.info('功能开发中，敬请期待')
}

// 查看登录日志
const handleViewLogs = () => {
  logsDialogVisible.value = true
}

// 手机号码脱敏
const maskPhone = (phone: string) => {
  if (!phone) return ''
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

// 邮箱脱敏
const maskEmail = (email: string) => {
  if (!email) return ''
  const parts = email.split('@')
  if (parts.length !== 2) return email
  
  let name = parts[0]
  const domain = parts[1]
  
  if (name.length <= 3) {
    name = name.charAt(0) + '***'
  } else {
    name = name.substring(0, 3) + '***'
  }
  
  return name + '@' + domain
}

// 获取用户信息
const getUserInfo = () => {
  // 模拟从API获取用户信息
  // 这里使用本地存储的信息
  const userInfoStr = localStorage.getItem('userInfo')
  if (userInfoStr) {
    const userInfo = JSON.parse(userInfoStr)
    userForm.username = userInfo.username || 'admin'
    userForm.role = userInfo.role || '管理员'
    userForm.avatar = userInfo.avatar || 'https://picsum.photos/200'
  }
}

onMounted(() => {
  getUserInfo()
})
</script>

<style scoped>
.profile-container {
  padding: 20px;
}

.box-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.profile-content {
  display: flex;
  margin-top: 20px;
}

.avatar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 40px;
}

.change-avatar-btn {
  margin-top: 15px;
}

.info-container {
  flex: 1;
}

.user-form {
  max-width: 500px;
}

.security-card {
  margin-top: 30px;
}

.security-list {
  padding: 10px 0;
}

.security-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
}

.security-info h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #303133;
}

.security-info p {
  margin: 0;
  font-size: 14px;
  color: #909399;
}

.el-divider {
  margin: 0;
}
</style> 