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


### 2. data  
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
  
### 3. options 
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
  | selectItem | Object | ([상세](#selectitem)) | 차트 아이템 선택 기능 활성화 여부 및 속성 | | 
  
#### axesX axesY
##### type 공통
  | 이름 | 타입 | 디폴트 | 설명 | 종류(예시) |
  |------------ |-----------|---------|-------------------------|---------------------------------------------------|
  | type | String | | 축의 유형 | [time](#time-type), [linear](#linear-type) |
  | showAxis | Boolean | true | 축 표시 여부 | true / false | 
  | startToZero | Boolean | false | 축의 시작을 0 부터 시작할지의 여부 | true / false |
  | autoScaleRatio | Number | null | Axis의 Max Buffer를 위한 속성 | 0.1 ~ 0.9 |
  | showGrid | Boolean | true | 차트 내부 그리드 표시 여부 | true / false |
  | axisLineColor | String | '#C9CFDC' | 축의 색상 | | 
  | gridLineColor | String | '#C9CFDC' | 그리드의 색상 | | 
  | interval | String | null | 축에 표시되는 값의 간격 단위 (ex. 'day', 'hour', 'minute'...)
  | labelStyle | Object | ([상세](#labelstyle)) | 라벨의 폰트 스타일을 설정 | |
  | plotLines | Array | ([상세](#plotline)) | plot line(임계선 표시 용도) 설정 | |
  | plotBands | Array | ([상세](#plotband)) | plot band(임계영역 표시 용도) 설정 | |
  | formatter | function | null | 데이터가 표시되기 전에 데이터의 형식을 지정하는 데 사용   | (value) => value + '%' |
  | title | Object | ([상세](#title)) | 라벨의 폰트 스타일을 설정 | |  

##### time type
   - interval (Axis Label 표기를 위한 interval)
      - 'millisecond', 'second', 'minute', 'hour', 'day', 'week' ,'month', 'quarter', 'year'
   - timeFormat
      - dayjs의 timeFormat 이용 [참고URL](https://day.js.org/docs/en/parse/string-format)

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
        formatter: ({ x, y, name }) => ... ,
        
        // 새로운 버전
        formatter: {
            value: ({ x, y, name }) => ...,
        }
    },
}
```

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
| tipBackground | Hex, RGB, RGBA Code(String) | '#000000' | tip 배경색상  | |
| tipTextColor | Hex, RGB, RGBA Code(String) | '#FFFFFF' | tip 글자 색상  | |
| tipHeight | Number | 20 | tip 높이  | |
| tipFontSize  | Number | 14 | tip 폰트 크기 | |
| tipFontFamily | String | 'Roboto' | tip 폰트 | |
| tipFontWeight | Number | 400 | tip 폰트 굵기 | 100, 200, 300, ... 900 |
| useSeriesOpacity | Boolean | false | 선택한 항목을 제외한 나머지 항목들에 반투명 효과 적용 여부  | |                                     | |

### 4. resize-timeout
- Default : 0
- debounce 사용. 연속으로 이벤트가 발생한 경우, 마지막 이벤트가 끝난 시점을 기준으로 `주어진 시간 (resize-timeout)` 이후 콜백 실행


### 5. Event
| 이름 | 파라미터 | 설명 |
 |------|----------|------|
 | drag-select | data, range | 그래프에서 드래그를 해서 선택영역 안의 데이터와 선택영역에 대한 범위 값을 얻을 수 있다. <br><br> ex) data : [{ seriesName, seriesId, items: [] }, {...}, {...}] <br> ex) range : { xMin, xMax, yMin, yMax } <br><br> data의 요소 propery중 items 는 해당 Series의 데이터 들이 있으며 x, y값은 데이터 기반 <xp, yp 는 Canvas기반의 좌표 값 |
 
 * drag-select는  `dragSelection` 옵션의 `use`값이 `true` 일 때 이벤트를 발생 시킬 수 있다. 
 그리고 선택영역은 그래프에 표시된 데이터의 중앙이 포함 되어야 선택영역 내 데이터로 인식 한다.
