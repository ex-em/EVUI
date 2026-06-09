# Step 3: f1-clone-reduce-zoom (F1 — zoom/group clone 정책 통일 + executeZoom stale 검증)

> 이 step은 plan.md Step 1.5 F1의 **zoom/group 경로**다. 감사(step0)에서 가장 위험하다고 표시된 부분 — zoom 시 per-tick clone이 재발(Z2, group은 N+1회)하고, `executeZoom`이 **소비자 `props.data`를 직접 교체**(Z4)한다. step2(메인 F1)의 클론 정책을 zoom/group에도 **안전하게 통일**하되, **소비자 무수정·출력 불변·zoom 동작 불변**을 지킨다.

## 읽어야 할 파일

- `/Users/ijiwon/Documents/develop/github/EVUI/CLAUDE.md`, `/Users/ijiwon/.claude/CLAUDE.md`
- `phases/chart-render-perf/plan.md` — **소스 plan**. §4 Step 1.5 F1(zoom 통일 언급), §2 데이터 파이프라인 비용
- `phases/chart-data-pipeline/contract-audit.md` — **§1-B(zoom 경로 Z1~Z4)**, **§1-C(group G1~G5)**, §4 F1 저위험 판정의 zoom/group caveat. **반드시 정독**
- `src/components/chart/uses.js` — `setDataForUseZoom`(:642~, zoom clone Z2 `:645`), `createEvChartZoom`(:535~, `evChartInfo.props.data.push(props.data)` Z3 `:551`, group G2 `:540-547`), `cloneChartData`(:277)
- `src/components/chart/chartZoom.core.js` — `executeZoom`(:256~, `this.evChartProps.data[idx]` 직접 교체 Z4 `:267,274,279`), 생성자 `this.evChartProps = evChartInfo.props`(:12)
- `src/components/chartGroup/ChartGroup.vue`(:105-115), `src/components/chartGroup/uses.js`(:38-53)
- step2 결과: 메인 F1 클론 정책(flag, toRaw/구조공유 범위) — **zoom/group에 동일 정책을 통일**
- 회귀 안전망 + zoom/group 관련 예제: `docs/views/brushChart/example/`, `docs/views/*/example/`의 zoom 사용 예제

원본 plan·감사 §1-B/§1-C·step2 결과를 먼저 읽고, zoom/group 데이터 흐름을 완전히 파악한 뒤 작업하라.

## 작업

step2에서 도입한 메인 클론 정책(toRaw/구조 공유, feature flag)을 zoom/group 클론 지점에 **안전하게 적용**한다.

- 대상 클론 지점: `setDataForUseZoom`의 `cloneChartData`(`uses.js:645`, non-group `[cloneChartData(newData)]` / group `cloneChartData(newData)`), 필요 시 `createEvChartZoom`의 셋업 클론(`uses.js:556`).
- **핵심 위험(감사 Z4/G5)**: `executeZoom`이 `this.evChartProps.data[idx]`(= 소비자 `props.data`)의 `data[seriesName]`·`labels`를 zoom subset으로 **직접 교체**한다. 복원 소스는 `evChartCloneData`(Z2/G4 클론)다.
  - 따라서 zoom 클론(`evChartClone.data`)이 **toRaw/구조 공유로 `props.data`와 배열을 공유하면**, executeZoom이 props.data 참조를 갈아끼울 때 **복원 소스(clone)가 오염되거나 stale**해질 수 있다.
- **수정 방향(시그니처/의도만 — 구현 재량)**:
  - zoom/group 클론에도 step2의 **toRaw 기반 proxy 분리**를 적용해 get trap 비용을 줄인다.
  - **단 zoom 복원 소스(`evChartClone.data`/`evChartCloneData`)는 `props.data`와 배열 참조를 공유하지 않는 독립 스냅샷이어야 한다** — executeZoom의 직접 교체(Z4)와 충돌하지 않도록. 구조 공유를 한다면 executeZoom이 교체하는 `data[seriesName]`/`labels` 배열은 공유 대상에서 제외하거나, zoom 사용 시 해당 부분은 독립 복사한다.
  - step2의 feature flag와 **동일 flag로 통제**(메인/zoom 정책 일관). flag off면 zoom도 기존 동작.
- **핵심 규칙(반드시)**:
  - **zoom 동작 불변**: zoom in/out, brush, 복원(전체 데이터로 되돌리기), `keepZoomStatus`가 기존과 동일하게 동작해야 한다.
  - **group 동작 불변**: N개 차트 동시 갱신·동기 zoom·brush가 유지돼야 한다.
  - **출력 불변**: 그림·tooltip·hit, date 보존.
  - **소비자 무수정**: 기존 executeZoom의 props.data 직접 교체 동작 자체는 기존 그대로 둔다(이건 기존 라이브러리 동작 — 이번 범위에서 바꾸지 않음). F1은 **클론 비용만** 줄인다.

## Acceptance Criteria

```bash
npm run lint
npm run test:run
npm run test:visual
npm run format:check
```

추가 검증(zoom/group 회귀 — 자동 우선, 어려우면 수동 절차 명시):
- **zoom on/off**: zoom 적용 → 데이터/축 정상, 복원 시 전체 데이터 정상(stale·교차오염 없음). flag on/off 동일.
- **per-tick 갱신 + zoom 동시**: 갱신(in-place push) 중 zoom 상태에서 데이터 정합성 유지.
- **group**: N개 차트 동기 갱신·zoom 정상.
- 자동 테스트가 어려운 부분은 step.md가 아니라 결과 `summary`에 **수동 검증 절차**를 명시한다(측정 수치는 지어내지 말 것).

## 검증 절차

1. AC 커맨드 모두 통과(test:run·test:visual 회귀 0).
2. 일관성 체크리스트:
   - zoom in/out/복원·`keepZoomStatus`·brush·group 동기가 기존과 동일한가?
   - zoom 복원 소스 클론이 `props.data`와 위험한 배열 alias를 갖지 않는가(executeZoom 직접 교체와 충돌 없음)?
   - 메인(step2)과 **동일 flag·동일 정책**으로 통일됐는가?
   - 출력·date 보존 불변인가?
3. `phases/chart-data-pipeline/index.json`의 step 3 업데이트:
   - 성공 → `"status": "completed"`, `"summary"`에 zoom/group 적용 방식·alias 제외 범위·zoom 회귀 검증 방법(자동/수동)을 한 줄로. **이 단계까지 끝나면 "사람이 재측정(D4a) → measurements.md 기록" 차례임을 summary에 명시**.
   - 실패(3회 후) → `"error"`. 개입 필요 → `"blocked"`.

## 금지사항

- **executeZoom의 `props.data` 직접 교체(Z4) 동작 자체를 바꾸지 마라.** 이유: 기존 라이브러리 zoom 동작이며 소비자 영향이 있을 수 있다. F1은 클론 비용만 줄인다.
- **zoom 복원 소스를 `props.data`와 배열 참조 공유시키지 마라.** 이유: executeZoom이 props.data를 교체하면 복원이 깨진다(stale/교차오염).
- **`deep:true` watch(F2)를 건드리지 마라.**
- **F3(isEqual)/F4(normalize 캐시)를 하지 마라.** 이유: 이번 묶음 범위 밖 — 재측정 후 결정.
- **측정 수치를 지어내지 마라.** 재측정(D4a)은 사람이 한다.
- 출력·zoom 동작을 바꾸지 마라. 기존 테스트를 깨뜨리지 마라. 무관한 파일을 수정하지 마라.
