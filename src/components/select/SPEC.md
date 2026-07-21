# Select (EvSelect) — 드롭다운 선택

## Purpose

단일/다중 선택 드롭다운 컴포넌트. 검색(필터), 체크박스 다중선택, 전체선택, 선택 태그 접기(collapseTags), 초기화(clearable)를 지원한다. `modelValue`(v-model) 는 선택 형태에 따라 boolean/string/number/array/object 를 모두 허용한다.

## Features

- **선택**: `modelValue`(v-model) — 단일 또는 다중(`multiple`). `change` emit.
- **아이템**: `items`(Array) 로 옵션 목록 제공.
- **검색/필터**: `filterable`·`filterText`·`searchPlaceholder`·`noMatchingText`("NO MATCHING DATA").
- **다중/체크박스**: `multiple`·`checkable` — 체크박스형 다중 선택.
- **전체선택**: `allCheckLabel`("Select All") — 다중 모드 전체 선택.
- **태그 접기**: `collapseTags` — 선택 태그가 많을 때 접어 표시.
- **초기화**: `clearable` — 선택 해제 아이콘(`isClearableIcon`).
- **상태**: `disabled`·`placeholder`.

## Business Rules

- 다중 선택 시 `modelValue` 는 배열, 단일 선택 시 원시값/객체.
- 드롭박스 위치(`dropboxPosition`)는 뷰포트 기준으로 계산되어 열림 방향을 결정한다.
- 필터 미매칭 시 `noMatchingText` 를 표시한다.

## Acceptance Criteria

- `multiple=true` 에서 여러 항목 선택 시 `modelValue` 가 배열로 갱신되고 `change` 를 emit 한다.
- `filterable=true` 에서 검색어로 목록이 필터된다.
- `clearable=true` 에서 초기화 아이콘 클릭 시 선택이 비워진다.

## Architecture

```
EvSelect (useModel + 드롭박스 로직)
├── select (선택 표시 · 태그 · clear 아이콘)
└── dropbox (itemWrapper: 아이템 목록 · 검색 · 전체선택)
```

## File Structure

| 파일 | 역할 |
|------|------|
| Select.vue | EvSelect SFC — props/emits, useModel(선택값), 드롭박스 위치/토글 |
| index.js | Vue 플러그인 등록 |
| style/ | 스타일 |

## Dependencies

| 대상 | 용도 |
|------|------|
| (브라우저) 위치 계산 | 드롭박스 열림 방향 |

## Glossary

| 용어 | 정의 |
|------|------|
| collapseTags | 다중 선택 태그를 접어 요약 표시 |
| dropboxPosition | 드롭다운이 열리는 위치/방향 |

## Data Flow

```
props.modelValue ──useModel──> selectedModel
검색 ──filterText──> 아이템 필터
선택/해제 ──changeMv/removeMv/removeAllMv──> emit(update:modelValue, change)
```
