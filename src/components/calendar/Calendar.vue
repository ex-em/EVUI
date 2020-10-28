<template>
  <div class="ev-calendar-wrapper">
    <div class="ev-calendar-date-area">
      <div class="ev-calendar-header">
        <div>
          <i
            class="ev-icon-s-arrow-left"
            @click="clickPrevNextBtn('main', 'prev')"
          />
        </div>
        <span class="ev-calendar-year">{{ mainCalendarPageInfo.year }}</span>
        <span class="ev-calendar-month">{{ mainCalendarMonth }}</span>
        <div>
          <i
            class="ev-icon-s-arrow-right"
            @click="clickPrevNextBtn('main', 'next')"
          />
        </div>
      </div>
      <div class="ev-calendar-body">
        <table
          :key="'main_calendar_table'"
          class="ev-calendar-table"
        >
          <thead>
            <tr>
              <th
                v-for="dayOfTheWeek in dayOfTheWeekList"
                :key="dayOfTheWeek"
              >
                {{ dayOfTheWeek }}
              </th>
            </tr>
          </thead>
          <tbody
            @wheel.prevent="wheelMonth('main', $event)"
          >
            <tr
              v-for="weekInfo in mainCalendarTableInfo"
              :key="weekInfo"
            >
              <td
                v-for="dateInfo in weekInfo"
                :key="dateInfo"
                class="ev-calendar-date-td"
                :class="[
                  { [dateInfo.monthType]: !!dateInfo.monthType },
                  { today: dateInfo.isToday },
                  { selected: dateInfo.isSelected },
                ]"
                @click="clickDate('main', dateInfo)"
                @[`${calendarEventName}`]="onMousemoveDate('main', $event)"
              >
                <div>
                  <span>
                    {{ dateInfo.date }}
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div
      v-if="mode === 'dateRange'"
      class="ev-calendar-date-area"
    >
      <div class="ev-calendar-header">
        <div>
          <i
            class="ev-icon-s-arrow-left"
            @click="clickPrevNextBtn('expanded', 'prev')"
          />
        </div>
        <span class="ev-calendar-year">{{ expandedCalendarPageInfo.year }}</span>
        <span class="ev-calendar-month">{{ expandedCalendarMonth }}</span>
        <div>
          <i
            class="ev-icon-s-arrow-right"
            @click="clickPrevNextBtn('expanded', 'next')"
          />
        </div>
      </div>
      <div class="ev-calendar-body">
        <table
          :key="'expanded_calendar_table'"
          class="ev-calendar-table"
        >
          <thead>
            <tr>
              <th
                v-for="dayOfTheWeek in dayOfTheWeekList"
                :key="dayOfTheWeek"
              >
                {{ dayOfTheWeek }}
              </th>
            </tr>
          </thead>
          <tbody
            @wheel.prevent="wheelMonth('expanded', $event)"
          >
            <tr
              v-for="weekInfo in expandedCalendarTableInfo"
              :key="weekInfo"
            >
              <td
                v-for="dateInfo in weekInfo"
                :key="dateInfo"
                class="ev-calendar-date-td"
                :class="[
                  { [dateInfo.monthType]: !!dateInfo.monthType },
                  { today: dateInfo.isToday },
                  { selected: dateInfo.isSelected },
                ]"
                @click="clickDate('expanded', dateInfo)"
                @[`${calendarEventName}`]="onMousemoveDate('expanded', $event)"
              >
                <div>
                  <span>
                    {{ dateInfo.date }}
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div
      v-if="mode === 'dateTime'"
      class="ev-calendar-time-area"
    >
      <div class="ev-calendar-time-side">
        <div
          v-for="hmsType in ['HOUR', 'MIN', 'SEC']"
          :key="`${hmsType}_TITLE`"
          class="ev-calendar-time-110"
        >
          {{ hmsType }}
        </div>
      </div>
      <div class="ev-calendar-time-center">
        <template
          v-for="timeType in ['hour', 'min', 'sec']"
          :key="`${timeType}_table`"
        >
          <table class="ev-calendar-time-table">
            <tbody
              @wheel.prevent="wheelTime(timeType, $event)"
            >
              <tr
                v-for="i in 2"
                :key="`${timeType}_${i}_tr`"
              >
                <td
                  v-for="j in 6"
                  :key="`${timeType}_${i}_${j}_td`"
                  class="ev-calendar-time-td"
                  :class="{
                    selected: getTimeInfo(timeType, i, j).isSelected,
                  }"
                  @click="clickTime(timeType, i, j)"
                >
                  <div> {{ getTimeInfo(timeType, i, j).num }} </div>
                </td>
              </tr>
            </tbody>
          </table>
        </template>
      </div>
      <div class="ev-calendar-time-side">
        <template
          v-for="hmsType in ['hour', 'min', 'sec']"
          :key="`${hmsType}_btn_area`"
        >
          <div
            v-for="arrowType in ['up', 'down']"
            :key="`${hmsType}_${arrowType}_btn`"
            class="ev-calendar-time-55"
            @click="clickHmsBtn(hmsType, arrowType)"
          >
            <i :class="`ev-icon-arrow-${arrowType}`" />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { useModel, useCalendarDate, useEvent } from './uses';

export default {
  name: 'EvCalendar',
  props: {
    modelValue: {
      type: [String, Array],
      default: '',
      validator: (value) => {
        const dateReq = new RegExp(/[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])/);
        const dateTimeReq = new RegExp(/[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) (2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9]/);
        if (Array.isArray(value)) {
          return value.every(v => !!(!v
            || (v.length === 10 && dateReq.exec(v))));
        }
        return !!(!value
          || (value.length === 10 && dateReq.exec(value))
          || (value.length === 19 && dateTimeReq.exec(value)));
      },
    },
    mode: {
      type: String,
      default: 'date',
      validator: value => ['date', 'dateTime', 'dateMulti', 'dateRange']
        .indexOf(value) !== -1,
    },
    monthNotation: {
      type: String,
      default: 'fullName',
      validator: value => ['fullName', 'abbrName', 'numberName', 'korName']
        .indexOf(value) !== -1,
    },
    dayOfTheWeekNotation: {
      type: String,
      default: 'abbrUpperName',
      validator: value => ['abbrUpperName', 'abbrLowerName', 'abbrPascalName', 'abbrKorName']
        .indexOf(value) !== -1,
    },
    options: {
      type: Object,
      default: () => ({
        multiType: 'date',
        limit: 1,
      }),
      validator: ({ multiType, multiDayLimit, disabledDate }) =>
        (multiType ? ['weekday', 'week', 'date'].indexOf(multiType) !== -1 : true)
        && (multiDayLimit ? typeof multiDayLimit === 'number' && multiDayLimit > 0 : true)
        && (disabledDate ? typeof disabledDate === 'function' : true),
    },
  },
  emits: {
    'update:modelValue': [Array, String],
  },
  setup(props) {
    const {
      selectedValue,
      mainCalendarPageInfo,
      expandedCalendarPageInfo,
      mainCalendarMonth,
      expandedCalendarMonth,
      dayOfTheWeekList,
    } = useModel();

    const {
      mainCalendarTableInfo,
      expandedCalendarTableInfo,
      timeTableInfo,
      setCalendarDate,
      setHmsTime,
      getTimeInfo,
    } = useCalendarDate({
      selectedValue,
      mainCalendarPageInfo,
      expandedCalendarPageInfo,
    });

    const {
      clickPrevNextBtn,
      clickDate,
      clickHmsBtn,
      clickTime,
      wheelMonth,
      wheelTime,
      calendarEventName,
      onMousemoveDate,
    } = useEvent({
      selectedValue,
      mainCalendarPageInfo,
      expandedCalendarPageInfo,
      setCalendarDate,
      setHmsTime,
    });

    setCalendarDate('main');
    if (props.mode === 'dateRange') {
      setCalendarDate('expanded');
    }
    setHmsTime();

    return {
      selectedValue,
      mainCalendarPageInfo,
      expandedCalendarPageInfo,
      mainCalendarMonth,
      expandedCalendarMonth,
      dayOfTheWeekList,

      mainCalendarTableInfo,
      expandedCalendarTableInfo,
      timeTableInfo,
      getTimeInfo,

      clickPrevNextBtn,
      clickDate,
      clickHmsBtn,
      clickTime,
      wheelMonth,
      wheelTime,
      calendarEventName,
      onMousemoveDate,
    };
  },
};
</script>

<style lang="scss">
@import '../../style/index.scss';

.ev-calendar-wrapper {
  display: inline-flex;
  height: 100%;
  box-sizing: border-box;
  flex-direction: row;
}

.ev-calendar-date-area {
  &:not(:first-child) {
    border-left: 1px solid;
  }
}

.ev-calendar-header {
  display: flex;
  height: 40px;
  padding: 10px;

  div {
    width: 20px;
    flex: 1;
    text-align: center;
  }

  i {
    width: 20px;
    height: 20px;
    line-height: 20px;
    color: #606266;
    text-align: center;
    cursor: pointer;
    &:hover {
      color: #3C81F6;
    }
  }

  span {
    flex: 2;
    text-align: center;
  }
}

.ev-calendar-body {
  padding: 10px;
  flex: 1;
}

.ev-calendar-table {
  width: 280px;
  table-layout: fixed;
  font-size: 12px;
  border-collapse: collapse;
  border-spacing: 0;
  text-align: center;
  user-select: none;

  th {
    height: 30px;
    color: #606266;
    font-weight: 400;
    border-bottom: 1px solid #EBEEF5;
  }
  td {
    height: 40px;
    color: #606266;
  }
}

.ev-calendar-date-td {
  color: #606266;

  & div {
    height: 30px;
    line-height: 30px;
    padding: 3px 0;
    margin: 5px auto;
  }

  &.prev,
  &.next {
    color: #C0C4CC;
  }

  &.today {
    font-weight: bold;
    color: #409EFF;
  }

  & span {
    display: block;
    width: 24px;
    height: 24px;
    line-height: 24px;
    margin: auto;
    border-radius: 50%;
    text-align: center;
  }

  &.selected span {
    color: #FFFFFF;
    background-color: #409EFF;
  }

  &.selected.start-date > div {
    width: 35px;
    margin: 5px 0 5px auto;
    padding-right: 5px;
    border-top-left-radius: 30px;
    border-bottom-left-radius: 30px;
  }
  &.selected.end-date > div {
    width: 35px;
    margin: 5px auto 5px 0;
    padding-left: 5px;
    border-top-right-radius: 30px;
    border-bottom-right-radius: 30px;
  }
  &.selected.start-end-date > div {
    width: 30px;
    margin: 5px auto;
    border-radius: 30px;
  }

  &:hover {
    color: #409EFF;
    cursor: pointer;
  }

  &.disabled {
    background-color: #EEF0F3;
    opacity: 1;
    color: #C0C4CC;

    &:hover {
      cursor: not-allowed;
    }
    &.selected:hover {
      cursor: pointer !important;
    }
  }

  &.in-range:not(.next):not(.prev) div {
    background-color: #F2F6FC;
  }
}

.ev-calendar-time {
  &-area {
    display: flex;
    width: 300px;
    flex-direction: row;
    font-size: 12px;
    border-left: 1px solid #EBEEF5;
    color: #606266;
    box-sizing: content-box;
  }

  &-110 {
    height: 110px;
    line-height: 110px;
  }

  &-55 {
    height: 55px;
    line-height: 55px;
    &:hover {
      color: #409EFF;
      cursor: pointer;
    }
  }
}

.ev-calendar-time-td {
  &:hover {
    color: #409EFF;
    cursor: pointer;
  }
  &.selected {
    display: flex;
    height: 100%;
    justify-content: center;
    align-items: center;
  }
  &.selected div {
    width: 24px;
    height: 24px;
    line-height: 24px;
    border-radius: 50%;
    color: #FFFFFF;
    background-color: #409EFF;
    text-align: center;
  }
}

.ev-calendar-time-side {
  width: 50px;
  text-align: center;
  background-color: #E5E5E5;

  & div:not(:last-child) {
    border-bottom: 1px solid #EBEEF5;
  }
}
.ev-calendar-time-center {
  width: 200px;
  height: 100%;
  text-align: center;

  & table:not(:last-child) {
    border-bottom: 1px solid #EBEEF5;
  }
}
.ev-calendar-time-table {
  width: 200px;
  height: 110px;
  table-layout: fixed;
  border-collapse: collapse;
  border-spacing: 0;
  user-select: none;

  & tr {
    height: 55px;
  }
}
</style>
