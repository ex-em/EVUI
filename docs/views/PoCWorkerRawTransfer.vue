<template>
  <div class="poc">
    <h2>PoC: raw-transfer worker (line only)</h2>
    <p>
      MAIN(현행: 점객체 빌드+geometry+raster 전부 메인) vs RAW-WORKER(raw 숫자배열 zero-copy
      transfer → worker가 점객체+geometry+raster, 메인은 pack+postMessage+합성만) 메인 스레드 비용 비교.
    </p>
    <div class="controls">
      series <input v-model.number="seriesCount" type="number" /> ×
      points <input v-model.number="pointsPerSeries" type="number" /> ,
      charts <input v-model.number="chartCount" type="number" /> ,
      iters <input v-model.number="iters" type="number" />
      <button :disabled="running" @click="run">측정 실행</button>
    </div>
    <pre class="out" data-poc-out>{{ output }}</pre>
  </div>
</template>

<script>
import { ref } from 'vue';
import Line from '@/components/chart/element/element.line';
import RenderWorker from '@/components/chart/render/render.worker.js?worker&inline';

const RENDER_SNAPSHOT_VERSION = 1;

export default {
  name: 'PoCWorkerRawTransfer',
  setup() {
    const seriesCount = ref(2000);
    const pointsPerSeries = ref(120);
    const chartCount = ref(10);
    const iters = ref(15);
    const running = ref(false);
    const output = ref('(아직 실행 안 함)');

    // ---- 공통: raw 데이터 + scale 파라미터 ----
    const buildRaw = (S, P) => {
      const labels = new Array(P);
      for (let i = 0; i < P; i++) labels[i] = i;
      const data = {};
      const ids = [];
      for (let s = 0; s < S; s++) {
        const id = `s${s}`;
        ids.push(id);
        const arr = new Array(P);
        for (let p = 0; p < P; p++) arr[p] = Math.random() * 100;
        data[id] = arr;
      }
      return { labels, data, ids };
    };
    const PIXEL_RATIO = 2;
    const CW = 280;
    const CH = 220;
    const scaleParam = (P) => ({
      chartRect: { x1: 0, x2: CW, y1: 0, y2: CH, chartWidth: CW, chartHeight: CH, width: CW, height: CH },
      labelOffset: { left: 0, right: 0, top: 0, bottom: 0 },
      axesSteps: { x: [{ graphMin: 0, graphMax: P - 1 }], y: [{ graphMin: 0, graphMax: 100 }] },
    });

    // ---- MAIN 시나리오: 점객체 빌드(addSeriesDS-line) + 실제 Line.computeGeometry + 실제 Line.draw ----
    const buildLineInstances = (raw) => {
      // 실제 Line 인스턴스(메타 기본값) — geometry/draw는 실제 코드 경로.
      const insts = [];
      for (let i = 0; i < raw.ids.length; i++) {
        const l = new Line(raw.ids[i], { name: raw.ids[i], point: false }, i);
        l.xAxisIndex = 0;
        l.yAxisIndex = 0;
        l.interpolation = 'none';
        l.combo = false;
        l.isExistGrp = false;
        l.show = true;
        insts.push(l);
      }
      return insts;
    };
    // addSeriesDS(line, non-horizontal)와 동일 형태의 점객체 생성(객체 할당 비용 포함).
    const buildPoints = (values, labels) => {
      const n = values.length;
      const out = new Array(n);
      for (let i = 0; i < n; i++) {
        const v = values[i] ?? null;
        out[i] = { x: labels[i], y: v, o: v, b: null,
          xp: null, yp: null, w: null, h: null, dataColor: null, dataTextColor: null };
      }
      return out;
    };
    const mainScenario = (raw, insts, ctx, param) => {
      const t0 = performance.now();
      // 1) createDataSet-equivalent (점객체 빌드)
      for (let i = 0; i < insts.length; i++) {
        insts[i].data = buildPoints(raw.data[raw.ids[i]], raw.labels);
      }
      const t1 = performance.now();
      // 2) geometry + 3) raster (실제 Line 코드)
      const drawParam = { ...param, ctx, isBrush: false,
        selectLabel: { option: { use: false }, selected: null },
        selectSeries: { option: { use: false }, selected: null } };
      ctx.clearRect(0, 0, CW, CH);
      // 실제 기본 경로(drawChart→drawSeriesLayer→draw)와 동일하게 draw()만 호출(geometry는 draw 내부 1회).
      for (let i = 0; i < insts.length; i++) {
        insts[i].draw(drawParam);
      }
      const t2 = performance.now();
      return { buildMs: t1 - t0, geomRasterMs: t2 - t1, totalMainMs: t2 - t0 };
    };

    // ---- RAW-WORKER 시나리오 ----
    // 메인: raw → x/y/o/b Float64Array(점객체 없음) pack + postMessage. worker가 점객체+geometry+raster.
    const packFromRaw = (raw) => {
      const series = {};
      const columns = {};
      const transferList = [];
      const order = [];
      const P = raw.labels.length;
      // x 컬럼은 모든 시리즈 동일(=labels)이지만 현행 packSeries와 동일하게 시리즈별로 채워 보수적 측정.
      for (let s = 0; s < raw.ids.length; s++) {
        const id = raw.ids[s];
        order.push(id);
        series[id] = { sId: id, type: 'line', name: id, show: true, interpolation: 'none', combo: false,
          xAxisIndex: 0, yAxisIndex: 0, isExistGrp: false };
        const vals = raw.data[id];
        const x = new Float64Array(P);
        const y = new Float64Array(P);
        const o = new Float64Array(P);
        const b = new Float64Array(P);
        for (let i = 0; i < P; i++) {
          x[i] = raw.labels[i];
          const v = vals[i];
          y[i] = typeof v === 'number' ? v : NaN;
          o[i] = y[i];
          b[i] = NaN;
        }
        columns[id] = { length: P, x, y, o, b };
        transferList.push(x.buffer, y.buffer, o.buffer, b.buffer);
      }
      const snapshot = {
        version: RENDER_SNAPSHOT_VERSION,
        epoch: 0,
        pixelRatio: PIXEL_RATIO,
        chartRect: { x1: 0, x2: CW, y1: 0, y2: CH, chartWidth: CW, chartHeight: CH, width: CW, height: CH },
        labelOffset: { left: 0, right: 0, top: 0, bottom: 0 },
        axesSteps: { x: [{ graphMin: 0, graphMax: P - 1 }], y: [{ graphMin: 0, graphMax: 100 }] },
        options: { type: 'line', horizontal: false },
        seriesOrder: { line: order, bar: [], heatMap: [] },
        series,
      };
      return { snapshot, columns, transferList };
    };

    const makeWorker = () => new Promise((resolve) => {
      const w = new RenderWorker();
      const onInit = (e) => {
        if (e.data?.type === 'ready' || e.data?.type === 'unsupported') {
          w.removeEventListener('message', onInit);
          resolve({ w, ok: e.data.type === 'ready' });
        }
      };
      w.addEventListener('message', onInit);
      w.postMessage({ type: 'init', version: RENDER_SNAPSHOT_VERSION });
    });

    // 단일 차트 1회: 메인 busy(pack+postMessage) + 도착까지 wall-clock + worker drawMs.
    const rawWorkerOnce = (w, displayCtx, packed, epoch) => new Promise((resolve) => {
      const onMsg = (e) => {
        const m = e.data;
        if (m?.type === 'rendered' && m.epoch === epoch) {
          w.removeEventListener('message', onMsg);
          const tc0 = performance.now();
          displayCtx.clearRect(0, 0, CW, CH);
          if (m.bitmap) { displayCtx.drawImage(m.bitmap, 0, 0); m.bitmap.close(); }
          const compositeMs = performance.now() - tc0;
          resolve({ drawMs: m.drawMs, bitmapMs: m.bitmapMs, compositeMs, t: performance.now() });
        }
      };
      w.addEventListener('message', onMsg);
      // pack(메인) — packFromRaw는 호출 전에 했고, 여기선 postMessage 직렬화 비용만 측정.
      const tp0 = performance.now();
      w.postMessage({ type: 'render', epoch, snapshot: packed.snapshot, columns: packed.columns },
        packed.transferList);
      const postMs = performance.now() - tp0;
      resolve._postMs = postMs;
      resolve.__sendT = performance.now();
    });

    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const median = (a) => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };

    const run = async () => {
      running.value = true;
      output.value = '실행 중...';
      await sleep(50);
      const S = seriesCount.value;
      const P = pointsPerSeries.value;
      const M = chartCount.value;
      const K = iters.value;
      const log = [];
      log.push(`scale: ${S} series × ${P} pts, charts=${M}, iters=${K}, pixelRatio=${PIXEL_RATIO}`);

      // 공통 데이터/캔버스
      const raw = buildRaw(S, P);
      const param = scaleParam(P);

      // ===== 시나리오 A: MAIN (단일 차트) =====
      const mainCanvas = document.createElement('canvas');
      mainCanvas.width = CW * PIXEL_RATIO; mainCanvas.height = CH * PIXEL_RATIO;
      const mainCtx = mainCanvas.getContext('2d');
      mainCtx.setTransform(PIXEL_RATIO, 0, 0, PIXEL_RATIO, 0, 0);
      const insts = buildLineInstances(raw);
      const mainSamples = { build: [], geomRaster: [], total: [] };
      for (let k = 0; k < K; k++) {
        // 매 iter 값 갱신(all-change 틱 모사)
        for (let s = 0; s < S; s++) { const a = raw.data[raw.ids[s]]; for (let p = 0; p < P; p++) a[p] = Math.random() * 100; }
        const r = mainScenario(raw, insts, mainCtx, param);
        mainSamples.build.push(r.buildMs);
        mainSamples.geomRaster.push(r.geomRasterMs);
        mainSamples.total.push(r.totalMainMs);
        await sleep(0);
      }
      log.push('');
      log.push('[A] MAIN (단일 차트, 메인 스레드 시간)');
      log.push(`  build(점객체)   median ${median(mainSamples.build).toFixed(1)} ms`);
      log.push(`  geometry+raster median ${median(mainSamples.geomRaster).toFixed(1)} ms`);
      log.push(`  → main 총     median ${median(mainSamples.total).toFixed(1)} ms`);

      // ===== 시나리오 B: RAW-WORKER (단일 차트) =====
      const { w, ok } = await makeWorker();
      if (!ok) { log.push('worker unsupported'); output.value = log.join('\n'); running.value = false; return; }
      const dispCanvas = document.createElement('canvas');
      dispCanvas.width = CW * PIXEL_RATIO; dispCanvas.height = CH * PIXEL_RATIO;
      const dispCtx = dispCanvas.getContext('2d');
      dispCtx.setTransform(PIXEL_RATIO, 0, 0, PIXEL_RATIO, 0, 0);
      const bSamples = { pack: [], post: [], composite: [], wall: [], workerDraw: [] };
      let epoch = 1;
      for (let k = 0; k < K; k++) {
        for (let s = 0; s < S; s++) { const a = raw.data[raw.ids[s]]; for (let p = 0; p < P; p++) a[p] = Math.random() * 100; }
        const tp0 = performance.now();
        const packed = packFromRaw(raw);
        const packMs = performance.now() - tp0;
        const sendT = performance.now();
        const res = await new Promise((resolve) => {
          const onMsg = (e) => {
            const m = e.data;
            if (m?.type === 'rendered' && m.epoch === epoch) {
              w.removeEventListener('message', onMsg);
              const tc0 = performance.now();
              dispCtx.clearRect(0, 0, CW, CH);
              if (m.bitmap) { dispCtx.drawImage(m.bitmap, 0, 0); m.bitmap.close(); }
              resolve({ composite: performance.now() - tc0, wall: performance.now() - sendT, drawMs: m.drawMs });
            } else if (m?.type === 'render-error') {
              w.removeEventListener('message', onMsg);
              resolve({ error: m.message });
            }
          };
          w.addEventListener('message', onMsg);
          const ts = performance.now();
          w.postMessage({ type: 'render', epoch, snapshot: packed.snapshot, columns: packed.columns }, packed.transferList);
          bSamples.post.push(performance.now() - ts);
        });
        if (res.error) { log.push(`worker render-error: ${res.error}`); break; }
        bSamples.pack.push(packMs);
        bSamples.composite.push(res.composite);
        bSamples.wall.push(res.wall);
        bSamples.workerDraw.push(res.drawMs);
        epoch++;
        await sleep(0);
      }
      const mainBusyB = median(bSamples.pack) + median(bSamples.post) + median(bSamples.composite);
      log.push('');
      log.push('[B] RAW-WORKER (단일 차트)');
      log.push(`  pack(raw→typed) median ${median(bSamples.pack).toFixed(1)} ms`);
      log.push(`  postMessage      median ${median(bSamples.post).toFixed(1)} ms`);
      log.push(`  composite        median ${median(bSamples.composite).toFixed(1)} ms`);
      log.push(`  → main busy 합   median ${mainBusyB.toFixed(1)} ms  (worker draw ${median(bSamples.workerDraw).toFixed(1)} ms, wall ${median(bSamples.wall).toFixed(1)} ms)`);
      log.push('');
      log.push(`  >>> 단일 차트 메인 절감: MAIN ${median(mainSamples.total).toFixed(1)} → RAW-WORKER ${mainBusyB.toFixed(1)} ms`);

      // ===== 시나리오 C: RAW-WORKER × M charts (동시 틱, 경합) =====
      const workers = [];
      for (let i = 0; i < M; i++) { const r = await makeWorker(); workers.push(r.w); }
      // M개 독립 raw(같은 규모)
      const raws = [];
      for (let i = 0; i < M; i++) raws.push(buildRaw(S, P));
      const cWall = [];
      const cMainBusy = [];
      for (let k = 0; k < 6; k++) {
        for (let i = 0; i < M; i++) { const rr = raws[i]; for (let s = 0; s < S; s++) { const a = rr.data[rr.ids[s]]; for (let p = 0; p < P; p++) a[p] = Math.random() * 100; } }
        const tickStart = performance.now();
        let mainBusy = 0;
        const promises = [];
        for (let i = 0; i < M; i++) {
          const ep = 1000 + k;
          const tpk = performance.now();
          const packed = packFromRaw(raws[i]);
          mainBusy += performance.now() - tpk;
          const wk = workers[i];
          const tpost = performance.now();
          promises.push(new Promise((resolve) => {
            const onMsg = (e) => {
              const m = e.data;
              if (m?.type === 'rendered' && m.epoch === ep) { wk.removeEventListener('message', onMsg); if (m.bitmap) m.bitmap.close(); resolve(); }
              else if (m?.type === 'render-error') { wk.removeEventListener('message', onMsg); resolve(); }
            };
            wk.addEventListener('message', onMsg);
            wk.postMessage({ type: 'render', epoch: ep, snapshot: packed.snapshot, columns: packed.columns }, packed.transferList);
          }));
          mainBusy += performance.now() - tpost;
        }
        await Promise.all(promises);
        cWall.push(performance.now() - tickStart);
        cMainBusy.push(mainBusy);
        await sleep(0);
      }
      log.push('');
      log.push(`[C] RAW-WORKER × ${M} charts (동시 틱)`);
      log.push(`  메인 busy(pack+post ×${M}) median ${median(cMainBusy).toFixed(1)} ms`);
      log.push(`  전체 도착 wall            median ${median(cWall).toFixed(1)} ms`);
      log.push(`  비교: MAIN ×${M} 추정      ≈ ${(median(mainSamples.total) * M).toFixed(1)} ms (메인 직렬)`);

      workers.forEach((x) => x.terminate());
      w.terminate();
      output.value = log.join('\n');
      // eslint-disable-next-line no-console
      console.log('[PoC-RESULT]\n' + output.value);
      running.value = false;
    };

    return { seriesCount, pointsPerSeries, chartCount, iters, running, output, run };
  },
};
</script>

<style scoped>
.poc { padding: 16px; font-family: monospace; }
.controls input { width: 70px; margin: 0 4px; }
.controls button { margin-left: 12px; }
.out { background: #111; color: #0f0; padding: 12px; margin-top: 12px; white-space: pre-wrap; }
</style>
