<template>
  <div class="case">
    <p class="case-title">Calendar date mode</p>
    <ev-date-picker
      v-model="date1"
      placeholder="Select a date."
      clearable
    />
    <ev-date-picker
      v-model="date1"
      placeholder="Select a date."
      disabled
    />
    <div class="description">
      <span class="badge">
        date1
      </span>
      {{ date1 }}
    </div>
  </div>
  <div class="case">
    <p class="case-title">Calendar dateTime mode</p>
    <ev-date-picker
      v-model="dateTime1"
      mode="dateTime"
    />
    <div class="description">
      <span class="badge">
        dateTime1
      </span>
      {{ dateTime1 }}
    </div>
  </div>
  <div class="case">
    <p class="case-title">Calendar dateMulti mode(multiType: date, multiDayLimit: 3)</p>
    <ev-date-picker
      v-model="dateMulti1"
      mode="dateMulti"
      :clearable="true"
      :options="{
        multiType: 'date',
        multiDayLimit: 3,
        disabledDate: (time) => time.getDay() === 0 || time.getDay() === 6,
      }"
    />
    <div class="description">
      <span class="badge">
        Value
      </span>
      {{ dateMulti1 }}
    </div>
  </div>
  <div class="case">
    <p class="case-title">Calendar dateMulti mode(multiType: weekday)</p>
    <ev-date-picker
      v-model="dateMulti2"
      mode="dateMulti"
      :clearable="true"
      :options="{
        multiType: 'weekday',
      }"
    />
    <div class="description">
      <span class="badge">
        Value
      </span>
      {{ dateMulti2 }}
    </div>
  </div>
  <div class="case">
    <p class="case-title">Calendar dateMulti mode(multiType: week)</p>
    <ev-date-picker
      v-model="dateMulti3"
      mode="dateMulti"
      :clearable="true"
      :options="{
        multiType: 'week',
        tagShorten: true,
      }"
    />
    <ev-date-picker
      v-model="dateMulti3"
      mode="dateMulti"
      :options="{
        multiType: 'week',
      }"
    />
    <div class="description">
      <span class="badge">
        Value
      </span>
      {{ dateMulti3 }}
    </div>
  </div>
  <div class="case">
    <p class="case-title">Calendar dateRange mode</p>
    <ev-date-picker
      v-model="dateRange1"
      mode="dateRange"
      :clearable="true"
    />
    <div class="description">
      <span class="badge">
        Value
      </span>
      {{ dateRange1 }}
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const date1 = ref('2020-09-01');
    const dateTime1 = ref('2020-10-15 13:09:00');
    const dateMulti1 = ref([]);
    const dateMulti2 = ref([]);
    const dateMulti3 = ref([]);
    const dateRange1 = ref([]);

    return {
      date1,
      dateTime1,
      dateMulti1,
      dateMulti2,
      dateMulti3,
      dateRange1,
    };
  },
};
</script>

<style>
.case-block {
  border: 1px solid black;
}
</style>
