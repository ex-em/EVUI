# EvChart(Scatter) API 문서(scatterChart.json) 검증 보고서

- 검증 대상: `docs/views/apiDocs/data/scatterChart.json`
- 비교 기준: `src/components/chart/**` (ground truth), 보조: `docs/views/scatterChart/api/scatterChart.md`
- 검증 일자: 2026-07-15
- 검증 방법: `uses.js` DEFAULT_OPTIONS 전체 1:1 대조, `Chart.vue` props/emits 전수 대조,
  `helpers/helpers.constant.js`(LINE_OPTION·AXIS_OPTION·PLOT_*·COLOR), `element/element.scatter.js`,
  `element/element.tip.js`, `model/model.series.js`, `model/model.store.js`(realTimeScatter dataSet·
  getAggregations), `plugins/plugins.interaction.js`(onClick/onDblClick scatter 분기·isNotUseIndicator),
  `plugins/plugins.legend.js`, `plugins/plugins.scrollbar.js`, `chart.core.js`(drawSeriesLayer scatter
  case·coordinateDedupe·worker 게이트), `chart.selection.js`, `render/render.unpack.js`,
  `scale/scale.js`·`scale.step.js` 근거 확인
- 특기: scatter 시리즈는 전용 상수 없이 **LINE_OPTION을 merge**해 생성됨(`element.scatter.js:8`).
  따라서 LINE_OPTION 키 중 scatter 렌더 경로가 실제 소비하는 것만 문서 대상으로 판정함.

## 검증 결과 요약

- 검사 항목 수: 약 240개 노드(JSON 트리 전체) + 이벤트 7종 + v-model 3종
- **불일치(high): 7건** — 기본값 오류 6건 + 유령 항목 1건
- **누락/타입(mid): 14건**
- **표기/뉘앙스(low): 5건**
- 의도적 제외(zoom/brush)는 누락으로 집계하지 않음. realTimeScatter 계열은 scatter 문서의 정식 대상으로 검증함(✅ 문서화되어 있음)
- **모든 불일치·누락은 scatterChart.json / scatterChart.md 두 파일에 반영 완료**, `npm run docs:validate` 통과

## 상세 — 불일치·누락 목록 (전부 반영됨)

| # | 구분 | 경로(JSON path) | 문서 내용 | 코드 근거(파일:라인) | 실제 값 | 심각도 | 조치 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 기본값 불일치 | `options.legend.show` | `default: "false"` | `src/components/chart/uses.js:35` | `true` | **high** | JSON·md 모두 `true`로 수정 |
| 2 | 기본값 불일치 | `options.tooltip.use` | `default: "false"` | `src/components/chart/uses.js:100` | `true` | **high** | `true`로 수정 (md도 동일 오류) |
| 3 | 기본값 불일치 | `options.tooltip.fontColor` | `default: "'#000000'"` | `src/components/chart/uses.js:103` | `'#FFFFFF'` | **high** | `'#FFFFFF'`로 수정 (lineChart와 동일한 md 승계 오류) |
| 4 | 기본값 불일치 | `options.axesX[].plotBands.color`, `options.axesY[].plotBands.color` | `default: "'#FF0000'"` | `src/components/chart/helpers/helpers.constant.js:213-216` (`PLOT_BAND_OPTION.color`) | `'#FAE59D'` | **high** | `'#FAE59D'`로 수정 (plotLines 색과 혼동, md도 동일 오류) |
| 5 | 기본값 불일치 | `options.axesX[].title.color`, `options.axesY[].title.color` | `default: "'#25262E'"` | `src/components/chart/helpers/helpers.constant.js:139-148` (`AXIS_OPTION.title.color`) | `'#808080'` | **high** | `'#808080'`로 수정 (labelStyle.color와 혼동, md도 동일 오류) |
| 6 | 기본값 불일치 | `data.series.type` | `default: "'bar'"` | `src/components/chart/model/model.series.js:27,77` (`series[key].type \|\| defaultType`) | 미지정 시 `options.type` 값 | **high** | default 제거, "미지정 시 options.type을 따름"으로 수정. values도 `'line'/'bar'/'scatter'`로 정리 |
| 7 | 유령 항목 | `options.realTimeScatter.tipBackground`, `tipTextColor` | realTimeScatter 하위 옵션으로 기재 | 코드의 realTimeScatter 사용처는 `use`(`chart.core.js:157` 등)·`range`(`model/model.store.js:191`) 뿐. tipBackground/tipTextColor는 `element/element.tip.js:702,792`에서 **maxTip/selectItem** 옵션의 deprecated fallback | realTimeScatter 옵션 아님 | **high** | realTimeScatter에서 제거하고 maxTip(신설)·selectItem 하위의 "(3.4부터 제거 예정)" 항목으로 이동. md의 realTimeScatter `etc` 표도 maxTip 섹션으로 이동 |
| 8 | 옵션 누락 | `options.maxTip` | 없음 | `element/element.tip.js:15-140` (drawTips, 타입 무관 실행), `element/element.tip.js:189-190` "bar는 인덱스로, **line/scatter는 도메인 값**으로 위치를 잡으므로" — scatter 지원 명시 | `{ use: false, fixedPosTop: false, showIndicator: false, indicatorColor: '#000000', tipStyle: {...} }` (`uses.js:142-155`) | mid | maxTip 노드 전체 추가(deprecated tipBackground/tipTextColor 포함). md에 maxTip 섹션 신설 |
| 9 | 옵션 누락 | `data.series.show`, `showLegend`, `xAxisIndex`, `yAxisIndex` | 없음 | `helpers.constant.js:50-70` (LINE_OPTION 병합), 소비: `element.scatter.js:64,102`(show·draw), `calcItem:184-185`(x/yAxisIndex), `plugins.legend.js`(showLegend) | `show: true`, `showLegend: true`, `xAxisIndex: 0`, `yAxisIndex: 0` | mid | 4개 노드 추가 (md에도 추가) |
| 10 | 옵션 누락 | `data.series.passingValue` | 없음 | `model/model.store.js:31,41-47` — scatter dataSet 생성 시 `getSeriesMinMax(series.data, passingValue)`로 min/max 계산에서 제외 | `null` | mid | 노드 추가. scatter에서는 "축 min/max 계산 제외" 동작으로 설명 |
| 11 | 옵션 누락 | `data.series.overflowColor` | 없음 | `element/element.scatter.js:17-21`(팔레트 기본 할당), `246,319,407`(y > graphMax 시 점 색상) | 미지정 시 `COLOR[index]` | mid | 노드 추가. displayOverflow와 연동 설명 (md에도 추가) |
| 12 | 옵션 누락 | `data.series.highlight` | 없음 | `element/element.scatter.js:526-551` (itemHighlight가 defaultSize/maxSize/maxShadowSize/maxShadowOpacity 소비) | `{ defaultSize: 4, maxSize: 6, maxShadowSize: 10, maxShadowOpacity: 0.4 }` | mid | 하위 4개 포함 노드 추가 |
| 13 | 옵션 누락 | `options.unSelectedOpacity` | 없음 | `uses.js:77`, 소비: `element.scatter.js:164-170` (getOpacity의 downplay opacity) | `0.3` | mid | 노드 추가 (md에도 추가) |
| 14 | 옵션 누락 | `options.selectItem.useClick`, `useDeselectItem` | 없음 | `uses.js:158,175`; 소비: `plugins.interaction.js:352`(useClick 게이트), `370-371,2142-2145`(isDeselectItem) — scatter onClick 분기(`:489-492`)에서 동작 | `useClick: true`, `useDeselectItem: false` | mid | 두 노드 추가. deprecated `tipBackground`/`tipTextColor`도 selectItem에 추가 (md 동일) |
| 15 | 옵션 누락 | `options.tooltip.rowPadding`, `showHeader` | 없음 | `uses.js:117-123` | `rowPadding: { top: 0, bottom: 3, right: 20, left: 16 }`, `showHeader: true` | mid | 두 노드 추가 (md에도 추가) |
| 16 | 옵션 누락 | `options.axesX[]`, `options.axesY[]` 공통 | `min`/`max`/`range`/`decimalPoint`/`showIndicator` 없음 | `helpers.constant.js:106-160` (AXIS_OPTION), 병합 `scale/scale.js:15`; decimalPoint 소비 `scale.linear.js:15-37,316-331` — scatter의 time/linear 축에 유효 | `min: null`, `max: null`, `range: null`, `decimalPoint: 'auto'`, `showIndicator: false` | mid | X·Y 축 모두에 5개 노드 추가 (md 공통 표에도 추가) |
| 17 | 옵션 누락 | `options.axesX[].labelStyle`, `options.axesY[].labelStyle` | `fontWeight`/`fixWidth` 없음 | `helpers.constant.js:129,134`; 소비: `helpers.util.js:189-194`(getLabelStyle), `scale/scale.js:1419-1422`(fixWidth) | `fontWeight: 400`, `fixWidth: undefined` | mid | 두 노드 추가 (md labelStyle 표에도 추가) |
| 18 | 옵션 누락 | `options.syncHover` | 없음 | `Chart.vue:386` (`!== false` 판정 → 실효 기본 true) — EvChartGroup hover 동기화, scatter 유효 | 실효 `true` | mid | 노드 추가 (md에도 추가) |
| 19 | 옵션 누락 | `options.shallowDataWatch`, `options.shallowOptionsWatch` | 없음 | `uses.js:283,288` — realTimeScatter 사용 시 권장되는 shallowRef 선언과 직접 관련 | 둘 다 `false` | mid | 두 노드 추가 (md에도 추가) |
| 20 | 이벤트 누락 | `events.click`, `events.dbl-click` | 없음 | `uses.js:443,458` (emit); `plugins.interaction.js:489-492,320-323` — scatter는 selectItem 기반 setSelectedItemInfo 분기로 동작 | click/dbl-click 발생함 | mid | events 섹션에 2종 추가 (md Event 표에도 추가) |
| 21 | 타입 불일치 | `options.axesX[].interval`, `options.axesY[].interval` | `type: "String"` | `scale/scale.linear.js:46-47,88` — linear 축은 숫자 간격, time 축은 단위 문자열(`TIME_INTERVALS`) | scatter 축은 time/linear 모두 가능 → `String \| Number` | mid | 두 축 모두 `String \| Number`로 수정, 설명에 타입별 사용법 명시 (md 동일) |
| 22 | 표기 | `data.series.color`/`pointFill` 설명 | "사전에 정의된 **16개** 색상" | `helpers.constant.js:16-42` (COLOR) | 25개 색상 | low | "25개"로 수정 (md 동일) |
| 23 | 표기 | `data.series.pointStyle` | `default: "'circle'"` | `helpers.constant.js:63` (`pointStyle: ''`), 렌더 분기 `helpers.canvas.js` switch default = circle | 리터럴 기본값 `''`(circle로 렌더링) | low | `''`로 표기하고 "미지정 시 circle로 렌더링" 설명 추가. values에 'circle' 누락(md)도 보완 |
| 24 | 표기 | `options.axesX[].timeFormat`, `options.axesY[].timeFormat` | default 미기재 | `helpers.constant.js:118` | `'mm:ss'` | low | `default: "'mm:ss'"` 추가 (md time type 절에도 명시) |
| 25 | 표기 | `options.coordinateDedupe` 설명 | "좌표 중복 제거 여부" (모호) | `chart.core.js:977-984` (scatter 전용 duple 수집), `element.scatter.js:98-121` | scatter 전용, 동일 좌표 owner 시리즈만 렌더 | low | 설명 보강: scatter 전용·overdraw 방지 명시 (md 동일) |
| 26 | 표기(md 전용) | md `scaleChange` 설명 | "axes-scale-range 이벤트가 발생된다" | emit 명은 `axes-scale-change` (`uses.js:486`) | `axes-scale-change` | low | md 수정 (JSON은 원래 정확했음) |

## scatter 무효 판정 — 추가하지 않은 공유 옵션 (체크리스트 1 관련)

DEFAULT_OPTIONS/AXIS_OPTION/LINE_OPTION에 존재하지만 **scatter 렌더·인터랙션 경로가 소비하지 않아** 문서에서 제외한 항목:

| 항목 | 근거(파일:라인) | 판정 |
| --- | --- | --- |
| `options.indicator` | `plugins.interaction.js:2187-2193` `isNotUseIndicator()`가 scatter를 명시 제외 → drawIndicator 미호출 | ❌ scatter 무효 — 제외 유지 |
| `options.selectLabel`, `options.selectSeries` | `plugins.interaction.js:489-492,320-323` — scatter의 click/dbl-click 분기는 selectItem만 처리. `chart.selection.js:12-13` "selectSeries 강조를 실제로 소비하는 element는 line뿐이고 scatter/heatMap은 미지원" | ❌ scatter 무효 — 제외 유지 (v-model:selectedLabel/selectedSeries도 동일) |
| `options.workerRender` | `render/render.unpack.js:17` "scatter/pie는 미지원(진입 가드가 main 경로로 보낸다)", `chart.core.js:475,565` | ❌ scatter 무효 — 제외 유지 |
| `options.legend.table` | `model/model.store.js:1688-1705` getAggregations가 스칼라 데이터 전제(`Math.min(...dataList)`) — scatter의 `{x, y}` 객체 데이터에서는 NaN | ❌ scatter 무효 — 제외 유지 |
| `axes[].scrollbar` | `plugins/plugins.scrollbar.js:56` (`labels.length` 게이트) — scatter는 labels 미사용이라 동작 불가 | ❌ scatter 무효 — 제외 유지 |
| `axes[].showLastLabel`, `labelStyle.alignToGridLine`, `labelStyle.maxWidth`, `categoryMode` | `scale/scale.step.js:27,60,226,352,390` — step/카테고리(labels) 스케일 전용. scatter 축은 time/linear | ❌ scatter 무효 — 제외 유지 |
| `data.series.lineWidth`/`fill`/`fillOpacity`/`fillColor`/`interpolation`/`segments`/`point`/`pointHighlight` | LINE_OPTION merge로 값은 존재하나 `element.scatter.js` 렌더 경로가 미소비 (line 전용) | ❌ scatter 무효 — 제외 유지 |
| `data.groups`, `data.labels` | scatter dataSet은 `addSeriesDSforScatter`(`model.store.js:703`)·`createRealTimeScatterDataSet`(`:153`)로 x/y 좌표만 사용 | ❌ scatter 무효 — 제외 유지 |
| zoom/brush 계열 (`options.zoom`, `zoomStartIdx`/`zoomEndIdx` 등) | 지시서상 의도적 제외 (EvChart(Zoom)/EvChart(Brush) 문서로 분리 예정) | ➖ 제외 유지 |

## deprecated 표기 검증 (체크리스트 9)

| 경로 | 문서 표기 | 코드 상태 | 판정 |
| --- | --- | --- | --- |
| `options.maxTip.tipBackground`, `tipTextColor` (신규 추가분) | "(3.4부터 제거 예정)" | DEFAULT_OPTIONS에서 제거됨, `element.tip.js:702,792` fallback으로만 동작 | ✅ lineChart 문서와 동일 표기로 추가 |
| `options.selectItem.tipBackground`, `tipTextColor` (신규 추가분) | "(3.4부터 제거 예정)" | 위와 동일 | ✅ |
| `options.eventBehavior(.legendClick)` | "(3.4부터 제거 예정)" | `uses.js:272-274`, `plugins.legend.js` 'emitOnly' 분기 동작 | ✅ 기존 표기 타당 (default 'update', values 일치) |

## 이벤트·v-model 대조 (체크리스트 6·7)

`Chart.vue:77-92` emits 전수: `click`, `dbl-click`, `drag-select`, `mouse-move`,
`update:selectedItem`, `update:selectedLabel`, `update:selectedSeries`, `update:zoomStartIdx`,
`update:zoomEndIdx`, `update:realTimeScatterReset`, `click-legend`, `update:legendData`,
`axes-scale-change`, `axes-data-max-change`

| 이벤트/emit | JSON 문서화 | 판정 |
| --- | --- | --- |
| click / dbl-click | 누락 → **추가 완료** (#20) | ✅ scatter 유효 (`plugins.interaction.js:489,320`) |
| mouse-move / drag-select / click-legend / axes-scale-change / axes-data-max-change | 기존 5종 존재, payload 설명 코드와 일치 (drag-select 모바일 touch 경로 `plugins.interaction.js:495-528` 포함) | ✅ |
| update:selectedItem | props `v-model:selectedItem` | ✅ (`uses.js:405-413`) |
| update:legendData | props `v-model:legend-data` | ✅ (`uses.js:483`) |
| update:realTimeScatterReset | props `v-model:realTimeScatterReset` | ✅ scatter 정식 대상 — 문서화되어 있음 (`Chart.vue:353-362`: true 처리 후 자동 false 방출, 설명 일치) |
| update:selectedLabel / update:selectedSeries | 미문서화 | ✅ scatter 무효(위 표 참고) — 제외 타당 |
| update:zoomStartIdx / update:zoomEndIdx | 미문서화 | ✅ 의도적 제외 (EvChart(Zoom) 분리 예정) |

## 일치 확인(✅) 요약 — 주요 대조 결과

- **Props**: `data`(required), `options`, `resizeTimeout`(default 0, `Chart.vue:56-59`) ✅
- **realTimeScatter**: `use`(DEFAULT_OPTIONS에 키 없음 → 실효 false, `chart.core.js:157` optional chaining), `range` 300(`model.store.js:191` `|| 300`) ✅ — axesX type 'time' 필요·shallowRef 권장 설명도 코드 주석과 일치
- **coordinateDedupe**: default `true`(`uses.js:271`), `!== false` 판정(`element.scatter.js:100,126`) ✅
- **series 기본값**: name `series-${index}`(`element.scatter.js:13-15`), pointSize 3, color/pointFill 팔레트 순차 적용(`:17-21`) ✅
- **options 최상위**: type ''(실효 undefined — lineChart와 동일 표기 유지), width/height '100%', padding {20,2,2,4}, displayOverflow false(scatter 주석 `uses.js:87-89`), plot.aboveSeries true, seriesReverse false(`chart.core.js` scatter case `seriesReverse` 소비 확인) ✅
- **title/legend(수정분 외)/dragSelection/tooltip(수정분 외)/plot/selectItem(수정분 외)**: 전 항목 코드와 일치 ✅ — dragSelection의 size(모바일)·startArea·displayFromStartArea(scatter·PC 전용, `plugins.interaction.js:612-622`) 설명 정확
- **plotLines/plotBands label 하위 전체**: `PLOT_LINE_LABEL_OPTION`·`PLOT_LABEL_HOVER_TIP_OPTION`(constant.js:162-205)과 1:1 일치 ✅
- **axes 공통(수정분 외)**: showAxis true, startToZero false, autoScaleRatio null, showGrid true, axisLineWidth 1, axisLineColor/gridLineColor '#C9CFDC', showAxisTick true, fixedSteps false, scaleChange false, labelStyle(show/fontSize/color/fontFamily/fitWidth/fitDir/padding), firstLabelFontStyle/lastLabelFontStyle null, flow(axesX 전용 — `scale/scale.js:337,356,453`이 axesX[0].flow만 참조, axesY에 없음 타당) ✅
- **tryIt 보유 노드**: 없음(0건) — 수정 제약 해당 없음

## 비고

- scatter 시리즈 옵션의 SSOT는 `LINE_OPTION`(전용 SCATTER_OPTION 상수 없음). `element.scatter.js:8`의
  `merge({}, LINE_OPTION, opt)` + 생성자에서 color/pointFill/fillColor/overflowColor 팔레트 기본 할당.
  fillColor는 할당만 되고 scatter 렌더 경로 미소비라 제외.
- `axes[].showIndicator`는 AXIS_OPTION에 존재하나 소스 전체에서 소비처를 찾지 못함(사문화 후보).
  lineChart.json과의 일관성을 위해 동일 설명으로 문서화함 — 코드 정리 시 양쪽 문서에서 함께 제거 필요.
- md의 `##### tipStyle` 절이 eventBehavior 아래에 위치하는 구조적 어색함은 유지(내용은 selectItem·maxTip
  공용이며 앵커 참조가 걸려 있음). 문서 구조 개편 시 selectItem 하위로 이동 권장.
