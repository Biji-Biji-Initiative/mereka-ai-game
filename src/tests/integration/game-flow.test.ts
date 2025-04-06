import { test, expect } from '@playwright/test';

test.describe('Game Flow Integration Tests', () => {
  test('complete game flow from welcome to results', async ({ page }) => {
    // Start at the welcome page
    await page.goto('http://localhost:3333/');
    
    // Verify welcome page loaded
    await expect(page.getByRole('heading', { name: 'AI Fight Club' })).toBeVisible();
    
    // Click start button
    await page.getByRole('button', { name: 'Start Challenge' }).click();
    
    // Verify assessment page loaded
    await expect(page.getByRole('heading', { name: 'AI Personality Assessment' })).toBeVisible();
    
    // Answer all assessment questions
    for (let i = 0; i < 5; i++) {
      // Select rating 4 for each question
      await page.getByRole('tab', { name: '4' }).click();
      
      // Click next button (or complete on last question)
      const buttonText = i === 4 ? 'Complete Assessment' : 'Next Question';
      await page.getByRole('button', { name: buttonText }).click();
    }
    
    // Verify focus selection page loaded
    await expect(page.getByRole('heading', { name: 'Choose Your Focus' })).toBeVisible();
    
    // Select a focus area
    await page.getByText('Creative Thinking').click();
    
    // Click begin challenge button
    await page.getByRole('button', { name: /Begin/ }).click();
    
    // Verify round 1 loaded
    await expect(page.getByRole('heading', { name: 'Round 1' })).toBeVisible();
    
    // Complete all steps in round 1
    for (let i = 0; i < 3; i++) {
      // Click next step button (or complete on last step)
      const buttonText = i === 2 ? 'Complete Round' : 'Next Step';
      await page.getByRole('button', { name: buttonText }).click();
    }
    
    // Verify round 2 loaded
    await expect(page.getByRole('heading', { name: 'Round 2' })).toBeVisible();
    
    // Complete all steps in round 2
    for (let i = 0; i < 3; i++) {
      // Click next step button (or complete on last step)
      const buttonText = i === 2 ? 'Complete Round' : 'Next Step';
      await page.getByRole('button', { name: buttonText }).click();
    }
    
    // Verify round 3 loaded
    await expect(page.getByRole('heading', { name: 'Round 3' })).toBeVisible();
    
    // Complete all steps in round 3
    for (let i = 0; i < 3; i++) {
      // Click next step button (or complete on last step)
      const buttonText = i === 2 ? 'Complete Round' : 'Next Step';
      await page.getByRole('button', { name: buttonText }).click();
    }
    
    // Verify results page loaded
    await expect(page.getByRole('heading', { name: 'Results Analysis' })).toBeVisible();
    
    // Verify key results elements are present
    await expect(page.getByText('Your AI Fight Club Performance')).toBeVisible();
    await expect(page.getByText('Focus Area')).toBeVisible();
    await expect(page.getByText('Round Performance')).toBeVisible();
    await expect(page.getByText('Human vs AI Comparison')).toBeVisible();
    
    // Verify action buttons are present
    await expect(page.getByRole('button', { name: 'Share Your Results' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Start New Challenge' })).toBeVisible();
  });
});
