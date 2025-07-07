<template>
  <div class="data-container">
    <!-- 商品销售统计区域 -->
    <div class="section-title">商品销售统计</div>
    <!-- 第一行卡片：商品销售统计 -->
    <el-row :gutter="20">
      <el-col :span="8">
        <!-- 商品销售额 -->
        <el-card shadow="hover" class="data-card">
          <div class="card-header">
            <div class="title">商品销售额</div>
            <div class="actions">
              <el-radio-group v-model="revenueTimeRange" size="small">
                <el-radio-button label="total">总计</el-radio-button>
                <el-radio-button label="today">今日</el-radio-button>
                <el-radio-button label="yesterday">昨日</el-radio-button>
                <el-radio-button label="thisMonth">本月</el-radio-button>
                <el-radio-button label="lastMonth">上月</el-radio-button>
              </el-radio-group>
            </div>
          </div>
          <div class="data-card-content">
            <div class="data-info">
              <div class="data-value">¥{{ formatNumber(getRevenueData.amount) }}</div>
              <div class="data-trend">
                <span>{{ getRevenueData.label }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <!-- 支付单数 (原支付人数) -->
        <el-card shadow="hover" class="data-card">
          <div class="card-header">
            <div class="title">支付单数</div>
            <div class="actions">
              <el-radio-group v-model="payUserTimeRange" size="small">
                <el-radio-button label="total">总计</el-radio-button>
                <el-radio-button label="today">今日</el-radio-button>
                <el-radio-button label="yesterday">昨日</el-radio-button>
              </el-radio-group>
            </div>
          </div>
          <div class="data-card-content">
            <div class="data-info">
              <div class="data-value">{{ getPayUserData.value }} 单</div>
              <div class="data-trend" v-if="payUserTimeRange === 'today'">
                <span>较昨日</span>
                <span class="up" v-if="Number(getPayUserData.growth) >= 0">↑ {{ getPayUserData.growth }}%</span>
                <span class="down" v-else>↓ {{ Math.abs(Number(getPayUserData.growth)) }}%</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <!-- 商品成本 (原付款金额) -->
        <el-card shadow="hover" class="data-card">
          <div class="card-header">
            <div class="title">商品成本</div>
            <div class="actions">
              <el-radio-group v-model="costTimeRange" size="small">
                <el-radio-button label="total">总计</el-radio-button>
                <el-radio-button label="today">今日</el-radio-button>
                <el-radio-button label="yesterday">昨日</el-radio-button>
              </el-radio-group>
            </div>
          </div>
          <div class="data-card-content">
            <div class="data-info">
              <div class="data-value">¥{{ formatNumber(getCostData.value) }}</div>
              <div class="data-trend" v-if="costTimeRange === 'today'">
                <span>较昨日</span>
                <span class="up" v-if="Number(getCostData.growth) >= 0">↑ {{ getCostData.growth }}%</span>
                <span class="down" v-else>↓ {{ Math.abs(Number(getCostData.growth)) }}%</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 第二行卡片：商品销售统计(续) -->
    <el-row :gutter="20" class="second-row">
      <el-col :span="8">
        <!-- 结算金额 -->
        <el-card shadow="hover" class="data-card">
          <div class="card-header">
            <div class="title">结算金额</div>
            <div class="actions">
              <el-radio-group v-model="netIncomeTimeRange" size="small">
                <el-radio-button label="total">总计</el-radio-button>
                <el-radio-button label="today">今日</el-radio-button>
                <el-radio-button label="yesterday">昨日</el-radio-button>
              </el-radio-group>
            </div>
          </div>
          <div class="data-card-content">
            <div class="data-info">
              <div class="data-value">¥{{ formatNumber(getNetIncomeData.value) }}</div>
              <div class="data-trend" v-if="netIncomeTimeRange === 'today'">
                <span>较昨日</span>
                <span class="up" v-if="Number(getNetIncomeData.growth) >= 0">↑ {{ getNetIncomeData.growth }}%</span>
                <span class="down" v-else>↓ {{ Math.abs(Number(getNetIncomeData.growth)) }}%</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <!-- 退款金额 -->
        <el-card shadow="hover" class="data-card">
          <div class="card-header">
            <div class="title">退款金额</div>
            <div class="actions">
              <el-radio-group v-model="refundTimeRange" size="small">
                <el-radio-button label="total">总计</el-radio-button>
                <el-radio-button label="today">今日</el-radio-button>
                <el-radio-button label="yesterday">昨日</el-radio-button>
              </el-radio-group>
            </div>
          </div>
          <div class="data-card-content">
            <div class="data-info">
              <div class="data-value">¥{{ formatNumber(getRefundData.value) }}</div>
              <div class="data-trend" v-if="refundTimeRange === 'today'">
                <span>较昨日</span>
                <span class="up" v-if="Number(getRefundData.growth) >= 0">↑ {{ getRefundData.growth }}%</span>
                <span class="down" v-else>↓ {{ Math.abs(Number(getRefundData.growth)) }}%</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <!-- 每单平均消费 (原人均消费) -->
        <el-card shadow="hover" class="data-card">
          <div class="card-header">
            <div class="title">每单平均消费</div>
            <div class="actions">
              <el-radio-group v-model="avgConsumptionTimeRange" size="small">
                <el-radio-button label="total">总计</el-radio-button>
                <el-radio-button label="today">今日</el-radio-button>
                <el-radio-button label="yesterday">昨日</el-radio-button>
              </el-radio-group>
            </div>
          </div>
          <div class="data-card-content">
            <div class="data-info">
              <div class="data-value">¥{{ formatNumber(getAvgConsumptionData.value) }}</div>
              <div class="data-trend" v-if="avgConsumptionTimeRange === 'today'">
                <span>较昨日</span>
                <span class="up" v-if="Number(getAvgConsumptionData.growth) >= 0">↑ {{ getAvgConsumptionData.growth }}%</span>
                <span class="down" v-else>↓ {{ Math.abs(Number(getAvgConsumptionData.growth)) }}%</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 充值统计区域 -->
    <div class="section-title section-divider">充值统计</div>
    <!-- 第三行卡片：充值统计 -->
    <el-row :gutter="20" class="second-row">
      <el-col :span="8">
        <!-- 充值单数 (原充值人数) -->
        <el-card shadow="hover" class="data-card">
          <div class="card-header">
            <div class="title">充值单数</div>
            <div class="actions">
              <el-radio-group v-model="rechargeUserTimeRange" size="small">
                <el-radio-button label="total">总计</el-radio-button>
                <el-radio-button label="today">今日</el-radio-button>
                <el-radio-button label="yesterday">昨日</el-radio-button>
              </el-radio-group>
            </div>
          </div>
          <div class="data-card-content">
            <div class="data-info">
              <div class="data-value">{{ getRechargeUserData.value }} 单</div>
              <div class="data-trend" v-if="rechargeUserTimeRange === 'today'">
                <span>较昨日</span>
                <span class="up" v-if="Number(getRechargeUserData.growth) >= 0">↑ {{ getRechargeUserData.growth }}%</span>
                <span class="down" v-else>↓ {{ Math.abs(Number(getRechargeUserData.growth)) }}%</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <!-- 充值金额 -->
        <el-card shadow="hover" class="data-card">
          <div class="card-header">
            <div class="title">充值金额</div>
            <div class="actions">
              <el-radio-group v-model="rechargeAmountTimeRange" size="small">
                <el-radio-button label="total">总计</el-radio-button>
                <el-radio-button label="today">今日</el-radio-button>
                <el-radio-button label="yesterday">昨日</el-radio-button>
              </el-radio-group>
            </div>
          </div>
          <div class="data-card-content">
            <div class="data-info">
              <div class="data-value">¥{{ formatNumber(getRechargeAmountData.value) }}</div>
              <div class="data-trend" v-if="rechargeAmountTimeRange === 'today'">
                <span>较昨日</span>
                <span class="up" v-if="Number(getRechargeAmountData.growth) >= 0">↑ {{ getRechargeAmountData.growth }}%</span>
                <span class="down" v-else>↓ {{ Math.abs(Number(getRechargeAmountData.growth)) }}%</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <!-- 注册用户数量 -->
        <el-card shadow="hover" class="data-card">
          <div class="card-header">
            <div class="title">注册用户数量</div>
            <div class="actions">
              <el-radio-group v-model="newUserTimeRange" size="small">
                <el-radio-button label="total">总计</el-radio-button>
                <el-radio-button label="today">今日</el-radio-button>
                <el-radio-button label="yesterday">昨日</el-radio-button>
              </el-radio-group>
            </div>
          </div>
          <div class="data-card-content">
            <div class="data-info">
              <div class="data-value">{{ getNewUserData.value }} 人</div>
              <div class="data-trend" v-if="newUserTimeRange === 'today'">
                <span>较昨日</span>
                <span class="up" v-if="Number(getNewUserData.growth) >= 0">↑ {{ getNewUserData.growth }}%</span>
                <span class="down" v-else>↓ {{ Math.abs(Number(getNewUserData.growth)) }}%</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 商品销售明细表格 -->
    <div class="section-title section-divider">商品销售明细</div>
    <el-card shadow="hover" class="table-card">
      <div class="card-header">
        <div class="tabs-container">
          <el-tabs v-model="tableTimeRange" @tab-change="handleTableTabChange">
            <el-tab-pane label="今日" name="today"></el-tab-pane>
            <el-tab-pane label="本月" name="thisMonth"></el-tab-pane>
            <el-tab-pane label="上月" name="lastMonth"></el-tab-pane>
          </el-tabs>
        </div>
        <div class="actions">
          <el-button type="primary" size="small" @click="exportTableData">导出数据</el-button>
        </div>
      </div>
      
      <el-table 
        :data="accountProducts" 
        border 
        stripe
        highlight-current-row
        v-loading="tableLoading"
        class="business-table"
        :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
      >
        <el-table-column prop="name" label="商品名称" min-width="150" />
        <el-table-column prop="totalRevenue" label="销售额" min-width="120" sortable>
          <template #default="{ row }">
            ¥{{ formatNumber(row.totalRevenue) }}
          </template>
        </el-table-column>
        <el-table-column prop="payUsers" label="支付单数" min-width="100" sortable>
          <template #default="{ row }">
            {{ row.payUsers }} 单
          </template>
        </el-table-column>
        <el-table-column prop="avgConsumption" label="每单平均消费" min-width="120" sortable>
          <template #default="{ row }">
            ¥{{ formatNumber(row.avgConsumption) }}
          </template>
        </el-table-column>
        <el-table-column prop="paymentAmount" label="商品成本" min-width="120" sortable>
          <template #default="{ row }">
            ¥{{ formatNumber(row.paymentAmount) }}
          </template>
        </el-table-column>
        <el-table-column prop="refundAmount" label="退款金额" min-width="120" sortable>
          <template #default="{ row }">
            ¥{{ formatNumber(row.refundAmount) }}
          </template>
        </el-table-column>
        <el-table-column prop="netIncome" label="结算金额" min-width="120" sortable>
          <template #default="{ row }">
            ¥{{ formatNumber(row.netIncome) }}
          </template>
        </el-table-column>
      </el-table>
      
      <div class="table-footer">
        <div class="total-info">
          <span class="total-label">总计:</span>
          <span class="total-value">销售额: ¥{{ formatNumber(accountProductsTotals.totalRevenue) }}</span>
          <span class="total-value">支付单数: {{ accountProductsTotals.payUsers }} 单</span>
          <span class="total-value">每单平均消费: ¥{{ formatNumber(accountProductsTotals.avgConsumption) }}</span>
          <span class="total-value">商品成本: ¥{{ formatNumber(accountProductsTotals.paymentAmount) }}</span>
          <span class="total-value">退款金额: ¥{{ formatNumber(accountProductsTotals.refundAmount) }}</span>
          <span class="total-value">结算金额: ¥{{ formatNumber(accountProductsTotals.netIncome) }}</span>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { accountProducts, dailyMetrics, monthlyData, getAccountProductsTotals } from '../data/businessData'
import type { MetricsData } from '../data/businessData.d.ts'

// 为每个卡片创建独立的时间范围选择变量
const revenueTimeRange = ref('total')
const payUserTimeRange = ref('today')
const costTimeRange = ref('today')
const netIncomeTimeRange = ref('today')
const refundTimeRange = ref('today')
const avgConsumptionTimeRange = ref('today')
const rechargeUserTimeRange = ref('today')
const rechargeAmountTimeRange = ref('today')
const newUserTimeRange = ref('today')

const tableTimeRange = ref('today') // 表格时间范围标签
const tableLoading = ref(false)

// 根据时间范围获取支付人数数据
const getPayUserData = computed<any>(() => {
  if (payUserTimeRange.value === 'yesterday') {
    return {
      value: dailyMetrics.value.yesterday.payUserCount,
      growth: getDayOverDayGrowth('payUserCount')
    }
  } else if (payUserTimeRange.value === 'today') {
    return {
      value: dailyMetrics.value.today.payUserCount,
      growth: getDayOverDayGrowth('payUserCount')
    }
  } else {
    // 总计
    return {
      value: monthlyData.value.payUserCount,
      growth: null
    }
  }
})

// 根据时间范围获取商品成本数据
const getCostData = computed<any>(() => {
  if (costTimeRange.value === 'yesterday') {
    return {
      value: dailyMetrics.value.yesterday.paymentAmount,
      growth: getDayOverDayGrowth('paymentAmount')
    }
  } else if (costTimeRange.value === 'today') {
    return {
      value: dailyMetrics.value.today.paymentAmount,
      growth: getDayOverDayGrowth('paymentAmount')
    }
  } else {
    // 总计
    return {
      value: monthlyData.value.totalPaymentAmount,
      growth: null
    }
  }
})

// 根据时间范围获取结算金额数据
const getNetIncomeData = computed<any>(() => {
  if (netIncomeTimeRange.value === 'yesterday') {
    return {
      value: dailyMetrics.value.yesterday.netIncome,
      growth: getDayOverDayGrowth('netIncome')
    }
  } else if (netIncomeTimeRange.value === 'today') {
    return {
      value: dailyMetrics.value.today.netIncome,
      growth: getDayOverDayGrowth('netIncome')
    }
  } else {
    // 总计
    return {
      value: monthlyData.value.totalNetRevenue,
      growth: null
    }
  }
})

// 根据时间范围获取退款金额数据
const getRefundData = computed<any>(() => {
  if (refundTimeRange.value === 'yesterday') {
    return {
      value: dailyMetrics.value.yesterday.refundAmount,
      growth: getDayOverDayGrowth('refundAmount')
    }
  } else if (refundTimeRange.value === 'today') {
    return {
      value: dailyMetrics.value.today.refundAmount,
      growth: getDayOverDayGrowth('refundAmount')
    }
  } else {
    // 总计
    return {
      value: monthlyData.value.totalRefundAmount,
      growth: null
    }
  }
})

// 根据时间范围获取人均消费数据
const getAvgConsumptionData = computed<any>(() => {
  if (avgConsumptionTimeRange.value === 'yesterday') {
    return {
      value: dailyMetrics.value.yesterday.avgConsumption,
      growth: getDayOverDayGrowth('avgConsumption')
    }
  } else if (avgConsumptionTimeRange.value === 'today') {
    return {
      value: dailyMetrics.value.today.avgConsumption,
      growth: getDayOverDayGrowth('avgConsumption')
    }
  } else {
    // 总计
    const avgValue = monthlyData.value.payUserCount > 0 ? 
      Number((monthlyData.value.totalPaymentAmount / monthlyData.value.payUserCount).toFixed(2)) : 0
    return {
      value: avgValue,
      growth: null
    }
  }
})

// 根据时间范围获取充值人数数据
const getRechargeUserData = computed<any>(() => {
  if (rechargeUserTimeRange.value === 'yesterday') {
    return {
      value: dailyMetrics.value.yesterday.rechargeUserCount,
      growth: getDayOverDayGrowth('rechargeUserCount')
    }
  } else if (rechargeUserTimeRange.value === 'today') {
    return {
      value: dailyMetrics.value.today.rechargeUserCount,
      growth: getDayOverDayGrowth('rechargeUserCount')
    }
  } else {
    // 总计
    return {
      value: monthlyData.value.rechargeUserCount,
      growth: null
    }
  }
})

// 根据时间范围获取充值金额数据
const getRechargeAmountData = computed<any>(() => {
  if (rechargeAmountTimeRange.value === 'yesterday') {
    return {
      value: dailyMetrics.value.yesterday.rechargeAmount,
      growth: getDayOverDayGrowth('rechargeAmount')
    }
  } else if (rechargeAmountTimeRange.value === 'today') {
    return {
      value: dailyMetrics.value.today.rechargeAmount,
      growth: getDayOverDayGrowth('rechargeAmount')
    }
  } else {
    // 总计
    return {
      value: monthlyData.value.rechargeAmount,
      growth: null
    }
  }
})

// 根据时间范围获取新用户数据
const getNewUserData = computed<any>(() => {
  if (newUserTimeRange.value === 'yesterday') {
    return {
      value: dailyMetrics.value.yesterday.newUserCount,
      growth: getDayOverDayGrowth('newUserCount')
    }
  } else if (newUserTimeRange.value === 'today') {
    return {
      value: dailyMetrics.value.today.newUserCount,
      growth: getDayOverDayGrowth('newUserCount')
    }
  } else {
    // 总计
    return {
      value: monthlyData.value.newUserCount,
      growth: null
    }
  }
})

// 根据累计实收数据范围获取数据
const getRevenueData = computed(() => {
  if (revenueTimeRange.value === 'total') {
    return {
      amount: monthlyData.value.total.netRevenue,
      label: '商品销售总额'
    }
  } else if (revenueTimeRange.value === 'today') {
    return {
      amount: dailyMetrics.value.today.netIncome,
      label: '今日销售额'
    }
  } else if (revenueTimeRange.value === 'yesterday') {
    return {
      amount: dailyMetrics.value.yesterday.netIncome,
      label: '昨日销售额'
    }
  } else if (revenueTimeRange.value === 'thisMonth') {
    return {
      amount: monthlyData.value.thisMonth.netRevenue,
      label: '本月销售额'
    }
  } else {
    return {
      amount: monthlyData.value.lastMonth.netRevenue,
      label: '上月销售额'
    }
  }
})

// 计算账户商品总计
const accountProductsTotals = computed(() => {
  return getAccountProductsTotals()
})

// 计算同比增长
const getDayOverDayGrowth = (metric: keyof MetricsData): string => {
  const today = dailyMetrics.value.today[metric]
  const yesterday = dailyMetrics.value.yesterday[metric]
  
  if (yesterday === 0) return '0'
  
  const growth = ((today - yesterday) / yesterday) * 100
  return growth.toFixed(1)
}

// 格式化数字
const formatNumber = (num: number): string => {
  return num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// 导出表格数据
const exportTableData = () => {
  ElMessage.success('数据导出成功')
  console.log('导出数据:', accountProducts.value)
}

// 处理表格标签切换
const handleTableTabChange = (tab: string) => {
  console.log('表格时间范围切换为:', tab)
  // 这里可以添加表格数据切换的逻辑
  tableLoading.value = true
  setTimeout(() => {
    tableLoading.value = false
  }, 500)
}

onMounted(() => {
  console.log('数据概览页面加载完成')
})
</script>

<style scoped>
.data-container {
  padding: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 16px;
  position: relative;
  padding-left: 12px;
}

.section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 18px;
  background-color: #409EFF;
  border-radius: 2px;
}

.section-divider {
  margin-top: 30px;
}

.data-card {
  transition: all 0.3s;
  height: 100%;
}

.el-card {
  height: 100%;
  margin-bottom: 0;
}

.el-card__body {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.data-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.data-card-content {
  display: flex;
  align-items: center;
  padding: 20px;
  height: 100%;
}

.data-info {
  flex: 1;
  display: flex;
  flex-direction: column;
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
  margin-top: auto;
}

.up {
  color: #F56C6C;
  margin-left: 5px;
}

.down {
  color: #67C23A;
  margin-left: 5px;
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

.tabs-container {
  flex: 1;
}

.tabs-container :deep(.el-tabs__header) {
  margin-bottom: 0;
}

.tabs-container :deep(.el-tabs__nav-wrap::after) {
  display: none;
}

.table-card {
  margin-top: 20px;
}

.business-table {
  width: 100%;
  margin-top: 15px;
}

.table-footer {
  margin-top: 15px;
  padding-top: 10px;
  border-top: 1px solid #EBEEF5;
}

.total-info {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.total-label {
  font-weight: bold;
  color: #606266;
}

.total-value {
  color: #303133;
  font-weight: 500;
}
</style> 