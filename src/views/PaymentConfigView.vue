<template>
  <div class="payment-config-view">
    <el-card shadow="never" class="config-container">
      <template #header>
        <div class="card-header">
          <span>支付系统配置</span>
        </div>
      </template>
      
      <div class="page-description">
        <p>配置商户信息，用于对接支付系统。请确保商户号和密钥的准确性。</p>
      </div>
      
      <!-- 支付配置表单 -->
      <el-form :model="paymentConfig" label-width="120px" :rules="rules" ref="formRef">
        <el-form-item label="商户号" prop="merchantId" required>
          <el-input 
            v-model="paymentConfig.merchantId"
            placeholder="请输入商户号"
            style="width: 350px;"
          ></el-input>
        </el-form-item>
        
        <el-form-item label="商户密钥" prop="merchantKey" required>
          <el-input 
            v-model="paymentConfig.merchantKey"
            type="password"
            placeholder="请输入商户密钥"
            style="width: 350px;"
            show-password
          ></el-input>
          <span class="key-hint">商户密钥用于签名验证，请妥善保管</span>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="saveConfig" :loading="saving">保存配置</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
      
      <!-- 操作说明 -->
      <div class="instructions-container">
        <h4>操作说明：</h4>
        <ol>
          <li>联系下方客服获取商户号和商户密钥</li>
          <li>将获取的商户号和密钥填入上方对应输入框</li>
          <li>点击"保存配置"按钮完成设置</li>
          <li>配置成功后，系统将自动对接支付功能</li>
        </ol>
      </div>
      
      <!-- 联系方式 -->
      <div class="contact-container">
        <h4>技术支持与合作：</h4>
        <div class="highlight-box">
          <div class="highlight-text">定制开发、对接第三方支付通道、业务合作</div>
        </div>
        <div class="contact-info">
          <p><strong>QQ：</strong>3909001743</p>
          <p><strong>Telegram：</strong>@sy9088</p>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';

// 表单引用
const formRef = ref<FormInstance>();
const saving = ref(false);

// 支付配置数据
const paymentConfig = reactive({
  merchantId: '',
  merchantKey: ''
});

// 表单验证规则
const rules = reactive<FormRules>({
  merchantId: [
    { required: true, message: '请输入商户号', trigger: 'blur' },
    { min: 4, max: 30, message: '商户号长度应在4-30个字符之间', trigger: 'blur' }
  ],
  merchantKey: [
    { required: true, message: '请输入商户密钥', trigger: 'blur' },
    { min: 8, max: 64, message: '商户密钥长度应在8-64个字符之间', trigger: 'blur' }
  ]
});

// 保存配置
const saveConfig = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate((valid, fields) => {
    if (valid) {
      saving.value = true;
      
      // 模拟API调用
      setTimeout(() => {
        saving.value = false;
        ElMessage.success('支付系统配置保存成功');
        console.log('保存的配置数据:', paymentConfig);
      }, 800);
    } else {
      console.log('表单验证失败:', fields);
    }
  });
};

// 重置表单
const resetForm = () => {
  if (!formRef.value) return;
  formRef.value.resetFields();
};
</script>

<style scoped>
.payment-config-view {
  padding: 20px;
}

.config-container {
  max-width: 800px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.page-description {
  margin-bottom: 24px;
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
}

.key-hint {
  margin-left: 10px;
  font-size: 12px;
  color: #909399;
}

.instructions-container {
  margin-top: 30px;
  padding: 16px;
  background-color: #f8f8f8;
  border-radius: 4px;
}

.instructions-container h4 {
  margin-top: 0;
  margin-bottom: 12px;
  color: #303133;
  font-size: 14px;
}

.instructions-container ol {
  margin: 0;
  padding-left: 16px;
}

.instructions-container li {
  line-height: 1.6;
  margin-bottom: 8px;
  color: #606266;
  font-size: 13px;
}

.instructions-container li:last-child {
  margin-bottom: 0;
}

.contact-container {
  margin-top: 24px;
  padding: 16px;
  background-color: #f0f9ff;
  border-radius: 4px;
  border-left: 4px solid #409EFF;
}

.contact-container h4 {
  margin-top: 0;
  margin-bottom: 12px;
  color: #303133;
  font-size: 14px;
}

.contact-info p {
  margin: 5px 0;
  color: #606266;
  font-size: 13px;
  line-height: 1.6;
}

.highlight-box {
  margin-bottom: 15px;
  padding: 12px;
  background: linear-gradient(135deg, #409EFF10, #409EFF20);
  border-radius: 4px;
  border-left: 4px solid #409EFF;
  text-align: center;
}

.highlight-text {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  letter-spacing: 1px;
}
</style> 