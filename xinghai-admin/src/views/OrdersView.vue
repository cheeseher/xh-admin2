<template>
  <div class="orders-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>订单管理</span>
          <el-button type="primary" size="small" @click="handleAddOrder">新增订单</el-button>
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
              <el-option label="支付宝" value="支付宝"></el-option>
              <el-option label="微信支付" value="微信支付"></el-option>
              <el-option label="银行卡" value="银行卡"></el-option>
              <el-option label="PayPal" value="PayPal"></el-option>
              <el-option label="USDT" value="USDT"></el-option>
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
        <el-table-column prop="price" label="价格" width="100">
          <template #default="scope">
            <span class="price">¥{{ scope.row.price }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="buyer" label="买家" width="120"></el-table-column>
        <el-table-column prop="payMethod" label="支付方式" width="100">
          <template #default="scope">
            <el-tag size="small" effect="plain" :type="getPayMethodTag(scope.row.payMethod)">{{ scope.row.payMethod }}</el-tag>
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
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <el-button size="small" @click="handleView(scope.row)">查看</el-button>
              <el-button size="small" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
              <el-button 
                v-if="scope.row.status === '待发货'" 
                size="small" 
                type="success" 
                @click="handleDeliver(scope.row)"
              >发货</el-button>
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
    
    <!-- 订单表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增订单' : '编辑订单'"
      width="650px"
    >
      <el-form :model="orderForm" label-width="100px" :rules="rules" ref="orderFormRef">
        <el-form-item label="商品名称" prop="productName">
          <el-select v-model="orderForm.productName" placeholder="请选择商品" filterable style="width: 100%;">
            <el-option v-for="item in productOptions" :key="item.value" :label="item.label" :value="item.value">
              <div style="display: flex; justify-content: space-between; align-items: center">
                <span>{{ item.label }}</span>
                <span style="color: #f56c6c; font-weight: bold">¥{{ item.price }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="商品分类" prop="category">
          <el-select v-model="orderForm.category" placeholder="请选择商品分类" style="width: 100%;">
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
        <el-form-item label="价格" prop="price">
          <el-input-number v-model="orderForm.price" :min="0" :precision="2" :step="0.01" style="width: 100%;"></el-input-number>
        </el-form-item>
        <el-form-item label="买家" prop="buyer">
          <el-input v-model="orderForm.buyer" placeholder="请输入买家信息"></el-input>
        </el-form-item>
        <el-form-item label="买家联系方式" prop="contact">
          <el-input v-model="orderForm.contact" placeholder="请输入买家联系方式"></el-input>
        </el-form-item>
        <el-form-item label="支付方式" prop="payMethod">
          <el-select v-model="orderForm.payMethod" placeholder="请选择支付方式" style="width: 100%;">
            <el-option label="支付宝" value="支付宝"></el-option>
            <el-option label="微信支付" value="微信支付"></el-option>
            <el-option label="银行卡" value="银行卡"></el-option>
            <el-option label="PayPal" value="PayPal"></el-option>
            <el-option label="USDT" value="USDT"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="发货方式" prop="deliveryMethod">
          <el-radio-group v-model="orderForm.deliveryMethod">
            <el-radio label="自动发货">自动发货</el-radio>
            <el-radio label="手动发货">手动发货</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="订单状态" prop="status">
          <el-select v-model="orderForm.status" placeholder="请选择订单状态" style="width: 100%;">
            <el-option label="待付款" value="待付款"></el-option>
            <el-option label="待发货" value="待发货"></el-option>
            <el-option label="已发货" value="已发货"></el-option>
            <el-option label="已完成" value="已完成"></el-option>
            <el-option label="已取消" value="已取消"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="账号信息" prop="accountInfo" v-if="orderForm.status === '已发货' || orderForm.status === '已完成'">
          <el-input 
            v-model="orderForm.accountInfo" 
            type="textarea" 
            :rows="4" 
            placeholder="请输入账号信息（账号、密码等）"
          ></el-input>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="orderForm.remark" type="textarea" :rows="3" placeholder="请输入备注信息"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
    
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
        <el-form-item label="买家">
          <el-input v-model="deliverForm.buyer" disabled></el-input>
        </el-form-item>
        <el-form-item label="账号信息" prop="accountInfo">
          <el-input 
            v-model="deliverForm.accountInfo" 
            type="textarea" 
            :rows="4" 
            placeholder="请输入账号信息（账号、密码等）"
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

// 表格数据
const orderList = ref([
  { 
    id: 1,
    orderId: 'DD20240315001', 
    productName: 'Gmail邮箱-稳定可用', 
    category: '谷歌邮箱',
    price: '¥2.75', 
    buyer: 'user***123', 
    contact: '138****1234',
    payMethod: '支付宝',
    deliveryMethod: '自动发货',
    status: '已完成', 
    accountInfo: 'example@gmail.com|password123',
    remark: '客户要求稳定可用的账号',
    createTime: '2024-03-15 10:00:00' 
  },
  { 
    id: 2,
    orderId: 'DD20240315002', 
    productName: 'ChatGPT账号', 
    category: 'ChatGPT账号',
    price: '¥199.99', 
    buyer: 'user***456', 
    contact: '139****5678',
    payMethod: '微信支付',
    deliveryMethod: '自动发货',
    status: '待付款', 
    accountInfo: '',
    remark: '',
    createTime: '2024-03-15 09:30:00' 
  },
  { 
    id: 3,
    orderId: 'DD20240315003', 
    productName: 'Facebook账号', 
    category: 'Facebook账号',
    price: '¥59.99', 
    buyer: 'user***789', 
    contact: '137****9012',
    payMethod: 'PayPal',
    deliveryMethod: '自动发货',
    status: '已完成', 
    accountInfo: 'facebook_user123@example.com|fb_pass123',
    remark: '客户需要美国地区的账号',
    createTime: '2024-03-15 09:00:00' 
  },
  { 
    id: 4,
    orderId: 'DD20240315004', 
    productName: 'Twitter账号', 
    category: 'Twitter账号',
    price: '¥49.99', 
    buyer: 'user***101', 
    contact: '136****3456',
    payMethod: '支付宝',
    deliveryMethod: '自动发货',
    status: '已发货', 
    accountInfo: 'twitter_user@example.com|tw_pass456',
    remark: '',
    createTime: '2024-03-15 08:30:00' 
  },
  { 
    id: 5,
    orderId: 'DD20240315005', 
    productName: 'Instagram账号', 
    category: 'Instagram账号',
    price: '¥39.99', 
    buyer: 'user***202', 
    contact: '135****7890',
    payMethod: '微信支付',
    deliveryMethod: '手动发货',
    status: '待发货', 
    accountInfo: '',
    remark: '客户要求账号有一定粉丝基础',
    createTime: '2024-03-15 08:00:00' 
  },
  { 
    id: 6,
    orderId: 'DD20240315006', 
    productName: 'Gmail邮箱-美国稳定', 
    category: '谷歌邮箱',
    price: '¥10.00', 
    buyer: 'user***303', 
    contact: '134****1234',
    payMethod: 'USDT',
    deliveryMethod: '自动发货',
    status: '待发货', 
    accountInfo: '',
    remark: '',
    createTime: '2024-03-15 07:30:00' 
  }
])

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)
const loading = ref(false)

// 对话框相关
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const orderFormRef = ref<FormInstance>()
const orderForm = reactive({
  id: 0,
  orderId: '',
  productName: '',
  category: '',
  price: 0,
  buyer: '',
  contact: '',
  payMethod: '',
  deliveryMethod: '自动发货',
  status: '待付款',
  accountInfo: '',
  remark: ''
})

// 发货对话框相关
const deliverDialogVisible = ref(false)
const deliverFormRef = ref<FormInstance>()
const deliverForm = reactive({
  id: 0,
  orderId: '',
  productName: '',
  buyer: '',
  accountInfo: '',
  remark: ''
})

// 表单验证规则
const rules = reactive<FormRules>({
  productName: [
    { required: true, message: '请选择商品', trigger: 'change' }
  ],
  category: [
    { required: true, message: '请选择商品分类', trigger: 'change' }
  ],
  price: [
    { required: true, message: '请输入价格', trigger: 'blur' }
  ],
  buyer: [
    { required: true, message: '请输入买家信息', trigger: 'blur' }
  ],
  payMethod: [
    { required: true, message: '请选择支付方式', trigger: 'change' }
  ],
  deliveryMethod: [
    { required: true, message: '请选择发货方式', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择订单状态', trigger: 'change' }
  ]
})

// 发货表单验证规则
const deliverRules = reactive<FormRules>({
  accountInfo: [
    { required: true, message: '请输入账号信息', trigger: 'blur' }
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

// 获取支付方式对应的标签类型
const getPayMethodTag = (payMethod: string) => {
  const payMethodMap: Record<string, string> = {
    '支付宝': 'primary',
    '微信支付': 'success',
    '银行卡': 'info',
    'PayPal': 'warning',
    'USDT': 'danger'
  }
  return payMethodMap[payMethod] || 'info'
}

// 获取状态对应的标签类型
const getStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    '待付款': 'info',
    '待发货': 'warning',
    '已发货': 'success',
    '已完成': 'primary',
    '已取消': 'danger'
  }
  return statusMap[status] || 'info'
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

// 新增订单
const handleAddOrder = () => {
  dialogType.value = 'add'
  orderForm.id = 0
  orderForm.orderId = `DD${new Date().getTime().toString().substring(0, 10)}`
  orderForm.productName = ''
  orderForm.category = ''
  orderForm.price = 0
  orderForm.buyer = ''
  orderForm.contact = ''
  orderForm.payMethod = ''
  orderForm.deliveryMethod = '自动发货'
  orderForm.status = '待付款'
  orderForm.accountInfo = ''
  orderForm.remark = ''
  dialogVisible.value = true
}

// 查看
const handleView = (row: any) => {
  ElMessageBox.alert(
    `<div class="order-detail">
      <h3>订单详情</h3>
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
          <span class="label">价格：</span>
          <span class="price">¥${row.price}</span>
        </div>
        <div class="detail-item">
          <span class="label">发货方式：</span>
          <span><el-tag size="small" :type="row.deliveryMethod === '自动发货' ? 'success' : 'info'">${row.deliveryMethod}</el-tag></span>
        </div>
      </div>
      
      <h4>买家信息</h4>
      <div class="detail-section">
        <div class="detail-item">
          <span class="label">买家：</span>
          <span>${row.buyer}</span>
        </div>
        <div class="detail-item">
          <span class="label">联系方式：</span>
          <span>${row.contact || '无'}</span>
        </div>
        <div class="detail-item">
          <span class="label">支付方式：</span>
          <span><el-tag size="small" effect="plain" :type="getPayMethodTag(row.payMethod)">${row.payMethod}</el-tag></span>
        </div>
      </div>
      
      ${row.accountInfo ? `
      <h4>账号信息</h4>
      <div class="detail-section">
        <div class="detail-item account-info">
          <pre>${row.accountInfo}</pre>
        </div>
      </div>
      ` : ''}
      
      ${row.remark ? `
      <h4>备注</h4>
      <div class="detail-section">
        <div class="detail-item">
          <pre>${row.remark}</pre>
        </div>
      </div>
      ` : ''}
    </div>`,
    '订单详情',
    {
      dangerouslyUseHTMLString: true,
      confirmButtonText: '关闭',
      customClass: 'order-detail-dialog'
    }
  )
}

// 编辑
const handleEdit = (row: any) => {
  dialogType.value = 'edit'
  orderForm.id = row.id
  orderForm.orderId = row.orderId
  orderForm.productName = row.productName
  orderForm.category = row.category
  orderForm.price = parseFloat(row.price.replace('¥', ''))
  orderForm.buyer = row.buyer
  orderForm.contact = row.contact || ''
  orderForm.payMethod = row.payMethod
  orderForm.deliveryMethod = row.deliveryMethod
  orderForm.status = row.status
  orderForm.accountInfo = row.accountInfo || ''
  orderForm.remark = row.remark || ''
  dialogVisible.value = true
}

// 发货
const handleDeliver = (row: any) => {
  deliverForm.id = row.id
  deliverForm.orderId = row.orderId
  deliverForm.productName = row.productName
  deliverForm.buyer = row.buyer
  deliverForm.accountInfo = ''
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

// 提交订单表单
const submitForm = async () => {
  if (!orderFormRef.value) return
  
  await orderFormRef.value.validate((valid, fields) => {
    if (valid) {
      if (dialogType.value === 'add') {
        ElMessage.success('新增订单成功')
      } else {
        ElMessage.success('编辑订单成功')
      }
      dialogVisible.value = false
    } else {
      console.log('表单验证失败', fields)
    }
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
        order.accountInfo = deliverForm.accountInfo
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