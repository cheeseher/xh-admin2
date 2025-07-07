import { Ref } from 'vue';

export interface RefundInfo {
  refundAmount: number;
  refundRemark: string;
  refundTime: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productName: string;
  category: string;
  quantity: number;
  originalPrice: string;
  purchasePrice: string;
  totalPrice: string;
  fee: string;
  cardId?: string;
  cardInfo?: string;
  status: string;
  userNickname: string;
  userEmail: string;
  userRole: string;
  payMethod: string;
  payChannel: string;
  channelName: string;
  deliveryMethod: string;
  createTime: string;
  completionTime?: string;
  costPrice?: number;
  remark?: string;
  refundInfo?: RefundInfo;
  hasEmail?: boolean;
  multipleCardInfo?: Array<{
    cardId?: string;
    cardInfo?: string;
    selectedCardId?: string;
    newCardInfo?: string;
    costPrice?: number;
  }>;
}

export interface ProductOption {
  label: string;
  value: string;
  price: number;
}

export const orderList: Ref<OrderItem[]>;
export const productOptions: Ref<ProductOption[]>;

export function generateSampleOrders(count: number): OrderItem[]; 