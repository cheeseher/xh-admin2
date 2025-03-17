<template>
  <div class="document-settings-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>系统文档设置</span>
          <el-button type="primary" @click="saveAllDocuments">保存所有更改</el-button>
        </div>
      </template>
      
      <div class="page-description">
        <p>管理网站前台显示的基础文档内容，包括使用协议和关于我们等重要信息。这些内容将在前台网站的相应页面中显示。</p>
      </div>
      
      <!-- 文档标签页导航 -->
      <div class="document-tabs">
        <el-tabs v-model="activeTab" @tab-click="handleTabChange" class="document-tabs">
          <el-tab-pane label="使用协议" name="terms"></el-tab-pane>
          <el-tab-pane label="关于我们" name="about"></el-tab-pane>
        </el-tabs>
      </div>
      
      <!-- 文档编辑区域 -->
      <div class="editor-container">
        <div class="editor-header">
          <div class="document-status">
            <span class="label">状态：</span>
            <el-switch
              v-model="currentDocument.isEnabled"
              :active-value="true"
              :inactive-value="false"
              @change="handleStatusChange"
            ></el-switch>
            <span class="status-text">{{ currentDocument.isEnabled ? '已启用' : '已禁用' }}</span>
          </div>
        </div>
        
        <div class="editor-content">
          <div class="editor-label">文档内容：</div>
          <div class="rich-editor">
            <!-- 富文本编辑器 -->
            <div style="border: 1px solid #ccc; z-index: 100;">
              <Toolbar
                style="border-bottom: 1px solid #ccc"
                :editor="editorRef"
                :defaultConfig="toolbarConfig"
                :mode="mode"
              />
              <Editor
                style="height: 400px; overflow-y: hidden;"
                v-model="editorValue"
                :defaultConfig="editorConfig"
                :mode="mode"
                @onCreated="handleCreated"
                @onChange="handleChange"
              />
            </div>
          </div>
        </div>
        
        <div class="editor-footer">
          <div class="last-updated">
            <span>最后更新时间：{{ currentDocument.updateTime || '未保存' }}</span>
          </div>
          <div class="action-buttons">
            <el-button @click="resetDocument">重置</el-button>
            <el-button type="primary" @click="saveDocument">保存</el-button>
          </div>
        </div>
      </div>
      
      <!-- 预览区域 -->
      <div class="preview-container">
        <div class="preview-header">
          <span>预览效果</span>
          <el-switch v-model="showPreview" active-text="显示预览" inactive-text="隐藏预览"></el-switch>
        </div>
        <div v-if="showPreview" class="preview-content">
          <div v-html="currentDocument.content"></div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch, shallowRef, onBeforeUnmount } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import '@wangeditor/editor/dist/css/style.css' // 引入编辑器样式
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import type { IEditorConfig, IToolbarConfig } from '@wangeditor/editor'

// 加载状态
const loading = ref(false)

// 当前激活的标签页
const activeTab = ref('terms')

// 是否显示预览
const showPreview = ref(true)

// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef()

// 编辑器内容
const editorValue = ref('')

// 编辑器配置
const editorConfig = {
  placeholder: '请输入内容...',
  MENU_CONF: {}
}

// 工具栏配置
const toolbarConfig = {
  excludeKeys: []
}

// 编辑器模式
const mode = 'default' // 或 'simple'

// 文档数据
const documents = reactive({
  terms: {
    id: 1,
    content: `<h1>使用协议</h1>
<p>欢迎使用星海账号交易平台。本协议是您与星海平台之间关于使用星海服务的法律协议。</p>
<h2>1. 服务条款</h2>
<p>1.1 您在使用星海平台服务时，必须遵守中华人民共和国相关法律法规的规定，不得利用本服务从事违法违规行为。</p>
<p>1.2 您不得利用星海平台发布、传播或存储违反国家法律法规禁止的内容。</p>
<h2>2. 账号安全</h2>
<p>2.1 您应妥善保管账号及密码信息，因账号密码保管不善而造成的损失由您自行承担。</p>
<p>2.2 如发现有他人冒用或盗用您的账号及密码，或其他任何未经合法授权使用的情形时，应立即通知星海平台。</p>
<h2>3. 交易规则</h2>
<p>3.1 星海平台仅为您提供账号交易的平台服务，不参与您与其他用户之间的交易过程。</p>
<p>3.2 您应当确保您在星海平台上发布的商品信息真实、准确、合法。</p>
<h2>4. 免责声明</h2>
<p>4.1 星海平台不对用户发布的内容的真实性、准确性、合法性承担责任。</p>
<p>4.2 因网络状况、通讯线路等任何技术原因而导致用户不能正常使用星海平台，星海平台不承担任何法律责任。</p>
<h2>5. 协议修改</h2>
<p>5.1 星海平台有权在必要时修改本协议条款，协议条款一旦发生变动，将会在相关页面上公布修改后的协议条款。</p>
<p>5.2 如果不同意星海平台对本协议相关条款所做的修改，您有权停止使用星海平台的服务。</p>`,
    isEnabled: true,
    updateTime: '2024-03-15 10:00:00'
  },
  about: {
    id: 2,
    content: `<h1>关于我们</h1>
<p>星海账号交易平台是一家专注于提供安全、便捷的账号交易服务的平台。</p>
<h2>我们的使命</h2>
<p>为用户提供安全、便捷、高效的账号交易服务，打造最值得信赖的账号交易平台。</p>
<h2>我们的优势</h2>
<ul>
  <li><strong>安全保障</strong>：采用先进的安全技术，保障用户信息和交易安全。</li>
  <li><strong>品质保证</strong>：所有账号经过严格筛选，确保质量。</li>
  <li><strong>快速发货</strong>：支持自动发货，让您即买即用。</li>
  <li><strong>售后无忧</strong>：专业的客服团队，为您提供全方位的售后服务。</li>
</ul>
<h2>联系我们</h2>
<p>客服邮箱：support@xinghai.com</p>
<p>工作时间：周一至周日 9:00-22:00</p>
<p>公司地址：上海市浦东新区张江高科技园区</p>`,
    isEnabled: true,
    updateTime: '2024-03-15 10:00:00'
  }
})

// 当前编辑的文档
const currentDocument = reactive({
  id: 0,
  content: '',
  isEnabled: true,
  updateTime: ''
})

// 监听标签页变化，更新当前编辑的文档
watch(activeTab, (newTab) => {
  Object.assign(currentDocument, documents[newTab as keyof typeof documents])
  // 更新编辑器内容
  editorValue.value = currentDocument.content
})

// 处理标签页切换
const handleTabChange = () => {
  // 切换标签页时，更新当前编辑的文档
  Object.assign(currentDocument, documents[activeTab.value as keyof typeof documents])
  // 更新编辑器内容
  editorValue.value = currentDocument.content
}

// 处理状态变更
const handleStatusChange = (val: boolean) => {
  currentDocument.isEnabled = val
  ElMessage.success(`文档已${val ? '启用' : '禁用'}`)
}

// 重置当前文档
const resetDocument = () => {
  ElMessageBox.confirm(
    '确定要重置当前文档吗？未保存的更改将会丢失。',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      // 重置为原始数据
      Object.assign(currentDocument, documents[activeTab.value as keyof typeof documents])
      // 更新编辑器内容
      editorValue.value = currentDocument.content
      ElMessage.success('文档已重置')
    })
    .catch(() => {
      ElMessage.info('已取消重置')
    })
}

// 保存当前文档
const saveDocument = () => {
  // 更新文档数据
  Object.assign(documents[activeTab.value as keyof typeof documents], {
    content: editorValue.value, // 使用编辑器的内容
    isEnabled: currentDocument.isEnabled,
    updateTime: new Date().toLocaleString()
  })
  
  // 同步更新当前文档的内容
  currentDocument.content = editorValue.value
  
  ElMessage.success('文档保存成功')
}

// 保存所有文档
const saveAllDocuments = () => {
  // 先保存当前编辑的文档
  saveDocument()
  
  // 在实际应用中，这里会调用API保存所有文档
  for (const key in documents) {
    if (key !== activeTab.value) { // 跳过当前已保存的文档
      documents[key as keyof typeof documents].updateTime = new Date().toLocaleString()
    }
  }
  
  ElMessage.success('所有文档保存成功')
}

// 编辑器创建完成时的回调
const handleCreated = (editor: any) => {
  editorRef.value = editor // 记录编辑器实例
}

// 编辑器内容变化时的回调
const handleChange = (editor: any) => {
  // 可以在这里处理编辑器内容变化的逻辑
}

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
})

// 初始化
onMounted(() => {
  // 初始化当前编辑的文档
  Object.assign(currentDocument, documents[activeTab.value as keyof typeof documents])
  // 初始化编辑器内容
  editorValue.value = currentDocument.content
})
</script>

<style scoped>
.document-settings-container {
  padding: 20px;
}

.box-card {
  margin-bottom: 20px;
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

.document-tabs {
  margin-bottom: 20px;
}

.editor-container {
  margin-bottom: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 20px;
}

.editor-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 20px;
}

.document-status {
  display: flex;
  align-items: center;
}

.label {
  margin-right: 10px;
  font-weight: bold;
}

.status-text {
  margin-left: 10px;
}

.editor-content {
  margin-bottom: 20px;
}

.editor-label {
  font-weight: bold;
  margin-bottom: 10px;
}

.rich-editor {
  border-radius: 4px;
}

.editor-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}

.last-updated {
  color: #909399;
  font-size: 12px;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.preview-container {
  margin-top: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 20px;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e4e7ed;
}

.preview-content {
  padding: 20px;
  background-color: #f8f8f8;
  border-radius: 4px;
}
</style> 