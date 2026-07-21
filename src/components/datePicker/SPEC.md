# DatePicker (EvDatePicker) — 날짜 선택 입력

## Purpose

입력 필드 + 드롭다운 달력으로 날짜/날짜시간/범위를 선택하는 컴포넌트. `EvCalendar` 의 날짜 로직을 재사용하며, 텍스트 직접 입력·바로가기(shortcuts)·초기화를 지원한다.

## Features

- **날짜 선택**: `modelValue`(v-model, [String, Array]) — date 정규식(10자)·dateTime 정규식(19자) validator. `update:modelValue` emit.
- **모드**: `mode`(date/dateTime/dateMulti/dateRange/dateTimeRange) — EvCalendar 와 동일.
- **표기**: `monthNotation`(fullName/abbrName/numberName/korName), `dayOfTheWeekNotation`(abbrUpperName/…).
- **옵션**: `options`(multiType/multiDayLimit/disabledDate/tagShorten/timeFormat) — validator 검증.
- **텍스트 입력**: `enableTextInput` — 필드에 직접 날짜 타이핑.
- **바로가기**: `shortcuts`(Array) — "오늘/어제" 등 빠른 선택(`useShortcuts`).
- **초기화/상태**: `clearable`·`disabled`·`placeholder`.

## Business Rules

- 드롭다운은 `datePickerClickoutside` 디렉티브로 외부 클릭 시 닫힌다.
- 날짜 유틸(`getChangedValueByTimeFormat`, `getLastDateOfMonth`)은 `../calendar/uses` 를 **재사용**한다(중복 구현 없음).
- modelValue 검증 정규식은 EvCalendar 와 동일 규약(date 10자 / dateTime 19자).

## Acceptance Criteria

- 필드 클릭 시 달력 드롭다운이 열리고 날짜 선택 시 `update:modelValue` 를 emit 한다.
- `enableTextInput=true` 에서 유효 포맷 타이핑이 값에 반영된다.
- `shortcuts` 항목 클릭 시 해당 날짜로 즉시 설정된다.

## Architecture

```
EvDatePicker (useModel + useDropdown + useShortcuts)
├── 입력 필드 (calendar 아이콘 · enableTextInput · clear)
└── (드롭다운) 달력 UI  ← calendar/uses 날짜 로직 재사용
    + shortcuts 목록
```

## File Structure

| 파일 | 역할 |
|------|------|
| DatePicker.vue | EvDatePicker SFC — props/emits, 입력 필드 + 드롭다운 |
| uses.js | `useModel`·`useDropdown`·`useShortcuts` (calendar/uses 날짜 유틸 재사용) |
| index.js | Vue 플러그인 등록 |

## Dependencies

| 대상 | 용도 |
|------|------|
| `../calendar/uses` (getChangedValueByTimeFormat, getLastDateOfMonth) | 날짜 계산 유틸 재사용 |
| `@/directives/clickoutside` (datePickerClickoutside) | 외부 클릭 시 드롭다운 닫기 |

## Glossary

| 용어 | 정의 |
|------|------|
| shortcuts | 자주 쓰는 날짜(오늘/어제 등) 바로가기 |
| enableTextInput | 필드에 날짜를 직접 타이핑하는 모드 |

## Data Flow

```
props.modelValue ──useModel──> 표시값
필드 클릭 ──useDropdown──> 달력 열림
날짜 선택/shortcut/텍스트입력 ──> 값 확정 ──emit(update:modelValue)
외부 클릭 ──clickoutside──> 드롭다운 닫힘
```
