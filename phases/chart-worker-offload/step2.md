# Step 2: geometry-hittest-split (기하 계산 ↔ 래스터화 분리)

> ★ 이 step은 OpenAI 리뷰가 찾은 **핵심 블로커**를 푼다. Worker 전환의 토대다.

## 읽어야 할 파일

- `/CLAUDE.md`, `/Users/ijiwon/.claude/CLAUDE.md` — 프로젝트/전역 규칙
- `phases/chart-worker-offload/plan.md` — phase 앵커 (**불변 원칙 4: 기하/래스터 분리**)
- `phases/chart-worker-offload/openai-review.md` — Step 2/Step 5/Cross-cutting의 geometry 지적
- `src/components/chart/element/element.line.js` — `:176-177` `curr.xp/yp = ...`(그리는 루프에서 기하 mutate), `:274-307` 사용
- `src/components/chart/element/element.bar.js` — `:270-271` `item.xp/yp = ...`, `:411`·`:669` `{xp,yp,w,h}` 사용
- `src/components/chart/element/` — scatter/heatMap/pie 등 나머지 element도 동일 패턴 확인
- `src/components/chart/plugins/plugins.interaction.js` — `:1015-1016`(`item.data.xp/yp`로 hover 거리), `:1163-1167`·`:1201-1203`(`xp/yp/w/h`로 위치), `:1609-1613`(tooltip 위치) — **기하 소비처**
- `src/components/chart/Chart.tooltip.spec.js` — 기존 hit-test 값 정확성 회귀 테스트(이걸 깨면 안 됨)

## 배경 (왜 블로커인가)

시리즈 렌더러는 **그리는 루프 안에서** 데이터 포인트에 픽셀 기하 `xp/yp/w/h`를 **mutate**한다(`element.line.js:176`, `element.bar.js:270`). 메인 hit-test는 그 `item.data.xp/yp/w/h`를 읽어 hover 거리·tooltip 위치를 계산한다(`plugins.interaction.js:1015~`).

→ 래스터화(stroke/fill)를 worker로 옮기면 worker는 **자기 데이터 복사본에** xp/yp를 쓰므로 **메인 모델 기하가 비고 hit-test가 깨진다.** 측정상 비싼 76%는 래스터화이지 xp/yp **투영 계산(싸다)** 이 아니다. 따라서 **기하 계산은 main에 남기고 래스터화만 worker로** 보내려면, 먼저 이 둘을 **한 패스에서 분리**해야 한다.

## 작업

1. 각 element 렌더러(line/bar/scatter/heatMap/pie 등)에서 **기하 계산 패스**와 **래스터 패스**를 분리한다:
   - **기하 패스(`computeGeometry`류)**: 데이터/스케일/chartRect로 각 포인트의 `xp/yp/w/h`를 계산해 **현재처럼 main 모델(`item.data`)에 저장**한다. canvas 그리기 없음. hit-test는 이 결과를 그대로 소비(기존 동작 유지).
   - **래스터 패스(`rasterize`류)**: 위에서 계산된 기하를 **입력으로 받아** ctx에 stroke/fill만 한다. 자체적으로 데이터 포인트를 mutate하지 않는다.
2. **현 단계에서는 둘 다 main에서 순차 호출**(worker 아직 없음) → 동작/출력/hit-test 전부 불변(성능 중립). 분리만 해 둔다. 이후 Step 3에서 래스터 패스를 RenderCore로, Step 8에서 worker로 옮긴다.
3. 기하 결과를 **RenderGeometry 형태**(포인트별 xp/yp/w/h 배열 또는 기존 `item.data` 구조)로 명확히 한다 — Step 6 snapshot 계약에서 이 형태를 worker→main 반환(또는 main 계산)으로 재사용한다.
   - **주의(pie/doughnut)**: pie 계열은 기하가 **각도 기반**(`element.pie.js`의 `startAngle/endAngle/centerX/centerY`)이라 xp/yp/w/h가 아니다. 분리(각도 계산=main / 래스터)는 동일하게 적용되나, RenderGeometry는 **타입별 기하 형태**(line/bar=xp/yp/w/h, pie=각도)를 갖도록 한다. pie를 xp/yp/w/h로 강제하지 마라.
4. 시그니처 수준만 제시(내부 재량). 예: `computeSeriesGeometry(input) -> geometry`(main 저장), `rasterizeSeries(ctx, geometry, style)`. **기하의 의미·반올림·null 처리는 기존과 동일**해야 hit-test/golden이 안 깨진다.

> 데이터량이 큰 차트 타입 전부(line/bar/scatter/heatMap/pie/combo)에 적용. stacked/combo의 누적 좌표도 기하 패스에 포함.

## Acceptance Criteria

```bash
npm run lint
npm run test:run
npm run test:visual
```

추가(`test:run` 포함):
- **hit-test 기하 일관성 테스트**: 분리 후에도 `item.data.xp/yp/w/h`가 분리 전과 동일하게 채워짐을 단언(기존 `Chart.tooltip.spec.js` 확장 — findClosestDataIndex/findHitItem 결과 불변).
- **update→hover 일관성**: 데이터 갱신 후 hover 시 기하가 최신으로 갱신돼 tooltip 위치가 맞는지.

## 검증 절차

1. 위 AC 전부 통과(특히 `Chart.tooltip.spec.js` 회귀 0).
2. golden 회귀(허용 tolerance 내): 전 타입 — 래스터 결과가 분리 전과 시각적으로 동일.
3. 성능 중립: 기하+래스터 2패스가 됐어도 main 단독 실행 시 redraw self-time 회귀 없음(같은 계산을 순서만 나눔).
4. `index.json` step 2 업데이트.

## 금지사항

- 래스터 패스가 데이터 포인트(`item.data.xp/yp/w/h`)를 mutate하게 두지 마라. 이유: worker로 옮기면 main 모델이 비어 hit-test가 깨진다. mutate는 기하 패스(main)만.
- 기하 계산의 의미(좌표·반올림·null/숨김 처리)를 바꾸지 마라. 이유: hit-test/tooltip/golden이 그 값에 의존한다.
- 아직 worker를 도입하지 마라. 이 step은 main 2패스 분리까지.
- 렌더 로직을 "개선"하지 마라(성능 중립). 기존 테스트를 깨뜨리지 마라.
