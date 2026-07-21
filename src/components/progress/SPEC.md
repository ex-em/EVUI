# Progress (EvProgress) — 진행률 표시

## Purpose

진행률(0~100)을 막대로 표시하는 컴포넌트. 색상·두께·내부 텍스트를 지정할 수 있다.

## Features

- **진행률**: `modelValue` — 진행 값.
- **스타일**: `color`(막대 색)·`strokeWidth`(두께)·`innerText`(내부 텍스트 표시).

## Business Rules

- 진행 막대의 채움 폭이 `modelValue` 비율에 비례한다.

## Acceptance Criteria

- `modelValue` 에 비례해 막대가 채워진다.

## Architecture

`EvProgress` — 진행 막대(track + fill, innerText).

## File Structure

| 파일 | 역할 |
|------|------|
| Progress.vue | EvProgress SFC |
| index.js | Vue 플러그인 등록 |

## Dependencies

해당 없음.

## Glossary

해당 없음.

## Data Flow

`modelValue` → 막대 채움 폭.
