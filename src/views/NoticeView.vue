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
import { ref, reactive } from 'vue'
import { View, Edit, Delete } from '@element-plus/icons-vue'

// 筛选表单
const filterForm = reactive({
  title: '',
  status: ''
})

// 表格数据
const tableData = ref([
  {
    id: 1,
    title: '系统维护公告',
    content: '平台将于2024年5月1日凌晨进行系统维护，届时部分功能将暂时不可用。',
    status: 'enabled',
    publishTime: '2024-04-28 09:00:00'
  },
  {
    id: 2,
    title: '新功能上线',
    content: '我们已上线批量导入功能，欢迎体验。',
    status: 'enabled',
    publishTime: '2024-04-20 10:30:00'
  },
  {
    id: 3,
    title: '假期放假通知',
    content: '五一劳动节期间，平台客服将暂停服务，祝大家节日快乐！',
    status: 'disabled',
    publishTime: '2024-04-18 15:00:00'
  }
])

// 分页参数
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 3
})

// 加载状态
const tableLoading = ref(false)
const submitLoading = ref(false)

// 多选
const handleSelectionChange = () => {}
const handleBatchDelete = () => {}
const refreshTable = () => {}

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
  // 可扩展为弹窗预览
  handleEdit(row)
}
const handleDelete = (row) => {
  // 删除逻辑
}
const submitForm = () => {
  // 表单提交逻辑
  dialogVisible.value = false
}
const handleSearch = () => {}
const resetFilter = () => {
  filterForm.title = ''
  filterForm.status = ''
}
const handleSizeChange = () => {}
const handleCurrentChange = () => {}
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
</style> 