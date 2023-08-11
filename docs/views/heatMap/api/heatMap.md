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
### 1. data  
  | 이름 | 타입 | 디폴트 | 설명 | 종류 |
  |------------ |-----------|---------|------------------------|---------------------------------------------------|
  | series | Object | {} | 특정 데이터에 대한 시리즈 옵션 |  |
  | data   | Object | {} | 차트에 표시할 시리즈 별 데이터 |  |
  | labels | Object | {} | 축의 각 눈금에 해당하는 명칭 |  |

#### series
  | 이름 | 타입 | 디폴트 | 설명 | 종류(예시) |
  |------------ |-----------|---------|-------------------------|---------------------------------------------------|
  | name | String | series-${index} | 특정 데이터에 대한 시리즈 옵션 |  |
  | showValue | Object | ([상세](#showvalue)) | 막대 위에 값 표시 여부 및 속성 |  |

#### showValue
| 이름 | 타입 | 디폴트 | 설명 | 종류(예시) |
| --- | ---- | ----- | --- | ----------|
| use | Boolean | false | data label 표시 여부 | true /false |
| textColor | Hex, RGB, RGBA Code(String) | '#000000' | 글자 색상  | |
| fontSize | Number | 12 | 글자 크기 | |
| align | String | 'center' | 글자 정렬  | 'top', 'right', 'bottom', 'left' |
| formatter | function | null | 데이터가 표시되기 전에 데이터의 형식을 지정하는 데 사용   | (value) => value + '%' |
| decimalPoint | Number | 0 | 소수점 자릿수  |  |

- 글자 크기가 heatMap의 item의 크기를 벗어나게되면 그려지지 않습니다.

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

### 2. options 
  | 이름 | 타입 | 디폴트 | 설명 | 종류(예시) |
  |------------ |-----------|---------|-------------------------|---------------------------------------------------|
  | type | String | '' | series 별로 type값을 지정하지 않을 경우 일괄 적용될 차트의 타입 | 'bar', 'pie', 'line', 'scatter' |
  | width | String / Number | '100%' | 차트의 너비 | '100%', '150px', 150 | 
  | height | String / Number | '100%' | 차트의 높이 | '100%', '150px', 150 |
  | axesX | Object | 없음 | X축에 대한 속성 | [상세](#axesx-axesy) |
  | axesY | Object | 없음 | Y축에 대한 속성 | [상세](#axesx-axesy) |
  | title | Object | ([상세](#title)) | 차트 상단에 위치할 차트 제목 표시 여부 및 속성 |  |
  | legend | Object | ([상세](#legend)) | 차트의 범례 표시 여부 및 속성 |  |
  | dragSelection | Object | ([상세](#dragselection)) | drag-select의 사용 여부 | |
  | padding | Object | { top: 20, right: 2, left: 2, bottom: 4 } | 차트 내부 padding 값 |
  | tooltip | Object | ([상세](#tooltip)) | 차트에 마우스를 올릴 경우 툴팁 표시 여부 및 속성 | |
  | heatMapColor | Object | ([상세](#heatmap-color)) | color 옵션 | |
  | selectItem   | Object | ([상세](#selectitem)) | 차트 아이템 선택 기능 활성화 여부 및 속성 | |
  | selectLabel  | Object | ([상세](#selectlabel)) | 차트 라벨 선택 기능 활성화 여부 및 속성 | |
  
#### axesX axesY
##### type 공통
  | 이름 | 타입 | 디폴트 | 설명 | 종류(예시) |
  |------------ |-----------|---------|-------------------------|---------------------------------------------------|
  | type | String | | 축의 유형 | [time](#time-type)(categoryMode), [step](#step-type) |
  | showAxis | Boolean | true | 축 표시 여부 | true / false | 
  | startToZero | Boolean | false | 축의 시작을 0 부터 시작할지의 여부 | true / false |
  | autoScaleRatio | Number | null | Axis의 Max Buffer를 위한 속성 | 0.1 ~ 0.9 |
  | showGrid | Boolean | true | 차트 내부 그리드 표시 여부 | true / false |
  | axisLineWidth  | Number | 1 | 축의 선 굵기 | 1 ~ |
  | axisLineColor | String | '#C9CFDC' | 축의 색상 | | 
  | gridLineColor | String | '#C9CFDC' | 그리드의 색상 | | 
  | range | Array | null | 축에 표시할 값의 min, max  (autoScaleRatio = null, startToZero = false 이여야 정상 표현됩니다.) | [time](#time-type), [step](#step-type) |
  | interval | String/number | | 축에 표시되는 값의 간격 단위 ( time: string / linear: number) | |
  | labelStyle | Object | ([상세](#label-style)) | 라벨의 폰트 스타일을 설정 | |
  | formatter | function | null | 데이터가 표시되기 전에 데이터의 형식을 지정하는 데 사용   | (value) => value + '%' |
  | title | Object | ([상세](#axes-title)) | 라벨의 폰트 스타일을 설정 | |  
  | scrollbar | Object | ([상세](#axes-scrollbar)) | 차트 축 스크롤 설정(range 옵션 설정되어 있어야 정상 동작합니다.) | |

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
| 이름 | 타입 | 디폴트 | 설명 | 종류(예시) |
|-----|------|-------|-----|-----|
| show | Boolean | true | label 표시 여부 | true / false |
| fontSize | Number | 12 | 글자 크기 | |
| color | Hex, RGB, RGBA Code(String) | '#25262E' | 글자 색상 | |
| fontFamily | String | 'Roboto' | 폰트 | |
| fitWidth | Boolean | false | Label Text Ellipsis 처리 | |
| fitDir | String | 'right' | Ellipsis 방향 | ( right => 'aaa...', left => '...aaa') |
| alignToGridLine | Boolean | false | 축 line에 표시할지의 여부 | |

##### axes title
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

##### axes scrollbar
| 이름 | 타입 | 디폴트 | 설명 | 종류(예시) |
|-----|------|-------|-----|-----|
| use | Boolean | false | 스크롤 사용 여부 | true / false |
| width | Number | 14 | 스크롤 넓이 (y축일 때 적용) | |
| height | Number | 14 | 스크롤 높이 (x축일 때 적용) | |
| background | Hex, RGB, RGBA Code(String) | '#F2F2F2' | 스크롤 track 배경 색상 | |
| showButton | Boolean | false | 스크롤 버튼 표시 여부 | true / false |
| thumbStyle | Object | | 스크롤 thumb 스타일 설정 | { <br> background: '#929292', radius: 0 <br>} |

#### title
| 이름 | 타입 | 디폴트 | 설명 | 종류(예시) |
| --- | ---- | ----- | --- | ----------|
| show | Boolean | false | 차트 타이틀 표시 여부 | true /false |
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
| type | String | 'icon' | Legend type 지정 | 'icon', 'gradient' |
| position | String | 'right' | Legend 위치 | 'top', 'right', 'bottom', 'left' |
| color | Hex, RGB, RGBA Code(String) | '#353740' | 폰트 색상 | | 
| inactive | Hex, RGB, RGBA Code(String) | '#aaa' | 비활성화 상태의 폰트 색상 | | 
| width | Number | 140 | Legend의 넓이 *('left', 'right'의 경우 조절)* | | 
| height | Number | 24 | Legend의 높이 *('top', 'bottom'의 경우 조절)* | | 
| padding | Object | { top: 0, right: 0, left: 0, bottom: 0 } | Legend 내부 padding 값 | |
| allowResize | Boolean | false | Legend 영역 리사이즈 가능 여부 | |
| stopClickEvt| Boolean | false | Legend 표시 여부 | true /false |
    
#### dragSelection
| 이름 | 타입 | 디폴트 | 설명 | 종류(예시) |
| --- | ---- | ----- | --- | ----------|
| use | Boolean | false | drag-select 사용 여부 | true / false |
| keepDisplay | Boolean | true | 드래그 후 선택영역 유지 여부  | true / false  |
| fillColor | Hex, RGB, RGBA Code(String) | '#38ACEC' | 선택 영역 색상 | |
| opacity | Number | 0.65 | 선택 영역 불투명도 | 0 ~ 1 |

#### tooltip
| 이름 | 타입 | 디폴트 | 설명 | 종류(예시) |
| --- | ---- | ----- | --- | ----------|
| use | Boolean | false | tooltip 표시 여부 | true /false |
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
        // return type : string
        formatter: ({ x, y, value }) => ... ,
        
        // value + title Formatter
        // return type : string
        formatter: {
            title: ({ x, y }) => ...,
            value: ({ x, y, value }) => ...,
        }
        
        // custom formatter (html)
        // return type : string
        // 주의: 사용하시는 방법에 따라 차트의 성능이 저하될 수 있습니다.
        formatter: {
            html: ([item]) =>  `<div class="customClass">${item.name} : ${item.data.y}</div>`
        }
    },
}
```
#### heatmap color
| 이름 | 타입 | 디폴트 | 설명 | 종류(예시) |
  |------------ |-----------|---------|-------------------------|---------------------------------------------------|
| min | Hex, RGB, RGBA Code(String) | '#FFFFFF' | min color |  |
| max | Hex, RGB, RGBA Code(String) | '#5586EB' | max color |  | 
| rangeCount | number | 5 | color min - max 그라데이션 범위 개수 | |
| colorsByRange | Array | [] | 범위별 color, label 지정 | [{ color: '#FFFFFF', label: 'A' }] |
| stroke | Object | ([상세](#stroke)) | series stroke 지정 |  |
| error | Hex, RGB, RGBA Code(String) | '#FFFFFF' | series error color (value가 -1인 경우 error로 인식) |  |
| decimalPoint | number | 0 | 범주 표현 소숫값 처리 | |

##### stroke
| 이름 | 타입 | 디폴트 | 설명 | 종류(예시) |
| --- | ---- | ----- | --- | ----------|
| show | boolean | false | stroke 사용 여부 | |
| color | Hex, RGB, RGBA Code(String) | '#FFFFFF' | stroke color 지정 | |
| lineWidth | number | 1 | stroke 선 굵기 지정 | |
| opacity | number | 1 | stroke opacity 지정 | 0.1 ~ 1 |
| radius | number | 0 | border radius 조정 | |

#### selectItem
| 이름                  | 타입                          | 디폴트                 | 설명                                                              | 종류(예시) |
|----------------------|------------------------------|-----------------------|-------------------------------------------------------------------|-----------
| use                 | Boolean                       | false                 | 차트 아이템 선택 기능                                                | |
| useClick            | Boolean                       | true                  | 클릭 이벤트 사용 여부 (v-model에 바인딩한 변수로만 컨트롤 하려 할때 false) | |
| useBorder           | Boolean                       | false                 | 선택한 항목의 border 표시 여부                                        | |
| borderStyle         | Object                        | ([상세](#borderstyle)) | border 스타일을 설정                                                | |
| useSeriesOpacity    | Boolean                       | false                 | 선택한 항목을 제외한 나머지 항목들에 반투명 효과 적용 여부                  | |
| useDeselectItem     | Boolean                       | false                 | 선택된 항목을 클릭했을 때 선택 해제 여부                                 | |

##### borderStyle
| 이름 | 타입 | 디폴트 | 설명 | 종류(예시) |
| --- | ---- | ----- | --- | ----------|
| color | Hex, RGB, RGBA Code(String) | '#FFFFFF' | border color 지정 | |
| lineWidth | number | 1 | border 선 굵기 지정 | |
| opacity | number | 1 | border opacity 지정 | 0.1 ~ 1 |
| radius | number | 0 | border radius 조정 | |


#### selectLabel
| 이름                  | 타입                          | 디폴트       | 설명                                                | 종류(예시) |
|---------------------|------------------------------|-------------|---------------------------------------------------|-----------|
| use                 | Boolean                        | false     | 차트 라벨 선택 기능                                       | |
| useClick            | Boolean                        | true      | 클릭 이벤트 사용 여부 (v-model에 바인딩한 변수로만 컨트롤 하려 할때 false) | |
| limit               | Number                         | 1         | 선택할 라벨의 최대 갯수                                     | |
| useDeselectOverflow | Boolean                        | false     | limit 를 넘어 클릭 했을때 자동 deselect 를 할지 여부             | |
| showTip             | Boolean                        | false     | 선택한 label의 Tip(화살표) 생성 여부                         | |
| useSeriesOpacity    | Boolean                        | true      | 시리즈 opacity 변경 여부                                 | |
| useLabelOpacity     | Boolean                        | true      | Axes Label opacity 변경 여부                          | |
| useApproximateValue | Boolean                        | false     | 가까운 label을 선택                                     | |
| useBothAxis         | Boolean                        | false     | X축, Y축 두개 모두 이벤트 적용할지의 여부                         | |
| tipBackground       | Hex, RGB, RGBA Code(String)    | '#000000' | tip 배경색상                                          | |

### 3. resize-timeout
- Default : 0
- debounce 사용. 연속으로 이벤트가 발생한 경우, 마지막 이벤트가 끝난 시점을 기준으로 `주어진 시간 (resize-timeout)` 이후 콜백 실행

>### Event

| 이름 | 파라미터 | 설명 |
 |------|----------|------|
 | drag-select | data, range | 그래프에서 드래그를 해서 선택영역 안의 데이터와 선택영역에 대한 범위 값을 얻을 수 있다. <br><br> ex) data : [{ seriesName, seriesId, items: [] }, {...}, {...}] <br> ex) range : { xMin, xMax, yMin, yMax } <br><br> data의 요소 propery중 items 는 해당 Series의 데이터 들이 있으며 x, y값은 데이터 기반 <xp, yp 는 Canvas기반의 좌표 값 |
 | mouse-move |              | 커서의 현재 location 과 axes에 있을 경우 labelIdx, labelVal 과 데이터 영역에 있을 경우 dataIdx, maxDataVal 과 labelVal 또는 maxDataVal를 가공하기 전의 originVal 값을 반환                                                                                                                                 |
 
 * drag-select는  `dragSelection` 옵션의 `use`값이 `true` 일 때 이벤트를 발생 시킬 수 있다. 
 그리고 선택영역은 그래프에 표시된 데이터의 중앙이 포함 되어야 선택영역 내 데이터로 인식 한다.
