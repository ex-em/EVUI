# Chart Plugins — EvChart 믹스인 플러그인 (tooltip / legend / interaction / scrollbar / title / pie)

> 차트 도메인 루트 개요·렌더 파이프라인·모델 계층은 [../SPEC.md](../SPEC.md) 참조.
> 이 문서는 `src/components/chart/plugins/` 하위 8개 플러그인 파일의 역할·훅 지점·`chart.core.js`(EvChart)와의 결합 방식만 다룬다.

## Purpose

EvChart 본체(캔버스 시리즈 렌더링)와 분리된 **부가 UI·인터랙션 계층**을 제공한다. 툴팁(캔버스/커스텀 HTML/가상 스크롤), 범례(DOM/테이블/가상 스크롤/그라디언트), 축 스크롤바, 차트 제목, 마우스·터치 인터랙션(hit-test, 드래그 선택, 아이템/라벨/시리즈 선택), pie/sunburst 계열 draw 루프를 담당한다. 각 파일은 클래스가 아닌 **메서드 모음 객체**이며, EvChart 생성자에서 `Object.assign(this, Module)`로 인스턴스에 믹스인되어 `this`(EvChart 인스턴스 상태)를 직접 공유한다.

## Features

### 툴팁 (plugins.tooltip.js / plugins.tooltip.virtualScroll.js)
- **기본 캔버스 툴팁**: `tooltip.use` 시 `document.body` 직속 tooltip DOM(header + body + canvas)을 생성하고, hover 아이템들을 색상 마커·시리즈명·값으로 캔버스에 렌더. `textOverflow`(ellipsis/wrap), `sortByValue`, `maxWidth`/`maxHeight`+`useScrollbar`, `fontColor.label`/`fontColor.value`(함수형 허용) 지원. scatter(`drawTooltipForScatter`)/heatMap(`drawToolTipForHeatMap`)은 전용 draw 함수 사용.
- **커스텀 HTML 툴팁**: `tooltip.formatter.html(seriesList)`이 반환한 HTML을 파싱해 tooltip DOM에 부착(`drawCustomTooltip`). 루트 노드는 항상 `tooltipDOM.firstElementChild`로 취급하며 위치 계산(`setCustomTooltipLayoutPosition`)은 그 크기 기준.
- **커스텀 툴팁 가상 스크롤**: `tooltip.virtualScroll` 옵션(use: true/'auto'+threshold 기본 50)에 따라 formatter.html 결과에서 row 컨테이너를 탐지(① `[data-evui-tooltip-row]` 속성 행 개수=시리즈 수+동일 부모, ② BFS로 자식 수=시리즈 수인 가장 얕은 요소)하여 상/하 spacer + viewport 구조로 재구성. prefix sum 기반 가시 범위 계산, 실측 높이 학습(행 아이템만), 앵커 보정으로 스크롤 점프 방지, ResizeObserver로 폭 변화 시 측정 무효화. 탐지 실패 시 전체 부착 경로로 fallback(콘솔 경고 1회, `_vsDetectFailed`로 같은 마크업 동안 재시도 차단 — `render()`에서 리셋).
- **인디케이터/그룹 동기화**: hover 위치 수직/수평 indicator(`drawIndicator`), 툴팁 기반 라벨 위치 indicator(`drawIndicatorForTooltip`), 차트 그룹의 다른 차트 hover를 받아 그리는 `drawSyncedIndicator`(time 축 값 비례 또는 `dataLabel` 매칭 — categoryMode/time/기본 축별 좌표 계산). `syncHover === false`면 동기화 비활성.
- **plot 라벨 hover 툴팁**: value-only plot 라벨 hit 영역(`plotLabelHitRegions`) 위에서는 series 툴팁 대신 경량 텍스트 툴팁(`plotLabelTooltipDOM`, `position: fixed`)을 표시. 라벨 hit 시 해당 프레임의 series hit을 비워 라벨을 우선한다.
- **returnValue 콜백**: `tooltip.returnValue`가 함수면 DOM 툴팁을 숨기고 hover 시리즈 목록(또는 leave 시 빈 배열)을 콜백으로 전달.

### 범례 (plugins.legend.js / plugins.legend.gradient.js)
- **DOM 범례**: 시리즈별 색상칩+이름 DOM을 `legend.position`(top/right/bottom/left)에 배치. 그룹(`data.groups`) 순서를 따르고 `showLegend: false` 시리즈는 제외. line+fill 시리즈는 반투명 배경+테두리 칩으로 구분.
- **클릭 show/hide 토글**: `clickMode: 'inactive'`(기본) — 클릭 시 비활성화하되 마지막 1개 활성 범례는 비활성화 불가. `clickMode: 'active'` — 전체 활성 상태에서 클릭하면 클릭한 것만 활성, 전체 비활성 도달 시 전체 복원. 토글 후 `click-legend` 리스너에 `{ seriesIds(전체 활성이면 []), isActiveAll }` emit. `stopClickEvt` 시 무시, `eventBehavior.legendClick === 'emitOnly'`면 차트 update 없이 이벤트만.
- **hover 하이라이트**: 범례 hover 시 `legendHitInfo({ sId, type })`를 `update({ lightUpdate: true, hitInfo: { legend } })`로 전달해 해당 시리즈 외 downplay. leave 시 해제.
- **테이블 범례**: `legend.table.use` 시 `<table>` 헤더+행으로 렌더하고 집계값(min/max/avg/total/last — `getAggregations()` 결과)을 컬럼별 formatter/decimalPoint로 표시. 데이터 갱신 시 `updateLegendTableValues`로 값만 갱신.
- **범례 가상 스크롤**: `legend.virtualScroll`(비 table) 시 top/bottom spacer + 가시 행만 렌더. 행 높이 18px 고정(`legendItemHeight`), scroll/resize 이벤트로 재렌더, 숨김 상태면 `legendNeedsUpdate` 플래그로 지연 갱신(`showLegend`에서 수행).
- **범례 리사이즈**: `legend.allowResize` 시 4px 리사이즈 바+고스트 DOM으로 드래그 리사이즈. mouseup 시 `opt.legend.width/height`를 직접 갱신하고 `render()` 재호출. 차트 최소 150×70px, 범례 최소 120×20px 보장.
- **heatMap 색상 범례**: heatMap(비 gradient)은 `colorState`(구간별 색상)를 범례 항목으로 렌더. 클릭 시 `colorState[n].show` 토글, hover 시 `state: 'highlight'/'downplay'` 설정. `click-legend` args는 `{ seriesIndices, isActiveAll }`.
- **그라디언트 범례**: `type === 'heatMap' && legend.type === 'gradient'`일 때 Legend를 덮어쓰는 별도 구현. 그라디언트 바+start/end 핸들 드래그로 `colorState[0].start/end`(0~100%)를 조정해 표시 값 범위를 필터링. 바 hover 시 해당 값 오버레이 툴팁 표시. 핸들 크기 최대 28px, 박스 최소 70×60px.

### 인터랙션 (plugins.interaction.js)
- **이벤트 바인딩**: `createEventFunctions()`가 overlayCanvas에 mousemove/mouseleave/dblclick/click, `dragStartTarget`(기본 overlayCanvas, `dragSelection.startArea` CSS 셀렉터 지정 시 조상 요소)에 mousedown, 조건부 wheel을 등록. window에 click(터치 선택 해제), capture scroll(client rect 캐시 무효화) 등록. `tooltip.throttledMove` 시 mousemove를 30ms throttle.
- **hit-test**: `findHitItem(offset)` — `findClosestDataIndex`로 공통 데이터 인덱스를 정하고(스냅 임계 `max(평균 라벨 간격, 6px)`, all-null 라벨은 `labelValidMask`로 제외) 시리즈별 `series.findGraphData` 결과를 수집. hitId는 directHit 최우선 → 일반 hit 거리순 → 거리 기반 fallback. 라벨별 유효성은 `buildLabelValidMask`가 사전 계산한 Uint8Array를 O(1) 조회(마스크는 createDataSet 시점 재구축).
- **hover fast path**: hitId+시리즈/dataIndex 시그니처(`hoverSig`)가 직전과 같고 툴팁이 표시 중이면 `drawCustomTooltip`(formatter.html 경로의 최고 비용)만 스킵. overlay/indicator/listener 흐름은 유지. mouseleave·데이터 갱신 시 시그니처 무효화.
- **툴팁 값 포맷 캐시**: `getFormattedTooltipValue`는 itemData 객체를 키로 한 WeakMap에 seriesId별 포맷 결과를 캐시. point 객체는 풀링되어 데이터 갱신 시 in-place 로 덮어써지므로(model.store `addData` target 재사용) 자동 GC 무효화가 성립하지 않는다 — 풀을 덮어쓰는 사건에 걸린 `_dataEpoch`(createDataSet 진입 시 +1)와 캐시 epoch 가 어긋나면 캐시를 폐기한다(`computeGeometry` 메모이즈와 동일 패턴). formatter 옵션 런타임 교체도 update()→createDataSet 재실행으로 함께 무효화된다. `_dataEpoch` 를 받지 못하는 경로(realTimeScatter — 별도 dataset 생성 경로라 epoch 미유지)에서는 **캐시를 사용하지 않는다**(computeGeometry 의 canMemo 가드와 동일 취지; 점객체 값은 불변이지만 formatter 교체를 무효화할 수 없기 때문). 같은 기전의 알려진 잔여 지점: `findHitItem`/`addNotHitInfo` 가 풀 객체에 직접 쓰는 `data.formatted` 는 addData 리셋 필드에 없다(현재는 매 hover 재기록으로 노출 안 됨 — 우연적 안전). pie/heatMap/기본 타입별 formatter 인자 형태 상이.
- **드래그 선택**: `dragSelection.use` + scatter/line/heatMap/수직 bar(`horizontal: false`)에서 드래그로 영역 선택. 누적 막대는 차트 타입이 아니라 `data.groups`로 표현되고 게이트는 `options`만 읽으므로 일반 막대와 동일하게 동작한다. 차트 영역으로 clamp된 rect를 계산해 `drag-select` 리스너에 `{ data: findSelectedItems, range: getSelectionRange }` 전달(zoom.use 시엔 `zoom.getRangeInfo`로 위임). line·bar는 y축 전체 높이 고정, heatMap은 `findBlockRange`로 블록 단위 스냅. `findSelectedItems`는 `options.type`을 읽지 않고 `seriesList` 전부에 `findItems`를 호출하므로, 시리즈 `type` 오버라이드로 bar를 섞은 line·scatter 차트의 `data`에도 그 막대가 실린다(아이템이 없는 시리즈는 제외). `Bar.findItems`는 막대의 x 구간이 드래그 구간에 **걸치기만 해도** 담는다(막대는 폭을 가지므로 완전 포함을 요구하지 않는다). 대상은 가시 윈도우(`visibleStartIndex` ~ `filteredCount`)로 좁힌다 — 스크롤바 이동은 `lightUpdate`라 윈도우 밖 항목의 `xp`가 직전 렌더값으로 남아, 좌표 존재 여부만으로는 걸러지지 않는다. 숨긴 시리즈·가로 막대는 제외한다 — 이 제외 규칙은 `Bar` 한정이고 `Line.findItems`에는 `show` 가드가 없어 범례로 끈 line 시리즈의 이전 데이터가 `data`에 실릴 수 있다. 범주형(categoryMode) bar의 range는 인덱스 슬롯 배치가 아닌 `graphMin..graphMax` 선형 보간이라 최대 약 1 막대 폭 오차를 갖는다. 누적 bar는 시리즈 `.y`가 누적 합이므로(`addSeriesStackDS` → `getSeriesMinMax`) y축 range도 스택 총합 공간이다 — 개별 시리즈 값으로 읽으면 어긋난다(x는 누적과 무관). zoom 위임 시에도 같은 부분 겹침 규칙이 쓰여, 줌 창이 시각적 밴드보다 양 끝 최대 1 인덱스 넓어질 수 있다. `keepDisplay` 시 선택 영역 잔존(`dragInfoBackup`) + resize 시 range 비율로 재스케일. 모바일 scatter는 click 시 `size`(기본 50px) 터치 박스 선택.
- **startArea 드래그 표시**: `dragSelection.displayFromStartArea`(scatter, PC) 시 startArea를 덮는 전용 `pointer-events: none` 캔버스(z-index 3)를 생성해 미클램프 rect를 그림. 차트→캔버스 좌표 오프셋은 `refreshDragDisplayCanvas`에서 측정·캐시(매 프레임 getBoundingClientRect 회피). 드래그 중 startArea `user-select: none` 처리 후 종료 시 원복.
- **아이템/라벨/시리즈 선택**: click/dblclick에서 `selectItem`/`selectLabel`/`selectSeries` 옵션(use+useClick)에 따라 선택 상태(`defaultSelectItemInfo`/`defaultSelectInfo`)를 갱신하고 리스너 args에 `selected`/`deselected` 페이로드 구성. limit 초과 시 `useDeselectOverflow`에 따라 최고참 제거 또는 신규 거부. heatMap은 마우스 위치(축/배경)에 따라 item↔label 선택을 배타 처리하며 `useBothAxis` 지원. 외부 API `selectItemByData`/`selectLabelByData`/`selectSeriesByData`로 프로그램 선택 가능(후자는 마지막 render된 선택과 동일하면 skip).
- **툴팁 내부 휠 스크롤**: 툴팁 표시 중 wheel은 가상 스크롤 컨테이너(`vsState.scrollEl`) > `tooltip.htmlScrollTarget` 셀렉터 > `tooltipBodyDOM` 순의 대상을 스크롤. 스크롤 불가면 툴팁 숨김. wheel 핸들러는 `tooltip.useScrollbar` 또는 가상 스크롤 가능 조건(formatter.html + virtualScroll.use !== false)일 때만 등록.
- **mouse-move 부가 정보**: 비 pie 차트에서 `mouse-move` 리스너 args에 `curMouseTargetVal`(마우스 위치 분류: xAxis/yAxis/chartBackground/canvas + 라벨/최대값 정보)과 `hoveredLabel`(time 축 hover 라벨, 그룹 동기화용) 포함.

### 스크롤바 (plugins.scrollbar.js)
- **축 스크롤바**: `axesX[0].scrollbar.use`/`axesY[0].scrollbar.use` 시 track/thumb/(옵션)버튼 DOM을 생성하고 `scrollbar[dir].range`([min,max])로 표시 구간을 관리. thumb 크기·위치는 step 축은 labels 길이, time/linear 축은 minMax+interval 기반으로 파생. 위치는 `[0, trackSize - thumbSize]`로 클램프.
- **스크롤 조작**: thumb 드래그(5ms throttle), track 클릭(버튼 방향 판정), up/down 버튼, wheel(shift+휠 가로, 대각선은 큰 축 우선, 임계 1px)로 range를 interval 단위 이동 후 `update({ updateByScrollbar: true })` 호출. 툴팁이 열려 있고 내부 스크롤 여지가 있으면 차트 스크롤보다 툴팁 스크롤 우선(경계 도달 시에만 차트로 위임).
- **range 불변식**: `initScrollbarRange`는 윈도우 폭을 유지한 채 한계 `[limitMin, limitMax]` 안으로 정렬(역전/붕괴 방지). `getScrollbarLimits`는 minMax 미확정(null/비유한) 시 null을 반환해 range를 건드리지 않음. `anchorEdge`(start/end/null)는 사용자가 가장자리에 붙여둔 의도를 보존해 리사이즈 시 재계산에 사용 — range 옵션이 실제로 바뀐 경우에만 갱신하고 데이터만 갱신된 경우 보존. `resetPosition` 시 매 init마다 옵션 range로 리셋+anchor 재계산.
- **갱신/파기**: `updateScrollbarInfo`는 옵션 use/range 변화를 감지해 init/destroy/range 재계산 분기. `destroyScrollbar`는 DOM 제거 후 `{ isInit: false }`로 리셋하고 양축 모두 미사용이면 wheel 리스너 해제.

### 제목 (plugins.title.js)
- **제목 DOM**: `.ev-chart-title` div를 wrapperDOM에 추가하고 `title.text`/`height`/`style`을 반영. show 시 wrapperDOM `padding-top`을 제목 높이만큼 확보, hide 시 0.

### 파이 (plugins.pie.js)
- **pie/doughnut draw**: `pieDataSet`(model.store가 구성)을 순회하며 슬라이스 각도(12시 방향 시작, `1.5π`)를 계산해 `series.draw(ctx, strokeOptions, unSelectedOpacity)` 호출. `doughnutHoleSize`로 내경 결정, `pieStroke` 시 반지름 보정+단일 슬라이스 테두리 특수 처리. `selectInfo`/`legendHitInfo`로 시리즈별 isSelect/isDownplay 설정.
- **sunburst draw**: 계층 데이터의 링별 draw. `slice.id === 'dummy'`는 `destination-out`으로 빈 영역 처리.
- **도넛 홀**: `drawDoughnutHole`이 `destination-out`으로 중앙 홀을 뚫고 `pieStroke` 시 내측 테두리를 그림. 마지막 링의 `ir`을 홀 반지름으로 갱신.

## Business Rules

1. **믹스인 장착 조건**: `options.brush`가 truthy면(브러시 차트) Tooltip/TooltipVirtualScroll/Interaction/Tip/Legend/Pie/Title/Scrollbar 전부 미장착 — 브러시 차트는 렌더 전용. `options.type === 'heatMap' && options.legend.type === 'gradient'`일 때만 GradientLegend가 Legend **뒤에** assign되어 동명 메서드(createLegendLayout/initLegend/initEvent/updateLegend/resetLegend/setLegendPosition/updateLegendContainerSize/showLegend/hideLegend)를 덮어쓴다 (chart.core.js:37-52).
2. **툴팁 DOM 위치**: tooltip DOM은 `document.body` 직속으로 부착되고 배치는 `transform: translate3d`로만 이동한다(레이아웃/리페인트 회피). 마우스+20px 위치가 body 경계를 넘으면 반대 방향으로 반전 배치.
3. **범례 최소 활성 보장**: `clickMode !== 'active'`에서 활성 범례가 1개면 클릭해도 비활성화되지 않는다(일반 범례는 `seriesInfo.count === 1`, heatMap 색상 범례는 `activeCount === 1` 기준).
4. **범례 테이블 제외 타입**: legend table은 heatMap/scatter 타입에서 사용하지 않는다. 단, 판정 문자열이 chart.core.js(update)는 `'heatMap'`, plugins.legend.js(initLegend)는 `'heatmap'`(소문자)로 서로 다르다. [NEEDS CLARIFICATION: 차트 타입 표기는 `'heatMap'`인데 initLegend의 useTable 판정만 `'heatmap'` 비교라 heatMap+legend.table.use 조합에서 init과 update의 useTable 판정이 갈린다 — 의도인가 오타인가?]
5. **initEvent 1회 원칙**: 범례 이벤트 리스너(click/mouseover/mouseleave)는 `isInitLegend` 가드로 최초 1회만 등록된다. `forceUpdateLegend`는 destroy 후 재-init하므로 이때만 재등록된다.
6. **스크롤바 wheel 등록 주체 이원화**: 스크롤바 wheel(`onScrollbarWheel`)은 overlayCanvas에 스크롤바 존재 시 등록되고, 툴팁 내부 스크롤 wheel(`onWheel`, interaction)은 `tooltip.useScrollbar` 또는 가상 스크롤 가능 조건에서 등록된다. 둘 다 툴팁 열림+스크롤 여지 시 툴팁 스크롤을 우선한다.
7. **plot 라벨 우선**: 커서가 plot 라벨 박스 안이면 그 프레임의 series hit을 비워 series 툴팁/하이라이트를 끄고 라벨 툴팁만 표시한다(데스크탑 전용 — `isMobile`이면 onMouseMove 조기 반환).
8. **가상 스크롤 행 분류 기준**: 행/비-row 분류는 오직 `data-evui-tooltip-row` 속성 유무이며 클래스명은 보지 않는다. 마크된 행이 하나도 없으면(BFS 경로) 전부 행으로 간주한다. 높이 학습 평균은 행 아이템만 대상으로 계산한다.
9. **드래그 선택 활성화**: 캔버스 밖(startArea)에서 시작한 드래그는 포인터가 캔버스에 진입한 순간 활성화되며 진입 전에는 preventDefault를 호출하지 않는다(단, 전용 표시 캔버스가 있으면 시작 즉시 활성화). 드래그 종료는 window mouseup에서 처리하고 `width > 1 && height > 1`일 때만 drag-select를 발화한다.
10. **선택 상태와 리스너**: click 리스너는 `dragInfoBackup`(드래그 선택 잔존)이 있으면 발화하지 않는다. `selectSeriesByData`는 마지막 render된 선택(`_renderedSelectSeriesIds`)과 동일하면 render를 skip한다(차트 그룹 deep watch 스팸 차단).
11. **스크롤바 한계 방어**: minMax가 아직 확정되지 않은 상태(null)에서는 range를 절대 변경하지 않는다(`+null === 0` 오염 방지). 라이브 데이터로 윈도우가 한계 밖으로 밀려도 폭을 유지한 채 가장자리 정렬한다.
12. **(hover 성능)**: hit-test는 라벨 유효성 사전계산 마스크(O(1) 조회), 툴팁 값 포맷 WeakMap 캐시, hoverSig 기반 커스텀 툴팁 redraw 스킵으로 mousemove 당 비용을 상수화한다. 루프 내 `offsetWidth`는 1회만 읽는다(강제 동기 레이아웃 회피).
13. **(스크롤 성능)**: 가상 스크롤 scroll 핸들러는 rAF throttle + passive, 프로그램적 scrollTop 보정 중에는 `suppressScroll`로 재진입 차단, `overflow-anchor: none`으로 브라우저 scroll anchoring을 끈다. 범례 가상 스크롤도 rAF로 초기 렌더한다.
14. **(teardown 무누수)**: `tooltipDestroy`는 가상 스크롤 세션(scroll 리스너/ResizeObserver) 해제 후 tooltip DOM들을 제거한다. `destroyLegend`는 pending rAF를 cancel한다. EvChart.destroy가 overlayCanvas/window 리스너와 전용 드래그 캔버스, startArea position 원복까지 수행한다.

## Acceptance Criteria

- `tooltip.use` 차트에서 데이터 포인트 hover 시 tooltip DOM이 `display: block`으로 표시되고, mouseleave 시 숨김·overlay가 클리어된다. (Chart.tooltip.spec.js / 수동 QA)
- `tooltip.formatter.html` + 시리즈 수가 `virtualScroll.threshold` 이상이면 row 컨테이너 직속 자식이 spacer/viewport/spacer 3개로 재구성되고 가시 범위 밖 행은 DOM에서 detach된다. row 탐지 실패 시 경고 1회 후 전체 부착으로 fallback한다. (plugins.tooltip.virtualScroll.spec.js)
- 범례 클릭 시 대상 시리즈의 `show`가 토글되고 `click-legend` 리스너가 `{ seriesIds, isActiveAll }`(heatMap은 `{ seriesIndices, isActiveAll }`)로 호출된다. 마지막 활성 1개는 inactive 모드에서 비활성화되지 않는다. (수동 QA)
- 스크롤바 thumb 드래그/버튼/track 클릭/wheel 시 `scrollbar[dir].range`가 interval 단위로 이동하고 한계 밖으로 나가지 않으며, `update({ updateByScrollbar: true })`가 호출된다. (plugins.scrollbar.spec.js)
- `dragSelection.use` scatter에서 드래그 종료 시 `drag-select` 리스너가 `{ data, range: { xMin, xMax, yMin, yMax } }`(소수 3자리 고정)로 호출된다. `zoom.use` 시엔 리스너 대신 `zoom.getRangeInfo`가 호출된다. (plugins.interaction.spec.js)
- 드래그 구간에 x 구간이 걸친 막대는 완전히 포함되지 않아도 `data`에 담긴다. 누적 막대는 포인트 객체를 그대로 반환하므로 `.y`(누적 합)와 `.o`(자기 값)를 함께 갖는다(line과 동일 계약). (element.bar.spec.js)
- 가시 윈도우를 옮긴 뒤 `findItems`는 이전 윈도우의 막대를 담지 않고, 빈 윈도우 sentinel에서는 빈 배열을 반환한다. (element.bar.spec.js)
- `drag-select` 페이로드는 차트 타입을 가리지 않고 `findItems`를 가진 시리즈를 담는다(`type: 'line'` 차트에 섞인 bar 시리즈 포함). (plugins.interaction.spec.js)
- `drag-select` 리스너도 `zoom.getRangeInfo`도 없으면(리스너 미바인딩 + zoom 미사용) mouseup이 조용히 끝난다. `getRangeInfo`는 zoom 모드에서만 주입되므로 옵셔널 호출이다. (plugins.interaction.spec.js)
- bar 시리즈의 `data`가 `zoom.getRangeInfo`로 위임되면 `dragZoom`이 아이템의 `x`(라벨)로 줌 인덱스 범위를 잡는다. 막대 1개만 걸리면 드래그 위치에 가까운 쪽으로 한 칸 넓히고, `axesX[0].type`이 `time`이 아니면 아무것도 하지 않는다. (chartZoom.dragZoom.spec.js)
- `dragSelection.use` + scatter/line/heatMap/수직 bar에서만 mousedown이 드래그를 시작한다. `horizontal: true` bar는 시작하지 않는다. `data.groups`(누적)는 판정에 관여하지 않아 누적 수직 bar도 시작하고, 누적 + `horizontal: true`는 시작하지 않는다. (plugins.interaction.spec.js)
- `findHitItem`은 directHit > 일반 hit(거리순) > 거리 fallback 순으로 hitId를 정하고, all-null 라벨은 스냅 대상에서 제외한다(단 `disableNullLabelSnap` 시 synthetic item으로 label/index 전달). (plugins.interaction.spec.js)
- `title.show` 토글 시 제목 DOM display와 wrapperDOM padding-top이 함께 전환된다. (수동 QA)
- `doughnutHoleSize > 0`인 pie는 중앙이 `destination-out`으로 투명하게 뚫리고, `pieStroke.use` 시 내/외곽 테두리가 그려진다. (Chart.visual.spec.js / 수동 QA)
- 동일 데이터 포인트 위에서의 연속 mousemove는 `drawCustomTooltip`을 다시 실행하지 않는다(hoverSig fast path). 데이터 갱신·mouseleave 후 첫 hover는 다시 그린다. (plugins.interaction.spec.js)

## Architecture

```
EvChart (chart.core.js)
│  constructor:
│    Object.assign(this, Model[*])            ← 모델 계층 먼저
│    if (!options.brush)                      ← 브러시 차트는 플러그인 전체 미장착
│      Object.assign(this, Tooltip)             plugins.tooltip.js
│      Object.assign(this, TooltipVirtualScroll) plugins.tooltip.virtualScroll.js
│      Object.assign(this, Interaction)         plugins.interaction.js
│      Object.assign(this, Tip)                 (element/element.tip — 플러그인 외부)
│      Object.assign(this, Legend)              plugins.legend.js
│      Object.assign(this, Pie)                 plugins.pie.js
│      Object.assign(this, Title)               plugins.title.js
│      Object.assign(this, Scrollbar)           plugins.scrollbar.js
│    if (type === 'heatMap' && legend.type === 'gradient')
│      Object.assign(this, GradientLegend)      plugins.legend.gradient.js (Legend 동명 메서드 override)
│
├─ 훅 지점 (chart.core.js → 플러그인 진입점)
│    init()      : initScrollbar → drawChart → createTooltipDOM → createEventFunctions?.()
│    initRect()  : initTitle/showTitle, initLegend/setLegendPosition
│    drawChart() : updateScrollbarPosition(scrollbarLabelOffset)   ← pre-adjust labelOffset 주입
│                  drawPie/drawSunburst/drawDoughnutHole (series layer)
│    update()    : updateScrollbar→updateScrollbarInfo,
│                  updateLegend/forceUpdateLegend/updateLegendTableValues,
│                  initTitle/updateTitle/showTitle/hideTitle,
│                  createTooltipDOM + setDefaultTooltipLayout (updateTooltip)
│    resize      : refreshDragDisplayCanvas
│    destroy()   : 이벤트 리스너 해제, tooltipDestroy, 범례 rAF cancel, 드래그 캔버스 제거
│
└─ 플러그인 → EvChart 역호출 (공유 this)
     this.update({ updateSeries, updateSelTip, lightUpdate, updateByScrollbar, hitInfo })
     this.render() / this.overlayClear() / this.tooltipClear()
     this.findHitItem ↔ series.findGraphData / series.findItems (시리즈 계약)
     this.listeners['click' | 'dbl-click' | 'drag-select' | 'mouse-move' | 'mouse-leave' | 'click-legend']
```

- 플러그인은 전부 `this`를 EvChart 인스턴스로 가정하는 메서드 모음이다. 인스턴스 own property로 assign되므로 클래스 프로토타입의 동명 메서드보다 우선한다.
- DOM 소유권: 툴팁은 `document.body`, 나머지(범례/제목/스크롤바/드래그 캔버스)는 `this.wrapperDOM`(드래그 캔버스만 startArea) 하위에 생성한다.

## File Structure

| 파일 | 역할 |
|------|------|
| plugins.interaction.js | 마우스/터치 이벤트 파이프라인(onMouseMove/Leave/Click/DblClick/MouseDown/Wheel), hit-test(findHitItem, findClosestDataIndex, buildLabelValidMask), 드래그 선택(dragStart, drawSelectionArea, 전용 표시 캔버스), 아이템/라벨/시리즈 선택 상태 관리 및 외부 선택 API, 툴팁 label/value 포맷(+WeakMap 캐시) |
| plugins.tooltip.js | 툴팁 DOM 생성/배치/파기, 기본·scatter·heatMap 캔버스 툴팁 draw, 커스텀 HTML 툴팁, plot 라벨 툴팁, indicator/synced indicator, alignSeriesList(그룹 순 정렬) |
| plugins.tooltip.virtualScroll.js | 커스텀 툴팁 가상 스크롤: row 컨테이너 탐지, spacer/viewport 재구성, prefix sum·가시 범위·실측 학습·앵커 보정, scroll/ResizeObserver 관리 및 teardown |
| plugins.legend.js | DOM 범례(일반/table/heatMap colorState), 클릭 토글·hover 하이라이트, 범례 가상 스크롤, allowResize 리사이즈 바, position별 레이아웃, 집계값 표시 |
| plugins.legend.gradient.js | heatMap 그라디언트 범례: 핸들 드래그로 colorState[0].start/end 범위 조정, hover 값 오버레이, position별 레이아웃 (Legend 동명 메서드 override) |
| plugins.scrollbar.js | 축 스크롤바 DOM(track/thumb/button), range·anchorEdge 관리, 드래그/클릭/휠 스크롤, 한계 클램프, 파기 |
| plugins.title.js | 제목 DOM 생성/갱신/표시/숨김 (wrapperDOM padding-top 연동) |
| plugins.pie.js | pie/doughnut/sunburst draw 루프(bufferCtx에 series.draw 위임), 도넛 홀(destination-out) |

## Dependencies

| 대상 | 용도 |
|------|------|
| chart.core.js (EvChart) | 믹스인 호스트. 인스턴스 상태(options/data/seriesList/chartRect/labelOffset/overlayCtx/bufferCtx/wrapperDOM 등)와 update/render/overlayClear 등 역호출 대상 |
| model/ (model.store 등) | pieDataSet 구성, createDataSet(labelValidMask 재구축 트리거), getAggregations |
| element/ (series 인스턴스) | findGraphData/findItems/itemHighlight/draw — hit-test와 draw의 시리즈 계약 |
| ../helpers/helpers.util | aliasPixel, truncateLabelWithEllipsis, htmlToElement, setDOMStyle, rgbaAdjustHalfOpacity, labelSignFormat, calcBoxDistance, isDoughnutHole |
| ../helpers/helpers.canvas | createGradient (툴팁 색상 마커 그라디언트) |
| ../helpers/helpers.constant | AXIS_OPTION.scrollbar (스크롤바 기본 옵션 defaultsDeep 병합) |
| lodash-es | inRange, cloneDeep, defaultsDeep, isEqual, isNil, throttle |
| dayjs | time 축 라벨 포맷 (getCurMouseTargetVal) |
| @/common/utils | convertToPercent, numberWithComma, truthyNumber, checkNullAndUndefined |
| @/common/utils.debounce / utils.throttle | tooltip debouncedHide(200ms) / mousemove throttle(30ms) |
| 브라우저 API | ResizeObserver(가상 스크롤 폭 감지), requestAnimationFrame, WeakMap |

## Glossary

| 용어 | 정의 |
|------|------|
| hitInfo | `findHitItem` 반환값 `{ items, hitId, maxTip, maxHighlight }`. items는 sId→hover 아이템 맵 |
| hitId | 커서에 가장 가까운(directHit 우선) 시리즈 ID. 툴팁 헤더/기준 아이템 결정에 사용 |
| maxTip | `[가장 긴 시리즈명, 가장 긴 값 문자열]` — 툴팁 캔버스 폭 계산용 |
| hoverSig | hitId+시리즈별 dataIndex를 이은 hover 시그니처. 동일하면 커스텀 툴팁 redraw 스킵 |
| labelValidMask | 라벨 인덱스별 "유효 값을 가진 가시 시리즈 존재" Uint8Array. hover hot path의 O(라벨×시리즈) 제거 |
| vsState | 가상 스크롤 세션 상태(scrollEl/spacer/viewport/items/heights/prefixSums/range/overscan 등). teardown 시 null |
| data-evui-tooltip-row | 커스텀 툴팁에서 시리즈 행을 명시하는 마커 속성. 가상 스크롤 행 분류의 유일한 기준 |
| anchorEdge | 스크롤바 윈도우가 축 한계의 어느 가장자리에 붙어 있는지(start/end/null). 리사이즈 시 위치 의도 보존 |
| colorState | heatMap 시리즈의 구간별 색상 상태 배열. 범례 토글(show)·하이라이트(state)·gradient 범위(start/end/selectedValue)의 대상 |
| dragInfo / dragInfoBackup | 진행 중 드래그 rect / keepDisplay용 마지막 선택 rect 백업 |
| displayRect | displayFromStartArea 전용의 미클램프 드래그 rect(startArea까지의 픽셀 꼬리 포함) |
| plotLabelHitRegions | value-only plot 라벨의 hover hit 박스 목록(코어/플롯 렌더가 채움). 인터랙션은 조회만 |
| pieDataSet | model.store가 구성하는 pie 링 데이터 배열. drawPie/drawSunburst의 입력이자 or/ir(외/내경) 기록 대상 |

## Data Flow

```
[mousemove on overlayCanvas]
    │ getMousePosition (client rect 캐시)
    ▼
findPlotLabelHitRegion ──(hit)──▶ series hit 비움 + plot 라벨 툴팁
    │ (no hit)
    ▼
findHitItem ── findClosestDataIndex(labelValidMask, snap≥6px)
    │            └ series.findGraphData × 시리즈 (directHit > hit > fallback)
    ▼
hoverSig 비교 ──(동일)──▶ drawCustomTooltip 스킵
    │
    ▼
overlayClear → drawItemsHighlight → 툴팁 draw 분기
    │   ├ returnValue 콜백        (DOM 툴팁 숨김)
    │   ├ formatter.html          → drawCustomTooltip(가상 스크롤 시도 → fallback)
    │   └ 기본/scatter/heatMap    → setTooltipLayoutPosition + drawTooltip*
    ▼
indicator draw (line 계열: drawIndicatorForTooltip / 그 외: drawIndicator)
    ▼
listeners['mouse-move']({ e, hoveredLabel, curMouseTargetVal })
    └─ (차트 그룹) 다른 차트의 drawSyncedIndicator({ label, dataLabel, mousePosition })

[legend click] → series.show / colorState[n].show 토글
    → update({ updateSeries: false, updateSelTip: { update: true, keepDomain: true } })
    → listeners['click-legend']

[scrollbar drag/click/wheel] → scrollbar[dir].range 이동 + anchorEdge 갱신
    → update({ updateByScrollbar: true, lightUpdate })
    → drawChart → updateScrollbarPosition (thumb 재배치)

[drag select] dragStart(mousedown) → dragMove(clamp + drawSelectionArea)
    → dragEnd → listeners['drag-select']({ data, range }) 또는 zoom.getRangeInfo
```
