# Step 1: dom-isolation (부록 A.1 선결)

## 읽어야 할 파일

- `/CLAUDE.md`, `/Users/ijiwon/.claude/CLAUDE.md` — 프로젝트/전역 규칙
- `phases/chart-worker-offload/plan.md` — phase 앵커 (가장 먼저)
- `phases/chart-render-perf/plan.md` §5 부록 A.1(선결 작업), §2 Worker 호환성
- `phases/chart-render-perf/drawchart-inventory.md` — #7·#2 행(textMeasureCanvas 소비 지점), "3. helpers.util.js top-level 싱글톤 노출"
- `src/components/chart/helpers/helpers.util.js` — `:5` 싱글톤, `:245` calcTextSize(DOM span), `:269` calcTextSizeCanvas
- `src/components/chart/scale/scale.logarithmic.js` — `:47` calcTextSize 호출
- text 측정을 쓰는 다른 scale: `src/components/chart/scale/` 전체(linear/time/log/category 등)에서 `calcTextSize`/`calcTextSizeCanvas` 호출 확인

## 배경

worker는 DOM이 없다. 현재 series 렌더 경로가 의존하는 DOM은 **딱 2곳**이다:
1. `helpers.util.js:5` top-level `const textMeasureCanvas = document.createElement('canvas')` 싱글톤 — 모듈 **import 시점**에 실행되므로 worker에서 import만 해도 throw. `calcTextSizeCanvas`(`:269`)가 이걸 소비한다.
2. `scale.logarithmic.js:47`의 `Util.calcTextSize`(`:245`, `document.createElement('span')` + `document.body.appendChild`) — log축 라벨 측정 한정. 같은 측정을 `calcTextSizeCanvas`로 하면 DOM 없이 된다.

`htmlToElement`(`:430`)은 tooltip 플러그인 전용이라 series 렌더 경로와 무관 → **이 step 범위 밖**.

## 작업

1. **`helpers.util.js:5` 싱글톤을 worker-import-safe하게** 한다. import 시점 `document.createElement`를 제거하고, 측정 컨텍스트를 **lazy 생성 + 환경 분기**한다:
   - `document`가 있으면 `document.createElement('canvas')`, 없으면(`typeof OffscreenCanvas !== 'undefined'`) `new OffscreenCanvas(w, h)`로 측정용 2D 컨텍스트를 얻는 헬퍼(예: `getTextMeasureCtx()`)를 만들고, `calcTextSizeCanvas`가 이를 호출하게 한다. 최초 호출 시 1회 생성해 캐시.
   - 시그니처는 재량. 단 **기존 `calcTextSizeCanvas(text, fontStyle)` 공개 동작·반환(width/height)은 불변**이어야 한다.
   - **주의(리뷰 지적)**: `calcTextSizeCanvas`가 호출처에서 넘기는 **세 번째 인자(padding 등)** 를 현재 무시한다면, 그 우발적 호출 계약을 깨지 않도록 동작을 유지/명시하라(`scale.js`의 호출부 확인).
2. **`scale.logarithmic.js:47`을 `calcTextSizeCanvas`로 통일**한다. log축 라벨 size 측정을 DOM span(`calcTextSize`) 대신 canvas 측정으로 바꾼다. 측정값이 기존과 의미 있게 달라지면 안 됨(라벨 폭에 따라 축 레이아웃이 바뀜).
3. **전 scale의 text 측정 경로 재확인**: 다른 scale도 DOM span(`calcTextSize`)을 렌더 경로에서 쓰면 같은 방식으로 정리한다(grep으로 확인). tooltip/legend 등 main 전용 DOM 측정은 건드리지 않는다.

> font string 전달·`document.fonts.ready` 동기화 같은 worker 폰트 일치 문제는 **Step 5(snapshot contract)에서** 다룬다. 이 step은 "DOM 없이 import·측정이 된다"까지만.

## Acceptance Criteria

```bash
npm run lint
npm run test:run
npm run test:visual
```

추가: 비-DOM 컨텍스트 import smoke. `helpers.util.js`(및 `scale.logarithmic.js`)를 `document` 없는 환경에서 import해도 throw하지 않음을 보이는 단위 테스트를 추가한다. **주의(리뷰)**: 모듈이 이미 import된 뒤 `global.document`를 지우면 무효다 → **격리된 dynamic import(캐시 버스팅) 또는 별도 워커류 프로세스에서 `document` 부재 상태로 먼저 import**해야 한다. jsdom이 `OffscreenCanvas`를 안 줄 수 있으니 테스트 경로에서 `OffscreenCanvas`를 mock/제공한다. 이 테스트가 `npm run test:run`에 포함돼 통과해야 한다.

## 검증 절차

1. 위 AC 커맨드 전부 통과.
2. golden 회귀: `test:visual`에서 특히 `line-chart-log-scale`(log축) 케이스 확인. **주의**: canvas `measureText`는 DOM span과 폭/높이 산식이 달라(예: 높이 `fontSize*1.2`, 폭 `ceil(measureText.width)`) 라벨 측정값이 **소폭 달라질 수 있다**. 따라서 "변화 0"이 아니라 **구체 기준**으로 판정한다 — (a) 라벨 폭/축 위치 차이가 픽셀 tolerance(예: ≤1px) 이내면 통과, (b) 그보다 크면 시각적으로 동등한지 확인 후 **golden baseline 갱신을 명시적으로 결정**(`test:visual:update`)하고 summary에 기록. 무단으로 큰 레이아웃 변화를 통과시키지 마라.
3. 일관성: 측정 헬퍼 분기가 기존 네이밍/스타일을 따르는지, 공개 export 동작이 불변인지 확인.
4. 결과를 `index.json` step 1에 기록(`completed`/`summary` 또는 실패 시 `error`).

## 금지사항

- `htmlToElement`(tooltip 전용)나 tooltip/legend DOM 측정을 건드리지 마라. 이유: series 렌더 worker 경로와 무관하고, main 전용이다.
- `calcTextSizeCanvas`의 반환 의미(폭/높이)를 바꾸지 마라. 이유: 축 레이아웃이 라벨 측정값에 의존한다.
- worker 폰트 로딩 동기화를 여기서 구현하지 마라. 이유: Step 5 계약에서 다룬다. 이 step은 import/측정의 DOM 제거까지만.
- 이 step과 무관한 파일을 수정하지 마라. 기존 테스트를 깨뜨리지 마라.
