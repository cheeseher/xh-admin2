<template>
  <div class="orders-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>商品订单列表</span>
          <div class="header-buttons">
            <el-button type="primary" @click="exportAllOrders">
              <el-icon><Download /></el-icon>
              导出所有订单
            </el-button>
          </div>
        </div>
      </template>
      
      <div class="page-description">
        <p>管理所有邮箱账号和社交媒体账号的订单信息，包括订单状态、商品信息、买家信息等。您可以查看、编辑、删除订单，并进行发货操作。</p>
      </div>
      
      <!-- 搜索区域 -->
      <el-card shadow="never" class="filter-card-wrapper">
        <div class="search-area">
          <el-form :inline="true" :model="searchForm" class="demo-form-inline">
            <el-form-item label="订单号">
              <el-input v-model="searchForm.orderId" placeholder="请输入订单号" clearable></el-input>
            </el-form-item>
            <el-form-item label="用户邮箱">
              <el-input v-model="searchForm.userEmail" placeholder="请输入用户邮箱" clearable></el-input>
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
                <el-option label="微信" value="wechat"></el-option>
                <el-option label="支付宝" value="alipay"></el-option>
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
                <el-option label="已退款" value="已退款"></el-option>
                <el-option label="已取消" value="已取消"></el-option>
                <el-option label="发货失败" value="发货失败"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="用户身份">
              <el-select v-model="searchForm.userRole" placeholder="请选择" clearable style="width: 168px;">
                <el-option label="全部" value=""></el-option>
                <el-option label="游客" value="游客"></el-option>
                <el-option label="普通用户" value="普通用户"></el-option>
                <el-option label="vip1" value="vip1"></el-option>
                <el-option label="vip2" value="vip2"></el-option>
                <el-option label="vip3" value="vip3"></el-option>
                <el-option label="超级会员" value="超级会员"></el-option>
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
              <span style="margin-left: 20px;">订单总金额：</span>
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
      </el-card>
      
      <!-- 表格区域 -->
      <el-card shadow="never" class="table-card-wrapper">
        <div class="table-area-wrapper">
          <el-table 
            :data="filteredOrderList" 
            style="width: 100%" 
            v-loading="loading" 
            border 
            stripe
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="55"></el-table-column>
            <el-table-column prop="id" label="商品订单ID" width="100"></el-table-column>
            <el-table-column prop="orderId" label="订单号" width="180"></el-table-column>
            <el-table-column prop="productName" label="商品名称" min-width="180"></el-table-column>
            <el-table-column prop="category" label="商品分类" width="100">
              <template #default="scope">
                {{ scope.row.category }}
              </template>
            </el-table-column>
            <el-table-column prop="originalPrice" label="商品价格" width="100">
              <template #default="scope">
                <div class="price-container">
                  <span class="price">{{ scope.row.originalPrice }}</span>
                  <span v-if="scope.row.payMethod === 'usdt'" class="usdt-price">{{ convertToUSDT(scope.row.originalPrice) }} USDT</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="quantity" label="数量" width="80"></el-table-column>
            <el-table-column prop="totalPrice" label="订单金额" width="100">
              <template #default="scope">
                <div class="price-container">
                  <span class="price">{{ scope.row.totalPrice }}</span>
                  <span v-if="scope.row.payMethod === 'usdt'" class="usdt-price">{{ convertToUSDT(scope.row.totalPrice) }} USDT</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="fee" label="手续费" width="100">
              <template #default="scope">
                <div class="price-container">
                  <span class="fee">{{ scope.row.fee || '¥0.00' }}</span>
                  <span v-if="scope.row.payMethod === 'usdt'" class="usdt-price">{{ convertToUSDT(scope.row.fee || '¥0.00') }} USDT</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="入账金额" width="120">
              <template #default="scope">
                <div class="price-container">
                  <span>{{ calculateIncome(scope.row) }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="cardInfo" label="卡密信息" min-width="120">
              <template #default="scope">
                <el-button link type="primary" @click="viewCardInfo(scope.row)">查看</el-button>
              </template>
            </el-table-column>
            <el-table-column prop="userEmail" label="用户邮箱" width="180"></el-table-column>
            <el-table-column prop="userRole" label="用户身份" width="100">
              <template #default="scope">
                <el-tag :type="getUserRoleType(scope.row.userRole)" size="small">
                  {{ scope.row.userRole }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="折扣" width="80">
              <template #default="scope">
                <el-tag type="success" effect="plain" size="small">
                  {{ getUserDiscount(scope.row.userRole) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="payMethod" label="支付方式" width="100">
              <template #default="scope">
                <el-tag :type="getPayMethodType(scope.row.payMethod)">
                  {{ getPayMethodLabel(scope.row.payMethod) }}
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
            <el-table-column prop="createTime" label="创建时间" width="180"></el-table-column>
            <el-table-column prop="remark" label="备注" min-width="120"></el-table-column>
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="scope">
                <el-dropdown trigger="hover">
                  <el-button type="primary" size="small">
                    操作
                    <el-icon class="el-icon--right"><arrow-down /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="handleEditOrder(scope.row)">
                        编辑订单
                      </el-dropdown-item>
                      <el-dropdown-item v-if="scope.row.status === '待发货'" @click="handleDeliver(scope.row)">
                        发货
                      </el-dropdown-item>
                      <el-dropdown-item @click="handleResendEmail(scope.row)">
                        重发邮件
                      </el-dropdown-item>
                      <el-dropdown-item v-if="scope.row.status !== '已退款'" @click="handleRefund(scope.row)">
                        退款
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
        </div>
      </el-card>
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
      title="订单退款"
      width="500px"
      class="refund-dialog"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <div class="refund-info">
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
          <span class="value price">¥{{ refundForm.refundAmount.toFixed(2) }}</span>
        </div>
        <div class="info-item">
          <span class="label">用户ID：</span>
          <span class="value">{{ refundForm.userId }}</span>
        </div>
      </div>
      
      <el-form :model="refundForm" label-width="80px" :rules="refundRules" ref="refundFormRef">
        <el-form-item label="退款备注" prop="refundRemark">
          <el-input
            v-model="refundForm.refundRemark"
            type="textarea"
            :rows="3"
            placeholder="请输入退款备注信息"
          ></el-input>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="refundDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitRefund">确认退款</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- Edit Order Dialog -->
    <el-dialog
      v-model="editOrderDialogVisible"
      title="编辑订单备注"
      width="500px"
      destroy-on-close
    >
      <el-form v-if="editOrderForm" :model="editOrderForm" label-width="80px" ref="editOrderFormRef">
        <el-form-item label="订单号">
          <el-input v-model="editOrderForm.orderId" disabled />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="editOrderForm.remark" type="textarea" :rows="3" placeholder="请输入订单备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editOrderDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitEditOrderForm">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Download, ArrowDown, Check, Delete, View, Warning, Money, Message, Edit } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { orderList as externalOrderList, productOptions as externalProductOptions, type OrderItem, type RefundInfo } from '@/data/orderData.js'

// 搜索表单
const searchForm = reactive({
  orderId: '',
  userEmail: '',
  category: '',
  payMethod: '',
  deliveryMethod: '',
  status: '',
  userRole: '',
  dateRange: [] as string[]
})

// 商品选项 - Use from external file
const productOptions = externalProductOptions

// 表格数据 - Use from external file
const orderList = ref<OrderItem[]>([]) // Initialize as empty, will be populated
const allOrderList = ref<OrderItem[]>([]) // This will hold the initial full list from external data

// Dialog states and forms
const editOrderDialogVisible = ref(false)
const editOrderFormRef = ref<FormInstance>()
const editOrderForm = ref<Partial<OrderItem>>({ id: '', remark: '' }) // Allow partial updates, focusing on remark

// Populate orderList and allOrderList from external data onMounted
onMounted(() => {
  // Assuming externalOrderList is a ref from the .js file
  const rawExternalData = externalOrderList.value || [] 
  orderList.value = JSON.parse(JSON.stringify(rawExternalData)); // Deep copy for local manipulation
  allOrderList.value = JSON.parse(JSON.stringify(rawExternalData)); // Deep copy for original dataset
  handleSearch() // Initial filter/display
  // Initialize total for pagination
  total.value = filteredOrderList.value.length;
})

// 查询
const handleSearch = () => {
  loading.value = true
  
  // 模拟搜索操作
  setTimeout(() => {
    // 更新分页相关数据
    total.value = filteredOrderList.value.length
    loading.value = false
  }, 500)
}

// 添加一个新的变量来存储筛选后的订单数据
const filteredOrderList = computed(() => {
  let result = [...allOrderList.value]
  
  if (searchForm.orderId) {
    result = result.filter(item => item.orderId.includes(searchForm.orderId))
  }
  
  if (searchForm.userEmail) {
    result = result.filter(item => item.userEmail.toLowerCase().includes(searchForm.userEmail.toLowerCase()))
  }
  
  if (searchForm.category) {
    result = result.filter(item => item.category === searchForm.category)
  }
  
  if (searchForm.payMethod) {
    result = result.filter(item => item.payMethod === searchForm.payMethod)
  }
  
  if (searchForm.deliveryMethod) {
    result = result.filter(item => item.deliveryMethod === searchForm.deliveryMethod)
  }
  
  if (searchForm.status) {
    result = result.filter(item => item.status === searchForm.status)
  }
  
  if (searchForm.userRole) {
    result = result.filter(item => item.userRole === searchForm.userRole)
  }
  
  if (searchForm.dateRange && searchForm.dateRange.length === 2) {
    const startDate = new Date(searchForm.dateRange[0])
    const endDate = new Date(searchForm.dateRange[1])
    endDate.setHours(23, 59, 59, 999) // 设置为当天结束时间
    
    result = result.filter(item => {
      const createTime = new Date(item.createTime)
      return createTime >= startDate && createTime <= endDate
    })
  }
  
  return result
})

// 计算筛选后的总订单数
const totalOrders = computed(() => {
  return filteredOrderList.value.length
})

// 计算筛选后的成功订单数（状态为"已完成"的订单）
const successOrders = computed(() => {
  return filteredOrderList.value.filter(order => order.status === '已完成').length
})

// 计算筛选后的总金额
const totalAmount = computed(() => {
  return filteredOrderList.value.reduce((sum, order) => {
    const price = parseFloat(order.totalPrice.replace('¥', ''))
    return sum + (isNaN(price) ? 0 : price)
  }, 0)
})

// 计算筛选后的总手续费
const totalFee = computed(() => {
  return filteredOrderList.value.reduce((sum, order) => {
    const fee = parseFloat((order.fee || '¥0.00').replace('¥', ''))
    return sum + (isNaN(fee) ? 0 : fee)
  }, 0)
})

// 计算筛选后的总入账金额
const totalIncome = computed(() => {
  return totalAmount.value - totalFee.value
})

// 计算选中的订单总金额
const selectedTotalAmount = computed(() => {
  return multipleSelection.value.reduce((sum, order) => {
    const price = parseFloat(order.totalPrice.replace('¥', ''))
    return sum + (isNaN(price) ? 0 : price)
  }, 0)
})

// 多选相关
const multipleSelection = ref<OrderItem[]>([])
const handleSelectionChange = (selection: OrderItem[]) => {
  multipleSelection.value = selection
}

// 修改导出订单功能，区分是否有选中订单
const exportOrders = () => {
  // 确定要导出的订单列表
  if (multipleSelection.value.length === 0) {
    ElMessage.warning('请先选择要导出的订单')
    return
  }
  
  // 创建CSV内容
  let csvContent = '订单号,商品名称,商品分类,数量,总价,手续费,入账金额,用户邮箱,支付方式,发货方式,订单状态,创建时间\n'
  
  multipleSelection.value.forEach(order => {
    csvContent += `"${order.orderId}","${order.productName}","${order.category}",${order.quantity},"${order.totalPrice}","${order.fee || '¥0.00'}","${calculateIncome(order)}","${order.userEmail}","${getPayMethodLabel(order.payMethod)}","${order.deliveryMethod}","${order.status}","${order.createTime}"\n`
  })
  
  // 创建Blob对象
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  
  // 创建下载链接
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  // 设置下载属性
  link.setAttribute('href', url)
  const fileName = `选中订单_${new Date().toISOString().split('T')[0]}.csv`
  link.setAttribute('download', fileName)
  link.style.visibility = 'hidden'
  
  // 添加到文档并触发点击
  document.body.appendChild(link)
  link.click()
  
  // 清理
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  
  ElMessage.success(`成功导出选中订单数据`)
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
  cardInfo: '',
  remark: ''
})

// 发货表单验证规则
const deliverRules = reactive<FormRules>({
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
  userId: '',
  totalPrice: 0,
  refundAmount: 0,
  refundRemark: '',
  refundTime: ''
})

// 退款表单验证规则
const refundRules = reactive<FormRules>({
  refundRemark: [
    { required: true, message: '请输入退款备注', trigger: 'blur' }
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
    'Discord账号': 'warning',
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
    case '已退款':
      return 'danger'
    case '已取消':
      return 'info'
    case '发货失败':
      return 'danger'
    default:
      return 'info'
  }
}

// 重置
const resetSearch = () => {
  searchForm.orderId = ''
  searchForm.userEmail = ''
  searchForm.category = ''
  searchForm.payMethod = ''
  searchForm.deliveryMethod = ''
  searchForm.status = ''
  searchForm.userRole = ''
  searchForm.dateRange = []
  
  // 重置后重新查询
  handleSearch()
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
          <span class="label">用户身份：</span>
          <span><el-tag size="small" effect="plain" :type="getUserRoleType(row.userRole)">
            ${row.userRole}
          </el-tag></span>
        </div>
        <div class="detail-item">
          <span class="label">支付方式：</span>
          <span><el-tag size="small" effect="plain" :type="getPayMethodType(row.payMethod)">
            {{ getPayMethodLabel(row.payMethod) }}
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
        order.status = '已完成'
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

// 添加重发邮件功能
const handleResendEmail = (row: any) => {
  ElMessageBox.confirm(
    `确定要重发订单 ${row.orderId} 的邮件通知吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info',
    }
  )
    .then(() => {
      // 模拟邮件发送处理
      setTimeout(() => {
        ElMessage({
          type: 'success',
          message: `订单 ${row.orderId} 的邮件已重新发送`,
        })
      }, 500)
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '已取消操作',
      })
    })
}

// 修改退款处理函数，可对任何非已退款状态的订单执行
const handleRefund = (row: any) => {
  refundForm.id = row.id
  refundForm.orderId = row.orderId
  refundForm.productName = row.productName
  refundForm.userId = row.id.substring(1)
  refundForm.totalPrice = parseFloat(row.totalPrice.replace('¥', ''))
  refundForm.refundAmount = refundForm.totalPrice
  
  // 添加假数据
  const now = new Date()
  refundForm.refundTime = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).replace(/\//g, '-')
  
  // 根据不同商品类型设置不同的退款说明
  if (row.category === '谷歌邮箱') {
    refundForm.refundRemark = '账号无法正常登录，提示安全验证'
  } else if (row.category === 'Instagram账号' || row.category === 'Facebook账号' || row.category === 'Twitter账号') {
    refundForm.refundRemark = '账号登录后显示已被平台限制使用'
  } else if (row.category === 'ChatGPT账号') {
    refundForm.refundRemark = '账号无法使用高级功能，与商品描述不符'
  } else {
    refundForm.refundRemark = '客户表示不再需要此账号'
  }
  
  refundDialogVisible.value = true
}

// 修改提交退款审核结果函数
const submitRefund = async () => {
  if (!refundFormRef.value) return
  
  await refundFormRef.value.validate((valid, fields) => {
    if (valid) {
      // 获取订单
      const index = orderList.value.findIndex(item => item.id === refundForm.id)
      if (index !== -1) {
        // 更新订单状态为已退款
        orderList.value[index].status = '已退款'
        // 更新退款信息
        orderList.value[index].refundInfo = {
          refundAmount: refundForm.refundAmount,
          refundRemark: refundForm.refundRemark,
          refundTime: refundForm.refundTime
        }
        ElMessage.success(`订单 ${refundForm.orderId} 已退款成功`)
      }
      
      refundDialogVisible.value = false
    } else {
      console.log('表单验证失败', fields)
    }
  })
}

// 修改导出所有订单的方法
const exportAllOrders = () => {
  // 导出所有订单
  if (allOrderList.value.length === 0) {
    ElMessage.warning('没有可导出的订单数据')
    return
  }
  
  // 创建CSV内容
  let csvContent = '订单号,商品名称,商品分类,数量,总价,手续费,入账金额,用户邮箱,支付方式,发货方式,订单状态,创建时间\n'
  
  allOrderList.value.forEach(order => {
    csvContent += `"${order.orderId}","${order.productName}","${order.category}",${order.quantity},"${order.totalPrice}","${order.fee || '¥0.00'}","${calculateIncome(order)}","${order.userEmail}","${getPayMethodLabel(order.payMethod)}","${order.deliveryMethod}","${order.status}","${order.createTime}"\n`
  })
  
  // 创建Blob对象
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  
  // 创建下载链接
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  // 设置下载属性
  link.setAttribute('href', url)
  const fileName = `全部订单_${new Date().toISOString().split('T')[0]}.csv`
  link.setAttribute('download', fileName)
  link.style.visibility = 'hidden'
  
  // 添加到文档并触发点击
  document.body.appendChild(link)
  link.click()
  
  // 清理
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  
  ElMessage.success('成功导出全部订单数据')
}

// 在script部分添加以下函数
const getPayMethodType = (method: string) => {
  const typeMap: Record<string, string> = {
    'usdt': 'danger',
    'wechat': 'success',
    'alipay': 'primary'
  }
  return typeMap[method] || 'danger'
}

const getPayMethodLabel = (method: string) => {
  const labelMap: Record<string, string> = {
    'usdt': 'USDT',
    'wechat': '微信',
    'alipay': '支付宝'
  }
  return labelMap[method] || 'USDT'
}

// 添加 USDT 转换函数
const convertToUSDT = (price: string): string => {
  // 移除人民币符号并转换为数字
  const numPrice = parseFloat(price.replace('¥', ''))
  // 假设汇率为 1 CNY = 0.14 USDT
  const usdtPrice = (numPrice * 0.14).toFixed(2)
  return usdtPrice
}

// 获取用户角色对应的标签类型
const getUserRoleType = (role: string) => {
  switch (role) {
    case '超级会员':
      return 'danger'
    case 'vip3':
      return 'warning'
    case 'vip2':
      return 'success'
    case 'vip1':
      return 'primary'
    default:
      return 'info'
  }
}

// 获取用户折扣信息
const getUserDiscount = (role: string) => {
  switch (role) {
    case '超级会员':
      return '折扣优惠'
    case 'vip3':
      return '85%'
    case 'vip2':
      return '90%'
    case 'vip1':
      return '95%'
    case '普通用户':
      return '90%'
    default:
      return '100%'
  }
}

// 添加 calculateIncome 方法，计算入账金额 = 总价 - 手续费
const calculateIncome = (row: any): string => {
  const totalPrice = parseFloat(row.totalPrice.replace('¥', ''))
  const fee = parseFloat((row.fee || '¥0.00').replace('¥', ''))
  const income = totalPrice - fee
  return '¥' + income.toFixed(2)
}

// Handlers for new dialogs
const handleEditOrder = (row: OrderItem) => {
  // Only copy relevant fields for editing to avoid unintended modifications
  editOrderForm.value = { 
    id: row.id, 
    orderId: row.orderId, // For display in form
    remark: row.remark || '' 
  };
  editOrderDialogVisible.value = true;
};

const submitEditOrderForm = async () => {
  if (!editOrderFormRef.value) return;
  try {
    const valid = await editOrderFormRef.value.validate();
    if (valid && editOrderForm.value.id) {
      const orderIndex = orderList.value.findIndex(o => o.id === editOrderForm.value.id);
      if (orderIndex !== -1) {
        orderList.value[orderIndex].remark = editOrderForm.value.remark;
        // Also update in allOrderList if you want changes to persist across unfiltered data
        const allOrderIndex = allOrderList.value.findIndex(o => o.id === editOrderForm.value.id);
        if (allOrderIndex !== -1) {
          allOrderList.value[allOrderIndex].remark = editOrderForm.value.remark;
        }
        ElMessage.success('备注更新成功');
        editOrderDialogVisible.value = false;
      } else {
        ElMessage.error('未找到订单');
      }
    } else {
      ElMessage.error('表单验证失败');
    }
  } catch (error) {
    console.error("Error submitting edit order form:", error);
    ElMessage.error('更新备注失败');
  }
};
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

.box-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-buttons .el-button {
  margin-left: 10px;
}

.page-description {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f4f4f5;
  border-radius: 4px;
  color: #909399;
  font-size: 14px;
}

.filter-card-wrapper {
  margin-bottom: 20px;
}

.search-area {
  /* el-card will provide padding, specific padding here can be removed or adjusted if necessary */
}

.demo-form-inline .el-form-item {
  margin-bottom: 10px;
}

.search-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.total-amount span {
  margin-right: 10px;
  font-size: 14px;
}

.total-amount .amount-value {
  font-weight: bold;
  color: #F56C6C;
}

.action-btns .el-button {
  margin-left: 10px;
}

.table-area-wrapper {
  /* el-card will provide padding */
}

.price-container {
  display: flex;
  flex-direction: column;
}

.price, .original-price, .purchase-price, .fee, .income-price {
  /* Consolidating price related styles, specific colors can be added if needed */
  color: #303133;
}

.price {
  /* Making sure .price (often total price) stands out if needed */
  /* font-weight: bold; */ /* Example if it needs to be bolder */
}

.original-price {
 color: #909399;
}

.purchase-price {
  color: #67C23A;
  font-weight: bold;
}

.fee {
  color: #E6A23C;
  /* font-weight: bold; */ /* Example */
}

/* 移除入账金额特殊样式，使用默认文本颜色 */
/* .income-price {
  color: #409EFF;
  font-weight: bold;
} */

.usdt-price {
  font-size: 0.9em;
  color: #67C23A;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

/* Styles for dialogs */
.refund-dialog .refund-info {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.refund-dialog .info-item {
  margin-bottom: 8px;
  font-size: 14px;
}

.refund-dialog .info-item .label {
  color: #606266;
  margin-right: 5px;
}

.refund-dialog .info-item .value {
  color: #303133;
}

.refund-dialog .info-item .price {
  color: #F56C6C;
  font-weight: bold;
}

/* Removing potentially conflicting deep selectors and general cleanup */
/* Styles like :deep(.order-detail), :deep(.refund-dialog .el-dialog__header) etc. */
/* will be re-evaluated if specific dialog styling is needed later, adhering to BEM or scoped styles */

.order-detail-content pre.card-info-pre {
  background-color: #f5f7fa;
  padding: 10px;
  border-radius: 4px;
  white-space: pre-wrap; 
  word-break: break-all; 
  font-family: monospace;
}
</style>