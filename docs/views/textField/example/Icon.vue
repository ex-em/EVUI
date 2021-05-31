<template>
  <div class="case">
    <p class="case-title">Prefix</p>
    <ev-text-field
      v-model="modelValue1"
      placeholder="Please enter the content"
      type="text"
    >
      <template #icon-prefix>
        <ev-icon icon="ev-icon-search"></ev-icon>
      </template>
    </ev-text-field>
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
    <p class="case-title">Suffix</p>
    <ev-text-field
      v-model="modelValue2"
      placeholder="Please enter the content"
      type="text"
    >
      <template #icon-suffix>
        <ev-icon icon="ev-icon-calendar"></ev-icon>
      </template>
    </ev-text-field>
    <div class="description">
      <span class="badge yellow">
        type="text"
      </span>
      <span class="badge">
        Text Field Value
      </span>
      {{ modelValue2 }}
    </div>
  </div>
  <div class="case">
    <p class="case-title">Prefix & Suffix</p>
    <ev-text-field
      v-model="modelValue3"
      placeholder="Please enter the content"
      type="text"
    >
      <template #icon-prefix>
        <ev-icon icon="ev-icon-search"></ev-icon>
      </template>
      <template #icon-suffix>
        <ev-icon icon="ev-icon-calendar"></ev-icon>
      </template>
    </ev-text-field>
    <div class="description">
      <span class="badge yellow">
        type="text"
      </span>
      <span class="badge">
        Text Field Value
      </span>
      {{ modelValue3 }}
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const modelValue1 = ref();
    const modelValue2 = ref();
    const modelValue3 = ref();

    return {
      modelValue1,
      modelValue2,
      modelValue3,
    };
  },
};
</script>
