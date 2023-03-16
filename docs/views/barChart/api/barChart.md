>## Desc
 - 태그는 &lt;ev-chart&gt;(이하 <차트>)으로 정의

```
<ev-chart
    v-model:selectedItem="선택된 데이터 정보"
    :data="차트데이터"
    :options="차트속성"
    :resize-timeout="debounce wait시간(단위: ms)"
/>
```

>## Props
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

### 2. v-model:selectedLabel
- option에서 [selectLabel](#selectlabel) 옵션을 사용할 경우 유효한 바인딩
- 현재 선택된 Label의 인덱스 대한 정보 (dataIndex)
- 차트 클릭이 아니라 특정 위치의 label 을 선택하고 싶은 경우 바인딩 하고, dataIndex 배열의 값으로 차트를 컨트롤 한다.
#### Example
```
const selectedLabel = ref({
    dataIndex: [0], // option 에 설정한 limit 갯수 까지 선택 가능.
});
```


### 3. data  
  | 이름 | 타입 | 디폴트 | 설명 | 종류 |
  |------------ |-----------|---------|-------------------------|---------------------------------------------------|
  | series | Object | {} | 특정 데이터에 대한 시리즈 옵션 |  |
  | data   | Object | {} | 차트에 표시할 시리즈 별 데이터 |  |
  | groups | Array  | [] | Stack, Overlapping 차트를 위한 시리즈 그룹을 지정 |  |
  | labels | Array  | [] | 축의 각 눈금에 해당하는 명칭 |  |

#### series
  | 이름 | 타입 | 디폴트 | 설명 | 종류(예시) |
  |------------ |-----------|---------|-------------------------|---------------------------------------------------|
  | name | String | series-${index} | 특정 데이터에 대한 시리즈 옵션 |  |
  | type | String | 'bar' | 시리즈에 해당하는 데이터 표현 방식 | 'bar', 'pie', 'line', 'scatter' |
  | color | Hex, RGB, RGBA Code(String) or Object | COLOR[index] | 특정 색상을 지정하지 않으면 사전에 정의된 16개 색상('#2b99f0' ~ '#df6264)을 순차적으로 적용 |  |
  | showValue | Object | ([상세](#showvalue)) | 막대 위에 값 표시 여부 및 속성 |  |

#### color Example
```
const chartData = {
    series: {
      series1: { name: 'series#1' }, // 기본 색상으로 자동 할당
      series2: { name: 'series#2', color: '#FF00FF' }, // 특정 색상 지정 (hex)
      series3: { name: 'series#2', color: 'rgba(255, 165, 0, 1)' }, // 특정 색상 지정 (rgb)
      series4: { name: 'series#3', color: [[0, 'rgba(255, 165, 0, 0.4)'], [1, '#A6C1EE']] }, // 특정 색상으로 그라데이션
      series5: { name: 'series#3', color: [[], [1, 'rgba(255, 165, 0, 1)']] }, // 투명하게 시작하여 특정 색상으로 그라데이션
    },
    ... 생략
}
```

#### showValue
| 이름 | 타입 | 디폴트 | 설명 | 종류(예시) |
| --- | ---- | ----- | --- | ----------|
| use | Boolean | false | data label 표시 여부 | true /false |
| textColor | Hex, RGB, RGBA Code(String) | '#000000' | 글자 색상  | |
| fontSize | Number | 12 | 글자 크기 | |
| align | String | 'end' | 텍스트 위치 (막대 시작, 막대 중간, 막대 끝, 막대 바깥쪽)  | 'start', 'center', 'end', 'out' |
| formatter | function | null | 데이터가 표시되기 전에 데이터의 형식을 지정하는 데 사용   | (value) => value + '%' |
| decimalPoint | Number | 0 | 소수점 자릿수  |  |
* Stack Bar Chart의 경우 'out' 은 지원하지 않습니다. 
* 막대 영역이 좁을 경우 값이 표시되지 않을 수 있습니다.

#### data example
```
const chartData = {
    series: {
        { name: 'series1' },
        { name: 'series2' },
        { name: 'series2' },
    },
    data: {
        'series1' : [1, 2, 3, 4],
        'series2' : [5, 2, 0, 8],
        'series3' : [{ value: 9, color: '#FF0000' }, 2, 8, 2], // 특정 값에 별도의 색상 지정 가능
    },
    labels: ['a', 'b', c', 'd'],
}
```
  
### 4. options 
  | 이름 | 타입 | 디폴트 | 설명 | 종류(예시) |
  |------------ |-----------|---------|-------------------------|---------------------------------------------------|
  | type | String | '' | series 별로 type값을 지정하지 않을 경우 일괄 적용될 차트의 타입 | 'bar', 'pie', 'line', 'scatter' |
  | width | String / Number | '100%' | 차트의 너비 | '100%', '150px', 150 | 
  | height | String / Number | '100%' | 차트의 높이 | '100%', '150px', 150 |
  | thickness | Number | 1 | 차트 막대의 너비 | 0.1 ~ 1 |
  | cPadRatio | Number | 0 | 카테고리(각 라벨간)내부 padding 영역의 비율 | 0 ~ 0.99 (1 미만) |
  | borderRadius | Number | 0 | 막대 가장자리 부분의 border-radius 값.  | 0 ~ |
  | horizontal | Boolean | false | 차트 막대의 방향 - 수평 전환 여부 | true, false |
  | axesX | Object | 없음 | X축에 대한 속성 | [상세](#axesx-axesy) |
  | axesY | Object | 없음 | Y축에 대한 속성 | [상세](#axesx-axesy) |
  | title | Object | ([상세](#title)) | 차트 상단에 위치할 차트 제목 표시 여부 및 속성 |  |
  | legend | Object | ([상세](#legend)) | 차트의 범례 표시 여부 및 속성 |  |
  | tooltip | Object | ([상세](#tooltip)) | 차트에 마우스를 올릴 경우 툴팁 표시 여부 및 속성 | |
  | indicator | Object | ([상세](#indicator)) | 지표선 | |
  | maxTip | Object | ([상세](#maxtip)) | 최대값에 tip 표시(값 표시) 여부 및 속성 | |
  | selectItem | Object | ([상세](#selectitem)) | 차트 아이템 선택 기능 활성화 여부 및 속성 | | 
  | selectLabel  | Object | ([상세](#selectlabel)) | 차트 라벨 선택 기능 활성화 여부 및 속성 | | 
  | padding | Object | { top: 20, right: 2, left: 2, bottom: 4 } | 차트 내부 padding 값 | | 

#### axesX axesY
##### type 공통
  | 이름 | 타입 | 디폴트 | 설명 | 종류(예시) |
  |------------ |-----------|---------|-------------------------|---------------------------------------------------|
  | type | String | | 축의 유형 | [linear](#linear-type), [time](#time-type), [log](#Logarithmic-type), [step](#step-type) |
  | showAxis | Boolean | true | 축 표시 여부 | true / false | 
  | startToZero | Boolean | false | 축의 시작을 0 부터 시작할지의 여부 | true / false |
  | autoScaleRatio | Number | null | Axis의 Max Buffer를 위한 속성 | 0.1 ~ 0.9 |
  | showGrid | Boolean | true | 차트 내부 그리드 표시 여부 | true / false |
  | axisLineWidth  | Number | 1 | 축의 선 굵기 | 1 ~ |
  | axisLineColor | String | '#C9CFDC' | 축의 색상 | | 
  | gridLineColor | String | '#C9CFDC' | 그리드의 색상 | | 
  | range | Array | null | 축에 표시할 값의 min, max (autoScaleRatio = null, startToZero = false 이여야 정상 표현됩니다.) | [0, 100] |
  | horizontal | Boolean | null | horizontal Bar 차트 표시를 위한 속성 | true / false | 
  | overlapping | Object | ([상세](#overlapping)) | Overlapping Bar 차트 표시를 위한 속성<br/>data 속성의 groups 값을 같이 지정하여야 정상 표현됩니다. |  |   
  | interval | String | null | 축에 표시되는 값의 간격 단위 (축의 타입에 따라 달라짐)
  | labelStyle | Object | ([상세](#labelstyle)) | 라벨의 폰트 스타일을 설정 | |
  | plotLines | Array | ([상세](#plotline)) | plot line(임계선 표시 용도) 설정 | |
  | plotBands | Array | ([상세](#plotband)) | plot band(임계영역 표시 용도) 설정 | |
  | formatter | function | null | 데이터가 표시되기 전에 데이터의 형식을 지정하는 데 사용   | (value) => value + '%' |
  | title | Object | ([상세](#title)) | 라벨의 폰트 스타일을 설정 | |  
  | scrollbar | Object | ([상세](#axes-scrollbar)) | 라벨 축 스크롤 설정(range 옵션 설정되어 있어야 정상 동작합니다.) | |

##### linear type
   - interval (Axis Label 표기를 위한 interval)
      - 미지정 시 Chart 내부에서 해당 Axis 데이터의 max/min value를 기반으로 interval을 구함
   - Linear Type의 Axis Label은 각 숫자 단위에 맞춰 'K', 'M', 'G'로 숫자를 변환하여 보여줌
      - 예를 들어, Label에 필요한 값이 1,500일 경우 '1.5K'로 표기
   - decimalPoint
     - 소수점 자릿수 표시 (default: 0)
   - range
     - 축의 min 값, max 값을 array로 넘겨줌 ([0, 100])
     
      
##### time type
   - interval (Axis Label 표기를 위한 interval)
      - 'millisecond', 'second', 'minute', 'hour', 'day', 'week' ,'month', 'quarter', 'year'
   - timeFormat
      - dayjs의 timeFormat 이용 [참고URL](https://day.js.org/docs/en/parse/string-format/)
   - categoryMode
      - 축에 표시할 시간 값을 `data`옵션의 `labels`속 값들로 표시할지의 여부
   - range
     - 축의 min 값, max 값을 array로 넘겨줌 ([0, 100])
      
##### Logarithmic type
   - logarithmic Type Axis는 Axis의 min max를 로그로 계산하여 자동으로 추가 buffer값을 제공
   - Linear Type의 Axis Label은 각 숫자 단위에 맞춰 'K', 'M', 'G'로 숫자를 변환하여 보여줌
      - 예를 들어, Label에 필요한 값이 1,500일 경우 '1.5K'로 표
   - decimalPoint
       - 소수점 자릿수 표시 (default: 0)
   - range
     - 축의 min 값, max 값을 array로 넘겨줌 ([0, 100])
     
##### step type
   - timeMode
      - Step Axis를 Time 기반으로 변경, default: false
   - timeFormat
      - dayjs의 timeFormat 이용 [참고URL](https://day.js.org/docs/en/parse/string-format/)
   - range
     - 축의 label의 minIndex, maxIndex 값을 array로 넘겨줌 ([0, 5])

##### overlapping
| 이름 | 타입 | 디폴트 | 설명 | 종류(예시) |
|-----|------|-------|-----|-----|
| use | Boolean | false | overlapping 사용 여부 | true / false |

##### labelStyle
| 이름 | 타입 | 디폴트 | 설명 | 종류(예시) |
|-----|------|-------|-----|-----|
| show | Boolean | true | label 표시 여부 | true / false |
| fontSize | Number | 12 | 글자 크기 | |
| color | Hex, RGB, RGBA Code(String) | '#25262E' | 글자 색상 | |
| fontFamily | String | 'Roboto' | 폰트 | |
| fitWidth | Boolean | false | Label Text Ellipsis 처리 | |
| fitDir | String | 'right' | Ellipsis 방향 | ( right => 'aaa...', left => '...aaa') |

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
| label | Object | null | 표시할 label의 스타일을 정의 | ([상세](#plotlabel)) |

##### plotBand
| 이름 | 타입 | 디폴트 | 설명 | 종류(예시) |
|-----|------|-------|-----|-----|
| from | Number(value), Date, Number(Index) | null | 박스를 표시할 시작 위치에 해당하는 값 | 3000, <br> new Date(), <br> 1 (축의 타입이 'step'인 경우 1번째 요소) |
| to | Number(value), Date, Number(Index) | null | 박스를 표시할 종료 위치에 해당하는 값 | 3000, <br> new Date(), <br> 1 (축의 타입이 'step'인 경우 1번째 요소) |
| color | Hex, RGB, RGBA Code(String) | '#FF0000' | 선 색상 | |
| label | Object | null | 표시할 label의 스타일을 정의 | ([상세](#plotlabel)) |

##### plotLabel
| 이름 | 타입 | 디폴트 | 설명 | 종류(예시) |
|-----|------|-------|-----|-----|
| show | Boolean | false | label 표시 여부 | true / false |
| fontSize | Number | 12 | 폰트 크기 | |
| fontColor | Hex, RGB, RGBA Code(String) | '#FF0000' | 폰트 색상 | |
| fillColor | Hex, RGB, RGBA Code(String) | '#FFFFFF' | 박스 배경 색상 | |
| lineColor | Hex, RGB, RGBA Code(String) | '#FF0000' | 박스 테두리 선 색상 | |
| lineWidth | Number | 0 | 테두리 선 굵기 | 1 ~ |
| fontWeight | Number | 400 | 폰트 굵기 |  |
| fontFamily | String | 'Roboto' | 폰트 스타일 |  |
| textAlign | String | 'center' | 수평 정렬 | 'left', 'center', 'right' |
| verticalAlign | String | 'middle' | 수직 정렬 | 'top', 'middle', 'bottom' |
| textOverflow | String | 'none' | 라벨을 넣을 수 있는 여백 혹은 maxWidth 값을 넘었을 경우의 처리방안  | 'none', 'ellipsis' |
| maxWidth | Number | null | 라벨의 최대 너비  |  |

##### axes scrollbar
| 이름 | 타입 | 디폴트 | 설명 | 종류(예시) |
|-----|------|-------|-----|-----|
| use | Boolean | false | 스크롤 사용 여부 | true / false |
| width | Number | 14 | 스크롤 넓이 (y축일 때 적용) | |
| height | Number | 14 | 스크롤 높이 (x축일 때 적용) | |
| background | Hex, RGB, RGBA Code(String) | '#F2F2F2' | 스크롤 track 배경 색상 | |
| showButton | Boolean | false | 스크롤 버튼 표시 여부 | |
| thumbStyle | Object | | 스크롤 thumb 스타일 설정 | { <br> background: '#929292', radius: 0 <br>} |

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
| table | Object | ([상세](#legendtable)) | Table 타입 Legend (값 표시 포함). bar, line, pie 전용 | | 

##### legendTable
| 이름 | 타입 | 디폴트 | 설명 | 종류(예시) |
| --- | ---- | ----- | --- | ----------|
| use | Boolean | false | Table 타입 표시 여부 | true /false |
| style | Object | null | table style | { row: {}, header: {} } |
| style.row | Object | null | table row의 CSS style | { borderBottom: '1px solid #DBDBDB' } |
| style.header | Object | null | table header의 CSS Style | { fontSize: '15px' } |
| columns | Object | (아래 각 항목 참고)| | | 
| columns.name | Object | { title: 'Name' } | Series Name 표시 관련 옵션 | { title: '시리즈명', style: {...} }| 
| columns.min | Object | { use: false, title: 'MIN' } | Minimum Value 표시 관련 옵션 | { use: true, title: '최솟값', style: {...}, formatter: (v) => `${v.toFixed(2)}` }| 
| columns.max | Object | { use: false, title: 'MAX' } | Maximum Value 표시 관련 옵션 | { use: true, title: '최댓값', style: {...}, decimalPoint: 2 }| 
| columns.avg | Object | { use: false, title: 'AVG' } | Average Value 표시 관련 옵션 | { use: true, title: '평균', style: {...}, decimalPoint: 2 }| 
| columns.total | Object | { use: false, title: 'TOTAL' } | Total Value 표시 관련 옵션 | { use: true, title: '합계', style: {...}, decimalPoint: 2 }| 
| columns.last | Object | { use: false, title: 'LAST' } | Last Value 표시 관련 옵션 | { use: true, title: 'Current', style: {...}, decimalPoint: 2 }| 

#### tooltip
| 이름 | 타입 | 디폴트 | 설명 | 종류(예시) |
| --- | ---- | ----- | --- | ----------|
| use | Boolean | true | tooltip 표시 여부 | true /false |
| backgroundColor | Hex, RGB, RGBA Code(String) | '#4C4C4C' | tooltip 배경 색상  | |
| borderColor | Hex, RGB, RGBA Code(String) | '#666666' | tooltip 테두리 색상  | |
| useShadow | Boolean | false | 그림자 사용 여부  | |
| shadowOpacity | Number | 0.25 | 그림자 투명도  | |
| throttledMove | Boolean | false | 데이터 조회 Throttling 처리 유무  | |
| debouncedHide | Boolean | false | 좌표 이동 시 tooltip hide 여부  | |
| sortByValue | Boolean | true | 값을 기준으로 정렬할지의 여부  | |
| useScrollbar | Boolean | false | 스크롤바 사용 여부  | |
| maxHeight | Number |  | 툴팁의 최대 높이  | |
| maxWidth | Number |  | 툴팁의 최대 너비  | |
| textOverflow | String | 'wrap' | 툴팁에 표시될 텍스트가 maxWidth 값을 넘길 경우 의 처리  | 'wrap', 'ellipsis |
| fontFamily | String | 'Roboto' | 툴팁에 표시될 폰트  | 'Roboto', 'serif |
| showAllValueInRange | Boolean | false | 동일한 axes값을 가진 전체 series를 Tooltip에 표시 |
| formatter | function / Object | null | 데이터가 표시되기 전에 데이터의 형식을 지정하는 데 사용   | (아래 코드 참고) |
```
const chartOptions = {
    tooltip: {
        // 이전 버전 호환용으로 valueFormatter를 이전버전과 같이 사용 가능
        formatter: ({ x, y, name }) => ... ,
        
        // value + title Formatter
        formatter: {
            title: ({ x, y }) => ...,
            value: ({ x, y, name }) => ...,
        }
    },
}
```

#### indicator
| 이름 | 타입 | 디폴트 | 설명 | 종류(예시) |
| --- | ---- | ----- | --- | ----------|
| use | Boolean | true | indicator 사용 여부 | |
| color | HexCode(String) | '#EE7F44' | 색상  | |

#### maxTip
| 이름 | 타입 | 디폴트 | 설명 | 종류(예시) |
| --- | ---- | ----- | --- | ----------|
| use | Boolean | true | maxTip 표시 여부  | |
| fixedPosTop | Boolean | false | maxTip 위치를 최대값으로 고정  | |
| showIndicator | Boolean | false | indicator 표시 여부  | |
| indicatorColor | Hex, RGB, RGBA Code(String) | '#000000' | indicator 색상  | |
| tipStyle | Object | ([상세](#tipstyle)) | tip 스타일을 설정

##### etc.
| 이름    | 타입   | 디폴트 | 설명 | 종류(예시) |
| ------ | ------ | ---- | -----| --------- |
| tipBackground | Hex, RGB, RGBA Code(String) | '#000000' | maxTip 배경색상  | |
| tipTextColor | Hex, RGB, RGBA Code(String) | '#FFFFFF' | maxTip 글자 색상  | |
* 3.4 버전부터 없어지는 옵션입니다.

#### selectItem
| 이름                  | 타입                          | 디폴트               | 설명                                                | 종류(예시) |
|---------------------|-----------------------------|-------------------|---------------------------------------------------| ----------|
| use                 | Boolean                     | false             | 차트 아이템 선택 기능                                      | |
| useClick            | Boolean                     | true              | 클릭 이벤트 사용 여부 (v-model에 바인딩한 변수로만 컨트롤 하려 할때 false) | |
| showTextTip         | Boolean                     | false             | 선택한 위치의 TextTip(text 포함 화살표, 흡사 말풍선) 생성 여부        | |
| tipText             | String                      | 'value'           | 선택한 위치에 TextTip을 생성한다면 어떤 값                       | 'value', 'label |
| showTip             | Boolean                     | false             | 선택한 위치의 Tip(화살표) 생성 여부                            | |
| showIndicator       | Boolean                     | false             | 선택한 label의 indicator 표시                           | |
| fixedPosTop         | Boolean                     | false             | indicator 및 tip의 위치를 최대값으로 고정                     | |
| useApproximateValue | Boolean                     | false             | 가까운 label을 선택                                     | |
| indicatorColor      | Hex, RGB, RGBA Code(String) | '#000000'         | indicator 색상                                      | |
| useSeriesOpacity    | Boolean                     | false             | 선택된 항목 외 다른 항목들의 색상을 반투명하게 처리할지의 여부               | |
| tipStyle            | Object                      | ([상세](#tipstyle)) | tip 스타일을 설정                                       

##### etc.
| 이름    | 타입   | 디폴트 | 설명 | 종류(예시) |
| ------ | ------ | ---- | -----| --------- |
| tipBackground | Hex, RGB, RGBA Code(String) | '#000000' | maxTip 배경색상  | |
| tipTextColor | Hex, RGB, RGBA Code(String) | '#FFFFFF' | maxTip 글자 색상  | |
* 3.4 버전부터 없어지는 옵션입니다.

##### tipStyle
| 이름    | 타입   | 디폴트 | 설명 | 종류(예시) |
| ------ | ------ | ---- | -----| --------- |
| height | Number | 20 | tip 높이 | |
| background | Hex, RGB, RGBA Code(String) | '#000000' | maxTip 배경색상  | |
| textColor | Hex, RGB, RGBA Code(String) | '#FFFFFF' | maxTip 글자 색상  | |
| fontSize  | Number | 14 | tip 폰트 크기 | |
| fontFamily | String | 'Roboto' | tip 폰트 | |
| fontWeight | Number | 400 | tip 폰트 굵기 | 100, 200, 300, ... 900 |


#### selectLabel
| 이름                  | 타입                          | 디폴트       | 설명                                                | 종류(예시) |
|---------------------|-----------------------------|-----------|---------------------------------------------------| ----------|
| use                 | Boolean                     | false     | 차트 라벨 선택 기능                                       | |
| useClick            | Boolean | true      | 클릭 이벤트 사용 여부 (v-model에 바인딩한 변수로만 컨트롤 하려 할때 false) | |
| limit               | Number                      | 1         | 선택할 라벨의 최대 갯수                                     | |
| useDeselectOverflow | Boolean                     | false     | limit 를 넘어 클릭 했을때 자동 deselect 를 할지 여부             | |
| showTip             | Boolean                     | false     | 선택한 위치의 Tip(화살표) 생성 여부                            | |
| useSeriesOpacity    | Boolean                     | true      | 시리즈 opacity 변경 여부                                 | |
| useLabelOpacity     | Boolean                     | true      | Axes Label opacity 변경 여부                          | |
| fixedPosTop         | Boolean                     | false     | tip의 위치를 최대값으로 고정                                 | |
| useApproximateValue | Boolean                     | false     | 가까운 label을 선택                                     | |
| tipBackground       | Hex, RGB, RGBA Code(String) | '#000000' | tip 배경색상                                          | |

### 5. resize-timeout
- Default : 0
- debounce 사용. 연속으로 이벤트가 발생한 경우, 마지막 이벤트가 끝난 시점을 기준으로 `주어진 시간 (resize-timeout)` 이후 콜백 실행


### 6. Event
| 이름 | 파라미터 | 설명 |
 |------|----------|------|
| click | selectedItem | 클릭된 series의 label, value, seriesID 값을 반환 |
| dbl-click | selectedItem | 더블 클릭된 series의 label, value, seriesID 값을 반환 |
* 단, `selectedItem` 옵션의 `use`값이 `true` 이어야 `selectedItem` 객체를 반환하며 false일 경우 빈 객체를 반환

