import { ref, reactive } from 'vue'

export const tableData = ref([
  {
    id: 1,
    title: '系统维护公告',
    content: '平台将于2024年5月1日凌晨进行系统维护，届时部分功能将暂时不可用。',
    status: 'enabled',
    publishTime: '2024-04-28 09:00:00'
  },
  {
    id: 2,
    title: '新功能上线',
    content: '我们已上线批量导入功能，欢迎体验。',
    status: 'disabled',
    publishTime: '2024-04-20 10:30:00'
  },
  {
    id: 3,
    title: '假期放假通知',
    content: '五一劳动节期间，平台客服将暂停服务，祝大家节日快乐！',
    status: 'disabled',
    publishTime: '2024-04-18 15:00:00'
  },
  {
    id: 4,
    title: '安全提示更新',
    content: '请定期修改您的账户密码，并开启两步验证以增强账户安全。',
    status: 'disabled',
    publishTime: '2024-04-15 11:00:00'
  }
])

export const addNotice = (form) => {
  // 如果当前表单状态为启用，则禁用其他所有公告
  if (form.status === 'enabled') {
    tableData.value.forEach(item => {
      if (item.id !== form.id) {
        item.status = 'disabled'
      }
    })
  }
  const newId = Math.max(...tableData.value.map(item => item.id), 0) + 1
  const now = new Date()
  const publishTime = now.toLocaleDateString().replace(/\//g, '-') + ' ' +
                    now.toTimeString().substring(0, 8)
  tableData.value.push({
    id: newId,
    title: form.title,
    content: form.content,
    status: form.status,
    publishTime: publishTime
  })
}

export const updateNotice = (form) => {
  // 如果当前表单状态为启用，则禁用其他所有公告
  if (form.status === 'enabled') {
    tableData.value.forEach(item => {
      if (item.id !== form.id) {
        item.status = 'disabled'
      }
    })
  }
  const index = tableData.value.findIndex(item => item.id === form.id)
  if (index !== -1) {
    tableData.value.splice(index, 1, { ...form })
  }
}

export const deleteNotice = (row) => {
  const index = tableData.value.findIndex(item => item.id === row.id)
  if (index !== -1) {
    tableData.value.splice(index, 1)
  }
}

export const batchDeleteNotices = (selectedIds) => {
  tableData.value = tableData.value.filter(item => !selectedIds.includes(item.id))
} 