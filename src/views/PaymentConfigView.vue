<template>
  <div class="payment-config-view">
    <el-card shadow="never" class="filter-container">
      <!-- 支付等待时间设置区域 -->
      <div class="waiting-time-display">
        <div class="setting-item">
          <span class="setting-label">支付等待时间：</span>
          <span class="setting-value">{{ paymentStore.waitingTime }} 分钟</span>
          <el-button type="primary" link :icon="Edit" @click="openWaitingTimeDialog">编辑</el-button>
        </div>
      </div>
      
      <!-- Tabs区域 -->
      <el-tabs v-model="activePaymentMethod" class="payment-tabs">
        <el-tab-pane label="微信支付" name="wechat">
          <payment-channel-list payment-method-key="wechat" />
        </el-tab-pane>
        <el-tab-pane label="支付宝支付" name="alipay">
          <payment-channel-list payment-method-key="alipay" />
        </el-tab-pane>
        <el-tab-pane label="USDT支付" name="usdt">
          <payment-channel-list payment-method-key="usdt" />
        </el-tab-pane>
      </el-tabs>
    </el-card>
    
    <!-- 等待时间编辑弹窗 -->
    <el-dialog
      v-model="waitingTimeDialogVisible"
      title="编辑支付等待时间"
      width="400px"
      destroy-on-close
    >
      <el-form :model="waitingTimeForm" label-width="120px">
        <el-form-item label="等待时间" required>
          <el-input-number
            v-model="waitingTimeForm.time"
            :min="1"
            :max="60"
            :step="1"
            controls-position="right"
            style="width: 168px;"
          />
          <span class="unit-text">分钟</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="waitingTimeDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveWaitingTime" :loading="saving">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { Edit } from '@element-plus/icons-vue';
import PaymentChannelList from '../components/PaymentChannelList.vue';
import { usePaymentStore } from '../stores/paymentStore';

const paymentStore = usePaymentStore();
const activePaymentMethod = ref<'wechat' | 'alipay' | 'usdt'>('wechat');
const waitingTimeDialogVisible = ref(false);
const saving = ref(false);

// 编辑表单数据
const waitingTimeForm = reactive({
  time: paymentStore.waitingTime
});

// 打开等待时间编辑弹窗
const openWaitingTimeDialog = () => {
  waitingTimeForm.time = paymentStore.waitingTime;
  waitingTimeDialogVisible.value = true;
};

// 保存等待时间
const saveWaitingTime = () => {
  saving.value = true;
  const success = paymentStore.setWaitingTime(waitingTimeForm.time);
  saving.value = false;
  
  if (success) {
    ElMessage.success('支付等待时间已保存');
    waitingTimeDialogVisible.value = false;
  } else {
    ElMessage.error('请输入1-60分钟的有效时间');
  }
};
</script>

<style scoped>
.payment-config-view {
  padding: 20px;
}
.filter-container {
  margin-bottom: 16px;
}
.waiting-time-display {
  padding: 0 0 16px 0;
  border-bottom: 1px solid #EBEEF5;
  margin-bottom: 16px;
}
.setting-item {
  display: flex;
  align-items: center;
}
.setting-label {
  font-weight: 500;
  color: #606266;
  margin-right: 8px;
}
.setting-value {
  font-size: 14px;
  color: #303133;
  margin-right: 16px;
}
.unit-text {
  margin-left: 8px;
  color: #606266;
}
.payment-tabs {
  padding: 10px 0;
}
.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style> 