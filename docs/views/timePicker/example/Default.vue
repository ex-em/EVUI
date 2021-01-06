<template>
  <div class="case">
    <p class="case-title">Range</p>
    <ev-time-picker
      v-model="rangeTime"
      @change="changeTime"
    />
    <div class="description">
      <span class="badge"> Time </span>
      {{ rangeTime }}
    </div>
  </div>
  <div class="case">
    <p class="case-title">Single</p>
    <ev-time-picker
      v-model="commonTime"
      type="single"
    />
    <div class="description">
      <span class="badge">Time</span>
      {{ commonTime }}
    </div>
  </div>
  <div class="case">
    <p class="case-title">Clearable</p>
    <ev-time-picker
      v-model="clearableTime"
      type="single"
      clearable
    />
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const commonTime = ref('');
    const clearableTime = ref('01:00');
    const rangeTime = ref(['12:00', '23:00']);
    const changeTime = (e, value) => {
      console.log(e, value);
    };

    return {
      commonTime,
      clearableTime,
      rangeTime,
      changeTime,
    };
  },
};
</script>

<style lang="scss">
</style>
