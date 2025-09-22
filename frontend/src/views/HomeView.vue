<template>
  <div class="home-container">
    <!-- 欢迎区域 -->
    <div class="welcome-section">
      <div class="welcome-content">
        <h1 class="welcome-title">欢迎使用BOM协同工作流平台</h1>
        <p class="welcome-description">
          企业级BOM（物料清单）管理系统，助力您高效管理产品开发流程
        </p>
        <div class="welcome-actions">
          <el-button type="primary" size="large" @click="goToBomList">
            <el-icon><List /></el-icon>
            查看BOM列表
          </el-button>
          <el-button size="large" @click="createNewBom">
            <el-icon><Plus /></el-icon>
            创建新BOM
          </el-button>
        </div>
      </div>
      <div class="welcome-image">
        <el-image
          src="/api/static/welcome-bg.jpg"
          fit="cover"
          style="width: 400px; height: 300px; border-radius: 8px;"
        >
          <template #error>
            <div class="image-placeholder">
              <el-icon size="64"><Picture /></el-icon>
              <p>BOM工作流</p>
            </div>
          </template>
        </el-image>
      </div>
    </div>

    <!-- 功能卡片区域 -->
    <div class="features-section">
      <h2 class="section-title">核心功能</h2>
      <el-row :gutter="24">
        <el-col :span="8">
          <el-card class="feature-card" @click="goToBomList">
            <div class="feature-content">
              <div class="feature-icon">
                <el-icon size="48"><List /></el-icon>
              </div>
              <h3 class="feature-title">BOM管理</h3>
              <p class="feature-description">
                全面的BOM列表管理，支持搜索、筛选和批量操作，轻松掌控所有产品信息
              </p>
              <div class="feature-stats">
                <el-statistic :value="stats.total_boms" title="总BOM数量" />
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="8">
          <el-card class="feature-card" @click="viewSample">
            <div class="feature-content">
              <div class="feature-icon">
                <el-icon size="48"><Document /></el-icon>
              </div>
              <h3 class="feature-title">详情查看</h3>
              <p class="feature-description">
                完整的BOM详情展示，包含基本信息、价格、颜色、面料等所有关键数据
              </p>
              <div class="feature-stats">
                <el-statistic :value="stats.confirmed_boms" title="已确认BOM" />
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="8">
          <el-card class="feature-card" @click="showComingSoon">
            <div class="feature-content">
              <div class="feature-icon">
                <el-icon size="48"><Edit /></el-icon>
              </div>
              <h3 class="feature-title">协同编辑</h3>
              <p class="feature-description">
                多用户协同编辑，工作流管理，状态跟踪，让团队协作更高效
              </p>
              <div class="feature-stats">
                <el-statistic :value="stats.pending_boms" title="待处理BOM" />
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 快速入门区域 -->
    <div class="quickstart-section">
      <el-card>
        <template #header>
          <div class="card-header">
            <span class="section-title">快速入门</span>
          </div>
        </template>
        
        <el-row :gutter="24">
          <el-col :span="12">
            <div class="quickstart-content">
              <h4>样本数据</h4>
              <p>我们已为您准备了一些样本BOM数据，您可以直接查看：</p>
              <div class="sample-links">
                <el-link 
                  v-for="sample in sampleBoms" 
                  :key="sample.style_code"
                  type="primary" 
                  @click="viewBomDetail(sample.style_code)"
                  class="sample-link"
                >
                  {{ sample.style_code }} - {{ sample.product_name }}
                </el-link>
              </div>
            </div>
          </el-col>
          
          <el-col :span="12">
            <div class="quickstart-content">
              <h4>系统状态</h4>
              <div class="status-items">
                <div class="status-item">
                  <el-icon color="#67c23a"><CircleCheck /></el-icon>
                  <span>后端API服务正常</span>
                </div>
                <div class="status-item">
                  <el-icon color="#67c23a"><CircleCheck /></el-icon>
                  <span>数据库连接正常</span>
                </div>
                <div class="status-item">
                  <el-icon color="#67c23a"><CircleCheck /></el-icon>
                  <span>前端应用运行正常</span>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { BomService } from '../services/bomService'
import { ElMessage } from 'element-plus'
import { List, Plus, Picture, Document, Edit, CircleCheck } from '@element-plus/icons-vue'

// 路由
const router = useRouter()

// 响应式数据
const stats = ref({
  total_boms: 0,
  confirmed_boms: 0,
  pending_boms: 0
})

const sampleBoms = ref([
  { style_code: 'TEST001', product_name: '春季时尚T恤' },
  { style_code: 'TEST002', product_name: '夏季休闲短裤' },
  { style_code: 'TEST003', product_name: '秋季连衣裙' }
])

// 生命周期
onMounted(() => {
  loadStats()
})

// 加载统计数据
const loadStats = async () => {
  try {
    const bomList = await BomService.getBomList()
    stats.value.total_boms = bomList.length
    stats.value.confirmed_boms = bomList.filter(bom => bom.status === 'CONFIRMED').length
    stats.value.pending_boms = bomList.filter(bom => 
      bom.status === 'PENDING_CRAFT' || bom.status === 'PENDING_PATTERN'
    ).length
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

// 导航方法
const goToBomList = () => {
  router.push('/boms')
}

const createNewBom = () => {
  ElMessage.info('创建新BOM功能开发中')
}

const viewSample = () => {
  router.push('/boms/TEST001')
}

const viewBomDetail = (styleCode: string) => {
  router.push(`/boms/${styleCode}`)
}

const showComingSoon = () => {
  ElMessage.info('协同编辑功能即将推出')
}
</script>

<style scoped>
.home-container {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: calc(100vh - 60px);
}

.welcome-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 48px;
  border-radius: 12px;
  margin-bottom: 32px;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.15);
}

.welcome-content {
  flex: 1;
  max-width: 500px;
}

.welcome-title {
  font-size: 36px;
  font-weight: 700;
  margin: 0 0 16px 0;
  line-height: 1.2;
}

.welcome-description {
  font-size: 18px;
  margin: 0 0 32px 0;
  opacity: 0.9;
  line-height: 1.6;
}

.welcome-actions {
  display: flex;
  gap: 16px;
}

.welcome-image {
  margin-left: 48px;
}

.image-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
}

.features-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 24px 0;
}

.feature-card {
  cursor: pointer;
  transition: all 0.3s ease;
  height: 280px;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.feature-content {
  text-align: center;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.feature-icon {
  color: #409eff;
  margin-bottom: 16px;
}

.feature-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 12px 0;
}

.feature-description {
  color: #606266;
  line-height: 1.6;
  margin: 0 0 20px 0;
  flex: 1;
}

.feature-stats {
  margin-top: auto;
}

.quickstart-section {
  margin-bottom: 32px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.quickstart-content h4 {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 12px 0;
}

.quickstart-content p {
  color: #606266;
  line-height: 1.6;
  margin: 0 0 16px 0;
}

.sample-links {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sample-link {
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.status-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #303133;
}
</style>
