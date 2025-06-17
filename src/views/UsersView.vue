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
          <el-form-item label="用户昵称">
            <el-input v-model="searchForm.nickname" placeholder="请输入用户昵称" clearable></el-input>
          </el-form-item>
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
              <el-option label="普通" value="0"></el-option>
              <el-option label="VIP1" value="1"></el-option>
              <el-option label="VIP2" value="2"></el-option>
              <el-option label="VIP3" value="3"></el-option>
              <el-option label="超级VIP" value="4"></el-option>
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
        <el-table-column prop="nickname" label="用户昵称" width="120"></el-table-column>
        <el-table-column prop="email" label="邮箱" min-width="180"></el-table-column>
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
        <el-table-column prop="parentNickname" label="上级用户昵称" width="120"></el-table-column>
        <el-table-column prop="referralCount" label="邀请人数" width="100">
          <template #default="scope">
            <span>{{ scope.row.referralCount || 0 }}人</span>
          </template>
        </el-table-column>
        <el-table-column prop="rebateAmount" label="累计返利金额" width="120">
          <template #default="scope">
            <span class="money">¥{{ scope.row.rebateAmount || 0 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="totalRecharge" label="累计充值" width="120">
          <template #default="scope">
            <span class="money">¥{{ scope.row.totalRecharge || 0 }}</span>
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
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="scope">
            <el-dropdown trigger="hover">
              <el-button type="primary" size="small">
                操作
                <el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="handleEdit(scope.row)">
                    编辑
                  </el-dropdown-item>
                  <el-dropdown-item @click="handleBalanceOperation(scope.row)">
                    余额操作
                  </el-dropdown-item>
                  <el-dropdown-item @click="handleRebateCenter(scope.row)">
                    返利中心
                  </el-dropdown-item>
                  <el-dropdown-item @click="handleResetPassword(scope.row)">
                    重置密码
                  </el-dropdown-item>
                  <el-dropdown-item @click="handleUserLogs(scope.row)">
                    查看日志
                  </el-dropdown-item>
                  <el-dropdown-item @click="handleDelete(scope.row)">
                    删除
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
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
        <el-form-item label="上级用户" prop="parentNickname">
          <el-input v-model="userForm.parentNickname" placeholder="请输入上级用户昵称"></el-input>
        </el-form-item>
        <el-form-item label="VIP等级" prop="role">
          <el-select v-model="userForm.role" placeholder="请选择VIP等级" style="width: 168px;">
            <el-option label="普通" :value="0"></el-option>
            <el-option label="VIP1" :value="1"></el-option>
            <el-option label="VIP2" :value="2"></el-option>
            <el-option label="VIP3" :value="3"></el-option>
            <el-option label="超级VIP" :value="4"></el-option>
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
      title="余额变动明细"
      width="750px"
    >
      <div class="user-logs-header">
        <span>用户昵称：{{ currentUser?.nickname }}</span>
      </div>
      
      <!-- 添加变动类型筛选 -->
      <div class="filter-area" style="margin-bottom: 15px;">
        <el-select v-model="logsFilter.operationType" placeholder="变动类型" style="width: 168px;" clearable @change="handleLogsFilterChange">
          <el-option label="全部" value=""></el-option>
          <el-option label="充值" value="充值"></el-option>
          <el-option label="消费" value="消费"></el-option>
          <el-option label="退款" value="退款"></el-option>
          <el-option label="人工增加" value="人工增加"></el-option>
          <el-option label="人工扣减" value="人工扣减"></el-option>
          <el-option label="消费返利" value="消费返利"></el-option>
          <el-option label="折扣返利" value="折扣返利"></el-option>
        </el-select>
      </div>
      
      <el-table :data="userLogsList" border stripe v-loading="logsLoading" style="width: 100%; margin-top: 15px;">
        <el-table-column prop="operationType" label="变动类型" width="150">
          <template #default="{ row }">
            {{ row.operationType }}
          </template>
        </el-table-column>
        <el-table-column prop="operationAmount" label="变动金额" width="120">
          <template #default="{ row }">
            <span :class="{'text-green': row.operationAmount > 0, 'text-red': row.operationAmount < 0}">
              {{ row.operationAmount > 0 ? '+' : '' }}{{ row.operationAmount.toFixed(2) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="operationDesc" label="变动说明" min-width="200"></el-table-column>
        <el-table-column prop="operator" label="操作人" width="120"></el-table-column>
        <el-table-column prop="operationTime" label="变动时间" width="180"></el-table-column>
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

    <!-- 余额操作对话框 -->
    <el-dialog
      v-model="balanceDialogVisible"
      title="余额操作"
      width="500px"
    >
      <div class="balance-info">
        <p>用户昵称：xxxxxxx</p>
        <p>当前余额：<span class="money">¥{{ currentUser?.balance }}</span></p>
      </div>
      <el-form :model="balanceForm" label-width="100px" :rules="balanceRules" ref="balanceFormRef">
        <el-form-item label="操作类型" prop="operationType">
          <el-radio-group v-model="balanceForm.operationType">
            <el-radio label="increase">人工增加</el-radio>
            <el-radio label="decrease">人工扣减</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="操作金额" prop="amount">
          <el-input-number 
            v-model="balanceForm.amount" 
            :precision="2" 
            :step="10" 
            :min="0"
            style="width: 200px;"
          ></el-input-number>
        </el-form-item>
        <el-form-item label="操作说明" prop="remark">
          <el-input 
            v-model="balanceForm.remark" 
            type="textarea" 
            :rows="3" 
            placeholder="请输入操作说明"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="balanceDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitBalanceOperation">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 返利中心对话框 -->
    <el-dialog
      v-model="rebateCenterDialogVisible"
      title="返利中心"
      width="90%"
      top="5vh"
      :fullscreen="false"
      :destroy-on-close="true"
    >
      <div class="rebate-stats-grid">
        <div class="stat-item">
          <div class="stat-title">总返利金额</div>
          <div class="stat-value money">¥{{ currentUser?.rebateAmount || 0 }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-title">已邀请人数</div>
          <div class="stat-value">{{ currentUser?.referralCount || 0 }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-title">消费返利金额</div>
          <div class="stat-value money">¥{{ currentUser?.consumeRebate || 0 }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-title">折扣返利金额</div>
          <div class="stat-value money">¥{{ currentUser?.discountRebate || 0 }}</div>
        </div>
      </div>
      
      <!-- 筛选条件 -->
      <div class="filter-container">
        <el-form :inline="true" :model="rebateFilter" class="filter-form">
          <el-form-item label="返利类型">
            <el-select v-model="rebateFilter.type" placeholder="全部类型" clearable style="width: 168px;">
              <el-option label="全部" value=""></el-option>
              <el-option label="消费返利" value="消费返利"></el-option>
              <el-option label="折扣返利" value="折扣返利"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="时间范围">
            <el-date-picker
              v-model="rebateFilter.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
            ></el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleRebateSearch">查询</el-button>
            <el-button @click="handleRebateReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <!-- 返利记录表格 -->
      <el-table :data="rebateRecords" border stripe style="width: 100%; margin-top: 20px;">
        <el-table-column prop="date" label="日期" width="180"></el-table-column>
        <el-table-column prop="rebateType" label="返利类型" width="120"></el-table-column>
        <el-table-column prop="sourceUserNickname" label="来源用户昵称" width="150"></el-table-column>
        <el-table-column prop="sourceUserLevel" label="来源用户等级" width="120"></el-table-column>
        <el-table-column prop="sourceUserDiscount" label="来源用户折扣" width="120"></el-table-column>
        <el-table-column prop="consumeAmount" label="消费金额" width="120">
          <template #default="scope">
            <span>¥{{ scope.row.consumeAmount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="rebateAmount" label="返利金额" width="120">
          <template #default="scope">
            <span class="money">¥{{ scope.row.rebateAmount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="relatedOrderId" label="关联订单号" min-width="180"></el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="rebateCurrentPage"
          v-model:page-size="rebatePageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="rebateTotalCount"
          @size-change="handleRebateSizeChange"
          @current-change="handleRebateCurrentChange"
          :background="true"
        ></el-pagination>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="rebateCenterDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Edit, Key, Document, Delete, ArrowDown, Money } from '@element-plus/icons-vue'

// 搜索表单
const searchForm = reactive({
  nickname: '',
  email: '',
  status: '',
  vipLevel: '',
  dateRange: []
})

// 表格数据
const tableData = ref([
  {
    userId: 'user001',
    email: 'testuser1@example.com',
    nickname: '测试用户一',
    password: 'password123',
    balance: 100.50,
    rebateAmount: 20.00,
    consumeRebate: 15.00,
    discountRebate: 5.00,
    monthRebate: 5.00,
    rebateOrderCount: 3,
    referralCount: 2,
    parentNickname: '系统用户',
    role: 0, // 普通会员
    totalRecharge: 500.00,
    totalSpent: 250.00,
    status: 'normal',
    statusBool: true,
    registerTime: '2023-01-15 10:30:00',
  },
  {
    userId: 'user002',
    email: 'vipuser2@example.com',
    nickname: 'VIP二号',
    password: 'password456',
    balance: 500.75,
    rebateAmount: 50.00,
    consumeRebate: 30.00,
    discountRebate: 20.00,
    monthRebate: 15.00,
    rebateOrderCount: 8,
    referralCount: 5,
    parentNickname: '测试用户一',
    role: 1, // 银卡会员
    totalRecharge: 2000.00,
    totalSpent: 1200.00,
    status: 'normal',
    statusBool: true,
    registerTime: '2023-02-20 14:00:00',
  },
  {
    userId: 'user003',
    email: 'goldmember3@example.com',
    nickname: '金卡三',
    password: 'password789',
    balance: 2000.00,
    rebateAmount: 150.00,
    consumeRebate: 100.00,
    discountRebate: 50.00,
    monthRebate: 45.00,
    rebateOrderCount: 12,
    referralCount: 10,
    parentNickname: 'VIP二号',
    role: 2, // 金卡会员
    totalRecharge: 8000.00,
    totalSpent: 5000.00,
    status: 'disabled',
    statusBool: false,
    registerTime: '2023-03-10 09:15:00',
  },
  {
    userId: 'user004',
    email: 'diamonduser4@example.com',
    nickname: '钻石头号玩家',
    password: 'passwordabc',
    balance: 150.00,
    rebateAmount: 30.00,
    consumeRebate: 18.00,
    discountRebate: 12.00,
    monthRebate: 10.00,
    rebateOrderCount: 5,
    referralCount: 3,
    parentNickname: '金卡三',
    role: 3, // 钻石会员
    totalRecharge: 1500.00,
    totalSpent: 800.00,
    status: 'normal',
    statusBool: true,
    registerTime: '2023-04-05 18:45:00',
  },
])

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(tableData.value.length)
const loading = ref(false)

// VIP等级名称和样式处理
const getVipLevelName = (level: number) => {
  const vipLevels = {
    0: '普通',
    1: 'VIP1',
    2: 'VIP2',
    3: 'VIP3',
    4: '超级VIP',
  }
  return vipLevels[level as keyof typeof vipLevels] || '未知等级'
}

const getVipLevelType = (level: number) => {
  if (level === 4 || level === 999) {
    return 'danger'
  } else if (level === 0) {
    return 'primary'
  }
  // 所有普通VIP统一使用warning颜色
  return 'warning'
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
  searchForm.nickname = ''
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
  rechargeDiscount: 0, // 新增充值折扣
  parentNickname: '',
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
  userForm.parentNickname = ''
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
  userForm.parentNickname = row.parentNickname
  
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
      // 昵称筛选
      if (searchForm.nickname && !item.nickname.includes(searchForm.nickname)) {
        return false
      }
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
watch([() => searchForm.nickname, () => searchForm.email, () => searchForm.status, () => searchForm.vipLevel, () => searchForm.dateRange], () => {
  currentPage.value = 1
  getUserList()
})

// 初始化
onMounted(() => {
  getUserList()
})

// 用户操作日志相关
const userLogsDialogVisible = ref(false)
const userLogsList = ref<any[]>([
  {
    logId: 'log001',
    userId: 'user001',
    operator: 'admin',
    operationType: '充值',
    operationAmount: 50.00,
    operationDesc: '用户在线充值',
    operationTime: '2023-05-01 10:00:00',
  },
  {
    logId: 'log002',
    userId: 'user002',
    operator: 'system',
    operationType: '等级变更',
    operationAmount: 0,
    operationDesc: '用户升级为银卡会员',
    operationTime: '2023-05-02 11:30:00',
  },
  {
    logId: 'log003',
    userId: 'user001',
    operator: 'user001',
    operationType: '修改密码',
    operationAmount: 0,
    operationDesc: '用户自行修改登录密码',
    operationTime: '2023-05-03 14:20:00',
  },
  {
    logId: 'log004',
    userId: 'user003',
    operator: 'admin',
    operationType: '账户冻结',
    operationAmount: 0,
    operationDesc: '因违规操作，账户被冻结',
    operationTime: '2023-05-04 09:00:00',
  },
])
const logsLoading = ref(false)
const logsCurrentPage = ref(1)
const logsPageSize = ref(10)
const logsTotalCount = ref(userLogsList.value.length)
// 添加日志筛选
const logsFilter = reactive({
  operationType: ''
})

// 处理用户日志
const handleUserLogs = (row: any) => {
  currentUser.value = row
  userLogsDialogVisible.value = true
  logsCurrentPage.value = 1
  logsPageSize.value = 10
  logsFilter.operationType = '' // 重置筛选
  fetchUserLogs()
}

// 处理日志筛选变化
const handleLogsFilterChange = () => {
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
        operator: 'admin',
        operationType: '人工增加',
        operationAmount: 1000.00,
        operationDesc: '人工充值',
        operationTime: '2024-03-15 10:30:22'
      },
      {
        logId: 'L0002',
        userId: currentUser.value.userId,
        operator: 'system',
        operationType: '充值',
        operationAmount: 500.00,
        operationDesc: '用户在线充值',
        operationTime: '2024-03-14 15:45:10'
      },
      {
        logId: 'L0003',
        userId: currentUser.value.userId,
        operator: 'system',
        operationType: '消费',
        operationAmount: -200.00,
        operationDesc: '购买商品消费',
        operationTime: '2024-03-13 09:20:33'
      },
      {
        logId: 'L0004',
        userId: currentUser.value.userId,
        operator: 'admin',
        operationType: '退款',
        operationAmount: 50.00,
        operationDesc: '订单退款',
        operationTime: '2024-03-12 14:10:05'
      },
      {
        logId: 'L0005',
        userId: currentUser.value.userId,
        operator: 'admin',
        operationType: '人工扣减',
        operationAmount: -100.00,
        operationDesc: '扣除无效充值',
        operationTime: '2024-03-10 16:30:45'
      },
      {
        logId: 'L0006',
        userId: currentUser.value.userId,
        operator: 'system',
        operationType: '消费返利',
        operationAmount: 25.00,
        operationDesc: '用户张三消费产生的返利',
        operationTime: '2024-03-08 11:20:15'
      },
      {
        logId: 'L0007',
        userId: currentUser.value.userId,
        operator: 'system',
        operationType: '折扣返利',
        operationAmount: 30.00,
        operationDesc: '用户李四使用折扣产生的返利',
        operationTime: '2024-03-05 09:45:30'
      }
    ]
    
    // 根据筛选条件过滤日志
    let filteredLogs = [...mockLogs]
    if (logsFilter.operationType) {
      filteredLogs = filteredLogs.filter(log => log.operationType === logsFilter.operationType)
    }
    
    userLogsList.value = filteredLogs
    logsTotalCount.value = filteredLogs.length
    logsLoading.value = false
  }, 500)
}

// 获取操作类型标签样式
const getOperationTypeTag = (type: string) => {
  switch (type) {
    case '充值':
    case '人工增加':
    case '退款':
    case '消费返利':
    case '折扣返利':
      return 'success'
    case '消费':
    case '人工扣减':
      return 'danger'
    default:
      return 'info'
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

// 余额操作相关
const balanceDialogVisible = ref(false)
const balanceFormRef = ref<FormInstance>()
const balanceForm = reactive({
  operationType: 'increase',
  amount: 0,
  remark: ''
})

// 返利中心相关
const rebateCenterDialogVisible = ref(false)
const rebateFormRef = ref<FormInstance>()
const rebateForm = reactive({
  amount: 0,
  remark: ''
})

// 返利记录数据
const rebateRecords = ref<any[]>([])
const rebateCurrentPage = ref(1)
const rebatePageSize = ref(10)
const rebateTotalCount = ref(0)
const rebateFilter = reactive({
  type: '',
  dateRange: [] as string[]
})

// 处理返利中心
const handleRebateCenter = (row: any) => {
  currentUser.value = row
  rebateForm.amount = 0
  rebateForm.remark = ''
  rebateCenterDialogVisible.value = true
  rebateCurrentPage.value = 1
  rebatePageSize.value = 10
  fetchRebateRecords()
}

// 获取返利记录
const fetchRebateRecords = () => {
  if (!currentUser.value) return
  
  // 模拟API请求获取返利记录数据
  setTimeout(() => {
    // 模拟返利记录数据
    const mockRebateRecords = [
      {
        id: 'R0001',
        date: '2024-04-01 10:30:22',
        rebateType: '消费返利',
        sourceUserNickname: '张三',
        sourceUserLevel: 'VIP1',
        sourceUserDiscount: '95折',
        consumeAmount: 1000.00,
        rebateAmount: 50.00,
        relatedOrderId: 'ORD2024040100001',
      },
      {
        id: 'R0002',
        date: '2024-04-02 15:45:10',
        rebateType: '折扣返利',
        sourceUserNickname: '李四',
        sourceUserLevel: 'VIP2',
        sourceUserDiscount: '90折',
        consumeAmount: 2000.00,
        rebateAmount: 60.00,
        relatedOrderId: 'ORD2024040200002',
      },
      {
        id: 'R0003',
        date: '2024-04-03 09:20:33',
        rebateType: '消费返利',
        sourceUserNickname: '王五',
        sourceUserLevel: '普通用户',
        sourceUserDiscount: '无折扣',
        consumeAmount: 500.00,
        rebateAmount: 25.00,
        relatedOrderId: 'ORD2024040300003',
      },
      {
        id: 'R0004',
        date: '2024-04-04 14:10:05',
        rebateType: '消费返利',
        sourceUserNickname: '赵六',
        sourceUserLevel: 'VIP3',
        sourceUserDiscount: '85折',
        consumeAmount: 3000.00,
        rebateAmount: 150.00,
        relatedOrderId: 'ORD2024040400004',
      },
      {
        id: 'R0005',
        date: '2024-04-05 16:30:45',
        rebateType: '折扣返利',
        sourceUserNickname: '钱七',
        sourceUserLevel: 'VIP1',
        sourceUserDiscount: '95折',
        consumeAmount: 800.00,
        rebateAmount: 20.00,
        relatedOrderId: 'ORD2024040500005',
      }
    ]
    
    // 根据筛选条件过滤数据
    let filteredRecords = [...mockRebateRecords]
    
    // 按返利类型筛选
    if (rebateFilter.type) {
      filteredRecords = filteredRecords.filter(record => record.rebateType === rebateFilter.type)
    }
    
    // 按日期范围筛选
    if (rebateFilter.dateRange && rebateFilter.dateRange.length === 2) {
      const startDate = new Date(rebateFilter.dateRange[0])
      const endDate = new Date(rebateFilter.dateRange[1])
      
      filteredRecords = filteredRecords.filter(record => {
        const recordDate = new Date(record.date.split(' ')[0])
        return recordDate >= startDate && recordDate <= endDate
      })
    }
    
    // 更新总数
    rebateTotalCount.value = filteredRecords.length
    
    // 分页处理
    const startIndex = (rebateCurrentPage.value - 1) * rebatePageSize.value
    const endIndex = startIndex + rebatePageSize.value
    rebateRecords.value = filteredRecords.slice(startIndex, endIndex)
  }, 500)
}

// 处理返利记录分页
const handleRebateSizeChange = (val: number) => {
  rebatePageSize.value = val
  fetchRebateRecords()
}

const handleRebateCurrentChange = (val: number) => {
  rebateCurrentPage.value = val
  fetchRebateRecords()
}

// 提交返利操作
const submitRebateOperation = async () => {
  if (!rebateFormRef.value) return
  
  await rebateFormRef.value.validate((valid, fields) => {
    if (valid) {
      ElMessage.success('返利操作成功')
      rebateCenterDialogVisible.value = false
    }
  })
}

// 余额操作表单验证规则
const balanceRules = reactive<FormRules>({
  operationType: [
    { required: true, message: '请选择操作类型', trigger: 'change' }
  ],
  amount: [
    { required: true, message: '请输入操作金额', trigger: 'blur' }
  ],
  remark: [
    { required: true, message: '请输入操作说明', trigger: 'blur' },
    { max: 200, message: '操作说明不能超过200个字符', trigger: 'blur' }
  ]
})

// 处理余额操作
const handleBalanceOperation = (row: any) => {
  currentUser.value = row
  balanceForm.operationType = 'increase'
  balanceForm.amount = 0
  balanceForm.remark = ''
  balanceDialogVisible.value = true
}

// 提交余额操作
const submitBalanceOperation = async () => {
  if (!balanceFormRef.value) return
  
  await balanceFormRef.value.validate((valid, fields) => {
    if (valid) {
      const amount = balanceForm.operationType === 'increase' ? balanceForm.amount : -balanceForm.amount
      const operationType = balanceForm.operationType === 'increase' ? '人工增加' : '人工扣减'
      
      // 更新用户余额
      const index = tableData.value.findIndex(item => item.userId === currentUser.value.userId)
      if (index !== -1) {
        const newBalance = tableData.value[index].balance + amount
        if (newBalance < 0) {
          ElMessage.error('用户余额不足')
          return
        }
        tableData.value[index].balance = newBalance
        currentUser.value.balance = newBalance
        
        // 添加操作日志
        const newLog = {
          logId: `L${Date.now()}`,
          userId: currentUser.value.userId,
          operator: 'admin',
          operationType,
          operationAmount: amount,
          operationDesc: balanceForm.remark,
          operationTime: new Date().toLocaleString()
        }
        
        if (userLogsList.value) {
          userLogsList.value.unshift(newLog)
        }
        
        ElMessage.success('操作成功')
        balanceDialogVisible.value = false
      }
    }
  })
}

// 处理返利搜索
const handleRebateSearch = () => {
  rebateCurrentPage.value = 1
  fetchRebateRecords()
}

// 重置返利筛选
const handleRebateReset = () => {
  rebateFilter.type = ''
  rebateFilter.dateRange = []
  rebateCurrentPage.value = 1
  fetchRebateRecords()
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

.balance-info {
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.balance-info p {
  margin: 5px 0;
  font-size: 14px;
  color: #606266;
}

.balance-info .money {
  font-size: 16px;
}

.rebate-stats-grid {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px 0;
}

.stat-item {
  flex: 1;
  text-align: center;
  background-color: #f5f7fa;
  border-radius: 8px;
  padding: 20px;
  margin: 0 10px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.stat-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px 0 rgba(0, 0, 0, 0.1);
}

.stat-title {
  margin-bottom: 10px;
  font-size: 14px;
  color: #606266;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
}

.stat-value.money {
  color: #f56c6c;
}

.filter-container {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #fff;
  border-radius: 4px;
  border: 1px solid #ebeef5;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
}

.filter-form .el-form-item {
  margin-right: 20px;
  margin-bottom: 0;
}

:deep(.el-dialog__header) {
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 15px;
}

:deep(.el-dialog__body) {
  padding: 20px;
}

:deep(.el-dialog__footer) {
  border-top: 1px solid #ebeef5;
  padding-top: 15px;
}
</style> 