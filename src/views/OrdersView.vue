<template>
  <div class="orders-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>商品订单列表</span>
          <div class="header-buttons">
            <el-button type="primary" @click="exportAllOrders">
              <el-icon><Download /></el-icon>
              导出所有订单
            </el-button>
          </div>
        </div>
      </template>
      
      <div class="page-description">
        <p>管理所有邮箱账号和社交媒体账号的订单信息，包括订单状态、商品信息、买家信息等。您可以查看、编辑、删除订单，并进行发货操作。</p>
      </div>
      
      <!-- 搜索区域 -->
      <el-card shadow="never" class="filter-card-wrapper">
        <div class="search-area">
          <el-form :inline="true" :model="searchForm" class="demo-form-inline">
            <el-form-item label="订单号">
              <el-input v-model="searchForm.orderId" placeholder="请输入订单号" clearable></el-input>
            </el-form-item>
            <el-form-item label="用户信息">
              <el-input v-model="searchForm.userInfo" placeholder="请输入昵称或邮箱" clearable></el-input>
            </el-form-item>
            <el-form-item label="商品分类">
              <el-select v-model="searchForm.category" placeholder="请选择" clearable style="width: 168px;">
                <el-option label="全部" value=""></el-option>
                <el-option label="谷歌邮箱" value="谷歌邮箱"></el-option>
                <el-option label="微软邮箱" value="微软邮箱"></el-option>
                <el-option label="Instagram账号" value="Instagram账号"></el-option>
                <el-option label="Twitter账号" value="Twitter账号"></el-option>
                <el-option label="Facebook账号" value="Facebook账号"></el-option>
                <el-option label="Discord账号" value="Discord账号"></el-option>
                <el-option label="ChatGPT账号" value="ChatGPT账号"></el-option>
                <el-option label="其他账号" value="其他账号"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="支付方式">
              <el-select v-model="searchForm.payMethod" placeholder="请选择支付方式" clearable style="width: 168px">
                <el-option label="USDT" value="usdt"></el-option>
                <el-option label="微信" value="wechat"></el-option>
                <el-option label="支付宝" value="alipay"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="支付通道">
              <el-select v-model="searchForm.payChannel" placeholder="请选择支付通道" clearable style="width: 168px">
                <el-option label="k4" value="k4"></el-option>
                <el-option label="speedzf" value="speedzf"></el-option>
                <el-option label="quickpay" value="quickpay"></el-option>
                <el-option label="fastpay" value="fastpay"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="通道名称">
              <el-select v-model="searchForm.channelName" placeholder="请选择通道名称" clearable style="width: 168px">
                <el-option label="speedzf" value="speedzf"></el-option>
                <el-option label="K4" value="K4"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="发货方式">
              <el-select v-model="searchForm.deliveryMethod" placeholder="请选择" clearable style="width: 168px;">
                <el-option label="全部" value=""></el-option>
                <el-option label="自动发货" value="自动发货"></el-option>
                <el-option label="手动发货" value="手动发货"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="订单状态">
              <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 168px;">
                <el-option label="全部" value=""></el-option>
                <el-option label="待付款" value="待付款"></el-option>
                <el-option label="待发货" value="待发货"></el-option>
                <el-option label="已完成" value="已完成"></el-option>
                <el-option label="已退款" value="已退款"></el-option>
                <el-option label="已取消" value="已取消"></el-option>
                <el-option label="发货失败" value="发货失败"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="用户身份">
              <el-select v-model="searchForm.userRole" placeholder="请选择" clearable style="width: 168px;">
                <el-option label="全部" value=""></el-option>
                <el-option label="游客" value="游客"></el-option>
                <el-option label="普通用户" value="普通用户"></el-option>
                <el-option label="vip1" value="vip1"></el-option>
                <el-option label="vip2" value="vip2"></el-option>
                <el-option label="vip3" value="vip3"></el-option>
                <el-option label="超级会员" value="超级会员"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="创建时间">
              <el-date-picker
                v-model="searchForm.createDateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="YYYY-MM-DD"
              ></el-date-picker>
            </el-form-item>
            <el-form-item label="完成时间">
              <el-date-picker
                v-model="searchForm.completionDateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="YYYY-MM-DD"
              ></el-date-picker>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSearch">查询</el-button>
              <el-button @click="resetSearch">重置</el-button>
            </el-form-item>
          </el-form>
          
          <!-- 添加总金额和导出按钮 -->
          <div class="search-summary">
            <div class="total-amount">
              <span>总订单数：</span>
              <span class="amount-value" style="color: #409EFF;">{{ totalOrders }}</span>
              <span style="margin-left: 20px;">成功订单：</span>
              <span class="amount-value" style="color: #67C23A;">{{ successOrders }}</span>
              <span style="margin-left: 20px;">订单总金额：</span>
              <span class="amount-value">¥{{ totalAmount.toFixed(2) }}</span>
              <span style="margin-left: 20px;">总手续费：</span>
              <span class="amount-value" style="color: #E6A23C;">¥{{ totalFee.toFixed(2) }}</span>
              <span style="margin-left: 20px;">总入账金额：</span>
              <span class="amount-value" style="color: #303133;">¥{{ totalIncome.toFixed(2) }}</span>
              <span v-if="multipleSelection.length > 0" style="margin-left: 20px;">已选择：{{ multipleSelection.length }}笔订单</span>
              <span v-if="multipleSelection.length > 0" class="amount-value">¥{{ selectedTotalAmount.toFixed(2) }}</span>
            </div>
            <div class="action-btns">
              <el-button type="success" @click="exportOrders" :disabled="multipleSelection.length === 0">
                <el-icon><Download /></el-icon>
                导出选中订单
              </el-button>
            </div>
          </div>
        </div>
      </el-card>
      
      <!-- 表格区域 -->
      <el-card shadow="never" class="table-card-wrapper">
        <div class="table-area-wrapper">
          <el-table 
            :data="filteredOrderList" 
            style="width: 100%" 
            v-loading="loading" 
            border 
            stripe
            @selection-change="handleSelectionChange"
            :row-class-name="tableRowClassName"
          >
            <el-table-column type="selection" width="55"></el-table-column>
            <el-table-column prop="orderId" label="订单号" width="130" align="center"></el-table-column>
            <el-table-column label="用户信息" width="220">
              <template #default="scope">
                <div class="user-info">
                  <div class="user-nickname">
                    <template v-if="scope.row.userRole === '游客'">
                      <el-tag size="small" type="info">游客</el-tag>
                    </template>
                    <template v-else>
                      {{ scope.row.userNickname }}
                    </template>
                  </div>
                  <div class="user-email">{{ scope.row.userEmail }}</div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="商品信息" min-width="180">
              <template #default="scope">
                <div class="product-info">
                  <div>{{ scope.row.productName }}</div>
                  <el-tag size="small" effect="plain">{{ scope.row.category }}</el-tag>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="originalPrice" label="商品价格" width="100">
              <template #default="scope">
                <div class="price-container">
                  <span class="price">{{ scope.row.originalPrice }}</span>
                  <span v-if="scope.row.payMethod === 'usdt'" class="usdt-price">{{ convertToUSDT(scope.row.originalPrice) }} USDT</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="quantity" label="数量" width="80"></el-table-column>
            <el-table-column prop="totalPrice" label="订单金额" width="100">
              <template #default="scope">
                <div class="price-container">
                  <span class="price">{{ scope.row.totalPrice }}</span>
                  <span v-if="scope.row.payMethod === 'usdt'" class="usdt-price">{{ convertToUSDT(scope.row.totalPrice) }} USDT</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="fee" label="手续费" width="100">
              <template #default="scope">
                <div class="price-container">
                  <span class="fee">{{ scope.row.fee || '¥0.00' }}</span>
                  <span v-if="scope.row.payMethod === 'usdt'" class="usdt-price">{{ convertToUSDT(scope.row.fee || '¥0.00') }} USDT</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="入账金额" width="120">
              <template #default="scope">
                <div class="price-container">
                  <span>{{ calculateIncome(scope.row) }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100" fixed="right" align="center">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="cardInfo" label="卡密信息" min-width="120">
              <template #default="scope">
                <div>
                  <div v-if="scope.row.deliveryMethod === '自动发货' && scope.row.cardId">
                    <span class="card-id">ID: {{ scope.row.cardId }}</span>
                  </div>
                  <el-button link type="primary" @click="viewCardInfo(scope.row)">查看</el-button>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="userRole" label="用户身份/折扣" width="140">
              <template #default="scope">
                <el-tag :type="getUserRoleType(scope.row.userRole)" size="small">
                  {{ scope.row.userRole }} ({{ getUserDiscount(scope.row.userRole) }})
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="支付方式" width="120">
              <template #default="scope">
                <div class="payment-info">
                  <el-tag :type="getPayMethodType(scope.row.payMethod)">
                    {{ getPayMethodLabel(scope.row.payMethod) }}
                  </el-tag>
                  <div class="payment-channel">{{ scope.row.payChannel }}</div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="deliveryMethod" label="发货方式" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.deliveryMethod === '自动发货' ? 'success' : 'info'">
                  {{ scope.row.deliveryMethod }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="创建时间" width="180">
              <template #default="scope">
                {{ scope.row.createTime }}
              </template>
            </el-table-column>
            <el-table-column label="完成时间" width="180">
              <template #default="scope">
                <span v-if="scope.row.completionTime">{{ scope.row.completionTime }}</span>
                <span v-else-if="scope.row.status === '已完成'">-</span>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column prop="remark" label="备注" min-width="120"></el-table-column>
            <el-table-column label="操作" width="120" fixed="right" align="center">
              <template #default="scope">
                <el-dropdown trigger="hover" size="small">
                  <el-button type="primary" size="small">
                    操作
                    <el-icon class="el-icon--right"><arrow-down /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu class="wider-dropdown-menu">
                      <!-- 自动发货 - 已完成 - 退款 -->
                      <el-dropdown-item v-if="scope.row.status === '已完成' && scope.row.deliveryMethod === '自动发货'" @click="handleRefund(scope.row)">
                        退款
                      </el-dropdown-item>
                      
                      <!-- 自动发货 - 已完成 - 重发邮件 -->
                      <el-dropdown-item v-if="scope.row.status === '已完成' && scope.row.deliveryMethod === '自动发货' && scope.row.hasEmail" @click="handleResendEmail(scope.row)">
                        重发邮件
                      </el-dropdown-item>
                      
                      <!-- 自动发货 - 已完成 - 更改卡密信息 -->
                      <el-dropdown-item v-if="scope.row.status === '已完成' && scope.row.deliveryMethod === '自动发货'" @click="handleEditDeliveryInfo(scope.row)">
                        更改卡密信息
                      </el-dropdown-item>
                      
                      <!-- 自动发货 - 已支付 - 发货 -->
                      <el-dropdown-item v-if="scope.row.status === '已支付' && scope.row.deliveryMethod === '自动发货'" @click="handleDeliver(scope.row)">
                        发货
                      </el-dropdown-item>
                      
                      <!-- 自动发货 - 已支付 - 退款 -->
                      <el-dropdown-item v-if="scope.row.status === '已支付' && scope.row.deliveryMethod === '自动发货'" @click="handleRefund(scope.row)">
                        退款
                      </el-dropdown-item>
                      
                      <!-- 自动发货 - 已取消 - 发货 -->
                      <el-dropdown-item v-if="scope.row.status === '已取消' && scope.row.deliveryMethod === '自动发货'" @click="handleDeliver(scope.row)">
                        发货
                      </el-dropdown-item>
                      
                      <!-- 自动发货 - 待支付 - 发货 -->
                      <el-dropdown-item v-if="scope.row.status === '待支付' && scope.row.deliveryMethod === '自动发货'" @click="handleDeliver(scope.row)">
                        发货
                      </el-dropdown-item>
                      
                      <!-- 自动发货 - 已退款 - 无操作项 -->
                      <el-dropdown-item v-if="scope.row.status === '已退款' && scope.row.deliveryMethod === '自动发货'" disabled>
                        无操作项
                      </el-dropdown-item>
                      
                      <!-- 手动发货 - 已完成 - 更改卡密信息 -->
                      <el-dropdown-item v-if="scope.row.status === '已完成' && scope.row.deliveryMethod === '手动发货'" @click="handleEditDeliveryInfo(scope.row)">
                        更改卡密信息
                      </el-dropdown-item>
                      
                      <!-- 手动发货 - 已完成 - 退款 -->
                      <el-dropdown-item v-if="scope.row.status === '已完成' && scope.row.deliveryMethod === '手动发货'" @click="handleRefund(scope.row)">
                        退款
                      </el-dropdown-item>
                      
                      <!-- 手动发货 - 已支付 - 发货 -->
                      <el-dropdown-item v-if="scope.row.status === '已支付' && scope.row.deliveryMethod === '手动发货'" @click="handleDeliver(scope.row)">
                        发货
                      </el-dropdown-item>
                      
                      <!-- 手动发货 - 已支付 - 退款 -->
                      <el-dropdown-item v-if="scope.row.status === '已支付' && scope.row.deliveryMethod === '手动发货'" @click="handleRefund(scope.row)">
                        退款
                      </el-dropdown-item>
                      
                      <!-- 手动发货 - 已取消 - 发货 -->
                      <el-dropdown-item v-if="scope.row.status === '已取消' && scope.row.deliveryMethod === '手动发货'" @click="handleDeliver(scope.row)">
                        发货
                      </el-dropdown-item>
                      
                      <!-- 手动发货 - 待支付 - 发货 -->
                      <el-dropdown-item v-if="scope.row.status === '待支付' && scope.row.deliveryMethod === '手动发货'" @click="handleDeliver(scope.row)">
                        发货
                      </el-dropdown-item>
                      
                      <!-- 手动发货 - 已退款 - 无操作项 -->
                      <el-dropdown-item v-if="scope.row.status === '已退款' && scope.row.deliveryMethod === '手动发货'" disabled>
                        无操作项
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </template>
            </el-table-column>
          </el-table>
          
          <!-- 分页区域 -->
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :background="true"
            ></el-pagination>
          </div>
        </div>
      </el-card>
    </el-card>
    
    <!-- 退款审核对话框 -->
    <el-dialog
      v-model="refundDialogVisible"
      title="订单退款"
      width="500px"
      class="refund-dialog"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <div class="dialog-info-box">
        <div class="info-item">
          <span class="label">订单号：</span>
          <span class="value">{{ refundForm.orderId }}</span>
        </div>
        <div class="info-item">
          <span class="label">商品名称：</span>
          <span class="value">{{ refundForm.productName }}</span>
        </div>
        <div class="info-item">
          <span class="label">退款金额：</span>
          <span class="value price">¥{{ refundForm.refundAmount.toFixed(2) }}</span>
        </div>
        <div class="info-item">
          <span class="label">用户ID：</span>
          <span class="value">{{ refundForm.userId }}</span>
        </div>
      </div>
      
      <el-form :model="refundForm" label-width="80px" :rules="refundRules" ref="refundFormRef">
        <el-form-item label="退款备注" prop="refundRemark">
          <el-input
            v-model="refundForm.refundRemark"
            type="textarea"
            :rows="3"
            placeholder="请输入退款备注信息"
          ></el-input>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="refundDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitRefund">确认退款</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- Edit Order Dialog -->
    <el-dialog
      v-model="editOrderDialogVisible"
      title="编辑订单备注"
      width="500px"
      destroy-on-close
    >
      <el-form v-if="editOrderForm" :model="editOrderForm" label-width="80px" ref="editOrderFormRef">
        <el-form-item label="订单号">
          <el-input v-model="editOrderForm.orderId" disabled />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="editOrderForm.remark" type="textarea" :rows="3" placeholder="请输入订单备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editOrderDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitEditOrderForm">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 发货对话框 -->
    <el-dialog
      v-model="deliverDialogVisible"
      :title="deliverDialogTitle"
      width="500px"
      class="deliver-dialog"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <div class="dialog-info-box">
        <div class="info-item">
          <span class="label">订单号：</span>
          <span class="value">{{ deliverForm.orderId }}</span>
        </div>
        <div class="info-item">
          <span class="label">商品名称：</span>
          <span class="value">{{ deliverForm.productName }}</span>
        </div>
        <div class="info-item">
          <span class="label">商品分类：</span>
          <span class="value">{{ deliverForm.category }}</span>
        </div>
        <div class="info-item">
          <span class="label">购买数量：</span>
          <span class="value">{{ deliverForm.quantity }}</span>
        </div>
      </div>
      
      <el-form :model="deliverForm" label-width="80px" :rules="deliverRules" ref="deliverFormRef">
        <el-form-item label="成本价" v-if="deliverForm.deliveryMethod !== '自动发货'">
          <el-input-number 
            v-model="deliverForm.costPrice" 
            :precision="2" 
            :step="0.01" 
            :min="0" 
            style="width: 100%;"
            placeholder="请输入成本价"
          ></el-input-number>
        </el-form-item>
        
        <!-- 自动发货模式下显示成本价 -->
        <el-form-item label="成本价" v-if="deliverForm.deliveryMethod === '自动发货'">
          <div class="auto-cost-price">
            <span v-if="deliverForm.selectedCardIds && deliverForm.selectedCardIds.length > 0">¥{{ deliverForm.costPrice.toFixed(2) }}</span>
            <span v-else class="select-card-tip">选择卡密后自动获取</span>
          </div>
        </el-form-item>
        
        <!-- 显示当前卡密信息，仅在编辑模式下显示 -->
        <el-form-item label="当前卡密" v-if="isEditingDeliveryInfo">
          <div v-if="deliverForm.quantity === 1" class="current-card-display">
            <div class="current-card-title">卡密ID: {{ deliverForm.cardId }}</div>
            <div class="current-card-content">{{ deliverForm.currentCardInfo }}</div>
          </div>
          <div v-else class="current-multiple-cards-display">
            <div class="current-card-title">当前共 {{ deliverForm.quantity }} 个卡密</div>
            
            <!-- 如果卡密数量大于5个，提供下载按钮 -->
            <div v-if="deliverForm.quantity > 5" class="card-actions">
              <el-button size="small" type="primary" plain @click="downloadCurrentCardInfo">
                <el-icon><Download /></el-icon>下载全部卡密信息
              </el-button>
            </div>
            
            <!-- 卡密信息内容区 -->
            <div v-if="deliverForm.quantity <= 5 && deliverForm.multipleCardInfo && deliverForm.multipleCardInfo.length > 0">
              <div v-for="(card, index) in deliverForm.multipleCardInfo" :key="index" class="multiple-card-item">
                <div class="card-item-title">卡密 {{ index + 1 }} - ID: {{ card.cardId || '未指定' }}</div>
                <div class="card-item-content">{{ card.cardInfo }}</div>
              </div>
            </div>
            <div v-else-if="deliverForm.quantity > 5 && deliverForm.multipleCardInfo && deliverForm.multipleCardInfo.length > 0">
              <el-tabs v-model="activeCardTab" type="card">
                <el-tab-pane 
                  v-for="(card, index) in deliverForm.multipleCardInfo" 
                  :key="index" 
                  :label="`卡密 ${index + 1}`" 
                  :name="String(index)"
                >
                  <div class="card-item-title">卡密 {{ index + 1 }} - ID: {{ card.cardId || '未指定' }}</div>
                  <div class="card-item-content">{{ card.cardInfo }}</div>
                </el-tab-pane>
              </el-tabs>
            </div>
            <div v-else class="card-item-content">
              {{ deliverForm.currentCardInfo }}
            </div>
          </div>
        </el-form-item>
        
        <!-- 修改卡密信息输入方式 - 单卡密情况 -->
        <el-form-item 
          label="卡密信息" 
          prop="cardInfo" 
          v-if="deliverForm.deliveryMethod !== '自动发货' && !isEditingDeliveryInfo && deliverForm.quantity === 1">
          <el-input
            v-model="deliverForm.cardInfo"
            type="textarea"
            :rows="4"
            placeholder="请输入卡密信息"
          ></el-input>
        </el-form-item>
        
        <!-- 修改卡密信息输入方式 - 少量多卡密情况 (2-5个) -->
        <template v-if="deliverForm.deliveryMethod !== '自动发货' && !isEditingDeliveryInfo && deliverForm.quantity > 1 && deliverForm.quantity <= 5">
          <div class="multiple-cards-container">
            <div class="multiple-cards-title">卡密信息 (共需 {{ deliverForm.quantity }} 个)</div>
            <div v-for="(card, index) in deliverForm.multipleCardInfo" :key="index" class="multiple-card-form-item">
              <div class="card-index">卡密 {{ index + 1 }}</div>
              <el-input
                v-model="deliverForm.multipleCardInfo[index].cardInfo"
                type="textarea"
                :rows="3"
                :placeholder="`请输入第 ${index + 1} 个卡密信息`"
              ></el-input>
            </div>
          </div>
        </template>
        
        <!-- 修改卡密信息输入方式 - 大量多卡密情况 (>5个) -->
        <template v-if="deliverForm.deliveryMethod !== '自动发货' && !isEditingDeliveryInfo && deliverForm.quantity > 5">
          <div class="multiple-cards-container">
            <div class="multiple-cards-title">卡密信息 (共需 {{ deliverForm.quantity }} 个)</div>
            
            <!-- 批量操作区域 -->
            <div class="batch-operations">
              <el-button type="primary" plain @click="showBatchImportDialog">
                <el-icon><Upload /></el-icon>批量导入卡密
              </el-button>
              <el-button type="success" plain @click="generateAllCards">
                <el-icon><RefreshRight /></el-icon>一键生成所有卡密
              </el-button>
            </div>
            
            <!-- 使用选项卡分组显示卡密输入框 -->
            <el-tabs v-model="activeCardTab" type="card">
              <el-tab-pane 
                v-for="(card, index) in deliverForm.multipleCardInfo" 
                :key="index" 
                :label="`卡密 ${index + 1}`" 
                :name="String(index)"
              >
                <div class="card-index">卡密 {{ index + 1 }}</div>
                <el-input
                  v-model="deliverForm.multipleCardInfo[index].cardInfo"
                  type="textarea"
                  :rows="3"
                  :placeholder="`请输入第 ${index + 1} 个卡密信息`"
                ></el-input>
              </el-tab-pane>
            </el-tabs>
            
            <!-- 快速导航区 -->
            <div class="quick-navigation">
              <el-pagination
                small
                :page-size="1"
                layout="prev, pager, next"
                :total="deliverForm.quantity"
                :current-page="Number(activeCardTab) + 1"
                @current-change="handleCardPageChange"
              ></el-pagination>
              <div class="completed-info">
                已填写 {{ getCompletedCardCount() }} / {{ deliverForm.quantity }} 个卡密
              </div>
            </div>
          </div>
        </template>
        
        <!-- 在编辑模式下为非自动发货类型添加新卡密信息输入 - 单卡密 -->
        <el-form-item 
          label="新卡密信息(选填)" 
          prop="cardInfo" 
          v-if="deliverForm.deliveryMethod !== '自动发货' && isEditingDeliveryInfo && deliverForm.quantity === 1">
          <el-input
            v-model="deliverForm.cardInfo"
            type="textarea"
            :rows="4"
            placeholder="请输入新的卡密信息（可选）"
          ></el-input>
        </el-form-item>
        
        <!-- 在编辑模式下为非自动发货类型添加新卡密信息输入 - 少量多卡密 (2-5个) -->
        <template v-if="deliverForm.deliveryMethod !== '自动发货' && isEditingDeliveryInfo && deliverForm.quantity > 1 && deliverForm.quantity <= 5">
          <div class="multiple-cards-container">
            <div class="multiple-cards-title">新卡密信息 (可选)</div>
            <div v-for="(card, index) in deliverForm.multipleCardInfo" :key="index" class="multiple-card-form-item">
              <div class="card-index">卡密 {{ index + 1 }}</div>
              <el-input
                v-model="deliverForm.multipleCardInfo[index].newCardInfo"
                type="textarea"
                :rows="3"
                :placeholder="`请输入第 ${index + 1} 个新卡密信息（可选）`"
              ></el-input>
            </div>
          </div>
        </template>
        
        <!-- 在编辑模式下为非自动发货类型添加新卡密信息输入 - 大量多卡密 (>5个) -->
        <template v-if="deliverForm.deliveryMethod !== '自动发货' && isEditingDeliveryInfo && deliverForm.quantity > 5">
          <div class="multiple-cards-container">
            <div class="multiple-cards-title">新卡密信息 (可选)</div>
            
            <!-- 批量操作区域 -->
            <div class="batch-operations">
              <el-button type="primary" plain @click="showBatchImportDialog">
                <el-icon><Upload /></el-icon>批量导入新卡密
              </el-button>
              <el-button type="success" plain @click="generateAllCards">
                <el-icon><RefreshRight /></el-icon>一键生成所有新卡密
              </el-button>
            </div>
            
            <!-- 使用选项卡分组显示卡密输入框 -->
            <el-tabs v-model="activeEditCardTab" type="card">
              <el-tab-pane 
                v-for="(card, index) in deliverForm.multipleCardInfo" 
                :key="index" 
                :label="`卡密 ${index + 1}`" 
                :name="`edit_${index}`"
              >
                <div class="card-index">卡密 {{ index + 1 }}</div>
                <el-input
                  v-model="deliverForm.multipleCardInfo[index].newCardInfo"
                  type="textarea"
                  :rows="3"
                  :placeholder="`请输入第 ${index + 1} 个新卡密信息（可选）`"
                ></el-input>
              </el-tab-pane>
            </el-tabs>
            
            <!-- 快速导航区 -->
            <div class="quick-navigation">
              <el-pagination
                small
                :page-size="1"
                layout="prev, pager, next"
                :total="deliverForm.quantity"
                :current-page="Number(activeEditCardTab.replace('edit_', '')) + 1"
                @current-change="handleEditCardPageChange"
              ></el-pagination>
              <div class="completed-info">
                已填写 {{ getCompletedNewCardCount() }} / {{ deliverForm.quantity }} 个新卡密
              </div>
            </div>
          </div>
        </template>
        
        <!-- 添加卡密选择功能 - 单卡密 -->
        <el-form-item 
          label="选择卡密" 
          prop="selectedCardId" 
          v-if="deliverForm.deliveryMethod === '自动发货' && !isEditingDeliveryInfo && deliverForm.quantity === 1">
          <el-select 
            v-model="deliverForm.selectedCardId" 
            filterable 
            placeholder="请选择未售出的卡密" 
            style="width: 100%;"
            @change="handleCardSelect"
          >
            <el-option
              v-for="card in availableCards"
              :key="card.cardId"
              :label="card.cardId"
              :value="card.cardId"
            >
              <div class="card-option">
                <div class="card-id">ID: {{ card.cardId }}</div>
                <div class="card-batch" v-if="card.batchId">批次: {{ card.batchId }}</div>
              </div>
            </el-option>
          </el-select>
          <div class="card-preview" v-if="deliverForm.selectedCardId">
            <div class="card-preview-title">卡密预览:</div>
            <div class="card-preview-content">{{ getSelectedCardInfo() }}</div>
          </div>
        </el-form-item>
        
        <!-- 添加卡密选择功能 - 少量多卡密 (2-5个) -->
        <template v-if="deliverForm.deliveryMethod === '自动发货' && !isEditingDeliveryInfo && deliverForm.quantity > 1 && deliverForm.quantity <= 5">
          <div class="multiple-cards-container">
            <div class="multiple-cards-title">选择卡密 (共需 {{ deliverForm.quantity }} 个)</div>
            <div v-for="(card, index) in deliverForm.multipleCardInfo" :key="index" class="multiple-card-form-item">
              <div class="card-index">卡密 {{ index + 1 }}</div>
              <el-select 
                v-model="deliverForm.multipleCardInfo[index].selectedCardId" 
                filterable 
                placeholder="请选择未售出的卡密" 
                style="width: 100%;"
                @change="(value) => handleMultipleCardSelect(value, index)"
              >
                <el-option
                  v-for="card in getAvailableCardsForIndex(index)"
                  :key="card.cardId"
                  :label="card.cardId"
                  :value="card.cardId"
                >
                  <div class="card-option">
                    <div class="card-id">ID: {{ card.cardId }}</div>
                    <div class="card-batch" v-if="card.batchId">批次: {{ card.batchId }}</div>
                  </div>
                </el-option>
              </el-select>
              <div class="card-preview" v-if="deliverForm.multipleCardInfo[index].selectedCardId">
                <div class="card-preview-title">卡密 {{ index + 1 }} 预览:</div>
                <div class="card-preview-content">{{ getSelectedMultipleCardInfo(index) }}</div>
              </div>
            </div>
          </div>
        </template>
        
        <!-- 添加卡密选择功能 - 大量多卡密 (>5个) -->
        <template v-if="deliverForm.deliveryMethod === '自动发货' && !isEditingDeliveryInfo && deliverForm.quantity > 5">
          <div class="multiple-cards-container">
            <div class="multiple-cards-title">选择卡密 (共需 {{ deliverForm.quantity }} 个)</div>
            
            <!-- 批量操作区域 -->
            <div class="batch-operations">
              <el-button type="primary" plain @click="showBatchSelectDialog">
                <el-icon><Select /></el-icon>批量选择卡密
              </el-button>
              <el-button type="success" plain @click="autoSelectAllCards">
                <el-icon><Checked /></el-icon>智能匹配全部卡密
              </el-button>
            </div>
            
            <!-- 使用选项卡分组显示卡密选择框 -->
            <el-tabs v-model="activeSelectCardTab" type="card">
              <el-tab-pane 
                v-for="(card, index) in deliverForm.multipleCardInfo" 
                :key="index" 
                :label="`卡密 ${index + 1}`" 
                :name="`select_${index}`"
              >
                <div class="card-index">卡密 {{ index + 1 }}</div>
                <el-select 
                  v-model="deliverForm.multipleCardInfo[index].selectedCardId" 
                  filterable 
                  placeholder="请选择未售出的卡密" 
                  style="width: 100%;"
                  @change="(value) => handleMultipleCardSelect(value, index)"
                >
                  <el-option
                    v-for="card in getAvailableCardsForIndex(index)"
                    :key="card.cardId"
                    :label="card.cardId"
                    :value="card.cardId"
                  >
                    <div class="card-option">
                      <div class="card-id">ID: {{ card.cardId }}</div>
                      <div class="card-batch" v-if="card.batchId">批次: {{ card.batchId }}</div>
                    </div>
                  </el-option>
                </el-select>
                <div class="card-preview" v-if="deliverForm.multipleCardInfo[index].selectedCardId">
                  <div class="card-preview-title">卡密 {{ index + 1 }} 预览:</div>
                  <div class="card-preview-content">{{ getSelectedMultipleCardInfo(index) }}</div>
                </div>
              </el-tab-pane>
            </el-tabs>
            
            <!-- 快速导航区 -->
            <div class="quick-navigation">
              <el-pagination
                small
                :page-size="1"
                layout="prev, pager, next"
                :total="deliverForm.quantity"
                :current-page="Number(activeSelectCardTab.replace('select_', '')) + 1"
                @current-change="handleSelectCardPageChange"
              ></el-pagination>
              <div class="completed-info">
                已选择 {{ getSelectedCardCount() }} / {{ deliverForm.quantity }} 个卡密
              </div>
            </div>
          </div>
        </template>
        
        <!-- 添加新卡密选择功能，仅在自动发货且编辑模式时显示 - 单卡密 -->
        <el-form-item 
          label="更改为" 
          prop="selectedCardId" 
          v-if="deliverForm.deliveryMethod === '自动发货' && isEditingDeliveryInfo && deliverForm.quantity === 1">
          <el-select 
            v-model="deliverForm.selectedCardId" 
            filterable 
            placeholder="请选择新的卡密" 
            style="width: 100%;"
            @change="handleCardSelect"
          >
            <el-option
              v-for="card in availableCards"
              :key="card.cardId"
              :label="card.cardId"
              :value="card.cardId"
            >
              <div class="card-option">
                <div class="card-id">ID: {{ card.cardId }}</div>
                <div class="card-batch" v-if="card.batchId">批次: {{ card.batchId }}</div>
              </div>
            </el-option>
          </el-select>
          <div class="card-preview" v-if="deliverForm.selectedCardId">
            <div class="card-preview-title">新卡密预览:</div>
            <div class="card-preview-content">{{ getSelectedCardInfo() }}</div>
          </div>
        </el-form-item>
        
        <!-- 添加新卡密选择功能 - 少量多卡密 (2-5个) -->
        <template v-if="deliverForm.deliveryMethod === '自动发货' && isEditingDeliveryInfo && deliverForm.quantity > 1 && deliverForm.quantity <= 5">
          <div class="multiple-cards-container">
            <div class="multiple-cards-title">更改卡密 (选择需要更改的卡密)</div>
            <div v-for="(card, index) in deliverForm.multipleCardInfo" :key="index" class="multiple-card-form-item">
              <div class="card-index">卡密 {{ index + 1 }}</div>
              <el-select 
                v-model="deliverForm.multipleCardInfo[index].selectedCardId" 
                filterable 
                placeholder="请选择新的卡密" 
                style="width: 100%;"
                @change="(value) => handleMultipleCardSelect(value, index)"
              >
                <el-option
                  v-for="card in getAvailableCardsForIndex(index)"
                  :key="card.cardId"
                  :label="card.cardId"
                  :value="card.cardId"
                >
                  <div class="card-option">
                    <div class="card-id">ID: {{ card.cardId }}</div>
                    <div class="card-batch" v-if="card.batchId">批次: {{ card.batchId }}</div>
                  </div>
                </el-option>
              </el-select>
              <div class="card-preview" v-if="deliverForm.multipleCardInfo[index].selectedCardId">
                <div class="card-preview-title">新卡密 {{ index + 1 }} 预览:</div>
                <div class="card-preview-content">{{ getSelectedMultipleCardInfo(index) }}</div>
              </div>
            </div>
          </div>
        </template>
        
        <!-- 添加新卡密选择功能 - 大量多卡密 (>5个) -->
        <template v-if="deliverForm.deliveryMethod === '自动发货' && isEditingDeliveryInfo && deliverForm.quantity > 5">
          <div class="multiple-cards-container">
            <div class="multiple-cards-title">更改卡密 (选择需要更改的卡密)</div>
            
            <!-- 批量操作区域 -->
            <div class="batch-operations">
              <el-button type="primary" plain @click="showBatchSelectDialog">
                <el-icon><Select /></el-icon>批量选择新卡密
              </el-button>
              <el-button type="success" plain @click="autoSelectAllCards">
                <el-icon><Checked /></el-icon>智能匹配全部新卡密
              </el-button>
            </div>
            
            <!-- 使用选项卡分组显示卡密选择框 -->
            <el-tabs v-model="activeEditSelectCardTab" type="card">
              <el-tab-pane 
                v-for="(card, index) in deliverForm.multipleCardInfo" 
                :key="index" 
                :label="`卡密 ${index + 1}`" 
                :name="`edit_select_${index}`"
              >
                <div class="card-index">卡密 {{ index + 1 }}</div>
                <el-select 
                  v-model="deliverForm.multipleCardInfo[index].selectedCardId" 
                  filterable 
                  placeholder="请选择新的卡密" 
                  style="width: 100%;"
                  @change="(value) => handleMultipleCardSelect(value, index)"
                >
                  <el-option
                    v-for="card in getAvailableCardsForIndex(index)"
                    :key="card.cardId"
                    :label="card.cardId"
                    :value="card.cardId"
                  >
                    <div class="card-option">
                      <div class="card-id">ID: {{ card.cardId }}</div>
                      <div class="card-batch" v-if="card.batchId">批次: {{ card.batchId }}</div>
                    </div>
                  </el-option>
                </el-select>
                <div class="card-preview" v-if="deliverForm.multipleCardInfo[index].selectedCardId">
                  <div class="card-preview-title">新卡密 {{ index + 1 }} 预览:</div>
                  <div class="card-preview-content">{{ getSelectedMultipleCardInfo(index) }}</div>
                </div>
              </el-tab-pane>
            </el-tabs>
            
            <!-- 快速导航区 -->
            <div class="quick-navigation">
              <el-pagination
                small
                :page-size="1"
                layout="prev, pager, next"
                :total="deliverForm.quantity"
                :current-page="Number(activeEditSelectCardTab.replace('edit_select_', '')) + 1"
                @current-change="handleEditSelectCardPageChange"
              ></el-pagination>
              <div class="completed-info">
                已选择 {{ getSelectedNewCardCount() }} / {{ deliverForm.quantity }} 个新卡密
              </div>
            </div>
          </div>
        </template>
        
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="deliverForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入发货备注信息（选填）"
          ></el-input>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="deliverDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitDeliverForm">{{ isEditingDeliveryInfo ? '确认更改' : '确认发货' }}</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 添加批量导入卡密弹窗 -->
    <el-dialog
      v-model="batchImportDialogVisible"
      title="批量导入卡密"
      width="600px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <div class="batch-import-info">
        <p>请按照以下格式输入多个卡密信息，每行一个卡密：</p>
        <p class="format-example">格式示例：卡密ID####卡密账号####卡密密码####其他信息</p>
      </div>
      
      <el-input
        v-model="batchImportContent"
        type="textarea"
        :rows="10"
        placeholder="请输入多个卡密信息，每行一个"
      ></el-input>
      
      <div class="batch-import-tips">
        <p>说明：</p>
        <ol>
          <li>系统将自动解析每行内容为一个卡密</li>
          <li>如不指定卡密ID，系统将自动生成</li>
          <li>最多可一次性导入 {{ deliverForm.quantity }} 个卡密</li>
        </ol>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="batchImportDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="importBatchCards">确认导入</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 添加批量选择卡密弹窗 -->
    <el-dialog
      v-model="batchSelectDialogVisible"
      title="批量选择卡密"
      width="800px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <div class="batch-select-info">
        <p>请选择批次或筛选条件：</p>
      </div>
      
      <div class="batch-filter-form">
        <el-form :inline="true">
          <el-form-item label="卡密批次">
            <el-select v-model="batchSelectFilter.batchId" placeholder="请选择批次" clearable>
              <el-option 
                v-for="batch in availableBatches" 
                :key="batch.id" 
                :label="batch.name" 
                :value="batch.id" 
              />
            </el-select>
          </el-form-item>
          <el-form-item label="成本价区间">
            <el-input-number v-model="batchSelectFilter.minCost" :precision="2" :step="0.01" :min="0" placeholder="最低价"></el-input-number>
            <span class="range-separator">至</span>
            <el-input-number v-model="batchSelectFilter.maxCost" :precision="2" :step="0.01" :min="0" placeholder="最高价"></el-input-number>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="filterBatchCards">筛选</el-button>
            <el-button @click="resetBatchFilter">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <!-- 卡密列表 -->
      <el-table
        ref="batchSelectTable"
        :data="filteredBatchCards"
        style="width: 100%"
        border
        @selection-change="handleBatchSelectionChange"
        height="350px"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="cardId" label="卡密ID" width="120" />
        <el-table-column prop="batchId" label="批次" width="100" />
        <el-table-column prop="cost" label="成本价" width="80">
          <template #default="scope">
            {{ scope.row.cost.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="cardInfo" label="卡密信息" show-overflow-tooltip />
      </el-table>
      
      <div class="batch-selection-info">
        <div class="info-text">已选择 {{ selectedBatchCards.length }} 个卡密，最多可选 {{ deliverForm.quantity }} 个</div>
        <div class="info-cost">
          总成本: ¥{{ getTotalBatchSelectCost().toFixed(2) }}
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="batchSelectDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmBatchCardSelect" :disabled="selectedBatchCards.length === 0">确认选择</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Download, ArrowDown, Check, Delete, View, Warning, Money, Message, Edit, Upload, RefreshRight, Select } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { orderList as externalOrderList, productOptions as externalProductOptions, type OrderItem, type RefundInfo } from '@/data/orderData.js'

// 搜索表单
const searchForm = reactive({
  orderId: '',
  userInfo: '',
  category: '',
  payMethod: '',
  deliveryMethod: '',
  status: '',
  userRole: '',
  createDateRange: [] as string[],
  completionDateRange: [] as string[],
  payChannel: '',
  channelName: ''
})

// 商品选项 - Use from external file
const productOptions = externalProductOptions

// 表格数据 - Use from external file
const orderList = ref<OrderItem[]>([]) // Initialize as empty, will be populated
const allOrderList = ref<OrderItem[]>([]) // This will hold the initial full list from external data

// Dialog states and forms
const editOrderDialogVisible = ref(false)
const editOrderFormRef = ref<FormInstance>()
const editOrderForm = ref<Partial<OrderItem>>({ id: '', remark: '' }) // Allow partial updates, focusing on remark

// Populate orderList and allOrderList from external data onMounted
onMounted(() => {
  // Assuming externalOrderList is a ref from the .js file
  const rawExternalData = externalOrderList.value || [] 
  orderList.value = JSON.parse(JSON.stringify(rawExternalData)); // Deep copy for local manipulation
  allOrderList.value = JSON.parse(JSON.stringify(rawExternalData)); // Deep copy for original dataset
  handleSearch() // Initial filter/display
  // Initialize total for pagination
  total.value = filteredOrderList.value.length;
  addDemoOrder()
})

// 查询
const handleSearch = () => {
  loading.value = true
  
  // 模拟搜索操作
  setTimeout(() => {
    // 更新分页相关数据
    total.value = filteredOrderList.value.length
    loading.value = false
  }, 500)
}

// 添加一个新的变量来存储筛选后的订单数据
const filteredOrderList = computed(() => {
  let result = [...allOrderList.value]
  
  if (searchForm.orderId) {
    result = result.filter(item => item.orderId.includes(searchForm.orderId))
  }
  
  if (searchForm.userInfo) {
    result = result.filter(item => 
      item.userNickname.toLowerCase().includes(searchForm.userInfo.toLowerCase()) || 
      item.userEmail.toLowerCase().includes(searchForm.userInfo.toLowerCase())
    )
  }
  
  if (searchForm.category) {
    result = result.filter(item => item.category === searchForm.category)
  }
  
  if (searchForm.payMethod) {
    result = result.filter(item => item.payMethod === searchForm.payMethod)
  }
  
  if (searchForm.payChannel) {
    result = result.filter(item => item.payChannel === searchForm.payChannel)
  }
  
  if (searchForm.channelName) {
    result = result.filter(item => item.channelName === searchForm.channelName)
  }
  
  if (searchForm.deliveryMethod) {
    result = result.filter(item => item.deliveryMethod === searchForm.deliveryMethod)
  }
  
  if (searchForm.status) {
    result = result.filter(item => item.status === searchForm.status)
  }
  
  if (searchForm.userRole) {
    result = result.filter(item => item.userRole === searchForm.userRole)
  }
  
  if (searchForm.createDateRange && searchForm.createDateRange.length === 2) {
    const startDate = new Date(searchForm.createDateRange[0])
    const endDate = new Date(searchForm.createDateRange[1])
    endDate.setHours(23, 59, 59, 999) // 设置为当天结束时间
    
    result = result.filter(item => {
      const createTime = new Date(item.createTime)
      return createTime >= startDate && createTime <= endDate
    })
  }
  
  if (searchForm.completionDateRange && searchForm.completionDateRange.length === 2) {
    const startDate = new Date(searchForm.completionDateRange[0])
    const endDate = new Date(searchForm.completionDateRange[1])
    endDate.setHours(23, 59, 59, 999) // 设置为当天结束时间
    
    result = result.filter(item => {
      if (!item.completionTime) return false
      const completionTime = new Date(item.completionTime)
      return completionTime >= startDate && completionTime <= endDate
    })
  }
  
  return result
})

// 计算筛选后的总订单数
const totalOrders = computed(() => {
  return filteredOrderList.value.length
})

// 计算筛选后的成功订单数（状态为"已完成"的订单）
const successOrders = computed(() => {
  return filteredOrderList.value.filter(order => order.status === '已完成').length
})

// 计算筛选后的总金额
const totalAmount = computed(() => {
  return filteredOrderList.value.reduce((sum, order) => {
    const price = parseFloat(order.totalPrice.replace('¥', ''))
    return sum + (isNaN(price) ? 0 : price)
  }, 0)
})

// 计算筛选后的总手续费
const totalFee = computed(() => {
  return filteredOrderList.value.reduce((sum, order) => {
    const fee = parseFloat((order.fee || '¥0.00').replace('¥', ''))
    return sum + (isNaN(fee) ? 0 : fee)
  }, 0)
})

// 计算筛选后的总入账金额
const totalIncome = computed(() => {
  return totalAmount.value - totalFee.value
})

// 计算选中的订单总金额
const selectedTotalAmount = computed(() => {
  return multipleSelection.value.reduce((sum, order) => {
    const price = parseFloat(order.totalPrice.replace('¥', ''))
    return sum + (isNaN(price) ? 0 : price)
  }, 0)
})

// 多选相关
const multipleSelection = ref<OrderItem[]>([])
const handleSelectionChange = (selection: OrderItem[]) => {
  multipleSelection.value = selection
}

// 修改导出订单功能，区分是否有选中订单
const exportOrders = () => {
  // 确定要导出的订单列表
  if (multipleSelection.value.length === 0) {
    ElMessage.warning('请先选择要导出的订单')
    return
  }
  
  // 创建CSV内容
  let csvContent = '订单号,商品名称,商品分类,数量,总价,手续费,入账金额,用户信息,支付方式,支付通道,发货方式,订单状态,创建时间,完成时间\n'
  
  multipleSelection.value.forEach(order => {
    csvContent += `"${order.orderId}","${order.productName}","${order.category}",${order.quantity},"${order.totalPrice}","${order.fee || '¥0.00'}","${calculateIncome(order)}","${order.userNickname} (${order.userEmail})","${getPayMethodLabel(order.payMethod)}","${order.payChannel}","${order.deliveryMethod}","${order.status}","${order.createTime}","${order.completionTime || ''}"\n`
  })
  
  // 创建Blob对象
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  
  // 创建下载链接
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  // 设置下载属性
  link.setAttribute('href', url)
  const fileName = `选中订单_${new Date().toISOString().split('T')[0]}.csv`
  link.setAttribute('download', fileName)
  link.style.visibility = 'hidden'
  
  // 添加到文档并触发点击
  document.body.appendChild(link)
  link.click()
  
  // 清理
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  
  ElMessage.success(`成功导出选中订单数据`)
}

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)
const loading = ref(false)

// 退款对话框相关
const refundDialogVisible = ref(false)
const refundFormRef = ref<FormInstance>()
const refundForm = reactive({
  id: '',
  orderId: '',
  productName: '',
  userId: '',
  totalPrice: 0,
  refundAmount: 0,
  refundRemark: '',
  refundTime: ''
})

// 退款表单验证规则
const refundRules = reactive<FormRules>({
  refundRemark: [
    { required: true, message: '请输入退款备注', trigger: 'blur' }
  ]
})

// 获取商品分类对应的标签类型
const getCategoryTag = (category: string) => {
  const categoryMap: Record<string, string> = {
    '谷歌邮箱': 'danger',
    '微软邮箱': 'primary',
    'Instagram账号': 'warning',
    'Twitter账号': 'info',
    'Facebook账号': 'success',
    'Discord账号': 'warning',
    'ChatGPT账号': 'danger',
    '其他账号': 'info'
  }
  return categoryMap[category] || 'info'
}

// 获取状态对应的标签类型
const getStatusType = (status: string) => {
  switch (status) {
    case '待付款':
      return 'warning'
    case '待发货':
      return 'primary'
    case '已完成':
      return 'success'
    case '已退款':
      return 'danger'
    case '已取消':
      return 'info'
    case '发货失败':
      return 'danger'
    default:
      return 'info'
  }
}

// 重置
const resetSearch = () => {
  searchForm.orderId = ''
  searchForm.userInfo = ''
  searchForm.category = ''
  searchForm.payMethod = ''
  searchForm.deliveryMethod = ''
  searchForm.status = ''
  searchForm.userRole = ''
  searchForm.createDateRange = []
  searchForm.completionDateRange = []
  searchForm.payChannel = ''
  searchForm.channelName = ''
  
  // 重置后重新查询
  handleSearch()
}

// 查看
const handleView = (row: any) => {
  // 构建退款信息显示
  const refundInfoHtml = row.refundInfo ? `
    <h4>退款信息</h4>
    <div class="detail-section">
      <div class="detail-item">
        <span class="label">退款金额：</span>
        <span class="price">¥${row.refundInfo.refundAmount.toFixed(2)}</span>
      </div>
      <div class="detail-item">
        <span class="label">退款时间：</span>
        <span>${row.refundInfo.refundTime}</span>
      </div>
    </div>
  ` : '';

  ElMessageBox.alert(`
    <div class="order-detail">
      <h4>订单信息</h4>
      <div class="detail-section">
        <div class="detail-item">
          <span class="label">订单号：</span>
          <span>${row.orderId}</span>
        </div>
        <div class="detail-item">
          <span class="label">创建时间：</span>
          <span>${row.createTime}</span>
        </div>
        ${row.status === '已完成' ? `
        <div class="detail-item">
          <span class="label">完成时间：</span>
          <span>${row.completionTime || '-'}</span>
        </div>` : ''}
        <div class="detail-item">
          <span class="label">订单状态：</span>
          <span><el-tag size="small" :type="getStatusType(row.status)">${row.status}</el-tag></span>
        </div>
      </div>
      
      <h4>商品信息</h4>
      <div class="detail-section">
        <div class="detail-item">
          <span class="label">商品名称：</span>
          <span>${row.productName}</span>
        </div>
        <div class="detail-item">
          <span class="label">商品分类：</span>
          <span><el-tag size="small" :type="getCategoryTag(row.category)">${row.category}</el-tag></span>
        </div>
        <div class="detail-item">
          <span class="label">数量：</span>
          <span>${row.quantity}</span>
        </div>
        <div class="detail-item">
          <span class="label">总价：</span>
          <span class="price">${row.totalPrice}</span>
        </div>
        <div class="detail-item">
          <span class="label">手续费：</span>
          <span class="fee">{{ row.fee || '¥0.00' }}</span>
        </div>
        ${row.costPrice !== undefined ? `
        <div class="detail-item">
          <span class="label">成本价：</span>
          <span class="cost-price">¥${row.costPrice.toFixed(2)}</span>
        </div>` : ''}
        <div class="detail-item">
          <span class="label">发货方式：</span>
          <span><el-tag size="small" :type="row.deliveryMethod === '自动发货' ? 'success' : 'info'">${row.deliveryMethod}</el-tag></span>
        </div>
      </div>
      
      <h4>卡密信息</h4>
      <div class="detail-section">
        ${row.deliveryMethod === '自动发货' ? `
        <div class="detail-item">
          <span class="label">卡密ID：</span>
          <span class="card-id-value">${row.cardId || '暂无'}</span>
        </div>` : ''}
        <div class="detail-item account-info">
          <span class="label">卡密详情：</span>
          <pre>${row.cardInfo || '暂无'}</pre>
        </div>
      </div>
      
      <h4>用户信息</h4>
      <div class="detail-section">
        <div class="detail-item">
          <span class="label">用户昵称：</span>
          <span>${row.userRole === '游客' ? '<el-tag size="small" type="info">游客</el-tag>' : row.userNickname}</span>
        </div>
        <div class="detail-item">
          <span class="label">用户邮箱：</span>
          <span>${row.userEmail}</span>
        </div>
        <div class="detail-item">
          <span class="label">用户身份：</span>
          <span><el-tag size="small" effect="plain" :type="getUserRoleType(row.userRole)">
            ${row.userRole}
          </el-tag></span>
        </div>
        <div class="detail-item">
          <span class="label">支付方式：</span>
          <span><el-tag size="small" effect="plain" :type="getPayMethodType(row.payMethod)">
            {{ getPayMethodLabel(row.payMethod) }}
          </el-tag></span>
        </div>
        <div class="detail-item">
          <span class="label">支付通道：</span>
          <span><el-tag size="small" effect="plain" type="info">
            {{ row.payChannel }}
          </el-tag></span>
        </div>
      </div>
      
      ${refundInfoHtml}
    </div>`,
    '订单详情',
    {
      dangerouslyUseHTMLString: true,
      confirmButtonText: '关闭',
      customClass: 'order-detail-dialog'
    }
  )
}

// 发货对话框相关
const deliverDialogVisible = ref(false)
const deliverDialogTitle = ref('订单发货')
const deliverFormRef = ref<FormInstance>()
const isEditingDeliveryInfo = ref(false)

// 可用卡密列表，这里模拟数据
const availableCards = ref([
  { cardId: 'CARD001', cardInfo: 'username001@gmail.com----password001----recovery001@example.com', batchId: 'BATCH001', cost: 10.00, status: 'available' },
  { cardId: 'CARD002', cardInfo: 'username002@gmail.com----password002----recovery002@example.com', batchId: 'BATCH001', cost: 10.00, status: 'available' },
  { cardId: 'CARD003', cardInfo: 'username003@gmail.com----password003----recovery003@example.com', batchId: 'BATCH002', cost: 12.50, status: 'available' },
  { cardId: 'CARD004', cardInfo: 'instagram_user001----password001----recovery001@example.com', batchId: 'BATCH003', cost: 25.00, status: 'available' },
  { cardId: 'CARD005', cardInfo: 'twitter_user001----password001----recovery001@example.com', batchId: 'BATCH004', cost: 20.00, status: 'available' }
])

// 发货表单
const deliverForm = reactive({
  id: '',
  orderId: '',
  productName: '',
  category: '',
  cardInfo: '',
  cardId: '',
  costPrice: 0,
  remark: '',
  deliveryMethod: '',
  selectedCardId: '',
  currentCardInfo: '', // 添加当前卡密信息属性
  quantity: 1, // 添加数量属性
  multipleCardInfo: [] as Array<{
    cardId?: string;
    cardInfo?: string;
    selectedCardId?: string;
    newCardInfo?: string;
    costPrice?: number;
  }>, // 添加多卡密信息
  selectedCardIds: [] as string[] // 添加多卡密ID列表
})

// 根据选中的卡密ID获取卡密信息
const getSelectedCardInfo = () => {
  const selectedCard = availableCards.value.find(card => card.cardId === deliverForm.selectedCardId)
  return selectedCard ? selectedCard.cardInfo : ''
}

// 获取特定索引卡密的信息
const getSelectedMultipleCardInfo = (index: number) => {
  if (!deliverForm.multipleCardInfo[index] || !deliverForm.multipleCardInfo[index].selectedCardId) {
    return '';
  }
  
  const selectedCard = availableCards.value.find(
    card => card.cardId === deliverForm.multipleCardInfo[index].selectedCardId
  );
  return selectedCard ? selectedCard.cardInfo : '';
}

// 获取特定索引可用的卡密列表（排除已选择的卡密）
const getAvailableCardsForIndex = (currentIndex: number) => {
  // 获取所有已被选择的卡密ID，排除当前索引的卡密
  const selectedIds = deliverForm.multipleCardInfo
    .map((card, idx) => idx !== currentIndex ? card.selectedCardId : null)
    .filter(id => id !== undefined && id !== null) as string[];
  
  // 返回排除了已选择卡密的列表
  return availableCards.value.filter(card => !selectedIds.includes(card.cardId));
}

// 处理卡密选择
const handleCardSelect = (cardId: string) => {
  const selectedCard = availableCards.value.find(card => card.cardId === cardId)
  if (selectedCard) {
    deliverForm.cardInfo = selectedCard.cardInfo
    deliverForm.cardId = selectedCard.cardId
    deliverForm.costPrice = selectedCard.cost
  }
}

// 处理多卡密选择
const handleMultipleCardSelect = (cardId: string, index: number) => {
  const selectedCard = availableCards.value.find(card => card.cardId === cardId)
  if (selectedCard && deliverForm.multipleCardInfo[index]) {
    deliverForm.multipleCardInfo[index].cardInfo = selectedCard.cardInfo
    deliverForm.multipleCardInfo[index].cardId = selectedCard.cardId
    deliverForm.multipleCardInfo[index].costPrice = selectedCard.cost
    
    // 更新总成本
    updateTotalCost()
  }
}

// 更新总成本价
const updateTotalCost = () => {
  if (deliverForm.quantity > 1 && deliverForm.multipleCardInfo.length > 0) {
    // 计算所有卡密的成本总和
    deliverForm.costPrice = deliverForm.multipleCardInfo.reduce(
      (total, card) => total + (card.costPrice || 0), 
      0
    )
    
    // 更新选中的卡密ID列表
    deliverForm.selectedCardIds = deliverForm.multipleCardInfo
      .filter(card => card.selectedCardId)
      .map(card => card.selectedCardId as string)
  }
}

// 发货表单验证规则
const deliverRules = reactive<FormRules>({
  costPrice: [
    { 
      required: true, 
      message: '请输入成本价', 
      trigger: 'blur',
      validator: (rule, value, callback) => {
        // 只在非自动发货时验证
        if (deliverForm.deliveryMethod !== '自动发货') {
          if (!value && value !== 0) {
            callback(new Error('请输入成本价'))
          } else if (typeof value !== 'number') {
            callback(new Error('成本价必须为数字'))
          } else {
            callback()
          }
        } else {
          callback()
        }
      }
    }
  ],
  cardInfo: [
    { 
      required: false, 
      message: '请输入卡密信息', 
      trigger: 'blur',
      validator: (rule, value, callback) => {
        // 只在非编辑模式且非自动发货时验证，编辑模式下新卡密信息为选填
        if (!isEditingDeliveryInfo.value && deliverForm.deliveryMethod !== '自动发货') {
          if (!value) {
            callback(new Error('请输入卡密信息'))
          } else {
            callback()
          }
        } else {
          // 编辑模式下新卡密信息为选填，直接通过验证
          callback()
        }
      }
    }
  ],
  selectedCardId: [
    { 
      required: true, 
      message: '请选择卡密', 
      trigger: 'change',
      validator: (rule, value, callback) => {
        // 只在自动发货且不是编辑模式时验证
        if (deliverForm.deliveryMethod === '自动发货' && !isEditingDeliveryInfo.value) {
          if (!value) {
            callback(new Error('请选择卡密'))
          } else {
            callback()
          }
        } else {
          callback()
        }
      }
    }
  ]
})

// 修改发货处理函数，使用弹窗表单
const handleDeliver = (row: any) => {
  deliverForm.id = row.id
  deliverForm.orderId = row.orderId
  deliverForm.productName = row.productName
  deliverForm.category = row.category
  deliverForm.deliveryMethod = row.deliveryMethod
  deliverForm.selectedCardId = ''
  deliverForm.quantity = row.quantity || 1
  deliverForm.selectedCardIds = []
  
  // 初始化多卡密信息数组
  if (row.quantity > 1) {
    // 清空现有数据
    deliverForm.multipleCardInfo = []
    
    // 创建数组，长度与购买数量一致
    for (let i = 0; i < row.quantity; i++) {
      deliverForm.multipleCardInfo.push({
        cardId: '',
        cardInfo: '',
        selectedCardId: '',
        newCardInfo: '',
        costPrice: 0
      })
    }
  }
  
  // 如果是非自动发货，则生成卡密信息和ID
  if (row.deliveryMethod !== '自动发货') {
    if (row.quantity === 1) {
      const generatedCard = generateCardInfo(row.category, row.productName)
      deliverForm.cardInfo = generatedCard.cardInfo
      deliverForm.cardId = generatedCard.cardId
    } else {
      // 为每个卡密生成信息
      for (let i = 0; i < row.quantity; i++) {
        const generatedCard = generateCardInfo(row.category, row.productName)
        if (deliverForm.multipleCardInfo[i]) {
          deliverForm.multipleCardInfo[i].cardInfo = generatedCard.cardInfo
          deliverForm.multipleCardInfo[i].cardId = generatedCard.cardId
        }
      }
    }
  } else {
    deliverForm.cardInfo = ''
    deliverForm.cardId = ''
  }
  
  deliverForm.costPrice = 0
  deliverForm.remark = ''
  
  // 重置对话框标题和编辑状态
  deliverDialogTitle.value = '订单发货'
  isEditingDeliveryInfo.value = false
  deliverDialogVisible.value = true
}

// 添加编辑卡密信息的处理函数
const handleEditDeliveryInfo = (row: any) => {
  // 复用发货表单
  deliverForm.id = row.id
  deliverForm.orderId = row.orderId
  deliverForm.productName = row.productName
  deliverForm.category = row.category
  deliverForm.costPrice = row.costPrice || 0
  deliverForm.remark = row.remark || ''
  deliverForm.deliveryMethod = row.deliveryMethod
  deliverForm.quantity = row.quantity || 1
  
  // 初始化单卡密或多卡密信息
  if (row.quantity === 1) {
    deliverForm.cardInfo = row.cardInfo || ''
    deliverForm.cardId = row.cardId || ''  // 添加当前卡密ID
    deliverForm.currentCardInfo = row.cardInfo || '' // 保存当前卡密信息
  } else {
    // 初始化多卡密信息
    deliverForm.multipleCardInfo = []
    
    // 如果row中有多卡密信息，则使用它
    if (row.multipleCardInfo && row.multipleCardInfo.length > 0) {
      deliverForm.multipleCardInfo = JSON.parse(JSON.stringify(row.multipleCardInfo))
    } else {
      // 否则创建临时的多卡密信息（模拟数据）
      for (let i = 0; i < row.quantity; i++) {
        const cardId = `${row.cardId || 'CARD'}-${i+1}`
        const cardInfo = row.cardInfo ? `${row.cardInfo}\n[卡密 ${i+1}]` : `[卡密 ${i+1} 信息未提供]`
        
        deliverForm.multipleCardInfo.push({
          cardId: cardId,
          cardInfo: cardInfo,
          selectedCardId: '',
          newCardInfo: '',
          costPrice: row.costPrice ? row.costPrice / row.quantity : 0
        })
      }
    }
  }
  
  // 更改对话框标题
  deliverDialogTitle.value = '编辑卡密信息'
  isEditingDeliveryInfo.value = true
  deliverDialogVisible.value = true
}

// 修改提交发货表单函数
const submitDeliverForm = async () => {
  if (!deliverFormRef.value) return
  
  await deliverFormRef.value.validate((valid, fields) => {
    if (valid) {
      // 获取订单
      const index = orderList.value.findIndex(item => item.id === deliverForm.id)
      if (index !== -1) {
        // 如果是编辑模式，更新卡密信息和成本价
        if (isEditingDeliveryInfo.value) {
          // 单卡密场景
          if (deliverForm.quantity === 1) {
            // 如果是自动发货模式且选择了新卡密
            if (deliverForm.deliveryMethod === '自动发货' && deliverForm.selectedCardId) {
              const selectedCard = availableCards.value.find(card => card.cardId === deliverForm.selectedCardId)
              if (selectedCard) {
                // 更新卡密信息和ID
                orderList.value[index].cardInfo = selectedCard.cardInfo
                orderList.value[index].cardId = selectedCard.cardId
                orderList.value[index].costPrice = selectedCard.cost
                
                // 在实际应用中，这里应该将原卡密标记为可用，新卡密标记为已售出
                ElMessage.success(`订单 ${deliverForm.orderId} 卡密信息已更新为新卡密 ${selectedCard.cardId}`)
              }
            } else if (deliverForm.deliveryMethod !== '自动发货') {
              // 手动发货模式，只有在用户输入了新卡密信息时才更新
              if (deliverForm.cardInfo) {
                orderList.value[index].cardInfo = deliverForm.cardInfo
                ElMessage.success(`订单 ${deliverForm.orderId} 卡密信息已更新`)
              }
              
              // 成本价总是更新
              orderList.value[index].costPrice = deliverForm.costPrice
            }
          }
          // 多卡密场景
          else if (deliverForm.quantity > 1) {
            // 更新多卡密信息
            orderList.value[index].multipleCardInfo = JSON.parse(JSON.stringify(deliverForm.multipleCardInfo))
            
            // 如果是自动发货模式
            if (deliverForm.deliveryMethod === '自动发货') {
              const updatedCardIds = deliverForm.multipleCardInfo
                .filter(card => card.selectedCardId)
                .map(card => card.selectedCardId as string)
              
              if (updatedCardIds.length > 0) {
                // 在实际应用中，这里应该将新卡密标记为已售出
                orderList.value[index].costPrice = deliverForm.costPrice
                ElMessage.success(`订单 ${deliverForm.orderId} 的 ${updatedCardIds.length} 个卡密已更新`)
              }
            } 
            // 手动发货模式
            else {
              // 检查是否有卡密被更新
              const updatedCardCount = deliverForm.multipleCardInfo.filter(card => card.newCardInfo).length
              
              if (updatedCardCount > 0) {
                // 更新卡密信息
                deliverForm.multipleCardInfo.forEach((card, i) => {
                  if (card.newCardInfo) {
                    orderList.value[index].multipleCardInfo[i].cardInfo = card.newCardInfo
                  }
                })
                
                ElMessage.success(`订单 ${deliverForm.orderId} 的 ${updatedCardCount} 个卡密信息已更新`)
              }
              
              // 总成本价更新
              orderList.value[index].costPrice = deliverForm.costPrice
            }
          }
          
          // 如果有备注，更新订单备注
          if (deliverForm.remark) {
            orderList.value[index].remark = deliverForm.remark
          }
          
          // 更新在allOrderList中的数据
          const allIndex = allOrderList.value.findIndex(item => item.id === deliverForm.id)
          if (allIndex !== -1) {
            // 复制相同的更新操作到 allOrderList
            if (deliverForm.quantity === 1) {
              if (deliverForm.deliveryMethod === '自动发货' && deliverForm.selectedCardId) {
                const selectedCard = availableCards.value.find(card => card.cardId === deliverForm.selectedCardId)
                if (selectedCard) {
                  allOrderList.value[allIndex].cardInfo = selectedCard.cardInfo
                  allOrderList.value[allIndex].cardId = selectedCard.cardId
                  allOrderList.value[allIndex].costPrice = selectedCard.cost
                }
              } else if (deliverForm.deliveryMethod !== '自动发货') {
                if (deliverForm.cardInfo) {
                  allOrderList.value[allIndex].cardInfo = deliverForm.cardInfo
                }
                allOrderList.value[allIndex].costPrice = deliverForm.costPrice
              }
            } else if (deliverForm.quantity > 1) {
              // 复制多卡密更新
              allOrderList.value[allIndex].multipleCardInfo = JSON.parse(JSON.stringify(orderList.value[index].multipleCardInfo))
              allOrderList.value[allIndex].costPrice = orderList.value[index].costPrice
            }
            
            if (deliverForm.remark) {
              allOrderList.value[allIndex].remark = deliverForm.remark
            }
          }
          
          // 如果没有更新卡密信息但更新了其他信息，也显示成功提示
          if (deliverForm.deliveryMethod !== '自动发货' && 
              deliverForm.quantity === 1 && 
              !deliverForm.cardInfo) {
            ElMessage.success(`订单 ${deliverForm.orderId} 信息已更新`)
          }
        } else {
          // 原有的发货逻辑 - 单卡密
          if (deliverForm.quantity === 1) {
            orderList.value[index].status = '已完成'
            orderList.value[index].cardInfo = deliverForm.cardInfo
            orderList.value[index].cardId = deliverForm.cardId
            orderList.value[index].costPrice = deliverForm.costPrice
            
            // 如果是自动发货，将选中的卡密标记为已售出
            if (deliverForm.deliveryMethod === '自动发货' && deliverForm.selectedCardId) {
              const cardIndex = availableCards.value.findIndex(card => card.cardId === deliverForm.selectedCardId)
              if (cardIndex !== -1) {
                availableCards.value[cardIndex].status = 'sold'
                // 在实际应用中，这里应该调用API更新卡密状态
              }
            }
          }
          // 多卡密发货逻辑
          else if (deliverForm.quantity > 1) {
            orderList.value[index].status = '已完成'
            orderList.value[index].multipleCardInfo = JSON.parse(JSON.stringify(deliverForm.multipleCardInfo))
            orderList.value[index].costPrice = deliverForm.costPrice
            
            // 如果是自动发货，将选中的多个卡密标记为已售出
            if (deliverForm.deliveryMethod === '自动发货') {
              deliverForm.multipleCardInfo.forEach(card => {
                if (card.selectedCardId) {
                  const cardIndex = availableCards.value.findIndex(c => c.cardId === card.selectedCardId)
                  if (cardIndex !== -1) {
                    availableCards.value[cardIndex].status = 'sold'
                  }
                }
              })
            }
          }
          
          // 如果有备注，添加到订单备注中
          if (deliverForm.remark) {
            orderList.value[index].remark = deliverForm.remark
          }
          
          // 更新在allOrderList中的数据
          const allIndex = allOrderList.value.findIndex(item => item.id === deliverForm.id)
          if (allIndex !== -1) {
            allOrderList.value[allIndex].status = '已完成'
            
            if (deliverForm.quantity === 1) {
              allOrderList.value[allIndex].cardInfo = deliverForm.cardInfo
              allOrderList.value[allIndex].cardId = deliverForm.cardId
              allOrderList.value[allIndex].costPrice = deliverForm.costPrice
            } else {
              allOrderList.value[allIndex].multipleCardInfo = JSON.parse(JSON.stringify(deliverForm.multipleCardInfo))
              allOrderList.value[allIndex].costPrice = deliverForm.costPrice
            }
            
            if (deliverForm.remark) {
              allOrderList.value[allIndex].remark = deliverForm.remark
            }
          }
          
          ElMessage.success(`订单 ${deliverForm.orderId} 发货成功`)
        }
        
        deliverDialogVisible.value = false
      }
    } else {
      console.log('验证失败', fields)
    }
  })
}

// 分页大小变化
const handleSizeChange = (val: number) => {
  pageSize.value = val
  // 重新加载数据
  handleSearch()
}

// 当前页变化
const handleCurrentChange = (val: number) => {
  currentPage.value = val
  // 重新加载数据
  handleSearch()
}

// 在script部分添加新的方法
const viewCardInfo = (row: any) => {
  let cardTitle = '卡密信息';
  if (row.cardId && row.deliveryMethod === '自动发货') {
    cardTitle = `卡密信息 (ID: ${row.cardId})`;
  }
  ElMessageBox.alert(row.cardInfo, cardTitle, {
    confirmButtonText: '确定'
  })
}

// 添加重发邮件功能
const handleResendEmail = (row: any) => {
  ElMessageBox.confirm(
    `确定要重发订单 ${row.orderId} 的邮件通知吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info',
    }
  )
    .then(() => {
      // 模拟邮件发送处理
      setTimeout(() => {
        ElMessage({
          type: 'success',
          message: `订单 ${row.orderId} 的邮件已重新发送`,
        })
      }, 500)
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '已取消操作',
      })
    })
}

// 修改退款处理函数，可对任何非已退款状态的订单执行
const handleRefund = (row: any) => {
  refundForm.id = row.id
  refundForm.orderId = row.orderId
  refundForm.productName = row.productName
  refundForm.userId = row.id.substring(1)
  refundForm.totalPrice = parseFloat(row.totalPrice.replace('¥', ''))
  refundForm.refundAmount = refundForm.totalPrice
  
  // 添加假数据
  const now = new Date()
  refundForm.refundTime = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).replace(/\//g, '-')
  
  // 根据不同商品类型设置不同的退款说明
  if (row.category === '谷歌邮箱') {
    refundForm.refundRemark = '账号无法正常登录，提示安全验证'
  } else if (row.category === 'Instagram账号' || row.category === 'Facebook账号' || row.category === 'Twitter账号') {
    refundForm.refundRemark = '账号登录后显示已被平台限制使用'
  } else if (row.category === 'ChatGPT账号') {
    refundForm.refundRemark = '账号无法使用高级功能，与商品描述不符'
  } else {
    refundForm.refundRemark = '客户表示不再需要此账号'
  }
  
  refundDialogVisible.value = true
}

// 修改提交退款审核结果函数
const submitRefund = async () => {
  if (!refundFormRef.value) return
  
  await refundFormRef.value.validate((valid, fields) => {
    if (valid) {
      // 获取订单
      const index = orderList.value.findIndex(item => item.id === refundForm.id)
      if (index !== -1) {
        // 更新订单状态为已退款
        orderList.value[index].status = '已退款'
        // 更新退款信息
        orderList.value[index].refundInfo = {
          refundAmount: refundForm.refundAmount,
          refundRemark: refundForm.refundRemark,
          refundTime: refundForm.refundTime
        }
        ElMessage.success(`订单 ${refundForm.orderId} 已退款成功`)
      }
      
      refundDialogVisible.value = false
    } else {
      console.log('表单验证失败', fields)
    }
  })
}

// 修改导出所有订单的方法
const exportAllOrders = () => {
  // 导出所有订单
  if (allOrderList.value.length === 0) {
    ElMessage.warning('没有可导出的订单数据')
    return
  }
  
  // 创建CSV内容
  let csvContent = '订单号,商品名称,商品分类,数量,总价,手续费,入账金额,用户信息,支付方式,支付通道,发货方式,订单状态,创建时间,完成时间\n'
  
  allOrderList.value.forEach(order => {
    csvContent += `"${order.orderId}","${order.productName}","${order.category}",${order.quantity},"${order.totalPrice}","${order.fee || '¥0.00'}","${calculateIncome(order)}","${order.userNickname} (${order.userEmail})","${getPayMethodLabel(order.payMethod)}","${order.payChannel}","${order.deliveryMethod}","${order.status}","${order.createTime}","${order.completionTime || ''}"\n`
  })
  
  // 创建Blob对象
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  
  // 创建下载链接
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  // 设置下载属性
  link.setAttribute('href', url)
  const fileName = `全部订单_${new Date().toISOString().split('T')[0]}.csv`
  link.setAttribute('download', fileName)
  link.style.visibility = 'hidden'
  
  // 添加到文档并触发点击
  document.body.appendChild(link)
  link.click()
  
  // 清理
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  
  ElMessage.success('成功导出全部订单数据')
}

// 在script部分添加以下函数
const getPayMethodType = (method: string) => {
  const typeMap: Record<string, string> = {
    'usdt': 'danger',
    'wechat': 'success',
    'alipay': 'primary'
  }
  return typeMap[method] || 'danger'
}

const getPayMethodLabel = (method: string) => {
  const labelMap: Record<string, string> = {
    'usdt': 'USDT',
    'wechat': '微信',
    'alipay': '支付宝'
  }
  return labelMap[method] || 'USDT'
}

// 添加 USDT 转换函数
const convertToUSDT = (price: string): string => {
  // 移除人民币符号并转换为数字
  const numPrice = parseFloat(price.replace('¥', ''))
  // 假设汇率为 1 CNY = 0.14 USDT
  const usdtPrice = (numPrice * 0.14).toFixed(2)
  return usdtPrice
}

// 获取用户角色对应的标签类型
const getUserRoleType = (role: string) => {
  switch (role) {
    case '超级会员':
      return 'danger'
    case 'vip3':
      return 'warning'
    case 'vip2':
      return 'success'
    case 'vip1':
      return 'primary'
    default:
      return 'info'
  }
}

// 获取用户折扣信息
const getUserDiscount = (role: string) => {
  switch (role) {
    case '超级会员':
      return '80%'
    case 'vip3':
      return '85%'
    case 'vip2':
      return '90%'
    case 'vip1':
      return '95%'
    case '普通用户':
      return '90%'
    default:
      return '100%'
  }
}

// 添加 calculateIncome 方法，计算入账金额 = 总价 - 手续费
const calculateIncome = (row: any): string => {
  const totalPrice = parseFloat(row.totalPrice.replace('¥', ''))
  const fee = parseFloat((row.fee || '¥0.00').replace('¥', ''))
  const income = totalPrice - fee
  return '¥' + income.toFixed(2)
}

// Handlers for new dialogs
const handleEditOrder = (row: OrderItem) => {
  // Only copy relevant fields for editing to avoid unintended modifications
  editOrderForm.value = { 
    id: row.id, 
    orderId: row.orderId, // For display in form
    remark: row.remark || '' 
  };
  editOrderDialogVisible.value = true;
};

const submitEditOrderForm = async () => {
  if (!editOrderFormRef.value) return;
  try {
    const valid = await editOrderFormRef.value.validate();
    if (valid && editOrderForm.value.id) {
      const orderIndex = orderList.value.findIndex(o => o.id === editOrderForm.value.id);
      if (orderIndex !== -1) {
        orderList.value[orderIndex].remark = editOrderForm.value.remark;
        // Also update in allOrderList if you want changes to persist across unfiltered data
        const allOrderIndex = allOrderList.value.findIndex(o => o.id === editOrderForm.value.id);
        if (allOrderIndex !== -1) {
          allOrderList.value[allOrderIndex].remark = editOrderForm.value.remark;
        }
        ElMessage.success('备注更新成功');
        editOrderDialogVisible.value = false;
      } else {
        ElMessage.error('未找到订单');
      }
    } else {
      ElMessage.error('表单验证失败');
    }
  } catch (error) {
    console.error("Error submitting edit order form:", error);
    ElMessage.error('更新备注失败');
  }
};

  // 自动生成卡密信息的函数
const generateCardInfo = (category: string, productName: string) => {
  // 根据不同类型的产品生成不同的卡密信息
  const cardId = Math.floor(10000 + Math.random() * 90000).toString() // 生成5位数字ID
  
  if (category.includes('邮箱')) {
    // 生成随机字符串作为账号
    const randomChars = Math.random().toString(36).substring(2, 10)
    const email = `user_${randomChars}@${category.includes('谷歌') ? 'gmail' : 'outlook'}.com`
    const password = `Pass_${Math.random().toString(36).substring(2, 10)}`
    return {
      cardId,
      cardInfo: `账号：${email}\n密码：${password}\n卡密ID：${cardId}`
    }
  } else if (category.includes('账号')) {
    // 生成随机字符串作为用户名
    const randomChars = Math.random().toString(36).substring(2, 10)
    const username = `user_${randomChars}`
    const password = `Pass_${Math.random().toString(36).substring(2, 10)}`
    return {
      cardId,
      cardInfo: `账号：${username}\n密码：${password}\n平台：${category}\n注册日期：${new Date().toISOString().split('T')[0]}`
    }
  } else {
    return {
      cardId,
      cardInfo: `卡密ID：${cardId}\n使用说明：登录官网 example.com 使用此卡密激活账号\n有效期：1年`
    }
  }
}

// 添加示例订单数据，覆盖所有流程图中的状态
const addDemoOrder = () => {
  // 清空现有订单数据，以便展示所有流程图中的状态
  orderList.value = []
  allOrderList.value = []
  
  // 1. 自动发货 - 填写邮箱 - 已完成
  orderList.value.push({
    id: 'DEMO001',
    orderId: 'P20240501001',
    productName: 'Gmail邮箱账号 - 高级版',
    category: '谷歌邮箱',
    originalPrice: '¥15.99',
    purchasePrice: '¥15.00',
    quantity: 1,
    totalPrice: '¥15.99',
    fee: '¥0.50',
    status: '已完成',
    cardInfo: 'username123@gmail.com----password123----recovery@example.com',
    cardId: 'CARD20240501001',
    userNickname: '自动发货填邮箱完成',
    userEmail: 'user1@example.com',
    userRole: '普通用户',
    payMethod: 'alipay',
    payChannel: 'k4',
    channelName: 'K4',
    deliveryMethod: '自动发货',
    createTime: '2024-05-01 10:00:00',
    completionTime: '2024-05-01 10:05:00',
    remark: '已填写邮箱的已完成订单',
    refundInfo: undefined,
    hasEmail: true
  })
  
  // 2. 自动发货 - 填写邮箱 - 已支付
  orderList.value.push({
    id: 'DEMO002',
    orderId: 'P20240501002',
    productName: 'Gmail邮箱账号 - 标准版',
    category: '谷歌邮箱',
    originalPrice: '¥12.99',
    purchasePrice: '¥12.00',
    quantity: 2,
    totalPrice: '¥25.98',
    fee: '¥0.80',
    status: '已支付',
    cardInfo: '',
    cardId: '',
    userNickname: '自动发货填邮箱已支付',
    userEmail: 'user2@example.com',
    userRole: '普通用户',
    payMethod: 'wechat',
    payChannel: 'speedzf',
    channelName: 'speedzf',
    deliveryMethod: '自动发货',
    createTime: '2024-05-01 11:00:00',
    completionTime: '',
    remark: '已填写邮箱的已支付订单，待发货',
    refundInfo: undefined,
    hasEmail: true
  })
  
  // 3. 自动发货 - 填写邮箱 - 已取消
  orderList.value.push({
    id: 'DEMO003',
    orderId: 'P20240501003',
    productName: 'Gmail邮箱账号 - 基础版',
    category: '谷歌邮箱',
    originalPrice: '¥9.99',
    purchasePrice: '¥9.00',
    quantity: 1,
    totalPrice: '¥9.99',
    fee: '¥0.30',
    status: '已取消',
    cardInfo: '',
    cardId: '',
    userNickname: '自动发货填邮箱已取消',
    userEmail: 'user3@example.com',
    userRole: '普通用户',
    payMethod: 'alipay',
    payChannel: 'k4',
    channelName: 'K4',
    deliveryMethod: '自动发货',
    createTime: '2024-05-01 12:00:00',
    completionTime: '',
    remark: '已填写邮箱的已取消订单',
    refundInfo: null,
    hasEmail: true
  })
  
  // 4. 自动发货 - 填写邮箱 - 待支付
  orderList.value.push({
    id: 'DEMO004',
    orderId: 'P20240501004',
    productName: 'Gmail邮箱账号 - 入门版',
    category: '谷歌邮箱',
    originalPrice: '¥7.99',
    purchasePrice: '¥7.00',
    quantity: 1,
    totalPrice: '¥7.99',
    fee: '¥0.20',
    status: '待支付',
    cardInfo: '',
    cardId: '',
    userNickname: '自动发货填邮箱待支付',
    userEmail: 'user4@example.com',
    userRole: '普通用户',
    payMethod: 'wechat',
    payChannel: 'speedzf',
    channelName: 'speedzf',
    deliveryMethod: '自动发货',
    createTime: '2024-05-01 13:00:00',
    completionTime: '',
    remark: '已填写邮箱的待支付订单',
    refundInfo: null,
    hasEmail: true
  })
  
  // 5. 自动发货 - 填写邮箱 - 已退款
  orderList.value.push({
    id: 'DEMO005',
    orderId: 'P20240501005',
    productName: 'Gmail邮箱账号 - 豪华版',
    category: '谷歌邮箱',
    originalPrice: '¥19.99',
    purchasePrice: '¥18.00',
    quantity: 1,
    totalPrice: '¥19.99',
    fee: '¥0.60',
    status: '已退款',
    cardInfo: '',
    cardId: '',
    userNickname: '自动发货填邮箱已退款',
    userEmail: 'user5@example.com',
    userRole: '普通用户',
    payMethod: 'usdt',
    payChannel: 'k4',
    channelName: 'K4',
    deliveryMethod: '自动发货',
    createTime: '2024-05-01 14:00:00',
    completionTime: '',
    remark: '已填写邮箱的已退款订单',
    refundInfo: {
      refundAmount: 19.99,
      refundRemark: '用户申请退款，已处理',
      refundTime: '2024-05-01 15:00:00'
    },
    hasEmail: true
  })
  
  // 6. 自动发货 - 未填写邮箱 - 已完成
  orderList.value.push({
    id: 'DEMO006',
    orderId: 'P20240502001',
    productName: 'Instagram账号 - 高级版',
    category: 'Instagram账号',
    originalPrice: '¥39.99',
    purchasePrice: '¥35.00',
    quantity: 1,
    totalPrice: '¥39.99',
    fee: '¥1.00',
    status: '已完成',
    cardInfo: 'instagram_user123----password123----recovery@example.com',
    cardId: 'CARD20240502001',
    userNickname: '自动发货未填邮箱完成',
    userEmail: '',
    userRole: '普通用户',
    payMethod: 'alipay',
    payChannel: 'k4',
    channelName: 'K4',
    deliveryMethod: '自动发货',
    createTime: '2024-05-02 10:00:00',
    completionTime: '2024-05-02 10:05:00',
    remark: '未填写邮箱的已完成订单',
    refundInfo: null,
    hasEmail: false
  })
  
  // 7. 自动发货 - 未填写邮箱 - 已支付
  orderList.value.push({
    id: 'DEMO007',
    orderId: 'P20240502002',
    productName: 'Instagram账号 - 标准版',
    category: 'Instagram账号',
    originalPrice: '¥29.99',
    purchasePrice: '¥25.00',
    quantity: 1,
    totalPrice: '¥29.99',
    fee: '¥0.90',
    status: '已支付',
    cardInfo: '',
    cardId: '',
    userNickname: '自动发货未填邮箱已支付',
    userEmail: '',
    userRole: '普通用户',
    payMethod: 'wechat',
    payChannel: 'speedzf',
    channelName: 'speedzf',
    deliveryMethod: '自动发货',
    createTime: '2024-05-02 11:00:00',
    completionTime: '',
    remark: '未填写邮箱的已支付订单，待发货',
    refundInfo: null,
    hasEmail: false
  })
  
  // 8. 自动发货 - 未填写邮箱 - 已取消
  orderList.value.push({
    id: 'DEMO008',
    orderId: 'P20240502003',
    productName: 'Instagram账号 - 基础版',
    category: 'Instagram账号',
    originalPrice: '¥19.99',
    purchasePrice: '¥18.00',
    quantity: 1,
    totalPrice: '¥19.99',
    fee: '¥0.60',
    status: '已取消',
    cardInfo: '',
    cardId: '',
    userNickname: '自动发货未填邮箱已取消',
    userEmail: '',
    userRole: '普通用户',
    payMethod: 'alipay',
    payChannel: 'k4',
    channelName: 'K4',
    deliveryMethod: '自动发货',
    createTime: '2024-05-02 12:00:00',
    completionTime: '',
    remark: '未填写邮箱的已取消订单',
    refundInfo: null,
    hasEmail: false
  })
  
  // 9. 自动发货 - 未填写邮箱 - 待支付
  orderList.value.push({
    id: 'DEMO009',
    orderId: 'P20240502004',
    productName: 'Instagram账号 - 入门版',
    category: 'Instagram账号',
    originalPrice: '¥15.99',
    purchasePrice: '¥14.00',
    quantity: 1,
    totalPrice: '¥15.99',
    fee: '¥0.50',
    status: '待支付',
    cardInfo: '',
    cardId: '',
    userNickname: '自动发货未填邮箱待支付',
    userEmail: '',
    userRole: '普通用户',
    payMethod: 'wechat',
    payChannel: 'speedzf',
    channelName: 'speedzf',
    deliveryMethod: '自动发货',
    createTime: '2024-05-02 13:00:00',
    completionTime: '',
    remark: '未填写邮箱的待支付订单',
    refundInfo: null,
    hasEmail: false
  })
  
  // 10. 自动发货 - 未填写邮箱 - 已退款
  orderList.value.push({
    id: 'DEMO010',
    orderId: 'P20240502005',
    productName: 'Instagram账号 - 豪华版',
    category: 'Instagram账号',
    originalPrice: '¥49.99',
    purchasePrice: '¥45.00',
    quantity: 1,
    totalPrice: '¥49.99',
    fee: '¥1.50',
    status: '已退款',
    cardInfo: '',
    cardId: '',
    userNickname: '自动发货未填邮箱已退款',
    userEmail: '',
    userRole: '普通用户',
    payMethod: 'usdt',
    payChannel: 'k4',
    channelName: 'K4',
    deliveryMethod: '自动发货',
    createTime: '2024-05-02 14:00:00',
    completionTime: '',
    remark: '未填写邮箱的已退款订单',
    refundInfo: {
      refundAmount: 49.99,
      refundRemark: '用户申请退款，已处理',
      refundTime: '2024-05-02 15:00:00'
    },
    hasEmail: false
  })
  
  // 11. 手动发货 - 填写邮箱 - 已完成
  orderList.value.push({
    id: 'DEMO011',
    orderId: 'P20240503001',
    productName: 'Twitter账号 - 高级版',
    category: 'Twitter账号',
    originalPrice: '¥59.99',
    purchasePrice: '¥55.00',
    quantity: 1,
    totalPrice: '¥59.99',
    fee: '¥1.80',
    status: '已完成',
    cardInfo: 'twitter_user123----password123----recovery@example.com',
    cardId: 'CARD20240503001',
    userNickname: '手动发货填邮箱完成',
    userEmail: 'user11@example.com',
    userRole: '普通用户',
    payMethod: 'alipay',
    payChannel: 'k4',
    channelName: 'K4',
    deliveryMethod: '手动发货',
    createTime: '2024-05-03 10:00:00',
    completionTime: '2024-05-03 10:30:00',
    remark: '已填写邮箱的已完成订单',
    refundInfo: null,
    hasEmail: true
  })
  
  // 12. 手动发货 - 填写邮箱 - 已支付
  orderList.value.push({
    id: 'DEMO012',
    orderId: 'P20240503002',
    productName: 'Twitter账号 - 标准版',
    category: 'Twitter账号',
    originalPrice: '¥49.99',
    purchasePrice: '¥45.00',
    quantity: 2,
    totalPrice: '¥99.98',
    fee: '¥3.00',
    status: '已支付',
    cardInfo: '',
    cardId: '',
    userNickname: '手动发货填邮箱已支付',
    userEmail: 'user12@example.com',
    userRole: '普通用户',
    payMethod: 'wechat',
    payChannel: 'speedzf',
    channelName: 'speedzf',
    deliveryMethod: '手动发货',
    createTime: '2024-05-03 11:00:00',
    completionTime: '',
    remark: '已填写邮箱的已支付订单，待发货',
    refundInfo: undefined,
    hasEmail: true
  })
  
  // 13. 手动发货 - 填写邮箱 - 已取消
  orderList.value.push({
    id: 'DEMO013',
    orderId: 'P20240503003',
    productName: 'Twitter账号 - 基础版',
    category: 'Twitter账号',
    originalPrice: '¥39.99',
    purchasePrice: '¥35.00',
    quantity: 1,
    totalPrice: '¥39.99',
    fee: '¥1.20',
    status: '已取消',
    cardInfo: '',
    cardId: '',
    userNickname: '手动发货填邮箱已取消',
    userEmail: 'user13@example.com',
    userRole: '普通用户',
    payMethod: 'alipay',
    payChannel: 'k4',
    channelName: 'K4',
    deliveryMethod: '手动发货',
    createTime: '2024-05-03 12:00:00',
    completionTime: '',
    remark: '已填写邮箱的已取消订单',
    refundInfo: null,
    hasEmail: true
  })
  
  // 14. 手动发货 - 填写邮箱 - 待支付
  orderList.value.push({
    id: 'DEMO014',
    orderId: 'P20240503004',
    productName: 'Twitter账号 - 入门版',
    category: 'Twitter账号',
    originalPrice: '¥29.99',
    purchasePrice: '¥25.00',
    quantity: 1,
    totalPrice: '¥29.99',
    fee: '¥0.90',
    status: '待支付',
    cardInfo: '',
    cardId: '',
    userNickname: '手动发货填邮箱待支付',
    userEmail: 'user14@example.com',
    userRole: '普通用户',
    payMethod: 'wechat',
    payChannel: 'speedzf',
    channelName: 'speedzf',
    deliveryMethod: '手动发货',
    createTime: '2024-05-03 13:00:00',
    completionTime: '',
    remark: '已填写邮箱的待支付订单',
    refundInfo: null,
    hasEmail: true
  })
  
  // 15. 手动发货 - 未填写邮箱 - 已退款
  orderList.value.push({
    id: 'DEMO015',
    orderId: 'P20240503005',
    productName: 'Twitter账号 - 豪华版',
    category: 'Twitter账号',
    originalPrice: '¥69.99',
    purchasePrice: '¥65.00',
    quantity: 1,
    totalPrice: '¥69.99',
    fee: '¥2.10',
    status: '已退款',
    cardInfo: '',
    cardId: '',
    userNickname: '手动发货填邮箱已退款',
    userEmail: 'user15@example.com',
    userRole: '普通用户',
    payMethod: 'usdt',
    payChannel: 'k4',
    channelName: 'K4',
    deliveryMethod: '手动发货',
    createTime: '2024-05-03 14:00:00',
    completionTime: '',
    remark: '已填写邮箱的已退款订单',
    refundInfo: {
      refundAmount: 69.99,
      refundRemark: '用户申请退款，已处理',
      refundTime: '2024-05-03 15:00:00'
    },
    hasEmail: true
  })
  
  // 16. 手动发货 - 未填写邮箱 - 已完成
  orderList.value.push({
    id: 'DEMO016',
    orderId: 'P20240504001',
    productName: 'Facebook账号 - 高级版',
    category: 'Facebook账号',
    originalPrice: '¥79.99',
    purchasePrice: '¥75.00',
    quantity: 1,
    totalPrice: '¥79.99',
    fee: '¥2.40',
    status: '已完成',
    cardInfo: 'facebook_user123----password123----recovery@example.com',
    cardId: 'CARD20240504001',
    userNickname: '手动发货未填邮箱完成',
    userEmail: '',
    userRole: '普通用户',
    payMethod: 'alipay',
    payChannel: 'k4',
    channelName: 'K4',
    deliveryMethod: '手动发货',
    createTime: '2024-05-04 10:00:00',
    completionTime: '2024-05-04 10:30:00',
    remark: '未填写邮箱的已完成订单',
    refundInfo: null,
    hasEmail: false
  })
  
  // 17. 手动发货 - 未填写邮箱 - 已支付
  orderList.value.push({
    id: 'DEMO017',
    orderId: 'P20240504002',
    productName: 'Facebook账号 - 标准版',
    category: 'Facebook账号',
    originalPrice: '¥69.99',
    purchasePrice: '¥65.00',
    quantity: 1,
    totalPrice: '¥69.99',
    fee: '¥2.10',
    status: '已支付',
    cardInfo: '',
    cardId: '',
    userNickname: '手动发货未填邮箱已支付',
    userEmail: '',
    userRole: '普通用户',
    payMethod: 'wechat',
    payChannel: 'speedzf',
    channelName: 'speedzf',
    deliveryMethod: '手动发货',
    createTime: '2024-05-04 11:00:00',
    completionTime: '',
    remark: '未填写邮箱的已支付订单，待发货',
    refundInfo: null,
    hasEmail: false
  })
  
  // 18. 手动发货 - 未填写邮箱 - 已取消
  orderList.value.push({
    id: 'DEMO018',
    orderId: 'P20240504003',
    productName: 'Facebook账号 - 基础版',
    category: 'Facebook账号',
    originalPrice: '¥59.99',
    purchasePrice: '¥55.00',
    quantity: 1,
    totalPrice: '¥59.99',
    fee: '¥1.80',
    status: '已取消',
    cardInfo: '',
    cardId: '',
    userNickname: '手动发货未填邮箱已取消',
    userEmail: '',
    userRole: '普通用户',
    payMethod: 'alipay',
    payChannel: 'k4',
    channelName: 'K4',
    deliveryMethod: '手动发货',
    createTime: '2024-05-04 12:00:00',
    completionTime: '',
    remark: '未填写邮箱的已取消订单',
    refundInfo: null,
    hasEmail: false
  })
  
  // 19. 手动发货 - 未填写邮箱 - 待支付
  orderList.value.push({
    id: 'DEMO019',
    orderId: 'P20240504004',
    productName: 'Facebook账号 - 入门版',
    category: 'Facebook账号',
    originalPrice: '¥49.99',
    purchasePrice: '¥45.00',
    quantity: 1,
    totalPrice: '¥49.99',
    fee: '¥1.50',
    status: '待支付',
    cardInfo: '',
    cardId: '',
    userNickname: '手动发货未填邮箱待支付',
    userEmail: '',
    userRole: '普通用户',
    payMethod: 'wechat',
    payChannel: 'speedzf',
    channelName: 'speedzf',
    deliveryMethod: '手动发货',
    createTime: '2024-05-04 13:00:00',
    completionTime: '',
    remark: '未填写邮箱的待支付订单',
    refundInfo: null,
    hasEmail: false
  })
  
  // 20. 手动发货 - 未填写邮箱 - 已退款
  orderList.value.push({
    id: 'DEMO020',
    orderId: 'P20240504005',
    productName: 'Facebook账号 - 豪华版',
    category: 'Facebook账号',
    originalPrice: '¥89.99',
    purchasePrice: '¥85.00',
    quantity: 1,
    totalPrice: '¥89.99',
    fee: '¥2.70',
    status: '已退款',
    cardInfo: '',
    cardId: '',
    userNickname: '手动发货未填邮箱已退款',
    userEmail: '',
    userRole: '普通用户',
    payMethod: 'usdt',
    payChannel: 'k4',
    channelName: 'K4',
    deliveryMethod: '手动发货',
    createTime: '2024-05-04 14:00:00',
    completionTime: '',
    remark: '未填写邮箱的已退款订单',
    refundInfo: {
      refundAmount: 89.99,
      refundRemark: '用户申请退款，已处理',
      refundTime: '2024-05-04 15:00:00'
    },
    hasEmail: false
  })
  
  // 复制到allOrderList
  allOrderList.value = JSON.parse(JSON.stringify(orderList.value))
  
  // 更新分页相关数据
  total.value = orderList.value.length
}

// 添加表格行类名方法
const tableRowClassName = ({ row }: { row: any }) => {
  // 使用一个简单的方式来检查行是否被选中：通过ID匹配
  if (multipleSelection.value && multipleSelection.value.some((selected: any) => selected.orderId === row.orderId)) {
    return 'selected-row'
  }
  return ''
}

// 添加批量导入卡密弹窗
const batchImportDialogVisible = ref(false)
const batchImportContent = ref('')

// 添加批量选择卡密弹窗
const batchSelectDialogVisible = ref(false)
const batchSelectFilter = reactive({
  batchId: '',
  minCost: 0,
  maxCost: 0
})
const selectedBatchCards = ref<OrderItem[]>([])
const filteredBatchCards = ref<OrderItem[]>([])
const availableBatches = ref([
  { id: 'BATCH001', name: 'Gmail邮箱 - 2024年4月批次' },
  { id: 'BATCH002', name: 'Gmail邮箱 - 2024年5月批次' },
  { id: 'BATCH003', name: 'Instagram账号 - 高级认证批次' },
  { id: 'BATCH004', name: 'Twitter账号 - 标准批次' }
])

// 添加批量操作功能
const showBatchImportDialog = () => {
  batchImportDialogVisible.value = true
}

const importBatchCards = () => {
  // 解析输入的卡密信息
  const cardInfos = batchImportContent.value.split('\n').filter(line => line.trim() !== '')
  
  // 将卡密信息添加到deliverForm.multipleCardInfo中
  cardInfos.forEach(cardInfo => {
    const [cardId, username, password, ...rest] = cardInfo.split('####')
    deliverForm.multipleCardInfo.push({
      cardId,
      cardInfo: `账号：${username}\n密码：${password}\n卡密ID：${cardId}`,
      selectedCardId: cardId,
      newCardInfo: `账号：${username}\n密码：${password}\n卡密ID：${cardId}`,
      costPrice: 0
    })
  })
  
  // 重置输入框
  batchImportContent.value = ''
  
  // 关闭弹窗
  batchImportDialogVisible.value = false
}

const handleBatchSelectionChange = (selection: OrderItem[]) => {
  selectedBatchCards.value = selection
}

const filterBatchCards = () => {
  // 根据批次和成本价区间筛选卡密
  filteredBatchCards.value = availableCards.value.filter(card => {
    return (
      (batchSelectFilter.batchId ? card.batchId === batchSelectFilter.batchId : true) &&
      (batchSelectFilter.minCost <= card.cost && card.cost <= batchSelectFilter.maxCost)
    )
  })
}

const resetBatchFilter = () => {
  batchSelectFilter.batchId = ''
  batchSelectFilter.minCost = 0
  batchSelectFilter.maxCost = 0
}

const confirmBatchCardSelect = () => {
  // 将选中的卡密添加到deliverForm.multipleCardInfo中
  selectedBatchCards.value.forEach(card => {
    deliverForm.multipleCardInfo.push({
      cardId: card.cardId,
      cardInfo: card.cardInfo,
      selectedCardId: card.cardId,
      newCardInfo: card.cardInfo,
      costPrice: card.cost
    })
  })
  
  // 重置selectedBatchCards和filteredBatchCards
  selectedBatchCards.value = []
  filteredBatchCards.value = []
  
  // 关闭弹窗
  batchSelectDialogVisible.value = false
}

const getTotalBatchSelectCost = () => {
  return selectedBatchCards.value.reduce((total, card) => total + card.cost, 0)
}

// 添加以下函数用于处理批量操作
const activeCardTab = ref('')
const activeEditCardTab = ref('')
const activeSelectCardTab = ref('')
const activeEditSelectCardTab = ref('')

// 增加用于下载卡密信息功能
const downloadCurrentCardInfo = () => {
  if (!deliverForm.multipleCardInfo || deliverForm.multipleCardInfo.length === 0) {
    ElMessage.warning('没有卡密信息可供下载')
    return
  }
  
  // 创建卡密信息内容
  let csvContent = '卡密序号,卡密ID,卡密信息\n'
  
  deliverForm.multipleCardInfo.forEach((card, index) => {
    csvContent += `${index + 1},"${card.cardId || ''}",${ JSON.stringify(card.cardInfo || '').replace(/"/g, '""') }\n`
  })
  
  // 创建Blob对象
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  
  // 创建下载链接
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  // 设置下载属性
  link.setAttribute('href', url)
  const fileName = `订单${deliverForm.orderId}_卡密信息_${new Date().toISOString().split('T')[0]}.csv`
  link.setAttribute('download', fileName)
  link.style.visibility = 'hidden'
  
  // 添加到文档并触发点击
  document.body.appendChild(link)
  link.click()
  
  // 清理
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  
  ElMessage.success('卡密信息已成功导出')
}

// 获取已填写的卡密数量
const getCompletedCardCount = () => {
  return deliverForm.multipleCardInfo.filter(card => card.cardInfo).length
}
const getCompletedNewCardCount = () => {
  return deliverForm.multipleCardInfo.filter(card => card.newCardInfo).length
}
const getSelectedCardCount = () => {
  return deliverForm.multipleCardInfo.filter(card => card.selectedCardId).length
}
const handleCardPageChange = (page: number) => {
  activeCardTab.value = String(page - 1)
}
const handleEditCardPageChange = (page: number) => {
  activeEditCardTab.value = `edit_${String(page - 1)}`
}
const handleSelectCardPageChange = (page: number) => {
  activeSelectCardTab.value = `select_${String(page - 1)}`
}
const handleEditSelectCardPageChange = (page: number) => {
  activeEditSelectCardTab.value = `edit_select_${String(page - 1)}`
}
const showBatchSelectDialog = () => {
  batchSelectDialogVisible.value = true
}
const autoSelectAllCards = () => {
  // 这里应该实现智能匹配全部卡密的逻辑
  console.log('智能匹配全部卡密')
}
</script>

<style>
/* 全局样式，不使用scoped */
.refund-approval-dialog .el-message-box__header {
  padding: 15px 15px 0 !important;
  height: 20px !important;
}

.refund-approval-dialog .el-message-box__title {
  display: none !important;
}

.refund-approval-dialog .el-message-box__headerbtn {
  top: 15px !important;
  right: 15px !important;
}

.refund-approval-dialog .el-message-box__content {
  padding: 0 !important;
}

.refund-approval-dialog .el-message-box__message p {
  margin: 0 !important;
}

.refund-approval-dialog .el-message-box {
  padding: 0 !important;
  max-width: 480px !important;
  border-radius: 8px !important;
  overflow: hidden !important;
}

.refund-approval-dialog .el-message-box__btns {
  padding: 16px 24px !important;
  background-color: #f8f9fa !important;
  border-top: 1px solid #ebeef5 !important;
  margin-top: 0 !important;
}

.refund-approval-dialog .el-message-box__status {
  display: none !important;
}

.refund-dialog {
  padding: 0;
}

.refund-dialog-title {
  padding: 20px 24px;
  margin-bottom: 0;
  background-color: #fff;
  border-bottom: 1px solid #ebeef5;
}

.refund-dialog-content {
  padding: 24px;
  background-color: #fff;
}

.refund-dialog-item {
  margin-bottom: 20px;
}

.refund-amount-section {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
}

.refund-amount {
  font-size: 28px;
  margin-top: 8px;
}

.description-section {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
}

.description-label {
  color: #606266;
  margin-bottom: 8px;
  font-weight: 500;
}

.description-content {
  color: #303133;
  line-height: 1.6;
  white-space: pre-wrap;
}

.refund-confirm-text {
  text-align: center;
  color: #606266;
  font-size: 14px;
  margin-top: 16px;
}
</style>

<style scoped>
.orders-container {
  padding: 20px;
}

.box-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-buttons .el-button {
  margin-left: 10px;
}

.page-description {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f4f4f5;
  border-radius: 4px;
  color: #909399;
  font-size: 14px;
}

.filter-card-wrapper {
  margin-bottom: 20px;
}

.search-area {
  /* el-card will provide padding, specific padding here can be removed or adjusted if necessary */
}

.demo-form-inline .el-form-item {
  margin-bottom: 10px;
}

.search-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

/* 用户信息列样式 */
.user-info {
  display: flex;
  flex-direction: column;
}

.user-nickname {
  font-weight: bold;
  color: #303133;
  margin-bottom: 4px;
}

.user-email {
  font-size: 12px;
  color: #909399;
}

.product-info {
  display: flex;
  flex-direction: column;
}

.product-info div {
  margin-bottom: 4px;
  font-weight: 500;
}

.product-info .el-tag {
  width: fit-content;
}

.payment-info {
  display: flex;
  flex-direction: column;
}

.payment-info .payment-channel {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.total-amount span {
  margin-right: 10px;
  font-size: 14px;
}

.total-amount .amount-value {
  font-weight: bold;
  color: #F56C6C;
}

.action-btns .el-button {
  margin-left: 10px;
}

.table-area-wrapper {
  /* el-card will provide padding */
}

.price-container {
  display: flex;
  flex-direction: column;
}

.price, .original-price, .purchase-price, .fee, .income-price, .cost-price {
  /* Consolidating price related styles, specific colors can be added if needed */
  color: #303133;
}

.cost-price {
  color: #67C23A; /* 成本价使用绿色 */
  font-weight: bold;
}

.price {
  /* Making sure .price (often total price) stands out if needed */
  /* font-weight: bold; */ /* Example if it needs to be bolder */
}

.original-price {
 color: #909399;
}

.purchase-price {
  color: #67C23A;
  font-weight: bold;
}

.fee {
  color: #E6A23C;
  /* font-weight: bold; */ /* Example */
}

/* 移除入账金额特殊样式，使用默认文本颜色 */
/* .income-price {
  color: #409EFF;
  font-weight: bold;
} */

.usdt-price {
  font-size: 0.9em;
  color: #67C23A;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

/* 通用对话框样式 */
:deep(.el-dialog__header) {
  padding: 20px 24px;
  margin-right: 0;
  border-bottom: 1px solid #ebeef5;
}

:deep(.el-dialog__title) {
  font-size: 16px;
  font-weight: 500;
}

:deep(.el-dialog__body) {
  padding: 20px 24px;
}

:deep(.el-dialog__footer) {
  padding: 16px 24px 20px;
}

/* 对话框底部按钮样式 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.dialog-footer .el-button + .el-button {
  margin-left: 16px;
}

.order-detail-content pre.card-info-pre {
  background-color: #f5f7fa;
  padding: 10px;
  border-radius: 4px;
  white-space: pre-wrap; 
  word-break: break-all; 
  font-family: monospace;
}

.card-id {
  display: block;
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.card-id-value {
  color: #409EFF;
  font-weight: 500;
}

/* 添加卡密选择相关样式 */
.card-option {
  display: flex;
  flex-direction: column;
  padding: 5px 0;
}

.card-id {
  font-weight: bold;
  color: #303133;
}

.card-batch {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

.card-preview {
  margin-top: 10px;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
  border: 1px solid #ebeef5;
}

.card-preview-title {
  font-weight: bold;
  margin-bottom: 5px;
  color: #606266;
  font-size: 13px;
}

.card-preview-content {
  font-family: monospace;
  white-space: pre-wrap;
  word-break: break-all;
  color: #303133;
  font-size: 12px;
  background-color: #fff;
  padding: 8px;
  border-radius: 3px;
  border: 1px solid #ebeef5;
}

/* 自动成本价显示样式 */
.auto-cost-price {
  font-size: 14px;
  line-height: 32px;
  height: 32px;
}

.auto-cost-price span {
  color: #67C23A;
  font-weight: bold;
}

.select-card-tip {
  color: #909399 !important;
  font-weight: normal !important;
  font-style: italic;
}

:deep(.wider-dropdown-menu) {
  min-width: 180px !important; /* 增加下拉菜单宽度 */
}

:deep(.wider-dropdown-menu .el-dropdown-menu__item) {
  padding: 10px 20px; /* 增加内边距使文本更有呼吸空间 */
  white-space: nowrap; /* 确保文本不换行 */
}

/* Styles for dialogs */
.dialog-info-box {
  margin-bottom: 20px;
}

.dialog-info-box .info-item {
  margin-bottom: 8px;
  font-size: 14px;
}

.dialog-info-box .info-item .label {
  color: #606266;
  margin-right: 5px;
}

.dialog-info-box .info-item .value {
  color: #303133;
}

.dialog-info-box .info-item .price {
  color: #F56C6C;
  font-weight: bold;
}

/* 新增的当前卡密显示样式 */
.current-card-display {
  width: 100%;
}

.current-card-title {
  color: #606266;
  font-size: 13px;
  margin-bottom: 6px;
}

.current-card-content {
  font-family: monospace;
  white-space: pre-wrap;
  word-break: break-all;
  color: #303133;
  font-size: 13px;
  background-color: #f5f7fa;
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #e9e9eb;
  line-height: 1.5;
}

/* 添加选中行背景色样式 - 使用不透明的浅蓝色 */
:deep(.selected-row) {
  background-color: #e6f1fc !important; /* 使用不透明的浅蓝色 */
}

/* 确保选中行的斑马纹效果不会覆盖选中背景色 */
:deep(.selected-row.el-table__row--striped) {
  background-color: #e6f1fc !important;
}

/* 确保选中行鼠标悬浮时保持选中背景色不变 */
:deep(.selected-row:hover > td.el-table__cell) {
  background-color: #e6f1fc !important;
}

/* 确保选中行的斑马纹在鼠标悬浮时保持选中背景色不变 */
:deep(.selected-row.el-table__row--striped:hover > td.el-table__cell) {
  background-color: #e6f1fc !important;
}

/* 强制所有选中行的单元格使用相同的背景色 */
:deep(.selected-row td.el-table__cell) {
  background-color: #e6f1fc !important;
}

/* 确保斑马纹行的所有单元格在选中时也使用相同的背景色 */
:deep(.el-table__row--striped.selected-row td.el-table__cell) {
  background-color: #e6f1fc !important;
}

/* 新增多卡密表单和显示相关样式 */
.multiple-cards-container {
  margin-bottom: 20px;
}

.multiple-cards-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 12px;
  font-weight: 500;
}

.multiple-card-form-item {
  margin-bottom: 16px;
  padding: 12px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background-color: #f8f9fa;
}

.multiple-card-form-item:last-child {
  margin-bottom: 0;
}

.card-index {
  font-size: 13px;
  color: #303133;
  margin-bottom: 8px;
  font-weight: 500;
}

.multiple-card-item {
  margin-bottom: 12px;
  padding: 10px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background-color: #f8f9fa;
}

.multiple-card-item:last-child {
  margin-bottom: 0;
}

.card-item-title {
  font-size: 13px;
  color: #606266;
  margin-bottom: 6px;
  font-weight: 500;
}

.card-item-content {
  font-family: monospace;
  white-space: pre-wrap;
  word-break: break-all;
  color: #303133;
  font-size: 12px;
  background-color: #fff;
  padding: 8px;
  border-radius: 3px;
  border: 1px solid #ebeef5;
  line-height: 1.5;
}

.current-multiple-cards-display {
  width: 100%;
}

.card-actions {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
}

.batch-operations {
  display: flex;
  gap: 10px;
}

.quick-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.completed-info {
  font-size: 12px;
  color: #909399;
}

.range-separator {
  margin: 0 10px;
}

.batch-import-info {
  margin-bottom: 16px;
}

.format-example {
  background-color: #f8f9fa;
  padding: 8px 12px;
  border-radius: 4px;
  font-family: monospace;
  color: #606266;
  margin-top: 8px;
}

.batch-import-tips {
  margin-top: 16px;
  color: #909399;
  font-size: 13px;
}

.batch-import-tips ol {
  padding-left: 16px;
  margin-top: 8px;
}

.batch-import-tips li {
  margin-bottom: 4px;
}

.batch-select-info {
  margin-bottom: 16px;
}

.batch-filter-form {
  margin-bottom: 16px;
  background-color: #f8f9fa;
  padding: 16px;
  border-radius: 4px;
}

.batch-selection-info {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.info-cost {
  color: #67C23A;
  font-weight: bold;
}

/* 添加一些响应式样式 */
@media (max-width: 768px) {
  .batch-operations {
    flex-direction: column;
    gap: 8px;
  }
  
  .quick-navigation {
    flex-direction: column;
    gap: 8px;
    align-items: center;
  }
  
  .batch-filter-form :deep(.el-form-item) {
    margin-bottom: 8px;
  }
}

/* 激活状态的tab样式增强 */
:deep(.el-tabs__item.is-active) {
  font-weight: bold;
}

/* 批次卡密列表中标记已选择的行 */
:deep(.el-table .selected-row) {
  background-color: #f0f9eb !important;
}
</style>