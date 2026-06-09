# Step 2: regression-safety-net (회귀 안전망)

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `/Users/ijiwon/Documents/develop/github/EVUI/CLAUDE.md` — 프로젝트 전역 규칙
- `/Users/ijiwon/.claude/CLAUDE.md` — 사용자 전역 규칙
- `phases/chart-render-perf/plan.md` — 전체 plan. **가장 먼저** (특히 §4 Step 0b 기능 회귀 매트릭스, §6 검증 2축 분리)
- `src/components/chart/Chart.visual.spec.js` — **기존 golden screenshot 테스트.** `toMatchScreenshot` 패턴, `waitForChart` 헬퍼, line/bar/pie 케이스가 이미 있다. 이걸 확장한다
- `vitest.config.browser.js` — visual 테스트 설정(`src/**/*.visual.spec.js`, chromium 800x600)
- `src/components/chart/Chart.vue` — props(data/options) 인터페이스
- `docs/views/scatterChart/example/`, `docs/views/comboChart/example/`, `src/components/chart/example` 데이터 — scatter/heatmap/combo 차트 옵션·데이터 형태 참고

## 작업

plan §4 Step 0b의 **회귀 안전망**을 만든다. **두 축을 분리**한다(plan 명시: 시각 회귀 ≠ tooltip 값 정확성).

### A. 시각 회귀 매트릭스 확장 (`Chart.visual.spec.js`)

기존 `Chart.visual.spec.js`에 케이스를 추가한다. plan §4 Step 0b 매트릭스:

- **타입 보강**: 현재 line/bar/pie만 있음 → **scatter·heatmap·combo** 추가.
- **변형 보강**: `log scale`·`stacked`·`negative` 값·`hidden/visible legend toggle`·`zoom/brush/group/overlay`·`resize/DPR 변경`·`tooltip formatter`·`axis formatter`.
- 각 케이스는 기존 패턴 그대로 `await expect(chart).toMatchScreenshot('<고유-이름>')`을 쓴다.
- 모든 케이스가 한 번에 다 필요하진 않다 — **이후 step3(hit test)·step4(path 생략)이 건드리는 출력 경로를 우선 커버**한다. 최소: line(기본·legend toggle·formatter), scatter(기본), heatmap(기본), combo(기본), stacked, log scale, DPR 변경.

### B. tooltip 값 정확성 테스트 (시각과 분리, 신규 파일)

- 신규 파일: `src/components/chart/Chart.tooltip.spec.js`(단위/통합 spec, **visual 아님** — `npm run test:run`에 포함되도록 `*.spec.js`).
- 목적: step3(hit test 변경)이 **tooltip이 가리키는 값·hover 대상**을 바꾸지 않는지 잡는다. 그림이 아니라 **값**을 검증한다.
- hover/hit 시 반환되는 데이터(공유 라벨 인덱스, 해당 라벨의 시리즈별 값)가 **raw 원본 데이터와 일치**하는지 검증한다(plan: hit/tooltip은 항상 raw 기준).
- 검증 대상 함수가 내부 모듈이면(`findClosestDataIndex`/`findHitItem` 등 `chart.core.js`/`interaction.js`), 모듈을 직접 import해 단위 테스트하거나, 컴포넌트 마운트 후 좌표 기반 hit를 트리거해 결과를 단언한다. **현재 동작을 기준선으로 고정**하는 게 목적이다(현재 값 = 정답).

## Acceptance Criteria

```bash
npm run lint
npm run test:run                  # tooltip 정확성 테스트 통과
npm run test:visual:update        # 최초 1회: 현재 출력을 golden baseline으로 생성
npm run test:visual               # 생성된 golden 대비 통과
```

## 검증 절차

1. `test:visual:update`로 현재 차트 출력을 golden baseline으로 생성한 뒤, `test:visual`이 통과하는지 확인한다(현재 코드 기준이 baseline이므로 통과해야 함).
2. `test:run`으로 tooltip 정확성 테스트가 통과하는지 확인한다.
3. `lint` 통과.
4. 일관성 체크리스트:
   - 시각 회귀와 tooltip 값 정확성을 **별도 파일/별도 축**으로 분리했는가?
   - golden baseline 이미지가 커밋에 포함되는가? (이후 step의 회귀 비교 기준이므로 반드시 커밋)
   - step3/step4가 건드릴 출력 경로(line draw, hover hit)를 커버하는가?
5. `phases/chart-render-perf/index.json`의 step 2 업데이트:
   - 성공 → `"completed"`, `"summary"`에 추가한 visual 케이스 목록 + tooltip 정확성 테스트 파일 경로를 적는다(step3/step4가 이 테스트로 회귀를 검증함).
   - 실패 → `"error"` + `"error_message"`.
   - blocked(예: 브라우저 테스트 환경 미설치) → `"blocked_reason"`.

## 금지사항

- **시각 회귀(golden)와 tooltip 값 정확성을 한 파일/한 축으로 섞지 마라.** 이유: plan은 둘을 명시적으로 분리한다 — Step 1(hit test)은 그림은 안 바꾸고 값만 바꿀 수 있으므로 값 테스트가 따로 있어야 회귀를 잡는다.
- `src/components/chart/`의 **본체 로직을 수정하지 마라.** 이 step은 테스트만 추가한다(테스트를 위해 export가 꼭 필요하면 최소한으로만 추가하고 summary에 명시).
- golden을 미래의 "원하는 출력"으로 만들지 마라. **현재 출력이 baseline이다**(이후 step이 이걸 깨면 회귀로 잡는 게 목적).
- 이 step과 무관한 파일을 수정하지 마라. 기존 테스트를 깨뜨리지 마라.
