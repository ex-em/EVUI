# Toggle (EvToggle) — 토글 스위치

## Purpose

on/off 토글 스위치. 활성/비활성 색상, 너비, 비활성/읽기전용을 지원한다.

> **공식 API**: [docs/views/toggle/api/toggle.md](../../../docs/views/toggle/api/toggle.md)

## Features

- **토글 상태**: `modelValue`(v-model). `update:modelValue`·`change` emit.
- **스타일**: `width`·`activeColor`·`inactiveColor`.
- **상태**: `disabled`·`readonly`.

## Business Rules

- 클릭 시 on/off 를 토글하고 `update:modelValue`/`change` 를 emit 한다.
- `readonly`/`disabled` 면 토글되지 않는다.

## Acceptance Criteria

- 클릭 시 상태가 반전되고 emit 된다.

## Architecture

`EvToggle` — 스위치 트랙 + 노브(active/inactive 색).

## File Structure

| 파일 | 역할 |
|------|------|
| Toggle.vue | EvToggle SFC |
| index.js | Vue 플러그인 등록 |

## Dependencies

해당 없음.

## Glossary

해당 없음.

## Data Flow

클릭 → 상태 반전 → `update:modelValue`/`change` emit.
