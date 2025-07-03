<template>
  <div class="cost-center-view">
    <!-- 筛选区 -->
    <el-card class="filter-container" shadow="never">
      <el-form :model="filterForm" inline>
        <el-form-item label="成本类型">
          <el-select v-model="filterForm.type" placeholder="请选择成本类型" clearable style="width: 168px">
            <el-option label="手动发货" value="manual_delivery"></el-option>
            <el-option label="人工录入" value="manual_entry"></el-option>
            <el-option label="批次成本" value="batch"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="金额类型">
          <el-select v-model="filterForm.amountType" placeholder="请选择金额类型" clearable style="width: 168px">
            <el-option label="减少" value="decrease"></el-option>
            <el-option label="增加" value="increase"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="卡密批次ID">
          <el-input v-model="filterForm.relatedId" placeholder="请输入关联ID" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 主内容区 -->
    <el-card shadow="never">
      <!-- 工具栏 -->
      <div class="table-toolbar">
        <div class="left">
          <el-button type="primary" @click="handleAddCost">新增成本</el-button>
        </div>
        <div class="right">
          <el-button :icon="Refresh" circle @click="loadCostRecords" />
        </div>
      </div>

      <!-- 表格 -->
      <el-table :data="pagedData" v-loading="loading" border stripe>
        <el-table-column prop="type" label="成本类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTagType(row.type)">
              {{ formatType(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="relatedId" label="卡密批次ID" min-width="200">
          <template #default="{ row }">
            {{ row.type === 'manual_entry' ? '-' : row.relatedId }}
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
        <el-table-column prop="createdAt" label="创建时间" sortable min-width="180" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-tooltip content="查看详情" placement="top">
              <el-button link :icon="View" @click="handleView(row)"></el-button>
            </el-tooltip>
            <el-tooltip content="系统自动记录的成本无法编辑" :disabled="row.type === 'manual_entry'">
              <el-button link type="primary" :icon="Edit" @click="handleEdit(row)" :disabled="row.type !== 'manual_entry'"></el-button>
            </el-tooltip>
            <el-popconfirm title="确认删除此成本记录吗?" @confirm="handleDelete(row)">
              <template #reference>
                <el-tooltip content="删除" placement="top">
                  <el-button link type="danger" :icon="Delete">删除</el-button>
                </el-tooltip>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
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
        <template v-if="isEdit">
          <el-form-item label="成本类型" prop="type">
            <el-select v-model="costForm.type" placeholder="请选择成本类型" disabled>
              <el-option label="手动发货" value="manual_delivery"></el-option>
              <el-option label="人工录入" value="manual_entry"></el-option>
              <el-option label="批次成本" value="batch"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item v-if="costForm.type === 'manual_delivery'" label="关联订单ID" prop="relatedId">
            <el-input v-model="costForm.relatedId" placeholder="请输入关联订单ID" />
          </el-form-item>
        </template>
        <el-form-item label="金额类型" prop="amountType">
          <el-select v-model="costForm.amountType" placeholder="请选择金额类型">
            <el-option label="减少" value="decrease"></el-option>
            <el-option label="增加" value="increase"></el-option>
          </el-select>
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

    <!-- 查看详情弹窗 -->
    <el-dialog title="成本详情" v-model="viewDialogVisible" width="600px">
      <div v-if="viewData">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="ID">{{ viewData.id }}</el-descriptions-item>
          <el-descriptions-item label="成本类型">
            <el-tag :type="getTagType(viewData.type)">
              {{ formatType(viewData.type) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="金额类型">
            <el-tag :type="viewData.amountType === 'increase' ? 'success' : 'danger'">
              {{ viewData.amountType === 'increase' ? '增加' : '减少' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="成本金额">
            <span :style="{ color: viewData.amountType === 'increase' ? '#67c23a' : '#f56c6c' }">
              {{ viewData.amountType === 'increase' ? '+' : '-' }} ¥{{ viewData.amount.toFixed(2) }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="卡密批次ID">{{ viewData.relatedId }}</el-descriptions-item>
          <el-descriptions-item label="操作人">{{ viewData.operator }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ viewData.createdAt }}</el-descriptions-item>
          <el-descriptions-item label="备注">{{ viewData.remarks }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="viewDialogVisible = false">关闭</el-button>
        </span>
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
  type: 'manual_delivery' | 'manual_entry' | 'batch'
  amountType: 'increase' | 'decrease'
  relatedId: string
  amount: number
  remarks: string
  createdAt: string
  operator: string
}

const loading = ref(true)
const dialogVisible = ref(false)
const viewDialogVisible = ref(false)
const isEdit = ref(false)
const costFormRef = ref<FormInstance>()
const allData = ref<CostRecord[]>([])
const viewData = ref<CostRecord | null>(null)

// 模拟的成本数据
const mockCostData: CostRecord[] = [
  {
    id: 1,
    type: 'batch',
    amountType: 'decrease',
    relatedId: 'P20240701001',
    amount: 500.0,
    remarks: '100张面值50的卡密',
    createdAt: '2023-10-26 10:00:00',
    operator: '管理员A'
  },
  {
    id: 2,
    type: 'manual_delivery',
    amountType: 'decrease',
    relatedId: 'ORDER-20231026-005',
    amount: 25.5,
    remarks: '用户ID 123 手动发货',
    createdAt: '2023-10-26 11:30:00',
    operator: '管理员B'
  },
  {
    id: 3,
    type: 'manual_entry',
    amountType: 'decrease',
    relatedId: 'N/A',
    amount: 150.0,
    remarks: '10月份服务器费用',
    createdAt: '2023-10-25 15:00:00',
    operator: '管理员A'
  },
  {
    id: 4,
    type: 'manual_entry',
    amountType: 'increase',
    relatedId: 'REFUND-20231027-001',
    amount: 50.0,
    remarks: '供应商A退款',
    createdAt: '2023-10-27 09:00:00',
    operator: '管理员C'
  },
  {
    id: 5,
    type: 'batch',
    amountType: 'decrease',
    relatedId: 'P20240702005',
    amount: 250.0,
    remarks: '50张面值50的卡密',
    createdAt: '2023-10-28 12:00:00',
    operator: '管理员D'
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
  relatedId: ''
})

const filteredData = computed(() => {
  return allData.value.filter(item => {
    const typeMatch = filterForm.type ? item.type === filterForm.type : true;
    const amountTypeMatch = filterForm.amountType ? item.amountType === filterForm.amountType : true;
    const idMatch = filterForm.relatedId ? item.relatedId.includes(filterForm.relatedId) : true;
    return typeMatch && amountTypeMatch && idMatch;
  });
});

const handleSearch = () => {
  pagination.currentPage = 1;
}

const resetFilter = () => {
  filterForm.type = '';
  filterForm.amountType = '';
  filterForm.relatedId = '';
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
    case 'manual_delivery':
      return '手动发货'
    case 'manual_entry':
      return '人工录入'
    default:
      return '未知'
  }
}

const getTagType = (type: CostRecord['type']) => {
  switch (type) {
    case 'batch':
      return ''
    case 'manual_delivery':
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


// 新增/编辑弹窗
const dialogTitle = computed(() => (isEdit.value ? '编辑成本' : '新增成本'))
const costForm = reactive({
  id: null as number | null,
  type: 'manual_entry' as CostRecord['type'],
  amountType: 'decrease' as CostRecord['amountType'],
  relatedId: '',
  amount: 0,
  remarks: ''
})

const costFormRules = {
  type: [{ required: true, message: '请选择成本类型', trigger: 'change' }],
  amount: [{ required: true, message: '请输入成本金额', trigger: 'blur' }],
  amountType: [{ required: true, message: '请选择金额类型', trigger: 'change' }],
  relatedId: [
    {
      validator: (rule: any, value: any, callback: any) => {
        if (costForm.type === 'manual_delivery' && !value) {
          callback(new Error('请输入关联订单ID'))
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
      remarks: row.remarks
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
}

const submitForm = async () => {
  if (!costFormRef.value) return;
  await costFormRef.value.validate((valid) => {
    if (valid) {
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
          type: 'manual_entry',
          amountType: costForm.amountType,
          relatedId: 'N/A',
          amount: costForm.amount,
          remarks: costForm.remarks,
          createdAt: new Date().toLocaleString(),
          operator: '管理员C'
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

const handleView = (row: CostRecord) => {
  viewData.value = row
  viewDialogVisible.value = true
}
</script>

<style scoped>
.cost-center-view {
  padding: 20px;
}

.filter-container {
  margin-bottom: 16px;
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
</style> 