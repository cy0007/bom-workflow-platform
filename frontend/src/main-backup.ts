import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './style.css'
import App from './App.vue'
import router from './router'
import { initAuth } from './services/authService'

// 初始化认证系统
initAuth()

const app = createApp(App)
app.use(ElementPlus)
app.use(router)
app.mount('#app')
