# Slider (EvSlider) — 슬라이더

## Purpose

값 또는 값 범위를 드래그로 선택하는 슬라이더. 단일값·범위(range) 모드, 스텝, 눈금(mark), 툴팁, 인라인 입력창, 색상 범위 표시를 지원한다.

> **공식 API**: [docs/views/slider/api/slider.md](../../../docs/views/slider/api/slider.md)

## Features

- **값 선택**: `modelValue`(v-model, [Number, Array]) — `range=false` 단일, `range=true` 범위(배열). `change` emit.
- **범위 제한**: `min`(0)·`max`(100)·`step`(1, 양수 validator).
- **눈금**: `mark`(Object)·`showStep` — 스텝/마크 표시(클래스 `show-mark`).
- **툴팁**: `showTooltip`·`tooltipFormat`(Function) — 값 툴팁 및 포맷(클래스 `hide-tooltip`).
- **인라인 입력**: `showInput` — 값 직접 입력창(클래스 `show-input`).
- **색상**: `color`([String, Array]) — 단색/구간별 색상(클래스 `color-range`).
- **상태**: `disabled`·`readonly`.

## Business Rules

- `step` 은 양수여야 한다(validator `val > 0`).
- `range=true` 면 `modelValue` 는 [시작, 끝] 배열.
- `color` 가 배열이면 구간별 색상(`isColorArray`)으로 트랙을 렌더한다.

## Acceptance Criteria

- 핸들 드래그 시 `step` 단위로 값이 이동하고 `update:modelValue`/`change` 를 emit 한다.
- `range=true` 에서 두 핸들로 범위를 선택한다.
- `showInput=true` 에서 입력창 값과 슬라이더가 동기화된다.

## Architecture

```
EvSlider
├── track (색상: 단색/구간)
├── handle(s) (single 또는 range 2개)
├── (showStep/mark) 눈금
├── (showTooltip) 값 툴팁
└── (showInput) 입력창
```

## File Structure

| 파일 | 역할 |
|------|------|
| Slider.vue | EvSlider SFC — props/emits, 드래그/스텝/툴팁/입력 로직 |
| index.js | Vue 플러그인 등록 |

## Dependencies

| 대상 | 용도 |
|------|------|
| (브라우저) mouse/touch 이벤트 | 핸들 드래그 |

## Glossary

| 용어 | 정의 |
|------|------|
| range | 두 핸들로 구간을 선택하는 모드 |
| mark | 특정 값에 표시하는 눈금 라벨 |

## Data Flow

```
props.modelValue ──> 핸들 위치
드래그/입력 ──step 스냅──> 값 갱신 ──emit(update:modelValue, change)
```
