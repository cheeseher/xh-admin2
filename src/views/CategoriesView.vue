<template>
  <div class="categories-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>分类管理</span>
          <el-button type="primary" @click="handleAddCategory">新增分类</el-button>
        </div>
      </template>
      
      <div class="page-description">
        <p>管理所有邮箱账号和社交媒体账号的分类信息，包括Gmail、微软邮箱、Instagram、Twitter、Facebook等账号类型。您可以添加、编辑、删除分类，并设置分类的描述、排序等信息。</p>
      </div>
      
      <!-- 搜索区域 -->
      <div class="search-area">
        <el-form :inline="true" :model="searchForm" class="demo-form-inline">
          <el-form-item label="分类名称">
            <el-input v-model="searchForm.name" placeholder="请输入分类名称" clearable></el-input>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 168px;">
              <el-option label="全部" value=""></el-option>
              <el-option label="启用" value="enabled"></el-option>
              <el-option label="禁用" value="disabled"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <!-- 表格区域 -->
      <el-table :data="categoryList" style="width: 100%" v-loading="loading" border stripe>
        <el-table-column prop="id" label="分类ID" width="80"></el-table-column>
        <el-table-column prop="name" label="分类名称" min-width="180"></el-table-column>
        <el-table-column prop="description" label="分类描述" min-width="200"></el-table-column>
        <el-table-column prop="sort" label="排序" width="80"></el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-switch
              v-model="scope.row.statusBool"
              :active-value="true"
              :inactive-value="false"
              @change="(val: boolean) => handleStatusChange(val, scope.row)"
            ></el-switch>
            <span class="status-text">{{ scope.row.statusBool ? '启用' : '禁用' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180"></el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
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
    
    <!-- 分类表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增分类' : '编辑分类'"
      width="500px"
    >
      <el-form :model="categoryForm" label-width="100px" :rules="rules" ref="categoryFormRef">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="categoryForm.name" placeholder="请输入分类名称"></el-input>
        </el-form-item>
        <el-form-item label="分类描述" prop="description">
          <el-input v-model="categoryForm.description" type="textarea" :rows="3" placeholder="请输入分类描述"></el-input>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="categoryForm.sort" :min="0" :max="999" style="width: 100%;"></el-input-number>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="categoryForm.statusBool"></el-switch>
          <span class="status-text">{{ categoryForm.statusBool ? '启用' : '禁用' }}</span>
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
import { ref, reactive, onMounted, defineComponent, h } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

// 搜索表单
const searchForm = reactive({
  name: '',
  status: ''
})

// 表格数据
const categoryList = ref([
  { 
    id: 1,
    name: '谷歌邮箱', 
    description: 'Gmail邮箱账号，支持自定义密码和换绑手机',
    sort: 1,
    status: '启用',
    statusBool: true,
    createTime: '2024-03-01 10:00:00' 
  },
  { 
    id: 2,
    name: '微软邮箱', 
    description: 'Outlook/Hotmail邮箱账号，支持自定义密码和换绑手机',
    sort: 2,
    status: '启用',
    statusBool: true,
    createTime: '2024-03-02 09:30:00' 
  },
  { 
    id: 3,
    name: 'Instagram账号', 
    description: 'Instagram社交媒体账号，支持自定义密码和换绑手机',
    sort: 3,
    status: '启用',
    statusBool: true,
    createTime: '2024-03-03 09:00:00' 
  },
  { 
    id: 4,
    name: 'Twitter账号', 
    description: 'Twitter社交媒体账号，支持自定义密码和换绑手机',
    sort: 4,
    status: '启用',
    statusBool: true,
    createTime: '2024-03-04 08:30:00' 
  },
  { 
    id: 5,
    name: 'Facebook账号', 
    description: 'Facebook社交媒体账号，支持自定义密码和换绑手机',
    sort: 5,
    status: '启用',
    statusBool: true,
    createTime: '2024-03-05 08:00:00' 
  },
  { 
    id: 6,
    name: 'Discord账号', 
    description: 'Discord社交媒体账号，支持自定义密码和换绑手机',
    sort: 6,
    status: '启用',
    statusBool: true,
    createTime: '2024-03-06 08:00:00' 
  },
  { 
    id: 7,
    name: 'ChatGPT账号', 
    description: 'ChatGPT人工智能账号，支持自定义密码和换绑手机',
    sort: 7,
    status: '启用',
    statusBool: true,
    createTime: '2024-03-07 08:00:00' 
  },
  { 
    id: 8,
    name: '雅虎邮箱', 
    description: 'Yahoo邮箱账号，支持自定义密码和换绑手机',
    sort: 8,
    status: '启用',
    statusBool: true,
    createTime: '2024-03-08 08:00:00' 
  },
  { 
    id: 9,
    name: 'GMX邮箱账号', 
    description: 'GMX邮箱账号，支持自定义密码和换绑手机',
    sort: 9,
    status: '启用',
    statusBool: true,
    createTime: '2024-03-09 08:00:00' 
  },
  { 
    id: 10,
    name: 'TikTok账号', 
    description: 'TikTok社交媒体账号，支持自定义密码和换绑手机',
    sort: 10,
    status: '启用',
    statusBool: true,
    createTime: '2024-03-10 08:00:00' 
  },
  { 
    id: 11,
    name: '美国AOL邮箱', 
    description: 'AOL邮箱账号，支持自定义密码和换绑手机',
    sort: 11,
    status: '启用',
    statusBool: true,
    createTime: '2024-03-11 08:00:00' 
  },
  { 
    id: 12,
    name: 'ProtonMail邮箱', 
    description: 'ProtonMail邮箱账号，支持自定义密码和换绑手机',
    sort: 12,
    status: '启用',
    statusBool: true,
    createTime: '2024-03-12 08:00:00' 
  },
  { 
    id: 13,
    name: '亚马逊账号', 
    description: 'Amazon社交媒体账号，支持自定义密码和换绑手机',
    sort: 13,
    status: '启用',
    statusBool: true,
    createTime: '2024-03-13 08:00:00' 
  },
  { 
    id: 14,
    name: 'Mail.COM邮箱', 
    description: 'Mail.COM邮箱账号，支持自定义密码和换绑手机',
    sort: 14,
    status: '启用',
    statusBool: true,
    createTime: '2024-03-14 08:00:00' 
  },
  { 
    id: 15,
    name: 'Naver邮箱', 
    description: 'Naver邮箱账号，支持自定义密码和换绑手机',
    sort: 15,
    status: '启用',
    statusBool: true,
    createTime: '2024-03-15 08:00:00' 
  },
  { 
    id: 16,
    name: '俄罗斯RU邮箱', 
    description: '俄罗斯RU邮箱账号，支持自定义密码和换绑手机',
    sort: 16,
    status: '启用',
    statusBool: true,
    createTime: '2024-03-16 08:00:00' 
  },
  { 
    id: 17,
    name: '德国DE邮箱', 
    description: '德国DE邮箱账号，支持自定义密码和换绑手机',
    sort: 17,
    status: '启用',
    statusBool: true,
    createTime: '2024-03-17 08:00:00' 
  },
  { 
    id: 18,
    name: '其他邮箱集合', 
    description: '其他邮箱账号集合，支持自定义密码和换绑手机',
    sort: 18,
    status: '启用',
    statusBool: true,
    createTime: '2024-03-18 08:00:00' 
  }
])

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(18)
const loading = ref(false)

// 对话框相关
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const categoryFormRef = ref<FormInstance>()
const categoryForm = reactive({
  id: 0,
  name: '',
  description: '',
  sort: 0,
  statusBool: true
})

// 表单验证规则
const rules = reactive<FormRules>({
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入分类描述', trigger: 'blur' },
    { min: 2, max: 200, message: '长度在 2 到 200 个字符', trigger: 'blur' }
  ],
  sort: [
    { required: true, message: '请输入排序', trigger: 'blur' }
  ]
})

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
  searchForm.name = ''
  searchForm.status = ''
}

// 状态变更
const handleStatusChange = (val: boolean, row: any) => {
  const statusText = val ? '启用' : '禁用'
  ElMessage.success(`分类"${row.name}"已${statusText}`)
  row.status = val ? '启用' : '禁用'
}

// 新增分类
const handleAddCategory = () => {
  dialogType.value = 'add'
  categoryForm.id = 0
  categoryForm.name = ''
  categoryForm.description = ''
  categoryForm.sort = categoryList.value.length + 1
  categoryForm.statusBool = true
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: any) => {
  dialogType.value = 'edit'
  categoryForm.id = row.id
  categoryForm.name = row.name
  categoryForm.description = row.description
  categoryForm.sort = row.sort
  categoryForm.statusBool = row.statusBool
  dialogVisible.value = true
}

// 删除
const handleDelete = (row: any) => {
  ElMessageBox.confirm(
    `确定要删除分类"${row.name}"吗？`,
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
        message: `分类"${row.name}"已删除`,
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
  if (!categoryFormRef.value) return
  
  await categoryFormRef.value.validate((valid, fields) => {
    if (valid) {
      if (dialogType.value === 'add') {
        ElMessage.success('新增分类成功')
      } else {
        ElMessage.success('编辑分类成功')
      }
      dialogVisible.value = false
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
.categories-container {
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

.status-text {
  margin-left: 8px;
  font-size: 14px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
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