### Desc
- 태그는 &lt;ev-text-field&gt;(이하 <텍스트필드>)으로 정의

```
<ev-text-field
  옵션
/>
```
- <텍스트필드>에서 바인딩 옵션 설정으로 의도에 맞는 텍스트필드 구현
- 기본 설정 스타일
```css
width: 100%;
/* type = text, password */
height: 35px;
/* type = textarea */
height: 100px;
```
- '#icon-prefix', '#icon-suffix' 을 지정해서 <텍스트필드> 내 아이콘 표시 가능
```
<ev-text-field>
    <template #icon-prefix>
        <ev-icon icon="ev-icon-search"></ev-icon>
    </template>
</ev-text-field>
```
 

### Props

| 이름 | 타입 | 디폴트 | 설명 | 종류 |
| --- | ---- | ----- | ---- | --- |
| v-model | String, Number | null | 컴포넌트 입력 값 | |
| type | String | 'text' | 타입 설정 | 'text', 'password', 'search', 'textarea' |
| disabled | Boolean | false | 비활성화 여부 | true, false |
| readonly | Boolean | false | 읽기 전용 여부 | true, false |
| placeholder | String | | Input / Textarea의 placeholder 값 | |
| maxLength | Number | Infinity | value 의 최대길이 제한 길이 | |
| showMaxLength | Boolean | false | maxLength 및 입력 value의 길이값 표현 여부. maxLength 설정되어 있어야 표현 가능 | true, false |
| errorMsg | String | | Error 표현을 위한 메시지 |  |

### Event

 | 이름 | 파라미터 | 설명 |
 | ---- | ------- | ---- |
 | focus | event | Event object. 컴포넌트 focus 이벤트 발생 시 호출 |
 | blur | event | Event object. 컴포넌트 blur 이벤트 발생 시 호출 |
 | input | (event, newValue) | 컴포넌트 input 이벤트 발생 시 호출 |
 | change | (event, newValue) | 컴포넌트 change 이벤트 발생 시 호출 |
 | search | newValue | type === 'search'일 경우, 컴포넌트 search 이벤트 발생 시 호출 |
