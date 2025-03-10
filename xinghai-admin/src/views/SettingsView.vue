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
            <el-form-item label="系统描述" prop="description">
              <el-input v-model="basicForm.description" type="textarea" :rows="3" placeholder="请输入系统描述"></el-input>
            </el-form-item>
            <el-form-item label="备案信息" prop="icp">
              <el-input v-model="basicForm.icp" placeholder="请输入备案信息"></el-input>
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
          <el-form :model="emailForm" label-width="120px" :rules="emailRules" ref="emailFormRef">
            <el-form-item label="SMTP服务器" prop="smtpServer">
              <el-input v-model="emailForm.smtpServer" placeholder="请输入SMTP服务器地址"></el-input>
            </el-form-item>
            <el-form-item label="SMTP端口" prop="smtpPort">
              <el-input-number v-model="emailForm.smtpPort" :min="1" :max="65535" placeholder="请输入SMTP端口"></el-input-number>
            </el-form-item>
            <el-form-item label="发件人邮箱" prop="senderEmail">
              <el-input v-model="emailForm.senderEmail" placeholder="请输入发件人邮箱"></el-input>
            </el-form-item>
            <el-form-item label="发件人名称" prop="senderName">
              <el-input v-model="emailForm.senderName" placeholder="请输入发件人名称"></el-input>
            </el-form-item>
            <el-form-item label="邮箱密码" prop="password">
              <el-input v-model="emailForm.password" type="password" placeholder="请输入邮箱密码" show-password></el-input>
            </el-form-item>
            <el-form-item label="SSL加密">
              <el-switch v-model="emailForm.ssl"></el-switch>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveEmailSettings">保存设置</el-button>
              <el-button @click="resetEmailForm">重置</el-button>
              <el-button type="success" @click="testEmailSettings">测试连接</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <!-- 安全设置 -->
        <el-tab-pane label="安全设置" name="security">
          <el-form :model="securityForm" label-width="180px" ref="securityFormRef">
            <el-form-item label="登录密码有效期">
              <el-radio-group v-model="securityForm.passwordExpire">
                <el-radio :label="0">永不过期</el-radio>
                <el-radio :label="30">30天</el-radio>
                <el-radio :label="60">60天</el-radio>
                <el-radio :label="90">90天</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="登录失败锁定">
              <el-switch v-model="securityForm.loginLock"></el-switch>
              <span class="form-text" v-if="securityForm.loginLock">
                <el-input-number v-model="securityForm.loginLockCount" :min="1" :max="10" class="small-input"></el-input-number>
                次失败后锁定
                <el-input-number v-model="securityForm.loginLockTime" :min="1" :max="1440" class="small-input"></el-input-number>
                分钟
              </span>
            </el-form-item>
            <el-form-item label="启用验证码">
              <el-switch v-model="securityForm.captcha"></el-switch>
              <span class="form-text" v-if="securityForm.captcha">
                <el-radio-group v-model="securityForm.captchaType">
                  <el-radio label="image">图片验证码</el-radio>
                  <el-radio label="slide">滑动验证码</el-radio>
                </el-radio-group>
              </span>
            </el-form-item>
            <el-form-item label="启用双因素认证">
              <el-switch v-model="securityForm.twoFactor"></el-switch>
            </el-form-item>
            <el-form-item label="IP白名单">
              <el-switch v-model="securityForm.ipWhitelist"></el-switch>
              <div v-if="securityForm.ipWhitelist" class="ip-whitelist">
                <el-input
                  v-model="securityForm.ipWhitelistValue"
                  type="textarea"
                  :rows="4"
                  placeholder="请输入IP地址，每行一个"
                ></el-input>
                <div class="form-tip">每行输入一个IP地址或IP段，例如: 192.168.1.1 或 192.168.1.0/24</div>
              </div>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveSecuritySettings">保存设置</el-button>
              <el-button @click="resetSecurityForm">重置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <!-- 其他设置 -->
        <el-tab-pane label="其他设置" name="other">
          <el-form :model="otherForm" label-width="120px" ref="otherFormRef">
            <h3 class="setting-section-title">系统维护</h3>
            <el-form-item label="系统维护">
              <el-switch v-model="otherForm.maintenance"></el-switch>
              <div v-if="otherForm.maintenance" class="maintenance-settings">
                <el-form-item label="维护提示信息" prop="maintenanceMessage">
                  <el-input 
                    v-model="otherForm.maintenanceMessage" 
                    type="textarea" 
                    :rows="2" 
                    placeholder="请输入维护提示信息"
                  ></el-input>
                </el-form-item>
                <el-form-item label="计划维护时间">
                  <el-date-picker
                    v-model="otherForm.maintenanceTime"
                    type="datetimerange"
                    range-separator="至"
                    start-placeholder="开始时间"
                    end-placeholder="结束时间"
                    value-format="YYYY-MM-DD HH:mm:ss"
                  ></el-date-picker>
                </el-form-item>
              </div>
            </el-form-item>
            <el-form-item label="系统日志">
              <el-switch v-model="otherForm.systemLog"></el-switch>
              <span class="form-text" v-if="otherForm.systemLog">
                保留
                <el-input-number v-model="otherForm.logRetention" :min="1" :max="365" class="small-input"></el-input-number>
                天
              </span>
            </el-form-item>
            <el-form-item label="操作日志">
              <el-switch v-model="otherForm.operationLog"></el-switch>
              <span class="form-text" v-if="otherForm.operationLog">
                保留
                <el-input-number v-model="otherForm.operationLogRetention" :min="1" :max="365" class="small-input"></el-input-number>
                天
              </span>
            </el-form-item>
            <el-form-item label="登录日志">
              <el-switch v-model="otherForm.loginLog"></el-switch>
              <span class="form-text" v-if="otherForm.loginLog">
                保留
                <el-input-number v-model="otherForm.loginLogRetention" :min="1" :max="365" class="small-input"></el-input-number>
                天
              </span>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveOtherSettings">保存设置</el-button>
              <el-button @click="resetOtherForm">重置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <!-- 支付设置 -->
        <el-tab-pane label="支付设置" name="payment">
          <el-form :model="paymentForm" label-width="180px" ref="paymentFormRef">
            <h3 class="setting-section-title">USDT支付设置</h3>
            
            <el-form-item label="启用USDT支付">
              <el-switch v-model="paymentForm.enableUsdt"></el-switch>
            </el-form-item>
            
            <template v-if="paymentForm.enableUsdt">
              <el-form-item label="支付标题" prop="usdtTitle">
                <el-input v-model="paymentForm.usdtTitle" placeholder="请输入支付页面标题"></el-input>
                <div class="form-tip">显示在支付页面顶部的标题文字</div>
              </el-form-item>
              
              <el-form-item label="支付说明" prop="usdtDescription">
                <el-input v-model="paymentForm.usdtDescription" type="textarea" :rows="2" placeholder="请输入支付说明文字"></el-input>
                <div class="form-tip">显示在支付页面的说明文字，提醒用户注意事项</div>
              </el-form-item>
              
              <el-form-item label="支付编号前缀" prop="usdtOrderPrefix">
                <el-input v-model="paymentForm.usdtOrderPrefix" placeholder="请输入支付编号前缀"></el-input>
                <div class="form-tip">支付编号的前缀，用于区分不同的支付渠道</div>
              </el-form-item>
              
              <el-form-item label="USDT收款地址" prop="usdtAddress">
                <el-input v-model="paymentForm.usdtAddress" placeholder="请输入USDT收款地址"></el-input>
                <div class="form-tip">您的USDT收款钱包地址</div>
              </el-form-item>
              
              <el-form-item label="区块链网络" prop="usdtNetwork">
                <el-select v-model="paymentForm.usdtNetwork" placeholder="请选择区块链网络" style="width: 100%;">
                  <el-option label="TRC20 (TRON)" value="TRC20"></el-option>
                  <el-option label="ERC20 (Ethereum)" value="ERC20"></el-option>
                  <el-option label="BEP20 (BSC)" value="BEP20"></el-option>
                </el-select>
                <div class="form-tip">选择USDT所在的区块链网络</div>
              </el-form-item>
              
              <el-form-item label="支付超时时间" prop="usdtTimeout">
                <el-input-number v-model="paymentForm.usdtTimeout" :min="1" :max="1440" class="medium-input"></el-input-number>
                <span class="form-text">分钟</span>
                <div class="form-tip">支付页面的有效时间，超时后订单将自动关闭</div>
              </el-form-item>
              
              <el-form-item label="支付确认数" prop="usdtConfirmations">
                <el-input-number v-model="paymentForm.usdtConfirmations" :min="1" :max="30" class="medium-input"></el-input-number>
                <span class="form-text">个区块确认</span>
                <div class="form-tip">交易需要的区块确认数，确认数越多越安全，但处理时间也越长</div>
              </el-form-item>
              
              <el-form-item label="支付二维码Logo">
                <el-upload
                  class="avatar-uploader"
                  action="#"
                  :show-file-list="false"
                  :auto-upload="false"
                  :on-change="handleQrLogoChange"
                >
                  <img v-if="paymentForm.qrLogoUrl" :src="paymentForm.qrLogoUrl" class="avatar" />
                  <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
                </el-upload>
                <div class="upload-tip">建议尺寸: 100px * 100px，支持jpg、png格式，显示在支付二维码中间</div>
              </el-form-item>
              
              <el-form-item label="自动检测到账">
                <el-switch v-model="paymentForm.autoDetect"></el-switch>
                <div class="form-tip">启用后系统将自动检测交易是否到账，关闭则需要手动确认</div>
              </el-form-item>
              
              <el-form-item label="API密钥" prop="apiKey" v-if="paymentForm.autoDetect">
                <el-input v-model="paymentForm.apiKey" placeholder="请输入区块链API密钥" show-password></el-input>
                <div class="form-tip">用于自动检测交易的API密钥，可从相关区块链浏览器服务获取</div>
              </el-form-item>
              
              <el-form-item label="支付成功页面URL" prop="successUrl">
                <el-input v-model="paymentForm.successUrl" placeholder="请输入支付成功后跳转的URL"></el-input>
                <div class="form-tip">支付成功后跳转的页面地址，留空则使用系统默认页面</div>
              </el-form-item>
            </template>
            
            <el-form-item>
              <el-button type="primary" @click="savePaymentSettings">保存设置</el-button>
              <el-button @click="resetPaymentForm">重置</el-button>
              <el-button type="success" @click="testPaymentSettings">测试支付</el-button>
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
  description: '星海后台管理系统是一个基于Vue 3和Element Plus的后台管理系统',
  icp: '京ICP备12345678号',
  copyright: '© 2024 星海科技有限公司 版权所有'
})

// 基本设置表单验证规则
const basicRules = reactive<FormRules>({
  systemName: [
    { required: true, message: '请输入系统名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  description: [
    { max: 200, message: '长度不能超过 200 个字符', trigger: 'blur' }
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
  smtpServer: 'smtp.example.com',
  smtpPort: 465,
  senderEmail: 'admin@example.com',
  senderName: '星海管理系统',
  password: '********',
  ssl: true
})

// 邮件设置表单验证规则
const emailRules = reactive<FormRules>({
  smtpServer: [
    { required: true, message: '请输入SMTP服务器地址', trigger: 'blur' }
  ],
  smtpPort: [
    { required: true, message: '请输入SMTP端口', trigger: 'blur' }
  ],
  senderEmail: [
    { required: true, message: '请输入发件人邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  senderName: [
    { required: true, message: '请输入发件人名称', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入邮箱密码', trigger: 'blur' }
  ]
})

// 安全设置表单
const securityFormRef = ref<FormInstance>()
const securityForm = reactive({
  passwordExpire: 90,
  loginLock: true,
  loginLockCount: 5,
  loginLockTime: 30,
  captcha: true,
  captchaType: 'image',
  twoFactor: false,
  ipWhitelist: false,
  ipWhitelistValue: ''
})

// 其他设置表单
const otherFormRef = ref<FormInstance>()
const otherForm = reactive({
  // 系统维护设置
  maintenance: false,
  maintenanceMessage: '系统正在维护中，请稍后再试...',
  maintenanceTime: [] as string[],
  
  // 日志设置
  systemLog: true,
  logRetention: 30,
  operationLog: true,
  operationLogRetention: 90,
  loginLog: true,
  loginLogRetention: 180
})

// 支付设置表单
const paymentFormRef = ref<FormInstance>()
const paymentForm = reactive({
  // USDT支付设置
  enableUsdt: true,
  usdtTitle: '得多号码平台',
  usdtDescription: '当前USDT支付区块链网络协议为TRC20',
  usdtOrderPrefix: 'HENDUOHAO',
  usdtAddress: 'THDpUb2RCAv26mZ6jQZc1MMhR6WmJy5Jn9',
  usdtNetwork: 'TRC20',
  usdtTimeout: 30,
  usdtConfirmations: 1,
  qrLogoUrl: 'https://element-plus.org/images/element-plus-logo.svg',
  autoDetect: true,
  apiKey: '********',
  successUrl: ''
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
      ElMessage.success('基本设置保存成功')
    } else {
      console.log('表单验证失败', fields)
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

// 保存安全设置
const saveSecuritySettings = () => {
  ElMessage.success('安全设置保存成功')
}

// 重置安全设置表单
const resetSecurityForm = () => {
  if (securityFormRef.value) {
    securityFormRef.value.resetFields()
  }
}

// 保存其他设置
const saveOtherSettings = () => {
  ElMessage.success('其他设置保存成功')
}

// 重置其他设置表单
const resetOtherForm = () => {
  if (otherFormRef.value) {
    otherFormRef.value.resetFields()
  }
}

// 处理二维码Logo上传
const handleQrLogoChange = (file: any) => {
  const isImage = file.raw.type === 'image/jpeg' || file.raw.type === 'image/png'
  const isLt2M = file.raw.size / 1024 / 1024 < 2
  
  if (!isImage) {
    ElMessage.error('上传头像图片只能是 JPG 或 PNG 格式!')
    return
  }
  if (!isLt2M) {
    ElMessage.error('上传头像图片大小不能超过 2MB!')
    return
  }
  
  // 模拟上传成功
  paymentForm.qrLogoUrl = URL.createObjectURL(file.raw)
  ElMessage.success('Logo上传成功')
}

// 保存支付设置
const savePaymentSettings = () => {
  ElMessage.success('支付设置保存成功')
}

// 重置支付设置表单
const resetPaymentForm = () => {
  // 重置为初始值
  paymentForm.enableUsdt = true
  paymentForm.usdtTitle = '得多号码平台'
  paymentForm.usdtDescription = '当前USDT支付区块链网络协议为TRC20'
  paymentForm.usdtOrderPrefix = 'HENDUOHAO'
  paymentForm.usdtAddress = 'THDpUb2RCAv26mZ6jQZc1MMhR6WmJy5Jn9'
  paymentForm.usdtNetwork = 'TRC20'
  paymentForm.usdtTimeout = 30
  paymentForm.usdtConfirmations = 1
  paymentForm.autoDetect = true
  paymentForm.apiKey = '********'
  paymentForm.successUrl = ''
  
  ElMessage.info('已重置为默认设置')
}

// 测试支付设置
const testPaymentSettings = () => {
  ElMessage.success('支付测试成功，可以正常使用')
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
  width: 80px;
  margin: 0 5px;
}

.ip-whitelist {
  margin-top: 10px;
}

.maintenance-settings {
  margin-top: 15px;
  padding-left: 20px;
}

.setting-section-title {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 16px;
  font-weight: bold;
  color: #409EFF;
  border-left: 3px solid #409EFF;
  padding-left: 10px;
}

.medium-input {
  width: 120px !important;
}

.form-text {
  margin-left: 10px;
  color: #606266;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
  margin-top: 5px;
}
</style> 