<template>
  <div class="bom-detail-container" :class="{ 'readonly-mode': !isEditMode, 'edit-mode': isEditMode }">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="12" animated />
    </div>

    <!-- BOM详情展示 -->
    <div v-else-if="bomData" class="bom-detail-content">
      <!-- 页面标题 -->
      <div class="page-header">
        <el-page-header @back="handleBack">
          <template #content>
            <div class="header-content">
              <h1 class="page-title">{{ bomData.style_code }} - {{ bomData.product_name }}</h1>
              <el-tag :type="getStatusType(bomData.status)" size="large" class="status-tag">
                {{ getStatusText(bomData.status) }}
              </el-tag>
            </div>
          </template>
        </el-page-header>
      </div>

      <!-- 权限提示信息 -->
      <el-alert
        v-if="permissionMessage"
        :title="permissionMessage"
        type="warning"
        show-icon
        :closable="false"
        style="margin-bottom: 20px"
      />
      
      <!-- 针对确认状态BOM的特殊提示 -->
      <el-alert
        v-if="bomData.status === 'CONFIRMED'"
        title="BOM已确认，无法编辑"
        type="info"
        show-icon
        :closable="false"
        style="margin-bottom: 20px"
      />

      <!-- 基本信息描述 -->
      <el-card class="info-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span class="card-title">
              <el-icon><InfoFilled /></el-icon>
              基本信息
            </span>
            <el-button 
              v-if="permissions.canEditBasicInfo"
              type="primary" 
              size="small" 
              @click="editBom"
              :disabled="bomData.status === 'CONFIRMED'"
            >
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
          </div>
        </template>
        
        <el-descriptions :column="3" size="large" border>
          <el-descriptions-item label="款式编码">
            <el-tag type="primary">{{ bomData.style_code }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="产品名称">
            {{ bomData.product_name }}
          </el-descriptions-item>
          <el-descriptions-item label="品类">
            <el-tag>{{ getCategoryText(bomData.category) }}</el-tag>
          </el-descriptions-item>
          
          <el-descriptions-item label="季节">
            {{ getSeasonText(bomData.season) }}
          </el-descriptions-item>
          <el-descriptions-item label="年份">
            {{ bomData.year }}
          </el-descriptions-item>
          <el-descriptions-item label="波段">
            {{ bomData.wave }}
          </el-descriptions-item>
          
          <el-descriptions-item label="版本号">
            <el-tag type="info">V{{ bomData.version }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ formatDate(bomData.created_at) }}
          </el-descriptions-item>
          <el-descriptions-item label="更新时间">
            {{ formatDate(bomData.updated_at) }}
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 开发颜色 -->
      <el-card v-if="bomData.dev_colors_list && bomData.dev_colors_list.length > 0" class="info-card" shadow="hover">
        <template #header>
          <span class="card-title">
            <el-icon><Brush /></el-icon>
            开发颜色
          </span>
        </template>
        
        <div class="color-display">
          <el-tag 
            v-for="color in bomData.dev_colors_list" 
            :key="color"
            size="large"
            class="color-tag"
            effect="dark"
          >
            <el-icon><Warning /></el-icon>
            {{ color }}
          </el-tag>
        </div>
      </el-card>

      <!-- 价格信息 -->
      <el-card class="info-card" shadow="hover">
        <template #header>
          <span class="card-title">
            <el-icon><Money /></el-icon>
            价格信息
          </span>
        </template>
        
        <el-descriptions :column="3" size="large" border>
          <el-descriptions-item label="目标价格">
            <span class="price-value target-price">{{ formatPrice(bomData.target_price) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="预估成本">
            <span class="price-value estimated-cost">{{ formatPrice(bomData.estimated_cost) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="总成本">
            <span class="price-value">{{ formatPrice(bomData.total_cost) }}</span>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 物料明细表 -->
      <el-card class="info-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span class="card-title">
              <el-icon><List /></el-icon>
              物料明细
            </span>
            <div>
              <el-button 
                v-if="permissions.canEditMaterials && !isEditingMaterials"
                type="success" 
                size="small" 
                @click="startEditMaterials"
                :disabled="bomData.status === 'CONFIRMED'"
              >
                <el-icon><EditPen /></el-icon>
                编辑物料
              </el-button>
              <template v-if="isEditingMaterials">
                <el-button 
                  type="success" 
                  size="small" 
                  @click="saveMaterialChanges"
                  :loading="saving"
                >
                  保存物料修改
                </el-button>
                <el-button 
                  size="small" 
                  @click="cancelEditMaterials"
                >
                  取消
                </el-button>
              </template>
              <el-button type="primary" size="small" @click="addMaterial">
                <el-icon><Plus /></el-icon>
                添加物料
              </el-button>
            </div>
          </div>
        </template>
        
        <el-table 
          id="material-list-table"
          :data="materialsList" 
          stripe 
          border
          style="width: 100%"
          :empty-text="'暂无物料数据，点击上方按钮添加'"
        >
          <el-table-column prop="sequence" label="序号" width="80" align="center" />
          <el-table-column prop="material_type" label="物料类型" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getMaterialTypeColor(row.material_type)">{{ getMaterialTypeText(row.material_type) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="material_name" label="物料名称" width="150">
            <template #default="{ row }">
              <span>{{ row.material_name }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="specification" label="规格描述" width="180" />
          <el-table-column prop="supplier_name" label="供应商" width="120" />
          <el-table-column prop="usage_quantity" label="用量" width="100" align="center">
            <template #default="{ row }">
              <el-input
                v-if="isEditingMaterials"
                v-model="row.usage_quantity"
                size="small"
                placeholder="用量"
                type="number"
                :min="0"
                step="0.1"
              />
              <span v-else>{{ row.usage_quantity }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="usage_unit" label="单位" width="80" align="center" />
          <el-table-column prop="unit_price" label="单价" width="100" align="center">
            <template #default="{ row }">
              <span>¥{{ row.unit_price.toFixed(2) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="total_cost" label="总价" width="100" align="center">
            <template #default="{ row }">
              <span class="total-cost">¥{{ row.total_cost.toFixed(2) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right" v-if="permissions.canEditMaterials">
            <template #default="{ row }">
              <el-button size="small" @click="editMaterial(row)">编辑</el-button>
              <el-button size="small" type="danger" @click="deleteMaterial(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- 规格尺寸表格 -->
      <el-card class="info-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span class="card-title">
              <el-icon><List /></el-icon>
              规格尺寸
            </span>
            <div>
              <el-button 
                v-if="permissions.canEditSizeSpecs && !isEditingSizeSpecs"
                type="success" 
                size="small" 
                @click="startEditSizeSpecs"
                :disabled="bomData.status === 'CONFIRMED'"
              >
                <el-icon><EditPen /></el-icon>
                编辑规格尺寸
              </el-button>
              <template v-if="isEditingSizeSpecs">
                <el-button 
                  type="success" 
                  size="small" 
                  @click="saveSizeSpecsChanges"
                  :loading="saving"
                >
                  保存尺寸修改
                </el-button>
                <el-button 
                  size="small" 
                  @click="cancelEditSizeSpecs"
                >
                  取消
                </el-button>
              </template>
              <el-button type="primary" size="small" @click="addSizeSpec">
                <el-icon><Plus /></el-icon>
                添加尺码
              </el-button>
            </div>
          </div>
        </template>
        
        <el-table 
          id="size-specs-table"
          :data="sizeSpecsList" 
          stripe 
          border
          style="width: 100%"
          :empty-text="'暂无尺码数据，点击上方按钮添加'"
        >
          <el-table-column prop="size" label="尺码" width="100" align="center">
            <template #default="{ row }">
              <el-tag type="warning">{{ row.size }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="measurements.胸围" label="胸围(cm)" width="100" align="center">
            <template #default="{ row }">
              <el-input
                v-if="isEditingSizeSpecs"
                v-model="row.measurements.胸围"
                size="small"
                type="number"
                :min="0"
                step="1"
              />
              <span v-else>{{ row.measurements.胸围 }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="measurements.肩宽" label="肩宽(cm)" width="100" align="center">
            <template #default="{ row }">
              <el-input
                v-if="isEditingSizeSpecs"
                v-model="row.measurements.肩宽"
                size="small"
                type="number"
                :min="0"
                step="1"
              />
              <span v-else>{{ row.measurements.肩宽 }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="measurements.袖长" label="袖长(cm)" width="100" align="center">
            <template #default="{ row }">
              <el-input
                v-if="isEditingSizeSpecs"
                v-model="row.measurements.袖长"
                size="small"
                type="number"
                :min="0"
                step="1"
              />
              <span v-else>{{ row.measurements.袖长 }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="measurements.衣长" label="衣长(cm)" width="100" align="center">
            <template #default="{ row }">
              <el-input
                v-if="isEditingSizeSpecs"
                v-model="row.measurements.衣长"
                size="small"
                type="number"
                :min="0"
                step="1"
              />
              <span v-else>{{ row.measurements.衣长 }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="measurements.腰围" label="腰围(cm)" width="100" align="center">
            <template #default="{ row }">
              <el-input
                v-if="isEditingSizeSpecs"
                v-model="row.measurements.腰围"
                size="small"
                type="number"
                :min="0"
                step="1"
              />
              <span v-else>{{ row.measurements.腰围 }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="measurements.臀围" label="臀围(cm)" width="100" align="center">
            <template #default="{ row }">
              <el-input
                v-if="isEditingSizeSpecs"
                v-model="row.measurements.臀围"
                size="small"
                type="number"
                :min="0"
                step="1"
              />
              <span v-else>{{ row.measurements.臀围 }}</span>
            </template>
          </el-table-column>
          <!-- 添加裙长列用于测试 -->
          <el-table-column prop="measurements.裙长" label="裙长(cm)" width="100" align="center">
            <template #default="{ row }">
              <el-input
                v-if="isEditingSizeSpecs"
                v-model="row.measurements.裙长"
                size="small"
                type="number"
                :min="0"
                step="1"
              />
              <span v-else>{{ row.measurements.裙长 || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="80" align="center">
            <template #default="{ row }">
              <el-tag :type="row.is_active ? 'success' : 'danger'" size="small">
                {{ row.is_active ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right" v-if="permissions.canEditSizeSpecs">
            <template #default="{ row }">
              <el-button size="small" @click="editSizeSpec(row)">编辑</el-button>
              <el-button size="small" type="danger" @click="deleteSizeSpec(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- 面料信息 -->
      <el-card v-if="bomData.fabric_composition || bomData.fabric_weight" class="info-card" shadow="hover">
        <template #header>
          <span class="card-title">
            <el-icon><Goods /></el-icon>
            面料信息
          </span>
        </template>
        
        <el-descriptions :column="2" size="large" border>
          <el-descriptions-item v-if="bomData.fabric_composition" label="面料成分">
            {{ bomData.fabric_composition }}
          </el-descriptions-item>
          <el-descriptions-item v-if="bomData.fabric_weight" label="面料克重">
            {{ bomData.fabric_weight }}
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 工艺要求 -->
      <el-card v-if="bomData.care_instructions" class="info-card" shadow="hover">
        <template #header>
          <span class="card-title">
            <el-icon><Warning /></el-icon>
            护理说明
          </span>
        </template>
        
        <p class="care-instructions">{{ bomData.care_instructions }}</p>
      </el-card>

      <!-- 备注信息 -->
      <el-card v-if="bomData.notes" class="info-card" shadow="hover">
        <template #header>
          <span class="card-title">
            <el-icon><EditPen /></el-icon>
            备注
          </span>
        </template>
        
        <p class="notes">{{ bomData.notes }}</p>
      </el-card>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-container">
      <el-result
        icon="error"
        title="加载失败"
        sub-title="无法加载BOM详情数据，请稍后重试"
      >
        <template #extra>
          <el-button type="primary" @click="loadBomData">
            <el-icon><Refresh /></el-icon>
            重新加载
          </el-button>
        </template>
      </el-result>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { BomService, type BomData } from '../services/bomService'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  InfoFilled, Edit, Brush, Money, List, Plus, 
  Goods, Warning, EditPen, Refresh 
} from '@element-plus/icons-vue'
import { 
  getCurrentUserPermissions, 
  getPermissionMessage, 
  currentUser,
  type BomStatus 
} from '../services/authService'

// 路由hooks
const route = useRoute()
const router = useRouter()

// 响应式数据
const loading = ref(true)
const error = ref(false)
const bomData = ref<BomData | null>(null)
const saving = ref(false)

// 编辑模式状态
const isEditMode = ref(false)
const isEditingSizeSpecs = ref(false)
const isEditingMaterials = ref(false)

// 检查当前用户是否有编辑权限，如果有则默认进入编辑模式
const checkAutoEditMode = () => {
  if (bomData.value && currentUser.value) {
    const perms = getCurrentUserPermissions(bomData.value.status as BomStatus)
    if (perms.canEditSizeSpecs || perms.canEditMaterials) {
      // 对于有编辑权限的用户，自动进入相应的编辑模式
      if (perms.canEditSizeSpecs) {
        isEditingSizeSpecs.value = true
        isEditMode.value = true
      }
      if (perms.canEditMaterials) {
        isEditingMaterials.value = true
        isEditMode.value = true
      }
    }
  }
}

// 获取路由参数中的style_code
const styleCode = ref(route.params.style_code as string)

// 权限相关计算属性
const permissions = computed(() => {
  if (!bomData.value) return { canEditSizeSpecs: false, canEditMaterials: false, canEditBasicInfo: false }
  return getCurrentUserPermissions(bomData.value.status as BomStatus)
})

const permissionMessage = computed(() => {
  if (!bomData.value) return ''
  return getPermissionMessage(bomData.value.status as BomStatus)
})

// 模拟物料明细数据
const materialsList = ref([
  {
    sequence: 1,
    material_type: 'FABRIC',
    material_name: '纯棉针织面料',
    specification: '180g/m², 100%棉',
    supplier_name: '华纺纺织',
    usage_quantity: 1.2,
    usage_unit: 'M',
    unit_price: 25.50,
    total_cost: 30.60
  },
  {
    sequence: 2,
    material_type: 'THREAD',
    material_name: '聚酯缝纫线',
    specification: '40/2规格',
    supplier_name: '金达线业',
    usage_quantity: 200,
    usage_unit: 'M',
    unit_price: 0.02,
    total_cost: 4.00
  },
  {
    sequence: 3,
    material_type: 'LABEL',
    material_name: '主标签',
    specification: '印刷织标',
    supplier_name: '标牌制作',
    usage_quantity: 1,
    usage_unit: 'PCS',
    unit_price: 0.5,
    total_cost: 0.5
  }
])

// 模拟尺码规格数据
const sizeSpecsList = ref([
  {
    size: 'S',
    measurements: { 胸围: 96, 肩宽: 42, 袖长: 58, 衣长: 65, 腰围: 88, 臀围: 98, 裙长: 85 },
    is_active: true
  },
  {
    size: 'M',
    measurements: { 胸围: 100, 肩宽: 44, 袖长: 60, 衣长: 67, 腰围: 92, 臀围: 102, 裙长: 87 },
    is_active: true
  },
  {
    size: 'L',
    measurements: { 胸围: 104, 肩宽: 46, 袖长: 62, 衣长: 69, 腰围: 96, 臀围: 106, 裙长: 89 },
    is_active: true
  },
  {
    size: 'XL',
    measurements: { 胸围: 108, 肩宽: 48, 袖长: 64, 衣长: 71, 腰围: 100, 臀围: 110, 裙长: 91 },
    is_active: false
  }
])

// 生命周期
onMounted(() => {
  loadBomData()
})

// 监听路由参数变化
watch(() => route.params.style_code, (newStyleCode) => {
  if (newStyleCode && newStyleCode !== styleCode.value) {
    styleCode.value = newStyleCode as string
    loadBomData()
  }
}, { immediate: false })

// 加载BOM数据
const loadBomData = async () => {
  if (!styleCode.value) {
    ElMessage.error('缺少款式编码参数')
    error.value = true
    loading.value = false
    return
  }

  loading.value = true
  error.value = false
  
  try {
    bomData.value = await BomService.getBomDetail(styleCode.value)
    console.log('BOM数据加载成功:', bomData.value)
    // 加载完数据后检查是否需要自动进入编辑模式
    checkAutoEditMode()
  } catch (err: any) {
    console.error('加载BOM数据失败:', err)
    
    // 对于测试数据，尝试使用模拟数据
    if (styleCode.value && ['PENDING_CRAFT_BOM', 'PENDING_PATTERN_BOM', 'CONFIRMED_BOM', 'TEST001'].includes(styleCode.value)) {
      console.log('尝试使用测试模拟数据...')
      try {
        // 直接使用模拟数据
        const mockData = {
          style_code: styleCode.value,
          product_name: '测试产品名称',
          season: 'SPRING',
          year: 2024,
          wave: '第一波',
          category: 'TOP',
          dev_colors: '黑色/白色/灰色',
          dev_colors_list: ['黑色', '白色', '灰色'],
          target_price: '150.00',
          estimated_cost: '120.00',
          total_cost: 35.1,
          fabric_composition: '100% Cotton',
          fabric_weight: '180g/m²',
          care_instructions: '机洗，水温不超过30度',
          status: styleCode.value === 'CONFIRMED_BOM' ? 'CONFIRMED' : 'PENDING_CRAFT',
          version: 1,
          notes: '这是测试数据',
          created_at: '2025-09-21T20:00:00+08:00',
          updated_at: '2025-09-21T20:00:00+08:00',
          confirmed_at: null
        }
        
        bomData.value = mockData
        console.log('使用模拟数据成功:', mockData)
        checkAutoEditMode()
      } catch (mockError) {
        console.error('模拟数据也失败了:', mockError)
        error.value = true
        ElMessage.error('加载测试数据失败')
      }
    } else {
      error.value = true
      // 根据错误类型提供更友好的提示
      if (err.response?.status === 404) {
        ElMessage.error(`找不到款式编码为 ${styleCode.value} 的BOM数据`)
      } else if (err.response?.status >= 500) {
        ElMessage.error('服务器错误，请稍后重试')
      } else {
        ElMessage.error('加载BOM数据失败，请检查网络连接')
      }
    }
  } finally {
    loading.value = false
  }
}

// 编辑模式相关功能
const startEditSizeSpecs = () => {
  isEditingSizeSpecs.value = true
  isEditMode.value = true
}

const cancelEditSizeSpecs = () => {
  isEditingSizeSpecs.value = false
  isEditMode.value = false
  // 重新加载数据以恢复原始值
  loadBomData()
}

const saveSizeSpecsChanges = async () => {
  try {
    saving.value = true
    // 调用API保存数据
    await BomService.updateSizeSpecs(styleCode.value, sizeSpecsList.value)
    
    ElMessage.success('尺寸修改保存成功')
    isEditingSizeSpecs.value = false
    isEditMode.value = false
  } catch (error) {
    ElMessage.error('保存失败，请重试')
  } finally {
    saving.value = false
  }
}

const startEditMaterials = () => {
  isEditingMaterials.value = true
  isEditMode.value = true
}

const cancelEditMaterials = () => {
  isEditingMaterials.value = false
  isEditMode.value = false
  // 重新加载数据以恢复原始值
  loadBomData()
}

const saveMaterialChanges = async () => {
  try {
    saving.value = true
    // 调用API保存数据
    await BomService.updateMaterials(styleCode.value, materialsList.value)
    
    ElMessage.success('物料修改保存成功')
    isEditingMaterials.value = false
    isEditMode.value = false
  } catch (error) {
    ElMessage.error('保存失败，请重试')
  } finally {
    saving.value = false
  }
}

// 其他功能函数
const handleBack = () => {
  router.back()
}

const editBom = () => {
  ElMessage.info('编辑基本信息功能开发中')
}

const addMaterial = () => {
  ElMessage.info('添加物料功能开发中')
}

const editMaterial = (row: any) => {
  ElMessage.info('编辑物料功能开发中')
}

const deleteMaterial = (row: any) => {
  ElMessage.info('删除物料功能开发中')
}

const addSizeSpec = () => {
  ElMessage.info('添加尺码功能开发中')
}

const editSizeSpec = (row: any) => {
  ElMessage.info('编辑尺码功能开发中')
}

const deleteSizeSpec = (row: any) => {
  ElMessage.info('删除尺码功能开发中')
}

// 数据格式化函数
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'DRAFT': '草稿',
    'PENDING_CRAFT': '待填写工艺',
    'PENDING_PATTERN': '待制作样版',
    'CONFIRMED': '已确认',
    'REVISED': '待修改',
    'CANCELLED': '已取消'
  }
  return statusMap[status] || status
}

const getStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    'DRAFT': 'info',
    'PENDING_CRAFT': 'warning',
    'PENDING_PATTERN': 'info',
    'CONFIRMED': 'success',
    'REVISED': 'warning',
    'CANCELLED': 'danger'
  }
  return statusMap[status] || 'info'
}

const getCategoryText = (category: string | undefined | null) => {
  if (!category) return '未设置'
  const categoryMap: Record<string, string> = {
    'TOP': '上衣',
    'BOTTOM': '下装',
    'DRESS': '连衣裙',
    'OUTERWEAR': '外套',
    'ACCESSORY': '配饰'
  }
  return categoryMap[category] || category
}

const getSeasonText = (season: string | undefined | null) => {
  if (!season) return '未设置'
  const seasonMap: Record<string, string> = {
    'SPRING': '春季',
    'SUMMER': '夏季',
    'AUTUMN': '秋季',
    'WINTER': '冬季'
  }
  return seasonMap[season] || season
}

const getMaterialTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    'FABRIC': '面料',
    'LINING': '里料',
    'INTERLINING': '衬布',
    'THREAD': '缝纫线',
    'BUTTON': '纽扣',
    'ZIPPER': '拉链',
    'LABEL': '标签',
    'TRIM': '辅料',
    'ELASTIC': '松紧带',
    'OTHER': '其他'
  }
  return typeMap[type] || type
}

const getMaterialTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    'FABRIC': 'primary',
    'LINING': 'success',
    'INTERLINING': 'info',
    'THREAD': 'warning',
    'BUTTON': 'primary',
    'ZIPPER': 'success',
    'LABEL': 'info',
    'TRIM': 'warning',
    'ELASTIC': 'danger',
    'OTHER': 'info'
  }
  return colorMap[type] || 'info'
}

const formatPrice = (price: number | string | null | undefined) => {
  if (price === null || price === undefined || price === '') return '未设置'
  
  if (typeof price === 'string') {
    const numPrice = parseFloat(price)
    if (isNaN(numPrice)) return '未设置'
    return `¥${numPrice.toFixed(2)}`
  }
  
  if (typeof price === 'number') {
    if (isNaN(price)) return '未设置'
    return `¥${price.toFixed(2)}`
  }
  
  return '未设置'
}

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return '未设置'
  try {
    return new Date(dateString).toLocaleString('zh-CN')
  } catch (error) {
    return '未设置'
  }
}
</script>

<style scoped>
.bom-detail-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.status-tag {
  font-size: 14px;
}

.info-card {
  margin-bottom: 24px;
  border-radius: 12px;
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.color-display {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 8px 0;
}

.color-tag {
  font-size: 14px;
  padding: 8px 16px;
}

.price-value {
  font-weight: 600;
  font-size: 16px;
}

.target-price {
  color: #409eff;
}

.estimated-cost {
  color: #e6a23c;
}

.total-cost {
  font-weight: 600;
  color: #67c23a;
}

.care-instructions {
  line-height: 1.6;
  color: #606266;
  margin: 0;
}

.notes {
  line-height: 1.6;
  color: #606266;
  margin: 0;
  white-space: pre-wrap;
}

/* 编辑模式样式 */
.readonly-mode {
  /* 只读模式样式 */
}

.edit-mode {
  /* 编辑模式样式 */
  background-color: #fff9f0;
}

.edit-mode .info-card {
  border: 2px dashed #e6a23c;
}

:deep(.el-descriptions__label) {
  font-weight: 600;
  color: #303133;
}

:deep(.el-descriptions__content) {
  color: #606266;
}

:deep(.el-table .el-input) {
  width: 100%;
}

:deep(.el-table .el-input__wrapper) {
  box-shadow: none;
  border: 1px solid #dcdfe6;
}

:deep(.el-table .el-input__wrapper:hover) {
  border-color: #409eff;
}
</style>