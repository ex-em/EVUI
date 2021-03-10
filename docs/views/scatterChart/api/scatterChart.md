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
  | labels | Array  | [] | 축의 각 눈금에 해당하는 명칭, line Chart 에서는 time만 인정 |  |

#### series
  | 이름 | 타입 | 디폴트 | 설명 | 종류(예시) |
  |------------ |-----------|---------|-------------------------|---------------------------------------------------|
  | name | String | series-${index} | 특정 데이터에 대한 시리즈 옵션 |  |
  | type | String | 'bar' | 시리즈에 해당하는 데이터 표현 방식 | 'bar', 'pie', 'line', 'scatter' |
  | color | String | COLOR[index] | 사전에 정의된 16개 색상('#2b99f0' ~ '#df6264)을 순차적으로 적용 |  |
  | pointSize | Number | 3 | 차트에 표시될 점의 사이즈 |  |
  | pointStyle | String | 'circle' | 차트에 표시될 점의 모양 | 'triangle', 'rect', 'rectRounded', 'rectRot', 'cross', 'crossRot', 'star', 'line', 'dash' |
  
#### data example
```
const time = moment().format('YYYY-MM-DD HH:mm:ss');
const chartData = 
  series: {
    series1: { name: 'series1', pointSize: 5, pointStyle: 'circle' },
    series2: { name: 'series2', pointSize: 6, pointStyle: 'rect' },
  },
  data: {
    series1: [1, 2, 3, 4],
    series2: [5, 2, 0, 8],
  },
  labels: [
    moment(time),
    moment(time).add(1, 'day'),
    moment(time).add(2, 'day'),
    moment(time).add(3, 'day'),
  ],
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
  | indicator | Object | ([상세](#indicator)) | 지표선 | |

#### axesX axesY
##### type 공통
  | 이름 | 타입 | 디폴트 | 설명 | 종류(예시) |
  |------------ |-----------|---------|-------------------------|---------------------------------------------------|
  | type | String | | 축의 유형 | [time](#time-type) |
  | showAxis | Boolean | true | 축 표시 여부 | true / false | 
  | startToZero | Boolean | false | 축의 시작을 0 부터 시작할지의 여부 | true / false |
  | autoScaleRatio | Number | null | Axis의 Max Buffer를 위한 속성 | 0.1 ~ 0.9 |
  | showGrid | Boolean | true | 차트 내부 그리드 표시 여부 | true / false |
  | axisLineColor | String | '#C9CFDC' | 축의 색상 | | 
  | gridLineColor | String | '#C9CFDC' | 그리드의 색상 | | 
  | interval | String | null | 축에 표시되는 값의 간격 단위 (ex. 'day', 'hour', 'minute'...)
  | labelStyle | Object | ([상세](#labelstyle)) | 라벨의 폰트 스타일을 설정 | |
      
##### time type
   - interval (Axis Label 표기를 위한 interval)
      - 'millisecond', 'second', 'minute', 'hour', 'day', 'week' ,'month', 'quarter', 'year'
   - timeFormat
      - moment의 timeFormat 이용 [참고URL](#https://momentjs.com/docs/#/parsing/string-format/)
   - categoryMode
      - 축에 표시할 시간 값을 `data`옵션의 `labels`속 값들로 표시할지의 여부

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

#### indicator
| 이름 | 타입 | 디폴트 | 설명 | 종류(예시) |
| --- | ---- | ----- | --- | ----------|
| use | Boolean | true | indicator 사용 여부 | |
| color | HexCode(String) | '#EE7F44' | 색상  | |


### 3. resize-timeout
- Default : 0
- debounce 사용. 연속으로 이벤트가 발생한 경우, 마지막 이벤트가 끝난 시점을 기준으로 `주어진 시간 (resize-timeout)` 이후 콜백 실행
