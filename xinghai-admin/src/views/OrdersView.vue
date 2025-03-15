<template>
  <div class="orders-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>商品订单列表</span>
        </div>
      </template>
      
      <div class="page-description">
        <p>管理所有邮箱账号和社交媒体账号的订单信息，包括订单状态、商品信息、买家信息等。您可以查看、编辑、删除订单，并进行发货操作。</p>
      </div>
      
      <!-- 搜索区域 -->
      <div class="search-area">
        <el-form :inline="true" :model="searchForm" class="demo-form-inline">
          <el-form-item label="订单号">
            <el-input v-model="searchForm.orderId" placeholder="请输入订单号" clearable></el-input>
          </el-form-item>
          <el-form-item label="商品分类">
            <el-select v-model="searchForm.category" placeholder="请选择" clearable style="width: 168px;">
              <el-option label="全部" value=""></el-option>
              <el-option label="谷歌邮箱" value="谷歌邮箱"></el-option>
              <el-option label="微软邮箱" value="微软邮箱"></el-option>
              <el-option label="Instagram账号" value="Instagram账号"></el-option>
              <el-option label="Twitter账号" value="Twitter账号"></el-option>
              <el-option label="Facebook账号" value="Facebook账号"></el-option>
              <el-option label="Discord账号" value="Discord账号"></el-option>
              <el-option label="ChatGPT账号" value="ChatGPT账号"></el-option>
              <el-option label="其他账号" value="其他账号"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="支付方式">
            <el-select v-model="searchForm.payMethod" placeholder="请选择" clearable style="width: 168px;">
              <el-option label="全部" value=""></el-option>
              <el-option label="USDT" value="usdt"></el-option>
              <el-option label="其他方式" value="other"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="发货方式">
            <el-select v-model="searchForm.deliveryMethod" placeholder="请选择" clearable style="width: 168px;">
              <el-option label="全部" value=""></el-option>
              <el-option label="自动发货" value="自动发货"></el-option>
              <el-option label="手动发货" value="手动发货"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="订单状态">
            <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 168px;">
              <el-option label="全部" value=""></el-option>
              <el-option label="待付款" value="待付款"></el-option>
              <el-option label="待发货" value="待发货"></el-option>
              <el-option label="已完成" value="已完成"></el-option>
              <el-option label="已取消" value="已取消"></el-option>
              <el-option label="已退款" value="已退款"></el-option>
              <el-option label="申请退款中" value="申请退款中"></el-option>
             <el-option label="已拒绝退款" value="已拒绝退款"></el-option>
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
            <el-button type="success" @click="handleWithdrawal">总提款</el-button>
          </el-form-item>
        </el-form>
        
        <!-- 添加总金额和导出按钮 -->
        <div class="search-summary">
          <div class="total-amount">
            <span>筛选结果总金额：</span>
            <span class="amount-value">¥{{ totalAmount.toFixed(2) }}</span>
          </div>
          <div class="action-btns">
            <el-button type="success" @click="handleWithdrawal">提款</el-button>
            <el-button type="success" @click="exportOrders">
              <el-icon><Download /></el-icon>
              导出订单
            </el-button>
          </div>
        </div>
      </div>
      
      <!-- 表格区域 -->
      <el-table :data="orderList" style="width: 100%" v-loading="loading" border stripe>
        <el-table-column prop="id" label="商品订单ID" width="100"></el-table-column>
        <el-table-column prop="orderId" label="订单号" width="180"></el-table-column>
        <el-table-column prop="productName" label="商品名称" min-width="180"></el-table-column>
        <el-table-column prop="category" label="商品分类" width="100">
          <template #default="scope">
            <el-tag :type="getCategoryTag(scope.row.category)">{{ scope.row.category }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="数量" width="80"></el-table-column>
        <el-table-column prop="totalPrice" label="总价" width="100">
          <template #default="scope">
            <span class="price">{{ scope.row.totalPrice }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="fee" label="手续费" width="100">
          <template #default="scope">
            <span class="fee">{{ scope.row.fee || '¥0.00' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="cardId" label="卡密ID" width="100"></el-table-column>
        <el-table-column prop="cardInfo" label="卡密信息" min-width="120">
          <template #default="scope">
            <el-button link type="primary" @click="viewCardInfo(scope.row)">查看</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="userEmail" label="用户邮箱" width="180"></el-table-column>
        <el-table-column prop="payMethod" label="支付方式" width="100">
          <template #default="scope">
            <el-tag size="small" effect="plain" :type="scope.row.payMethod === 'usdt' ? 'danger' : 'info'">
              {{ scope.row.payMethod === 'usdt' ? 'USDT' : '其他方式' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="deliveryMethod" label="发货方式" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.deliveryMethod === '自动发货' ? 'success' : 'info'">
              {{ scope.row.deliveryMethod }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="withdrawalStatus" label="提款状态" width="120">
          <template #default="scope">
            <el-tag v-if="scope.row.withdrawalStatus === 'withdrawn'" type="success">已提款</el-tag>
            <el-tag v-else type="info">未提款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180"></el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <el-button 
                v-if="scope.row.status === '待发货'" 
                size="small" 
                type="success" 
                @click="handleDeliver(scope.row)"
              >发货</el-button>
              <el-button 
                v-if="['待付款', '待发货'].includes(scope.row.status)" 
                size="small" 
                type="warning" 
                @click="handleRefund(scope.row)"
              >退款</el-button>
              <el-button 
                v-if="scope.row.status === '申请退款中'" 
                size="small" 
                type="danger" 
                @click="handleApproveRefund(scope.row)"
              >审核退款</el-button>
              <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
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
    
    <!-- 发货对话框 -->
    <el-dialog
      v-model="deliverDialogVisible"
      title="订单发货"
      width="550px"
    >
      <el-form :model="deliverForm" label-width="100px" :rules="deliverRules" ref="deliverFormRef">
        <el-form-item label="订单号">
          <el-input v-model="deliverForm.orderId" disabled></el-input>
        </el-form-item>
        <el-form-item label="商品名称">
          <el-input v-model="deliverForm.productName" disabled></el-input>
        </el-form-item>
        <el-form-item label="用户邮箱">
          <el-input v-model="deliverForm.userEmail" disabled></el-input>
        </el-form-item>
        <el-form-item label="卡密ID" prop="cardId">
          <el-input v-model="deliverForm.cardId" placeholder="请输入卡密ID"></el-input>
        </el-form-item>
        <el-form-item label="卡密信息" prop="cardInfo">
          <el-input 
            v-model="deliverForm.cardInfo" 
            type="textarea" 
            :rows="4" 
            placeholder="请输入卡密信息"
          ></el-input>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="deliverForm.remark" type="textarea" :rows="3" placeholder="请输入备注信息"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deliverDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitDeliverForm">确认发货</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 退款审核对话框 -->
    <el-dialog
      v-model="refundDialogVisible"
      title="退款审核"
      width="600px"
      class="refund-dialog"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <div class="refund-section">
        <h4>退款申请详情</h4>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">订单号：</span>
            <span class="value">{{ refundForm.orderId }}</span>
          </div>
          <div class="info-item">
            <span class="label">商品名称：</span>
            <span class="value">{{ refundForm.productName }}</span>
          </div>
          <div class="info-item">
            <span class="label">退款金额：</span>
            <span class="value price">{{ refundForm.refundAmount }}</span>
          </div>
          <div class="info-item">
            <span class="label">申请时间：</span>
            <span class="value">{{ refundForm.applyTime }}</span>
          </div>
          <div class="info-item full-width">
            <span class="label">退款说明：</span>
            <span class="value">{{ refundForm.description || '无' }}</span>
          </div>
        </div>
      </div>
      
      <div class="refund-section">
        <h4>审核信息</h4>
        <el-form :model="refundForm" label-width="84px" :rules="refundRules" ref="refundFormRef">
          <el-form-item label="审核结果" prop="approved" required>
            <el-radio-group v-model="refundForm.approved">
              <el-radio :label="true">同意退款</el-radio>
              <el-radio :label="false">已拒绝退款</el-radio>
            </el-radio-group>
            <div class="form-tip warning" v-if="refundForm.approved === false">
              <el-icon><Warning /></el-icon>
              <span>已拒绝退款后将无法撤销，请谨慎操作</span>
            </div>
          </el-form-item>
          <el-form-item label="审核备注" prop="remark">
            <el-input
              v-model="refundForm.remark"
              type="textarea"
              :rows="3"
              :maxlength="200"
              show-word-limit
              placeholder="请输入审核备注（选填）"
            ></el-input>
          </el-form-item>
        </el-form>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="refundDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitRefund">确认</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Download } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

// 搜索表单
const searchForm = reactive({
  orderId: '',
  category: '',
  payMethod: '',
  deliveryMethod: '',
  status: '',
  dateRange: [] as string[]
})

// 商品选项
const productOptions = [
  { label: 'Gmail邮箱-稳定可用 (手工)', value: 'Gmail邮箱-稳定可用 (手工)', price: 4.20 },
  { label: 'Gmail邮箱-稳定可用', value: 'Gmail邮箱-稳定可用', price: 2.75 },
  { label: 'Gmail邮箱-1月以上', value: 'Gmail邮箱-1月以上', price: 5.50 },
  { label: 'Gmail邮箱-半年以上', value: 'Gmail邮箱-半年以上', price: 7.50 },
  { label: 'Gmail邮箱-美国稳定', value: 'Gmail邮箱-美国稳定', price: 10.00 },
  { label: 'Gmail邮箱-一年以上', value: 'Gmail邮箱-一年以上', price: 12.00 },
  { label: 'Gmail美国老号 (6个月+)', value: 'Gmail美国老号 (6个月+)', price: 16.88 },
  { label: '2022年老号账号-谷歌邮箱', value: '2022年老号账号-谷歌邮箱', price: 14.00 },
  { label: 'Instagram账号', value: 'Instagram账号', price: 39.99 },
  { label: 'Twitter账号', value: 'Twitter账号', price: 49.99 },
  { label: 'Facebook账号', value: 'Facebook账号', price: 59.99 },
  { label: 'ChatGPT账号', value: 'ChatGPT账号', price: 199.99 }
]

// 表格数据类型定义
interface RefundInfo {
  refundAmount: number;
  refundReason: string;
  refundRemark: string;
  refundTime: string;
}

interface OrderItem {
  id: string;
  orderId: string;
  productName: string;
  category: string;
  quantity: number;
  totalPrice: string;
  fee: string;
  cardId?: string;
  cardInfo?: string;
  userEmail: string;
  payMethod: string;
  deliveryMethod: string;
  status: string;
  remark?: string;
  createTime: string;
  refundInfo: RefundInfo | null;
  withdrawalStatus?: 'withdrawn' | 'not_withdrawn';
}

// 表格数据
const orderList = ref<OrderItem[]>([{
    id: '1001',
    orderId: 'SO20230901001',
    productName: '谷歌邮箱账号',
    category: '谷歌邮箱',
    quantity: 1,
    totalPrice: '¥99.00',
    fee: '¥2.00',
    cardId: 'C001',
    cardInfo: 'example@gmail.com',
    userEmail: 'buyer1@example.com',
    payMethod: 'usdt',
    deliveryMethod: '自动发货',
    status: '申请退款中',
    withdrawalStatus: 'not_withdrawn',
    createTime: '2023-09-01 10:00:00',
    refundInfo: null
  },
  {
    id: '1002',
    orderId: 'SO20230901002',
    productName: 'Instagram账号',
    category: 'Instagram账号',
    quantity: 1,
    totalPrice: '¥199.00',
    fee: '¥3.00',
    cardId: 'C002',
    cardInfo: 'instagram_user123',
    userEmail: 'buyer2@example.com',
    payMethod: 'usdt',
    deliveryMethod: '手动发货',
    status: '待发货',
    withdrawalStatus: 'not_withdrawn',
    createTime: '2023-09-01 11:00:00',
    refundInfo: null
  },
  {
    id: 'S000007',
    orderId: 'DD20240315007', 
    productName: 'ChatGPT账号', 
    category: 'ChatGPT账号',
    quantity: 1,
    totalPrice: '¥199.99',
    fee: '¥0.00',
    cardId: 'C000007',
    cardInfo: 'chatgpt@example.com|password789',
    userEmail: 'user777@example.com',
    payMethod: 'usdt',
    deliveryMethod: '自动发货',
    status: '申请退款中',
    remark: '账号无法正常使用',
    createTime: '2024-03-15 18:30:00',
    withdrawalStatus: 'not_withdrawn',
    refundInfo: {
      refundAmount: 199.99,
      refundReason: '商品质量问题',
      refundRemark: '账号登录异常，无法正常使用',
      refundTime: '2024-03-15 19:45:00'
    }
  },
  {
    id: 'S000001',
    orderId: 'DD20240315001', 
    productName: 'Gmail邮箱-稳定可用', 
    category: '谷歌邮箱',
    quantity: 1,
    totalPrice: '¥4.20',
    fee: '¥0.00',
    cardId: 'C000001',
    cardInfo: 'gmail@example.com|password123',
    userEmail: 'user123@example.com',
    payMethod: 'usdt',
    deliveryMethod: '自动发货',
    status: '已完成',
    remark: '客户要求稳定可用的账号',
    createTime: '2024-03-15 10:00:00',
    withdrawalStatus: 'withdrawn',
    refundInfo: null
  },
  {
    id: 'S000002',
    orderId: 'DD20240315002', 
    productName: 'Gmail邮箱-1月以上', 
    category: '谷歌邮箱',
    quantity: 1,
    totalPrice: '¥5.50',
    fee: '¥0.00',
    cardId: 'C000002',
    cardInfo: 'gmail1month@example.com|password456',
    userEmail: 'user456@example.com',
    payMethod: 'usdt',
    deliveryMethod: '手动发货',
    status: '待发货',
    remark: '客户需要美国地区的账号',
    createTime: '2024-03-15 11:30:00',
    withdrawalStatus: 'not_withdrawn',
    refundInfo: null
  },
  {
    id: 'S000003',
    orderId: 'DD20240315003', 
    productName: 'Instagram账号', 
    category: 'Instagram账号',
    quantity: 1,
    totalPrice: '¥39.99',
    fee: '¥0.00',
    cardId: '',
    cardInfo: '',
    userEmail: 'user789@example.com',
    payMethod: 'usdt',
    deliveryMethod: '手动发货',
    status: '待发货',
    remark: '',
    createTime: '2024-03-15 14:20:00',
    withdrawalStatus: 'not_withdrawn',
    refundInfo: null
  },
  {
    id: 'S000004',
    orderId: 'DD20240315004', 
    productName: 'Gmail邮箱-美国稳定', 
    category: '谷歌邮箱',
    quantity: 2,
    totalPrice: '¥20.00',
    fee: '¥0.00',
    cardId: '',
    cardInfo: '',
    userEmail: 'user101@example.com',
    payMethod: 'other',
    deliveryMethod: '自动发货',
    status: '待付款',
    remark: '',
    createTime: '2024-03-15 16:45:00',
    withdrawalStatus: 'not_withdrawn',
    refundInfo: null
  },
  {
    id: 'S000005',
    orderId: 'DD20240315005', 
    productName: 'Twitter账号', 
    category: 'Twitter账号',
    quantity: 1,
    totalPrice: '¥49.99',
    fee: '¥0.00',
    cardId: 'C000003',
    cardInfo: 'twitter@example.com|password789',
    userEmail: 'user202@example.com',
    payMethod: 'usdt',
    deliveryMethod: '手动发货',
    withdrawalStatus: 'not_withdrawn',
    status: '已退款',
    remark: '客户申请退款',
    createTime: '2024-03-15 09:15:00',
    refundInfo: {
      refundAmount: 49.99,
      refundReason: '客户申请退款',
      refundRemark: '客户不需要此账号',
      refundTime: '2024-03-15 10:30:00'
    }
  },
  { 
    id: 'S000006',
    orderId: 'DD20240315006', 
    productName: 'Gmail邮箱-半年以上', 
    category: '谷歌邮箱',
    quantity: 3,
    totalPrice: '¥22.50',
    fee: '¥0.00',
    cardId: '',
    cardInfo: '',
    userEmail: 'user303@example.com',
    payMethod: 'usdt',
    deliveryMethod: '自动发货',
    status: '待发货',
    remark: '批量购买',
    createTime: '2024-03-15 07:30:00',
    refundInfo: null
  }
])

// 添加总金额计算
const showTotalAmount = ref(false)
const totalAmount = computed(() => {
  return orderList.value.reduce((sum, order) => {
    const price = parseFloat(order.totalPrice.replace('¥', ''))
    return sum + price
  }, 0)
})

// 添加总提款金额计算
const totalWithdrawal = computed(() => {
  return orderList.value.reduce((sum, order) => {
    // 根据业务逻辑调整计算规则，这里只计算已完成且未提款的订单
    const price = parseFloat(order.totalPrice.replace('¥', ''))
    return sum + (order.status === '已完成' && !order.withdrawalStatus ? price : 0)
  }, 0)
})

// 导出订单
const exportOrders = () => {
  if (orderList.value.length === 0) {
    ElMessage.warning('没有可导出的订单数据')
    return
  }
  
  // 创建CSV内容
  let csvContent = '订单号,商品名称,商品分类,数量,总价,手续费,用户邮箱,支付方式,发货方式,订单状态,提款状态,创建时间\n'
  
  orderList.value.forEach(order => {
    const withdrawalStatus = order.withdrawalStatus === 'withdrawn' ? '已提款' : '未提款'
    
    csvContent += `"${order.orderId}","${order.productName}","${order.category}",${order.quantity},"${order.totalPrice}","${order.fee || '¥0.00'}","${order.userEmail}","${order.payMethod === 'usdt' ? 'USDT' : '其他方式'}","${order.deliveryMethod}","${order.status}","${withdrawalStatus}","${order.createTime}"\n`
  })
  
  // 创建Blob对象
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  
  // 创建下载链接
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  // 设置下载属性
  link.setAttribute('href', url)
  link.setAttribute('download', `商品订单_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  
  // 添加到文档并触发点击
  document.body.appendChild(link)
  link.click()
  
  // 清理
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  
  ElMessage.success('订单导出成功')
}

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)
const loading = ref(false)

// 发货对话框相关
const deliverDialogVisible = ref(false)
const deliverFormRef = ref<FormInstance>()
const deliverForm = reactive({
  id: '',
  orderId: '',
  productName: '',
  userEmail: '',
  cardId: '',
  cardInfo: '',
  remark: ''
})

// 发货表单验证规则
const deliverRules = reactive<FormRules>({
  cardId: [
    { required: true, message: '请输入卡密ID', trigger: 'blur' }
  ],
  cardInfo: [
    { required: true, message: '请输入卡密信息', trigger: 'blur' }
  ]
})

// 退款对话框相关
const refundDialogVisible = ref(false)
const refundFormRef = ref<FormInstance>()
const refundForm = reactive({
  id: '',
  orderId: '',
  productName: '',
  userEmail: '',
  totalPrice: 0,
  refundAmount: 0,
  refundReason: '',
  refundRemark: '',
  refundTime: ''
})

// 退款表单验证规则
const refundRules = reactive<FormRules>({
  refundAmount: [
    { required: true, message: '请输入退款金额', trigger: 'blur' }
  ],
  refundReason: [
    { required: true, message: '请选择退款原因', trigger: 'change' }
  ]
})

// 获取商品分类对应的标签类型
const getCategoryTag = (category: string) => {
  const categoryMap: Record<string, string> = {
    '谷歌邮箱': 'danger',
    '微软邮箱': 'primary',
    'Instagram账号': 'warning',
    'Twitter账号': 'info',
    'Facebook账号': 'success',
    'Discord账号': '',
    'ChatGPT账号': 'danger',
    '其他账号': 'info'
  }
  return categoryMap[category] || 'info'
}

// 获取状态对应的标签类型
const getStatusType = (status: string) => {
  switch (status) {
    case '待付款':
      return 'warning'
    case '待发货':
      return 'primary'
    case '已完成':
      return 'success'
    case '已取消':
      return 'info'
    case '已退款':
      return 'danger'
    case '申请退款中':
      return 'warning'
    case '已拒绝退款':
      return 'danger'
    default:
      return 'info'
  }
}

// 查询
const handleSearch = () => {
  loading.value = true
  
  // 模拟搜索操作
  setTimeout(() => {
    // 根据搜索条件过滤数据
    let filteredList = [...orderList.value]
    
    if (searchForm.orderId) {
      filteredList = filteredList.filter(item => item.orderId.includes(searchForm.orderId))
    }
    
    if (searchForm.category) {
      filteredList = filteredList.filter(item => item.category === searchForm.category)
    }
    
    if (searchForm.payMethod) {
      filteredList = filteredList.filter(item => item.payMethod === searchForm.payMethod)
    }
    
    if (searchForm.deliveryMethod) {
      filteredList = filteredList.filter(item => item.deliveryMethod === searchForm.deliveryMethod)
    }
    
    if (searchForm.status) {
      filteredList = filteredList.filter(item => item.status === searchForm.status)
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
    
    orderList.value = filteredList
    total.value = filteredList.length
    loading.value = false
  }, 500)
}

// 重置
const resetSearch = () => {
  searchForm.orderId = ''
  searchForm.category = ''
  searchForm.payMethod = ''
  searchForm.deliveryMethod = ''
  searchForm.status = ''
  searchForm.dateRange = []
  showTotalAmount.value = false
}

// 查看
const handleView = (row: any) => {
  // 构建退款信息显示
  const refundInfoHtml = row.refundInfo ? `
    <h4>退款信息</h4>
    <div class="detail-section">
      <div class="detail-item">
        <span class="label">退款金额：</span>
        <span class="price">¥${row.refundInfo.refundAmount.toFixed(2)}</span>
      </div>
      <div class="detail-item">
        <span class="label">退款原因：</span>
        <span>${row.refundInfo.refundReason}</span>
      </div>
      <div class="detail-item">
        <span class="label">退款说明：</span>
        <span>${row.refundInfo.refundRemark || '无'}</span>
      </div>
      <div class="detail-item">
        <span class="label">退款时间：</span>
        <span>${row.refundInfo.refundTime}</span>
      </div>
    </div>
  ` : '';

  ElMessageBox.alert(`
    <div class="order-detail">
      <h4>订单信息</h4>
      <div class="detail-section">
        <div class="detail-item">
          <span class="label">订单号：</span>
          <span>${row.orderId}</span>
        </div>
        <div class="detail-item">
          <span class="label">创建时间：</span>
          <span>${row.createTime}</span>
        </div>
        <div class="detail-item">
          <span class="label">订单状态：</span>
          <span><el-tag size="small" :type="getStatusType(row.status)">${row.status}</el-tag></span>
        </div>
      </div>
      
      <h4>商品信息</h4>
      <div class="detail-section">
        <div class="detail-item">
          <span class="label">商品名称：</span>
          <span>${row.productName}</span>
        </div>
        <div class="detail-item">
          <span class="label">商品分类：</span>
          <span><el-tag size="small" :type="getCategoryTag(row.category)">${row.category}</el-tag></span>
        </div>
        <div class="detail-item">
          <span class="label">数量：</span>
          <span>${row.quantity}</span>
        </div>
        <div class="detail-item">
          <span class="label">总价：</span>
          <span class="price">${row.totalPrice}</span>
        </div>
        <div class="detail-item">
          <span class="label">手续费：</span>
          <span class="fee">{{ row.fee || '¥0.00' }}</span>
        </div>
        <div class="detail-item">
          <span class="label">发货方式：</span>
          <span><el-tag size="small" :type="row.deliveryMethod === '自动发货' ? 'success' : 'info'">${row.deliveryMethod}</el-tag></span>
        </div>
      </div>
      
      <h4>卡密信息</h4>
      <div class="detail-section">
        <div class="detail-item">
          <span class="label">卡密ID：</span>
          <span>${row.cardId || '暂无'}</span>
        </div>
        <div class="detail-item account-info">
          <span class="label">卡密详情：</span>
          <pre>${row.cardInfo || '暂无'}</pre>
        </div>
      </div>
      
      <h4>用户信息</h4>
      <div class="detail-section">
        <div class="detail-item">
          <span class="label">用户邮箱：</span>
          <span>${row.userEmail}</span>
        </div>
        <div class="detail-item">
          <span class="label">支付方式：</span>
          <span><el-tag size="small" effect="plain" :type="row.payMethod === 'usdt' ? 'danger' : 'info'">
            ${row.payMethod === 'usdt' ? 'USDT' : '其他方式'}
          </el-tag></span>
        </div>
      </div>
      
      ${refundInfoHtml}
    </div>`,
    '订单详情',
    {
      dangerouslyUseHTMLString: true,
      confirmButtonText: '关闭',
      customClass: 'order-detail-dialog'
    }
  )
}

// 发货
const handleDeliver = (row: any) => {
  deliverForm.id = row.id
  deliverForm.orderId = row.orderId
  deliverForm.productName = row.productName
  deliverForm.userEmail = row.userEmail
  deliverForm.cardId = ''
  deliverForm.cardInfo = ''
  deliverForm.remark = row.remark || ''
  deliverDialogVisible.value = true
}

// 删除
const handleDelete = (row: any) => {
  ElMessageBox.confirm(
    `确定要删除订单 ${row.orderId} 吗？`,
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
        message: `订单 ${row.orderId} 已删除`,
      })
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '已取消删除',
      })
    })
}

// 提交发货表单
const submitDeliverForm = async () => {
  if (!deliverFormRef.value) return
  
  await deliverFormRef.value.validate((valid, fields) => {
    if (valid) {
      // 更新订单状态为已发货
      const order = orderList.value.find(item => item.id === deliverForm.id)
      if (order) {
        order.status = '已发货'
        order.cardId = deliverForm.cardId
        order.cardInfo = deliverForm.cardInfo
        if (deliverForm.remark) {
          order.remark = deliverForm.remark
        }
      }
      
      ElMessage.success('订单发货成功')
      deliverDialogVisible.value = false
    } else {
      console.log('表单验证失败', fields)
    }
  })
}

// 分页大小变化
const handleSizeChange = (val: number) => {
  pageSize.value = val
  // 重新加载数据
  handleSearch()
}

// 当前页变化
const handleCurrentChange = (val: number) => {
  currentPage.value = val
  // 重新加载数据
  handleSearch()
}

// 在script部分添加新的方法
const viewCardInfo = (row: any) => {
  ElMessageBox.alert(row.cardInfo, '卡密信息', {
    confirmButtonText: '确定'
  })
}

// 处理退款
const handleRefund = (row: any) => {
  refundForm.id = row.id
  refundForm.orderId = row.orderId
  refundForm.productName = row.productName
  refundForm.userEmail = row.userEmail
  refundForm.totalPrice = parseFloat(row.totalPrice.replace('¥', ''))
  refundForm.refundAmount = refundForm.totalPrice
  refundForm.refundReason = ''
  refundForm.refundRemark = ''
  refundDialogVisible.value = true
}

// 提交退款表单
const submitRefundForm = async () => {
  if (!refundFormRef.value) return
  
  await refundFormRef.value.validate((valid, fields) => {
    if (valid) {
      ElMessageBox.confirm(
        `确定要退款 ¥${refundForm.refundAmount.toFixed(2)} 吗？此操作不可逆。`,
        '确认退款',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      )
        .then(() => {
          // 模拟退款操作
          const index = orderList.value.findIndex(item => item.id === refundForm.id)
          if (index !== -1) {
            // 更新订单状态
            // 如果是管理员直接退款，状态为"已退款"
            // 如果是用户申请退款，状态为"申请退款中"
            const isAdminDirectRefund = true; // 这里可以根据实际情况判断
            
            if (isAdminDirectRefund) {
              orderList.value[index].status = '已退款'
            } else {
              orderList.value[index].status = '申请退款中'
            }
            
            // 记录退款信息
            orderList.value[index].refundInfo = {
              refundAmount: refundForm.refundAmount,
              refundReason: refundForm.refundReason,
              refundRemark: refundForm.refundRemark,
              refundTime: new Date().toLocaleString()
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

// 处理审核退款
const handleApproveRefund = (row: any) => {
  // 获取用户申请退款时的详细说明
  const refundDetails = row.refundInfo ? row.refundInfo.refundRemark : '无详细说明';
  
  ElMessageBox.confirm(
    `<div class="refund-dialog">
      <div class="refund-dialog-content">
        <div class="refund-dialog-header">
          <div class="order-info">
            <span class="label">订单号：</span>
            <span class="value">${row.orderId}</span>
          </div>
          <div class="amount-info">
            <span class="amount-label">退款金额</span>
            <div class="refund-amount">¥${row.refundInfo ? row.refundInfo.refundAmount.toFixed(2) : '0.00'}</div>
          </div>
        </div>
        <div class="refund-dialog-body">
          <div class="time-info">
            <span class="time-label">申请时间：</span>
            <span class="time-value">${row.refundInfo ? row.refundInfo.refundTime : '未知'}</span>
          </div>
          <div class="description-section">
            <div class="description-label">退款说明：</div>
            <div class="description-content">${refundDetails}</div>
          </div>
        </div>
      </div>
      <div class="refund-dialog-footer">
        <div class="refund-confirm-text">确定要审核通过此退款申请吗？</div>
      </div>
    </div>`,
    ' ',
    {
      confirmButtonText: '通过',
      cancelButtonText: '拒绝',
      type: 'warning',
      dangerouslyUseHTMLString: true,
      distinguishCancelAndClose: true,
      customClass: 'refund-approval-dialog',
      callback: (action: string) => {
        if (action === 'confirm') {
          // 通过退款
          const index = orderList.value.findIndex(item => item.id === row.id)
          if (index !== -1) {
            orderList.value[index].status = '已退款'
            ElMessage.success(`订单 ${row.orderId} 的退款申请已通过`)
          }
        } else if (action === 'cancel') {
          // 拒绝退款
          const index = orderList.value.findIndex(item => item.id === row.id)
          if (index !== -1) {
            orderList.value[index].status = '已拒绝退款'
            ElMessage.info(`订单 ${row.orderId} 的退款申请已拒绝`)
          }
        }
      }
    }
  )
}

// 处理总提款按钮点击
const handleWithdrawal = () => {
  if (orderList.value.length === 0) {
    ElMessage.warning('没有可提款的订单');
    return;
  }

  // 获取所有已完成但未提款的订单
  const ordersToWithdraw = orderList.value.filter(
    order => order.status === '已完成' && !order.withdrawalStatus
  );
  
  if (ordersToWithdraw.length === 0) {
    ElMessage.warning('没有可提款的订单');
    return;
  }
  
  const totalAmount = ordersToWithdraw.reduce((sum, order) => {
    const price = parseFloat(order.totalPrice.replace('¥', ''))
    return sum + price
  }, 0);
  
  ElMessageBox.confirm(
    `确定要提取总金额 ¥${totalAmount.toFixed(2)} 吗？共 ${ordersToWithdraw.length} 笔订单`,
    '提款确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      // 更新订单的提款状态
      ordersToWithdraw.forEach(order => {
        const index = orderList.value.findIndex(item => item.id === order.id);
        if (index !== -1) {
          // 添加提款状态标记
          orderList.value[index].withdrawalStatus = 'withdrawn';
        }
      });
      
      ElMessage.success(`已成功提取 ¥${totalAmount.toFixed(2)}`);
    })
    .catch(() => {
      ElMessage.info('已取消提款操作');
    });
}

onMounted(() => {
  // 初始加载数据
  handleSearch()
})
</script>

<style>
/* 全局样式，不使用scoped */
.refund-approval-dialog .el-message-box__header {
  padding: 15px 15px 0 !important;
  height: 20px !important;
}

.refund-approval-dialog .el-message-box__title {
  display: none !important;
}

.refund-approval-dialog .el-message-box__headerbtn {
  top: 15px !important;
  right: 15px !important;
}

.refund-approval-dialog .el-message-box__content {
  padding: 0 !important;
}

.refund-approval-dialog .el-message-box__message p {
  margin: 0 !important;
}

.refund-approval-dialog .el-message-box {
  padding: 0 !important;
  max-width: 480px !important;
  border-radius: 8px !important;
  overflow: hidden !important;
}

.refund-approval-dialog .el-message-box__btns {
  padding: 16px 24px !important;
  background-color: #f8f9fa !important;
  border-top: 1px solid #ebeef5 !important;
  margin-top: 0 !important;
}

.refund-approval-dialog .el-message-box__status {
  display: none !important;
}

.refund-dialog {
  padding: 0;
}

.refund-dialog-title {
  padding: 20px 24px;
  margin-bottom: 0;
  background-color: #fff;
  border-bottom: 1px solid #ebeef5;
}

.refund-dialog-content {
  padding: 24px;
  background-color: #fff;
}

.refund-dialog-item {
  margin-bottom: 20px;
}

.refund-amount-section {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
}

.refund-amount {
  font-size: 28px;
  margin-top: 8px;
}

.description-section {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
}

.description-label {
  color: #606266;
  margin-bottom: 8px;
  font-weight: 500;
}

.description-content {
  color: #303133;
  line-height: 1.6;
  white-space: pre-wrap;
}

.refund-confirm-text {
  text-align: center;
  color: #606266;
  font-size: 14px;
  margin-top: 16px;
}
</style>

<style scoped>
.orders-container {
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

.price {
  color: #f56c6c;
  font-weight: bold;
}

.fee {
  color: #E6A23C;
  font-weight: bold;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.order-detail) {
  font-size: 14px;
  line-height: 1.8;
}

:deep(.order-detail h3) {
  margin-top: 0;
  margin-bottom: 15px;
  color: #303133;
  font-size: 18px;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 10px;
}

:deep(.order-detail h4) {
  margin-top: 20px;
  margin-bottom: 10px;
  color: #606266;
  font-size: 16px;
  border-left: 3px solid #409EFF;
  padding-left: 10px;
}

:deep(.detail-section) {
  margin-bottom: 15px;
  background-color: #f9f9f9;
  padding: 10px 15px;
  border-radius: 4px;
}

:deep(.detail-item) {
  margin-bottom: 8px;
}

:deep(.detail-item .label) {
  font-weight: bold;
  color: #606266;
  display: inline-block;
  width: 80px;
}

:deep(.detail-item pre) {
  margin: 5px 0 0 0;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
  font-family: monospace;
  white-space: pre-wrap;
  word-break: break-all;
}

:deep(.account-info pre) {
  color: #67c23a;
}

:deep(.order-detail-dialog .el-message-box__wrapper .el-message-box) {
  max-width: 600px;
  width: 100%;
}

/* 退款审核弹窗样式 */
:deep(.refund-dialog) .el-dialog__body {
  padding: 20px;
}

:deep(.refund-dialog) .el-dialog__header {
  margin-right: 0;
  padding: 20px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

:deep(.refund-dialog) .el-dialog__title {
  font-size: 16px;
  font-weight: 600;
}

:deep(.refund-dialog) .el-dialog__footer {
  padding: 20px;
  border-top: 1px solid var(--el-border-color-lighter);
}

:deep(.refund-dialog) .refund-section {
  margin-bottom: 24px;
  padding: 16px;
  background-color: var(--el-fill-color-light);
  border-radius: 4px;
}

:deep(.refund-dialog) .refund-section:last-child {
  margin-bottom: 0;
}

:deep(.refund-dialog) h4 {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 16px;
}

:deep(.refund-dialog) .info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

:deep(.refund-dialog) .form-tip {
  margin-top: 8px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

:deep(.refund-dialog) .form-tip.warning {
  color: var(--el-color-warning);
}

:deep(.refund-dialog) .el-form-item:last-child {
  margin-bottom: 0;
}

:deep(.refund-dialog) .dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
  margin-bottom: 0;
}

:deep(.detail-item .value) {
  color: #303133;
  font-weight: 500;
}

:deep(.refund-amount-section) {
  text-align: center;
  padding: 16px 0;
}

:deep(.amount-label) {
  color: #606266;
  margin-bottom: 8px;
}

:deep(.refund-amount) {
  font-size: 24px;
  color: #f56c6c;
  font-weight: bold;
}

:deep(.time-section) {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

:deep(.time-label) {
  color: #606266;
}

:deep(.time-value) {
  color: #303133;
}

:deep(.description-section) {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px dashed #e4e7ed;
}

:deep(.description-label) {
  color: #606266;
  margin-bottom: 8px;
}

:deep(.description-content) {
  color: #303133;
  line-height: 1.5;
  background-color: #fff;
  padding: 12px;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
}

:deep(.refund-dialog-footer) {
  margin-top: 20px;
  text-align: center;
  color: #606266;
  font-weight: 500;
}

:deep(.refund-section) {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

:deep(.refund-section) h4 {
  font-size: 16px;
  color: #303133;
  margin: 0 0 20px;
  display: flex;
  align-items: center;
  font-weight: 500;
}

:deep(.refund-section) h4::before {
  content: '';
  width: 4px;
  height: 16px;
  background-color: #409EFF;
  margin-right: 8px;
  border-radius: 2px;
}

:deep(.form-tip.warning) {
  margin-top: 8px;
  color: #E6A23C;
  font-size: 13px;
  display: flex;
  align-items: center;
}

:deep(.form-tip.warning) i {
  margin-right: 4px;
  font-size: 14px;
}

:deep(.el-dialog__footer) {
  padding: 16px 24px;
  border-top: 1px solid #ebeef5;
  background-color: #fff;
}

:deep(.form-tip) {
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.4;
}

:deep(.form-tip.warning) {
  color: #E6A23C;
  display: flex;
  align-items: center;
}

:deep(.dialog-footer) {
  padding: 16px 24px;
  text-align: right;
  background-color: #f8f9fa;
  border-top: 1px solid #e4e7ed;
  border-radius: 0 0 4px 4px;
}

:deep(.dialog-footer) .el-button + .el-button {
  margin-left: 12px;
}

:deep(.refund-dialog-item:last-child) {
  margin-bottom: 0;
}

:deep(.detail-item) {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

:deep(.detail-item:last-child) {
  margin-bottom: 0;
}

:deep(.detail-item .label) {
  color: #909399;
  margin-right: 12px;
  min-width: 80px;
  font-weight: 500;
}

:deep(.detail-item .value) {
  color: #303133;
  flex: 1;
}

:deep(.refund-amount) {
  font-size: 24px;
  color: #F56C6C;
  font-weight: 600;
  margin-top: 12px;
  padding: 16px;
  background-color: #FEF0F0;
  border-radius: 6px;
  text-align: center;
}

:deep(.refund-time) {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  color: #909399;
}

:deep(.warning-icon) {
  color: #E6A23C;
  font-size: 16px;
  margin-right: 8px;
}

:deep(.refund-remark) {
  margin-top: 8px;
  color: #606266;
  word-break: break-all;
  background-color: #FFFFFF;
  padding: 12px;
  border-radius: 4px;
  border: 1px solid #EBEEF5;
}

:deep(.refund-dialog-footer) {
  text-align: center;
  margin-top: 24px;
}

:deep(.refund-confirm-text) {
  color: #606266;
  font-size: 15px;
  font-weight: 500;
}

:deep(.refund-dialog-footer) {
  margin-top: 15px;
  color: #606266;
  text-align: center;
}

:deep(.el-message-box) {
  padding: 0;
  border-radius: 4px;
  overflow: hidden;
  max-width: 400px;
}

:deep(.el-message-box__header) {
  display: none;
}

:deep(.el-message-box__content) {
  padding: 0;
}

:deep(.el-message-box__message) {
  padding: 0;
}

:deep(.el-message-box__btns) {
  padding: 10px 15px 15px;
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
</style>