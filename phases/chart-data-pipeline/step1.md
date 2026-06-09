# Step 1: f0-normalize-non-mutating (F0 — normalize 원본 mutate 제거)

> 이 step은 plan.md Step 1.5의 **F0(선결)** 다. 계약 감사(step0 `contract-audit.md`)에서 확인된 **현존 버그**(normalize가 소비자 원본을 in-place mutate)를 제거한다. **소비자 무수정·출력 불변** 원칙을 지키는 순수 내부 수정이다.

## 읽어야 할 파일

- `/Users/ijiwon/Documents/develop/github/EVUI/CLAUDE.md` — 프로젝트 전역 규칙
- `/Users/ijiwon/.claude/CLAUDE.md` — 사용자 전역 규칙(단순함·외과적 수정)
- `phases/chart-render-perf/plan.md` — **소스 plan(가장 먼저)**. §4 Step 1.5의 **F0** 항목, §1 측정 갱신 블록
- `phases/chart-data-pipeline/contract-audit.md` — **계약 감사 결과(필독)**. 특히 §0-1(원본 mutate 사실), §1-A②, §4 F0행
- `src/components/chart/uses.js` — `getNormalizedData`(:330), `getNormalizedOptions`(:312-313, 빈 target 패턴 참고), `DEFAULT_DATA`(:258-263), `cloneChartData`(:277)
- `src/components/chart/Chart.vue` — data watcher(:231-263), 특히 `getNormalizedData(chartData)`(:236), `realTimeScatter` 분기(:234)
- 회귀 안전망: `src/components/chart/Chart.tooltip.spec.js`, `src/components/chart/Chart.visual.spec.js`

원본 plan과 감사 문서를 먼저 읽어 전체 그림을 잡은 뒤 작업하라.

## 작업

`getNormalizedData`(`uses.js:330`)가 **소비자 원본 `props.data`(reactive proxy)를 in-place mutate하지 않도록** 고친다.

- 현재: `const getNormalizedData = (data) => defaultsDeep(data, DEFAULT_DATA);`
  - lodash `defaultsDeep`는 **첫 인자(data)를 target으로 변형**하고 같은 참조를 반환한다 → 소비자가 `groups/labels/series/data` 중 일부를 생략하면 그 빈 컨테이너가 **원본 proxy에 주입**된다(원본 오염 + `set`/`trigger` trap).
- 수정 방향(시그니처/의도만 — 구현은 재량): **누락된 top-level 키만 채운 새 객체를 반환**하고 원본은 건드리지 않는다. `getNormalizedOptions`의 `defaultsDeep({}, …)`처럼 **빈 target**을 쓰거나, `DEFAULT_DATA`가 빈 컨테이너(`series:{}, groups:[], labels:[], data:{}`)뿐이므로 **top-level 4키만 보강하는 shallow 처리**로 충분하다.
- **핵심 규칙(반드시 지킬 것)**:
  - **원본 `props.data` 불변**: normalize 후 소비자가 넘긴 객체에 어떤 키도 주입되면 안 된다.
  - **출력 동일**: 정규화 결과(있는 키는 그대로, 없는 키는 기본값)는 기존과 동일해야 한다. createDataSet/hit/tooltip이 보는 값이 바뀌면 안 된다.
  - **비용 중립 유지**: 이 step은 버그 수정이다. **여기서 deep copy를 새로 도입하지 마라**(deep copy/clone 축소는 F1 = step2 소관). normalize는 top-level 보강만 하고, 깊은 분리/클론은 기존 `cloneChartData`(`Chart.vue:250`)가 계속 담당한다.
  - **`realTimeScatter` 분기**(`Chart.vue:234`)는 별도 경로다 — 그 동작을 바꾸지 마라.

## Acceptance Criteria

```bash
npm run lint
npm run test:run
npm run test:visual
npm run format:check
```

추가로, **원본 불변 회귀 테스트를 신규 작성**한다(예: `src/components/chart/` 의 적절한 *.spec.js):
- 일부 top-level 키(`groups` 또는 `labels`)를 생략한 `data`로 `getNormalizedData`(또는 컴포넌트 mount)를 호출한 뒤, **원본 객체에 그 키가 주입되지 않았음**을 단언.
- 누락 키 입력에도 **정규화 출력은 기본값으로 채워짐**을 단언.

## 검증 절차

1. 위 AC 커맨드가 모두 통과한다(test:run·test:visual 회귀 0).
2. 일관성 체크리스트:
   - 원본 `props.data`가 normalize 후 변형되지 않는가(신규 테스트로 확인)?
   - 정규화 출력이 기존과 동일한가(golden·tooltip 회귀 0)?
   - 이 step에서 새 deep copy/clone을 도입하지 않았는가(F1과 분리)?
   - `getNormalizedData` 외 무관한 코드를 건드리지 않았는가?
3. `phases/chart-data-pipeline/index.json`의 step 1 업데이트:
   - 성공 → `"status": "completed"`, `"summary"`에 수정 방식(빈 target/shallow)과 신규 테스트 파일을 한 줄로.
   - 실패(3회 후) → `"status": "error"`, `"error_message"`.
   - 개입 필요 → `"status": "blocked"`, `"blocked_reason"`.

## 금지사항

- **deep copy/clone 축소(F1)를 여기서 하지 마라.** 이유: F1(step2)이 `cloneChartData`의 toRaw 전환·복사량 감축을 담당한다. step1은 normalize의 원본 mutate 제거(버그 fix)만.
- **`deep:true` watch(F2)를 건드리지 마라.** 이유: 소비자 in-place mutation 감지 계약, 범위 밖.
- **zoom/group 경로를 건드리지 마라.** 이유: F1-zoom(step3) 소관.
- 출력(그림·tooltip 값·hit 대상)을 바꾸지 마라. 기존 테스트를 깨뜨리지 마라. 무관한 파일을 수정하지 마라.
