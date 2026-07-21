# Calendar (EvCalendar) — Decisions

<!-- 날짜 `-` = SPEC 아키텍처 관찰 기반 초기 결정. YYYY-MM-DD = git 이력 근거 확인. -->

| 날짜 | 결정 | 이유 | 대안 |
|------|------|------|------|
| - | 상태(useModel)·테이블 구성(useCalendarDate)·이벤트(useEvent) 3개 컴포저블로 분리 | 달력의 선택 상태, 연/월/일/시각 테이블 산출, 사용자 이벤트 처리가 관심사가 명확히 달라 격리 | 단일 setup 통합(2천 줄 규모 가독성 저하) |
| - | modelValue 를 정규식(date 10자 / dateTime 19자) validator 로 검증 | 잘못된 날짜 문자열을 컴포넌트 경계에서 차단해 내부 파싱 안전 확보 | 런타임 파싱 실패 처리(늦은 에러) |
| - | 5개 모드(date/dateTime/dateMulti/dateRange/dateTimeRange)를 단일 컴포넌트가 prop 으로 분기 | 날짜 선택 UI 를 공유하며 모드만 다르므로 컴포넌트 통합이 자연스러움 | 모드별 별도 컴포넌트(중복 UI) |
| - | 시각 포맷을 `options.timeFormat`(문자열 또는 [main, expanded] 배열)로 지정 | 범위 모드에서 시작/끝 달력이 다른 시각 포맷을 가질 수 있어 배열 허용 | 단일 포맷 고정(범위 유연성 부족) |
