<template>
  <div class="reset-password-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>修改密码</span>
        </div>
      </template>
      
      <div class="reset-password-content">
        <el-steps :active="currentStep" finish-status="success" simple>
          <el-step title="验证身份" icon="Lock" />
          <el-step title="设置新密码" icon="Key" />
          <el-step title="完成" icon="CircleCheck" />
        </el-steps>
        
        <!-- 步骤1：验证身份 -->
        <div v-if="currentStep === 0" class="step-content">
          <el-form 
            :model="verifyForm" 
            :rules="verifyRules" 
            ref="verifyFormRef" 
            label-width="100px" 
            class="verify-form"
          >
            <el-form-item label="当前密码" prop="currentPassword">
              <el-input 
                v-model="verifyForm.currentPassword" 
                type="password" 
                placeholder="请输入当前密码"
                show-password
              ></el-input>
            </el-form-item>
            
            <el-form-item label="验证码" prop="captcha">
              <div class="captcha-container">
                <el-input 
                  v-model="verifyForm.captcha" 
                  placeholder="请输入验证码"
                ></el-input>
                <div class="captcha-image" @click="refreshCaptcha">
                  <img :src="captchaUrl" alt="验证码" />
                </div>
              </div>
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="handleVerify" :loading="verifyLoading">下一步</el-button>
              <el-button @click="handleCancel">取消</el-button>
            </el-form-item>
          </el-form>
        </div>
        
        <!-- 步骤2：设置新密码 -->
        <div v-else-if="currentStep === 1" class="step-content">
          <el-form 
            :model="passwordForm" 
            :rules="passwordRules" 
            ref="passwordFormRef" 
            label-width="100px" 
            class="password-form"
          >
            <el-form-item label="新密码" prop="newPassword">
              <el-input 
                v-model="passwordForm.newPassword" 
                type="password" 
                placeholder="请输入新密码"
                show-password
              ></el-input>
              <div class="password-strength">
                <div class="strength-label">密码强度：</div>
                <div class="strength-meter">
                  <div 
                    class="strength-bar" 
                    :class="passwordStrengthClass"
                    :style="{ width: passwordStrength + '%' }"
                  ></div>
                </div>
                <div class="strength-text" :class="passwordStrengthClass">{{ passwordStrengthText }}</div>
              </div>
              <div class="password-tips">
                <p>密码必须包含以下条件：</p>
                <ul>
                  <li :class="{ active: passwordHasLength }">长度至少为8个字符</li>
                  <li :class="{ active: passwordHasLower }">包含小写字母</li>
                  <li :class="{ active: passwordHasUpper }">包含大写字母</li>
                  <li :class="{ active: passwordHasNumber }">包含数字</li>
                  <li :class="{ active: passwordHasSpecial }">包含特殊字符</li>
                </ul>
              </div>
            </el-form-item>
            
            <el-form-item label="确认新密码" prop="confirmPassword">
              <el-input 
                v-model="passwordForm.confirmPassword" 
                type="password" 
                placeholder="请再次输入新密码"
                show-password
              ></el-input>
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="handleResetPassword" :loading="resetLoading">提交</el-button>
              <el-button @click="handlePrevStep">上一步</el-button>
            </el-form-item>
          </el-form>
        </div>
        
        <!-- 步骤3：完成 -->
        <div v-else class="step-content success-content">
          <el-result
            icon="success"
            title="密码修改成功"
            sub-title="您的账户密码已经成功修改，请使用新密码登录系统"
          >
            <template #extra>
              <el-button type="primary" @click="handleBackToProfile">返回个人中心</el-button>
              <el-button @click="handleReLogin">重新登录</el-button>
            </template>
          </el-result>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Lock, Key, CircleCheck } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

const router = useRouter()
const verifyFormRef = ref<FormInstance>()
const passwordFormRef = ref<FormInstance>()
const currentStep = ref(0)
const verifyLoading = ref(false)
const resetLoading = ref(false)
const captchaUrl = ref('https://picsum.photos/120/40?random=' + Math.random())

// 验证表单数据
const verifyForm = reactive({
  currentPassword: '',
  captcha: ''
})

// 密码表单数据
const passwordForm = reactive({
  newPassword: '',
  confirmPassword: ''
})

// 验证表单规则
const verifyRules = reactive<FormRules>({
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  captcha: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { min: 4, max: 6, message: '长度在 4 到 6 个字符', trigger: 'blur' }
  ]
})

// 密码表单规则
const passwordRules = reactive<FormRules>({
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 8, max: 30, message: '长度在 8 到 30 个字符', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (value === verifyForm.currentPassword) {
          callback(new Error('新密码不能与当前密码相同'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    },
    {
      validator: (rule, value, callback) => {
        if (passwordStrength.value < 60) {
          callback(new Error('密码强度不足，请按照要求设置密码'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ]
})

// 密码强度相关计算属性
const passwordHasLength = computed(() => {
  return passwordForm.newPassword.length >= 8
})

const passwordHasLower = computed(() => {
  return /[a-z]/.test(passwordForm.newPassword)
})

const passwordHasUpper = computed(() => {
  return /[A-Z]/.test(passwordForm.newPassword)
})

const passwordHasNumber = computed(() => {
  return /[0-9]/.test(passwordForm.newPassword)
})

const passwordHasSpecial = computed(() => {
  return /[^A-Za-z0-9]/.test(passwordForm.newPassword)
})

const passwordStrength = computed(() => {
  if (!passwordForm.newPassword) return 0
  
  let strength = 0
  if (passwordHasLength.value) strength += 20
  if (passwordHasLower.value) strength += 20
  if (passwordHasUpper.value) strength += 20
  if (passwordHasNumber.value) strength += 20
  if (passwordHasSpecial.value) strength += 20
  
  return strength
})

const passwordStrengthClass = computed(() => {
  if (passwordStrength.value < 40) return 'weak'
  if (passwordStrength.value < 80) return 'medium'
  return 'strong'
})

const passwordStrengthText = computed(() => {
  if (passwordStrength.value < 40) return '弱'
  if (passwordStrength.value < 80) return '中'
  return '强'
})

// 刷新验证码
const refreshCaptcha = () => {
  captchaUrl.value = 'https://picsum.photos/120/40?random=' + Math.random()
}

// 验证身份
const handleVerify = async () => {
  if (!verifyFormRef.value) return
  
  await verifyFormRef.value.validate((valid, fields) => {
    if (valid) {
      verifyLoading.value = true
      
      // 模拟验证
      setTimeout(() => {
        verifyLoading.value = false
        
        // 假设密码是123456
        if (verifyForm.currentPassword === '123456') {
          currentStep.value = 1
        } else {
          ElMessage.error('当前密码不正确')
        }
      }, 1000)
    } else {
      console.log('表单验证失败', fields)
    }
  })
}

// 重置密码
const handleResetPassword = async () => {
  if (!passwordFormRef.value) return
  
  await passwordFormRef.value.validate((valid, fields) => {
    if (valid) {
      resetLoading.value = true
      
      // 模拟重置密码
      setTimeout(() => {
        resetLoading.value = false
        currentStep.value = 2
        
        // 这里应该调用API修改密码
        console.log('新密码:', passwordForm.newPassword)
      }, 1000)
    } else {
      console.log('表单验证失败', fields)
    }
  })
}

// 返回上一步
const handlePrevStep = () => {
  currentStep.value = 0
}

// 返回个人中心
const handleBackToProfile = () => {
  router.push('/user/profile')
}

// 重新登录
const handleReLogin = () => {
  ElMessageBox.confirm(
    '修改密码后需要重新登录，是否立即退出？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 清除登录状态
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    
    // 跳转到登录页
    router.push('/login')
  }).catch(() => {
    // 取消操作
  })
}

// 取消操作
const handleCancel = () => {
  ElMessageBox.confirm(
    '确定要取消修改密码吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    }
  ).then(() => {
    router.push('/user/profile')
  }).catch(() => {
    // 取消操作
  })
}

// 监听密码变化，重新验证确认密码
watch(() => passwordForm.newPassword, (val) => {
  if (passwordForm.confirmPassword) {
    passwordFormRef.value?.validateField('confirmPassword')
  }
})
</script>

<style scoped>
.reset-password-container {
  padding: 20px;
}

.box-card {
  max-width: 800px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.reset-password-content {
  padding: 20px 0;
}

.step-content {
  margin-top: 40px;
}

.verify-form,
.password-form {
  max-width: 500px;
  margin: 0 auto;
}

.captcha-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.captcha-image {
  height: 40px;
  cursor: pointer;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.captcha-image img {
  height: 100%;
  width: 120px;
  object-fit: cover;
}

.password-strength {
  margin-top: 10px;
  display: flex;
  align-items: center;
}

.strength-label {
  font-size: 14px;
  color: #606266;
  margin-right: 10px;
}

.strength-meter {
  flex: 1;
  height: 6px;
  background-color: #ebeef5;
  border-radius: 3px;
  overflow: hidden;
}

.strength-bar {
  height: 100%;
  transition: width 0.3s ease;
}

.strength-bar.weak {
  background-color: #f56c6c;
}

.strength-bar.medium {
  background-color: #e6a23c;
}

.strength-bar.strong {
  background-color: #67c23a;
}

.strength-text {
  margin-left: 10px;
  font-size: 14px;
}

.strength-text.weak {
  color: #f56c6c;
}

.strength-text.medium {
  color: #e6a23c;
}

.strength-text.strong {
  color: #67c23a;
}

.password-tips {
  margin-top: 15px;
  padding: 10px;
  background-color: #f8f8f8;
  border-radius: 4px;
}

.password-tips p {
  margin: 0 0 5px 0;
  font-size: 14px;
  color: #606266;
}

.password-tips ul {
  margin: 0;
  padding-left: 20px;
}

.password-tips li {
  margin: 5px 0;
  font-size: 13px;
  color: #909399;
}

.password-tips li.active {
  color: #67c23a;
}

.success-content {
  text-align: center;
  padding: 20px 0;
}
</style> 