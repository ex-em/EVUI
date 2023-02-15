<template>
  <div class="case">
    <p class="case-title">Calendar date mode (enable text input)</p>
    <ev-date-picker
      v-model="date1"
      :enable-text-input="true"
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
    <p class="case-title">Calendar dateTime mode(shortcuts)</p>
    <ev-date-picker
      v-model="dateTime2"
      mode="dateTime"
      clearable
      :enable-text-input="true"
      :options="{
        timeFormat: 'HH:00:ss'
      }"
      :shortcuts="dateTime2Shortcut"
    />
    <div class="description">
      <span class="badge">
        Value
      </span>
      {{ dateTime2 }}
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
  <div class="case ev-date-picker__date-range">
    <p class="case-title">Calendar dateRange mode (enable text input)</p>
    <ev-date-picker
        v-model="dateRange2"
        mode="dateRange"
        :enable-text-input="true"
        clearable
    />
    <div class="description">
      <span class="badge">
        Value
      </span>
      {{ dateRange2 }}
    </div>
  </div>
  <div class="case">
    <p class="case-title">Calendar dateRange mode (shortcut)</p>
    <ev-date-picker
      v-model="dateRange1"
      mode="dateRange"
      clearable
      :shortcuts="dateTimeRange2Shortcut"
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
        :options="{
          timeFormat: ['HH:mm:00', 'HH:mm:00'],
          disabledDate: disabledDateTime,
        }"
        :shortcuts="dateTimeRange2Shortcut"
    />
    <div class="description">
      <span class="badge">
        Value
      </span>
      {{ dateTimeRange2 }}
    </div>
    <div class="case ev-date-picker__date-time-range">
      <p class="case-title">Calendar dateTimeRange mode (enable text input)</p>
      <ev-date-picker
          v-model="dateTimeRange3"
          mode="dateTimeRange"
          :enable-text-input="true"
          clearable
      />
      <div class="description">
      <span class="badge">
        Value
      </span>
        {{ dateTimeRange3 }}
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref } from 'vue';
import dayjs from 'dayjs';

export default {
  setup() {
    const date1 = ref('2020-09-01');
    const dateTime1 = ref('2020-10-15 13:09:10');
    const dateTime2 = ref('2021-11-22 13:09:10');
    const dateMulti1 = ref([]);
    const dateMulti2 = ref([]);
    const dateMulti3 = ref([]);
    const dateRange1 = ref([]);
    const dateRange2 = ref(['2023-02-12', '2023-02-13']);
    const dateTimeRange1 = ref([]);
    const dateTimeRange2 = ref(['2022-06-07 16:01:01', '2022-06-08 17:10:15']);
    const dateTimeRange3 = ref(['2023-02-14 10:00:00', '2023-02-14 11:00:00']);

    const TODAY_0_O_CLOCK_DATE = new Date(dayjs()
        .format('YYYY-MM-DD 00:00:00'));

    const dateTime2Shortcut = [{
      label: 'Yesterday',
      value: 'yesterday',
      shortcutDate: () => new Date(dayjs(TODAY_0_O_CLOCK_DATE).subtract(1, 'day')),
    }, {
      label: 'Today',
      value: 'today',
      shortcutDate: () => new Date(TODAY_0_O_CLOCK_DATE),
    }];

    const dateTimeRange2Shortcut = [
        {
          label: 'LastMonth',
          value: 'lastMonth',
          shortcutDate: () => [
            new Date(dayjs(TODAY_0_O_CLOCK_DATE).subtract(30, 'd')),
            new Date(TODAY_0_O_CLOCK_DATE),
          ],
      },
      {
        label: 'LastWeek',
        value: 'lastWeek',
        shortcutDate: () => [
          new Date(dayjs(TODAY_0_O_CLOCK_DATE).subtract(6, 'day')),
          new Date(TODAY_0_O_CLOCK_DATE),
        ],
      },
      {
        label: 'yesterday',
        value: 'yesterday',
        shortcutDate: () => [
          new Date(dayjs(TODAY_0_O_CLOCK_DATE).subtract(1, 'day')),
          new Date(dayjs(TODAY_0_O_CLOCK_DATE)),
        ],
      },
      {
        label: 'Today',
        value: 'today',
        shortcutDate: () => [
          new Date(TODAY_0_O_CLOCK_DATE),
          new Date(+TODAY_0_O_CLOCK_DATE + (1000 * 60 * 30)),
        ],
      },
    ];

    // toDate - fromDate 최소 선택 시간: 30분, 최대 선택 날짜: 한달
    const disabledDateTime = computed(() => [
      time => +time > +new Date(dateTimeRange2.value[1]) - (1000 * 60 * 30)
            || +time < +new Date(dayjs(dateTimeRange2.value[1]).subtract(1, 'month')),
      time => (+time < +new Date(dateTimeRange2.value[0]) + (1000 * 60 * 30))
            || (+time >= +new Date(dayjs(TODAY_0_O_CLOCK_DATE).add(2, 'day'))),
    ]);

    return {
      date1,
      dateTime1,
      dateTime2,
      dateTime2Shortcut,
      dateMulti1,
      dateMulti2,
      dateMulti3,
      dateRange1,
      dateRange2,
      dateTimeRange1,
      dateTimeRange2,
      dateTimeRange2Shortcut,
      dateTimeRange3,
      disabledDateTime,
    };
  },
};
</script>
<style lang="scss">
.ev-date-picker__date-range {
  .ev-date-picker-range-input {
    width: 100px;
    flex: none;
  }
}
.ev-date-picker__date-time-range {
  .ev-date-picker-range-input {
    width: 155px;
    flex: none;
    text-align: center;
  }
}
</style>
