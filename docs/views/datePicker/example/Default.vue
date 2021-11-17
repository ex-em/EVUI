<template>
  <div class="case">
    <p class="case-title">Calendar date mode</p>
    <ev-date-picker
      v-model="date1"
      placeholder="Select a date."
      clearable
      :shortcuts="[{
          label: 'Yesterday',
          value: 'yesterday',
          shortcutDate: () => {
            return new Date().setDate(new Date().getDate() - 1);
          }
        }, {
          label: 'Today',
          value: 'today',
          shortcutDate: () => {
            return new Date();
          }
        }]"
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
      :options="{
        timeFormat: 'HH:mm:00',
      }"
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
        disabledDate: (time) => time.getDay() === 0 || time.getDay() === 6
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
        multiType: 'weekday'
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
        tagShorten: true
      }"
    />
    <ev-date-picker
      v-model="dateMulti3"
      mode="dateMulti"
      :options="{
        multiType: 'week'
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
      clearable
    />
    <div class="description">
      <span class="badge">
        Value
      </span>
      {{ dateRange1 }}
    </div>
  </div>
  <div class="case">
    <p class="case-title">Calendar dateTimeRange mode</p>
    <ev-date-picker
        v-model="dateTimeRange1"
        mode="dateTimeRange"
        clearable
    />
    <div class="description">
      <span class="badge">
        Value
      </span>
      {{ dateTimeRange1 }}
    </div>
  </div>
  <div class="case">
    <p class="case-title">Calendar dateTimeRange mode(shortcuts)</p>
    <ev-date-picker
        v-model="dateTimeRange2"
        mode="dateTimeRange"
        clearable
        :options="{
          timeFormat: ['HH:00:ss', 'HH:59:ss']
        }"
        :shortcuts="[{
          label: 'LastMonth',
          value: 'lastMonth',
          shortcutDate: () => {
            return [
                new Date().setDate(new Date().getDate() - 30),
                new Date(),
            ]
          }
        },{
          label: 'LastWeek',
          value: 'lastWeek',
          shortcutDate: () => {
            return [
                new Date().setDate(new Date().getDate() - 6),
                new Date(),
            ]
          }
        },{
          label: 'Weekday',
          value: 'weekday',
          shortcutDate: () => {
            return [
                new Date(
                    new Date().getFullYear(),
                    new Date().getMonth(),
                    new Date().getDate() - new Date().getDay() + 1),
                new Date(
                    new Date().getFullYear(),
                    new Date().getMonth(),
                new Date().getDate() + (5 - new Date().getDay())),
            ];
          }
        }, {
          label: 'Today',
          value: 'today',
          shortcutDate: () => {
            return [
                new Date(),
                new Date(),
            ]
          }
        }]"
    />
    <div class="description">
      <span class="badge">
        Value
      </span>
      {{ dateTimeRange2 }}
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const date1 = ref('2020-09-01');
    const dateTime1 = ref('2020-10-15 13:09:10');
    const dateMulti1 = ref([]);
    const dateMulti2 = ref([]);
    const dateMulti3 = ref([]);
    const dateRange1 = ref([]);
    const dateTimeRange1 = ref([]);
    const dateTimeRange2 = ref(['2021-11-10 16:01:01', '2021-12-10 17:10:15']);

    return {
      date1,
      dateTime1,
      dateMulti1,
      dateMulti2,
      dateMulti3,
      dateRange1,
      dateTimeRange1,
      dateTimeRange2,
    };
  },
};
</script>

<style>
.case-block {
  border: 1px solid black;
}
</style>
