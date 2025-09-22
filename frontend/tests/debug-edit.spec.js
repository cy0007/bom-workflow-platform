// 调试BOM编辑功能测试
import { test, expect } from '@playwright/test';

/**
 * 模拟登录辅助函数
 */
async function loginAs(page, role) {
  await page.addInitScript((userRole) => {
    window.localStorage.setItem('user_role', userRole);
    window.localStorage.setItem('user_token', `mock_token_${userRole}`);
    window.localStorage.setItem('user_name', `测试${userRole}`);
  }, role);
}

test('Debug BOM edit functionality', async ({ page }) => {
  // 模拟登录为版房师傅
  await loginAs(page, 'pattern_maker');
  
  console.log('=== 开始调试BOM编辑功能 ===');
  
  // 访问测试页面
  await page.goto('/boms/PENDING_CRAFT_BOM');
  await page.waitForLoadState('networkidle');
  
  // 截图
  await page.screenshot({ path: 'debug-edit-page.png', fullPage: true });
  console.log('截图已保存');
  
  // 检查页面标题
  const title = await page.title();
  console.log('页面标题:', title);
  
  // 检查用户角色是否正确设置
  const userRole = await page.evaluate(() => localStorage.getItem('user_role'));
  console.log('用户角色:', userRole);
  
  // 检查BOM数据是否加载
  const bomTitle = await page.locator('h1.page-title').textContent();
  console.log('BOM标题:', bomTitle);
  
  // 检查BOM状态
  const statusTag = await page.locator('.status-tag').textContent();
  console.log('BOM状态:', statusTag);
  
  // 检查CSS类
  const hasReadonlyMode = await page.locator('.readonly-mode').count() > 0;
  const hasEditMode = await page.locator('.edit-mode').count() > 0;
  console.log('readonly-mode类存在:', hasReadonlyMode);
  console.log('edit-mode类存在:', hasEditMode);
  
  // 检查权限提示
  const alertElements = await page.locator('.el-alert').count();
  console.log('权限提示数量:', alertElements);
  
  for (let i = 0; i < alertElements; i++) {
    const alertText = await page.locator('.el-alert').nth(i).locator('.el-alert__title').textContent();
    console.log(`权限提示${i + 1}:`, alertText);
  }
  
  // 检查编辑按钮
  const editButtons = await page.locator('button').all();
  console.log('所有按钮:');
  for (let i = 0; i < editButtons.length; i++) {
    const buttonText = await editButtons[i].textContent();
    const isDisabled = await editButtons[i].isDisabled();
    console.log(`  按钮${i + 1}: "${buttonText.trim()}" (禁用: ${isDisabled})`);
  }
  
  // 检查size-specs-table
  const sizeSpecsTable = await page.locator('#size-specs-table').count();
  console.log('size-specs-table存在:', sizeSpecsTable > 0);
  
  if (sizeSpecsTable > 0) {
    // 检查裙长列
    const skirtLengthHeader = await page.locator('#size-specs-table th:has-text("裙长")').count();
    console.log('裙长列存在:', skirtLengthHeader > 0);
    
    // 检查输入框
    const inputs = await page.locator('#size-specs-table input').count();
    console.log('输入框数量:', inputs);
    
    // 检查第一行的裙长输入框
    const firstSkirtInput = await page.locator('#size-specs-table tbody tr:first-child td input').count();
    console.log('第一行输入框数量:', firstSkirtInput);
  }
  
  // 检查material-list-table
  const materialTable = await page.locator('#material-list-table').count();
  console.log('material-list-table存在:', materialTable > 0);
  
  if (materialTable > 0) {
    // 检查纯棉针织面料
    const fabricRow = await page.locator('#material-list-table td:has-text("纯棉针织面料")').count();
    console.log('纯棉针织面料行存在:', fabricRow > 0);
    
    // 检查用量输入框
    const usageInputs = await page.locator('#material-list-table input[placeholder="用量"]').count();
    console.log('用量输入框数量:', usageInputs);
  }
  
  console.log('=== 调试结束 ===');
});
