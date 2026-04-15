<template>
  <div class="case">
    <p class="case-title">Prefix Icon</p>
    <ev-input-root>
      <ev-input-label>검색</ev-input-label>
      <div class="input-wrapper">
        <i class="ev-icon-search prefix" />
        <ev-input v-model="value1" type="search" placeholder="검색어를 입력하세요" />
      </div>
    </ev-input-root>
  </div>

  <div class="case">
    <p class="case-title">Suffix Icon (Clear)</p>
    <ev-input-root>
      <ev-input-label>이름</ev-input-label>
      <div class="input-wrapper">
        <ev-input v-model="value2" placeholder="이름을 입력하세요" />
        <i
          v-if="value2"
          class="ev-icon-error suffix"
          @click="value2 = ''"
        />
      </div>
    </ev-input-root>
    <div class="description">
      <span class="badge"> Value </span>
      {{ value2 }}
    </div>
  </div>

  <div class="case">
    <p class="case-title">Prefix + Suffix</p>
    <ev-input-root>
      <ev-input-label>금액</ev-input-label>
      <div class="input-wrapper has-prefix has-suffix">
        <span class="prefix text">₩</span>
        <ev-input v-model="value3" type="text" placeholder="0" />
        <span class="suffix text">원</span>
      </div>
    </ev-input-root>
  </div>

  <div class="case">
    <p class="case-title">Prefix + Suffix + Error</p>
    <ev-input-root :invalid="!!errorMsg">
      <ev-input-label>이메일</ev-input-label>
      <div class="input-wrapper has-prefix">
        <i class="ev-icon-search prefix" />
        <ev-input
          v-model="value4"
          type="email"
          placeholder="example@email.com"
          @input="validateEmail"
        />
      </div>
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
    const value3 = ref('');
    const value4 = ref('abc');
    const errorMsg = ref('');

    const validateEmail = (val) => {
      if (!val) {
        errorMsg.value = '';
        return;
      }
      const regexp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      errorMsg.value = regexp.test(val) ? '' : '올바른 이메일 형식이 아닙니다.';
    };
    validateEmail(value4.value);

    return {
      value1,
      value2,
      value3,
      value4,
      errorMsg,
      validateEmail,
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
.input-wrapper {
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;

  &:focus-within {
    border-color: #409eff;
  }

  input {
    flex: 1;
    padding: 8px 12px;
    border: none;
    font-size: 14px;
    outline: none;
    min-width: 0;
  }

  &.has-prefix input {
    padding-left: 4px;
  }
  &.has-suffix input {
    padding-right: 4px;
  }
}

.prefix {
  padding-left: 10px;
  color: #909399;
  &.text {
    font-size: 14px;
    white-space: nowrap;
  }
}
.suffix {
  padding-right: 10px;
  color: #909399;
  cursor: pointer;
  &.text {
    font-size: 14px;
    cursor: default;
    white-space: nowrap;
  }
}

.case [role="alert"] {
  color: #f56c6c;
  font-size: 12px;
}
</style>
