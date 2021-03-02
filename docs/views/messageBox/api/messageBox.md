### Desc
$messagebox 는 Global Method / Local Import 두 가지 방법으로 사용할 수 있으며, 단순 메시지 문구만 입력하거나, 옵션과 함께 사용할 수 있음

```js
// 메시지만 입력 시,
ctx.$messagebox('message');

// 옵션과 사용 시,
ctx.$messagebox({
  message: 'message',
  // options
});
```

**1. Global Method**  
`app.config.globalProperties`에 등록하여, 각 컴포넌트에서 아래처럼 사용 가능 
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
        ctx.$messagebox({
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

**2. Local Import**  

```vue
<template>
    <ev-button
      @click="showMsg"
    >
      Show Message
    </ev-button>
</template>
<script>
  import { EvMessageBox } from 'evui';
  
  export default {
    setup() {
      const showMsg = () => {
        EvMessageBox({
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

### Props

| 이름 | 타입 | 디폴트 | 설명 | 종류 |
| --- | ---- | ----- | ---- | --- |
| type | String | '' | 메시지 스타일. type입력 시 좌측 상단에 타입에 맞는 아이콘 노출됨 | 'info', 'success', 'warning', 'error' |
| message | String | '' | 메시지 창에 띄울 문구 | |
| title | String | '' | 메시지 상단 타이틀 문구 | |
| iconClass | String | '' | 메시지 창 좌측에 띄울 아이콘 클래스 명 | |
| onClose | Function | null | 메시지 창이 닫힌 후 동작. 매개변수로 클릭한 버튼 타입을 받음(ok, cancel). 닫기 버튼 및 모달 레이어 클릭으로 닫을 시 cancel | |
| showClose | Boolean | true | 닫기 버튼 노출 여부 | true, false |
| showConfirmBtn | Boolean | true | 확인 버튼 노출 여부 | true, false |
| showCancelBtn | Boolean | true | 취소 버튼 노출 여부 | true, false |
| confirmBtnText | String | 'OK' | 확인 버튼 문구 | |
| cancelBtnText | String | 'Cancel' | 취소 버튼 문구 | |
| closeOnClickModal | Boolean | true | 모달 레이어 클릭 시 메시지 창 닫기 여부 | true, false |
| lockScroll | Boolean | true | 메시지 창 노출 시 스크롤 사라짐 여부 | true, false |
| useHTML | Boolean | false | 메시지 창 문구에 HTML 사용 여부. 사용 시 message 속성에 함께 작성 | |
