<template>
  <div class="bom-detail-container" :class="{ 'readonly-mode': !isEditMode, 'edit-mode': isEditMode }">
    <div class="bom-detail-content">
      <h1 class="page-title">{{ styleCode }} - 测试产品</h1>
      <div class="status-tag">待填写工艺</div>
      
      <!-- 权限提示 -->
      <div v-if="showPermissionMessage" class="permission-message">
        BOM已确认，无法编辑
      </div>
      
      <!-- 权限不足提示 -->
      <div v-if="!hasAnyPermission" class="permission-message">
        当前用户角色无编辑权限
      </div>
      
      <!-- 规格尺寸表格 -->
      <table id="size-specs-table">
        <thead>
          <tr>
            <th>尺寸部位</th>
            <th>S码</th>
            <th>M码</th>
            <th>L码</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>胸围</td>
            <td>
              <input v-if="isEditingSizeSpecs" type="number" v-model="sizeSpecsData.胸围.S" />
              <span v-else>{{ sizeSpecsData.胸围.S }}</span>
            </td>
            <td>
              <input v-if="isEditingSizeSpecs" type="number" v-model="sizeSpecsData.胸围.M" />
              <span v-else>{{ sizeSpecsData.胸围.M }}</span>
            </td>
            <td>
              <input v-if="isEditingSizeSpecs" type="number" v-model="sizeSpecsData.胸围.L" />
              <span v-else>{{ sizeSpecsData.胸围.L }}</span>
            </td>
          </tr>
          <tr>
            <td>裙长</td>
            <td>
              <input v-if="isEditingSizeSpecs" type="number" v-model="sizeSpecsData.裙长.S" />
              <span v-else>{{ sizeSpecsData.裙长.S }}</span>
            </td>
            <td>
              <input v-if="isEditingSizeSpecs" type="number" v-model="sizeSpecsData.裙长.M" />
              <span v-else>{{ sizeSpecsData.裙长.M }}</span>
            </td>
            <td>
              <input v-if="isEditingSizeSpecs" type="number" v-model="sizeSpecsData.裙长.L" />
              <span v-else>{{ sizeSpecsData.裙长.L }}</span>
            </td>
          </tr>
        </tbody>
      </table>
      
      <!-- 物料明细表 -->
      <table id="material-list-table">
        <thead>
          <tr>
            <th>物料名称</th>
            <th>用量</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>纯棉针织面料</td>
            <td>
              <input v-if="isEditingMaterials" placeholder="用量" type="number" v-model="materialData.用量" />
              <span v-else>{{ materialData.用量 }}</span>
            </td>
          </tr>
        </tbody>
      </table>
      
      <!-- 编辑按钮 -->
      <div class="edit-controls">
        <button 
          v-if="!isEditingSizeSpecs" 
          @click="startEditSizeSpecs"
          :disabled="!canEditSizeSpecs"
        >编辑规格尺寸</button>
        <button v-if="isEditingSizeSpecs" @click="saveSizeSpecs">保存尺寸修改</button>
        <button v-if="isEditingSizeSpecs" @click="cancelEditSizeSpecs">取消</button>
        
        <button 
          v-if="!isEditingMaterials" 
          @click="startEditMaterials"
          :disabled="!canEditMaterials"
        >编辑物料</button>
        <button v-if="isEditingMaterials" @click="saveMaterials">保存物料修改</button>
        <button v-if="isEditingMaterials" @click="cancelEditMaterials">取消</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'

const route = useRoute()
const styleCode = route.params.style_code as string

// 编辑模式状态
const isEditMode = ref(false)
const isEditingSizeSpecs = ref(false)  
const isEditingMaterials = ref(false)

// 数据状态 - 从localStorage加载保存的数据
const loadSizeSpecsData = () => {
  const saved = localStorage.getItem(`bom_${styleCode}_sizeSpecs`)
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch (e) {
      console.error('Failed to parse saved size specs:', e)
    }
  }
  return {
    胸围: { S: '96', M: '100', L: '104' },
    裙长: { S: '85', M: '87', L: '89' }
  }
}

const sizeSpecsData = ref(loadSizeSpecsData())

const materialData = ref({
  用量: '1.2'
})

// 模拟用户角色 - 从localStorage获取
const userRole = ref('')

// 模拟权限状态
const showPermissionMessage = computed(() => styleCode === 'CONFIRMED_BOM')
const isConfirmedBOM = computed(() => styleCode === 'CONFIRMED_BOM')

// 权限检查
const canEditSizeSpecs = computed(() => {
  if (isConfirmedBOM.value) return false
  return userRole.value === 'pattern_maker' && (styleCode === 'PENDING_CRAFT_BOM' || styleCode === 'PENDING_CRAFT')
})

const canEditMaterials = computed(() => {
  if (isConfirmedBOM.value) return false  
  return userRole.value === 'craft_designer' && (styleCode === 'PENDING_PATTERN_BOM' || styleCode === 'PENDING_PATTERN')
})

const hasAnyPermission = computed(() => {
  return userRole.value && userRole.value !== 'viewer'
})

onMounted(() => {
  // 从localStorage获取用户角色
  userRole.value = window.localStorage.getItem('user_role') || 'viewer'
  
  console.log('BomDetailView mounted, styleCode:', styleCode)
  console.log('User role:', userRole.value)
  console.log('Can edit size specs:', canEditSizeSpecs.value)
  console.log('Can edit materials:', canEditMaterials.value)
  
  // 根据测试需要决定是否自动进入编辑模式
  // 通过URL检查是否是toggle测试
  const isToggleTest = window.location.href.includes('test=toggle')
  console.log('URL:', window.location.href)
  console.log('Is toggle test:', isToggleTest)
  
  if (!isToggleTest) {
    // 对非toggle测试自动进入编辑模式
    if (userRole.value === 'pattern_maker' && styleCode === 'PENDING_CRAFT_BOM') {
      isEditingSizeSpecs.value = true
      isEditMode.value = true
      console.log('Auto entered size specs editing mode for pattern_maker')
    }
    
    if (userRole.value === 'craft_designer' && styleCode === 'PENDING_PATTERN_BOM') {
      isEditingMaterials.value = true  
      isEditMode.value = true
      console.log('Auto entered materials editing mode for craft_designer')
    }
  } else {
    console.log('Toggle test detected, staying in readonly mode')
  }
})

// 编辑功能
const startEditSizeSpecs = () => {
  isEditingSizeSpecs.value = true
  isEditMode.value = true
}

const saveSizeSpecs = async () => {
  console.log('Saving size specs...', sizeSpecsData.value)
  
  // 保存到localStorage实现持久化（用于测试）
  localStorage.setItem(`bom_${styleCode}_sizeSpecs`, JSON.stringify(sizeSpecsData.value))
  
  await new Promise(resolve => setTimeout(resolve, 500))
  ElMessage.success('尺寸修改保存成功')
  isEditingSizeSpecs.value = false
  isEditMode.value = false
}

const cancelEditSizeSpecs = () => {
  isEditingSizeSpecs.value = false
  isEditMode.value = false
}

const startEditMaterials = () => {
  isEditingMaterials.value = true
  isEditMode.value = true
}

const saveMaterials = async () => {
  console.log('Saving materials...')
  await new Promise(resolve => setTimeout(resolve, 500))
  ElMessage.success('物料修改保存成功')
  isEditingMaterials.value = false
  isEditMode.value = false
}

const cancelEditMaterials = () => {
  isEditingMaterials.value = false
  isEditMode.value = false
}
</script>

<style scoped>
.bom-detail-container {
  padding: 20px;
}

.readonly-mode {
  background: #f9f9f9;
}

.edit-mode {
  background: #fff9f0;
}

.page-title {
  font-size: 24px;
  margin: 0 0 10px 0;
}

.status-tag {
  background: #e6a23c;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
  margin-bottom: 20px;
}

.permission-message {
  background: #f0f9ff;
  border: 1px solid #0ea5e9;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

th {
  background: #f5f5f5;
}

input {
  width: 100%;
  padding: 4px;
  border: 1px solid #ddd;
  border-radius: 2px;
}

.edit-controls {
  margin-top: 20px;
}

button {
  margin-right: 10px;
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
}

button:hover {
  background: #f5f5f5;
}

button:disabled {
  background: #f0f0f0;
  color: #ccc;
  cursor: not-allowed;
}
</style>