import { nextTick, onBeforeUnmount } from 'vue';

/**
 * Step 0b 계측 harness — 차트 렌더 성능 plan(§4 Step 0b) 전용.
 *
 * 목적: 이후 Step(1~3 게이트)이 "같은 이름의 performance.mark/measure"로 비교되도록
 * repro 페이지에 측정 인프라를 심는다. 두 repro(PerfStressSingle / PerfStressDashboard)가
 * 동일한 측정 로직·지표 이름을 쓰도록 한 모듈로 공유한다.
 *
 * ─── 영구 계측이 아님 ───────────────────────────────────────────────
 * plan §4 Step 0b: "영구 계측 코드가 아니라 repro/벤치 페이지 한정 — 라이브러리 본체엔
 * 남기지 않음." 그래서 이 코드는 docs/ 안에만 있고, src/ 본체에는 performance.mark/measure를
 * 넣지 않는다. EvChart가 노출하는 신호(`mouse-move` emit)·`pointermove` 입력·rAF·갱신 wrapper로
 * 바깥에서 감싼다.
 *
 * ─── 측정 지표(plan과 이름 통일) ─────────────────────────────────────
 * - `createDataSet` (데이터 변환 구간): **docs 외부에서 분리 측정 불가.**
 *     createDataSet은 evChart.update() 내부(model.store.js)에서 호출되고 본체가 경계를
 *     노출하지 않는다. 본체에 계측을 남기지 않는 제약상 단독으로 잴 수 없다 →
 *     아래 `drawChart` 합산 측정에 포함된다. 단독 분해는 DevTools Performance 수동 캡처로 한다.
 * - `drawChart` (전체 렌더 구간): **합산 근사로 측정.** 데이터 mutate 직전 → Vue flush(nextTick)
 *     완료까지의 벽시계 시간. 이 구간에 Vue 반응성 오버헤드 + createDataSet + drawChart +
 *     commit(drawImage)이 모두 동기로 들어가며 docs에서는 셋을 쪼갤 수 없다. plan의 drawChart
 *     정의("전체 렌더 구간")에 해당하는 합산값으로 쓴다.
 * - `commit` (buffer→display drawImage 구간): **docs 외부에서 분리 측정 불가.**
 *     chart.core.js:349의 drawImage는 drawChart 내부 마지막에 동기 실행된다 → 위 `drawChart`
 *     합산에 포함. 단독 분해는 DevTools 수동 캡처로 한다.
 * - `hitTest` (hover hit test 구간): **측정.** pointermove 입력 timestamp → EvChart `mouse-move`
 *     emit까지. onMouseMove(findHitItem/findClosestDataIndex + tooltip layout)가 동기 실행된 뒤
 *     emit되므로 hover 핸들러 전체 비용의 근사다. (caveat: emit 직전 nextTick 1 hop 포함,
 *     tooltip.throttledMove=true면 30ms throttle에 gated.)
 * - `interaction-latency`: **측정.** pointermove 입력 timestamp → tooltip paint 완료(rAF)까지.
 *
 * 못 잰 구간(createDataSet·commit 단독)은 DevTools Performance 수동 캡처로 대체한다(plan은
 * 수동 캡처 병행 허용). 측정 도구만 제공하며, 실제 수치는 저사양 기준 기기에서 사용자가 수동
 * 측정해 measurements.md(Step 0a 표)에 옮겨 적는다.
 */

// 지표별 보관할 최대 샘플 수(메모리 상한)
const RING = 200;

// 패널/console.table 행 정의. measured=false는 docs에서 분리 불가능한 구간.
const METRICS = [
  {
    key: 'createDataSet',
    measured: false,
    note: '본체 내부 구간 — docs 분리 불가, DevTools 수동 캡처',
  },
  {
    key: 'drawChart',
    measured: true,
    note: '데이터 mutate→Vue flush 합산 근사(createDataSet+commit 포함)',
  },
  {
    key: 'commit',
    measured: false,
    note: 'drawChart 내 drawImage 구간 — docs 분리 불가, DevTools 수동 캡처',
  },
  {
    key: 'hitTest',
    measured: true,
    note: 'pointermove→mouse-move emit(hover 핸들러 전체 근사)',
  },
  {
    key: 'interaction-latency',
    measured: true,
    note: 'pointermove→tooltip paint(rAF)',
  },
];

const percentile = (sorted, p) => {
  if (!sorted.length) {
    return 0;
  }
  const idx = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
  return sorted[idx];
};

const fmt = (v) => (typeof v === 'number' ? v.toFixed(1) : v);

export function usePerfHarness() {
  // 측정 가능한 지표만 샘플을 쌓는다.
  const samples = {
    drawChart: [],
    hitTest: [],
    'interaction-latency': [],
  };
  let lastPointerTs = 0;
  let panel = null;

  const buildStats = (key) => {
    const arr = samples[key];
    if (!arr || !arr.length) {
      return { count: 0, p50: 0, p95: 0, max: 0, last: 0 };
    }
    const sorted = [...arr].sort((a, b) => a - b);
    return {
      count: arr.length,
      p50: percentile(sorted, 50),
      p95: percentile(sorted, 95),
      max: sorted[sorted.length - 1],
      last: arr[arr.length - 1],
    };
  };

  const refreshPanel = () => {
    if (!panel) {
      return;
    }
    const rows = METRICS.map((m) => {
      if (!m.measured) {
        return `<tr><td>${m.key}</td><td colspan="5" class="na">— ${m.note}</td></tr>`;
      }
      const s = buildStats(m.key);
      return (
        `<tr><td>${m.key}</td><td>${s.count}</td><td>${fmt(s.p50)}</td>` +
        `<td>${fmt(s.p95)}</td><td>${fmt(s.max)}</td><td>${fmt(s.last)}</td></tr>`
      );
    }).join('');
    panel.querySelector('tbody').innerHTML = rows;
  };

  const record = (key, ms) => {
    const arr = samples[key];
    arr.push(ms);
    if (arr.length > RING) {
      arr.shift();
    }
    refreshPanel();
  };

  /**
   * 주기 갱신(틱) 측정. mutate()는 차트 reactive 데이터를 동기로 변경하는 함수.
   * mutate 직전 → Vue watcher flush(nextTick) 완료까지를 `drawChart`(전체 렌더 구간)로 잰다.
   * paint 프레임 대기(rAF)는 넣지 않는다 — 렌더 작업의 CPU 시간을 근사하기 위함이며, 합성/paint
   * 지연은 별도 지표(interaction-latency)에서만 본다.
   */
  const measureTick = async (mutate) => {
    performance.mark('drawChart-start');
    mutate();
    await nextTick();
    performance.mark('drawChart-end');
    performance.measure('drawChart', 'drawChart-start', 'drawChart-end');
    const entry = performance.getEntriesByName('drawChart').pop();
    if (entry) {
      record('drawChart', entry.duration);
    }
    performance.clearMarks('drawChart-start');
    performance.clearMarks('drawChart-end');
    performance.clearMeasures('drawChart');
  };

  // hover 입력 시점 기록. e.timeStamp는 performance.now()와 같은 time origin 기준.
  const onPointerMove = (e) => {
    lastPointerTs = e.timeStamp;
    performance.mark('hitTest-start');
  };

  // EvChart 'mouse-move' emit — onMouseMove(hit test + tooltip layout) 동기 실행 후 호출.
  const onChartMouseMove = () => {
    if (!lastPointerTs) {
      return;
    }
    const inputTs = lastPointerTs;
    performance.mark('hitTest-end');
    performance.measure('hitTest', 'hitTest-start', 'hitTest-end');
    record('hitTest', performance.now() - inputTs);
    // tooltip DOM 위치/표시는 emit 시점에 이미 쓰였고, 다음 프레임에 paint된다.
    requestAnimationFrame(() => {
      record('interaction-latency', performance.now() - inputTs);
    });
    performance.clearMarks('hitTest-start');
    performance.clearMarks('hitTest-end');
    performance.clearMeasures('hitTest');
  };

  // 측정 누적값을 console.table로 출력(measurements.md에 옮겨 적기용).
  const printTable = () => {
    const out = {};
    METRICS.forEach((m) => {
      if (!m.measured) {
        out[m.key] = { count: '—', p50: '—', p95: '—', max: '—', last: '—', note: m.note };
        return;
      }
      const s = buildStats(m.key);
      out[m.key] = {
        count: s.count,
        p50: fmt(s.p50),
        p95: fmt(s.p95),
        max: fmt(s.max),
        last: fmt(s.last),
        note: m.note,
      };
    });
    // eslint-disable-next-line no-console
    console.table(out);
  };

  const buildPanel = () => {
    panel = document.createElement('div');
    panel.className = 'perf-harness-panel';
    panel.innerHTML = `
      <div class="phh">
        <strong>perf harness (ms)</strong>
        <button type="button" class="phb">console.table</button>
      </div>
      <table>
        <thead>
          <tr><th>metric</th><th>n</th><th>p50</th><th>p95</th><th>max</th><th>last</th></tr>
        </thead>
        <tbody></tbody>
      </table>
      <div class="phn">createDataSet·commit은 본체 미계측 → DevTools 수동 캡처로 분해</div>
    `;
    const style = document.createElement('style');
    style.textContent = `
      .perf-harness-panel{position:fixed;right:8px;bottom:8px;z-index:9999;background:rgba(20,20,20,.92);
        color:#eee;font:11px/1.4 monospace;padding:8px;border-radius:6px;max-width:420px;}
      .perf-harness-panel .phh{display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;}
      .perf-harness-panel button{font:11px monospace;cursor:pointer;}
      .perf-harness-panel table{border-collapse:collapse;width:100%;}
      .perf-harness-panel th,.perf-harness-panel td{padding:1px 6px;text-align:right;}
      .perf-harness-panel th:first-child,.perf-harness-panel td:first-child{text-align:left;}
      .perf-harness-panel td.na{color:#999;text-align:left;}
      .perf-harness-panel .phn{margin-top:4px;color:#999;}
    `;
    panel.appendChild(style);
    panel.querySelector('.phb').addEventListener('click', printTable);
    document.body.appendChild(panel);
    refreshPanel();
  };

  buildPanel();

  onBeforeUnmount(() => {
    if (panel) {
      panel.remove();
      panel = null;
    }
  });

  return { measureTick, onPointerMove, onChartMouseMove, printTable };
}
