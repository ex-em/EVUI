### Desc
`app.config.globalProperties`에 등록되어 있어, 각 컴포넌트에서 아래처럼 사용 가능 
```vue
<template>
    <ev-button
      @click="showMsg"
    >
      Show HTML
    </ev-button>
</template>
<script>
  import { getCurrentInstance } from 'vue';

  export default {
    setup() {
      const { ctx } = getCurrentInstance();
      const showMsg = () => {
        ctx.$message({
          message: 'message',
          // options
        });
      };
      return {
        showMsg,
      };
    },
  }
</script>
```
```js
// 메시지만 입력 시,
ctx.$message('message');

// 옵션과 사용 시,
ctx.$message({
  message: 'message',
  // options
});
```

### Props

| 이름 | 디폴트 | 타입 | 설명 | 종류 |
| --- | ---- | ----- | ---- | --- |
| type | 'info' | String | 메시지 스타일 | 'info', 'success', 'warning', 'error' |
| message | '' | String | 메시지 창에 띄울 문구 | |
| duration | 3000 | Number | 메시지 창 유지 시간 | |
| showClose | false | Boolean | 닫기 버튼 노출 여부 | true, false |
| iconClass | '' | String | 메시지 창 좌측에 띄울 EVUI 아이콘 명 | |
| onClose | null | Function | 메시지 창이 닫힌 후 동작 | |
| useHTML | false | Boolean | 메시지 창 문구에 HTML 사용 여부. 사용 시 message 속성에 함께 작성 | |
