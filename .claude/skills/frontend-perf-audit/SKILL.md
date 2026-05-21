---
name: frontend-perf-audit
description: Identify and analyze frontend performance bottlenecks in JavaScript/TypeScript hot paths — especially data-heavy code like chart rendering, grid virtualization, data transformations, and bulk loops. Use this skill whenever the user mentions "long task", "느려", "perf 분석", "성능 분석", "프레임 드랍", "차트가 느려", "렌더링 느림", performance regressions, optimization, profiling, or shares profiler/devtools screenshots showing slow tasks. Also activate proactively when reading or editing code that contains loops over potentially large N (>100 items), large data processing pipelines, render/draw functions, virtual scroll, watch/effect chains, or anything that processes bulk data. Output is analysis-only by default — produce a prioritized report with complexity analysis and concrete fixes; do not modify code unless the user explicitly approves the report.
---

# Frontend Performance Audit

성능 병목을 식별해 **분석 보고서**를 생성한다. 코드 자동 수정은 하지 않는다 — 사용자가 보고서를 보고 결정한다.

## 보고서 언어

**보고서는 항상 한국어로 작성한다.** 코드 인용, 함수명, 파일 경로, 패턴명(O(N²), GC 등)은 원문 그대로 두되, 설명·요약·권장사항은 한국어. 시각 라벨(🔴/🟡/🟢)은 통일성을 위해 유지.

## 왜 이렇게 동작하는가

대부분의 long task는 **흩어진 마이크로 비효율의 합**이 아니라 **숨은 O(N²) 또는 GC 폭주** 한두 곳에서 발생한다. 따라서 무작정 forEach를 for로 바꾸거나 옵셔널 체이닝을 제거하는 것보다, 먼저 **복잡도와 할당량 관점에서 hot path를 분석**하는 게 압도적으로 효과적이다.

수정 권한 없이 보고서만 만드는 이유:
- 성능 수정은 거의 항상 trade-off (가독성/일반성/안전성)가 있다 → 사용자가 결정
- "이 데이터는 항상 primitive다" 같은 가정은 코드 추적으로 확인 후 사용자가 검증
- 한 번에 다 고치지 말고 가장 큰 1-2개부터 적용 후 측정

## 분석 워크플로우

### 1. Hot path 식별
다음을 답한다 (모르면 사용자에게 물어본다):
- 어디가 자주/오래 실행되는가? (함수명, 파일:줄)
- N은 어디서 오는가? 최대 N은? 평균 N은?
- 호출 빈도는? (1회 / 매 update / 매 frame)
- 측정값이 있는가? (Long task 길이, profiler flame chart)

자주 hot path가 되는 위치:
- 데이터 변환 루프 (chart `createDataSet`, table row builder)
- Render / draw / paint 함수
- Watch / computed / effect 체인 (특히 cascading)
- 스크롤·마우스무브·리사이즈 핸들러
- Validation·serialize·diff 루프

#### 🔑 Caller-side 분석 (자주 놓치는 가장 큰 win)
**target 함수 자체는 O(N)이어도, 호출자가 루프 안에서 N번 부르면 O(N²)이 된다.** 이게 가장 흔한 숨은 병목이고, 함수 내부 최적화보다 호출자 1회 hoist가 훨씬 큰 효과를 낸다.

target 함수를 정했으면 **반드시** 호출처를 grep해서 확인:
```bash
grep -rn "functionName(" src/
```
체크할 것:
- 호출자가 루프 안에서 부르는가? → caller-side hoist 가능?
- 호출 빈도는? (매 frame, 매 event, 매 watch)
- nested 호출 체인이 있는가? (A가 B를 부르고 B가 C를 부르는 식의 곱셈 복잡도)
- 같은 결과를 매번 다시 계산하지 않는가? (memoization 기회)

**실사례**: `getAggregations()`가 자체로는 O(S·D)인데 legend 빌드 루프가 시리즈마다 호출해서 전체 O(S²·D)가 된 케이스. 함수 내부 최적화보다 호출자에서 1회 hoist가 100배 빠름.

### 2. 복잡도 측정
- 외부 루프 N × 내부 작업 → 내부에 hidden iterator 있는지 본다
- `Object.keys/values/entries(obj)` — O(키 수)의 배열 할당
- `Array.prototype.find/filter/indexOf/includes` — O(N)
- `querySelector*` — DOM 크기에 비례
- `JSON.parse/stringify` — 객체 크기에 비례
- `new RegExp(string)` — 정규식 컴파일

루프 안에 위가 있으면 곱해진 복잡도로 다시 계산한다.

### 3. 안티패턴 체크리스트

#### JS 핫패스 (가장 흔한 원인)

**1) O(N²) 숨은 패턴**
```js
// ❌ 매 호출마다 N개 키 배열 alloc, N번 호출 = O(N²)
for (const item of items) {
  const firstKey = Object.keys(map)[0];
}
// ✅ Hoist
const firstKey = Object.keys(map)[0];
for (const item of items) { ... }
```

```js
// ❌ Array.find in loop = O(N²)
items.forEach(item => {
  const match = others.find(o => o.id === item.id);
});
// ✅ Map으로 O(1) lookup
const otherMap = new Map(others.map(o => [o.id, o]));
items.forEach(item => {
  const match = otherMap.get(item.id);
});
```

```js
// ❌ Array.includes in row processing = O(N×M)
rows.forEach(row => {
  if (checkedRows.includes(row)) { ... }
  if (uncheckable.includes(row)) { ... }
});
// ✅ Set으로 O(N)
const checkedSet = new Set(checkedRows);
const uncheckableSet = new Set(uncheckable);
rows.forEach(row => {
  if (checkedSet.has(row)) { ... }
  if (uncheckableSet.has(row)) { ... }
});
```

**2) Invariant hoisting 누락**
루프 내에서 변하지 않는 값을 매번 재계산:
- `this.options.x` — 같은 트랜잭션에서 안 바뀜
- `arr.length` — 변경 없으면 캐시
- Reactive proxy 접근 — Vue/MobX는 getter trap 비용 있음
- `new RegExp(pattern)`, `new Date()` — 루프 밖으로
- `dayjs(x)` 등 무거운 wrapper 호출
- `searchWord.toLowerCase()`를 매 cell마다 — 1회 hoist

**3) 불필요한 방어 코드**
```js
// ❌ x.value는 절대 존재하지 않는데 매 iter 옵셔널 체이닝
const v = p.x?.value || p.x;

// ✅ 데이터 흐름 추적으로 primitive 보장되면 직접
const v = p.x;
```
**확인 절차**: 결과 객체가 어디서 만들어지는지 따라가 필드 타입 검증. 모든 경로에서 primitive로 평탄화되면 안전.

**4) forEach vs for**
- N < 1,000: 가독성 우선 (forEach OK)
- N > 10,000: 클로저 호출 오버헤드 누적 → 일반 for-loop 권장
- 중단 가능성 필요하면 for 또는 some/every

**5) typeof null === 'object' 함정**
```js
// ⚠️ null도 통과 → 런타임 에러
if (typeof x === 'object') x.foo;
// ✅
if (x !== null && typeof x === 'object') x.foo;
```

**6) Hot path 안의 function call**
큰 N에서 `this.helper()` 호출은 누적 비용. 호출 측이 단순 객체 생성/산술이면 인라인이 빠르다. (단, 가독성/재사용성 trade-off — 측정 후 결정)

**7) `JSON.parse(JSON.stringify(x))` deep clone**
큰 객체/배열에 쓰면 매우 느리고 GC 폭주. 대안:
- 얕은 복사면 `slice()`, `{...obj}` (한 번만)
- `structuredClone()` (최신 브라우저)
- 더 빠른 라이브러리 (immer, fast-copy)
- 또는 **정말 복사가 필요한지** 다시 본다 — 종종 reference로 충분

**8) `Math.min(...arr)` / `Math.max(...arr)`**
큰 배열 spread는 stack overflow 위험 (~120k+ 요소). 또한 별도 패스 = 추가 O(N).
```js
// ❌
const min = Math.min(...arr);
const max = Math.max(...arr);
// ✅ 단일 패스 + spread 없음
let min = Infinity, max = -Infinity;
for (let i = 0; i < arr.length; i++) {
  if (arr[i] < min) min = arr[i];
  if (arr[i] > max) max = arr[i];
}
```

#### GC / 메모리

**9) 매 iter 객체 할당**
20,000+ 데이터 포인트 × 매 update = GC 폭주.
- **객체 풀링**: `series.data` 배열을 재사용하면서 in-place로 값만 갱신
- **결과 배열 재사용**: `arr.length = 0` 후 push
- **클래스 사용**: 고정 shape면 클래스로 hidden class 일관성 확보

**10) Spread는 hot path에서 무조건 의심**
큰 객체뿐 아니라 **작은 객체도** hot path면 1 alloc/iter씩 쌓여 GC 압박.
```js
// ❌ 1100 시리즈 × 매 frame = 1100 alloc/frame
seriesList.forEach(s => s.draw({ legendHitInfo, ...opt }));
// ✅ opt를 1회 만들고 mutate하거나, positional arg로 분리
seriesList.forEach(s => s.draw(opt, legendHitInfo));
```
```js
// ❌ validData.push({ ...point, originalIndex: idx })
// ✅ originalIndex를 외부에서 관리하거나, push(point, idx) 분리
```
**Rule of thumb**: hot path 안의 spread는 default로 의심. 합당한 이유가 없으면 제거.

**11) Render마다 새 클로저**
React/Vue에서 매 렌더 새 함수 → 자식 memo 무력화.
- `useCallback`/`useMemo`/`computed` 안정화

**12) 큰 객체 spread (immutable update)**
`{...big, change}` 패턴이 hot path에 있으면 매번 복사. Immer 또는 mutation+version counter 고려.

#### Rendering (Vue/React/Canvas)

**13) Layout thrashing**
```js
// ❌ read-write-read-write → forced reflow
elements.forEach(el => {
  const w = el.offsetWidth;
  el.style.width = `${w + 10}px`;
});
// ✅ batch reads, batch writes
const widths = elements.map(el => el.offsetWidth);
widths.forEach((w, i) => elements[i].style.width = `${w + 10}px`);
```

**14) 가상화 누락**
1,000+ 행 리스트/테이블: 가상 스크롤 필수 (vue-virtual-scroller, react-window).

**15) Canvas overdraw / 불필요한 redraw**
- 변경된 영역만 dirty rect로 redraw
- 같은 좌표 중복 draw 제거 (dedupe)
- requestAnimationFrame 안에서 일괄 draw
- 색상 문자열 매 frame 파싱 (`colorStringToRgba` 등) → 1회 precompute

**16) Watch/computed cascading**
같은 틱에서 여러 watch가 같은 함수(예: `evChart.update()`) 호출 → setTimeout(0) 또는 microtask로 단일 호출로 묶기.

**17) Reactive depth / deep watch**
- Vue의 deep reactive는 큰 객체에서 비쌈
- `watch(rows, { deep: true })`는 셀 하나만 바뀌어도 전체 핸들러 재실행 → shallow watch + 명시적 refresh API 고려
- 변경 추적 불필요한 raw 데이터는 `markRaw`/`shallowRef`/`Object.freeze`

#### 네트워크

**18) Waterfall vs Promise.all**
순차 await가 병렬 가능한 곳이 있는지.

**19) Over-fetching**
필요한 필드만 받는 endpoint, GraphQL field selection.

**20) Cache 누락**
같은 요청 반복 시 SWR, React Query, 또는 in-memory cache.

### 4. 영향도 추정

각 발견 항목에 명시:
- **복잡도**: 현재 O(?) → 개선 후 O(?)
- **호출량**: N × M × 빈도 (가정 명시)
- **예상 효과**: 절대 시간 추정 또는 비율 (측정값 있으면 그것 기준)
- **변경 범위**: 1줄 hoist / 함수 시그니처 / 자료구조 / 아키텍처

추정 근거를 항상 적는다 — 사용자가 검증할 수 있어야 한다.

### 5. 우선순위 매기기

| 우선순위 | 패턴 | 이유 |
|---|---|---|
| 🔴 Critical | O(N²) → O(N) | 데이터 커질수록 폭발. 거의 항상 최우선 |
| 🔴 Critical | GC 폭주 (수만 객체/update) | Long task의 보이지 않는 원인 |
| 🔴 Critical | Caller-side O(N²) | 함수는 잘 짰는데 호출자가 루프에서 부름 |
| 🟡 Important | Layout thrashing, cascading update | 가시적 jank 직접 원인 |
| 🟡 Important | Invariant hoisting, find→Map | 명확한 win, 작은 변경 |
| 🟡 Important | Hot path 안의 spread | 작아도 GC 압박 누적 |
| 🟢 Minor | forEach→for, 옵셔널 체이닝 제거 | 다른 게 해결된 후 |
| ⚪ Skip | N<100인 곳의 마이크로 옵트 | 가독성 손해가 크다 |

## 보고서 형식

**모든 설명은 한국어로 작성한다.** 코드/식별자/복잡도 표기는 원문 유지.

```markdown
## 분석 요약
- **Hot path**: `함수명` ([file:line](file:line))
- **추정 N**: 시리즈 1,100 × 라벨 19 ≈ 20,900 포인트
- **호출 빈도**: 매 update
- **측정값** (있으면): Long task 833ms

## 🔴 Critical

### 1. [한 줄 요약]
- **위치**: [file:line](file:line)
- **현상**: 현재 코드의 어떤 부분이 문제인지 (코드 인용)
- **복잡도**: O(N²) → O(N)
- **호출량 계산**: 1,100 × 1,100 = 1.21M ops
- **추정 효과**: ~80-150ms 절감
- **변경 범위**: 함수 시그니처 변경 + 호출처 1곳
- **수정안**:
  ```js
  // before
  ...
  // after
  ...
  ```

## 🟡 Important
... (동일 구조)

## 🟢 Minor (선택 사항)
...

## 🐛 잠재 버그 (perf 분석 중 발견)
성능 분석 중에 발견한 **로직 버그**가 있으면 별도 섹션으로 보고한다. 성능 수정과 별개로 우선 수정이 필요할 수 있다.

### B1. [버그 한 줄 요약]
- **위치**: [file:line](file:line)
- **현상**: 의도와 다르게 동작하는 부분 (코드 인용 + 왜 잘못됐는지)
- **재현 조건**: 어떤 상황에서 트리거되는지
- **영향**: 무엇이 깨지는지 (데이터 손상 / 잘못된 결과 / 무한 루프 등)
- **수정안**:
  ```js
  // before
  splice(dummyIndex, 1)  // dummyIndex가 배열 → NaN/0으로 강제 변환
  // after
  for (let i = dummyIndex.length - 1; i >= 0; i--) {
    splice(dummyIndex[i], 1);
  }
  ```

## 권장 적용 순서
1. **[항목명]** — 예상 효과 가장 큰 것부터
2. **[항목명]**
3. ...

각 단계 적용 후 측정 권장. 잠재 버그는 perf와 별개로 즉시 검토.
```

## 사용 시 원칙

**측정 없이 추측 금지** — 모든 추정에 호출량 가정과 근거를 표기한다. 사용자가 검증할 수 있어야 한다.

**N이 작으면 멈춰라** — N<100 hot path는 보통 무시. 단 매 frame 호출(60fps)이면 다시 본다.

**변경 범위를 정직하게 표시** — "한 줄 hoist"와 "객체 풀링 도입"은 같은 우선순위로 묶지 않는다. 사용자가 risk/reward로 판단하게 한다.

**Trade-off를 숨기지 마라** — "이 변경은 가독성을 해치지만 ~ms 절감"이라고 명시. 결정은 사용자가.

**한 번에 다 고치지 마라** — 가장 큰 1-2개부터 적용·측정·다음. 사용자가 적용을 요청하면, 우선순위 1개부터 시작.

**모르면 묻는다** — 코드만 보고 N의 실제 크기를 알 수 없을 때는 사용자에게 물어본다 ("이 시리즈 수가 평소 얼마나 됩니까?").

**Caller를 항상 본다** — target 함수 분석 후 반드시 `grep -rn "functionName("` 실행. caller-side O(N²)가 가장 큰 win이 되는 경우가 많다.

**잠재 버그를 흘려보내지 마라** — perf 분석 중 발견한 로직 버그(`splice(-1, 1)`, `splice(arr, 1)` 같은 강제 변환 등)는 별도 섹션으로 반드시 보고한다.

## 참고 예시 (실제 사례)

EVUI 차트 — 1,100 시리즈 long task 833ms 분석:

1. 🔴 `Object.keys(seriesList)[0]`를 `addSeriesDS` 안에서 호출 → O(N²)
   - 1,100회 × 1,100-key alloc = 1.21M 키 복사
   - Fix: 호출자가 1회 계산 후 인자로 전달
   - 추정: 80-150ms
2. 🟡 `p.x?.value || p.x` in `getSeriesMinMax` — 항상 primitive
   - 20,900 포인트 × 3 옵셔널 체이닝 = 63K 헛수고
   - 추정: 30-60ms
3. 🟢 1,100-iter 외부 루프 forEach → for
   - 추정: ~5ms

**결과**: 833ms → 83ms (10×). Critical 1개가 대부분 차지.

이 예시처럼 **Critical 한두 개가 long task 대부분을 차지**하는 게 일반적이다. 분석할 때 그것을 먼저 찾아라.
