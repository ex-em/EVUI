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
| 2026-07-29 | Vue 2 시대 컴포넌트 탐색·테이블 유틸 4종(`emitter.js`, `utils.tree.js`, `utils.table.js`, `utils.js`의 `getMatchedComponents*`) 제거 (#2323) | 소비자 0에 배포 산출물은 `dist`뿐(`exports`에 서브패스 없음)이라 외부 계약도 없음 → 유지 비용만 남음. `$children`을 쓰는 하향 탐색은 Vue 3에서 실행 자체가 불가하고, 나머지는 Options API mixin·`$parent` 체인 탐색으로 Composition API 전용인 현 코드베이스에 소비자가 생길 여지가 없다 | 파일 유지 + 하향 탐색의 `result.concat` 결함만 수정(실행 불가 함수의 버그를 고치는 셈) / 이슈 명시 범위(utils.table + getMatchedComponents\*)만 제거하고 emitter·utils.tree 유지(소비자 0 파일이 남음) |
| 2026-07-29 | `utils.debounce.js`의 rAF 경로를 제거하지 않고 `globalThis` 참조로 되살림 (#2323) | 미정의 `root` 참조는 lodash 포팅 시 내부 `root` 모듈 import 를 누락한 것 → 원본 계약(wait 생략 시 rAF)을 그대로 두는 편이 upstream diff 가 최소이고 「lodash 포팅 충실 보유」 결정과 정합. `window` 대신 `globalThis` 는 `Console` 래퍼와 같은 이유(worker 컨텍스트) | rAF 경로 제거 후 setTimeout 전용화(코드·JSDoc 3곳 삭제, upstream divergence 확대) / lodash 원본처럼 `root` 정의 모듈을 추가(모던 타깃에 globalThis 로 충분) |
| 2026-07-29 | worker 계약 검증을 `@vitest-environment node` 스펙 파일로 분리 (`utils.debounce.worker.spec.js`) | jsdom은 `window === globalThis`라 두 참조의 차이를 어떤 단언으로도 구분할 수 없다 — `startTimer`/`cancelTimer`를 `window`로 되돌려도 기존 28개 테스트가 전부 통과했다. window 자체가 없는 런타임이어야 계약이 관찰된다 | 기존 jsdom 스펙에서 `window`를 stub/delete(전역이 곧 window라 테스트 하네스가 함께 붕괴) / 검증 없이 코드 주석·DECISIONS 기술로만 남김 |
