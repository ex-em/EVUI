
>### Desc
 - 태그는 &lt;ev-grid&gt;(이하 <그리드>)로 정의

```
<ev-grid
    v-model:selected="selectedMV"
    v-model:checked="checkedMV"
    :columns="columns"
    :rows="tableData"
    :width="widthMV"
    :height="heightMV"
    :option="{}"
    @check-one="onCheckedRow"
    @check-all="onAllCheckedRow"
    @click-row="onClickRow"
    @dblclick-row="onDoubleClickRow"
>
</ev-grid>
```

 - <그리드>는 위와 같이 사용

### Props
| 이름 | 타입 | 디폴트 | 설명 | 종류 |
| --- | ---- | ----- | ---- | --- |
| columns | Array | [] | 컬럼 리스트 | |
| rows | Array | [] | row 리스트 | |
| width | String, Number | '100%' | 그리드 넓이 | '50%', '50px', 50 |
| height | String, Number | '100%' | 그리드 높이 | '50%', '50px', 50 |
| selected | Array | [] | 선택된 row 데이터 |  |
| checked | Array | [] | 체크된 row 데이터 |  |
| option | Object | {} | 그리드 옵션 |  |
|  | adjust | false | 그리드의 너비에 맞게 컬럼 너비를 자동으로 조절 한다. |  |
|  | showHeader | true | 헤더 표시 여부를 설정 한다. |  |
|  | stripeRows | false | row 배경색 스타일을 설정 한다. |  |
|  | rowHeight | 35 | row 높이를 설정 한다. | `min-height: 35` |
|  | columnWidth | 40 | 기본 컬럼 너비를 설정 한다. | `min-width: 40px` |
|  | useFilter | false | 필터 기능 사용 여부, 컨텍스트 메뉴에서 'Filter On' 메뉴를 클릭하여 설정 한다. |  |
|  | useCheckbox | {} | 각 row별 체크박스 사용 여부 및 단일 선택이나 다중 선택을 설정 한다. |  |
|  |  | use | 체크박스 사용 여부 | boolean |
|  |  | mode | 단일 및 다중 선택 설정 | 'multi', 'single' |
|  |  | headerCheck | 헤더 체크박스 사용 여부 | boolean |
|  | customContextMenu | [] | 우클릭시 보여지는 컨텍스트 메뉴를 설정 한다. |  |
|  |  | menuItems | 컨텍스트 메뉴 |  |

### Event
| 이름 | 파라미터 | 설명 |
 | ---- | ------- | ---- |
 | check-one | event | row의 체크박스가 체크 되었을때 호출 된다. |
 | check-all | event | 헤더의 체크박스가 체크 되었을때 호출 된다. 전체 row의 체크박스를 체크 한다. |
 | click-row | newValue | row가 클릭 되었을 때 호출 된다. |
 | dblclick-row | newValue | row가 더블 클릭 되었을 때 호출 된다. |

>### 참고
 - <그리드> 셀 내부에 타 컴포넌트를 Rendering 할 수 있다.
 - `ev-button`, `ev-checkbox`, `ev-input-number`, `ev-select` 외 컴포넌트 추가 예정
