<template>
  <div class="case">
    <p class="case-title">Calendar (mode: dateTimeRange)</p>
    <ev-calendar
      v-model="calendar9"
      class="case-block"
      mode="dateTimeRange"
      :options="{
        timeFormat: ['HH:mm:30', 'HH:20:ss'],
      }"
    />
    <div class="description">
      <span class="badge">
        date
      </span>
      {{ calendar9 }}
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const calendar9 = ref(['2021-11-10 16:01:01', '2021-12-10 17:10:15']);

    return {
      calendar9,
    };
  },
};
</script>

<style>
.case-block {
  margin-right: 30px;
  border: 1px solid black;
}
</style>
