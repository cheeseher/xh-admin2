<template>
  <div class="settings-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>系统设置</span>
        </div>
      </template>
      
      <el-tabs v-model="activeTab">
        <!-- 基本设置 -->
        <el-tab-pane label="基本设置" name="basic">
          <el-form :model="basicForm" label-width="120px" :rules="basicRules" ref="basicFormRef">
            <el-form-item label="系统名称" prop="systemName">
              <el-input v-model="basicForm.systemName" placeholder="请输入系统名称"></el-input>
            </el-form-item>
            <el-form-item label="系统Logo">
              <el-upload
                class="avatar-uploader"
                action="#"
                :show-file-list="false"
                :auto-upload="false"
                :on-change="handleLogoChange"
              >
                <img v-if="basicForm.logoUrl" :src="basicForm.logoUrl" class="avatar" />
                <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
              </el-upload>
              <div class="upload-tip">建议尺寸: 200px * 60px，支持jpg、png格式</div>
            </el-form-item>
            <el-form-item label="版权信息" prop="copyright">
              <el-input v-model="basicForm.copyright" placeholder="请输入版权信息"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveBasicSettings">保存设置</el-button>
              <el-button @click="resetBasicForm">重置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <!-- 客服设置 -->
        <el-tab-pane label="客服设置" name="service">
          <el-form :model="serviceForm" label-width="120px" :rules="serviceRules" ref="serviceFormRef">
            <el-form-item label="TG客服链接" prop="tgServiceLink">
              <el-input v-model="serviceForm.tgServiceLink" placeholder="请输入Telegram客服链接">
                <template #prepend>https://t.me/</template>
                <template #append>
                  <el-button @click="debugTgLink">调试</el-button>
                </template>
              </el-input>
              <div class="form-tip">输入Telegram用户名或群组链接，将显示在网站底部和客服页面</div>
            </el-form-item>
            
            <el-form-item label="在线客服链接" prop="onlineServiceLink">
              <el-input v-model="serviceForm.onlineServiceLink" placeholder="请输入在线客服系统链接">
                <template #append>
                  <el-button @click="debugServiceLink">调试</el-button>
                </template>
              </el-input>
              <div class="form-tip">输入完整的在线客服系统链接，将用于网站的在线咨询功能</div>
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="saveServiceSettings">保存设置</el-button>
              <el-button @click="resetServiceForm">重置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <!-- 邮件设置 -->
        <el-tab-pane label="邮件设置" name="email">
          <el-form
            ref="emailFormRef"
            :model="emailForm"
            :rules="emailRules"
            label-width="120px"
            class="settings-form"
          >
            <el-form-item label="SMTP服务器" prop="smtpServer">
              <el-input v-model="emailForm.smtpServer" placeholder="请输入SMTP服务器地址" />
            </el-form-item>
            <el-form-item label="端口" prop="smtpPort">
              <el-input v-model="emailForm.smtpPort" placeholder="请输入端口" />
            </el-form-item>
            <el-form-item label="安全协议" prop="securityProtocol">
              <el-select v-model="emailForm.securityProtocol" placeholder="请选择安全协议">
                <el-option label="SSL" value="SSL" />
                <el-option label="TLS" value="TLS" />
                <el-option label="无" value="none" />
              </el-select>
            </el-form-item>
            <el-form-item label="用户名" prop="username">
              <el-input v-model="emailForm.username" placeholder="请输入用户名" />
            </el-form-item>
            <el-form-item label="发件人邮箱" prop="senderEmail">
              <el-input v-model="emailForm.senderEmail" placeholder="请输入发件人邮箱" />
            </el-form-item>
            <el-form-item label="称呼" prop="senderName">
              <el-input v-model="emailForm.senderName" placeholder="请输入称呼" />
            </el-form-item>
            <el-form-item label="授权码/密码" prop="password">
              <el-input v-model="emailForm.password" type="password" placeholder="请输入授权码或密码" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveEmailSettings">保存设置</el-button>
              <el-button type="success" @click="testEmailSettings">测试邮件</el-button>
              <el-button @click="resetEmailForm">重置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 手续费设置 -->
        <el-tab-pane label="手续费设置" name="fee">
          <el-form
            ref="feeFormRef"
            :model="feeForm"
            :rules="feeRules"
            label-width="120px"
            class="settings-form"
          >
            <!-- USDT手续费设置 -->
            <el-form-item label="USDT手续费" prop="usdtFee">
              <el-input-number
                v-model="feeForm.usdtFee"
                :min="0"
                :max="100"
                :precision="2"
                :step="0.1"
                placeholder="请输入USDT手续费率"
              />
              <span class="form-tip">%</span>
              <div class="form-tip">设置USDT支付的手续费率</div>
            </el-form-item>

            <!-- 微信手续费设置 -->
            <el-form-item label="微信手续费" prop="wechatFee">
              <el-input-number
                v-model="feeForm.wechatFee"
                :min="0"
                :max="100"
                :precision="2"
                :step="0.1"
                placeholder="请输入微信手续费率"
              />
              <span class="form-tip">%</span>
              <div class="form-tip">设置微信支付的手续费率</div>
            </el-form-item>

            <!-- 支付宝手续费设置 -->
            <el-form-item label="支付宝手续费" prop="alipayFee">
              <el-input-number
                v-model="feeForm.alipayFee"
                :min="0"
                :max="100"
                :precision="2"
                :step="0.1"
                placeholder="请输入支付宝手续费率"
              />
              <span class="form-tip">%</span>
              <div class="form-tip">设置支付宝支付的手续费率</div>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="saveFeeSettings">保存设置</el-button>
              <el-button @click="resetFeeForm">重置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

// 当前激活的标签页
const activeTab = ref('basic')

// 基本设置表单
const basicFormRef = ref<FormInstance>()
const basicForm = reactive({
  systemName: '星海后台管理系统',
  logoUrl: 'https://element-plus.org/images/element-plus-logo.svg',
  copyright: '© 2024 星海科技有限公司 版权所有'
})

// 基本设置表单验证规则
const basicRules = reactive<FormRules>({
  systemName: [
    { required: true, message: '请输入系统名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ]
})

// 客服设置表单
const serviceFormRef = ref<FormInstance>()
const serviceForm = reactive({
  tgServiceLink: 'xinghai_service',
  onlineServiceLink: 'https://chat.example.com/support'
})

// 客服设置表单验证规则
const serviceRules = reactive<FormRules>({
  tgServiceLink: [
    { pattern: /^[a-zA-Z0-9_]+$/, message: 'Telegram链接格式不正确', trigger: 'blur' }
  ],
  onlineServiceLink: [
    { pattern: /^https?:\/\/.+/, message: '请输入有效的URL地址', trigger: 'blur' }
  ]
})

// 邮件设置表单
const emailFormRef = ref<FormInstance>()
const emailForm = reactive({
  smtpServer: '',
  smtpPort: '',
  securityProtocol: 'SSL',
  username: '',
  senderEmail: '',
  senderName: '',
  password: ''
})

// 邮件设置表单验证规则
const emailRules = reactive<FormRules>({
  smtpServer: [
    { required: true, message: '请输入SMTP服务器地址', trigger: 'blur' }
  ],
  smtpPort: [
    { required: true, message: '请输入端口', trigger: 'blur' }
  ],
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  senderEmail: [
    { required: true, message: '请输入发件人邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  senderName: [
    { required: true, message: '请输入称呼', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入授权码/密码', trigger: 'blur' }
  ]
})

// 手续费设置表单
const feeFormRef = ref<FormInstance>()
const feeForm = reactive({
  usdtFee: 1.0,
  wechatFee: 6.0,
  alipayFee: 5.0
})

// 手续费设置表单验证规则
const feeRules = reactive<FormRules>({
  usdtFee: [
    { required: true, message: '请输入USDT手续费率', trigger: 'blur' }
  ],
  wechatFee: [
    { required: true, message: '请输入微信手续费率', trigger: 'blur' }
  ],
  alipayFee: [
    { required: true, message: '请输入支付宝手续费率', trigger: 'blur' }
  ]
})

// Logo上传
const handleLogoChange = (file: any) => {
  const isImage = file.raw.type === 'image/jpeg' || file.raw.type === 'image/png'
  const isLt2M = file.raw.size / 1024 / 1024 < 2
  
  if (!isImage) {
    ElMessage.error('上传Logo只能是JPG或PNG格式!')
    return
  }
  if (!isLt2M) {
    ElMessage.error('上传Logo大小不能超过2MB!')
    return
  }
  
  // 模拟上传成功
  const reader = new FileReader()
  reader.readAsDataURL(file.raw)
  reader.onload = () => {
    basicForm.logoUrl = reader.result as string
  }
}

// 保存基本设置
const saveBasicSettings = async () => {
  if (!basicFormRef.value) return
  
  await basicFormRef.value.validate((valid, fields) => {
    if (valid) {
      // 模拟保存操作
      setTimeout(() => {
        ElMessage.success('基本设置保存成功')
      }, 500)
    } else {
      console.log('表单验证失败:', fields)
    }
  })
}

// 重置基本设置表单
const resetBasicForm = () => {
  if (basicFormRef.value) {
    basicFormRef.value.resetFields()
  }
}

// 保存客服设置
const saveServiceSettings = async () => {
  if (!serviceFormRef.value) return
  
  await serviceFormRef.value.validate((valid, fields) => {
    if (valid) {
      ElMessage.success('客服设置保存成功')
    } else {
      console.log('表单验证失败', fields)
    }
  })
}

// 重置客服设置表单
const resetServiceForm = () => {
  if (serviceFormRef.value) {
    serviceFormRef.value.resetFields()
  }
}

// 调试Telegram客服链接
const debugTgLink = () => {
  if (serviceForm.tgServiceLink) {
    const url = `https://t.me/${serviceForm.tgServiceLink}`
    window.open(url, '_blank')
  } else {
    ElMessage.warning('请先输入Telegram客服链接')
  }
}

// 调试在线客服链接
const debugServiceLink = () => {
  if (serviceForm.onlineServiceLink) {
    if (serviceForm.onlineServiceLink.startsWith('http://') || serviceForm.onlineServiceLink.startsWith('https://')) {
      window.open(serviceForm.onlineServiceLink, '_blank')
    } else {
      ElMessage.warning('请输入有效的URL地址，需要以http://或https://开头')
    }
  } else {
    ElMessage.warning('请先输入在线客服系统链接')
  }
}

// 保存邮件设置
const saveEmailSettings = async () => {
  if (!emailFormRef.value) return
  
  await emailFormRef.value.validate((valid, fields) => {
    if (valid) {
      ElMessage.success('邮件设置保存成功')
    } else {
      console.log('表单验证失败', fields)
    }
  })
}

// 测试邮件设置
const testEmailSettings = async () => {
  if (!emailFormRef.value) return
  
  await emailFormRef.value.validate((valid, fields) => {
    if (valid) {
      ElMessage.success('邮件测试发送成功')
    } else {
      console.log('表单验证失败', fields)
    }
  })
}

// 重置邮件设置表单
const resetEmailForm = () => {
  if (emailFormRef.value) {
    emailFormRef.value.resetFields()
  }
}

// 保存手续费设置
const saveFeeSettings = async () => {
  if (!feeFormRef.value) return
  
  await feeFormRef.value.validate((valid, fields) => {
    if (valid) {
      ElMessage.success('手续费设置保存成功')
    } else {
      console.log('表单验证失败', fields)
    }
  })
}

// 重置手续费设置表单
const resetFeeForm = () => {
  if (feeFormRef.value) {
    feeFormRef.value.resetFields()
  }
}

onMounted(() => {
  // 初始化数据
})
</script>

<style scoped>
.settings-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.avatar-uploader {
  width: 200px;
  height: 60px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: border-color 0.3s;
}

.avatar-uploader:hover {
  border-color: #409EFF;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 200px;
  height: 60px;
  line-height: 60px;
  text-align: center;
}

.avatar {
  width: 200px;
  height: 60px;
  display: block;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.form-text {
  margin-left: 10px;
  font-size: 14px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.small-input {
  width: 120px !important;
  margin: 0 5px;
}

.medium-input {
  width: 120px !important;
}

.form-text {
  margin-left: 10px;
  font-size: 14px;
  color: #606266;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
  margin-top: 5px;
}

.table-footer {
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.table-tip {
  font-size: 12px;
  color: #909399;
}
</style> 