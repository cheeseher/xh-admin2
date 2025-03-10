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
        <el-table-column prop="title" label="文档标题" min-width="150" show-overflow-tooltip></el-table-column>
        <el-table-column prop="subtitle" label="副标题" min-width="150" show-overflow-tooltip></el-table-column>
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
  status: ''
})

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
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  subtitle: [
    { required: true, message: '请输入副标题', trigger: 'blur' },
    { min: 2, max: 200, message: '长度在 2 到 200 个字符', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入文档内容', trigger: 'blur' }
  ],
  sort: [
    { required: true, message: '请输入排序号', trigger: 'blur' }
  ]
})

// 表格数据
const helpList = ref([
  {
    id: 1,
    title: 'Gmail邮箱使用指南',
    subtitle: 'Gmail是Google提供的免费电子邮件服务，以下是使用Gmail账号的基本说明：',
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
</ul>`,
    createTime: '2024-03-01 10:00:00'
  }
])

// 查询
const handleSearch = () => {
  // 实际项目中这里应该调用API进行查询
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 500)
}

// 重置查询
const resetSearch = () => {
  searchForm.title = ''
  searchForm.status = ''
  handleSearch()
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
  helpForm.id = 0
  helpForm.title = ''
  helpForm.subtitle = ''
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
  helpForm.subtitle = row.subtitle
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

// 提交表单
const submitForm = async () => {
  if (!helpFormRef.value) return
  
  await helpFormRef.value.validate((valid, fields) => {
    if (valid) {
      // 获取当前时间
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      const seconds = String(now.getSeconds()).padStart(2, '0')
      const updateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
      
      if (dialogType.value === 'add') {
        // 模拟添加操作
        const newId = Math.max(...helpList.value.map(item => item.id), 0) + 1
        helpList.value.push({
          id: newId,
          title: helpForm.title,
          subtitle: helpForm.subtitle,
          content: helpForm.content,
          sort: helpForm.sort,
          status: helpForm.statusBool ? '已发布' : '未发布',
          statusBool: helpForm.statusBool,
          createTime: updateTime
        })
        ElMessage.success('新增成功')
      } else {
        // 模拟编辑操作
        const index = helpList.value.findIndex(item => item.id === helpForm.id)
        if (index !== -1) {
          helpList.value[index] = {
            ...helpList.value[index],
            title: helpForm.title,
            subtitle: helpForm.subtitle,
            content: helpForm.content,
            sort: helpForm.sort,
            status: helpForm.statusBool ? '已发布' : '未发布',
            statusBool: helpForm.statusBool,
            createTime: updateTime
          }
        }
        ElMessage.success('编辑成功')
      }
      dialogVisible.value = false
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
  margin-bottom: 20px;
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