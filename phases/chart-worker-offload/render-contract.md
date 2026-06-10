# Render Snapshot Contract (Step 6)

worker(OffscreenCanvas) 로 넘길 렌더 입력의 계약. 코드 구현은
`src/components/chart/render/render.snapshot.js`. 이 문서는 **권위 있는 명세**다.

> 원칙(plan.md 불변 원칙 4·5): 기하 계산은 main, 래스터화만 worker. RenderCore 입력은
> **plain · serializable · versioned(epoch) · deterministic**. Vue proxy / function(formatter) /
> circular ref / live class instance 금지. SharedArrayBuffer 불가 → Transferable ArrayBuffer / ImageBitmap 만.

---

## 1. RenderInput (`toRenderSnapshot(core, epoch)`)

RenderCore(prepare + series raster)가 필요로 하는 **최소 입력**. 전부 plain·structured-clone 가능.

| 필드 | 타입 | 출처 | 비고 |
|---|---|---|---|
| `version` | number | 상수 | `RENDER_SNAPSHOT_VERSION`. worker 버전 불일치 시 main fallback 판정 |
| `epoch` | number | 호출처 주입 | 단조 증가. display frame ↔ hit-test model 일관성 / stale drop (§3) |
| `pixelRatio` | number | `core.pixelRatio` | ChartShell `computePixelRatio()` 결과(Step 5). worker 는 window 없음 |
| `chartRect` | {x1,x2,y1,y2,chartWidth,chartHeight,width,height} | `core.chartRect` | 전부 number |
| `labelOffset` | {left,right,top,bottom} | `core.labelOffset` | post-adjust 값 |
| `axesSteps` | {x:[axisStep], y:[axisStep]} | `core.axesSteps` | `graphMin/graphMax/interval/steps/minIndex/maxIndex/...` 원시값. function 제외 |
| `options` | object | `core.options` (화이트리스트) | `type/horizontal/sunburst/coordinateDedupe/unSelectedOpacity/displayOverflow/thickness/cPadRatio/borderRadius/seriesReverse/maxTip/padding`. interaction 상태(select*)는 제외(main overlay 소유) |
| `seriesOrder` | {line:[id],bar:[],scatter:[],heatMap:[],pie:[]} | `core.seriesInfo.charts` | 그리기 순서 보존(string id 배열) |
| `series` | {[id]: SeriesSnapshot} | `core.seriesList` | 아래 |

**SeriesSnapshot** = 메타 원시값 화이트리스트(`SERIES_META_KEYS`: sId/type/name/show/color/fill/fillColor/
pointFill/lineWidth/thickness/pointSize/pointStyle/interpolation/combo/xAxisIndex/yAxisIndex/stackIndex/
groupIndex/isExistGrp/showValue) + `data`(컬럼형, §5).

**제외/변환**: function(formatter/range/color 콜백) → 키 누락. Vue proxy → 화이트리스트 키만 읽어 plain 화.
class instance(Scale/Series) → 화이트리스트 원시값만 추출. circular ref → 화이트리스트 추출이라 구조상 불가.

---

## 2. RenderGeometry (`extractRenderGeometry(core)`)

hit-test(`plugins.interaction.js`)가 소비하는 픽셀 기하. **기본 정책 = main 계산이 정답**:
Step 2 `computeGeometry` 가 main 모델(`series.data[i].xp/yp/w/h`, pie 는 series 인스턴스 각도)에 써 두고,
이 함수는 그 값을 **읽어 노출만** 한다(재계산·worker 왕복 없음 → 두 번째 진실 원천 방지).

| 타입 | kind | 형태 |
|---|---|---|
| line / scatter | `point` | `{xp:number[], yp:number[]}` |
| bar / heatMap | `rect` | `{xp:number[], yp:number[], w:number[], h:number[]}` |
| pie / doughnut | `arc` | `{centerX,centerY,radius,startAngle,endAngle, slices:[{sa,ea}]}` — **xp/yp/w/h 로 강제 안 함** |

**worker 변형(옵션)**: worker 가 기하를 계산하면 frame 과 함께 `{epoch, geometry}` 를 main 으로 반환해
main 모델에 머지하는 규약이 필요하다. 그러나 **기본은 main 계산**(기하는 싸고 hit-test 가 즉시 필요).

---

## 3. version / epoch

- `version` (`RENDER_SNAPSHOT_VERSION`) : 포맷 호환. worker 가 모르는 버전이면 main fallback.
- `epoch` : 호출처가 관리하는 단조 증가 정수. 같은 model 입력이면 **epoch 외 모든 필드 동일**(deterministic).
  - 용도: worker 가 frame(ImageBitmap)을 비동기로 돌려줄 때, main 은 자신의 현재 epoch 와 비교해
    **stale frame(낡은 epoch) 을 drop** 한다. hit-test model 은 항상 main 의 최신 epoch 기하와 일치.
  - 구체 정책(coalescing·mismatch drop)은 Step 9.

---

## 4. formatter / range 정책 매트릭스

사용자 콜백은 **직렬화 불가**(closure·DOM·locale 참조)이므로 worker 에서 실행하지 않는다.
각각 (a) **main precompute**(결과 문자열/값을 스냅샷에) 또는 (b) **worker-unsupported → main fallback**.

| 콜백 | 위치 | 정책 | 비고 |
|---|---|---|---|
| axis label formatter | `scale.js getLabelFormat` | (a) main precompute | 라벨 문자열을 axesSteps/스냅샷에 미리 포맷 (Step 8) |
| axis **range 콜백** | `scale.js:85` `range(min,max)` | (a) main precompute | min/max 결과는 이미 `axesSteps.graphMin/graphMax` 로 반영됨 → 스냅샷이 그 수치만 전달 |
| **showValue formatter** (bar) | `element.bar.js:463-492` | (b) unsupported → main fallback | formatter 있으면 그 시리즈 값 라벨은 main 에서 그림(또는 결과 precompute, Step 8) |
| **showValue formatter** (heatMap) | `element.heatmap.js:399-417` | (b) unsupported → main fallback | 동일 |
| **showValue formatter** (pie) | `element.pie.js:142-152` `formatter({value,percentage})` | (b) unsupported → main fallback | 동일 |
| tooltip formatter | `element.tip.js` | (a) main only | tooltip 은 항상 main(`drawTip`) — worker 비대상(plan 원칙 3) |
| color / font 콜백 | series `color` 가 함수일 때 | (b) unsupported → main fallback | toPlain 이 function 을 drop → 해당 시리즈 main 렌더 |
| plot label (plotLines/Bands) | `scale.js` | (a) main only | static layer 상호작용 상태와 묶임(Step 4) → 현재 main |

스냅샷에는 **함수가 절대 들어가지 않는다**(toPlain 이 drop). 함수가 필요한 렌더는 main precompute 또는
해당 시리즈 main fallback.

---

## 5. per-type pack 포맷 (`packSeries`)

대량 수치는 컬럼형 → **Float64Array + Transferable ArrayBuffer**. 메타는 plain object(§1).

| 데이터 종류 | 컬럼 레이아웃 | 비고 |
|---|---|---|
| line / scatter | `x[], y[], o[], b[]` | x/y = 픽셀 변환 전 값. o=원본, b=stack base |
| **category** | `x` = 카테고리 **인덱스(number)**, `y`=값 | 라벨 문자열은 axesSteps/메타로 별도(수치만 pack) |
| **time** | `x` = epoch ms(number), `y`=값 | dayjs 객체 아님 |
| **dayjs** | pack 전 `valueOf()`(ms number)로 환원 | dayjs 인스턴스(class)는 스냅샷 금지 → ms number 만 |
| **null** | 해당 슬롯 = `NaN` sentinel | worker 에서 NaN→null 환원(그리기 건너뜀) |
| **stacked** | `b[]`(base) 컬럼 포함 | line/bar 공통 |
| **bar** | `x[], y[], o[], b[]` | 픽셀 w/h 는 기하(§2), 데이터엔 수치만 |
| **heatMap** | `x[], y[], o[], b[]` | 셀 색(dataColor)은 기하/메타, 수치만 pack |
| **pie** | `value[]` | x/y 좌표 없음. 각도는 기하(§2) |

**copy vs transfer (★ 중요)**:
- `packSeries` 는 **항상 새 Float64Array 로 copy** 한다. 따라서 반환 `transferList` 의 버퍼는 전부 이
  함수가 새로 만든 사본이라 **worker 로 transfer 해도 main source 가 detach 되지 않는다**.
- **금지**: main 이 계속 쓰는 원본(`series.data` plain 배열 / 소비자 reactive 배열)을 직접 transfer.
  그러면 main 에서 그 데이터 접근이 깨진다 → 반드시 copy(현재 구현 = 항상 copy).
- `packMs` (pack 소요시간)은 Step 8 transfer 비용 기준선으로 측정한다(테스트에서 1000×60 기록).

---

## 6. font 동기화 계약

worker `measureText` 가 main 과 **동일 폭**을 내려면 font string 이 일치해야 한다.

- 스냅샷/메타의 font 는 `Util.getLabelStyle()` 가 만드는 **CSS font shorthand 문자열**(예: `"normal 12px Arial"`)
  로 전달한다(객체 아님). worker 는 같은 문자열을 `ctx.font` 에 세팅.
- **web font 로드 경합**: worker 가 같은 font 를 아직 로드 못 했으면 폭이 어긋난다. main 이
  `document.fonts.ready` 이후 **epoch 를 올려 재요청**(re-render)하는 규약으로 해소한다.
  - 구현은 Step 8~9. 이 step 은 계약만 문서화.

---

## 7. 검증 (Step 6 AC)

`src/components/chart/render/render.snapshot.spec.js`:
- **structured-clone smoke**: `toRenderSnapshot` 결과가 `structuredClone()` 가능 + function/proxy/class/circular 없음.
- **deterministic**: 같은 model 입력 → epoch 외 동일 스냅샷.
- **geometry 동치**: `extractRenderGeometry` 결과가 `computeGeometry` 후 `series.data[i].xp/yp/w/h` 와 동일(Step 2 연결).
- **pack/transfer 안전**: `packSeries` 가 항상 copy → 원본 plain 배열이 detach/변형되지 않음.
- **대용량 벤치(방향성)**: 1000×60 pack 시간 기록(Step 8 `packMs` 기준선).
