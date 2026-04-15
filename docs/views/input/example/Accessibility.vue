<template>
  <div class="case">
    <p class="case-title">required + invalid 상태</p>
    <ev-input-root :required="true" :invalid="!value1">
      <ev-input-label>필수 입력</ev-input-label>
      <ev-input v-model="value1" placeholder="필수 입력 항목입니다" />
      <ev-input-error-message v-if="!value1">
        필수 입력 항목입니다.
      </ev-input-error-message>
    </ev-input-root>
    <div class="description">
      <span class="badge yellow"> required </span>
      <span class="badge yellow"> invalid </span>
      <span class="badge">aria-required, aria-invalid 자동 설정</span>
    </div>
  </div>

  <div class="case">
    <p class="case-title">disabled 상태 전파</p>
    <ev-input-root :disabled="isDisabled">
      <ev-input-label>비활성 입력</ev-input-label>
      <ev-input v-model="value2" placeholder="Root에서 disabled 전파" />
      <ev-input-description>
        Root의 disabled가 Input에 자동 전파됩니다.
      </ev-input-description>
    </ev-input-root>
    <div class="description">
      <button @click="isDisabled = !isDisabled">
        {{ isDisabled ? 'Enable' : 'Disable' }}
      </button>
    </div>
  </div>

  <div class="case">
    <p class="case-title">Native Attributes 전달</p>
    <ev-input-root>
      <ev-input-label>검색</ev-input-label>
      <ev-input
        v-model="value3"
        type="search"
        name="search"
        autocomplete="off"
        data-testid="search-input"
        placeholder="native attrs가 input에 직접 전달됩니다"
      />
    </ev-input-root>
    <div class="description">
      <span class="badge yellow"> type, name, autocomplete, data-testid </span>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const value1 = ref('');
    const value2 = ref('');
    const value3 = ref('');
    const isDisabled = ref(true);

    return {
      value1,
      value2,
      value3,
      isDisabled,
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
.case input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}
.case [role="alert"] {
  color: #f56c6c;
  font-size: 12px;
}
.case .ev-input-description {
  color: #909399;
  font-size: 12px;
}
.case button {
  padding: 4px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}
</style>
