<template>
  <div class="recharge-orders-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>充值订单列表</span>
          <div class="header-actions">
            <el-button type="success" @click="exportAllOrders">
              <el-icon><Download /></el-icon>
              导出所有订单
            </el-button>
          </div>
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
              <el-option label="已退款" value="refunded"></el-option>
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
          <el-form-item label="提款状态">
            <el-select v-model="searchForm.withdrawalStatus" placeholder="请选择" clearable style="width: 168px;">
              <el-option label="全部" value=""></el-option>
              <el-option label="已提款" value="withdrawn"></el-option>
              <el-option label="未提款" value="not_withdrawn"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
        
        <!-- 添加总充值金额和导出按钮 -->
        <div class="search-summary">
          <div class="total-amount">
            <span>筛选结果总充值金额：</span>
            <span class="amount-value">¥{{ totalAmount.toFixed(2) }}</span>
            <span v-if="multipleSelection.length > 0" style="margin-left: 20px;">已选择：{{ multipleSelection.length }}笔订单</span>
            <span v-if="multipleSelection.length > 0" class="amount-value">¥{{ selectedTotalAmount.toFixed(2) }}</span>
          </div>
          <div class="action-btns">
            <el-button type="success" @click="exportOrders" :disabled="multipleSelection.length === 0">
              <el-icon><Download /></el-icon>
              导出选中订单
            </el-button>
          </div>
        </div>
      </div>

      <!-- 表格区域 -->
      <el-table
        v-loading="loading"
        :data="orderList"
        border
        stripe
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="充值订单ID" min-width="100" />
        <el-table-column prop="orderNo" label="订单号" min-width="180" />
        <el-table-column prop="userEmail" label="用户邮箱" min-width="180" />
        <el-table-column prop="amount" label="充值金额" min-width="120">
          <template #default="scope">
            <span class="price">¥{{ scope.row.amount.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="fee" label="手续费" min-width="100">
          <template #default="scope">
            <span class="fee">¥{{ scope.row.fee ? scope.row.fee.toFixed(2) : '0.00' }}</span>
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
            <el-tag v-else-if="scope.row.status === 'paid' && !scope.row.refunded" type="success">已支付</el-tag>
            <el-tag v-else-if="scope.row.status === 'cancelled' && scope.row.refunded" type="danger">已退款</el-tag>
            <el-tag v-else-if="scope.row.status === 'cancelled'" type="info">已取消</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="withdrawalStatus" label="提款状态" min-width="120">
          <template #default="scope">
            <el-tag v-if="scope.row.withdrawalStatus === 'withdrawn'" type="success">已提款</el-tag>
            <el-tag v-else-if="scope.row.withdrawalStatus === 'not_withdrawn'" type="info">未提款</el-tag>
            <el-tag v-else type="info">未提款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="180" />
        <el-table-column prop="payTime" label="支付时间" min-width="180" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <el-button 
                v-if="scope.row.status === 'pending'" 
                size="small" 
                type="success" 
                @click="confirmPayment(scope.row)"
              >确认支付</el-button>
              <el-button 
                v-if="scope.row.status === 'paid'" 
                size="small" 
                type="warning" 
                @click="handleRefund(scope.row)"
              >退款</el-button>
              <el-button 
                size="small" 
                type="danger" 
                @click="handleDelete(scope.row)"
              >删除</el-button>
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
          <el-descriptions-item label="手续费">¥{{ currentOrder.fee ? currentOrder.fee.toFixed(2) : '0.00' }}</el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <el-tag v-if="currentOrder.status === 'pending'" type="warning">待支付</el-tag>
            <el-tag v-else-if="currentOrder.status === 'paid' && !currentOrder.refunded" type="success">已支付</el-tag>
            <el-tag v-else-if="currentOrder.status === 'cancelled' && currentOrder.refunded" type="danger">已退款</el-tag>
            <el-tag v-else-if="currentOrder.status === 'cancelled'" type="info">已取消</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="提款状态">
            <el-tag v-if="currentOrder.withdrawalStatus === 'withdrawn'" type="success">已提款</el-tag>
            <el-tag v-else-if="currentOrder.withdrawalStatus === 'not_withdrawn'" type="info">未提款</el-tag>
            <el-tag v-else type="info">未提款</el-tag>
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

    <!-- 退款对话框 -->
    <el-dialog
      v-model="refundDialogVisible"
      title="充值订单退款"
      width="550px"
    >
      <el-form :model="refundForm" label-width="100px" :rules="refundRules" ref="refundFormRef">
        <el-form-item label="订单号">
          <el-input v-model="refundForm.orderNo" disabled></el-input>
        </el-form-item>
        <el-form-item label="用户邮箱">
          <el-input v-model="refundForm.userEmail" disabled></el-input>
        </el-form-item>
        <el-form-item label="充值金额">
          <el-input v-model="refundForm.amount" disabled>
            <template #prepend>¥</template>
          </el-input>
        </el-form-item>
        <el-form-item label="退款金额" prop="refundAmount">
          <el-input-number 
            v-model="refundForm.refundAmount" 
            :min="0" 
            :max="refundForm.amount" 
            :precision="2" 
            :step="0.01"
            style="width: 100%;"
          ></el-input-number>
          <div class="form-tip">
            <div>默认退款金额: ¥{{ refundForm.refundAmount.toFixed(2) }}（已扣除手续费）</div>
            <div>最大可退金额: ¥{{ refundForm.amount.toFixed(2) }}</div>
          </div>
        </el-form-item>
        <el-form-item label="退款原因" prop="refundReason">
          <el-select v-model="refundForm.refundReason" placeholder="请选择退款原因" style="width: 100%;">
            <el-option label="客户申请退款" value="客户申请退款"></el-option>
            <el-option label="充值金额错误" value="充值金额错误"></el-option>
            <el-option label="系统错误" value="系统错误"></el-option>
            <el-option label="其他原因" value="其他原因"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="退款说明" prop="refundRemark">
          <el-input 
            v-model="refundForm.refundRemark" 
            type="textarea" 
            :rows="3" 
            placeholder="请输入退款说明"
          ></el-input>
        </el-form-item>
        <el-form-item label="扣除余额" prop="deductBalance">
          <el-switch v-model="refundForm.deductBalance"></el-switch>
          <div class="form-tip">开启后将从用户账户余额中扣除相应金额，请确保用户余额充足</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="refundDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitRefundForm">确认退款</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Download, Money } from '@element-plus/icons-vue'

// 定义充值订单类型
interface RechargeOrder {
  id: string
  orderNo: string
  userId: number
  userEmail: string
  amount: number
  fee?: number
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
  refunded?: boolean
  withdrawalStatus?: 'withdrawn' | 'not_withdrawn'
}

// 搜索表单
const searchForm = reactive({
  orderNo: '',
  userEmail: '',
  status: '',
  paymentMethod: '',
  dateRange: [] as string[],
  withdrawalStatus: ''
})

// 表格数据
const loading = ref(false)
const orderList = ref<RechargeOrder[]>([
  {
    id: '2001',
    orderNo: 'RO20230901001',
    userId: 1001,
    userEmail: 'user1@example.com',
    amount: 1000.00,
    fee: 10.00,
    status: 'pending',
    paymentMethod: 'usdt',
    createTime: '2023-09-01 09:00:00',
    withdrawalStatus: 'not_withdrawn'
  },
  {
    id: '2002',
    orderNo: 'RO20230901002',
    userId: 1002,
    userEmail: 'user2@example.com',
    amount: 2000.00,
    fee: 20.00,
    status: 'paid',
    paymentMethod: 'usdt',
    transactionId: 'TX001',
    createTime: '2023-09-01 10:00:00',
    payTime: '2023-09-01 10:05:00',
    withdrawalStatus: 'not_withdrawn',
    refunded: false
  }
])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const dialogVisible = ref(false)
const currentOrder = ref<RechargeOrder | null>(null)

// 退款对话框相关
const refundDialogVisible = ref(false)
const refundFormRef = ref<FormInstance>()
const refundForm = reactive({
  orderNo: '',
  userEmail: '',
  amount: 0,
  refundAmount: 0,
  refundReason: '',
  refundRemark: '',
  deductBalance: true
})

// 退款表单验证规则
const refundRules = reactive<FormRules>({
  refundAmount: [
    { required: true, message: '请输入退款金额', trigger: 'blur' }
  ],
  refundReason: [
    { required: true, message: '请选择退款原因', trigger: 'change' }
  ],
  refundRemark: [
    { max: 200, message: '退款说明不能超过200个字符', trigger: 'blur' }
  ]
})

// 添加总充值金额计算
const totalAmount = computed(() => {
  if (orderList.value.length === 0) return 0;
  return orderList.value.reduce((sum, order) => sum + order.amount, 0)
})

// 添加总提款金额计算
const totalWithdrawal = computed(() => {
  return orderList.value.reduce((sum, order) => {
    // 这里可以根据实际业务逻辑调整计算规则
    return sum + (order.status === 'paid' ? order.amount : 0)
  }, 0)
})

// 多选相关
const multipleSelection = ref<RechargeOrder[]>([])

// 处理表格选择变化
const handleSelectionChange = (selection: RechargeOrder[]) => {
  multipleSelection.value = selection
}

// 计算选中订单的总金额
const selectedTotalAmount = computed(() => {
  return multipleSelection.value.reduce((sum, order) => sum + order.amount, 0)
})

// 获取订单列表
const fetchOrders = async () => {
  loading.value = true
  try {
    // 实际项目中应该调用API获取数据
    // 这里模拟一些数据
    setTimeout(() => {
      const mockData: RechargeOrder[] = [
        {
          id: 'R000001',
          orderNo: 'CZ202403100001',
          userId: 1001,
          userEmail: 'zhangsan@example.com',
          amount: 1000.00,
          fee: 10.00,
          status: 'paid',
          paymentMethod: 'usdt',
          transactionId: '2024031012345678',
          createTime: '2024-03-10 10:00:00',
          payTime: '2024-03-10 10:05:23',
          withdrawalStatus: 'withdrawn',
          logs: [
            { time: '2024-03-10 10:00:00', action: '创建订单', operator: '系统' },
            { time: '2024-03-10 10:05:23', action: '支付成功', operator: '系统' },
            { time: '2024-03-10 11:00:00', action: '提款完成', operator: '管理员' }
          ]
        },
        {
          id: 'R000002',
          orderNo: 'CZ202403100002',
          userId: 1002,
          userEmail: 'lisi@example.com',
          amount: 2000.00,
          fee: 20.00,
          status: 'pending',
          paymentMethod: 'usdt',
          createTime: '2024-03-10 11:30:00',
          withdrawalStatus: 'not_withdrawn',
          logs: [
            { time: '2024-03-10 11:30:00', action: '创建订单', operator: '系统' }
          ]
        },
        {
          id: 'R000003',
          orderNo: 'CZ202403100003',
          userId: 1003,
          userEmail: 'wangwu@example.com',
          amount: 500.00,
          fee: 5.00,
          status: 'cancelled',
          paymentMethod: 'other',
          createTime: '2024-03-10 14:20:00',
          withdrawalStatus: 'not_withdrawn',
          logs: [
            { time: '2024-03-10 14:20:00', action: '创建订单', operator: '系统' },
            { time: '2024-03-10 15:30:00', action: '取消订单', operator: '管理员' }
          ]
        },
        {
          id: 'R000004',
          orderNo: 'CZ202403100004',
          userId: 1004,
          userEmail: 'zhaoliu@example.com',
          amount: 1000.00,
          fee: 10.00,
          status: 'paid',
          paymentMethod: 'usdt',
          transactionId: '2024031087654321',
          createTime: '2024-03-10 16:00:00',
          payTime: '2024-03-10 16:05:12',
          withdrawalStatus: 'not_withdrawn',
          logs: [
            { time: '2024-03-10 16:00:00', action: '创建订单', operator: '系统' },
            { time: '2024-03-10 16:05:12', action: '支付成功', operator: '系统' }
          ]
        },
        {
          id: 'R000005',
          orderNo: 'CZ202403110001',
          userId: 1005,
          userEmail: 'sunqi@example.com',
          amount: 3000.00,
          fee: 30.00,
          status: 'paid',
          paymentMethod: 'other',
          transactionId: '2024031100001',
          createTime: '2024-03-11 09:15:00',
          payTime: '2024-03-11 09:20:35',
          withdrawalStatus: 'not_withdrawn',
          logs: [
            { time: '2024-03-11 09:15:00', action: '创建订单', operator: '系统' },
            { time: '2024-03-11 09:20:35', action: '支付成功', operator: '系统' }
          ]
        },
        {
          id: 'R000006',
          orderNo: 'CZ202403110002',
          userId: 1006,
          userEmail: 'zhouba@example.com',
          amount: 5000.00,
          fee: 50.00,
          status: 'cancelled',
          paymentMethod: 'usdt',
          refunded: true,
          createTime: '2024-03-11 10:30:00',
          payTime: '2024-03-11 10:35:22',
          withdrawalStatus: 'not_withdrawn',
          logs: [
            { time: '2024-03-11 10:30:00', action: '创建订单', operator: '系统' },
            { time: '2024-03-11 10:35:22', action: '支付成功', operator: '系统' },
            { time: '2024-03-11 14:20:00', action: '退款 ¥5000.00 - 客户申请退款', operator: '管理员' }
          ]
        },
        {
          id: 'R000007',
          orderNo: 'CZ202403110003',
          userId: 1007,
          userEmail: 'wujiu@example.com',
          amount: 800.00,
          fee: 8.00,
          status: 'paid',
          paymentMethod: 'other',
          transactionId: '2024031100003',
          createTime: '2024-03-11 13:45:00',
          payTime: '2024-03-11 13:50:18',
          withdrawalStatus: 'withdrawn',
          logs: [
            { time: '2024-03-11 13:45:00', action: '创建订单', operator: '系统' },
            { time: '2024-03-11 13:50:18', action: '支付成功', operator: '系统' },
            { time: '2024-03-11 16:30:00', action: '提款 ¥800.00', operator: '管理员' }
          ]
        },
        {
          id: 'R000008',
          orderNo: 'CZ202403120001',
          userId: 1008,
          userEmail: 'zhengshi@example.com',
          amount: 1500.00,
          fee: 15.00,
          status: 'pending',
          paymentMethod: 'other',
          createTime: '2024-03-12 08:30:00',
          withdrawalStatus: 'not_withdrawn',
          logs: [
            { time: '2024-03-12 08:30:00', action: '创建订单', operator: '系统' }
          ]
        },
        {
          id: 'R000009',
          orderNo: 'CZ202403120002',
          userId: 1009,
          userEmail: 'wangshi@example.com',
          amount: 2500.00,
          fee: 25.00,
          status: 'paid',
          paymentMethod: 'usdt',
          transactionId: '2024031200002',
          createTime: '2024-03-12 10:15:00',
          payTime: '2024-03-12 10:20:45',
          withdrawalStatus: 'withdrawn',
          logs: [
            { time: '2024-03-12 10:15:00', action: '创建订单', operator: '系统' },
            { time: '2024-03-12 10:20:45', action: '支付成功', operator: '系统' },
            { time: '2024-03-12 11:30:00', action: '提款 ¥2500.00', operator: '管理员' }
          ]
        },
        {
          id: 'R000010',
          orderNo: 'CZ202403120003',
          userId: 1010,
          userEmail: 'lishi@example.com',
          amount: 3500.00,
          fee: 35.00,
          status: 'cancelled',
          paymentMethod: 'other',
          refunded: true,
          createTime: '2024-03-12 14:00:00',
          payTime: '2024-03-12 14:05:33',
          withdrawalStatus: 'not_withdrawn',
          logs: [
            { time: '2024-03-12 14:00:00', action: '创建订单', operator: '系统' },
            { time: '2024-03-12 14:05:33', action: '支付成功', operator: '系统' },
            { time: '2024-03-12 16:45:00', action: '退款 ¥3500.00 - 系统错误', operator: '管理员' }
          ]
        },
        {
          id: 'R000011',
          orderNo: 'CZ202403130001',
          userId: 1011,
          userEmail: 'zhangshiyi@example.com',
          amount: 6000.00,
          fee: 60.00,
          status: 'paid',
          paymentMethod: 'usdt',
          transactionId: '2024031300001',
          createTime: '2024-03-13 09:00:00',
          payTime: '2024-03-13 09:10:15',
          withdrawalStatus: 'not_withdrawn',
          logs: [
            { time: '2024-03-13 09:00:00', action: '创建订单', operator: '系统' },
            { time: '2024-03-13 09:10:15', action: '支付成功', operator: '系统' }
          ]
        },
        {
          id: 'R000012',
          orderNo: 'CZ202403130002',
          userId: 1012,
          userEmail: 'lishier@example.com',
          amount: 4000.00,
          fee: 40.00,
          status: 'pending',
          paymentMethod: 'other',
          createTime: '2024-03-13 11:20:00',
          withdrawalStatus: 'not_withdrawn',
          logs: [
            { time: '2024-03-13 11:20:00', action: '创建订单', operator: '系统' }
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
  loading.value = true
  
  // 模拟搜索操作
  setTimeout(() => {
    let filteredList = [...orderList.value]
    
    if (searchForm.orderNo) {
      filteredList = filteredList.filter(item => item.orderNo.includes(searchForm.orderNo))
    }
    
    if (searchForm.userEmail) {
      filteredList = filteredList.filter(item => item.userEmail.includes(searchForm.userEmail))
    }
    
    if (searchForm.status) {
      if (searchForm.status === 'refunded') {
        // 处理已退款状态的特殊搜索
        filteredList = filteredList.filter(item => item.status === 'cancelled' && item.refunded === true)
      } else {
        filteredList = filteredList.filter(item => item.status === searchForm.status)
        // 如果搜索已支付状态，排除已退款的订单
        if (searchForm.status === 'paid') {
          filteredList = filteredList.filter(item => !item.refunded)
        }
      }
    }
    
    if (searchForm.paymentMethod) {
      filteredList = filteredList.filter(item => item.paymentMethod === searchForm.paymentMethod)
    }
    
    if (searchForm.dateRange && searchForm.dateRange.length === 2) {
      const startDate = new Date(searchForm.dateRange[0])
      const endDate = new Date(searchForm.dateRange[1])
      endDate.setHours(23, 59, 59, 999) // 设置为当天结束时间
      
      filteredList = filteredList.filter(item => {
        const createTime = new Date(item.createTime)
        return createTime >= startDate && createTime <= endDate
      })
    }
    
    if (searchForm.withdrawalStatus) {
      filteredList = filteredList.filter(item => item.withdrawalStatus === searchForm.withdrawalStatus)
    }
    
    orderList.value = filteredList
    total.value = filteredList.length
    
    loading.value = false
  }, 500)
}

// 重置搜索
const resetSearch = () => {
  Object.keys(searchForm).forEach(key => {
    // @ts-ignore
    searchForm[key] = key === 'dateRange' ? [] : ''
  })
  handleSearch()
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

// 处理退款
const handleRefund = (row: any) => {
  refundForm.orderNo = row.orderNo
  refundForm.userEmail = row.userEmail
  refundForm.amount = row.amount
  // 计算默认退款金额：充值金额减去手续费
  const fee = row.fee || 0
  refundForm.refundAmount = row.amount - fee
  refundForm.refundReason = ''
  refundForm.refundRemark = ''
  refundForm.deductBalance = true
  refundDialogVisible.value = true
}

// 提交退款表单
const submitRefundForm = async () => {
  if (!refundFormRef.value) return
  
  await refundFormRef.value.validate((valid: boolean, fields: any) => {
    if (valid) {
      let confirmMessage = `确定要退款 ¥${refundForm.refundAmount.toFixed(2)} 吗？`
      if (refundForm.deductBalance) {
        confirmMessage += '将从用户余额中扣除相应金额。'
      }
      confirmMessage += '此操作不可逆。'
      
      ElMessageBox.confirm(
        confirmMessage,
        '确认退款',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      )
        .then(() => {
          // 模拟退款操作
          const index = orderList.value.findIndex(item => item.orderNo === refundForm.orderNo)
          if (index !== -1) {
            // 将状态改为已退款
            orderList.value[index].status = 'cancelled' // 使用已取消状态表示已退款
            // 添加退款标记
            orderList.value[index].refunded = true
            
            // 添加退款记录到日志
            if (!orderList.value[index].logs) {
              orderList.value[index].logs = []
            }
            
            orderList.value[index].logs.push({
              time: new Date().toLocaleString(),
              action: `退款 ¥${refundForm.refundAmount.toFixed(2)} - ${refundForm.refundReason}`,
              operator: '管理员'
            })
            
            // 如果当前正在查看该订单的详情，更新当前订单信息
            if (currentOrder.value && currentOrder.value.orderNo === refundForm.orderNo) {
              currentOrder.value = { ...orderList.value[index] }
            }
          }
          
          ElMessage.success('退款操作成功')
          refundDialogVisible.value = false
        })
        .catch(() => {
          ElMessage.info('已取消退款操作')
        })
    } else {
      console.log('表单验证失败', fields)
    }
  })
}

// 添加导出所有订单的方法
const exportAllOrders = () => {
  // 导出所有订单
  if (orderList.value.length === 0) {
    ElMessage.warning('没有可导出的订单数据')
    return
  }
  
  // 创建CSV内容
  let csvContent = '订单号,用户邮箱,充值金额,手续费,支付方式,订单状态,提款状态,创建时间,支付时间\n'
  
  orderList.value.forEach(order => {
    const status = order.status === 'pending' ? '待支付' : 
                  (order.status === 'paid' && !order.refunded) ? '已支付' : 
                  (order.status === 'cancelled' && order.refunded) ? '已退款' : '已取消'
    
    const paymentMethod = order.paymentMethod === 'usdt' ? 'USDT' : '其他方式'
    
    const withdrawalStatus = order.withdrawalStatus === 'withdrawn' ? '已提款' : '未提款'
    
    csvContent += `"${order.orderNo}","${order.userEmail}",${order.amount.toFixed(2)},${order.fee ? order.fee.toFixed(2) : '0.00'},"${paymentMethod}","${status}","${withdrawalStatus}","${order.createTime}","${order.payTime || ''}"\n`
  })
  
  // 创建Blob对象
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  
  // 创建下载链接
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  // 设置下载属性
  link.setAttribute('href', url)
  link.setAttribute('download', `全部充值订单_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  
  // 添加到文档并触发点击
  document.body.appendChild(link)
  link.click()
  
  // 清理
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  
  ElMessage.success('成功导出全部订单数据')
}

// 修改导出订单功能，区分是否有选中订单
const exportOrders = () => {
  // 确定要导出的订单列表
  if (multipleSelection.value.length === 0) {
    ElMessage.warning('请先选择要导出的订单')
    return
  }
  
  // 创建CSV内容
  let csvContent = '订单号,用户邮箱,充值金额,手续费,支付方式,订单状态,提款状态,创建时间,支付时间\n'
  
  multipleSelection.value.forEach(order => {
    const status = order.status === 'pending' ? '待支付' : 
                  (order.status === 'paid' && !order.refunded) ? '已支付' : 
                  (order.status === 'cancelled' && order.refunded) ? '已退款' : '已取消'
    
    const paymentMethod = order.paymentMethod === 'usdt' ? 'USDT' : '其他方式'
    
    const withdrawalStatus = order.withdrawalStatus === 'withdrawn' ? '已提款' : '未提款'
    
    csvContent += `"${order.orderNo}","${order.userEmail}",${order.amount.toFixed(2)},${order.fee ? order.fee.toFixed(2) : '0.00'},"${paymentMethod}","${status}","${withdrawalStatus}","${order.createTime}","${order.payTime || ''}"\n`
  })
  
  // 创建Blob对象
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  
  // 创建下载链接
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  // 设置下载属性
  link.setAttribute('href', url)
  link.setAttribute('download', `选中充值订单_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  
  // 添加到文档并触发点击
  document.body.appendChild(link)
  link.click()
  
  // 清理
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  
  ElMessage.success(`成功导出选中订单数据`)
}

// 处理删除订单
const handleDelete = (row: RechargeOrder) => {
  ElMessageBox.confirm(
    `确定要删除订单 ${row.orderNo} 吗？此操作不可恢复。`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      // 模拟删除操作
      const index = orderList.value.findIndex(item => item.id === row.id)
      if (index !== -1) {
        orderList.value.splice(index, 1)
        ElMessage.success(`订单 ${row.orderNo} 已成功删除`)
      }
    })
    .catch(() => {
      ElMessage.info('已取消删除操作')
    })
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

.header-actions {
  display: flex;
  gap: 10px;
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

.fee {
  color: #e6a23c;
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

.search-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
  padding: 10px 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.total-amount {
  font-size: 14px;
  color: #606266;
}

.amount-value {
  font-size: 16px;
  font-weight: bold;
  color: #f56c6c;
  margin-left: 5px;
}

.action-btns {
  display: flex;
  align-items: center;
}

.action-btns .el-button + .el-button {
  margin-left: 20px;
}

.form-tip {
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.6;
  color: #909399;
}

.form-tip div:first-child {
  color: #E6A23C;
  font-weight: 500;
}
</style>