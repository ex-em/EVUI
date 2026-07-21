# Chart Element — 시리즈 렌더러 (line/bar/pie/scatter/heatmap/tip)

## Purpose

EvChart의 시리즈(그래프 본체)를 캔버스에 그리는 타입별 렌더러 계층. 차트 타입별 클래스(Line/Bar/TimeBar/Pie/Scatter/HeatMap)가 픽셀 기하 계산(computeGeometry), 래스터(draw), 히트 테스트(findGraphData/findItems), 하이라이트(itemHighlight)를 담당한다. `element.tip.js`는 클래스가 아니라 ChartCore에 믹스인되는 tip(maxTip/selectItem/selectLabel 표식) 그리기 모듈이다.

인스턴스는 `model/model.series.js`의 `addSeries`가 시리즈 타입에 따라 생성하고, `chart.core.js`가 draw 패스(래스터)와 기하 패스(hit-test용)를 호출하며, `plugins/plugins.interaction.js`가 마우스 이벤트에서 히트 테스트 메서드를 소비한다.

## Features

### 공통 계약 (duck-typed 인터페이스)

- **시리즈 생성**: 생성자 `(sId, opt, sIdx, ...)` — 타입별 기본 옵션(`LINE_OPTION`/`BAR_OPTION`/`PIE_OPTION`, `helpers.constant`)을 사용자 옵션과 병합해 인스턴스 프로퍼티로 평탄화한다(사용자 옵션 우선). `name` 미지정 시 `series-${sIdx}`, `color` 미지정 시 `COLOR[sIdx % COLOR.length]` 순환 배정. **HeatMap만 예외** — 생성자가 `(sId, opt, colorOpt, isHorizontal, isGradient)`로 3번째 인자가 `sIdx`가 아니라 `colorOpt`이며(`sIdx` 파라미터 없음, `HEAT_MAP_OPTION` 병합), name/color 기본값을 배정하지 않고 `createColorState(colorOpt)`로 색상 상태를 만든다(`COLOR` import 없음).
- **래스터 패스 `draw(param)`**: `param = { ctx, chartRect, labelOffset, axesSteps, legendHitInfo, selectLabel, selectItem, selectSeries, isBrush, unSelectedOpacity, displayOverflow, ... }`. `this.show === false`면 즉시 반환. Pie만 시그니처가 다르다(`draw(context, strokeOptions, unSelectedOpacity)`).
- **기하 패스 `computeGeometry(param)`**: 캔버스 그리기 없이 각 데이터 아이템의 픽셀 기하(`item.xp/yp[/w/h]`)를 main 모델에 채운다. 히트 테스트가 이 값을 소비한다. draw는 내부에서 computeGeometry를 먼저 호출한 뒤 그 값을 읽기만 하고 mutate하지 않는다(worker offload 시 main 기하 유지 목적). **Pie는 computeGeometry가 없다** — 각도 기하(centerX/centerY/radius/startAngle/endAngle)를 `plugins/plugins.pie.js`가 계산해 인스턴스에 저장한다.
- **히트 테스트 `findGraphData(offset, ...)`**: 마우스 좌표로 그래프 아이템을 찾아 `{ data, hit, color, index, directHit? }`를 반환. Line/Bar는 `(offset, isHorizontal, dataIndex, useSelectLabelOrItem)` 4-인자, Scatter/Pie/HeatMap은 `offset`만 사용.
- **범위 탐색 `findItems(params)`**: 드래그 선택 범위 내 아이템 배열 반환. Line은 X 범위만(±1px 여유), Scatter는 X·Y 박스(±1px 여유), HeatMap은 부동소수점 보정(`PRECISION=100`) 후 셀 완전 포함 판정. Bar/Pie는 미구현.
- **하이라이트 `itemHighlight(item, ctx)`**: hover된 아이템 강조 렌더. Line/Scatter는 3중 포인트(그림자→색상→흰 중심), Bar는 shadowBlur 4 박스, Pie는 슬라이스 재그림, HeatMap은 stroke/shadow 옵션 반영 셀 확대(±0.5px).

### Line (element.line.js)

- **라인 렌더**: null 값에서 라인 끊기(moveTo 재시작), linear interpolation 시 null 점 스킵 후 이웃 연결. 동일 픽셀로의 연속 `lineTo`는 생략(zero-length no-op 제거).
- **포인트 배칭**: 기본(circle) 스타일은 전 포인트를 단일 path에 모아 fill/stroke 1회. `NON_CIRCLE_POINT_STYLES`(triangle/rect/rectRounded/rectRot/cross/crossRot/star/line)는 focus/blur 그룹별 `Canvas.drawPointBatch` 1회씩.
- **fill 렌더**: `fill` 옵션 시 non-null 구간을 `[start, end]` 세그먼트 목록으로 만들어 폐곡선 fill. `fill.gradient`면 세로 linear gradient. 음수 값 포함 시 바닥은 y=0 위치.
- **기하 메모이즈**: `(dataEpoch, scaleVersion)` + `this.data` 참조가 직전과 같으면 computeGeometry skip. 버전 미전달 시 항상 재계산.
- **히트 테스트**: X축 기준 이진 탐색으로 최근접 포인트 탐색(임계값 = 평균 데이터 간격). Y 거리 15px 이내면 `hit`, 포인트 중심 반경(`max(pointSize + LINE_OPTION.pointSize, highlight.maxSize)`) 이내면 `directHit`(combo에서 bar보다 line 우선 판정용). `findApproximateData`는 X·Y 유클리드 거리 기반 근사 탐색(간격 40% 또는 최소 10px 감지 범위, 5px 미만이면 hit).
- **선택/범례 강조**: extent 3단계 — downplay(opacity 0.3, lineWidth ×1) / normal(1, ×1) / highlight(1, ×2). downplay 시 opacity는 `unSelectedOpacity`로 대체.

### Bar (element.bar.js)

- **수직/수평/스택 바 렌더**: `isHorizontal` 분기, 스택(`isExistGrp`)은 `item.b`(누적 base) 기준 위치 재계산. 값이 0이 아닌데 픽셀 크기가 0으로 떨어지면 최소 ±1px 보정(`w/h === null`인 range 밖 신호는 보정 제외).
- **가시 인덱스 윈도우**: `minIndex/maxIndex`(axesSteps)가 지정되면 그 범위만 그린다. 빈 윈도우 sentinel `{ minIndex: 0, maxIndex: -1 }`은 0회 루프로 아무것도 그리지 않음. `visibleStartIndex`/`filteredCount`를 기록해 히트 테스트가 소비.
- **두께 계산 `calculateBarSize`**: `'Npx'` 문자열이면 `min(bArea, N)`, 0~1 숫자면 `ceil(bArea × ratio)`, 그 외 bArea 전체.
- **값 라벨 `drawValueLabels`**: align start/center/out/end(기본). 스택 바에서 `out`은 미지원(console.warn 후 미표시). 텍스트가 막대 안에 들어가지 않으면 그리지 않음.
- **borderRadius**: 라운드 사각형(차트 영역 clip 적용). 예외 발생 시 `fillRect` 폴백. 스택 바는 라운드 미적용.
- **히트 테스트**: 가시 윈도우 범위에서 이진 탐색(`binarySearchBar`), 박스 내부 판정 `isPointInBar`. 박스 안이면 `hit`이자 `directHit`. `useIndicatorOnLabel` 경로는 dataIndex를 가시 윈도우로 clamp해 stale 기하 참조 방지.
- **기하 메모이즈**: Line 키에 `showIndex`, `showSeriesCount` 추가(가시성 토글이 막대 폭/위치를 바꾸므로).

### TimeBar (element.bar.time.js)

- **시간 진행형 바**: Bar 상속. `Canvas.calculateSubX`로 X를 구해 차트 좌/우 경계에 걸친 막대를 `subW` 누적으로 부분 클리핑. gradient 색상일 때 draw가 적용하는 w 보정을 computeGeometry에도 동일 반영. `cPad`는 2로 고정. 기하 메모이즈 없음(매 호출 재계산).

### Pie (element.pie.js)

- **슬라이스 렌더**: Path2D로 부채꼴 fill. `isSelect`면 radius +5. `strokeOptions.use`면 테두리 stroke. 기하는 외부(plugins.pie.js) 공급 — 위 "기하 패스 `computeGeometry`" 참조.
- **극좌표 히트 테스트**: 중심 거리 < radius 이고 radian(`2.5π − atan2(dx, dy)`)이 `[startAngle, endAngle]` 안이면 hit. `index`는 항상 0, `data`는 시리즈의 `this.data` 자체.
- **값 라벨**: 슬라이스 내각·반지름이 텍스트 크기 × 1.8 이상일 때만 슬라이스 중앙각/절반 반지름 위치에 표시.

### Scatter (element.scatter.js)

- **기본/실시간 이원 경로**: 생성자 4번째 인자 `realTimeScatter`로 분기. 실시간 데이터는 `this.data[this.sId].dataGroup[i].data[j]` 중첩 구조(링 버킷).
- **좌표 dedupe**: `coordinateDedupe !== false`(기본 on)면 동일 (x,y) 좌표는 owner 시리즈(`duple` Map의 `coordinateKey` → sId)만 그린다(cross-series overdraw 방지). dedupe on + legendHitInfo 없음이면 색상(stroke+fill 조합)별 그룹 배칭으로 `drawPointBatch` 1회씩.
- **blit 위상 정합**: 실시간은 `aliasPixel` 미적용 + `rtXOffsetCss` sub-pixel carry를 xsp에 가산해 blit 시프트 래스터와 full redraw의 픽셀 위상을 일치시킨다.
- **blit fast-path `realTimeScatterDrawStrip`**: 지정 버킷의 `item.drawn === false`인 점만 그리고 `drawn = true` 마킹(점당 정확히 1회 래스터 불변식 — 반투명 알파 누적 차단). `refreshRtHitCoords`는 래스터 없이 좌표만 일괄 재계산, `refreshRtTotalCount`는 총 점 수 캐시(`_rtTotalCount`) 갱신.
- **히트 테스트**: 포인트 중심 ±pointSize 박스 판정. 실시간은 최신 점 우선(역순 순회)이며 `_rtTotalCount` 기반 전역 index를 산출. 기본 경로는 `findIndex` 선형 탐색.
- **overflow 색상**: `item.y > graphMax`이고 `overflowColor` 지정 시 해당 색으로 표시.
- **색상 캐시**: `_colorCache` Map — `${color}_${opacity}` 키, 100개 초과 시 최고참 1개 축출.

### HeatMap (element.heatmap.js)

- **색상 상태 `createColorState`**: 3가지 모드 — gradient(min/max 색 선형 보간), `colorsByRange`(명시 구간), rangeCount 등분(discrete). 음수 값은 `errorColor`. discrete 모드의 색 인덱스는 `floor((value − min).toFixed(decimalPoint) / interval)`.
- **셀 렌더**: 라벨 배열에서 값 매칭으로 셀 좌표 산출(`calculateXY`; 인덱스 윈도우/graphMin·Max 밖이면 null → 숨김). border(stroke 또는 selectItem border) 표시 시 `2 × lineWidth < floor(w/h)`일 때만 좌표·크기 보정. computeGeometry가 `xp/yp/w/h`와 함께 `dataColor/cId`도 채운다.
- **오버레이 하이라이트 `drawOverlay`**: gradient 모드의 selectedValue 매칭 셀을 overlayCtx(main 전용, 래스터와 분리)에 즉답으로 강조. brush 차트는 overlayCtx가 없어 no-op.
- **히트 테스트/범위 탐색**: 박스 포함 판정(findGraphData). findItems는 셀이 선택 영역에 완전히 포함될 때만 반환. `findBlockRange`/`findSelectionRange`는 드래그 영역을 셀/라벨 경계에 스냅해 zoom 범위 산출.
- **값 라벨**: align top/right/bottom/left/center(기본). 텍스트가 셀보다 크면 미표시.

### Tip (element.tip.js — ChartCore 믹스인)

- **tip 렌더 `drawTips`**: maxTip(시리즈 최대값 표식), selectItem tip, selectLabel tip을 buffer(기본) 또는 전달받은 ctx(worker 경로는 displayCtx)에 그린다. `tipText: 'label'`이면 time 축은 `timeFormat`으로 포맷.
- **위치 계산 `calculateTipInfo`**: 타입별 dp 산출 — bar는 카테고리 인덱스 × `size.cat/ix/bPad`(scrollbar/가시 윈도우 인덱스 보정 포함), line은 `calculateX`(comboOffset 반영), scatter는 `calculateX`. `dp === null`(axis range 밖)이면 tip을 그리지 않는다.
- **가시 윈도우 maxTip**: 부분 클리핑 윈도우면 `getVisibleWindowMaxSeries`로 윈도우 내 max를 재산출, 빈 윈도우면 미표시, 전체 표시면 전역 캐시(`minMax`) 사용.
- **표식 렌더**: `showTextTip`(라운드 박스 + 화살표, 최소 폭 40px, 차트 좌/우 경계에서 left/right 형으로 밀림), `showTip`(삼각 화살표, 같은 위치 충돌 시 24px 오프셋), `drawFixedIndicator`(값 위치까지 세로/가로 지시선, lineWidth 2).

## Business Rules

- **displayOverflow 규약**: 값 축(vertical: Y, horizontal: X)의 `graphMax`를 초과하는 값은 `displayOverflow`가 켜졌을 때만 graphMax로 clamp되어 경계에 표시되고, 꺼져 있으면 `Canvas.calculateX/Y`가 null을 반환해 숨겨진다. 스택 base(`item.b`) 위치는 clamp하지 않고 raw를 유지한다(세그먼트 값만 clamp). tip도 동일 규약을 따른다 — overflow 값이 숨겨지면 maxTip/sel tip도 그리지 않는다(element.tip.js `calculateTipInfo`).
- **기하/래스터 분리 규약**: 히트 테스트가 읽는 픽셀 기하(`item.xp/yp/w/h`)는 main 모델에 있어야 한다. `computeGeometry`는 기하만 채우고(canvas 접근 없음), draw 래스터 패스는 기하를 읽기만 하고 mutate하지 않는다. 좌표 의미·null 처리·반올림은 두 패스가 완전히 동일해야 한다.
- **null 좌표 = "axis range 밖" 신호**: `xp/yp`(또는 w/h)가 null이면 그리지 않고, 라인은 끊고, fill/tip은 해당 지점을 건너뛴다. null을 산술에 흘리면 0으로 강제 변환되어 좌상단에 유령 렌더가 생기므로 각 소비처에서 null 가드가 필수다.
- **combo 차트 히트 우선순위**: line 포인트 중심 직격(`directHit`)은 같은 좌표의 bar 박스 히트보다 우선한다. bar는 박스 내부 히트 시 `directHit = true`로 대항 표시한다(판정 자체는 plugins.interaction의 findHitItem).
- **scatter dedupe 불변식**: dedupe on이면 한 좌표는 owner 시리즈만 그린다. blit 점 레이어에서는 "점당 정확히 1회 래스터"가 불변식이며, `drawn` 플래그는 실제 래스터 시점에만 set된다(`markDrawn` 전달 경로 한정 — buffer 직접 그리기는 레이어 상태를 오염시키지 않음).
- **(렌더 성능 — 배칭)**: 다수 시리즈 × 다수 포인트에서 점당 beginPath/fill/stroke를 호출하지 않는다. line circle 포인트는 단일 path, 비-circle과 scatter는 색/그룹별 `drawPointBatch`로 rasterizer flush를 상수 회로 억제한다.
- **(mousemove 핫패스 — 할당 억제)**: line의 valid 데이터 필터는 `(data 참조, length)` 키로 메모이즈(`_getValidGData` 메서드 / `_validGDataCache` 캐시 필드), 히트 탐색은 이진 탐색, 색 변환은 인스턴스 캐시(line `_rgbaCache` 슬롯형 / scatter `_colorCache` 100개 FIFO)로 프레임당 반복 계산·할당을 제거한다.
- **(기하 재계산 억제)**: line/bar는 `(dataEpoch, scaleVersion[, showIndex, showSeriesCount])` + data 참조 메모이즈로 hover 재렌더의 기하 재계산을 skip한다. 메모 키는 문자열이 아닌 숫자 필드 비교(수만 시리즈에서 키 문자열 할당 방지). TimeBar/Scatter/HeatMap은 메모이즈 없음.

## Acceptance Criteria

- 값이 전부 null인 line 시리즈는 래스터를 그리지 않지만(픽셀 0개) computeGeometry는 수행된다(`hasRenderableValue` false + 비스택 → draw만 skip).
- `displayOverflow: false`에서 graphMax 초과 데이터 포인트/막대는 화면·tip 모두에 나타나지 않고, `displayOverflow: true`에서는 graphMax 경계 위치에 표시된다.
- bar의 빈 가시 윈도우(`{ minIndex: 0, maxIndex: -1 }`)에서 draw 루프는 0회이며 아무것도 그리지 않는다.
- 값이 0이 아닌 bar는 픽셀 크기가 0으로 떨어져도 최소 1px로 그려진다(부호에 따라 ±1).
- line 히트 테스트: 최근접 포인트의 Y 거리 15px 이내면 `hit: true`, 포인트 반경 이내 직격이면 `directHit: true`가 추가된다.
- pie 히트 테스트: 슬라이스 내부 클릭 시 `hit: true, index: 0`, 슬라이스 밖이나 radius 밖이면 `data: null`.
- scatter dedupe on에서 두 시리즈가 같은 (x,y)를 가지면 owner 시리즈 1개만 그 좌표를 그린다.
- heatmap 셀 border는 `2 × lineWidth`가 셀 폭·높이(floor) 미만일 때만 그려지고, 기하 좌표도 동일하게 보정된다.
- blit strip 경로에서 이미 `drawn: true`인 scatter 점은 다시 그려지지 않는다(반투명 색에서도 full redraw와 픽셀 동일).
- tip은 `dp === null`(axis range 밖)이면 그려지지 않는다 — 좌상단 (0,0) 부근에 유령 tip이 생기지 않는다.

## Architecture

```
model/model.series.js (addSeries)              chart.core.js
  │ 타입별 인스턴스 생성                          │ drawSeriesLayer → series.draw(param)      [래스터]
  ▼                                             │ (worker 경로) series.computeGeometry(opt)  [기하만]
┌──────────────────────────────────────────┐    │ drawSeriesOverlay → heatmap.drawOverlay
│ element/                                 │    │ drawTips(Tip 믹스인) → buffer/display ctx
│  Line ─ Bar ─┬─ TimeBar (extends Bar)    │◀───┘
│  Pie   Scatter   HeatMap                 │    plugins/plugins.interaction.js
│                                          │◀── findGraphData / findItems / itemHighlight
│  element.tip.js (ChartCore 믹스인 객체)   │    plugins/plugins.pie.js
└──────────────────────────────────────────┘◀── pie 각도 기하 주입 (centerX/radius/각도)
        │
        ▼ 공통 헬퍼
helpers.canvas (calculateX/Y, drawPoint[Batch], createGradient)
helpers.util   (colorStringToRgba, aliasPixel, coordinateKey, ...)
helpers.constant (COLOR, LINE_OPTION, BAR_OPTION, PIE_OPTION, HEAT_MAP_OPTION)
```

두 패스 구조: **기하 패스**(computeGeometry — main 모델에 xp/yp/w/h 기록, hit-test 소비) / **래스터 패스**(draw — ctx에 픽셀만 생산, 기하 read-only). heatmap의 hover 즉답은 별도 **overlay 패스**(drawOverlay, main 전용).

## File Structure

| 파일 | 역할 |
|------|------|
| element.line.js | Line 렌더러 — 라인/fill/포인트(배칭), 기하 메모이즈, 이진 탐색 히트 테스트, findApproximateData |
| element.bar.js | Bar 렌더러 — 수직/수평/스택, 가시 윈도우, 값 라벨(4-align), borderRadius, binarySearchBar 히트 테스트 |
| element.bar.time.js | TimeBar(Bar 상속) — 시간 진행형 부분 클리핑(subW 누적), gradient w 보정 |
| element.pie.js | Pie 렌더러 — Path2D 슬라이스, 극좌표 히트 테스트, 슬라이스 내 값 라벨. 기하는 plugins.pie.js 공급 |
| element.scatter.js | Scatter 렌더러 — 기본/실시간 이원, 좌표 dedupe·색 그룹 배칭, blit strip fast-path, 박스 히트 테스트 |
| element.heatmap.js | HeatMap 렌더러 — 색상 상태 3모드, 셀 기하/border 보정, drawOverlay, 드래그 스냅(findBlockRange/findSelectionRange) |
| element.tip.js | Tip 믹스인(비클래스) — maxTip/selectItem/selectLabel 표식, dp 위치 계산, 지시선·화살표 렌더 |

## Dependencies

| 대상 | 용도 |
|------|------|
| ../helpers/helpers.canvas | 좌표 변환(calculateX/Y/SubX), 포인트 렌더(drawPoint/drawPointBatch), createGradient |
| ../helpers/helpers.util | 색 변환(colorStringToRgba/hexToRgb/getOpacity/getColorStringType), aliasPixel, coordinateKey, labelSignFormat, isNullOrUndefined |
| ../helpers/helpers.constant | COLOR 팔레트, LINE_OPTION/BAR_OPTION/PIE_OPTION/HEAT_MAP_OPTION 기본 옵션 |
| @/common/utils | truthy, truthyNumber, convertToPercent, checkNullAndUndefined, numberWithComma |
| lodash-es | defaultsDeep(line/bar), merge(pie/scatter/heatmap), isNil, isUndefined |
| dayjs | tip 라벨의 time 축 포맷(element.tip.js) |
| model/model.series.js (역방향) | addSeries가 타입별 인스턴스 생성·`this.data` 주입 |
| chart.core.js (역방향) | draw/computeGeometry/drawOverlay 호출, Tip 믹스인 호스트(bufferCtx/axesSteps/seriesList/minMax 등 this 컨텍스트 제공) |
| plugins/plugins.pie.js (역방향) | pie 각도 기하 계산·주입 |
| plugins/plugins.interaction.js (역방향) | findGraphData/findItems/itemHighlight 소비 |

## Glossary

| 용어 | 정의 |
|------|------|
| 기하 패스 / 래스터 패스 | computeGeometry(픽셀 좌표 계산·모델 기록)와 draw(ctx 픽셀 생산)의 분리. 래스터는 기하를 read-only 소비 |
| xp/yp/w/h | 데이터 아이템에 기록되는 픽셀 기하. null = axis range 밖(숨김) 신호 |
| o / b | 아이템의 원본 값(o)과 스택 누적 base(b). `item.b` 존재 시 스택 세그먼트로 렌더 |
| directHit | 근접(hit)이 아닌 도형 내부/중심 직격 판정. combo에서 line↔bar 우선순위 결정에 사용 |
| duple | 좌표키(coordinateKey) → owner sId 맵. scatter cross-series dedupe의 기준 |
| blit / strip | 실시간 scatter의 무손실 시프트 렌더 경로. strip은 신규 버킷만 추가 래스터하는 fast-path |
| drawn | scatter 점이 blit 점 레이어에 래스터됐음을 표시하는 플래그(점당 1회 래스터 불변식) |
| 가시 윈도우 | axesSteps의 minIndex/maxIndex가 지정하는 표시 인덱스 범위. 빈 윈도우 sentinel은 `{0, -1}` |
| extent | line의 상태별 스타일 배수(downplay/normal/highlight — opacity·lineWidth) |
| dp / cp / gp | tip 위치 계산의 데이터 위치(dp)·카테고리 위치(cp)·값 축 위치(gp) |
| dataEpoch / scaleVersion | 기하 메모이즈 키 — 데이터 버전과 스케일 버전(chart.core가 공급) |

## Data Flow

```
model.store(addData) → series.data[] { x, y, o, b, ... }
    │
    ▼ chart.core: 렌더 프레임
computeGeometry(param{axesSteps, chartRect, labelOffset, dataEpoch, scaleVersion})
    │  item.xp/yp[/w/h] 기록 (main 모델)
    ▼
draw(param{ctx, legendHitInfo, selectLabel/Item/Series, displayOverflow, ...})
    │  buffer/layer ctx에 래스터 (기하 read-only)
    ▼
drawTips (Tip 믹스인) / drawOverlay (heatmap)
    │
    ▼ mousemove/click (plugins.interaction)
findGraphData(offset) → { data, hit, directHit, index } → tooltip/selectItem
findItems(범위) → 드래그 선택 아이템 목록
itemHighlight(item, overlayCtx) → hover 강조
```

실시간 scatter blit 틱: `realTimeScatterDrawStrip`(신규 점만 래스터·drawn 마킹) → 좌표 스테일 시 `refreshRtHitCoords`(래스터 없이 xp/yp 일괄 갱신) → `refreshRtTotalCount`(histogram 인덱스용 총 점 수 갱신).
