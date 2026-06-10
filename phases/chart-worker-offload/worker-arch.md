# Worker 레이어 아키텍처 + kill switch + worker-ready (Step 7)

worker PoC(Step 8) 전에 **레이어 소유권 · kill switch · worker 생명주기**를 확정한다. 코드 구현은
`src/components/chart/render/render.worker.gate.js`(+ `render.worker.js` 스텁). 이 문서가 **권위 명세**다.

> 원칙(plan.md 불변 원칙): worker 는 같은 렌더를 **위치만** 옮긴다(데이터 불변). interaction 은 main 즉답.
> **B2** = worker 자체 OffscreenCanvas → `transferToImageBitmap()` → main `drawImage`(디스플레이 캔버스
> transfer 안 함). 이 step 은 설계·스캐폴딩이며 **실제 worker 렌더를 연결하지 않는다**(Step 8).

---

## 1. 레이어 경계 표 (소유권)

| 레이어 | 책임 | 소유 | worker 대상 | 근거 |
|---|---|---|---|---|
| DOM size / DPR | wrapper/container 크기·`devicePixelRatio`·backing store | **main** (ChartShell) | ✗ | window 의존(Step 5 `computePixelRatio`) |
| prepare / scale | axesRange→labelOffset→steps→adjust (DOM-free) | RenderCore | △ (입력 계산) | Step 5 `prepareScale`(plain snapshot = Step 6) |
| **기하 계산 (Step 2)** | `computeGeometry` → `xp/yp/w/h`(pie=각도) main 모델에 기록 | **main** | ✗ | hit-test 가 즉시 소비. 기하는 싸다(plan 원칙 4) |
| hit-test | 좌표→데이터 포인트 매핑 | **main** | ✗ | interaction 즉답(plan 원칙 3) |
| **static raster** (axis/grid) | `drawStaticLayer(bufferCtx)` | RenderCore | △ optional | 이득 측정 후(Step 4: 상호작용 상태와 묶여 캐시 보류) |
| **series raster** (stroke/fill) | `drawSeriesLayer(bufferCtx)` | RenderCore | **✓ primary** | 측정상 비싼 패스(Step 0). worker off-main 대상 |
| series overlay | heatMap highlight 등 즉답 overlay | **main** | ✗ | `drawSeriesOverlay`(Step 3, overlayCtx=main) |
| tooltip / crosshair / selection | `drawTip` + interaction 플러그인 | **main** | ✗ | formatter 실행·`lastHitInfo` mutate(plan 원칙 3) |
| legend / scrollbar DOM | 범례·스크롤바 DOM write | **main** (ChartShell) | ✗ | DOM 의존(Step 5) |
| **commit** | worker 가 보낸 **최신 bitmap 만** 표시 | **main** | — | epoch 기반 stale drop(§4, Step 9) |

요약: **worker = series 래스터(primary), static 래스터(optional)**. 그 외(기하/hit-test/overlay/tip/
legend/scrollbar/DOM/DPR/commit)는 **전부 main**. worker 가 폐기돼도 Step 2~5 분리는 main 리팩토링으로 가치 유지.

---

## 2. 레이어별 invalidation source 표 (Step 4 캐시 표 확장)

각 레이어를 다시 그려야 하는 트리거. worker 재요청(epoch++)은 series/static 레이어 invalidation 시.

| 레이어 | invalidation source | 재요청 단위 |
|---|---|---|
| static (axis/grid) | scale min/max 변동, 범례 토글(series.show), plotLines/plotBands, axis formatter/range, resize/DPR, theme | epoch++ (캐시 보류 — Step 4) |
| series raster | series data 변경, show 토글, color/fill/lineWidth 등 스타일, scale 변동(좌표 재매핑), resize/DPR, interpolation | epoch++ → worker 재래스터 |
| series overlay | hover/highlight(heatMap), brush 상태 | main 즉시(worker 무관) |
| tooltip / crosshair / selection | pointer 이동, select 상태, tooltip formatter | main 즉시(worker 무관) |
| commit (display) | worker bitmap 도착(epoch 일치 시만) | epoch 비교 후 drawImage |
| font | `document.fonts.ready` 후 폭 변동 | epoch++ 재요청(계약: render-contract.md §6) |

**stale 방지 핵심**: hit-test 모델(main 기하)은 항상 main 의 **최신 epoch** 와 일치. worker frame 은
도착 시 epoch 가 main 현재 epoch 와 같을 때만 commit, 낡으면 drop(§4).

---

## 3. 내부 kill switch

- **공개 API 불변**: 소비자에게 worker 플래그를 노출하지 않는다(소비자 무수정).
- **내부 플래그** `workerRenderEnabled`. 기본 **off**(보수적). 빌드/dev 플래그
  `VITE_EVUI_WORKER_RENDER` 가 있으면 그 값으로 초기화(`readEnvFlag`, 미정의·SSR 안전).
- **deterministic 내부 enable 경로**: `setWorkerRenderEnabled(true/false)`. Step 8/9 측정 시 확실히 켜지도록
  ("off or feature-detect" 모호성 제거). 측정 코드 전용이며 공개 API 아님.
- 실제 worker 진입 = kill switch on **그리고** feature-detect 통과 **그리고** ready **그리고** 스냅샷 직렬화 가능
  (`WorkerRenderGate.shouldRenderOnWorker`). 하나라도 불만족 → main.

---

## 4. async worker-ready 상태기계 (B2 핸드셰이크)

worker init 은 **비동기**다. 디스플레이 캔버스를 transfer 하지 않으므로(B2) 일방향 transfer 게이트가 아니라
**ready 핸드셰이크**로 다룬다.

```
        start()                    {type:'ready'}
 IDLE ──────────▶ INITIALIZING ───────────────────▶ READY
   │  (enabled &&        │                              │
   │   supported &&      │ timeout / onerror /          │ ready 전·실패면
   │   worker 생성)       │ {type:'unsupported'} /        │ main RenderCore
   │                     ▼ 생성 실패                      │
   └───▶ main 경로        FAILED ◀──────────────────────┘
        (disabled/                (→ main fallback, 항상 가능)
         unsupported)
```

- **IDLE**: 시작 전/비활성. main 경로.
- **INITIALIZING**: worker 생성 후 `{type:'init'}` 전송 ~ `ready` 수신 전. **이 동안 main 렌더**.
- **READY**: worker 가 `ready` 응답. 이후 worker 래스터 가능(Step 8).
- **FAILED**: 생성 실패 / `onerror` / `unsupported` / **timeout**(`DEFAULT_INIT_TIMEOUT_MS=3000ms`).
  worker terminate + main fallback. B2 라 디스플레이 캔버스가 main 소유이므로 fallback 이 **항상 가능**.

상태기계 전이마다 관측성 훅(§6) 호출.

---

## 5. B2 캔버스 소유권 (금지: transferControlToOffscreen)

- 디스플레이 캔버스(`chart.core.js:61-66` displayCanvas/bufferCanvas)는 **main 소유 유지**.
  `transferControlToOffscreen()` 으로 넘기지 **않는다**(제외한 A 방식 — 일방향이라 fallback 불가).
- worker 는 **자체 `OffscreenCanvas`** 를 만들어 series 를 래스터 → `transferToImageBitmap()` 으로
  ImageBitmap 을 main 에 보냄 → main 이 `drawImage` 로 디스플레이에 commit.
- 따라서 worker 실패/timeout 후에도 main 이 같은 입력으로 직접 래스터 가능(fallback 보장).

---

## 6. 관측성 훅

`WorkerRenderGate.hooks`(기본 no-op, Step 8/9 에서 실제 로깅/메트릭 주입):

| 훅 | 트리거 |
|---|---|
| `onInitFailure(reason)` | worker 생성 실패 / `onerror` / `unsupported` |
| `onTimeout(reason)` | ready 핸드셰이크 timeout |
| `onRenderException(reason)` | worker 렌더 예외 (Step 8) |
| `onFallback(reason)` | main 경로로 전환 (`kill-switch-off`/`unsupported`/`worker-create-failed`/`worker-error`/`init-timeout`/...) |

---

## 7. 조기 worker-URL smoke (리뷰: Step 10 → 7 앞당김)

`createRenderWorker()` = `new Worker(new URL('./render.worker.js', import.meta.url), {type:'module'})`.

- **ESM import** (`dist/index.js`): Vite 가 worker 청크를 별도 emit. `build:lib` 통과로 확인.
- **UMD / `require`** (`dist/index.umd.cjs`): `import.meta.url` 을 Vite 가 변환. `build:lib` 가 두 포맷을
  같이 emit 하므로 깨지면 빌드 실패로 즉시 드러난다(이 step AC).
- **SSR** (Worker·OffscreenCanvas undefined): `detectWorkerRenderSupport()` 가 false → main 경로. 또한
  worker 는 production 경로에서 `start()` 호출 전엔 생성되지 않으므로 import 만으로는 SSR 안전.
- 런타임에 `new Worker(new URL(...))` 가 throw 하면 `createRenderWorker` 가 null → feature-detect 가
  main fallback. (전체 매트릭스 경화 = Step 10.)

결과(Step 7 측정): `build:lib` 가 worker-URL 스캐폴딩으로 깨지지 않음 = ESM/UMD emit 가능 확인.
SSR/jsdom 은 feature-detect off 로 main 경로(테스트 `render.worker.gate.spec.js`).

---

## 8. 검증 (Step 7 AC)

`src/components/chart/render/render.worker.gate.spec.js`:
- **fallback 결정**: feature-detect off / kill switch off / 직렬화 불가 / 생성 실패(SSR=Worker undefined 포함)
  각각 main 경로.
- **worker-ready 상태기계**: initializing 동안 main, ready→READY, onerror/unsupported/timeout→FAILED→main fallback.
- kill switch off(기본) golden 회귀 0(`test:visual`) — worker 미진입, `drawChart` 불변.
- `build:lib` 가 worker-URL 스캐폴딩으로 깨지지 않음.
