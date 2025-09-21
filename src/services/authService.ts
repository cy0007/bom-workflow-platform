// src/services/authService.ts - 用户认证和权限管理服务
import { ref } from 'vue'

// 用户角色类型定义
export type UserRole = 'pattern_maker' | 'craft_designer' | 'bom_manager' | 'viewer' | 'admin'

// BOM状态类型定义  
export type BomStatus = 'DRAFT' | 'PENDING_CRAFT' | 'PENDING_PATTERN' | 'CONFIRMED' | 'REVISED' | 'CANCELLED'

// 用户信息接口
export interface UserInfo {
  id: string
  name: string
  role: UserRole
  token: string
}

// 权限配置
export interface PermissionConfig {
  canEditSizeSpecs: boolean    // 可编辑规格尺寸
  canEditMaterials: boolean    // 可编辑物料明细
  canEditBasicInfo: boolean    // 可编辑基本信息
  canSubmit: boolean           // 可提交BOM
  canApprove: boolean          // 可审批BOM
}

// 当前用户状态
export const currentUser = ref<UserInfo | null>(null)

// 权限矩阵 - 定义不同角色在不同BOM状态下的权限
const PERMISSION_MATRIX: Record<UserRole, Record<BomStatus, PermissionConfig>> = {
  pattern_maker: {
    DRAFT: { canEditSizeSpecs: true, canEditMaterials: false, canEditBasicInfo: false, canSubmit: false, canApprove: false },
    PENDING_CRAFT: { canEditSizeSpecs: true, canEditMaterials: false, canEditBasicInfo: false, canSubmit: true, canApprove: false },
    PENDING_PATTERN: { canEditSizeSpecs: false, canEditMaterials: false, canEditBasicInfo: false, canSubmit: false, canApprove: false },
    CONFIRMED: { canEditSizeSpecs: false, canEditMaterials: false, canEditBasicInfo: false, canSubmit: false, canApprove: false },
    REVISED: { canEditSizeSpecs: true, canEditMaterials: false, canEditBasicInfo: false, canSubmit: true, canApprove: false },
    CANCELLED: { canEditSizeSpecs: false, canEditMaterials: false, canEditBasicInfo: false, canSubmit: false, canApprove: false }
  },
  craft_designer: {
    DRAFT: { canEditSizeSpecs: false, canEditMaterials: true, canEditBasicInfo: false, canSubmit: false, canApprove: false },
    PENDING_CRAFT: { canEditSizeSpecs: false, canEditMaterials: false, canEditBasicInfo: false, canSubmit: false, canApprove: false },
    PENDING_PATTERN: { canEditSizeSpecs: false, canEditMaterials: true, canEditBasicInfo: false, canSubmit: true, canApprove: false },
    CONFIRMED: { canEditSizeSpecs: false, canEditMaterials: false, canEditBasicInfo: false, canSubmit: false, canApprove: false },
    REVISED: { canEditSizeSpecs: false, canEditMaterials: true, canEditBasicInfo: false, canSubmit: true, canApprove: false },
    CANCELLED: { canEditSizeSpecs: false, canEditMaterials: false, canEditBasicInfo: false, canSubmit: false, canApprove: false }
  },
  viewer: {
    DRAFT: { canEditSizeSpecs: false, canEditMaterials: false, canEditBasicInfo: false, canSubmit: false, canApprove: false },
    PENDING_CRAFT: { canEditSizeSpecs: false, canEditMaterials: false, canEditBasicInfo: false, canSubmit: false, canApprove: false },
    PENDING_PATTERN: { canEditSizeSpecs: false, canEditMaterials: false, canEditBasicInfo: false, canSubmit: false, canApprove: false },
    CONFIRMED: { canEditSizeSpecs: false, canEditMaterials: false, canEditBasicInfo: false, canSubmit: false, canApprove: false },
    REVISED: { canEditSizeSpecs: false, canEditMaterials: false, canEditBasicInfo: false, canSubmit: false, canApprove: false },
    CANCELLED: { canEditSizeSpecs: false, canEditMaterials: false, canEditBasicInfo: false, canSubmit: false, canApprove: false }
  },
  bom_manager: {
    DRAFT: { canEditSizeSpecs: true, canEditMaterials: true, canEditBasicInfo: true, canSubmit: true, canApprove: true },
    PENDING_CRAFT: { canEditSizeSpecs: true, canEditMaterials: true, canEditBasicInfo: true, canSubmit: true, canApprove: true },
    PENDING_PATTERN: { canEditSizeSpecs: true, canEditMaterials: true, canEditBasicInfo: true, canSubmit: true, canApprove: true },
    CONFIRMED: { canEditSizeSpecs: false, canEditMaterials: false, canEditBasicInfo: true, canSubmit: false, canApprove: false },
    REVISED: { canEditSizeSpecs: true, canEditMaterials: true, canEditBasicInfo: true, canSubmit: true, canApprove: true },
    CANCELLED: { canEditSizeSpecs: false, canEditMaterials: false, canEditBasicInfo: true, canSubmit: false, canApprove: false }
  },
  admin: {
    DRAFT: { canEditSizeSpecs: true, canEditMaterials: true, canEditBasicInfo: true, canSubmit: true, canApprove: true },
    PENDING_CRAFT: { canEditSizeSpecs: true, canEditMaterials: true, canEditBasicInfo: true, canSubmit: true, canApprove: true },
    PENDING_PATTERN: { canEditSizeSpecs: true, canEditMaterials: true, canEditBasicInfo: true, canSubmit: true, canApprove: true },
    CONFIRMED: { canEditSizeSpecs: true, canEditMaterials: true, canEditBasicInfo: true, canSubmit: true, canApprove: true },
    REVISED: { canEditSizeSpecs: true, canEditMaterials: true, canEditBasicInfo: true, canSubmit: true, canApprove: true },
    CANCELLED: { canEditSizeSpecs: true, canEditMaterials: true, canEditBasicInfo: true, canSubmit: true, canApprove: true }
  }
}

/**
 * 初始化用户认证 - 从localStorage加载用户信息
 */
export function initAuth() {
  const userRole = localStorage.getItem('user_role') as UserRole
  const userToken = localStorage.getItem('user_token')
  const userName = localStorage.getItem('user_name')

  if (userRole && userToken && userName) {
    currentUser.value = {
      id: userRole,
      name: userName,
      role: userRole,
      token: userToken
    }
  }
}

/**
 * 模拟登录 - 设置用户角色（主要用于测试）
 */
export function mockLogin(role: UserRole, name?: string) {
  const user: UserInfo = {
    id: role,
    name: name || `测试${role}`,
    role,
    token: `mock_token_${role}`
  }

  currentUser.value = user

  // 保存到localStorage
  localStorage.setItem('user_role', role)
  localStorage.setItem('user_token', user.token)
  localStorage.setItem('user_name', user.name)

  return user
}

/**
 * 获取当前用户权限
 */
export function getCurrentUserPermissions(bomStatus: BomStatus): PermissionConfig {
  if (!currentUser.value) {
    return {
      canEditSizeSpecs: false,
      canEditMaterials: false,
      canEditBasicInfo: false,
      canSubmit: false,
      canApprove: false
    }
  }

  const userRole = currentUser.value.role
  return PERMISSION_MATRIX[userRole][bomStatus]
}

/**
 * 获取用户友好的权限提示信息
 */
export function getPermissionMessage(bomStatus: BomStatus): string {
  if (!currentUser.value) {
    return '请先登录'
  }

  const permissions = getCurrentUserPermissions(bomStatus)
  const hasAnyEditPermission = permissions.canEditSizeSpecs || 
                              permissions.canEditMaterials || 
                              permissions.canEditBasicInfo

  if (!hasAnyEditPermission) {
    if (bomStatus === 'CONFIRMED') {
      return 'BOM已确认，无法编辑'
    } else if (bomStatus === 'CANCELLED') {
      return 'BOM已取消，无法编辑'  
    } else {
      return '当前用户角色无编辑权限'
    }
  }

  return ''
}