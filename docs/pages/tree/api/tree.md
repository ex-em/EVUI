## Props
| Property | Description | Type | Default |
| -------- | ----------- | ---- | ------- |
| data | tree Data | Array | - |
| columns | 컬럼 리스트 | Array | - |
| showCheckbox | 체크박스 지원 | Boolean | false |
| emptyText | 데이터 없을시 표시 메시지 | String | No Data |
| render | 트리 표시해줄 render 함수 제공  | Function | - |

## Events
| Event Name | Description | Return Value |
| ---------- | ----------- | ------------ |
| on-select | node가 선택되었을 호출 된다 | 선택된 node data, 선택 해제된 node data |
| on-click | 텍스트 클릭 했을때 호출 된다. | 클릭한 node data |
| on-dblclick | 텍스트 더블 클릭 했을때 호출 된다. | 더블 클릭한 node data |
| before-contextmenu | 컨텍스트메뉴가 뜨기전에 호출 된다. | 우클릭한 node data |
| select-contextmenu | 컨텍스트메뉴에서 항목 클릭시 호출 된다. | 컨텍스트메뉴 선택한 항목 data |

