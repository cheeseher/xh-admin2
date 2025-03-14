import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useDashboardStore = defineStore('dashboard', () => {
  // 总销售额
  const totalSales = ref(126560)
  // 订单数量
  const orderCount = ref(1280)
  // 用户数量
  const userCount = ref(8846)
  // 支付笔数
  const paymentCount = ref(1568)
  
  // 销售趋势数据
  const salesTrend = ref([
    { date: '周一', value: 3000 },
    { date: '周二', value: 4500 },
    { date: '周三', value: 6000 },
    { date: '周四', value: 4000 },
    { date: '周五', value: 5500 },
    { date: '周六', value: 6800 },
    { date: '周日', value: 7500 }
  ])
  
  // 热销商品数据
  const hotProducts = ref([
    { name: 'Gmail（美国）', value: 368, percentage: 100, color: '#f56c6c' },
    { name: 'ChatGPT账号 (美国)', value: 292, percentage: 79, color: '#67c23a' },
    { name: 'Facebook账号 (美国)', value: 256, percentage: 69, color: '#e6a23c' },
    { name: 'Twitter账号 (美国)', value: 198, percentage: 54, color: '#909399' },
    { name: 'Instagram账号 (美国)', value: 165, percentage: 45, color: '#909399' }
  ])
  
  // 订单状态分布
  const orderStatusDistribution = ref([
    { value: 19.77, name: '待付款', color: '#fac858' },
    { value: 21.88, name: '待发货', color: '#5470c6' },
    { value: 24.76, name: '已发货', color: '#91cc75' },
    { value: 26.70, name: '已完成', color: '#73c0de' },
    { value: 7.85, name: '已取消', color: '#ee6666' }
  ])
  
  // 用户增长趋势
  const userGrowthTrend = ref([
    { month: '1月', value: 320 },
    { month: '2月', value: 450 },
    { month: '3月', value: 580 },
    { month: '4月', value: 350 },
    { month: '5月', value: 600 },
    { month: '6月', value: 720 },
    { month: '7月', value: 650 },
    { month: '8月', value: 580 },
    { month: '9月', value: 600 },
    { month: '10月', value: 680 },
    { month: '11月', value: 720 },
    { month: '12月', value: 850 }
  ])
  
  // 最近订单数据
  const recentOrders = ref([
    { 
      orderId: 'DD20240315001', 
      productName: 'Gmail（美国）', 
      price: '¥99.99', 
      buyer: 'user***123', 
      status: '已完成', 
      createTime: '2024-03-15 10:00:00' 
    },
    { 
      orderId: 'DD20240315002', 
      productName: 'ChatGPT账号', 
      price: '¥199.99', 
      buyer: 'user***456', 
      status: '待支付', 
      createTime: '2024-03-15 09:30:00' 
    },
    { 
      orderId: 'DD20240315003', 
      productName: 'Facebook账号', 
      price: '¥59.99', 
      buyer: 'user***789', 
      status: '已完成', 
      createTime: '2024-03-15 09:00:00' 
    }
  ])
  
  // 库存预警数据
  const inventoryAlerts = ref([
    {
      id: 1,
      productName: 'Gmail邮箱-美国稳定',
      currentStock: 5,
      alertThreshold: 10,
      updateTime: '2024-03-15 08:30:00'
    },
    {
      id: 2,
      productName: 'Twitter账号',
      currentStock: 3,
      alertThreshold: 15,
      updateTime: '2024-03-15 09:15:00'
    },
    {
      id: 3,
      productName: 'ChatGPT账号',
      currentStock: 2,
      alertThreshold: 5,
      updateTime: '2024-03-15 10:20:00'
    }
  ])
  
  // 补货提醒数据
  const restockRequests = ref([
    {
      id: 1,
      productName: '美国号码',
      email: 'newshengao@gmail.com',
      quantity: 10,
      description: '需要更多号码，越快越好',
      createTime: '2024-03-10 10:30:45'
    },
    {
      id: 2,
      productName: '美国号码',
      email: 'agent001@example.com',
      quantity: 50,
      description: '客户需要美国号码，急需补货',
      createTime: '2024-03-07 16:45:10'
    }
  ])
  
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
    orderCount,
    userCount,
    paymentCount,
    salesTrend,
    hotProducts,
    orderStatusDistribution,
    userGrowthTrend,
    recentOrders,
    inventoryAlerts,
    restockRequests,
    fetchDashboardData,
    fetchInventoryAlerts,
    fetchRestockRequests
  }
}) 