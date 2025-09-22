// tests/bom-edit.spec.js - BOM编辑功能测试
import { test, expect } from '@playwright/test';

/**
 * 模拟登录辅助函数
 * @param {Page} page - Playwright页面对象
 * @param {string} role - 用户角色 ('pattern_maker', 'craft_designer', 'bom_manager')
 */
async function loginAs(page, role) {
  // 模拟设置用户身份的cookie或localStorage
  await page.addInitScript((userRole) => {
    window.localStorage.setItem('user_role', userRole);
    window.localStorage.setItem('user_token', `mock_token_${userRole}`);
    window.localStorage.setItem('user_name', `测试${userRole}`);
  }, role);
}

test.describe('BOM编辑功能测试', () => {
  test('Pattern maker can edit size specs', async ({ page }) => {
    // 1. 模拟登录为"版房师傅"
    await loginAs(page, 'pattern_maker');

    // 2. 访问一个"待填写工艺"状态的BOM详情页
    await page.goto('/boms/PENDING_CRAFT_BOM');

    // 等待页面加载完成
    await page.waitForLoadState('networkidle');

    // 3. 定位到"规格尺寸表"的某个单元格，例如"裙长"的S码
    // 假设表格结构：第一列是尺寸名称，后续列是各个码数
    const sizeSCell = page.locator('#size-specs-table >> text=裙长 >> .. >> td').nth(1);
    
    // 4. 断言该单元格是可编辑的 (例如，它内部是一个 input 元素)
    await expect(sizeSCell.locator('input')).toBeEditable();

    // 5. 模拟输入新值并保存
    await sizeSCell.locator('input').fill('90');
    await page.locator('button:has-text("保存尺寸修改")').click();

    // 6. 断言保存成功的提示出现
    await expect(page.locator('.el-message--success')).toBeVisible();

    // 7. (可选) 刷新页面，断言新值 '90' 被成功持久化
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(sizeSCell.locator('input')).toHaveValue('90');
  });

  test('Craft designer can edit material list', async ({ page }) => {
    // 测试"工艺师傅"可以编辑"物料明细表"
    await loginAs(page, 'craft_designer');
    
    await page.goto('/boms/PENDING_PATTERN_BOM');
    await page.waitForLoadState('networkidle');

    // 定位到物料明细表的某个单元格
    const materialCell = page.locator('#material-list-table >> text=纯棉针织面料 >> .. >> td >> input[placeholder="用量"]');
    
    // 断言该单元格可编辑
    await expect(materialCell).toBeEditable();
    
    // 输入新值
    await materialCell.fill('1.5');
    await page.locator('button:has-text("保存物料修改")').click();
    
    // 验证保存成功
    await expect(page.locator('.el-message--success')).toBeVisible();
  });

  test('Read-only access for non-authorized roles', async ({ page }) => {
    // 测试无权限用户只能查看，不能编辑
    await loginAs(page, 'viewer');
    
    await page.goto('/boms/PENDING_CRAFT_BOM');
    await page.waitForLoadState('networkidle');

    // 断言编辑按钮不存在或被禁用
    const editButtons = page.locator('button:has-text("编辑")');
    const editButtonsCount = await editButtons.count();
    
    if (editButtonsCount > 0) {
      // 如果编辑按钮存在，它们应该被禁用
      for (let i = 0; i < editButtonsCount; i++) {
        await expect(editButtons.nth(i)).toBeDisabled();
      }
    }
    
    // 断言没有可编辑的输入框
    const editableInputs = page.locator('input:not([readonly]):not([disabled])');
    const inputCount = await editableInputs.count();
    expect(inputCount).toBe(0);
  });

  test('BOM status controls edit permissions', async ({ page }) => {
    // 测试BOM状态控制编辑权限
    await loginAs(page, 'pattern_maker');
    
    // 访问已确认状态的BOM（应该不可编辑）
    await page.goto('/boms/CONFIRMED_BOM');
    await page.waitForLoadState('networkidle');
    
    // 断言编辑功能被禁用
    const editButtons = page.locator('button:has-text("编辑")');
    const buttonCount = await editButtons.count();
    
    for (let i = 0; i < buttonCount; i++) {
      await expect(editButtons.nth(i)).toBeDisabled();
    }
    
    // 或者断言显示只读提示
    await expect(page.locator('text=BOM已确认，无法编辑')).toBeVisible();
  });

  test('Edit mode toggle functionality', async ({ page }) => {
    // 测试编辑模式切换功能
    await loginAs(page, 'pattern_maker');
    
    // 使用toggle参数确保初始状态是只读模式
    await page.goto('/boms/PENDING_CRAFT_BOM?test=toggle');
    await page.waitForLoadState('networkidle');
    
    // 初始状态应该是只读模式
    await expect(page.locator('.readonly-mode')).toBeVisible();
    
    // 点击编辑按钮进入编辑模式
    await page.locator('button:has-text("编辑规格尺寸")').click();
    
    // 断言进入编辑模式
    await expect(page.locator('.edit-mode')).toBeVisible();
    
    // 断言输入框变为可编辑
    const firstEditableCell = page.locator('#size-specs-table input').first();
    await expect(firstEditableCell).toBeEditable();
    
    // 点击取消按钮退出编辑模式
    await page.locator('button:has-text("取消")').click();
    
    // 断言返回只读模式
    await expect(page.locator('.readonly-mode')).toBeVisible();
  });
});
