# Tabs (EvTabs) — 탭

## Purpose

탭 네비게이션 컴포넌트. 활성 탭을 `modelValue`(v-model) 로 제어하고, 탭 목록(`panels`)을 관리한다. 탭 닫기(closable), 너비 채움(stretch), 드래그 순서변경(draggable)을 지원한다. 탭 컨텐츠는 `EvTabPanel` 로 구성한다.

> **공식 API**: [docs/views/tab/api/tabs.md](../../../docs/views/tab/api/tabs.md) — tab 문서

## Features

- **활성 탭**: `modelValue`(v-model, [String, Number]) — 현재 탭. `change` emit.
- **패널 목록**: `panels`(Array, validator) — 탭 정의. `update:panels` emit(닫기/순서변경 반영).
- **탭 닫기**: `closable` — 탭 제거 버튼.
- **너비 채움**: `stretch` — 탭이 컨테이너 너비를 균등 분할.
- **드래그 순서변경**: `draggable` — 탭 드래그로 순서 변경(`isDragState`, `tabCloneList`).

## Business Rules

- `panels` 는 validator 로 목록 형식을 검증한다.
- 드래그 중(`isDragState`)에는 임시 `tabCloneList` 로 순서를 미리보기하고, 확정 시 `update:panels` 로 반영한다.
- 활성 탭 변경은 `mv` computed(get: modelValue, set: emit)로 v-model 동기화.

## Acceptance Criteria

- 탭 클릭 시 `update:modelValue`/`change` 를 emit 하고 해당 패널이 활성화된다.
- `closable=true` 에서 탭 닫기 시 `panels` 에서 제거되고 `update:panels` 를 emit 한다.
- `draggable=true` 에서 탭 순서를 드래그로 바꾼다.

## Architecture

```
EvTabs
├── 탭 헤더 (stretch/closable/draggable)
└── <slot/> EvTabPanel 들 (활성 패널만 표시)
```

## File Structure

| 파일 | 역할 |
|------|------|
| Tabs.vue | EvTabs SFC — props/emits, 활성 탭 v-model, 드래그 순서변경 |
| index.js | Vue 플러그인 등록 |

## Dependencies

| 대상 | 용도 |
|------|------|
| EvTabPanel (tabPanel) | 탭 컨텐츠 패널 (부모-자식) |

## Glossary

| 용어 | 정의 |
|------|------|
| panels | 탭 메타 목록 |
| tabCloneList | 드래그 순서변경 미리보기용 임시 목록 |

## Data Flow

```
props.modelValue ──mv computed──> 활성 탭
탭 클릭 ──emit(update:modelValue, change)
닫기/드래그 ──tabCloneList──> emit(update:panels)
```
