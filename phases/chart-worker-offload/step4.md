# Step 4: rendercore-static-layer (Step 2.5-c)

## 읽어야 할 파일

- `/CLAUDE.md`, `/Users/ijiwon/.claude/CLAUDE.md` — 프로젝트/전역 규칙
- `phases/chart-worker-offload/plan.md` — phase 앵커
- `phases/chart-worker-offload/openai-review.md` — Step 3(axis 비-static·캐시 키) 지적
- `phases/chart-render-perf/plan.md` §2.5-c, §3 선결 분류 ②(범례 토글=동적 rescale)
- `phases/chart-render-perf/drawchart-inventory.md` — #9(drawAxis)
- `src/components/chart/chart.core.js` — `drawAxis`(`:627`, `:640-659`에서 `hitInfo`·`defaultSelectInfo` 전달)
- `src/components/chart/scale/scale.js` — `:375-438`(선택/hover 라벨 상태로 축 그리기), `:494-551`(plotLines/plotBands·select-label·showLabelTip)
- `src/components/chart/model/model.store.js` — **(경로 주의: `model/model.store.js`)** `:1400` 부근 show=false 시리즈 min/max 제외
- 이전 step 산출물: Step 3의 `drawSeriesLayer`(같은 RenderCore 경계 패턴)

## 배경

axis/grid/static label을 `drawStaticLayer`로 추출하고(2.5-c) 캐시 경계를 둔다. **단 리뷰 지적: `drawAxis`는 완전 static이 아니다** — `hitInfo`·`defaultSelectInfo`를 받고(`chart.core.js:640-659`), scale 그리기가 선택/hover 라벨 상태를 쓴다(`scale.js:375-438`). 캐시 키가 이 상태를 빠뜨리면 미세한 축 오염이 생긴다. 성능 중립(회귀 0)이 목표.

## 작업

1. `drawAxis`(`:627`)를 `drawStaticLayer`로 추출(canvas+model 의존, DOM 없음).
2. **캐시는 안전할 때만.** 캐시한다면 **무효화 키에 다음을 빠짐없이 포함**한다:
   - scale min/max(data append·full-replace·동적 rescale), **범례 토글(`series.show`)** — `model/model.store.js:1400`(show=false 시리즈 min/max 제외)
   - **축 상호작용 상태**: `hitInfo`, `defaultSelectInfo`, selectLabel/selectItem 옵션, showLabelTip(`scale.js:375-438`, `:494-551`)
   - **plotLines/plotBands**, data labels
   - zoom/brush/group sync, scrollbar, resize/chartRect, pixelRatio(DPR)/browser zoom, theme, locale, font, axis formatter, hidden series 상태
3. **권장 대안**: 위 키가 너무 넓어 위험하면, axis를 **순수 static(grid/base label)** 과 **main interaction label overlay(선택/hover 라벨)** 로 분리하고, static만 캐시한다. 또는 **캐시를 보류하고 분리만** 한다(분리=1차 목표, 캐시=부수적). 택한 방향을 summary에 명시.

## Acceptance Criteria

```bash
npm run lint
npm run test:run
npm run test:visual
```

추가: 캐시를 구현했다면 **무효화 회귀 테스트**(범례 토글·zoom·resize·DPR·**축 라벨 선택/hover**·plotLines/plotBands 발생 후 축이 올바르게 다시 그려짐). 범례 토글은 기존 `line-chart-legend-hidden` golden 활용.

## 검증 절차

1. 위 AC 전부 통과.
2. golden 회귀(허용 tolerance 내): 전 타입 + 범례 토글/zoom/resize/DPR2/축 라벨 선택 시 축 정확성 회귀 0.
3. 성능 중립. 독립 커밋.
4. 캐시 키/방향 결정이 기록됨. `index.json` step 4 업데이트.

## 금지사항

- 축 상호작용 상태(hitInfo/선택·hover 라벨/plotLines·plotBands)를 캐시 키에서 누락한 채 캐시를 켜지 마라. 이유: stale axis 오염이 조용히 퍼진다. 불확실하면 캐시 보류 또는 interaction overlay 분리.
- `model.store.js` 경로를 `model/model.store.js`로 정확히 쓰라(루트 아님).
- 렌더 로직 최적화·호출 순서 변경 금지(성능 중립). series 레이어(Step 3) 건드리지 마라.
- 기존 테스트를 깨뜨리지 마라.
