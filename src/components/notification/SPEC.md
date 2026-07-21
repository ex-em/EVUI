# Notification (EvNotification) — 토스트 알림

## Purpose

화면 모서리에 잠시 나타났다 사라지는 토스트 알림. 프로그램적 호출로 렌더되며, 위치·자동 사라짐(duration)·유형별 아이콘·클릭/닫힘 콜백을 지원한다.

> **공식 API**: [docs/views/notification/api/notification.md](../../../docs/views/notification/api/notification.md)

## Features

- **내용/유형**: `type`(정보/성공/경고/에러 등)·`title`·`message`·`iconClass`. `useHTML` 시 message 를 HTML 렌더.
- **위치**: `position` — 화면 모서리(top-right 등) 배치.
- **자동 사라짐**: `duration` — 지정 시간 후 자동 닫힘(0 이면 수동 닫기만).
- **상호작용**: `showClose`(닫기 버튼)·`onClose`(닫힘 콜백)·`onClick`(클릭 콜백).
- **생명주기**: `unmount` — 닫힘 시 언마운트.

## Business Rules

- 프로그램적으로 마운트되며 `duration` 경과 시 자동 닫힘 후 `onClose` 호출·`unmount`.
- 같은 `position` 의 알림은 쌓여서(stack) 표시된다.
- `useHTML=true` 는 신뢰된 내용 전제(사용자 입력 직접 전달 금지).

## Acceptance Criteria

- 호출 시 `position` 위치에 토스트가 나타난다.
- `duration` 경과 후 자동으로 사라지고 `onClose` 가 호출된다.
- `showClose` 버튼 또는 본문 클릭(`onClick`)이 동작한다.

## Architecture

```
EvNotification (프로그램적 마운트)
└── 토스트 (position 모서리 · iconClass · title · message[useHTML] · close)
```

## File Structure

| 파일 | 역할 |
|------|------|
| Notification.vue | EvNotification SFC — props, 위치/타이머/콜백 |
| index.js | Vue 플러그인 등록 / 프로그램적 호출 API |

## Dependencies

| 대상 | 용도 |
|------|------|
| 해당 없음 | — (messageBox/message 와 독립) |

## Glossary

| 용어 | 정의 |
|------|------|
| position | 토스트가 나타나는 화면 모서리 |
| duration | 자동 사라짐까지의 시간(0=수동) |

## Data Flow

```
프로그램 호출 ──> position 에 마운트 ──duration 타이머──> 자동 닫힘/수동 닫힘 ──onClose──> unmount
```
