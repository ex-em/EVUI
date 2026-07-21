# CheckboxGroup (EvCheckboxGroup) — 체크박스 그룹

## Purpose

여러 `EvCheckbox` 를 묶어 선택 값을 배열로 관리하는 그룹. 그룹 값과 변경 핸들러를 provide 하여 자식 체크박스가 참여하게 한다.

## Features

- **그룹 값**: `modelValue`(v-model) — 선택된 체크박스 값 배열. `update:modelValue`·`change` emit.
- **유형**: `type` — 그룹 표시/동작 유형.

## Business Rules

- `provide('EvCheckboxGroupMv', mv)`·`provide('EvCheckboxGroupChange', change)` 로 자식 `EvCheckbox` 가 inject 하여 그룹 선택에 참여한다.
- 자식 체크 변경은 그룹 `modelValue` 배열에 반영된다.

## Acceptance Criteria

- 자식 체크박스 토글 시 그룹 `modelValue` 배열이 갱신되고 `change` 를 emit 한다.

## Architecture

`EvCheckboxGroup` — provide(EvCheckboxGroupMv/Change) + `<slot/>` EvCheckbox 들.

## File Structure

| 파일 | 역할 |
|------|------|
| CheckboxGroup.vue | EvCheckboxGroup SFC |
| index.js | Vue 플러그인 등록 |

## Dependencies

| 대상 | 용도 |
|------|------|
| EvCheckbox (provide→inject) | 자식 체크박스에 그룹 값/변경 핸들러 제공 |

## Glossary

해당 없음.

## Data Flow

자식 체크 → `EvCheckboxGroupChange` → 그룹 `modelValue` 배열 갱신 → `update:modelValue`/`change` emit.
