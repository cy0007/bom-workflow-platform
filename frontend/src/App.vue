<template>
  <div id="app">
    <!-- 应用布局 -->
    <el-container class="app-container">
      <!-- 侧边导航 -->
      <el-aside width="250px" class="app-aside">
        <div class="sidebar-header">
          <h2 class="app-logo">BOM平台</h2>
        </div>
        
        <el-menu
          :default-active="activeMenu"
          router
          class="sidebar-menu"
          @select="handleMenuSelect"
        >
          <el-menu-item index="/">
            <el-icon><House /></el-icon>
            <span>首页</span>
          </el-menu-item>
          
          <el-menu-item index="/boms">
            <el-icon><List /></el-icon>
            <span>BOM列表</span>
          </el-menu-item>
          
          <el-sub-menu index="quick">
            <template #title>
              <el-icon><Lightning /></el-icon>
              <span>快速访问</span>
            </template>
            <el-menu-item index="/boms/TEST001">TEST001 - 春季T恤</el-menu-item>
            <el-menu-item index="/boms/TEST002">TEST002 - 夏季短裤</el-menu-item>
            <el-menu-item index="/boms/TEST003">TEST003 - 秋季连衣裙</el-menu-item>
          </el-sub-menu>
        </el-menu>
      </el-aside>

      <!-- 主内容区域 -->
      <el-container>
        <!-- 顶部导航栏 -->
        <el-header class="app-header">
          <div class="header-left">
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
              <el-breadcrumb-item v-if="$route.path !== '/'" :to="{ path: $route.path }">
                {{ currentPageTitle }}
              </el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          
          <div class="header-right">
            <el-space>
              <!-- 刷新按钮 -->
              <el-button circle @click="handleRefresh">
                <el-icon><Refresh /></el-icon>
              </el-button>
              
              <!-- 全屏按钮 -->
              <el-button circle @click="toggleFullscreen">
                <el-icon><FullScreen /></el-icon>
              </el-button>
              
              <!-- 用户头像和菜单 -->
              <el-dropdown @command="handleUserAction">
                <el-button circle type="primary">
                  <el-icon><User /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="profile">个人设置</el-dropdown-item>
                    <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </el-space>
          </div>
        </el-header>

        <!-- 主要内容 -->
        <el-main class="app-main">
          <!-- 路由视图 -->
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </el-main>

        <!-- 底部状态栏 -->
        <el-footer class="app-footer">
          <div class="footer-content">
            <div class="footer-left">
              <span>© 2025 BOM协同工作流平台</span>
              <el-divider direction="vertical" />
              <span>当前版本: v1.0.0</span>
            </div>
            <div class="footer-right">
              <span>连接状态: </span>
              <el-tag :type="connectionStatus === 'connected' ? 'success' : 'danger'" size="small">
                {{ connectionStatus === 'connected' ? '已连接' : '连接断开' }}
              </el-tag>
            </div>
          </div>
        </el-footer>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  House, 
  List, 
  Lightning, 
  Refresh, 
  FullScreen, 
  User 
} from '@element-plus/icons-vue'

// 路由hooks
const route = useRoute()
const router = useRouter()

// 响应式数据
const activeMenu = ref('')
const connectionStatus = ref('connected')

// 计算属性
const currentPageTitle = computed(() => {
  const routeMeta = route.meta
  if (routeMeta?.title) {
    return routeMeta.title as string
  }
  
  // 根据路由路径推断标题
  const path = route.path
  if (path.startsWith('/boms/')) {
    const styleCode = route.params.style_code
    return styleCode ? `BOM详情 - ${styleCode}` : 'BOM详情'
  }
  
  return '未知页面'
})

// 生命周期
onMounted(() => {
  // 初始化连接状态检查
  checkConnectionStatus()
  
  // 定期检查连接状态（减少频率，避免过多请求）
  setInterval(checkConnectionStatus, 300000) // 5分钟检查一次
})

// 监听路由变化
watch(() => route.path, (newPath) => {
  activeMenu.value = newPath
}, { immediate: true })

// 方法
const handleMenuSelect = (index: string) => {
  console.log('选择菜单:', index)
}

const handleRefresh = () => {
  // 刷新当前页面
  location.reload()
}

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}

const handleUserAction = (command: string) => {
  switch (command) {
    case 'profile':
      ElMessage.info('个人设置功能开发中')
      break
    case 'logout':
      ElMessage.info('退出登录功能开发中')
      break
  }
}

const checkConnectionStatus = async () => {
  try {
    // 简单的心跳检查 - 使用OPTIONS方法减少服务器负担
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    
    await fetch('/api/', { 
      method: 'HEAD',
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    connectionStatus.value = 'connected'
  } catch (error) {
    connectionStatus.value = 'disconnected'
  }
}
</script>

<style scoped>
#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.app-container {
  height: 100vh;
}

/* 侧边栏样式 */
.app-aside {
  background: #304156;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
}

.sidebar-header {
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid #434a50;
}

.app-logo {
  color: white;
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.sidebar-menu {
  border: none;
  background: transparent;
}

:deep(.sidebar-menu .el-menu-item) {
  color: #bfcbd9;
}

:deep(.sidebar-menu .el-menu-item:hover) {
  background-color: #434a50;
  color: white;
}

:deep(.sidebar-menu .el-menu-item.is-active) {
  background-color: #409eff;
  color: white;
}

:deep(.sidebar-menu .el-sub-menu__title) {
  color: #bfcbd9;
}

:deep(.sidebar-menu .el-sub-menu__title:hover) {
  background-color: #434a50;
  color: white;
}

/* 头部样式 */
.app-header {
  background: white;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.header-left {
  flex: 1;
}

.header-right {
  display: flex;
  align-items: center;
}

/* 主内容样式 */
.app-main {
  background: #f0f2f5;
  padding: 0;
  overflow-y: auto;
}

/* 底部样式 */
.app-footer {
  background: white;
  border-top: 1px solid #e4e7ed;
  height: 50px;
  padding: 0 24px;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  font-size: 14px;
  color: #606266;
}

.footer-left {
  display: flex;
  align-items: center;
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 路由过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .app-aside {
    width: 200px !important;
  }
  
  .app-header {
    padding: 0 16px;
  }
  
  .footer-content {
    font-size: 12px;
  }
}
</style>