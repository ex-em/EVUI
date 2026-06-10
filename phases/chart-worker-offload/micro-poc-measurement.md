# Step 8 — worker micro PoC 측정 + 판정

> 범위 = **true micro**(차트 1개, interaction off). 측정 방식 = vitest browser(Chromium, **headless**)에서
> **실 WorkerRenderGate + OffscreenCanvas + transferToImageBitmap** 라운드트립 구동
> (`render.worker.measure.visual.spec.js`, warmup 5 + 30 samples, median). 원시 수치:
> `artifacts/micro-poc-2026-06-10.json`.

## 1. A.2 측정표 (+ 리뷰 추가 지표)

| workload | seriesCount | pointCount | packMs | transferMs | workerDrawMs | bitmapMs* | mainCommitMs | roundtripMs | mainOnly raster | worker main(잔류) | jsHeap | bitmapInFlight | droppedFrame | epochLag |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| small-timeseries | 10 | 120 | 0.0 | 1.85 | 0.45 | 8.95* | 0.0 | 11.55 | 0.30 | 0.05 | 18.2MB | 1 | 0 | 0 |
| medium-timeseries | 20 | 500 | 0.1 | 8.35 | 4.25 | 72.4* | 0.0 | 85.6 | 2.50 | 0.15 | 18.2MB | 1 | 0 | 0 |

`*` **bitmapMs 는 SwiftShader 아티팩트**(GPU_STATUS=`no-webgl` = headless 소프트웨어 래스터). Step 0 실 GPU
재측정에서 `drawImage`(commit)=3% 뿐이었음 → 실 GPU 에선 bitmap/commit 이 훨씬 작고 roundtrip 도 작아진다.
**신뢰 높은 지표 = packMs / transferMs / workerDrawMs / mainOnly raster**(CPU). 신뢰 낮음 = bitmapMs / roundtrip.

## 2. micro 합격선(A.3) 판정

A.3 micro 통과 = **(1) 전송 latency(packMs+transferMs) ≤ render 주기 20~30%** AND **(2) main Long Task/TBT
가 main-only 대비 감소** AND (step.md 추가) **(3) main flame chart long task 실제 감소**.

### (1) 전송 latency / render 주기
- worker 재래스터 cadence = **데이터 업데이트**(제품 B-real = 1s). interaction(hover/crosshair)은 main overlay라
  worker 를 트리거하지 않음.
- vs **1s** cadence: small 0.19%, medium 0.85% → ✅ 여유 큼.
- vs **60fps(16.67ms)**: small 11.1% ✅, **medium 50.7% ❌(30% 초과 → A.4 폐기선)**.
- 판정: cadence 해석에 따라 갈림. 제품 1s 기준이면 통과, 60fps 기준이면 medium 미달.

### (2) main Long Task/TBT 감소 — **핵심 문제**
- **per-chart 래스터가 너무 싸다**: main-only raster = small **0.30ms** / medium **2.50ms**.
- worker 경로는 그 래스터를 off-main 하는 대신 **main-resident pack + postMessage(직렬화) + commit** 을 더한다.
  측정된 packMs+transferMs = small **1.85ms** / medium **8.45ms** (transferMs 에 main-side postMessage 직렬화가
  섞여 있어 worker main 잔류는 과소 추정).
- 즉 **offload 하는 래스터(0.3~2.5ms)보다 추가되는 전송 비용(1.85~8.45ms)이 같거나 더 크다** → 단일 작은
  차트에서 B2 는 main TBT 를 **명확히 줄이지 못한다**(오히려 늘 수 있다). plan A.0/A.4 의 "단일 heavy job 은
  병렬 이득 없이 end-to-end 악화 가능" caveat 가 실측으로 재확인됨.

### (3) flame chart long task 실제 감소
- **측정 불가(신뢰)**: headless SwiftShader 라 bitmap/commit·절대 TBT 가 왜곡되고, headed 실 GPU CDP Profiler
  (Step 0 방식)가 없으면 long task 실제 감소를 신뢰성 있게 보일 수 없다. Step 0 자체도 이 이유로 headed 실
  GPU 로 재측정했다.

**결론**: (1)은 cadence 의존(1s 통과 / 60fps medium 미달), (2)는 **단일 작은 차트에서 net 이득 불명확/음수
가능**, (3)은 **이 환경에서 신뢰성 측정 불가**. → **micro 합격선을 신뢰성 있게 통과로 판정할 수 없음.**

## 3. 무엇이 증명되었나 (성공한 부분)

- **worker bootstrap**: line/bar/heatMap 이 **plain RenderInput 스냅샷만으로**(class/함수 clone 없이) worker 에서
  재구성 + 래스터됨(`render.worker.bootstrap.spec.js`, structuredClone 경계 후 사본 재구성). Step 3 element
  `draw()` 재사용(이중 구현 없음).
- **B2 round-trip 실동작**: 실 Worker + OffscreenCanvas + `transferToImageBitmap` → main `drawImage` 합성이
  browser 에서 end-to-end 동작(measure spec 30 samples × 2 workload, droppedFrame 0).
- **compositing order**: `commitWorkerFrame` = clear(display) → buffer(axis/grid, main) → series bitmap(worker).
  static 은 main buffer, series 만 worker bitmap.
- **메모리**: commit 후 `ImageBitmap.close()`, in-flight 상한(`maxInFlight=2`, 초과분 main), epoch stale-drop
  (낡은 epoch frame close+drop). bitmapInFlightMax=1, jsHeap 안정(18.2MB).
- **fallback**: kill switch off(기본)·미지원·생성 실패·init timeout·render-error 모두 main RenderCore 경로
  (Step 7 상태기계 + `drawSeriesLayerFallback`). 디스플레이 캔버스 미transfer(B2)라 fallback 항상 가능.
- **DOM 격리 추가 발견/수정**: `src/common/utils.js` top-level `window.console` → worker import throw.
  `globalThis.console` 로 수정(Step 1 이 놓친 격리 갭). heatMap 래스터는 category label 배열 필요 →
  스냅샷 `labels`/`isGradient` passthrough 추가(문자열 label/Float64 pack 한계는 Step 9).

## 4. 판정 = blocked (애매 — 사용자 판단 요청)

mechanism 은 정확히 동작하나, **micro 게이트의 결정적 조건((2) main TBT 감소 · (3) 실 flame chart long task
감소)을 신뢰성 있게 입증하지 못함**:
- 단일 작은 차트(제품 실제 워크로드 = "작은 timeseries 차트 다수")에서 **per-chart 래스터(0.3~2.5ms)가 추가
  전송 비용(1.85~8.45ms)보다 작거나 비슷** → B2 가 main TBT 를 명확히 줄이지 못함.
- 실 이득 가설(**many-chart pile-up 을 worker 풀로 병렬화** → Step 0 의 tick당 ~240ms 블록 완화)은 **micro(1차트)
  로 입증 불가** — 명시적으로 Step 9(풀/통합) 영역.
- 동시에 micro 는 **새 리스크**를 드러냄(plan A.5): pack+postMessage 는 **main-resident** 이고 chart×point 에
  비례 → 24차트 동시 tick 이면 aggregate main pack/transfer(24 × 2~8ms ≈ 48~200ms)가 래스터 절감을 상쇄할 수
  있다. Step 9 풀은 **aggregate main pack/transfer vs raster 절감**을 반드시 측정해야 한다.

### A.4 전환 옵션 (사용자 선택)
1. **headed 실 GPU 프로파일**(Step 0 방식): 제품 many-chart 워크로드에서 CDP Profiler 로 worker 풀(또는 단일)의
   실제 main long task 감소를 신뢰성 측정 → 그 결과로 go/no-go. (정확하지만 제품 서버/ headed 세션 필요.)
2. **Step 9 풀/통합으로 진행**(가설 검증): 모듈 싱글톤 풀 + coalescing 으로 aggregate main pack/transfer vs
   raster 절감을 측정. 단일 차트 marginal 경제성 + main-resident pack/transfer 리스크를 인지하고 진행.
3. **A.4 재분류**: 렌더 worker 폐기, `createDataSet`/scale 같은 **계산만** worker 후보로 재분류하거나 main-only
   (T3 + 알고리즘 최적화 + time-slicing) 확정.

> 코드(bootstrap·wiring·fallback·measure harness)는 완성·테스트 통과 상태로 커밋됨. blocked 는 **게이트 판정**
> 이지 코드 실패가 아니다. Step 9 진입은 위 1~3 중 사용자 결정 후.
