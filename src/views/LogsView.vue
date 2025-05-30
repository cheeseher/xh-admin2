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
          <el-form-item label="用户名">
            <el-input v-model="searchForm.username" placeholder="请输入用户名" clearable></el-input>
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
        <el-table-column prop="username" label="用户名" width="120"></el-table-column>
        <el-table-column prop="description" label="操作描述" min-width="250"></el-table-column>
        <el-table-column prop="operationTime" label="操作时间" width="180"></el-table-column>
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'

// 搜索表单
const searchForm = reactive({
  username: '',
  dateRange: []
})

// 表格数据
const tableData = ref([
  { 
    id: '1001',
    username: '张三',
    description: '用户登录系统',
    operationTime: '2024-03-15 08:30:00'
  },
  { 
    id: '1002',
    username: '李四',
    description: '查询用户列表',
    operationTime: '2024-03-15 09:15:00'
  },
  { 
    id: '1003',
    username: '王五',
    description: '新增商品',
    operationTime: '2024-03-15 10:20:00'
  },
  { 
    id: '1004',
    username: '赵六',
    description: '修改订单状态',
    operationTime: '2024-03-15 11:30:00'
  },
  { 
    id: '1005',
    username: '张三',
    description: '删除商品分类',
    operationTime: '2024-03-15 13:45:00'
  },
  { 
    id: '1006',
    username: '李四',
    description: '导出订单数据',
    operationTime: '2024-03-15 14:50:00'
  },
  { 
    id: '1007',
    username: '王五',
    description: '上传商品图片',
    operationTime: '2024-03-15 15:30:00'
  },
  { 
    id: '1008',
    username: '赵六',
    description: '用户退出系统',
    operationTime: '2024-03-15 17:00:00'
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
  searchForm.username = ''
  searchForm.dateRange = []
  currentPage.value = 1
  getLogList()
}

// 导出日志
const handleExport = () => {
  ElMessage.success('日志导出成功')
}

// 获取日志列表数据
const getLogList = () => {
  // 模拟API请求
  loading.value = true
  setTimeout(() => {
    // 根据搜索条件和分页参数获取数据
    const filteredData = tableData.value.filter((item: any) => {
      // 用户名筛选
      if (searchForm.username && !item.username.includes(searchForm.username)) {
        return false
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
watch([() => searchForm.username, () => searchForm.dateRange], () => {
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
</style> 