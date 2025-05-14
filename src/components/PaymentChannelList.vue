<template>
  <div class="payment-channel-list">
    <!-- 工具栏 -->
    <div class="table-toolbar">
      <div class="left">
        <!-- 根据需求移除添加新通道按钮 -->
      </div>
      <div class="right">
        <el-alert
          v-if="enabledChannels.length > 0 && ratioSum !== 100"
          :title="`当前启用的通道总比例为 ${ratioSum}%，不等于100%，请调整。`"
          type="warning"
          show-icon
          class="ratio-warning"
        />
      </div>
    </div>

    <!-- 表格 -->
    <el-table 
      :data="channels" 
      border 
      stripe
      empty-text="暂无通道，请添加"
      style="width: 100%; margin-top: 16px;">
      <el-table-column prop="name" label="通道名称" min-width="180" />
      <el-table-column prop="ratio" label="送单比例 (%)" width="140" align="center" />
      <el-table-column prop="fee" label="手续费 (%)" width="140" align="center">
        <template #default="{ row }">
          {{ row.fee.toFixed(2) }}
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
          <el-button link type="primary" @click="handleEditChannel(row)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加/编辑通道弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEditMode ? '编辑支付通道' : '添加支付通道'"
      width="500px"
      append-to-body
    >
      <el-form :model="currentChannel" label-width="100px" ref="channelFormRef">
        <el-form-item
          label="通道名称"
          prop="name"
          required
          :rules="[{ required: true, message: '通道名称不能为空', trigger: 'blur' }]"
        >
          <el-input v-model="currentChannel.name" placeholder="例如: 老微信通道A (需与代码配置对应)" />
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
          label="送单比例"
          prop="ratio"
          required
          :rules="[
            { required: true, message: '送单比例不能为空', trigger: 'blur' },
            { type: 'number', min: 0, max: 100, message: '比例需在0-100之间', trigger: 'blur' }
          ]"
        >
          <el-input-number 
            v-model="currentChannel.ratio" 
            :min="0" 
            :max="100" 
            controls-position="right"
            @change="handleDialogRatioChange"
            style="width: 168px;" /> %
          <div class="form-tip" v-if="isEditMode && otherChannelName">
            自动调整"{{ otherChannelName }}"比例为 {{ 100 - currentChannel.ratio }}%
          </div>
        </el-form-item>
        <el-form-item
          label="手续费"
          prop="fee"
          required
          :rules="[
            { required: true, message: '手续费不能为空', trigger: 'blur' },
            { type: 'number', min: 0, max: 100, message: '比例需在0-100之间', trigger: 'blur' }
          ]"
        >
          <el-input-number 
            v-model="currentChannel.fee" 
            :min="0" 
            :max="100" 
            :precision="2"
            :step="0.1"
            size="small" 
            controls-position="right"
            @change="() => handleFeeChange(currentChannel)" /> %
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch
            v-model="currentChannel.status"
            active-value="enabled"
            inactive-value="disabled"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="form-buttons">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitChannelForm">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue';
import { ElMessage, type FormInstance } from 'element-plus';
import { usePaymentStore, type PaymentChannel } from '../stores/paymentStore';

const props = defineProps<{
  paymentMethodKey: 'wechat' | 'alipay' | 'usdt';
}>();

// 使用Pinia store
const paymentStore = usePaymentStore();

// 从store获取数据
const channels = computed(() => paymentStore.getChannelsByMethod(props.paymentMethodKey));

// 计算启用的通道
const enabledChannels = computed(() => {
  return channels.value.filter(channel => channel.status === 'enabled');
});

// 计算启用通道的比例总和
const ratioSum = computed(() => paymentStore.getEnabledRatioSumByMethod(props.paymentMethodKey));

// 添加/编辑通道相关状态
const dialogVisible = ref(false);
const isEditMode = ref(false);
const channelFormRef = ref<FormInstance>();

const initialChannelState = (): Omit<PaymentChannel, 'id'> => ({
  name: '',
  paymentMethodKey: props.paymentMethodKey,
  ratio: 0,
  status: 'enabled',
  fee: 0
});

const currentChannel = reactive<PaymentChannel & { id?: string }>({
  id: '',
  ...initialChannelState()
});

// 监听当前支付方式变化，重置表单中的paymentMethodKey
watch(() => props.paymentMethodKey, (newKey) => {
  currentChannel.paymentMethodKey = newKey;
});

// 重置表单
const resetForm = () => {
  isEditMode.value = false;
  Object.assign(currentChannel, { id: '', ...initialChannelState() });
  channelFormRef.value?.resetFields();
};

// 添加新通道
const handleAddChannel = () => {
  resetForm();
  isEditMode.value = false;
  currentChannel.paymentMethodKey = props.paymentMethodKey;
  dialogVisible.value = true;
};

// 编辑通道
const handleEditChannel = (channel: PaymentChannel) => {
  resetForm();
  isEditMode.value = true;
  Object.assign(currentChannel, JSON.parse(JSON.stringify(channel)));
  dialogVisible.value = true;
};

// 提交表单
const submitChannelForm = async () => {
  if (!channelFormRef.value) return;
  
  await channelFormRef.value.validate(async (valid) => {
    if (valid) {
      let success = false;
      
      // 获取同一支付类型下的其他通道
      const otherChannels = channels.value.filter(
        c => c.id !== currentChannel.id && c.paymentMethodKey === currentChannel.paymentMethodKey
      );
      
      // 先处理状态变化
      if (isEditMode.value && currentChannel.id) {
        // 获取编辑前的通道数据
        const originalChannel = channels.value.find(c => c.id === currentChannel.id);
        
        // 如果状态从禁用变为启用
        if (originalChannel && originalChannel.status === 'disabled' && currentChannel.status === 'enabled') {
          // 获取同一支付类型下的其他启用通道
          const otherEnabledChannels = otherChannels.filter(c => c.status === 'enabled');
          
          // 如果只有一个其他启用通道，调整比例分配为50/50
          if (otherEnabledChannels.length === 1) {
            const otherChannel = otherEnabledChannels[0];
            // 默认分配50%/50%
            currentChannel.ratio = 50;
            otherChannel.ratio = 50;
            await paymentStore.updateChannel(otherChannel);
          } 
          // 如果有多个其他启用通道，给当前通道分配0%
          else if (otherEnabledChannels.length > 1) {
            currentChannel.ratio = 0; // 初始设为0，提示用户手动调整
          }
          // 如果没有其他启用通道，设为100%
          else {
            currentChannel.ratio = 100;
          }
        }
        
        // 如果状态从启用变为禁用
        if (originalChannel && originalChannel.status === 'enabled' && currentChannel.status === 'disabled') {
          // 获取同一支付类型下的其他启用通道
          const otherEnabledChannels = otherChannels.filter(c => c.status === 'enabled');
          
          // 如果只有一个其他启用通道，将其比例设为100%
          if (otherEnabledChannels.length === 1) {
            const otherChannel = otherEnabledChannels[0];
            otherChannel.ratio = 100;
            await paymentStore.updateChannel(otherChannel);
          }
        }
        
        // 如果比例发生变化且状态为启用
        if (originalChannel && 
            originalChannel.ratio !== currentChannel.ratio && 
            currentChannel.status === 'enabled') {
          // 获取同一支付类型下的其他启用通道
          const otherEnabledChannels = otherChannels.filter(c => c.status === 'enabled');
          
          // 如果只有一个其他启用通道，自动调整其比例
          if (otherEnabledChannels.length === 1) {
            const otherChannel = otherEnabledChannels[0];
            otherChannel.ratio = 100 - currentChannel.ratio;
            await paymentStore.updateChannel(otherChannel);
          }
        }
        
        // 更新当前通道
        success = paymentStore.updateChannel(currentChannel as PaymentChannel);
      } else {
        // 添加通道 - 这种情况应该已经被移除了，因为我们不允许添加新通道
        const { id, ...newChannelData } = currentChannel;
        success = paymentStore.addChannel(newChannelData);
      }
      
      if (success) {
        ElMessage.success('通道更新成功');
        dialogVisible.value = false;
      } else {
        ElMessage.error('操作失败，请检查输入');
      }
    }
  });
};

// 删除通道
const handleDeleteChannel = (channelId: string) => {
  paymentStore.deleteChannel(channelId);
  ElMessage.success('通道删除成功');
};

// 修改比例
const handleRatioChange = (channel: PaymentChannel) => {
  // 确保比例在0-100之间
  if (channel.ratio < 0) channel.ratio = 0;
  if (channel.ratio > 100) channel.ratio = 100;
  
  // 获取同一支付类型下的其他启用通道
  const otherEnabledChannels = channels.value.filter(
    c => c.id !== channel.id && c.status === 'enabled'
  );
  
  // 如果只有一个其他启用通道，则直接调整其比例
  if (otherEnabledChannels.length === 1) {
    const otherChannel = otherEnabledChannels[0];
    otherChannel.ratio = 100 - channel.ratio;
    // 更新这个通道
    paymentStore.updateChannel(otherChannel);
  }
  // 如果有多个其他启用通道，暂不自动调整，让用户手动调整
  // 这里可以扩展为按比例分配剩余百分比的功能
  
  // 更新当前通道
  paymentStore.updateChannel(channel);
};

// 修改手续费
const handleFeeChange = (channel: PaymentChannel) => {
  // 确保手续费在0-100之间
  if (channel.fee < 0) channel.fee = 0;
  if (channel.fee > 100) channel.fee = 100;
  
  // 调用store的action更新通道
  paymentStore.updateChannel(channel);
};

// 修改状态
const handleStatusChange = (channel: PaymentChannel) => {
  // 如果通道被启用
  if (channel.status === 'enabled') {
    // 获取同一支付类型下的其他启用通道
    const otherEnabledChannels = channels.value.filter(
      c => c.id !== channel.id && c.status === 'enabled'
    );
    
    // 如果只有一个其他启用通道，调整比例分配
    if (otherEnabledChannels.length === 1) {
      const otherChannel = otherEnabledChannels[0];
      // 默认分配50%/50%
      channel.ratio = 50;
      otherChannel.ratio = 50;
      paymentStore.updateChannel(otherChannel);
    } 
    // 如果有多个其他启用通道，给新启用的通道分配一个默认值
    else if (otherEnabledChannels.length > 1) {
      channel.ratio = 0; // 初始设为0，提示用户手动调整
    }
    // 如果没有其他启用通道，设为100%
    else {
      channel.ratio = 100;
    }
  }
  
  // 如果通道被禁用且只有一个其他启用通道，将其他通道设为100%
  if (channel.status === 'disabled') {
    const otherEnabledChannels = channels.value.filter(
      c => c.id !== channel.id && c.status === 'enabled'
    );
    
    if (otherEnabledChannels.length === 1) {
      const otherChannel = otherEnabledChannels[0];
      otherChannel.ratio = 100;
      paymentStore.updateChannel(otherChannel);
    }
  }
  
  // 调用store的action更新通道
  paymentStore.updateChannel(channel);
};

// 处理对话框中的比例变化
const handleDialogRatioChange = () => {
  // 确保比例在0-100之间
  if (currentChannel.ratio < 0) currentChannel.ratio = 0;
  if (currentChannel.ratio > 100) currentChannel.ratio = 100;
  
  // 其他通道的比例将在提交表单时调整
  // 这里只是为了在UI上显示预览效果
};

// 获取其他启用通道的名称
const otherChannelName = computed(() => {
  const otherChannels = channels.value.filter(c => c.id !== currentChannel.id && c.status === 'enabled');
  return otherChannels.length > 0 ? otherChannels[0].name : '';
});
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

.form-tip {
  font-size: 0.8em;
  color: #909399;
  margin-top: 5px;
}
</style> 