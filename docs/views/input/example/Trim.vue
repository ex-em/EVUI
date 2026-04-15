<template>
  <div class="case">
    <p class="case-title">v-model.trim</p>
    <ev-input-root>
      <ev-input-label>Trim 적용</ev-input-label>
      <ev-input v-model.trim="value1" placeholder="앞뒤 공백을 넣어보세요" />
    </ev-input-root>
    <div class="description">
      <span class="badge yellow"> v-model.trim </span>
      <span class="badge"> Value </span>
      "{{ value1 }}"
    </div>
  </div>

  <div class="case">
    <p class="case-title">Trim 미적용 (비교)</p>
    <ev-input-root>
      <ev-input-label>Trim 없음</ev-input-label>
      <ev-input v-model="value2" placeholder="앞뒤 공백을 넣어보세요" />
    </ev-input-root>
    <div class="description">
      <span class="badge"> Value </span>
      "{{ value2 }}"
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const value1 = ref('');
    const value2 = ref('');

    return {
      value1,
      value2,
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
</style>
