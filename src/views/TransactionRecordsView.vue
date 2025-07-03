<template>
  <div class="transaction-records-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>流水记录</span>
          <el-button type="primary" @click="exportRecords">导出记录</el-button>
        </div>
      </template>
      
      <div class="page-description">
        <p>查看系统内所有账户的充值、消费、提现等资金流水记录，您可以按照不同条件筛选和导出数据。</p>
      </div>
      
      <!-- 搜索区域 -->
      <div class="search-area">
        <el-form :inline="true" :model="searchForm" class="demo-form-inline">
          <el-form-item label="用户信息">
            <el-input v-model="searchForm.userInfo" placeholder="请输入用户昵称/邮箱" clearable></el-input>
          </el-form-item>
          <el-form-item label="流水类型">
            <el-select v-model="searchForm.type" placeholder="请选择" clearable style="width: 168px;">
              <el-option label="全部" value=""></el-option>
              <el-option label="充值" value="recharge"></el-option>
              <el-option label="消费" value="consume"></el-option>
              <el-option label="退款" value="refund"></el-option>
              <el-option label="提现" value="withdraw"></el-option>
              <el-option label="返利" value="rebate"></el-option>
              <el-option label="调整" value="adjust"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="流水状态">
            <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 168px;">
              <el-option label="全部" value=""></el-option>
              <el-option label="成功" value="success"></el-option>
              <el-option label="失败" value="failed"></el-option>
              <el-option label="处理中" value="processing"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="交易时间">
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
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
        
        <!-- 汇总信息 -->
        <div class="search-summary">
          <div class="total-amount">
            <span>总流水数：</span>
            <span class="amount-value" style="color: #409EFF;">{{ totalRecords }}</span>
            <span style="margin-left: 20px;">收入总额：</span>
            <span class="amount-value" style="color: #67C23A;">¥{{ totalIncome.toFixed(2) }}</span>
            <span style="margin-left: 20px;">支出总额：</span>
            <span class="amount-value" style="color: #F56C6C;">¥{{ totalExpense.toFixed(2) }}</span>
            <span style="margin-left: 20px;">净收入：</span>
            <span class="amount-value" :style="{ color: netIncome >= 0 ? '#67C23A' : '#F56C6C' }">¥{{ netIncome.toFixed(2) }}</span>
          </div>
        </div>
      </div>
      
      <!-- 表格区域 -->
      <el-table :data="tableData" style="width: 100%" v-loading="loading" border stripe>
        <el-table-column prop="id" label="流水ID" width="120"></el-table-column>
        <el-table-column prop="orderNo" label="关联单号" width="180">
          <template #default="scope">
            <el-link type="primary" v-if="scope.row.orderNo" @click="viewRelatedOrder(scope.row)">{{ scope.row.orderNo }}</el-link>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="用户信息" width="180">
          <template #default="scope">
            <div class="user-info">
              <div class="user-nickname">{{ scope.row.userNickname }}</div>
              <div class="user-email">{{ scope.row.userEmail }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="流水类型" width="120">
          <template #default="scope">
            <el-tag :type="getTypeTag(scope.row.type)">{{ getTypeLabel(scope.row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="金额" width="120">
          <template #default="scope">
            <span :class="scope.row.amount > 0 ? 'income' : 'expense'">{{ scope.row.amount > 0 ? '+' : '' }}{{ scope.row.amount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="balance" label="账户余额" width="120">
          <template #default="scope">
            <span class="balance">¥{{ scope.row.balance }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="payMethod" label="支付方式" width="120">
          <template #default="scope">
            <el-tag v-if="scope.row.payMethod" :type="getPayMethodType(scope.row.payMethod)" size="small">
              {{ getPayMethodLabel(scope.row.payMethod) }}
            </el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">{{ getStatusLabel(scope.row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="交易时间" width="180"></el-table-column>
        <el-table-column prop="remark" label="备注" min-width="200"></el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="scope">
            <el-button link type="primary" @click="viewDetail(scope.row)">查看详情</el-button>
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 搜索表单
const searchForm = reactive({
  userInfo: '',
  type: '',
  status: '',
  dateRange: [] as string[]
})

// 表格数据
const tableData = ref([
  {
    id: 'TXN001',
    orderNo: 'P20230501001',
    userNickname: '小明',
    userEmail: 'user1@example.com',
    type: 'recharge',
    amount: 100.00,
    balance: 100.00,
    payMethod: 'alipay',
    status: 'success',
    createTime: '2023-05-01 10:00:00',
    remark: '用户充值'
  },
  {
    id: 'TXN002',
    orderNo: 'P20230501002',
    userNickname: '大卫',
    userEmail: 'user2@example.com',
    type: 'consume',
    amount: -25.50,
    balance: 74.50,
    payMethod: 'balance',
    status: 'success',
    createTime: '2023-05-01 11:30:00',
    remark: '购买商品'
  },
  {
    id: 'TXN003',
    orderNo: 'P20230502001',
    userNickname: '游客123',
    userEmail: 'visitor123@example.com',
    type: 'refund',
    amount: 60.00,
    balance: 60.00,
    payMethod: 'wechat',
    status: 'success',
    createTime: '2023-05-02 09:15:00',
    remark: '退款'
  },
  {
    id: 'TXN004',
    orderNo: '',
    userNickname: '超级用户',
    userEmail: 'supermember@example.com',
    type: 'withdraw',
    amount: -100.00,
    balance: 200.00,
    payMethod: 'bank',
    status: 'processing',
    createTime: '2023-05-02 14:45:00',
    remark: '用户提现申请'
  },
  {
    id: 'TXN005',
    orderNo: 'P20230503001',
    userNickname: '商业客户',
    userEmail: 'business_user@example.com',
    type: 'rebate',
    amount: 15.99,
    balance: 315.99,
    payMethod: '',
    status: 'success',
    createTime: '2023-05-03 09:20:00',
    remark: '推广返利'
  },
  {
    id: 'TXN006',
    orderNo: '',
    userNickname: '科技达人',
    userEmail: 'tech_user@example.com',
    type: 'adjust',
    amount: -50.00,
    balance: 150.00,
    payMethod: '',
    status: 'success',
    createTime: '2023-05-03 16:45:00',
    remark: '管理员调整'
  }
])

// 加载状态
const loading = ref(false)

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(6)

// 数据统计
const totalRecords = ref(6)
const totalIncome = ref(175.99)  // 充值+返利
const totalExpense = ref(175.50) // 消费+提现+调整

// 计算净收入
const netIncome = computed(() => {
  return totalIncome.value - totalExpense.value
})

// 查询处理
const handleSearch = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    // 这里通常是调用API进行查询
    ElMessage.success('查询成功')
  }, 500)
}

// 重置查询表单
const resetSearch = () => {
  searchForm.userInfo = ''
  searchForm.type = ''
  searchForm.status = ''
  searchForm.dateRange = []
  handleSearch()
}

// 分页大小变化
const handleSizeChange = (val: number) => {
  pageSize.value = val
  handleSearch()
}

// 当前页变化
const handleCurrentChange = (val: number) => {
  currentPage.value = val
  handleSearch()
}

// 查看详情
const viewDetail = (row: any) => {
  ElMessageBox.alert(
    `<div class="transaction-detail">
      <h3>流水详细信息</h3>
      <div class="detail-item">
        <span class="label">流水ID：</span>
        <span>${row.id}</span>
      </div>
      <div class="detail-item">
        <span class="label">关联单号：</span>
        <span>${row.orderNo || '无'}</span>
      </div>
      <div class="detail-item">
        <span class="label">用户昵称：</span>
        <span>${row.userNickname}</span>
      </div>
      <div class="detail-item">
        <span class="label">用户邮箱：</span>
        <span>${row.userEmail}</span>
      </div>
      <div class="detail-item">
        <span class="label">流水类型：</span>
        <span>${getTypeLabel(row.type)}</span>
      </div>
      <div class="detail-item">
        <span class="label">交易金额：</span>
        <span class="${row.amount > 0 ? 'income' : 'expense'}">${row.amount > 0 ? '+' : ''}${row.amount}</span>
      </div>
      <div class="detail-item">
        <span class="label">账户余额：</span>
        <span>¥${row.balance}</span>
      </div>
      <div class="detail-item">
        <span class="label">支付方式：</span>
        <span>${row.payMethod ? getPayMethodLabel(row.payMethod) : '无'}</span>
      </div>
      <div class="detail-item">
        <span class="label">交易状态：</span>
        <span>${getStatusLabel(row.status)}</span>
      </div>
      <div class="detail-item">
        <span class="label">交易时间：</span>
        <span>${row.createTime}</span>
      </div>
      <div class="detail-item">
        <span class="label">备注信息：</span>
        <span>${row.remark || '无'}</span>
      </div>
    </div>`,
    '流水详情',
    {
      dangerouslyUseHTMLString: true,
      confirmButtonText: '关闭',
      customClass: 'transaction-detail-dialog'
    }
  )
}

// 查看关联订单
const viewRelatedOrder = (row: any) => {
  ElMessage.info(`查看订单 ${row.orderNo} 的详细信息`)
}

// 导出记录
const exportRecords = () => {
  ElMessage.success('流水记录导出成功')
}

// 获取流水类型标签样式
const getTypeTag = (type: string) => {
  const typeMap: Record<string, string> = {
    recharge: 'success',
    consume: 'info',
    refund: 'warning',
    withdraw: 'danger',
    rebate: 'success',
    adjust: ''
  }
  return typeMap[type] || ''
}

// 获取流水类型标签文本
const getTypeLabel = (type: string) => {
  const typeMap: Record<string, string> = {
    recharge: '充值',
    consume: '消费',
    refund: '退款',
    withdraw: '提现',
    rebate: '返利',
    adjust: '调整'
  }
  return typeMap[type] || type
}

// 获取支付方式标签样式
const getPayMethodType = (method: string) => {
  const methodMap: Record<string, string> = {
    alipay: '',
    wechat: 'success',
    bank: 'info',
    usdt: 'warning',
    balance: 'info'
  }
  return methodMap[method] || ''
}

// 获取支付方式标签文本
const getPayMethodLabel = (method: string) => {
  const methodMap: Record<string, string> = {
    alipay: '支付宝',
    wechat: '微信',
    bank: '银行卡',
    usdt: 'USDT',
    balance: '余额'
  }
  return methodMap[method] || method
}

// 获取状态标签样式
const getStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    success: 'success',
    failed: 'danger',
    processing: 'warning'
  }
  return statusMap[status] || ''
}

// 获取状态标签文本
const getStatusLabel = (status: string) => {
  const statusMap: Record<string, string> = {
    success: '成功',
    failed: '失败',
    processing: '处理中'
  }
  return statusMap[status] || status
}

// 初始化
onMounted(() => {
  handleSearch()
})
</script>

<style scoped>
.transaction-records-container {
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

.page-description {
  margin-bottom: 20px;
  padding: 10px;
  background-color: #ecf8ff;
  border-radius: 4px;
  border-left: 5px solid #50bfff;
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

.search-summary {
  margin-top: 15px;
  background-color: #f8f8f8;
  padding: 12px;
  border-radius: 4px;
}

.total-amount {
  color: #606266;
}

.amount-value {
  font-weight: bold;
  margin-right: 10px;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-email {
  font-size: 12px;
  color: #909399;
}

.income {
  color: #67c23a;
  font-weight: bold;
}

.expense {
  color: #f56c6c;
  font-weight: bold;
}

.balance {
  font-weight: bold;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.transaction-detail-dialog .el-message-box__message) {
  max-height: 500px;
  overflow-y: auto;
}

.transaction-detail h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #303133;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 10px;
}

.detail-item {
  margin-bottom: 10px;
}

.detail-item .label {
  display: inline-block;
  width: 80px;
  color: #606266;
  font-weight: bold;
}
</style> 