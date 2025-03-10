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
        <el-table-column label="批发价" width="120">
          <template #default="scope">
            <el-popover
              placement="top"
              :width="200"
              trigger="hover"
              v-if="scope.row.wholesalePrices && scope.row.wholesalePrices.length > 0"
            >
              <template #default>
                <div class="wholesale-popover">
                  <div class="wholesale-popover-title">批发价格设置</div>
                  <div class="wholesale-popover-item" v-for="(item, index) in scope.row.wholesalePrices" :key="index">
                    <span class="wholesale-popover-quantity">≥{{ item.quantity }}</span>
                    <span class="wholesale-popover-price">¥{{ item.price.toFixed(2) }}</span>
                  </div>
                </div>
              </template>
              <template #reference>
                <el-tag type="warning" effect="plain">查看批发价</el-tag>
              </template>
            </el-popover>
            <span v-else class="no-data">无批发价</span>
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
        
        <!-- 批发价设置 -->
        <el-form-item label="批发价设置">
          <el-card shadow="never" class="wholesale-card">
            <template #header>
              <div class="wholesale-header">
                <div class="wholesale-header-left">
                  <span class="wholesale-title">批发价格区间设置</span>
                  <el-tooltip content="设置不同数量区间的批发价格，客户购买数量达到要求时将自动享受优惠" placement="top">
                    <el-icon class="wholesale-help-icon"><QuestionFilled /></el-icon>
                  </el-tooltip>
                </div>
                <el-button type="primary" size="small" @click.prevent="addWholesalePrice">
                  <el-icon><Plus /></el-icon>添加区间
                </el-button>
              </div>
            </template>
            
            <!-- 批发价说明 -->
            <div class="wholesale-description" v-if="productForm.wholesalePrices && productForm.wholesalePrices.length > 0">
              <el-alert
                type="info"
                :closable="false"
                show-icon
              >
                <template #title>
                  <span>当前单价: <span class="current-price-text">¥{{ productForm.currentPrice.toFixed(2) }}</span></span>
                </template>
                <template #default>
                  <p class="wholesale-tip">设置批发价格区间，当客户购买数量达到要求时将自动享受优惠价格。请确保批发价低于单价，且数量越多价格越优惠。</p>
                </template>
              </el-alert>
            </div>
            
            <!-- 批发价表格 -->
            <div v-if="productForm.wholesalePrices && productForm.wholesalePrices.length > 0" class="wholesale-table-container">
              <el-table :data="productForm.wholesalePrices" border stripe size="small" class="wholesale-table">
                <el-table-column label="序号" type="index" width="60" align="center"></el-table-column>
                <el-table-column label="起批数量" width="180">
                  <template #default="scope">
                    <div class="wholesale-input-group">
                      <span class="wholesale-prefix">≥</span>
                      <el-input-number 
                        v-model="scope.row.quantity" 
                        :min="1" 
                        :precision="0" 
                        size="small"
                        class="wholesale-quantity-input"
                        placeholder="数量"
                        controls-position="right"
                        @change="validateWholesalePrices"
                      ></el-input-number>
                      <span class="wholesale-unit">件</span>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="批发单价" width="180">
                  <template #default="scope">
                    <div class="wholesale-input-group">
                      <span class="wholesale-prefix">¥</span>
                      <el-input-number 
                        v-model="scope.row.price" 
                        :min="0.01" 
                        :precision="2" 
                        :step="0.01" 
                        size="small"
                        class="wholesale-price-input"
                        placeholder="价格"
                        controls-position="right"
                        @change="validateWholesalePrices"
                      ></el-input-number>
                      <span class="wholesale-unit">/件</span>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="优惠" width="120">
                  <template #default="scope">
                    <span class="discount-text" :class="{'discount-invalid': scope.row.price >= productForm.currentPrice}">
                      {{ calculateDiscount(scope.row.price) }}
                    </span>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="100" align="center">
                  <template #default="scope">
                    <el-button 
                      type="danger" 
                      size="small" 
                      circle 
                      @click="removeWholesalePrice(scope.$index)"
                      class="wholesale-delete"
                    >
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
              
              <!-- 批发价预览 -->
              <div class="wholesale-preview">
                <div class="wholesale-preview-title">批发价格预览</div>
                <div class="wholesale-preview-content">
                  <el-tag 
                    v-for="(item, index) in sortedWholesalePrices" 
                    :key="index"
                    size="large" 
                    type="danger" 
                    effect="plain" 
                    class="wholesale-preview-tag"
                  >
                    ≥{{ item.quantity }}/¥{{ item.price.toFixed(2) }}
                  </el-tag>
                </div>
              </div>
            </div>
            
            <!-- 空状态 -->
            <div v-else class="wholesale-empty">
              <el-empty description="暂无批发价设置" :image-size="60">
                <template #description>
                  <p>设置批发价可以鼓励客户批量购买，提高销售额</p>
                </template>
                <el-button type="primary" @click.prevent="addWholesalePrice">
                  <el-icon><Plus /></el-icon>添加批发价区间
                </el-button>
              </el-empty>
            </div>
          </el-card>
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
        <el-form-item label="商品详情" prop="description">
          <div class="editor-container">
            <div class="editor-toolbar">
              <el-button type="primary" size="small" @click="insertTemplate">插入默认模板</el-button>
              <el-dropdown @command="handleTemplateSelect" trigger="click">
                <el-button size="small" type="success">
                  选择模板 <el-icon class="el-icon--right"><arrow-down /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item v-for="template in templateList" :key="template.id" :command="template">
                      {{ template.name }}
                      <el-tag v-if="template.category" size="small" style="margin-left: 5px;">{{ template.category }}</el-tag>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
              <el-button size="small" @click="previewContent">预览效果</el-button>
              <el-button size="small" type="info" plain @click="goToTemplateSettings">
                <el-icon><setting /></el-icon>
                管理模板
              </el-button>
            </div>
            <QuillEditor
              v-model:content="productForm.description"
              contentType="html"
              theme="snow"
              toolbar="full"
              :options="editorOptions"
              style="height: 400px"
            />
          </div>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="productForm.statusBool"></el-switch>
          <span class="status-text">{{ productForm.statusBool ? '上架' : '下架' }}</span>
        </el-form-item>
      </el-form>
      
      <!-- 预览对话框 -->
      <el-dialog
        v-model="previewVisible"
        title="内容预览"
        width="70%"
        destroy-on-close
      >
        <div class="preview-container" v-html="productForm.description"></div>
      </el-dialog>
      
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
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Delete, QuestionFilled, Plus, Setting, ArrowDown } from '@element-plus/icons-vue'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import { useRouter } from 'vue-router'

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
    createTime: '2024-03-01 10:00:00',
    wholesalePrices: [
      { quantity: 10, price: 3.90 },
      { quantity: 50, price: 3.70 },
      { quantity: 100, price: 3.50 }
    ]
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
    createTime: '2024-03-02 09:30:00',
    wholesalePrices: [
      { quantity: 10, price: 2.50 },
      { quantity: 50, price: 2.30 },
      { quantity: 100, price: 2.00 }
    ]
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
    createTime: '2024-03-03 09:00:00',
    wholesalePrices: [
      { quantity: 10, price: 5.20 },
      { quantity: 50, price: 5.00 },
      { quantity: 100, price: 4.80 }
    ]
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
    createTime: '2024-03-04 08:30:00',
    wholesalePrices: [
      { quantity: 10, price: 7.35 },
      { quantity: 50, price: 7.05 },
      { quantity: 100, price: 6.75 }
    ]
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
  feature: '',
  currentPrice: 0,
  originalPrice: 0,
  stock: 0,
  deliveryMethod: '自动发货',
  specialNote: '',
  description: '',
  statusBool: true,
  wholesalePrices: [] as { quantity: number; price: number }[]
})

// 确保productForm.wholesalePrices始终是一个数组
watch(() => productForm, () => {
  if (!Array.isArray(productForm.wholesalePrices)) {
    productForm.wholesalePrices = [];
  }
}, { deep: true, immediate: true });

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
    { required: true, message: '请输入商品详情', trigger: 'blur' }
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
  // 构建批发价格HTML
  let wholesalePricesHtml = '<div class="no-wholesale">暂无批发价设置</div>'
  if (row.wholesalePrices && row.wholesalePrices.length > 0) {
    wholesalePricesHtml = '<div class="wholesale-list">'
    row.wholesalePrices.forEach((item: any) => {
      wholesalePricesHtml += `
        <div class="wholesale-view-item">
          <span class="wholesale-badge">≥${item.quantity}</span>
          <span class="wholesale-price">¥${item.price.toFixed(2)}</span>
        </div>
      `
    })
    wholesalePricesHtml += '</div>'
  }

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
        <span class="label">批发价格：</span>
        ${wholesalePricesHtml}
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
  productForm.statusBool = true
  productForm.wholesalePrices = []
  dialogVisible.value = true
  
  // 确保初始化后wholesalePrices是一个数组
  console.log('新增商品初始化wholesalePrices:', productForm.wholesalePrices);
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
  productForm.statusBool = row.statusBool
  
  // 处理批发价格
  if (row.wholesalePrices && Array.isArray(row.wholesalePrices)) {
    productForm.wholesalePrices = [...row.wholesalePrices]
  } else {
    productForm.wholesalePrices = []
  }
  
  dialogVisible.value = true
  
  // 确保初始化后wholesalePrices是一个数组
  console.log('编辑商品初始化wholesalePrices:', productForm.wholesalePrices);
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

// 富文本编辑器相关
const previewVisible = ref(false)
const editorOptions = {
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'header': 1 }, { 'header': 2 }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'script': 'sub' }, { 'script': 'super' }],
      [{ 'indent': '-1' }, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['clean'],
      ['link', 'image']
    ]
  },
  placeholder: '请输入商品详情...'
}

// 模板相关
const router = useRouter()
const templateList = ref([
  {
    id: 1,
    name: '通用商品模板',
    category: '',
    content: `
<h2>商品介绍</h2>
<p>这是一个高质量的账号，具有以下特点...</p>

<h2>账号规格</h2>
<ul>
  <li>账号类型：\${category}</li>
  <li>注册时间：\${feature}</li>
  <li>特殊功能：\${specialNote}</li>
</ul>

<h2>使用说明</h2>
<ol>
  <li>购买成功后，系统将自动发送账号信息到您的邮箱</li>
  <li>收到账号后请立即修改密码</li>
  <li>请勿在账号中存储重要个人信息</li>
  <li>如有登录问题，请及时联系客服</li>
</ol>

<h2>售后说明</h2>
<p>1. 售后保障期：自购买之日起30天内</p>
<p>2. 售后范围：账号无法登录、功能与描述不符</p>
<p>3. 售后流程：请通过"我的订单"-"申请售后"提交申请</p>
<p>4. 不支持售后的情况：</p>
<ul>
  <li>超出保障期的账号问题</li>
  <li>因用户操作不当导致的账号问题</li>
  <li>账号被用于违规用途</li>
</ul>

<h2>免责声明</h2>
<p>1. 本平台仅提供账号交易服务，不对账号的后续使用负责</p>
<p>2. 请遵守相关法律法规和平台规则使用账号</p>
<p>3. 禁止将账号用于任何违法违规活动</p>
<p>4. 平台保留对违规用户追究法律责任的权利</p>
`
  },
  {
    id: 2,
    name: 'Gmail邮箱模板',
    category: '谷歌邮箱',
    content: `
<h2>Gmail邮箱介绍</h2>
<p>Gmail是Google提供的免费电子邮件服务，以下是使用Gmail账号的基本说明...</p>

<h2>账号规格</h2>
<ul>
  <li>账号类型：谷歌邮箱</li>
  <li>注册时间：\${feature}</li>
  <li>特殊功能：\${specialNote}</li>
</ul>

<h2>使用说明</h2>
<ol>
  <li>购买成功后，系统将自动发送账号信息到您的邮箱</li>
  <li>收到账号后请立即修改密码</li>
  <li>请勿在账号中存储重要个人信息</li>
  <li>如有登录问题，请及时联系客服</li>
</ol>

<h2>登录步骤</h2>
<ol>
  <li>访问 https://mail.google.com</li>
  <li>输入您购买的Gmail账号</li>
  <li>输入对应的密码</li>
  <li>如果提示需要验证，请按照提示完成验证步骤</li>
</ol>

<h2>售后说明</h2>
<p>本店所售Gmail账号均为稳定可用账号，购买后7天内提供更换服务。</p>

<h2>免责声明</h2>
<p>请勿将账号用于非法用途，账号被封禁概不负责。</p>
`
  },
  {
    id: 3,
    name: '社交媒体账号模板',
    category: 'Instagram账号',
    content: `
<h2>社交媒体账号介绍</h2>
<p>这是一个高质量的社交媒体账号，具有以下特点...</p>

<h2>账号规格</h2>
<ul>
  <li>账号类型：\${category}</li>
  <li>账号年龄：\${feature}</li>
  <li>特殊功能：\${specialNote}</li>
</ul>

<h2>使用说明</h2>
<ol>
  <li>购买成功后，系统将自动发送账号信息到您的邮箱</li>
  <li>收到账号后请立即修改密码和邮箱</li>
  <li>请勿在账号中存储重要个人信息</li>
  <li>如有登录问题，请及时联系客服</li>
</ol>

<h2>注意事项</h2>
<ul>
  <li>请勿短时间内频繁登录或修改账号信息，以免触发安全机制</li>
  <li>建议使用代理IP登录，避免账号异常</li>
  <li>请勿发布违规内容，以免账号被封</li>
</ul>

<h2>售后说明</h2>
<p>本店所售社交媒体账号均为真实账号，购买后3天内提供更换服务。</p>

<h2>免责声明</h2>
<p>请勿将账号用于非法用途，账号被封禁概不负责。</p>
`
  }
])

// 预览内容
const previewContent = () => {
  previewVisible.value = true
}

// 插入默认模板
const insertTemplate = () => {
  const defaultTemplate = templateList.value.find(t => t.id === 1) || templateList.value[0]
  if (defaultTemplate) {
    applyTemplate(defaultTemplate)
  }
}

// 处理模板选择
const handleTemplateSelect = (template: any) => {
  applyTemplate(template)
}

// 应用模板
const applyTemplate = (template: any) => {
  // 替换模板中的变量
  let content = template.content
  content = content.replace(/\${category}/g, productForm.category || '无')
  content = content.replace(/\${feature}/g, productForm.feature || '无')
  content = content.replace(/\${specialNote}/g, productForm.specialNote || '无')
  
  // 设置商品描述
  productForm.description = content
  
  ElMessage.success(`已应用"${template.name}"模板`)
}

// 跳转到模板设置页面
const goToTemplateSettings = () => {
  router.push('/templates')
}

// 添加批发价
const addWholesalePrice = () => {
  // 设置默认值为当前价格的95%
  const defaultPrice = productForm.currentPrice > 0 ? 
    Math.round(productForm.currentPrice * 0.95 * 100) / 100 : 0;
  
  // 设置默认数量为10或者比最大数量多10
  let defaultQuantity = 10;
  if (productForm.wholesalePrices && productForm.wholesalePrices.length > 0) {
    const maxQuantity = Math.max(...productForm.wholesalePrices.map(item => item.quantity));
    defaultQuantity = maxQuantity + 10;
  }
  
  // 确保wholesalePrices是一个数组
  if (!Array.isArray(productForm.wholesalePrices)) {
    productForm.wholesalePrices = [];
  }
  
  productForm.wholesalePrices.push({ 
    quantity: defaultQuantity, 
    price: defaultPrice 
  });
  
  // 验证并排序批发价
  validateWholesalePrices();
  
  // 添加调试信息
  console.log('添加批发价区间', productForm.wholesalePrices);
  
  // 显示成功提示
  ElMessage.success('已添加新的批发价区间');
}

// 移除批发价
const removeWholesalePrice = (index: number) => {
  productForm.wholesalePrices.splice(index, 1);
}

// 验证批发价格设置
const validateWholesalePrices = () => {
  // 确保wholesalePrices是一个数组
  if (!Array.isArray(productForm.wholesalePrices)) {
    productForm.wholesalePrices = [];
    return;
  }
  
  // 过滤掉无效的批发价（数量或价格为0的）
  productForm.wholesalePrices = productForm.wholesalePrices.filter(
    item => item && item.quantity > 0 && item.price > 0
  );
  
  // 检查是否有重复的数量
  const quantities = productForm.wholesalePrices.map(item => item.quantity);
  const hasDuplicates = quantities.length !== new Set(quantities).size;
  
  if (hasDuplicates) {
    ElMessage.warning('批发价设置中存在重复的数量，请修正');
  }
  
  // 检查是否有批发价高于单价的情况
  const hasInvalidPrice = productForm.wholesalePrices.some(
    item => item.price >= productForm.currentPrice
  );
  
  if (hasInvalidPrice && productForm.currentPrice > 0) {
    ElMessage.warning('批发价应低于商品单价，请修正');
  }
  
  // 按数量从小到大排序
  productForm.wholesalePrices.sort((a, b) => a.quantity - b.quantity);
  
  // 检查是否符合数量越多价格越低的原则
  let isValid = true;
  for (let i = 1; i < productForm.wholesalePrices.length; i++) {
    if (productForm.wholesalePrices[i].price > productForm.wholesalePrices[i-1].price) {
      isValid = false;
      break;
    }
  }
  
  if (!isValid) {
    ElMessage.warning('批发价应遵循"数量越多价格越低"的原则，请修正');
  }
}

// 计算折扣
const calculateDiscount = (price: number) => {
  if (!price || price <= 0) return '无折扣';
  if (!productForm.currentPrice || productForm.currentPrice <= 0) return '无折扣';
  
  if (price >= productForm.currentPrice) {
    return '无折扣';
  }
  
  const discount = (price / productForm.currentPrice * 10).toFixed(1);
  return `${discount}折`;
}

// 排序后的批发价格，用于预览
const sortedWholesalePrices = computed(() => {
  if (!productForm.wholesalePrices || !Array.isArray(productForm.wholesalePrices) || productForm.wholesalePrices.length === 0) {
    return [];
  }
  
  return [...productForm.wholesalePrices]
    .filter(item => item && item.quantity > 0 && item.price > 0)
    .sort((a, b) => a.quantity - b.quantity);
});

// 监听当前价格变化，提示用户检查批发价
watch(() => productForm.currentPrice, (newVal) => {
  if (newVal > 0 && productForm.wholesalePrices && productForm.wholesalePrices.length > 0) {
    const hasInvalidPrice = productForm.wholesalePrices.some(item => item.price >= newVal);
    if (hasInvalidPrice) {
      ElMessage.warning('当前价格已变更，请检查批发价设置');
    }
  }
});

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
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
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
  margin-left: 10px;
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
  gap: 5px;
}

.action-buttons .el-button {
  margin-left: 0 !important;
  margin-right: 0 !important;
}

/* 富文本编辑器样式 */
.editor-container {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}

.editor-toolbar {
  padding: 8px;
  border-bottom: 1px solid #dcdfe6;
  background-color: #f5f7fa;
  display: flex;
  gap: 10px;
}

.preview-container {
  padding: 20px;
  max-height: 600px;
  overflow-y: auto;
  background-color: #fff;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

/* 商品详情预览样式 */
:deep(.preview-container h2),
:deep(.ql-editor h2) {
  margin-top: 20px;
  margin-bottom: 10px;
  padding-bottom: 5px;
  border-bottom: 1px solid #ebeef5;
  color: #303133;
}

:deep(.preview-container ul),
:deep(.preview-container ol),
:deep(.ql-editor ul),
:deep(.ql-editor ol) {
  padding-left: 20px;
  margin-bottom: 15px;
}

:deep(.preview-container li),
:deep(.ql-editor li) {
  margin-bottom: 5px;
}

:deep(.preview-container p),
:deep(.ql-editor p) {
  margin-bottom: 10px;
  line-height: 1.6;
}

/* 批发价设置样式 */
.wholesale-card {
  margin-bottom: 20px;
}

.wholesale-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.wholesale-header-left {
  display: flex;
  align-items: center;
}

.wholesale-title {
  font-weight: bold;
  font-size: 14px;
}

.wholesale-help-icon {
  margin-left: 5px;
  color: #909399;
  cursor: help;
}

.wholesale-description {
  margin-bottom: 15px;
}

.current-price-text {
  color: #f56c6c;
  font-weight: bold;
}

.wholesale-tip {
  margin: 5px 0 0;
  font-size: 12px;
  color: #606266;
  line-height: 1.5;
}

.wholesale-table-container {
  margin-bottom: 15px;
}

.wholesale-table {
  margin-bottom: 15px;
}

.wholesale-input-group {
  display: flex;
  align-items: center;
}

.wholesale-prefix {
  margin-right: 5px;
  color: #606266;
  font-size: 14px;
  font-weight: bold;
}

.wholesale-quantity-input,
.wholesale-price-input {
  width: 100px;
}

.wholesale-unit {
  margin-left: 5px;
  color: #606266;
  font-size: 12px;
}

.discount-text {
  color: #67c23a;
  font-weight: bold;
}

.discount-invalid {
  color: #f56c6c;
}

.wholesale-preview {
  background-color: #f5f7fa;
  border-radius: 4px;
  padding: 15px;
  margin-top: 15px;
}

.wholesale-preview-title {
  font-weight: bold;
  margin-bottom: 15px;
  color: #303133;
  font-size: 14px;
}

.wholesale-preview-content {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.wholesale-preview-tag {
  font-size: 14px;
  padding: 6px 12px;
  border-radius: 4px;
  font-weight: bold;
  background-color: #fff1f0;
  border-color: #ffa39e;
  color: #f5222d;
}

/* 移除不再使用的样式 */
.wholesale-preview-price,
.wholesale-preview-discount {
  display: none;
}

.wholesale-empty {
  padding: 20px 0;
  text-align: center;
}

/* 批发价格查看样式 */
:deep(.wholesale-list) {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 5px;
}

:deep(.wholesale-view-item) {
  display: flex;
  align-items: center;
  background-color: #f5f7fa;
  border-radius: 4px;
  padding: 5px 10px;
}

:deep(.wholesale-badge) {
  font-weight: bold;
  margin-right: 5px;
}

:deep(.wholesale-price) {
  color: #f56c6c;
}

:deep(.no-wholesale) {
  color: #909399;
  font-style: italic;
}

/* 批发价格弹出框样式 */
.wholesale-popover {
  padding: 5px 0;
}

.wholesale-popover-title {
  font-weight: bold;
  margin-bottom: 10px;
  padding-bottom: 5px;
  border-bottom: 1px solid #ebeef5;
  color: #303133;
}

.wholesale-popover-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  padding: 5px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.wholesale-popover-quantity {
  font-weight: bold;
}

.wholesale-popover-price {
  color: #f56c6c;
}

.no-data {
  color: #909399;
  font-size: 12px;
}
</style> 