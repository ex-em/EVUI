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
    return { gRatio, bRatio, redToBlue, blueToRed, gRed, gBlue, gColMax, bColMax, summary };
  };

  const assertNoColorBleed = (m) => {
    // ① 총량: blit 의 blue 비율이 golden 대비 1.3x 초과면 색 오염.
    expect(
      m.bRatio,
      `blit blue율 ${m.bRatio.toFixed(4)} vs golden ${m.gRatio.toFixed(4)} — ${m.summary}`,
    ).toBeLessThan(Math.max(m.gRatio * 1.3, 0.002));
    // ② 세로줄: blit 의 컬럼별 blue 최댓값이 golden 의 2배 + 5px 를 넘으면 strip 경계 줄무늬.
    expect(m.bColMax, `세로 blue 줄무늬 — ${m.summary}`).toBeLessThanOrEqual(m.gColMax * 2 + 5);
    // ③ 픽셀 뒤집힘 총량 바운드. golden 을 blit 과 *동일 carry* 로 캡처하므로(아래 본문) 점 위치는
    //    동일하고, 남는 flip 은 순수 겹침 z-order 차이다 — blit 은 누적(나중 틱이 위), full 은 단일
    //    패스 seriesReverse(series1 이 위). 이 차이는 *단방향*(full 의 위 series 가 고정이라 한쪽으로만
    //    뒤집힘, blue→red≈0)이라 예전의 양방향 대칭 가정은 더 이상 성립하지 않는다(append-only 의
    //    구조적 특성 — legend hover 는 series 를 격리해 그려 겹침이 없으므로 사용자 시나리오엔 비가시).
    //    gross 색 오염은 ①(blue율)·②(colMax)가 잡고, 여기선 전체 flip 이 데이터의 작은 비율인지만 본다.
    const flips = m.redToBlue + m.blueToRed;
    const flipBudget = Math.round((m.gRed + m.gBlue) * 0.015);
    expect(
      flips,
      `색 flip 총량 과다(${flips}px / 데이터 ${m.gRed + m.gBlue}px) — ${m.summary}`,
    ).toBeLessThanOrEqual(flipBudget);
  };

  // 세로 흰줄(comb) 직접 가드. 기존 가드(color bleed=과밀, occupancy cell=3)는 1px 흰줄을 못 잡는다
  // — 원래 comb 가 그 스펙들을 통과하며 ship 된 이유다. 이 가드가 comb 회귀의 직접 방어선이다.
  //
  // 흰줄 = "고립된 빈 컬럼"(양옆은 밀집인데 자기만 결손). golden(full redraw)도 데이터/축 매핑 고유
  // gap 이 약간 있으므로(절대 0 이 아님), blit 의 고립 gap 수가 golden 대비 늘지 않았는지로 본다.
  // 이 검출은 blit 의 ±1px 전역 시프트 드리프트(설계 허용 오차 — 데이터는 다 있고 위치만 <1px 이동)에
  // 불변이다: 밀도 프로파일이 통째로 1px 평행이동해도 고립 gap 형상은 보존된다. golden 과 컬럼을 1:1
  // 비교하면 그 1px 드리프트가 거짓 결손으로 잡히므로, 반드시 각자 내부의 고립 gap 수로 비교한다.
  const isolatedGapCount = (cls, w) => {
    const x0 = Math.floor(PLOT_REGION.x0 * w);
    const x1 = Math.ceil(PLOT_REGION.x1 * w);
    const col = new Uint32Array(w);
    for (let i = 0; i < cls.length; i++) {
      if (cls[i]) col[i % w]++;
    }
    const vals = [];
    for (let x = x0; x < x1; x++) {
      if (col[x] > 0) vals.push(col[x]);
    }
    vals.sort((a, c) => a - c);
    const med = vals.length ? vals[Math.floor(vals.length / 2)] : 0;
    if (med <= 8) {
      return { count: 0, med, cols: [] };
    }
    const gaps = [];
    for (let x = x0 + 2; x < x1 - 2; x++) {
      const left = Math.max(col[x - 1], col[x - 2]);
      const right = Math.max(col[x + 1], col[x + 2]);
      if (col[x] < med * 0.12 && left > med * 0.5 && right > med * 0.5) {
        gaps.push(x);
      }
    }
    return { count: gaps.length, med, cols: gaps };
  };
  const assertNoWhiteLine = (golden, blit) => {
    const w = golden.w;
    const g = isolatedGapCount(classify(golden, PLOT_REGION), w);
    const b = isolatedGapCount(classify(blit, PLOT_REGION), w);
    // blit 의 고립 gap 이 golden 대비 +2 이상 늘면 blit 특이 흰줄(comb) 회귀.
    expect(
      b.count,
      `blit 세로 흰줄(comb) — golden gap=${g.count}(med ${g.med}) vs blit gap=${b.count}(med ${b.med}) ` +
        `cols=${JSON.stringify(b.cols.slice(0, 12))}`,
    ).toBeLessThanOrEqual(g.count + 2);
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
    // blit 으로 24틱 누적 → blit 라스터 캡처 → 같은 인스턴스를 force-off + 동일 데이터 재렌더해
    // golden(full redraw) 캡처. golden 은 blit 과 *동일 carry 위상*에서 그려지므로 점 위치는 일치하고
    // owner/z-order 색 합성만 차이날 수 있다 — 이 스펙의 본래 목적(색 오염). 독립 force-off 스트림
    // (carry=0)과 비교하면 정수-CSS 시프트의 sub-pixel carry 만큼 경계 컬럼 위상이 달라 거짓 stripe 가
    // 잡힌다(blit↔full 위치 동등은 chart.blit.equiv.visual.spec.js 가 exactDiff 로 직접 단언).
    window.__EVUI_BLIT_REFRESH_INTERVAL__ = 100000;
    window.__EVUI_BLIT_FORCE_OFF__ = false;
    window.__EVUI_BLIT_DEBUG__ = true;
    window.__EVUI_BLIT_DIAG__ = undefined;
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
    const blit = getDisplayImageData(container);
    // blit 이 실제로 실행됐는지 확인 — 폴백만 하면 비교가 무의미하다.
    const diag = window.__EVUI_BLIT_DIAG__;
    expect(diag?.blitted ?? 0, `blit 미실행: diag=${JSON.stringify(diag)}`).toBeGreaterThan(15);

    // golden: 동일 누적 상태(carry 보존)를 full redraw. 데이터 idempotent(toTime 불변, dataKeys dedupe).
    window.__EVUI_BLIT_FORCE_OFF__ = true;
    await rerender({ data: genData(now, 6000, TICK_SPAN, 95000), options: fluidOptions });
    await settle();
    const golden = getDisplayImageData(container);

    window.__EVUI_BLIT_DEBUG__ = false;
    assertNoColorBleed(compare(golden, blit));
    assertNoWhiteLine(golden, blit);
    // cross-series dedupe(owner-map) 복원으로 60k seed 워크로드가 무거워져 240s 로 상향(#2308 리뷰 후속).
  }, 240000);

  it('hollow 마커(cross/star) + cross-series 동일좌표: blit strip dedupe 가 owner 만 그려 full 과 일치', async () => {
    // strip cross-series dedupe(collectStripDuplicatePoints)가 실효를 갖는 유일 케이스 가드.
    // opaque solid 마커는 합성 z-order 가 owner-dedupe 와 같지만, hollow(stroke-only: cross/star)는
    // 위 series 마커의 빈 곳으로 아래 series 가 비친다 → owner 외 series 를 안 그려야 full(dedupe)과 일치.
    // 두 series 에 *동일 좌표* 점을 넣는다(coordinateDedupe on, seriesReverse → series1=red 가 owner).
    // owner=red cross(작은 마커), 비-owner=blue star(큰 마커: cross + 대각선) — owner 가 비-owner 를
    // 덮지 못하므로, dedupe 가 없으면 blue star 의 대각선이 새어 나온다. blit 라스터에 그 blue 누출이
    // 없는지 검증한다(strip dedupe 를 빼면 실패 — 이 케이스가 strip dedupe 의 유일한 실효 지점).
    const RANGE2 = 60;
    const hollowOptions = { ...options, realTimeScatter: { use: true, range: RANGE2 } };
    const genHollow = (toMs) => {
      // 신규 점은 최신 ~1버킷에 집중(maxDirtyAge 작게 → late-arrival 가드 통과). 매 틱 시프트로 누적.
      const pts = [{ x: toMs - 1, y: 50 }];
      for (let i = 0; i < 24; i++) {
        const h = (i * 2654435761) >>> 0;
        const x = toMs - 2 - (h % 900);
        const y = (6000 + ((i * 7919) % 88000)) / 1000;
        pts.push({ x, y });
      }
      return {
        series: {
          series1: {
            name: 'series1',
            pointSize: 6,
            pointStyle: 'cross',
            color: '#DF6264',
            pointFill: '#DF6264',
            overflowColor: '#FF00FF',
          },
          series2: {
            name: 'series2',
            pointSize: 6,
            pointStyle: 'star',
            color: '#3CA0FF',
            pointFill: '#3CA0FF',
            overflowColor: '#A3D3FF',
          },
        },
        data: { series1: [...pts], series2: [...pts] }, // 동일 좌표(coincident)
      };
    };

    window.__EVUI_BLIT_REFRESH_INTERVAL__ = 100000;
    window.__EVUI_BLIT_FORCE_OFF__ = false;
    window.__EVUI_BLIT_DEBUG__ = true;
    window.__EVUI_BLIT_DIAG__ = undefined;

    const { container, rerender } = render(EvChart, {
      props: { data: genHollow(BASE), options: hollowOptions },
    });
    await settle();
    let now = BASE;
    for (let t = 1; t <= 12; t++) {
      now += 1000;
      // eslint-disable-next-line no-await-in-loop
      await rerender({ data: genHollow(now), options: hollowOptions });
      // eslint-disable-next-line no-await-in-loop
      await settle();
    }
    const blit = getDisplayImageData(container);
    const diag = window.__EVUI_BLIT_DIAG__;
    expect(diag?.blitted ?? 0, `blit 미실행: diag=${JSON.stringify(diag)}`).toBeGreaterThan(6);

    window.__EVUI_BLIT_FORCE_OFF__ = true;
    await rerender({ data: genHollow(now), options: hollowOptions });
    await settle();
    const golden = getDisplayImageData(container);
    window.__EVUI_BLIT_DEBUG__ = false;

    const m = compare(golden, blit);
    // owner=series1(red cross, seriesReverse → 마지막 set). golden 은 owner-only 라 blue(series2 star)
    // 거의 0. strip dedupe 가 빠지면 blit 에 blue star 대각선이 새어 blit blue율이 급증한다 →
    // assertNoColorBleed(blit blue율 < golden×1.3, flip 총량 바운드)가 실패한다. owner red 렌더도 확인.
    expect(m.gRed, `owner(red star) 미렌더(빈 비교 방지) — ${m.summary}`).toBeGreaterThan(50);
    assertNoColorBleed(m);
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
