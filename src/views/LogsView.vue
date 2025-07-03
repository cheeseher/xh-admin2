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
          <el-form-item label="操作类型">
            <el-select v-model="searchForm.operationType" placeholder="请选择操作类型" clearable style="width: 168px">
              <el-option label="全部" value=""></el-option>
              <el-option label="登录系统" value="登录系统"></el-option>
              <el-option label="余额操作" value="余额操作"></el-option>
              <el-option label="卡密操作" value="卡密操作"></el-option>
              <el-option label="商品操作" value="商品操作"></el-option>
              <el-option label="订单操作" value="订单操作"></el-option>
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
        <el-table-column prop="username" label="操作人" width="120"></el-table-column>
        <el-table-column prop="operationType" label="操作类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getOperationTypeTag(row.operationType)">{{ row.operationType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="操作描述" min-width="250"></el-table-column>
        <el-table-column prop="details" label="操作详情" min-width="300">
          <template #default="{ row }">
            <div v-if="row.details" class="operation-details">
              <el-popover
                placement="top-start"
                :width="400"
                trigger="hover"
                :content="row.details"
              >
                <template #reference>
                  <el-button link type="primary">查看详情</el-button>
                </template>
                <div class="details-content">
                  <pre>{{ row.details }}</pre>
                </div>
              </el-popover>
            </div>
            <span v-else>-</span>
          </template>
        </el-table-column>
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
  operationType: '',
  dateRange: []
})

// 表格数据
const tableData = ref([
  { 
    id: '1001',
    username: '张三',
    operationType: '登录系统',
    description: '用户登录系统',
    details: '登录IP: 192.168.1.100\n登录设备: Chrome浏览器\n登录地点: 上海',
    operationTime: '2024-03-15 08:30:00'
  },
  { 
    id: '1002',
    username: '李四',
    operationType: '余额操作',
    description: '增加用户余额',
    details: '操作用户: 用户ID 10086 (王小明)\n变更前余额: ¥100.00\n变更金额: +¥500.00\n变更后余额: ¥600.00\n变更原因: 充值',
    operationTime: '2024-03-15 09:15:00'
  },
  { 
    id: '1003',
    username: '王五',
    operationType: '商品操作',
    description: '新增商品',
    details: '商品名称: 高级会员\n商品价格: ¥99.00\n商品分类: VIP会员\n商品状态: 上架\n商品描述: 30天高级会员服务',
    operationTime: '2024-03-15 10:20:00'
  },
  { 
    id: '1004',
    username: '赵六',
    operationType: '订单操作',
    description: '修改订单状态',
    details: '订单号: ORD202403150001\n客户: 用户ID 10023 (李明)\n原状态: 待发货\n新状态: 已发货\n修改原因: 已完成发货处理',
    operationTime: '2024-03-15 11:30:00'
  },
  { 
    id: '1005',
    username: '张三',
    operationType: '商品操作',
    description: '编辑商品',
    details: '商品ID: PRD10023\n商品名称: 超级会员\n修改前: 价格 ¥199.00, 状态 下架\n修改后: 价格 ¥159.00, 状态 上架\n修改原因: 促销活动',
    operationTime: '2024-03-15 13:45:00'
  },
  { 
    id: '1006',
    username: '李四',
    operationType: '卡密操作',
    description: '新增卡密',
    details: '卡密批次: BATCH20240315\n卡密数量: 100张\n卡密类型: 充值卡\n面值: ¥50.00\n成本价: ¥45.00\n有效期: 2024-12-31',
    operationTime: '2024-03-15 14:50:00'
  },
  { 
    id: '1007',
    username: '王五',
    operationType: '余额操作',
    description: '扣减用户余额',
    details: '操作用户: 用户ID 10092 (张小红)\n变更前余额: ¥800.00\n变更金额: -¥200.00\n变更后余额: ¥600.00\n变更原因: 购买商品',
    operationTime: '2024-03-15 15:30:00'
  },
  { 
    id: '1008',
    username: '赵六',
    operationType: '登录系统',
    description: '用户退出系统',
    details: '登出IP: 192.168.1.200\n登录时长: 3小时25分钟\n会话ID: SES20240315001',
    operationTime: '2024-03-15 17:00:00'
  },
  { 
    id: '1009',
    username: '张三',
    operationType: '卡密操作',
    description: '导出卡密',
    details: '卡密批次: BATCH20240314\n卡密数量: 50张\n卡密类型: 会员卡\n导出格式: Excel\n导出原因: 客户需求',
    operationTime: '2024-03-16 09:30:00'
  },
  { 
    id: '1010',
    username: '李四',
    operationType: '订单操作',
    description: '取消订单',
    details: '订单号: ORD202403150008\n客户: 用户ID 10045 (陈小明)\n订单金额: ¥299.00\n取消原因: 客户申请退款\n退款状态: 已退款',
    operationTime: '2024-03-16 11:20:00'
  },
  { 
    id: '1011',
    username: '王五',
    operationType: '余额操作',
    description: '批量充值用户余额',
    details: '批次号: BATCH20240316001\n影响用户数: 50人\n充值金额: 每人¥100.00\n充值原因: 活动奖励\n操作人备注: 三八节活动奖励',
    operationTime: '2024-03-16 14:20:00'
  },
  { 
    id: '1012',
    username: '张三',
    operationType: '卡密操作',
    description: '批量生成卡密',
    details: '卡密批次: BATCH20240316002\n卡密数量: 200张\n卡密类型: 游戏点卡\n面值: ¥100.00\n成本价: ¥85.00\n有效期: 2024-06-30\n生成原因: 备货',
    operationTime: '2024-03-16 15:10:00'
  },
  { 
    id: '1013',
    username: '李四',
    operationType: '商品操作',
    description: '下架商品',
    details: '商品ID: PRD10045\n商品名称: 季度会员\n原状态: 上架\n新状态: 下架\n操作原因: 产品更新，等待新版本',
    operationTime: '2024-03-16 16:30:00'
  },
  { 
    id: '1014',
    username: '赵六',
    operationType: '订单操作',
    description: '批量发货',
    details: '批次号: BATCH20240316003\n订单数量: 15个\n订单类型: 虚拟卡密\n发货方式: 自动发货\n操作备注: 系统自动处理的订单',
    operationTime: '2024-03-16 17:45:00'
  },
  { 
    id: '1015',
    username: '王五',
    operationType: '登录系统',
    description: '异地登录警告',
    details: '登录IP: 220.181.38.148\n登录设备: Firefox浏览器\n登录地点: 北京\n异常类型: 地点变更\n上次登录: 上海',
    operationTime: '2024-03-17 08:15:00'
  },
  { 
    id: '1016',
    username: '张三',
    operationType: '余额操作',
    description: '调整用户余额',
    details: '操作用户: 用户ID 10102 (刘芳)\n变更前余额: ¥1,250.00\n变更金额: -¥250.00\n变更后余额: ¥1,000.00\n变更原因: 订单退款金额错误，系统调整',
    operationTime: '2024-03-17 09:30:00'
  },
  { 
    id: '1017',
    username: '李四',
    operationType: '卡密操作',
    description: '删除过期卡密',
    details: '卡密批次: BATCH20231215\n删除数量: 150张\n卡密类型: 月卡\n删除原因: 已过期未使用\n操作备注: 系统自动清理',
    operationTime: '2024-03-17 10:45:00'
  },
  { 
    id: '1018',
    username: '赵六',
    operationType: '商品操作',
    description: '新增商品分类',
    details: '分类名称: 节日特惠\n父级分类: 促销活动\n排序: 1\n状态: 启用\n描述: 用于各类节日促销活动的商品分类',
    operationTime: '2024-03-17 11:20:00'
  },
  { 
    id: '1019',
    username: '王五',
    operationType: '订单操作',
    description: '修改订单收货信息',
    details: '订单号: ORD202403170012\n客户: 用户ID 10078 (张伟)\n原收货地址: 上海市浦东新区张江高科技园区\n新收货地址: 上海市浦东新区金桥开发区\n修改原因: 客户申请',
    operationTime: '2024-03-17 14:10:00'
  },
  { 
    id: '1020',
    username: '张三',
    operationType: '商品操作',
    description: '批量调整商品价格',
    details: '批次号: BATCH20240317001\n影响商品数: 25个\n调整方式: 降价10%\n调整原因: 春季促销活动\n活动时间: 2024-03-18至2024-03-31',
    operationTime: '2024-03-17 15:30:00'
  },
  { 
    id: '1021',
    username: '李四',
    operationType: '余额操作',
    description: '用户提现申请审核',
    details: '用户ID: 10056 (王丽)\n提现金额: ¥2,000.00\n提现方式: 银行卡\n审核结果: 通过\n到账时间: 1-3个工作日',
    operationTime: '2024-03-17 16:45:00'
  },
  { 
    id: '1022',
    username: '赵六',
    operationType: '卡密操作',
    description: '修改卡密状态',
    details: '卡密ID: CARD20240310089\n卡密面值: ¥200.00\n原状态: 未使用\n新状态: 已使用\n修改原因: 手动激活\n关联订单: ORD202403170025',
    operationTime: '2024-03-17 17:20:00'
  },
  { 
    id: '1023',
    username: '王五',
    operationType: '登录系统',
    description: '密码修改',
    details: '操作类型: 修改登录密码\n操作IP: 192.168.1.105\n操作设备: Chrome浏览器\n操作结果: 成功',
    operationTime: '2024-03-18 09:10:00'
  },
  { 
    id: '1024',
    username: '张三',
    operationType: '订单操作',
    description: '订单备注修改',
    details: '订单号: ORD202403180003\n客户: 用户ID 10112 (李强)\n原备注: 无\n新备注: 客户要求工作日送货，避开周末\n修改原因: 客户要求',
    operationTime: '2024-03-18 10:30:00'
  },
  { 
    id: '1025',
    username: '李四',
    operationType: '商品操作',
    description: '更新商品库存',
    details: '商品ID: PRD10078\n商品名称: 年度会员\n原库存: 不限\n新库存: 500\n修改原因: 限量销售\n销售策略: 促进转化',
    operationTime: '2024-03-18 11:15:00'
  }
])

// 存储原始数据，用于筛选
const originalData = ref([...tableData.value])

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)

// 获取操作类型对应的标签类型
const getOperationTypeTag = (type: string) => {
  const typeMap: Record<string, string> = {
    '登录系统': 'info',
    '余额操作': 'success',
    '卡密操作': 'warning',
    '商品操作': 'primary',
    '订单操作': 'danger'
  }
  return typeMap[type] || 'info'
}

// 查询
const handleSearch = () => {
  currentPage.value = 1
  getLogList()
}

// 重置搜索
const handleReset = () => {
  searchForm.username = ''
  searchForm.operationType = ''
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
    const filteredData = originalData.value.filter((item: any) => {
      // 用户名筛选
      if (searchForm.username && !item.username.includes(searchForm.username)) {
        return false
      }
      // 操作类型筛选
      if (searchForm.operationType && item.operationType !== searchForm.operationType) {
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
    
    // 更新表格数据
    tableData.value = filteredData.slice(startIndex, endIndex)
    
    loading.value = false
  }, 300)
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
watch([() => searchForm.username, () => searchForm.operationType, () => searchForm.dateRange], () => {
  currentPage.value = 1
  getLogList()
})

// 初始化
onMounted(() => {
  // 初始化时设置总数
  total.value = originalData.value.length
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

.details-content {
  max-height: 300px;
  overflow-y: auto;
}

.details-content pre {
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
  font-family: inherit;
}
</style> 