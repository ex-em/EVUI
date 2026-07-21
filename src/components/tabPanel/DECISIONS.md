# TabPanel (EvTabPanel) — Decisions

| 날짜 | 결정 | 이유 | 대안 |
|------|------|------|------|
| - | Tabs 컨텍스트를 inject('evTabs')로 수신 | 탭 헤더(Tabs)와 컨텐츠(TabPanel)를 느슨히 결합 | Tabs 가 패널까지 직접 관리(결합·유연성 저하) |
| - | lazy 렌더 옵션 제공 | 비활성 탭의 무거운 컨텐츠 초기 렌더 비용 회피 | 항상 렌더(초기 비용 증가) |
