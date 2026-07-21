# Icon (EvIcon) — 아이콘

## Purpose

아이콘을 표시하는 경량 컴포넌트. 아이콘 이름·크기·색상을 받고, 클릭/더블클릭/컨텍스트메뉴 이벤트를 전달한다.

> **공식 API**: [docs/views/icon/api/icon.md](../../../docs/views/icon/api/icon.md)

## Features

- **아이콘**: `icon`(아이콘 이름/클래스)·`size`·`color`.
- **이벤트**: `click`·`dbl-click`·`context-menu` emit.

## Business Rules

- 아이콘 클래스는 프로젝트 아이콘 폰트(ev-icon-*)를 사용한다.

## Acceptance Criteria

- `icon` 에 지정한 아이콘이 `size`/`color` 로 렌더된다.
- 클릭/더블클릭/우클릭 시 해당 이벤트를 emit 한다.

## Architecture

`EvIcon` — 아이콘 요소(이벤트 전달).

## File Structure

| 파일 | 역할 |
|------|------|
| Icon.vue | EvIcon SFC |
| index.js | Vue 플러그인 등록 |

## Dependencies

해당 없음 (ev-icon 폰트 클래스 사용).

## Glossary

해당 없음.

## Data Flow

클릭/더블클릭/우클릭 → `click`/`dbl-click`/`context-menu` emit.
