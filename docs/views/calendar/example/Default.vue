<template>
  <div class="case">
    <p class="case-title">Calendar (mode: date)</p>
    <ev-calendar
      v-model="calendar1"
      class="case-block"
    />
    <ev-calendar
      v-model="calendar2"
      class="case-block"
    />
    <div class="description">
      <span class="badge">
        date
      </span>
      {{ calendar1 }}
      <br><br>
      <span class="badge">
        date
      </span>
      {{ calendar2 }}
    </div>
  </div>
  <div class="case">
    <p class="case-title">Calendar (mode: dateTime)</p>
    <ev-calendar
      v-model="calendar3"
      class="case-block"
      mode="dateTime"
    />
    <br>
    <br>
    <ev-calendar
      v-model="calendar4"
      class="case-block"
      mode="dateTime"
    />
    <div class="description">
      <span class="badge">
        dateTime
      </span>
      {{ calendar3 }}
      <br><br>
      <span class="badge">
        dateTime
      </span>
      {{ calendar4 }}
    </div>
  </div>
  <div class="case">
    <p class="case-title">Calendar (mode: dateMulti, type: day, limit: 3)</p>
    <ev-calendar
      v-model="calendar5"
      class="case-block"
      mode="dateMulti"
      :options="{
        multiType: 'date',
        multiDayLimit: 3,
        disabledDate: (time) => time.getDay() === 0 || time.getDay() === 6,
      }"
    />
    <div class="description">
      <span class="badge">
        date
      </span>
      {{ calendar5 }}
    </div>
  </div>
  <div class="case">
    <p class="case-title">Calendar (mode: dateMulti, type: weekday)</p>
    <ev-calendar
      v-model="calendar6"
      class="case-block"
      mode="dateMulti"
      :options="{
        multiType: 'weekday',
        disabledDate: (time) => time.getTime() <= Date.now(),
      }"
    />
    <div class="description">
      <span class="badge">
        date
      </span>
      {{ calendar6 }}
    </div>
  </div>
  <div class="case">
    <p class="case-title">Calendar (mode: dateMulti, type: week)</p>
    <ev-calendar
      v-model="calendar7"
      class="case-block"
      mode="dateMulti"
      :options="{
        multiType: 'week',
        disabledDate: (time) => time.getTime() > Date.now(),
      }"
    />
    <div class="description">
      <span class="badge">
        date
      </span>
      {{ calendar7 }}
    </div>
  </div>
  <div class="case">
    <p class="case-title">Calendar (mode: dateRange)</p>
    <ev-calendar
      v-model="calendar8"
      class="case-block"
      mode="dateRange"
      :options="{
        disabledDate: (time) => time.getDay() === 2 || time.getDay() === 4,
      }"
    />
    <div class="description">
      <span class="badge">
        date
      </span>
      {{ calendar8 }}
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const calendar1 = ref(null);
    const calendar2 = ref('2020-09-15');
    const calendar3 = ref(null);
    const calendar4 = ref('2020-10-14 14:38:01');
    const calendar5 = ref(['2020-10-21', '2020-11-01']);
    const calendar6 = ref([]);
    const calendar7 = ref([]);
    const calendar8 = ref(['2020-10-21', '2020-11-05']);

    return {
      calendar1,
      calendar2,
      calendar3,
      calendar4,
      calendar5,
      calendar6,
      calendar7,
      calendar8,
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
