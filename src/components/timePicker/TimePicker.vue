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
    'update:modelValue': (time) => {
      const timeRegexExp = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;

      if (Array.isArray(time)) {
        // range mode
        const startTime = time[0];
        const endTime = time[1];
        return timeRegexExp.test(startTime) && timeRegexExp.test(endTime);
      }
      // single mode
      return timeRegexExp.test(time);
    },
    focus: null,
    blur: null,
    change: null,
  },
  setup(props, { emit }) {
    let startTime = ref('');
    let endTime = ref('');
    let time = ref('');
    const previousValue = reactive({
      singleTime: props.modelValue,
      rangeStartTime: props.modelValue[0] || '',
      rangeEndTime: props.modelValue[1] || '',
    });
    const isWrongType = reactive({
      single: false,
      rangeStart: false,
      rangeEnd: false,
    });

    if (props.type === 'range') {
      if (Array.isArray(props.modelValue)) {
        startTime = ref(props.modelValue[0] || '');
        endTime = ref(props.modelValue[1] || '');
      }
    } else {
      time = ref(props.modelValue);
    }

    const validTimeExp = (timeExp) => {
      const timeRegexExp = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
      return timeRegexExp.test(timeExp);
    };

    const validRange = () => {
      if (!validTimeExp(startTime.value)) {
        startTime.value = previousValue.rangeStartTime;
      } else {
        previousValue.rangeStartTime = startTime.value;
      }

      if (!validTimeExp(endTime.value)) {
        endTime.value = previousValue.rangeEndTime;
      } else {
        previousValue.rangeEndTime = endTime.value;
      }

      isWrongType.rangeStart = !validTimeExp(startTime.value);
      isWrongType.rangeEnd = !validTimeExp(endTime.value);

      // check range
      if (endTime.value < startTime.value) {
        isWrongType.rangeStart = true;
        isWrongType.rangeEnd = true;
        console.log('The end time should be greater than the start time.');
      }
    };

    // startTime event for range type
    const focusInputStartTime = (e) => {
      emit('focus', e);
    };

    const blurInputStartTime = (e) => {
      emit('blur', e);
    };

    const changeStartTime = (e) => {
      validRange();
      emit('update:modelValue', [startTime.value, endTime.value]);
      emit('change', e, [startTime.value, endTime.value]);
    };

    const clearStartTime = () => {
      startTime.value = '';
    };

    // endTime event for range type
    const focusInputEndTime = (e) => {
      emit('focus', e);
    };

    const blurInputEndTime = (e) => {
      emit('blur', e);
    };

    const changeEndTime = (e) => {
      validRange();
      emit('update:modelValue', [startTime.value, endTime.value]);
      emit('change', e, [startTime.value, endTime.value]);
    };

    const clearEndTime = () => {
      endTime.value = '';
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
