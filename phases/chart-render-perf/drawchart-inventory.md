# Step 2.4 — `drawChart` 책임 목록화 (RenderCore 분리 경계 확정)

> 순수 분석 산출물(코드 변경 0). 대상은 `chart.core.js`의 `drawChart(hitInfo)`(현재 `:325-351`)와 그 **직접 호출 함수**다.
> 함수명으로 식별했으므로 line 번호는 문맥용(이후 이동 가능).
>
> **의존 분류 범례**: DOM(`getBoundingClientRect`·`window.devicePixelRatio`·legend/tooltip DOM·DOM span) / canvas(`ctx`·`measureText`) / model(`seriesList`·`dataSet`·`axesX/Y`·`minMax`·`chartRect`·scrollbar state) / plugin(plugin hook·event listener·formatter).
> **분리 가능 여부**: RenderCore(순수 렌더로 뺄 수 있음) / ChartShell(DOM·layout·event 주입으로 남아야 함) / 미정.
> **mini-step**: Step 2.5 경계 — `commitToDisplay`(2.5-a) → `drawSeriesLayer`(2.5-b) → `drawStaticLayer`(2.5-c) → `prepareLayout`/`prepareScale`(2.5-d).

## 표 (drawChart 책임 인벤토리)

| # | 작업(함수/구간) | 의존 분류 | 분리 가능 여부 | RenderCore mini-step 매핑 | 비고 |
|---|---|---|---|---|---|
| 0a | **입력: `chartRect = getChartRect()`** (drawChart 직전 `render()`/`resize()`에서 호출) → `getChartDOMRect()` → `chartDOM.getBoundingClientRect()`(`:740`) | **DOM**(getBoundingClientRect) + canvas(setWidth/Height 비트맵) | **ChartShell** | 2.5-d `prepareLayout` 입력 | drawChart 내부엔 없지만 `getAxesRange`/`getLabelOffset`/`drawAxis`/`drawSeries`가 모두 소비. DOM 측정값이라 ChartShell이 계산해 **주입할 값**(width/height/x1·x2·y1·y2). Worker 경로에서 RenderCore에 넘겨야 하는 1순위 주입값. |
| 0b | **입력: `minMax = getStoreMinMax()`** (`init()`/`update()`에서 호출) | **model**(seriesList·dataSet 집계) | RenderCore | 2.5-d `prepareScale` 입력 | drawChart 내부엔 없지만 `getAxesRange` 입력. show 시리즈만 집계(step4 확인). model 순수 계산. |
| 1 | `initScale()`(`:707`) — pixelRatio 산출 + `bufferCtx/overlayCtx.setTransform` | **DOM**(`window.devicePixelRatio`) + canvas(backingStoreRatio·setTransform) | 미정 → **분할**: pixelRatio=ChartShell 주입, setTransform=RenderCore | 2.5-d `prepareLayout`(pixelRatio) + commit/draw 직전(setTransform) | `window.devicePixelRatio`는 DOM이라 ChartShell이 읽어 주입. `setTransform`은 ctx 연산이라 RenderCore. Worker엔 window 없음 → pixelRatio 주입 필수. |
| 2 | `getAxesRange()`(`:609`) — `axis.calculateScaleRange(minMax, scrollbar, chartRect)` | **model**(minMax·scrollbar) + **canvas**(scale 내부 `calcTextSizeCanvas`→measureText) + chartRect(주입) | RenderCore | 2.5-d `prepareScale` | 라벨 size 측정이 measureText 경유(canvas). chartRect은 0a 주입값. |
| 3 | `getLabelOffset()`(`:928`) — axesX/Y · axesRange로 edge offset 계산 | **model**(axesX/Y·axesRange) | RenderCore | 2.5-d `prepareScale`(또는 `prepareLayout`) | 순수 산술. canvas/DOM 없음. |
| 4 | `getAxesLabelRange()`(`:688`) — `axis.calculateLabelRange(chartRect, labelOffset, size)` | **model**(axes) + chartRect(주입) | RenderCore | 2.5-d `prepareScale` | chartRect 주입값 소비. measureText 없음(size는 range에서 옴). |
| 5 | scrollbar pos: `if(scrollbar.x/y.use) updateScrollbarPosition()`(`:333`) | **model**(scrollbar state) | RenderCore | 2.5-d `prepareLayout` | 조건부. scrollbar 사용 시만. |
| 6 | `calculateSteps()`(`:655`) — `axis.calculateSteps(range)` | **model**(axes·axesRange·labelRange) | RenderCore | 2.5-d `prepareScale` | 데이터량 무관, 축 범위·step 수 의존(plan §2). |
| 7 | `adjustXAndYAxisWidth()`(`:185`) — `getLabelWidthHasMaxLength`로 라벨 폭 재측정 후 axesRange/labelOffset/labelRange/axesSteps 재계산 | **canvas**(`calcTextSizeCanvas`→top-level `textMeasureCtx.measureText`, helpers.util `:277`) + **model**(axes) | RenderCore | 2.5-d `prepareScale` | **helpers.util.js top-level `document.createElement('canvas')` 싱글톤(`:5`)이 실제로 소비되는 지점.** Worker 진입 시 이 싱글톤 import가 즉시 throw(plan §2 Worker 호환성) → `OffscreenCanvas`/환경 분기 필요. `calcExtraWidthLabel`(linear 라벨 폭 팽창)도 여기. |
| 8 | `emitAxesScaleChange()`(`:284`) — `listeners['axes-scale-change'](payload)` 콜백 | **plugin/event**(listener) + model(labelRange diff) | **ChartShell**(또는 콜백 주입) | 2.5-d 직후(prepare 종료 hook) | 외부 이벤트 emit. RenderCore는 순수 렌더라 listener를 직접 들고 있으면 안 됨 → ChartShell이 prepare 결과 받아 emit하거나 RenderCore에 콜백 주입. |
| 9 | `drawAxis(hitInfo)`(`:627`) — `axis.draw(chartRect, labelOffset, steps, hitInfo, defaultSelectInfo, labels)` | **canvas**(bufferCtx·measureText) + **model**(axes·labels) | RenderCore | **2.5-c `drawStaticLayer`** | axis/grid/static label. 축/크기/theme 불변 시 캐시 경계 후보(분류 (a)에서만 유효, (b)·legend toggle이면 매 틱 무효). bufferCtx에 그림. |
| 10 | `drawSeries(hitInfo)`(`:396`) — line/bar/scatter/heatMap/pie element `draw` + `collectDuplicatePoints`(scatter dedupe) | **canvas**(bufferCtx·overlayCtx) + **model**(seriesList·dataSet·seriesInfo) | RenderCore | **2.5-b `drawSeriesLayer`** | 데이터량 큰 핵심 단계. step2a path 생략·hidden skip·step2d batch/putImageData·plotArea clipping의 주 무대. time-slicing/Worker 이관 1순위. |
| 11 | `drawTip()`(`:555`) — `drawTips(tipLocationInfo)` (maxTip/선택 tip element) | **canvas**(ctx) + **model**(lastHitInfo·defaultSelectItemInfo·getItem) | 미정 → RenderCore(렌더) / interaction state 주입 | **2.5-b `drawSeriesLayer`**(또는 직후) | canvas tip element 렌더(HTML tooltip DOM 아님 — 그건 `createTooltipDOM`로 update 경로, drawChart 밖). hit/select state는 model 입력으로 주입받으면 RenderCore 가능. |
| 12 | buffer→display commit: `displayCtx.drawImage(bufferCanvas,0,0)`(`:348-350`) | **canvas**(displayCtx·bufferCanvas) | RenderCore | **2.5-a `commitToDisplay`** | 가장 작고 경계 명확 → 게이트 전 최소 선행(2.5-a). Worker 경로에선 ImageBitmap blit으로 치환되는 지점. |

## 이걸로 결정되는 것

### 1. Step 2.5 mini-step 경계 vs 표의 "분리 가능" 묶음 일치 여부 → **일치(commit 분리 단독 가능 확정)**

- **2.5-a `commitToDisplay`** = #12 단독. 입력은 `bufferCanvas`/`displayCtx` 2개뿐, 출력 의존 없음. → **다른 행과 결합 없이 단독 추출 가능**. 게이트 전 최소 선행으로 안전.
- **2.5-b `drawSeriesLayer`** = #10(+#11). 둘 다 canvas+model 의존, DOM·plugin 없음 → 묶어서 RenderCore로 뺄 수 있음. #11(drawTip)은 hit/select state를 입력으로 주입하면 순수화.
- **2.5-c `drawStaticLayer`** = #9 단독. canvas+model, DOM 없음 → RenderCore. 캐시 경계도 여기서 닫힘.
- **2.5-d `prepare*`** = #1~#8(+0a·0b 입력). 이 묶음 안에 **DOM 의존(#0a chartRect, #1 pixelRatio)과 plugin 의존(#8 emit)이 섞여 있다** → 이 둘만 ChartShell로 분리/주입하면 #2·#3·#4·#5·#6·#7은 model/canvas 순수 계산이라 RenderCore로 떨어진다.

→ **결론: drawChart의 출력단(commit)·draw단(series/static)은 그대로 RenderCore. 입력단(prepare)만 DOM/plugin 의존 3개(#0a, #1, #8)를 ChartShell 주입으로 걷어내면 분리 가능.** mini-step 경계가 "분리 가능" 묶음과 어긋나지 않는다.

### 2. DOM 의존 작업 = ChartShell이 주입할 값 (확정)

RenderCore에 **넘겨야 하는 주입값**:
- **`chartRect`** (#0a): `getBoundingClientRect` 유래 width/height/x1·x2·y1·y2. ChartShell이 `getChartRect()`로 계산해 주입.
- **`pixelRatio`** (#1): `window.devicePixelRatio` 유래. ChartShell이 읽어 주입(Worker엔 window 없음).
- **`axes-scale-change` emit** (#8): RenderCore는 prepare 결과만 반환하고, ChartShell이 listener를 호출(또는 콜백 주입).

RenderCore에 **남지 않아도 되는 것**(prepare에서 이미 model 입력): `minMax`(#0b), `seriesList`/`dataSet`, `axesX/Y`.

### 3. helpers.util.js top-level 싱글톤 노출 (Worker 선결)

- `helpers.util.js:5` `const textMeasureCanvas = document.createElement('canvas')` 싱글톤은 **#7 `adjustXAndYAxisWidth`**(→`getLabelWidthHasMaxLength`→`calcTextSizeCanvas`→`textMeasureCtx.measureText`, `:277`)와 **#2 `getAxesRange`**(scale 내부 `calcTextSizeCanvas`)에서 소비된다.
- 즉 **canvas 의존이지만 bufferCtx가 아니라 모듈 로드 시 만들어진 DOM canvas**라, prepare 단계(#2·#7)가 RenderCore여도 이 싱글톤이 import 시점에 throw → Worker 진입 시 `OffscreenCanvas`/환경 분기가 **#7·#2의 선결 조건**(plan §2 Worker 호환성, 부록 A.1).
- `scale.logarithmic.js:47`의 `calcTextSize`(DOM span)는 log 축 한정으로 같은 라벨 측정 경로의 DOM 잔재 → `calcTextSizeCanvas`로 통일 필요(부록 A.1). 본 step에선 분류만 기록(코드 변경 없음).

### Step 2.5-a~d가 옮기는 행 (매핑 요약)

| mini-step | 옮기는 행 |
|---|---|
| 2.5-a `commitToDisplay` | #12 |
| 2.5-b `drawSeriesLayer` | #10, #11 |
| 2.5-c `drawStaticLayer` | #9 |
| 2.5-d `prepareLayout`/`prepareScale` | #1(setTransform)·#2·#3·#4·#5·#6·#7 (RenderCore) + #0a·#1(pixelRatio)·#8 (ChartShell 주입/emit) |
