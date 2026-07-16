> ## Desc

- 태그는 &lt;ev-chart&gt;(이하 <차트>)으로 정의

```
<ev-chart
    :data="차트데이터"
    :options="차트속성"
    :resize-timeout="debounce wait시간(단위: ms)"
    @drag-select="callback_function"
/>
```

> ## Props

### 1. v-model:legend-data

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

### 2. data

| 이름   | 타입   | 디폴트 | 설명                           | 종류 |
| ------ | ------ | ------ | ------------------------------ | ---- |
| series | Object | {}     | 특정 데이터에 대한 시리즈 옵션 |      |
| data   | Object | {}     | 차트에 표시할 시리즈 별 데이터 |      |
| labels | Object | {}     | 축의 각 눈금에 해당하는 명칭   |      |

#### series

| 이름      | 타입   | 디폴트               | 설명                                     | 종류(예시) |
| --------- | ------ | -------------------- | ---------------------------------------- | ---------- |
| name      | String | series-\${index}     | 특정 데이터에 대한 시리즈 옵션           |            |
| showValue | Object | ([상세](#showvalue)) | 셀 위에 값 표시 여부 및 속성             |            |
| highlight | Object | ([상세](#highlight)) | 셀 위에 마우스 오버시 나타나는 효과 설정 |            |

#### showValue

| 이름         | 타입                        | 디폴트    | 설명                                                    | 종류(예시)                       |
| ------------ | --------------------------- | --------- | ------------------------------------------------------- | -------------------------------- |
| use          | Boolean                     | false     | data label 표시 여부                                    | true /false                      |
| textColor    | Hex, RGB, RGBA Code(String) | '#000000' | 글자 색상                                               |                                  |
| fontSize     | Number                      | 12        | 글자 크기                                               |                                  |
| align        | String                      | 'center'  | 글자 정렬                                               | 'top', 'right', 'bottom', 'left' |
| formatter    | function                    | null      | 데이터가 표시되기 전에 데이터의 형식을 지정하는 데 사용 | (value) => value + '%'           |
| decimalPoint | Number                      | 0         | 소수점 자릿수                                           |                                  |

- 글자 크기가 heatMap의 item의 크기를 벗어나게되면 그려지지 않습니다.

#### highlight

| 이름       | 타입         | 디폴트    | 설명            | 종류(예시) |
| ---------- | ------------ | --------- | --------------- | ---------- |
| stroke     | object       |           | 외곽선 스타일   |            |
| ㄴ use     | boolean      | false     | 외곽선 사용여부 |            |
| ㄴ color   | string, null | null      | 외곽선 색상     |            |
| ㄴ width   | number       | 1         | 외곽선 두께     |            |
| ㄴ radius  | number       | 0         | 외곽선 반경     |            |
| shadow     | object       |           | 그림자 스타일   |            |
| ㄴ use     | boolean      | true      | 그림자 사용여부 |            |
| ㄴ offsetX | number       | 0         | 그림자 offsetX  |            |
| ㄴ offsetY | number       | 0         | 그림자 offsetY  |            |
| ㄴ blur    | number       | 4         | 그림자 흐림정도 |            |
| ㄴ color   | string       | '#959494' | 그림자 색상     |            |

#### data example

```
const time = dayjs().format('YYYY-MM-DD HH:mm:ss');
const chartData =
  series: {
    series1: {
      name: 'series#1',
    },
  },
  data: {
    series1: [
      { x: 'Jan', y: '2018', value: 1 },
      { x: 'Jan', y: '2020', value: 2 },
      { x: 'Feb', y: '2019', value: 3 },
      { x: 'Feb', y: '2022', value: 4 },
      { x: 'May', y: '2021', value: 5 },
      { x: 'Jun', y: '2021', value: 6 },
      { x: 'Aug', y: '2021', value: 7 },
      { x: 'Aug', y: '2022', value: 8 },
    ],
  },
  labels: {
    x: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    y: ['2018', '2019', '2020', '2021', '2022'],
  },
};
```

### 3. options

| 이름          | 타입            | 디폴트                                    | 설명                                                            | 종류(예시)                      |
| ------------- | --------------- | ----------------------------------------- | --------------------------------------------------------------- | ------------------------------- |
| type          | String          | ''                                        | series 별로 type값을 지정하지 않을 경우 일괄 적용될 차트의 타입 | 'bar', 'pie', 'line', 'scatter' |
| width         | String / Number | '100%'                                    | 차트의 너비                                                     | '100%', '150px', 150            |
| height        | String / Number | '100%'                                    | 차트의 높이                                                     | '100%', '150px', 150            |
| axesX         | Object          | 없음                                      | X축에 대한 속성                                                 | [상세](#axesx-axesy)            |
| axesY         | Object          | 없음                                      | Y축에 대한 속성                                                 | [상세](#axesx-axesy)            |
| title         | Object          | ([상세](#title))                          | 차트 상단에 위치할 차트 제목 표시 여부 및 속성                  |                                 |
| legend        | Object          | ([상세](#legend))                         | 차트의 범례 표시 여부 및 속성                                   |                                 |
| annotations | Array | ([상세](#annotation)) | 차트 위에 표시할 어노테이션/뱃지 목록 | |
| dragSelection | Object          | ([상세](#dragselection))                  | drag-select의 사용 여부                                         |                                 |
| padding       | Object          | { top: 20, right: 2, left: 2, bottom: 4 } | 차트 내부 padding 값                                            |
| tooltip       | Object          | ([상세](#tooltip))                        | 차트에 마우스를 올릴 경우 툴팁 표시 여부 및 속성                |                                 |
| heatMapColor  | Object          | ([상세](#heatmap-color))                  | color 옵션                                                      |                                 |
| selectItem    | Object          | ([상세](#selectitem))                     | 차트 아이템 선택 기능 활성화 여부 및 속성                       |                                 |
| selectLabel   | Object          | ([상세](#selectlabel))                    | 차트 라벨 선택 기능 활성화 여부 및 속성                         |                                 |
| eventBehavior | Object          | ([상세](#eventbehavior))                  | 이벤트별 동작 설정 | | 

#### axesX axesY

##### type 공통

| 이름           | 타입          | 디폴트                    | 설명                                                                                           | 종류(예시)                                              |
| -------------- | ------------- | ------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| type           | String        |                           | 축의 유형                                                                                      | [time](#time-type)(categoryMode), [step](#step-type)    |
| showAxis       | Boolean       | true                      | 축 표시 여부                                                                                   | true / false                                            |
| startToZero    | Boolean       | false                     | 축의 시작을 0 부터 시작할지의 여부                                                             | true / false                                            |
| autoScaleRatio | Number        | null                      | Axis의 Max Buffer를 위한 속성                                                                  | 0.1 ~ 0.9                                               |
| showGrid       | Boolean       | true                      | 차트 내부 그리드 표시 여부                                                                     | true / false                                            |
| axisLineWidth  | Number        | 1                         | 축의 선 굵기                                                                                   | 1 ~                                                     |
| axisLineColor  | String        | '#C9CFDC'                 | 축의 색상                                                                                      |                                                         |
| gridLineColor  | String        | '#C9CFDC'                 | 그리드의 색상                                                                                  |                                                         |
| range          | Array         | null                      | 축에 표시할 값의 min, max (autoScaleRatio = null, startToZero = false 이여야 정상 표현됩니다.) | [time](#time-type), [step](#step-type)                  |
| interval       | String/number |                           | 축에 표시되는 값의 간격 단위 ( time: string / linear: number)                                  |                                                         |
| labelStyle     | Object        | ([상세](#label-style))    | 라벨의 폰트 스타일을 설정                                                                      |                                                         |
| firstLabelFontStyle | Object    | null                      | 첫 번째 라벨의 폰트 스타일을 설정                                                              |                                                         |
| lastLabelFontStyle | Object     | null                      | 마지막 라벨의 폰트 스타일을 설정                                                               |                                                         |
| formatter      | function      | null                      | 데이터가 표시되기 전에 데이터의 형식을 지정하는 데 사용                                        | (value, { prev, isDefaultMaxSameAsMin }) => value + '%' |
| title          | Object        | ([상세](#axes-title))     | 라벨의 폰트 스타일을 설정                                                                      |                                                         |
| scrollbar      | Object        | ([상세](#axes-scrollbar)) | 차트 축 스크롤 설정(range 옵션 설정되어 있어야 정상 동작합니다.)                               |                                                         |
| showAxisTick   | Boolean   | true    | 보조 눈금 표시 여부                                     |                                                         |

##### time type

- interval (Axis Label 표기를 위한 interval)
  - 'millisecond', 'second', 'minute', 'hour', 'day', 'week' ,'month', 'quarter', 'year'
- timeFormat
  - dayjs의 timeFormat 이용 [참고URL](https://day.js.org/docs/en/parse/string-format)
- categoryMode
  - 축에 표시할 시간 값을 `data`옵션의 `labels`속 값들로 표시할지의 여부
  - 축의 label을 축 line에 표시하고 싶은 경우 label style 옵션의 alignToGridLine을 true로 변경
- range
  - 축의 min 값, max 값을 array로 넘겨줌 ([0, 100])

##### step type

- range
  - 축의 label의 minIndex, maxIndex 값을 array로 넘겨줌 ([0, 5])

##### label style

| 이름            | 타입                        | 디폴트    | 설명                                                                       | 종류(예시)                             |
| --------------- | --------------------------- | --------- | -------------------------------------------------------------------------- | -------------------------------------- |
| show            | Boolean                     | true      | label 표시 여부                                                            | true / false                           |
| fontSize        | Number                      | 12        | 글자 크기                                                                  |                                        |
| color           | Hex, RGB, RGBA Code(String) | '#25262E' | 글자 색상                                                                  |                                        |
| fontFamily      | String                      | 'Roboto'  | 폰트                                                                       |                                        |
| fitWidth        | Boolean                     | false     | Label Text Ellipsis 처리                                                   |                                        |
| maxWidth        | Number                      | undefined | fitWidth이 true일 때, maxWidth까지 영역을 확장하고 그 이후로 Ellipsis 처리 |                                        |
| fitDir          | String                      | 'right'   | Ellipsis 방향                                                              | ( right => 'aaa...', left => '...aaa') |
| alignToGridLine | Boolean                     | false     | 축 line에 표시할지의 여부                                                  |                                        |

##### axes title

| 이름       | 타입                        | 디폴트    | 설명                           | 종류(예시)                |
| ---------- | --------------------------- | --------- | ------------------------------ | ------------------------- |
| use        | Boolean                     | false     | Chart 축(Axis) Title 표시 여부 | true / false              |
| text       | String                      | null      | Title 로 표시될 text           |                           |
| fontSize   | Number                      | 12        | 글자 크기                      |                           |
| fontWeight | Number                      | 400       | 글자 굵기                      | 100, 200, 300, ... 900    |
| fontFamily | String                      | 'Roboto'  | 폰트                           |                           |
| fontStyle  | String                      | 'normal'  | 폰트 스타일                    | 'normal', 'italic'        |
| textAlign  | String                      | 'right'   | 텍스트 정렬                    | 'right', 'left', 'center' |
| color      | Hex, RGB, RGBA Code(String) | '#25262E' | 글자 색상                      |                           |

##### axes scrollbar

| 이름          | 타입                        | 디폴트    | 설명                        | 종류(예시)                                    |
| ------------- | --------------------------- | --------- | --------------------------- | --------------------------------------------- |
| use           | Boolean                     | false     | 스크롤 사용 여부            | true / false                                  |
| width         | Number                      | 14        | 스크롤 넓이 (y축일 때 적용) |                                               |
| height        | Number                      | 14        | 스크롤 높이 (x축일 때 적용) |                                               |
| background    | Hex, RGB, RGBA Code(String) | '#F2F2F2' | 스크롤 track 배경 색상      |                                               |
| showButton    | Boolean                     | false     | 스크롤 버튼 표시 여부       | true / false                                  |
| thumbStyle    | Object                      |           | 스크롤 thumb 스타일 설정    | { <br> background: '#929292', radius: 0 <br>} |
| resetPosition | Boolean                     | false     | 스크롤 초기화 여부          | true / false                                  |

#### title

| 이름             | 타입                        | 디폴트   | 설명                  | 종류(예시)  |
| ---------------- | --------------------------- | -------- | --------------------- | ----------- |
| show             | Boolean                     | false    | 차트 타이틀 표시 여부 | true /false |
| height           | Number                      | 40       | 타이틀 영역이 높이    |             |
| text             | String                      | ''       | 타이틀                |             |
| style            | Object                      |          | 타이틀 폰트 스타일    |             |
| style.fontSize   | Number                      | 15       | 글자 크기             |             |
| style.color      | Hex, RGB, RGBA Code(String) | '#000'   | 글자 색상             |             |
| style.fontFamily | String                      | 'Roboto' | 글자체                |             |

#### legend

| 이름          | 타입                        | 디폴트                                   | 설명                                          | 종류(예시)                       |
| ------------- | --------------------------- | ---------------------------------------- | --------------------------------------------- | -------------------------------- |
| show          | Boolean                     | false                                    | Legend 표시 여부                              | true /false                      |
| type          | String                      | 'icon'                                   | Legend type 지정                              | 'icon', 'gradient'               |
| position      | String                      | 'right'                                  | Legend 위치                                   | 'top', 'right', 'bottom', 'left' |
| color         | Hex, RGB, RGBA Code(String) | '#353740'                                | 폰트 색상                                     |                                  |
| inactive      | Hex, RGB, RGBA Code(String) | '#aaa'                                   | 비활성화 상태의 폰트 색상                     |                                  |
| width         | Number                      | 140                                      | Legend의 넓이 _('left', 'right'의 경우 조절)_ |                                  |
| height        | Number                      | 24                                       | Legend의 높이 _('top', 'bottom'의 경우 조절)_ |                                  |
| padding       | Object                      | { top: 0, right: 0, left: 0, bottom: 0 } | Legend 내부 padding 값                        |                                  |
| allowResize   | Boolean                     | false                                    | Legend 영역 리사이즈 가능 여부                |                                  |
| stopClickEvt  | Boolean                     | false                                    | Legend 표시 여부                              | true /false                      |
| virtualScroll | Boolean                     | false                                    | Legend에 가상 스크롤 적용 여부                | true /false                      |
| clickMode     | 'active' \| 'inactive'      | 'active'                                 | Legend 클릭 시 활성화 여부                    |                                  |
| external      | Boolean                     | false                                    | 범례를 차트 외부에서 렌더링할지 여부. true이면 차트 내부에 범례를 그리지 않고, `v-model:legend-data`로 전달된 배열을 외부에서 렌더링할 수 있음. ref로 `toggleSeries(sId)`, `highlightSeries(sId)`, `unhighlightSeries()` 사용 | true / false                    |

#### dragSelection

| 이름        | 타입                        | 디폴트    | 설명                         | 종류(예시)   |
| ----------- | --------------------------- | --------- | ---------------------------- | ------------ |
| use         | Boolean                     | false     | drag-select 사용 여부        | true / false |
| keepDisplay | Boolean                     | true      | 드래그 후 선택영역 유지 여부 | true / false |
| fillColor   | Hex, RGB, RGBA Code(String) | '#38ACEC' | 선택 영역 색상               |              |
| opacity     | Number                      | 0.65      | 선택 영역 불투명도           | 0 ~ 1        |
| startArea   | String (CSS Selector)       | ''        | drag-select를 시작할 수 있는 영역의 CSS 셀렉터. 차트의 조상 요소에서 탐색하며, 미지정하거나 일치하는 조상이 없으면 캔버스 안에서만 시작할 수 있습니다. 여러 차트를 사용할 때는 차트마다 고유한 셀렉터를 지정하세요(공통 조상을 지정하면 한 번의 드래그가 모든 차트의 selection을 트리거합니다). | '.chart-wrapper' |

#### tooltip

| 이름                | 타입                                | 디폴트                                     | 설명                                                    | 종류(예시)                                                          |
| ------------------- | ----------------------------------- | ------------------------------------------ | ------------------------------------------------------- | ------------------------------------------------------------------- |
| use                 | Boolean                             | false                                      | tooltip 표시 여부                                       | true /false                                                         |
| backgroundColor     | Hex, RGB, RGBA Code(String)         | '#4C4C4C'                                  | tooltip 배경 색상                                       |                                                                     |
| borderColor         | Hex, RGB, RGBA Code(String)         | '#666666'                                  | tooltip 테두리 색상                                     |                                                                     |
| useShadow           | Boolean                             | false                                      | 그림자 사용 여부                                        |                                                                     |
| shadowOpacity       | Number                              | 0.25                                       | 그림자 투명도                                           |                                                                     |
| throttledMove       | Boolean                             | true                                       | 데이터 조회 Throttling 처리 유무                        |                                                                     |
| debouncedHide       | Boolean                             | false                                      | 좌표 이동 시 tooltip hide 여부                          |                                                                     |
| sortByValue         | Boolean                             | true                                       | 값을 기준으로 정렬할지의 여부                           |                                                                     |
| useScrollbar        | Boolean                             | false                                      | 스크롤바 사용 여부                                      |                                                                     |
| htmlScrollTarget    | String                              |                                            | `formatter.html` 커스텀 툴팁에서 휠 스크롤을 전달할 내부 요소의 CSS 셀렉터 (가상 스크롤 활성 시에는 자동 처리되어 불필요) | '.ev-chart-tooltip-custom__body' |
| maxHeight           | Number                              |                                            | 툴팁의 최대 높이                                        |                                                                     |
| maxWidth            | Number                              |                                            | 툴팁의 최대 너비                                        |                                                                     |
| textOverflow        | String                              | 'wrap'                                     | 툴팁에 표시될 텍스트가 maxWidth 값을 넘길 경우 의 처리  | 'wrap', 'ellipsis                                                   |
| fontFamily          | String                              | 'Roboto'                                   | 툴팁에 표시될 폰트                                      | 'Roboto', 'serif                                                    |
| fontColor           | Hex code (string), Object, Function | '#000000'                                  | 툴팁에 표시될 폰트 컬러                                 | '#FFFFFF', { label: '#FFFFFF', value: '#FFFFFF', 'title: #FFFFFF' } |
| fontSize            | Object                              | { title: 16, contents: 14 }                | 툴팁에 표시될 폰트 사이즈                               |                                                                     |
| colorShape          | String                              | 'rect'                                     | 툴팁에 표시될 series color의 모양                       | 'rect', 'circle'                                                    |
| rowPadding          | Object                              | { top: 0, bottom: 3, right: 20, left: 16 } | 툴팁에 표시될 series Row의 padding 값                   |                                                                     |
| showAllValueInRange | Boolean                             | false                                      | 동일한 axes값을 가진 전체 series를 Tooltip에 표시       |
| formatter           | function / Object                   | null                                       | 데이터가 표시되기 전에 데이터의 형식을 지정하는 데 사용 | (아래 코드 참고)                                                    |
| returnValue         | function                    | null                                       | 외부 컴포넌트 커스텀 툴팁을 구현할 때 사용하는 함수                 | (아래 코드 참고)                                                    |
| virtualScroll       | Object                      | { use: 'auto', threshold: 50, estimatedRowHeight: 28, overscan: 5 } | `formatter.html` 사용 시 가상 스크롤로 보이는 행만 라이브 DOM에 부착. 시리즈당 wrapper element에 `data-evui-tooltip-row` 속성을 부여하면 안정적으로 활성화됨 | use: 'auto' \| true \| false |

```
const chartOptions = {
    tooltip: {
        // 이전 버전 호환용으로 valueFormatter를 이전버전과 같이 사용 가능
        // return type : string
        formatter: ({ x, y, value, seriesId }) => ... ,

        // value + title Formatter
        // return type : string
        formatter: {
            title: ({ x, y }) => ...,
            value: ({ x, y, value, seriesId }) => ...,
        }

        // custom formatter (html)
        // return type : string
        // 주의: 사용하시는 방법에 따라 차트의 성능이 저하될 수 있습니다.
        formatter: {
            html: ([item]) =>  `<div class="customClass">${item.name} : ${item.data.y}</div>`
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

#### heatmap color

| 이름          | 타입                        | 디폴트            | 설명                                                | 종류(예시)                         |
| ------------- | --------------------------- | ----------------- | --------------------------------------------------- | ---------------------------------- |
| min           | Hex, RGB, RGBA Code(String) | '#FFFFFF'         | min color                                           |                                    |
| max           | Hex, RGB, RGBA Code(String) | '#5586EB'         | max color                                           |                                    |
| rangeCount    | number                      | 5                 | color min - max 그라데이션 범위 개수                |                                    |
| colorsByRange | Array                       | []                | 범위별 color, label 지정                            | [{ color: '#FFFFFF', label: 'A' }] |
| stroke        | Object                      | ([상세](#stroke)) | series stroke 지정                                  |                                    |
| error         | Hex, RGB, RGBA Code(String) | '#FFFFFF'         | series error color (value가 -1인 경우 error로 인식) |                                    |
| decimalPoint  | number                      | 0                 | 범주 표현 소숫값 처리                               |                                    |

##### stroke

| 이름      | 타입                        | 디폴트    | 설명                | 종류(예시) |
| --------- | --------------------------- | --------- | ------------------- | ---------- |
| show      | boolean                     | false     | stroke 사용 여부    |            |
| color     | Hex, RGB, RGBA Code(String) | '#FFFFFF' | stroke color 지정   |            |
| lineWidth | number                      | 1         | stroke 선 굵기 지정 |            |
| opacity   | number                      | 1         | stroke opacity 지정 | 0.1 ~ 1    |
| radius    | number                      | 0         | border radius 조정  |            |

#### selectItem

| 이름             | 타입    | 디폴트                 | 설명                                                                       | 종류(예시) |
| ---------------- | ------- | ---------------------- | -------------------------------------------------------------------------- | ---------- |
| use              | Boolean | false                  | 차트 아이템 선택 기능                                                      |            |
| useClick         | Boolean | true                   | 클릭 이벤트 사용 여부 (v-model에 바인딩한 변수로만 컨트롤 하려 할때 false) |            |
| useBorder        | Boolean | false                  | 선택한 항목의 border 표시 여부                                             |            |
| borderStyle      | Object  | ([상세](#borderstyle)) | border 스타일을 설정                                                       |            |
| useSeriesOpacity | Boolean | false                  | 선택한 항목을 제외한 나머지 항목들에 반투명 효과 적용 여부                 |            |
| useDeselectItem  | Boolean | false                  | 선택된 항목을 클릭했을 때 선택 해제 여부                                   |            |

##### borderStyle

| 이름      | 타입                        | 디폴트    | 설명                | 종류(예시) |
| --------- | --------------------------- | --------- | ------------------- | ---------- |
| color     | Hex, RGB, RGBA Code(String) | '#FFFFFF' | border color 지정   |            |
| lineWidth | number                      | 1         | border 선 굵기 지정 |            |
| opacity   | number                      | 1         | border opacity 지정 | 0.1 ~ 1    |
| radius    | number                      | 0         | border radius 조정  |            |

#### selectLabel

| 이름                | 타입                        | 디폴트    | 설명                                                                       | 종류(예시) |
| ------------------- | --------------------------- | --------- | -------------------------------------------------------------------------- | ---------- |
| use                 | Boolean                     | false     | 차트 라벨 선택 기능                                                        |            |
| useClick            | Boolean                     | true      | 클릭 이벤트 사용 여부 (v-model에 바인딩한 변수로만 컨트롤 하려 할때 false) |            |
| limit               | Number                      | 1         | 선택할 라벨의 최대 갯수                                                    |            |
| useDeselectOverflow | Boolean                     | false     | limit 를 넘어 클릭 했을때 자동 deselect 를 할지 여부                       |            |
| showTip             | Boolean                     | false     | 선택한 label의 Tip(화살표) 생성 여부                                       |            |
| useSeriesOpacity    | Boolean                     | true      | 시리즈 opacity 변경 여부                                                   |            |
| useLabelOpacity     | Boolean                     | true      | Axes Label opacity 변경 여부                                               |            |
| useApproximateValue | Boolean                     | false     | 가까운 label을 선택                                                        |            |
| useBothAxis         | Boolean                     | false     | X축, Y축 두개 모두 이벤트 적용할지의 여부                                  |            |
| tipBackground       | Hex, RGB, RGBA Code(String) | '#000000' | tip 배경색상                                                               |            |

#### eventBehavior

이벤트별 동작을 설정하는 옵션 객체.

| 이름         | 타입   | 디폴트   | 설명                                                                 | 종류(예시)           |
| ----------- | ------ | -------- | -------------------------------------------------------------------- | -------------------- |
| legendClick | String | 'update' | 범례 클릭 시 동작. 'update': 차트 즉시 갱신, 'emitOnly': click-legend만 emit(이중 렌더 방지) | 'update' \| 'emitOnly' |

### 3. resize-timeout

- Default : 0
- debounce 사용. 연속으로 이벤트가 발생한 경우, 마지막 이벤트가 끝난 시점을 기준으로 `주어진 시간 (resize-timeout)` 이후 콜백 실행

> ### Event

| 이름        | 파라미터    | 설명                                                                                                                                                                                                                                                                                                                                      |
| ----------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| drag-select | data, range | 그래프에서 드래그를 해서 선택영역 안의 데이터와 선택영역에 대한 범위 값을 얻을 수 있다. <br><br> ex) data : [{ seriesName, seriesId, items: [] }, {...}, {...}] <br> ex) range : { xMin, xMax, yMin, yMax } <br><br> data의 요소 propery중 items 는 해당 Series의 데이터 들이 있으며 x, y값은 데이터 기반 <xp, yp 는 Canvas기반의 좌표 값 |
| mouse-move  |             | 커서의 현재 location 과 axes에 있을 경우 labelIdx, labelVal 과 데이터 영역에 있을 경우 dataIdx, maxDataVal 과 labelVal 또는 maxDataVal를 가공하기 전의 originVal 값을 반환                                                                                                                                                                |
| click-legend | e, data      | 범례를 클릭했을 때 발생하는 이벤트. 클릭 후 활성화된 시리즈 Index 목록과 모두 활성 여부를 반환한다. <br><br> ex) e : 이벤트 객체 <br> ex) data : { seriesIndices: [0, 1,..], isActiveAll: false } <br><br> seriesIndices는 현재 활성화(highlight: true)된 시리즈의 Index 배열이다. 단, 시리즈가 모두 활성화된다면 빈배열([])로 반환한다. |

- drag-select는 `dragSelection` 옵션의 `use`값이 `true` 일 때 이벤트를 발생 시킬 수 있다.
  그리고 선택영역은 그래프에 표시된 데이터의 중앙이 포함 되어야 선택영역 내 데이터로 인식 한다.

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
| location | series | String \| Number | 'end' | 추적 위치. 'start' \| 'end' \| 데이터 인덱스('start'/'end'는 데이터 있는 non-null 첫/마지막). 파이는 무시 |

- **이 차트의 `series` 기준점**: 셀 중심
- **`axis` 위치**: 지원 (linear/time/step 축 값으로 지정). `xValue`와 `yValue`를 **모두** 지정해야 하며, 하나만 지정하면 표시되지 않습니다.
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
