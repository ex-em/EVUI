# Playwright 6× throttle 방향성 측정 (probe)

> ⚠️ **이 문서는 공식 게이트 입력이 아니다.** `measurements.md`(저사양 기준 기기에서 사람이 재는 공식 측정)를
> 대체하지 않는다. 아래 수치는 **개발용 맥 + headless Chromium(Playwright MCP) + CDP CPU 6× throttle**로
> 잰 **상대 비교/방향성** 자료다. 절대 합격선(예: latency p95 ≤ 100ms) 판정에는 쓰지 말 것. 커밋 대상 아님(untracked).
>
> 단, **self-time 비율(어느 함수가 지배인가)** 은 throttle 배율과 무관하게 신뢰도가 높다 → Q1 판정의 핵심 근거.

## 측정 조건

- 환경: 로컬 맥, `npm run docs`(vite, :10000), Playwright MCP headless Chromium
- CPU: CDP `Emulation.setCPUThrottlingRate({rate:6})` = DevTools "6× slowdown" (검증: 5e6 busy-loop 38→230ms)
- self-time: CDP `Profiler`(200µs sampling)로 CPU 프로파일 → 함수명별 hitCount 집계
- 한계: 컴포넌트 페이지 전체(캔버스 100+)가 함께 렌더된 상태, 단발성·n 작음. **방향성만 신뢰.**
- baseline `f7751ce9`(step2, 최적화 전) ↔ after `9d1479df`(HEAD, step3·4·6).

## A-single — drawChart / hitTest (harness 패널)

규모: `SERIES_COUNT=10000`, `POINTS_PER_SERIES=50`

| metric (ms) | baseline | after(Append) | after(Full-replace) |
|---|---:|---:|---:|
| drawChart p50 | 4860 | 5271 | 4938 |
| drawChart p95 | 4960 | 5566 | 5348 |
| hitTest p50 / p95 | 27.2 / 35.2 | 27.1 / 34.1 | — |
| latency p50 / p95 | 28.7 / 36.8 | 28.5 / 40.8 | — |

> harness `drawChart`(mutate→Vue flush)는 ~5s@6×로 baseline≈after, **append≈full-replace**.

## ★ self-time 분해 (CDP Profiler, A-single after, 6×) — 가장 중요

총 샘플 ≈ 4864ms 구간. 함수별 self-time 상위:

| 함수 | self% | 분류 |
|---|---:|---|
| baseClone | 18.4 | **lodash cloneDeep** |
| get | 13.9 | Vue reactive Proxy get |
| traverse | 12.6 | **Vue `deep:true` watch 순회** |
| set | 11.9 | Vue reactive set |
| noTracking | 10.8 | Vue reactivity |
| baseGetAllKeys | 4.8 | lodash cloneDeep |
| trigger / ownKeys / cleanupDeps / reactive / notify | ~9 | Vue reactivity |
| initCloneArray | 0.9 | lodash cloneDeep |
| **draw / drawSeries / addSeriesDS / getXPos / getYPos / getSeriesMinMax** | **합계 < 10** | **실제 캔버스 렌더** |

**→ 병목은 캔버스 그리기가 아니라 데이터 핸들링 오버헤드다.**
- lodash cloneDeep ≈ **24%** (baseClone+baseGetAllKeys+initCloneArray)
- Vue 반응성/deep-watch ≈ **58%** (get+traverse+set+noTracking+trigger+ownKeys+…)
- 실제 차트 렌더(draw/createDataSet 계열) **< 10%**

## ★★ call-tree 귀속 분석 (CDP Profiler, A-single append, 6×) — F2 필요성 판정

flat self-time만으로는 반응성 ~58% 중 "클론/비교가 reactive proxy를 훑어 유발한 `get`"(F1/F3로 동반 제거)과
"deep-watch `traverse` 고유분"(F2를 해야만 제거)을 못 가른다. → CDP Profiler **call tree를 DFS로 카테고리 귀속**
(루트부터 카테고리 컨텍스트 전파: `cloneDeepWith/baseClone` 서브트리=clone, `traverse` 서브트리=deepwatch, `isEqual`=isEqual,
draw/createDataSet 계열=render). total 4712ms 기준:

| 카테고리 | 비중 | F2(deep-watch 회피) 없이 제거 가능? |
|---|---:|---|
| **clone** (cloneDeep 서브트리, 유발한 reactive `get` 포함) | **30.4%** | ✅ F1으로 직격(`toRaw`+복사량 감축) |
| **deepwatch** (`traverse` 서브트리) | **19.3%** | ❌ **F2를 해야만 빠짐 → 소비자 무수정 범위에선 잔존** |
| **isEqual** | 2.9% | ✅ F3 |
| normalize (`getNormalizedData`) | ~0% | 미미(F4 우선순위 낮음) |
| render (실제 작업) | 10.2% | 유지 |
| other (Vue 스케줄러·GC·lodash 내부 미분류) | 37.1% | 일부(특히 GC) |

- **F2 없이 직접 제거 가능(clone+isEqual) ≈ 33%.** clone 서브트리(30.4%)가 flat `baseClone`(18.4%)보다 큰 것은
  **클론이 reactive proxy를 순회하며 `get`/`noTracking` trap을 유발**했음을 확인해 준다 → F1(`toRaw`로 proxy 분리)이 이를 동반 제거.
- **other 37% 중 상당수는 GC로 추정**(매 틱 전체 딥클론이 대량 garbage 생성). 클론 축소 시 동반 감소 가능 → **실측 F1 효과는 30%보다 클 여지**.
- **deepwatch 19.3%는 F2 전용**. 소비자 in-place mutation 감지 계약(default deep watch)을 유지하는 한 잔존.

### 결론 — "크게 개선" 기준별
- **per-tick ~1/3 단축(≈30%+)** → **F2 없이 F1(+F3)로 현실적**(클론 직격 + GC 동반).
- **절반 이상 단축** → F2(deep-watch) 없이는 어렵다(반응성의 약 1/3이 deepwatch 고유분).
- **권고**: F1+F3 먼저 구현 → 재측정으로 clone+GC 동반 감소 실측. 충분하면 F2 영구 불필요. 부족하면 그때 default 유지 + opt-in으로만 F2 별도 논의(지금 결정 안 함).

## B-real (comboChart / PerfStressDashboard, after)

규모: `CHART_COUNT=8`, `SERIES_PER_CHART=20`, `POINTS_PER_SERIES=60`

| metric (ms) | idle | 갱신 틱과 겹친 hover |
|---|---:|---:|
| drawChart p50 / p95 | 143.9 / 170.6 | — |
| hitTest p50 / p95 | 27 / 34 | 28.4 / **124.8** |
| interaction-latency p50 / p95 | 28 / 40 | 30.8 / **127.3** |

> 틱 redraw 143ms@6×가 메인스레드를 동기 블록 → hover 겹치면 latency p95 ≈127ms@6×.

## 근본 원인 (코드 위치)

per-tick 경로 = `Chart.vue:231-263` `watch(() => props.data, …, { deep: true })`. 매 틱마다:
1. **`deep:true` watch가 reactive props.data(1만 시리즈×50pt) 전체를 `traverse`** — traverse 12.6% + get/noTracking/reactive 다수.
2. `getNormalizedData(chartData)` — 전체 순회.
3. **다수 `isEqual`**(`newData.series/groups/labels/data` vs `evChart.data`) — lodash deep 비교, 전체 순회.
4. **`cloneChartData(newData)` = `cloneDeepWith`** (`uses.js:277`, 호출 `Chart.vue:250`) — 전체 데이터 딥클론 ⇒ baseClone 24%.
5. 그 **다음에야** createDataSet + 캔버스 draw(<10%).

비용은 모두 **데이터 크기(series×points)에 비례하는 데이터 핸들링**이며, append/full-replace 무관(둘 다 전체를 훑음 → 측정에서 동일). 캔버스/렌더-스레드와 무관.

## 결론 — 다음 작업 방향이 바뀐다

- **OffscreenCanvas / Worker는 이 병목에 효과 없음** — 그리기가 <10%라 렌더를 워커로 떼어도 cloneDeep+반응성 오버헤드(메인스레드)는 그대로 남는다.
- plan의 대기 조건부 스텝(2b cache / 2c createDataSet 자료구조 / 2d scatter·heatmap draw)도 **타깃이 아님** — 전부 렌더/createDataSet 쪽.
- **실제 타깃(신규 phase-plan 필요):**
  1. per-tick `cloneChartData`(전체 cloneDeep) 제거/축소 — 변경분만 반영하거나, 소비자가 소유한 데이터면 클론 생략.
  2. `deep:true` watch의 전체 traverse 비용 축소 — shallow 버전키/`shallowRef`/명시적 update 신호로 대체(거대 데이터에 deep watch 회피).
  3. 중복 deep `isEqual` 축소(이미 일부 최적화됨, 여전히 2~4회 전체 비교).
- step3(hitTest mask)·step4(hidden/lineTo skip)는 이 repro 기본 설정(dense·전 시리즈 visible·픽셀중복 없음)에선 발동/개선이 안 보임 → 회귀 안전망(출력 불변)은 검증됐으나 정량 이득은 sparse/hidden/dense-point 변형에서만 측정 가능.

## 검증 권고

위 self-time **비율**은 throttle와 무관하게 견고하나, 절대 수치·게이트(latency p95·freeze)는 6× 근사다.
신규 phase 착수 전 저사양 실기기 DevTools로 self-time 분해(특히 cloneDeep/traverse 비중)를 한 번 재확인하고 `measurements.md`에 옮길 것.
