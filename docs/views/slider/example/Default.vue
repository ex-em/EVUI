<template>
  <div class="case">
    <p class="case-title">Common</p>
    <ev-slider
      v-model="modelValue1"
    />
    <div class="description">
      <span class="badge dark">
        Slider Value
        {{ modelValue1 }}
      </span>
    </div>
  </div>
  <div class="case">
    <p class="case-title">Disabled</p>
    <ev-slider
      v-model="modelValue1"
      disabled
    />
    <ev-slider
      v-model="modelValue1"
      disabled
      show-step
    />
  </div>
  <div class="case">
    <p class="case-title">Maximum & Minimum Value</p>
    <ev-slider
      v-model="modelValue2"
      :min="2"
      :max="10"
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
      :min="-20"
      :max="10"
    />
    <div class="description">
      <span class="badge yellow">
        min=-20
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
      :max="45"
      :min="1"
      :step="9"
      show-step
    />
    <div class="description">
      <span class="badge yellow">
        step=9
      </span>
      <span class="badge">
        max=45
      </span>
      <span class="badge">
        min=1
      </span>
      <span class="badge dark">
        Slider Value
        {{ modelValue4 }}
      </span>
    </div>
  </div>
  <div class="case">
    <p class="case-title">Hide Tooltip</p>
    <ev-slider
      v-model="modelValue4"
      :max="45"
      :min="1"
      :step="9"
      :show-tooltip="false"
    />
  </div>
  <div class="case">
    <p class="case-title">Tooltip Format</p>
    <ev-slider
      v-model="modelValue4"
      :max="45"
      :min="1"
      :step="9"
      :tooltip-format="format1"
    />
    <ev-slider
      v-model="modelValue4"
      :max="45"
      :min="1"
      :step="9"
      :tooltip-format="format2"
    />
  </div>
  <div class="case">
    <p class="case-title">Fill Color</p>
    <ev-slider
      v-model="modelValue4"
      :max="45"
      :min="1"
      :step="9"
      color="#FADE4C"
      show-step
    />
    <div class="description">
      <span class="badge yellow">
        color="#FADE4C"
      </span>
    </div>
    <ev-slider
      v-model="modelValue4"
      :max="45"
      :min="1"
      :step="9"
      :color="['#3C81F6', '#FADE4C']"
    />
    <div class="description">
      <span class="badge yellow">
        color=['#3C81F6', '#FADE4C']
      </span>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const modelValue1 = ref(50);
    const modelValue2 = ref(4);
    const modelValue3 = ref(-6);
    const modelValue4 = ref(12);
    const format1 = val => `Custom ${val}`;
    const format2 = val => `<p>Custom</p> <strong>${val}</strong>`;
    return {
      modelValue1,
      modelValue2,
      modelValue3,
      modelValue4,
      format1,
      format2,
    };
  },
};
</script>
