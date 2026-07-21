# DatePicker (EvDatePicker) — Decisions

<!-- 날짜 `-` = SPEC 아키텍처 관찰 기반 초기 결정. -->

| 날짜 | 결정 | 이유 | 대안 |
|------|------|------|------|
| - | 날짜 계산 유틸을 `../calendar/uses` 에서 재사용 | 날짜 파싱/포맷 로직을 calendar 와 공유해 중복·발산 방지 | datePicker 전용 날짜 로직 재구현(중복) |
| - | 입력 필드 + 드롭다운 달력 조합 | 좁은 폼 공간에서 클릭 시에만 달력을 펼쳐 공간 절약 | 항상 달력 표시(공간 점유) |
| - | 외부 클릭 닫기를 `datePickerClickoutside` 디렉티브로 | 드롭다운 닫힘 로직을 선언적으로 재사용 | 컴포넌트 내 수동 document 리스너(cleanup 부담) |
| - | mode/notation/options 를 calendar 와 동일 규약으로 노출 | 두 컴포넌트 간 API 일관성으로 학습 비용 절감 | 독자 API(혼란) |
