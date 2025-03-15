<template>
  <div class="roles-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>角色管理</span>
          <el-button type="primary" @click="handleAddRole">新增角色</el-button>
        </div>
      </template>
      
      <!-- 搜索区域 -->
      <div class="search-area">
        <el-form :inline="true" :model="searchForm" class="demo-form-inline">
          <el-form-item label="角色名称">
            <el-input v-model="searchForm.name" placeholder="请输入角色名称" clearable></el-input>
          </el-form-item>
          <el-form-item label="角色状态">
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
      <el-table :data="roleList" style="width: 100%" v-loading="loading" border stripe>
        <el-table-column type="index" label="序号" width="60"></el-table-column>
        <el-table-column prop="roleId" label="角色ID" width="100"></el-table-column>
        <el-table-column prop="name" label="角色名称" width="150"></el-table-column>
        <el-table-column prop="permissionType" label="权限类型" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.permissionType === 'advanced' ? 'success' : 'warning'">
              {{ scope.row.permissionType === 'advanced' ? '高级权限' : '普通权限' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="角色描述" min-width="200"></el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-switch
              v-model="scope.row.statusBool"
              :active-value="true"
              :inactive-value="false"
              :disabled="scope.row.name === '超级管理员'"
              @change="(val: boolean) => handleStatusChange(val, scope.row)"
            ></el-switch>
            <span class="status-text">{{ scope.row.statusBool ? '启用' : '禁用' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180"></el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <el-button size="small" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
              <el-button size="small" type="success" @click="handlePermission(scope.row)">权限设置</el-button>
              <el-button 
                size="small" 
                type="danger" 
                @click="handleDelete(scope.row)"
                v-if="scope.row.name !== '超级管理员'"
              >删除</el-button>
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
        <el-form-item label="权限类型" prop="permissionType">
          <el-radio-group v-model="roleForm.permissionType">
            <el-radio :label="'normal'">普通权限</el-radio>
            <el-radio :label="'advanced'">高级权限</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="roleForm.permissionType === 'normal'">
          <div class="permission-description">
            <div class="permission-description-title">普通权限说明：</div>
            <ul class="permission-description-list">
              <li>商品订单不可删除，可发货</li>
              <li>充值订单不可确认支付</li>
              <li>商品列表可查看，不可上架</li>
              <li>商品分类可查看不可编辑</li>
              <li>库存管理可查看，不可编辑</li>
              <li>用户管理内仅可编辑为vip1权限</li>
              <li>会员设置不可编辑</li>
              <li>内容管理相关可编辑</li>
              <li>站内信仅可查看</li>
            </ul>
          </div>
        </el-form-item>
        <el-form-item v-else-if="roleForm.permissionType === 'advanced'">
          <div class="permission-description">
            <div class="permission-description-title">高级权限说明：</div>
            <p>高级权限支持项目内所有操作，无任何限制。</p>
          </div>
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
      width="700px"
    >
      <div v-if="currentRole">
        <p class="permission-title">当前角色: {{ currentRole.name }}</p>
        
        <div class="permission-type-info" v-if="currentRole.permissionType">
          <el-alert
            :title="currentRole.permissionType === 'advanced' ? '高级权限' : '普通权限'"
            :type="currentRole.permissionType === 'advanced' ? 'success' : 'warning'"
            :description="getPermissionTypeDescription(currentRole.permissionType)"
            show-icon
            :closable="false"
          />
        </div>
        
        <el-tree
          ref="permissionTreeRef"
          :data="permissionTree"
          show-checkbox
          node-key="id"
          :default-checked-keys="checkedPermissions"
          :props="{ label: 'name', children: 'children' }"
          :disabled="currentRole.name === '超级管理员'"
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
    status: '启用',
    statusBool: true,
    permissionType: 'advanced',
    createTime: '2023-12-01 10:00:00'
  },
  { 
    roleId: 'R002',
    name: '普通管理员1',
    description: '拥有部分管理权限，可以管理部分功能和数据',
    status: '启用',
    statusBool: true,
    permissionType: 'normal',
    createTime: '2023-12-05 14:30:00'
  },
  { 
    roleId: 'R003',
    name: '普通管理员2',
    description: '拥有部分管理权限，负责内容管理和用户服务',
    status: '启用',
    statusBool: true,
    permissionType: 'normal',
    createTime: '2023-12-10 09:15:00'
  },
  { 
    roleId: 'R004',
    name: '普通管理员3',
    description: '拥有部分管理权限，负责订单处理和客户服务',
    status: '启用',
    statusBool: true,
    permissionType: 'normal',
    createTime: '2023-12-15 16:45:00'
  },
  { 
    roleId: 'R005',
    name: '普通管理员4',
    description: '拥有部分管理权限，负责数据分析和报表生成',
    status: '禁用',
    statusBool: false,
    permissionType: 'normal',
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
  statusBool: true,
  permissionType: 'normal'
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
  ],
  permissionType: [
    { required: true, message: '请选择权限类型', trigger: 'change' }
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
    name: '数据概览',
    children: [
      { id: 101, name: '数据概览' }
    ]
  },
  {
    id: 2,
    name: '订单管理',
    children: [
      { id: 201, name: '商品订单' },
      { id: 202, name: '充值订单' }
    ]
  },
  {
    id: 3,
    name: '商品管理',
    children: [
      { id: 301, name: '商品列表' },
      { id: 302, name: '分类管理' },
      { id: 303, name: '库存管理' }
    ]
  },
  {
    id: 4,
    name: '用户管理',
    children: [
      { id: 401, name: '用户管理' }
    ]
  },
  {
    id: 5,
    name: '会员设置',
    children: [
      { id: 501, name: '会员设置' }
    ]
  },
  {
    id: 6,
    name: '内容管理',
    children: [
      { id: 601, name: '文档设置' },
      { id: 602, name: '模板设置' },
      { id: 603, name: '站内信' }
    ]
  },
  {
    id: 7,
    name: '权限管理',
    children: [
      { id: 701, name: '角色管理' },
      { id: 702, name: '账户管理' }
    ]
  },
  {
    id: 8,
    name: '系统管理',
    children: [
      { id: 801, name: '系统设置' },
      { id: 802, name: '操作日志' }
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
  if (row.name === '超级管理员') {
    ElMessage.warning('超级管理员角色不能被禁用')
    row.statusBool = true
    return
  }
  const statusText = val ? '启用' : '禁用'
  ElMessage.success(`角色"${row.name}"已${statusText}`)
  row.status = val ? '启用' : '禁用'
}

// 新增角色
const handleAddRole = () => {
  dialogType.value = 'add'
  roleForm.roleId = ''
  roleForm.name = ''
  roleForm.description = ''
  roleForm.statusBool = true
  roleForm.permissionType = 'normal'
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: any) => {
  dialogType.value = 'edit'
  roleForm.roleId = row.roleId
  roleForm.name = row.name
  roleForm.description = row.description
  roleForm.statusBool = row.statusBool
  roleForm.permissionType = row.permissionType || 'normal'
  dialogVisible.value = true
}

// 权限设置
const handlePermission = (row: any) => {
  currentRole.value = row
  // 根据角色类型设置权限
  if (row.roleId === 'R001' || row.permissionType === 'advanced') {
    // 超级管理员或高级权限拥有所有权限
    checkedPermissions.value = [
      101, 201, 202, 301, 302, 303, 401, 501, 601, 602, 603, 701, 702, 801, 802
    ]
  } else if (row.permissionType === 'normal') {
    // 普通权限根据规则设置
    // 商品订单不可删除，可发货
    // 充值订单不可确认支付
    // 商品列表可查看，不可上架
    // 商品分类可查看不可编辑
    // 库存管理可查看，不可编辑
    // 用户管理内仅可编辑为vip1权限
    // 会员设置不可编辑
    // 内容管理相关可编辑
    // 站内信仅可查看
    checkedPermissions.value = [
      101, // 数据概览
      201, // 商品订单（有限制）
      202, // 充值订单（有限制）
      301, // 商品列表（有限制）
      302, // 分类管理（有限制）
      303, // 库存管理（有限制）
      401, // 用户管理（有限制）
      // 501 会员设置不可编辑
      601, 602, // 内容管理相关可编辑
      603, // 站内信仅可查看
    ]
  } else {
    // 其他角色设置基本权限
    checkedPermissions.value = [101]
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
    
    // 如果是普通权限，需要应用权限限制规则
    if (currentRole.value && currentRole.value.permissionType === 'normal') {
      ElMessage.info('普通权限角色的部分操作将受到限制，详见权限说明')
    }
    
    ElMessage.success(`角色"${currentRole.value.name}"的权限已更新`)
    permissionDialogVisible.value = false
  }
}

// 获取权限类型描述
const getPermissionTypeDescription = (type: string) => {
  if (type === 'advanced') {
    return '高级权限支持项目内所有操作，无任何限制。'
  } else {
    return '普通权限有特定的操作限制，详见权限说明。'
  }
}

// 删除
const handleDelete = (row: any) => {
  if (row.name === '超级管理员') {
    ElMessage.warning('超级管理员角色不能被删除')
    return
  }
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
  gap: 5px;
  white-space: nowrap;
}

.action-buttons .el-button {
  margin-left: 0 !important;
  margin-right: 0 !important;
  padding-left: 8px;
  padding-right: 8px;
}

.permission-description {
  margin-top: 10px;
  margin-bottom: 10px;
}

.permission-description-title {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 5px;
}

.permission-description-list {
  list-style-type: disc;
  padding-left: 20px;
}

.permission-type-info {
  margin-bottom: 10px;
}
</style> 