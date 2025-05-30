<template>
    <div class="recharge-orders-container">
      <el-card class="box-card">
        <template #header>
          <div class="card-header">
            <span>充值订单列表</span>
            <div class="header-buttons">
              <el-button type="primary" @click="exportAllOrders">
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
              <el-input v-model="searchForm.orderId" placeholder="请输入订单号" clearable></el-input>
            </el-form-item>
            <el-form-item label="用户名">
              <el-input v-model="searchForm.userEmail" placeholder="请输入用户名" clearable></el-input>
            </el-form-item>
            <el-form-item label="通道名称">
              <el-input v-model="searchForm.channelName" placeholder="请输入通道名称" clearable></el-input>
            </el-form-item>
            <el-form-item label="支付方式">
              <el-select v-model="searchForm.paymentMethod" placeholder="请选择" clearable style="width: 168px;">
                <el-option label="全部" value=""></el-option>
                <el-option label="USDT" value="usdt"></el-option>
                <el-option label="微信" value="wechat"></el-option>
                <el-option label="支付宝" value="alipay"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="订单状态">
              <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 168px;">
                <el-option label="全部" value=""></el-option>
                <el-option label="待付款" value="pending"></el-option>
                <el-option label="已完成" value="completed"></el-option>
                <el-option label="已取消" value="cancelled"></el-option>
                <el-option label="已退款" value="refunded"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="下单时间">
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
          
          <!-- 添加总金额和导出按钮 -->
          <div class="search-summary">
            <div class="total-amount">
              <span>总订单数：</span>
              <span class="amount-value" style="color: #409EFF;">{{ totalOrders }}</span>
              <span style="margin-left: 20px;">成功订单：</span>
              <span class="amount-value" style="color: #67C23A;">{{ successOrders }}</span>
              <span style="margin-left: 20px;">总充值金额：</span>
              <span class="amount-value">¥{{ totalAmount.toFixed(2) }}</span>
              <span style="margin-left: 20px;">总手续费：</span>
              <span class="amount-value" style="color: #E6A23C;">¥{{ totalFee.toFixed(2) }}</span>
              <span style="margin-left: 20px;">总入账金额：</span>
              <span class="amount-value" style="color: #303133;">¥{{ totalIncome.toFixed(2) }}</span>
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
          :data="filteredOrderList"
          border
          stripe
          style="width: 100%"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="id" label="订单ID" min-width="100" />
          <el-table-column prop="orderNo" label="订单号" min-width="180" />
          <el-table-column prop="userId" label="用户ID" min-width="100" />
          <el-table-column prop="userEmail" label="用户名" min-width="180" />
          <el-table-column prop="balanceBefore" label="充值前余额" min-width="120">
            <template #default="scope">
              <div class="price-container">
                <span class="balance">¥{{ scope.row.balanceBefore.toFixed(2) }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="amount" label="充值金额" min-width="120">
            <template #default="scope">
              <div class="price-container">
                <span class="price">¥{{ scope.row.amount.toFixed(2) }}</span>
                <span v-if="scope.row.paymentMethod === 'usdt'" class="usdt-price">{{ convertToUSDT(scope.row.amount) }} USDT</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="balanceAfter" label="充值后余额" min-width="120">
            <template #default="scope">
              <div class="price-container">
                <span class="balance-after">¥{{ scope.row.balanceAfter.toFixed(2) }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="fee" label="手续费" min-width="100">
            <template #default="scope">
              <div class="price-container">
                <span class="fee">¥{{ scope.row.fee ? scope.row.fee.toFixed(2) : '0.00' }}</span>
                <span v-if="scope.row.paymentMethod === 'usdt'" class="usdt-price">{{ convertToUSDT(scope.row.fee || 0) }} USDT</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="入账金额" min-width="120">
            <template #default="scope">
              <div class="price-container">
                <span>¥{{ calculateIncome(scope.row).toFixed(2) }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="channelName" label="通道名称" min-width="120"></el-table-column>
          <el-table-column prop="paymentMethod" label="支付方式" min-width="120">
            <template #default="scope">
              <el-tag size="small" effect="plain" :type="getPayMethodType(scope.row.paymentMethod)">
                {{ getPayMethodLabel(scope.row.paymentMethod) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="订单状态" min-width="120">
            <template #default="scope">
              <el-tag v-if="scope.row.status === 'pending'" type="warning">待付款</el-tag>
              <el-tag v-else-if="scope.row.status === 'completed'" type="success">已完成</el-tag>
              <el-tag v-else-if="scope.row.status === 'cancelled'" type="info">已取消</el-tag>
              <el-tag v-else-if="scope.row.status === 'refunded'" type="danger">已退款</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" min-width="180" />
          <el-table-column prop="payTime" label="完成时间" min-width="180" />
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="scope">
              <el-dropdown trigger="hover">
                <el-button type="primary" size="small">
                  操作
                  <el-icon class="el-icon--right"><arrow-down /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item v-if="scope.row.status === 'pending'" @click="confirmPayment(scope.row)">
                      确认支付
                    </el-dropdown-item>
                    <el-dropdown-item v-if="scope.row.status === 'completed' && !scope.row.isRefunded" @click="handleRefund(scope.row)">
                      退款
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
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
            <el-descriptions-item label="用户名">{{ currentOrder.userEmail }}</el-descriptions-item>
            <el-descriptions-item label="用户ID">{{ currentOrder.userId }}</el-descriptions-item>
            <el-descriptions-item label="充值前余额">
              <div class="price-container">
                <span class="balance">¥{{ currentOrder.balanceBefore.toFixed(2) }}</span>
              </div>
            </el-descriptions-item>
            <el-descriptions-item label="充值金额">
              <div class="price-container">
                <span class="price">¥{{ currentOrder.amount.toFixed(2) }}</span>
                <span v-if="currentOrder.paymentMethod === 'usdt'" class="usdt-price">{{ convertToUSDT(currentOrder.amount) }} USDT</span>
              </div>
            </el-descriptions-item>
            <el-descriptions-item label="充值后余额">
              <div class="price-container">
                <span class="balance-after">¥{{ currentOrder.balanceAfter.toFixed(2) }}</span>
              </div>
            </el-descriptions-item>
            <el-descriptions-item label="手续费">
              <div class="price-container">
                <span class="fee">¥{{ currentOrder.fee ? currentOrder.fee.toFixed(2) : '0.00' }}</span>
                <span v-if="currentOrder.paymentMethod === 'usdt'" class="usdt-price">{{ convertToUSDT(currentOrder.fee || 0) }} USDT</span>
              </div>
            </el-descriptions-item>
            <el-descriptions-item label="通道名称">{{ currentOrder.channelName }}</el-descriptions-item>
            <el-descriptions-item label="订单状态">
              <el-tag v-if="currentOrder.status === 'pending'" type="warning">待付款</el-tag>
              <el-tag v-else-if="currentOrder.status === 'completed'" type="success">已完成</el-tag>
              <el-tag v-else-if="currentOrder.status === 'cancelled'" type="info">已取消</el-tag>
              <el-tag v-else-if="currentOrder.status === 'refunded'" type="danger">已退款</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="支付方式">
              <el-tag size="small" effect="plain" :type="getPayMethodType(currentOrder.paymentMethod)">
                {{ getPayMethodLabel(currentOrder.paymentMethod) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="交易流水号">{{ currentOrder.transactionId || '暂无' }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ currentOrder.createTime }}</el-descriptions-item>
            <el-descriptions-item label="完成时间">{{ currentOrder.payTime || '暂无' }}</el-descriptions-item>
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
          <el-form-item label="用户名">
            <el-input v-model="refundForm.userEmail" disabled></el-input>
          </el-form-item>
          <el-form-item label="通道名称">
            <el-input v-model="refundForm.channelName" disabled></el-input>
          </el-form-item>
          <el-form-item label="充值金额">
            <el-input v-model="refundForm.amount" disabled>
              <template #prepend>¥</template>
            </el-input>
            <div v-if="refundForm.paymentMethod === 'usdt'" class="form-tip">
              <span class="usdt-price">{{ convertToUSDT(refundForm.amount) }} USDT</span>
            </div>
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
  import { Download, Money, View, Check, Delete, ArrowDown } from '@element-plus/icons-vue'
  
  // 定义充值订单类型
  interface RechargeOrder {
    id: string
    orderNo: string
    userId: number
    userEmail: string
    balanceBefore: number // 充值前余额
    amount: number
    balanceAfter: number // 充值后余额
    fee?: number
    status: 'pending' | 'completed' | 'cancelled' | 'refunded'
    paymentMethod: 'usdt' | 'wechat' | 'alipay' | string
    channelName: string
    transactionId?: string
    createTime: string
    payTime?: string
    logs?: Array<{
      time: string
      action: string
      operator: string
    }>
    isRefunded?: boolean
  }
  
  // 搜索表单
  const searchForm = reactive({
    orderId: '',
    userEmail: '',
    channelName: '',
    paymentMethod: '',
    status: '',
    dateRange: [] as string[]
  })
  
  // 表格数据
  const loading = ref(false)
  const orderList = ref<RechargeOrder[]>([
    {
      id: '2001',
      orderNo: 'RO20230901001',
      userId: 1001,
      userEmail: 'user1@example.com',
      balanceBefore: 1000.00,
      amount: 1000.00,
      balanceAfter: 1000.00,
      fee: 10.00,
      status: 'pending',
      paymentMethod: 'usdt',
      channelName: '通道A',
      createTime: '2023-09-01 09:00:00'
    },
    {
      id: '2002',
      orderNo: 'RO20230901002',
      userId: 1002,
      userEmail: 'user2@example.com',
      balanceBefore: 2000.00,
      amount: 2000.00,
      balanceAfter: 2000.00,
      fee: 20.00,
      status: 'completed',
      paymentMethod: 'usdt',
      channelName: '通道A',
      transactionId: 'TX001',
      createTime: '2023-09-01 10:00:00',
      payTime: '2023-09-01 10:05:00',
      isRefunded: false
    },
    {
      id: '2003',
      orderNo: 'RO20230902001',
      userId: 1003,
      userEmail: 'user3@example.com',
      balanceBefore: 500.00,
      amount: 500.00,
      balanceAfter: 500.00,
      fee: 5.00,
      status: 'cancelled',
      paymentMethod: 'alipay',
      channelName: '通道B',
      createTime: '2023-09-02 11:00:00',
    },
    {
      id: '2004',
      orderNo: 'RO20230902002',
      userId: 1004,
      userEmail: 'user4@example.com',
      balanceBefore: 1500.00,
      amount: 1500.00,
      balanceAfter: 1500.00,
      fee: 15.00,
      status: 'refunded',
      paymentMethod: 'wechat',
      channelName: '通道C',
      transactionId: 'TX002',
      createTime: '2023-09-02 12:00:00',
      payTime: '2023-09-02 12:05:00',
      isRefunded: true,
      logs: [
        { time: '2023-09-02 12:00:00', action: '创建订单', operator: '系统' },
        { time: '2023-09-02 12:05:00', action: '支付成功', operator: '系统' },
        { time: '2023-09-02 14:00:00', action: '订单退款', operator: '管理员' }
      ]
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
    paymentMethod: '',
    channelName: '',
    refundAmount: 0,
    refundReason: '客户申请退款',
    refundRemark: '',
    deductBalance: false
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
  
  // 筛选订单列表
  const filteredOrderList = computed(() => {
    let filteredList = [...orderList.value]
    
    if (searchForm.orderId) {
      filteredList = filteredList.filter(item => item.orderNo.includes(searchForm.orderId))
    }
    
    if (searchForm.userEmail) {
      filteredList = filteredList.filter(item => item.userEmail.toLowerCase().includes(searchForm.userEmail.toLowerCase()))
    }
    
    if (searchForm.channelName) {
      filteredList = filteredList.filter(item => item.channelName.includes(searchForm.channelName))
    }
    
    if (searchForm.paymentMethod) {
      filteredList = filteredList.filter(item => item.paymentMethod === searchForm.paymentMethod)
    }
    
    if (searchForm.status) {
      filteredList = filteredList.filter(item => item.status === searchForm.status)
    }
    
    if (searchForm.dateRange && searchForm.dateRange.length === 2) {
      const startDate = new Date(searchForm.dateRange[0])
      const endDate = new Date(searchForm.dateRange[1])
      endDate.setHours(23, 59, 59, 999)
      
      filteredList = filteredList.filter(item => {
        const createTime = new Date(item.createTime)
        return createTime >= startDate && createTime <= endDate
      })
    }
    
    return filteredList
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
            balanceBefore: 1000.00,
            amount: 1000.00,
            balanceAfter: 1000.00,
            fee: 10.00,
            status: 'completed',
            paymentMethod: 'usdt',
            channelName: '通道A',
            transactionId: '2024031012345678',
            createTime: '2024-03-10 10:00:00',
            payTime: '2024-03-10 10:05:23',
            logs: [
              { time: '2024-03-10 10:00:00', action: '创建订单', operator: '系统' },
              { time: '2024-03-10 10:05:23', action: '支付成功', operator: '系统' },
            ]
          },
          {
            id: 'R000002',
            orderNo: 'CZ202403100002',
            userId: 1002,
            userEmail: 'lisi@example.com',
            balanceBefore: 2000.00,
            amount: 2000.00,
            balanceAfter: 2000.00,
            fee: 20.00,
            status: 'pending',
            paymentMethod: 'wechat',
            channelName: '通道B',
            createTime: '2024-03-10 11:30:00',
            logs: [
              { time: '2024-03-10 11:30:00', action: '创建订单', operator: '系统' }
            ]
          },
          {
            id: 'R000003',
            orderNo: 'CZ202403100003',
            userId: 1003,
            userEmail: 'wangwu@example.com',
            balanceBefore: 500.00,
            amount: 500.00,
            balanceAfter: 500.00,
            fee: 5.00,
            status: 'cancelled',
            paymentMethod: 'alipay',
            channelName: '通道C',
            createTime: '2024-03-10 14:20:00',
            logs: [
              { time: '2024-03-10 14:20:00', action: '创建订单', operator: '系统' },
              { time: '2024-03-10 15:30:00', action: '取消订单', operator: '用户' }
            ]
          },
          {
            id: 'R000004',
            orderNo: 'CZ202403100004',
            userId: 1004,
            userEmail: 'zhaoliu@example.com',
            balanceBefore: 1000.00,
            amount: 1000.00,
            balanceAfter: 1000.00,
            fee: 10.00,
            status: 'completed',
            paymentMethod: 'usdt',
            channelName: '通道A',
            transactionId: '2024031087654321',
            createTime: '2024-03-11 16:00:00',
            payTime: '2024-03-11 16:05:12',
            logs: [
              { time: '2024-03-11 16:00:00', action: '创建订单', operator: '系统' },
              { time: '2024-03-11 16:05:12', action: '支付成功', operator: '系统' }
            ]
          }
        ];
        orderList.value = mockData;
        total.value = mockData.length;
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
    
    // 实际项目中应该调用API获取数据
    // 这里只是触发重新加载数据
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
    ElMessageBox.confirm(`确认将订单 ${order.orderNo} 标记为已完成吗？`, '确认操作', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      // 实际项目中应该调用API更新订单状态
      // 这里模拟更新
      const index = orderList.value.findIndex(item => item.id === order.id)
      if (index !== -1) {
        orderList.value[index].status = 'completed'
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
  const handleRefund = (row: RechargeOrder) => {
    refundForm.orderNo = row.orderNo
    refundForm.userEmail = row.userEmail
    refundForm.amount = row.amount
    refundForm.paymentMethod = row.paymentMethod
    refundForm.refundAmount = row.amount - (row.fee || 0)
    
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
              orderList.value[index].status = 'refunded'
              // 添加退款标记
              orderList.value[index].isRefunded = true
              
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
    let csvContent = '订单号,用户ID,用户名,充值前余额,充值金额,充值后余额,手续费,入账金额,通道名称,支付方式,订单状态,创建时间,完成时间\n'
    
    orderList.value.forEach(order => {
      const status = order.status === 'pending' ? '待付款' : 
                    (order.status === 'completed' && !order.isRefunded) ? '已完成' : 
                    (order.status === 'cancelled') ? '已取消' : 
                    (order.status === 'refunded') ? '已退款' : '未知状态'
      
      const paymentMethod = getPayMethodLabel(order.paymentMethod)
      const income = calculateIncome(order).toFixed(2)
      
      csvContent += `"${order.orderNo}","${order.userId}","${order.userEmail}",${order.balanceBefore.toFixed(2)},${order.amount.toFixed(2)},${order.balanceAfter.toFixed(2)},${order.fee ? order.fee.toFixed(2) : '0.00'},${income},"${order.channelName}","${paymentMethod}","${status}","${order.createTime}","${order.payTime || ''}"\n`
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
    let csvContent = '订单号,用户ID,用户名,充值前余额,充值金额,充值后余额,手续费,入账金额,通道名称,支付方式,订单状态,创建时间,完成时间\n'
    
    multipleSelection.value.forEach(order => {
      const status = order.status === 'pending' ? '待付款' : 
                    (order.status === 'completed' && !order.isRefunded) ? '已完成' : 
                    (order.status === 'cancelled') ? '已取消' : 
                    (order.status === 'refunded') ? '已退款' : '未知状态'
      
      const paymentMethod = getPayMethodLabel(order.paymentMethod)
      const income = calculateIncome(order).toFixed(2)
      
      csvContent += `"${order.orderNo}","${order.userId}","${order.userEmail}",${order.balanceBefore.toFixed(2)},${order.amount.toFixed(2)},${order.balanceAfter.toFixed(2)},${order.fee ? order.fee.toFixed(2) : '0.00'},${income},"${order.channelName}","${paymentMethod}","${status}","${order.createTime}","${order.payTime || ''}"\n`
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
  
  // 获取支付方式类型
  const getPayMethodType = (method: string) => {
    if (method === 'usdt') return 'danger'
    if (method === 'wechat') return 'success'
    if (method === 'alipay') return 'primary'
    return 'info'
  }
  
  // 获取支付方式标签
  const getPayMethodLabel = (method: string) => {
    if (method === 'usdt') return 'USDT'
    if (method === 'wechat') return '微信'
    if (method === 'alipay') return '支付宝'
    return '其他方式'
  }
  
  // 添加 USDT 转换函数
  const convertToUSDT = (amount: number): string => {
    // 假设汇率为 1 CNY = 0.14 USDT
    const usdtAmount = (amount * 0.14).toFixed(2)
    return usdtAmount
  }
  
  // 添加总订单数计算
  const totalOrders = computed(() => {
    return filteredOrderList.value.length
  })
  
  // 添加成功订单数计算（状态为"completed"的订单）
  const successOrders = computed(() => {
    return filteredOrderList.value.filter(order => order.status === 'completed').length
  })
  
  // 添加总手续费计算
  const totalFee = computed(() => {
    return filteredOrderList.value.reduce((sum, order) => {
      return sum + (order.fee || 0)
    }, 0)
  })
  
  // 添加总入账金额计算（总充值金额 - 总手续费）
  const totalIncome = computed(() => {
    return totalAmount.value - totalFee.value
  })
  
  // 计算单个订单的入账金额
  const calculateIncome = (order: RechargeOrder) => {
    return order.amount - (order.fee || 0)
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
  
  .fee {
    color: #e6a23c;
    font-weight: bold;
  }
  
  .balance {
    color: #606266;
    font-weight: normal;
  }
  
  .balance-after {
    color: #606266;
    font-weight: normal;
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
  
  .price-container {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .usdt-price {
    color: #67c23a;
    font-size: 12px;
    font-weight: bold;
  }
  </style>