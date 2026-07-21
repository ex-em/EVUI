# TreeGrid (EvTreeGrid) — 트리 구조 데이터 그리드

## Purpose

계층(트리) 구조 데이터를 가상 스크롤로 렌더링하는 그리드. `EvGrid` 의 하위 UI 컴포넌트(페이지네이션·요약·컬럼설정·정렬버튼)를 **재사용**하되, 트리 특화 로직(노드 확장/접기, 부모-자식 연동 체크, 트리 필터)은 **독립 구현(`uses.js`)** 한다. 정렬·필터·페이지네이션·컬럼 리사이즈/표시설정·행 선택/체크·컨텍스트 메뉴를 제공한다.

## Features

- **트리 노드 렌더**: `TreeGridNode` 로 계층 행을 렌더. `expandIcon`/`collapseIcon` prop 으로 토글 아이콘 지정.
- **노드 확장/접기**: `treeEvent` — `setTreeNodeStore`/`setExpandNode`/`handleExpand`. `toggle-row` emit.
- **부모-자식 연동 체크**: `checkEvent` — `onCheckChildren`(부모 체크 시 자식 전파)/`onCheckParent`(자식 상태로 부모 갱신). `checkInfo.useCheckbox.mode` = 'each' 여부(`isEachMode`)로 연동 방식 분기.
- **트리 필터**: `filterEvent` — `makeParentShow`/`makeChildShow` 로 매칭 노드의 조상/자손 표시 처리, `onSearch`.
- **가상 스크롤**: `scrollEvent`(updateVScroll/updateHScroll/onScroll).
- **행 선택**: `selected`(v-model), `clickEvent.onRowClick`/`onRowDblClick`.
- **정렬**: `sortEvent`(OrderQueue 기반) — grid 와 동형.
- **페이지네이션**: `pagingEvent` + 재사용 `GridPagination`.
- **컬럼 리사이즈/표시설정/컨텍스트메뉴**: `resizeEvent`, `contextMenuEvent`(`onColumnContextMenu`/`onGridSettingContextMenu`), 재사용 `ColumnSetting`.

## Business Rules

- `rows` 는 `[Array, Object]` 를 허용(기본 null) — 트리 루트가 객체 또는 배열 형태 모두 가능.
- 체크 모드가 'each' 가 아니면 부모 체크가 자손으로 전파되고, 자식 체크 상태 변화가 부모로 역전파된다.
- 필터 시 매칭 노드의 부모(조상)를 표시(`makeParentShow`)하고 자식(자손)을 표시(`makeChildShow`)하여 계층 맥락을 보존한다.
- 컬럼 표시설정(`getUpdatedColumns`)·정렬(OrderQueue)은 grid 와 동일 규약을 따른다.

## Acceptance Criteria

- 부모 노드 토글 시 자식 노드가 펼쳐지고/접히며 `toggle-row` 를 emit 한다.
- (mode≠each) 부모 체크 시 모든 자손이 체크되고, 자손 부분 체크 시 부모가 indeterminate/해제로 반영된다.
- 검색어 매칭 노드의 조상 경로가 함께 표시된다.

## Architecture

```
EvTreeGrid (TreeGrid.vue setup: 컴포저블 조합)
├── TreeGridNode        # 계층 행 렌더 (자체)
├── TreeGridToolbar     # 툴바 (자체)
├── GridPagination      # ← grid 재사용
├── GridSummary         # ← grid 재사용
├── GridColumnSetting   # ← grid 재사용
└── GridSortButton(icon)# ← grid 재사용

uses.js(독립): commonFunctions · getUpdatedColumns · scrollEvent · resizeEvent
              · clickEvent · checkEvent(onCheckChildren/Parent) · contextMenuEvent
              · treeEvent · filterEvent · pagingEvent · sortEvent
```

## File Structure

| 파일 | 역할 |
|------|------|
| TreeGrid.vue | EvTreeGrid SFC — props/emits, 컴포저블 조합, 가상 스크롤 |
| TreeGridNode.vue | 계층 노드(행) 렌더 |
| TreeGridToolbar.vue | 툴바 |
| uses.js | 트리 특화 이벤트 컴포저블(treeEvent/부모자식 체크/트리 필터) — grid 와 독립 구현 |
| icon/ | 아이콘 |
| index.js | Vue 플러그인 등록 |
| style/ | 스타일 |

## Dependencies

| 대상 | 용도 |
|------|------|
| `../grid/GridPagination` | 페이지네이션 UI 재사용 |
| `../grid/GridSummary` | 요약 행 재사용 |
| `../grid/GridColumnSetting.vue` | 컬럼 설정 패널 재사용 |
| `../grid/icon/icon-sort-button` | 정렬 버튼 아이콘 재사용 |
| `@/directives/resize` | 리사이즈 감지 |
| vue3-observe-visibility | 가시성 관찰(가상 스크롤) |
| lodash-es `cloneDeep` | 트리 데이터 복제 |

> uses.js(이벤트 로직)는 grid 와 별개의 독립 구현이다 — grid/uses.js 를 import 하지 않고, 트리 계층 처리를 위해 자체 작성됨. UI 하위 컴포넌트만 grid 것을 재사용한다.

## Glossary

| 용어 | 정의 |
|------|------|
| each 모드 | 부모-자식 체크 연동을 하지 않고 노드별 독립 체크하는 모드 |
| makeParentShow/makeChildShow | 필터 매칭 노드의 조상/자손을 표시 처리하는 함수 |
| treeEvent | 노드 store 구성·확장/접기 컴포저블 |

## Data Flow

```
props(columns/rows/option) ──> setup 컴포저블 조합 ──treeEvent.setTreeNodeStore──> 트리 노드 store
     │
노드 토글 ──handleExpand/setExpandNode──> 표시 노드 갱신 ──emit(toggle-row)
체크 ──onCheckChildren/onCheckParent──> 부모-자식 연동 ──emit(update:checked/check-row)
검색 ──makeParentShow/makeChildShow──> 계층 유지 필터 표시
```
