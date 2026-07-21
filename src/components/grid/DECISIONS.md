# Grid (EvGrid) — Decisions

<!-- 날짜 `-` = SPEC 아키텍처 관찰 기반 초기 결정. YYYY-MM-DD = git 이력 근거 확인. -->

| 날짜 | 결정 | 이유 | 대안 |
|------|------|------|------|
| - | 가상 스크롤로 보이는 행만 렌더 | 대량 행에서 전체 DOM 생성 시 렌더/메모리 폭증 | 전체 행 DOM 렌더(대량 데이터 프리징) |
| - | 이벤트별 관심사를 uses.js 컴포저블 팩토리(scroll/resize/click/check/sort/filter/paging/contextMenu)로 분해 | 53KB 규모 로직을 기능 단위로 격리해 유지보수성 확보, setup 에서 조합 | 단일 setup 거대 함수(가독성·테스트성 저하) |
| - | 행을 인덱스 슬롯 배열(check/data/select/expand/disabled)로 관리 | 셀 접근·상태 갱신을 O(1) 인덱스로, 가상 스크롤과 정합 | 객체 프로퍼티 기반(참조/키 조회 비용) |
| - | 다중 컬럼 정렬을 OrderQueue 로 순서 유지 | 여러 컬럼 정렬 우선순위를 명시적으로 보존 | 단일 컬럼 정렬(다중 정렬 불가) |
| 2026-03-24 | vue-resize-observer 를 커스텀 `@/directives/resize` 로 교체 | 외부 의존 제거·리사이즈 감지 일원화(그리드/컬럼) | vue-resize-observer 유지(외부 의존) |
