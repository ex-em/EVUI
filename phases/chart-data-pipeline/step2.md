# Step 2: f1-clone-reduce-main (F1 — 메인 clone 축소, feature flag)

> 이 step은 plan.md Step 1.5의 **F1(주 이득)** 메인 경로다. 측정상 per-tick 최대 비용인 **clone(self-time 30.4% + GC 동반)** 을 줄인다. **소비자 무수정·출력 불변**. zoom/group 경로는 step3에서 별도로 다루므로 **여기서는 메인 경로만** 손댄다.

## 읽어야 할 파일

- `/Users/ijiwon/Documents/develop/github/EVUI/CLAUDE.md`, `/Users/ijiwon/.claude/CLAUDE.md`
- `phases/chart-render-perf/plan.md` — **소스 plan**. §4 Step 1.5의 **F1** 항목·핵심 통찰(클론이 reactive proxy 훑어 get trap 유발), §1 측정 갱신, §6 검증
- `phases/chart-render-perf/playwright-probe.md` — clone 30.4% / call-tree 귀속(F1으로 빠지는 양)
- `phases/chart-data-pipeline/contract-audit.md` — §0-2(클론=유일 격리 경계), §0-3·§1-A⑤(메인 경로 입력 비변형=F1 저위험 근거), §4 F1행·F1 저위험 판정
- `src/components/chart/uses.js` — `cloneChartData`(:277, `cloneDeepWith` + `isImmutableDateLike` 보존)
- `src/components/chart/Chart.vue` — `evChart.data = cloneChartData(newData)`(:250), data watcher 전체(:231-263)
- step1 결과: `getNormalizedData`(F0) 변경 — 이미 원본 비변형
- 회귀 안전망: `Chart.tooltip.spec.js`, `Chart.visual.spec.js`, step1에서 추가된 spec

원본 plan·감사 문서를 먼저 읽고, step1에서 바뀐 normalize를 확인한 뒤 작업하라.

## 작업

메인 경로의 per-tick 전체 딥클론(`Chart.vue:250` `evChart.data = cloneChartData(newData)`)의 비용을 줄인다.

- **핵심 통찰(probe·감사)**: `cloneChartData`(`cloneDeepWith`)가 **reactive proxy(`props.data` 유래 `newData`)를 순회**하면 매 프로퍼티 접근이 `get`/`noTracking` trap을 탄다 → `baseClone`(클론 자체) + 그에 딸린 reactive get 비용이 함께 발생. **클론 대상에서 proxy를 먼저 벗기면(`toRaw`)** trap 비용이 사라진다.
- **수정 방향(시그니처/의도만 — 구현 재량)**:
  - 클론 **입력을 `toRaw`로 proxy 분리**한 뒤 복사(복사는 유지하되 trap 비용 제거). Vue `toRaw`는 raw target을 반환하며, raw target의 nested 접근은 proxy를 다시 씌우지 않는다.
  - 가능하면 **변경분만 복사(구조 공유)** 로 복사량을 더 줄인다. **단 메인 경로에 한해** 적용한다.
  - **feature flag로 격리**한다(예: 모듈 내부 상수/옵션). flag off면 기존 `cloneChartData` 동작, on이면 새 경로. harness/측정에서 A/B 비교 후 기본 on 승격.
- **핵심 규칙(반드시)**:
  - **출력 불변**: `evChart.data`가 가리키는 값(라벨/시리즈/데이터/날짜 값)이 기존과 동일해야 한다. **`isImmutableDateLike` 날짜 보존 동작을 유지**하라(`cloneChartData`가 하던 date 참조 보존).
  - **격리 유지(입력 alias 금지)**: `evChart.data`는 소비자 `props.data`와 **참조를 공유하면 안 된다**(구조 공유를 하더라도 downstream이 입력 배열/포인트를 통해 원본을 건드리거나 원본 변경이 새 가도록 만들면 안 됨). 감사 §0-3에서 메인 createDataSet/addSeriesDS는 입력 비변형으로 확인됐으니 메인 한정 저위험이나, **입력 배열을 그대로 alias하지 말 것**(다음 틱 isEqual baseline·in-place mutation 반영이 깨질 수 있음).
  - **isEqual baseline 유지**: `evChart.data`는 다음 틱 `isEqual` 비교의 prev 스냅샷으로도 쓰인다(`Chart.vue:238,247`). 구조 공유로 prev가 next와 같은 참조를 공유하면 비교가 무의미해진다 — baseline 정합성을 깨지 마라.
  - **in-place mutation 반영 유지**: 소비자가 `data[i].data.push`로 갱신하는 패턴(감사 §3)이 **기존과 동일하게 차트에 반영**돼야 한다.

## Acceptance Criteria

```bash
npm run lint
npm run test:run
npm run test:visual
npm run format:check
```

추가 신규 테스트:
- **flag on/off 출력 동일**: 동일 입력에 대해 새 클론 경로(on)와 기존(off)의 `evChart.data` 구조·값이 동일.
- **in-place push 반영**: `reactive` data에 `labels.push`/`seriesData.push` 후 차트 데이터가 갱신됨(감사 §3 idiom 재현).
- **원본 불변 + date-like 값 보존**.

## 검증 절차

1. AC 커맨드 모두 통과(test:run·test:visual 회귀 0 — 전 타입 golden 유지).
2. 일관성 체크리스트:
   - 출력(그림·tooltip·hit)·date 보존이 불변인가?
   - `evChart.data`가 `props.data`와 참조를 공유하지 않는가(격리)?
   - isEqual baseline·in-place push 반영이 유지되는가(신규 테스트)?
   - feature flag로 격리됐는가(on/off 전환 가능)?
   - **zoom/group 경로(`setDataForUseZoom`/`cloneChartData` zoom 분기·`chartZoom.core.js`)를 건드리지 않았는가**(step3 소관)?
3. `phases/chart-data-pipeline/index.json`의 step 2 업데이트:
   - 성공 → `"status": "completed"`, `"summary"`에 flag 이름·toRaw/구조공유 적용 범위·신규 테스트를 한 줄로(다음 step3가 zoom에 같은 정책 통일 시 참고).
   - 실패(3회 후) → `"error"`. 개입 필요 → `"blocked"`.

## 금지사항

- **zoom/group 경로를 건드리지 마라.** 이유: `executeZoom`이 `props.data`를 직접 교체(감사 Z4)하므로 구조 공유가 stale/교차오염을 일으킬 수 있다 → step3에서 별도 정책으로 통일·검증한다. step2는 메인 클론(`Chart.vue:250`)만.
- **`deep:true` watch(F2)·normalize(F0, step1 완료분)를 다시 건드리지 마라.**
- 입력 `props.data` 배열/포인트를 그대로 alias하지 마라. 이유: 격리·isEqual baseline·in-place 반영이 깨진다.
- 출력을 바꾸지 마라. 기존 테스트를 깨뜨리지 마라. 무관한 파일을 수정하지 마라.
