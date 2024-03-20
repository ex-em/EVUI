>## Desc
>### 1. 차트 브러쉬 (Chart Brush)
 - 태그는 &lt;ev-chart-brush&gt;(이하 <차트 브러쉬>)으로 정의
 - Chart와 Brush를 Chart Group로 감싸 차트의 줌 위치와 원본 차트를 보여주는 Brush 기능 사용 가능.

```
<ev-chart-group
    ...
>
  <ev-chart
    ...
  />
  <ev-chart-brush :options='options'/>
  <ev-chart
    ...
  />
  <ev-chart-brush :options='options2'/>
</ev-chart-group>
```   
<br/>
   
>## 브러쉬 사용 가능한 차트
1. [Line Chart](../lineChart)

<br/>

>## Props
### 1. options
| 이름           | 타입      | 디폴트                | 설명                                                                      | 종류(예시)                       | 
|--------------|---------|--------------------|-------------------------------------------------------------------------|---------------------------------------------------|
| show         | Boolean | true               | 차트 브러쉬를 사용할지 설정                                                         |                              |
| chartIdx     | Number  | 0                  | Chart Group으로 묶여있는 chart 중 몇 번째의(인덱스) 차트를 브러쉬에 보여줄지 설정                  |                              |
| height       | Number  | 100                | 차트 브러쉬의 높이 설정                                                           |                                 |
| useDebounce  | Boolean | true               | true 이면 마지막 브러쉬 영역으로 차트가 업데이트 되고 false 이면 브러쉬 영역 조절에 따라 동시에 차트도 업데이트 됨. |                                 |
| showLabel    | Boolean | false              | Brush의 x, y 축 라벨을 보여줄지 설정                                               |                                 |
| selection    | Object  | ([상세](#selection)) | Brush 영역의 스타일 설정                                                        |                                 |
| useWheelMove | Boolean | true               | Brush 영역에서 마우스 휠을 사용하여 브러쉬를 이동할지 설정                           |                                 |

#### selection
| 이름         | 타입      | 디폴트  | 설명              | 종류(예시)                       | 
|------------|---------|------|-----------------|---------------------------------------------------|
| fillColor  | Hex, RGB, RGBA Code(String) | '#38ACEC' | Brush 영역 색상 설정  |                              |
| opacity    | Number  | 0.65 | Brush 영역 투명도 설정 |                              |
