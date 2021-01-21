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
  <div class="case">
    <p class="case-title">Disabled</p>
    <ev-time-picker
      v-model="disabledTime"
      type="single"
      disabled
    />
  </div>
  <div class="case">
    <p class="case-title">ReadOnly</p>
    <ev-time-picker
      v-model="readOnlyTime"
      type="single"
      readonly
    />
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const commonTime = ref('');
    const readOnlyTime = ref('00:00');
    const clearableTime = ref('01:00');
    const disabledTime = ref('09:00');
    const rangeTime = ref(['12:00', '23:59']);
    const changeTime = (e, value) => {
      console.log(e, value);
    };

    return {
      commonTime,
      clearableTime,
      disabledTime,
      rangeTime,
      readOnlyTime,
      changeTime,
    };
  },
};
</script>

<style lang="scss">
</style>
