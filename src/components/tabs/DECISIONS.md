# Tabs (EvTabs) — Decisions

<!-- 날짜 `-` = SPEC 아키텍처 관찰 기반 초기 결정. -->

| 날짜 | 결정 | 이유 | 대안 |
|------|------|------|------|
| - | 활성 탭(modelValue)과 탭 목록(panels)을 각각 v-model 로 분리 | 활성 상태와 목록 구조 변경(닫기/순서)을 독립 동기화 | 단일 상태(목록 변경 추적 어려움) |
| - | 드래그 순서변경을 tabCloneList 미리보기 후 확정 | 드래그 중 원본 panels 오염 없이 미리보기 제공 | 원본 즉시 변형(중간 상태 노출) |
| - | 탭 컨텐츠를 별도 EvTabPanel 로 분리 | 탭 헤더(네비)와 컨텐츠(패널)의 관심사 분리 | Tabs 가 컨텐츠까지 관리(결합) |
| 2026-07-23 | `ul.ev-tabs-list` 에도 `v-resize` 를 걸어 리스트 폭 변화를 감지 | 섹션 `v-resize` 는 뷰포트 폭만 잡아 탭 추가/삭제·라벨 변경으로 콘텐츠 폭만 바뀌는 경우 `has-scroll` 이 갱신되지 않았다. 부수효과로 `ul` 에 `position: relative` 가 걸려 `li.offsetParent` 가 `ul` 로 확정되는 것도 자동 스크롤 계산에 필요 | `ul` 에 명시적 CSS `position: relative` + 별도 ResizeObserver(감시 경로 이원화), `getBoundingClientRect` 기반 좌표 계산(transform 이 섞여 슬라이드 좌표계와 어긋남) |
| 2026-07-23 | 선택 탭이 첫/마지막일 때 `0`/`widthLimit` 로 스냅 | 정확히 탭 경계에 맞추면 리스트 양끝 border 가 화살표 뒤로 잘려 끝에 도달했다는 신호가 사라진다 | 항상 탭 경계에 정렬(양끝 border 잘림) |
