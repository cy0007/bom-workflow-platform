// 调试数据持久化测试
import { test, expect } from '@playwright/test';

test('Debug data persistence', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('user_role', 'pattern_maker');
    window.localStorage.setItem('user_token', 'mock_token_pattern_maker');
    window.localStorage.setItem('user_name', '测试pattern_maker');
  });

  console.log('=== 测试数据持久化 ===');
  await page.goto('/boms/PENDING_CRAFT_BOM');
  await page.waitForTimeout(3000);

  // 检查输入框
  const sizeSCell = page.locator('#size-specs-table >> text=裙长 >> .. >> td').nth(1);
  const input = sizeSCell.locator('input');
  
  const initialValue = await input.getAttribute('value');
  console.log('初始值:', initialValue);
  
  // 输入新值
  await input.fill('90');
  
  const newValue = await input.getAttribute('value');
  console.log('输入后的值:', newValue);
  
  // 点击保存按钮
  const saveButton = page.locator('button:has-text("保存尺寸修改")');
  console.log('保存按钮存在:', await saveButton.count() > 0);
  
  if (await saveButton.count() > 0) {
    await saveButton.click();
    
    // 等待保存完成
    await page.waitForTimeout(1000);
    console.log('已点击保存');
    
    // 刷新页面
    await page.reload();
    await page.waitForTimeout(3000);
    
    // 检查刷新后的值
    const reloadedValue = await sizeSCell.locator('input').getAttribute('value');
    console.log('刷新后的值:', reloadedValue);
  }
  
  console.log('=== 调试结束 ===');
});
