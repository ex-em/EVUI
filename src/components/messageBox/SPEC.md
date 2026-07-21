# MessageBox (EvMessageBox) — 확인/알림 다이얼로그

## Purpose

확인(confirm)/경고/알림용 모달 다이얼로그. 제목·메시지·확인/취소 버튼을 갖추며, 프로그램적 호출(서비스)로 렌더되고 `unmount`/`onClose` 로 생명주기를 관리한다.

## Features

- **유형**: `type` — 다이얼로그 종류(정보/경고/에러 등)에 따른 `iconClass`.
- **내용**: `title`·`message`. `useHTML` 시 message 를 HTML 로 렌더.
- **버튼**: `showConfirmBtn`·`showCancelBtn`·`confirmBtnText`·`cancelBtnText`.
- **닫기**: `showClose`·`closeOnClickModal`·`onClose`(콜백).
- **생명주기**: `unmount` — 닫힘 시 언마운트. `focusable`.

## Business Rules

- 프로그램적으로 호출되어 동적 마운트되며, 닫힘 시 `onClose` 콜백 호출 후 `unmount` 정책에 따라 제거된다.
- `useHTML=true` 일 때만 message 를 HTML 로 렌더(신뢰된 내용 전제 — 사용자 입력 직접 전달 금지).
- `closeOnClickModal=true` 면 배경 클릭으로 닫힌다.

## Acceptance Criteria

- 확인 버튼 클릭 시 confirm 결과가 전달되고 다이얼로그가 닫힌다.
- `showCancelBtn=true` 에서 취소 버튼이 표시되고 취소 결과를 전달한다.
- `closeOnClickModal=true` 에서 배경 클릭 시 닫힌다.

## Architecture

```
EvMessageBox (프로그램적 마운트)
├── 배경 오버레이 (closeOnClickModal)
└── 박스 (iconClass · title · message[useHTML] · confirm/cancel 버튼)
```

## File Structure

| 파일 | 역할 |
|------|------|
| MessageBox.vue | EvMessageBox SFC — props, 버튼/닫기/HTML 렌더 |
| index.js | Vue 플러그인 등록 / 프로그램적 호출 API |

## Dependencies

| 대상 | 용도 |
|------|------|
| 해당 없음 | — (message/notification 과 독립) |

## Glossary

| 용어 | 정의 |
|------|------|
| unmount | 닫힘 시 DOM 에서 제거하는 정책 |
| onClose | 닫힘 시 호출되는 콜백 |

## Data Flow

```
프로그램 호출 ──> 동적 마운트 ──> 사용자 확인/취소/닫기 ──onClose 콜백──> unmount
```
