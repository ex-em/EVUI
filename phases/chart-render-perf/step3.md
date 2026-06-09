# Step 3: hit-test-reduce (T3 hit test 축소)

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `/Users/ijiwon/Documents/develop/github/EVUI/CLAUDE.md` — 프로젝트 전역 규칙
- `/Users/ijiwon/.claude/CLAUDE.md` — 사용자 전역 규칙 (외과적 수정·단순함 우선)
- `phases/chart-render-perf/plan.md` — 전체 plan. **가장 먼저** (특히 §2 "Hit test 구조(T3 대상)", §4 Step 1)
- `src/components/chart/chart.core.js` — `findClosestDataIndex`(plan 기준 `:1089`, 라벨 루프 `:1138`, per-label `sIds.some()` `:1139`, avgInterval 루프 `:1105`), `findHitItem`(`:947`, `:956`). **line 번호는 이동했을 수 있으니 함수명으로 찾아라**
- `src/components/chart/interaction.js` — `onMouseMove`, `tooltip.throttledMove`(`:531`, 30ms throttle 기존 존재), `getMousePosition`
- `src/components/chart/model.store.js` — `createDataSet`/`addSeriesDS`. ③ 사전계산을 심을 곳. `series.show` 토글이 min/max 재계산에 쓰이는 지점(plan: `:1383`)
- `phases/chart-render-perf/index.json` — step2 summary의 **tooltip 정확성 테스트 파일 경로**(회귀 검증에 사용)

## 작업

plan §4 "Step 1 — T3 hit test 축소"를 수행한다. **binary search 한 줄로는 부족하다** — ①~④를 묶어야 dominant term(O(라벨×시리즈))이 사라진다.

### ③ per-label 유효성 검사 제거 (핵심)

- 현재: hover마다 `findClosestDataIndex` 내부에서 라벨별로 `sIds.some()`을 돌려 "이 라벨에 유효 데이터 가진 시리즈가 있나"를 검사 → **O(라벨×시리즈)**.
- 변경: 라벨 인덱스별 "유효 시리즈 존재" 비트/카운트를 **createDataSet 산출 시점에 model 레이어에서 사전 계산**한다.
- *무효화*: 데이터 변경·시리즈 `show` 토글 시 재계산한다.
- → per-hover `sIds.some()` 곱셈항을 **O(1) 조회**로 대체한다.

### ④ avgInterval 1회 계산·캐시

- 현재: hover마다 별도 O(라벨) 루프로 avgInterval 계산.
- 변경: 라벨 위치 단조성 전제 위에서 **1회 계산·캐시**, 범위 변동 시에만 무효화.

### ① 위치 탐색 binary search

- 라벨 위치 단조성(category/time 축은 인덱스 순 단조)을 **확인한 뒤** binary search로 위치 탐색을 O(log)로.
- all-null 라벨은 ③ 사전계산 결과로 바깥 스캔 없이 유효 라벨로 점프.

### ② 수집 경량화 (`findHitItem`)

- per-series 포맷팅·`measureText` 호출을 경량화한다(불필요 반복 제거). 구조 변경보다 **중복 계산 제거** 위주.

### 불변 계약 (반드시 지켜라)

- **hit/tooltip은 항상 raw 데이터 인덱스 기준**으로 짓는다(plan §4 Step 1). 반환하는 라벨 인덱스·시리즈별 값은 step2의 tooltip 정확성 테스트 기준선과 **동일**해야 한다.
- color picking(pick buffer)은 **도입하지 마라**(plan: line은 얇아 픽셀 hover 불리, x라벨 멀티시리즈 시맨틱 대체 불가).
- 기존 `tooltip.throttledMove`(30ms throttle)가 이미 있으니 **신규 rAF throttle을 새로 도입하지 마라** — 기존 것을 활용한다.

## Acceptance Criteria

```bash
npm run lint
npm run test:run            # step2 tooltip 값 정확성 테스트 통과 (hit/tooltip 값 불변)
npm run test:visual         # 그림 불변 (hit test는 overlay만 건드리고 본체 그림은 안 바꿈)
npm run format:check
```

성능 판정은 **수동**(자동 AC 아님): 사용자가 repro로 만 개 시리즈 hover 시 `findClosestDataIndex`/`hitTest` self-time이 baseline 대비 감소했는지 `measurements.md` 기준으로 확인한다(plan §6 검증 2축 분리 — 성능은 CI fail-gate 아님).

## 검증 절차

1. 위 AC 커맨드가 모두 통과한다. **특히 `test:run`의 tooltip 정확성 테스트가 통과해야 한다** — 통과하지 못하면 hit 결과가 바뀐 것이므로 회귀다.
2. `test:visual` 통과(hit test 변경이 본체 그림을 바꾸면 안 됨).
3. 일관성 체크리스트:
   - ③ 사전계산이 **show 토글·데이터 변경 시 무효화**되는가? (안 되면 stale hit 발생)
   - 반환 값이 raw 기준이고 step2 기준선과 동일한가?
   - pick buffer·신규 throttle을 도입하지 않았는가?
4. `phases/chart-render-perf/index.json`의 step 3 업데이트:
   - 성공 → `"completed"`, `"summary"`에 변경한 함수/사전계산 자료구조 위치 + 무효화 트리거를 적는다.
   - 실패 → `"error"` + `"error_message"`.
   - blocked → `"blocked_reason"`.

## 금지사항

- **tooltip이 가리키는 값·hover 대상을 바꾸지 마라.** 이유: 데이터 의미 불변이 plan 최우선 제약. step2 정확성 테스트가 이를 강제한다.
- pick buffer(color picking) 방식을 도입하지 마라. 이유: plan §4 — line 얇음·멀티시리즈 시맨틱 불가·추가 렌더 패스.
- 신규 rAF/throttle 도입 금지. 이유: `tooltip.throttledMove`가 이미 있다(중복).
- ③ 사전계산 무효화를 빠뜨리지 마라. 이유: show 토글/데이터 변경 후 stale 캐시로 잘못된 hit가 나온다.
- 이 step과 무관한 파일(draw/path 로직 등 step4 영역)을 건드리지 마라.
