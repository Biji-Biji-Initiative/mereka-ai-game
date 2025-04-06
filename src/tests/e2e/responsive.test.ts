import { test, expect } from '@playwright/test';

test.describe('Responsive Design Verification', () => {
  test('welcome page is responsive across all device sizes', async ({ page }) => {
    // Desktop view
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('http://localhost:3333/');
    
    // Verify desktop layout
    await expect(page.locator('.challenge-card')).toHaveCount(3);
    await expect(page.locator('.hero-section')).toBeVisible();
    await page.screenshot({ path: 'welcome-desktop.png' });
    
    // Tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    
    // Verify tablet layout adjustments
    await expect(page.locator('.challenge-card')).toHaveCount(3);
    await page.screenshot({ path: 'welcome-tablet.png' });
    
    // Mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    
    // Verify mobile layout adjustments
    await expect(page.locator('.hero-section')).toBeVisible();
    await page.screenshot({ path: 'welcome-mobile.png' });
  });
  
  test('assessment page is responsive across all device sizes', async ({ page }) => {
    // Navigate to assessment page
    await page.goto('http://localhost:3333/assessment');
    
    // Desktop view
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.screenshot({ path: 'assessment-desktop.png' });
    
    // Tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await page.screenshot({ path: 'assessment-tablet.png' });
    
    // Mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.screenshot({ path: 'assessment-mobile.png' });
  });
  
  test('focus selection page is responsive across all device sizes', async ({ page }) => {
    // Navigate to focus page
    await page.goto('http://localhost:3333/focus');
    
    // Desktop view
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.screenshot({ path: 'focus-desktop.png' });
    
    // Tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await page.screenshot({ path: 'focus-tablet.png' });
    
    // Mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.screenshot({ path: 'focus-mobile.png' });
  });
  
  test('round pages are responsive across all device sizes', async ({ page }) => {
    // Navigate to round1 page
    await page.goto('http://localhost:3333/round1');
    
    // Desktop view
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.screenshot({ path: 'round-desktop.png' });
    
    // Tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await page.screenshot({ path: 'round-tablet.png' });
    
    // Mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.screenshot({ path: 'round-mobile.png' });
  });
  
  test('results page is responsive across all device sizes', async ({ page }) => {
    // Navigate to results page
    await page.goto('http://localhost:3333/results');
    
    // Desktop view
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.screenshot({ path: 'results-desktop.png' });
    
    // Tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await page.screenshot({ path: 'results-tablet.png' });
    
    // Mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.screenshot({ path: 'results-mobile.png' });
  });
});
