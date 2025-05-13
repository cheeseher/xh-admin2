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
      
      <!-- 搜索区域 -->
      <div class="search-area">
        <el-form :inline="true" :model="searchForm" class="demo-form-inline">
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
            <el-select v-model="searchForm.status" placeholder="请选择" clearable>
              <el-option label="全部" value=""></el-option>
              <el-option label="上架中" value="on"></el-option>
              <el-option label="已下架" value="off"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="库存预警">
            <el-select v-model="searchForm.stockWarningStatus" placeholder="请选择" clearable style="width: 168px;">
              <el-option label="全部" value=""></el-option>
              <el-option label="已达预警" value="warning"></el-option>
              <el-option label="未达预警" value="normal"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <!-- 表格区域 -->
      <el-table :data="tableData" style="width: 100%" v-loading="loading" border stripe>
        <el-table-column prop="id" label="商品ID" width="80"></el-table-column>
        <el-table-column prop="name" label="商品名称" min-width="180"></el-table-column>
        <el-table-column prop="image" label="商品图片" width="120">
          <template #default="scope">
            <el-image
              v-if="scope.row.image"
              :src="scope.row.image"
              fit="cover"
              style="width: 80px; height: 80px; border-radius: 4px;"
              :preview-src-list="[scope.row.image]"
            >
              <template #error>
                <div class="image-error">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
            <div v-else class="no-image">
              <el-icon><Picture /></el-icon>
              <span>暂无图片</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="商品分类" width="100">
          <template #default="scope">
            {{ scope.row.category }}
          </template>
        </el-table-column>
        <el-table-column label="价格" width="120">
          <template #default="scope">
            <div class="price-container">
              <span class="current-price">¥{{ scope.row.currentPrice }}</span>
              <span class="usdt-price">{{ (scope.row.currentPrice * 0.14).toFixed(2) }} USDT</span>
              <span class="original-price" v-if="scope.row.originalPrice">¥{{ scope.row.originalPrice }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="成本价" width="100">
          <template #default="scope">
            <span>¥{{ scope.row.costPrice ? scope.row.costPrice.toFixed(2) : '0.00' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="80">
          <template #default="scope">
            <span :class="{ 'low-stock': scope.row.stock < (scope.row.stockWarning || 50) }">{{ scope.row.stock }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="stockWarning" label="库存预警值" width="100"></el-table-column>
        <el-table-column prop="sales" label="销量" width="80"></el-table-column>
        <el-table-column label="单笔购买限制" width="120">
          <template #default="scope">
            <span v-if="scope.row.purchaseLimit && scope.row.purchaseLimit.enabled">
              <el-tag size="small" type="warning">
                {{ scope.row.purchaseLimit.type === 'percent' ? 
                  `${scope.row.purchaseLimit.value}%` : `${scope.row.purchaseLimit.value}件` }}
              </el-tag>
            </span>
            <span v-else class="no-limit">不限制</span>
          </template>
        </el-table-column>
        <el-table-column prop="deliveryMethod" label="发货方式" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.deliveryMethod === '自动发货' ? 'success' : 'info'">
              {{ scope.row.deliveryMethod }}
            </el-tag>
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
        <el-table-column label="操作" width="300" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <el-button size="small" type="primary" @click="handleEditProduct(scope.row)">编辑</el-button>
              <el-button size="small" type="warning" @click="handlePackageManager(scope.row)">包管理</el-button>
              <el-button size="small" type="success" @click="handleInventory(scope.row)">库存管理</el-button>
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
      width="750px"
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
        <el-form-item label="商品图片" prop="image">
          <el-upload
            class="product-image-uploader"
            action="#"
            :http-request="handleImageUpload"
            :show-file-list="false"
            :on-exceed="handleExceed"
            :before-upload="beforeImageUpload"
          >
            <img v-if="productForm.image" :src="productForm.image" class="product-image" />
            <div v-else class="product-image-placeholder">
              <el-icon><Plus /></el-icon>
              <div class="el-upload__text">点击上传图片</div>
            </div>
          </el-upload>
          <div class="form-tip">请上传商品缩略图，建议尺寸 400x400 像素，最大不超过 2MB</div>
        </el-form-item>
        <el-form-item label="商品价格" prop="currentPrice">
          <el-input-number v-model="productForm.currentPrice" :min="0" :precision="2" :step="0.01" style="width: 100%;" @change="validateCostPrice"></el-input-number>
        </el-form-item>
        
        <el-form-item label="成本价" prop="costPrice">
          <el-input-number v-model="productForm.costPrice" :min="0" :max="productForm.currentPrice" :precision="2" :step="0.01" style="width: 100%;"></el-input-number>
          <div class="form-tip">商品的成本价格，用于计算利润，不可高于当前价格</div>
        </el-form-item>
        
        <el-form-item label="原价" prop="originalPrice">
          <el-input-number v-model="productForm.originalPrice" :min="0" :precision="2" :step="0.01" style="width: 100%;"></el-input-number>
          <div class="form-tip">商品的原始价格，用于显示折扣效果</div>
        </el-form-item>
        
        <el-form-item label="发货方式" prop="deliveryMethod">
          <el-radio-group v-model="productForm.deliveryMethod">
            <el-radio label="自动发货">自动发货</el-radio>
            <el-radio label="手动发货">手动发货</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="状态">
          <el-switch
            v-model="productForm.statusBool"
            active-text="上架"
            inactive-text="下架"
          ></el-switch>
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
        
        <el-form-item label="库存预警值" prop="stockWarning">
          <el-input-number v-model="productForm.stockWarning" :min="0" :precision="0" :step="1" style="width: 100%;"></el-input-number>
          <div class="form-tip">当库存低于此值时将发出预警提醒</div>
        </el-form-item>
        
        <el-form-item label="单笔购买限制">
          <div class="purchase-limit-container">
            <el-switch
              v-model="productForm.purchaseLimit.enabled"
              active-text="启用"
              inactive-text="不限制"
            />
            
            <template v-if="productForm.purchaseLimit.enabled">
              <div class="purchase-limit-settings">
                <el-radio-group v-model="productForm.purchaseLimit.type" class="limit-type-group">
                  <el-radio label="percent">库存百分比</el-radio>
                  <el-radio label="fixed">固定数量</el-radio>
                </el-radio-group>
                
                <div class="limit-value-container">
                  <el-input-number 
                    v-model="productForm.purchaseLimit.value" 
                    :min="1" 
                    :max="productForm.purchaseLimit.type === 'percent' ? 100 : undefined"
                    :precision="0" 
                    :step="1"
                    style="width: 120px;"
                  />
                  <span class="limit-unit">{{ productForm.purchaseLimit.type === 'percent' ? '%' : '件' }}</span>
                </div>
              </div>
              
              <div class="purchase-limit-preview" v-if="productForm.stock > 0">
                <span>示例: 若当前库存为 {{ productForm.stock }} 件，单笔最多可购买 
                  <strong class="highlight-text">{{ calculateMaxPurchase(productForm.stock, productForm.purchaseLimit) }}</strong> 件
                </span>
              </div>
            </template>
          </div>
          <div class="form-tip">设置用户单笔订单最大购买数量限制</div>
        </el-form-item>
        
        <el-form-item label="备注" prop="remark">
          <el-input type="textarea" v-model="productForm.remark" placeholder="请输入备注信息" :rows="3"></el-input>
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
    
    <!-- 库存管理抽屉 -->
    <el-drawer
      v-model="inventoryDrawerVisible"
      :title="`${selectedProduct?.name || ''} - 库存管理`"
      size="90%"
      :destroy-on-close="true"
    >
      <template #default>
        <div class="inventory-container">
          <div class="page-description">
            <p>管理该商品的库存账号，包括添加新库存、导入库存、编辑和删除等操作。</p>
          </div>
          
          <!-- 操作按钮 -->
          <div class="operation-buttons">
            <el-button type="primary" @click="handleImportInventory">批量导入</el-button>
            <el-button type="success" @click="handleAddInventory">新增库存</el-button>
          </div>
          
          <!-- 搜索区域 -->
          <div class="search-area">
            <el-form :inline="true" :model="inventorySearchForm" class="demo-form-inline">
              <el-form-item label="销售状态">
                <el-select v-model="inventorySearchForm.status" placeholder="请选择" clearable>
                  <el-option label="未售出" value="unsold"></el-option>
                  <el-option label="已售出" value="sold"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleInventorySearch">查询</el-button>
                <el-button @click="resetInventorySearch">重置</el-button>
              </el-form-item>
            </el-form>
          </div>
          
          <!-- 库存表格 -->
          <el-table :data="inventoryTableData" style="width: 100%" v-loading="inventoryLoading" border stripe>
            <el-table-column type="selection" width="55"></el-table-column>
            <el-table-column prop="cardId" label="卡密ID" width="120"></el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.status === 'unsold' ? 'success' : 'info'">
                  {{ scope.row.status === 'unsold' ? '未售出' : '已售出' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="cardInfo" label="卡密信息" min-width="200">
              <template #default="scope">
                <el-button link type="primary" @click="showCardInfo(scope.row)">查看</el-button>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间" width="180"></el-table-column>
            <el-table-column prop="remark" label="备注" min-width="120"></el-table-column>
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="scope">
                <el-button size="small" type="primary" @click="handleEditInventoryItem(scope.row)">编辑</el-button>
                <el-button size="small" type="danger" @click="handleDeleteInventoryItem(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <!-- 分页和批量操作 -->
          <div class="pagination-container">
            <div class="batch-actions">
              <el-button type="success" @click="handleExportInventory">导出数据</el-button>
              <el-button type="danger" @click="handleBatchDeleteInventory">批量删除</el-button>
            </div>
            <el-pagination
              v-model:current-page="inventoryCurrentPage"
              v-model:page-size="inventoryPageSize"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="inventoryTotal"
              @size-change="handleInventorySizeChange"
              @current-change="handleInventoryCurrentChange"
              :background="true"
            ></el-pagination>
          </div>
        </div>
      </template>
    </el-drawer>
    
    <!-- 新增库存弹窗 -->
    <el-dialog
      v-model="addInventoryDialogVisible"
      title="新增库存"
      width="600px"
      :destroy-on-close="true"
    >
      <el-form :model="inventoryForm" label-width="100px" :rules="inventoryRules" ref="inventoryFormRef">
        <el-form-item label="卡密信息" prop="cardInfo" required>
          <el-input
            type="textarea"
            v-model="inventoryForm.cardInfo"
            :rows="4"
            placeholder="请输入卡密信息，格式：用户名----密码----注册邮箱----邮箱密码"
          ></el-input>
        </el-form-item>
        <el-form-item label="状态" required>
          <el-select v-model="inventoryForm.status" placeholder="请选择状态" style="width: 100%;">
            <el-option label="未售出" value="unsold"></el-option>
            <el-option label="已售出" value="sold"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            type="textarea"
            v-model="inventoryForm.remark"
            :rows="2"
            placeholder="请输入备注信息"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addInventoryDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitInventoryForm">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 批量导入弹窗 -->
    <el-dialog
      v-model="importInventoryDialogVisible"
      title="批量导入库存"
      width="500px"
      :destroy-on-close="true"
      class="import-dialog"
    >
      <el-form :model="importForm" label-width="100px">
        <el-form-item label="备注">
          <el-input
            type="textarea"
            v-model="importForm.remark"
            :rows="2"
            placeholder="请输入备注信息"
          ></el-input>
        </el-form-item>
      </el-form>
      <div class="import-description">
        <h4>导入说明：</h4>
        <ol>
          <li>请按照以下格式准备txt文件：每行一个卡密</li>
          <li>支持txt文件导入，文件大小不超过2MB</li>
          <li>导入时将自动过滤重复的卡密信息</li>
        </ol>
      </div>
      <el-upload
        class="import-uploader"
        drag
        action="#"
        :auto-upload="false"
        :on-change="handleImportFileChange"
        :limit="1"
        accept=".txt,.csv"
      >
        <div class="upload-content">
          <el-icon class="upload-icon"><Upload /></el-icon>
          <div class="upload-text">将文件拖到此处，或<em>点击上传</em></div>
        </div>
        <div class="upload-tip">支持 .txt、.csv 格式文件，且不超过 2MB</div>
      </el-upload>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="importInventoryDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitImportInventory" :loading="importing">
            {{ importing ? '导入中...' : '开始导入' }}
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 安装包管理对话框 -->
    <el-dialog
      v-model="packageDialogVisible"
      title="安装包管理"
      width="780px"
      class="package-dialog"
    >
      <el-form :model="packageForm" label-width="100px" ref="packageFormRef">
        <el-form-item label="商品名称">
          <el-input v-model="selectedProduct.name" disabled></el-input>
        </el-form-item>
        
        <div class="package-list">
          <div v-for="(pkg, index) in packageForm.packages" :key="index" class="package-item">
            <div class="package-header">
              <h3>安装包 #{{ index + 1 }}</h3>
              <el-button 
                v-if="packageForm.packages.length > 1" 
                type="danger" 
                circle 
                size="small" 
                @click="removePackage(index)"
                :disabled="packageForm.packages.length <= 1"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
            
            <div class="package-content">
              <div class="package-left">
                <el-form-item :label="'图标'" :prop="'packages.' + index + '.icon'" class="icon-upload-item">
                  <el-upload
                    class="package-icon-uploader"
                    action="#"
                    :http-request="(file) => handleIconUpload(file, index)"
                    :show-file-list="false"
                    :on-exceed="handleExceed"
                    :before-upload="beforeIconUpload"
                  >
                    <img v-if="pkg.icon" :src="pkg.icon" class="package-icon" />
                    <div v-else class="package-icon-placeholder">
                      <el-icon><Plus /></el-icon>
                      <div class="el-upload__text">点击上传图标</div>
                    </div>
                  </el-upload>
                  <div class="form-tip">建议尺寸64x64像素</div>
                </el-form-item>
              </div>
              
              <div class="package-right">
                <el-form-item :label="'在前台显示'" :prop="'packages.' + index + '.visible'" class="visible-switch">
                  <el-switch
                    v-model="pkg.visible"
                    active-text="显示"
                    inactive-text="隐藏"
                  ></el-switch>
                </el-form-item>
              
                <el-form-item :label="'名称'" :prop="'packages.' + index + '.name'">
                  <el-input v-model="pkg.name" placeholder="请输入安装包名称"></el-input>
                </el-form-item>
                
                <el-form-item :label="'类型'" :prop="'packages.' + index + '.type'">
                  <el-radio-group v-model="pkg.type">
                    <el-radio label="file">文件上传</el-radio>
                    <el-radio label="link">链接地址</el-radio>
                  </el-radio-group>
                </el-form-item>
                
                <el-form-item 
                  v-if="pkg.type === 'link'" 
                  :label="'下载链接'" 
                  :prop="'packages.' + index + '.link'"
                >
                  <el-input v-model="pkg.link" placeholder="请输入安装包下载链接"></el-input>
                </el-form-item>
                
                <el-form-item 
                  v-if="pkg.type === 'file'" 
                  :label="'文件上传'" 
                  :prop="'packages.' + index + '.file'"
                >
                  <el-upload
                    class="package-file-uploader"
                    action="#"
                    :http-request="(file) => handleFileUpload(file, index)"
                    :on-exceed="handleExceed"
                    :before-upload="beforePackageFileUpload"
                    :limit="1"
                  >
                    <el-button type="primary">点击上传文件</el-button>
                    <template #tip>
                      <div class="el-upload__tip">
                        支持.apk, .ipa, .exe等格式，不超过500MB
                      </div>
                    </template>
                  </el-upload>
                  <div v-if="pkg.fileName" class="file-info">
                    <el-icon><Document /></el-icon>
                    <span>{{ pkg.fileName }}</span>
                    <el-button type="danger" link @click="removePackageFile(index)">
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </div>
                </el-form-item>
              </div>
            </div>
            
            <el-divider v-if="index < packageForm.packages.length - 1"></el-divider>
          </div>
        </div>
        
        <div class="package-actions">
          <el-button 
            type="primary" 
            @click="addPackage" 
            :disabled="packageForm.packages.length >= 3"
          >
            <el-icon><Plus /></el-icon> 添加安装包
          </el-button>
          <div v-if="packageForm.packages.length >= 3" class="limit-tip">
            最多支持3个安装包
          </div>
        </div>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="packageDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="savePackages">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Delete, QuestionFilled, Plus, Setting, ArrowDown, Lock, Check, Warning, Document, List, View, InfoFilled, Picture, Upload, UploadFilled } from '@element-plus/icons-vue'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

// 搜索表单
const searchForm = reactive({
  name: '',
  category: '',
  deliveryMethod: '',
  status: '',
  stockWarningStatus: ''
})

// 表格数据
const tableData = ref([
  { 
    id: 'P000001',
    name: 'Gmail邮箱-稳定可用 (手工)', 
    category: '谷歌邮箱',
    image: 'https://placekitten.com/400/400',
    currentPrice: 4.20,
    originalPrice: 6.50,
    stock: 384,
    stockWarning: 50,
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
    templateId: 2,
    costPrice: 2.50,
    remark: '优质账号，稳定性高',
    payMethods: ['usdt', 'wechat', 'alipay'],
    packages: [
      {
        name: 'Gmail官方安卓应用',
        icon: 'https://placekitten.com/128/128',
        type: 'link',
        link: 'https://play.google.com/store/apps/details?id=com.google.android.gm',
        fileName: '',
        visible: true
      }
    ],
    purchaseLimit: {
      type: 'percent',
      value: 20,
      enabled: true
    }
  },
  { 
    id: 'P000002',
    name: 'Gmail邮箱-稳定可用', 
    category: '谷歌邮箱',
    image: 'https://placekitten.com/401/401',
    currentPrice: 2.75,
    originalPrice: 4.00,
    stock: 575,
    stockWarning: 100,
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
    templateId: 0,
    costPrice: 1.50,
    remark: '热销产品，适合批量采购',
    payMethods: ['usdt', 'wechat', 'alipay'],
    purchaseLimit: {
      type: 'fixed',
      value: 50,
      enabled: true
    }
  },
  { 
    id: 'P000003',
    name: 'Gmail邮箱-1月以上', 
    category: '谷歌邮箱',
    image: 'https://placekitten.com/402/402',
    currentPrice: 5.50,
    originalPrice: 8.00,
    stock: 23,
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
    templateId: 2,
    costPrice: 3.20,
    stockWarning: 10,
    remark: '高质量账号，适合长期使用',
    payMethods: ['usdt', 'wechat', 'alipay']
  },
  { 
    id: 'P000004',
    name: 'Gmail邮箱-半年以上', 
    category: '谷歌邮箱',
    image: 'https://placekitten.com/403/403',
    currentPrice: 7.50,
    originalPrice: 12.00,
    stock: 740,
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
    templateId: 0,
    costPrice: 4.50,
    stockWarning: 100,
    remark: '半年以上老号，稳定性高',
    payMethods: ['usdt', 'wechat', 'alipay']
  },
  { 
    id: 'P000005',
    name: 'Gmail邮箱-美国稳定', 
    category: '谷歌邮箱',
    image: 'https://placekitten.com/404/404',
    currentPrice: 10.00,
    originalPrice: 18.00,
    stock: 1060,
    sales: 165,
    deliveryMethod: '自动发货',
    feature: '美国地区',
    status: '上架中',
    statusBool: true,
    createTime: '2024-03-05 08:00:00',
    templateMode: 'custom',
    templateId: 0,
    costPrice: 6.00,
    stockWarning: 200,
    remark: '美国地区IP，适合海外用户',
    payMethods: ['usdt', 'wechat', 'alipay'],
    packages: [
      {
        name: 'Gmail桌面版',
        icon: 'https://placekitten.com/130/130',
        type: 'link',
        link: 'https://www.google.com/gmail/about/',
        fileName: '',
        visible: true
      },
      {
        name: 'Gmail iOS版',
        icon: 'https://placekitten.com/129/129',
        type: 'link',
        link: 'https://apps.apple.com/us/app/gmail-email-by-google/id422689480',
        fileName: '',
        visible: false
      },
      {
        name: 'Gmail安卓版',
        icon: 'https://placekitten.com/128/128',
        type: 'link',
        link: 'https://play.google.com/store/apps/details?id=com.google.android.gm',
        fileName: '',
        visible: true
      }
    ]
  }])

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
  id: '',
  name: '',
  category: '',
  image: '',
  currentPrice: 0,
  originalPrice: 0,
  costPrice: 0,
  stock: 0,
  stockWarning: 10,
  sales: 0,
  deliveryMethod: '自动发货',
  feature: '',
  specialNote: '',
  description: '',
  instructions: '',
  afterSaleInfo: '',
  disclaimer: '',
  status: '上架中',
  statusBool: true,
  createTime: '',
  templateMode: 'custom' as 'custom' | 'bind',
  templateId: '',
  remark: '',
  wholesalePrices: [] as { quantity: number, price: number }[],
  payMethods: [] as string[],
  purchaseLimit: {
    type: 'percent', // 'percent'百分比 或 'fixed'固定数量
    value: 20, // 百分比值或固定数量值
    enabled: false // 是否启用购买限制
  }
})

// 确保productForm.wholesalePrices始终是一个数组
watch(() => productForm, () => {
  if (!Array.isArray(productForm.wholesalePrices)) {
    productForm.wholesalePrices = [];
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
    { required: true, message: '请设置商品价格', trigger: 'blur' }
  ],
  stockWarning: [
    { required: true, message: '请设置库存预警值', trigger: 'blur' }
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
    // 根据搜索条件和分页参数获取数据
    const filteredData = tableData.value.filter((item: any) => {
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
      if (searchForm.stockWarningStatus) {
        if (searchForm.stockWarningStatus === 'warning' && item.stock < item.stockWarning) {
          return false
        }
        if (searchForm.stockWarningStatus === 'normal' && item.stock >= item.stockWarning) {
          return false
        }
      }
      return true
    })
    
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
  searchForm.name = ''
  searchForm.category = ''
  searchForm.deliveryMethod = ''
  searchForm.status = ''
  searchForm.stockWarningStatus = ''
  currentPage.value = 1
  getProductList()
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

  // 构建商品图片HTML
  let imageHtml = '<div class="no-image-preview">暂无图片</div>'
  if (row.image) {
    imageHtml = `<div class="image-preview"><img src="${row.image}" alt="${row.name}" /></div>`
  }

  ElMessageBox.alert(
    `<div class="product-detail">
      <h3>${row.name}</h3>
      <div class="detail-item">
        <span class="label">商品图片：</span>
        ${imageHtml}
      </div>
      <div class="detail-item">
        <span class="label">商品分类：</span>
        <span>${row.category}</span>
      </div>
      <div class="detail-item">
        <span class="label">商品特性：</span>
        <span>${row.feature || '无'}</span>
      </div>
      <div class="detail-item">
        <span class="label">成本价：</span>
        <span class="cost-price">¥${row.costPrice || '未设置'}</span>
      </div>
      <div class="detail-item">
        <span class="label">价格：</span>
        <span class="price">¥${row.currentPrice}</span>
        ${row.originalPrice ? `<span class="original-price">¥${row.originalPrice}</span>` : ''}
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
  resetProductForm()
  dialogVisible.value = true
}

// 重置商品表单
const resetProductForm = () => {
  productForm.id = ''
  productForm.name = ''
  productForm.category = ''
  productForm.image = ''
  productForm.currentPrice = 0
  productForm.originalPrice = 0
  productForm.stock = 0
  productForm.sales = 0
  productForm.deliveryMethod = '自动发货'
  productForm.feature = ''
  productForm.specialNote = ''
  productForm.description = ''
  productForm.instructions = ''
  productForm.afterSaleInfo = ''
  productForm.disclaimer = ''
  productForm.status = '上架中'
  productForm.statusBool = true
  productForm.createTime = ''
  productForm.wholesalePrices = []
  productForm.templateMode = 'custom'
  productForm.templateId = ''
  productForm.costPrice = 0
  productForm.stockWarning = 0
  productForm.remark = ''
  productForm.payMethods = []
  productForm.purchaseLimit = {
    type: 'percent',
    value: 20,
    enabled: false
  }
}

// 编辑商品
const handleEditProduct = (row: any) => {
  dialogType.value = 'edit'
  Object.assign(productForm, {
    id: row.id,
    name: row.name,
    category: row.category,
    image: row.image,
    currentPrice: row.currentPrice,
    originalPrice: row.originalPrice,
    costPrice: row.costPrice,
    stock: row.stock,
    stockWarning: row.stockWarning,
    sales: row.sales,
    deliveryMethod: row.deliveryMethod,
    feature: row.feature,
    specialNote: row.specialNote,
    description: row.description,
    instructions: row.instructions,
    afterSaleInfo: row.afterSaleInfo,
    disclaimer: row.disclaimer,
    status: row.status,
    statusBool: row.statusBool,
    remark: row.remark,
    templateMode: row.templateMode || 'custom',
    templateId: row.templateId || ''
  })
  
  // 处理批发价格
  if (row.wholesalePrices && row.wholesalePrices.length > 0) {
    productForm.wholesalePrices = [...row.wholesalePrices]
  } else {
    productForm.wholesalePrices = []
  }
  
  // 处理支付方式
  if (row.payMethods && row.payMethods.length > 0) {
    productForm.payMethods = [...row.payMethods]
  } else {
    productForm.payMethods = []
  }
  
  // 处理购买限制
  if (row.purchaseLimit) {
    productForm.purchaseLimit = { ...row.purchaseLimit }
  } else {
    productForm.purchaseLimit = {
      type: 'percent',
      value: 20,
      enabled: false
    }
  }
  
  dialogVisible.value = true
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
        templateId: productForm.templateMode === 'bind' ? productForm.templateId : ''
      }
      
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
watch([() => searchForm.name, () => searchForm.category, () => searchForm.deliveryMethod, () => searchForm.status, () => searchForm.stockWarningStatus], () => {
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
const route = useRoute()
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
    productForm.templateId = String(template.id)
    applyTemplateContent(template)
    ElMessage.success(`已绑定"${template.name}"模板`)
  } else {
    applyTemplateContent(template)
    ElMessage.success(`已应用"${template.name}"模板内容`)
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
  const defaultTemplate = templateList.value.find(t => t.id === 1) || templateList.value[0]
  if (defaultTemplate) {
    if (productForm.templateMode === 'bind') {
      productForm.templateId = String(defaultTemplate.id)
      applyTemplateContent(defaultTemplate)
      ElMessage.success(`已绑定"${defaultTemplate.name}"模板`)
    } else {
      applyTemplateContent(defaultTemplate)
      ElMessage.success(`已插入"${defaultTemplate.name}"模板内容`)
    }
  }
}

// 跳转到模板设置页面
const goToTemplateSettings = () => {
  router.push('/templates')
}

// 添加批发价
const addWholesalePrice = () => {
  if (!productForm.currentPrice) {
    ElMessage.warning('请先设置当前价格，再添加批发价区间')
    return
  }
  
  if (!Array.isArray(productForm.wholesalePrices)) {
    productForm.wholesalePrices = []
  }
  
  // 检查批发价区间数量限制
  if (productForm.wholesalePrices.length >= 3) {
    ElMessage.warning('最多只能设置3个批发价区间')
    return
  }
  
  // 默认数量和价格
  const defaultQuantity = productForm.wholesalePrices.length > 0 ? 
    Math.max(...productForm.wholesalePrices.map(item => item.quantity)) + 50 : 10
  
  const defaultPrice = productForm.currentPrice * 0.9 // 默认为当前价格的9折
  
  productForm.wholesalePrices.push({
    quantity: defaultQuantity,
    price: parseFloat(defaultPrice.toFixed(2))
  })
  
  // 验证批发价格
  validateWholesalePrices()
}

// 移除批发价
const removeWholesalePrice = (index: number) => {
  productForm.wholesalePrices.splice(index, 1);
}

// 验证批发价格设置
const validateWholesalePrices = () => {
  // 确保wholesalePrices是一个数组
  if (!Array.isArray(productForm.wholesalePrices)) {
    productForm.wholesalePrices = [];
    return;
  }
  
  // 过滤掉无效的批发价（数量或价格为0的）
  productForm.wholesalePrices = productForm.wholesalePrices.filter(
    item => item && item.quantity > 0 && item.price > 0
  );
  
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

// 排序后的批发价格，用于预览
const sortedWholesalePrices = computed(() => {
  if (!productForm.wholesalePrices || !Array.isArray(productForm.wholesalePrices) || productForm.wholesalePrices.length === 0) {
    return [];
  }
  
  return [...productForm.wholesalePrices]
    .filter(item => item && item.quantity > 0 && item.price > 0)
    .sort((a, b) => a.quantity - b.quantity);
});

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
    productForm.templateId = ''
  }
}

// 获取选中的模板名称
const getSelectedTemplateName = () => {
  const selectedTemplate = templateList.value.find(t => String(t.id) === productForm.templateId)
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
  
  // 获取批发价信息
  const wholesalePrices = productForm.wholesalePrices && Array.isArray(productForm.wholesalePrices) 
    ? [...productForm.wholesalePrices].filter(item => item && typeof item === 'object' && item.quantity > 0 && item.price > 0)
    : [];
  
  // 如果没有设置批发价，提示用户
  if (wholesalePrices.length === 0) {
    ElMessage.warning('请先设置批发价区间后再进行预验算');
    return;
  }
  
  // 执行预验算
  performPriceValidation(wholesalePrices);
}

// 执行价格预验算的具体逻辑
const performPriceValidation = (wholesalePrices: Array<{quantity: number, price: number}>) => {
  // 构建验算数据
  const validationData = [];
  
  // 按价格从低到高排序
  wholesalePrices.sort((a, b) => a.price - b.price);
  
  // 获取最低批发价（最优惠批发价）
  const lowestWholesalePrice = wholesalePrices.length > 0 ? wholesalePrices[0].price : productForm.currentPrice;
  
  // 计算最低批发价折扣文本（仅用于内部计算，不显示）
  const lowestWholesaleDiscountText = (lowestWholesalePrice / productForm.currentPrice * 10).toFixed(1) + '折';
  
  // 获取最优惠会员折扣（从会员设置中获取）
  // 这里我们模拟从会员设置中获取最优惠的折扣值
  // 实际项目中应该从会员设置中获取
  const memberDiscounts = [100, 95, 90, 85]; // 普通用户100%，VIP1 95%，VIP2 90%，VIP3 85%
  const bestMemberDiscount = Math.min(...memberDiscounts); // 获取最小值，即最优惠的折扣
  const bestMemberDiscountRate = bestMemberDiscount / 100;
  const bestMemberDiscountText = (bestMemberDiscount / 10).toFixed(1) + '折';
  
  // 计算最终成交价（最优惠批发价 * 最优惠会员折扣）
  const finalPrice = lowestWholesalePrice * bestMemberDiscountRate;
  
  // 计算利润和利润率
  const profit = finalPrice - productForm.costPrice;
  const profitRate = (profit / finalPrice * 100).toFixed(1) + '%';
  
  // 判断是否亏损
  let status = '正常';
  let statusType = 'success';
  
  if (profit < 0) {
    status = '亏损';
    statusType = 'danger';
    priceWarnings.value.push(`最终成交价(¥${finalPrice.toFixed(2)})低于成本价(¥${productForm.costPrice.toFixed(2)})，将导致亏损！`);
  } else if (profit / finalPrice * 100 < 15) {
    status = '低利润';
    statusType = 'warning';
    priceWarnings.value.push(`最终成交价利润率仅为${profitRate}，建议提高售价以确保合理利润`);
  }
  
  // 构建验算数据
  validationData.push({
    type: '价格验算',
    price: productForm.currentPrice,
    memberDiscount: bestMemberDiscountText,
    wholesaleDiscount: `¥${lowestWholesalePrice.toFixed(2)}`, // 显示具体价格而非折扣
    lowestPrice: finalPrice,
    profit: profit,
    profitRate: profitRate,
    status: status,
    statusType: statusType,
    highlight: true
  });
  
  // 更新验算数据
  priceValidationData.value = validationData;
  
  // 显示验算结果
  showPriceValidation.value = true;
  
  // 显示验算完成提示
  ElMessage.success('价格预验算完成');
}

// 初始化
onMounted(() => {
  // 从URL参数中获取筛选条件
  const query = route.query
  if (query.name) {
    searchForm.name = query.name as string
  }
  if (query.id) {
    // 如果有商品ID参数，可以直接跳转到编辑页面或者高亮显示该商品
    console.log('商品ID:', query.id)
  }
  if (query.stockWarningStatus) {
    searchForm.stockWarningStatus = query.stockWarningStatus as string
  }
  
  // 获取商品列表
  getProductList()
})

// 预验算相关
const showPriceValidation = ref(false)
const priceValidationData = ref<any[]>([])
const priceWarnings = ref<string[]>([])
const overallProfitStatus = computed(() => {
  if (!priceValidationData.value || priceValidationData.value.length === 0) {
    return { type: 'info', text: '未验算' }
  }
  
  const hasLoss = priceValidationData.value.some(item => item.profit < 0)
  if (hasLoss) {
    return { type: 'danger', text: '亏损' }
  }
  
  const hasLowProfit = priceValidationData.value.some(
    item => item.profit > 0 && (item.profit / item.price * 100) < 10
  )
  if (hasLowProfit) {
    return { type: 'warning', text: '低利润' }
  }
  
  return { type: 'success', text: '利润正常' }
})

// 获取利润率样式
const getProfitRateClass = (price: number) => {
  if (!price || !productForm.costPrice) return ''
  
  const profit = price - productForm.costPrice
  const profitRate = profit / price * 100
  
  if (profitRate < 0) return 'profit-negative'
  if (profitRate < 10) return 'profit-low'
  if (profitRate >= 30) return 'profit-high'
  
  return 'profit-normal'
}

// 获取会员折扣状态
const getMemberDiscountStatus = (price: number) => {
  if (!price || !productForm.costPrice) return ''
  
  const profit = price - productForm.costPrice
  
  if (profit < 0) {
    return '亏损'
  }
  
  const profitRate = profit / price * 100
  
  if (profitRate < 10) {
    return '低利润'
  }
  
  return '正常'
}

// 获取会员折扣状态类型
const getMemberDiscountStatusType = (price: number) => {
  if (!price || !productForm.costPrice) return 'info'
  
  const profit = price - productForm.costPrice
  
  if (profit < 0) {
    return 'danger'
  }
  
  const profitRate = profit / price * 100
  
  if (profitRate < 10) {
    return 'warning'
  }
  
  return 'success'
}

// 检查是否有批发价
const hasBatchPrices = computed(() => {
  return productForm.wholesalePrices && productForm.wholesalePrices.length > 0;
});

// 验证成本价不能高于当前价格
const validateCostPrice = () => {
  if (productForm.costPrice > productForm.currentPrice) {
    productForm.costPrice = productForm.currentPrice;
    ElMessage.warning('成本价不能高于当前价格，已自动调整');
  }
}

// 在script setup部分添加以下函数
const getPayMethodType = (method: string) => {
  const typeMap: Record<string, string> = {
    'usdt': 'danger',
    'wechat': 'success',
    'alipay': 'primary'
  }
  return typeMap[method] || 'info'
}

const getPayMethodLabel = (method: string) => {
  const labelMap: Record<string, string> = {
    'usdt': 'USDT',
    'wechat': '微信',
    'alipay': '支付宝'
  }
  return labelMap[method] || '未知'
}

// 图片上传前的验证
const beforeImageUpload = (file: File) => {
  const isJPG = file.type === 'image/jpeg'
  const isPNG = file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPG && !isPNG) {
    ElMessage.error('上传图片只能是 JPG 或 PNG 格式!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('上传图片大小不能超过 2MB!')
    return false
  }
  return true
}

// 处理图片上传限制
const handleExceed = () => {
  ElMessage.warning('只能上传一张商品图片')
}

// 处理图片上传
const handleImageUpload = (options: any) => {
  const { file } = options
  // 这里应该调用实际的上传API，这里仅作演示，使用FileReader生成base64预览
  const reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onload = () => {
    productForm.image = reader.result as string
    ElMessage.success('图片上传成功')
  }
}

// 库存管理相关
const inventoryDrawerVisible = ref(false)
const selectedProduct = ref<any>(null)
const inventorySearchForm = reactive({
  status: ''
})
const inventoryTableData = ref([])
const inventoryLoading = ref(false)
const inventoryCurrentPage = ref(1)
const inventoryPageSize = ref(10)
const inventoryTotal = ref(0)

// 新增库存相关
const addInventoryDialogVisible = ref(false)
const inventoryForm = reactive({
  cardInfo: '',
  productId: '',
  status: 'unsold',
  remark: ''
})
const inventoryFormRef = ref<FormInstance>()
const inventoryRules = reactive<FormRules>({
  cardInfo: [
    { required: true, message: '请输入卡密信息', trigger: 'blur' }
  ],
  productId: [
    { required: true, message: '请选择关联商品', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
})

// 批量导入相关
const importInventoryDialogVisible = ref(false)
const importing = ref(false)
const importFile = ref<File | null>(null)

// 编辑相关
const editInventoryDialogVisible = ref(false)
const editInventoryFormRef = ref<FormInstance>()
const editInventoryForm = reactive({
  id: '',
  cardInfo: '',
  status: 'unsold',
  remark: ''
})

// 处理新增库存
const handleAddInventory = () => {
  addInventoryDialogVisible.value = true
  inventoryForm.cardInfo = ''
  inventoryForm.productId = ''
  inventoryForm.status = 'unsold'
  inventoryForm.remark = ''
}

// 提交新增库存表单
const submitInventoryForm = async () => {
  if (!inventoryFormRef.value) return
  
  await inventoryFormRef.value.validate((valid) => {
    if (valid) {
      // TODO: 调用API保存库存信息
      ElMessage.success('添加库存成功')
      addInventoryDialogVisible.value = false
      // 刷新库存列表
      loadInventoryData()
    }
  })
}

// 处理批量导入
const handleImportInventory = () => {
  importInventoryDialogVisible.value = true
  importFile.value = null
}

// 处理文件选择
const handleImportFileChange = (file: any) => {
  if (file.size > 2 * 1024 * 1024) {
    ElMessage.error('文件大小不能超过2MB')
    return false
  }
  importFile.value = file.raw
}

// 提交导入
const submitImportInventory = async () => {
  if (!importFile.value) {
    ElMessage.warning('请选择要导入的文件')
    return
  }
  
  importing.value = true
  try {
    // TODO: 调用API上传文件并导入库存
    await new Promise(resolve => setTimeout(resolve, 1500)) // 模拟上传过程
    ElMessage.success('导入成功')
    importInventoryDialogVisible.value = false
    // 刷新库存列表
    loadInventoryData()
  } catch (error) {
    ElMessage.error('导入失败，请重试')
  } finally {
    importing.value = false
  }
}

// 打开库存管理抽屉
const handleInventory = (row: any) => {
  selectedProduct.value = row
  inventoryDrawerVisible.value = true
  // 加载库存数据
  loadInventoryData()
}

const loadInventoryData = () => {
  inventoryLoading.value = true
  // 模拟加载数据
  setTimeout(() => {
    inventoryTableData.value = [
      {
        cardId: 'CARD001',
        status: 'unsold',
        cardInfo: 'username----password----email----emailpass',
        createTime: '2024-03-20 10:00:00',
        remark: '测试账号'
      },
      {
        cardId: 'CARD002',
        status: 'sold',
        cardInfo: 'username2----password2----email2----emailpass2',
        createTime: '2024-03-20 11:00:00',
        remark: '已售出账号'
      }
    ]
    inventoryTotal.value = 2
    inventoryLoading.value = false
  }, 500)
}

const handleInventorySearch = () => {
  loadInventoryData()
}

const resetInventorySearch = () => {
  inventorySearchForm.status = ''
  loadInventoryData()
}

const handleInventorySizeChange = (val: number) => {
  inventoryPageSize.value = val
  loadInventoryData()
}

const handleInventoryCurrentChange = (val: number) => {
  inventoryCurrentPage.value = val
  loadInventoryData()
}

const handleEditInventoryItem = (row: any) => {
  editInventoryForm.id = row.cardId
  editInventoryForm.cardInfo = row.cardInfo
  editInventoryForm.status = row.status
  editInventoryForm.remark = row.remark
  editInventoryDialogVisible.value = true
}

const handleDeleteInventoryItem = (row: any) => {
  ElMessageBox.confirm(
    '确定要删除这条库存记录吗？',
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
        message: '删除成功',
      })
      loadInventoryData()
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '已取消删除',
      })
    })
}

// 查看卡密信息
const showCardInfo = (row: any) => {
  ElMessageBox.alert(
    `<div class="card-info-container">
      <div class="card-info-item">
        <span class="label">卡密ID：</span>
        <span class="value">${row.cardId}</span>
      </div>
      <div class="card-info-item">
        <span class="label">卡密信息：</span>
        <span class="value">${row.cardInfo}</span>
      </div>
      <div class="card-info-item">
        <span class="label">创建时间：</span>
        <span class="value">${row.createTime}</span>
      </div>
      <div class="card-info-item">
        <span class="label">状态：</span>
        <span class="value ${row.status === 'unsold' ? 'text-success' : 'text-info'}">
          ${row.status === 'unsold' ? '未售出' : '已售出'}
        </span>
      </div>
      <div class="card-info-item">
        <span class="label">备注：</span>
        <span class="value">${row.remark || '无'}</span>
      </div>
    </div>`,
    '卡密详细信息',
    {
      dangerouslyUseHTMLString: true,
      confirmButtonText: '关闭',
      customClass: 'card-info-dialog'
    }
  )
}

// 导出数据
const handleExportInventory = () => {
  ElMessageBox.confirm(
    '确定要导出选中的库存数据吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    }
  )
    .then(() => {
      ElMessage({
        type: 'success',
        message: '导出成功，请在下载中查看文件'
      })
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '已取消导出'
      })
    })
}

// 批量删除
const handleBatchDeleteInventory = () => {
  ElMessageBox.confirm(
    '确定要批量删除选中的库存记录吗？此操作不可恢复！',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(() => {
      ElMessage({
        type: 'success',
        message: '批量删除成功'
      })
      loadInventoryData()
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '已取消删除'
      })
    })
}

// 添加样式
const styleContent = `
.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.drawer-header h3 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.header-buttons {
  display: flex;
  gap: 10px;
}

.inventory-drawer-content {
  padding: 20px;
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

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.batch-actions {
  display: flex;
  gap: 10px;
}

.import-dialog {
  .import-description {
    margin-bottom: 20px;
    padding: 15px;
    background-color: #f5f7fa;
    border-radius: 4px;
    border-left: 4px solid #409eff;

    h4 {
      margin: 0 0 10px;
      color: #303133;
      font-size: 16px;
    }

    ol {
      margin: 0;
      padding-left: 20px;
      color: #606266;
      font-size: 14px;
      line-height: 1.8;
    }
  }

  .import-uploader {
    margin-top: 20px;

    :deep(.el-upload) {
      width: 100%;
    }

    :deep(.el-upload-dragger) {
      width: 100%;
      height: 180px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
      border: 2px dashed #dcdfe6;
      border-radius: 6px;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: border-color .3s;

      &:hover {
        border-color: #409eff;
      }

      .upload-content {
        text-align: center;

        .upload-icon {
          font-size: 48px;
          color: #909399;
          margin-bottom: 10px;
        }

        .upload-text {
          color: #606266;
          font-size: 14px;
          line-height: 1.6;

          em {
            color: #409eff;
            font-style: normal;
          }
        }
      }
    }

    :deep(.upload-tip) {
      margin-top: 10px;
      color: #909399;
      font-size: 12px;
      line-height: 1.5;
      text-align: center;
    }
  }
}
`

// 导入相关的变量声明
const importForm = reactive({
  productId: '',
  remark: ''
})

// 安装包管理相关
const packageDialogVisible = ref(false)
const packageFormRef = ref<FormInstance>()
const packageForm = reactive({
  packages: [
    {
      name: '',
      icon: '',
      type: 'link',
      link: '',
      file: null,
      fileName: '',
      visible: true
    }
  ]
})

// 处理包管理
const handlePackageManager = (row: any) => {
  selectedProduct.value = row
  // 检查该商品是否已有安装包配置
  if (row.packages && Array.isArray(row.packages) && row.packages.length > 0) {
    packageForm.packages = JSON.parse(JSON.stringify(row.packages)).map((pkg: any) => ({
      ...pkg,
      visible: pkg.visible !== undefined ? pkg.visible : true // 确保visible字段存在
    }))
  } else {
    packageForm.packages = [
      {
        name: '',
        icon: '',
        type: 'link',
        link: '',
        file: null,
        fileName: '',
        visible: true
      }
    ]
  }
  packageDialogVisible.value = true
}

// 添加新的安装包
const addPackage = () => {
  if (packageForm.packages.length < 3) {
    packageForm.packages.push({
      name: '',
      icon: '',
      type: 'link',
      link: '',
      file: null,
      fileName: '',
      visible: true
    })
  }
}

// 移除安装包
const removePackage = (index: number) => {
  packageForm.packages.splice(index, 1)
}

// 上传图标处理
const handleIconUpload = (file: any, index: number) => {
  const fileObj = file.file
  // 验证文件类型和大小
  const isImage = fileObj.type.startsWith('image/')
  const isLt2M = fileObj.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('图标文件必须是图片格式!')
    return
  }
  if (!isLt2M) {
    ElMessage.error('图标大小不能超过 2MB!')
    return
  }

  // 使用FileReader读取文件并转为base64
  const reader = new FileReader()
  reader.readAsDataURL(fileObj)
  reader.onload = () => {
    packageForm.packages[index].icon = reader.result as string
  }
}

// 图标上传前的验证
const beforeIconUpload = (file: File) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('图标文件必须是图片格式!')
  }
  if (!isLt2M) {
    ElMessage.error('图标大小不能超过 2MB!')
  }
  return isImage && isLt2M
}

// 上传安装包文件处理
const handleFileUpload = (file: any, index: number) => {
  const fileObj = file.file
  // 验证文件大小
  const isLt500M = fileObj.size / 1024 / 1024 < 500

  if (!isLt500M) {
    ElMessage.error('文件大小不能超过 500MB!')
    return
  }

  // 在实际项目中，这里应该上传到服务器并获取URL
  // 这里为了演示，我们使用文件名
  packageForm.packages[index].fileName = fileObj.name
  packageForm.packages[index].file = fileObj
  packageForm.packages[index].link = '模拟文件上传链接：' + fileObj.name
}

// 安装包文件上传前的验证
const beforePackageFileUpload = (file: File) => {
  const isValidType = /\.(apk|ipa|exe|dmg|zip|rar|7z|pkg|deb|rpm)$/i.test(file.name)
  const isLt500M = file.size / 1024 / 1024 < 500

  if (!isValidType) {
    ElMessage.error('请上传有效的安装包文件格式!')
  }
  if (!isLt500M) {
    ElMessage.error('文件大小不能超过 500MB!')
  }
  return isValidType && isLt500M
}

// 移除已上传的安装包文件
const removePackageFile = (index: number) => {
  packageForm.packages[index].file = null
  packageForm.packages[index].fileName = ''
  packageForm.packages[index].link = ''
}

// 保存安装包配置
const savePackages = () => {
  // 验证包是否有名称
  for (let i = 0; i < packageForm.packages.length; i++) {
    const pkg = packageForm.packages[i]
    if (!pkg.name) {
      ElMessage.error(`安装包 #${i + 1} 需要填写名称`)
      return
    }
    if (pkg.type === 'link' && !pkg.link) {
      ElMessage.error(`安装包 #${i + 1} 需要填写下载链接`)
      return
    }
    if (pkg.type === 'file' && !pkg.fileName) {
      ElMessage.error(`安装包 #${i + 1} a需要上传文件`)
      return
    }
  }

  // 保存到当前商品
  if (!selectedProduct.value.packages) {
    selectedProduct.value.packages = []
  }
  
  // 保存基本信息，去除文件对象
  selectedProduct.value.packages = packageForm.packages.map(pkg => ({
    name: pkg.name,
    icon: pkg.icon,
    type: pkg.type,
    link: pkg.link,
    fileName: pkg.fileName,
    visible: pkg.visible
  }))
  
  ElMessage.success('安装包配置保存成功')
  packageDialogVisible.value = false
}

// 计算最大购买数量
const calculateMaxPurchase = (stock: number, purchaseLimit: any) => {
  if (purchaseLimit.type === 'percent') {
    return Math.floor(stock * (purchaseLimit.value / 100))
  } else if (purchaseLimit.type === 'fixed') {
    return Math.min(stock, purchaseLimit.value)
  } else {
    throw new Error('无效的购买限制类型')
  }
}
</script>

<style scoped>
.products-container {
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

.page-description {
  margin-bottom: 20px;
  padding: 10px 15px;
  background-color: #f0f9eb;
  border-radius: 4px;
  border-left: 4px solid #67c23a;
}

.page-description p {
  margin: 0;
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
}

.search-area {
  margin-bottom: 20px;
}

.price-container {
  display: flex;
  flex-direction: column;
}

.current-price {
  color: #f56c6c;
  font-weight: bold;
}

.usdt-price {
  color: #67c23a;
  font-size: 12px;
}

.original-price {
  color: #909399;
  text-decoration: line-through;
  font-size: 12px;
}

.cost-price {
  color: #67c23a;
  font-weight: bold;
}

.low-stock {
  color: #f56c6c;
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

:deep(.detail-item .cost-price) {
  color: #67c23a;
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
  gap: 8px;
}

.action-buttons .el-button {
  margin-left: 0 !important;
  margin-right: 0 !important;
  padding-left: 12px;
  padding-right: 12px;
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
  width: 100%;
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
  width: 100%;
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
  width: 100%;
}

.wholesale-table {
  margin-bottom: 15px;
  width: 100%;
}

.wholesale-input-group {
  display: flex;
  align-items: center;
  width: 100%;
}

.wholesale-prefix {
  margin-right: 5px;
  color: #606266;
  font-size: 14px;
  font-weight: bold;
}

.wholesale-quantity-input,
.wholesale-price-input {
  width: 120px;
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
  width: 100%;
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
  width: 100%;
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

.search-area .el-form-item .el-select {
  width: 158px !important;
}

.search-area :deep(.el-form-item[label="状态"] .el-select) {
  width: 158px !important;
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

/* 价格预验算相关样式 */
.price-validation-card {
  margin-top: 10px;
  margin-bottom: 20px;
}

.price-validation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price-validation-description {
  margin-bottom: 15px;
  color: #606266;
  font-size: 14px;
}

.highlight-price {
  font-weight: bold;
  color: #409EFF;
}

.profit-negative {
  color: #F56C6C;
  font-weight: bold;
}

.profit-low {
  color: #E6A23C;
  font-weight: bold;
}

.profit-normal {
  color: #67C23A;
}

.profit-high {
  color: #409EFF;
  font-weight: bold;
}

.profit-text {
  font-weight: bold;
}

/* 价格预警样式 */
:deep(.price-warnings) {
  text-align: left;
}

:deep(.price-warnings ul) {
  padding-left: 20px;
  margin: 10px 0;
}

:deep(.price-warnings li) {
  margin-bottom: 8px;
  line-height: 1.5;
  color: #E6A23C;
}

:deep(.price-warnings strong) {
  color: #F56C6C;
}

:deep(.el-message-box__message p) {
  margin: 0;
  line-height: 1.5;
}

.no-image {
  width: 80px;
  height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #909399;
  font-size: 12px;
  background-color: #f5f7fa;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
}

.no-image .el-icon {
  font-size: 24px;
  margin-bottom: 5px;
}

.image-error {
  width: 80px;
  height: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #f56c6c;
  background-color: #fef0f0;
  border: 1px solid #fde2e2;
  border-radius: 4px;
}

.product-image-uploader {
  display: block;
  width: 100%;
}

.product-image-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
}

.product-image-uploader .el-upload:hover {
  border-color: #409EFF;
}

.product-image-placeholder {
  width: 180px;
  height: 180px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #8c939d;
}

.product-image-placeholder .el-icon {
  font-size: 28px;
  margin-bottom: 8px;
}

.product-image {
  width: 180px;
  height: 180px;
  display: block;
  object-fit: cover;
}

.image-preview {
  max-width: 200px;
  margin-top: 5px;
}

.image-preview img {
  width: 100%;
  max-height: 150px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #ebeef5;
}

.no-image-preview {
  width: 150px;
  height: 100px;
  margin-top: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #909399;
  background-color: #f5f7fa;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
}

/* 库存管理样式 */
.inventory-container {
  padding: 20px;
}

.operation-buttons {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.inventory-container .page-description {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.inventory-container .page-description p {
  margin: 0;
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
}

.inventory-container .search-area {
  margin-bottom: 20px;
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.inventory-container .pagination-container {
  margin-top: 20px;
  padding: 10px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.batch-actions {
  display: flex;
  gap: 10px;
}

/* 卡密信息弹窗样式 */
:deep(.card-info-dialog) {
  max-width: 500px;
  width: 100%;
}

:deep(.card-info-container) {
  padding: 10px;
}

:deep(.card-info-item) {
  margin-bottom: 12px;
  display: flex;
  align-items: flex-start;
}

:deep(.card-info-item .label) {
  width: 80px;
  color: #606266;
  font-weight: bold;
}

:deep(.card-info-item .value) {
  flex: 1;
  word-break: break-all;
}

:deep(.card-info-item .text-success) {
  color: #67c23a;
}

:deep(.card-info-item .text-info) {
  color: #909399;
}

/* 表格内容样式 */
.el-table .unsold {
  color: #67c23a;
}

.el-table .sold {
  color: #909399;
}

.import-tips {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.import-tips h4 {
  margin: 0 0 10px 0;
  color: #303133;
}

.import-tips p {
  margin: 5px 0;
  color: #606266;
  font-size: 14px;
}

.import-uploader {
  text-align: center;
  padding: 20px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: border-color .3s;
}

.import-uploader:hover {
  border-color: #409eff;
}

.el-upload__tip {
  font-size: 12px;
  color: #909399;
  margin-top: 10px;
}

/* 添加上传区域样式 */
.upload-area {
  margin: 20px 0;
}

.upload-content {
  padding: 20px 0;
  text-align: center;
}

.upload-icon {
  font-size: 48px;
  color: #909399;
  margin-bottom: 10px;
}

.upload-text {
  color: #606266;
  font-size: 14px;
}

.upload-tip {
  margin-top: 10px;
  padding: 10px;
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
}

.upload-tip p {
  margin: 5px 0;
}

/* 导入弹窗样式 */
.import-form {
  padding: 0 20px;
}

.upload-wrapper {
  margin: 20px 0;
}

.upload-area {
  width: 100%;
}

:deep(.el-upload-dragger) {
  width: 100%;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-content {
  text-align: center;
}

.upload-icon {
  font-size: 48px;
  color: #909399;
  margin-bottom: 10px;
}

.upload-text {
  color: #606266;
  font-size: 14px;
}

.upload-text em {
  color: #409EFF;
  font-style: normal;
}

.upload-tip {
  margin-top: 15px;
  padding: 10px;
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
}

.upload-tip p {
  margin: 5px 0;
}

/* 导入弹窗样式 */
.import-dialog {
  :deep(.el-dialog__body) {
    padding: 20px 30px;
  }
}

.import-description {
  margin-bottom: 20px;
}

.import-description h4 {
  font-size: 14px;
  color: #333;
  margin: 0 0 10px 0;
}

.import-description ol {
  margin: 0;
  padding-left: 20px;
  color: #666;
  font-size: 14px;
  line-height: 1.8;
}

.import-uploader {
  text-align: center;
  padding: 20px;
  background: #fafafa;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
  position: relative;
  transition: border-color .3s;
}

.import-uploader:hover {
  border-color: #409eff;
}

.select-file-btn {
  display: inline-block;
  margin-bottom: 10px;
}

.upload-tip {
  font-size: 12px;
  color: #666;
  margin-top: 10px;
}

:deep(.el-upload-dragger) {
  width: 100%;
  border: none;
  background: none;
  box-shadow: none;
}

:deep(.el-upload) {
  width: 100%;
}

:deep(.el-upload-dragger:hover) {
  border: none;
  background: none;
}

.package-item {
  margin-bottom: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.package-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.package-header h3 {
  margin: 0;
  font-size: 16px;
  color: #409EFF;
}

.package-content {
  display: flex;
  gap: 15px;
}

.package-left {
  width: 120px;
  flex-shrink: 0;
}

.package-right {
  flex: 1;
}

.icon-upload-item :deep(.el-form-item__label) {
  display: none;
}

.visible-switch {
  margin-bottom: 15px;
}

.package-icon-uploader {
  display: block;
  width: 100%;
}

.package-icon-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
  width: 100px;
  height: 100px;
}

.package-icon-uploader .el-upload:hover {
  border-color: #409EFF;
}

.package-icon-placeholder {
  width: 100px;
  height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #8c939d;
}

.package-icon-placeholder .el-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.package-icon {
  width: 100px;
  height: 100px;
  display: block;
  object-fit: cover;
}

.form-tip {
  margin-top: 5px;
  font-size: 12px;
  color: #909399;
  text-align: center;
}

.file-info {
  display: flex;
  align-items: center;
  margin-top: 8px;
  padding: 8px 12px;
  background-color: #f0f9eb;
  border-radius: 4px;
  font-size: 12px;
}

.file-info .el-icon {
  color: #67c23a;
  margin-right: 8px;
}

.file-info span {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.package-actions {
  margin-top: 20px;
  display: flex;
  align-items: center;
}

.limit-tip {
  margin-left: 10px;
  color: #909399;
  font-size: 12px;
}

.package-dialog :deep(.el-dialog__body) {
  padding: 20px 25px;
}

.package-list {
  max-height: 500px;
  overflow-y: auto;
  padding-right: 5px;
}

.package-file-uploader :deep(.el-upload__tip) {
  font-size: 12px;
  line-height: 1.2;
  margin-top: 5px;
}

.purchase-limit-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
}

.purchase-limit-settings {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 10px;
  width: 100%;
}

.limit-type-group {
  margin-right: 20px;
}

.limit-value-container {
  display: flex;
  align-items: center;
}

.limit-unit {
  margin-left: 5px;
  color: #606266;
  font-size: 14px;
}

.purchase-limit-preview {
  margin-top: 10px;
  padding: 8px 12px;
  background-color: #f0f9eb;
  border-radius: 4px;
  color: #606266;
  font-size: 13px;
  width: 100%;
}

.highlight-text {
  font-weight: bold;
  color: #409EFF;
}

.no-limit {
  color: #909399;
  font-size: 12px;
}
</style>