### Desc
$message 는 `app.config.globalProperties`에 등록되어 있어, 각 컴포넌트에서 아래처럼 사용 가능 
```vue
<template>
    <ev-button
      @click="showMsg"
    >
      Show Message
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

| 이름 | 타입 | 디폴트 | 설명 | 종류 |
| --- | ---- | ----- | ---- | --- |
| type | String | 'info' | 메시지 스타일 | 'info', 'success', 'warning', 'error' |
| message | String | 'info' | 메시지 창에 띄울 문구 | |
| duration | Number | 'info' | 메시지 창 유지 시간 | |
| showClose | Boolean | false | 닫기 버튼 노출 여부 | true, false |
| iconClass | String | '' | 메시지 창 좌측에 띄울 EVUI 아이콘 명 | |
| onClose | Function | null | 메시지 창이 닫힌 후 동작 | |
| useHTML | Boolean | false | 메시지 창 문구에 HTML 사용 여부. 사용 시 message 속성에 함께 작성 | |
