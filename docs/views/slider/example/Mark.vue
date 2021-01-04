<template>
  <div class="case">
    <p class="case-title">Common - Value</p>
    <ev-slider
      v-model="modelValue1"
      :mark="{
        10: 'Custom Label 10',
        30: 'Custom Label 30',
        70: 'Custom Label 70',
      }"
    />
    <div class="description" style="margin-bottom: 20px;">
      <span class="badge">
        min=0
      </span>
      <span class="badge">
        max=100
      </span>
      <span class="badge">
        step=1
      </span>
    </div>
    <ev-slider
      v-model="modelValue2"
      :mark="{
        value: {
          10: '10 Value',
          50: '50 Value',
          80: '80 Value',
        },
      }"
    />
    <div class="description" style="margin-bottom: 20px;">
      <span class="badge">
        min=0
      </span>
      <span class="badge">
        max=100
      </span>
      <span class="badge">
        step=1
      </span>
    </div>
  </div>
  <div class="case">
    <p class="case-title">Percent</p>
    <ev-slider
      v-model="modelValue2"
      :max="80"
      :mark="{
        percent: {
          10: '10%',
          50: '50%',
          80: '80%',
        },
        value: {
          50: '50 Value',
        },
      }"
    />
    <ev-slider
      v-model="modelValue3"
      range
      readonly
      :mark="{
        33.33: 'Warning Value',
        66.66: 'Critical Value',
      }"
      :color="['#3C81F6', '#FADE4C', '#FF470E']"
      :show-tooltip="false"
    />
    <div class="description">
      <span class="badge">
        min=0
      </span>
      <span class="badge">
        max=80
      </span>
      <span class="badge">
        step=1
      </span>
    </div>
  </div>
  <div class="case">
    <p class="case-title">Style</p>
    <ev-slider
      v-model="modelValue2"
      :max="80"
      :mark="{
        value: {
          10: '10 Value',
          35: '35 Value',
          75: '75 Value',
        },
        style: {
          color: '#FF470E',
          fontSize: '14px',
          backgroundColor: '#E8E8E8',
          borderBottom: '1px solid #BBBBBB',
        },
      }"
    />
    <div class="description">
      <span class="badge">
        min=0
      </span>
      <span class="badge">
        max=80
      </span>
      <span class="badge">
        step=1
      </span>
    </div>
  </div>
</template>

<script>
  import { ref } from 'vue';

  export default {
    setup() {
      const modelValue1 = ref();
      const modelValue2 = ref();
      const modelValue3 = ref([33.33, 66.66]);
      return {
        modelValue1,
        modelValue2,
        modelValue3,
      };
    },
  };
</script>
