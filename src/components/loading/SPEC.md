# Loading (EvLoading) — 로딩 인디케이터

## Purpose

로딩 상태를 표시하는 오버레이/인디케이터. 전체화면 또는 영역 단위로 표시하고, 외부 클릭 처리·커스텀 아이콘을 지원한다.

## Features

- **표시 제어**: `modelValue`(v-model). `update:modelValue` emit.
- **범위**: `fullscreen` — 전체화면 오버레이 여부.
- **외부 클릭**: `clickOutside` — 오버레이 클릭 처리. `click` emit.
- **아이콘**: `iconClass`·`iconStyle`.

## Business Rules

- `fullscreen=true` 면 뷰포트 전체를 덮고, false 면 부모 영역에 국한된다.
- 오버레이 클릭 시 `click` 을 emit 한다(`clickOutside` 정책).

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

`modelValue` → 표시 토글. 오버레이 클릭 → `click` emit.
