# Step 4: draw-skip-path (Step 2a — hidden skip + path 생략)

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `/Users/ijiwon/Documents/develop/github/EVUI/CLAUDE.md` — 프로젝트 전역 규칙
- `/Users/ijiwon/.claude/CLAUDE.md` — 사용자 전역 규칙 (단순함 우선·외과적 수정)
- `phases/chart-render-perf/plan.md` — 전체 plan. **가장 먼저** (특히 §1 "데이터 불변 제약", §4 Step 2a, "path 생략 적용 조건(보수적)", §4 표 "path 생략"/"hidden 시리즈 변환 스킵")
- `src/components/chart/element/element.line.js` — line 렌더. 전 포인트마다 `lineTo`(plan `:184`), 시리즈당 단일 `stroke()`(`:190`). path 생략 대상
- `src/components/chart/model.store.js` — `createDataSet`/`addSeriesDS`(`:550`~). generic line/bar 경로가 `series.show=false`여도 변환 루프에 들어가는 지점(plan `:53-99`)
- `phases/chart-render-perf/index.json` — step2 summary(golden baseline·tooltip 테스트), step3 summary(hit test 변경)

## 작업

plan §4 "Step 2a — low-risk draw skip"을 수행한다. **두 가지 모두 출력이 시각적으로 동일한(golden 허용 오차 내) 데이터 불변 최적화**다. **path 생략을 메인 카드로 과대평가하지 마라** — 포인트 밀도 병목에만 효과 있고, stroke 수(=시리즈 수) 병목은 줄이지 못한다(plan §1·§4).

### 1. hidden 시리즈 변환·draw skip

- generic line/bar 경로에서 `series.show === false`인 시리즈는 **createDataSet 변환과 draw를 건너뛴다**.
- 안전한 이유: 이미 화면에 안 그려지는 시리즈라 출력 불변.
- **`series.show` 상태를 절대 덮어쓰지 마라**(사용자가 켠 시리즈를 끄지 않는다 — plan 명시).
- 주의: step3에서 만든 ③ "라벨별 유효 시리즈 사전계산"·min/max 재계산이 hidden 시리즈를 이미 어떻게 다루는지 확인하고, skip이 hit test/축 범위와 **모순되지 않게** 한다.

### 2. line 연속 동일픽셀 `lineTo` 생략

- 직전에 찍은 점과 **완전히 같은 화면 픽셀 (x,y)** 에 떨어지는 연속 점의 `lineTo`만 생략한다.
- **line chart의 연속 `lineTo`에만 우선 적용**한다. scatter/bar/heatmap/pie·area·step-line으로 확대하지 마라(이번 step 범위 밖).
- **제외 조건(생략하면 안 되는 점) — 반드시 보존**:
  - segment 방향 전환점
  - null 경계
  - area fill 경계
  - step-line 경계
  - point marker / showValue 기준점
  - (spike는 직전 점과 **다른 픽셀**이라 자동으로 보존됨)
- 픽셀 위치는 축 범위·DPR에 의존하므로 **range/resize 시 재계산**되는 기존 흐름을 깨지 않는다(별도 캐시를 만들지 말고, draw 시점에 직전 픽셀과 비교).
- **데이터·tooltip·hit는 건드리지 않는다** — 이건 draw 단계의 `lineTo` 호출 수 최적화일 뿐이다. 따라서 opt-in 플래그 불필요(기본 활성).

## Acceptance Criteria

```bash
npm run lint
npm run test:visual         # golden 허용 오차 내 시각 동일 (path 생략·hidden skip 후에도 그림 동일)
npm run test:run            # tooltip 값 정확성 유지 + path 생략 단위 테스트 통과
npm run format:check
```

추가 단위 테스트(신규, `test:run`에 포함):
- **path 생략 데이터 불변성**: 같은 입력에 대해 생략 전/후 그려질 점 좌표 집합(또는 path 명령 시퀀스의 시각적 결과)이 동일함.
- **생략 제외 조건**: 방향 전환점·null/area fill/step-line 경계·marker 기준점이 생략되지 않음.

성능 판정은 **수동**: redraw/drawSeries self-time이 baseline 대비 감소했는지 `measurements.md`로 확인(plan §6 — 성능은 CI fail-gate 아님). hidden skip 효과는 hidden 비율에 비례.

## 검증 절차

1. 위 AC가 모두 통과한다. **`test:visual`이 golden 허용 오차 내로 통과해야 한다**(시각 동일이 핵심 제약).
2. path 생략 단위 테스트·제외 조건 테스트가 통과한다.
3. 일관성 체크리스트:
   - line 외 타입(scatter/bar/heatmap/pie)·area·step-line에 path 생략을 적용하지 않았는가?
   - 제외 조건(방향 전환·null/area/step-line 경계·marker)을 모두 보존하는가?
   - hidden skip이 `series.show` 상태를 덮어쓰지 않는가?
   - hit/tooltip 값이 step2 기준선과 동일한가?
4. `phases/chart-render-perf/index.json`의 step 4 업데이트:
   - 성공 → `"completed"`, `"summary"`에 적용 범위(line path 생략 + hidden skip)·제외 조건·추가 테스트 위치를 적는다.
   - 실패 → `"error"` + `"error_message"`.
   - blocked → `"blocked_reason"`.

## 금지사항

- **다운샘플링(LTTB)·시리즈 culling 금지.** 이유: 화면에 보이는 점·곡선·tooltip 값이 바뀐다(plan 데이터 불변 제약). 동일 픽셀 연속점 생략만 허용.
- byte 동일을 목표로 검증하지 마라. 이유: antialiasing·lineJoin·sub-pixel·DPR로 미세 차이 — **golden 허용 오차**로 검증(plan 명시).
- path 생략을 line 외 타입·area·step-line으로 확대하지 마라. 이유: 채움 형상·마커 위치에 영향 가능 — 각 타입 회귀 통과 후 별도 판단(plan §4).
- `series.show` 상태를 덮어쓰지 마라. 이유: 사용자 의도(켠 시리즈) 훼손.
- 이 step과 무관한 파일(hit test·commit 분리 등)을 건드리지 마라. 기존 테스트를 깨뜨리지 마라.
