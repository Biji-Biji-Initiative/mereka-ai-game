import { test, expect } from '@playwright/test';

test.describe('Error Handling Tests', () => {
  test('application handles invalid routes gracefully', async ({ page }) => {
    // Navigate to an invalid route
    await page.goto('http://localhost:3333/invalid-route-that-does-not-exist');
    
    // Check for proper error handling
    await expect(page.getByText(/not found|404|doesn't exist/i)).toBeVisible();
    await page.screenshot({ path: 'error-invalid-route.png' });
    
    // Verify navigation still works
    const homeLink = await page.getByRole('link', { name: /home|back/i });
    if (await homeLink.count() > 0) {
      await homeLink.click();
      await expect(page.url()).toBe('http://localhost:3333/');
    }
  });
  
  test('application handles invalid state transitions', async ({ page }) => {
    // Try to access a page that requires previous state
    await page.goto('http://localhost:3333/round2');
    
    // Should redirect to appropriate page or show error
    await expect(page.url()).not.toBe('http://localhost:3333/round2');
    await page.screenshot({ path: 'error-invalid-state.png' });
  });
  
  test('application handles form validation errors', async ({ page }) => {
    // Navigate to assessment page
    await page.goto('http://localhost:3333/assessment');
    
    // Try to submit without selecting a rating
    const nextButton = await page.getByRole('button', { name: /Next/i });
    await nextButton.click();
    
    // Check if validation message appears or if button is disabled
    const isDisabled = await nextButton.isDisabled();
    const hasValidationMessage = await page.getByText(/please select|required/i).count() > 0;
    
    expect(isDisabled || hasValidationMessage).toBeTruthy();
    await page.screenshot({ path: 'error-validation.png' });
  });
});
