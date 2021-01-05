
>### Desc
 - 태그는 &lt;ev-window&gt;(이하 <윈도우>)로 정의

```
<ev-window
    v-mode:visible="Boolean값"
    :title="'타이틀 변수'"
    :width="'00%'"
    :icon-class="'아이콘 클래스명'"
>
    내용
</ev-window>
```

 - <윈도우>는 visible이 true일 때, 나타나는 모달기능의 컴포넌트
 - title에는 <윈도우>의 타이틀, icon-class는 <윈도우> 타이틀 좌측에 위치하는 아이콘
 - <윈도우> 태그 내부는 slot으로 구현되어있음
 - 내부 템플릿 코드가 일반적인 경우 body slot에 내용이 들어감
 - `<template #header> 내용 </template>`을 사용 시 header slot에 들어감  
 - width는 최대 100%이며, string값으로 입력하는 너비 값
 - <윈도우> 컴포넌트 초기에 body에 DIV(id: ev-window-modal)가 append되며, 해당 DIV 자식으로 돔이 추가되어 렌더링
 - z-index는 700
 


>### Props
| 이름 | 타입 | 디폴트 | 설명 | 종류 |
| --- | ---- | ----- | ---- | --- |
| v-mode:visible | Boolean | false | <윈도우>의 보임 여부, 양방향 바인딩 | |
| title | String, Number | null | <윈도우> 내부 헤더의 타이틀 | |
| icon-class | String | '' | <윈도우> 내부 헤더의 아이콘 | |
| width | String | '50%' | <윈도우> 너비 | 
| show-modal-layer | Boolean | true | 모달창 하단의 dim layer 출력 여부 | true, false |
| close-on-click-modal | Boolean | false | 모달 레이어 클릭 시 메시지 창 닫기 여부 | true, false |
