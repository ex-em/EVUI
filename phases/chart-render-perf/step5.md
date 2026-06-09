# Step 5: drawchart-inventory (Step 2.4 — drawChart 책임 목록화)

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `/Users/ijiwon/Documents/develop/github/EVUI/CLAUDE.md` — 프로젝트 전역 규칙
- `phases/chart-render-perf/plan.md` — 전체 plan. **가장 먼저** (특히 §2 "렌더링 구조", §4 Step 2.4, Step 2.5)
- `src/components/chart/chart.core.js` — `drawChart`와 그 직접 호출 함수들: `initScale`/`getAxesRange`/`getLabelOffset`/`calculateSteps`/`adjustXAndYAxisWidth`/`drawAxis`/`drawSeries`/`drawTip`/buffer→display commit. **함수명으로 찾아라**(line은 이동 가능)
- `src/components/chart/helpers/helpers.util.js` — DOM 의존(`document.createElement`, `calcTextSize`, `htmlToElement`) 파악용
- `src/components/chart/element/`, `src/components/chart/scale/` — canvas/measureText 의존 파악용

## 작업

plan §4 "Step 2.4 — drawChart 책임 목록화"를 수행한다. **이것은 코드 변경 없는 순수 분석 단계다.** RenderCore 분리(이후 별도 step)에 앞서 `drawChart`가 하는 일을 표로 목록화해 분리 경계를 확정한다. **산출물은 표 1개로 고정**한다(분석 마비 방지).

### 산출물

`phases/chart-render-perf/drawchart-inventory.md` 파일을 만들고, `drawChart`와 그 직접 호출 함수의 각 작업을 **행**으로, 아래 **열**로 분류한 표를 작성한다:

| 작업(함수/구간) | 의존 분류 | 분리 가능 여부 | RenderCore mini-step 매핑 | 비고 |
|---|---|---|---|---|

- **의존 분류**: DOM 의존(`getBoundingClientRect`·legend/tooltip DOM 등) / canvas 의존(ctx·`measureText`) / model 의존(`seriesList`·`dataSet`·axes) / plugin 의존(plugin hook·formatter). 한 작업이 여러 의존을 가지면 모두 표시.
- **분리 가능 여부**: `RenderCore`(순수 렌더로 뺄 수 있음) / `ChartShell`(DOM·layout 주입으로 남아야 함) / `미정`.
- **RenderCore mini-step 매핑**: plan Step 2.5의 mini-step 경계(`commitToDisplay` → `drawSeriesLayer` → `drawStaticLayer` → `prepareLayout`/`prepareScale`) 중 어디로 가는지. 이 매핑이 Step 2.5-a~d 각 단계가 표의 어떤 행을 옮기는지 보여줘야 한다.

### 이걸로 결정되는 것 (표 아래에 짧게 정리)

- Step 2.5의 mini-step 경계가 표의 "분리 가능" 묶음과 일치하는지.
- DOM 의존 작업은 ChartShell이 주입할 값으로 확정(어떤 값을 RenderCore에 넘겨야 하는지).

## Acceptance Criteria

```bash
# 코드 변경이 없어야 한다 — src/ diff가 비어 있어야 함
git diff --stat -- src/
```

(위 명령 출력이 비어 있으면 통과. 분석 산출물은 `phases/chart-render-perf/drawchart-inventory.md` 하나뿐이다.)

## 검증 절차

1. `git diff --stat -- src/` 출력이 **비어 있다**(코드 변경 0 — 순수 분석).
2. `drawchart-inventory.md`에 표가 완성되고, `drawChart` 직접 호출 함수가 모두 행으로 들어갔다.
3. Step 2.5-a(`commitToDisplay`)~2.5-d(`prepare*`) 각 mini-step이 표의 어떤 행을 옮기는지 매핑된다.
4. 일관성 체크리스트:
   - DOM 의존 작업이 `ChartShell`(또는 주입)로 분류됐는가?
   - `helpers.util.js`의 top-level `document.createElement`(plan §2 Worker 호환성 — 이후 Worker 진입 시 선결)가 의존 분류에 드러나는가?
5. `phases/chart-render-perf/index.json`의 step 5 업데이트:
   - 성공 → `"completed"`, `"summary"`에 `drawchart-inventory.md` 경로 + "commit 분리가 가능/불가" 결론 한 줄(다음 step6의 근거).
   - 실패 → `"error"` + `"error_message"`.
   - blocked → `"blocked_reason"`.

## 금지사항

- **코드를 수정하지 마라.** 이유: plan §4 Step 2.4 — characterization 없이 코드부터 찢는 리스크 차단. 이 step은 표만 만든다.
- 표를 1개 초과로 늘리거나 분석을 무한 확장하지 마라. 이유: plan 명시 "산출물은 표 1개로 고정(분석 마비 방지)".
- 이 step과 무관한 파일을 수정하지 마라.
