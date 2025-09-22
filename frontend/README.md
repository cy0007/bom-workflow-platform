# BOM协同工作流平台 - 前端项目

## 项目简介

这是BOM协同工作流平台的前端项目，基于Vue.js + TypeScript + Element Plus构建的企业级Web应用。

## 技术栈

- **Vue 3.5.21** - 渐进式JavaScript框架
- **TypeScript 5.8.3** - JavaScript的超集，提供静态类型检查
- **Vite 7.1.6** - 下一代前端构建工具
- **Element Plus 2.11.3** - Vue 3组件库
- **Axios 1.12.2** - HTTP客户端库
- **Playwright 1.55.0** - 现代化E2E测试框架

## 项目结构

```
bom-platform-frontend/
├── src/
│   ├── components/          # Vue组件
│   │   └── BomDetail.vue   # BOM详情页组件
│   ├── services/           # API服务层
│   │   ├── api.ts          # HTTP客户端配置
│   │   └── bomService.ts   # BOM API服务
│   ├── views/              # 页面视图组件
│   │   ├── HomeView.vue    # 首页
│   │   ├── BomListView.vue # BOM列表页
│   │   └── BomDetailView.vue # BOM详情页
│   ├── router/             # 路由配置
│   │   └── index.ts        # Vue Router配置
│   ├── App.vue             # 根组件
│   ├── main.ts             # 应用入口
│   └── style.css           # 全局样式
├── tests/                  # E2E测试文件
│   ├── bom-core.spec.ts   # 核心功能测试
│   └── bom-platform.spec.ts # 完整平台测试
├── tests-examples/         # 测试示例文件
├── playwright.config.ts    # Playwright配置
├── package.json            # 项目依赖配置
├── vite.config.ts          # Vite配置
└── tsconfig.json           # TypeScript配置
```

## 功能特性

### 1. BOM详情展示
- ✅ **完整信息展示**：款式编码、产品名称、基本信息
- ✅ **状态管理**：动态状态标签和颜色
- ✅ **价格信息**：目标价格、预估成本、总成本
- ✅ **开发颜色**：多颜色标签展示
- ✅ **面料信息**：成分、克重等详细信息
- ✅ **版本管理**：创建时间、更新时间、确认时间

### 2. 用户体验
- 🎨 **现代化UI**：基于Element Plus的企业级设计
- 📱 **响应式布局**：适配不同屏幕尺寸
- ⚡ **加载状态**：骨架屏加载提示
- 🚨 **错误处理**：友好的错误提示和重试机制

### 3. API集成
- 🔗 **RESTful API**：与Django后端完美集成
- 🔒 **CORS支持**：跨域请求配置
- 📡 **拦截器**：统一的请求/响应处理
- 💾 **类型安全**：TypeScript类型定义

## 环境配置

### 开发环境要求
- Node.js >= 16.0.0
- npm >= 7.0.0

### 后端服务
确保Django后端服务正在运行：
```bash
# 在后端项目目录
cd ../bom-workflow-platform
docker-compose up -d
```

## 安装与运行

### 1. 安装依赖
```bash
npm install
```

### 2. 启动开发服务器
```bash
npm run dev
```

应用将在 `http://localhost:5173` 启动

### 3. 构建生产版本
```bash
npm run build
```

### 4. 预览生产构建
```bash
npm run preview
```

### 5. 运行E2E测试
```bash
# 运行所有E2E测试
npm run test:e2e

# 运行测试并显示浏览器界面
npm run test:e2e:ui

# 调试模式运行测试
npm run test:e2e:debug

# 查看测试报告
npm run test:e2e:report
```

## API配置

### 后端服务地址
默认配置在 `src/services/api.ts`：
```typescript
baseURL: 'http://localhost:8000/api'
```

### 认证配置
支持Bearer Token认证（当前为测试模式，允许匿名访问）

## 组件使用

### BomDetail组件
```vue
<template>
  <BomDetail :style-code="'TEST001'" />
</template>

<script setup>
import BomDetail from './components/BomDetail.vue'
</script>
```

### Props
- `styleCode` (string): BOM款式编码，默认为'TEST001'

## 开发规范

### 1. 代码质量
- ✅ TypeScript严格模式
- ✅ Vue 3 Composition API
- ✅ 模块化组件设计
- ✅ 统一的错误处理

### 2. 命名规范
- 组件：PascalCase (e.g., `BomDetail.vue`)
- 服务：camelCase (e.g., `bomService.ts`)
- 变量：camelCase (e.g., `styleCode`)

### 3. 目录结构
- `components/`: Vue组件
- `services/`: API服务和工具函数
- `types/`: TypeScript类型定义

## 测试数据

当前使用的测试数据：
- TEST001: 春季时尚T恤 (已确认状态)
- TEST002: 夏季休闲短裤 (待填写工艺)
- TEST003: 秋季连衣裙 (草稿状态)

## 部署

### 构建优化
- Tree-shaking: 自动移除未使用代码
- 代码分割: 按需加载
- 资源压缩: 自动压缩CSS/JS

### 环境变量
在 `.env` 文件中配置：
```
VITE_API_BASE_URL=http://localhost:8000/api
```

## 故障排除

### 常见问题

1. **CORS错误**
   - 确保Django后端已配置CORS
   - 检查API地址是否正确

2. **API连接失败**
   - 确保后端服务正在运行
   - 检查端口是否被占用

3. **依赖安装失败**
   - 清除npm缓存: `npm cache clean --force`
   - 删除node_modules重新安装

## E2E测试

### 测试框架
使用Playwright进行端到端测试，确保应用在真实浏览器环境中的功能正常。

### 测试覆盖范围
- ✅ **页面加载测试**: 验证所有页面正常加载
- ✅ **导航功能测试**: 验证页面间的导航跳转
- ✅ **响应式布局测试**: 验证不同设备上的显示效果
- ✅ **API集成测试**: 验证前后端数据交互
- ✅ **错误处理测试**: 验证异常情况下的用户体验
- ✅ **性能基准测试**: 验证页面加载性能

### 测试配置
- **浏览器支持**: Chromium, Firefox, Webkit
- **并行执行**: 支持多进程并行测试
- **自动服务器**: 测试时自动启动开发服务器
- **视觉回归**: 支持截图对比测试
- **测试报告**: HTML格式的详细测试报告

### 运行测试
```bash
# 运行核心功能测试
npx playwright test tests/bom-core.spec.ts

# 运行指定浏览器测试
npx playwright test --project=chromium

# 运行指定测试用例
npx playwright test -g "首页加载测试"

# 生成测试报告
npx playwright show-report
```

### 调试测试
```bash
# 调试模式（会打开浏览器界面）
npm run test:e2e:debug

# UI模式（图形化界面）
npm run test:e2e:ui
```

## 更新日志

### 2025/09/20 18:55 - Playwright E2E测试集成 ✅
- ✅ **Playwright测试框架**：完整的E2E测试环境搭建
  - 多浏览器支持 (Chrome, Firefox, Safari)
  - 自动化测试脚本和配置
  - 并行测试执行和报告生成
- ✅ **核心功能测试**：基础页面和功能验证
  - 首页、列表页、详情页加载测试
  - 导航和路由功能测试
  - 响应式布局测试
- ✅ **集成测试套件**：完整用户流程验证
  - 用户操作流程模拟
  - API数据交互测试
  - 错误处理机制验证
- ✅ **测试工具配置**：开发工作流集成
  - npm脚本集成
  - 调试和UI模式支持
  - HTML测试报告生成

### 2025/09/20 14:30 - 路由系统和布局完善 ✅
- ✅ **Vue Router 4配置**：完整的路由系统搭建
  - 动态路由支持 (`/boms/:style_code`)
  - 路由懒加载优化
  - 路由守卫和错误处理
- ✅ **API代理配置**：Vite开发代理设置
  - 本地开发无需CORS配置
  - 请求日志和调试支持
  - 自动代理到Django后端
- ✅ **企业级布局**：完整的管理后台界面
  - 侧边导航菜单
  - 面包屑导航
  - 用户操作区域
  - 连接状态监控
- ✅ **多页面应用**：完整的页面体系
  - 首页: 欢迎界面和快速入门
  - BOM列表: 数据表格和高级筛选
  - BOM详情: 完整信息展示
- ✅ **用户体验优化**：
  - 页面过渡动画
  - 响应式设计
  - 全屏和刷新功能
  - 实时连接状态

### 2025/09/20 12:00 - 前端项目初始化 ✅
- ✅ Vue.js + TypeScript项目搭建
- ✅ Element Plus UI库集成
- ✅ Axios HTTP客户端配置  
- ✅ BOM详情页面实现
- ✅ API服务层封装
- ✅ CORS跨域解决
- ✅ 测试数据集成

## 技术支持

如有问题，请查看：
- [Vue.js官方文档](https://vuejs.org/)
- [Element Plus文档](https://element-plus.org/)
- [TypeScript文档](https://www.typescriptlang.org/)

---

*BOM协同工作流平台前端项目 - 企业级Vue.js应用*