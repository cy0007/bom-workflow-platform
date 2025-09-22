<template>
  <div class="bom-list-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">BOM列表管理</h1>
        <p class="page-description">管理和查看所有BOM（物料清单）信息</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="createBom">
          <el-icon><Plus /></el-icon>
          新建BOM
        </el-button>
      </div>
    </div>

    <!-- 搜索和过滤栏 -->
    <el-card class="filter-card">
      <el-row :gutter="16">
        <el-col :span="6">
          <el-input
            v-model="searchText"
            placeholder="搜索款式编码或产品名称"
            clearable
            @input="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-select v-model="statusFilter" placeholder="状态筛选" clearable @change="handleFilter">
            <el-option label="草稿" value="DRAFT" />
            <el-option label="待填写工艺" value="PENDING_CRAFT" />
            <el-option label="待版房确认" value="PENDING_PATTERN" />
            <el-option label="已确认" value="CONFIRMED" />
            <el-option label="已修订" value="REVISED" />
            <el-option label="已取消" value="CANCELLED" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-select v-model="categoryFilter" placeholder="品类筛选" clearable @change="handleFilter">
            <el-option label="上衣" value="TOP" />
            <el-option label="下装" value="BOTTOM" />
            <el-option label="连衣裙" value="DRESS" />
            <el-option label="外套" value="OUTERWEAR" />
            <el-option label="配饰" value="ACCESSORY" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-select v-model="seasonFilter" placeholder="季节筛选" clearable @change="handleFilter">
            <el-option label="春季" value="SPRING" />
            <el-option label="夏季" value="SUMMER" />
            <el-option label="秋季" value="AUTUMN" />
            <el-option label="冬季" value="WINTER" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-button @click="resetFilters">重置筛选</el-button>
          <el-button type="primary" @click="refreshData">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- BOM数据表格 -->
    <el-card class="table-card">
      <el-table 
        v-loading="loading"
        :data="bomList" 
        stripe
        @row-click="handleRowClick"
        style="width: 100%; cursor: pointer;"
      >
        <el-table-column prop="style_code" label="款式编码" width="120" fixed="left">
          <template #default="{ row }">
            <el-link type="primary" @click.stop="viewDetail(row.style_code)">
              {{ row.style_code }}
            </el-link>
          </template>
        </el-table-column>
        
        <el-table-column prop="product_name" label="产品名称" width="180" show-overflow-tooltip />
        
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="category" label="品类" width="100">
          <template #default="{ row }">
            {{ getCategoryText(row.category) }}
          </template>
        </el-table-column>
        
        <el-table-column prop="season" label="季节" width="80">
          <template #default="{ row }">
            {{ getSeasonText(row.season) }}
          </template>
        </el-table-column>
        
        <el-table-column prop="year" label="年份" width="80" />
        
        <el-table-column prop="wave" label="波段" width="100" show-overflow-tooltip />
        
        <el-table-column prop="dev_colors_list" label="开发颜色" width="150">
          <template #default="{ row }">
            <el-tag 
              v-for="color in row.dev_colors_list?.slice(0, 2)" 
              :key="color"
              size="small"
              class="color-tag"
            >
              {{ color }}
            </el-tag>
            <el-tag v-if="row.dev_colors_list?.length > 2" size="small" type="info">
              +{{ row.dev_colors_list.length - 2 }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="target_price" label="目标价格" width="100">
          <template #default="{ row }">
            {{ formatPrice(row.target_price) }}
          </template>
        </el-table-column>
        
        <el-table-column prop="total_cost" label="总成本" width="100">
          <template #default="{ row }">
            <span class="price-text">{{ formatPrice(row.total_cost) }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="updated_at" label="更新时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.updated_at) }}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click.stop="viewDetail(row.style_code)">查看</el-button>
            <el-button size="small" type="primary" @click.stop="editBom(row.style_code)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 空状态 -->
    <div v-if="!loading && bomList.length === 0" class="empty-container">
      <el-empty description="暂无BOM数据">
        <el-button type="primary" @click="createBom">创建第一个BOM</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { BomService, type BomData } from '../services/bomService'
import { ElMessage } from 'element-plus'
import { Plus, Search, Refresh } from '@element-plus/icons-vue'

// 路由
const router = useRouter()

// 响应式数据
const loading = ref(true)
const bomList = ref<BomData[]>([])
const searchText = ref('')
const statusFilter = ref('')
const categoryFilter = ref('')
const seasonFilter = ref('')

// 生命周期
onMounted(() => {
  loadBomList()
})

// 加载BOM列表
const loadBomList = async () => {
  loading.value = true
  
  try {
    const params: any = {}
    
    // 添加搜索参数
    if (searchText.value) params.search = searchText.value
    if (statusFilter.value) params.status = statusFilter.value
    if (categoryFilter.value) params.category = categoryFilter.value
    if (seasonFilter.value) params.season = seasonFilter.value
    
    bomList.value = await BomService.getBomList(params)
  } catch (error) {
    console.error('加载BOM列表失败:', error)
    ElMessage.error('加载BOM列表失败，请稍后重试')
    bomList.value = []
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  loadBomList()
}

// 过滤处理
const handleFilter = () => {
  loadBomList()
}

// 重置筛选
const resetFilters = () => {
  searchText.value = ''
  statusFilter.value = ''
  categoryFilter.value = ''
  seasonFilter.value = ''
  loadBomList()
}

// 刷新数据
const refreshData = () => {
  loadBomList()
}

// 查看详情
const viewDetail = (styleCode: string) => {
  router.push(`/boms/${styleCode}`)
}

// 编辑BOM
const editBom = (styleCode: string) => {
  // TODO: 实现编辑功能
  ElMessage.info(`编辑功能开发中: ${styleCode}`)
}

// 创建BOM
const createBom = () => {
  // TODO: 实现创建功能
  ElMessage.info('创建BOM功能开发中')
}

// 行点击处理
const handleRowClick = (row: BomData) => {
  viewDetail(row.style_code)
}

// 状态类型映射 - 修复ElTag组件type属性问题
const getStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    'DRAFT': 'info',          // 修复：使用'info'代替空字符串
    'PENDING_CRAFT': 'warning',
    'PENDING_PATTERN': 'info',
    'CONFIRMED': 'success',
    'REVISED': 'warning',
    'CANCELLED': 'danger'
  }
  return statusMap[status] || 'info'  // 修复：默认返回'info'代替空字符串
}

// 状态文本映射
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'DRAFT': '草稿',
    'PENDING_CRAFT': '待填写工艺',
    'PENDING_PATTERN': '待版房确认',
    'CONFIRMED': '已确认',
    'REVISED': '已修订',
    'CANCELLED': '已取消'
  }
  return statusMap[status] || status
}

// 品类文本映射
const getCategoryText = (category: string) => {
  const categoryMap: Record<string, string> = {
    'TOP': '上衣',
    'BOTTOM': '下装',
    'DRESS': '连衣裙',
    'OUTERWEAR': '外套',
    'ACCESSORY': '配饰'
  }
  return categoryMap[category] || category
}

// 季节文本映射
const getSeasonText = (season: string) => {
  const seasonMap: Record<string, string> = {
    'SPRING': '春季',
    'SUMMER': '夏季',
    'AUTUMN': '秋季',
    'WINTER': '冬季'
  }
  return seasonMap[season] || season
}

// 价格格式化 - 增强防御性编程
const formatPrice = (price: number | string | null | undefined) => {
  // 处理null、undefined或空值
  if (price === null || price === undefined || price === '') return '未设置'
  
  // 处理字符串类型的价格
  if (typeof price === 'string') {
    const numPrice = parseFloat(price)
    if (isNaN(numPrice)) return '未设置'
    return `¥${numPrice.toFixed(2)}`
  }
  
  // 处理数字类型的价格
  if (typeof price === 'number') {
    if (isNaN(price)) return '未设置'
    return `¥${price.toFixed(2)}`
  }
  
  return '未设置'
}

// 日期格式化
const formatDate = (dateString: string | null) => {
  if (!dateString) return '未设置'
  return new Date(dateString).toLocaleDateString('zh-CN')
}
</script>

<style scoped>
.bom-list-container {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: calc(100vh - 60px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-left {
  flex: 1;
}

.page-title {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.page-description {
  margin: 0;
  color: #606266;
  font-size: 14px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.filter-card {
  margin-bottom: 20px;
}

.table-card {
  margin-bottom: 20px;
}

.color-tag {
  margin-right: 4px;
  margin-bottom: 2px;
}

.price-text {
  font-weight: 600;
  color: #e6a23c;
}

.empty-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 表格行悬停效果 */
:deep(.el-table__row) {
  cursor: pointer;
}

:deep(.el-table__row:hover) {
  background-color: #f5f7fa;
}
</style>
