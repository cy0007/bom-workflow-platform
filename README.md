# BOM协同工作流平台 (PoC)

## 项目简介

BOM协同工作流平台是一个基于Streamlit的Web应用程序，旨在简化和自动化服装行业的BOM（Bill of Materials，物料清单）生成流程。本项目是概念验证（Proof of Concept）版本，专注于核心功能的实现和验证。

## 项目特点

- **Web界面**：基于Streamlit的直观用户界面
- **自动化BOM生成**：支持根据款式编码自动生成标准BOM文件
- **多品类支持**：支持不同服装品类的专用模板
- **动态SKU生成**：根据颜色和尺码自动生成SKU编码
- **模块化设计**：核心逻辑与界面分离，便于维护和扩展

## 项目结构

```
/bom-workflow-platform/
├── .gitignore              # Git忽略文件配置
├── README.md               # 项目说明文档
├── app.py                  # Streamlit应用程序入口
├── requirements.txt        # Python依赖包列表
└── core/                   # 核心业务逻辑模块
    ├── bom_generator.py    # BOM生成器核心类
    └── resources/          # 资源文件目录
        ├── category_mapping.json    # 品类映射配置
        ├── bom_template.xlsx       # 默认BOM模板
        ├── color_codes.json        # 颜色代码映射
        ├── 品类对照表.csv          # 品类对照表
        └── templates/              # 品类专用模板目录
            ├── 上衣模板.xlsx
            ├── 半身裙模板.xlsx
            ├── 裤装模板.xlsx
            └── 连衣裙模板.xlsx
```

## 核心功能

### 1. BOM生成器 (BomGenerator)

位置：`core/bom_generator.py`

主要功能：
- **产品信息查询**：根据款式编码查找产品的波段、品类、开发颜色等信息
- **SKU生成**：基于款式编码、颜色代码和尺码自动生成SKU编码
- **BOM文件生成**：基于品类模板生成完整的Excel BOM文件
- **动态模板选择**：根据产品品类自动选择合适的BOM模板

### 2. 资源文件管理

- **category_mapping.json**：二级品类到一级品类的映射关系
- **color_codes.json**：颜色名称到数字代码的映射
- **templates/**：不同品类的专用BOM模板文件

## 环境要求

- Python 3.7+
- Streamlit
- pandas
- openpyxl

## 安装与运行

### 1. 安装依赖

```bash
pip install -r requirements.txt
```

### 2. 运行应用

```bash
streamlit run app.py
```

### 3. 访问应用

在浏览器中打开显示的地址（通常是 http://localhost:8501）

## 使用说明

### 基本使用流程

1. **准备源数据**：Excel文件需包含"明细表"工作表，包含款式编码、波段、品类、开发颜色等列
2. **创建BomGenerator实例**：使用源Excel文件路径初始化生成器
3. **查询产品信息**：通过款式编码获取产品详细信息
4. **生成SKU**：根据开发颜色和尺码生成完整SKU列表
5. **导出BOM文件**：生成标准格式的Excel BOM文件

### 代码示例

```python
from core.bom_generator import BomGenerator

# 初始化生成器
generator = BomGenerator('product_data.xlsx')

# 查询产品信息
style_info = generator.find_style_info('H5A123416')
print(f"品类: {style_info['品类']}")
print(f"波段: {style_info['波段']}")

# 生成SKU
skus = generator.generate_skus('H5A123416', '黑色/白色', ['S', 'M', 'L'])
for sku_info in skus:
    print(f"颜色: {sku_info['color']}")
    print(f"SKU: {sku_info['skus']}")

# 生成BOM文件
generator.generate_bom_file('H5A123416', './output')
```

## 更新记录

### 2025/09/19 22:30 - 项目初始化 ✅

- ✅ 创建基本项目结构（core/目录、resources/目录、templates/目录）
- ✅ 从旧项目迁移核心BOM生成逻辑（bom_generator.py）
- ✅ 完整复制resources目录内容（映射文件、模板文件）
- ✅ 修改resource_path函数以适应新项目结构
- ✅ 创建Streamlit应用入口文件（app.py）
- ✅ 配置项目依赖（requirements.txt）和Git忽略规则（.gitignore）
- ✅ Git提交并推送到远程仓库（GitHub）
- ✅ 本地环境验证通过：
  - BOM生成器模块导入正常
  - 资源文件路径解析正确
  - Streamlit应用成功运行在8501端口
  - 可访问"项目初始化成功！"页面

**项目状态**：初始化完成，环境配置正确，已准备好开发PoC核心功能

### 2025/09/19 23:00 - PoC核心功能开发完成 ✅

- ✅ **在线可编辑表格**：使用`st.data_editor`实现动态数据编辑功能
  - 支持添加、修改、删除行操作
  - 实时保存到会话状态，数据持久化
  - 直观的Excel式操作体验
- ✅ **实时BOM生成**：集成核心BomGenerator逻辑
  - 动态选择款式编码进行预览
  - 自动适配Excel格式以兼容BomGenerator
  - 内存中处理，无需临时文件
- ✅ **文件下载功能**：一键下载生成的BOM Excel文件
  - 支持即时下载生成的BOM表
  - 文件名自动包含款式编码
  - 标准Excel格式，可直接使用
- ✅ **完整工作流验证**：端到端功能测试通过
  - 数据编辑 → 格式转换 → BOM生成 → 文件下载
  - 异常处理和用户友好的错误提示
  - 空数据状态的妥善处理

**技术亮点**：
- 解决了Excel表头格式兼容性问题
- 实现了基于会话状态的数据持久化
- 提供了完整的错误处理机制
- 无缝集成现有BOM生成核心逻辑

**当前功能状态**：PoC第一阶段完成，核心工作流程已打通，可进行用户测试和反馈收集

## 技术架构

### 设计原则

- **单一职责**：每个模块专注于特定功能
- **开放封闭**：易于扩展新功能，无需修改现有代码
- **依赖注入**：通过配置文件管理品类映射和颜色代码
- **错误处理**：完善的异常处理机制

### 核心类设计

**BomGenerator类**：
- 数据加载与验证
- 产品信息查询
- SKU生成算法
- BOM文件导出

## 待开发功能

- [ ] Web界面交互功能
- [ ] 批量BOM生成
- [ ] 自定义模板支持
- [ ] 数据验证与错误提示
- [ ] 用户权限管理
- [ ] 操作日志记录

## 联系信息

如有问题或建议，请联系项目团队。

---

*本项目为BOM协同工作流平台的概念验证版本，专注于核心功能实现。*
