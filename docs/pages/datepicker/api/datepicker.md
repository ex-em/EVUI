
>### Desc
 - 태그는 &lt;ev-datepicker&gt;(이하 <데이트피커>)로 정의

```
<ev-timepicker
  v-model="`YYYY-MM-DD HH:mm:ss`"
  :options="options"
/>
```

 - <데이트피커>는 크게 날짜 값을 입력받는(v-model) input box와 날짜를 선택할 수 있는 dropdown calendar가 있다.
 - v-model값은 datepicker의 input box에 입력된 텍스트이며, 이 날짜 값은 dropdown calendar의 선택된 연, 월, 일, 시, 분, 초 값과 바인딩되어있다.
   input box 값은 'YYYY-MM-DD HH:mm:ss' 형태를 가지게되며 범위 이상의 숫자 값이 입력되면 maximum 숫자로 보정된다.
 - dropdown calendar는 캔버스로 개발되었으며, options에 따라서 연, 월, 일만 볼 것인지 연, 월, 일, 시, 분, 초를 모두 볼 것인지 선택할 수 있다.
   이 밖에 입력 값을 고정하고 calendar의 선택된 숫자를 고정시킨다거나 날짜의 제한을 두어 그 이상의 날짜 값을 선택할 수 없도록 옵션을 줄 수 있다.

>### Props
  |    이름     |   디폴트   |  타입   |          설명            |                    종류                           |
  |------------ |-----------|---------|-------------------------|---------------------------------------------------|
  | v-model     |           | String  | <데이트피커>의 input box의 시간 정보 |  |
  | options     |           | Object  | <데이트피커>의 옵션 값 지정 |  |
  | ㄴ selectDayType        | | String | 달력에 선택되는 날짜 타입 | 'day'[default], 'weekday', 'week' |
  | ㄴ initSelectDayFlag    | | Boolean | 최초 선택날짜 여부 | 'false'[default], 'true' |
  | ㄴ timeExpand           | | Boolean | dropdown calendar의 영역을 '연, 월, 일'을 볼지 '연, 월, 일, 시, 분, 초'를 볼지 여부 | 'false'[default], 'true' |
  | ㄴ limitToday           | | Boolean | 특정 날짜 이후의 날짜는 선택을 못하게 하는 기능 | 'false'[default], 'true' |
  | ㄴ initLimitDay         | | Date | 이후 날짜 선택못하는 날짜 지정 |  |
  | size        |           | String | <데이트피커>의 input box의 사이즈 | '', 'fit' |


>### 참고
 - dropdown calendar의 경우 사용자지정디렉티브 click-outside를 사용하여 해당 element이외의 클릭 시 hide시키는 로직이 있음.
