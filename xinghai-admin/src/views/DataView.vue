<template>
  <div class="data-container">
    <!-- 数据概览卡片 - 第一行 -->
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card shadow="hover" class="data-card sales-card">
          <div class="card-header">
            <div class="title">总销售额</div>
            <div class="actions">
              <el-radio-group v-model="salesTimeRange" size="small">
                <el-radio-button label="total">总计</el-radio-button>
                <el-radio-button label="today">今日</el-radio-button>
                <el-radio-button label="yesterday">昨日</el-radio-button>
              </el-radio-group>
            </div>
          </div>
          <div class="data-card-content">
            <div class="icon-container blue">
              <el-icon><Money /></el-icon>
            </div>
            <div class="data-info">
              <div class="data-value">¥{{ formatNumber(getSalesData.sales) }}</div>
              <div class="data-extra-info">
                <div class="data-extra-item">
                  <span class="label">总退款：</span>
                  <span class="value red-text">¥{{ formatNumber(getSalesData.refunds) }}</span>
                </div>
                <div class="data-extra-item">
                  <span class="label">总预收益：</span>
                  <span class="value green-text">¥{{ formatNumber(getSalesData.netRevenue) }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="data-card flow-card">
          <div class="card-header">
            <div class="title">总流水额</div>
            <div class="actions">
              <el-radio-group v-model="flowTimeRange" size="small">
                <el-radio-button label="total">总计</el-radio-button>
                <el-radio-button label="today">今日</el-radio-button>
                <el-radio-button label="yesterday">昨日</el-radio-button>
              </el-radio-group>
            </div>
          </div>
          <div class="data-card-content">
            <div class="icon-container purple">
              <el-icon><Connection /></el-icon>
            </div>
            <div class="data-info">
              <div class="data-value">¥{{ formatNumber(getFlowData.flow) }}</div>
              <div class="data-extra-info">
                <div class="data-extra-item">
                  <span class="label">总充值：</span>
                  <span class="value green-text">¥{{ formatNumber(getFlowData.recharge) }}</span>
                </div>
                <div class="flow-info-row">
                  <div class="flow-info-item">
                    <span class="label">总提款：</span>
                    <span class="value red-text">¥{{ formatNumber(getFlowData.withdrawal) }}</span>
                  </div>
                  <div class="flow-info-item">
                    <span class="label">顺差：</span>
                    <span class="value blue-text">¥{{ formatNumber(getFlowData.surplus) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="data-card payment-card">
          <div class="card-header">
            <div class="title">支付笔数</div>
            <div class="actions">
              <el-radio-group v-model="paymentTimeRange" size="small">
                <el-radio-button label="total">总计</el-radio-button>
                <el-radio-button label="today">今日</el-radio-button>
                <el-radio-button label="yesterday">昨日</el-radio-button>
              </el-radio-group>
            </div>
          </div>
          <div class="data-card-content">
            <div class="icon-container cyan">
              <el-icon><ShoppingBag /></el-icon>
            </div>
            <div class="data-info">
              <div class="data-value">{{ formatNumber(getPaymentData.count) }}</div>
              <div class="data-extra-info">
                <div class="data-extra-item">
                  <span class="label">总手续费：</span>
                  <span class="value orange-text">¥{{ formatNumber(getPaymentData.fees) }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 数据概览卡片 - 第二行 -->
    <el-row :gutter="20" class="second-row">
      <el-col :span="8">
        <el-card shadow="hover" class="data-card">
          <div class="data-card-content">
            <div class="icon-container indigo">
              <el-icon><List /></el-icon>
            </div>
            <div class="data-info">
              <div class="data-title">订单数量</div>
              <div class="data-value">{{ formatNumber(dashboardStore.orderCount) }}</div>
              <div class="data-trend">
                <span>较昨日</span>
                <span class="up">↑ 2.8%</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="data-card">
          <div class="data-card-content">
            <div class="icon-container orange">
              <el-icon><User /></el-icon>
            </div>
            <div class="data-info">
              <div class="data-title">用户数量</div>
              <div class="data-value">{{ formatNumber(dashboardStore.userCount) }}</div>
              <div class="data-trend">
                <span>较昨日</span>
                <span class="up">↑ 3.2%</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <!-- 这里可以添加其他统计卡片 -->
      </el-col>
    </el-row>

    <!-- 销售趋势图 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :span="16">
        <el-card shadow="hover" class="chart-card">
          <div class="card-header">
            <div class="title">销售趋势</div>
            <div class="actions">
              <el-radio-group v-model="timeRange" size="small">
                <el-radio-button label="today">今天</el-radio-button>
                <el-radio-button label="week">近30天</el-radio-button>
                <el-radio-button label="month">近1个月</el-radio-button>
              </el-radio-group>
            </div>
          </div>
          <div class="chart-container" ref="salesChartRef"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="chart-card">
          <div class="card-header">
            <div class="title">热销商品排行</div>
            <div class="actions">
              <el-select v-model="sortType" size="small" placeholder="销量" style="width: 168px;">
                <el-option label="销量" value="sales"></el-option>
                <el-option label="金额" value="amount"></el-option>
              </el-select>
            </div>
          </div>
          <div class="rank-list">
            <div class="rank-item" v-for="(item, index) in hotProductsList" :key="index">
              <div class="rank-index" :class="'rank-' + (index + 1)">{{ index + 1 }}</div>
              <div class="rank-content">
                <div class="rank-name">{{ item.name }}</div>
                <el-progress 
                  :percentage="item.percentage" 
                  :color="item.color"
                  :show-text="false"
                  :stroke-width="8"
                ></el-progress>
              </div>
              <div class="rank-value">{{ item.value }}{{ sortType === 'sales' ? '笔' : '' }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 订单类型和用户增长 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card shadow="hover" class="chart-card">
          <div class="card-header">
            <div class="title">订单状态分布</div>
          </div>
          <div class="chart-container" ref="orderChartRef"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover" class="chart-card">
          <div class="card-header">
            <div class="title">用户增长趋势</div>
          </div>
          <div class="chart-container" ref="userChartRef"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 最近交易记录 -->
    <el-card shadow="hover" class="table-card">
      <div class="card-header">
        <div class="title">最近交易记录</div>
        <div class="actions">
          <el-button type="primary" size="small" plain @click="viewMore">
            查看更多 <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
      </div>
      <el-table :data="dashboardStore.recentOrders" style="width: 100%" stripe>
        <el-table-column prop="orderId" label="订单号" width="180"></el-table-column>
        <el-table-column prop="productName" label="商品名称"></el-table-column>
        <el-table-column prop="price" label="价格" width="100"></el-table-column>
        <el-table-column prop="buyer" label="买家" width="120"></el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180"></el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { Money, List, User, ShoppingBag, ArrowRight, RefreshRight, Wallet, PriceTag, Connection } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { useDashboardStore } from '@/store/dashboard'
import { useRouter } from 'vue-router'

// 获取仪表盘数据
const dashboardStore = useDashboardStore()
const router = useRouter()

// 时间范围选择
const timeRange = ref('week')
const salesTimeRange = ref('total')
const flowTimeRange = ref('total')
const paymentTimeRange = ref('total')

// 排序类型
const sortType = ref('sales')

// 根据时间范围获取销售数据
const getSalesData = computed(() => {
  if (salesTimeRange.value === 'today') {
    return {
      sales: dashboardStore.todaySales,
      refunds: dashboardStore.todayRefunds,
      fees: dashboardStore.todayFees,
      netRevenue: dashboardStore.todayNetRevenue
    }
  } else if (salesTimeRange.value === 'yesterday') {
    return {
      sales: dashboardStore.yesterdaySales,
      refunds: dashboardStore.yesterdayRefunds,
      fees: dashboardStore.yesterdayFees,
      netRevenue: dashboardStore.yesterdayNetRevenue
    }
  } else {
    return {
      sales: dashboardStore.totalSales,
      refunds: dashboardStore.totalRefunds,
      fees: dashboardStore.totalFees,
      netRevenue: dashboardStore.netRevenue
    }
  }
})

// 根据时间范围获取流水数据
const getFlowData = computed(() => {
  if (flowTimeRange.value === 'today') {
    return {
      flow: dashboardStore.todayFlow,
      recharge: dashboardStore.todayRecharge,
      withdrawal: dashboardStore.todayWithdrawal,
      surplus: dashboardStore.todayBalanceSurplus
    }
  } else if (flowTimeRange.value === 'yesterday') {
    return {
      flow: dashboardStore.yesterdayFlow,
      recharge: dashboardStore.yesterdayRecharge,
      withdrawal: dashboardStore.yesterdayWithdrawal,
      surplus: dashboardStore.yesterdayBalanceSurplus
    }
  } else {
    return {
      flow: dashboardStore.totalFlow,
      recharge: dashboardStore.totalRecharge,
      withdrawal: dashboardStore.totalWithdrawal,
      surplus: dashboardStore.balanceSurplus
    }
  }
})

// 根据时间范围获取支付数据
const getPaymentData = computed(() => {
  if (paymentTimeRange.value === 'today') {
    return {
      count: dashboardStore.todayPaymentCount,
      fees: dashboardStore.todayFees
    }
  } else if (paymentTimeRange.value === 'yesterday') {
    return {
      count: dashboardStore.yesterdayPaymentCount,
      fees: dashboardStore.yesterdayFees
    }
  } else {
    return {
      count: dashboardStore.paymentCount,
      fees: dashboardStore.totalFees
    }
  }
})

// 根据排序类型获取热销商品数据
const hotProductsList = computed(() => {
  return sortType.value === 'sales' 
    ? dashboardStore.hotProducts 
    : dashboardStore.hotProductsByAmount
})

// 图表引用
const salesChartRef = ref<HTMLElement | null>(null)
const orderChartRef = ref<HTMLElement | null>(null)
const userChartRef = ref<HTMLElement | null>(null)

// 图表实例
let salesChart: echarts.ECharts | null = null
let orderChart: echarts.ECharts | null = null
let userChart: echarts.ECharts | null = null

// 格式化数字
const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 获取状态对应的类型
const getStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    '已完成': 'success',
    '待支付': 'warning',
    '已取消': 'info',
    '已退款': 'danger'
  }
  return statusMap[status] || 'info'
}

// 查看更多
const viewMore = () => {
  router.push('/orders')
}

// 初始化销售趋势图表
const initSalesChart = () => {
  if (salesChartRef.value) {
    salesChart = echarts.init(salesChartRef.value)
    
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985'
          }
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: dashboardStore.salesTrend.map(item => item.date)
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '销售额',
          type: 'line',
          stack: '总量',
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: 'rgba(58,132,255,0.6)'
              },
              {
                offset: 1,
                color: 'rgba(58,132,255,0.1)'
              }
            ])
          },
          emphasis: {
            focus: 'series'
          },
          data: dashboardStore.salesTrend.map(item => item.value),
          smooth: true,
          lineStyle: {
            width: 3
          },
          itemStyle: {
            color: '#409EFF'
          }
        }
      ]
    }
    
    salesChart.setOption(option)
  }
}

// 初始化订单状态分布图表
const initOrderChart = () => {
  if (orderChartRef.value) {
    orderChart = echarts.init(orderChartRef.value)
    
    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        padding: [20, 0, 0, 0]
      },
      series: [
        {
          name: '订单状态',
          type: 'pie',
          radius: ['50%', '70%'],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '14',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: dashboardStore.orderStatusDistribution.map(item => ({
            value: item.value,
            name: item.name,
            itemStyle: { color: item.color }
          }))
        }
      ]
    }
    
    orderChart.setOption(option)
  }
}

// 初始化用户增长趋势图表
const initUserChart = () => {
  if (userChartRef.value) {
    userChart = echarts.init(userChartRef.value)
    
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: dashboardStore.userGrowthTrend.map(item => item.month),
        axisLabel: {
          interval: 0,
          rotate: 30
        }
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '新增用户',
          type: 'bar',
          barWidth: '60%',
          data: dashboardStore.userGrowthTrend.map(item => item.value),
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#83bff6' },
              { offset: 0.5, color: '#188df0' },
              { offset: 1, color: '#188df0' }
            ]),
            borderRadius: [4, 4, 0, 0]
          }
        }
      ]
    }
    
    userChart.setOption(option)
  }
}

// 窗口大小变化时重新调整图表大小
const handleResize = () => {
  salesChart?.resize()
  orderChart?.resize()
  userChart?.resize()
}

// 监听时间范围变化
watch(timeRange, (newValue) => {
  console.log('时间范围变化:', newValue)
  // 这里可以根据时间范围重新获取数据并更新图表
  // 模拟数据更新
  setTimeout(() => {
    initSalesChart()
  }, 300)
})

// 监听排序类型变化
watch(sortType, (newValue) => {
  console.log('排序类型变化:', newValue)
  // 数据已通过计算属性自动更新，无需额外处理
})

onMounted(() => {
  // 获取仪表盘数据
  dashboardStore.fetchDashboardData()
  
  // 初始化图表
  setTimeout(() => {
    initSalesChart()
    initOrderChart()
    initUserChart()
  }, 100)
  
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  // 移除事件监听
  window.removeEventListener('resize', handleResize)
  
  // 销毁图表实例
  salesChart?.dispose()
  orderChart?.dispose()
  userChart?.dispose()
})
</script>

<style scoped>
.data-container {
  padding: 20px;
}

.chart-row {
  margin-top: 20px;
}

.data-card {
  height: 160px;
  transition: all 0.3s;
}

.data-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.data-card-content {
  display: flex;
  align-items: center;
  height: calc(100% - 50px);
  padding: 0 15px;
}

.icon-container {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  transition: all 0.3s;
}

.data-card:hover .icon-container {
  transform: scale(1.1);
}

.icon-container .el-icon {
  font-size: 30px;
  color: #fff;
}

.blue {
  background-color: #409EFF;
}

.green {
  background-color: #67C23A;
}

.orange {
  background-color: #E6A23C;
}

.red {
  background-color: #F56C6C;
}

.purple {
  background-color: #9254de;
}

.cyan {
  background-color: #36cfc9;
}

.indigo {
  background-color: #5c6bc0;
}

.data-info {
  flex: 1;
}

.data-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 10px;
}

.data-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.data-trend {
  font-size: 12px;
  color: #909399;
}

.up {
  color: #F56C6C;
  margin-left: 5px;
}

.down {
  color: #67C23A;
  margin-left: 5px;
}

.data-extra-info {
  margin-top: 10px;
  border-top: 1px dashed #ebeef5;
  padding-top: 8px;
}

.data-extra-item {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  margin-bottom: 4px;
}

.data-extra-item .label {
  color: #606266;
}

.data-extra-item .value {
  font-weight: 500;
}

.flow-info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.flow-info-item {
  display: flex;
  align-items: center;
  font-size: 13px;
}

.flow-info-item .label {
  color: #606266;
  margin-right: 5px;
}

.flow-info-item .value {
  font-weight: 500;
}

.red-text {
  color: #F56C6C;
}

.green-text {
  color: #67C23A;
}

.blue-text {
  color: #409EFF;
}

.orange-text {
  color: #E6A23C;
}

.highlight {
  /* 移除加粗样式 */
}

.second-row {
  margin-top: 20px;
}

.chart-card {
  height: 400px;
  transition: all 0.3s;
}

.chart-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 0 10px;
}

.card-header .title {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  position: relative;
  padding-left: 10px;
}

.card-header .title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 16px;
  background-color: #409EFF;
  border-radius: 2px;
}

.chart-container {
  height: 320px;
}

.rank-list {
  padding: 0 10px;
  height: 320px;
  overflow-y: auto;
}

.rank-item {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding: 10px;
  border-radius: 4px;
  transition: all 0.3s;
}

.rank-item:hover {
  background-color: #f5f7fa;
}

.rank-index {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  margin-right: 10px;
  background-color: #f4f4f5;
  color: #909399;
}

.rank-1 {
  background-color: #f56c6c;
  color: #fff;
}

.rank-2 {
  background-color: #e6a23c;
  color: #fff;
}

.rank-3 {
  background-color: #67c23a;
  color: #fff;
}

.rank-content {
  flex: 1;
  margin-right: 10px;
}

.rank-name {
  font-size: 14px;
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rank-value {
  font-size: 14px;
  color: #606266;
  width: 50px;
  text-align: right;
}

.table-card {
  margin-top: 20px;
}

/* 自定义滚动条样式 */
.rank-list::-webkit-scrollbar {
  width: 6px;
}

.rank-list::-webkit-scrollbar-thumb {
  background-color: #dcdfe6;
  border-radius: 3px;
}

.rank-list::-webkit-scrollbar-track {
  background-color: #f5f7fa;
}

.surplus-info {
  margin-top: 10px;
  padding: 5px 0;
  border-top: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.surplus-label {
  font-size: 14px;
  font-weight: bold;
  color: #606266;
}

.surplus-value {
  font-size: 16px;
  font-weight: bold;
  color: #409EFF;
}
</style> 