// 详细调试测试
import { test, expect } from '@playwright/test';

test('Detailed debug test', async ({ page }) => {
  console.log('开始详细调试...');
  
  // 监听所有控制台信息
  page.on('console', msg => {
    console.log(`浏览器控制台 [${msg.type()}]:`, msg.text());
  });
  
  // 监听网络请求
  page.on('request', request => {
    console.log('请求:', request.url());
  });
  
  page.on('response', response => {
    console.log('响应:', response.url(), response.status());
  });
  
  // 设置用户角色
  await page.addInitScript(() => {
    console.log('设置用户角色...');
    window.localStorage.setItem('user_role', 'pattern_maker');
    window.localStorage.setItem('user_token', 'mock_token_pattern_maker');
    window.localStorage.setItem('user_name', '测试pattern_maker');
  });
  
  console.log('访问页面...');
  await page.goto('/boms/PENDING_CRAFT_BOM');
  
  // 等待页面加载
  await page.waitForTimeout(5000);
  
  // 截图
  await page.screenshot({ path: 'debug-detailed-page.png', fullPage: true });
  
  // 检查Vue根元素
  const vueApp = await page.locator('#app').count();
  console.log('Vue应用容器存在:', vueApp > 0);
  
  if (vueApp > 0) {
    // 使用first()避免strict mode violation
    const appContent = await page.locator('#app').first().textContent();
    console.log('Vue应用内容:', appContent.substring(0, 300));
    
    // 调试：检查有多少个#app元素
    console.log('页面上#app元素数量:', vueApp);
    
    if (vueApp > 1) {
      console.log('警告：发现多个#app元素，这可能是Vue应用重复挂载的问题');
      // 获取所有#app元素的信息
      const allApps = await page.locator('#app').all();
      for (let i = 0; i < allApps.length; i++) {
        const parentElement = await allApps[i].evaluate(el => el.parentElement?.tagName || 'unknown');
        console.log(`  #app ${i+1}: 父元素为 ${parentElement}`);
      }
    }
  }
  
  // 检查所有CSS类
  const allElements = await page.locator('*[class]').all();
  console.log('页面中的CSS类:');
  for (let i = 0; i < Math.min(allElements.length, 10); i++) {
    const className = await allElements[i].getAttribute('class');
    const tagName = await allElements[i].evaluate(el => el.tagName);
    console.log(`  ${tagName}: ${className}`);
  }
  
  // 检查路由状态
  const currentUrl = page.url();
  console.log('当前URL:', currentUrl);
  
  // 检查localStorage
  const localStorage = await page.evaluate(() => {
    return {
      user_role: window.localStorage.getItem('user_role'),
      user_token: window.localStorage.getItem('user_token'),
      user_name: window.localStorage.getItem('user_name')
    };
  });
  console.log('localStorage内容:', localStorage);
  
  console.log('详细调试结束');
});
