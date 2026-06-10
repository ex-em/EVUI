import { describe, it, expect, afterEach } from 'vitest';
import { render } from 'vitest-browser-vue';
import EvChart from './Chart.vue';

/**
 * realtime scatter blit — 2-series 밀집 환경의 색 등가 + hit-test 좌표 복구 검증.
 *
 * golden(점유 그리드) 테스트는 알파 점유만 비교해 "어느 series 색이 위에 오는가"를 보지 못한다.
 * 2 series 가 같은 좌표에 겹칠 때 blit strip 경로가 full 과 다른 색 합성을 만들면 화면상 다른
 * series 색이 새어 나오는데, 이 색 등가를 데모와 동일한 조건(2 series, pointSize 1, 정수 ms x,
 * grid/legend on)으로 검증한다. 더불어 blit 누적 후 tooltip 좌표가 복구되는지도 확인한다.
 */
describe('EvChart realtime scatter blit 2-series color/hit-test', () => {
  const RANGE = 300;
  const BASE = 1_700_000_000_000;
  const FULL_SPAN = 300000;
  const TICK_SPAN = 3000;

  // 데모와 동형: x 정수 ms, y = int(3000..95000)/1000 (init 은 3000..57000), 50:50 의사난수 분배.
  const genData = (baseMs, n, spanMs, yMaxMilli) => {
    // 두 series 모두 toTime 산출 기준(max x)이 같은 초에 들어가도록 앵커 점을 둔다 —
    // 어긋나면 areBlitSeriesAligned 가 매 틱 full 폴백시켜 blit 경로가 검증되지 않는다.
    const s1 = [{ x: baseMs - 1, y: 50 }];
    const s2 = [{ x: baseMs - 2, y: 50 }];
    for (let i = 0; i < n; i++) {
      const h = (i * 2654435761) >>> 0;
      const x = baseMs - 3 - (h % (spanMs - 2)); // 항상 앵커(x=baseMs-1/-2)보다 과거
      const y = (3000 + ((i * 7919) % (yMaxMilli - 3000 + 1))) / 1000;
      if ((h >>> 13) & 1) {
        s1.push({ x, y });
      } else {
        s2.push({ x, y });
      }
    }
    return {
      series: {
        series1: {
          name: 'series1',
          pointSize: 1,
          color: '#DF6264',
          pointFill: '#DF6264',
          overflowColor: '#FF00FF',
        },
        series2: {
          name: 'series2',
          pointSize: 1,
          color: '#3CA0FF',
          pointFill: '#3CA0FF',
          overflowColor: '#A3D3FF',
        },
      },
      data: { series1: s1, series2: s2 },
    };
  };

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
        axisLineColor: '#C9CFDC',
        labelStyle: { show: true, fontSize: 12, color: '#25262E', fitDir: 'right' },
      },
    ],
    axesY: [
      {
        type: 'linear',
        showAxis: true,
        startToZero: false,
        showGrid: true,
        axisLineColor: '#C9CFDC',
        gridLineColor: '#C9CFDC',
        labelStyle: {
          show: true,
          fontSize: 12,
          color: '#25262E',
          fitWidth: false,
          fitDir: 'right',
        },
        range: [0, 100],
      },
    ],
    tooltip: { use: true, formatter: ({ y }) => `${y}` },
    legend: { show: true, position: 'bottom', padding: { top: 0, left: 0 }, height: 32 },
    displayOverflow: true,
    realTimeScatter: { use: true, range: RANGE },
    seriesReverse: true,
  };

  const settle = async () => {
    await new Promise((r) => setTimeout(r, 60));
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    await new Promise((r) => setTimeout(r, 40));
  };

  const getDisplayImageData = (container) => {
    const canvas = container.querySelector('canvas:not(.overlay-canvas)');
    const ctx = canvas.getContext('2d');
    return {
      data: ctx.getImageData(0, 0, canvas.width, canvas.height),
      w: canvas.width,
      h: canvas.height,
    };
  };

  // plot 내부(좌측 라벨/상단 padding/하단 축·legend 제외)
  const PLOT_REGION = { x0: 0.1, x1: 0.99, y0: 0.07, y1: 0.82 };

  // 픽셀 분류: 1=red(s1 #DF6264), 2=blue(s2 #3CA0FF), 0=배경/그리드/모호
  const classify = ({ data, w, h }, region) => {
    const x0 = Math.floor(region.x0 * w);
    const x1 = Math.ceil(region.x1 * w);
    const y0 = Math.floor(region.y0 * h);
    const y1 = Math.ceil(region.y1 * h);
    const d = data.data;
    const out = new Uint8Array(w * h);
    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        const i = (y * w + x) * 4;
        if (d[i + 3] < 32) {
          // eslint-disable-next-line no-continue
          continue;
        }
        const r = d[i];
        const b = d[i + 2];
        if (r > b + 40) {
          out[y * w + x] = 1;
        } else if (b > r + 40) {
          out[y * w + x] = 2;
        }
      }
    }
    return out;
  };

  const compare = (golden, blit) => {
    const g = classify(golden, PLOT_REGION);
    const b = classify(blit, PLOT_REGION);
    const w = golden.w;
    const gColBlue = new Uint32Array(w);
    const bColBlue = new Uint32Array(w);
    let gRed = 0;
    let gBlue = 0;
    let bRed = 0;
    let bBlue = 0;
    let redToBlue = 0;
    let blueToRed = 0;
    for (let i = 0; i < g.length; i++) {
      if (g[i] === 1) {
        gRed++;
      } else if (g[i] === 2) {
        gBlue++;
        gColBlue[i % w]++;
      }
      if (b[i] === 1) {
        bRed++;
      } else if (b[i] === 2) {
        bBlue++;
        bColBlue[i % w]++;
      }
      if (g[i] === 1 && b[i] === 2) {
        redToBlue++;
      } else if (g[i] === 2 && b[i] === 1) {
        blueToRed++;
      }
    }
    // 세로줄 검출: x 컬럼별 blue 픽셀 수의 최댓값. blit 의 strip 경계 결손/오염은
    // 특정 컬럼에 blue 가 세로로 정렬되는 줄무늬 형태로 나타난다.
    const gColMax = Math.max(...gColBlue);
    const bColMax = Math.max(...bColBlue);
    const gRatio = gBlue / Math.max(1, gRed + gBlue);
    const bRatio = bBlue / Math.max(1, bRed + bBlue);
    const summary =
      `golden red=${gRed} blue=${gBlue} (blue율 ${gRatio.toFixed(4)}, colMax ${gColMax}) / ` +
      `blit red=${bRed} blue=${bBlue} (blue율 ${bRatio.toFixed(4)}, colMax ${bColMax}) / ` +
      `red→blue ${redToBlue}px (${(redToBlue / Math.max(1, gRed)).toFixed(4)}) / ` +
      `blue→red ${blueToRed}px`;
    return { gRatio, bRatio, redToBlue, blueToRed, gRed, gColMax, bColMax, summary };
  };

  const assertNoColorBleed = (m) => {
    // ① 총량: blit 의 blue 비율이 golden 대비 1.3x 초과면 색 오염.
    expect(
      m.bRatio,
      `blit blue율 ${m.bRatio.toFixed(4)} vs golden ${m.gRatio.toFixed(4)} — ${m.summary}`,
    ).toBeLessThan(Math.max(m.gRatio * 1.3, 0.002));
    // ② 세로줄: blit 의 컬럼별 blue 최댓값이 golden 의 2배 + 5px 를 넘으면 strip 경계 줄무늬.
    expect(m.bColMax, `세로 blue 줄무늬 — ${m.summary}`).toBeLessThanOrEqual(m.gColMax * 2 + 5);
    // ③ 픽셀 뒤집힘 비대칭: ±1px 재양자화 지터는 양방향 대칭으로 발생하며 비가시적(blit 설계
    //    허용 오차). 절대량은 데이터 밀도에 비례하므로 임계로 쓰지 않고, 한쪽으로 쏠리면(비대칭)
    //    실제 색 오염이므로 양방향 균형만 단언한다.
    expect(m.redToBlue, `red→blue 가 blue→red 대비 과도(비대칭 오염) — ${m.summary}`).toBeLessThan(
      Math.max(200, m.blueToRed * 1.6),
    );
    expect(m.blueToRed, `blue→red 가 red→blue 대비 과도(비대칭 오염) — ${m.summary}`).toBeLessThan(
      Math.max(200, m.redToBlue * 1.6),
    );
  };

  afterEach(() => {
    window.__EVUI_BLIT_FORCE_OFF__ = false;
    window.__EVUI_BLIT_REFRESH_INTERVAL__ = undefined;
  });

  it('소수 폭 + gap 지터 + 실스케일(60k/6k) 장기(24틱)에서 blit 색 구성이 full(golden) 과 동급이다', async () => {
    // 실데모 조건 재현: resizable-wrapper 의 소수 CSS 폭, setTimeout 드리프트로 gapCount 3/4 교차,
    // 100k/8k 급 밀도, 장기 누적. width '100%' 호스트로 소수 폭(590.5px)을 강제한다.
    const Host = {
      components: { EvChart },
      props: ['data', 'options'],
      template:
        '<div style="width: 590.5px; height: 401.5px;">' +
        '<ev-chart :data="data" :options="options" /></div>',
    };
    const fluidOptions = { ...options, width: '100%', height: '100%' };
    const runStress = async (forceOff) => {
      window.__EVUI_BLIT_FORCE_OFF__ = forceOff;
      const { container, rerender } = render(Host, {
        props: { data: genData(BASE, 60000, FULL_SPAN, 57000), options: fluidOptions },
      });
      await settle();
      let now = BASE;
      for (let t = 1; t <= 24; t++) {
        now += t % 2 ? 3000 : 4000; // gapCount 3/4 교차(실제 setTimeout 드리프트 모사)
        // eslint-disable-next-line no-await-in-loop
        await rerender({ data: genData(now, 6000, TICK_SPAN, 95000), options: fluidOptions });
        // eslint-disable-next-line no-await-in-loop
        await settle();
      }
      return getDisplayImageData(container);
    };

    window.__EVUI_BLIT_REFRESH_INTERVAL__ = 100000;
    const golden = await runStress(true);
    window.__EVUI_BLIT_DEBUG__ = true;
    window.__EVUI_BLIT_DIAG__ = undefined;
    const blit = await runStress(false);
    // blit 이 실제로 실행됐는지 확인 — 폴백만 하면 비교가 무의미하다.
    const diag = window.__EVUI_BLIT_DIAG__;
    expect(diag?.blitted ?? 0, `blit 미실행: diag=${JSON.stringify(diag)}`).toBeGreaterThan(15);
    window.__EVUI_BLIT_DEBUG__ = false;
    assertNoColorBleed(compare(golden, blit));
  }, 120000);

  it('blit 누적으로 어긋난 hit-test 좌표(xp)가 지연 재계산으로 복구된다', async () => {
    window.__EVUI_BLIT_REFRESH_INTERVAL__ = 100000;
    window.__EVUI_BLIT_DEBUG__ = true;
    window.__EVUI_BLIT_FORCE_OFF__ = false;
    const { rerender } = render(EvChart, {
      props: { data: genData(BASE, 2000, FULL_SPAN, 57000), options },
    });
    await settle();
    const anchorX = BASE + 3000 - 1; // tick1 의 series1 앵커 점
    for (let t = 1; t <= 8; t++) {
      // eslint-disable-next-line no-await-in-loop
      await rerender({ data: genData(BASE + t * 3000, 200, TICK_SPAN, 95000), options });
      // eslint-disable-next-line no-await-in-loop
      await settle();
    }
    const ec = window.__EVUI_BLIT_CHART__;
    window.__EVUI_BLIT_DEBUG__ = false;
    expect(ec, 'debug 차트 핸들 없음').toBeTruthy();
    expect(window.__EVUI_BLIT_DIAG__?.blitted ?? 0, 'blit 미실행 — 시나리오 무효').toBeGreaterThan(
      5,
    );

    // tick1 앵커 item: xp 는 tick1 시점 strip 에서 마지막으로 계산됐다(이후 7틱 동안 스테일).
    const dataGroup = ec.seriesList.series1.data.series1.dataGroup;
    let item = null;
    for (let i = 0; i < dataGroup.length; i++) {
      const arr = dataGroup[i]?.data ?? [];
      for (let j = 0; j < arr.length; j++) {
        if (arr[j].x === anchorX) {
          item = arr[j];
        }
      }
    }
    expect(item, '앵커 점을 못 찾음').toBeTruthy();

    const sx = ec.axesSteps.x[0];
    const xArea = ec.chartRect.chartWidth - (ec.labelOffset.left + ec.labelOffset.right);
    const xsp = ec.chartRect.x1 + ec.labelOffset.left;
    const pxPerMs = xArea / (sx.graphMax - sx.graphMin);
    const expected = xsp + (anchorX - sx.graphMin) * pxPerMs;

    // 스테일 증명: 앵커는 dirty 윈도우(가변, ~9버킷)를 벗어난 뒤 재계산되지 않으므로
    // 최소 3틱(9초) 어치 이상 오른쪽에 남아 있어야 한다.
    const staleXp = item.xp;
    expect(staleXp - expected, `stale=${staleXp} expected=${expected.toFixed(1)}`).toBeGreaterThan(
      3 * 3000 * pxPerMs * 0.8,
    );

    // 지연 재계산(hit-test 진입 시 호출되는 경로) → 현재 축 매핑과 일치(ceil/alias ±2px).
    ec.ensureHitCoordsFresh();
    expect(
      Math.abs(item.xp - expected),
      `fresh=${item.xp} expected=${expected.toFixed(1)}`,
    ).toBeLessThanOrEqual(2);
  });
});
