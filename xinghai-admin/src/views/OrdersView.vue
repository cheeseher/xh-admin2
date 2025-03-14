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
              <el-option label="已发货" value="已发货"></el-option>
              <el-option label="已完成" value="已完成"></el-option>
              <el-option label="已取消" value="已取消"></el-option>
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
      </div>
      
      <!-- 表格区域 -->
      <el-table :data="orderList" style="width: 100%" v-loading="loading" border stripe>
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
        <el-table-column prop="createTime" label="创建时间" width="180"></el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <el-button size="small" @click="handleView(scope.row)">查看</el-button>
              <el-button 
                v-if="scope.row.status === '待发货'" 
                size="small" 
                type="success" 
                @click="handleDeliver(scope.row)"
              >发货</el-button>
              <el-button 
                v-if="['已付款', '待发货', '已发货'].includes(scope.row.status)" 
                size="small" 
                type="warning" 
                @click="handleRefund(scope.row)"
              >退款</el-button>
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

    <!-- 退款对话框 -->
    <el-dialog
      v-model="refundDialogVisible"
      title="订单退款"
      width="550px"
    >
      <el-form :model="refundForm" label-width="100px" :rules="refundRules" ref="refundFormRef">
        <el-form-item label="订单号">
          <el-input v-model="refundForm.orderId" disabled></el-input>
        </el-form-item>
        <el-form-item label="商品名称">
          <el-input v-model="refundForm.productName" disabled></el-input>
        </el-form-item>
        <el-form-item label="用户邮箱">
          <el-input v-model="refundForm.userEmail" disabled></el-input>
        </el-form-item>
        <el-form-item label="退款金额" prop="refundAmount">
          <el-input-number 
            v-model="refundForm.refundAmount" 
            :min="0" 
            :max="refundForm.totalPrice" 
            :precision="2" 
            :step="0.01"
            style="width: 100%;"
          ></el-input-number>
          <div class="form-tip">最大可退金额: {{ refundForm.totalPrice }}</div>
        </el-form-item>
        <el-form-item label="退款原因" prop="refundReason">
          <el-select v-model="refundForm.refundReason" placeholder="请选择退款原因" style="width: 100%;">
            <el-option label="客户申请退款" value="客户申请退款"></el-option>
            <el-option label="商品缺货" value="商品缺货"></el-option>
            <el-option label="商品质量问题" value="商品质量问题"></el-option>
            <el-option label="订单信息有误" value="订单信息有误"></el-option>
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
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
  id: number;
  orderId: string;
  productName: string;
  category: string;
  quantity: number;
  totalPrice: string;
  cardId?: string;
  cardInfo?: string;
  userEmail: string;
  payMethod: string;
  deliveryMethod: string;
  status: string;
  remark?: string;
  createTime: string;
  refundInfo: RefundInfo | null;
}

// 表格数据
const orderList = ref<OrderItem[]>([
  { 
    id: 1,
    orderId: 'DD20240315001', 
    productName: 'Gmail邮箱-稳定可用', 
    category: '谷歌邮箱',
    quantity: 1,
    totalPrice: '¥2.75',
    cardId: 'CM001',
    cardInfo: 'example@gmail.com|password123',
    userEmail: 'user123@example.com',
    payMethod: 'usdt',
    deliveryMethod: '自动发货',
    status: '已完成',
    remark: '客户要求稳定可用的账号',
    createTime: '2024-03-15 10:00:00',
    refundInfo: null
  },
  { 
    id: 2,
    orderId: 'DD20240315002', 
    productName: 'ChatGPT账号', 
    category: 'ChatGPT账号',
    quantity: 1,
    totalPrice: '¥199.99',
    cardId: 'CM002',
    cardInfo: 'chatgpt@example.com|password456',
    userEmail: 'user456@example.com',
    payMethod: 'usdt',
    deliveryMethod: '手动发货',
    status: '已发货',
    remark: '客户需要美国地区的账号',
    createTime: '2024-03-15 11:30:00',
    refundInfo: null
  },
  { 
    id: 3,
    orderId: 'DD20240315003', 
    productName: 'Instagram账号', 
    category: 'Instagram账号',
    quantity: 1,
    totalPrice: '¥39.99',
    cardId: '',
    cardInfo: '',
    userEmail: 'user789@example.com',
    payMethod: 'usdt',
    deliveryMethod: '手动发货',
    status: '待发货',
    remark: '',
    createTime: '2024-03-15 14:20:00',
    refundInfo: null
  },
  { 
    id: 4,
    orderId: 'DD20240315004', 
    productName: 'Gmail邮箱-美国稳定', 
    category: '谷歌邮箱',
    quantity: 2,
    totalPrice: '¥20.00',
    cardId: '',
    cardInfo: '',
    userEmail: 'user101@example.com',
    payMethod: 'other',
    deliveryMethod: '自动发货',
    status: '待付款',
    remark: '',
    createTime: '2024-03-15 16:45:00',
    refundInfo: null
  },
  { 
    id: 5,
    orderId: 'DD20240315005', 
    productName: 'Twitter账号', 
    category: 'Twitter账号',
    quantity: 1,
    totalPrice: '¥49.99',
    cardId: 'CM003',
    cardInfo: 'twitter@example.com|password789',
    userEmail: 'user202@example.com',
    payMethod: 'usdt',
    deliveryMethod: '手动发货',
    status: '已取消',
    remark: '客户取消订单',
    createTime: '2024-03-15 09:15:00',
    refundInfo: null
  },
  { 
    id: 6,
    orderId: 'DD20240315006', 
    productName: 'Gmail邮箱-半年以上', 
    category: '谷歌邮箱',
    quantity: 3,
    totalPrice: '¥22.50',
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

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)
const loading = ref(false)

// 发货对话框相关
const deliverDialogVisible = ref(false)
const deliverFormRef = ref<FormInstance>()
const deliverForm = reactive({
  id: 0,
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
  id: 0,
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
    case '已发货':
      return 'success'
    case '已完成':
      return 'success'
    case '已取消':
      return 'info'
    case '已退款':
      return 'danger'
    default:
      return 'info'
  }
}

// 查询
const handleSearch = () => {
  loading.value = true
  // 模拟请求
  setTimeout(() => {
    loading.value = false
    ElMessage.success('查询成功')
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
            orderList.value[index].status = '已退款'
            
            // 记录退款信息
            orderList.value[index].refundInfo = {
              refundAmount: refundForm.refundAmount,
              refundReason: refundForm.refundReason,
              refundRemark: refundForm.refundRemark,
              refundTime: new Date().toLocaleString()
            }
            
            // 如果是已发货的订单，可能需要处理账号回收逻辑
            if (orderList.value[index].status === '已发货') {
              // 这里可以添加账号回收的逻辑
              console.log('账号需要回收:', orderList.value[index].cardInfo)
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

onMounted(() => {
  // 初始加载数据
  handleSearch()
})
</script>

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