<template>
  <div
    ref="datePicker"
    v-clickoutside="clickOutsideDropbox"
    class="ev-date-picker"
    :class="{
      disabled : $props.disabled,
    }"
  >
    <div
      ref="datePickerWrapper"
      class="ev-date-picker__wrapper"
    >
      <template v-if="$props.mode === 'date' || $props.mode === 'dateTime'">
        <span class="ev-date-picker-prefix-icon">
          <i class="ev-icon-calendar" />
        </span>
        <input
          v-model.trim="currentValue"
          type="text"
          class="ev-input"
          :placeholder="$props.placeholder"
          :disabled="$props.disabled"
          @click="clickSelectInput"
          @keydown.enter.prevent="validateValue(currentValue)"
          @change="validateValue(currentValue)"
        />
      </template>
      <template v-else>
        <div
          class="ev-date-picker-tag-wrapper"
          @click="clickSelectInput"
        >
          <span class="ev-date-picker-prefix-icon">
            <i class="ev-icon-calendar" />
          </span>
          <input
            type="text"
            class="ev-input readonly"
            readonly
            :placeholder="$props.placeholder"
            :disabled="$props.disabled"
          />
          <template
            v-if="$props.mode === 'dateMulti'
            && ($props.options.multiType === 'date' || !$props.options.tagShorten)"
          >
            <div
              v-for="(item, idx) in mv"
              :key="`${item}_${idx}`"
              class="ev-select-tag"
              :class="{ num: $props.options.multiType !== 'date' }"
            >
              <span class="ev-tag-name"> {{ item }} </span>
              <span
                v-if="$props.options.multiType === 'date'"
                class="ev-tag-suffix"
                @click.stop="[removeMv(item), changeDropboxPosition()]"
              >
              <i class="ev-tag-suffix-close ev-icon-error" />
            </span>
            </div>
          </template>
          <template v-else>
            <div
              v-if="mv[0]"
              class="ev-select-tag num"
            >
              <span class="ev-tag-name"> {{ mv[0] }} </span>
            </div>
            <template v-if="mv[mv.length - 1]">
              <div class="ev-select-tag num">
                <span class="ev-tag-name"> ~ </span>
              </div>
              <div class="ev-select-tag num">
                <span class="ev-tag-name"> {{ mv[mv.length - 1] }} </span>
              </div>
            </template>
          </template>
        </div>
      </template>
      <template v-if="$props.clearable">
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
          :class="$props.mode"
          :style="dropboxPosition"
        >
          <div
            v-if="usedShortcuts.length"
            class="ev-date-picker-dropbox__button-layout"
          >
            <ev-button
                v-if="usedShortcuts.length === 1"
                :type="usedShortcuts[0].isActive ? 'primary' : 'default'"
                @click="clickShortcut(usedShortcuts[0].key)"
            >
              {{ usedShortcuts[0].label }}
            </ev-button>
            <ev-button-group v-else>
              <ev-button
                v-for="button in usedShortcuts"
                :key="button.key"
                :type="button.isActive ? 'primary' : 'default'"
                @click="clickShortcut(button.key)"
              >
                {{ button.label }}
              </ev-button>
            </ev-button-group>
          </div>
          <div
            v-if="usedShortcuts.length"
            class="ev-date-picker-dropbox__divider"
          />
          <div
            :class="{ 'ev-date-picker-dropbox__calendar':usedShortcuts.length }"
          >
            <ev-calendar
              key="fromCalendar"
              v-model="mv"
              :mode="$props.mode"
              :month-notation="$props.monthNotation"
              :day-of-the-week-notation="$props.dayOfTheWeekNotation"
              :options="$props.options"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { datePickerClickoutside as clickoutside } from '@/directives/clickoutside';
import { useModel, useDropdown, useShortcuts } from './uses';

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
              || (v.length === 10 && dateReg.exec(v)))
              || (v.length === 19 && dateTimeReg.exec(v)));
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
        type: 'date',
        limit: 1,
        tagShorten: false,
      }),
      validator: ({ multiType, multiDayLimit, disabledDate, tagShorten, timeFormat }) => {
        const timeReg = new RegExp(/(HH|2[0-3]|[01][0-9]):(mm|[0-5][0-9]):(ss|[0-5][0-9])/);
        return (multiType ? ['weekday', 'week', 'date'].indexOf(multiType) !== -1 : true)
        && (multiDayLimit ? typeof multiDayLimit === 'number' && multiDayLimit > 0 : true)
        && (disabledDate ? (typeof disabledDate === 'function' || Array.isArray(disabledDate)) : true)
        && (tagShorten !== undefined ? typeof tagShorten === 'boolean' : true)
        && Array.isArray(timeFormat)
            ? timeFormat.every(v => !!(!v || timeReg.exec(v)))
            : !!(!timeFormat || (timeReg.exec(timeFormat)));
      },
    },
    shortcuts: {
      type: Array,
      default: () => [],
      validator: (value) => {
        if (!value.length) {
          return true;
        }
        return value.every(({ shortcutDate }) => {
          if (typeof shortcutDate !== 'function') {
            return false;
          }
          const date = shortcutDate();
          return (Array.isArray(date) && date.every(d => d instanceof Date) && date[0] <= date[1])
              || (typeof date === 'object' && date instanceof Date);
        });
      },
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
      datePickerWrapper,
      dropbox,
      itemWrapper,
      dropboxPosition,
      clickSelectInput,
      clickOutsideDropbox,
      changeDropboxPosition,
    } = useDropdown();

    const {
      usedShortcuts,
      clickShortcut,
      setActiveShortcut,
    } = useShortcuts({
      mv,
      currentValue,
      clickOutsideDropbox,
    });

    setActiveShortcut();

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
      datePickerWrapper,
      dropbox,
      itemWrapper,
      dropboxPosition,
      clickSelectInput,
      clickOutsideDropbox,
      changeDropboxPosition,

      usedShortcuts,
      clickShortcut,
    };
  },
};
</script>

<style lang="scss">
@import '../../style/index.scss';

.ev-date-picker {
  $select-height: $input-default-height;
  display: block;
  position: relative;
  width: 100%;

  @import '../../style/components/input.scss';

  &__wrapper {
    position: relative;
    min-height: $select-height;
  }

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

  @include state('disabled') {
    .ev-input {
      cursor: not-allowed;
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
    cursor: pointer;
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

.ev-date-picker-dropbox {
  &-wrapper {
    height: 0;
    z-index: 100;
  }

  &__button-layout {
    margin: 5px;
  }

  &__divider {
    width: 100%;
    height: 2px;
    margin: 8px 0;
    background-color: #E5E5E5;
  }

  &__calendar {
    height: 100%;
    margin: 5px;
  }
}
</style>
