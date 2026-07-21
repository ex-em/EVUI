# common-utils — 공용 유틸리티

## Purpose

EVUI 컴포넌트(차트·그리드·트리그리드·슬라이더·인풋넘버 등)가 공유하는 프레임워크 무관 유틸리티 함수를 제공한다. 숫자 판정/포맷, 크기·단위 파싱, 부동소수점 안전 연산(bignumber.js 래퍼), debounce/throttle(lodash 포팅), 콘솔 래퍼, 모바일 감지를 담당한다. `src/main.js` 공개 API로 export되지 않는 **라이브러리 내부 전용** 모듈이다.

## Features

### 숫자 판정·변환 (utils.js)
- **숫자 유효성 판정**: `truthyNumber(v)` — `typeof v === 'number' && !NaN`일 때만 true (0도 유효). `truthy(...args)` — 모든 인자가 truthyNumber. `checkNullAndUndefined(value)` — null/undefined 여부.
- **숫자 포맷**: `numberWithComma(v)` — 3자리 콤마 구분 문자열(소수부는 콤마 미적용), 비유효 숫자는 `false` 반환. `getPrecision(v)` — 소수부 자릿수(정수·null·undefined는 0).
- **비율 변환**: `convertToPercent(value, total)` — `(value/total)*100`을 `toFixed(2)` 문자열로. `convertToValue(value, total)` — `(value/100)*total`을 `toFixed(2)` 문자열로. 두 함수 모두 0 또는 비유효 입력이면 숫자 `0` 반환.
- **단위 배수**: `millions`/`billions`/`trillion`/`quadrillion` — 1e6/1e9/1e12/1e15 곱, 비유효 숫자는 0.
- **크기·단위 파싱**: `getQuantity(input)` — `"100px"`, `"50%"`, `"12.5"`, 음수, `"normal"`을 `{ value, unit }`으로 파싱(불일치 시 null, `"normal"`은 `{ value: NaN, unit: undefined }`). `getSize(size)` — `{value, unit}`을 CSS 크기 문자열로(단위 없으면 px, falsy면 `'100%'`).
- **콘솔 래퍼**: `Console` — `globalThis.console`을 참조하는 log/warn/info/error/debug/dir 래퍼. window가 없는 worker(render off-main) 컨텍스트에서도 import 가능.
- **모바일 감지**: `mobileCheck()` — userAgent 정규식(Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini) 또는 `'ontouchstart' in window`. `navigator.maxTouchPoints`는 사용하지 않는다(터치 노트북 오판 방지, #1497).

### 부동소수점 안전 연산 (utils.bignumber.js)
- **사칙연산**: `bnPlus`/`bnMinus`/`bnMultiply`/`bnDivide` — bignumber.js 경유 후 `toNumber()` 반환. `0.1 + 0.2 === 0.3` 보장.
- **내림**: `bnFloor(num, decimal)` — 지정 소수 자리에서 `ROUND_DOWN`.
- **변환**: `toBigNumber(value)` — BigNumber 인스턴스 생성.

### 실행 빈도 제어 (utils.debounce.js / utils.throttle.js)
- **debounce**: lodash debounce 포팅(default export). `leading`/`trailing`/`maxWait` 옵션, `cancel()`/`flush()`/`pending()` 메서드 제공. 마지막 인자·this 보존, 반환값은 마지막 실행 결과.
- **throttle**: lodash throttle 포팅(default export). 내부적으로 `debounce(func, wait, { leading, maxWait: wait, trailing })`에 위임. 기본 leading=true, trailing=true.

### 컴포넌트 트리 탐색 (emitter.js / utils.tree.js / utils.js 일부) — 현재 소비자 없음
- **상향 이벤트 디스패치**: `emitter.js` — 옵션 API mixin. `dispatch(componentName, eventName, params)`가 `$parent` 체인에서 이름이 일치하는 조상을 찾아 `$emit`.
- **상향 컴포넌트 탐색**: `utils.tree.js`의 `findComponentUpward(context, componentName)` — 단일 이름 또는 이름 배열로 조상 탐색. `utils.js`의 `getMatchedComponentUpward`도 동일 목적(단일 이름 전용).
- **하향 컴포넌트 탐색**: `utils.js`의 `getMatchedComponentsDownward` — `context.$children` 재귀 탐색. `$children`은 Vue 3에서 제거된 API다. [NEEDS CLARIFICATION: 위 "현재 소비자 없음" 유틸들(트리 탐색·컬럼 크기)은 src/·docs/ 어디에서도 import되지 않는다. Vue 2 잔재로 보이는데 유지/제거 정책은?]

### 테이블 컬럼 크기 (utils.table.js) — 현재 소비자 없음
- **컬럼 크기 유틸**: default export 객체 — `quantity`(getQuantity와 유사하나 음수 미허용·실패 시 undefined), `numberToPixel`(`%`는 유지, 그 외 px 문자열), `isPercentValue`(문자열 끝 `%` 판정), `checkColSize`(min/max 클램프).

## Business Rules

- 이 도메인의 "유효한 숫자"는 `truthyNumber` 기준이다: number 타입이고 NaN이 아니면 유효하며 **0도 유효**하다. 단 `convertToPercent`/`convertToValue`는 value 또는 total이 0이면 별도로 0을 반환한다.
- `convertToPercent`/`convertToValue`의 반환 타입은 혼합이다: 정상 경로는 `toFixed(2)` **문자열**, 0/비유효 경로는 **숫자 0**. `numberWithComma`는 비유효 시 **boolean false**. 소비자는 이 타입 혼합을 전제로 동작한다.
- `bnDivide(n, 0)`은 `Infinity`를 반환한다(bignumber.js 동작 그대로, 예외 없음).
- `throttle`은 독립 구현이 아니라 `debounce(maxWait=wait)` 위임이다. debounce의 동작 변경은 throttle에 그대로 전파된다.
- `utils.debounce.js`에서 `wait`를 생략(undefined)하면 rAF 경로 판정식이 `root.requestAnimationFrame`을 참조하는데 `root`는 모듈 내 어디에도 정의돼 있지 않다. 현재 저장소의 모든 호출부(tooltip 200ms, interaction 30ms, throttle 경유)는 wait를 명시해 이 경로에 진입하지 않는다. [NEEDS CLARIFICATION: wait 생략 호출 시 ReferenceError가 나는 lodash 포팅 잔재다. rAF 경로를 살릴지(globalThis로 수정) 제거할지?]
- `getMatchedComponentsDownward`는 재귀 분기에서 `result.concat(...)`의 반환값을 버려 자손 깊이 2 이상의 매칭 결과가 유실된다(미사용 함수라 현재 발현 없음).
- `utils.js`는 window가 없는 worker 컨텍스트에서 import 시점 에러 없이 로드돼야 한다(모듈 최상위는 `globalThis`만 참조; `mobileCheck`의 navigator/window 접근은 호출 시점으로 한정).
- 이 도메인은 Vue 모듈을 import하지 않는다. 단 트리 탐색 유틸(dispatch/findComponentUpward/getMatchedComponentsDownward)은 Vue 인스턴스 형태(`$parent`/`$options`/`$children`)를 인자로 가정한다.

## Acceptance Criteria

- `src/common/*.spec.js`(utils, bignumber, table, debounce, throttle 5종) vitest가 전부 통과한다.
- `bnPlus(0.1, 0.2) === 0.3`, `bnFloor(3.999, 2) === 3.99`(내림, 반올림 아님)를 만족한다.
- debounce는 wait 내 연속 호출 시 1회만(trailing) 실행되고 마지막 인자를 사용하며, `cancel()` 후 미실행·`flush()` 즉시 실행·`pending()` 상태 보고가 동작한다. func이 함수가 아니면 TypeError.
- throttle은 기본 leading 즉시 실행 + wait당 최대 1회이며, `{ leading: false }`/`{ trailing: false }` 옵션이 동작한다.
- `getQuantity('invalid')`는 null, `tableUtils.quantity('abc')`는 undefined를 반환한다(두 파서의 실패 반환값이 다름).
- emitter.js와 utils.tree.js는 자동 테스트가 없다(수동 확인 대상 아님 — 소비자 없음).

## Architecture

플랫 파일 모음이며 내부 의존은 한 방향 한 개뿐이다.

```
src/common/
├── utils.js            (독립, globalThis만 참조)
├── utils.bignumber.js ──▶ bignumber.js (외부 패키지)
├── utils.debounce.js   (독립, lodash 포팅)
├── utils.throttle.js ──▶ utils.debounce.js
├── utils.table.js      (독립, 소비자 없음)
├── utils.tree.js       (독립, 소비자 없음)
└── emitter.js          (독립 mixin, 소비자 없음)
```

## File Structure

| 파일 | 역할 |
|------|------|
| utils.js | 숫자 판정/포맷/비율/단위배수, 크기 파싱, Console 래퍼, mobileCheck, (미사용) 컴포넌트 상·하향 탐색 |
| utils.bignumber.js | bignumber.js 래퍼 — bnPlus/bnMinus/bnMultiply/bnDivide/bnFloor/toBigNumber |
| utils.debounce.js | lodash debounce 포팅 (cancel/flush/pending 지원) |
| utils.throttle.js | lodash throttle 포팅 — debounce(maxWait=wait) 위임 |
| utils.table.js | 테이블 컬럼 크기 유틸(quantity/numberToPixel/isPercentValue/checkColSize) — 소비자 없음 |
| utils.tree.js | findComponentUpward(이름 배열 지원 조상 탐색) — 소비자 없음 |
| emitter.js | dispatch mixin(조상 컴포넌트로 $emit) — 소비자 없음 |

## Dependencies

### 외부 의존

| 대상 | 용도 |
|------|------|
| bignumber.js | utils.bignumber.js의 임의 정밀도 연산 |

### 역방향 소비자 (이 도메인을 import하는 곳)

| 모듈 | 소비자 |
|------|--------|
| utils.js — truthyNumber/truthy | chart: chart.core, element.bar, element.heatmap, element.tip, plugins.scrollbar, scale.js, scale.linear, scale.step, helpers.util / docs: ResizableWrapper.vue |
| utils.js — numberWithComma | chart: element.tip, plugins.interaction / grid: GridSummary.vue, uses.js / treeGrid: uses.js / docs: grid example Summary.vue |
| utils.js — convertToPercent | chart: element.heatmap, plugins.legend.gradient, plugins.tooltip / slider: uses.js |
| utils.js — Console, mobileCheck | chart: chart.core |
| utils.js — millions/billions/trillion/quadrillion | chart: helpers.util |
| utils.js — checkNullAndUndefined | chart: element.heatmap, plugins.scrollbar |
| utils.js — getQuantity | chart: uses.js |
| utils.js — getPrecision | inputNumber: uses.js |
| utils.js — getSize, convertToValue, getMatchedComponents* | 소비자 없음 (spec 테스트만) |
| utils.bignumber.js — bnPlus/bnMinus | chart: scale.step |
| utils.bignumber.js — bnPlus/bnDivide/bnFloor | grid: GridSummary.vue |
| utils.bignumber.js — toBigNumber/bnMultiply | 외부 소비자 없음 |
| utils.debounce.js | chart: plugins.tooltip (`tooltip.debouncedHide` 옵션 시 200ms) / utils.throttle.js 내부 |
| utils.throttle.js | chart: plugins.interaction (`tooltip.throttledMove` 옵션 시 30ms) / docs: ResizableWrapper.vue |
| emitter.js, utils.table.js, utils.tree.js | 소비자 없음 |

## Glossary

| 용어 | 정의 |
|------|------|
| truthy (도메인 내) | JS truthiness가 아니라 "NaN이 아닌 number 타입"(0 포함) — truthyNumber 기준 |
| quantity | `"100px"`/`"50%"`/숫자를 `{ value, unit }`으로 파싱한 결과 객체 |
| leading / trailing edge | wait 구간의 시작/끝 시점 실행 (debounce/throttle 옵션) |
| maxWait | debounce가 아무리 연속 호출돼도 이 시간 안에는 반드시 1회 실행되는 상한 — throttle 구현의 핵심 |

## Data Flow

상태를 가진 모듈은 debounce/throttle뿐이며 나머지는 전부 순수 함수(입력 → 반환)다.

```
[소비자 호출: debounced(...args)]
    │  lastArgs/lastThis/lastCallTime 갱신
    ▼
[shouldInvoke 판정] ── 첫 호출/유휴/maxWait 초과 → leading 실행 or 타이머 시작
    │
    ▼
[timerExpired(setTimeout)] → trailing 실행(lastArgs 있을 때) → result 보관
    │
    └─ cancel()로 폐기 / flush()로 즉시 실행 / pending()으로 상태 조회
```
