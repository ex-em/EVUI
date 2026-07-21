# Scheduler (EvScheduler) — 격자 스케줄 선택

## Purpose

행/열 라벨로 구성된 격자(예: 요일 × 시간대)에서 셀을 드래그 선택하는 스케줄러. 선택된 셀 좌표를 `modelValue`(배열)로 관리한다.

## Features

- **격자 선택**: `modelValue`(v-model, Array) — 선택된 셀 목록. `update:modelValue`(Array) emit.
- **축 라벨**: `colLabels`(열, 예: 시간대)·`rowLabels`(행, 예: 요일).
- **드래그 선택**: 셀 드래그로 다중 선택/해제.

## Business Rules

- `modelValue` 는 선택된 셀 좌표의 배열이다.
- 행/열 라벨 배열의 크기가 격자 차원을 결정한다.

## Acceptance Criteria

- 셀 클릭/드래그로 선택 영역이 토글되고 `update:modelValue` 를 emit 한다.
- `colLabels`/`rowLabels` 크기에 맞춰 격자가 렌더된다.

## Architecture

```
EvScheduler
├── 열 헤더 (colLabels)
├── 행 헤더 (rowLabels)
└── 격자 셀 (드래그 선택)
```

## File Structure

| 파일 | 역할 |
|------|------|
| Scheduler.vue | EvScheduler SFC — props/emits, 격자 렌더·드래그 선택 |
| index.js | Vue 플러그인 등록 |

## Dependencies

| 대상 | 용도 |
|------|------|
| (브라우저) mouse 이벤트 | 드래그 선택 |

## Glossary

| 용어 | 정의 |
|------|------|
| colLabels/rowLabels | 격자의 열/행 축 라벨 |

## Data Flow

```
드래그 ──> 셀 선택/해제 ──> modelValue 갱신 ──emit(update:modelValue)
```
