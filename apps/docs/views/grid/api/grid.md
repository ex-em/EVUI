
>### Desc
 - 태그는 &lt;ev-grid&gt;(이하 <그리드>)로 정의

```
<ev-grid
    v-model:selected="selectedMV"
    v-model:checked="checkedMV"
    :uncheckable="uncheckable"
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
  <template #rowDetail="{ item }"></template>
</ev-grid>
```
 - `#{필드명}` 지정해서 Cell Render 설정
 - `#toolbar` 지정해서 Toolbar 표시
 - `#rowDetail` Row 하단에 사용자 정의 컴포넌트 표현, 사용시 가상스크롤 미적용 rowDetail 옵션과 같이 사용

### Props
| 이름 | 타입 | 디폴트                     | 설명                                                                                        | 종류 |
| --- | ---- |-------------------------|-------------------------------------------------------------------------------------------| --- |
| columns | Array | []                      | 컬럼 리스트                                                                                    | |
| rows | Array | []                      | row 리스트                                                                                   | |
| width | String, Number | '100%'                  | 그리드 넓이                                                                                    | '50%', '50px', 50 |
| height | String, Number | '100%'                  | 그리드 높이                                                                                    | '50%', '50px', 50 |
| selected | Array | []                      | 선택된 row 데이터                                                                               |  |
| checked | Array | []                      | 체크된 row 데이터                                                                               |  |
| uncheckable | Array | []                      | 체크할 수 없는 row 데이터                                                                          |  |
| expanded | Array | []                      | 확장된 Row 데이터                                                                               |  |
| option | Object | {}                      | 그리드 옵션                                                                                    |  |
| disabledRows | Array | [] | 사용할 수 없는 Row 데이터(uncheckable 상위 호환) |  |
|  | adjust | false                   | 그리드의 너비에 맞게 컬럼 너비를 자동으로 조절한다.                                                             |  |
|  | showHeader | true                    | 헤더 표시 여부를 설정한다.                                                                           |  |
|  | rowHeight | 35                      | row 높이를 설정한다.                                                                             | `min-height: 35` |
|  | rowMinHeight | null                    | row 높이를 `min-height`보다 작게 설정한다.                                                           |  |
|  | columnWidth | 40                      | 기본 컬럼 너비를 설정한다.                                                                           | `min-width: 40px` |
|  | customAscFunction | {}                      | 그리드 오름차순 정렬 시 사용할 커스텀 함수를 정의한다. 내림차순 정렬 함수는 자동으로 구성된다.                                    |  |
|  |  | `[Column Field]`        | 커스텀 함수, 형태는 `Array.prototype.sort` 함수의 첫 번째 인자와 같다.                                       | (a: any, b: any) => number |
|  | useCheckbox | {}                      | 각 row별 체크박스 사용 여부 및 단일 선택이나 다중 선택을 설정한다.                                                  |  |
|  |  | use                     | 체크박스 사용 여부                                                                                | Boolean |
|  |  | mode                    | 단일 및 다중 선택 설정                                                                             | 'multi', 'single' |
|  |  | headerCheck             | 헤더 체크박스 사용 여부                                                                             | Boolean |
|  | useSelection | {}                      | 각 row별 선택 여부 및 단일 선택이나 다중 선택을 설정한다.                                                       |  |
|  |  | use                     | Selection 사용 여부                                                                           | Boolean |
|  |  | multiple                | 다중 선택 설정 여부                                                                               | Boolean |
|  | style | {}                      | 그리드의 스타일을 설정한다.                                                                           |  |
|  |  | stripe                  | row의 배경색을 Stripe 스타일로 설정한다.                                                               | Boolean |
|  |  | border                  | 그리드의 Border 여부를 설정한다.                                                                     | 'none', 'rows' |
|  |  | highlight               | 지정한 row에 Highlight 효과를 설정한다.                                                              | `rowIndex` |
|  | customContextMenu | []                      | 우클릭시 보여지는 컨텍스트 메뉴를 설정한다.                                                                  |  |
|  |  | menuItems               | 컨텍스트 메뉴                                                                                   |  |
|  | hiddenColumnMenuItem | {}                      | 그리드 헤더 클릭시 보여지는 컨텍스트 메뉴 각 아이템의 표시 여부를 설정한다. (`true`: 숨김 / `false`: 노출 / Default: `false`) |  |
|  |  | ascending               | 오름차순 정렬                                                                                   | Boolean |
|  |  | descending              | 내림차순 정렬                                                                                   | Boolean |
|  |  | filter                  | 필터 기능                                                                                     | Boolean |
|  |  | hide                    | 컬럼 숨김                                                                                     | Boolean |
|  | columnMenuText | {}                      | 그리드 헤더 클릭시 보여지는 컨텍스트 메뉴 각 아이템의 텍스트를 설정한다.                                                 |  |
|  |  | ascending               | Default: 'Ascending'                                                                      | String |
|  |  | descending              | Default: 'Descending'                                                                     | String |
|  |  | filter                  | Default: 'Filter'                                                                         | String |
|  |  | hide                    | Default: 'Hide'                                                                           | String |
|  | page | {}                      | 페이지 설정                                                                                    |  |
|  |  | use                     | 페이지 사용 여부                                                                                 | Boolean |
|  |  | isInfinite              | Infinite Scroll 사용 여부                                                                     | Boolean |
|  |  | useClient               | client-side Paging 사용 여부                                                                  | Boolean |
|  |  | total                   | 총 항목 수                                                                                    | Number |
|  |  | perPage                 | 각 페이지의 항목 수                                                                               | Number |
|  |  | currentPage             | 현재 페이지 번호                                                                                 | Number |
|  |  | visiblePage             | 보여지는 Pagination 버튼 수                                                                      | Number |
|  |  | order                   | Pagination 위치                                                                             | 'center', 'left', 'right' |
|  |  | showPageInfo            | 페이지 정보 표시 여부                                                                              | Boolean |
|  | rowDetail | {}                      | rowDetail 설정                                                                              | |
|  |  | use                     | rowDetail 사용여부                                                                            | Boolean |
|  | useSummary | false                   | 하단에 summary row 가 표시 된다.                                                                  | Boolean |
|  | useGridSetting | {}                      | 그리드 옵션 설정                                                                                 | |
|  |  | use                     | 그리드 옵션 설정 사용 여부                                                                           | Boolean |
|  |  | customContextMenu       | 그리드옵션 클릭시 보여지는 컨텍스트 메뉴를 설정한다.                                                             |  |
|  |  | useDefaultColumnSetting | 기본 제공되는 컬럼 설정 메뉴 사용 여부 (Default: true)                                                    | Boolean |
|  |  | columnMenuText          | 컬럼 설정 메뉴의 텍스트를 설정한다.(Default: 'Column List')                                              | String |
|  |  | searchText              | 컬럼 설정창 검색 영역의 placeholder 텍스트를 설정한다. (Default: 'Search')                                  | String |
|  |  | emptyText               | 컬럼 설정창에 데이터가 없는 경우 표시되는 텍스트를 설정한다. (Default: 'No records')                                | String |
|  |  | okBtnText               | 컬럼 설정 완료 버튼의 텍스트를 설정한다. (Default: 'OK')                                                   | String |
|  | emptyText | 'No records'            | 데이터가 없는 경우 표시되는 텍스트를 설정한다.                                                                | String |

### Columns
| 이름 | 타입 | 설명 | 종류 | 필수 |
| --- | ---- | ----- | ---- | --- |
| caption | String | 컬럼명 | ex) '인스턴스명' | Y |
| field | String | 필드명 | ex) 'instance_name' | Y |
| type | String | 데이터 타입 | 'string', 'number', 'stringNumber', 'float', 'boolean' | Y |
| hide | Boolean | 컬럼 숨김 여부 | Boolean | N |
| hiddenDisplay | Boolean | 컬럼 목록 체크 여부 | Boolean | N |
| width | Number | 컬럼 넓이 | ex) 150 | N |
| searchable | Boolean | 검색 대상 여부 | Boolean | N |
| sortable | Boolean | 정렬 대상 여부 | Boolean | N |
| filterable | Boolean | 필터 대상 여부 | Boolean | N |
| align | String | 사용자 지정 정렬 | 'center', 'left', 'right' | N |
| decimal | Number | 데이터 타입이 float 일 때 소수점 자리 표시 수 | ex) 0~20 (디폴트: 3 ) | N |
| summaryType | String | 계산 타입 | 'sum', 'average', 'max', 'min', 'count' | N |
| summaryDecimal | Number | Summary 계산 타입 중 'sum', 'average'를 선택한 경우 소수점 표현 자리수 | ex) 0~20 (디폴트: 3 ) | N |
| summaryRenderer | String | Summary 에 표시할 텍스트 또는 계산 값 | ex) 'Sum: {0}' | N |
| summaryData | Array | Summary 할 대상 추가 시 summaryRenderer 와 함께 사용 | ex) '{0}({1}%)' | N |

### Event
| 이름 | 파라미터                        | 설명                                                                  |
 | ---- |-----------------------------|---------------------------------------------------------------------|
 | check-row | event, row, index           | row의 체크박스가 체크 되었을때 호출된다.                                            |
 | check-all | event, rows                 | 헤더의 체크박스가 체크 되었을때 호출 된다. 전체 row의 체크박스를 체크한다.                        |
 | click-row | event, row                  | row가 클릭 되었을 때 호출된다.                                                 |
 | dblclick-row | event, row                  | row가 더블 클릭 되었을 때 호출된다.                                              |
 | page-change | event                       | page 정보가 변경되었을 때 호출된다.                                              |
 | sort-column | event                       | column을 기준으로 정렬이 변경되었을 때 호출된다.                                      |
 | expand-row | event, row, isExpand, index | row가 확장되었을 때 호출된다.                                                  |
 | update:expanded | rows                        | row가 확장되었을 때 호출된다.                                                  |
 | resize-column | column, columns             | column의 width가 resize 됐을때 호출된다.                                     |
 | change-column-order | column, columns             | column의 위치가 변경되었을 때 호출된다.                                           |
 | change-column-status | columns             | column의 상태(column Show/Hide)가 변경되었을 때 호출된다. |
