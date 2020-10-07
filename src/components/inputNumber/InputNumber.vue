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
      v-model="mv"
      class="ev-input"
      type="text"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      @focus="focusInput"
      @blur="blurInput"
      @input="inputMv"
      @change="changeMv"
      @keydown.up.prevent="stepValue('up')"
      @keydown.down.prevent="stepValue('down')"
      @keydown.enter.prevent="validateValue(mv)"
    />
  </div>
</template>

<script>
  import { ref, computed, onBeforeMount } from 'vue';

  const getPrecision = (num) => {
    if (!num) {
      return 0;
    }
    const decimal = num.toString().split('.')[1];
    return decimal ? decimal.length : 0;
  };

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
      },
      precision: {
        type: Number,
        default: null,
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
    setup(props, { emit }) {
      const mv = computed({
        get: () => props.modelValue,
        set: val => emit('update:modelValue', val),
      });
      const prevValue = ref(mv.value);

      const validateValue = (nextValue) => {
        let result = null;
        if (nextValue || nextValue === 0) {
          if ((props.min && nextValue < props.min)
            || (props.max && nextValue > props.max)
            || isNaN(nextValue)
          ) {
            result = prevValue.value;
          } else {
            result = nextValue;
          }
        }

        if ((result || result === 0) && props.precision) {
          result = Number(result).toFixed(props.precision);
        }

        mv.value = result;
        prevValue.value = result;
      };

      const stepValue = (type) => {
        if (props.readonly || props.disabled) {
          return;
        }
        const newValue = +mv.value;
        const convertedStep = type === 'up' ? props.step : props.step * -1;
        const maxPrecision = Math.max(getPrecision(newValue), getPrecision(props.step));
        const squaredValue = 10 ** maxPrecision;
        const result = (Math.round(newValue * squaredValue)
          + Math.round(convertedStep * squaredValue)) / squaredValue;

        validateValue(result);
      };

      const focusInput = (e) => {
        emit('focus', e);
      };
      const blurInput = (e) => {
        emit('blur', e);
      };
      const inputMv = (e) => {
        emit('input', mv.value, e);
      };
      const changeMv = (e) => {
        validateValue(e.target.value);
        emit('change', mv.value, e);
      };

      const initValue = () => {
        const hasMaxProps = props.max || props.max === 0;
        const hasMinProps = props.min || props.min === 0;

        if (hasMaxProps && hasMinProps) {
          if (props.max <= props.min) {
            console.warn('[EVUI][InputNumber] Max value must be greater than min value.');
          }
        }

        if (props.step && (props.precision || props.precision === 0)) {
          if (getPrecision(props.step) > props.precision) {
            console.warn('[EVUI][InputNumber] It cannot be calculated because the step is smaller than the precision setting.');
          }
        }

        let modelValue = mv.value;
        if (modelValue || modelValue === 0) {
          if (hasMaxProps && modelValue > props.max) {
            modelValue = props.max;
          } else if (hasMinProps && modelValue < props.min) {
            modelValue = props.min;
          }
        }
        validateValue(modelValue);
      };

      onBeforeMount(() => {
        initValue();
      });

      return {
        mv,
        stepValue,
        validateValue,
        focusInput,
        blurInput,
        inputMv,
        changeMv,
      };
    },
  };
</script>

<style lang="scss" scoped>
@import '../../style/index.scss';
@import '../../style/components/input.scss';

.ev-input-number {
  $number-icon-width: 30px;

  position: relative;
  box-sizing: border-box;

  @include clearfix();
  .ev-input {
    padding: 0 #{$number-icon-width + $input-default-padding} 0 $input-default-padding;
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
      border-left: 1px solid evThemed('color-line-base');
      background-color: evThemed('color-background-lighten');
    }
    &.step-up {
      top: 0;
      border-radius: 0 $default-radius 0 0;

      @include evThemify() {
        border-bottom: 1px solid evThemed('color-line-base');
      }
    }
    &.step-down {
      bottom: 0;
      border-radius: 0 0 $default-radius 0;
    }
    &:hover {
      @include evThemify() {
        color: evThemed('color-primary');
      }
    }
  }
}

@include state('disabled') {
  .ev-input-number-icon {
    @include evThemify() {
      color: evThemed('color-disabled');
      border-left: 1px solid evThemed('color-disabled');
    }
    &.step-up {
      @include evThemify() {
        border-bottom: 1px solid evThemed('color-disabled');
      }
    }
    &:hover {
      @include evThemify() {
        color: evThemed('color-disabled');
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