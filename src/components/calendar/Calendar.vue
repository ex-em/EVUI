<template>
  <div class="ev-calendar-wrapper">
    <template
      v-for="calendarType in calendarList"
      :key="calendarType"
    >
      <div class="ev-calendar-date-area">
        <div class="ev-calendar-header">
          <div
            class="move-month-arrow"
            @click="clickPrevNextBtn(calendarType, 'prev')"
          >
            <i class="ev-icon-s-arrow-left move-month-arrow-icon" />
          </div>
          <div class="ev-calendar-year-month-wrapper">
            <span
                v-if="selectedListType[calendarType] === 'year'"
                class="ev-calendar-year-range"
            >
              {{ calendarYearRangeInfo[calendarType].start + ' - '
            + calendarYearRangeInfo[calendarType].end }}
            </span>
            <template v-else>
              <span
                class="ev-calendar-year"
                @click="clickYearMonthBtn(calendarType, 'year')"
              >
                {{ calendarPageInfo[calendarType].year }}
              </span>
                <span
                  v-if="selectedListType[calendarType] === 'date'"
                  class="ev-calendar-month"
                  @click="clickYearMonthBtn(calendarType, 'month')"
                >
                {{ calendarMonth[calendarType] }}
              </span>
            </template>
          </div>
          <div
            class="move-month-arrow"
            @click="clickPrevNextBtn(calendarType, 'next')"
          >
            <i class="ev-icon-s-arrow-right move-month-arrow-icon" />
          </div>
        </div>
        <div class="ev-calendar-body">
          <table
            v-if="selectedListType[calendarType] === 'date'"
            :key="`${calendarType}_calendar_table`"
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
              @wheel.prevent="wheelMonth(calendarType, $event)"
            >
            <tr
              v-for="weekInfo in calendarTableInfo[calendarType]"
              :key="weekInfo"
            >
              <td
                v-for="dateInfo in weekInfo"
                :key="dateInfo"
                :class="[
                  'ev-calendar-date-td',
                  { [dateInfo.monthType]: !!dateInfo.monthType },
                  { today: dateInfo.isToday },
                  { selected: dateInfo.isSelected },
                ]"
                @click="clickDate(calendarType, dateInfo)"
                @[`${calendarEventName}`]="onMousemoveDate(calendarType, $event)"
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
          <table
            v-else
            :class="[
              'ev-calendar-selector-table',
              `ev-calendar-selector-table--${selectedListType[calendarType]}`,
            ]"
          >
            <tbody
              @wheel.prevent="wheelMonth(calendarType, $event)"
            >
              <tr
                v-for="rowInfo in (
                  selectedListType[calendarType] === 'month'
                  ? calendarMonthTableInfo[calendarType]
                  : calendarYearTableInfo[calendarType]
                )"
                :key="rowInfo"
              >
                <td
                  v-for="colInfo in rowInfo"
                  :key="colInfo.value"
                  @click="clickYearMonth(calendarType, colInfo)"
                >
                  <div
                    :class="[
                      'ev-calendar-selector',
                      { selected: colInfo.isSelected },
                      { today: colInfo.today },
                    ]"
                  >
                    {{ colInfo.label }}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <div
            v-if="selectedListType[calendarType] !== 'date'"
            class="ev-calendar-selector-btn-wrapper"
          >
            <ev-button
              @click="clickYearMonthBtn(calendarType, 'date')"
            >
              Done
            </ev-button>
          </div>
        </div>
      </div>

      <div
        v-if="['dateTime', 'dateTimeRange'].includes(mode)"
        class="ev-calendar-time-area"
      >
        <div
          v-if="selectedListType[calendarType] !== 'date'"
          class="ev-calendar-time-area-disabled"
        />
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
                @wheel.prevent="wheelTime(calendarType, timeType, $event)"
              >
                <tr
                  v-for="i in 3"
                  :key="`${timeType}_${i}_tr`"
                >
                  <td
                    v-for="j in 4"
                    :key="`${timeType}_${i}_${j}_td`"
                    :class="[
                      'ev-calendar-time-td',
                      { selected: getTimeInfo(timeType, i, j, calendarType).isSelected },
                      { disabled: preventTimeEventType[calendarType][timeType]
                          || getTimeInfo(timeType, i, j, calendarType).isDisabled }
                    ]"
                    @click="clickTime(calendarType, timeType, i, j)"
                  >
                    <div> {{ getTimeInfo(timeType, i, j, calendarType).num }} </div>
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
                { disabled: preventTimeEventType[calendarType][hmsType] }
              ]"
              @click="clickHmsBtn(calendarType, hmsType, arrowType)"
            >
              <i :class="`ev-icon-arrow-${arrowType}`" />
            </div>
          </template>
        </div>
      </div>
    </template>
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
      calendarList,
      selectedValue,
      calendarPageInfo,
      calendarMonth,
      dayOfTheWeekList,
      calendarYearRangeInfo,
      selectedListType,
    } = useModel();

    const {
      calendarTableInfo,
      calendarMonthTableInfo,
      calendarYearTableInfo,
      calendarTimeTableInfo,
      setCalendarDate,
      setCalendarMonth,
      setCalendarYear,
      setHmsTime,
      getTimeInfo,
    } = useCalendarDate({
      selectedValue,
      calendarPageInfo,
      calendarYearRangeInfo,
    });

    const {
      clickPrevNextBtn,
      clickYearMonthBtn,
      clickDate,
      clickYearMonth,
      clickHmsBtn,
      clickTime,
      wheelMonth,
      wheelTime,
      calendarEventName,
      onMousemoveDate,
      preventTimeEventType,
    } = useEvent({
      selectedValue,
      calendarPageInfo,
      calendarTimeTableInfo,
      selectedListType,
      setCalendarDate,
      setCalendarMonth,
      setCalendarYear,
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
      calendarList,
      selectedValue,
      calendarPageInfo,
      calendarMonth,
      dayOfTheWeekList,
      calendarYearRangeInfo,
      selectedListType,

      calendarTableInfo,
      calendarMonthTableInfo,
      calendarYearTableInfo,
      calendarTimeTableInfo,
      getTimeInfo,

      clickPrevNextBtn,
      clickYearMonthBtn,
      clickDate,
      clickYearMonth,
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
$ev-calendar-selector-btn-height: 40px;
$ev-calendar-selector-btn-margin: 10px;
$calendar-active-color: #409EFF;

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
    width: 20px;
    height: 24px;
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
        color: $calendar-active-color;
      }
    }

    &.disabled {
      cursor: not-allowed;

      i {
        color: #C0C4CC;
      }
    }
  }

  .ev-calendar-year-month-wrapper {
    flex: 3;
    text-align: center;

    span {
      display: inline-block;
      text-align: center;
      line-height: 24px;
    }
  }
}

.ev-calendar-year-range {
  width: auto;
}

.ev-calendar-year,
.ev-calendar-month {
  width: 70px;
  cursor: pointer;

  &:hover {
    color: $calendar-active-color;
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

.ev-calendar-selector-table {
  width: 280px;
  height: calc(270px - #{$ev-calendar-selector-btn-height} - #{$ev-calendar-selector-btn-margin});

  &--year {
    tr {
      height: 40px;
      line-height: 40px;
    }
  }

  &--month {
    tr {
      height: 50px;
      line-height: 50px;
    }
  }
}

.ev-calendar-selector {
  width: 60px;
  height: 30px;
  line-height: 30px;
  margin: 0 auto;
  font-size: 14px;
  color: #7F7F7F;
  text-align: center;
  opacity: 1;
  cursor: pointer;

  &:hover:not(.selected):not(.today) {
    transition: color $animate-base;
    color: $calendar-active-color;
    opacity: 0.7;
  }

  &.today {
    color: $calendar-active-color;
  }

  &.selected {
    border-radius: 5px;
    background-color: $calendar-active-color;
    color: #FFFFFF;
  }
}

.ev-calendar-selector-btn-wrapper {
  height: $ev-calendar-selector-btn-height;
  margin-top: $ev-calendar-selector-btn-margin;

  .ev-button {
    width: 100%;
    height: 35px;
    line-height: 35px;
    border: none;
    background-color: #EBEBEB;
    color: $calendar-active-color;
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
    color: $calendar-active-color;
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
    color: $calendar-active-color;
  }

  &.selected span {
    color: #FFFFFF;
    background-color: $calendar-active-color;
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
    position: relative;
    width: 195px;
    flex-direction: row;
    border-left: 1px solid #EBEEF5;
    color: #606266;
    box-sizing: content-box;

    &-disabled {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: #FFFFFF;
      opacity: 0.6;
    }
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
        color: $calendar-active-color;
      }
    }
  }
  &.selected div {
    color: #FFFFFF;
    background-color: $calendar-active-color;
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

  &--label {
    width: 33px;
    height: 110px;
    line-height: 110px;
  }

  &--btn {
    width: 30px;
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
      color: $calendar-active-color;
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
