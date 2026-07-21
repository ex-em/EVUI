# Radio (EvRadio) — 라디오 버튼

## Purpose

단일 라디오 버튼. 단독 또는 `EvRadioGroup` 안에서 그룹 선택의 일원으로 동작(provide/inject)한다.

> **공식 API**: [docs/views/radio/api/radio.md](../../../docs/views/radio/api/radio.md)

## Features

- **선택**: `modelValue`(v-model)·`label`(이 라디오의 값). `update:modelValue`·`change` emit.
- **상태/크기**: `disabled`·`size`.

## Business Rules

- `EvRadioGroup` 내부에서는 그룹이 provide 한 `EvRadioGroupMv`(값)·`EvRadioGroupChange`(변경 핸들러)를 inject 하여 그룹 단일 선택에 참여한다.
- 그룹 내에서 선택은 배타적(하나만).

## Acceptance Criteria

- 클릭 시 그룹 값이 이 라디오의 `label` 로 설정된다.

## Architecture

`EvRadio` — 단독 또는 RadioGroup 의 자식(inject).

## File Structure

| 파일 | 역할 |
|------|------|
| Radio.vue | EvRadio SFC |
| index.js | Vue 플러그인 등록 |

## Dependencies

| 대상 | 용도 |
|------|------|
| EvRadioGroup (inject) | 그룹 값/변경 핸들러 주입(EvRadioGroupMv/Change) |

## Glossary

해당 없음.

## Data Flow

그룹 내부: `inject(EvRadioGroupMv/Change)` → 배타 선택. 단독: `modelValue` → emit.
