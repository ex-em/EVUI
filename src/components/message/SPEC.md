# Message (EvMessage) — 간단 메시지

## Purpose

짧은 상태 메시지를 잠깐 표시하는 컴포넌트. 프로그램적 호출로 렌더되며 유형·자동 사라짐(duration)·닫기 콜백을 지원한다. notification 보다 단순한 인라인/상단 메시지.

## Features

- **내용/유형**: `type`·`message`·`iconClass`. `useHTML` 시 HTML 렌더.
- **자동 사라짐**: `duration`(0=수동).
- **닫기/생명주기**: `showClose`·`onClose`·`unmount`.

## Business Rules

- 프로그램적으로 마운트, `duration` 경과 시 자동 닫힘 후 `onClose`·`unmount`.
- `useHTML` 은 신뢰된 내용 전제(사용자 입력 직접 전달 금지).

## Acceptance Criteria

- 호출 시 메시지가 표시되고 `duration` 후 사라진다.

## Architecture

`EvMessage` — 프로그램적 마운트 메시지(type · message · close).

## File Structure

| 파일 | 역할 |
|------|------|
| Message.vue | EvMessage SFC |
| index.js | Vue 플러그인 등록 / 프로그램적 호출 API |

## Dependencies

해당 없음 (notification/messageBox 와 독립).

## Glossary

해당 없음.

## Data Flow

호출 → 마운트 → duration 타이머 → 닫힘(onClose) → unmount.
