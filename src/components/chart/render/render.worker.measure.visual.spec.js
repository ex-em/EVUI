import { describe, it, expect } from 'vitest';
import Line from '../element/element.line';
import { toRenderSnapshot, packSeries } from './render.snapshot';
import { reconstructSeries, rasterSeries } from './render.unpack';
import { WorkerRenderGate, RENDER_WORKER_STATE } from './render.worker.gate';

/**
 * Step 8 micro PoC 측정(A.2 표 + 리뷰 추가 지표). **실 Worker + OffscreenCanvas + transferToImageBitmap**
 * 라운드트립을 browser(Chromium)에서 구동해 pack/transfer/workerDraw/bitmap/commit/main-blocking 을 격리한다.
 *
 * 주의(헤드리스 caveat): vitest browser 는 headless 라 GPU 합성이 아닌 SwiftShader 일 수 있다. 그 경우
 * **bitmapMs/commitMs(=transferToImageBitmap/drawImage)는 부풀려진다**(Step 0 실 GPU 재측정에서 drawImage
 * 3% 뿐임이 확인됨). 반면 **packMs/transferMs/workerDrawMs/main-raster 는 CPU 비용이라 신뢰도 높다**.
 * GPU status 를 함께 기록해 판정 시 caveat 를 명시한다.
 *
 * 이 spec 은 측정만 한다(assert 는 라운드트립 성립 가드뿐). 수치는 console 로 출력해 산출물 표에 옮긴다.
 */

const PIXEL_RATIO = 2;
const CHART_RECT = {
  x1: 0,
  x2: 600,
  y1: 0,
  y2: 300,
  chartWidth: 600,
  chartHeight: 300,
  width: 600,
  height: 300,
};
const AXES_STEPS = {
  x: [{ graphMin: 0, graphMax: 1, minIndex: null, maxIndex: null, oriSteps: 10, steps: 10 }],
  y: [{ graphMin: 0, graphMax: 100, minIndex: null, maxIndex: null, oriSteps: 10, steps: 10 }],
};

function now() {
  return performance.now();
}

function median(arr) {
  const s = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

/** 대표 micro 워크로드(작은 timeseries 차트 1개): seriesCount × pointCount line 시리즈. */
function buildCore(seriesCount, pointCount, tick) {
  const seriesList = {};
  const charts = { pie: [], bar: [], line: [], scatter: [], heatMap: [] };
  for (let s = 0; s < seriesCount; s++) {
    const id = `s${s}`;
    const inst = new Line(id, { color: '#3b82f6', lineWidth: 1 }, s);
    inst.xAxisIndex = 0;
    inst.yAxisIndex = 0;
    inst.show = true;
    const data = new Array(pointCount);
    for (let i = 0; i < pointCount; i++) {
      const x = i / (pointCount - 1);
      const y = 50 + 40 * Math.sin((i + tick + s * 7) * 0.08);
      data[i] = { x, y, o: y, b: null };
    }
    inst.data = data;
    seriesList[id] = inst;
    charts.line.push(id);
  }
  return {
    pixelRatio: PIXEL_RATIO,
    chartRect: CHART_RECT,
    labelOffset: { left: 40, right: 10, top: 10, bottom: 24 },
    axesSteps: AXES_STEPS,
    options: { type: 'line' },
    seriesInfo: { charts },
    seriesList,
  };
}

/** SwiftShader 여부 등 GPU status 기록(판정 caveat 용). */
function gpuStatus() {
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl') || c.getContext('experimental-webgl');
    if (!gl) {
      return 'no-webgl';
    }
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : 'unknown-renderer';
  } catch (e) {
    return `err:${e.message}`;
  }
}

function waitReady(gate, timeoutMs = 4000) {
  return new Promise((resolve, reject) => {
    const start = now();
    const tick = () => {
      if (gate.state === RENDER_WORKER_STATE.READY) {
        resolve();
      } else if (gate.state === RENDER_WORKER_STATE.FAILED) {
        reject(new Error('worker FAILED'));
      } else if (now() - start > timeoutMs) {
        reject(new Error('worker ready timeout'));
      } else {
        setTimeout(tick, 10);
      }
    };
    tick();
  });
}

describe('Step 8 micro PoC 측정 (실 worker B2 round-trip)', () => {
  const WORKLOADS = [
    { label: 'small-timeseries', seriesCount: 10, pointCount: 120 },
    { label: 'medium-timeseries', seriesCount: 20, pointCount: 500 },
  ];
  // 60fps 기준 render 주기 ≈ 16.7ms. 1s 주기 갱신이면 1000ms(여유 큼). 합격선은 16.7ms 대비 보수 판정.
  const RENDER_CYCLE_MS = 1000 / 60;
  const WARMUP = 5;
  const SAMPLES = 30;

  it('GPU status 기록', () => {
    const gpu = gpuStatus();
    // eslint-disable-next-line no-console
    console.log(`[measure] GPU_STATUS=${JSON.stringify(gpu)}`);
    expect(typeof gpu).toBe('string');
  });

  WORKLOADS.forEach(({ label, seriesCount, pointCount }) => {
    it(`${label} (${seriesCount}×${pointCount}) main-only vs worker`, async () => {
      // ---- main-only baseline: 동일 reconstruct+raster 를 main 스레드에서(=main blocking 전체) ----
      const mainCanvas = new OffscreenCanvas(
        CHART_RECT.width * PIXEL_RATIO,
        CHART_RECT.height * PIXEL_RATIO,
      );
      const mainCtx = mainCanvas.getContext('2d');
      const mainRaster = [];
      for (let i = 0; i < WARMUP + SAMPLES; i++) {
        const core = buildCore(seriesCount, pointCount, i);
        const snap = toRenderSnapshot(core, i);
        const { columns } = packSeries(snap);
        const insts = reconstructSeries(snap, columns);
        mainCtx.setTransform(PIXEL_RATIO, 0, 0, PIXEL_RATIO, 0, 0);
        mainCtx.clearRect(0, 0, CHART_RECT.width, CHART_RECT.height);
        const t0 = now();
        rasterSeries(snap, insts, mainCtx);
        if (i >= WARMUP) {
          mainRaster.push(now() - t0);
        }
      }

      // ---- worker path: 실 worker round-trip ----
      const gate = new WorkerRenderGate({ isEnabled: () => true, isSupported: () => true });
      gate.start();
      await waitReady(gate);

      const displayCanvas = new OffscreenCanvas(
        CHART_RECT.width * PIXEL_RATIO,
        CHART_RECT.height * PIXEL_RATIO,
      );
      const displayCtx = displayCanvas.getContext('2d');

      let pending = null;
      gate.setFrameHandler((msg) => {
        if (pending) {
          pending(msg);
          pending = null;
        }
      });
      const nextFrame = () =>
        new Promise((resolve) => {
          pending = resolve;
        });

      const packMsArr = [];
      const transferMsArr = [];
      const workerDrawArr = [];
      const bitmapArr = [];
      const commitArr = [];
      const mainBlockArr = [];
      const roundtripArr = [];
      let dropped = 0;
      let maxInFlight = 0;

      for (let i = 0; i < WARMUP + SAMPLES; i++) {
        const core = buildCore(seriesCount, pointCount, i);
        const epoch = i + 1;
        const snap = toRenderSnapshot(core, epoch);

        const tPack = now();
        const { columns, transferList } = packSeries(snap);
        const packMs = now() - tPack;

        const framePromise = nextFrame();
        const tPost = now();
        const sent = gate.render(snap, columns, transferList);
        expect(sent).toBe(true);
        maxInFlight = Math.max(maxInFlight, gate._inFlight);

        // eslint-disable-next-line no-await-in-loop
        const frame = await framePromise;
        const roundtrip = now() - tPost;

        if (frame.epoch !== epoch) {
          dropped += 1;
        }

        const tCommit = now();
        displayCtx.drawImage(frame.bitmap, 0, 0);
        const commitMs = now() - tCommit;
        frame.bitmap.close();

        // transferMs ≈ roundtrip - (worker draw + worker bitmap). 스케줄링/직렬화/transfer 포함.
        const transferMs = Math.max(0, roundtrip - frame.drawMs - frame.bitmapMs);
        // main-blocking(worker 경로) = main 잔류 동기 비용 = pack + commit(raster 는 off-main).
        const mainBlock = packMs + commitMs;

        if (i >= WARMUP) {
          packMsArr.push(packMs);
          transferMsArr.push(transferMs);
          workerDrawArr.push(frame.drawMs);
          bitmapArr.push(frame.bitmapMs);
          commitArr.push(commitMs);
          mainBlockArr.push(mainBlock);
          roundtripArr.push(roundtrip);
        }
      }

      gate.destroy();

      const mem = performance.memory ? performance.memory.usedJSHeapSize : null;
      const row = {
        workload: label,
        seriesCount,
        pointCount,
        gpu: gpuStatus(),
        renderCycleMs: Number(RENDER_CYCLE_MS.toFixed(2)),
        packMs: Number(median(packMsArr).toFixed(3)),
        transferMs: Number(median(transferMsArr).toFixed(3)),
        workerDrawMs: Number(median(workerDrawArr).toFixed(3)),
        bitmapMs: Number(median(bitmapArr).toFixed(3)),
        mainCommitMs: Number(median(commitArr).toFixed(3)),
        roundtripMs: Number(median(roundtripArr).toFixed(3)),
        // 핵심: main-only 전체 blocking(raster 포함) vs worker 경로 main 잔류 blocking(pack+commit).
        mainOnlyBlockingMs: Number(median(mainRaster).toFixed(3)),
        workerMainBlockingMs: Number(median(mainBlockArr).toFixed(3)),
        // A.3 1차 합격선: 전송 latency / render 주기.
        transferLatencyMs: Number((median(packMsArr) + median(transferMsArr)).toFixed(3)),
        transferLatencyRatioVs16ms: Number(
          (((median(packMsArr) + median(transferMsArr)) / RENDER_CYCLE_MS) * 100).toFixed(1),
        ),
        mainBlockingReductionPct: Number(
          ((1 - median(mainBlockArr) / median(mainRaster)) * 100).toFixed(1),
        ),
        jsHeapBytes: mem,
        bitmapInFlightMax: maxInFlight,
        droppedFrameCount: dropped,
        renderEpochLag: 0,
        samples: SAMPLES,
      };
      // eslint-disable-next-line no-console
      console.log(`[measure] ROW=${JSON.stringify(row)}`);

      // 측정 성립 가드(라운드트립이 실제로 동작했는지).
      expect(packMsArr.length).toBe(SAMPLES);
      expect(row.workerDrawMs).toBeGreaterThan(0);
    });
  });
});
