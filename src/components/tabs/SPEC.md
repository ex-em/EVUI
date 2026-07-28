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
- **헤더 오버플로우 스크롤**: 탭 리스트(`ul`) 폭이 래퍼를 넘치면 `has-scroll` 이 켜져 좌우 화살표가 노출되고, 리스트가 `translateX` 로 슬라이드한다. 선택 탭이 뷰포트 밖이면 자동으로 따라 스크롤한다.

## Business Rules

- `panels` 는 validator 로 목록 형식을 검증한다.
- 드래그 중(`isDragState`)에는 임시 `tabCloneList` 로 순서를 미리보기하고, 확정 시 `update:panels` 로 반영한다.
- 활성 탭 변경은 `mv` computed(get: modelValue, set: emit)로 v-model 동기화.
- `has-scroll` 여부는 섹션 폭(뷰포트)과 `ul` 폭(콘텐츠) **양쪽**의 resize 를 감시해 재계산한다 — 탭 추가/삭제·라벨 변경처럼 섹션 폭이 그대로인 변화도 잡아야 하기 때문.
- 선택 탭 자동 스크롤(`scrollToActiveTab`)은 `has-scroll` 일 때만 동작하고, 선택 탭이 뷰포트 왼쪽 밖이면 왼쪽 끝을, 오른쪽 밖이면 오른쪽 끝을 뷰포트에 맞춘다. 첫 탭은 `0`, 마지막 탭은 `widthLimit`(= 래퍼폭 − 리스트폭)로 스냅해 리스트 양끝 border 까지 노출한다. 최종 위치는 `[widthLimit, 0]` 으로 클램프한다.
- 자동 스크롤은 `modelValue` 변경 시, 그리고 `has-scroll` 전환 시 `nextTick` 이후에 계산한다 — `has-scroll` 이 켜지면 화살표 padding 이 붙어 뷰포트 폭이 바뀌기 때문.

## Acceptance Criteria

- 탭 클릭 시 `update:modelValue`/`change` 를 emit 하고 해당 패널이 활성화된다.
- `closable=true` 에서 탭 닫기 시 `panels` 에서 제거되고 `update:panels` 를 emit 한다.
- `draggable=true` 에서 탭 순서를 드래그로 바꾼다.
- 탭이 래퍼를 넘치면 `has-scroll` 이 켜지고, 마운트 시점에 뷰포트 밖 탭이 선택돼 있으면 그 탭이 보이도록 스크롤된다 (`Tabs.spec.js`).
- 스크롤 상태에서 `modelValue` 를 뷰포트 밖 탭으로 바꾸면 헤더가 좌/우로 따라 스크롤되고, 넘치지 않으면 `translateX` 는 0 을 유지한다 (`Tabs.spec.js`).
- 마운트 후 패널을 추가해 넘치면 `has-scroll` 이 나타나고, 제거해 넘치지 않게 되면 사라진다 (`Tabs.spec.js`).

## Architecture

```
EvTabs (section, v-resize)
├── 탭 헤더 (stretch/closable/draggable)
│   └── nav-wrapper(has-scroll → 좌우 화살표)
│       └── list-wrapper(뷰포트)
│           └── ul.ev-tabs-list (v-resize, translateX) > li 탭들
└── <slot/> EvTabPanel 들 (활성 패널만 표시)
```

## File Structure

| 파일 | 역할 |
|------|------|
| Tabs.vue | EvTabs SFC — props/emits, 활성 탭 v-model, 드래그 순서변경, 헤더 오버플로우 스크롤 |
| Tabs.spec.js | 단위 테스트 — has-scroll 재계산, 선택 탭 자동 스크롤 |
| index.js | Vue 플러그인 등록 |

## Dependencies

| 대상 | 용도 |
|------|------|
| EvTabPanel (tabPanel) | 탭 컨텐츠 패널 (부모-자식) |
| @/directives/resize (`v-resize`) | 섹션·`ul` 폭 변화 감지로 `has-scroll` 재계산. `position: static` 인 대상에 `position: relative` 를 걸어(vue-resize-observer 호환 잔재) `li.offsetParent` 가 `ul` 로 확정되는 부수효과가 자동 스크롤 계산의 전제 |

## Glossary

| 용어 | 정의 |
|------|------|
| panels | 탭 메타 목록 |
| tabCloneList | 드래그 순서변경 미리보기용 임시 목록 |
| hasScroll | 리스트 폭 > 래퍼 폭 — 헤더 화살표 노출·슬라이드 활성 상태 |
| translateScroll.x | 헤더 리스트의 `translateX` 오프셋. 범위 `[widthLimit, 0]` |
| widthLimit | 래퍼폭 − 리스트폭 (음수). 오른쪽 끝까지 스크롤한 위치 |

## Data Flow

```
props.modelValue ──mv computed──> 활성 탭
탭 클릭 ──emit(update:modelValue, change)
닫기/드래그 ──tabCloneList──> emit(update:panels)
섹션/ul resize ──observeListEl──> hasScroll ──nextTick──> scrollToActiveTab
mv 변경 ──watch──> nextTick ──> scrollToActiveTab ──> translateScroll.x
화살표 클릭 ──scrollTab('prev'|'next', 100px)──> translateScroll.x
```
