import { ref } from 'vue'

// 各类账号商品销售数据
export const accountProducts = ref([
  {
    name: 'Telegram',
    payUsers: 16,
    avgConsumption: 18.29,
    paymentAmount: 292.63,
    refundAmount: 0,
    netIncome: 292.63,
    totalRevenue: 574.22
  },
  {
    name: 'Ins',
    payUsers: 4,
    avgConsumption: 15.9,
    paymentAmount: 63.6,
    refundAmount: 0,
    netIncome: 63.6,
    totalRevenue: 139.52
  },
  {
    name: 'TikTok',
    payUsers: 3,
    avgConsumption: 24.88,
    paymentAmount: 75,
    refundAmount: 0.36,
    netIncome: 74.64,
    totalRevenue: 123.72
  },
  {
    name: 'Facebook',
    payUsers: 0,
    avgConsumption: 0,
    paymentAmount: 0,
    refundAmount: 0,
    netIncome: 0,
    totalRevenue: 0
  },
  {
    name: '平板ID',
    payUsers: 1,
    avgConsumption: 19.98,
    paymentAmount: 19.98,
    refundAmount: 0,
    netIncome: 19.98,
    totalRevenue: 19.98
  },
  {
    name: '谷歌软件账号',
    payUsers: 2,
    avgConsumption: 16.68,
    paymentAmount: 16.68,
    refundAmount: 0,
    netIncome: 16.68,
    totalRevenue: 33.36
  },
  {
    name: '定制账号',
    payUsers: 2,
    avgConsumption: 9.73,
    paymentAmount: 19.46,
    refundAmount: 0,
    netIncome: 19.46,
    totalRevenue: 59.38
  }
])

// 每日核心指标数据
export const dailyMetrics = ref({
  today: {
    payUserCount: 181,
    paymentAmount: 3464,
    refundAmount: 33,
    netIncome: 3430.21,
    avgConsumption: 19.14,
    monthlyAccumulatedRevenue: 6407.34,
    rechargeUserCount: 35,
    rechargeOrderCount: 42,
    rechargeAmount: 1258.50,
    newUserCount: 68
  },
  yesterday: {
    payUserCount: 165,
    paymentAmount: 3125,
    refundAmount: 28,
    netIncome: 3097,
    avgConsumption: 18.94,
    monthlyAccumulatedRevenue: 5850.50,
    rechargeUserCount: 28,
    rechargeOrderCount: 36,
    rechargeAmount: 1085.20,
    newUserCount: 52
  }
})

// 月度累计数据
export const monthlyData = ref({
  payUserCount: 358,
  totalPaymentAmount: 6474.06,
  totalRefundAmount: 67,
  accountEarningsAmount: 0,
  totalNetRevenue: 6407.34,
  rechargeUserCount: 124,
  rechargeOrderCount: 156,
  rechargeAmount: 4328.75,
  newUserCount: 238,
  thisMonth: {
    netRevenue: 6407.34,
    payUserCount: 358,
    paymentAmount: 6474.06,
    refundAmount: 67,
    rechargeUserCount: 124,
    rechargeOrderCount: 156,
    rechargeAmount: 4328.75,
    newUserCount: 238
  },
  lastMonth: {
    netRevenue: 5238.76,
    payUserCount: 312,
    paymentAmount: 5320.45,
    refundAmount: 81.69,
    rechargeUserCount: 108,
    rechargeOrderCount: 132,
    rechargeAmount: 3865.40,
    newUserCount: 196
  },
  total: {
    netRevenue: 42680.82,
    payUserCount: 2345,
    paymentAmount: 43125.60,
    refundAmount: 444.78,
    rechargeUserCount: 876,
    rechargeOrderCount: 1053,
    rechargeAmount: 31285.95,
    newUserCount: 3256
  }
})

// 获取各统计维度的总计数据
export const getAccountProductsTotals = () => {
  const totals = {
    payUsers: 0,
    avgConsumption: 0,
    paymentAmount: 0,
    refundAmount: 0,
    netIncome: 0,
    totalRevenue: 0
  }

  accountProducts.value.forEach(product => {
    totals.payUsers += product.payUsers
    totals.paymentAmount += product.paymentAmount
    totals.refundAmount += product.refundAmount
    totals.netIncome += product.netIncome
    totals.totalRevenue += product.totalRevenue
  })

  // 计算平均消费金额
  if (totals.payUsers > 0) {
    totals.avgConsumption = Number((totals.paymentAmount / totals.payUsers).toFixed(2))
  }

  return totals
} 