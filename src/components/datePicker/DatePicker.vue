<template>
  <div
    ref="datePicker"
    v-clickoutside="clickOutsideDropbox"
    class="ev-date-picker"
    :class="{
      disabled,
    }"
    @click="clickSelectInput"
  >
    <template v-if="mode === 'date' || mode === 'dateTime'">
      <input
        v-model="mv"
        type="text"
        class="ev-input"
        :placeholder="placeholder"
        :disabled="disabled"
      />
    </template>
    <template v-else>
      <input
        type="text"
        class="ev-input"
        readonly
        :placeholder="placeholder"
        :disabled="disabled"
      />
      <template
        v-if="mode === 'dateMulti'
          && (options.multiType === 'date' || !options.tagShorten)"
      >
        <div class="ev-select-tag-wrapper">
          <div
            v-for="(item, idx) in mv"
            :key="`${item}_${idx}`"
            class="ev-select-tag"
            :class="{ num: options.multiType !== 'date' }"
          >
            <span class="ev-tag-name"> {{ item }} </span>
            <span
              v-if="options.multiType === 'date'"
              class="ev-tag-suffix"
              @click.stop="removeMv(item)"
            >
              <i class="ev-tag-suffix-close ev-icon-error" />
            </span>
          </div>
        </div>
      </template>
      <template v-else>
        <div
          v-show="mv[0] && mv[mv.length - 1]"
          class="ev-select-tag-wrapper"
        >
          <div class="ev-select-tag num">
            <span class="ev-tag-name"> {{ mv[0] }} </span>
          </div>
          <div class="ev-select-tag num">
            <span class="ev-tag-name"> ~ </span>
          </div>
          <div class="ev-select-tag num">
            <span class="ev-tag-name"> {{ mv[mv.length - 1] }} </span>
          </div>
        </div>
      </template>
    </template>
    <span class="ev-date-picker-prefix-icon">
      <i class="ev-icon-calendar" />
    </span>
    <template v-if="clearable">
      <span
        v-show="isClearableIcon"
        class="ev-input-suffix"
        @click.stop="removeAllMv"
      >
        <i class="ev-icon-error" />
      </span>
    </template>
  </div>

  <teleport to="#ev-date-picker-dropdown-modal">
    <div
      v-if="isDropbox"
      class="ev-date-picker-dropdown"
      :class="mode"
      :style="dropdownStyle"
    >
      <ev-calendar
        key="fromCalendar"
        v-model="mv"
        :mode="mode"
        :month-notation="monthNotation"
        :day-of-the-week-notation="dayOfTheWeekNotation"
        :options="options"
      />
    </div>
  </teleport>
</template>

<script>
import { datePickerClickoutside as clickoutside } from '@/directives/clickoutside';
import { useModel, useDropdown, usePosition } from './uses';

export default {
  name: 'EvDatePicker',
  directives: {
    clickoutside,
  },
  props: {
    modelValue: {
      type: [String, Array],
      default: '',
      validator: (value) => {
        const dateReg = new RegExp(/[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])/);
        const dateTimeReg = new RegExp(/[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) (2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9]/);
        if (Array.isArray(value)) {
          return value.every(v => !!(!v
            || (v.length === 10 && dateReg.exec(v))));
        }
        return !!(!value
          || (value.length === 10 && dateReg.exec(value))
          || (value.length === 19 && dateTimeReg.exec(value)));
      },
    },
    placeholder: {
      type: String,
      default: '',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    clearable: {
      type: Boolean,
      default: false,
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
        type: 'date',
        limit: 1,
        tagShorten: false,
      }),
      validator: ({ multiType, multiDayLimit, disabledDate, tagShorten }) =>
        (multiType ? ['weekday', 'week', 'date'].indexOf(multiType) !== -1 : true)
        && (multiDayLimit ? typeof multiDayLimit === 'number' && multiDayLimit > 0 : true)
        && (disabledDate ? typeof disabledDate === 'function' : true)
        && (tagShorten !== undefined ? typeof tagShorten === 'boolean' : true),
    },
  },
  emits: {
    'update:modelValue': [Array, String],
  },
  setup() {
    const {
      isDropbox,
      clickSelectInput,
      clickOutsideDropbox,
    } = useDropdown();

    const {
      mv,
      isClearableIcon,
      removeAllMv,
      changeMv,
      removeMv,
    } = useModel({ isDropbox });

    const {
      datePicker,
      itemWrapper,
      dropdownStyle,
      createDropdownEl,
      observeDropbox,
    } = usePosition({ isDropbox });

    createDropdownEl();
    observeDropbox();

    return {
      mv,
      isClearableIcon,
      removeAllMv,
      changeMv,
      removeMv,

      isDropbox,
      clickSelectInput,
      clickOutsideDropbox,

      datePicker,
      itemWrapper,
      dropdownStyle,
      createDropdownEl,
      observeDropbox,
    };
  },
};
</script>

<style lang="scss">
@import '../../style/index.scss';

.ev-date-picker {
  $select-height: 35px;
  display: block;
  position: relative;
  width: 100%;
  min-height: $select-height;

  &.disabled {
    background-color: #F5F7FA;
    border-color: #E4E7ED;
    color: #C0C4CC;
  }

  @import '../../style/components/input.scss';
  .ev-input {
    $calendar-icon-width: 30px;
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    padding: 0 $input-default-padding 0 $calendar-icon-width;

    &.no-tag-input {
      position: relative;
      width: 100px;
      padding: 0 10px;
      border: 0;
      text-align: center;
    }
  }

  .ev-input-suffix {
    display: flex;
    position: absolute;
    top: 0;
    right: 5px;
    height: 100%;
    align-items: center;
    cursor: pointer;

    &:hover {
      color: #409EFF;
    }
  }

  .ev-select-tag-wrapper {
    $select-height: 35px;
    display: flex;
    width: 100%;
    height: 100%;
    min-height: $select-height;
    padding: 3px 30px 3px 30px;
    flex-wrap: wrap;
    align-items: center;
  }
}

.ev-date-picker-prefix-icon {
  display: flex;
  position: absolute;
  top: 0;
  left: 8px;
  height: 100%;
  align-items: center;
  color: #C2C5CD;
}

.ev-date-picker-dropdown {
  position: absolute;
  top: 0;
  left: 0;
  background-color: white;
  border: 1px solid #E4E7ED;
  color: #606266;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
  border-radius: 4px;
  box-sizing: content-box;
  z-index: 100;
}

.ev-select-tag {
  display: flex;
  position: relative;
  height: 24px;
  padding: 0 19px 0 8px;
  margin: 2px 0 2px 6px;
  background-color: #F4F4F5;
  align-items: center;
  border: 1px solid #E9E9EB;
  border-radius: 4px;
  color: #909399;
  font-size: $font-size-base;
  cursor: auto;

  &.num {
    padding-right: 8px;
  }

  .ev-tag-suffix {
    display: flex;
    position: absolute;
    top: 0;
    right: 3px;
    height: 100%;
    align-items: center;
    color: #0D0D0D;
    cursor: pointer;

    &:hover {
      color: #409EFF;
    }
  }
}
</style>
