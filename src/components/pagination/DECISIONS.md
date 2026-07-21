# Pagination (EvPagination) — Decisions

<!-- 날짜 `-` = SPEC 아키텍처 관찰 기반 초기 결정. -->

| 날짜 | 결정 | 이유 | 대안 |
|------|------|------|------|
| - | 독립 EvPagination 과 grid 내부 GridPagination 을 분리 유지 | 범용 페이지네이션과 그리드 내장 페이지네이션의 레이아웃/연동 요구가 달라 별도 | 단일 컴포넌트 공용(그리드 결합) |
| - | order 를 flex justify-content 로 직접 매핑 | 정렬 위치를 CSS 로 단순 제어 | 별도 정렬 로직(불필요한 복잡도) |
