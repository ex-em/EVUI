# Tree (EvTree) — 트리 뷰

## Purpose

계층 데이터를 트리로 표시하는 컴포넌트. 노드 확장/접기, 체크박스(부모-자식 연동), 검색, 컨텍스트 메뉴, 클릭/더블클릭 선택을 지원한다. 그리드가 아닌 순수 트리 뷰이며, 노드 상태를 `allNodeInfo` 로 평탄화해 관리한다.

> **공식 API**: [docs/views/tree/api/tree.md](../../../docs/views/tree/api/tree.md)

## Features

- **트리 렌더**: `data`(Array) 를 재귀 노드(`TreeNode`)로 렌더. 빈 데이터는 `emptyText`("No Data").
- **확장/접기**: `expandIcon`/`collapseIcon` 으로 토글 아이콘 지정.
- **체크박스**: `useCheckbox` — 부모-자식 연동 체크. `updateTreeUp`(자식→부모 전파). `check`(Array) emit.
- **검색**: `searchWord`·`searchIncludeChildren` — 검색 매칭 시 자식 포함 여부.
- **컨텍스트 메뉴**: `contextMenuItems` — 우클릭 메뉴.
- **선택**: 노드 클릭/더블클릭 — `click-node`/`dblclick-node` emit.

## Business Rules

- 노드 상태는 `allNodeInfo` 배열에 평탄화되어 각 노드의 parent 키로 상위 탐색(`updateTreeUp`)이 가능하다.
- **[NEEDS CLARIFICATION]** `data` 는 배열이고 템플릿은 `v-for` 로 모든 루트를 렌더하지만, `allNodeInfo` 는 첫 루트(`treeNodeData[0]`)의 서브트리만 평탄화한다(Tree.vue:150-151, watch 재구성도 동일). 다중 루트 데이터에서 두 번째 이후 루트는 `allNodeInfo` 기반 상향 탐색·체크 전파·검색 대상에서 빠진다 — 다중 루트 공식 지원 여부 확인 필요.
- 체크박스 사용 시 자식 체크 변화가 부모로 전파된다(`updateTreeUp`).
- `searchIncludeChildren=true` 면 검색 매칭 노드의 자식도 표시에 포함한다.
- 내부적으로 `TreeNode` 컴포넌트를 재귀 사용한다.

## Acceptance Criteria

- 부모 노드 토글 시 자식이 펼쳐지고/접힌다.
- `useCheckbox` 에서 자식 전체 체크 시 부모가 체크 상태로 갱신된다.
- 노드 클릭 시 `click-node` 를 emit 한다.

## Architecture

```
EvTree (allNodeInfo 평탄화 + contextMenu)
└── TreeNode (재귀) — 확장/접기 · 체크박스 · 라벨
```

## File Structure

| 파일 | 역할 |
|------|------|
| Tree.vue | EvTree SFC — props/emits, allNodeInfo 관리, updateTreeUp, 컨텍스트 메뉴 |
| index.js | Vue 플러그인 등록 |

## Dependencies

| 대상 | 용도 |
|------|------|
| TreeNode (내부) | 재귀 노드 렌더 |
| contextMenu | 우클릭 메뉴(contextMenuItems) |

> `src/common/utils.tree.js` 는 사용하지 않는다 — 트리 상태를 자체 `allNodeInfo` 로 관리한다.

## Glossary

| 용어 | 정의 |
|------|------|
| allNodeInfo | 첫 루트(`treeNodeData[0]`)의 서브트리를 평탄화해 parent/node 를 담는 배열 (다중 루트 미포함 — Business Rules 참조) |
| updateTreeUp | 자식 상태 변화를 부모로 전파하는 상향 갱신 |

## Data Flow

```
props.data ──> treeNodeData ──> allNodeInfo(첫 루트 서브트리 평탄화)
노드 토글/체크 ──updateTreeUp──> 부모 상태 갱신 ──emit(check)
클릭 ──emit(click-node/dblclick-node)
검색(searchWord) ──> 매칭 노드(+자식) 표시
```
