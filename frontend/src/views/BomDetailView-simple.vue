<template>
  <div class="bom-detail-container" :class="{ 'readonly-mode': !isEditMode, 'edit-mode': isEditMode }">
    <div class="bom-detail-content">
      <h1 class="page-title">TEST001 - 测试产品</h1>
      <div class="status-tag">待填写工艺</div>
      
      <!-- 权限提示 -->
      <div v-if="showPermissionMessage" class="permission-message">
        BOM已确认，无法编辑
      </div>
      
      <!-- 规格尺寸表格 -->
      <table id="size-specs-table">
        <thead>
          <tr>
            <th>尺码</th>
            <th>裙长</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>S</td>
            <td>
              <input v-if="isEditingSizeSpecs" type="number" :value="85" />
              <span v-else>85</span>
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
              <input v-if="isEditingMaterials" placeholder="用量" type="number" :value="1.2" />
              <span v-else>1.2</span>
            </td>
          </tr>
        </tbody>
      </table>
      
      <!-- 编辑按钮 -->
      <div class="edit-controls">
        <button v-if="!isEditingSizeSpecs" @click="startEditSizeSpecs">编辑规格尺寸</button>
        <button v-if="isEditingSizeSpecs" @click="saveSizeSpecs">保存尺寸修改</button>
        <button v-if="isEditingSizeSpecs" @click="cancelEditSizeSpecs">取消</button>
        
        <button v-if="!isEditingMaterials" @click="startEditMaterials">编辑物料</button>
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

// 模拟权限状态
const showPermissionMessage = computed(() => styleCode === 'CONFIRMED_BOM')

// 模拟用户角色
const userRole = ref('pattern_maker')

onMounted(() => {
  console.log('BomDetailView mounted, styleCode:', styleCode)
  console.log('User role:', userRole.value)
  
  // 根据用户角色自动进入编辑模式
  if (userRole.value === 'pattern_maker' && styleCode === 'PENDING_CRAFT_BOM') {
    isEditingSizeSpecs.value = true
    isEditMode.value = true
    console.log('Auto entered size specs editing mode')
  }
  
  if (userRole.value === 'craft_designer' && styleCode === 'PENDING_PATTERN_BOM') {
    isEditingMaterials.value = true  
    isEditMode.value = true
    console.log('Auto entered materials editing mode')
  }
})

// 编辑功能
const startEditSizeSpecs = () => {
  isEditingSizeSpecs.value = true
  isEditMode.value = true
}

const saveSizeSpecs = async () => {
  console.log('Saving size specs...')
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
</style>
