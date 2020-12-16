
>### Desc
 - 태그는 &lt;ev-tree&gt;(이하 <트리>)로 정의

```
<ev-tree
  옵션
/>
```
- 원하는 바인딩 옵션을 추가하여 트리 구현
>### Props

 | 이름 | 타입 | 디폴트 | 설명 | 종류 |
  |------|--------|------|------|------|
  | data | Array | [] | 트리 컴포넌트에 사용될 데이터|  |
  | use-checkbox | Boolean | false | 체크 박스를 사용 유무 |  |
  | empty-text | String | 'No Data' | 트리 데이터가 없을 경우 나타낼 문구 | |
  | expand-icon | String | 'ev-icon-arrow-right' 아이콘 | 트리를 펼쳤을 때 보여질 아이콘 | |
  | collapse-icon | String | 'ev-icon-arrow-down' 아이콘 | 트리를 접었을 때 보여질 아이콘 | |
  | context-menu-items | Array | [] | 우클릭 시 보여지는 컨텍스트 메뉴, 사용하지 않을 경우 컨텍스트 메뉴는 보이지 않음 | | 

>### Event

 | 이름 | 파라미터 | 설명 |
 | ---- | ------- | ---- |
 | change-checked-node | checkedNode | 체크박스 변화를 인지할 때마다 현재 체크된 트리 노드들을 리턴 |
 | click-content | clickedNode | 노드 컨텐츠를 클릭 했을 때 선택한 노드 정보가 리턴됨 |
 | dblclick-content | clickedNode | 노드 컨텐츠를 더블 클릭 했을 때 선택한 노드 정보가 리턴됨 |

>### 참고
 - context-menu-items는 contextmenu 컴포넌트의 items를 참고하여 형식에 맞춰 작성하면 됩니다.
 - data안의 icon 프로퍼티와 expand-icon, collapse-icon은 icon 메뉴를 참고하여 사용하면 됩니다. 
