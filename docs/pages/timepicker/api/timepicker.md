
>### Desc
 - 태그는 &lt;ev-timepicker&gt;(이하 <타임피커>)로 정의

```
<ev-timepicker
  v-model="timeValue"
/>
```

 - <타임피커>는 크게 input box와 dropdown spinner으로 나누어져있다.
 - input box는 HH24:MI:SS의 형태로 시간정보를 입력할 수 있다.
 - dropdown spinner에는 시, 분, 초의 숫자 값을 선택할 수 있다.

>### Props
  |    이름     |   디폴트   |  타입   |          설명            |                    종류                           |
  |------------ |-----------|---------|-------------------------|---------------------------------------------------|
  | v-model     |           | String  | <타임피커>의 input box의 시간 정보 |  |
  | spinner-arr |           | Array   | <타임피커>의 dropdown spinner의 시, 분, 초 숫자 범위와 초기 값 지정 |  |
  | show-footer |           | Boolean | <타임피커>의 dropdown spinner의 footer 영역 표시 여부 |  |


>### 참고
 - dropdown spinner의 경우 사용자지정디렉티브 click-outside를 사용하여 해당 element이외의 클릭 시 hide시키는 로직이 있음.
