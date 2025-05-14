import { defineStore } from 'pinia';

export interface PaymentChannel {
  id: string;
  name: string; // 通道名称，例如 "老微信通道", "SpeedZF-支付宝H5"
  paymentMethodKey: 'wechat' | 'alipay' | 'usdt'; // 该通道属于哪种支付方式
  ratio: number; // 送单比例 (0-100)
  status: 'enabled' | 'disabled';
  fee: number; // 手续费率 (%)
}

interface PaymentState {
  channels: PaymentChannel[];
}

// 初始演示数据
const initialChannels: PaymentChannel[] = [
  // 微信支付 - 2个通道
  { id: 'wc1', name: '老微信通道', paymentMethodKey: 'wechat', ratio: 70, status: 'enabled', fee: 5.0 },
  { id: 'wc2', name: '新微信通道', paymentMethodKey: 'wechat', ratio: 30, status: 'enabled', fee: 4.0 },
  
  // 支付宝支付 - 2个通道
  { id: 'ali1', name: '老支付宝通道', paymentMethodKey: 'alipay', ratio: 60, status: 'enabled', fee: 5.0 },
  { id: 'ali2', name: '新支付宝通道', paymentMethodKey: 'alipay', ratio: 40, status: 'enabled', fee: 4.0 },
  
  // USDT支付 - 1个通道
  { id: 'usdt1', name: 'USDT通道', paymentMethodKey: 'usdt', ratio: 100, status: 'enabled', fee: 5.0 },
];

export const usePaymentStore = defineStore('payment', {
  state: (): PaymentState => ({
    channels: initialChannels,
  }),
  
  getters: {
    // 获取特定支付方式的通道列表
    getChannelsByMethod: (state) => {
      return (methodKey: 'wechat' | 'alipay' | 'usdt') => {
        return state.channels.filter(channel => channel.paymentMethodKey === methodKey);
      };
    },
    
    // 计算指定支付方式下所有启用通道的比例总和
    getEnabledRatioSumByMethod: (state) => {
      return (methodKey: 'wechat' | 'alipay' | 'usdt') => {
        return state.channels
          .filter(channel => channel.paymentMethodKey === methodKey && channel.status === 'enabled')
          .reduce((sum, channel) => sum + channel.ratio, 0);
      };
    }
  },
  
  actions: {
    // 添加新通道
    addChannel(channelData: Omit<PaymentChannel, 'id'>) {
      if (!channelData.name.trim()) {
        return false;
      }
      
      if (channelData.ratio < 0 || channelData.ratio > 100) {
        return false;
      }
      
      const newChannel: PaymentChannel = {
        ...channelData,
        id: Date.now().toString(), // 使用时间戳作为唯一ID
      };
      
      this.channels.push(newChannel);
      return true;
    },
    
    // 更新通道
    updateChannel(updatedChannel: PaymentChannel) {
      if (!updatedChannel.name.trim()) {
        return false;
      }
      
      if (updatedChannel.ratio < 0 || updatedChannel.ratio > 100) {
        return false;
      }
      
      const index = this.channels.findIndex(channel => channel.id === updatedChannel.id);
      if (index !== -1) {
        this.channels[index] = { ...updatedChannel };
        return true;
      }
      return false;
    },
    
    // 删除通道
    deleteChannel(channelId: string) {
      this.channels = this.channels.filter(channel => channel.id !== channelId);
    },
  },
}); 