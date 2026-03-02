# Storage 工厂生产管理系统

基于 Next.js + Ant Design + Pro Components 构建的工厂生产管理系统。

## 功能特性

- 📊 **仪表盘** - 生产数据概览、趋势图表、设备状态
- 📋 **生产计划** - 生产订单管理、进度跟踪
- 📦 **库存管理** - 库存监控、低库存预警
- 🔧 **设备管理** - 设备台账、维护记录
- ⚙️ **系统设置** - 基础配置

## 技术栈

- **框架**: Next.js 16 (App Router)
- **UI**: Ant Design 5.x
- **Pro组件**: @ant-design/pro-components
- **图表**: Recharts
- **语言**: TypeScript

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本

```bash
npm run build
npm start
```

## 项目结构

```
src/
├── app/
│   ├── page.tsx              # 仪表盘
│   ├── production/page.tsx    # 生产计划
│   ├── inventory/page.tsx     # 库存管理
│   ├── equipment/page.tsx     # 设备管理
│   ├── settings/page.tsx      # 系统设置
│   ├── layout.tsx            # 根布局
│   └── globals.css           # 全局样式
├── components/
│   └── Layout.tsx            # 主布局组件
├── types/
│   └── index.ts              # TypeScript 类型定义
└── mock/
    └── data.ts               # 模拟数据
```

## 页面说明

### 仪表盘
- 生产统计卡片
- 月度生产趋势柱状图
- 库存分类饼图
- 生产计划和设备状态列表

### 生产计划
- 生产订单列表
- 新增/编辑/删除订单
- 订单状态和进度管理
- 搜索和筛选功能

### 库存管理
- 库存物品列表
- 低库存预警标识
- 仓库和库位管理
- 库存分类管理

### 设备管理
- 设备台账管理
- 设备状态监控
- 维护计划管理
- 设备统计概览

## 参考

- [Next.js 文档](https://nextjs.org/docs)
- [Ant Design 文档](https://ant.design/)
- [Pro Components 文档](https://procomponents.ant.design/)
