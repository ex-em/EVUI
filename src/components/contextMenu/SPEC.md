# ContextMenu (EvContextMenu) — 컨텍스트 메뉴

## Purpose

우클릭(또는 클릭)으로 표시되는 컨텍스트 메뉴. 메뉴 항목(`items`)을 받아 위치에 팝업으로 렌더한다. grid/treeGrid/tree 등에서 우클릭 메뉴로 소비된다.

## Features

- **메뉴 항목**: `items`(Array) — 메뉴 항목 정의(라벨/클릭 핸들러/서브메뉴 등).
- **표시 트리거**: `isShowMenuOnClick` — 우클릭 대신 클릭으로 표시할지.
- **커스텀 스타일**: `customClass`.

## Business Rules

- 메뉴는 트리거 이벤트 위치를 기준으로 팝업 위치를 계산한다.
- `isShowMenuOnClick=false`(기본) 면 contextmenu(우클릭) 이벤트로 표시.

## Acceptance Criteria

- 대상 영역 우클릭 시 `items` 로 구성된 메뉴가 해당 위치에 표시된다.
- 항목 클릭 시 해당 항목의 동작이 실행되고 메뉴가 닫힌다.

## Architecture

```
EvContextMenu — items 기반 팝업 메뉴 (트리거 위치에 렌더)
```

## File Structure

| 파일 | 역할 |
|------|------|
| ContextMenu.vue | EvContextMenu SFC — items 렌더, 위치 계산, 표시/숨김 |
| index.js | Vue 플러그인 등록 |

## Dependencies

| 대상 | 용도 |
|------|------|
| (역방향 소비자) grid/treeGrid/tree | 우클릭 메뉴로 사용 |

> `menu` 컴포넌트와는 독립이다 — contextMenu 는 menu 를 import 하지 않는다.

## Glossary

| 용어 | 정의 |
|------|------|
| items | 컨텍스트 메뉴 항목 목록 |

## Data Flow

```
우클릭/클릭 ──> 위치 계산 ──> items 렌더 ──> 항목 선택 시 동작 실행 + 닫힘
```
