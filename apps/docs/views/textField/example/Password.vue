<template>
  <div class="case">
    <p class="case-title">Common</p>
    <ev-text-field
      v-model="modelValue1"
      placeholder="Please enter the password"
      type="password"
    />
    <div class="description">
      <span class="badge yellow">
        type="password"
      </span>
    </div>
  </div>
  <div class="case">
    <p class="case-title">Show Password</p>
    <ev-text-field
      v-model="modelValue2"
      placeholder="Please enter the content"
      type="password"
      show-password
    />
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const modelValue1 = ref();
    const modelValue2 = ref();

    return {
      modelValue1,
      modelValue2,
    };
  },
};
</script>
