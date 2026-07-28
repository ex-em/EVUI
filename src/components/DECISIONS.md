# components-common — Decisions

<!-- 주요 설계 결정과 이유. 새 결정은 테이블 맨 아래에 추가. -->

| 날짜 | 결정 | 이유 | 대안 |
|------|------|------|------|
| 2020-09-11 | 컴포넌트 디렉토리별 `index.js`에 `Component.install`을 부여하는 Vue 플러그인 패턴 채택 (3.0 환경 구축, 0a3aadad) | 개별 설치(`app.use(EvXxx)`)와 전체 설치(`app.use(EVUI)`)를 동일 메커니즘으로 지원 | main.js 중앙 집중 등록만 제공 |
| 2020-10-30 | Message류(이후 MessageBox/Notification 동일)를 `app.component` 등록 대신 `globalProperties.$message` 함수로 노출하고 `h()`+`render()`로 직접 마운트 (dd319c67) | 템플릿 배치 없이 명령형 호출로 어디서나 표시 — 문자열/옵션 객체 인자, unmount 콜백 주입 | 선언적 컴포넌트로 등록해 템플릿에 배치 |
| 2025-02-06 | 번들러를 vue-cli에서 Vite로 전환 (ba506b73) | 빌드 도구 교체 — lib 모드(ESM+UMD, vue external)로 라이브러리 빌드 구성 | vue-cli(webpack) 유지 |
| 2025-11-27 | chart 계열에서 VueResizeObserver 플러그인 사용 제거, 네이티브 ResizeObserver 통합 (4ddf37f8) | 외부 플러그인 의존 축소 | vue-resize-observer 유지 |
| 2025-11-28 | SCSS `@import`를 `@use`/`@forward` 문법으로 마이그레이션 (ba9f4244) | sass modern API 대응 — vite.config의 `scss.api: 'modern'` 설정과 일치 | deprecated `@import` 유지 |
| 2026-02-09 | vue-resize-observer를 자체 `v-resize` 디렉티브(`src/directives/resize.js`)로 교체 (568ded55) | 외부 의존 제거, 컴포넌트별 로컬 import로 사용 | 외부 라이브러리 유지 |
| 2026-03-20 | `preserveModules` 트리셰이킹 빌드(06fe8a46, 2026-02-27 도입)를 롤백하고 단일 번들 유지 (84fe88de) | revert 커밋에 사유 미기재 — 현재 상태는 ESM/UMD 단일 번들 | preserveModules 유지 (모듈 단위 산출물) |
| 2026-07-14 | 컴포넌트 API 문서의 SSOT 를 `api/*.md` 에서 `docs/views/apiDocs/data/*.json` 으로 이관(점진적, 미이관 key 만 md 폴백 뷰로 렌더) | 표시용 마크다운은 구조가 없어 딥링크·Try It 플레이그라운드·스키마 검증을 붙일 수 없었다. JSON 은 `npm run docs:validate` 로 필수 필드·중복 name·tryIt 형식을 CI/커밋 훅에서 게이트할 수 있다 | md 유지(구조 없음, 검증 불가), 전 컴포넌트 일괄 이관(리스크·작업량) |
