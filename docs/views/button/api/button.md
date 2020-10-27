### Desc
- 태그는 &lt;ev-button&gt;(이하 <버튼>)으로 정의

```
<ev-button
  옵션
/>
```
- <버튼>에서 바인딩 옵션 설정으로 의도에 맞는 텍스트필드 구현
- `<slot>` 사용하여 <버튼> 내 콘텐츠 입력


### Props

| 이름 | 타입 | 디폴트 | 설명 | 종류 |
| --- | ---- | ----- | ---- | --- |
| disabled | Boolean | false | 비활성화 여부 | true, false |
| type | String | 'default' | 버튼의 type. 색상 변화 | 'default', 'primary', 'info', 'warning', 'error', 'ghost', 'dashed', 'text' |
| shape | String | 'square' | 버튼의 모양. `border-radius` 속성 변화 | 'square', 'radius', 'circle' |
| size | String | 'medium' | 버튼의 크기 | 'large', 'medium', 'small' |
| htmlType | String | 'button' | button 태그 내 들어갈 type명. form 태그와 함께 사용 | 'button', 'submit', 'reset' |
| autoFocus | Boolean | false | button 태그의 autofocus 속성. 페이지 로드 후 포커스 위치 여부(문서 내 하나의 요소만 가능) | true, false |

### Event

| 이름 | 파라미터 | 설명 |
| ---- | ------- | ---- |
| click | event | 컴포넌트 click 이벤트 발생 시 호출 |
