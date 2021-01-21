### Desc
- 태그는 &lt;ev-time-picker&gt;(이하 <타임피커>)로 정의

```
<ev-time-picker
  옵션
/>
```
- <타임피커>에서 바인딩 옵션 설정으로 의도에 맞는 타임피커 구현
- 기본 설정 스타일
```css
/* input box 너비 높이 */
width: 150px;
height: 35px;
```
 

### Props

| 이름 | 타입 | 디폴트 | 설명 | 종류 |
| --- | ---- | ----- | ---- | --- |
| v-model | Array, String | '' | 컴포넌트 입력 값. 'range' 모드일 경우 ['09:00', '18:00'] 형태로 시작시간과 종료 시간을 입력. 'single' 모드의 경우 '12:00' 입력 | |
| type | String | 'range' | 시작시간과 종료시간이 표현되는 'range' 모드, 단일 시간 입력이 가능한 'single' 모드 선택 가능 | 'range', 'single' |
| clearable | Boolean | false | 시간 삭제가 가능한 [x]모양 버튼 사용 유무 | true, false|
| disabled | Boolean | false | 시간 입력이 비활성화 여부 | true, false|
| readonly | Boolean | false | 읽기 전용 사용 유무 | true, false|

### Event

 | 이름 | 파라미터 | 설명 |
 | ---- | ------- | ---- |
 | focus | event | Event object. 컴포넌트 focus 이벤트 발생 시 호출 |
 | blur | event | Event object. 컴포넌트 blur 이벤트 발생 시 호출 |
 | change | (event, newValue) | 컴포넌트 change 이벤트 발생 시 호출 |


>### 참고
- 시간은 항상 HH24:MI 형태[예시. 07:00 (o), 7:00 (x)]로 입력해야 한다. 그렇지 않을 경우, 이전 입력 값으로 되돌아 간다.
- 'range' 모드에서 시작시간은 항상 종료일보다 이전이어야 한다. 그렇지 않을 경우, 시작시간과 종료시간의 input box 테두리 색상이 빨간색으로 변경된다.
