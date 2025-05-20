<template>
  <div class="payment-channel-list">
    <!-- 工具栏 -->
    <div class="table-toolbar">
      <div class="left">
        <!-- 根据需求移除添加新通道按钮 -->
      </div>
      <div class="right">
        <el-alert
          v-if="showAlertForInvalidWeights"
          title="当前支付方式下，所有启用通道的权重总和为0，或没有启用通道。这将导致无实际送单，请检查并为启用通道设置有效权重。"
          type="warning"
          show-icon
          class="ratio-warning"
        />
      </div>
    </div>

    <!-- 表格 -->
    <el-table 
      :data="channelsWithActualRatio" 
      border 
      stripe
      empty-text="暂无通道配置"
      style="width: 100%; margin-top: 16px;">
      <el-table-column prop="name" label="通道名称" min-width="180" />
      <el-table-column label="送单权重" width="120" align="center">
        <template #default="{ row }">
          {{ row.ratio }}
        </template>
      </el-table-column>
      <el-table-column prop="fee" label="手续费 (%)" width="120" align="center">
        <template #default="{ row }">
          {{ row.fee.toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column label="单笔限额" width="160" align="center">
        <template #default="{ row }">
          {{ row.minAmount || 0 }} - {{ row.maxAmount ? row.maxAmount : '不限' }}
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 'enabled' ? 'success' : 'info'">
            {{ row.status === 'enabled' ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right" align="center">
        <template #default="{ row }">
          <el-button link type="primary" @click="handleEditChannel(row)">
            <el-icon><Edit /></el-icon>
            编辑
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加/编辑通道弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="'编辑支付通道'" 
      width="500px"
      append-to-body
      destroy-on-close 
    >
      <el-form :model="currentChannel" label-width="100px" ref="channelFormRef">
        <el-form-item
          label="通道名称"
          prop="name"
          required
          :rules="[{ required: true, message: '通道名称不能为空', trigger: 'blur' }]"
        >
          <el-input v-model="currentChannel.name" placeholder="例如: 老微信通道A" />
        </el-form-item>
        <el-form-item
          label="支付方式"
          prop="paymentMethodKey"
        >
          <el-select v-model="currentChannel.paymentMethodKey" placeholder="选择支付方式" disabled style="width: 168px;">
            <el-option label="微信支付" value="wechat"></el-option>
            <el-option label="支付宝支付" value="alipay"></el-option>
            <el-option label="USDT支付" value="usdt"></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item
          label="送单权重"
          prop="ratio" 
          required
          :rules="[
            { required: true, message: '送单权重不能为空', trigger: 'blur' },
            { type: 'number', min: 0, max: 100, message: '权重需在0-100之间', trigger: 'blur' }
          ]"
        >
          <el-input-number 
            v-model="currentChannel.ratio" 
            :min="0" 
            :max="100"
            controls-position="right"
            style="width: 168px;" />
           <div v-if="currentChannel.status === 'enabled' && currentChannel.ratio === 0 && !isSingleEnabledChannel" class="el-form-item__extra_tip ratio-warning-text">
            提示：权重为0的启用通道实际送单比例为0%。
          </div>
        </el-form-item>
        
        <el-form-item
          label="手续费"
          prop="fee"
          required
          :rules="[
            { required: true, message: '手续费不能为空', trigger: 'blur' },
            { type: 'number', min: 0, max: 100, message: '手续费需在0-100之间', trigger: 'blur' }
          ]"
        >
          <el-input-number 
            v-model="currentChannel.fee" 
            :min="0" 
            :max="100" 
            :precision="2"
            :step="0.1"
            controls-position="right"
            style="width: 168px;" /> %
        </el-form-item>
        
        <el-form-item
          label="单笔限额"
          required
        >
          <div class="price-range-container">
            <el-input-number 
              v-model="currentChannel.minAmount" 
              :min="0" 
              :max="currentChannel.maxAmount ? currentChannel.maxAmount : 999999"
              :step="10"
              controls-position="right"
              placeholder="最低限额"
              style="width: 168px;" />
            <span class="range-separator">至</span>
            <el-input-number 
              v-model="currentChannel.maxAmount" 
              :min="currentChannel.minAmount || 0" 
              :step="100"
              controls-position="right"
              placeholder="最高限额 (0表示不限)"
              style="width: 168px;" />
          </div>
          <div class="el-form-item__extra_tip">单笔交易限额范围，0表示不限</div>
        </el-form-item>
        
        <el-form-item label="状态" prop="status">
          <el-switch
            v-model="currentChannel.status"
            active-value="enabled"
            inactive-value="disabled"
            @change="handleStatusSwitchInDialog"
          />
          <span class="status-text">{{ currentChannel.status === 'enabled' ? '启用' : '禁用' }}</span>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="form-buttons">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitChannelForm" :loading="submitLoading">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch, nextTick } from 'vue';
import { ElMessage, type FormInstance } from 'element-plus';
import { usePaymentStore, type PaymentChannel } from '../stores/paymentStore';
import { Edit } from '@element-plus/icons-vue';

interface CurrentChannelState extends Omit<PaymentChannel, 'id'> {
  id?: string; // id 在新建时可能不存在，或者在 resetForm 后被清除
}

const props = defineProps<{
  paymentMethodKey: 'wechat' | 'alipay' | 'usdt';
}>();

const paymentStore = usePaymentStore();
const channelFormRef = ref<FormInstance>();
const dialogVisible = ref(false);
const submitLoading = ref(false);

const channelsWithActualRatio = computed(() => 
  paymentStore.getChannelsByMethodWithActualRatio(props.paymentMethodKey)
);

const enabledChannelsCount = computed(() => 
  channelsWithActualRatio.value.filter(c => c.status === 'enabled').length
);

const isSingleEnabledChannel = computed(() => 
  enabledChannelsCount.value === 1 && 
  channelsWithActualRatio.value.find(c => c.id === currentChannel.id)?.status === 'enabled'
);

const showAlertForInvalidWeights = computed(() => {
  const enabledChannels = channelsWithActualRatio.value.filter(c => c.status === 'enabled');
  if (enabledChannels.length === 0 && channelsWithActualRatio.value.length > 0) return true;
  if (enabledChannels.length > 0) {
    const totalWeightOfEnabled = enabledChannels.reduce((sum, c) => sum + c.ratio, 0);
    return totalWeightOfEnabled === 0;
  }
  return false;
});

const initialChannelState = (): CurrentChannelState => ({
  name: '',
  paymentMethodKey: props.paymentMethodKey,
  ratio: 1,
  status: 'enabled',
  fee: 0,
  minAmount: 100,
  maxAmount: 10000,
  id: undefined // 确保 id 初始为 undefined
});

const currentChannel = reactive<CurrentChannelState>(initialChannelState());

watch(() => props.paymentMethodKey, (newKey) => {
  currentChannel.paymentMethodKey = newKey;
  // 当支付方式切换时，可能需要重置表单到对应方式的初始状态
  // resetForm(); // 考虑是否需要，或者仅更新 key
});

const resetForm = () => {
  const freshState = initialChannelState();
  Object.assign(currentChannel, freshState);
  
  nextTick(() => {
    channelFormRef.value?.clearValidate();
    // resetFields 可能不完全按预期工作，特别是对于深层响应式对象或复杂类型
    // 手动重置关键字段确保状态正确
    currentChannel.name = '';
    currentChannel.paymentMethodKey = props.paymentMethodKey;
    currentChannel.ratio = 1;
    currentChannel.status = 'enabled';
    currentChannel.fee = 0;
    currentChannel.minAmount = 100;
    currentChannel.maxAmount = 10000;
    currentChannel.id = undefined; // 再次确保id清除
  });
};

const handleEditChannel = (channel: PaymentChannel & { actualRatio?: number }) => {
  // resetForm(); // 在 assign 之前调用 reset 会导致 props.paymentMethodKey 覆盖 channel 的值
  const channelToEdit = JSON.parse(JSON.stringify(channel)); 
  Object.assign(currentChannel, channelToEdit);
  // 确保 paymentMethodKey 来自 props，以防 channel 数据不一致（理论上不应发生）
  currentChannel.paymentMethodKey = props.paymentMethodKey;

  dialogVisible.value = true;
};

const handleStatusSwitchInDialog = (newStatus: string | number | boolean) => {
  if (newStatus === 'enabled' && currentChannel.ratio === 0) {
    currentChannel.ratio = 1;
    ElMessage.info('已启用通道，权重自动设为1，您可以按需修改。');
  }
};

const submitChannelForm = async () => {
  if (!channelFormRef.value) return;
  submitLoading.value = true;

  try {
    await channelFormRef.value.validate(); // validate 返回 Promise，成功则继续，失败则抛异常

    currentChannel.ratio = Number(currentChannel.ratio);
    if (isNaN(currentChannel.ratio) || currentChannel.ratio < 0 || currentChannel.ratio > 100) {
      ElMessage.error('送单权重必须是0到100之间的数字。');
      submitLoading.value = false;
      return;
    }

    // 验证价格区间
    const minAmount = Number(currentChannel.minAmount);
    const maxAmount = Number(currentChannel.maxAmount);
    if (isNaN(minAmount) || minAmount < 0) {
      ElMessage.error('最低限额必须是大于等于0的数字');
      submitLoading.value = false;
      return;
    }
    if (maxAmount && (isNaN(maxAmount) || maxAmount < minAmount)) {
      ElMessage.error('最高限额必须大于或等于最低限额');
      submitLoading.value = false; 
      return;
    }

    // 调整提示逻辑：只有在多个启用通道，且当前编辑的这个启用通道权重为0时才提示
    const otherEnabledChannelsExist = channelsWithActualRatio.value.some(c => c.status === 'enabled' && c.id !== currentChannel.id);
    if (currentChannel.status === 'enabled' && currentChannel.ratio === 0 && otherEnabledChannelsExist) {
      ElMessage.warning('提示：当前启用的通道权重为0，在还有其他启用通道时，其实际送单比例将为0%。');
    }

    let success = false;
    if (currentChannel.id) { 
      success = paymentStore.updateChannel(currentChannel as PaymentChannel); // 此处断言 id 必然存在
    } else {
      // 添加逻辑已移除，理论上不执行
      ElMessage.error('不支持添加新通道。'); 
      submitLoading.value = false;
      return;
    }
    
    if (success) {
      ElMessage.success('通道配置保存成功');
      dialogVisible.value = false;
    } else {
      ElMessage.error('操作失败，请检查store逻辑或通道ID是否存在。');
    }
  } catch (validationError) {
    // ElForm 的 validate 失败会进入 catch (ถ้า配置了 validationResult: 'first-error' 或者不配置)
    console.log('表单验证失败:', validationError);
    ElMessage.error('表单验证失败，请检查输入项。');
  } finally {
    submitLoading.value = false;
  }
};

</script>

<style scoped>
.payment-channel-list {
  margin-top: 10px;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.ratio-warning {
  margin-bottom: 0;
}

.form-buttons {
  text-align: right;
}

.status-text {
  margin-left: 8px;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

:deep(.el-alert) {
  margin: 0;
  padding: 8px 12px;
}

:deep(.el-alert__title) {
  font-size: 13px;
  line-height: 1.4;
}

:deep(.el-input-number .el-input__wrapper) {
  padding-left: 8px;
  padding-right: 8px;
}

:deep(.el-button [class*="el-icon"] + span) {
  margin-left: 4px;
}

.el-form-item__extra_tip {
  font-size: 12px;
  color: #909399; /* Element Plus 次要文字颜色 */
  line-height: 1.5;
  margin-top: 4px;
}

.ratio-warning-text {
  color: var(--el-color-warning); /* Element Plus 警告色 */
}

.price-range-container {
  display: flex;
  align-items: center;
}

.range-separator {
  margin: 0 8px;
  color: #909399;
}
</style> 