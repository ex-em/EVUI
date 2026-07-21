# TextField (EvTextField) — Decisions

<!-- 날짜 `-` = SPEC 아키텍처 관찰 기반 초기 결정. -->

| 날짜 | 결정 | 이유 | 대안 |
|------|------|------|------|
| - | text/password/search 를 단일 컴포넌트 `type` prop 으로 통합 | 입력 필드 공통 UI 를 공유하며 타입별 동작만 분기 | 타입별 별도 컴포넌트(중복) |
| - | search 타입은 input type='text' + search 이벤트로 구현 | 브라우저 기본 search input 의 스타일/동작 편차 회피 | native search input(브라우저별 편차) |
| - | maxLength 카운터·errorMsg 를 내장 | 폼 입력의 흔한 요구(길이 제한·검증 메시지)를 컴포넌트에서 제공 | 외부에서 별도 구현(반복) |
