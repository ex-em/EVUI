import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-vue';
import EvInputNumber from './InputNumber.vue';

describe('EvInputNumber Visual Regression', () => {
  describe('Precision', () => {
    it('precision 설정 시 후행 0이 표시된다', async () => {
      const screen = render(EvInputNumber, {
        props: { modelValue: 1.5, precision: 3 },
      });

      await expect(screen.container.firstElementChild)
        .toMatchScreenshot('input-number-precision');
    });

    it('precision 설정 시 값이 0이면 0.000으로 표시된다', async () => {
      const screen = render(EvInputNumber, {
        props: { modelValue: 0, precision: 3 },
      });

      await expect(screen.container.firstElementChild)
        .toMatchScreenshot('input-number-precision-zero');
    });

    it('trimTrailingZero 설정 시 후행 0이 제거된다', async () => {
      const screen = render(EvInputNumber, {
        props: { modelValue: 1.5, precision: 3, trimTrailingZero: true },
      });

      await expect(screen.container.firstElementChild)
        .toMatchScreenshot('input-number-trim-trailing-zero');
    });

    it('trimTrailingZero 설정 시 값이 0이면 0으로 표시된다', async () => {
      const screen = render(EvInputNumber, {
        props: { modelValue: 0, precision: 3, trimTrailingZero: true },
      });

      await expect(screen.container.firstElementChild)
        .toMatchScreenshot('input-number-trim-trailing-zero-value-zero');
    });

    it('trimTrailingZero 설정 시 소수점이 정확히 맞으면 그대로 표시된다', async () => {
      const screen = render(EvInputNumber, {
        props: { modelValue: 1.123, precision: 3, trimTrailingZero: true },
      });

      await expect(screen.container.firstElementChild)
        .toMatchScreenshot('input-number-trim-trailing-zero-exact');
    });
  });
});
