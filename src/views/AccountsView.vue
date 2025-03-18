<template>
  <div class="accounts-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>账户管理</span>
          <el-button type="primary" @click="handleAddAccount">新增账户</el-button>
        </div>
      </template>
      
      <div class="page-description">
        <p>管理系统的后台账户，包括管理员和操作员。您可以为不同角色的管理人员创建账户，并分配相应的权限。</p>
      </div>
      
      <!-- 搜索区域 -->
      <div class="search-area">
        <el-form :inline="true" :model="searchForm" class="demo-form-inline">
          <el-form-item label="账户ID">
            <el-input v-model="searchForm.accountId" placeholder="请输入账户ID" clearable></el-input>
          </el-form-item>
          <el-form-item label="用户名">
            <el-input v-model="searchForm.username" placeholder="请输入用户名" clearable></el-input>
          </el-form-item>
          <el-form-item label="角色">
            <el-select v-model="searchForm.role" placeholder="请选择" clearable style="width: 168px;">
              <el-option label="全部" value=""></el-option>
              <el-option 
                v-for="role in roleOptions" 
                :key="role.value" 
                :label="role.label" 
                :value="role.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 168px;">
              <el-option label="全部" value=""></el-option>
              <el-option label="正常" value="normal"></el-option>
              <el-option label="禁用" value="disabled"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <!-- 表格区域 -->
      <el-table :data="tableData" style="width: 100%" v-loading="loading" border stripe>
        <el-table-column prop="accountId" label="账户ID" width="100"></el-table-column>
        <el-table-column prop="username" label="用户名" width="120"></el-table-column>
        <el-table-column prop="role" label="角色" width="120">
          <template #default="scope">
            <el-tag :type="getRoleType(scope.row.role)">{{ scope.row.role }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱" min-width="180"></el-table-column>
        <el-table-column prop="lastLoginTime" label="最后登录时间" width="180"></el-table-column>
        <el-table-column prop="remark" label="备注" min-width="150"></el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-switch
              v-model="scope.row.statusBool"
              :active-value="true"
              :inactive-value="false"
              :disabled="scope.row.role === '超级管理员'"
              @change="(val: boolean) => handleStatusChange(val, scope.row)"
            ></el-switch>
            <span class="status-text">{{ scope.row.statusBool ? '正常' : '禁用' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <el-button size="small" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
              <el-button 
                size="small" 
                type="danger" 
                @click="handleDelete(scope.row)"
                v-if="scope.row.role !== '超级管理员'"
              >删除</el-button>
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
    
    <!-- 账户表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增账户' : '编辑账户'"
      width="650px"
    >
      <el-form :model="accountForm" label-width="100px" :rules="rules" ref="accountFormRef">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="accountForm.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item 
          label="密码" 
          prop="password" 
          v-if="dialogType === 'add' || (dialogType === 'edit' && accountForm.role !== '超级管理员')"
        >
          <el-input v-model="accountForm.password" type="password" placeholder="请输入密码"></el-input>
        </el-form-item>
        <el-form-item 
          label="确认密码" 
          prop="confirmPassword" 
          v-if="dialogType === 'add' || (dialogType === 'edit' && accountForm.role !== '超级管理员')"
        >
          <el-input v-model="accountForm.confirmPassword" type="password" placeholder="请再次输入密码"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="accountForm.email" placeholder="请输入邮箱"></el-input>
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="accountForm.role" placeholder="请选择角色" style="width: 168px;">
            <el-option 
              v-for="role in roleOptions" 
              :key="role.value" 
              :label="role.label" 
              :value="role.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch 
            v-model="accountForm.statusBool"
            :disabled="accountForm.role === '超级管理员'"
          ></el-switch>
          <span class="status-text">{{ accountForm.statusBool ? '正常' : '禁用' }}</span>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="accountForm.remark" type="textarea" :rows="3" placeholder="请输入备注信息"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

// 搜索表单
const searchForm = reactive({
  accountId: '',
  username: '',
  role: '',
  status: ''
})

// 角色选项
const roleOptions = ref([
  { value: '超级管理员', label: '超级管理员' },
  { value: '管理员', label: '管理员' },
  { value: '运营', label: '运营' },
  { value: '客服', label: '客服' },
  { value: '财务', label: '财务' }
])

// 表格数据
const tableData = ref([
  { 
    accountId: 'A10001',
    username: 'admin',
    realName: '张三',
    role: '超级管理员',
    email: 'admin@example.com',
    phone: '138****1234',
    lastLoginTime: '2024-03-15 08:30:00',
    status: '正常',
    statusBool: true,
    remark: '系统超级管理员',
    permissions: ['data', 'orders', 'products', 'categories', 'users', 'templates', 'settings']
  },
  { 
    accountId: 'A10002',
    username: 'operator',
    realName: '李四',
    role: '运营',
    email: 'operator@example.com',
    phone: '139****5678',
    lastLoginTime: '2024-03-14 16:45:00',
    status: '正常',
    statusBool: true,
    remark: '负责日常运营工作',
    permissions: ['data', 'orders', 'products', 'categories', 'users']
  },
  { 
    accountId: 'A10003',
    username: 'service',
    realName: '王五',
    role: '客服',
    email: 'service@example.com',
    phone: '137****9012',
    lastLoginTime: '2024-03-15 09:15:00',
    status: '正常',
    statusBool: true,
    remark: '负责客户服务',
    permissions: ['data', 'orders', 'users']
  },
  { 
    accountId: 'A10004',
    username: 'finance',
    realName: '赵六',
    role: '财务',
    email: 'finance@example.com',
    phone: '136****3456',
    lastLoginTime: '2024-03-14 14:20:00',
    status: '正常',
    statusBool: true,
    remark: '负责财务管理',
    permissions: ['data', 'orders']
  },
  { 
    accountId: 'A10005',
    username: 'test',
    realName: '测试账号',
    role: '管理员',
    email: 'test@example.com',
    phone: '135****7890',
    lastLoginTime: '2024-03-10 11:30:00',
    status: '禁用',
    statusBool: false,
    remark: '测试账号，已禁用',
    permissions: ['data', 'orders', 'products', 'categories', 'users', 'templates']
  }
])

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)

// 获取角色对应的标签类型
const getRoleType = (role: string) => {
  const roleMap: Record<string, string> = {
    '超级管理员': 'danger',
    '管理员': 'warning',
    '运营': 'success',
    '客服': 'info',
    '财务': 'primary'
  }
  return roleMap[role] || 'info'
}

// 查询
const handleSearch = () => {
  currentPage.value = 1
  getAccountList()
}

// 重置搜索
const handleReset = () => {
  searchForm.accountId = ''
  searchForm.username = ''
  searchForm.role = ''
  searchForm.status = ''
  currentPage.value = 1
  getAccountList()
}

// 状态变更
const handleStatusChange = (val: boolean, row: any) => {
  if (row.role === '超级管理员') {
    ElMessage.warning('超级管理员账户不能被禁用')
    row.statusBool = true
    return
  }
  const statusText = val ? '启用' : '禁用'
  ElMessage.success(`账户"${row.username}"已${statusText}`)
  row.status = val ? '正常' : '禁用'
}

// 查看
const handleView = (row: any) => {
  ElMessageBox.alert(
    `<div class="account-detail">
      <div class="detail-section">
        <h4>基本信息</h4>
        <div class="detail-item">
          <span class="label">账户ID：</span>
          <span>${row.accountId}</span>
        </div>
        <div class="detail-item">
          <span class="label">用户名：</span>
          <span>${row.username}</span>
        </div>
        <div class="detail-item">
          <span class="label">真实姓名：</span>
          <span>${row.realName}</span>
        </div>
        <div class="detail-item">
          <span class="label">角色：</span>
          <span><el-tag size="small" type="${getRoleType(row.role)}">${row.role}</el-tag></span>
        </div>
        <div class="detail-item">
          <span class="label">状态：</span>
          <span>${row.status}</span>
        </div>
      </div>
      
      <div class="detail-section">
        <h4>联系方式</h4>
        <div class="detail-item">
          <span class="label">手机号：</span>
          <span>${row.phone}</span>
        </div>
        <div class="detail-item">
          <span class="label">邮箱：</span>
          <span>${row.email}</span>
        </div>
      </div>
      
      <div class="detail-section">
        <h4>权限信息</h4>
        <div class="detail-item permissions">
          ${row.permissions.map((p: string) => {
            const permissionMap: Record<string, string> = {
              'data': '数据概览',
              'orders': '订单管理',
              'products': '商品管理',
              'categories': '分类管理',
              'users': '用户管理',
              'templates': '模板设置',
              'settings': '系统设置'
            };
            return `<el-tag size="small" style="margin: 2px">${permissionMap[p] || p}</el-tag>`;
          }).join('')}
        </div>
      </div>
      
      <div class="detail-section">
        <h4>其他信息</h4>
        <div class="detail-item">
          <span class="label">最后登录：</span>
          <span>${row.lastLoginTime}</span>
        </div>
        <div class="detail-item">
          <span class="label">备注：</span>
          <span>${row.remark || '无'}</span>
        </div>
      </div>
    </div>`,
    '账户详情',
    {
      dangerouslyUseHTMLString: true,
      confirmButtonText: '关闭',
      customClass: 'account-detail-dialog'
    }
  )
}

// 对话框相关
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const accountFormRef = ref<FormInstance>()

const accountForm = reactive({
  accountId: '',
  username: '',
  realName: '',
  password: '',
  confirmPassword: '',
  phone: '',
  email: '',
  role: '',
  permissions: [] as string[],
  statusBool: true,
  remark: ''
})

// 表单验证规则
const rules = reactive<FormRules>({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: Function) => {
        if (value !== accountForm.password) {
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
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  remark: [
    { max: 200, message: '长度不能超过 200 个字符', trigger: 'blur' }
  ]
})

// 新增账户
const handleAddAccount = () => {
  dialogType.value = 'add'
  accountForm.accountId = ''
  accountForm.username = ''
  accountForm.realName = ''
  accountForm.password = ''
  accountForm.confirmPassword = ''
  accountForm.phone = ''
  accountForm.email = ''
  accountForm.role = ''
  accountForm.permissions = []
  accountForm.statusBool = true
  accountForm.remark = ''
  dialogVisible.value = true
}

// 编辑账户
const handleEdit = (row: any) => {
  dialogType.value = 'edit'
  accountForm.accountId = row.accountId
  accountForm.username = row.username
  accountForm.realName = row.realName
  accountForm.phone = row.phone
  accountForm.email = row.email
  accountForm.role = row.role
  accountForm.permissions = [...row.permissions]
  accountForm.statusBool = row.statusBool
  accountForm.remark = row.remark || ''
  dialogVisible.value = true
}

// 提交表单
const submitForm = async () => {
  if (!accountFormRef.value) return
  
  await accountFormRef.value.validate((valid, fields) => {
    if (valid) {
      if (dialogType.value === 'add') {
        ElMessage.success('新增账户成功')
      } else {
        ElMessage.success('编辑账户成功')
      }
      dialogVisible.value = false
    } else {
      console.log('表单验证失败', fields)
    }
  })
}

// 删除
const handleDelete = (row: any) => {
  if (row.role === '超级管理员') {
    ElMessage.warning('超级管理员账户不能被删除')
    return
  }
  ElMessageBox.confirm(
    `确定要删除账户"${row.username}"吗？`,
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
        message: `账户"${row.username}"已删除`,
      })
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '已取消删除',
      })
    })
}

// 获取账户列表数据
const getAccountList = () => {
  // 模拟API请求
  loading.value = true
  setTimeout(() => {
    // 根据搜索条件和分页参数获取数据
    const filteredData = tableData.value.filter((item: any) => {
      // 账户ID筛选
      if (searchForm.accountId && !item.accountId.includes(searchForm.accountId)) {
        return false
      }
      // 用户名筛选
      if (searchForm.username && !item.username.includes(searchForm.username)) {
        return false
      }
      // 角色筛选
      if (searchForm.role && item.role !== searchForm.role) {
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
  getAccountList()
}

// 处理页码变化
const handleCurrentChange = (val: number) => {
  currentPage.value = val
  getAccountList()
}

// 监听搜索表单变化，重置分页并重新获取数据
watch([() => searchForm.accountId, () => searchForm.username, () => searchForm.role, () => searchForm.status], () => {
  currentPage.value = 1
  getAccountList()
})

// 初始化
onMounted(() => {
  getAccountList()
})
</script>

<style scoped>
.accounts-container {
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

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.account-detail {
  padding: 20px;
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

.detail-item.permissions {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

:deep(.account-detail-dialog .el-message-box__wrapper .el-message-box) {
  max-width: 600px;
  width: 100%;
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
</style> 