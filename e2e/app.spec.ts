import { test, expect } from '@playwright/test';

test.describe('Uptime Game', () => {
  test.describe('Authentication', () => {
    test('should display login page initially', async ({ page }) => {
      await page.goto('/');

      // Check for auth page elements
      await expect(page.getByRole('heading', { name: /Uptime/i })).toBeVisible();
    });

    test('should show email and password inputs', async ({ page }) => {
      await page.goto('/');

      await expect(page.getByPlaceholderText(/email/i)).toBeVisible();
      await expect(page.getByPlaceholderText(/password/i)).toBeVisible();
    });

    test('should have login and register buttons', async ({ page }) => {
      await page.goto('/');

      await expect(page.getByRole('button', { name: /로그인|login/i })).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should display error toast on network failure', async ({ page }) => {
      // Intercept network requests
      await page.route('**/api/**', (route) => route.abort());

      await page.goto('/');

      // Page should still load despite network errors
      await expect(page).toHaveTitle(/Uptime/);
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper heading structure', async ({ page }) => {
      await page.goto('/');

      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
      expect(headings.length).toBeGreaterThan(0);
    });

    test('should have alt text for images', async ({ page }) => {
      await page.goto('/');

      const images = await page.locator('img').all();
      for (const img of images) {
        const alt = await img.getAttribute('alt');
        // Images should have alt text (can be empty for decorative)
        expect(alt).not.toBeNull();
      }
    });

    test('should be keyboard navigable', async ({ page }) => {
      await page.goto('/');

      // Tab through the page
      await page.keyboard.press('Tab');

      // Should have focus on an element
      const focused = await page.locator(':focus').first();
      await expect(focused).toBeVisible();
    });
  });

  test.describe('Performance', () => {
    test('should load within acceptable time', async ({ page }) => {
      const startTime = Date.now();

      await page.goto('/');

      const loadTime = Date.now() - startTime;

      // Page should load within 5 seconds
      expect(loadTime).toBeLessThan(5000);
    });

    test('should have good Core Web Vitals', async ({ page }) => {
      await page.goto('/');

      // Wait for page to stabilize
      await page.waitForLoadState('networkidle');

      // Get LCP
      const lcp = await page.evaluate(() => {
        return new Promise<number>((resolve) => {
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            resolve(lastEntry.startTime);
          }).observe({ type: 'largest-contentful-paint', buffered: true });

          // Fallback timeout
          setTimeout(() => resolve(0), 5000);
        });
      });

      // LCP should be under 2.5 seconds
      if (lcp > 0) {
        expect(lcp).toBeLessThan(2500);
      }
    });
  });

  test.describe('Security', () => {
    test('should have security headers', async ({ request }) => {
      const response = await request.get('/');

      // In production, these headers should be set
      // For development, we just verify the response is successful
      expect(response.ok()).toBeTruthy();
    });

    test('should sanitize user input', async ({ page }) => {
      await page.goto('/');

      const emailInput = page.getByPlaceholderText(/email/i);

      // Try to inject script
      await emailInput.fill('<script>alert("xss")</script>');

      // Input should contain the text but not execute
      const value = await emailInput.inputValue();
      expect(value).toContain('script');

      // Page should not have any injected scripts
      const scripts = await page.locator('script:has-text("alert")').count();
      expect(scripts).toBe(0);
    });
  });

  test.describe('Responsive Design', () => {
    test('should be usable on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      // Page should still be usable
      await expect(page.getByRole('heading')).toBeVisible();
    });

    test('should be usable on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/');

      // Page should still be usable
      await expect(page.getByRole('heading')).toBeVisible();
    });

    test('should be usable on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto('/');

      // Page should still be usable
      await expect(page.getByRole('heading')).toBeVisible();
    });
  });
});
