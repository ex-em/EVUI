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

선택 영역은 line·bar 차트와 같이 y축 전체 높이로 고정되고, `drag-select` 페이로드의 `data` 에는 bar·line·scatter 시리즈가 함께 담깁니다. 다만 판정 기준이 시리즈 타입별로 다릅니다 — bar 는 막대의 x 구간이 드래그 구간에 **걸치기만 해도** 담기고, line 은 점이 구간(±1px) 안에 들어야 담기며, scatter 는 X·Y 박스(±1px)로 판정합니다. 같은 드래그에서 시리즈별 건수가 다를 수 있습니다. bar·line 은 값이 `null` 이거나 축 범위를 넘은 포인트도 담습니다 — 두 타입 모두 x 좌표가 라벨 기준이라 값과 무관하게 정해집니다.

scatter 시리즈만으로 이루어진 콤보도 이 y축 전체 밴드를 받습니다 — 같은 데이터를 `options.type: 'scatter'` 로 선언했을 때의 자유 박스 선택과 다릅니다. 밴드가 플롯 영역 전체 높이라 scatter 의 Y 판정이 사실상 모든 점을 통과시키므로, 드래그를 위쪽에서 시작해도 아래쪽에서 시작해도 같은 건수가 담깁니다. 모바일 터치 드래그 선택도 `options.type: 'scatter'` 에서만 동작합니다.

`range.yMin`/`yMax` 는 **첫 번째 y축**(`axesY[0]`) 기준입니다. y축을 2개 이상 쓰는 콤보에서 두 번째 축 시리즈의 값으로 읽으면 어긋납니다. `range.xMin`/`xMax` 는 x축의 최소·최대값 사이 선형 보간이므로 문자 라벨을 쓰는 `step` 축에서는 `NaN` 이 됩니다(차트 타입 공통 동작). 범주형 축(`categoryMode: true`)에서는 이 보간이 막대의 인덱스 슬롯 배치와 어긋나 최대 약 1 막대 폭의 오차가 있습니다 — 아래 DragSelection 예제가 `categoryMode: true` 라 화면에 표시되는 `X min`/`X max` 에도 그 오차가 실립니다.

EvChartZoom 의 zoom 모드에서는 `drag-select` 리스너 대신 줌이 실행됩니다. zoom 모드가 차트 타입을 가리지 않고 `dragSelection.use: true` 를 덮어쓰므로, 소비처가 `dragSelection` 을 켜지 않은 콤보도 드래그 줌 대상이 됩니다. 드래그 줌은 `time` 축에서만 동작하므로(차트 타입 공통 제약) `step` 축 콤보는 선택 영역만 그려지고 줌은 일어나지 않습니다.

줌 구간은 **매치된 첫 시리즈** 하나만 보고 계산합니다. 콤보는 시리즈마다 판정 기준이 달라(bar 는 걸침, line·scatter 는 점 포함) 어느 시리즈가 첫 번째로 매치되는지에 따라 줌 창이 양 끝에서 최대 1 인덱스 달라집니다. 시리즈 선언 순서·범례 on/off 가 그 선택을 바꾸며, `overlapping.use: true` 는 bar 시리즈를 앞으로 정렬하므로 bar 기준으로 확정됩니다.
