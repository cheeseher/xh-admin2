import { defineStore } from 'pinia';

export interface PaymentChannel {
  id: string;
  name: string; // 通道名称，例如 "老微信通道", "SpeedZF-支付宝H5"
  paymentMethodKey: 'wechat' | 'alipay' | 'usdt'; // 该通道属于哪种支付方式
  ratio: number; // 送单权重 (例如: 1, 2, 3等整数，代表相对比例)
  status: 'enabled' | 'disabled';
  fee: number; // 手续费率 (%)
}

interface PaymentState {
  channels: PaymentChannel[];
  waitingTime: number; // 支付等待时间（分钟）
}

// 初始演示数据 - ratio 现在代表权重
const initialChannels: PaymentChannel[] = [
  // 微信支付 - 3个通道
  { id: 'wc1', name: '老微信通道', paymentMethodKey: 'wechat', ratio: 3, status: 'enabled', fee: 5.0 },
  { id: 'wc2', name: '新微信通道', paymentMethodKey: 'wechat', ratio: 3, status: 'enabled', fee: 4.0 },
  { id: 'wc3', name: '微信通道 3', paymentMethodKey: 'wechat', ratio: 3, status: 'disabled', fee: 4.0 }, // 初始禁用一个作为测试
  
  // 支付宝支付 - 2个通道
  { id: 'ali1', name: '老支付宝通道', paymentMethodKey: 'alipay', ratio: 6, status: 'enabled', fee: 5.0 },
  { id: 'ali2', name: '新支付宝通道', paymentMethodKey: 'alipay', ratio: 4, status: 'enabled', fee: 4.0 },
  
  // USDT支付 - 1个通道
  { id: 'usdt1', name: 'USDT通道', paymentMethodKey: 'usdt', ratio: 1, status: 'enabled', fee: 5.0 },
];
const DEFAULT_WAITING_TIME = 1; // 默认1分钟

export const usePaymentStore = defineStore('payment', {
  state: (): PaymentState => ({
    channels: initialChannels,
    waitingTime: DEFAULT_WAITING_TIME,
  }),
  
  getters: {
    // 获取特定支付方式的通道列表（包含根据权重计算的实际送单百分比）
    getChannelsByMethodWithActualRatio(state) {
      return (methodKey: 'wechat' | 'alipay' | 'usdt') => {
        const methodChannels = state.channels.filter(channel => channel.paymentMethodKey === methodKey);
        const enabledChannels = methodChannels.filter(channel => channel.status === 'enabled' && channel.ratio > 0);
        const totalEnabledWeight = enabledChannels.reduce((sum, channel) => sum + channel.ratio, 0);

        return methodChannels.map(channel => {
          let actualRatio = 0;
          if (channel.status === 'enabled' && channel.ratio > 0 && totalEnabledWeight > 0) {
            actualRatio = (channel.ratio / totalEnabledWeight) * 100;
          } else if (channel.status === 'enabled' && totalEnabledWeight === 0 && enabledChannels.length === 1 && channel.id === enabledChannels[0].id) {
            // 如果只有一个启用通道且其权重为0，特殊处理为100% (或根据产品需求定义)
            // 或者，如果我们严格要求启用的通道权重必须>0, 这种情况可以不特殊处理，其actualRatio仍为0
            // 这里暂时保持，如果启用通道权重>0, 则参与计算。权重为0的启用通道实际比例也是0.
            // 如果只有一个启用通道，且其权重 > 0, totalEnabledWeight 就是它自己的权重， (w/w)*100 = 100%
          }
          return {
            ...channel,
            actualRatio: parseFloat(actualRatio.toFixed(2)) // 保留两位小数
          };
        });
      };
    },
    
    // 计算指定支付方式下所有启用通道的理论总比例（在权重模式下，如果有效则总是100%）
    getEnabledRatioSumByMethod(state) { // 这个getter的含义在权重模式下有所变化
      return (methodKey: 'wechat' | 'alipay' | 'usdt') => {
        const enabledChannels = state.channels.filter(
          channel => channel.paymentMethodKey === methodKey && channel.status === 'enabled' && channel.ratio > 0
        );
        return enabledChannels.length > 0 ? 100 : 0;
      };
    },
    getWaitingTime(state) {
      return state.waitingTime;
    }
  },
  
  actions: {
    // 添加新通道 (传入的ratio是权重)
    addChannel(channelData: Omit<PaymentChannel, 'id'>) {
      if (!channelData.name.trim()) {
        console.error('通道名称不能为空');
        return false;
      }
      // 权重应该大于等于0，但建议大于0才有意义
      if (channelData.ratio < 0) {
        console.error('权重不能为负数');
        return false;
      }
      
      const newChannel: PaymentChannel = {
        ...channelData,
        id: Date.now().toString(), // 使用时间戳作为唯一ID
      };
      
      this.channels.push(newChannel);
      return true;
    },
    
    // 更新通道 (传入的updatedChannel.ratio是权重)
    updateChannel(updatedChannel: PaymentChannel) {
      if (!updatedChannel.name.trim()) {
        console.error('通道名称不能为空');
        return false;
      }
      // 权重应该大于等于0
      if (updatedChannel.ratio < 0) {
        console.error('权重不能为负数');
        return false;
      }
      
      const index = this.channels.findIndex(channel => channel.id === updatedChannel.id);
      if (index !== -1) {
        this.channels[index] = { ...updatedChannel };
        return true;
      }
      console.error('未找到要更新的通道:', updatedChannel.id);
      return false;
    },
    
    // 删除通道
    deleteChannel(channelId: string) {
      this.channels = this.channels.filter(channel => channel.id !== channelId);
    },
    setWaitingTime(newTime: number) {
      if (typeof newTime === 'number' && newTime > 0 && newTime <= 60) {
        this.waitingTime = newTime;
        return true;
      } else {
        console.error('支付等待时间需为1-60分钟之间的整数');
        return false;
      }
    },
  },
}); 