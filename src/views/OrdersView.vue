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
            <span>筛选结果总金额：</span>
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
            <el-tag :type="getCategoryTag(scope.row.category)">{{ scope.row.category }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="originalPrice" label="线上价格" width="100">
          <template #default="scope">
            <span class="original-price">{{ scope.row.originalPrice }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="purchasePrice" label="购买价格（折后）" width="130">
          <template #default="scope">
            <span class="purchase-price">{{ scope.row.purchasePrice }}</span>
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
            <span class="value price">¥{{ refundForm.refundAmount.toFixed(2) }}</span>
          </div>
          <div class="info-item">
            <span class="label">申请时间：</span>
            <span class="value">{{ refundForm.refundTime || '未知' }}</span>
          </div>
          <div class="info-item full-width">
            <span class="label">退款说明：</span>
            <span class="value">{{ refundForm.refundRemark || '无' }}</span>
          </div>
        </div>
      </div>
      
      <div class="refund-section">
        <h4>审核信息</h4>
        <el-form :model="refundForm" label-width="84px" :rules="refundRules" ref="refundFormRef">
          <el-form-item label="审核结果" prop="approved" required>
            <el-radio-group v-model="refundForm.approved">
              <el-radio :label="true">同意退款</el-radio>
              <el-radio :label="false">拒绝退款</el-radio>
            </el-radio-group>
            <div class="form-tip warning" v-if="refundForm.approved === false">
              <el-icon><Warning /></el-icon>
              <span>拒绝退款后将无法撤销，请谨慎操作</span>
            </div>
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
  userEmail: '',
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
  { label: 'Instagram账号-高粉丝', value: 'Instagram账号-高粉丝', price: 399.99 },
  { label: 'Twitter账号', value: 'Twitter账号', price: 49.99 },
  { label: 'Twitter账号-已认证', value: 'Twitter账号-已认证', price: 599.99 },
  { label: 'Facebook账号', value: 'Facebook账号', price: 59.99 },
  { label: 'Facebook账号-商业版', value: 'Facebook账号-商业版', price: 199.99 },
  { label: 'Discord账号', value: 'Discord账号', price: 39.99 },
  { label: 'ChatGPT账号', value: 'ChatGPT账号', price: 199.99 },
  { label: 'ChatGPT账号-高级版', value: 'ChatGPT账号-高级版', price: 299.99 },
  { label: '微软邮箱账号', value: '微软邮箱账号', price: 25.00 },
  { label: '其他账号-Steam', value: '其他账号-Steam', price: 79.99 }
]

// 表格数据类型定义
interface RefundInfo {
  refundAmount: number;
  refundRemark: string;
  refundTime: string;
}

interface OrderItem {
  id: string;
  orderId: string;
  productName: string;
  category: string;
  quantity: number;
  originalPrice: string;
  purchasePrice: string;
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
}

// 表格数据
const orderList = ref<OrderItem[]>([{
    id: 'S001001',
    orderId: 'SO20230901001',
    productName: '谷歌邮箱账号',
    category: '谷歌邮箱',
    quantity: 1,
    originalPrice: '¥120.00',
    purchasePrice: '¥99.00',
    totalPrice: '¥99.00',
    fee: '¥2.00',
    cardId: 'C001',
    cardInfo: 'example@gmail.com',
    userEmail: 'buyer1@example.com',
    payMethod: 'usdt',
    deliveryMethod: '自动发货',
    status: '已完成',
    createTime: '2023-09-01 10:00:00',
    refundInfo: null
  },
  {
    id: 'S001002',
    orderId: 'SO20230901002',
    productName: 'Instagram账号',
    category: 'Instagram账号',
    quantity: 1,
    originalPrice: '¥220.00',
    purchasePrice: '¥199.00',
    totalPrice: '¥199.00',
    fee: '¥3.00',
    cardId: 'C002',
    cardInfo: 'instagram_user123',
    userEmail: 'buyer2@example.com',
    payMethod: 'usdt',
    deliveryMethod: '手动发货',
    status: '待发货',
    createTime: '2023-09-01 11:00:00',
    refundInfo: null
  },
  {
    id: 'S000007',
    orderId: 'DD20240315007', 
    productName: 'ChatGPT账号', 
    category: 'ChatGPT账号',
    quantity: 1,
    originalPrice: '¥249.99',
    purchasePrice: '¥199.99',
    totalPrice: '¥199.99',
    fee: '¥0.00',
    cardId: 'C000007',
    cardInfo: 'chatgpt@example.com|password789',
    userEmail: 'user777@example.com',
    payMethod: 'usdt',
    deliveryMethod: '自动发货',
    status: '已完成',
    remark: '账号无法正常使用',
    createTime: '2024-03-15 18:30:00',
    refundInfo: null
  },
  {
    id: 'S000001',
    orderId: 'DD20240315001', 
    productName: 'Gmail邮箱-稳定可用', 
    category: '谷歌邮箱',
    quantity: 1,
    originalPrice: '¥5.50',
    purchasePrice: '¥4.20',
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
    refundInfo: null
  },
  {
    id: 'S000002',
    orderId: 'DD20240315002', 
    productName: 'Gmail邮箱-1月以上', 
    category: '谷歌邮箱',
    quantity: 1,
    originalPrice: '¥6.50',
    purchasePrice: '¥5.50',
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
    refundInfo: null
  },
  {
    id: 'S000003',
    orderId: 'DD20240315003', 
    productName: 'Instagram账号', 
    category: 'Instagram账号',
    quantity: 1,
    originalPrice: '¥49.99',
    purchasePrice: '¥39.99',
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
    refundInfo: null
  },
  {
    id: 'S000004',
    orderId: 'DD20240315004', 
    productName: 'Gmail邮箱-美国稳定', 
    category: '谷歌邮箱',
    quantity: 2,
    originalPrice: '¥12.00',
    purchasePrice: '¥10.00',
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
    refundInfo: null
  },
  {
    id: 'S000005',
    orderId: 'DD20240315005', 
    productName: 'Twitter账号', 
    category: 'Twitter账号',
    quantity: 1,
    originalPrice: '¥59.99',
    purchasePrice: '¥49.99',
    totalPrice: '¥49.99',
    fee: '¥0.00',
    cardId: 'C000003',
    cardInfo: 'twitter@example.com|password789',
    userEmail: 'user202@example.com',
    payMethod: 'usdt',
    deliveryMethod: '手动发货',
    status: '已完成',
    remark: '客户申请退款',
    createTime: '2024-03-15 09:15:00',
    refundInfo: {
      refundAmount: 49.99,
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
    originalPrice: '¥8.50',
    purchasePrice: '¥7.50',
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
  },
  // 新增各种情况的订单数据
  {
    id: 'S000008',
    orderId: 'DD20240316001', 
    productName: 'Facebook账号', 
    category: 'Facebook账号',
    quantity: 1,
    originalPrice: '¥69.99',
    purchasePrice: '¥59.99',
    totalPrice: '¥59.99',
    fee: '¥1.50',
    cardId: 'C000008',
    cardInfo: 'facebook@example.com|fb123456',
    userEmail: 'user888@example.com',
    payMethod: 'other',
    deliveryMethod: '自动发货',
    status: '已完成',
    remark: '客户需要美国地区的账号',
    createTime: '2024-03-16 08:15:00',
    refundInfo: null
  },
  {
    id: 'S000009',
    orderId: 'DD20240316002', 
    productName: 'Discord账号', 
    category: 'Discord账号',
    quantity: 2,
    originalPrice: '¥45.99',
    purchasePrice: '¥39.99',
    totalPrice: '¥79.98',
    fee: '¥2.00',
    cardId: 'C000009',
    cardInfo: 'discord1@example.com|dis123\ndiscord2@example.com|dis456',
    userEmail: 'user999@example.com',
    payMethod: 'usdt',
    deliveryMethod: '自动发货',
    status: '已完成',
    remark: '客户申请退款但不符合条件',
    createTime: '2024-03-16 09:30:00',
    refundInfo: {
      refundAmount: 79.98,
      refundRemark: '客户表示不再需要此账号，但已超过退款期限',
      refundTime: '2024-03-16 10:45:00'
    }
  },
  {
    id: 'S000010',
    orderId: 'DD20240316003', 
    productName: '微软邮箱账号', 
    category: '微软邮箱',
    quantity: 5,
    originalPrice: '¥30.00',
    purchasePrice: '¥25.00',
    totalPrice: '¥125.00',
    fee: '¥3.50',
    cardId: 'C000010',
    cardInfo: '多个账号信息，请联系客服获取',
    userEmail: 'business@company.com',
    payMethod: 'other',
    deliveryMethod: '手动发货',
    status: '已完成',
    remark: '企业批量采购',
    createTime: '2024-03-16 11:20:00',
    refundInfo: null
  },
  {
    id: 'S000011',
    orderId: 'DD20240316004', 
    productName: 'ChatGPT账号-高级版', 
    category: 'ChatGPT账号',
    quantity: 1,
    originalPrice: '¥349.99',
    purchasePrice: '¥299.99',
    totalPrice: '¥299.99',
    fee: '¥5.00',
    cardId: '',
    cardInfo: '',
    userEmail: 'premium@example.com',
    payMethod: 'usdt',
    deliveryMethod: '手动发货',
    status: '已完成',
    remark: '客户主动取消订单',
    createTime: '2024-03-16 13:45:00',
    refundInfo: null
  },
  {
    id: 'S000012',
    orderId: 'DD20240316005', 
    productName: 'Gmail邮箱-一年以上', 
    category: '谷歌邮箱',
    quantity: 10,
    originalPrice: '¥15.00',
    purchasePrice: '¥12.00',
    totalPrice: '¥120.00',
    fee: '¥0.00',
    cardId: 'C000012',
    cardInfo: '批量账号，详情见附件',
    userEmail: 'wholesale@example.com',
    payMethod: 'usdt',
    deliveryMethod: '自动发货',
    status: '已完成',
    remark: '批发客户，享受折扣',
    createTime: '2024-03-16 15:30:00',
    refundInfo: null
  },
  {
    id: 'S000013',
    orderId: 'DD20240316006', 
    productName: 'Instagram账号-高粉丝', 
    category: 'Instagram账号',
    quantity: 1,
    originalPrice: '¥499.99',
    purchasePrice: '¥399.99',
    totalPrice: '¥399.99',
    fee: '¥10.00',
    cardId: 'C000013',
    cardInfo: 'instagram_premium@example.com|ins789xyz',
    userEmail: 'influencer@example.com',
    payMethod: 'other',
    deliveryMethod: '手动发货',
    status: '待发货',
    remark: '特殊账号，需人工审核',
    createTime: '2024-03-16 16:45:00',
    refundInfo: null
  },
  {
    id: 'S000014',
    orderId: 'DD20240316007', 
    productName: 'Twitter账号-已认证', 
    category: 'Twitter账号',
    quantity: 1,
    originalPrice: '¥699.99',
    purchasePrice: '¥599.99',
    totalPrice: '¥599.99',
    fee: '¥15.00',
    cardId: '',
    cardInfo: '',
    userEmail: 'verified@example.com',
    payMethod: 'usdt',
    deliveryMethod: '手动发货',
    status: '待付款',
    remark: '高级认证账号',
    createTime: '2024-03-16 17:30:00',
    refundInfo: null
  },
  {
    id: 'S000015',
    orderId: 'DD20240316008', 
    productName: '其他账号-Steam', 
    category: '其他账号',
    quantity: 2,
    originalPrice: '¥89.99',
    purchasePrice: '¥79.99',
    totalPrice: '¥159.98',
    fee: '¥4.00',
    cardId: 'C000015',
    cardInfo: 'steam1@example.com|steam123\nsteam2@example.com|steam456',
    userEmail: 'gamer@example.com',
    payMethod: 'other',
    deliveryMethod: '自动发货',
    status: '已完成',
    remark: '游戏账号',
    createTime: '2024-03-16 18:15:00',
    refundInfo: null
  },
  {
    id: 'S000016',
    orderId: 'DD20240316009', 
    productName: 'Gmail邮箱-美国稳定', 
    category: '谷歌邮箱',
    quantity: 1,
    originalPrice: '¥12.00',
    purchasePrice: '¥10.00',
    totalPrice: '¥10.00',
    fee: '¥0.00',
    cardId: 'C000016',
    cardInfo: 'gmail_us@example.com|gmailUS123',
    userEmail: 'overseas@example.com',
    payMethod: 'usdt',
    deliveryMethod: '自动发货',
    status: '已完成',
    remark: '客户称账号无法登录',
    createTime: '2024-03-16 19:30:00',
    refundInfo: {
      refundAmount: 10.00,
      refundRemark: '账号无法登录，提示安全验证',
      refundTime: '2024-03-16 20:45:00'
    }
  },
  {
    id: 'S000017',
    orderId: 'DD20240316010', 
    productName: 'Facebook账号-商业版', 
    category: 'Facebook账号',
    quantity: 1,
    originalPrice: '¥249.99',
    purchasePrice: '¥199.99',
    totalPrice: '¥199.99',
    fee: '¥5.00',
    cardId: 'C000017',
    cardInfo: 'fb_business@example.com|fbBiz789',
    userEmail: 'marketing@example.com',
    payMethod: 'other',
    deliveryMethod: '手动发货',
    status: '已完成',
    remark: '商业账号，含广告权限',
    createTime: '2024-03-16 21:00:00',
    refundInfo: null
  }
])

// 添加一个新的变量来存储所有订单数据
const allOrderList = ref<OrderItem[]>([])

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

// 初始化allOrderList
onMounted(() => {
  allOrderList.value = [...orderList.value]
  handleSearch()
})

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

// 添加总金额计算
const showTotalAmount = ref(false)
const totalAmount = computed(() => {
  return filteredOrderList.value.reduce((sum, order) => {
    const price = parseFloat(order.totalPrice.replace('¥', ''))
    return sum + price
  }, 0)
})

// 多选相关
const multipleSelection = ref<OrderItem[]>([])
const selectedTotalAmount = computed(() => {
  return multipleSelection.value.reduce((sum, order) => {
    const price = parseFloat(order.totalPrice.replace('¥', ''))
    return sum + price
  }, 0)
})

// 判断是否有可提款的订单
const hasWithdrawableOrders = computed(() => {
  return filteredOrderList.value.some(order => 
    order.status === '已完成' && 
    order.withdrawalStatus === 'not_withdrawn'
  )
})

// 处理表格选择变化
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
  let csvContent = '订单号,商品名称,商品分类,数量,总价,手续费,用户邮箱,支付方式,发货方式,订单状态,创建时间\n'
  
  multipleSelection.value.forEach(order => {
    csvContent += `"${order.orderId}","${order.productName}","${order.category}",${order.quantity},"${order.totalPrice}","${order.fee || '¥0.00'}","${order.userEmail}","${order.payMethod === 'usdt' ? 'USDT' : '其他方式'}","${order.deliveryMethod}","${order.status}","${order.createTime}"\n`
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
  refundRemark: '',
  refundTime: '',
  approved: true // 审核结果，默认为通过
})

// 退款表单验证规则
const refundRules = reactive<FormRules>({
  refundAmount: [
    { required: true, message: '请输入退款金额', trigger: 'blur' }
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
    case '已取消':
      return 'info'
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
  searchForm.dateRange = []
  showTotalAmount.value = false
  
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
        order.status = '已完成'
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
  
  refundForm.approved = true
  refundDialogVisible.value = true
}

// 提交审核结果
const submitRefund = async () => {
  if (!refundFormRef.value) return
  
  await refundFormRef.value.validate((valid, fields) => {
    if (valid) {
      // 获取订单
      const index = orderList.value.findIndex(item => item.id === refundForm.id)
      if (index !== -1) {
        // 根据审核结果更新订单状态
        if (refundForm.approved) {
          orderList.value[index].status = '已完成'
          ElMessage.success(`订单 ${refundForm.orderId} 的退款申请已通过`)
        } else {
          orderList.value[index].status = '已完成'
          ElMessage.info(`订单 ${refundForm.orderId} 的退款申请已拒绝`)
        }
      }
      
      refundDialogVisible.value = false
    } else {
      console.log('表单验证失败', fields)
    }
  })
}

// 添加导出所有订单的方法
const exportAllOrders = () => {
  // 导出所有订单
  if (allOrderList.value.length === 0) {
    ElMessage.warning('没有可导出的订单数据')
    return
  }
  
  // 创建CSV内容
  let csvContent = '订单号,商品名称,商品分类,数量,总价,手续费,用户邮箱,支付方式,发货方式,订单状态,创建时间\n'
  
  allOrderList.value.forEach(order => {
    csvContent += `"${order.orderId}","${order.productName}","${order.category}",${order.quantity},"${order.totalPrice}","${order.fee || '¥0.00'}","${order.userEmail}","${order.payMethod === 'usdt' ? 'USDT' : '其他方式'}","${order.deliveryMethod}","${order.status}","${order.createTime}"\n`
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
  padding: 0 5px;
}

.card-header span {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.header-buttons {
  display: flex;
  gap: 10px;
}

.header-buttons .el-button + .el-button {
  margin-left: 0;
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

.original-price {
  color: #909399;
  text-decoration: line-through;
}

.purchase-price {
  color: #67c23a;
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

/* 退款审核弹窗样式优化 */
:deep(.refund-dialog) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.refund-dialog .el-dialog__header) {
  background-color: #f8f9fa;
  padding: 16px 24px;
  margin: 0;
  border-bottom: 1px solid #e4e7ed;
}

:deep(.refund-dialog .el-dialog__title) {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

:deep(.refund-dialog .el-dialog__body) {
  padding: 24px;
}

:deep(.refund-dialog .el-dialog__footer) {
  padding: 16px 24px;
  background-color: #f8f9fa;
  border-top: 1px solid #e4e7ed;
  margin-top: 0;
}

:deep(.refund-section) {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

:deep(.refund-section:last-child) {
  margin-bottom: 0;
}

:deep(.refund-section h4) {
  font-size: 16px;
  color: #303133;
  margin: 0 0 16px;
  padding-left: 10px;
  border-left: 3px solid #409EFF;
  line-height: 1.2;
}

:deep(.info-grid) {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

:deep(.info-item) {
  display: flex;
  align-items: flex-start;
}

:deep(.info-item.full-width) {
  grid-column: span 2;
}

:deep(.info-item .label) {
  color: #606266;
  min-width: 80px;
  font-weight: 500;
}

:deep(.info-item .value) {
  color: #303133;
  flex: 1;
  word-break: break-all;
}

:deep(.info-item .value.price) {
  color: #f56c6c;
  font-weight: 600;
}

:deep(.form-tip.warning) {
  margin-top: 8px;
  color: #E6A23C;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 4px;
}

:deep(.dialog-footer) {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
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
  padding: 12px 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.total-amount {
  font-size: 14px;
  color: #606266;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 5px;
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
  gap: 10px;
}

.action-btns .el-button + .el-button {
  margin-left: 0;
}

/* 添加表格选中行的样式 */
:deep(.el-table .el-table__row.selected-row) {
  background-color: #f0f9eb;
}

:deep(.el-table .el-checkbox.is-checked .el-checkbox__inner) {
  background-color: #67c23a;
  border-color: #67c23a;
}
</style>