<template>
  <div class="case">
    <p class="case-title">Compound Component (Root + Label + Input)</p>
    <ev-input-root>
      <ev-input-label>사용자 이름</ev-input-label>
      <ev-input v-model="value1" placeholder="이름을 입력하세요" />
    </ev-input-root>
    <div class="description">
      <span class="badge"> Value </span>
      {{ value1 }}
    </div>
  </div>

  <div class="case">
    <p class="case-title">Description 포함</p>
    <ev-input-root>
      <ev-input-label>이메일</ev-input-label>
      <ev-input v-model="value2" type="email" placeholder="이메일을 입력하세요" />
      <ev-input-description>업무용 이메일을 입력하세요.</ev-input-description>
    </ev-input-root>
  </div>

  <div class="case">
    <p class="case-title">Error Message 포함</p>
    <ev-input-root :invalid="!!errorMsg">
      <ev-input-label>전화번호</ev-input-label>
      <ev-input
        v-model="value3"
        placeholder="숫자만 입력하세요"
        @input="checkValid"
      />
      <ev-input-error-message v-if="errorMsg">
        {{ errorMsg }}
      </ev-input-error-message>
    </ev-input-root>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const value1 = ref('');
    const value2 = ref('');
    const value3 = ref('abc');
    const errorMsg = ref('');

    const checkValid = (val) => {
      const regexp = /^[0-9]*$/;
      errorMsg.value = regexp.test(val) ? '' : '숫자만 입력 가능합니다.';
    };
    checkValid(value3.value);

    return {
      value1,
      value2,
      value3,
      errorMsg,
      checkValid,
    };
  },
};
</script>

<style lang="scss" scoped>
.case [role="group"] {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 300px;
}
.case label {
  font-size: 14px;
  font-weight: 500;
}
.case input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
}
.case input:focus {
  border-color: #409eff;
}
.case [role="alert"] {
  color: #f56c6c;
  font-size: 12px;
}
.case .ev-input-description {
  color: #909399;
  font-size: 12px;
}
</style>
