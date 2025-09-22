// 路由调试测试
import { test, expect } from '@playwright/test';

test('Route debug test', async ({ page }) => {
  console.log('开始路由调试...');
  
  // 监听控制台
  page.on('console', msg => {
    console.log(`浏览器 [${msg.type()}]:`, msg.text());
  });
  
  // 先访问首页
  console.log('访问首页...');
  await page.goto('/');
  await page.waitForTimeout(2000);
  
  const homeContent = await page.locator('body').textContent();
  console.log('首页内容:', homeContent.substring(0, 200));
  
  // 再访问BOM详情页
  console.log('访问BOM详情页...');
  await page.goto('/boms/TEST001');
  await page.waitForTimeout(3000);
  
  const detailContent = await page.locator('body').textContent();
  console.log('详情页内容:', detailContent.substring(0, 200));
  
  // 检查URL
  console.log('当前URL:', page.url());
  
  // 检查路由组件
  const routerView = await page.locator('router-view').count();
  console.log('router-view数量:', routerView);
  
  const vueComponents = await page.locator('[data-v-]').count();
  console.log('Vue组件数量:', vueComponents);
  
  console.log('路由调试结束');
});
