# Step 7: layer-arch-and-killswitch (레이어 경계 + kill switch + worker-ready)

## 읽어야 할 파일

- `/CLAUDE.md`, `/Users/ijiwon/.claude/CLAUDE.md` — 프로젝트/전역 규칙
- `phases/chart-worker-offload/plan.md` — phase 앵커 (불변 원칙 7: B2는 디스플레이 캔버스 transfer 안 함)
- `phases/chart-worker-offload/openai-review.md` — Step 6(transfer 혼동·async init·flag 모호) + Cross-cutting(번들러 조기 검증) 지적
- `phases/chart-render-perf/plan.md` §5 부록 A.0(B2)·A.7
- 이전 step 산출물: Step 3~5(RenderCore 레이어), Step 6(RenderInput/RenderGeometry/epoch)
- `src/components/chart/chart.core.js` — `:53-68` 생성자 DOM/canvas, `:61-66` buffer/display
- `package.json` — `exports`(ESM `import` / UMD `require: ./dist/index.umd.cjs`)

## 배경

worker PoC(Step 8) 전에 레이어 소유권·kill switch·worker 생명주기를 확정한다. **리뷰가 바로잡은 것**:
- **transfer 혼동**: B2는 worker가 **자체 `OffscreenCanvas`를 생성**해 렌더 → `transferToImageBitmap()` → main `drawImage`. **디스플레이 캔버스를 `transferControlToOffscreen`으로 넘기지 않는다**(그건 제외한 A 방식). 따라서 "transfer 전 fallback 게이트"가 아니라 **async worker-ready 핸드셰이크**가 맞다.
- **worker init은 비동기** → `initializing→ready→failed` 상태기계 필요. ready 전엔 main 경로.
- **번들러/SSR feasibility를 Step 10까지 미루면 늦다** → worker-URL smoke를 여기서 조기 확인.

이 step은 설계·스캐폴딩(실제 worker 렌더 연결은 Step 8).

## 작업

1. **레이어 경계 표 확정**:
   - worker: series **래스터**(primary). static(axis/grid) 래스터는 optional(이득 측정 후).
   - main: DOM size/DPR, 이벤트, **기하 계산(Step 2)·hit-test**, tooltip/crosshair/selection overlay, legend, scrollbar DOM.
   - main commit: worker가 보낸 **최신 bitmap만** 표시(epoch 기반 stale drop).
   - 레이어별 **invalidation source 표**(Step 4 캐시 표 확장).
2. **내부 kill switch**: 공개 API 불변. worker 경로 on/off 내부 플래그(env/dev flag + feature-detect). 기본은 보수적. 단 **Step 8/9 측정을 위한 deterministic 내부 enable 경로**를 명시(측정 시 확실히 켜지도록 — "off or feature-detect"의 모호함 제거).
3. **async worker-ready 상태기계**: `initializing→ready→failed`. ready 전·failed면 main RenderCore. worker init/handshake **timeout** 포함.
4. **B2 캔버스 소유권 명시**: 디스플레이 캔버스는 main 소유로 유지(transferControlToOffscreen 미사용). worker는 자체 OffscreenCanvas. 따라서 worker 실패 후 main fallback이 항상 가능.
5. **관측성 훅**: worker init 실패/render exception/timeout 로깅 + main fallback 전환 hook 자리.
6. **조기 worker-URL smoke**(리뷰: 앞당김): `new Worker(new URL('...', import.meta.url), {type:'module'})`가 **ESM import / UMD(`require`) / SSR(Worker·OffscreenCanvas undefined)** 에서 어떻게 동작/실패하는지 최소 확인. 깨지면 feature-detect로 main fallback. (전체 매트릭스 경화는 Step 10.)

> 실제 worker 렌더는 연결하지 않는다(no-op 또는 main 경로). worker 미진입 상태에서 기존 동작 100% 유지가 검증 기준.

## Acceptance Criteria

```bash
npm run lint
npm run test:run
npm run test:visual
npm run build:lib
```

추가(`test:run` 포함):
- **fallback 결정 테스트**: feature-detect off / kill switch off / 직렬화 불가 / SSR(Worker undefined) 각각에서 main 경로 선택.
- **worker-ready 상태기계 테스트**: initializing 동안 main 렌더, failed 시 main fallback.
- kill switch off(기본) 상태에서 기존 렌더 golden 회귀 0.
- `build:lib`가 worker-URL 스캐폴딩으로 깨지지 않음.

## 검증 절차

1. 위 AC 전부 통과.
2. 레이어 경계 표 + invalidation 표 + kill switch(+deterministic enable) + worker-ready 상태기계 + 조기 worker-URL smoke 결과가 문서/코드로 명확.
3. worker 미진입 상태 golden 회귀 0(전 타입).
4. `index.json` step 7 업데이트.

## 금지사항

- `transferControlToOffscreen`으로 디스플레이 캔버스를 넘기는 설계를 도입하지 마라. 이유: B2는 worker 자체 OffscreenCanvas 사용. 디스플레이 transfer는 일방향이라 fallback 불가가 된다.
- interaction 레이어(hit-test/tooltip/crosshair/selection overlay)·기하 계산을 worker 대상에 넣지 마라.
- worker init을 동기로 가정하지 마라(ready 핸드셰이크 필수).
- 공개 API에 worker 플래그를 노출하지 마라(소비자 무수정).
- 이 step에서 실제 worker 렌더를 연결하지 마라(Step 8). 기존 테스트를 깨뜨리지 마라.
