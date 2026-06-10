# Step 3: rendercore-series-raster (Step 2.5-b, 기하 계약 위에서)

## 읽어야 할 파일

- `/CLAUDE.md`, `/Users/ijiwon/.claude/CLAUDE.md` — 프로젝트/전역 규칙
- `phases/chart-worker-offload/plan.md` — phase 앵커 (불변 원칙 3·4: interaction main, 기하/래스터 분리)
- `phases/chart-worker-offload/openai-review.md` — Step 2(overlayCtx·drawTip) 지적
- `phases/chart-render-perf/plan.md` §2.5-b, `phases/chart-render-perf/drawchart-inventory.md` #10·#11
- `src/components/chart/chart.core.js` — `drawSeries`(`:396`), `:428` `opt`에 `overlayCtx` 포함, `drawTip`(`:555`)
- `src/components/chart/element/element.tip.js` — `:23-27`(tooltip formatter 실행), `:76-78`(`lastHitInfo` mutate)
- `src/components/chart/element/element.heatmap.js` — `:379-385`(overlayCtx로 highlight)
- 이전 step 산출물: Step 2의 기하/래스터 분리(`rasterizeSeries`류), Step 1의 DOM-free 측정

## 배경

Step 2에서 series가 "기하(main) + 래스터" 2패스로 나뉘었다. 이 step은 **래스터 패스를 RenderCore의 `drawSeriesLayer`로** 묶는다(2.5-b). 단 리뷰가 지적한 융합 2개를 풀어야 한다:
- `drawSeries`는 `opt.overlayCtx`를 **전 renderer에 전달**(`chart.core.js:428`)하고 heatmap이 highlight에 쓴다(`element.heatmap.js:379-385`). **overlay는 interaction 즉답 레이어라 main**이어야 한다.
- `drawTip`은 순수 렌더가 아니다 — tooltip **formatter 함수를 실행**(`element.tip.js:23-27`)하고 `lastHitInfo`를 **mutate**(`:76-78`)한다.

성능 중립(회귀 0)이 목표.

## 작업

1. **3분할 명확화**: 
   - **`drawSeriesLayer(bufferCtx, geometry, style)`** = 순수 series **래스터**만(bufferCtx). Step 2의 `rasterizeSeries`를 호출. worker 후보.
   - **overlay(선택/crosshair/hover highlight)** = `overlayCtx`에 그리는 부분을 떼어 **main 전용** 경로로. worker 대상 아님.
   - **tip** = `drawTip`/`drawTips`는 formatter 실행·`lastHitInfo` mutate 때문에 **main 유지**하거나, formatter 출력을 **precompute**한 canvas-only tip 서브레이어로만 분리(함수·hit state 비의존). 기본은 main 유지.
2. `drawChart`에서 호출 순서를 유지하되 series 래스터(buffer)·overlay(main)·tip(main)을 구분해 호출한다.
3. 전 타입(line/bar/scatter/heatMap/pie/combo)이 같은 경로. **주의(pie)**: pie 계열은 overlay ctx 생성/사용이 다른 타입과 다를 수 있다(생성자에서 overlay가 조건부) → "overlay는 항상 main ctx"라고 단정하기 전에 pie의 `overlayCtx` 존재·소유를 확인하고 분기한다.

## Acceptance Criteria

```bash
npm run lint
npm run test:run
npm run test:visual
```

추가(`test:run` 포함):
- **호출순서 snapshot 테스트**: 분리 전후 파이프라인 호출 순서·plugin hook·emit 타이밍·composite 순서 동일.
- **hit-test 기하 불변**(Step 2 테스트 유지) + tooltip formatter 동작 불변.

## 검증 절차

1. 위 AC 전부 통과(Step 2 hit-test 테스트 + tooltip spec 회귀 0).
2. golden 회귀(허용 tolerance 내): 전 타입 + interaction(hover/select highlight) + EvChartGroup/Brush + heatmap highlight.
3. 성능 중립. 독립 커밋.
4. `index.json` step 3 업데이트.

## 금지사항

- overlay(선택/crosshair/hover highlight)·tooltip formatter 실행을 `drawSeriesLayer`(worker 후보)에 넣지 마라. 이유: interaction 즉답은 main, formatter는 직렬화 불가.
- `drawTip`/`drawTips`가 `lastHitInfo`를 mutate하는 동작을 worker 경로에 넣지 마라. 이유: hit state는 main 소유.
- 렌더 로직을 최적화하지 마라(성능 중립). 호출 순서를 바꾸지 마라.
- 기존 테스트를 깨뜨리지 마라. 무관한 파일 수정 금지.
