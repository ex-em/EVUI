# Step 0: repro-examples (의사결정용 repro 예제)

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `/Users/ijiwon/Documents/develop/github/EVUI/CLAUDE.md` — 프로젝트 전역 규칙
- `/Users/ijiwon/.claude/CLAUDE.md` — 사용자 전역 규칙 (단순함 우선·외과적 수정)
- `phases/chart-render-perf/plan.md` — 전체 plan 원본. **가장 먼저 읽어 전체 그림 파악** (특히 §1 결정 요약, §4 Step 0a)
- `docs/views/lineChart/example/Default.vue` — 이미 "데이터 자동 업데이트" 토글 + `setInterval` 패턴이 있는 라이브 예제. **repro의 베이스로 삼아라**
- `docs/views/lineChart/props.js` — 예제 등록부(import + `components`/raw 등록 패턴)
- `docs/router/index.js` — 라우트 등록(`lineChart` → `lineChartProps`)
- `docs/views/comboChart/example/` 의 기존 예제 1~2개 — B-real(다중 차트) repro 베이스 참고

## 작업

plan §4 "Step 0a — 의사결정용 repro"의 **repro 예제 생성 부분만** 수행한다. **측정(DevTools Performance 캡처)은 이 step 범위가 아니다** — 측정은 step1(harness) 완료 후 사용자가 수동으로 하고 `measurements.md`에 기록한다.

두 개의 repro 예제를 만든다.

### 1. A 프로파일 — line 만 개 시리즈 단일 차트

- 파일: `docs/views/lineChart/example/PerfStressSingle.vue` (네이밍은 기존 PascalCase 예제 컨벤션 따름)
- `Default.vue`의 라이브 토글 + `setInterval(..., 1000)` 패턴을 재사용한다.
- 시리즈 수는 **상수로 쉽게 조절 가능**하게 둔다(예: `const SERIES_COUNT = 10000`). 시리즈당 포인트 수도 상수로 노출한다(Step 0a 선결 분류 ①에서 "시리즈당 포인트 수 vs 화면 가로 픽셀"을 봐야 하므로).
- `setInterval`로 **초당 1회** 주기 갱신. 갱신 방식은 plan Q2 분류를 측정할 수 있도록, **append형(슬라이딩 윈도우)과 full-replace를 토글**하거나 둘 다 시연 가능하게 한다(어렵다면 주석으로 전환 방법을 명시).
- 원본 데이터를 그대로 렌더한다 — **다운샘플링/시리즈 솎기 금지**(plan 데이터 불변 제약).

### 2. B-real 프로파일 — 다중 차트 대시보드

- 파일: `docs/views/comboChart/example/PerfStressDashboard.vue` (또는 `lineChart/example/`에 둬도 됨 — 등록만 맞추면 됨)
- **같은 timer/window에 묶여 동시에 갱신되는 다수 차트**(plan 프로파일 B의 핵심: heavy render job이 같은 짧은 window에 2개 이상 pile-up). 차트 수와 각 차트의 시리즈 수를 상수로 노출한다.
- 확인된 downstream 사용 패턴의 **렌더 특성만** 익명화해 재현한다. 제품명·도메인 데이터·비공개 화면 구조는 넣지 않는다(plan §4 "B-real 재현 정보 수집").

### 3. 등록

- `docs/views/lineChart/props.js`(및 combo면 `docs/views/comboChart/props.js`)에 기존 패턴 그대로 import + 등록한다(`Xxx`, `XxxRaw` 쌍).

## Acceptance Criteria

```bash
npm run lint
npm run format:check
```

수동 확인(이 step의 자동 게이트 아님, 동작 확인용):

```bash
npm run docs   # 포트 9999
# 브라우저에서 lineChart / comboChart 페이지의 새 예제가 렌더되고 초당 1회 갱신되는지 확인
```

## 검증 절차

1. 위 AC 커맨드(`lint`, `format:check`)가 통과한다.
2. `npm run docs`로 띄워 두 repro 예제가 라우트에 노출되고, 차트가 렌더되며 `setInterval` 주기 갱신이 동작하는지 눈으로 확인한다.
3. 일관성 체크리스트:
   - 기존 예제 파일/등록 컨벤션(PascalCase, props.js import 쌍)을 따랐는가?
   - 시리즈 수·포인트 수·차트 수가 상수로 조절 가능한가? (Step 0a 측정에서 규모를 바꿔가며 측정해야 함)
   - 다운샘플링·시리즈 culling을 넣지 않았는가?
4. `phases/chart-render-perf/index.json`의 step 0을 업데이트:
   - 성공 → `"status": "completed"`, `"summary"`에 생성한 예제 파일 경로 2개 + 노출 라우트를 적는다(다음 step harness가 이 예제에 계측을 붙임).
   - 실패(3회 수정 후) → `"status": "error"`, `"error_message"`.
   - 사용자 개입 필요 → `"status": "blocked"`, `"blocked_reason"`.

## 금지사항

- **라이브러리 본체(`src/`)를 수정하지 마라.** 이 step은 `docs/` repro 예제만 추가한다. 이유: repro는 측정·검증용 산출물이고, 본체 변경은 step3 이후의 일이다.
- **DevTools 측정·수치 기록을 하지 마라.** 이 step은 측정 대상 repro를 만들 뿐이다. 측정은 사용자가 수동으로 한다.
- 다운샘플링(LTTB)·시리즈 culling으로 데이터를 솎지 마라. 이유: plan 데이터 불변 제약 — 화면에 보이는 점·곡선이 바뀐다.
- 제품명·도메인 비공개 데이터를 넣지 마라. 이유: public 리포 + plan §4 익명화 요구.
- 이 step과 무관한 파일을 수정하지 마라. 기존 테스트를 깨뜨리지 마라.
