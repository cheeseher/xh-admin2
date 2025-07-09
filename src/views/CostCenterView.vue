<template>
  <div class="cost-center-view">
    <!-- 筛选区 -->
    <el-card class="filter-container" shadow="never">
      <el-form :model="filterForm" inline>
        <el-form-item label="成本类型">
          <el-select v-model="filterForm.type" placeholder="请选择成本类型" clearable style="width: 168px">
            <el-option label="人工录入成本" value="manual_entry"></el-option>
            <el-option label="批次成本" value="batch"></el-option>
            <el-option label="批次成本修改" value="batch_update"></el-option>
            <el-option label="人工发货" value="manual_delivery"></el-option>
            <el-option label="人工发货成本修改" value="manual_delivery_update"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="金额类型">
          <el-select v-model="filterForm.amountType" placeholder="请选择金额类型" clearable style="width: 168px">
            <el-option label="增加" value="increase"></el-option>
            <el-option label="减少" value="decrease"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="关联ID">
          <el-input v-model="filterForm.relatedId" placeholder="请输入关联ID" clearable />
        </el-form-item>
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 统计卡片 -->
    <div class="cost-summary">
      <el-row :gutter="16">
        <el-col :span="6">
          <el-card shadow="hover" class="summary-card">
            <div class="summary-title">总成本支出</div>
            <div class="summary-value">¥{{ Math.abs(totalCost).toFixed(2) }}</div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="summary-card">
            <div class="summary-title">批次成本总额</div>
            <div class="summary-value">¥{{ Math.abs(batchCost).toFixed(2) }}</div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="summary-card">
            <div class="summary-title">人工发货成本</div>
            <div class="summary-value">¥{{ Math.abs(manualDeliveryCost).toFixed(2) }}</div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="summary-card">
            <div class="summary-title">人工录入成本</div>
            <div class="summary-value">¥{{ Math.abs(customCost).toFixed(2) }}</div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 主内容区 -->
    <el-card shadow="never">
      <!-- 工具栏 -->
      <div class="table-toolbar">
        <div class="left">
          <el-button type="primary" @click="handleAddCost">新增成本</el-button>
          <el-button @click="exportCostData">导出数据</el-button>
        </div>
        <div class="right">
          <el-button :icon="Refresh" circle @click="loadCostRecords" />
        </div>
      </div>

      <!-- 表格 -->
      <el-table :data="pagedData" v-loading="loading" border stripe class="cost-table">
        <el-table-column prop="type" label="成本类型" width="150">
          <template #default="{ row }">
            <el-tag :type="getTagType(row.type)">
              {{ formatType(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="relatedId" label="关联ID" min-width="200">
          <template #default="{ row }">
            <template v-if="row.type === 'manual_entry'">-</template>
            <template v-else-if="row.type === 'manual_delivery' || row.type === 'manual_delivery_update'">
              <span>订单ID</span>
            </template>
            <template v-else-if="row.type === 'batch' || row.type === 'batch_update'">
              <span>批次ID</span>
            </template>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="成本金额" sortable min-width="150">
          <template #default="{ row }">
            <span :style="{ color: row.amountType === 'increase' ? '#67c23a' : '#f56c6c' }">
              {{ row.amountType === 'increase' ? '+' : '-' }} ¥{{ row.amount.toFixed(2) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="amountType" label="金额类型" width="120">
          <template #default="{ row }">
            <el-tag :type="row.amountType === 'increase' ? 'success' : 'danger'">
              {{ row.amountType === 'increase' ? '增加' : '减少' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operator" label="操作人" min-width="120" />
        <el-table-column label="详情" min-width="220">
          <template #default="{ row }">
            <template v-if="row.type === 'batch_update' && row.changeDetail">
              <div class="change-detail-multi-line">
                <div>成本价：¥{{ row.changeDetail.from.toFixed(2) }} → ¥{{ row.changeDetail.to.toFixed(2) }}</div>
                <div v-if="row.changeDetail.totalFrom !== undefined && row.changeDetail.totalTo !== undefined">
                  总成本：¥{{ row.changeDetail.totalFrom.toFixed(2) }} → ¥{{ row.changeDetail.totalTo.toFixed(2) }}
                </div>
              </div>
            </template>
            <template v-else-if="row.type === 'manual_delivery_update' && row.changeDetail">
              <span class="change-detail">
                ¥{{ row.changeDetail.from.toFixed(2) }} → ¥{{ row.changeDetail.to.toFixed(2) }}
              </span>
            </template>
            <template v-else>-</template>
          </template>
        </el-table-column>
        <el-table-column prop="remarks" label="备注" min-width="250" show-overflow-tooltip />
        <el-table-column prop="createdAt" label="创建时间" sortable min-width="180" />
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="filteredData.length"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑成本弹窗 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="500px"
      :close-on-click-modal="false"
      @closed="resetForm"
    >
      <el-form :model="costForm" ref="costFormRef" :rules="costFormRules" label-width="100px">
        <el-form-item v-if="costForm.type === 'manual_delivery'" label="关联订单ID" prop="relatedId">
          <el-input v-model="costForm.relatedId" placeholder="请输入关联订单ID" />
        </el-form-item>
        <el-form-item v-if="costForm.type === 'batch'" label="批次ID" prop="relatedId">
          <el-input v-model="costForm.relatedId" placeholder="请输入卡密批次ID" />
        </el-form-item>
        <el-form-item label="金额类型" prop="amountType">
          <el-radio-group v-model="costForm.amountType" :disabled="costForm.type === 'batch' || costForm.type === 'manual_delivery'">
            <el-radio label="increase">增加</el-radio>
            <el-radio label="decrease" v-if="costForm.type !== 'batch' && costForm.type !== 'manual_delivery'">减少</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="成本金额" prop="amount">
          <el-input-number v-model="costForm.amount" :precision="2" :step="1" :min="0" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="备注" prop="remarks">
          <el-input
            type="textarea"
            v-model="costForm.remarks"
            :rows="3"
            placeholder="请输入备注信息"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>


  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Refresh, View, Edit, Delete } from '@element-plus/icons-vue'

interface CostRecord {
  id: number
  type: 'manual_delivery' | 'manual_entry' | 'batch' | 'batch_update' | 'manual_delivery_update'
  amountType: 'increase' | 'decrease'
  relatedId: string
  amount: number
  remarks: string
  createdAt: string
  operator: string
  source?: 'system' | 'manual' // 来源：系统自动生成或人工录入
  changeDetail?: {
    from: number
    to: number
    totalFrom?: number
    totalTo?: number
  }
}

const loading = ref(true)
const dialogVisible = ref(false)
const isEdit = ref(false)
const costFormRef = ref<FormInstance>()
const allData = ref<CostRecord[]>([])

// 模拟的成本数据
const mockCostData: CostRecord[] = [
  {
    id: 1,
    type: 'batch',
    amountType: 'increase',
    relatedId: 'P20240701001',
    amount: 500.0,
    remarks: '批量导入库存或者新增库存的时候输入的备注',
    createdAt: '2023-10-26 10:00:00',
    operator: '管理员A',
    source: 'system'
  },
  {
    id: 2,
    type: 'manual_delivery',
    amountType: 'increase',
    relatedId: 'ORDER-20231026-005',
    amount: 25.5,
    remarks: '人工发货类型订单在发货弹窗内输入的备注',
    createdAt: '2023-10-26 11:30:00',
    operator: '管理员B',
    source: 'system'
  },
  {
    id: 3,
    type: 'manual_entry',
    amountType: 'decrease',
    relatedId: 'N/A',
    amount: 150.0,
    remarks: '人工录入成本减少示例',
    createdAt: '2023-10-25 15:00:00',
    operator: '管理员A',
    source: 'manual'
  },
  {
    id: 4,
    type: 'manual_entry',
    amountType: 'increase',
    relatedId: 'N/A',
    amount: 50.0,
    remarks: '人工录入成本增加示例',
    createdAt: '2023-10-27 09:00:00',
    operator: '管理员C',
    source: 'manual'
  },
  {
    id: 5,
    type: 'batch',
    amountType: 'increase',
    relatedId: 'P20240702005',
    amount: 250.0,
    remarks: '批量导入库存或者新增库存的时候输入的备注',
    createdAt: '2023-10-28 12:00:00',
    operator: '管理员D',
    source: 'system'
  },
  {
    id: 6,
    type: 'batch_update',
    amountType: 'decrease',
    relatedId: 'P20240701001',
    amount: 100.0,
    remarks: '库存管理抽屉页面，批量修改成本价弹窗内输入的备注',
    createdAt: '2023-10-29 14:30:00',
    operator: '管理员A',
    source: 'system',
    changeDetail: {
      from: 5.0,
      to: 4.0,
      totalFrom: 500.0,
      totalTo: 400.0
    }
  },
  {
    id: 7,
    type: 'manual_delivery',
    amountType: 'increase',
    relatedId: 'ORDER-20231030-008',
    amount: 75.0,
    remarks: '人工发货类型订单在发货弹窗内输入的备注',
    createdAt: '2023-10-30 09:15:00',
    operator: '管理员B',
    source: 'system'
  },
  {
    id: 8,
    type: 'batch_update',
    amountType: 'increase',
    relatedId: 'P20240702005',
    amount: 50.0,
    remarks: '库存管理抽屉页面，批量修改成本价弹窗内输入的备注',
    createdAt: '2023-10-31 10:00:00',
    operator: '管理员D',
    source: 'system',
    changeDetail: {
      from: 2.5,
      to: 3.0,
      totalFrom: 250.0,
      totalTo: 300.0
    }
  },
  {
    id: 9,
    type: 'manual_delivery',
    amountType: 'increase',
    relatedId: 'ORDER-20231101-001',
    amount: 50.0,
    remarks: '人工发货类型订单在发货弹窗内输入的备注',
    createdAt: '2023-11-01 10:00:00',
    operator: '管理员C',
    source: 'system'
  },
  {
    id: 10,
    type: 'manual_delivery_update',
    amountType: 'increase',
    relatedId: 'ORDER-20231026-005',
    amount: 4.5,
    remarks: '商品订单页面，人工发货类型，已完成订单，点击操作列的修改卡密信息，编辑卡密信息弹窗内输入的备注',
    createdAt: '2023-11-01 11:00:00',
    operator: '管理员B',
    source: 'system',
    changeDetail: {
      from: 25.5,
      to: 30.0
    }
  },
  {
    id: 11,
    type: 'manual_delivery_update',
    amountType: 'decrease',
    relatedId: 'ORDER-20231101-001',
    amount: 5.0,
    remarks: '商品订单页面，人工发货类型，已完成订单，点击操作列的修改卡密信息，编辑卡密信息弹窗内输入的备注',
    createdAt: '2023-11-02 14:20:00',
    operator: '管理员C',
    source: 'system',
    changeDetail: {
      from: 50.0,
      to: 45.0
    }
  }
]

const loadCostRecords = () => {
  loading.value = true
  setTimeout(() => {
    allData.value = [...mockCostData];
    loading.value = false
  }, 500)
}

onMounted(() => {
  loadCostRecords()
})

// 筛选
const filterForm = reactive({
  type: '',
  amountType: '',
  relatedId: '',
  dateRange: [] as string[]
})

const filteredData = computed(() => {
  return allData.value.filter(item => {
    const typeMatch = filterForm.type ? item.type === filterForm.type : true;
    const amountTypeMatch = filterForm.amountType ? item.amountType === filterForm.amountType : true;
    const idMatch = filterForm.relatedId ? item.relatedId.includes(filterForm.relatedId) : true;
    
    // 日期筛选
    let dateMatch = true;
    if (filterForm.dateRange && filterForm.dateRange.length === 2) {
      const startDate = new Date(filterForm.dateRange[0]);
      const endDate = new Date(filterForm.dateRange[1]);
      endDate.setHours(23, 59, 59, 999); // 设置为当天结束时间
      
      const itemDate = new Date(item.createdAt);
      dateMatch = itemDate >= startDate && itemDate <= endDate;
    }
    
    return typeMatch && amountTypeMatch && idMatch && dateMatch;
  });
});

// 统计数据
const totalCost = computed(() => {
  return filteredData.value.reduce((sum, item) => {
    const amount = item.amountType === 'decrease' ? item.amount : -item.amount;
    return sum + amount;
  }, 0);
});

const batchCost = computed(() => {
  return filteredData.value
    .filter(item => item.type === 'batch' || item.type === 'batch_update')
    .reduce((sum, item) => {
      const amount = item.amountType === 'decrease' ? item.amount : -item.amount;
      return sum + amount;
    }, 0);
});

const manualDeliveryCost = computed(() => {
  return filteredData.value
    .filter(item => item.type === 'manual_delivery')
    .reduce((sum, item) => {
      const amount = item.amountType === 'decrease' ? item.amount : -item.amount;
      return sum + amount;
    }, 0);
});

const customCost = computed(() => {
  return filteredData.value
    .filter(item => item.type === 'manual_entry')
    .reduce((sum, item) => {
      const amount = item.amountType === 'decrease' ? item.amount : -item.amount;
      return sum + amount;
    }, 0);
});

const handleSearch = () => {
  pagination.currentPage = 1;
}

const resetFilter = () => {
  filterForm.type = '';
  filterForm.amountType = '';
  filterForm.relatedId = '';
  filterForm.dateRange = [];
  pagination.currentPage = 1;
}

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 10
})

const pagedData = computed(() => {
  const start = (pagination.currentPage - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  return filteredData.value.slice(start, end)
})

const formatType = (type: CostRecord['type']) => {
  switch (type) {
    case 'batch':
      return '批次成本'
    case 'batch_update':
      return '批次成本修改'
    case 'manual_delivery':
      return '人工发货'
    case 'manual_delivery_update':
      return '人工发货成本修改'
    case 'manual_entry':
      return '人工录入成本'
    default:
      return '未知'
  }
}

const getTagType = (type: CostRecord['type']) => {
  switch (type) {
    case 'batch':
      return ''
    case 'batch_update':
      return 'success'
    case 'manual_delivery':
      return 'warning'
    case 'manual_delivery_update':
      return 'warning'
    case 'manual_entry':
      return 'info'
    default:
      return 'info'
  }
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
}

const handleCurrentChange = (page: number) => {
  pagination.currentPage = page
}

// 权限控制
const canEdit = (row: CostRecord) => {
  return row.source === 'manual' || row.type === 'manual_entry';
}

const canDelete = (row: CostRecord) => {
  return row.source === 'manual' || row.type === 'manual_entry';
}

const getEditTooltip = (row: CostRecord) => {
  return canEdit(row) ? '编辑' : '系统自动记录的成本无法编辑';
}

const getDeleteTooltip = (row: CostRecord) => {
  return canDelete(row) ? '删除' : '系统自动记录的成本无法删除';
}

// 新增/编辑弹窗
const dialogTitle = computed(() => (isEdit.value ? '编辑成本' : '新增成本'))
const costForm = reactive({
  id: null as number | null,
  type: 'manual_entry' as CostRecord['type'],
  amountType: 'decrease' as CostRecord['amountType'],
  relatedId: '',
  amount: 0,
  remarks: '',
  source: 'manual' as 'system' | 'manual'
})

const costFormRules = {
  amount: [{ required: true, message: '请输入成本金额', trigger: 'blur' }],
  amountType: [{ required: true, message: '请选择金额类型', trigger: 'change' }],
  relatedId: [
    {
      validator: (rule: any, value: any, callback: any) => {
        if ((costForm.type === 'manual_delivery' || costForm.type === 'batch') && !value) {
          callback(new Error(`请输入关联${costForm.type === 'manual_delivery' ? '订单' : '批次'}ID`))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const handleAddCost = () => {
  isEdit.value = false
  costForm.type = 'manual_entry' // 默认设置为人工录入类型
  costForm.amountType = 'decrease' // 默认设置为减少
  dialogVisible.value = true
}

const handleEdit = (row: CostRecord) => {
  isEdit.value = true
  Object.assign(costForm, {
      id: row.id,
      type: row.type,
      amountType: row.amountType,
      relatedId: row.relatedId,
      amount: row.amount,
      remarks: row.remarks,
      source: row.source
  })
  dialogVisible.value = true
}



const resetForm = () => {
  costFormRef.value?.resetFields()
  costForm.id = null;
  costForm.type = 'manual_entry';
  costForm.amountType = 'decrease';
  costForm.relatedId = '';
  costForm.amount = 0;
  costForm.remarks = '';
  costForm.source = 'manual';
}

const submitForm = async () => {
  if (!costFormRef.value) return;
  await costFormRef.value.validate((valid) => {
    if (valid) {
      // 确保批次成本和人工发货类型的金额类型只能为"增加"
      if (costForm.type === 'batch' || costForm.type === 'manual_delivery') {
        costForm.amountType = 'increase';
      }
      
      if (isEdit.value) {
        // Edit logic
        const index = allData.value.findIndex(item => item.id === costForm.id);
        if (index !== -1) {
          allData.value[index] = {
            ...allData.value[index],
            amount: costForm.amount,
            remarks: costForm.remarks,
            relatedId: costForm.relatedId,
            amountType: costForm.amountType,
          };
        }
      } else {
        // Add logic
        const newCost: CostRecord = {
          id: Date.now(),
          type: costForm.type,
          amountType: costForm.amountType,
          relatedId: costForm.type === 'manual_entry' ? 'N/A' : costForm.relatedId,
          amount: costForm.amount,
          remarks: costForm.remarks,
          createdAt: new Date().toLocaleString(),
          operator: '管理员C',
          source: 'manual'
        };
        allData.value.unshift(newCost);
      }
      dialogVisible.value = false;
      ElMessage.success(isEdit.value ? '更新成功' : '新增成功');
    }
  });
}

const handleDelete = (row: CostRecord) => {
  const index = allData.value.findIndex(item => item.id === row.id)
  if (index > -1) {
    allData.value.splice(index, 1)
    ElMessage.success('删除成功');
  }
}

// 查看关联数据
const viewRelatedOrder = (orderId: string) => {
  ElMessage.info(`查看订单详情：${orderId}，这里会跳转到订单详情页`);
  // 实际项目中应该跳转到订单详情页
  // router.push({ path: '/orders/detail', query: { id: orderId } });
}

const viewRelatedBatch = (batchId: string) => {
  ElMessage.info(`查看批次详情：${batchId}，这里会跳转到库存管理页面的对应批次`);
  // 实际项目中应该跳转到库存管理页面并定位到对应批次
  // router.push({ path: '/inventory', query: { batchId: batchId } });
}

// 导出数据
const exportCostData = () => {
  ElMessage.success('成本数据导出成功');
  // 实际项目中应该调用导出API
}

const handleTypeChange = () => {
  // 当选择批次成本或人工发货类型时，自动将金额类型设置为"增加"
  if (costForm.type === 'batch' || costForm.type === 'manual_delivery') {
    costForm.amountType = 'increase';
  }
  // 清空关联ID
  costForm.relatedId = '';
}
</script>

<style scoped>
.cost-center-view {
  padding: 20px;
}

.filter-container {
  margin-bottom: 16px;
}

.cost-summary {
  margin-bottom: 16px;
}

.summary-card {
  text-align: center;
  padding: 10px;
}

.summary-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 10px;
}

.summary-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.change-detail {
  color: #606266;
  font-size: 12px;
}

.change-detail-multi-line {
  line-height: 1.5;
  font-family: 'Courier New', Courier, monospace;
  font-size: 13px;
}



.dialog-footer-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style> 