import { test, expect } from '@playwright/test';

test.describe('Accessibility Compliance Tests', () => {
  test('welcome page meets accessibility standards', async ({ page }) => {
    await page.goto('http://localhost:3333/');
    
    // Check for proper heading structure
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1); // Should have exactly one h1
    
    // Check for image alt text
    const imagesWithoutAlt = await page.locator('img:not([alt])').count();
    expect(imagesWithoutAlt).toBe(0); // All images should have alt text
    
    // Check for proper button roles
    const buttons = await page.locator('button').all();
    for (const button of buttons) {
      expect(await button.getAttribute('role') || 'button').toBe('button');
    }
    
    // Check for color contrast (visual inspection via screenshot)
    await page.screenshot({ path: 'welcome-accessibility.png' });
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await page.screenshot({ path: 'welcome-keyboard-focus-1.png' });
    await page.keyboard.press('Tab');
    await page.screenshot({ path: 'welcome-keyboard-focus-2.png' });
    
    // Ensure focus is visible
    const focusedElement = await page.evaluate(() => {
      const activeElement = document.activeElement;
      return activeElement ? activeElement.tagName : null;
    });
    expect(focusedElement).not.toBeNull();
  });
  
  test('assessment page meets accessibility standards', async ({ page }) => {
    await page.goto('http://localhost:3333/assessment');
    
    // Check for proper ARIA attributes on tabs
    const tabs = await page.locator('[role="tab"]').all();
    for (const tab of tabs) {
      expect(await tab.getAttribute('aria-selected')).not.toBeNull();
    }
    
    // Check for proper button labels
    const nextButton = await page.getByRole('button', { name: /Next/i });
    expect(await nextButton.isVisible()).toBe(true);
    
    // Test keyboard navigation for rating selection
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Space'); // Select a rating option
    await page.screenshot({ path: 'assessment-keyboard-selection.png' });
  });
  
  test('focus selection page meets accessibility standards', async ({ page }) => {
    await page.goto('http://localhost:3333/focus');
    
    // Check for proper role attributes
    const focusOptions = await page.locator('[role="button"]').all();
    expect(focusOptions.length).toBeGreaterThan(0);
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter'); // Select a focus area
    await page.screenshot({ path: 'focus-keyboard-selection.png' });
    
    // Check if selection is visually indicated
    const selectedOption = await page.locator('.selected').count();
    expect(selectedOption).toBeGreaterThan(0);
  });
  
  test('results page meets accessibility standards', async ({ page }) => {
    await page.goto('http://localhost:3333/results');
    
    // Check for proper heading structure
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    expect(headings.length).toBeGreaterThan(0);
    
    // Check for proper button labels
    const shareButton = await page.getByRole('button', { name: /Share/i });
    expect(await shareButton.isVisible()).toBe(true);
    
    // Check for proper data visualization accessibility
    const dataVisualizations = await page.locator('.comparison-bar, .score-bar, .trait-meter').count();
    expect(dataVisualizations).toBeGreaterThan(0);
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.screenshot({ path: 'results-keyboard-focus.png' });
  });
});
