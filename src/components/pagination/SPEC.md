# Pagination (EvPagination) — 페이지네이션

## Purpose

페이지 이동 컨트롤. 전체 개수·페이지당 개수로 페이지 수를 계산하고, 표시 페이지 버튼 수·점프 단위·페이지 정보 표시·정렬(정렬 방향)을 지원한다.

## Features

- **현재 페이지**: `modelValue`(v-model) — 현재 페이지. `update:modelValue`·`change` emit.
- **페이지 계산**: `total`(전체 개수)·`perPage`(페이지당 개수)로 총 페이지 수 산출.
- **표시 버튼**: `visiblePage` — 한 번에 보이는 페이지 버튼 수.
- **점프**: `pagePerJump` — 이전/다음 점프 시 이동할 페이지 수.
- **정보/정렬**: `showPageInfo`(현재/전체 표시)·`order`(정렬 = flex justify-content).

## Business Rules

- 총 페이지 수 = ceil(`total` / `perPage`).
- `order` 는 컨테이너의 `justify-content` 값으로 사용되어 페이지 컨트롤 정렬을 결정한다.
- 페이지 변경 시 `update:modelValue` 와 `change` 를 모두 emit 한다.

## Acceptance Criteria

- 페이지 버튼 클릭 시 `update:modelValue`/`change` 를 해당 페이지 번호로 emit 한다.
- `total`/`perPage` 에 맞춰 총 페이지 수와 버튼이 렌더된다.
- `showPageInfo=true` 에서 현재/전체 정보가 표시된다.

## Architecture

```
EvPagination
├── (이전/점프) 버튼
├── 페이지 번호 버튼 (visiblePage 개)
├── (다음/점프) 버튼
└── (showPageInfo) 페이지 정보
```

## File Structure

| 파일 | 역할 |
|------|------|
| Pagination.vue | EvPagination SFC — props/emits, 페이지 계산·이동 |
| index.js | Vue 플러그인 등록 |

## Dependencies

| 대상 | 용도 |
|------|------|
| `@/components/icon` (EvIcon), `./pageButton` | 이전/다음/점프 아이콘·페이지 버튼 렌더 (grid/treeGrid 는 별도 GridPagination 사용) |

## Glossary

| 용어 | 정의 |
|------|------|
| visiblePage | 한 번에 표시하는 페이지 버튼 개수 |
| pagePerJump | 점프 버튼 클릭 시 이동 페이지 수 |

## Data Flow

```
props(total/perPage) ──> 총 페이지 계산
버튼 클릭 ──> 페이지 번호 ──emit(update:modelValue, change)
```
