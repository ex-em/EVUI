# 3.4 의존성·워크플로 보안 업데이트

점검일: 2026-11-17. 기준: 93dfc3c559ac6be94f71248b49ad6a305eac85c1. develop의 모노레포 변경을 cherry-pick하지 않고 3.4의 npm 단일 패키지·릴리스·기존 테스트 구성을 기준으로 검토했다. 컴포넌트 구현과 공개 API 계약은 변경하지 않았다.

## 보안 결과와 잔여 위험

| npm audit 집계 | 변경 전 | 변경 후 |
| -------------- | ------: | ------: |
| 치명적         |       4 |       0 |
| 높음           |       3 |       0 |
| 보통           |      39 |      35 |
| 낮음           |       0 |       0 |

운영 의존성(`npm audit --omit=dev`)은 **0건**이다. 개발 의존성까지 포함하면 **보통 35건의 전파 집계가 남는다**. 근본 권고는 다음 두 개이며 semantic-release의 npm CLI 번들 경로에 연결된다. 모든 권고가 해결되었다고 주장하지 않는다.

- [glob GHSA-3g3m-2fjr-6pw4](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4): `node_modules/npm/node_modules/glob`.
- [minimatch GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249): `node_modules/npm/node_modules/minimatch`.

일반 간접 의존성의 취약 범위는 glob ^14.0.6 / minimatch ^11.0.9 overrides로 교체했다. npm CLI의 번들 내부에는 overrides가 적용되지 않는 것을 실제 설치와 audit로 확인했다. 최신 npm 12.2.2도 glob ^13.0.6과 minimatch ^10.2.5를 번들한다. 오래된 semantic-release로 내려 수치를 숨기거나 node_modules를 수동 수정하지 않았다. 개발·패키징 도구의 임의 패턴에 따른 자원 소모 위험은 남으며 업스트림 패치가 필요하다. 해당 npm CLI는 배포 라이브러리의 runtime dependency에는 포함되지 않는다.

`npm run audit`는 전체 집계와 두 잔여 권고를 출력한다. CI 예외는 **위 두 ID + 정확한 npm 번들 경로 + 보통 심각도**에만 한정한다. 다른 경로·새 권고·심각도 상승·불완전한 검사 응답은 실패한다. 예외 경계를 node:test 6개로 확인했다. 운영 의존성은 예외 없는 audit를 별도로 실행한다.

원본 결과: [이전](./3.4/audit-before.json), [이후](./3.4/audit-after.json), [운영 의존성](./3.4/audit-production.json). npm의 패키지 전파 집계와 개별 권고 개수는 구분해야 한다.

## 패키지별 검토

범위는 package.json 선언, 괄호는 실제 잠금 버전이다. 모든 직접 패키지의 공식 버전·engines·peerDependencies를 조회하고 아래 빌드·테스트로 최종 조합을 검증했다.

| 패키지                          | 변경 전            | 변경 후            |
| ------------------------------- | ------------------ | ------------------ |
| @codemirror/lang-javascript     | ^6.2.5 (6.2.5)     | ^6.2.5 (6.2.5)     |
| @codemirror/state               | ^6.7.1 (6.7.1)     | ^6.7.6 (6.7.6)     |
| @commitlint/cli                 | ^20.3.1 (20.4.1)   | ^21.2.4 (21.2.4)   |
| @commitlint/config-conventional | ^20.3.1 (20.4.1)   | ^21.2.4 (21.2.4)   |
| @eslint/eslintrc                | —                  | ^3.3.7 (3.3.7)     |
| @eslint/js                      | —                  | ^9.39.5 (9.39.5)   |
| @semantic-release/changelog     | ^6.0.3 (6.0.3)     | ^7.0.0 (7.0.0)     |
| @semantic-release/git           | ^10.0.1 (10.0.1)   | ^11.0.1 (11.0.1)   |
| @stylistic/stylelint-plugin     | —                  | ^6.0.1 (6.0.1)     |
| @vitejs/plugin-vue              | ^5.1.4 (5.2.4)     | ^6.0.11 (6.0.11)   |
| @vitest/browser                 | ^4.0.18 (4.0.18)   | ^4.1.12 (4.1.12)   |
| @vitest/browser-playwright      | ^4.0.18 (4.0.18)   | ^4.1.12 (4.1.12)   |
| @vitest/coverage-v8             | ^4.0.18 (4.0.18)   | ^4.1.12 (4.1.12)   |
| @vue/compiler-sfc               | ^3.5.8 (3.5.27)    | ^3.5.45 (3.5.45)   |
| @vue/test-utils                 | ^2.4.6 (2.4.6)     | ^2.6.0 (2.6.0)     |
| bignumber.js                    | ^9.3.1 (9.3.1)     | ^9.3.1 (9.3.1)     |
| codemirror                      | ^6.0.2 (6.0.2)     | ^6.0.2 (6.0.2)     |
| dayjs                           | ^1.11.19 (1.11.19) | ^1.11.23 (1.11.23) |
| eslint                          | ^8.57.1 (8.57.1)   | ^9.39.5 (9.39.5)   |
| eslint-config-exem              | ^3.0.3 (3.1.2)     | ^3.1.2 (3.1.2)     |
| eslint-config-prettier          | ^10.1.8 (10.1.8)   | ^10.1.8 (10.1.8)   |
| eslint-plugin-import            | ^2.21.2 (2.32.0)   | ^2.32.0 (2.32.0)   |
| eslint-plugin-vue               | ^8.7.1 (8.7.1)     | ^10.12.1 (10.12.1) |
| gh-pages                        | ^6.1.1 (6.3.0)     | ^6.3.0 (6.3.0)     |
| highlight.js                    | ^10.2.0 (10.7.3)   | ^11.12.0 (11.12.0) |
| husky                           | ^9.1.7 (9.1.7)     | ^9.1.7 (9.1.7)     |
| jsdom                           | ^27.4.0 (27.4.0)   | ~27.4.0 (27.4.0)   |
| korean-regexp                   | ^1.0.10 (1.0.13)   | ^1.0.13 (1.0.13)   |
| lint-staged                     | ^16.2.7 (16.2.7)   | ^17.6.1 (17.6.1)   |
| lodash-es                       | ^4.18.1 (4.18.1)   | ^4.18.1 (4.18.1)   |
| marked                          | ^14.1.2 (14.1.4)   | ^18.2.1 (18.2.1)   |
| marked-gfm-heading-id           | ^4.1.3 (4.1.3)     | ^4.1.4 (4.1.4)     |
| playwright                      | ^1.58.1 (1.58.2)   | ^1.65.1 (1.65.1)   |
| postcss-html                    | —                  | ^2.0.1 (2.0.1)     |
| postcss-scss                    | —                  | ^4.0.9 (4.0.9)     |
| prettier                        | ^3.7.4 (3.8.1)     | ^3.10.1 (3.10.1)   |
| rimraf                          | —                  | ^6.1.4 (6.1.4)     |
| sass                            | ^1.94.2 (1.97.3)   | ^1.108.2 (1.108.2) |
| semantic-release                | ^25.0.2 (25.0.3)   | ^25.0.9 (25.0.9)   |
| stylelint                       | ^16.9.0 (16.26.1)  | ^18.0.0 (18.0.0)   |
| stylelint-order                 | ^6.0.4 (6.0.4)     | ^8.1.3 (8.1.3)     |
| typescript                      | ^5.0.0 (5.9.3)     | ~5.9.3 (5.9.3)     |
| vite                            | ^5.4.8 (5.4.21)    | ^8.3.8 (8.3.8)     |
| vitest                          | ^4.0.18 (4.0.18)   | ^4.1.12 (4.1.12)   |
| vitest-browser-vue              | ^2.0.2 (2.0.2)     | ^2.1.0 (2.1.0)     |
| vue                             | ^3.5.8 (3.5.27)    | ^3.5.45 (3.5.45)   |
| vue-eslint-parser               | —                  | ^10.4.2 (10.4.2)   |
| vue-router                      | ^4.6.3 (4.6.4)     | ^5.5.1 (5.5.1)     |
| vue3-observe-visibility         | ^1.0.1 (1.0.4)     | ^1.0.7 (1.0.7)     |

## 호환성 결정

- Vite 8.3.8 / Vue 플러그인 6.0.11 / Vue 3.5.45를 함께 적용했다. 라이브러리는 rolldownOptions로 전환하고 CSS 이름을 style로 명시했다. ESM·UMD·style.css 경로와 기존 Vite 5의 브라우저 대상(es2020, Edge 88, Firefox 78, Chrome 87, Safari 14)을 유지한다.
- Node 24(.nvmrc), npm 11(packageManager 11.19.1)을 사용한다. Node/npm 요구사항은 devEngines에만 지정해 개발 도구에 적용한다. 배포 라이브러리의 일반 engines를 새로 제한하지 않는다. `npm ci --strict-peer-deps`로 깨끗하게 재설치했다.
- Vitest 계열은 보안 수정된 4.1.12로 맞췄다. 최신 5의 기본 mock 정리 등 계약 변경은 섞지 않았다. vitest-browser-vue도 호환되는 2.1.0을 선택했다.
- jsdom 31에서 분리된 요소의 inline display:none은 유지되지만 getComputedStyle().display가 빈 문자열을 반환해 기존 숨김 테스트 4개가 실패하는 것을 재현했다. 제품 코드를 바꾸지 않고 jsdom 27.4 계열을 유지했다. @vue/test-utils는 2.6.0으로 올렸다.
- Node 24의 실험적 전역 WebStorage가 jsdom의 localStorage에 끼어들어 기존 검사 47개가 실패했다. 단위 테스트·watch·coverage 실행에서 --no-experimental-webstorage를 사용해 브라우저 저장소를 검사한다. 테스트를 삭제하거나 기대값을 완화하지 않았다.
- ESLint 10은 eslint-plugin-import 2.32.0의 peer 범위 밖이어서 9.39.5를 선택했다. **ESLint 9의 지원 종료 경고는 남는다.** FlatCompat로 조직 규칙을 유지하고 Vue import 파서를 명시했다. caughtErrors 기본값과 unused-disable 처리는 이전 동작을 유지하며 새 no-constant-binary-expression 권고는 경고로 표시한다. 조직 설정 패키지가 설치하던 중복 ESLint 7은 부모별 override로 루트 버전에 맞췄다.
- Stylelint 18에서 제거된 포맷 규칙은 @stylistic/stylelint-plugin의 CSS/SCSS 이름 공간으로 이관하고 Vue/SCSS 구문을 지정했다. 알 수 없는 규칙·파서·옵션 오류는 없다.
- semantic-release 최신 26은 Node >=26.13을 요구하므로 Node 24에서 동작하는 25.0.9를 사용한다. changelog/git 플러그인은 호환되는 새 버전으로 올렸다. 릴리스 커밋에 package-lock.json도 포함해 버전 기록이 어긋나지 않게 한다. 실제 릴리스는 실행하지 않았다.
- bignumber.js는 기존 연산 API를 유지하는 9.3.1, TypeScript는 기존 도구 계열인 5.9.3을 유지했다. 이미 최신인 패키지도 유지했다. 나머지는 표의 호환 업데이트다.
- build:lib에서 쓰지만 선언하지 않았던 rimraf를 직접 명시했다.

## 워크플로

기존 9개 파일을 모두 검토했다. checkout v7.0.1, setup-node v7.1.0, gh-pages v4.1.0, github-script v9.0.0을 공식 태그의 커밋 SHA로 고정하고 작업별 permissions·timeout을 지정했다.

- GitHub에서 비활성화된 actions-cool/issues-helper 3개 작업은 공식 github-script와 로컬 코드로 대체했다. 이슈 라벨·3일 후 닫기·작성자 활동 시 라벨 제거를 테스트 5개로 확인했다.
- 문서 배포 브랜치는 3.4를 유지하고 소스·잠금 파일·Vite 설정도 트리거에 포함한다. 기존 dist로 배포하며 작업용 GITHUB_TOKEN을 쓴다.
- 릴리스의 기존 RELEASE_TOKEN/NPM_TOKEN과 수동 branch/dry-run 흐름을 유지한다. checkout에 자격 증명을 남기지 않고 semantic-release가 릴리스용 토큰을 사용한다. 실제 배포는 실행하지 않았다.
- commitlint는 즉석 npm install 대신 잠금 파일로 설치하고 SHA를 환경 변수로 전달한다.
- self-hosted 메시지 relay에는 코드 checkout을 추가하지 않았다. 원본 저장소에서만 실행하고 URL이 없으면 건너뛰며 HTTP 연결·전송 시간을 제한한다. relay를 수동 실행하거나 메시지를 보내지 않았다.
- 단위/브라우저 작업을 유지하고 보안·운영 audit·API 문서·양쪽 빌드·보안 스크립트 테스트를 CI에 추가했다. 주간 검사와 3.4 대상 Dependabot도 추가했다.

## 검증

- 단위 테스트 **1,686개 통과**. 소스·기대값 수정 없음.
- 브라우저 회귀 **44개 통과**: 차트 스크린샷 17개와 blit·실시간·선택·툴팁·worker 검사. macOS에서 Playwright 1.65.1에 대응하는 Chromium을 사용했으며 커밋된 스크린샷을 갱신하지 않았다.
- 단위 테스트의 canvas 미구현 안내, 브라우저 테스트의 ResizeObserver loop·decodeEntities 로그는 남는다. 종료 코드는 0이며 운영 문서 비교에서는 pageerror가 없었다.
- API 문서 스키마: 6개 파일, 2,103개 노드 통과.
- 이슈 자동화·보안 gate 테스트 11개, actionlint, 변경 설정 ESLint, 포맷/공백 검사 통과.
- 전체 src ESLint: 오류 0개, 경고 3개. 원본은 오류/경고 0개이며 새 경고는 새 권장 규칙과 Vue 속성 표기다. 전체 Stylelint는 소스 포맷 규칙 위반 212개가 남는다.
- 두 Vite 빌드 통과. 공개 export **34개가 전후 동일**하고 ESM/UMD/style.css를 확인했다.
- npm ci --strict-peer-deps 실제 재설치 및 dry-run으로 잠금 파일 재현성을 확인했다.

## 시각 검증

원본과 업데이트된 실제 문서 사이트를 같은 Chromium·날짜·난수·폰트 로딩 조건에서 비교했다. 12개 대표 경로를 1440×1000과 390×844에서 검사한 **24쌍 중 18쌍은 RGBA 데이터가 완전히 일치**했다. 나머지 6쌍의 0.013~0.061% 차이는 직접 열어 확인한 결과 highlight.js 11의 코드 토큰 색상 분류 변화였다. 레이아웃 회귀나 라우팅·렌더 오류는 발견하지 못했다.

[수치](./3.4/visual-results.json) · [코드 색상 차이](./3.4/highlight-differences.png)

390px에서 문서 헤더 문구 겹침과 좁은 상세 영역 등 기존 반응형 제약은 전후 동일하게 남는다. Safari·Firefox·실제 모바일과 모든 prop 조합을 검사한 것은 아니다.

## 근거

- [Vite 8 마이그레이션](https://vite.dev/guide/migration)
- [Vitest 마이그레이션](https://vitest.dev/guide/migration/)
- [Vue Router 5 마이그레이션](https://router.vuejs.org/guide/migration/v4-to-v5.html)
- [npm 공식 레지스트리](https://registry.npmjs.org/): 각 직접 패키지의 버전·engines·peerDependencies를 조회했다.
- 남은 개별 보안 권고와 실제 경로는 위 보안 결과에 직접 연결했다.

## CI 인자 전달 후속 수정

최초 PR의 Commitlint 작업에서 npm이 `--from`·`--to`를 자신의 옵션으로 해석해 실패했다. 커밋 메시지 자체는 유효했다. `npx --no -- commitlint ...`처럼 명시적인 구분자를 추가하고 Playwright·Vitest·semantic-release 호출에도 같은 방식으로 적용했다. 유효 커밋의 검사 통과와 잘못된 메시지의 거부를 확인했으며 실제 릴리스 명령은 실행하지 않았다.
