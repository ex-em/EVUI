# common-utils — Decisions

| 날짜 | 결정 | 이유 | 대안 |
|------|------|------|------|
| 2020-09-24 | 컴포넌트 무관 공용 유틸을 `src/common` 플랫 파일(emitter/utils/utils.table/utils.tree/debounce/throttle)로 분리 배치 (c63bcad1) | 컴포넌트 간 중복 구현 제거, 라이브러리 전역 재사용 | 각 컴포넌트 폴더 내 개별 구현 |
| 2020-09-24 | debounce/throttle을 lodash 소스에서 포팅해 자체 보유, 파일 주석에 원본 출처 명시 (c63bcad1) | lodash 런타임 의존 없이 cancel/flush/pending 지원 버전을 두 파일로 보유 | lodash-es 직접 import |
| 2023-07-26 | `mobileCheck`에서 `navigator.maxTouchPoints` 판정 제거 (be0e9c71, #1497) | 터치스크린 노트북·태블릿 연결 데스크탑이 1 이상을 반환해 모바일로 오판 → mousemove 이벤트 차단 | maxTouchPoints 판정 유지 |
| 2024-01-23 | 부동소수점 안전 연산을 bignumber.js 래퍼(`utils.bignumber.js`)로 도입 (137e11f8, #1555) | Grid Summary 컬럼별 decimal 옵션에서 오차 없는 합산·나눗셈·내림 필요 | 네이티브 Number 연산 + 반올림 보정 |
| 2026-02-02 | 테스트 파일을 소스 옆 co-location(`*.spec.js`)으로 이관 (cb48a791) | 소스-테스트 근접 배치 패턴으로 통일 | 별도 테스트 디렉토리 유지 |
| 2026-06-11 | `Console` 래퍼가 `window.console` 대신 `globalThis.console` 참조 (3de47b65) | worker(render off-main) 컨텍스트에는 window가 없어 import 시점에 실패 — window/worker 공통 참조 필요 | worker 전용 콘솔 모듈 분리 |
| - | 공용 유틸을 `src/main.js` 공개 API로 export하지 않고 내부 전용으로 유지 | main.js에 common 모듈 export가 없음(코드 관찰) — 외부 계약 없이 자유롭게 변경 가능 | 공개 유틸 API로 노출 |
