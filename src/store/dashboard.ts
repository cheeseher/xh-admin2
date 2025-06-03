import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useDashboardStore = defineStore('dashboard', () => {
  // 总销售额
  const totalSales = ref(126560)
  const todaySales = ref(5680)
  const yesterdaySales = ref(4890)
  
  // 订单数量
  const orderCount = ref(1280)
  // 商品订单数量
  const productOrderCount = ref(820)
  // 充值订单数量
  const rechargeOrderCount = ref(460)
  
  // 用户数量
  const userCount = ref(8846)
  // 支付笔数
  const paymentCount = ref(1568)
  const todayPaymentCount = ref(86)
  const yesterdayPaymentCount = ref(72)
  
  // 总退款金额
  const totalRefunds = ref(12350)
  const todayRefunds = ref(580)
  const yesterdayRefunds = ref(420)
  
  // 总手续费
  const totalFees = ref(3560)
  const todayFees = ref(260)
  const yesterdayFees = ref(210)
  
  // 计算预收入金额（总销售额减去总退款减去总手续费）
  const netRevenue = computed(() => {
    return totalSales.value - totalRefunds.value - totalFees.value
  })
  
  const todayNetRevenue = computed(() => {
    return todaySales.value - todayRefunds.value - todayFees.value
  })
  
  const yesterdayNetRevenue = computed(() => {
    return yesterdaySales.value - yesterdayRefunds.value - yesterdayFees.value
  })
  
  // 模拟获取数据的方法
  const fetchDashboardData = () => {
    // 在实际项目中，这里会调用API获取数据
    console.log('获取仪表盘数据')
    // 这里只是模拟，实际项目中会从API获取数据并更新上面的状态
    
    // 模拟获取库存预警和补货提醒数据
    fetchInventoryAlerts()
    fetchRestockRequests()
  }
  
  // 获取库存预警数据
  const fetchInventoryAlerts = () => {
    // 实际项目中，这里会调用API获取库存预警数据
    console.log('获取库存预警数据')
    // 这里只是模拟，实际项目中会从API获取数据并更新状态
  }
  
  // 获取补货提醒数据
  const fetchRestockRequests = () => {
    // 实际项目中，这里会调用API获取补货提醒数据
    console.log('获取补货提醒数据')
    // 这里只是模拟，实际项目中会从API获取数据并更新状态
  }
  
  return {
    totalSales,
    todaySales,
    yesterdaySales,
    orderCount,
    productOrderCount,
    rechargeOrderCount,
    userCount,
    paymentCount,
    todayPaymentCount,
    yesterdayPaymentCount,
    totalRefunds,
    todayRefunds,
    yesterdayRefunds,
    totalFees,
    todayFees,
    yesterdayFees,
    netRevenue,
    todayNetRevenue,
    yesterdayNetRevenue,
    fetchDashboardData,
    fetchInventoryAlerts,
    fetchRestockRequests
  }
}) 