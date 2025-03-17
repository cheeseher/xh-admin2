<template>
  <div class="template-settings-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>模板设置</span>
          <el-button type="primary" @click="handleAddTemplate">新增模板</el-button>
        </div>
      </template>
      
      <div class="page-description">
        <p>管理商品描述模板，您可以创建多个模板用于不同类型的商品，在添加或编辑商品时可以快速应用这些模板。</p>
      </div>
      
      <!-- 表格区域 -->
      <el-table :data="templateList" style="width: 100%" v-loading="loading" border stripe>
        <el-table-column type="index" label="序号" width="60"></el-table-column>
        <el-table-column prop="name" label="模板名称" min-width="180"></el-table-column>
        <el-table-column prop="category" label="适用分类" width="150">
          <template #default="scope">
            <el-tag v-if="scope.row.category">{{ scope.row.category }}</el-tag>
            <span v-else class="no-data">通用</span>
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" width="180"></el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <el-button size="small" @click="handlePreview(scope.row)">预览</el-button>
              <el-button size="small" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
              <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <!-- 模板表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增模板' : '编辑模板'"
      width="800px"
    >
      <el-form :model="templateForm" label-width="100px" :rules="rules" ref="templateFormRef">
        <el-form-item label="模板名称" prop="name">
          <el-input v-model="templateForm.name" placeholder="请输入模板名称"></el-input>
        </el-form-item>
        <el-form-item label="适用分类" prop="category">
          <el-select v-model="templateForm.category" placeholder="请选择适用分类" style="width: 100%;" clearable>
            <el-option label="通用" value=""></el-option>
            <el-option label="谷歌邮箱" value="谷歌邮箱"></el-option>
            <el-option label="微软邮箱" value="微软邮箱"></el-option>
            <el-option label="Instagram账号" value="Instagram账号"></el-option>
            <el-option label="Twitter账号" value="Twitter账号"></el-option>
            <el-option label="Facebook账号" value="Facebook账号"></el-option>
            <el-option label="Discord账号" value="Discord账号"></el-option>
            <el-option label="ChatGPT账号" value="ChatGPT账号"></el-option>
            <el-option label="雅虎邮箱" value="雅虎邮箱"></el-option>
            <el-option label="GMX邮箱" value="GMX邮箱"></el-option>
            <el-option label="TikTok账号" value="TikTok账号"></el-option>
            <el-option label="美国AOL邮箱" value="美国AOL邮箱"></el-option>
            <el-option label="ProtonMail邮箱" value="ProtonMail邮箱"></el-option>
            <el-option label="其他账号" value="其他账号"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="模板内容" prop="content">
          <div class="editor-container">
            <div class="editor-toolbar">
              <div></div>
              <el-button size="small" @click="previewContent">预览效果</el-button>
            </div>
            <QuillEditor
              v-model:content="templateForm.content"
              contentType="html"
              theme="snow"
              toolbar="full"
              :options="editorOptions"
              style="height: 400px"
            />
          </div>
        </el-form-item>
      </el-form>
      
      <!-- 预览对话框 -->
      <el-dialog
        v-model="previewVisible"
        title="模板预览"
        width="70%"
        destroy-on-close
        append-to-body
      >
        <div class="preview-container" v-html="templateForm.content"></div>
      </el-dialog>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 预览模板对话框 -->
    <el-dialog
      v-model="viewDialogVisible"
      title="模板预览"
      width="70%"
      destroy-on-close
    >
      <div class="preview-container" v-html="viewTemplate.content"></div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

// 模板列表
const templateList = ref([
  {
    id: 1,
    name: '通用商品模板',
    category: '',
    content: `
<h2>商品介绍</h2>
<p>这是一个高质量的账号，具有以下特点...</p>

<h2>账号规格</h2>
<ul>
  <li>账号类型：\${category}</li>
  <li>注册时间：\${feature}</li>
  <li>特殊功能：\${specialNote}</li>
</ul>

<h2>使用说明</h2>
<ol>
  <li>购买成功后，系统将自动发送账号信息到您的邮箱</li>
  <li>收到账号后请立即修改密码</li>
  <li>请勿在账号中存储重要个人信息</li>
  <li>如有登录问题，请及时联系客服</li>
</ol>

<h2>售后说明</h2>
<p>1. 售后保障期：自购买之日起30天内</p>
<p>2. 售后范围：账号无法登录、功能与描述不符</p>
<p>3. 售后流程：请通过"我的订单"-"申请售后"提交申请</p>
<p>4. 不支持售后的情况：</p>
<ul>
  <li>超出保障期的账号问题</li>
  <li>因用户操作不当导致的账号问题</li>
  <li>账号被用于违规用途</li>
</ul>

<h2>免责声明</h2>
<p>1. 本平台仅提供账号交易服务，不对账号的后续使用负责</p>
<p>2. 请遵守相关法律法规和平台规则使用账号</p>
<p>3. 禁止将账号用于任何违法违规活动</p>
<p>4. 平台保留对违规用户追究法律责任的权利</p>
    `,
    updateTime: '2024-03-10 10:00:00'
  },
  {
    id: 2,
    name: 'Gmail邮箱模板',
    category: '谷歌邮箱',
    content: `
<h2>Gmail邮箱介绍</h2>
<p>Gmail是Google提供的免费电子邮件服务，以下是使用Gmail账号的基本说明...</p>

<h2>账号规格</h2>
<ul>
  <li>账号类型：谷歌邮箱</li>
  <li>注册时间：\${feature}</li>
  <li>特殊功能：\${specialNote}</li>
</ul>

<h2>使用说明</h2>
<ol>
  <li>购买成功后，系统将自动发送账号信息到您的邮箱</li>
  <li>收到账号后请立即修改密码</li>
  <li>请勿在账号中存储重要个人信息</li>
  <li>如有登录问题，请及时联系客服</li>
</ol>

<h2>登录步骤</h2>
<ol>
  <li>访问 https://mail.google.com</li>
  <li>输入您购买的Gmail账号</li>
  <li>输入对应的密码</li>
  <li>如果提示需要验证，请按照提示完成验证步骤</li>
</ol>

<h2>售后说明</h2>
<p>本店所售Gmail账号均为稳定可用账号，购买后7天内提供更换服务。</p>

<h2>免责声明</h2>
<p>请勿将账号用于非法用途，账号被封禁概不负责。</p>
    `,
    updateTime: '2024-03-11 11:30:00'
  },
  {
    id: 3,
    name: '社交媒体账号模板',
    category: 'Instagram账号',
    content: `
<h2>社交媒体账号介绍</h2>
<p>这是一个高质量的社交媒体账号，具有以下特点...</p>

<h2>账号规格</h2>
<ul>
  <li>账号类型：\${category}</li>
  <li>账号年龄：\${feature}</li>
  <li>特殊功能：\${specialNote}</li>
</ul>

<h2>使用说明</h2>
<ol>
  <li>购买成功后，系统将自动发送账号信息到您的邮箱</li>
  <li>收到账号后请立即修改密码和邮箱</li>
  <li>请勿在账号中存储重要个人信息</li>
  <li>如有登录问题，请及时联系客服</li>
</ol>

<h2>注意事项</h2>
<ul>
  <li>请勿短时间内频繁登录或修改账号信息，以免触发安全机制</li>
  <li>建议使用代理IP登录，避免账号异常</li>
  <li>请勿发布违规内容，以免账号被封</li>
</ul>

<h2>售后说明</h2>
<p>本店所售社交媒体账号均为真实账号，购买后3天内提供更换服务。</p>

<h2>免责声明</h2>
<p>请勿将账号用于非法用途，账号被封禁概不负责。</p>
    `,
    updateTime: '2024-03-12 14:20:00'
  }
])

// 加载状态
const loading = ref(false)

// 对话框相关
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const templateFormRef = ref<FormInstance>()
const templateForm = reactive({
  id: 0,
  name: '',
  category: '',
  content: '',
  updateTime: ''
})

// 预览相关
const previewVisible = ref(false)
const viewDialogVisible = ref(false)
const viewTemplate = reactive({
  id: 0,
  name: '',
  category: '',
  content: '',
  updateTime: ''
})

// 表单验证规则
const rules = reactive<FormRules>({
  name: [
    { required: true, message: '请输入模板名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入模板内容', trigger: 'blur' }
  ]
})

// 富文本编辑器相关
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
  placeholder: '请输入模板内容...'
}

// 预览内容
const previewContent = () => {
  previewVisible.value = true
}

// 新增模板
const handleAddTemplate = () => {
  dialogType.value = 'add'
  templateForm.id = 0
  templateForm.name = ''
  templateForm.category = ''
  templateForm.content = ''
  dialogVisible.value = true
}

// 编辑模板
const handleEdit = (row: any) => {
  dialogType.value = 'edit'
  templateForm.id = row.id
  templateForm.name = row.name
  templateForm.category = row.category
  templateForm.content = row.content
  dialogVisible.value = true
}

// 预览模板
const handlePreview = (row: any) => {
  viewTemplate.id = row.id
  viewTemplate.name = row.name
  viewTemplate.category = row.category
  viewTemplate.content = row.content
  viewDialogVisible.value = true
}

// 删除模板
const handleDelete = (row: any) => {
  // 判断是否为通用商品模板
  if (row.id === 1 && row.name === '通用商品模板') {
    ElMessage.warning('通用商品模板不可删除')
    return
  }

  ElMessageBox.confirm(
    `确定要删除模板"${row.name}"吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      // 模拟删除操作
      const index = templateList.value.findIndex(item => item.id === row.id)
      if (index !== -1) {
        templateList.value.splice(index, 1)
      }
      ElMessage.success(`模板"${row.name}"已删除`)
    })
    .catch(() => {
      ElMessage.info('已取消删除')
    })
}

// 提交表单
const submitForm = async () => {
  if (!templateFormRef.value) return
  
  await templateFormRef.value.validate((valid, fields) => {
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
        const newId = Math.max(...templateList.value.map(item => item.id), 0) + 1
        templateList.value.push({
          id: newId,
          name: templateForm.name,
          category: templateForm.category,
          content: templateForm.content,
          updateTime
        })
        ElMessage.success('新增模板成功')
      } else {
        // 模拟编辑操作
        const index = templateList.value.findIndex(item => item.id === templateForm.id)
        if (index !== -1) {
          templateList.value[index] = {
            ...templateList.value[index],
            name: templateForm.name,
            category: templateForm.category,
            content: templateForm.content,
            updateTime
          }
        }
        ElMessage.success('编辑模板成功')
      }
      dialogVisible.value = false
    } else {
      console.log('表单验证失败', fields)
    }
  })
}

// 初始化
onMounted(() => {
  // 可以在这里加载模板数据
})
</script>

<style scoped>
.template-settings-container {
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

.action-buttons {
  display: flex;
  gap: 5px;
}

.action-buttons .el-button {
  margin-left: 0 !important;
  margin-right: 0 !important;
}

.no-data {
  color: #909399;
  font-size: 12px;
  font-style: italic;
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

.variable-hint {
  color: #606266;
  font-size: 13px;
  background-color: #f0f9eb;
  padding: 4px 8px;
  border-radius: 4px;
  border-left: 3px solid #67c23a;
}

.preview-container {
  padding: 20px;
  max-height: 600px;
  overflow-y: auto;
  background-color: #fff;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

/* 预览样式 */
:deep(.preview-container h2),
:deep(.ql-editor h2) {
  margin-top: 20px;
  margin-bottom: 10px;
  padding-bottom: 5px;
  border-bottom: 1px solid #ebeef5;
  color: #303133;
}

:deep(.preview-container ul),
:deep(.preview-container ol),
:deep(.ql-editor ul),
:deep(.ql-editor ol) {
  padding-left: 20px;
  margin-bottom: 15px;
}

:deep(.preview-container li),
:deep(.ql-editor li) {
  margin-bottom: 5px;
}

:deep(.preview-container p),
:deep(.ql-editor p) {
  margin-bottom: 10px;
  line-height: 1.6;
}
</style>