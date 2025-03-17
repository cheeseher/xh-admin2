# 星海后台管理系统

<<<<<<< HEAD
这是一个基于Vue 3、TypeScript和Element Plus的后台管理系统，用于管理星海平台的各项业务数据。

## 项目功能

- **数据概览**：展示平台核心数据指标，包括销售额、订单数量、用户数量和支付笔数等
- **销售趋势**：通过图表展示销售数据的变化趋势
- **热销商品排行**：展示平台上最受欢迎的商品
- **订单状态分布**：展示不同状态订单的占比情况
- **用户增长趋势**：展示平台用户增长情况
- **最近交易记录**：展示最新的交易数据
=======
## 项目介绍

星海后台管理系统是一个基于Vue 3、TypeScript和Element Plus的现代化后台管理系统，用于管理邮箱账号和社交媒体账号的销售平台。系统提供了完整的用户管理、商品管理、订单管理、分类管理、角色权限管理等功能。
>>>>>>> 735e886c7a224ecb614db9569b2c62c3be8cbd19

## 技术栈

- **前端框架**：Vue 3 + TypeScript
- **UI组件库**：Element Plus
- **状态管理**：Pinia
- **路由管理**：Vue Router
<<<<<<< HEAD
- **图表库**：ECharts
- **HTTP请求**：Axios
- **构建工具**：Vite

=======
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

>>>>>>> 735e886c7a224ecb614db9569b2c62c3be8cbd19
## 项目结构

```
xinghai-admin/
<<<<<<< HEAD
├── public/                 # 静态资源
├── src/
│   ├── api/                # API接口
│   ├── assets/             # 资源文件
│   ├── components/         # 公共组件
│   ├── router/             # 路由配置
│   ├── store/              # 状态管理
│   ├── utils/              # 工具函数
│   ├── views/              # 页面视图
│   ├── App.vue             # 根组件
│   └── main.ts             # 入口文件
├── .gitignore              # Git忽略文件
├── index.html              # HTML模板
├── package.json            # 项目依赖
├── tsconfig.json           # TypeScript配置
├── vite.config.ts          # Vite配置
└── README.md               # 项目说明
```

## 安装和使用

### 安装依赖

```bash
npm install
```

### 开发环境运行

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 页面说明

### 数据概览页面

数据概览页面展示了平台的核心业务数据，包括：

1. **顶部卡片**：展示总销售额、订单数量、用户数量和支付笔数等关键指标
2. **销售趋势图**：展示一段时间内的销售额变化趋势
3. **热销商品排行**：展示平台上最受欢迎的商品及其销售情况
4. **订单状态分布**：通过饼图展示不同状态订单的占比
5. **用户增长趋势**：展示平台用户随时间的增长情况
6. **最近交易记录**：展示最新的交易数据，包括订单号、商品名称、价格、买家、状态和创建时间等信息

## 开发指南

### 添加新页面

1. 在`src/views`目录下创建新的Vue组件
2. 在`src/router/index.ts`中添加对应的路由配置
3. 在`src/App.vue`的侧边栏菜单中添加新的菜单项

### 添加新组件

在`src/components`目录下创建新的Vue组件，并在需要的页面中引入使用。

### 添加新API

在`src/api`目录下添加新的API接口定义，并在需要的组件中引入使用。

## 注意事项

- 本项目使用Vue 3的Composition API进行开发，请确保熟悉相关语法
- 使用TypeScript进行类型检查，提高代码质量
- 遵循组件化开发原则，确保组件的可复用性和可维护性
- 使用Pinia进行状态管理，合理组织store结构 
=======
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

## 项目结构

```
xinghai/
├── xinghai-admin/     # 后台管理系统
│   ├── src/           # 源代码
│   ├── public/        # 静态资源
│   └── ...
├── vercel.json        # Vercel部署配置
└── .vercelignore      # Vercel忽略文件
```

## 本地开发

```bash
# 进入项目目录
cd xinghai-admin

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 构建生产版本

```bash
# 进入项目目录
cd xinghai-admin

# 构建生产版本
npm run build
```

## Vercel部署步骤

1. 在GitHub上创建仓库并上传代码
2. 登录[Vercel](https://vercel.com)
3. 点击"New Project"
4. 选择您的GitHub仓库
5. 配置部署设置：
   - 框架预设：Vue.js
   - 构建命令：`cd xinghai-admin && npm run build`
   - 输出目录：`xinghai-admin/dist`
6. 点击"Deploy"开始部署

## 自动部署

当您向GitHub仓库推送新代码时，Vercel会自动重新部署您的应用。

## 环境变量

如果您的应用需要环境变量，可以在Vercel项目设置中的"Environment Variables"部分添加。 
>>>>>>> 735e886c7a224ecb614db9569b2c62c3be8cbd19
