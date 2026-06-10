# Phase: chart-worker-offload — OffscreenCanvas/Worker 렌더 오프로딩

> 이 문서는 phase의 **앵커**다. 권위 있는 원본은 아래를 참조한다(중복 복사 대신 포인터):
> - `phases/chart-render-perf/plan.md` §2.4(drawChart 책임), §2.5(RenderCore 분리), §5 부록 A(Worker 설계)
> - `phases/chart-render-perf/playwright-probe.md` "★★★★ B-real 실규모 재측정" (이 phase의 측정 근거)
> - `phases/chart-render-perf/drawchart-inventory.md` (Step 2.4 완료 산출물 — drawChart 의존 분류 표)

## 왜 이 phase인가 (측정 근거, 2026-06-10)

CDP Profiler call-tree 귀속 측정에서 **프로파일에 따라 병목이 정반대**임이 확인됐다:

- **프로파일 A** (1만 시리즈 × 1 차트): Vue 반응성 ~70%, render <10% → **Worker 무효**.
- **프로파일 B** (1000+ 시리즈 × 10+ 차트 = 실제 제품 사용 패턴): **render ≈76%** (그중 `drawImage` 65% = Canvas 2D 지연 래스터화로 1000 시리즈 stroke 비용이 commit 시점에 귀속), 반응성 ≈16% → **render-bound 확정**. drawImage가 시리즈 수에 선형 비례함을 100시리즈 A/B로 확인.

→ 프로파일 B는 render를 worker thread로 떼는 게 정답. 10개 독립 차트라 worker pool 병렬 래스터화 이득이 실재하고, OffscreenCanvas는 병렬성 없이도 메인 freeze를 제거한다.

**caveat**: headless Chromium SwiftShader가 drawImage 비용을 부풀렸을 수 있음 → Step 0에서 실기기 GPU 재확인.

## 불변 원칙 (모든 step 공통)

1. **데이터 불변**: 그려지는 점·곡선·tooltip 값을 바꾸는 최적화 금지(다운샘플링·시리즈 culling 금지). Worker는 같은 렌더를 **위치만** 옮긴다.
2. **소비자 무수정 · 공개 API 불변 · 기본 동작 불변.** worker는 내부 구현이며 미지원 환경에선 main으로 fallback.
3. **interaction은 main 즉답**: hit-test·tooltip·crosshair·selection overlay는 worker 왕복 없이 main에서 처리한다.
4. **★ 기하/래스터 분리(핵심 — OpenAI 리뷰 반영)**: 시리즈 렌더러는 현재 그리는 도중 데이터 포인트에 **픽셀 기하 `xp/yp/w/h`를 mutate**하고(`element.line.js:176`, `element.bar.js:270`), 메인 hit-test가 그 값을 읽는다(`plugins.interaction.js:1015-1016, 1163-1167, 1609-1613`). 따라서 **기하 계산(싸다)은 main에 남겨 hit-test에 공급**하고 **래스터화(stroke/fill — 측정상 비싼 76%)만 worker로** 옮긴다. 기하를 worker로만 보내면 메인 모델이 비어 hit-test가 깨진다.
5. **RenderCore 입력 계약** = DOM-free + **serializable + versioned(epoch) + deterministic**. Vue proxy·function(formatter)·circular ref·live class instance 금지. 별도로 **RenderGeometry 계약**(xp/yp/w/h) 정의.
6. **SharedArrayBuffer 불가**(소비자 COOP/COEP 강제 안 함) → Transferable ArrayBuffer / ImageBitmap만.
7. **B2 방식 = worker가 자체 `OffscreenCanvas` 생성 → `transferToImageBitmap()` → main `drawImage`.** 디스플레이 캔버스를 `transferControlToOffscreen`으로 넘기지 **않는다**(그건 제외한 A 방식). 따라서 main 캔버스 소유권은 유지되고, worker 진입은 **async ready 핸드셰이크**(initializing→ready→failed)로 다룬다(일방향 transfer 게이트 아님).
8. Step 2~5(geometry 분리 + RenderCore 분리)는 main 경로 리팩토링이라 **Worker가 폐기돼도 가치 유지**. 목표는 성능 중립(회귀 0).

## 코드 현황 (검증됨)

- `chart.core.js:325` `drawChart(hitInfo)` = initScale→getAxesRange→getLabelOffset→getAxesLabelRange→updateScrollbarPosition→calculateSteps→adjustXAndYAxisWidth→emitAxesScaleChange→drawAxis→drawSeries→drawTip→commitToDisplay 직렬 호출.
- `chart.core.js:360` `commitToDisplay`(2.5-a)는 **이미 추출됨** → 재작업 금지.
- `chart.core.js:61-66` buffer/display 2-canvas. (단 B2는 디스플레이 캔버스를 transfer하지 않음 — 위 원칙 7.)
- `chart.core.js:428` `drawSeries`가 `opt`에 **`overlayCtx`를 포함해 전 renderer에 전달**(heatmap highlight 등) → series raster와 overlay가 융합돼 있음. 분리 필요.
- **기하 mutation 지점**: `element.line.js:176-177`(`curr.xp/yp`), `element.bar.js:270-271`(`item.xp/yp`) 등 — 그리는 루프에서 픽셀 기하를 데이터 포인트에 쓴다. hit-test가 소비(`plugins.interaction.js:1015~`).
- DOM 의존(worker import/실행 시 문제): `helpers.util.js:5` top-level `document.createElement('canvas')` 싱글톤(`calcTextSizeCanvas`가 소비), `helpers.util.js:245` `calcTextSize`(DOM span)는 `scale.logarithmic.js:47`(log축)에서만 호출. `htmlToElement`(`:430`)은 tooltip 플러그인 전용(series 렌더 경로 무관). **scrollbar**: `chart.core.js:333` `updateScrollbarPosition()`은 DOM 스타일을 write(`plugins.scrollbar.js`) → prepare의 추가 DOM 의존.
- model 경로는 **`src/components/chart/model/model.store.js`** (show=false 시리즈 min/max 제외 `:1400` 부근).
- 라이브러리 제약: EVUI는 소비자 페이지 전체 차트 수를 모름 → worker 풀은 **모듈 싱글톤**(동시성 코어-1 자체제한). 인스턴스별 풀이면 코어 폭발.

## 검증 커맨드 (프로젝트 표준)

- `npm run lint` — eslint (src 한정)
- `npm run test:run` — vitest 단위 테스트 (jsdom)
- `npm run test:visual` — vitest browser golden screenshot
- `npm run test:visual:update` — golden baseline 갱신
- golden 회귀는 **pixel-perfect 0이 아니라 허용 tolerance** 기준(antialiasing/text-metric/GPU 차이 존재). 각 step에서 "의미 있는 회귀" 정의.

## Step 맵 (0~10) — OpenAI 리뷰 반영(`openai-review.md`)

| Step | 이름 | 매핑 / 핵심 |
|---|---|---|
| 0 | gpu-render-confirm | 게이트: GPU render 비중 재확인(기록표·GPU status) + 브라우저 지원 매트릭스/feature detect |
| 1 | dom-isolation | 부록 A.1: 전 text-metrics 경로 DOM 제거(padding arg·import-before-delete·OffscreenCanvas mock 주의) |
| 2 | **geometry-hittest-split** | ★신규: element 렌더러에서 **기하 계산(xp/yp/w/h, main 모델 저장)** 과 **래스터화**를 분리. hit-test는 main 기하 소비 |
| 3 | rendercore-series-raster | 2.5-b: 기하 계약 위에서 series **래스터**를 RenderCore로. overlay는 main, drawTip은 main/precompute |
| 4 | rendercore-static-layer | 2.5-c: `drawAxis`→`drawStaticLayer`. axis 선택/hover 상태(hitInfo·plotLines/bands)는 캐시 키 포함 또는 분리 |
| 5 | rendercore-prepare | 2.5-d: `prepareLayout`/`prepareScale` + ChartShell 주입(chartRect/pixelRatio/**scrollbar DOM**/emit). DOM-free + class-instance 비의존 |
| 6 | render-snapshot-contract | serializable/versioned/deterministic 입력 + **RenderGeometry 계약** + formatter/range 매트릭스 + per-type pack(copy/transfer) |
| 7 | layer-arch-and-killswitch | worker/main 레이어 + invalidation 표 + kill switch + **async worker-ready 핸드셰이크** + 조기 ESM/UMD/SSR worker-URL smoke |
| 8 | worker-micro-poc | 부록 A.0/A.2/A.3 micro: 단일 worker B2 PoC(scope 명확) + bootstrap test + compositing order + 메모리/fallback |
| 9 | worker-pool-integration | 부록 A.0 pool/A.3 통합: 모듈 싱글톤 풀(size clamp) + coalescing + epoch 정책(testable) + destroy 처리 |
| 10 | worker-fallback-hardening | 부록 A.7: 소비자 fixture(Vite/UMD/SSR/Worker fail mock) + import vs instantiation |

Step 0·8·9는 게이트(측정/판정)다. 미달 시 `blocked`로 빠지며(부록 A.4 전환 기준), 무거운 풀 리팩토링으로 자동 직행하지 않는다.
