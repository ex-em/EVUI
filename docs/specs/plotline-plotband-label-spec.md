# PlotLine / PlotBand 라벨 개선 스펙

> EvChart 의 `plotLines` / `plotBands` 라벨 기능 개선 정의서.
> 대상 파일: `src/components/chart/scale/{scale.js, scale.step.js, scale.time.js}`,
> `src/components/chart/helpers/helpers.constant.js`,
> (#6 한정) `src/components/chart/chart.core.js`, `src/components/chart/plugins/{plugins.interaction.js, plugins.tooltip.js}`

---

## 1. 배경

현재 plot 라벨은 다음 제약이 있다.

- Y-plot 라벨은 **plot 영역 바깥 우측 여백**(`textX = maxX + …`)에만 그려진다 → `padding.right` 여백에 의존하며, 데이터가 깔린 영역 안에는 둘 수 없다.
- 라벨 텍스트는 단일 `text` 한 줄뿐. 임계값(value)이나 alias+value 조합, 반응형 축약을 표현할 수 없다.
- 라벨 배경은 `fillColor` 박스만 있고 opacity 제어 개념이 없다.
- PlotBand 모서리(start/end) stroke 스타일을 지정할 수 없다 (X/Y band 동작도 불일치).
- `value`/`index`가 `0`일 때 falsy 가드 때문에 선/밴드/라벨이 누락된다.

본 스펙은 위를 옵션 추가(하위호환 유지)로 개선한다.

---

## 2. 확정된 결정 (논의 결과)

| 주제 | 결정 |
|---|---|
| **z-order** | **`maxTip > plot(line/band/label) > series`** 로 확정(스펙 변경 반영). plot 을 static 에서 떼어 **front 패스(`drawPlotsFront`)** 로 분리, `drawForeground`(`drawPlotsFront`→`drawTip`)를 통해 series 위·maxTip 아래에 그린다. 옵션화는 하지 않음. **순서 변경 시 `drawForeground`의 두 줄 swap.** (자세히는 §9) |
| **0값 표시** | falsy 가드를 명시적 null/유한성 검사로 교체해 `0` 값/인덱스도 표시. |
| **라벨 가로 배치** | 단일 옵션(`position`)으로 좌/우 끝 배치. alias·value를 좌/우로 **분리 배치하는 방안은 제외** — 묶어서 한쪽 끝에 표시. |
| **라벨 텍스트** | 기존 `text`를 라벨(=alias)로 사용 (`alias` 신설 안 함). `showValue`로 value 합성. |
| **배경 opacity** | 기존 `fillColor`가 rgba를 허용하므로 **별도 옵션 불필요**. `fillColor: 'rgba(...)'`로 opacity 지원. (`background` 옵션 도입 안 함 — 중복 방지) |
| **value 포맷** | 해당 축의 `getLabelFormat()`(축 formatter) 적용. |
| **PlotBand value** | `showValue` 시 `from`·`to` 양끝에 각각 라벨 표시(2개). |
| **반응형 축약** | 너비 기준 3단계: 풀(text+value) → value만 → 미노출. |
| **value-only hover tooltip** | 데스크탑 전용 / series tooltip 우선 / `showTextOnHover` 옵션(`use` **기본 false**) + **tooltip 스타일 지정 가능**. |

---

## 3. 옵션 스키마

### 3.1 label (plotLine · plotBand 공통)

```js
label: {
  // ── 기존 (유지, 기본 동작 불변) ──
  show: false,
  fontSize: 12,
  fontColor: '#FF0000',
  fillColor: '#FFFFFF',      // 박스 배경. rgba 허용 → opacity 지원 (별도 옵션 불필요)
  lineColor: '#FF0000',
  lineWidth: 0,
  fontWeight: 400,
  fontFamily: 'Roboto',
  verticalAlign: 'middle',   // 선 기준 세로: 'top'(선 위) | 'middle' | 'bottom'(선 아래)
  textAlign: 'center',       // 'left' | 'center' | 'right'
  textOverflow: 'none',      // 'none' | 'ellipsis'
  maxWidth: null,
  text: null,                // 라벨 텍스트(=alias). showValue=false면 이 값을 그대로 표시

  // ── 신규 ──
  borderRadius: 0,           // 라벨 박스 모서리 반경(px). 0이면 사각
  gap: null,                 // 임계선/임계영역↔라벨 박스 간격(px). null이면 자동(fontSize 기준, X축 상단은 2)
  padding: null,             // 라벨 박스 안쪽 여백. number(단축) 또는 { top, right, bottom, left }
                             //   (차트 padding·tooltip rowPadding 과 동일 형식). null이면 fontSize/4
  pointer: {                 // 말풍선 꼬리. 방향은 배치 기준 자동, 크기 고정
    show: false,             //   (위 배치=아래꼬리 / 인접선 방향 자동). plotLine·plotBand 라벨 공통
    color: null,             //   null이면 박스 배경색(fillColor) 사용
  },
  position: 'outside',       // 'outside'(기존 plot 밖 우측 여백)
                             // | 'innerStart'(plot 안 좌측 끝)
                             // | 'innerEnd'(plot 안 우측 끝)
  showValue: false,          // true → "text value" 합성 (value = 축 formatter)
  responsive: {              // 차트(plot) 너비 기준 3단계 축약. 둘 다 null이면 항상 풀 표시
    valueOnlyBelow: null,    //   너비 < 이 값 → value만 표시
    hideBelow: null,         //   너비 < 이 값 → 라벨 미노출(선/밴드 본체는 유지)
  },
  // value-only 상태에서 hover 시 text를 tooltip 으로 표시 (데스크탑 전용, series tooltip 우선)
  // 기존 `tooltip` 옵션과 동일하게 토글(use) + 스타일을 한 객체에 담는다.
  showTextOnHover: {
    use: false,              // 활성 여부 (기본 false)
    backgroundColor: '#4C4C4C',
    fontColor: '#FFFFFF',
    borderColor: '#666666',
    borderRadius: 4,
    fontSize: 12,
    fontFamily: 'Roboto',
    useShadow: false,
    shadowOpacity: 0.25,
    padding: { top: 4, right: 8, bottom: 4, left: 8 },
  },
}
```

### 3.2 plotBand

```js
plotBands: [{
  from,                      // 기존
  to,                        // 기존
  color,                     // 기존 (영역 fill)
  border: null,              // 신규: { color: string, width: number, segments: number[] }
                             //   start/end(from·to) 모서리 stroke. segments 지정 시 점선
  label: { /* 3.1 공통 */ }, // showValue 시 from·to 양 끝에 각각 표시
}]
```

---

## 4. 동작 규칙

### 4.1 라벨 텍스트 결정

1. `showValue: true` → `"{text} {value}"` 합성 (`text`가 null이면 value만). value는 축 formatter 적용.
2. `showValue: false` → 기존처럼 **`text` 그대로** (완전 하위호환).

### 4.2 반응형 3단계 (`responsive`)

plot 너비(넓음 → 좁음) 기준으로 표시 단계를 낮춘다.

| 구간 | 표시 |
|---|---|
| 너비 ≥ `valueOnlyBelow` | **text + value** (예: `"심각 90"`) |
| `hideBelow` ≤ 너비 < `valueOnlyBelow` | **value 만** (예: `"90"`) |
| 너비 < `hideBelow` | **라벨 미노출** (선·밴드 본체는 계속 그려짐) |

- 기본값 `valueOnlyBelow=null`, `hideBelow=null` → 반응형 비활성, 항상 풀 표시.
- 판정 순서: `hideBelow`(미노출) → `valueOnlyBelow`(value만) → 풀. (`valueOnlyBelow > hideBelow` 전제, 어긋나면 hide 우선)

### 4.3 가로 배치 (`position`) — Y축

- `'outside'` : 기존 동작. Y-plot은 plot 밖 우측 여백.
- `'innerStart'` : plot 영역 안 좌측 끝.
- `'innerEnd'` : plot 영역 안 우측 끝.
- 세로 위치는 기존 `verticalAlign`(top=선 위 / middle / bottom=선 아래)을 그대로 사용.

### 4.3-X X축 plot 배치 (세로선)

X축(`axesX`)의 plotLine/plotBand 라벨은 Y축과 기하가 달라 다음 규칙을 따른다(`position`/`verticalAlign` 무시):

- **항상 plot 상단(top) 고정.** 라벨 박스는 plot 영역 위에 배치.
- **가로 정렬은 `textAlign`(left/center/right) — 그려질 세로선 기준** 좌/센터/우. (`computeTopLabelBox`)
- **말풍선 꼬리는 아래(↓), 끝(tip)은 항상 세로선의 x를 가리킨다** — 좌/우로 밀어도 자기 선을 지시(`pointerTipX`).
- **plotBand from·to(showValue) 두 라벨은 자동 바깥쪽**: 작은 값(좌 edge)=`textAlign left`, 큰 값(우 edge)=`textAlign right` → 두 라벨이 안 겹침.
- 그 외(borderRadius·padding·pointer·responsive·showValue·hover tooltip)는 Y축과 동일하게 적용.

### 4.4 value-only hover tooltip (#6)

value-only 상태(`hideBelow ≤ 너비 < valueOnlyBelow`)에서는 alias(text)가 가려지므로, hover 로 보완한다.

- **활성 조건**: `showTextOnHover.use: true` **그리고** 현재 value-only 상태일 때만.
- **데스크탑 전용**: 모바일(`isMobile`)은 동작하지 않음.
- **우선순위**: `findHitItem` 의 series hit 이 있으면 series tooltip 이 우선. series hit 이 **없을 때만** 라벨 tooltip 표시.
- **내용**: 해당 라벨의 `text`.
- **표시 방식**: 경량 전용 DOM tooltip (series 용 `tooltipDOM` 과 별개). 커서 이탈 시 숨김.
- **스타일**: `showTextOnHover` 의 `backgroundColor` / `fontColor` / `borderColor` / `borderRadius` / `fontSize` / `fontFamily` / `useShadow` / `shadowOpacity` / `padding` 으로 지정. 기본값은 series `tooltip` 룩앤필과 동일 계열.

---

## 5. 작업 항목 / 영향 범위

| # | 작업 | 영향 계층 |
|---|---|---|
| 1 | **0값 표시** — falsy 가드 교체 (`scale.step.js:441, 468`, `scale.js:547, 668, 698`, band `checkValidPosition` `scale.js:635, 729`) | scale ×3 |
| 2 | **`position` 가로 배치** — `getPlotLineLabelPosition`/`getPlotBandLabelPosition`(scale.js:796~909) 분기 확장 | scale ×3 |
| 3 | **text/value + 반응형** — `getNormalizedLabelOptions`(scale.js:755)에 텍스트 합성·너비 분기 추가 | scale ×3 |
| 4 | **배경 opacity** — 기존 `fillColor`(rgba)로 이미 지원됨. **코드 변경 없음**(동작 확인 + 문서화만) | — |
| 5 | **PlotBand `border` stroke** — `setPlotBandStyle` / `drawXPlotBand`(632) / `drawYPlotBand`(726) | scale |
| 6 | **value-only hover tooltip** — 라벨 hit 영역 수집(scale ×3) → core 취합(`chart.core.js` drawStaticLayer 후) → `onMouseMove` hit-test(`plugins.interaction.js:19`) → DOM tooltip(`plugins.tooltip.js`) | scale + core + interaction + tooltip |
| - | 옵션 상수 추가 — `PLOT_LINE_LABEL_OPTION`, `PLOT_BAND_OPTION`(`helpers.constant.js:162, 183`) | constant |

> #1~#5 는 `scale` 계열 + 상수 수준. **#6 만** interaction/tooltip 플러그인까지 범위가 확장된다.

---

## 6. 하위호환

- 모든 신규 옵션의 기본값 = 기존 동작. **기존 코드는 한 줄도 안 고쳐도 동일하게 동작**한다.
- 신규 키 미지정 시: 라벨은 `position:'outside'`(plot 밖 우측 여백) + `text` 그대로, 반응형/hover/배경 opacity/band border 모두 비활성.

```js
// 기존 코드 — 변경 없이 동일 동작
plotLines: [{
  color: '#FF0000', value: -50, segments: [6, 2],
  label: { show: true, text: 'Y Plot Line' },  // showValue 기본 false → 'Y Plot Line' 그대로
}]
```

---

## 7. 예시

```js
axesY: [{
  type: 'linear',
  plotBands: [{
    from: 70, to: 95,
    color: 'rgba(255, 99, 99, 0.35)',
    border: { color: '#FF0000', width: 1, segments: [2, 2] }, // 상/하단 빨간 점선
    label: {
      show: true, position: 'innerStart', showValue: true,    // from=70, to=95 (양끝)
      fontColor: '#FF0000',
    },
  }],
  plotLines: [
    {
      value: 90, color: '#E53935', segments: [2, 2],
      label: {
        show: true, position: 'innerStart', text: '심각', showValue: true, // "심각 90"
        fontColor: '#FFFFFF',
        fillColor: 'rgba(229, 57, 53, 0.9)',  // 박스 배경 + opacity (rgba)
      },
    },
    {
      value: 67, color: '#8E24AA', segments: [2, 2],
      label: {
        show: true, position: 'innerEnd', text: 'Alias', showValue: true,
        fontColor: '#FFFFFF',
        fillColor: 'rgba(142, 36, 170, 0.9)', // 박스 배경 + opacity (rgba)
        responsive: { valueOnlyBelow: 400, hideBelow: 200 }, // <400: "67", <200: 숨김
        showTextOnHover: {                                   // value-only 시 hover → "Alias"
          use: true,
          backgroundColor: '#4C4C4C', fontColor: '#FFFFFF', borderRadius: 4, useShadow: true,
        },
      },
    },
  ],
}],
```

---

## 8. 제외 / 보류 항목

- **alias / value 좌·우 분리 배치** — 제외. 묶어서 한쪽 끝에 표시.
- **모바일 hover tooltip** — 데스크탑 전용. 모바일 탭 지원은 범위 외.

---

## 9. z-order: plot front 패스 (스펙 변경 반영)

목표 노출 순서: **`maxTip` > `plot(line/band/label)` > `series`** (maxTip 이 가장 앞).

### 구조
한 버퍼에 **그리는 순서 = z-order**. plot 을 static(맨 뒤)에서 떼어내 series 위·tip 아래에 그린다.
```
drawStaticLayer  : grid/axis 만
drawSeriesLayer  : series (또는 worker bitmap 합성)
drawForeground(ctx):                 ← z-order 단일 제어점
  drawPlotsFront(ctx) : plotLine/band/label    ← series 위
  drawTip(ctx)        : maxTip/selectItem/tooltip  ← 가장 앞
→ commit
```
> **순서 변경**: `chart.core.js`의 `drawForeground` 안 두 줄(`drawTip`/`drawPlotsFront`) 순서만 swap.
> 단, 경로가 2곳(동기 `drawChart`-buffer / 워커 `commitWorkerFrame`-displayCtx)이라 `drawForeground(ctx)`를 양쪽이 공유해 제어점은 사실상 한 곳. overlayCanvas(heatmap hover)·DOM tooltip(hover 툴팁)은 별도 레이어라 무관.

### 구현
- **scale ×3**: `draw()`의 plot 블록을 `drawPlots()`로 분리. `draw()`는 grid/axis 만 그리고 plot geometry 를 `this._plotGeom`에 캐시. `drawPlots()`는 캐시 + `this.ctx`로 그림(로직 동일, 위치만 이동).
- **chart.core**: `drawPlotsFront(ctx)`(axes 순회 `drawPlots` + hover hit 영역 취합) / `drawForeground(ctx)` 신설. `drawTip` 호출부(메인/워커 미전송/`commitWorkerFrame`)를 `drawForeground`로 치환, 워커 사망 폴백엔 `drawPlotsFront` 추가.
- 워커 경로: `drawStaticLayer`(전송 프레임)에서 캐시한 `_plotGeom`을 `commitWorkerFrame`이 displayCtx(+pixelRatio transform)에 그림. epoch 가드로 stale 방지.

### 검증
- 단위: `Chart.drawPipeline.spec.js`(파이프라인 순서) 외 비-visual chart spec 107개 통과.
- visual golden spec 은 plot 미사용 → 영향 없음.
