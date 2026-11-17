# 의존성 및 GitHub Actions 보안 점검

점검일: 2026-11-17. 루트와 모든 워크스페이스의 package.json 5개, 기존 워크플로 5개, pnpm 잠금 파일 전체를 검사했다. npm 레지스트리의 버전·engines·peerDependencies, npm audit 권고, 공식 마이그레이션 문서와 실제 빌드를 확인했다.

## 보안 검사 결과

| 심각도 | 변경 전 | 변경 후 |
| ------ | ------: | ------: |
| 치명적 |       8 |       0 |
| 높음   |     101 |       0 |
| 보통   |      83 |       0 |
| 낮음   |      19 |       0 |

이 숫자는 pnpm audit 집계이며 동일 패키지의 여러 권고나 의존 경로가 포함된다. 알려진 권고의 검사 결과이며 취약점 부재를 보증하지 않는다. 변경 전 전체 권고·영향을 받는 직접 의존성은 [advisories-before.json](./advisories-before.json), 최종 원본 결과는 [audit-after.json](./audit-after.json)에 있다. 운영·개발 의존성을 모두 검사했고 제외하거나 무시한 권고는 없다.

## 패키지별 검토

버전은 package.json 선언 범위다. 괄호 안은 잠금 파일의 실제 버전이다. 권고 수는 변경 전 해당 직접 패키지 또는 그 하위 경로에 연결된 npm 권고 수이며, 표 간 중복될 수 있다. 변경 후에는 모두 알려진 권고 0건이다.

### package.json

| 패키지                 | 변경 전          | 변경 후            | 변경 전 권고 |
| ---------------------- | ---------------- | ------------------ | ------------ |
| @evui/eslint-config    | workspace:*      | workspace:*        | 내부 패키지  |
| @evui/stylelint-config | workspace:*      | workspace:*        | 내부 패키지  |
| eslint                 | —                | ^10.15.0 (10.15.0) | 0            |
| husky                  | ^9.0.11 (9.0.11) | ^9.1.7 (9.1.7)     | 0            |
| lint-staged            | ^15.2.5 (15.2.7) | ^17.6.1 (17.6.1)   | 0            |
| nx                     | 19.0.4 (19.0.4)  | ^24.0.6 (24.0.6)   | 0            |
| prettier               | ^3.2.5 (3.3.2)   | ^3.10.1 (3.10.1)   | 0            |
| stylelint              | ^16.6.1 (16.6.1) | ^18.0.0 (18.0.0)   | 0            |
| typescript             | —                | ~5.9.3 (5.9.3)     | 0            |
| vue                    | —                | ^3.5.45 (3.5.45)   | 0            |

### apps/docs/package.json

| 패키지                       | 변경 전          | 변경 후          | 변경 전 권고 |
| ---------------------------- | ---------------- | ---------------- | ------------ |
| @chromatic-com/storybook     | ^1.4.0 (1.6.0)   | —                | 0            |
| @storybook/addon-a11y        | ^8.1.2 (8.1.11)  | ^10.6.7 (10.6.7) | 0            |
| @storybook/addon-actions     | ^8.1.2 (8.1.11)  | —                | 0            |
| @storybook/addon-backgrounds | ^8.1.2 (8.1.11)  | —                | 0            |
| @storybook/addon-controls    | ^8.1.2 (8.1.11)  | —                | 0            |
| @storybook/addon-docs        | ^8.1.6 (8.1.11)  | ^10.6.7 (10.6.7) | 0            |
| @storybook/addon-essentials  | ^8.1.2 (8.1.11)  | —                | 0            |
| @storybook/addon-links       | ^8.1.2 (8.1.11)  | ^10.6.7 (10.6.7) | 0            |
| @storybook/addon-toolbars    | ^8.1.2 (8.1.11)  | —                | 0            |
| @storybook/blocks            | ^8.1.1 (8.1.11)  | —                | 0            |
| @storybook/test              | ^8.1.1 (8.1.11)  | —                | 0            |
| @storybook/vue3              | ^8.1.1 (8.1.11)  | ^10.6.7 (10.6.7) | 0            |
| @storybook/vue3-vite         | ^8.1.1 (8.1.11)  | ^10.6.7 (10.6.7) | 0            |
| @vitejs/plugin-vue           | —                | ^6.0.11 (6.0.11) | 0            |
| evui                         | workspace:*      | workspace:*      | 내부 패키지  |
| storybook                    | ^8.1.1 (8.1.11)  | ^10.6.7 (10.6.7) | 0            |
| typescript                   | —                | ~5.9.3 (5.9.3)   | 0            |
| vite                         | —                | ^8.3.8 (8.3.8)   | 0            |
| vue                          | ^3.4.27 (3.4.31) | ^3.5.45 (3.5.45) | 0            |

### packages/evui/package.json

| 패키지                  | 변경 전            | 변경 후            | 변경 전 권고 |
| ----------------------- | ------------------ | ------------------ | ------------ |
| @types/lodash           | —                  | ^4.17.27 (4.17.27) | 0            |
| @types/lodash-es        | ^4.17.12 (4.17.12) | ^4.17.12 (4.17.12) | 0            |
| @types/node             | ^20.14.9 (20.14.9) | ^24.19.2 (24.19.2) | 0            |
| @vitejs/plugin-vue      | ^5.0.4 (5.0.5)     | ^6.0.11 (6.0.11)   | 0            |
| @vue/language-core      | —                  | ~3.2.9 (3.2.9)     | 0            |
| @vue/tsconfig           | ^0.5.1 (0.5.1)     | ^0.9.1 (0.9.1)     | 0            |
| bignumber.js            | ^9.1.2 (9.1.2)     | ^9.3.1 (9.3.1)     | 0            |
| dayjs                   | ^1.11.11 (1.11.11) | ^1.11.23 (1.11.23) | 0            |
| glob                    | ^10.3.15 (10.4.2)  | ^14.0.6 (14.0.6)   | 0            |
| korean-regexp           | ^1.0.12 (1.0.12)   | ^1.0.13 (1.0.13)   | 0            |
| lodash-es               | ^4.17.21 (4.17.21) | ^4.18.1 (4.18.1)   | 0            |
| sass                    | ^1.77.2 (1.77.6)   | ^1.108.2 (1.108.2) | 0            |
| tsx                     | ^4.11.0 (4.16.0)   | ^4.23.15 (4.23.15) | 0            |
| typescript              | ^5.4.5 (5.5.2)     | ~5.9.3 (5.9.3)     | 0            |
| vite                    | ^5.2.11 (5.3.2)    | ^8.3.8 (8.3.8)     | 0            |
| vite-plugin-dts         | ^3.9.1 (3.9.1)     | ^5.1.2 (5.1.2)     | 0            |
| vue                     | ^3.4.27 (3.4.31)   | ^3.5.45 (3.5.45)   | 0            |
| vue-resize-observer     | ^2.0.15 (2.0.16)   | ^2.0.16 (2.0.16)   | 0            |
| vue-tsc                 | ^2.0.6 (2.0.24)    | ~3.2.9 (3.2.9)     | 0            |
| vue3-observe-visibility | ^1.0.1 (1.0.1)     | ^1.0.7 (1.0.7)     | 0            |

### packages/eslint-config/package.json

| 패키지                 | 변경 전          | 변경 후            | 변경 전 권고 |
| ---------------------- | ---------------- | ------------------ | ------------ |
| @eslint/js             | ^8.56.0 (8.57.0) | ^10.0.1 (10.0.1)   | 0            |
| eslint                 | ^8.56.0 (8.57.0) | ^10.15.0 (10.15.0) | 0            |
| eslint-config-prettier | ^9.1.0 (9.1.0)   | ^10.1.8 (10.1.8)   | 0            |
| eslint-plugin-vue      | ^9.26.0 (9.26.0) | ^10.12.1 (10.12.1) | 0            |
| globals                | —                | ^17.14.0 (17.14.0) | 0            |
| typescript             | —                | ~5.9.3 (5.9.3)     | 0            |
| typescript-eslint      | ^7.12.0 (7.14.1) | ^8.73.0 (8.73.0)   | 0            |
| vue-eslint-parser      | —                | ^10.4.2 (10.4.2)   | 0            |

### packages/stylelint-config/package.json

| 패키지                            | 변경 전          | 변경 후          | 변경 전 권고 |
| --------------------------------- | ---------------- | ---------------- | ------------ |
| postcss-html                      | —                | ^2.0.1 (2.0.1)   | 0            |
| stylelint                         | ^16.6.1 (16.6.1) | ^18.0.0 (18.0.0) | 0            |
| stylelint-config-html             | ^1.1.0 (1.1.0)   | ^2.0.0 (2.0.0)   | 0            |
| stylelint-config-recommended      | ^14.0.0 (14.0.1) | ^19.0.0 (19.0.0) | 0            |
| stylelint-config-recommended-scss | ^14.0.0 (14.0.0) | ^18.0.0 (18.0.0) | 0            |
| stylelint-config-recommended-vue  | ^1.5.0 (1.5.0)   | ^2.0.0 (2.0.0)   | 0            |
| stylelint-config-standard-scss    | ^13.1.0 (13.1.0) | ^18.0.0 (18.0.0) | 0            |
| stylelint-order                   | ^6.0.4 (6.0.4)   | ^8.1.3 (8.1.3)   | 0            |
| stylelint-scss                    | ^6.3.1 (6.3.2)   | ^7.5.0 (7.5.0)   | 0            |

## 호환성 결정과 수정

- Vite 5 → 8.3.8, Vue 플러그인 6.0.11, Vue 3.5.45, Storybook 10.6.7을 함께 적용했다. Vite 8은 Rolldown을 사용하므로 build.rolldownOptions로 전환했다. CSS 이름은 style로 명시해 기존 evui/style 진입점과 dist/style.css를 유지했다. 라이브러리의 브라우저 target도 기존 Vite 5.3.2에 포함된 기본값(es2020, Edge 88, Firefox 78, Chrome 87, Safari 14)으로 명시해 기본 지원 범위가 바뀌지 않게 했다.
- 개발 환경은 Node 24(.nvmrc), pnpm 10.34.9로 고정했다. 루트 engines는 도구의 요구사항에 맞춰 Node ^22.22.2 또는 >=24.15.0이다. 배포 라이브러리의 Node >=18 요구사항은 기존과 같으며 개발 도구의 실행 요건과 구분된다.
- TypeScript 최신 7은 typescript-eslint가 지원하지 않아 5.9.3을 사용한다. ESLint 설정 워크스페이스와 문서에도 직접 명시해 pnpm이 호환되지 않는 peer를 자동 설치하지 않게 했다.
- vue-tsc/@vue/language-core 최신 3.3.14 조합에서 배포 선언에 미정의 __VLS_ResolveDirectives가 포함되는 오류를 재현했다. 소비자 타입 검사가 통과하는 3.2.9 계열(~3.2.9)을 선택했다.
- vite-plugin-dts 5는 processor/entryRoot/include를 명시했다. API Extractor의 Vue 선언 병합 오류로 선언을 개별 파일로 배포한다. dist/index.d.ts와 공개 export는 유지된다. lodash 추론 타입의 이동 가능성을 위해 @types/lodash를 직접 명시했다.
- bignumber.js는 API 변경 위험을 줄이기 위해 최신 메이저 11 대신 기존 메이저의 9.3.1을 선택했다. 사용 중인 연산 API와 알려진 보안 권고를 확인했다.
- @types/lodash-es는 이미 최신 4.17.12여서 유지했다. 나머지 외부 직접 의존성은 표와 같이 올렸다. 내부 workspace 링크는 유지했다.
- Storybook에 통합된 actions/backgrounds/controls/essentials/toolbars, 경로가 통합된 blocks/test 패키지를 제거했다. 기존 코드에는 blocks/test import가 없었다. 설정에도 사용되지 않던 Chromatic 애드온을 제거했다.
- 아이콘 스토리가 라이브러리에 존재하지 않는 iconList를 가져오던 문제를 수정했다. 실제 CSS의 아이콘 목록을 읽어 283개를 렌더링한다.
- eslint-plugin-vue 10에 맞춰 globals를 명시하고 생성된 storybook-static을 검사에서 제외했다. stylelint-scss에서 제거된 at-import 규칙 두 개를 load 규칙으로 교체했다.
- Nx와 API Extractor가 고정한 minimatch 10은 권고 GHSA-g3hv-75wg-m249 대상이다. 두 부모에만 minimatch ^11.0.9 override를 적용했다. Nx 프로젝트 탐색과 실제 전체 빌드로 동작을 검증했다. 광역 메이저 강제 변경은 하지 않았다.

## 워크플로 점검

| 대상          | 문제                                                                     | 반영                                                                       |
| ------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| checkout      | v2/v3, 가변 태그                                                         | v7.0.1 커밋 SHA 고정, credentials 저장 해제                                |
| setup-node    | v2 / Node 12                                                             | v7.1.0 SHA 고정, .nvmrc 사용                                               |
| cache         | v2, node_modules 전체 저장, npm lock 기준                                | 제거하고 setup-node의 pnpm store 캐시 사용                                 |
| pnpm          | npm install 사용                                                         | action-setup v6.1.1 SHA 고정, packageManager 버전 사용, frozen/strict 설치 |
| 문서 배포     | 없는 docs_build, 예전 docs 경로                                          | pnpm build 및 apps/docs/storybook-static 배포; 기존 3.0 브랜치 트리거 유지 |
| gh-pages      | v3, 별도 GH_ACTIONS_TOKEN                                                | v4.1.0 SHA 고정, 작업용 GITHUB_TOKEN 사용                                  |
| npm 배포      | 없는 build:lib, 루트 publish                                             | evui만 빌드·게시, release published 이벤트, prerelease는 next 태그         |
| 이슈 관리 3개 | actions-cool/issues-helper 저장소 접근 403: GitHub staff에 의해 비활성화 | GitHub 공식 github-script v9.0.0 SHA와 로컬 검토 가능한 코드로 대체        |

워크플로별 최소 permissions, timeout을 명시했다. 이슈 코드에는 외부 입력을 스크립트로 삽입하지 않으며 PR과 비작성자의 댓글은 무시한다. 닫기 직전에 최근 활동을 다시 검사한다. pnpm install에서 실행 가능한 의존성 빌드 스크립트도 onlyBuiltDependencies로 제한했다.

새 security.yml은 PR·develop/3.0 push·주간 일정에서 strict 설치, 전체 audit, 이슈 자동화 테스트, 전체 빌드를 수행한다. Dependabot은 npm 및 Actions 업데이트를 주간 검사한다. 실제 GitHub 배포·이슈 변경·npm 게시는 실행하지 않았다.

커밋 훅 검증에서 lint-staged가 `.gitignore`·`.nvmrc`의 포맷 파서를 찾지 못하는 문제를 확인했다. Prettier에 `--ignore-unknown`을 적용해 지원하지 않는 파일을 건너뛰도록 수정했다.

## 검증 결과와 남은 사항

- pnpm install --frozen-lockfile --strict-peer-dependencies 통과.
- pnpm audit --json: 0건(개발 의존성 포함).
- NX_DAEMON=false NX_ISOLATE_PLUGINS=false pnpm build --output-style=static: evui와 docs 모두 통과.
- 배포 dist/index.d.ts를 소비하는 별도 TypeScript strict 검사 통과(skipLibCheck 사용 안 함).
- pnpm --filter evui pack으로 JS/UMD/CSS/선언 파일 포함 확인.
- 이슈 자동화 node:test 5개 통과.
- actionlint 1.7.12 전체 워크플로 검사 통과.
- 변경한 JS/TS/CJS 파일 ESLint 오류 0개, Prettier와 git diff --check 통과.
- 실제 브라우저에서 버튼, 그리드 50행 및 헤더 클릭, 아이콘 283개 렌더링 확인. 그리드·아이콘 확인 중 pageerror 0개. 최초 favicon.ico 404는 정적 서버의 아이콘 요청이다.
- 전체 린트는 통과하지 않는다. 원본 HEAD를 임시 폴더에 설치한 비교에서 ESLint 오류 82개 → 110개, Stylelint 오류 886개 → 890개다. 새 권장 규칙이 추가된 영향이 있으며 소스 전반의 규칙 위반 정리는 이 변경에 포함하지 않았다. 파서 오류·알 수 없는 Stylelint 규칙 오류는 없다.
- Sass @import/전역 내장 함수 폐기 예정 경고, 번들 크기 경고가 남는다. 현재 빌드는 통과한다.
- 라이브러리는 브라우저 전역 window를 사용하므로 Node에서 직접 import하는 SSR 동작은 검증 통과 대상이 아니다. 브라우저 실행을 검증했다.
- 모든 컴포넌트의 시각적·상호작용 회귀 테스트나 Node 22 실행 검증까지 수행한 것은 아니다. CI의 실제 배포 권한·레포 설정은 GitHub 실행 시 확인해야 한다.

## 근거

- [Vite 지원 버전](https://vite.dev/releases), [Vite 8 마이그레이션](https://vite.dev/guide/migration)
- [Storybook 8→9 마이그레이션](https://storybook.js.org/docs/releases/migration-guide-from-older-version), [Storybook 10 마이그레이션](https://storybook.js.org/docs/releases/migration-guide)
- [npm 공식 레지스트리](https://registry.npmjs.org/): 각 패키지 버전, engines, peerDependencies를 직접 조회했다.
- [minimatch 보안 권고](https://github.com/advisories/GHSA-g3hv-75wg-m249)
- [checkout 릴리스](https://github.com/actions/checkout/releases/tag/v7.0.1), [setup-node 릴리스](https://github.com/actions/setup-node/releases/tag/v7.1.0), [gh-pages 릴리스](https://github.com/peaceiris/actions-gh-pages/releases/tag/v4.1.0)

## 후속 시각 검증

[시각 검증 보고서](./visual-review-2026-11-17.md): 기존 스토리와 추가 컴포넌트를 포함한 164쌍의 이미지가 모두 픽셀 단위로 일치했다. 기존 체크박스·컨텍스트 메뉴 예제의 렌더 오류 두 개를 수정했다. 기존 좁은 화면 가로 넘침과 다크 테마 제약도 별도 기록했다.
