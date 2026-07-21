# ChartGroup (EvChartGroup) — 차트 그룹 동기화

## Purpose

여러 개의 `EvChart` 를 하나의 그룹으로 묶어 **줌 범위·브러시·hover·선택 라벨을 동기화**하는 래퍼 컴포넌트. `provide/inject` 로 그룹 상태를 자식 차트에 내려보내, 자식들이 공통 zoom 인덱스와 상호작용 상태를 공유하게 한다. 그룹 전용 줌 툴바(previous/latest/reset/dragZoom)를 옵션으로 제공한다.

> **공식 API**: [docs/views/zoomChart/api/zoomChart.md](../../../docs/views/zoomChart/api/zoomChart.md) — zoomChart 예제 페이지(EvChartGroup)

## Features

- **그룹 줌 동기화**: `zoomStartIdx`/`zoomEndIdx`(v-model) 로 그룹 전체 차트의 표시 인덱스 범위를 일괄 제어. `chart/uses` 의 `useZoomModel` 에 위임한다.
- **줌 툴바**: `options.zoom.toolbar.show` 가 true 면 `EvChartToolbar` 를 렌더. items = previous/latest/reset/dragZoom. 클릭 시 `onClickToolbar` 처리.
- **브러시 동기화**: `brushSeries`(reactive `{ list, chartIdx }`)·`brushIdx` 를 provide 하여 자식 차트 간 브러시 선택을 공유.
- **hover 동기화**: `options.syncHover` 가 true 면 `groupHoveredLabel` 을 활성화(`{ label:'', horizontal:false }`)하여 자식 차트 간 hover 위치를 공유. false 면 null.
- **선택 라벨 동기화**: `groupSelectedLabel`(v-model) 을 computed 로 감싸 provide → 자식이 공유 선택 상태를 읽고 쓴다.
- **폴링 redraw 양보**: `deferPollingRedraw(durationMs=800)` 를 provide + expose. 자식 차트 클릭으로 detail/popup 을 열 때 호출하면, `groupInteraction.deferUntil` 타임스탬프까지 그룹 폴링 재렌더를 미뤄 사용자가 연 화면이 먼저 페인트되게 한다(one-shot, 상한 `MAX_DEFER_MS=2000`).

## Business Rules

- 줌 옵션은 `getNormalizedOptions` 가 `defaultsDeep({}, options, DEFAULT_OPTIONS)` 로 누락 키만 병합해 새 객체로 생성한다(props 원본 비오염).
- `deferUntil` 은 절대 타임스탬프이며, 반복 호출로 무한 연장되지 않도록 `now + MAX_DEFER_MS` 로 상한한다. resume API 없이 시간창 경과 시 자동 재개된다.
- 시계는 `performance.now()`(가용 시) 또는 `Date.now()` 로 통일 — Chart.vue `scheduleUpdate` 와 동일 기준.
- `zoomStartIdx`/`zoomEndIdx` 변경 시 브러시 버튼/스크롤 사용 중(`brushIdx.isUseButton || isUseScroll`)이면 `controlZoomIdx` 를 건너뛴다.
- 그룹 폴링 redraw 는 detail/popup 오픈 시 최대 2초까지만 양보하며, 양보 중에도 라이브 갱신은 계속된다(무기한 정지 금지).

## Acceptance Criteria

- `options.zoom.toolbar.show=true` 면 상단에 줌 툴바가 렌더된다.
- 그룹 내 한 차트에서 줌하면 `zoomStartIdx`/`zoomEndIdx` 가 emit 되고 다른 차트도 같은 범위로 갱신된다.
- `options.syncHover=true` 면 한 차트 hover 시 다른 차트에 동기 hover 가 표시된다.

## Architecture

```
EvChartGroup
├── (opt) EvChartToolbar        # 줌 툴바 (previous/latest/reset/dragZoom)
└── <slot/>                      # 자식 EvChart 들
    provide → isExecuteZoom, isChartGroup, brushSeries, evChartPropsInGroup,
              groupInteraction, deferPollingRedraw, groupSelectedLabel,
              groupHoveredLabel, evChartClone, evChartInfo, brushIdx
```

## File Structure

| 파일 | 역할 |
|------|------|
| ChartGroup.vue | EvChartGroup SFC — props/emits, provide 배선, watch(옵션/데이터/줌인덱스), 줌 생성 |
| uses.js | `useGroupModel` — 그룹 상태(isExecuteZoom, brushSeries, evChartPropsInGroup, groupInteraction) + `getNormalizedOptions` + `DEFAULT_OPTIONS` |
| index.js | Vue 플러그인 등록 |
| style/chartGroup.scss | 그룹 래퍼 스타일 |

## Dependencies

| 대상 | 용도 |
|------|------|
| `../chart/uses` `useZoomModel` | 줌 인덱스 계산·툴바 동작·데이터/옵션 반영 (줌 로직 본체) |
| `../chart/ChartToolbar` (EvChartToolbar) | 줌 툴바 UI |
| 자식 `EvChart` | provide 된 그룹 상태를 inject 하여 동기화 (역방향 소비) |
| lodash-es `defaultsDeep` | 옵션 기본값 병합 |

## Glossary

| 용어 | 정의 |
|------|------|
| deferUntil | 이 시각까지 그룹 폴링 재렌더를 미루는 절대 타임스탬프 |
| brushSeries | 그룹 내 공유 브러시 선택 상태 `{ list, chartIdx }` |
| evChartPropsInGroup | 그룹에 속한 자식 차트들의 props 참조 배열 |

## Data Flow

```
props.options ──getNormalizedOptions──> normalizedOptions ──> useZoomModel
     │                                                              │
자식 차트 zoom/brush 이벤트                                    createEvChartZoom(onMounted)
     │                                                              │
provide(groupInteraction/brushSeries/...) <──동기화── 자식 EvChart(inject)
     │
watch(zoomStartIdx/zoomEndIdx) ──controlZoomIdx──> 그룹 표시 범위 갱신
```
