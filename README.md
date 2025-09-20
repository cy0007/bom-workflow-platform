# BOM协同工作流平台

## 📋 项目简介

BOM协同工作流平台是一个企业级的Web应用程序，专门为服装行业的BOM（Bill of Materials，物料清单）协同管理而设计。本项目采用现代化的前后端分离架构，提供完整的BOM生命周期管理解决方案。

## 🏗 技术架构

### 后端 (Django + DRF)
- **框架**: Django 4.2 + Django REST Framework
- **数据库**: PostgreSQL 14
- **部署**: Docker + Docker Compose
- **API**: RESTful API设计，支持完整的CRUD操作

### 前端 (Vue.js 3)
- **框架**: Vue.js 3 + TypeScript + Vite
- **UI库**: Element Plus (企业级组件库)
- **路由**: Vue Router 4
- **HTTP客户端**: Axios
- **构建工具**: Vite

## 🎯 核心功能

### ✅ 已完成功能 (v2.0)

#### 后端API (Django + DRF)
- **BOM列表API**: `GET /api/boms/` - 支持分页、搜索、过滤、排序
- **BOM详情API**: `GET /api/boms/{style_code}/` - 获取单个BOM完整信息
- **BOM更新API**: `PATCH /api/boms/{style_code}/` - 部分更新BOM字段
- **数据模型**: User, Bom, BomDetail, SizeSpec完整模型设计
- **权限控制**: 基于DRF的认证和权限系统
- **跨域支持**: django-cors-headers配置，支持前端开发

#### 前端界面 (Vue.js 3)
- **BOM详情页**: 企业级数据展示界面，支持响应式布局
- **API集成**: 完整的HTTP客户端配置，支持请求/响应拦截
- **路由系统**: Vue Router配置，支持动态路由参数
- **UI组件**: 使用Element Plus构建专业的企业界面
- **错误处理**: 完善的错误处理和用户提示机制

#### 开发工具链
- **TDD开发**: 严格遵循测试驱动开发模式
- **代码规范**: 遵循PEP 8和Vue.js最佳实践
- **容器化**: Docker完整开发环境配置
- **API代理**: Vite开发服务器代理配置，解决CORS问题

### 🚧 开发中功能

- **BOM列表页**: 表格展示、高级筛选、批量操作
- **BOM编辑功能**: 在线编辑BOM基础信息
- **物料管理**: 物料明细的增删改查
- **尺码管理**: 规格尺寸的动态配置
- **工艺流程**: BOM审批流程管理

### 🔮 计划功能

- **用户管理**: 完整的用户角色权限系统
- **工作流引擎**: 自定义审批流程
- **成本核算**: 实时成本计算和预警
- **版本管理**: BOM版本历史和对比
- **报表分析**: 成本分析和业务报表
- **文件管理**: 附件上传和技术规格书管理

## 📁 项目结构

```
bom-workflow-platform/          # 后端Django项目
├── config/                     # Django配置
│   ├── settings.py            # 项目配置
│   ├── urls.py               # 主路由配置
│   └── wsgi.py               # WSGI配置
├── boms/                      # BOM应用
│   ├── models.py             # 数据模型
│   ├── views.py              # API视图
│   ├── serializers.py        # DRF序列化器
│   ├── urls.py               # 路由配置
│   └── tests.py              # 测试用例
├── docker-compose.yml         # Docker编排配置
├── Dockerfile                # Docker镜像配置
├── manage.py                 # Django管理脚本
└── requirements.txt          # Python依赖

../bom-platform-frontend/     # 前端Vue.js项目
├── src/
│   ├── views/                # 页面组件
│   │   ├── BomDetailView.vue # BOM详情页
│   │   ├── BomListView.vue   # BOM列表页
│   │   └── HomeView.vue      # 首页
│   ├── services/             # API服务
│   │   ├── api.ts           # Axios配置
│   │   └── bomService.ts    # BOM API服务
│   ├── router/              # 路由配置
│   │   └── index.ts         # Vue Router
│   ├── App.vue              # 主应用组件
│   └── main.ts              # 应用入口
├── vite.config.ts           # Vite配置
├── package.json             # Node.js依赖
└── FEATURES.md             # 功能文档
```

## 🚀 快速开始

### 环境要求
- Docker & Docker Compose
- Node.js 16+ (前端开发)
- Python 3.9+ (后端开发，可选)

### 后端启动

```bash
# 克隆项目
git clone <repository-url>
cd bom-workflow-platform

# 启动后端服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs backend
```

后端服务将在 `http://localhost:8000` 启动

### 前端启动

```bash
# 进入前端目录
cd ../bom-platform-frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端服务将在 `http://localhost:5173` 启动

### 访问应用

- **前端界面**: http://localhost:5173
- **BOM详情页**: http://localhost:5173/boms/TEST001
- **后端API**: http://localhost:8000/api/
- **Django Admin**: http://localhost:8000/admin/

## 📊 数据模型

### Bom (BOM主表)
- `style_code`: 款式编码 (主键)
- `product_name`: 产品名称
- `season/year/wave`: 季节/年份/波段
- `category`: 品类 (上衣/下装/连衣裙等)
- `dev_colors`: 开发颜色列表
- `target_price/estimated_cost`: 目标价格/预估成本
- `fabric_composition/fabric_weight`: 面料成分/克重
- `status`: 状态 (草稿/待确认/已确认等)

### BomDetail (物料明细)
- `bom`: 关联BOM
- `sequence`: 序号
- `material_type`: 物料类型
- `material_name`: 物料名称
- `specification`: 规格描述
- `supplier_name`: 供应商
- `usage_quantity/unit_price`: 用量/单价

### SizeSpec (尺码规格)
- `bom`: 关联BOM
- `size`: 尺码 (S/M/L/XL等)
- `measurements`: 测量数据 (JSON)
- `is_active`: 是否启用

## 🔧 开发规范

### TDD开发流程
1. **🔴 红灯**: 编写失败的测试
2. **🟢 绿灯**: 编写最简实现使测试通过
3. **🔵 重构**: 优化代码质量，保持测试通过

### Git提交规范
- `feat:` 新功能
- `fix:` 修复bug
- `test:` 测试相关
- `refactor:` 重构
- `docs:` 文档更新
- `chore:` 构建/工具链更新

### 代码规范
- **Python**: 遵循 PEP 8
- **TypeScript**: 遵循 Vue.js 最佳实践
- **命名**: 类名驼峰式，函数名蛇形命名
- **注释**: 完善的代码注释和文档字符串

## 🧪 测试

### 后端测试
```bash
# 运行所有测试
docker-compose exec backend python manage.py test

# 运行特定应用测试
docker-compose exec backend python manage.py test boms

# 查看测试覆盖率
docker-compose exec backend coverage run --source='.' manage.py test
docker-compose exec backend coverage report
```

### 前端测试
```bash
# 单元测试 (计划中)
npm run test

# E2E测试 (计划中)
npm run test:e2e
```

## 📈 API文档

### BOM相关API

#### 获取BOM列表
```http
GET /api/boms/
```
**查询参数**:
- `page`: 页码
- `search`: 搜索关键词 (款式编码、产品名称)
- `status`: 状态筛选
- `category`: 品类筛选
- `ordering`: 排序字段

#### 获取BOM详情
```http
GET /api/boms/{style_code}/
```

#### 更新BOM
```http
PATCH /api/boms/{style_code}/
Content-Type: application/json

{
  "product_name": "更新后的产品名称",
  "status": "PENDING_CRAFT"
}
```

## 🔍 故障排查

### 常见问题

1. **CORS错误**
   - 确保Django配置了 `django-cors-headers`
   - 检查 `CORS_ALLOWED_ORIGINS` 配置

2. **API代理失败**
   - 检查 `vite.config.ts` 代理配置
   - 确保后端服务在 8000 端口运行

3. **数据库连接错误**
   - 检查 Docker 服务状态: `docker-compose ps`
   - 查看数据库日志: `docker-compose logs db`

4. **前端无法访问**
   - 确保端口 5173 未被占用
   - 检查 npm 依赖是否正确安装

## 📋 更新日志

### v2.0.0 (2025-09-20)
- ✅ 完成Django后端API开发 (列表、详情、更新)
- ✅ 完成Vue.js前端BOM详情页面
- ✅ 集成Element Plus企业级UI组件
- ✅ 配置API代理和CORS跨域支持
- ✅ 实现TDD测试驱动开发
- ✅ 修复无限循环API请求问题
- ✅ 完善错误处理和用户体验

### v1.0.0 (2025-09-19)
- ✅ Django项目初始化和模型设计
- ✅ PostgreSQL数据库集成
- ✅ Docker容器化部署
- ✅ Django Admin管理后台
- ✅ 基础数据模型 (User, Bom, BomDetail, SizeSpec)

## 👥 开发团队

- **产品经理 & 工程师**: Cursor AI Assistant
- **用户**: 陈同学 (需求方)

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

---

**最后更新**: 2025-09-20 14:30 (UTC+8)  
**项目状态**: 🚀 活跃开发中  
**版本**: v2.0.0