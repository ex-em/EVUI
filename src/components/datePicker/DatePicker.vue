<template>
  <div
    ref="datePicker"
    v-clickoutside="clickOutsideDropbox"
    class="ev-date-picker"
    :class="{
      disabled,
    }"
  >
    <template v-if="mode === 'date' || mode === 'dateTime'">
      <span class="ev-date-picker-prefix-icon">
        <i class="ev-icon-calendar" />
      </span>
      <input
        v-model.trim="currentValue"
        type="text"
        class="ev-input"
        :placeholder="placeholder"
        :disabled="disabled"
        @click="clickSelectInput"
        @keydown.enter.prevent="validateValue(currentValue)"
        @change="validateValue(currentValue)"
      />
    </template>
    <template v-else>
      <div class="ev-date-picker-tag-wrapper">
        <span class="ev-date-picker-prefix-icon">
          <i class="ev-icon-calendar" />
        </span>
        <input
          type="text"
          class="ev-input readonly"
          readonly
          :placeholder="placeholder"
          :disabled="disabled"
          @click="clickSelectInput"
        />
        <template
          v-if="mode === 'dateMulti'
          && (options.multiType === 'date' || !options.tagShorten)"
        >
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
              @click.stop="[removeMv(item), changeDropboxPosition()]"
            >
            <i class="ev-tag-suffix-close ev-icon-error" />
          </span>
          </div>
        </template>
        <template v-else-if="mv[0] && mv[mv.length - 1]">
          <div class="ev-select-tag num">
            <span class="ev-tag-name"> {{ mv[0] }} </span>
          </div>
          <div class="ev-select-tag num">
            <span class="ev-tag-name"> ~ </span>
          </div>
          <div class="ev-select-tag num">
            <span class="ev-tag-name"> {{ mv[mv.length - 1] }} </span>
          </div>
        </template>
      </div>
    </template>
    <template v-if="clearable">
      <span
        v-show="isClearableIcon"
        class="ev-input-suffix"
        @click.stop="[removeAllMv(), clickOutsideDropbox()]"
      >
        <i class="ev-icon-error" />
      </span>
    </template>
    <div class="ev-date-picker-dropbox-wrapper">
      <div
        v-if="isDropbox"
        ref="dropbox"
        class="ev-date-picker-dropdown"
        :class="mode"
        :style="dropboxPosition"
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
    </div>
  </div>
</template>

<script>
import { datePickerClickoutside as clickoutside } from '@/directives/clickoutside';
import { useModel, useDropdown } from './uses';

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
      mv,
      currentValue,
      isClearableIcon,
      validateValue,
      removeAllMv,
      changeMv,
      removeMv,
    } = useModel();

    const {
      isDropbox,
      datePicker,
      dropbox,
      itemWrapper,
      dropboxPosition,
      clickSelectInput,
      clickOutsideDropbox,
      changeDropboxPosition,
    } = useDropdown({
      currentValue,
    });

    return {
      mv,
      currentValue,
      isClearableIcon,
      validateValue,
      removeAllMv,
      changeMv,
      removeMv,

      isDropbox,
      datePicker,
      dropbox,
      itemWrapper,
      dropboxPosition,
      clickSelectInput,
      clickOutsideDropbox,
      changeDropboxPosition,
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
    left: 0;
    height: 100%;
    padding: 0 $input-default-padding 0 $calendar-icon-width;

    &.readonly {
      cursor: pointer;
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

  .ev-date-picker-tag-wrapper {
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

.ev-date-picker-dropbox-wrapper {
  height: 0;
  z-index: 100;
}
</style>
