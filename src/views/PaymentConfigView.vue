<template>
  <div class="payment-config-view">
    <el-card shadow="never" class="filter-container">
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
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import PaymentChannelList from '../components/PaymentChannelList.vue';

// 当前激活的支付方式标签
const activePaymentMethod = ref<'wechat' | 'alipay' | 'usdt'>('wechat');
</script>

<style scoped>
.payment-config-view {
  padding: 20px;
}
.filter-container {
  margin-bottom: 16px;
}
.payment-tabs {
  padding: 10px 0;
}
</style> 