<template>
  <div class="faq-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>常见问题管理</span>
          <el-button type="primary" size="small" @click="handleAddQuestion">新增问题</el-button>
        </div>
      </template>
      
      <div class="page-description">
        <p>管理网站前台显示的常见问题，包括账号使用、订单相关、支付说明等问题类型。您可以添加、编辑、删除问题，并设置问题的分类、排序和显示状态。</p>
      </div>
      
      <!-- 搜索区域 -->
      <div class="search-area">
        <el-form :inline="true" :model="searchForm" class="demo-form-inline">
          <el-form-item label="问题标题">
            <el-input v-model="searchForm.title" placeholder="请输入问题标题" clearable></el-input>
          </el-form-item>
          <el-form-item label="问题分类">
            <el-select v-model="searchForm.category" placeholder="请选择" clearable style="width: 168px;">
              <el-option label="全部" value=""></el-option>
              <el-option label="账号问题" value="account"></el-option>
              <el-option label="订单问题" value="order"></el-option>
              <el-option label="支付问题" value="payment"></el-option>
              <el-option label="使用问题" value="usage"></el-option>
              <el-option label="其他问题" value="other"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 168px;">
              <el-option label="全部" value=""></el-option>
              <el-option label="已发布" value="published"></el-option>
              <el-option label="未发布" value="unpublished"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <!-- 表格区域 -->
      <el-table :data="faqList" style="width: 100%" v-loading="loading" border stripe>
        <el-table-column type="index" label="序号" width="60"></el-table-column>
        <el-table-column prop="title" label="问题标题" min-width="250" show-overflow-tooltip></el-table-column>
        <el-table-column prop="category" label="问题分类" width="120">
          <template #default="scope">
            <el-tag :type="getCategoryTag(scope.row.category)">{{ getCategoryName(scope.row.category) }}</el-tag>
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
            <span class="status-text">{{ scope.row.statusBool ? '已发布' : '未发布' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180"></el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="handleView(scope.row)">查看</el-button>
            <el-button size="small" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
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
    
    <!-- 问题表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增问题' : '编辑问题'"
      width="800px"
    >
      <el-form :model="faqForm" label-width="100px" :rules="rules" ref="faqFormRef">
        <el-form-item label="问题标题" prop="title">
          <el-input v-model="faqForm.title" placeholder="请输入问题标题"></el-input>
        </el-form-item>
        <el-form-item label="问题分类" prop="category">
          <el-select v-model="faqForm.category" placeholder="请选择问题分类" style="width: 100%;">
            <el-option label="账号问题" value="account"></el-option>
            <el-option label="订单问题" value="order"></el-option>
            <el-option label="支付问题" value="payment"></el-option>
            <el-option label="使用问题" value="usage"></el-option>
            <el-option label="其他问题" value="other"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="问题回答" prop="answer">
          <el-input 
            v-model="faqForm.answer" 
            type="textarea" 
            :rows="10" 
            placeholder="请输入问题回答，支持HTML格式"
          ></el-input>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="faqForm.sort" :min="0" :max="999" style="width: 100%;"></el-input-number>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="faqForm.statusBool"></el-switch>
          <span class="status-text">{{ faqForm.statusBool ? '已发布' : '未发布' }}</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 查看问题对话框 -->
    <el-dialog
      v-model="viewDialogVisible"
      title="查看问题"
      width="800px"
    >
      <div class="view-dialog-content">
        <h2>{{ viewForm.title }}</h2>
        <div class="view-info">
          <el-tag :type="getCategoryTag(viewForm.category)">{{ getCategoryName(viewForm.category) }}</el-tag>
          <span class="view-time">创建时间：{{ viewForm.createTime }}</span>
        </div>
        <div class="view-answer" v-html="viewForm.answer"></div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="viewDialogVisible = false">关闭</el-button>
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
  title: '',
  category: '',
  status: ''
})

// 表格数据
const faqList = ref([
  { 
    id: 1,
    title: '如何修改账号密码？', 
    category: 'account',
    sort: 1,
    status: '已发布',
    statusBool: true,
    answer: '<p>修改账号密码的步骤如下：</p><ol><li>登录您的账号</li><li>进入账号设置页面</li><li>点击"修改密码"按钮</li><li>输入原密码和新密码</li><li>点击"确认"按钮完成修改</li></ol><p>注意：为了账号安全，建议定期修改密码，并使用包含字母、数字和特殊字符的复杂密码。</p>',
    createTime: '2024-03-01 10:00:00' 
  },
  { 
    id: 2,
    title: '订单支付后多久能收到账号？', 
    category: 'order',
    sort: 2,
    status: '已发布',
    statusBool: true,
    answer: '<p>订单支付成功后，系统会根据不同的发货方式处理您的订单：</p><ol><li>自动发货商品：支付成功后立即发货，您可以在订单详情页查看账号信息</li><li>手动发货商品：工作人员会在1-24小时内处理您的订单，并发送账号信息</li></ol><p>如果超过24小时仍未收到账号，请联系客服处理。</p>',
    createTime: '2024-03-02 09:30:00' 
  },
  { 
    id: 3,
    title: '支持哪些支付方式？', 
    category: 'payment',
    sort: 3,
    status: '已发布',
    statusBool: true,
    answer: '<p>我们目前支持以下支付方式：</p><ul><li>支付宝</li><li>微信支付</li><li>银行卡</li><li>PayPal（国际用户）</li><li>USDT</li></ul><p>不同的支付方式可能有不同的手续费和到账时间，请根据自己的情况选择合适的支付方式。</p>',
    createTime: '2024-03-03 09:00:00' 
  },
  { 
    id: 4,
    title: '如何使用Gmail邮箱？', 
    category: 'usage',
    sort: 4,
    status: '已发布',
    statusBool: true,
    answer: '<p>使用Gmail邮箱的基本步骤：</p><ol><li>访问 <a href="https://mail.google.com" target="_blank">https://mail.google.com</a></li><li>输入您购买的Gmail账号和密码</li><li>如果提示需要验证，请按照提示完成验证步骤</li><li>登录成功后，您可以开始使用Gmail发送和接收邮件</li></ol><p>建议首次登录后修改密码，并开启两步验证以提高账号安全性。</p>',
    createTime: '2024-03-04 08:30:00' 
  },
  { 
    id: 5,
    title: '账号被锁定怎么办？', 
    category: 'account',
    sort: 5,
    status: '已发布',
    statusBool: true,
    answer: '<p>如果您的账号被锁定，可以尝试以下方法解决：</p><ol><li>按照平台提供的账号恢复流程操作</li><li>提供必要的身份验证信息</li><li>等待平台审核（通常需要24-48小时）</li></ol><p>如果以上方法无法解决，请联系我们的客服团队，提供订单号和账号信息，我们会协助您处理。</p>',
    createTime: '2024-03-05 08:00:00' 
  }
])

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(5)
const loading = ref(false)

// 对话框相关
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const faqFormRef = ref<FormInstance>()
const faqForm = reactive({
  id: 0,
  title: '',
  category: '',
  answer: '',
  sort: 0,
  statusBool: true
})

// 查看对话框相关
const viewDialogVisible = ref(false)
const viewForm = reactive({
  id: 0,
  title: '',
  category: '',
  answer: '',
  createTime: ''
})

// 表单验证规则
const rules = reactive<FormRules>({
  title: [
    { required: true, message: '请输入问题标题', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择问题分类', trigger: 'change' }
  ],
  answer: [
    { required: true, message: '请输入问题回答', trigger: 'blur' },
    { min: 10, message: '回答内容不能少于10个字符', trigger: 'blur' }
  ],
  sort: [
    { required: true, message: '请输入排序', trigger: 'blur' }
  ]
})

// 获取分类对应的标签类型
const getCategoryTag = (category: string) => {
  const categoryMap: Record<string, string> = {
    'account': 'primary',
    'order': 'success',
    'payment': 'warning',
    'usage': 'info',
    'other': 'danger'
  }
  return categoryMap[category] || 'info'
}

// 获取分类名称
const getCategoryName = (category: string) => {
  const categoryMap: Record<string, string> = {
    'account': '账号问题',
    'order': '订单问题',
    'payment': '支付问题',
    'usage': '使用问题',
    'other': '其他问题'
  }
  return categoryMap[category] || '未知分类'
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
  searchForm.title = ''
  searchForm.category = ''
  searchForm.status = ''
}

// 状态变更
const handleStatusChange = (val: boolean, row: any) => {
  const statusText = val ? '发布' : '取消发布'
  ElMessage.success(`问题"${row.title}"已${statusText}`)
  row.status = val ? '已发布' : '未发布'
}

// 查看
const handleView = (row: any) => {
  viewForm.id = row.id
  viewForm.title = row.title
  viewForm.category = row.category
  viewForm.answer = row.answer
  viewForm.createTime = row.createTime
  viewDialogVisible.value = true
}

// 新增问题
const handleAddQuestion = () => {
  dialogType.value = 'add'
  faqForm.id = 0
  faqForm.title = ''
  faqForm.category = ''
  faqForm.answer = ''
  faqForm.sort = faqList.value.length + 1
  faqForm.statusBool = true
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: any) => {
  dialogType.value = 'edit'
  faqForm.id = row.id
  faqForm.title = row.title
  faqForm.category = row.category
  faqForm.answer = row.answer
  faqForm.sort = row.sort
  faqForm.statusBool = row.statusBool
  dialogVisible.value = true
}

// 删除
const handleDelete = (row: any) => {
  ElMessageBox.confirm(
    `确定要删除问题"${row.title}"吗？`,
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
        message: `问题"${row.title}"已删除`,
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
  if (!faqFormRef.value) return
  
  await faqFormRef.value.validate((valid, fields) => {
    if (valid) {
      if (dialogType.value === 'add') {
        ElMessage.success('新增问题成功')
      } else {
        ElMessage.success('编辑问题成功')
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
.faq-container {
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

.view-dialog-content {
  padding: 0 20px;
}

.view-dialog-content h2 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #303133;
  font-size: 20px;
}

.view-info {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}

.view-time {
  margin-left: 15px;
  color: #909399;
  font-size: 14px;
}

.view-answer {
  line-height: 1.8;
  color: #606266;
}

.view-answer p {
  margin-bottom: 15px;
}

.view-answer ul, .view-answer ol {
  padding-left: 20px;
  margin-bottom: 15px;
}

.view-answer li {
  margin-bottom: 8px;
}
</style> 