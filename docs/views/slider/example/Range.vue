<template>
  <div class="case">
    <p class="case-title">Common</p>
    <ev-slider
      v-model="modelValue1"
      range
    />
    <div class="description">
      <span class="badge dark">
        Slider Value
        {{ modelValue1 }}
      </span>
    </div>
  </div>
  <div class="case">
    <p class="case-title">Step</p>
    <ev-slider
      v-model="modelValue2"
      :step="8"
      range
      show-step
    />
    <div class="description">
      <span class="badge yellow">
        step=8
      </span>
      <span class="badge dark">
        Slider Value
        {{ modelValue2 }}
      </span>
    </div>
  </div>
  <div class="case">
    <p class="case-title">Fill Color</p>
    <ev-slider
      v-model="modelValue2"
      :step="8"
      :color="'#FADE4C'"
      range
    />
    <div class="description">
      <span class="badge yellow">
        color="#FADE4C"
      </span>
    </div>
    <ev-slider
      v-model="modelValue2"
      :step="8"
      :color="['#3C81F6', '#FADE4C', '#FF470E']"
      range
    />
    <div class="description">
      <span class="badge yellow">
        color=['#3C81F6', '#FADE4C', '#FF470E']
      </span>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const modelValue1 = ref([40, 84]);
    const modelValue2 = ref([20, 45]);
    return {
      modelValue1,
      modelValue2,
    };
  },
};
</script>
