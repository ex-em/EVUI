# Step 1.5-0 — 데이터 파이프라인 계약 감사 (characterization, 코드 변경 0)

> 출처 plan: `phases/chart-render-perf/plan.md` §4 Step 1.5-0.
> 목적: F0~F4 채택안과 안전 범위를 확정하기 위해, "내부가 입력을 어떻게 다루는지(mutation/alias/cache)"를
> **메인 + zoom + group** 세 경로 모두에 대해 표로 닫는다. 성능 수치는 `playwright-probe.md`(6× throttle 근사) 인용만,
> 새 측정은 "사람이 실기기 DevTools로 측정 필요"로 남긴다.
>
> 검증한 코드 위치(라인은 현재 `feat-chart-data-pipeline` 브랜치 기준):
> - `src/components/chart/Chart.vue:231-263` (data watcher)
> - `src/components/chart/uses.js:277`(`cloneChartData`), `:312-330`(normalize), `:642-669`(`setDataForUseZoom`), `:535-574`(`createEvChartZoom`)
> - `src/components/chart/chartZoom.core.js:12, :256-293`(`executeZoom`)
> - `src/components/chart/model/model.store.js:13-120`(`createDataSet`), `:567-620`(`addSeriesDS`)
> - `src/components/chartGroup/ChartGroup.vue:105-115`, `src/components/chartGroup/uses.js:38-53`

---

## 0. 핵심 선결 사실 (이후 표의 전제)

1. **`getNormalizedData`는 원본을 in-place mutate하고 같은 참조를 반환한다.**
   `uses.js:330` `getNormalizedData = (data) => defaultsDeep(data, DEFAULT_DATA)`.
   lodash `defaultsDeep(object, ...sources)`는 **첫 인자(object)를 target으로 변형하고 그 참조를 반환**한다.
   여기서 `data === chartData === props.data`(reactive proxy). 따라서:
   - **반환값 `newData`는 `props.data`와 동일한 참조**다(`realTimeScatter` 비활성 시). Chart.vue:236.
   - `DEFAULT_DATA = { series:{}, groups:[], labels:[], data:{} }` (`uses.js:258-263`). defaultsDeep는 **누락된 top-level 키만** 채운다 → 소비자가 `groups`/`labels`/`series`/`data` 중 하나라도 생략하면 그 빈 컨테이너가 **소비자의 reactive props.data에 주입**된다(원본 오염 + `set`/`trigger` trap 유발). 4개 키가 모두 있는 정상 상태에서는 mutation이 없다.
   - DEFAULT_DATA의 `series`/`data`가 빈 객체라 nested 재귀 default는 사실상 없음 → normalize self-time은 미미(probe ~0%).

2. **클론(`cloneChartData`)이 유일한 격리 경계다.**
   `uses.js:277` `cloneChartData = (d) => cloneDeepWith(d, (v) => isImmutableDateLike(v) ? v : undefined)`.
   `Chart.vue:250` `evChart.data = cloneChartData(newData)`. 이 클론이:
   - reactive proxy(`props.data`)에서 plain 객체로 분리 → downstream(createDataSet/render/hitTest)이 proxy `get` trap 없이 읽음.
   - 다음 틱 `isEqual` 비교의 안정 기준(prev 스냅샷) 제공.
   - dayjs/Date 등 immutable date 값은 **참조 공유(의도된 alias)** — 제자리 변형이 없어 격리가 깨지지 않음(`uses.js:265-275` 주석).

3. **메인 렌더 경로는 `evChart.data`(클론) 이후 입력 배열/포인트 객체를 mutate하지 않는다.**
   `createDataSet`(`model.store.js:13-120`)는 입력 `data[seriesID]`를 **읽기만** 한다. 변환 불필요 시 `sData = rawData`로 입력 배열을 **alias**(`:70-73`)하지만, `addSeriesDS`(`:567-620`)는 그 배열을 순회하며 **별도의 새 `sdata=[]`** 에 model 소유 포인트 객체(10필드)를 빌드한다. 재사용 pool은 **직전 dataSet의 포인트 객체**(`prevData`, model 소유)지 입력이 아니다. 입력 배열·요소(number 또는 `{x,y}`)는 sort/splice/필드 추가 없이 **읽기 전용**. → **F1 저위험 판정의 1차 코드 근거**(메인 경로 한정).

---

## 1. mutation / alias / cache 목록 (메인 + zoom + group)

### 1-A. 메인 경로 (`Chart.vue:231-263`, 모든 차트 공통)

| # | 구간 (코드) | mutation | alias | cache 의존 |
|---|---|---|---|---|
| ① | deep-watch 진입 `watch(() => props.data, …, {deep:true, flush:'post'})` (`Chart.vue:231,262`) | 없음 | 콜백 인자 `chartData` = `props.data` (proxy) | — |
| ② | `getNormalizedData(chartData)` (`Chart.vue:236`→`uses.js:330`) | **있음 — `defaultsDeep`가 `props.data`(원본 proxy)를 in-place 변형**, 누락 시 `groups/labels/series/data` 빈 컨테이너 주입 | **반환 `newData === props.data`** (같은 참조) | — |
| ③ | `isEqual(newData.series, evChart.data.series)` 등 4회 (`:238,239,247,248`) | 없음(읽기 deep 비교) | 비교 대상 `evChart.data` = 직전 틱 클론 | **있음 — 직전 클론을 비교 baseline(cache)으로 사용.** `isUpdateSeries`/`isUpdateData` 플래그 산출 |
| ④ | `evChart.data = cloneChartData(newData)` (`:250`) | 없음(새 객체 생성) | date-like 값만 참조 공유(immutable, 안전) | 이 클론이 다음 틱 ③의 baseline이 됨 |
| ⑤ | `createDataSet(evChart.data.data, …)` (`model.store.js:13`) | **`evChart.data`는 mutate 안 함.** 변환 시 입력 배열을 `sData=rawData`로 alias(`:70-73`)하나 새 `sdata`로 빌드, 입력은 읽기 전용 | `this.seriesList[id].data`(model 소유)는 입력과 분리. 단 변환불필요 시 `sData`가 입력 배열을 alias(읽기만) | dataSet 포인트 객체 **pool 재사용**(`addSeriesDS` `prevData`, `:573,593`) — model 소유 |
| ⑥ | render / hitTest / tooltip | model `seriesList`·`dataSet` 기준, raw 입력 비변형 | hit/tooltip 값은 항상 raw 기준(`evChart.data`) | `buildLabelValidMask`(Step 1) — createDataSet 시점 재계산 |

> 비용 비례(probe): ②③④ 모두 데이터 크기(series×points)에 비례, append/full-replace 무관. self-time ≈ clone 30.4% / deepwatch traverse 19.3% / isEqual 2.9% / render 10.2% / other(GC 추정) 37.1% (`playwright-probe.md`, 6× 근사). **절대치는 실기기 재측정 필요.**

### 1-B. zoom 경로 (`!injectIsChartGroup` & zoom 사용 시)

| # | 구간 (코드) | mutation | alias | cache 의존 |
|---|---|---|---|---|
| Z1 | `setDataForUseZoom(newData)` (`Chart.vue:259`, `isUpdateData`일 때만) | 없음 | 인자 `newData` = `props.data` proxy(0-② 참조) | — |
| Z2 | `evChartClone.data = [cloneChartData(newData)]` (`uses.js:645`, non-group) | 없음(새 클론) | date-like만 공유 | **per-tick 추가 전체 딥클론(클론 #2).** zoom 미사용이면 발생 안 함. zoom 사용 시 메인 ④ + 여기 Z2 → **틱당 클론 2회**. `evChartClone`은 zoom 복원용 full-data source of truth(cache) |
| Z3 | `createEvChartZoom`: `evChartInfo.props.data.push(props.data)` (`uses.js:551`) | 없음 | **`evChartInfo.props.data[0] === props.data`** (소비자 proxy 직접 alias) | 1회 셋업 시 `evChartClone.data = cloneDeep(evChartInfo.props.data)` (`:556`) |
| Z4 | `executeZoom` (`chartZoom.core.js:267,274,279`) | **있음 — `this.evChartProps.data[idx]`(=`props.data`)의 `data[seriesName]`·`labels`를 zoom 구간 `filter` 결과로 덮어씀.** 소비자 입력을 zoom subset으로 **직접 교체(참조 재할당)**, 소스는 `evChartCloneData`(클론) | `this.evChartProps = evChartInfo.props` (`:12`) → props.data 직접 참조 | full data는 `evChartCloneData`(Z2/Z3 클론)에서 복원 |

> **zoom 경로 핵심 리스크(F0/F1용)**: ① per-tick clone이 **재발**한다(Z2). ② zoom은 클론이 아니라 **`props.data`를 직접 mutate**한다(Z4) — 소비자 입력을 zoom subset으로 덮어쓰는 기존 동작. 메인 ④ 클론이 `toRaw`/구조공유로 props.data와 배열을 공유하게 되면, Z4가 props.data 배열 참조를 교체할 때 **stale/교차오염** 위험. → F1은 **zoom 경로에 같은 정책(Z2도 toRaw/구조공유)을 통일 적용**하거나, zoom 사용 시 구조공유를 비활성하는 등 별도 처리 필요.

### 1-C. group 경로 (`EvChartGroup` 하위, `injectIsChartGroup === true`)

| # | 구간 (코드) | mutation | alias | cache 의존 |
|---|---|---|---|---|
| G1 | 각 자식 `Chart.vue` data watcher: 메인 ①~④ 그대로 실행, 단 `setDataForUseZoom`은 **호출 안 함**(`Chart.vue:258` `!injectIsChartGroup` guard) | 자식별 메인 ②(normalize mutate) 동일 | 자식별 `newData === 자식 props.data` | 자식별 클론(④) |
| G2 | `createEvChartZoom`(group): `evChartPropsInGroup.value.forEach(({data}) => { data.chartIdx = idx; evChartInfo.props.data.push(data); })` (`uses.js:540-547`) | **있음 — 각 자식 data 객체에 `chartIdx` 필드 주입**(소비자 입력 mutate) | `evChartInfo.props.data[i] === 자식 props.data` (alias) | 셋업 시 `evChartClone.data = cloneDeep(evChartInfo.props.data)` |
| G3 | `ChartGroup.vue` watch `(() => evChartInfo.props.data, …, {deep:true})` → `setDataForUseZoom(evChartProps)` (`:109-115`) | 없음 | `evChartProps` = `evChartInfo.props.data`(자식들 alias 배열) | — |
| G4 | `setDataForUseZoom` group 분기: `evChartClone.data = cloneChartData(newData)` (`uses.js:645`, `evChartGroupRef` truthy) | 없음(전체 그룹 클론) | date-like만 공유 | **per-tick 전체 그룹 딥클론**(N차트 묶음). 자식 N개 메인 클론 + 그룹 클론 1회 |
| G5 | `executeZoom` | 1-B Z4와 동일하게 `evChartProps.data[idx]`(각 자식 props.data) 직접 mutate | 자식 props.data 직접 참조 | `evChartCloneData` 복원 |

> **group per-tick 클론 횟수**: 자식 N개 각자 메인 ④ 클론 + 그룹 G4 클론 1회 = **N+1회**(zoom/group 사용 시).

---

## 2. cache invalidation matrix

각 축이 **어떤 입력 변경에서 재계산돼야 하는지**. 이 matrix가 F3(dirty 플래그) 설계 범위를 확정한다.

| 축 | 무엇 | 재계산 트리거(invalidate 조건) | 현재 gating(코드) |
|---|---|---|---|
| **data** | 라벨/시리즈 값 배열 (`evChart.data.data/labels`) | `props.data.data` 또는 `.labels` 변경(append/replace/in-place push·shift 포함) | `isUpdateData` = series/groups/labels/data 중 하나라도 isEqual 불일치 (`Chart.vue:244-248`) |
| **series schema** | 시리즈 구성/키/스타일 메타 (`series`, `groups`) | `props.data.series` 또는 `.groups` 변경, **type==='heatMap'은 항상**(`Chart.vue:242`) | `isUpdateSeries` = series/groups 불일치 \|\| heatMap (`:241-242`) |
| **axis scale** | min/max·step (`getStoreMinMax`/`createAxes`) | data 변경 + **`series.show` 토글**(범례) — show=false 시리즈를 min/max에서 제외(`model.store.js`), full-replace/동적 rescale, resize/DPR | non-light update마다 재계산(현재 캐시 없음) |
| **layout** | chartRect/labelOffset/plotArea | resize, DPR 변경, legend show/위치 변경, padding 변경 | drawChart마다 재계산(현재 캐시 없음) |
| **style·theme** | 색/폰트/테마 | `props.options`(theme/color/formatter) 변경 → **options watcher**(`Chart.vue:~180`, 별도 watch) | options watcher가 별도 gating(data watcher와 분리) |
| **interaction index(hit·tooltip)** | `buildLabelValidMask`, 라벨별 유효 시리즈 mask | data 변경, `series.show` 토글 | createDataSet 끝에서 재계산(`model.store.js:119`) → data/series 변경에 종속 |

> **F3 설계 함의**: 6축 중 data·series schema·interaction index는 data watcher가 책임지고, axis scale은 data + show토글에 종속, layout·style·theme는 resize/options watcher 등 **다른 트리거**에 종속. F3 dirty 플래그는 **data watcher가 책임지는 축(data/series/interaction index)** 만 통합 대상이며, **axis scale은 show 토글(동적 rescale)까지 커버**해야 한다(범례 토글 = 동적 rescale 대표 사례, plan §4 선결분류②).

---

## 3. in-place mutation 사용 패턴 조사 (deep watch가 떠받치는 계약)

소비자가 `props.data`를 **in-place로 변경**(같은 root 참조 유지, `.push`/`.shift`)하는 패턴이 docs 예제에 **광범위하게 실재**한다. 대표:

| 위치 | 패턴 |
|---|---|
| `docs/views/barChart/example/Time.vue:88,92,96,99` | `chartData.labels.shift()` / `chartData.labels.push(...)` / `seriesData.shift()` / `seriesData.push(...)` |
| `docs/views/barChart/example/AxesScaleChange.vue:122-124` | `labels.push(...)` / `series1.push(...)` / `series2.push(...)` |
| `docs/views/barChart/example/HoverWithGroup.vue:457-491` | 4개 차트 동시 `labels.shift/push` + `seriesData.shift/push` |
| `docs/views/comboChart/example/StackLineBar.vue:69-80` | `chartData.labels.shift/push` / `seriesData.shift/push` |
| `docs/views/brushChart/example/Default.vue:109-112`, `UseDebounce.vue:229-230` | `chartData.labels.push` / `seriesData.push` |
| `docs/views/barChart/example/LargeScrollbar.vue:23-26` | `data.push(null)` / `data.push(...)` |

- **대표 갱신 idiom = `reactive({labels:[], data:{...}})`를 `:data`에 바인딩하고 timer로 `labels.push`/`seriesData.push`/`shift`** (Time.vue:74-101, `setInterval` 갱신). → **deep watch가 없으면 이 갱신이 watcher를 트리거하지 못한다**(root 참조 동일). 이것이 `{deep:true}`가 떠받치는 공개 계약.
- **단위 테스트(spec)**: `Chart.tooltip.spec.js`/`Chart.visual.spec.js`는 mount-with-data 또는 model 함수 직접 호출 방식이라 **in-place mutation 경로를 직접 행사하지 않는다**. → deep watch 계약의 회귀 안전망은 **docs 예제/수동 검증**에 의존하며, F1/F3 검증 시 **in-place push 케이스의 신규 테스트가 필요**(plan §4 검증 2-②).

> **함의(F2 범위 밖 근거 아님)**: 이 조사는 F1/F3가 **깨면 안 되는 계약**을 확인하기 위함이다. deep watch는 default 유지(F2 범위 밖). F3는 in-place mutation 시 **같은 root 참조로 콜백 진입**하므로 object-identity(===) dirty 판정이 누락 → 보수적 fallback(`updateData=true`) 또는 cheap snapshot/hash 판정이 필수(plan F3 판정규칙).

---

## 4. F0~F4 후보 ↔ 계약 매핑

| 후보 | 건드리는 구간/계약 | 리스크 | 필요한 회귀 테스트 |
|---|---|---|---|
| **F0** normalize 비-mutating·raw 입력 | 메인 ②(`getNormalizedData` defaultsDeep mutate). `defaultsDeep({}, toRaw(data), DEFAULT_DATA)`로 전환 → 원본 오염 제거 + proxy `get`/`set` trap 제거 | default 키가 **출력**에 정상 주입되는지(빈 target이라 입력엔 안 들어감). group G2의 `chartIdx` 주입은 별개 경로라 영향 없음 | (a) 원본 `props.data` 불변(키 미주입), (b) 누락 키(`groups`/`labels` 생략) 입력에도 출력 정규화 정상, (c) `realTimeScatter` 분기(`Chart.vue:234`) 영향 없음 |
| **F1** clone 축소(toRaw/구조공유, feature flag) | 메인 ④ + **zoom Z2 + group G4**(클론 발생 모든 지점). `toRaw`로 proxy 분리 후 복사, 또는 변경분만 구조공유 | **alias 잔존 → 입력 역류/stale.** 메인 경로는 §0-3에서 입력 비변형 확인(저위험). **단 zoom Z4/group G5가 `props.data`를 직접 mutate**하므로 구조공유가 props.data와 배열을 공유하면 zoom 시 stale/교차오염 | golden(전 타입) + tooltip 값 정확성 + **in-place push 반영** + **zoom on/off 시 데이터·축·복원 정상** + group N차트 동기 갱신 + flag on/off A/B 출력 동일 |
| **F2** deep-watch traverse 회피 | 메인 ①(deep watch) | — | **범위 밖(보류).** 소비자 in-place mutation 감지 계약(§3)이라 default 변경·opt-in 신설 안 함. 재측정에서 traverse가 새 지배항이면 사용자와 별도 논의 |
| **F3** isEqual dirty 플래그 | 메인 ③ + §2 invalidation matrix(data/series/interaction index 축, axis scale은 show토글까지) | 과소 업데이트(갱신 누락). **in-place는 identity 누락** | matrix 전 축(series/labels/groups/legend/tooltip) 누락 없이 갱신 + in-place push 시 보수적 fallback 동작 + show 토글 시 rescale 갱신 |
| **F4** normalize 캐시 | 메인 ②(append fast-path 또는 normalizedData 캐시) | 캐시 무효화 누락 → stale | 빠른 연속 tick에서 stale 미표시 + full-replace/append 양쪽 정상 |

### F1 저위험 여부 판정 (가정 아닌 코드 근거)

- **메인 경로: 저위험 ✅.** §0-3·1-A⑤ 코드 근거 — `createDataSet`/`addSeriesDS`는 `evChart.data`(클론) 이후 입력 배열·포인트 객체를 **mutate/정렬/splice 하지 않는다**(새 `sdata` 빌드, pool은 model 소유 prevData). 따라서 메인 ④ 클론을 `toRaw`+복사량 감축으로 줄여도 입력 역류 위험 없음.
- **zoom 경로: 추가 처리 필요 ⚠️ (저위험 아님).** 1-B Z4 코드 근거 — `executeZoom`이 `this.evChartProps.data[idx]`(=소비자 `props.data`)의 `data[seriesName]`·`labels`를 zoom subset으로 **직접 교체**한다. F1이 메인 클론을 props.data와 구조공유하게 만들면 zoom이 props.data 참조를 갈아끼울 때 stale/교차오염 가능. → **F1 적용 시 zoom Z2 클론도 같은 toRaw/구조공유 정책으로 통일**하고, 구조공유 범위는 "zoom이 덮어쓰는 `data[seriesName]`/`labels` 배열"을 포함해 별도 검증해야 한다.
- **group 경로: 메인과 동일 저위험 + G2 caveat.** 자식별 클론은 메인과 동일(저위험). 단 G2가 자식 data에 `chartIdx`를 주입(기존 mutation)하므로, F0의 비-mutating 전환과 충돌하지 않는지(`chartIdx`는 zoom 셋업 1회라 별개) 확인.

**결론**: F1 clone 축소는 **메인 경로에서 저위험(코드 확인)**, **zoom 경로는 별도 정책 통일·검증 필요**. feature flag로 격리해 zoom on/off·group 포함 A/B 후 default 승격(plan 권장 순서 유지).
