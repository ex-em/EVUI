>## Desc
 - 태그는 &lt;ev-chart&gt;(이하 <차트>)으로 정의

```
<ev-chart
    :data="차트데이터"
    :options="차트속성"
/>
```

>## Props, Event 
1. [Bar chart](../barChart)
2. [Line chart](../lineChart)
3. [Scatter chart](../scatterChart)
4. [Pie chart](../pieChart)


>## dragSelection

콤보 차트도 `options.dragSelection.use: true` 로 드래그 선택을 켤 수 있습니다. `horizontal: true` 는 지원하지 않습니다(막대의 x축이 값 축이 되어 x 방향 드래그가 범주·시간 범위를 뜻하지 않습니다).

선택 영역은 line·bar 차트와 같이 y축 전체 높이로 고정되고, `drag-select` 페이로드의 `data` 에는 bar·line·scatter 시리즈가 함께 담깁니다. 다만 판정 기준이 시리즈 타입별로 다릅니다 — bar 는 막대의 x 구간이 드래그 구간에 **걸치기만 해도** 담기고, line 은 점이 구간(±1px) 안에 들어야 담기며, scatter 는 X·Y 박스(±1px)로 판정합니다. 같은 드래그에서 시리즈별 건수가 다를 수 있습니다.

`range.yMin`/`yMax` 는 **첫 번째 y축**(`axesY[0]`) 기준입니다. y축을 2개 이상 쓰는 콤보에서 두 번째 축 시리즈의 값으로 읽으면 어긋납니다. `range.xMin`/`xMax` 는 x축의 최소·최대값 사이 선형 보간이므로 문자 라벨을 쓰는 `step` 축에서는 `NaN` 이 됩니다(차트 타입 공통 동작).
