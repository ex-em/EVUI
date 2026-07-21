# components-common — EVUI 컴포넌트 라이브러리 공통 규약

## Purpose

EVUI(EXEM Vue 3 컴포넌트 라이브러리)의 33개 컴포넌트가 공유하는 **라이브러리 공통 규약**을 정의한다: 플러그인 등록 패턴, 컴포저블(uses.js) 관례, 스타일 규약, 명명 규칙, 익스포트 구조, 문서화 구조. 개별 컴포넌트의 기능 상세는 다루지 않는다.

이 문서는 `src/components` 하위 도메인 SPEC들(예: `chart/SPEC.md` 등이 생길 경우)의 **상위 폴백**이다 — 하위 SPEC에 규정이 없는 공통 사항은 이 문서를 따른다.

## Features

- **컴포넌트별 Vue 플러그인 등록**: 각 컴포넌트 디렉토리의 `index.js`가 SFC를 import한 뒤 `Component.install = (app) => { app.component(Component.name, Component); }`를 부여하고 default export 한다. 이로써 `app.use(EvButton)` 형태의 개별 설치가 가능하다. 33개 중 30개가 이 패턴이며, `icon/index.js`만 추가로 `@/style/lib/icon.css`를 import 한다.
- **함수형 전역 서비스 3종**: `message` / `messageBox` / `notification`은 컴포넌트 등록 대신 `install`에서 `app.config.globalProperties`에 각각 `$message` / `$messagebox` / `$notify` 함수를 주입한다. 호출 시 `h()` + `render()`로 detached container에 직접 마운트하며, 문자열 또는 옵션 객체를 인자로 받고 `unmount` 콜백을 옵션에 주입한다. message/notification은 `document.body`에 고정 id(`ev-message-modal` / `ev-notification-modal`)의 루트 div를 생성해 재사용한다.
- **통합 설치 진입점 (src/main.js)**: 33개 컴포넌트 플러그인을 `components` 배열로 모아 `install(app)`에서 `app.use()` 순회 설치한다. 개별 컴포넌트를 named export 하고, `{ version, install }` 형태의 `EVUI` 객체를 default export 한다. `version`은 `package.json`에서 읽는다.
- **uses.js 컴포저블 관례**: 로직이 큰 컴포넌트 13개(calendar, chart, chartBrush, chartGroup, contextMenu, datePicker, grid, inputNumber, scheduler, select, slider, treeGrid, window)는 `uses.js`에 named export 컴포저블(예: `useModel`, `commonFunctions`)을 두고 SFC `setup()`에서 호출한다. 컴포저블은 인자 대신 `getCurrentInstance()`로 `props` / `emit`에 접근한다.
- **스타일 규약**: SFC 내 `<style lang="scss">` 블록에서 `@use '../../style/index.scss' as *;`로 전역 변수·믹스인·테마를 가져온다(`src/style/index.scss`는 functions/mixins/variables/themes를 `@forward`). 스타일 규모가 큰 4개 컴포넌트(chart, chartGroup, grid, treeGrid)는 `style/<name>.scss`로 분리하고 SFC에서 `@use`로 포함한다.
- **문서화 구조 (docs/views)**: 컴포넌트별로 `docs/views/<이름>/` 아래 `example/*.vue`(예제 SFC), `api/<이름>.md`(API 문서), `props.js`(예제·문서 집계)를 둔다. `props.js`는 `?raw` import + `@vue/compiler-sfc`의 `parse()`로 예제 소스를 파싱해 문서 페이지에 코드와 렌더 결과를 함께 노출한다. 차트는 컴포넌트 디렉토리와 1:1이 아니라 차트 타입별 문서(barChart, lineChart, pieChart, scatterChart, heatMap, comboChart, brushChart, zoomChart)로 나뉜다.
- **공용 디렉티브**: `src/directives/`의 `clickoutside.js`, `resize.js`(자체 ResizeObserver 래핑)를 필요한 컴포넌트가 로컬 import 하여 `directives` 옵션에 등록한다. 전역 디렉티브 등록은 없다.

## Business Rules

- **명명**: 컴포넌트 `name`은 `Ev` 접두사 + PascalCase(`EvButton`, `EvChart`). 루트 CSS 클래스는 `ev-` 접두사 kebab-case(`ev-button`). 디렉토리명은 camelCase(`buttonGroup`, `treeGrid`).
- **SFC 작성 방식**: `<script setup>`을 사용하지 않는다 — options 객체 + `setup()` 함수 방식(Composition API)으로 통일한다. `src/components` 전체에서 `<script setup>` 사용 0건 확인.
- **index.js의 책임**: 등록(install 부여)만 담당한다. 로직·스타일은 SFC와 uses.js에 둔다(예외: icon의 css import).
- **신규 컴포넌트 노출 절차**: `src/main.js`의 import, `components` 배열, named export 3곳에 모두 추가해야 라이브러리에 노출된다.
- **테스트 배치**: `*.spec.js`를 소스 파일과 동일 위치에 둔다(vitest). 비주얼 테스트는 `vitest.config.browser.js`(`npm run test:visual`, Playwright 브라우저 모드)로 분리.
- **유틸리티**: 공용 유틸은 `src/common/`(utils, emitter 등)에 두고, 범용 함수는 lodash-es를 우선 사용한다.
- **(번들 격리)**: 라이브러리 빌드에서 `vue`는 external — 번들에 포함되지 않으며 peerDependency(`vue: *`)로 소비자가 제공한다.
- **(빌드 산출물)**: Vite lib 모드(entry `src/main.js`, name `evui`)로 ESM(`dist/index.js`) + UMD(`dist/index.umd.cjs`) 단일 번들과 `dist/style.css`를 생성한다. package.json `exports`에 `.`(js)과 `./style`(css)을 분리 노출한다.
- **(코드 스타일)**: ESLint(`eslint-config-exem`) + Prettier + stylelint. 커밋은 commitlint(conventional) + husky/lint-staged로 강제된다.

[NEEDS CLARIFICATION: uses.js 분리 기준 — 어느 복잡도부터 로직을 uses.js로 분리하는지 명문화된 기준이 없다 (button 등 20개 컴포넌트는 uses.js 없음)]

[NEEDS CLARIFICATION: SFC 스타일 블록의 scoped 사용 기준 — Grid.vue만 `<style lang="scss" scoped>`이고 나머지(button, select, chart 등)는 non-scoped. 의도된 규약인지 불명]

## Acceptance Criteria

- `app.use(EVUI)` 호출 시 33개 컴포넌트가 전역 등록되고 `$message` / `$messagebox` / `$notify`가 `globalProperties`에 주입된다.
- 개별 컴포넌트를 `import { EvButton } from 'evui'` 후 `app.use(EvButton)` 만으로 단독 사용할 수 있다.
- `npm run build:lib` 실행 시 `dist/index.js`, `dist/index.umd.cjs`, `dist/style.css`가 생성되고 vue는 번들에 포함되지 않는다.
- `npm run test:run`(단위) 및 `npm run test:visual`(비주얼)이 통과한다.
- `npm run docs`(포트 9999)에서 각 컴포넌트의 example 렌더와 api 문서가 함께 표시된다.

## Architecture

```
[소비 애플리케이션]
   app.use(EVUI)  또는  app.use(EvXxx)
        │
src/main.js ─── components 배열 순회 app.use()
        │
src/components/<name>/index.js ─── Component.install(app)
        ├─ app.component('EvXxx', SFC)            ← 일반 컴포넌트 30종
        └─ globalProperties.$message/$messagebox/$notify  ← 함수형 서비스 3종 (h+render 직접 마운트)
        │
<Name>.vue (options 객체 + setup())
        ├─ uses.js  (named export 컴포저블, getCurrentInstance 기반)
        └─ <style lang="scss"> ── @use '@/style/index.scss' (또는 style/*.scss 분리)
        │
공용 레이어
  src/common/      utils · emitter · bignumber/debounce/throttle/table/tree 유틸
  src/directives/  clickoutside · resize (로컬 import)
  src/style/       index.scss(@forward functions/mixins/variables/themes) · lib · components
```

## File Structure

`src/components` 최상위에는 소스 파일이 없고 컴포넌트 디렉토리 33개만 있다. 각 디렉토리의 공통 구성:

| 파일 | 역할 |
|------|------|
| `index.js` | Vue 플러그인 등록 (`Component.install` 부여, default export) — 필수 |
| `<Name>.vue` | SFC 본체 (options 객체 + `setup()`) — 필수. 보조 SFC 동반 가능 (예: grid의 `GridToolbar.vue` 등) |
| `uses.js` | Composition API 컴포저블 (복잡 컴포넌트 13개만) |
| `style/<name>.scss` | 분리 스타일시트 (chart, chartGroup, grid, treeGrid만) |

하위 디렉토리 (이름 · 역할 수준):

| 디렉토리 | 역할 |
|------|------|
| button / buttonGroup | 버튼 / 버튼 그룹 |
| checkbox / checkboxGroup / radio / radioGroup / toggle | 선택형 폼 입력 |
| textField / inputNumber / select / slider | 입력형 폼 컴포넌트 |
| calendar / datePicker / timePicker / scheduler | 날짜·시간 계열 |
| chart / chartGroup / chartBrush | 캔버스 차트, 차트 그룹(동기 줌·브러시), 브러시 |
| grid / treeGrid / pagination | 가상 스크롤 데이터 그리드, 트리 그리드, 페이지네이션 |
| tree / menu / tabs / tabPanel / contextMenu | 계층·내비게이션 UI |
| message / messageBox / notification | 함수형 전역 서비스 (`$message` / `$messagebox` / `$notify`) |
| window / loading / progress / icon | 오버레이·상태 표시·아이콘 |

## Dependencies

| 대상 | 용도 |
|------|------|
| vue (peerDependency, 빌드 external) | 프레임워크 — 소비자가 제공 |
| lodash-es | 범용 유틸 (cloneDeep, defaultsDeep, uniqBy 등) |
| dayjs | 날짜 처리 |
| bignumber.js | 정밀 수치 연산 (`src/common/utils.bignumber.js`) |
| korean-regexp | select 등의 한글 검색 매칭 |
| vue3-observe-visibility | Grid / TreeGrid / Tabs 가시성 감지 디렉티브 (로컬 import) |
| src/common/ | 공용 유틸·emitter |
| src/directives/ | clickoutside · resize 디렉티브 |
| src/style/ | 전역 SCSS (variables/mixins/themes/functions) |
| @vue/compiler-sfc (dev) | docs `props.js`의 예제 소스 파싱 |

## Glossary

| 용어 | 정의 |
|------|------|
| Ev 접두사 | 모든 컴포넌트 `name`에 붙는 라이브러리 식별 접두사 (`EvChart`) |
| install 패턴 | `Component.install = (app) => ...`로 개별 컴포넌트를 Vue 플러그인화하는 규약 |
| uses.js | 컴포넌트 디렉토리 내 컴포저블 모음 파일 — `getCurrentInstance()`로 props/emit 접근 |
| 함수형 전역 서비스 | 컴포넌트 등록 없이 `globalProperties`에 함수로 주입되는 message/messageBox/notification |
| EVUI 객체 | `{ version, install }` — 전체 설치용 default export |

## Data Flow

```
[전역 설치]
app.use(EVUI)
    │
main.js install(app) ── components.forEach(app.use)
    │
각 index.js install(app)
    ├─ app.component('EvXxx', SFC)          → 템플릿에서 <ev-xxx> 사용 가능
    └─ globalProperties.$message = fn       → this.$message(...) / inject 없이 호출

[함수형 서비스 호출]
$message(options | string)
    │
h(Component, { ...options, unmount }) → render(instance, container)
    │
document.body 내 고정 루트 div(ev-message-modal 등)에 표시 → unmount 시 render(null)
```
