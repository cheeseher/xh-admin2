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

## 项目结构

```
xinghai-admin/
├── .git/                  # Git版本控制目录
├── src/                   # 源代码目录
│   ├── assets/           # 静态资源文件
│   ├── components/       # 公共组件
│   │   └── Breadcrumb.vue    # 面包屑导航组件
│   ├── router/           # 路由配置
│   ├── store/            # Pinia状态管理
│   │   └── dashboard.ts      # 仪表盘状态管理
│   ├── views/            # 页面视图组件
│   │   ├── info/            # 信息相关页面
│   │   │   └── HelpView.vue     # 帮助中心页面
│   │   ├── system/          # 系统相关页面
│   │   │   └── DocumentSettingsView.vue  # 文档设置页面
│   │   ├── user/            # 用户相关页面
│   │   │   ├── ProfileView.vue    # 个人资料页面
│   │   │   └── ResetPasswordView.vue  # 重置密码页面
│   │   ├── AccountsView.vue     # 账户管理页面
│   │   ├── CategoriesView.vue   # 分类管理页面
│   │   ├── DataView.vue         # 数据统计页面
│   │   ├── HomeView.vue         # 首页
│   │   ├── LoginView.vue        # 登录页面
│   │   ├── LogsView.vue         # 日志页面
│   │   ├── MemberSettingsView.vue # 会员设置页面
│   │   ├── MessagesView.vue     # 消息管理页面
│   │   ├── NotFoundView.vue     # 404页面
│   │   ├── OrdersView.vue       # 订单管理页面
│   │   ├── ProductsView.vue     # 商品管理页面
│   │   ├── SettingsView.vue     # 系统设置页面
│   │   ├── TemplateSettingsView.vue # 模板设置页面
│   │   └── UsersView.vue        # 用户管理页面
│   ├── App.vue           # 根组件
│   ├── main.ts           # 应用入口文件
│   ├── env.d.ts          # 环境变量类型声明
│   └── vite-env.d.ts     # Vite环境类型声明
├── public/               # 公共静态资源
├── node_modules/         # 项目依赖包
├── .env                  # 环境变量配置
├── .gitignore           # Git忽略配置
├── .npmrc               # NPM配置文件
├── .vercelignore        # Vercel忽略配置
├── index.html           # HTML模板
├── package.json         # 项目配置和依赖管理
├── package-lock.json    # 依赖版本锁定
├── PRD.md              # 产品需求文档
├── README.md           # 项目说明文档
├── tsconfig.json       # TypeScript配置
├── tsconfig.node.json  # Node TypeScript配置
├── vercel.json         # Vercel部署配置
├── vercel-build.sh     # Vercel构建脚本
└── vite.config.ts      # Vite配置文件
```

## 安装与运行

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 开发端口

默认开发服务器运行在 http://localhost:3002/

## 浏览器支持

- Chrome
- Firefox
- Safari
- Edge

## 部署说明

项目使用Vercel进行部署，相关配置文件包括：
- vercel.json：Vercel部署配置
- vercel-build.sh：构建脚本
- .vercelignore：部署忽略文件

## 许可证

MIT
