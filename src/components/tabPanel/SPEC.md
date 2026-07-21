# TabPanel (EvTabPanel) — 탭 패널

## Purpose

`EvTabs` 의 개별 탭 컨텐츠를 담는 패널. 부모 Tabs 를 inject(`evTabs`) 하여 활성 여부에 따라 컨텐츠를 표시한다. 지연 렌더(lazy)를 지원한다.

## Features

- **패널 식별**: `value`(탭 식별자)·`text`(탭 라벨).
- **지연 렌더**: `lazy` — 활성화 전까지 컨텐츠 렌더 지연.
- **상태**: `disabled`.

## Business Rules

- `inject('evTabs')` 로 부모 Tabs 컨텍스트를 받아 현재 활성 탭과 `value` 를 비교해 표시한다.
- `lazy=true` 면 최초 활성화 시점까지 슬롯 컨텐츠를 렌더하지 않는다.

## Acceptance Criteria

- 부모 Tabs 의 활성 탭이 이 패널 `value` 일 때만 슬롯이 표시된다.

## Architecture

`EvTabPanel` — Tabs 의 자식(inject evTabs), 활성 시 slot 렌더.

## File Structure

| 파일 | 역할 |
|------|------|
| TabPanel.vue | EvTabPanel SFC |
| index.js | Vue 플러그인 등록 |

## Dependencies

| 대상 | 용도 |
|------|------|
| EvTabs (inject `evTabs`) | 활성 탭 컨텍스트 |

## Glossary

해당 없음.

## Data Flow

`inject(evTabs)` 활성 탭 == `value` → slot 표시 (lazy 시 최초 활성부터).
