import { Ref } from 'vue'

export interface AccountProduct {
  name: string
  payUsers: number
  avgConsumption: number
  paymentAmount: number
  refundAmount: number
  netIncome: number
  totalRevenue: number
}

export interface MetricsData {
  payUserCount: number
  paymentAmount: number
  refundAmount: number
  netIncome: number
  avgConsumption: number
  monthlyAccumulatedRevenue: number
  rechargeUserCount: number
  rechargeOrderCount: number
  rechargeAmount: number
  newUserCount: number
}

export interface DailyMetrics {
  today: MetricsData
  yesterday: MetricsData
}

export interface MonthlyDataDetails {
  netRevenue: number
  payUserCount: number
  paymentAmount: number
  refundAmount: number
  rechargeUserCount: number
  rechargeOrderCount: number
  rechargeAmount: number
  newUserCount: number
}

export interface MonthlyData {
  payUserCount: number
  totalPaymentAmount: number
  totalRefundAmount: number
  accountEarningsAmount: number
  totalNetRevenue: number
  rechargeUserCount: number
  rechargeOrderCount: number
  rechargeAmount: number
  newUserCount: number
  thisMonth: MonthlyDataDetails
  lastMonth: MonthlyDataDetails
  total: MonthlyDataDetails
}

export interface AccountProductsTotals {
  payUsers: number
  avgConsumption: number
  paymentAmount: number
  refundAmount: number
  netIncome: number
  totalRevenue: number
}

declare const accountProducts: Ref<AccountProduct[]>
declare const dailyMetrics: Ref<DailyMetrics>
declare const monthlyData: Ref<MonthlyData>
declare const getAccountProductsTotals: () => AccountProductsTotals

export { accountProducts, dailyMetrics, monthlyData, getAccountProductsTotals } 