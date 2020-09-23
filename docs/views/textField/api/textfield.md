### Desc
- 태그는 &lt;EvTextfield&gt;(이하 <텍스트필드>)으로 정의

```
<EvTextfield
  옵션
/>
```
 - <텍스트필드>에서 바인딩 옵션 설정으로 의도에 맞는 텍스트필드 구현

### Props

|     이름     |  타입            |   디폴트         |                 설명              |                  종류               |
| ------------ | --------------- | --------------- | --------------------------------- | ----------------------------------- |
| type         | String          | 'text'          | 타입 설정                          | 'text', 'password', 'textarea'     |
| width        | String, Number  | '100%'          | textfield 너비. Number 입력 시, px 설정, String 입력으로 단위 변경 가능 | |
| height       | String, Number  | '100%'          | textfield 높이. Number 입력 시, px 설정, String 입력으로 단위 변경 가능 | |
| disabled     | Boolean         | false           | 비활성화 여부                       | true, false                      |
| readonly     | Boolean         | false           | 읽기 전용 여부                      | true, false                      |
| placeholder  | String          |                 | Input / Textarea의 placeholder 값  | |
| maxLength    | Number          | Infinity        | value 의 최대길이 제한 길이          | true, false |
| showMaxLength | Boolean        | false           | maxLength 및 입력 value의 길이값 표현 여부. maxLength 설정되어 있어야 표현 가능 | true, false |
| errorMsg     | String          |                 | Error 표현을 위한 메시지 |  |

### Event

 | 이름 | 파라미터 | 설명 |
 | ---- | ------- | ---- |
 | enter | event | Event object. 컴포넌트 enter로 인한 keyUp 이벤트 발생 시 호출 |
 | keyUp | event | Event object. 컴포넌트 keyUp 이벤트 발생 시 호출 |
 | keyDown | event | Event object. 컴포넌트 keyDown 이벤트 발생 시 호출 |
 | focus | event | Event object. 컴포넌트 focus 이벤트 발생 시 호출 |
 | blur | event | Event object. 컴포넌트 blur 이벤트 발생 시 호출 |
 | input | (event, newValue) | 컴포넌트 input 이벤트 발생 시 호출 |
 | change | (event, newValue) | 컴포넌트 change 이벤트 발생 시 호출 |
 | click | event | Event object. 컴포넌트 click 이벤트 발생 시 호출 |
