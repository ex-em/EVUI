import { describe, it, expect, afterEach } from 'vitest';
import { render } from 'vitest-browser-vue';
import EvChart from './Chart.vue';

/**
 * realTimeScatterReset 뒤 리셋 전 점이 화면에 남지 않는지 — 실제 canvas(browser).
 * 리셋은 링을 비우지만 점 레이어(blit 기준 래스터)가 그대로면, 다음 배치가 링을 전진시킬 때 blit 이
 * 그 래스터를 밀어 써 전체 재렌더 전까지 리셋 전 점이 남는다. Y 범위를 고정해야 blit 경로에 들어간다.
 */
describe('EvChart realtime scatter 리셋 뒤 리셋 전 점 잔존', () => {
  const BASE = 1_700_000_000_000;
  const S = 1000;
  const SERIES = { s1: { name: 's1', pointSize: 4, color: '#FF0000', pointFill: '#FF0000' } };
  const options = {
    type: 'scatter',
    width: '600px',
    height: '400px',
    axesX: [{ type: 'time', timeFormat: 'HH:mm:ss', interval: { time: 60, unit: 'second' } }],
    axesY: [{ type: 'linear', range: [0, 100] }],
    realTimeScatter: { use: true, range: 300 },
    legend: { show: false },
    tooltip: { use: false },
  };

  // 리셋 전 점은 y=50, 리셋 뒤 점은 y=10 — 화면 세로 대역으로 둘을 가른다.
  const oldPoints = Array.from({ length: 20 }, (_, i) => ({ x: BASE + i * 5 * S, y: 50 }));
  const newPoints = (sec) =>
    Array.from({ length: 5 }, (_, i) => ({ x: BASE + (sec + i * 0.2) * S, y: 10 }));

  const settle = async () => {
    await new Promise((r) => setTimeout(r, 80));
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    await new Promise((r) => setTimeout(r, 40));
  };

  const redByBand = (container) => {
    const canvas = container.querySelector('canvas:not(.overlay-canvas)');
    const img = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
    const { width, height } = canvas;
    const bands = { old: 0, fresh: 0 };
    for (let i = 0; i < img.length; i += 4) {
      const isRed = img[i + 3] > 128 && img[i] > 200 && img[i + 1] < 80 && img[i + 2] < 80;
      if (isRed) {
        const row = Math.floor(i / 4 / width);
        if (row > height * 0.35 && row < height * 0.6) bands.old++;
        else if (row >= height * 0.7) bands.fresh++;
      }
    }
    return bands;
  };

  const mountWithOldPoints = async () => {
    const view = render(EvChart, {
      props: { data: { series: SERIES, data: { s1: oldPoints } }, options },
    });
    await settle();
    expect(redByBand(view.container).old).toBeGreaterThan(0);
    return view;
  };

  afterEach(() => {
    window.__EVUI_BLIT_FORCE_OFF__ = false;
  });

  it('리셋과 같은 tick 에 링을 전진시키는 새 점이 오면 리셋 전 점은 지워지고 새 점만 그려진다', async () => {
    const { container, rerender } = await mountWithOldPoints();

    await rerender({
      data: { series: SERIES, data: { s1: newPoints(101) } },
      options,
      realTimeScatterReset: true,
    });
    await settle();
    await rerender({ data: { series: SERIES, data: { s1: newPoints(103) } }, options });
    await settle();

    const bands = redByBand(container);
    expect(bands.old).toBe(0);
    expect(bands.fresh).toBeGreaterThan(0);
  });

  it('리셋과 같은 tick 에 빈 data 가 와도 리셋 전 점이 남지 않는다', async () => {
    const { container, rerender } = await mountWithOldPoints();

    await rerender({ data: { series: SERIES, data: {} }, options, realTimeScatterReset: true });
    await settle();

    expect(redByBand(container).old).toBe(0);
  });
});
