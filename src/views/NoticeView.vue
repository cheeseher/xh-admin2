<template>
  <div class="page-container">
    <!-- 筛选区 -->
    <el-card class="filter-container" shadow="never">
      <el-form :model="filterForm" inline>
        <el-form-item label="公告标题">
          <el-input v-model="filterForm.title" placeholder="请输入公告标题" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filterForm.status" placeholder="请选择状态" clearable style="width: 168px">
            <el-option label="全部" value="" />
            <el-option label="启用" value="enabled" />
            <el-option label="禁用" value="disabled" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格区 -->
    <el-card class="table-container" shadow="never">
      <div class="table-toolbar">
        <div class="left">
          <el-button type="primary" @click="handleAdd">新增</el-button>
          <el-button type="danger" @click="handleBatchDelete">批量删除</el-button>
        </div>
        <div class="right">
          <el-button @click="refreshTable">刷新</el-button>
        </div>
      </div>
      
      <!-- 公告启用说明 -->
      <div class="notice-tip">
        <el-alert
          title="公告设置说明"
          type="info"
          description="系统只允许同时启用一个公告，启用新公告后将自动禁用其他公告。"
          show-icon
          :closable="false"
        />
      </div>
      
      <el-table
        v-loading="tableLoading"
        :data="tableData"
        border
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="title" label="公告标题" min-width="180" />
        <el-table-column prop="content" label="公告内容" min-width="220" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'enabled' ? 'success' : 'danger'">
              {{ row.status === 'enabled' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="publishTime" label="发布时间" width="180" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link :icon="View" @click="handleView(row)">查看</el-button>
            <el-button link type="primary" :icon="Edit" @click="handleEdit(row)">编辑</el-button>
            <el-popconfirm title="确认删除?" @confirm="handleDelete(row)">
              <template #reference>
                <el-button link type="danger" :icon="Delete">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    <!-- 公告表单弹窗 -->
    <el-dialog
      :title="formTitle"
      v-model="dialogVisible"
      width="500px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="公告标题" prop="title" required>
          <el-input v-model="form.title" placeholder="请输入公告标题" />
        </el-form-item>
        <el-form-item label="公告内容" prop="content" required>
          <el-input v-model="form.content" type="textarea" :rows="4" placeholder="请输入公告内容" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="enabled">启用</el-radio>
            <el-radio label="disabled">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitLoading">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { View, Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { 
  tableData as noticeTableData, 
  addNotice, 
  updateNotice, 
  deleteNotice,
  batchDeleteNotices
} from '@/data/noticeData.js'

// 筛选表单
const filterForm = reactive({
  title: '',
  status: ''
})

// 表格数据
const tableData = noticeTableData

// 分页参数
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: computed(() => tableData.value.length)
})

// 加载状态
const tableLoading = ref(false)
const submitLoading = ref(false)

// 多选
const selectedNotices = ref([])
const handleSelectionChange = (selection) => {
  selectedNotices.value = selection.map(item => item.id)
}
const handleBatchDelete = () => {
  if (selectedNotices.value.length === 0) {
    ElMessage.warning('请至少选择一条数据')
    return
  }
  batchDeleteNotices(selectedNotices.value)
  ElMessage.success('批量删除成功')
  selectedNotices.value = []
  pagination.total = tableData.value.length 
}

const refreshTable = () => {
  tableLoading.value = true
  setTimeout(() => {
    pagination.total = tableData.value.length
    tableLoading.value = false
    ElMessage.success('刷新成功')
  }, 500)
}

// 弹窗相关
const dialogVisible = ref(false)
const formTitle = ref('新增公告')
const formRef = ref()
const form = reactive({
  id: null,
  title: '',
  content: '',
  status: 'enabled'
})
const rules = {
  title: [
    { required: true, message: '请输入公告标题', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入公告内容', trigger: 'blur' }
  ]
}

const handleAdd = () => {
  formTitle.value = '新增公告'
  Object.assign(form, { id: null, title: '', content: '', status: 'enabled' })
  dialogVisible.value = true
}
const handleEdit = (row) => {
  formTitle.value = '编辑公告'
  Object.assign(form, row)
  dialogVisible.value = true
}
const handleView = (row) => {
  handleEdit(row)
}
const handleDelete = (row) => {
  deleteNotice(row)
  ElMessage.success('删除成功')
  pagination.total = tableData.value.length 
}
const submitForm = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      submitLoading.value = true
      if (form.id === null) {
        addNotice(form)
        ElMessage.success('新增成功')
      } else {
        updateNotice(form)
        ElMessage.success('更新成功')
      }
      pagination.total = tableData.value.length 
      dialogVisible.value = false
      submitLoading.value = false
    }
  })
}
const handleSearch = () => {}
const resetFilter = () => {
  filterForm.title = ''
  filterForm.status = ''
}
const handleSizeChange = (size) => {
  pagination.pageSize = size
}
const handleCurrentChange = (page) => {
  pagination.currentPage = page
}
</script>

<style scoped>
.page-container {
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
.notice-tip {
  margin-bottom: 16px;
}
</style> 