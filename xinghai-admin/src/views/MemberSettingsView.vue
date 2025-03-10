<template>
  <div class="member-settings-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>会员等级设置</span>
          <el-button type="primary" @click="handleAddLevel">新增等级</el-button>
        </div>
      </template>
      
      <div class="page-description">
        <p>管理会员等级和充值折扣设置，会员等级折扣仅适用于用户充值余额。用户累计充值金额达到设定条件时，系统将自动升级用户的会员等级。</p>
      </div>
      
      <!-- 会员等级表格 -->
      <el-table :data="memberLevels" style="width: 100%" v-loading="loading" border stripe>
        <el-table-column type="index" label="序号" width="60"></el-table-column>
        <el-table-column prop="name" label="等级名称" min-width="120">
          <template #default="scope">
            <div class="level-name-cell">
              <el-image 
                :src="scope.row.icon" 
                fit="contain" 
                style="width: 24px; height: 24px; margin-right: 8px;"
              ></el-image>
              <el-tag :type="getLevelTagType(scope.row.level)">{{ scope.row.name }}</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="level" label="等级" width="80"></el-table-column>
        <el-table-column prop="condition" label="升级条件" min-width="180"></el-table-column>
        <el-table-column prop="minRecharge" label="最低充值金额" width="120">
          <template #default="scope">
            <span>{{ scope.row.minRecharge }}元</span>
          </template>
        </el-table-column>
        <el-table-column prop="discount" label="充值折扣" width="120">
          <template #default="scope">
            <span>{{ scope.row.discount }}%</span>
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
                :disabled="scope.row.level === 0"
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
        <el-form-item label="等级名称" prop="name">
          <el-input v-model="levelForm.name" placeholder="请输入等级名称"></el-input>
        </el-form-item>
        <el-form-item label="等级图标" prop="icon">
          <el-upload
            class="avatar-uploader"
            action="/api/upload"
            :show-file-list="false"
            :on-success="handleIconSuccess"
            :before-upload="beforeIconUpload"
          >
            <img v-if="levelForm.icon" :src="levelForm.icon" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
          <div class="form-tip">建议上传正方形图片，大小不超过200KB</div>
        </el-form-item>
        <el-form-item label="等级" prop="level">
          <el-input-number v-model="levelForm.level" :min="0" :max="10" :disabled="dialogType === 'edit'"></el-input-number>
          <span class="form-tip">0表示普通用户，数字越大等级越高</span>
        </el-form-item>
        <el-form-item label="升级条件" prop="condition">
          <el-input v-model="levelForm.condition" placeholder="请输入升级条件"></el-input>
        </el-form-item>
        <el-form-item label="最低充值金额" prop="minRecharge">
          <el-input-number 
            v-model="levelForm.minRecharge" 
            :min="0" 
            :precision="0" 
            :step="100"
            style="width: 180px;"
          ></el-input-number>
          <span class="form-tip">元（用户累计充值达到此金额时自动升级）</span>
        </el-form-item>
        <el-form-item label="充值折扣" prop="discount">
          <el-input-number 
            v-model="levelForm.discount" 
            :min="0" 
            :max="100" 
            :precision="1" 
            :step="0.1"
            style="width: 180px;"
          ></el-input-number>
          <span class="form-tip">%（百分比，例如：95表示95折，即9.5折）</span>
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
    id: 1,
    name: '普通用户',
    level: 0,
    condition: '默认等级',
    minRecharge: 0,
    discount: 100,
    description: '所有用户的默认等级'
  },
  {
    id: 2,
    name: 'VIP1',
    level: 1,
    condition: '累计充值满100元',
    minRecharge: 100,
    discount: 95,
    description: '储值用户享受95折优惠'
  },
  {
    id: 3,
    name: 'VIP2',
    level: 2,
    condition: '累计充值满1000元',
    minRecharge: 1000,
    discount: 90,
    description: '稳定用户、活跃用户享受9折优惠'
  },
  {
    id: 4,
    name: 'VIP3',
    level: 3,
    condition: '累计充值满5000元',
    minRecharge: 5000,
    discount: 85,
    description: '大客户，可定期回访与商务交流'
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
  minRecharge: 0,
  discount: 100,
  description: '',
  introduction: ''
})

// 表单验证规则
const levelRules = reactive<FormRules>({
  name: [
    { required: true, message: '请输入等级名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  icon: [
    { required: true, message: '请上传等级图标', trigger: 'change' }
  ],
  level: [
    { required: true, message: '请输入等级', trigger: 'blur' }
  ],
  condition: [
    { required: true, message: '请输入升级条件', trigger: 'blur' }
  ],
  minRecharge: [
    { required: true, message: '请输入最低充值金额', trigger: 'blur' }
  ],
  discount: [
    { required: true, message: '请输入充值折扣', trigger: 'blur' }
  ],
  introduction: [
    { required: true, message: '请输入会员介绍', trigger: 'blur' }
  ]
})

// 充值预览数据
const rechargePreviewData = computed(() => {
  return memberLevels.value.map(level => ({
    ...level
  }))
})

// 获取等级标签类型
const getLevelTagType = (level: number) => {
  const types = ['', 'success', 'warning', 'danger']
  return types[level] || ''
}

// 新增会员等级
const handleAddLevel = () => {
  dialogType.value = 'add'
  levelForm.id = 0
  levelForm.name = ''
  levelForm.level = memberLevels.value.length > 0 ? Math.max(...memberLevels.value.map(item => item.level)) + 1 : 1
  levelForm.condition = ''
  levelForm.minRecharge = 0
  levelForm.discount = 100
  levelForm.description = ''
  levelForm.introduction = ''
  levelDialogVisible.value = true
}

// 编辑会员等级
const handleEditLevel = (row: any) => {
  dialogType.value = 'edit'
  levelForm.id = row.id
  levelForm.name = row.name
  levelForm.level = row.level
  levelForm.condition = row.condition
  levelForm.minRecharge = row.minRecharge
  levelForm.discount = row.discount
  levelForm.description = row.description
  levelForm.introduction = row.introduction
  levelForm.icon = row.icon
  levelDialogVisible.value = true
}

// 删除会员等级
const handleDeleteLevel = (row: any) => {
  if (row.level === 0) {
    ElMessage.warning('普通用户等级不能删除')
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
      
      if (dialogType.value === 'add') {
        // 模拟添加操作
        const newId = Math.max(...memberLevels.value.map(item => item.id), 0) + 1
        memberLevels.value.push({
          id: newId,
          name: levelForm.name,
          level: levelForm.level,
          condition: levelForm.condition,
          minRecharge: levelForm.minRecharge,
          discount: levelForm.discount,
          description: levelForm.description,
          introduction: levelForm.introduction,
          icon: levelForm.icon
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
            minRecharge: levelForm.minRecharge,
            discount: levelForm.discount,
            description: levelForm.description,
            introduction: levelForm.introduction,
            icon: levelForm.icon
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

// 处理图标上传
const handleIconSuccess = (response: any) => {
  levelForm.icon = response.data.url
}

const beforeIconUpload = (file: File) => {
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt200K = file.size / 1024 < 200

  if (!isJPG) {
    ElMessage.error('图标只能是 JPG 或 PNG 格式!')
    return false
  }
  if (!isLt200K) {
    ElMessage.error('图标大小不能超过 200KB!')
    return false
  }
  return true
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