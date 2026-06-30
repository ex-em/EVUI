import { describe, it, expect, afterEach } from 'vitest';
import { render } from 'vitest-browser-vue';
import EvChart from './Chart.vue';

/**
 * realtime scatter 좌단(맨 왼쪽) 결손 회귀 — 실제 canvas(browser).
 *
 * 배경(버그): X축 좌단 graphMin = fromTime = toTime - range*1000 인데, 링 버퍼가 실제 보유한
 * 가장 오래된 버킷은 toTime - (range-1)*1000 (= fromTime + 1000) 이다. 즉 축 좌단이 보유 데이터보다
 * 1버킷(1초) 더 왼쪽이라 맨 왼쪽 ~1초(약 1버킷 폭)가 항상 빈다. full redraw 는 이 빈 구간을 그대로
 * 비우고(좌단 결손), blit 은 윈도우 밖으로 밀려난 점의 고스트로 가려 틱마다 좌단이 깜빡인다.
 *
 * 이 테스트는 blit 고스트에 가려지지 않도록 full redraw(__EVUI_BLIT_FORCE_OFF__) 로, 가장 오래된
 * 버킷까지 데이터가 채워진 상태에서 plot 좌단(xsp) 컬럼에 데이터가 그려지는지 검증한다.
 */
describe('EvChart realtime scatter 좌단 결손 회귀', () => {
  const RANGE = 50;
  const BASE = 1_700_000_000_000;
  const POINT = 1;

  // 두 series 가 동일 x-grid 를 공유(정렬). 초기 적재는 윈도우의 가장 오래된 버킷까지 촘촘히 채운다.
  const genData = (baseMs, n, spanMs) => {
    const series1 = [];
    const series2 = [];
    for (let i = 0; i < n; i++) {
      const x = baseMs - Math.floor((i / Math.max(1, n)) * spanMs);
      series1.push({ x, y: 5 + ((i * 37) % 90) });
      series2.push({ x, y: 5 + ((i * 53) % 90) });
    }
    return {
      series: {
        series1: { name: 's1', pointSize: POINT, color: '#DF6264', pointFill: '#DF6264' },
        series2: { name: 's2', pointSize: POINT, color: '#3CA0FF', pointFill: '#3CA0FF' },
      },
      data: { series1, series2 },
    };
  };

  // 가장 오래된 보유 버킷(toTime-(RANGE-1)*1000)까지 덮도록 초기 적재 폭을 (RANGE-1)초로 둔다.
  const FULL_SPAN = (RANGE - 1) * 1000;
  const TICK_SPAN = 3000;

  const options = {
    type: 'scatter',
    width: '600px',
    height: '400px',
    padding: { top: 20, right: 2, bottom: 4, left: 2 },
    axesX: [
      {
        type: 'time',
        timeFormat: 'HH:mm:ss',
        interval: { time: 10, unit: 'second' },
        showAxis: true,
        showGrid: false,
        labelStyle: { show: true, fontSize: 12 },
      },
    ],
    axesY: [
      {
        type: 'linear',
        range: [0, 100],
        showAxis: true,
        showGrid: false,
        labelStyle: { show: true, fontSize: 12 },
      },
    ],
    realTimeScatter: { use: true, range: RANGE },
    legend: { show: false },
    tooltip: { use: false },
    seriesReverse: true,
  };

  const settle = async () => {
    await new Promise((r) => setTimeout(r, 60));
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    await new Promise((r) => setTimeout(r, 40));
  };

  afterEach(() => {
    window.__EVUI_BLIT_FORCE_OFF__ = false;
    window.__EVUI_BLIT_DEBUG__ = false;
  });

  it('full redraw 에서 plot 좌단(xsp) 에 데이터가 그려진다(좌단 1버킷 결손 없음)', async () => {
    window.__EVUI_BLIT_FORCE_OFF__ = true; // 고스트 배제 — 좌단 결손을 그대로 검증
    window.__EVUI_BLIT_DEBUG__ = true;
    const { container, rerender } = render(EvChart, {
      props: { data: genData(BASE, 1500, FULL_SPAN), options },
    });
    await settle();
    for (let t = 1; t <= 4; t++) {
      // eslint-disable-next-line no-await-in-loop
      await rerender({ data: genData(BASE + t * 3000, 300, TICK_SPAN), options });
      // eslint-disable-next-line no-await-in-loop
      await settle();
    }

    const ec = window.__EVUI_BLIT_CHART__;
    const pr = ec.pixelRatio;
    const cr = ec.chartRect;
    const lo = ec.labelOffset;
    const xsp = (cr.x1 + lo.left) * pr;
    const xArea = (cr.chartWidth - lo.left - lo.right) * pr;
    const plotTop = (cr.y2 - lo.bottom - (cr.chartHeight - lo.top - lo.bottom)) * pr;
    const plotBot = (cr.y2 - lo.bottom) * pr;
    const pxPerBucket = xArea / RANGE;

    const canvas = container.querySelector('canvas:not(.overlay-canvas)');
    const img = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
    const w = canvas.width;
    const y0 = Math.round(plotTop + 1);
    const y1 = Math.round(plotBot - 1);
    // red/blue 데이터 픽셀만(축/그리드 제외)
    const dataCount = (x) => {
      let c = 0;
      for (let y = y0; y < y1; y++) {
        const i = (y * w + x) * 4;
        if (img[i + 3] < 32) {
          // eslint-disable-next-line no-continue
          continue;
        }
        const r = img[i];
        const b = img[i + 2];
        if (r > b + 40 || b > r + 40) c++;
      }
      return c;
    };
    // 좌단에서 첫 데이터 컬럼까지의 오프셋(px)
    let firstDataOffset = -1;
    const xStart = Math.round(xsp);
    for (let x = xStart; x < xStart + Math.ceil(pxPerBucket) + 6; x++) {
      if (dataCount(x) >= 20 && firstDataOffset < 0) {
        firstDataOffset = x - xStart;
        break;
      }
    }

    const ctx = `firstDataOffset=${firstDataOffset}px, pxPerBucket=${pxPerBucket.toFixed(1)}`;
    // 좌단 데이터가 xsp 근처(< 절반 버킷)에서 시작해야 한다. 1버킷 결손이면 ~pxPerBucket 만큼 비어 RED.
    expect(firstDataOffset, `좌단 결손 — ${ctx}`).toBeGreaterThanOrEqual(0);
    expect(firstDataOffset, `좌단 1버킷 결손 — ${ctx}`).toBeLessThan(pxPerBucket * 0.5);
  });
});
