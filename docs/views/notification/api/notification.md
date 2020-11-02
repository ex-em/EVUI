### Desc
$notify 는 `app.config.globalProperties`에 등록되어 있어, 각 컴포넌트에서 아래처럼 사용 가능 
```vue
<template>
    <ev-button
      @click="showNotification"
    >
      Show Notification
    </ev-button>
</template>
<script>
  import { getCurrentInstance } from 'vue';

  export default {
    setup() {
      const { ctx } = getCurrentInstance();
      const showNotification = () => {
        ctx.$notify({
          message: 'message',
          // options
        });
      };
      return {
        showNotification,
      };
    },
  }
</script>
```
```js
// 메시지만 입력 시,
ctx.$notify('message');

// 옵션과 사용 시,
ctx.$notify({
  message: 'message',
  // options
});
```

### Props

| 이름 | 디폴트 | 타입 | 설명 | 종류 |
| --- | ---- | ----- | ---- | --- |
| type | 'info' | String | 메시지 스타일 | 'info', 'success', 'warning', 'error' |
| message | '' | String | 메시지 창에 띄울 문구 | |
| title | '' | String | 메시지 상단 타이틀 문구 | |
| position | 'top-right' | String | 메시지 창 위치 | 'top-left', 'top-right', 'bottom-left', 'bottom-right' |
| duration | 3000 | Number | 메시지 창 유지 시간 | |
| showClose | true | Boolean | 닫기 버튼 노출 여부 | true, false |
| iconClass | '' | String | 메시지 창 좌측에 띄울 EVUI 아이콘 명 | |
| onClose | null | Function | 메시지 창이 닫힌 후 동작 | |
| onClick | null | Function | 메시지 창 클릭 시 동작 | |
| useHTML | false | Boolean | 메시지 창 문구에 HTML 사용 여부. 사용 시 message 속성에 함께 작성 | |
