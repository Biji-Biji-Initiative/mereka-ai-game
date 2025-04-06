import { test, expect } from '@playwright/test';

test.describe('End-to-End Tests', () => {
  test('application loads correctly on different screen sizes', async ({ page }) => {
    // Test on desktop size
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('http://localhost:3333/');
    
    // Verify welcome page loaded on desktop
    await expect(page.getByRole('heading', { name: 'AI Fight Club' })).toBeVisible();
    await expect(page.getByText('Test your human abilities against AI systems')).toBeVisible();
    
    // Check responsive layout on desktop
    const challengeCards = page.locator('.challenge-card');
    await expect(challengeCards).toHaveCount(3);
    
    // Test on tablet size
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    
    // Verify welcome page adapts to tablet size
    await expect(page.getByRole('heading', { name: 'AI Fight Club' })).toBeVisible();
    
    // Test on mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    
    // Verify welcome page adapts to mobile size
    await expect(page.getByRole('heading', { name: 'AI Fight Club' })).toBeVisible();
  });
  
  test('game state persists between page reloads', async ({ page }) => {
    // Start at the welcome page
    await page.goto('http://localhost:3333/');
    
    // Click start button
    await page.getByRole('button', { name: 'Start Challenge' }).click();
    
    // Verify assessment page loaded
    await expect(page.getByRole('heading', { name: 'AI Personality Assessment' })).toBeVisible();
    
    // Answer first question
    await page.getByRole('tab', { name: '4' }).click();
    await page.getByRole('button', { name: 'Next Question' }).click();
    
    // Reload the page
    await page.reload();
    
    // Verify we're still on question 2 (state persisted)
    await expect(page.getByRole('button', { name: 'Previous Question' })).not.toBeDisabled();
  });
  
  test('accessibility features work correctly', async ({ page }) => {
    // Start at the welcome page
    await page.goto('http://localhost:3333/');
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    
    // Verify assessment page loaded via keyboard navigation
    await expect(page.getByRole('heading', { name: 'AI Personality Assessment' })).toBeVisible();
    
    // Test focus indicators are visible
    await page.keyboard.press('Tab');
    
    // Take a screenshot to verify focus styles
    await page.screenshot({ path: 'focus-styles.png' });
  });
  
  test('error handling works correctly', async ({ page }) => {
    // Test invalid route
    await page.goto('http://localhost:3333/invalid-route');
    
    // Verify error page or fallback is shown
    await expect(page.getByText(/page not found|404|doesn't exist/i)).toBeVisible();
  });
});
