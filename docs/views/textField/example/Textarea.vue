<template>
  <div class="case">
    <p class="case-title">Common</p>
    <ev-text-field
      v-model="modelValue1"
      placeholder="Please enter the content"
      type="textarea"
    />
    <div class="description">
      <span class="badge yellow">
        type="textarea"
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
      type="textarea"
      readonly
    />
  </div>

  <div class="case">
    <p class="case-title">Disabled</p>
    <ev-text-field
      v-model="modelValue3"
      type="textarea"
      disabled
    />
  </div>

  <div class="case">
    <p class="case-title">Max Length</p>
    <div style="display: flex;">
      <ev-text-field
        v-model="modelValue4"
        placeholder="Please enter the content"
        type="textarea"
        :max-length="10"
      />
      <ev-text-field
        v-model="modelValue4"
        placeholder="Please enter the content"
        type="textarea"
        :max-length="10"
        show-max-length
      />
    </div>
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

    return {
      modelValue1,
      modelValue2,
      modelValue3,
      modelValue4,
    };
  },
};
</script>
