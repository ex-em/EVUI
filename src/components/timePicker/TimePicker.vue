<template>
  <div class="ev-time-picker">
    <div
      v-if="type==='range'"
      class="ev-time-picker-range"
    >
      <div
        :class="{ 'wrong-type': isWrongTypeStart }"
        class="ev-time-picker-wrapper"
      >
        <input
          v-model="startTime"
          class="ev-input"
          placeholder="start time"
          @focus="focusInputStartTime"
          @blur="blurInputStartTime"
          @input="inputStartTime"
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
        :class="{ 'wrong-type': isWrongTypeEnd }"
        class="ev-time-picker-wrapper"
      >
        <input
          v-model="endTime"
          class="ev-input"
          placeholder="end time"
          @focus="focusInputEndTime"
          @blur="blurInputEndTime"
          @input="inputEndTime"
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
        :class="{ 'wrong-type': isWrongType }"
        class="ev-time-picker-wrapper"
      >
        <input
          v-model="time"
          class="ev-input"
          placeholder="Enter time"
          @focus="focusInputTime"
          @blur="blurInputTime"
          @input="inputTime"
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
import { ref } from 'vue';

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
  },
  emits: {
    'update:modelValue': null,
    focus: null,
    blur: null,
    input: null,
    change: null,
  },
  setup(props, { emit }) {
    let startTime = ref('');
    let endTime = ref('');
    let time = ref('');
    const isWrongType = ref(false);
    const isWrongTypeStart = ref(false);
    const isWrongTypeEnd = ref(false);

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
      // check type first
      isWrongTypeStart.value = !validTimeExp(startTime.value);
      isWrongTypeEnd.value = !validTimeExp(endTime.value);

      // check range
      if (endTime.value < startTime.value) {
        isWrongTypeStart.value = true;
        isWrongTypeEnd.value = true;
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

    const inputStartTime = (e) => {
      emit('input', e, startTime.value);
      emit('update:modelValue', [startTime.value, endTime.value]);
    };

    const changeStartTime = (e) => {
      validRange();
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

    const inputEndTime = (e) => {
      emit('input', e, endTime.value);
      emit('update:modelValue', [startTime.value, endTime.value]);
    };

    const changeEndTime = (e) => {
      validRange();
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

    const inputTime = (e) => {
      emit('input', e, time.value);
      emit('update:modelValue', time.value);
    };

    const changeTime = (e) => {
      isWrongType.value = !validTimeExp(time.value);
      emit('change', e, time.value);
    };

    const clearContents = () => {
      time.value = '';
    };

    return {
      startTime,
      endTime,
      time,
      isWrongTypeStart,
      isWrongTypeEnd,
      isWrongType,
      clearContents,
      clearStartTime,
      clearEndTime,
      focusInputTime,
      blurInputTime,
      inputTime,
      changeTime,
      focusInputStartTime,
      blurInputStartTime,
      inputStartTime,
      changeStartTime,
      focusInputEndTime,
      blurInputEndTime,
      inputEndTime,
      changeEndTime,
    };
  },
};
</script>

<style lang="scss" scoped>
@import '../../style/index.scss';

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
      width: 100%;
      height: 100%;
      padding: 0 30px;

      @include evThemify() {
        border: 1px solid evThemed('border-base');
      }

      &:hover, &:focus {
        @include evThemify() {
          border: 1px solid evThemed('primary');
        }
      }

      &:focus {
        outline: none;
      }
    }
  }

  .wrong-type {
    @include evThemify() {
      border: 2px solid evThemed('error');
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
