
>### Desc
 - 태그는 &lt;ev-select&gt;(이하 <셀렉트>)로 정의
 - &lt;ev-select&gt; 클릭시 나타나는 영역은 dropBox(이하 <드랍박스>)로 정의

```
<ev-select
    v-model="초기값(value)"
    :items="[{...}, {...}, {...}]"
/>
```

 - <셀렉트> 컴포넌트는 `<input type="text" />` 를 래핑하는 구조를 가지고 있다.
 - <셀렉트> 컴포넌트를 클릭하였을 때, :items 속성에 1개 이상의 객체를 가진 배열이 존재하는 경우,
   하단에 선택할 리스트 데이터를 보여주는 <드랍다운 박스>가 나타난다.
 - <드랍박스>가 열린 상태에서 <셀렉트>를 한번더 클릭할 시 <드랍다운 박스>는 사라진다. 
 - <셀렉트> 컴포넌트의 기본 width는 100%이다.
   다른 형태를 위해서는 ev-select 클래스에 스타일을 래핑해야한다.
 - 기본적으로 <드랍박스>의 너비는 <셀렉트> 컴포넌트의 너비와 동일하게 맞춰져 있다.
 - items 바인딩 값의 타입은 배열이며, 속성으로는 name, value, iconClass 이다.
 - iconClass속성의 값으로 <드랍박스>의 <li> 내 아이콘을 추가할 수 있다.
 - <드랍박스>는 기본적으로 인풋박스의 하단에 드랍다운되며, 브라우저 높이에 맞춰 <드랍박스>가 아래로 위치하는 경우 브라우저 화면을 넘어가는 경우 상단에 드랍업 된다.

>### Props
1) 셀렉트 사용 시

 | 이름 | 타입 | 디폴트 | 설명 | 종류 |
  |------|--------|------|------|------|
  | v-model | Boolean, String, Number | null | <셀렉트>에서 선택된 값으로, 해당 값은 바인딩되어 동적으로 변함 | |
  | items | Array | [] | <셀렉트> 선택가능한 리스트 |  |
  | placeholder | String | '' | <셀렉트>의 표기문구 |  |
  | disabled | Boolean | false | <셀렉트> 사용가능 여부 |  |
  | clearable | Boolean | false | <셀렉트>에 선택된 항목들 모두 clear기능 사용여부 |  |
  | filterable | Boolean | false | <셀렉트> 항목들 필터링 기능 사용여부 |  |
  | searchPlaceholder | String | '' | <셀렉트> 필터링의 표기문구 |  |
  | noMatchingText | String | '' | <셀렉트> 필터링 결과가 없을 시 표기문구 |  |
- <셀렉트> 클릭 시 <드랍다운 박스>가 나타나며, 목록 선택 시 <드랍다운 박스>가 닫혀야한다.

2) 멀티 셀렉트 사용 시

 | 이름 | 타입 | 디폴트 | 설명 | 종류 |
  |------|--------|------|------|------|
  | v-model | Boolean, String, Number | null | <셀렉트>에서 선택된 값으로, 해당 값은 바인딩되어 동적으로 변함 | |
  | items | Array | [] | <셀렉트> 선택가능한 리스트 |  |
  | placeholder | String | '' | <셀렉트>의 표기문구 |  |
  | multiple | Boolean | false | <셀렉트> 복수 선택 가능여부 |  |
  | disabled | Boolean | false | <셀렉트> 사용가능 여부 |  |
  | clearable | Boolean | false | <셀렉트>에 선택된 항목들 모두 clear기능 사용여부 |  |
  | collapse-tags | Boolean | false | <셀렉트>에 선택된 항목의 생략 태그기능 사용여부 | { 항목1 (x) } { +1 } |
  | filterable | Boolean | false | <셀렉트> 항목들 필터링 기능 사용여부 |  |
  | searchPlaceholder | String | '' | <셀렉트> 필터링의 표기문구 |  |
  | noMatchingText | String | '' | <셀렉트> 필터링 결과가 없을 시 표기문구 |  |
- <셀렉트> 클릭 시 <드랍다운 박스>가 나타나며, 목록 선택 시 <드랍다운 박스>가 닫히지 말아야 한다.

>### Event
1) 셀렉트

 | 이름 | 파라미터 | 설명 |
 | ---- | ------- | ---- |
 | change | newValue | <셀렉트> 내 v-model 변화 이벤트 감지 |

>### 참고
 - 
