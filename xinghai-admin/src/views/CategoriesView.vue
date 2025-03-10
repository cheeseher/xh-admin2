<template>
  <div class="categories-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>分类管理</span>
          <el-button type="primary" size="small" @click="handleAddCategory">新增分类</el-button>
        </div>
      </template>
      
      <div class="page-description">
        <p>管理所有邮箱账号和社交媒体账号的分类信息，包括Gmail、微软邮箱、Instagram、Twitter、Facebook等账号类型。您可以添加、编辑、删除分类，并设置分类的图标、排序等信息。</p>
      </div>
      
      <!-- 搜索区域 -->
      <div class="search-area">
        <el-form :inline="true" :model="searchForm" class="demo-form-inline">
          <el-form-item label="分类名称">
            <el-input v-model="searchForm.name" placeholder="请输入分类名称" clearable></el-input>
          </el-form-item>
          <el-form-item label="分类类型">
            <el-select v-model="searchForm.type" placeholder="请选择" clearable style="width: 168px;">
              <el-option label="全部" value=""></el-option>
              <el-option label="邮箱" value="email"></el-option>
              <el-option label="账号" value="account"></el-option>
            </el-select>
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
        <el-table-column type="index" label="序号" width="60"></el-table-column>
        <el-table-column prop="name" label="分类名称" min-width="180"></el-table-column>
        <el-table-column prop="type" label="分类类型" width="100">
          <template #default="scope">
            <el-tag :type="getTypeTag(scope.row.type)">{{ scope.row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="icon" label="图标" width="80">
          <template #default="scope">
            <el-icon :size="20" :color="scope.row.iconColor"><component :is="scope.row.icon" /></el-icon>
          </template>
        </el-table-column>
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
        <el-form-item label="分类类型" prop="type">
          <el-select v-model="categoryForm.type" placeholder="请选择分类类型" style="width: 100%;">
            <el-option label="邮箱" value="email"></el-option>
            <el-option label="账号" value="account"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <el-select v-model="categoryForm.icon" placeholder="请选择图标" style="width: 100%;">
            <el-option v-for="icon in iconOptions" :key="icon.value" :label="icon.label" :value="icon.value">
              <div style="display: flex; align-items: center;">
                <el-icon :size="20" :color="icon.color"><component :is="icon.value" /></el-icon>
                <span style="margin-left: 10px;">{{ icon.label }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="图标颜色" prop="iconColor">
          <el-color-picker v-model="categoryForm.iconColor"></el-color-picker>
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
import { 
  Message, 
  ChatDotRound, 
  ChatLineRound, 
  Postcard, 
  Discount, 
  Promotion, 
  Briefcase, 
  Collection, 
  More 
} from '@element-plus/icons-vue'

// 自定义图标组件
const Instagram = defineComponent({
  name: 'Instagram',
  render() {
    return h('svg', {
      viewBox: '0 0 24 24',
      width: '1em',
      height: '1em',
      fill: 'currentColor'
    }, [
      h('path', {
        d: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z'
      })
    ])
  }
})

const Twitter = defineComponent({
  name: 'Twitter',
  render() {
    return h('svg', {
      viewBox: '0 0 24 24',
      width: '1em',
      height: '1em',
      fill: 'currentColor'
    }, [
      h('path', {
        d: 'M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z'
      })
    ])
  }
})

const Facebook = defineComponent({
  name: 'Facebook',
  render() {
    return h('svg', {
      viewBox: '0 0 24 24',
      width: '1em',
      height: '1em',
      fill: 'currentColor'
    }, [
      h('path', {
        d: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z'
      })
    ])
  }
})

// 搜索表单
const searchForm = reactive({
  name: '',
  type: '',
  status: ''
})

// 图标选项
const iconOptions = [
  { label: '邮件', value: 'Message', color: '#409EFF' },
  { label: '聊天', value: 'ChatDotRound', color: '#67C23A' },
  { label: 'Instagram', value: 'Instagram', color: '#E6A23C' },
  { label: 'Twitter', value: 'Twitter', color: '#1DA1F2' },
  { label: 'Facebook', value: 'Facebook', color: '#4267B2' },
  { label: '聊天框', value: 'ChatLineRound', color: '#F56C6C' },
  { label: '邮箱', value: 'Postcard', color: '#909399' },
  { label: '标签', value: 'Discount', color: '#9C27B0' },
  { label: '促销', value: 'Promotion', color: '#FF9800' },
  { label: '公文包', value: 'Briefcase', color: '#795548' },
  { label: '收藏', value: 'Collection', color: '#607D8B' },
  { label: '更多', value: 'More', color: '#2196F3' }
]

// 表格数据
const categoryList = ref([
  { 
    id: 1,
    name: '谷歌邮箱', 
    type: '邮箱',
    icon: 'Message',
    iconColor: '#409EFF',
    sort: 1,
    status: '启用',
    statusBool: true,
    createTime: '2024-03-01 10:00:00' 
  },
  { 
    id: 2,
    name: '微软邮箱', 
    type: '邮箱',
    icon: 'Message',
    iconColor: '#67C23A',
    sort: 2,
    status: '启用',
    statusBool: true,
    createTime: '2024-03-02 09:30:00' 
  },
  { 
    id: 3,
    name: 'Instagram账号', 
    type: '账号',
    icon: 'Instagram',
    iconColor: '#E6A23C',
    sort: 3,
    status: '启用',
    statusBool: true,
    createTime: '2024-03-03 09:00:00' 
  },
  { 
    id: 4,
    name: 'Twitter账号', 
    type: '账号',
    icon: 'Twitter',
    iconColor: '#1DA1F2',
    sort: 4,
    status: '启用',
    statusBool: true,
    createTime: '2024-03-04 08:30:00' 
  },
  { 
    id: 5,
    name: 'Facebook账号', 
    type: '账号',
    icon: 'Facebook',
    iconColor: '#4267B2',
    sort: 5,
    status: '启用',
    statusBool: true,
    createTime: '2024-03-05 08:00:00' 
  },
  { 
    id: 6,
    name: 'Discord账号', 
    type: '账号',
    icon: 'ChatDotRound',
    iconColor: '#7289DA',
    sort: 6,
    status: '启用',
    statusBool: true,
    createTime: '2024-03-06 08:00:00' 
  },
  { 
    id: 7,
    name: 'ChatGPT账号', 
    type: '账号',
    icon: 'ChatLineRound',
    iconColor: '#10A37F',
    sort: 7,
    status: '启用',
    statusBool: true,
    createTime: '2024-03-07 08:00:00' 
  },
  { 
    id: 8,
    name: '雅虎邮箱', 
    type: '邮箱',
    icon: 'Message',
    iconColor: '#6001D2',
    sort: 8,
    status: '启用',
    statusBool: true,
    createTime: '2024-03-08 08:00:00' 
  },
  { 
    id: 9,
    name: 'GMX邮箱账号', 
    type: '邮箱',
    icon: 'Message',
    iconColor: '#F56C6C',
    sort: 9,
    status: '启用',
    statusBool: true,
    createTime: '2024-03-09 08:00:00' 
  },
  { 
    id: 10,
    name: 'TikTok账号', 
    type: '账号',
    icon: 'Promotion',
    iconColor: '#000000',
    sort: 10,
    status: '启用',
    statusBool: true,
    createTime: '2024-03-10 08:00:00' 
  },
  { 
    id: 11,
    name: '美国AOL邮箱', 
    type: '邮箱',
    icon: 'Message',
    iconColor: '#FF0000',
    sort: 11,
    status: '启用',
    statusBool: true,
    createTime: '2024-03-11 08:00:00' 
  },
  { 
    id: 12,
    name: 'ProtonMail邮箱', 
    type: '邮箱',
    icon: 'Message',
    iconColor: '#8A2BE2',
    sort: 12,
    status: '启用',
    statusBool: true,
    createTime: '2024-03-12 08:00:00' 
  },
  { 
    id: 13,
    name: '亚马逊账号', 
    type: '账号',
    icon: 'Briefcase',
    iconColor: '#FF9900',
    sort: 13,
    status: '启用',
    statusBool: true,
    createTime: '2024-03-13 08:00:00' 
  },
  { 
    id: 14,
    name: 'Mail.COM邮箱', 
    type: '邮箱',
    icon: 'Message',
    iconColor: '#4CAF50',
    sort: 14,
    status: '启用',
    statusBool: true,
    createTime: '2024-03-14 08:00:00' 
  },
  { 
    id: 15,
    name: 'Naver邮箱', 
    type: '邮箱',
    icon: 'Message',
    iconColor: '#1EC800',
    sort: 15,
    status: '启用',
    statusBool: true,
    createTime: '2024-03-15 08:00:00' 
  },
  { 
    id: 16,
    name: '俄罗斯RU邮箱', 
    type: '邮箱',
    icon: 'Message',
    iconColor: '#2196F3',
    sort: 16,
    status: '启用',
    statusBool: true,
    createTime: '2024-03-16 08:00:00' 
  },
  { 
    id: 17,
    name: '德国DE邮箱', 
    type: '邮箱',
    icon: 'Message',
    iconColor: '#FFC107',
    sort: 17,
    status: '启用',
    statusBool: true,
    createTime: '2024-03-17 08:00:00' 
  },
  { 
    id: 18,
    name: '其他邮箱集合', 
    type: '邮箱',
    icon: 'More',
    iconColor: '#009688',
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
  type: '',
  icon: '',
  iconColor: '#409EFF',
  sort: 0,
  statusBool: true
})

// 表单验证规则
const rules = reactive<FormRules>({
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择分类类型', trigger: 'change' }
  ],
  icon: [
    { required: true, message: '请选择图标', trigger: 'change' }
  ],
  sort: [
    { required: true, message: '请输入排序', trigger: 'blur' }
  ]
})

// 获取分类类型对应的标签类型
const getTypeTag = (type: string) => {
  const typeMap: Record<string, string> = {
    '邮箱': 'primary',
    '账号': 'success'
  }
  return typeMap[type] || 'info'
}

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
  searchForm.type = ''
  searchForm.status = ''
}

// 状态变更
const handleStatusChange = (val: boolean, row: any) => {
  const statusText = val ? '启用' : '禁用'
  ElMessage.success(`分类"${row.name}"已${statusText}`)
  row.status = val ? '启用' : '禁用'
}

// 查看
const handleView = (row: any) => {
  console.log('查看分类', row)
  ElMessage.info(`查看分类: ${row.name}`)
}

// 新增分类
const handleAddCategory = () => {
  dialogType.value = 'add'
  categoryForm.id = 0
  categoryForm.name = ''
  categoryForm.type = ''
  categoryForm.icon = ''
  categoryForm.iconColor = '#409EFF'
  categoryForm.sort = categoryList.value.length + 1
  categoryForm.statusBool = true
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: any) => {
  dialogType.value = 'edit'
  categoryForm.id = row.id
  categoryForm.name = row.name
  categoryForm.type = row.type
  categoryForm.icon = row.icon
  categoryForm.iconColor = row.iconColor
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