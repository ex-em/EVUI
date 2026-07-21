# ChartBrush — Decisions

<!-- 주요 설계 결정과 이유. 새 결정은 테이블 맨 아래에 추가. -->

| 날짜 | 결정 | 이유 | 대안 |
|------|------|------|------|
| 2022-10-11 | ev-chart-brush 를 EvChartGroup 의 provide/inject(brushIdx·evChartClone) 기반 독립 컴포넌트로 도입. show 옵션으로 추가/제거하고, brushIdx 로 zoomStartIdx/zoomEndIdx 변화를 브러시에 표시 (98c65fbd) | 그룹 내 다중 차트에서 chartIdx 로 대상 차트를 선택하고, 메인 차트 인스턴스 직접 참조 없이 반응형 상태만으로 줌과 결합하기 위해 | 차트 컴포넌트 내장 브러시(단일 차트 종속, 그룹 동기화 별도 구현 필요) |
| 2022-10-11 | useDebounce 기본 true — 드래그 중엔 브러시 캔버스만 갱신하고 mouseup 시점에 brushIdx 를 1회 커밋 (98c65fbd 초기 DEFAULT_OPTIONS) | 드래그 중 메인 차트의 연쇄 줌 업데이트 비용 회피 | 실시간 동기 업데이트(useDebounce: false 옵션으로 선택 가능하게 유지) |
| 2022-11-04 | 좌/우 버튼 드래그로 zoom 영역 확대/축소, 구간 폭 고정 grab 이동 기능 추가 (fdcdf20e) | 브러시를 표시 전용이 아닌 줌 구간 조작 UI 로 확장 | 외부 클릭 텔레포트/재드래그만 지원 |
| 2023-09-05 | keep-alive 복귀 시 onActivated 에서 onResize 를 재실행(isMounted 가드 포함) (4a637012) | 다른 메뉴 이동 후 복귀 시 차트가 깨지거나 리사이즈되지 않는 문제 해결 | 컴포넌트 강제 재마운트 |
| 2024-03-22 | 마우스 휠 이동을 useWheelMove 옵션(기본 true)으로 분리 — true 일 때만 wheel 리스너 등록 (4fcf76a5) | 브러시 위 휠 스크롤 동작 여부를 사용 측이 제어할 수 있게 옵션화 | wheel 리스너 무조건 등록(기존 동작) |
| 2026-02-09 | vue-resize-observer 의존을 제거하고 커스텀 v-resize 디렉티브(@/directives/resize)로 교체 (568ded55) | 외부 라이브러리 의존 제거, 차트 계열 컴포넌트 공통 리사이즈 처리 통일 | vue-resize-observer 유지 |
| 2026-04-15 | 드래그 추적을 document 레벨 mousemove/mouseup 리스너로 승격하고 isDragMode 플래그로 grab/button 모드를 명시 구분, initEventState 재진입 가드 추가, mouseleave 리스너 제거 (35c8ffea) | 캔버스 밖으로 마우스가 나가도 드래그가 유지되어야 함 — 기존 canvas 한정 리스너는 영역 이탈 시 조작이 끊김 | 캔버스 mouseleave 에서 드래그 종료(기존 동작) |
| 2026-04-30 | setBrushXAndWidth 경계 클램핑을 버튼 모드와 비버튼 모드로 분리 — 버튼 모드는 렉트 X 이동이 아닌 폭 조정으로 경계 초과를 방지 (ee777c2b) | 버튼 리사이즈 시 폭 유지 클램핑(grab 규칙)을 그대로 쓰면 렉트가 경계 밖으로 밀리는 문제 | 단일 클램핑 규칙 유지(기존 동작) |
| 2026-06-15 | evChartClone.data watcher 에서 getNormalizedData 로 정규화한 뒤 evChart.data 에 할당 — createChart·evChartOption watcher 와 동일 경로로 통일(생산자 측 근본 수정) (7b23fb89) | normalizeData 가 원본을 in-place 변형하지 않게 된 후 클론에 groups 가 빠져 chart.core init/update 가 크래시 | 소비자(chart.core) 측 방어 코드 추가 |
