# 측정 결과 기록 (사용자 수동 작성)

> 이 파일은 **execute.py가 자동 채우지 않는다.** Step 0a(DevTools Performance 수동 측정)·Step 0a Review·Step 3 게이트는 사람이 브라우저에서 측정·판정해야 하므로, 그 결과를 여기에 직접 기록한다. 다음 phase-plan(Step 2b/2c/2d·2.5-b~d·Worker 추가)은 이 파일을 입력으로 사용한다.
>
> 작성 시점:
> - **Step 0a baseline** — phase의 step0(repro)·step1(harness)이 끝난 뒤, repro 예제를 띄워 DevTools Performance로 측정.
> - **Step 3 게이트** — step3(hit test)·step4(path/skip)·step6(commit 분리)이 끝난 뒤, 메인-only 수단으로 1차 합격선 + D4를 충족하는지 측정.

---

## Step 0a — baseline + 선결 분류

### 측정 표 (plan §4 Step 0a 산출물 템플릿)

| profile | seriesCount | pointCount | updateType | redrawMs | createDataSetMs | hitTestMs | LongTask/TBT | Q1 판단 | Q2 판단 | Q3/B-real 판단 | D4 후보 |
|---|---:|---:|---|---:|---:|---:|---:|---|---|---|---|
| A-single |  |  | append/fixed or full/rescale |  |  |  |  | strokes/points/mixed | T2 유효/무효 | 해당 없음 | baseline 대비 −% |
| B-real |  |  | append/fixed or full/rescale |  |  |  |  | strokes/points/mixed | T2 유효/무효 | 재현 가능 규모/불가 사유 | baseline 대비 −% |
| B-synth(선택) |  |  | append/fixed or full/rescale |  |  |  |  | strokes/points/mixed | T2 유효/무효 | stress 참고용 | baseline 대비 −% |

### 핵심 결정 (Step 0a Review에서 확정)

- **Q1 (병목: strokes vs points)**:
  - 판단:
- **Q2 (갱신 성격: append+안정 vs full-replace/rescale)**:
  - 판단:
- **Q3 (B-real 재현 규모 / scheduler window 내 heavy job pile-up 여부)**:
  - 판단:
- **D4 (render-time 2차 목표치, baseline 대비 −%)**:
  - 확정값:

### Step 0a Review 결론 (Go / No-Go)

- [ ] Q1/Q2/Q3/D4 문서화 완료
- Go / No-Go:
- 계획 재정렬 필요 여부 및 내용:

---

## Step 3 — Worker 필요성 게이트

> 측정: 같은 repro에서 warm-up 5 tick 후 최소 30 tick. freeze 여부는 Long Task 구간 + 입력 지연 로그를 함께 본다.
> 게이트 기준: "갱신 틱과 겹친 hover/click interaction latency p95 ≤ 100ms + freeze 없음" **AND** "D4 render-time 목표 유지".

| profile | latency p95 (ms) | freeze 여부 | D4 충족 | 게이트 판정 |
|---|---:|---|---|---|
| A-single |  |  |  | 통과/실패 |
| B-real |  |  |  | 통과/실패 |

### 게이트 결과별 다음 단계 (다음 phase-plan 입력)

- **A 통과 + B 통과** → Worker 트랙 종료. 남은 조건부 작업 없으면 전체 완료.
- **A 통과 + B 실패** → B만 Worker PoC(부록 A) phase-plan.
- **D4만 실패** → 원인별 라우팅으로 Step 2b/2c/2d 또는 Step 2.5 재검토 phase-plan.
  - createDataSet 지배 → Step 2c
  - drawSeries 지배 → Step 2d
  - commit/drawImage 지배 → Step 2.5-a 또는 Worker ImageBitmap
  - hit test 여전히 지배 → Step 1 재검토
- **latency만 실패** → time-slicing(yield) phase-plan, 그래도 미달이면 Worker.

판정/결정:
