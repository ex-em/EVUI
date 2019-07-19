
>### Desc
 - 태그는 &lt;ev-toggle&gt;(이하 <토글>)로 정의

```
<ev-toggle
  v-model="flag"
/>
```

 - <토글>은 v-model에 boolean값을 넣는다.
 - 토글의 사이즈와 텍스트 값을 입력할 수 있다. 
 - type별로 'slide'[default], 'tab', 'button'의 형태를 가진다.
 - type이 'slide'인 경우 shape에 'square'[default], 'circle'의 형태가 존재한다.

>### Props
  |    이름     |   디폴트   |  타입   |          설명            |                    종류                           |
  |------------ |-----------|---------|-------------------------|---------------------------------------------------|
  | v-model     |           | Boolean | <토글>의 상태 |  |
  | toggle-obj  |           | Object  | <토글>의 크기 |  |
  | ㄴ width    |           | Number  | <토글>의 너비 |  |
  | ㄴ height   |           | Number  | <토글>의 높이 |  |
  | toggle-text |           | Object  | <토글>의 텍스트 |  |
  | ㄴ onText   |           | String  | ON일 때 텍스트 |  |
  | ㄴ offText  |           | String  | OFF일 때 텍스트 |  |
  | toggle-font-size |      | Number  | <토글>의 폰트 크기 |  |
  | toggle-type |           | String  | <토글>의 타입 | 'slide'[default], 'tab', 'button' |
  | toggle-shape|           | String  | <토글>의 모양 (type이 'slide'인 경우) | 'circle'[default], 'square' |


>### 참고
 - 
