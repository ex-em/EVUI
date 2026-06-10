# Step 10: worker-fallback-hardening (부록 A.7 배포/호환 경화)

## 읽어야 할 파일

- `/CLAUDE.md`, `/Users/ijiwon/.claude/CLAUDE.md` — 프로젝트/전역 규칙
- `phases/chart-worker-offload/plan.md` — phase 앵커 (불변 원칙 2·7)
- `phases/chart-worker-offload/openai-review.md` — Step 9(번들 viability·import vs instantiation·fixture) 지적
- `phases/chart-render-perf/plan.md` §5 부록 A.7
- 이전 step 산출물: Step 7(worker-ready·kill switch·조기 worker-URL smoke), Step 8~9(worker 통합)
- `src/components/chart/chart.core.js` — `:53-68` 생성자 런타임 DOM/window 사용(import이 아니라 instantiation 시점)
- `package.json` — `exports`(`import`: ESM, `require`: `./dist/index.umd.cjs`), `vite.config.lib.js`

## 배경

Step 7에서 조기 worker-URL smoke·기본 fallback은 만들었다. 이 step은 **소비자 배포 환경 매트릭스로 경화**한다. fallback은 "worker 도입 전 동작 복귀"가 아니라 **worker path만 빠지고 main RenderCore(Step 2~5)가 그대로 성능 경로**.

**리뷰 핵심**: ① 번들 viability는 `build:lib` 성공만으론 부족 — ESM import / UMD script / CJS require / 방출된 worker asset URL 해석을 실제로 봐야 한다. ② SSR 안전성은 **import 시점 vs instantiation 시점**을 구분해야 한다(`chart.core.js:53-68` 생성자가 DOM/window 사용 — import은 안전해도 instantiate는 아님). ③ CSP/CDN/base-path는 build 산출물 검사만으론 URL 해석 실패를 놓친다 → 실제 fixture/수동 결과 필요.

## 작업

아래 환경에서 worker 미지원/실패 시 main RenderCore fallback이 정상임을 **fixture로** 확인·경화한다:

1. **번들러 fixture**: (a) Vite 앱에서 라이브러리 ESM import, (b) 브라우저에서 UMD `<script>` 로드, (c) Node `require`(CJS). 각각에서 worker-URL이 해석되거나, 안 되면 feature-detect fallback. `import.meta.url`이 UMD/CJS에서 깨지면 fallback.
2. **SSR(import vs instantiation)**: Node/Nuxt/Vite SSR에서 **import만으로 throw 안 함**(Step 1 연장). instantiation은 DOM 필요(`chart.core.js:53-68`)이므로 SSR에선 인스턴스화하지 않거나 가드. 테스트가 import-safe와 instantiate-needs-DOM을 구분.
3. **CSP**: `worker-src`/`script-src` 제한 시 worker 생성 throw → catch 후 main fallback.
4. **Safari / iOS Safari**: OffscreenCanvas 2D worker 미지원 시 feature-detect로 main(자동화 불가 시 수동 결과 기록).
5. **CDN / asset base path / monorepo symlink**: worker URL 해석 실패 → fallback. asset base 경로 검사.
6. **lifecycle**: hidden tab 복귀, rapid resize, DPR 변경, container detach/reattach 안전(epoch/stale drop + 정리). (destroy 중 response는 Step 9.)

각 경우 worker가 안 떠도 차트가 main RenderCore로 정상 렌더 + 회귀 0.

## Acceptance Criteria

```bash
npm run lint
npm run test:run
npm run test:visual
npm run build:lib
```

추가(`test:run` 포함):
- **fallback 통합 테스트(fixture)**: Vite import / 모킹된 Worker 생성 throw / SSR(Worker·document undefined) import-only 각각에서 main RenderCore로 정상 렌더 단언. import-safe vs instantiate-needs-DOM 구분 테스트.
- `build:lib` 산출물의 worker 청크/URL·asset base 경로 검사(build 성공만이 아니라 URL 해석 가능성).
- lifecycle(rapid resize·DPR 변경·detach/reattach) 안전성 테스트.

## 검증 절차

1. 위 AC 전부 통과.
2. 환경 매트릭스 각각 fallback 확인(자동화는 테스트, 수동 필요분은 절차+결과 문서화).
3. 전 타입 golden 회귀 0(worker on/off 양쪽).
4. fallback 매트릭스 결과 표를 `phases/chart-worker-offload/`에 기록.
5. `index.json` step 10 업데이트. 실기기(Safari/iOS) 수동 확인 잔여 시 `blocked`로 사용자 요청.

## 금지사항

- fallback을 "worker 도입 전 동작 복귀"로 구현하지 마라. 이유: 미지원 환경이 성능 경로(main RenderCore)를 잃는다. worker path만 빠짐.
- `build:lib` 성공만으로 번들 호환을 결론짓지 마라. 이유: import/require/UMD 로드·worker URL 해석은 별개.
- import-safe와 instantiate-safe를 혼동하지 마라. 이유: import은 안전해도 생성자는 DOM 필요.
- 소비자에게 COOP/COEP·CSP 변경을 요구하지 마라. worker 실패를 조용히 삼키지 마라(관측성 로깅 + main fallback).
- 기존 테스트를 깨뜨리지 마라.
