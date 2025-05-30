<template>
  <div class="data-container">
    <!-- 数据概览卡片 - 第一行 -->
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card shadow="hover" class="data-card">
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
            <div class="icon-container">
              <el-icon><Money /></el-icon>
            </div>
            <div class="data-info">
              <div class="data-value">¥{{ formatNumber(getSalesData.sales) }}</div>
              <div class="data-extra-info">
                <div class="data-extra-item">
                  <span class="label">人民币销售额：</span>
                  <span class="value red-text">¥{{ formatNumber(getSalesData.sales) }}</span>
                </div>
                <div class="data-extra-item">
                  <span class="label">USDT销售额：</span>
                  <span class="value green-text">{{ formatNumber(getSalesData.sales * 0.14) }} USDT</span>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover" class="data-card">
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
            <div class="icon-container">
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
            <div class="icon-container">
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
            <div class="icon-container">
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Money, List, User, ShoppingBag } from '@element-plus/icons-vue'
import { useDashboardStore } from '@/store/dashboard'

// 获取仪表盘数据
const dashboardStore = useDashboardStore()

// 时间范围选择
const salesTimeRange = ref('total')
const paymentTimeRange = ref('total')

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

// 格式化数字
const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

onMounted(() => {
  // 获取仪表盘数据
  dashboardStore.fetchDashboardData()
})
</script>

<style scoped>
.data-container {
  padding: 20px;
}

.data-card {
  transition: all 0.3s;
}

.data-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.data-card-content {
  display: flex;
  align-items: center;
  padding: 15px;
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
  background-color: var(--el-color-primary);
}

.data-card:hover .icon-container {
  transform: scale(1.1);
  color: #fff;
}

.icon-container .el-icon {
  font-size: 30px;
  color: #fff;
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

.second-row {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
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
</style> 