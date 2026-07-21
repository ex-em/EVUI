# Menu (EvMenu) — 메뉴

## Purpose

항목 목록(`items`)을 표시하는 네비게이션 메뉴. 선택 항목을 `modelValue`(v-model)로 관리하고 확장(expandable)·비활성을 지원한다.

## Features

- **항목**: `items`(Array) 메뉴 항목.
- **선택**: `modelValue`(v-model) — 선택 항목. `update:modelValue`·`change` emit.
- **확장/상태**: `expandable`(하위 메뉴 확장)·`disabled`.

## Business Rules

- 항목 선택 시 `update:modelValue` 와 `change` 를 emit 한다.
- `expandable=true` 면 하위 항목이 있는 메뉴를 펼칠 수 있다.

## Acceptance Criteria

- 항목 클릭 시 `update:modelValue`/`change` 를 emit 한다.

## Architecture

`EvMenu` — items 기반 메뉴 리스트(확장 가능).

## File Structure

| 파일 | 역할 |
|------|------|
| Menu.vue | EvMenu SFC |
| index.js | Vue 플러그인 등록 |

## Dependencies

해당 없음 (contextMenu 와 독립).

## Glossary

해당 없음.

## Data Flow

항목 클릭 → `update:modelValue`/`change` emit.
