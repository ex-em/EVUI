<template>
  <div class="case">
    <p class="case-title">Common</p>
    <ev-text-field
      v-model="modelValue1"
      placeholder="Please enter the content"
      type="text"
    />
    <div class="description">
      <span class="badge yellow">
        type="text"
      </span>
      <span class="badge">
        Text Field Value
      </span>
      {{ modelValue1 }}
    </div>
  </div>

  <div class="case">
    <p class="case-title">Readonly</p>
    <ev-text-field
      v-model="modelValue2"
      type="text"
      readonly
    />
  </div>

  <div class="case">
    <p class="case-title">Disabled</p>
    <ev-text-field
      v-model="modelValue3"
      type="text"
      disabled
    />
  </div>

  <div class="case">
    <p class="case-title">Clearable</p>
    <ev-text-field
      v-model="modelValue4"
      placeholder="Please enter the content"
      type="text"
      clearable
    />
  </div>

  <div class="case">
    <p class="case-title">Max Length</p>
    <div style="display: flex;">
      <ev-text-field
        v-model="modelValue5"
        placeholder="Please enter the content"
        type="text"
        :max-length="3"
      />
      <ev-text-field
        v-model="modelValue5"
        placeholder="Please enter the content"
        type="text"
        :max-length="3"
        show-max-length
      />
    </div>
  </div>

  <div class="case">
    <p class="case-title">Error Message</p>
    <ev-text-field
      v-model="modelValue6"
      placeholder="Please enter the content"
      type="text"
      :error-msg="errMsg"
      @input="checkValid"
    />
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const modelValue1 = ref();
    const modelValue2 = ref('Read Only Content');
    const modelValue3 = ref('Disabled Content');
    const modelValue4 = ref();
    const modelValue5 = ref();
    const modelValue6 = ref('1234가나다');
    const errMsg = ref();
    const checkValid = () => {
      const regexp = /^[0-9]*$/;
      if (!regexp.test(modelValue6.value)) {
        errMsg.value = '숫자만 입력 가능!';
      } else {
        errMsg.value = '';
      }
    };
    checkValid();
    return {
      modelValue1,
      modelValue2,
      modelValue3,
      modelValue4,
      modelValue5,
      modelValue6,
      checkValid,
      errMsg,
    };
  },
};
</script>

<style lang="scss">
.case .ev-text-field {
  width: 300px;
  margin-right: 15px;
}
</style>
