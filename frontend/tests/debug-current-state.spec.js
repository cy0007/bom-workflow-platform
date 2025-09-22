// 当前状态调试测试
import { test, expect } from '@playwright/test';

async function loginAs(page, role) {
  await page.addInitScript((userRole) => {
    window.localStorage.setItem('user_role', userRole);
    window.localStorage.setItem('user_token', `mock_token_${userRole}`);
    window.localStorage.setItem('user_name', `测试${userRole}`);
  }, role);
}

test('Debug current page state', async ({ page }) => {
  await loginAs(page, 'pattern_maker');
  
  console.log('=== 当前状态调试 ===');
  
  // 监听控制台
  page.on('console', msg => {
    console.log(`浏览器 [${msg.type()}]:`, msg.text());
  });
  
  // 访问页面
  await page.goto('/boms/PENDING_CRAFT_BOM');
  await page.waitForTimeout(3000);
  
  // 检查页面内容
  const pageContent = await page.locator('body').textContent();
  console.log('页面内容 (前200字符):', pageContent.substring(0, 200));
  
  // 检查CSS类
  const hasReadonlyMode = await page.locator('.readonly-mode').count() > 0;
  const hasEditMode = await page.locator('.edit-mode').count() > 0;
  const hasBomDetailContent = await page.locator('.bom-detail-content').count() > 0;
  
  console.log('CSS类检查:');
  console.log('  - .readonly-mode:', hasReadonlyMode);
  console.log('  - .edit-mode:', hasEditMode);  
  console.log('  - .bom-detail-content:', hasBomDetailContent);
  
  // 检查表格
  const hasSizeSpecsTable = await page.locator('#size-specs-table').count() > 0;
  const hasMaterialTable = await page.locator('#material-list-table').count() > 0;
  
  console.log('表格检查:');
  console.log('  - #size-specs-table:', hasSizeSpecsTable);
  console.log('  - #material-list-table:', hasMaterialTable);
  
  // 检查输入框
  if (hasSizeSpecsTable) {
    const inputs = await page.locator('#size-specs-table input').count();
    console.log('  - 尺寸表格输入框数量:', inputs);
  }
  
  // 检查按钮
  const buttons = await page.locator('button').count();
  console.log('页面按钮数量:', buttons);
  
  for (let i = 0; i < Math.min(buttons, 5); i++) {
    const buttonText = await page.locator('button').nth(i).textContent();
    console.log(`  - 按钮${i + 1}: "${buttonText.trim()}"`);
  }
  
  console.log('=== 调试结束 ===');
});
