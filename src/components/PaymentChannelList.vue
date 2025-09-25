<template>
  <div class="payment-channel-list">
    <!-- 工具栏 -->
    <div class="table-toolbar">
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
      <el-table-column prop="name" label="通道名称" width="180" />
      <el-table-column prop="merchantId" label="商户号" width="120" align="center" />
      <el-table-column prop="merchantKey" label="商户密钥" width="200" align="center">
          <template #default="{ row }">
            {{ row.merchantKey.substring(0, 8) }}****
          </template>
        </el-table-column>
        
        <el-table-column label="支付方式" width="300" align="center">
          <template #default="{ row }">
            <div class="payment-methods">
              <el-tag 
                v-if="row.supportedPaymentTypes.wechat" 
                type="success" 
                size="small" 
                class="payment-tag"
              >
                微信支付 | {{ row.wechatConfig.rate }}% | {{ row.wechatConfig.weight }} | {{ row.wechatConfig.minAmount }}～{{ row.wechatConfig.maxAmount }}
              </el-tag>
              <el-tag 
                v-if="row.supportedPaymentTypes.alipay" 
                type="primary" 
                size="small" 
                class="payment-tag"
              >
                支付宝 | {{ row.alipayConfig.rate }}% | {{ row.alipayConfig.weight }} | {{ row.alipayConfig.minAmount }}～{{ row.alipayConfig.maxAmount }}
              </el-tag>
              <el-tag 
                v-if="row.supportedPaymentTypes.usdt" 
                type="warning" 
                size="small" 
                class="payment-tag"
              >
                USDT | {{ row.usdtConfig.rate }}% | {{ row.usdtConfig.weight }} | {{ row.usdtConfig.minAmount }}～{{ row.usdtConfig.maxAmount }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
 
        <el-table-column prop="status" label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 'enabled' ? 'success' : 'danger'">
            {{ row.status === 'enabled' ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right" align="center">
        <template #default="{ row }">
          <el-button link type="primary" @click="handleEditChannel(row)">
            编辑
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加/编辑通道弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="'编辑支付通道'" 
      width="600px"
      append-to-body
      destroy-on-close 
    >
      <el-form :model="currentChannel" label-width="120px" ref="channelFormRef">
        <!-- 基础配置区域 -->
        <div class="config-section">
          <div class="section-title">基础配置</div>
          
          <el-form-item
            label="通道名称"
            prop="name"
            required
            :rules="[{ required: true, message: '通道名称不能为空', trigger: 'blur' }]"
          >
            <el-input v-model="currentChannel.name" placeholder="例如: 老微信通道A" />
          </el-form-item>
          
          <el-form-item
            label="商户号"
            prop="merchantId"
            required
            :rules="[{ required: true, message: '商户号不能为空', trigger: 'blur' }]"
          >
            <el-input v-model="currentChannel.merchantId" placeholder="请输入商户号" />
          </el-form-item>
          
          <el-form-item
            label="商户密钥"
            prop="merchantKey"
            required
            :rules="[{ required: true, message: '商户密钥不能为空', trigger: 'blur' }]"
          >
            <el-input v-model="currentChannel.merchantKey" placeholder="请输入商户密钥" type="password" show-password />
          </el-form-item>
        </div>

        <!-- 支付类型配置区域 -->
        <div class="config-section">
          <div class="section-title">支付类型配置</div>
          
          <el-form-item label="微信支付">
            <el-switch 
              v-model="currentChannel.supportedPaymentTypes.wechat"
              active-text="启用"
              inactive-text="禁用"
            />
          </el-form-item>
          
          <!-- 微信支付配置 -->
          <div v-if="currentChannel.supportedPaymentTypes.wechat" class="wechat-config">
            <el-form-item
              label="产品编码"
              prop="wechatConfig.productCode"
              :rules="currentChannel.supportedPaymentTypes.wechat ? [{ required: true, message: '产品编码不能为空', trigger: 'blur' }] : []"
            >
              <el-input v-model="currentChannel.wechatConfig.productCode" placeholder="请输入微信支付产品编码" />
            </el-form-item>
            
            <el-form-item
              label="送单权重"
              prop="wechatConfig.weight"
              :rules="currentChannel.supportedPaymentTypes.wechat ? [{ required: true, message: '送单权重不能为空', trigger: 'blur' }] : []"
            >
              <el-input-number 
                v-model="currentChannel.wechatConfig.weight" 
                :min="0" 
                :max="100" 
                controls-position="right"
                style="width: 200px;" 
              />
            </el-form-item>
            
            <el-form-item
              label="费率"
              prop="wechatConfig.rate"
              :rules="currentChannel.supportedPaymentTypes.wechat ? [{ required: true, message: '费率不能为空', trigger: 'blur' }] : []"
            >
              <el-input-number 
                v-model="currentChannel.wechatConfig.rate" 
                :min="0" 
                :max="100" 
                :precision="2"
                :step="0.01"
                controls-position="right"
                style="width: 200px;" 
              /> %
            </el-form-item>
            
            <el-form-item
              label="单笔限额"
              required
            >
              <div class="price-range-container">
                <el-input-number 
                  v-model="currentChannel.wechatConfig.minAmount" 
                  :min="0" 
                  :max="currentChannel.wechatConfig.maxAmount || 999999"
                  :step="10"
                  controls-position="right"
                  placeholder="最低限额"
                  style="width: 168px;" />
                <span class="range-separator">至</span>
                <el-input-number 
                  v-model="currentChannel.wechatConfig.maxAmount" 
                  :min="currentChannel.wechatConfig.minAmount || 0" 
                  :step="100"
                  controls-position="right"
                  placeholder="最高限额"
                  style="width: 168px;" />
              </div>
            </el-form-item>
          </div>
          
          <el-form-item label="支付宝">
            <el-switch 
              v-model="currentChannel.supportedPaymentTypes.alipay"
              active-text="启用"
              inactive-text="禁用"
            />
          </el-form-item>
          
          <!-- 支付宝配置 -->
          <div v-if="currentChannel.supportedPaymentTypes.alipay" class="alipay-config">
            <el-form-item
              label="产品编码"
              prop="alipayConfig.productCode"
              :rules="currentChannel.supportedPaymentTypes.alipay ? [{ required: true, message: '产品编码不能为空', trigger: 'blur' }] : []"
            >
              <el-input v-model="currentChannel.alipayConfig.productCode" placeholder="请输入支付宝产品编码" />
            </el-form-item>
            
            <el-form-item
              label="送单权重"
              prop="alipayConfig.weight"
              :rules="currentChannel.supportedPaymentTypes.alipay ? [{ required: true, message: '送单权重不能为空', trigger: 'blur' }] : []"
            >
              <el-input-number 
                v-model="currentChannel.alipayConfig.weight" 
                :min="0" 
                :max="100" 
                controls-position="right"
                style="width: 200px;" 
              />
            </el-form-item>
            
            <el-form-item
              label="费率"
              prop="alipayConfig.rate"
              :rules="currentChannel.supportedPaymentTypes.alipay ? [{ required: true, message: '费率不能为空', trigger: 'blur' }] : []"
            >
              <el-input-number 
                v-model="currentChannel.alipayConfig.rate" 
                :min="0" 
                :max="100" 
                :precision="2"
                :step="0.01"
                controls-position="right"
                style="width: 200px;" 
              /> %
            </el-form-item>
            
            <el-form-item
              label="单笔限额"
              required
            >
              <div class="price-range-container">
                <el-input-number 
                  v-model="currentChannel.alipayConfig.minAmount" 
                  :min="0" 
                  :max="currentChannel.alipayConfig.maxAmount || 999999"
                  :step="10"
                  controls-position="right"
                  placeholder="最低限额"
                  style="width: 168px;" />
                <span class="range-separator">至</span>
                <el-input-number 
                  v-model="currentChannel.alipayConfig.maxAmount" 
                  :min="currentChannel.alipayConfig.minAmount || 0" 
                  :step="100"
                  controls-position="right"
                  placeholder="最高限额"
                  style="width: 168px;" />
              </div>
            </el-form-item>
          </div>
          
          <el-form-item label="USDT">
            <el-switch 
              v-model="currentChannel.supportedPaymentTypes.usdt"
              active-text="启用"
              inactive-text="禁用"
            />
          </el-form-item>
          
          <!-- USDT配置 -->
          <div v-if="currentChannel.supportedPaymentTypes.usdt" class="usdt-config">
            <el-form-item
              label="产品编码"
              prop="usdtConfig.productCode"
              :rules="currentChannel.supportedPaymentTypes.usdt ? [{ required: true, message: '产品编码不能为空', trigger: 'blur' }] : []"
            >
              <el-input v-model="currentChannel.usdtConfig.productCode" placeholder="请输入USDT产品编码" />
            </el-form-item>
            
            <el-form-item
              label="送单权重"
              prop="usdtConfig.weight"
              :rules="currentChannel.supportedPaymentTypes.usdt ? [{ required: true, message: '送单权重不能为空', trigger: 'blur' }] : []"
            >
              <el-input-number 
                v-model="currentChannel.usdtConfig.weight" 
                :min="0" 
                :max="100" 
                controls-position="right"
                style="width: 200px;" 
              />
            </el-form-item>
            
            <el-form-item
              label="费率"
              prop="usdtConfig.rate"
              :rules="currentChannel.supportedPaymentTypes.usdt ? [{ required: true, message: '费率不能为空', trigger: 'blur' }] : []"
            >
              <el-input-number 
                v-model="currentChannel.usdtConfig.rate" 
                :min="0" 
                :max="100" 
                :precision="2"
                :step="0.01"
                controls-position="right"
                style="width: 200px;" 
              /> %
            </el-form-item>
            
            <el-form-item
              label="单笔限额"
              required
            >
              <div class="price-range-container">
                <el-input-number 
                  v-model="currentChannel.usdtConfig.minAmount" 
                  :min="0" 
                  :max="currentChannel.usdtConfig.maxAmount || 999999"
                  :step="10"
                  controls-position="right"
                  placeholder="最低限额"
                  style="width: 168px;" />
                <span class="range-separator">至</span>
                <el-input-number 
                  v-model="currentChannel.usdtConfig.maxAmount" 
                  :min="currentChannel.usdtConfig.minAmount || 0" 
                  :step="100"
                  controls-position="right"
                  placeholder="最高限额"
                  style="width: 168px;" />
              </div>
            </el-form-item>
          </div>
        </div>
        
        <el-divider content-position="left">状态配置</el-divider>
        <div class="status-config">
          <el-form-item label="状态" prop="status">
            <el-switch
              v-model="currentChannel.status"
              active-value="enabled"
              inactive-value="disabled"
              @change="handleStatusSwitchInDialog"
            />
            <span class="status-text">{{ currentChannel.status === 'enabled' ? '启用' : '禁用' }}</span>
          </el-form-item>
        </div>
 
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

const paymentStore = usePaymentStore();
const channelFormRef = ref<FormInstance>();
const dialogVisible = ref(false);
const submitLoading = ref(false);

const channelsWithActualRatio = computed(() => 
  paymentStore.channels
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
  merchantId: '',
  merchantKey: '',
  paymentMethodKey: 'wechat', // 默认为微信支付
  ratio: 1,
  status: 'enabled',
  fee: 0,
  minAmount: 100,
  maxAmount: 10000,
  id: undefined, // 确保 id 初始为 undefined
  supportedPaymentTypes: {
    wechat: false,
    alipay: false,
    usdt: false
  },
  wechatConfig: {
    productCode: '',
    weight: 0,
    rate: 0,
    minAmount: 0,
    maxAmount: 0
  },
  alipayConfig: {
    productCode: '',
    weight: 0,
    rate: 0,
    minAmount: 0,
    maxAmount: 0
  },
  usdtConfig: {
    productCode: '',
    weight: 0,
    rate: 0,
    minAmount: 0,
    maxAmount: 0
  }
});

const currentChannel = reactive<CurrentChannelState>(initialChannelState());

// 移除了props相关的watch，因为不再需要从父组件接收paymentMethodKey

const resetForm = () => {
  const freshState = initialChannelState();
  Object.assign(currentChannel, freshState);
  
  nextTick(() => {
    channelFormRef.value?.clearValidate();
  });
};

const handleEditChannel = (channel: PaymentChannel & { actualRatio?: number }) => {
  // 使用深拷贝确保原始 channel 数据不受影响，并且 currentChannel 是响应式的
  const channelToEdit = JSON.parse(JSON.stringify(channel)); 
  Object.assign(currentChannel, initialChannelState(), channelToEdit); // 先用初始状态重置，再用编辑数据覆盖

  dialogVisible.value = true;
  nextTick(() => {
    channelFormRef.value?.clearValidate();
  });
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
      // 在原型演示中，我们直接修改 store 中的数据
      success = paymentStore.updateChannel(currentChannel as PaymentChannel);
    } else {
      // 添加逻辑已移除，此分支不应执行
      ElMessage.error('原型不支持添加新通道。'); 
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

.config-section {
  margin-bottom: 20px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 6px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e4e7ed;
}

.payment-methods {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
}

.payment-tag {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
  max-width: 280px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.payment-type-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.payment-type-item .el-switch {
  margin-right: 8px;
}

.payment-type-label {
  font-size: 14px;
  color: #606266;
  min-width: 80px;
}

.alipay-config, .wechat-config, .usdt-config {
  margin-left: 20px;
  padding: 12px;
  background-color: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  margin-top: 8px;
}

.status-config {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;
}

.alipay-config-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.alipay-config-item:last-child {
  margin-bottom: 0;
}

.alipay-config-label {
  font-size: 13px;
  color: #909399;
  min-width: 70px;
  margin-right: 8px;
}
</style>