# Step 0: contract-audit (데이터 파이프라인 계약 감사 — 코드 변경 없음)

> 이 step은 plan.md의 **Step 1.5-0(데이터 계약 감사)** 다. 코드를 고치기 전에 "내부가 입력을 어떻게 다루는지(mutation/alias/cache)"를 표로 닫아, 이후 F0~F4 채택안과 안전 범위를 확정하기 위한 **순수 분석 단계**다. **코드 변경 0.**

## 읽어야 할 파일

먼저 아래를 읽고 전체 그림과 설계 의도를 파악하라:

- `/Users/ijiwon/Documents/develop/github/EVUI/CLAUDE.md` — 프로젝트 전역 규칙
- `/Users/ijiwon/.claude/CLAUDE.md` — 사용자 전역 규칙(단순함·외과적 수정)
- `phases/chart-render-perf/plan.md` — **소스 plan(가장 먼저 읽어 전체 그림 파악)**. 특히:
  - §1 "★ 측정 갱신(2026-06-09)" 블록 — 병목이 데이터 파이프라인(~80%)이라는 근거
  - §2 "★ 데이터 파이프라인(update watcher) 비용" — per-tick 경로 ①~④
  - §4 "Step 1.5" 전체 — 특히 **Step 1.5-0** 추적 경로(메인 + zoom + group), F0~F4 후보, cache invalidation matrix
- `phases/chart-render-perf/playwright-probe.md` — self-time flat + call-tree 귀속 측정(clone 30.4% / deepwatch 19.3% 등)
- `src/components/chart/Chart.vue` — 특히 `watch(() => props.data, …, { deep: true })`(:231-263), `cloneChartData(newData)`(:250), `setDataForUseZoom(newData)`(:259)
- `src/components/chart/uses.js` — `cloneChartData = cloneDeepWith`(:277), `getNormalizedOptions = defaultsDeep({}, options, …)`(:312-313), `getNormalizedData = defaultsDeep(data, DEFAULT_DATA)`(:330, **첫 인자 mutate**), `setDataForUseZoom`(:642) 내 `cloneChartData`(:645)
- `src/components/chart/chartZoom.core.js` — `executeZoom`(:256~)에서 `this.evChartProps.data[idx]` 직접 참조(:268 부근)
- 회귀 안전망(이후 F step이 의존): `src/components/chart/Chart.tooltip.spec.js`, `src/components/chart/Chart.visual.spec.js`

## 작업

`phases/chart-data-pipeline/contract-audit.md` 문서를 작성한다. 아래 4개 산출물을 담는다.

### 1. mutation / alias / cache 목록 (메인 + zoom + group 경로 모두)

per-tick 데이터 경로를 추적하며 각 구간이 입력을 **변형(mutation)** 하는지, 입력과 **참조를 공유(alias)** 하는지, **cache에 의존**하는지 표로 정리한다.

- **메인 경로**: `props.data → getNormalizedData(:330) → cloneChartData(:250) → evChart.data → createDataSet/render/hitTest/tooltip`.
  - 특히 `getNormalizedData`의 `defaultsDeep(data, DEFAULT_DATA)`가 **첫 인자(원본 props.data = reactive proxy)를 mutate** 하는지 실제로 확인(lodash defaultsDeep는 target 변형). 원본 오염 시 무엇이 주입되는지(DEFAULT_DATA의 어떤 키) 기록.
- **zoom 경로(누락 금지)**: `Chart.vue:259 setDataForUseZoom(newData) → uses.js:645` 의 **추가 `cloneChartData`(per-tick clone 재발 지점)** → `EvChartZoom.executeZoom`이 `this.evChartProps.data[idx]`를 **직접 참조**해 필터링/대입하는 부분. zoom on/off에 따라 clone이 몇 번 일어나는지.
- **group 경로**: EvChartGroup의 watch / `evChartPropsInGroup` 경로에서 data가 어떻게 흐르는지.

### 2. cache invalidation matrix

`data` / `series schema` / `axis scale` / `layout` / `style·theme` / `interaction index(hit·tooltip)` 각 축이 **어떤 입력 변경에서 재계산돼야 하는지** 표로 정의한다. 이 matrix가 F3(dirty 플래그) 설계 범위를 확정한다.

### 3. in-place mutation 사용 패턴 조사

소비자가 데이터를 **in-place로 변경**(`data[i].data.push`, `labels.shift` 등)하는 패턴이 **docs 예제·기존 테스트**에 실재하는지 조사해 목록화한다(deep watch 계약이 실제로 무엇을 떠받치는지 근거). 단, 이건 F2(범위 밖) 판단 근거가 아니라 **F1/F3가 깨면 안 되는 계약**을 확인하기 위함이다.

### 4. F0~F4 후보 ↔ 계약 매핑

각 후보가 위 표의 어떤 구간/계약을 건드리는지, 그래서 어떤 회귀 테스트가 필요한지 매핑한다:
- **F0**(normalize 비-mutating·`toRaw`/raw 입력)
- **F1**(clone 축소·toRaw/구조 공유, feature flag) — **특히 zoom 경로의 clone·executeZoom 직접 참조에서 alias/stale 위험이 있는지** 명시
- **F3**(isEqual dirty 플래그 — in-place는 보수적 fallback)
- **F4**(normalize 캐시)
- **F1 저위험 여부 판정**: 1에서 "내부가 evChart.data 이후 입력 point 객체를 mutate/정렬/splice 하지 않는다"가 확인되면 F1 clone 축소가 저위험, 아니면 그 범위를 명시.

## Acceptance Criteria

```bash
# 코드 변경이 없어야 한다 (src/ diff 비어 있음)
git diff --stat -- src/
```

- 위 커맨드 출력이 비어 있어야 한다(이 step은 분석 문서만 생성).
- `phases/chart-data-pipeline/contract-audit.md`에 위 1~4 산출물이 모두 존재해야 한다.

## 검증 절차

1. `git diff --stat -- src/` 가 비어 있는지 확인(코드 무변경).
2. 일관성 체크리스트:
   - 메인 경로뿐 아니라 **zoom·group 경로**가 mutation/alias/cache 표에 포함됐는가?
   - `getNormalizedData`의 원본 mutate 여부를 **실제 코드로** 확인해 기록했는가?
   - cache invalidation matrix의 6개 축이 모두 채워졌는가?
   - F0~F4 각 후보가 어떤 계약을 건드리고 어떤 회귀 테스트가 필요한지 매핑됐는가?
   - F1 저위험 여부를 (가정이 아니라) 코드 근거로 판정했는가?
3. `phases/chart-data-pipeline/index.json`의 step 0을 업데이트:
   - 성공 → `"status": "completed"`, `"summary"`에 (a) 원본 mutate 확인 결과, (b) zoom clone 재발 여부, (c) in-place mutation 사용 패턴 유무, (d) F1 저위험 판정 결과를 한 줄로 적는다(다음 F0~F4 설계의 입력).
   - 실패(3회 수정 후) → `"status": "error"`, `"error_message"`.
   - 사용자 개입 필요 → `"status": "blocked"`, `"blocked_reason"`.

## 금지사항

- **`src/` 의 코드를 수정하지 마라.** 이유: 이 step은 계약을 **분석·문서화**만 한다. 실제 수정(F0~F4)은 이 감사 결과를 사람이 검토한 뒤 별도 step에서 한다.
- **측정 수치를 지어내지 마라.** self-time/성능 수치는 `playwright-probe.md`(기존 측정)를 인용만 하고, 새 수치가 필요하면 "사람이 DevTools로 측정 필요"로 남긴다.
- **F2(deep-watch 회피)를 설계·구현하지 마라.** 이유: 소비자 무수정 제약으로 범위 밖. 감사에서는 deep watch가 무엇을 떠받치는지 기록만 한다.
- 이 step과 무관한 파일을 수정하지 마라. 기존 테스트를 깨뜨리지 마라.
