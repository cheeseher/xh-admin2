<template>
  <div class="faq-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>常见问题</span>
          <el-button type="primary" @click="handleAdd">添加问题</el-button>
        </div>
      </template>

      <el-collapse v-model="activeNames">
        <el-collapse-item v-for="(item, index) in faqList" :key="index" :name="index">
          <template #title>
            <div class="faq-title">
              <span>{{ item.question }}</span>
              <div class="faq-actions">
                <el-button type="primary" link @click.stop="handleEdit(index)">
                  编辑
                </el-button>
                <el-button type="danger" link @click.stop="handleDelete(index)">
                  删除
                </el-button>
              </div>
            </div>
          </template>
          <div class="faq-answer" v-html="item.answer"></div>
        </el-collapse-item>
      </el-collapse>
    </el-card>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加问题' : '编辑问题'"
      width="60%"
    >
      <el-form :model="form" label-width="80px">
        <el-form-item label="问题">
          <el-input v-model="form.question" placeholder="请输入问题"></el-input>
        </el-form-item>
        <el-form-item label="答案">
          <el-input
            v-model="form.answer"
            type="textarea"
            :rows="6"
            placeholder="请输入答案，支持HTML格式"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 当前展开的面板
const activeNames = ref([])

// 对话框相关
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const currentIndex = ref(-1)

// 表单数据
const form = reactive({
  question: '',
  answer: ''
})

// FAQ列表数据
const faqList = ref([
  {
    question: '如何修改密码？',
    answer: '1. 点击右上角的用户头像<br>2. 选择"修改密码"<br>3. 输入原密码和新密码<br>4. 点击确认即可'
  },
  {
    question: '如何添加新用户？',
    answer: '1. 进入用户管理页面<br>2. 点击"添加用户"按钮<br>3. 填写用户信息<br>4. 点击保存即可'
  },
  {
    question: '忘记密码怎么办？',
    answer: '请联系系统管理员重置密码，或使用找回密码功能通过邮箱重置密码。'
  }
])

// 添加问题
const handleAdd = () => {
  dialogType.value = 'add'
  form.question = ''
  form.answer = ''
  dialogVisible.value = true
}

// 编辑问题
const handleEdit = (index: number) => {
  dialogType.value = 'edit'
  currentIndex.value = index
  const item = faqList.value[index]
  form.question = item.question
  form.answer = item.answer
  dialogVisible.value = true
}

// 删除问题
const handleDelete = async (index: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这个问题吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    faqList.value.splice(index, 1)
    ElMessage.success('删除成功')
  } catch {
    // 用户取消删除
  }
}

// 提交表单
const handleSubmit = () => {
  if (!form.question.trim() || !form.answer.trim()) {
    ElMessage.warning('问题和答案不能为空')
    return
  }

  if (dialogType.value === 'add') {
    faqList.value.push({
      question: form.question,
      answer: form.answer
    })
    ElMessage.success('添加成功')
  } else {
    faqList.value[currentIndex.value] = {
      question: form.question,
      answer: form.answer
    }
    ElMessage.success('修改成功')
  }

  dialogVisible.value = false
}
</script>

<style scoped>
.faq-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.faq-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.faq-actions {
  display: flex;
  gap: 10px;
}

.faq-answer {
  padding: 10px;
  line-height: 1.6;
}

:deep(.el-collapse-item__header) {
  font-size: 16px;
}

:deep(.el-collapse-item__content) {
  padding-bottom: 20px;
}
</style> 