# Grid (EvGrid) — 가상 스크롤 데이터 그리드

## Purpose

대량 행 데이터를 가상 스크롤로 렌더링하는 데이터 그리드. 정렬·필터·페이지네이션·컬럼 리사이즈/순서변경/표시설정·행 선택·체크박스·행 확장(expand)·요약(summary)·컨텍스트 메뉴를 제공한다. 이벤트별 관심사를 `uses.js` 의 컴포저블 팩토리로 분해해 `Grid.vue` `setup` 에서 조합한다.

## Features

- **가상 스크롤**: 세로/가로 가상 스크롤(`scrollEvent` — `updateVScrollBase`/`updateVScroll`/`updateHScroll`/`onScroll`)로 보이는 행만 렌더.
- **행 선택**: `selected`(v-model) 단일/다중 행 선택. `clickEvent.onRowClick`(좌/우클릭 구분), `onRowDblClick`.
- **체크박스**: `checked`(v-model)·`uncheckable`. `checkEvent.onCheck`/`onCheckAll`/`unCheckedRow`.
- **행 확장**: `expanded`(v-model). `expandEvent.onExpanded`.
- **정렬**: `sortEvent` — 다중 컬럼 정렬(`OrderQueue`), init/asc/desc 순환, `setSort`/`onSort`.
- **필터**: `filterEvent` — 문자열/숫자/불리언 필터(`stringFilter`/`numberFilter`/`booleanFilter`), `findLike`, `onSearch` 검색.
- **페이지네이션**: `pagingEvent` + `GridPagination`.
- **컬럼 리사이즈/순서/표시설정**: `resizeEvent.onColumnResize`/`calculatedColumn`/`onResize`, `GridColumnSetting`. `resize-column`/`change-column-order`/`change-column-status`/`change-column-info` emit.
- **요약 행**: `option.useSummary` → `GridSummary`.
- **컨텍스트 메뉴**: `contextMenuEvent`.
- **커스텀 렌더러**: `column.render.use` 시 `isRenderer`/`getComponentName` 로 셀 커스텀 컴포넌트 렌더.

## Business Rules

- 행 데이터는 내부적으로 인덱스 슬롯 구조로 관리된다: ROW_CHECK_INDEX=1, ROW_DATA_INDEX=2, ROW_SELECT_INDEX=3, ROW_EXPAND_INDEX=4, ROW_DISABLED_INDEX=6.
- 정렬은 `OrderQueue` 로 다중 컬럼 순서를 유지하며 init 타입은 정렬 해제를 의미한다.
- 컬럼 표시설정(`getUpdatedColumns`)은 stores 기준으로 baseColumns 를 필터링해 재구성한다.
- `option.adjust` 시 컬럼 너비를 그리드 너비에 맞춰 조정한다.
- 가상 스크롤로 대량 행에서도 DOM 노드를 보이는 영역으로 제한한다.

## Acceptance Criteria

- 화면 밖 행은 DOM 에 렌더되지 않고 스크롤 시 갱신된다.
- 헤더 체크박스 클릭 시 필터된 표시 행 기준으로 전체 체크/해제된다.
- 컬럼 헤더 정렬 클릭이 asc→desc→init 순으로 순환하고 `sort-column` 을 emit 한다.

## Architecture

```
EvGrid (Grid.vue setup: 컴포저블 조합)
├── GridToolbar / (ColumnSetting, FilterSetting)
├── header (정렬·리사이즈·컨텍스트메뉴)
├── body (가상 스크롤 행 · 셀 렌더러/체크박스/확장)
├── GridSummary   (option.useSummary)
└── GridPagination (pagingEvent)

uses.js: commonFunctions · scrollEvent · resizeEvent · clickEvent · checkEvent
         · expandEvent · sortEvent · filterEvent · contextMenuEvent · pagingEvent
         · getUpdatedColumns
```

## File Structure

| 파일 | 역할 |
|------|------|
| Grid.vue | EvGrid SFC — props/emits, 컴포저블 조합, 가상 스크롤/렌더 |
| uses.js | 이벤트별 컴포저블 팩토리(scroll/resize/click/check/expand/sort/filter/contextMenu/paging) + commonFunctions + getUpdatedColumns |
| GridColumnSetting.vue | 컬럼 표시/순서 설정 패널 |
| GridFilterSetting.vue | 필터 설정 패널 |
| GridPagination.vue | 페이지네이션 (treeGrid 도 재사용) |
| GridSummary.vue | 요약 행 (treeGrid 도 재사용) |
| GridToolbar.vue | 툴바 |
| icon/ | 정렬 버튼 등 아이콘 |
| index.js | Vue 플러그인 등록 |
| style/ | 그리드 스타일 |

## Dependencies

| 대상 | 용도 |
|------|------|
| `@/directives/resize` | 컬럼/그리드 리사이즈 감지 |
| vue3-observe-visibility | 가시성 관찰(가상 스크롤) |
| lodash-es | 유틸(정렬/필터/clone 등) |
| (역방향) treeGrid | GridPagination/GridSummary/GridColumnSetting/GridSortButton 를 재사용 |

## Glossary

| 용어 | 정의 |
|------|------|
| OrderQueue | 다중 컬럼 정렬 순서를 유지하는 큐 |
| renderer | `column.render.use` 로 지정하는 셀 커스텀 컴포넌트 |
| vScroll/hScroll | 세로/가로 가상 스크롤 상태 |

## Data Flow

```
props(columns/rows/option) ──> setup 컴포저블 조합
     │
스크롤 ──scrollEvent──> updateVScroll/updateHScroll ──> 보이는 행만 렌더
정렬/필터 ──sort/filterEvent──> 표시 데이터 재구성 ──> emit(sort-column) / v-model
체크/선택/확장 ──check/click/expandEvent──> emit(update:checked/selected/expanded)
컬럼 조작 ──resizeEvent──> emit(resize-column/change-column-*)
```
