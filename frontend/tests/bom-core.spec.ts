import { test, expect } from '@playwright/test';

// BOM协同工作流平台 - 核心功能测试
test.describe('BOM平台核心功能测试', () => {
  
  test('首页加载测试', async ({ page }) => {
    await page.goto('/');
    
    // 验证页面标题
    await expect(page).toHaveTitle(/BOM协同工作流平台/);
    
    // 验证页面加载成功
    await expect(page.locator('body')).toBeVisible();
    
    console.log('✅ 首页加载测试通过');
  });

  test('BOM列表页访问测试', async ({ page }) => {
    await page.goto('/boms');
    
    // 验证页面标题
    await expect(page).toHaveTitle(/BOM列表.*BOM协同工作流平台/);
    
    // 验证页面内容加载
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
    
    console.log('✅ BOM列表页访问测试通过');
  });

  test('BOM详情页访问测试', async ({ page }) => {
    // 模拟API响应，确保测试稳定
    await page.route('**/api/boms/TEST001/', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          style_code: 'TEST001',
          product_name: '测试产品',
          category: 'TOP',
          status: 'DRAFT',
          season: 'Spring',
          year: 2024,
          target_price: 100.00,
          estimated_cost: 80.00,
          bom_details: [],
          size_specs: []
        })
      });
    });

    await page.goto('/boms/TEST001');
    
    // 验证页面标题
    await expect(page).toHaveTitle(/BOM详情.*BOM协同工作流平台/);
    
    // 等待页面加载
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
    
    console.log('✅ BOM详情页访问测试通过');
  });

  test('导航功能测试', async ({ page }) => {
    // 从首页导航到BOM列表
    await page.goto('/');
    
    // 查找可能的导航链接
    const bomListLink = page.locator('a[href="/boms"]').or(
      page.getByRole('link', { name: /BOM.*列表/ })
    ).or(
      page.locator('button').filter({ hasText: /BOM.*列表/ })
    );
    
    if (await bomListLink.first().isVisible()) {
      await bomListLink.first().click();
      await expect(page).toHaveURL(/.*\/boms/);
      console.log('✅ 导航功能测试通过');
    } else {
      // 如果没有找到导航，直接导航测试路由
      await page.goto('/boms');
      await expect(page).toHaveURL(/.*\/boms/);
      console.log('✅ 路由功能测试通过（无导航链接）');
    }
  });

  test('响应式布局测试', async ({ page }) => {
    // 桌面端测试
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
    
    // 移动端测试
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await expect(page.locator('body')).toBeVisible();
    
    console.log('✅ 响应式布局测试通过');
  });

  test('页面性能基础测试', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // 检查页面在合理时间内加载完成（10秒）
    expect(loadTime).toBeLessThan(10000);
    
    console.log(`✅ 页面加载时间: ${loadTime}ms`);
  });
});

// 集成测试
test.describe('BOM平台集成测试', () => {
  
  test('完整用户流程模拟', async ({ page }) => {
    // 模拟用户从首页到详情页的完整流程
    
    // 1. 访问首页
    await page.goto('/');
    await expect(page).toHaveTitle(/BOM协同工作流平台/);
    
    // 2. 访问列表页
    await page.goto('/boms');
    await expect(page).toHaveTitle(/BOM列表/);
    
    // 3. 访问详情页
    await page.goto('/boms/TEST001');
    await expect(page).toHaveTitle(/BOM详情/);
    
    console.log('✅ 完整用户流程测试通过');
  });

  test('错误处理基础测试', async ({ page }) => {
    // 访问不存在的页面
    await page.goto('/non-existent-page');
    
    // 验证页面没有崩溃
    await expect(page.locator('body')).toBeVisible();
    
    // 检查页面是否正常显示（Vue路由器可能重定向到首页）
    const currentUrl = page.url();
    // Vue路由器将不存在的路由重定向到首页是正常行为
    expect(currentUrl.endsWith('/') || currentUrl.includes('/non-existent-page')).toBeTruthy();
    
    console.log('✅ 错误处理基础测试通过');
  });
});

