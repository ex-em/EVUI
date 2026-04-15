<template>
  <div class="case">
    <p class="case-title">기본 사용</p>
    <ev-input v-model="value1" placeholder="내용을 입력하세요" />
    <div class="description">
      <span class="badge"> Value </span>
      {{ value1 }}
    </div>
  </div>

  <div class="case">
    <p class="case-title">단독 사용 (Root 없이)</p>
    <ev-input
      v-model="value2"
      type="email"
      name="email"
      placeholder="이메일을 입력하세요"
    />
    <div class="description">
      <span class="badge yellow"> type="email" name="email" </span>
      <span class="badge"> Value </span>
      {{ value2 }}
    </div>
  </div>

  <div class="case">
    <p class="case-title">disabled / readonly</p>
    <div style="display: flex; gap: 12px">
      <ev-input v-model="value3" disabled />
      <ev-input v-model="value4" readonly />
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const value1 = ref('');
    const value2 = ref('');
    const value3 = ref('Disabled');
    const value4 = ref('Readonly');

    return {
      value1,
      value2,
      value3,
      value4,
    };
  },
};
</script>

<style lang="scss" scoped>
.case input {
  width: 300px;
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
</style>
