## Props
| Property | Description | Type | Default |
| -------- | ----------- | ---- | ------- |
| v-model | row 리스트 <br/> `v-model`를 사용하여 양방향 바인딩 지원 | Array | - |
| columns | 컬럼 리스트 | Array | - |
| selected | 선택된 row 데이터 <br/> `.sync`를 사용하여 양방향 바인딩 지원 | Array | - |
| checked | 체크된 row 데이터 <br/> option.useCheckbox 설정 값에 따라 단일 데이터 또는 리스트 데이터로 제공 | Array | - |
| option.adjust | 너비에 맞게 컬럼 너비를 조절 한다. | Boolean | false |
| option.showHeader | 컬럼 표시 여부를 설정 한다. | Boolean | true |
| option.stripeRows | 각 row별 배경색을 줄무늬 형태로 표시할 지를 설정 한다. | Boolean | false |
| option.rowHeight | row 높이를 설정 한다. | Number | 24 |
| option.columnWidth | 기본 컬럼 너비를 설정 한다. | Number | 80 |
| option.scrollWidth | 스크롤바 너비를 설정 한다. | Number | 16 |
| option.useFilter | 필터 기능 사용 여부를 설정 한다. | Boolean | true |
| option.useSelected | row 선택 기능 사용 여부를 설정 한다. | Boolean | true |
| option.useChecked | 각 row별 체크박스 사용 여부 및 단일 선택이나 다중 선택을 설정 한다.  | Object | use - false <br/> headerCheck - false <br/> mode - single |
| option.customContextMenu | 그리드 내 임의의 사용자 메뉴를 설정 한다. <br/> [데이터 예시] <br/> `[`<br/>`{ text: 'test menu', itemId: 'menu1', callback: function },`<br/>`{ text: 'test menu2', itemId: 'menu2', callback: function }`<br/>`]` | Array | - |

## Events
| Event Name | Description | Return Value |
| ---------- | ----------- | ------------ |
| click-row | row가 선택 되었을 때 호출 된다. | arg[0] - 이벤트 객체 <br/> arg[1] - row 인덱스 <br/> arg[2] - 클릭된 셀의 컬럼명 <br/> arg[3] - 클릭된 셀의 컬럼 인덱스 <br/> arg[4] - 선택된 row 데이터 |
| check-one | row의 체크박스가 체크 되었을때 호출 된다. | arg[0] - 이벤트 객체 <br/> arg[1] - 체크된 row 인덱스 <br/> arg[2] - 체크된 row 데이터 |
| check-all | 컬럼 맨 좌측에 있는 체크박스가 체크 되었을때 호출 된다.. | arg[0] - 이벤트 객체 <br/> arg[1] - 체크된 row 데이터 리스트 |

