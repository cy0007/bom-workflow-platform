<template>
  <div class="bom-detail-container">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="10" animated />
    </div>

    <!-- BOM详情展示 -->
    <div v-else-if="bomData" class="bom-detail-content">
      <!-- 页面标题 -->
      <div class="page-header">
        <el-page-header @back="handleBack">
          <template #content>
            <span class="page-title">{{ bomData.style_code }} - {{ bomData.product_name }}</span>
          </template>
        </el-page-header>
        <el-tag :type="getStatusType(bomData.status)" class="status-tag">
          {{ getStatusText(bomData.status) }}
        </el-tag>
      </div>

      <!-- 基本信息卡片 -->
      <el-card class="info-card">
        <template #header>
          <span class="card-title">基本信息</span>
        </template>
        <el-row :gutter="24">
          <el-col :span="8">
            <div class="info-item">
              <label>款式编码：</label>
              <span>{{ bomData.style_code }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <label>产品名称：</label>
              <span>{{ bomData.product_name }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <label>品类：</label>
              <span>{{ getCategoryText(bomData.category) }}</span>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :span="8">
            <div class="info-item">
              <label>季节：</label>
              <span>{{ getSeasonText(bomData.season) }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <label>年份：</label>
              <span>{{ bomData.year }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <label>波段：</label>
              <span>{{ bomData.wave }}</span>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <!-- 开发颜色信息 -->
      <el-card class="info-card">
        <template #header>
          <span class="card-title">开发颜色</span>
        </template>
        <div class="color-info">
          <el-tag 
            v-for="color in bomData.dev_colors_list" 
            :key="color" 
            class="color-tag"
          >
            {{ color }}
          </el-tag>
        </div>
      </el-card>

      <!-- 价格信息 -->
      <el-card class="info-card">
        <template #header>
          <span class="card-title">价格信息</span>
        </template>
        <el-row :gutter="24">
          <el-col :span="8">
            <div class="info-item price-item">
              <label>目标价格：</label>
              <span class="price">{{ formatPrice(bomData.target_price) }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item price-item">
              <label>预估成本：</label>
              <span class="price">{{ formatPrice(bomData.estimated_cost) }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item price-item">
              <label>总成本：</label>
              <span class="price total-cost">{{ formatPrice(bomData.total_cost) }}</span>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <!-- 面料信息 -->
      <el-card class="info-card" v-if="bomData.fabric_composition || bomData.fabric_weight">
        <template #header>
          <span class="card-title">面料信息</span>
        </template>
        <el-row :gutter="24">
          <el-col :span="12">
            <div class="info-item" v-if="bomData.fabric_composition">
              <label>面料成分：</label>
              <span>{{ bomData.fabric_composition }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item" v-if="bomData.fabric_weight">
              <label>面料克重：</label>
              <span>{{ bomData.fabric_weight }}</span>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <!-- 洗护说明 -->
      <el-card class="info-card" v-if="bomData.care_instructions">
        <template #header>
          <span class="card-title">洗护说明</span>
        </template>
        <div class="care-instructions">
          {{ bomData.care_instructions }}
        </div>
      </el-card>

      <!-- 备注信息 -->
      <el-card class="info-card" v-if="bomData.notes">
        <template #header>
          <span class="card-title">备注</span>
        </template>
        <div class="notes">
          {{ bomData.notes }}
        </div>
      </el-card>

      <!-- 版本信息 -->
      <el-card class="info-card">
        <template #header>
          <span class="card-title">版本信息</span>
        </template>
        <el-row :gutter="24">
          <el-col :span="6">
            <div class="info-item">
              <label>版本号：</label>
              <span>V{{ bomData.version }}</span>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="info-item">
              <label>创建时间：</label>
              <span>{{ formatDate(bomData.created_at) }}</span>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="info-item">
              <label>更新时间：</label>
              <span>{{ formatDate(bomData.updated_at) }}</span>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="info-item" v-if="bomData.confirmed_at">
              <label>确认时间：</label>
              <span>{{ formatDate(bomData.confirmed_at) }}</span>
            </div>
          </el-col>
        </el-row>
      </el-card>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-container">
      <el-empty description="加载失败">
        <el-button type="primary" @click="loadBomData">重试</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { BomService, type BomData } from '../services/bomService'
import { ElMessage } from 'element-plus'

// Props
interface Props {
  styleCode?: string
}

const props = withDefaults(defineProps<Props>(), {
  styleCode: 'TEST001' // 默认测试数据
})

// 响应式数据
const loading = ref(true)
const error = ref(false)
const bomData = ref<BomData | null>(null)

// 生命周期
onMounted(() => {
  loadBomData()
})

// 加载BOM数据
const loadBomData = async () => {
  loading.value = true
  error.value = false
  
  try {
    bomData.value = await BomService.getBomDetail(props.styleCode)
  } catch (err) {
    console.error('加载BOM数据失败:', err)
    error.value = true
    ElMessage.error('加载BOM数据失败，请检查网络连接')
  } finally {
    loading.value = false
  }
}

// 返回处理
const handleBack = () => {
  // TODO: 实现返回逻辑
  console.log('返回')
}

// 状态类型映射
const getStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    'DRAFT': '',
    'PENDING_CRAFT': 'warning',
    'PENDING_PATTERN': 'info',
    'CONFIRMED': 'success',
    'REVISED': 'warning',
    'CANCELLED': 'danger'
  }
  return statusMap[status] || ''
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

// 价格格式化
const formatPrice = (price: number | null) => {
  if (price === null || price === undefined) return '未设置'
  return `¥${price.toFixed(2)}`
}

// 日期格式化
const formatDate = (dateString: string | null) => {
  if (!dateString) return '未设置'
  return new Date(dateString).toLocaleString('zh-CN')
}
</script>

<style scoped>
.bom-detail-container {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: calc(100vh - 40px);
}

.loading-container {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 16px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.status-tag {
  font-size: 14px;
}

.info-card {
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.info-item {
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item label {
  font-weight: 500;
  color: #606266;
  margin-right: 8px;
  min-width: 80px;
  display: inline-block;
}

.info-item span {
  color: #303133;
}

.price-item .price {
  font-weight: 600;
  font-size: 16px;
}

.total-cost {
  color: #e6a23c;
  font-size: 18px !important;
}

.color-info {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.color-tag {
  margin: 0;
}

.care-instructions,
.notes {
  padding: 12px;
  background-color: #f9f9f9;
  border-radius: 6px;
  line-height: 1.6;
  color: #303133;
}

.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}
</style>
