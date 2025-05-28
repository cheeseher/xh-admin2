<template>
  <div class="users-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <el-button type="primary" @click="handleAddUser">新增用户</el-button>
        </div>
      </template>
      
      <div class="page-description">
        <p>管理系统的所有用户账号，您可以查看和管理用户的基本信息。</p>
      </div>
      
      <!-- 搜索区域 -->
      <div class="search-area">
        <el-form :inline="true" :model="searchForm" class="demo-form-inline">
          <el-form-item label="邮箱">
            <el-input v-model="searchForm.email" placeholder="请输入邮箱" clearable></el-input>
          </el-form-item>
          <el-form-item label="用户状态">
            <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 168px;">
              <el-option label="全部" value=""></el-option>
              <el-option label="正常" value="normal"></el-option>
              <el-option label="禁用" value="disabled"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="VIP等级">
            <el-select v-model="searchForm.vipLevel" placeholder="请选择" clearable style="width: 168px;">
              <el-option label="全部" value=""></el-option>
              <el-option label="普通会员" value="0"></el-option>
              <el-option label="银卡会员" value="1"></el-option>
              <el-option label="金卡会员" value="2"></el-option>
              <el-option label="钻石会员" value="3"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="注册时间">
            <el-date-picker
              v-model="searchForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
            ></el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <!-- 表格区域 -->
      <el-table :data="tableData" style="width: 100%" v-loading="loading" border stripe>
        <el-table-column prop="email" label="邮箱" min-width="180"></el-table-column>
        <el-table-column prop="nickname" label="用户昵称" width="120"></el-table-column>
        <el-table-column prop="password" label="密码" width="120">
          <template #default="scope">
            <span>******</span>
            <el-button link type="primary" size="small" @click="handleResetPassword(scope.row)">重置</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="balance" label="用户余额" width="120">
          <template #default="scope">
            <span class="money">¥{{ scope.row.balance }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="vipLevel" label="VIP等级" width="120">
          <template #default="scope">
            <el-tag :type="getVipLevelType(scope.row.role)">{{ getVipLevelName(scope.row.role) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="totalSpent" label="累计消费" width="120">
          <template #default="scope">
            <span class="money">¥{{ scope.row.totalSpent }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-switch
              v-model="scope.row.statusBool"
              :active-value="true"
              :inactive-value="false"
              @change="(val: boolean) => handleStatusChange(val, scope.row)"
            ></el-switch>
            <span class="status-text">{{ scope.row.statusBool ? '正常' : '禁用' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="registerTime" label="注册时间" width="180"></el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <el-button size="small" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
              <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
              <el-button size="small" type="info" @click="handleUserLogs(scope.row)">日志</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页区域 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :background="true"
        ></el-pagination>
      </div>
    </el-card>
    
    <!-- 用户表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增用户' : '编辑用户'"
      width="650px"
    >
      <el-form :model="userForm" label-width="100px" :rules="rules" ref="userFormRef">
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="userForm.nickname" placeholder="请输入昵称"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="dialogType === 'add'">
          <el-input v-model="userForm.password" type="password" placeholder="请输入密码"></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword" v-if="dialogType === 'add'">
          <el-input v-model="userForm.confirmPassword" type="password" placeholder="请再次输入密码"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" placeholder="请输入邮箱"></el-input>
        </el-form-item>
        <el-form-item label="用户余额" prop="balance">
          <el-input-number v-model="userForm.balance" :precision="2" :step="10" :min="0"></el-input-number>
        </el-form-item>
        <el-form-item label="VIP等级" prop="role">
          <el-select v-model="userForm.role" placeholder="请选择VIP等级" style="width: 168px;">
            <el-option label="普通会员" :value="0"></el-option>
            <el-option label="银卡会员" :value="1"></el-option>
            <el-option label="金卡会员" :value="2"></el-option>
            <el-option label="钻石会员" :value="3"></el-option>
            <el-option label="至尊会员" :value="4"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="userForm.statusBool"></el-switch>
          <span class="status-text">{{ userForm.statusBool ? '正常' : '禁用' }}</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 重置密码对话框 -->
    <el-dialog
      v-model="resetPasswordDialogVisible"
      title="重置用户密码"
      width="450px"
    >
      <el-form :model="resetPwdForm" label-width="100px" :rules="resetPwdRules" ref="resetPwdFormRef">
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="resetPwdForm.newPassword" type="password" placeholder="请输入新密码"></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="resetPwdForm.confirmPassword" type="password" placeholder="请再次输入密码"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="resetPasswordDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitResetPassword">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 添加用户操作日志弹窗 -->
    <el-dialog
      v-model="userLogsDialogVisible"
      title="用户操作日志"
      width="750px"
    >
      <div class="user-logs-header">
        <span>用户：{{ currentUser?.nickname }} ({{ currentUser?.email }})</span>
      </div>
      
      <el-table :data="userLogsList" border stripe v-loading="logsLoading" style="width: 100%; margin-top: 15px;">
        <el-table-column prop="operator" label="操作人" width="120"></el-table-column>
        <el-table-column prop="operationType" label="操作类型" width="150">
          <template #default="{ row }">
            <el-tag :type="getOperationTypeTag(row.operationType)">{{ row.operationType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operationAmount" label="操作金额" width="120">
          <template #default="{ row }">
            <span :class="{'text-green': row.operationAmount > 0, 'text-red': row.operationAmount < 0}">
              {{ row.operationAmount > 0 ? '+' : '' }}{{ row.operationAmount.toFixed(2) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="operationDesc" label="操作描述" min-width="200"></el-table-column>
        <el-table-column prop="operationTime" label="操作时间" width="180"></el-table-column>
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="logsCurrentPage"
          v-model:page-size="logsPageSize"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          :total="logsTotalCount"
          @size-change="handleLogsSizeChange"
          @current-change="handleLogsCurrentChange"
          :background="true"
        ></el-pagination>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

// 搜索表单
const searchForm = reactive({
  email: '',
  status: '',
  vipLevel: '',
  dateRange: []
})

// 表格数据
const tableData = ref([
  { 
    userId: 'U10001',
    username: 'user123',
    nickname: '张小明',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    phone: '138****1234',
    email: 'user123@example.com',
    role: 0,
    status: '正常',
    statusBool: true,
    registerTime: '2024-01-15 10:00:00',
    lastLoginTime: '2024-03-15 08:30:00',
    registerIp: '192.168.1.1',
    balance: 100.50,
    totalSpent: 899.50
  },
  { 
    userId: 'U10002',
    username: 'admin456',
    nickname: '李管理',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    phone: '139****5678',
    email: 'admin456@example.com',
    role: 3,
    status: '正常',
    statusBool: true,
    registerTime: '2023-12-20 14:30:00',
    lastLoginTime: '2024-03-15 09:15:00',
    registerIp: '192.168.1.2',
    balance: 0,
    totalSpent: 0
  },
  { 
    userId: 'U10003',
    username: 'vip789',
    nickname: '王大富',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    phone: '137****9012',
    email: 'vip789@example.com',
    role: 2,
    status: '正常',
    statusBool: true,
    registerTime: '2024-02-05 16:45:00',
    lastLoginTime: '2024-03-14 18:20:00',
    registerIp: '192.168.1.3',
    balance: 500.75,
    totalSpent: 4499.25
  },
  { 
    userId: 'U10004',
    username: 'test321',
    nickname: '赵测试',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    phone: '136****3456',
    email: 'test321@example.com',
    role: 0,
    status: '禁用',
    statusBool: false,
    registerTime: '2024-01-30 09:10:00',
    lastLoginTime: '2024-02-28 11:05:00',
    registerIp: '192.168.1.4',
    balance: 50.25,
    totalSpent: 149.75
  },
  { 
    userId: 'U10005',
    username: 'guest555',
    nickname: '陈访客',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    phone: '135****7890',
    email: 'guest555@example.com',
    role: 1,
    status: '正常',
    statusBool: true,
    registerTime: '2024-03-01 13:25:00',
    lastLoginTime: '2024-03-15 07:40:00',
    registerIp: '192.168.1.5',
    balance: 0,
    totalSpent: 0
  },
  { 
    userId: 'U10006',
    username: 'supervip',
    nickname: '刘总',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    phone: '133****6666',
    email: 'supervip@example.com',
    role: 4,
    status: '正常',
    statusBool: true,
    registerTime: '2024-03-10 09:30:00',
    lastLoginTime: '2024-03-16 10:20:00',
    registerIp: '192.168.1.6',
    balance: 10000.00,
    totalSpent: 40000.00
  }
])

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)

// VIP等级名称和样式处理
const getVipLevelName = (level: number) => {
  const vipLevels = {
    0: '普通会员',
    1: '银卡会员',
    2: '金卡会员',
    3: '钻石会员',
    4: '至尊会员',
  }
  return vipLevels[level as keyof typeof vipLevels] || '未知等级'
}

const getVipLevelType = (level: number) => {
  const typeMap = {
    0: '',
    1: 'info',
    2: 'warning',
    3: 'success',
    4: 'danger',
  }
  return typeMap[level as keyof typeof typeMap] || ''
}

// 重置密码相关
const resetPasswordDialogVisible = ref(false)
const currentUser = ref<any>(null)
const resetPwdFormRef = ref<FormInstance>()
const resetPwdForm = reactive({
  userId: '',
  newPassword: '',
  confirmPassword: '',
})

// 重置密码表单验证规则
const resetPwdRules = reactive<FormRules>({
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 16, message: '长度在 6 到 16 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: any) => {
        if (value !== resetPwdForm.newPassword) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
})

// 处理重置密码
const handleResetPassword = (row: any) => {
  currentUser.value = row
  resetPwdForm.userId = row.userId
  resetPwdForm.newPassword = ''
  resetPwdForm.confirmPassword = ''
  resetPasswordDialogVisible.value = true
}

// 提交重置密码
const submitResetPassword = async () => {
  if (!resetPwdFormRef.value) return
  
  await resetPwdFormRef.value.validate((valid, fields) => {
    if (valid) {
      ElMessage.success(`用户"${currentUser.value.nickname}"密码重置成功`)
      resetPasswordDialogVisible.value = false
    } else {
      console.log('表单验证失败', fields)
    }
  })
}

// 查询
const handleSearch = () => {
  currentPage.value = 1
  getUserList()
}

// 重置搜索
const handleReset = () => {
  searchForm.email = ''
  searchForm.status = ''
  searchForm.vipLevel = ''
  searchForm.dateRange = []
  currentPage.value = 1
  getUserList()
}

// 状态变更
const handleStatusChange = (val: boolean, row: any) => {
  const statusText = val ? '启用' : '禁用'
  ElMessage.success(`用户"${row.username}"已${statusText}`)
  row.status = val ? '正常' : '禁用'
}

// 查看
const handleView = (row: any) => {
  ElMessageBox.alert(
    `<div class="user-detail">
      <div class="user-header">
        <div class="user-avatar">
          <img src="${row.avatar}" alt="${row.username}" />
        </div>
        <div class="user-info">
          <h3>${row.username}</h3>
          <p><el-tag size="small" :type="getRoleType(row.role)">${row.role}</el-tag></p>
        </div>
      </div>
      
      <div class="detail-section">
        <h4>基本信息</h4>
        <div class="detail-item">
          <span class="label">用户ID：</span>
          <span>${row.userId}</span>
        </div>
        <div class="detail-item">
          <span class="label">昵称：</span>
          <span>${row.nickname || '未设置'}</span>
        </div>
        <div class="detail-item">
          <span class="label">手机号：</span>
          <span>${row.phone}</span>
        </div>
        <div class="detail-item">
          <span class="label">邮箱：</span>
          <span>${row.email}</span>
        </div>
        <div class="detail-item">
          <span class="label">状态：</span>
          <span>${row.status}</span>
        </div>
      </div>
      
      <div class="detail-section">
        <h4>账户信息</h4>
        <div class="detail-item">
          <span class="label">账户余额：</span>
          <span>¥${row.balance}</span>
        </div>
        <div class="detail-item">
          <span class="label">累计消费：</span>
          <span>¥${row.totalSpent}</span>
        </div>
      </div>
      
      <div class="detail-section">
        <h4>其他信息</h4>
        <div class="detail-item">
          <span class="label">注册时间：</span>
          <span>${row.registerTime}</span>
        </div>
        <div class="detail-item">
          <span class="label">注册IP：</span>
          <span>${row.registerIp}</span>
        </div>
        <div class="detail-item">
          <span class="label">最后登录：</span>
          <span>${row.lastLoginTime}</span>
        </div>
      </div>
    </div>`,
    '用户详情',
    {
      dangerouslyUseHTMLString: true,
      confirmButtonText: '关闭',
      customClass: 'user-detail-dialog'
    }
  )
}

// 对话框相关
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const userFormRef = ref<FormInstance>()
const captchaUrl = ref('https://cube.elemecdn.com/9/3f/2c0938b93c591b218c1beaf08de07jpeg.jpeg')

const userForm = reactive({
  userId: '',
  username: '',
  nickname: '',
  password: '',
  confirmPassword: '',
  phone: '',
  email: '',
  captcha: '',
  role: 0,
  balance: 0,
  statusBool: true,
  rechargeDiscount: 0 // 新增充值折扣
})

// 表单验证规则
const rules = reactive<FormRules>({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { max: 20, message: '长度不能超过 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 16, message: '长度在 6 到 16 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: any) => {
        if (value !== userForm.password) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  captcha: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { min: 4, max: 6, message: '验证码长度不正确', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择会员等级', trigger: 'change' }
  ]
})

// 刷新验证码
const refreshCaptcha = () => {
  // 模拟刷新验证码，实际应该调用后端接口
  captchaUrl.value = `https://cube.elemecdn.com/9/3f/2c0938b93c591b218c1beaf08de07jpeg.jpeg?t=${Date.now()}`
  ElMessage.success('验证码已刷新')
}

// 新增用户
const handleAddUser = () => {
  dialogType.value = 'add'
  userForm.userId = ''
  userForm.username = ''
  userForm.nickname = ''
  userForm.password = ''
  userForm.confirmPassword = ''
  userForm.email = ''
  userForm.captcha = ''
  userForm.role = 0
  userForm.balance = 0
  userForm.statusBool = true
  dialogVisible.value = true
  // 刷新验证码
  refreshCaptcha()
}

// 编辑用户
const handleEdit = (row: any) => {
  dialogType.value = 'edit'
  userForm.userId = row.userId
  userForm.nickname = row.nickname
  userForm.email = row.email
  userForm.role = row.role
  userForm.balance = row.balance
  userForm.statusBool = row.statusBool
  userForm.rechargeDiscount = row.rechargeDiscount || 0 // 设置充值折扣
  
  dialogVisible.value = true
}

// 提交表单
const submitForm = async () => {
  if (!userFormRef.value) return
  
  await userFormRef.value.validate((valid, fields) => {
    if (valid) {
      if (dialogType.value === 'add') {
        ElMessage.success('新增用户成功')
      } else {
        ElMessage.success('编辑用户成功')
      }
      dialogVisible.value = false
    } else {
      console.log('表单验证失败', fields)
    }
  })
}

// 删除
const handleDelete = (row: any) => {
  ElMessageBox.confirm(
    `确定要删除用户"${row.username}"吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      ElMessage({
        type: 'success',
        message: `用户"${row.username}"已删除`,
      })
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '已取消删除',
      })
    })
}

// 获取用户列表数据
const getUserList = () => {
  // 模拟API请求
  loading.value = true
  setTimeout(() => {
    // 根据搜索条件和分页参数获取数据
    const filteredData = tableData.value.filter((item: any) => {
      // 邮箱筛选
      if (searchForm.email && !item.email.includes(searchForm.email)) {
        return false
      }
      // 状态筛选
      if (searchForm.status) {
        if (searchForm.status === 'normal' && item.status !== '正常') {
          return false
        }
        if (searchForm.status === 'disabled' && item.status !== '禁用') {
          return false
        }
      }
      // VIP等级筛选
      if (searchForm.vipLevel && item.role.toString() !== searchForm.vipLevel) {
        return false
      }
      // 日期范围筛选
      if (searchForm.dateRange && searchForm.dateRange.length === 2) {
        const startDate = new Date(searchForm.dateRange[0])
        const endDate = new Date(searchForm.dateRange[1])
        const registerDate = new Date(item.registerTime)
        if (registerDate < startDate || registerDate > endDate) {
          return false
        }
      }
      return true
    })
    
    // 计算总数
    total.value = filteredData.length
    
    // 分页处理
    const startIndex = (currentPage.value - 1) * pageSize.value
    const endIndex = startIndex + pageSize.value
    tableData.value = filteredData.slice(startIndex, endIndex)
    
    loading.value = false
  }, 500)
}

// 处理每页显示数量变化
const handleSizeChange = (val: number) => {
  pageSize.value = val
  getUserList()
}

// 处理页码变化
const handleCurrentChange = (val: number) => {
  currentPage.value = val
  getUserList()
}

// 监听搜索表单变化，重置分页并重新获取数据
watch([() => searchForm.email, () => searchForm.status, () => searchForm.vipLevel, () => searchForm.dateRange], () => {
  currentPage.value = 1
  getUserList()
})

// 初始化
onMounted(() => {
  getUserList()
})

// 用户操作日志相关
const userLogsDialogVisible = ref(false)
const userLogsList = ref<any[]>([])
const logsLoading = ref(false)
const logsCurrentPage = ref(1)
const logsPageSize = ref(10)
const logsTotalCount = ref(0)

// 处理用户日志
const handleUserLogs = (row: any) => {
  currentUser.value = row
  userLogsDialogVisible.value = true
  logsCurrentPage.value = 1
  logsPageSize.value = 10
  fetchUserLogs()
}

// 获取用户操作日志
const fetchUserLogs = () => {
  if (!currentUser.value) return
  
  logsLoading.value = true
  
  // 模拟API请求获取日志数据
  setTimeout(() => {
    // 模拟日志数据
    const mockLogs = [
      {
        logId: 'L0001',
        userId: currentUser.value.userId,
        operator: '系统',
        operationType: '充值',
        operationAmount: 1000.00,
        operationDesc: '用户在线充值',
        operationTime: '2024-03-15 10:30:22'
      },
      {
        logId: 'L0002',
        userId: currentUser.value.userId,
        operator: '管理员',
        operationType: '人工充值',
        operationAmount: 500.00,
        operationDesc: '管理员手动充值',
        operationTime: '2024-03-14 15:45:10'
      },
      {
        logId: 'L0003',
        userId: currentUser.value.userId,
        operator: '系统',
        operationType: '消费',
        operationAmount: -200.00,
        operationDesc: '购买商品',
        operationTime: '2024-03-13 09:20:33'
      },
      {
        logId: 'L0004',
        userId: currentUser.value.userId,
        operator: '系统',
        operationType: '退款',
        operationAmount: 50.00,
        operationDesc: '订单部分退款',
        operationTime: '2024-03-12 14:10:05'
      },
      {
        logId: 'L0005',
        userId: currentUser.value.userId,
        operator: '管理员',
        operationType: '扣款',
        operationAmount: -100.00,
        operationDesc: '违规扣除',
        operationTime: '2024-03-10 16:30:45'
      }
    ]
    
    userLogsList.value = mockLogs
    logsTotalCount.value = mockLogs.length
    logsLoading.value = false
  }, 500)
}

// 获取操作类型标签样式
const getOperationTypeTag = (type: string) => {
  switch (type) {
    case '充值':
    case '人工充值':
      return 'success'
    case '消费':
      return 'info'
    case '退款':
      return 'warning'
    case '扣款':
      return 'danger'
    default:
      return ''
  }
}

// 处理日志分页
const handleLogsSizeChange = (val: number) => {
  logsPageSize.value = val
  fetchUserLogs()
}

const handleLogsCurrentChange = (val: number) => {
  logsCurrentPage.value = val
  fetchUserLogs()
}
</script>

<style scoped>
.users-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-description {
  margin-bottom: 20px;
  padding: 10px 15px;
  background-color: #f0f9eb;
  border-radius: 4px;
  border-left: 4px solid #67c23a;
}

.page-description p {
  margin: 0;
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
}

.search-area {
  margin-bottom: 20px;
}

.status-text {
  margin-left: 8px;
  font-size: 14px;
}

.balance {
  color: #f56c6c;
  font-weight: bold;
}

.money {
  color: #f56c6c;
  font-weight: bold;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.user-detail {
  padding: 20px;
}

.user-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.user-avatar {
  margin-right: 20px;
}

.user-avatar img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
}

.user-info {
  flex: 1;
}

.user-info h3 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #303133;
  font-size: 18px;
}

.user-info p {
  margin: 0;
}

.detail-section {
  margin-bottom: 20px;
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 4px;
}

.detail-section h4 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #606266;
  font-size: 16px;
  border-left: 3px solid #409EFF;
  padding-left: 10px;
}

.detail-item {
  margin-bottom: 10px;
}

.detail-item .label {
  font-weight: bold;
  color: #606266;
  display: inline-block;
  width: 80px;
}

:deep(.user-detail-dialog .el-message-box__wrapper .el-message-box) {
  max-width: 600px;
  width: 100%;
}

.captcha-container {
  display: flex;
  align-items: center;
}

.captcha-container .el-input {
  flex: 1;
  margin-right: 10px;
}

.captcha-image {
  width: 120px;
  height: 40px;
  cursor: pointer;
  overflow: hidden;
  border-radius: 4px;
}

.captcha-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.action-buttons .el-button {
  margin-left: 0 !important;
  margin-right: 0 !important;
}

.warning-text {
  margin-left: 10px;
  color: #e6a23c;
  font-size: 12px;
}

.info-text {
  margin-left: 10px;
  color: #409EFF;
  font-size: 12px;
}

.form-tip {
  margin-left: 10px;
  color: #909399;
  font-size: 12px;
}

/* 超级VIP样式 */
:deep(.el-tag.el-tag--info) {
  background-color: #fdf2ff;
  border-color: #eb2f96;
  color: #eb2f96;
}

:deep(.el-select-dropdown__item.selected.is-super-vip) {
  color: #eb2f96;
  font-weight: bold;
}

:deep(.el-select-dropdown__item.is-super-vip) {
  position: relative;
}

:deep(.el-select-dropdown__item.is-super-vip::after) {
  content: '经理指定';
  position: absolute;
  right: 15px;
  font-size: 12px;
  color: #eb2f96;
}

.custom-discount {
  font-size: 12px;
  color: #eb2f96;
  margin-top: 4px;
  background-color: #fff0f6;
  border-radius: 2px;
  padding: 2px 4px;
  display: inline-block;
  margin-left: 5px;
}

.text-red {
  color: #f56c6c;
  font-weight: bold;
}

.text-green {
  color: #67c23a;
  font-weight: bold;
}

.user-logs-header {
  margin-bottom: 15px;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  border-bottom: 1px solid #EBEEF5;
  padding-bottom: 15px;
}
</style> 