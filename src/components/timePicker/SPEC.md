# TimePicker (EvTimePicker) — 시각 선택

## Purpose

시각(HH:mm:ss 등)을 선택하는 입력 컴포넌트. 단일 시각 또는 시각 범위(range)를 지원하며 초기화·비활성·읽기전용 상태를 갖는다.

## Features

- **시각 선택**: `modelValue`(v-model) — `type='range'` 이면 [startTime, endTime] 배열, 아니면 단일 시각. `update:modelValue` emit.
- **유형**: `type` — single/range.
- **placeholder**: `placeholder`([String, Array]) — range 는 [시작, 끝] 배열 placeholder 지원(문자열이면 양쪽 공용).
- **상태**: `clearable`·`disabled`·`readonly`.

## Business Rules

- `type='range'` 시 `update:modelValue` 로 `[startTime, endTime]` 를 emit 한다.
- `placeholder` 가 배열이면 [0]=시작, [1]=끝. 문자열이면 시작/끝 공용.
- focus 시 `focus` 이벤트를 emit 한다.

## Acceptance Criteria

- 시각 선택 시 `update:modelValue` 를 emit 한다.
- `type='range'` 에서 시작/끝 시각을 배열로 관리한다.
- `clearable` 에서 초기화 시 값이 비워진다.

## Architecture

```
EvTimePicker
├── 입력 필드(들) (single 또는 range 2개)
└── 시각 선택 드롭다운 (시/분/초)
```

## File Structure

| 파일 | 역할 |
|------|------|
| TimePicker.vue | EvTimePicker SFC — props/emits, single/range 시각 처리 |
| index.js | Vue 플러그인 등록 |

## Dependencies

| 대상 | 용도 |
|------|------|
| 해당 없음 | — |

## Glossary

| 용어 | 정의 |
|------|------|
| range | 시작~끝 두 시각을 선택하는 모드 |

## Data Flow

```
시각 선택 ──(single) value / (range) [start, end]──> emit(update:modelValue)
focus ──emit(focus)
```
