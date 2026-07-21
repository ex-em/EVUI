# TextField (EvTextField) — 텍스트 입력

## Purpose

텍스트 입력 필드. 일반/비밀번호/검색 타입, 초기화, 비밀번호 표시 토글, 최대 길이 카운터, 에러 메시지, 자동완성을 지원한다.

## Features

- **값 입력**: `modelValue`(v-model). `input`/`change`/`focus`/`blur` emit. `modelModifiers` 지원.
- **타입**: `type`(text/password/search 등). `search` 타입은 내부 input type='text' + `search` emit.
- **비밀번호 토글**: `showPassword` — `password` 타입에서 표시/숨김 토글(`isPasswordVisible`).
- **초기화**: `clearable`.
- **길이 제한**: `maxLength`·`maxUnit`·`showMaxLength` — 최대 길이 및 카운터 표시.
- **에러/상태**: `errorMsg`·`disabled`·`readonly`·`placeholder`·`autocomplete`.

## Business Rules

- `type='search'` 는 실제 input type 은 'text' 로 렌더하고 검색 시 `search` 이벤트를 emit 한다.
- `type='password'` + `showPassword` 시 표시 상태(`isPasswordVisible`)에 따라 input type 이 text/password 로 전환된다.
- password 가 아닌 타입으로 바뀌면 표시 토글 상태를 초기화한다.

## Acceptance Criteria

- 입력 시 `update:modelValue`/`input` 을 emit 한다.
- `showPassword` 토글로 비밀번호 텍스트 표시/숨김이 전환된다.
- `type='search'` 에서 검색 실행 시 `search` 를 emit 한다.

## Architecture

```
EvTextField
├── input (type 변환: search→text, password→text/password)
├── (clearable) clear 아이콘
├── (showPassword) 표시 토글 아이콘
└── (showMaxLength) 길이 카운터 / (errorMsg) 에러 표시
```

## File Structure

| 파일 | 역할 |
|------|------|
| TextField.vue | EvTextField SFC — props/emits, 타입/토글/카운터/에러 |
| index.js | Vue 플러그인 등록 |

## Dependencies

| 대상 | 용도 |
|------|------|
| 해당 없음 | — |

## Glossary

| 용어 | 정의 |
|------|------|
| modelModifiers | v-model 수정자(trim/number 등) 처리 |
| isPasswordVisible | 비밀번호 표시 토글 상태 |

## Data Flow

```
입력 ──mv computed──> emit(update:modelValue, input/change)
검색(search 타입) ──emit(search)
포커스/블러 ──emit(focus/blur)
```
