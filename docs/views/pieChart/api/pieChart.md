> ## Desc

- 태그는 &lt;ev-chart&gt;(이하 <차트>)으로 정의

```
<ev-chart
    v-model:selectedItem="선택된 데이터 정보"
    :data="차트데이터"
    :options="차트속성"
    :resize-timeout="debounce wait시간(단위: ms)"
/>
```

> ## Props

### 1. v-model:selectedItem

- option에서 [selectItem](#selectitem) 옵션을 사용할 경우 유효한 바인딩
- 현재 선택된 Item에 대한 정보 (seriesID)

#### Example

```
const selectedItem = ref({
    seriesID: 'series1', // Series ID (key)
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

| 이름   | 타입   | 디폴트 | 설명                           | 종류 |
| ------ | ------ | ------ | ------------------------------ | ---- |
| series | Object | {}     | 특정 데이터에 대한 시리즈 옵션 |      |
| data   | Object | {}     | 차트에 표시할 시리즈 별 데이터 |      |

#### series

| 이름      | 타입                        | 디폴트                                        | 설명                                                            | 종류(예시)                      |
| --------- | --------------------------- | --------------------------------------------- | --------------------------------------------------------------- | ------------------------------- |
| name      | String                      | series-\${index}                              | 특정 데이터에 대한 시리즈 옵션                                  |                                 |
| type      | String                      | 'bar'                                         | 시리즈에 해당하는 데이터 표현 방식                              | 'bar', 'pie', 'line', 'scatter' |
| color     | Hex, RGB, RGBA Code(String) | COLOR[index]                                  | 사전에 정의된 16개 색상('#2b99f0' ~ '#df6264)을 순차적으로 적용 |                                 |
| stroke    | Object                      | { use: true, color: '#FFFFFF', lineWidth: 2 } | 차트의 테두리선 표시 여부 및 색상, 두께를 설정하는 옵션         |                                 |
| showValue | Object                      | ([상세](#showvalue))                          | 조각 위에 값 표시 여부 및 속성                                  |                                 |

#### data example

```
const chartData =
  series: {
    series1: { name: 'series1', color: '#FF00FF },
    series2: { name: 'series2' },
  },
  data: {
    series1: [10],
    series2: [90],
  },
};
```

#### showValue

| 이름      | 타입                        | 디폴트    | 설명                                                    | 종류(예시)                                                    |
| --------- | --------------------------- | --------- | ------------------------------------------------------- | ------------------------------------------------------------- |
| use       | Boolean                     | false     | data label 표시 여부                                    | true /false                                                   |
| textColor | Hex, RGB, RGBA Code(String) | '#000000' | 글자 색상                                               |                                                               |
| fontSize  | Number                      | 12        | 글자 크기                                               |                                                               |
| formatter | function                    | null      | 데이터가 표시되기 전에 데이터의 형식을 지정하는 데 사용 | ({value, percentage}) => percentage + '%' + '(' + value + ')' |

### 4. options

| 이름             | 타입            | 디폴트                                         | 설명                                                            | 종류(예시)                      |
| ---------------- | --------------- | ---------------------------------------------- | --------------------------------------------------------------- | ------------------------------- |
| type             | String          | ''                                             | series 별로 type값을 지정하지 않을 경우 일괄 적용될 차트의 타입 | 'bar', 'pie', 'line', 'scatter' |
| width            | String / Number | '100%'                                         | 차트의 너비                                                     | '100%', '150px', 150            |
| height           | String / Number | '100%'                                         | 차트의 높이                                                     | '100%', '150px', 150            |
| title            | Object          | ([상세](#title))                               | 차트 상단에 위치할 차트 제목 표시 여부 및 속성                  |                                 |
| legend           | Object          | ([상세](#legend))                              | 차트의 범례 표시 여부 및 속성                                   |                                 |
| annotations | Array | ([상세](#annotation)) | 차트 위에 표시할 어노테이션/뱃지 목록 | |
| doughnutHoleSize | number          | 0                                              | 내부 hole 사이즈                                                | 0 ~ 1                           |
| pieStroke        | Object          | { show: true, color: '#FFFFFF', lineWidth: 2 } | 차트의 테두리선 표시 여부 및 색상, 두께를 설정하는 옵션         |                                 |
| tooltip          | Object          | ([상세](#tooltip))                             | 차트에 마우스를 올릴 경우 툴팁 표시 여부 및 속성                |                                 |
| eventBehavior    | Object          | ([상세](#eventbehavior))                       | 이벤트별 동작 설정 | | 

#### title

| 이름             | 타입                        | 디폴트   | 설명               | 종류(예시)  |
| ---------------- | --------------------------- | -------- | ------------------ | ----------- |
| show             | Boolean                     | false    | 타이틀 표시 여부   | true /false |
| height           | Number                      | 40       | 타이틀 영역이 높이 |             |
| text             | String                      | ''       | 타이틀             |             |
| style            | Object                      |          | 타이틀 폰트 스타일 |             |
| style.fontSize   | Number                      | 15       | 글자 크기          |             |
| style.color      | Hex, RGB, RGBA Code(String) | '#000'   | 글자 색상          |             |
| style.fontFamily | String                      | 'Roboto' | 글자체             |             |

#### legend

| 이름          | 타입                        | 디폴트                                   | 설명                                                  | 종류(예시)                       |
| ------------- | --------------------------- | ---------------------------------------- | ----------------------------------------------------- | -------------------------------- |
| show          | Boolean                     | false                                    | Legend 표시 여부                                      | true /false                      |
| position      | String                      | 'right'                                  | Legend 위치                                           | 'top', 'right', 'bottom', 'left' |
| color         | Hex, RGB, RGBA Code(String) | '#353740'                                | 폰트 색상                                             |                                  |
| inactive      | Hex, RGB, RGBA Code(String) | '#aaa'                                   | 비활성화 상태의 폰트 색상                             |                                  |
| width         | Number                      | 140                                      | Legend의 넓이 _('left', 'right'의 경우 조절)_         |                                  |
| height        | Number                      | 24                                       | Legend의 높이 _('top', 'bottom'의 경우 조절)_         |                                  |
| padding       | Object                      | { top: 0, right: 0, left: 0, bottom: 0 } | Legend 내부 padding 값                                |                                  |
| allowResize   | Boolean                     | false                                    | Legend 영역 리사이즈 가능 여부                        |                                  |
| table         | Object                      | ([상세](#legendtable))                   | Table 타입 Legend (값 표시 포함). bar, line, pie 전용 |                                  |
| stopClickEvt  | Boolean                     | false                                    | Legend 표시 여부                                      | true /false                      |
| virtualScroll | Boolean                     | false                                    | Legend에 가상 스크롤 적용 여부                        | true /false                      |
| clickMode     | 'active' \| 'inactive'      | 'active'                                 | Legend 클릭 시 활성화 여부                            |                                  |
| external      | Boolean                     | false                                    | 범례를 차트 외부에서 렌더링할지 여부. true이면 차트 내부에 범례를 그리지 않고, `v-model:legend-data`로 전달된 배열을 외부에서 렌더링할 수 있음. ref로 `toggleSeries(sId)`, `highlightSeries(sId)`, `unhighlightSeries()` 사용 | true / false                    |

##### legendTable

| 이름          | 타입    | 디폴트                         | 설명                         | 종류(예시)                                                                        |
| ------------- | ------- | ------------------------------ | ---------------------------- | --------------------------------------------------------------------------------- |
| use           | Boolean | false                          | Table 타입 표시 여부         | true /false                                                                       |
| style         | Object  | null                           | table style                  | { row: {}, header: {} }                                                           |
| style.row     | Object  | null                           | table row의 CSS style        | { borderBottom: '1px solid #DBDBDB' }                                             |
| style.header  | Object  | null                           | table header의 CSS Style     | { fontSize: '15px' }                                                              |
| columns       | Object  | (아래 각 항목 참고)            |                              |                                                                                   |
| columns.name  | Object  | { title: 'Name' }              | Series Name 표시 관련 옵션   | { title: '시리즈명', style: {...} }                                               |
| columns.min   | Object  | { use: false, title: 'MIN' }   | Minimum Value 표시 관련 옵션 | { use: true, title: '최솟값', style: {...}, formatter: (v) => `${v.toFixed(2)}` } |
| columns.max   | Object  | { use: false, title: 'MAX' }   | Maximum Value 표시 관련 옵션 | { use: true, title: '최댓값', style: {...}, decimalPoint: 2 }                     |
| columns.avg   | Object  | { use: false, title: 'AVG' }   | Average Value 표시 관련 옵션 | { use: true, title: '평균', style: {...}, decimalPoint: 2 }                       |
| columns.total | Object  | { use: false, title: 'TOTAL' } | Total Value 표시 관련 옵션   | { use: true, title: '합계', style: {...}, decimalPoint: 2 }                       |
| columns.last  | Object  | { use: false, title: 'LAST' }  | Last Value 표시 관련 옵션    | { use: true, title: 'Current', style: {...}, decimalPoint: 2 }                    |

#### tooltip

| 이름                | 타입                        | 디폴트                                     | 설명                                                    | 종류(예시)                                                          |
| ------------------- | --------------------------- | ------------------------------------------ | ------------------------------------------------------- | ------------------------------------------------------------------- |
| use                 | Boolean                     | true                                       | tooltip 표시 여부                                       | true /false                                                         |
| backgroundColor     | Hex, RGB, RGBA Code(String) | '#4C4C4C'                                  | tooltip 배경 색상                                       |                                                                     |
| borderColor         | Hex, RGB, RGBA Code(String) | '#666666'                                  | tooltip 테두리 색상                                     |                                                                     |
| useShadow           | Boolean                     | false                                      | 그림자 사용 여부                                        |                                                                     |
| shadowOpacity       | Number                      | 0.25                                       | 그림자 투명도                                           |                                                                     |
| throttledMove       | Boolean                     | true                                       | 데이터 조회 Throttling 처리 유무                        |                                                                     |
| debouncedHide       | Boolean                     | false                                      | 좌표 이동 시 tooltip hide 여부                          |                                                                     |
| sortByValue         | Boolean                     | true                                       | 값을 기준으로 정렬할지의 여부                           |                                                                     |
| useScrollbar        | Boolean                     | false                                      | 스크롤바 사용 여부                                      |                                                                     |
| htmlScrollTarget    | String                      |                                            | `formatter.html` 커스텀 툴팁에서 휠 스크롤을 전달할 내부 요소의 CSS 셀렉터 (가상 스크롤 활성 시에는 자동 처리되어 불필요) | '.ev-chart-tooltip-custom__body' |
| maxHeight           | Number                      |                                            | 툴팁의 최대 높이                                        |                                                                     |
| maxWidth            | Number                      |                                            | 툴팁의 최대 너비                                        |                                                                     |
| textOverflow        | String                      | 'wrap'                                     | 툴팁에 표시될 텍스트가 maxWidth 값을 넘길 경우 의 처리  | 'wrap', 'ellipsis                                                   |
| fontFamily          | String                      | 'Roboto'                                   | 툴팁에 표시될 폰트                                      | 'Roboto', 'serif                                                    |
| fontColor           | Hex code (string), Object   | '#000000'                                  | 툴팁에 표시될 폰트 컬러                                 | '#FFFFFF', { label: '#FFFFFF', value: '#FFFFFF', 'title: #FFFFFF' } |
| fontSize            | Object                      | { title: 16, contents: 14 }                | 툴팁에 표시될 폰트 사이즈                               |                                                                     |
| colorShape          | String                      | 'rect'                                     | 툴팁에 표시될 series color의 모양                       | 'rect', 'circle'                                                    |
| rowPadding          | Object                      | { top: 0, bottom: 3, right: 20, left: 16 } | 툴팁에 표시될 series Row의 padding 값                   |                                                                     |
| showAllValueInRange | Boolean                     | false                                      | 동일한 axes값을 가진 전체 series를 Tooltip에 표시       |
| showHeader          | Boolean                     | true                                       | Tooltip의 Header 영역 표시 여부                         |
| formatter           | function / Object           | null                                       | 데이터가 표시되기 전에 데이터의 형식을 지정하는 데 사용 | (아래 코드 참고)                                                    |
| returnValue         | function                    | null                                       | 외부 컴포넌트 커스텀 툴팁을 구현할 때 사용하는 함수                 | (아래 코드 참고)                                                    |
| virtualScroll       | Object                      | { use: 'auto', threshold: 50, estimatedRowHeight: 28, overscan: 5 } | `formatter.html` 사용 시 가상 스크롤로 보이는 행만 라이브 DOM에 부착. 시리즈당 wrapper element에 `data-evui-tooltip-row` 속성을 부여하면 안정적으로 활성화됨 | use: 'auto' \| true \| false |

```ts
const chartOptions = {
    tooltip: {
        // 이전 버전 호환용으로 valueFormatter를 이전버전과 같이 사용 가능
        // return type : string
        formatter: ({ name, value, seriesId }) => ... ,

        // 새로운 버전
        // return type : string
        formatter: {
            value: ({ name, value, percentage, seriesId }) => ...,
        }

        // custom formatter (html)
        // return type : string
        // 주의: 사용하시는 방법에 따라 차트의 성능이 저하될 수 있습니다.
        formatter: {
            html: ([item]) =>  `<div class="customClass">${item.name} : ${item.data.o} (${item.data.percentage})</div>`
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

#### selectItem

| 이름 | 타입    | 디폴트 | 설명                  | 종류(예시) |
| ---- | ------- | ------ | --------------------- | ---------- |
| use  | Boolean | false  | 차트 아이템 선택 기능 |            |

#### eventBehavior

이벤트별 동작을 설정하는 옵션 객체.

| 이름         | 타입   | 디폴트   | 설명                                                                 | 종류(예시)           |
| ----------- | ------ | -------- | -------------------------------------------------------------------- | -------------------- |
| legendClick | String | 'update' | 범례 클릭 시 동작. 'update': 차트 즉시 갱신, 'emitOnly': click-legend만 emit(이중 렌더 방지) | 'update' \| 'emitOnly' |

### 4. resize-timeout

- Default : 0
- debounce 사용. 연속으로 이벤트가 발생한 경우, 마지막 이벤트가 끝난 시점을 기준으로 `주어진 시간 (resize-timeout)` 이후 콜백 실행

### 5. Event

| 이름      | 파라미터     | 설명                                           |
| --------- | ------------ | ---------------------------------------------- |
| click     | selectedItem | 클릭된 series의 value, seriesID 값을 반환      |
| dbl-click | selectedItem | 더블 클릭된 series의 value, seriesID 값을 반환 |
| click-legend | e, data      | 범례를 클릭했을 때 발생하는 이벤트. 클릭 후 활성화된 시리즈 ID 목록과 모두 활성 여부를 반환한다. <br><br> ex) e : 이벤트 객체 <br> ex) data : { seriesIds: ['series1', 'series2', ...], isActiveAll: false } <br><br> seriesIds는 현재 활성화(show: true)된 시리즈의 ID 배열이다. 단, 시리즈가 모두 활성화된다면 빈배열([])로 반환한다. |

- 단, `selectedItem` 옵션의 `use`값이 `true` 이어야 `selectedItem` 객체를 반환하며 false일 경우 빈 객체를 반환

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

- **이 차트의 `series` 기준점**: 조각 바깥 둘레의 각도 중간 지점(단일 조각이면 오른쪽 3시 방향)
- **`axis` 위치**: 미지원 (파이는 x/y축이 없음)
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
