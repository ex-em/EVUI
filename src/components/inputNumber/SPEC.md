# InputNumber (EvInputNumber) — 숫자 입력

## Purpose

숫자 전용 입력 컴포넌트. 최소/최대 제한, 스텝 증감, 소수 자릿수(precision), 후행 0 제거, 빈값 방지 등 숫자 입력 규칙을 강제한다.

## Features

- **값 입력**: `modelValue`(v-model, [String, Number]). `input`/`change`/`focus`/`blur` emit.
- **범위 제한**: `max`(Infinity)·`min`(-Infinity).
- **스텝 증감**: `step`(1, 양수 validator). `stepStrictly` — 스텝 배수로만 허용. `clampOnStep` — 스텝 시 범위 클램프.
- **정밀도**: `precision`(0~100 정수 validator) — 소수 자릿수. `trimTrailingZero` — 후행 0 제거.
- **빈값 방지**: `disableEmpty` — 빈 입력 금지.
- **상태**: `disabled`·`readonly`·`placeholder`.

## Business Rules

- `step` 은 양수(validator `val > 0`), `precision` 은 0~100 정수(validator).
- `stepStrictly=true` 면 값이 step 배수로 강제된다.
- `clampOnStep=true` 면 스텝 증감 시 min/max 범위로 클램프한다.
- `disableEmpty=true` 면 빈 문자열 입력을 허용하지 않는다.
- `trimTrailingZero=true` 면 표시 값의 후행 0 을 제거한다.

## Acceptance Criteria

- 범위 밖 입력 시 min/max 로 보정된다.
- 증감 버튼이 `step` 단위로 값을 변경하고 `change` 를 emit 한다.
- `precision=2` 에서 소수 2자리로 표시된다.

## Architecture

```
EvInputNumber
├── 입력 필드 (숫자 검증)
└── 증감 버튼 (step ±)
```

## File Structure

| 파일 | 역할 |
|------|------|
| InputNumber.vue | EvInputNumber SFC — props/emits, 숫자 검증/클램프/스텝/정밀도 |
| index.js | Vue 플러그인 등록 |
| style/ | 스타일 |

## Dependencies

| 대상 | 용도 |
|------|------|
| 해당 없음 | — |

## Glossary

| 용어 | 정의 |
|------|------|
| stepStrictly | 값을 step 배수로만 허용 |
| clampOnStep | 스텝 증감 시 min/max 로 클램프 |
| precision | 소수 표시 자릿수 |

## Data Flow

```
입력/증감 ──검증(min/max/step/precision)──> 보정 값 ──emit(update:modelValue, input/change)
focus/blur ──emit(focus/blur)
```
