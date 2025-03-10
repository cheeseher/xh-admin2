<template>
  <div class="products-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>商品管理</span>
          <el-button type="primary" size="small" @click="handleAddProduct">新增商品</el-button>
        </div>
      </template>
      
      <div class="page-description">
        <p>管理所有邮箱账号和社交媒体账号商品，包括Gmail、微软邮箱、Instagram、Twitter、Facebook等账号。您可以添加、编辑、删除商品，并设置商品的价格、库存、发货方式等信息。</p>
      </div>
      
      <!-- 搜索区域 -->
      <div class="search-area">
        <el-form :inline="true" :model="searchForm" class="demo-form-inline">
          <el-form-item label="商品名称">
            <el-input v-model="searchForm.name" placeholder="请输入商品名称" clearable></el-input>
          </el-form-item>
          <el-form-item label="商品分类">
            <el-select v-model="searchForm.category" placeholder="请选择" clearable style="width: 168px;">
              <el-option label="全部" value=""></el-option>
              <el-option label="谷歌邮箱" value="gmail"></el-option>
              <el-option label="微软邮箱" value="microsoft"></el-option>
              <el-option label="Instagram账号" value="instagram"></el-option>
              <el-option label="Twitter账号" value="twitter"></el-option>
              <el-option label="Facebook账号" value="facebook"></el-option>
              <el-option label="其他账号" value="other"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="价格区间">
            <el-input-number v-model="searchForm.minPrice" :min="0" placeholder="最低价" class="price-input"></el-input-number>
            <span class="price-separator">-</span>
            <el-input-number v-model="searchForm.maxPrice" :min="0" placeholder="最高价" class="price-input"></el-input-number>
          </el-form-item>
          <el-form-item label="发货方式">
            <el-select v-model="searchForm.deliveryMethod" placeholder="请选择" clearable style="width: 168px;">
              <el-option label="全部" value=""></el-option>
              <el-option label="自动发货" value="auto"></el-option>
              <el-option label="手动发货" value="manual"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 168px;">
              <el-option label="全部" value=""></el-option>
              <el-option label="上架中" value="on"></el-option>
              <el-option label="已下架" value="off"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <!-- 表格区域 -->
      <el-table :data="tableData" style="width: 100%" v-loading="loading" border stripe>
        <el-table-column type="index" label="序号" width="60"></el-table-column>
        <el-table-column prop="name" label="商品名称" min-width="180"></el-table-column>
        <el-table-column prop="category" label="商品分类" width="100">
          <template #default="scope">
            <el-tag :type="getCategoryTag(scope.row.category)">{{ scope.row.category }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="价格" width="120">
          <template #default="scope">
            <div class="price-container">
              <span class="current-price">¥{{ scope.row.currentPrice }}</span>
              <span class="original-price" v-if="scope.row.originalPrice">¥{{ scope.row.originalPrice }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="80">
          <template #default="scope">
            <span :class="{ 'low-stock': scope.row.stock < 50 }">{{ scope.row.stock }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="sales" label="销量" width="80"></el-table-column>
        <el-table-column prop="deliveryMethod" label="发货方式" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.deliveryMethod === '自动发货' ? 'success' : 'info'">
              {{ scope.row.deliveryMethod }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="feature" label="商品特性" width="120">
          <template #default="scope">
            <el-tag v-if="scope.row.feature" size="small" effect="plain">{{ scope.row.feature }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="specialNote" label="特殊说明" width="120">
          <template #default="scope">
            <el-tooltip 
              v-if="scope.row.specialNote" 
              :content="scope.row.specialNote" 
              placement="top" 
              :show-after="500"
            >
              <el-tag size="small" type="warning" effect="plain">查看说明</el-tag>
            </el-tooltip>
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
            <span class="status-text">{{ scope.row.statusBool ? '上架中' : '已下架' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180"></el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <el-button size="small" @click="handleView(scope.row)">查看</el-button>
              <el-button size="small" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
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
    
    <!-- 商品表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增商品' : '编辑商品'"
      width="650px"
    >
      <el-form :model="productForm" label-width="100px" :rules="rules" ref="productFormRef">
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="productForm.name" placeholder="请输入商品名称"></el-input>
        </el-form-item>
        <el-form-item label="商品分类" prop="category">
          <el-select v-model="productForm.category" placeholder="请选择商品分类" style="width: 100%;">
            <el-option label="谷歌邮箱" value="谷歌邮箱"></el-option>
            <el-option label="微软邮箱" value="微软邮箱"></el-option>
            <el-option label="Instagram账号" value="Instagram账号"></el-option>
            <el-option label="Twitter账号" value="Twitter账号"></el-option>
            <el-option label="Facebook账号" value="Facebook账号"></el-option>
            <el-option label="Discord账号" value="Discord账号"></el-option>
            <el-option label="ChatGPT账号" value="ChatGPT账号"></el-option>
            <el-option label="雅虎邮箱" value="雅虎邮箱"></el-option>
            <el-option label="GMX邮箱" value="GMX邮箱"></el-option>
            <el-option label="TikTok账号" value="TikTok账号"></el-option>
            <el-option label="美国AOL邮箱" value="美国AOL邮箱"></el-option>
            <el-option label="ProtonMail邮箱" value="ProtonMail邮箱"></el-option>
            <el-option label="其他账号" value="其他账号"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="商品特性" prop="feature">
          <el-select v-model="productForm.feature" placeholder="请选择商品特性" style="width: 100%;">
            <el-option label="稳定可用" value="稳定可用"></el-option>
            <el-option label="1个月以上" value="1个月以上"></el-option>
            <el-option label="半年以上" value="半年以上"></el-option>
            <el-option label="一年以上" value="一年以上"></el-option>
            <el-option label="美国地区" value="美国地区"></el-option>
            <el-option label="老号" value="老号"></el-option>
            <el-option label="新号" value="新号"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="当前价格" prop="currentPrice">
          <el-input-number v-model="productForm.currentPrice" :min="0" :precision="2" :step="0.01" style="width: 100%;"></el-input-number>
        </el-form-item>
        <el-form-item label="原价" prop="originalPrice">
          <el-input-number v-model="productForm.originalPrice" :min="0" :precision="2" :step="0.01" style="width: 100%;"></el-input-number>
        </el-form-item>
        <el-form-item label="库存" prop="stock">
          <el-input-number v-model="productForm.stock" :min="0" style="width: 100%;"></el-input-number>
        </el-form-item>
        <el-form-item label="发货方式" prop="deliveryMethod">
          <el-radio-group v-model="productForm.deliveryMethod">
            <el-radio label="自动发货">自动发货</el-radio>
            <el-radio label="手动发货">手动发货</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="特殊说明" prop="specialNote">
          <el-input v-model="productForm.specialNote" placeholder="例如：支持自定义密码、支持换绑手机等"></el-input>
        </el-form-item>
        <el-form-item label="商品描述" prop="description">
          <el-input v-model="productForm.description" type="textarea" :rows="4" placeholder="请输入商品描述"></el-input>
        </el-form-item>
        <el-form-item label="使用说明" prop="instructions">
          <el-input v-model="productForm.instructions" type="textarea" :rows="4" placeholder="请输入使用说明，如登录步骤、注意事项等"></el-input>
        </el-form-item>
        <el-form-item label="售后说明" prop="afterSaleInfo">
          <el-input v-model="productForm.afterSaleInfo" type="textarea" :rows="3" placeholder="请输入售后说明，如保障时间、换号政策等"></el-input>
        </el-form-item>
        <el-form-item label="免责声明" prop="disclaimer">
          <el-input v-model="productForm.disclaimer" type="textarea" :rows="3" placeholder="请输入免责声明"></el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="productForm.statusBool"></el-switch>
          <span class="status-text">{{ productForm.statusBool ? '上架' : '下架' }}</span>
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
  name: '',
  category: '',
  minPrice: null as number | null,
  maxPrice: null as number | null,
  deliveryMethod: '',
  status: ''
})

// 表格数据
const tableData = ref([
  { 
    id: 1,
    name: 'Gmail邮箱-稳定可用 (手工)', 
    category: '谷歌邮箱',
    currentPrice: 4.20,
    originalPrice: 6.50,
    stock: 384,
    sales: 368,
    deliveryMethod: '手动发货',
    feature: '稳定可用',
    specialNote: '支持自定义密码，支持换绑手机',
    description: 'Gmail是Google提供的免费电子邮件服务，以下是使用Gmail账号的基本说明...',
    instructions: '登录步骤：\n1. 访问 https://mail.google.com\n2. 输入您购买的Gmail账号\n3. 输入对应的密码\n4. 如果提示需要验证，请按照提示完成验证步骤',
    afterSaleInfo: '本店所售Gmail账号均为稳定可用账号，购买后7天内提供更换服务。',
    disclaimer: '请勿将账号用于非法用途，账号被封禁概不负责。',
    status: '上架中',
    statusBool: true,
    createTime: '2024-03-01 10:00:00' 
  },
  { 
    id: 2,
    name: 'Gmail邮箱-稳定可用', 
    category: '谷歌邮箱',
    currentPrice: 2.75,
    originalPrice: 4.00,
    stock: 575,
    sales: 292,
    deliveryMethod: '自动发货',
    feature: '稳定可用',
    specialNote: '支持自定义密码',
    description: 'Gmail是Google提供的免费电子邮件服务，以下是使用Gmail账号的基本说明...',
    instructions: '登录步骤：\n1. 访问 https://mail.google.com\n2. 输入您购买的Gmail账号\n3. 输入对应的密码\n4. 如果提示需要验证，请按照提示完成验证步骤',
    afterSaleInfo: '本店所售Gmail账号均为稳定可用账号，购买后3天内提供更换服务。',
    disclaimer: '请勿将账号用于非法用途，账号被封禁概不负责。',
    status: '上架中',
    statusBool: true,
    createTime: '2024-03-02 09:30:00' 
  },
  { 
    id: 3,
    name: 'Gmail邮箱-1月以上', 
    category: '谷歌邮箱',
    currentPrice: 5.50,
    originalPrice: 8.00,
    stock: 23,
    sales: 256,
    deliveryMethod: '自动发货',
    feature: '1个月以上',
    specialNote: '支持自定义密码，支持换绑手机',
    description: 'Gmail是Google提供的免费电子邮件服务，以下是使用Gmail账号的基本说明...',
    instructions: '登录步骤：\n1. 访问 https://mail.google.com\n2. 输入您购买的Gmail账号\n3. 输入对应的密码\n4. 如果提示需要验证，请按照提示完成验证步骤',
    afterSaleInfo: '本店所售Gmail账号均为稳定可用账号，购买后15天内提供更换服务。',
    disclaimer: '请勿将账号用于非法用途，账号被封禁概不负责。',
    status: '上架中',
    statusBool: true,
    createTime: '2024-03-03 09:00:00' 
  },
  { 
    id: 4,
    name: 'Gmail邮箱-半年以上', 
    category: '谷歌邮箱',
    currentPrice: 7.50,
    originalPrice: 12.00,
    stock: 740,
    sales: 198,
    deliveryMethod: '自动发货',
    feature: '半年以上',
    status: '上架中',
    statusBool: true,
    createTime: '2024-03-04 08:30:00' 
  },
  { 
    id: 5,
    name: 'Gmail邮箱-美国稳定', 
    category: '谷歌邮箱',
    currentPrice: 10.00,
    originalPrice: 18.00,
    stock: 1060,
    sales: 165,
    deliveryMethod: '自动发货',
    feature: '美国地区',
    status: '上架中',
    statusBool: true,
    createTime: '2024-03-05 08:00:00' 
  },
  { 
    id: 6,
    name: 'Gmail邮箱-一年以上', 
    category: '谷歌邮箱',
    currentPrice: 12.00,
    originalPrice: 15.00,
    stock: 872,
    sales: 142,
    deliveryMethod: '自动发货',
    feature: '一年以上',
    status: '上架中',
    statusBool: true,
    createTime: '2024-03-06 08:00:00' 
  },
  { 
    id: 7,
    name: 'Gmail美国老号 (6个月+)', 
    category: '谷歌邮箱',
    currentPrice: 16.88,
    originalPrice: 30.00,
    stock: 138,
    sales: 98,
    deliveryMethod: '自动发货',
    feature: '老号',
    status: '上架中',
    statusBool: true,
    createTime: '2024-03-07 08:00:00' 
  },
  { 
    id: 8,
    name: '2022年老号账号-谷歌邮箱', 
    category: '谷歌邮箱',
    currentPrice: 14.00,
    originalPrice: 20.00,
    stock: 52,
    sales: 76,
    deliveryMethod: '自动发货',
    feature: '老号',
    status: '上架中',
    statusBool: true,
    createTime: '2024-03-08 08:00:00' 
  }
])

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)

// 对话框相关
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const productFormRef = ref<FormInstance>()
const productForm = reactive({
  id: 0,
  name: '',
  category: '',
  currentPrice: 0,
  originalPrice: 0,
  stock: 0,
  sales: 0,
  deliveryMethod: '自动发货',
  feature: '',
  specialNote: '',
  description: '',
  instructions: '',
  afterSaleInfo: '',
  disclaimer: '',
  statusBool: true
})

// 表单验证规则
const rules = reactive<FormRules>({
  name: [
    { required: true, message: '请输入商品名称', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择商品分类', trigger: 'change' }
  ],
  currentPrice: [
    { required: true, message: '请输入当前价格', trigger: 'blur' }
  ],
  stock: [
    { required: true, message: '请输入库存', trigger: 'blur' }
  ],
  deliveryMethod: [
    { required: true, message: '请选择发货方式', trigger: 'change' }
  ],
  description: [
    { required: true, message: '请输入商品描述', trigger: 'blur' }
  ],
  instructions: [
    { required: true, message: '请输入使用说明', trigger: 'blur' }
  ]
})

// 获取商品分类对应的标签类型
const getCategoryTag = (category: string) => {
  const categoryMap: Record<string, string> = {
    '谷歌邮箱': 'danger',
    '微软邮箱': 'success',
    'Instagram账号': 'warning',
    'Twitter账号': 'info',
    'Facebook账号': 'primary'
  }
  return categoryMap[category] || 'info'
}

// 获取商品列表数据
const getProductList = () => {
  // 模拟API请求
  loading.value = true
  setTimeout(() => {
    // 根据搜索条件和分页参数获取数据
    const filteredData = tableData.value.filter((item: any) => {
      // 商品名称筛选
      if (searchForm.name && !item.name.includes(searchForm.name)) {
        return false
      }
      // 商品分类筛选
      if (searchForm.category) {
        if (searchForm.category === 'gmail' && item.category !== '谷歌邮箱') {
          return false
        }
        if (searchForm.category === 'microsoft' && item.category !== '微软邮箱') {
          return false
        }
        if (searchForm.category === 'instagram' && item.category !== 'Instagram账号') {
          return false
        }
        if (searchForm.category === 'twitter' && item.category !== 'Twitter账号') {
          return false
        }
        if (searchForm.category === 'facebook' && item.category !== 'Facebook账号') {
          return false
        }
        if (searchForm.category === 'other' && ['谷歌邮箱', '微软邮箱', 'Instagram账号', 'Twitter账号', 'Facebook账号'].includes(item.category)) {
          return false
        }
      }
      // 价格范围筛选
      if (searchForm.minPrice !== null && item.currentPrice < searchForm.minPrice) {
        return false
      }
      if (searchForm.maxPrice !== null && item.currentPrice > searchForm.maxPrice) {
        return false
      }
      // 发货方式筛选
      if (searchForm.deliveryMethod && item.deliveryMethod !== searchForm.deliveryMethod) {
        return false
      }
      // 状态筛选
      if (searchForm.status) {
        if (searchForm.status === 'on' && item.status !== '上架中') {
          return false
        }
        if (searchForm.status === 'off' && item.status !== '已下架') {
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

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  getProductList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.name = ''
  searchForm.category = ''
  searchForm.minPrice = null
  searchForm.maxPrice = null
  searchForm.deliveryMethod = ''
  searchForm.status = ''
  currentPage.value = 1
  getProductList()
}

// 状态变更
const handleStatusChange = (val: boolean, row: any) => {
  const statusText = val ? '上架' : '下架'
  ElMessage.success(`商品"${row.name}"已${statusText}`)
  row.status = val ? '上架中' : '已下架'
}

// 查看商品
const handleView = (row: any) => {
  ElMessageBox.alert(
    `<div class="product-detail">
      <h3>${row.name}</h3>
      <div class="detail-item">
        <span class="label">商品分类：</span>
        <span>${row.category}</span>
      </div>
      <div class="detail-item">
        <span class="label">商品特性：</span>
        <span>${row.feature || '无'}</span>
      </div>
      <div class="detail-item">
        <span class="label">价格：</span>
        <span class="price">¥${row.currentPrice}</span>
        ${row.originalPrice ? `<span class="original-price">¥${row.originalPrice}</span>` : ''}
      </div>
      <div class="detail-item">
        <span class="label">库存：</span>
        <span>${row.stock}</span>
      </div>
      <div class="detail-item">
        <span class="label">销量：</span>
        <span>${row.sales}</span>
      </div>
      <div class="detail-item">
        <span class="label">发货方式：</span>
        <span>${row.deliveryMethod}</span>
      </div>
      <div class="detail-item">
        <span class="label">特殊说明：</span>
        <span>${row.specialNote || '无'}</span>
      </div>
      <div class="detail-item">
        <span class="label">商品描述：</span>
        <div class="detail-content">${row.description || '无'}</div>
      </div>
      <div class="detail-item">
        <span class="label">使用说明：</span>
        <div class="detail-content">${row.instructions ? row.instructions.replace(/\n/g, '<br>') : '无'}</div>
      </div>
      <div class="detail-item">
        <span class="label">售后说明：</span>
        <div class="detail-content">${row.afterSaleInfo || '无'}</div>
      </div>
      <div class="detail-item">
        <span class="label">免责声明：</span>
        <div class="detail-content">${row.disclaimer || '无'}</div>
      </div>
      <div class="detail-item">
        <span class="label">创建时间：</span>
        <span>${row.createTime}</span>
      </div>
    </div>`,
    '商品详情',
    {
      dangerouslyUseHTMLString: true,
      confirmButtonText: '关闭'
    }
  )
}

// 新增商品
const handleAddProduct = () => {
  dialogType.value = 'add'
  productForm.id = 0
  productForm.name = ''
  productForm.category = ''
  productForm.currentPrice = 0
  productForm.originalPrice = 0
  productForm.stock = 0
  productForm.deliveryMethod = '自动发货'
  productForm.feature = ''
  productForm.specialNote = ''
  productForm.description = ''
  productForm.instructions = ''
  productForm.afterSaleInfo = ''
  productForm.disclaimer = ''
  productForm.statusBool = true
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: any) => {
  dialogType.value = 'edit'
  productForm.id = row.id
  productForm.name = row.name
  productForm.category = row.category
  productForm.currentPrice = row.currentPrice
  productForm.originalPrice = row.originalPrice
  productForm.stock = row.stock
  productForm.deliveryMethod = row.deliveryMethod
  productForm.feature = row.feature
  productForm.specialNote = row.specialNote || ''
  productForm.description = row.description || ''
  productForm.instructions = row.instructions || ''
  productForm.afterSaleInfo = row.afterSaleInfo || ''
  productForm.disclaimer = row.disclaimer || ''
  productForm.statusBool = row.statusBool
  dialogVisible.value = true
}

// 删除
const handleDelete = (row: any) => {
  ElMessageBox.confirm(
    `确定要删除商品"${row.name}"吗？`,
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
        message: `商品"${row.name}"已删除`,
      })
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '已取消删除',
      })
    })
}

// 提交表单
const submitForm = async () => {
  if (!productFormRef.value) return
  
  await productFormRef.value.validate((valid, fields) => {
    if (valid) {
      if (dialogType.value === 'add') {
        ElMessage.success('新增商品成功')
      } else {
        ElMessage.success('编辑商品成功')
      }
      dialogVisible.value = false
    } else {
      console.log('表单验证失败', fields)
    }
  })
}

// 处理每页显示数量变化
const handleSizeChange = (val: number) => {
  pageSize.value = val
  getProductList()
}

// 处理页码变化
const handleCurrentChange = (val: number) => {
  currentPage.value = val
  getProductList()
}

// 监听搜索表单变化，重置分页并重新获取数据
watch([() => searchForm.name, () => searchForm.category, () => searchForm.minPrice, 
       () => searchForm.maxPrice, () => searchForm.deliveryMethod, () => searchForm.status], () => {
  currentPage.value = 1
  getProductList()
})

// 初始化
onMounted(() => {
  getProductList()
})
</script>

<style scoped>
.products-container {
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

.price-input {
  width: 120px;
}

.price-separator {
  margin: 0 5px;
}

.price-container {
  display: flex;
  flex-direction: column;
}

.current-price {
  color: #f56c6c;
  font-weight: bold;
}

.original-price {
  color: #909399;
  font-size: 12px;
  text-decoration: line-through;
}

.low-stock {
  color: #f56c6c;
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

:deep(.product-detail) {
  font-size: 14px;
  line-height: 1.8;
}

:deep(.product-detail h3) {
  margin-top: 0;
  margin-bottom: 15px;
  color: #303133;
  font-size: 18px;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 10px;
}

:deep(.detail-item) {
  margin-bottom: 10px;
}

:deep(.detail-item .label) {
  font-weight: bold;
  color: #606266;
  display: inline-block;
  width: 80px;
}

:deep(.detail-item .price) {
  color: #f56c6c;
  font-weight: bold;
}

:deep(.detail-item .original-price) {
  color: #909399;
  font-size: 12px;
  text-decoration: line-through;
  margin-left: 5px;
}

:deep(.detail-content) {
  margin-top: 5px;
  padding-left: 80px;
  white-space: pre-line;
}

:deep(.el-message-box__wrapper .el-message-box) {
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