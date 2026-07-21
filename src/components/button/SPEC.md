# Button (EvButton) — 버튼

## Purpose

기본 버튼. 유형(색상)·모양·크기·비활성·자동포커스를 지원하고, 네이티브 버튼 타입(htmlType)을 지정할 수 있다.

## Features

- **유형**: `type`(default/primary/info/warning/error/ghost/dashed/text) — 색상/스타일.
- **모양/크기**: `shape`·`size`.
- **네이티브 타입**: `htmlType`(button/submit/reset).
- **상태**: `disabled`·`autoFocus`.

## Business Rules

- `type` 은 default/primary/info/warning/error/ghost/dashed/text 중 하나(prop validator 없음, SCSS 로 8종 스타일 정의).
- 슬롯으로 버튼 라벨/아이콘을 받는다.

## Acceptance Criteria

- `disabled=true` 면 클릭이 무시된다.
- `type` 에 따라 스타일이 달라진다.

## Architecture

`EvButton` — `<button>` 래퍼(type/shape/size 스타일 + slot).

## File Structure

| 파일 | 역할 |
|------|------|
| Button.vue | EvButton SFC |
| index.js | Vue 플러그인 등록 |

## Dependencies

| 대상 | 용도 |
|------|------|
| (역방향) buttonGroup | 버튼들을 묶어 표시 |

## Glossary

해당 없음.

## Data Flow

클릭 → native click(비활성 시 무시).
