// 调试toggle测试
import { test, expect } from '@playwright/test';

test('Debug toggle test', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('user_role', 'pattern_maker');
    window.localStorage.setItem('user_token', 'mock_token_pattern_maker');
    window.localStorage.setItem('user_name', '测试pattern_maker');
  });

  console.log('=== Toggle测试调试 ===');
  
  page.on('console', msg => {
    console.log(`浏览器 [${msg.type()}]:`, msg.text());
  });
  
  await page.goto('/boms/PENDING_CRAFT_BOM?test=toggle');
  await page.waitForTimeout(3000);
  
  // 检查URL参数
  const url = page.url();
  console.log('当前URL:', url);
  
  // 检查CSS类
  const hasReadonlyMode = await page.locator('.readonly-mode').count() > 0;
  const hasEditMode = await page.locator('.edit-mode').count() > 0;
  
  console.log('CSS类状态:');
  console.log('  - .readonly-mode:', hasReadonlyMode);
  console.log('  - .edit-mode:', hasEditMode);
  
  // 检查编辑按钮
  const editButton = await page.locator('button:has-text("编辑规格尺寸")').count() > 0;
  console.log('编辑按钮存在:', editButton);
  
  console.log('=== 调试结束 ===');
});
