# Select (EvSelect) — 드롭다운 선택

## Purpose

단일/다중 선택 드롭다운 컴포넌트. 검색(필터), 체크박스 다중선택, 전체선택, 선택 태그 접기(collapseTags), 초기화(clearable)를 지원한다. `modelValue`(v-model) 는 선택 형태에 따라 boolean/string/number/array/object 를 모두 허용한다.

> **공식 API**: [docs/views/select/api/select.md](../../../docs/views/select/api/select.md)

## Features

- **선택**: `modelValue`(v-model) — 단일 또는 다중(`multiple`). `change` emit.
- **아이템**: `items`(Array) 로 옵션 목록 제공.
- **검색/필터**: `filterable`·`filterText`·`searchPlaceholder`·`noMatchingText`("NO MATCHING DATA").
- **검색어 강조**: `highlight`(Object) — `match`(Boolean, 기본 false) 검색어 매칭 구간 강조 여부, `color`(String, 기본 '') 강조 색상.
- **다중/체크박스**: `multiple`·`checkable` — 체크박스형 다중 선택.
- **전체선택**: `allCheckLabel`("Select All") — 다중 모드 전체 선택.
- **태그 접기**: `collapseTags` — 선택 태그가 많을 때 접어 표시.
- **초기화**: `clearable` — 선택 해제 아이콘(`isClearableIcon`).
- **상태**: `disabled`·`placeholder`.

## Business Rules

- 다중 선택 시 `modelValue` 는 배열, 단일 선택 시 원시값/객체.
- 드롭박스 위치(`dropboxPosition`)는 뷰포트 기준으로 계산되어 열림 방향을 결정한다.
- 필터 미매칭 시 `noMatchingText` 를 표시한다.
- 검색 필터는 원문·영→한(`engToKor`)·한→영(`korToEng`) 세 매처 중 하나라도 매칭되면 통과한다 — 한/영 변환 없이 입력한 텍스트도 검색되게 하는 **의도된 편의 기능**(PR #1405 / issue #1404). 예: `sk` → `나`, `dlstmxjstm` → `인스턴스`.
- 검색 입력은 IME 조합 중에도 매 `input` 마다 필터 텍스트를 갱신한다 — 입력창 표시값과 목록/강조가 항상 같은 텍스트를 기준으로 해야 한다.
- 검색어 강조는 필터와 **동일한 매처 집합**을 사용한다 — 필터에 걸린 이유가 그대로 강조된다(필터-강조 일관성).
- 강조는 `highlight.match=true` + `filterable` + 검색어가 있을 때만 활성화된다. 그 외에는 항목명이 기존과 동일한 단일 텍스트로 렌더된다(하위 호환).
- 항목명 안 매칭 구간이 여럿이면 모두 강조하며, 겹치는 구간은 병합한다.
- 강조 대상은 드롭박스 항목명뿐이다 — 선택 태그(`ev-tag-name`)는 강조하지 않는다.
- `highlight.color` 미지정 시 테마 `primary` 색이 적용된다.

## Acceptance Criteria

- `multiple=true` 에서 여러 항목 선택 시 `modelValue` 가 배열로 갱신되고 `change` 를 emit 한다.
- `filterable=true` 에서 검색어로 목록이 필터된다.
- `clearable=true` 에서 초기화 아이콘 클릭 시 선택이 비워진다.
- `highlight.match=true` + `filterable` 에서 검색 시 매칭 구간만 강조된다.
- `highlight.color` 지정 시 해당 색상이 매칭 구간에 적용된다.
- `highlight` 미지정 시 기존 렌더링과 동일하다.

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

## Dependencies

| 대상 | 용도 |
|------|------|
| (브라우저) 위치 계산 | 드롭박스 열림 방향 |
| korean-regexp (`getRegExp`·`engToKor`·`korToEng`) | 검색 필터 및 매칭 구간 강조의 공통 매처 |

## Glossary

| 용어 | 정의 |
|------|------|
| collapseTags | 다중 선택 태그를 접어 요약 표시 |
| dropboxPosition | 드롭다운이 열리는 위치/방향 |
| 매처(matcher) | 검색어 하나로 만든 정규식. 원문·영→한·한→영 세 종류를 함께 쓴다 |
| 강조 조각(chunk) | 항목명을 매칭/비매칭 구간으로 분해한 단위 (`splitByMatch` 결과) |

## Data Flow

```
props.modelValue ──useModel──> selectedModel
검색 ──filterText──> getMatchers ──> 아이템 필터
                              └──> splitByMatch ──> 항목명 강조 조각(highlight.match)
선택/해제 ──changeMv/removeMv/removeAllMv──> emit(update:modelValue, change)
```
