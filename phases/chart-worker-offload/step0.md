# Step 0: gpu-render-confirm (게이트, 코드 변경 0)

## 읽어야 할 파일

먼저 아래를 읽고 전체 그림과 측정 근거를 파악하라:

- `/CLAUDE.md`, `/Users/ijiwon/.claude/CLAUDE.md` — 프로젝트/전역 규칙
- `phases/chart-worker-offload/plan.md` — 이 phase 앵커 (가장 먼저)
- `phases/chart-render-perf/playwright-probe.md` — 특히 "★★★★ B-real 실규모 재측정" 섹션(headless 측정치·방법론·SwiftShader caveat)
- `docs/views/comboChart/example/PerfStressDashboard.vue` — B-real repro (상수 CHART_COUNT/SERIES_PER_CHART/POINTS_PER_SERIES)
- `docs/views/perfHarness.js` — 측정 harness(measureTick/drawChart 지표)

## 배경

headless Chromium은 GPU 합성이 아닌 소프트웨어 래스터(SwiftShader)일 수 있어, 2026-06-10 측정의 `drawImage` 65% 비중이 실기기보다 **부풀려졌을 가능성**이 있다. 이 phase 전체(고위험 worker 리팩토링)의 전제가 "프로파일 B는 render-bound"이므로, 착수 전 **GPU 환경에서 render 비중이 여전히 지배적인지** 한 번 확인하는 게이트다.

**측정 타깃 = 개발 PC가 아니라 고객사(저사양)에 가깝게.** 강한 개발 PC에서 재면 문제를 과소평가한다. 가능하면 고객사와 유사한 저사양 기기에서 측정하고, 어려우면 개발 PC에서 **CPU throttle(예: 6×) + (가능하면) 약한 GPU 조건**으로 근사한다. **코어 수(`navigator.hardwareConcurrency`)를 반드시 기록**한다 — worker 풀 병렬 이득(`코어-1`)의 상한이고, 저코어면 병렬 가속보다 **freeze 제거(off-main)** 가 주 이득이기 때문이다.

**판정 관점(저사양 반영)**: ① render(특히 래스터/drawImage) 비중이 지배적인가(worker 방향 유효성) ② 반응성이 비지배인가(A의 "worker 무효" 결론이 B엔 적용 안 됨 확인) ③ 코어 수 — 병렬 이득 기대치 vs freeze 제거 이득. 저사양에서 render 절대 비용이 더 크고 코어가 적다면, **freeze 제거 가치가 크므로 worker(특히 off-main)는 여전히 정당**하다.

## 작업

이 step은 **측정·판정만** 하고 src/ 코드는 바꾸지 않는다.

1. **GPU(headed) 재측정 — 개발 PC + throttle 근사로 확정**(사용자 결정: 별도 저사양 기기 없음, 고객사 사양 편차 큼 → 저사양 근사):
   - Playwright를 **`headless:false`(실제 GPU 가속)** 로 띄워 프로파일 B repro(1000×10×60)를 **CPU 6× throttle** 로 측정하고 CDP Profiler call-tree 귀속을 재수행(`playwright-probe.md` 방법론 재사용, probe 스크립트 일회용 — 측정 후 원복).
   - **headed(실 GPU)로 도는 게 핵심**: headless SwiftShader(소프트웨어 래스터) 아티팩트를 배제하는 게 이 게이트의 목적이다. 실 GPU에서도 render(drawImage/series raster)가 지배적이면 전제 확인.
   - **약한 고객사 GPU는 측정 불가**지만, 약한 GPU에서는 래스터 절대 비용이 **더 커질** 뿐이라 render-bound 결론을 약화시키지 않는다(방향만 확인하면 됨). 절대 비중 정밀도는 포기하고 "render가 여전히 지배적인가"만 본다.
   - `navigator.hardwareConcurrency` 기록(개발 PC 값). 단 **고객사는 2~4코어 가능성이 크므로 worker 풀은 저코어 기준 보수 설계**(Step 9 clamp). 저코어면 병렬 가속보다 **freeze 제거(off-main)** 가 주 이득임을 summary에 명시.
2. **판정**:
   - render 카테고리(특히 drawImage/series draw)가 여전히 **명확한 지배항(예: ≥ 50%)** 이고 반응성이 비지배(< 30%)면 → **통과**. 결과를 `playwright-probe.md`에 GPU 비교 행으로 추가.
   - render 비중이 GPU에서 크게 줄어 반응성과 비슷하거나 역전되면 → 이 phase 전제가 흔들리므로 **blocked** 처리하고, F2(deep watch) 등 대안 재논의가 필요함을 명시.
3. **측정 기록(필수)**: prose가 아니라 **표 한 행**으로 남긴다 — 날짜, profile(1000×10), browser(headed Chromium 버전), **GPU status**(`chrome://gpu` 또는 CDP `SystemInfo.getInfo`의 가속 여부 — SwiftShader인지 하드웨어 GPU인지), render %, reactivity %, drawImage %, 프로파일 아티팩트 경로.

## Acceptance Criteria

```bash
# 코드 변경이 없으므로 src 빌드/테스트는 불필요. 측정 산출물 존재로 판정.
# 측정 결과가 GPU status·render%·reactivity%·drawImage%·아티팩트 경로를 담은 표 행으로 기록됐는지 확인:
grep -nE "GPU status|SwiftShader|render *%|드로|drawImage" phases/chart-render-perf/playwright-probe.md
# repro 하니스 + 일회용 probe 스크립트/훅이 전부 원복/삭제돼 추적 트리가 깨끗한지 확인:
# (측정용 임시변경·probe 스크립트가 남아있지 않아야 함. 전체 트리 기준.)
git status --short
```

## 검증 절차

1. GPU render 비중 수치가 기록됐는지 확인한다.
2. 임시 변경(repro 상수·probe 스크립트·window 훅)이 전부 원복됐는지 `git status`로 확인한다(추적 파일 변경 0).
3. 결과에 따라 `phases/chart-worker-offload/index.json`의 step 0을 업데이트한다:
   - render 지배 확인 → `"status": "completed"`, `"summary"`에 GPU render 비중 수치 + go 판정.
   - GPU 자동측정 불가/불확실 → `"status": "blocked"`, `"blocked_reason"`에 사용자가 실기기 DevTools로 잴 절차(1000×10 repro, 6× 또는 무throttle, drawChart/series draw/drawImage vs 반응성 self-time 비교).
   - render 비전제가 깨짐 → `"status": "blocked"`, 대안 재논의 필요 명시.

## 금지사항

- src/ 라이브러리 코드를 수정하지 마라. 이유: 이 step은 순수 측정 게이트다.
- repro 하니스(`PerfStressDashboard.vue`)·`perfHarness.js`의 임시 측정용 변경을 커밋에 남기지 마라. 이유: 측정 아티팩트이지 제품 코드가 아니다. 측정 후 원복한다.
- 측정 없이 "render-bound일 것"이라고 가정해 통과시키지 마라. 이유: 이 게이트의 존재 이유가 headless 부풀림 배제다.
