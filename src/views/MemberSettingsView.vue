<template>
  <div class="member-settings-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>会员等级设置</span>
          <el-button type="primary" @click="handleAddLevel">新增会员</el-button>
        </div>
      </template>
      
      <div class="page-description">
        <p>管理会员等级和会员折扣设置，会员等级折扣适用于用户购买商品时的优惠。用户注册账户即可享受9折优惠。用户累计充值金额达到设定条件时，系统将自动升级用户的会员等级。</p>
      </div>
      
      <!-- 会员等级表格 -->
      <el-table :data="memberLevels" style="width: 100%" v-loading="loading" border stripe>
        <el-table-column type="index" label="序号" width="60"></el-table-column>
        <el-table-column prop="name" label="等级名称" min-width="120">
          <template #default="scope">
            <div class="level-name-cell">
              <el-tag :type="getLevelTagType(scope.row.level)">{{ scope.row.name }}</el-tag>
              <el-tag v-if="scope.row.level === 999 && !scope.row.isEnabled" type="info" size="small" effect="plain" style="margin-left: 5px;">已禁用</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="level" label="等级" width="80"></el-table-column>
        <el-table-column prop="condition" label="累充升级条件" min-width="150">
          <template #default="scope">
            <span v-if="scope.row.level === 999">欢迎洽谈</span>
            <span v-else>{{ scope.row.condition }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="discount" label="会员折扣" width="120">
          <template #default="scope">
            <span v-if="scope.row.level === 999">欢迎洽谈</span>
            <span v-else>{{ scope.row.discount }}%</span>
            <span v-if="scope.row.isCustomDiscount && scope.row.level !== 999">(可调整)</span>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="备注" min-width="200"></el-table-column>
        <el-table-column prop="introduction" label="会员介绍" min-width="200"></el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <el-button size="small" type="primary" @click="handleEditLevel(scope.row)">编辑</el-button>
              <el-button 
                size="small" 
                type="danger" 
                @click="handleDeleteLevel(scope.row)"
                :disabled="scope.row.level === 0 || scope.row.level === 999 || scope.row.isSystemDefault"
              >删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

    </el-card>
    
    <!-- 会员等级表单对话框 -->
    <el-dialog
      v-model="levelDialogVisible"
      :title="dialogType === 'add' ? '新增会员等级' : '编辑会员等级'"
      width="600px"
    >
      <el-form :model="levelForm" label-width="100px" :rules="levelRules" ref="levelFormRef">
        <!-- 超级VIP特有设置 -->
        <template v-if="levelForm.level === 999 || levelForm.name === '超级VIP'">
          <el-form-item label="等级名称" prop="name">
            <el-input v-model="levelForm.name" placeholder="请输入等级名称"></el-input>
          </el-form-item>
          <el-form-item label="备注" prop="description">
            <el-input 
              v-model="levelForm.description" 
              type="textarea" 
              :rows="2" 
              placeholder="请输入备注说明"
            ></el-input>
          </el-form-item>
          <el-form-item label="会员介绍" prop="introduction">
            <el-input 
              v-model="levelForm.introduction" 
              type="textarea" 
              :rows="3" 
              placeholder="请输入会员等级权益介绍"
            ></el-input>
          </el-form-item>
          <el-form-item label="启用状态">
            <el-switch v-model="levelForm.isEnabled"></el-switch>
            <span class="form-tip">关闭后，超级VIP功能将被禁用，后台可选择用户为VIP1/2/3</span>
          </el-form-item>
        </template>
        
        <!-- 普通会员等级设置 -->
        <template v-else>
          <el-form-item label="等级名称" prop="name">
            <el-input v-model="levelForm.name" placeholder="请输入等级名称"></el-input>
          </el-form-item>
          <el-form-item label="等级" prop="level">
            <el-input-number 
              v-model="levelForm.level" 
              :min="1" 
              :max="10" 
              :disabled="true"
              :controls="false"
            ></el-input-number>
            <span class="form-tip">系统自动生成，无需填写</span>
          </el-form-item>
          <el-form-item label="累充升级条件" prop="minRechargeTotal">
            <el-input-number 
              v-model="levelForm.minRechargeTotal" 
              :min="0" 
              :precision="0" 
              :step="100"
              style="width: 180px;"
            ></el-input-number>
            <span class="form-tip">元（用户累计充值达到此金额时自动升级）</span>
          </el-form-item>
          <el-form-item label="会员折扣" prop="discount">
            <el-input-number 
              v-model="levelForm.discount" 
              :min="0" 
              :max="100" 
              :precision="1" 
              :step="0.1"
              style="width: 180px;"
            ></el-input-number>
            <span class="form-tip">%（百分比，例如：50表示5折，即0.5折）</span>
          </el-form-item>
          <el-form-item label="备注" prop="description">
            <el-input 
              v-model="levelForm.description" 
              type="textarea" 
              :rows="2" 
              placeholder="请输入备注说明"
            ></el-input>
          </el-form-item>
          <el-form-item label="会员介绍" prop="introduction">
            <el-input 
              v-model="levelForm.introduction" 
              type="textarea" 
              :rows="3" 
              placeholder="请输入会员等级权益介绍"
            ></el-input>
          </el-form-item>
        </template>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="levelDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitLevelForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

// 加载状态
const loading = ref(false)

// 会员等级相关
const memberLevels = ref([
  {
    id: 5,
    name: '普通',
    level: 0,
    condition: '默认等级',
    minRechargeTotal: 0,
    monthlyConsumption: 0,
    consecutiveMonths: 3,
    discount: 90,
    description: '注册账户即可享受9折优惠',
    icon: 'https://element-plus.org/images/element-plus-logo.svg',
    introduction: '注册账户即可享受所有商品9折优惠',
    isSystemDefault: true // 标记为系统默认
  },
  {
    id: 2,
    name: 'VIP1',
    level: 1,
    condition: '累计充值满100元',
    minRechargeTotal: 100,
    monthlyConsumption: 1000,
    consecutiveMonths: 1,
    discount: 95,
    description: '储值用户享受95折优惠',
    icon: 'https://element-plus.org/images/element-plus-logo.svg',
    introduction: 'VIP1用户享受商品95折优惠'
  },
  {
    id: 3,
    name: 'VIP2',
    level: 2,
    condition: '累计充值满1000元',
    minRechargeTotal: 1000,
    monthlyConsumption: 2000,
    consecutiveMonths: 2,
    discount: 90,
    description: '中级会员，享受9折优惠',
    icon: 'https://element-plus.org/images/element-plus-logo.svg',
    introduction: 'VIP2用户享受商品9折优惠'
  },
  {
    id: 4,
    name: 'VIP3',
    level: 3,
    condition: '累计充值满5000元',
    minRechargeTotal: 5000,
    monthlyConsumption: 5000,
    consecutiveMonths: 3,
    discount: 85,
    description: '大客户，可定期回访与商务交流',
    icon: 'https://element-plus.org/images/element-plus-logo.svg',
    introduction: 'VIP3用户享受商品85折优惠及专属客服'
  },
  {
    id: 1,
    name: '超级VIP',
    level: 999,
    condition: '欢迎洽谈',
    minRechargeTotal: 0,
    monthlyConsumption: 0,
    consecutiveMonths: 3,
    discount: 0,
    description: '特殊客户，经理可为每位超级VIP用户单独设置折扣',
    icon: 'https://element-plus.org/images/element-plus-logo.svg',
    introduction: '超级VIP用户享受定制商品折扣及最高级别服务',
    isCustomDiscount: true,
    isEnabled: true,
    isSystemDefault: true // 标记为系统默认
  }
])

// 对话框相关
const levelDialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')

// 表单相关
const levelFormRef = ref<FormInstance>()

const levelForm = reactive({
  id: 0,
  name: '',
  icon: '',
  level: 0,
  condition: '',
  minRechargeTotal: 0, // 累计充值金额
  monthlyConsumption: 0,
  consecutiveMonths: 3,
  discount: 100,
  description: '',
  introduction: '',
  isCustomDiscount: false,
  isEnabled: true,
  isSystemDefault: false
})

// 表单验证规则
const levelRules = reactive<FormRules>({
  name: [
    { required: true, message: '请输入等级名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  minRechargeTotal: [
    { required: true, message: '请输入累计充值升级条件', trigger: 'blur' }
  ],
  discount: [
    { required: true, message: '请输入会员折扣', trigger: 'blur' }
  ],
  introduction: [
    { required: true, message: '请输入会员介绍', trigger: 'blur' }
  ]
})

// 获取等级标签类型
const getLevelTagType = (level: number) => {
  if (level === 999) {
    return 'danger'
  } else if (level === 0) {
    return 'primary'
  }
  // 所有普通VIP统一使用warning颜色
  return 'warning'
}

// 新增会员等级
const handleAddLevel = () => {
  dialogType.value = 'add'
  levelForm.id = 0
  levelForm.name = ''
  levelForm.level = memberLevels.value.length > 0 ? Math.max(...memberLevels.value.map(item => item.level < 100 ? item.level : 0)) + 1 : 1
  levelForm.condition = ''
  levelForm.minRechargeTotal = 0
  levelForm.monthlyConsumption = 0
  levelForm.consecutiveMonths = 3
  levelForm.discount = 100
  levelForm.description = ''
  levelForm.introduction = ''
  levelForm.icon = ''
  levelForm.isCustomDiscount = false
  levelForm.isEnabled = true
  levelForm.isSystemDefault = false
  levelDialogVisible.value = true
}

// 编辑会员等级
const handleEditLevel = (row: any) => {
  dialogType.value = 'edit'
  levelForm.id = row.id
  levelForm.name = row.name
  levelForm.level = row.level
  levelForm.condition = row.condition
  levelForm.minRechargeTotal = row.minRechargeTotal
  levelForm.monthlyConsumption = row.monthlyConsumption
  levelForm.consecutiveMonths = row.consecutiveMonths || 3
  levelForm.discount = row.discount
  levelForm.description = row.description
  levelForm.introduction = row.introduction
  levelForm.icon = row.icon
  levelForm.isCustomDiscount = row.isCustomDiscount
  levelForm.isEnabled = row.isEnabled
  levelForm.isSystemDefault = row.isSystemDefault
  
  levelDialogVisible.value = true
}

// 删除会员等级
const handleDeleteLevel = (row: any) => {
  if (row.level === 0 || row.level === 999 || row.isSystemDefault) {
    ElMessage.warning('系统默认等级不能删除')
    return
  }
  
  ElMessageBox.confirm(
    `确定要删除会员等级"${row.name}"吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      // 模拟删除操作
      const index = memberLevels.value.findIndex(item => item.id === row.id)
      if (index !== -1) {
        memberLevels.value.splice(index, 1)
      }
      ElMessage.success(`会员等级"${row.name}"已删除`)
    })
    .catch(() => {
      ElMessage.info('已取消删除')
    })
}

// 提交会员等级表单
const submitLevelForm = async () => {
  if (!levelFormRef.value) return
  
  await levelFormRef.value.validate((valid, fields) => {
    if (valid) {
      // 获取当前时间
      const now = new Date()
      
      // 禁止新增超级会员
      if (dialogType.value === 'add' && (levelForm.level === 999 || levelForm.name === '超级VIP')) {
        ElMessage.error('不允许新增超级会员')
        return
      }
      
      // 如果是超级VIP，设置特殊属性
      if (levelForm.level === 999 || levelForm.name === '超级VIP') {
        levelForm.level = 999
        levelForm.name = '超级VIP'
        levelForm.condition = '欢迎洽谈'
        levelForm.minRechargeTotal = 0
        levelForm.monthlyConsumption = 0
        levelForm.consecutiveMonths = 3
        levelForm.isCustomDiscount = true
        levelForm.isSystemDefault = true
        // 超级VIP不设置统一折扣，由用户管理页面单独设置
        levelForm.discount = 0
      } else {
        // 根据minRechargeTotal更新condition字段
        levelForm.condition = `累计充值满${levelForm.minRechargeTotal}元`
      }
      
      if (dialogType.value === 'add') {
        // 检查等级是否已存在
        const existingLevel = memberLevels.value.find(item => item.level === levelForm.level)
        if (existingLevel) {
          ElMessage.error(`等级 ${levelForm.level} 已存在，请选择其他等级`)
          return
        }
        
        // 模拟添加操作
        const newId = Math.max(...memberLevels.value.map(item => item.id), 0) + 1
        memberLevels.value.push({
          id: newId,
          name: levelForm.name,
          level: levelForm.level,
          condition: levelForm.condition,
          minRechargeTotal: levelForm.minRechargeTotal,
          monthlyConsumption: levelForm.monthlyConsumption,
          consecutiveMonths: levelForm.consecutiveMonths,
          discount: levelForm.discount,
          description: levelForm.description,
          introduction: levelForm.introduction,
          icon: levelForm.icon,
          isCustomDiscount: levelForm.isCustomDiscount,
          isEnabled: levelForm.isEnabled,
          isSystemDefault: levelForm.isSystemDefault
        })
        ElMessage.success('新增会员等级成功')
      } else {
        // 模拟编辑操作
        const index = memberLevels.value.findIndex(item => item.id === levelForm.id)
        if (index !== -1) {
          memberLevels.value[index] = {
            ...memberLevels.value[index],
            name: levelForm.name,
            condition: levelForm.condition,
            minRechargeTotal: levelForm.minRechargeTotal,
            monthlyConsumption: levelForm.monthlyConsumption,
            consecutiveMonths: levelForm.consecutiveMonths,
            discount: levelForm.discount,
            description: levelForm.description,
            introduction: levelForm.introduction,
            icon: levelForm.icon,
            isCustomDiscount: levelForm.isCustomDiscount,
            isEnabled: levelForm.isEnabled,
            isSystemDefault: levelForm.isSystemDefault
          }
        }
        ElMessage.success('编辑会员等级成功')
      }
      levelDialogVisible.value = false
    } else {
      console.log('表单验证失败', fields)
    }
  })
}

// 初始化
onMounted(() => {
  // 可以在这里加载数据
})
</script>

<style scoped>
.member-settings-container {
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

.action-buttons {
  display: flex;
  gap: 5px;
}

.action-buttons .el-button {
  margin-left: 0 !important;
  margin-right: 0 !important;
}

.form-tip {
  margin-left: 10px;
  color: #909399;
  font-size: 12px;
}

/* 充值示例样式 */
.recharge-preview h3 {
  margin: 0 0 15px 0;
  font-size: 16px;
  color: #303133;
}

.recharge-examples {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.recharge-example-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.recharge-example-item .amount {
  font-weight: bold;
  color: #409EFF;
}

.auto-upgrade-tip {
  margin-bottom: 15px;
}

.upgrade-tip {
  margin-top: 10px;
  padding: 10px;
  background-color: #f0f0f0;
  border-radius: 4px;
}

.level-name-cell {
  display: flex;
  align-items: center;
}

.avatar-uploader {
  width: 100px;
  height: 100px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.avatar-uploader:hover {
  border-color: #409EFF;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  text-align: center;
  line-height: 100px;
}

.avatar {
  width: 100px;
  height: 100px;
  display: block;
}
</style> 