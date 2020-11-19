<template>
  <div class="case">
    <p class="case-title">Common</p>
    <ev-progress
      v-model="progressVal1"
    />
    <br>
    <ev-progress
      v-model="progressVal1"
      color="#67C23A"
    >
      <p>{{ progressVal1 }} %</p>
    </ev-progress>
    <br>
    <ev-progress
      v-model="progressVal1"
      color="#FADE4C"
      :stroke-width="15"
    />
    <br>
    <ev-progress
      v-model="progressVal1"
      :color="customColors"
      :stroke-width="20"
      :inner-text="`${progressVal1}%`"
    />
    <div class="description">
      <button
        class="btn"
        @click="changeVal1"
      >
        Change Value : {{ progressVal1 }}
      </button>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const progressVal1 = ref(50);
    const changeVal1 = () => {
      if (progressVal1.value === 100) {
        progressVal1.value = 0;
      } else {
        progressVal1.value += 10;
      }
    };
    const customColors = [
      { color: '#F56C6C', value: 20 },
      { color: '#1989FA', value: 80 },
      { color: '#E6A23C', value: 40 },
      { color: '#6F7AD3', value: 100 },
      { color: '#5CB87A', value: 60 },
    ];

    return {
      progressVal1,
      changeVal1,
      customColors,
    };
  },
};
</script>

<style lang="scss">
</style>
