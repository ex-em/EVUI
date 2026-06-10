# Step 8: worker-micro-poc (부록 A.0/A.2/A.3 micro)

## 읽어야 할 파일

- `/CLAUDE.md`, `/Users/ijiwon/.claude/CLAUDE.md` — 프로젝트/전역 규칙
- `phases/chart-worker-offload/plan.md` — phase 앵커 (불변 원칙 7: B2)
- `phases/chart-worker-offload/openai-review.md` — Step 7(scope 모순·class reuse·compositing·fallback) 지적
- `phases/chart-render-perf/plan.md` §5 부록 A.0·A.2(측정표)·A.3(합격선)·A.4(전환)·A.5(리스크)
- `phases/chart-render-perf/playwright-probe.md` — 측정 방법론(CDP Profiler/throttle)
- `src/components/chart/chart.core.js` — `commitToDisplay`(`:348-363`, 현재 axis+series 한 버퍼)
- 이전 step 산출물: Step 3(series raster), Step 6(RenderInput/RenderGeometry/pack), Step 7(레이어 경계·kill switch·worker-ready)

## 배경

처음으로 실제 worker를 띄운다. **B2**: worker가 자체 OffscreenCanvas에서 series **래스터**(RenderCore raster, Step 3 재사용)를 그림 → `transferToImageBitmap()` → main `drawImage(bitmap)`. 기하는 main(Step 2). **측정 게이트**라 미달 시 `blocked`(A.4).

## 작업

1. **scope를 하나로 못박는다(리뷰: 모순 제거)**. 둘 중 택1을 명시:
   - (권장) **true micro**: 차트 1개, interaction 비활성. pack/transfer/workerDraw/bitmap/commit/TBT만 격리 측정(p95/p99·interaction은 Step 9 통합에서).
   - 또는 **mini B-real smoke**: 10차트, interaction 포함, 통합 지표 일부. (이 경우 Step 9와 중복 줄이게 범위 명시.)
2. **worker bootstrap test(리뷰 필수)**: 대표 타입(line/bar/heatmap)을 **RenderInput(plain snapshot)만으로** worker에서 그릴 수 있음을 증명 — **class instance/함수 clone 없이**. Step 3 raster + Step 6 스냅샷이 worker에서 재구성되는지.
3. **compositing order 명시**: 현재 `commitToDisplay`는 axis+series가 한 버퍼(`:348-363`). B2에서 series만 bitmap이면 **clear → static(axis/grid) → series bitmap → tip → display** 순서를 정의. static을 main 버퍼에 둘지 별 레이어로 둘지 명시.
4. **A.2 측정표 + 리뷰 추가 지표**: seriesCount/pointCount/packMs/transferMs/workerDrawMs/bitmapMs/mainCommitMs/mainTBT/endToEndRenderMs + **jsHeap·bitmapCount(in-flight)·droppedFrameCount·renderEpochLag**.
5. **main long-task 실제 제거 확인(리뷰 리스크#1)**: workerDrawMs만 보지 말고 **main flame chart에서 long task가 실제 사라졌는지**. drawImage(bitmap) 업로드/합성이 main에 큰 비용으로 남으면 이득 상쇄.
6. **메모리**: commit 후 `ImageBitmap.close()`, in-flight 상한, epoch stale drop.
7. **fallback 검증(앞당김)**: worker init 실패/unsupported/render exception 시 main RenderCore 전환(Step 7 상태기계 사용). B2라 디스플레이 캔버스 transfer 없음 → main fallback 항상 가능.

> PoC는 kill switch 뒤/dev 경로(Step 7). 합격 후 Step 9에서 풀/통합.

## Acceptance Criteria

```bash
npm run lint
npm run test:run
npm run test:visual
```

추가:
- 측정표(A.2 + 추가 지표)가 `phases/chart-worker-offload/`에 기록됨.
- worker bootstrap test(line/bar/heatmap이 RenderInput만으로 worker draw) 통과.
- **micro 합격선(A.3)**: 전송 latency(`packMs+transferMs`) ≤ render 주기 20~30% **AND** main Long Task/TBT가 main-only 대비 감소 **AND** main flame chart long task 실제 감소.
- kill switch off / unsupported 시 main 경로 golden 회귀 0.

## 검증 절차

1. AC + 측정표 기록.
2. micro 합격선 판정:
   - **통과** → `completed`, summary에 전송 latency 비율·TBT 감소·long task 제거 여부.
   - **미달** → `blocked`, `blocked_reason`에 측정치 + A.4 전환(렌더 worker 폐기 / 계산만 worker 재분류 / Step 3 알고리즘 재검토).
   - **애매**(예: main TBT 30%↓지만 e2e 10%↑) → `blocked`, 트레이드오프 정리해 사용자 판단 요청.
3. worker 미진입 fallback 회귀 0.

## 금지사항

- worker에서 series 렌더를 새로 구현하지 마라. RenderCore raster(Step 3)를 재사용(이중 구현 금지).
- worker 입력에 class instance/함수를 clone하려 하지 마라(Step 6 plain snapshot만).
- hit-test/기하를 worker 왕복으로 처리하지 마라(main).
- 미달을 통과로 표시하고 Step 9로 넘기지 마라.
- 기존 테스트를 깨뜨리지 마라.
