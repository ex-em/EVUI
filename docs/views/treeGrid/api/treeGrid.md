
>### Desc
 - 태그는 &lt;ev-tree-grid&gt;(이하 <트리그리드>)로 정의

```
<ev-tree-grid
    v-model:selected="selectedMV"
    v-model:checked="checkedMV"
    :columns="columns"
    :rows="tableData"
    :width="widthMV"
    :height="heightMV"
    :option="{}"
    @check-row="onCheckedRow"
    @check-all="onAllCheckedRow"
    @click-row="onClickRow"
    @dblclick-row="onDoubleClickRow"
>
  <template #{필드명}></template>
  <template #toolbar="{ item }"></template>
</ev-tree-grid>
```
- `#{필드명}` 지정해서 Cell Render 설정
- `#toolbar` 지정해서 Toolbar 표시

### Props
| 이름 | 타입               | 디폴트                | 설명                                      | 종류                       |
| --- |------------------|--------------------|-----------------------------------------|--------------------------|
| columns | Array            | []                 | 컬럼 리스트                                  |                          |
| rows | Array            | []                 | Tree Data 리스트                           |                          |
| width | String, Number   | '100%'             | 그리드 넓이                                  | '50%', '50px', 50        |
| height | String, Number   | '100%'             | 그리드 높이                                  | '50%', '50px', 50        |
| selected | Array            | []                 | 선택된 Row 데이터                             |                          |
| checked | Array            | []                 | 체크된 Row 데이터                             |                          |
| option | Object           | {}                 | 그리드 옵션                                  |                          |
|  | adjust           | false              | 그리드의 너비에 맞게 컬럼 너비를 자동으로 조절한다.           |                          |
|  | showHeader       | true               | 헤더 표시 여부를 설정한다.                         |                          |
|  | rowHeight        | 35                 | Row 높이를 설정한다.                           | `min-height: 35`         |
|  | rowMinHeight     | null               | Row 높이를 `min-height`보다 작게 설정한다.         |                          |
|  | columnWidth      | 40                 | 기본 컬럼 너비를 설정 한다.                        | `min-width: 40px`        |
|  | useCheckbox      | {}                 | 각 Row별 체크박스 사용 여부 및 단일 선택이나 다중 선택을 설정한다. |                          |
|  |                  | use                | 체크박스 사용 여부                              | boolean                  |
|  |                  | mode               | 단일 및 다중 선택 설정                           | 'multi', 'single'        |
|  |                  | headerCheck        | 헤더 체크박스 사용 여부                           | boolean                  |
|  | useSelection     | {}                 | 각 row별 선택 여부 및 단일 선택이나 다중 선택을 설정한다.     |                          |
|  |                  | use                | Selection 사용 여부                         | Boolean                  |
|  |                  | multiple           | 다중 선택 설정 여부                             | Boolean                  |
|  |                  | limitCount         | 선택 가능한 row의 수를 제한                       | Number                   |
|  | style            | {}                 | 그리드의 스타일을 설정한다.                         |                          |
|  |                  | stripe             | Row의 배경색을 Stripe 스타일로 설정한다.             | boolean                  |
|  |                  | border             | 그리드의 Border 여부를 설정한다.                   | 'none', 'rows'           |
|  |                  | highlight          | 지정한 Row에 Highlight 효과를 설정한다.            | `rowIndex`               |
|  | customContextMenu | []                 | 우클릭시 보여지는 컨텍스트 메뉴를 설정한다.                |                          |
|  |                  | menuItems          | 컨텍스트 메뉴                                 |                          |
|  | page             | {}                 | 페이지 설정                                  |                          |
|  |                  | use                | 페이지 사용 여부                               | Boolean                  |
|  |                  | isInfinite         | Infinite Scroll 사용 여부                   | Boolean                  |
|  |                  | useClient          | client-side Paging 사용 여부                | Boolean                  |
|  |                  | total              | 총 항목 수                                  | Number                   |
|  |                  | perPage            | 각 페이지의 항목 수                             | Number                   |
|  |                  | currentPage        | 현재 페이지 번호                               | Number                   |
|  |                  | visiblePage        | 보여지는 Pagination 버튼 수                    | Number                   |
|  |                  | order              | Pagination 위치                           | 'center', 'left', 'right' |
|  |                  | showPageInfo       | 페이지 정보 표시 여부                            | Boolean                  |
|  | useSummary       | false              | 하단에 summary row 가 표시 된다.                | Boolean                  |
|  | expandIcon       | 'tree-expand-icon' | expand 상태인 노드의 아이콘                      | `ev-icon`                |
|  | collapseIcon     | 'tree-expand-icon' | collapse 상태인 노드의 아이콘                    | `ev-icon`                |
|  | parentIcon       | 'tree-parent-icon' | 자식 노드가 있는 노드의 아이콘                       | `ev-icon`, 'none'        |
|  | childIcon        | 'tree-child-icon'  | 자식 노드가 없는 노드의 아이콘                       | `ev-icon`, 'none'        |

### Columns
| 이름              | 타입      | 설명                                                 | 종류                                               | 필수 |
|-----------------|---------|----------------------------------------------------|--------------------------------------------------| --- |
| caption         | String  | 컬럼명                                                | ex) '인스턴스명'                                      | Y |
| field           | String  | 필드명                                                | ex) 'instance_name'                              | Y |
| type            | String  | 데이터 타입                                             | 'string', 'number', 'stringNumber', 'float', 'boolean' | Y |
| hide            | Boolean | 컬럼 숨김 여부                                           | Boolean                                          | N |
| width           | Number  | 컬럼 넓이                                              | ex) 150                                          | N |
| searchable      | Boolean | 검색 대상 여부                                           | Boolean                                          | N |
| align           | String  | 사용자 지정 정렬                                          | 'center', 'left', 'right'                        | N |
| decimal         | Number  | 데이터 타입이 float 일 때 소수점 자리 표시 수                      | ex) 0~20 (디폴트: 3 )                               | N |
| summaryType     | String  | 계산 타입                                              | 'sum', 'average', 'max', 'min', 'count'          | N |
| summaryRenderer | String  | Summary 에 표시할 텍스트 또는 계산 값                          | ex) 'Sum: {0}'                                   | N |
| summaryData     | Array   | Summary 할 대상 추가 시 summaryRenderer 와 함께 사용          | ex) '{0}({1}%)'                                  | N |
| expandColumn    | Boolean | 트리그리드를 확장하는데 사용하는 컬럼을 의미, 설정하지 않으면 자동으로 첫번째 컬럼에 적용 | ex) 'expandColumn: true'                         | N |

### Event
| 이름 | 파라미터 | 설명 |
| ---- | ------- | ---- |
| check-row | event, row, index | row의 체크박스가 체크 되었을때 호출된다. |
| check-all | event, rows | 헤더의 체크박스가 체크 되었을때 호출 된다. 전체 row의 체크박스를 체크한다. |
| click-row | event, row | row가 클릭 되었을 때 호출된다. |
| dblclick-row | event, row | row가 더블 클릭 되었을 때 호출된다. |
| page-change | event | page 정보가 변경되었을 때 호출된다. |
