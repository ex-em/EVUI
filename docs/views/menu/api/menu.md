### Desc
- 태그는 &lt;ev-menu&gt;(이하 <메뉴>)으로 정의

```
<ev-menu
  :items="[
    {
      text: '텍스트명',
      iconClass: '텍스트 앞에 위치하는 아이콘 태그 클래스명',
      hidden: true, // Boolean - 숨김 여부
    },
    { ... },
    { ... },
  ]"
/>
```
- 메뉴 값에 바인딩되는 items는 nested 구조


### Props

| 이름 | 타입 | 디폴트 / 프로퍼티 | 설명 | 종류 |
| --- | ---- | ----- | ---- | --- |
| items | Array | [] | 메뉴의 목록. nested 가능 | |
| | {} |  | 개별 항목 정보 객체 | |
| | | text | 메뉴명 | |
| | | iconClass | 메뉴 앞에 위치하는 아이콘 클래스명 | |
| | | hidden | 항목 숨김 여부 | false, true |
| | | expand | 항목 여닫음 여부 | false, true |
| | | children | 해당 메뉴 내 부가 메뉴 목록. 배열로 메뉴 구성과 같은 구성 |  |
| expandable | Boolean | true | 중첩된 메뉴의 펼침 여부 | true, false |

