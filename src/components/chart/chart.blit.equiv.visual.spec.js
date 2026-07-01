import { describe, it, expect, afterEach } from 'vitest';
import { render } from 'vitest-browser-vue';
import EvChart from './Chart.vue';

/**
 * realtime scatter blit ↔ full redraw 픽셀 동등성(pixel-exact equivalence) 가드.
 *
 * 사용자 보고: blit 으로 그리다 legend 영역에 hover 하면 full redraw 로 전환되며 점 구름이 미세하게
 * "스냅"한다(blit_fulldraw.mov). 원인은 blit(정수 device px 시프트)과 full(ceil CSS px 재양자화)이
 * 점마다 ≤1px 어긋나는 것. 수정: blit 을 정수 CSS px 시프트(Bresenham carry)로 바꾸고, full/strip 이
 * 동일 carry 를 startPoint 오프셋으로 반영 + realtime aliasPixel 제거 → 점별 ceil 양자화가 시프트와
 * 교환돼 blit raster ≡ full raster 가 된다.
 *
 * 이 스펙은 같은 인스턴스에서 blit 으로 누적한 라스터와, 그 직후 동일 데이터를 full redraw 한 라스터가
 * plot 영역에서 픽셀 단위로 일치하는지 단언한다. on/off 차이(=점 위치 어긋남, 반드시 0)와 color
 * 차이(=같은 좌표의 owner series 가 다름, ±1px 재양자화로 드물게 발생하는 설계 허용 오차)를 분리한다.
 */
describe('EvChart realtime scatter blit ↔ full redraw 픽셀 동등', () => {
  const settle = async () => {
    await new Promise((r) => setTimeout(r, 60));
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    await new Promise((r) => setTimeout(r, 40));
  };

  const getImageData = (container) => {
    const canvas = container.querySelector('canvas:not(.overlay-canvas)');
    const ctx = canvas.getContext('2d');
    return {
      data: ctx.getImageData(0, 0, canvas.width, canvas.height).data,
      w: canvas.width,
      h: canvas.height,
    };
  };

  // plot 내부(좌측 라벨/상단 padding/하단 축·legend 제외)
  const PLOT = { x0: 0.08, x1: 0.99, y0: 0.07, y1: 0.82 };

  // blit/full 라스터의 plot 영역 비교. onOff = 한쪽만 데이터(=점 위치 어긋남), color = 둘 다 데이터인데
  // 색이 다름(=coincident 좌표 owner 불일치). 위치 어긋남(onOff)이 사용자가 본 스냅이며 0 이어야 한다.
  const exactDiff = (a, b) => {
    const { w, h } = a;
    const x0 = Math.floor(PLOT.x0 * w);
    const x1 = Math.ceil(PLOT.x1 * w);
    const y0 = Math.floor(PLOT.y0 * h);
    const y1 = Math.ceil(PLOT.y1 * h);
    const da = a.data;
    const db = b.data;
    let onOff = 0;
    let color = 0;
    let dataPx = 0;
    const reg = [0, 0, 0]; // 좌/중/우 onOff
    const samples = [];
    const t3 = x0 + (x1 - x0) / 3;
    const t6 = x0 + (2 * (x1 - x0)) / 3;
    // 컬럼별 blue(2번 series 색) 픽셀 수 — 세로 줄무늬(특정 컬럼 집중) 검출용
    const aBlueCol = new Uint32Array(w);
    const bBlueCol = new Uint32Array(w);
    const isBlue = (d, i) => d[i + 3] >= 32 && d[i + 2] > d[i] + 40;
    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        const i = (y * w + x) * 4;
        if (isBlue(da, i)) aBlueCol[x]++;
        if (isBlue(db, i)) bBlueCol[x]++;
        const aOn = da[i + 3] >= 32;
        const bOn = db[i + 3] >= 32;
        if (aOn || bOn) dataPx++;
        if (aOn !== bOn) {
          onOff++;
          let r = 2;
          if (x < t3) {
            r = 0;
          } else if (x < t6) {
            r = 1;
          }
          reg[r]++;
          if (samples.length < 16) {
            samples.push(`(${x},${y})b=${aOn ? 1 : 0}f=${bOn ? 1 : 0}`);
          }
        } else if (
          aOn &&
          bOn &&
          (Math.abs(da[i] - db[i]) > 24 ||
            Math.abs(da[i + 1] - db[i + 1]) > 24 ||
            Math.abs(da[i + 2] - db[i + 2]) > 24)
        ) {
          color++;
        }
      }
    }
    let aBlueColMax = 0;
    let bBlueColMax = 0;
    for (let x = x0; x < x1; x++) {
      if (aBlueCol[x] > aBlueColMax) aBlueColMax = aBlueCol[x];
      if (bBlueCol[x] > bBlueColMax) bBlueColMax = bBlueCol[x];
    }
    return {
      onOff,
      color,
      dataPx,
      reg,
      samples,
      aBlueColMax,
      bBlueColMax,
      bounds: { x0, x1, y0, y1, w, h },
    };
  };

  const mkOptions = (range) => ({
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
        labelStyle: { show: true, fontSize: 12, color: '#25262E' },
      },
    ],
    axesY: [
      {
        type: 'linear',
        showAxis: true,
        startToZero: false,
        showGrid: true,
        gridLineColor: '#C9CFDC',
        labelStyle: { show: true, fontSize: 12, color: '#25262E' },
        range: [0, 100],
      },
    ],
    tooltip: { use: true },
    legend: { show: true, position: 'bottom', height: 32 },
    displayOverflow: true,
    realTimeScatter: { use: true, range },
    seriesReverse: true,
  });

  afterEach(() => {
    window.__EVUI_BLIT_FORCE_OFF__ = false;
    window.__EVUI_BLIT_REFRESH_INTERVAL__ = undefined;
    window.__EVUI_BLIT_DEBUG__ = false;
  });

  const BASE = 1_700_000_000_000;

  it('단일 series: blit 누적 라스터와 legend hover full redraw 가 픽셀 동일하다(range 300)', async () => {
    const TICK = 3000;
    const options = mkOptions(300);
    const genData = (toMs) => {
      const s1 = [{ x: toMs - 1, y: 50 }]; // toTime 앵커
      for (let i = 0; i < 1500; i++) {
        const hsh = (i * 2654435761) >>> 0;
        const x = toMs - 2 - (hsh % (TICK - 2));
        const y = (3000 + ((i * 7919) % (95000 - 3000 + 1))) / 1000;
        s1.push({ x, y });
      }
      return {
        series: {
          series1: { name: 'series1', pointSize: 1, color: '#DF6264', pointFill: '#DF6264' },
        },
        data: { series1: s1 },
      };
    };

    window.__EVUI_BLIT_REFRESH_INTERVAL__ = 100000; // 검증 구간 내 강제 full 금지
    window.__EVUI_BLIT_DEBUG__ = true;
    window.__EVUI_BLIT_DIAG__ = undefined;

    const { container, rerender } = render(EvChart, { props: { data: genData(BASE), options } });
    await settle();

    let now = BASE;
    for (let t = 1; t <= 12; t++) {
      now += TICK;
      // eslint-disable-next-line no-await-in-loop
      await rerender({ data: genData(now), options });
      // eslint-disable-next-line no-await-in-loop
      await settle();
    }
    expect(
      window.__EVUI_BLIT_DIAG__?.blitted ?? 0,
      `blit 미실행: ${JSON.stringify(window.__EVUI_BLIT_DIAG__)}`,
    ).toBeGreaterThan(6);

    const blitRaster = getImageData(container);

    // 사용자 시나리오 그대로: legend hover → full redraw(legendHover 로 blit gate 차단).
    // 단일 series 는 자기 자신이 downplay 되지 않아(getOpacity) 색 불변 → 위치만 비교.
    const ec = window.__EVUI_BLIT_CHART__;
    expect(ec, 'debug 차트 핸들 없음').toBeTruthy();
    ec.highlightSeries('series1');
    await settle();
    const fullRaster = getImageData(container);

    const { onOff, color, dataPx, reg, samples } = exactDiff(blitRaster, fullRaster);
    expect(
      onOff,
      `blit↔full 위치 불일치 ${onOff}px / 데이터 ${dataPx}px 좌=${reg[0]} 중=${reg[1]} 우=${reg[2]} samples=${samples.join(' ')}`,
    ).toBe(0);
    expect(color, `단일 series 는 색 불일치도 0 이어야 함(${color}px)`).toBe(0);
  }, 120000);

  it('반투명(rgba alpha<1) 단일 series: blit 이 실행돼도 drawn-플래그로 점당 1회 raster → 알파 누적 0', async () => {
    // #2 회귀 가드(opacity 를 blit 으로 처리). strip 은 "아직 raster 된 적 없는 점"(item.drawn=false)만
    // 그리고, 시프트로 이미 레이어에 살아 있는 옛 점은 다시 그리지 않는다 → 경계 버킷의 옛 점이 2회
    // 합성되던 over-darken(α→2α-α²)이 소멸한다. 따라서 반투명이어도 blit raster ≡ full redraw(점당 1회).
    // 이 테스트는 ⑴ 반투명에서 blit 이 실제로 실행(blitted>0)되고 ⑵ 알파가 full 과 일치(누적 0)하며
    // ⑶ 위치가 어긋나지 않는지(deferred 점 누락 0) 단언한다. dense 가 아닌 *희소+지터* 데이터라야
    // ⑵(알파 포화로 가려지지 않음)·⑶(지터 없으면 deferred 점이 없어 누락이 안 드러남)을 동시에 잡는다.
    const TICK = 1000;
    const RANGE = 60;
    const options = mkOptions(RANGE);
    const FILL = 'rgba(223,98,100,0.4)';
    // over-darken 은 "age 0 에 그려진 점이 다음 틱 경계 버킷(age 1)에서 재그려질 때"만 난다(점당 2회
    // 합성). 따라서 데이터에 두 종류를 섞는다:
    //  · 정시(x=toMs=floored toTime=graphMax): 도착 틱에 age 0 으로 *그려지고*, 다음 틱 age 1(경계)에서
    //    재그려진다 → 반투명이면 α→2α-α² 누적(redraw-all 회귀의 핵심).
    //  · graphMax 초과(x>toMs): 도착 틱엔 xp=null 로 미뤄졌다가(deferred) 다음 틱 경계에서 *처음* raster.
    //    drawn-플래그가 "push 시점"이 아니라 "raster 시점"을 봐야 이들을 안 빠뜨린다(누락 시 onOff>0).
    // 희소(틱당 정시 5 + deferred 3)+y 분산 → 알파가 포화되지 않아 누적이 보인다. 매 틱 새 슬라이스에만
    // 생성(옛 점은 ring 보존) → maxDirtyAge=0 으로 strip 가드 통과.
    const genData = (toMs) => {
      const tk = Math.round((toMs - BASE) / TICK);
      const s1 = [{ x: toMs + 500, y: 50 }]; // 앵커: floored toTime=toMs, 이번 틱 deferred
      for (let i = 0; i < 8; i++) {
        const hsh = ((tk * 131 + i) * 2654435761) >>> 0;
        const y = 5 + (hsh % 90); // 5..94 분산(세로 격리)
        if (i < 5) {
          s1.push({ x: toMs, y }); // 정시 → age 0 그림 → 다음 틱 경계 재그림 → double-draw 대상
        } else {
          s1.push({ x: toMs + 1 + (hsh % 800), y }); // graphMax 초과 → deferred(다음 틱 첫 raster)
        }
      }
      return {
        series: { series1: { name: 'series1', pointSize: 2, color: FILL, pointFill: FILL } },
        data: { series1: s1 },
      };
    };

    // REFRESH 강제 full(rebuild)을 검증 구간 안에서 여러 번 겪게 한다 — rebuild 가 drawn-플래그
    // 기준선을 다시 세우지 못하면 직후 strip 이 전부 재그려 알파 스파이크가 누적된다(>300 프레임을
    // override 로 압축: interval 30 × 80틱 ≈ 2회 rebuild + 다수의 rebuild-후 strip).
    window.__EVUI_BLIT_REFRESH_INTERVAL__ = 30;
    window.__EVUI_BLIT_DEBUG__ = true;
    window.__EVUI_BLIT_DIAG__ = undefined;
    window.__EVUI_BLIT_FORCE_OFF__ = false;

    const { container, rerender } = render(EvChart, { props: { data: genData(BASE), options } });
    await settle();

    let now = BASE;
    for (let t = 1; t <= 80; t++) {
      now += TICK;
      // eslint-disable-next-line no-await-in-loop
      await rerender({ data: genData(now), options });
      // eslint-disable-next-line no-await-in-loop
      await settle();
    }
    // 반투명이어도 blit 이 실제로 돌아야 한다(가속 유지).
    expect(
      window.__EVUI_BLIT_DIAG__?.blitted ?? 0,
      `반투명 blit 미실행(가속 상실): ${JSON.stringify(window.__EVUI_BLIT_DIAG__)}`,
    ).toBeGreaterThan(6);

    const blit = getImageData(container);

    // force-off 로 동일 시각 데이터를 재렌더 → 현재 carry 그대로 full redraw(점당 1회, 외형 불변).
    window.__EVUI_BLIT_FORCE_OFF__ = true;
    await rerender({ data: genData(now), options });
    await settle();
    const full = getImageData(container);

    // ⑶ 위치: deferred 점 누락이 있으면 한쪽만 on → onOff>0.
    const { onOff, dataPx, reg, samples } = exactDiff(blit, full);
    expect(
      onOff,
      `반투명 blit↔full 위치 불일치 ${onOff}px / 데이터 ${dataPx}px 좌=${reg[0]} 중=${reg[1]} 우=${reg[2]} samples=${samples.join(' ')} — deferred 점 누락 의심`,
    ).toBe(0);

    // ⑵ 알파: "둘 다 on" 픽셀의 알파 채널 비교. double-draw 면 blit 알파(2α-α²≈163)가 full(α≈102)보다
    // ~60 높다. AA 가장자리 차이(<40)는 무시. 정상(점당 1회)이면 ≈0.
    const { w, h } = blit;
    const x0 = Math.floor(0.08 * w);
    const x1 = Math.ceil(0.99 * w);
    const y0 = Math.floor(0.07 * h);
    const y1 = Math.ceil(0.82 * h);
    let alphaOver = 0;
    let both = 0;
    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        const i = (y * w + x) * 4;
        const ba = blit.data[i + 3];
        const fa = full.data[i + 3];
        if (ba >= 32 && fa >= 32) {
          both++;
          if (ba - fa > 40) {
            alphaOver++;
          }
        }
      }
    }
    expect(
      alphaOver,
      `반투명 blit 알파 누적 ${alphaOver}px / 겹침 ${both}px — strip double-draw 회귀`,
    ).toBeLessThanOrEqual(Math.max(4, Math.round(both * 0.01)));
  }, 180000);

  it('2-series(seriesReverse) range 50 밀집: blit 누적과 동일 데이터 full redraw 의 점 위치가 픽셀 동일하다', async () => {
    // 데모와 동형(2 series, seriesReverse). legend hover 는 호버 series 만 그려 위치 비교가 불가하므로
    // force-off + 동일 데이터 재렌더(현재 carry 유지, 데이터 idempotent)로 full redraw 를 만든다.
    const TICK = 1000;
    const options = mkOptions(50);
    // 두 series 의 toTime 기준(max x)이 같은 초에 들도록 앵커를 둔다 — 어긋나면 areBlitSeriesAligned
    // 가 매 틱 full 폴백시켜 blit 이 검증되지 않는다.
    const genData = (toMs) => {
      const s1 = [{ x: toMs - 1, y: 50 }];
      const s2 = [{ x: toMs - 2, y: 50 }];
      for (let i = 0; i < 800; i++) {
        const hsh = (i * 2654435761) >>> 0;
        const x = toMs - 3 - (hsh % (TICK - 2));
        const y = (3000 + ((i * 7919) % (95000 - 3000 + 1))) / 1000;
        if ((hsh >>> 13) & 1) {
          s1.push({ x, y });
        } else {
          s2.push({ x, y });
        }
      }
      return {
        series: {
          series1: { name: 'series1', pointSize: 1, color: '#DF6264', pointFill: '#DF6264' },
          series2: { name: 'series2', pointSize: 1, color: '#3CA0FF', pointFill: '#3CA0FF' },
        },
        data: { series1: s1, series2: s2 },
      };
    };

    window.__EVUI_BLIT_REFRESH_INTERVAL__ = 100000;
    window.__EVUI_BLIT_DEBUG__ = true;
    window.__EVUI_BLIT_DIAG__ = undefined;
    window.__EVUI_BLIT_FORCE_OFF__ = false;

    const { container, rerender } = render(EvChart, { props: { data: genData(BASE), options } });
    await settle();

    let now = BASE;
    for (let t = 1; t <= 12; t++) {
      now += TICK;
      // eslint-disable-next-line no-await-in-loop
      await rerender({ data: genData(now), options });
      // eslint-disable-next-line no-await-in-loop
      await settle();
    }
    expect(
      window.__EVUI_BLIT_DIAG__?.blitted ?? 0,
      `blit 미실행: ${JSON.stringify(window.__EVUI_BLIT_DIAG__)}`,
    ).toBeGreaterThan(6);

    const blitRaster = getImageData(container);

    // force-off 로 동일 시각 데이터를 재렌더 → 현재 carry 그대로 full redraw(외형 불변).
    window.__EVUI_BLIT_FORCE_OFF__ = true;
    await rerender({ data: genData(now), options });
    await settle();
    const fullRaster = getImageData(container);

    const { onOff, color, dataPx, reg, samples, aBlueColMax, bBlueColMax } = exactDiff(
      blitRaster,
      fullRaster,
    );
    // 위치(onOff)는 정확히 일치해야 한다 — 사용자가 본 스냅.
    expect(
      onOff,
      `2-series 위치 불일치 ${onOff}px / 데이터 ${dataPx}px 좌=${reg[0]} 중=${reg[1]} 우=${reg[2]} samples=${samples.join(' ')}`,
    ).toBe(0);
    // 세로 줄무늬: blit 의 컬럼별 blue 최댓값이 full(동일 carry) 대비 크게 늘면 blit 특이 집중(줄무늬).
    // full 도 carry 를 쓰므로 경계 집중은 양쪽 동일 → blit≈full 이어야 한다(color 스펙의 golden 은
    // force-off carry=0 라 경계 위상이 달라 stripe 로 보이지만, 그건 실사용 아닌 비교 baseline 차이).
    expect(
      bBlueColMax,
      `blit blue 세로 집중 ${bBlueColMax} vs full ${aBlueColMax} — 동일 carry full 대비 줄무늬(seam)면 회귀`,
    ).toBeLessThanOrEqual(aBlueColMax + 2);
    // 색(겹침 z-order) 동등: series 별 레이어를 full 과 동일 순서로 합성하므로 겹친 픽셀의 top 색이
    // full 과 일치 → 색 flip 이 0 에 수렴(틱 경계 seam 색줄 제거). 과거 단일 라스터의 틱별 z-order
    // 누적(seam)은 제거됐다. AA 가장자리 미세 차이만 허용(데이터의 0.1%).
    expect(
      color,
      `색 z-order 불일치(${color}px / 데이터 ${dataPx}px) — seam 회귀`,
    ).toBeLessThanOrEqual(Math.max(20, Math.round(dataPx * 0.001)));
  }, 120000);

  it('반투명(rgba alpha<1) 2-series(seriesReverse) 희소: blit 점당 1회 raster → 알파 누적 0 (데모 동형)', async () => {
    // 멀티-series + 반투명은 실제 데모가 켜는 조합. per-series 레이어가 각자 1회 누적·합성하므로
    // 메커니즘상 정확해야 하나 알파 차원이 미검증이었다(기존 멀티 테스트는 전부 opaque hex). 좌표는
    // series 간 disjoint(같은 x라도 y 짝/홀로 분리)로 둔다 — coincident-coord owner-flip(REFRESH 로
    // bounded 되는 *pre-existing* z-order 코너, drawn 플래그가 오히려 개선)이 알파 단언에 끼지 않게.
    const TICK = 1000;
    const RANGE = 60;
    const options = mkOptions(RANGE);
    const F1 = 'rgba(223,98,100,0.4)';
    const F2 = 'rgba(60,160,255,0.4)';
    // 두 series 가 같은 초로 floor 되도록 동일 앵커(toTime 정렬 → areBlitSeriesAligned). 정시(age0
    // 그림→다음 틱 경계 재그림 대상)+deferred 혼합으로 over-darken 을 유발한다.
    const genData = (toMs) => {
      const tk = Math.round((toMs - BASE) / TICK);
      const s1 = [{ x: toMs + 500, y: 50 }];
      const s2 = [{ x: toMs + 500, y: 51 }];
      for (let i = 0; i < 4; i++) {
        const h1 = ((tk * 131 + i) * 2654435761) >>> 0;
        const h2 = ((tk * 977 + i) * 2246822519) >>> 0;
        const y1 = 6 + (h1 % 44) * 2; // 짝수 계열
        const y2 = 7 + (h2 % 44) * 2; // 홀수 계열 → series 간 좌표 disjoint
        if (i < 3) {
          s1.push({ x: toMs, y: y1 }); // 정시 → 다음 틱 경계 재그림 대상
          s2.push({ x: toMs, y: y2 });
        } else {
          s1.push({ x: toMs + 1 + (h1 % 800), y: y1 }); // deferred
          s2.push({ x: toMs + 1 + (h2 % 800), y: y2 });
        }
      }
      return {
        series: {
          series1: { name: 'series1', pointSize: 2, color: F1, pointFill: F1 },
          series2: { name: 'series2', pointSize: 2, color: F2, pointFill: F2 },
        },
        data: { series1: s1, series2: s2 },
      };
    };

    window.__EVUI_BLIT_REFRESH_INTERVAL__ = 30;
    window.__EVUI_BLIT_DEBUG__ = true;
    window.__EVUI_BLIT_DIAG__ = undefined;
    window.__EVUI_BLIT_FORCE_OFF__ = false;

    const { container, rerender } = render(EvChart, { props: { data: genData(BASE), options } });
    await settle();

    let now = BASE;
    for (let t = 1; t <= 80; t++) {
      now += TICK;
      // eslint-disable-next-line no-await-in-loop
      await rerender({ data: genData(now), options });
      // eslint-disable-next-line no-await-in-loop
      await settle();
    }
    expect(
      window.__EVUI_BLIT_DIAG__?.blitted ?? 0,
      `멀티 반투명 blit 미실행: ${JSON.stringify(window.__EVUI_BLIT_DIAG__)}`,
    ).toBeGreaterThan(6);

    const blit = getImageData(container);
    window.__EVUI_BLIT_FORCE_OFF__ = true;
    await rerender({ data: genData(now), options });
    await settle();
    const full = getImageData(container);

    const { onOff, dataPx, reg, samples } = exactDiff(blit, full);
    expect(
      onOff,
      `멀티 반투명 위치 불일치 ${onOff}px / 데이터 ${dataPx}px 좌=${reg[0]} 중=${reg[1]} 우=${reg[2]} samples=${samples.join(' ')}`,
    ).toBe(0);

    const { w, h } = blit;
    const x0 = Math.floor(0.08 * w);
    const x1 = Math.ceil(0.99 * w);
    const y0 = Math.floor(0.07 * h);
    const y1 = Math.ceil(0.82 * h);
    let alphaOver = 0;
    let both = 0;
    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        const i = (y * w + x) * 4;
        const ba = blit.data[i + 3];
        const fa = full.data[i + 3];
        if (ba >= 32 && fa >= 32) {
          both++;
          if (ba - fa > 40) {
            alphaOver++;
          }
        }
      }
    }
    expect(
      alphaOver,
      `멀티 반투명 blit 알파 누적 ${alphaOver}px / 겹침 ${both}px — per-series strip double-draw 회귀`,
    ).toBeLessThanOrEqual(Math.max(4, Math.round(both * 0.01)));
  }, 180000);
});
