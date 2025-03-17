<template>
  <div class="logs-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>操作日志</span>
          <el-button type="primary" size="small" @click="handleExport">导出日志</el-button>
        </div>
      </template>
      
      <div class="page-description">
        <p>记录系统中的所有操作行为，包括登录、新增、修改、删除等操作，方便追踪用户行为和系统安全审计。</p>
      </div>
      
      <!-- 搜索区域 -->
      <div class="search-area">
        <el-form :inline="true" :model="searchForm" class="demo-form-inline">
          <el-form-item label="操作人">
            <el-input v-model="searchForm.operator" placeholder="请输入操作人" clearable></el-input>
          </el-form-item>
          <el-form-item label="操作类型">
            <el-select v-model="searchForm.operationType" placeholder="请选择" clearable style="width: 168px;">
              <el-option label="全部" value=""></el-option>
              <el-option 
                v-for="type in operationTypes" 
                :key="type.value" 
                :label="type.label" 
                :value="type.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="操作模块">
            <el-select v-model="searchForm.module" placeholder="请选择" clearable style="width: 168px;">
              <el-option label="全部" value=""></el-option>
              <el-option 
                v-for="module in moduleOptions" 
                :key="module.value" 
                :label="module.label" 
                :value="module.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="操作状态">
            <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 168px;">
              <el-option label="全部" value=""></el-option>
              <el-option label="成功" value="success"></el-option>
              <el-option label="失败" value="fail"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="操作时间">
            <el-date-picker
              v-model="searchForm.dateRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              value-format="YYYY-MM-DD HH:mm:ss"
              :default-time="['00:00:00', '23:59:59']"
            ></el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <!-- 表格区域 -->
      <el-table :data="tableData" style="width: 100%" v-loading="loading" border stripe>
        <el-table-column prop="id" label="日志ID" width="80"></el-table-column>
        <el-table-column prop="operator" label="操作人" width="120"></el-table-column>
        <el-table-column prop="operationType" label="操作类型" width="100">
          <template #default="scope">
            <el-tag :type="getOperationTypeTag(scope.row.operationType)">{{ getOperationTypeLabel(scope.row.operationType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="module" label="操作模块" width="120"></el-table-column>
        <el-table-column prop="ip" label="IP地址" width="120"></el-table-column>
        <el-table-column prop="description" label="操作描述" min-width="250"></el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="scope">
            <el-tag :type="scope.row.status === '成功' ? 'success' : 'danger'">{{ scope.row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operationTime" label="操作时间" width="180"></el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <el-button size="small" type="primary" @click="handleView(scope.row)">详情</el-button>
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
    
    <!-- 日志详情对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="日志详情"
      width="700px"
    >
      <div class="log-detail">
        <div class="detail-section">
          <h4>基本信息</h4>
          <div class="detail-item">
            <span class="label">日志ID：</span>
            <span>{{ currentLog.id }}</span>
          </div>
          <div class="detail-item">
            <span class="label">操作人：</span>
            <span>{{ currentLog.operator }}</span>
          </div>
          <div class="detail-item">
            <span class="label">操作类型：</span>
            <span>
              <el-tag size="small" :type="getOperationTypeTag(currentLog.operationType)">
                {{ getOperationTypeLabel(currentLog.operationType) }}
              </el-tag>
            </span>
          </div>
          <div class="detail-item">
            <span class="label">操作模块：</span>
            <span>{{ currentLog.module }}</span>
          </div>
          <div class="detail-item">
            <span class="label">操作状态：</span>
            <span>
              <el-tag size="small" :type="currentLog.status === '成功' ? 'success' : 'danger'">
                {{ currentLog.status }}
              </el-tag>
            </span>
          </div>
          <div class="detail-item">
            <span class="label">操作时间：</span>
            <span>{{ currentLog.operationTime }}</span>
          </div>
        </div>
        
        <div class="detail-section">
          <h4>操作详情</h4>
          <div class="detail-item">
            <span class="label">IP地址：</span>
            <span>{{ currentLog.ip }}</span>
          </div>
          <div class="detail-item">
            <span class="label">操作描述：</span>
            <span>{{ currentLog.description }}</span>
          </div>
          <div class="detail-item">
            <span class="label">请求方法：</span>
            <span>{{ currentLog.method }}</span>
          </div>
          <div class="detail-item">
            <span class="label">请求URL：</span>
            <span>{{ currentLog.url }}</span>
          </div>
        </div>
        
        <div class="detail-section" v-if="currentLog.requestParams">
          <h4>请求参数</h4>
          <div class="code-block">
            <pre>{{ formatJson(currentLog.requestParams) }}</pre>
          </div>
        </div>
        
        <div class="detail-section" v-if="currentLog.responseData">
          <h4>响应数据</h4>
          <div class="code-block">
            <pre>{{ formatJson(currentLog.responseData) }}</pre>
          </div>
        </div>
        
        <div class="detail-section" v-if="currentLog.errorMessage">
          <h4>错误信息</h4>
          <div class="code-block error">
            <pre>{{ currentLog.errorMessage }}</pre>
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 搜索表单
const searchForm = reactive({
  operator: '',
  operationType: '',
  module: '',
  status: '',
  dateRange: []
})

// 操作类型选项
const operationTypes = ref([
  { value: 'login', label: '登录' },
  { value: 'logout', label: '登出' },
  { value: 'query', label: '查询' },
  { value: 'add', label: '新增' },
  { value: 'update', label: '修改' },
  { value: 'delete', label: '删除' },
  { value: 'import', label: '导入' },
  { value: 'export', label: '导出' },
  { value: 'upload', label: '上传' },
  { value: 'download', label: '下载' },
  { value: 'other', label: '其他' }
])

// 模块选项
const moduleOptions = ref([
  { value: 'system', label: '系统管理' },
  { value: 'user', label: '用户管理' },
  { value: 'role', label: '角色管理' },
  { value: 'account', label: '账户管理' },
  { value: 'product', label: '商品管理' },
  { value: 'order', label: '订单管理' },
  { value: 'category', label: '分类管理' },
  { value: 'member', label: '会员管理' },
  { value: 'template', label: '模板管理' },
  { value: 'setting', label: '系统设置' }
])

// 获取操作类型标签
const getOperationTypeTag = (type: string) => {
  const tagMap: Record<string, string> = {
    'login': 'success',
    'logout': 'info',
    'query': 'info',
    'add': 'primary',
    'update': 'warning',
    'delete': 'danger',
    'import': 'success',
    'export': 'success',
    'upload': 'primary',
    'download': 'primary',
    'other': 'info'
  }
  return tagMap[type] || 'info'
}

// 获取操作类型标签文本
const getOperationTypeLabel = (type: string) => {
  const option = operationTypes.value.find(item => item.value === type)
  return option ? option.label : type
}

// 表格数据
const tableData = ref([
  { 
    id: '1001',
    operator: '张三',
    operationType: 'login',
    module: '系统管理',
    ip: '192.168.1.1',
    description: '用户登录系统',
    status: '成功',
    operationTime: '2024-03-15 08:30:00',
    method: 'POST',
    url: '/api/login',
    requestParams: JSON.stringify({ username: 'admin', password: '******' }),
    responseData: JSON.stringify({ code: 200, message: '登录成功', data: { token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' } }),
    errorMessage: ''
  },
  { 
    id: '1002',
    operator: '李四',
    operationType: 'query',
    module: '用户管理',
    ip: '192.168.1.2',
    description: '查询用户列表',
    status: '成功',
    operationTime: '2024-03-15 09:15:00',
    method: 'GET',
    url: '/api/users',
    requestParams: JSON.stringify({ page: 1, size: 10 }),
    responseData: JSON.stringify({ code: 200, message: '查询成功', data: { total: 100, list: [] } }),
    errorMessage: ''
  },
  { 
    id: '1003',
    operator: '王五',
    operationType: 'add',
    module: '商品管理',
    ip: '192.168.1.3',
    description: '新增商品',
    status: '成功',
    operationTime: '2024-03-15 10:20:00',
    method: 'POST',
    url: '/api/products',
    requestParams: JSON.stringify({ name: '测试商品', price: 99.9, stock: 100 }),
    responseData: JSON.stringify({ code: 200, message: '新增成功', data: { id: 1001 } }),
    errorMessage: ''
  },
  { 
    id: '1004',
    operator: '赵六',
    operationType: 'update',
    module: '订单管理',
    ip: '192.168.1.4',
    description: '修改订单状态',
    status: '成功',
    operationTime: '2024-03-15 11:30:00',
    method: 'PUT',
    url: '/api/orders/10086',
    requestParams: JSON.stringify({ status: 'shipped' }),
    responseData: JSON.stringify({ code: 200, message: '修改成功' }),
    errorMessage: ''
  },
  { 
    id: '1005',
    operator: '张三',
    operationType: 'delete',
    module: '分类管理',
    ip: '192.168.1.1',
    description: '删除商品分类',
    status: '失败',
    operationTime: '2024-03-15 13:45:00',
    method: 'DELETE',
    url: '/api/categories/123',
    requestParams: '',
    responseData: '',
    errorMessage: '该分类下存在关联商品，无法删除'
  },
  { 
    id: '1006',
    operator: '李四',
    operationType: 'export',
    module: '订单管理',
    ip: '192.168.1.2',
    description: '导出订单数据',
    status: '成功',
    operationTime: '2024-03-15 14:50:00',
    method: 'GET',
    url: '/api/orders/export',
    requestParams: JSON.stringify({ startDate: '2024-03-01', endDate: '2024-03-15' }),
    responseData: '',
    errorMessage: ''
  },
  { 
    id: '1007',
    operator: '王五',
    operationType: 'upload',
    module: '商品管理',
    ip: '192.168.1.3',
    description: '上传商品图片',
    status: '成功',
    operationTime: '2024-03-15 15:30:00',
    method: 'POST',
    url: '/api/upload',
    requestParams: 'FormData',
    responseData: JSON.stringify({ code: 200, message: '上传成功', data: { url: '/uploads/products/image001.jpg' } }),
    errorMessage: ''
  },
  { 
    id: '1008',
    operator: '赵六',
    operationType: 'logout',
    module: '系统管理',
    ip: '192.168.1.4',
    description: '用户退出系统',
    status: '成功',
    operationTime: '2024-03-15 17:00:00',
    method: 'POST',
    url: '/api/logout',
    requestParams: '',
    responseData: JSON.stringify({ code: 200, message: '退出成功' }),
    errorMessage: ''
  }
])

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)

// 查询
const handleSearch = () => {
  currentPage.value = 1
  getLogList()
}

// 重置搜索
const handleReset = () => {
  searchForm.operator = ''
  searchForm.operationType = ''
  searchForm.module = ''
  searchForm.status = ''
  searchForm.dateRange = []
  currentPage.value = 1
  getLogList()
}

// 导出日志
const handleExport = () => {
  ElMessage.success('日志导出成功')
}

// 当前查看的日志
const currentLog = reactive({
  id: '',
  operator: '',
  operationType: '',
  module: '',
  ip: '',
  description: '',
  status: '',
  operationTime: '',
  method: '',
  url: '',
  requestParams: '',
  responseData: '',
  errorMessage: ''
})

// 对话框相关
const dialogVisible = ref(false)

// 查看日志详情
const handleView = (row: any) => {
  Object.assign(currentLog, row)
  dialogVisible.value = true
}

// 格式化JSON
const formatJson = (json: string) => {
  try {
    const obj = JSON.parse(json)
    return JSON.stringify(obj, null, 2)
  } catch (e) {
    return json
  }
}

// 获取日志列表数据
const getLogList = () => {
  // 模拟API请求
  loading.value = true
  setTimeout(() => {
    // 根据搜索条件和分页参数获取数据
    const filteredData = tableData.value.filter((item: any) => {
      // 操作人筛选
      if (searchForm.operator && !item.operator.includes(searchForm.operator)) {
        return false
      }
      // 操作类型筛选
      if (searchForm.operationType && item.operationType !== searchForm.operationType) {
        return false
      }
      // 模块筛选
      if (searchForm.module && !item.module.includes(searchForm.module)) {
        return false
      }
      // 状态筛选
      if (searchForm.status) {
        if (searchForm.status === 'success' && item.status !== '成功') {
          return false
        }
        if (searchForm.status === 'fail' && item.status !== '失败') {
          return false
        }
      }
      // 日期范围筛选
      if (searchForm.dateRange && searchForm.dateRange.length === 2) {
        const startDate = new Date(searchForm.dateRange[0])
        const endDate = new Date(searchForm.dateRange[1])
        const operationDate = new Date(item.operationTime)
        if (operationDate < startDate || operationDate > endDate) {
          return false
        }
      }
      return true
    })
    
    // 计算总数
    total.value = filteredData.length
    
    // 分页处理
    const startIndex = (currentPage.value - 1) * pageSize.value
    const endIndex = startIndex + pageSize.value
    tableData.value = filteredData.slice(startIndex, endIndex)
    
    loading.value = false
  }, 500)
}

// 处理每页显示数量变化
const handleSizeChange = (val: number) => {
  pageSize.value = val
  getLogList()
}

// 处理页码变化
const handleCurrentChange = (val: number) => {
  currentPage.value = val
  getLogList()
}

// 监听搜索表单变化，重置分页并重新获取数据
watch([() => searchForm.operator, () => searchForm.operationType, () => searchForm.module, () => searchForm.status, () => searchForm.dateRange], () => {
  currentPage.value = 1
  getLogList()
})

// 初始化
onMounted(() => {
  getLogList()
})
</script>

<style scoped>
.logs-container {
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

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.log-detail {
  padding: 10px;
}

.detail-section {
  margin-bottom: 20px;
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 4px;
}

.detail-section h4 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #606266;
  font-size: 16px;
  border-left: 3px solid #409EFF;
  padding-left: 10px;
}

.detail-item {
  margin-bottom: 10px;
}

.detail-item .label {
  font-weight: bold;
  color: #606266;
  display: inline-block;
  width: 100px;
}

.code-block {
  background-color: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 10px;
  max-height: 200px;
  overflow: auto;
}

.code-block pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: Consolas, Monaco, 'Andale Mono', monospace;
  font-size: 12px;
  line-height: 1.5;
}

.code-block.error {
  background-color: #fef0f0;
  border-color: #fde2e2;
  color: #f56c6c;
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
</style> 