# InputNumber (EvInputNumber) — Decisions

<!-- 날짜 `-` = SPEC 아키텍처 관찰 기반 초기 결정. -->

| 날짜 | 결정 | 이유 | 대안 |
|------|------|------|------|
| - | 숫자 규칙(min/max/step/precision/stepStrictly/clampOnStep)을 prop 으로 세분화 | 다양한 숫자 입력 정책을 선언적으로 강제 | 자유 입력 후 외부 검증(일관성 부족) |
| - | modelValue 를 [String, Number] 로 허용 | 입력 중간 상태(빈 문자열 등)를 표현하면서 숫자 확정 | Number 고정(중간 상태 표현 불가) |
| - | trimTrailingZero/disableEmpty 등 표시·검증 옵션 분리 | 표시 포맷과 입력 제약을 독립 제어 | 고정 동작(사용처 요구 불충족) |
