# Chart Scale — 축 스케일 (tick 계산·range/domain·라벨 렌더)

## Purpose

EvChart 캔버스 차트의 축(axis) 도메인. 데이터 min/max 와 사용자 축 옵션(`range`, `interval`,
`decimalPoint` 등)으로부터 축의 그래프 범위(graphMin/graphMax)와 tick(steps/interval/ticks)을
계산하고, 축선·그리드·눈금 라벨·plotLine/plotBand 를 캔버스에 그린다. 베이스 클래스 `Scale` 을
5개 구현(Linear/Logarithmic/Time/TimeCategory/Step)이 상속하며, `chart.core.js` 의 `createAxes` 가
axis 옵션의 `type`(`linear`/`time`/`log`/`step`)과 `categoryMode` 로 구현을 선택한다.

## Features

### 공통 (scale.js — Scale 베이스)

- **축 인스턴스 생성**: 생성자에서 `defaultsDeep({}, axisOpt, AXIS_OPTION)` 병합 결과의
  모든 키를 인스턴스 프로퍼티로 복사한다. `position` 미지정 시 x축은 `bottom`, y축은 `left`.
  좌표 매핑은 `AXIS_UNITS[type]`(rectStart/rectEnd/rectOffset)을 따른다. `zeroLineColor`,
  `plotLines`, `plotBands` 등 AXIS_OPTION 에 없는 키도 axisOpt 로 주입되면 그대로 프로퍼티가 된다.
- **라벨 스텝 상한 계산** (`calculateLabelRange`): 그리기 가능 폭(drawRange = 차트
  크기 − labelOffset 합)을 버퍼된 tick 크기로 나눠 `{ min: 1, max: maxSteps }` 를 반환.
  x축 버퍼는 `floor(tickSize * 1.2)`, y축 버퍼는 `tickSize + floor(chartHeight * 0.1)`.
  maxSteps 하한은 1.
- **스케일 범위 계산** (`calculateScaleRange`): range 소스 우선순위는
  `scrollbarOpt.use ? scrollbarOpt.range : this.range`. 배열 `[min, max]` 면 그대로 사용
  (단 차트 타입이 `heatMap` 이면 데이터 min/max 로 clamp), 함수면 `range(dataMin, dataMax)`
  호출 결과 사용, 없으면 데이터 minMax. 이후 `autoScaleRatio`(max 를 `ceil(max*(ratio+1))`),
  `startToZero`(min=0) 적용. `max === min` 이면 max 를 +1 하고 formatter 에
  `isMaxValueSameAsMin: true` 를 전달한다. 반환값에 min/max 라벨 문자열과
  `Util.calcTextSizeCanvas` 로 잰 라벨 크기(size)를 포함한다.
- **축/그리드/라벨 렌더** (`draw`): `showAxis`(축선), `labelStyle.show`(라벨+그리드),
  `showGrid`(그리드, ix===0 은 생략하되 x축 `flow` 옵션이면 예외), `showAxisTick`(길이 5px 눈금),
  `zeroLineColor`(tick 값 0 인 그리드 라인 색 교체), `firstLabelFontStyle`/`lastLabelFontStyle`
  (첫/마지막 라벨 폰트 오버라이드), `selectLabel.useLabelOpacity`(선택 외 라벨을
  `unSelectedOpacity` 로 블러), `selectItem.showLabelTip`(hit 라벨 툴팁),
  `brush.showLabel`(brush 차트의 라벨 표시 여부), `labelStyle.fixWidth`(초과 시 ellipsis) 를
  처리한다. x축 flow 시 axisMin 을 interval 배수로 보정한 위치부터 라벨을 시작한다.
- **plotLine/plotBand 렌더** (`drawPlots`, front 패스): `draw()` 는 `_plotGeom`
  (aPos/axisMin/axisMax 등)만 캐시하고, 실제 그리기는 `chart.core.drawPlotsFront` 가 호출하는
  `drawPlots()` 가 수행한다(z-order: series 위·maxTip 아래). plotBand 의 from/to 는
  axisMin/axisMax 로 clamp 하고, plotLine 은 `Number.isFinite(+value)` 가 아니면 건너뛴다.
  위치 변환은 `Canvas.calculateX/Y`.
- **plot 라벨 박스**: `PLOT_LINE_LABEL_OPTION` 병합 후 계산.
  반응형 3단계(`responsive.hideBelow` 미만이면 숨김 → `valueOnlyBelow` 미만이면 value 만 표시),
  `showValue`(text 와 value 합성; value 포맷은 `valueFormatter`(`(value) => string`) 가 있으면
  그 결과, 없으면 축 formatter. plotBand 는 from/to 양끝에 각각 자동
  바깥 배치), `position`(`outside`=plot 밖 우측 여백 / `innerStart` / `innerEnd`),
  X축 라벨은 position/verticalAlign 무시하고 항상 plot 상단(`computeTopLabelBox`),
  말풍선 꼬리(`pointer.show`, 높이 4·밑변 절반 4 고정, maxTip 과 동일 크기),
  `borderRadius`, `padding`(number 또는 상하좌우 객체), `textOverflow: 'ellipsis'`,
  value-only 상태에서 `showTextOnHover.use` 면 hover hit 영역을 `plotLabelHitRegions` 에 수집.

### LinearScale (scale.linear.js)

- **4분기 tick 계산** (`calculateSteps`):
  1. **userRange + userInterval**: `(max-min)/interval` 이 정수(EPS 1e-10)이고 maxSteps 이하이거나
     `fixedSteps` 면 그대로 사용.
  2. **userRange only**: `getExactInterval` — maxSteps 이하 steps 중 interval 이 유한 소수가 되는
     후보에서 소수 자릿수가 가장 적은 것을 선택(같으면 steps 큰 쪽 우선, 탐색은 steps 내림차순),
     graphMin/graphMax 는 userRange 로 고정. 못 찾으면 `toFixed(12)` fallback.
  3. **userInterval only**: graph 경계를 interval 배수로 확장(`expandByInterval` — min≥0 이면
     min 고정·max 만 ceil, 부호 혼합이면 양쪽 확장, 전부 음수면 max 고정·min 만 floor).
     steps 가 maxSteps 를 초과하는 동안 interval 을 원래 값만큼씩 더해(배수 단위) 재계산.
     nice scale·startToZero 미적용.
  4. **auto**: startToZero 정규화(min≥0→0, max≤0→0) 후, 정규화 범위가 정확히 0~1 이면 legacy
     특례(`getLegacyOneMaxScale`: decimalPoint falsy → interval 1/steps 1, maxSteps>2 →
     0.2/5, 그 외 → 0.5/2). 아니면 `getStepsWithNiceScale` — `NICE_FRACTIONS` [1, 2, 5] ×
     10^exp 후보 중 `interval ≥ range/maxSteps` 이고 steps ≤ maxSteps 인 것에서
     총 overshoot(`(min−niceMin)+(candidateMax−max)`)가 최소인 조합 선택.
     niceMin 은 `floor(min/interval)*interval`(EPS 보정).
- **decimalPoint 'auto'** (AXIS_OPTION 기본값): 각 분기에서 결정된 interval 로
  `getDecimalPointFromInterval` 을 호출해 interval 을 왜곡 없이 표현하는 최소 소수 자릿수
  (0~10)를 `adjustedDecimalPoint` 에 저장한다. 'auto' 가 아니면 decimalPoint 값을 그대로 사용.
- **라벨 포맷** (`getLabelFormat`): 사용자 `formatter` 가 있으면
  `prevOriginalValue`/`prevDecimalPointValue`/`currentOriginalValue`/`currentDecimalPointValue`
  를 담아 호출하고 문자열 반환 시 그대로 사용. 아니면 `Util.labelSignFormat` —
  1000 이상을 K/M/G/T/P 로 축약, decimalPoint 자릿수 적용(나누어떨어지지 않으면 toFixed(1)).
- **빈 데이터 기본 축**: range override 가 없고 데이터 min/max 가 null 이면
  `[0, 1]` 기본 범위를 반환. `autoScaleRatio` 와 `startToZero` 는 userRange 배열이 있으면
  적용하지 않으며, autoScaleRatio 는 부호 혼합 시 음수 방향에 max 증가분을 더하고
  전부 음수면 음수 방향에도 ratio 를 적용한다.

### LogarithmicScale (scale.logarithmic.js)

- **magnitude 기반 range**: `calculateScaleRange` 는
  `rangeMagnitude = floor(log10(max−min))` 를 구해 max 를 `ceil(max/10^mag)*10^mag` 로 올림.
  `startToZero` 면 min=0.
- **magnitude 기반 tick**: `getInterval` = `10^floor(log10(max−min))`.
  `calculateSteps` 는 maxValue===1 이면 0.2/5 특례, `skipFitting` 이 아니면 steps 가
  maxSteps 초과 시 interval ×2, `maxSteps/2` 미만이면 ÷2(rangeMagnitude ≥ 0 이면 정수 유지
  가능할 때만) 반복. graphMax 는 `ceil(graphMin + steps*interval)`.
  값 자체의 로그 변환은 수행하지 않는다(라벨·위치 모두 선형 값 기준).
- [NEEDS CLARIFICATION: scale.logarithmic.js:18 의 `typeof range === 'function'` 은 지역 변수
  `range` 가 없어 항상 false — 함수형 range 분기(`this.range(min, max)`)가 log 축에서는 절대
  실행되지 않는다. `typeof this.range` 의 오타인지 의도인지?]
- [NEEDS CLARIFICATION: chart.core.js:1178 은 `new LogarithmicScale(dir, axis, ctx)` 로
  `options` 를 전달하지 않아 log 축의 `this.options` 는 undefined — base `draw()` 의
  options 의존 기능(selectLabel 블러, labelTip, brush, flow)이 log 축에서만 비활성이다.
  의도된 제약인가?]

### TimeScale (scale.time.js)

- **시간값 정규화** (`normalizeTimeValue`, named export 겸용): null/undefined → null,
  유한 number → 그대로, 그 외(문자열·dayjs 등) → `dayjs(value).valueOf()`, invalid → null.
  `calculateScaleRange` 는 range(배열/함수)와 minMax 를 정규화해 super 에 위임하고
  결과 min/max 도 정규화해 반환한다. range override 가 없고 데이터 min/max 가 null 이면
  `{ min: null, max: null, minLabel: '', maxLabel: '' }` 를 반환한다.
- **interval meta**: 사용자 interval 은 string(`TIME_INTERVALS` 키), object
  (`{ time, unit }`), number(ms) 3형식을 `getIntervalMeta` 로 정규화. 미지정(auto)이면
  `ceil(span / maxSteps)` ms 의 number interval(boundary 정렬 없음).
- **boundary 정렬 tick 생성** (`calculateSteps`): graphMin/graphMax 는 데이터(또는
  range) 값을 **변경하지 않고** 유지하고, `generateVisibleTicks` 가 첫 tick 을
  `ceilToBoundary(graphMin)` 으로 정렬한 뒤 interval 씩 더해 graphMax 이하 tick 배열을
  만든다(상한 MAX_TICKS 10000). min/max 가 null 이거나 min ≥ max 면 빈 ticks. 반환:
  `{ steps: ticks.length−1, interval, baseInterval, graphMin, graphMax, ticks }`.
- **boundary anchor 규칙** (`ceilToBoundary`): sub-day(ms/s/m/h) → 해당일
  `startOf('day')`, day → 연초 기준 캘린더 일수(`startOf('year').add(n, 'day')`),
  week → 연초 기준 월요일에서 캘린더 주수, month/quarter → 달력 기반 연초,
  year → epoch 2000년.
  number interval → `Math.ceil(ts/ms)*ms` (epoch 0 기준). `time > 1` 도 정확한 배수
  boundary 에 맞춘다(예: 10분 → :00/:10/:20…).
- **maxSteps 확장** (`expandIntervalMeta`): `fixedSteps` 면 확장하지 않는다.
  sub-day 단위이고 base interval 이 하루(86,400,000ms)를 나누어떨어지면 확장 후보를
  "하루의 약수가 되는 base 의 배수"로 제한해(divisor 캐시 사용) 자정 경계에서 격자가
  점프하지 않게 하고, 하루로도 부족하면 day 단위로 승격한다. 그 외에는 worst-case
  tick 수 `floor(span/ms)+1 ≤ maxSteps` 를 만족하는 최소 정수배로 확장(`expandByInteger`).
- **tick 기반 draw**: 균등분할(labelGap)이 아니라 `ticks[]` 의 실제 값을
  `Canvas.calculateX/Y` 로 픽셀 변환해 라벨·그리드·눈금을 그린다. ix===0 에도 grid 를
  그린다(base 와 다름). 라벨 포맷은 formatter 우선, 아니면
  `dayjs(value).format(this.timeFormat)` (timeFormat 기본 'mm:ss').

### TimeCategoryScale (scale.time.category.js)

- **index window**: `calculateScaleRange` 는 super 결과에 `minIndex`/`maxIndex` 를
  추가한다. labels(오름차순 시간 라벨 배열 가정)에서 `ts ≥ rangeMin` 인 첫 인덱스와
  `ts ≤ rangeMax` 인 마지막 인덱스를 찾아 윈도우로 삼는다. 교집합이 없으면 sentinel
  `{ minIndex: 0, maxIndex: -1 }`(빈 윈도우 = 아무것도 안 그림; undefined 는 "전체"라는
  반대 의미이므로 쓰지 않음). rangeMin/Max 가 non-finite 면 전체 `[0, last]` 로 폴백하되
  range 옵션이 지정돼 있으면 `console.warn` 으로 오설정을 경고한다.
- **tick 계산**: `getInterval` 은 TIME_INTERVALS 기반(string/object/number),
  미지정 시 `ceil((max−min)/maxSteps)`. `calculateSteps` 는 `rawInterval` 을 보존하고
  graphMax 는 `min(increase, maxValue)`, steps 는 `round(graphRange/interval)+1`(oriSteps 로
  보존), maxSteps 초과 시 interval ×2 확장. maxValue===1 이면 0.2/5 특례.
- **category draw**: `categoryMode && !alignToGridLine` 이면 startPoint 를
  `ceil(graphGap/2)−2` 만큼 밀어 라벨을 셀 중앙에 둔다. 표시 라벨 수가 2 이하면 첫/마지막만
  표시(`count = max(1, oriSteps−1)`), 그 외 `count = round(oriSteps/steps)` 간격으로 표시.
  `categoryMode && alignToGridLine` 이고 라벨 끝까지 순회했으면 `labels[1]−labels[0]` 간격으로
  외삽한 마지막 경계 라벨을 추가로 그린다.

### StepScale (scale.step.js)

- **라벨 배열 기반 스케일**: 값이 아닌 labels 배열의 인덱스가 domain 이다.
  `calculateScaleRange` 의 range 배열/함수는 **인덱스** `[minIndex, maxIndex]` 로 해석해
  labels 길이로 clamp 하고, min/max 값은 해당 인덱스의 라벨이다. min/max 문자열 라벨은
  `Util.getStringMinMax`(문자열 길이 기준 최장/최단)로 구한다.
- **라벨 폭 제어**: `labelStyle.maxWidth` 는 number, 픽셀 문자열, '%' 문자열
  (chartWidth 비율)을 지원하며 미지정 시 `chartWidth/(labelCount+2)`.
  `labelStyle.fitWidth` 면 `getLabelFormat` 이 maxWidth 로 ellipsis 처리(`fittingString`,
  방향은 `fitDir`). `getLabelWidthHasMaxLength` 오버라이드는 ellipsis 적용 후 폭으로
  최대 라벨 폭을 계산한다.
- **index interval**: `calculateSteps` 는 `oriSteps = maxIndex−minIndex+1` 를 steps 로
  쓰고, `alignToGridLine` 이면서 라벨이 전부 숫자면 `getIndexInterval`(사용자 interval 또는
  `ceil(labels.length/maxSteps)`) 간격으로 라벨을 건너뛴다.
- **step draw**: 라벨 위치는 `alignToGridLine` 이면 그리드 라인 위, 아니면 셀 중앙
  (`labelCenter + labelGap/2`). `showLastLabel` 이면 indexInterval 스킵으로 누락된 마지막
  라벨을 추가로 그린다. `alignToGridLine && !showLastLabel` 이면 `bnPlus/bnMinus`
  (bignumber 유틸)로 `labels[1]−labels[0]` 간격을 외삽한 마지막+1 경계 라벨을 그린다
  (NaN 이면 생략). selectLabel 블러 판정은 라벨 텍스트가 아닌 `dataIndex` 포함 여부 기준.
- **index 기반 plot**: `drawPlots` 오버라이드 — plotBand from/to(기본 0/labels.length)와
  plotLine value 를 인덱스로 보고 `startPoint + labelGap × index` 로 위치를 계산한다
  (plotLine 은 +labelGap/2 로 셀 중앙).

## Business Rules

- range 소스 우선순위는 모든 스케일 공통: `scrollbarOpt.use ? scrollbarOpt.range : this.range`.
  배열 → 함수 → 데이터 minMax 순으로 해석한다(Logarithmic 의 함수 분기는 위 NEEDS
  CLARIFICATION 참조).
- 차트 타입이 `heatMap` 인 경우에만 사용자 range 배열이 데이터 min/max 로 clamp 된다
  (Scale/Linear 의 `calculateScaleRange`).
- `max === min` 이면 max 를 1 증가시키고 formatter 에 `isMaxValueSameAsMin: true` 를 넘긴다.
- 사용자 `formatter` 는 문자열을 반환할 때만 채택되고, 그 외 반환값이면 각 스케일의 기본
  포맷(labelSignFormat / dayjs format / 원본)으로 폴백한다.
- LinearScale 에서 `autoScaleRatio` 와 `startToZero` 는 userRange 배열이 있으면 적용하지
  않는다. base Scale 의 동일 로직에는 이 가드가 없다.
- TimeScale 은 tick 만 boundary 로 정렬할 뿐 graphMin/graphMax 를 절대 변경하지 않는다
  (실시간 슬라이딩 윈도우에서 plot 영역이 흔들리지 않게 하는 전제).
- TimeScale 의 sub-day interval 확장은 "하루의 약수"로 제한된다. 알려진 한계(코드 주석에
  수용된 예외로 명시): DST 전환일(23h/25h)의 **sub-day** 격자와 연말(day 이상 단위의 다일
  확장 시 anchor 교체) 경계에서 라벨이 일회성으로 점프할 수 있다. KST 는 DST 미시행이라
  영향 없음.
- TimeScale 의 day·week 단위 tick 은 DST 관측 타임존에서도 자정에 정렬된다. 정렬(연초 기준
  캘린더 일수/주수)과 가산(`add(n, 'day').startOf('day')`) 모두 달력 연산이다. wall-clock
  자정을 유지하는 대가로 DST 전환일이 낀 tick 간격은 23h/25h 만큼 어긋나 `ms` 로 보고되는
  `interval` 과 불일치한다. 검증: `scale.time.dst.spec.js`.
- 위 불변의 예외: 그 존에 자정이 존재하지 않는 전환일(00:00 → 01:00 로 점프)이 tick 에
  걸리면 그 tick 만 `01:00` 이고 다음 tick 부터 자정으로 복귀한다. 2026 기준 해당 존은
  `America/Santiago`(9/6)·`America/Havana`(3/8)·`Asia/Beirut`(3/29)·`Africa/Cairo`(4/24)·
  `Atlantic/Azores`(3/29) 다.
- day 단위의 maxSteps 확장 판정(`expandIntervalMeta` 의 `floor(span / ms) + 1`)은 ms 산술이라
  봄 전환을 포함한 구간에서 tick 수를 1 적게 본다. 확장 없이 통과한 뒤 실제 tick 이
  maxSteps + 1 개가 될 수 있다(수용된 한계 — `steps` 는 maxSteps 와 같아 소비자 off-by-one 은
  없고 x축 라벨 밀도만 영향).
- TimeCategoryScale 은 labels 가 오름차순(시간순) 정렬돼 있다고 가정한다. 소비자는
  `maxIndex ≥ minIndex` 를 확인한 뒤에만 minIndex 를 시작 인덱스로 사용해야 한다
  (sentinel `{0, -1}` = 빈 윈도우).
- plot 라벨의 `valueFormatter` 는 축 `formatter` 와 폴백 규칙이 다르다: 반환이
  null/undefined 일 때만 축 formatter 로 폴백하고, 그 외(number 등)는 `String()` 으로
  변환해 그대로 채택한다(계산 결과를 살리기 위함). 축 `formatter` 는 문자열이 아닌
  모든 반환값을 폴백 처리한다.
- plot(line/band/label)은 back 패스(`draw`)가 아닌 front 패스(`drawPlots`)에서 그려진다.
  `draw()` 는 geometry 캐시(`_plotGeom`)만 남기며, ctx 는 호출부가 주입한다
  (main=buffer, worker=display).
- StepScale 은 scrollbar 사용 시 `Util.getStringMinMax(labels)` 결과를 WeakMap 에
  캐시해 스크롤마다 라벨 전체 순회(O(n))를 O(1) 로 줄인다.
- TimeScale 은 tick 생성 상한 MAX_TICKS 10000, interval 확장 배수 탐색 상한
  (+10000), 약수 계산 Map 캐시로 무한 루프·반복 비용을 방지한다.
- 축·그리드 선은 `Util.aliasPixel`(홀수 lineWidth 에 0.5px 오프셋)로 캔버스
  안티앨리어싱 번짐을 보정한다.

## Acceptance Criteria

검증 수단: 동일 디렉토리의 단위 테스트(`scale.spec.js`, `scale.linear.spec.js`,
`scale.logarithmic.spec.js`, `scale.step.spec.js`, `scale.time.spec.js`,
`scale.time.category.spec.js`).

- userRange 와 userInterval 이 호환(steps 정수·maxSteps 이하)이면 지정값 그대로
  steps/interval/graphMin/graphMax 가 반환된다. 비호환이어도 `fixedSteps: true` 면 그대로
  사용한다.
- LinearScale auto 모드의 interval 은 항상 {1, 2, 5} × 10^n 꼴이고 graphMin 은
  interval 배수로 내림된다.
- `decimalPoint: 'auto'` 일 때 interval 0.25 → adjustedDecimalPoint 2,
  0.1 → 1, 정수 → 0 이 계산돼 라벨 반올림 왜곡(예: 0.25 가 0.3 으로 표시)이 없다.
- TimeScale string/object interval 은 boundary 정렬된 tick 만 생성한다
  (예: hour → 정각, `{ time: 10, unit: 'minute' }` → 10분 배수). graphMin 이 정확히
  boundary 면 첫 tick 에 포함된다.
- TimeScale 의 maxSteps 확장 시 graphMin/graphMax 는 변하지 않고 첫 tick 만
  확장된 interval 의 boundary 로 정렬되며, 확장 interval 은 baseInterval 의 정수 배수다.
  같은 폭의 슬라이딩 윈도우는 위치가 달라도 interval/정렬이 유지된다.
- TimeScale sub-day 확장 interval 은 하루를 나누어떨어져 자정을 넘어도 tick
  라벨 격자가 점프하지 않는다.
- TimeCategoryScale 에서 range 가 라벨 범위와 교집합이 없으면
  `{ minIndex: 0, maxIndex: -1 }` 이 반환되고, non-finite range 는 전체 라벨 범위로
  폴백하며 range 옵션이 있을 때만 경고를 남긴다.
- StepScale `getIndexInterval` 은 사용자 interval 이 있으면 그 값을, 없으면
  `ceil(labels.length / maxSteps)` 를 반환한다.
- LogarithmicScale `getInterval` 은 `10^floor(log10(max−min))` 을 반환한다
  (min==max 는 0).
- `calculateLabelRange` 는 x축에 1.2 배 버퍼, y축에 chartHeight 10% 버퍼를
  적용하고 좁은 캔버스에서도 maxSteps ≥ 1 을 보장한다.
- 데이터 min/max 가 없고 range override 도 없으면 LinearScale 은 0~1 기본 축,
  TimeScale 은 null 축(빈 라벨)을 반환한다.
- plot 라벨 `showValue: true` 에서 `valueFormatter` 가 없으면 축 formatter 결과가,
  있으면 그 반환값이 value 로 합성된다(value-only 상태 포함). 반환이 null/undefined 면
  축 formatter 로 폴백하고, 숫자 반환은 문자열로 변환해 그대로 쓴다.

## Architecture

```
chart.core.js (createAxes / getAxesRange / calculateSteps / drawAxis / drawPlotsFront)
        │  axis.type 스위치로 인스턴스 생성
        ▼
┌──────────────────────────── Scale (scale.js) ────────────────────────────┐
│ 옵션 병합(AXIS_OPTION) · calculateLabelRange · calculateScaleRange(기본) │
│ draw(축/그리드/라벨) · drawPlots(plotLine/Band/라벨, front 패스)          │
└──────┬──────────┬──────────────┬───────────────────┬─────────────────────┘
       │          │              │                   │
 LinearScale  Logarithmic     TimeScale         StepScale
 (nice scale,  Scale        (boundary 정렬       (labels 인덱스 domain,
  4분기 steps, (magnitude    tick 생성,           ellipsis fitting,
  decimal      기반)         graphMin/Max 불변)   index 기반 plot)
  auto)                          │
                          TimeCategoryScale
                          (labels + index window,
                           category 중앙 라벨)
```

- 구현 선택(chart.core.js `createAxes`): `linear` → LinearScale, `time` →
  `axis.categoryMode ? TimeCategoryScale : TimeScale`, `log` → LogarithmicScale(options
  미전달), `step` → StepScale. labels 는 heatMap 이면 `data.labels[dir]`, 그 외 `data.labels`.
- 모든 concrete 스케일이 `calculateSteps` 를 오버라이드한다. base Scale 의 `calculateSteps` 는
  `this.getInterval` 을 호출하지만 base 에 `getInterval` 정의가 없어, 현재 chart.core 가
  생성하는 어떤 인스턴스에서도 base 구현이 실행되는 경로가 없다.
  [NEEDS CLARIFICATION: base Scale.calculateSteps 는 레거시 잔존 코드인가, 외부(플러그인 등)
  호출을 위한 계약인가?]

## File Structure

| 파일 | 역할 |
|------|------|
| scale.js | Scale 베이스 클래스 — 옵션 병합, 라벨 스텝 상한/범위 계산, 축·그리드·라벨 draw, plotLine/plotBand/라벨 front 패스 렌더, 라벨 박스·말풍선 꼬리·hover hit 영역 |
| scale.linear.js | LinearScale — nice scale(1/2/5), 4분기 calculateSteps, getExactInterval, decimalPoint 'auto'(adjustedDecimalPoint), labelSignFormat(K/M/G/T/P) 라벨 |
| scale.logarithmic.js | LogarithmicScale — magnitude(10^floor(log10)) 기반 range 올림·interval, 0~1 특례 |
| scale.time.js | TimeScale — normalizeTimeValue(export), interval meta(string/object/number), boundary 정렬 tick 생성, 하루의 약수 확장, tick 기반 draw, DST/연말 한계 주석 |
| scale.time.category.js | TimeCategoryScale — 시간 라벨 배열 + minIndex/maxIndex 윈도우(sentinel {0,-1}), category 셀 중앙 라벨, 경계 라벨 외삽 |
| scale.step.js | StepScale — 라벨 인덱스 domain, maxWidth/fitWidth ellipsis, alignToGridLine·showLastLabel, index 기반 plot, 문자열 min/max WeakMap 캐시 |

## Dependencies

| 대상 | 용도 |
|------|------|
| ../helpers/helpers.constant | AXIS_OPTION(축 옵션 기본값, decimalPoint 'auto'·timeFormat 'mm:ss' 포함), AXIS_UNITS(방향별 좌표 키), TIME_INTERVALS(단위별 ms), NICE_FRACTIONS([1,2,5]), PLOT_LINE_OPTION/PLOT_BAND_OPTION/PLOT_LINE_LABEL_OPTION |
| ../helpers/helpers.util | getLabelStyle, calcTextSizeCanvas, labelSignFormat, aliasPixel, truncateLabelWithEllipsis, getStringMinMax, calculateMagnitude, colorStringToRgba/getOpacity, showLabelTip, isNullOrUndefined |
| @/components/chart/helpers/helpers.canvas | calculateX/calculateY — 값→픽셀 좌표 변환 (Scale.drawPlots, TimeScale.draw) |
| @/common/utils | truthyNumber |
| @/common/utils.bignumber | bnMinus/bnPlus — StepScale 경계 라벨 외삽의 부동소수점 오차 방지 |
| lodash-es | defaultsDeep — 옵션 병합 |
| dayjs | TimeScale/TimeCategoryScale 의 파싱·포맷·달력 연산(month/quarter/year 증가) |
| chart.core.js (소비자) | createAxes 로 인스턴스 생성(bufferCtx 주입), calculateScaleRange→calculateLabelRange→calculateSteps→draw→drawPlotsFront 파이프라인 호출 |
| render/render.snapshot.js (소비자) | `normalizeTimeValue` named import |

## Glossary

| 용어 | 정의 |
|------|------|
| minMax | 데이터에서 집계된 축별 최소/최대값 (chart.core 가 전달) |
| range | 사용자 축 옵션 — 배열 `[min,max]`(step 은 인덱스), 함수 `(dataMin,dataMax)=>[min,max]`, 또는 scrollbar 의 현재 범위 |
| graphMin / graphMax | 축이 실제로 그리는 그래프 범위. tick 계산 결과로 데이터 범위보다 넓어질 수 있음(TimeScale 은 불변) |
| steps / interval | 눈금 칸 수와 한 칸의 값 간격 |
| maxSteps | calculateLabelRange 가 라벨 물리 크기로 계산한 눈금 칸 수 상한 |
| tick | 축 눈금 하나. TimeScale 은 boundary 정렬된 타임스탬프 배열(ticks[])로 관리 |
| boundary 정렬 | tick 을 graphMin+n×interval 이 아닌 달력/자정 기준 배수 위치(정각·10분 배수 등)에 맞추는 것 |
| nice scale | interval 이 {1,2,5}×10^n 이 되도록 graphMin/graphMax 를 조정하는 자동 눈금 |
| adjustedDecimalPoint | decimalPoint 'auto' 일 때 interval 로부터 계산된 라벨 소수 자릿수 |
| categoryMode | time 축에서 라벨 배열 기반 category 동작을 켜는 axis 옵션(TimeCategoryScale 선택 조건) |
| alignToGridLine | 라벨을 셀 중앙이 아닌 그리드 라인 위치에 정렬하는 labelStyle 옵션 |
| sentinel {0, -1} | TimeCategoryScale 의 빈 윈도우 표현(minIndex 0, maxIndex −1) — "아무것도 안 그림" |
| labelOffset | 라벨이 차지하는 상하좌우 여백. plot 영역 크기 계산에 사용 |
| plotLine / plotBand | 축 값 기준 임계선/임계 영역 오버레이. front 패스에서 시리즈 위에 렌더 |
| _plotGeom | draw() 가 캐시하고 drawPlots() 가 소비하는 plot 렌더용 geometry |

## Data Flow

```
axis 옵션 + 데이터 minMax
    │ chart.core.createAxes(type 스위치, bufferCtx 주입)
    ▼
scale 인스턴스 (axesX[] / axesY[])
    │ ① calculateScaleRange(minMax, scrollbarOpt[, chartRect])
    ▼        → { min, max, minLabel, maxLabel, size[, minIndex, maxIndex] }
axesRange ── ② getLabelOffset (라벨 size → plot 여백)
    │        ③ calculateLabelRange(type, chartRect, labelOffset, tickSize)
    ▼        → labelRange { min: 1, max: maxSteps }
④ calculateSteps({ minValue, maxValue, minIndex, maxIndex, minSteps, maxSteps })
    ▼        → axesSteps { steps, interval, graphMin, graphMax[, ticks, oriSteps, …] }
⑤ draw(chartRect, labelOffset, stepInfo, hitInfo, selectLabelInfo[, dataLabels])
    │        축선·그리드·눈금·라벨 렌더 + _plotGeom 캐시
    ▼
⑥ chart.core.drawPlotsFront → axis.drawPlots()
             plotBand → plotLine → 라벨 박스(+pointer) 순서로 front 렌더,
             plotLabelHitRegions 수집 → hover tooltip 판정에 사용
```
