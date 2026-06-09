# Step 1: perf-harness (계측 harness)

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `/Users/ijiwon/Documents/develop/github/EVUI/CLAUDE.md` — 프로젝트 전역 규칙
- `/Users/ijiwon/.claude/CLAUDE.md` — 사용자 전역 규칙 (단순함 우선·외과적 수정)
- `phases/chart-render-perf/plan.md` — 전체 plan 원본. **가장 먼저 읽어라** (특히 §4 Step 0b 계측 harness, §6 검증 2축 분리)
- `phases/chart-render-perf/index.json` — step0 summary에서 **생성된 repro 예제 경로**를 확인하라
- step0에서 만든 repro 예제(`PerfStressSingle.vue`, `PerfStressDashboard.vue`) — 여기에 계측을 붙인다
- `src/components/chart/chart.core.js` — `createDataSet`/`drawChart`/hit test/buffer→display commit 호출 지점(plan §2 참조). 계측이 어느 경로를 감싸야 하는지 파악용 (**읽기만, 본체 수정 금지**)

## 작업

plan §4 "Step 0b — 계측 harness"를 수행한다. 목적은 이후 step(1~3 게이트)이 **같은 이름의 `performance.mark/measure`로 비교**되도록 측정 인프라를 repro 페이지에 심는 것이다.

### 계측 대상 (mark/measure 이름 통일)

repro 예제 페이지 한정으로 다음 단위를 측정한다. 이름은 plan과 일치시킨다:

- `createDataSet` — 데이터 변환 구간
- `drawChart` — 전체 렌더 구간
- `hitTest` — hover 시 hit test 구간
- `commit` — buffer→display commit 구간
- **interaction latency** — `pointermove` 입력 timestamp → tooltip paint 완료까지

### 구현 방식 (본체 비침투)

- `src/` 라이브러리 본체에 `performance.mark/measure`를 **영구 삽입하지 마라.** plan §4 Step 0b: "영구 계측 코드가 아니라 repro/벤치 페이지 한정 — 라이브러리 본체엔 남기지 않음."
- repro 예제(`docs/`) 안에서 측정한다. EvChart가 노출하는 이벤트 hook(렌더 완료 emit 등)·`PerformanceObserver`·`pointermove` 리스너로 감싼다. 본체가 측정 지점을 노출하지 않아 불가피하게 감쌀 수 없는 구간은, **무엇을 못 쟀는지 주석으로 명시**하고 DevTools Performance 수동 캡처로 대체하도록 안내 주석을 남긴다(plan은 수동 캡처 병행을 허용).
- 수집 결과를 화면(예제 내 표/패널) 또는 `console.table`로 출력해 사용자가 `measurements.md`에 옮겨 적을 수 있게 한다.
- `createDataSet`/`drawChart` 등 본체 내부 구간을 감싸야만 한다면, **repro 예제 쪽에서 시간 측정 가능한 최소 wrapper**(예: 갱신 직전/직후 `performance.now()`)로 근사하고, 한계를 주석에 명시한다.

## Acceptance Criteria

```bash
npm run lint
npm run format:check
```

수동 확인(자동 게이트 아님):

```bash
npm run docs
# repro 예제에서 갱신/ hover 시 createDataSet/drawChart/hitTest/commit/interaction latency 수치가
# 표 또는 console.table로 출력되는지 확인
```

## 검증 절차

1. 위 AC(`lint`, `format:check`)가 통과한다.
2. `npm run docs`로 repro 예제에서 측정 수치가 출력되는지 확인한다.
3. 일관성 체크리스트:
   - `src/` 본체에 `performance.mark/measure`나 계측 코드를 남기지 않았는가? (grep으로 확인: `git diff --stat` 에 `src/` 변경이 없어야 함)
   - mark/measure 이름이 plan과 동일한가(`createDataSet`/`drawChart`/`hitTest`/`commit`)?
   - 측정하지 못한 구간을 주석으로 명시했는가?
4. `phases/chart-render-perf/index.json`의 step 1 업데이트:
   - 성공 → `"completed"`, `"summary"`에 계측이 출력하는 지표 목록 + 사용자가 측정해야 할 것(= `measurements.md`의 Step 0a 표 채우기)을 적는다.
   - 실패 → `"error"` + `"error_message"`.
   - blocked → `"blocked_reason"`.

## 금지사항

- **`src/` 라이브러리 본체에 계측 코드를 남기지 마라.** 이유: plan §4 Step 0b — 영구 계측은 본체 오염. repro/벤치 페이지 한정.
- 측정 수치를 너 스스로 `measurements.md`에 적지 마라. 이유: 실제 DevTools 측정은 저사양 기준 기기에서 사용자가 수동 수행한다. 너는 측정 도구만 만든다.
- 새 측정 라이브러리(의존성)를 추가하지 마라. 이유: 단순함 우선 — `performance` API와 기존 도구로 충분하다.
- 이 step과 무관한 파일을 수정하지 마라. 기존 테스트를 깨뜨리지 마라.
