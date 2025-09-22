// 最终调试测试
import { test, expect } from '@playwright/test';

async function loginAs(page, role) {
  await page.addInitScript((userRole) => {
    window.localStorage.setItem('user_role', userRole);
    window.localStorage.setItem('user_token', `mock_token_${userRole}`);
    window.localStorage.setItem('user_name', `测试${userRole}`);
  }, role);
}

test('Debug Pattern Maker Test', async ({ page }) => {
  await loginAs(page, 'pattern_maker');
  
  console.log('=== Pattern Maker Test Debug ===');
  await page.goto('/boms/PENDING_CRAFT_BOM');
  await page.waitForTimeout(3000);
  
  // 检查页面标题
  const title = await page.locator('h1.page-title').textContent();
  console.log('页面标题:', title);
  
  // 检查CSS类
  const hasReadonly = await page.locator('.readonly-mode').count() > 0;
  const hasEdit = await page.locator('.edit-mode').count() > 0;
  console.log('readonly-mode存在:', hasReadonly);
  console.log('edit-mode存在:', hasEdit);
  
  // 检查表格
  const table = await page.locator('#size-specs-table').count() > 0;
  console.log('size-specs-table存在:', table);
  
  // 检查裙长列  
  const skirtColumn = await page.locator('#size-specs-table th:has-text("裙长")').count() > 0;
  console.log('裙长列存在:', skirtColumn);
  
  // 检查输入框
  const inputs = await page.locator('#size-specs-table input').count();
  console.log('表格输入框数量:', inputs);
  
  // 检查第二列（第一行第二列应该是裙长的S码）
  const secondColumnInput = await page.locator('#size-specs-table tbody tr:first-child td:nth-child(2) input').count();
  console.log('第二列输入框存在:', secondColumnInput > 0);
  
  if (secondColumnInput > 0) {
    const inputValue = await page.locator('#size-specs-table tbody tr:first-child td:nth-child(2) input').getAttribute('value');
    console.log('输入框值:', inputValue);
  }
  
  // 测试locator策略
  const sizeSCell = page.locator('#size-specs-table >> text=裙长 >> .. >> td').nth(1);
  const sizeSCellExists = await sizeSCell.count() > 0;
  console.log('sizeSCell存在:', sizeSCellExists);
  
  if (sizeSCellExists) {
    const inputInCell = await sizeSCell.locator('input').count();
    console.log('sizeSCell中的输入框:', inputInCell);
  }
  
  console.log('=== Debug End ===');
});

test('Debug Edit Mode Toggle', async ({ page }) => {
  await loginAs(page, 'pattern_maker');
  
  console.log('=== Edit Mode Toggle Debug ===');
  await page.goto('/boms/PENDING_CRAFT_BOM');
  await page.waitForTimeout(3000);
  
  // 检查初始模式
  const initialReadonly = await page.locator('.readonly-mode').count() > 0;
  const initialEdit = await page.locator('.edit-mode').count() > 0;
  console.log('初始readonly-mode:', initialReadonly);
  console.log('初始edit-mode:', initialEdit);
  
  // 检查编辑按钮状态
  const editButton = page.locator('button:has-text("编辑规格尺寸")');
  const buttonExists = await editButton.count() > 0;
  console.log('编辑按钮存在:', buttonExists);
  
  if (buttonExists) {
    const isDisabled = await editButton.isDisabled();
    console.log('编辑按钮禁用状态:', isDisabled);
  }
  
  console.log('=== Debug End ===');
});
