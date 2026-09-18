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

드래그 중 hover 갱신과 아래 `dragRange` 전달은 `dragSelection.updateHoverOnDrag: true` 일 때만 동작합니다(기본 `false`). 끄면 드래그 중에는 선택 영역만 갱신됩니다 — 하이라이트·인디케이터는 드래그를 시작할 때 지워지고, 툴팁은 라이브러리가 건드리지 않습니다.

드래그하는 **동안**에는 `tooltip.formatter.html` 이 2번째 인자로 `{ dragRange: { from, to } }` 를 함께 받습니다. `from` 은 드래그를 시작한 지점, `to` 는 현재 커서 지점의 x축 값이고, mouseup 때 `drag-select` 가 주는 `range.xMin`/`xMax` 와 **정확히 같은 값**입니다 — 콤보는 `options.type` 이 없어 heatMap 전용 블록 스냅 분기를 타지 않고 위 `range` 와 같은 계산을 그대로 재사용합니다. 따라서 위에 적은 축 제약(`step` 축 `NaN`, 범주형 축의 약 1 막대 폭 오차)도 그대로 적용됩니다. 시작/현재 순서를 유지하므로 역방향(오른쪽 → 왼쪽) 드래그면 `from` 이 `to` 보다 큽니다. 축을 선언하지 않은 구성(시리즈 레벨 `type: 'pie'` 만 둔 콤보)은 `range` 가 `null` 이라 2번째 인자도 전달되지 않습니다. 드래그 중이 아닐 때도 전달되지 않으므로 기존 formatter 는 그대로 동작합니다.

드래그 중에는 툴팁·인디케이터·하이라이트가 커서를 따라 갱신되며, `mouse-move` 이벤트는 발생하지 않습니다. 커서 위치에 데이터가 없으면(막대 사이 간격, 값이 `null` 인 라벨) hit 이 0개라 툴팁이 통째로 사라지는데, `dragSelection.showTooltipOnEmpty: true` 를 주면 그 프레임에서도 `formatter.html` 이 빈 seriesList 와 `{ dragRange }` 로 호출되어 구간 헤더만 남습니다. 드래그가 끝나면 이 툴팁은 즉시 사라집니다.

EvChartZoom 의 zoom 모드에서는 `drag-select` 리스너 대신 줌이 실행됩니다. zoom 모드가 차트 타입을 가리지 않고 `dragSelection.use: true` 를 덮어쓰므로, 소비처가 `dragSelection` 을 켜지 않은 콤보도 드래그 줌 대상이 됩니다. 드래그 줌은 `time` 축에서만 동작하므로(차트 타입 공통 제약) `step` 축 콤보는 선택 영역만 그려지고 줌은 일어나지 않습니다.

줌 구간은 **매치된 첫 시리즈** 하나만 보고 계산합니다. 콤보는 시리즈마다 판정 기준이 달라(bar 는 걸침, line·scatter 는 점 포함) 어느 시리즈가 첫 번째로 매치되는지에 따라 줌 창이 양 끝에서 최대 1 인덱스 달라집니다. 시리즈 선언 순서·범례 on/off 가 그 선택을 바꾸며, `overlapping.use: true` 는 bar 시리즈를 앞으로 정렬하므로 bar 기준으로 확정됩니다.
