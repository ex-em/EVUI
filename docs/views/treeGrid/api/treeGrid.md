
>### Desc
 - 태그는 &lt;ev-grid&gt;(이하 <그리드>)로 정의

```
<ev-grid
    v-model:selected="selectedMV"
    v-model:checked="checkedMV"
    :is-tree-grid="true"
    :columns="columns"
    :tree-data="tableData"
    :width="widthMV"
    :height="heightMV"
    :option="{}"
    @check-row="onCheckedRow"
    @check-all="onAllCheckedRow"
    @click-row="onClickRow"
    @dblclick-row="onDoubleClickRow"
>
</ev-grid>
```

 - <그리드>와 동일하게 사용
 - `is-tree-grid`를 `true`로 설정 (*필수)
 - `tree-data`에 row 데이터를 설정 (*필수)

### Props
| 이름 | 타입 | 디폴트 | 설명 | 종류 |
| --- | ---- | ----- | ---- | --- |
| is-tree-grid | Boolean | true | 트리 그리드 여부 | |
| columns | Array | [] | 컬럼 리스트 | |
| tree-data | Array | [] | Tree Data 리스트 | |
| width | String, Number | '100%' | 그리드 넓이 | '50%', '50px', 50 |
| height | String, Number | '100%' | 그리드 높이 | '50%', '50px', 50 |
| selected | Array | [] | 선택된 Row 데이터 |  |
| checked | Array | [] | 체크된 Row 데이터 |  |
| option | Object | {} | 그리드 옵션 |  |
|  | adjust | false | 그리드의 너비에 맞게 컬럼 너비를 자동으로 조절한다. |  |
|  | showHeader | true | 헤더 표시 여부를 설정한다. |  |
|  | rowHeight | 35 | Row 높이를 설정한다. | `min-height: 35` |
|  | rowMinHeight | null | Row 높이를 `min-height`보다 작게 설정한다. |  |
|  | columnWidth | 40 | 기본 컬럼 너비를 설정 한다. | `min-width: 40px` |
|  | useFilter | false | 필터 기능 사용 여부, 컨텍스트 메뉴에서 'Filter On' 메뉴를 클릭하여 설정한다. |  |
|  | useCheckbox | {} | 각 Row별 체크박스 사용 여부 및 단일 선택이나 다중 선택을 설정한다. |  |
|  |  | use | 체크박스 사용 여부 | boolean |
|  |  | mode | 단일 및 다중 선택 설정 | 'multi', 'single' |
|  |  | headerCheck | 헤더 체크박스 사용 여부 | boolean |
|  | style | {} | 그리드의 스타일을 설정한다. |  |
|  |  | stripe | Row의 배경색을 Stripe 스타일로 설정한다. | boolean |
|  |  | border | 그리드의 Border 여부를 설정한다. | 'none', 'rows' |
|  |  | highlight | 지정한 Row에 Highlight 효과를 설정한다. | `rowIndex` |
|  | customContextMenu | [] | 우클릭시 보여지는 컨텍스트 메뉴를 설정한다. |  |
|  |  | menuItems | 컨텍스트 메뉴 |  |
|  | expandIcon | 'tree-expand-icon' | expand 상태인 노드의 아이콘 | `ev-icon` |
|  | collapseIcon | 'tree-expand-icon' | collapse 상태인 노드의 아이콘 | `ev-icon` |
|  | parentIcon | 'tree-parent-icon' | 자식 노드가 있는 노드의 아이콘 | `ev-icon`, 'none' |
|  | childIcon | 'tree-child-icon' | 자식 노드가 없는 노드의 아이콘 | `ev-icon`, 'none' |

### Event
| 이름 | 파라미터 | 설명 |
 | ---- | ------- | ---- |
 | check-row | event | Row의 체크박스가 체크 되었을때 호출된다. |
 | check-all | event | 헤더의 체크박스가 체크 되었을때 호출 된다. 전체 Row의 체크박스를 체크한다. |
 | click-row | newValue | Row가 클릭 되었을 때 호출된다. |
 | dblclick-row | newValue | Row가 더블 클릭 되었을 때 호출된다. |

 >### 참고
  - <그리드>와 동일한 기능을 제공 (단, 현재 `Sorting` `Filtering` `Rendering` 기능은 제외)
