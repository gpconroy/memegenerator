/**
 * End-to-End Tests for Meme Generator
 * Tests complete user workflows
 */

const { test, expect } = require('@playwright/test');

test.describe('Meme Generator E2E Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/index.html');
    });

    test('should load the page successfully', async ({ page }) => {
        await expect(page.locator('h1')).toContainText('Meme Generator');
        await expect(page.locator('#memeCanvas')).toBeVisible();
    });

    test('should upload an image file', async ({ page }) => {
        const fileInput = page.locator('#imageUpload');
        await fileInput.setInputFiles({
            name: 'test-image.jpg',
            mimeType: 'image/jpeg',
            buffer: Buffer.from('fake-image-data')
        });
        
        // Wait for image to load
        await page.waitForTimeout(500);
        
        // Canvas should be visible after image load
        const canvas = page.locator('#memeCanvas');
        await expect(canvas).toHaveClass(/show/);
    });

    test('should select a template image', async ({ page }) => {
        const template = page.locator('.template-item').first();
        await template.click();
        
        await page.waitForTimeout(500);
        
        const canvas = page.locator('#memeCanvas');
        await expect(canvas).toHaveClass(/show/);
        await expect(template).toHaveClass(/active/);
    });

    test('should add and display top text', async ({ page }) => {
        // Load template first
        await page.locator('.template-item').first().click();
        await page.waitForTimeout(500);
        
        const topTextInput = page.locator('#topText');
        await topTextInput.fill('TEST TOP TEXT');
        
        // Text should be in the input
        await expect(topTextInput).toHaveValue('TEST TOP TEXT');
    });

    test('should change text color', async ({ page }) => {
        await page.locator('.template-item').first().click();
        await page.waitForTimeout(500);
        
        const colorInput = page.locator('#topColor');
        await colorInput.fill('#ff0000');
        
        await expect(colorInput).toHaveValue('#ff0000');
    });

    test('should adjust font size', async ({ page }) => {
        const fontSizeInput = page.locator('#fontSize');
        const fontSizeValue = page.locator('#fontSizeValue');
        
        await fontSizeInput.fill('60');
        await expect(fontSizeValue).toContainText('60');
    });

    test('should position text on canvas click', async ({ page }) => {
        await page.locator('.template-item').first().click();
        await page.waitForTimeout(500);
        
        // Select text positioning mode
        const positionBtn = page.locator('.select-text-btn[data-text="top"]');
        await positionBtn.click();
        
        // Click on canvas
        const canvas = page.locator('#memeCanvas');
        await canvas.click({ position: { x: 400, y: 100 } });
        
        // Canvas should show crosshair cursor
        await expect(canvas).toHaveClass(/crosshair/);
    });

    test('should enable download button after image load', async ({ page }) => {
        const downloadBtn = page.locator('#downloadBtn');
        await expect(downloadBtn).toBeDisabled();
        
        await page.locator('.template-item').first().click();
        await page.waitForTimeout(500);
        
        await expect(downloadBtn).toBeEnabled();
    });

    test('should handle keyboard navigation', async ({ page }) => {
        // Test tab navigation
        await page.keyboard.press('Tab');
        await expect(page.locator('#imageUpload')).toBeFocused();
    });

    test('should validate file input accepts only images', async ({ page }) => {
        const fileInput = page.locator('#imageUpload');
        const accept = await fileInput.getAttribute('accept');
        expect(accept).toBe('image/*');
    });

    test('should handle rotation slider changes', async ({ page }) => {
        await page.locator('.template-item').first().click();
        await page.waitForTimeout(500);
        
        const rotationInput = page.locator('#topRotation');
        const rotationValue = page.locator('#topRotationValue');
        
        await rotationInput.fill('45');
        await expect(rotationValue).toContainText('45');
    });

    test('should handle multiple text elements', async ({ page }) => {
        await page.locator('.template-item').first().click();
        await page.waitForTimeout(500);
        
        await page.locator('#topText').fill('TOP');
        await page.locator('#centerText').fill('CENTER');
        await page.locator('#bottomText').fill('BOTTOM');
        
        await expect(page.locator('#topText')).toHaveValue('TOP');
        await expect(page.locator('#centerText')).toHaveValue('CENTER');
        await expect(page.locator('#bottomText')).toHaveValue('BOTTOM');
    });
});

test.describe('Accessibility Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/index.html');
    });

    test('should have proper heading hierarchy', async ({ page }) => {
        const h1 = page.locator('h1');
        await expect(h1).toBeVisible();
    });

    test('should have labels for all form inputs', async ({ page }) => {
        const inputs = page.locator('input, textarea');
        const count = await inputs.count();
        
        for (let i = 0; i < count; i++) {
            const input = inputs.nth(i);
            const id = await input.getAttribute('id');
            if (id) {
                const label = page.locator(`label[for="${id}"]`);
                const hasLabel = await label.count() > 0 || 
                                await input.getAttribute('aria-label') !== null;
                expect(hasLabel).toBeTruthy();
            }
        }
    });

    test('should be keyboard navigable', async ({ page }) => {
        await page.keyboard.press('Tab');
        const focused = await page.evaluate(() => document.activeElement.tagName);
        expect(['INPUT', 'BUTTON', 'TEXTAREA']).toContain(focused);
    });
});
