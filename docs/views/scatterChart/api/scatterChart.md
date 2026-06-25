>## Desc

- 태그는 &lt;ev-chart&gt;(이하 <차트>)으로 정의

```
<ev-chart
    :data="차트데이터"
    :options="차트속성"
    :resize-timeout="debounce wait시간(단위: ms)"
    @drag-select="callback_function"
/>
```

>## Props
>
### 1. v-model:selectedItem

- option에서 [selectItem](#selectitem) 옵션을 사용할 경우 유효한 바인딩
- 현재 선택된 Item에 대한 정보 (seriesID, dataIndex)

#### Example

```
const selectedItem = ref({
    seriesID: 'series1', // Series ID (key)
    dataIndex: 0, // 몇번째 데이터인지
});
```

### 2. v-model:legend-data

- option에서 [legend](#legend)의 `external`이 `true`일 때 유효한 바인딩
- 차트 내부에 범례를 그리지 않고, 바인딩한 배열로 외부에서 범례를 렌더링할 때 사용
- 차트가 갱신될 때마다 `{ sId, name, color, type, show }` 형태의 범례 아이템 배열로 갱신됨
- 외부 범례에서 클릭/호버 시 ref로 노출되는 `toggleSeries(sId)`, `highlightSeries(sId)`, `unhighlightSeries()` 메서드 사용

#### Example

```
const legendItems = ref([]);
// legendItems[i]: { sId: string, name: string, color: string, type: string, show: boolean }
<ev-chart
  ref="chartRef"
  v-model:legend-data="legendItems"
  :options="{ legend: { show: true, external: true } }"
  ...
/>
```

### 3. data

  | 이름 | 타입 | 디폴트 | 설명 | 종류 |
  |------------ |-----------|---------|-------------------------|---------------------------------------------------|
  | series | Object | {} | 특정 데이터에 대한 시리즈 옵션 |  |
  | data   | Object | {} | 차트에 표시할 시리즈 별 데이터 |  |

#### series

  | 이름 | 타입 | 디폴트 | 설명 | 종류(예시) |
  |------------ |-----------|---------|-------------------------|---------------------------------------------------|
  | name | String | series-${index} | 특정 데이터에 대한 시리즈 옵션 |  |
  | type | String | 'bar' | 시리즈에 해당하는 데이터 표현 방식 | 'bar', 'pie', 'line', 'scatter' |
  | color | Hex, RGB, RGBA Code(String) | COLOR[index] | 점(Point) 바깥쪽 색상. 사전에 정의된 16개 색상('#2b99f0' ~ '#df6264)을 순차적으로 적용 |  |
  | pointFill | Hex, RGB, RGBA Code(String) | COLOR[index] | 점(Point) 안쪽 색상. 사전에 정의된 16개 색상('#2b99f0' ~ '#df6264)을 순차적으로 적용 |  |
  | pointSize | Number | 3 | 차트에 표시될 점의 사이즈 |  |
  | pointStyle | String | 'circle' | 차트에 표시될 점의 모양 | 'triangle', 'rect', 'rectRounded', 'rectRot', 'cross', 'crossRot', 'star', 'line' |

#### data example

```
const time = dayjs().format('YYYY-MM-DD HH:mm:ss');
const chartData =
  series: {
    series1: { name: 'series1', pointSize: 5, pointStyle: 'circle' },
    series2: { name: 'series2', pointSize: 6, pointStyle: 'rect' },
  },
  data: {
    series1: [{ x: dayjs(time), y: 1 }, { x: dayjs(time).add(1, 'day'), y: 2 }, { x: dayjs(time).add(2, 'day'), y: 3 }],
    series2: [{ x: dayjs(time), y: 4 }, { x: dayjs(time).add(1, 'day'), y: 5, color: '#FF0000' }],
  },
};
```

### 4. options

  | 이름 | 타입 | 디폴트 | 설명 | 종류(예시) |
  |------------ |-----------|---------|-------------------------|---------------------------------------------------|
  | type | String | '' | series 별로 type값을 지정하지 않을 경우 일괄 적용될 차트의 타입 | 'bar', 'pie', 'line', 'scatter' |
  | width | String / Number | '100%' | 차트의 너비 | '100%', '150px', 150 |
  | height | String / Number | '100%' | 차트의 높이 | '100%', '150px', 150 |
  | axesX | Object | 없음 | X축에 대한 속성 | [상세](#axesx-axesy) |
  | axesY | Object | 없음 | Y축에 대한 속성 | [상세](#axesx-axesy) |
  | title | Object | ([상세](#title)) | 차트 상단에 위치할 차트 제목 표시 여부 및 속성 |  |
  | legend | Object | ([상세](#legend)) | 차트의 범례 표시 여부 및 속성 |  |
  | annotations | Array | ([상세](#annotation)) | 차트 위에 표시할 어노테이션/뱃지 목록 | |
  | dragSelection | Object | ([상세](#dragselection)) | drag-select의 사용 여부 | |
  | padding | Object | { top: 20, right: 2, left: 2, bottom: 4 } | 차트 내부 padding 값 |
  | tooltip | Object | ([상세](#tooltip)) | 차트에 마우스를 올릴 경우 툴팁 표시 여부 및 속성 | |
  | plot | Object | ([상세](#plot)) | plotLines/plotBands(임계선·밴드)의 표시 z-order 전역 설정 | |
  | selectItem | Object | ([상세](#selectitem)) | 차트 아이템 선택 기능 활성화 여부 및 속성 | |
  | displayOverflow | Boolean | false | range로 설정한 y축 범위 이상의 값 표시 여부 | |
  | realTimeScatter | Object | ([상세](#realtimescatter)) | 실시간으로 데이터를 처리하는 real time scatter로 변경 여부 및 속성 | |
  | seriesReverse | Boolean | false | 시리즈 순서 반대로 표시 여부 | |
  | coordinateDedupe | Boolean | true | 좌표 중복 제거 여부 | |
  | eventBehavior | Object | ([상세](#eventbehavior)) | 이벤트별 동작 설정 | | 

#### axesX axesY

##### type 공통

  | 이름 | 타입 | 디폴트 | 설명 | 종류(예시) |
  |------------ |-----------|---------|-------------------------|---------------------------------------------------|
  | type | String | | 축의 유형 | [time](#time-type), [linear](#linear-type) |
  | showAxis | Boolean | true | 축 표시 여부 | true / false |
  | startToZero | Boolean | false | 축의 시작을 0 부터 시작할지의 여부 | true / false |
  | autoScaleRatio | Number | null | Axis의 Max Buffer를 위한 속성 | 0.1 ~ 0.9 |
  | showGrid | Boolean | true | 차트 내부 그리드 표시 여부 | true / false |
  | axisLineWidth  | Number | 1 | 축의 선 굵기 | 1 ~ |
  | axisLineColor | String | '#C9CFDC' | 축의 색상 | |
  | gridLineColor | String | '#C9CFDC' | 그리드의 색상 | |
  | interval | String | null | 축에 표시되는 값의 간격 단위 (ex. 'day', 'hour', 'minute'...)
  | labelStyle | Object | ([상세](#labelstyle)) | 라벨의 폰트 스타일을 설정 | |
  | firstLabelFontStyle | Object | null | 첫 번째 라벨의 폰트 스타일을 설정 | |
  | lastLabelFontStyle | Object | null | 마지막 라벨의 폰트 스타일을 설정 | |
  | plotLines | Array | ([상세](#plotline)) | plot line(임계선 표시 용도) 설정 | |
  | plotBands | Array | ([상세](#plotband)) | plot band(임계영역 표시 용도) 설정 | |
  | formatter      | function | null                | 데이터가 표시되기 전에 데이터의 형식을 지정하는 데 사용                   | (value, { prev, isDefaultMaxSameAsMin }) => value + '%' |
  | title | Object | ([상세](#title)) | 라벨의 폰트 스타일을 설정 | |
  | showAxisTick   | Boolean   | true    | 보조 눈금 표시 여부                                     |                                                         |
  | fixedSteps  | Boolean  | false    | range와 interval로 설정한 값을 그대로 사용하여 step을 고정. 자동 스케일 조정을 비활성화하며, 원하는 간격으로 축을 표시할 때 사용  | |
  | scaleChange | Boolean  | false    | scale 변경을 감지하여 emit 발생시킬때 사용, true일때 scale이 변경되면 axes-scale-range 이벤트가 발생된다. | | 

##### axesX

| 이름 | 타입 | 디폴트 | 설명 | 종류(예시) |
|-----|------|-------|-----|-----|
| flow | boolean | false | 시간에 따라 x축 label이 움직일지의 여부, time type에서만 사용하길 권장.<br>categoryMode일 때는 작동하지 않음. | |

##### time type

- interval (Axis Label 표기를 위한 interval)
  - 'millisecond', 'second', 'minute', 'hour', 'day', 'week' ,'month', 'quarter', 'year'
- timeFormat
  - dayjs의 timeFormat 이용 [참고URL](https://day.js.org/docs/en/parse/string-format)
- flow
  - 시간에 따라 x축 label이 움직일지의 여부
  - categoryMode일 때는 작동하지 않음.

##### linear type

- interval (Axis Label 표기를 위한 interval)
  - 미지정 시 Chart 내부에서 해당 Axis 데이터의 max/min value를 기반으로 interval을 구함
- Linear Type의 Axis Label은 각 숫자 단위에 맞춰 'K', 'M', 'G'로 숫자를 변환하여 보여줌
  - 예를 들어, Label에 필요한 값이 1,500일 경우 '1.5K'로 표기
  -

##### labelStyle

| 이름 | 타입 | 디폴트 | 설명 | 종류(예시) |
|-----|------|-------|-----|-----|
| show | Boolean | true | label 표시 여부 | true / false |
| fontSize | Number | 12 | 글자 크기 | |
| color | Hex, RGB, RGBA Code(String) | '#25262E' | 글자 색상 | |
| fontFamily | String | 'Roboto' | 폰트 | |
| fitWidth | Boolean | false | Label Text Ellipsis 처리 | |
| fitDir | String | 'right' | Ellipsis 방향 | ( right => 'aaa...', left => '...aaa') |
| padding |  Number | 0 | (X축, linear, time타입에만 해당) label의 좌우 여백 | 0 |

##### title

| 이름 | 타입 | 디폴트 | 설명 | 종류(예시) |
|-----|------|-------|-----|-----|
| use | Boolean | false | Chart 축(Axis) Title 표시 여부 | true / false |
| text | String | null | Title 로 표시될 text | |
| fontSize | Number | 12 | 글자 크기 | |
| fontWeight | Number | 400 | 글자 굵기 | 100, 200, 300, ... 900 |
| fontFamily | String | 'Roboto' | 폰트 | |
| fontStyle | String | 'normal' | 폰트 스타일 | 'normal', 'italic' |
| textAlign | String | 'right' | 텍스트 정렬| 'right', 'left', 'center' |
| color | Hex, RGB, RGBA Code(String) | '#25262E' | 글자 색상 | |

##### plotLine

| 이름 | 타입 | 디폴트 | 설명 | 종류(예시) |
|-----|------|-------|-----|-----|
| value | Number(value), Date, Number(Index) | null | 선을 표시할 위치에 해당하는 값 | 3000, <br> new Date(), <br> 1 (축의 타입이 'step'인 경우 1번째 요소) |
| color | Hex, RGB, RGBA Code(String) | '#FF0000' | 선 색상 | |
| segments | Array | null | dash 간격 | [6, 2] |
| lineWidth | Number | 1 | 선 굵기 |  |
| label | Object | null | 표시할 label의 스타일을 정의 | ([상세](#plotlabel)) |

> `value`가 `0`이어도 선·라벨이 표시됩니다.

##### plotBand

| 이름 | 타입 | 디폴트 | 설명 | 종류(예시) |
|-----|------|-------|-----|-----|
| from | Number(value), Date, Number(Index) | null | 박스를 표시할 시작 위치에 해당하는 값 | 3000, <br> new Date(), <br> 1 (축의 타입이 'step'인 경우 1번째 요소) |
| to | Number(value), Date, Number(Index) | null | 박스를 표시할 종료 위치에 해당하는 값 | 3000, <br> new Date(), <br> 1 (축의 타입이 'step'인 경우 1번째 요소) |
| color | Hex, RGB, RGBA Code(String) | '#FF0000' | 박스(면) 배경 색상. `rgba(...)`로 투명도 지정 | |
| border | Object \| null | null | 밴드 start/end 모서리 stroke | ([상세](#plotbandborder)) |
| label | Object | null | 표시할 label의 스타일을 정의 | ([상세](#plotlabel)) |

> - `from`/`to`가 `0`이어도 표시됩니다.
> - `label.showValue: true`이면 `from`·`to` 양 끝에 각각 값 라벨이 자동 바깥배치로 표시됩니다.

###### plotBandBorder

| 이름 | 타입 | 디폴트 | 설명 | 종류(예시) |
|-----|------|-------|-----|-----|
| color | Hex, RGB, RGBA Code(String) | - | 모서리 선 색상 | |
| width | Number | - | 모서리 선 굵기 | |
| segments | Array\<number> | - | dash 간격(점선) | [2, 2] |

##### plotLabel

| 이름 | 타입 | 디폴트 | 설명 | 종류(예시) |
|-----|------|-------|-----|-----|
| show | Boolean | false | label 표시 여부 | true / false |
| text | String \| null | null | 라벨 텍스트(=alias). `showValue: false`면 이 값을 그대로 표시 | |
| showValue | Boolean | false | `true` → `"{text} {value}"` 합성(value는 해당 축 formatter 적용) | true / false |
| fontSize | Number | 12 | 폰트 크기 | |
| fontColor | Hex, RGB, RGBA Code(String) | '#FF0000' | 폰트 색상 | |
| fillColor | Hex, RGB, RGBA Code(String) | '#FFFFFF' | 박스 배경 색상. `rgba(...)`로 투명도 지정 가능 | |
| lineColor | Hex, RGB, RGBA Code(String) | '#FF0000' | 박스 테두리 선 색상 | |
| lineWidth | Number | 0 | 테두리 선 굵기 | 1 ~ |
| fontWeight | Number | 400 | 폰트 굵기 |  |
| fontFamily | String | 'Roboto' | 폰트 스타일 |  |
| position | String | 'outside' | (Y축) 가로 배치. plot 밖 우측 / 안쪽 좌·우 | 'outside', 'innerStart', 'innerEnd' |
| textAlign | String | 'center' | 수평 정렬 | 'left', 'center', 'right' |
| verticalAlign | String | 'middle' | 수직 정렬 | 'top', 'middle', 'bottom' |
| borderRadius | Number | 0 | 라벨 박스 모서리 반경(px) | |
| gap | Number \| null | null | 임계선/임계영역과 라벨 박스 사이 간격(px). `null`이면 자동(fontSize 기준) | |
| padding | Number \| Object | null | 박스 안쪽 여백. 숫자 또는 `{ top, right, bottom, left }`. `null`이면 `fontSize/4` | 6, <br> { top: 4, bottom: 2 } |
| pointer | Object | ([상세](#pointer)) | 말풍선 꼬리 | |
| responsive | Object | ([상세](#responsive)) | plot 너비 기준 단계 축약 | |
| showTextOnHover | Object | ([상세](#showtextonhover)) | value-only 상태에서 hover 시 text tooltip | |
| textOverflow | String | 'none' | 라벨을 넣을 수 있는 여백 혹은 maxWidth 값을 넘었을 경우의 처리방안  | 'none', 'ellipsis' |
| maxWidth | Number | null | 라벨의 최대 너비  |  |

> - 배경 opacity는 별도 옵션 없이 `fillColor`에 `rgba(...)`를 주면 적용됩니다.
> - X축(세로선/세로밴드) 라벨은 `position`·`verticalAlign`을 무시하고 **항상 plot 상단(top) 고정**, `textAlign`으로만 정렬됩니다.

###### pointer

| 이름 | 타입 | 디폴트 | 설명 | 종류(예시) |
|-----|------|-------|-----|-----|
| show | Boolean | false | 말풍선 꼬리 표시 여부(방향은 배치 기준 자동) | true / false |
| color | Hex, RGB, RGBA Code(String) \| null | null | 꼬리 색상. `null`이면 박스 배경색(`fillColor`) | |

###### responsive

plot 너비(넓음→좁음) 기준 단계 축약. 둘 다 `null`이면 항상 풀(text+value) 표시.

| 이름 | 타입 | 디폴트 | 설명 | 종류(예시) |
|-----|------|-------|-----|-----|
| valueOnlyBelow | Number \| null | null | plot 너비 < 이 값 → **value만** 표시 | 400 |
| hideBelow | Number \| null | null | plot 너비 < 이 값 → **라벨 미노출**(본체는 유지) | 200 |

| 구간 | 표시 |
|-----|-----|
| 너비 ≥ `valueOnlyBelow` | text + value |
| `hideBelow` ≤ 너비 < `valueOnlyBelow` | value 만 |
| 너비 < `hideBelow` | 라벨 미노출 |

###### showTextOnHover

value-only 상태에서 alias(text)가 가려지므로 hover로 보완(데스크탑 전용).

| 이름 | 타입 | 디폴트 | 설명 | 종류(예시) |
|-----|------|-------|-----|-----|
| use | Boolean | false | 활성 여부 | true / false |
| backgroundColor | String | '#4C4C4C' | 배경 색상 | |
| fontColor | String | '#FFFFFF' | 폰트 색상 | |
| borderColor | String \| null | null | 테두리 색상. `null`이면 `backgroundColor`와 동일 → 테두리 미표시 | |
| borderRadius | Number | 4 | 모서리 반경 | |
| fontSize | Number | 12 | 폰트 크기 | |
| fontWeight | Number | 400 | 폰트 굵기 | |
| fontFamily | String | 'Roboto' | 폰트 패밀리 | |
| useShadow | Boolean | false | 그림자 사용 | true / false |
| shadowOpacity | Number | 0.25 | 그림자 투명도 | |
| padding | Object | { top: 4, right: 8, bottom: 4, left: 8 } | 안쪽 여백 | |

#### title

| 이름 | 타입 | 디폴트 | 설명 | 종류(예시) |
| --- | ---- | ----- | --- | ----------|
| show | Boolean | false | 타이틀 표시 여부 | true /false |
| height | Number | 40 | 타이틀 영역이 높이 | |
| text | String | '' | 타이틀 | |
| style | Object | | 타이틀 폰트 스타일 | |
| style.fontSize | Number | 15 | 글자 크기 | |
| style.color | Hex, RGB, RGBA Code(String) | '#000' | 글자 색상 | |
| style.fontFamily | String | 'Roboto' | 글자체 | |

#### legend

| 이름 | 타입 | 디폴트 | 설명 | 종류(예시) |
| --- | ---- | ----- | --- | ----------|
| show | Boolean | false | Legend 표시 여부 | true /false |
| position | String | 'right' | Legend 위치 | 'top', 'right', 'bottom', 'left' |
| color | Hex, RGB, RGBA Code(String) | '#353740' | 폰트 색상 | |
| inactive | Hex, RGB, RGBA Code(String) | '#aaa' | 비활성화 상태의 폰트 색상 | |
| width | Number | 140 | Legend의 넓이 *('left', 'right'의 경우 조절)* | |
| height | Number | 24 | Legend의 높이 *('top', 'bottom'의 경우 조절)* | |
| padding | Object | { top: 0, right: 0, left: 0, bottom: 0 } | Legend 내부 padding 값 | |
| allowResize | Boolean | false | Legend 영역 리사이즈 가능 여부 | |
| stopClickEvt  | Boolean | false | Legend 표시 여부 | true /false |
| virtualScroll | Boolean | false | Legend에 가상 스크롤 적용 여부 | true /false |
| clickMode     | 'active' \| 'inactive' | 'active' | Legend 클릭 시 활성화 여부 | |
| external      | Boolean | false | 범례를 차트 외부에서 렌더링할지 여부. true이면 차트 내부에 범례를 그리지 않고, `v-model:legend-data`로 전달된 배열을 외부에서 렌더링할 수 있음. ref로 `toggleSeries(sId)`, `highlightSeries(sId)`, `unhighlightSeries()` 사용 | true / false |

#### dragSelection

| 이름 | 타입 | 디폴트 | 설명 | 종류(예시) |
| --- | ---- | ----- | --- | ----------|
| use | Boolean | false | drag-select 사용 여부 | true / false |
| keepDisplay | Boolean | true | 드래그 후 선택영역 유지 여부  | true / false  |
| size | number | 50 | 모바일에서 선택 영역 크기 | only mobile |
| fillColor | Hex, RGB, RGBA Code(String) | '#38ACEC' | 선택 영역 색상 | |
| opacity | Number | 0.65 | 선택 영역 불투명도 | 0 ~ 1 |
| startArea | String (CSS Selector) | '' | drag-select를 시작할 수 있는 영역의 CSS 셀렉터. 차트의 조상 요소에서 탐색하며, 미지정하거나 일치하는 조상이 없으면 캔버스 안에서만 시작할 수 있습니다. 여러 차트를 사용할 때는 차트마다 고유한 셀렉터를 지정하세요(공통 조상을 지정하면 한 번의 드래그가 모든 차트의 selection을 트리거합니다). | '.chart-wrapper' |
| displayFromStartArea | Boolean | false | (scatter, PC 전용) 드래그 선택 영역을 캔버스 가장자리가 아니라 `startArea`에서 드래그를 시작한 지점부터 표시합니다. `startArea`가 지정되어야 동작합니다. 선택되는 데이터·`drag-select` range 페이로드는 영향받지 않고 화면 표시만 달라집니다. | true / false |

- PC버전에서는 drag, Mobile에서는 touch로 선택 영역을 지정할 수 있습니다.
- `startArea`를 지정하면 캔버스 바깥(지정한 영역 내부)에서 드래그를 시작해도 포인터가 캔버스에 진입하는 순간 선택이 시작됩니다.
- `displayFromStartArea`를 `true`로 지정하면 `startArea`를 덮는 전용 캔버스(`pointer-events: none`)에 선택 영역을 그려, 드래그를 시작한 지점부터 사각형이 표시됩니다. 이때 `startArea` 요소가 `position: static`이면 라이브러리가 자동으로 `position: relative`로 설정하고 차트 destroy 시 원복합니다.

#### tooltip

| 이름                  | 타입                          | 디폴트       | 설명                                   | 종류(예시)                                                              |
|---------------------|-----------------------------|-----------|--------------------------------------|---------------------------------------------------------------------|
| use                 | Boolean                     | false     | tooltip 표시 여부                        | true /false                                                         |
| backgroundColor     | Hex, RGB, RGBA Code(String) | '#4C4C4C' | tooltip 배경 색상                        |                                                                     |
| borderColor         | Hex, RGB, RGBA Code(String) | '#666666' | tooltip 테두리 색상                       |                                                                     |
| useShadow           | Boolean                     | false     | 그림자 사용 여부                            |                                                                     |
| shadowOpacity       | Number                      | 0.25      | 그림자 투명도                              |                                                                     |
| throttledMove       | Boolean                     | true      | 데이터 조회 Throttling 처리 유무              |                                                                     |
| debouncedHide       | Boolean                     | false     | 좌표 이동 시 tooltip hide 여부              |                                                                     |
| sortByValue         | Boolean                     | true      | 값을 기준으로 정렬할지의 여부                     |                                                                     |
| useScrollbar        | Boolean                     | false     | 스크롤바 사용 여부                           |                                                                     |
| htmlScrollTarget    | String                      |           | `formatter.html` 커스텀 툴팁에서 휠 스크롤을 전달할 내부 요소의 CSS 셀렉터 (가상 스크롤 활성 시에는 자동 처리되어 불필요) | '.ev-chart-tooltip-custom__body' |
| maxHeight           | Number                      |           | 툴팁의 최대 높이                            |                                                                     |
| maxWidth            | Number                      |           | 툴팁의 최대 너비                            |                                                                     |
| textOverflow        | String                      | 'wrap'    | 툴팁에 표시될 텍스트가 maxWidth 값을 넘길 경우 의 처리  | 'wrap', 'ellipsis'                                                  |
| fontFamily          | String                      | 'Roboto'  | 툴팁에 표시될 폰트                           | 'Roboto', 'serif'                                                   |
| fontColor           | Hex code (string), Object, Function   | '#000000' | 툴팁에 표시될 폰트 컬러                        | '#FFFFFF', { label: '#FFFFFF', value: '#FFFFFF', 'title: #FFFFFF' } |
| fontSize            | Object                      | { title: 16, contents: 14 } | 툴팁에 표시될 폰트 사이즈  | |
| colorShape | String | 'rect' | 툴팁에 표시될 series color의 모양 | 'rect', 'circle' |
| showAllValueInRange | Boolean                     | false     | 동일한 axes값을 가진 전체 series를 Tooltip에 표시 |
| formatter           | function / Object           | null      | 데이터가 표시되기 전에 데이터의 형식을 지정하는 데 사용      | (아래 코드 참고)                                                          |
| returnValue         | function                    | null                                       | 외부 컴포넌트 커스텀 툴팁을 구현할 때 사용하는 함수                 | (아래 코드 참고)                                                    |
| virtualScroll       | Object                      | { use: 'auto', threshold: 50, estimatedRowHeight: 28, overscan: 5 } | `formatter.html` 사용 시 가상 스크롤로 보이는 행만 라이브 DOM에 부착. 시리즈당 wrapper element에 `data-evui-tooltip-row` 속성을 부여하면 안정적으로 활성화됨 | use: 'auto' \| true \| false |

```ts
const chartOptions = {
    tooltip: {
        // 이전 버전 호환용으로 valueFormatter를 이전버전과 같이 사용 가능
        // return type : string
        formatter: ({ x, y, name, seriesId }) => ... ,

        // 새로운 버전
        // return type : string
        formatter: {
            value: ({ x, y, name, seriesId }) => ...,
        }

        // custom formatter (html)
        // return type : string
        // 주의: 사용하시는 방법에 따라 차트의 성능이 저하될 수 있습니다.
        formatter: {
            html: (seiresList) =>  `<div class="customClass">${seriesList[0].name} : ${seriesList[0].data.y}</div>`
        }

        // returnValue function
        // return type : void
        // 커스텀 툴팁을 구현할 때 사용하는 함수
        returnValue: (seriesList, event) => {
            // seriesList: Array<SeriesItem>
            // event: MouseEvent
        }
    },
}
```

> **`formatter.html` 마크업 안내**
> - 반환하는 HTML의 **루트 element**가 툴팁 본문으로 부착되며, 위치/크기 계산도 이 루트를 기준으로 합니다. 루트 element는 1개여야 합니다.
> - `ev-chart-tooltip-custom`(및 `__header`, `__body`) 클래스는 **선택**입니다. 사용하면 EVUI 기본 스타일과 휠 스크롤 기본 타겟(`htmlScrollTarget: '.ev-chart-tooltip-custom__body'`)이 자동 적용됩니다.
> - 직접 마크업/클래스를 사용하는 경우, 스크롤이 필요하면 `htmlScrollTarget`을 해당 스크롤 요소의 셀렉터로 지정하세요.

#### returnValue

| 이름 | 타입 | 설명 | 종류(예시) |
| --- | --- | --- | --- |
| seriesList | Array<SeriesItem> | 마우스 위치에 해당하는 시리즈 데이터 배열 | |
| event | MouseEvent | 마우스 이벤트 객체 | |

  - SeriesItem
    | 이름 | 타입 | 설명 | 종류(예시) |
    | --- | --- | --- | --- |
    | sId | String | 시리즈 ID | 'series1' |
    | data | Object | 시리즈 데이터 | { x: Date, y: Number, xp: Number, yp: Number, o: Number } |
    | color | String | 시리즈 색상 | '#2b99f0' |
    | name | String | 시리즈 이름 | 'Series 1' |
    | dataId | String | 데이터 ID | 'data_1' |
    | index | Number | 데이터 인덱스 | 0 |

#### plot

plotLines/plotBands(임계선·밴드)의 표시 순서(z-order) 전역 설정. maxTip 은 항상 최상단입니다.

| 이름 | 타입 | 디폴트 | 설명 | 종류(예시) |
|-----|------|-------|-----|-----|
| aboveSeries | Boolean | true | 임계선/밴드를 series 위(true)에 그릴지, 아래(false)에 그릴지 | true / false |

- `true`(기본): `maxTip > plot > series`
- `false`: `maxTip > series > plot` (임계선/밴드가 데이터 시리즈 뒤로 깔림)

#### selectItem

| 이름 | 타입 | 디폴트 | 설명 | 종류(예시) |
| --- | ---- | ----- | --- | ----------|
| use | Boolean | false | 차트 아이템 선택 기능  | |
| showTextTip | Boolean | false | 선택한 위치의 TextTip(text 포함 화살표, 흡사 말풍선) 생성 여부  | |
| tipText | String | 'value' | 선택한 위치에 TextTip을 생성한다면 어떤 값  | 'value', 'label |
| showTip | Boolean | false | 선택한 위치의 Tip(화살표) 생성 여부  | |
| showIndicator | Boolean | false | 선택한 label의 indicator 표시  | |
| fixedPosTop | Boolean | false | indicator 및 tip의 위치를 최대값으로 고정  | |
| useApproximateValue | Boolean | false | 가까운 label을 선택  | |
| indicatorColor | Hex, RGB, RGBA Code(String) | '#000000' | indicator 색상  | |
| tipStyle | Object | ([상세](#tipstyle)) | tip 스타일을 설정
| useSeriesOpacity | Boolean | false | 선택한 항목을 제외한 나머지 항목들에 반투명 효과 적용 여부  | |

#### realTimeScatter

| 이름 | 타입 | 디폴트 | 설명 | 종류(예시) |
| --- | ---- | ----- | --- | ----------|
| use | Boolean | false | 실시간 데이터 처리 여부  | |
| range | Number | 300 | 현재 시간을 기점으로 초단위로 범위 설정 | 300일 경우: -5분 ~ 현재 |

- [axesX](#axesx-axesy)의 type(축의 유형)이 'time'이여야 합니다.

- 페이지단에서 chartData를 shallowRef / shallowReactive로 선언해야 합니다.

##### 개별 series 자동 만료 (기본 동작)

가시 범위 밖으로 완전히 밀려나고 신규 점도 끊긴 **개별 series** 는 누적 저장소·범례에서 **자동 제거**됩니다. 별도 옵션 없이 realTimeScatter 의 기본 동작이며, 누적 데이터가 무한정 쌓이는 것을 막습니다.

- 제거 조건(AND, 만족하는 즉시 제거):
  - **(a)** 해당 series 가 현재 가시 X축 범위 `[xMax - range, xMax]` 안에 점이 하나도 없음.
  - **(b)** 이번 수신 `:data` 틱에 그 series 의 신규 점이 없음(이번 틱에 점을 보낸 series 는 보존).
- "series 키 부재"로 판정하지 않습니다 — 죽은 series 키가 `data.series` 에 계속 남아 있어도, 위 (a)+(b)로만 판정합니다.
- 제거된 series 는 신규 점이 다시 들어오면 자동으로 부활(재생성)합니다.
- `v-model:realTimeScatterReset`(전체 초기화)과 독립적으로 동작합니다.

##### etc

| 이름    | 타입   | 디폴트 | 설명 | 종류(예시) |
| ------ | ------ | ---- | -----| --------- |
| tipBackground | Hex, RGB, RGBA Code(String) | '#000000' | maxTip 배경색상  | |
| tipTextColor | Hex, RGB, RGBA Code(String) | '#FFFFFF' | maxTip 글자 색상  | |

#### eventBehavior

이벤트별 동작을 설정하는 옵션 객체.

| 이름         | 타입   | 디폴트   | 설명                                                                 | 종류(예시)           |
| ----------- | ------ | -------- | -------------------------------------------------------------------- | -------------------- |
| legendClick | String | 'update' | 범례 클릭 시 동작. 'update': 차트 즉시 갱신, 'emitOnly': click-legend만 emit(이중 렌더 방지) | 'update' \| 'emitOnly' |

- 3.4 버전부터 없어지는 옵션입니다.

##### tipStyle

| 이름    | 타입   | 디폴트 | 설명 | 종류(예시) |
| ------ | ------ | ---- | -----| --------- |
| height | Number | 20 | tip 높이 | |
| background | Hex, RGB, RGBA Code(String) | '#000000' | maxTip 배경색상  | |
| textColor | Hex, RGB, RGBA Code(String) | '#FFFFFF' | maxTip 글자 색상  | |
| fontSize  | Number | 14 | tip 폰트 크기 | |
| fontFamily | String | 'Roboto' | tip 폰트 | |
| fontWeight | Number | 400 | tip 폰트 굵기 | 100, 200, 300, ... 900 |

### 4. resize-timeout

- Default : 0
- debounce 사용. 연속으로 이벤트가 발생한 경우, 마지막 이벤트가 끝난 시점을 기준으로 `주어진 시간 (resize-timeout)` 이후 콜백 실행

### 5. Event

| 이름 | 파라미터 | 설명 |
 |------|----------|------|
 | mouse-move |              | 커서의 현재 location 과 axes에 있을 경우 labelIdx, labelVal 과 데이터 영역에 있을 경우 dataIdx, maxDataVal 과 labelVal 또는 maxDataVal를 가공하기 전의 originVal 값을 반환                                                                                                                                 |
 | drag-select | data, range | 그래프에서 드래그를 해서 선택영역 안의 데이터와 선택영역에 대한 범위 값을 얻을 수 있다. <br><br> ex) data : [{ seriesName, seriesId, items: [] }, {...}, {...}] <br> ex) range : { xMin, xMax, yMin, yMax } <br><br> data의 요소 propery중 items 는 해당 Series의 데이터 들이 있으며 x, y값은 데이터 기반 <xp, yp 는 Canvas기반의 좌표 값 |
| click-legend | e, data      | 범례를 클릭했을 때 발생하는 이벤트. 클릭 후 활성화된 시리즈 ID 목록과 모두 활성 여부를 반환한다. <br><br> ex) e : 이벤트 객체 <br> ex) data : { seriesIds: ['series1', 'series2', ...], isActiveAll: false } <br><br> seriesIds는 현재 활성화(show: true)된 시리즈의 ID 배열이다. 단, 시리즈가 모두 활성화된다면 빈배열([])로 반환한다. |
| axes-scale-change | | 차트 사이즈를 변경하면 axes-scale-change 이벤트로 재계산된 minSteps, maxSteps를 정보를 반환한다. 단, axes옵션에 scaleRange가 true이고 scale 정보가 변경될때만 이벤트를 발생시킨다. ex)<br><br> {<br> x: [{ minSteps, maxSteps }], <br>   y: [{ minSteps, maxSteps }]<br>} | |
| axes-data-max-change | maxY | show 된 series 들의 **실제 데이터 y 최대값**(number)을 반환한다. axes-scale-change(라벨 스텝 개수)와 달리 데이터 값이다. 차트가 내부적으로 이미 계산한 series.minMax.maxY 를 재사용하므로 소비처가 동일 데이터를 따로 스캔해 max 를 구하지 않아도 된다. **차트 타입과 무관하게** 사용할 수 있으며, 이 이벤트를 바인딩한 경우에만 발생한다(바인딩 안 하면 집계 비용 0). 발생 시엔 렌더마다(같은 값이어도) 발생한다. 유효한(유한수) 데이터가 있는 show 된 series 가 하나도 없으면 — 보이는 series 가 없거나 모두 빈 데이터면 — null 을 emit 한다. 단, realTimeScatter 는 전 series 가 빈 데이터일 때 내부 minMax 가 0 으로 폴백되어 0 이 emit 된다. maxY 는 show 된 전 series 의 **통합 최대값(단일 y축·세로 차트 기준, 축 구분 없음)** 이라 다중 y축에서는 축별 구분이 되지 않는다. realTimeScatter autoScale 의 데이터 최대값 용도로 도입됐으나 line·bar 등 다른 차트에서도 동일하게 동작한다. |

- drag-select는  `dragSelection` 옵션의 `use`값이 `true` 일 때 이벤트를 발생 시킬 수 있다.
 그리고 선택영역은 그래프에 표시된 데이터의 중앙이 포함 되어야 선택영역 내 데이터로 인식 한다.

### 6. v-model:realTimeScatterReset

- realTimeScatter 옵션을 사용할 때, 내부 데이터를 모두 초기화하고 싶을 때 사용.
- realTimeScatterReset이 true가 되면 데이터를 모두 초기화하고 자동으로 false로 바뀜. 초기화하고 싶을 때마다 true로 바꿔주면 됩니다.

#### annotation

차트 위에 어노테이션/뱃지를 표시합니다. `options.annotations`에 **배열**로 지정하며, 배열 순서가 그리는 순서(z-order, 뒤 항목이 위)입니다. 어노테이션은 전용 레이어에 그려져 hover 하이라이트 위에 표시됩니다.

| 이름 | 타입 | 디폴트 | 설명 | 종류(예시) |
|------|------|--------|------|-----------|
| id | String | annotation-${index} | 식별/key 용도. 중복 시 콘솔 경고 | |
| type | String | 'text' | 어노테이션 외형 종류 | 'text', 'badge', 'callout', 'circle' |
| content | String \| Function | '' | 표시 텍스트(토큰/콜백 지원). circle은 무시 | [상세](#annotation-content) |
| position | Object | ([상세](#annotation-position)) | 위치 지정 방식 | |
| connector | Object | ([상세](#annotation-connector)) | 데이터 지점과 박스를 잇는 연결선(기본 비활성). callout은 무시 | |
| style | Object | type별 기본값 | 외형/말풍선/도형 속성 | [상세](#annotation-style) |

##### type 종류
- `text` : 배경/테두리 없는 순수 텍스트(라벨)
- `badge` : 배경 박스 + 라운딩을 가진 텍스트 뱃지
- `callout` : 데이터 지점을 가리키는 꼬리가 달린 말풍선
- `circle` : 텍스트 없는 강조용 원형 도형(`style.radius` 사용)

##### annotation position

위치 기준은 상호 배타적인 3가지 `type`으로 구분합니다.

| 이름 | 적용 type | 타입 | 디폴트 | 설명 |
|------|-----------|------|--------|------|
| type | 공통 | String | 'pixel' | 'axis' \| 'pixel' \| 'series' |
| offsetX | 공통 | Number | 0 | 기준점으로부터 X 오프셋(px) |
| offsetY | 공통 | Number | 0 | 기준점으로부터 Y 오프셋(px) |
| x | pixel | Number | 0 | canvas 좌상단(0,0) 기준 절대 X 좌표 |
| y | pixel | Number | 0 | canvas 좌상단(0,0) 기준 절대 Y 좌표 |
| xAxisIndex | axis | Number | 0 | 기준 X축 인덱스 |
| yAxisIndex | axis | Number | 0 | 기준 Y축 인덱스 |
| xValue | axis | Number \| String | null | X축 값(linear=숫자, time=숫자/날짜문자열, step=라벨/인덱스) |
| yValue | axis | Number \| String | null | Y축 값 |
| seriesId | series | String | null | 추적할 시리즈 id |
| location | series | String \| Number | 'end' | 추적 위치. 'start' \| 'end' \| 데이터 인덱스. 파이는 무시 |

- **이 차트의 `series` 기준점**: 데이터 포인트 중심
- **`axis` 위치**: 지원 (linear/time/step 축 값으로 지정)
- 기준점이 축 범위/줌 영역 밖이거나, 추적 `series`가 숨김 상태(`show: false`, 범례 토글 포함)이면 그리지 않습니다. `pixel`은 항상 표시됩니다.

##### annotation content

- 문자열: 그대로 표시
- 토큰 치환: `{xValue}` `{yValue}` `{seriesId}` `{seriesName}` `{dataIndex}` `{percentage}` (알 수 없는 토큰은 원문 유지)
- 콜백 `(ctx) => string` : `ctx = { xValue, yValue, seriesId, seriesName, dataIndex, percentage }` (`percentage`는 파이 전용, 그 외 null)
- `\n` 으로 멀티라인 지원

##### annotation connector

데이터 지점과 어노테이션 박스의 가장 가까운 경계를 잇는 선입니다.

| 이름 | 타입 | 디폴트 | 설명 | 종류 |
|------|------|--------|------|------|
| enabled | Boolean | false | 연결선 사용 여부 | |
| type | String | 'straight' | 선 모양 | 'straight', 'elbow' |
| style.stroke | String | '#9E9E9E' | 선 색상 | |
| style.strokeWidth | Number | 1 | 선 두께 | |
| style.dashStyle | String | 'solid' | 점선 스타일 | 'solid', 'dash', 'dot' |

> `callout`은 꼬리가 connector 역할을 하므로 connector를 켜도 자동으로 비활성화됩니다.

##### annotation style

text/badge/callout 공통 텍스트 속성과 type별 전용 속성을 `style` 하나로 통합합니다.

| 이름 | 타입 | 설명 | 적용 type |
|------|------|------|-----------|
| color | String | 글자 색 | text, badge, callout |
| backgroundColor | String | 배경 색('transparent' 가능) | 전체 |
| borderColor | String | 테두리 색 | 전체 |
| borderWidth | Number | 테두리 두께 | 전체 |
| borderRadius | Number | 모서리 둥글기 | text, badge, callout |
| padding | Number \| Array | 안쪽 여백. n / [상하,좌우] / [상,우,하,좌] | text, badge, callout |
| fontSize | String | 글자 크기(예: '11px') | text, badge, callout |
| fontWeight | String | 글자 굵기 | text, badge, callout |
| fontFamily | String | 글꼴 | text, badge, callout |
| textAlign | String | 정렬 | text, badge, callout |
| anchor | String | 꼬리 방향('auto'는 offset 방향으로 결정) | callout |
| arrowSize | Number | 꼬리 크기 | callout |
| radius | Number | 원 반지름 | circle |

**type별 style 기본값**

| 속성 | text | badge | callout | circle |
|------|------|-------|---------|--------|
| color | #212121 | #8B2323 | #212121 | - |
| backgroundColor | transparent | #FDF0F0 | #FFFFFF | rgba(178,76,76,0.15) |
| borderColor | transparent | #B24C4C | #B0B0B0 | #B24C4C |
| borderWidth | 0 | 1 | 1 | 1 |
| borderRadius | 0 | 6 | 4 | - |
| padding | [0,0] | [6,10] | [4,8] | - |
| fontSize | 11px | 11px | 11px | - |
| fontWeight | normal | normal | normal | - |
| textAlign | center | center | center | - |
| anchor | - | - | auto | - |
| arrowSize | - | - | 4 | - |
| radius | - | - | - | 10 |

> 실제 사용 예시는 상단의 **Annotations** 예제를 참고하세요.
