# EvChart(Bar) API 문서(barChart.json) 검증 보고서

- 검증 대상: `docs/views/apiDocs/data/barChart.json`
- 비교 기준: `src/components/chart/**` (ground truth), 보조: `docs/views/barChart/api/barChart.md`
- 검증 일자: 2026-07-15
- 검증 방법: `uses.js` DEFAULT_OPTIONS 전체 1:1 대조, `Chart.vue` props/emits/slots 전수 대조,
  `helpers/helpers.constant.js`(BAR_OPTION·AXIS_OPTION·PLOT_* 상수·COLOR), `element/element.bar.js`,
  `model/model.series.js`, `model/model.store.js`, `plugins/plugins.legend.js`, `plugins/plugins.interaction.js`,
  `plugins/plugins.scrollbar.js`, `chart.core.js`, `chart.selection.js`, `scale/scale.js`, `scale/scale.step.js`,
  `helpers/helpers.util.js`(labelSignFormat) 근거 확인. lineChart.audit(지시서)·lineChart.audit-report.md에서
  코드로 확정된 공유 상수 값은 재확인 후 그대로 적용
- **조치: 아래 불일치·누락 전부(high/mid/low) `barChart.json`·`barChart.md` 두 파일에 반영 완료**

## 검증 결과 요약

- 검사 항목 수: 약 433개 노드(JSON 트리 전체) + 이벤트 6종 + v-model 3종
- **불일치(high): 9건** — 기본값 오류 7건 + 옵션 배치 오류(유령 항목) 2건
- **누락/타입(mid): 9건**
- **표기/뉘앙스(low): 7건**
- 이벤트 완전성: ✅ (`drag-select`·`update:selectedSeries`는 bar 미지원이라 제외 타당 — 하단 "이벤트·v-model 대조" 참고)
- 의도적 제외(zoom/brush)는 누락으로 집계하지 않음
- 반영 후 `npm run docs:validate` 통과 ✅

## 상세 — 불일치·누락 목록 (전부 반영 완료)

| # | 구분 | 경로(JSON path) | 문서 내용 | 코드 근거(파일:라인) | 실제 값 | 심각도 | 제안(=반영 내용) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 기본값 불일치 | `options.legend.show` | `default: "false"` | `src/components/chart/uses.js:35` | `true` | **high** | JSON·md 모두 `true`로 수정 (lineChart audit 확정값 재확인, bar 전용 오버라이드 없음) |
| 2 | 기본값 불일치 | `options.tooltip.fontColor` | `default: "'#000000'"` | `src/components/chart/uses.js:103` | `'#FFFFFF'` | **high** | `'#FFFFFF'`로 수정 (md의 오류를 JSON이 승계했던 것) |
| 3 | 기본값 불일치 | `options.maxTip.use` | `default: "true"` | `src/components/chart/uses.js:142-143` | `false` | **high** | `false`로 수정 |
| 4 | 기본값 불일치 | `options.axesX[].plotBands.color`, `options.axesY[].plotBands.color` | `default: "'#FF0000'"` | `src/components/chart/helpers/helpers.constant.js:213-216` (`PLOT_BAND_OPTION.color`) | `'#FAE59D'` | **high** | `'#FAE59D'`로 수정 (plotLines의 `'#FF0000'`과 혼동) |
| 5 | 기본값 불일치 | `options.axesX[].title.color`, `options.axesY[].title.color` | `default: "'#25262E'"` | `src/components/chart/helpers/helpers.constant.js:139-148` (`AXIS_OPTION.title.color`) | `'#808080'` | **high** | `'#808080'`로 수정 (labelStyle.color와 혼동) |
| 6 | 기본값 불일치 | `options.axesX[].scrollbar.showButton`, `options.axesY[].scrollbar.showButton` | `default: "false"` | `src/components/chart/helpers/helpers.constant.js:149-160` (`AXIS_OPTION.scrollbar`) | `true` | **high** | `true`로 수정. `resetPosition`은 코드 존재 확인(`plugins/plugins.scrollbar.js:32,115-116`) — 유지 |
| 7 | 기본값 불일치 | `data.series.showValue.decimalPoint` | `default: "0"` | `src/components/chart/helpers/helpers.constant.js:80-87` (`BAR_OPTION.showValue.decimalPoint: null`), 소비: `element/element.bar.js:683` → `helpers/helpers.util.js:204-` (`labelSignFormat`) | `null` — null이면 자릿수 고정 없음(0과 동작이 다름: 0이면 무조건 `.toFixed(0)`) | **high** | `null`로 수정, 타입 `Number \| null`, 설명 보강 |
| 8 | 유령 항목(배치 오류) | `options.axesX[].horizontal`, `options.axesY[].horizontal` | 축 하위 옵션으로 문서화 (`default: "null"`) | 축 단위 소비 코드 없음 — 전 소스에서 `this.options.horizontal`(차트 최상위)만 읽음 (`scale/scale.js:377,422`, `model/model.store.js:770,1346`, `scale/scale.step.js:245` 등) | 최상위 `options.horizontal`(이미 문서화됨)만 유효. 축에 지정해도 무시됨 | **high** | 축 하위 `horizontal` 노드 제거 (JSON·md 모두) |
| 9 | 유령 항목(배치 오류) | `options.axesX[].overlapping`, `options.axesY[].overlapping` | 축 하위 옵션으로 문서화 | `src/components/chart/uses.js:90-92` (`DEFAULT_OPTIONS.overlapping`), 소비: `model/model.series.js:22,67,237` (`this.options.overlapping.use` — 차트 최상위) | 최상위 `options.overlapping: { use: false }`가 유효. 축에 지정해도 무시됨 | **high** | 축 하위에서 제거하고 **최상위 `options.overlapping` 노드로 이동** (JSON·md 모두) |
| 10 | 옵션 누락 | `data.series.show`, `data.series.showLegend`, `data.series.xAxisIndex`, `data.series.yAxisIndex` | 없음 | `src/components/chart/helpers/helpers.constant.js:72-79` (`BAR_OPTION`), 소비: `plugins/plugins.legend.js:137,196`, `model/model.store.js:1521-1522` | `show: true`, `showLegend: true`, `xAxisIndex: 0`, `yAxisIndex: 0` | mid | 4개 노드 추가 (lineChart.json 문구와 통일) |
| 11 | 옵션 누락 | `options.selectItem.*` | `useSeriesOpacity`/`useDeselectItem`/`showBorder`/`borderStyle` 없음 | `src/components/chart/uses.js:174-182`, 소비: `element/element.bar.js:420` (`selectItemOption?.useSeriesOpacity`) | `useSeriesOpacity: false`, `useDeselectItem: false`, `showBorder: false`, `borderStyle: { color: '#FFFFFF', lineWidth: 1, opacity: 1, radius: 0 }` | mid | 4개 노드 추가 |
| 12 | 옵션 누락 | `options.selectLabel.*` | `showTextTip`/`tipText`/`showIndicator`/`indicatorColor`/`tipStyle` 없음 | `src/components/chart/uses.js:184-207` (DEFAULT_OPTIONS.selectLabel) | `showTextTip: false`, `tipText: 'value'`, `showIndicator: false`, `indicatorColor: '#000000'`, `tipStyle: { height: 20, background: '#000000', textColor: '#FFFFFF', fontSize: 14, fontFamily: 'Roboto', fontWeight: 400 }` | mid | 5개 노드 추가. 단 `useBothAxis`는 heatMap 전용(`chart.core.js:2261`, `plugins/plugins.interaction.js:441,464` — `case 'heatMap'` 내부에서만 소비)이라 bar 문서에서 제외 |
| 13 | 옵션 누락 | `options.seriesReverse`, `options.workerRender`, `options.shallowDataWatch`, `options.shallowOptionsWatch` | 없음 | `src/components/chart/uses.js:270,277,283,288` | 모두 `false` — bar에 유효(그리기 순서 반전·워커 렌더·watch 최적화는 차트 타입 무관) | mid | 4개 노드 추가 (lineChart.json 문구와 통일) |
| 14 | 옵션 누락 | `options.axesX[]`, `options.axesY[]` 공통 `min`/`max`/`showLastLabel`/`showIndicator` | 없음 | `src/components/chart/helpers/helpers.constant.js:106-140` (`AXIS_OPTION`) | `min: null`, `max: null`, `showLastLabel: false`, `showIndicator: false` | mid | 4개 노드 추가 (양 축) |
| 15 | 옵션 누락 | `options.axesX[].labelStyle`, `options.axesY[].labelStyle` | `fontWeight`/`alignToGridLine` 없음 | `src/components/chart/helpers/helpers.constant.js:124-135` (`AXIS_OPTION.labelStyle`) | `fontWeight: 400`, `alignToGridLine: false` | mid | 2개 노드 추가 (양 축) |
| 16 | 옵션 누락 | `options.axesX[].position`, `options.axesY[].position` | 없음 | `src/components/chart/scale/scale.js:25-27` (미지정 시 x→`'bottom'`, y→`'left'`), 소비: `scale/scale.js:284-301,413,462` | 축 표시 위치(X: `'bottom'`/`'top'`, Y: `'left'`/`'right'`) — 다중 축 배치용 공개 옵션 | mid | 노드 추가. ⚠️ lineChart.json에도 동일하게 누락되어 있음(본 작업 범위 밖이라 미수정) |
| 17 | 타입 불일치 | `options.axesX[].interval`, `options.axesY[].interval` | `type: "String"`, time 단위 문자열 예시만 기재 | `src/components/chart/scale/scale.linear.js:46-47`, `scale/scale.step.js:125-126` (`if (this.interval) return this.interval;` — 숫자 간격) | bar의 기본 축 구성(step/linear)에서는 **Number**(값 간격), time 타입에서만 String 단위 | mid | 양 축 `type: "String \| Number"`로 수정, 설명에 타입별 사용법 명시 |
| 18 | 유령 값 + 표기 | `data.series.type` | `default: "'bar'"`, values에 `'pie'` 포함 | `src/components/chart/model/model.series.js:27,77` (`series[key].type \|\| defaultType`) | 리터럴 기본값 없음(미지정 시 `options.type` 폴백). 콤보 조합은 bar/line/scatter | low | default 제거, values `'bar'`/`'line'`/`'scatter'`, 설명을 "콤보 차트용 오버라이드"로 교체 (lineChart.json과 통일) |
| 19 | 표기 | `data.series.color` 설명 | "사전에 정의된 **16개** 색상" | `src/components/chart/helpers/helpers.constant.js:16-42` (`COLOR` 25개) | 25개 색상 | low | "25개"로 수정 (md 동일) |
| 20 | 표기 | `options.axesX[].timeFormat`, `options.axesY[].timeFormat` | default 미기재 | `src/components/chart/helpers/helpers.constant.js:118` | `'mm:ss'` | low | `default: "'mm:ss'"` 추가 (md time type 절에도 병기) |
| 21 | 표기 | `options.axesX[].scrollbar.thumbStyle`, `options.axesY[].scrollbar.thumbStyle` | default·하위 노드 미기재 | `src/components/chart/helpers/helpers.constant.js:157-160` | `{ background: '#929292', radius: 0 }` | low | default 표기 + `background`/`radius` children 추가 |
| 22 | 표기(오타) | `options.axesX[].scaleChange`, `options.axesY[].scaleChange` 설명 | "**axes-scale-range** 이벤트가 발생합니다" | `Chart.vue:88`, `uses.js` emit 전수 — emit명은 `axes-scale-change` | `axes-scale-change` | low | 이벤트명 교정 (md의 동일 오타·events 절 "scaleRange" 옵션명 오타도 `scaleChange`로 교정) |
| 23 | 표기 | `options.maxTip.tipBackground`, `options.maxTip.tipTextColor` | deprecated 표기 없음 | `uses.js:142-155` DEFAULT_OPTIONS.maxTip에서 이미 제거, `element/element.tip.js`의 fallback으로만 동작 (lineChart audit 확정) | selectItem 쪽과 동일한 "(3.4부터 제거 예정)" 대상 | low | "(3.4부터 제거 예정)" 표기 추가 (JSON·md) |
| 24 | 표기 | `data.series.showValue.align` | `default: "'end'"` | `helpers.constant.js:80-87` (`BAR_OPTION.showValue`에 `align` 키 없음), `element/element.bar.js:783-784` (switch `default:` → `case 'end'` fall-through) | 리터럴 기본값 미정의(`undefined`), 렌더 동작은 `'end'`와 동일 | low | 동작 기준 표기이므로 유지 (수정 불필요 판정) |

## deprecated 표기 검증 (체크리스트 9)

| 경로 | 문서 표기 | 코드 상태 | 판정 |
| --- | --- | --- | --- |
| `options.selectItem.tipBackground`, `tipTextColor` | "(3.4부터 제거 예정)" | `element/element.tip.js`의 `opt.tipBackground ?? opt.tipStyle.background` fallback으로만 동작 (lineChart audit에서 확정) | ✅ 표기 타당 |
| `options.maxTip.tipBackground`, `tipTextColor` | 표기 없음 → 추가함 | 위와 동일 fallback | #23으로 반영 |
| `options.eventBehavior(.legendClick)` | "(3.4부터 제거 예정)" | `uses.js:272-274` 존재, `plugins.legend.js`·`chart.core.js`의 `'emitOnly'` 분기 동작 | ✅ 표기 타당 |
| `options.axesX[].type`의 `'log'` | "Deprecated 상태" | md와 동일 | ✅ 표기 타당 |

## 이벤트·v-model 대조 (체크리스트 6·7)

`Chart.vue:77-92` emits 전수: `click`, `dbl-click`, `drag-select`, `mouse-move`,
`update:selectedItem`, `update:selectedLabel`, `update:selectedSeries`, `update:zoomStartIdx`,
`update:zoomEndIdx`, `update:realTimeScatterReset`, `click-legend`, `update:legendData`,
`axes-scale-change`, `axes-data-max-change`

| 이벤트/emit | JSON 문서화 | 판정 |
| --- | --- | --- |
| click / dbl-click / mouse-move / click-legend / axes-scale-change / axes-data-max-change | events 섹션 6종 모두 존재 | ✅ payload 설명 코드와 일치 (`plugins.interaction.js:416-424` bar 분기, `chart.core.js:2098-2107`, `uses.js:490-496`) |
| drag-select (+ options.dragSelection) | events 섹션 + options.dragSelection 으로 문서화 | ✅ #2337 로 수직 막대(`horizontal: false`) 드래그 진입 허용 후 문서 추가. bar 시리즈는 `findItems` 미구현이라 `data` 에 담기지 않고(혼합된 line 시리즈만 수집), 범주형 축에서 `range` 에 최대 약 1 막대 폭 오차가 있어 설명에 명시 (`plugins/plugins.interaction.js` onMouseDown) |
| update:selectedItem / selectedLabel / legendData | props의 `v-model:*` 3종으로 문서화 | ✅ (`uses.js:405-483`) |
| update:selectedSeries (+ options.selectSeries) | 미문서화 | ✅ 제외 타당 — "selectSeries 강조를 실제로 소비하는 element는 line 뿐"(`chart.selection.js:12`), `element/element.bar.js` draw는 selectSeries 미소비, interaction의 `case 'bar'`도 selectItem/selectLabel만 처리(`plugins.interaction.js:416-424`) |
| update:zoomStartIdx / update:zoomEndIdx | 미문서화 | ✅ 의도적 제외 (EvChart(Zoom) 문서로 분리 예정 — 지시서 명시) |
| update:realTimeScatterReset | 미문서화 | ✅ scatter 전용 — bar 문서 제외 타당 |

## 일치 확인(✅) 요약 — 주요 대조 결과

- **Props**: `data`(required), `options`, `resizeTimeout`(default 0) ✅. 슬롯 없음(JSON에 slots 섹션 없음 — `Chart.vue` 템플릿에 `<slot>` 없음과 일치) ✅
- **data 하위**: series `{}` / data `{}` / groups `[]` / labels `[]` (DEFAULT_DATA) ✅
- **series 기본값**(`BAR_OPTION`): name `series-${index}`(element.bar.js:14-16), color COLOR[index%25](element.bar.js:18-20), showValue.use false / textColor '#000000' / fontSize 12 / formatter null ✅ — decimalPoint는 #7, align은 #24
- **options 최상위**: width/height '100%', thickness 1, cPadRatio 0, borderRadius 0, horizontal false, unSelectedOpacity 0.3, padding {20,2,2,4}, displayOverflow false, plot.aboveSeries true, syncHover(실효 true), eventBehavior.legendClick 'update' ✅
- **title / legend(show 제외) / tooltip(fontColor 제외) / indicator / maxTip(use 제외) / selectItem·selectLabel(누락분 제외)**: 문서화된 항목의 기본값 전부 lineChart audit 확정값 및 `uses.js` DEFAULT_OPTIONS와 일치 ✅
- **axes 공통**(문서화분): showAxis true, startToZero false, autoScaleRatio null, showGrid true, axisLineWidth 1, axisLineColor/gridLineColor '#C9CFDC', range null, showAxisTick true, fixedSteps false, scaleChange false, decimalPoint 'auto', labelStyle 기존 항목, firstLabelFontStyle/lastLabelFontStyle null, title(color 제외), timeMode false, categoryMode(양 축 — `chart.core.js:1165` 축 단위 소비), axesX.flow(`scale/scale.js:337,356,453` — axesX[0]에서만 읽으므로 X축 전용 배치 타당) ✅
- **plotLines/plotBands label 하위 전체**: `PLOT_LINE_LABEL_OPTION`·`PLOT_LABEL_HOVER_TIP_OPTION`과 1:1 일치(lineChart audit과 동일 상수 공유) ✅
- **scrollbar**: use false, width/height 14, background '#F2F2F2', resetPosition(코드 존재, lineChart.json에는 누락 — bar 쪽이 정확) ✅ — showButton은 #6
- **interval enum**(time): `TIME_INTERVALS` keys millisecond~year 일치 ✅
- **tryIt 노드**: barChart.json에는 tryIt 보유 노드 없음(수정 금지 대상 없음)

## 비고

- `BAR_OPTION.highlight`(`{ pointSize: 5 }`)와 `BAR_OPTION.category`는 소비 코드가 발견되지 않아(전 소스 grep 0건 — highlight 소비는 line/scatter/heatMap element뿐) 사문화된 키로 판단 → 문서 미기재 유지. 코드 정리 후보.
- DEFAULT_OPTIONS의 `itemHighlight`/`seriesHighlight`/`useSelect`/`border`/`combo`/`reverse`(pie 전용, `model.store.js:1666`)/`doughnutHoleSize`/`pieStroke`(pie 전용)/`heatMapColor`(heatMap 전용)/`coordinateDedupe`(scatter 전용)는 bar 문서 미기재 타당.
- `options.axesX[].position`(#16)은 lineChart.json·lineChart.md에도 동일하게 누락 — 본 작업의 수정 허용 파일이 barChart 3종뿐이라 라인 문서는 미수정. 후속 반영 권장.
- md의 `##### overlapping` 상세 절은 그대로 두고, 참조 위치만 axes 표 → options 표로 이동함(#9).
