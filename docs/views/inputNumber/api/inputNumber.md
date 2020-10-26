### Desc
- 태그는 &lt;ev-input-number&gt;(이하 <인풋넘버>)으로 정의

```
<ev-input-number
  옵션
/>
```
- <인풋넘버>에서 바인딩 옵션 설정으로 의도에 맞는 텍스트필드 구현
- 기본 설정 스타일
```css
width: 100%;
height: 35px;
```
 

### Props

| 이름 | 타입 | 디폴트 | 설명 | 종류 |
| --- | ---- | ----- | ---- | --- |
| v-model | Number | null | 컴포넌트 입력 값 | |
| disabled | Boolean | false | 비활성화 여부 | true, false |
| readonly | Boolean | false | 읽기 전용 여부 | true, false |
| placeholder | String | | Input의 placeholder 값 | |
| max | Number | Infinity | value 의 최대값 | |
| min | Number | -Infinity | value 의 최소값 | |
| step | Number | 1 | 우측 화살표 클릭 및 키보드 ArrowUp / ArrowDown 입력 이벤트를 통한 변화 값 | |
| step-strictly | Boolean | false | 설정한 step에 맞는 수만 허용. `modelValue`가 없을 경우 `props.min`을 기준으로 세팅됨(`props.min`을 따로 설정하지 않았을 경우, 0으로 세팅됨) | |
| precision | Number |  | 고정 소수점 값. 0~100 사이의 정수 | |

### Event

 | 이름 | 파라미터 | 설명 |
 | ---- | ------- | ---- |
 | focus | event | Event object. 컴포넌트 focus 이벤트 발생 시 호출 |
 | blur | event | Event object. 컴포넌트 blur 이벤트 발생 시 호출 |
 | change | newValue | 컴포넌트 change 이벤트 발생 시 호출 |
