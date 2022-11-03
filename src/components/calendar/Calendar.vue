<template>
  <div class="ev-calendar-wrapper">
    <div class="ev-calendar-date-area">
      <div class="ev-calendar-header">
        <div
          class="move-month-arrow"
          @click="clickPrevNextBtn('main', 'prev')">
          <i class="ev-icon-s-arrow-left move-month-arrow-icon" />
        </div>
        <span class="ev-calendar-year">{{ mainCalendarPageInfo.year }}</span>
        <span class="ev-calendar-month">{{ mainCalendarMonth }}</span>
        <div
          :class="[
            'move-month-arrow',
            { disabled: isContinuousMonths }
          ]"
          @click="clickPrevNextBtn('main', 'next')">
          <i class="ev-icon-s-arrow-right move-month-arrow-icon"
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
      v-if="['dateTime', 'dateTimeRange'].includes(mode)"
      class="ev-calendar-time-area"
    >
      <div class="ev-calendar-time-side">
        <div
          v-for="hmsType in ['HOUR', 'MIN', 'SEC']"
          :key="`${hmsType}_label`"
          class="ev-calendar-time-side--label"
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
              @wheel.prevent="wheelTime('main', timeType, $event)"
            >
              <tr
                v-for="i in 3"
                :key="`${timeType}_${i}_tr`"
              >
                <td
                  v-for="j in 4"
                  :key="`${timeType}_${i}_${j}_td`"
                  class="ev-calendar-time-td"
                  :class="{
                    selected: getTimeInfo(timeType, i, j, 'main').isSelected,
                    disabled: preventTimeEventType.main[timeType]
                      || getTimeInfo(timeType, i, j, 'main').isDisabled,
                  }"
                  @click="clickTime('main', timeType, i, j)"
                >
                  <div> {{ getTimeInfo(timeType, i, j, 'main').num }} </div>
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
            :class="[
              'ev-calendar-time-side--btn',
              `arrow-${hmsType}`,
              { disabled: preventTimeEventType.main[hmsType] }
            ]"
            @click="clickHmsBtn('main', hmsType, arrowType)"
          >
            <i
              :class="`ev-icon-arrow-${arrowType}`"
            />
          </div>
        </template>
      </div>
    </div>

    <div
        v-if="['dateRange', 'dateTimeRange'].includes(mode)"
        class="ev-calendar-date-area"
    >
      <div class="ev-calendar-header">
        <div
            :class="[
              'move-month-arrow',
              { disabled: isContinuousMonths }
            ]"
            @click="clickPrevNextBtn('expanded', 'prev')"
        >
          <i class="ev-icon-s-arrow-left move-month-arrow-icon"/>
        </div>
        <span class="ev-calendar-year">{{ expandedCalendarPageInfo.year }}</span>
        <span class="ev-calendar-month">{{ expandedCalendarMonth }}</span>
        <div
          class="move-month-arrow"
          @click="clickPrevNextBtn('expanded', 'next')"
        >
          <i class="ev-icon-s-arrow-right move-month-arrow-icon" />
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
        v-if="mode === 'dateTimeRange'"
        class="ev-calendar-time-area"
    >
      <div class="ev-calendar-time-side">
        <div
            v-for="hmsType in ['HOUR', 'MIN', 'SEC']"
            :key="`${hmsType}_TITLE`"
            class="ev-calendar-time-side--label"
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
                @wheel.prevent="wheelTime('expanded', timeType, $event)"
            >
            <tr
                v-for="i in 3"
                :key="`${timeType}_${i}_tr`"
            >
              <td
                  v-for="j in 4"
                  :key="`${timeType}_${i}_${j}_td`"
                  class="ev-calendar-time-td"
                  :class="{
                    selected: getTimeInfo(timeType, i, j, 'expanded').isSelected,
                    disabled: preventTimeEventType.expanded[timeType]
                    || getTimeInfo(timeType, i, j, 'expanded').isDisabled,
                  }"
                  @click="clickTime('expanded', timeType, i, j)"
              >
                <div> {{ getTimeInfo(timeType, i, j, 'expanded').num }} </div>
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
              :class="[
                'ev-calendar-time-side--btn',
                `arrow-${hmsType}`,
                { disabled: preventTimeEventType.expanded[hmsType] }
               ]"
              @click="clickHmsBtn('expanded', hmsType, arrowType)"
          >
            <i
              :class="`ev-icon-arrow-${arrowType}`"
            />
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
        const dateReg = new RegExp(/[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])/);
        const dateTimeReg = new RegExp(/[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) (2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9]/);
        if (Array.isArray(value)) {
          return value.every(v => !!(!v
            || (v.length === 10 && dateReg.exec(v)))
            || (v.length === 19 && dateTimeReg.exec(v)));
        }
        return !!(!value
          || (value.length === 10 && dateReg.exec(value))
          || (value.length === 19 && dateTimeReg.exec(value)));
      },
    },
    mode: {
      type: String,
      default: 'date',
      validator: value => ['date', 'dateTime', 'dateMulti', 'dateRange', 'dateTimeRange']
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
      validator: ({ multiType, multiDayLimit, disabledDate, timeFormat }) => {
        const timeReg = new RegExp(/(HH|2[0-3]|[01][0-9]):(mm|[0-5][0-9]):(ss|[0-5][0-9])/);
        return (multiType ? ['weekday', 'week', 'date'].indexOf(multiType) !== -1 : true)
        && (multiDayLimit ? typeof multiDayLimit === 'number' && multiDayLimit > 0 : true)
        && (disabledDate ? (typeof disabledDate === 'function' || Array.isArray(disabledDate)) : true)
        && Array.isArray(timeFormat)
            ? timeFormat.every(v => !!(!v || timeReg.exec(v)))
            : !!(!timeFormat || (timeReg.exec(timeFormat)));
      },
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
      isContinuousMonths,
    } = useModel();

    const {
      mainCalendarTableInfo,
      expandedCalendarTableInfo,
      mainTimeTableInfo,
      expandedTimeTableInfo,
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
      preventTimeEventType,
    } = useEvent({
      selectedValue,
      mainCalendarPageInfo,
      expandedCalendarPageInfo,
      mainTimeTableInfo,
      expandedTimeTableInfo,
      setCalendarDate,
      setHmsTime,
    });

    setCalendarDate('main');
    if (['dateRange', 'dateTimeRange'].includes(props.mode)) {
      setCalendarDate('expanded');
    }

    if (['dateTime', 'dateTimeRange'].includes(props.mode)) {
      setHmsTime();
    }

    return {
      selectedValue,
      mainCalendarPageInfo,
      expandedCalendarPageInfo,
      mainCalendarMonth,
      expandedCalendarMonth,
      dayOfTheWeekList,
      isContinuousMonths,

      mainCalendarTableInfo,
      expandedCalendarTableInfo,
      mainTimeTableInfo,
      expandedTimeTableInfo,
      getTimeInfo,

      clickPrevNextBtn,
      clickDate,
      clickHmsBtn,
      clickTime,
      wheelMonth,
      wheelTime,
      calendarEventName,
      onMousemoveDate,
      preventTimeEventType,
    };
  },
};
</script>

<style lang="scss">
$arrow-hover-bg-color: #ADB5BD;
$item-hover-bg-color: #C7DBE6;
$animate-ease-in: 0.3s ease-in;

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
  height: 43px;
  padding: 12px 15px 10px;

  .move-month-arrow {
    height: 24px;
    flex: 1;
    text-align: center;
    cursor: pointer;
    line-height: 24px;
    border-radius: 5px;

    &-icon {
      color: #606266;
      text-align: center;
    }

    &:not(.disabled):hover {
      i {
        color: #409EFF;
      }
    }

    &.disabled {
      cursor: not-allowed;

      i {
        color: #C0C4CC;
      }
    }
  }

  span {
    flex: 3;
    text-align: center;
    line-height: 24px;
  }
}

.ev-calendar-body {
  padding: 8px 8px;
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

  &:not(.selected):not(.disabled):hover {
    cursor: pointer;
    color: #409EFF;
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
    width: 195px;
    flex-direction: row;
    border-left: 1px solid #EBEEF5;
    color: #606266;
    box-sizing: content-box;
  }
}

.ev-calendar-time-td {
  & div {
    width: 24px;
    height: 24px;
    margin: 0 auto;
    line-height: 24px;
    border-radius: 50%;
    text-align: center;
  }
  &:not(.selected) {
    &:hover {
      cursor: pointer;
      div {
        color: #409EFF;
      }
    }
  }
  &.selected div {
    color: #FFFFFF;
    background-color: #409EFF;
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
}

.ev-calendar-time-side {
  font-size: 10px;
  text-align: center;
  background-color: #E5E5E5;

  &:first-child {
    width: 35px;
  }

  &:last-child {
    width: 30px;
  }

  &--label {
    height: 110px;
    line-height: 110px;
  }

  &--btn {
    height: 55px;
    line-height: 55px;

    &.disabled {
      color: #C0C4CC;
      cursor: not-allowed;

      &:hover {
        color: #C0C4CC;
      }
    }

    &:not(.disabled):hover {
      color: #409EFF;
      cursor: pointer;
    }
  }

  & div:not(:last-child) {
    border-bottom: 1px solid #EBEEF5;
  }
}
.ev-calendar-time-center {
  width: 132px;
  height: 100%;
  text-align: center;
  font-size: 12px;

  & table:not(:last-child) {
    border-bottom: 1px solid #EBEEF5;
  }
}
.ev-calendar-time-table {
  width: 132px;
  height: 110px;
  table-layout: fixed;
  border-collapse: collapse;
  border-spacing: 0;
  user-select: none;

  tr {
    height: 33px;
  }
}
</style>
