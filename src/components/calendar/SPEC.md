# Calendar (EvCalendar) — 달력/날짜 선택

## Purpose

날짜·날짜시간·다중/범위 선택을 지원하는 달력 컴포넌트. 날짜(date), 날짜시간(dateTime), 다중일(dateMulti), 날짜범위(dateRange), 날짜시간범위(dateTimeRange) 모드를 제공하고, 연/월/일/시각 테이블을 각각 구성한다. 날짜 문자열 포맷(`YYYY-MM-DD`, `YYYY-MM-DD HH:mm:ss`)을 검증한다.

> **공식 API**: [docs/views/calendar/api/calendar.md](../../../docs/views/calendar/api/calendar.md)

## Features

- **선택 모드**: `mode` = date/dateTime/dateMulti/dateRange/dateTimeRange. 모드별 단일값·배열값 처리.
- **modelValue 검증**: `modelValue`([String, Array]) 를 date 정규식(`YYYY-MM-DD`, 10자)·dateTime 정규식(`YYYY-MM-DD HH:mm:ss`, 19자)으로 validator 검증. 배열은 각 원소 검증.
- **월/요일 표기**: `monthNotation`(fullName/abbrName/numberName/korName), `dayOfTheWeekNotation`(abbrUpperName/abbrLowerName/abbrPascalName/abbrKorName).
- **연/월/일/시각 테이블**: `useCalendarDate` 가 `calendarYearTableInfo`/`calendarMonthTableInfo`/`calendarTableInfo`/`calendarTimeTableInfo` 를 구성(`setCalendarYear`/`setCalendarMonth`/`setCalendarDate`/`setHmsTime`).
- **페이지 이동**: `useEvent` — `moveYear`/`moveMonth`/`clickPrevNextBtn`/`clickYearMonthBtn`/`clickYearMonth`, 연 페이지네이션(`YEAR_CNT_IN_ONE_PAGE`).
- **날짜 클릭 선택**: `clickDate` 로 모드별 선택 처리(단일/다중/범위). `dateRangeClickedDate` 로 범위 시작-끝 추적.
- **시각 선택**: `options.timeFormat`(HH:mm:ss 패턴) 기반 시/분/초 처리. 범위 모드는 timeFormat 배열([main, expanded]) 지원.
- **다중일 옵션**: `options.multiType`(weekday/week/date), `options.multiDayLimit`(양수), `options.disabledDate`(함수 또는 배열).

## Business Rules

- 날짜 문자열은 정확히 date 10자 또는 dateTime 19자여야 하며, 정규식 불일치 시 validator 실패.
- range 모드(dateRange/dateTimeRange)가 아니면 `mainValue` 는 단일값 경로로 처리한다.
- `options.multiType` 은 weekday/week/date 중 하나, `multiDayLimit` 은 양수여야 유효.
- `disabledDate` 는 함수 또는 날짜 배열로 비활성 날짜를 지정.
- 시각 포맷은 `(HH|2[0-3]|[01][0-9]):(mm|[0-5][0-9]):(ss|[0-5][0-9])` 정규식으로 검증한다(리터럴 `HH`/`mm`/`ss` 또는 숫자 범위 허용).

## Acceptance Criteria

- `modelValue='2024-01-15'`, `mode='date'` 로 렌더 시 해당 날짜가 선택 표시된다. (Calendar.spec.js)
- `mode='dateRange'`, `modelValue=['2024-01-15','2024-02-15']` 로 범위가 표시된다. (Calendar.spec.js)
- `mode='dateTime'`, `modelValue='2024-01-15 10:30:00'` 로 날짜+시각이 선택된다. (Calendar.spec.js)

## Architecture

```
EvCalendar (Calendar.vue setup: useModel + useCalendarDate + useEvent)
├── 연 테이블 (calendarYearTableInfo)
├── 월 테이블 (calendarMonthTableInfo)
├── 일 테이블 (calendarTableInfo)
└── 시각 테이블 (calendarTimeTableInfo)   # dateTime/dateTimeRange
```

## File Structure

| 파일 | 역할 |
|------|------|
| Calendar.vue | EvCalendar SFC — props(modelValue/mode/notation/options)/emits(update:modelValue), 컴포저블 조합 |
| uses.js | `useModel`(선택값/페이지/모드) · `useCalendarDate`(연/월/일/시각 테이블) · `useEvent`(페이지 이동·클릭 처리) + 날짜 유틸(lpadToTwoDigits/getLastDateOfMonth/getDateTimeInfoByType 등) |
| index.js | Vue 플러그인 등록 |

## Dependencies

| 대상 | 용도 |
|------|------|
| (소비자) datePicker | EvCalendar 를 팝업으로 감싸 날짜 입력 제공 (역방향) |

## Glossary

| 용어 | 정의 |
|------|------|
| mainValue / expandedValue | 범위 모드에서 시작/끝(또는 main/expanded) 달력 값 |
| YEAR_CNT_IN_ONE_PAGE | 연 선택 테이블 한 페이지의 연도 개수 |
| multiType | 다중 선택 단위 (weekday/week/date) |

## Data Flow

```
props.modelValue ──validateModelValue──> selectedValue
     │
useModel(선택/페이지) ──> useCalendarDate(연/월/일/시각 테이블 구성)
     │
클릭(clickDate/clickYearMonth/moveMonth) ──useEvent──> 선택/페이지 갱신 ──> emit(update:modelValue)
```
