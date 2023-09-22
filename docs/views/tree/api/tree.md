
>### Desc
 - 태그는 &lt;ev-tree&gt;(이하 <트리>)로 정의

```
<ev-tree
  옵션
/>
```
- 원하는 바인딩 옵션을 추가하여 트리 구현
>### Props

 | 이름                      | 타입      | 디폴트                                  | 설명                                                      | 종류 |
  |-------------------------|---------|--------------------------------------|---------------------------------------------------------|------|
  | data                    | Array   | []                                   | 트리 컴포넌트에 사용될 데이터                                        |  |
  | use-checkbox            | Boolean | false                                | 체크 박스를 사용 유무                                            |  |
  | empty-text              | String  | 'No Data'                            | 트리 데이터가 없을 경우 나타낼 문구                                    | |
  | expand-icon             | String  | 'ev-icon-s-play' 아이콘을 우측으로 90도 회전한 모양 | 트리를 펼쳤을 때 보여질 아이콘                                       | |
  | collapse-icon           | String  | 'ev-icon-s-play' 아이콘                 | 트리를 접었을 때 보여질 아이콘                                       | |
  | context-menu-items      | Array   | []                                   | 우클릭 시 보여지는 컨텍스트 메뉴, 사용하지 않을 경우 컨텍스트 메뉴는 보이지 않음          | |
  | search-word             | String  | ''                                   | 'ev-text-field' 컴포넌트를 사용해서 검색할 때 필터링 할 단어               | |
 | search-include-children | Boolean | false                                | 'ev-text-field' 컴포넌트를 사용해서 검색할 때 부모가 검색될 경우 자식까지 보일지 여부 | |

>### Event

 | 이름 | 파라미터 | 설명 |
 | ---- | ------- | ---- |
 | check | checkedNode | 체크박스 변화를 인지할 때마다 현재 체크된 트리 노드들을 리턴 |
 | click-node | clickedNode | 노드 컨텐츠를 클릭 했을 때 선택한 노드 정보가 리턴됨 |
 | dblclick-node | clickedNode | 노드 컨텐츠를 더블 클릭 했을 때 선택한 노드 정보가 리턴됨 |

>### 참고
 - context-menu-items는 contextmenu 컴포넌트의 items를 참고하여 형식에 맞춰 작성하면 됩니다.
 - data안의 icon 프로퍼티와 expand-icon, collapse-icon은 icon 메뉴를 참고하여 사용하면 됩니다. 
 - data 프로퍼티 내부의 value는 unique한 값이어야 합니다. value 프로퍼티가 없을 경우 title + nodeKey로 대체됩니다.
