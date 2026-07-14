# EvChart(Line) API 문서(lineChart.json) 검증 보고서

- 검증 대상: `docs/views/apiDocs/data/lineChart.json`
- 비교 기준: `src/components/chart/**` (ground truth), 보조: `docs/views/lineChart/api/lineChart.md`
- 검증 일자: 2026-07-14
- 검증 방법: `uses.js` DEFAULT_OPTIONS 전체 1:1 대조, `Chart.vue` props/emits/slots 전수 대조,
  `helpers/helpers.constant.js`(LINE_OPTION·AXIS_OPTION·PLOT_* 상수), `element/element.line.js`,
  `model/model.series.js`, `plugins/plugins.legend.js`, `plugins/plugins.tooltip.js`,
  `plugins/plugins.interaction.js`, `chart.core.js`, `scale/scale.js` 근거 확인

## 검증 결과 요약

- 검사 항목 수: 약 210개 노드(JSON 트리 전체) + 이벤트 7종 + v-model 4종 + 슬롯 1종
- **불일치(high): 6건** — 기본값 오류 5건 + 유령 슬롯 1건
- **누락/타입(mid): 9건**
- **표기/뉘앙스(low): 9건**
- 이벤트 완전성: ✅ (emit 전수 조사 결과와 일치 — 하단 "이벤트·v-model 대조" 참고)
- 의도적 제외(zoom/brush, realTimeScatter)는 누락으로 집계하지 않음

## 상세 — 불일치·누락 목록

| # | 구분 | 경로(JSON path) | 문서 내용 | 코드 근거(파일:라인) | 실제 값 | 심각도 | 제안 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 기본값 불일치 | `options.legend.show` | `default: "false"` | `src/components/chart/uses.js:35` | `true` | **high** | JSON·md 모두 `true`로 수정. 문서대로 믿으면 "범례가 기본으로 안 나온다"고 오해함 |
| 2 | 기본값 불일치 | `options.tooltip.fontColor` | `default: "'#000000'"` | `src/components/chart/uses.js:103` | `'#FFFFFF'` | **high** | `'#FFFFFF'`로 수정 (md의 오류를 JSON이 그대로 승계) |
| 3 | 기본값 불일치 | `options.maxTip.use` | `default: "true"` | `src/components/chart/uses.js:143` | `false` | **high** | `false`로 수정 (md도 `true`로 잘못 기재됨) |
| 4 | 기본값 불일치 | `options.axesX[].plotBands.color`, `options.axesY[].plotBands.color` | `default: "'#FF0000'"` | `src/components/chart/helpers/helpers.constant.js:213-216` (`PLOT_BAND_OPTION.color`) | `'#FAE59D'` | **high** | `'#FAE59D'`로 수정. plotLines의 `'#FF0000'`과 혼동된 것으로 보임 (md도 동일 오류) |
| 5 | 기본값 불일치 | `options.axesX[].title.color`, `options.axesY[].title.color` | `default: "'#25262E'"` | `src/components/chart/helpers/helpers.constant.js:139-148` (`AXIS_OPTION.title.color`) | `'#808080'` | **high** | `'#808080'`로 수정. labelStyle.color(`'#25262E'`)와 혼동된 것으로 보임 (md도 동일 오류) |
| 6 | 유령 항목 | `sections[kind=slots].noData` | "데이터가 없을 때 차트 영역에 표시할 내용을 정의하는 슬롯" | `src/components/chart/Chart.vue:1-7` (template에 `<slot>` 없음), `src` 전체 grep에서 `noData`/`<slot` 0건 | 슬롯 미구현 | **high** | slots 섹션에서 `noData` 제거(또는 섹션 자체 삭제). md에도 슬롯 문서 없음 — JSON 작성 시 잘못 추가된 항목 |
| 7 | 옵션 누락 | `data.series.type` | 없음 | `src/components/chart/model/model.series.js:27,77` (`series[key].type \|\| defaultType`) | 시리즈별 타입 오버라이드 가능(`'line'`/`'bar'` 등, 콤보 차트 용) | mid | `type` 노드 추가 (default: `options.type` 값). md에도 누락 |
| 8 | 옵션 누락 | `data.series.xAxisIndex`, `data.series.yAxisIndex` | 없음 | `src/components/chart/helpers/helpers.constant.js:58-59` (`LINE_OPTION`) | 각각 default `0` (다중 축에서 시리즈가 사용할 축 인덱스) | mid | 두 노드 추가. md에도 누락 |
| 9 | 옵션 누락 | `options.selectItem.*` | `useSeriesOpacity`/`useDeselectItem`/`showBorder`/`borderStyle` 없음 | `src/components/chart/uses.js:174-182` | `useSeriesOpacity: false`, `useDeselectItem: false`, `showBorder: false`, `borderStyle: { color: '#FFFFFF', lineWidth: 1, opacity: 1, radius: 0 }` | mid | 4개 노드 추가. 특히 `useSeriesOpacity`는 selectLabel(기본 `true`)과 기본값이 달라 명시 가치가 큼 |
| 10 | 옵션 누락 | `options.selectLabel.useBothAxis` | 없음 | `src/components/chart/uses.js:207` | `false` | mid | 노드 추가 |
| 11 | 옵션 누락 | `options.dragSelection.*` | `size`/`displayFromStartArea` 없음 | `src/components/chart/uses.js:218,222` | `size: 50`, `displayFromStartArea: false` | mid | 두 노드 추가 (md에도 누락) |
| 12 | 옵션 누락 | `options.axesX[]`, `options.axesY[]` 공통 | `min`/`max`/`range`/`decimalPoint`/`showLastLabel`/`showIndicator`/`scrollbar` 없음 | `src/components/chart/helpers/helpers.constant.js:106-160` (`AXIS_OPTION`), 병합: `scale/scale.js:15` | `min: null`, `max: null`, `range: null`, `decimalPoint: 'auto'`, `showLastLabel: false`, `showIndicator: false`, `scrollbar: { use: false, ... }` | mid ⚠️ | md에도 전부 누락 — 의도적 문서 생략일 수 있음. 최소한 `min`/`max`/`range`/`decimalPoint`는 사용 빈도가 높아 추가 권장. `scrollbar`는 line 유효성 추가 확인 필요(⚠️, `chart.core.js:170`은 축 무관하게 게이트) |
| 13 | 옵션 누락 | `options.axesX[].labelStyle`, `options.axesY[].labelStyle` | `fontWeight`/`alignToGridLine` 없음 | `src/components/chart/helpers/helpers.constant.js:129,132` | `fontWeight: 400`, `alignToGridLine: false` | mid | 두 노드 추가 (md에도 누락) |
| 14 | 타입 불일치 | `options.axesY[].interval` | `type: "String"`, 설명 예시 `'day', 'hour', 'minute'` | `src/components/chart/scale/scale.linear.js:46-47` (`if (this.interval) return this.interval;` — 숫자 간격으로 사용) | linear(Y) 축에서는 **Number**(값 간격). String(`'day'` 등)은 time 축 전용 | mid | axesY 쪽 `interval`은 `Number`로, 설명·예시를 숫자 간격으로 교체 (md의 공통 표를 그대로 복사하며 생긴 오류) |
| 15 | 옵션 누락 | `options.seriesReverse`, `options.workerRender` | 없음 | `src/components/chart/uses.js:270,277`; 사용처 `chart.core.js:773`(그리기 순서 반전), `chart.core.js:115-129`(worker 렌더 opt-in) | `seriesReverse: false`, `workerRender: false` — 둘 다 line에 유효 | mid ⚠️ | md에도 누락 — 의도적 생략일 수 있어 ⚠️. 문서화한다면 line 차트에 유효한 성능/표시 옵션으로 추가 |
| 16 | 표기 | `data.series.pointStyle` | `default: "'circle'"` | `src/components/chart/helpers/helpers.constant.js:63` (`pointStyle: ''`), 렌더 분기 `helpers/helpers.canvas.js:90+` (switch default = circle) | 리터럴 기본값은 `''`(렌더링 결과는 circle과 동일) | low | 동작상 동일하므로 유지 가능. 정확히 하려면 "`''`(circle로 렌더링)"로 표기 |
| 17 | 표기 | `data.series.color`/`fillColor`/`pointFill` 설명 | "사전에 정의된 **16개** 색상('#2b99f0' ~ '#df6264')" | `src/components/chart/helpers/helpers.constant.js:16-42` (`COLOR`) | 25개 색상 | low | "16개" → "25개"로 수정 (md에서 승계된 오류) |
| 18 | 표기 | `data.series.pointFill` | `default: "COLOR[index]"` | `src/components/chart/element/element.line.js:32-36` | 미지정 시 **해당 시리즈의 `color` 값**을 따름(그 color가 다시 팔레트 기본) | low | "미지정 시 시리즈 color를 따름"으로 설명 보강. 사용자가 `color`만 지정해도 pointFill이 함께 바뀜 |
| 19 | 표기 | `data.series.segments`, `plotLines[].value`, `plotLines[].segments` | `default: "null"` | `LINE_OPTION`(constant.js:50-70)·`PLOT_LINE_OPTION`(constant.js:207-211)에 해당 키 없음 | 기본값 미정의(`undefined`) | low | 동작 차이 없음. 표기 통일 차원이면 유지 가능 |
| 20 | 표기 | `options.axesX[].plotLines[].label`, `plotBands[].label` | `default: "null"` | `src/components/chart/scale/scale.js:800` (`defaultsDeep({}, labelOpt, PLOT_LINE_LABEL_OPTION)`) | 병합 기본은 `PLOT_LINE_LABEL_OPTION` 객체(단 `show: false`라 미표시 동작은 동일) | low | 유지 가능. plotBands label도 plotLines와 동일 상수를 공유함(✅ 하위 기본값 전부 일치 확인) |
| 21 | 표기 | `options.type` | `default: "''"` | `src/components/chart/uses.js:16-289` (`DEFAULT_OPTIONS`에 `type` 키 없음) | `undefined` (시리즈 생성 시 `series[key].type \|\| defaultType`) | low | 동작 차이 없음. `values`에 `'heatMap'`이 빠져 있으나 line 문서 특성상 생략 무방 |
| 22 | 표기 | `options.axesX[].timeFormat` | default 미기재 | `src/components/chart/helpers/helpers.constant.js:118` | `'mm:ss'` | low | `default: "'mm:ss'"` 추가 권장 |
| 23 | 표기 | `events.click-legend` children `e` | "클릭 이벤트 객체" | 범례 클릭 경로 `plugins/plugins.legend.js:575-584`는 `{ e, data }` 전달 ✅ / 외부 legend `toggleSeries()` 경로 `chart.core.js:2098-2107`은 `{ data }`만 전달(`e` 없음) | 경로에 따라 `e`가 없을 수 있음 | low | "external legend에서 toggleSeries로 토글한 경우 e는 포함되지 않음" 주석 추가 고려 |
| 24 | 표기 | `data.series.highlight` | 없음 | `src/components/chart/helpers/helpers.constant.js:52-57` (`LINE_OPTION.highlight`: defaultSize 4, maxSize 6, maxShadowSize 10, maxShadowOpacity 0.4) | hover 하이라이트 점 크기/그림자 튜닝 옵션 | low ⚠️ | md에도 누락. 공개 API로 볼지 내부 상수로 볼지 결정 후 추가 여부 판단(⚠️) |

## deprecated 표기 검증 (체크리스트 9)

| 경로 | 문서 표기 | 코드 상태 | 판정 |
| --- | --- | --- | --- |
| `options.maxTip.tipBackground`, `tipTextColor` | "(3.4부터 제거 예정)" | `DEFAULT_OPTIONS`에서 이미 제거됨. `element/element.tip.js:702,771,792`에서 `opt.tipBackground ?? opt.tipStyle.background` fallback으로만 동작 | ✅ 표기 타당(아직 동작하므로 문서 유지 OK). 문서 default `'#000000'`/`'#FFFFFF'`는 tipStyle fallback 값과 일치 |
| `options.selectItem.tipBackground`, `tipTextColor` | "(3.4부터 제거 예정)" | 위와 동일 (`element.tip.js` fallback) | ✅ 표기 타당 |
| `options.eventBehavior(.legendClick)` | "(3.4부터 제거 예정)" | `uses.js:272-274`에 존재, `chart.core.js:2089`·`plugins.legend.js:564,790`에서 `'emitOnly'` 분기 동작 | ✅ 표기 타당. default `'update'`, values `'update'`/`'emitOnly'` 모두 코드와 일치 |

## 이벤트·v-model 대조 (체크리스트 6·7)

`Chart.vue:77-92` emits 전수: `click`, `dbl-click`, `drag-select`, `mouse-move`,
`update:selectedItem`, `update:selectedLabel`, `update:selectedSeries`, `update:zoomStartIdx`,
`update:zoomEndIdx`, `update:realTimeScatterReset`, `click-legend`, `update:legendData`,
`axes-scale-change`, `axes-data-max-change`

| 이벤트/emit | JSON 문서화 | 판정 |
| --- | --- | --- |
| click / dbl-click / drag-select / mouse-move / click-legend / axes-scale-change / axes-data-max-change | events 섹션 7종 모두 존재 | ✅ payload 설명도 코드와 일치 (`plugins.interaction.js:171-176, 326-327, 520-526`, `chart.core.js:374-375, 461, 2098-2107`; axes-data-max-change의 "바인딩 시에만 발생"은 `uses.js:490-496` 확인) |
| update:selectedItem / selectedLabel / selectedSeries / legendData | props의 `v-model:*` 4종으로 문서화 | ✅ (`uses.js:405-483`) |
| update:zoomStartIdx / update:zoomEndIdx (+ props zoomStartIdx/zoomEndIdx) | 미문서화 | ✅ 의도적 제외(EvChart(Zoom) 문서로 분리 예정 — 지시서 명시) |
| update:realTimeScatterReset (+ props realTimeScatterReset) | 미문서화 | ✅ scatter 전용 — line 문서 제외 타당 |
| mouse-leave (내부 listener) | 미문서화 | ✅ 소비자 emit 아님(`uses.js:472-476`, 그룹 hover 동기화 내부용) |

## 일치 확인(✅) 요약 — 주요 대조 결과

- **Props**: `data`(required 표기 — 코드상 default `{}`지만 실사용 필수, 표기 무방), `options`, `resizeTimeout`(default 0, `Chart.vue:56-59`) ✅
- **data 하위**: series `{}` / data `{}` / groups `[]` / labels `[]` (`uses.js:291-296` DEFAULT_DATA) ✅
- **series 기본값**(`LINE_OPTION` + `element.line.js`): show true, name `series-${index}`, lineWidth 2, fill false, fillOpacity 0.4, point true, pointHighlight true, pointSize 3, showLegend true, passingValue null, interpolation 'none'(values linear/none/zero — `model.store.js:72`, `element.line.js:56-57,478` 모두 확인) ✅
- **options 최상위**: width/height '100%', unSelectedOpacity 0.3, padding {20,2,2,4}, displayOverflow false, plot.aboveSeries true, shallowDataWatch/shallowOptionsWatch false, syncHover(코드 기본값 없음, `Chart.vue:386` `!== false` 판정 → 실효 기본 true) ✅
- **title**: show false, height 40, text '', style {15, '#000', 'Roboto'} ✅
- **legend**(show 제외): position 'right', color '#353740', inactive '#aaa', width 140, height 24, allowResize/virtualScroll/external false, clickMode 'active', table 하위 전부, stopClickEvt(DEFAULT_OPTIONS엔 없으나 `plugins.legend.js:489,728` falsy 판정 → 실효 false), padding(DEFAULT_OPTIONS엔 없으나 `plugins.legend.js:1255` 구조분해 기본 0 → 실효 {0,0,0,0}) ✅
- **tooltip**(fontColor 제외): use true, backgroundColor '#4C4C4C', borderColor '#666666', useShadow false, shadowOpacity 0.25, throttledMove true, debouncedHide false, sortByValue true, useScrollbar false, textOverflow 'wrap', fontFamily 'Roboto', fontSize {16,14}, colorShape 'rect', rowPadding {0,3,20,16}, showHeader true, virtualScroll {auto,50,28,5}, showAllValueInRange(실효 false — `plugins.interaction.js:38`), htmlScrollTarget/maxHeight/maxWidth/formatter/returnValue 사용처 확인(`plugins.tooltip.js:34,208,249,817,844`, `plugins.interaction.js:72-88`) ✅
- **indicator**: use true, color '#EE7F44', segments null ✅
- **maxTip**(use 제외): fixedPosTop/showIndicator false, indicatorColor '#000000', tipStyle {20,'#000000','#FFFFFF',14,'Roboto',400} ✅
- **selectItem/selectLabel/selectSeries/dragSelection**: 문서화된 항목의 기본값 전부 코드와 일치(누락분은 #9-11) ✅
- **axes 공통**(문서화분): showAxis true, startToZero false, autoScaleRatio null, showGrid true, axisLineWidth 1, axisLineColor/gridLineColor '#C9CFDC', interval null, showAxisTick true, fixedSteps false, scaleChange false, labelStyle(show true, fontSize 12, color '#25262E', fontFamily 'Roboto', fitWidth false, fitDir 'right', padding 0, maxWidth/fixWidth undefined), firstLabelFontStyle/lastLabelFontStyle null, title(use false, text null, fontSize 12, fontWeight 400, fontFamily 'Roboto', fontStyle 'normal', textAlign 'right') ✅ — 단 title.color는 #5
- **plotLines/plotBands label 하위 전체**: `PLOT_LINE_LABEL_OPTION`·`PLOT_LABEL_HOVER_TIP_OPTION`(constant.js:162-205)과 1:1 일치 — show false, fontColor '#FF0000', fillColor '#FFFFFF', lineColor '#FF0000', lineWidth 0, position 'outside', textAlign 'center', verticalAlign 'middle', borderRadius 0, gap/padding null, pointer {false, null}, responsive {null, null}, showTextOnHover 11개 필드 전부, textOverflow 'none', maxWidth null ✅. plotBands label이 plotLines와 동일 상수 공유(`scale.js:800`)도 확인 ✅
- **interval enum**(axesX time): `TIME_INTERVALS`(constant.js:247-292) keys millisecond~year — JSON 예시와 일치 ✅
- **tryIt 보유 노드**: 수정 제안 없음(전부 지시서상 수정 금지 항목이며 이번 불일치와 무관)

## 비고

- DEFAULT_OPTIONS의 `itemHighlight`/`seriesHighlight`/`useSelect`/`border`/`combo`는 `options.*` 접근 코드가 발견되지 않아(전 소스 grep 0건) 사문화된 키로 보임 → JSON 미기재는 문제 없음. 별도 코드 정리 후보.
- `coordinateDedupe`는 scatter 전용(`chart.core.js:977-984`), `legend.type`은 heatMap gradient 전용 분기(`chart.core.js:50`)로 line 문서에서 생략 타당.
- md의 `axes-scale-change` 설명 중 "axes-scale-range 이벤트" 오타는 JSON에서 이미 수정되어 있음(코드 emit명 `axes-scale-change`와 일치).
