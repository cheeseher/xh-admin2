<template>
  <div class="recharge-orders-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>充值订单列表</span>
        </div>
      </template>
      
      <div class="page-description">
        <p>管理所有用户充值余额的订单信息，包括充值金额、支付方式、订单状态等。您可以查看订单详情和确认支付操作。</p>
      </div>
      
      <!-- 搜索区域 -->
      <div class="search-area">
        <el-form :inline="true" :model="searchForm" class="demo-form-inline">
          <el-form-item label="订单号">
            <el-input v-model="searchForm.orderNo" placeholder="请输入订单号" clearable></el-input>
          </el-form-item>
          <el-form-item label="用户邮箱">
            <el-input v-model="searchForm.userEmail" placeholder="请输入用户邮箱" clearable></el-input>
          </el-form-item>
          <el-form-item label="订单状态">
            <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 168px;">
              <el-option label="全部" value=""></el-option>
              <el-option label="待支付" value="pending"></el-option>
              <el-option label="已支付" value="paid"></el-option>
              <el-option label="已取消" value="cancelled"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="支付方式">
            <el-select v-model="searchForm.paymentMethod" placeholder="请选择" clearable style="width: 168px;">
              <el-option label="全部" value=""></el-option>
              <el-option label="USDT" value="usdt"></el-option>
              <el-option label="其他方式" value="other"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="充值时间">
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
      </div>

      <!-- 表格区域 -->
      <el-table
        v-loading="loading"
        :data="orderList"
        border
        stripe
        style="width: 100%"
        @sort-change="handleSortChange"
      >
        <el-table-column prop="orderNo" label="订单号" min-width="180" sortable="custom" />
        <el-table-column prop="userEmail" label="用户邮箱" min-width="180" />
        <el-table-column prop="amount" label="充值金额" min-width="120" sortable="custom">
          <template #default="scope">
            <span class="price">¥{{ scope.row.amount.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="paymentMethod" label="支付方式" min-width="120">
          <template #default="scope">
            <el-tag size="small" effect="plain" :type="scope.row.paymentMethod === 'usdt' ? 'danger' : 'info'">
              {{ scope.row.paymentMethod === 'usdt' ? 'USDT' : '其他方式' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="订单状态" min-width="120">
          <template #default="scope">
            <el-tag v-if="scope.row.status === 'pending'" type="warning">待支付</el-tag>
            <el-tag v-else-if="scope.row.status === 'paid'" type="success">已支付</el-tag>
            <el-tag v-else-if="scope.row.status === 'cancelled'" type="info">已取消</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="180" sortable="custom" />
        <el-table-column prop="payTime" label="支付时间" min-width="180" sortable="custom" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <el-button size="small" @click="viewOrderDetail(scope.row)">查看</el-button>
              <el-button 
                v-if="scope.row.status === 'pending'" 
                size="small" 
                type="success" 
                @click="confirmPayment(scope.row)"
              >确认支付</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

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
        />
      </div>
    </el-card>

    <!-- 订单详情对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="充值订单详情"
      width="700px"
      destroy-on-close
    >
      <div v-if="currentOrder" class="order-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单号" :span="2">{{ currentOrder.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="用户邮箱">{{ currentOrder.userEmail }}</el-descriptions-item>
          <el-descriptions-item label="用户ID">{{ currentOrder.userId }}</el-descriptions-item>
          <el-descriptions-item label="充值金额">¥{{ currentOrder.amount.toFixed(2) }}</el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <el-tag v-if="currentOrder.status === 'pending'" type="warning">待支付</el-tag>
            <el-tag v-else-if="currentOrder.status === 'paid'" type="success">已支付</el-tag>
            <el-tag v-else-if="currentOrder.status === 'cancelled'" type="info">已取消</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="支付方式">
            <el-tag size="small" effect="plain" :type="currentOrder.paymentMethod === 'usdt' ? 'danger' : 'info'">
              {{ currentOrder.paymentMethod === 'usdt' ? 'USDT' : '其他方式' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="交易流水号">{{ currentOrder.transactionId || '暂无' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ currentOrder.createTime }}</el-descriptions-item>
          <el-descriptions-item label="支付时间">{{ currentOrder.payTime || '暂无' }}</el-descriptions-item>
        </el-descriptions>

        <div class="operation-log" v-if="currentOrder.logs && currentOrder.logs.length > 0">
          <h3>操作日志</h3>
          <el-timeline>
            <el-timeline-item
              v-for="(log, index) in currentOrder.logs"
              :key="index"
              :timestamp="log.time"
              :type="getLogType(log.action)"
            >
              {{ log.action }} - {{ log.operator }}
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">关闭</el-button>
          <el-button 
            v-if="currentOrder && currentOrder.status === 'pending'" 
            type="success" 
            @click="confirmPayment(currentOrder)"
          >确认支付</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 定义充值订单类型
interface RechargeOrder {
  id: number
  orderNo: string
  userId: number
  userEmail: string
  amount: number
  status: 'pending' | 'paid' | 'cancelled'
  paymentMethod: 'usdt' | 'other' | string
  transactionId?: string
  createTime: string
  payTime?: string
  logs?: Array<{
    time: string
    action: string
    operator: string
  }>
}

// 搜索表单
const searchForm = reactive({
  orderNo: '',
  userEmail: '',
  status: '',
  paymentMethod: '',
  dateRange: [] as string[]
})

// 表格数据
const loading = ref(false)
const orderList = ref<RechargeOrder[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const dialogVisible = ref(false)
const currentOrder = ref<RechargeOrder | null>(null)

// 获取订单列表
const fetchOrders = async () => {
  loading.value = true
  try {
    // 实际项目中应该调用API获取数据
    // 这里模拟一些数据
    setTimeout(() => {
      const mockData: RechargeOrder[] = [
        {
          id: 1,
          orderNo: 'CZ202403100001',
          userId: 1001,
          userEmail: 'zhangsan@example.com',
          amount: 100.00,
          status: 'paid',
          paymentMethod: 'usdt',
          transactionId: '2024031012345678',
          createTime: '2024-03-10 10:00:00',
          payTime: '2024-03-10 10:05:23',
          logs: [
            { time: '2024-03-10 10:00:00', action: '创建订单', operator: '系统' },
            { time: '2024-03-10 10:05:23', action: '支付成功', operator: '系统' }
          ]
        },
        {
          id: 2,
          orderNo: 'CZ202403100002',
          userId: 1002,
          userEmail: 'lisi@example.com',
          amount: 200.00,
          status: 'pending',
          paymentMethod: 'other',
          createTime: '2024-03-10 11:30:00',
          logs: [
            { time: '2024-03-10 11:30:00', action: '创建订单', operator: '系统' }
          ]
        },
        {
          id: 3,
          orderNo: 'CZ202403100003',
          userId: 1003,
          userEmail: 'wangwu@example.com',
          amount: 500.00,
          status: 'cancelled',
          paymentMethod: 'other',
          createTime: '2024-03-10 14:20:00',
          logs: [
            { time: '2024-03-10 14:20:00', action: '创建订单', operator: '系统' },
            { time: '2024-03-10 15:30:00', action: '取消订单', operator: '管理员' }
          ]
        },
        {
          id: 4,
          orderNo: 'CZ202403100004',
          userId: 1004,
          userEmail: 'zhaoliu@example.com',
          amount: 1000.00,
          status: 'cancelled',
          paymentMethod: 'other',
          transactionId: '2024031087654321',
          createTime: '2024-03-10 16:00:00',
          payTime: '2024-03-10 16:05:12',
          logs: [
            { time: '2024-03-10 16:00:00', action: '创建订单', operator: '系统' },
            { time: '2024-03-10 16:05:12', action: '支付成功', operator: '系统' },
            { time: '2024-03-10 16:30:00', action: '取消订单', operator: '管理员' }
          ]
        }
      ]
      
      orderList.value = mockData
      total.value = mockData.length
      loading.value = false
    }, 500)
  } catch (error) {
    console.error('获取充值订单列表失败:', error)
    ElMessage.error('获取充值订单列表失败')
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchOrders()
}

// 重置搜索
const resetSearch = () => {
  Object.keys(searchForm).forEach(key => {
    // @ts-ignore
    searchForm[key] = key === 'dateRange' ? [] : ''
  })
  handleSearch()
}

// 排序变化
const handleSortChange = (column: { prop: string; order: string }) => {
  // 实际项目中应该根据排序字段和顺序重新请求数据
  console.log('排序字段:', column.prop, '排序方式:', column.order)
  fetchOrders()
}

// 页码变化
const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchOrders()
}

// 每页条数变化
const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
  fetchOrders()
}

// 查看订单详情
const viewOrderDetail = (order: RechargeOrder) => {
  currentOrder.value = order
  dialogVisible.value = true
}

// 确认支付
const confirmPayment = (order: RechargeOrder) => {
  ElMessageBox.confirm(`确认将订单 ${order.orderNo} 标记为已支付吗？`, '确认操作', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 实际项目中应该调用API更新订单状态
    // 这里模拟更新
    const index = orderList.value.findIndex(item => item.id === order.id)
    if (index !== -1) {
      orderList.value[index].status = 'paid'
      orderList.value[index].payTime = new Date().toLocaleString()
      if (orderList.value[index].logs) {
        orderList.value[index].logs.push({
          time: new Date().toLocaleString(),
          action: '确认支付',
          operator: '管理员'
        })
      }
      
      if (currentOrder.value && currentOrder.value.id === order.id) {
        currentOrder.value = { ...orderList.value[index] }
      }
    }
    
    ElMessage.success('操作成功')
  }).catch(() => {
    // 取消操作
  })
}

// 获取日志类型
const getLogType = (action: string) => {
  if (action.includes('创建')) return 'primary'
  if (action.includes('支付') || action.includes('确认')) return 'success'
  if (action.includes('取消')) return 'info'
  return 'info'
}

onMounted(() => {
  fetchOrders()
})
</script>

<style scoped>
.recharge-orders-container {
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

.price {
  color: #f56c6c;
  font-weight: bold;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.order-detail {
  padding: 10px;
}

.operation-log {
  margin-top: 20px;
}

.operation-log h3 {
  margin-bottom: 15px;
  font-weight: 500;
  color: #606266;
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