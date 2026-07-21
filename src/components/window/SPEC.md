# Window (EvWindow) — 윈도우/모달 다이얼로그

## Purpose

드래그·리사이즈·최대화·전체화면·모달을 지원하는 플로팅 윈도우(다이얼로그) 컴포넌트. `visible`(v-model) 로 표시를 제어하고, 헤더 드래그 이동·모서리 리사이즈·최대화 토글·ESC 닫기 등 데스크톱 윈도우 상호작용을 제공한다.

> **공식 API**: [docs/views/window/api/window.md](../../../docs/views/window/api/window.md)

## Features

- **표시 제어**: `visible`(v-model, `update:visible`) 로 열기/닫기.
- **크기/위치**: `width`(기본 50vw)·`height`(기본 50vh)·`minWidth`/`minHeight`(기본 150).
- **드래그 이동**: `draggable`(기본 false) — 헤더 드래그로 이동. `mousedown`/`mousedown-mousemove`/`mousedown-mouseup` emit.
- **리사이즈**: `resizable`(기본 false) — 모서리 드래그. `resize` emit.
- **최대화/전체화면**: `maximizable`·`fullscreen`. `expand` emit.
- **모달**: `isModal`·`closeOnClickModal` — 배경 오버레이 및 배경 클릭 닫기.
- **닫기 옵션**: `escClose`(ESC 키), `focusable`, `hideScroll`.
- **커스터마이즈**: `title`·`windowClass`·`iconClass`·`style`.

## Business Rules

- `isModal`·`hideScroll` 는 기본 활성(true), `draggable`·`resizable`·`fullscreen`·`maximizable`·`escClose`·`focusable` 는 기본 비활성(false).
- 크기 단위는 문자열(vw/vh/px) 또는 숫자를 허용한다.
- 최대화/복원 아이콘(`maximizableIcon`)은 현재 확장 상태(`isFullExpandWindow`)에 따라 토글된다.

## Acceptance Criteria

- `visible=true` 로 윈도우가 렌더되고 닫기 시 `update:visible=false` 를 emit 한다.
- `draggable=true` 에서 헤더 드래그로 위치가 이동한다.
- `isModal=true`, `closeOnClickModal=true` 에서 배경 클릭 시 닫힌다.

## Architecture

```
EvWindow
├── (isModal) 배경 오버레이
└── window (headerRef: 드래그 핸들 · 타이틀 · 최대화/닫기 아이콘)
    └── <slot/> 본문 (hideScroll 옵션)
```

## File Structure

| 파일 | 역할 |
|------|------|
| Window.vue | EvWindow SFC — props/emits, 드래그/리사이즈/최대화 로직 |
| index.js | Vue 플러그인 등록 |

## Dependencies

| 대상 | 용도 |
|------|------|
| (브라우저) mouse 이벤트 | 드래그/리사이즈 |

## Glossary

| 용어 | 정의 |
|------|------|
| isFullExpandWindow | 최대화(전체 확장) 상태 여부 |
| modal | 배경을 가리고 상호작용을 윈도우로 제한하는 모드 |

## Data Flow

```
props.visible ──> 렌더 토글
헤더 드래그 ──mousedown/mousemove/mouseup──> 위치 갱신 ──emit(mousedown-*)
리사이즈 ──> 크기 갱신 ──emit(resize)
최대화 ──> isFullExpandWindow 토글 ──emit(expand)
닫기(ESC/모달클릭/버튼) ──emit(update:visible=false)
```
