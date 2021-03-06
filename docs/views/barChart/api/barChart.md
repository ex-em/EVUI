>## Desc
 - 태그는 &lt;ev-chart&gt;(이하 <차트>)으로 정의

```
<ev-chart
    :data="차트데이터"
    :options="차트속성"
    :resize-timeout="debounce wait시간(단위: ms)"
/>
```

>## Props
### 1. data  
  | 이름 | 타입 | 디폴트 | 설명 | 종류 |
  |------------ |-----------|---------|-------------------------|---------------------------------------------------|
  | series | Object | {} | 특정 데이터에 대한 시리즈 옵션 |  |
  | data   | Object | {} | 차트에 표시할 시리즈 별 데이터 |  |
  | groups | Array  | [] | Stack 차트를 위한 시리즈 그룹을 지정 |  |
  | labels | Array  | [] | 축의 각 눈금에 해당하는 명칭 |  |

#### series
  | 이름 | 타입 | 디폴트 | 설명 | 종류(예시) |
  |------------ |-----------|---------|-------------------------|---------------------------------------------------|
  | name | String | series-${index} | 특정 데이터에 대한 시리즈 옵션 |  |
  | type | String | 'bar' | 시리즈에 해당하는 데이터 표현 방식 | 'bar', 'pie', 'line', 'scatter' |
  | color | HexCode(String) | COLOR[index] | 사전에 정의된 16개 색상('#2b99f0' ~ '#df6264)을 순차적으로 적용 |  |
  | showValue | Object | ([상세](#showvalue)) | 막대 위에 값 표시 여부 및 속성 |  |

#### showValue
| 이름 | 타입 | 디폴트 | 설명 | 종류(예시) |
| --- | ---- | ----- | --- | ----------|
| use | Boolean | false | data label 표시 여부 | true /false |
| fontColor | HexCode(String) | '#000000' | 글자 색상  | |
| fontSize | Number | 12 | 글자 크기 | |
| align | String | 'end' | tooltip 테두리 색상  | 'start', 'center', 'end', 'out' |

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
        'series3' : [9, 2, 8, 2],
    },
    labels: ['a', 'b', c', 'd'],
}
```
  
### 2. options 
  | 이름 | 타입 | 디폴트 | 설명 | 종류(예시) |
  |------------ |-----------|---------|-------------------------|---------------------------------------------------|
  | type | String | '' | series 별로 type값을 지정하지 않을 경우 일괄 적용될 차트의 타입 | 'bar', 'pie', 'line', 'scatter' |
  | width | String / Number | '100%' | 차트의 너비 | '100%', '150px', 150 | 
  | height | String / Number | '100%' | 차트의 높이 | '100%', '150px', 150 |
  | thickness | Number | 1 | 차트 막대의 너비 | 0.1 ~ 1 |
  | horizontal | Boolean | false | 차트 막대의 방향 - 수평 전환 여부 | true, false |
  | axesX | Object | 없음 | X축에 대한 속성 | [상세](#axesx-axesy) |
  | axesY | Object | 없음 | Y축에 대한 속성 | [상세](#axesx-axesy) |
  | title | Object | ([상세](#title)) | 차트 상단에 위치할 차트 제목 표시 여부 및 속성 |  |
  | legend | Object | ([상세](#legend)) | 차트의 범례 표시 여부 및 속성 |  |
  | tooltip | Object | ([상세](#tooltip)) | 차트에 마우스를 올릴 경우 툴팁 표시 여부 및 속성 | |
  | indicator | Object | ([상세](#indicator)) | 지표선 | |
  | maxTip | Object | ([상세](#maxtip)) | 최대값에 tip 표시(값 표시) 여부 및 속성 | |
  | selectItem | Object | ([상세](#selectitem)) | 차트 아이템 선택 기능 활성화 여부 및 속성 | | 

#### axesX axesY
##### type 공통
  | 이름 | 타입 | 디폴트 | 설명 | 종류(예시) |
  |------------ |-----------|---------|-------------------------|---------------------------------------------------|
  | type | String | | 축의 유형 | [linear](#linear-type), [time](#time-type), [log](#Logarithmic-type), [step](#step-type) |
  | showAxis | Boolean | true | 축 표시 여부 | true / false | 
  | startToZero | Boolean | false | 축의 시작을 0 부터 시작할지의 여부 | true / false |
  | autoScaleRatio | Number | null | Axis의 Max Buffer를 위한 속성 | 0.1 ~ 0.9 |
  | showGrid | Boolean | true | 차트 내부 그리드 표시 여부 | true / false |
  | axisLineColor | String | '#C9CFDC' | 축의 색상 | | 
  | gridLineColor | String | '#C9CFDC' | 그리드의 색상 | | 
  | range | Array | null | 축에 표시할 값의 min, max | [0, 100] |
  | horizontal | Boolean | null | horizontal Bar 차트 표시를 위한 속성 | true / false | 
  | interval | String | null | 축에 표시되는 값의 간격 단위 (축의 타입에 따라 달라짐)
  | labelStyle | Object | ([상세](#labelstyle)) | 라벨의 폰트 스타일을 설정 | |

##### linear type
   - interval (Axis Label 표기를 위한 interval)
      - 미지정 시 Chart 내부에서 해당 Axis 데이터의 max/min value를 기반으로 interval을 구함
   - Linear Type의 Axis Label은 각 숫자 단위에 맞춰 'K', 'M', 'G'로 숫자를 변환하여 보여줌
      - 예를 들어, Label에 필요한 값이 1,500일 경우 '1.5K'로 표기
      
##### time type
   - interval (Axis Label 표기를 위한 interval)
      - 'millisecond', 'second', 'minute', 'hour', 'day', 'week' ,'month', 'quarter', 'year'
   - timeFormat
      - moment의 timeFormat 이용 [참고URL](#https://momentjs.com/docs/#/parsing/string-format/)
   - categoryMode
      - 축에 표시할 시간 값을 `data`옵션의 `labels`속 값들로 표시할지의 여부
      
##### Logarithmic type
   - logarithmic Type Axis는 Axis의 min max를 로그로 계산하여 자동으로 추가 buffer값을 제공
   - Linear Type의 Axis Label은 각 숫자 단위에 맞춰 'K', 'M', 'G'로 숫자를 변환하여 보여줌
      - 예를 들어, Label에 필요한 값이 1,500일 경우 '1.5K'로 표
      
##### step type
   - timeMode
      - Step Axis를 Time 기반으로 변경, default: false
   - timeFormat
      - moment의 timeFormat 이용 [참고URL](#https://momentjs.com/docs/#/parsing/string-format/)

##### labelStyle
| 이름 | 타입 | 디폴트 | 설명 |
|-----|------|-------|-----|
| fontSize | Number | 12 | 글자 크기 |
| color | HexCode (String) | '#25262E' | 글자 색상 |
| fontFamily | String | 'Roboto' | 폰트 | 
| fitWidth | Boolean | false | Label Text Ellipsis 처리 |
| fitDir | String | 'right' | Ellipsis 방향 |
  
#### title
| 이름 | 타입 | 디폴트 | 설명 | 종류(예시) |
| --- | ---- | ----- | --- | ----------|
| show | Boolean | false | 타이틀 표시 여부 | true /false |
| height | Number | 40 | 타이틀 영역이 높이 | |
| text | String | '' | 타이틀 | | 
| style | Object | | 타이틀 폰트 스타일 | | 
| style.fontSize | Number | 15 | 글자 크기 | | 
| style.color | HexCode(String) | '#000' | 글자 색상 | | 
| style.fontFamily | String | 'Roboto' | 글자체 | |  
  
#### legend
| 이름 | 타입 | 디폴트 | 설명 | 종류(예시) |
| --- | ---- | ----- | --- | ----------|
| show | Boolean | false | Legend 표시 여부 | true /false |
| position | String | 'right' | Legend 위치 | 'top', 'right', 'bottom', 'left' |
| color | HexCode(String) | '#353740' | 폰트 색상 | | 
| inactive | HexCode(String) | '#aaa' | 비활성화 상태의 폰트 색상 | | 
| width | Number | 140 | Legend의 넓이 *('left', 'right'의 경우 조절)* | | 
| height | Number | 24 | Legend의 높이 *('top', 'bottom'의 경우 조절)* | | 

#### tooltip
| 이름 | 타입 | 디폴트 | 설명 | 종류(예시) |
| --- | ---- | ----- | --- | ----------|
| use | Boolean | true | tooltip 표시 여부 | true /false |
| backgroundColor | HexCode(String) | '#4C4C4C' | tooltip 배경 색상  | |
| borderColor | HexCode(String) | '#666666' | tooltip 테두리 색상  | |
| useShadow | Boolean | false | 그림자 사용 여부  | |
| shadowOpacity | Number | 0.25 | 그림자 투명도  | |
| throttledMove | Boolean | false | 데이터 조회 Throttling 처리 유무  | |
| debouncedHide | Boolean | false | 좌표 이동 시 tooltip hide 여부  | |

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
| indicatorColor | HexCode(String) | '#000000' | indicator 색상  | |
| tipBackground | HexCode(String) | '#000000' | maxTip 배경색상  | |
| tipTextColor | HexCode(String) | '#FFFFFF' | maxTip 글자 색상  | |

#### selectItem
| 이름 | 타입 | 디폴트 | 설명 | 종류(예시) |
| --- | ---- | ----- | --- | ----------|
| use | Boolean | false | 차트 아이템 선택 기능  | |
| showTextTip | Boolean | false | 선택한 label의 최대값 표시  | |
| showTip | Boolean | false | 선택한 label의 상단에 화살표 표시  | |
| showIndicator | Boolean | false | 선택한 label의 indicator 표시  | |
| fixedPosTop | Boolean | false | indicator 및 tip의 위치를 최대값으로 고정  | |
| useApproximateValue | Boolean | false | 가까운 label을 선택  | |
| indicatorColor | HexCode(String) | '#000000' | indicator 색상  | |
| tipBackground | HexCode(String) | '#000000' | tip 배경색상  | |
| tipTextColor | HexCode(String) | '#FFFFFF' | tip 글자 색상  | |

>### Event
| 이름 | 파라미터 | 설명 |
 |------|----------|------|
 | click | selectedItem | 클릭된 series의 label, value, seriesID 값을 반환 |
 | dbl-click | selectedItem | 더블 클릭된 series의 label, value, seriesID 값을 반환 |
 * 단, `selectedItem` 옵션의 `use`값이 `true` 이어야 `selectedItem` 객체를 반환하며 false일 경우 빈 객체를 반환


### 3. resize-timeout
- Default : 0
- debounce 사용. 연속으로 이벤트가 발생한 경우, 마지막 이벤트가 끝난 시점을 기준으로 `주어진 시간 (resize-timeout)` 이후 콜백 실행

