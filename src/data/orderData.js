import { ref } from 'vue'

// 表格数据类型定义
/**
 * @typedef {object} RefundInfo
 * @property {number} refundAmount
 * @property {string} refundRemark
 * @property {string} refundTime
 */

/**
 * @typedef {object} OrderItem
 * @property {string} id
 * @property {string} orderId
 * @property {string} productName
 * @property {string} category
 * @property {number} quantity
 * @property {string} originalPrice
 * @property {string} purchasePrice
 * @property {string} totalPrice
 * @property {string} fee
 * @property {string} [cardInfo]
 * @property {string} userNickname
 * @property {string} userEmail
 * @property {string} userRole
 * @property {string} payMethod
 * @property {string} payChannel
 * @property {string} [channelName]
 * @property {string} deliveryMethod
 * @property {string} status
 * @property {string} [remark]
 * @property {string} createTime
 * @property {string} [completionTime]
 * @property {RefundInfo | null} refundInfo
 */

// 商品选项
export const productOptions = ref([
  { label: 'Gmail邮箱-稳定可用 (手工)', value: 'Gmail邮箱-稳定可用 (手工)', price: 4.20 },
  { label: 'Gmail邮箱-稳定可用', value: 'Gmail邮箱-稳定可用', price: 2.75 },
  { label: 'Gmail邮箱-1月以上', value: 'Gmail邮箱-1月以上', price: 5.50 },
  { label: 'Gmail邮箱-半年以上', value: 'Gmail邮箱-半年以上', price: 7.50 },
  { label: 'Gmail邮箱-美国稳定', value: 'Gmail邮箱-美国稳定', price: 10.00 },
  { label: 'Gmail邮箱-一年以上', value: 'Gmail邮箱-一年以上', price: 12.00 },
  { label: 'Gmail美国老号 (6个月+)', value: 'Gmail美国老号 (6个月+)', price: 16.88 },
  { label: '2022年老号账号-谷歌邮箱', value: '2022年老号账号-谷歌邮箱', price: 14.00 },
  { label: 'Instagram账号', value: 'Instagram账号', price: 39.99 },
  { label: 'Instagram账号-高粉丝', value: 'Instagram账号-高粉丝', price: 399.99 },
  { label: 'Twitter账号', value: 'Twitter账号', price: 49.99 },
  { label: 'Twitter账号-已认证', value: 'Twitter账号-已认证', price: 599.99 },
  { label: 'Facebook账号', value: 'Facebook账号', price: 59.99 },
  { label: 'Facebook账号-商业版', value: 'Facebook账号-商业版', price: 199.99 },
  { label: 'Discord账号', value: 'Discord账号', price: 39.99 },
  { label: 'ChatGPT账号', value: 'ChatGPT账号', price: 199.99 },
  { label: 'ChatGPT账号-高级版', value: 'ChatGPT账号-高级版', price: 299.99 },
  { label: '微软邮箱账号', value: '微软邮箱账号', price: 25.00 },
  { label: '其他账号-Steam', value: '其他账号-Steam', price: 79.99 }
])

// 表格数据 - 仅保留6种状态各一个订单
/** @type {import('vue').Ref<OrderItem[]>} */
export const orderList = ref([
  {
    id: 'ORD001',
    orderId: 'P20230501001',
    productName: 'Gmail邮箱 - 自动发货',
    category: '谷歌邮箱',
    originalPrice: '¥15.99',
    purchasePrice: '¥15.00',
    quantity: 2,
    totalPrice: '¥31.98',
    fee: '¥0.50',
    status: '待发货',
    cardInfo: '卡密详情1..., 卡密详情2...',
    userNickname: '小明',
    userEmail: 'user1@example.com',
    userRole: '普通用户',
    payMethod: 'usdt',
    payChannel: 'k4',
    channelName: 'K4',
    deliveryMethod: '自动发货',
    createTime: '2023-05-01 10:00:00',
    remark: '用户要求尽快发货',
    refundInfo: null
  },
  {
    id: 'ORD002',
    orderId: 'P20230501002',
    productName: 'Instagram活跃账号 - 手动',
    category: 'Instagram账号',
    originalPrice: '¥25.50',
    purchasePrice: '¥25.00',
    quantity: 1,
    totalPrice: '¥25.50',
    fee: '¥0.00',
    status: '已完成',
    cardInfo: '账号:iguser, 密码:xxxxxx',
    userNickname: '大卫',
    userEmail: 'user2_vip@example.com',
    userRole: 'vip2',
    payMethod: 'alipay',
    payChannel: 'speedzf',
    channelName: 'speedzf',
    deliveryMethod: '手动发货',
    createTime: '2023-05-01 11:30:00',
    completionTime: '2023-05-01 14:45:00',
    remark: '已通过邮件发送账号信息',
    refundInfo: null
  },
  {
    id: 'ORD003',
    orderId: 'P20230502001',
    productName: '微软邮箱 - Outlook 企业版',
    category: '微软邮箱',
    originalPrice: '¥12.00',
    purchasePrice: '¥10.00',
    quantity: 5,
    totalPrice: '¥60.00',
    fee: '¥1.00',
    status: '已退款',
    cardInfo: '用户申请退款，已处理',
    userNickname: '游客123',
    userEmail: 'visitor123@example.com',
    userRole: '游客',
    payMethod: 'wechat',
    payChannel: 'k4',
    channelName: 'K4',
    deliveryMethod: '自动发货',
    createTime: '2023-05-02 09:15:00',
    remark: '订单因用户原因取消并退款',
    refundInfo: {
      refundAmount: 60.00,
      refundRemark: '用户申请退款，已处理',
      refundTime: '2023-05-02 10:00:00'
    }
  },
  {
    id: 'ORD004',
    orderId: 'P20230502002',
    productName: 'Twitter老账号 - 带推文',
    category: 'Twitter账号',
    originalPrice: '¥30.00',
    purchasePrice: '¥28.00',
    quantity: 1,
    totalPrice: '¥30.00',
    fee: '¥0.80',
    status: '待付款',
    cardInfo: '',
    userNickname: '超级用户',
    userEmail: 'supermember@example.com',
    userRole: '超级会员',
    payMethod: 'usdt',
    payChannel: 'speedzf',
    channelName: 'speedzf',
    deliveryMethod: '自动发货',
    createTime: '2023-05-02 14:45:00',
    remark: '用户咨询后下单，等待支付',
    refundInfo: null
  },
  {
    id: 'ORD005',
    orderId: 'P20230503001',
    productName: 'Facebook账号 - 商业版',
    category: 'Facebook账号',
    originalPrice: '¥199.99',
    purchasePrice: '¥189.99',
    quantity: 1,
    totalPrice: '¥199.99',
    fee: '¥4.00',
    status: '已取消',
    cardInfo: '',
    userNickname: '商业客户',
    userEmail: 'business_user@example.com',
    userRole: 'vip3',
    payMethod: 'alipay',
    payChannel: 'k4',
    channelName: 'K4',
    deliveryMethod: '手动发货',
    createTime: '2023-05-03 09:20:00',
    remark: '用户主动取消订单',
    refundInfo: null
  },
  {
    id: 'ORD006',
    orderId: 'P20230503002',
    productName: 'ChatGPT账号 - 高级版',
    category: 'ChatGPT账号',
    originalPrice: '¥299.99',
    purchasePrice: '¥284.99',
    quantity: 1,
    totalPrice: '¥299.99',
    fee: '¥6.00',
    status: '发货失败',
    cardInfo: '账号状态异常，无法激活',
    userNickname: '科技达人',
    userEmail: 'tech_user@example.com',
    userRole: 'vip1',
    payMethod: 'wechat',
    payChannel: 'speedzf',
    channelName: 'speedzf',
    deliveryMethod: '自动发货',
    createTime: '2023-05-03 16:45:00',
    remark: '系统发货失败，需手动处理',
    refundInfo: null
  }
])

// Function to generate more orders if needed for testing
/**
 * @param {number} count
 * @returns {OrderItem[]}
 */
export function generateSampleOrders(count) {
  /** @type {OrderItem[]} */
  const samples = [];
  const baseTime = new Date(2023, 4, 1).getTime(); // May 1, 2023
  const productCats = ['谷歌邮箱', '微软邮箱', 'Instagram账号', 'Twitter账号', 'Facebook账号', 'Discord账号', 'ChatGPT账号', '其他账号'];
  const statuses = ['待付款', '待发货', '已完成', '已退款', '已取消'];
  const payMethods = ['usdt', 'wechat', 'alipay'];
  const payChannels = ['k4', 'speedzf', 'quickpay', 'fastpay'];
  const deliveryMethods = ['自动发货', '手动发货'];
  const userRoles = ['游客', '普通用户', 'vip1', 'vip2', 'vip3', '超级会员'];
  const nicknames = ['快乐星球', '科技迷', '数码控', '账号达人', '社交狂人', '匿名用户', '高级玩家', 'VIP客户'];

  for (let i = 0; i < count; i++) {
    const prodName = productOptions.value[Math.floor(Math.random() * productOptions.value.length)].label;
    const category = productCats[Math.floor(Math.random() * productCats.length)];
    const price = parseFloat((Math.random() * 100 + 10).toFixed(2));
    const quantity = Math.floor(Math.random() * 5) + 1;
    const totalPrice = parseFloat((price * quantity).toFixed(2));
    const fee = parseFloat((totalPrice * 0.02).toFixed(2)); // 2% fee
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const createTime = new Date(baseTime + i * 3600000 * Math.random() * 24); // Random time within days
    const nickname = nicknames[Math.floor(Math.random() * nicknames.length)] + i;
    const payMethod = payMethods[Math.floor(Math.random() * payMethods.length)];
    const payChannel = payChannels[Math.floor(Math.random() * payChannels.length)];

    samples.push({
      id: `ORD${(1000 + orderList.value.length + i).toString().padStart(3, '0')}`,
      orderId: `P${createTime.getFullYear()}${(createTime.getMonth() + 1).toString().padStart(2, '0')}${createTime.getDate().toString().padStart(2, '0')}${(1001 + i).toString().padStart(3, '0')}`,
      productName: `${prodName} - Sample ${i + 1}`,
      category: category,
      originalPrice: `¥${price.toFixed(2)}`,
      purchasePrice: `¥${(price * 0.95).toFixed(2)}`, // Simulating a purchase price
      quantity: quantity,
      totalPrice: `¥${totalPrice.toFixed(2)}`,
      fee: `¥${fee.toFixed(2)}`,
      status: status,
      cardInfo: status === '已完成' || status === '待发货' ? `Generated card info for ${prodName}` : '',
      userNickname: nickname,
      userEmail: `user${(Math.random() * 1000).toFixed(0)}@sample.com`,
      userRole: userRoles[Math.floor(Math.random() * userRoles.length)],
      payMethod: payMethod,
      payChannel: payChannel,
      channelName: payChannel,
      deliveryMethod: deliveryMethods[Math.floor(Math.random() * deliveryMethods.length)],
      createTime: createTime.toISOString().replace('T', ' ').substring(0, 19),
      remark: status === '已取消' || status === '已退款' ? 'Sample remark for order status.' : '',
      refundInfo: status === '已退款' ? {
        refundAmount: totalPrice,
        refundRemark: 'Sample auto refund remark',
        refundTime: new Date(createTime.getTime() + 3600000).toISOString().replace('T', ' ').substring(0, 19) // 1 hour later
      } : null
    });
  }
  return samples;
}

// 注释掉生成额外数据的代码
// const additionalSampleOrders = generateSampleOrders(30);
// orderList.value = [...orderList.value, ...additionalSampleOrders]; 