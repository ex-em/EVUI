# Step 9: worker-pool-integration (부록 A.0 pool / A.3 통합)

## 읽어야 할 파일

- `/CLAUDE.md`, `/Users/ijiwon/.claude/CLAUDE.md` — 프로젝트/전역 규칙
- `phases/chart-worker-offload/plan.md` — phase 앵커 (라이브러리 제약: 모듈 싱글톤 풀)
- `phases/chart-worker-offload/openai-review.md` — Step 8(pool size·epoch·geometry·D4) 지적
- `phases/chart-render-perf/plan.md` §5 부록 A.0(B 측정)·A.3(통합 합격선)·A.4, §1.4 라이브러리 제약
- 이전 step 산출물: Step 2(기하 main), Step 6(epoch), Step 7(레이어·worker-ready), Step 8(단일 worker micro PoC 통과)

## 배경

Step 8 micro 합격 전제에서 B-real(1000×10) **통합**으로 확장. EVUI는 전체 차트 수를 모르므로 worker 풀은 **모듈 싱글톤**(동시성 코어-1). **측정 게이트**(미달 → `blocked`).

## 작업

1. **모듈 싱글톤 worker 풀**: 모든 EvChart 인스턴스 공유. **size clamp(리뷰)**: `max(1, min(configuredCap, (navigator.hardwareConcurrency||2) - 1))` — 0/NaN/과대 방지, 보수적 cap(메모리 고려).
2. **coalescing(HOL blocking 대응)**: 차트별 **최신 요청만 유지**(구버전 epoch drop). 느린 차트가 빠른 차트를 막지 않게 라운드로빈/starvation 방지. in-flight frame 상한·queue 상한.
3. **epoch 정책을 testable하게 하나로 확정(리뷰)**: "직전 hit 유지" vs "무시" 중 **하나를 골라** 구현하고 update+hover 레이스 테스트로 고정. 모호하게 두지 말 것.
4. **기하 일관성**: 렌더는 worker의 epoch N bitmap, hover는 main epoch N+1일 수 있다. **기하는 main(Step 2)이 항상 최신으로 계산**하므로 hit-test 자체는 최신이지만, **표시된 bitmap과 hit 결과의 epoch 차(renderEpochLag)** 를 측정·정책 적용(stale bitmap 위에 최신 tooltip이 떠도 위치는 main 기하 기준으로 정확해야 함).
5. **destroy/deregistration 처리(리뷰: Step 10 아닌 여기서)**: chart destroy 시 풀에서 등록 해제, **destroy 후 도착한 worker response를 drop**(post-destroy commit 방지).
6. **통합 측정(interaction ON)**: B-real 1000×10에서 hover/tooltip latency p95/p99, freeze, main TBT. hit-test는 main 즉답.
7. **D4 정의(리뷰)**: 이 step에서 쓰는 render-time 지표 D4를 **명시 정의**하거나 Step 8 측정표의 구체 지표(endToEndRenderMs 등)로 대체.
8. **메모리**: 10차트×bitmap×stale 상한, `ImageBitmap.close()`, canvas max size 대응.

## Acceptance Criteria

```bash
npm run lint
npm run test:run
npm run test:visual
```

추가:
- 통합 측정표 기록(Step 8 지표 + queue depth·HOL 지연·per-chart renderEpochLag).
- **통합 합격선(A.3)**: hover/tooltip latency **p95 ≤ 100ms** **AND** freeze 없음(Long Task+입력 지연 로그) **AND** baseline 대비 main **TBT ≥ 50% 감소** **AND** Step 8/main-only 대비 정의된 D4를 악화시키지 않음.
- 풀 size가 인스턴스 수와 무관하게 clamp됨(테스트).
- epoch 정책·destroy drop 테스트(update+hover 레이스, destroy 중 response 도착) 통과.

## 검증 절차

1. AC + 측정표 기록.
2. 통합 합격선 판정: 통과→`completed`(p95·TBT·freeze 기록) / 미달→`blocked`(측정치 + A.4: Step 3 알고리즘·갱신 coalescing 재검토 / worker 폐기) / 애매→`blocked`(트레이드오프 정리).
3. epoch 일관성·destroy 안전: 갱신+hover 동시, destroy 중 response에서 tooltip/selection 어긋남·post-destroy commit 없음.
4. 전 타입 + group/brush golden 회귀 0.
5. `index.json` step 9 업데이트.

## 금지사항

- 인스턴스별 worker 풀 금지(코어 폭발). 모듈 싱글톤만.
- pool size를 clamp 없이 `hardwareConcurrency-1`로 쓰지 마라(0/NaN/과대).
- epoch 정책을 "유지 또는 무시"처럼 모호하게 두지 마라(하나 골라 테스트).
- coalescing 없이 큐에 다 쌓지 마라(HOL/메모리/stale).
- hit-test를 worker로 보내지 마라. 미달을 통과로 표시하지 마라.
- 기존 테스트를 깨뜨리지 마라.
