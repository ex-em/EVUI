# RadioGroup (EvRadioGroup) — 라디오 그룹

## Purpose

여러 `EvRadio` 를 묶어 배타적 단일 선택을 관리하는 그룹. 그룹 값과 변경 핸들러를 provide 하여 자식 라디오가 참여하게 한다.

> **공식 API**: [docs/views/radio/api/radio.md](../../../docs/views/radio/api/radio.md) — EvRadio 문서

## Features

- **그룹 값**: `modelValue`(v-model) — 선택된 라디오 값. `update:modelValue`·`change` emit.
- **유형**: `type` — 그룹 표시/동작 유형.

## Business Rules

- `provide('EvRadioGroupMv', mv)`·`provide('EvRadioGroupChange', change)` 로 자식 `EvRadio` 가 inject 하여 배타 선택에 참여한다.
- 그룹 내 선택은 하나만 활성(배타적).

## Acceptance Criteria

- 한 라디오 선택 시 그룹 `modelValue` 가 그 값으로 바뀌고 다른 선택은 해제된다.

## Architecture

`EvRadioGroup` — provide(EvRadioGroupMv/Change) + `<slot/>` EvRadio 들.

## File Structure

| 파일 | 역할 |
|------|------|
| RadioGroup.vue | EvRadioGroup SFC |
| index.js | Vue 플러그인 등록 |

## Dependencies

| 대상 | 용도 |
|------|------|
| EvRadio (provide→inject) | 자식 라디오에 그룹 값/변경 핸들러 제공 |

## Glossary

해당 없음.

## Data Flow

자식 선택 → `EvRadioGroupChange` → 그룹 `modelValue` 배타 갱신 → `update:modelValue`/`change` emit.
