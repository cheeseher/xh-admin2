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
  userEmail: string;
  userRole: string;
  payMethod: string;
  deliveryMethod: string;
  status: string;
  remark?: string;
  createTime: string;
  refundInfo: RefundInfo | null;
}

export interface ProductOption {
  label: string;
  value: string;
  price: number;
}

export const orderList: Ref<OrderItem[]>;
export const productOptions: Ref<ProductOption[]>;

export function generateSampleOrders(count: number): OrderItem[]; 