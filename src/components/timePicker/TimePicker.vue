<template>
  <div class="ev-time-picker">
    <div
      v-if="type==='range'"
      class="ev-time-picker-range"
    >
      <div
        :class="{
          error: isWrongType.rangeStart,
          clearable,
          disabled,
          readonly,
        }"
        class="ev-time-picker-wrapper"
      >
        <input
          v-model="startTime"
          class="ev-input"
          :disabled="disabled"
          :readonly="readonly"
          placeholder="start time"
          @focus="focusInputStartTime"
          @blur="blurInputStartTime"
          @change="changeStartTime"
        />
        <ev-icon
          icon="ev-icon-time"
          class="ev-input-prefix"
        />
        <ev-icon
          v-if="clearable"
          icon="ev-icon-error"
          class="ev-input-suffix"
          @click="clearStartTime"
        />
      </div>
      <p class="tilde">~</p>
      <div
        :class="{
          error: isWrongType.rangeEnd,
          clearable,
          disabled,
          readonly,
        }"
        class="ev-time-picker-wrapper"
      >
        <input
          v-model="endTime"
          class="ev-input"
          :disabled="disabled"
          :readonly="readonly"
          placeholder="end time"
          @focus="focusInputEndTime"
          @blur="blurInputEndTime"
          @change="changeEndTime"
        />
        <ev-icon
          icon="ev-icon-time"
          class="ev-input-prefix"
        />
        <ev-icon
          v-if="clearable"
          icon="ev-icon-error"
          class="ev-input-suffix"
          @click="clearEndTime"
        />
      </div>
    </div>
    <div
      v-else
      class="ev-time-picker-single"
    >
      <div
        :class="{
          error: isWrongType.single,
          clearable,
          disabled,
          readonly,
        }"
        class="ev-time-picker-wrapper"
      >
        <input
          v-model="time"
          class="ev-input"
          :disabled="disabled"
          :readonly="readonly"
          placeholder="Enter time"
          @focus="focusInputTime"
          @blur="blurInputTime"
          @change="changeTime"
        />
        <ev-icon
          icon="ev-icon-time"
          class="ev-input-prefix"
        />
        <ev-icon
          v-if="clearable"
          icon="ev-icon-error"
          class="ev-input-suffix"
          @click="clearContents"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue';

export default {
  name: 'EvTimePicker',
  props: {
    modelValue: {
      type: [Array, String],
      default: '',
      validator: (time) => {
        const timeRegexExp = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
        if (Array.isArray(time) && !timeRegexExp.test(time[0]) && timeRegexExp.test(time[1])) {
          // range mode
          console.warn('Please check the time format in the Timepicker.');
          return false;
        }
        if (!Array.isArray(time) && !timeRegexExp.test(time)) {
          // single mode
          console.warn('Please check the time format in the Timepicker.');
          return false;
        }
        return true;
      },
    },
    type: {
      type: String,
      default: 'range',
    },
    clearable: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
  },
  emits: {
    'update:modelValue': null,
    focus: null,
    blur: null,
    change: null,
  },
  setup(props, { emit }) {
    let startTime = ref('00:00');
    let endTime = ref('23:59');
    let time = ref('00:00');
    const isWrongType = reactive({
      single: false,
      rangeStart: false,
      rangeEnd: false,
    });

    if (props.type === 'range') {
      if (Array.isArray(props.modelValue)) {
        startTime = ref(props.modelValue[0] > props.modelValue[1] ? '00:00' : props.modelValue[0]);
        endTime = ref(startTime.value > props.modelValue[1] ? '23:59' : props.modelValue[1]);
      }
      emit('update:modelValue', [startTime.value, endTime.value]);
    } else {
      time = ref(props.modelValue || '00:00');
      emit('update:modelValue', time.value);
    }

    const previousValue = reactive({
      singleTime: time.value,
      rangeStartTime: startTime.value,
      rangeEndTime: endTime.value,
    });

    const validTimeExp = (timeExp) => {
      const timeRegexExp = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
      return timeRegexExp.test(timeExp);
    };

    const setValidStartTime = () => {
      if (!validTimeExp(startTime.value)) {
        startTime.value = previousValue.rangeStartTime;
      }
      if (endTime.value && (startTime.value > endTime.value)) {
        startTime.value = endTime.value;
      }
      previousValue.rangeStartTime = startTime.value;
    };

    const setValidEndTime = () => {
      if (!validTimeExp(endTime.value)) {
        endTime.value = previousValue.rangeEndTime;
      }
      if (startTime.value && (startTime.value > endTime.value)) {
        endTime.value = previousValue.rangeEndTime;
        if (startTime.value > previousValue.rangeEndTime) {
          endTime.value = startTime.value;
        }
      }
      previousValue.rangeEndTime = endTime.value;
    };

    // startTime event for range type
    const focusInputStartTime = (e) => {
      emit('focus', e);
    };

    const blurInputStartTime = (e) => {
      emit('blur', e);
    };

    const changeStartTime = (e) => {
      setValidStartTime();
      isWrongType.rangeStart = false;
      emit('update:modelValue', [startTime.value, endTime.value]);
      emit('change', e, [startTime.value, endTime.value]);
    };

    const clearStartTime = () => {
      startTime.value = '';
      isWrongType.rangeStart = true;
      emit('update:modelValue', [startTime.value, endTime.value]);
    };

    // endTime event for range type
    const focusInputEndTime = (e) => {
      emit('focus', e);
    };

    const blurInputEndTime = (e) => {
      emit('blur', e);
    };

    const changeEndTime = (e) => {
      setValidEndTime();
      isWrongType.rangeEnd = false;
      emit('update:modelValue', [startTime.value, endTime.value]);
      emit('change', e, [startTime.value, endTime.value]);
    };

    const clearEndTime = () => {
      endTime.value = '';
      isWrongType.rangeEnd = true;
      emit('update:modelValue', [startTime.value, endTime.value]);
    };

    // event for single type
    const focusInputTime = (e) => {
      emit('focus', e);
    };

    const blurInputTime = (e) => {
      emit('blur', e);
    };

    const changeTime = (e) => {
      if (!validTimeExp(time.value)) {
        time.value = previousValue.singleTime;
      } else {
        previousValue.singleTime = time.value;
      }

      isWrongType.single = !validTimeExp(time.value);

      emit('update:modelValue', time.value);
      emit('change', e, time.value);
    };

    const clearContents = () => {
      time.value = '';
      isWrongType.single = true;
      emit('update:modelValue', time.value);
    };

    return {
      startTime,
      endTime,
      time,
      isWrongType,
      previousValue,
      clearContents,
      clearStartTime,
      clearEndTime,
      focusInputTime,
      blurInputTime,
      changeTime,
      focusInputStartTime,
      blurInputStartTime,
      changeStartTime,
      focusInputEndTime,
      blurInputEndTime,
      changeEndTime,
    };
  },
};
</script>

<style lang="scss">
@import '../../style/index.scss';
@import '../../style/components/input.scss';

.ev-time-picker {
  width: 100%;
  height: 35px;

  .ev-time-picker-range {
    display: flex;
    height: 100%;
    align-items: center;

    .tilde {
      padding: 0 10px;
    }
  }

  .ev-time-picker-single {
    height: 100%;
  }

  .ev-time-picker-wrapper {
    position: relative;
    width: 150px;
    height: 100%;

    .ev-input {
      padding: 0 30px;
    }
  }

  .ev-input-prefix {
    position: absolute;
    left: 0;
    padding: 10px;
  }

  .ev-input-suffix {
    position: absolute;
    right: 0;
    padding: 10px;

    &:hover {
      cursor: pointer;
    }
  }
}
</style>
