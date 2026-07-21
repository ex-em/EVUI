# Loading (EvLoading) — 로딩 인디케이터

## Purpose

로딩 상태를 표시하는 오버레이/인디케이터. 전체화면 또는 영역 단위로 표시하고, 외부 클릭 처리·커스텀 아이콘을 지원한다.

> **공식 API**: [docs/views/loading/api/loading.md](../../../docs/views/loading/api/loading.md)

## Features

- **표시 제어**: `modelValue`(v-model). `update:modelValue` emit.
- **범위**: `fullscreen` — 전체화면 오버레이 여부.
- **외부 클릭**: `clickOutside` — true면 오버레이에 클릭 리스너를 바인딩하고, 클릭 시 `update:modelValue`(false) 를 emit(닫기).
- **아이콘**: `iconClass`·`iconStyle`.

## Business Rules

- `fullscreen=true` 면 뷰포트 전체를 덮고, false 면 부모 영역에 국한된다.
- `clickOutside` 가 true면 오버레이 클릭 시 `update:modelValue`(false) 를 emit 한다(닫기). 별도 `click` 이벤트는 emit 하지 않는다.

## Acceptance Criteria

- `modelValue=true` 면 로딩 인디케이터가 표시된다.

## Architecture

`EvLoading` — 오버레이 + 스피너 아이콘(fullscreen 또는 영역).

## File Structure

| 파일 | 역할 |
|------|------|
| Loading.vue | EvLoading SFC |
| index.js | Vue 플러그인 등록 |

## Dependencies

해당 없음.

## Glossary

해당 없음.

## Data Flow

`modelValue` → 표시 토글. 오버레이 클릭(clickOutside=true) → `update:modelValue`(false) emit.
