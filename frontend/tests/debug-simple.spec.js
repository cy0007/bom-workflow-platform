// 简化调试测试
import { test, expect } from '@playwright/test';

test('Simple debug test', async ({ page }) => {
  console.log('开始简化调试...');
  
  // 设置用户角色
  await page.addInitScript(() => {
    window.localStorage.setItem('user_role', 'pattern_maker');
    window.localStorage.setItem('user_token', 'mock_token_pattern_maker');
    window.localStorage.setItem('user_name', '测试pattern_maker');
  });
  
  // 访问页面
  await page.goto('/boms/PENDING_CRAFT_BOM');
  
  // 等待更长时间
  await page.waitForTimeout(3000);
  
  // 截图
  await page.screenshot({ path: 'debug-simple-page.png', fullPage: true });
  
  // 检查控制台错误
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  
  // 获取页面HTML片段
  const bodyText = await page.locator('body').textContent();
  console.log('页面内容预览:', bodyText.substring(0, 200));
  
  // 检查是否有错误元素
  const errorElements = await page.locator('.error-container').count();
  console.log('错误容器数量:', errorElements);
  
  // 检查是否有加载元素
  const loadingElements = await page.locator('.loading-container').count();
  console.log('加载容器数量:', loadingElements);
  
  // 检查BOM详情容器
  const bomDetailElements = await page.locator('.bom-detail-content').count();
  console.log('BOM详情容器数量:', bomDetailElements);
  
  // 输出控制台错误
  await page.waitForTimeout(1000);
  console.log('控制台错误:', consoleErrors);
  
  console.log('简化调试结束');
});
