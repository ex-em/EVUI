# 차트 렌더 성능 개선 — 우선순위 기반 단계별 전략

## 1. 결정 요약 (TL;DR)

> **용어표** (목표 "n차"와 작업 "Tn"은 다른 축이다 — 혼동 주의):
> | 용어 | 의미 |
> |---|---|
> | **1차 / 2차 / 3차** | **목표** 우선순위 — 1차=반응성(freeze 없음·interaction latency), 2차=render-time 단축, 3차=메인 TBT 감소 |
> | **T2** | **작업** — 주기 갱신 시 전 시리즈 재변환 대신 바뀐 부분만 갱신하는 **증분 변환**(슬라이딩 윈도우) |
> | **T3** | **작업** — hover **hit test** 비용 축소(`findClosestDataIndex` 등 §2) |
> | **동일 픽셀 path 명령 생략**(이하 **path 생략**) | **데이터 불변** 렌더 명령 최적화 — 직전에 찍은 점과 **완전히 같은 화면 픽셀(x,y)** 에 떨어지는 연속 점의 path 명령(`lineTo`)만 생략. raw 데이터·hit test·tooltip 값은 항상 전체 원본 기준이며, 보이는 그림은 **시각적으로 동일**해야 한다(golden screenshot 허용 오차 내 — antialiasing·lineJoin·sub-pixel·DPR 때문에 literal byte 동일은 보장하지 않음). 동일 픽셀 연속점 생략은 원칙적으로 출력 의미를 바꾸지 않는 최적화로 취급한다. 데이터를 솎거나 의미를 바꾸는 다운샘플링(LTTB)·culling은 **채택하지 않음**. |

**대상**: EVUI 차트(`src/components/chart/`) **전체 타입(line·bar·scatter·pie·heatmap·combo)**. line 만 개 시리즈가 대표 재현 사례.

**목표 우선순위(지표로 고정)**:
1. **1차 — 반응성**: 갱신 중 interaction(hover/click) latency p95 ≤ 100ms + **페이지 freeze 없음**
2. **2차 — render-time**: render self-time 단축("만 개를 빠르게"). 정량 목표치는 Step 0a baseline 또는 Step 0b 재측정 baseline 후 확정(절대 fps가 아니라 상대 −% 가능).
3. **3차 — TBT**: 메인 Total Blocking Time 베이스라인 대비 50% 이상 감소

**이 프로젝트의 핵심 결정 변수(먼저 답해야 함)**:
| 질문 | 왜 중요한가 | 이후 영향 |
|---|---|---|
| **Q1. 만 strokes 병목인가, 포인트 수 병목인가?** | path 생략은 `lineTo` 수만 줄이고 `stroke()` 수는 줄이지 못함 | Step 2a 기대효과와 time-slicing/Worker 필요성 결정 |
| **Q2. append + fixed/predictable range인가, full replace + rescale인가?** | 증분 변환·scale/static cache는 range 안정일 때만 이득 | T2·cache 유효성 vs time-slicing/Worker 직행 결정 |
| **Q3. B-real을 어떤 규모로 재현할 수 있는가?** | Worker 풀의 차트 간 병렬성은 heavy job pile-up에서만 정당화됨 | B repro·D3 scheduler·Step 4 진입 조건 결정 |

**핵심 분기 (이 문서 전체를 결정함)**:
- **render-time 단축의 본질은 알고리즘 최적화·path 생략이다. Worker가 아니다.** Worker는 **총 렌더 작업량 자체를 줄이지 않는다** — 같은 작업을 메인 스레드 밖으로 옮겨 responsiveness(1차)·TBT(3차)를 개선할 뿐이다. (worker가 path 생략/path cache를 함께 보유하면 **메인 기준** render self-time은 줄어든 것처럼 보이나, 작업량을 줄인 주체는 worker가 아니라 그 알고리즘이다.) Worker가 기여하는 곳은 **주로 프로파일 B의 1차(freeze 제거) + 3차(TBT 감소)**.
- **데이터 불변 제약(최우선)**: **그려지는 데이터의 의미를 바꾸는 최적화는 금지한다.** 다운샘플링(LTTB로 점 솎기)·시리즈 culling(선 생략)은 화면에 보이는 점·곡선·tooltip 값을 바꾸므로 **채택하지 않는다.** 렌더 최적화는 **path 생략**(직전 점과 완전히 같은 픽셀인 연속 점의 `lineTo`만 생략 → 출력은 시각적으로 동일, golden screenshot 허용 오차 내)으로 한정한다. raw 데이터·hit test·tooltip은 항상 전체 원본 기준이다. 출력이 변하지 않으므로 소비자 opt-in 플래그도 불필요(차이를 인지할 수 없음) → 기본 활성 가능.
- **공통 레버는 path 생략 + 알고리즘 최적화**: path 생략은 path 빌드·rasterize 비용을, batch/putImageData/캐시/할당 감축은 redraw·packing self-time을 줄여 render-time(2차)·freeze(1차)·blocking(3차)을 함께 완화한다. **단 데이터 불변 한정이라 이득 폭은 다운샘플링보다 작다** — 같은 픽셀에 찍히는 연속 점이 있을 때만 효과가 있고, **시리즈 수(strokes)가 많은 "만 strokes" 병목은 출력을 바꾸지 않는 한 줄일 수 없다**(culling이 하던 일). 그 경우 알고리즘 최적화로도 부족하면 Step 3 게이트에서 time-slicing/Worker로 넘긴다.
- **path 생략 기대효과는 보수적으로 본다**: 병목이 "만 개 시리즈/만 strokes"라면 path 생략만으로 큰 개선을 기대하지 않는다. path 생략은 포인트 밀도 병목을 줄이는 카드이고, stroke 수 자체는 데이터 의미를 바꾸지 않는 한 줄일 수 없다.
- **두 배치 프로파일** (해법이 갈림): 기준은 **차트 개수 자체가 아니라 한 tick/window 안에 heavy render job이 몇 개 쌓였는지**다. A/B는 사용자 옵션으로 직접 구분하지 않는다. 다만 **정확한 heavy job 임계값·coalescing window·승격/복귀 hysteresis는 지금 확정하지 않고**, B-real 재현 + Step 3 게이트 실패가 확인된 뒤 D3에서 구체화한다.
  - **A — heavy job 0~1개/window(상시·일반)**: 같은 window에 pile-up이 없음 → **T3 + path 생략·알고리즘 최적화 + 메인-only 수단으로 끝남. Worker 불필요.**
  - **B — heavy job 2개 이상/window(특정 대시보드 한정)**: packing·redraw가 같은 window에 직렬로 쌓여 메인 Long Task. **여기서만 Worker 풀의 차트 간 병렬성이 진짜 이득.**
- **라이브러리 제약**: EVUI는 소비자 페이지의 **전체 차트 수를 모른다**(각 인스턴스는 자기 시리즈 수만 앎). → Worker 풀·coalescer는 **모듈 레벨 싱글톤**이어야 동시성을 코어−1로 자체 제한(인스턴스별 풀이면 N차트×풀 = 코어 폭발).

> **★ 측정 갱신 (2026-06-09, Playwright 6× throttle + CDP Profiler probe — 상세 `playwright-probe.md`)**:
> Step 0~6(repro·harness·회귀망·hit test·draw skip·commit 분리) 적용 후 A-single(1만 시리즈) self-time 분해 결과,
> **지배 비용은 render(캔버스 그리기)가 아니라 데이터 파이프라인 오버헤드였다**:
> - **lodash cloneDeep ≈ 24%** (`baseClone`/`baseGetAllKeys`/`initCloneArray`)
> - **Vue deep 반응성/deep-watch ≈ 58%** (`get`/`traverse`/`set`/`noTracking`/`trigger`/…)
> - **실제 캔버스 렌더(draw/createDataSet 계열) 합계 < 10%**
>
> 근본 원인 위치 = `Chart.vue:231-263` `watch(() => props.data, …, { deep: true })` per-tick 경로:
> ① `deep:true` watch가 reactive 데이터 전체를 매 틱 `traverse` → ② `getNormalizedData` → ③ 다수 `isEqual` 전체 비교 →
> ④ `cloneChartData`(=`cloneDeepWith`, `uses.js:277`, 호출 `Chart.vue:250`) 전체 딥클론. 모두 데이터 크기(series×points)에 비례.
> append/full-replace 무관(둘 다 전체를 훑음 → 측정 동일).
>
> **이 발견이 계획을 바꾼다**:
> - **Q1 재정의**: 병목은 "strokes vs points"가 아니라 **"데이터 파이프라인(clone/deep-watch/isEqual) 오버헤드"** 가 1차 지배항이다. strokes/points 병목 판단은 이 오버헤드를 제거한 뒤에야 의미가 있다.
> - **OffscreenCanvas/Worker는 이 병목에 효과 없음** — 그리기가 <10%라 렌더를 worker로 떼어도 cloneDeep+반응성 오버헤드(메인스레드)는 그대로 남는다. 기존 Step 2b/2c/2d(렌더/createDataSet 직격)도 1차 타깃이 아니다.
> - **새 최우선 작업 = Step 1.5(데이터 파이프라인 비용 제거)**. 이를 먼저 적용 → **재측정** → 그 self-time 분해 결과로 **Step 3 게이트가 Worker/OffscreenCanvas 적용 여부를 판정**한다.
> - **소비자 무수정 제약(사용자 확정 2026-06-09)**: **기존에 이 라이브러리를 쓰던 곳의 코드 수정 0 · 공개 API 변경 0 · 기본 동작 변경 0.** 순수 내부 최적화만 한다. → watch 콜백 **내부** 비용(클론 F1·isEqual F3·normalize F4)만 줄이고, **`props.data`의 `deep:true` watch(소비자 in-place mutation 감지 계약)는 default 유지**(F2 default 변경·opt-in API 신설 모두 범위 밖). 따라서 반응성 traverse 고유분은 잔존할 수 있다.
> - **call-tree 귀속(probe 상세)**: clone 서브트리 **30.4%**(F1 직격, proxy get trap 포함) / deepwatch `traverse` **19.3%**(F2 전용·잔존) / isEqual 2.9%(F3) / render 10.2% / other 37.1%(상당수 GC 추정, F1로 동반 감소 여지). → **F2 없이 F1+F3로 ≈33% 직접 제거 + GC 동반분**. "1/3+ 단축"은 무수정으로 가능, "절반 이상"은 F2 필요.
> - 단 위 수치는 6× throttle 근사다. **self-time 비율은 throttle와 무관하게 견고**하나, 절대치·게이트 합격선은 저사양 실기기 재측정으로 확정.

**적용 순서 (요약)**:
- **Step 0a** — 의사결정용 repro + baseline + 선결 분류(path 생략 효과, 갱신 성격, B-real 재현 정보).
- **Step 0a Review (Go / No-Go)** — Q0/Q2/Q3/D4a/D4b를 확정하고(Q1은 Step 1.5 후 잔여 draw 지배 시에만) **계획을 재정렬**한다. Step 0a 결과가 기존 가정과 다르면 이후 step을 자동 진행하지 않는다.
- **Step 0b** — 품질 보증용 계측 harness + 회귀 매트릭스/golden screenshot 기준. **기능 회귀(tooltip 값 정확성)는 Step 1 전에, 시각 회귀(golden screenshot)는 Step 2/2.5 전에** 고정한다.
- **Step 1 T3 hit test 축소** — 반응성 1차 직격, 가장 먼저.
- **Step 1.5 데이터 파이프라인 비용 제거 (신규·측정 기반 최우선)** — `Chart.vue` 데이터 watcher의 cloneDeep + deep-watch + isEqual(2026-06-09 측정에서 self-time ~80%)를 제거/축소. 적용 후 **재측정**해 잔여 병목을 self-time으로 재분해하고, 그 결과로 Step 3 게이트가 Worker/OffscreenCanvas를 판정한다.
- **Step 2 알고리즘 최적화 + path 생략** — render-time 2차 직격, 1급. 실제 실행은 난이도·리스크가 다르므로 **2a low-risk draw skip(hidden skip + path 생략) → 2b cache → 2c createDataSet → 2d scatter/heatmap** 순으로 쪼개 단계별 측정한다.
- **Step 2.4 drawChart 책임 목록화(2.5 선결)** — RenderCore 분리 전에 `drawChart`가 하는 일을 표 1개로 목록화하고 DOM/canvas/model/plugin 의존으로 분류해 분리 가능/불가를 표시한다. characterization 없이 코드부터 찢는 리스크를 차단한다(코드 변경 없는 순수 분석).
- **Step 2.5 RenderCore 단계 분리(main-only 선행/조건부 확대)** — `drawChart`를 prepare/draw/commit 단위로 분리한다. **2.5-a `commitToDisplay` 분리는 게이트 전 최소 선행**으로 두고, 2.5-b~d는 Step 3에서 time-slicing 또는 Worker 가능성이 남을 때 진행한다. Worker 진입 시에도 그대로 재사용(Step 4에 가두지 않음).
- **Step 3 게이트** — Step 1.5 후 라우팅에서 latency/freeze만 미달인 경우 진입. T3+Step 1.5(+필요 시 Step 2)+메인-only 수단(time-slicing 등)으로 **1차 합격선 + D4a/D4b 해당 지표**를 충족하면 **Worker 없이 종료**.
- **Step 4 Worker** — 기본 진입 대상은 프로파일 B. **A도 Step 1.5 후 라우팅 및 Step 3 이후에도 합격선 미달이면 제한적으로 포함.** 상세는 **부록 A**.

### Stop Condition (중단 조건)
- **Step 0a Review에서 핵심 가정이 깨진 경우**: Q0/Q1/Q2/Q3/D4a/D4b 결과로 Step 1.5 후 라우팅·Step 2 우선순위·T2 유효성·Worker 트랙 필요성이 바뀌면, Step 0b/Step 1로 자동 진행하지 않고 계획을 재정렬한다.
- **Step 2에서 D4b를 초과 달성한 경우**: 남은 Step 2 sub-step은 자동 진행하지 않고 **추가 최적화의 위험/효과를 재평가**한다. 특히 createDataSet 자료구조 변경·heatmap `putImageData`처럼 회귀 위험이 큰 작업은 실측 병목이 남을 때만 진행한다.
- **Step 3 게이트 통과 시**: **Worker 트랙은 종료**한다. 부록 A는 backlog/deferred 설계로 남기고 실행하지 않는다. 단 Step 2.5-a `commitToDisplay`까지 완료했다면 유지하고, 2.5-b~d는 time-slicing/cache 경계가 실제로 필요할 때만 별도 진행한다.
- **Step 3에서 특정 프로파일만 통과한 경우**: 통과한 프로파일은 종료하고, 미통과 프로파일만 Step 4 후보로 넘긴다.

### 확정된 요구사항 프로파일
| 항목 | 값 |
|---|---|
| 타깃 기기 | 저사양 (4코어급) |
| 시리즈 수 | 수천~만 개. **원본 데이터는 항상 그대로 렌더(다운샘플링 없음)**. path 생략으로 path 비용만 축소 |
| 갱신 주기 | 최대 초당 1회 |
| 동시 차트 수 | 대부분 단일·소수(A), 다수는 특정 대시보드 한정(B). 라이브러리는 전체 차트 수를 모름 → 풀은 자체 제한(코어−1) |
| 1차 합격선 | 갱신 중 hover/tooltip 안 멈춤, interaction latency ~100ms, freeze 없음 |
| 2차 목표 | render-time 단축 **두 축: D4a(per-tick update end-to-end — watcher/data pipeline, Step 1.5) + D4b(canvas redraw self-time — 알고리즘·path, Step 2)**. 정량치 Step 0a 후 확정 |
| 3차 목표 | 메인 TBT 50% 이상 감소 |
| 절대 fps 보장 | **목표 아님.** 2차는 baseline 대비 상대 단축 |

> **"메인 작업을 쪼개면(time-slicing) 안 되나?" — 프로파일별로 답이 갈린다**:
> - **B**: 쪼개기는 한 Long Task를 잘게 나눠 freeze는 없애나 **총 작업량은 불변** → N개 차트 동시 갱신에선 조각이 pile-up. 여기선 **작업량 감축(path 생략·증분 + 알고리즘 최적화) + 병렬화(Worker)**.
> - **A**(단일·소수, 초당 1회): 700ms+ 유휴라 pile-up 없음 → `yield`로 쪼개 사이에 hover를 끼우면 "안 멈춤"(1차)이 충족. 특히 **갱신이 full-replace/동적rescale이면 T2 증분·캐시가 무효라 time-slicing이 사실상 유일한 메인-only 해법**(작업을 줄이는 게 아니라 흩뿌리는 거라 범위 변동과 무관). → Step 3 게이트에서 "T2 증분 vs time-slicing"을 동급 후보로 둠.

---

## 2. 검증된 병목 사실 (근거: 파일:라인)

> 아래 file:line·논지는 현재 `improve-perf` 브랜치 기준으로 대조 검증됨. line 번호는 문맥 식별용이며 이후 코드 변경으로 이동될 수 있다. 표의 "createDataSet 전체"는 아직 **증분 변환/typed array 전환 적용 전 현황** — 일반 line/bar 포인트 객체 재사용은 일부 적용됐지만, 전 시리즈 순회·새 배열 생성·raw object fallback·draw 비용은 남아 있다.

### 렌더링 구조
- **chart.core.js**: `EvChart` 클래스. 3-canvas 생성, plugins/model을 `Object.assign` Mixin 주입, init/drawChart/update/render 오케스트레이션.
- **Canvas 3종**(`:61,64,74`): display/buffer/overlay. display·overlay는 `chartDOM`에 append, **buffer는 메모리 전용**(오프스크린). Context는 생성자에서 1회 `getContext('2d', { willReadFrequently: isPie })`(`:63,66,77`) — pie만 true.
- **Render Loop 없음**: requestAnimationFrame 메인 루프 없이 **완전 이벤트 드리븐**. 초기 `init()→drawChart()`(`:139`), 갱신 `update()→render()→drawChart()`(`:1148,:1264,:1269`).
- **Double Buffering**: buffer(축+시리즈) → display로 **1회 `drawImage`**(`:349`). overlay는 인터랙션 전용 별도 레이어.
- **Element 렌더링**: line은 시리즈당 단일 `ctx.stroke()`(`element.line.js:190`, 이미 최적), bar는 visible 범위만, scatter/heatmap은 요소마다 `drawPoint`/`fillRect`.
- **Scale**: 매 `drawChart`마다 `getAxesRange`/`calculateSteps`(`:328,337`). 데이터 개수 무관, 축 범위·step 수에만 의존.

### Hit test 구조 (T3 대상)
- overlay에 `mousemove` 바인딩(`interaction.js:538`), 좌표는 `getMousePosition`(`:757`)에서 `clientX/Y`와 **캐시된** overlay rect(`chart.core.js:getOverlayClientRect :757`)로 계산한다. `getBoundingClientRect`는 rect 캐시 miss 또는 invalidate 후에만 호출된다(`chart.core.js:759`).
- hover hit은 두 단계:
  - **① 공유 라벨 인덱스 찾기** `findClosestDataIndex`(`:1089`). 내부에서 라벨 루프를 돈다(`for i < referenceData.length`, `:1138`):
    - per-label `sIds.some()` **유효성 검사**(`:1139`) — "이 라벨에 유효 데이터 가진 시리즈가 있나". 라벨마다 시리즈를 순회 → **O(라벨×시리즈) 곱셈항의 진짜 원인**.
    - **avgInterval 계산 루프**(`:1105`) — 매 hover마다 별도 O(라벨).
  - **② 그 인덱스에서 전 시리즈 값 수집** `findHitItem`(`:947`, `for ix < sIds.length` `:956`) — O(시리즈수), +시리즈당 `measureText`/포맷팅.
- → **"binary search 한 줄"로는 ①의 위치 탐색만 O(log)로 줄 뿐, ③유효성검사 O(라벨×시리즈)·④avgInterval O(라벨)이 잔존**해 dominant term이 안 바뀜. (해법은 §4 Step 1.)
- `tooltip.throttledMove`(`interaction.js:531`, 30ms throttle) 옵션이 **이미 존재** → 신규 rAF throttle 도입보다 이를 활용.

### update / 주기 갱신 경로
- 데이터/옵션 변경 watch → `evChart.update()`(`Chart.vue:156,348,420`). lightUpdate가 아니면:
  - `getStoreMinMax()` + `createAxes`(`chart.core.js:1137-1139`)가 **매 non-light 갱신마다 재계산** → 축 범위가 변동(동적 rescale)할 수 있음.
  - `createDataSet`(`model.store.js`)가 **전 시리즈 재변환**. line/bar엔 증분 경로 없음. (realTimeScatter만 `range` 기본 300 기반 자체 윈도잉 — scatter 전용, generic 경로엔 없음.)
  - `render()→drawChart()` full redraw.
- createDataSet 산출물은 포인트마다 **10필드 plain object 배열**(`addSeriesDS:550`: x,y,o,b,xp,yp,w,h,dataColor,dataTextColor). 일반 line/bar 경로는 `prevData` 객체 재사용이 일부 적용되어 포인트 객체 재생성은 줄었지만(`:554-589`), 매 틱 전 시리즈 순회·새 배열 생성·object raw-data fallback·stack/scatter/heatMap 별도 경로는 남아 있다. raw 입력은 `number[]` 또는 `{x,y}[]`(`model.store.js:56`).

### ★ 데이터 파이프라인(update watcher) 비용 — 측정상 1차 지배항 (2026-06-09)
- **per-tick 경로**: `Chart.vue:231-263` `watch(() => props.data, …, { deep: true, flush: 'post' })`. 데이터 한 번 변경마다 동기로:
  - **① deep-watch traverse**: `{ deep: true }` watch가 reactive `props.data`(1만 시리즈×50pt) **전체 객체 그래프를 매 틱 순회**해 의존성 추적/변경 감지(self-time `traverse` 12.6% + `get`/`noTracking`/`reactive` 다수).
  - **② `getNormalizedData(chartData)`**(`:236`) — 전체 순회 정규화.
  - **③ 다수 deep `isEqual`**(`:238,239,247,248`) — `newData.series/groups/labels/data` vs `evChart.data`를 lodash `isEqual`로 **2~4회 전체 비교**(`isUpdateSeries`/`isUpdateData` 플래그 산출용).
  - **④ `cloneChartData(newData)`**(`:250`) = `cloneDeepWith`(`uses.js:277`) — **전체 데이터 딥클론**(self-time `baseClone` 18.4% + `baseGetAllKeys` 4.8% + `initCloneArray`).
  - 그 **다음에야** createDataSet + 캔버스 draw가 실행되며, 이 둘의 self-time 합은 **< 10%**.
- **존재 이유(제거 시 회귀 위험)**: ④ 클론은 normalize 산출물을 소비자 reactive 객체와 분리해 내부 변형 역류를 막고 ③ 비교의 안정 기준을 제공한다. ① deep watch는 소비자가 데이터를 **in-place mutate**(repro의 `labels.push`/`seriesData.push`처럼)하는 케이스를 감지하려는 것이다 → **공개 반응성 계약**과 얽혀 있어 단순 제거는 소비자 영향(API 호환성) 결정 필요.
- **비용 비례**: 위 ①③④는 모두 **데이터 크기(series×points)에 비례**하며 append/full-replace 무관(둘 다 전체를 훑음). 캔버스/렌더-스레드와 무관 → **Worker/OffscreenCanvas로 이전 불가(메인스레드 잔존)**.
- 근거: `playwright-probe.md`(6× throttle + CDP Profiler self-time 분해). 비율은 throttle 무관하게 견고, 절대치는 실기기 재확인.

### Worker 호환성
- **즉시 import를 막는 1차 걸림돌(확인됨)**: `helpers/helpers.util.js:5`가 **모듈 로드 시** `document.createElement('canvas')`로 싱글톤을 만든다 → worker import 즉시 `ReferenceError` throw. 조건부가 아닌 최상위 코드라 회피 불가 → **worker화의 필수 선결 수정**. 같은 파일의 `calcTextSize`/`htmlToElement`도 DOM API를 사용하므로 worker 경로에서는 호출 격리 또는 대체가 필요하다.
- **예외**: `scale.logarithmic.js:47` `calcTextSize`(DOM span). 다른 scale은 `calcTextSizeCanvas`(measureText) 사용 → 통일 필요.
- **호환(이전 가능)**: `element/*`, `helpers.canvas.js`는 document/window 의존 0.

### 시나리오 분류
| 시나리오 | 본체 redraw | 데이터 재변환 | 빈도 | 병목 성격 |
|---|---|---|---|---|
| **2-1 마우스 이동** | ✗ overlay만 | ✗ | hover | hit test O(시리즈수)·O(라벨×시리즈)(JS) |
| **2-2 클릭** | ✓ 전체 | ✗ | 클릭 | full redraw + hit test + `cloneDeep` |
| **2-3 주기 갱신 ★** | ✓ 전체 | ✓ createDataSet 전체 | 초당 1회 지속 | redraw + 데이터 변환 (최중량) |

- **2-1**: `onMouseMove`(`interaction.js:35-113`)는 overlay clear + 하이라이트 + 툴팁만. 병목은 위 hit test.
- **2-2**: `onClick`→emit→Vue v-model→watch(`Chart.vue:288,297,307`)→`selectItemByData`/`selectLabelByData`/`selectSeriesByData`→`this.render()`(`interaction.js:1377,1390,1402`)→full redraw.
- **2-3**: 위 update 경로. 매 틱 전 시리즈 createDataSet + full redraw.

---

## 3. 착수 전 확정/확인 필요한 사항

> B0는 확인된 downstream 사용 케이스로 **존재 확정**이다. Step 0a에서는 B0를 다시 판정하지 않고, 공개 repro로 재현 가능한 렌더 특성만 수집한다. 측정 결과에 의존하는 결정(D4)은 Step 0a 산출물이 나온 직후 확정한다(D4 목표치는 baseline 없이는 정할 수 없으므로). D3는 지금 구체화하지 않는다. B-real 재현 + Step 3 게이트 실패가 확인되어 Worker 트랙에 실제 진입할 때 확정한다. (다운샘플링·culling 관련 결정 D1·D2·D5는 "데이터 불변 제약"으로 채택하지 않으므로 삭제됨.)

| ID | 결정 | 옵션 | 막는 step / 결정 기준 |
|---|---|---|---|
| **B0** (확정: 존재) | 프로파일 B(같은 짧은 window에 heavy render job이 2개 이상)가 **확인된 downstream/consumer 사용 케이스에 존재**하는가 | **존재** → B repro·Worker 풀/병렬성 트랙 유효. 단 Worker 진입은 여전히 Step 3 게이트 미통과 시에만 진행 | **Step 0a에서 해당 B-real 사용 패턴을 익명화된 공개 repro로 재현·계측한다.** D3는 B-real + Step 3 게이트 실패가 모두 확인된 뒤 구체화한다. |
| **D3** (defer) | Worker 후보 승격 기준 | **runtime scheduler 자동 분류** 방향만 유지. 구체 threshold/hysteresis는 미확정 | **지금은 Step 4 설계를 막지 않도록 보류.** B-real 재현 + Step 3 게이트 실패가 확인된 뒤에만 구체화한다. 원칙은 사용자 옵션으로 A/B를 직접 고르지 않고, 모듈 싱글톤 `renderScheduler`가 render 요청을 coalesce해 heavy job pile-up을 감지한다는 것까지다. `seriesCount`, `pointCount`, `lastMainRenderMs`, `estimatedCostMs`, window 크기, 승격/복귀 hysteresis 값은 Step 0a/Step 3 실측값으로 정한다. |
| **D4** | render-time 2차 목표치 (**두 축 분리**) | baseline 대비 −% | **두 지표로 분리(2026-06-09 측정 반영 — watcher 비용이 per-tick 체감의 대부분이라 redraw self-time만으론 Step 1.5 효과가 안 잡힘)**: **D4a = per-tick update end-to-end**(mutate→Vue flush, clone/deep-watch/isEqual/normalize 포함) → **Step 1.5 합격 기준**. **D4b = canvas redraw self-time**(draw/createDataSet) → **Step 2 합격 기준**. baseline 후 각각 상대 −%로 확정. |

추가 설계 결정(게이트 미통과 시에만 해당): `revisionId` stale 처리 UX(무시 vs 직전 hit 유지), B2 affinity 라우팅 vs 재분배, showValue formatter 확장(E vs C′ — PoC v1 범위 밖, 후속 확장 시). 이 항목들은 부록 A.6처럼 **PoC 통과 전에는 상세 설계로 끌어오지 않는다**.

---

## 4. 실행 스텝 (우선순위순)

> 코드 수정은 Step 0a baseline부터. 측정 의존 결정(D4)은 **Step 0a 산출 직후** 확정한다(§3 머리말 참조).

### Step 0a — 의사결정용 repro + baseline + 선결 분류
- **repro**: 현재 docs 구조에 맞춰 `docs/views/lineChart/example`에 line 만 개 시리즈 단일 차트(A 대표)를 만들고 `setInterval(…, 1000)`로 주기 갱신. B-real은 필요하면 `docs/views/comboChart/example` 또는 별도 dashboard-style 예제로 익명화해 재현한다. **B0는 확인된 downstream 사용 케이스로 존재가 확정됐으므로**, 같은 짧은 window에 heavy render job이 2개 이상 쌓이는 **B-real 사용 패턴도 익명화된 공개 대시보드 시나리오로 재현·계측한다**. **synthetic B는 B0 판정 근거가 아니라 라이브러리 한계 측정용 stress로만 쓴다**.
- **baseline**: DevTools Performance로 per-tick Long Task 길이·TBT·redraw self-time·hover 시 `findClosestDataIndex` self-time을 수치 기록(이후 Step 1~3 의사결정 기준). **redraw/per-tick self-time을 draw call vs 데이터 변환/할당(GC) 으로 분해 측정** — 일반 line/bar 포인트 객체 재사용은 이미 일부 적용됐으므로, 남은 비용(전 시리즈 순회·배열 생성·stack/scatter/heatMap 별도 경로·GC)이 지배적인지 확인한다. Step 0a 수동 baseline에는 최소 `performance.mark/measure`를 함께 심어 `createDataSet`/`drawChart`/`hitTest`/`commit` 단위가 이후 Step 0b harness와 같은 이름으로 비교되게 한다. 이미 Step 0a를 DevTools 수동 캡처만으로 끝낸 경우, Step 0b harness 적용 직후 baseline을 같은 시나리오로 재측정하고 그 값을 이후 비교 기준으로 고정한다.
- **핵심 질문(이 3개가 이후 계획을 결정)**: Q1 **만 strokes 병목인가, 포인트 수 병목인가?** Q2 주기 갱신이 **append + fixed/predictable range**인가, 아니면 **full replace + rescale**인가? Q3 확인된 downstream 사용의 **B-real을 어떤 규모로 재현할 수 있는가?** 이 셋이 측정되기 전에는 Step 2 세부 우선순위·T2 유효성·Worker 트랙 진입 여부를 확정하지 않는다.
- **선결 분류 ①(path 생략 효과)**: 대표 데이터의 **시리즈당 포인트 수** 측정. 포인트가 **화면 가로 픽셀 수보다 많으면** path 생략이 path 빌드·rasterize 비용을 직접 줄임(연속 동일 픽셀 점 `lineTo` 생략, 출력 불변). 포인트는 적고 **시리즈 수(strokes)가 많으면**(만 strokes) → **출력을 안 바꾸는 수단으로는 줄일 수 없다**(시리즈를 생략하는 culling은 데이터 의미를 바꾸므로 채택 안 함) → 알고리즘 최적화(할당 감축·batch 등) + time-slicing/Worker가 유일한 경로. 섞이면 path 생략 + 알고리즘 최적화 병행.
- **선결 분류 ②(갱신 성격)**: 대표 갱신이 (a) **append형 + 축 범위 고정/예측가능** vs (b) **full-replace 또는 동적 rescale**(매 틱 `getStoreMinMax` 변동) 중 무엇인지 분류. (a)면 Step 3에서 T2 증분·캐시가 유효, (b)면 증분·정적캐시 모두 무효 → **time-slicing/Worker로 직행**해야 함. **주의: 주기 갱신이 (a)여도 EVUI는 범례 토글(`series.show`)만으로 축 범위를 재계산한다**(`model.store.js:1383`에서 show=false 시리즈를 min/max에서 제외) → **범례 토글은 (b) 동적 rescale의 대표 사례**라 정적레이어/scale 캐시는 그 시점에 무효화돼야 하고, path 생략 결과도 재계산 대상이다(픽셀 위치가 축 범위에 의존).
- **B-real 재현 정보 수집**: 확인된 downstream B 화면의 차트 수, 각 차트의 시리즈 수/포인트 수, 갱신 주기, 같은 API 응답 또는 같은 timer/window에 묶여 갱신되는지, full replace/rescale 여부를 기록한다. 공개 repro에는 제품명·도메인 데이터·비공개 화면 구조를 넣지 않고, 동일한 렌더 특성만 보존한다. Step 3 게이트 실패 시 이 수치로 D3를 구체화한다.
- **Step 0a 산출물 템플릿(필수)**: 측정 후 아래 표를 남긴다. 실행자는 수치와 판단만 채우고, Step 0a Review는 이 표를 기준으로 한다.

| profile | seriesCount | pointCount | updateType | updateE2EMs(D4a) | dataPipeline%(clone/dw/isEq) | redrawMs(D4b) | createDataSetMs | hitTestMs | LongTask/TBT | Q0 판단 | Q1 판단 | Q2 판단 | Q3 판단 |
|---|---:|---:|---|---:|---:|---:|---:|---:|---:|---|---|---|---|
| A-single |  |  | append/fixed or full/rescale |  |  |  |  |  |  | pipeline/draw 지배 | strokes/points/mixed | T2 유효/무효 | 해당 없음 |
| B-real |  |  | append/fixed or full/rescale |  |  |  |  |  |  | pipeline/draw 지배 | strokes/points/mixed | T2 유효/무효 | 재현 가능 규모/불가 사유 |
| B-synth(선택) |  |  | append/fixed or full/rescale |  |  |  |  |  |  | pipeline/draw 지배 | strokes/points/mixed | T2 유효/무효 | stress 참고용 |

> `updateE2EMs`=per-tick mutate→flush(watcher 비용 포함, D4a). `dataPipeline%`=self-time 중 clone+deep-watch+isEqual 합(Q0 근거). `redrawMs`=canvas redraw self-time(D4b).

| 결정 항목 | 기록할 판단 |
|---|---|
| **Q0 (최우선)** | per-tick 지배항이 데이터 파이프라인(clone/deep-watch/isEqual)인지 draw인지. pipeline 지배면 Step 1.5 먼저 |
| **Q1 (Step 1.5 후 잔여 draw 지배 시)** | path 생략을 1급으로 볼지, stroke 수 병목이라 기대치를 낮출지 |
| **Q2** | T2 증분/정적 캐시가 유효한지, full replace/rescale이라 time-slicing 쪽인지 |
| **Q3** | B-real을 공개 repro로 재현 가능한 규모와 scheduler window 내 heavy job pile-up 여부 |
| **D4a** | Step 1.5에서 쓸 per-tick update end-to-end 목표치(baseline 대비 −N%) |
| **D4b** | Step 2에서 쓸 canvas redraw self-time 목표치(baseline 대비 −N%) |
- **검증**: 위 수치·분류가 문서화되면 Step 0a 완료. D4a/D4b 목표치 확정. Step 1~3 의사결정은 0a 결과만으로 진행한다.

### Step 0a Review — Go / No-Go
Step 0a 결과를 보고 이후 계획을 한 번 재정렬한다. 이 review를 통과하기 전에는 Step 0b/Step 1 이후 작업을 자동 진행하지 않는다.
- **Q0 확정 (2026-06-09 측정 반영·최우선, Q1보다 먼저)**: per-tick 지배항이 **데이터 파이프라인(clone/deep-watch/isEqual/normalize)** 인지 확정한다(현 측정 ~80%, draw <10%). 지배하면 **Step 1.5를 먼저** 적용하고, **strokes/points(Q1) 판단은 Step 1.5 후 잔여 draw가 지배할 때로 미룬다**.
- **Q1 확정 (Step 1.5 후 잔여 draw 지배 시에만)**: 병목이 **만 strokes**인지, **포인트 밀도**인지, 둘 다인지 정리한다. strokes 병목이면 path 생략 기대치를 낮추고 time-slicing/Worker 판단 비중을 올린다.
- **Q2 확정**: 갱신이 **append + fixed/predictable range**인지, **full replace + rescale**인지 정리한다. full replace/rescale이면 T2·cache 계열은 기본 후보에서 내려놓고 time-slicing/Worker 판단을 앞당긴다.
- **Q3 확정**: B-real을 공개 repro에서 어떤 규모로 재현할지 확정한다. 재현 규모가 불충분하면 B 전용 Worker 판단은 보류하고 A/main-only 경로부터 진행한다.
- **D4a/D4b 확정**: D4a(per-tick update end-to-end — Step 1.5)와 D4b(canvas redraw self-time — Step 2) 목표치를 baseline 대비 상대 목표로 각각 확정한다.
- **Go 조건**: Q0/Q2/Q3/D4a/D4b가 문서화되고(Q1은 Step 1.5 후 잔여 draw 지배 시에만), Step 1.5 후 라우팅·Step 2 sub-step 우선순위·Step 3 게이트 기준이 0a 결과에 맞게 갱신되면 Step 0b로 진행한다.
- **No-Go 조건**: 0a 결과가 기존 가정과 달라 Step 2/2.5/3/4의 순서나 필요성이 바뀌면, 계획을 먼저 수정하고 다시 review한다.

### Step 0b — 품질 보증 기반 구축
Step 0b는 Q1/Q2/Q3 의사결정의 선결 조건은 아니지만, **회귀 위험이 있는 Step 1~2.5 적용 전에 고정할 품질 보증 작업**이다. 회귀 축을 둘로 나눠 **선결 시점을 다르게** 둔다:
- **기능 회귀(tooltip 값 정확성) → Step 1의 선결 조건**: Step 1은 hit test를 바꿔 tooltip 값·hover 대상이 달라질 수 있으나 **그림 자체는 바꾸지 않으므로**, golden screenshot이 아니라 tooltip 값 정확성 테스트가 먼저 있어야 회귀를 잡는다.
- **시각 회귀(golden screenshot/pixel-diff) → Step 2·Step 2.5의 선결 조건**: path 생략·putImageData·RenderCore 분리는 픽셀 출력에 영향을 줄 수 있으므로 그 적용 전에 고정한다.
- **계측 harness(수동 캡처만으로는 회귀 방지 불가)**: DevTools 수동 측정과 별개로 `performance.mark/measure`를 `createDataSet`/`drawChart`/`hitTest`/`commit` 단위에 심고, **interaction latency는 `pointermove` 입력 timestamp → tooltip paint 완료까지**로 측정한다. repro 예제에 자동 수집 스크립트를 붙여 이후 Step이 같은 harness에서 비교되도록 한다. (단, 영구 계측 코드가 아니라 repro/벤치 페이지 한정 — 라이브러리 본체엔 남기지 않음.) Step 0a가 최소 mark/measure 없이 수동 baseline만 남긴 상태라면, harness 적용 직후 동일 시나리오를 재측정해 D4a/D4b 기준 baseline으로 교체한다.
- **기능 회귀 매트릭스(성능과 별도 축)**: batch·putImageData·path 생략·RenderCore 분리는 시각/동작에 영향을 줄 수 있으므로(**특히 path 생략·putImageData는 출력이 시각적으로 동일해야 함(golden screenshot 허용 오차 내)** — 회귀 매트릭스가 이를 강제), 비교용 케이스 매트릭스를 고정한다 — `line·bar·scatter·heatmap·pie` × `log scale·stacked·negative·hidden/visible legend toggle·zoom/brush/group/overlay·resize/DPR 변경·tooltip formatter·axis formatter`. 각 타입에 golden screenshot(또는 pixel-diff) 기준을 잡고 **tooltip 값 정확성 테스트는 시각 회귀와 분리**한다.

### Step 1 — T3 hit test 축소 (가장 먼저, 1급 필수)
반응성 1차 직격. binary search 한 줄로는 부족(§2 hit test 참조) → **①~④를 묶어야 O(log)에 근접**:
> **범위 주의**: Step 1은 **hover 핸들러 비용**을 직격한다(저위험·고립). "**갱신 중** freeze 없음"의 지배 병목은 시나리오 2-3(매 틱 createDataSet+full redraw의 Long Task)이며 Step 2/3 소관이다 — 메인이 redraw Long Task에 막혀 있으면 hover 핸들러가 O(1)이어도 실행 자체가 안 되므로, Step 1 단독으로는 "갱신 중 hover latency"를 검증할 수 없다.
- **③ per-label 유효성 검사 제거(핵심)**: 라벨 인덱스별 "유효 시리즈 존재" 비트/카운트를 **사전 계산**.
  - *소유·시점*: createDataSet 산출 시점에 model 레이어에서 라벨별 집계.
  - *무효화*: 데이터 변경·시리즈 `show` 토글 시 재계산.
  - → per-hover `sIds.some()`(`:1139`) 곱셈항을 **O(1) 조회**로 대체.
- **④ avgInterval(`:1105`)**: 라벨 위치 단조성 전제 위에서 **1회 계산·캐시**, 범위 변동 시만 무효화.
- **① 위치 탐색(`:1089`)**: 라벨 위치 단조성(category/time 축은 인덱스 순 단조) 확인 후 **binary search**. all-null 라벨이면 위 ③ 사전계산으로 바깥 스캔 없이 유효 라벨 점프.
- **② 수집(`:947`)**: per-series 포맷팅·`measureText` 경량화.
- **color picking(pick buffer)은 directHit(단일 시리즈) 보조로만** — 1픽셀=1시리즈라 'x라벨 멀티시리즈 tooltip' 시맨틱 대체 불가, line은 얇아 픽셀 hover 불리(추가 렌더 패스·AA off·`willReadFrequently` caveat).
- **hit/tooltip은 항상 raw 기준(매핑 문제 없음)**: Step 1 인덱스는 **raw 데이터 인덱스 기준**으로 짓는다. **path 생략은 draw 단계의 path 명령 최적화일 뿐 hit test 데이터(라벨·시리즈 값 배열)는 항상 전체 raw를 사용**하므로, 별도 tooltip 데이터 정책이 필요하지 않다(hover/tooltip이 가리키는 값 = 원본값으로 고정).
- **검증(Step 1 단독)**: 만 개 시리즈 hover 시 `findClosestDataIndex` self-time이 곱셈항 O(라벨×시리즈) 제거로 baseline 대비 감소 + **갱신 틱과 안 겹친(유휴 시)** hover interaction latency p95 ≤ 100ms. **"갱신 중" freeze 없음/latency는 Step 2(틱 Long Task 단축)+Step 3 게이트가 책임진다.** 단 **"갱신과 겹친 hover" latency도 참고 지표로 함께 수집**한다(목표 판정엔 안 쓰되, Step 1이 단독으로는 부족하고 Step 2/3가 필요함을 수치로 드러내기 위해 — hit test가 O(1)이어도 메인이 redraw Long Task에 막히면 pointer 처리 자체가 늦으므로).
- **실측 반영(2026-06-09, 실행 완료)**: Step 1은 **③(per-label 유효성 사전계산 = `buildLabelValidMask`)으로 dominant term만 제거**했고, **①binary search·④avgInterval 캐시는 의도적으로 미구현**(단순함 우선 — 타깃 프로파일이 '만 시리즈·소수 라벨'이라 잔여 O(라벨) 항은 무시 가능, ①은 monotonic·tie 리스크). 이 둘은 **Step 1.5 재측정에서 hitTest가 여전히 지배항일 때만 재검토**한다(그 외엔 추가하지 않음).

### Step 1.5 — 데이터 파이프라인 비용 제거 (신규·측정 기반 최우선 / render-time 2차 직격)
> **추가 근거**: 2026-06-09 측정(§1 측정 갱신·§2 데이터 파이프라인 비용·`playwright-probe.md`)에서 per-tick self-time의 ~80%가 `Chart.vue` 데이터 watcher의 **cloneDeep(④) + deep-watch traverse(①) + 다수 isEqual(③)** 이고 실제 렌더는 <10%로 나왔다. **이 작업이 render-time(2차) 최대 레버**이며, Step 2(렌더/path)·Step 2b/2c/2d·Worker보다 우선한다.
>
> **핵심 원칙(사용자 확정 2026-06-09)**: **소비자 무수정 — 기존 사용처 코드·공개 API·기본 동작 전부 불변, 순수 내부 성능 개선만.** `cloneDeep`/`deep:true`/`isEqual`은 단순 비용이 아니라 **공개 API 계약을 떠받친다**(in-place mutation 감지, 입력 객체 alias 차단, 내부 변형 역류 방지). 따라서 **계약 감사(1.5-0)를 먼저 닫고**, **콜백 내부 비용(F0·F1·F3·F4)만** 줄인다. **계약을 바꾸는 변경(F2 default 변경, opt-in API 신설)은 하지 않는다** — 소비자가 무언가를 켜거나 바꿔야 효과가 나는 건 "사용처 무수정" 취지에 어긋나므로 범위 밖.

- **증상 위치 vs 근본 위치**: 증상(느린 갱신)은 harness `drawChart`(mutate→flush)에서 관측되지만, 원인은 **소비자 데이터를 받는 상류 watcher**(`Chart.vue:231-263`, `cloneChartData` `uses.js:277`)다. 라이브러리 코어 수정이라 회귀 위험이 높다 → **Step 0b에서 구축한 회귀 안전망(tooltip 값 정확성 spec + 전 타입 golden screenshot) 위에서만 진행**(순서상 Step 1.5가 Step 2보다 먼저이므로 안전망 출처는 Step 0b).

#### Step 1.5-0 — 데이터 계약 감사 (선결·코드 변경 없음, characterization)
> Step 2.4(drawChart 목록화)처럼 **코드부터 고치기 전에 계약을 표로 닫는다.** F0~F4 채택안은 이 표 없이 정하지 않는다.
- **추적 경로(메인 + zoom/group 둘 다 — zoom 경로 누락 금지)**:
  - 메인: `props.data → getNormalizedData → cloneChartData → evChart.data → createDataSet/render/hitTest/tooltip`.
  - **zoom 경로(per-tick clone 재발 지점)**: data watch가 `setDataForUseZoom(newData)`(`Chart.vue:259`) 호출 → `uses.js:645`에서 **zoom 사용 시 `cloneChartData`를 한 번 더**(`evChartClone.data`) → `EvChartZoom.executeZoom`(`chartZoom.core.js`)이 **`this.evChartProps.data[idx]`를 직접 참조**해 필터링/대입.
  - **group 경로**: EvChartGroup의 watch / `evChartPropsInGroup` 경로.
  - 각 구간에서 **mutation(필드 추가·정렬·splice·보정값 주입·min/max 캐싱) / alias(입력 배열·point 객체 참조 공유) / cache 의존**을 목록화. **특히 F0/F1의 `toRaw`·구조 공유가 zoom 경로에서 원본 변형·stale clone·clone 비용 재발을 일으키지 않는지 반드시 확인**(zoom의 `cloneChartData`도 같은 정책으로 통일).
- **확인 질문**: ① `evChart.data` 이후 내부에서 data point에 필드를 더하거나 정렬/splice 하는가(=클론이 입력 alias 차단 역할인가)? ② 소비자가 `props.data[i].data.push(...)` 같은 **in-place mutation**으로 갱신하는 사용 패턴이 docs 예제·테스트·실사용에 있는가(=deep watch가 그걸 잡고 있는가)? ③ `isEqual` 각 호출이 산출하는 update 플래그(`isUpdateSeries`/`isUpdateData`/legend/tooltip)가 무엇을 gating 하는가?
- **산출물**: (a) 위 mutation/alias/cache 표, (b) **cache invalidation matrix** — `data` / `series schema` / `axis scale` / `layout` / `style/theme` / `interaction index(hit/tooltip)` 각각이 어떤 입력 변경에서 재계산돼야 하는지. 이 matrix가 F3(dirty 플래그) 설계 범위를 확정한다.
- **검증**: 표·matrix 완성 + F0~F4 각 후보가 어떤 계약을 건드리는지 매핑되면 완료(성능 중립).

#### 수정 후보 (1.5-0 감사 후 채택안 확정 — 단독 결정 금지)
- **F0. normalize 비-mutating 전환 (선결·필수·F1보다 먼저)** — `getNormalizedData`(`uses.js:330`)가 `defaultsDeep(data, DEFAULT_DATA)`로 **첫 인자(원본 `props.data` = reactive proxy)를 target으로 mutate**한다(lodash `defaultsDeep`는 target 변형). 결과: ① **원본 불변 계약을 현재도 위반할 위험**(DEFAULT_DATA 누락 키가 소비자 객체에 주입), ② reactive proxy를 mutate해 `set`/`trigger` trap 유발. → `getNormalizedOptions`처럼 **빈 target**(`defaultsDeep({}, data, DEFAULT_DATA)`)으로 전환해 계약 리스크를 없애되, **빈 target만으로는 `data`가 reactive proxy인 한 전체 `get` trap을 여전히 탄다**(측정상 주요 비용). 따라서 **입력을 `toRaw(data)`(또는 raw snapshot)로 받아 proxy traversal 비용까지 제거**하고, **이 비-mutating·raw-input normalize를 clone과 통합**(원본 불변 + proxy 분리 + 1회 복사). **F0 없이 F1만 하면 normalize의 reactive mutation·traversal 비용과 계약 리스크가 그대로 남는다.** (현존 잠재 버그 성격 — 1.5-0 감사에서 원본 오염 실제 영향 확인.)
- **F1. per-tick `cloneChartData` 전체 딥클론(④) 축소 (F0와 통합)** — **핵심 통찰**: `cloneDeepWith`가 **reactive proxy인 `props.data`를 순회**하면 매 프로퍼티 접근이 reactive `get`/`noTracking` trap을 타므로, `baseClone`(~24%)뿐 아니라 `get`/`noTracking`(반응성 ~58%의 일부)도 클론이 유발한다 → **클론을 줄이면 반응성 get 비용도 동반 감소**(재측정 확인). 옵션: (a) 클론 대상에서 `toRaw`로 proxy를 벗긴 뒤 복사(복사는 하되 trap 비용 제거), (b) 변경분만 클론(구조 공유)으로 복사량 감축. *리스크*: 얕은/부분 복사 시 nested array/point 객체 alias 잔존 → 입력 역류·stale. 클론은 **입력 alias 차단·내부 변형 역류 방지** 역할이 있으므로 **1.5-0 감사에서 내부 mutation/alias가 없음이 확인된 범위에서만** 축소. **입력 소유권 이전(클론 완전 제거)은 소비자 계약 변경이라 안 함.** → **feature flag로 격리해 harness에서만 켜 A/B 비교** 후 동작·출력 불변 확인 시 default 승격.
- **F2. `deep:true` watch traverse(①) 회피 — 범위 밖(보류, 소비자 무수정 제약)**: `props.data`의 deep watch는 소비자 in-place mutation 감지 계약이라 default 변경·opt-in API 신설 모두 안 한다. **traverse 고유분(변경 감지용 Vue 내부 순회)은 잔존**한다. 단, 콜백 내부 클론/비교가 reactive proxy를 훑으며 발생하던 `get`/`noTracking` trap 비용은 F1/F3로 동반 감소할 수 있다(아래 F1 참고). **재측정에서 traverse가 새 지배항으로 남으면** 그때 사용자와 opt-in 여부를 별도 논의(이 step에서 결정하지 않음).
- **F3. 중복 deep `isEqual`(③) 축소** — 1.5-0의 cache invalidation matrix 기반 dirty 플래그로 비교 횟수 통합. *리스크*: 과소 업데이트(갱신 누락). matrix의 모든 축(data/series/axis/layout/style/interaction)을 커버해야 함. **판정 규칙(필수)**: deep watch는 **in-place mutation 시 같은 root reference로 콜백이 진입**하므로 **object identity(===) 기반 dirty 판정은 누락**한다 → ① **deep-watch(in-place) 트리거로 들어온 경우 보수적으로 `updateData=true`(필요 시 `updateSeries=true`) fallback**, 또는 ② cheap **snapshot/hash(길이·셀렉트 키 등)** 기반 판정으로 **정확성 우선**(isEqual 축소는 안전 판정이 가능한 구간에 한정).
- **F4. `getNormalizedData` 전체 순회(②) 축소 (plan-review 지적·누락 보완)** — ①③④를 줄이면 **normalization이 다음 병목으로 이동**할 수 있다. 옵션: append 전용 fast path / normalizedData 캐시(변경분만 재정규화). *리스크*: 캐시 무효화 누락.

- **채택 범위 (소비자 무수정 — F2 제외, F0는 선결로 항상 포함)**:
  - *최소(저위험·먼저)*: **F0+F1(flag)** — normalize 비-mutating/raw 전환 + 클론(~24%) + 클론/normalize가 유발한 반응성 get trap 동반 감소. 1.5-0이 alias 없음 확인 시.
  - *최대(이번 step 목표)*: **F0+F1+F3+F4** — normalize(원본 오염 제거+proxy 분리) + 클론 + 중복 isEqual + normalize 캐시까지 watch 콜백 **내부** 비용 전부 축소. deep watch traverse 고유분만 잔존. **전부 콜백 내부라 소비자 동작·공개 API 불변.**

- **데이터 불변 제약 유지**: 출력(그림·tooltip 값·hit 대상)은 불변. "같은 결과를 더 싸게 계산"하며 데이터 의미를 바꾸지 않는다.
- **모호 항목 사전 확정**: ① **non-reactive 판정기준** = `isReactive`/`isRef`(Vue proxy) 기준으로 한정(freeze/readonly/typed array는 별도 케이스로 분리). ② **"클론 없이 소유"(입력 소유권 이전)는 소비자 계약 변경이라 채택하지 않음** — 클론은 줄이되(toRaw/구조 공유) 입력 alias 차단은 유지.

- **검증(plan-review 반영 — golden+tooltip만으로는 계약 검증 불가)**:
  1. **회귀 0**: tooltip 값 정확성 spec + 전 타입 golden screenshot(Step 0b 안전망) + `test:run`·`test:visual` 통과.
  2. **데이터 계약 신규 테스트**: ① 원본 `props.data`가 내부 처리 후 변형되지 않음(불변성·alias 없음), ② **deep watch 유지 확인 — in-place mutation(`data[i].data.push`)이 기존과 동일하게 반영**, ③ F3 dirty 플래그 적용 후에도 모든 update 경로(series/labels/groups/legend/tooltip)가 누락 없이 갱신, ④ F4 normalize 캐시 적용 후 빠른 연속 tick에서 stale 미표시, ⑤ tooltip/hit-test가 직전 frame 인덱스를 참조하지 않음, ⑥ destroy/recreate 후 watcher·cache·reference leak 없음.
  3. **재프로파일(필수·핵심 산출)**: 동일 repro에서 CDP Profiler/DevTools self-time 재측정 → cloneDeep/traverse/isEqual/normalize 비중 감소 + **남은 지배항(createDataSet? drawSeries? commit?)** 을 `measurements.md`에 **고정 형식**(median/p95, sample count, warmup 5tick, GC 포함 여부, heap allocation, long task, interaction latency, **top self-time category**)으로 기록. **이 재분해가 Step 3 게이트 입력.**
  4. **측정 매트릭스(단일 시나리오 일반화 방지)**: A-single 외 `full-replace`·`in-place mutation`·`multi-chart(B-real)`·`resize`·`legend toggle`·`tooltip hover` + 주요 타입(line·bar·scatter·heatmap·pie) 대표 케이스를 최소 1회씩 측정해 타입/패턴별 회귀를 확인.

- **권장 실행 순서**: 1.5-0 계약 감사(mutation/alias/invalidation matrix) → **F0(normalize 비-mutating·raw 입력 전환)** → F1 flag 격리 실험·default 승격 → F3 dirty 플래그(matrix 기반) → F4 normalize 캐시 → 재측정 기준 고정. (F2는 범위 밖.)
- **라우팅(단일 흐름 — Step 1.5 후 무조건 Step 2를 잇지 않는다)**: Step 1.5 + 재측정 → **재분해 self-time의 지배항이 다음을 결정**한다:
  - (a) **data pipeline이 더 이상 지배항 아님 + latency/freeze 합격** → **종료(Worker·Step 2 추가 불필요).**
  - (b) **drawSeries/createDataSet(잔여 draw)이 지배** → Step 2(2a/2c/2d). 이때 비로소 Q1(strokes vs points) 판단이 의미.
  - (c) **commit/drawImage 지배** → Step 2.5-a 또는 **OffscreenCanvas/Worker**(현재 <1%).
  - (d) **latency/freeze만 미달**(D4는 통과) → **Step 3 게이트**: time-slicing → 그래도 미달이면 Worker.
  - (e) **pure deep-watch `traverse`가 지배**(F0/F1/F3로 못 줄임) → default 유지 전제하 **F2 opt-in/계약을 사용자와 별도 논의**.
  → 즉 Step 1.5의 출력(재측정 지배항)이 Step 2/Step 3/Worker/F2 중 무엇으로 갈지를 가른다.

### Step 2 — 알고리즘 최적화 + path 생략 (render-time 2차 직격, 1급)
Step 0a 분류대로 적용. **모든 수단은 출력이 시각적으로 동일한(golden screenshot 허용 오차 내) 데이터 불변 최적화로 한정한다(데이터·곡선·tooltip 불변).** path 생략은 path 빌드·rasterize 비용을, 나머지 알고리즘 최적화(batch/putImageData/캐시/할당 감축)는 redraw·packing self-time을 줄인다. **N 자체를 솎는 다운샘플링·시리즈 culling은 출력을 바꾸므로 채택하지 않는다** → render-time 이득은 데이터 불변 범위로 제한되고, 그래도 부족하면 Step 3 게이트에서 time-slicing/Worker로 넘긴다.

> **실행 단위는 Step 2a~2d로 분리한다.** 아래 항목은 한 난이도의 묶음이 아니다. 쉬운 항목과 구조 변경·자료구조 변경·픽셀 출력 리스크가 큰 항목을 한 커밋/한 일정으로 묶지 않는다. 각 sub-step은 **독립 PR·독립 baseline 비교·독립 회귀 검증**으로 통과한 뒤 다음으로 간다.

- **Step 2a — low-risk draw skip(hidden 시리즈 skip + path 생략)**: `series.show=false` 변환/draw skip과 line 연속 동일픽셀 `lineTo` 생략을 **저위험 보조 최적화**로 먼저 적용한다. **path 생략을 메인 카드로 취급하지 않는다** — 포인트 밀도 병목에만 효과가 있고 series/stroke 수 병목(만 strokes = 시리즈당 `stroke()` 1회 × 만 개)에는 제한적이다. `lineTo` 수만 줄이고 `stroke()` 수는 못 줄인다는 전제를 검증에 명시하되, **실제 기대 가중치는 Step 0a Q1 실측에 묶어둔다**(stroke가 병목이라고 측정 전에 단정하지 않는다).
- **Step 2b — cache 계열**: scale cache·정적레이어 cache를 적용한다. Step 0a에서 append + range 안정으로 분류된 경우에만 유효하며, full replace/rescale·legend toggle·resize·DPR 변경에서는 무효화 비용까지 같이 측정한다.
- **Step 2c — createDataSet 잔여 할당/자료구조 감축**: 일반 line/bar 포인트 객체 재사용은 이미 일부 적용됐으므로, 남은 새 배열 생성·stack/scatter/heatMap 경로·raw object fallback·SoA/typed array 전환을 별도 단계로 다룬다. 자료구조·GC·hit/tooltip 참조 계약에 영향이 크므로 Step 2a/2b와 분리한다.
- **Step 2d — 타입별 draw 고위험 최적화**: scatter batch와 heatmap `putImageData`를 각각 별도 검증한다. 특히 heatmap은 픽셀 생성·색상 매핑·DPR·alpha 차이 리스크가 커 Step 2 마지막에 둔다.

| 대상 | 현재 | 최적화 | 비고 |
|---|---|---|---|
| **path 생략** | 전 포인트마다 `lineTo`(`element.line.js:184`) — 같은 픽셀에 떨어져도 각각 호출 | 직전 찍은 점과 **완전히 같은 (x,y) 픽셀**인 연속 점은 `lineTo` 생략 (**line 연속 lineTo 한정 + 아래 제외 조건**) | 화면 출력 시각적 동일(golden screenshot 허용 오차 내). spike는 다른 픽셀이라 **항상 보존**. 효과는 점이 픽셀에 충돌할 때만(가로 점밀도 > 픽셀폭). **데이터·tooltip·hit 불변(draw 단계 한정)** → opt-in 플래그 불필요(기본 활성). 픽셀 위치가 축 범위·DPR에 의존하므로 range/resize 시 재계산. **적용 조건은 표 아래 보수적 제한을 따른다.** |
| **hidden 시리즈 변환 스킵** | generic line/bar 경로는 `series.show=false`여도 createDataSet 변환 루프에 들어간다(`model.store.js:53-99`) | show=false 시리즈는 변환·draw 자체를 건너뜀 | 안전한 데이터 불변 최적화 — 이미 안 그려지는 시리즈라 출력 불변. 범례 show 상태는 **절대 덮어쓰지 않음**(사용자가 켠 시리즈를 끄지 않음). |
| scatter | 포인트마다 `beginPath`+`fill`(`element.scatter.js:175`, `helpers.canvas.js:86`) | 동일 스타일 **batch(Path2D 1개)** / sprite drawImage | beginPath 수천~만 → 스타일 그룹 수 |
| heatMap | 셀마다 `fillRect`(`element.heatmap.js:187,191`) | **putImageData 1회** / 타일링 | 큼 |
| line | 시리즈당 단일 stroke(이미 최적) | 연속 동일픽셀 점 `lineTo` 생략(아래 제외 조건 준수) | stroke 수(=시리즈 수)는 데이터 불변 수단으로 못 줄임 → 알고리즘 opt·time-slicing 소관 |
| 공통 scale | 매번 calculateSteps | 입력 동일 시 캐시 | **축 범위 변동 시 매 틱 무효 → 0**(분류 b면 효력 없음) |
| 공통 정적레이어 | 매번 drawAxis | 축/그리드 buffer 캐시, 시리즈만 redraw | **축 범위 고정 시에만**(분류 b면 무효) |
| **createDataSet 잔여 할당/자료구조** | 일반 line/bar 포인트 객체 재사용은 일부 적용됨(`addSeriesDS:550`, `prevData`), 하지만 매 틱 새 배열·전 시리즈 순회·stack/scatter/heatMap 별도 객체 경로는 남음 | 남은 배열 churn 감축, stack/scatter/heatMap pool 검토, 필요 시 SoA·typed array 전환 | 메인 경로. path 생략은 draw 비용만 줄이고 **createDataSet 순회/자료구조 비용은 그대로** → Step 0a 분해에서 이 비용이 지배적이면 1급. 부록 A.1 자료구조 전제와 연결 |

- **path 생략 적용 조건(보수적)**: **line chart의 연속 `lineTo`에만 우선 적용**한다. 단, 생략 대상 점이 **segment 방향 전환점·null 경계·area fill 경계·step-line 경계·point marker/showValue 기준점**이면 생략하지 않는다 — 같은 픽셀이라도 path 모양·채움 형상·마커 위치에 영향을 줄 수 있기 때문이다. antialiasing·lineJoin·선 두께·alpha로 미세 차이가 날 수 있으므로 **byte 동일이 아니라 golden screenshot 허용 오차**로 검증한다. 다른 타입(scatter/bar/heatmap/pie)·area·step-line으로의 확대는 각 타입의 회귀 통과를 본 뒤 별도 판단.
- **검증**: redraw self-time + per-tick Long Task가 baseline 대비 감소, **D4b(redraw self-time) 목표치 충족**. path 생략·알고리즘 최적화 후 **시각 회귀 0(golden screenshot 허용 오차 내)** + hit/tooltip 정확성 유지(데이터 변경 없음).

### Step 2.4 — drawChart 책임 목록화 (Step 2.5 선결, characterization)
> RenderCore 분리는 사실상 리팩토링 프로젝트다. 코드부터 찢기 전에 `drawChart`가 하는 일을 먼저 **목록화**해 분리 경계를 확정한다. **산출물은 표 1개로 고정**하고(분석 마비 방지) 끝나는 조건을 명확히 한다.
- **산출물(표 1개)**: `drawChart`와 그 직접 호출 함수(`initScale`/`getAxesRange`/`getLabelOffset`/`calculateSteps`/`adjustXAndYAxisWidth`/`drawAxis`/`drawSeries`/`drawTip`/buffer→display commit)의 각 작업을 행으로, 아래 열로 분류한다.
  - **의존 분류**: DOM 의존(`getBoundingClientRect`·legend/tooltip DOM 등) / canvas 의존(ctx·`measureText`) / model 의존(`seriesList`·`dataSet`·axes) / plugin 의존(plugin hook·formatter).
  - **분리 가능 여부**: RenderCore(순수 렌더)로 뺄 수 있음 / ChartShell(DOM·layout 주입)에 남아야 함 / 미정.
- **이걸로 결정되는 것**: Step 2.5의 mini-step 경계(commit→series→static→prepare)가 표의 "분리 가능" 묶음과 일치하는지 검증하고, DOM 의존 작업은 ChartShell이 주입할 값으로 확정한다.
- **검증**: 표가 완성되고 Step 2.5-a~d 각 mini-step이 표의 어떤 행을 옮기는지 매핑되면 완료. **코드 변경 없는 순수 분석 단계**(성능 중립).

### Step 2.5 — RenderCore 단계 분리 (main-only 선행, 게이트·Worker 공통 전제)
> **Worker 조건부 작업만은 아니다.** `drawChart()` 분해는 **메인 경로에도 가치**가 있고(time-slicing yield 지점·정적레이어 캐시 경계가 명확해짐), Worker 진입 시 그대로 재사용된다. 다만 전체 분리는 큰 리팩토링이므로 **게이트(Step 3) 전에는 2.5-a `commitToDisplay` 분리까지만 최소 선행**한다. 2.5-b~d는 Step 3에서 time-slicing 또는 Worker 가능성이 남은 경우에만 확대 진행한다.
>
> **중요: Step 2.5의 mini-step은 성능 개선 작업이 아니라 구조 안정화 작업이다.** 각 단계의 목표는 redraw를 빠르게 만드는 것이 아니라 렌더 파이프라인 경계, cache/yield 지점, Worker 후보 경계를 안정화하는 것이다. 따라서 각 mini-step의 기대 성능은 **중립(회귀 없음)** 이고, 성능 개선 수치는 Step 2/Step 3에서만 판정한다.
- `drawChart()`를 `prepareLayout`/`prepareScale`/`drawStaticLayer`/`drawSeriesLayer`/`commitToDisplay` 단위로 분리한다. worker 없이 **메인에서 그대로 호출 가능**하게 설계. **한 번에 다 쪼개면 Step 2.5 자체가 큰 프로젝트가 되므로, 출력단(commit)→입력단(prepare) 순서로 mini-step을 나눠 각 단계를 독립 커밋·독립 회귀로 통과시킨 뒤 다음으로 넘어간다**:
  - **Step 2.5-a — `commitToDisplay` 분리**: display 쓰기(buffer→display `drawImage`, worker 경로의 ImageBitmap blit)를 별도 함수로 추출. 가장 작고 경계가 명확해 먼저 한다.
  - **Step 2.5-b — `drawSeriesLayer` 분리**: line/bar/scatter/heatmap/pie 본체 + path 생략·plotArea clipping을 한 단계로 묶음. 데이터량이 큰 핵심 단계라 time-slicing yield·worker 이관의 주 대상. **Step 3에서 latency/freeze가 남거나 Worker PoC 후보가 생긴 경우 진행**한다.
  - **Step 2.5-c — `drawStaticLayer` 캐시 경계 분리**: axis/grid/static label을 분리하고 **축/크기/theme 불변 시 캐시** 경계를 세움(분류 (a)에서만 유효, (b)면 매 틱 무효). **Step 3에서 정적레이어 캐시 또는 time-slicing 경계가 실제 필요할 때 진행**한다.
  - **Step 2.5-d — `prepareLayout`/`prepareScale` 정리**: layout(chartRect/labelOffset)·scale(axesRange/steps) 계산을 draw에서 떼어 앞단으로. DOM 의존 값은 ChartShell이 계산해 주입. **Worker PoC 또는 prepare 단계 yield가 필요할 때 진행**한다.
- **plugin/확장 계약 검토(필수)**: 이 분리가 기존 plugin hook·event hook·custom formatter·custom series renderer를 깨지 않는지 확인. **public/private API 경계와 plugin lifecycle 호출 순서를 표로 정리**한 뒤 분리에 착수.
- **검증**: **각 mini-step(a~d)마다** 분리 전후 전 타입(line·bar·scatter·pie·heatmap·combo) 시각/인터랙션 회귀 0 + EvChartGroup/Brush 동작 유지(§4 Step 0b 회귀 매트릭스). 순수 구조 변경이므로 **redraw self-time은 성능 중립**(회귀 없음)이어야 함.
- **Exit Criteria(완료 기준)**:
  - `drawChart()`가 대량 렌더 파이프라인의 직접 구현체가 아니라 RenderCore 단계 호출의 얇은 orchestration layer가 된다.
  - 신규/변경 렌더 경로에서 `drawChart` 내부 구현을 직접 우회 호출하지 않고, `prepareLayout`/`prepareScale`/`drawStaticLayer`/`drawSeriesLayer`/`commitToDisplay` API를 사용한다.
  - RenderCore가 DOM 이벤트·tooltip DOM·legend DOM 없이 **단독 실행 가능한 순수 렌더 단위**가 된다(필요한 layout/scale/contract는 ChartShell이 주입).
  - Step 4에 진입할 경우 Worker 경로가 별도 렌더 구현을 만들지 않고 **동일 RenderCore API를 재사용**할 수 있음을 최소 PoC 또는 API-level test로 증명한다.
  - 메인 RenderCore 결과와 Worker 후보 RenderCore 결과가 golden screenshot 허용 오차 내에서 동일하다.

### Step 3 — Worker 필요성 게이트 (고위험 리팩토링 진입 전 필수)
T3 + **Step 1.5 및 (필요 시) Step 2** 적용 후, **메인-only 수단만** 얹어 1차 합격선이 충족되고 2차 목표가 유지되는지 **프로파일 A·B 양쪽에서** 측정. (Step 1.5 후 라우팅에서 (d) latency/freeze만 미달인 경우 이 게이트로 들어온다.)
- **게이트 기준(1차 + 2차 동시 충족)**: "갱신 틱과 겹친 hover/click의 실제 **interaction latency p95 ≤ 100ms + freeze 없음**" **AND** "**D4a(per-tick update end-to-end)/D4b(redraw self-time) 중 해당 지표 유지**"(Step 1.5는 D4a, Step 2는 D4b 기준). 측정은 같은 repro에서 warm-up 5 tick 후 최소 30 tick 동안 수행하고, freeze 여부는 눈대중이 아니라 Long Task 구간과 입력 지연 로그를 함께 본다. (per-tick Long Task 50ms 여부는 보조지표일 뿐 — 초당 1회면 100ms대 단일 task가 떠도 latency 합격선은 통과 가능하므로 일차 기준으로 쓰지 않음.) **time-slicing으로 사용자가 덜 멈춘다고 느껴도 end-to-end render 완료 시간이 D4를 벗어나면 게이트 통과가 아니다.**

**두 축을 분리한 decision tree(상호 배타)**:
- **축1 = D4(a/b) 충족 여부**, **축2 = 1차(latency p95 ≤ 100ms + freeze 없음) 충족 여부**. 프로파일 A·B 각각 두 축을 본다.

1. **D4(a/b) 미달이 하나라도 있으면 → Worker로 가지 않고 "D4 실패 시 원인별 라우팅"(아래 표)을 먼저 적용**한다. Worker는 총 작업량을 줄이지 않으므로 D4(render-time/update-e2e) 문제의 답이 아니다.
2. **D4(a/b)를 충족한 전제에서만, 1차 축으로 Worker를 판정**한다:

| (D4 충족 전제) 1차 결과 | 결정 |
|---|---|
| **A 1차 통과 + B 1차 통과** | Worker 트랙 종료. 부록 A는 backlog/deferred로 유지 |
| **A 1차 통과 + B 1차 실패** | B만 Worker 풀 + coalescing PoC 검토. B-real 수치로 D3 확정 |
| **A 1차 실패 + B 1차 통과** | A만 제한적 Worker PoC 검토(단일 차트 오버헤드 caveat) |
| **A 1차 실패 + B 1차 실패** | B(풀+coalescing) + A(제한적) 모두 Worker PoC 검토 |

> 단, 1차 실패라도 **time-slicing(yield)을 먼저** 적용해 충족되면 Worker 불필요(아래 "원인별 라우팅"의 latency-only 행).

- **D4 실패 시 원인별 라우팅** (전제: Step 0b 계측으로 redraw self-time이 createDataSet/drawSeries/commit/hitTest로 분해돼 있어야 함):

| D4 실패의 지배 원인 | 재검토 대상 |
|---|---|
| **데이터 파이프라인(cloneDeep/deep-watch/isEqual)** self-time 지배 | **Step 1.5 재검토** — F0(normalize mutate 제거)·F1·F3·F4가 실제로 비중을 줄였는지 확인. **그래도 pure deep-watch `traverse`가 지배하면**(F0/F1/F3로 못 줄임) default 유지 전제하 **F2 opt-in/계약을 사용자와 별도 논의**. **Worker/OffscreenCanvas로는 못 줄임(메인스레드 잔존)** |
| **createDataSet** self-time 지배 | Step 2c(잔여 할당/자료구조·typed array 전환) 재검토 |
| **drawSeries** self-time 지배 | Step 2a(draw skip)·Step 2d(scatter batch / heatmap putImageData) 재검토 |
| **commit/drawImage** self-time 지배 | Step 2.5-a(commit 분리) 또는 **Worker + OffscreenCanvas(ImageBitmap blit) PoC** 검토 — **OffscreenCanvas가 정당화되는 유일한 지배항**(현재 측정 <1%) |
| **hit test** self-time 여전히 지배 | Step 1(hit test 축소) 재검토 — 곱셈항·avgInterval이 실제로 안 줄었는지 확인 |
| D4는 통과했으나 **latency만 실패** | time-slicing(yield) → 그래도 미달이면 Worker 검토 |

- **메인-only 수단(분류에 따라 택1/병행)**:
  - (0) **path 생략·알고리즘 최적화**(Step 2에서 이미 적용) — 출력을 바꾸지 않는 범위에서 path·redraw 비용 축소.
  - (i) **T2 증분(슬라이딩 윈도우)+정적 레이어 캐시** — Step 0a에서 (a)append+범위안정으로 분류된 경우만.
  - (ii) **time-slicing(yield)** — (b)full-replace/동적rescale로 T2가 무효이거나, 단일·소수(A)에서 더 단순할 때. (b) 케이스에선 사실상 유일한 메인-only 카드. **yield 지점**: `createDataSet`/min-max scan/path 생략/hit-index build 같은 **JS 계산 단계부터** 쪼갠다(canvas draw 자체는 중간 yield가 어려워 타입별 chunked drawing 가능여부를 분류). **RenderCore 단계 경계(Step 2.5)가 자연스러운 yield 지점**. 스케줄링은 `scheduler.postTask` → `requestIdleCallback`/`setTimeout(0)` fallback.
- **프로파일 A**: scheduler window 안에 heavy job이 0~1개라 pile-up 없어 (i)/(ii)로 충족 가능성 높음 → 충족 시 상시 케이스는 Worker 없이 종료.
- **프로파일 B**: 짧은 scheduler window 안에 heavy job이 2개 이상이면(time-slicing도 pile-up으로 무력) → 여기가 Worker 풀(+coalescing)이 정당화되는 지점. 정확한 heavy/window 기준은 D3에서 Step 0a·Step 3 실측값으로 정한다.
- **검증/분기**: A·B 각각 **1차 합격선 + D4 render-time** 충족 → **그 프로파일 종료, Worker 불필요**. 이때 **Worker 트랙은 실행하지 않고 부록 A는 backlog/deferred로 남긴다**. Step 2.5-a만 완료했다면 그 상태로 유지하고, 2.5-b~d는 time-slicing/cache 경계가 실제 필요할 때만 진행한다. **D4만 미달**이면 Step 4가 아니라 Step 2 알고리즘/자료구조를 먼저 재검토한다. **D4는 통과했으나 latency/freeze만 미달**이면 time-slicing을 먼저 적용하고, 그래도 미달이면 Step 4(부록 A) 진행. **기본 진입 대상은 B**(병렬성 이득이 명확)이나, **A도 Step 1.5 후 라우팅 및 Step 3 이후에도 합격선 미달이면 제한적으로 Worker PoC 대상에 포함**한다(단일 차트는 병렬 이득 없이 off-thread freeze/TBT 개선만 — 부록 A.0/A.4의 오버헤드 caveat 적용).

### Step 4 — Worker 오프로딩 (조건부, 게이트 미통과 시 / B 우선·A 포함 가능)
> **진입 대상**: 기본은 프로파일 B다. 다만 프로파일 A도 Step 1.5 후 라우팅 및 Step 3 이후에도 interaction latency p95 ≤ 100ms·freeze 없음을 만족하지 못하면 **제한적으로 Worker PoC 대상에 포함**한다(단일 차트는 코어 병렬 이득이 없고 ImageBitmap 왕복 오버헤드가 더해져 end-to-end로 더 느릴 수 있으므로 — 부록 A.0/A.4 — 게이트 미달이 실측으로 확인된 경우에 한함). B에서 freeze가 실제로 남아도 문서상 Worker를 못 쓰는 구조가 되지 않도록 한다.

**Worker 채택 원칙**:
- Worker는 기본 기능이 아니다. Step 3 게이트를 통과한 프로파일에는 구현하지 않는다.
- PoC가 성공해도 모든 프로파일에 자동 적용하지 않는다.
- A 프로파일에서 end-to-end render가 메인-only보다 악화되면 A에서는 폐기한다.
- B 프로파일에서만 유효성이 입증되면 B 전용 경로로 유지한다.

PoC 범위와 합격/실패 기준은 **부록 A**. 순서: B2-minimal PoC → (성공 시) ChartShell 경계 마무리 + 모듈 싱글톤 worker 풀.
- 필수 선결: `helpers.util.js:5` 싱글톤 → `new OffscreenCanvas()`/환경 분기, worker 경로에서 `calcTextSize`/`htmlToElement` 같은 DOM helper 호출 격리, `scale.logarithmic.js:47`를 `calcTextSizeCanvas`로 통일.
- **Worker preflight**: heavy 차트에서 `showValue` 실사용률을 확인한다. ~0이면 worker-path v1에서 showValue를 **main text layer 합성조차 만들지 않고 완전 제외**(미지원 제약)로 확정할 수 있다. 1만 시리즈에 값 라벨은 시각·성능 모두 비현실적이므로 유력하지만, Step 0a 의사결정에는 필요하지 않다.
- **RenderCore 경계 완료 후 Worker 진입** — Step 3에서 Worker PoC 후보가 생긴 경우, Step 2.5-b~d를 먼저 완료해 RenderCore/ChartShell 경계를 닫는다. 그 뒤 Worker는 분리된 RenderCore의 **실행 위치만 메인→worker로 바꾸는 축소된 작업**이 된다.
- **검증**: 기존 예제(line·bar·scatter·pie·heatmap·combo) 전부 시각/인터랙션 회귀 없음 + 갱신 중 1차 합격선 유지 + EvChartGroup/Brush 동작 유지 + 메인 TBT Step 0a/0b baseline 대비 ≥50% 감소.

---

## 5. 부록 A — Worker 오프로딩 설계 (조건부)

> **이 트랙은 Step 3 게이트 미통과 시에만 실행한다.** 실행 문서에서 필요한 것은 상세 프로토콜이 아니라 **무엇을 PoC하고, 어떤 수치면 통과/폐기하는지**다. 메시지 schema·formatter 2-pass·font 동기화 같은 상세 설계는 PoC 통과 후 별도 설계 문서로 분리한다.

### A.0 PoC 범위
| 항목 | 결정 |
|---|---|
| 기본 방식 | **B2(ImageBitmap 왕복)**: worker OffscreenCanvas 렌더 → `transferToImageBitmap()` → main `drawImage` |
| 제외 방식 | **A(메인 bufferCanvas만 OffscreenCanvas 교체)** 는 같은 스레드라 1·2·3차 기여가 작음. 정지작업/호환성 확인 외 단독 가치 없음 |
| v1 범위 | **series-only worker**. axis/grid/label/overlay/tooltip/legend/brush/group은 main 유지 |
| v2 조건 | v1 통과 후에도 axis/grid가 잔여 병목일 때만 axis/grid worker 이관 검토 |
| B 측정 방식 | **모듈 싱글톤 worker 풀 + coalescing** 포함. 인스턴스별 worker 생성은 코어 폭발로 측정 왜곡 |
| A 측정 방식 | A가 Step 3 실패한 경우에만 제한 PoC. 단일 heavy job은 병렬 이득이 없으므로 end-to-end 악화 가능성을 먼저 본다 |

### A.1 선결 작업
| 선결 | 이유 |
|---|---|
| `helpers.util.js:5` top-level `document.createElement('canvas')` 제거/분기 | worker import 즉시 실패 방지 |
| worker 경로에서 DOM helper(`calcTextSize`, `htmlToElement`) 호출 격리 | worker에는 DOM 없음 |
| `scale.logarithmic.js:47`를 canvas 기반 text 측정으로 통일 | DOM span 의존 제거 |
| Step 2.5 RenderCore 경계 완료 | Worker는 새 렌더 구현이 아니라 RenderCore 실행 위치만 바꾸는 작업이어야 함 |
| heavy 차트 `showValue` 실사용률 확인 | v1에서 showValue main 합성까지 만들지, worker-path 미지원으로 둘지 결정 |

### A.2 PoC 측정표
| profile | mode | seriesCount | pointCount | packMs | transferMs | workerDrawMs | bitmapMs | mainCommitMs | main TBT | interactionLatency | endToEndRenderMs | 판단 |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| A-single | main-only |  |  |  |  |  |  |  |  |  |  | 기준 |
| A-single | worker v1 |  |  |  |  |  |  |  |  |  |  | 채택/폐기 |
| B-real | main-only |  |  |  |  |  |  |  |  |  |  | 기준 |
| B-real | worker pool |  |  |  |  |  |  |  |  |  |  | 채택/폐기 |

측정은 두 단계로 나눈다.
- **micro PoC**: tooltip/legend/interaction 비활성. pack/transfer/worker draw/ImageBitmap/main commit/TBT만 격리한다.
- **통합 PoC**: micro 통과 후 interaction을 켜고 갱신 중 hover/tooltip latency와 freeze 여부를 본다.

### A.3 PoC 합격선
| 판정 | 기준 |
|---|---|
| micro 통과 | 데이터 전송 latency(`packMs + transferMs`)가 render 주기의 **20~30% 이하**이고, main Long Task/TBT가 main-only 대비 감소 |
| 통합 통과 | 갱신 중 hover/tooltip latency p95 ≤ 100ms, freeze 없음 |
| 3차 통과 | 전체 목표는 Step 0a/0b baseline 대비 메인 TBT ≥ 50% 감소. Worker 채택 판단은 Step 3 main-only 결과 대비 추가 TBT 개선도 함께 비교 |
| A 채택 | worker v1의 `endToEndRenderMs`가 main-only보다 악화되지 않고 1차 합격선도 통과 |
| B 채택 | B-real에서 pool/coalescing 포함 worker가 1차 + 3차를 통과하고, Step 3 main-only 대비 D4를 더 악화시키지 않음 |

### A.4 실패/전환 기준
| 실패 조건 | 전환 |
|---|---|
| 전송 latency가 render 주기 30% 초과 | 렌더 worker 폐기. T3 + main render 유지, 또는 `createDataSet`/scale 같은 계산만 worker 후보로 재분류 |
| A에서 end-to-end render가 main-only보다 느림 | A는 worker 폐기. main-only(T3 + path 생략·알고리즘 최적화 + time-slicing) 확정 |
| B에서 pool/coalescing 후에도 TBT/latency 개선 부족 | Worker보다 Step 2 알고리즘·자료구조·B 갱신 coalescing 재검토 |
| worker URL/번들러 호환성 리스크가 해결 불가 | worker path 비활성. main-only fallback 유지 |
| 시각/interaction 회귀 발생 | Worker 채택 보류. RenderCore 계약/레이어 책임 재검토 |

### A.5 고위험 리스크(요약)
- **데이터 전송 비용**: Transferable 자체보다 main packing이 문제다. pack/transfer/unpack을 분리 측정한다.
- **SharedArrayBuffer 불가**: 라이브러리라 소비자 COOP/COEP를 강제하지 않는다. Transferable ArrayBuffer만 전제로 둔다.
- **좌표 동기화**: hover hit test는 main 즉답이어야 한다. worker 왕복으로 pointermove를 처리하지 않는다.
- **번들러/URL 리스크**: Vite/webpack/rollup 소비자 빌드에서 `new Worker(new URL())` 처리를 검증한다.
- **메모리 피크**: worker별 canvas, transfer buffer, ImageBitmap 누적을 측정하고, commit 후 `ImageBitmap.close()` 및 stale frame drop을 강제한다.

### A.6 상세 설계는 defer
PoC 통과 전에는 아래를 본문 실행 범위에 넣지 않는다.
- 메시지 schema(`ChartRenderContract`, `set-data`, `render`) 확정
- chart→worker affinity 라우팅/재분배 정책
- `revisionId` stale UX(무시 vs 직전 hit 유지)
- showValue formatter의 main text layer 또는 2-pass 프로토콜
- axis/grid worker 이관 시 font loading·measureText 일치 검증

### A.7 fallback ("기존 동작 동일" 아님)
OffscreenCanvas/Worker 미지원 또는 worker URL 깨짐 시 → **worker path만 빠지고 T3 + path 생략·알고리즘 최적화·T2는 메인에서 그대로 유지**한다. RenderCore를 메인에서도 호출 가능하게 설계하면 자연스럽다. "기존 동작"으로 되돌리면 저사양/호환성 환경에서 1차 합격선을 포기하게 되므로 fallback도 명시적 성능 경로로 취급한다.

---

## 6. 예상 효과와 검증 방법

### 예상 효과(가설)
> 아래 수치는 설계 우선순위를 잡기 위한 **측정 전 가설 범위**다. Step 0a baseline 또는 Step 0b 재측정 baseline 후 실제 병목(Q1/Q2/Q3)에 맞춰 보정하고, 각 step 완료 시 **예상 vs 실제**를 기록한다. 절대 보장치나 CI fail 기준으로 쓰지 않는다.

| 항목 | 기대 효과 범위 | 주 지표 | 전제/주의 |
|---|---:|---|---|
| **데이터 파이프라인 비용 제거(Step 1.5, 소비자 무수정)** | 콜백 내부 비용 표적: cloneDeep ~24% + 클론/비교가 유발한 반응성 get trap 일부. deep-watch traverse 고유분은 잔존 | `drawChart`(mutate→flush), self-time(`baseClone`/`isEqual`/normalize) | **측정상 최대 레버.** 채택=F0(normalize 비-mutating)+F1(클론)+F3(isEqual)+F4(normalize 캐시) (최소안 F0+F1), **F2(deep-watch)는 계약 보존 위해 제외**. Worker로는 못 줄임 |
| **T3 hit test 축소** | hover self-time 50~90% 감소 | `findClosestDataIndex`/hitTest self-time, 유휴 hover latency | 라벨×시리즈 곱셈항이 실제 dominant일 때. 갱신 Long Task 자체는 줄이지 않음 |
| **path 생략** | line draw self-time 5~30% 감소 | drawSeries/redraw self-time | 포인트 수 병목일 때만. **만 strokes 병목이면 효과 제한적** |
| **hidden 시리즈 skip** | hidden 비율에 비례 | createDataSet/drawSeries self-time | `series.show=false`가 많은 화면에서만 큼 |
| **scale/static cache** | redraw self-time 5~20% 감소 | prepareScale/drawStatic self-time | append + range 안정일 때. full replace/rescale·legend toggle이면 무효화 |
| **createDataSet 잔여 할당/자료구조 감축** | GC/packing 10~50% 감소 | createDataSet self-time, GC time, allocation | 일반 line/bar 포인트 객체 재사용은 일부 적용됨. 남은 배열 churn·stack/scatter/heatMap 경로·typed array 전환 비용이 dominant일 때. 자료구조 변경 리스크 큼 |
| **scatter batch** | scatter draw self-time 20~70% 감소 | scatter draw self-time | 동일 스타일 그룹 수가 작을수록 유리 |
| **heatmap putImageData** | heatmap draw self-time 30~80% 감소 | heatmap draw self-time | 픽셀 매핑·DPR·alpha 회귀 리스크 큼 |
| **time-slicing** | latency/freeze 개선, render-time 개선 아님 | interaction latency, freeze 여부, end-to-end render time | 총 작업량은 유지. D4를 벗어나면 Step 3 통과 아님 |
| **Worker(B)** | 메인 TBT 50%+ 감소 가능 | main TBT, Long Tasks, interaction latency | B-real pile-up에서만 병렬성 이득. end-to-end render는 전송/bitmap 비용 포함해 별도 판단 |

- **검증 2축 분리 (자동 회귀 vs 수동 프로파일링)** — 무엇을 CI로 고정하고 무엇을 릴리즈 전 수동으로 남기는지 명시:
  - **자동(CI 회귀로 고정)**: ① **기능/시각 회귀** — golden screenshot(pixel-diff) 매트릭스(전 타입 × log/stacked/legend toggle/zoom/brush/group/DPR/formatter, Step 0b 고정)와 **tooltip 값 정확성 테스트**(시각 회귀와 분리). ② **알고리즘 단위 테스트** — **path 생략의 데이터 불변성**(적용 전/후 출력이 golden screenshot 허용 오차 내로 동일)·**생략 제외 조건**(방향 전환점·null/area fill/step-line 경계·marker 기준점)·hit-index 사전계산 정확성. → 매 PR에서 회귀 차단.
  - **수동(릴리즈 전 프로파일링)**: 성능 수치(메인 TBT·Long Task·interaction latency·redraw self-time·전송 latency)는 **기기·부하 의존성이 커 CI 절대 임계로 고정하기 부적합** → DevTools Performance + Step 0b harness(`performance.mark/measure`)로 **저사양 기준 기기에서 수동 캡처**, baseline 대비 상대 변화(−%)로 판정. (CI에는 harness 수치를 **참고 로그로 수집**하되 fail-gate로 쓰지 않음 — 잡음으로 인한 false fail 방지.)
- **도구·환경**: line 수천~만 시리즈 단일 차트(프로파일 A) + 다중 차트 대시보드(프로파일 B) 예제에서 `setInterval(…,1000)` 주기 갱신, DevTools Performance로 메인 TBT·Long Tasks·갱신 중 interaction latency(1차)·redraw self-time(2차)·`findClosestDataIndex` self-time 캡처.
- **step별 검증 기준**은 §4 각 step에 인라인. 요약:
  - Step 0a: baseline 수치 + Q0(파이프라인 지배 여부)/path 생략 효과/갱신 성격/B-real 재현 정보 수집 + D4a/D4b 목표치 확정.
  - Step 0b: **계측 harness(`performance.mark/measure`, pointermove→tooltip paint latency) 구축** + **기능 회귀 매트릭스 고정**(전 타입 × log/stacked/legend toggle/zoom/brush/group/DPR/formatter).
  - Step 1: hover 시 `findClosestDataIndex` self-time 곱셈항 제거, (유휴) latency p95 ≤ 100ms. 갱신 중 hover latency는 참고 수집.
  - Step 1.5(신규·소비자 무수정): 1.5-0 계약 감사 → F0(normalize mutate 제거)·F1(clone 축소)·F3(isEqual)·F4(normalize 캐시)로 watch 콜백 내부 비용 축소. 검증=회귀 0(tooltip spec+golden) + 데이터 계약 테스트 6종 + **재프로파일(D4a per-tick update end-to-end 감소 + 잔여 지배항 기록)**. 결과 지배항으로 Step 2/3/Worker/F2 라우팅. F2(deep-watch)는 범위 밖.
  - Step 2: 2a low-risk draw skip(hidden skip + path 생략) → 2b cache → 2c createDataSet 잔여 할당/자료구조 감축 → 2d scatter/heatmap draw 최적화 순으로 진행. 각 sub-step마다 redraw self-time·per-tick Long Task 감소 + D4b 목표치 충족 + 시각/hit 회귀 없음(회귀 매트릭스·tooltip 값 정확성 분리 검증).
  - Step 2.5: RenderCore 분리(mini-step a~d 단계별)마다 전 타입 시각/인터랙션 회귀 0 + plugin lifecycle 유지 + redraw self-time 성능 중립 + Exit Criteria 충족(`drawChart` orchestration화, RenderCore 단독 실행, Worker 후보 경로의 동일 API 재사용 가능).
  - Step 3(게이트): T3 + Step 1.5 및 필요 시 Step 2 + 메인-only 수단만으로 A·B 각각 latency p95 ≤ 100ms + freeze 없음 **AND D4a/D4b 중 해당 지표 유지**이면 **Worker 불필요로 종료**.
  - Step 4: 게이트 미통과 프로파일(기본 B, A도 미통과 시 제한적 포함)에서 부록 A.3 PoC 합격선 → 본 리팩토링, 전 타입 회귀 없음 + TBT ≥ 50% 감소.
- **render-time(2차) 판정 (두 축)**: **D4a(per-tick update end-to-end)는 Step 1.5**(watcher 비용 — clone/deep-watch/isEqual/normalize 축소)로, **D4b(canvas redraw self-time)는 Step 2**(draw/createDataSet)로 평가한다. 2026-06-09 측정에서 per-tick 체감 시간의 대부분이 watcher 비용이므로 redraw self-time 단독으로는 2차 목표를 대표하지 못한다. 둘 다 Worker가 아니라 메인 최적화로 달성하며, 형상 보존·hit/tooltip 정확성을 동반 확인한다.
