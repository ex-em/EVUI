<template>
  <div class="case">
    <p class="case-title">Common</p>
    <ev-textfield
      v-model="textfield1"
      placeholder="Please enter the content"
      type="text"
    />
    <div class="description">
      <span class="badge yellow">
        type="text"
      </span>
      <span class="badge">
        Textfield Value
      </span>
      {{ textfield1 }}
    </div>
  </div>

  <div class="case">
    <p class="case-title">Readonly</p>
    <ev-textfield
      v-model="textfield2"
      type="text"
      readonly
    />
  </div>

  <div class="case">
    <p class="case-title">Disabled</p>
    <ev-textfield
      v-model="textfield3"
      type="text"
      disabled
    />
  </div>

  <div class="case">
    <p class="case-title">Clearable</p>
    <ev-textfield
      v-model="textfield4"
      placeholder="Please enter the content"
      type="text"
      clearable
    />
  </div>

  <div class="case">
    <p class="case-title">Max Length</p>
    <div style="display: flex;">
      <ev-textfield
        v-model="textfield5"
        placeholder="Please enter the content"
        type="text"
        :max-length="3"
      />
      <ev-textfield
        v-model="textfield5"
        placeholder="Please enter the content"
        type="text"
        :max-length="3"
        show-max-length
      />
    </div>
  </div>

  <div class="case">
    <p class="case-title">Error Message</p>
    <div style="display: flex;">
      <ev-textfield
        v-model="textfield6"
        placeholder="Please enter the content"
        type="text"
        :error-msg="errMsg"
        @input="checkValid"
      />
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const textfield1 = ref();
    const textfield2 = ref('Read Only Content');
    const textfield3 = ref('Disabled Content');
    const textfield4 = ref();
    const textfield5 = ref();
    const textfield6 = ref('1234가나다');
    const errMsg = ref();
    const checkValid = () => {
      const regexp = /^[0-9]*$/;
      if (!regexp.test(textfield6.value)) {
        errMsg.value = '숫자만 입력 가능!';
      } else {
        errMsg.value = '';
      }
    };
    checkValid();
    return {
      textfield1,
      textfield2,
      textfield3,
      textfield4,
      textfield5,
      textfield6,
      checkValid,
      errMsg,
    };
  },
};
</script>

<style lant="scss">
.case .ev-textfield {
  width: 300px;
  margin-right: 15px;
}
</style>
