<template>
  <div class="case">
    <p class="case-title">Common</p>
    <ev-input-number
      v-model="inputNumber1"
    />
    <div class="description">
      <span class="badge">
        InputNumber Value
      </span>
      {{ inputNumber1 }}
    </div>
  </div>
  <div class="case">
    <p class="case-title">Readonly</p>
    <ev-input-number
      v-model="inputNumber1"
      readonly
    />
  </div>
  <div class="case">
    <p class="case-title">Disabled</p>
    <ev-input-number
      v-model="inputNumber1"
      disabled
    />
  </div>
  <div class="case">
    <p class="case-title">Maximum & Minimum Value</p>
    <ev-input-number
      v-model="inputNumber2"
      :max="10"
      :min="2"
    />
    <div class="description">
      <span class="badge yellow">
        max="10"
      </span>
      <span class="badge yellow">
        min="2"
      </span>
    </div>
  </div>
  <div class="case">
    <p class="case-title">Step</p>
    <ev-input-number
      v-model="inputNumber3"
      :step="3"
      :min="2"
      :max="10"
    />
    <div class="description">
      <span class="badge yellow">
        step="3"
      </span>
      <span class="badge">
        max="10"
      </span>
      <span class="badge">
        min="2"
      </span>
      {{ inputNumber3 }}
    </div>
  </div>
  <div class="case">
    <p class="case-title">Step Strictly</p>
    <ev-input-number
      v-model="inputNumber4"
      :step="3"
      :min="2"
      :max="10"
      step-strictly
    />
    <div class="description">
      <span class="badge yellow">
        step="3"
      </span>
      <span class="badge yellow">
        min="2"
      </span>
      <span class="badge">
        max="10"
      </span>
      {{ inputNumber4 }}
    </div>
  </div>
  <div class="case">
    <p class="case-title">Precision</p>
    <ev-input-number
      v-model="inputNumber5"
      :precision="3"
      :step="0.02"
    />
    <div class="description">
      <span class="badge yellow">
        precision="3"
      </span>
      <span class="badge">
        step="0.02"
      </span>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const inputNumber1 = ref();
    const inputNumber2 = ref();
    const inputNumber3 = ref();
    const inputNumber4 = ref();
    const inputNumber5 = ref();
    return {
      inputNumber1,
      inputNumber2,
      inputNumber3,
      inputNumber4,
      inputNumber5,
    };
  },
};
</script>

<style lang="scss" scoped>
.case .ev-input-number {
  width: 300px;
  margin-right: 15px;
}
</style>
