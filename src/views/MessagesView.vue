<template>
  <div class="messages-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>补货提醒</span>
          <el-button type="primary" @click="markAllAsResolved" :disabled="selectedMessages.length === 0">
            批量标记已解决
          </el-button>
        </div>
      </template>
      
      <div class="page-description">
        管理用户发来的补货提醒，您可以查看详情并标记为已解决。
      </div>
      
      <!-- 搜索区域 -->
      <div class="search-area">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="全部状态" clearable style="width: 168px;">
              <el-option label="未解决" value="pending"></el-option>
              <el-option label="已解决" value="resolved"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="用户邮箱">
            <el-input v-model="searchForm.email" placeholder="用户邮箱"></el-input>
          </el-form-item>
          <el-form-item label="商品名称">
            <el-input v-model="searchForm.productName" placeholder="商品名称"></el-input>
          </el-form-item>
          <el-form-item label="时间范围">
            <el-date-picker
              v-model="searchForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
            ></el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <!-- 消息列表 -->
      <div class="message-list">
        <el-table
          :data="messageList"
          style="width: 100%"
          @selection-change="handleSelectionChange"
          :row-class-name="getRowClassName"
        >
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column label="状态" width="100">
            <template #default="scope">
              <el-tag v-if="scope.row.status === 'pending'" type="danger">未解决</el-tag>
              <el-tag v-else-if="scope.row.status === 'resolved'" type="success">已解决</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="email" label="用户邮箱" width="200"></el-table-column>
          <el-table-column prop="productName" label="商品名称" min-width="150"></el-table-column>
          <el-table-column prop="quantity" label="需求数量" width="100"></el-table-column>
          <el-table-column prop="description" label="备注说明" min-width="200"></el-table-column>
          <el-table-column prop="createTime" label="发送时间" width="180"></el-table-column>
          <el-table-column label="操作" width="180" fixed="right">
            <template #default="scope">
              <div class="action-buttons">
                <el-button size="small" type="primary" @click="viewMessage(scope.row)">查看</el-button>
                <el-button 
                  size="small" 
                  type="primary" 
                  @click="resolveMessage(scope.row)"
                  :disabled="scope.row.status === 'resolved'"
                >解决</el-button>
                <el-button 
                  size="small" 
                  type="danger" 
                  @click="deleteMessage(scope.row.id)"
                >删除</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          :page-size="pageSize"
          :current-page="currentPage"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        ></el-pagination>
      </div>
    </el-card>
    
    <!-- 查看消息对话框 -->
    <el-dialog
      v-model="viewDialogVisible"
      title="补货提醒详情"
      width="600px"
    >
      <div class="message-detail">
        <div class="message-header">
          <div class="message-meta">
            <span>时间: {{ currentMessage.createTime }}</span>
            <el-tag v-if="currentMessage.status === 'pending'" type="danger">未解决</el-tag>
            <el-tag v-else-if="currentMessage.status === 'resolved'" type="success">已解决</el-tag>
          </div>
        </div>
        <div class="restock-info">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="用户邮箱">{{ currentMessage.email }}</el-descriptions-item>
            <el-descriptions-item label="商品名称">{{ currentMessage.productName }}</el-descriptions-item>
            <el-descriptions-item label="需求数量">{{ currentMessage.quantity }}</el-descriptions-item>
            <el-descriptions-item label="备注说明">{{ currentMessage.description }}</el-descriptions-item>
          </el-descriptions>
        </div>
        <div v-if="currentMessage.resolvedTime" class="resolved-info">
          <h4>解决信息</h4>
          <p>已于 {{ currentMessage.resolvedTime }} 标记为已解决</p>
          <p v-if="currentMessage.resolvedBy">处理人: {{ currentMessage.resolvedBy }}</p>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="viewDialogVisible = false">关闭</el-button>
          <el-button 
            type="success" 
            @click="resolveMessage(currentMessage)"
            :disabled="currentMessage.status === 'resolved'"
          >标记为已解决</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRoute } from 'vue-router'

// 获取路由对象
const route = useRoute()

// 搜索表单
const searchForm = reactive({
  status: '',
  email: '',
  productName: '',
  dateRange: [] as string[]
})

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

// 消息列表
const messageList = ref([
  {
    id: 1,
    email: 'newshengao@gmail.com',
    productName: '美国号码',
    quantity: 10,
    description: '需要更多号码，越快越好',
    status: 'pending',
    createTime: '2024-03-10 10:30:45'
  },
  {
    id: 2,
    email: 'agent001@example.com',
    productName: '美国号码',
    quantity: 50,
    description: '客户需要美国号码，急需补货',
    status: 'pending',
    createTime: '2024-03-07 16:45:10'
  },
  {
    id: 3,
    email: 'user123@example.com',
    productName: '英国号码',
    quantity: 20,
    description: '需要英国号码用于业务拓展',
    status: 'resolved',
    createTime: '2024-03-05 09:15:22',
    resolvedTime: '2024-03-05 11:30:45',
    resolvedBy: '管理员'
  },
  {
    id: 4,
    email: 'customer@example.com',
    productName: '加拿大号码',
    quantity: 15,
    description: '客户急需加拿大号码',
    status: 'resolved',
    createTime: '2024-03-03 14:20:15',
    resolvedTime: '2024-03-03 16:45:30',
    resolvedBy: '管理员'
  },
  {
    id: 5,
    email: 'business@example.com',
    productName: '澳大利亚号码',
    quantity: 30,
    description: '业务扩展需要澳大利亚号码',
    status: 'pending',
    createTime: '2024-03-01 11:10:05'
  }
])

// 选中的消息
const selectedMessages = ref<any[]>([])

// 当前查看的消息
const currentMessage = ref({
  id: 0,
  email: '',
  productName: '',
  quantity: 0,
  description: '',
  status: '',
  createTime: '',
  resolvedTime: '',
  resolvedBy: ''
})

// 对话框显示状态
const viewDialogVisible = ref(false)

// 处理搜索
const handleSearch = () => {
  // 实际项目中这里应该调用API进行搜索
  ElMessage.success('搜索条件已应用')
  currentPage.value = 1
}

// 重置搜索
const resetSearch = () => {
  searchForm.status = ''
  searchForm.email = ''
  searchForm.productName = ''
  searchForm.dateRange = []
  handleSearch()
}

// 处理分页大小变化
const handleSizeChange = (size: number) => {
  pageSize.value = size
  // 重新加载数据
}

// 处理页码变化
const handleCurrentChange = (page: number) => {
  currentPage.value = page
  // 重新加载数据
}

// 处理表格选择变化
const handleSelectionChange = (selection: any[]) => {
  selectedMessages.value = selection
}

// 获取行的类名
const getRowClassName = ({ row }: { row: any }) => {
  if (row.status === 'pending') {
    return 'pending-row'
  }
  return ''
}

// 查看消息
const viewMessage = (message: any) => {
  currentMessage.value = { ...message }
  viewDialogVisible.value = true
}

// 标记消息为已解决
const resolveMessage = (message: any) => {
  // 实际项目中这里应该调用API标记为已解决
  const index = messageList.value.findIndex(item => item.id === message.id)
  if (index !== -1) {
    messageList.value[index].status = 'resolved'
    messageList.value[index].resolvedTime = new Date().toLocaleString()
    messageList.value[index].resolvedBy = '管理员' // 实际项目中应该是当前登录用户
    
    // 如果是当前查看的消息，也更新当前消息的状态
    if (currentMessage.value.id === message.id) {
      currentMessage.value.status = 'resolved'
      currentMessage.value.resolvedTime = messageList.value[index].resolvedTime
      currentMessage.value.resolvedBy = messageList.value[index].resolvedBy
    }
    
    // 记录操作日志（实际项目中应该调用API）
    console.log(`记录操作日志: 用户标记补货提醒(ID: ${message.id})为已解决`)
    
    ElMessage.success('已标记为已解决')
  }
}

// 删除消息
const deleteMessage = (id: number) => {
  ElMessageBox.confirm('确定要删除这条补货提醒吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 实际项目中这里应该调用API删除消息
    const index = messageList.value.findIndex(item => item.id === id)
    if (index !== -1) {
      messageList.value.splice(index, 1)
    }
    ElMessage.success('删除成功')
  }).catch(() => {
    // 取消删除
  })
}

// 批量标记为已解决
const markAllAsResolved = () => {
  if (selectedMessages.value.length === 0) {
    ElMessage.warning('请选择要标记的补货提醒')
    return
  }
  
  // 实际项目中这里应该调用API批量标记为已解决
  const ids = selectedMessages.value.map((item: any) => item.id)
  const now = new Date().toLocaleString()
  
  messageList.value.forEach(item => {
    if (ids.includes(item.id) && item.status === 'pending') {
      item.status = 'resolved'
      item.resolvedTime = now
      item.resolvedBy = '管理员' // 实际项目中应该是当前登录用户
      
      // 记录操作日志（实际项目中应该调用API）
      console.log(`记录操作日志: 用户标记补货提醒(ID: ${item.id})为已解决`)
    }
  })
  
  ElMessage.success(`已将${ids.length}条补货提醒标记为已解决`)
}

// 获取未解决的补货提醒数量
const getPendingCount = () => {
  return messageList.value.filter(item => item.status === 'pending').length
}

// 初始化
onMounted(() => {
  // 从URL参数中获取筛选条件
  const query = route.query
  if (query.status) {
    searchForm.status = query.status as string
    handleSearch()
  }
})

// 导出未解决的补货提醒数量，供其他组件使用
defineExpose({
  getPendingCount
})
</script>

<style scoped>
.messages-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-description {
  margin-bottom: 20px;
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
}

.search-area {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.message-list {
  margin-bottom: 20px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.message-detail {
  padding: 10px;
}

.message-header {
  margin-bottom: 20px;
}

.message-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
  font-size: 14px;
  color: #909399;
}

.restock-info {
  margin-bottom: 20px;
}

.restock-info h4, .resolved-info h4 {
  margin: 0 0 10px 0;
  font-size: 16px;
  color: #303133;
}

.resolved-info {
  margin-top: 20px;
  padding: 15px;
  background-color: #f0f9eb;
  border-radius: 4px;
}

/* 未解决消息样式 */
:deep(.pending-row) {
  background-color: #fff8f6;
  font-weight: bold;
}

:deep(.pending-row:hover) {
  background-color: #ffece8 !important;
}

.action-buttons {
  display: flex;
  gap: 5px;
  white-space: nowrap;
}

.action-buttons .el-button {
  padding-left: 8px;
  padding-right: 8px;
}
</style> 