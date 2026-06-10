# Step 6: render-snapshot-contract (worker 입력/기하 계약)

## 읽어야 할 파일

- `/CLAUDE.md`, `/Users/ijiwon/.claude/CLAUDE.md` — 프로젝트/전역 규칙
- `phases/chart-worker-offload/plan.md` — phase 앵커 (불변 원칙 4·5: 기하/래스터 분리, RenderGeometry)
- `phases/chart-worker-offload/openai-review.md` — Step 5(geometry 누락·formatter 범위·packing) 지적
- `phases/chart-render-perf/plan.md` §5 부록 A.5(전송 비용)·A.6
- `src/components/chart/model/model.store.js` — **(경로: `model/model.store.js`)** seriesList/dataSet/seriesInfo/minMax 구조
- 렌더-타임 formatter/콜백 위치: `src/components/chart/scale/scale.js:85-86`(range 콜백), `src/components/chart/element/element.bar.js:463-492`·`element.heatmap.js:399-417`·`element.pie.js:142-152`(showValue formatter)
- 이전 step 산출물: Step 2(기하/래스터 분리·RenderGeometry 형태), Step 5(RenderCore class-free 입력 경계)

## 배경 (리뷰 #1 갭 확장)

worker로 넘길 입력은 **plain·serializable·versioned·deterministic**이어야 한다. 추가로 리뷰가 짚은 것:
- **RenderGeometry 계약 누락**: hit-test가 쓰는 `xp/yp/w/h`(Step 2에서 main 계산)를 계약으로 못박아, "main 계산"인지 "worker 계산 후 main 반환"인지 정한다.
- **formatter 범위가 좁음**: label/tooltip/axis 외에 **showValue formatter**(bar/heatmap/pie)·**range 콜백**(scale)·color/font 콜백도 render-time 함수다.
- **packing 미명세**: category/time/dayjs/null/stacked/heatmap/pie 데이터, 그리고 transfer 시 **source buffer detach** 문제.

## 작업

1. **RenderInput 타입**: RenderCore(prepare+series raster)가 필요로 하는 최소 입력을 plain serializable로 정의. series 수치, seriesInfo 원시값(type/color/visible/thickness), axes 설정 원시값, scale min/max, chartRect, pixelRatio, theme 원시값, font string. 제외/변환: Vue proxy(`toRaw`+plain), function, class instance, circular ref.
2. **RenderGeometry 계약**: **타입별 기하 형태**를 명시 타입으로 — line/bar/scatter = `xp/yp/w/h`, **pie/doughnut = 각도 기반**(`startAngle/endAngle/centerX/centerY`, `element.pie.js`). pie를 xp/yp/w/h로 강제하지 마라. **기본 정책 = main 계산(Step 2)이 정답**(기하는 싸고 hit-test가 main에서 즉시 필요). worker가 계산하는 변형을 쓸 경우 worker→main 반환 규약을 정의(하지만 기본은 main 계산).
3. **version/epoch**: 스냅샷에 단조 증가 `epoch`. display frame과 hit-test model 일관성·stale drop에 사용.
4. **formatter/range 정책 매트릭스**(표로 고정): axis formatter, axis **range 콜백**, **showValue formatter**(bar/heatmap/pie), tooltip formatter, color/font 콜백, plot 라벨 — 각각 (a) main precompute(결과 문자열/값을 스냅샷에) 또는 (b) worker-unsupported→main fallback 중 무엇인지.
5. **pack 포맷(per chart-type)**: series 수치 대량은 typed array(Float64/32)+Transferable ArrayBuffer, 메타는 plain object. **category/time/dayjs/null/stacked/heatmap/pie** 각각의 레이아웃과, **버퍼를 copy하는지 transfer(detach)하는지** 명시(원본을 transfer하면 main에서 detach됨 → main도 그 데이터를 쓰면 copy해야 함). `packMs` 측정 전제.
6. **font 동기화 계약**: worker `measureText`가 main과 일치하도록 font string을 스냅샷에 전달. web font 로드(`document.fonts.ready`) 후 main이 epoch를 올려 재요청하는 규약 문서화(구현은 Step 8~9).

## Acceptance Criteria

```bash
npm run lint
npm run test:run
```

추가(`test:run` 포함):
- **structured-clone smoke**: `toRenderSnapshot(core)` 결과가 `structuredClone()` 가능 + function/proxy/class/circular 없음.
- **deterministic**: 같은 model 입력 → 같은 스냅샷(epoch 제외).
- **geometry 동치**: 스냅샷 기반 기하가 기존 `item.data.xp/yp/w/h`와 동일(Step 2 테스트와 연결).
- **pack/transfer 안전**: transfer 시 main이 쓰는 버퍼가 detach되지 않음(copy 경계 테스트).
- **대용량 직렬화 벤치(방향성)**: 1000×60 pack 시간 기록(Step 8 packMs 기준선).

## 검증 절차

1. 위 AC 통과.
2. RenderInput·RenderGeometry·formatter 매트릭스·per-type pack·font 계약이 문서로 남음(`phases/chart-worker-offload/render-contract.md` 또는 코드 주석).
3. 스냅샷→RenderCore 라운드트립은 **이 step에선 테스트(오프라인) 한정**이다 — 프로덕션 렌더 경로에 연결하지 마라(실제 소비자 경로는 Step 7/8). 라운드트립 결과가 직접 model 사용과 동일함을 테스트로 확인(golden 가능하면 확인).
4. `index.json` step 6 업데이트.

## 금지사항

- 스냅샷에 function/Vue proxy/class instance/circular ref를 넣지 마라(structured clone 실패/고비용).
- 사용자 formatter/range/color 콜백을 worker에서 실행하려 하지 마라(직렬화·DOM/locale 참조 불가). precompute 또는 unsupported fallback.
- main이 계속 쓰는 source 버퍼를 transfer(detach)하지 마라. 이유: main에서 그 데이터 접근이 깨진다 → 필요하면 copy.
- 실제 worker 생성/transfer는 여기서 하지 마라(Step 8). 기존 테스트를 깨뜨리지 마라.
