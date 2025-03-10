<template>
  <div class="help-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>帮助文档管理</span>
          <el-button type="primary" size="small" @click="handleAddHelp">新增文档</el-button>
        </div>
      </template>
      
      <div class="page-description">
        <p>管理网站前台显示的帮助文档，包括账号使用、订单相关、支付说明、安全指南等文档类型。您可以添加、编辑、删除文档，并设置文档的分类、排序和显示状态。</p>
      </div>
      
      <!-- 搜索区域 -->
      <div class="search-area">
        <el-form :inline="true" :model="searchForm" class="demo-form-inline">
          <el-form-item label="文档标题">
            <el-input v-model="searchForm.title" placeholder="请输入文档标题" clearable></el-input>
          </el-form-item>
          <el-form-item label="文档分类">
            <el-select v-model="searchForm.category" placeholder="请选择" clearable style="width: 168px;">
              <el-option label="全部" value=""></el-option>
              <el-option label="账号使用" value="account"></el-option>
              <el-option label="订单相关" value="order"></el-option>
              <el-option label="支付说明" value="payment"></el-option>
              <el-option label="安全指南" value="security"></el-option>
              <el-option label="其他说明" value="other"></el-option>
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
      <el-table :data="helpList" style="width: 100%" v-loading="loading" border stripe>
        <el-table-column type="index" label="序号" width="60"></el-table-column>
        <el-table-column prop="title" label="文档标题" min-width="250" show-overflow-tooltip></el-table-column>
        <el-table-column prop="category" label="文档分类" width="120">
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
    
    <!-- 文档表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增文档' : '编辑文档'"
      width="800px"
    >
      <el-form :model="helpForm" label-width="100px" :rules="rules" ref="helpFormRef">
        <el-form-item label="文档标题" prop="title">
          <el-input v-model="helpForm.title" placeholder="请输入文档标题"></el-input>
        </el-form-item>
        <el-form-item label="文档分类" prop="category">
          <el-select v-model="helpForm.category" placeholder="请选择文档分类" style="width: 100%;">
            <el-option label="账号使用" value="account"></el-option>
            <el-option label="订单相关" value="order"></el-option>
            <el-option label="支付说明" value="payment"></el-option>
            <el-option label="安全指南" value="security"></el-option>
            <el-option label="其他说明" value="other"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="文档内容" prop="content">
          <el-input 
            v-model="helpForm.content" 
            type="textarea" 
            :rows="15" 
            placeholder="请输入文档内容，支持HTML格式"
          ></el-input>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="helpForm.sort" :min="0" :max="999" style="width: 100%;"></el-input-number>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="helpForm.statusBool"></el-switch>
          <span class="status-text">{{ helpForm.statusBool ? '已发布' : '未发布' }}</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 查看文档对话框 -->
    <el-dialog
      v-model="viewDialogVisible"
      title="查看文档"
      width="800px"
    >
      <div class="view-dialog-content">
        <h2>{{ viewForm.title }}</h2>
        <div class="view-info">
          <el-tag :type="getCategoryTag(viewForm.category)">{{ getCategoryName(viewForm.category) }}</el-tag>
          <span class="view-time">创建时间：{{ viewForm.createTime }}</span>
        </div>
        <div class="view-content" v-html="viewForm.content"></div>
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
const helpList = ref([
  { 
    id: 1,
    title: 'Gmail邮箱使用指南', 
    category: 'account',
    sort: 1,
    status: '已发布',
    statusBool: true,
    content: `<h3>Gmail邮箱使用指南</h3>
<p>Gmail是Google提供的免费电子邮件服务，以下是使用Gmail账号的基本说明：</p>

<h4>登录步骤</h4>
<ol>
  <li>访问 <a href="https://mail.google.com" target="_blank">https://mail.google.com</a></li>
  <li>输入您购买的Gmail账号</li>
  <li>输入对应的密码</li>
  <li>如果提示需要验证，请按照提示完成验证步骤</li>
</ol>

<h4>安全建议</h4>
<ul>
  <li>首次登录后，建议修改密码</li>
  <li>开启两步验证，提高账号安全性</li>
  <li>定期检查账号活动，确保没有异常登录</li>
  <li>不要在公共设备上保存登录状态</li>
</ul>

<h4>常见问题</h4>
<ul>
  <li><strong>问题：登录时提示账号被锁定</strong><br>解决方案：按照Google的提示进行账号恢复，或联系客服获取帮助。</li>
  <li><strong>问题：无法接收邮件</strong><br>解决方案：检查垃圾邮件文件夹，确认邮箱存储空间是否已满。</li>
  <li><strong>问题：发送邮件失败</strong><br>解决方案：确认网络连接正常，检查收件人地址是否正确，尝试重新发送。</li>
</ul>`,
    createTime: '2024-03-01 10:00:00' 
  },
  { 
    id: 2,
    title: '订单购买流程说明', 
    category: 'order',
    sort: 2,
    status: '已发布',
    statusBool: true,
    content: `<h3>订单购买流程说明</h3>
<p>在我们的平台购买账号的完整流程如下：</p>

<h4>购买步骤</h4>
<ol>
  <li>浏览商品列表，选择您需要的账号类型</li>
  <li>点击"立即购买"按钮</li>
  <li>确认订单信息，包括商品名称、价格和数量</li>
  <li>选择支付方式</li>
  <li>完成支付</li>
  <li>获取账号信息（自动发货商品将立即显示账号信息，手动发货商品需等待客服处理）</li>
</ol>

<h4>订单状态说明</h4>
<ul>
  <li><strong>待付款</strong>：订单已创建但尚未支付</li>
  <li><strong>待发货</strong>：订单已支付，等待发货</li>
  <li><strong>已发货</strong>：账号信息已发送</li>
  <li><strong>已完成</strong>：订单已完成</li>
  <li><strong>已取消</strong>：订单已取消</li>
</ul>

<h4>注意事项</h4>
<ul>
  <li>订单支付后无法修改订单信息</li>
  <li>请在下单前仔细确认商品信息</li>
  <li>如有特殊需求，请在备注中说明</li>
  <li>订单问题请联系客服处理</li>
</ul>`,
    createTime: '2024-03-02 09:30:00' 
  },
  { 
    id: 3,
    title: '支付方式详细说明', 
    category: 'payment',
    sort: 3,
    status: '已发布',
    statusBool: true,
    content: `<h3>支付方式详细说明</h3>
<p>我们平台支持多种支付方式，以下是各支付方式的详细说明：</p>

<h4>支付宝</h4>
<p>支付宝是中国领先的第三方支付平台，具有安全、便捷的特点。</p>
<ul>
  <li>支持手机APP扫码支付</li>
  <li>支持网页版支付</li>
  <li>实时到账，无手续费</li>
</ul>

<h4>微信支付</h4>
<p>微信支付是腾讯公司推出的支付服务，与微信APP深度集成。</p>
<ul>
  <li>支持微信扫码支付</li>
  <li>支持微信APP内支付</li>
  <li>实时到账，无手续费</li>
</ul>

<h4>银行卡</h4>
<p>支持国内主要银行的借记卡和信用卡支付。</p>
<ul>
  <li>支持借记卡和信用卡</li>
  <li>支持网银支付</li>
  <li>实时到账，可能有银行手续费</li>
</ul>

<h4>PayPal</h4>
<p>PayPal是国际通用的支付平台，适合海外用户使用。</p>
<ul>
  <li>支持多种货币</li>
  <li>支持信用卡关联支付</li>
  <li>有一定手续费，通常为交易金额的3%-4%</li>
</ul>

<h4>USDT</h4>
<p>USDT是一种稳定币，与美元1:1锚定，适合加密货币用户。</p>
<ul>
  <li>支持多种区块链网络（如ERC20、TRC20等）</li>
  <li>需要等待区块确认，通常5-30分钟</li>
  <li>有网络手续费，根据区块链网络拥堵情况而定</li>
</ul>`,
    createTime: '2024-03-03 09:00:00' 
  },
  { 
    id: 4,
    title: '账号安全使用指南', 
    category: 'security',
    sort: 4,
    status: '已发布',
    statusBool: true,
    content: `<h3>账号安全使用指南</h3>
<p>为了保障您购买的账号安全，请遵循以下安全使用指南：</p>

<h4>密码安全</h4>
<ul>
  <li>首次登录后立即修改密码</li>
  <li>使用强密码（包含大小写字母、数字和特殊字符）</li>
  <li>不要使用与其他平台相同的密码</li>
  <li>定期更换密码（建议每3个月更换一次）</li>
  <li>不要将密码告知他人</li>
</ul>

<h4>两步验证</h4>
<ul>
  <li>开启两步验证功能（如果平台支持）</li>
  <li>使用身份验证器APP而非短信验证（更安全）</li>
  <li>保存好备用验证码</li>
</ul>

<h4>登录安全</h4>
<ul>
  <li>避免在公共设备上登录</li>
  <li>使用完毕后及时退出登录</li>
  <li>定期检查账号登录活动</li>
  <li>发现异常登录及时修改密码</li>
</ul>

<h4>个人信息保护</h4>
<ul>
  <li>不要在账号中存储敏感个人信息</li>
  <li>不要使用真实姓名作为用户名</li>
  <li>谨慎添加个人联系方式</li>
  <li>不要关联其他社交账号（除非必要）</li>
</ul>

<h4>防钓鱼攻击</h4>
<ul>
  <li>确认网址正确后再输入账号密码</li>
  <li>不要点击可疑链接</li>
  <li>不要下载来源不明的附件</li>
  <li>警惕索要验证码的行为</li>
</ul>`,
    createTime: '2024-03-04 08:30:00' 
  },
  { 
    id: 5,
    title: '社交媒体账号使用指南', 
    category: 'account',
    sort: 5,
    status: '已发布',
    statusBool: true,
    content: `<h3>社交媒体账号使用指南</h3>
<p>以下是各类社交媒体账号的基本使用说明：</p>

<h4>Facebook账号</h4>
<ol>
  <li>访问 <a href="https://www.facebook.com" target="_blank">https://www.facebook.com</a></li>
  <li>输入您购买的Facebook账号和密码</li>
  <li>如果提示需要验证，请按照提示完成验证步骤</li>
  <li>登录成功后，建议立即修改密码和个人信息</li>
</ol>

<h4>Twitter账号</h4>
<ol>
  <li>访问 <a href="https://twitter.com" target="_blank">https://twitter.com</a></li>
  <li>输入您购买的Twitter账号和密码</li>
  <li>如果提示需要验证，请按照提示完成验证步骤</li>
  <li>登录成功后，建议立即修改密码和个人信息</li>
</ol>

<h4>Instagram账号</h4>
<ol>
  <li>访问 <a href="https://www.instagram.com" target="_blank">https://www.instagram.com</a></li>
  <li>输入您购买的Instagram账号和密码</li>
  <li>如果提示需要验证，请按照提示完成验证步骤</li>
  <li>登录成功后，建议立即修改密码和个人信息</li>
</ol>

<h4>安全建议</h4>
<ul>
  <li>首次登录后，立即修改密码</li>
  <li>更新个人信息，避免使用默认设置</li>
  <li>开启两步验证（如果平台支持）</li>
  <li>定期检查账号活动，确保没有异常登录</li>
  <li>不要在公共设备上保存登录状态</li>
</ul>`,
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
const helpFormRef = ref<FormInstance>()
const helpForm = reactive({
  id: 0,
  title: '',
  category: '',
  content: '',
  sort: 0,
  statusBool: true
})

// 查看对话框相关
const viewDialogVisible = ref(false)
const viewForm = reactive({
  id: 0,
  title: '',
  category: '',
  content: '',
  createTime: ''
})

// 表单验证规则
const rules = reactive<FormRules>({
  title: [
    { required: true, message: '请输入文档标题', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择文档分类', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入文档内容', trigger: 'blur' },
    { min: 10, message: '文档内容不能少于10个字符', trigger: 'blur' }
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
    'security': 'danger',
    'other': 'info'
  }
  return categoryMap[category] || 'info'
}

// 获取分类名称
const getCategoryName = (category: string) => {
  const categoryMap: Record<string, string> = {
    'account': '账号使用',
    'order': '订单相关',
    'payment': '支付说明',
    'security': '安全指南',
    'other': '其他说明'
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
  ElMessage.success(`文档"${row.title}"已${statusText}`)
  row.status = val ? '已发布' : '未发布'
}

// 查看
const handleView = (row: any) => {
  viewForm.id = row.id
  viewForm.title = row.title
  viewForm.category = row.category
  viewForm.content = row.content
  viewForm.createTime = row.createTime
  viewDialogVisible.value = true
}

// 新增文档
const handleAddHelp = () => {
  dialogType.value = 'add'
  helpForm.id = 0
  helpForm.title = ''
  helpForm.category = ''
  helpForm.content = ''
  helpForm.sort = helpList.value.length + 1
  helpForm.statusBool = true
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: any) => {
  dialogType.value = 'edit'
  helpForm.id = row.id
  helpForm.title = row.title
  helpForm.category = row.category
  helpForm.content = row.content
  helpForm.sort = row.sort
  helpForm.statusBool = row.statusBool
  dialogVisible.value = true
}

// 删除
const handleDelete = (row: any) => {
  ElMessageBox.confirm(
    `确定要删除文档"${row.title}"吗？`,
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
        message: `文档"${row.title}"已删除`,
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
  if (!helpFormRef.value) return
  
  await helpFormRef.value.validate((valid, fields) => {
    if (valid) {
      if (dialogType.value === 'add') {
        ElMessage.success('新增文档成功')
      } else {
        ElMessage.success('编辑文档成功')
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
.help-container {
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

.view-content {
  line-height: 1.8;
  color: #606266;
}

.view-content h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #409EFF;
  font-size: 18px;
}

.view-content h4 {
  margin-top: 20px;
  margin-bottom: 10px;
  color: #606266;
  font-size: 16px;
}

.view-content p {
  margin-bottom: 15px;
}

.view-content ul, .view-content ol {
  padding-left: 20px;
  margin-bottom: 15px;
}

.view-content li {
  margin-bottom: 8px;
}

.view-content a {
  color: #409EFF;
  text-decoration: none;
}

.view-content a:hover {
  text-decoration: underline;
}
</style> 