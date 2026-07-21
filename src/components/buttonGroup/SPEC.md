# ButtonGroup (EvButtonGroup) — 버튼 그룹

## Purpose

여러 `EvButton` 을 시각적으로 묶어 배치하는 경량 래퍼. 슬롯으로 받은 버튼들을 하나의 그룹 스타일(인접 버튼 결합)로 렌더한다.

## Features

- **버튼 묶음**: `<slot/>` 으로 받은 EvButton 들을 그룹 스타일로 배치.

## Business Rules

- 상태/값 관리 로직 없이 슬롯 컨텐츠를 그룹 컨테이너로 감싼다(순수 표현 컴포넌트).

## Acceptance Criteria

- 슬롯의 버튼들이 그룹 스타일로 인접 배치된다.

## Architecture

`EvButtonGroup` — 그룹 컨테이너 + `<slot/>`.

## File Structure

| 파일 | 역할 |
|------|------|
| ButtonGroup.vue | EvButtonGroup SFC (최소 래퍼) |
| index.js | Vue 플러그인 등록 |

## Dependencies

| 대상 | 용도 |
|------|------|
| EvButton | 그룹으로 묶는 대상(slot) |

## Glossary

해당 없음.

## Data Flow

해당 없음 (순수 슬롯 래퍼).
