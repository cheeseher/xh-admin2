<template>
  <div class="login-container">
    <div class="login-background"></div>
    <div class="login-box">
      <div class="login-header">
        <div class="logo">
          <el-icon><Monitor /></el-icon>
          <h2 class="title">星海后台管理系统</h2>
        </div>
      </div>
      
      <div class="login-form">
        <h3 class="form-title">账号登录</h3>
        <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" label-position="top">
          <el-form-item prop="username">
            <el-input 
              v-model="loginForm.username" 
              placeholder="请输入用户名" 
              prefix-icon="User"
              size="large"
              clearable
            ></el-input>
          </el-form-item>
          
          <el-form-item prop="password">
            <el-input 
              v-model="loginForm.password" 
              type="password" 
              placeholder="请输入密码" 
              prefix-icon="Lock"
              size="large"
              show-password
              clearable
            ></el-input>
          </el-form-item>
          
          <el-form-item prop="captcha">
            <div class="captcha-container">
              <el-input 
                v-model="loginForm.captcha" 
                placeholder="请输入验证码" 
                prefix-icon="ChatLineSquare"
                size="large"
                clearable
              ></el-input>
              <div class="captcha-image" @click="refreshCaptcha">
                <img :src="captchaUrl" alt="验证码" />
              </div>
            </div>
          </el-form-item>
          
          <div class="login-options">
            <el-checkbox v-model="loginForm.remember">记住密码</el-checkbox>
          </div>
          
          <el-form-item>
            <el-button 
              type="primary" 
              :loading="loading" 
              @click="handleLogin" 
              size="large" 
              class="login-button"
            >登录</el-button>
          </el-form-item>
        </el-form>
      </div>
      
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, ChatLineSquare, Monitor } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

const router = useRouter()
const loginFormRef = ref<FormInstance>()
const loading = ref(false)
const captchaUrl = ref('https://picsum.photos/120/40?random=' + Math.random())

// 登录表单数据
const loginForm = reactive({
  username: '',
  password: '',
  captcha: '',
  remember: false
})

// 表单验证规则
const loginRules = reactive<FormRules>({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  captcha: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { min: 4, max: 6, message: '长度在 4 到 6 个字符', trigger: 'blur' }
  ]
})

// 刷新验证码
const refreshCaptcha = () => {
  captchaUrl.value = 'https://picsum.photos/120/40?random=' + Math.random()
}

// 登录处理
const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate((valid, fields) => {
    if (valid) {
      loading.value = true
      
      // 模拟登录请求
      setTimeout(() => {
        loading.value = false
        
        // 模拟登录成功
        if (loginForm.username === 'admin' && loginForm.password === '123456') {
          ElMessage.success('登录成功')
          
          // 存储登录状态
          localStorage.setItem('token', 'admin-token')
          localStorage.setItem('userInfo', JSON.stringify({
            username: loginForm.username,
            role: '管理员',
            avatar: 'https://picsum.photos/200'
          }))
          
          // 获取重定向地址
          const redirect = router.currentRoute.value.query.redirect as string
          
          // 跳转到重定向地址或首页
          router.push(redirect || '/')
        } else {
          ElMessage.error('用户名或密码错误')
        }
      }, 1000)
    } else {
      console.log('表单验证失败', fields)
    }
  })
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  position: relative;
  overflow: hidden;
}

.login-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #1976d2;
  z-index: -1;
}

.login-background::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="rgba(255,255,255,0.05)" fill-opacity="1" d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>');
  background-position: bottom;
  background-repeat: no-repeat;
  background-size: 100% 50%;
  opacity: 0.8;
}

.login-box {
  width: 420px;
  padding: 40px;
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  position: relative;
  z-index: 1;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}

.logo .el-icon {
  font-size: 28px;
  color: #409EFF;
  margin-right: 10px;
}

.title {
  font-size: 24px;
  color: #303133;
  margin: 0;
  font-weight: 600;
}

.form-title {
  font-size: 18px;
  color: #303133;
  margin-bottom: 20px;
  font-weight: 500;
  text-align: center;
}

.login-form {
  margin-bottom: 20px;
}

.captcha-container {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: space-between;
}

.captcha-image {
  height: 40px;
  cursor: pointer;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.captcha-image img {
  height: 100%;
  width: 120px;
  object-fit: cover;
}

.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.login-button {
  width: 100%;
  height: 44px;
  font-size: 16px;
  border-radius: 4px;
  background: linear-gradient(to right, #1976d2, #2196f3);
  border: none;
}

.login-button:hover {
  background: linear-gradient(to right, #1565c0, #1976d2);
}
</style> 