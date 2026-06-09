# Step 6: commit-to-display (Step 2.5-a — commitToDisplay 분리)

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `/Users/ijiwon/Documents/develop/github/EVUI/CLAUDE.md` — 프로젝트 전역 규칙
- `/Users/ijiwon/.claude/CLAUDE.md` — 사용자 전역 규칙 (외과적 수정·단순함 우선)
- `phases/chart-render-perf/plan.md` — 전체 plan. **가장 먼저** (특히 §4 Step 2.5, "Step 2.5-a — `commitToDisplay` 분리", Exit Criteria)
- `phases/chart-render-perf/drawchart-inventory.md` — **step5 산출물.** commit 구간이 분리 가능으로 분류됐는지, ChartShell이 주입할 값이 무엇인지 확인하고 그 경계대로 분리한다
- `src/components/chart/chart.core.js` — `drawChart` 내 buffer→display `drawImage` commit 구간(plan §2 `:349`). display/buffer/overlay 3-canvas 구조(`:61,64,74`)
- `phases/chart-render-perf/index.json` — step5 summary(commit 분리 가능/불가 결론)

## 작업

plan §4 "Step 2.5-a — `commitToDisplay` 분리"를 수행한다. **이것은 성능 개선이 아니라 구조 안정화 작업이다**(plan 명시). 목표는 redraw를 빠르게 만드는 게 아니라 렌더 파이프라인의 **출력단(commit) 경계를 명확히** 하는 것이다. 기대 성능은 **중립(회귀 없음)**.

### 분리 내용

- display 쓰기(buffer canvas → display canvas로의 `drawImage`, 그리고 Worker 경로에서 쓰일 ImageBitmap blit 자리)를 **`commitToDisplay` 라는 별도 함수로 추출**한다.
- 가장 작고 경계가 명확한 단계이므로 Step 2.5 중 가장 먼저 한다(나머지 2.5-b~d는 이번 phase 범위 밖 — Step 3 게이트 후 별도 진행).
- **메인에서 그대로 호출 가능**하게 설계한다(Worker 전용 분기를 지금 만들지 마라 — Worker는 게이트 미통과 시의 별도 트랙).
- step5 inventory 표에서 commit 구간이 의존하는 값(canvas 핸들·크기·DPR 등)을 인자로 받게 하여, RenderCore 단계 호출의 얇은 경계가 되도록 한다.

### 지켜야 할 것

- 분리 전후 **출력이 동일**해야 한다(buffer→display commit 동작·순서 불변).
- plugin hook·event hook·custom formatter·custom series renderer를 깨지 않는다(plan §4 Step 2.5 "plugin/확장 계약 검토"). 호출 순서를 바꾸지 마라.
- EvChartGroup/EvChartBrush(provide/inject 동기화)·overlay 인터랙션 레이어 동작을 유지한다.

## Acceptance Criteria

```bash
npm run lint
npm run test:visual         # 전 타입(line·bar·scatter·pie·heatmap·combo) 시각 회귀 0
npm run test:run            # tooltip 정확성·기존 단위 테스트 통과
npm run format:check
```

성능은 **중립**이어야 한다(자동 게이트 아님): redraw self-time이 baseline 대비 의미 있게 늘지 않았는지 `measurements.md`로 확인(개선이 목표가 아니라 회귀 없음이 목표).

## 검증 절차

1. 위 AC가 모두 통과한다. **`test:visual`이 전 타입 회귀 0으로 통과**해야 한다(순수 구조 변경이므로 그림이 바뀌면 안 됨).
2. `test:run`으로 tooltip 정확성·기존 테스트가 통과한다.
3. EvChartGroup/EvChartBrush 예제와 overlay 인터랙션이 동작하는지 확인한다(docs에서 zoom/brush/group 예제 수동 확인 권장).
4. 일관성 체크리스트:
   - `commitToDisplay`가 buffer→display commit을 인자 주입으로 받는 얇은 함수인가?
   - Worker 전용 분기를 미리 만들지 않았는가?(이번 범위 밖)
   - plugin lifecycle 호출 순서가 유지되는가?
   - 출력이 분리 전과 동일한가?
5. `phases/chart-render-perf/index.json`의 step 6 업데이트:
   - 성공 → `"completed"`, `"summary"`에 추출한 `commitToDisplay` 시그니처·주입 인자·이후 RenderCore 재사용 경계를 적는다.
   - 실패 → `"error"` + `"error_message"`.
   - blocked → `"blocked_reason"`.

## 금지사항

- **성능 최적화를 시도하지 마라.** 이유: plan §4 Step 2.5 — 이 단계는 구조 안정화이지 성능 작업이 아니다. 성능은 Step 2/3에서 판정.
- `drawChart` 전체를 한 번에 prepare/draw/static까지 다 쪼개지 마라. 이유: 이번 step은 **2.5-a(commit)만**. 2.5-b~d는 게이트 후 별도 진행(plan 명시).
- Worker 전용 코드 경로·OffscreenCanvas 분기를 지금 만들지 마라. 이유: Worker는 Step 3 게이트 미통과 시의 조건부 트랙.
- plugin hook 호출 순서를 바꾸지 마라. 이유: custom plugin/formatter 회귀.
- 이 step과 무관한 파일을 수정하지 마라. 기존 테스트를 깨뜨리지 마라.
