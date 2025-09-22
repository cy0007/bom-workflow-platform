import apiClient from './api'

// BOM数据类型定义
export interface BomData {
  style_code: string
  product_name: string
  season: string
  year: number
  wave: string
  category: string
  dev_colors: string
  dev_colors_list: string[]
  target_price: string | null
  estimated_cost: string | null
  total_cost: number
  fabric_composition: string
  fabric_weight: string
  care_instructions: string
  status: string
  version: number
  notes: string
  created_at: string
  updated_at: string
  confirmed_at: string | null
}

// 测试数据模拟
const MOCK_BOM_DATA: Record<string, BomData> = {
  'PENDING_CRAFT_BOM': {
    style_code: 'PENDING_CRAFT_BOM',
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
    status: 'PENDING_CRAFT',
    version: 1,
    notes: '这是一个待填写工艺状态的BOM，用于测试版房师傅的编辑权限',
    created_at: '2025-09-21T20:00:00+08:00',
    updated_at: '2025-09-21T20:00:00+08:00',
    confirmed_at: null
  },
  'PENDING_PATTERN_BOM': {
    style_code: 'PENDING_PATTERN_BOM',
    product_name: '测试工艺产品',
    season: 'SUMMER',
    year: 2024,
    wave: '第二波',
    category: 'DRESS',
    dev_colors: '粉色/蓝色',
    dev_colors_list: ['粉色', '蓝色'],
    target_price: '200.00',
    estimated_cost: '150.00',
    total_cost: 45.8,
    fabric_composition: '95% 棉 5% 弹性纤维',
    fabric_weight: '220g/m²',
    care_instructions: '手洗，阴干',
    status: 'PENDING_PATTERN',
    version: 1,
    notes: '这是一个待制作样版状态的BOM，用于测试工艺师傅的编辑权限',
    created_at: '2025-09-21T20:00:00+08:00',
    updated_at: '2025-09-21T20:00:00+08:00',
    confirmed_at: null
  },
  'CONFIRMED_BOM': {
    style_code: 'CONFIRMED_BOM',
    product_name: '已确认产品',
    season: 'AUTUMN',
    year: 2024,
    wave: '第三波',
    category: 'OUTERWEAR',
    dev_colors: '黑色',
    dev_colors_list: ['黑色'],
    target_price: '300.00',
    estimated_cost: '200.00',
    total_cost: 89.5,
    fabric_composition: '100% 羊毛',
    fabric_weight: '350g/m²',
    care_instructions: '干洗',
    status: 'CONFIRMED',
    version: 2,
    notes: '这是一个已确认状态的BOM，应该无法编辑',
    created_at: '2025-09-20T20:00:00+08:00',
    updated_at: '2025-09-21T20:00:00+08:00',
    confirmed_at: '2025-09-21T20:00:00+08:00'
  },
  'TEST001': {
    style_code: 'TEST001',
    product_name: '春季时尚T恤',
    season: 'SPRING',
    year: 2025,
    wave: '第一波',
    category: 'TOP',
    dev_colors: '黑色/白色/灰色',
    dev_colors_list: ['黑色', '白色', '灰色'],
    target_price: '89.90',
    estimated_cost: '45.50',
    total_cost: 0,
    fabric_composition: '100%纯棉',
    fabric_weight: '180g/m²',
    care_instructions: '机洗，水温不超过30度，勿漂白，阴干',
    status: 'CONFIRMED',
    version: 1,
    notes: '这是一个测试产品，用于前端展示',
    created_at: '2025-09-20T14:05:40.967060+08:00',
    updated_at: '2025-09-20T14:05:40.967074+08:00',
    confirmed_at: null
  }
}

// BOM API服务类
export class BomService {
  // 获取BOM列表
  static async getBomList(params?: {
    search?: string
    status?: string
    category?: string
    ordering?: string
  }) {
    try {
      const response = await apiClient.get('/boms/', { params })
      return response.data
    } catch (error) {
      console.log('API调用失败，返回模拟数据')
      return {
        results: Object.values(MOCK_BOM_DATA),
        count: Object.keys(MOCK_BOM_DATA).length
      }
    }
  }

  // 获取单个BOM详情
  static async getBomDetail(styleCode: string): Promise<BomData> {
    try {
      const response = await apiClient.get(`/boms/${styleCode}/`)
      return response.data
    } catch (error) {
      console.log(`API调用失败，返回 ${styleCode} 的模拟数据`)
      
      // 如果有模拟数据，返回模拟数据
      if (MOCK_BOM_DATA[styleCode]) {
        return MOCK_BOM_DATA[styleCode]
      }
      
      // 否则抛出错误
      throw new Error(`找不到款式编码为 ${styleCode} 的BOM数据`)
    }
  }

  // 更新BOM（部分更新）
  static async updateBom(styleCode: string, data: Partial<BomData>): Promise<BomData> {
    try {
      const response = await apiClient.patch(`/boms/${styleCode}/`, data)
      return response.data
    } catch (error) {
      console.log(`API调用失败，模拟更新 ${styleCode}`)
      
      // 如果有模拟数据，更新并返回
      if (MOCK_BOM_DATA[styleCode]) {
        MOCK_BOM_DATA[styleCode] = { ...MOCK_BOM_DATA[styleCode], ...data }
        return MOCK_BOM_DATA[styleCode]
      }
      
      throw new Error(`找不到款式编码为 ${styleCode} 的BOM数据`)
    }
  }

  // 完整更新BOM
  static async replaceBom(styleCode: string, data: BomData): Promise<BomData> {
    try {
      const response = await apiClient.put(`/boms/${styleCode}/`, data)
      return response.data
    } catch (error) {
      console.log(`API调用失败，模拟替换 ${styleCode}`)
      
      MOCK_BOM_DATA[styleCode] = data
      return MOCK_BOM_DATA[styleCode]
    }
  }

  // 更新尺寸规格（新方法用于编辑功能）
  static async updateSizeSpecs(styleCode: string, sizeSpecs: any[]): Promise<void> {
    try {
      await apiClient.patch(`/boms/${styleCode}/size-specs/`, { size_specs: sizeSpecs })
    } catch (error) {
      console.log(`模拟更新 ${styleCode} 的尺寸规格`)
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  // 更新物料明细（新方法用于编辑功能）
  static async updateMaterials(styleCode: string, materials: any[]): Promise<void> {
    try {
      await apiClient.patch(`/boms/${styleCode}/materials/`, { materials })
    } catch (error) {
      console.log(`模拟更新 ${styleCode} 的物料明细`)
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }
}

export default BomService