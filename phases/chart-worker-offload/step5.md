# Step 5: rendercore-prepare (Step 2.5-d)

## 읽어야 할 파일

- `/CLAUDE.md`, `/Users/ijiwon/.claude/CLAUDE.md` — 프로젝트/전역 규칙
- `phases/chart-worker-offload/plan.md` — phase 앵커
- `phases/chart-worker-offload/openai-review.md` — Step 4(scrollbar DOM·overlay transform·class instance) 지적
- `phases/chart-render-perf/plan.md` §2.5-d, `phases/chart-render-perf/drawchart-inventory.md` #0a·#0b·#1·#2~#8
- `src/components/chart/chart.core.js` — `drawChart`(`:325`), `initScale`(`:707`, `:720-743` buffer+overlay ctx 모두 setTransform), `updateScrollbarPosition`(`:333`), prepare getters(`getAxesRange`/`getLabelOffset`/`getAxesLabelRange`/`calculateSteps`/`adjustXAndYAxisWidth`), `emitAxesScaleChange`(`:284`), `getChartRect`(`:740` 부근)
- `src/components/chart/plugins/plugins.scrollbar.js` — `:328-337` DOM 스타일 write
- `src/components/chart/scale/scale.js` — `:15-23`, `:85-86` (Scale/range가 function·class instance를 들고 있음)
- 이전 step 산출물: Step 3(series raster)·Step 4(static layer)

## 배경

draw단은 분리됐다. 남은 입력단(prepare)을 `prepareLayout`/`prepareScale`로 떼고 RenderCore를 DOM-free 순수 단위로 만든다. **리뷰가 추가한 DOM 의존**:
- **scrollbar(#리뷰)**: `updateScrollbarPosition()`(`chart.core.js:333`)은 `plugins.scrollbar.js:328-337`에서 **DOM 스타일을 write** → 인벤토리의 "DOM 의존 3개"에 빠졌던 4번째. ChartShell로 옮겨야 한다.
- **overlay transform**: `initScale`이 buffer**와 overlay** ctx 모두에 `setTransform`(`:720-743`). overlay는 main 유지이므로 overlay transform 소유권도 main.
- **class instance 비의존**: RenderCore가 Scale/Series **클래스 인스턴스(함수·range 콜백 보유, `scale.js:15-23,85-86`)** 에 의존하면 worker로 못 보낸다(Step 6 계약 전제).

## 작업

1. prepare를 `prepareLayout`(chartRect/labelOffset/pixelRatio setTransform)·`prepareScale`(axesRange/labelRange/steps/adjustXAndYAxisWidth)로 추출.
2. **ChartShell 주입 경계**:
   - `chartRect`(getBoundingClientRect)·`pixelRatio`(window.devicePixelRatio)는 ChartShell이 계산해 주입. RenderCore가 직접 안 읽음.
   - **scrollbar DOM positioning은 ChartShell로 이동**. RenderCore는 필요 시 계산된 scrollbar 기하만 반환.
   - **overlay ctx의 transform은 main(ChartShell) 소유**. worker/offscreen series ctx, main static/display ctx, main overlay ctx의 transform 책임을 분리 명시. **주의(pie)**: pie 계열은 overlay ctx가 조건부로 생성될 수 있으니, overlay transform 소유를 단정하기 전에 pie의 overlay 존재를 확인한다.
   - `axes-scale-change` emit은 RenderCore가 결과 반환 → ChartShell이 listener 호출.
3. `drawChart`를 **orchestration layer**로: `prepareLayout`→`prepareScale`→`drawStaticLayer`→`drawSeriesLayer`→(overlay/tip main)→`commitToDisplay` 호출만.
4. **RenderCore가 live class instance에 의존하지 않도록** 입력 경계를 정리(실제 plain snapshot 변환은 Step 6, 여기선 "RenderCore가 무엇을 입력으로 받는가"의 경계를 class-free로 잡는다).
5. **plugin/확장 계약 표**: hook·emit·custom formatter·custom renderer 호출 순서/시점 불변 확인.

## Acceptance Criteria

```bash
npm run lint
npm run test:run
npm run test:visual
```

추가(`test:run` 포함):
- **RenderCore 단독 실행 API-level 테스트**: `document`/`window` 없음 + **scrollbar DOM 호출 없음** + listener 호출 없음 상태에서, ChartShell 주입값만으로 RenderCore가 buffer canvas에 그림을 단언.
- **호출순서 snapshot**(Step 3 확장): prepare→draw→commit 순서·emit 타이밍 고정.

## 검증 절차

1. 위 AC 전부 통과.
2. golden 회귀(허용 tolerance 내): 전 타입 + interaction + group/brush + DPR2 + **scrollbar 사용 차트** 회귀 0.
3. Exit: `drawChart`=orchestration layer, RenderCore=DOM-free·scrollbar-DOM-free·class-instance 비의존.
4. plugin 계약 표 기록. `index.json` step 5 업데이트.

## 금지사항

- RenderCore 내부에서 `getBoundingClientRect`/`window.devicePixelRatio`/**scrollbar DOM 스타일**/DOM/listener를 직접 읽거나 호출하지 마라. 이유: worker엔 없다. ChartShell이 주입/호출.
- RenderCore가 Scale/Series 클래스 인스턴스(함수·range 콜백 보유)에 의존하게 두지 마라. 이유: 직렬화 불가(Step 6).
- 렌더 출력·plugin 호출 순서 변경 금지(성능 중립). 기존 테스트를 깨뜨리지 마라.
