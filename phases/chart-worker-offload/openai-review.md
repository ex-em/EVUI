### Step 0: gpu-render-confirm
Verdict: MINOR CONCERNS

Issues:
- AC `grep -n "GPU"` is too weak; it can pass on existing prose, not a recorded measurement. See `step0.md:30-35`.
- `git status` only checks two repro files, but the step allows temporary probe scripts/window hooks. Those could be left behind untracked. See `step0.md:21-23`, `step0.md:40-41`.
- “GPU 활성” is under-specified; headed Chromium can still be misleading without recording GPU/compositor status. See `step0.md:21-22`.

Suggested fixes:
- Require a dated measurement row/table with profile, browser, GPU status, render %, reactivity %, drawImage %, and profiler artifact path.
- Add `git status --short phases/chart-render-perf phases/chart-worker-offload docs/views/...` or explicitly include untracked probe artifacts.
- Record `chrome://gpu`/CDP GPU info or equivalent in the measurement note.

### Step 1: dom-isolation
Verdict: MINOR CONCERNS

Issues:
- Source claims are mostly accurate: `helpers.util.js:5-6` top-level DOM canvas and `scale.logarithmic.js:47` DOM span path are real.
- The smoke test suggestion can be ineffective if the module is already imported before deleting `global.document`. See `step1.md:39`.
- `calcTextSizeCanvas` currently ignores the third padding arg passed by `scale.js:115-119`; preserving “public behavior” should explicitly cover this accidental caller contract.

Suggested fixes:
- Use isolated dynamic import/cache busting or a separate worker-like test process with `document` absent before import.
- Mock/provide `OffscreenCanvas` in the test path, since jsdom may not supply worker canvas APIs.
- Add a log-scale visual/numeric assertion comparing label width/axis placement before and after switching from DOM span to canvas metrics.

### Step 2: rendercore-series-layer
Verdict: MAJOR CONCERNS

Issues:
- `drawSeriesLayer` as “bufferCtx only” conflicts with current behavior: `drawSeries` passes `overlayCtx` into every renderer via `opt` at `chart.core.js:420-430`; heatmap uses it for highlight at `element.heatmap.js:379-385`.
- `drawTip` is not just pure series render. It calls `drawTips` at `chart.core.js:568-581`; `drawTips` executes tooltip formatter functions at `element.tip.js:23-27` and mutates `lastHitInfo` at `element.tip.js:76-78`.
- Current series drawing mutates geometry (`xp/yp/w/h`) used by main-thread hit testing; e.g. interaction reads `item.data.xp/yp` at `plugins.interaction.js:1015-1040`. A future worker draw will not update main model unless this is split out.

Suggested fixes:
- Split into three explicit products: pure series bitmap draw, main interaction/overlay draw, and geometry preparation for hit-test.
- Keep `drawTip` on main or define a formatter-free/canvas-only tip sublayer with all formatter output precomputed.
- Add tests asserting hit-test geometry remains current after the extraction, not just call order.

### Step 3: rendercore-static-layer
Verdict: MAJOR CONCERNS

Issues:
- Wrong source path: step cites `src/components/chart/model.store.js`; actual file is `src/components/chart/model/model.store.js`. The `show` exclusion is at `model/model.store.js:1400`, not the cited path/line.
- Axis draw is not fully static. `drawAxis` passes `hitInfo` and `defaultSelectInfo` at `chart.core.js:640-659`; scale drawing uses selection/hover label state, e.g. `scale.js:375-438`.
- Cache invalidation list misses plotLines/plotBands and select-label/showLabelTip interaction state that affects axis rendering. See `scale.js:494-551`.

Suggested fixes:
- Either postpone static-layer caching entirely, or split axis into static grid/base labels plus main interaction label overlay.
- If caching axis draw, include `hitInfo`, `defaultSelectInfo`, selectLabel/selectItem options, plotLines/plotBands, and data labels in the cache key.
- Fix all `model.store.js` references to `src/components/chart/model/model.store.js`.

### Step 4: rendercore-prepare
Verdict: MAJOR CONCERNS

Issues:
- The “prepare DOM/plugin dependency only 3 items” claim is wrong for scrollbar: `drawChart` calls `updateScrollbarPosition()` at `chart.core.js:333-334`, and that writes DOM styles in `plugins.scrollbar.js:328-337`.
- `initScale()` applies transform to both buffer and overlay contexts at `chart.core.js:720-743`; with overlay kept main-only, ownership of overlay transform must stay outside worker RenderCore.
- “RenderCore DOM-free 단독 실행” AC at `step4.md:42-43` is not sufficient if it still depends on live Scale/Series class instances carrying formatter/range functions (`scale.js:15-23`, `scale.js:85-86`).

Suggested fixes:
- Move scrollbar DOM positioning to ChartShell; RenderCore may only return computed scrollbar geometry if needed.
- Define separate transform responsibilities: worker/offscreen series ctx, main static/display ctx, main overlay ctx.
- Add an API test that imports/runs the proposed RenderCore with no `document/window`, no scrollbar DOM, and no listener calls.

### Step 5: render-snapshot-contract
Verdict: MAJOR CONCERNS

Issues:
- Wrong source path again: `step5.md:8` cites `src/components/chart/model.store.js`; actual file is `src/components/chart/model/model.store.js`.
- Snapshot contract omits render-derived geometry (`xp/yp/w/h`) required by main hit-test. Current render writes these in element draw paths, and interaction consumes them, e.g. `plugins.interaction.js:1015-1040`.
- Formatter policy is too narrow. It mentions labels/tooltip/axis, but render-time value label formatters exist in `element.bar.js:463-492`, `element.heatmap.js:399-417`, `element.pie.js:142-152`; range callbacks exist in `scale.js:85-86`.
- Typed-array packing is underspecified for category/time/dayjs/null/stacked/heatmap/pie data and for transfer ownership. Transferring source buffers would detach them.

Suggested fixes:
- Add a `RenderGeometry` contract: precompute on main, return from worker, or keep hit-test model calculation on main.
- Make a formatter/range policy matrix covering axis formatter, axis range function, showValue formatter, tooltip formatter, color/font callbacks, plot labels.
- Specify per-chart-type pack layouts and whether buffers are copied vs transferred.

### Step 6: layer-arch-and-killswitch
Verdict: MINOR CONCERNS

Issues:
- Canvas ownership discussion is confused with the chosen B2 path. `step7.md:13` uses worker-created OffscreenCanvas + ImageBitmap; that does not require `transferControlToOffscreen()` of `chart.core.js:61-66`.
- `worker init success` is listed as a pre-transfer gate at `step6.md:25`, but worker init is async. The step needs a handshake/timeout state machine.
- Default flag “off or feature-detect” at `step6.md:24` is ambiguous for later measurement steps.

Suggested fixes:
- State whether B2 transfers any existing canvas. If not, remove `transferControlToOffscreen` from the B2 gate and reserve it for a separate mode.
- Add `initializing -> ready -> failed` worker states; render main path until ready.
- Define a deterministic internal enable path for Step 7/8 measurement while keeping public API unchanged.

### Step 7: worker-micro-poc
Verdict: MAJOR CONCERNS

Issues:
- Scope is inconsistent: single-chart, interaction-disabled PoC at `step7.md:19-21`, but measurement asks profile B-real and interaction latency p95/p99 at `step7.md:22-23`.
- “RenderCore series draw reuse” at `step7.md:20` conflicts with Step 5’s plain snapshot unless the worker can reconstruct renderer behavior without live class instances/functions.
- Composition is underspecified. Current `commitToDisplay` copies one buffer containing axis+series at `chart.core.js:348-363`; B2 series-only bitmap must define clear/static/series/tip/display order.
- Fallback after render exception is required, but if any canvas was transferred earlier, main fallback can be impossible. See `step7.md:26-27`.

Suggested fixes:
- Make Step 7 either true micro: one chart, no interaction metrics; or include a mini B-real smoke with 10 charts.
- Define series bitmap compositing order and whether static/tip remain in main buffer or separate layers.
- Require a worker renderer bootstrap test that proves a representative line/bar/heatmap draw from `RenderInput` works without class-instance cloning.

### Step 8: worker-pool-integration
Verdict: MAJOR CONCERNS

Issues:
- Pool concurrency `hardwareConcurrency - 1` can be `0`, `NaN`, or too high for memory. See `step8.md:18`.
- Epoch policy is not testable: “직전 hit 유지 또는 무시” leaves behavior open. See `step8.md:20`.
- The step still does not solve geometry consistency for hit-test vs worker-rendered frame; epoch alone prevents stale commits but does not populate main `xp/yp`.
- AC references `D4(render-time)` without defining it in this step. See `step8.md:34`.

Suggested fixes:
- Clamp pool size: `max(1, min(configuredCap, hardwareConcurrency - 1 || 1))`, with a conservative cap.
- Choose one epoch mismatch policy and test it with update+hover races.
- Add per-chart deregistration/destroy handling here, not only Step 9, to prevent post-destroy commits.
- Define D4 or replace it with concrete metrics from Step 7.

### Step 9: worker-fallback-hardening
Verdict: MAJOR CONCERNS

Issues:
- Bundler viability is too late. If library UMD/CJS output cannot parse/load worker URL code, fallback code may never execute. Package exports include `require: ./dist/index.umd.cjs` at `package.json:29-33`.
- `npm run build:lib` only proves Vite builds; it does not prove ESM import, UMD script loading, or CommonJS require behavior with emitted worker assets.
- SSR import safety is broader than Step 1. `chart.core.js` imports may be safe, but constructor runtime uses `document`/`window` at `chart.core.js:53-68`; tests should distinguish import from instantiation.
- CSP/CDN/base-path cases need actual consumer fixtures or documented manual results; build output inspection alone will miss URL resolution failures.

Suggested fixes:
- Move minimal ESM/UMD/SSR worker-url smoke checks before or into Step 7.
- Add fixtures: Vite app import, browser UMD script, Node SSR import, and mocked Worker constructor failure.
- Require artifact checks for worker chunk URL/base path and a runtime fallback assertion, not just successful `build:lib`.

## Cross-cutting / overall

Ordering problems:
- The b/c/d split is directionally right, but Step 2 and Step 3 must first separate interaction overlays and hit-test geometry from render drawing. Without that, Step 5/7 worker work has no safe input/output contract.
- Step 4 incorrectly classifies scrollbar positioning as RenderCore-safe. DOM scrollbar updates must move to ChartShell before claiming DOM-free prepare.
- Bundler/worker URL feasibility should be checked before investing in pool integration.

Whole-phase gaps:
- Main hit-test geometry is the biggest missing contract. Current draw mutates data points; worker rendering removes that side effect from main.
- Formatter/range function handling is under-scoped. There are render-time functions beyond axis/tooltip.
- Static-layer caching is risky unless axis interaction state is split or included in keys.

Top 3 fixes:
1. Add a geometry contract for `xp/yp/w/h` and test update+hover consistency.
2. Split main-only interaction/overlay/tip/axis-hover paths before calling anything “worker candidate.”
3. Add early ESM/UMD/SSR worker URL smoke tests and an async worker-ready fallback state machine.
