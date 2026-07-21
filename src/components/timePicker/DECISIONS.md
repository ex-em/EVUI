# TimePicker (EvTimePicker) — Decisions

<!-- 날짜 `-` = SPEC 아키텍처 관찰 기반 초기 결정. -->

| 날짜 | 결정 | 이유 | 대안 |
|------|------|------|------|
| - | 단일/범위를 `type` prop + modelValue 형태(값 또는 [start,end])로 처리 | 시각 선택 UI 공유, 범위만 배열로 확장 | 별도 RangeTimePicker(중복) |
| - | placeholder 를 문자열/배열 모두 허용 | 범위 모드에서 시작/끝 각각 다른 placeholder 필요 | 단일 placeholder(범위 표현 부족) |
