# 측정 결과 기록 (사용자 수동 작성)

> 이 파일은 **execute.py가 자동 채우지 않는다.** Step 0a(DevTools Performance 수동 측정)·Step 0a Review·Step 3 게이트는 사람이 브라우저에서 측정·판정해야 하므로, 그 결과를 여기에 직접 기록한다.
>
> **★ 다음 실행 단계 (2026-06-09 측정 기반 재정렬 — plan §1 참조)**: 완료된 step0~6(repro·harness·회귀망·hit test·draw skip·commit 분리) 다음은 **Step 1.5(데이터 파이프라인 비용 제거)** 다. 순서: **Step 1.5-0 계약 감사 → F0(normalize 비-mutating) → F1(clone 축소) → F3 → F4 → 재측정(D4a)**. self-time 지배항이 render가 아니라 데이터 파이프라인(~80%)이므로 **Step 3 게이트는 Step 1.5 재측정 이후에 판정**한다(step3/4/6 직후가 아님 — Step 1.5를 건너뛰지 말 것).
>
> 작성 시점:
> - **Step 0a baseline** — phase의 step0(repro)·step1(harness)이 끝난 뒤, repro 예제를 띄워 DevTools Performance로 측정. **Q0(파이프라인 vs draw 지배)·D4a/D4b**를 함께 기록.
> - **Step 1.5 재측정** — Step 1.5(F0~F4) 적용 후 self-time을 재분해해 D4a 감소·잔여 지배항을 기록(아래 Step 3 게이트의 입력).
> - **Step 3 게이트** — **Step 1.5 재측정 후**, 라우팅에서 latency/freeze만 미달일 때 메인-only 수단으로 1차 합격선 + D4a/D4b 해당 지표를 충족하는지 측정.

---

## Step 0a — baseline + 선결 분류

### 측정 표 (plan §4 Step 0a 산출물 템플릿)

| profile | seriesCount | pointCount | updateType | updateE2EMs(D4a) | dataPipeline%(clone/dw/isEq) | redrawMs(D4b) | createDataSetMs | hitTestMs | LongTask/TBT | Q0 판단 | Q1 판단 | Q2 판단 | Q3 판단 |
|---|---:|---:|---|---:|---:|---:|---:|---:|---:|---|---|---|---|
| A-single |  |  | append/fixed or full/rescale |  |  |  |  |  |  | pipeline/draw 지배 | strokes/points/mixed | T2 유효/무효 | 해당 없음 |
| B-real |  |  | append/fixed or full/rescale |  |  |  |  |  |  | pipeline/draw 지배 | strokes/points/mixed | T2 유효/무효 | 재현 가능 규모/불가 사유 |
| B-synth(선택) |  |  | append/fixed or full/rescale |  |  |  |  |  |  | pipeline/draw 지배 | strokes/points/mixed | T2 유효/무효 | stress 참고용 |

> `updateE2EMs`=per-tick mutate→flush(watcher 비용 포함, D4a). `dataPipeline%`=self-time 중 clone+deep-watch+isEqual 합(Q0 근거, call-tree 귀속은 `playwright-probe.md` 참고). `redrawMs`=canvas redraw self-time(D4b).

### 핵심 결정 (Step 0a Review에서 확정)

- **Q0 (최우선: per-tick 지배항이 데이터 파이프라인 vs draw)**:
  - 판단:
- **Q1 (Step 1.5 후 잔여 draw 지배 시에만 — strokes vs points)**:
  - 판단:
- **Q2 (갱신 성격: append+안정 vs full-replace/rescale)**:
  - 판단:
- **Q3 (B-real 재현 규모 / scheduler window 내 heavy job pile-up 여부)**:
  - 판단:
- **D4a (per-tick update end-to-end 목표치 — Step 1.5, baseline 대비 −%)**:
  - 확정값:
- **D4b (canvas redraw self-time 목표치 — Step 2, baseline 대비 −%)**:
  - 확정값:

### Step 0a Review 결론 (Go / No-Go)

- [ ] Q0/Q2/Q3/D4a/D4b 문서화 완료
- [ ] Q1은 Step 1.5 후 잔여 draw 지배 시에만 판단
- Go / No-Go:
- 계획 재정렬 필요 여부 및 내용:

---

## Step 3 — Worker 필요성 게이트 (Step 1.5 재측정 후에 판정)

> 측정: 같은 repro에서 warm-up 5 tick 후 최소 30 tick. freeze 여부는 Long Task 구간 + 입력 지연 로그를 함께 본다.
> 게이트 기준(두 축): "갱신 틱과 겹친 hover/click interaction latency p95 ≤ 100ms + freeze 없음"(1차) **AND** "D4a(per-tick update e2e)/D4b(redraw self-time) 중 해당 지표 유지"(2차).

| profile | latency p95 (ms) | freeze 여부 | D4a 충족 | D4b 충족 | 게이트 판정 |
|---|---:|---|---|---|---|
| A-single |  |  |  |  | 통과/실패 |
| B-real |  |  |  |  | 통과/실패 |

### 게이트 결과별 다음 단계 — decision tree (plan.md Step 3과 동일 구조)

**(1) 먼저 D4(a/b) 미달이 있으면 → Worker로 가지 않고 원인별 라우팅:**
- 데이터 파이프라인(clone/deep-watch/isEqual) 지배 → **Step 1.5 재검토**(F0·F1·F3·F4; pure traverse 지배면 F2 별도 논의)
- createDataSet 지배 → Step 2c
- drawSeries 지배 → Step 2a/2d
- commit/drawImage 지배 → Step 2.5-a 또는 **Worker + OffscreenCanvas(ImageBitmap)**
- hit test 여전히 지배 → Step 1 재검토(①binary search·④avgInterval)

**(2) D4(a/b)를 충족한 전제에서만, 1차(latency/freeze) 축으로 Worker 판정:**
- **A 1차 통과 + B 1차 통과** → Worker 트랙 종료. 남은 조건부 작업 없으면 전체 완료.
- **A 1차 통과 + B 1차 실패** → B만 Worker 풀+coalescing PoC(부록 A) phase-plan.
- **A 1차 실패 + B 1차 통과** → A만 제한적 Worker PoC(단일 차트 오버헤드 caveat).
- **A 1차 실패 + B 1차 실패** → B(풀+coalescing) + A(제한적) 모두 Worker PoC.
- 단 **1차 실패라도 time-slicing(yield) 먼저** 적용해 충족되면 Worker 불필요.

판정/결정:
