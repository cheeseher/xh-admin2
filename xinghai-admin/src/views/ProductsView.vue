<template>
  <div class="products-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>商品管理</span>
          <el-button type="primary" @click="handleAddProduct">新增商品</el-button>
        </div>
      </template>
      
      <div class="page-description">
        <p>管理所有邮箱账号和社交媒体账号商品，包括Gmail、微软邮箱、Instagram、Twitter、Facebook等账号。您可以添加、编辑、删除商品，并设置商品的价格、库存、发货方式等信息。</p>
      </div>
      
      <!-- 库存预警统计 -->
      <div class="stock-alert-summary" v-if="stockAlertCount > 0">
        <el-alert
          type="warning"
          :closable="false"
          show-icon
        >
          <template #title>
            <div class="stock-alert-title">
              <span>库存预警提醒</span>
              <el-tag type="danger" size="small" effect="dark">{{ stockAlertCount }}</el-tag>
            </div>
          </template>
          <template #default>
            <p class="stock-alert-desc">当前有 {{ stockAlertCount }} 个商品库存已达到预警值，请及时补充库存。</p>
            <div class="stock-alert-actions">
              <el-button 
                type="warning" 
                size="small" 
                @click="filterStockAlert"
              >查看预警商品</el-button>
            </div>
          </template>
        </el-alert>
      </div>
      
      <!-- 搜索区域 -->
      <div class="search-area">
        <el-form :inline="true" :model="searchForm" class="demo-form-inline">
          <el-form-item label="商品ID">
            <el-input v-model="searchForm.id" placeholder="请输入商品ID" clearable></el-input>
          </el-form-item>
          <el-form-item label="商品名称">
            <el-input v-model="searchForm.name" placeholder="请输入商品名称" clearable></el-input>
          </el-form-item>
          <el-form-item label="商品分类">
            <el-select v-model="searchForm.category" placeholder="请选择" clearable style="width: 168px;">
              <el-option label="全部" value=""></el-option>
              <el-option label="谷歌邮箱" value="gmail"></el-option>
              <el-option label="微软邮箱" value="microsoft"></el-option>
              <el-option label="Instagram账号" value="instagram"></el-option>
              <el-option label="Twitter账号" value="twitter"></el-option>
              <el-option label="Facebook账号" value="facebook"></el-option>
              <el-option label="其他账号" value="other"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="发货方式">
            <el-select v-model="searchForm.deliveryMethod" placeholder="请选择" clearable style="width: 168px;">
              <el-option label="全部" value=""></el-option>
              <el-option label="自动发货" value="auto"></el-option>
              <el-option label="手动发货" value="manual"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 168px;">
              <el-option label="全部" value=""></el-option>
              <el-option label="上架中" value="on"></el-option>
              <el-option label="已下架" value="off"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="库存预警">
            <el-select v-model="searchForm.stockAlert" placeholder="请选择" clearable style="width: 168px;">
              <el-option label="全部" value=""></el-option>
              <el-option label="已达到预警值" value="reached"></el-option>
              <el-option label="未达到预警值" value="normal"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button type="info" plain @click="resetSearch">重置筛选</el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <!-- 表格区域 -->
      <el-table :data="tableData" style="width: 100%" v-loading="loading" border stripe>
        <el-table-column prop="id" label="商品ID" width="80"></el-table-column>
        <el-table-column prop="name" label="商品名称" min-width="180"></el-table-column>
        <el-table-column prop="category" label="商品分类" width="100">
          <template #default="scope">
            <el-tag :type="getCategoryTag(scope.row.category)">{{ scope.row.category }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="价格" width="120">
          <template #default="scope">
            <div class="price-container">
              <span class="current-price">¥{{ scope.row.currentPrice }}</span>
              <span class="original-price" v-if="scope.row.originalPrice">¥{{ scope.row.originalPrice }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="成本价" width="100">
          <template #default="scope">
            <span class="cost-price">¥{{ scope.row.costPrice || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="80">
          <template #default="scope">
            <div class="stock-cell">
              <span :class="{ 
                'low-stock': scope.row.stock < 50,
                'stock-alert': scope.row.stockAlertThreshold && scope.row.stock <= scope.row.stockAlertThreshold
              }">{{ scope.row.stock }}</span>
              <el-tooltip 
                v-if="scope.row.stockAlertThreshold && scope.row.stock <= scope.row.stockAlertThreshold"
                content="库存已达到预警值"
                placement="top"
              >
                <el-icon class="stock-alert-icon"><WarningFilled /></el-icon>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="stockAlertThreshold" label="库存预警值" width="100">
          <template #default="scope">
            <span :class="{ 'warning-threshold': scope.row.stock <= (scope.row.stockAlertThreshold || 0) }">
              {{ scope.row.stockAlertThreshold || '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="sales" label="销量" width="80"></el-table-column>
        <el-table-column prop="deliveryMethod" label="发货方式" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.deliveryMethod === '自动发货' ? 'success' : 'info'">
              {{ scope.row.deliveryMethod }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="批发价" width="120">
          <template #default="scope">
            <el-popover
              placement="top"
              :width="200"
              trigger="hover"
              v-if="scope.row.wholesalePrices && scope.row.wholesalePrices.length > 0"
            >
              <template #default>
                <div class="wholesale-popover">
                  <div class="wholesale-popover-title">批发价格设置</div>
                  <div class="wholesale-popover-item" v-for="(item, index) in scope.row.wholesalePrices" :key="index">
                    <span class="wholesale-popover-quantity">≥{{ item.quantity }}</span>
                    <span class="wholesale-popover-price">¥{{ item.price.toFixed(2) }}</span>
                  </div>
                </div>
              </template>
              <template #reference>
                <el-tag type="warning" effect="plain">查看批发价</el-tag>
              </template>
            </el-popover>
            <span v-else class="no-data">无批发价</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-switch
              v-model="scope.row.statusBool"
              :active-value="true"
              :inactive-value="false"
              @change="(val: boolean) => handleStatusChange(val, scope.row)"
            ></el-switch>
            <span class="status-text">{{ scope.row.statusBool ? '上架中' : '已下架' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="120"></el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180"></el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <el-button size="small" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
              <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
            </div>
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
    </el-card>
    
    <!-- 商品表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增商品' : '编辑商品'"
      width="650px"
    >
      <el-form :model="productForm" label-width="100px" :rules="rules" ref="productFormRef">
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="productForm.name" placeholder="请输入商品名称"></el-input>
        </el-form-item>
        <el-form-item label="商品分类" prop="category">
          <el-select v-model="productForm.category" placeholder="请选择商品分类" style="width: 100%;">
            <el-option label="谷歌邮箱" value="谷歌邮箱"></el-option>
            <el-option label="微软邮箱" value="微软邮箱"></el-option>
            <el-option label="Instagram账号" value="Instagram账号"></el-option>
            <el-option label="Twitter账号" value="Twitter账号"></el-option>
            <el-option label="Facebook账号" value="Facebook账号"></el-option>
            <el-option label="Discord账号" value="Discord账号"></el-option>
            <el-option label="ChatGPT账号" value="ChatGPT账号"></el-option>
            <el-option label="雅虎邮箱" value="雅虎邮箱"></el-option>
            <el-option label="GMX邮箱" value="GMX邮箱"></el-option>
            <el-option label="TikTok账号" value="TikTok账号"></el-option>
            <el-option label="美国AOL邮箱" value="美国AOL邮箱"></el-option>
            <el-option label="ProtonMail邮箱" value="ProtonMail邮箱"></el-option>
            <el-option label="其他账号" value="其他账号"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="成本价" prop="costPrice">
          <el-input-number 
            v-model="productForm.costPrice" 
            :min="0" 
            :precision="2" 
            :step="0.01" 
            style="width: 100%;"
          ></el-input-number>
          <div class="form-tip">商品的单个成本价，用于计算利润</div>
        </el-form-item>
        <el-form-item label="当前价格" prop="currentPrice">
          <el-input-number v-model="productForm.currentPrice" :min="0" :precision="2" :step="0.01" style="width: 100%;"></el-input-number>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="runPriceValidation">预验算价格</el-button>
          <div class="form-tip">请设置批发价与会员折扣后点击预验算，检查价格合理性</div>
        </el-form-item>
        
        <!-- 预验算结果表格 -->
        <el-form-item v-if="showPriceValidation">
          <el-card shadow="hover" class="price-validation-card">
            <template #header>
              <div class="price-validation-header">
                <span>价格预验算结果</span>
                <el-tag :type="overallProfitStatus.type" size="small">{{ overallProfitStatus.text }}</el-tag>
              </div>
            </template>
            
            <div class="price-validation-description">
              <p>此表格展示了不同价格类型的利润情况，特别关注批发价和会员折扣叠加后是否会导致亏损。</p>
            </div>
            
            <el-table :data="priceValidationData" border stripe size="small">
              <el-table-column label="价格类型" prop="type" width="150"></el-table-column>
              <el-table-column label="成本价" width="100">
                <template #default="scope">
                  <span>¥{{ productForm.costPrice.toFixed(2) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="现有价格" width="100">
                <template #default="scope">
                  <span :class="{'highlight-price': scope.row.highlight}">¥{{ scope.row.price.toFixed(2) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="折扣" width="100">
                <template #default="scope">
                  <span v-if="scope.row.discount">{{ scope.row.discount }}</span>
                  <span v-else>-</span>
                </template>
              </el-table-column>
              <el-table-column label="折后价" width="100">
                <template #default="scope">
                  <span v-if="scope.row.finalPrice !== undefined">¥{{ scope.row.finalPrice.toFixed(2) }}</span>
                  <span v-else>-</span>
                </template>
              </el-table-column>
              <el-table-column label="利润" width="100">
                <template #default="scope">
                  <span v-if="scope.row.profit !== undefined" :class="{'profit-negative': scope.row.profit < 0}">
                    ¥{{ scope.row.profit.toFixed(2) }}
                  </span>
                  <span v-else>-</span>
                </template>
              </el-table-column>
              <el-table-column label="利润率" width="100">
                <template #default="scope">
                  <span 
                    v-if="scope.row.profitRate !== undefined" 
                    class="profit-text" 
                    :class="getProfitRateClass(scope.row.price)"
                  >
                    {{ scope.row.profitRate }}
                  </span>
                  <span v-else>-</span>
                </template>
              </el-table-column>
              <el-table-column label="是否亏损" width="100">
                <template #default="scope">
                  <el-tag 
                    v-if="scope.row.status" 
                    :type="scope.row.statusType" 
                    size="small"
                  >
                    {{ scope.row.status }}
                  </el-tag>
                  <span v-else>-</span>
                </template>
              </el-table-column>
            </el-table>
            
            <div class="price-validation-summary" v-if="hasPriceWarnings">
              <el-alert
                type="warning"
                :closable="false"
                show-icon
              >
                <template #title>
                  <span>价格设置警告</span>
                </template>
                <template #default>
                  <ul class="warning-list">
                    <li v-for="(warning, index) in priceWarnings" :key="index">
                      {{ warning }}
                    </li>
                  </ul>
                </template>
              </el-alert>
            </div>
          </el-card>
        </el-form-item>
        
        <el-form-item label="原价" prop="originalPrice">
          <el-input-number v-model="productForm.originalPrice" :min="0" :precision="2" :step="0.01" style="width: 100%;"></el-input-number>
          <div class="form-tip">商品的原始价格，用于显示折扣效果</div>
        </el-form-item>
        
        <el-form-item label="库存" prop="stock" v-if="dialogType === 'edit'">
          <el-input-number v-model="productForm.stock" :min="0" style="width: 100%;"></el-input-number>
        </el-form-item>
        
        <!-- 新增：库存预警值设置 -->
        <el-form-item label="库存预警值" prop="stockAlertThreshold">
          <el-input-number 
            v-model="productForm.stockAlertThreshold" 
            :min="0" 
            style="width: 100%;"
            placeholder="设置库存预警阈值"
          ></el-input-number>
          <div class="form-tip">当库存低于此值时系统将发出预警通知</div>
        </el-form-item>
        
        <!-- 批发价设置 -->
        <el-form-item label="批发价设置">
          <el-card shadow="never" class="wholesale-card">
            <template #header>
              <div class="wholesale-header">
                <div class="wholesale-header-left">
                  <span class="wholesale-title">批发价格区间设置</span>
                  <el-tooltip content="设置不同数量区间的批发价格，客户购买数量达到要求时将自动享受优惠" placement="top">
                    <el-icon class="wholesale-help-icon"><QuestionFilled /></el-icon>
                  </el-tooltip>
                </div>
                <el-button type="primary" size="small" @click="addWholesalePrice">
                  <el-icon><Plus /></el-icon>添加区间
                </el-button>
              </div>
            </template>
            
            <!-- 批发价说明 -->
            <div class="wholesale-description" v-if="productForm.wholesalePrices && productForm.wholesalePrices.length > 0">
              <el-alert
                type="info"
                :closable="false"
                show-icon
              >
                <template #title>
                  <span>当前单价: <span class="current-price-text">¥{{ productForm.currentPrice.toFixed(2) }}</span></span>
                </template>
                <template #default>
                  <p class="wholesale-tip">设置批发价格区间，当客户购买数量达到要求时将自动享受优惠价格。请确保批发价低于单价，且数量越多价格越优惠。</p>
                </template>
              </el-alert>
            </div>
            
            <!-- 批发价表格 -->
            <div v-if="productForm.wholesalePrices && productForm.wholesalePrices.length > 0" class="wholesale-table-container">
              <el-table :data="productForm.wholesalePrices" border stripe size="small" class="wholesale-table">
                <el-table-column label="序号" type="index" width="60" align="center"></el-table-column>
                <el-table-column label="起批数量" width="180">
                  <template #default="scope">
                    <div class="wholesale-input-group">
                      <span class="wholesale-prefix">≥</span>
                      <el-input-number 
                        v-model="scope.row.quantity" 
                        :min="1" 
                        :precision="0" 
                        size="small"
                        class="wholesale-quantity-input"
                        placeholder="数量"
                        controls-position="right"
                        @change="validateWholesalePrices"
                      ></el-input-number>
                      <span class="wholesale-unit">件</span>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="批发单价" width="180">
                  <template #default="scope">
                    <div class="wholesale-input-group">
                      <span class="wholesale-prefix">¥</span>
                      <el-input-number 
                        v-model="scope.row.price" 
                        :min="0.01" 
                        :precision="2" 
                        :step="0.01" 
                        size="small"
                        class="wholesale-price-input"
                        placeholder="价格"
                        controls-position="right"
                        @change="validateWholesalePrices"
                      ></el-input-number>
                      <span class="wholesale-unit">/件</span>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="优惠" width="120">
                  <template #default="scope">
                    <span class="discount-text" :class="{'discount-invalid': scope.row.price >= productForm.currentPrice}">
                      {{ calculateDiscount(scope.row.price) }}
                    </span>
                  </template>
                </el-table-column>
                <el-table-column label="利润率" width="120">
                  <template #default="scope">
                    <span class="profit-text" :class="getProfitRateClass(scope.row.price)">
                      {{ calculateProfitRate(scope.row.price) }}
                    </span>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="100" align="center">
                  <template #default="scope">
                    <el-button 
                      type="danger" 
                      size="small" 
                      circle 
                      @click="removeWholesalePrice(scope.$index)"
                      class="wholesale-delete"
                    >
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
              
              <!-- 批发价预览 -->
              <div class="wholesale-preview">
                <div class="wholesale-preview-title">批发价格预览</div>
                <div class="wholesale-preview-content">
                  <el-tag 
                    v-for="(item, index) in sortedWholesalePrices" 
                    :key="index"
                    size="large" 
                    :type="getProfitRateTagType(item.price)" 
                    effect="plain" 
                    class="wholesale-preview-tag"
                  >
                    大于{{ item.quantity }}单价¥{{ item.price.toFixed(2) }}
                  </el-tag>
                </div>
              </div>
              
              <!-- 批发价利润预警 -->
              <div class="wholesale-profit-warning" v-if="hasLowProfitWholesale">
                <el-alert
                  type="warning"
                  :closable="false"
                  show-icon
                >
                  <template #title>
                    <span>批发价利润预警</span>
                  </template>
                  <template #default>
                    <p>部分批发价格的利润率过低（低于{{ minProfitRate }}%），可能导致亏损或利润过低，请调整价格。</p>
                  </template>
                </el-alert>
              </div>
            </div>
            
            <!-- 空状态 -->
            <div v-else class="wholesale-empty">
              <el-empty description="暂无批发价设置" :image-size="60">
                <template #description>
                  <p>设置批发价可以鼓励客户批量购买，提高销售额</p>
                </template>
                <el-button type="primary" @click="addWholesalePrice">
                  <el-icon><Plus /></el-icon>添加批发价区间
                </el-button>
              </el-empty>
            </div>
          </el-card>
        </el-form-item>
        
        <el-form-item label="发货方式" prop="deliveryMethod">
          <el-radio-group v-model="productForm.deliveryMethod">
            <el-radio label="自动发货">自动发货</el-radio>
            <el-radio label="手动发货">手动发货</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="商品详情" prop="description">
          <div class="editor-container">
            <div class="editor-header">
              <el-tabs v-model="productForm.templateMode" @tab-change="handleTemplateModeChange" type="card">
                <el-tab-pane label="使用模板" name="bind">
                  <div class="tab-content">
                    <div class="template-selector">
                      <el-select 
                        v-model="productForm.templateId" 
                        placeholder="请选择模板" 
                        style="width: 300px;"
                        @change="handleTemplateIdChange"
                      >
                        <el-option
                          v-for="template in templateList"
                          :key="template.id"
                          :label="template.name"
                          :value="template.id"
                        >
                          <div class="template-option">
                            <span>{{ template.name }}</span>
                            <el-tag v-if="template.category" size="small" type="info">{{ template.category }}</el-tag>
                          </div>
                        </el-option>
                      </el-select>
                      
                      <el-tooltip content="管理模板" placement="top">
                        <el-button type="primary" circle plain @click="goToTemplateSettings">
                          <el-icon><setting /></el-icon>
                        </el-button>
                      </el-tooltip>
                    </div>
                    
                    <div v-if="productForm.templateId" class="template-info">
                      <el-tag type="success" effect="dark">
                        <el-icon><Check /></el-icon>
                        <span style="margin-left: 5px;">已绑定模板：{{ getSelectedTemplateName() }}</span>
                      </el-tag>
                      <span class="template-hint">模板内容将随模板更新而自动更新</span>
                    </div>
                    <div v-else class="template-info">
                      <el-tag type="warning" effect="dark">
                        <el-icon><Warning /></el-icon>
                        <span style="margin-left: 5px;">未选择模板</span>
                      </el-tag>
                      <span class="template-hint">请从下拉菜单中选择一个模板</span>
                    </div>
                  </div>
                </el-tab-pane>
                <el-tab-pane label="自定义内容" name="custom">
                  <div class="tab-content">
                    <div class="template-actions">
                      <el-button-group>
                        <el-button type="primary" @click="insertTemplate">
                          <el-icon><Document /></el-icon>
                          插入默认模板
                        </el-button>
                        <el-dropdown @command="handleTemplateSelect" trigger="click">
                          <el-button type="primary">
                            <el-icon><List /></el-icon>
                            选择模板 <el-icon class="el-icon--right"><arrow-down /></el-icon>
                          </el-button>
                          <template #dropdown>
                            <el-dropdown-menu>
                              <el-dropdown-item v-for="template in templateList" :key="template.id" :command="template">
                                <div class="template-option">
                                  <span>{{ template.name }}</span>
                                  <el-tag v-if="template.category" size="small" type="info">{{ template.category }}</el-tag>
                                </div>
                              </el-dropdown-item>
                            </el-dropdown-menu>
                          </template>
                        </el-dropdown>
                      </el-button-group>
                      
                      <div class="template-extra-actions">
                        <el-button @click="previewContent" type="success" plain>
                          <el-icon><View /></el-icon>
                          预览效果
                        </el-button>
                        <el-tooltip content="管理模板" placement="top">
                          <el-button type="info" circle plain @click="goToTemplateSettings">
                            <el-icon><setting /></el-icon>
                          </el-button>
                        </el-tooltip>
                      </div>
                    </div>
                    
                    <div class="template-info">
                      <el-tag type="info" effect="plain">
                        <el-icon><InfoFilled /></el-icon>
                        <span style="margin-left: 5px;">自定义模式</span>
                      </el-tag>
                      <span class="template-hint">您可以自由编辑内容，但不会随模板更新而自动更新</span>
                    </div>
                  </div>
                </el-tab-pane>
              </el-tabs>
            </div>
            
            <div class="editor-wrapper" :class="{'editor-readonly': productForm.templateMode === 'bind'}">
              <QuillEditor
                v-model:content="productForm.description"
                contentType="html"
                theme="snow"
                toolbar="full"
                :options="editorOptions"
                style="height: 400px"
                :readonly="productForm.templateMode === 'bind'"
              />
              
              <div v-if="productForm.templateMode === 'bind'" class="editor-overlay">
                <el-icon class="lock-icon"><Lock /></el-icon>
                <p>模板内容由系统管理，如需自定义请切换到"自定义内容"模式</p>
              </div>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="productForm.statusBool"></el-switch>
          <span class="status-text">{{ productForm.statusBool ? '上架' : '下架' }}</span>
        </el-form-item>
        
        <!-- 会员折扣预验算 -->
        <el-form-item label="会员折扣预览">
          <el-card shadow="never" class="discount-preview-card">
            <template #header>
              <div class="discount-preview-header">
                <span class="discount-preview-title">会员折扣价格预览</span>
                <el-tooltip content="预览各会员等级的折扣价格，检查是否低于成本价" placement="top">
                  <el-icon class="discount-help-icon"><QuestionFilled /></el-icon>
                </el-tooltip>
              </div>
            </template>
            
            <div class="discount-preview-content">
              <el-table :data="memberDiscountPreview" border stripe size="small">
                <el-table-column label="会员等级" prop="levelName" width="120"></el-table-column>
                <el-table-column label="折扣" prop="discount" width="100">
                  <template #default="scope">
                    <span>{{ scope.row.discount }}折</span>
                  </template>
                </el-table-column>
                <el-table-column label="折后价" width="120">
                  <template #default="scope">
                    <span class="discount-price">¥{{ scope.row.discountPrice.toFixed(2) }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="利润率" width="120">
                  <template #default="scope">
                    <span class="profit-text" :class="getProfitRateClass(scope.row.discountPrice)">
                      {{ calculateProfitRate(scope.row.discountPrice) }}
                    </span>
                  </template>
                </el-table-column>
                <el-table-column label="状态" width="120">
                  <template #default="scope">
                    <el-tag :type="getMemberDiscountStatusType(scope.row.discountPrice)" size="small">
                      {{ getMemberDiscountStatus(scope.row.discountPrice) }}
                    </el-tag>
                  </template>
                </el-table-column>
              </el-table>
              
              <!-- 会员折扣利润预警 -->
              <div class="member-discount-warning" v-if="hasLowProfitMemberDiscount">
                <el-alert
                  type="warning"
                  :closable="false"
                  show-icon
                  style="margin-top: 15px;"
                >
                  <template #title>
                    <span>会员折扣利润预警</span>
                  </template>
                  <template #default>
                    <p>部分会员折扣价格的利润率过低（低于{{ minProfitRate }}%），可能导致亏损或利润过低，请调整价格或成本。</p>
                  </template>
                </el-alert>
              </div>
            </div>
          </el-card>
        </el-form-item>
      </el-form>
      
      <!-- 预览对话框 -->
      <el-dialog
        v-model="previewVisible"
        title="内容预览"
        width="70%"
        destroy-on-close
      >
        <div class="preview-container" v-html="productForm.description"></div>
      </el-dialog>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Delete, QuestionFilled, Plus, Setting, ArrowDown, Lock, Check, Warning, Document, List, View, InfoFilled, WarningFilled } from '@element-plus/icons-vue'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import { useRouter, useRoute } from 'vue-router'

// 搜索表单
const searchForm = reactive({
  id: '',
  name: '',
  category: '',
  deliveryMethod: '',
  status: '',
  stockAlert: ''
})

// 表格数据
const tableData = ref([
  { 
    id: 1,
    name: 'Gmail邮箱-稳定可用 (手工)', 
    category: '谷歌邮箱',
    currentPrice: 4.20,
    originalPrice: 6.50,
    costPrice: 2.50,
    stock: 384,
    stockAlertThreshold: 50,
    sales: 368,
    deliveryMethod: '手动发货',
    feature: '稳定可用',
    specialNote: '支持自定义密码，支持换绑手机',
    description: 'Gmail是Google提供的免费电子邮件服务，以下是使用Gmail账号的基本说明...',
    instructions: '登录步骤：\n1. 访问 https://mail.google.com\n2. 输入您购买的Gmail账号\n3. 输入对应的密码\n4. 如果提示需要验证，请按照提示完成验证步骤',
    afterSaleInfo: '本店所售Gmail账号均为稳定可用账号，购买后7天内提供更换服务。',
    disclaimer: '请勿将账号用于非法用途，账号被封禁概不负责。',
    status: '上架中',
    statusBool: true,
    createTime: '2024-03-01 10:00:00',
    wholesalePrices: [
      { quantity: 10, price: 3.90 },
      { quantity: 50, price: 3.70 },
      { quantity: 100, price: 3.50 }
    ],
    templateMode: 'bind',
    templateId: 2
  },
  { 
    id: 2,
    name: 'Gmail邮箱-稳定可用', 
    category: '谷歌邮箱',
    currentPrice: 2.75,
    originalPrice: 4.00,
    costPrice: 1.50,
    stock: 575,
    stockAlertThreshold: 100,
    sales: 292,
    deliveryMethod: '自动发货',
    feature: '稳定可用',
    specialNote: '支持自定义密码',
    description: 'Gmail是Google提供的免费电子邮件服务，以下是使用Gmail账号的基本说明...',
    instructions: '登录步骤：\n1. 访问 https://mail.google.com\n2. 输入您购买的Gmail账号\n3. 输入对应的密码\n4. 如果提示需要验证，请按照提示完成验证步骤',
    afterSaleInfo: '本店所售Gmail账号均为稳定可用账号，购买后3天内提供更换服务。',
    disclaimer: '请勿将账号用于非法用途，账号被封禁概不负责。',
    status: '上架中',
    statusBool: true,
    createTime: '2024-03-02 09:30:00',
    wholesalePrices: [
      { quantity: 10, price: 2.50 },
      { quantity: 50, price: 2.30 },
      { quantity: 100, price: 2.00 }
    ],
    templateMode: 'custom',
    templateId: 0
  },
  { 
    id: 3,
    name: 'Gmail邮箱-1月以上', 
    category: '谷歌邮箱',
    currentPrice: 5.50,
    originalPrice: 8.00,
    costPrice: 3.20,
    stock: 23,
    stockAlertThreshold: 30,
    sales: 256,
    deliveryMethod: '自动发货',
    feature: '1个月以上',
    specialNote: '支持自定义密码，支持换绑手机',
    description: 'Gmail是Google提供的免费电子邮件服务，以下是使用Gmail账号的基本说明...',
    instructions: '登录步骤：\n1. 访问 https://mail.google.com\n2. 输入您购买的Gmail账号\n3. 输入对应的密码\n4. 如果提示需要验证，请按照提示完成验证步骤',
    afterSaleInfo: '本店所售Gmail账号均为稳定可用账号，购买后15天内提供更换服务。',
    disclaimer: '请勿将账号用于非法用途，账号被封禁概不负责。',
    status: '上架中',
    statusBool: true,
    createTime: '2024-03-03 09:00:00',
    wholesalePrices: [
      { quantity: 10, price: 5.20 },
      { quantity: 50, price: 5.00 },
      { quantity: 100, price: 4.80 }
    ],
    templateMode: 'bind',
    templateId: 2
  },
  { 
    id: 4,
    name: 'Gmail邮箱-半年以上', 
    category: '谷歌邮箱',
    currentPrice: 7.50,
    originalPrice: 12.00,
    costPrice: 4.80,
    stock: 740,
    stockAlertThreshold: 200,
    sales: 198,
    deliveryMethod: '自动发货',
    feature: '半年以上',
    status: '上架中',
    statusBool: true,
    createTime: '2024-03-04 08:30:00',
    wholesalePrices: [
      { quantity: 10, price: 7.35 },
      { quantity: 50, price: 7.05 },
      { quantity: 100, price: 6.75 }
    ],
    templateMode: 'custom',
    templateId: 0
  },
  { 
    id: 5,
    name: 'Gmail邮箱-美国稳定', 
    category: '谷歌邮箱',
    currentPrice: 10.00,
    originalPrice: 18.00,
    costPrice: 6.50,
    stock: 1060,
    stockAlertThreshold: 150,
    sales: 165,
    deliveryMethod: '自动发货',
    feature: '美国地区',
    status: '上架中',
    statusBool: true,
    createTime: '2024-03-05 08:00:00',
    templateMode: 'custom',
    templateId: 0
  },
  { 
    id: 6,
    name: 'Gmail邮箱-一年以上', 
    category: '谷歌邮箱',
    currentPrice: 12.00,
    originalPrice: 15.00,
    costPrice: 8.00,
    stock: 872,
    stockAlertThreshold: 100,
    sales: 142,
    deliveryMethod: '自动发货',
    feature: '一年以上',
    status: '上架中',
    statusBool: true,
    createTime: '2024-03-06 08:00:00',
    templateMode: 'custom',
    templateId: 0
  },
  { 
    id: 7,
    name: 'Gmail美国老号 (6个月+)', 
    category: '谷歌邮箱',
    currentPrice: 16.88,
    originalPrice: 30.00,
    costPrice: 10.50,
    stock: 138,
    stockAlertThreshold: 50,
    sales: 98,
    deliveryMethod: '自动发货',
    feature: '老号',
    status: '上架中',
    statusBool: true,
    createTime: '2024-03-07 08:00:00',
    templateMode: 'custom',
    templateId: 0
  },
  { 
    id: 8,
    name: '2022年老号账号-谷歌邮箱', 
    category: '谷歌邮箱',
    currentPrice: 14.00,
    originalPrice: 20.00,
    costPrice: 9.20,
    stock: 52,
    stockAlertThreshold: 100,
    sales: 76,
    deliveryMethod: '自动发货',
    feature: '老号',
    status: '上架中',
    statusBool: true,
    createTime: '2024-03-08 08:00:00',
    templateMode: 'custom',
    templateId: 0
  }
])

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)

// 对话框相关
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const productFormRef = ref<FormInstance>()
const productForm = reactive({
  id: 0,
  name: '',
  category: '',
  currentPrice: 0,
  originalPrice: 0,
  costPrice: 0,
  stock: 0,
  stockAlertThreshold: 0,
  deliveryMethod: '自动发货',
  description: '',
  status: '上架中',
  statusBool: true,
  remark: '',
  wholesalePrices: [] as { quantity: number; price: number }[],
  templateMode: 'custom',
  templateId: 0
})

// 确保productForm.wholesalePrices始终是一个数组
watch(() => productForm, () => {
  if (!Array.isArray(productForm.wholesalePrices)) {
    productForm.wholesalePrices = [];
    console.log('初始化wholesalePrices为空数组');
  }
}, { deep: true, immediate: true });

// 表单验证规则
const rules = reactive<FormRules>({
  name: [
    { required: true, message: '请输入商品名称', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择商品分类', trigger: 'change' }
  ],
  currentPrice: [
    { required: true, message: '请输入当前价格', trigger: 'blur' }
  ],
  originalPrice: [
    { required: true, message: '请输入原价', trigger: 'blur' }
  ],
  costPrice: [
    { required: true, message: '请输入成本价', trigger: 'blur' }
  ],
  stock: [
    { required: true, message: '请输入库存', trigger: 'blur' }
  ],
  deliveryMethod: [
    { required: true, message: '请选择发货方式', trigger: 'change' }
  ],
  description: [
    { required: true, message: '请输入商品详情', trigger: 'blur' }
  ]
})

// 获取商品分类对应的标签类型
const getCategoryTag = (category: string) => {
  const categoryMap: Record<string, string> = {
    '谷歌邮箱': 'danger',
    '微软邮箱': 'success',
    'Instagram账号': 'warning',
    'Twitter账号': 'info',
    'Facebook账号': 'primary'
  }
  return categoryMap[category] || 'info'
}

// 获取商品列表数据
const getProductList = () => {
  // 模拟API请求
  loading.value = true
  setTimeout(() => {
    // 检查是否有任何筛选条件
    const hasFilters = searchForm.id || 
                      searchForm.name || 
                      searchForm.category || 
                      searchForm.deliveryMethod || 
                      searchForm.status || 
                      searchForm.stockAlert;
    
    // 如果没有筛选条件，显示所有数据
    let filteredData = [];
    if (!hasFilters) {
      // 加载所有原始数据
      filteredData = [...tableData.value];
    } else {
      // 根据搜索条件和分页参数获取数据
      filteredData = tableData.value.filter((item: any) => {
        // 商品ID筛选
        if (searchForm.id && !item.id.toString().includes(searchForm.id)) {
          return false
        }
        // 商品名称筛选
        if (searchForm.name && !item.name.includes(searchForm.name)) {
          return false
        }
        // 商品分类筛选
        if (searchForm.category) {
          if (searchForm.category === 'gmail' && item.category !== '谷歌邮箱') {
            return false
          }
          if (searchForm.category === 'microsoft' && item.category !== '微软邮箱') {
            return false
          }
          if (searchForm.category === 'instagram' && item.category !== 'Instagram账号') {
            return false
          }
          if (searchForm.category === 'twitter' && item.category !== 'Twitter账号') {
            return false
          }
          if (searchForm.category === 'facebook' && item.category !== 'Facebook账号') {
            return false
          }
          if (searchForm.category === 'other' && ['谷歌邮箱', '微软邮箱', 'Instagram账号', 'Twitter账号', 'Facebook账号'].includes(item.category)) {
            return false
          }
        }
        // 发货方式筛选
        if (searchForm.deliveryMethod && item.deliveryMethod !== searchForm.deliveryMethod) {
          return false
        }
        // 状态筛选
        if (searchForm.status) {
          if (searchForm.status === 'on' && item.status !== '上架中') {
            return false
          }
          if (searchForm.status === 'off' && item.status !== '已下架') {
            return false
          }
        }
        // 库存预警筛选
        if (searchForm.stockAlert) {
          const hasStockAlert = item.stockAlertThreshold && item.stock <= item.stockAlertThreshold;
          if (searchForm.stockAlert === 'reached' && !hasStockAlert) {
            return false;
          }
          if (searchForm.stockAlert === 'normal' && hasStockAlert) {
            return false;
          }
        }
        return true
      })
    }
    
    // 计算总数
    total.value = filteredData.length
    
    // 分页处理
    const startIndex = (currentPage.value - 1) * pageSize.value
    const endIndex = startIndex + pageSize.value
    tableData.value = filteredData.slice(startIndex, endIndex)
    
    loading.value = false
  }, 500)
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  getProductList()
}

// 重置搜索
const resetSearch = () => {
  // 清空所有搜索条件
  searchForm.id = ''
  searchForm.name = ''
  searchForm.category = ''
  searchForm.deliveryMethod = ''
  searchForm.status = ''
  searchForm.stockAlert = ''
  
  // 重置分页
  currentPage.value = 1
  
  // 重新加载所有数据
  getProductList()
  
  // 显示提示信息
  ElMessage.success('已重置所有筛选条件')
}

// 状态变更
const handleStatusChange = (val: boolean, row: any) => {
  const statusText = val ? '上架' : '下架'
  ElMessage.success(`商品"${row.name}"已${statusText}`)
  row.status = val ? '上架中' : '已下架'
}

// 查看商品
const handleView = (row: any) => {
  // 构建批发价格HTML
  let wholesalePricesHtml = '<div class="no-wholesale">暂无批发价设置</div>'
  if (row.wholesalePrices && row.wholesalePrices.length > 0) {
    wholesalePricesHtml = '<div class="wholesale-list">'
    row.wholesalePrices.forEach((item: any) => {
      wholesalePricesHtml += `
        <div class="wholesale-view-item">
          <span class="wholesale-badge">≥${item.quantity}</span>
          <span class="wholesale-price">¥${item.price.toFixed(2)}</span>
        </div>
      `
    })
    wholesalePricesHtml += '</div>'
  }

  ElMessageBox.alert(
    `<div class="product-detail">
      <h3>${row.name}</h3>
      <div class="detail-item">
        <span class="label">商品分类：</span>
        <span>${row.category}</span>
      </div>
      <div class="detail-item">
        <span class="label">商品特性：</span>
        <span>${row.feature || '无'}</span>
      </div>
      <div class="detail-item">
        <span class="label">价格：</span>
        <span class="price">¥${row.currentPrice}</span>
        ${row.originalPrice ? `<span class="original-price">¥${row.originalPrice}</span>` : ''}
      </div>
      <div class="detail-item">
        <span class="label">成本价：</span>
        <span class="cost-price">¥${row.costPrice || '-'}</span>
      </div>
      <div class="detail-item">
        <span class="label">批发价格：</span>
        ${wholesalePricesHtml}
      </div>
      <div class="detail-item">
        <span class="label">库存：</span>
        <span>${row.stock}</span>
      </div>
      <div class="detail-item">
        <span class="label">库存预警值：</span>
        <span>${row.stockAlertThreshold || '未设置'}</span>
      </div>
      <div class="detail-item">
        <span class="label">销量：</span>
        <span>${row.sales}</span>
      </div>
      <div class="detail-item">
        <span class="label">发货方式：</span>
        <span>${row.deliveryMethod}</span>
      </div>
      <div class="detail-item">
        <span class="label">商品描述：</span>
        <div class="detail-content">${row.description || '无'}</div>
      </div>
      <div class="detail-item">
        <span class="label">使用说明：</span>
        <div class="detail-content">${row.instructions ? row.instructions.replace(/\n/g, '<br>') : '无'}</div>
      </div>
      <div class="detail-item">
        <span class="label">售后说明：</span>
        <div class="detail-content">${row.afterSaleInfo || '无'}</div>
      </div>
      <div class="detail-item">
        <span class="label">免责声明：</span>
        <div class="detail-content">${row.disclaimer || '无'}</div>
      </div>
      <div class="detail-item">
        <span class="label">创建时间：</span>
        <span>${row.createTime}</span>
      </div>
    </div>`,
    '商品详情',
    {
      dangerouslyUseHTMLString: true,
      confirmButtonText: '关闭'
    }
  )
}

// 新增商品
const handleAddProduct = () => {
  dialogType.value = 'add'
  productForm.id = 0
  productForm.name = ''
  productForm.category = ''
  productForm.currentPrice = 0
  productForm.originalPrice = 0
  productForm.costPrice = 0
  productForm.stock = 30 // 默认库存设置为30
  productForm.stockAlertThreshold = 0
  productForm.deliveryMethod = '自动发货'
  productForm.description = ''
  productForm.statusBool = true
  productForm.wholesalePrices = []
  productForm.templateMode = 'custom'
  productForm.templateId = 0
  dialogVisible.value = true
  
  // 确保初始化后wholesalePrices是一个数组
  console.log('新增商品初始化wholesalePrices:', productForm.wholesalePrices);
}

// 编辑
const handleEdit = (row: any) => {
  dialogType.value = 'edit'
  productForm.id = row.id
  productForm.name = row.name
  productForm.category = row.category
  productForm.currentPrice = row.currentPrice
  productForm.originalPrice = row.originalPrice
  productForm.costPrice = row.costPrice || 0
  productForm.stock = row.stock
  productForm.stockAlertThreshold = row.stockAlertThreshold || 0
  productForm.deliveryMethod = row.deliveryMethod
  productForm.description = row.description || ''
  productForm.statusBool = row.statusBool
  
  // 设置模板模式和模板ID
  productForm.templateMode = row.templateMode || 'custom'
  productForm.templateId = row.templateId || 0
  
  // 处理批发价格
  if (row.wholesalePrices && Array.isArray(row.wholesalePrices)) {
    productForm.wholesalePrices = [...row.wholesalePrices]
  } else {
    productForm.wholesalePrices = []
  }
  
  dialogVisible.value = true
  
  // 确保初始化后wholesalePrices是一个数组
  console.log('编辑商品初始化wholesalePrices:', productForm.wholesalePrices);
}

// 删除
const handleDelete = (row: any) => {
  ElMessageBox.confirm(
    `确定要删除商品"${row.name}"吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      ElMessage({
        type: 'success',
        message: `商品"${row.name}"已删除`,
      })
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '已取消删除',
      })
    })
}

// 提交表单
const submitForm = async () => {
  if (!productFormRef.value) return
  
  await productFormRef.value.validate((valid, fields) => {
    if (valid) {
      // 构建要保存的商品数据
      const productData = {
        ...productForm,
        // 如果是绑定模式，保存模板ID；如果是自定义模式，清空模板ID
        templateId: productForm.templateMode === 'bind' ? productForm.templateId : 0
      };
      
      if (dialogType.value === 'add') {
        ElMessage.success('新增商品成功')
      } else {
        ElMessage.success('编辑商品成功')
      }
      dialogVisible.value = false
    } else {
      console.log('表单验证失败', fields)
    }
  })
}

// 处理每页显示数量变化
const handleSizeChange = (val: number) => {
  pageSize.value = val
  getProductList()
}

// 处理页码变化
const handleCurrentChange = (val: number) => {
  currentPage.value = val
  getProductList()
}

// 监听搜索表单变化，重置分页并重新获取数据
watch([() => searchForm.name, () => searchForm.category, () => searchForm.deliveryMethod, () => searchForm.status, () => searchForm.stockAlert], () => {
  currentPage.value = 1
  getProductList()
})

// 富文本编辑器相关
const previewVisible = ref(false)
const editorOptions = {
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'header': 1 }, { 'header': 2 }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'script': 'sub' }, { 'script': 'super' }],
      [{ 'indent': '-1' }, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['clean'],
      ['link', 'image']
    ]
  },
  placeholder: '请输入商品详情...'
}

// 模板相关
const router = useRouter()
const templateList = ref([
  {
    id: 1,
    name: '通用商品模板',
    category: '',
    content: `
<h2>商品介绍</h2>
<p>这是一个高质量的账号，具有以下特点...</p>

<h2>账号规格</h2>
<ul>
  <li>账号类型：\${category}</li>
</ul>

<h2>使用说明</h2>
<ol>
  <li>购买成功后，系统将自动发送账号信息到您的邮箱</li>
  <li>收到账号后请立即修改密码</li>
  <li>请勿在账号中存储重要个人信息</li>
  <li>如有登录问题，请及时联系客服</li>
</ol>

<h2>售后说明</h2>
<p>1. 售后保障期：自购买之日起30天内</p>
<p>2. 售后范围：账号无法登录、功能与描述不符</p>
<p>3. 售后流程：请通过"我的订单"-"申请售后"提交申请</p>
<p>4. 不支持售后的情况：</p>
<ul>
  <li>超出保障期的账号问题</li>
  <li>因用户操作不当导致的账号问题</li>
  <li>账号被用于违规用途</li>
</ul>

<h2>免责声明</h2>
<p>1. 本平台仅提供账号交易服务，不对账号的后续使用负责</p>
<p>2. 请遵守相关法律法规和平台规则使用账号</p>
<p>3. 禁止将账号用于任何违法违规活动</p>
<p>4. 平台保留对违规用户追究法律责任的权利</p>
`
  },
  {
    id: 2,
    name: 'Gmail邮箱模板',
    category: '谷歌邮箱',
    content: `
<h2>Gmail邮箱介绍</h2>
<p>Gmail是Google提供的免费电子邮件服务，以下是使用Gmail账号的基本说明...</p>

<h2>账号规格</h2>
<ul>
  <li>账号类型：谷歌邮箱</li>
</ul>

<h2>使用说明</h2>
<ol>
  <li>购买成功后，系统将自动发送账号信息到您的邮箱</li>
  <li>收到账号后请立即修改密码</li>
  <li>请勿在账号中存储重要个人信息</li>
  <li>如有登录问题，请及时联系客服</li>
</ol>

<h2>登录步骤</h2>
<ol>
  <li>访问 https://mail.google.com</li>
  <li>输入您购买的Gmail账号</li>
  <li>输入对应的密码</li>
  <li>如果提示需要验证，请按照提示完成验证步骤</li>
</ol>

<h2>售后说明</h2>
<p>本店所售Gmail账号均为稳定可用账号，购买后7天内提供更换服务。</p>

<h2>免责声明</h2>
<p>请勿将账号用于非法用途，账号被封禁概不负责。</p>
`
  },
  {
    id: 3,
    name: '社交媒体账号模板',
    category: 'Instagram账号',
    content: `
<h2>社交媒体账号介绍</h2>
<p>这是一个高质量的社交媒体账号，具有以下特点...</p>

<h2>账号规格</h2>
<ul>
  <li>账号类型：\${category}</li>
</ul>

<h2>使用说明</h2>
<ol>
  <li>购买成功后，系统将自动发送账号信息到您的邮箱</li>
  <li>收到账号后请立即修改密码和邮箱</li>
  <li>请勿在账号中存储重要个人信息</li>
  <li>如有登录问题，请及时联系客服</li>
</ol>

<h2>注意事项</h2>
<ul>
  <li>请勿短时间内频繁登录或修改账号信息，以免触发安全机制</li>
  <li>建议使用代理IP登录，避免账号异常</li>
  <li>请勿发布违规内容，以免账号被封</li>
</ul>

<h2>售后说明</h2>
<p>本店所售社交媒体账号均为真实账号，购买后3天内提供更换服务。</p>

<h2>免责声明</h2>
<p>请勿将账号用于非法用途，账号被封禁概不负责。</p>
`
  }
])

// 预览内容
const previewContent = () => {
  previewVisible.value = true
}

// 处理模板选择
const handleTemplateSelect = (template: any) => {
  if (productForm.templateMode === 'bind') {
    // 绑定模式下，只保存模板ID，不直接应用内容
    productForm.templateId = template.id;
    // 从模板获取内容并显示（只读）
    applyTemplateContent(template);
    ElMessage.success(`已绑定"${template.name}"模板，商品详情将随模板更新而更新`);
  } else {
    // 自定义模式下，直接应用模板内容
    applyTemplateContent(template);
    ElMessage.success(`已应用"${template.name}"模板内容`);
  }
}

// 应用模板内容
const applyTemplateContent = (template: any) => {
  // 替换模板中的变量
  let content = template.content;
  content = content.replace(/\${category}/g, productForm.category || '无');
  
  // 设置商品描述
  productForm.description = content;
}

// 插入默认模板
const insertTemplate = () => {
  const defaultTemplate = templateList.value.find(t => t.id === 1) || templateList.value[0];
  if (defaultTemplate) {
    if (productForm.templateMode === 'bind') {
      productForm.templateId = defaultTemplate.id;
      applyTemplateContent(defaultTemplate);
      ElMessage.success(`已绑定"${defaultTemplate.name}"模板`);
    } else {
      applyTemplateContent(defaultTemplate);
      ElMessage.success(`已插入"${defaultTemplate.name}"模板内容`);
    }
  }
}

// 跳转到模板设置页面
const goToTemplateSettings = () => {
  router.push('/templates')
}

// 添加批发价
const addWholesalePrice = () => {
  console.log('添加批发价区间开始', productForm.currentPrice, productForm.wholesalePrices);
  
  // 确保wholesalePrices是一个数组
  if (!Array.isArray(productForm.wholesalePrices)) {
    productForm.wholesalePrices = [];
  }
  
  // 设置默认值为当前价格的95%
  const defaultPrice = productForm.currentPrice > 0 ? 
    Math.round(productForm.currentPrice * 0.95 * 100) / 100 : 0;
  
  // 设置默认数量为10或者比最大数量多10
  let defaultQuantity = 10;
  if (productForm.wholesalePrices && productForm.wholesalePrices.length > 0) {
    const maxQuantity = Math.max(...productForm.wholesalePrices.map(item => item.quantity || 0));
    defaultQuantity = maxQuantity + 10;
  }
  
  // 添加新的批发价区间
  productForm.wholesalePrices.push({ 
    quantity: defaultQuantity, 
    price: defaultPrice 
  });
  
  // 验证并排序批发价
  validateWholesalePrices();
  
  // 添加调试信息
  console.log('添加批发价区间后', productForm.wholesalePrices);
  
  // 显示成功提示
  ElMessage.success('已添加新的批发价区间');
}

// 移除批发价
const removeWholesalePrice = (index: number) => {
  productForm.wholesalePrices.splice(index, 1);
}

// 验证批发价格设置
const validateWholesalePrices = () => {
  console.log('验证批发价开始', productForm.wholesalePrices);
  
  // 确保wholesalePrices是一个数组
  if (!Array.isArray(productForm.wholesalePrices)) {
    productForm.wholesalePrices = [];
    console.log('validateWholesalePrices: 初始化为空数组');
    return;
  }
  
  // 过滤掉无效的批发价（数量或价格为0的）
  productForm.wholesalePrices = productForm.wholesalePrices.filter(
    item => item && typeof item === 'object' && item.quantity > 0 && item.price > 0
  );
  
  console.log('过滤后的批发价', productForm.wholesalePrices);
  
  if (productForm.wholesalePrices.length === 0) {
    console.log('批发价为空，跳过验证');
    return;
  }
  
  // 检查是否有重复的数量
  const quantities = productForm.wholesalePrices.map(item => item.quantity);
  const hasDuplicates = quantities.length !== new Set(quantities).size;
  
  if (hasDuplicates) {
    ElMessage.warning('批发价设置中存在重复的数量，请修正');
  }
  
  // 检查是否有批发价高于单价的情况
  const hasInvalidPrice = productForm.wholesalePrices.some(
    item => item.price >= productForm.currentPrice
  );
  
  if (hasInvalidPrice && productForm.currentPrice > 0) {
    ElMessage.warning('批发价应低于商品单价，请修正');
  }
  
  // 检查是否有批发价低于成本价的情况
  const hasBelowCostPrice = productForm.wholesalePrices.some(
    item => productForm.costPrice > 0 && item.price < productForm.costPrice
  );
  
  if (hasBelowCostPrice) {
    ElMessage.warning('批发价不应低于成本价，否则将导致亏损');
  }
  
  // 检查是否有批发价利润率过低的情况
  const hasLowProfit = productForm.wholesalePrices.some(item => {
    if (!item.price || item.price <= 0 || !productForm.costPrice || productForm.costPrice <= 0) return false;
    const profitRate = (item.price - productForm.costPrice) / item.price * 100;
    return profitRate < minProfitRate;
  });
  
  if (hasLowProfit) {
    ElMessage.warning(`部分批发价的利润率低于${minProfitRate}%，可能导致利润过低`);
  }
  
  // 按数量从小到大排序
  productForm.wholesalePrices.sort((a, b) => a.quantity - b.quantity);
  
  // 检查是否符合数量越多价格越低的原则
  let isValid = true;
  for (let i = 1; i < productForm.wholesalePrices.length; i++) {
    if (productForm.wholesalePrices[i].price > productForm.wholesalePrices[i-1].price) {
      isValid = false;
      break;
    }
  }
  
  if (!isValid) {
    ElMessage.warning('批发价应遵循"数量越多价格越低"的原则，请修正');
  }
  
  console.log('验证批发价完成', productForm.wholesalePrices);
}

// 计算折扣
const calculateDiscount = (price: number) => {
  if (!price || price <= 0) return '无折扣';
  if (!productForm.currentPrice || productForm.currentPrice <= 0) return '无折扣';
  
  if (price >= productForm.currentPrice) {
    return '无折扣';
  }
  
  const discount = (price / productForm.currentPrice * 10).toFixed(1);
  return `${discount}折`;
}

// 计算利润率
const calculateProfitRate = (price: number) => {
  if (!price || price <= 0) return '无法计算';
  if (!productForm.costPrice || productForm.costPrice <= 0) return '未设置成本';
  
  // 利润率 = (售价 - 成本价) / 售价 * 100%
  const profitRate = ((price - productForm.costPrice) / price * 100).toFixed(1);
  return `${profitRate}%`;
}

// 获取利润率对应的样式类
const getProfitRateClass = (price: number) => {
  if (!price || price <= 0 || !productForm.costPrice || productForm.costPrice <= 0) {
    return '';
  }
  
  const profitRate = (price - productForm.costPrice) / price * 100;
  
  if (profitRate < 0) {
    return 'profit-negative'; // 亏损
  } else if (profitRate < minProfitRate) {
    return 'profit-warning'; // 利润率过低
  } else if (profitRate < 30) {
    return 'profit-normal'; // 正常利润
  } else {
    return 'profit-good'; // 良好利润
  }
}

// 获取利润率对应的标签类型
const getProfitRateTagType = (price: number) => {
  if (!price || price <= 0 || !productForm.costPrice || productForm.costPrice <= 0) {
    return 'info';
  }
  
  const profitRate = (price - productForm.costPrice) / price * 100;
  
  if (profitRate < 0) {
    return 'danger'; // 亏损
  } else if (profitRate < minProfitRate) {
    return 'warning'; // 利润率过低
  } else if (profitRate < 30) {
    return 'success'; // 正常利润
  } else {
    return 'success'; // 良好利润
  }
}

// 检查是否有低利润率的批发价
const hasLowProfitWholesale = computed(() => {
  if (!productForm.wholesalePrices || !Array.isArray(productForm.wholesalePrices) || productForm.wholesalePrices.length === 0) {
    return false;
  }
  
  if (!productForm.costPrice || productForm.costPrice <= 0) {
    return false;
  }
  
  return productForm.wholesalePrices.some(item => {
    if (!item.price || item.price <= 0) return false;
    const profitRate = (item.price - productForm.costPrice) / item.price * 100;
    return profitRate < minProfitRate;
  });
});

// 会员等级数据（模拟数据，实际应从API获取）
const memberLevels = ref([
  { level: 0, name: '普通用户', discount: 10 },
  { level: 1, name: 'VIP1', discount: 9.5 },
  { level: 2, name: 'VIP2', discount: 9 },
  { level: 3, name: 'VIP3', discount: 8.5 },
  { level: 999, name: '超级VIP', discount: 8 }
]);

// 计算会员折扣预览数据
const memberDiscountPreview = computed(() => {
  if (!productForm.currentPrice || productForm.currentPrice <= 0) {
    return [];
  }
  
  return memberLevels.value.map(level => {
    const discountRate = level.discount / 10;
    const discountPrice = productForm.currentPrice * discountRate;
    
    return {
      level: level.level,
      levelName: level.name,
      discount: level.discount,
      discountPrice: discountPrice
    };
  });
});

// 检查是否有低利润率的会员折扣
const hasLowProfitMemberDiscount = computed(() => {
  if (!memberDiscountPreview.value.length || !productForm.costPrice || productForm.costPrice <= 0) {
    return false;
  }
  
  return memberDiscountPreview.value.some(item => {
    const profitRate = (item.discountPrice - productForm.costPrice) / item.discountPrice * 100;
    return profitRate < minProfitRate;
  });
});

// 获取会员折扣状态
const getMemberDiscountStatus = (discountPrice: number) => {
  if (!discountPrice || discountPrice <= 0 || !productForm.costPrice || productForm.costPrice <= 0) {
    return '未知';
  }
  
  const profitRate = (discountPrice - productForm.costPrice) / discountPrice * 100;
  
  if (profitRate < 0) {
    return '亏损';
  } else if (profitRate < minProfitRate) {
    return '低利润';
  } else if (profitRate < 30) {
    return '正常';
  } else {
    return '良好';
  }
}

// 获取会员折扣状态对应的标签类型
const getMemberDiscountStatusType = (discountPrice: number) => {
  if (!discountPrice || discountPrice <= 0 || !productForm.costPrice || productForm.costPrice <= 0) {
    return 'info';
  }
  
  const profitRate = (discountPrice - productForm.costPrice) / discountPrice * 100;
  
  if (profitRate < 0) {
    return 'danger';
  } else if (profitRate < minProfitRate) {
    return 'warning';
  } else if (profitRate < 30) {
    return 'success';
  } else {
    return 'success';
  }
}

// 计算库存预警商品数量
const stockAlertCount = computed(() => {
  return tableData.value.filter(item => 
    item.stockAlertThreshold && item.stock <= item.stockAlertThreshold
  ).length;
});

// 筛选库存预警商品
const filterStockAlert = () => {
  searchForm.stockAlert = 'reached';
  handleSearch();
  ElMessage.info('已为您筛选出库存预警商品');
}

// 监听当前价格变化，提示用户检查批发价
watch(() => productForm.currentPrice, (newVal) => {
  if (newVal > 0 && productForm.wholesalePrices && productForm.wholesalePrices.length > 0) {
    const hasInvalidPrice = productForm.wholesalePrices.some(item => item.price >= newVal);
    if (hasInvalidPrice) {
      ElMessage.warning('当前价格已变更，请检查批发价设置');
    }
  }
});

// 处理模板模式变化
const handleTemplateModeChange = () => {
  // 如果切换到自定义内容模式，清空模板相关信息
  if (productForm.templateMode === 'custom') {
    productForm.templateId = 0;
  }
}

// 获取选中的模板名称
const getSelectedTemplateName = () => {
  const selectedTemplate = templateList.value.find(t => t.id === productForm.templateId)
  return selectedTemplate ? selectedTemplate.name : '未选择模板'
}

// 处理模板ID变化
const handleTemplateIdChange = (templateId: number) => {
  if (templateId) {
    const template = templateList.value.find(t => t.id === templateId);
    if (template) {
      applyTemplateContent(template);
      ElMessage.success(`已绑定"${template.name}"模板，商品详情将随模板更新而更新`);
    }
  }
}

// 最低利润率设置（可以根据需要调整）
const minProfitRate = 10; // 最低利润率10%

// 初始化
onMounted(() => {
  // 检查URL参数，如果有商品ID或名称参数，自动筛选
  const route = useRoute()
  if (route.query.id || route.query.name) {
    if (route.query.id) {
      searchForm.id = route.query.id as string
    }
    if (route.query.name) {
      searchForm.name = route.query.name as string
    }
    // 自动执行搜索
    handleSearch()
    // 显示提示信息
    ElMessage.info(`已为您筛选商品: ${route.query.name || route.query.id}`)
  } else {
    // 正常加载数据
    getProductList()
  }
})

// 排序后的批发价格，用于预览
const sortedWholesalePrices = computed(() => {
  if (!productForm.wholesalePrices || !Array.isArray(productForm.wholesalePrices) || productForm.wholesalePrices.length === 0) {
    return [];
  }
  
  return [...productForm.wholesalePrices]
    .filter(item => item && item.quantity > 0 && item.price > 0)
    .sort((a, b) => a.quantity - b.quantity);
});

// 预验算相关
const showPriceValidation = ref(false);
const priceValidationData = ref<any[]>([]);
const priceWarnings = ref<string[]>([]);
const hasPriceWarnings = computed(() => priceWarnings.value.length > 0);

// 整体利润状态
const overallProfitStatus = computed(() => {
  if (!priceValidationData.value.length) {
    return { type: 'info', text: '未验算' };
  }
  
  const hasNegativeProfit = priceValidationData.value.some(item => {
    if (!item.profitRate) return false;
    const profitRateValue = parseFloat(item.profitRate.replace('%', ''));
    return !isNaN(profitRateValue) && profitRateValue < 0;
  });
  
  const hasLowProfit = priceValidationData.value.some(item => {
    if (!item.profitRate) return false;
    const profitRateValue = parseFloat(item.profitRate.replace('%', ''));
    return !isNaN(profitRateValue) && profitRateValue >= 0 && profitRateValue < minProfitRate;
  });
  
  if (hasNegativeProfit) {
    return { type: 'danger', text: '存在亏损' };
  } else if (hasLowProfit) {
    return { type: 'warning', text: '存在低利润' };
  } else {
    return { type: 'success', text: '利润正常' };
  }
});

// 运行价格预验算
const runPriceValidation = () => {
  // 清空之前的警告
  priceWarnings.value = [];
  
  // 检查必要的价格是否已设置
  if (!productForm.costPrice || productForm.costPrice <= 0) {
    ElMessage.warning('请先设置有效的成本价');
    return;
  }
  
  if (!productForm.currentPrice || productForm.currentPrice <= 0) {
    ElMessage.warning('请先设置有效的当前价格');
    return;
  }
  
  // 构建验算数据
  const validationData = [];
  
  // 1. 成本价
  validationData.push({
    type: '成本价',
    price: productForm.costPrice,
    discount: '-',
    finalPrice: productForm.costPrice,
    profit: 0,
    profitRate: '0%',
    status: '基准价格',
    statusType: 'info',
    highlight: false
  });
  
  // 2. 当前价格
  const currentProfit = productForm.currentPrice - productForm.costPrice;
  const currentProfitRate = (currentProfit / productForm.currentPrice * 100).toFixed(1) + '%';
  validationData.push({
    type: '当前价格',
    price: productForm.currentPrice,
    discount: productForm.originalPrice && productForm.originalPrice > productForm.currentPrice ? 
      (productForm.currentPrice / productForm.originalPrice * 10).toFixed(1) + '折' : '-',
    finalPrice: productForm.currentPrice,
    profit: currentProfit,
    profitRate: currentProfitRate,
    status: getMemberDiscountStatus(productForm.currentPrice),
    statusType: getMemberDiscountStatusType(productForm.currentPrice),
    highlight: true
  });
  
  // 3. 获取所有批发价
  const wholesalePrices: Array<{quantity: number, price: number}> = [];
  if (productForm.wholesalePrices && productForm.wholesalePrices.length > 0) {
    // 按数量从小到大排序
    const sortedWholesalePrices = [...productForm.wholesalePrices]
      .filter(item => item && typeof item === 'object' && item.quantity > 0 && item.price > 0)
      .sort((a, b) => a.quantity - b.quantity);
    
    // 添加每个批发价
    sortedWholesalePrices.forEach(item => {
      const wholesaleProfit = item.price - productForm.costPrice;
      const wholesaleProfitRate = (wholesaleProfit / item.price * 100).toFixed(1) + '%';
      
      validationData.push({
        type: `批发价(${item.quantity}+)`,
        price: item.price,
        discount: (item.price / productForm.currentPrice * 10).toFixed(1) + '折',
        finalPrice: item.price,
        profit: wholesaleProfit,
        profitRate: wholesaleProfitRate,
        status: getMemberDiscountStatus(item.price),
        statusType: getMemberDiscountStatusType(item.price),
        highlight: false,
        wholesaleItem: item
      });
      
      // 检查批发价是否低于成本
      if (item.price < productForm.costPrice) {
        priceWarnings.value.push(`批发价${item.quantity}+(¥${item.price.toFixed(2)})低于成本价(¥${productForm.costPrice.toFixed(2)})，将导致亏损`);
      } else if ((item.price - productForm.costPrice) / item.price * 100 < minProfitRate) {
        priceWarnings.value.push(`批发价${item.quantity}+(¥${item.price.toFixed(2)})的利润率过低，低于${minProfitRate}%的最低利润率要求`);
      }
      
      wholesalePrices.push(item);
    });
  }
  
  // 4. 会员折扣价
  const memberDiscounts: Array<{level: {name: string, discount: number, level: number}, price: number}> = [];
  if (memberLevels.value.length > 0) {
    // 按折扣从大到小排序（折扣越小，优惠越大）
    const sortedMemberLevels = [...memberLevels.value]
      .filter(level => level.level > 0 && level.level < 999) // 只考虑VIP会员，排除超级VIP
      .sort((a, b) => a.discount - b.discount);
    
    // 添加每个会员等级的折扣价
    sortedMemberLevels.forEach(level => {
      const discountPrice = productForm.currentPrice * (level.discount / 10);
      const discountProfit = discountPrice - productForm.costPrice;
      const discountProfitRate = (discountProfit / discountPrice * 100).toFixed(1) + '%';
      
      validationData.push({
        type: `${level.name}价格`,
        price: productForm.currentPrice,
        discount: level.discount + '折',
        finalPrice: discountPrice,
        profit: discountProfit,
        profitRate: discountProfitRate,
        status: getMemberDiscountStatus(discountPrice),
        statusType: getMemberDiscountStatusType(discountPrice),
        highlight: false,
        memberLevel: level
      });
      
      // 检查会员折扣价是否低于成本
      if (discountPrice < productForm.costPrice) {
        priceWarnings.value.push(`${level.name}折扣价(¥${discountPrice.toFixed(2)})低于成本价(¥${productForm.costPrice.toFixed(2)})，将导致亏损`);
      } else if ((discountPrice - productForm.costPrice) / discountPrice * 100 < minProfitRate) {
        priceWarnings.value.push(`${level.name}折扣价(¥${discountPrice.toFixed(2)})的利润率过低，低于${minProfitRate}%的最低利润率要求`);
      }
      
      memberDiscounts.push({
        level: level,
        price: discountPrice
      });
    });
  }
  
  // 5. 批发价+会员折扣组合
  if (wholesalePrices.length > 0 && memberDiscounts.length > 0) {
    // 对每个批发价和会员等级组合进行计算
    wholesalePrices.forEach(wholesale => {
      memberDiscounts.forEach(member => {
        const combinedPrice = wholesale.price * (member.level.discount / 10);
        const combinedProfit = combinedPrice - productForm.costPrice;
        const combinedProfitRate = (combinedProfit / combinedPrice * 100).toFixed(1) + '%';
        
        validationData.push({
          type: `批发${wholesale.quantity}+/${member.level.name}`,
          price: wholesale.price,
          discount: `${member.level.discount}折`,
          finalPrice: combinedPrice,
          profit: combinedProfit,
          profitRate: combinedProfitRate,
          status: getMemberDiscountStatus(combinedPrice),
          statusType: getMemberDiscountStatusType(combinedPrice),
          highlight: false
        });
        
        // 检查批发+会员折扣价是否低于成本
        if (combinedPrice < productForm.costPrice) {
          priceWarnings.value.push(`批发${wholesale.quantity}+/${member.level.name}组合价(¥${combinedPrice.toFixed(2)})低于成本价(¥${productForm.costPrice.toFixed(2)})，将导致亏损`);
        } else if ((combinedPrice - productForm.costPrice) / combinedPrice * 100 < minProfitRate) {
          priceWarnings.value.push(`批发${wholesale.quantity}+/${member.level.name}组合价(¥${combinedPrice.toFixed(2)})的利润率过低，低于${minProfitRate}%的最低利润率要求`);
        }
      });
    });
  }
  
  // 更新验算数据
  priceValidationData.value = validationData;
  
  // 显示验算结果
  showPriceValidation.value = true;
  
  // 显示验算完成提示
  ElMessage.success('价格预验算完成');
}
</script>

<style scoped>
.products-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-description {
  margin-bottom: 20px;
  padding: 10px;
  background-color: #ecf8ff;
  border-radius: 4px;
  border-left: 5px solid #50bfff;
}

.page-description p {
  margin: 0;
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
}

.search-area {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.price-input {
  width: 120px;
}

.price-separator {
  margin: 0 5px;
}

.price-container {
  display: flex;
  flex-direction: column;
}

.current-price {
  color: #f56c6c;
  font-weight: bold;
}

.original-price {
  color: #909399;
  font-size: 12px;
  text-decoration: line-through;
}

.low-stock {
  color: #f56c6c;
  font-weight: bold;
}

.stock-alert {
  color: #e6a23c;
  font-weight: bold;
}

.warning-threshold {
  color: #e6a23c;
  font-weight: bold;
}

.status-text {
  margin-left: 10px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.product-detail) {
  font-size: 14px;
  line-height: 1.8;
}

:deep(.product-detail h3) {
  margin-top: 0;
  margin-bottom: 15px;
  color: #303133;
  font-size: 18px;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 10px;
}

:deep(.detail-item) {
  margin-bottom: 10px;
}

:deep(.detail-item .label) {
  font-weight: bold;
  color: #606266;
  display: inline-block;
  width: 80px;
}

:deep(.detail-item .price) {
  color: #f56c6c;
  font-weight: bold;
}

:deep(.detail-item .original-price) {
  color: #909399;
  font-size: 12px;
  text-decoration: line-through;
  margin-left: 5px;
}

:deep(.detail-content) {
  margin-top: 5px;
  padding-left: 80px;
  white-space: pre-line;
}

:deep(.el-message-box__wrapper .el-message-box) {
  max-width: 600px;
  width: 100%;
}

.action-buttons {
  display: flex;
  gap: 5px;
}

.action-buttons .el-button {
  margin-left: 0 !important;
  margin-right: 0 !important;
}

/* 富文本编辑器样式 */
.editor-container {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}

.editor-header {
  padding: 0;
  border-bottom: 1px solid #dcdfe6;
  background-color: #f5f7fa;
}

.tab-content {
  padding: 15px;
  background-color: #fff;
}

.template-selector {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.template-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
}

.template-extra-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.template-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background-color: #f8f9fa;
  border-radius: 4px;
  border-left: 3px solid #409EFF;
}

.template-hint {
  color: #606266;
  font-size: 13px;
}

.editor-wrapper {
  position: relative;
}

.editor-readonly {
  opacity: 0.9;
}

.editor-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(245, 247, 250, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding: 20px;
  border-radius: 4px;
  pointer-events: none;
}

.lock-icon {
  font-size: 32px;
  color: #909399;
  margin-bottom: 10px;
}

.template-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.template-option .el-tag {
  margin-left: 10px;
}

:deep(.el-tabs__header) {
  margin-bottom: 0;
}

:deep(.el-tabs__nav) {
  border-radius: 4px 4px 0 0;
}

:deep(.el-tabs__item) {
  height: 40px;
  line-height: 40px;
  font-size: 14px;
  font-weight: 500;
}

:deep(.el-tabs__item.is-active) {
  font-weight: bold;
}

:deep(.el-tabs__content) {
  overflow: visible;
}

:deep(.el-select-dropdown__item) {
  padding: 0 12px;
}

/* 商品详情预览样式 */
:deep(.preview-container h2),
:deep(.ql-editor h2) {
  margin-top: 20px;
  margin-bottom: 10px;
  padding-bottom: 5px;
  border-bottom: 1px solid #ebeef5;
  color: #303133;
}

:deep(.preview-container ul),
:deep(.preview-container ol),
:deep(.ql-editor ul),
:deep(.ql-editor ol) {
  padding-left: 20px;
  margin-bottom: 15px;
}

:deep(.preview-container li),
:deep(.ql-editor li) {
  margin-bottom: 5px;
}

:deep(.preview-container p),
:deep(.ql-editor p) {
  margin-bottom: 10px;
  line-height: 1.6;
}

/* 批发价设置样式 */
.wholesale-card {
  margin-bottom: 20px;
}

.wholesale-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.wholesale-header-left {
  display: flex;
  align-items: center;
}

.wholesale-title {
  font-weight: bold;
  font-size: 14px;
}

.wholesale-help-icon {
  margin-left: 5px;
  color: #909399;
  cursor: help;
}

.wholesale-description {
  margin-bottom: 15px;
}

.current-price-text {
  color: #f56c6c;
  font-weight: bold;
}

.wholesale-tip {
  margin: 5px 0 0;
  font-size: 12px;
  color: #606266;
  line-height: 1.5;
}

.wholesale-table-container {
  margin-bottom: 15px;
}

.wholesale-table {
  margin-bottom: 15px;
}

.wholesale-input-group {
  display: flex;
  align-items: center;
}

.wholesale-prefix {
  margin-right: 5px;
  color: #606266;
  font-size: 14px;
  font-weight: bold;
}

.wholesale-quantity-input,
.wholesale-price-input {
  width: 100px;
}

.wholesale-unit {
  margin-left: 5px;
  color: #606266;
  font-size: 12px;
}

.discount-text {
  color: #67c23a;
  font-weight: bold;
}

.discount-invalid {
  color: #f56c6c;
}

.wholesale-preview {
  background-color: #f5f7fa;
  border-radius: 4px;
  padding: 15px;
  margin-top: 15px;
}

.wholesale-preview-title {
  font-weight: bold;
  margin-bottom: 15px;
  color: #303133;
  font-size: 14px;
}

.wholesale-preview-content {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.wholesale-preview-tag {
  font-size: 14px;
  padding: 6px 12px;
  border-radius: 4px;
  font-weight: bold;
  background-color: #fff1f0;
  border-color: #ffa39e;
  color: #f5222d;
}

/* 移除不再使用的样式 */
.wholesale-preview-price,
.wholesale-preview-discount {
  display: none;
}

.wholesale-empty {
  padding: 20px 0;
  text-align: center;
}

/* 批发价格查看样式 */
:deep(.wholesale-list) {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 5px;
}

:deep(.wholesale-view-item) {
  display: flex;
  align-items: center;
  background-color: #f5f7fa;
  border-radius: 4px;
  padding: 5px 10px;
}

:deep(.wholesale-badge) {
  font-weight: bold;
  margin-right: 5px;
}

:deep(.wholesale-price) {
  color: #f56c6c;
}

:deep(.no-wholesale) {
  color: #909399;
  font-style: italic;
}

/* 批发价格弹出框样式 */
.wholesale-popover {
  padding: 5px 0;
}

.wholesale-popover-title {
  font-weight: bold;
  margin-bottom: 10px;
  padding-bottom: 5px;
  border-bottom: 1px solid #ebeef5;
  color: #303133;
}

.wholesale-popover-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  padding: 5px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.wholesale-popover-quantity {
  font-weight: bold;
}

.wholesale-popover-price {
  color: #f56c6c;
}

.no-data {
  color: #909399;
  font-size: 12px;
}

.template-tip {
  margin: 5px 0 0;
  font-size: 12px;
  line-height: 1.5;
}

:deep(.el-alert) {
  margin-bottom: 10px;
}

:deep(.el-radio-group) {
  margin-bottom: 10px;
}

:deep(.el-radio) {
  margin-right: 15px;
}

:deep(.ql-container.ql-disabled) {
  background-color: #f5f7fa;
  opacity: 0.8;
}

:deep(.ql-editor.ql-disabled) {
  cursor: not-allowed;
}

.preview-container {
  padding: 20px;
  max-height: 600px;
  overflow-y: auto;
  background-color: #fff;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.stock-cell {
  display: flex;
  align-items: center;
}

.stock-alert-icon {
  margin-left: 5px;
  color: #e6a23c;
  font-size: 16px;
}

.stock-alert-summary {
  margin-bottom: 20px;
}

.stock-alert-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.stock-alert-desc {
  margin: 5px 0;
  font-size: 14px;
}

.stock-alert-actions {
  margin-top: 10px;
}

.cost-price {
  color: #909399;
  font-size: 12px;
}

.profit-text {
  font-weight: bold;
}

.profit-negative {
  color: #f56c6c;
}

.profit-warning {
  color: #e6a23c;
}

.profit-normal {
  color: #67c23a;
}

.profit-good {
  color: #409eff;
}

.discount-preview-card {
  margin-bottom: 20px;
}

.discount-preview-header {
  display: flex;
  align-items: center;
}

.discount-preview-title {
  font-weight: bold;
  font-size: 14px;
}

.discount-help-icon {
  margin-left: 5px;
  color: #909399;
  cursor: help;
}

.discount-preview-content {
  margin-bottom: 15px;
}

.discount-price {
  color: #f56c6c;
  font-weight: bold;
}

.wholesale-profit-warning,
.member-discount-warning {
  margin-top: 15px;
}

.price-validation-card {
  margin-bottom: 20px;
}

.price-validation-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.price-validation-description {
  margin-bottom: 15px;
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
}

.price-validation-summary {
  margin-top: 15px;
}

.highlight-price {
  font-weight: bold;
  color: #f56c6c;
  font-size: 14px;
}

.profit-negative {
  color: #f56c6c;
  font-weight: bold;
}

.warning-list {
  list-style: disc;
  padding-left: 20px;
  margin: 10px 0;
}

.warning-list li {
  margin-bottom: 5px;
  line-height: 1.5;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
  line-height: 1.4;
}
</style> 