
### Desc
 - 태그는 &lt;ev-window&gt;(이하 <윈도우>)로 정의

```
<ev-window
    v-mode:visible="Boolean값"
    :title="'타이틀 변수'"
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
 


### Props
| 이름                   | 타입 | 디폴트 | 설명                                             | 종류          |
|----------------------| ---- | ----- |------------------------------------------------|-------------|
| v-mode:visible       | Boolean | false | <윈도우>의 보임 여부, 양방향 바인딩                          |             |
| title                | String, Number | null | <윈도우> 내부 헤더의 타이틀                               |
| window-class         | String | '' | <윈도우> 클래스명 사용자 지정                              |             |
| width                | String, Number | 50vw | <윈도우> 너비                                       |             |
| height               | String, Number | 50vh | <윈도우> 높이                                       |             |
| min-width            | String, Number | 150 | <윈도우> 최소 너비                                    |             |
| min-height           | String, Number | 150 | <윈도우> 최소 높이                                    |             |
| icon-class           | String | '' | <윈도우> 내부 헤더의 아이콘                               |             |
| fullscreen           | Boolean | false | 전체 화면 여부                                       |
| is-modal             | Boolean | true | 모달창 여부. 즉, dim layer 출력 여부(modal vs. modeless) | true, false |
| close-on-click-modal | Boolean | false | 모달 레이어 클릭 시 메시지 창 닫기 여부                        | true, false |
| hide-scroll          | Boolean | true | body 스크롤 lock 여부                               |
| draggable            | Boolean | false | window 헤더를 통한 창 드래그 이동 여부                      |
| resizable            | Boolean | false | 마우스 드래그 동작으로 window 크기 조절 여부                   |
| maximizable          | Boolean | false | 우측상단 아이콘을 통한 최대화 여부                            |
| esc-close            | Boolean | false | esc 키 눌렀을 때 window 창 닫기 여부                     | true, false |

### Event

| 이름 | 파라미터 | 설명 |
| --- | --- | --- | --- | --- |
| mousedown | clickedInfo | 드래그 및 리사이즈를 위한 mousedown 이벤트 감지 |
| mousedown-mouseup | MouseEvent 객체 | 드래그 및 리사이즈를 위한 mouseup 이벤트 감지   |
| mousedown-mousemove | MouseEvent 객체 | 드래그 및 리사이즈를 위한 mousemove 이벤트 감지 |
| resize | MouseEvent 객체, positionInfo | 리사이즈를 위한 mousemove 이벤트 감지 |
| expand | 최대화 이전 스타일 window 정보 | 최대화 버튼 클릭 시 click 이벤트 감지 |

##### clickedInfo
```
{
    state: '',         // '', 'mousedown', 'mousedown-mousemove'
    pressedSpot: '',   // '', 'header', 'border'
    top: 0,
    left: 0,
    width: 0,
    height: 0,
    clientX: 0,
    clientY: 0,
}
```

##### positionInfo
```
{
    top: 0,
    left: 0, 
    width: 0,
    height: 0, 
}
```
