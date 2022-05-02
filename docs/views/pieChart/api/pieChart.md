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
- 현재 선택된 Item에 대한 정보 (seriesID)
#### Example
```
const selectedItem = ref({
    seriesID: 'series1', // Series ID (key)
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
  | color | Hex, RGB, RGBA Code(String) | COLOR[index] | 사전에 정의된 16개 색상('#2b99f0' ~ '#df6264)을 순차적으로 적용 |  |
  | stroke | Object | { use: true, color: '#FFFFFF', lineWidth: 2 } | 차트의 테두리선 표시 여부 및 색상, 두께를 설정하는 옵션 | |
  | showValue | Object | ([상세](#showvalue)) | 조각 위에 값 표시 여부 및 속성 |  |

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
| 이름 | 타입 | 디폴트 | 설명 | 종류(예시) |
| --- | ---- | ----- | --- | ----------|
| use | Boolean | false | data label 표시 여부 | true /false |
| textColor | Hex, RGB, RGBA Code(String) | '#000000' | 글자 색상  | |
| fontSize | Number | 12 | 글자 크기 | |
| formatter | function | null | 데이터가 표시되기 전에 데이터의 형식을 지정하는 데 사용   | (value) => value + '%' |

  
### 3. options 
  | 이름 | 타입 | 디폴트 | 설명 | 종류(예시) |
  |------------ |-----------|---------|-------------------------|---------------------------------------------------|
  | type | String | '' | series 별로 type값을 지정하지 않을 경우 일괄 적용될 차트의 타입 | 'bar', 'pie', 'line', 'scatter' |
  | width | String / Number | '100%' | 차트의 너비 | '100%', '150px', 150 | 
  | height | String / Number | '100%' | 차트의 높이 | '100%', '150px', 150 |
  | title | Object | ([상세](#title)) | 차트 상단에 위치할 차트 제목 표시 여부 및 속성 |  |
  | legend | Object | ([상세](#legend)) | 차트의 범례 표시 여부 및 속성 |  |
  | doughnutHoleSize | number | 0 | 내부 hole 사이즈 | 0 ~ 1 |
  | pieStroke | Object | { show: true, color: '#FFFFFF', lineWidth: 2 } | 차트의 테두리선 표시 여부 및 색상, 두께를 설정하는 옵션 | |
  | tooltip | Object | ([상세](#tooltip)) | 차트에 마우스를 올릴 경우 툴팁 표시 여부 및 속성 | |
   
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
| showAllValueInRange | Boolean | false | 동일한 axes값을 가진 전체 series를 Tooltip에 표시 |
| formatter | function / Object | null | 데이터가 표시되기 전에 데이터의 형식을 지정하는 데 사용   | (아래 코드 참고) |
```
const chartOptions = {
    tooltip: {
        // 이전 버전 호환용으로 valueFormatter를 이전버전과 같이 사용 가능
        formatter: ({ name, value }) => ... ,
        
        // 새로운 버전
        formatter: {
            value: ({ name, value }) => ...,
        }
    },
}
```
#### selectItem
| 이름 | 타입 | 디폴트 | 설명 | 종류(예시) |
| --- | ---- | ----- | --- | ----------|
| use | Boolean | false | 차트 아이템 선택 기능  | |

### 4. resize-timeout
- Default : 0
- debounce 사용. 연속으로 이벤트가 발생한 경우, 마지막 이벤트가 끝난 시점을 기준으로 `주어진 시간 (resize-timeout)` 이후 콜백 실행

### 5. Event
| 이름 | 파라미터 | 설명 |
 |------|----------|------|
| click | selectedItem | 클릭된 series의 value, seriesID 값을 반환 |
| dbl-click | selectedItem | 더블 클릭된 series의 value, seriesID 값을 반환 |
* 단, `selectedItem` 옵션의 `use`값이 `true` 이어야 `selectedItem` 객체를 반환하며 false일 경우 빈 객체를 반환
