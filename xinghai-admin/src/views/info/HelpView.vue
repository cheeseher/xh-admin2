<template>
  <div class="help-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>文档设置</span>
          <el-button type="primary" @click="handleAddHelp">新增文档</el-button>
        </div>
      </template>
      
      <div class="page-description">
        <p>管理网站前台显示的文档内容，您可以添加、编辑、删除文档，并设置文档的排序和显示状态。</p>
      </div>
      
      <!-- 搜索区域 -->
      <div class="search-area">
        <el-form :inline="true" :model="searchForm" class="demo-form-inline">
          <el-form-item label="文档标题">
            <el-input v-model="searchForm.title" placeholder="请输入文档标题" clearable></el-input>
          </el-form-item>
          <el-form-item label="文档分类">
            <el-select v-model="searchForm.category" placeholder="请选择分类" clearable style="width: 168px;">
              <el-option label="全部" value=""></el-option>
              <el-option v-for="item in categoryOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
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
      
      <!-- 分类标签页导航 -->
      <div class="category-tabs">
        <el-tabs v-model="activeCategory" @tab-click="handleCategoryChange" class="category-filter-tabs">
          <el-tab-pane label="全部文档" name=""></el-tab-pane>
          <el-tab-pane label="账号相关" name="account"></el-tab-pane>
          <el-tab-pane label="服务相关" name="service"></el-tab-pane>
          <el-tab-pane label="教程指南" name="tutorial"></el-tab-pane>
        </el-tabs>
      </div>
      
      <!-- 表格区域 -->
      <el-table :data="filteredHelpList" style="width: 100%" v-loading="loading" border stripe>
        <el-table-column type="index" label="序号" width="60"></el-table-column>
        <el-table-column prop="title" label="文档标题" min-width="150" show-overflow-tooltip></el-table-column>
        <el-table-column prop="subtitle" label="副标题" min-width="150" show-overflow-tooltip></el-table-column>
        <el-table-column prop="category" label="文档分类" width="120">
          <template #default="scope">
            <el-tag :type="getCategoryTagType(scope.row.category)">
              {{ getCategoryName(scope.row.category) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="文档内容" width="100" align="center">
          <template #default="scope">
            <el-button type="primary" link @click="handlePreview(scope.row)">预览</el-button>
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
        <el-table-column label="操作" width="180" fixed="right">
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
        <el-form-item label="副标题" prop="subtitle">
          <el-input v-model="helpForm.subtitle" placeholder="请输入副标题"></el-input>
        </el-form-item>
        <el-form-item label="文档分类" prop="category">
          <el-select v-model="helpForm.category" placeholder="请选择文档分类" style="width: 100%;">
            <el-option v-for="item in categoryOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="文档内容" prop="content">
          <div class="editor-container">
            <div class="editor-toolbar">
              <div></div>
              <el-button size="small" @click="previewContent">预览效果</el-button>
            </div>
            <QuillEditor
              v-model:content="helpForm.content"
              contentType="html"
              theme="snow"
              toolbar="full"
              :options="editorOptions"
              style="height: 400px"
            />
          </div>
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
    
    <!-- 预览对话框 -->
    <el-dialog
      v-model="previewVisible"
      title="文档预览"
      width="70%"
      destroy-on-close
    >
      <div class="preview-container">
        <h2>{{ helpForm.title }}</h2>
        <h3>{{ helpForm.subtitle }}</h3>
        <div class="category-tag" v-if="helpForm.category">
          <el-tag :type="getCategoryTagType(helpForm.category)">{{ getCategoryName(helpForm.category) }}</el-tag>
        </div>
        <div class="preview-content" v-html="helpForm.content"></div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

// 搜索表单
const searchForm = reactive({
  title: '',
  category: '',
  status: ''
})

// 文档分类选项
const categoryOptions = [
  { label: '账号相关', value: 'account' },
  { label: '服务相关', value: 'service' },
  { label: '教程指南', value: 'tutorial' }
]

// 获取分类名称
const getCategoryName = (categoryCode: string) => {
  const category = categoryOptions.find(item => item.value === categoryCode)
  return category ? category.label : '未分类'
}

// 获取分类标签类型
const getCategoryTagType = (categoryCode: string) => {
  switch (categoryCode) {
    case 'account':
      return 'success'
    case 'service':
      return 'warning'
    case 'tutorial':
      return 'info'
    default:
      return ''
  }
}

// 加载状态
const loading = ref(false)

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

// 对话框相关
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const helpFormRef = ref<FormInstance>()
const helpForm = reactive({
  id: 0,
  title: '',
  subtitle: '',
  category: '',
  content: '',
  sort: 0,
  statusBool: true
})

// 预览对话框相关
const previewVisible = ref(false)

// 富文本编辑器配置
const editorOptions = {
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'header': 1 }, { 'header': 2 }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'script': 'sub' }, { 'script': 'super' }],
      [{ 'indent': '-1' }, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['clean'],
      ['link', 'image']
    ]
  },
  placeholder: '请输入文档内容...'
}

// 表单验证规则
const rules = reactive<FormRules>({
  title: [
    { required: true, message: '请输入文档标题', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  subtitle: [
    { max: 100, message: '长度不能超过 100 个字符', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择文档分类', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入文档内容', trigger: 'blur' }
  ]
})

// 表格数据类型定义
interface HelpItem {
  id: number;
  title: string;
  subtitle: string;
  category: string;
  content: string;
  sort: number;
  statusBool: boolean;
  createTime: string;
}

// 表格数据
const helpList = ref<HelpItem[]>([
  {
    id: 1,
    title: 'Gmail邮箱使用指南',
    subtitle: 'Gmail是Google提供的免费电子邮件服务，以下是使用Gmail账号的基本说明',
    category: 'account',
    content: '<h3>Gmail账号使用指南</h3><p>Gmail是Google提供的免费电子邮件服务，以下是使用Gmail账号的基本说明：</p><h4>登录步骤</h4><ol><li>访问 <a href="https://mail.google.com" target="_blank">https://mail.google.com</a></li><li>输入您购买的Gmail账号</li><li>输入对应的密码</li><li>如果提示需要验证，请按照提示完成验证步骤</li></ol>',
    sort: 1,
    statusBool: true,
    createTime: '2024-03-01 10:00:00'
  },
  {
    id: 2,
    title: 'Facebook账号使用指南',
    subtitle: 'Facebook是全球最大的社交媒体平台之一，以下是使用Facebook账号的基本说明',
    category: 'account',
    content: '<h3>Facebook账号使用指南</h3><p>Facebook是全球最大的社交媒体平台之一，以下是使用Facebook账号的基本说明：</p><h4>登录步骤</h4><ol><li>访问 <a href="https://www.facebook.com" target="_blank">https://www.facebook.com</a></li><li>输入您购买的Facebook账号和密码</li><li>如果提示需要验证，请按照提示完成验证步骤</li><li>登录成功后，建议立即修改密码和个人信息</li></ol>',
    sort: 2,
    statusBool: true,
    createTime: '2024-03-02 10:00:00'
  },
  {
    id: 3,
    title: '如何添加新商品',
    subtitle: '详细介绍如何在系统中添加新商品的步骤',
    category: 'tutorial',
    content: '<h3>如何添加新商品</h3><p>添加新商品的步骤如下：</p><ol><li>进入商品管理页面</li><li>点击右上角的"新增商品"按钮</li><li>在弹出的表单中填写商品信息，包括商品名称、商品分类、商品特性、价格、库存等</li><li>选择发货方式（自动发货或手动发货）</li><li>填写商品描述</li><li>点击"确定"按钮保存</li></ol>',
    sort: 3,
    statusBool: true,
    createTime: '2024-03-03 10:00:00'
  },
  {
    id: 4,
    title: '如何处理待发货订单',
    subtitle: '详细介绍如何处理系统中的待发货订单',
    category: 'service',
    content: '<h3>如何处理待发货订单</h3><p>处理待发货订单的步骤如下：</p><ol><li>进入订单管理页面</li><li>在订单列表中找到状态为"待发货"的订单</li><li>点击该订单右侧的"发货"按钮</li><li>在弹出的表单中填写账号信息（账号、密码等）</li><li>填写备注信息（可选）</li><li>点击"确认发货"按钮完成发货</li></ol><p>发货后，订单状态将自动更新为"已发货"。</p>',
    sort: 4,
    statusBool: false,
    createTime: '2024-03-04 10:00:00'
  }
])

// 当前激活的分类标签
const activeCategory = ref('')

// 筛选后的表格数据
const filteredHelpList = ref<HelpItem[]>([])

// 分类标签切换
const handleCategoryChange = () => {
  searchForm.category = activeCategory.value
  handleSearch()
}

// 重置查询
const resetSearch = () => {
  searchForm.title = ''
  searchForm.category = ''
  searchForm.status = ''
  activeCategory.value = ''
  handleSearch()
}

// 查询
const handleSearch = () => {
  // 实际项目中这里应该调用API进行查询
  loading.value = true
  
  // 模拟筛选逻辑
  filteredHelpList.value = helpList.value.filter(item => {
    // 标题筛选
    const titleMatch = !searchForm.title || item.title.includes(searchForm.title)
    
    // 分类筛选
    const categoryMatch = !searchForm.category || item.category === searchForm.category
    
    // 状态筛选
    const statusMatch = !searchForm.status || 
      (searchForm.status === 'published' && item.statusBool) || 
      (searchForm.status === 'unpublished' && !item.statusBool)
    
    return titleMatch && categoryMatch && statusMatch
  })
  
  setTimeout(() => {
    loading.value = false
  }, 500)
}

// 分页相关
const handleSizeChange = (val: number) => {
  pageSize.value = val
  handleSearch()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  handleSearch()
}

// 预览内容
const previewContent = () => {
  previewVisible.value = true
}

// 新增
const handleAddHelp = () => {
  dialogType.value = 'add'
  resetForm()
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: any) => {
  dialogType.value = 'edit'
  helpForm.id = row.id
  helpForm.title = row.title
  helpForm.subtitle = row.subtitle
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
      // 实际项目中这里应该调用API进行删除
      const index = helpList.value.findIndex(item => item.id === row.id)
      if (index !== -1) {
        helpList.value.splice(index, 1)
      }
      ElMessage.success('删除成功')
    })
    .catch(() => {
      ElMessage.info('已取消删除')
    })
}

// 状态变更
const handleStatusChange = (val: boolean, row: any) => {
  // 实际项目中这里应该调用API进行状态更新
  row.status = val ? '已发布' : '未发布'
  ElMessage.success(`状态已更新为：${row.status}`)
}

// 重置表单
const resetForm = () => {
  helpForm.id = 0
  helpForm.title = ''
  helpForm.subtitle = ''
  helpForm.category = ''
  helpForm.content = ''
  helpForm.sort = 0
  helpForm.statusBool = true
}

// 提交表单
const submitForm = async () => {
  if (!helpFormRef.value) return
  
  await helpFormRef.value.validate((valid, fields) => {
    if (valid) {
      // 模拟提交
      if (dialogType.value === 'add') {
        // 模拟添加
        const newHelp = {
          id: Date.now(),
          title: helpForm.title,
          subtitle: helpForm.subtitle,
          category: helpForm.category,
          content: helpForm.content,
          sort: helpForm.sort,
          statusBool: helpForm.statusBool,
          createTime: new Date().toLocaleString()
        }
        helpList.value.unshift(newHelp)
        ElMessage.success('添加成功')
      } else {
        // 模拟编辑
        const index = helpList.value.findIndex(item => item.id === helpForm.id)
        if (index !== -1) {
          helpList.value[index] = {
            ...helpList.value[index],
            title: helpForm.title,
            subtitle: helpForm.subtitle,
            category: helpForm.category,
            content: helpForm.content,
            sort: helpForm.sort,
            statusBool: helpForm.statusBool
          }
          ElMessage.success('编辑成功')
        }
      }
      
      dialogVisible.value = false
      resetForm()
    } else {
      console.log('表单验证失败', fields)
    }
  })
}

// 预览
const handlePreview = (row: any) => {
  helpForm.id = row.id
  helpForm.title = row.title
  helpForm.subtitle = row.subtitle
  helpForm.content = row.content
  previewVisible.value = true
}

// 初始化
onMounted(() => {
  // 初始化时将原始数据复制到筛选后的数据中
  filteredHelpList.value = [...helpList.value]
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
  padding: 10px;
  background-color: #ecf8ff;
  border-radius: 4px;
  border-left: 5px solid #50bfff;
}

.page-description p {
  margin: 0;
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
}

.search-area {
  margin-bottom: 15px;
}

/* 分类标签页样式 */
.category-tabs {
  margin-bottom: 20px;
}

.category-filter-tabs :deep(.el-tabs__nav) {
  border-bottom: 1px solid #e4e7ed;
}

.category-filter-tabs :deep(.el-tabs__item) {
  height: 40px;
  line-height: 40px;
  font-size: 14px;
  color: #606266;
}

.category-filter-tabs :deep(.el-tabs__item.is-active) {
  color: #409EFF;
  font-weight: 500;
}

.category-filter-tabs :deep(.el-tabs__active-bar) {
  background-color: #409EFF;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.action-buttons {
  display: flex;
  gap: 5px;
}

.action-buttons .el-button {
  margin-left: 0 !important;
  margin-right: 0 !important;
}

.status-text {
  margin-left: 8px;
  font-size: 13px;
  color: #606266;
}

/* 分类标签样式 */
.category-tag {
  margin-bottom: 15px;
}

/* 富文本编辑器样式 */
.editor-container {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}

.editor-toolbar {
  padding: 8px;
  border-bottom: 1px solid #dcdfe6;
  background-color: #f5f7fa;
  display: flex;
  gap: 10px;
  justify-content: space-between;
  align-items: center;
}

/* 预览样式 */
.preview-container {
  padding: 20px;
  max-height: 600px;
  overflow-y: auto;
  background-color: #fff;
}

.preview-container h2 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #303133;
  font-size: 24px;
}

.preview-container h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #606266;
  font-size: 16px;
  font-weight: normal;
}

.preview-content {
  margin-top: 20px;
  line-height: 1.8;
}

:deep(.preview-content h3),
:deep(.preview-content h4) {
  margin-top: 20px;
  margin-bottom: 10px;
  color: #303133;
}

:deep(.preview-content p) {
  margin-bottom: 10px;
  line-height: 1.6;
}

:deep(.preview-content ul),
:deep(.preview-content ol) {
  padding-left: 20px;
  margin-bottom: 15px;
}

:deep(.preview-content li) {
  margin-bottom: 5px;
}

:deep(.preview-content a) {
  color: #409EFF;
  text-decoration: none;
}

:deep(.preview-content a:hover) {
  text-decoration: underline;
}
</style> 