<template>
  <div class="roles-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>角色管理</span>
          <el-button type="primary" size="small" @click="handleAddRole">新增角色</el-button>
        </div>
      </template>
      
      <!-- 搜索区域 -->
      <div class="search-area">
        <el-form :inline="true" :model="searchForm" class="demo-form-inline">
          <el-form-item label="角色名称">
            <el-input v-model="searchForm.name" placeholder="请输入角色名称" clearable></el-input>
          </el-form-item>
          <el-form-item label="角色状态">
            <el-select v-model="searchForm.status" placeholder="请选择" clearable>
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
      <el-table :data="roleList" style="width: 100%" v-loading="loading" border stripe>
        <el-table-column type="index" label="序号" width="60"></el-table-column>
        <el-table-column prop="roleId" label="角色ID" width="100"></el-table-column>
        <el-table-column prop="name" label="角色名称" width="150"></el-table-column>
        <el-table-column prop="description" label="角色描述" min-width="200"></el-table-column>
        <el-table-column prop="userCount" label="用户数量" width="100"></el-table-column>
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
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <el-button size="small" @click="handleView(scope.row)">查看</el-button>
              <el-button size="small" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
              <el-button size="small" type="success" @click="handlePermission(scope.row)">权限设置</el-button>
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
    
    <!-- 角色表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增角色' : '编辑角色'"
      width="500px"
    >
      <el-form :model="roleForm" label-width="100px" :rules="rules" ref="roleFormRef">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="roleForm.name" placeholder="请输入角色名称"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="description">
          <el-input v-model="roleForm.description" type="textarea" :rows="3" placeholder="请输入角色描述"></el-input>
        </el-form-item>
        <el-form-item label="角色状态">
          <el-switch v-model="roleForm.statusBool"></el-switch>
          <span class="status-text">{{ roleForm.statusBool ? '启用' : '禁用' }}</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 权限设置对话框 -->
    <el-dialog
      v-model="permissionDialogVisible"
      title="权限设置"
      width="600px"
    >
      <div v-if="currentRole">
        <p class="permission-title">当前角色: {{ currentRole.name }}</p>
        <el-tree
          ref="permissionTreeRef"
          :data="permissionTree"
          show-checkbox
          node-key="id"
          :default-checked-keys="checkedPermissions"
          :props="{ label: 'name', children: 'children' }"
        ></el-tree>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="permissionDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="savePermissions">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

// 搜索表单
const searchForm = reactive({
  name: '',
  status: ''
})

// 表格数据
const roleList = ref([
  { 
    roleId: 'R001',
    name: '超级管理员',
    description: '拥有系统所有权限，可以管理所有功能和数据',
    userCount: 2,
    status: '启用',
    statusBool: true,
    createTime: '2023-12-01 10:00:00'
  },
  { 
    roleId: 'R002',
    name: '普通管理员',
    description: '拥有部分管理权限，可以管理部分功能和数据',
    userCount: 5,
    status: '启用',
    statusBool: true,
    createTime: '2023-12-05 14:30:00'
  },
  { 
    roleId: 'R003',
    name: 'VIP用户',
    description: '高级会员，拥有特殊功能和服务',
    userCount: 28,
    status: '启用',
    statusBool: true,
    createTime: '2023-12-10 09:15:00'
  },
  { 
    roleId: 'R004',
    name: '普通用户',
    description: '基础会员，拥有基本功能和服务',
    userCount: 156,
    status: '启用',
    statusBool: true,
    createTime: '2023-12-15 16:45:00'
  },
  { 
    roleId: 'R005',
    name: '游客',
    description: '未注册用户，只能浏览部分内容',
    userCount: 0,
    status: '禁用',
    statusBool: false,
    createTime: '2023-12-20 11:20:00'
  }
])

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)
const loading = ref(false)

// 对话框相关
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const roleFormRef = ref<FormInstance>()
const roleForm = reactive({
  roleId: '',
  name: '',
  description: '',
  statusBool: true
})

// 表单验证规则
const rules = reactive<FormRules>({
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入角色描述', trigger: 'blur' },
    { max: 200, message: '长度不能超过 200 个字符', trigger: 'blur' }
  ]
})

// 权限设置相关
const permissionDialogVisible = ref(false)
const currentRole = ref<any>(null)
const permissionTreeRef = ref()
const checkedPermissions = ref<number[]>([])

// 权限树数据
const permissionTree = ref([
  {
    id: 1,
    name: '系统管理',
    children: [
      { id: 11, name: '用户管理' },
      { id: 12, name: '角色管理' },
      { id: 13, name: '菜单管理' },
      { id: 14, name: '部门管理' }
    ]
  },
  {
    id: 2,
    name: '内容管理',
    children: [
      { id: 21, name: '文章管理' },
      { id: 22, name: '分类管理' },
      { id: 23, name: '标签管理' },
      { id: 24, name: '评论管理' }
    ]
  },
  {
    id: 3,
    name: '商品管理',
    children: [
      { id: 31, name: '商品列表' },
      { id: 32, name: '商品分类' },
      { id: 33, name: '商品规格' },
      { id: 34, name: '商品评价' }
    ]
  },
  {
    id: 4,
    name: '订单管理',
    children: [
      { id: 41, name: '订单列表' },
      { id: 42, name: '订单设置' },
      { id: 43, name: '退款管理' },
      { id: 44, name: '物流管理' }
    ]
  },
  {
    id: 5,
    name: '统计分析',
    children: [
      { id: 51, name: '销售统计' },
      { id: 52, name: '用户统计' },
      { id: 53, name: '商品统计' },
      { id: 54, name: '搜索统计' }
    ]
  }
])

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
  ElMessage.success(`角色"${row.name}"已${statusText}`)
  row.status = val ? '启用' : '禁用'
}

// 查看
const handleView = (row: any) => {
  console.log('查看角色', row)
  ElMessage.info(`查看角色: ${row.name}`)
}

// 新增角色
const handleAddRole = () => {
  dialogType.value = 'add'
  roleForm.roleId = ''
  roleForm.name = ''
  roleForm.description = ''
  roleForm.statusBool = true
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: any) => {
  dialogType.value = 'edit'
  roleForm.roleId = row.roleId
  roleForm.name = row.name
  roleForm.description = row.description
  roleForm.statusBool = row.statusBool
  dialogVisible.value = true
}

// 权限设置
const handlePermission = (row: any) => {
  currentRole.value = row
  // 模拟获取当前角色的权限
  if (row.roleId === 'R001') {
    // 超级管理员拥有所有权限
    checkedPermissions.value = [11, 12, 13, 14, 21, 22, 23, 24, 31, 32, 33, 34, 41, 42, 43, 44, 51, 52, 53, 54]
  } else if (row.roleId === 'R002') {
    // 普通管理员拥有部分权限
    checkedPermissions.value = [11, 12, 21, 22, 23, 31, 32, 41, 42, 51]
  } else if (row.roleId === 'R003') {
    // VIP用户拥有部分权限
    checkedPermissions.value = [21, 22, 23, 31, 32, 41]
  } else if (row.roleId === 'R004') {
    // 普通用户拥有基本权限
    checkedPermissions.value = [21, 31, 41]
  } else {
    // 游客几乎没有权限
    checkedPermissions.value = []
  }
  permissionDialogVisible.value = true
}

// 保存权限
const savePermissions = () => {
  if (permissionTreeRef.value) {
    const checkedKeys = permissionTreeRef.value.getCheckedKeys()
    const halfCheckedKeys = permissionTreeRef.value.getHalfCheckedKeys()
    console.log('选中的权限', checkedKeys)
    console.log('半选中的权限', halfCheckedKeys)
    ElMessage.success(`角色"${currentRole.value.name}"的权限已更新`)
    permissionDialogVisible.value = false
  }
}

// 删除
const handleDelete = (row: any) => {
  ElMessageBox.confirm(
    `确定要删除角色"${row.name}"吗？`,
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
        message: `角色"${row.name}"已删除`,
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
  if (!roleFormRef.value) return
  
  await roleFormRef.value.validate((valid, fields) => {
    if (valid) {
      if (dialogType.value === 'add') {
        ElMessage.success('新增角色成功')
      } else {
        ElMessage.success('编辑角色成功')
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
.roles-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.permission-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 15px;
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