### Desc
- 태그는 &lt;ev-context-menu&gt;(이하 <컨텍스트메뉴>)으로 정의

```
<ev-context-menu
  ref="REF명"
  :items="[
    {
      text: '텍스트명',
      iconClass: '텍스트 앞에 위치하는 아이콘 태그 클래스명',
      disabled: true, // Boolean - 사용여부
      click: () => { ... }, // 클릭 시 발생하는 메소드
    },
    { ... },
    { ... },
  ]"
/>
```
- <컨텍스트메뉴>는 특정 영역에 우클릭이벤트(@contextmenu="REF명.show")에서 실행 가능
- 메뉴 값에 바인딩되는 items는 nested 구조
- 텍스트명, 아이콘, 항목 사용여부, 클릭 이벤트 바인딩 가능
- 클릭 시 item.click이 실행되며 <컨텍스트메뉴>전체가 hide
- nested 구조의 항목에서 같은 레벨의 항목에 mouseenter를 하였을 때, 해당 레벨의 자식 컴포넌트가 숨김처리됨


### Binding

| 이름 | 타입 | 디폴트 | 설명 | 종류 |
| --- | ---- | ----- | ---- | --- |
| ref | String | '' | <컨텍스트메뉴>의 REF명을 지정해줘야한다. 필수 | |

### Props

| 이름 | 타입 | 디폴트 | 설명 | 종류 |
| --- | ---- | ----- | ---- | --- |
| items | Array | [] | <컨텍스트메뉴>의 목록. nested 가능 | |
| | {} |  | <컨텍스트메뉴>의 하나의 항목 | |
| | | text | <컨텍스트메뉴> 항목 텍스트 | |
| | | icon-class | <컨텍스트메뉴> 항목 텍스트 앞에 위치하는 <i> 클래스 | |
| | | disabled | <컨텍스트메뉴> 항목 사용 여부 | false, true |
| | | isShowMenu | 클릭한 항목 선택 후에도 <컨텍스트 메뉴> 유지 | false, true |
| | | click | <컨텍스트메뉴> 항목 클릭 시 발생하는 메소드 |  |
| customClass | String | '' | <컨텍스트메뉴>에 지정할 클래스명 | |
| isShowMenuOnClick | Boolean | false | <컨텍스트 메뉴> 항목 및 영역 외 클릭 시에도 메뉴 유지 | |
