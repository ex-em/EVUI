# EvChart(Pie) API 문서(pieChart.json) 검증 보고서

- 검증 대상: `docs/views/apiDocs/data/pieChart.json`
- 비교 기준: `src/components/chart/**` (ground truth), 보조: `docs/views/pieChart/api/pieChart.md`
- 검증 일자: 2026-07-15
- 검증 방법: `uses.js` DEFAULT_OPTIONS(공유 기본값 + pie 전용 padding 분기) 1:1 대조,
  `helpers/helpers.constant.js`(PIE_OPTION·COLOR), `element/element.pie.js`, `plugins/plugins.pie.js`,
  `model/model.series.js`, `model/model.store.js`(createPieDataSet·createSunburstDataSet·calculateAngle·
  getHitItemByPosition pie 분기), `plugins/plugins.interaction.js`(onClick/onDblClick/onMouseMove pie 분기,
  selectItemByData, getFormattedTooltipValue pie 분기), `plugins/plugins.legend.js`, `chart.core.js`,
  `Chart.vue` props/emits/slots 전수 대조. pie는 축이 없으므로 axes/indicator/maxTip/selectLabel/
  selectSeries/dragSelection 계열은 문서 제외가 타당한지만 확인.

## 검증 결과 요약

- 검사 항목 수: 약 90개 노드(JSON 트리 전체) + 이벤트 3종 + v-model 2종 + 슬롯 0종
- **불일치(high): 5건** — 기본값/키 오류 3건 + 유령 항목 2건
- **누락/기본값(mid): 9건**
- **표기/뉘앙스(low): 4건**
- 슬롯: `Chart.vue`에 슬롯 없음 → slots 섹션 부재 ✅
- 의도적 제외(zoom/brush, scatter/heatMap·축 전용 옵션)는 누락으로 집계하지 않음

## 상세 — 불일치·누락 목록

| # | 구분 | 경로(JSON path) | 문서 내용 | 코드 근거(파일:라인) | 실제 값 | 심각도 | 제안 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 기본값 불일치 | `options.legend.show` | `default: "false"` | `src/components/chart/uses.js:35` | `true` | **high** | JSON·md 모두 `true`로 수정 (lineChart audit에서 확정된 공유 상수 값과 동일. pie 전용 오버라이드 없음 확인) |
| 2 | 기본값 불일치 | `options.tooltip.fontColor` | `default: "'#000000'"` | `src/components/chart/uses.js:103` | `'#FFFFFF'` | **high** | `'#FFFFFF'`로 수정 (md의 오류를 JSON이 그대로 승계) |
| 3 | 키 이름 불일치 | `options.pieStroke` | `default: "{ show: true, color: '#FFFFFF', lineWidth: 2 }"` | `src/components/chart/uses.js:80-84` (`pieStroke: { use, lineWidth, color }`), 소비: `plugins/plugins.pie.js:47,76,145,181,245` (`pieStroke.use`) | 활성 키는 `show`가 아니라 **`use`** — `{ use: true, lineWidth: 2, color: '#FFFFFF' }` | **high** | 문서대로 `show: false`를 넘기면 테두리가 꺼지지 않음. `use`로 교정하고 하위 노드(use/color/lineWidth) 추가 |
| 4 | 유령 항목 | `data.series.stroke` | `default: "{ use: true, color: '#FFFFFF', lineWidth: 2 }"` "차트의 테두리선…" | `helpers/helpers.constant.js:93-97` (PIE_OPTION.stroke — 키도 `show`) 상수엔 있으나 소비처 0건: `element/element.pie.js:46-76` draw는 파라미터 `strokeOptions`(=options.pieStroke)만 사용, `this.stroke` 사용처는 heatmap뿐(`element.heatmap.js:101`) | 시리즈 레벨 stroke는 **어디서도 읽지 않음** — 테두리는 `options.pieStroke` 전역 옵션만 유효 | **high** | JSON·md에서 제거. 상수 자체가 dead-key이므로 코드 정리 후보 |
| 5 | 유령 항목 | `options.tooltip.showAllValueInRange` | "동일한 axes 값을 가진 전체 series를 툴팁에 표시" | `plugins/plugins.interaction.js:38,1704-1721` — `series.data.find(...)`로 축 라벨(x/y) 매칭. pie의 `series.data`는 배열이 아니라 `{ o, percentage }` 객체(`plugins/plugins.pie.js:95`) | pie에서는 축 개념이 없어 무의미하며, true로 켜고 hover하면 `data.find is not a function` 오류 가능 | **high** | pie 문서에서 제거 (축 기반 공유 옵션) |
| 6 | 옵션 누락 | `options.sunburst` | 없음 | `chart.core.js:1031`(drawSunburst 분기), `model/model.store.js:22,415-511`(createSunburstDataSet), 공개 예제 `docs/views/pieChart/example/Sunburst.vue:82` | 다계층(선버스트) 파이 모드. true면 `data.data`를 `{ id, value, children }` 객체 **배열**로 전달 | mid | 노드 추가 (md에도 누락). DEFAULT_OPTIONS에 없어 기본 미지정(falsy)=일반 파이 |
| 7 | 옵션 누락 | `options.reverse` | 없음 | `src/components/chart/uses.js:85` (`reverse: false`), 소비: `model/model.store.js:1666-1668` (calculateAngle — sunburst 패스 한정 pieDataSet 반전) | `false`. sunburst 모드에서 계층 순서 반전 | mid | 노드 추가 (Sunburst.vue 예제에서 사용 중) |
| 8 | 옵션 누락 | `options.padding` | 없음 | `src/components/chart/uses.js:376-383` (pie이고 padding 미지정 시 `{ top: 2, right: 2, left: 2, bottom: 4 }` 강제), 소비: `plugins/plugins.pie.js:28-38` (반지름 계산) | pie 전용 기본값 `{ top: 2, right: 2, left: 2, bottom: 4 }` (공유 기본 {20,2,2,4}와 다름) | mid | 노드 추가. lineChart 문서에는 있는 항목 |
| 9 | 옵션 누락 | `options.unSelectedOpacity` | 없음 | `src/components/chart/uses.js:77` (`0.3`), 소비: `chart.core.js:1027-1049` → `plugins/plugins.pie.js:85-97`(isDownplay) → `element/element.pie.js:54` | 범례 hover 시 비대상 조각의 투명도 `0.3` | mid | 노드 추가 (lineChart 문서에는 있는 항목) |
| 10 | 옵션 누락 | `data.series.show`, `data.series.showLegend` | 없음 | `helpers/helpers.constant.js:91-92` (PIE_OPTION: `show: true`, `showLegend: true`) | 각각 default `true` | mid | 두 노드 추가 (md에도 누락) |
| 11 | 옵션 누락 | `options.selectItem.useClick`, `options.selectItem.useDeselectItem` | `use`만 문서화 | `uses.js:158,175`; 게이트 `plugins/plugins.interaction.js:352,481-487` (`use && useClick`), `plugins.interaction.js:2142-2147` (isDeselectItem) | `useClick: true`, `useDeselectItem: false` — 둘 다 pie 클릭 경로에서 유효 | mid | 두 노드 추가. 나머지 tip 계열(showTip/showTextTip/showIndicator/tipStyle 등)은 축 기반 tip(element.tip.js)이라 pie 부적용 → 미기재 타당 |
| 12 | 이벤트 누락 | `events.mouse-move` | 없음 | `plugins/plugins.interaction.js:171-177` (pie 포함 모든 타입에서 emit; pie는 `curMouseTargetVal` 미포함), `uses.js:465-471` | pie에서도 발생. payload는 `e`와 `hoveredLabel`(pie는 빈 라벨) | mid | events에 추가. drag-select(scatter/line/heatMap 전용 `plugins.interaction.js:549`), axes-* 계열은 pie 미발생 → 미기재 타당 |
| 13 | 기본값 불일치 | `data.series.type` | `default: "'bar'"` | `model/model.series.js:27,77` (`series[key].type \|\| defaultType`, defaultType = `options.type`) | 미지정 시 `options.type`을 따름 (고정 'bar' 아님) | mid | default 제거, "미지정 시 options.type을 따름"으로 설명 교체 (lineChart.json과 동일 표기) |
| 14 | 표기 | `data.series.color` 설명 | "사전에 정의된 **16개** 색상" | `helpers/helpers.constant.js:16-42` (COLOR 25개), `element/element.pie.js:16-18` (`COLOR[sIdx % COLOR.length]`) | 25개 | low | "25개"로 수정 (md 승계 오류, lineChart audit #17과 동일) |
| 15 | 표기 | `options.tooltip.formatter` 설명 | 함수형 인자 `({ name, value, seriesId })` | `plugins/plugins.interaction.js:1650-1658` (pie 분기: 함수형/객체형 동일하게 `{ value, name, percentage, seriesId, dataId }` 전달), `plugins/plugins.tooltip.js:176` (`formatter.title`), `plugins.interaction.js:1599` (`formatter.label`) | pie에선 함수형에도 `percentage`가 전달됨. 객체형 키는 value 외 title/label도 지원 | low | 설명 보강 |
| 16 | 표기 | `options.type` | `default: "''"` | `uses.js:16-289` (DEFAULT_OPTIONS에 `type` 키 없음) | `undefined` | low | 동작 차이 없음 — lineChart 문서와 표기 통일 차원에서 유지 |
| 17 | 표기(md) | md data example | `series1: { name: 'series1', color: '#FF00FF },` | — | 따옴표 누락(문법 오류 예제) | low | `'#FF00FF'`로 수정 |

## 이벤트·v-model 대조

`Chart.vue:77-92` emits 전수 대조:

| 이벤트/emit | pie 유효성 | JSON 문서화 | 판정 |
| --- | --- | --- | --- |
| click / dbl-click | ✅ pie 분기 존재 (`plugins.interaction.js:481-487`, onDblClick default 분기 `320-323`) | ✅ | ✅ payload(selectedItem: value·seriesID) 설명 일치. `selectItem.use && useClick`이어야 selected 반환(`:352`) — useClick 게이트는 #11에서 문서화 |
| click-legend | ✅ (`plugins.legend.js` 공통, `eventBehavior.legendClick` 분기 포함) | ✅ | ✅ payload `{ e, data: { seriesIds, isActiveAll } }` 일치 |
| mouse-move | ✅ pie에서도 emit (`plugins.interaction.js:171-177`) | ❌ | #12 누락 |
| drag-select | ❌ mousedown 게이트가 scatter/line/heatMap 한정(`:549`), 모바일 경로도 scatter 한정(`:495`) | 미기재 | ✅ 제외 타당 |
| update:selectedItem | ✅ `selectItemByData`에 pie 전용 분기(`plugins.interaction.js:1779-1787` — sId만 사용) | props `v-model:selectedItem` | ✅ |
| update:selectedLabel / update:selectedSeries | ❌ pie onClick은 selectItem만 처리(`:481-487`) — selectLabel/selectSeries는 축·라벨 기반 | 미기재 | ✅ 제외 타당 |
| update:legendData | ✅ `legend.external` 공통 | props `v-model:legend-data` | ✅ |
| update:zoomStartIdx / update:zoomEndIdx / update:realTimeScatterReset | zoom 별도 문서 예정·scatter 전용 | 미기재 | ✅ 제외 타당 |
| axes-scale-change / axes-data-max-change | ❌ 축 없음(pie는 createAxes 경로 미사용) | 미기재 | ✅ 제외 타당 |

## 일치 확인(✅) 요약 — 주요 대조 결과

- **Props**: `data`(required), `options`, `resizeTimeout`(default 0, `Chart.vue:56-59`) ✅. 슬롯 없음 ✅
- **data 하위**: series `{}` / data `{}` ✅ (`uses.js:291-296`). groups/labels는 pie 미사용 → 미기재 타당
  (sunburst의 계층은 groups가 아니라 `data.data` 배열의 `children`으로 표현 — #6 참고)
- **series 기본값**(PIE_OPTION + element.pie.js): name `series-${index}`(`element.pie.js:12-14`),
  color `COLOR[index]`(`:16-18`), showValue { use: false, textColor '#000000', fontSize 12, formatter null }
  (`helpers.constant.js:98-103`), formatter 인자 `{ value, percentage }`(`element.pie.js:149-153`) ✅
- **options 최상위**: width/height '100%', doughnutHoleSize 0(0~1 비율, `plugins.pie.js:37`) ✅
- **title**: show false, height 40, text '', style {15, '#000', 'Roboto'} ✅
- **legend**(show 제외): position 'right', color '#353740', inactive '#aaa', width 140, height 24,
  padding(실효 {0,0,0,0} — `plugins.legend.js:1255`), allowResize/virtualScroll/stopClickEvt/external false,
  clickMode 'active', table 하위 전부 ✅. table의 "bar, line, pie 전용" 표기도 코드 게이트
  (`plugins.legend.js:96-99` — heatmap/scatter만 제외)와 부합 ✅. `legend.type`은 heatMap gradient 전용 → 미기재 타당
- **tooltip**(fontColor·showAllValueInRange 제외): use true(pie는 scatter/heatMap과 달리 강제 off 없음 —
  `uses.js:372-374`), backgroundColor '#4C4C4C', borderColor '#666666', useShadow false, shadowOpacity 0.25,
  throttledMove true, debouncedHide false, sortByValue true(pie는 hover 시 단일 조각만 items에 담겨 실효 없음 — 무해),
  useScrollbar false, textOverflow 'wrap', fontFamily 'Roboto', fontSize {16,14}, colorShape 'rect',
  rowPadding {0,3,20,16}, showHeader true, virtualScroll {auto,50,28,5}, htmlScrollTarget/maxHeight/maxWidth,
  returnValue(seriesList·event 구조 `plugins.interaction.js:72-88`) ✅
- **selectItem**: use false ✅ (pie 선택 시 반지름 +5 강조 — `element.pie.js:50`, `plugins.pie.js:86`)
- **eventBehavior**: legendClick 'update' / 'emitOnly' ✅ (`uses.js:272-274`)
- **indicator/maxTip/axes/selectLabel/selectSeries/dragSelection 미기재**: pie 타당 —
  `plugins.interaction.js:2187-2193` isNotUseIndicator가 pie를 명시 제외, maxTip·selectLabel tip은 축 좌표
  기반(element.tip.js), dragSelection mousedown 게이트에 pie 없음 ✅
- **tryIt 보유 노드**: 없음 (pieChart.json에는 tryIt 필드가 아직 없음 — 수정 제약 해당 없음)

## 비고

- `PIE_OPTION.stroke`(#4)는 상수에만 존재하는 dead-key. 문서 제거와 별개로 코드 정리 후보.
- `options.sunburst`·`reverse`(#6·#7)는 Sunburst.vue 공개 예제가 있어 "코드에 있으면 무조건 문서화" 원칙상
  pie 문서에 포함. sunburst 시 `data.data`가 객체 배열 형태로 바뀌는 점을 설명에 명시함.
- pie hover 툴팁은 축 스냅이 아니라 조각 hit-test(`element.pie.js:84-101`) 기반이라 hover 중인 조각 1개만 표시됨.
