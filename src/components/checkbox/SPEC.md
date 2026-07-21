# Checkbox (EvCheckbox) — 체크박스

## Purpose

단일 체크박스. 단독 사용 또는 `EvCheckboxGroup` 안에서 그룹의 일원으로 동작(provide/inject)한다. indeterminate(부분 선택), 툴팁, 비활성/읽기전용을 지원한다.

> **공식 API**: [docs/views/checkbox/api/checkbox.md](../../../docs/views/checkbox/api/checkbox.md)

## Features

- **체크 상태**: `modelValue`(v-model). `update:modelValue` emit.
- **부분 선택**: `indeterminate`(v-model:indeterminate). `update:indeterminate` emit.
- **라벨/툴팁**: `label`·`tooltipTitle`.
- **상태**: `disabled`·`readonly`.

## Business Rules

- `EvCheckboxGroup` 내부에서는 그룹이 provide 한 `EvCheckboxGroupMv`(값)·`EvCheckboxGroupChange`(변경 핸들러)를 inject 하여 그룹 상태에 참여한다.
- 그룹 밖에서는 자체 `modelValue` 로 독립 동작한다.

## Acceptance Criteria

- 클릭 시 체크 토글되고 `update:modelValue` 를 emit 한다.
- 그룹 내부에서는 그룹 선택 배열에 값이 반영된다.

## Architecture

`EvCheckbox` — 단독 또는 CheckboxGroup 의 자식(inject).

## File Structure

| 파일 | 역할 |
|------|------|
| Checkbox.vue | EvCheckbox SFC |
| index.js | Vue 플러그인 등록 |

## Dependencies

| 대상 | 용도 |
|------|------|
| EvCheckboxGroup (inject) | 그룹 값/변경 핸들러 주입(EvCheckboxGroupMv/Change) |

## Glossary

| 용어 | 정의 |
|------|------|
| indeterminate | 전체/부분 선택 사이의 중간 상태 |

## Data Flow

그룹 내부: `inject(EvCheckboxGroupMv/Change)` → 그룹 값 참여. 단독: `modelValue` → `update:modelValue` emit.
