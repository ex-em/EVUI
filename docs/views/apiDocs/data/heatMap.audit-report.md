# EvChart(HeatMap) API 문서(heatMap.json) 검증 보고서

- 검증 대상: `docs/views/apiDocs/data/heatMap.json`
- 비교 기준: `src/components/chart/**` (ground truth), 보조: `docs/views/heatMap/api/heatMap.md`
- 검증 일자: 2026-07-14
- 검증 방법: `uses.js` DEFAULT_OPTIONS(공유 기본값 + `heatMapColor`) 1:1 대조,
  `helpers/helpers.constant.js`(HEAT_MAP_OPTION·AXIS_OPTION·PLOT_* 상수), `element/element.heatmap.js`,
  `model/model.series.js`, `model/model.store.js`(addSeriesDSForHeatMap·getSeriesValueOptForHeatMap),
  `plugins/plugins.legend.js`, `plugins/plugins.legend.gradient.js`, `plugins/plugins.tooltip.js`
  (drawToolTipForHeatMap), `plugins/plugins.interaction.js`(heatMap click/drag 분기),
  `plugins/plugins.scrollbar.js`, `chart.core.js`(gradient legend 분기 50행, createAxes,
  buildLegendData), `scale/scale.js`·`scale.step.js`·`scale.time.category.js`, `Chart.vue`
  props/emits/slots 전수 대조

## 검증 결과 요약

- 검사 항목 수: 약 190개 노드(JSON 트리 전체) + 이벤트 3종 + v-model 1종
- **불일치(high): 8건** — 기본값 오류 7건 + 옵션명 오류(유령 항목) 1건
- **누락/타입(mid): 12건**
- **표기/뉘앙스(low): 6건**
- 의도적 제외(zoom/brush)는 누락으로 집계하지 않음
- 반영: 아래 표의 high/mid/low 전 항목을 `heatMap.json`·`heatMap.md` 두 파일에 반영 완료

## 상세 — 불일치·누락 목록

| # | 구분 | 경로(JSON path) | 문서 내용 | 코드 근거(파일:라인) | 실제 값 | 심각도 | 제안(=반영 내용) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 기본값 불일치 | `options.legend.show` | `default: "false"` | `src/components/chart/uses.js:35` | `true` | **high** | `true`로 수정 (lineChart audit에서 확정된 공유 상수 값 재확인) |
| 2 | 기본값 불일치 | `options.tooltip.fontColor` | `default: "'#000000'"` | `src/components/chart/uses.js:103` | `'#FFFFFF'` | **high** | `'#FFFFFF'`로 수정 (md의 오류를 JSON이 승계) |
| 3 | 기본값 불일치 | `options.heatMapColor.max` | `default: "'#5586EB'"` | `src/components/chart/uses.js:257` | `'#0052FF'` | **high** | `'#0052FF'`로 수정 |
| 4 | 기본값 불일치 | `options.heatMapColor.rangeCount` | `default: "5"` | `src/components/chart/uses.js:258` | `1` | **high** | `1`로 수정. 문서대로 믿으면 기본 5단계 그라데이션으로 오해함 |
| 5 | 기본값 불일치 | `options.heatMapColor.error` | `default: "'#FFFFFF'"` | `src/components/chart/uses.js:267` | `'#FF0000'` | **high** | `'#FF0000'`로 수정 |
| 6 | 기본값 불일치 | `options.axesX[].scrollbar.showButton`, `options.axesY[].scrollbar.showButton` | `default: "false"` | `src/components/chart/helpers/helpers.constant.js:154` (`AXIS_OPTION.scrollbar`) | `true` | **high** | `true`로 수정 (md도 동일 오류) |
| 7 | 기본값 불일치 | `options.axesX[].title.color`, `options.axesY[].title.color` | `default: "'#25262E'"` | `src/components/chart/helpers/helpers.constant.js:139-148` (`AXIS_OPTION.title.color`) | `'#808080'` | **high** | `'#808080'`로 수정. labelStyle.color(`'#25262E'`)와 혼동된 것으로 보임 (md도 동일 오류) |
| 8 | 유령 항목(옵션명 오류) | `options.selectItem.useBorder` | `useBorder` | `src/components/chart/uses.js:176` (`showBorder`), 소비처 `element/element.heatmap.js:288,418` (`selectItemOption?.showBorder`) | 코드에 `useBorder` 키 없음 — 실제 키는 `showBorder` | **high** | `showBorder`로 이름 수정. 문서대로 `useBorder: true`를 쓰면 border가 표시되지 않음 (md도 동일 오류) |
| 9 | 옵션 누락 | props `v-model:selectedItem`, `v-model:selectedLabel` | 없음 | `Chart.vue:36-43,82-83`, heatMap click 분기 `plugins/plugins.interaction.js:438-478`, `chart.core.js:2255-2266`(useBothAxis targetAxis) | selectItem/selectLabel 옵션이 heatMap에 유효하므로 두 v-model 모두 유효 | mid | 두 노드 추가 (selectedLabel은 useBothAxis 시 targetAxis 포함 설명) |
| 10 | 이벤트 누락 | events `click`, `dbl-click` | 없음 | `plugins.interaction.js:334-538`(onClick heatMap 분기), `:264-329`(onDblClick, heatMap은 default→setSelectedItemInfo), emit `uses.js:443,458` | heatMap에서 발생함 | mid | 두 이벤트 추가 |
| 11 | 이벤트 누락 | events `axes-scale-change`, `axes-data-max-change` | 없음 | `chart.core.js:322-352`(scaleChange 감시, 타입 무관), `chart.core.js:365-396`(emitDataMaxChange "차트 타입과 무관"), heatMap series도 `minMax` 보유 `model/model.store.js:38-49` | heatMap에서도 발생함 | mid | 두 이벤트 추가 + 축 옵션 `scaleChange` 노드 추가 |
| 12 | 옵션 누락 | `data.series.show`/`showLegend`/`xAxisIndex`/`yAxisIndex` | 없음 | `src/components/chart/helpers/helpers.constant.js:218-222` (`HEAT_MAP_OPTION`), 소비처 `element.heatmap.js:246,255-256` 등 | `show: true`, `showLegend: true`, `xAxisIndex: 0`, `yAxisIndex: 0` | mid | 4개 노드 추가 (md에도 누락) |
| 13 | 옵션 누락 | `options.tooltip.showHeader` | 없음 | `uses.js:123`, 소비처 `plugins/plugins.tooltip.js:524`(drawToolTipForHeatMap) | `true` | mid | 노드 추가 |
| 14 | 옵션 누락 | `options.axesX[]`/`options.axesY[]` 공통 `min`/`max`/`decimalPoint`/`showLastLabel`/`showIndicator`/`fixedSteps`/`scaleChange` | 없음 | `helpers.constant.js:106-160` (`AXIS_OPTION`), 병합 `scale/scale.js:15` | `min/max: null`, `decimalPoint: 'auto'`, `showLastLabel: false`, `showIndicator: false`, `fixedSteps: false`, `scaleChange: false` | mid | 7개 노드씩 추가 (lineChart.json과 동일 구성) |
| 15 | 옵션 누락 | `options.axesX[].plotLines`/`plotBands`, `options.axesY[]` 동일 | 없음 | `scale/scale.js:523,569,800`, **step 축 전용 처리** `scale/scale.step.js:2,432-491`, front 패스 `chart.core.js:1249-1253`(차트 타입 무관) | heatMap(step/time 축)에서도 동작하는 공용 축 기능 | mid | plotLines/plotBands 서브트리 추가 (lineChart.json에서 복사, tryIt 제외) |
| 16 | 옵션 누락 | `options.axesX[].labelStyle.fontWeight`/`padding`/`fixWidth`, `options.axesY[]` 동일 | 없음 | `helpers.constant.js:129,133-134` | `fontWeight: 400`, `padding: 0`, `fixWidth: undefined` | mid | 3개 노드씩 추가 |
| 17 | 옵션 누락 | `options.seriesReverse`, `options.workerRender`, `options.shallowDataWatch`, `options.shallowOptionsWatch` | 없음 | `uses.js:270,277,283,288`; workerRender는 heatMap 지원 명시 `chart.core.js:563` (`supported = { line, bar, heatMap: true }`), shallow*Watch는 `Chart.vue` watch 설정부 | 전부 default `false`, heatMap에 유효 | mid | 4개 노드 추가 (lineChart.json 설명 재사용) |
| 18 | enum 오류 | `options.type.values` | `['bar', 'pie', 'line', 'scatter']` — **'heatMap' 없음** | `chart.core.js:50,1156` 등 heatMap 분기는 전부 `options.type === 'heatMap'` 판정 | heatMap 차트는 `'heatMap'` 지정이 필수 | mid | values에 `'heatMap'` 추가(선두), 설명에 "heatMap 차트는 'heatMap'으로 지정" 명시 |
| 19 | 타입 표기 | `options.axesX`, `options.axesY` | `type: "Object"` | `chart.core.js:1153-1176` (`axes.map(...)` — 배열), `scale/scale.js:15` | 배열(Array<Object>) | mid | `Array<Object>`로 수정 (lineChart.json 표기와 통일) |
| 20 | 표기 | `options.tooltip.use` | `default: "false"` (설명 없음) | `uses.js:98`(`use: true`) + **heatMap 전용 오버라이드** `uses.js:372-374`: `options.tooltip` 미지정 시 `use = false` 강제 | heatMap 실효 기본 `false`, 단 `tooltip: {...}`를 지정하면 `use` 기본 `true` | low | default `false` 유지 + 동작 조건 설명 보강 (md 동일) |
| 21 | 표기 | `options.axesX[].timeFormat`, `options.axesY[].timeFormat` | default 미기재 | `helpers.constant.js:118` | `'mm:ss'` | low | `default: "'mm:ss'"` 추가 |
| 22 | 표기 | `data.data` 설명 | "{ x, y, value } 형태" | `model/model.store.js:721-733` (`addSeriesDSForHeatMap`: `{ x, y, value, color = null }` → `dataColor`) | 셀별 `color` 오버라이드 지원 | low | 설명에 optional `color` 키 보강 |
| 23 | 표기 | `events.click-legend` 설명 | "활성화된 시리즈 Index 목록" | `plugins/plugins.legend.js:797-808` (heatMap은 `series.colorState` 기준 인덱스) | heatMap의 범례 항목은 시리즈가 아니라 **색상 범주(colorState)** — seriesIndices는 색상 범주 인덱스 | low | 설명 보강 (md 동일) |
| 24 | 표기 | `data.series.showValue.align` | `default: "'center'"` | `helpers.constant.js:223-229` (`HEAT_MAP_OPTION.showValue`에 `align` 키 없음), 렌더 분기 `element.heatmap.js:526,546-573` (미지정 시 switch default = center) | 리터럴 기본값은 `undefined`(렌더링 결과는 center와 동일) | low | 동작상 동일하므로 표기 유지 (수정 없음 — 보고만) |
| 25 | 표기 | `options.tooltip.formatter` 설명 | "함수 형태(({ x, y, value, seriesId }) => string)" | `plugins.interaction.js:1660-1668` (heatMap 분기: `{ x, y, value, seriesId, dataId }`, value가 음수(-1)면 `'error'` 문자열 전달) | `dataId` 포함, error 셀은 value `'error'` | low | 설명 보강 (md 동일) |

## 미문서화 유지(제외 사유) 항목

| 경로 | 코드 근거 | 판정 |
| --- | --- | --- |
| `options.zoom`, EvChartGroup/EvChartBrush 연동 | `uses.js:224-254`, `chartZoom.core.js` | ✅ 의도적 제외(EvChart(Zoom)/EvChart(Brush) 문서로 분리 예정 — 지시서 명시) |
| `options.indicator` | `plugins.interaction.js:2191-2196` (`isNotUseIndicator()` — heatMap 제외) | ✅ heatMap 미적용 — 제외 타당 |
| `options.legend.table` | `chart.core.js:1787` (`options.type !== 'heatMap'` 게이트) | ✅ heatMap 미적용 — 제외 타당 |
| `options.selectSeries`, `v-model:selectedSeries` | `plugins.interaction.js:416-478` (click의 selectSeries 분기는 line 전용) | ✅ heatMap 미적용 — 제외 타당 |
| `options.dragSelection.size` | `plugins.interaction.js:1189` (모바일 터치 선택 박스 — scatter 전용 경로 `:495-528`) | ✅ scatter 전용 — 제외 타당 |
| `options.dragSelection.displayFromStartArea` | `plugins.interaction.js:612-616,771` (scatter(PC) 전용 주석·게이트) | ✅ scatter 전용 — 제외 타당 |
| `options.unSelectedOpacity` | heatMap downplay는 하드코딩 0.1 (`element.heatmap.js:369-381`), unSelectedOpacity 소비처는 line selectSeries 경로(`chart.selection.js`) | ✅ heatMap 미적용 — 제외 타당 |
| `options.maxTip`, `options.selectItem`의 tip 계열(showTextTip/tipText/showTip/showIndicator/fixedPosTop/useApproximateValue/indicatorColor/tipStyle) | `element/element.tip.js:15-140` — tip 계산이 라벨 배열형(`this.data.labels`) 전제. heatMap의 labels는 `{x,y}` 객체형 | ⚠️ heatMap 동작 보장 근거 부족 — 미문서화 유지(확인 필요). 단 selectLabel.showTip은 heatMap 전용 분기(`element.tip.js:31-33` `drawLabelTipForHeatMap`)가 있어 문서 유지 타당 |
| `options.horizontal`, `options.syncHover` | horizontal은 bar 전용 옵션(heatMap 경로가 읽긴 하나 공식 사용례 없음), syncHover는 차트 그룹 hover 동기화(line indicator) | ⚠️ 미문서화 유지(확인 필요) |
| `data.series.passingValue` | `model.store.js:41-47`이 참조하나 `HEAT_MAP_OPTION`에 키 없음 | ⚠️ 미문서화 유지 |
| slots | `Chart.vue` template에 `<slot>` 없음 | ✅ slots 섹션 없음이 맞음 |

## 이벤트·v-model 대조

`Chart.vue:77-92` emits 전수 대비 heatMap 유효분:

| 이벤트/emit | JSON 문서화 | 판정 |
| --- | --- | --- |
| click / dbl-click | (누락 → 추가) | #10 |
| drag-select | 있음 | ✅ payload 일치 — heatMap 분기 `plugins.interaction.js:753-800` (`getDragInfoForHeatMap`/`getSelectionRangeForHeatMap`), items는 `element.heatmap.js:756-871`(findItems/findBlockRange/findSelectionRange) |
| mouse-move | 있음 | ✅ heatMap 라벨 분기 `model.store.js:1444-1447` 확인 |
| click-legend | 있음 | ✅ 발생 경로 `plugins.legend.js:725-810` — 단 heatMap payload 뉘앙스는 #23 |
| axes-scale-change / axes-data-max-change | (누락 → 추가) | #11 |
| update:selectedItem / update:selectedLabel | (누락 → v-model 2종 추가) | #9 |
| update:selectedSeries | 미문서화 | ✅ heatMap 미적용 — 제외 타당 |
| update:legendData (v-model:legend-data) | 있음 | ✅ (`chart.core.js:2013-2026`, toggleSeries/highlightSeries ref 노출 확인) |
| update:zoomStartIdx / update:zoomEndIdx / update:realTimeScatterReset | 미문서화 | ✅ zoom 분리 예정 / scatter 전용 — 제외 타당 |

## 일치 확인(✅) 요약 — 주요 대조 결과

- **Props**: `data`(required), `options`, `resize-timeout`(default 0, `Chart.vue:56-59`) ✅
- **data.series.showValue**(`HEAT_MAP_OPTION.showValue`): use false, textColor '#000000', fontSize 12, formatter null, decimalPoint 0 ✅ (align은 #24)
- **data.series.highlight**(`HEAT_MAP_OPTION.highlight`): stroke {use false, color null, width 1, radius 0}, shadow {use true, offsetX 0, offsetY 0, blur 4, color '#959494'} ✅
- **options 최상위**: width/height '100%', padding {20,2,2,4}, eventBehavior.legendClick 'update'/'emitOnly' ✅
- **title**: show false, height 40, text '', style {15, '#000', 'Roboto'} ✅
- **legend**(show 제외): type 'icon'(values icon/gradient — gradient 분기 `chart.core.js:50`, `plugins.legend.gradient.js` 확인), position 'right', color '#353740', inactive '#aaa', width 140, height 24, padding {0,0,0,0}(실효), allowResize/virtualScroll/external false, clickMode 'active', stopClickEvt(실효 false) ✅
- **tooltip**(fontColor·use·showHeader 제외): backgroundColor '#4C4C4C', borderColor '#666666', useShadow false, shadowOpacity 0.25, throttledMove true, debouncedHide false, sortByValue true, useScrollbar false, textOverflow 'wrap', fontFamily 'Roboto', fontSize {16,14}, colorShape 'rect', rowPadding {0,3,20,16}, showAllValueInRange false, virtualScroll {auto,50,28,5}, htmlScrollTarget/maxHeight/maxWidth/formatter/returnValue ✅
- **heatMapColor**(max·rangeCount·error 제외): min '#FFFFFF', colorsByRange [], stroke {show false, color '#FFFFFF', lineWidth 1, opacity 1, radius 0}, decimalPoint 0 (gradient 범례 라벨 소수점에도 사용 — `plugins.legend.gradient.js:405,434-435`) ✅
- **selectItem**(showBorder 이름 제외): use false, useClick true, borderStyle {'#FFFFFF',1,1,0}, useSeriesOpacity false, useDeselectItem false ✅
- **selectLabel**: use false, useClick true, limit 1, useDeselectOverflow false, showTip false, useSeriesOpacity true, useLabelOpacity true, useApproximateValue false, useBothAxis false(`uses.js:207`, heatMap 분기 `plugins.interaction.js:440-478`), tipBackground '#000000' ✅
- **dragSelection**(문서화분): use false, keepDisplay true, fillColor '#38ACEC', opacity 0.65, startArea '' ✅ — heatMap은 `onMouseDown` 게이트에 포함(`plugins.interaction.js:549`)
- **axes 공통**(문서화분): showAxis true, startToZero false, autoScaleRatio null, showGrid true, axisLineWidth 1, axisLineColor/gridLineColor '#C9CFDC', range null, interval(time string/step number — `scale.step.js:125`), categoryMode(time 전용, `chart.core.js:1164-1167`), showAxisTick true, labelStyle(show true, fontSize 12, color '#25262E', fontFamily 'Roboto', fitWidth false, maxWidth undefined, fitDir 'right', alignToGridLine false), firstLabelFontStyle/lastLabelFontStyle null, title(color 제외 전부), scrollbar(showButton 제외 전부 — heatMap step 축의 labels[dir] 처리 `plugins.scrollbar.js:54,364,473`) ✅
- **축 type values**: 'time'/'step'만 문서화 — heatMap은 `createAxes`가 labels(`data.labels[dir]`)를 넘기는 TimeCategoryScale/StepScale 경로가 유효하므로 타당 ✅
- **tryIt 보유 노드**: 없음 — 수정 제약 해당 없음
