import { by, element, waitFor } from 'detox';
import { beforeAll, describe, expect, it } from 'jest';

const { launchAppWithMocks } = require('./utils/launchApp');

describe('Core logging loop', () => {
  beforeAll(async () => {
    await launchAppWithMocks();
  });

  it('logs a meal from scan to dashboard', async () => {
    await expect(element(by.id('daily-calories-value'))).toBeVisible();

    await element(by.id('scan-food-button')).tap();

    await waitFor(element(by.id('review-food-name')))
      .toBeVisible()
      .withTimeout(10000);
    await expect(element(by.id('review-food-name'))).toHaveText('Braised Pork Rice');

    await element(by.id('save-meal-button')).tap();

    await waitFor(element(by.id('daily-calories-value')))
      .toHaveText('650 kcal')
      .withTimeout(10000);
  });
});
