# ChartBrush (EvChartBrush)

## Purpose

EvChartGroup 내부에서 사용하는 차트 브러시 컴포넌트. 그룹에 묶인 차트 중 하나(`chartIdx`)의 원본(전체 구간) 데이터를 경량 미니 차트로 렌더링하고, 그 위에 캔버스 기반 선택 영역(브러시 렉트)을 그려 메인 차트의 줌 구간을 표시·조작한다. 브러시 조작(좌/우 버튼 드래그, grab 이동, 휠 스크롤, 외부 클릭 텔레포트)은 그룹이 provide 한 반응형 `brushIdx` 를 갱신해 EvChartZoom 의 줌 실행으로 이어지고, 반대로 툴바/드래그셀렉션 줌도 `brushIdx` 를 통해 브러시 렉트에 반영된다(양방향 동기화).

## Features

- **브러시 미니 차트 렌더링**: `injectEvChartClone.data[chartIdx]`(줌 전 원본 클론)를 데이터로 자체 EvChart 인스턴스를 생성한다. 차트 옵션은 대상 차트 옵션(`injectEvChartInfo.props.options[chartIdx]`)을 복사하되 `brush: { use: true, ...옵션 }` 을 주입하고 zoom·dragSelection·title·tooltip·legend·selectLabel·selectSeries·축 title 을 모두 비활성화한다 (`ChartBrush.vue` `evChartOption` computed).
- **선택 영역 렌더링**: `brushIdx.start/end` 를 라벨 인덱스 → 픽셀로 환산해 `.brush-canvas` 캔버스에 `selection.fillColor`/`opacity` 사각형과 좌/우 6px 버튼을 그린다 (`chartBrush.core.js` `drawBrushRect`→`drawBrush`). 캔버스는 미니 차트의 `chartRect`+`labelOffset` 기준으로 absolute 배치된다.
- **좌/우 버튼 드래그 리사이즈**: 버튼 위에서 mousedown 후 드래그하면 구간을 확대(INCREASE)/축소(DECREASE)한다 (`mouseDownAndMove`, `BRUSH_UPDATE_MODE.BUTTON`). 조작 중 `brushIdx.isUseButton = true`.
- **grab 드래그 이동**: 브러시 내부에서 mousedown 후 드래그하면 구간 폭을 유지한 채 좌우로 이동한다 (`BRUSH_UPDATE_MODE.GRAB`). 조작 중 `brushIdx.isUseScroll = true`.
- **외부 클릭 텔레포트**: 브러시 밖 영역을 클릭하면 현재 구간 폭을 유지한 채 클릭 지점을 중심으로 구간을 이동한다 (`teleportBrush`). 경계(0, `labelEndIdx`)를 넘으면 경계에 붙인다.
- **휠 스크롤 이동**: `useWheelMove: true`(기본값)일 때 캔버스 위 wheel 이벤트로 구간을 한 칸씩 이동한다 (`onWheel`, deltaY>0 이면 DOWN). false 이면 wheel 리스너를 등록하지 않는다 (`setEventListener`).
- **debounce 반영 모드**: `useDebounce: true`(기본값)이면 드래그/휠 중에는 내부 `debounceBrushIdx` 로 브러시 캔버스만 다시 그리고, mouseup(또는 wheel 100ms 정지) 시점에 픽셀 좌표를 인덱스로 역환산(`updateBrushIdxUseXPos`)해 `brushIdx` 에 1회 반영한다. false 이면 이동량마다 `updateBrushIdx` 로 `brushIdx` 를 즉시 갱신해 메인 차트가 동시에 업데이트된다.
- **커서 피드백**: 브러시 밖 `pointer`, 내부 `grab`, 버튼 위 `ew-resize` (`changeCursor`).
- **시리즈 표시 동기화**: 메인 차트에서 legend 클릭으로 시리즈 show/hide 를 토글하면 chart.core 가 `brushSeries.list[chartIdx]`/`chartIdx` 를 갱신하고, ChartBrush 의 watch 가 브러시 차트의 `seriesList` 를 교체해 다시 그린다. 데이터 갱신 시에도 `show` 필드가 없는 시리즈에 `brushSeries` 의 show 상태를 이어 붙인다.
- **리사이즈·keep-alive 대응**: `v-resize` 디렉티브(`@/directives/resize`)로 컨테이너 리사이즈를 감지해 `evChart.resize()` 완료 후 브러시를 다시 그린다(`onResize`, debounce 0ms). keep-alive 복귀(`onActivated`) 시에도 마운트 완료 상태면 `onResize()` 를 실행한다.
- **옵션 정규화**: `useBrushModel().getNormalizedBrushOptions` 가 `defaultsDeep` 으로 기본값을 채운다 (`uses.js` `DEFAULT_OPTIONS`: show=true, useDebounce=true, chartIdx=0, height=100, showLabel=false, selection={fillColor:'#38ACEC', opacity:0.65}, useWheelMove=true).
- **데이터 갱신 추종**: `injectEvChartClone.data` 변경 watch 에서 대상 데이터를 `getNormalizedData` 로 정규화한 뒤 `cloneDeep` 하여 브러시 차트에 반영한다. series 구성이 바뀐 경우에만 `updateSeries: true` 로 업데이트한다.

## Business Rules

- `brushIdx.start > brushIdx.end` 이면 브러시 캔버스를 제거한다 (`init` 첫 가드). 그룹 초기값이 `{ start: 0, end: -1 }` 이므로 EvChartZoom 이 `setBrushIdx` 로 라벨 범위를 채우기 전에는 브러시가 그려지지 않는다.
- `chartIdx` 가 `injectEvChartClone.data` 의 범위를 벗어나면(`chartIdx > data.length - 1`) 브러시 캔버스를 제거하고 차트를 전체 데이터로 갱신한다 (`ChartBrush.vue` `watch(evChartOption)` else 분기).
- 최소 구간: BUTTON.DECREASE 는 `start === end - 1` 에서 중단한다(라벨 간격 1 미만으로 좁힐 수 없음). 렌더링상 브러시 렉트 폭은 버튼 폭(6px) 미만으로 줄지 않는다.
- WHEEL/GRAB 이동은 구간 폭을 유지하며 `start <= 0` 또는 `end >= labelEndIdx` 경계에서 중단한다 (`updateBrushIdx`).
- 경계 클램핑(`setBrushXAndWidth`): 버튼 모드는 렉트 폭을 줄여(`brushRectWidth` 조정) 캔버스 안에 고정하고, 그 외(grab 등)는 렉트 X 를 클램프해 폭을 유지한다. 폭이 캔버스 폭을 넘으면 캔버스 폭으로 잘린다.
- 드래그 감도(`moveSensitive`): debounce 모드에서는 0, 즉시 반영 모드(`useDebounce: false`)에서는 `axesXInterval / 3` (`mouseDownAndMove`).
- 드래그 중 mousemove/mouseup 은 document 레벨 리스너로 처리해 캔버스 밖으로 마우스가 나가도 드래그가 유지된다. mouseup 시 document 리스너를 해제하고 `initEventState` 로 상태를 초기화한다(재진입 가드 `isCleaningUp` 포함).
- 브러시 조작 플래그: 버튼 조작은 `brushIdx.isUseButton`, grab/휠/텔레포트는 `brushIdx.isUseScroll` 을 세운다. 이 플래그가 켜져 있는 동안 chart/uses.js 의 `useZoomModel` watch 가 `evChartZoom.executeZoom` 을 호출하고, EvChartZoom 은 자기 자신이 `brushIdx` 를 되쓰지 않는다(피드백 루프 차단). mouseup 시 플래그가 내려가면 줌 영역 메모리(`zoomAreaMemory`)가 갱신된다.
- 브러시 모드 EvChart 경량화: `options.brush` 가 있으면 chart.core 가 Tooltip·Interaction·Tip·Legend·Pie·Title·Scrollbar 믹스인과 overlayCanvas 를 생성하지 않고, wrapper 클래스를 `ev-chart-brush-wrapper`/`ev-chart-brush-container` 로 만든다.
- `showLabel: false`(기본값)이면 scale 렌더러(`scale/scale.js`, `scale.time.js`)가 `options.brush.showLabel` 을 보고 축 라벨 텍스트를 그리지 않는다.
- EvChartGroup 밖에서 단독 사용 시 inject 기본값(`evChartClone: { data: [] }` 등)으로 동작하므로 크래시는 없지만 표시할 데이터·줌 연동이 없다. 공식 문서는 EvChartGroup 내부 사용만 안내한다.
- [NEEDS CLARIFICATION: 공식 문서(docs/views/brushChart/api/brushChart.md)는 "브러쉬 사용 가능한 차트: Line Chart" 만 명시하나 chartBrush 코드에는 차트 타입 제한 로직이 없다 — 라인 차트 외 타입은 정책상 미보증인지, 실제 동작 제약이 있는지?]
- **이벤트 스로틀링**: 캔버스/document mousemove 는 throttle 5ms, wheel 조작 종료 감지는 debounce 100ms, 리사이즈 핸들러는 debounce 0ms(마이크로태스크 배칭)로 처리한다.
- **픽셀 정밀도**: 캔버스 크기·렉트 좌표는 `window.devicePixelRatio` 를 곱해 계산한다. 리사이즈 시 목표 폭이 기존과 같으면(`isEqualWidth`) 재그리기를 생략한다.
- **드래그 중 차트 무갱신**: debounce 모드에서는 드래그 중 메인 차트 업데이트가 발생하지 않고 브러시 캔버스 2D 렌더만 반복된다.

## Acceptance Criteria

- 빈 옵션 입력 시 기본값이 채워진다: show=true, useDebounce=true, chartIdx=0, height=100, showLabel=false, useWheelMove=true, selection={'#38ACEC', 0.65} (uses.spec.js로 검증).
- 사용자 옵션은 기본값을 덮어쓰고, `selection` 은 부분 지정 시 나머지 키가 기본값으로 딥 머지된다 (uses.spec.js로 검증).
- 그룹 툴바 dragZoom/리셋 또는 `zoomStartIdx`/`zoomEndIdx` 조작으로 줌이 실행되면 브러시 렉트가 해당 구간 위치·폭으로 다시 그려진다 (수동 QA).
- 브러시 좌/우 버튼을 드래그한 뒤 mouseup 하면 메인 차트가 브러시 구간으로 줌된다. `useDebounce: false` 면 드래그 중 실시간으로 줌된다 (수동 QA).
- 브러시 내부 grab 드래그·휠 스크롤·외부 클릭(텔레포트)은 구간 폭을 유지한 채 이동하며 0/마지막 라벨 경계를 넘지 않는다 (수동 QA).
- `useWheelMove: false` 이면 브러시 위 휠 스크롤로 구간이 이동하지 않는다 (수동 QA).
- 메인 차트 legend 로 시리즈를 숨기면 브러시 미니 차트에서도 해당 시리즈가 숨겨진다 (수동 QA).
- 컨테이너 리사이즈 및 keep-alive 복귀 시 브러시 캔버스가 새 차트 영역에 맞게 재계산된다 (수동 QA).

## Architecture

```
┌─ EvChartGroup ──────────────────────────────────────────────────┐
│  provide: evChartClone / evChartInfo / brushIdx / brushSeries    │
│                                                                  │
│  ┌─ EvChart(메인) ─────────┐      ┌─ EvChartZoom ─────────────┐ │
│  │ legend 클릭 → brushSeries│◄────►│ executeZoom ↔ brushIdx    │ │
│  └─────────────────────────┘      └───────────▲───────────────┘ │
│                                               │ (반응형 상태만) │
│  ┌─ EvChartBrush(ChartBrush.vue) ─────────────┼────────────────┐│
│  │ inject 4종 ──► evChartOption/evChartData 계산               ││
│  │  ┌─ EvChart(chart.core, brush 모드) ────────────────────┐   ││
│  │  │ .ev-chart-brush-wrapper > .ev-chart-brush-container   │   ││
│  │  │ displayCanvas (미니 차트, overlayCanvas 없음)         │   ││
│  │  └──────────────────────────────────────────────────────┘   ││
│  │  ┌─ EvChartBrush(chartBrush.core) ──────────────────────┐   ││
│  │  │ .brush-canvas (선택 렉트+버튼, z-index:1)             │   ││
│  │  │ mouse/wheel/document 이벤트 → brushIdx 갱신           │   ││
│  │  └──────────────────────────────────────────────────────┘   ││
│  └──────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────┘
```

- ChartBrush.vue 는 메인 차트 인스턴스를 직접 참조하지 않는다. 결합은 오직 EvChartGroup 이 provide 한 반응형 객체 4종(`evChartClone`, `evChartInfo`, `brushIdx`, `brushSeries`)을 통해서만 이뤄진다.
- 미니 차트(chart.core 의 EvChart)와 브러시 렌더러(chartBrush.core 의 EvChartBrush)는 별개 클래스로, EvChartBrush 는 미니 차트의 `chartRect`/`labelOffset` 을 읽어 캔버스를 배치한다.
- onMounted/onUpdated 에서 `createChart → drawChart(init) → createChartBrush → drawChartBrush(init)` 순서로 (재)생성한다. [NEEDS CLARIFICATION: onUpdated 에서 기존 EvChart/EvChartBrush 인스턴스를 destroy 하지 않고 재생성한다 — 이전 인스턴스 정리를 `watch(evChartOption)` 의 `removeBrushWrapper` 경로에 의존하는 구조가 의도인지?]

## File Structure

| 파일 | 역할 |
|------|------|
| ChartBrush.vue | 컴포넌트 본체. inject 4종 수신, 브러시용 차트 옵션/데이터 계산(computed), EvChart·EvChartBrush 생성/갱신/파기 라이프사이클, 리사이즈·keep-alive 처리 |
| chartBrush.core.js | 브러시 렌더러 클래스(EvChartBrush). `.brush-canvas` 생성/렌더, 마우스·휠·document 이벤트 처리, 픽셀↔인덱스 환산, `brushIdx` 갱신 |
| uses.js | `useBrushModel` composable — 브러시 옵션 기본값 정규화(`getNormalizedBrushOptions`) |
| index.js | Vue 플러그인 등록 (`app.component('EvChartBrush', ...)`) |

## Dependencies

| 대상 | 용도 |
|------|------|
| chartGroup (EvChartGroup) | 필수 부모. `evChartClone`(원본 데이터/옵션 클론), `evChartInfo`(그룹 내 차트 props·DOM), `brushIdx`(줌 구간 상태 + isUseButton/isUseScroll 플래그), `brushSeries`(legend 토글 동기화)를 provide 한다. 이 4종 inject 가 chart 인스턴스 접근을 대체한다 — 메인 차트 객체 자체는 주입되지 않는다 |
| chart/chart.core.js (EvChart) | 브러시 미니 차트 렌더러. `options.brush` 존재 시 경량 모드(믹스인·overlayCanvas 미장착, brush 전용 wrapper 클래스)로 동작 |
| chart/uses.js (`useModel`, `useWrapper`) | 데이터/옵션 정규화(`getNormalizedData`/`getNormalizedOptions`), wrapper ref·스타일 재사용 |
| chart/uses.js (`useZoomModel`) + chart/chartZoom.core.js (EvChartZoom) | 직접 import 하지 않는 간접 의존. 그룹 쪽에서 `brushIdx` watch → `executeZoom` 으로 메인 차트를 줌하고, 줌 실행이 `brushIdx` 를 되써서 브러시에 반영한다 |
| chart/scale/*.js | `options.brush.showLabel` 을 읽어 브러시 차트의 축 라벨 표시 여부를 결정 |
| @/directives/resize | `v-resize` 컨테이너 리사이즈 감지 |
| lodash-es | `cloneDeep`/`debounce`/`isEqual`(ChartBrush.vue), `throttle`/`debounce`(core), `defaultsDeep`(uses.js) |

## Glossary

| 용어 | 정의 |
|------|------|
| brushIdx | 그룹이 provide 하는 반응형 줌 구간 상태 `{ start, end, isUseButton, isUseScroll }`. 라벨 인덱스 기준. 브러시와 EvChartZoom 의 단일 공유 상태 |
| 브러시 렉트 | `.brush-canvas` 에 그려지는 반투명 선택 사각형. 좌우 끝에 6px 리사이즈 버튼 포함 |
| grab 모드 | 브러시 내부를 잡고 폭 유지 이동하는 드래그 모드 (`isDragMode === 'grab'`) |
| 버튼 모드 | 좌/우 버튼을 잡고 구간을 확대/축소하는 드래그 모드 (`isDragMode === 'button'`) |
| 텔레포트 | 브러시 밖 클릭 시 구간 폭을 유지한 채 클릭 지점 중심으로 점프 이동 (`teleportBrush`) |
| debounceBrushIdx | `useDebounce: true` 일 때 드래그 중 임시로 쓰는 내부 인덱스. mouseup 시 `brushIdx` 로 커밋 |
| labelEndIdx | 브러시 차트 데이터의 마지막 라벨 인덱스 (`labels.length - 1`). 이동/확장의 상한 |
| axesXInterval | 라벨 1칸의 픽셀 폭. 픽셀↔인덱스 환산과 감도 계산의 기준 |

## Data Flow

```
[브러시 → 메인 차트]
브러시 캔버스 mouse/wheel 조작
    │  (버튼: isUseButton, grab/휠/텔레포트: isUseScroll 플래그 on)
    ▼
useDebounce=true ─► debounceBrushIdx 갱신 + 캔버스만 재렌더
    │                   └─ mouseup/휠정지 ─► updateBrushIdxUseXPos ─► brushIdx 커밋(1회)
useDebounce=false ─► updateBrushIdx ─► brushIdx 즉시 갱신
    ▼
chart/uses.js useZoomModel watch([brushIdx.start, end])
    ▼
EvChartZoom.executeZoom ─► evChartInfo 차트 데이터 슬라이스 ─► 메인 차트 줌 렌더
    └─ 플래그 off 전환 시 zoomAreaMemory 갱신

[메인 차트/줌 → 브러시]
툴바 줌·dragSelection·zoomStartIdx/EndIdx props
    ▼
EvChartZoom.executeZoom (isUseButton/isUseScroll 이 false 일 때만 brushIdx 되씀)
    ▼
ChartBrush.vue watch([brushIdx.start, end]) ─► drawChartBrush ─► 렉트 재렌더

[데이터/시리즈 동기화]
부모 차트 data 변경 ─► setDataForUseZoom ─► evChartClone.data 갱신
    ─► ChartBrush watch ─► getNormalizedData + show 상태 병합 ─► 미니 차트 update
메인 차트 legend 클릭 ─► chart.core 가 brushSeries.list/chartIdx 갱신
    ─► ChartBrush watch ─► 미니 차트 seriesList 교체 ─► update
```
