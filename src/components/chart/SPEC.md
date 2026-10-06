# Chart (EvChart) — 차트 루트

## Purpose

EXEM EVUI의 Canvas 기반 차트 컴포넌트(`<ev-chart>`)를 제공한다. line/bar/pie/scatter/heatMap(+combo) 타입을 더블 버퍼(buffer→display) 렌더 파이프라인으로 그리고, 대량·실시간 워크로드를 위한 세 가지 성능 경로 — realtime scatter blit fast-path(이전 라스터 시프트 + 신규 strip만 재그림), worker(OffscreenCanvas) series 래스터 오프로드(opt-in), deep-watch opt-out(shallowDataWatch/shallowOptionsWatch) — 를 조건부로 제공한다. 줌(툴바/드래그/휠), 선택(selectItem/selectLabel/selectSeries), 툴팁/인디케이터/plotLine·plotBand, 내·외부 범례, EvChartGroup/EvChartBrush 연동(provide/inject)을 포함한다.

이 문서는 차트 **루트 파일**(Chart.vue, ChartToolbar.vue, chart.core.js, chart.blit.js, chart.selection.js, chart.inspect.js, chartZoom.core.js, uses.js, index.js)과 helpers/ 를 다룬다. plugins/element/scale/model/annotation 의 상세는 각 하위 SPEC( [./plugins/SPEC.md](./plugins/SPEC.md), [./element/SPEC.md](./element/SPEC.md), [./scale/SPEC.md](./scale/SPEC.md), [./model/SPEC.md](./model/SPEC.md), [./annotation/SPEC.md](./annotation/SPEC.md) )에 위임한다.

> **공식 API**: line/bar/pie/scatter/heatMap 은 `/api-docs` 페이지가 렌더링하는 [docs/views/apiDocs/data/](../../../docs/views/apiDocs/data/)`{lineChart,barChart,pieChart,scatterChart,heatMap}.json` 이 SSOT 다([작성 가이드](../../../docs/views/apiDocs/data/README.md), 수정 후 `npm run docs:validate` 필수). 아직 JSON 으로 옮기지 않은 comboChart·zoomChart 는 `docs/views/{comboChart,zoomChart}/api/*.md`.

## Features

- **차트 타입**: `options.type` 으로 line/bar/pie(doughnut·sunburst 포함)/scatter/heatMap 렌더. `seriesInfo.charts` 는 pie/bar/line/scatter/heatMap 5종 인덱스를 유지한다. combo 는 `options.type` 을 두지 않고 시리즈가 각자 `type` 을 선언해 표현한다(시리즈 `combo: true` 는 line 을 막대 슬롯 중앙으로 반 칸 밀어주는 별개 플래그다). `DEFAULT_OPTIONS.combo` 는 읽히지 않는다.
- **렌더 파이프라인**: `drawChart` 가 initScale → prepareScale(축 range/labelOffset/steps 계산 + scale-change payload) → scrollbar 배치 → `axes-scale-change`/`emitDataMaxChange` → 경로 분기(blit/worker/main) → static layer(축·grid) → series layer → 선택 line 덧그리기 → overlay → foreground(plot/tip) → `commitToDisplay`(buffer→display blit) 순서로 오케스트레이션한다.
- **업데이트 스케줄링**: Chart.vue 의 `scheduleUpdate` 가 data/options watcher 의 `evChart.update` 호출을 setTimeout 으로 coalesce 한다. 보류 중 도착한 갱신 플래그(updateSeries/updateData/updateLegend/updateTooltip/updateSelTip.update)는 OR-병합되고, 그룹 인터랙션의 `deferUntil`(inject `groupInteraction`)이 미래면 fire 시점에 재검사해 남은 시간만큼 재예약한다. realTimeScatter 는 보류 중 도착한 data 배치를 최신 것으로 덮지 않고 series 키별로 이어 붙여 flush 에서 한 번에 넘긴다(Business Rules 「realTimeScatter 데이터 경로」).
- **realtime scatter blit fast-path**: `realTimeScatter.use` 차트에서 게이트(evaluateBlitGate) 통과 시 series별 ping-pong 오프스크린 레이어를 정수 CSS px(×q 양자화)만큼 왼쪽 시프트하고 신규 시간대(strip)만 재raster 한다. 게이트 미충족·`BLIT_REFRESH_INTERVAL`(300프레임) 도달 시 full redraw 폴백. 디버그 플래그: `window.__EVUI_BLIT_DEBUG__`(진단 집계 → `__EVUI_BLIT_DIAG__`), `__EVUI_BLIT_FORCE_OFF__`, `__EVUI_BLIT_REFRESH_INTERVAL__`.
- **worker 렌더 오프로드**: `options.workerRender`(기본 false) opt-in 시 series 래스터만 worker 로 전송(`toRenderSnapshot`/`packSeries`), 도착한 ImageBitmap 을 `commitWorkerFrame` 이 epoch 비교 후 합성. 지원 조건: hitInfo 없음 + visible series 가 line/bar(timeMode 제외)/heatMap 뿐. static·overlay·tip·hit-test 기하는 main 이 담당.
- **줌**: `zoom.toolbar.show` 시 EvChartZoom 이 previous/latest/reset/dragZoom 툴바, 드래그 줌(time축), 휠 이동(`useWheelMove`), 줌 애니메이션(`useAnimation`), 줌 이력(`zoomAreaMemory`, `bufferMemoryCnt` 기본 100)을 제공한다. `v-model:zoomStartIdx`/`v-model:zoomEndIdx` 로 외부 제어 가능.
- **선택**: `v-model:selectedItem`/`v-model:selectedLabel`/`v-model:selectedSeries`. selectSeries 활성 시 full redraw 직후 선택 line 을 한 번 더 덧그려 dimmed 시리즈 위 최상위로 통일(chart.selection.js).
- **범례**: 내부 legend(icon/table/gradient) 및 external legend(`legend.external`) — `update:legendData` emit 과 템플릿 ref 메서드 `toggleSeries`/`highlightSeries`/`unhighlightSeries`/`redraw` 로 외부 범례 UI를 구성할 수 있다.
- **부가 표시**: tooltip(html formatter 가상 스크롤 포함), indicator, maxTip, plotLine/plotBand/plotLabel(`plot.aboveSeries` 로 series 위/아래 결정), dragSelection(`drag-select` 이벤트), displayOverflow.
- **어노테이션/뱃지**: `options.annotations` 선언으로 차트 위에 text/badge/callout/circle 을 pixel/axis/series 좌표로 표시. 전용 오버레이 캔버스(옵션 사용 시 지연 생성)에 순수 함수 파이프라인으로 렌더하며, series 추적 항목은 매 프레임 좌표를 재해석한다. 상세는 [./annotation/SPEC.md](./annotation/SPEC.md).
- **축 스케일**: linear/time/time+categoryMode/log/step 5종 스케일 인스턴스를 `createAxes` 가 축 옵션 type 으로 생성. 상세는 [./scale/SPEC.md](./scale/SPEC.md).
- **이벤트**: click(200ms 지연으로 dbl-click 과 구분), dbl-click, drag-select, mouse-move, click-legend, axes-scale-change(옵션 `scaleChange` 축만), axes-data-max-change(바인딩 시에만 집계·emit).
- **차트 그룹 연동**: inject `isChartGroup`/`brushSeries`/`groupSelectedLabel`/`groupHoveredLabel`/`brushIdx`/`evChartPropsInGroup`/`groupInteraction` 으로 EvChartGroup/EvChartBrush 와 선택·hover 동기화(`drawSyncedIndicator`, `syncHover` 옵션), brush 인덱스 시프트 보정을 수행한다. 그룹 내 차트는 toolbar/zoom 모델을 만들지 않는다(그룹이 소유).
- **watch 전략 opt-in**: `shallowDataWatch`/`shallowOptionsWatch`(기본 false) 로 deep watch 를 끈다. mount 시점 1회 평가, 런타임 토글 불가.
- **리사이즈**: `v-resize` 디렉티브 + `resizeTimeout` debounce. resize 프레임은 worker 비동기 합성 대신 main 동기 렌더(`drawChart(undefined, forceMainSeries=true)`)로 blank 깜빡임을 방지한다. `onActivated` 시 재적용.
- **realtime scatter 리셋/부활**: `v-model:realTimeScatterReset` true 시 `resetRealTimeScatterDataSet`(전 series dataGroup 비움 + 기준 시각 하한 해제 — [./model/SPEC.md](./model/SPEC.md))을 부르고, 보류 중 병합분과 `evChart.data.data` 의 미소비 배치를 버리고, 점 레이어(`pointsLayerValid`)를 무효화해 다음 렌더가 레이어를 다시 그리게 한 뒤(남기면 다음 배치가 링을 전진시킬 때 blit 이 리셋 전 점이 든 래스터를 밀어 쓴다), 만료 제거 가드(`prunedRealTimeScatterSeries`)를 비우고 false 로 되돌린다. 만료 제거된 series 가 신규 점과 함께 돌아오면 data watcher 가 updateSeries 를 강제해 인스턴스·범례를 복구한다.
- **콘솔 조회(운영 빌드 진단)**: `.ev-chart` 요소의 비열거 속성 `__evuiChart__`, 또는 전역 `window.__EVUI_CHART__(el)`(조상 `.ev-chart`, 없으면 유일한 하위 `.ev-chart`)·`window.__EVUI_CHART__(번호)`(로그·`list()` 의 차트 번호)로 조회 객체 `{ chart, version, query(from, to), queryData(from, to), redraw() }` 를 얻는다. `query` 는 realTimeScatter 링 보유 점을 초별·series 별로 세고(초별 표 열은 `time`·`total`·series 이름 — 이름이 겹치는 series 만 id 앞 8자를 붙인다. series 칸은 그 초 점들의 y 값을 오름차순으로 잇고(6개 이상이면 `최소 ~ 최대 (n개)`), 점이 없으면 `null` 이라 y 가 0 인 점과 구분된다. `total` 은 실점 개수) `y: null` 점(소비자가 배치마다 축 이동용으로 넣는 조회 경계)은 데이터가 아니라 세지 않으며 요청 구간을 창 안/일부 창 밖/창 밖으로 판정한다. `queryData` 는 같은 계산에서 실점이 있는 초만, 그 구간에 점이 있는 series 열만 남긴 표를 찍는다. `redraw` 는 저장소를 건드리지 않고 full redraw 1회를 강제한다. `__EVUI_CHART__.list()` 는 호출 시점에 화면에 걸친(요소의 위·아래 끝이 창 높이 안에 걸치는) realTimeScatter 차트 목록(차트 번호·`title` 열(= `realTimeScatter.label`)·series 이름)을 보여준다. 진단 대상은 지금 `realTimeScatter.use` 인 차트뿐이다 — 다른 차트는 목록에 나오지 않고 번호를 받지 않으며, 요소·번호로 골라도 `realTimeScatter 차트가 아니다` 경고 후 `null` 이다(요소의 `__evuiChart__` 도 `null`). 출력은 `Console.log`/`Console.table` 이고 같은 내용을 객체로 반환한다.
- **realTimeScatter 빈 초 자동 로그(운영 빌드 진단)**: localStorage(`EVUI_CHART_LOG_EMPTY`)로 켜 두면(`__EVUI_CHART__.logEmpty(true|false)`, 인자 없이 부르면 현재 상태) 마운트 뒤 새로 지나간 초 중 모든 series 에 실점이 없는 초를 저장소 반영마다 `Console.warn` 으로 찍는다(마운트·리셋 재조회 데이터에 이미 있던 공백은 찍지 않는다) — `[EVUI <버전>] realTimeScatter 차트 #<번호> <이름> 빈 초 YYYY-MM-DD HH:mm:ss ~ YYYY-MM-DD HH:mm:ss (n초)`. 연속 빈 초는 한 줄로 묶고, 마운트(로그를 켠 뒤 첫 저장소 반영)되자마자 `빈 초 로그 켜짐 — <초> 부터 지나가는 초를 본다`(데이터가 없으면 `첫 데이터가 들어오면 그 시각부터 본다`)를 `Console.log` 로 한 번 찍는다. 공백이 다음 배치로 이어지면 `빈 초 시작 <초>` 를 바로 찍은 뒤 데이터가 다시 들어올 때 구간 줄을 찍는다. 이미 지나간 초에 점이 늦게 들어오면 바로잡는다 — 열린 공백은 구간이나 시작을 다시 찍으며 `앞서 찍은 시작 … 은 늦게 채워짐` 을 붙이고, 모두 채워졌으면 따로 찍지 않고 그 알림을 다음 공백 줄(시작 또는 구간)에 한 번 붙인다(다시 켜거나 시각이 뒤로 가 기준을 다시 잡으면 버린다). 닫힌 구간은 `늦게 채워짐 <초>` 를 찍는다. 줄 종류는 `%c` 색 배지로 가른다 — `빈 초 시작` 주황, `빈 초`(데이터가 다시 들어와 확정) 초록, `늦게 채워짐` 파랑, `빈 초 로그 켜짐` 진회색. 한 화면에 차트가 여럿이면 줄 맨 앞 `차트 #<번호>` 테두리 배지(번호별 색)로 가른다. 테두리 배지 색은 글자색 하나로 라이트·다크 콘솔 모두에서 읽히도록 중간 밝기(양쪽 대비 약 3:1)만 쓴다. 소비자가 `realTimeScatter.label`(예: 위젯 제목)을 주면 배지가 `차트 #<번호> <이름>` 이 된다(화면 표시에는 영향 없음). 빈 초 로그 줄에는 series 를 찍지 않는다. 배지 이름은 줄을 찍는 시점의 값이라, 소비자가 이름을 마운트 뒤에 넣거나 바꾸면 그다음 저장소 반영에서 `차트 이름` 줄을 한 번 찍고 이후 줄에 붙인다 — 번호는 지금 마운트된 realTimeScatter 차트 중 비어 있는 가장 작은 번호이고 언마운트 때 반납한다(그사이 realTimeScatter 를 꺼도 반납한다) — 화면 전환으로 차트가 모두 바뀌면 `#1` 부터 다시 매겨진다(`keep-alive` 로 캐시된 차트는 살아 있어 번호를 유지). 켜짐 줄 끝에는 `__EVUI_CHART__(<번호>).query()` 를 붙인다. DOM 요소는 붙이지 않는다. 소비자가 배치마다 `data.logInfo`(문자열, 예: 요청 lastTime)를 넘기면 줄 끝에 ` — <logInfo>` 로 붙인다 — 그 저장소 반영 때의 data 값이라, 갱신이 미뤄져 배치가 합쳐지면 마지막 배치 값이다.

## Business Rules

- **데이터 정규화 비-변형**: `normalizeData` 는 원본(reactive proxy)을 mutate 하지 않는다 — `defaults({ ...data }, DEFAULT_DATA)` 로 누락 top-level 키만 채운 새 객체를 만든다.
- **클론 정책**: `cloneChartData` 는 `cloneDeepWith` 로 깊은 복제하되 ① dayjs/Date 등 불변 날짜 객체는 참조 공유 ② reactive 값은 `toRaw` 로 벗겨 proxy trap 비용을 제거한다.
- **realTimeScatter 데이터 경로**: `realTimeScatter.use` 차트는 data 를 `{ ...data, groups: [], labels: [] }` 로 치환하고 `cloneChartData` 를 거치지 않는다(참조 그대로 `evChart.data` 할당).
- **realTimeScatter 증분 병합**: 마지막 flush 이후 data watcher 로 들어온 배치를 `mergeRealTimeScatterData` 가 series 키별로 이어 붙여 `evChart.data.data` 로 넘긴다. 최신 배치 series 에서 빠진 키의 보류분은 버리고, 소비자 배열은 변이하지 않으며, 누적본은 flush·리셋·unmount 에서 비운다. 누적 여부는 options watcher 의 pendingUpdate 와 독립이다(flush 뒤 options 만 보류 중이어도 이미 넘긴 배치를 다시 싣지 않는다). 같은 tick 의 동기 재할당은 watcher 이전에 Vue 가 합치므로 대상이 아니다. 일반 차트는 최신 배치 기준을 유지한다.
- **콘솔 조회 계약**: 진입점은 mount 에서 요소에 getter 로 달고(접근 시점의 인스턴스로 조회 객체를 만든다) unmount 에서 destroy 보다 먼저 지운다. 전역 함수는 DOM 을 거슬러 찾을 뿐 차트 참조를 보관하지 않는다. 조회 객체는 차트를 직접 들지 않고 unmount 때 끊기는 요소→차트 연결로 읽으며, `list()` 반환 행에는 요소를 넣지 않는다 — DevTools 가 콘솔 출력(평가 결과·`$_`)으로 쥐고 있어도 unmount 된 차트와 그 DOM 이 남지 않는다. `query` 는 점 자신의 x 초로 센다 — 창 시작 초(`fromTime`)의 점은 링의 최신 슬롯에 놓이므로 슬롯 위치로 역산하지 않는다. 창은 저장소가 배치마다 scatter series `minMax`(`minX`/`maxX`)에 쓴 렌더 X축 창을 그대로 읽고(우측단 규칙은 저장소에만 둔다), 초별 행은 요청 구간과 창이 겹치는 초만 만든다. 시각 문자열은 dayjs 로 브라우저 로컬 해석, `to` 는 그 초 전체를 포함, 해석 실패는 경고 후 null 이다. `redraw` 는 `pointsLayerValid=false` 후 `render()` 만 부른다(`update()` 는 `evChart.data.data` 를 링에 다시 넣어 조회 대상을 바꾼다). `drawAxisAndSeries` 는 직전 프레임 모드(`_lastFrameMode`: blit/layer/rebuild/direct)와 마지막 저장소 재raster 시각(`_lastRasterAt`)을 남긴다. 상시 기록은 없다 — 조회 값은 호출할 때 dataSet 에서 계산하므로, 버려지거나 지워진 점의 흔적은 남지 않는다(링에 없음 = 미전달 또는 저장소 손실, 둘은 가르지 않는다).
- **빈 초 판정**: 켜져 있을 때만 `createRealTimeScatterDataSet` 끝에서 판정한다. 기준점은 마운트(또는 로그를 켠) 뒤 데이터 시각으로 우측단이 잡힌 첫 배치(실점 또는 경계점 `y: null` 이 있는 배치 — 보통 마운트 데이터)의 우측단 직전 초이고, 그 배치가 가져온 지난 초는 보지 않는다. 콘솔에서 껐다 다시 켜면 차트의 판정 상태를 비우고 켠 뒤 첫 배치를 새 기준으로 삼아 켜짐 줄을 다시 찍는다(이미 켜져 있을 때 다시 켜면 그대로 이어 간다). 점이 하나도 없는 배치의 우측단은 `Date.now()` 대체값이라 데이터 시각과 어긋날 수 있어 기준으로 쓰지 않는다. series 가 모두 사라져 우측단이 없으면 판정하지 않는다. 이후 배치마다 직전 판정 다음 초 ~ 렌더 우측단(`toTime`) 직전 초를 본다 — 우측단 초는 아직 점이 들어오는 중이라 다음 배치가 지나갈 때 본다. 각 초는 series 마다 그 초의 링 버킷에서 x 초가 같은 실점(`y` 있음)을 찾고, 모든 series 에 없을 때 빈 초다(창 시작 초 점이 놓이는 최신 슬롯은 x 초로 걸러낸다). 소비자 경계점(`y: null`, 조회 끝 시각)이 우측단을 데이터보다 먼저 밀어 점이 이미 지나간 초로 늦게 들어올 수 있으므로, 열린 공백은 매 배치 시작 초부터 다시 보고, 닫힌 구간으로 찍은 초는 창 안에 있는 동안 늦게 채워지는지 본다. 열린 공백의 시작 초가 창 왼쪽 밖이면 그 초부터 창 시작 직전까지는 더 채워질 수 없어 걷지 않고 빈 채로 확정한다(기억하는 초는 창 크기로 묶인다). 직전 판정 다음 초가 이미 창 왼쪽 밖이면 — 데이터가 오지 않은 사이 창이 range 넘게 지나갔다(소비처가 화면 밖 차트의 조회를 멈춘 경우 등) — 그 초들은 본 적이 없어 빈 초로 찍지 않는다. 열린 공백은 마지막으로 본 초까지로 닫아 찍고(`그 뒤로 데이터가 오지 않아 기준을 다시 잡음`) 그 배치를 새 기준으로 삼는다. 리셋은 판정 위치를 바꾸지 않는다 — 재조회가 가져온 지난 초는 다시 보지 않고, 열린 공백은 리셋을 넘어 이어진다. 시각이 뒤로 가면(기준 재설정) 열린 공백을 그 전까지로 닫아 찍고 그 시점을 새 기준으로 삼는다.
- **옵션 정규화**: `defaultsDeep({}, options, DEFAULT_OPTIONS)` 로 props 와 분리된 새 객체를 만든다. scatter/heatMap 이고 tooltip 미지정이면 `tooltip.use=false`, pie 이고 padding 미지정이면 pie 전용 padding(top2/right2/left2/bottom4)을 적용한다.
- **shallow watch 계약**: `shallowDataWatch`/`shallowOptionsWatch` true 면 해당 watcher 가 `deep:false` 로 등록된다. 소비자는 갱신 시 **새 top-level 객체 참조**를 할당해야 한다(in-place mutation 미감지). 바꾸려면 `:key` 등으로 remount.
- **update 플래그 산출**: data watcher 는 series/groups/labels/data 를 각 1회씩 `isEqual` 비교해 updateSeries/updateData 를 정하고, heatMap 타입은 항상 updateSeries. options watcher 는 legend.table 변경 → updateLegend, tooltip 변경 → updateTooltip.
- **blit 진입 게이트**(하나라도 위반 시 full redraw 폴백): realTimeScatter 전용 + brush/scrollbar/hitInfo/updateSeries 아님 + 보이는 series 전부 scatter + 모든 visible scatter 의 ring buffer 정렬(lastTick 의 gapCount/toTime/endIndex/length 동일) + 선택/legendHover 비활성 + 직전 스냅샷 존재 + options 참조 불변 + y 매핑 고정(graphMin/Max) + x 순수 수평 전진(윈도우 폭·plot 폭·labelOffset 불변, graphMin 단조 증가) + 디바이스 불변 + gapCount ∈ (0, length) + pixelRatio 기약분모 q ≤ 4.
- **blit 주기 리셋**: `_framesSinceFullRedraw` 가 `BLIT_REFRESH_INTERVAL`(300, 디버그 override 가능) 에 도달하면 게이트 무관 강제 full redraw 로 sub-pixel drift 를 리셋한다.
- **blit 점당 1회 raster 불변식**: strip 은 `item.drawn` 미표시 점만 그리고, baseline rebuild(`rebuildPointsLayer`)는 `markDrawn:true` 로 그린다 — 반투명(alpha<1) 색에서도 알파 누적 없이 blit≡full.
- **blit dedupe**: `coordinateDedupe !== false` 이고 visible scatter 가 2개 이상이면 strip/baseline 모두 좌표 owner(series) 만 그린다(hollow 마커 비침·z-order 정합). 단일 realtime series 는 push 단계 유일성 보장으로 dedupe 생략.
- **worker 게이트**: `workerRender` opt-in + gate ready + in-flight 여유 + hitInfo/lastHitInfo 없음 + visible series 가 line/bar(timeMode 제외)/heatMap 뿐일 때만 전송. 실패/예외/미지원은 Console.warn 후 main 폴백(무회귀).
- **epoch 규칙**: `renderEpoch` 는 **모든** drawChart 진입에서 증가한다. worker 프레임/에러의 epoch 가 현재와 다르면 stale 로 drop(bitmap 즉시 close).
- **present 규칙**: `clear()` 는 buffer/overlay 만 비우고 display 는 비우지 않는다. display 의 clear+blit 는 `commitToDisplay`/`commitWorkerFrame` 이 present 시점에 atomic 하게 수행하고, 직후 `_blitPrev` 스냅샷을 갱신한다.
- **canvas 재할당 최소화**: `setWidth`/`setHeight` 는 device px 치수가 실제로 바뀔 때만 canvas.width/height 를 재대입한다(재대입은 비트맵 소거를 유발). pointsLayer 치수 변경 시 baseline 무효화.
- **click/dbl-click 구분**: click 콜백은 200ms 지연 실행, dbl-click 이 타이머를 취소한다(uses.js `useWidgetClickEvent`).
- **줌 규칙**: labels 가 1개 이하면 dragZoom 토글 불가. dragZoom 실행은 `axesX[0].type === 'time'` 일 때만. `executeZoom` 은 clone 데이터를 index 범위로 filter 해 props.data 에 재주입하는 방식이다. `keepZoomStatus` true 면 데이터 갱신에도 현재 줌 구간 유지.
- **selectSeries 최상위 덧그리기 게이트**: 선택 시리즈 전부가 line·비-fill·비-그룹일 때만(`selectedSeriesAllLineSafe`), brush/realTimeScatter/workerRender/legend hover 프레임 제외.
- **범례 클릭 규칙**: `clickMode:'active'` — 전체 활성 상태에서 클릭하면 해당 시리즈만 단독 활성, 전체 비활성이 되면 전체 활성으로 복원. 그 외 모드는 마지막 1개 show 는 끌 수 없다. `eventBehavior.legendClick:'emitOnly'` 면 차트 갱신 없이 `click-legend` 만 emit.
- **axes-scale-change**: 리스너가 없으면 payload 계산 자체를 생략. `axesX/axesY[i].scaleChange` 가 true 인 축의 labelRange(min/max)가 직전 emit 값과 다를 때만 `{x:[{minSteps,maxSteps}],y:[...]}` 를 emit.
- **axes-data-max-change**: 소비처가 이벤트를 바인딩했을 때만 리스너가 등록되고(uses.js), 등록 시 렌더마다 show 된 series 들의 `minMax.maxY` 유한수 통합 최대값(없으면 null)을 emit 한다.
- **(blit≡full)**: blit 경로 산출 픽셀은 full redraw 와 동일해야 한다 — 정수 CSS px 시프트의 q-배수 양자화(device 시프트 정수화 → drawImage 무손실), 잔차 carry(`_blitCarry`, `rtXOffsetCss` 로 full/strip/hit-test 에 일관 반영), series별 레이어 z-order 합성으로 보장한다.
- **(무구독 비용 0)**: axes-data-max-change/axes-scale-change 는 구독이 없으면 집계·계산 비용이 0 이다. blit 진단(`recordBlitDiag`)은 디버그 플래그 없으면 체크 1회로 종료. 콘솔 조회는 호출 전 비용이 mount 시 요소 속성 정의 1회와 realTimeScatter 프레임당 필드 2개 기록뿐이다. 빈 초 로그는 꺼져 있으면 배치당 window 플래그 확인 1회(localStorage 는 창마다 처음 1회)이고, 켜져 있으면 새로 지나간 초마다 series 별 버킷 하나를 본다.
- **(프레임 간 자원 보존)**: 점 객체 풀·geometry 메모이즈(`_dataEpoch`/`_scaleVersion` 키)·색상 rgba 캐시(512 엔트리)·client rect 캐시를 유지하고, `reconcileSeriesSet` 이 series 인스턴스를 재사용한다.
- **(무회귀 폴백)**: blit/worker 어느 성능 경로든 조건 미달·실패 시 항상 기존 main full redraw 로 폴백하며 화면 출력은 동일해야 한다.

## Acceptance Criteria

- drawChart 는 realTimeScatter.use 차트를 항상 `drawAxisAndSeries` 로 라우팅하고, 일반 차트는 static→series→overlay→foreground→commit 순서를 지킨다 (Chart.drawPipeline.spec.js).
- 같은 틱의 data/options 다중 변경은 scheduleUpdate 가 플래그 OR-병합하여 `evChart.update` 1회로 coalesce 되고, `deferUntil` 이 미래면 그 시점 이후로 연기된다 (Chart.scheduleUpdate.spec.js).
- realTimeScatter 는 flush 전(setTimeout 0 사이·`deferUntil` 보류 중) 들어온 증분이 series 별로 모두 update 에 전달되고, flush 뒤 배치는 이미 넘긴 배치를 다시 싣지 않으며, 최신 series 에서 빠진 키의 보류분은 버려진다. 리셋이 끼면 리셋 전 배치는 버려지고 같은 tick 의 배치는 남으며, 리셋 뒤 새 배치 없이 flush 되면 빈 data 가 전달된다. 일반 차트는 최신 배치 기준이다 (Chart.realTimeScatterMerge.spec.js).
- realTimeScatterReset 뒤 리셋 전 점이 화면에 남지 않는다 — 같은 tick 에 링을 전진시키는 새 점이나 빈 data 가 와도 마찬가지다 (chart.realtime.reset.visual.spec.js — browser config).
- shallowDataWatch/shallowOptionsWatch true 면 top-level 참조 교체만 감지되고 in-place mutation 은 미감지, false(기본)면 deep 감지된다 (Chart.shallowDataWatch.spec.js, Chart.shallowOptionsWatch.spec.js).
- blit 게이트의 각 차원(모드/정렬/선택/scatterOnly/DPR/스냅샷/옵션/y고정/x전진/디바이스/gap) 위반 시 `evaluateBlitGate.ok === false` 로 full 폴백한다 (chart.core.blitGate.spec.js).
- blit on/off 산출 픽셀이 동등하다 — 반투명 알파 누적 0, 분수 DPR(1.25/1.5) 포함, 2-series 색 등가·세로줄 없음, 좌단 점 온전 (chart.blit.equiv/color/golden.visual.spec.js, chart.realtime.leftedge.visual.spec.js — browser config 전용).
- selectSeries 선택 line 은 line-safe 게이트 통과 시에만 최상위로 덧그려지고 scatter/fill/그룹 시리즈 선택 시 덧그리지 않는다 (chart.selection.spec.js, chart.selection.visual.spec.js).
- scatter coordinateDedupe 는 단일 realtime series 에서 생략되고 다중 series 에서 owner 만 그린다 (chart.core.scatterDedupe.spec.js).
- axes-data-max-change 는 바인딩 시에만 show 된 series 유한 최대값(없으면 null)을 emit 한다 (chart.core.emitDataMax.spec.js).
- normalizeData 는 원본을 변형하지 않고, cloneChartData 는 불변 날짜 참조를 공유한다 (Chart.normalizeData.spec.js, Chart.cloneChartData.spec.js).
- 차트 타입별 시각 산출물이 스크린샷 베이스라인과 일치한다 (Chart.visual.spec.js — browser config, `__screenshots__/`).
- 커스텀 툴팁 hover 중 tooltipDOM 이 가시 영역을 벗어나 `documentElement.scrollWidth` 를 늘리지 않는다 — body 가 뷰포트보다 넓은 레이아웃 포함 (chart.tooltipOverflow.visual.spec.js — browser config). 배치 규칙 상세는 [./plugins/SPEC.md](./plugins/SPEC.md) Business Rules 2·3.
- 콘솔 조회: 10:00:00~10:05:00 입력 뒤 10:02:00~10:02:10 조회의 초별 값·개수가 입력과 같고 `y: null` 점은 세지 않으며(boundary 열 없음), 창 시작 초의 점은 창 밖 보유점으로 센다. 창은 이번 배치에서 빠진 series 의 우측단이 아니라 저장소가 그린 X축을 따른다. 초별 표 series 열은 이름(겹치면 id 앞 8자)이고 ms 열은 없으며, 점이 없는 칸은 `null`·y 가 0 인 점은 `0`·6개 이상은 범위로 보이고, queryData 는 실점이 있는 초와 점이 있는 series 열만 남기며, 창 밖/일부 창 밖 판정, ms 입력, 해석 불가 입력 경고, 리셋 직후 빈 링 조회, redraw 가 update 없이 점 레이어를 무효화하고 render 한다 (chart.inspect.spec.js).
- 빈 초 로그: 마운트되자마자 켜짐을 한 번 찍고(데이터가 없으면 첫 데이터부터 본다고 찍음) 경계점만 있는 마운트 데이터부터 판정하며, localStorage 로 켜 두면 마운트 뒤 지나간 빈 초를 범위 한 줄로 찍고, 꺼져 있으면 찍지 않으며, 마운트 데이터에 이미 있던 공백과 점 없는 배치의 대체 시각은 기준으로 쓰지 않는다. 배치를 넘어 이어진 공백은 시작을 바로 찍고 데이터가 다시 들어오면 구간을 찍으며, 한 배치 안에서 공백이 닫히고 새로 열리면 새 시작을 찍는다. 우측단 초는 다음 배치에서 판정하고, 창 시작 초 점이 놓인 슬롯은 그 슬롯 초의 데이터로 보지 않으며, 한 series 라도 점이 있으면 비지 않은 것이다. 리셋 뒤 재조회의 지난 공백은 찍지 않고 열린 공백은 리셋을 넘어 이어지며, 시각이 뒤로 가면 열린 공백을 닫아 찍고 기준을 다시 잡으며, 데이터가 오지 않은 사이 창이 range 넘게 지나가면 그 초들은 빈 초로 찍지 않고 그 배치부터 다시 보며(열린 공백은 마지막으로 본 초까지로 닫아 찍음), 창 밖까지 이어진 공백도 창 크기만큼만 기억한다. 우측단이 지나간 뒤 늦게 들어온 점은 열린 공백을 닫고, 시작 초가 채워지면 시작을 바로잡고, 모두 채워지면 따로 찍지 않고 다음 공백 줄(시작 또는 한 배치 안에서 닫힌 구간)에 한 번 알리되 다시 켜기·시각 역행으로 기준을 다시 잡으면 알리지 않으며, 창 밖까지 이어진 공백은 시작부터 한 구간으로 닫고, 이미 찍은 구간이 채워지면 늦게 채워짐을 찍는다. series 가 모두 사라져 우측단이 없어도 시각 역행으로 보지 않는다. 빈 구간 시작·확정·늦게 채워짐은 서로 다른 색 배지로 찍고, `data.logInfo` 가 있으면 줄 끝에 붙인다. 차트가 여럿이면 줄마다 차트 번호와 차트별 색 배지가 붙고, 켜짐 줄에는 번호 조회 명령만 붙고 DOM 요소는 붙지 않는다. 줄에는 series 를 찍지 않고 `realTimeScatter.label` 이 있으면 배지에 이름이 붙으며, 이름이 마운트 뒤에 들어오면 차트 이름을 한 번 알리고 이후 줄에 붙인다. 콘솔에서 켜고 끈 상태가 localStorage 에 남고, 껐다 다시 켜면 꺼 둔 동안 지나간 초를 찍지 않고 켠 뒤 배치부터 켜짐 줄과 함께 다시 보며, 이미 켜져 있을 때 다시 켜면 열린 공백을 이어 간다 (chart.inspect.spec.js).
- 차트 두 개에서 각 차트 안쪽 요소로 찾은 진입점이 자기 차트를 가리키고, 로그·list() 의 차트 번호로도 그 차트를 찾으며, 화면 전환으로 차트가 모두 바뀌면 반납된 번호를 작은 것부터 다시 쓰고, unmount 뒤 요소에 진입점이 남지 않고, unmount 전에 받아 둔 조회 객체는 unmount 뒤 차트를 놓으며(`chart` 는 `null`, 조회는 경고 후 `null`), list() 반환 행에는 요소가 없다. list() 는 화면 위·아래로 벗어난 차트를 보여주지 않는다. realTimeScatter 가 아닌 차트는 list() 에 나오지 않고 번호를 받지 않으며, 요소로 골라도 경고 후 `null` 이고, realTimeScatter 를 끈 뒤 언마운트돼도 받은 번호를 반납한다 (Chart.inspectEntry.spec.js).
- 커서가 한 방향으로 이동하는 동안 툴팁의 좌우 배치는 최대 1회만 바뀐다 — hover 지점마다 폭이 달라져도 같다 (chart.tooltipFlip.visual.spec.js — browser config).
- 배치 이후 툴팁 폭이 커져도 툴팁이 커서를 가로로 덮지 않는다 (chart.tooltipFlip.visual.spec.js).

## Architecture

```
┌────────────────────────────── Chart.vue (EvChart SFC) ──────────────────────────────┐
│ props(data/options/selected*/zoom*Idx/…) · emits(v-model/이벤트)                     │
│ watch(deep|shallow) → scheduleUpdate(coalesce+deferUntil) → evChart.update()         │
│ inject: isChartGroup/brushSeries/groupSelectedLabel/groupHoveredLabel/brushIdx/…     │
├──────────── uses.js ────────────┬──────────────── ChartToolbar.vue ─────────────────┤
│ useModel(정규화·eventListeners) │ 줌 툴바 아이콘 → onClickToolbar                    │
│ useWrapper(width/height style)  │                                                    │
│ useZoomModel ──────────────────→│ chartZoom.core.js (EvChartZoom)                    │
└─────────────────┬───────────────┴────────────────────────────────────────────────────┘
                  ▼
┌──────────────────────────── chart.core.js (EvChart class) ───────────────────────────┐
│ 인스턴스 mixin(Object.assign(this,…)): Model(model/) + Tooltip/VirtualScroll/         │
│   Interaction/Tip/Legend/Pie/Title/Scrollbar(plugins/, 비-brush 한정)                 │
│   + GradientLegend(heatMap×gradient)                                                  │
│ 프로토타입 mixin(Object.assign(prototype,…)): Blit(chart.blit.js) + Selection          │
│   (chart.selection.js) — 테스트가 Object.create(prototype)로 호출하므로 prototype     │
│                                                                                        │
│ drawChart(오케스트레이션) = ChartShell(main 전용: window/DOM/listener) +               │
│                             RenderCore(DOM-free, ctx 주입형: prepareLayout/           │
│                             prepareScale/drawStaticLayer/drawSeriesLayer/commit)      │
│   ├─ realTimeScatter → drawAxisAndSeries → evaluateBlitGate → blit | full 폴백        │
│   ├─ workerRender ready → tryDrawSeriesOnWorker → render.worker.gate → worker         │
│   └─ 기본 main full redraw                                                            │
│ canvas 3장: displayCanvas / bufferCanvas / overlayCanvas(+brush 는 overlay 없음)       │
│  (+ annotation-canvas: options.annotations 사용 시 지연 생성하는 z-index 3 오버레이)   │
│ element/(series 래스터) · scale/(축) · annotation/(어노테이션) — 각 하위 SPEC 참조     │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

- **ChartShell vs RenderCore**: RenderCore 단계는 DOM/listener 접근 없이 주입된 bufferCtx·pixelRatio 로만 동작해 worker 재사용이 가능하다. ChartShell 은 window pixelRatio 읽기, scrollbar DOM 배치, listener 호출, overlay transform 을 소유한다.
- **blit 상태**: series별 ping-pong 레이어 Map(`pointsLayers`: sId→{a,b,actx,bctx,cur}), baseline 유효성(`pointsLayerValid`), 시프트 잔차(`_blitCarry`), 레이어 스탬프(`_pointsLayerStamp`), hit-test 지연 재계산 플래그(`_hitCoordsDirty` → `ensureHitCoordsFresh`).
- **주의(프로토타입 shadow)**: chart.core.js 의 클래스 메서드 `drawSyncedIndicator` 는 자기 자신을 호출하는 형태지만, 비-brush 차트에서는 생성자에서 인스턴스에 합성된 Tooltip mixin 의 동명 메서드(plugins.tooltip.js)가 shadow 하여 그 구현이 실행된다. [NEEDS CLARIFICATION: brush 차트(Tooltip 미합성)에서 이 메서드가 호출되면 자기 재귀가 되는데, 호출 경로가 실제로 차단되는지(그룹 hover 는 비-brush 만 대상) 의도 확인 필요]

## File Structure

| 파일 | 역할 |
|------|------|
| Chart.vue | EvChart 컴포넌트 셸 — props/emits, deep/shallow watch, scheduleUpdate coalesce(+deferUntil, realTimeScatter 증분 병합), 그룹 inject, 라이프사이클(mount 시 EvChart 생성·init·콘솔 진입점 부착, unmount 시 진입점 해제 후 destroy), 템플릿 ref 공개 메서드(redraw/toggleSeries/highlightSeries/unhighlightSeries/onResize) |
| ChartToolbar.vue | 줌 툴바 아이콘 목록 렌더, 클릭 시 `onClickToolbar(e, iconType)` emit |
| index.js | Vue plugin 등록(`EvChart.install`) |
| chart.core.js | EvChart 클래스 — canvas 3장 생성, mixin 합성, init/update/render/resize/destroy, drawChart 오케스트레이션(ChartShell/RenderCore), worker 게이트 연동(commitWorkerFrame/drawSeriesLayerFallback), 축 생성·스케일 계산, external legend API, annotation 레이어(ensureAnnotationCanvas/drawAnnotationLayer/buildAnnotationViewport, `_annotationSource` 참조 캐시), `_scaleVersion`/`renderEpoch` 관리 |
| chart.blit.js | realtime scatter blit fast-path 프로토타입 모듈 — 게이트(evaluateBlitGate), ping-pong 레이어 관리(createPointsLayers/resizePointsLayers), 시프트+strip 본체(drawChartBlitFastPath), 합성(compositePointsLayer), baseline(rebuildPointsLayer/maybeRebuildPointsLayer, 스탬프), strip dedupe, hit-test 지연 재계산(ensureHitCoordsFresh), 진단(recordBlitDiag) |
| chart.selection.js | selectSeries 선택 line 최상위 덧그리기 프로토타입 모듈 — line-safe 판정(selectedSeriesAllLineSafe/shouldDrawSelectedOnTop)과 부분 렌더(drawSelectedSeriesOnly) |
| chart.inspect.js | 콘솔 조회 진입점 — 요소 부착/해제(attachInspector/detachInspector), 전역 `__EVUI_CHART__`(list/logEmpty), 조회 객체(query/queryData/redraw, 상시 기록 없이 호출 시 dataSet 계산), realTimeScatter 빈 초 자동 로그(isEmptySecondLogOn/logEmptySeconds) |
| chartZoom.core.js | EvChartZoom 클래스 — executeZoom(index filter), dragZoom(time축), 휠 이동, 줌 이력(zoomAreaMemory previous/current/latest), 줌 애니메이션 canvas, 툴바 아이콘 상태 |
| uses.js | `DEFAULT_OPTIONS`/`DEFAULT_DATA`, normalizeData(비-변형)/cloneChartData(toRaw+불변날짜 예외)/mergeRealTimeScatterData(보류 증분 병합), useModel(옵션·데이터 정규화, eventListeners, click/dbl-click 200ms 구분), useWrapper(wrapper 크기 style), useZoomModel(EvChartZoom 생성·zoom 옵션/데이터 동기화·brushIdx watch) |
| helpers/helpers.util.js | 색상 파싱·rgba 캐시(512), 라벨 sign 포맷(K/M/G/T/P), 텍스트 측정(canvas 싱글톤, worker-safe lazy), ellipsis truncate, coordinateKey(`x\|y`), showLabelTip, calcBoxDistance, calcExtraWidthLabel |
| helpers/helpers.canvas.js | calculateX/Y/SubX(값→px, ceil/floor 양자화), drawPoint/drawPointBatch(+_appendPointPath 색상 그룹 배칭), roundedRect, createGradient |
| helpers/helpers.constant.js | AXIS_UNITS, COLOR 팔레트(25색), LINE/BAR/PIE/AXIS/PLOT_LINE/PLOT_BAND/HEAT_MAP 시리즈·축 기본 옵션, TIME_INTERVALS, NICE_FRACTIONS |
| element/ | 시리즈 타입별 래스터(line/bar/bar.time/pie/scatter/heatmap/tip) — 상세는 [./element/SPEC.md](./element/SPEC.md) |
| plugins/ | interaction/legend(+gradient)/tooltip(+virtualScroll)/title/scrollbar/pie 인스턴스 mixin — 상세는 [./plugins/SPEC.md](./plugins/SPEC.md) |
| scale/ | linear/time/time.category/logarithmic/step 축 스케일 — 상세는 [./scale/SPEC.md](./scale/SPEC.md) |
| model/ | 데이터셋/시리즈 모델(createSeriesSet·reconcileSeriesSet·createDataSet·createRealTimeScatterDataSet·getStoreMinMax 등 Model mixin) — 상세는 [./model/SPEC.md](./model/SPEC.md) |
| annotation/ | `options.annotations` 선언형 어노테이션/뱃지 렌더(정규화→해석→레이아웃→렌더 순수 파이프라인, 전용 캔버스 레이어) — 상세는 [./annotation/SPEC.md](./annotation/SPEC.md) |
| render/ | worker 렌더 인프라 — render.worker.gate.js(WorkerRenderGate 상태기계·frame/error handler), render.snapshot.js(toRenderSnapshot/packSeries), render.unpack.js, render.worker.js(worker entry) |
| style/chart.scss | 차트 wrapper/legend/tooltip 등 스타일 |

`*.spec.js` 테스트 파일(단위 + `*.visual.spec.js` 브라우저 비주얼)은 목록에서 제외 — Acceptance Criteria 근거로 참조.

## Dependencies

| 대상 | 용도 |
|------|------|
| vue (Composition API) | Chart.vue/uses.js — watch/inject/lifecycle/reactive |
| lodash-es | isEqual/debounce(Chart.vue), cloneDeep/cloneDeepWith/defaults/defaultsDeep/isNil(uses.js, helpers) |
| @/common/utils | mobileCheck/truthyNumber/Console(chart.core), Console(chart.inspect), getQuantity(uses), billions·millions·trillion·quadrillion·truthy(라벨 포맷) |
| @/directives/resize | 차트 wrapper 리사이즈 감지(v-resize) |
| dayjs · package.json(version) | 콘솔 조회의 시각 해석·표기와 evui 버전 출력(chart.inspect) |
| EvChartGroup / EvChartBrush | provide/inject 계약의 공급자(isChartGroup, brushSeries, groupSelectedLabel/HoveredLabel, brushIdx, evChartPropsInGroup, groupInteraction.deferUntil) — 본 컴포넌트는 소비자 |
| OffscreenCanvas / Web Worker | workerRender 경로(feature-detect, 미지원 시 main 폴백) |

## Glossary

| 용어 | 정의 |
|------|------|
| buffer/display/overlay | 3장 canvas 구조 — buffer 에 래스터 후 display 로 blit(present), overlay 는 hover/crosshair 등 interaction 즉답 레이어(brush 차트는 없음) |
| blit (fast-path) | 이전 프레임 점 라스터를 drawImage 로 왼쪽 시프트하고 신규 시간대(strip)만 재raster 하는 realtime scatter 전용 최적화 |
| strip | 이번 틱에 새로 그려야 할 ring buffer dirty 버킷 구간(gapCount+1 최소, maxDirtyAge 까지 확장) |
| ping-pong 레이어 | series 별 오프스크린 canvas 2장(a/b) — src 를 dst 로 시프트 복사 후 swap. z-order 는 합성 단계에서 재현 |
| carry (`_blitCarry`) | 정수 CSS px 시프트의 소수 잔차([-q/2, q/2]). `rtXOffsetCss` 로 full/strip/hit-test 좌표에 일관 반영 |
| q (blitShiftDenominator) | pixelRatio 기약분수 분모(≤4). 시프트를 q 배수 CSS px 로 양자화하면 device 시프트가 정수 → drawImage 무손실 |
| baseline / rebuild | full 폴백 시 pointsLayer 에 현재 전체 점을 1회 raster 해 다음 blit 의 출발점을 세우는 것. 스탬프 불변이면 생략 |
| lastTick | data-layer(model.store)가 기록한 realtime 틱 메타(gapCount/toTime/endIndex/length/seq/maxDirtyAge) — blit 게이트·strip 산정 입력 |
| duple / dedupe | 좌표키(`x\|y`)→owner series 맵. coordinateDedupe 시 owner 만 그 좌표를 그린다 |
| drawn 플래그 | 점이 레이어에 실제 raster 된 적 있는지 표시 — strip 재그림 방지로 반투명 알파 누적 차단 |
| ChartShell / RenderCore | drawChart 의 레이어 구분 — Shell 은 main 전용(DOM/listener), Core 는 DOM-free(ctx 주입, worker 후보) |
| renderEpoch | drawChart 진입마다 증가하는 단조 카운터 — 늦게 도착한 worker 프레임/에러의 stale drop 기준 |
| `_scaleVersion` / `_dataEpoch` | 스케일 입력 직렬화 키 버전 / 데이터 버전 — element 의 computeGeometry 재계산 skip 키 |
| external legend | 차트 내부 legend DOM 대신 `update:legendData` + toggleSeries/highlightSeries 로 외부 UI가 범례를 그리는 모드 |
| brush 차트 | EvChartBrush 용 미니 차트(`options.brush`) — tooltip/legend/interaction mixin 과 overlay canvas 를 만들지 않음 |
| deferUntil | 그룹 인터랙션(deferPollingRedraw)이 지정한 시각 — 그때까지 폴링 재렌더를 연기(coalesce 는 유지) |

## Data Flow

```
[소비자] props.data / props.options 갱신 (shallow opt-in 시 새 top-level 참조 필수)
    │  watch (deep | shallow, flush:'post')
    ▼
normalizeData / getNormalizedOptions → isEqual 비교로 updateSeries/updateData/updateLegend/updateTooltip 산출
    │  evChart.data / evChart.options 교체 (realTimeScatter 는 클론 없이 참조)
    ▼
scheduleUpdate — setTimeout coalesce(플래그 OR-병합, realTimeScatter 는 data 배치 병합), groupInteraction.deferUntil 재검사·재예약
    ▼
EvChart.update → resetProps → (updateSeries: reconcileSeriesSet) → createDataSet|createRealTimeScatterDataSet
    → title/legend/tooltip DOM 갱신 → createAxes → render(clear → getChartRect → drawChart)
    ▼
drawChart (renderEpoch++, initScale, prepareScale, scrollbar, axes-scale-change, emitDataMaxChange)
    ├─ realTimeScatter.use → drawAxisAndSeries → evaluateBlitGate
    │      ├─ 게이트+레이어 OK → 레이어 시프트+strip 재raster → static 재그림 + 레이어 합성
    │      └─ 폴백 → static + (layer rebuild+합성 | drawSeriesLayer 직접)
    ├─ workerRender ready → static+hit기하(main) + snapshot 전송 → [worker raster]
    │      → commitWorkerFrame: epoch 검사 → commitToDisplay + bitmap 합성 + foreground
    └─ 기본 → drawStaticLayer → drawSeriesLayer → (drawSelectedSeriesOnly) → drawSeriesOverlay
    ▼
drawForeground(plot front + tip) → commitToDisplay(display clear + buffer blit) → _blitPrev 스냅샷
    │
[상호작용] click/dbl-click/mouse-move/drag-select/legend → plugins.interaction/legend
    → listeners(uses.js eventListeners) → emit → v-model(selectedItem/Label/Series, legendData, zoomIdx) 갱신
[줌] 툴바/드래그/휠 → EvChartZoom.executeZoom → props.data 를 clone 기준 index filter 로 재주입
    → data watcher 재진입(위 플로우 반복) + update:zoomStartIdx/EndIdx emit
[콘솔] $0 → __EVUI_CHART__ → 조상 .ev-chart.__evuiChart__ → query·queryData(호출 시 dataSet 계산, 읽기만) / redraw(render)
[빈 초 로그] (localStorage 켬) createRealTimeScatterDataSet 끝 → logEmptySeconds(마운트 뒤 지나간 초) → Console.warn
```
