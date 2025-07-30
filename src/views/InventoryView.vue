<template>
  <div class="inventory-view">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>库存管理</span>
          <div class="header-buttons">
            <el-button type="primary" @click="handleAddBatch">
              <el-icon><Plus /></el-icon>
              新增批次
            </el-button>
            <el-button @click="handleImportBatch">
              <el-icon><Upload /></el-icon>
              批量导入
            </el-button>
          </div>
        </div>
      </template>
      
      <div class="page-description">
        <p>管理所有商品的库存信息，包括批次管理、库存状态、成本价等。您可以添加、编辑、删除库存批次，并进行库存调整操作。</p>
      </div>
      
      <!-- 搜索区域 -->
      <el-card shadow="never" class="filter-card-wrapper">
        <div class="search-area">
          <el-form :inline="true" :model="searchForm" class="demo-form-inline">
            <el-form-item label="批次ID">
              <el-input v-model="searchForm.batchId" placeholder="请输入批次ID" clearable></el-input>
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
            <el-form-item label="商品名称">
              <el-select v-model="searchForm.productId" placeholder="请选择" clearable style="width: 168px;">
                <el-option label="全部" value=""></el-option>
                <el-option v-for="item in productOptions" :key="item.id" :label="item.name" :value="item.id"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="库存状态">
              <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 168px;">
                <el-option label="全部" value=""></el-option>
                <el-option label="正常" value="normal"></el-option>
                <el-option label="已售罄" value="sold_out"></el-option>
                <el-option label="已禁用" value="disabled"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="创建时间">
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
          
          <!-- 添加统计信息 -->
          <div class="search-summary">
            <div class="total-amount">
              <span>总批次数：</span>
              <span class="amount-value" style="color: #409EFF;">{{ totalBatches }}</span>
              <span style="margin-left: 20px;">总库存数：</span>
              <span class="amount-value" style="color: #67C23A;">{{ totalInventory }}</span>
              <span style="margin-left: 20px;">已售出：</span>
              <span class="amount-value" style="color: #E6A23C;">{{ totalSold }}</span>
              <span style="margin-left: 20px;">剩余库存：</span>
              <span class="amount-value" style="color: #303133;">{{ totalRemaining }}</span>
              <span style="margin-left: 20px;">总成本：</span>
              <span class="amount-value" style="color: #F56C6C;">¥{{ totalCost.toFixed(2) }}</span>
            </div>
            <div class="action-btns">
              <el-button type="success" @click="exportInventory" :disabled="multipleSelection.length === 0">
                <el-icon><Download /></el-icon>
                导出选中批次
              </el-button>
            </div>
          </div>
        </div>
      </el-card>
      
      <!-- 表格区域 -->
      <el-card shadow="never" class="table-card-wrapper">
        <div class="table-area-wrapper">
          <el-table 
            :data="filteredInventoryList" 
            style="width: 100%" 
            v-loading="loading" 
            border 
            stripe
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="55"></el-table-column>
            <el-table-column prop="id" label="批次ID" width="120"></el-table-column>
            <el-table-column prop="productName" label="商品名称" min-width="180"></el-table-column>
            <el-table-column prop="category" label="商品分类" width="120">
              <template #default="scope">
                {{ scope.row.category }}
              </template>
            </el-table-column>
            <el-table-column prop="totalCount" label="总数量" width="100"></el-table-column>
            <el-table-column prop="soldCount" label="已售出" width="100"></el-table-column>
            <el-table-column prop="remainingCount" label="剩余" width="100">
              <template #default="scope">
                <span :class="{ 'low-stock': scope.row.remainingCount < 10 }">
                  {{ scope.row.remainingCount }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="costPrice" label="成本价" width="120">
              <template #default="scope">
                <span>¥{{ scope.row.costPrice.toFixed(2) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="totalCost" label="总成本" width="120">
              <template #default="scope">
                <span>¥{{ (scope.row.costPrice * scope.row.totalCount).toFixed(2) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)">{{ getStatusLabel(scope.row.status) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间" width="180"></el-table-column>
            <el-table-column prop="remark" label="备注" min-width="120" show-overflow-tooltip></el-table-column>
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="scope">
                <el-button link type="primary" @click="handleViewDetails(scope.row)">
                  <el-icon><View /></el-icon>
                </el-button>
                <el-button link type="primary" @click="handleEditBatch(scope.row)">
                  <el-icon><Edit /></el-icon>
                </el-button>
                <el-button link type="danger" @click="handleDeleteBatch(scope.row)" :disabled="scope.row.soldCount > 0">
                  <el-icon><Delete /></el-icon>
                </el-button>
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
    
    <!-- 新增/编辑批次对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="batchDialogVisible"
      width="600px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form :model="batchForm" label-width="100px" :rules="batchRules" ref="batchFormRef">
        <el-form-item label="商品名称" prop="productId">
          <el-select v-model="batchForm.productId" placeholder="请选择商品" style="width: 100%;">
            <el-option v-for="item in productOptions" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="批次数量" prop="totalCount">
          <el-input-number v-model="batchForm.totalCount" :min="1" style="width: 100%;"></el-input-number>
        </el-form-item>
        <el-form-item label="成本价" prop="costPrice">
          <el-input-number v-model="batchForm.costPrice" :precision="2" :step="0.1" :min="0" style="width: 100%;"></el-input-number>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="batchForm.status" placeholder="请选择状态" style="width: 100%;">
            <el-option label="正常" value="normal"></el-option>
            <el-option label="已禁用" value="disabled"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="batchForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          ></el-input>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="batchDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitBatchForm">确认</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 批次详情抽屉 -->
    <el-drawer
      v-model="detailsDrawerVisible"
      title="批次详情"
      size="60%"
      :destroy-on-close="true"
    >
      <template v-if="currentBatch">
        <div class="batch-details">
          <div class="batch-header">
            <div class="batch-title">
              <h3>{{ currentBatch.productName }}</h3>
              <el-tag :type="getStatusType(currentBatch.status)">{{ getStatusLabel(currentBatch.status) }}</el-tag>
            </div>
            <div class="batch-info">
              <div class="info-item">
                <span class="label">批次ID：</span>
                <span class="value">{{ currentBatch.id }}</span>
              </div>
              <div class="info-item">
                <span class="label">创建时间：</span>
                <span class="value">{{ currentBatch.createTime }}</span>
              </div>
              <div class="info-item">
                <span class="label">商品分类：</span>
                <span class="value">{{ currentBatch.category }}</span>
              </div>
            </div>
          </div>

          <el-divider />

          <div class="batch-stats">
            <el-row :gutter="20">
              <el-col :span="6">
                <div class="stat-card">
                  <div class="stat-title">总数量</div>
                  <div class="stat-value">{{ currentBatch.totalCount }}</div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="stat-card">
                  <div class="stat-title">已售出</div>
                  <div class="stat-value">{{ currentBatch.soldCount }}</div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="stat-card">
                  <div class="stat-title">剩余</div>
                  <div class="stat-value" :class="{ 'low-stock': currentBatch.remainingCount < 10 }">
                    {{ currentBatch.remainingCount }}
                  </div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="stat-card">
                  <div class="stat-title">成本价</div>
                  <div class="stat-value">¥{{ currentBatch.costPrice.toFixed(2) }}</div>
                </div>
              </el-col>
            </el-row>
          </div>

          <el-divider />

          <div class="batch-actions">
            <el-button type="primary" @click="handleEditCostPrice">
              <el-icon><Edit /></el-icon>
              修改成本价
            </el-button>
            <el-button type="success" @click="handleExportBatchItems">
              <el-icon><Download /></el-icon>
              导出库存项
            </el-button>
            <el-button type="warning" @click="handleAdjustInventory">
              <el-icon><Setting /></el-icon>
              库存调整
            </el-button>
          </div>

          <el-divider />

          <div class="batch-items">
            <div class="section-title">
              <h4>库存项列表</h4>
              <div class="section-actions">
                <el-input
                  v-model="itemSearchKeyword"
                  placeholder="搜索库存项"
                  prefix-icon="Search"
                  style="width: 200px"
                  clearable
                />
                <el-select v-model="itemStatusFilter" placeholder="状态筛选" style="width: 120px" clearable>
                  <el-option label="全部" value=""></el-option>
                  <el-option label="可用" value="available"></el-option>
                  <el-option label="已售出" value="sold"></el-option>
                  <el-option label="已禁用" value="disabled"></el-option>
                </el-select>
              </div>
            </div>

            <el-table
              :data="filteredBatchItems"
              style="width: 100%"
              border
              stripe
              height="400"
            >
              <el-table-column prop="id" label="ID" width="80"></el-table-column>
              <el-table-column prop="content" label="账号内容" min-width="250">
                <template #default="scope">
                  <div class="content-wrapper">
                    <el-input
                      v-if="scope.row.status === 'available'"
                      type="password"
                      v-model="scope.row.content"
                      readonly
                      show-password
                    ></el-input>
                    <span v-else>{{ scope.row.status === 'sold' ? '已售出' : '已禁用' }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="100">
                <template #default="scope">
                  <el-tag :type="getItemStatusType(scope.row.status)">
                    {{ getItemStatusLabel(scope.row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="orderId" label="关联订单" width="180">
                <template #default="scope">
                  <el-link v-if="scope.row.orderId" type="primary" :underline="false">
                    {{ scope.row.orderId }}
                  </el-link>
                  <span v-else>-</span>
                </template>
              </el-table-column>
              <el-table-column prop="soldTime" label="售出时间" width="180">
                <template #default="scope">
                  <span v-if="scope.row.soldTime">{{ scope.row.soldTime }}</span>
                  <span v-else>-</span>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="120" fixed="right">
                <template #default="scope">
                  <el-button 
                    v-if="scope.row.status === 'available'"
                    link 
                    type="primary" 
                    @click="handleViewItemContent(scope.row)"
                  >
                    查看
                  </el-button>
                  <el-button 
                    v-if="scope.row.status === 'available'"
                    link 
                    type="danger" 
                    @click="handleDisableItem(scope.row)"
                  >
                    禁用
                  </el-button>
                </template>
              </el-table-column>
            </el-table>

            <div class="pagination-container">
              <el-pagination
                v-model:current-page="itemsCurrentPage"
                v-model:page-size="itemsPageSize"
                :page-sizes="[10, 20, 50, 100]"
                layout="total, sizes, prev, pager, next, jumper"
                :total="filteredBatchItems.length"
                @size-change="handleItemsSizeChange"
                @current-change="handleItemsCurrentChange"
                :background="true"
              ></el-pagination>
            </div>
          </div>
        </div>
      </template>
    </el-drawer>

    <!-- 修改成本价对话框 -->
    <el-dialog
      title="修改成本价"
      v-model="costPriceDialogVisible"
      width="500px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form :model="costPriceForm" label-width="100px" :rules="costPriceRules" ref="costPriceFormRef">
        <el-form-item label="批次ID">
          <el-input v-model="costPriceForm.batchId" disabled></el-input>
        </el-form-item>
        <el-form-item label="商品名称">
          <el-input v-model="costPriceForm.productName" disabled></el-input>
        </el-form-item>
        <el-form-item label="当前成本价">
          <el-input v-model="costPriceForm.currentPrice" disabled>
            <template #prepend>¥</template>
          </el-input>
        </el-form-item>
        <el-form-item label="新成本价" prop="newPrice">
          <el-input-number v-model="costPriceForm.newPrice" :precision="2" :step="0.1" :min="0" style="width: 100%;"></el-input-number>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="costPriceForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入修改原因"
          ></el-input>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="costPriceDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitCostPriceForm">确认</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 库存调整对话框 -->
    <el-dialog
      title="库存调整"
      v-model="adjustInventoryDialogVisible"
      width="500px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form :model="adjustInventoryForm" label-width="100px" :rules="adjustInventoryRules" ref="adjustInventoryFormRef">
        <el-form-item label="批次ID">
          <el-input v-model="adjustInventoryForm.batchId" disabled></el-input>
        </el-form-item>
        <el-form-item label="商品名称">
          <el-input v-model="adjustInventoryForm.productName" disabled></el-input>
        </el-form-item>
        <el-form-item label="当前剩余">
          <el-input v-model="adjustInventoryForm.currentRemaining" disabled></el-input>
        </el-form-item>
        <el-form-item label="调整类型" prop="adjustType">
          <el-radio-group v-model="adjustInventoryForm.adjustType">
            <el-radio label="add">增加</el-radio>
            <el-radio label="reduce">减少</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="调整数量" prop="adjustCount">
          <el-input-number 
            v-model="adjustInventoryForm.adjustCount" 
            :min="1" 
            :max="adjustInventoryForm.adjustType === 'reduce' ? adjustInventoryForm.currentRemaining : 999999" 
            style="width: 100%;"
          ></el-input-number>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="adjustInventoryForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入调整原因"
          ></el-input>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="adjustInventoryDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitAdjustInventoryForm">确认</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 批量导入对话框 -->
    <el-dialog
      title="批量导入库存"
      v-model="importDialogVisible"
      width="600px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form :model="importForm" label-width="100px" :rules="importRules" ref="importFormRef">
        <el-form-item label="商品名称" prop="productId">
          <el-select v-model="importForm.productId" placeholder="请选择商品" style="width: 100%;">
            <el-option v-for="item in productOptions" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="成本价" prop="costPrice">
          <el-input-number v-model="importForm.costPrice" :precision="2" :step="0.1" :min="0" style="width: 100%;"></el-input-number>
        </el-form-item>
        <el-form-item label="账号内容" prop="content">
          <el-input
            v-model="importForm.content"
            type="textarea"
            :rows="10"
            placeholder="请输入账号内容，每行一个账号"
          ></el-input>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="importForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          ></el-input>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="importDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitImportForm">确认导入</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 查看账号内容对话框 -->
    <el-dialog
      title="账号内容"
      v-model="viewContentDialogVisible"
      width="500px"
      :close-on-click-modal="true"
      destroy-on-close
    >
      <div class="content-view">
        <el-input
          v-model="currentItemContent"
          type="textarea"
          :rows="5"
          readonly
        ></el-input>
        <div class="content-actions">
          <el-button type="primary" @click="copyContent">
            <el-icon><CopyDocument /></el-icon>
            复制内容
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Upload, Download, View, Edit, Delete, Setting, Search, CopyDocument } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

// 定义库存项类型
interface InventoryItem {
  id: string
  content: string
  status: 'available' | 'sold' | 'disabled'
  orderId?: string
  soldTime?: string
}

// 定义库存批次类型
interface InventoryBatch {
  id: string
  productId: string
  productName: string
  category: string
  totalCount: number
  soldCount: number
  remainingCount: number
  costPrice: number
  status: 'normal' | 'sold_out' | 'disabled'
  createTime: string
  remark: string
  items?: InventoryItem[]
}

// 定义商品选项类型
interface ProductOption {
  id: string
  name: string
  category: string
}

// 模拟商品选项数据
const productOptions = ref<ProductOption[]>([
  { id: 'p001', name: 'Gmail账号（美国）', category: '谷歌邮箱' },
  { id: 'p002', name: 'Gmail账号（英国）', category: '谷歌邮箱' },
  { id: 'p003', name: 'Outlook账号（美国）', category: '微软邮箱' },
  { id: 'p004', name: 'Outlook账号（英国）', category: '微软邮箱' },
  { id: 'p005', name: 'Instagram账号（美国）', category: 'Instagram账号' },
  { id: 'p006', name: 'Twitter账号（美国）', category: 'Twitter账号' },
  { id: 'p007', name: 'Facebook账号（美国）', category: 'Facebook账号' },
  { id: 'p008', name: 'Discord账号（美国）', category: 'Discord账号' },
  { id: 'p009', name: 'ChatGPT账号（美国）', category: 'ChatGPT账号' },
])

// 模拟库存批次数据
const inventoryList = ref<InventoryBatch[]>([
  {
    id: 'B20240701001',
    productId: 'p001',
    productName: 'Gmail账号（美国）',
    category: '谷歌邮箱',
    totalCount: 100,
    soldCount: 65,
    remainingCount: 35,
    costPrice: 5.0,
    status: 'normal',
    createTime: '2024-07-01 10:00:00',
    remark: '7月批次Gmail账号',
    items: generateMockItems('B20240701001', 100, 65)
  },
  {
    id: 'B20240702001',
    productId: 'p002',
    productName: 'Gmail账号（英国）',
    category: '谷歌邮箱',
    totalCount: 50,
    soldCount: 48,
    remainingCount: 2,
    costPrice: 6.5,
    status: 'normal',
    createTime: '2024-07-02 09:30:00',
    remark: '7月批次Gmail英国账号',
    items: generateMockItems('B20240702001', 50, 48)
  },
  {
    id: 'B20240703001',
    productId: 'p003',
    productName: 'Outlook账号（美国）',
    category: '微软邮箱',
    totalCount: 80,
    soldCount: 30,
    remainingCount: 50,
    costPrice: 4.0,
    status: 'normal',
    createTime: '2024-07-03 14:00:00',
    remark: '7月批次Outlook账号',
    items: generateMockItems('B20240703001', 80, 30)
  },
  {
    id: 'B20240704001',
    productId: 'p005',
    productName: 'Instagram账号（美国）',
    category: 'Instagram账号',
    totalCount: 30,
    soldCount: 30,
    remainingCount: 0,
    costPrice: 8.0,
    status: 'sold_out',
    createTime: '2024-07-04 11:20:00',
    remark: '7月批次Instagram账号',
    items: generateMockItems('B20240704001', 30, 30)
  },
  {
    id: 'B20240705001',
    productId: 'p006',
    productName: 'Twitter账号（美国）',
    category: 'Twitter账号',
    totalCount: 40,
    soldCount: 15,
    remainingCount: 25,
    costPrice: 7.5,
    status: 'normal',
    createTime: '2024-07-05 16:45:00',
    remark: '7月批次Twitter账号',
    items: generateMockItems('B20240705001', 40, 15)
  },
  {
    id: 'B20240706001',
    productId: 'p009',
    productName: 'ChatGPT账号（美国）',
    category: 'ChatGPT账号',
    totalCount: 20,
    soldCount: 18,
    remainingCount: 2,
    costPrice: 12.0,
    status: 'normal',
    createTime: '2024-07-06 09:10:00',
    remark: '7月批次ChatGPT账号',
    items: generateMockItems('B20240706001', 20, 18)
  },
  {
    id: 'B20240707001',
    productId: 'p007',
    productName: 'Facebook账号（美国）',
    category: 'Facebook账号',
    totalCount: 25,
    soldCount: 10,
    remainingCount: 15,
    costPrice: 9.0,
    status: 'normal',
    createTime: '2024-07-07 13:30:00',
    remark: '7月批次Facebook账号',
    items: generateMockItems('B20240707001', 25, 10)
  },
  {
    id: 'B20240708001',
    productId: 'p008',
    productName: 'Discord账号（美国）',
    category: 'Discord账号',
    totalCount: 15,
    soldCount: 5,
    remainingCount: 10,
    costPrice: 6.0,
    status: 'normal',
    createTime: '2024-07-08 10:15:00',
    remark: '7月批次Discord账号',
    items: generateMockItems('B20240708001', 15, 5)
  }
])

// 生成模拟库存项数据
function generateMockItems(batchId: string, total: number, sold: number): InventoryItem[] {
  const items: InventoryItem[] = []
  
  for (let i = 1; i <= total; i++) {
    const id = `${batchId}-${i.toString().padStart(3, '0')}`
    const isSold = i <= sold
    
    items.push({
      id,
      content: `account${i}@example.com:password${i}`,
      status: isSold ? 'sold' : 'available',
      orderId: isSold ? `ORDER-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}` : undefined,
      soldTime: isSold ? new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toLocaleString() : undefined
    })
  }
  
  return items
}

// 搜索表单
const searchForm = reactive({
  batchId: '',
  category: '',
  productId: '',
  status: '',
  dateRange: [] as string[]
})

// 表格数据和加载状态
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const multipleSelection = ref<InventoryBatch[]>([])

// 批次详情抽屉
const detailsDrawerVisible = ref(false)
const currentBatch = ref<InventoryBatch | null>(null)
const itemSearchKeyword = ref('')
const itemStatusFilter = ref('')
const itemsCurrentPage = ref(1)
const itemsPageSize = ref(10)

// 新增/编辑批次对话框
const batchDialogVisible = ref(false)
const dialogTitle = ref('新增批次')
const isEdit = ref(false)
const batchFormRef = ref<FormInstance>()
const batchForm = reactive({
  id: '',
  productId: '',
  totalCount: 0,
  costPrice: 0,
  status: 'normal',
  remark: ''
})

const batchRules = {
  productId: [{ required: true, message: '请选择商品', trigger: 'change' }],
  totalCount: [{ required: true, message: '请输入批次数量', trigger: 'blur' }],
  costPrice: [{ required: true, message: '请输入成本价', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

// 修改成本价对话框
const costPriceDialogVisible = ref(false)
const costPriceFormRef = ref<FormInstance>()
const costPriceForm = reactive({
  batchId: '',
  productName: '',
  currentPrice: 0,
  newPrice: 0,
  remark: ''
})

const costPriceRules = {
  newPrice: [{ required: true, message: '请输入新成本价', trigger: 'blur' }],
  remark: [{ required: true, message: '请输入修改原因', trigger: 'blur' }]
}

// 库存调整对话框
const adjustInventoryDialogVisible = ref(false)
const adjustInventoryFormRef = ref<FormInstance>()
const adjustInventoryForm = reactive({
  batchId: '',
  productName: '',
  currentRemaining: 0,
  adjustType: 'add',
  adjustCount: 1,
  remark: ''
})

const adjustInventoryRules = {
  adjustType: [{ required: true, message: '请选择调整类型', trigger: 'change' }],
  adjustCount: [{ required: true, message: '请输入调整数量', trigger: 'blur' }],
  remark: [{ required: true, message: '请输入调整原因', trigger: 'blur' }]
}

// 批量导入对话框
const importDialogVisible = ref(false)
const importFormRef = ref<FormInstance>()
const importForm = reactive({
  productId: '',
  costPrice: 0,
  content: '',
  remark: ''
})

const importRules = {
  productId: [{ required: true, message: '请选择商品', trigger: 'change' }],
  costPrice: [{ required: true, message: '请输入成本价', trigger: 'blur' }],
  content: [{ required: true, message: '请输入账号内容', trigger: 'blur' }]
}

// 查看账号内容对话框
const viewContentDialogVisible = ref(false)
const currentItemContent = ref('')

// 计算属性：筛选后的库存列表
const filteredInventoryList = computed(() => {
  let result = [...inventoryList.value]
  
  if (searchForm.batchId) {
    result = result.filter(item => item.id.includes(searchForm.batchId))
  }
  
  if (searchForm.category) {
    result = result.filter(item => item.category === searchForm.category)
  }
  
  if (searchForm.productId) {
    result = result.filter(item => item.productId === searchForm.productId)
  }
  
  if (searchForm.status) {
    result = result.filter(item => item.status === searchForm.status)
  }
  
  // 日期筛选
  if (searchForm.dateRange && searchForm.dateRange.length === 2) {
    const startDate = new Date(searchForm.dateRange[0])
    const endDate = new Date(searchForm.dateRange[1])
    endDate.setHours(23, 59, 59, 999) // 设置为当天结束时间
    
    result = result.filter(item => {
      const itemDate = new Date(item.createTime)
      return itemDate >= startDate && itemDate <= endDate
    })
  }
  
  // 更新总数
  total.value = result.length
  
  // 分页
  return result.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value)
})

// 计算属性：筛选后的批次项列表
const filteredBatchItems = computed(() => {
  if (!currentBatch.value || !currentBatch.value.items) return []
  
  let result = [...currentBatch.value.items]
  
  // 关键词搜索
  if (itemSearchKeyword.value) {
    result = result.filter(item => 
      item.id.includes(itemSearchKeyword.value) || 
      item.content.includes(itemSearchKeyword.value) ||
      (item.orderId && item.orderId.includes(itemSearchKeyword.value))
    )
  }
  
  // 状态筛选
  if (itemStatusFilter.value) {
    result = result.filter(item => item.status === itemStatusFilter.value)
  }
  
  // 分页
  return result.slice(
    (itemsCurrentPage.value - 1) * itemsPageSize.value, 
    itemsCurrentPage.value * itemsPageSize.value
  )
})

// 统计数据
const totalBatches = computed(() => inventoryList.value.length)
const totalInventory = computed(() => inventoryList.value.reduce((sum, item) => sum + item.totalCount, 0))
const totalSold = computed(() => inventoryList.value.reduce((sum, item) => sum + item.soldCount, 0))
const totalRemaining = computed(() => inventoryList.value.reduce((sum, item) => sum + item.remainingCount, 0))
const totalCost = computed(() => inventoryList.value.reduce((sum, item) => sum + (item.costPrice * item.totalCount), 0))

// 初始化
onMounted(() => {
  handleSearch()
})

// 搜索和重置
const handleSearch = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 500)
}

const resetSearch = () => {
  searchForm.batchId = ''
  searchForm.category = ''
  searchForm.productId = ''
  searchForm.status = ''
  searchForm.dateRange = []
  handleSearch()
}

// 表格选择变更
const handleSelectionChange = (selection: InventoryBatch[]) => {
  multipleSelection.value = selection
}

// 分页处理
const handleSizeChange = (size: number) => {
  pageSize.value = size
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
}

const handleItemsSizeChange = (size: number) => {
  itemsPageSize.value = size
}

const handleItemsCurrentChange = (page: number) => {
  itemsCurrentPage.value = page
}

// 状态格式化
const getStatusType = (status: string) => {
  switch (status) {
    case 'normal': return 'success'
    case 'sold_out': return 'info'
    case 'disabled': return 'danger'
    default: return 'info'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'normal': return '正常'
    case 'sold_out': return '已售罄'
    case 'disabled': return '已禁用'
    default: return '未知'
  }
}

const getItemStatusType = (status: string) => {
  switch (status) {
    case 'available': return 'success'
    case 'sold': return 'info'
    case 'disabled': return 'danger'
    default: return 'info'
  }
}

const getItemStatusLabel = (status: string) => {
  switch (status) {
    case 'available': return '可用'
    case 'sold': return '已售出'
    case 'disabled': return '已禁用'
    default: return '未知'
  }
}

// 批次操作
const handleAddBatch = () => {
  isEdit.value = false
  dialogTitle.value = '新增批次'
  batchForm.id = ''
  batchForm.productId = ''
  batchForm.totalCount = 0
  batchForm.costPrice = 0
  batchForm.status = 'normal'
  batchForm.remark = ''
  batchDialogVisible.value = true
}

const handleEditBatch = (row: InventoryBatch) => {
  isEdit.value = true
  dialogTitle.value = '编辑批次'
  batchForm.id = row.id
  batchForm.productId = row.productId
  batchForm.totalCount = row.totalCount
  batchForm.costPrice = row.costPrice
  batchForm.status = row.status
  batchForm.remark = row.remark
  batchDialogVisible.value = true
}

const handleDeleteBatch = (row: InventoryBatch) => {
  if (row.soldCount > 0) {
    ElMessage.warning('该批次已有商品售出，无法删除')
    return
  }
  
  ElMessageBox.confirm(
    '确定要删除该批次吗？此操作将永久删除该批次及其所有库存项，且无法恢复。',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    const index = inventoryList.value.findIndex(item => item.id === row.id)
    if (index !== -1) {
      inventoryList.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {
    // 取消删除
  })
}

const submitBatchForm = async () => {
  if (!batchFormRef.value) return
  
  await batchFormRef.value.validate((valid) => {
    if (valid) {
      if (isEdit.value) {
        // 编辑批次
        const index = inventoryList.value.findIndex(item => item.id === batchForm.id)
        if (index !== -1) {
          const product = productOptions.value.find(p => p.id === batchForm.productId)
          if (product) {
            inventoryList.value[index] = {
              ...inventoryList.value[index],
              productId: batchForm.productId,
              productName: product.name,
              category: product.category,
              totalCount: batchForm.totalCount,
              costPrice: batchForm.costPrice,
              status: batchForm.status as any,
              remark: batchForm.remark
            }
          }
        }
      } else {
        // 新增批次
        const product = productOptions.value.find(p => p.id === batchForm.productId)
        if (product) {
          const newBatch: InventoryBatch = {
            id: `B${new Date().getTime().toString().substring(0, 10)}`,
            productId: batchForm.productId,
            productName: product.name,
            category: product.category,
            totalCount: batchForm.totalCount,
            soldCount: 0,
            remainingCount: batchForm.totalCount,
            costPrice: batchForm.costPrice,
            status: batchForm.status as any,
            createTime: new Date().toLocaleString(),
            remark: batchForm.remark,
            items: []
          }
          inventoryList.value.unshift(newBatch)
        }
      }
      
      batchDialogVisible.value = false
      ElMessage.success(isEdit.value ? '编辑成功' : '新增成功')
    }
  })
}

// 查看批次详情
const handleViewDetails = (row: InventoryBatch) => {
  currentBatch.value = JSON.parse(JSON.stringify(row))
  detailsDrawerVisible.value = true
  itemsCurrentPage.value = 1
  itemSearchKeyword.value = ''
  itemStatusFilter.value = ''
}

// 修改成本价
const handleEditCostPrice = () => {
  if (!currentBatch.value) return
  
  costPriceForm.batchId = currentBatch.value.id
  costPriceForm.productName = currentBatch.value.productName
  costPriceForm.currentPrice = currentBatch.value.costPrice
  costPriceForm.newPrice = currentBatch.value.costPrice
  costPriceForm.remark = ''
  
  costPriceDialogVisible.value = true
}

const submitCostPriceForm = async () => {
  if (!costPriceFormRef.value || !currentBatch.value) return
  
  await costPriceFormRef.value.validate((valid) => {
    if (valid) {
      // 更新批次成本价
      const index = inventoryList.value.findIndex(item => item.id === currentBatch.value?.id)
      if (index !== -1) {
        inventoryList.value[index].costPrice = costPriceForm.newPrice
        // 同步更新当前查看的批次
        if (currentBatch.value) {
          currentBatch.value.costPrice = costPriceForm.newPrice
        }
      }
      
      costPriceDialogVisible.value = false
      ElMessage.success('成本价修改成功')
    }
  })
}

// 库存调整
const handleAdjustInventory = () => {
  if (!currentBatch.value) return
  
  adjustInventoryForm.batchId = currentBatch.value.id
  adjustInventoryForm.productName = currentBatch.value.productName
  adjustInventoryForm.currentRemaining = currentBatch.value.remainingCount
  adjustInventoryForm.adjustType = 'add'
  adjustInventoryForm.adjustCount = 1
  adjustInventoryForm.remark = ''
  
  adjustInventoryDialogVisible.value = true
}

const submitAdjustInventoryForm = async () => {
  if (!adjustInventoryFormRef.value || !currentBatch.value) return
  
  await adjustInventoryFormRef.value.validate((valid) => {
    if (valid) {
      // 更新批次库存
      const index = inventoryList.value.findIndex(item => item.id === currentBatch.value?.id)
      if (index !== -1) {
        const batch = inventoryList.value[index]
        const adjustCount = adjustInventoryForm.adjustCount
        
        if (adjustInventoryForm.adjustType === 'add') {
          // 增加库存
          batch.totalCount += adjustCount
          batch.remainingCount += adjustCount
          
          // 添加新的库存项
          if (batch.items) {
            const startIndex = batch.items.length + 1
            for (let i = 0; i < adjustCount; i++) {
              const id = `${batch.id}-${(startIndex + i).toString().padStart(3, '0')}`
              batch.items.push({
                id,
                content: `account${startIndex + i}@example.com:password${startIndex + i}`,
                status: 'available'
              })
            }
          }
        } else {
          // 减少库存
          if (adjustCount > batch.remainingCount) {
            ElMessage.error('调整数量不能大于剩余库存')
            return
          }
          
          batch.totalCount -= adjustCount
          batch.remainingCount -= adjustCount
          
          // 移除库存项
          if (batch.items) {
            let removedCount = 0
            const availableItems = batch.items.filter(item => item.status === 'available')
            
            for (let i = 0; i < availableItems.length && removedCount < adjustCount; i++) {
              const itemIndex = batch.items.findIndex(item => item.id === availableItems[i].id)
              if (itemIndex !== -1) {
                batch.items.splice(itemIndex, 1)
                removedCount++
              }
            }
          }
        }
        
        // 更新状态
        if (batch.remainingCount === 0) {
          batch.status = 'sold_out'
        } else {
          batch.status = 'normal'
        }
        
        // 同步更新当前查看的批次
        if (currentBatch.value) {
          currentBatch.value = JSON.parse(JSON.stringify(batch))
        }
      }
      
      adjustInventoryDialogVisible.value = false
      ElMessage.success('库存调整成功')
    }
  })
}

// 批量导入
const handleImportBatch = () => {
  importForm.productId = ''
  importForm.costPrice = 0
  importForm.content = ''
  importForm.remark = ''
  
  importDialogVisible.value = true
}

const submitImportForm = async () => {
  if (!importFormRef.value) return
  
  await importFormRef.value.validate((valid) => {
    if (valid) {
      // 解析账号内容
      const lines = importForm.content.split('\n').filter(line => line.trim() !== '')
      if (lines.length === 0) {
        ElMessage.error('请输入有效的账号内容')
        return
      }
      
      const product = productOptions.value.find(p => p.id === importForm.productId)
      if (!product) {
        ElMessage.error('请选择有效的商品')
        return
      }
      
      // 创建新批次
      const batchId = `B${new Date().getTime().toString().substring(0, 10)}`
      const items: InventoryItem[] = []
      
      for (let i = 0; i < lines.length; i++) {
        const id = `${batchId}-${(i + 1).toString().padStart(3, '0')}`
        items.push({
          id,
          content: lines[i],
          status: 'available'
        })
      }
      
      const newBatch: InventoryBatch = {
        id: batchId,
        productId: importForm.productId,
        productName: product.name,
        category: product.category,
        totalCount: lines.length,
        soldCount: 0,
        remainingCount: lines.length,
        costPrice: importForm.costPrice,
        status: 'normal',
        createTime: new Date().toLocaleString(),
        remark: importForm.remark,
        items
      }
      
      inventoryList.value.unshift(newBatch)
      importDialogVisible.value = false
      ElMessage.success(`批量导入成功，共导入 ${lines.length} 个账号`)
    }
  })
}

// 导出库存
const exportInventory = () => {
  if (multipleSelection.value.length === 0) {
    ElMessage.warning('请先选择要导出的批次')
    return
  }
  
  ElMessage.success(`已导出 ${multipleSelection.value.length} 个批次的库存数据`)
}

// 导出批次项
const handleExportBatchItems = () => {
  if (!currentBatch.value) return
  
  ElMessage.success(`已导出批次 ${currentBatch.value.id} 的库存项数据`)
}

// 查看账号内容
const handleViewItemContent = (item: InventoryItem) => {
  currentItemContent.value = item.content
  viewContentDialogVisible.value = true
}

// 禁用库存项
const handleDisableItem = (item: InventoryItem) => {
  ElMessageBox.confirm(
    '确定要禁用该库存项吗？',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    if (!currentBatch.value || !currentBatch.value.items) return
    
    const itemIndex = currentBatch.value.items.findIndex(i => i.id === item.id)
    if (itemIndex !== -1) {
      currentBatch.value.items[itemIndex].status = 'disabled'
      
      // 更新批次数据
      if (currentBatch.value) { // 添加空值检查
        const batchIndex = inventoryList.value.findIndex(b => b.id === currentBatch.value?.id)
        if (batchIndex !== -1) {
          // 更新剩余数量
          inventoryList.value[batchIndex].remainingCount -= 1
          
          // 如果剩余数量为0，更新状态为已售罄
          if (inventoryList.value[batchIndex].remainingCount === 0) {
            inventoryList.value[batchIndex].status = 'sold_out'
          }
          
          // 同步更新当前批次
          currentBatch.value = JSON.parse(JSON.stringify(inventoryList.value[batchIndex]))
        }
      }
      
      ElMessage.success('库存项已禁用')
    }
  }).catch(() => {
    // 取消操作
  })
}

// 复制账号内容
const copyContent = () => {
  // 模拟复制到剪贴板
  ElMessage.success('内容已复制到剪贴板')
  viewContentDialogVisible.value = false
}
</script>

<style scoped>
.inventory-view {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-buttons {
  display: flex;
  gap: 10px;
}

.page-description {
  margin-bottom: 20px;
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
}

.filter-card-wrapper {
  margin-bottom: 20px;
}

.search-area {
  margin-bottom: 10px;
}

.search-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #ebeef5;
}

.total-amount {
  font-size: 14px;
}

.amount-value {
  font-weight: bold;
  margin-right: 10px;
}

.action-btns {
  display: flex;
  gap: 10px;
}

.table-card-wrapper {
  margin-bottom: 20px;
}

.table-area-wrapper {
  width: 100%;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.low-stock {
  color: #F56C6C;
  font-weight: bold;
}

.batch-details {
  padding: 0 20px;
}

.batch-header {
  margin-bottom: 20px;
}

.batch-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.batch-title h3 {
  margin: 0;
}

.batch-info {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.info-item {
  display: flex;
  align-items: center;
}

.info-item .label {
  color: #909399;
  margin-right: 5px;
}

.batch-stats {
  margin: 20px 0;
}

.stat-card {
  background-color: #f5f7fa;
  border-radius: 4px;
  padding: 15px;
  text-align: center;
}

.stat-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.batch-actions {
  display: flex;
  gap: 10px;
  margin: 20px 0;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.section-title h4 {
  margin: 0;
}

.section-actions {
  display: flex;
  gap: 10px;
}

.content-wrapper {
  max-width: 250px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.content-view {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.content-actions {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}
</style>