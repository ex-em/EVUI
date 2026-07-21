# Chart Model — 데이터 정규화·시리즈 레지스트리·조회 계층

## Purpose

EvChart 코어에 mixin되는 데이터 모델 계층이다. 사용자가 넘긴 `data.series` / `data.data` / `data.labels`를 (1) 타입별 series 인스턴스 레지스트리(`seriesList`)로, (2) 렌더·hit test가 소비하는 정규화 점객체(`ChartSeriesDataPoint`) 데이터셋으로 변환하고, (3) 축 범위 산정(min/max)·좌표 기반 hit test·집계(min/max/avg/total/last) 조회를 제공한다. 자체 상태를 갖지 않으며 모든 메서드는 `chart.core.js`가 `Object.assign(this, Model[key])`로 EvChart 인스턴스에 합쳐 인스턴스 상태(`options`, `seriesList`, `seriesInfo`, `dataSet`, `data` 등)를 `this`로 공유한다.

## Features

### 시리즈 레지스트리 (model.series.js)

- **시리즈 집합 생성**: `createSeriesSet(series, defaultType, isHorizontal, groups)`가 series 키 순서대로 타입별 element 인스턴스를 생성해 `seriesList[key]`에 등록하고 `seriesInfo.charts[type]`에 키를 push한다. 타입은 `series[key].type || defaultType`. 지원 타입: `line`, `scatter`(realTimeScatter 플래그 전달), `bar`(`opt.timeMode`면 TimeBar), `pie`, `heatMap`(heatMapColor·gradient legend 여부 전달).
- **시리즈 증분 재조정**: `reconcileSeriesSet(...)`은 updateSeries 시 인스턴스를 통째로 재생성하지 않고, reconcile key(type/isHorizontal/timeMode/realTime/heatMapColor/isGradient) 동일 + `opt` deep-equal(lodash `isEqual`)이면 기존 인스턴스를 재사용한다. `index`는 판정에서 제외한다(색 미지정 series의 팔레트색이 이웃 churn에 흔들리지 않게 — 실측 82% index 밀림 케이스에서 최적화 무력화 방지). 재사용 시 `show`를 `_freshShow`(생성 당시 값)로 리셋(범례 토글 상태 폐기)하고 group/stack 메타를 기본값으로 리셋한다. 새 `seriesList`/`seriesInfo.charts`를 resolved 순서대로 처음부터 만든다(기존 객체 mutate 금지).
- **overlapping bar 정렬**: `options.overlapping.use`면 `getOverlappingSeriesKeys`가 groups 소속 bar series를 groups 지정 순서의 **역순**으로 정렬해 큰 값 series가 먼저 그려지게 하고, non-bar series는 뒤에 붙인다.
- **스택 그룹 메타**: `addGroupInfo(groups)`가 그룹 내 각 series에 `stackIndex`(show=false series만큼 보간 감소), `groupIndex`, `isExistGrp`, `bsId`(직전 보이는 base), `bsIds`(자기보다 앞선 그룹 멤버), `isOverlapping`을 기록한다.

### 데이터셋 정규화 (model.store.js)

- **데이터셋 생성**: `createDataSet(data, label)`이 `seriesInfo.charts` 타입별로 분기해 정규화한다. 호출마다 `_dataEpoch`을 +1 하여 geometry 메모이즈를 무효화한다. line/bar류는 `interpolation === 'zero'`면 falsy 값을 0으로, `passingValue`와 일치하는 값을 `null`로 치환(치환 발생 시 `series.hasPassingValueInData = true`)한 뒤 `addSeriesDS`/`addSeriesStackDS`로 점객체 배열을 만든다. `show === false` series는 변환 자체를 건너뛴다(축 범위·hit test에 미반영이라 출력 불변). 마지막에 `buildLabelValidMask?.()`로 hit test용 라벨 유효성 mask를 1회 사전계산한다.
- **스택 데이터셋**: `addSeriesStackDS(data, label, sIdx, tops, prevData)`가 그룹의 부호별 누적 top(`stackTops` Map의 `{pos[], neg[]}`)에서 base를 O(1) 조회해 `y = base + own`, `o = own`, `b = base`를 만든다. 각 series 계산 직후 `updateStackTops`가 show series의 유효(position≠null && passingValue 아님) 포인트만 부호별 top에 기록한다 — 그룹 전체 O(L·S²)→O(L·S).
- **점객체 풀 재사용**: `addSeriesDS`/`addSeriesStackDS`/`addData`는 직전 데이터셋(`prevData`/`target`)의 점객체를 전 필드 덮어쓰기로 재사용해 매 틱 N개 객체 할당(GC 압력)을 제거한다. 새 데이터가 짧으면 새 길이만 반환한다(stale 없음).
- **pie/sunburst 데이터셋**: `createPieDataSet`은 show series의 `data[sId][0]`을 `pieDataSet[0]`에 값 내림차순으로 쌓는다. `options.sunburst`면 `createSunburstDataSet`이 children을 BFS로 depth별 `pieDataSet[depth]`에 펼치고, 자식이 없거나 show 자식이 없는 slice에는 `id: 'dummy'` slice를 삽입한다. `calculateAngle`이 depth 0은 12시 방향(1.5π)부터, 하위 depth는 부모 각도 범위를 값 비율로 분할해 `sa`/`ea`를 계산하고, dummy-only depth를 제거하며 `options.reverse`면 배열을 뒤집는다. [NEEDS CLARIFICATION: dummy-only depth 제거 루프가 `pieDataSet.splice(dummyIndex, 1)`로 배열 변수 자체를 splice 인덱스에 전달한다 — 복수 dummy depth에서 의도대로 동작하는가?]
- **scatter/heatMap 데이터셋**: `addSeriesDSforScatter`는 `{x, y, color}` 입력을 `addData`로 점객체화한다. `addSeriesDSForHeatMap`은 `{x, y, o:value, dataColor, cId:null, ...}` 형태로 매핑하고, `getSeriesValueOptForHeatMap`이 색상 구간 수(`colorsByRange.length || rangeCount`) 기반 `{min, max, interval, existError, decimalPoint}`를 계산한다(음수 값 존재 시 non-gradient에 Error colorState 추가).

### realTimeScatter 링 버퍼 (model.store.js)

- **링 버퍼 누적**: `createRealTimeScatterDataSet(datas)`가 series별 `dataSet[key]`에 초 단위 버킷 링 버퍼(`dataGroup`, 길이 = `options.realTimeScatter.range || 300`)를 유지한다. 배치 lastTime 기준으로 gap(초)만큼 링을 전진시키며 지나간 버킷을 reset하고, 윈도우(`fromTime`~`toTime`) 안 점만 push한다. 버킷별 max/min을 유지하고, series min/max는 윈도우 내 점만 집계한다(minY/maxY 모두 ±Infinity에서 시작 — 음수 전용 데이터 대응, 유효 데이터 없으면 0/0 fallback). [NEEDS CLARIFICATION: 함수 중간의 early return 조건이 `key === ''`를 포함해 빈 문자열 series 키에서만 동작한다("원래 코드에 있던 early return 유지" 주석) — 의도된 가드인가, 사실상 도달 불가한 잔존 코드인가?]
- **좌표 dedupe**: `options.coordinateDedupe !== false`(기본 on)이면 버킷별 `dataKeys` Set으로 동일 (x,y) 중복 push를 차단한다. `false`는 #2011의 "모든 중복 좌표 표시" opt-out으로, data 레이어에서 dedupe를 강제하지 않는다. dedupe on + scatter series 2개 이상일 때만 점에 좌표 키 `k`를 캐시한다(단일 series는 element가 k를 읽지 않아 생략).
- **blit 틱 메타**: 틱마다 `dataset.lastTick = { seq, gapCount, prevToTime, toTime, length, startIndex, endIndex, maxDirtyAge }`를 기록한다. `seq`는 단조 증가(sub-second 틱 갱신 판정용), `maxDirtyAge`는 신규 점이 우측단에서 떨어진 최대 버킷 거리(-1=신규 없음)로, draw 단계(`chart.core` blit gate / `element.scatter` strip draw)가 strip-only redraw ↔ full redraw 폴백 판정에 소비한다.
- **시리즈 만료 제거**: `pruneExpiredRealTimeScatterSeries(datas)`가 (a) `ds.toTime < globalToTime - range*1000`(가시 윈도우에 점 없음과 등가) AND (b) 이번 틱 신규 점 없음(`!datas[sId]?.length`)이면 grace 없이 즉시 제거한다. "series 키 부재"로는 판정하지 않는다. `removeRealTimeScatterSeries(sId)`는 `dataSet`/`seriesList`/`seriesInfo.charts.scatter`/선택 상태에서 제거하고 재추가 방지 가드 `prunedRealTimeScatterSeries` Set에 등록한 뒤, 범례를 rebuild한다(external이면 `emitLegendData`, 아니면 `updateLegend`).
- **만료 시리즈 부활**: pruned 키의 부활(가드 해제)은 `reconcileSeriesSet`에서만 일어난다 — 신규 점이 들어온 pruned 키는 Set에서 빼고 일반 경로로 재생성, 신규 점 없는 pruned 키는 `data.series`에 남아 있어도 재생성 대상에서 제외. `createRealTimeScatterDataSet`의 키 필터는 skip만 하고 Set에서 빼지 않는다.
- **X축 윈도우 동기화**: 렌더 X축 윈도우는 전역 우측단(모든 series toTime의 max)을 따른다(stale series가 마지막 처리 키일 때 축 freeze 방지). scatter series의 `minMax.minX`는 `fromTime + 1000`(dayjs) — 링이 실제 보유한 가장 오래된 버킷에 맞춰 좌단 1버킷 결손·깜빡임을 막는다.

### 조회 (model.store.js)

- **시리즈 min/max**: `getSeriesMinMax(data, passingValue)`가 점객체 배열에서 minX/minY/maxX/maxY와 maxDomain(값 축 max 지점의 도메인 축 값)·maxDomainIndex를 계산한다. passingValue와 일치하는 `o`는 제외한다.
- **스토어 min/max**: `getStoreMinMax()`가 show series의 `series.minMax`를 축 인덱스(xAxisIndex/yAxisIndex)별로 합산해 `{x[], y[]}` (min/max/maxSID)를 만든다. 스택 그룹 + 기존 max가 음수면 새 max로 무조건 교체하는 분기가 있다.
- **가시 윈도우 max**: `getVisibleWindowMaxSeries(minIndex, maxIndex)`가 윈도우 안 visible series를 스캔해 최댓값 점 `{sId, value, index, domain}`을 반환한다(axis range로 일부만 보일 때 maxTip이 윈도우 밖 전역 max를 가리키지 않게). NaN/Infinity는 후보에서 제외, 윈도우가 비유한·역전이거나 유효값이 없으면 null.
- **좌표 hit test**: `getHitItemByPosition(offset, useApproximate, dataIndex, useSelectLabelOrItem, disableNullLabelSnap)`이 선택 우선순위 (1) directHit(bar 박스 내부) 중 최근접 → (2) hit(line 근접 등) 중 최근접 → (3) 값 있는 series 중 박스 거리(`Util.calcBoxDistance`) 최근접 fallback으로 `{type, label, pos, value, sId, acc, useStack, dataIndex}`를 반환한다. dataIndex 미지정 시 유효 데이터가 있는 최근접 라벨로 스냅하며, `disableNullLabelSnap=true`(click/dblclick)면 all-null 라벨도 그대로 반환한다(sId='').
- **라벨/아이템 조회**: `getItemByLabelIndex(labelIndex)`는 해당 라벨의 show series 중 최댓값 아이템을, `getItem(selectedInfo)`은 seriesID+dataIndex(또는 dataIndex 배열)로 selectLabel/selectItem indicator용 위치 정보를 반환한다(all-null 라벨은 첫 visible series로 sId/label 보정). `getLabelInfoByPosition(offset, targetAxis)`은 스크롤바 range·라벨 배열·hit test 세 경로로 클릭 라벨 인덱스를 계산하고, `getCurMouseLabelVal`은 마우스 위치의 라벨 값을 라벨 배열 또는 축 steps 역산으로 구한다.
- **집계**: `getAggregations()`가 `data.data` 원본에서 series별 `{min, max, avg, total, last}`를 계산한다(null/undefined 제외). 결과가 `Number.MAX_SAFE_INTEGER` 범위를 벗어나면 console.warn.

## Business Rules

- passingValue 치환은 두 단계다: `createDataSet`이 raw 값 중 passingValue를 `null`로 치환하고, `addSeriesDS`는 base series(`isBase=true`)에 한해 첫 series의 passingValue(`basePassingValue`)와 일치하는 값을 0으로 치환한다. `basePassingValue`는 "시리즈마다 동일한 값"이라는 전제로 루프 밖 1회만 계산한다.
- `interpolation: 'zero'`는 falsy 항목(null/undefined/0 포함 판정은 `!item`)을 0으로 치환한다.
- 스택 base 조회 규칙: "가장 최근에 갱신된, 보이는 동일 부호의 유효 base"가 누적 top이다. show=false series·position null·passingValue 포인트는 top에 기여하지 않는다(기존 `bsIds` 역방향 탐색과 동치).
- 점객체 풀 재사용은 "모든 점객체가 동일 10필드 형태 + 전 필드 덮어쓰기"를 전제로 하므로 stale 값 위험이 없다.
- `reconcileSeriesSet`은 기존 `seriesList`를 mutate하지 않고 항상 새 객체를 만든다 — `Object.keys` 순서에 의존하는 draw/hit/legend/worker 경로 보호.
- realTimeScatter 만료 제거는 별도 옵션 없는 기본 동작이며, 재추가 방지 가드의 해제(부활)는 `reconcileSeriesSet` 단일 지점에서만 수행한다.
- pie/sunburst는 show series만 데이터셋에 포함하고 각 depth를 값 내림차순 정렬한다. sunburst의 dummy slice는 부모 각도 범위를 유지하기 위한 placeholder다.
- **(성능)** 데이터 변경 프레임의 geometry 재계산은 `_dataEpoch` 증가로만 무효화한다(`computeGeometry`가 (dataEpoch, scaleVersion) 키로 skip).
- **(성능)** 실시간 대시보드의 series churn(pod 생성/소멸) 프레임에서 full-recreate 대비 5.5× 개선을 목표로 공통 series의 `.data` 점객체 풀 + geometry 메모이즈를 보존한다(reconcile).
- **(성능)** 스택 base 조회는 O(1)(stackTops), 라벨 유효성 mask는 `createDataSet` 시점 1회 사전계산, realTimeScatter 좌표 키는 push 시점 1회 캐시로 렌더 단계 재계산을 제거한다.

## Acceptance Criteria

- 2단 스택에서 위 series의 점객체가 `y = base + own`, `o = own`, `b = base position`을 갖는다. base가 null·다른 부호·passingValue·show=false인 라벨은 건너뛰고 다음 유효 base 위에 쌓인다. (addSeriesStackDS.spec.js, model.store.spec.js)
- `prevData` 풀 전달 시 점객체 참조가 재사용되고 값은 새 데이터로 갱신되며, 풀 유무와 무관하게 출력이 동일하다. 새 데이터가 짧으면 새 길이만 반환한다. (addSeriesStackDS.spec.js)
- 같은 series 집합을 reconcile하면 전 인스턴스 참조가 재사용되고, opt/type 변경 series만 recreate되며, index만 바뀐 색 명시 series는 재사용된다. 재사용 인스턴스의 show는 `_freshShow`로, group/stack 메타는 기본값으로 리셋된다. (reconcileSeriesSet.spec.js)
- realTimeScatter: 동일 (x,y)는 배치 내 1회만 push되고(`coordinateDedupe=false`면 전부 push), (a)+(b) 조건 충족 series는 즉시 제거되며, 제거된 series는 신규 점이 오기 전까지 데이터 레이어에서 재생성되지 않고 신규 점이 오면 reconcile에서 부활한다. 생존 series의 maxX는 전역 max toTime을 따른다. (model.store.spec.js, reconcileSeriesSet.spec.js)
- hit test: directHit > hit > 거리 기반 fallback 우선순위를 지키고, 값(o)이 null인 series는 좌표가 더 가까워도 fallback에서 제외되며(0은 포함), all-null 라벨은 `disableNullLabelSnap` 여부에 따라 이웃 스냅 또는 그대로 반환한다. (model.store.spec.js)
- `getVisibleWindowMaxSeries`는 윈도우 내 유한값 max만 반환하고 show=false·NaN/Infinity를 제외하며, 윈도우가 data 길이 밖이어도 안전하게 clamp한다. (model.store.spec.js)

## Architecture

model은 클래스가 아닌 메서드 모음(plain object) 2개로 구성되고, EvChart 생성자가 인스턴스에 flat mixin한다. 상태는 전부 EvChart 인스턴스 소유다.

```
┌──────────────────────── EvChart (chart.core.js) ────────────────────────┐
│  constructor: Object.keys(Model).forEach(key => Object.assign(this, …)) │
│                                                                          │
│  상태: options, data, seriesList, seriesInfo.charts, dataSet(rtScatter), │
│        pieDataSet, minMax, _dataEpoch, prunedRealTimeScatterSeries       │
│                                                                          │
│  ┌─ model.series (Series) ─────┐   ┌─ model.store (Store) ────────────┐ │
│  │ createSeriesSet /           │   │ createDataSet / addSeriesDS /    │ │
│  │ reconcileSeriesSet /        │──▶│ addSeriesStackDS / pie·sunburst /│ │
│  │ addSeries / addGroupInfo    │   │ realTimeScatter 링 버퍼·prune /  │ │
│  │ (element.* 인스턴스 생성)   │   │ min/max·hit test·집계 조회      │ │
│  └─────────────────────────────┘   └──────────────────────────────────┘ │
│         │                                   │                            │
│         ▼                                   ▼                            │
│  element/element.{line,scatter,bar,bar.time,pie,heatmap}  (series 실체) │
└──────────────────────────────────────────────────────────────────────────┘
```

## File Structure

| 파일 | 역할 |
|------|------|
| index.js | `{ Store, Series }` export + 공용 JSDoc typedef(ChartDOMSize, ChartRect, MouseLabelValue, ChartSeriesDataPoint, InterpolationType) |
| model.series.js | 시리즈 인스턴스 생성(createSeriesSet/addSeries)·증분 재조정(reconcileSeriesSet, 재사용 판정)·overlapping 정렬·스택 그룹 메타(addGroupInfo) |
| model.store.js | 데이터셋 정규화(일반/스택/pie/sunburst/scatter/heatMap/realTimeScatter 링 버퍼)·만료 제거·min/max·hit test·라벨 조회·집계 |

## Dependencies

| 대상 | 용도 |
|------|------|
| lodash-es | `isEqual`(reconcile opt 비교), `reverse`(pie reverse 옵션) |
| dayjs | realTimeScatter series `minMax.minX/maxX` 생성 |
| ../helpers/helpers.util | `coordinateKey`(dedupe 키), `isNullOrUndefined`, `isPieType`, `calcBoxDistance`(fallback 거리), `checkSafeInteger`(집계 범위 경고) |
| ../element/element.* | Line/Scatter/Bar/TimeBar/Pie/HeatMap 시리즈 인스턴스 생성자 |
| chart.core.js (소비자) | 생성자 mixin, init 경로(createSeriesSet→addGroupInfo→createDataSet→getStoreMinMax)·update 경로(reconcileSeriesSet→…) 호출 |
| interaction 모듈 (소비자) | `buildLabelValidMask` optional 호출(hit test mask) |
| blit 경로 (소비자) | `dataset.lastTick` 메타 소비(strip-only redraw 판정) |

## Glossary

| 용어 | 정의 |
|------|------|
| 점객체(ChartSeriesDataPoint) | `{x, y, o, b, xp, yp, w, h, dataColor, dataTextColor}` 형태의 정규화 데이터 포인트. o=원본값, b=스택 base, xp/yp/w/h=렌더 단계가 채우는 픽셀 좌표 |
| passingValue | "결측 표시값"으로 취급할 원본 값. 데이터셋에서 null 치환되고 min/max·stack top·hit fallback에서 제외된다 |
| stackTops | 스택 그룹별 부호별(`pos`/`neg`) 누적 top 배열. base 조회를 O(1)로 만드는 createDataSet 지역 상태 |
| _dataEpoch | 데이터셋 재생성마다 +1되는 카운터. geometry 메모이즈 무효화 키 |
| dataGroup(링 버퍼) | realTimeScatter의 초 단위 버킷 배열. `startIndex`/`endIndex` 링 포인터로 전진하며 버킷별 data/dataKeys/max/min 보유 |
| prunedRealTimeScatterSeries | 만료 제거된 series 키 Set(재추가 방지 가드). 해제는 reconcileSeriesSet에서만 |
| reconcile key | 인스턴스 생성 시 opt 외 입력을 캡처한 키(type/isHorizontal/timeMode/realTime/heatMapColor/isGradient). 재사용 판정 기준 |
| _freshShow | 생성자가 resolve한 show 값(범례 토글 전). 재사용 시 이 값으로 리셋 |
| overlapping | 그룹 bar를 나란히가 아니라 겹쳐 그리는 모드. 큰 값이 먼저 그려지도록 역순 정렬 |
| dummy slice | sunburst에서 부모 각도 범위 유지를 위해 삽입되는 `id:'dummy'` placeholder |
| lastTick | realTimeScatter 틱 메타(seq/gapCount/maxDirtyAge 등). blit fast-path의 strip↔full 폴백 판정 입력 |

## Data Flow

```
[init]   data.series ─▶ createSeriesSet ─▶ addGroupInfo(groups)
[update] data.series ─▶ reconcileSeriesSet(prevSeriesList) ─▶ addGroupInfo(groups)
                                   │
                                   ▼
         data.data ┬─ realTimeScatter ─▶ createRealTimeScatterDataSet(링 버퍼 누적)
                   │                       ├─ pruneExpiredRealTimeScatterSeries(만료 제거)
                   │                       └─ dataset.lastTick ─▶ blit gate(draw)
                   └─ 그 외 ─▶ createDataSet(_dataEpoch++, 타입별 정규화)
                                ├─ addSeriesDS / addSeriesStackDS(+stackTops) / pie / heatMap
                                ├─ series.data(점객체 풀), series.minMax
                                └─ buildLabelValidMask()
                                   │
                                   ▼
         getStoreMinMax() ─▶ this.minMax ─▶ scale 계산 ─▶ element.draw(xp/yp/w/h 기입)
                                   │
[마우스 이벤트] ─▶ getHitItemByPosition / getLabelInfoByPosition / getItem
                        ─▶ tooltip / selectLabel·selectItem indicator
```
