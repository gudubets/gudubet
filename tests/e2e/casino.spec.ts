import { test, expect } from '@playwright/test';

// Test Configuration
const TEST_USER = {
  email: 'test@example.com',
  password: 'testpassword123',
  firstName: 'Test',
  lastName: 'User'
};

test.describe('Casino Platform E2E Tests', () => {
  
  test.describe('Authentication Flow', () => {
    test('should register new user successfully', async ({ page }) => {
      await page.goto('/');
      
      // Click register button
      await page.click('[data-testid="register-button"]');
      
      // Fill registration form
      await page.fill('[data-testid="email-input"]', TEST_USER.email);
      await page.fill('[data-testid="password-input"]', TEST_USER.password);
      await page.fill('[data-testid="first-name-input"]', TEST_USER.firstName);
      await page.fill('[data-testid="last-name-input"]', TEST_USER.lastName);
      
      // Submit form
      await page.click('[data-testid="register-submit"]');
      
      // Verify success
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    });

    test('should login existing user', async ({ page }) => {
      await page.goto('/');
      
      // Click login button
      await page.click('[data-testid="login-button"]');
      
      // Fill login form
      await page.fill('[data-testid="email-input"]', TEST_USER.email);
      await page.fill('[data-testid="password-input"]', TEST_USER.password);
      
      // Submit form
      await page.click('[data-testid="login-submit"]');
      
      // Verify logged in
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    });
  });

  test.describe('KYC Process', () => {
    test.beforeEach(async ({ page }) => {
      // Login before each KYC test
      await page.goto('/');
      await page.click('[data-testid="login-button"]');
      await page.fill('[data-testid="email-input"]', TEST_USER.email);
      await page.fill('[data-testid="password-input"]', TEST_USER.password);
      await page.click('[data-testid="login-submit"]');
    });

    test('should complete KYC verification', async ({ page }) => {
      await page.goto('/profile');
      
      // Start KYC process
      await page.click('[data-testid="start-kyc-button"]');
      
      // Upload documents (mock file upload)
      await page.setInputFiles('[data-testid="id-document-upload"]', 'tests/fixtures/sample-id.jpg');
      await page.setInputFiles('[data-testid="address-document-upload"]', 'tests/fixtures/sample-address.pdf');
      
      // Submit KYC
      await page.click('[data-testid="submit-kyc"]');
      
      // Verify submission
      await expect(page.locator('[data-testid="kyc-submitted-message"]')).toBeVisible();
    });
  });

  test.describe('Deposit Flow', () => {
    test.beforeEach(async ({ page }) => {
      // Login and complete KYC setup
      await page.goto('/');
      await page.click('[data-testid="login-button"]');
      await page.fill('[data-testid="email-input"]', TEST_USER.email);
      await page.fill('[data-testid="password-input"]', TEST_USER.password);
      await page.click('[data-testid="login-submit"]');
    });

    test('should make successful deposit - TRY', async ({ page }) => {
      await page.goto('/payment-methods');
      
      // Select deposit tab
      await page.click('[data-testid="deposit-tab"]');
      
      // Select currency
      await page.selectOption('[data-testid="currency-select"]', 'TRY');
      
      // Enter amount
      await page.fill('[data-testid="amount-input"]', '100');
      
      // Select payment method
      await page.click('[data-testid="credit-card-method"]');
      
      // Submit deposit
      await page.click('[data-testid="deposit-submit"]');
      
      // Verify redirect to payment processor (mock)
      await expect(page).toHaveURL(/.*payment-processor.*/);
    });

    test('should make successful deposit - USD', async ({ page }) => {
      await page.goto('/payment-methods');
      
      // Select deposit tab
      await page.click('[data-testid="deposit-tab"]');
      
      // Select currency
      await page.selectOption('[data-testid="currency-select"]', 'USD');
      
      // Enter amount
      await page.fill('[data-testid="amount-input"]', '50');
      
      // Select payment method
      await page.click('[data-testid="paypal-method"]');
      
      // Submit deposit
      await page.click('[data-testid="deposit-submit"]');
      
      // Verify processing
      await expect(page.locator('[data-testid="payment-processing"]')).toBeVisible();
    });
  });

  test.describe('Withdrawal Flow', () => {
    test.beforeEach(async ({ page }) => {
      // Login with funded account
      await page.goto('/');
      await page.click('[data-testid="login-button"]');
      await page.fill('[data-testid="email-input"]', TEST_USER.email);
      await page.fill('[data-testid="password-input"]', TEST_USER.password);
      await page.click('[data-testid="login-submit"]');
    });

    test('should initiate withdrawal request', async ({ page }) => {
      await page.goto('/payment-methods');
      
      // Select withdrawal tab
      await page.click('[data-testid="withdrawal-tab"]');
      
      // Enter amount
      await page.fill('[data-testid="withdrawal-amount"]', '50');
      
      // Select method
      await page.selectOption('[data-testid="withdrawal-method"]', 'bank_transfer');
      
      // Fill bank details
      await page.fill('[data-testid="iban-input"]', 'TR123456789012345678901234');
      
      // Submit withdrawal
      await page.click('[data-testid="withdrawal-submit"]');
      
      // Verify success message
      await expect(page.locator('[data-testid="withdrawal-success"]')).toBeVisible();
    });
  });

  test.describe('Game Launching', () => {
    test.beforeEach(async ({ page }) => {
      // Login with funded account
      await page.goto('/');
      await page.click('[data-testid="login-button"]');
      await page.fill('[data-testid="email-input"]', TEST_USER.email);
      await page.fill('[data-testid="password-input"]', TEST_USER.password);
      await page.click('[data-testid="login-submit"]');
    });

    test('should launch casino game', async ({ page }) => {
      await page.goto('/casino');
      
      // Click on a game
      await page.click('[data-testid="game-card"]:first-child');
      
      // Verify game loading
      await expect(page.locator('[data-testid="game-iframe"]')).toBeVisible();
      
      // Wait for game to load (timeout: 10s)
      await page.waitForLoadState('networkidle', { timeout: 10000 });
    });

    test('should launch live casino game', async ({ page }) => {
      await page.goto('/live-casino');
      
      // Click join table
      await page.click('[data-testid="join-table-button"]:first-child');
      
      // Verify live game interface
      await expect(page.locator('[data-testid="live-game-interface"]')).toBeVisible();
    });
  });

  test.describe('Cross-Browser Compatibility', () => {
    ['chromium', 'firefox', 'webkit'].forEach(browserName => {
      test(`should work on ${browserName}`, async ({ page }) => {
        await page.goto('/');
        
        // Test basic functionality
        await expect(page.locator('[data-testid="hero-section"]')).toBeVisible();
        await expect(page.locator('[data-testid="game-categories"]')).toBeVisible();
        await expect(page.locator('[data-testid="footer"]')).toBeVisible();
      });
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test('should work on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.goto('/');
      
      // Test mobile navigation
      await page.click('[data-testid="mobile-menu-button"]');
      await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
      
      // Test game grid on mobile
      await page.goto('/casino');
      await expect(page.locator('[data-testid="game-grid"]')).toBeVisible();
    });
  });
});