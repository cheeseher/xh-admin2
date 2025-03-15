<template>
  <div class="inventory-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>库存管理</span>
          <div class="header-buttons">
            <el-button type="success" @click="handleImport">
              <el-icon><Upload /></el-icon>批量导入
            </el-button>
            <el-button type="primary" @click="handleAddInventory">
              <el-icon><Plus /></el-icon>新增库存
            </el-button>
          </div>
        </div>
      </template>
      
      <div class="page-description">
        <p>管理所有商品的库存账号，您可以添加、导入新的账号，并查看账号的销售状态。</p>
      </div>
      
      <!-- 搜索区域 -->
      <div class="search-area">
        <el-form :inline="true" :model="searchForm" class="demo-form-inline">
          <el-form-item label="关联商品">
            <el-select v-model="searchForm.productId" placeholder="请选择商品" clearable style="width: 240px;">
              <el-option label="全部" value=""></el-option>
              <el-option
                v-for="item in productOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="销售状态">
            <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 168px;">
              <el-option label="全部" value=""></el-option>
              <el-option label="未售出" value="unsold"></el-option>
              <el-option label="已售出" value="sold"></el-option>
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
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="id" label="卡密ID" width="80"></el-table-column>
        <el-table-column prop="productName" label="关联商品" min-width="180"></el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'unsold' ? 'success' : 'info'">
              {{ scope.row.status === 'unsold' ? '未售出' : '已售出' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="cardInfo" label="卡密信息" min-width="300">
          <template #default="scope">
            <el-button link type="primary" @click="showCardInfo(scope.row)">查看</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="添加时间" width="180"></el-table-column>
        <el-table-column prop="remark" label="备注" min-width="120"></el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <el-button size="small" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
              <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页区域 -->
      <div class="pagination-container">
        <div class="batch-actions">
          <el-button type="success" @click="handleExport">导出数据</el-button>
          <el-button type="danger" @click="handleBatchDelete">批量删除</el-button>
        </div>
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
    
    <!-- 导入对话框 -->
    <el-dialog
      v-model="importDialogVisible"
      title="批量导入账号"
      width="600px"
    >
      <div class="import-container">
        <el-form :model="importForm" label-width="100px">
          <el-form-item label="关联商品" required>
            <el-select v-model="importForm.productId" placeholder="请选择商品" style="width: 100%;">
              <el-option
                v-for="item in productOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="importForm.remark" type="textarea" placeholder="请输入批量导入的备注信息"></el-input>
          </el-form-item>
        </el-form>
        
        <el-upload
          class="upload-demo"
          drag
          action="/api/inventory/import"
          :auto-upload="false"
          :on-change="handleFileChange"
          :file-list="fileList"
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            将文件拖到此处，或<em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              支持.txt、.csv格式，每行一个卡密信息，格式根据商品类型不同而不同，例如：<br>
              Twitter账号格式：用户名----密码----注册邮箱----邮箱密码
            </div>
          </template>
        </el-upload>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="importDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitImport">确定导入</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 编辑对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      :title="dialogType === 'add' ? '新增库存' : '编辑库存'"
      width="500px"
    >
      <el-form :model="editForm" label-width="100px" :rules="rules" ref="editFormRef">
        <el-form-item label="卡密信息" prop="cardInfo">
          <el-input v-model="editForm.cardInfo" type="textarea" :rows="4" placeholder="请输入卡密信息，格式：用户名----密码----注册邮箱----邮箱密码"></el-input>
        </el-form-item>
        <el-form-item label="关联商品" prop="productId">
          <el-select v-model="editForm.productId" placeholder="请选择商品" style="width: 100%;">
            <el-option
              v-for="item in productOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="editForm.status" placeholder="请选择状态" style="width: 100%;">
            <el-option label="未售出" value="unsold"></el-option>
            <el-option label="已售出" value="sold"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="editForm.remark" type="textarea" placeholder="请输入备注信息"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitEdit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { 
  Plus,
  Upload,
  UploadFilled
} from '@element-plus/icons-vue'

// 搜索表单
const searchForm = reactive({
  productId: '',
  status: ''
})

// 商品选项
const productOptions = ref([
  { id: 1, name: '谷歌邮箱 - 美国地区' },
  { id: 2, name: '谷歌邮箱 - 欧洲地区' },
  { id: 3, name: '微软邮箱 - 美国地区' }
])

// 表格数据
const tableData = ref([
  {
    id: 'C0000001',
    cardInfo: 'henduohao2014----henduohao888----henduohao@outlook.com----henduohao888',
    productId: 1,
    productName: '谷歌邮箱 - 美国地区',
    status: 'unsold',
    createTime: '2024-03-10 10:00:00',
    remark: '批量导入'
  }
])

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)

// 导入对话框
const importDialogVisible = ref(false)
const fileList = ref([])
const importForm = reactive({
  productId: '',
  remark: ''
})

// 编辑对话框
const editDialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const editFormRef = ref<FormInstance>()
const editForm = reactive({
  id: 0,
  cardInfo: '',
  productId: '',
  status: 'unsold',
  remark: ''
})

// 表单验证规则
const rules = reactive<FormRules>({
  cardInfo: [
    { required: true, message: '请输入卡密信息', trigger: 'blur' }
  ],
  productId: [
    { required: true, message: '请选择关联商品', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
})

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  getInventoryList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.productId = ''
  searchForm.status = ''
  currentPage.value = 1
  getInventoryList()
}

// 获取库存列表
const getInventoryList = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 500)
}

// 导入相关
const handleImport = () => {
  importDialogVisible.value = true
}

const handleFileChange = (file: any) => {
  fileList.value = [file]
}

const submitImport = () => {
  if (!importForm.productId) {
    ElMessage.warning('请选择关联商品')
    return
  }
  ElMessage.success('导入成功')
  importDialogVisible.value = false
}

// 新增库存
const handleAddInventory = () => {
  dialogType.value = 'add'
  editForm.id = 0
  editForm.cardInfo = ''
  editForm.productId = ''
  editForm.status = 'unsold'
  editForm.remark = ''
  editDialogVisible.value = true
}

// 编辑
const handleEdit = (row: any) => {
  dialogType.value = 'edit'
  Object.assign(editForm, row)
  editDialogVisible.value = true
}

// 删除
const handleDelete = (row: any) => {
  ElMessageBox.confirm(
    `确定要删除ID为"${row.id}"的库存吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      ElMessage.success('删除成功')
    })
    .catch(() => {
      ElMessage.info('已取消删除')
    })
}

// 查看卡密信息
const showCardInfo = (row: any) => {
  ElMessageBox.alert(row.cardInfo, '卡密信息', {
    confirmButtonText: '确定'
  })
}

// 批量操作
const handleExport = () => {
  ElMessage.success('导出成功')
}

const handleBatchDelete = () => {
  ElMessageBox.confirm(
    '确定要批量删除选中的库存吗？',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      ElMessage.success('批量删除成功')
    })
    .catch(() => {
      ElMessage.info('已取消删除')
    })
}

// 提交编辑
const submitEdit = async () => {
  if (!editFormRef.value) return
  
  await editFormRef.value.validate((valid, fields) => {
    if (valid) {
      if (dialogType.value === 'add') {
        ElMessage.success('新增库存成功')
      } else {
        ElMessage.success('编辑库存成功')
      }
      editDialogVisible.value = false
    } else {
      console.log('表单验证失败', fields)
    }
  })
}

// 处理分页
const handleSizeChange = (val: number) => {
  pageSize.value = val
  getInventoryList()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  getInventoryList()
}

onMounted(() => {
  getInventoryList()
})
</script>

<style scoped>
.inventory-container {
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

.action-buttons {
  display: flex;
  gap: 5px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.batch-actions {
  display: flex;
  gap: 10px;
}

.import-container {
  .el-upload {
    width: 100%;
  }
}

:deep(.el-upload-dragger) {
  width: 100%;
}

:deep(.el-upload__tip) {
  margin-top: 10px;
  line-height: 1.5;
}
</style> 