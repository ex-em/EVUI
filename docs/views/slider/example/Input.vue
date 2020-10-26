<template>
  <div class="case">
    <p class="case-title">Common</p>
    <ev-slider
      v-model="modelValue1"
      show-input
    />
    <div class="description">
      <span class="badge dark">
        Slider Value
        {{ modelValue1 }}
      </span>
    </div>
  </div>
  <div class="case">
    <p class="case-title">Maximum & Minimum Value</p>
    <ev-slider
      v-model="modelValue2"
      :min="2"
      :max="10"
      show-input
      show-step
    />
    <div class="description" style="margin-bottom: 20px;">
      <span class="badge yellow">
        min=2
      </span>
      <span class="badge yellow">
        max=10
      </span>
      <span class="badge dark">
        Slider Value
        {{ modelValue2 }}
      </span>
    </div>
    <ev-slider
      v-model="modelValue3"
      :min="-30"
      :max="10"
      show-input
      show-step
    />
    <div class="description">
      <span class="badge yellow">
        min=-30
      </span>
      <span class="badge yellow">
        max=10
      </span>
      <span class="badge dark">
        Slider Value
        {{ modelValue3 }}
      </span>
    </div>
  </div>
  <div class="case">
    <p class="case-title">Step</p>
    <ev-slider
      v-model="modelValue4"
      :step="8"
      show-input
      show-step
    />
    <div class="description">
      <span class="badge yellow">
        step=8
      </span>
      <span class="badge dark">
        Slider Value
        {{ modelValue4 }}
      </span>
    </div>
  </div>
  <div class="case">
    <p class="case-title">Range</p>
    <ev-slider
      v-model="modelValue5"
      :step="15"
      range
      show-input
      show-step
    />
    <div class="description">
      <span class="badge">
        step=15
      </span>
      <span class="badge dark">
        Slider Value
        {{ modelValue5 }}
      </span>
    </div>
  </div>
</template>

<script>
  import { ref } from 'vue';

  export default {
    setup() {
      const modelValue1 = ref(42);
      const modelValue2 = ref(8);
      const modelValue3 = ref(-12);
      const modelValue4 = ref(30);
      const modelValue5 = ref([1, 20]);
      return {
        modelValue1,
        modelValue2,
        modelValue3,
        modelValue4,
        modelValue5,
      };
    },
  };
</script>
