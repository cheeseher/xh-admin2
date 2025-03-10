# 星海后台管理系统

## 项目介绍

星海后台管理系统是一个基于Vue 3、TypeScript和Element Plus的现代化后台管理系统，用于管理邮箱账号和社交媒体账号的销售平台。系统提供了完整的用户管理、商品管理、订单管理、分类管理、角色权限管理等功能。

## 技术栈

- **前端框架**：Vue 3 + TypeScript
- **UI组件库**：Element Plus
- **状态管理**：Pinia
- **路由管理**：Vue Router
- **构建工具**：Vite

## 功能模块

### 1. 数据概览
- 销售数据统计
- 订单趋势图表
- 热销商品排行
- 订单状态分布
- 最近交易记录

### 2. 用户管理
- 用户列表展示
- 用户信息编辑
- 用户状态管理
- 用户详情查看

### 3. 商品管理
- 商品列表展示
- 商品添加/编辑
- 商品上下架管理
- 商品详情查看

### 4. 订单管理
- 订单列表展示
- 订单状态管理
- 订单详情查看
- 订单发货处理

### 5. 分类管理
- 分类列表展示
- 分类添加/编辑
- 分类图标设置

### 6. 角色权限管理
- 角色列表展示
- 角色权限分配
- 权限树形结构展示

### 7. 系统设置
- 网站基本信息设置
- 支付方式设置
- 发货方式设置
- 通知设置

### 8. 个人中心
- 个人信息查看/编辑
- 密码修改
- 登录日志查看

## 安装与运行

```bash
# 克隆项目
git clone https://github.com/cheeseher/xinghai.git

# 进入项目目录
cd xinghai/xinghai-admin

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 项目结构

```
xinghai-admin/
├── public/              # 静态资源
├── src/                 # 源代码
│   ├── assets/          # 资源文件
│   ├── components/      # 公共组件
│   ├── router/          # 路由配置
│   ├── store/           # Pinia状态管理
│   ├── views/           # 页面组件
│   ├── App.vue          # 根组件
│   └── main.ts          # 入口文件
├── .gitignore           # Git忽略文件
├── package.json         # 项目依赖
├── tsconfig.json        # TypeScript配置
└── vite.config.ts       # Vite配置
```

## 浏览器支持

- Chrome
- Firefox
- Safari
- Edge

## 贡献指南

1. Fork 本仓库
2. 创建您的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开一个 Pull Request

## 许可证

MIT 