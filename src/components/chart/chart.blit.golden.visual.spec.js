import { describe, it, expect, afterEach } from 'vitest';
import { render } from 'vitest-browser-vue';
import EvChart from './Chart.vue';

/**
 * realtime scatter blit fast-path 출력 동일성(golden equivalence) 검증 — 실제 canvas(browser).
 *
 * 동일한 결정적 데이터 시퀀스를
 *   (A) blit-path (window.__EVUI_BLIT_FORCE_OFF__ = false)
 *   (B) 강제 full redraw (window.__EVUI_BLIT_FORCE_OFF__ = true, golden 기준)
 * 로 각각 렌더해 displayCanvas 픽셀을 비교한다.
 *
 * blit 은 시프트 잔차로 점 위치가 full 대비 ±1px 까지 어긋날 수 있어(설계 허용 오차),
 * raw 픽셀 동일성 대신 pointSize 5 + 점유 그리드(occupancy) 근접 매칭으로 비교한다.
 *  - Test A: blit vs golden → 근접 커버리지(드리프트 허용) 임계 이상.
 *  - Test B: 18틱 순수 blit 누적 후에도 plot 내부 drift 가 허용 범위 유지.
 */
describe('EvChart realtime scatter blit golden equivalence', () => {
  const RANGE = 60; // window seconds
  const BASE = 1_700_000_000_000;

  // spanMs: baseMs 에서 과거로 점을 분포시킬 폭. 초기 적재는 윈도우 전체, 틱은 최근 구간만
  // (실제 realtime scatter 와 동일 — 신규 데이터는 최근 시간대에만 도착).
  const genData = (baseMs, n, spanMs) => {
    const series1 = [];
    for (let i = 0; i < n; i++) {
      const x = baseMs - Math.floor((i / Math.max(1, n)) * spanMs);
      // 결정적이지만 분포가 있는 y (고정 범위 [0,100] 안)
      const y = 5 + ((i * 37) % 90);
      series1.push({ x, y });
    }
    return { series: { series1: { name: 's1', pointSize: 5 } }, data: { series1 } };
  };

  const FULL_SPAN = (RANGE - 1) * 1000; // 초기 적재 폭
  const TICK_SPAN = 3000; // 틱당 신규 데이터 폭(최근 3초)

  const options = {
    type: 'scatter',
    width: '600px',
    height: '400px',
    padding: { top: 20, right: 4, bottom: 4, left: 44 },
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
        showGrid: false, // grid off → plot 내용 = 점뿐(비교 신호 명확)
        labelStyle: { show: true, fontSize: 12 },
      },
    ],
    realTimeScatter: { use: true, range: RANGE },
    legend: { show: false },
    tooltip: { use: false },
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

  // 점유 그리드: cell 안에 알파>임계 픽셀이 하나라도 있으면 occupied.
  // region(0~1 비율)을 주면 그 사각형 안의 픽셀만 센다(좌측 라벨/하단 축 제외 → 점 drift 신호 격리).
  const occupancy = ({ data, w, h }, cell, region) => {
    const x0 = Math.floor((region?.x0 ?? 0) * w);
    const x1 = Math.ceil((region?.x1 ?? 1) * w);
    const y0 = Math.floor((region?.y0 ?? 0) * h);
    const y1 = Math.ceil((region?.y1 ?? 1) * h);
    const cols = Math.ceil(w / cell);
    const rows = Math.ceil(h / cell);
    const grid = new Uint8Array(cols * rows);
    const d = data.data;
    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        if (d[(y * w + x) * 4 + 3] > 16) {
          grid[Math.floor(y / cell) * cols + Math.floor(x / cell)] = 1;
        }
      }
    }
    return { grid, cols, rows };
  };

  // a 의 occupied cell 중 b 에서 같은/이웃(±1) cell 이 occupied 인 비율.
  const proximityCoverage = (a, b) => {
    let total = 0;
    let matched = 0;
    for (let r = 0; r < a.rows; r++) {
      for (let c = 0; c < a.cols; c++) {
        if (!a.grid[r * a.cols + c]) {
          // eslint-disable-next-line no-continue
          continue;
        }
        total++;
        let hit = false;
        for (let dr = -1; dr <= 1 && !hit; dr++) {
          for (let dc = -1; dc <= 1 && !hit; dc++) {
            const rr = r + dr;
            const cc = c + dc;
            if (rr >= 0 && rr < b.rows && cc >= 0 && cc < b.cols && b.grid[rr * b.cols + cc]) {
              hit = true;
            }
          }
        }
        if (hit) {
          matched++;
        }
      }
    }
    return total === 0 ? 1 : matched / total;
  };

  // forceOff: 매 틱 강제 full 여부(true=golden 기준 프레임).
  const runScenario = async ({ forceOff, ticks = 6 }) => {
    window.__EVUI_BLIT_FORCE_OFF__ = forceOff;
    const { container, rerender } = render(EvChart, {
      props: { data: genData(BASE, 200, FULL_SPAN), options },
    });
    await settle();
    for (let t = 1; t <= ticks; t++) {
      // eslint-disable-next-line no-await-in-loop
      await rerender({ data: genData(BASE + t * 3000, 50, TICK_SPAN), options });
      // eslint-disable-next-line no-await-in-loop
      await settle();
    }
    return getDisplayImageData(container);
  };

  // 점 구름만 보도록 좌측 라벨/하단 축을 제외한 plot 내부 영역.
  const PLOT_REGION = { x0: 0.16, x1: 0.99, y0: 0.06, y1: 0.9 };

  afterEach(() => {
    window.__EVUI_BLIT_FORCE_OFF__ = false;
    window.__EVUI_BLIT_REFRESH_INTERVAL__ = undefined;
  });

  it('Test A: blit-path 출력이 강제 full(golden) 과 근접 일치한다(드리프트 허용)', async () => {
    const golden = await runScenario({ forceOff: true, ticks: 6 });
    const blit = await runScenario({ forceOff: false, ticks: 6 });

    const cell = 4;
    const gOcc = occupancy(golden, cell);
    const bOcc = occupancy(blit, cell);

    const fwd = proximityCoverage(gOcc, bOcc); // golden 점이 blit 에 존재하나(누락 검출)
    const rev = proximityCoverage(bOcc, gOcc); // blit 점이 golden 에 존재하나(잉여/오위치 검출)

    expect(fwd, `golden→blit coverage ${fwd.toFixed(3)} too low (missing points)`).toBeGreaterThan(
      0.9,
    );
    expect(
      rev,
      `blit→golden coverage ${rev.toFixed(3)} too low (extra/misplaced points)`,
    ).toBeGreaterThan(0.85);
  });

  it('Test B: 장기(18틱) 순수 blit 누적 오차가 plot 내부에서 허용 범위로 유지된다', async () => {
    // 주기적 강제 full 을 사실상 끄고(매우 큰 interval) 순수 blit 누적만 본다.
    // 누적 시프트/carry/seam 로직에 gross 한 누적 버그(예: carry 미적립으로 매 틱 편향 누적,
    // shift 방향 오류)가 있으면 18틱 동안 drift 가 커져 여기서 잡힌다.
    window.__EVUI_BLIT_REFRESH_INTERVAL__ = 100000;
    const golden = await runScenario({ forceOff: true, ticks: 18 });
    const blit = await runScenario({ forceOff: false, ticks: 18 });

    // 좁은 cell(3) + plot 내부 한정 → 점 drift 에 민감.
    const cell = 3;
    const gOcc = occupancy(golden, cell, PLOT_REGION);
    const bOcc = occupancy(blit, cell, PLOT_REGION);

    const fwd = proximityCoverage(gOcc, bOcc);
    const rev = proximityCoverage(bOcc, gOcc);
    expect(fwd, `golden→blit (18틱) ${fwd.toFixed(3)} — drift 누적 의심`).toBeGreaterThan(0.9);
    expect(rev, `blit→golden (18틱) ${rev.toFixed(3)} — drift 누적 의심`).toBeGreaterThan(0.85);
  });

  it('Test C: blit 합성이 plot 좌단(xsp) 점의 좌측 절반을 자르지 않는다(full 과 동일)', async () => {
    // 회귀 배경: compositePointsLayer 가 좌측만 pointSize 마진 없이 xsp 에서 hard-clip 하면
    // 윈도우 좌단(=xsp)에 놓인 점의 좌측 절반이 잘린다. full(직접 drawSeries)은 clip 이 없어
    // 점이 온전하다. Test A/B 의 occupancy 는 PLOT_REGION.x0=0.16 으로 좌단을 제외해 이 회귀를
    // 못 본다. 여기서는 최종 윈도우의 fromTime 버킷(=xsp)에 앵커 점을 고정하고, y축 라벨을 꺼
    // [xsp-pointSize, xsp) 밴드에 점 픽셀만 남긴 뒤 full(golden) 과 blit 의 좌단 점유를 비교한다.
    const POINT = 5;
    const TICKS = 6;
    const finalToTime = BASE + TICKS * 3000; // 최종 틱 max x → toTime (model.store: floor(maxX/1000)*1000)
    const anchorX = finalToTime - RANGE * 1000 + 1; // 최종 fromTime 버킷(=xsp) 안의 점

    const genC = (baseMs, n, spanMs) => {
      const series1 = [{ x: anchorX, y: 50 }]; // 좌단 앵커: 최종 프레임에 xsp 로 매핑
      for (let i = 0; i < n; i++) {
        series1.push({
          x: baseMs - Math.floor((i / Math.max(1, n)) * spanMs),
          y: 5 + ((i * 37) % 90),
        });
      }
      return {
        series: {
          series1: { name: 's1', pointSize: POINT, color: '#E0322F', pointFill: '#E0322F' },
        },
        data: { series1 },
      };
    };

    // y축 라벨 off → [xsp-pointSize, xsp) 밴드에 라벨 텍스트 없이 점 스필만 남는다.
    const optC = {
      ...options,
      axesY: [{ ...options.axesY[0], labelStyle: { show: false } }],
    };

    const runC = async (forceOff) => {
      window.__EVUI_BLIT_FORCE_OFF__ = forceOff;
      window.__EVUI_BLIT_DEBUG__ = true;
      const { container, rerender } = render(EvChart, {
        props: { data: genC(BASE, 200, FULL_SPAN), options: optC },
      });
      await settle();
      for (let t = 1; t <= TICKS; t++) {
        // eslint-disable-next-line no-await-in-loop
        await rerender({ data: genC(BASE + t * 3000, 50, TICK_SPAN), options: optC });
        // eslint-disable-next-line no-await-in-loop
        await settle();
      }
      return { img: getDisplayImageData(container), ec: window.__EVUI_BLIT_CHART__ };
    };

    const golden = await runC(true);
    window.__EVUI_BLIT_DIAG__ = undefined;
    const blit = await runC(false);
    window.__EVUI_BLIT_DEBUG__ = false;

    // blit 이 실제로 실행됐는지 확인 — 폴백만 하면 full-vs-full 비교라 회귀를 못 잡는다.
    const diag = window.__EVUI_BLIT_DIAG__;
    expect(diag?.blitted ?? 0, `blit 미실행: diag=${JSON.stringify(diag)}`).toBeGreaterThan(2);

    const ec = blit.ec;
    const pr = ec.pixelRatio;
    const cr = ec.chartRect;
    const lo = ec.labelOffset;
    const xsp = cr.x1 + lo.left;
    const plotBottom = cr.y2 - lo.bottom;
    const plotTop = plotBottom - (cr.chartHeight - (lo.top + lo.bottom));

    const xspDev = Math.round(xsp * pr);
    const bandL = Math.max(0, Math.round((xsp - POINT) * pr));
    const bandR = xspDev - 2; // 축선/AA(@xsp) 제외 → 순수 점 스필만
    const yTop = Math.max(0, Math.round(plotTop * pr));
    const yBot = Math.round(plotBottom * pr);

    const countBand = ({ data, w }) => {
      let c = 0;
      const d = data.data;
      for (let y = yTop; y < yBot; y++) {
        for (let x = bandL; x < bandR; x++) {
          if (d[(y * w + x) * 4 + 3] > 16) {
            c++;
          }
        }
      }
      return c;
    };

    const g = countBand(golden.img);
    const b = countBand(blit.img);
    const ctx = `band ${bandL}..${bandR} (xspDev ${xspDev}) rows ${yTop}..${yBot} / golden=${g} blit=${b}`;

    // 시나리오 유효성: full 은 좌단 점의 좌측 절반을 그린다 → g>0.
    expect(g, `시나리오 무효: golden 좌단 밴드 점유 0 — ${ctx}`).toBeGreaterThan(0);
    // 회귀: blit 도 동등하게 좌단 점이 온전해야 한다(좌측 clip 비대칭이면 b≈0).
    expect(b, `blit 좌단 점 잘림 — ${ctx}`).toBeGreaterThan(g * 0.6);
  });
});
