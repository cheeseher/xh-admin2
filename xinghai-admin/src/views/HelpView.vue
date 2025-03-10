<template>
  <div class="help-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>帮助文档</span>
        </div>
      </template>
      
      <el-tabs v-model="activeTab" type="border-card">
        <el-tab-pane label="系统使用指南" name="guide">
          <div class="tab-content">
            <h2>星海后台管理系统使用指南</h2>
            <p>欢迎使用星海后台管理系统，本系统主要用于管理邮箱账号和社交媒体账号的销售业务。以下是系统各功能模块的使用说明：</p>
            
            <el-divider></el-divider>
            
            <h3>1. 数据概览</h3>
            <p>数据概览页面展示了系统的核心数据指标，包括：</p>
            <ul>
              <li>销售额统计：今日销售额、昨日销售额、本月销售额、上月销售额</li>
              <li>订单统计：今日订单数、昨日订单数、本月订单数、上月订单数</li>
              <li>销售趋势图：展示近30天的销售趋势</li>
              <li>热销商品排行：展示销量最高的商品</li>
              <li>订单状态分布：展示各状态订单的占比</li>
              <li>最近交易记录：展示最近的订单交易记录</li>
            </ul>
            
            <el-divider></el-divider>
            
            <h3>2. 订单管理</h3>
            <p>订单管理页面用于管理所有的订单信息，主要功能包括：</p>
            <ul>
              <li>订单查询：可以根据订单号、商品分类、发货方式、订单状态和下单时间进行查询</li>
              <li>订单列表：展示所有订单的详细信息</li>
              <li>订单操作：
                <ul>
                  <li>查看订单：查看订单的详细信息</li>
                  <li>编辑订单：修改订单的信息</li>
                  <li>发货：对待发货的订单进行发货操作，填写账号信息</li>
                  <li>删除订单：删除不需要的订单</li>
                </ul>
              </li>
              <li>新增订单：手动添加新订单</li>
            </ul>
            
            <el-divider></el-divider>
            
            <h3>3. 商品管理</h3>
            <p>商品管理页面用于管理所有的商品信息，主要功能包括：</p>
            <ul>
              <li>商品查询：可以根据商品名称、商品分类、价格区间、发货方式和状态进行查询</li>
              <li>商品列表：展示所有商品的详细信息</li>
              <li>商品操作：
                <ul>
                  <li>查看商品：查看商品的详细信息</li>
                  <li>编辑商品：修改商品的信息</li>
                  <li>删除商品：删除不需要的商品</li>
                </ul>
              </li>
              <li>新增商品：添加新商品</li>
            </ul>
            
            <el-divider></el-divider>
            
            <h3>4. 分类管理</h3>
            <p>分类管理页面用于管理商品分类信息，主要功能包括：</p>
            <ul>
              <li>分类查询：可以根据分类名称、分类类型和状态进行查询</li>
              <li>分类列表：展示所有分类的详细信息</li>
              <li>分类操作：
                <ul>
                  <li>查看分类：查看分类的详细信息</li>
                  <li>编辑分类：修改分类的信息</li>
                  <li>删除分类：删除不需要的分类</li>
                </ul>
              </li>
              <li>新增分类：添加新分类</li>
            </ul>
            
            <el-divider></el-divider>
            
            <h3>5. 用户管理</h3>
            <p>用户管理页面用于管理系统用户信息，主要功能包括：</p>
            <ul>
              <li>用户查询：可以根据用户名、手机号和状态进行查询</li>
              <li>用户列表：展示所有用户的详细信息</li>
              <li>用户操作：
                <ul>
                  <li>查看用户：查看用户的详细信息</li>
                  <li>编辑用户：修改用户的信息</li>
                  <li>删除用户：删除不需要的用户</li>
                </ul>
              </li>
              <li>新增用户：添加新用户</li>
            </ul>
            
            <el-divider></el-divider>
            
            <h3>6. 角色管理</h3>
            <p>角色管理页面用于管理系统角色信息，主要功能包括：</p>
            <ul>
              <li>角色查询：可以根据角色名称和状态进行查询</li>
              <li>角色列表：展示所有角色的详细信息</li>
              <li>角色操作：
                <ul>
                  <li>查看角色：查看角色的详细信息</li>
                  <li>编辑角色：修改角色的信息</li>
                  <li>删除角色：删除不需要的角色</li>
                </ul>
              </li>
              <li>新增角色：添加新角色</li>
            </ul>
            
            <el-divider></el-divider>
            
            <h3>7. 系统设置</h3>
            <p>系统设置页面用于配置系统的基本参数，主要功能包括：</p>
            <ul>
              <li>基本设置：配置系统的基本信息</li>
              <li>安全设置：配置系统的安全参数</li>
              <li>通知设置：配置系统的通知方式</li>
              <li>支付设置：配置系统的支付方式</li>
            </ul>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="常见问题" name="faq">
          <div class="tab-content">
            <h2>常见问题解答</h2>
            
            <el-collapse accordion>
              <el-collapse-item title="1. 如何添加新商品？" name="1">
                <div>
                  <p>添加新商品的步骤如下：</p>
                  <ol>
                    <li>进入商品管理页面</li>
                    <li>点击右上角的"新增商品"按钮</li>
                    <li>在弹出的表单中填写商品信息，包括商品名称、商品分类、商品特性、价格、库存等</li>
                    <li>选择发货方式（自动发货或手动发货）</li>
                    <li>填写商品描述</li>
                    <li>点击"确定"按钮保存</li>
                  </ol>
                </div>
              </el-collapse-item>
              
              <el-collapse-item title="2. 如何处理待发货订单？" name="2">
                <div>
                  <p>处理待发货订单的步骤如下：</p>
                  <ol>
                    <li>进入订单管理页面</li>
                    <li>在订单列表中找到状态为"待发货"的订单</li>
                    <li>点击该订单右侧的"发货"按钮</li>
                    <li>在弹出的表单中填写账号信息（账号、密码等）</li>
                    <li>填写备注信息（可选）</li>
                    <li>点击"确认发货"按钮完成发货</li>
                  </ol>
                  <p>发货后，订单状态将自动更新为"已发货"。</p>
                </div>
              </el-collapse-item>
              
              <el-collapse-item title="3. 如何查看销售数据统计？" name="3">
                <div>
                  <p>查看销售数据统计的步骤如下：</p>
                  <ol>
                    <li>进入数据概览页面</li>
                    <li>在页面上方可以看到今日销售额、昨日销售额、本月销售额、上月销售额等核心指标</li>
                    <li>在销售趋势图中可以查看近30天的销售趋势</li>
                    <li>在热销商品排行中可以查看销量最高的商品</li>
                    <li>在订单状态分布中可以查看各状态订单的占比</li>
                  </ol>
                </div>
              </el-collapse-item>
              
              <el-collapse-item title="4. 如何管理商品分类？" name="4">
                <div>
                  <p>管理商品分类的步骤如下：</p>
                  <ol>
                    <li>进入分类管理页面</li>
                    <li>在分类列表中可以查看所有分类的信息</li>
                    <li>点击"新增分类"按钮可以添加新分类</li>
                    <li>点击"编辑"按钮可以修改分类信息</li>
                    <li>点击"删除"按钮可以删除不需要的分类</li>
                  </ol>
                  <p>注意：删除分类前，请确保该分类下没有关联的商品，否则可能导致数据异常。</p>
                </div>
              </el-collapse-item>
              
              <el-collapse-item title="5. 如何设置商品为自动发货？" name="5">
                <div>
                  <p>设置商品为自动发货的步骤如下：</p>
                  <ol>
                    <li>进入商品管理页面</li>
                    <li>找到需要设置的商品，点击"编辑"按钮</li>
                    <li>在弹出的表单中，找到"发货方式"选项</li>
                    <li>选择"自动发货"</li>
                    <li>点击"确定"按钮保存</li>
                  </ol>
                  <p>设置为自动发货后，当用户下单并支付成功后，系统将自动发送账号信息给用户，无需人工干预。</p>
                </div>
              </el-collapse-item>
              
              <el-collapse-item title="6. 如何查看特定时间段的订单？" name="6">
                <div>
                  <p>查看特定时间段订单的步骤如下：</p>
                  <ol>
                    <li>进入订单管理页面</li>
                    <li>在搜索区域中，找到"下单时间"选项</li>
                    <li>点击日期选择器，选择开始日期和结束日期</li>
                    <li>点击"查询"按钮</li>
                  </ol>
                  <p>系统将显示选定时间段内的所有订单。</p>
                </div>
              </el-collapse-item>
            </el-collapse>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="账号使用说明" name="account">
          <div class="tab-content">
            <h2>账号使用说明</h2>
            
            <el-divider content-position="left">谷歌邮箱 (Gmail)</el-divider>
            
            <h3>Gmail账号使用指南</h3>
            <p>Gmail是Google提供的免费电子邮件服务，以下是使用Gmail账号的基本说明：</p>
            
            <h4>登录步骤</h4>
            <ol>
              <li>访问 <a href="https://mail.google.com" target="_blank">https://mail.google.com</a></li>
              <li>输入您购买的Gmail账号</li>
              <li>输入对应的密码</li>
              <li>如果提示需要验证，请按照提示完成验证步骤</li>
            </ol>
            
            <h4>安全建议</h4>
            <ul>
              <li>首次登录后，建议修改密码</li>
              <li>开启两步验证，提高账号安全性</li>
              <li>定期检查账号活动，确保没有异常登录</li>
              <li>不要在公共设备上保存登录状态</li>
            </ul>
            
            <h4>常见问题</h4>
            <ul>
              <li><strong>问题：登录时提示账号被锁定</strong><br>解决方案：按照Google的提示进行账号恢复，或联系客服获取帮助。</li>
              <li><strong>问题：无法接收邮件</strong><br>解决方案：检查垃圾邮件文件夹，确认邮箱存储空间是否已满。</li>
              <li><strong>问题：发送邮件失败</strong><br>解决方案：确认网络连接正常，检查收件人地址是否正确，尝试重新发送。</li>
            </ul>
            
            <el-divider content-position="left">社交媒体账号</el-divider>
            
            <h3>社交媒体账号使用指南</h3>
            <p>以下是各类社交媒体账号的基本使用说明：</p>
            
            <h4>Facebook账号</h4>
            <ol>
              <li>访问 <a href="https://www.facebook.com" target="_blank">https://www.facebook.com</a></li>
              <li>输入您购买的Facebook账号和密码</li>
              <li>如果提示需要验证，请按照提示完成验证步骤</li>
              <li>登录成功后，建议立即修改密码和个人信息</li>
            </ol>
            
            <h4>Twitter账号</h4>
            <ol>
              <li>访问 <a href="https://twitter.com" target="_blank">https://twitter.com</a></li>
              <li>输入您购买的Twitter账号和密码</li>
              <li>如果提示需要验证，请按照提示完成验证步骤</li>
              <li>登录成功后，建议立即修改密码和个人信息</li>
            </ol>
            
            <h4>Instagram账号</h4>
            <ol>
              <li>访问 <a href="https://www.instagram.com" target="_blank">https://www.instagram.com</a></li>
              <li>输入您购买的Instagram账号和密码</li>
              <li>如果提示需要验证，请按照提示完成验证步骤</li>
              <li>登录成功后，建议立即修改密码和个人信息</li>
            </ol>
            
            <h4>安全建议</h4>
            <ul>
              <li>首次登录后，立即修改密码</li>
              <li>更新个人信息，避免使用默认设置</li>
              <li>开启两步验证（如果平台支持）</li>
              <li>定期检查账号活动，确保没有异常登录</li>
              <li>不要在公共设备上保存登录状态</li>
            </ul>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="联系我们" name="contact">
          <div class="tab-content">
            <h2>联系我们</h2>
            <p>如果您在使用过程中遇到任何问题，或有任何建议和反馈，欢迎通过以下方式联系我们：</p>
            
            <el-descriptions title="客服信息" :column="1" border>
              <el-descriptions-item label="客服电话">400-123-4567</el-descriptions-item>
              <el-descriptions-item label="客服邮箱">support@xinghai.com</el-descriptions-item>
              <el-descriptions-item label="工作时间">周一至周日 9:00-22:00</el-descriptions-item>
              <el-descriptions-item label="公司地址">
                北京市朝阳区星海大厦15层1501室
              </el-descriptions-item>
            </el-descriptions>
            
            <div class="contact-form">
              <h3>在线留言</h3>
              <el-form :model="contactForm" label-width="100px" :rules="contactRules" ref="contactFormRef">
                <el-form-item label="您的姓名" prop="name">
                  <el-input v-model="contactForm.name" placeholder="请输入您的姓名"></el-input>
                </el-form-item>
                <el-form-item label="联系方式" prop="contact">
                  <el-input v-model="contactForm.contact" placeholder="请输入您的手机号或邮箱"></el-input>
                </el-form-item>
                <el-form-item label="问题类型" prop="type">
                  <el-select v-model="contactForm.type" placeholder="请选择问题类型" style="width: 100%;">
                    <el-option label="账号问题" value="account"></el-option>
                    <el-option label="订单问题" value="order"></el-option>
                    <el-option label="支付问题" value="payment"></el-option>
                    <el-option label="系统建议" value="suggestion"></el-option>
                    <el-option label="其他问题" value="other"></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="问题描述" prop="content">
                  <el-input 
                    v-model="contactForm.content" 
                    type="textarea" 
                    :rows="4" 
                    placeholder="请详细描述您遇到的问题或建议"
                  ></el-input>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="submitContactForm">提交</el-button>
                  <el-button @click="resetContactForm">重置</el-button>
                </el-form-item>
              </el-form>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

// 当前激活的标签页
const activeTab = ref('guide')

// 联系表单
const contactFormRef = ref<FormInstance>()
const contactForm = reactive({
  name: '',
  contact: '',
  type: '',
  content: ''
})

// 联系表单验证规则
const contactRules = reactive<FormRules>({
  name: [
    { required: true, message: '请输入您的姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  contact: [
    { required: true, message: '请输入您的联系方式', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择问题类型', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入问题描述', trigger: 'blur' },
    { min: 10, max: 500, message: '长度在 10 到 500 个字符', trigger: 'blur' }
  ]
})

// 提交联系表单
const submitContactForm = async () => {
  if (!contactFormRef.value) return
  
  await contactFormRef.value.validate((valid, fields) => {
    if (valid) {
      ElMessage.success('留言提交成功，我们将尽快与您联系')
      resetContactForm()
    } else {
      console.log('表单验证失败', fields)
    }
  })
}

// 重置联系表单
const resetContactForm = () => {
  if (!contactFormRef.value) return
  contactFormRef.value.resetFields()
}
</script>

<style scoped>
.help-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tab-content {
  padding: 20px;
}

h2 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #303133;
}

h3 {
  margin-top: 20px;
  margin-bottom: 15px;
  color: #409EFF;
}

h4 {
  margin-top: 15px;
  margin-bottom: 10px;
  color: #606266;
}

p {
  line-height: 1.6;
  margin-bottom: 15px;
}

ul, ol {
  padding-left: 20px;
  margin-bottom: 15px;
}

li {
  margin-bottom: 8px;
}

.contact-form {
  margin-top: 30px;
  max-width: 600px;
}
</style> 