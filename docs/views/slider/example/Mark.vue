<template>
  <div class="case">
    <p class="case-title">Common - Value</p>
    <ev-slider
      v-model="modelValue1"
      :mark="mark1"
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
      :mark="mark2"
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
      :mark="mark3"
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
      :mark="mark4"
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
      const mark1 = {
        10: 'Custom Label 10',
        30: 'Custom Label 30',
        70: 'Custom Label 70',
      };
      const mark2 = {
        value: {
          10: '10 Value',
          50: '50 Value',
          80: '80 Value',
        },
      };
      const mark3 = {
        percent: {
          10: '10%',
          50: '50%',
          80: '80%',
        },
        value: {
          50: '50 Value',
        },
      };
      const mark4 = {
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
      };
      return {
        mark1,
        mark2,
        mark3,
        mark4,
        modelValue1,
        modelValue2,
      };
    },
  };
</script>
