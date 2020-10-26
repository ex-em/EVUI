<template>
  <div
    class="ev-input-number"
    :class="{
      disabled,
      readonly,
    }"
  >
    <span
      v-for="type in ['up', 'down']"
      :key="`step-arrow-${type}`"
      :class="['ev-input-number-icon', `step-${type}`]"
      @click="stepValue(type)"
    >
      <i :class="`ev-icon-s-arrow-${type}`" />
    </span>
    <input
      v-model.trim="currentValue"
      class="ev-input"
      type="text"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      @focus="focusInput"
      @blur="blurInput"
      @change="changeMv"
      @keydown.up.prevent="stepValue('up')"
      @keydown.down.prevent="stepValue('down')"
      @keydown.enter.prevent="validateValue(currentValue)"
    />
  </div>
</template>

<script>
import { useModel, useStep, useInit } from './uses';

export default {
  name: 'EvInputNumber',
  props: {
    modelValue: {
      type: [String, Number],
      default: null,
    },
    placeholder: {
      type: String,
      default: '',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    max: {
      type: Number,
      default: Infinity,
    },
    min: {
      type: Number,
      default: -Infinity,
    },
    step: {
      type: Number,
      default: 1,
      validator(val) {
        return val > 0;
      },
    },
    stepStrictly: {
      type: Boolean,
      default: false,
    },
    precision: {
      type: Number,
      default: 0,
      validator(val) {
        return val >= 0 && val <= 100 && val === parseInt(val, 10);
      },
    },
  },
  emits: [
    'update:modelValue',
    'focus',
    'blur',
    'input',
    'change',
  ],
  setup() {
    const {
      currentValue,
      validateValue,
      focusInput,
      blurInput,
      changeMv,
    } = useModel();

    const {
      stepValue,
    } = useStep({
      currentValue,
      validateValue,
    });

    useInit({
      currentValue,
      validateValue,
    });

    return {
      currentValue,
      stepValue,
      validateValue,
      focusInput,
      blurInput,
      changeMv,
    };
  },
};
</script>

<style lang="scss">
@import '../../style/index.scss';

.ev-input-number {
  position: relative;
  box-sizing: border-box;

  @include clearfix();

  @import '../../style/components/input.scss';
  &:hover {
    .ev-input,
    .ev-textarea {
      @include evThemify() {
        border: 1px solid evThemed('primary');
      }
    }
  }
  .ev-input {
    $number-arrow-btn-width: 30px;
    padding: 0 #{$number-arrow-btn-width + $input-default-padding} 0 $input-default-padding;
    text-align: center;
  }
  .ev-input-number-icon {
    display: flex;
    position: absolute;
    right: 0;
    width: 30px;
    height: $input-default-height / 2;
    justify-content: center;
    align-items: center;
    font-size: 12px;
    cursor: pointer;

    @include evThemify() {
      border-left: 1px solid evThemed('border-base');
      background-color: evThemed('background-lighten');
    }
    &.step-up {
      top: 0;
      border-radius: 0 $default-radius 0 0;

      @include evThemify() {
        border-bottom: 1px solid evThemed('border-base');
      }
    }
    &.step-down {
      bottom: 0;
      border-radius: 0 0 $default-radius 0;
    }
    &:hover {
      @include evThemify() {
        color: evThemed('primary');
      }
    }
  }
}

@include state('disabled') {
  .ev-input-number-icon {
    @include evThemify() {
      color: evThemed('disabled');
      border-left: 1px solid evThemed('disabled');
    }
    &.step-up {
      @include evThemify() {
        border-bottom: 1px solid evThemed('disabled');
      }
    }
    &:hover {
      @include evThemify() {
        color: evThemed('disabled');
      }
    }
  }
}
@include state('readonly') {
  .ev-input-number-icon {
    cursor: not-allowed;
    &:hover {
      @include evThemify() {
        color: inherit;
      }
    }
  }
}
</style>
