# ChartGroup (EvChartGroup) — Decisions

<!-- 날짜 `-` = SPEC 아키텍처 관찰 기반 초기 결정. YYYY-MM-DD = git 이력 근거 확인. -->

| 날짜 | 결정 | 이유 | 대안 |
|------|------|------|------|
| - | `provide/inject` 로 그룹 상태를 자식 차트에 전달 | 그룹-자식 트리가 slot 으로 동적 구성되어 props 드릴링이 불가. 공유 줌/브러시/hover 상태를 컨텍스트로 내려보냄 | props 드릴링(slot 구조상 불가), Pinia 전역(그룹 인스턴스별 격리 불가) |
| - | 줌 로직 본체를 `chart/uses` 의 `useZoomModel` 에 위임(그룹은 배선만) | 단일 차트 줌과 그룹 줌이 동일 계산을 공유 — 중복 구현 방지, chartBrush/zoom 과 일관 | chartGroup 전용 줌 로직 재구현(중복·발산 위험) |
| - | `getNormalizedOptions` 로 옵션을 새 객체에 defaultsDeep 병합 | 소비자 props 를 in-place 변형하지 않고 기본값 보장 | props 직접 변형(반응성 오염) |
| - | 폴링 redraw 양보를 타이머 없이 `deferUntil` 절대 타임스탬프로 구현 | detail/popup 오픈 시 우선 페인트하되, 상태가 타임스탬프뿐이라 타이머/cleanup 불필요하고 시간창 경과 시 자동 재개 | 타이머 기반 일시정지(cleanup 필요, resume 누락 시 영구 정지 위험) |
| - | 폴링 양보에 `MAX_DEFER_MS`(2000) 상한 | 반복 호출로 그룹 라이브 갱신이 무한 정지되는 것을 방지 | 상한 없음(무기한 정지 가능) |
